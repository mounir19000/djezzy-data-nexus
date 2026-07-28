"""
================================================================================
main.py
--------------------------------------------------------------------------------
Point d'entrée du système expert SCADA.

Boucle : Simulateur (génère les alarmes) -> ExpertState (mémoire de travail)
         -> RulesEngine (applique les 33 règles) -> Diagnostics JSON
         -> affichage console + écriture dans diagnostics_log.jsonl

Lancer avec :   python main.py
Arrêter avec :  Ctrl+C
================================================================================
"""

import json
import time
from datetime import datetime, timedelta

from engine_state import ExpertState
from rules_engine import RulesEngine
from simulator import Simulator

DUREE_SIMULEE_MINUTES = 180
PAS_SIMULE_SECONDES = 30          # 1 tick = 30s simulées
VITESSE_ACCELERATION = 60         # 1s réelle = 60s simulées
FICHIER_LOG = "diagnostics_log.jsonl"

ICONES = {"Critique": "🔴", "Elevee": "🟠", "Moyenne": "🟡", "Faible": "🔵", "Info": "⚪"}


def afficher_diagnostic(d: dict):
    icone = ICONES.get(d["severity"], "⚪")
    entite = " / ".join(filter(None, [d.get("site"), d.get("room"), d.get("ups_id"), d.get("unit_id")]))
    critique = "OUI " if d["is_critical"] else "Non"
    print("\n" + "═" * 90)
    print(f"{icone}  {d['rule_id']} ({d['fault_id']})  —  {d['rule_name']}")
    print(f"    Catégorie : {d['category']}   |   Priorité : {d['severity']}   |   Critique : {critique}   |   Entité : {entite}")
    print(f"    Horodatage : {d['timestamp']}")
    print(f"    Alarmes impliquées : {', '.join(d['alarm_names'])}")
    print("─" * 90)
    print(f" Problème détecté\n   {d['problem']}")
    print(f"\n Causes probables")
    for c in d["probable_causes"]:
        print(f"   - {c}")
    print(f"\n  Impacts")
    for i in d["impacts"]:
        print(f"   - {i}")
    print(f"\n Justification")
    for j in d["justification"]:
        print(f"   - {j}")
    print(f"\n Actions recommandées")
    for idx, act in enumerate(d["recommended_actions"], start=1):
        print(f"   {idx}. {act}")
    print(f"\n Retour à la normale")
    for r in d["return_to_normal"]:
        print(f"   - {r}")
    print(f"\n  À contacter")
    for c in d["contact_to_call"]:
        print(f"   - {c}")
    print("═" * 90)


def lancer():
    state = ExpertState()
    engine = RulesEngine()
    simulateur = Simulator(seed=None)

    now = datetime.now()
    nb_ticks = int((DUREE_SIMULEE_MINUTES * 60) / PAS_SIMULE_SECONDES)

    print("=" * 90)
    print(" SYSTEME EXPERT SCADA - DATA CENTER TELECOM (site B6)")
    print(f" 33 règles actives (R01-R30, M01-M03)  |  Durée simulée : {DUREE_SIMULEE_MINUTES} min")
    print(f" Journal JSON : {FICHIER_LOG}")
    print("=" * 90)

    with open(FICHIER_LOG, "w", encoding="utf-8") as log_file:
        try:
            for _ in range(nb_ticks):
                simulateur.tick(state, now)
                state.expire_stale_active(now, max_active_minutes=240)
                diagnostics = engine.evaluate(state, now)

                for d in diagnostics:
                    afficher_diagnostic(d)
                    log_file.write(json.dumps(d, ensure_ascii=False) + "\n")
                    log_file.flush()

                now += timedelta(seconds=PAS_SIMULE_SECONDES)
                time.sleep(PAS_SIMULE_SECONDES / VITESSE_ACCELERATION)

        except KeyboardInterrupt:
            print("\nArrêt manuel demandé (Ctrl+C).")

    print("=" * 90)
    print(f" Backend arrêté. Journal des diagnostics : {FICHIER_LOG}")
    print("=" * 90)


if __name__ == "__main__":
    lancer()
