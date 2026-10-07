import { getSupabaseClient } from '../data/sync/supabaseClient.js';

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

  try {
    const { data, error } = await supabase.functions.invoke('ask-ai', {
      body: { messages, deviceId }
    });

    if (error) {
      console.error("Supabase Edge Function Hatası:", error);
      throw new Error(`Edge Function Hatası: ${error.message}`);
    }

    if (data && data.reply) {
      return data.reply;
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
