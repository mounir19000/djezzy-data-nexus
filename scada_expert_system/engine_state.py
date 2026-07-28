"""
================================================================================
engine_state.py
--------------------------------------------------------------------------------
Maintient l'état courant des alarmes SCADA (actives + historique récent) et
fournit les fonctions d'interrogation utilisées par les 33 règles du moteur
d'inférence (rules_engine.py) :

    is_active(type, **filters)
    active_list(type, **filters)
    recent_starts(type, minutes, **filters)
    distinct_recent(type, key, minutes, **filters)

C'est la "mémoire de travail" du système expert.
================================================================================
"""

from datetime import datetime, timedelta
from typing import List, Optional

from facts import Alarm


class ExpertState:
    def __init__(self, history_minutes_keep: int = 240):
        self.active: List[Alarm] = []
        self.history: List[Alarm] = []   # alarmes terminées, gardées un moment pour les règles temporelles
        self.history_minutes_keep = history_minutes_keep

    # -------------------------------------------------------------- ingestion
    def start_alarm(self, alarm: Alarm):
        self.active.append(alarm)

    def clear_alarm(self, alarm: Alarm, end_time: datetime):
        alarm.active = False
        alarm.end = end_time
        if alarm in self.active:
            self.active.remove(alarm)
        self.history.append(alarm)

    def purge_old_history(self, now: datetime):
        limite = now - timedelta(minutes=self.history_minutes_keep)
        self.history = [a for a in self.history if a.end is None or a.end >= limite]

    def expire_stale_active(self, now: datetime, max_active_minutes: int = 240):
        """Sécurité : une alarme jamais "clôturée" par le SCADA (D manquant, log
        incomplet...) ne doit pas rester active indéfiniment et alourdir le moteur.
        Après `max_active_minutes` sans clôture, elle est considérée résolue."""
        limite = now - timedelta(minutes=max_active_minutes)
        still_active = []
        for a in self.active:
            if a.start < limite:
                a.active = False
                a.end = now
                self.history.append(a)
            else:
                still_active.append(a)
        self.active = still_active

    # -------------------------------------------------------------- requêtes
    def active_list(self, type_: str, **filters) -> List[Alarm]:
        return [a for a in self.active if a.type == type_ and a.matches(**filters)]

    def is_active(self, type_: str, **filters) -> bool:
        return len(self.active_list(type_, **filters)) > 0

    def all_recent(self, type_: str, minutes: int, now: datetime, **filters) -> List[Alarm]:
        """Alarmes actives OU récemment terminées (type_) démarrées dans la fenêtre."""
        limite = now - timedelta(minutes=minutes)
        pool = self.active + self.history
        return [a for a in pool if a.type == type_ and a.matches(**filters) and a.start >= limite]

    def recent_starts(self, type_: str, minutes: int, now: datetime, **filters) -> int:
        return len(self.all_recent(type_, minutes, now, **filters))

    def distinct_recent(self, type_: str, key: str, minutes: int, now: datetime, **filters) -> List[str]:
        """Valeurs distinctes de l'attribut `key` (ex: ups_id, room) parmi les alarmes
        de type `type_` démarrées dans la fenêtre de temps, filtrées par `filters`."""
        alarms = self.all_recent(type_, minutes, now, **filters)
        values = {getattr(a, key) for a in alarms if getattr(a, key, None) is not None}
        return sorted(values)
