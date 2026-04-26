def sample_incidents() -> list[dict]:
    return [
        {"id": 1, "type": "fight", "title": "Fight in Lobby A", "zone": "Lobby A", "severity": 0.82},
        {"id": 2, "type": "fire", "title": "Fire in Room 101", "zone": "Room 101", "severity": 0.94},
        {"id": 3, "type": "medical", "title": "Medical emergency in Dining Hall", "zone": "Dining Hall", "severity": 0.76},
    ]
