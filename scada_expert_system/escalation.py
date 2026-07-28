"""
================================================================================
escalation.py
--------------------------------------------------------------------------------
Détermine QUI doit être appelé/informé selon la catégorie du problème et sa
gravité (priorité). C'est ce qui manquait dans le système d'origine : le
diagnostic ne doit pas seulement dire "quoi faire" mais aussi "qui prévenir".
================================================================================
"""

# Contact technique de premier niveau, par catégorie
PRIMARY_CONTACT = {
    "Énergie":           "Technicien Énergie / Groupe Électrogène",
    "UPS":               "Technicien Onduleurs (UPS)",
    "Batteries":         "Technicien Onduleurs (UPS) - spécialiste batteries",
    "Climatisation":     "Technicien Climatisation (CVC)",
    "Réseau":            "Technicien Réseau / Transmission",
    "Sécurité":          "Équipe Sécurité / HSE",
    "Supervision SCADA": "Équipe Supervision / IT",
}

# Ordre de gravité, du plus faible au plus critique
SEVERITY_ORDER = ["Info", "Faible", "Moyenne", "Elevee", "Critique"]

CRITICAL_SEVERITIES = {"Critique"}
ELEVATED_SEVERITIES = {"Critique", "Elevee"}


def is_critical(severity: str) -> bool:
    return severity in CRITICAL_SEVERITIES


def get_contacts(category: str, severity: str) -> list:
    """Retourne la liste ordonnée des personnes/équipes à contacter."""
    contacts = []
    primary = PRIMARY_CONTACT.get(category, "Technicien de maintenance")
    contacts.append(primary)

    if severity in ELEVATED_SEVERITIES:
        contacts.append("Responsable technique du site")
    if severity == "Critique":
        contacts.append("Astreinte / Cadre de garde (intervention immédiate)")
    if category == "Sécurité":
        contacts.append("Équipe Sécurité / HSE")

    # dédoublonnage en conservant l'ordre
    seen = set()
    ordered = []
    for c in contacts:
        if c not in seen:
            seen.add(c)
            ordered.append(c)
    return ordered
