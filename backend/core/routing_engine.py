def route_staff(staff_list: list[dict], incident_zone: str, required_teams: list[str]) -> list[dict]:
    available = [
        staff for staff in staff_list
        if staff.get("role") in required_teams and staff.get("status", "available") == "available"
    ]

    def dynamic_distance_score(staff: dict) -> tuple[int, str]:
        zone = staff.get("location", {}).get("zone", "")
        if zone == incident_zone:
            cost = 0
        elif "Lobby" in incident_zone and "Lobby" in str(zone):
            cost = 1
        else:
            cost = 2
        return (cost, staff.get("name", ""))

    return sorted(available, key=dynamic_distance_score)


def generate_route(incident_type: str, settings: dict, hazard_zone: str = None) -> list[str]:
    routes = settings.get("routes", {})
    base_route = routes.get(incident_type, routes.get("default", [])).copy()

    if hazard_zone:
        dynamic_route = [f"BYPASS {hazard_zone.upper()} (Hazard Detected)"]
        for step in base_route:
            if step != hazard_zone:
                dynamic_route.append(step)
        dynamic_route.append("Establish Perimeter")
        return dynamic_route

    return base_route
