def decide_action(incident_type: str, settings: dict, priority_override: str | None = None, teams_override: list[str] | None = None) -> dict:
    normalized_type = incident_type.lower().strip()

    decision_matrix = {
        "fight": {
            "priority": "high",
            "required_teams": ["security"],
            "action_plan": [
                "Deploy nearest tactical security personnel",
                "Initiate biometric tracking on adjacent CCTV feeds",
                "Lock down perimeter zones to prevent escalation",
            ],
            "explanation": "Multi-sensor fusion detected physical altercation; tactical response initiated.",
        },
        "fire": {
            "priority": "critical",
            "required_teams": ["fire", "evacuation"],
            "action_plan": [
                "Engage automated HVAC smoke-containment protocol",
                "Deploy dynamic safe-routing to guest mobile devices",
                "Dispatch rapid-response fire units to origin point",
            ],
            "explanation": "Thermal and visual anomalies unified as active fire; lockdown engaged.",
        },
        "medical": {
            "priority": "high",
            "required_teams": ["medical"],
            "action_plan": [
                "Dispatch nearest certified trauma responder",
                "Clear service elevator access for EMT arrival",
                "Prepare automated external defibrillator (AED) drop",
            ],
            "explanation": "Biometric/Manual alerts triggered medical emergency protocols.",
        },
    }

    default_decision = {
        "priority": "medium",
        "required_teams": ["supervisor"],
        "action_plan": ["Route anomaly data to command desk for manual review"],
        "explanation": "Incident pattern requires human-in-the-loop verification.",
    }

    selected = decision_matrix.get(normalized_type, default_decision)

    return {
        "incident_type": normalized_type,
        "priority": priority_override or selected["priority"],
        "required_teams": teams_override or selected["required_teams"],
        "action_plan": selected["action_plan"],
        "threshold": settings.get(f"{normalized_type}_threshold"),
        "requires_human_review": normalized_type not in decision_matrix,
        "explanation": selected["explanation"],
    }
