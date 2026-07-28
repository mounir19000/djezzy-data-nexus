"""
================================================================================
rules_engine.py
--------------------------------------------------------------------------------
Le moteur de raisonnement du système expert.

Pour chaque règle (R01...R30, M01...M03), une fonction "check_RXX(state, now)"
interroge l'état des alarmes (engine_state.ExpertState) et retourne la liste
des "contextes" (site/salle/UPS/unité) sur lesquels la règle est actuellement
vérifiée.

Le moteur ne redéclenche PAS un diagnostic à chaque tick pour une même
combinaison déjà signalée : il suit les combinaisons déjà "en cours"
(self.fired) et n'émet un nouveau diagnostic JSON que lors d'une transition
NON-DÉCLENCHÉ -> DÉCLENCHÉ (comme un vrai système expert d'alarmes).

La sortie de evaluate() est une liste de diagnostics complets, au format
JSON demandé (voir knowledge_base.py), prêts à être envoyés à Flutter.
================================================================================
"""

from datetime import datetime
from typing import Dict, List

from engine_state import ExpertState
from knowledge_base import RULES_KB
from alarm_catalog import label as alarm_label
import escalation


def _ctx_key(rule_id: str, ctx: dict) -> str:
    """Clé unique identifiant une combinaison (règle + contexte) pour éviter les doublons."""
    parts = [rule_id] + [f"{k}={v}" for k, v in sorted(ctx.items()) if v is not None]
    return "|".join(parts)


