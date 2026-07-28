"""
================================================================================
alarm_catalog.py
--------------------------------------------------------------------------------
Catalogue des alarmes : nom d'affichage (français) et catégorie technique
pour chacun des types d'alarmes du système (facts.ALARM_TYPES).

Ce catalogue a été aligné sur les catégories réellement observées dans le
fichier historique ALARMES_SCADA_2022_enriched.csv (35 408 alarmes réelles,
13 sites : Blida, Oran, Annaba, Dar El Beida (B1/B6/MSC21), Constantine,
Bir Khadem, Mostaganem, Tizi Ouzou...).
================================================================================
"""

ALARM_LABELS = {
    "power_absence":          "Absence Tension Réseau (coupure secteur)",
    "generator_fault":        "Défaut Groupe Électrogène",
    "generator_start":        "Démarrage Groupe Électrogène",
    "ups_on_battery":         "UPS On Battery (fonctionnement sur batterie)",
    "ups_low_battery":        "UPS Batterie Faible",
    "ups_on_bypass":          "UPS On Bypass",
    "ups_overload":           "UPS Overload (surcharge)",
    "ups_failure":            "UPS Failure (panne franche)",
    "rectifier_fault":        "Défaut Redresseur",
    "breaker_fault_generic":  "Disjoncteur en Défaut (batterie)",
    "breaker_fault_input":    "Disjoncteur Arrivée UPS en Défaut",
    "breaker_fault_output":   "Disjoncteur Départ UPS en Défaut",
    "temp_high_ups_room":     "Température Haute - Salle UPS",
    "temp_high_battery_room": "Température Haute - Salle Batterie",
    "temp_high_switch_room":  "Température Haute - Salle Switch/Technique",
    "temp_high_energy_room":  "Température Haute - Salle Énergie",
    "temp_high_datacenter":   "Température Haute - Data Center",
    "clim_fault_general":     "Alarme Climatiseur (défaut général STULZ/LIEBERT)",
    "clim_pressure_high":     "Climatiseur - Pression Haute",
    "clim_pressure_low":      "Climatiseur - Pression Basse",
    "clim_hotgas":            "Climatiseur - Gaz Chaud",
    "clim_fire_common":       "Climatiseur - Fire Common Alarme (incendie)",
    "flood_alarm":            "Alarme Inondation / Fuite d'eau",
    "scada_link_lost":        "Perte de Liaison SCADA",
    "system_diagnostic":      "Auto-diagnostic Système (serveur supervision)",
    "login_failure":          "Échec de connexion (sécurité)",
}

ALARM_CATEGORY = {
    "power_absence": "Énergie", "generator_fault": "Énergie", "generator_start": "Énergie",
    "ups_on_battery": "UPS", "ups_low_battery": "Batteries", "ups_on_bypass": "UPS",
    "ups_overload": "UPS", "ups_failure": "UPS", "rectifier_fault": "UPS",
    "breaker_fault_generic": "UPS", "breaker_fault_input": "UPS", "breaker_fault_output": "UPS",
    "temp_high_ups_room": "Climatisation", "temp_high_battery_room": "Batteries",
    "temp_high_switch_room": "Réseau", "temp_high_energy_room": "Énergie",
    "temp_high_datacenter": "Climatisation", "clim_fault_general": "Climatisation",
    "clim_pressure_high": "Climatisation", "clim_pressure_low": "Climatisation",
    "clim_hotgas": "Climatisation", "clim_fire_common": "Sécurité",
    "flood_alarm": "Sécurité", "scada_link_lost": "Supervision SCADA",
    "system_diagnostic": "Supervision SCADA", "login_failure": "Sécurité",
}


def label(alarm_type: str) -> str:
    return ALARM_LABELS.get(alarm_type, alarm_type)
