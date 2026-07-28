"""
================================================================================
simulator.py
--------------------------------------------------------------------------------
Génère un flux d'alarmes SCADA réaliste :
  - du bruit aléatoire (alarmes isolées, ponctuelles) pour toutes les zones/UPS/units
  - de temps en temps, un "scénario provoqué" qui reproduit volontairement la
    combinaison d'alarmes attendue par une règle précise (pour être sûr que
    les 33 règles se déclenchent au moins une fois pendant une démonstration)

Chaque alarme a une durée de vie aléatoire, après quoi elle est levée
automatiquement (clear_alarm).
================================================================================
"""

import random
from datetime import datetime, timedelta

from facts import Alarm, ALARM_TYPES, TOPOLOGY
from engine_state import ExpertState


SCENARIOS = [
    # (site, room, ups_id, unit_id, [types d'alarmes à démarrer ensemble])
    ("B6", None, None, None, ["power_absence", "generator_fault", "ups_on_battery"]),          # -> R01
    ("B6", None, None, None, ["power_absence", "generator_start", "ups_on_battery"]),           # -> R02
    ("B6", None, "UPS1", None, ["power_absence", "ups_on_bypass"]),                              # -> R03
    ("B6", None, "UPS1", None, ["ups_on_battery", "ups_low_battery"]),                           # -> R04
    ("B6", None, "UPS2", None, ["rectifier_fault", "ups_on_battery"]),                           # -> R08
    ("B6", None, "UPS1", None, ["ups_failure"]),                                                 # -> R14
    ("B6", None, "UPS1", None, ["ups_on_battery"]),
    ("B6", None, "UPS2", None, ["ups_on_bypass"]),                                               # + R15 si ensemble
    ("B6", "salle_ups", None, None, ["temp_high_ups_room", "clim_fault_general"]),               # -> R18
    ("B6", "salle_batterie", None, None, ["temp_high_battery_room", "clim_fault_general"]),      # -> R20
    ("B6", "salle_reseau", None, None, ["temp_high_switch_room", "clim_fault_general"]),          # -> R22
    ("B6", "salle_ups", None, "CRAC1", ["clim_pressure_high", "clim_hotgas"]),                    # -> R25
    ("B6", "salle_batterie", None, "CRAC3", ["clim_pressure_low", "clim_fire_common"]),           # -> R26
    ("B6", "salle_ups", None, None, ["flood_alarm"]),                                             # -> R28
    ("B6", "salle_ups", None, None, ["flood_alarm", "clim_fault_general"]),                       # -> R29
    ("B6", None, None, None, ["ups_on_battery", "temp_high_ups_room", "generator_fault"]),        # -> R30
]


class Simulator:
    def __init__(self, seed=None):
        self.rng = random.Random(seed)
        self.pending_clear = []   # liste de (Alarm, clear_time)

    def _random_target(self):
        site = self.rng.choice(TOPOLOGY["sites"])
        room = self.rng.choice(TOPOLOGY["rooms"][site] + [None])
        ups_id = self.rng.choice(TOPOLOGY["ups"][site] + [None])
        unit_id = None
        if room and room in TOPOLOGY["clim_units"]:
            unit_id = self.rng.choice(TOPOLOGY["clim_units"][room] + [None])
        return site, room, ups_id, unit_id

    def _start(self, state: ExpertState, now: datetime, type_, site, room, ups_id, unit_id, duration_min):
        a = Alarm(type=type_, site=site, room=room, ups_id=ups_id, unit_id=unit_id, start=now)
        state.start_alarm(a)
        self.pending_clear.append((a, now + timedelta(minutes=duration_min)))
        return a

    def tick(self, state: ExpertState, now: datetime):
        # 1) lever les alarmes dont la durée est écoulée
        still_pending = []
        for a, clear_time in self.pending_clear:
            if now >= clear_time and a.active:
                state.clear_alarm(a, now)
            else:
                still_pending.append((a, clear_time))
        self.pending_clear = still_pending

        # 2) petite chance de déclencher un scénario complet (pour couvrir les 33 règles)
        if self.rng.random() < 0.04:
            site, room, ups_id, unit_id, types = self.rng.choice(SCENARIOS)
            for t in types:
                r = room
                if t.startswith("temp_high") and not r:
                    r = TOPOLOGY["room_temp_alarm"]
                    # trouve la salle correspondant au type de température
                    for room_name, temp_type in TOPOLOGY["room_temp_alarm"].items():
                        if temp_type == t:
                            r = room_name
                            break
                self._start(state, now, t, site, r, ups_id, unit_id, self.rng.randint(5, 20))

        # 3) bruit de fond : alarmes isolées et ponctuelles
        if self.rng.random() < 0.10:
            type_ = self.rng.choice(ALARM_TYPES)
            site, room, ups_id, unit_id = self._random_target()
            if type_.startswith("temp_high"):
                for room_name, temp_type in TOPOLOGY["room_temp_alarm"].items():
                    if temp_type == type_:
                        room = room_name
                        break
            self._start(state, now, type_, site, room, ups_id, unit_id, self.rng.randint(2, 15))

        state.purge_old_history(now)
