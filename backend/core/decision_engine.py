def decide_action(incident_type: str, settings: dict) -> dict:
    normalized_type = incident_type.lower().strip()

    decision_matrix = {
        "fight": {
            "priority": "high",
            "required_teams": ["security"],
            "action_plan": [
                "Dispatch nearest security staff",
                "Isolate the lobby area",
                "Notify operations channel",
            ],
            "explanation": "Fragmented alerts were unified as a fight incident; security team dispatched.",
        },
        "fire": {
            "priority": "critical",
            "required_teams": ["fire", "evacuation"],
            "action_plan": [
                "Activate evacuation guidance",
                "Dispatch fire response team",
                "Open safe exit path",
            ],
            "explanation": "Fragmented alerts were unified as a fire incident; evacuation and fire response activated.",
        },
        "medical": {
            "priority": "high",
            "required_teams": ["medical"],
            "action_plan": [
                "Dispatch nearest medical responder",
                "Clear access path",
                "Prepare ambulance handoff",
            ],
            "explanation": "Fragmented alerts were unified as a medical incident; medical team dispatched.",
        },
    }

    default_decision = {
        "priority": "medium",
        "required_teams": ["supervisor"],
        "action_plan": ["Route incident to command desk for manual review"],
        "explanation": "Incident pattern does not match a predefined response; supervisor review required.",
    }

    selected = decision_matrix.get(normalized_type, default_decision)
    threshold_key = f"{normalized_type}_threshold"

    return {
        "incident_type": normalized_type,
        "priority": selected["priority"],
        "required_teams": selected["required_teams"],
        "action_plan": selected["action_plan"],
        "threshold": settings.get(threshold_key),
        "requires_human_review": normalized_type not in decision_matrix,
        "explanation": selected["explanation"],
    }
