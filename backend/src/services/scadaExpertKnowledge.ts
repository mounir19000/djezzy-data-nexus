// Generated from scada_expert_system/knowledge_base.py and alarm_catalog.py.
// Keep this data aligned with the SCADA expert-system rules.

export interface ScadaExpertRuleKnowledge {
  fault_id: string;
  rule_name: string;
  category: string;
  severity: string;
  alarms: string[];
  scope: string;
  problem: string;
  causes: string[];
  impacts: string[];
  justification_text: string;
  actions: string[];
  equipment: string[];
  return_to_normal: string[];
}

export const RULES_KB = {
  "R01": {
    "fault_id": "F01",
    "rule_name": "Perte secteur + Groupe électrogène en panne + UPS sur batterie",
    "category": "Énergie",
    "severity": "Critique",
    "alarms": [
      "power_absence",
      "generator_fault",
      "ups_on_battery"
    ],
    "scope": "same_site",
    "problem": "Le site fonctionne actuellement sur les batteries UPS alors que le groupe électrogène n'a pas démarré après la perte du réseau électrique.",
    "causes": [
      "Défaillance du groupe électrogène",
      "Batterie de démarrage du groupe déchargée",
      "Niveau de carburant insuffisant",
      "Défaut du système de démarrage automatique",
      "Panne électrique sur le groupe"
    ],
    "impacts": [
      "Les batteries UPS alimentent actuellement les équipements",
      "Autonomie restante limitée",
      "Risque de coupure totale des équipements IT si le secteur n'est pas rétabli rapidement"
    ],
    "justification_text": "Le système a détecté simultanément une absence secteur, un défaut du groupe électrogène et un fonctionnement UPS sur batterie sur le même site.",
    "actions": [
      "Vérifier immédiatement l'état du groupe électrogène",
      "Contrôler le niveau de carburant",
      "Vérifier la batterie de démarrage",
      "Contrôler les disjoncteurs et protections",
      "Vérifier l'autonomie restante des batteries UPS",
      "Préparer une alimentation de secours si nécessaire",
      "Informer immédiatement l'équipe de maintenance"
    ],
    "equipment": [
      "Groupe électrogène",
      "UPS",
      "Tableau électrique général"
    ],
    "return_to_normal": [
      "Retour du secteur confirmé",
      "Groupe électrogène à l'arrêt normal",
      "UPS hors mode batterie"
    ]
  },
  "R02": {
    "fault_id": "F02",
    "rule_name": "Perte secteur + démarrage GE + bascule UPS (séquence normale)",
    "category": "Énergie",
    "severity": "Faible",
    "alarms": [
      "power_absence",
      "generator_start",
      "ups_on_battery"
    ],
    "scope": "same_site",
    "problem": "Le basculement vers l'alimentation de secours s'est déroulé correctement suite à une coupure secteur.",
    "causes": [
      "Coupure secteur confirmée",
      "Démarrage automatique du groupe réussi",
      "Fonctionnement nominal du système de secours"
    ],
    "impacts": [
      "Aucun impact majeur détecté si la séquence se termine normalement"
    ],
    "justification_text": "Le système a détecté une absence secteur suivie d'un démarrage du groupe électrogène puis d'un fonctionnement UPS sur batterie de courte durée : séquence de transition normale.",
    "actions": [
      "Vérifier le retour du secteur",
      "Contrôler que l'UPS quitte le mode batterie",
      "Vérifier le temps de démarrage du groupe",
      "Continuer la surveillance"
    ],
    "equipment": [
      "Groupe électrogène",
      "UPS"
    ],
    "return_to_normal": [
      "UPS repasse sur secteur/groupe",
      "Fin de l'alarme ups_on_battery peu après le démarrage GE"
    ]
  },
  "R03": {
    "fault_id": "F03",
    "rule_name": "Perte secteur + UPS en bypass (charge non protégée)",
    "category": "UPS",
    "severity": "Critique",
    "alarms": [
      "power_absence",
      "ups_on_bypass"
    ],
    "scope": "same_site_same_ups",
    "problem": "L'UPS fonctionne en bypass pendant une coupure secteur : la charge n'est protégée ni par batterie ni par onduleur.",
    "causes": [
      "Bascule bypass automatique suite à un défaut interne",
      "Maintenance en cours sur l'UPS",
      "Défaut du redresseur/onduleur empêchant le mode normal"
    ],
    "impacts": [
      "Aucune protection contre les coupures pendant cette période",
      "Risque d'arrêt brutal des équipements IT",
      "Aucune régulation de tension/fréquence pour la charge"
    ],
    "justification_text": "Le système a détecté une absence secteur combinée à un fonctionnement UPS en bypass sur le même site et le même onduleur.",
    "actions": [
      "Vérifier immédiatement l'état de l'UPS",
      "Identifier la cause du passage en bypass",
      "Rétablir le mode normal dès que possible",
      "Informer en urgence l'équipe de maintenance",
      "Surveiller la charge en aval"
    ],
    "equipment": [
      "UPS",
      "Tableau de distribution"
    ],
    "return_to_normal": [
      "Retour du secteur",
      "UPS repasse en mode normal (hors bypass)"
    ]
  },
  "R04": {
    "fault_id": "F04",
    "rule_name": "UPS sur batterie + batterie faible",
    "category": "Batteries",
    "severity": "Elevee",
    "alarms": [
      "ups_on_battery",
      "ups_low_battery"
    ],
    "scope": "same_ups",
    "problem": "L'UPS fonctionne sur batterie et le niveau de charge devient critique.",
    "causes": [
      "Coupure secteur prolongée",
      "Groupe électrogène non disponible",
      "Batteries vieillissantes ou sous-dimensionnées"
    ],
    "impacts": [
      "Risque imminent d'arrêt des équipements IT",
      "Perte de données possible en cas de coupure brutale"
    ],
    "justification_text": "Le système a détecté un fonctionnement sur batterie suivi rapidement d'une alarme de batterie faible sur le même UPS.",
    "actions": [
      "Vérifier l'autonomie restante en temps réel",
      "Accélérer le rétablissement du secteur ou du groupe",
      "Préparer un arrêt propre des charges non critiques",
      "Informer immédiatement le responsable maintenance"
    ],
    "equipment": [
      "UPS",
      "Banc de batteries"
    ],
    "return_to_normal": [
      "Fin du mode batterie",
      "Recharge des batteries entamée"
    ]
  },
  "R05": {
    "fault_id": "F05",
    "rule_name": "Batterie faible sans fonctionnement sur batterie",
    "category": "Batteries",
    "severity": "Moyenne",
    "alarms": [
      "ups_low_battery"
    ],
    "scope": "same_ups",
    "problem": "Une alarme de batterie faible est présente alors que l'UPS n'est pas en fonctionnement sur batterie.",
    "causes": [
      "Défaut de charge du chargeur de batterie",
      "Batterie défectueuse ou en fin de vie",
      "Capteur de mesure de charge défaillant"
    ],
    "impacts": [
      "Réduction de l'autonomie disponible en cas de coupure future",
      "Risque à moyen terme si non corrigé"
    ],
    "justification_text": "Le système a détecté une alarme batterie faible en dehors de tout fonctionnement sur batterie, ce qui signale une anomalie du système de charge plutôt qu'une coupure en cours.",
    "actions": [
      "Contrôler le chargeur de batterie",
      "Tester l'état de santé des batteries",
      "Vérifier les connexions et la température des batteries",
      "Planifier une intervention préventive"
    ],
    "equipment": [
      "Banc de batteries",
      "Chargeur UPS"
    ],
    "return_to_normal": [
      "Disparition de l'alarme batterie faible après contrôle"
    ]
  },
  "R06": {
    "fault_id": "F06",
    "rule_name": "UPS en bypass corrélé à un défaut interne",
    "category": "UPS",
    "severity": "Elevee",
    "alarms": [
      "ups_on_bypass",
      "breaker_fault_generic",
      "breaker_fault_input",
      "breaker_fault_output",
      "rectifier_fault"
    ],
    "scope": "same_ups",
    "problem": "L'UPS est passé en bypass en corrélation avec un défaut interne détecté (disjoncteur ou redresseur).",
    "causes": [
      "Déclenchement d'un disjoncteur interne",
      "Défaut du redresseur",
      "Défaut électrique interne à l'UPS"
    ],
    "impacts": [
      "Charge non protégée pendant le bypass",
      "Risque de panne totale de l'UPS si non traité"
    ],
    "justification_text": "Le système a détecté un fonctionnement en bypass corrélé à un défaut de disjoncteur ou de redresseur sur le même UPS.",
    "actions": [
      "Diagnostiquer le défaut interne signalé",
      "Contrôler les disjoncteurs concernés",
      "Vérifier le redresseur",
      "Planifier une intervention technique avant retour en mode normal"
    ],
    "equipment": [
      "UPS",
      "Redresseur",
      "Disjoncteurs internes"
    ],
    "return_to_normal": [
      "Défaut interne résolu",
      "UPS repasse en mode normal"
    ]
  },
  "R07": {
    "fault_id": "F07",
    "rule_name": "Bypass isolé de courte durée",
    "category": "UPS",
    "severity": "Faible",
    "alarms": [
      "ups_on_bypass"
    ],
    "scope": "same_ups",
    "problem": "Passage en bypass isolé, sans autre alarme corrélée (surcharge, défaut, coupure).",
    "causes": [
      "Test de maintenance planifié",
      "Bascule automatique de courte durée sans anomalie identifiée"
    ],
    "impacts": [
      "Impact limité si la durée reste courte"
    ],
    "justification_text": "Le système a détecté un bypass sans aucune corrélation avec une surcharge, un défaut redresseur/disjoncteur ou une absence secteur : événement probablement isolé.",
    "actions": [
      "Vérifier la durée du bypass",
      "Confirmer qu'il s'agit bien d'une maintenance planifiée",
      "Continuer la surveillance"
    ],
    "equipment": [
      "UPS"
    ],
    "return_to_normal": [
      "Retour en mode normal sans intervention"
    ]
  },
  "R08": {
    "fault_id": "F08",
    "rule_name": "Défaut redresseur avec fonctionnement sur batterie",
    "category": "UPS",
    "severity": "Elevee",
    "alarms": [
      "rectifier_fault",
      "ups_on_battery"
    ],
    "scope": "same_ups",
    "problem": "Le redresseur est en défaut, ce qui prolonge le fonctionnement sur batterie.",
    "causes": [
      "Panne du redresseur",
      "Défaut d'alimentation en amont du redresseur"
    ],
    "impacts": [
      "Décharge prolongée et accélérée des batteries",
      "Risque d'épuisement batterie plus rapide que prévu"
    ],
    "justification_text": "Le système a détecté un défaut redresseur combiné à un fonctionnement sur batterie sur le même UPS : le redresseur ne recharge plus les batteries correctement.",
    "actions": [
      "Diagnostiquer le redresseur",
      "Vérifier l'alimentation amont",
      "Surveiller étroitement l'autonomie batterie restante",
      "Informer immédiatement la maintenance"
    ],
    "equipment": [
      "UPS",
      "Redresseur",
      "Banc de batteries"
    ],
    "return_to_normal": [
      "Redresseur réparé",
      "Fin du mode batterie"
    ]
  },
  "R09": {
    "fault_id": "F09",
    "rule_name": "Défaut redresseur isolé",
    "category": "UPS",
    "severity": "Moyenne",
    "alarms": [
      "rectifier_fault"
    ],
    "scope": "same_ups",
    "problem": "Défaut redresseur détecté sans fonctionnement sur batterie associé.",
    "causes": [
      "Anomalie ponctuelle du redresseur",
      "Défaut électronique interne"
    ],
    "impacts": [
      "Protection batterie encore effective pour l'instant",
      "Risque à surveiller si le défaut persiste"
    ],
    "justification_text": "Le système a détecté un défaut redresseur isolé, sans corrélation avec un fonctionnement sur batterie : la protection reste effective à ce stade.",
    "actions": [
      "Contrôler le redresseur",
      "Vérifier les paramètres électriques d'entrée",
      "Planifier une vérification si le défaut se répète"
    ],
    "equipment": [
      "UPS",
      "Redresseur"
    ],
    "return_to_normal": [
      "Disparition de l'alarme redresseur"
    ]
  },
  "R10": {
    "fault_id": "F10",
    "rule_name": "Défaut disjoncteur amont UPS",
    "category": "UPS",
    "severity": "Moyenne",
    "alarms": [
      "breaker_fault_input"
    ],
    "scope": "same_ups",
    "problem": "Défaut détecté sur le disjoncteur d'alimentation amont de l'UPS.",
    "causes": [
      "Déclenchement du disjoncteur d'entrée",
      "Défaut électrique en amont",
      "Surcharge côté alimentation"
    ],
    "impacts": [
      "Risque de perte d'alimentation de l'UPS si non traité"
    ],
    "justification_text": "Le système a détecté un défaut sur le disjoncteur d'entrée de l'UPS.",
    "actions": [
      "Contrôler le disjoncteur d'entrée",
      "Vérifier l'alimentation amont",
      "Réarmer si la cause est identifiée et corrigée"
    ],
    "equipment": [
      "UPS",
      "Disjoncteur d'entrée"
    ],
    "return_to_normal": [
      "Disjoncteur réarmé et stable"
    ]
  },
  "R11": {
    "fault_id": "F11",
    "rule_name": "Défaut disjoncteur aval UPS",
    "category": "UPS",
    "severity": "Elevee",
    "alarms": [
      "breaker_fault_output"
    ],
    "scope": "same_ups",
    "problem": "Défaut détecté sur le disjoncteur de sortie de l'UPS, avec impact direct possible sur les charges IT.",
    "causes": [
      "Déclenchement du disjoncteur de sortie",
      "Court-circuit ou surcharge en aval"
    ],
    "impacts": [
      "Risque de coupure directe des équipements IT alimentés",
      "Impact possible sur la redondance"
    ],
    "justification_text": "Le système a détecté un défaut sur le disjoncteur de sortie de l'UPS, avec un impact direct possible sur les charges en aval.",
    "actions": [
      "Contrôler le disjoncteur de sortie",
      "Identifier la charge concernée",
      "Vérifier l'absence de court-circuit avant réarmement",
      "Informer la maintenance en urgence"
    ],
    "equipment": [
      "UPS",
      "Disjoncteur de sortie",
      "Charges IT en aval"
    ],
    "return_to_normal": [
      "Disjoncteur de sortie réarmé et stable"
    ]
  },
  "R12": {
    "fault_id": "F12",
    "rule_name": "Surcharge UPS",
    "category": "UPS",
    "severity": "Moyenne",
    "alarms": [
      "ups_overload"
    ],
    "scope": "same_ups",
    "problem": "L'UPS signale une surcharge, avec confiance accrue si l'alarme se répète.",
    "causes": [
      "Charge IT supérieure à la capacité nominale",
      "Ajout récent d'équipements",
      "Déséquilibre entre plusieurs UPS redondants"
    ],
    "impacts": [
      "Risque de bascule en bypass",
      "Risque de dégradation de l'UPS à moyen terme"
    ],
    "justification_text": "Le système a détecté une ou plusieurs alarmes de surcharge sur le même UPS dans une fenêtre de temps récente.",
    "actions": [
      "Vérifier la charge actuelle de l'UPS",
      "Identifier les équipements récemment ajoutés",
      "Étudier un rééquilibrage de charge entre UPS redondants"
    ],
    "equipment": [
      "UPS"
    ],
    "return_to_normal": [
      "Charge revenue sous le seuil nominal"
    ]
  },
  "R13": {
    "fault_id": "F13",
    "rule_name": "Surcharge suivie d'un bypass automatique",
    "category": "UPS",
    "severity": "Elevee",
    "alarms": [
      "ups_overload",
      "ups_on_bypass"
    ],
    "scope": "same_ups",
    "problem": "Une surcharge a été suivie d'un bypass automatique quelques minutes plus tard.",
    "causes": [
      "Surcharge non résorbée ayant déclenché la protection bypass",
      "Charge crête ponctuelle mal absorbée"
    ],
    "impacts": [
      "Charge non protégée pendant le bypass",
      "Risque de récidive si la surcharge persiste"
    ],
    "justification_text": "Le système a détecté une surcharge suivie, dans une fenêtre de quelques minutes, d'un passage automatique en bypass sur le même UPS.",
    "actions": [
      "Réduire la charge sur l'UPS",
      "Identifier l'origine de la surcharge",
      "Vérifier le retour en mode normal après réduction de charge"
    ],
    "equipment": [
      "UPS"
    ],
    "return_to_normal": [
      "Charge réduite sous le seuil",
      "Sortie du mode bypass"
    ]
  },
  "R14": {
    "fault_id": "F14",
    "rule_name": "Panne franche UPS",
    "category": "UPS",
    "severity": "Elevee",
    "alarms": [
      "ups_failure"
    ],
    "scope": "same_ups",
    "problem": "L'UPS a déclaré une panne franche.",
    "causes": [
      "Défaillance matérielle majeure de l'UPS",
      "Défaut électronique interne critique"
    ],
    "impacts": [
      "Perte possible de la protection de la charge associée",
      "Risque de coupure des équipements alimentés"
    ],
    "justification_text": "Le système a détecté une alarme de panne franche déclarée directement par l'UPS.",
    "actions": [
      "Intervention immédiate d'un technicien spécialisé",
      "Basculer la charge sur un UPS redondant si disponible",
      "Isoler l'UPS en panne en toute sécurité",
      "Informer immédiatement le responsable technique"
    ],
    "equipment": [
      "UPS"
    ],
    "return_to_normal": [
      "UPS réparé et remis en service, testé"
    ]
  },
  "R15": {
    "fault_id": "F15",
    "rule_name": "Plusieurs UPS du site en mode dégradé simultanément",
    "category": "UPS",
    "severity": "Critique",
    "alarms": [
      "ups_on_battery",
      "ups_on_bypass"
    ],
    "scope": "same_site",
    "problem": "Au moins deux UPS distincts du même site sont en mode batterie ou bypass dans une fenêtre de 15 minutes.",
    "causes": [
      "Panne électrique générale du site",
      "Défaut de distribution amont commun à plusieurs UPS"
    ],
    "impacts": [
      "Risque de perte d'alimentation généralisée sur le site",
      "Perte de redondance globale"
    ],
    "justification_text": "Le système a détecté au moins deux UPS distincts du même site en mode batterie ou bypass dans une fenêtre de 15 minutes : probable cause commune.",
    "actions": [
      "Déclencher une intervention immédiate site",
      "Vérifier l'alimentation électrique générale du site",
      "Contrôler chaque UPS concerné individuellement",
      "Informer le responsable technique en urgence"
    ],
    "equipment": [
      "UPS multiples",
      "Alimentation électrique générale"
    ],
    "return_to_normal": [
      "Tous les UPS du site repassent en mode normal"
    ]
  },
  "R16": {
    "fault_id": "F16",
    "rule_name": "Coupure secteur brève sans effet",
    "category": "Énergie",
    "severity": "Faible",
    "alarms": [
      "power_absence"
    ],
    "scope": "same_site",
    "problem": "Coupure secteur détectée sans bascule UPS ni défaut groupe électrogène observés.",
    "causes": [
      "Micro-coupure de très courte durée",
      "Alarme secteur ponctuelle absorbée par le réseau amont"
    ],
    "impacts": [
      "Impact négligeable si aucune bascule n'a été nécessaire"
    ],
    "justification_text": "Le système a détecté une absence secteur sans corrélation avec un fonctionnement UPS sur batterie ni un défaut groupe électrogène.",
    "actions": [
      "Confirmer le retour du secteur",
      "Continuer la surveillance",
      "Archiver l'événement"
    ],
    "equipment": [
      "Réseau électrique secteur"
    ],
    "return_to_normal": [
      "Secteur stable, aucune bascule constatée"
    ]
  },
  "R17": {
    "fault_id": "F17",
    "rule_name": "Défaut groupe électrogène hors coupure secteur",
    "category": "Énergie",
    "severity": "Moyenne",
    "alarms": [
      "generator_fault"
    ],
    "scope": "same_site",
    "problem": "Défaut groupe électrogène détecté en dehors de tout contexte de coupure secteur.",
    "causes": [
      "Échec d'un test périodique du groupe",
      "Défaut mineur détecté lors d'un auto-test"
    ],
    "impacts": [
      "Risque en cas de coupure secteur future si le défaut n'est pas corrigé"
    ],
    "justification_text": "Le système a détecté un défaut groupe électrogène sans absence secteur associée : probable échec de test plutôt qu'un incident réel.",
    "actions": [
      "Vérifier le rapport du dernier test du groupe",
      "Contrôler l'état général du groupe électrogène",
      "Reprogrammer un test de validation"
    ],
    "equipment": [
      "Groupe électrogène"
    ],
    "return_to_normal": [
      "Test de validation réussi"
    ]
  },
  "R18": {
    "fault_id": "F18",
    "rule_name": "Température élevée salle UPS + alarme climatisation",
    "category": "Climatisation",
    "severity": "Elevee",
    "alarms": [
      "temp_high_ups_room",
      "clim_fault_general",
      "clim_pressure_high",
      "clim_pressure_low",
      "clim_hotgas",
      "clim_fire_common"
    ],
    "scope": "same_room",
    "problem": "La température de la salle UPS augmente alors qu'une alarme de climatisation est également présente dans la même salle.",
    "causes": [
      "Arrêt du climatiseur",
      "Défaut du compresseur",
      "Pression de gaz anormale",
      "Ventilation insuffisante"
    ],
    "impacts": [
      "Risque de surchauffe des UPS",
      "Vieillissement prématuré des batteries",
      "Arrêt possible des équipements"
    ],
    "justification_text": "Le système a détecté une température supérieure au seuil et une alarme climatisation dans la même salle.",
    "actions": [
      "Vérifier le climatiseur",
      "Contrôler la pression du gaz",
      "Vérifier le compresseur",
      "Vérifier les ventilateurs",
      "Continuer la surveillance"
    ],
    "equipment": [
      "Climatiseur / CRAC salle UPS",
      "UPS"
    ],
    "return_to_normal": [
      "Température revenue sous le seuil",
      "Alarme climatisation levée"
    ]
  },
  "R19": {
    "fault_id": "F19",
    "rule_name": "Température élevée salle UPS sans cause climatisation confirmée",
    "category": "Climatisation",
    "severity": "Moyenne",
    "alarms": [
      "temp_high_ups_room"
    ],
    "scope": "same_room",
    "problem": "Température élevée dans la salle UPS sans alarme climatiseur explicite corrélée.",
    "causes": [
      "Charge thermique accrue (nouveaux équipements)",
      "Défaut capteur de température",
      "Défaut climatisation non encore remonté par le SCADA"
    ],
    "impacts": [
      "Risque de dégradation progressive si la cause n'est pas identifiée"
    ],
    "justification_text": "Le système a détecté une température supérieure au seuil dans la salle UPS sans alarme climatiseur explicite corrélée.",
    "actions": [
      "Envoyer un technicien vérifier sur site",
      "Contrôler la climatisation localement",
      "Vérifier le capteur de température",
      "Continuer la surveillance rapprochée"
    ],
    "equipment": [
      "Salle UPS",
      "Capteur de température"
    ],
    "return_to_normal": [
      "Température revenue sous le seuil"
    ]
  },
  "R20": {
    "fault_id": "F20",
    "rule_name": "Température élevée salle batteries + alarme climatisation",
    "category": "Batteries",
    "severity": "Critique",
    "alarms": [
      "temp_high_battery_room",
      "clim_fault_general",
      "clim_pressure_high",
      "clim_pressure_low",
      "clim_hotgas",
      "clim_fire_common"
    ],
    "scope": "same_room",
    "problem": "Température élevée dans la salle batteries corrélée à une alarme de climatisation : risque direct sur la durée de vie des batteries.",
    "causes": [
      "Arrêt ou défaut du climatiseur dédié",
      "Défaut du compresseur",
      "Ventilation insuffisante"
    ],
    "impacts": [
      "Réduction significative de la durée de vie des batteries",
      "Risque d'emballement thermique",
      "Risque de perte d'autonomie de secours"
    ],
    "justification_text": "Le système a détecté une température supérieure au seuil et une alarme climatisation dans la salle batteries : salle particulièrement sensible.",
    "actions": [
      "Intervention prioritaire sur la climatisation de la salle batteries",
      "Vérifier la température de chaque banc de batteries",
      "Contrôler le compresseur et la pression de gaz",
      "Informer immédiatement la maintenance"
    ],
    "equipment": [
      "Climatiseur salle batteries",
      "Banc de batteries"
    ],
    "return_to_normal": [
      "Température revenue sous le seuil",
      "Climatisation rétablie"
    ]
  },
  "R21": {
    "fault_id": "F21",
    "rule_name": "Température élevée salle batteries sans cause confirmée",
    "category": "Batteries",
    "severity": "Elevee",
    "alarms": [
      "temp_high_battery_room"
    ],
    "scope": "same_room",
    "problem": "Température élevée dans la salle batteries sans alarme climatiseur explicite, salle sensible.",
    "causes": [
      "Défaut climatisation non remonté",
      "Défaut capteur",
      "Charge thermique accrue"
    ],
    "impacts": [
      "Risque sur la durée de vie des batteries même sans cause confirmée"
    ],
    "justification_text": "Le système a détecté une température supérieure au seuil dans la salle batteries, salle jugée sensible même en l'absence d'alarme climatiseur explicite.",
    "actions": [
      "Envoyer un technicien vérifier en priorité",
      "Contrôler la climatisation localement",
      "Vérifier l'état des batteries",
      "Continuer la surveillance rapprochée"
    ],
    "equipment": [
      "Salle batteries",
      "Capteur de température"
    ],
    "return_to_normal": [
      "Température revenue sous le seuil"
    ]
  },
  "R22": {
    "fault_id": "F22",
    "rule_name": "Température élevée salle réseau + alarme climatisation",
    "category": "Réseau",
    "severity": "Elevee",
    "alarms": [
      "temp_high_switch_room",
      "clim_fault_general",
      "clim_pressure_high",
      "clim_pressure_low",
      "clim_hotgas",
      "clim_fire_common"
    ],
    "scope": "same_room",
    "problem": "Température élevée dans la salle réseau corrélée à une alarme de climatisation.",
    "causes": [
      "Arrêt ou défaut du climatiseur de la salle réseau",
      "Ventilation insuffisante"
    ],
    "impacts": [
      "Risque de dégradation des équipements réseau",
      "Risque de coupure de connectivité"
    ],
    "justification_text": "Le système a détecté une température supérieure au seuil et une alarme climatisation dans la salle réseau.",
    "actions": [
      "Vérifier le climatiseur de la salle réseau",
      "Contrôler la pression du gaz et le compresseur",
      "Vérifier la ventilation des baies réseau",
      "Continuer la surveillance"
    ],
    "equipment": [
      "Climatiseur salle réseau",
      "Baies réseau"
    ],
    "return_to_normal": [
      "Température revenue sous le seuil",
      "Climatisation rétablie"
    ]
  },
  "R23": {
    "fault_id": "F23",
    "rule_name": "Température élevée salle réseau sans cause confirmée",
    "category": "Réseau",
    "severity": "Moyenne",
    "alarms": [
      "temp_high_switch_room"
    ],
    "scope": "same_room",
    "problem": "Température élevée dans la salle réseau sans alarme climatiseur explicite, possible charge élevée des baies.",
    "causes": [
      "Charge des baies réseau élevée",
      "Défaut capteur",
      "Défaut climatisation non remonté"
    ],
    "impacts": [
      "Risque de dégradation progressive des équipements réseau"
    ],
    "justification_text": "Le système a détecté une température supérieure au seuil dans la salle réseau sans alarme climatiseur explicite.",
    "actions": [
      "Vérifier la charge des baies réseau",
      "Contrôler la climatisation localement",
      "Vérifier le capteur de température",
      "Continuer la surveillance"
    ],
    "equipment": [
      "Salle réseau",
      "Baies réseau"
    ],
    "return_to_normal": [
      "Température revenue sous le seuil"
    ]
  },
  "R24": {
    "fault_id": "F24",
    "rule_name": "Perte de redondance climatisation (plusieurs unités CRAC)",
    "category": "Climatisation",
    "severity": "Critique",
    "alarms": [
      "clim_fault_general"
    ],
    "scope": "same_room",
    "problem": "Au moins deux unités de climatisation distinctes de la même salle sont en défaut dans une fenêtre de 30 minutes.",
    "causes": [
      "Panne générale du système de climatisation",
      "Coupure électrique alimentant les climatiseurs",
      "Défaut commun (alimentation, régulation)"
    ],
    "impacts": [
      "Perte de redondance de refroidissement",
      "Risque de montée rapide en température",
      "Risque sur l'ensemble des équipements de la salle"
    ],
    "justification_text": "Le système a détecté au moins deux unités CRAC distinctes de la même salle en défaut dans une fenêtre de 30 minutes : perte de redondance.",
    "actions": [
      "Déclencher une intervention immédiate",
      "Vérifier l'alimentation générale de la climatisation",
      "Contrôler chaque unité CRAC individuellement",
      "Prioriser le refroidissement d'appoint si disponible"
    ],
    "equipment": [
      "Unités CRAC multiples"
    ],
    "return_to_normal": [
      "Toutes les unités CRAC de la salle repassent en fonctionnement normal"
    ]
  },
  "R25": {
    "fault_id": "F25",
    "rule_name": "Pression haute + gaz chaud sur une unité clim",
    "category": "Climatisation",
    "severity": "Moyenne",
    "alarms": [
      "clim_pressure_high",
      "clim_hotgas"
    ],
    "scope": "same_unit",
    "problem": "Une même unité de climatisation signale une pression haute et une alarme gaz chaud.",
    "causes": [
      "Encrassement du condenseur",
      "Manque de ventilation au niveau du condenseur",
      "Surcharge en réfrigérant"
    ],
    "impacts": [
      "Baisse d'efficacité de refroidissement",
      "Risque d'arrêt de protection de l'unité"
    ],
    "justification_text": "Le système a détecté une pression haute et une alarme gaz chaud sur la même unité de climatisation.",
    "actions": [
      "Nettoyer le condenseur",
      "Vérifier la ventilation de l'unité",
      "Contrôler la charge en réfrigérant"
    ],
    "equipment": [
      "Unité CRAC concernée"
    ],
    "return_to_normal": [
      "Pression et température de gaz revenues à la normale"
    ]
  },
  "R26": {
    "fault_id": "F26",
    "rule_name": "Pression basse + alarme incendie/gaz sur une unité clim",
    "category": "Climatisation",
    "severity": "Elevee",
    "alarms": [
      "clim_pressure_low",
      "clim_fire_common"
    ],
    "scope": "same_unit",
    "problem": "Une même unité de climatisation signale une pression basse et une alarme incendie/gaz commune, suspicion de fuite de gaz réfrigérant.",
    "causes": [
      "Fuite de gaz réfrigérant",
      "Défaut du circuit frigorifique"
    ],
    "impacts": [
      "Perte de capacité de refroidissement de l'unité",
      "Risque environnemental et de sécurité (fuite de gaz)"
    ],
    "justification_text": "Le système a détecté une pression basse et une alarme incendie/gaz commune sur la même unité : suspicion de fuite de gaz réfrigérant.",
    "actions": [
      "Isoler et contrôler l'unité concernée",
      "Rechercher une fuite de gaz réfrigérant",
      "Appliquer les procédures de sécurité gaz",
      "Informer immédiatement la maintenance"
    ],
    "equipment": [
      "Unité CRAC concernée"
    ],
    "return_to_normal": [
      "Fuite réparée",
      "Pression normale rétablie"
    ]
  },
  "R27": {
    "fault_id": "F27",
    "rule_name": "Plusieurs zones du site en température haute simultanément",
    "category": "Climatisation",
    "severity": "Critique",
    "alarms": [
      "temp_high_ups_room",
      "temp_high_battery_room",
      "temp_high_switch_room",
      "temp_high_energy_room",
      "temp_high_datacenter"
    ],
    "scope": "same_site",
    "problem": "Plusieurs zones du site présentent simultanément une température élevée.",
    "causes": [
      "Défaillance générale du système de climatisation",
      "Coupure électrique alimentant les climatiseurs",
      "Perte de redondance des unités CRAC",
      "Arrêt du système HVAC"
    ],
    "impacts": [
      "Plusieurs équipements exposés à une surchauffe",
      "Risque de dégradation des serveurs",
      "Risque sur les batteries UPS",
      "Dégradation des équipements réseau"
    ],
    "justification_text": "Le système a détecté plusieurs salles du même site avec une température supérieure au seuil dans une fenêtre de 30 minutes.",
    "actions": [
      "Déclencher immédiatement une intervention",
      "Vérifier l'alimentation générale de la climatisation",
      "Contrôler les unités CRAC",
      "Vérifier le fonctionnement des ventilateurs",
      "Prioriser les salles critiques",
      "Informer le responsable technique"
    ],
    "equipment": [
      "Climatisation générale du site",
      "Toutes salles concernées"
    ],
    "return_to_normal": [
      "Température de toutes les zones revenue sous le seuil"
    ]
  },
  "R28": {
    "fault_id": "F28",
    "rule_name": "Alarme inondation isolée",
    "category": "Sécurité",
    "severity": "Elevee",
    "alarms": [
      "flood_alarm"
    ],
    "scope": "same_room",
    "problem": "Une alarme de détection d'eau/inondation est active sans corrélation avec un défaut de climatisation.",
    "causes": [
      "Fuite de canalisation",
      "Infiltration d'eau",
      "Condensation excessive"
    ],
    "impacts": [
      "Risque électrique (court-circuit)",
      "Risque de dégât matériel sur les équipements au sol"
    ],
    "justification_text": "Le système a détecté une alarme inondation sans alarme climatisation corrélée dans la même salle : origine probablement extérieure au système de climatisation.",
    "actions": [
      "Envoyer un technicien constater immédiatement",
      "Couper l'alimentation électrique locale si nécessaire",
      "Identifier et stopper la source d'eau",
      "Protéger les équipements sensibles"
    ],
    "equipment": [
      "Salle concernée",
      "Détecteur d'eau"
    ],
    "return_to_normal": [
      "Alarme inondation levée",
      "Zone asséchée et sécurisée"
    ]
  },
  "R29": {
    "fault_id": "F29",
    "rule_name": "Alarme inondation liée à la climatisation",
    "category": "Sécurité",
    "severity": "Elevee",
    "alarms": [
      "flood_alarm",
      "clim_fault_general"
    ],
    "scope": "same_room",
    "problem": "Une alarme inondation est corrélée à un défaut de climatisation dans la même salle.",
    "causes": [
      "Fuite de condensats du climatiseur",
      "Évacuation d'eau bouchée ou défectueuse"
    ],
    "impacts": [
      "Risque électrique local",
      "Risque de dégât matériel",
      "Dégradation possible du climatiseur lui-même"
    ],
    "justification_text": "Le système a détecté une alarme inondation et une alarme climatisation dans la même salle : origine probable identifiée du côté du climatiseur.",
    "actions": [
      "Vérifier le circuit d'évacuation des condensats du climatiseur",
      "Couper l'alimentation locale si nécessaire",
      "Nettoyer/déboucher l'évacuation",
      "Protéger les équipements sensibles"
    ],
    "equipment": [
      "Climatiseur / CRAC de la salle",
      "Détecteur d'eau"
    ],
    "return_to_normal": [
      "Alarme inondation levée",
      "Climatisation rétablie"
    ]
  },
  "R30": {
    "fault_id": "F30",
    "rule_name": "Scénario multi-facteurs critique (énergie + température + UPS)",
    "category": "Énergie",
    "severity": "Critique",
    "alarms": [
      "ups_on_battery",
      "temp_high_ups_room",
      "generator_fault"
    ],
    "scope": "same_site",
    "problem": "Combinaison critique : le site est sur batterie UPS, la salle UPS est en surchauffe, et le groupe électrogène est en panne.",
    "causes": [
      "Panne simultanée de l'alimentation de secours et de la climatisation",
      "Défaillance générale d'infrastructure suite à une coupure secteur prolongée"
    ],
    "impacts": [
      "Risque de coupure totale du site à très court terme",
      "Dégradation accélérée des batteries en raison de la température",
      "Perte de redondance électrique et thermique combinée"
    ],
    "justification_text": "Le système a détecté simultanément un fonctionnement UPS sur batterie, une température élevée dans la salle UPS et un défaut groupe électrogène sur le même site : scénario multi-facteurs critique.",
    "actions": [
      "Déclencher une intervention d'urgence maximale",
      "Prioriser le rétablissement du groupe électrogène",
      "Prioriser le rétablissement de la climatisation de la salle UPS",
      "Surveiller en continu l'autonomie batterie restante",
      "Alerter immédiatement le responsable technique et l'astreinte"
    ],
    "equipment": [
      "Groupe électrogène",
      "UPS",
      "Climatisation salle UPS"
    ],
    "return_to_normal": [
      "Secteur ou groupe électrogène rétabli",
      "Température normale",
      "UPS hors mode batterie"
    ]
  },
  "M01": {
    "fault_id": "F31",
    "rule_name": "Perte répétée de la liaison SCADA",
    "category": "Supervision SCADA",
    "severity": "Faible",
    "alarms": [
      "scada_link_lost"
    ],
    "scope": "same_site",
    "problem": "La liaison de supervision SCADA est perdue de manière répétée.",
    "causes": [
      "Instabilité du réseau de supervision",
      "Défaut de communication local",
      "Maintenance sur l'infrastructure réseau de supervision"
    ],
    "impacts": [
      "Perte de visibilité temporaire sur l'état réel du site",
      "Ne doit pas être interprété comme une panne physique confirmée"
    ],
    "justification_text": "Le système a détecté des pertes répétées de la liaison SCADA : à traiter comme une alerte de supervision, pas comme une panne physique confirmée.",
    "actions": [
      "Vérifier la liaison réseau de supervision",
      "Contrôler le lien de communication local",
      "Escalader vers l'équipe supervision si la coupure persiste"
    ],
    "equipment": [
      "Infrastructure de supervision SCADA"
    ],
    "return_to_normal": [
      "Liaison SCADA rétablie et stable"
    ]
  },
  "M02": {
    "fault_id": "F32",
    "rule_name": "Alarme interne du serveur de supervision",
    "category": "Supervision SCADA",
    "severity": "Info",
    "alarms": [
      "system_diagnostic"
    ],
    "scope": "na",
    "problem": "Alarme interne du serveur de supervision, sans lien direct avec le data center physique.",
    "causes": [
      "Diagnostic système interne du serveur SCADA",
      "Maintenance logicielle en cours"
    ],
    "impacts": [
      "Aucun impact direct sur les équipements physiques du data center"
    ],
    "justification_text": "Le système a détecté une alarme de diagnostic interne au serveur de supervision, sans corrélation avec les équipements physiques.",
    "actions": [
      "Vérifier les journaux du serveur de supervision",
      "Informer l'équipe supervision/IT si récurrent"
    ],
    "equipment": [
      "Serveur de supervision SCADA"
    ],
    "return_to_normal": [
      "Diagnostic interne terminé sans anomalie"
    ]
  },
  "M03": {
    "fault_id": "F33",
    "rule_name": "Échecs de connexion répétés (sécurité)",
    "category": "Sécurité",
    "severity": "Info",
    "alarms": [
      "login_failure"
    ],
    "scope": "na",
    "problem": "Des échecs de connexion répétés sont détectés sur le système de supervision.",
    "causes": [
      "Erreur de saisie d'un utilisateur légitime",
      "Tentative d'accès non autorisé"
    ],
    "impacts": [
      "Risque de sécurité si les échecs se multiplient (tentative d'intrusion potentielle)"
    ],
    "justification_text": "Le système a détecté des échecs de connexion répétés : à surveiller particulièrement sous l'angle sécurité si le phénomène est récurrent.",
    "actions": [
      "Vérifier l'origine des tentatives de connexion",
      "Contrôler les comptes utilisateurs concernés",
      "Renforcer la surveillance si le phénomène se répète",
      "Informer l'équipe sécurité si suspicion d'intrusion"
    ],
    "equipment": [
      "Système de supervision SCADA"
    ],
    "return_to_normal": [
      "Fin des échecs de connexion répétés"
    ]
  }
} satisfies Record<string, ScadaExpertRuleKnowledge>;

