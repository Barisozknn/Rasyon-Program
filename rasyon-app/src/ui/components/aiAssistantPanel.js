import { state } from '../app.js';
import { t } from '../i18n.js';
import { askGemini } from '../../core/aiService.js';
import { showToast } from '../utils.js';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { newId } from '../../data/uuid.js';
import { getAiChats, saveAiChat, deleteAiChat, rationGetAll, animalProfileGetAll, observationGetAll, getActiveFarm, feedGetAll, herdGroupGetAll, priceHistoryGetAll } from '../../data/db.js';
import { getSettings } from '../../data/settings.js';
import { getSyncState } from '../../data/sync/syncManager.js';

// ─── Sabit Limitler ───────────────────────────────────────────────────────────
const MAX_HISTORY_MESSAGES = 10; // API'ya gönderilecek maksimum önceki mesaj sayısı
const MAX_RATIONS = 5;           // Bağlama dahil edilecek son rasyon sayısı
const MAX_OBSERVATIONS_PER_PROFILE = 3; // Her profil için maksimum son gözlem sayısı

let chats = [];
let activeChatId = null;

// ─── Zengin Bağlam Verisi Oluşturucu ─────────────────────────────────────────

/**
 * IndexedDB'den fihrist verilerini çekerek AI'ın kullanacağı özet (slim) bağlamı oluşturur.
 * Her mesaj gönderiminde çalışır — veriler her zaman güncel kalır.
 */
async function buildContextData() {
  try {
    const [allRations, allProfiles, activeFarm, allHerdGroups] = await Promise.all([
      rationGetAll().catch(() => []),
      animalProfileGetAll().catch(() => []),
      getActiveFarm().catch(() => null),
      herdGroupGetAll().catch(() => []),
    ]);

    const settings = getSettings();

    // Rasyon fihristi (İsim, ID ve Tarih) - Yeniden eskiye sıralı
    const rationList = allRations
      .sort((a, b) => new Date(b.createdAt || b._createdAt || 0) - new Date(a.createdAt || a._createdAt || 0))
      .map(r => {
        const dateVal = r.createdAt || r._createdAt;
        const dateStr = dateVal ? new Date(dateVal).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Bilinmiyor';
        return {
          id: r.id || null,
          name: r.name || 'İsimsiz Rasyon',
          date: dateStr
        };
      });

    // Profil fihristi
    const profileList = allProfiles
      .sort((a, b) => new Date(b.createdAt || b._createdAt || 0) - new Date(a.createdAt || a._createdAt || 0))
      .map(p => {
        const dateVal = p.createdAt || p._createdAt;
        const dateStr = dateVal ? new Date(dateVal).toLocaleDateString('tr-TR') : 'Bilinmiyor';
        return {
          id: p.id || null,
          name: p.name || 'İsimsiz Profil',
          date: dateStr
        };
      });

    // Grup fihristi
    const groupList = allHerdGroups.map(g => ({
      id: g.id || null,
      name: g.name || 'İsimsiz Grup'
    }));

    return {
      farm: {
        name: activeFarm?.name || settings.farm?.name || 'Bilinmiyor'
      },
      summary: `Sistemde ${allRations.length} rasyon, ${allProfiles.length} hayvan profili ve ${allHerdGroups.length} grup bulunmaktadır.`,
      fihrist: {
        rations: rationList,
        profiles: profileList,
        groups: groupList
      }
    };
  } catch (err) {
    console.warn('buildContextData hatası (kısmi bağlam kullanılacak):', err);
    return { error: 'Veriler okunamadı' };
  }
}

// ─── Ana Panel Renderlayıcı ───────────────────────────────────────────────────

