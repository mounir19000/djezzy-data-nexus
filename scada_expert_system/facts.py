"""
================================================================================
facts.py
--------------------------------------------------------------------------------
Définit :
  - la liste des types d'alarmes SCADA reconnues par le système expert
  - la structure d'une Alarme (Alarm) : type, site, salle, UPS, unité clim, temps
  - la topologie du site simulé (sites, salles, UPS, unités de climatisation)

C'est la "base de faits" du système expert : tout ce que le SCADA peut envoyer.
================================================================================
"""

from dataclasses import dataclass
from datetime import datetime
from typing import Optional


# ------------------------------------------------------------------------
# Tous les types d'alarmes utilisés dans rules.csv (base de connaissances)
# ------------------------------------------------------------------------
ALARM_TYPES = [
    # Énergie
    "power_absence",
    "generator_fault",
    "generator_start",
    # UPS
    "ups_on_battery",
    "ups_low_battery",
    "ups_on_bypass",
    "ups_overload",
    "ups_failure",
    "rectifier_fault",
    "breaker_fault_generic",
    "breaker_fault_input",
    "breaker_fault_output",
    # Climatisation / Température
    "temp_high_ups_room",
    "temp_high_battery_room",
    "temp_high_switch_room",
    "temp_high_energy_room",
    "temp_high_datacenter",
    "clim_fault_general",
    "clim_pressure_high",
    "clim_pressure_low",
    "clim_hotgas",
    "clim_fire_common",
    # Sécurité / Environnement
    "flood_alarm",
    # Supervision SCADA
    "scada_link_lost",
    "system_diagnostic",
    "login_failure",
]


@dataclass
class Alarm:
    """Une occurrence d'alarme SCADA."""
    type: str
    site: str
    start: datetime
    room: Optional[str] = None
    ups_id: Optional[str] = None
    unit_id: Optional[str] = None
    active: bool = True
    end: Optional[datetime] = None

    def matches(self, **filters) -> bool:
        """Vérifie que l'alarme correspond aux filtres donnés (site=, room=, ups_id=, unit_id=)."""
        for key, value in filters.items():
            if value is None:
                continue
            if getattr(self, key, None) != value:
                return False
        return True


# ------------------------------------------------------------------------
# Topologie du site simulé (adapter librement à un vrai site Djezzy)
# ------------------------------------------------------------------------
TOPOLOGY = {
    "sites": ["B6"],
    "rooms": {
        "B6": [
            "salle_ups",
            "salle_batterie",
            "salle_reseau",
            "salle_energie",
            "datacenter",
        ]
    },
    "ups": {
        "B6": ["UPS1", "UPS2"],
    },
    "clim_units": {
        "salle_ups": ["CRAC1", "CRAC2"],
        "salle_batterie": ["CRAC3"],
        "salle_reseau": ["CRAC4"],
        "salle_energie": ["CRAC5"],
        "datacenter": ["CRAC6", "CRAC7"],
    },
    # correspondance salle -> type d'alarme température associé
    "room_temp_alarm": {
        "salle_ups": "temp_high_ups_room",
        "salle_batterie": "temp_high_battery_room",
        "salle_reseau": "temp_high_switch_room",
        "salle_energie": "temp_high_energy_room",
        "datacenter": "temp_high_datacenter",
    },
}
