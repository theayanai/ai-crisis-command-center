def get_staff_data() -> list[dict]:
    return [
        {"name": "Alex", "role": "security", "status": "available", "location": {"zone": "Lobby A"}},
        {"name": "Jordan", "role": "medical", "status": "available", "location": {"zone": "Dining Hall"}},
        {"name": "Taylor", "role": "fire", "status": "available", "location": {"zone": "Room 101"}},
        {"name": "Morgan", "role": "security", "status": "busy", "location": {"zone": "Front Desk"}},
    ]


def find_nearest_staff(zone: str, staff_list: list[dict]) -> list[dict]:
    return [staff for staff in staff_list if staff.get("location", {}).get("zone") == zone and staff.get("status") == "available"]