export async function renderAiAssistantPanel(container) {
  const syncState = getSyncState();
  const isLoggedIn = syncState && syncState.user;

  if (!isLoggedIn) {
    container.innerHTML = `
      <div class="ai-locked-screen" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center; padding: 2rem;">
        <i class="ti ti-cloud-lock" style="font-size: 5rem; color: var(--text-muted); margin-bottom: 1.5rem;"></i>
        <h2 style="margin-bottom: 1rem; color: var(--text-primary); font-weight: bold;">Bulut Hesabı Gerekli</h2>
        <p style="color: var(--text-secondary); max-width: 400px; margin-bottom: 2rem; line-height: 1.6;">
          Yapay zeka asistanını kullanabilmek için öncelikle bulut hesabınıza giriş yapmalısınız.
        </p>
        <button class="btn btn-primary" onclick="document.querySelector('[data-tab=\\'settings\\']').click()" style="padding: 0.75rem 2rem; font-size: 1.1rem; border-radius: 2rem;">
          <i class="ti ti-login"></i> Giriş Yap
        </button>
      </div>
    `;
    return;
  }

  if (localStorage.getItem('ai_activated') !== 'true') {
    container.innerHTML = `
      <div class="ai-locked-screen" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center; padding: 2rem;">
        <i class="ti ti-lock" style="font-size: 5rem; color: var(--text-muted); margin-bottom: 1.5rem;"></i>
        <h2 style="margin-bottom: 1rem; color: var(--text-primary); font-weight: bold;">${t('ai.locked_title') || 'Yapay Zeka Kilitli'}</h2>
        <p style="color: var(--text-secondary); max-width: 400px; margin-bottom: 2rem; line-height: 1.6;">
          ${t('ai.locked_desc') || 'Yapay zeka asistanını kullanabilmek için Ayarlar sayfasından aktivasyon kodunuzu girmeniz gerekmektedir.'}
        </p>
        <button class="btn btn-primary" onclick="document.querySelector('[data-tab=\\'settings\\']').click()" style="padding: 0.75rem 2rem; font-size: 1.1rem; border-radius: 2rem;">
          <i class="ti ti-settings"></i> ${t('ai.go_to_settings') || 'Ayarlara Git'}
        </button>
      </div>
    `;
    return;
  }

  // Yükleme sırasında geçici ekran
  container.innerHTML = `<div class="p-4 text-center text-muted"><i class="ti ti-loader ti-spin"></i> Yükleniyor...</div>`;

  try {
    chats = await getAiChats();
  } catch (e) {
    console.error("Sohbetler yüklenemedi:", e);
    chats = [];
  }

  if (chats.length === 0) {
    startNewChat();
  } else if (!activeChatId || !chats.find(c => c.id === activeChatId)) {
    activeChatId = chats[0].id;
  }

  container.innerHTML = `
    <style>
      .custom-toggle-switch { position: relative; display: inline-block; width: 44px; height: 24px; flex-shrink: 0; }
      .custom-toggle-switch input[type="checkbox"] { display: none; }
      .custom-toggle-switch-bg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: #e8e8e8; border-radius: 20px; transition: all 0.3s ease-in-out; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1); }
      .custom-toggle-switch-handle { position: absolute; top: 2px; left: 2px; width: 20px; height: 20px; background-color: #fff; border-radius: 50%; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2); transition: transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1); }
      .custom-toggle-switch input[type="checkbox"]:checked ~ .custom-toggle-switch-bg { background-color: #0d6efd; }
      .custom-toggle-switch input[type="checkbox"]:checked ~ .custom-toggle-switch-bg .custom-toggle-switch-handle { transform: translateX(20px); }
      @keyframes mic-pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.2); opacity: 0.7; } 100% { transform: scale(1); opacity: 1; } }
      .mic-recording i { animation: mic-pulse 1.5s infinite; color: #fff; }
    </style>
    <div class="ai-panel">
      <!-- SOL MENÜ: GEÇMİŞ SOHBETLER (Mobilde Bottom Sheet) -->
      <div class="ai-sidebar-overlay" id="aiSidebarOverlay"></div>
      <div class="ai-sidebar" id="aiSidebar">
        <div class="ai-sidebar-header d-flex d-md-none align-items-center mb-3" style="width: 100%; justify-content: space-between;">
          <h4 class="m-0 d-flex align-items-center gap-2" style="font-weight: bold;"><i class="ti ti-message-circle-2"></i> Sohbetler</h4>
          <button id="aiCloseSidebarBtn" class="btn btn-icon p-0" style="background: transparent; border:none; color: var(--text-primary);"><i class="ti ti-x" style="font-size: 1.5rem;"></i></button>
        </div>
        <button id="aiNewChatBtn" class="btn btn-primary w-100 mb-3" style="margin-bottom: 1rem; background-color: #1c5237; border-color: #1c5237; border-radius: 1rem; padding: 0.75rem;">
          <i class="ti ti-plus"></i> ${t('ai.new_chat')}
        </button>
        <div id="aiChatList" class="ai-chat-list">
          <!-- Sohbet Listesi -->
        </div>
      </div>

      <!-- SAĞ EKRAN: AKTİF SOHBET -->
      <div class="ai-main">
        <div class="ai-mobile-header d-flex d-md-none align-items-center p-3 border-bottom" style="position: relative; justify-content: flex-end;">
          <h3 class="ai-chat-title m-0 font-weight-bold" style="position: absolute; left: 50%; transform: translateX(-50%); font-size: 1.25rem;">Sohbet</h3>
          <div class="ai-mobile-header-actions d-flex gap-3">
            <button id="aiMenuBtn" class="btn btn-icon p-0" style="background:transparent; border:none; color:var(--text-primary);"><i class="ti ti-menu-2" style="font-size: 1.5rem;"></i></button>
            <button id="aiDeleteCurrentChatBtn" class="btn btn-icon p-0" style="background:transparent; border:none; color:var(--text-secondary);"><i class="ti ti-trash" style="font-size: 1.5rem;"></i></button>
          </div>
        </div>
        
        <div class="ai-chat-history" id="aiChatHistory">
          <!-- Messages will appear here -->
        </div>
        
        <div class="ai-chat-input-wrapper" style="flex-direction: column; align-items: stretch;">
          <div style="display: flex; gap: 0.5rem; width: 100%; align-items: center;">
            <textarea id="aiChatInput" placeholder="${t('ai.placeholder')}" rows="2" style="flex:1; border-radius: 12px; padding: 0.5rem;"></textarea>
            
            <button id="aiMicBtn" class="btn btn-secondary" title="Sesli Yazma" style="width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border-radius: 50%; padding: 0; flex-shrink: 0;">
              <i class="ti ti-microphone" style="font-size: 1.25rem;"></i>
            </button>
            
            <button id="aiSendBtn" class="btn btn-primary" title="${t('ai.send')}" style="width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border-radius: 50%; padding: 0; flex-shrink: 0;">
              <i class="ti ti-send" style="font-size: 1.25rem;"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  const chatListEl = document.getElementById('aiChatList');
  const chatHistoryEl = document.getElementById('aiChatHistory');
  const chatInput = document.getElementById('aiChatInput');
  const sendBtn = document.getElementById('aiSendBtn');
  const newChatBtn = document.getElementById('aiNewChatBtn');
  // Toggle removed

  // Mobile specific elements
  const menuBtn = document.getElementById('aiMenuBtn');
  const closeSidebarBtn = document.getElementById('aiCloseSidebarBtn');
  const sidebar = document.getElementById('aiSidebar');
  const overlay = document.getElementById('aiSidebarOverlay');
  const deleteCurrentChatBtn = document.getElementById('aiDeleteCurrentChatBtn');

  const openSidebar = () => {
    sidebar.classList.add('open');
    overlay.classList.add('show');
  };

  const closeSidebar = () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
  };

  if (menuBtn) menuBtn.addEventListener('click', openSidebar);
  if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', closeSidebar);
  if (overlay) overlay.addEventListener('click', closeSidebar);

  if (deleteCurrentChatBtn) {
    deleteCurrentChatBtn.addEventListener('click', async () => {
      if (!activeChatId) return;
      if (confirm("Mevcut sohbeti silmek istediğinize emin misiniz?")) {
        await deleteAiChat(activeChatId);
        chats = chats.filter(c => c.id !== activeChatId);
        activeChatId = chats.length > 0 ? chats[0].id : null;
        if (!activeChatId) startNewChat();
        renderSidebar();
        renderHistory();
      }
    });
  }

  const renderSidebar = () => {
    chatListEl.innerHTML = '';
    chats.forEach(chat => {
      const isActive = chat.id === activeChatId ? 'active' : '';
      const title = chat.title || 'Yeni Sohbet';

      let dateHtml = '';
      if (chat.updatedAt) {
        const d = new Date(chat.updatedAt);
        const dateStr = d.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' });
        const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        dateHtml = `<span style="font-size: 0.7rem; opacity: 0.6; margin-left: 1.5rem; white-space: nowrap;">${dateStr} - ${timeStr}</span>`;
      }

      const html = `
        <div class="ai-chat-item ${isActive}" data-id="${chat.id}">
          <div style="flex:1; display:flex; flex-direction:column; overflow:hidden;">
            <div class="ai-chat-item-title"><i class="ti ti-message-circle"></i> <span>${title}</span></div>
            ${dateHtml}
          </div>
          <button class="ai-chat-delete-btn" data-id="${chat.id}" title="Sil"><i class="ti ti-trash"></i></button>
        </div>
      `;
      chatListEl.insertAdjacentHTML('beforeend', html);
    });

    // Event listeners for sidebar items
    chatListEl.querySelectorAll('.ai-chat-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.closest('.ai-chat-delete-btn')) return; // Silme butonuna basıldıysa yoksay
        activeChatId = item.dataset.id;
        renderSidebar();
        renderHistory();
        if (window.innerWidth <= 768) closeSidebar();
      });
    });

    chatListEl.querySelectorAll('.ai-chat-delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const idToDelete = btn.dataset.id;
        if (confirm("Bu sohbeti silmek istediğinize emin misiniz?")) {
          await deleteAiChat(idToDelete);
          chats = chats.filter(c => c.id !== idToDelete);
          if (activeChatId === idToDelete) {
            activeChatId = chats.length > 0 ? chats[0].id : null;
            if (!activeChatId) startNewChat();
          }
          renderSidebar();
          renderHistory();
        }
      });
    });
  };

  const renderHistory = () => {
    const bannersHtml = `
      <div class="ai-disclaimer" style="margin: 0; flex-shrink: 0;">
        <i class="ti ti-alert-triangle"></i>
        <span>${t('ai.disclaimer')}</span>
      </div>
    `;

    chatHistoryEl.innerHTML = bannersHtml;
    const activeChat = chats.find(c => c.id === activeChatId);
    const messages = activeChat ? (activeChat.messages || []) : [];

    if (messages.length === 0) {
      chatHistoryEl.insertAdjacentHTML('beforeend', `
        <div class="ai-empty-state">
          <i class="ti ti-sparkles"></i>
          <p>${t('ai.welcome_title')}</p>
          <p style="font-size:0.8rem; opacity:0.7;">${t('ai.welcome_subtitle')}</p>
        </div>
      `);
      return;
    }

    messages.forEach(msg => {
      let msgClass = msg.role === 'user' ? 'ai-message-user' : 'ai-message-assistant';
      if (msg.isError) msgClass += ' ai-message-error';

      let formattedContent = '';
      if (msg.role === 'assistant') {
        formattedContent = DOMPurify.sanitize(marked.parse(msg.content));
      } else {
        const div = document.createElement('div');
        div.innerText = msg.content;
        formattedContent = div.innerHTML.replace(/\n/g, '<br/>');
      }

      let timeHtml = '';
      if (msg.timestamp) {
        const d = new Date(msg.timestamp);
        const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        timeHtml = `<div style="font-size: 0.7rem; opacity: 0.6; text-align: right; margin-top: 6px;">${timeStr}</div>`;
      }

      const html = `
        <div class="ai-message ${msgClass}">
          <div class="ai-message-content markdown-body">
            ${formattedContent}
            ${timeHtml}
          </div>
        </div>
      `;
      chatHistoryEl.insertAdjacentHTML('beforeend', html);
    });

    chatHistoryEl.scrollTop = chatHistoryEl.scrollHeight;
  };

  const sendMessage = async () => {
    const text = chatInput.value.trim();
    if (!text) return;

    let activeChat = chats.find(c => c.id === activeChatId);
    if (!activeChat) {
      startNewChat();
      activeChat = chats[0];
    }

    // İlk mesajsa başlık oluştur
    if (!activeChat.title || activeChat.title === t('ai.new_chat')) {
      activeChat.title = text.length > 25 ? text.substring(0, 25) + '...' : text;
    }

    activeChat.updatedAt = Date.now();
    activeChat.messages.push({ role: 'user', content: text, timestamp: Date.now() });
    await saveAiChat(activeChat);

    chatInput.value = '';
    renderSidebar();
    renderHistory();

    // Show typing indicator
    const typingId = 'typing-indicator';
    const typingHtml = `
      <div class="ai-message ai-message-assistant" id="${typingId}">
        <div class="ai-message-content typing" style="display: flex; align-items: center; gap: 0.5rem; opacity: 0.7;">
          <i class="ti ti-loader ti-spin" style="font-size: 1.2rem;"></i>
          <span style="font-style: italic;">${t('ai.assistant_thinking')}</span>
        </div>
      </div>
    `;
    chatHistoryEl.insertAdjacentHTML('beforeend', typingHtml);
    chatHistoryEl.scrollTop = chatHistoryEl.scrollHeight;

    sendBtn.disabled = true;

    try {
      // ── 1. Zengin bağlam verisini async olarak derle (Diyet Bağlam) ───────
      const contextData = await buildContextData();

      // ── 2. System prompt'u bağlamla doldur ─────────────────────────────
      const systemPromptTemplate = t('ai.systemPrompt');
      const systemPrompt = systemPromptTemplate.replace(
        '{{data}}',
        JSON.stringify(contextData, null, 2)
      );

      // ── 3. Konuşma geçmişini hazırla (son MAX_HISTORY_MESSAGES mesaj) ──
      // Yeni kullanıcı mesajı zaten activeChat.messages'e eklendi, onu dahil et
      const allMessages = activeChat.messages;
      const historySlice = allMessages.length > MAX_HISTORY_MESSAGES
        ? allMessages.slice(-MAX_HISTORY_MESSAGES)
        : allMessages;

      // ── 4. Groq'a gönderilecek tam mesaj dizisi ─────────────────────────
      const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...historySlice.map(m => ({ role: m.role, content: m.content })),
      ];

      const response = await askGemini(apiMessages);

      const typingEl = document.getElementById(typingId);
      if (typingEl) typingEl.remove();

      activeChat.updatedAt = Date.now();
      activeChat.messages.push({ role: 'assistant', content: response, timestamp: Date.now() });
      await saveAiChat(activeChat);

      renderSidebar();
      renderHistory();

    } catch (error) {
      console.error(error);
      const typingEl = document.getElementById(typingId);
      if (typingEl) typingEl.remove();

      // Hata mesajını sohbet ekranında göster
      const errorMessage = "⚠️ Sunucu ile iletişim kurulamadı veya bir hata oluştu. Lütfen tekrar deneyin. Detay: " + error.message;
      activeChat.updatedAt = Date.now();
      activeChat.messages.push({ role: 'assistant', content: errorMessage, isError: true, timestamp: Date.now() });
      await saveAiChat(activeChat);

      renderSidebar();
      renderHistory();

      showToast(t('ai.error') || "Bir hata oluştu", "error");
    } finally {
      sendBtn.disabled = false;
      chatInput.focus();
    }
  };

  newChatBtn.addEventListener('click', () => {
    startNewChat();
    renderSidebar();
    renderHistory();
    chatInput.focus();
    if (window.innerWidth <= 768) closeSidebar();
  });

  sendBtn.addEventListener('click', sendMessage);
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // --- Sesli Yazma (Speech Recognition) ---
  const micBtn = document.getElementById('aiMicBtn');
  let recognition = null;
  let isRecording = false;
  let silenceTimer = null;
  let initialText = '';

  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = 'tr-TR';
    recognition.continuous = true;
    recognition.interimResults = true;

    const resetSilenceTimer = (delay) => {
      if (silenceTimer) clearTimeout(silenceTimer);
      silenceTimer = setTimeout(() => {
        if (isRecording) {
          recognition.stop();
        }
      }, delay);
    };

    recognition.onstart = () => {
      isRecording = true;
      micBtn.classList.remove('btn-secondary');
      micBtn.classList.add('btn-danger', 'mic-recording');
      initialText = chatInput.value + (chatInput.value.trim() ? " " : "");
      resetSilenceTimer(5000); // 5 saniye hiç ses duymazsa kapat
    };

    recognition.onresult = (event) => {
      let currentFinal = '';
      let currentInterim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          currentFinal += event.results[i][0].transcript;
        } else {
          currentInterim += event.results[i][0].transcript;
        }
      }
      chatInput.value = initialText + currentFinal + currentInterim;
      chatInput.scrollTop = chatInput.scrollHeight;
      
      resetSilenceTimer(2000); // Kelime duyarsa 2 saniye bekle
    };

    recognition.onerror = (e) => {
      console.warn("Ses tanıma hatası:", e.error);
      if (isRecording) recognition.stop();
    };

    recognition.onend = () => {
      isRecording = false;
      micBtn.classList.remove('btn-danger', 'mic-recording');
      micBtn.classList.add('btn-secondary');
      if (silenceTimer) clearTimeout(silenceTimer);
      chatInput.focus();
    };

    micBtn.addEventListener('click', () => {
      if (isRecording) {
        recognition.stop();
      } else {
        recognition.start();
      }
    });
  } else {
    if (micBtn) micBtn.style.display = 'none'; // Tarayıcı desteklemiyorsa gizle
  }

  // Initial render
  renderSidebar();
  renderHistory();
}

function startNewChat() {
  const newIdStr = newId();
  const newChat = { id: newIdStr, title: t('ai.new_chat'), messages: [], updatedAt: Date.now() };
  chats.unshift(newChat);
  activeChatId = newIdStr;
}
