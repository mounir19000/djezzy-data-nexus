"""
================================================================================
alarm_parser.py
--------------------------------------------------------------------------------
Convertit une ligne réelle du fichier SCADA (category + cleaned_message) en
une alarme normalisée compatible avec le moteur de règles :
    (alarm_type, room, ups_id, unit_id)  ou  None si non reconnue.

Basé sur l'analyse réelle de ALARMES_SCADA_2022_enriched.csv (13 catégories,
35 408 lignes). Les règles ci-dessous sont volontairement simples (mots-clés)
pour rester lisibles et faciles à corriger/étendre.
================================================================================
"""

import re

UPS_RE = re.compile(r"UPS\s*(\d+)", re.IGNORECASE)
STULZ_RE = re.compile(r"STULZ\s*(\d+)", re.IGNORECASE)
MODULE_RE = re.compile(r"MODULE\s*(\d+)", re.IGNORECASE)


def _extract_ups_id(msg: str):
    m = UPS_RE.search(msg)
    return f"UPS{m.group(1)}" if m else None


def _extract_unit_id(msg: str):
    m = STULZ_RE.search(msg)
    if m:
        return f"STULZ{m.group(1)}"
    m = MODULE_RE.search(msg)
    if m:
        return f"MODULE{m.group(1)}"
    if "LIEBERT" in msg.upper():
        return "LIEBERT"
    return None


def _extract_room(msg: str):
    u = msg.upper()
    if "SALLE UPS" in u:
        return "salle_ups"
    if "SALLE BATTERIE" in u:
        return "salle_batterie"
    if "SALLE SWITCH" in u or "SALLE TECHNIQUE" in u:
        return "salle_reseau"
    if "SALLE ENERGIE" in u or "TGBT" in u:
        return "salle_energie"
    if "DATA CENTER" in u or "DATACENTER" in u:
        return "datacenter"
    return None


def parse_alarm(category: str, cleaned_message: str):
    """Retourne dict {type, room, ups_id, unit_id} ou None si non reconnue."""
    msg = cleaned_message or ""
    u = msg.upper()
    room = _extract_room(msg)
    ups_id = _extract_ups_id(msg)
    unit_id = _extract_unit_id(msg)

    if category == "Alarm absence tension":
        return {"type": "power_absence", "room": room, "ups_id": None, "unit_id": None}

    if category == "Alarm demmarage groupe electrogenne":
        return {"type": "generator_start", "room": room, "ups_id": None, "unit_id": None}

    if category == "Alarm default groupe electrogenne":
        return {"type": "generator_fault", "room": room, "ups_id": None, "unit_id": None}

    if category == "Alarm UPS":
        if "BYPASS" in u:
            t = "ups_on_bypass"
        elif "BATTERIE" in u or "BATTERY" in u:
            t = "ups_on_battery"
        elif "OVERLOAD" in u:
            t = "ups_overload"
        elif "FAILUR" in u:
            t = "ups_failure"
        elif "LOW BATTERY" in u or "BATTERIE FAIBLE" in u:
            t = "ups_low_battery"
        else:
            return None  # alarme UPS non classifiable avec certitude
        return {"type": t, "room": room, "ups_id": ups_id, "unit_id": None}

    if category == "Alarm disjencteur":
        if "ARRIVE" in u or "INPUT" in u:
            t = "breaker_fault_input"
        elif "DEPART" in u or "OUTPUT" in u:
            t = "breaker_fault_output"
        else:
            t = "breaker_fault_generic"
        return {"type": t, "room": room, "ups_id": ups_id, "unit_id": None}

    if category == "Alarm redresseur":
        return {"type": "rectifier_fault", "room": room, "ups_id": ups_id, "unit_id": None}

    if category == "Alarm clim":
        return {"type": "clim_fault_general", "room": room, "ups_id": None, "unit_id": unit_id}

    if category == "Alarm Pression":
        if "HAUTE" in u or "HAUT" in u:
            t = "clim_pressure_high"
        else:
            t = "clim_pressure_low"
        return {"type": t, "room": room, "ups_id": None, "unit_id": unit_id}

    if category == "Alarm Incendie":
        return {"type": "clim_fire_common", "room": room, "ups_id": None, "unit_id": unit_id}

    if category in ("Alarm temperature haute", "Autre"):
        if "UPS" in u:
            t = "temp_high_ups_room"
        elif "BATTERIE" in u:
            t = "temp_high_battery_room"
        elif "SWITCH" in u or "TECHNIQUE" in u:
            t = "temp_high_switch_room"
        elif "ENERGIE" in u:
            t = "temp_high_energy_room"
        elif "DATA CENTER" in u or "DATACENTER" in u:
            t = "temp_high_datacenter"
        else:
            return None
        return {"type": t, "room": room, "ups_id": None, "unit_id": None}

    if category == "Alarm fuit d'eau (Innondation)":
        return {"type": "flood_alarm", "room": room, "ups_id": None, "unit_id": None}

    if category == "Alarm Systeme / Communication":
        if "LIAISON" in u and ("COUPÉE" in u or "COUPEE" in u or "N'EST PAS ÉTABLIE" in u or "N'EST PAS ETABLIE" in u):
            return {"type": "scada_link_lost", "room": None, "ups_id": None, "unit_id": None}
        return {"type": "system_diagnostic", "room": None, "ups_id": None, "unit_id": None}

    return None  # catégorie inconnue