export const ALARM_LABELS = {
  "power_absence": "Absence Tension Réseau (coupure secteur)",
  "generator_fault": "Défaut Groupe Électrogène",
  "generator_start": "Démarrage Groupe Électrogène",
  "ups_on_battery": "UPS On Battery (fonctionnement sur batterie)",
  "ups_low_battery": "UPS Batterie Faible",
  "ups_on_bypass": "UPS On Bypass",
  "ups_overload": "UPS Overload (surcharge)",
  "ups_failure": "UPS Failure (panne franche)",
  "rectifier_fault": "Défaut Redresseur",
  "breaker_fault_generic": "Disjoncteur en Défaut (batterie)",
  "breaker_fault_input": "Disjoncteur Arrivée UPS en Défaut",
  "breaker_fault_output": "Disjoncteur Départ UPS en Défaut",
  "temp_high_ups_room": "Température Haute - Salle UPS",
  "temp_high_battery_room": "Température Haute - Salle Batterie",
  "temp_high_switch_room": "Température Haute - Salle Switch/Technique",
  "temp_high_energy_room": "Température Haute - Salle Énergie",
  "temp_high_datacenter": "Température Haute - Data Center",
  "clim_fault_general": "Alarme Climatiseur (défaut général STULZ/LIEBERT)",
  "clim_pressure_high": "Climatiseur - Pression Haute",
  "clim_pressure_low": "Climatiseur - Pression Basse",
  "clim_hotgas": "Climatiseur - Gaz Chaud",
  "clim_fire_common": "Climatiseur - Fire Common Alarme (incendie)",
  "flood_alarm": "Alarme Inondation / Fuite d'eau",
  "scada_link_lost": "Perte de Liaison SCADA",
  "system_diagnostic": "Auto-diagnostic Système (serveur supervision)",
  "login_failure": "Échec de connexion (sécurité)"
} satisfies Record<string, string>;

export const PRIMARY_CONTACT = {
  "Énergie": "Technicien Énergie / Groupe Électrogène",
  "UPS": "Technicien Onduleurs (UPS)",
  "Batteries": "Technicien Onduleurs (UPS) - spécialiste batteries",
  "Climatisation": "Technicien Climatisation (CVC)",
  "Réseau": "Technicien Réseau / Transmission",
  "Sécurité": "Équipe Sécurité / HSE",
  "Supervision SCADA": "Équipe Supervision / IT"
} satisfies Record<string, string>;
