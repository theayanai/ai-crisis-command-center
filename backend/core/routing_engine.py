def route_staff(staff_list: list[dict], incident_zone: str, required_teams: list[str]) -> list[dict]:
    available = [
        staff
        for staff in staff_list
        if staff.get("role") in required_teams and staff.get("status", "available") == "available"
    ]

    def distance_score(staff: dict) -> tuple[int, str]:
        same_zone = staff.get("location", {}).get("zone") == incident_zone
        return (0 if same_zone else 1, staff.get("name", ""))

    return sorted(available, key=distance_score)


def generate_route(incident_type: str, settings: dict) -> list[str]:
    routes = settings.get("routes", {})
    return routes.get(incident_type, routes.get("default", []))
