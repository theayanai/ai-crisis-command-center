import json
import os
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from dotenv import load_dotenv

from backend.config import settings
from backend.core.incident_simulator import sample_incidents

try:
    import google.generativeai as genai
except ImportError:
    genai = None


load_dotenv()


GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()

if GEMINI_API_KEY and genai is not None:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-2.5-flash")
else:
    model = None

app = FastAPI()

# Hardened path calculation for production deployment
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_PATH = os.path.join(BASE_DIR, "frontend")
INDEX_HTML_PATH = os.path.join(FRONTEND_PATH, "index.html")

# Mount static files from frontend directory
app.mount(
    "/static",
    StaticFiles(directory=FRONTEND_PATH),
    name="static"
)


staff_list = [
    {"name": "Security 1", "role": "security", "distance": 5},
    {"name": "Security 2", "role": "security", "distance": 2},
    {"name": "Medic 1", "role": "medical", "distance": 3},
    {"name": "Fire Team 1", "role": "fire_team", "distance": 4},
]

routes = {
    "Lobby A": ["Lobby A", "Corridor", "Exit"],
    "Room 101": ["Room 101", "Hallway", "Exit"],
    "Dining Hall": ["Dining Hall", "Main Corridor", "First Aid Bay", "Ambulance Access"],
}

team_by_incident_type = {
    "fire": ["fire_team", "security"],
    "medical": ["medical"],
    "fight": ["security"],
    "fragmented-signals": ["security", "fire_team"],
    "composite": ["security", "fire_team"],
}

TEAM_ALIASES = {
    "security": "security",
    "security_team": "security",
    "security staff": "security",
    "law_enforcement": "security",
    "police": "security",
    "medical": "medical",
    "medical_team": "medical",
    "medic": "medical",
    "paramedic": "medical",
    "ems": "medical",
    "fire_team": "fire_team",
    "fire": "fire_team",
    "fire_response": "fire_team",
    "fire brigade": "fire_team",
}


class Signal(BaseModel):
    source: str
    type: str
    location: str


class SignalInput(BaseModel):
    signals: list[Signal]


class ActionRequest(BaseModel):
    action: str


def ai_orchestrate(signals: list[dict]):
    if model is None:
        return None

    try:
        prompt = f"""
        You are an AI crisis command system.

        Inputs:
        {signals}

        Tasks:
                1. Identify incident (fire, fight, medical)
                2. Assign severity (1 to 10)
                3. Determine impact (individual or multi-person)
                4. Decide response teams

        Return JSON:
        {{
          "incident": "...",
                    "severity": 1,
                    "impact": "...",
                    "teams": [...],
                    "reason": "..."
        }}
        """

        response = model.generate_content(
            prompt,
            request_options={"timeout": 8},
        )
        text = (response.text or "").strip()

        if text.startswith("```"):
            text = text.strip("`")
            text = text.replace("json", "", 1).strip()

        return json.loads(text)
    except Exception:
        return None


def fallback_orchestrate(signals: list[dict]):
    types = [s["type"] for s in signals]

    if "heat_alert" in types or "fire" in types or "smoke" in types:
        return {
            "incident": "fire",
            "severity": 9,
            "impact": "multi-person",
            "teams": ["fire_team", "security"],
            "reason": "Fire detection signals suggest immediate fire escalation risk.",
        }

    if "fight" in types or "panic" in types:
        return {
            "incident": "fight",
            "severity": 7,
            "impact": "multi-person",
            "teams": ["security"],
            "reason": "Fight and panic signals indicate active confrontation affecting multiple people.",
        }

    if "medical" in types:
        return {
            "incident": "medical",
            "severity": 8,
            "impact": "individual",
            "teams": ["medical"],
            "reason": "Medical distress signals indicate urgent care is needed for at least one person.",
        }

    return {
        "incident": "unknown",
        "severity": 4,
        "impact": "individual",
        "teams": [],
        "reason": "Signals are inconclusive and require manual supervisor review.",
    }


