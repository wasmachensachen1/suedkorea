// Kurpfälzische Fassung der Reiseinhalte aus js/data.js (für den Mense-Modus).
//
// Aufbau: "Originaltext aus data.js": "Text uff Kurpfälzisch". Links [Text](URL) und **fett**
// funktionieren wie in data.js.
// Wird ein Text in data.js geändert, passt der Eintrag hier nicht mehr, und im Mense-Modus
// erscheint an der Stelle wieder das Original. Dann hier Schlüssel und Übersetzung anpassen.
// Kontrolle in der Browser-Konsole: Theme.check() listet fehlende und verwaiste Einträge.
window.Theme.registerData({
  "Südkorea-Rundreise":
    "Südkorea-Rundreis",
  "Sept./Okt. 2027 · {nights:all} Nächte · 5 Stationen":
    "Sept./Okt. 2027 · {nights:all} Nächt · 5 Schdatione",
  "Abflug am {wday:2027-09-15}, {dy:2027-09-15}, ab {flight:outFromName} {flight:outStops} nach Seoul, Rückflug am {wday:2027-10-06}, {dy:2027-10-06}: {nights:all} Nächte in fünf Unterkünften. Die Reihenfolge wurde gegenüber der ersten Skizze gedreht – Jeju kommt direkt nach Seoul. So liegt die Strandwoche Ende September, wenn das Meer noch rund 25 °C hat, und Jeju ist vor der chinesischen Feiertagswoche (1.–7.10.) schon erledigt.":
    "Am {wday:2027-09-15}, {dy:2027-09-15}, geht's ab {flight:outFromName} {flight:outStops} nach Seoul, retour am {wday:2027-10-06}, {dy:2027-10-06}: {nights:all} Nächt in fünf Unnerkünft. Die Reihefolg hämmer gegeniwwer de erschde Skizz rumgedreht – Jeju kummt direkt nach Seoul. Alla liegt die Schdrandwoch End Septemwer, wenn's Meer noch so um die 25 °C hot, un Jeju is vor de chinesische Feierdaachswoch (1.–7.10.) schun abghakt.",
  "Das Erntedankfest Chuseok ist am 14.–16.9.2027. Danach fliegen viele Koreaner aus Europa zurück. Wer am 15.9. hinfliegt, ist vor dieser Welle unterwegs. In Seoul selbst ist es am Chuseok-Tag ruhig, Paläste haben geöffnet. Der Rückflug am 6.10. liegt vor dem langen Wochenende zum Hangeul-Tag (9.–11.10.). Dienstag und Mittwoch sind für Langstrecke meist die günstigsten Flugtage.":
    "Des Erntedankfescht Chuseok is am 14.–16.9.2027. Donn fliege viel Koreaner aus Europa widder hääm. Wer am 15.9. hiefliegt, is vor dere Well unnerwegs. In Seoul selwer is es am Chuseok-Daach ruhisch, die Paläscht hänn uff. De Rickflug am 6.10. liegt vor'm lange Wocheend zum Hangeul-Daach (9.–11.10.). Dienschdaach un Mittwoch sinn fer die Langstreck meischdens die billigschde Fliegdääch.",
  "Kostenschätzung für zwei Personen (gerundet, 1 € ≈ 1.500 KRW)":
    "Was es koscht fer zwaa Leit (gerundet, 1 € ≈ 1.500 KRW)",
  "Flüge Business Class FRA–Seoul hin/zurück":
    "Flieg Business Class FRA–Seoul hie un zurick",
  "Hotels, {nights:all} Nächte":
    "Hodels, {nights:all} Nächt",
  "Inlandsflüge, Züge, Taxis, 2 Fahrertage auf Jeju":
    "Inlandsflieg, Zieg, Taxis, 2 Fahrerdääch uff Jeju",
  "Ausflüge, Touren, Eintritte":
    "Ausflüch, Touren, Eintritt",
  "Essen und Trinken (ca. 150–250 € pro Tag)":
    "Esse un Trinke (ca. 150–250 € am Daach)",
  "Die Essenspreise und die Hotel-Richtwerte sind Schätzungen. Für Hotels, die im Hotel-Konfigurator gewählt wurden, steht der dort ermittelte Preis drin. Die Flugspanne reicht von Angeboten (ab ca. 1.700 € p. P.) bis zum Normaltarif.":
    "Die Essensbreise un die Hodel-Richtwerte sinn gschätzt. Fer Hodels, wo mer im Hodel-Konfigurador ausgsucht hot, steht der Breis drin, wo's dort gebbt. Die Flugspann geht vun Ogebote (ab ca. 1.700 € p. P.) bis zum Normaldarif.",
  "Paläste, Märkte, Food-Tour, Tagesausflug ins Grüne":
    "Paläscht, Märkt, Food-Tour, Daachesausflug ins Grüne",
  "Im ersten Teil seht ihr das historische Seoul. Paläste, Hanok-Viertel und Märkte erreicht ihr vom Hotel aus zu Fuß. Dazu kommen eine abendliche Food-Tour und ein Tag im Grünen.":
    "Im erschde Deel sehn ihr des historische Seoul. Paläscht, Hanok-Viertel un Märkt erreicht ihr vum Hodel aus zu Fuß. Dezu kummt e Food-Tour am Owend un en Daach im Grüne.",
  "In Gwanghwamun. Zum Gyeongbokgung-Palast und zum Gwanghwamun-Platz sind es etwa 8 Minuten zu Fuß. Es gibt eine koreanische Sauna, einen Pool und das Sternerestaurant Yu Yuan (kantonesisch).":
    "In Gwanghwamun. Zum Gyeongbokgung-Balascht un zum Gwanghwamun-Platz sinn's so um die 8 Minude zu Fuß. Es gebbt e koreanisch Sauna, en Pool un des Sternerestaurant Yu Yuan (kantonesisch).",
  "der größte Königspalast, mit [Wachwechsel](https://english.visitseoul.net/events/Changing-of-the-Royal-Guard-at-Gyeongbokgung-Palace-en/ENP008256) am Gwanghwamun-Tor. Dienstags geschlossen.":
    "de greeschde Kenichsbalascht, mit [Wachwechsel](https://english.visitseoul.net/events/Changing-of-the-Royal-Guard-at-Gyeongbokgung-Palace-en/ENP008256) am Gwanghwamun-Door. Dienschdags zu.",
  "[Changdeokgung](https://english.visitseoul.net/attractions/Changdeokgung-Palace_/296) und [Geheimer Garten (Huwon)](https://english.visitseoul.net/attractions/2024-cdggarden/ENPl8f5md)":
    "[Changdeokgung](https://english.visitseoul.net/attractions/Changdeokgung-Palace_/296) un [Geheimer Gaade (Huwon)](https://english.visitseoul.net/attractions/2024-cdggarden/ENPl8f5md)",
  "UNESCO-Welterbe. Den Garten sieht man nur mit Führung, Tickets vorab über das [offizielle Palast-Portal](https://royal.khs.go.kr/) reservieren. Montags geschlossen.":
    "UNESCO-Welterbe. De Gaade sieht mer nur mit Fiehrung, Tickets vorher iwwer's [offizielle Balascht-Portal](https://royal.khs.go.kr/) reserviere. Mondags zu.",
  "[Bukchon Hanok Village](https://english.visitseoul.net/attractions/Bukchon-Hanok-Village/ENP000261) und [Ikseon-dong](https://english.visitseoul.net/attractions/IkseongdongHanokVillage/ENP037008)":
    "[Bukchon Hanok Village](https://english.visitseoul.net/attractions/Bukchon-Hanok-Village/ENP000261) un [Ikseon-dong](https://english.visitseoul.net/attractions/IkseongdongHanokVillage/ENP037008)",
  "Gassen mit traditionellen Häusern, Teehäuser, kleine Boutiquen. In Bukchon gelten feste Besuchszeiten am Tag, bitte ruhig verhalten.":
    "Gässle mit alde Heiser, Deeheiser, klää Boutique. In Bukchon gebbt's feschde Besuchszeide am Daach – bitte ruhisch sei, gell.",
  "[Insadong](https://english.visitseoul.net/shopping/Insa-dong/ENP000080) und [Cheonggyecheon](https://english.visitseoul.net/area/CheonggyecheonStream/ENP000034)":
    "[Insadong](https://english.visitseoul.net/shopping/Insa-dong/ENP000080) un [Cheonggyecheon](https://english.visitseoul.net/area/CheonggyecheonStream/ENP000034)",
  "Kunsthandwerk, Galerien und ein Spaziergang am Bach mitten in der Stadt.":
    "Kunschdhandwerk, Galerie un en Spaziergang am Bach mitte in de Schdadt.",
  "ältester überdachter Markt der Stadt, mit Bindaetteok (Mungbohnen-Pfannkuchen), Mayak-Gimbap und Yukhoe (koreanisches Tatar).":
    "de äldschde iwwerdachte Markt vun de Schdadt, mit Bindaetteok (Mungbohne-Pannekuche), Mayak-Gimbap un Yukhoe (koreanisches Tatar).",
  "zum Sonnenuntergang, für den Blick über die Stadt.":
    "zum Sunneunnergang, fer de Blick iwwer die Schdadt.",
  "2–3 Stunden, gut ausgebaute Stufen, schräge Felsen und Blick auf den Palast. Startpunkt ist 15 Minuten vom Hotel entfernt.":
    "2–3 Schdunne, gut ausgebaute Schdufe, schräge Felse un Blick uff de Balascht. Losgeh dut's 15 Minude vum Hodel weg.",
  "die bequeme Variante durch das Gugi-dong-Tal, geführt und mit anschließendem Saunabesuch: [Private Bukhansan Hiking Tour & Korean Spa (Trazy)](https://www.trazy.com/experience/detail/private-bukhansan-hiking-tour-with-korean-spa). Die Route wird an die Kondition angepasst, Mittagessen und Hotelabholung sind inklusive.":
    "die gemiedlich Variant durch's Gugi-dong-Dal, gfiehrt un hinnenoch in die Sauna: [Private Bukhansan Hiking Tour & Korean Spa (Trazy)](https://www.trazy.com/experience/detail/private-bukhansan-hiking-tour-with-korean-spa). Die Rout werd an die Kondition ogebasst, Middagesse un Abhole am Hodel sinn dabei.",
  "3,5 – 4 Std., Start 17 Uhr an der Station Anguk":
    "3,5 – 4 Std., los geht's um 17 Uhr an de Schdation Anguk",
  "[Nami-Insel](https://namisum-en.imweb.me/71) und [Garden of Morning Calm](http://www.morningcalm.co.kr/), privat":
    "[Nami-Insel](https://namisum-en.imweb.me/71) un [Garden of Morning Calm](http://www.morningcalm.co.kr/), privat",
  "[Lokalee – Private Tour](https://www.lokalee.app/en/tours/nami-island-and-garden-of-morning-calm-private-tour-from-seoul) oder als Gruppentour über [Klook](https://www.klook.com/activity/8962-nami-island-petite-france-railbike-garden-of-morning-calm-day-tour-seoul/)":
    "[Lokalee – Private Tour](https://www.lokalee.app/en/tours/nami-island-and-garden-of-morning-calm-private-tour-from-seoul) odder als Gruppedour iwwer [Klook](https://www.klook.com/activity/8962-nami-island-petite-france-railbike-garden-of-morning-calm-day-tour-seoul/)",
  "privat ca. 300 – 400 € für 2, Gruppe ca. 60 € p. P.":
    "privat ca. 300 – 400 € fer 2, Grupp ca. 60 € p. P.",
  "[Bukhansan-Wanderung mit Spa](https://english.visitseoul.net/nature/BukhansanNationalPark/ENP000369)":
    "[Bukhansan-Wannerung mit Spa](https://english.visitseoul.net/nature/BukhansanNationalPark/ENP000369)",
  "auf Anfrage, privat":
    "uff Ofrag, privat",
  "Landung ca. {flight:outArr} Uhr, Check-in. Nachmittags Gyeongbokgung (letzter Chuseok-Tag, oft mit Festprogramm), dann Spaziergang am Cheonggyecheon. Früh schlafen.":
    "Lannung so gege {flight:outArr} Uhr, Check-in. Nochmiddags Gyeongbokgung (letschder Chuseok-Daach, oft mit Feschtprogramm), donn Spaziergang am Cheonggyecheon. Frieh ins Bett!",
  "Changdeokgung mit Geheimem Garten, Bukchon, mittags in Ikseon-dong. Nachmittags Insadong mit Teehaus. Abends Gwangjang-Markt.":
    "Changdeokgung mit'm Geheime Gaade, Bukchon, middags in Ikseon-dong. Nochmiddags Insadong mit Deehaus. Owends Gwangjang-Markt.",
  "Vormittags Inwangsan an der Stadtmauer, danach Cafés in Seochon. Freier Nachmittag mit Sauna im Hotel. 17 Uhr O'ngo Night Dining Tour.":
    "Vormiddags Inwangsan an de Schdadtmauer, donoch Cafés in Seochon. Freier Nochmiddag mit Sauna im Hodel. Um 17 Uhr O'ngo Night Dining Tour.",
  "Tagesausflug Nami-Insel und Garden of Morning Calm.":
    "Daachesausflug Nami-Insel un Garden of Morning Calm.",
  "Bukhansan-Wanderung mit Spa oder ein freier Tag. Abends N Seoul Tower.":
    "Bukhansan-Wannerung mit Spa odder en freie Daach. Owends N Seoul Tower.",
  "Strand, Olle-Küstenwege, Vulkanlandschaft":
    "Schdrand, Olle-Küschdewesch, Vulkanlandschaft",
  "Jeju ist eine Vulkaninsel und UNESCO-Welterbe. Ende September ist das Meer noch warm genug zum Baden, und die Küstenwege sind angenehm zu gehen. Ihr wohnt im Resortgebiet Jungmun an der Südküste. An zwei Tagen fährt euch ein Fahrer über die Insel, die übrigen Tage sind für Strand, Pool und kurze Wege da.":
    "Jeju is e Vulkaninsel un UNESCO-Welterbe. End Septemwer is's Meer noch warm genug zum Bade, un uff de Küschdewesch laaft sich's arg agenehm. Ihr wohnt im Resortgebiet Jungmun an de Südküst. An zwaa Dääch kutschiert eich en Fahrer iwwer die Insel, die annere Dääch sinn fer Schdrand, Pool un korze Wesch do.",
  "Ein Fünf-Sterne-Resort mit tropischem Garten auf der Klippe und Blick auf den Pazifik, Mitglied der Leading Hotels of the World. Zum Strand Jungmun Saekdal sind es etwa 10 Minuten zu Fuß. Pools, Spa, Restaurants.":
    "En Fünf-Sterne-Resort mit tropischem Gaade uff de Klipp un Blick uff de Pazifik, Mitglied bei de Leading Hotels of the World. Zum Schdrand Jungmun Saekdal sinn's so um die 10 Minude zu Fuß. Pools, Spa, Restaurants.",
  "Sandstrand vor dem Hotel, gut zum Baden und Sonnenuntergang.":
    "Sandschdrand vor'm Hodel, gut zum Bade un fer de Sunneunnergang.",
  "bis zu 25 m hohe Basaltsäulen an der Küste, 10 Minuten vom Hotel.":
    "bis zu 25 m hohe Basaltsäule an de Küst, 10 Minude vum Hodel.",
  "[Seongsan Ilchulbong („Sonnenaufgangsgipfel“)](https://www.visitjeju.net/en/detail/view?contentsid=CONT_000000000500349)":
    "[Seongsan Ilchulbong („Sunneuffgangsgipfel“)](https://www.visitjeju.net/en/detail/view?contentsid=CONT_000000000500349)",
  "Tuffkegel am Meer, UNESCO-Welterbe. Der Aufstieg dauert 20–30 Minuten, ist leicht, aber hat viele Stufen. Unten zeigen die Haenyeo, die traditionellen Taucherinnen, ihre Arbeit.":
    "Tuffkegel am Meer, UNESCO-Welterbe. Nuff braucht mer 20–30 Minude, is leicht, hot awwer arg viel Schdufe. Unne zeige die Haenyeo, die traditionelle Daucherinne, wie se schaffe.",
  "Küstenweg mit Leuchtturm und Blick auf Seongsan.":
    "Küschdewech mit Leuchtturm un Blick uff Seongsan.",
  "Zedern- und Zypressenwald, ebener Weg, sehr ruhig.":
    "Zedern- un Zypressewald, ewener Wech, arg ruhisch.",
  "Teefelder, Teeverkostung, Grüntee-Desserts.":
    "Deefelder, Dee browiere, Grüntee-Desserts.",
  "[Sanbangsan](https://www.visitjeju.net/en/detail/view?contentsid=CONT_000000000500285) und [Yongmeori-Küste](https://www.visitjeju.net/en/detail/view?contentsid=CONT_000000000500471)":
    "[Sanbangsan](https://www.visitjeju.net/en/detail/view?contentsid=CONT_000000000500285) un [Yongmeori-Küst](https://www.visitjeju.net/en/detail/view?contentsid=CONT_000000000500471)",
  "Gesteinsschichten am Meer, am besten bei Ebbe.":
    "Gschdeinsschichte am Meer, am beschde bei Ebb.",
  "türkisfarbenes Wasser mit Blick auf die Insel Biyangdo.":
    "türkises Wasser mit Blick uff die Insel Biyangdo.",
  "[Essen](https://www.visitjeju.net/en/themtour/view?contentsid=CNTS_200000000007162)":
    "[Esse](https://www.visitjeju.net/en/themtour/view?contentsid=CNTS_200000000007162)",
  "Heukdwaeji (Grillfleisch vom schwarzen Jeju-Schwein), Jeonbok-juk (Abalone-Reisbrei), frischer Fisch am [Seogwipo Maeil Olle Market](https://www.visitjeju.net/en/detail/view?contentsid=CONT_000000000500731).":
    "Heukdwaeji (Grillflaasch vun de schwarze Jeju-Wutz), Jeonbok-juk (Abalone-Reisbrei), frischer Fisch am [Seogwipo Maeil Olle Market](https://www.visitjeju.net/en/detail/view?contentsid=CONT_000000000500731).",
  "[Jeju Olle Trail](http://www.jejuolle.org/trail/eng/), Route 7, erster Teil":
    "[Jeju Olle Trail](http://www.jejuolle.org/trail/eng/), Rout 7, erschder Deel",
  "von Oedolgae (einer 20 m hohen Felsnadel) bis zum Hafen Beophwan. Etwa 2–3 Stunden an der Steilküste, gilt als schönster Abschnitt. Mehr Planungstipps im [Olle Trail Guide](https://jejuolletrailguide.net/).":
    "vun Oedolgae (e 20 m hohi Felsnadel) bis zum Hafe Beophwan. So um die 2–3 Schdunne an de Schdeilküst, des is de scheenschde Abschnitt. Mehr Blanungsdibbs im [Olle Trail Guide](https://jejuolletrailguide.net/).",
  "1,3 km zum Kraterrand, etwa 30 Minuten pro Strecke, mit Blick auf den Gipfel des Hallasan. Das ist die leichte Variante, ohne Reservierung. Der Gipfelweg ist ganztägig und muss über das [offizielle Hallasan-Reservierungssystem](https://visithalla.jeju.go.kr/contents/contents.do?id=49&language=en_US) gebucht werden.":
    "1,3 km zum Kraterrand, so um die 30 Minude pro Streck, mit Blick uff de Gipfel vum Hallasan. Des is die leicht Variant, ohne Reservierung. De Gipfelwech dauert de ganze Daach un muss iwwer's [offizielle Hallasan-Reservierungssystem](https://visithalla.jeju.go.kr/contents/contents.do?id=49&language=en_US) gebucht werre.",
  "Privatwagen mit Fahrer, eigene Route (2 Tage)":
    "Privatwaache mit Fahrer, eigene Rout (2 Dääch)",
  "[Klook – Jeju Private Car Charter](https://www.klook.com/activity/174339-jeju-private-transfer/) oder der [Global Taxi Tour der Provinz Jeju](https://www.visitjeju.net/en/themtour/view?contentsid=CNTS_200000000012778) mit englischsprachigem Fahrer":
    "[Klook – Jeju Private Car Charter](https://www.klook.com/activity/174339-jeju-private-transfer/) odder die [Global Taxi Tour vun de Provinz Jeju](https://www.visitjeju.net/en/themtour/view?contentsid=CNTS_200000000012778) mit'm Fahrer, wo Englisch babbelt",
  "9 Std. pro Tag":
    "9 Std. am Daach",
  "ca. 170 – 235 € pro Tag":
    "ca. 170 – 235 € am Daach",
  "UNESCO-Stätten auf Jeju (Hintergrund)":
    "UNESCO-Schdädde uff Jeju (Hinnergrund)",
  "Olle-Wanderung (selbst geführt)":
    "Olle-Wannerung (selwer gfiehrt)",
  "kostenlos":
    "koscht nix",
  "Vormittags Flug nach Jeju, Transfer. Nachmittags am Strand Jungmun Saekdal, Sonnenuntergang an den Basaltsäulen von Daepo.":
    "Vormiddags Flug nach Jeju, Transfer. Nochmiddags am Schdrand Jungmun Saekdal, Sunneunnergang an de Basaltsäule vun Daepo.",
  "Olle Route 7 von Oedolgae bis zum Hafen Beophwan, Mittagessen in Seogwipo, Olle-Markt. Abends Cheonjiyeon-Wasserfall.":
    "Olle Rout 7 vun Oedolgae bis zum Hafe Beophwan, Middagesse in Seogwipo, Olle-Markt. Owends Cheonjiyeon-Wasserfall.",
  "Mit Fahrer in den Osten: früh auf den Seongsan Ilchulbong, Vorführung der Haenyeo, Seopjikoji, Café am Strand Woljeong-ri, Saryeoni Forest Path.":
    "Mit Fahrer in de Oschde: frieh uff de Seongsan Ilchulbong, Vorfiehrung vun de Haenyeo, Seopjikoji, Café am Schdrand Woljeong-ri, Saryeoni Forest Path.",
  "Strand- und Ruhetag: Pool, Spa, Jungmun-Strand. Abends Grillen mit schwarzem Jeju-Schwein.":
    "Schdrand- un Faulenzerdaach: Pool, Spa, Jungmun-Schdrand. Owends Grille mit schwarzer Jeju-Wutz.",
  "Mit Fahrer in den Westen: Eoseungsaengak am Hallasan, Osulloc-Teefelder, Hyeopjae Beach, Sanbangsan und Yongmeori-Küste.":
    "Mit Fahrer in de Weschde: Eoseungsaengak am Hallasan, Osulloc-Deefelder, Hyeopjae Beach, Sanbangsan un Yongmeori-Küst.",
  "Vormittags Flug nach Busan.":
    "Vormiddags Flug nach Busan.",
  "Stadtstrand, Fischmarkt, Küstenwanderung":
    "Schdadtschdrand, Fischmarkt, Küschdewannerung",
  "In Busan kommen Großstadt und Meer zusammen. Ihr wohnt direkt am Strand von Haeundae und erkundet von dort Fischmärkte, Tempel an der Küste, bunte Hügelviertel und eine der schönsten Küstenwanderungen des Landes.":
    "In Busan kummt Großschdadt un Meer zamme. Ihr wohnt direkt am Schdrand vun Haeundae un guggt eich vun do aus Fischmärkt, Dempel an de Küst, bunte Hiwwelviertel un ään vun de scheenschde Küschdewannerunge im ganze Land o.",
  "Fünf Sterne, direkt am Haeundae Beach, mit Balkonen zum Meer, Thermalbad im Freien, Pool und dem Spa Cimer. Das Spa ist am vierten Mittwoch im Monat geschlossen, im September 2027 ist das der 22.9., also bevor ihr ankommt.":
    "Fünf Sterne, direkt am Haeundae Beach, mit Balkone zum Meer, Thermalbad drauße, Pool un'm Spa Cimer. Des Spa is am vierte Mittwoch im Monat zu, im Septemwer 2027 is des de 22.9. – alla bevor ihr ookummt.",
  "[Haeundae Beach](https://www.visitbusan.net/index.do?lang_cd=en&menuCd=DOM_000000301001001000&uc_seq=373) und [Dongbaekseom](https://www.visitbusan.net/index.do?lang_cd=en&menuCd=DOM_000000301001001000&uc_seq=2274)":
    "[Haeundae Beach](https://www.visitbusan.net/index.do?lang_cd=en&menuCd=DOM_000000301001001000&uc_seq=373) un [Dongbaekseom](https://www.visitbusan.net/index.do?lang_cd=en&menuCd=DOM_000000301001001000&uc_seq=2274)",
  "Uferweg rund um die kleine Kamelien-Insel, vorbei am Nurimaru-Pavillon, mit Blick auf die Hochhäuser von Marine City.":
    "Uferwech rund um die klää Kamelie-Insel, am Nurimaru-Pavillon vorbei, mit Blick uff die Hochheiser vun Marine City.",
  "Die bunten Sky Capsules fahren 7–10 m über der Küste von Mipo nach Cheongsapo. Weiter geht es mit dem Beach Train bis Songjeong. Tickets für die Sky Capsules werden [jeden Dienstag um 7 Uhr für vier Wochen im Voraus](https://www.trvlogue.com/en/busan-haeundae-blueline-park-booking-guide) freigeschaltet und sind schnell weg.":
    "Die bunte Sky Capsules fahre 7–10 m iwwer de Küst vun Mipo nach Cheongsapo. Weider geht's mit'm Beach Train bis Songjeong. Tickets fer die Sky Capsules gebbt's [jeden Dienschdaach um 7 Uhr fer vier Woche im Voraus](https://www.trvlogue.com/en/busan-haeundae-blueline-park-booking-guide), un die sinn dabber weg.",
  "buddhistischer Tempel direkt auf den Felsen am Meer.":
    "buddhistischer Dempel direkt uff de Felse am Meer.",
  "Fisch unten aussuchen und oben zubereiten lassen.":
    "Fisch unne aussuche un owwe zubereite losse.",
  "[Gukje-Markt und BIFF-Platz](https://www.visitbusan.net/index.do?lang_cd=en&menuCd=DOM_000000302002001000&uc_seq=464)":
    "[Gukje-Markt un BIFF-Platz](https://www.visitbusan.net/index.do?lang_cd=en&menuCd=DOM_000000302002001000&uc_seq=464)",
  "Streetfood wie Ssiat-Hotteok (Pfannkuchen mit Samenfüllung) und Eomuk (Fischkuchen).":
    "Streetfood wie Ssiat-Hotteok (Pannekuche mit Kerne drin) un Eomuk (Fischkuche).",
  "bunte Häuser am Hang, Kunstinstallationen und Aussichtspunkte.":
    "bunte Heiser am Hang, Kunschdinstallatione un Aussichtspunkt.",
  "abends mit Blick auf die beleuchtete Gwangan-Brücke, viele Bars und Fischrestaurants.":
    "owends mit Blick uff die beleuchtet Gwangan-Brick, viel Bars un Fischrestaurants.",
  "[Essen](https://www.visitbusan.net/index.do?lang_cd=en&menuCd=DOM_000000302003001000&uc_seq=1008)":
    "[Esse](https://www.visitbusan.net/index.do?lang_cd=en&menuCd=DOM_000000302003001000&uc_seq=1008)",
  "Dwaeji-gukbap (Schweinesuppe, Busans Klassiker), Milmyeon (kalte Weizennudeln), roher Fisch in Millak.":
    "Dwaeji-gukbap (Wutzsupp, Busans Klassiker), Milmyeon (kalde Weizenudle), roher Fisch in Millak.",
  "etwa 4,7 km und 2 Stunden auf Holzstegen und Pfaden an der Steilküste, mit Blick auf Gwangan-Brücke und Haeundae. Er endet am [Oryukdo Skywalk](https://www.visitbusan.net/index.do?lang_cd=en&menuCd=DOM_000000301001001000&uc_seq=278), einer Glasplattform über dem Meer.":
    "so um die 4,7 km un 2 Schdunne uff Holzschdeesch un Pfäd an de Schdeilküst, mit Blick uff die Gwangan-Brick un Haeundae. Am End kummt de [Oryukdo Skywalk](https://www.visitbusan.net/index.do?lang_cd=en&menuCd=DOM_000000301001001000&uc_seq=278), e Glasplattform iwwer'm Meer.",
  "der ebene Fußweg auf der alten Bahntrasse unter den Sky Capsules, etwa 2 km.":
    "de ewene Fußwech uff de alde Bahntrass unner de Sky Capsules, so um die 2 km.",
  "Sky Capsule und Beach Train":
    "Sky Capsule un Beach Train",
  "ca. 30 Min. pro Strecke":
    "ca. 30 Min. pro Streck",
  "Sky Capsule ca. 35.000–50.000 KRW pro Kapsel für 2, Beach Train ca. 10.000–17.000 KRW p. P.":
    "Sky Capsule ca. 35.000–50.000 KRW pro Kapsel fer 2, Beach Train ca. 10.000–17.000 KRW p. P.",
  "Selbst organisiert mit Taxi: [Haedong Yonggungsa](https://www.visitbusan.net/index.do?lang_cd=en&menuCd=DOM_000000301001001000&uc_seq=261), [Gamcheon](https://www.visitbusan.net/index.do?lang_cd=en&menuCd=DOM_000000301001001000&uc_seq=365), [Jagalchi](https://www.visitbusan.net/index.do?lang_cd=en&menuCd=DOM_000000301003001000&uc_seq=412)":
    "Selwer organisiert mit Taxi: [Haedong Yonggungsa](https://www.visitbusan.net/index.do?lang_cd=en&menuCd=DOM_000000301001001000&uc_seq=261), [Gamcheon](https://www.visitbusan.net/index.do?lang_cd=en&menuCd=DOM_000000301001001000&uc_seq=365), [Jagalchi](https://www.visitbusan.net/index.do?lang_cd=en&menuCd=DOM_000000301003001000&uc_seq=412)",
  "Taxi über die App Kakao T oder am Taxistand":
    "Taxi iwwer die App Kakao T odder am Taxischdand",
  "halbe Tage":
    "halwe Dääch",
  "Ankunft, Strand von Haeundae, Uferweg um Dongbaekseom. Abends Blick von The Bay 101 auf Marine City.":
    "Ookumme, Schdrand vun Haeundae, Uferwech um Dongbaekseom. Owends Blick vun The Bay 101 uff Marine City.",
  "Sky Capsule von Mipo nach Cheongsapo, Muschelgrill in Cheongsapo, Beach Train bis Songjeong. Nachmittags Haedong Yonggungsa.":
    "Sky Capsule vun Mipo nach Cheongsapo, Muschelgrill in Cheongsapo, Beach Train bis Songjeong. Nochmiddags Haedong Yonggungsa.",
  "Altstadt: Jagalchi-Markt mit Fischmittagessen, Gukje-Markt, Gamcheon Culture Village. Abends am Gwangalli Beach.":
    "Altschdadt: Jagalchi-Markt mit Fisch zum Middagesse, Gukje-Markt, Gamcheon Culture Village. Owends am Gwangalli Beach.",
  "Vormittags Igidae Coastal Walk und Oryukdo Skywalk. Nachmittags Thermalbad und Spa im Hotel.":
    "Vormiddags Igidae Coastal Walk un Oryukdo Skywalk. Nochmiddags Thermalbad un Spa im Hodel.",
  "Später Check-out, Taxi nach Gyeongju.":
    "Schbäder Check-out, Taxi nach Gyeongju.",
  "UNESCO-Tempel, Königsgräber, Hanok-Nächte":
    "UNESCO-Dempel, Kenichsgräwer, Hanok-Nächt",
  "Gyeongju war fast 1.000 Jahre lang die Hauptstadt des Silla-Reiches. Man nennt die Stadt auch ein „Museum ohne Mauern“. Königsgräber, Tempel und Paläste liegen nah beieinander und sind leicht mit dem Fahrrad zu erreichen. Hier übernachtet ihr im Hanok.":
    "Gyeongju war fascht 1.000 Johr lang die Hauptschdadt vum Silla-Reich. Mer nennt die Schdadt aa e „Museum ohne Mauern“. Kenichsgräwer, Dempel un Paläscht liegen nah beienanner un sinn mit'm Fahrrad leicht zu erreiche. Do schlooft ihr im Hanok.",
  "Das erste Hanok-Hotel Koreas, gebaut im Stil eines Silla-Palastes, mit nur 16 Zimmern. Jedes Zimmer hat ein eigenes Thermalbad im Innenhof, Ondol-Fußbodenheizung und einen Holzpavillon. Es liegt beim Bomun-See, ins Zentrum fährt man 10 Minuten mit dem Taxi. Buchbar z. B. über [Yanolja/NOL](https://nol.yanolja.com/stay/domestic/3013831). Aktuelle Gäste schreiben, dass es kein Restaurant im Haus gibt. Abends nehmt ihr also ein Taxi zum Essen nach Hwangnidan-gil.":
    "Des erschde Hanok-Hodel in Korea, gebaut wie en Silla-Balascht, mit nur 16 Zimmer. Jedes Zimmer hot e eigenes Thermalbad im Innehof, Ondol-Fußbodeheizung un en Holzpavillon. Es liegt beim Bomun-See, ins Zentrum fährt mer 10 Minude mit'm Taxi. Buche kann mer's z. B. iwwer [Yanolja/NOL](https://nol.yanolja.com/stay/domestic/3013831). Gäscht schreiwe, dass es kää Restaurant im Haus gebbt. Owends nemmt ihr alla e Taxi zum Esse nach Hwangnidan-gil.",
  "**Alternative im Zentrum:** [Hwangnamguan Hanok Village](https://www.bamboo-travel.co.uk/tours-of-south-korea/hotels/hwangnamguan-hanok). Es ist einfacher und eher Mittelklasse, dafür erreicht ihr die Königsgräber und Hwangnidan-gil zu Fuß.":
    "**Alternative im Zentrum:** [Hwangnamguan Hanok Village](https://www.bamboo-travel.co.uk/tours-of-south-korea/hotels/hwangnamguan-hanok). Des is ääfacher un eher Middelklass, defier kummt ihr zu Fuß zu de Kenichsgräwer un nach Hwangnidan-gil.",
  "[Bulguksa und Seokguram-Grotte](https://whc.unesco.org/en/list/736)":
    "[Bulguksa un Seokguram-Grott](https://whc.unesco.org/en/list/736)",
  "UNESCO-Welterbe. Bulguksa ist der berühmteste Tempel Koreas, in der Grotte am Berg sitzt ein Granit-Buddha aus dem 8. Jahrhundert. Am besten früh am Morgen hin.":
    "UNESCO-Welterbe. Bulguksa is de beriehmdeschde Dempel in Korea, in de Grott am Berch hockt en Granit-Buddha aus'm 8. Johrhunnert. Am beschde frieh am Morje hie.",
  "Tumuli-Park Daereungwon mit dem begehbaren Grab Cheonmachong, die Sternwarte Cheomseongdae und das Dorf Gyochon.":
    "Tumuli-Park Daereungwon mit'm Grab Cheonmachong, wo mer neilaafe kann, die Sternwart Cheomseongdae un's Dorf Gyochon.",
  "[Donggung-Palast und Wolji-Teich](https://gyeongju.go.kr/open_content/english/page.do?mnu_uid=1371&pageNo=1&pageOrder=0&pagePrvNxt=1&pageRef=0&parm_bod_uid=147831&parm_mnu_uid=0&srchBgpUid=-1&srchColumn=&srchEDate=&srchEnable=1&srchKeyword=&srchSDate=&srchVoteType=-1&step=258)":
    "[Donggung-Balascht un Wolji-Weiher](https://gyeongju.go.kr/open_content/english/page.do?mnu_uid=1371&pageNo=1&pageOrder=0&pagePrvNxt=1&pageRef=0&parm_bod_uid=147831&parm_mnu_uid=0&srchBgpUid=-1&srchColumn=&srchEDate=&srchEnable=1&srchKeyword=&srchSDate=&srchVoteType=-1&step=258)",
  "nach Einbruch der Dunkelheit beleuchtet, das ist der schönste Abendspaziergang der Stadt.":
    "wenn's dunkel werd, beleuchtet – des is de scheenschde Owendspaziergang in de Schdadt.",
  "Hanok-Gasse mit Cafés, Bäckereien (Gyeongju-ppang) und Restaurants.":
    "Hanok-Gass mit Cafés, Bäckereie (Gyeongju-ppang) un Restaurants.",
  "Goldkronen der Silla-Könige und die Emille-Glocke.":
    "Goldkrone vun de Silla-Kenisch un die Emille-Glock.",
  "ebener Rundweg am Wasser mit Fahrradverleih, nah am Hotel.":
    "ewener Rundwech am Wasser mit Fahrradverleih, nah am Hodel.",
  "gut erhaltenes Dorf des Adels aus der Joseon-Zeit, 30 Minuten mit dem Taxi.":
    "gut erhaldenes Dorf vum Adel aus de Joseon-Zeit, 30 Minude mit'm Taxi.",
  "Private UNESCO-Tour mit Guide, Abholung im Hotel":
    "Private UNESCO-Tour mit Guide, Abhole am Hodel",
  "[Radtour durch die historische Zone](https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=221789)":
    "[Radtour durch die historisch Zone](https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=221789)",
  "selbst organisiert, Verleih am Haupttor von Daereungwon ([Infos der Stadt Gyeongju](https://www.gyeongju.go.kr/tour/eng/page.do?mnu_uid=2768))":
    "selwer organisiert, Verleih am Hauptdoor vun Daereungwon ([Infos vun de Schdadt Gyeongju](https://www.gyeongju.go.kr/tour/eng/page.do?mnu_uid=2768))",
  "Ankunft gegen Mittag, Check-in. Nachmittags Tumuli-Park, Cheomseongdae und Dorf Gyochon. Abends Donggung und Wolji-Teich, Abendessen in Hwangnidan-gil.":
    "Ookumme so gege Middag, Check-in. Nochmiddags Tumuli-Park, Cheomseongdae un Dorf Gyochon. Owends Donggung un Wolji-Weiher, Nachtesse in Hwangnidan-gil.",
  "Private UNESCO-Tour: Bulguksa und Seokguram am Morgen, danach Nationalmuseum. Am Abend Thermalbad im Innenhof des Hanok.":
    "Private UNESCO-Tour: Bulguksa un Seokguram am Morje, donoch Nationalmuseum. Am Owend Thermalbad im Innehof vum Hanok.",
  "Früh nach Yangdong (am Feiertagswochenende wird es voller), nachmittags Radtour am Bomun-See.":
    "Frieh nach Yangdong (am Feierdaachswocheend werd's voller), nochmiddags Radtour am Bomun-See.",
  "Vormittags mit dem KTX nach Seoul.":
    "Vormiddags mit'm KTX nach Seoul.",
  "Modernes Seoul, Shopping, Abschied":
    "Modernes Seoul, Shopping, Ade sage",
  "Zum Schluss lernt ihr die moderne Seite Seouls kennen: Gangnam, Wolkenkratzer, Design-Viertel und der Han-Fluss. Am Ende bleibt noch Zeit zum Einkaufen und für ein Abschiedsessen.":
    "Zum Schluss lernt ihr die modern Seit vun Seoul kenne: Gangnam, Wolkekratzer, Design-Viertel un de Han-Fluss. Am End bleibt noch Zeit zum Eikaafe un fer e Abschiedsesse.",
  "In Gangnam. Es setzt die Tradition des ersten Luxushotels Koreas von 1914 fort und hat einen MICHELIN Key. Es gibt einen Innenpool mit Blick auf die Skyline, die COEX Mall und der Tempel Bongeunsa sind in der Nähe.":
    "In Gangnam. Es macht weider mit de Tradition vum erschde Luxushodel in Korea vun 1914 un hot en MICHELIN Key. Es gebbt en Innepool mit Blick uff die Skyline, die COEX Mall un de Dempel Bongeunsa sinn glei um die Eck.",
  "Tempel aus dem 8. Jahrhundert mitten zwischen den Bürotürmen.":
    "Dempel aus'm 8. Johrhunnert mitte zwische de Bürodürm.",
  "[Starfield Library](https://m.starfield.co.kr/coexmall/library/intro?lang=en) in der COEX Mall":
    "[Starfield Library](https://m.starfield.co.kr/coexmall/library/intro?lang=en) in de COEX Mall",
  "Bibliothek mit 13 m hohen Bücherregalen, kostenlos.":
    "Bibliothek mit 13 m hohe Bicherregal, koscht nix.",
  "[Lotte World Tower (Seoul Sky)](https://www.lwt.co.kr/en/entertainment/seoulsky.do) und [Seokchon-See](https://english.visitseoul.net/area/Seokchon-Lake-Park/ENP001136)":
    "[Lotte World Tower (Seoul Sky)](https://www.lwt.co.kr/en/entertainment/seoulsky.do) un [Seokchon-See](https://english.visitseoul.net/area/Seokchon-Lake-Park/ENP001136)",
  "Aussichtsplattform in 500 m Höhe mit Glasboden, unten ein Spaziergang am See.":
    "Aussichtsplattform in 500 m Hee mit Glasbode, unne en Spaziergang am See.",
  "ehemaliges Fabrikviertel mit Cafés, Concept Stores und Pop-up-Shops von K-Beauty- und Modemarken.":
    "frieheres Fabrikviertel mit Cafés, Concept Stores un Pop-up-Shops vun K-Beauty- un Modemarke.",
  "[Apgujeong und Garosu-gil](https://english.visitseoul.net/shopping/Garosu-gil-in-Sinsadong/ENP000291)":
    "[Apgujeong un Garosu-gil](https://english.visitseoul.net/shopping/Garosu-gil-in-Sinsadong/ENP000291)",
  "Boutiquen, Designer-Mode, Restaurants.":
    "Boutique, Designer-Mod, Restaurants.",
  "Abendfahrt mit dem Schiff ([E-Land Cruise](https://www.elandcruise.com/)) oder Picknick im [Banpo-Hangang-Park](https://english.visitseoul.net/area/Banpo-Hangang-Park/ENP003968). Der [Mondlicht-Regenbogenbrunnen](https://english.visitseoul.net/area/Banpodaegyo-Bridge-Moonlight-Rainbow-Fountain/ENP002220) an der Banpo-Brücke läuft je nach Saison bis Oktober.":
    "Owendfahrt mit'm Schiff ([E-Land Cruise](https://www.elandcruise.com/)) odder Picknick im [Banpo-Hangang-Park](https://english.visitseoul.net/area/Banpo-Hangang-Park/ENP003968). De [Mondlicht-Regeboggebrunne](https://english.visitseoul.net/area/Banpodaegyo-Bridge-Moonlight-Rainbow-Fountain/ENP002220) an de Banpo-Brick laaft je nach Saison bis Oktower.",
  "[Mangwon-Markt](https://english.visitseoul.net/shopping/Mangwon-Market/ENP037950) und [Yeonnam-dong](https://english.visitseoul.net/nature/Gyeongui-Line-Forest-Park_/37216)":
    "[Mangwon-Markt](https://english.visitseoul.net/shopping/Mangwon-Market/ENP037950) un [Yeonnam-dong](https://english.visitseoul.net/nature/Gyeongui-Line-Forest-Park_/37216)",
  "Streetfood auf dem Markt und Cafés am Gyeongui-Line-Park.":
    "Streetfood uff'm Markt un Cafés am Gyeongui-Line-Park.",
  "Ankunft mit dem KTX, Check-in. Nachmittags Bongeunsa und Starfield Library. Abends Bootsfahrt auf dem Han-Fluss oder Banpo-Park.":
    "Ookumme mit'm KTX, Check-in. Nochmiddags Bongeunsa un Starfield Library. Owends Bootsfahrt uff'm Han-Fluss odder Banpo-Park.",
  "Ersatzfeiertag, die Stadt ist voll. Vormittags früh Seoul Sky und Seokchon-See, nachmittags Seongsu-dong.":
    "Ersatzfeierdaach, die Schdadt is rappelvoll. Vormiddags frieh Seoul Sky un Seokchon-See, nochmiddags Seongsu-dong.",
  "Mangwon-Markt und Yeonnam-dong, Einkaufen in Apgujeong oder Myeongdong. Abschiedsessen in einem Restaurant mit koreanischer Fine-Dining-Küche, Reservierung über die App CatchTable.":
    "Mangwon-Markt un Yeonnam-dong, Eikaafe in Apgujeong odder Myeongdong. Abschiedsesse in me Restaurant mit koreanischer Fine-Dining-Küch, reserviere iwwer die App CatchTable.",
  "Taxi nach {flight:retFromName}, Rückflug {flight:retCode} um ca. {flight:retDep} Uhr, Ankunft in {flight:retToName} ca. {flight:retArr} Uhr.":
    "Taxi nach {flight:retFromName}, Rickflug {flight:retCode} um ca. {flight:retDep} Uhr, in {flight:retToName} ca. {flight:retArr} Uhr. Dehääm!",
  "Nonstop in Business Class gibt es nur ab Frankfurt. Von Köln und Düsseldorf aus ist man mit dem ICE in etwa 1 bzw. 1,5 Stunden am Frankfurter Flughafen. Mit Lufthansa lässt sich diese Zugfahrt als Lufthansa Express Rail direkt im Flugticket buchen. Nonstop fliegen auf der Strecke [Lufthansa, Korean Air, Asiana und T'way](https://www.flightconnections.com/flights-from-fra-to-icn), die Flugzeit beträgt rund 11 Std. 20 Min. hin und 13–14 Std. zurück.":
    "Nonstop in Business Class gebbt's nur ab Frankfurt. Vun Köln un Düsseldorf aus is mer mit'm ICE in so 1 bzw. 1,5 Schdunne am Frankfurter Flughafe. Bei de Lufthansa kann mer die Zugfahrt als Lufthansa Express Rail direkt im Flugticket mitbuche. Nonstop fliege uff dere Streck [Lufthansa, Korean Air, Asiana un T'way](https://www.flightconnections.com/flights-from-fra-to-icn), mer hockt rund 11 Std. 20 Min. hie un 13–14 Std. zurick im Flieger.",
  "Route":
    "Rout",
  "Frequenz (Stand 2026)":
    "Wie oft (Schdand 2026)",
  "Preis p. P. hin/zurück":
    "Breis p. P. hie/zurick",
  "täglich, A350-900":
    "jeden Daach, A350-900",
  "Business mit Liegesitz":
    "Business mit Liechesitz",
  "3× pro Woche, B777-300ER":
    "3× die Woch, B777-300ER",
  "Angebote [ab 2.439 €](https://reisetopia.de/deals/business-class-angebot-korean-air-deutschland-seoul/), sonst bis ca. 3.800 €":
    "Ogebote [ab 2.439 €](https://reisetopia.de/deals/business-class-angebot-korean-air-deutschland-seoul/), sunscht bis ca. 3.800 €",
  "ca. 4× pro Woche, A350-900":
    "ca. 4× die Woch, A350-900",
  "bis täglich, A330":
    "bis jeden Daach, A330",
  "„Business Saver“ (einfacher, kein Vollflachbett-Standard)":
    "„Business Saver“ (ääfacher, kää Vollflachbett-Schdandard)",
  "DUS/FRA–HEL–ICN, 1 Stopp":
    "DUS/FRA–HEL–ICN, 1 Zwischehalt",
  "täglich":
    "jeden Daach",
  "Lufthansa hin und zurück, oder Korean Air an den Tagen, an denen sie fliegt. Beide fliegen nonstop, auf beiden gibt es ein Vollflachbett, und das Gepäck geht durch. Finnair ist die günstige Alternative mit einem Stopp, auch ab Düsseldorf.":
    "Lufthansa hie un zurick, odder Korean Air an de Dääch, wo die fliegt. Die zwaa fliege nonstop, bei beide gebbt's e Vollflachbett, un's Gebäck geht durch. Finnair is die billischer Alternative mit ääm Zwischehalt, aa ab Düsseldorf.",
  "Hinflug":
    "Hieflug",
  "Rückflug":
    "Rickflug",
  "oder KE945 ca. 11:00 → 17:30 (falls Korean Air an dem Tag fliegt)":
    "odder KE945 ca. 11:00 → 17:30 (wenn Korean Air an dem Daach fliegt)",
  "Uhrzeiten laut Flugplan 2026, vor Buchung prüfen.":
    "Uhrzeide laut Flugplan 2026 – vor'm Buche nochmol brife.",
  "Dienstag und Mittwoch als Abflugtag wählen, Freitag und Sonntag meiden.":
    "Dienschdaach un Mittwoch als Abflugdaach nemme, Freidaach un Sunndaach bleiwe losse.",
  "In Google Flights den Kalender für ±3 Tage ansehen. Wenn der 14.9. oder 16.9. deutlich günstiger ist, verschiebt sich der Plan nur um einen Tag.":
    "In Google Flights de Kalenner fer ±3 Dääch ogugge. Wenn de 14.9. odder 16.9. arg billischer is, rutscht de Blan nur um en Daach.",
  "Für Mitte September 2027 sind Flüge schon jetzt buchbar. Richtet Preisalarme ein und bucht spätestens im Frühjahr 2027.":
    "Fer Mitte Septemwer 2027 kann mer die Flieg jetzt schun buche. Richt eich Breisalarme ei un bucht spädeschdens im Friehjohr 2027.",
  "Strecke":
    "Streck",
  "Dauer":
    "Wie lang",
  "Preis p. P. (Economy)":
    "Breis p. P. (Economy)",
  "Korean Air bietet auf Inlandsflügen eine Prestige Class mit breiteren Sitzen an. Bei so kurzen Flügen lohnt sich der Aufpreis aber kaum. Ein Flug am Vormittag ist meist günstiger als am späten Nachmittag.":
    "Korean Air hot uff Inlandsflieg e Prestige Class mit breidere Sitz. Bei so korze Flieg lohnt sich de Uffbreis awwer kaum. En Flug am Vormiddag is meischdens billischer wie am schbäde Nochmiddag.",
  "Alle Transfers zusammen kosten für zwei Personen rund 700–1.100 €, darin sind die Inlandsflüge und zwei Fahrertage auf Jeju enthalten. Mit Gepäck ist von Tür zu Tür meist das Taxi die bequemste Lösung. In Korea sind Taxis günstig, und die App Kakao T funktioniert auch mit ausländischer Kreditkarte.":
    "Die ganz Fahrerei zamme koscht fer zwaa Leit rund 700–1.100 €, do sinn die Inlandsflieg un zwaa Fahrerdääch uff Jeju schun drin. Mit Gebäck is vun Dier zu Dier meischdens's Taxi am gemiedlichschde. In Korea sinn Taxis billisch, un die App Kakao T geht aa mit ausländischer Kreditkart.",
  "Von → Nach":
    "Vun → Nach",
  "Verkehrsmittel":
    "Wie",
  "Preis (2 Pers., Richtwert)":
    "Breis (2 Leit, so ungefähr)",
  "Köln/Düsseldorf → Flughafen Frankfurt":
    "Köln/Düsseldorf → Flughafe Frankfurt",
  "im LH-Ticket enthalten bzw. ca. 60 – 180 €":
    "im LH-Ticket drin bzw. ca. 60 – 180 €",
  "Taxi oder Hotellimousine; Alternative: [AREX Express](https://www.arex.or.kr) bis Seoul Station + Taxi":
    "Taxi odder Hodellimousin; Alternative: [AREX Express](https://www.arex.or.kr) bis Seoul Station + Taxi",
  "{hotel:seoul} → Flughafen Gimpo":
    "{hotel:seoul} → Flughafe Gimpo",
  "Flughafen Jeju → {hotel:jeju}":
    "Flughafe Jeju → {hotel:jeju}",
  "Taxi; Alternative: Flughafen-Limousinenbus 600":
    "Taxi; Alternative: Flughafe-Limousinebus 600",
  "Inselrundfahrten Jeju":
    "Rundfahrte iwwer die Insel Jeju",
  "[Privatwagen mit Fahrer, 9 Std.](https://www.klook.com/activity/174339-jeju-private-transfer/)":
    "[Privatwaache mit Fahrer, 9 Std.](https://www.klook.com/activity/174339-jeju-private-transfer/)",
  "ganztägig":
    "de ganze Daach",
  "ca. 250.000 – 350.000 KRW pro Tag (170 – 235 €) inkl. Benzin, Maut, Parken":
    "ca. 250.000 – 350.000 KRW am Daach (170 – 235 €) mit Benzin, Maut, Parke",
  "{hotel:jeju} → Flughafen Jeju":
    "{hotel:jeju} → Flughafe Jeju",
  "Flughafen Gimhae → {hotel:busan}":
    "Flughafe Gimhae → {hotel:busan}",
  "Taxi direkt (bequemste Lösung); Alternative: KTX Busan → Gyeongju (30 Min., 11.900 KRW p. P.) plus zwei Taxis":
    "Taxi direkt (am gemiedlichschde); Alternative: KTX Busan → Gyeongju (30 Min., 11.900 KRW p. P.) plus zwaa Taxis",
  "{hotel:gyeongju} → Bahnhof Gyeongju (früher Singyeongju)":
    "{hotel:gyeongju} → Bahnhof Gyeongju (frieher Singyeongju)",
  "[KTX](https://www.letskorail.com), First Class empfohlen":
    "[KTX](https://www.letskorail.com), First Class is zu empfehle",
  "Taxi oder Flughafen-Limousinenbus":
    "Taxi odder Flughafe-Limousinebus",
  "Seit dem 1.9.2026 sind KTX und SRT zusammengelegt, und die KTX-Preise sind im Schnitt um etwa 10 % gesunken. Laut [aktueller Preisübersicht](https://www.seoultourism.org/?p=1841) kostet Seoul–Gyeongju rund 44.500 KRW in der Standardklasse, First Class kostet etwa 40–50 % mehr. Tickets gibt es ab einem Monat vor der Fahrt. Am 3.10. ist ein langes Feiertagswochenende, bucht die Züge also gleich zum Verkaufsstart.":
    "Seit'm 1.9.2026 sinn KTX un SRT zammegelegt, un die KTX-Breise sinn im Schnitt um so 10 % runner. Laut [aktueller Breisiwwersicht](https://www.seoultourism.org/?p=1841) koscht Seoul–Gyeongju rund 44.500 KRW in de Schdandardklass, First Class koscht so 40–50 % mehr. Tickets gebbt's ab ääm Monat vor de Fahrt. Am 3.10. is e langes Feierdaachswocheend – alla bucht die Zieg glei, wenn de Verkaaf losgeht.",
  "Einreise":
    "Eireis",
  "Deutsche brauchen kein Visum. Bis 31.12.2026 sind sie [von der K-ETA befreit](https://discover.passportindex.org/policy-and-regulations/south-korea-extends-k-eta-exemption-until-end-of-2026/). [Für 2027 gibt es noch keine offizielle Entscheidung](https://pixidia.com/?p=88591). Wenn die Befreiung endet, beantragt ihr die K-ETA vor der Reise auf k-eta.go.kr (10.000 KRW, bis zu 72 Std. Bearbeitung). Ohne K-ETA füllt ihr die elektronische Ankunftskarte aus.":
    "Deitsche brauche kää Visum. Bis 31.12.2026 sinn se [vun de K-ETA befreit](https://discover.passportindex.org/policy-and-regulations/south-korea-extends-k-eta-exemption-until-end-of-2026/). [Fer 2027 gebbt's noch kää offizielle Entscheidung](https://pixidia.com/?p=88591). Wenn die Befreiung uffhört, beantragt ihr die K-ETA vor de Reis uff k-eta.go.kr (10.000 KRW, bis zu 72 Std. Bearbeidung). Ohne K-ETA fillt ihr die elektronisch Ookunftskart aus.",
  "Buchungsfristen":
    "Buchungsfrischde",
  "Flüge: jetzt Preisalarme setzen, bis Frühjahr 2027 buchen":
    "Flieg: jetzt Breisalarme setze, bis Friehjohr 2027 buche",
  "Hotels: 6–9 Monate vorher, Ragung wegen der nur 16 Zimmer zuerst":
    "Hodels: 6–9 Monat vorher, Ragung wesche de nur 16 Zimmer zuerschd",
  "Geheimer Garten (Changdeokgung): Reservierung online, einige Wochen vorher":
    "Geheimer Gaade (Changdeokgung): online reserviere, e paar Woche vorher",
  "Sky Capsules in Busan: Freischaltung jeweils 4 Wochen vorher, dienstags 7 Uhr":
    "Sky Capsules in Busan: gehn immer 4 Woche vorher online, dienschdags 7 Uhr",
  "KTX: Verkauf ab einem Monat vorher, Fahrt am {d:2027-10-03} gleich am ersten Tag buchen":
    "KTX: Verkaaf ab ääm Monat vorher, die Fahrt am {d:2027-10-03} glei am erschde Daach buche",
  "Fahrer auf Jeju: 2–3 Monate vorher":
    "Fahrer uff Jeju: 2–3 Monat vorher",
  "Wetter":
    "Wedder",
  "In Seoul hat es Mitte bis Ende September tagsüber etwa 22–27 °C, Anfang Oktober 18–23 °C. Auf Jeju ist es wärmer, das Meer hat etwa 24–26 °C. Bis Anfang Oktober kann noch ein Taifun kommen, plant also auf Jeju einen Puffertag ein.":
    "In Seoul hot's Mitte bis End Septemwer daachsiwwer so 22–27 °C, Anfang Oktower 18–23 °C. Uff Jeju is es wärmer, des Meer hot so 24–26 °C. Bis Anfang Oktower kann noch en Taifun kumme – alla blant uff Jeju en Pufferdaach ei.",
  "Feiertage während der Reise":
    "Feierdääch während de Reis",
  "Chuseok am 14.–16.9. (bei eurer Ankunft schon vorbei), Nationalfeiertag am 3.10. mit Ersatzfeiertag am 4.10., Hangeul-Tag am 9.10. (nach eurem Abflug).":
    "Chuseok am 14.–16.9. (wenn ihr ookummt, schun vorbei), Nationalfeierdaach am 3.10. mit Ersatzfeierdaach am 4.10., Hangeul-Daach am 9.10. (wenn ihr schun widder fort seid).",
  "Naver Map (Google Maps ist in Korea unzuverlässig), Kakao T (Taxi), Papago (Übersetzen), CatchTable (Restaurants), Korail Talk (KTX).":
    "Naver Map (Google Maps is in Korea net zuverlässisch), Kakao T (Taxi), Papago (Iwwersetze), CatchTable (Restaurants), Korail Talk (KTX).",
  "Geld und Bezahlen":
    "Geld un Bezahle",
  "Kreditkarte geht fast überall. Für Märkte etwas Bargeld mitnehmen. Eine T-money-Karte gibt es im Convenience Store, damit fahrt ihr U-Bahn und Bus.":
    "Kreditkart geht fascht iwwerall. Fer die Märkt e bissel Bargeld mitnemme. E T-money-Kart gebbt's im Convenience Store, do demit fahrt ihr U-Bahn un Bus.",
  "eSIM vor der Reise kaufen, damit Navigation und Taxi-App ab der Landung funktionieren.":
    "eSIM vor de Reis kaafe, dass Navi un Taxi-App ab de Lannung gehn.",
  "Direktverbindungen FRA–ICN: [FlightConnections](https://www.flightconnections.com/flights-from-fra-to-icn), [AirportOverview](https://www.airportoverview.com/routes/FRA/ICN)":
    "Direktverbindunge FRA–ICN: [FlightConnections](https://www.flightconnections.com/flights-from-fra-to-icn), [AirportOverview](https://www.airportoverview.com/routes/FRA/ICN)",
  "Business-Class-Preise: [reisetopia – Korean Air ab 2.439 €](https://reisetopia.de/deals/business-class-angebot-korean-air-deutschland-seoul/), [Frankfurtflyer – T'way/Finnair](https://frankfurtflyer.de/tag/seoul-icn)":
    "Business-Class-Breise: [reisetopia – Korean Air ab 2.439 €](https://reisetopia.de/deals/business-class-angebot-korean-air-deutschland-seoul/), [Frankfurtflyer – T'way/Finnair](https://frankfurtflyer.de/tag/seoul-icn)",
  "Feiertage 2027: [publicholidays.co.kr – Chuseok](https://publicholidays.co.kr/chuseok/), [Klook – Feiertage 2027](https://www.klook.com/blog/south-korea-public-holidays/)":
    "Feierdääch 2027: [publicholidays.co.kr – Chuseok](https://publicholidays.co.kr/chuseok/), [Klook – Feiertage 2027](https://www.klook.com/blog/south-korea-public-holidays/)",
  "KTX-Preise nach der Fusion: [Seoul Tourism – Korail-Pass und Preise 2026](https://www.seoultourism.org/?p=1841), [Financial News – KTX-SRT-Fusion](https://en.fnnews.com/news/202609011328241250)":
    "KTX-Breise nach de Fusion: [Seoul Tourism – Korail-Pass und Preise 2026](https://www.seoultourism.org/?p=1841), [Financial News – KTX-SRT-Fusion](https://en.fnnews.com/news/202609011328241250)",
  // Feiertage und Ruhetage (Hinweise im Tagesplan, js/plan.js)
  "Chuseok (Erntedankfest)":
    "Chuseok (Erntedankfescht)",
  "Nationalfeiertag":
    "Nationalfeierdaach",
  "Ersatzfeiertag für den Nationalfeiertag":
    "Ersatzfeierdaach fer de Nationalfeierdaach",
  "Hangeul-Tag":
    "Hangeul-Daach",
  "Ersatzfeiertag für den Hangeul-Tag":
    "Ersatzfeierdaach fer de Hangeul-Daach",
  "Gyeongbokgung ist dienstags geschlossen.":
    "Gyeongbokgung hot dienschdaachs zu.",
  "Changdeokgung und der Geheime Garten sind montags geschlossen.":
    "Changdeokgung un de Geheime Gaade hänn mondaachs zu.",
  "Das Spa Cimer im Paradise Hotel ist am vierten Mittwoch im Monat geschlossen.":
    "'s Spa Cimer im Paradise Hotel hot am vierte Mittwoch im Monat zu.",
});