class RulesEngine:
    def __init__(self, cooldown_minutes: int = 30):
        self.fired: Dict[str, bool] = {}          # clé contexte -> actuellement déclenché ?
        self.last_notified: Dict[str, datetime] = {}  # clé contexte -> dernière fois notifié
        self.cooldown_minutes = cooldown_minutes  # anti-répétition : pas de re-notification
                                                   # avant ce délai, même si l'alarme reflappe

    # ============================================================
    # Règles individuelles : chacune retourne une liste de contextes
    # (dict) sur lesquels la règle est vérifiée MAINTENANT.
    # ============================================================

    def check_R01(self, s: ExpertState, now):
        out = []
        for a in s.active_list("power_absence"):
            if s.is_active("generator_fault", site=a.site) and s.is_active("ups_on_battery", site=a.site):
                out.append({"site": a.site})
        return out

    def check_R02(self, s: ExpertState, now):
        out = []
        for a in s.active_list("power_absence"):
            if s.recent_starts("generator_start", 15, now, site=a.site) > 0 and \
               s.recent_starts("ups_on_battery", 15, now, site=a.site) > 0:
                out.append({"site": a.site})
        return out

    def check_R03(self, s: ExpertState, now):
        out = []
        for a in s.active_list("power_absence"):
            for u in s.active_list("ups_on_bypass", site=a.site):
                out.append({"site": a.site, "ups_id": u.ups_id})
        return out

    def check_R04(self, s: ExpertState, now):
        out = []
        for a in s.active_list("ups_on_battery"):
            if s.recent_starts("ups_low_battery", 30, now, ups_id=a.ups_id, site=a.site) > 0:
                out.append({"site": a.site, "ups_id": a.ups_id})
        return out

    def check_R05(self, s: ExpertState, now):
        out = []
        for a in s.active_list("ups_low_battery"):
            if not s.is_active("ups_on_battery", ups_id=a.ups_id, site=a.site):
                out.append({"site": a.site, "ups_id": a.ups_id})
        return out

    def check_R06(self, s: ExpertState, now):
        out = []
        for a in s.active_list("ups_on_bypass"):
            for t in ("breaker_fault_generic", "breaker_fault_input", "breaker_fault_output", "rectifier_fault"):
                if s.is_active(t, ups_id=a.ups_id, site=a.site):
                    out.append({"site": a.site, "ups_id": a.ups_id})
                    break
        return out

    def check_R07(self, s: ExpertState, now):
        out = []
        for a in s.active_list("ups_on_bypass"):
            corr = any(s.is_active(t, ups_id=a.ups_id, site=a.site)
                       for t in ("breaker_fault_generic", "rectifier_fault", "power_absence", "ups_overload"))
            if not corr:
                out.append({"site": a.site, "ups_id": a.ups_id})
        return out

    def check_R08(self, s: ExpertState, now):
        out = []
        for a in s.active_list("rectifier_fault"):
            if s.is_active("ups_on_battery", ups_id=a.ups_id, site=a.site):
                out.append({"site": a.site, "ups_id": a.ups_id})
        return out

    def check_R09(self, s: ExpertState, now):
        out = []
        for a in s.active_list("rectifier_fault"):
            if not s.is_active("ups_on_battery", ups_id=a.ups_id, site=a.site):
                out.append({"site": a.site, "ups_id": a.ups_id})
        return out

    def check_R10(self, s: ExpertState, now):
        return [{"site": a.site, "ups_id": a.ups_id} for a in s.active_list("breaker_fault_input")]

    def check_R11(self, s: ExpertState, now):
        return [{"site": a.site, "ups_id": a.ups_id} for a in s.active_list("breaker_fault_output")]

    def check_R12(self, s: ExpertState, now):
        out = []
        for a in s.active_list("ups_overload"):
            if s.recent_starts("ups_overload", 30, now, ups_id=a.ups_id, site=a.site) >= 1:
                out.append({"site": a.site, "ups_id": a.ups_id})
        return out

    def check_R13(self, s: ExpertState, now):
        out = []
        for a in s.active_list("ups_on_bypass"):
            if s.recent_starts("ups_overload", 10, now, ups_id=a.ups_id, site=a.site) > 0:
                out.append({"site": a.site, "ups_id": a.ups_id})
        return out

    def check_R14(self, s: ExpertState, now):
        return [{"site": a.site, "ups_id": a.ups_id} for a in s.active_list("ups_failure")]

    def check_R15(self, s: ExpertState, now):
        out = []
        for site in {a.site for a in s.active}:
            ups_batt = set(s.distinct_recent("ups_on_battery", "ups_id", 15, now, site=site))
            ups_byp = set(s.distinct_recent("ups_on_bypass", "ups_id", 15, now, site=site))
            distinct_ups = ups_batt | ups_byp
            if len(distinct_ups) >= 2:
                out.append({"site": site})
        return out

    def check_R16(self, s: ExpertState, now):
        out = []
        for a in s.active_list("power_absence"):
            if not (s.is_active("ups_on_battery", site=a.site) or
                    s.is_active("generator_fault", site=a.site) or
                    s.is_active("generator_start", site=a.site)):
                out.append({"site": a.site})
        return out

    def check_R17(self, s: ExpertState, now):
        out = []
        for a in s.active_list("generator_fault"):
            if not s.is_active("power_absence", site=a.site):
                out.append({"site": a.site})
        return out

    def _temp_clim_room(self, s: ExpertState, now, temp_type, room):
        out = []
        for a in s.active_list(temp_type):
            has_clim = any(s.is_active(t, room=a.room, site=a.site)
                           for t in ("clim_fault_general", "clim_pressure_high", "clim_pressure_low", "clim_hotgas", "clim_fire_common"))
            if has_clim:
                out.append({"site": a.site, "room": a.room})
        return out

    def _temp_no_clim_room(self, s: ExpertState, now, temp_type):
        out = []
        for a in s.active_list(temp_type):
            has_clim = any(s.is_active(t, room=a.room, site=a.site)
                           for t in ("clim_fault_general", "clim_pressure_high", "clim_pressure_low", "clim_hotgas", "clim_fire_common"))
            if not has_clim:
                out.append({"site": a.site, "room": a.room})
        return out

    def check_R18(self, s, now): return self._temp_clim_room(s, now, "temp_high_ups_room", "salle_ups")
    def check_R19(self, s, now): return self._temp_no_clim_room(s, now, "temp_high_ups_room")
    def check_R20(self, s, now): return self._temp_clim_room(s, now, "temp_high_battery_room", "salle_batterie")
    def check_R21(self, s, now): return self._temp_no_clim_room(s, now, "temp_high_battery_room")
    def check_R22(self, s, now): return self._temp_clim_room(s, now, "temp_high_switch_room", "salle_reseau")
    def check_R23(self, s, now): return self._temp_no_clim_room(s, now, "temp_high_switch_room")

    def check_R24(self, s: ExpertState, now):
        out = []
        for room in {a.room for a in s.active if a.room is not None}:
            units = s.distinct_recent("clim_fault_general", "unit_id", 30, now, room=room)
            if len(units) >= 2:
                site = next((a.site for a in s.active if a.room == room), None)
                out.append({"site": site, "room": room})
        return out

    def check_R25(self, s: ExpertState, now):
        out = []
        for a in s.active_list("clim_pressure_high"):
            if s.is_active("clim_hotgas", unit_id=a.unit_id, room=a.room):
                out.append({"site": a.site, "room": a.room, "unit_id": a.unit_id})
        return out

    def check_R26(self, s: ExpertState, now):
        out = []
        for a in s.active_list("clim_pressure_low"):
            if s.is_active("clim_fire_common", unit_id=a.unit_id, room=a.room):
                out.append({"site": a.site, "room": a.room, "unit_id": a.unit_id})
        return out

    def check_R27(self, s: ExpertState, now):
        out = []
        temp_types = ["temp_high_ups_room", "temp_high_battery_room", "temp_high_switch_room",
                      "temp_high_energy_room", "temp_high_datacenter"]
        for site in {a.site for a in s.active}:
            zones = set()
            for t in temp_types:
                zones |= set(s.distinct_recent(t, "room", 30, now, site=site))
            if len(zones) >= 2:
                out.append({"site": site})
        return out

    def check_R28(self, s: ExpertState, now):
        out = []
        for a in s.active_list("flood_alarm"):
            if not s.is_active("clim_fault_general", room=a.room, site=a.site):
                out.append({"site": a.site, "room": a.room})
        return out

    def check_R29(self, s: ExpertState, now):
        out = []
        for a in s.active_list("flood_alarm"):
            if s.is_active("clim_fault_general", room=a.room, site=a.site):
                out.append({"site": a.site, "room": a.room})
        return out

    def check_R30(self, s: ExpertState, now):
        out = []
        for a in s.active_list("ups_on_battery"):
            if s.is_active("temp_high_ups_room", site=a.site) and s.is_active("generator_fault", site=a.site):
                out.append({"site": a.site})
        return out

    def check_M01(self, s: ExpertState, now):
        out = []
        for a in s.active_list("scada_link_lost"):
            if s.recent_starts("scada_link_lost", 60, now, site=a.site) >= 2:
                out.append({"site": a.site})
        return out

    def check_M02(self, s: ExpertState, now):
        return [{"site": a.site} for a in s.active_list("system_diagnostic")]

    def check_M03(self, s: ExpertState, now):
        out = []
        for a in s.active_list("login_failure"):
            if s.recent_starts("login_failure", 30, now, site=a.site) >= 3:
                out.append({"site": a.site})
        return out

    # ============================================================
    # Boucle d'évaluation générale
    # ============================================================
    RULE_ORDER = [f"R{n:02d}" for n in range(1, 31)] + ["M01", "M02", "M03"]

    def evaluate(self, s: ExpertState, now: datetime) -> List[dict]:
        diagnostics = []
        currently_true = set()

        for rule_id in self.RULE_ORDER:
            check_fn = getattr(self, f"check_{rule_id}")
            contexts = check_fn(s, now)
            for ctx in contexts:
                key = _ctx_key(rule_id, ctx)
                currently_true.add(key)
                if not self.fired.get(key, False):
                    self.fired[key] = True
                    last = self.last_notified.get(key)
                    en_cooldown = last is not None and (now - last).total_seconds() < self.cooldown_minutes * 60
                    if not en_cooldown:
                        self.last_notified[key] = now
                        diagnostics.append(self._build_diagnostic(rule_id, ctx, s, now))

        # transitions DÉCLENCHÉ -> RÉSOLU : on nettoie juste l'état (pas de diagnostic
        # de fin ici, mais facile à ajouter si besoin pour Flutter)
        for key in list(self.fired.keys()):
            if self.fired[key] and key not in currently_true:
                self.fired[key] = False

        return diagnostics

    def _build_diagnostic(self, rule_id: str, ctx: dict, s: ExpertState, now: datetime) -> dict:
        kb = RULES_KB[rule_id]
        equipment = list(kb["equipment"])
        for k in ("ups_id", "unit_id"):
            if ctx.get(k):
                equipment.append(ctx[k])

        return {
            "rule_id": rule_id,
            "fault_id": kb["fault_id"],
            "rule_name": kb["rule_name"],
            "category": kb["category"],
            "severity": kb["severity"],
            "priority": kb["severity"],
            "is_critical": escalation.is_critical(kb["severity"]),
            "timestamp": now.isoformat(),
            "site": ctx.get("site"),
            "room": ctx.get("room"),
            "ups_id": ctx.get("ups_id"),
            "unit_id": ctx.get("unit_id"),
            "problem": kb["problem"],
            "scenario": kb["rule_name"],
            "alarms": kb["alarms"],
            "alarm_names": [alarm_label(t) for t in kb["alarms"]],
            "diagnostic": kb["problem"],
            "probable_causes": kb["causes"],
            "impacts": kb["impacts"],
            "justification": [kb["justification_text"]],
            "recommended_actions": kb["actions"],
            "equipment_concerned": equipment,
            "return_to_normal": kb["return_to_normal"],
            "contact_to_call": escalation.get_contacts(kb["category"], kb["severity"]),
        }