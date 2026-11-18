// Reisedaten – Quelle: Doc "Südkorea-Rundreise Sept./Okt. 2027 – Reiseplan"
// Links im Text: [Text](https://url)
window.TRIP = {
  title: "Südkorea-Rundreise",
  subtitle: "Sept./Okt. 2027 · 20 Nächte · 5 Stationen",
  departure: "2027-09-15T16:05:00+02:00",
  returnDate: "2027-10-06",
  intro:
    "Abflug am Mittwoch, 15.9.2027, ab Frankfurt nonstop nach Seoul, Rückflug am Mittwoch, 6.10.2027: 20 Nächte in fünf Unterkünften. Die Reihenfolge wurde gegenüber der ersten Skizze gedreht – Jeju kommt direkt nach Seoul. So liegt die Strandwoche Ende September, wenn das Meer noch rund 25 °C hat, und Jeju ist vor der chinesischen Feiertagswoche (1.–7.10.) schon erledigt.",
  why:
    "Das Erntedankfest Chuseok ist am 14.–16.9.2027. Danach fliegen viele Koreaner aus Europa zurück. Wer am 15.9. hinfliegt, ist vor dieser Welle unterwegs. In Seoul selbst ist es am Chuseok-Tag ruhig, Paläste haben geöffnet. Der Rückflug am 6.10. liegt vor dem langen Wochenende zum Hangeul-Tag (9.–11.10.). Dienstag und Mittwoch sind für Langstrecke meist die günstigsten Flugtage.",

  costs: {
    title: "Kostenschätzung für zwei Personen (gerundet, 1 € ≈ 1.500 KRW)",
    // Beträge in Euro. Die Zeile "hotels" wird aus den Hotels der Stationen berechnet
    // (gewähltes Hotel aus dem Konfigurator, sonst die Richtwerte priceMin/priceMax).
    rows: [
      { label: "Flüge Business Class FRA–Seoul hin/zurück", min: 3400, max: 7000 },
      { id: "hotels", label: "Hotels, 20 Nächte" },
      { label: "Inlandsflüge, Züge, Taxis, 2 Fahrertage auf Jeju", min: 700, max: 1100 },
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
      dates: "16.–21.9.",
      nights: 5,
      checkIn: "2027-09-16",
      checkOut: "2027-09-21",
      // Suche im Hotel-Konfigurator (Xotelo/TripAdvisor). locationKey ist die TripAdvisor-Orts-ID;
      // fehlt sie, wird sie über query ermittelt. center ist der Bezugspunkt für "zentrale Lage".
      hotelSearch: { locationKey: "g294197", query: "Seoul", center: [37.5720, 126.9769], centerName: "Gwanghwamun-Platz" },
      focus: "Paläste, Märkte, Food-Tour, Tagesausflug ins Grüne",
      color: "#c2410c",
      intro:
        "Im ersten Teil seht ihr das historische Seoul. Paläste, Hanok-Viertel und Märkte erreicht ihr vom Hotel aus zu Fuß. Dazu kommen eine abendliche Food-Tour und ein Tag im Grünen.",
      hotel: {
        name: "Four Seasons Hotel Seoul",
        url: "https://www.fourseasons.com/seoul/",
        text:
          "In Gwanghwamun. Zum Gyeongbokgung-Palast und zum Gwanghwamun-Platz sind es etwa 8 Minuten zu Fuß. Es gibt eine koreanische Sauna, einen Pool und das Sternerestaurant Yu Yuan (kantonesisch).",
        price: "ca. 450–650 € pro Nacht",
        priceMin: 450,
        priceMax: 650,
      },
      sights: [
        ["Gyeongbokgung", "der größte Königspalast, mit Wachwechsel am Gwanghwamun-Tor. Dienstags geschlossen."],
        ["Changdeokgung und Geheimer Garten (Huwon)", "UNESCO-Welterbe. Den Garten sieht man nur mit Führung, Tickets vorab reservieren. Montags geschlossen."],
        ["Bukchon Hanok Village und Ikseon-dong", "Gassen mit traditionellen Häusern, Teehäuser, kleine Boutiquen. In Bukchon gelten feste Besuchszeiten am Tag, bitte ruhig verhalten."],
        ["Insadong und Cheonggyecheon", "Kunsthandwerk, Galerien und ein Spaziergang am Bach mitten in der Stadt."],
        ["Gwangjang-Markt", "ältester überdachter Markt der Stadt, mit Bindaetteok (Mungbohnen-Pfannkuchen), Mayak-Gimbap und Yukhoe (koreanisches Tatar)."],
        ["N Seoul Tower am Namsan", "zum Sonnenuntergang, für den Blick über die Stadt."],
      ],
      hikes: [
        ["Seoul City Wall am Inwangsan", "2–3 Stunden, gut ausgebaute Stufen, schräge Felsen und Blick auf den Palast. Startpunkt ist 15 Minuten vom Hotel entfernt."],
        ["Bukhansan-Nationalpark", "die bequeme Variante durch das Gugi-dong-Tal, geführt und mit anschließendem Saunabesuch: [Private Bukhansan Hiking Tour & Korean Spa (Trazy)](https://www.trazy.com/experience/detail/private-bukhansan-hiking-tour-with-korean-spa). Die Route wird an die Kondition angepasst, Mittagessen und Hotelabholung sind inklusive."],
      ],
      tours: [
        ["Night Dining Tour in Jongno mit Korean BBQ", "[O'ngo Food Communications](https://www.expedia.com.au/things-to-do/small-group-korean-night-food-tour.a48906096.activity-details)", "3,5 – 4 Std., Start 17 Uhr an der Station Anguk", "ca. 95 € p. P."],
        ["Nami-Insel und Garden of Morning Calm, privat", "[Lokalee – Private Tour](https://www.lokalee.app/en/tours/nami-island-and-garden-of-morning-calm-private-tour-from-seoul) oder als Gruppentour über [Klook](https://www.klook.com/activity/8962-nami-island-petite-france-railbike-garden-of-morning-calm-day-tour-seoul/)", "9 – 10 Std.", "privat ca. 300 – 400 € für 2, Gruppe ca. 60 € p. P."],
        ["Bukhansan-Wanderung mit Spa", "[Trazy](https://www.trazy.com/experience/detail/private-bukhansan-hiking-tour-with-korean-spa)", "ca. 6 Std.", "auf Anfrage, privat"],
      ],
      days: [
        ["Do 16.9.", "Landung ca. 10 Uhr, Check-in. Nachmittags Gyeongbokgung (letzter Chuseok-Tag, oft mit Festprogramm), dann Spaziergang am Cheonggyecheon. Früh schlafen."],
        ["Fr 17.9.", "Changdeokgung mit Geheimem Garten, Bukchon, mittags in Ikseon-dong. Nachmittags Insadong mit Teehaus. Abends Gwangjang-Markt."],
        ["Sa 18.9.", "Vormittags Inwangsan an der Stadtmauer, danach Cafés in Seochon. Freier Nachmittag mit Sauna im Hotel. 17 Uhr O'ngo Night Dining Tour."],
        ["So 19.9.", "Tagesausflug Nami-Insel und Garden of Morning Calm."],
        ["Mo 20.9.", "Bukhansan-Wanderung mit Spa oder ein freier Tag. Abends N Seoul Tower."],
      ],
    },
    {
      id: "jeju",
      nr: 2,
      name: "Jeju",
      area: "Jungmun",
      dates: "21.–26.9.",
      nights: 5,
      checkIn: "2027-09-21",
      checkOut: "2027-09-26",
      // Suche im Hotel-Konfigurator (Xotelo/TripAdvisor). locationKey ist die TripAdvisor-Orts-ID;
      // fehlt sie, wird sie über query ermittelt. center ist der Bezugspunkt für "zentrale Lage".
      hotelSearch: { query: "The Shilla Jeju", center: [33.2475, 126.4115], centerName: "Jungmun-Resortgebiet" },
      focus: "Strand, Olle-Küstenwege, Vulkanlandschaft",
      color: "#0e7490",
      intro:
        "Jeju ist eine Vulkaninsel und UNESCO-Welterbe. Ende September ist das Meer noch warm genug zum Baden, und die Küstenwege sind angenehm zu gehen. Ihr wohnt im Resortgebiet Jungmun an der Südküste. An zwei Tagen fährt euch ein Fahrer über die Insel, die übrigen Tage sind für Strand, Pool und kurze Wege da.",
      hotel: {
        name: "The Shilla Jeju",
        url: "https://www.shilla.net/jeju",
        text:
          "Ein Fünf-Sterne-Resort mit tropischem Garten auf der Klippe und Blick auf den Pazifik, Mitglied der Leading Hotels of the World. Zum Strand Jungmun Saekdal sind es etwa 10 Minuten zu Fuß. Pools, Spa, Restaurants.",
        price: "ca. 350–500 € pro Nacht",
        priceMin: 350,
        priceMax: 500,
      },
      sights: [
        ["Jungmun Saekdal Beach", "Sandstrand vor dem Hotel, gut zum Baden und Sonnenuntergang."],
        ["Daepo Jusangjeolli", "bis zu 25 m hohe Basaltsäulen an der Küste, 10 Minuten vom Hotel."],
        ["Seongsan Ilchulbong („Sonnenaufgangsgipfel“)", "Tuffkegel am Meer, UNESCO-Welterbe. Der Aufstieg dauert 20–30 Minuten, ist leicht, aber hat viele Stufen. Unten zeigen die Haenyeo, die traditionellen Taucherinnen, ihre Arbeit."],
        ["Seopjikoji", "Küstenweg mit Leuchtturm und Blick auf Seongsan."],
        ["Saryeoni Forest Path", "Zedern- und Zypressenwald, ebener Weg, sehr ruhig."],
        ["Osulloc Tea Museum", "Teefelder, Teeverkostung, Grüntee-Desserts."],
        ["Sanbangsan und Yongmeori-Küste", "Gesteinsschichten am Meer, am besten bei Ebbe."],
        ["Hyeopjae Beach", "türkisfarbenes Wasser mit Blick auf die Insel Biyangdo."],
        ["Essen", "Heukdwaeji (Grillfleisch vom schwarzen Jeju-Schwein), Jeonbok-juk (Abalone-Reisbrei), frischer Fisch am Seogwipo Maeil Olle Market."],
      ],
      hikes: [
        ["[Jeju Olle Trail](http://www.jejuolle.org/trail/eng/), Route 7, erster Teil", "von Oedolgae (einer 20 m hohen Felsnadel) bis zum Hafen Beophwan. Etwa 2–3 Stunden an der Steilküste, gilt als schönster Abschnitt. Mehr Planungstipps im [Olle Trail Guide](https://jejuolletrailguide.net/)."],
        ["Eoseungsaengak am Hallasan", "1,3 km zum Kraterrand, etwa 30 Minuten pro Strecke, mit Blick auf den Gipfel des Hallasan. Das ist die leichte Variante, der Gipfelweg ist ganztägig."],
      ],
      tours: [
        ["Privatwagen mit Fahrer, eigene Route (2 Tage)", "[Klook – Jeju Private Car Charter](https://www.klook.com/activity/174339-jeju-private-transfer/)", "9 Std. pro Tag", "ca. 170 – 235 € pro Tag"],
        ["UNESCO-Stätten auf Jeju (Hintergrund)", "[UNESCO – Jeju Volcanic Island and Lava Tubes](https://whc.unesco.org/en/list/1264)", "–", "–"],
        ["Olle-Wanderung (selbst geführt)", "[Jeju Olle Foundation](http://www.jejuolle.org/trail/eng/)", "2 – 3 Std.", "kostenlos"],
      ],
      days: [
        ["Di 21.9.", "Vormittags Flug nach Jeju, Transfer. Nachmittags am Strand Jungmun Saekdal, Sonnenuntergang an den Basaltsäulen von Daepo."],
        ["Mi 22.9.", "Olle Route 7 von Oedolgae bis zum Hafen Beophwan, Mittagessen in Seogwipo, Olle-Markt. Abends Cheonjiyeon-Wasserfall."],
        ["Do 23.9.", "Mit Fahrer in den Osten: früh auf den Seongsan Ilchulbong, Vorführung der Haenyeo, Seopjikoji, Café am Strand Woljeong-ri, Saryeoni Forest Path."],
        ["Fr 24.9.", "Strand- und Ruhetag: Pool, Spa, Jungmun-Strand. Abends Grillen mit schwarzem Jeju-Schwein."],
        ["Sa 25.9.", "Mit Fahrer in den Westen: Eoseungsaengak am Hallasan, Osulloc-Teefelder, Hyeopjae Beach, Sanbangsan und Yongmeori-Küste."],
        ["So 26.9.", "Vormittags Flug nach Busan."],
      ],
    },
    {
      id: "busan",
      nr: 3,
      name: "Busan",
      area: "Haeundae",
      dates: "26.–30.9.",
      nights: 4,
      checkIn: "2027-09-26",
      checkOut: "2027-09-30",
      // Suche im Hotel-Konfigurator (Xotelo/TripAdvisor). locationKey ist die TripAdvisor-Orts-ID;
      // fehlt sie, wird sie über query ermittelt. center ist der Bezugspunkt für "zentrale Lage".
      hotelSearch: { locationKey: "g297884", query: "Busan", center: [35.1587, 129.1604], centerName: "Haeundae Beach" },
      focus: "Stadtstrand, Fischmarkt, Küstenwanderung",
      color: "#1d4ed8",
      intro:
        "In Busan kommen Großstadt und Meer zusammen. Ihr wohnt direkt am Strand von Haeundae und erkundet von dort Fischmärkte, Tempel an der Küste, bunte Hügelviertel und eine der schönsten Küstenwanderungen des Landes.",
      hotel: {
        name: "Paradise Hotel Busan",
        url: "https://www.hotels.com/ho196599",
        text:
          "Fünf Sterne, direkt am Haeundae Beach, mit Balkonen zum Meer, Thermalbad im Freien, Pool und dem Spa Cimer. Das Spa ist am vierten Mittwoch im Monat geschlossen, im September 2027 ist das der 22.9., also bevor ihr ankommt.",
        price: "ca. 250–400 € pro Nacht",
        priceMin: 250,
        priceMax: 400,
      },
      sights: [
        ["Haeundae Beach und Dongbaekseom", "Uferweg rund um die kleine Kamelien-Insel, vorbei am Nurimaru-Pavillon, mit Blick auf die Hochhäuser von Marine City."],
        ["[Haeundae Blueline Park](https://www.bluelinepark.com)", "Die bunten Sky Capsules fahren 7–10 m über der Küste von Mipo nach Cheongsapo. Weiter geht es mit dem Beach Train bis Songjeong. Tickets für die Sky Capsules werden [jeden Dienstag um 7 Uhr für vier Wochen im Voraus](https://www.trvlogue.com/en/busan-haeundae-blueline-park-booking-guide) freigeschaltet und sind schnell weg."],
        ["Haedong Yonggungsa", "buddhistischer Tempel direkt auf den Felsen am Meer."],
        ["Jagalchi-Fischmarkt", "Fisch unten aussuchen und oben zubereiten lassen."],
        ["Gukje-Markt und BIFF-Platz", "Streetfood wie Ssiat-Hotteok (Pfannkuchen mit Samenfüllung) und Eomuk (Fischkuchen)."],
        ["Gamcheon Culture Village", "bunte Häuser am Hang, Kunstinstallationen und Aussichtspunkte."],
        ["Gwangalli Beach", "abends mit Blick auf die beleuchtete Gwangan-Brücke, viele Bars und Fischrestaurants."],
        ["Essen", "Dwaeji-gukbap (Schweinesuppe, Busans Klassiker), Milmyeon (kalte Weizennudeln), roher Fisch in Millak."],
      ],
      hikes: [
        ["Igidae Coastal Walk", "etwa 4,7 km und 2 Stunden auf Holzstegen und Pfaden an der Steilküste, mit Blick auf Gwangan-Brücke und Haeundae. Er endet am Oryukdo Skywalk, einer Glasplattform über dem Meer."],
        ["Mipo – Cheongsapo am Meer", "der ebene Fußweg auf der alten Bahntrasse unter den Sky Capsules, etwa 2 km."],
      ],
      tours: [
        ["Sky Capsule und Beach Train", "[Haeundae Blueline Park (offiziell)](https://www.bluelinepark.com)", "ca. 30 Min. pro Strecke", "Sky Capsule ca. 35.000–50.000 KRW pro Kapsel für 2, Beach Train ca. 10.000–17.000 KRW p. P."],
        ["Selbst organisiert mit Taxi: Haedong Yonggungsa, Gamcheon, Jagalchi", "–", "halbe Tage", "Taxi ca. 15.000–30.000 KRW pro Fahrt"],
      ],
      days: [
        ["So 26.9.", "Ankunft, Strand von Haeundae, Uferweg um Dongbaekseom. Abends Blick von The Bay 101 auf Marine City."],
        ["Mo 27.9.", "Sky Capsule von Mipo nach Cheongsapo, Muschelgrill in Cheongsapo, Beach Train bis Songjeong. Nachmittags Haedong Yonggungsa."],
        ["Di 28.9.", "Altstadt: Jagalchi-Markt mit Fischmittagessen, Gukje-Markt, Gamcheon Culture Village. Abends am Gwangalli Beach."],
        ["Mi 29.9.", "Vormittags Igidae Coastal Walk und Oryukdo Skywalk. Nachmittags Thermalbad und Spa im Hotel."],
        ["Do 30.9.", "Später Check-out, Taxi nach Gyeongju."],
      ],
    },
    {
      id: "gyeongju",
      nr: 4,
      name: "Gyeongju",
      area: "Bomun",
      dates: "30.9.–3.10.",
      nights: 3,
      checkIn: "2027-09-30",
      checkOut: "2027-10-03",
      // Suche im Hotel-Konfigurator (Xotelo/TripAdvisor). locationKey ist die TripAdvisor-Orts-ID;
      // fehlt sie, wird sie über query ermittelt. center ist der Bezugspunkt für "zentrale Lage".
      hotelSearch: { query: "Gyeongju", center: [35.8357, 129.2129], centerName: "historisches Zentrum (Daereungwon)" },
      focus: "UNESCO-Tempel, Königsgräber, Hanok-Nächte",
      color: "#7c3aed",
      intro:
        "Gyeongju war fast 1.000 Jahre lang die Hauptstadt des Silla-Reiches. Man nennt die Stadt auch ein „Museum ohne Mauern“. Königsgräber, Tempel und Paläste liegen nah beieinander und sind leicht mit dem Fahrrad zu erreichen. Hier übernachtet ihr im Hanok.",
      hotel: {
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
        ["Donggung-Palast und Wolji-Teich", "nach Einbruch der Dunkelheit beleuchtet, das ist der schönste Abendspaziergang der Stadt."],
        ["Hwangnidan-gil", "Hanok-Gasse mit Cafés, Bäckereien (Gyeongju-ppang) und Restaurants."],
        ["Gyeongju-Nationalmuseum", "Goldkronen der Silla-Könige und die Emille-Glocke."],
        ["Bomun-See", "ebener Rundweg am Wasser mit Fahrradverleih, nah am Hotel."],
        ["Yangdong Folk Village (UNESCO)", "gut erhaltenes Dorf des Adels aus der Joseon-Zeit, 30 Minuten mit dem Taxi."],
      ],
      hikes: [],
      tours: [
        ["Private UNESCO-Tour mit Guide, Abholung im Hotel", "[Private Gyeongju UNESCO Heritage Tour (Expedia)](https://www.expedia.ie/things-to-do/private-gyeongju-unesco-heritage-tour-with-a-local-guide.a52620643.activity-details)", "ca. 4,5 Std.", "auf Anfrage, privat"],
        ["Radtour durch die historische Zone", "selbst organisiert, Verleih an der Daereungwon/Cheomseongdae-Zone", "2 – 4 Std.", "ca. 5.000 – 10.000 KRW p. P."],
      ],
      days: [
        ["Do 30.9.", "Ankunft gegen Mittag, Check-in. Nachmittags Tumuli-Park, Cheomseongdae und Dorf Gyochon. Abends Donggung und Wolji-Teich, Abendessen in Hwangnidan-gil."],
        ["Fr 1.10.", "Private UNESCO-Tour: Bulguksa und Seokguram am Morgen, danach Nationalmuseum. Am Abend Thermalbad im Innenhof des Hanok."],
        ["Sa 2.10.", "Früh nach Yangdong (am Feiertagswochenende wird es voller), nachmittags Radtour am Bomun-See."],
        ["So 3.10.", "Vormittags mit dem KTX nach Seoul."],
      ],
    },
    {
      id: "gangnam",
      nr: 5,
      name: "Seoul",
      area: "Gangnam",
      dates: "3.–6.10.",
      nights: 3,
      checkIn: "2027-10-03",
      checkOut: "2027-10-06",
      // Suche im Hotel-Konfigurator (Xotelo/TripAdvisor). locationKey ist die TripAdvisor-Orts-ID;
      // fehlt sie, wird sie über query ermittelt. center ist der Bezugspunkt für "zentrale Lage".
      hotelSearch: { locationKey: "g294197", query: "Seoul", center: [37.5115, 127.0595], centerName: "COEX / Bongeunsa" },
      focus: "Modernes Seoul, Shopping, Abschied",
      color: "#be185d",
      intro:
        "Zum Schluss lernt ihr die moderne Seite Seouls kennen: Gangnam, Wolkenkratzer, Design-Viertel und der Han-Fluss. Am Ende bleibt noch Zeit zum Einkaufen und für ein Abschiedsessen.",
      hotel: {
        name: "Josun Palace, a Luxury Collection Hotel",
        url: "https://guide.michelin.com/ch/de/hotels-stays/seoul/josun-palace-a-luxury-collection-hotel-seoul-12550",
        text:
          "In Gangnam. Es setzt die Tradition des ersten Luxushotels Koreas von 1914 fort und hat einen MICHELIN Key. Es gibt einen Innenpool mit Blick auf die Skyline, die COEX Mall und der Tempel Bongeunsa sind in der Nähe.",
        price: "ca. 350–550 € pro Nacht",
        priceMin: 350,
        priceMax: 550,
      },
      sights: [
        ["Bongeunsa", "Tempel aus dem 8. Jahrhundert mitten zwischen den Bürotürmen."],
        ["Starfield Library in der COEX Mall", "Bibliothek mit 13 m hohen Bücherregalen, kostenlos."],
        ["Lotte World Tower (Seoul Sky) und Seokchon-See", "Aussichtsplattform in 500 m Höhe mit Glasboden, unten ein Spaziergang am See."],
        ["Seongsu-dong", "ehemaliges Fabrikviertel mit Cafés, Concept Stores und Pop-up-Shops von K-Beauty- und Modemarken."],
        ["Apgujeong und Garosu-gil", "Boutiquen, Designer-Mode, Restaurants."],
        ["Han-Fluss", "Abendfahrt mit dem Schiff oder Picknick im Banpo-Hangang-Park. Der Mondlicht-Regenbogenbrunnen an der Banpo-Brücke läuft je nach Saison bis Oktober."],
        ["Mangwon-Markt und Yeonnam-dong", "Streetfood auf dem Markt und Cafés am Gyeongui-Line-Park."],
      ],
      hikes: [],
      tours: [],
      days: [
        ["So 3.10.", "Ankunft mit dem KTX, Check-in. Nachmittags Bongeunsa und Starfield Library. Abends Bootsfahrt auf dem Han-Fluss oder Banpo-Park."],
        ["Mo 4.10.", "Ersatzfeiertag, die Stadt ist voll. Vormittags früh Seoul Sky und Seokchon-See, nachmittags Seongsu-dong."],
        ["Di 5.10.", "Mangwon-Markt und Yeonnam-dong, Einkaufen in Apgujeong oder Myeongdong. Abschiedsessen in einem Restaurant mit koreanischer Fine-Dining-Küche, Reservierung über die App CatchTable."],
        ["Mi 6.10.", "Taxi nach Incheon, Rückflug LH713 um ca. 13 Uhr, Ankunft in Frankfurt ca. 19:15 Uhr."],
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
    priceTips: [
      "Dienstag und Mittwoch als Abflugtag wählen, Freitag und Sonntag meiden.",
      "In Google Flights den Kalender für ±3 Tage ansehen. Wenn der 14.9. oder 16.9. deutlich günstiger ist, verschiebt sich der Plan nur um einen Tag.",
      "Für Mitte September 2027 sind Flüge schon jetzt buchbar. Richtet Preisalarme ein und bucht spätestens im Frühjahr 2027.",
    ],
    domesticHead: ["Datum", "Strecke", "Dauer", "Airlines", "Preis p. P. (Economy)"],
    domestic: [
      ["Di 21.9.", "Seoul-Gimpo (GMP) → Jeju (CJU)", "ca. 1 Std. 10 Min.", "Korean Air, Asiana, Jeju Air, Jin Air u. a.", "ca. 60.000 – 150.000 KRW (40 – 100 €)"],
      ["So 26.9.", "Jeju (CJU) → Busan-Gimhae (PUS)", "ca. 55 Min.", "Korean Air, Air Busan, Jeju Air u. a.", "ca. 50.000 – 120.000 KRW (35 – 80 €)"],
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
      ["Mi 15.9.", "Köln/Düsseldorf → Flughafen Frankfurt", "ICE bzw. Lufthansa Express Rail", "1 – 1,5 Std.", "im LH-Ticket enthalten bzw. ca. 60 – 180 €"],
      ["Do 16.9.", "Incheon → {hotel:seoul}", "Taxi oder Hotellimousine; Alternative: [AREX Express](https://www.arex.or.kr) bis Seoul Station + Taxi", "60 – 75 Min.", "Taxi ca. 80.000 – 110.000 KRW (55 – 75 €); AREX 13.000 KRW p. P."],
      ["Di 21.9.", "{hotel:seoul} → Flughafen Gimpo", "Taxi", "ca. 35 Min.", "ca. 30.000 – 40.000 KRW (20 – 27 €)"],
      ["Di 21.9.", "Gimpo → Jeju", "Inlandsflug", "1 Std. 10 Min.", "ca. 120.000 – 300.000 KRW (80 – 200 €)"],
      ["Di 21.9.", "Flughafen Jeju → {hotel:jeju}", "Taxi; Alternative: Flughafen-Limousinenbus 600", "ca. 50 Min.", "Taxi ca. 50.000 – 60.000 KRW (35 – 40 €)"],
      ["Do 23.9. + Sa 25.9.", "Inselrundfahrten Jeju", "[Privatwagen mit Fahrer, 9 Std.](https://www.klook.com/activity/174339-jeju-private-transfer/)", "ganztägig", "ca. 250.000 – 350.000 KRW pro Tag (170 – 235 €) inkl. Benzin, Maut, Parken"],
      ["So 26.9.", "{hotel:jeju} → Flughafen Jeju", "Taxi", "ca. 50 Min.", "ca. 50.000 – 60.000 KRW (35 – 40 €)"],
      ["So 26.9.", "Jeju → Busan", "Inlandsflug", "55 Min.", "ca. 100.000 – 240.000 KRW (70 – 160 €)"],
      ["So 26.9.", "Flughafen Gimhae → {hotel:busan}", "Taxi", "35 – 50 Min.", "ca. 40.000 – 50.000 KRW (27 – 33 €)"],
      ["Do 30.9.", "{hotel:busan} → {hotel:gyeongju}", "Taxi direkt (bequemste Lösung); Alternative: KTX Busan → Gyeongju (30 Min., 11.900 KRW p. P.) plus zwei Taxis", "60 – 70 Min.", "Taxi ca. 110.000 – 140.000 KRW (75 – 95 €)"],
      ["So 3.10.", "{hotel:gyeongju} → Bahnhof Gyeongju (früher Singyeongju)", "Taxi", "ca. 25 Min.", "ca. 20.000 – 25.000 KRW (15 €)"],
      ["So 3.10.", "Gyeongju → Seoul Station", "[KTX](https://www.letskorail.com), First Class empfohlen", "ca. 2 Std.", "Standard ca. 89.000 KRW, First ca. 128.000 KRW (60 bzw. 85 €)"],
      ["So 3.10.", "Seoul Station → {hotel:gangnam}", "Taxi", "30 – 40 Min.", "ca. 20.000 – 25.000 KRW (15 €)"],
      ["Mi 6.10.", "{hotel:gangnam} → Incheon", "Taxi oder Flughafen-Limousinenbus", "70 – 80 Min.", "Taxi ca. 90.000 – 120.000 KRW (60 – 80 €)"],
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
        "KTX: Verkauf ab einem Monat vorher, Fahrt am 3.10. gleich am ersten Tag buchen",
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
window.MODULES_PLANNED = [
  { id: "flugsuche", title: "Flugsuche", icon: "🔎", text: "Flüge FRA–ICN vergleichen und Preisalarme im Blick behalten." },
];
