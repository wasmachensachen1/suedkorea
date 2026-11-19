"""Ersatzquelle für die Flugsuche: Google Flights über die Open-Source-Bibliothek fli
(PyPI-Paket "flights", https://github.com/punitarani/fli). Inoffiziell, ohne Schlüssel und ohne
Kontingent. Wird von scripts/fetch-flights.mjs aufgerufen, wenn SerpApi nicht verfügbar ist.

Aufruf:  python fli_search.py <anfrage.json>
Anfrage: {"origins": ["FRA"], "destinations": ["ICN"], "date": "2027-09-15",
          "returnDate": "2027-10-06" | null, "cls": "business", "stops": "any" | "0" | "1",
          "airlines": ["LH"], "depFrom": 0, "depTo": 23, "maxDuration": 900}
Ausgabe (stdout, JSON): {"ok": true, "offers": [...]} bzw. {"ok": false, "error": "..."}
Preise sind pro Person (gesucht wird für einen Erwachsenen), in Euro.
"""

import hashlib
import json
import sys


def main():
    try:
        from fli.core.parsers import parse_airlines, resolve_airport
        from fli.models import (
            FlightSearchFilters,
            FlightSegment,
            MaxStops,
            PassengerInfo,
            SeatType,
            SortBy,
            TimeRestrictions,
            TripType,
        )
        from fli.search import SearchFlights
    except Exception as e:  # noqa: BLE001
        return {"ok": False, "error": f"fli nicht installiert: {e}"}

    req = json.load(open(sys.argv[1], encoding="utf8"))
    seat = {"economy": SeatType.ECONOMY, "premium": SeatType.PREMIUM_ECONOMY,
            "business": SeatType.BUSINESS, "first": SeatType.FIRST}[req.get("cls", "business")]
    stops = {"any": MaxStops.ANY, "0": MaxStops.NON_STOP, "1": MaxStops.ONE_STOP_OR_FEWER,
             "2": MaxStops.TWO_OR_FEWER_STOPS}[str(req.get("stops", "any"))]
    origins = [[resolve_airport(c), 0] for c in req["origins"]]
    dests = [[resolve_airport(c), 0] for c in req["destinations"]]

    times = None
    dep_from, dep_to = req.get("depFrom"), req.get("depTo")
    if dep_from not in (None, "", 0) or dep_to not in (None, "", 23, 24):
        times = TimeRestrictions(earliest_departure=int(dep_from or 0), latest_departure=int(dep_to or 23))

    segments = [FlightSegment(departure_airport=origins, arrival_airport=dests,
                              travel_date=req["date"], time_restrictions=times)]
    trip = TripType.ONE_WAY
    if req.get("returnDate"):
        trip = TripType.ROUND_TRIP
        segments.append(FlightSegment(departure_airport=dests, arrival_airport=origins,
                                      travel_date=req["returnDate"]))

    filters = FlightSearchFilters(
        trip_type=trip,
        passenger_info=PassengerInfo(adults=1),
        flight_segments=segments,
        stops=stops,
        seat_type=seat,
        airlines=parse_airlines(req.get("airlines") or None),
        max_duration=int(req["maxDuration"]) if req.get("maxDuration") else None,
        sort_by=SortBy.BEST,
    )

    client = SearchFlights()
    results = client.search(filters, top_n=6, currency="EUR", language="de", country="DE") or []

    offers = []
    for r in results:
        if isinstance(r, tuple):
            out, ret = r[0], r[1] if len(r) > 1 else None
        else:
            out, ret = r, None
        price = out.price if out.price is not None else (ret.price if ret is not None else None)
        if price is None:
            # Bei Business-Hin- und Rückflügen liefert Google den Preis oft erst auf der Buchungsseite
            try:
                opts = client.get_booking_options(r, filters, currency="EUR", language="de", country="DE")
                prices = [o.price for o in opts if o.price]
                price = min(prices) if prices else None
            except Exception:  # noqa: BLE001
                price = None
        o = {"source": "fli", "pricePP": round(price) if price else None,
             "outbound": seg(out), "return": seg(ret) if ret is not None else None}
        o["id"] = "f" + hashlib.sha1(json.dumps([o["outbound"]["codes"], o["outbound"]["dep"],
                                                (o["return"] or {}).get("codes"), (o["return"] or {}).get("dep")]).encode()).hexdigest()[:12]
        offers.append(o)
    return {"ok": True, "offers": offers}


# Die Namensliste von fli ist teils ungenau (z. B. "Lufthansa Cargo"); gängige Airlines selbst benennen
NAMES = {"LH": "Lufthansa", "KE": "Korean Air", "OZ": "Asiana Airlines", "TW": "T'way Air", "AY": "Finnair",
         "LX": "Swiss", "OS": "Austrian", "TK": "Turkish Airlines", "QR": "Qatar Airways", "EK": "Emirates",
         "AF": "Air France", "KL": "KLM", "BA": "British Airways", "LO": "LOT", "CA": "Air China",
         "MU": "China Eastern", "NH": "ANA", "JL": "Japan Airlines", "EY": "Etihad", "SQ": "Singapore Airlines",
         "CX": "Cathay Pacific", "7C": "Jeju Air", "LJ": "Jin Air", "BX": "Air Busan", "ZE": "Eastar Jet",
         "RS": "Air Seoul", "4V": "Fly Gangwon", "RF": "Aero K"}


def seg(fr):
    legs = []
    for lg in fr.legs:
        code = lg.airline.name.lstrip("_")
        legs.append({
            "airline": NAMES.get(code, lg.airline.value),
            "code": f"{code}{lg.flight_number}",
            "from": lg.departure_airport.name,
            "to": lg.arrival_airport.name,
            "dep": lg.departure_datetime.strftime("%Y-%m-%d %H:%M"),
            "arr": lg.arrival_datetime.strftime("%Y-%m-%d %H:%M"),
            "duration": lg.duration,
            "aircraft": lg.aircraft,
        })
    layovers = [{"airport": lo.airport.name, "name": lo.airport_name or lo.city or "",
                 "duration": lo.duration, "overnight": bool(lo.overnight)} for lo in (fr.layovers or [])]
    return {
        "from": legs[0]["from"], "to": legs[-1]["to"],
        "dep": legs[0]["dep"], "arr": legs[-1]["arr"],
        "duration": fr.duration, "stops": fr.stops,
        "airlines": list(dict.fromkeys(lg["airline"] for lg in legs)),
        "codes": [lg["code"] for lg in legs],
        "legs": legs, "layovers": layovers,
    }


if __name__ == "__main__":
    try:
        res = main()
    except Exception as e:  # noqa: BLE001
        res = {"ok": False, "error": f"{type(e).__name__}: {e}"}
    print(json.dumps(res, ensure_ascii=False))
