# Système Expert SCADA – Diagnostic Data Center Télécom (Djezzy)

Système expert complet à 33 règles (R01–R30, M01–M03), qui prend des alarmes
SCADA en entrée et produit un **diagnostic complet** (pas juste une alarme
brute) : problème détecté, critique ou non, causes probables, impacts,
justification du raisonnement, actions de maintenance, et **qui appeler**.

Il fonctionne dans **deux modes** :

1. **Simulation temps réel** (`main.py`) : un simulateur génère des alarmes
   aléatoires (bruit + scénarios provoqués) sur un site fictif "B6", comme le
   ferait un vrai SCADA. Utile pour la démo Flutter.
2. **Rejeu de données réelles** (`replay.py`) : rejoue ton fichier historique
   réel `ALARMES_SCADA_2022_enriched.csv` (35 408 alarmes, 13 sites réels :
   Blida, Oran, Annaba, Dar El Beida B1/B6/MSC21, Constantine, Bir Khadem,
   Mostaganem, Tizi Ouzou...) à travers les 33 règles.

## Contenu du dossier

```
scada_expert_system/
│
├── facts.py              Types d'alarmes reconnus (26) + topologie du site
│                          simulé (sites, salles, UPS, unités clim)
│
├── alarm_catalog.py       Nom d'affichage FR de chaque alarme + sa catégorie
│                          (Énergie, UPS, Batteries, Climatisation, Réseau,
│                          Sécurité, Supervision SCADA)
│
├── escalation.py          Qui appeler selon la catégorie et la gravité
│                          (technicien concerné, responsable technique,
│                          astreinte si Critique)
│
├── knowledge_base.py       LA base de connaissances : pour chacune des 33
│                          règles -> problème, causes probables, impacts,
│                          justification, actions détaillées, équipements,
│                          conditions de retour à la normale
│
├── engine_state.py         Mémoire de travail du moteur : alarmes actives /
│                          historique, fonctions d'interrogation temporelles
│                          (is_active, recent_starts, distinct_recent...)
│
├── rules_engine.py         LE moteur d'inférence : implémente la logique des
│                          33 règles (R01-R30, M01-M03) et construit le
│                          diagnostic JSON complet prêt pour Flutter
│
├── simulator.py            Simulateur SCADA synthétique (bruit + scénarios
│                          provoqués pour être sûr de couvrir les 33 règles)
│
├── main.py                 Point d'entrée MODE SIMULATION : lance le
│                          simulateur + moteur en boucle continue, affiche
│                          les diagnostics et les écrit dans
│                          diagnostics_log.jsonl
│
├── alarm_parser.py         Convertit un message SCADA RÉEL brut (ex: "UPS 3
│                          40 KVA ON BYPASS") en alarme normalisée
│                          (type, salle, ups_id, unit_id)
│
├── real_data_loader.py     Lit ton CSV réel et produit la liste chronologique
│                          d'événements normalisés (Activée / Désactivée)
│
├── replay.py                Point d'entrée MODE REJEU : rejoue ton historique
│                          réel à travers le moteur, écrit
│                          diagnostics_log_replay.jsonl + un résumé par règle
│                          et par gravité
│
└── README.md                Ce fichier
```

Aucune dépendance externe : tout est en Python standard (`stdlib` uniquement).

## Ce que tu dois faire

### 1) Tester le mode simulation (démo temps réel)
```bash
cd scada_expert_system
python3 main.py
```
Ça tourne en continu (Ctrl+C pour arrêter), affiche chaque diagnostic dans la
console et écrit `diagnostics_log.jsonl` (un objet JSON complet par ligne).

### 2) Rejouer ton vrai fichier historique
```bash
cd scada_expert_system
python3 replay.py chemin/vers/ALARMES_SCADA_2022_enriched.csv
```
Ça produit `diagnostics_log_replay.jsonl` + un résumé (nombre de diagnostics
par règle et par gravité) en quelques secondes.

Sur ton fichier de 35 408 alarmes réelles : **24 170 alarmes reconnues** et
**7 881 diagnostics** générés, couvrant 22 des 33 règles (les règles non
déclenchées, ex. R01/R04/R05/R06/R08/R11/R20/R22/R25/R30/M03, n'ont
simplement pas eu leur combinaison exacte d'alarmes dans cet historique
précis — mais elles sont prêtes si le cas se présente).

### 3) Brancher Flutter
Chaque diagnostic JSON dans les fichiers `.jsonl` a exactement cette forme :

```json
{
  "rule_id": "R18",
  "fault_id": "F18",
  "rule_name": "...",
  "category": "Climatisation",
  "severity": "Elevee",
  "is_critical": false,
  "timestamp": "2026-...",
  "site": "B6", "room": "salle_ups", "ups_id": null, "unit_id": null,
  "problem": "...",
  "alarms": ["temp_high_ups_room", "clim_fault_general"],
  "alarm_names": ["Température Haute - Salle UPS", "Alarme Climatiseur (...)"],
  "probable_causes": ["...", "..."],
  "impacts": ["...", "..."],
  "justification": ["..."],
  "recommended_actions": ["...", "...", "..."],
  "equipment_concerned": ["...", "..."],
  "return_to_normal": ["..."],
  "contact_to_call": ["Technicien Climatisation (CVC)", "Responsable technique du site"]
}
```
Chaque champ peut alimenter une carte dédiée dans l'appli (carte "Problème",
carte "Causes", carte "Impacts", carte "Actions", badge rouge/vert "Critique",
bouton "Appeler [contact]"...).

## Pour ajouter/modifier une règle

1. Ajoute/modifie l'entrée dans `knowledge_base.py` (RULES_KB) : problème,
   causes, impacts, justification, actions, équipements, retour à la normale.
2. Ajoute/modifie la fonction `check_RXX(self, s, now)` correspondante dans
   `rules_engine.py` : elle interroge `engine_state.ExpertState` et retourne
   les contextes (site/salle/ups/unité) où la règle est vraie.
3. Ajoute `"RXX"` dans `RulesEngine.RULE_ORDER`.

Rien d'autre à toucher : le moteur, le simulateur et le rejeu réel
fonctionnent automatiquement avec toute nouvelle règle ajoutée ainsi.
