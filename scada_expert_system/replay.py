"""
================================================================================
replay.py
--------------------------------------------------------------------------------
Fait "rejouer" l'historique réel d'alarmes (ALARMES_SCADA_2022_enriched.csv)
à travers le système expert (33 règles), exactement comme s'il tournait en
temps réel sur les 13 sites Djezzy en 2022-2023.

Utilisation :
    python replay.py /mnt/user-data/uploads/ALARMES_SCADA_2022_enriched.csv

Produit :
    diagnostics_log_replay.jsonl   -> un diagnostic JSON complet par ligne
    Un résumé (nombre de diagnostics par règle, par gravité) affiché en fin
================================================================================
"""

import json
import sys
from collections import Counter, defaultdict

from engine_state import ExpertState
from rules_engine import RulesEngine
from facts import Alarm
from real_data_loader import load_events

FICHIER_LOG = "diagnostics_log_replay.jsonl"


def lancer_replay(csv_path: str):
    events = load_events(csv_path)
    print(f"{len(events)} événements d'alarmes reconnus et chargés depuis {csv_path}")

    state = ExpertState(history_minutes_keep=6 * 60)
    engine = RulesEngine()

    # file d'attente d'alarmes actives non encore clôturées, par signature
    pending = defaultdict(list)

    rule_counter = Counter()
    severity_counter = Counter()
    total_diag = 0

    with open(FICHIER_LOG, "w", encoding="utf-8") as log_file:
        for ev in events:
            key = (ev["site_id"], ev["type"], ev["room"], ev["ups_id"], ev["unit_id"])

            if ev["state"] == "A":
                a = Alarm(type=ev["type"], site=ev["site_id"], room=ev["room"],
                          ups_id=ev["ups_id"], unit_id=ev["unit_id"], start=ev["timestamp"])
                state.start_alarm(a)
                pending[key].append(a)

            elif ev["state"] == "D":
                queue = pending.get(key)
                if queue:
                    a = queue.pop(0)
                    state.clear_alarm(a, ev["timestamp"])

            state.expire_stale_active(ev["timestamp"], max_active_minutes=240)
            diagnostics = engine.evaluate(state, ev["timestamp"])
            for d in diagnostics:
                total_diag += 1
                rule_counter[d["rule_id"]] += 1
                severity_counter[d["severity"]] += 1
                log_file.write(json.dumps(d, ensure_ascii=False) + "\n")

            state.purge_old_history(ev["timestamp"])

    print("\n" + "=" * 90)
    print(f" REJEU TERMINÉ - {total_diag} diagnostics générés -> {FICHIER_LOG}")
    print("=" * 90)
    print("\nRépartition par règle :")
    for rule_id, n in sorted(rule_counter.items(), key=lambda x: -x[1]):
        print(f"   {rule_id:5s} : {n}")
    print("\nRépartition par gravité :")
    for sev, n in sorted(severity_counter.items(), key=lambda x: -x[1]):
        print(f"   {sev:10s} : {n}")


if __name__ == "__main__":
    path = sys.argv[1] if len(sys.argv) > 1 else "ALARMES_SCADA_2022_enriched.csv"
    lancer_replay(path)
