// Reisedaten – Quelle: Doc "Südkorea-Rundreise Sept./Okt. 2027 – Reiseplan"
// Links im Text: [Text](https://url)
window.TRIP = {
  title: "Südkorea-Rundreise",
  subtitle: "Sept./Okt. 2027 · {nights:all} Nächte · 5 Stationen",
  departure: "2027-09-15T16:05:00+02:00",
  returnDate: "2027-10-06",
  travellers: 2, // Reisende; Flugpreise werden pro Person gesucht und mal dieser Zahl gerechnet
  intro:
    "Abflug am {wday:2027-09-15}, {dy:2027-09-15}, ab {flight:outFromName} {flight:outStops} nach Seoul, Rückflug am {wday:2027-10-06}, {dy:2027-10-06}: {nights:all} Nächte in fünf Unterkünften. Die Reihenfolge wurde gegenüber der ersten Skizze gedreht – Jeju kommt direkt nach Seoul. So liegt die Strandwoche Ende September, wenn das Meer noch rund 25 °C hat, und Jeju ist vor der chinesischen Feiertagswoche (1.–7.10.) schon erledigt.",
  why:
    "Das Erntedankfest Chuseok ist am 14.–16.9.2027. Danach fliegen viele Koreaner aus Europa zurück. Wer am 15.9. hinfliegt, ist vor dieser Welle unterwegs. In Seoul selbst ist es am Chuseok-Tag ruhig, Paläste haben geöffnet. Der Rückflug am 6.10. liegt vor dem langen Wochenende zum Hangeul-Tag (9.–11.10.). Dienstag und Mittwoch sind für Langstrecke meist die günstigsten Flugtage.",

  // Feste Feiertage (wandern bei einer Verschiebung nicht mit). Fällt ein Reisetag darauf,
  // steht im Tagesplan ein Hinweis.
  holidays: [
    { from: "2027-09-14", to: "2027-09-16", name: "Chuseok (Erntedankfest)" },
    { from: "2027-10-03", name: "Nationalfeiertag" },
    { from: "2027-10-04", name: "Ersatzfeiertag für den Nationalfeiertag" },
    { from: "2027-10-09", name: "Hangeul-Tag" },
    { from: "2027-10-11", name: "Ersatzfeiertag für den Hangeul-Tag" },
  ],

  // Ruhetage: Steht "match" im Text eines Tages im Tagesplan und fällt der Tag auf den
  // Wochentag (0 = So … 6 = Sa) bzw. den n-ten Wochentag im Monat, gibt es eine Warnung.
  // planHotelOnly: nur solange das Planhotel der Station gilt.
  closures: [
    { match: "Gyeongbokgung", weekdays: [2], text: "Gyeongbokgung ist dienstags geschlossen." },
    { match: "Changdeokgung", weekdays: [1], text: "Changdeokgung und der Geheime Garten sind montags geschlossen." },
    { match: "Spa", station: "busan", nthWeekday: { n: 4, wd: 3 }, planHotelOnly: true, text: "Das Spa Cimer im Paradise Hotel ist am vierten Mittwoch im Monat geschlossen." },
  ],

  costs: {
    title: "Kostenschätzung für zwei Personen (gerundet, 1 € ≈ 1.500 KRW)",
    // Beträge in Euro. Die Zeile "hotels" wird aus den Hotels der Stationen berechnet
    // (gewähltes Hotel aus dem Konfigurator, sonst die Richtwerte priceMin/priceMax).
    rows: [
      // "flights" wird durch den in der Flugsuche gewählten Langstreckenflug ersetzt.
      { id: "flights", label: "Flüge Business Class FRA–Seoul hin/zurück", min: 3400, max: 7000 },
      { id: "hotels", label: "Hotels, {nights:all} Nächte" },
      // In "transport" stecken die Inlandsflüge mit domesticMin/domesticMax (2 Personen, beide Flüge laut Transfers).
      // Sind sie in der Flugsuche gewählt, ersetzt deren Preis diesen Anteil.
      { id: "transport", label: "Inlandsflüge, Züge, Taxis, 2 Fahrertage auf Jeju", min: 700, max: 1100, domesticMin: 150, domesticMax: 360 },
      { label: "Ausflüge, Touren, Eintritte", min: 800, max: 1300 },
      { label: "Essen und Trinken (ca. 150–250 € pro Tag)", min: 3000, max: 5000 },
    ],
    note:
      "Die Essenspreise und die Hotel-Richtwerte sind Schätzungen. Für Hotels, die im Hotel-Konfigurator gewählt wurden, steht der dort ermittelte Preis drin. Die Flugspanne reicht von Angeboten (ab ca. 1.700 € p. P.) bis zum Normaltarif.",
  },

  stations: [
    {
      id: "seoul",
      nr: 1,
      name: "Seoul",
      area: "Gwanghwamun",
      checkIn: "2027-09-16",
      checkOut: "2027-09-21",
      // Suche im Hotel-Konfigurator (Xotelo/TripAdvisor). locationKey ist die TripAdvisor-Orts-ID;
      // urlMatch ist der Ortsname in den TripAdvisor-Links; die Action prüft damit, dass die
      // geladene Liste wirklich zum Ort gehört (und ermittelt so die ID, falls sie fehlt).
      // center ist der Bezugspunkt für "zentrale Lage".
      hotelSearch: { locationKey: "g294197", urlMatch: "Seoul", center: [37.5720, 126.9769], centerName: "Gwanghwamun-Platz" },
      focus: "Paläste, Märkte, Food-Tour, Tagesausflug ins Grüne",
      color: "#c2410c",
      intro:
        "Im ersten Teil seht ihr das historische Seoul. Paläste, Hanok-Viertel und Märkte erreicht ihr vom Hotel aus zu Fuß. Dazu kommen eine abendliche Food-Tour und ein Tag im Grünen.",
      hotel: {
        todoId: "hotel-fourseasons", // zugehöriges To-do in data/todos.json, wird bei Hotelwechsel angepasst
        name: "Four Seasons Hotel Seoul",
        url: "https://www.fourseasons.com/seoul/",
        text:
          "In Gwanghwamun. Zum Gyeongbokgung-Palast und zum Gwanghwamun-Platz sind es etwa 8 Minuten zu Fuß. Es gibt eine koreanische Sauna, einen Pool und das Sternerestaurant Yu Yuan (kantonesisch).",
        price: "ca. 450–650 € pro Nacht",
        priceMin: 450,
        priceMax: 650,
      },
      sights: [
        ["[Gyeongbokgung](https://royal.khs.go.kr/ENG/contents/E101010000.do)", "der größte Königspalast, mit [Wachwechsel](https://english.visitseoul.net/events/Changing-of-the-Royal-Guard-at-Gyeongbokgung-Palace-en/ENP008256) am Gwanghwamun-Tor. Dienstags geschlossen."],
        ["[Changdeokgung](https://english.visitseoul.net/attractions/Changdeokgung-Palace_/296) und [Geheimer Garten (Huwon)](https://english.visitseoul.net/attractions/2024-cdggarden/ENPl8f5md)", "UNESCO-Welterbe. Den Garten sieht man nur mit Führung, Tickets vorab über das [offizielle Palast-Portal](https://royal.khs.go.kr/) reservieren. Montags geschlossen."],
        ["[Bukchon Hanok Village](https://english.visitseoul.net/attractions/Bukchon-Hanok-Village/ENP000261) und [Ikseon-dong](https://english.visitseoul.net/attractions/IkseongdongHanokVillage/ENP037008)", "Gassen mit traditionellen Häusern, Teehäuser, kleine Boutiquen. In Bukchon gelten feste Besuchszeiten am Tag, bitte ruhig verhalten."],
        ["[Insadong](https://english.visitseoul.net/shopping/Insa-dong/ENP000080) und [Cheonggyecheon](https://english.visitseoul.net/area/CheonggyecheonStream/ENP000034)", "Kunsthandwerk, Galerien und ein Spaziergang am Bach mitten in der Stadt."],
        ["[Gwangjang-Markt](http://www.kwangjangmarket.co.kr/)", "ältester überdachter Markt der Stadt, mit Bindaetteok (Mungbohnen-Pfannkuchen), Mayak-Gimbap und Yukhoe (koreanisches Tatar)."],
        ["[N Seoul Tower](https://www.seoultower.co.kr/en/intro/index) am Namsan", "zum Sonnenuntergang, für den Blick über die Stadt."],
      ],
      hikes: [
        ["[Seoul City Wall am Inwangsan](https://seoulcitywall.seoul.go.kr/en/wallcourse/6.do)", "2–3 Stunden, gut ausgebaute Stufen, schräge Felsen und Blick auf den Palast. Startpunkt ist 15 Minuten vom Hotel entfernt."],
        ["[Bukhansan-Nationalpark](https://english.visitseoul.net/nature/BukhansanNationalPark/ENP000369)", "die bequeme Variante durch das Gugi-dong-Tal, geführt und mit anschließendem Saunabesuch: [Private Bukhansan Hiking Tour & Korean Spa (Trazy)](https://www.trazy.com/experience/detail/private-bukhansan-hiking-tour-with-korean-spa). Die Route wird an die Kondition angepasst, Mittagessen und Hotelabholung sind inklusive."],
      ],
      tours: [
        ["[Night Dining Tour in Jongno mit Korean BBQ](https://ongofood.com/)", "[O'ngo Food Communications](https://www.expedia.com.au/things-to-do/small-group-korean-night-food-tour.a48906096.activity-details)", "3,5 – 4 Std., Start 17 Uhr an der Station Anguk", "ca. 95 € p. P."],
        ["[Nami-Insel](https://namisum-en.imweb.me/71) und [Garden of Morning Calm](http://www.morningcalm.co.kr/), privat", "[Lokalee – Private Tour](https://www.lokalee.app/en/tours/nami-island-and-garden-of-morning-calm-private-tour-from-seoul) oder als Gruppentour über [Klook](https://www.klook.com/activity/8962-nami-island-petite-france-railbike-garden-of-morning-calm-day-tour-seoul/)", "9 – 10 Std.", "privat ca. 300 – 400 € für 2, Gruppe ca. 60 € p. P."],
        ["[Bukhansan-Wanderung mit Spa](https://english.visitseoul.net/nature/BukhansanNationalPark/ENP000369)", "[Trazy](https://www.trazy.com/experience/detail/private-bukhansan-hiking-tour-with-korean-spa)", "ca. 6 Std.", "auf Anfrage, privat"],
      ],
      days: [
        ["{wd:2027-09-16}", "Landung ca. {flight:outArr} Uhr, Check-in. Nachmittags Gyeongbokgung (letzter Chuseok-Tag, oft mit Festprogramm), dann Spaziergang am Cheonggyecheon. Früh schlafen."],
        ["{wd:2027-09-17}", "Changdeokgung mit Geheimem Garten, Bukchon, mittags in Ikseon-dong. Nachmittags Insadong mit Teehaus. Abends Gwangjang-Markt."],
        ["{wd:2027-09-18}", "Vormittags Inwangsan an der Stadtmauer, danach Cafés in Seochon. Freier Nachmittag mit Sauna im Hotel. 17 Uhr O'ngo Night Dining Tour."],
        ["{wd:2027-09-19}", "Tagesausflug Nami-Insel und Garden of Morning Calm."],
        ["{wd:2027-09-20}", "Bukhansan-Wanderung mit Spa oder ein freier Tag. Abends N Seoul Tower."],
      ],
    },
    {
      id: "jeju",
      nr: 2,
      name: "Jeju",
      area: "Jungmun",
      checkIn: "2027-09-21",
      checkOut: "2027-09-26",
      // Suche im Hotel-Konfigurator (Xotelo/TripAdvisor). locationKey ist die TripAdvisor-Orts-ID;
      // urlMatch ist der Ortsname in den TripAdvisor-Links; die Action prüft damit, dass die
      // geladene Liste wirklich zum Ort gehört (und ermittelt so die ID, falls sie fehlt).
      // center ist der Bezugspunkt für "zentrale Lage".
      hotelSearch: { locationKey: "g297892", urlMatch: "Seogwipo", center: [33.2475, 126.4115], centerName: "Jungmun-Resortgebiet" },
      focus: "Strand, Olle-Küstenwege, Vulkanlandschaft",
      color: "#0e7490",
      intro:
        "Jeju ist eine Vulkaninsel und UNESCO-Welterbe. Ende September ist das Meer noch warm genug zum Baden, und die Küstenwege sind angenehm zu gehen. Ihr wohnt im Resortgebiet Jungmun an der Südküste. An zwei Tagen fährt euch ein Fahrer über die Insel, die übrigen Tage sind für Strand, Pool und kurze Wege da.",
      hotel: {
        todoId: "hotel-shilla", // zugehöriges To-do in data/todos.json, wird bei Hotelwechsel angepasst
        name: "The Shilla Jeju",
        url: "https://www.shilla.net/jeju",
        text:
          "Ein Fünf-Sterne-Resort mit tropischem Garten auf der Klippe und Blick auf den Pazifik, Mitglied der Leading Hotels of the World. Zum Strand Jungmun Saekdal sind es etwa 10 Minuten zu Fuß. Pools, Spa, Restaurants.",
        price: "ca. 350–500 € pro Nacht",
        priceMin: 350,
        priceMax: 500,
      },
      sights: [
        ["[Jungmun Saekdal Beach](https://www.visitjeju.net/en/detail/view?contentsid=CONT_000000000500604)", "Sandstrand vor dem Hotel, gut zum Baden und Sonnenuntergang."],
        ["[Daepo Jusangjeolli](https://www.visitjeju.net/en/detail/view?contentsid=CNTS_000000000020476)", "bis zu 25 m hohe Basaltsäulen an der Küste, 10 Minuten vom Hotel."],
        ["[Seongsan Ilchulbong („Sonnenaufgangsgipfel“)](https://www.visitjeju.net/en/detail/view?contentsid=CONT_000000000500349)", "Tuffkegel am Meer, UNESCO-Welterbe. Der Aufstieg dauert 20–30 Minuten, ist leicht, aber hat viele Stufen. Unten zeigen die Haenyeo, die traditionellen Taucherinnen, ihre Arbeit."],
        ["[Seopjikoji](https://www.visitjeju.net/en/detail/view?contentsid=CONT_000000000500343)", "Küstenweg mit Leuchtturm und Blick auf Seongsan."],
        ["[Saryeoni Forest Path](https://www.visitjeju.net/en/detail/view?contentsid=CONT_000000000500281)", "Zedern- und Zypressenwald, ebener Weg, sehr ruhig."],
        ["[Osulloc Tea Museum](https://us.osulloc.com/osulloc-tea-museum)", "Teefelder, Teeverkostung, Grüntee-Desserts."],
        ["[Sanbangsan](https://www.visitjeju.net/en/detail/view?contentsid=CONT_000000000500285) und [Yongmeori-Küste](https://www.visitjeju.net/en/detail/view?contentsid=CONT_000000000500471)", "Gesteinsschichten am Meer, am besten bei Ebbe."],
        ["[Hyeopjae Beach](https://www.visitjeju.net/en/detail/view?contentsid=CONT_000000000500697)", "türkisfarbenes Wasser mit Blick auf die Insel Biyangdo."],
        ["[Essen](https://www.visitjeju.net/en/themtour/view?contentsid=CNTS_200000000007162)", "Heukdwaeji (Grillfleisch vom schwarzen Jeju-Schwein), Jeonbok-juk (Abalone-Reisbrei), frischer Fisch am [Seogwipo Maeil Olle Market](https://www.visitjeju.net/en/detail/view?contentsid=CONT_000000000500731)."],
      ],
      hikes: [
        ["[Jeju Olle Trail](http://www.jejuolle.org/trail/eng/), Route 7, erster Teil", "von Oedolgae (einer 20 m hohen Felsnadel) bis zum Hafen Beophwan. Etwa 2–3 Stunden an der Steilküste, gilt als schönster Abschnitt. Mehr Planungstipps im [Olle Trail Guide](https://jejuolletrailguide.net/)."],
        ["[Eoseungsaengak am Hallasan](https://www.visitjeju.net/en/detail/view?contentsid=CONT_000000000500685)", "1,3 km zum Kraterrand, etwa 30 Minuten pro Strecke, mit Blick auf den Gipfel des Hallasan. Das ist die leichte Variante, ohne Reservierung. Der Gipfelweg ist ganztägig und muss über das [offizielle Hallasan-Reservierungssystem](https://visithalla.jeju.go.kr/contents/contents.do?id=49&language=en_US) gebucht werden."],
      ],
      tours: [
        ["Privatwagen mit Fahrer, eigene Route (2 Tage)", "[Klook – Jeju Private Car Charter](https://www.klook.com/activity/174339-jeju-private-transfer/) oder der [Global Taxi Tour der Provinz Jeju](https://www.visitjeju.net/en/themtour/view?contentsid=CNTS_200000000012778) mit englischsprachigem Fahrer", "9 Std. pro Tag", "ca. 170 – 235 € pro Tag"],
        ["UNESCO-Stätten auf Jeju (Hintergrund)", "[UNESCO – Jeju Volcanic Island and Lava Tubes](https://whc.unesco.org/en/list/1264)", "–", "–"],
        ["Olle-Wanderung (selbst geführt)", "[Jeju Olle Foundation](http://www.jejuolle.org/trail/eng/)", "2 – 3 Std.", "kostenlos"],
      ],
      days: [
        ["{wd:2027-09-21}", "Vormittags Flug nach Jeju, Transfer. Nachmittags am Strand Jungmun Saekdal, Sonnenuntergang an den Basaltsäulen von Daepo."],
        ["{wd:2027-09-22}", "Olle Route 7 von Oedolgae bis zum Hafen Beophwan, Mittagessen in Seogwipo, Olle-Markt. Abends Cheonjiyeon-Wasserfall."],
        ["{wd:2027-09-23}", "Mit Fahrer in den Osten: früh auf den Seongsan Ilchulbong, Vorführung der Haenyeo, Seopjikoji, Café am Strand Woljeong-ri, Saryeoni Forest Path."],
        ["{wd:2027-09-24}", "Strand- und Ruhetag: Pool, Spa, Jungmun-Strand. Abends Grillen mit schwarzem Jeju-Schwein."],
        ["{wd:2027-09-25}", "Mit Fahrer in den Westen: Eoseungsaengak am Hallasan, Osulloc-Teefelder, Hyeopjae Beach, Sanbangsan und Yongmeori-Küste."],
        ["{wd:2027-09-26}", "Vormittags Flug nach Busan."],
      ],
    },
    {
      id: "busan",
      nr: 3,
      name: "Busan",
      area: "Haeundae",
      checkIn: "2027-09-26",
      checkOut: "2027-09-30",
      // Suche im Hotel-Konfigurator (Xotelo/TripAdvisor). locationKey ist die TripAdvisor-Orts-ID;
      // urlMatch ist der Ortsname in den TripAdvisor-Links; die Action prüft damit, dass die
      // geladene Liste wirklich zum Ort gehört (und ermittelt so die ID, falls sie fehlt).
      // center ist der Bezugspunkt für "zentrale Lage".
      hotelSearch: { locationKey: "g297884", urlMatch: "Busan", center: [35.1587, 129.1604], centerName: "Haeundae Beach" },
      focus: "Stadtstrand, Fischmarkt, Küstenwanderung",
      color: "#1d4ed8",
      intro:
        "In Busan kommen Großstadt und Meer zusammen. Ihr wohnt direkt am Strand von Haeundae und erkundet von dort Fischmärkte, Tempel an der Küste, bunte Hügelviertel und eine der schönsten Küstenwanderungen des Landes.",
      hotel: {
        todoId: "hotel-paradise", // zugehöriges To-do in data/todos.json, wird bei Hotelwechsel angepasst
        name: "Paradise Hotel Busan",
        url: "https://www.hotels.com/ho196599",
        text:
          "Fünf Sterne, direkt am Haeundae Beach, mit Balkonen zum Meer, Thermalbad im Freien, Pool und dem Spa Cimer. Das Spa ist am vierten Mittwoch im Monat geschlossen, im September 2027 ist das der 22.9., also bevor ihr ankommt.",
        price: "ca. 250–400 € pro Nacht",
        priceMin: 250,
        priceMax: 400,
      },
      sights: [
        ["[Haeundae Beach](https://www.visitbusan.net/index.do?lang_cd=en&menuCd=DOM_000000301001001000&uc_seq=373) und [Dongbaekseom](https://www.visitbusan.net/index.do?lang_cd=en&menuCd=DOM_000000301001001000&uc_seq=2274)", "Uferweg rund um die kleine Kamelien-Insel, vorbei am Nurimaru-Pavillon, mit Blick auf die Hochhäuser von Marine City."],
        ["[Haeundae Blueline Park](https://www.bluelinepark.com)", "Die bunten Sky Capsules fahren 7–10 m über der Küste von Mipo nach Cheongsapo. Weiter geht es mit dem Beach Train bis Songjeong. Tickets für die Sky Capsules werden [jeden Dienstag um 7 Uhr für vier Wochen im Voraus](https://www.trvlogue.com/en/busan-haeundae-blueline-park-booking-guide) freigeschaltet und sind schnell weg."],
        ["[Haedong Yonggungsa](https://www.visitbusan.net/index.do?lang_cd=en&menuCd=DOM_000000301001001000&uc_seq=261)", "buddhistischer Tempel direkt auf den Felsen am Meer."],
        ["[Jagalchi-Fischmarkt](https://www.visitbusan.net/index.do?lang_cd=en&menuCd=DOM_000000301003001000&uc_seq=412)", "Fisch unten aussuchen und oben zubereiten lassen."],
        ["[Gukje-Markt und BIFF-Platz](https://www.visitbusan.net/index.do?lang_cd=en&menuCd=DOM_000000302002001000&uc_seq=464)", "Streetfood wie Ssiat-Hotteok (Pfannkuchen mit Samenfüllung) und Eomuk (Fischkuchen)."],
        ["[Gamcheon Culture Village](https://www.visitbusan.net/index.do?lang_cd=en&menuCd=DOM_000000301001001000&uc_seq=365)", "bunte Häuser am Hang, Kunstinstallationen und Aussichtspunkte."],
        ["[Gwangalli Beach](https://www.visitbusan.net/index.do?lang_cd=en&menuCd=DOM_000000301001001000&uc_seq=377)", "abends mit Blick auf die beleuchtete Gwangan-Brücke, viele Bars und Fischrestaurants."],
        ["[Essen](https://www.visitbusan.net/index.do?lang_cd=en&menuCd=DOM_000000302003001000&uc_seq=1008)", "Dwaeji-gukbap (Schweinesuppe, Busans Klassiker), Milmyeon (kalte Weizennudeln), roher Fisch in Millak."],
      ],
      hikes: [
        ["[Igidae Coastal Walk](https://www.visitbusan.net/index.do?lang_cd=en&menuCd=DOM_000000302002001000&uc_seq=323)", "etwa 4,7 km und 2 Stunden auf Holzstegen und Pfaden an der Steilküste, mit Blick auf Gwangan-Brücke und Haeundae. Er endet am [Oryukdo Skywalk](https://www.visitbusan.net/index.do?lang_cd=en&menuCd=DOM_000000301001001000&uc_seq=278), einer Glasplattform über dem Meer."],
        ["[Mipo – Cheongsapo am Meer](https://www.visitbusan.net/index.do?lang_cd=en&menuCd=DOM_000000302002001000&uc_seq=980)", "der ebene Fußweg auf der alten Bahntrasse unter den Sky Capsules, etwa 2 km."],
      ],
      tours: [
        ["Sky Capsule und Beach Train", "[Haeundae Blueline Park (offiziell)](https://www.bluelinepark.com)", "ca. 30 Min. pro Strecke", "Sky Capsule ca. 35.000–50.000 KRW pro Kapsel für 2, Beach Train ca. 10.000–17.000 KRW p. P."],
        ["Selbst organisiert mit Taxi: [Haedong Yonggungsa](https://www.visitbusan.net/index.do?lang_cd=en&menuCd=DOM_000000301001001000&uc_seq=261), [Gamcheon](https://www.visitbusan.net/index.do?lang_cd=en&menuCd=DOM_000000301001001000&uc_seq=365), [Jagalchi](https://www.visitbusan.net/index.do?lang_cd=en&menuCd=DOM_000000301003001000&uc_seq=412)", "Taxi über die App Kakao T oder am Taxistand", "halbe Tage", "Taxi ca. 15.000–30.000 KRW pro Fahrt"],
      ],
      days: [
        ["{wd:2027-09-26}", "Ankunft, Strand von Haeundae, Uferweg um Dongbaekseom. Abends Blick von The Bay 101 auf Marine City."],
        ["{wd:2027-09-27}", "Sky Capsule von Mipo nach Cheongsapo, Muschelgrill in Cheongsapo, Beach Train bis Songjeong. Nachmittags Haedong Yonggungsa."],
        ["{wd:2027-09-28}", "Altstadt: Jagalchi-Markt mit Fischmittagessen, Gukje-Markt, Gamcheon Culture Village. Abends am Gwangalli Beach."],
        ["{wd:2027-09-29}", "Vormittags Igidae Coastal Walk und Oryukdo Skywalk. Nachmittags Thermalbad und Spa im Hotel."],
        ["{wd:2027-09-30}", "Später Check-out, Taxi nach Gyeongju."],
      ],
    },
    {
      id: "gyeongju",
      nr: 4,
      name: "Gyeongju",
      area: "Bomun",
      checkIn: "2027-09-30",
      checkOut: "2027-10-03",
      // Suche im Hotel-Konfigurator (Xotelo/TripAdvisor). locationKey ist die TripAdvisor-Orts-ID;
      // urlMatch ist der Ortsname in den TripAdvisor-Links; die Action prüft damit, dass die
      // geladene Liste wirklich zum Ort gehört (und ermittelt so die ID, falls sie fehlt).
      // center ist der Bezugspunkt für "zentrale Lage".
      hotelSearch: { locationKey: "g297888", urlMatch: "Gyeongju", center: [35.8357, 129.2129], centerName: "historisches Zentrum (Daereungwon)" },
      focus: "UNESCO-Tempel, Königsgräber, Hanok-Nächte",
      color: "#7c3aed",
      intro:
        "Gyeongju war fast 1.000 Jahre lang die Hauptstadt des Silla-Reiches. Man nennt die Stadt auch ein „Museum ohne Mauern“. Königsgräber, Tempel und Paläste liegen nah beieinander und sind leicht mit dem Fahrrad zu erreichen. Hier übernachtet ihr im Hanok.",
      hotel: {
        todoId: "hotel-ragung", // zugehöriges To-do in data/todos.json, wird bei Hotelwechsel angepasst
        name: "Ragung (Hanok-Hotel)",
        url: "https://bamboo-travel.co.uk/tours-of-south-korea/hotels/ragung",
        text:
          "Das erste Hanok-Hotel Koreas, gebaut im Stil eines Silla-Palastes, mit nur 16 Zimmern. Jedes Zimmer hat ein eigenes Thermalbad im Innenhof, Ondol-Fußbodenheizung und einen Holzpavillon. Es liegt beim Bomun-See, ins Zentrum fährt man 10 Minuten mit dem Taxi. Buchbar z. B. über [Yanolja/NOL](https://nol.yanolja.com/stay/domestic/3013831). Aktuelle Gäste schreiben, dass es kein Restaurant im Haus gibt. Abends nehmt ihr also ein Taxi zum Essen nach Hwangnidan-gil.",
        price: "ca. 150–300 € pro Nacht",
        priceMin: 150,
        priceMax: 300,
        alt:
          "**Alternative im Zentrum:** [Hwangnamguan Hanok Village](https://www.bamboo-travel.co.uk/tours-of-south-korea/hotels/hwangnamguan-hanok). Es ist einfacher und eher Mittelklasse, dafür erreicht ihr die Königsgräber und Hwangnidan-gil zu Fuß.",
      },
      sights: [
        ["[Bulguksa und Seokguram-Grotte](https://whc.unesco.org/en/list/736)", "UNESCO-Welterbe. Bulguksa ist der berühmteste Tempel Koreas, in der Grotte am Berg sitzt ein Granit-Buddha aus dem 8. Jahrhundert. Am besten früh am Morgen hin."],
        ["[Historisches Zentrum von Gyeongju](https://whc.unesco.org/en/list/976)", "Tumuli-Park Daereungwon mit dem begehbaren Grab Cheonmachong, die Sternwarte Cheomseongdae und das Dorf Gyochon."],
        ["[Donggung-Palast und Wolji-Teich](https://gyeongju.go.kr/open_content/english/page.do?mnu_uid=1371&pageNo=1&pageOrder=0&pagePrvNxt=1&pageRef=0&parm_bod_uid=147831&parm_mnu_uid=0&srchBgpUid=-1&srchColumn=&srchEDate=&srchEnable=1&srchKeyword=&srchSDate=&srchVoteType=-1&step=258)", "nach Einbruch der Dunkelheit beleuchtet, das ist der schönste Abendspaziergang der Stadt."],
        ["[Hwangnidan-gil](https://english.visitkorea.or.kr/svc/whereToGo/locIntrdn/rgnContentsView.do?vcontsId=174203)", "Hanok-Gasse mit Cafés, Bäckereien (Gyeongju-ppang) und Restaurants."],
        ["[Gyeongju-Nationalmuseum](https://gyeongju.museum.go.kr/eng/)", "Goldkronen der Silla-Könige und die Emille-Glocke."],
        ["[Bomun-See](https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=92226)", "ebener Rundweg am Wasser mit Fahrradverleih, nah am Hotel."],
        ["[Yangdong Folk Village (UNESCO)](https://whc.unesco.org/en/list/1324)", "gut erhaltenes Dorf des Adels aus der Joseon-Zeit, 30 Minuten mit dem Taxi."],
      ],
      hikes: [],
      tours: [
        ["Private UNESCO-Tour mit Guide, Abholung im Hotel", "[Private Gyeongju UNESCO Heritage Tour (Expedia)](https://www.expedia.ie/things-to-do/private-gyeongju-unesco-heritage-tour-with-a-local-guide.a52620643.activity-details)", "ca. 4,5 Std.", "auf Anfrage, privat"],
        ["[Radtour durch die historische Zone](https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=221789)", "selbst organisiert, Verleih am Haupttor von Daereungwon ([Infos der Stadt Gyeongju](https://www.gyeongju.go.kr/tour/eng/page.do?mnu_uid=2768))", "2 – 4 Std.", "ca. 5.000 – 10.000 KRW p. P."],
      ],
      days: [
        ["{wd:2027-09-30}", "Ankunft gegen Mittag, Check-in. Nachmittags Tumuli-Park, Cheomseongdae und Dorf Gyochon. Abends Donggung und Wolji-Teich, Abendessen in Hwangnidan-gil."],
        ["{wd:2027-10-01}", "Private UNESCO-Tour: Bulguksa und Seokguram am Morgen, danach Nationalmuseum. Am Abend Thermalbad im Innenhof des Hanok."],
        ["{wd:2027-10-02}", "Früh nach Yangdong (am Feiertagswochenende wird es voller), nachmittags Radtour am Bomun-See."],
        ["{wd:2027-10-03}", "Vormittags mit dem KTX nach Seoul."],
      ],
    },
    {
      id: "gangnam",
      nr: 5,
      name: "Seoul",
      area: "Gangnam",
      checkIn: "2027-10-03",
      checkOut: "2027-10-06",
      // Suche im Hotel-Konfigurator (Xotelo/TripAdvisor). locationKey ist die TripAdvisor-Orts-ID;
      // urlMatch ist der Ortsname in den TripAdvisor-Links; die Action prüft damit, dass die
      // geladene Liste wirklich zum Ort gehört (und ermittelt so die ID, falls sie fehlt).
      // center ist der Bezugspunkt für "zentrale Lage".
      hotelSearch: { locationKey: "g294197", urlMatch: "Seoul", center: [37.5115, 127.0595], centerName: "COEX / Bongeunsa" },
      focus: "Modernes Seoul, Shopping, Abschied",
      color: "#be185d",
      intro:
        "Zum Schluss lernt ihr die moderne Seite Seouls kennen: Gangnam, Wolkenkratzer, Design-Viertel und der Han-Fluss. Am Ende bleibt noch Zeit zum Einkaufen und für ein Abschiedsessen.",
      hotel: {
        todoId: "hotel-josun", // zugehöriges To-do in data/todos.json, wird bei Hotelwechsel angepasst
        name: "Josun Palace, a Luxury Collection Hotel",
        url: "https://guide.michelin.com/ch/de/hotels-stays/seoul/josun-palace-a-luxury-collection-hotel-seoul-12550",
        text:
          "In Gangnam. Es setzt die Tradition des ersten Luxushotels Koreas von 1914 fort und hat einen MICHELIN Key. Es gibt einen Innenpool mit Blick auf die Skyline, die COEX Mall und der Tempel Bongeunsa sind in der Nähe.",
        price: "ca. 350–550 € pro Nacht",
        priceMin: 350,
        priceMax: 550,
      },
      sights: [
        ["[Bongeunsa](http://temple.bongeunsa.org/public_html_en/intro/buddhist.asp)", "Tempel aus dem 8. Jahrhundert mitten zwischen den Bürotürmen."],
        ["[Starfield Library](https://m.starfield.co.kr/coexmall/library/intro?lang=en) in der COEX Mall", "Bibliothek mit 13 m hohen Bücherregalen, kostenlos."],
        ["[Lotte World Tower (Seoul Sky)](https://www.lwt.co.kr/en/entertainment/seoulsky.do) und [Seokchon-See](https://english.visitseoul.net/area/Seokchon-Lake-Park/ENP001136)", "Aussichtsplattform in 500 m Höhe mit Glasboden, unten ein Spaziergang am See."],
        ["[Seongsu-dong](https://english.visitseoul.net/editorspicks/2026-Seongsu/ENNky3epf)", "ehemaliges Fabrikviertel mit Cafés, Concept Stores und Pop-up-Shops von K-Beauty- und Modemarken."],
        ["[Apgujeong und Garosu-gil](https://english.visitseoul.net/shopping/Garosu-gil-in-Sinsadong/ENP000291)", "Boutiquen, Designer-Mode, Restaurants."],
        ["[Han-Fluss](https://english.visitseoul.net/attractions--/Hangang-River_/15167)", "Abendfahrt mit dem Schiff ([E-Land Cruise](https://www.elandcruise.com/)) oder Picknick im [Banpo-Hangang-Park](https://english.visitseoul.net/area/Banpo-Hangang-Park/ENP003968). Der [Mondlicht-Regenbogenbrunnen](https://english.visitseoul.net/area/Banpodaegyo-Bridge-Moonlight-Rainbow-Fountain/ENP002220) an der Banpo-Brücke läuft je nach Saison bis Oktober."],
        ["[Mangwon-Markt](https://english.visitseoul.net/shopping/Mangwon-Market/ENP037950) und [Yeonnam-dong](https://english.visitseoul.net/nature/Gyeongui-Line-Forest-Park_/37216)", "Streetfood auf dem Markt und Cafés am Gyeongui-Line-Park."],
      ],
      hikes: [],
      tours: [],
      days: [
        ["{wd:2027-10-03}", "Ankunft mit dem KTX, Check-in. Nachmittags Bongeunsa und Starfield Library. Abends Bootsfahrt auf dem Han-Fluss oder Banpo-Park."],
        ["{wd:2027-10-04}", "Ersatzfeiertag, die Stadt ist voll. Vormittags früh Seoul Sky und Seokchon-See, nachmittags Seongsu-dong."],
        ["{wd:2027-10-05}", "Mangwon-Markt und Yeonnam-dong, Einkaufen in Apgujeong oder Myeongdong. Abschiedsessen in einem Restaurant mit koreanischer Fine-Dining-Küche, Reservierung über die App CatchTable."],
        ["{wd:2027-10-06}", "Taxi nach {flight:retFromName}, Rückflug {flight:retCode} um ca. {flight:retDep} Uhr, Ankunft in {flight:retToName} ca. {flight:retArr} Uhr."],
      ],
    },
  ],

  flights: {
    intro:
      "Nonstop in Business Class gibt es nur ab Frankfurt. Von Köln und Düsseldorf aus ist man mit dem ICE in etwa 1 bzw. 1,5 Stunden am Frankfurter Flughafen. Mit Lufthansa lässt sich diese Zugfahrt als Lufthansa Express Rail direkt im Flugticket buchen. Nonstop fliegen auf der Strecke [Lufthansa, Korean Air, Asiana und T'way](https://www.flightconnections.com/flights-from-fra-to-icn), die Flugzeit beträgt rund 11 Std. 20 Min. hin und 13–14 Std. zurück.",
    longhaulHead: ["Airline", "Route", "Frequenz (Stand 2026)", "Business-Produkt", "Preis p. P. hin/zurück"],
    longhaul: [
      ["[Lufthansa](https://www.lufthansa.com)", "FRA–ICN nonstop", "täglich, A350-900", "Business mit Liegesitz", "ca. 2.400 – 3.800 €"],
      ["[Korean Air](https://www.koreanair.com)", "FRA–ICN nonstop", "3× pro Woche, B777-300ER", "Prestige Class", "Angebote [ab 2.439 €](https://reisetopia.de/deals/business-class-angebot-korean-air-deutschland-seoul/), sonst bis ca. 3.800 €"],
      ["[Asiana](https://flyasiana.com)", "FRA–ICN nonstop", "ca. 4× pro Woche, A350-900", "Business Smartium", "ca. 2.200 – 3.500 €"],
      ["[T'way Air](https://www.twayair.com)", "FRA–ICN nonstop", "bis täglich, A330", "„Business Saver“ (einfacher, kein Vollflachbett-Standard)", "[ab ca. 1.600 €](https://frankfurtflyer.de/tag/seoul-icn)"],
      ["[Finnair](https://www.finnair.com)", "DUS/FRA–HEL–ICN, 1 Stopp", "täglich", "Business mit Vollflachbett", "[ab ca. 1.530 €](https://frankfurtflyer.de/tag/seoul-icn)"],
    ],
    recommendation:
      "Lufthansa hin und zurück, oder Korean Air an den Tagen, an denen sie fliegt. Beide fliegen nonstop, auf beiden gibt es ein Vollflachbett, und das Gepäck geht durch. Finnair ist die günstige Alternative mit einem Stopp, auch ab Düsseldorf.",
    proposed: [
      { label: "Hinflug", date: "Mi 15.9.2027", code: "LH712", from: "Frankfurt", fromTime: "ca. 16:05", to: "Seoul-Incheon", toTime: "ca. 10:00 (Do 16.9.)" },
      { label: "Rückflug", date: "Mi 6.10.2027", code: "LH713", from: "Seoul-Incheon", fromTime: "ca. 13:00", to: "Frankfurt", toTime: "ca. 19:15", alt: "oder KE945 ca. 11:00 → 17:30 (falls Korean Air an dem Tag fliegt)" },
    ],
    proposedNote: "Uhrzeiten laut Flugplan 2026, vor Buchung prüfen.",
    // Angaben zum Langstreckenflug für die Platzhalter {flight:…} in den Texten (Planvorschlag).
    // Wird in der Flugsuche ein Flug gewählt, stehen dort dessen Werte.
    planInfo: {
      outCode: "LH712", retCode: "LH713", codes: "LH712 / LH713",
      outDep: "16:05", outArr: "10:00", retDep: "13:00", retArr: "19:15",
      outFromName: "Frankfurt", outToName: "Incheon", retFromName: "Incheon", retToName: "Frankfurt",
      outStops: "nonstop",
    },
    // Flugsuche (js/flights.js, Action "Flugdaten aktualisieren"): Auswahl der Flughäfen in der Suchmaske
    search: {
      origins: [["FRA", "Frankfurt"], ["DUS", "Düsseldorf"], ["CGN", "Köln/Bonn"]],
      destinations: [["ICN", "Seoul-Incheon"], ["GMP", "Seoul-Gimpo"]],
      todoId: "flug-langstrecke", // Buchungs-To-do, wird bei der Flugwahl angepasst
    },
    // Inlandsflüge für die Flugsuche. Geflogen wird am Abreisetag der Station "after";
    // "transfer" ist die Strecke in der Transfer-Tabelle, die Reihenfolge entspricht "domestic".
    domesticRoutes: [
      { id: "gmp-cju", from: "GMP", to: "CJU", fromName: "Seoul-Gimpo", toName: "Jeju", after: "seoul", transfer: "Gimpo → Jeju" },
      { id: "cju-pus", from: "CJU", to: "PUS", fromName: "Jeju", toName: "Busan-Gimhae", after: "jeju", transfer: "Jeju → Busan" },
    ],
    domesticTodoId: "inlandsfluege",
    priceTips: [
      "Dienstag und Mittwoch als Abflugtag wählen, Freitag und Sonntag meiden.",
      "In Google Flights den Kalender für ±3 Tage ansehen. Wenn der 14.9. oder 16.9. deutlich günstiger ist, verschiebt sich der Plan nur um einen Tag.",
      "Für Mitte September 2027 sind Flüge schon jetzt buchbar. Richtet Preisalarme ein und bucht spätestens im Frühjahr 2027.",
    ],
    domesticHead: ["Datum", "Strecke", "Dauer", "Airlines", "Preis p. P. (Economy)"],
    domestic: [
      ["{wd:2027-09-21}", "Seoul-Gimpo (GMP) → Jeju (CJU)", "ca. 1 Std. 10 Min.", "Korean Air, Asiana, Jeju Air, Jin Air u. a.", "ca. 60.000 – 150.000 KRW (40 – 100 €)"],
      ["{wd:2027-09-26}", "Jeju (CJU) → Busan-Gimhae (PUS)", "ca. 55 Min.", "Korean Air, Air Busan, Jeju Air u. a.", "ca. 50.000 – 120.000 KRW (35 – 80 €)"],
    ],
    domesticNote:
      "Korean Air bietet auf Inlandsflügen eine Prestige Class mit breiteren Sitzen an. Bei so kurzen Flügen lohnt sich der Aufpreis aber kaum. Ein Flug am Vormittag ist meist günstiger als am späten Nachmittag.",
  },

  transfers: {
    intro:
      "Alle Transfers zusammen kosten für zwei Personen rund 700–1.100 €, darin sind die Inlandsflüge und zwei Fahrertage auf Jeju enthalten. Mit Gepäck ist von Tür zu Tür meist das Taxi die bequemste Lösung. In Korea sind Taxis günstig, und die App Kakao T funktioniert auch mit ausländischer Kreditkarte.",
    head: ["Datum", "Von → Nach", "Verkehrsmittel", "Dauer", "Preis (2 Pers., Richtwert)"],
    // {hotel:<station-id>} wird durch den Namen des gewählten Hotels ersetzt.
    rows: [
      ["{wd:2027-09-15}", "Köln/Düsseldorf → Flughafen Frankfurt", "ICE bzw. Lufthansa Express Rail", "1 – 1,5 Std.", "im LH-Ticket enthalten bzw. ca. 60 – 180 €"],
      ["{wd:2027-09-16}", "{flight:outToName} → {hotel:seoul}", "Taxi oder Hotellimousine; Alternative: [AREX Express](https://www.arex.or.kr) bis Seoul Station + Taxi", "60 – 75 Min.", "Taxi ca. 80.000 – 110.000 KRW (55 – 75 €); AREX 13.000 KRW p. P."],
      ["{wd:2027-09-21}", "{hotel:seoul} → Flughafen Gimpo", "Taxi", "ca. 35 Min.", "ca. 30.000 – 40.000 KRW (20 – 27 €)"],
      ["{wd:2027-09-21}", "Gimpo → Jeju", "Inlandsflug", "1 Std. 10 Min.", "ca. 120.000 – 300.000 KRW (80 – 200 €)"],
      ["{wd:2027-09-21}", "Flughafen Jeju → {hotel:jeju}", "Taxi; Alternative: Flughafen-Limousinenbus 600", "ca. 50 Min.", "Taxi ca. 50.000 – 60.000 KRW (35 – 40 €)"],
      ["{wd:2027-09-23} + {wd:2027-09-25}", "Inselrundfahrten Jeju", "[Privatwagen mit Fahrer, 9 Std.](https://www.klook.com/activity/174339-jeju-private-transfer/)", "ganztägig", "ca. 250.000 – 350.000 KRW pro Tag (170 – 235 €) inkl. Benzin, Maut, Parken"],
      ["{wd:2027-09-26}", "{hotel:jeju} → Flughafen Jeju", "Taxi", "ca. 50 Min.", "ca. 50.000 – 60.000 KRW (35 – 40 €)"],
      ["{wd:2027-09-26}", "Jeju → Busan", "Inlandsflug", "55 Min.", "ca. 100.000 – 240.000 KRW (70 – 160 €)"],
      ["{wd:2027-09-26}", "Flughafen Gimhae → {hotel:busan}", "Taxi", "35 – 50 Min.", "ca. 40.000 – 50.000 KRW (27 – 33 €)"],
      ["{wd:2027-09-30}", "{hotel:busan} → {hotel:gyeongju}", "Taxi direkt (bequemste Lösung); Alternative: KTX Busan → Gyeongju (30 Min., 11.900 KRW p. P.) plus zwei Taxis", "60 – 70 Min.", "Taxi ca. 110.000 – 140.000 KRW (75 – 95 €)"],
      ["{wd:2027-10-03}", "{hotel:gyeongju} → Bahnhof Gyeongju (früher Singyeongju)", "Taxi", "ca. 25 Min.", "ca. 20.000 – 25.000 KRW (15 €)"],
      ["{wd:2027-10-03}", "Gyeongju → Seoul Station", "[KTX](https://www.letskorail.com), First Class empfohlen", "ca. 2 Std.", "Standard ca. 89.000 KRW, First ca. 128.000 KRW (60 bzw. 85 €)"],
      ["{wd:2027-10-03}", "Seoul Station → {hotel:gangnam}", "Taxi", "30 – 40 Min.", "ca. 20.000 – 25.000 KRW (15 €)"],
      ["{wd:2027-10-06}", "{hotel:gangnam} → {flight:retFromName}", "Taxi oder Flughafen-Limousinenbus", "70 – 80 Min.", "Taxi ca. 90.000 – 120.000 KRW (60 – 80 €)"],
    ],
    note:
      "Seit dem 1.9.2026 sind KTX und SRT zusammengelegt, und die KTX-Preise sind im Schnitt um etwa 10 % gesunken. Laut [aktueller Preisübersicht](https://www.seoultourism.org/?p=1841) kostet Seoul–Gyeongju rund 44.500 KRW in der Standardklasse, First Class kostet etwa 40–50 % mehr. Tickets gibt es ab einem Monat vor der Fahrt. Am 3.10. ist ein langes Feiertagswochenende, bucht die Züge also gleich zum Verkaufsstart.",
  },

  tips: [
    {
      title: "Einreise",
      icon: "🛂",
      text:
        "Deutsche brauchen kein Visum. Bis 31.12.2026 sind sie [von der K-ETA befreit](https://discover.passportindex.org/policy-and-regulations/south-korea-extends-k-eta-exemption-until-end-of-2026/). [Für 2027 gibt es noch keine offizielle Entscheidung](https://pixidia.com/?p=88591). Wenn die Befreiung endet, beantragt ihr die K-ETA vor der Reise auf k-eta.go.kr (10.000 KRW, bis zu 72 Std. Bearbeitung). Ohne K-ETA füllt ihr die elektronische Ankunftskarte aus.",
    },
    {
      title: "Buchungsfristen",
      icon: "📅",
      list: [
        "Flüge: jetzt Preisalarme setzen, bis Frühjahr 2027 buchen",
        "Hotels: 6–9 Monate vorher, Ragung wegen der nur 16 Zimmer zuerst",
        "Geheimer Garten (Changdeokgung): Reservierung online, einige Wochen vorher",
        "Sky Capsules in Busan: Freischaltung jeweils 4 Wochen vorher, dienstags 7 Uhr",
        "KTX: Verkauf ab einem Monat vorher, Fahrt am {d:2027-10-03} gleich am ersten Tag buchen",
        "Fahrer auf Jeju: 2–3 Monate vorher",
      ],
    },
    {
      title: "Wetter",
      icon: "☀️",
      text:
        "In Seoul hat es Mitte bis Ende September tagsüber etwa 22–27 °C, Anfang Oktober 18–23 °C. Auf Jeju ist es wärmer, das Meer hat etwa 24–26 °C. Bis Anfang Oktober kann noch ein Taifun kommen, plant also auf Jeju einen Puffertag ein.",
    },
    {
      title: "Feiertage während der Reise",
      icon: "🎑",
      text:
        "Chuseok am 14.–16.9. (bei eurer Ankunft schon vorbei), Nationalfeiertag am 3.10. mit Ersatzfeiertag am 4.10., Hangeul-Tag am 9.10. (nach eurem Abflug).",
    },
    {
      title: "Apps",
      icon: "📱",
      text:
        "Naver Map (Google Maps ist in Korea unzuverlässig), Kakao T (Taxi), Papago (Übersetzen), CatchTable (Restaurants), Korail Talk (KTX).",
    },
    {
      title: "Geld und Bezahlen",
      icon: "💳",
      text:
        "Kreditkarte geht fast überall. Für Märkte etwas Bargeld mitnehmen. Eine T-money-Karte gibt es im Convenience Store, damit fahrt ihr U-Bahn und Bus.",
    },
    {
      title: "Mobil",
      icon: "📶",
      text: "eSIM vor der Reise kaufen, damit Navigation und Taxi-App ab der Landung funktionieren.",
    },
  ],

  sources: [
    "Direktverbindungen FRA–ICN: [FlightConnections](https://www.flightconnections.com/flights-from-fra-to-icn), [AirportOverview](https://www.airportoverview.com/routes/FRA/ICN)",
    "Business-Class-Preise: [reisetopia – Korean Air ab 2.439 €](https://reisetopia.de/deals/business-class-angebot-korean-air-deutschland-seoul/), [Frankfurtflyer – T'way/Finnair](https://frankfurtflyer.de/tag/seoul-icn)",
    "Feiertage 2027: [publicholidays.co.kr – Chuseok](https://publicholidays.co.kr/chuseok/), [Klook – Feiertage 2027](https://www.klook.com/blog/south-korea-public-holidays/)",
    "KTX-Preise nach der Fusion: [Seoul Tourism – Korail-Pass und Preise 2026](https://www.seoultourism.org/?p=1841), [Financial News – KTX-SRT-Fusion](https://en.fnnews.com/news/202609011328241250)",
    "AREX: [The Seoul Guide](https://www.theseoulguide.com/frequently-asked-questions/how-to-get-from-incheon-international-airport-to-seoul-station/)",
    "K-ETA: [Passport Index](https://discover.passportindex.org/policy-and-regulations/south-korea-extends-k-eta-exemption-until-end-of-2026/)",
    "Wechselkurs: [Pound Sterling Live – EUR/KRW](https://www.poundsterlinglive.com/data/currencies/eur-pairs/EURKRW-exchange-rate)",
  ],
};

// Geplante Module – werden später ergänzt
window.MODULES_PLANNED = [];
