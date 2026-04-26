from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from backend.config import settings
from backend.core.decision_engine import decide_action
from backend.core.incident_simulator import sample_incidents
from backend.core.orchestration_engine import ai_orchestrate, explain_decision, summarize_sources
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

    incoming_signals = incident.get("incoming_signals", [])
    ai_result = ai_orchestrate(incoming_signals)
    unified_type = ai_result["incident"]
    source_summary = summarize_sources(incoming_signals)

    decision = decide_action(
        unified_type,
        settings,
        priority_override=ai_result.get("priority"),
        teams_override=ai_result.get("teams"),
    )
    staff = get_staff_data()
    assigned_staff = route_staff(staff, incident["zone"], decision["required_teams"])
    response_route = generate_route(unified_type, settings)

    ai_explanation = explain_decision(
        {
            "signals": incoming_signals,
            "incident": unified_type,
            "priority": decision["priority"],
            "teams": decision["required_teams"],
            "location": incident["zone"],
        }
    )

    timeline = [
        {"stage": "Signals received", "status": "complete", "detail": f"{len(incoming_signals)} fragmented inputs captured"},
        {"stage": "Incident unified", "status": "complete", "detail": f"AI hub classified incident as {unified_type.upper()}"},
        {"stage": "Staff assigned", "status": "active", "detail": f"{len(assigned_staff)} nearest available staff selected"},
        {"stage": "Response active", "status": "pending", "detail": "Structured response now coordinated from one command layer"},
    ]

    response = {
        "incident": incident,
        "alert": create_alert(f"{incident['title']} - {incident['zone']}", level=decision["priority"]),
        "decision": decision,
        "incoming_signals": incoming_signals,
        "ai_orchestration": {
            "provider": ai_result.get("ai_provider", "unknown"),
            "reason": ai_result.get("reason", ""),
        },
        "signal_unification": {
            "unified_incident_type": unified_type,
            "source_count": source_summary["count"],
            "source_label": source_summary["label"],
            "before": [
                f"{signal.get('source', 'Unknown')} -> {str(signal.get('type', 'unknown')).upper()} @ {signal.get('location', incident['zone'])}"
                for signal in incoming_signals
            ],
            "after": f"AI HUB -> Incident classified: {unified_type.upper()}",
        },
        "assigned_staff": assigned_staff,
        "route": {
            "name": f"{unified_type.title()} response path",
            "steps": response_route,
        },
        "action_plan": decision["action_plan"],
        "timeline": timeline,
        "explanation": ai_explanation,
    }

    return response


@app.get("/decide/{incident_type}")
def get_decision(incident_type: str):
    return {"incident_type": incident_type, "decision": decide_action(incident_type, settings)}
