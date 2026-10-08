export const toolsSchema = [
  {
    type: "function",
    function: {
      name: "get_dashboard_summary",
      description: "Çiftliğin genel durumunu (hayvan sayısı, güncel süt fiyatı, genel uyarılar) getirir.",
      parameters: { type: "object", properties: {}, required: [] }
    }
  },
  {
    type: "function",
    function: {
      name: "get_efficiency_and_cost_metrics",
      description: "Ana sayfadaki Yem Verimliliği skorlarına ve Maliyet Dağılımı (hammadde vs katkı) istatistiklerine erişir.",
      parameters: { type: "object", properties: {}, required: [] }
    }
  },
  {
    type: "function",
    function: {
      name: "list_animal_profiles",
      description: "Sadece kayıtlı profillerin isimlerini ve ID'lerini getirir. Hangi hayvanların olduğunu anlamak için kullanılır.",
      parameters: { type: "object", properties: {}, required: [] }
    }
  },
  {
    type: "function",
    function: {
      name: "get_profile_details",
      description: "Belirli bir ineğin/grubun canlı ağırlık, laktasyon günü, verim gibi tüm detaylarını çeker.",
      parameters: {
        type: "object",
        properties: {
          profile_id: { type: "string", description: "Hayvan profilinin ID'si" }
        },
        required: ["profile_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "calc_animal_requirements",
      description: "O profildeki hayvanın KMT (Kuru Madde Tüketimi), Enerji ve Protein ihtiyaç limitlerini hesaplayıp döner.",
      parameters: {
        type: "object",
        properties: {
          profile_id: { type: "string", description: "Hayvan profilinin ID'si" }
        },
        required: ["profile_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_group_active_rations",
      description: "Çiftlik panelinde hangi grubun (veya profilin) o an hangi kayıtlı rasyonu tükettiğini aktif olarak görür.",
      parameters: { type: "object", properties: {}, required: [] }
    }
  },
  {
    type: "function",
    function: {
      name: "assign_ration_to_group",
      description: "Kullanıcı talebi üzerine, çiftlik panelinden o profile rasyon atar.",
      parameters: {
        type: "object",
        properties: {
          group_id: { type: "string", description: "Sürü grubunun ID'si" },
          ration_id: { type: "string", description: "Atanacak rasyonun ID'si" }
        },
        required: ["group_id", "ration_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_tmr_loading_needs",
      description: "Çiftlik panelindeki grupların yediği rasyonları hesaplayarak günlük TMR yükleme ihtiyacını (Mikser reçetesi) ve stok/tüketim takibini getirir.",
      parameters: { type: "object", properties: {}, required: [] }
    }
  },
  {
    type: "function",
    function: {
      name: "search_feed_database",
      description: "Veritabanında yem arar ve sonuçları döndürür.",
      parameters: {
        type: "object",
        properties: {
          keyword: { type: "string", description: "Aranacak yemin adı veya anahtar kelime" }
        },
        required: ["keyword"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_feed_nutrition",
      description: "Yemin tüm besin madde analizlerini (NDF, Nişasta, RUP vb.) çeker.",
      parameters: {
        type: "object",
        properties: {
          feed_id: { type: "string", description: "Yemin ID'si" }
        },
        required: ["feed_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "update_feed_price",
      description: "Doğrudan o yemin fiyatını günceller.",
      parameters: {
        type: "object",
        properties: {
          feed_id: { type: "string", description: "Fiyatı güncellenecek yemin ID'si" },
          new_price_tl: { type: "number", description: "Yemin yeni fiyatı (TL)" }
        },
        required: ["feed_id", "new_price_tl"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "list_saved_rations",
      description: "Veritabanındaki tüm kayıtlı rasyonları isim, ID ve tarihleriyle listeler. Hangi rasyonların olduğunu görmek için.",
      parameters: { type: "object", properties: {}, required: [] }
    }
  },
  {
    type: "function",
    function: {
      name: "get_ration_composition",
      description: "Rasyonun toplam besin değerlerini (toplam protein, maliyet, riskler) getirir.",
      parameters: {
        type: "object",
        properties: {
          ration_id: { type: "string", description: "Rasyonun ID'si" }
        },
        required: ["ration_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_ration_ingredients",
      description: "Rasyonda hangi yemden kaç kg kullanıldığını (hammadde oranlarını) döner.",
      parameters: {
        type: "object",
        properties: {
          ration_id: { type: "string", description: "Rasyonun ID'si" }
        },
        required: ["ration_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "run_ration_optimizer",
      description: "Rasyonda değişiklik yapılıp arka planda çözücü (Solver) test edilmek istendiğinde motoru çalıştırıp sonucu döner.",
      parameters: {
        type: "object",
        properties: {
          ration_id: { type: "string", description: "Optimize edilecek rasyonun ID'si" }
        },
        required: ["ration_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_cncps_fractions",
      description: "Sadece istendiğinde sonuçlar sekmesindeki Karbonhidrat/Protein alt fraksiyonlarını çeker.",
      parameters: {
        type: "object",
        properties: {
          ration_id: { type: "string", description: "Rasyonun ID'si" }
        },
        required: ["ration_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_all_profile_observations",
      description: "İstenen bir hayvan profiline ait tarihsel tüm saha gözlemlerine erişir. (Trendleri okumak için).",
      parameters: {
        type: "object",
        properties: {
          profile_id: { type: "string", description: "Hayvan profilinin ID'si" }
        },
        required: ["profile_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "add_field_observation",
      description: "Kullanıcının yazdığı bir sorunu veya notu saha gözlemlerine kayıt olarak ekler.",
      parameters: {
        type: "object",
        properties: {
          profile_id: { type: "string", description: "Hayvan profilinin ID'si" },
          date: { type: "string", description: "Gözlem tarihi (YYYY-MM-DD formatında)" },
          note: { type: "string", description: "Gözlem notu" },
          changes: { type: "string", description: "Yapılan veya önerilen değişiklikler" }
        },
        required: ["profile_id", "date", "note"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "search_academic_recommendations",
      description: "Sistemdeki tavsiyeler sekmesinde geçen akademik makaleleri veya çözümleri arar.",
      parameters: {
        type: "object",
        properties: {
          topic: { type: "string", description: "Aranacak konu (örn: asidoz, ketozis)" }
        },
        required: ["topic"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_system_settings",
      description: "Şu an NASEM 2021 mi yoksa NRC 2001 mi kullanıldığını, varsayılan ayarları öğrenir.",
      parameters: { type: "object", properties: {}, required: [] }
    }
  },
  {
    type: "function",
    function: {
      name: "update_default_settings",
      description: "Ayarlar menüsündeki varsayılan değerleri doğrudan değiştirir.",
      parameters: {
        type: "object",
        properties: {
          key: { type: "string", description: "Değiştirilecek ayar anahtarı (örn: milkPrice, defaultBw)" },
          value: { type: "number", description: "Yeni değer" }
        },
        required: ["key", "value"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "navigate_to_tab",
      description: "Kullanıcıyı arayüzdeki ilgili sekmeye otomatik götürür.",
      parameters: {
        type: "object",
        properties: {
          tab_name: { type: "string", description: "Sekme adı (örn: dashboard, rations, herd)" }
        },
        required: ["tab_name"]
      }
    }
  }
];