def assign_staff(teams: list[str]):
    assigned = []

    for team in teams:
        candidates = [s for s in staff_list if s["role"] == team]
        if candidates:
            nearest = sorted(candidates, key=lambda x: x["distance"])[0]
            assigned.append(nearest["name"])

    return assigned


def get_route(location: str):
    return routes.get(location, ["Unknown route"])


def severity_to_priority(severity: int) -> str:
    if severity >= 9:
        return "critical"
    if severity >= 7:
        return "high"
    if severity >= 5:
        return "medium"
    return "low"


def normalize_result(raw_result: dict | None, fallback_result: dict) -> dict:
    result = raw_result if isinstance(raw_result, dict) else fallback_result

    incident = str(result.get("incident", fallback_result.get("incident", "unknown"))).lower()

    try:
        severity = int(result.get("severity", fallback_result.get("severity", 5)))
    except (TypeError, ValueError):
        severity = int(fallback_result.get("severity", 5))

    severity = max(1, min(10, severity))

    impact = str(result.get("impact", fallback_result.get("impact", "individual"))).lower()
    if impact not in {"individual", "multi-person"}:
        impact = "multi-person" if severity >= 7 else "individual"

    teams = result.get("teams")
    if not isinstance(teams, list):
        teams = fallback_result.get("teams", [])

    normalized_teams = []
    for team in teams:
        label = str(team).strip().lower()
        if not label:
            continue
        canonical = TEAM_ALIASES.get(label)
        if canonical is None:
            compact = label.replace(" ", "_")
            canonical = TEAM_ALIASES.get(compact, label)
        if canonical not in normalized_teams:
            normalized_teams.append(canonical)

    if not normalized_teams:
        normalized_teams = fallback_result.get("teams", [])

    reason = str(result.get("reason", fallback_result.get("reason", "AI classified the incident using available signals."))).strip()
    if not reason:
        reason = fallback_result.get("reason", "AI classified the incident using available signals.")

    return {
        "incident": incident,
        "severity": severity,
        "impact": impact,
        "teams": normalized_teams,
        "reason": reason,
    }


def generate_briefing(result: dict, location: str):
    return f"""
Emergency Briefing

Incident: {result['incident'].upper()}
Location: {location}

Severity: {result['severity']}/10
Impact: {result['impact']}

AI Reasoning:
{result['reason']}

Teams: {', '.join(result['teams']) if result['teams'] else 'None assigned'}

Immediate action required.
""".strip()


