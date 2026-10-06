const fs = require('fs');
const path = require('path');

const newRecs = [
  // --- KURU DÖNEM / GEÇİŞ (10) ---
  {
    id: "rec-021",
    title: "Kuru Dönemde Vücut Kondisyon Skoru (BCS)",
    content: "Kuruya ayrılan ineklerin BCS'si 3.0 - 3.25 aralığında olmalıdır. Kuru dönemde kondisyon kazandırmak veya kaybettirmek metabolik hastalıklara (yağlı karaciğer vb.) zemin hazırlar. İnekler laktasyon sonunda uygun kondisyonda kuruya çıkarılmalıdır.",
    category: "Kuru Dönem / Geçiş",
    scientificSource: "Journal of Dairy Science",
    reliability: "99%",
    relatedFeature: "ration",
    icon: "ti-activity"
  },
  {
    id: "rec-022",
    title: "Geçiş Dönemi Magnezyum Seviyesi",
    content: "Süt hummasını önlemede DCAD kadar magnezyum da önemlidir. Doğuma 21 gün kala rasyon Mg seviyesi %0.40 - %0.45 (KM bazında) olmalı ve emilimi artırmak için K seviyesi %1.3'ün altında tutulmalıdır.",
    category: "Kuru Dönem / Geçiş",
    scientificSource: "NASEM (2021)",
    reliability: "98%",
    relatedFeature: "ration",
    icon: "ti-shield"
  },
  {
    id: "rec-023",
    title: "Doğum Sonrası Kalsiyum Bolus Uygulaması",
    content: "Özellikle 2. ve üzeri laktasyondaki (yaşlı) ineklerde, klinik hipokalsemi görülmese bile subklinik hipokalsemiyi önlemek için doğum anında ve 12 saat sonra kalsiyum bolus takviyesi yapılması DMI'ı artırır.",
    category: "Kuru Dönem / Geçiş",
    scientificSource: "Veterinary Clinics of North America",
    reliability: "95%",
    relatedFeature: "ration",
    icon: "ti-pill"
  },
  {
    id: "rec-024",
    title: "Erken Laktasyonda Ketozis Taraması (BHBA)",
    content: "Doğumdan sonraki 3-14 gün arasında ineklerin kanındaki Beta-hidroksibütirik asit (BHBA) seviyesinin 1.2 mmol/L üzerinde olması subklinik ketozise işaret eder. Erken teşhis, propilen glikol müdahalesi için kritiktir.",
    category: "Kuru Dönem / Geçiş",
    scientificSource: "Journal of Dairy Science",
    reliability: "100%",
    relatedFeature: "observations",
    icon: "ti-activity-heart"
  },
  {
    id: "rec-025",
    title: "Kuru Dönem Uzunluğu (Kısa Kuru Dönem)",
    content: "Geleneksel kuru dönem 60 gün olsa da, yüksek verimli ineklerde 40-45 günlük kısa kuru dönemler, negatif enerji dengesini (NEB) azaltabilir. Ancak 40 günün altı, meme epitel hücre yenilenmesini bozarak verimi düşürür.",
    category: "Kuru Dönem / Geçiş",
    scientificSource: "Journal of Dairy Science",
    reliability: "90%",
    relatedFeature: "ration",
    icon: "ti-calendar-time"
  },
  {
    id: "rec-026",
    title: "Close-up Rasyonunda Nişasta Adaptasyonu",
    content: "Doğuma 21 gün kala rasyon nişasta oranı %14-16 civarına çıkarılarak, rumen papillalarının (emici yüzey) uzaması ve laktasyon rasyonundaki yüksek enerjiye adaptasyonu sağlanmalıdır.",
    category: "Kuru Dönem / Geçiş",
    scientificSource: "NASEM (2021)",
    reliability: "95%",
    relatedFeature: "ration",
    icon: "ti-leaf"
  },
  {
    id: "rec-027",
    title: "Geçiş Döneminde Korunmuş Kolin Takviyesi",
    content: "Doğum öncesi 21 günden doğum sonrası 21 güne kadar günlük 15-20 gr rumen-korumalı kolin takviyesi, karaciğerden VLDL (Çok Düşük Yoğunluklu Lipoprotein) çıkışını artırarak yağlı karaciğer sendromunu önler.",
    category: "Kuru Dönem / Geçiş",
    scientificSource: "Journal of Dairy Science",
    reliability: "95%",
    relatedFeature: "ration",
    icon: "ti-flask"
  },
  {
    id: "rec-028",
    title: "Goldilocks Rasyonu (Kontrollü Enerji)",
    content: "Far-off (erken kuru) döneminde ineklere düşük enerjili ama yüksek hacimli (örn. buğday samanı ağırlıklı) 'Goldilocks' rasyonları yedirilerek aşırı enerji alımı ve yağlanma engellenmelidir.",
    category: "Kuru Dönem / Geçiş",
    scientificSource: "Dr. James Drackley (UIUC)",
    reliability: "98%",
    relatedFeature: "ration",
    icon: "ti-scale"
  },
  {
    id: "rec-029",
    title: "Doğum Sonrası DMI Düşüşü",
    content: "İnekler doğum günü normal DMI'larının %30'una kadar düşebilir. Yemlikte her zaman taze ve iştah açıcı (palatabl) yem bulundurmak bu düşüşü minimize eder.",
    category: "Kuru Dönem / Geçiş",
    scientificSource: "NASEM (2021)",
    reliability: "100%",
    relatedFeature: "ration",
    icon: "ti-trending-down"
  },
  {
    id: "rec-030",
    title: "Laktasyona Başlangıç: Propilen Glikol",
    content: "Risk altındaki (şişman) ineklere doğum sonrası ilk 3-5 gün ağızdan sıvı propilen glikol drench uygulaması, kan glikozunu hızla yükselterek ketozis insidansını yarı yarıya düşürür.",
    category: "Kuru Dönem / Geçiş",
    scientificSource: "Journal of Dairy Science",
    reliability: "95%",
    relatedFeature: "ration",
    icon: "ti-bottle"
  },

  // --- LAKTASYON RASYONU (20) ---
  {
    id: "rec-031",
    title: "Dirençli Nişasta (Bypass Starch)",
    content: "Mısırın işlenme şekli nişasta sindirilebilirliğini belirler. Kuru mısır yerine flake (buharda ezilmiş) mısır kullanımı rumen nişasta sindirimini artırır; ancak SARA riskine karşı dengeli kullanılmalıdır.",
    category: "Laktasyon Rasyonu",
    scientificSource: "NASEM (2021)",
    reliability: "98%",
    relatedFeature: "ration",
    icon: "ti-grain"
  },
  {
    id: "rec-032",
    title: "Yağ Asitleri (RUFAL) Sınırı",
    content: "Rasyondaki toplam doymamış yağ asidi yükünün (RUFAL: Oleik + Linoleik + Linolenik asit) KM'de %3'ü geçmemesi, rumen bakterilerine toksik etkiyi ve süt yağı depresyonunu önler.",
    category: "Laktasyon Rasyonu",
    scientificSource: "Journal of Dairy Science",
    reliability: "99%",
    relatedFeature: "results",
    icon: "ti-droplet-filled"
  },
  {
    id: "rec-033",
    title: "Şeker (Suda Çözünen Karbonhidratlar) Oranı",
    content: "Laktasyon rasyonunda KM'nin %5-7'si oranında şeker (melas vb.) bulunması, rumende çok hızlı fermente olarak mikrobiyal protein sentezini ateşler ve NDF sindirimini iyileştirir.",
    category: "Laktasyon Rasyonu",
    scientificSource: "NASEM (2021)",
    reliability: "95%",
    relatedFeature: "ration",
    icon: "ti-cube"
  },
  {
    id: "rec-034",
    title: "Histidin: Sınırlandırıcı Üçüncü Amino Asit",
    content: "Mısır silajı ağırlıklı rasyonlarda (yonca kısıtlıysa) Histidin, Lizin ve Metiyonin'den sonra ilk sınırlandırıcı amino asit haline gelebilir. İdeal metabolik protein diziliminde göz önünde bulundurulmalıdır.",
    category: "Laktasyon Rasyonu",
    scientificSource: "NASEM (2021)",
    reliability: "90%",
    relatedFeature: "results",
    icon: "ti-dna"
  },
  {
    id: "rec-035",
    title: "Organik İz Mineraller (Şelatlı)",
    content: "Zn, Mn ve Cu gibi iz minerallerin inorganik (sülfat) yerine kısmen organik (şelatlı) formda kullanılması, tırnak sağlığını, somatik hücre sayısını (SCC) ve üreme performansını bariz şekilde iyileştirir.",
    category: "Laktasyon Rasyonu",
    scientificSource: "Journal of Dairy Science",
    reliability: "95%",
    relatedFeature: "ration",
    icon: "ti-diamond"
  },
  {
    id: "rec-036",
    title: "Katyon-Anyon Dengesi (DCAD) - Laktasyon",
    content: "Laktasyondaki ineklerde DCAD seviyesinin pozitif (+250 ila +300 mEq/kg) tutulması, rumen tamponlama kapasitesini artırır ve özellikle yaz aylarında süt yağı ve verimi maksimize eder.",
    category: "Laktasyon Rasyonu",
    scientificSource: "NASEM (2021)",
    reliability: "98%",
    relatedFeature: "results",
    icon: "ti-battery-3"
  },
  {
    id: "rec-037",
    title: "Ham Protein Sınırlandırması",
    content: "Eskiden %18-19 uygulanan rasyon HP oranları, NASEM 2021 ile çevresel ve ekonomik nedenlerle %15.5-16.5 aralığına çekilmiştir. Doğru RUP/RDP ve amino asit dengesiyle düşük proteinle aynı verim alınabilir.",
    category: "Laktasyon Rasyonu",
    scientificSource: "NASEM (2021)",
    reliability: "100%",
    relatedFeature: "ration",
    icon: "ti-plant-2"
  },
  {
    id: "rec-038",
    title: "Palmiye Yağı vs. Kalsiyum Sabunları",
    content: "Palmitik asit (C16:0) ağırlıklı by-pass yağlar doğrudan süt yağını artırırken, kalsiyum sabunları (doymamış asitler içerir) ineklerin enerji açığını kapatarak vücut kondisyonuna ve üremeye olumlu yansır.",
    category: "Laktasyon Rasyonu",
    scientificSource: "Journal of Dairy Science",
    reliability: "95%",
    relatedFeature: "ration",
    icon: "ti-droplet"
  },
  {
    id: "rec-039",
    title: "Pik Süt Verimi ve Pik DMI Uyumsuzluğu",
    content: "İnekler süt verimi pikine 45-60. günlerde ulaşırken, DMI piki 90-120. günlerde gerçekleşir. Bu asenkronizasyon döneminde (erken laktasyon) rasyon enerji yoğunluğunun (NEL) artırılması zorunludur.",
    category: "Laktasyon Rasyonu",
    scientificSource: "NRC (2001)",
    reliability: "100%",
    relatedFeature: "ration",
    icon: "ti-chart-line"
  },
  {
    id: "rec-040",
    title: "Kaba Yem Kalitesi ve DMI İlişkisi",
    content: "NDF sindirilebilirliğindeki (NDFD) her %1'lik artış, DMI'da 0.17 kg ve süt veriminde 0.25 kg artışa yol açar. Kaba yem kalitesi, rasyondaki en kritik başarı faktörüdür.",
    category: "Laktasyon Rasyonu",
    scientificSource: "Oba & Allen (1999)",
    reliability: "100%",
    relatedFeature: "ration",
    icon: "ti-seeding"
  },
  {
    id: "rec-041",
    title: "Fosfor Düzeyi",
    content: "Süt inekleri rasyonlarında Fosfor (P) oranının KM'de %0.35-0.38 arasında olması yeterlidir. Eski alışkanlıklarla fazla P eklenmesi üremeyi artırmaz, sadece gübreyle atılarak çevre kirliliği ve israf yaratır.",
    category: "Laktasyon Rasyonu",
    scientificSource: "NASEM (2021)",
    reliability: "99%",
    relatedFeature: "ration",
    icon: "ti-leaf"
  },
  {
    id: "rec-042",
    title: "B Tiamin ve Niasin Kullanımı",
    content: "Yüksek konsantre yemli rasyonlarda Niasin (B3) ve Tiamin (B1) sentezi düşebilir. Ketozis riskli sürülerde Niasin, rumen asidozu riskli sürülerde Tiamin ilavesi koruyucudur.",
    category: "Yem Katkıları",
    scientificSource: "Journal of Dairy Science",
    reliability: "85%",
    relatedFeature: "ration",
    icon: "ti-pill"
  },
  {
    id: "rec-043",
    title: "Canlı Maya (Saccharomyces cerevisiae)",
    content: "Canlı maya kültürleri rumen ortamındaki oksijeni tüketerek laktik asit kullanan bakterileri teşvik eder, rumen pH'ını stabilize eder ve lif sindirimini artırır.",
    category: "Yem Katkıları",
    scientificSource: "Journal of Dairy Science",
    reliability: "95%",
    relatedFeature: "ration",
    icon: "ti-microscope"
  },
  {
    id: "rec-044",
    title: "Kaba Yem Partikül Dağılımı (Penn State)",
    content: "Penn State Partikül Ayırıcı testinde TMR'nin üst elekte (%8-15), orta elekte (%30-50), alt elekte (%10-20) ve tavada (<%20) kalması ideal geviş getirmeyi sağlar.",
    category: "Laktasyon Rasyonu",
    scientificSource: "Penn State University",
    reliability: "100%",
    relatedFeature: "observations",
    icon: "ti-layout-list"
  },
  {
    id: "rec-045",
    title: "Mycotoksin Bağlayıcı Kullanımı",
    content: "Silajlarda ısınma, küf veya aflotoksin şüphesi varsa (özellikle sıcak aylarda), geniş spektrumlu mikotoksin bağlayıcıların TMR'ye eklenmesi süt kaybını ve döl verimi düşüşünü engeller.",
    category: "Yem Katkıları",
    scientificSource: "NASEM (2021)",
    reliability: "90%",
    relatedFeature: "ration",
    icon: "ti-bug"
  },
  {
    id: "rec-046",
    title: "Metiyonin ve Süt Proteini",
    content: "Korumalı metiyonin ilavesi sadece süt protein oranını artırmakla kalmaz, aynı zamanda erken laktasyon döneminde karaciğer fonksiyonlarını iyileştirerek oksidatif stresi azaltır.",
    category: "Laktasyon Rasyonu",
    scientificSource: "Journal of Dairy Science",
    reliability: "95%",
    relatedFeature: "ration",
    icon: "ti-dna"
  },
  {
    id: "rec-047",
    title: "Yonca vs. Çayır Otu",
    content: "Yonca yüksek lignin ve düşük hemiselüloz içerirken, çayır otları daha yüksek NDF fakat daha yüksek NDF sindirilebilirliğine sahiptir. Rasyonda bu ikisinin kombinasyonu rumen doluluğunu dengeler.",
    category: "Laktasyon Rasyonu",
    scientificSource: "NASEM (2021)",
    reliability: "90%",
    relatedFeature: "feeds",
    icon: "ti-plant-2"
  },
  {
    id: "rec-048",
    title: "Kuru Madde Tayini (Aylık/Haftalık)",
    content: "Silaj kuru maddesi (KM) hava şartlarıyla değişebilir. Mısır silajı KM'sinin haftalık veya sağanak yağışlar sonrası mikrodalga veya Koster tester ile ölçülüp rasyonun revize edilmesi kritiktir.",
    category: "Laktasyon Rasyonu",
    scientificSource: "Journal of Dairy Science",
    reliability: "100%",
    relatedFeature: "observations",
    icon: "ti-scale"
  },
  {
    id: "rec-049",
    title: "TMR Homojenliği",
    content: "Vagon karışımının başı, ortası ve sonundan alınan TMR numuneleri arasındaki NDF varyasyon katsayısı %5'in altında olmalıdır. Daha fazlası, ineklerin yem seçtiğinin (sorting) veya kötü karışımın kanıtıdır.",
    category: "Laktasyon Rasyonu",
    scientificSource: "Penn State Extension",
    reliability: "95%",
    relatedFeature: "observations",
    icon: "ti-recycle"
  },
  {
    id: "rec-050",
    title: "Nişasta Yıkılım Oranı",
    content: "Toplam rasyon nişastasının rumen yıkılabilirlik oranının %70-75 aralığında olması hedeflenmelidir. Çok hızlı yıkılan nişasta (örn. ince öğütülmüş buğday) asidoz yaratırken, çok yavaş yıkılan (kaba kırılmış mısır) dışkıda nişasta kaybına neden olur.",
    category: "Laktasyon Rasyonu",
    scientificSource: "NASEM (2021)",
    reliability: "98%",
    relatedFeature: "results",
    icon: "ti-dashboard"
  },

  // --- SAĞLIK / RUMEN (15) ---
  {
    id: "rec-051",
    title: "SARA (Subklinik Rumen Asidozu) Belirtileri",
    content: "Sürüde süt yağının proteinin altına düşmesi (milk fat inversion), köpüklü ve sindirilmemiş partikül içeren gübre, düşük DMI ve laminitis, SARA'nın başlıca habercileridir.",
    category: "Sağlık / Rumen",
    scientificSource: "Journal of Dairy Science",
    reliability: "100%",
    relatedFeature: "observations",
    icon: "ti-alert-circle"
  },
  {
    id: "rec-052",
    title: "Geviş Getirme İzlemesi",
    content: "Dinlenen ineklerin en az %60'ı geviş getiriyor olmalıdır (Rumination). Günlük geviş getirme süresi 450-500 dakika altına düşüyorsa rasyon peNDF'si acilen kontrol edilmelidir.",
    category: "Sağlık / Rumen",
    scientificSource: "NASEM (2021)",
    reliability: "95%",
    relatedFeature: "observations",
    icon: "ti-activity"
  },
  {
    id: "rec-053",
    title: "Gübre Yıkama Skoru (Manure Scoring)",
    content: "Süt ineklerinde ideal gübre skoru 3 olmalıdır. Gübre bir botun ucuna 1-1.5 cm kalınlığında yapışmalı, su gibi akmamalı veya at gübresi gibi katı katı ayrılmamalıdır.",
    category: "Sağlık / Rumen",
    scientificSource: "Michigan State University",
    reliability: "90%",
    relatedFeature: "observations",
    icon: "ti-poo"
  },
  {
    id: "rec-054",
    title: "Rumen Tamponları (Sodyum Bikarbonat)",
    content: "Yüksek enerjili laktasyon rasyonlarına inek başına günlük 150-250 gr Sodyum Bikarbonat eklenmesi rumen pH'ını korur. Sodyum Bikarbonat rumen bazında, Magnezyum Oksit ise bağırsak bazında tamponlama yapar.",
    category: "Yem Katkıları",
    scientificSource: "NRC (2001)",
    reliability: "99%",
    relatedFeature: "ration",
    icon: "ti-flask"
  },
  {
    id: "rec-055",
    title: "Üre Toksisitesi",
    content: "Rasyonda NPN (örneğin üre) kullanımı HP'nin en fazla %20'si kadar olmalıdır. Hızlı sindirilen karbonhidratlar (melas, mısır) eksikse amonyak kana karışarak üre zehirlenmesi ve üreme problemlerine yol açar.",
    category: "Sağlık / Rumen",
    scientificSource: "NASEM (2021)",
    reliability: "100%",
    relatedFeature: "results",
    icon: "ti-skull"
  },
  {
    id: "rec-056",
    title: "Dışkıda Nişasta Analizi",
    content: "Dışkıda nişasta oranının %3'ün üzerinde olması, rasyondaki enerjinin sindirilmeden çöpe gittiğini gösterir. Bu durum tanelerin bütün kalması veya sindirim hızının uyumsuzluğu ile ilgilidir.",
    category: "Sağlık / Rumen",
    scientificSource: "Cumberland Valley Analytical",
    reliability: "95%",
    relatedFeature: "observations",
    icon: "ti-search"
  },
  {
    id: "rec-057",
    title: "Somatik Hücre Sayısı (SCC) ve Antioksidanlar",
    content: "Sürüde SCC artışı mastitisin işaretidir. Rasyona Vitamin E (günde 1000 IU), Selenyum ve Çinko eklenmesi bağışıklık sistemini güçlendirerek SCC'yi düşürür.",
    category: "Sağlık / Rumen",
    scientificSource: "Journal of Dairy Science",
    reliability: "98%",
    relatedFeature: "ration",
    icon: "ti-virus"
  },
  {
    id: "rec-058",
    title: "Sol Ventriküler Kalp Yetersizliği ve Rakım",
    content: "Yüksek rakımlı çiftliklerde (1500m+) sığırlarda pulmoner arteriyel hipertansiyon (Brisket hastalığı) riski artar. Mineral dengesi ve bakır/çinko oranları bu stresörleri yönetmede yardımcı olur.",
    category: "Sağlık / Rumen",
    scientificSource: "Veterinary Clinics of North America",
    reliability: "85%",
    relatedFeature: "ration",
    icon: "ti-heart-broken"
  },
  {
    id: "rec-059",
    title: "Abomasum Deplasmanı (Mide Dönmesi)",
    content: "Doğum sonrası boşalan karın boşluğunda abomasumun yer değiştirmesi (LDA), genellikle rumen boş kalırsa veya ketozise bağlı kas tonusu düşerse olur. peNDF ve kesintisiz yem tüketimi en iyi koruyucudur.",
    category: "Sağlık / Rumen",
    scientificSource: "Journal of Dairy Science",
    reliability: "100%",
    relatedFeature: "ration",
    icon: "ti-alert-triangle"
  },
  {
    id: "rec-060",
    title: "Deplase Abomasum Önleme: Yem Boyutu",
    content: "Geçiş dönemi inek rasyonlarında yonca veya saman kıyım boyutunun 3-5 cm arasında olması, rumen matını (rumen mat) oluşturarak abomasumun yukarı kaymasını fiziksel olarak zorlaştırır.",
    category: "Sağlık / Rumen",
    scientificSource: "NASEM (2021)",
    reliability: "95%",
    relatedFeature: "ration",
    icon: "ti-cut"
  },
  {
    id: "rec-061",
    title: "Laminitis (Tırnak Hastalıkları) ve Rasyon İlişkisi",
    content: "Kronik SARA, rumen endotoksinlerinin kana karışmasına neden olur; bu endotoksinler tırnak içindeki kılcal damarları tahrip ederek laminitise ve taban ülserlerine yol açar. Çözüm rumen pH'ını stabil tutmaktır.",
    category: "Sağlık / Rumen",
    scientificSource: "Journal of Dairy Science",
    reliability: "100%",
    relatedFeature: "observations",
    icon: "ti-stretching"
  },
  {
    id: "rec-062",
    title: "Sıcak Çarpması (Heat Stroke) Önlemi",
    content: "Aşırı sıcak havalarda inekler soğumak için daha fazla kanı deriye gönderir, bağırsaklardan kan çekilir (Leaky Gut Syndrome). Rasyona maya ve organik çinko eklenmesi bağırsak bariyerini korur.",
    category: "Sağlık / Rumen",
    scientificSource: "Dr. Lance Baumgard (Iowa State)",
    reliability: "95%",
    relatedFeature: "ration",
    icon: "ti-sun-off"
  },
  {
    id: "rec-063",
    title: "Gebe İneklerde İkiz Gebelik Stresi",
    content: "İkiz gebelik taşıyan inekler, kuru dönemde %20 daha fazla enerji ve proteine ihtiyaç duyar. Bu inekler doğuma 10-14 gün kala laktasyon veya erken close-up rasyonuna alınmalıdır.",
    category: "Kuru Dönem / Geçiş",
    scientificSource: "Journal of Dairy Science",
    reliability: "90%",
    relatedFeature: "ration",
    icon: "ti-users"
  },
  {
    id: "rec-064",
    title: "Rumen Yıkılabilir Nişasta ve DMI Sınırı",
    content: "Eğer rasyondaki nişastanın tamamına yakını Hızlı Yıkılabilir (fermente olabilir) formdaysa (örneğin aşırı ince mısır veya buğday), inek asidoz hissettiği için yem yemeyi keser (DMI düşer).",
    category: "Sağlık / Rumen",
    scientificSource: "NASEM (2021)",
    reliability: "95%",
    relatedFeature: "results",
    icon: "ti-arrow-bar-down"
  },
  {
    id: "rec-065",
    title: "Mastitis ve Kuruya Çıkarma Rasyonu",
    content: "Süt verimi 20 kg üzerinde olan inekler kuruya çıkarılırken mastitis riski altındadır. Kuruya ayrımdan 5-7 gün önce konsantre yemin tamamen kesilmesi süt yapımını hızlıca durdurur.",
    category: "Kuru Dönem / Geçiş",
    scientificSource: "Journal of Dairy Science",
    reliability: "98%",
    relatedFeature: "ration",
    icon: "ti-droplet-off"
  },

  // --- BARINAK VE REFAH (10) ---
  {
    id: "rec-066",
    title: "Dinlenme Süresi (Resting Time)",
    content: "İnekler günde 12-14 saat yatarak geviş getirmelidir. İnek yattığında memeden geçen kan akımı %30 artar. Bu her 1 saatlik ekstra yatış, günde 1-1.5 kg ekstra süt demektir.",
    category: "Barınak ve Refah",
    scientificSource: "Dr. Rick Grant (Miner Institute)",
    reliability: "100%",
    relatedFeature: "observations",
    icon: "ti-bed"
  },
  {
    id: "rec-067",
    title: "Aydınlatma (Fotoperiyot)",
    content: "Laktasyondaki ineklere günde 16 saat ışık (150-200 lux) ve 8 saat karanlık sağlanması, prolaktin hormonunu uyararak süt verimini %8-10 artırır.",
    category: "Barınak ve Refah",
    scientificSource: "Journal of Dairy Science",
    reliability: "98%",
    relatedFeature: "observations",
    icon: "ti-bulb"
  },
  {
    id: "rec-068",
    title: "Kuru Dönemde Fotoperiyot",
    content: "Laktasyonun aksine, kuru dönemdeki ineklere kısa gün (8 saat ışık, 16 saat karanlık) sağlanması, bir sonraki laktasyonda bağışıklık ve süt verimini artırır.",
    category: "Barınak ve Refah",
    scientificSource: "University of Maryland Extension",
    reliability: "90%",
    relatedFeature: "observations",
    icon: "ti-moon"
  },
  {
    id: "rec-069",
    title: "Durak (Stall) Tasarımı ve Konforu",
    content: "Diz testini yapın: Durağın zeminine dizinizi sertçe vurduğunuzda acıyorsa inek için de yeterince yumuşak değildir. Kum yataklık altın standarttır; mastitis patojenlerini barındırmaz.",
    category: "Barınak ve Refah",
    scientificSource: "University of Wisconsin (Dairyland Initiative)",
    reliability: "100%",
    relatedFeature: "observations",
    icon: "ti-home-2"
  },
  {
    id: "rec-070",
    title: "Yem İtme Sıklığı",
    content: "İnekler taze atılmış yeme değil, karıştırılmış/itilmiş yeme de tepki verir. Yemin günde en az 6-8 kez ineklerin önüne itilmesi (feed push-up) DMI'ı artırır.",
    category: "Barınak ve Refah",
    scientificSource: "Penn State Extension",
    reliability: "99%",
    relatedFeature: "observations",
    icon: "ti-tractor"
  },
  {
    id: "rec-071",
    title: "Stoklama Yoğunluğu (Overcrowding)",
    content: "Yemlik alanında ve duraklarda kapasitenin %110-%120 oranında aşılması, hiyerarşik olarak alt konumdaki (ilk laktasyon) ineklerin aç kalmasına ve verimlerinin ciddi düşmesine yol açar.",
    category: "Barınak ve Refah",
    scientificSource: "Journal of Dairy Science",
    reliability: "100%",
    relatedFeature: "herd",
    icon: "ti-users"
  },
  {
    id: "rec-072",
    title: "Havalandırma ve Fan Kurulumu",
    content: "THI (Sıcaklık ve Nem İndeksi) 68'i aştığında inekler ısı stresi yaşar. Bekleme salonuna (sağımhane girişi) ve yemlik hattına dakikada 2.5 - 3 metre/saniye hızla hava üfleyen fanlar kurulmalıdır.",
    category: "Barınak ve Refah",
    scientificSource: "NASEM (2021)",
    reliability: "95%",
    relatedFeature: "observations",
    icon: "ti-wind"
  },
  {
    id: "rec-073",
    title: "Zemin Kayganlığı",
    content: "Beton zeminlerin kaygan olması, ineklerin kızgınlık (atlama) davranışını göstermesini engeller ve düşmeye bağlı yaralanmaları/sürüden çıkarmaları artırır. Zeminler yivlenmelidir.",
    category: "Barınak ve Refah",
    scientificSource: "Journal of Dairy Science",
    reliability: "95%",
    relatedFeature: "observations",
    icon: "ti-road"
  },
  {
    id: "rec-074",
    title: "Sinek Mücadelesi",
    content: "Sinekler inekleri rahatsız ederek yeme gitmelerini engeller ve kan yoluyla anaplazmoz gibi hastalıkları bulaştırır. Ahır çevresinde mekanik ve kimyasal fly-control programı uygulanmalıdır.",
    category: "Barınak ve Refah",
    scientificSource: "Veterinary Entomology",
    reliability: "90%",
    relatedFeature: "observations",
    icon: "ti-bug"
  },
  {
    id: "rec-075",
    title: "Yemliğin Gölgede Olması",
    content: "Eğer inekler açık veya yarı açık sundurmada besleniyorsa, yemlik hattının günün en sıcak saatlerinde güneş almaması sağlanmalıdır. Güneşte ısınan TMR sekonder fermantasyona girer ve bozulur.",
    category: "Barınak ve Refah",
    scientificSource: "Journal of Dairy Science",
    reliability: "98%",
    relatedFeature: "observations",
    icon: "ti-sun"
  },

  // --- SU TÜKETİMİ (10) ---
  {
    id: "rec-076",
    title: "Su Trog Alanı",
    content: "Sürüdeki her bir sağmal inek için sulukta en az 10 cm (kuru inekler için 5 cm) doğrusal alan hesaplanmalıdır. Gruptaki ineklerin en az %15-20'si aynı anda su içebilmelidir.",
    category: "Su Tüketimi",
    scientificSource: "University of Wisconsin (Dairyland Initiative)",
    reliability: "100%",
    relatedFeature: "herd",
    icon: "ti-droplet"
  },
  {
    id: "rec-077",
    title: "Sulukların Temizliği",
    content: "İnekler burunlarıyla su içerler; suluğun dibindeki çamur, alg veya gübre kalıntıları su tüketimini %20 oranında azaltabilir. Suluklar haftada en az iki kez fırçayla yıkanmalıdır.",
    category: "Su Tüketimi",
    scientificSource: "Penn State Extension",
    reliability: "100%",
    relatedFeature: "observations",
    icon: "ti-wash"
  },
  {
    id: "rec-078",
    title: "Su Akış Hızı",
    content: "İnekler dakikada 15-20 litre su içebilirler. Sulukların su basıncı (akış hızı), ineğin içme hızına yetişebilmeli ve su yüzeyi seviyesini koruyabilmelidir.",
    category: "Su Tüketimi",
    scientificSource: "NASEM (2021)",
    reliability: "95%",
    relatedFeature: "observations",
    icon: "ti-gauge"
  },
  {
    id: "rec-079",
    title: "Sağımhane Çıkışı Su Temini",
    content: "İnekler günlük su ihtiyaçlarının yaklaşık %30-40'ını sağımdan hemen sonra içerler. Sağımhane çıkış koridorunda geniş ve her zaman temiz suluklar bulundurulması elzemdir.",
    category: "Su Tüketimi",
    scientificSource: "Journal of Dairy Science",
    reliability: "99%",
    relatedFeature: "observations",
    icon: "ti-door-exit"
  },
  {
    id: "rec-080",
    title: "Suyun Kalitesi (Sülfat ve Klorür)",
    content: "İçme suyundaki sülfat 1000 mg/L, klorür ise 500 mg/L değerlerini aşmamalıdır. Yüksek sülfat ishal yaparken, iz minerallerin (bakır, çinko) emilimini bağlayarak engeller.",
    category: "Su Tüketimi",
    scientificSource: "NASEM (2021)",
    reliability: "95%",
    relatedFeature: "ration",
    icon: "ti-flask"
  },
  {
    id: "rec-081",
    title: "Suda Demir Oranı",
    content: "Suda demir miktarının 0.3 mg/L üzerinde olması suya pas tadı vererek tüketimi azaltır; aynı zamanda ineklerde bakır eksikliğine neden olur ve bağışıklığı zayıflatır.",
    category: "Su Tüketimi",
    scientificSource: "Journal of Dairy Science",
    reliability: "90%",
    relatedFeature: "ration",
    icon: "ti-droplet-half-2"
  },
  {
    id: "rec-082",
    title: "Kışın Donmaya Karşı Suluk Isıtıcıları",
    content: "Su sıcaklığı ineklerin içme davranışını etkiler. Özellikle kış aylarında suyun donması veya aşırı soğuk olması (5°C altı) su tüketimini ve dolayısıyla süt verimini engeller.",
    category: "Su Tüketimi",
    scientificSource: "University of Nebraska Extension",
    reliability: "90%",
    relatedFeature: "observations",
    icon: "ti-snowflake"
  },
  {
    id: "rec-083",
    title: "Nitrat / Nitrit Toksisitesi (Suda)",
    content: "Kuyu sularında tarımsal gübre sızması nedeniyle Nitrat oranının 44 mg/L'yi geçmesi abortuslara (yavru atma) ve methemoglobinemiye (oksijen yetersizliği) sebep olur.",
    category: "Su Tüketimi",
    scientificSource: "NASEM (2021)",
    reliability: "98%",
    relatedFeature: "observations",
    icon: "ti-skull"
  },
  {
    id: "rec-084",
    title: "Yazın Sıcaklık Stresinde Su",
    content: "Isı stresi (THI>72) durumunda su tüketimi normalin %20-50 üzerine çıkar. Yaz aylarında ek su istasyonları kurulması ve suların gölgede kalması hayat kurtarıcıdır.",
    category: "Su Tüketimi",
    scientificSource: "NASEM (2021)",
    reliability: "100%",
    relatedFeature: "ration",
    icon: "ti-sun"
  },
  {
    id: "rec-085",
    title: "Su Yüksekliği (Trog Yüksekliği)",
    content: "Sulukların yerden yüksekliği ineklerin doğal içme pozisyonuna (hafif eğilerek) uygun olarak 60-80 cm arasında olmalıdır. Çok yüksek veya alçak suluklar ergonomik değildir.",
    category: "Su Tüketimi",
    scientificSource: "Penn State Extension",
    reliability: "85%",
    relatedFeature: "observations",
    icon: "ti-ruler"
  },

  // --- BUZAĞI VE DÜVE (15) ---
  {
    id: "rec-086",
    title: "Kolostrum Kalite Ölçümü (Brix Refraktometre)",
    content: "Kolostrumun kalitesini gözle anlamak imkansızdır. Bir Brix refraktometre kullanılarak skorun %22 ve üzerinde çıkması, 50g/L IgG sınırını aştığını kanıtlar.",
    category: "Buzağı ve Düve",
    scientificSource: "Journal of Dairy Science",
    reliability: "100%",
    relatedFeature: "observations",
    icon: "ti-focus-2"
  },
  {
    id: "rec-087",
    title: "Buzağılarda Süt İkamesi (Mama) vs Tam Süt",
    content: "Buzağı maması (Milk Replacer) kullanılacaksa, protein kaynağı tamamen süt ürünlerinden (whey, kazein) gelmeli, %20-24 protein ve %20 yağ içermelidir. Bitkisel proteinler 3 haftadan önce sindirilemez.",
    category: "Buzağı ve Düve",
    scientificSource: "NASEM (2021)",
    reliability: "98%",
    relatedFeature: "ration",
    icon: "ti-bottle"
  },
  {
    id: "rec-088",
    title: "Buzağılarda Serbest Su",
    content: "Yeni doğan buzağılara yaşamın 1. veya 2. gününden itibaren temiz, serbest su sunulmalıdır. Su, başlangıç yemi (calf starter) tüketimini ve rumen gelişimini teşvik eder.",
    category: "Buzağı ve Düve",
    scientificSource: "Journal of Dairy Science",
    reliability: "100%",
    relatedFeature: "observations",
    icon: "ti-droplet"
  },
  {
    id: "rec-089",
    title: "Başlangıç Yemi (Calf Starter) Tüketimi",
    content: "Buzağılar ardışık üç gün boyunca günde en az 1-1.5 kg pelet/başlangıç yemi tüketebilir hale gelmeden sütten kesilmemelidir. Bu genelde 6-8. haftalara denk gelir.",
    category: "Buzağı ve Düve",
    scientificSource: "NASEM (2021)",
    reliability: "100%",
    relatedFeature: "ration",
    icon: "ti-cookie"
  },
  {
    id: "rec-090",
    title: "Sütten Kesme Süreci (Weaning Transition)",
    content: "Sütten kesme işlemi aniden yapılmamalıdır. Son 7-10 gün içinde verilen süt miktarı yavaş yavaş yarıya indirilerek, buzağının katı yeme yönelmesi teşvik edilmelidir.",
    category: "Buzağı ve Düve",
    scientificSource: "Journal of Dairy Science",
    reliability: "95%",
    relatedFeature: "observations",
    icon: "ti-trending-down"
  },
  {
    id: "rec-091",
    title: "Buzağı Rasyonunda Yonca/Saman Kullanımı",
    content: "Sütten kesimden önce buzağılara fazla miktarda kaba yem (yonca, saman) verilmesi rumen hacmini artırır ancak papilla (emici yüzey) gelişimini sağlamaz. Papilla gelişimi için nişasta (tahıl) fermente olmalıdır.",
    category: "Buzağı ve Düve",
    scientificSource: "Dr. Jud Heinrichs (Penn State)",
    reliability: "98%",
    relatedFeature: "ration",
    icon: "ti-plant"
  },
  {
    id: "rec-092",
    title: "Soğuk Havalarda Buzağı Beslemesi",
    content: "Ortam sıcaklığı 10°C'nin altına düştüğünde buzağılar vücut ısılarını korumak için ekstra enerji harcar. Süt miktarı, mama konsantrasyonu veya öğün sayısı artırılmalıdır.",
    category: "Buzağı ve Düve",
    scientificSource: "NASEM (2021)",
    reliability: "100%",
    relatedFeature: "ration",
    icon: "ti-snowflake"
  },
  {
    id: "rec-093",
    title: "Koksidiyoz (Coccidiosis) Önlemi",
    content: "Buzağı ve düve rasyonlarına İonoforlar (Lasalocid, Monensin) veya dekoquinate gibi spesifik antikoksidiyaller eklemek, bağırsak hasarını önler ve günlük canlı ağırlık artışını garantiye alır.",
    category: "Buzağı ve Düve",
    scientificSource: "Veterinary Parasitology",
    reliability: "95%",
    relatedFeature: "ration",
    icon: "ti-bug-off"
  },
  {
    id: "rec-094",
    title: "İlk Tohumlama Boy ve Ağırlığı",
    content: "Holstein düveler ergin vücut ağırlıklarının %55'ine (yaklaşık 360-380 kg) ve uygun cidago yüksekliğine (yaklaşık 125-130 cm) ulaştıklarında (13-15 aylıkken) ilk tohumlamaları yapılmalıdır.",
    category: "Buzağı ve Düve",
    scientificSource: "NASEM (2021)",
    reliability: "100%",
    relatedFeature: "observations",
    icon: "ti-calendar-event"
  },
  {
    id: "rec-095",
    title: "Düvelerde Aşırı Enerji ve Yağlanma",
    content: "Düvelere ergenlik öncesi (puberte, 3-9 ay arası) aşırı enerji verilmesi, meme dokusunda salgı yapan hücreler yerine yağ birikmesine (fatty udder) neden olarak ömür boyu süt verimini düşürür.",
    category: "Buzağı ve Düve",
    scientificSource: "Journal of Dairy Science",
    reliability: "98%",
    relatedFeature: "ration",
    icon: "ti-alert-triangle"
  },
  {
    id: "rec-096",
    title: "Grup Barınaklarına Geçiş (Sosyalleşme)",
    content: "Buzağıların bireysel kulübelerden grup bölmelerine alınması, sütten kesimden hemen sonra değil; en az 1-2 hafta sonra yapılmalıdır. İki stres kaynağı (sütten kesme ve gruplama) aynı anda yaşatılmamalıdır.",
    category: "Barınak ve Refah",
    scientificSource: "Journal of Dairy Science",
    reliability: "90%",
    relatedFeature: "herd",
    icon: "ti-users"
  },
  {
    id: "rec-097",
    title: "Kriptosporidiyoz ve Rotavirüs",
    content: "İlk 3 haftada görülen şiddetli buzağı ishallerinin ana sebebi hijyen eksikliği ve kötü kolostrum yönetimidir. Kulübeler her kullanımdan sonra güneş altında kurumaya bırakılmalı ve dezenfekte edilmelidir.",
    category: "Buzağı ve Düve",
    scientificSource: "Veterinary Clinics",
    reliability: "95%",
    relatedFeature: "observations",
    icon: "ti-shield"
  },
  {
    id: "rec-098",
    title: "İonoforların Düvelere Etkisi",
    content: "Monensin veya Lasalosid gibi ionoforlar düve rasyonuna eklendiğinde yemden yararlanmayı artırır ve puberte (ergenlik) yaşı 1-2 ay öne çekilebilir.",
    category: "Buzağı ve Düve",
    scientificSource: "Journal of Dairy Science",
    reliability: "95%",
    relatedFeature: "ration",
    icon: "ti-rocket"
  },
  {
    id: "rec-099",
    title: "Göbek Kordonu Bakımı",
    content: "Doğumdan hemen sonra buzağının göbek kordonu %7'lik tentürdiyot solüsyonuna daldırılmalıdır (spreyleme yeterli değildir). Bu işlem omfaloflebit (göbek yangısı) ve eklem iltihaplarını (joint ill) önler.",
    category: "Buzağı ve Düve",
    scientificSource: "Journal of Dairy Science",
    reliability: "100%",
    relatedFeature: "observations",
    icon: "ti-first-aid"
  },
  {
    id: "rec-100",
    title: "Ağız Sütü (Kolostrum) Pastörizasyonu",
    content: "Kolostrumun 60°C'de 60 dakika (daha yüksek sıcaklık antikorları pişirir) pastörize edilmesi, Johne hastalığı, Salmonella ve E.coli bulaşmasını önler ve antikor emilim verimini (IgG transferi) iyileştirir.",
    category: "Buzağı ve Düve",
    scientificSource: "Penn State Extension",
    reliability: "90%",
    relatedFeature: "ration",
    icon: "ti-flame"
  }
];

const targetPath = path.join(__dirname, 'rasyon-app', 'src', 'data', 'recommendations.js');
let content = fs.readFileSync(targetPath, 'utf8');

// We want to insert these before the closing bracket of the array
// The array ends with `\n];\n` or similar.
const newObjectsStr = newRecs.map(r => JSON.stringify(r, null, 2)).join(',\n  ');

if(content.includes('];')) {
  // Insert exactly before ];
  content = content.replace(/\];[\s]*$/, ',\n  ' + newObjectsStr + '\n];\n');
  fs.writeFileSync(targetPath, content);
  console.log("Successfully appended 80 recommendations.");
} else {
  console.log("Failed to find end of array.");
}
