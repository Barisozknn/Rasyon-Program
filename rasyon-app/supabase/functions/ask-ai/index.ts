import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export default {
  async fetch(req: Request) {
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    try {
      const { messages, deviceId } = await req.json();

      if (!deviceId) {
        throw new Error("Yetkisiz erişim: Cihaz kimliği (deviceId) eksik.");
      }

      // Supabase Bağlantısı ve Güvenlik Kontrolü
      const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data: codeData, error: dbError } = await supabase
        .from("ai_activation_codes")
        .select("id")
        .eq("device_id", deviceId)
        .eq("is_used", true)
        .maybeSingle();

      if (dbError || !codeData) {
        throw new Error("Yetkisiz erişim: Bu cihaz için geçerli bir aktivasyon bulunamadı. Lütfen hile yapmayınız!");
      }

      // Güvenlik duvarı geçildi, DeepSeek API'ye istek yapılıyor
      const apiKey = Deno.env.get("DEEPSEEK_API_KEY");
      if (!apiKey) {
        throw new Error("API Key is missing");
      }

      const response = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages,
          temperature: 0.35,
          max_tokens: 4096,
          top_p: 0.9,
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(err);
      }

      const data = await response.json();
      return new Response(JSON.stringify({ reply: data.choices[0].message.content }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }
};
