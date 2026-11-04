export interface Question {
  q: string;
  options: string[];
  /** index of the correct option */
  a: number;
}
export interface ReadingText {
  id: string;
  title: string;
  body: string;
  questions: Question[];
}

/** Ölçüm metinleri – 5 soru. Seviye belirleme ve haftalık ölçümlerde sırayla kullanılır. */
export const TEST_TEXTS: ReadingText[] = [
  {
    id: "t-aricilik",
    title: "Kovanın Görünmeyen Düzeni",
    body: `Bir bal arısı kovanı dışarıdan bakıldığında karmaşık bir uğultudan ibaret gibi görünür. Oysa içeride, binlerce arının her birinin belirli bir görevi vardır. Kovanın merkezinde yumurtlayan tek bir kraliçe bulunur. Kraliçe yaz aylarında günde iki bine yakın yumurta bırakabilir. Erkek arılar sayıca azdır ve tek görevleri başka kovanlardan gelen kraliçelerle çiftleşmektir.

Kovandaki işlerin neredeyse tamamını dişi işçi arılar yürütür. İlginç olan, işçi arının görevinin yaşına göre değişmesidir. Hayatının ilk günlerinde petek gözlerini temizler. Birkaç gün sonra larvaları besleyen bakıcıya dönüşür. Daha sonra balmumu üretip petek örer, ardından kovanın girişinde nöbet tutar. Ancak yaklaşık üç haftalık olduğunda dışarı çıkıp çiçeklerden nektar ve polen toplamaya başlar.

Toplayıcı arılar buldukları zengin çiçek kaynaklarını diğerlerine dans ederek anlatır. Kaynak yakınsa daire şeklinde bir dans yapılır. Kaynak uzaktaysa arı, sekiz rakamına benzeyen bir yol çizerek titreşir. Dansın yönü güneşe göre çiçeklerin yönünü, titreşimin süresi ise uzaklığı bildirir. Bu keşfi yapan Avusturyalı bilim insanı Karl von Frisch, çalışmaları nedeniyle 1973 yılında Nobel Ödülü almıştır.

Bal yapımı da uzun bir emeğin sonucudur. Bir kilogram bal için arıların milyonlarca çiçeği ziyaret etmesi gerekir. Toplanan nektar, kovanda arıdan arıya aktarılırken içindeki su azalır. Ardından petek gözlerine yerleştirilir ve arılar kanat çırparak fazla suyun buharlaşmasını sağlar. Kıvamı yeterli hale gelen balın üzeri ince bir mum tabakasıyla kapatılır.

Arılar yalnızca bal üretmez. Bitkilerin tozlaşmasına yardım ederek meyve ve sebze üretiminin önemli bir bölümünü mümkün kılarlar. Bu nedenle arı sayısındaki azalma, bilim insanlarının yakından izlediği bir konudur.`,
    questions: [
      { q: "İşçi arıların görevini belirleyen temel etken nedir?", options: ["Vücut büyüklükleri", "Yaşları", "Kraliçenin seçimi", "Mevsim"], a: 1 },
      { q: "Toplayıcı arı kaynağın uzak olduğunu nasıl bildirir?", options: ["Daire şeklinde dans ederek", "Sekiz rakamına benzeyen bir yol çizip titreşerek", "Kovanın girişinde bekleyerek", "Kanat çırparak ses çıkararak"], a: 1 },
      { q: "Arı dansını keşfeden bilim insanı hangi ödülü almıştır?", options: ["Nobel Ödülü", "Fields Madalyası", "Pulitzer Ödülü", "Bilim Akademisi Ödülü"], a: 0 },
      { q: "Balın kıvamlanması için arılar ne yapar?", options: ["Nektarı güneşte kurutur", "Kanat çırparak fazla suyun buharlaşmasını sağlar", "Nektara polen karıştırır", "Bal gözlerini sürekli açık tutar"], a: 1 },
      { q: "Metne göre arı sayısındaki azalma neden önemlidir?", options: ["Balın fiyatı arttığı için", "Arılar tozlaşmaya yardım ederek meyve-sebze üretimini mümkün kıldığı için", "Kovanlar boş kaldığı için", "Kraliçe arılar yalnız kaldığı için"], a: 1 },
    ],
  },
  {
    id: "t-kapadokya",
    title: "Peri Bacalarının Hikâyesi",
    body: `Kapadokya'yı ilk kez görenler, sanki başka bir gezegene adım atmış gibi hisseder. Vadilerde yükselen, tepesinde şapka taşıyan koni biçimli kayalar bölgenin simgesidir. Halk arasında peri bacası denen bu oluşumların hikâyesi milyonlarca yıl önce başlar.

Bölgedeki Erciyes, Hasandağı ve Göllüdağ gibi volkanlar uzun süre boyunca püskürmüş, çevreye kalın kül ve lav tabakaları yaymıştır. Zamanla sertleşen küller, tüf adı verilen yumuşak bir kayaç oluşturmuştur. Tüfün üzerinde ise yer yer bazalt gibi daha sert kayaç katmanları bulunur.

Sonraki dönemlerde yağmur, rüzgâr ve sıcaklık değişimleri bu katmanları aşındırmaya başlamıştır. Yumuşak tüf hızla aşınırken sert kayaç parçaları altlarındaki tüfü bir şemsiye gibi korumuştur. Böylece korunan kısımlar yükseklerde kalmış, çevresi ise oyulmuştur. Bugün gördüğümüz şapkalı kayalar bu farklı aşınma hızının eseridir. Şapkası düşen bir peri bacası korumasız kalır ve birkaç yüzyıl içinde erir.

İnsanlar da bu yumuşak kayadan yararlanmayı bilmiştir. Tüf kolayca oyulabildiği için kayalara evler, ambarlar, güvercinlikler ve kiliseler açılmıştır. Yazın serin, kışın ılık kalan bu oyma mekânlar yaşam için elverişliydi. Derinkuyu ve Kaymaklı gibi yeraltı şehirleri ise yerin onlarca metre altına uzanır. Bu şehirlerde havalandırma bacaları, su kuyuları ve büyük taş kapılar bulunur. Tehlike anında taş kapılar yuvarlanarak girişleri kapatırdı.

Kapadokya, doğal ve kültürel değerleri nedeniyle 1985 yılında UNESCO Dünya Mirası Listesi'ne alınmıştır. Bugün bölge, sabahın erken saatlerinde gökyüzünü dolduran sıcak hava balonlarıyla da tanınır.`,
    questions: [
      { q: "Tüf nasıl oluşmuştur?", options: ["Deniz tabanındaki kumlardan", "Volkan küllerinin sertleşmesiyle", "Buzulların taşıdığı taşlardan", "Nehir çamurunun kurumasıyla"], a: 1 },
      { q: "Peri bacalarının şapkası neden önemlidir?", options: ["Kayaya renk verdiği için", "Altındaki yumuşak tüfü aşınmaya karşı koruduğu için", "Rüzgârı hızlandırdığı için", "Kayayı daha ağır yaptığı için"], a: 1 },
      { q: "Oyma mekânların yaşam için elverişli olmasının nedeni nedir?", options: ["Yazın serin, kışın ılık kalmaları", "Çok geniş olmaları", "Pencerelerinin büyük olması", "Nehir kenarında olmaları"], a: 0 },
      { q: "Yeraltı şehirlerinde girişler nasıl kapatılırdı?", options: ["Ahşap kapılarla", "Yuvarlanan taş kapılarla", "Toprak doldurularak", "Demir parmaklıklarla"], a: 1 },
      { q: "Kapadokya UNESCO Dünya Mirası Listesi'ne hangi yıl alınmıştır?", options: ["1973", "1985", "1999", "2005"], a: 1 },
    ],
  },
  {
    id: "t-uyku",
    title: "Uyurken Beynimizde Neler Olur?",
    body: `Uyku çoğu zaman beynin dinlendiği, adeta kapandığı bir zaman gibi düşünülür. Oysa araştırmalar, uykunun beyin için son derece hareketli bir dönem olduğunu gösteriyor. Gece boyunca beyin, gün içinde öğrendiklerimizi düzenler, gereksiz bilgileri ayıklar ve önemli olanları kalıcı hale getirir.

Uyku birbirini izleyen döngülerden oluşur. Her döngü yaklaşık doksan dakika sürer ve hafif uyku, derin uyku ile REM uykusu denen evreleri içerir. Derin uyku sırasında vücut kendini onarır, büyüme hormonu salgılanır ve bağışıklık sistemi güçlenir. REM evresinde ise gözler kapakların altında hızla hareket eder; canlı rüyaların çoğu bu evrede görülür.

Bilim insanları öğrenme ile uyku arasındaki ilişkiyi deneylerle incelemiştir. Bir deneyde öğrencilere akşam bir kelime listesi ezberletilmiş, bir grup uyumuş, diğer grup ise uyanık kalmıştır. Ertesi gün yapılan testte uyuyan grubun kelimeleri belirgin şekilde daha iyi hatırladığı görülmüştür. Bu sonuç, sınavdan önceki geceyi uykusuz geçirmenin neden iyi bir fikir olmadığını açıklar.

Uykunun bir başka görevi de beyni temizlemektir. Uyku sırasında beyin hücreleri arasındaki boşluklar genişler ve beyin omurilik sıvısı, gün içinde biriken atık maddeleri daha kolay uzaklaştırır.

Uzmanlar, ergenlik çağındaki gençlerin her gece sekiz ile on saat arasında uyumasını önerir. Yatmadan önce ekranlardan uzak durmak da önemlidir, çünkü ekranların yaydığı mavi ışık, uykuyu düzenleyen melatonin hormonunun salgılanmasını geciktirebilir. Düzenli saatlerde yatıp kalkmak ise uykunun kalitesini artırmanın en basit yoludur.`,
    questions: [
      { q: "Bir uyku döngüsü yaklaşık ne kadar sürer?", options: ["30 dakika", "60 dakika", "90 dakika", "3 saat"], a: 2 },
      { q: "Canlı rüyaların çoğu hangi evrede görülür?", options: ["Hafif uyku", "Derin uyku", "REM uykusu", "Uyanma anı"], a: 2 },
      { q: "Kelime listesi deneyinin sonucu nedir?", options: ["Uyanık kalan grup daha iyi hatırladı", "İki grup arasında fark çıkmadı", "Uyuyan grup kelimeleri daha iyi hatırladı", "Kimse kelimeleri hatırlamadı"], a: 2 },
      { q: "Mavi ışık uykuyu nasıl etkileyebilir?", options: ["Melatonin salgısını geciktirerek", "Büyüme hormonunu artırarak", "Rüyaları azaltarak", "Bağışıklığı güçlendirerek"], a: 0 },
      { q: "Uzmanlar ergenlik çağındaki gençlere her gece kaç saat uyku önerir?", options: ["5-6 saat", "6-7 saat", "8-10 saat", "11-12 saat"], a: 2 },
    ],
  },
  {
    id: "t-piri-reis",
    title: "Piri Reis ve Ünlü Haritası",
    body: `Osmanlı denizcisi Piri Reis, on altıncı yüzyılın başında Akdeniz'de pek çok sefere katılmış deneyimli bir kaptandı. Denizciliği amcası Kemal Reis'in yanında öğrenmiş, yıllar boyunca kıyıları, limanları ve akıntıları dikkatle not etmişti. Onun adını bugün dünyaca tanınır kılan ise 1513 yılında çizdiği dünya haritasıdır.

Ceylan derisi üzerine çizilen bu haritanın yalnızca bir parçası günümüze ulaşmıştır. Bu parçada Atlas Okyanusu, Avrupa ve Afrika'nın batı kıyıları ile Güney Amerika'nın doğu kıyıları görülür. Harita, Amerika kıtasını gösteren en eski haritalardan biri olması nedeniyle büyük önem taşır.

Piri Reis haritayı hazırlarken yaklaşık yirmi farklı kaynaktan yararlandığını haritanın üzerine yazdığı notlarda belirtmiştir. Bu kaynaklar arasında eski Yunan haritaları, Arap ve Portekiz haritaları ile Kristof Kolomb'un çizdiği kayıp bir haritanın da bulunduğu düşünülmektedir. Piri Reis bu farklı kaynakları karşılaştırarak birleştirmiş, böylece döneminin en ayrıntılı haritalarından birini ortaya koymuştur.

Haritanın parçası yüzyıllarca unutulmuş, 1929 yılında Topkapı Sarayı'nda yürütülen bir çalışma sırasında yeniden bulunmuştur. Bulunuşu dünya basınında geniş yer almış, harita kısa sürede bilim insanlarının ilgi odağı haline gelmiştir.

Piri Reis'in bir diğer önemli eseri Kitab-ı Bahriye'dir. Bu kitapta Akdeniz'in kıyıları, adaları, limanları ve tehlikeli kayalıkları ayrıntılı çizimlerle anlatılır. Kitap, denizcilere yol gösteren bir kılavuz olarak uzun yıllar kullanılmıştır. UNESCO, haritanın çizilişinin beş yüzüncü yılı olan 2013 yılını Piri Reis yılı olarak anmıştır.`,
    questions: [
      { q: "Piri Reis denizciliği kimden öğrenmiştir?", options: ["Babasından", "Amcası Kemal Reis'ten", "Barbaros Hayrettin Paşa'dan", "Portekizli bir kaptandan"], a: 1 },
      { q: "Harita ne üzerine çizilmiştir?", options: ["Kâğıt üzerine", "Ceylan derisi üzerine", "Kumaş üzerine", "Ahşap levha üzerine"], a: 1 },
      { q: "Haritayı önemli kılan özelliklerden biri nedir?", options: ["Asya'yı ayrıntılı göstermesi", "Amerika kıtasını gösteren en eski haritalardan biri olması", "Renkli çizilen ilk harita olması", "Tamamının günümüze ulaşması"], a: 1 },
      { q: "Haritanın parçası hangi yıl yeniden bulunmuştur?", options: ["1513", "1929", "1973", "2013"], a: 1 },
      { q: "Kitab-ı Bahriye hangi konuyu anlatır?", options: ["Osmanlı saray hayatını", "Akdeniz'in kıyılarını, limanlarını ve tehlikeli kayalıklarını", "Gökyüzündeki yıldızları", "Amerika'nın keşfini"], a: 1 },
    ],
  },
  {
    id: "t-ahtapot",
    title: "Denizin Zeki Sakini: Ahtapot",
    body: `Ahtapotlar, omurgasız hayvanlar arasında en zeki canlılardan biri olarak kabul edilir. Sekiz kollu bu deniz canlısının sinir hücrelerinin önemli bir bölümü beyninde değil, kollarında bulunur. Bu sayede her kol, bir ölçüde kendi başına hareket edebilir ve dokunduğu nesneyi tanıyabilir.

Ahtapotlar üç kalbe sahiptir. Kalplerden ikisi kanı solungaçlara pompalarken üçüncüsü vücudun geri kalanına kan gönderir. Kanlarının rengi de dikkat çekicidir: bakır içeren bir protein nedeniyle ahtapot kanı mavidir.

Bu canlıların en şaşırtıcı yeteneklerinden biri kamuflajdır. Derilerindeki özel renk hücreleri sayesinde saniyeler içinde renk ve desen değiştirebilir, hatta derilerinin dokusunu bile kaya ya da yosuna benzetebilirler. Tehlike anında mürekkep püskürterek düşmanlarının görüşünü kapatır ve hızla uzaklaşırlar. Kemikleri olmadığı için kendi göz büyüklüklerindeki dar aralıklardan bile geçebilirler.

Laboratuvar çalışmaları ahtapotların problem çözme becerisini de ortaya koymuştur. Ahtapotların kapağı vidalı kavanozları açarak içindeki yiyeceğe ulaştığı, labirentlerde yolu öğrendiği gözlemlenmiştir. Bazı ahtapotların, kabukları ve hindistan cevizi kabuklarını taşıyıp sığınak olarak kullandığı da kaydedilmiştir. Bu davranış, bir hayvanın alet kullanımına örnek olarak gösterilir.

Bu kadar yetenekli olmalarına rağmen ahtapotların ömrü oldukça kısadır. Pek çok tür yalnızca bir ila iki yıl yaşar. Anne ahtapot yumurtalarını haftalarca korur ve bu süre boyunca neredeyse hiç beslenmez. Yavrular yumurtadan çıktıktan kısa süre sonra anne ahtapotun yaşamı sona erer.`,
    questions: [
      { q: "Ahtapotun sinir hücrelerinin önemli bir bölümü nerededir?", options: ["Kalplerinde", "Kollarında", "Gözlerinde", "Solungaçlarında"], a: 1 },
      { q: "Ahtapot kanı neden mavidir?", options: ["Deniz suyu içtiği için", "Bakır içeren bir protein nedeniyle", "Mürekkep karıştığı için", "Üç kalbi olduğu için"], a: 1 },
      { q: "Ahtapotlar dar aralıklardan nasıl geçebilir?", options: ["Kolları uzayabildiği için", "Kemikleri olmadığı için", "Mürekkep püskürttüğü için", "Renk değiştirebildiği için"], a: 1 },
      { q: "Metinde alet kullanımına örnek olarak hangi davranış verilmiştir?", options: ["Kavanoz açma", "Kabukları taşıyıp sığınak olarak kullanma", "Labirentte yol bulma", "Renk değiştirme"], a: 1 },
      { q: "Pek çok ahtapot türü ne kadar yaşar?", options: ["Birkaç hafta", "Bir ila iki yıl", "On yıl", "Yirmi yıldan fazla"], a: 1 },
    ],
  },
  {
    id: "t-ruzgar",
    title: "Rüzgârdan Elektriğe",
    body: `İnsanlar rüzgârın gücünden binlerce yıldır yararlanıyor. Yelkenli gemiler rüzgârla denizleri aşmış, yel değirmenleri tahıl öğütmüş ve su pompalamıştır. Bugün ise rüzgâr, elektrik üretiminde en hızlı büyüyen kaynaklardan biridir.

Modern bir rüzgâr türbini, genellikle üç kanatlı bir pervane, bir kule ve kulenin tepesindeki gövdeden oluşur. Rüzgâr kanatları döndürdüğünde bu dönme hareketi bir mil aracılığıyla gövdedeki jeneratöre aktarılır. Jeneratör, hareket enerjisini elektrik enerjisine dönüştürür. Büyük türbinlerin kanatları bir futbol sahasının yarısı kadar uzun olabilir.

Türbinlerin nereye kurulacağı dikkatle seçilir. Rüzgârın düzenli ve güçlü estiği tepeler, açık araziler ve kıyılar en uygun yerlerdir. Rüzgâr yükseklere çıktıkça daha hızlı ve düzenli estiği için kuleler oldukça yüksek yapılır. Son yıllarda denize kurulan türbinler de yaygınlaşmıştır, çünkü deniz üzerinde rüzgâr engelle karşılaşmadan daha istikrarlı eser.

Rüzgâr enerjisinin en büyük avantajı, elektrik üretirken havayı kirleten gazlar salmamasıdır. Kaynağı da tükenmez. Bununla birlikte bazı zorlukları vardır. Rüzgâr her zaman aynı hızda esmez; bu nedenle üretilen elektrik miktarı değişkendir. Bu sorunu çözmek için rüzgâr santralleri diğer enerji kaynaklarıyla birlikte kullanılır ve fazla enerjiyi depolayan büyük bataryalar geliştirilmektedir.

Türkiye de rüzgâr enerjisi bakımından önemli bir potansiyele sahiptir. Özellikle Ege ve Marmara kıyılarında çok sayıda rüzgâr santrali bulunmaktadır. Uzmanlar, temiz enerji kaynaklarının payının önümüzdeki yıllarda daha da artacağını öngörmektedir.`,
    questions: [
      { q: "Türbinde hareket enerjisini elektriğe dönüştüren parça hangisidir?", options: ["Kule", "Kanat", "Jeneratör", "Pervane mili"], a: 2 },
      { q: "Kuleler neden yüksek yapılır?", options: ["Kuşlardan korunmak için", "Rüzgâr yükseklerde daha hızlı ve düzenli estiği için", "Uzaktan görünmeleri için", "Bakımı kolaylaştırmak için"], a: 1 },
      { q: "Denize kurulan türbinlerin avantajı nedir?", options: ["Daha ucuz olmaları", "Rüzgârın deniz üzerinde daha istikrarlı esmesi", "Daha küçük olmaları", "Hiç bakım gerektirmemeleri"], a: 1 },
      { q: "Rüzgâr enerjisinin zorluklarından biri nedir?", options: ["Havayı kirletmesi", "Kaynağının tükenmesi", "Üretilen elektrik miktarının değişken olması", "Sadece gece çalışması"], a: 2 },
      { q: "Metne göre Türkiye'de rüzgâr santralleri özellikle nerelerde yoğundur?", options: ["Doğu Anadolu'da", "Ege ve Marmara kıyılarında", "Karadeniz yaylalarında", "İç Anadolu ovalarında"], a: 1 },
    ],
  },
];