def build_response_for_incident(incident: dict):
    incoming_signals = incident.get("incoming_signals", [])
    signal_types = [entry.get("type", "unknown") for entry in incoming_signals]

    ai_result = ai_orchestrate(incoming_signals)
    fallback_result = fallback_orchestrate(incoming_signals)
    result = normalize_result(ai_result, fallback_result)
    ai_used = ai_result is not None

    teams = result.get("teams") or team_by_incident_type.get(incident.get("type"), ["security"])
    severity = result["severity"]
    broadcast = severity >= 9

    assigned_staff = []
    for team in teams:
        candidates = [s for s in staff_list if s["role"] == team]
        if candidates:
            nearest = sorted(candidates, key=lambda x: x["distance"])[0]
            assigned_staff.append(
                {
                    "name": nearest["name"],
                    "role": nearest["role"],
                    "location": {"zone": incident.get("zone", "Unknown")},
                }
            )

    unified_incident_type = result.get("incident", incident.get("type", "unknown"))
    source_names = [entry.get("source", "unknown") for entry in incoming_signals]

    return {
        "incident": {
            "id": incident.get("id"),
            "title": incident.get("title", "Unknown incident"),
            "zone": incident.get("zone", "Unknown"),
        },
        "incoming_signals": incoming_signals,
        "signal_unification": {
            "unified_incident_type": unified_incident_type,
            "source_count": len(incoming_signals),
            "source_label": ", ".join(source_names) if source_names else "No sources",
            "before": [
                f"{entry.get('source', 'Unknown')}: {entry.get('type', 'unknown')} @ {entry.get('location', 'Unknown')}"
                for entry in incoming_signals
            ],
            "after": f"AI unified {len(incoming_signals)} inputs into {unified_incident_type.upper()} priority orchestration.",
        },
        "decision": {
            "priority": severity_to_priority(severity),
            "severity": severity,
            "impact": result["impact"],
            "broadcast": broadcast,
        },
        "severity": severity,
        "impact": result["impact"],
        "broadcast": broadcast,
        "briefing": generate_briefing(result, incident.get("zone", "Unknown")),
        "assigned_staff": assigned_staff,
        "route": {
            "name": f"Primary route to {incident.get('zone', 'Unknown')}",
            "steps": get_route(incident.get("zone", "")),
        },
        "timeline": [
            {
                "stage": "Signal Ingestion",
                "detail": f"Collected {len(incoming_signals)} fragmented inputs ({', '.join(signal_types) if signal_types else 'none'}).",
                "status": "done",
            },
            {
                "stage": "AI Fusion",
                "detail": f"Gemini {'classified and prioritized' if ai_used else 'unavailable, fallback model classified'} the incident.",
                "status": "active",
            },
            {
                "stage": "Response Assignment",
                "detail": f"Assigned {len(assigned_staff)} responders and generated route.",
                "status": "pending",
            },
            {
                "stage": "Broadcast",
                "detail": "Mass broadcast activated." if broadcast else "Mass broadcast not required.",
                "status": "done" if broadcast else "pending",
            },
        ],
        "ai_orchestration": {
            "provider": "gemini" if ai_used else "fallback",
            "reason": result["reason"],
        },
        "action_plan": [
            "Lock down immediate perimeter in affected zone.",
            "Dispatch nearest qualified team and monitor escalation risk.",
            "Broadcast guidance to staff and maintain evacuation channel.",
        ],
    }


@app.get("/")
def index():
    """Serve the frontend index.html with hardened path handling and debug info."""
    if not os.path.exists(INDEX_HTML_PATH):
        return {
            "error": "Frontend not found",
            "checked_path": INDEX_HTML_PATH,
            "cwd": os.getcwd(),
            "base_dir": BASE_DIR,
            "frontend_path": FRONTEND_PATH,
        }
    return FileResponse(INDEX_HTML_PATH)


@app.get("/api/incidents")
def get_incidents():
    return {"incidents": sample_incidents()}


@app.get("/api/orchestrate/{incident_id}")
def orchestrate_incident(incident_id: int):
    incident = settings.get("incident_catalog", {}).get(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return build_response_for_incident(incident)


@app.post("/orchestrate")
def orchestrate(input_data: SignalInput):
    signals = [s.model_dump() for s in input_data.signals]

    ai_result = ai_orchestrate(signals)
    ai_used = ai_result is not None

    fallback_result = fallback_orchestrate(signals)
    result = normalize_result(ai_result, fallback_result)
    severity = result["severity"]
    broadcast = severity >= 9

    assigned = assign_staff(result["teams"])
    location = signals[0]["location"] if signals else "Unknown"
    route = get_route(location)

    return {
        "incoming_signals": signals,
        "incident": result["incident"],
        "severity": severity,
        "impact": result["impact"],
        "assigned_staff": assigned,
        "route": route,
        "briefing": generate_briefing(result, location),
        "broadcast": broadcast,
        "reason": result["reason"],
        "ai_used": ai_used,
    }


@app.post("/execute-action")
def execute_action(payload: ActionRequest):
    action = payload.action.strip()
    return {
        "status": "executed",
        "action": action,
        "message": f"{action} -> Executed",
    }
