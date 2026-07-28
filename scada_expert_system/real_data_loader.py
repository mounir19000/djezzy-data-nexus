"""
================================================================================
real_data_loader.py
--------------------------------------------------------------------------------
Lit le fichier historique réel (ALARMES_SCADA_2022_enriched.csv) et produit
une séquence chronologique d'événements normalisés :

    (timestamp, state, site_id, alarm_type, room, ups_id, unit_id, raw_message)

state = 'A' (activée) | 'D' (désactivée/clear) | 'Q' (acquittée, ignorée ici)

site_id = "{wilaya}-{site}" (identifiant unique de site, ex: "BLIDA-MSC 10")
================================================================================
"""

import csv
from datetime import datetime

from alarm_parser import parse_alarm

TIME_FORMAT = "%m/%d/%Y %I:%M:%S %p"


def load_events(csv_path: str):
    events = []
    with open(csv_path, encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            state = row["state"]
            if state not in ("A", "D"):     # on ignore les 'Q' (accusé de réception)
                continue
            try:
                ts = datetime.strptime(row["time"].strip(), TIME_FORMAT)
            except ValueError:
                continue

            parsed = parse_alarm(row["category"], row["cleaned_message"])
            if parsed is None:
                continue

            site_id = f"{row['wilaya']}-{row['site']}".strip("-")
            events.append({
                "timestamp": ts,
                "state": state,
                "site_id": site_id,
                "type": parsed["type"],
                "room": parsed["room"],
                "ups_id": parsed["ups_id"],
                "unit_id": parsed["unit_id"],
                "raw_message": row["cleaned_message"],
            })

    events.sort(key=lambda e: e["timestamp"])
    return events
