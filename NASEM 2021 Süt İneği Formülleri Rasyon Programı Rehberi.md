# NASEM 2021 Süt İneği Formülleri: Rasyon Programı Rehberi

Oct 9, 2026 · @Barış Özkan

Programda NASEM (2021) seçildiğinde bakım MP'si üç ayrı kalemle, süt MP'si ise kayıpların toplamı üzerinden hesaplanmalı; NRC 2001 katsayıları karıştırılmamalı. Test ineği için (600 kg, 30 kg süt, 105. gün) beklenen MP yaklaşık 1.970 g'dır, programın verdiği 2.334 g yüksektir.

## Doğrulama durumu

Aşağıdaki tabloda hangi formülün yayınlanmış kaynaklardan teyit edildiği, hangisinin hatırlanarak yazıldığı ayrılmıştır. "Hatırlanan" satırlarını NASEM (2021) kitabından programa girmeden önce kontrol edin.

| Formül | Durum | Not |
| --- | --- | --- |
| Bakım NEL = 0,10 × CA^0,75 | Teyit edildi | NRC 2001'deki 0,08'den yükseltildi |
| Tüy/deri proteini = 0,20 × CA^0,60 (gerçek protein oranı 0,85) | Teyit edildi |  |
| Endojen idrar proteini = 53 mg N/kg CA × 6,25 | Teyit edildi | Verimi %100 |
| Metabolik dışkı proteini = (11,62 + 0,134 × NDF) × KMT × 0,73 | Teyit edildi | NDF = rasyon NDF'si, % KM |
| Ca bakım = 0,9 g/kg KMT; süt = 1,03 g/kg | Teyit edildi | Emilim: konsantre 0,60, kaba yem 0,40 |
| P bakım = 1 g/kg KMT + 0,0006 g/kg CA; süt = 0,90 g/kg | Teyit edildi | Varsayılan emilim 0,72 |
| Gebelikte MP verimi 0,33, idrar kaybı verimi %100 | Teyit edildi |  |
| KMT Eq. 2-1: yapı ve değişkenler | Kısmen teyit | Değişkenler doğrulandı, katsayılar hatırlandı |
| Süt NEL katsayıları (0,0929 / 0,0585 / 0,0395) | Hatırlanan | Protein katsayısı 0,0563 de olabilir, fark yaklaşık 0,2 Mcal |
| Süt MP hedef verimi 0,69 | Hatırlanan | 0,67 alınırsa MP yaklaşık 50 g artar |
| ECM referans enerjisi | Belirsiz | 0,70 veya 0,75 Mcal/kg, seçim açıkça yazılmalı |
| Gebelik NEL ve MP denklemleri | Doğrulanmadı | NASEM 2021 değiştirdi, bu raporda verilmedi |

## Kuru madde tüketimi

NASEM Eq. 2-1 yalnızca hayvan özelliklerinden KMT tahmin eder; rasyon girdisi gerektirmez. Parite 1 = ilk doğum, 2 = çok doğurmuş olarak kodlanır.

```latex
KMT = \left[3{,}7 + 5{,}7\,P + 0{,}305\,NEL_{süt} + 0{,}022\,CA + (-0{,}689 - 1{,}87\,P)\,VKS\right] \times \left[1 - (0{,}212 + 0{,}136\,P)\,e^{-0{,}053\,GS}\right]
```

P = parite, NEL\_süt = süt enerji çıkışı (Mcal/gün), CA = canlı ağırlık (kg), VKS = vücut kondisyon skoru (1-5), GS = laktasyon günü. Süt enerjisi:

```latex
NEL_{süt} = Süt \times (0{,}0929\,Y + 0{,}0585\,P_{gerçek} + 0{,}0395\,L)
```

Y, P\_gerçek ve L süt yağı, gerçek protein ve laktoz oranlarıdır (%). Test ineği için NEL\_süt = 22,45 Mcal/gün ve KMT = 21,8 kg/gün çıkar.

## NEL ihtiyacı

Bakım ihtiyacı NRC 2001'deki 0,08 yerine 0,10 Mcal/kg CA^0,75 alınır. Gebelik ve canlı ağırlık değişimi yoksa toplam ihtiyaç bakım ile sütün toplamıdır.

```latex
NEL_{toplam} = 0{,}10 \times CA^{0{,}75} + NEL_{süt}
```

Test ineği: 0,10 × 121,2 + 22,45 = 34,6 Mcal/gün, yani rasyonda yaklaşık 1,58 Mcal NEL/kg KM.

## MP ihtiyacı

NASEM'de endojen idrar kaybı MP arzından değil, ihtiyaçtan düşülür ve verimi %100'dür. Diğer kalemler hedef verimle bölünür. Metabolik dışkı kalemi için rasyon NDF'si zorunlu girdidir.

```latex
TP_{tüy} = 0{,}20 \times CA^{0{,}60} \times 0{,}85
```

```latex
TP_{dışkı} = (11{,}62 + 0{,}134 \times NDF) \times KMT \times 0{,}73
```

```latex
MP_{idrar} = 53 \times 6{,}25 \times CA / 1000
```

```latex
TP_{süt} = Süt \times 10 \times P_{gerçek}
```

```latex
MP = \frac{TP_{tüy} + TP_{dışkı} + TP_{süt} + TP_{büyüme} + MP_{gebelik}\,\text{(ayrı verim 0,33)}}{Verim_{hedef}} + MP_{idrar}
```

