import { getSupabaseClient } from '../data/sync/supabaseClient.js';
import { toolsSchema } from './aiToolsSchema.js';
import { handleToolCall } from './toolHandler.js';

/**
 * Sends a full conversation to the Supabase Edge Function 'ask-ai'.
 *
 * @param {Array<{role: string, content: string}>} messages - Full conversation history
 * @returns {Promise<string>} The AI's response text.
 */
export async function askGemini(messages) {
  const supabase = await getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase bağlantısı kurulamadı. Lütfen .env dosyasındaki ayarlarınızı kontrol edin.");
  }
  const deviceId = localStorage.getItem('device_id');
  if (!deviceId) {
    throw new Error("Cihaz kimliği bulunamadı. Lütfen ayarlardan yapay zeka asistanınızı tekrar aktive edin.");
  }

  // Orijinal mesajları korumak için kopyasını alıyoruz
  let currentMessages = [...messages];
  let maxLoops = 5; // Sonsuz döngü koruması
  let loopCount = 0;

  while (loopCount < maxLoops) {
    loopCount++;
    try {
      // Araç şemalarını (toolsSchema) isteğe ekliyoruz
      const { data, error } = await supabase.functions.invoke('ask-ai', {
        body: { messages: currentMessages, deviceId, tools: toolsSchema }
      });

      if (error) {
        console.error("Supabase Edge Function Hatası:", error);
        throw new Error(`Edge Function Hatası: ${error.message}`);
      }

      if (data && data.tool_calls) {
        // AI tool çağırdı, önce asistanın kendi mesajını (ve tool_calls verisini) ekle
        const assistantMessage = {
          role: 'assistant',
          content: data.reply || null,
          tool_calls: data.tool_calls
        };
        currentMessages.push(assistantMessage);

        // Her bir tool'u frontend'de çalıştır ve sonucunu tool rolüyle mesaja ekle
        for (const toolCall of data.tool_calls) {
          try {
            const result = await handleToolCall(toolCall.function.name, toolCall.function.arguments);
            currentMessages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              name: toolCall.function.name,
              content: JSON.stringify(result)
            });
          } catch (toolErr) {
            console.error("Tool execution error:", toolErr);
            currentMessages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              name: toolCall.function.name,
              content: JSON.stringify({ error: toolErr.message })
            });
          }
        }
        // Döngü başa dönecek ve currentMessages (tool sonuçlarıyla) tekrar Edge Function'a gidecek
      } else if (data && data.reply) {
        return data.reply; // Nihai yanıtı döndür
      } else if (data && data.error) {
         throw new Error(data.error);
      } else {
        throw new Error("Yapay zeka boş bir yanıt döndürdü.");
      }

    } catch (error) {
      console.error("Supabase Invoke Error:", error);
      throw new Error(`AI İletişim Hatası: ${error.message || "Bilinmeyen bir hata oluştu."}`);
    }
  }

  throw new Error("Yapay zeka çok fazla işlem yaptı (Döngü limitine ulaşıldı). Lütfen daha basit bir komut verin.");
}
