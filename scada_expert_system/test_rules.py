"""
================================================================================
test_rules.py
--------------------------------------------------------------------------------
COMMENT TESTER LE SYSTEME APRES UNE MODIFICATION :

    python3 test_rules.py

Ce script ne dépend PAS du simulateur aléatoire : il crée lui-même des
alarmes précises, à des instants précis, puis vérifie que la bonne règle
(et seulement elle) se déclenche. C'est la bonne façon de vérifier "est-ce
que ça marche encore" après avoir modifié rules_engine.py ou
knowledge_base.py, sans attendre le hasard du simulateur.

Si tu ajoutes une nouvelle règle RXX :
  1. Ajoute un test test_RXX() sur ce modèle.
  2. Ajoute son nom dans la liste TESTS tout en bas du fichier.
  3. Relance `python3 test_rules.py` : il doit afficher "OK" pour RXX.
================================================================================
"""

from datetime import datetime, timedelta

from facts import Alarm
from engine_state import ExpertState
from rules_engine import RulesEngine

NOW = datetime(2026, 1, 1, 12, 0, 0)


def _new_engine_state():
    """Un moteur + état neufs pour chaque test (aucun cooldown, aucun historique)."""
    return ExpertState(), RulesEngine(cooldown_minutes=0)


def _rule_ids(diagnostics):
    return {d["rule_id"] for d in diagnostics}


def test_R01():
    """Perte secteur + GE en panne + UPS sur batterie -> R01 Critique."""
    s, engine = _new_engine_state()
    s.start_alarm(Alarm(type="power_absence", site="B6", start=NOW))
    s.start_alarm(Alarm(type="generator_fault", site="B6", start=NOW))
    s.start_alarm(Alarm(type="ups_on_battery", site="B6", start=NOW))
    diags = engine.evaluate(s, NOW)
    assert "R01" in _rule_ids(diags), "R01 aurait dû se déclencher"


def test_R03():
    """Perte secteur + UPS en bypass (même UPS) -> R03 Critique."""
    s, engine = _new_engine_state()
    s.start_alarm(Alarm(type="power_absence", site="B6", start=NOW))
    s.start_alarm(Alarm(type="ups_on_bypass", site="B6", ups_id="UPS1", start=NOW))
    diags = engine.evaluate(s, NOW)
    assert "R03" in _rule_ids(diags)


def test_R07_bypass_isole():
    """Bypass seul, sans corrélation -> R07 (Faible), PAS R03/R06."""
    s, engine = _new_engine_state()
    s.start_alarm(Alarm(type="ups_on_bypass", site="B6", ups_id="UPS1", start=NOW))
    diags = engine.evaluate(s, NOW)
    ids = _rule_ids(diags)
    assert "R07" in ids
    assert "R03" not in ids and "R06" not in ids


def test_R14():
    """Panne franche UPS -> R14 Elevee."""
    s, engine = _new_engine_state()
    s.start_alarm(Alarm(type="ups_failure", site="B6", ups_id="UPS1", start=NOW))
    diags = engine.evaluate(s, NOW)
    assert "R14" in _rule_ids(diags)


def test_R15_plusieurs_ups():
    """Deux UPS distincts en batterie/bypass sur le même site -> R15 Critique."""
    s, engine = _new_engine_state()
    s.start_alarm(Alarm(type="ups_on_battery", site="B6", ups_id="UPS1", start=NOW))
    s.start_alarm(Alarm(type="ups_on_bypass", site="B6", ups_id="UPS2", start=NOW))
    diags = engine.evaluate(s, NOW)
    assert "R15" in _rule_ids(diags)


def test_R18_temp_clim():
    """Température haute salle UPS + alarme clim même salle -> R18 Elevee."""
    s, engine = _new_engine_state()
    s.start_alarm(Alarm(type="temp_high_ups_room", site="B6", room="salle_ups", start=NOW))
    s.start_alarm(Alarm(type="clim_fault_general", site="B6", room="salle_ups", start=NOW))
    diags = engine.evaluate(s, NOW)
    assert "R18" in _rule_ids(diags)


def test_R19_temp_sans_clim():
    """Température haute salle UPS SEULE (pas de clim) -> R19, pas R18."""
    s, engine = _new_engine_state()
    s.start_alarm(Alarm(type="temp_high_ups_room", site="B6", room="salle_ups", start=NOW))
    diags = engine.evaluate(s, NOW)
    ids = _rule_ids(diags)
    assert "R19" in ids and "R18" not in ids


def test_R24_perte_redondance_clim():
    """2 unités CRAC distinctes en défaut, même salle, <30min -> R24 Critique."""
    s, engine = _new_engine_state()
    s.start_alarm(Alarm(type="clim_fault_general", site="B6", room="salle_ups", unit_id="CRAC1", start=NOW))
    s.start_alarm(Alarm(type="clim_fault_general", site="B6", room="salle_ups", unit_id="CRAC2", start=NOW))
    diags = engine.evaluate(s, NOW)
    assert "R24" in _rule_ids(diags)