Gebelik kalemi bu formülde verim 0,33 ile ayrı bölünür, 0,69 ile değil. Hedef verim için 0,69 kullanın; 0,67 sonuca yaklaşık 50 g ekler. Verim, süt protein/KMT oranına bağlı kayan bir formülle değiştirilmemeli: önerilen "0,69 − 0,012 × süt proteini/KMT" NASEM'de yoktur ve bu inek için 0,689 verir, yani fiilen sabittir.

## Ca ve P

İki mineral için de net ihtiyaç bakım ile süt kayıplarının toplamıdır; rasyondan gereken miktar emilim katsayısına bölünerek bulunur.

```latex
Ca_{net} = 0{,}9 \times KMT + 1{,}03 \times Süt
```

```latex
P_{net} = 1{,}0 \times KMT + 0{,}0006 \times CA + 0{,}90 \times Süt
```

Ca emilimi, rasyondaki kaba yem ve konsantre payına göre ağırlıklandırılır: konsantre 0,60, kaba yem 0,40. P için varsayılan emilim 0,72'dir. Mineral katkılarının emilim katsayısı ayrıdır ve bu raporda verilmemiştir.

## Programdaki formüllerde düzeltilecekler

Ekran görüntüsündeki "NASEM 2021" formüllerinin çoğu NASEM'e ait değil. Aşağıdaki tabloda her madde için yapılacak düzeltme verilmiştir.

| Programdaki formül | Sorun | Yapılacak |
| --- | --- | --- |
| İdrar MP = 4,1 × CA^0,5 ve 2,75 × CA^0,5 | NRC 2001 katsayısı, NASEM'de değil | 53 × 6,25 × CA / 1000 (g), verim %100 |
| Deri/kıl = 0,3 × CA^0,6 | NRC 2001'de MP olarak, NASEM'de farklı | 0,20 × CA^0,60 × 0,85 gerçek protein, sonra hedef verime böl |
| Dışkı = 1,9 × KMT × 1000 | Birim hatalı, NDF yok, 21,8 kg KMT için yaklaşık 41.000 g verir | (11,62 + 0,134 × NDF) × KMT × 0,73 |
| Verim = 0,69 − 0,012 × süt proteini/KMT | NASEM'de yok, fiilen sabit kalır | Sabit 0,69 kullan, NASEM'in tam modelini sonra ekle |
| Gebelik: e^(8,5357 − 0,00299 × gün) | Gün arttıkça azalır, geç gebelik sıçramasını üretemez | NASEM 2021 gebelik denklemlerini kitaptan doğrula; o zamana kadar NRC 2001 doğrusal formülünü kullan ve etiketini "NRC 2001" yap |
| NRC 2001 doğrusal gebelik formülü "hatalı" etiketi | Formül hatalı değil, yalnızca NRC 2001'e ait | Etiketi düzelt |

Programın bu inek için verdiği 2.334 g MP, doğru değer olan yaklaşık 1.970 g'dan 365 g yüksektir. Bu farkın büyük kısmı dışkı kaleminden gelmektedir.

## Test vakası

Programınızı doğrulamak için 600 kg, 30 kg süt (%4 yağ, %3,2 gerçek protein, %4,8 laktoz), 105. gün, çok doğurmuş, VKS 3, gebe değil, NDF %32, %50 kaba yem inek kullanılabilir.

| Çıktı | Beklenen değer |
| --- | --- |
| KMT | 21,8 kg/gün |
| NEL toplam | 34,6 Mcal/gün (bakım 12,1 + süt 22,4) |
| Tüy/deri proteini | 7,9 g |
| Metabolik dışkı proteini | 253 g |
| Süt gerçek proteini | 960 g |
| Endojen idrar | 199 g |
| MP toplam | yaklaşık 1.970 g/gün |
| Ca (brüt) | yaklaşık 101 g/gün |
| P (brüt) | yaklaşık 68 g/gün |
| ECM (0,70 Mcal/kg referans) | 32,1 kg/gün |
| ECM (0,75 Mcal/kg ICAR referansı) | 29,9 kg/gün |

Küçük sapmalar (±%1) süt enerjisi katsayısı ve yuvarlamadan gelebilir. MP'de ±50 g'dan büyük fark varsa dışkı veya verim kalemine bakın.

## Kaynaklar

Aşağıdaki sayfalar arama sonuçlarında özetleriyle görüldü; tam metinleri açılmadı. Kitaptaki tablolardan doğrulama önerilir.

- [NASEM 2021 net protein alt modelleri, Animals (MDPI)](https://pmc.ncbi.nlm.nih.gov/articles/PMC12291680) (tüy/deri, idrar, metabolik dışkı protein denklemleri)
- [P ve Ca ihtiyaçları için yeni sistem, PLOS ONE](https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0308889) (NASEM Ca ve P denklemleri ve emilim katsayıları)
- [Weiss, Where are we today with requirements of the modern dairy cow](https://www.txanc.org/Proceedings/2022/2%20-%20Weiss1%20-%20Where%20are%20we%20today%20with%20requirements%20of%20the%20modern%20dairy%20cow.pdf) (bakım enerjisi 0,08'den 0,10'a)
- [NASEM 2021 modeli ile süt protein verimi tahmini, Québec (ScienceDirect)](https://www.sciencedirect.com/science/article/pii/S2666910224000747) (MP bileşenleri ve kg KM başına MP aralığı)
- [NASEM 2021 süt yağı denklemi dış değerlendirmesi (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC10505774/) (KMT denkleminin değişkenleri ve parite kodlaması)
