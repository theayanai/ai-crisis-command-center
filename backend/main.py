from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from backend.config import settings
from backend.core.decision_engine import decide_action
from backend.core.incident_simulator import sample_incidents
from backend.core.routing_engine import generate_route, route_staff
from backend.services.alert_service import create_alert
from backend.services.staff_service import get_staff_data

app = FastAPI(title="AI Crisis Command Center")
BASE_DIR = Path(__file__).resolve().parent.parent
app.mount("/static", StaticFiles(directory=str(BASE_DIR / "frontend" / "static")), name="static")
INDEX_HTML = BASE_DIR / "frontend" / "templates" / "index.html"


@app.get("/")
def root():
    return FileResponse(INDEX_HTML)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/incidents/sample")
def get_sample_incidents():
    return {"incidents": sample_incidents()}


@app.get("/api/incidents")
def list_incidents():
    return {"incidents": sample_incidents()}


@app.get("/api/orchestrate/{incident_id}")
def orchestrate_incident(incident_id: int):
    catalog = settings["incident_catalog"]
    incident = catalog.get(incident_id)

    if incident is None:
        raise HTTPException(status_code=404, detail="Incident not found")

    decision = decide_action(incident["type"], settings)
    staff = get_staff_data()
    assigned_staff = route_staff(staff, incident["zone"], decision["required_teams"])
    response_route = generate_route(incident["type"], settings)

    timeline = [
        {"stage": "Incident detected", "status": "complete", "detail": incident["title"]},
        {"stage": "Staff assigned", "status": "active", "detail": f"{len(assigned_staff)} nearest available staff selected"},
        {"stage": "Response active", "status": "pending", "detail": "Unified command coordination in progress"},
    ]

    response = {
        "incident": incident,
        "alert": create_alert(f"{incident['title']} - {incident['zone']}", level=decision["priority"]),
        "decision": decision,
        "assigned_staff": assigned_staff,
        "route": {
            "name": f"{incident['type'].title()} response path",
            "steps": response_route,
        },
        "action_plan": decision["action_plan"],
        "timeline": timeline,
        "explanation": decision["explanation"],
    }

    return response


@app.get("/decide/{incident_type}")
def get_decision(incident_type: str):
    return {"incident_type": incident_type, "decision": decide_action(incident_type, settings)}