def test_R27_plusieurs_zones():
    """Plusieurs zones (salles) en surchauffe simultanée -> R27 Critique."""
    s, engine = _new_engine_state()
    s.start_alarm(Alarm(type="temp_high_ups_room", site="B6", room="salle_ups", start=NOW))
    s.start_alarm(Alarm(type="temp_high_battery_room", site="B6", room="salle_batterie", start=NOW))
    diags = engine.evaluate(s, NOW)
    assert "R27" in _rule_ids(diags)


def test_R30_scenario_critique():
    """UPS sur batterie + temp haute salle UPS + GE en panne -> R30 Critique."""
    s, engine = _new_engine_state()
    s.start_alarm(Alarm(type="ups_on_battery", site="B6", start=NOW))
    s.start_alarm(Alarm(type="temp_high_ups_room", site="B6", room="salle_ups", start=NOW))
    s.start_alarm(Alarm(type="generator_fault", site="B6", start=NOW))
    diags = engine.evaluate(s, NOW)
    assert "R30" in _rule_ids(diags)


def test_pas_de_doublon_meme_tick():
    """Le moteur ne doit émettre le MÊME diagnostic qu'une seule fois tant que
    la situation ne change pas (pas de duplication à chaque tick)."""
    s, engine = _new_engine_state()
    s.start_alarm(Alarm(type="ups_failure", site="B6", ups_id="UPS1", start=NOW))
    diags1 = engine.evaluate(s, NOW)
    diags2 = engine.evaluate(s, NOW + timedelta(seconds=30))  # rien n'a changé
    assert "R14" in _rule_ids(diags1)
    assert "R14" not in _rule_ids(diags2), "Le diagnostic ne doit pas se répéter sans changement"


def test_cooldown():
    """Avec un cooldown, une alarme qui reflappe ne doit pas re-notifier tout
    de suite après avoir été résolue."""
    s = ExpertState()
    engine = RulesEngine(cooldown_minutes=30)

    a1 = Alarm(type="ups_failure", site="B6", ups_id="UPS1", start=NOW)
    s.start_alarm(a1)
    diags1 = engine.evaluate(s, NOW)
    assert "R14" in _rule_ids(diags1)

    # l'alarme se résout puis revient 5 minutes plus tard (flapping)
    s.clear_alarm(a1, NOW + timedelta(minutes=2))
    engine.evaluate(s, NOW + timedelta(minutes=2))

    t2 = NOW + timedelta(minutes=5)
    a2 = Alarm(type="ups_failure", site="B6", ups_id="UPS1", start=t2)
    s.start_alarm(a2)
    diags2 = engine.evaluate(s, t2)
    assert "R14" not in _rule_ids(diags2), "En cooldown : ne doit PAS re-notifier avant 30 min"

    # 40 minutes plus tard : le cooldown est passé, ça doit re-notifier
    s.clear_alarm(a2, NOW + timedelta(minutes=6))
    engine.evaluate(s, NOW + timedelta(minutes=6))  # comme dans la vraie boucle : on
                                                     # ré-évalue à chaque tick, y compris
                                                     # quand une alarme se termine
    t3 = NOW + timedelta(minutes=45)
    a3 = Alarm(type="ups_failure", site="B6", ups_id="UPS1", start=t3)
    s.start_alarm(a3)
    diags3 = engine.evaluate(s, t3)
    assert "R14" in _rule_ids(diags3), "Après le cooldown, ça doit re-notifier"


TESTS = [
    test_R01, test_R03, test_R07_bypass_isole, test_R14, test_R15_plusieurs_ups,
    test_R18_temp_clim, test_R19_temp_sans_clim, test_R24_perte_redondance_clim,
    test_R27_plusieurs_zones, test_R30_scenario_critique,
    test_pas_de_doublon_meme_tick, test_cooldown,
]


def main():
    print("=" * 70)
    print(" TESTS DU SYSTEME EXPERT SCADA (sans aléatoire)")
    print("=" * 70)
    ok, fail = 0, 0
    for t in TESTS:
        try:
            t()
            print(f"  OK   - {t.__name__}")
            ok += 1
        except AssertionError as e:
            print(f"  FAIL - {t.__name__} : {e}")
            fail += 1
        except Exception as e:
            print(f"  ERREUR - {t.__name__} : {type(e).__name__}: {e}")
            fail += 1
    print("=" * 70)
    print(f" Résultat : {ok} OK / {fail} échec(s) sur {ok + fail} tests")
    print("=" * 70)
    if fail:
        raise SystemExit(1)


if __name__ == "__main__":
    main()