/** Antrenman metinleri – 3 soru. Rehberli / blok / gölgeli okumada kullanılır. */
export const PRACTICE_TEXTS: ReadingText[] = [
  {
    id: "p-goc",
    title: "Kuşların Uzun Yolculuğu",
    body: `Her sonbahar milyonlarca kuş, binlerce kilometre uzaktaki sıcak bölgelere doğru yola çıkar. Leylekler Türkiye üzerinden geçerek Afrika'ya göç eder. Kuşlar yollarını bulmak için güneşin konumunu, yıldızları ve dünyanın manyetik alanını kullanır. Bazı türlerin gözlerinde manyetik alanı algılamalarına yardım eden özel moleküller bulunduğu düşünülmektedir. Göç sırasında kuşlar enerji harcamamak için sıcak hava akımlarından yararlanır. Leylekler kanat çırpmadan, yükselen sıcak hava sütunlarında süzülerek yükselir ve ardından bir sonraki akıma doğru kayar. Bu nedenle denizler üzerinde uçmaktan kaçınır, karaların üzerinden geçen rotaları tercih ederler. İstanbul Boğazı, bu yüzden dünyanın en önemli göç yollarından biridir. İlkbaharda kuşlar aynı yollardan geri dönerek yuvalarına kavuşur.`,
    questions: [
      { q: "Leylekler neden denizler üzerinde uçmaktan kaçınır?", options: ["Denizden korktukları için", "Yükselen sıcak hava akımları karalar üzerinde oluştuğu için", "Deniz üzerinde yiyecek olmadığı için", "Rüzgâr çok sert olduğu için"], a: 1 },
      { q: "Kuşlar yön bulmak için hangisini kullanmaz?", options: ["Güneşin konumunu", "Yıldızları", "Manyetik alanı", "Nehirlerin sesini"], a: 3 },
      { q: "Metinde dünyanın en önemli göç yollarından biri olarak hangi yer anılıyor?", options: ["Çanakkale Boğazı", "İstanbul Boğazı", "Toros Dağları", "Van Gölü"], a: 1 },
    ],
  },
  {
    id: "p-cay",
    title: "Bir Fincan Çayın Yolculuğu",
    body: `Çay, dünyada sudan sonra en çok tüketilen içecektir. Türkiye ise kişi başına çay tüketiminde dünyanın ilk sıralarında yer alır. Ülkemizde çay tarımı, yirminci yüzyılın başında Rize ve çevresinde başlamıştır. Bölgenin bol yağış alan, ılıman iklimi ve asitli toprağı çay bitkisi için oldukça uygundur. Çay bitkisinin genç ve taze yaprakları ilkbahardan sonbahara kadar birkaç kez toplanır. Toplanan yapraklar fabrikada önce soldurulur, sonra kıvrılarak ezilir. Ardından yapraklar havayla temas ederek oksitlenir; bu aşama siyah çaya rengini ve kokusunu verir. Son olarak yapraklar kurutulup paketlenir. Yeşil çayda ise oksitlenme aşaması uygulanmaz, bu yüzden yapraklar yeşil rengini korur.`,
    questions: [
      { q: "Türkiye'de çay tarımı hangi bölgede başlamıştır?", options: ["Ege", "Rize ve çevresi", "Trakya", "Çukurova"], a: 1 },
      { q: "Siyah çaya rengini ve kokusunu veren aşama hangisidir?", options: ["Soldurma", "Oksitlenme", "Paketleme", "Toplama"], a: 1 },
      { q: "Yeşil çayın yeşil kalmasının nedeni nedir?", options: ["Farklı bir bitkiden yapılması", "Oksitlenme aşamasının uygulanmaması", "Daha erken toplanması", "Güneşte kurutulması"], a: 1 },
    ],
  },
  {
    id: "p-satranc",
    title: "Satrancın Uzun Tarihi",
    body: `Satrancın kökeninin yaklaşık bin beş yüz yıl önce Hindistan'da oynanan çaturanga adlı oyuna dayandığı düşünülür. Oyun buradan İran'a, ardından İslam dünyası aracılığıyla Avrupa'ya yayılmıştır. Zamanla taşların hareketleri değişmiş, vezir tahtadaki en güçlü taş haline gelmiştir. Satranç yalnızca bir oyun değil, aynı zamanda düşünme becerilerini geliştiren bir zihin sporudur. Oyuncular birkaç hamle sonrasını hesaplamak, rakibin planını tahmin etmek ve sabırla doğru anı beklemek zorundadır. Araştırmalar, düzenli satranç oynayan öğrencilerin dikkat ve problem çözme becerilerinde gelişme görülebildiğini göstermektedir. Günümüzde bilgisayar programları dünya şampiyonlarını yenebilecek düzeye ulaşmıştır. Yine de satranç, iki insanın karşılıklı oturup düşündüğü bir oyun olarak sevilmeye devam ediyor.`,
    questions: [
      { q: "Satrancın kökeni olarak hangi oyun gösterilir?", options: ["Go", "Çaturanga", "Tavla", "Dama"], a: 1 },
      { q: "Zamanla tahtadaki en güçlü taş hangisi olmuştur?", options: ["Şah", "Kale", "Vezir", "At"], a: 2 },
      { q: "Metne göre düzenli satranç oynayan öğrencilerde neler gelişebilir?", options: ["Koşu hızı", "Dikkat ve problem çözme becerileri", "Müzik yeteneği", "El yazısı"], a: 1 },
    ],
  },
  {
    id: "p-fotosentez",
    title: "Yaprağın İçindeki Mutfak",
    body: `Bitkiler, besinlerini kendileri üreten canlılardır. Bu üretim fotosentez adı verilen bir süreçle gerçekleşir. Yapraklardaki kloroplast adlı küçük yapılar, içerdikleri yeşil renkli klorofil sayesinde güneş ışığını yakalar. Bitki, kökleriyle topraktan su alır ve yapraklarındaki küçük gözeneklerden havadaki karbondioksiti içeri çeker. Güneş enerjisi kullanılarak su ve karbondioksitten şeker üretilir. Bu sırada açığa çıkan oksijen havaya verilir. Soluduğumuz oksijenin büyük bölümü bitkiler ve denizlerdeki küçük canlılar tarafından üretilir. Sonbaharda günler kısalınca klorofil üretimi azalır. Yeşil renk kaybolunca yapraklarda daha önce gizli kalan sarı ve turuncu renkler ortaya çıkar.`,
    questions: [
      { q: "Güneş ışığını yakalayan yeşil madde hangisidir?", options: ["Kloroplast", "Klorofil", "Karbondioksit", "Gözenek"], a: 1 },
      { q: "Fotosentez sırasında havaya ne verilir?", options: ["Karbondioksit", "Su buharı", "Oksijen", "Şeker"], a: 2 },
      { q: "Sonbaharda yapraklar neden sararır?", options: ["Klorofil azalınca gizli renkler ortaya çıktığı için", "Yapraklar fazla su aldığı için", "Böcekler yaprakları yediği için", "Güneş ışığı arttığı için"], a: 0 },
    ],
  },
  {
    id: "p-kagit",
    title: "Kâğıdın İcadı",
    body: `Kâğıt icat edilmeden önce insanlar yazılarını taş, kil tablet, papirüs ve hayvan derisi gibi malzemelere yazıyordu. Bu malzemeler ya ağır ya da pahalıydı. Kâğıdın milattan sonra ikinci yüzyılda Çin'de geliştirildiği kabul edilir. İlk kâğıtlar ağaç kabuğu, kenevir lifleri ve eski kumaş parçalarının suyla dövülüp ezilmesiyle elde edilen hamurdan yapılıyordu. Hamur ince bir elek üzerine yayılıyor, suyu süzüldükten sonra kurutuluyordu. Kâğıt yapımı yüzyıllar içinde İpek Yolu üzerinden Semerkant'a ve Bağdat'a, oradan da Avrupa'ya ulaştı. Matbaanın icadıyla birlikte kâğıda olan ihtiyaç büyük ölçüde arttı ve kitaplar çok daha fazla insana ulaşabildi. Bugün kâğıdın önemli bir bölümü geri dönüştürülerek yeniden kullanılmaktadır.`,
    questions: [
      { q: "Kâğıdın ilk geliştirildiği yer neresidir?", options: ["Mısır", "Çin", "Bağdat", "Avrupa"], a: 1 },
      { q: "Kâğıt yapımı Avrupa'ya hangi yol üzerinden ulaşmıştır?", options: ["Baharat Yolu", "İpek Yolu", "Kral Yolu", "Kürk Yolu"], a: 1 },
      { q: "Kâğıda olan ihtiyacı büyük ölçüde artıran gelişme nedir?", options: ["Pusulanın icadı", "Matbaanın icadı", "Saatin icadı", "Telefonun icadı"], a: 1 },
    ],
  },
  {
    id: "p-yunus",
    title: "Yunusların Dili",
    body: `Yunuslar, denizlerde yaşayan ancak balık olmayan, akciğerleriyle nefes alan memelilerdir. Nefes almak için düzenli aralıklarla su yüzeyine çıkarlar. Yunusların en ilginç özelliklerinden biri iletişim kurma biçimleridir. Her yunusun kendine özgü bir ıslık sesi vardır ve bilim insanları bu sesin bir tür isim gibi kullanıldığını düşünmektedir. Yunuslar ayrıca ekolokasyon adı verilen bir yöntemle çevrelerini algılar. Çıkardıkları tık seslerinin nesnelere çarpıp geri dönmesini dinleyerek avlarının yerini ve büyüklüğünü anlayabilirler. Yunuslar sürüler halinde yaşar, avlanırken iş birliği yapar ve yaralı arkadaşlarına yardım ettikleri gözlemlenmiştir. Uyurken beyinlerinin yalnızca bir yarısını dinlendirir, böylece hem nefes almayı hem de tehlikelere karşı uyanık kalmayı sürdürürler.`,
    questions: [
      { q: "Bilim insanlarına göre yunusların kendine özgü ıslık sesi ne işe yarar?", options: ["Avı korkutmaya", "Bir tür isim gibi kullanılmaya", "Uyumaya", "Yüzme hızını artırmaya"], a: 1 },
      { q: "Ekolokasyon nedir?", options: ["Sesin yansımasını dinleyerek çevreyi algılama", "Renk değiştirme", "Derin dalış", "Su yüzeyinde nefes alma"], a: 0 },
      { q: "Yunuslar uyurken nasıl uyanık kalabilir?", options: ["Hiç uyumayarak", "Beyinlerinin yalnızca bir yarısını dinlendirerek", "Kıyıya çıkarak", "Sürüden ayrılarak"], a: 1 },
    ],
  },
  {
    id: "p-sinan",
    title: "Mimar Sinan'ın Ustalığı",
    body: `Mimar Sinan, Osmanlı Devleti'nin en ünlü mimarıdır. Gençliğinde yeniçeri olarak seferlere katılmış, bu sırada köprüler ve gemiler yaparak mühendislik becerisini göstermiştir. Yaklaşık elli yıl boyunca başmimarlık görevini yürüten Sinan, camiler, medreseler, köprüler, hamamlar ve çeşmeler dahil üç yüzü aşkın yapı tasarlamıştır. Sinan, eserlerini kendi gelişimine göre üç döneme ayırır. İstanbul'daki Şehzade Camii'ni çıraklık, Süleymaniye Camii'ni kalfalık, Edirne'deki Selimiye Camii'ni ise ustalık eseri olarak tanımlamıştır. Selimiye'nin büyük kubbesi, taşıyıcı ayaklarla öyle dengelenmiştir ki iç mekân geniş ve aydınlık görünür. Sinan'ın yapılarının yüzyıllardır depremlere dayanması, onun zemin ve yük hesaplarındaki ustalığını gösterir.`,
    questions: [
      { q: "Mimar Sinan ustalık eseri olarak hangi yapıyı göstermiştir?", options: ["Şehzade Camii", "Süleymaniye Camii", "Selimiye Camii", "Sultanahmet Camii"], a: 2 },
      { q: "Sinan gençliğinde hangi görevde bulunmuştur?", options: ["Yeniçeri", "Kadı", "Vezir", "Tüccar"], a: 0 },
      { q: "Sinan'ın yapılarının depremlere dayanması neyi gösterir?", options: ["Kullanılan taşların renkli olmasını", "Zemin ve yük hesaplarındaki ustalığını", "Yapıların küçük olmasını", "Sık sık onarılmalarını"], a: 1 },
    ],
  },
  {
    id: "p-su-dongusu",
    title: "Hiç Bitmeyen Yolculuk: Su Döngüsü",
    body: `Bugün içtiğimiz su, milyonlarca yıl önce dinozorların içtiği suyla aynı olabilir. Çünkü dünyadaki su sürekli bir döngü içinde dolaşır. Güneş, okyanusları, gölleri ve nehirleri ısıtır; su buharlaşarak atmosfere yükselir. Bitkiler de yapraklarından su buharı salarak bu sürece katkıda bulunur. Yükselen buhar soğudukça yoğunlaşır ve küçük su damlacıklarından oluşan bulutları meydana getirir. Damlacıklar birleşip ağırlaştığında yağmur, kar ya da dolu olarak yeryüzüne düşer. Yağışın bir kısmı nehirler aracılığıyla denizlere ulaşır, bir kısmı toprağa sızarak yeraltı sularını besler. Dünyadaki suyun büyük bölümü tuzlu sudur; içilebilir tatlı suyun oranı ise oldukça azdır. Bu yüzden suyu dikkatli kullanmak hepimizin sorumluluğudur.`,
    questions: [
      { q: "Bulutlar nasıl oluşur?", options: ["Su buharının soğuyup yoğunlaşmasıyla", "Rüzgârın tozları taşımasıyla", "Denizlerin ısınmasıyla doğrudan", "Kar erimesiyle"], a: 0 },
      { q: "Yağışın toprağa sızan kısmı neyi besler?", options: ["Okyanusları", "Yeraltı sularını", "Bulutları", "Buzulları"], a: 1 },
      { q: "Metne göre suyu dikkatli kullanmamız neden önemlidir?", options: ["Su döngüsü durduğu için", "İçilebilir tatlı su oranı az olduğu için", "Suyun tamamı tuzlu olduğu için", "Yağmur hiç yağmadığı için"], a: 1 },
    ],
  },
  {
    id: "p-pusula",
    title: "Yön Gösteren İğne",
    body: `Pusula, insanlığın yön bulma serüveninde en önemli icatlardan biridir. Pusulanın çalışma ilkesi basittir: serbestçe dönebilen mıknatıslı bir iğne, dünyanın manyetik alanı nedeniyle her zaman kuzey-güney doğrultusunda durur. İlk pusulaların Çin'de kullanıldığı bilinmektedir. Önceleri suyla dolu bir kaba bırakılan mıknatıslı demir parçaları kullanılmış, zamanla iğne bir mil üzerine yerleştirilmiştir. Pusula, denizcilerin bulutlu havalarda ve açık denizde yönlerini kaybetmeden yolculuk yapmasını sağlamıştır. Ancak pusulanın gösterdiği manyetik kuzey ile coğrafi kuzey tam olarak aynı yerde değildir. Denizciler ve gezginler, bulundukları yere göre bu farkı hesaba katarak yönlerini düzeltir. Bugün telefonlarımızdaki dijital pusulalar da aynı manyetik alanı algılayan küçük sensörlerle çalışır.`,
    questions: [
      { q: "Pusula iğnesi neden kuzey-güney doğrultusunda durur?", options: ["Rüzgâr nedeniyle", "Dünyanın manyetik alanı nedeniyle", "Güneşin konumu nedeniyle", "Ağırlığı nedeniyle"], a: 1 },
      { q: "Pusulanın denizcilere en büyük katkısı nedir?", options: ["Hızı ölçmek", "Bulutlu havalarda ve açık denizde yön bulmak", "Derinliği ölçmek", "Hava durumunu tahmin etmek"], a: 1 },
      { q: "Manyetik kuzey ile coğrafi kuzey hakkında ne söylenmiştir?", options: ["Tamamen aynıdır", "Tam olarak aynı yerde değildir", "Sadece kışın farklıdır", "Pusula coğrafi kuzeyi gösterir"], a: 1 },
    ],
  },
  {
    id: "p-gobeklitepe",
    title: "Göbeklitepe: Tarihin Sıfır Noktası",
    body: `Şanlıurfa yakınlarındaki Göbeklitepe, bilinen en eski anıtsal yapılardan biridir. Yaklaşık on iki bin yıl önce inşa edilen bu yapılar, Mısır piramitlerinden yaklaşık yedi bin yıl daha eskidir. Alanda daireler biçiminde dizilmiş, T şeklinde dev dikilitaşlar bulunur. Bazı taşların boyu beş metreyi aşar ve üzerlerinde tilki, yaban domuzu, yılan ve akbaba gibi hayvan kabartmaları yer alır. Göbeklitepe'yi bu kadar şaşırtıcı kılan, yapıların insanlar henüz tarıma ve yerleşik hayata geçmeden önce yapılmış olmasıdır. Uzun süre, büyük yapıların ancak tarım toplumlarınca yapılabileceği düşünülüyordu. Göbeklitepe, avcı-toplayıcı toplulukların da bir araya gelerek büyük işler başarabildiğini göstermiştir. Alan 2018 yılında UNESCO Dünya Mirası Listesi'ne alınmıştır.`,
    questions: [
      { q: "Göbeklitepe yaklaşık kaç yıl önce inşa edilmiştir?", options: ["2 bin", "5 bin", "12 bin", "50 bin"], a: 2 },
      { q: "Göbeklitepe'yi şaşırtıcı kılan özellik nedir?", options: ["Altından yapılmış olması", "Tarım ve yerleşik hayattan önce yapılmış olması", "Deniz kenarında olması", "Piramit şeklinde olması"], a: 1 },
      { q: "Dikilitaşlar hangi harfe benzer?", options: ["L", "T", "Y", "H"], a: 1 },
    ],
  },
  {
    id: "p-kutup",
    title: "Kutup Ayısının Zorlu Dünyası",
    body: `Kutup ayıları, Kuzey Kutbu çevresindeki buzlarla kaplı bölgelerde yaşar. Kalın bir yağ tabakası ve yoğun kürkleri onları dondurucu soğuktan korur. İlginçtir ki kutup ayısının kürkü aslında beyaz değil, renksiz ve içi boş tüylerden oluşur; ışığı yansıttığı için beyaz görünür. Derileri ise siyahtır ve güneşin ısısını emmeye yardımcı olur. Kutup ayıları çoğunlukla fok avlar. Foklar nefes almak için buzdaki deliklere gelir; ayılar bu deliklerin başında saatlerce sabırla bekleyebilir. Usta yüzücüler olan kutup ayıları, buz parçaları arasında kilometrelerce yüzebilir. Ancak iklim değişikliğiyle deniz buzlarının erken erimesi, avlanma sürelerini kısaltmakta ve bu canlıların yaşamını zorlaştırmaktadır.`,
    questions: [
      { q: "Kutup ayısının kürkü neden beyaz görünür?", options: ["Tüyleri beyaz olduğu için", "Renksiz tüyler ışığı yansıttığı için", "Kar ile kaplandığı için", "Derisi beyaz olduğu için"], a: 1 },
      { q: "Kutup ayısının derisinin siyah olması ne işe yarar?", options: ["Avlanırken gizlenmeye", "Güneşin ısısını emmeye", "Yüzmeyi kolaylaştırmaya", "Hiçbir işe yaramaz"], a: 1 },
      { q: "Deniz buzlarının erken erimesi ayıları nasıl etkiler?", options: ["Avlanma sürelerini kısaltır", "Daha çok fok bulmalarını sağlar", "Kürklerini kalınlaştırır", "Hiç etkilemez"], a: 0 },
    ],
  },
  {
    id: "p-uzay",
    title: "Uzayda Bir Gün",
    body: `Uluslararası Uzay İstasyonu, dünyanın yaklaşık dört yüz kilometre yukarısında, saatte yirmi sekiz bin kilometre hızla dönmektedir. Bu hızla istasyon dünyanın çevresini yaklaşık doksan dakikada bir dolaşır. Bu yüzden astronotlar bir günde on altı kez gün doğumu ve gün batımı izleyebilir. İstasyonda yerçekimi hissedilmediği için astronotlar havada süzülür. Uyurken bile duvara bağlı uyku tulumlarına girerler ki süzülerek bir yere çarpmasınlar. Yerçekimsiz ortamda kaslar ve kemikler zayıflayabildiği için astronotlar her gün yaklaşık iki saat egzersiz yapar. İçme suyunun önemli bir kısmı, istasyondaki nemin ve kullanılmış suyun arıtılmasıyla yeniden elde edilir. Astronotlar istasyonda bitki yetiştirme, malzeme ve insan sağlığı üzerine yüzlerce deney gerçekleştirir.`,
    questions: [
      { q: "İstasyon dünyanın çevresini yaklaşık ne kadar sürede dolaşır?", options: ["24 saatte", "90 dakikada", "12 saatte", "1 haftada"], a: 1 },
      { q: "Astronotlar neden her gün egzersiz yapar?", options: ["Sıkılmamak için", "Kas ve kemik zayıflamasını önlemek için", "Isınmak için", "Yerçekimi oluşturmak için"], a: 1 },
      { q: "İçme suyunun önemli bir kısmı nasıl elde edilir?", options: ["Dünyadan her gün gönderilir", "Nem ve kullanılmış suyun arıtılmasıyla", "Buzlardan eritilir", "Ay'dan getirilir"], a: 1 },
    ],
  },
];

export const ALL_TEXTS = [...TEST_TEXTS, ...PRACTICE_TEXTS];

export function wordCount(body: string) {
  return body.split(/\s+/).filter(Boolean).length;
}
