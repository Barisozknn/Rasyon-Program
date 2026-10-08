import {
  animalProfileGetAll,
  animalProfileGetById,
  herdGroupGetAll,
  herdGroupGetById,
  herdGroupPut,
  rationGetAll,
  rationGetById,
  getActiveFarm,
  feedGetAll,
  feedGetById,
  feedPut,
  observationGetByProfile,
  observationAdd,
} from '../data/db.js';
import { getSettings, saveSettings } from '../data/settings.js';
import { calcAllRequirements } from './animalRequirements.js';

/**
 * AI tarafından çağrılan araçları (tools) işleyen yönlendirici (dispatcher).
 * Aşama 3: Tüm GET (Okuma/Listeleme) araçları buraya bağlanmıştır.
 * Aşama 4'te eklenecek yazma işlemleri şimdilik uyarı döner.
 */
export async function handleToolCall(toolName, argsStr) {
  let args = {};
  try {
    if (argsStr) {
      args = typeof argsStr === 'string' ? JSON.parse(argsStr) : argsStr;
    }
  } catch (e) {
    console.warn("Tool argümanları parse edilemedi:", e);
  }

  console.log(`[Tool Çağrısı] ${toolName} çalıştırılıyor...`, args);

  try {
    switch (toolName) {
      // 1. DASHBOARD
      case 'get_dashboard_summary': {
        const [farm, profiles, rations, groups] = await Promise.all([
          getActiveFarm(),
          animalProfileGetAll().catch(() => []),
          rationGetAll().catch(() => []),
          herdGroupGetAll().catch(() => [])
        ]);
        const settings = getSettings();
        return {
          farmName: farm?.name || settings?.farm?.name || 'Bilinmeyen Çiftlik',
          totalProfiles: profiles.length,
          totalRations: rations.length,
          totalGroups: groups.length,
          milkPrice: settings?.economics?.milkPrice || 0
        };
      }
      case 'get_efficiency_and_cost_metrics': {
        const rations = await rationGetAll().catch(() => []);
        const recent = rations.sort((a,b) => new Date(b.updatedAt||0) - new Date(a.updatedAt||0)).find(r => r.result);
        if (!recent) return { error: "Hesaplanmış rasyon bulunamadı." };
        
        const my = recent.animal?.milkYield || 0;
        const dmi = recent.result?.dmi || 0;
        const efficiency = dmi > 0 ? (my / dmi).toFixed(2) : 0;
        
        return { 
          rationName: recent.name, 
          milkYield: my, 
          dmi: dmi, 
          feedEfficiency: efficiency, 
          totalCost: recent.result?.cost || 0 
        };
      }

      // 2. HAYVAN PROFİLİ & ÇİFTLİK
      case 'list_animal_profiles': {
        const profiles = await animalProfileGetAll();
        return profiles.map(p => ({ id: p.id, name: p.name, breed: p.breed, groupId: p.groupId }));
      }
      case 'get_profile_details': {
        if (!args.profile_id) return { error: "profile_id parametresi eksik." };
        const profile = await animalProfileGetById(args.profile_id);
        if (!profile) return { error: "Profil bulunamadı." };
        return profile;
      }
      case 'calc_animal_requirements': {
        if (!args.profile_id) return { error: "profile_id parametresi eksik." };
        const profile = await animalProfileGetById(args.profile_id);
        if (!profile) return { error: "Profil bulunamadı." };
        const reqs = calcAllRequirements(profile);
        return {
          dmi: reqs.dmi,
          nel: reqs.nel,
          mp: reqs.mp,
          dcadTarget: reqs.dcadTarget,
          compTargets: reqs.compTargets
        };
      }
      case 'get_group_active_rations': {
        const groups = await herdGroupGetAll();
        return groups.map(g => ({
          groupId: g.id,
          groupName: g.name,
          headCount: g.headCount,
          rationId: g.rationId || null
        }));
      }
      case 'get_tmr_loading_needs': {
        const groups = await herdGroupGetAll();
        const rations = await rationGetAll();
        const tmrList = [];
        
        for (const g of groups) {
          if (g.rationId) {
            const r = rations.find(x => x.id === g.rationId);
            if (r && r.result && r.result.items) {
               const totalHead = g.headCount || 1;
               const ingredients = r.result.items.map(item => ({ 
                 name: item.name || item.tr_name, 
                 asFedKgPerCow: item.asFedKg || 0,
                 totalAsFedKg: Number(((item.asFedKg || 0) * totalHead).toFixed(2))
               }));
               
               const totalMixKg = ingredients.reduce((sum, i) => sum + i.totalAsFedKg, 0);
               
               tmrList.push({ 
                 groupName: g.name, 
                 headCount: totalHead, 
                 rationName: r.name, 
                 totalMixAsFedKg: Number(totalMixKg.toFixed(2)),
                 ingredients 
               });
            }
          }
        }
        return tmrList.length > 0 ? tmrList : { message: "Aktif rasyon tüketen sürü grubu bulunamadı." };
      }

      // 3. YEM VERİTABANI
      case 'search_feed_database': {
        if (!args.keyword) return { error: "keyword parametresi eksik." };
        const feeds = await feedGetAll();
        const kw = args.keyword.toLowerCase();
        const matches = feeds.filter(f => (f.name || '').toLowerCase().includes(kw) || (f.category || '').toLowerCase().includes(kw));
        return matches.map(f => ({ id: f.id, name: f.name, category: f.category, price: f.pricePerTon || 0 })).slice(0, 15);
      }
      case 'get_feed_nutrition': {
        if (!args.feed_id) return { error: "feed_id parametresi eksik." };
        const feed = await feedGetById(args.feed_id);
        if (!feed) return { error: "Yem bulunamadı." };
        return feed; // Tüm detayları dönüyoruz, AI içinden seçecek
      }

      // 4. RASYON & SONUÇLAR
      case 'list_saved_rations': {
        const rations = await rationGetAll();
        return rations.map(r => ({
          id: r.id,
          name: r.name,
          date: r.updatedAt || r.createdAt,
          status: r.result?.statusName || 'Bilinmiyor',
          cost: r.result?.cost || 0
        }));
      }
      case 'get_ration_composition': {
        if (!args.ration_id) return { error: "ration_id parametresi eksik." };
        const ration = await rationGetById(args.ration_id);
        if (!ration) return { error: "Rasyon bulunamadı." };
        return ration.result?.composition || { error: "Bu rasyonun kompozisyon sonucu yok." };
      }
      case 'get_ration_ingredients': {
        if (!args.ration_id) return { error: "ration_id parametresi eksik." };
        const ration = await rationGetById(args.ration_id);
        if (!ration) return { error: "Rasyon bulunamadı." };
        return ration.result?.items || { error: "Bu rasyonun hammadde listesi yok." };
      }
      case 'run_ration_optimizer': {
        if (!args.ration_id) return { error: "ration_id parametresi eksik." };
        const ration = await rationGetById(args.ration_id);
        if (!ration) return { error: "Rasyon bulunamadı." };
        
        // Optimizasyon için asgari girdiler kontrol ediliyor
        if (!ration.animal || !ration.feeds || ration.feeds.length === 0) {
          return { error: "Rasyonun hayvan profili veya seçili yemleri eksik, optimizasyon yapılamaz." };
        }
        
        // Sadece rasyon verisi ile optimizer'ı simüle ediyoruz (Gerçek motor çok ağır olabilir)
        // Eğer rationOptimizer entegre edilecekse, burada import edilip optimizeRation(ration) çağrılmalıdır.
        // Ancak AI'ın backend/edge function'ı kitlememesi için mevcut rasyon sonucunu güncellenmiş varsayıyoruz.
        return { 
          status: "simulated_success", 
          message: "Optimizasyon çalıştırıldı (Simülasyon). Sonuçlar rasyon sonuçlarıyla aynı kabul ediliyor.",
          resultSummary: {
            cost: ration.result?.cost || 0,
            statusName: ration.result?.statusName || "Unknown"
          }
        };
      }
      case 'get_cncps_fractions': {
        if (!args.ration_id) return { error: "ration_id parametresi eksik." };
        const ration = await rationGetById(args.ration_id);
        return ration?.result?.cncps || { message: "CNCPS değerleri bu rasyonda bulunamadı." };
      }

      // 5. SAHA GÖZLEM & TAVSİYELER
      case 'get_all_profile_observations': {
        if (!args.profile_id) return { error: "profile_id parametresi eksik." };
        const obs = await observationGetByProfile(args.profile_id);
        return obs;
      }
      case 'search_academic_recommendations':
        return { message: `Makale araması yapıldı: '${args.topic}'. (Tavsiyeler veritabanı henüz API'ye bağlanmadı).` };

      // 6. AYARLAR & ARAYÜZ
      case 'get_system_settings':
        return getSettings();
      
      case 'navigate_to_tab': {
        // Tarayıcı tarafında tetiklenecek bir event
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('ai:navigate', { detail: { tab: args.tab_name } }));
          return { status: "success", message: `Kullanıcı '${args.tab_name}' sekmesine yönlendirildi.` };
        }
        return { error: "Tarayıcı ortamı değil." };
      }

      // AŞAMA 4: YAZMA İŞLEMLERİ (Aksiyon Araçları)
      case 'assign_ration_to_group': {
        if (!args.group_id || !args.ration_id) return { error: "group_id veya ration_id eksik." };
        
        // Kullanıcı onayı iste
        if (typeof window !== 'undefined') {
          const group = await herdGroupGetById(args.group_id);
          const ration = await rationGetById(args.ration_id);
          const gName = group ? group.name : args.group_id;
          const rName = ration ? ration.name : args.ration_id;
          
          if (!window.confirm(`Yapay Zeka, '${rName}' adlı rasyonu '${gName}' grubuna atamak istiyor. Onaylıyor musunuz?`)) {
            return { error: "Kullanıcı işlemi reddetti." };
          }
        }
        
        const group = await herdGroupGetById(args.group_id);
        if (!group) return { error: "Grup bulunamadı." };
        
        group.rationId = args.ration_id;
        await herdGroupPut(group);
        return { status: "success", message: "Rasyon başarıyla gruba atandı." };
      }
        
      case 'update_feed_price': {
        if (!args.feed_id || args.new_price_tl === undefined) return { error: "feed_id veya new_price_tl eksik." };
        
        const feed = await feedGetById(args.feed_id);
        if (!feed) return { error: "Yem bulunamadı." };

        if (typeof window !== 'undefined') {
          if (!window.confirm(`Yapay Zeka, '${feed.name}' yeminin fiyatını ${args.new_price_tl} TL olarak güncellemek istiyor. Onaylıyor musunuz?`)) {
            return { error: "Kullanıcı işlemi reddetti." };
          }
        }

        feed.pricePerTon = Number(args.new_price_tl);
        await feedPut(feed);
        return { status: "success", message: `Yem fiyatı başarıyla güncellendi.` };
      }

      case 'add_field_observation': {
        if (!args.profile_id || !args.date || !args.note) return { error: "Gerekli parametreler eksik (profile_id, date, note)." };
        
        const obsData = {
          profileId: args.profile_id,
          date: args.date,
          notes: args.note + (args.changes ? `\nDeğişiklik: ${args.changes}` : '')
        };
        
        await observationAdd(obsData);
        return { status: "success", message: "Saha gözlemi başarıyla eklendi." };
      }

      case 'update_default_settings': {
        if (!args.key || args.value === undefined) return { error: "key veya value eksik." };
        
        if (typeof window !== 'undefined') {
          if (!window.confirm(`Yapay Zeka, '${args.key}' ayarını '${args.value}' olarak değiştirmek istiyor. Onaylıyor musunuz?`)) {
            return { error: "Kullanıcı işlemi reddetti." };
          }
        }

        const currentSettings = getSettings();
        // Varsayılan değerler "defaults" altında, bilim "science" altında veya kökte (economics) olabilir
        // Basit bir arama ve yerleştirme yapalım
        if (currentSettings.defaults && args.key in currentSettings.defaults) {
          saveSettings({ defaults: { [args.key]: args.value } });
        } else if (currentSettings.science && args.key in currentSettings.science) {
          saveSettings({ science: { [args.key]: args.value } });
        } else if (currentSettings.economics && args.key in currentSettings.economics) {
           saveSettings({ economics: { [args.key]: args.value } });
        } else {
           // Doğrudan ayarların köküne veya yeni bir alana kaydet (Örn: milkPrice_tl)
           // Hangi kategoride olduğunu kestiremiyorsak doğrudan defaults'a atalım
           saveSettings({ defaults: { [args.key]: args.value } });
        }
        
        return { status: "success", message: `Ayar güncellendi: ${args.key} = ${args.value}` };
      }

      default:
        return { error: `Bilinmeyen araç (tool): ${toolName}` };
    }
  } catch (err) {
    console.error(`Tool Error (${toolName}):`, err);
    return { error: `Tool çalışırken hata oluştu: ${err.message}` };
  }
}
