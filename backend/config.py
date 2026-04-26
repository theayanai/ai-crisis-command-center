settings = {
    "fight_threshold": 0.7,
    "fire_threshold": 0.8,
    "medical_threshold": 0.75,
    "default_zone": "main",
    "routes": {
        "fight": ["Lobby A", "Security Desk", "Incident Zone"],
        "fire": ["Safe Exit", "West Stairwell", "Assembly Point"],
        "medical": ["Nearest Corridor", "First Aid Bay", "Ambulance Access"],
        "default": ["Operations Center", "Supervisor Review"],
    },
    "incident_catalog": {
        1: {
            "id": 1,
            "type": "fight",
            "title": "Fight in Lobby A",
            "zone": "Lobby A",
            "priority": "high",
            "severity": 0.82,
            "incoming_signals": [
                {"source": "CCTV", "type": "fight", "location": "Lobby A"},
                {"source": "Manual Alert", "type": "panic", "location": "Lobby A"},
            ],
        },
        2: {
            "id": 2,
            "type": "fire",
            "title": "Fire in Room 101",
            "zone": "Room 101",
            "priority": "critical",
            "severity": 0.94,
            "incoming_signals": [
                {"source": "Fire Sensor", "type": "fire", "location": "Room 101"},
                {"source": "CCTV", "type": "smoke", "location": "Room 101"},
            ],
        },
        3: {
            "id": 3,
            "type": "medical",
            "title": "Medical emergency in Dining Hall",
            "zone": "Dining Hall",
            "priority": "high",
            "severity": 0.76,
            "incoming_signals": [
                {"source": "Manual Alert", "type": "medical", "location": "Dining Hall"},
                {"source": "Staff Radio", "type": "medical", "location": "Dining Hall"},
            ],
        },
    },
}
