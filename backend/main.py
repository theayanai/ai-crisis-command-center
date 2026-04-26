import json
import os

from fastapi import FastAPI
from pydantic import BaseModel

try:
    import google.generativeai as genai
except ImportError:
    genai = None


GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()

if GEMINI_API_KEY and genai is not None:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-2.5-flash")
else:
    model = None

app = FastAPI()


staff_list = [
    {"name": "Security 1", "role": "security", "distance": 5},
    {"name": "Security 2", "role": "security", "distance": 2},
    {"name": "Medic 1", "role": "medical", "distance": 3},
    {"name": "Fire Team 1", "role": "fire_team", "distance": 4},
]

routes = {
    "Lobby A": ["Lobby A", "Corridor", "Exit"],
    "Room 101": ["Room 101", "Hallway", "Exit"],
}


class Signal(BaseModel):
    source: str
    type: str
    location: str


class SignalInput(BaseModel):
    signals: list[Signal]


def ai_orchestrate(signals: list[dict]):
    if model is None:
        return None

    try:
        prompt = f"""
        You are an AI crisis command system.

        Inputs:
        {signals}

        Tasks:
        - Identify incident type (fire, fight, medical)
        - Assign priority (low, medium, high)
        - Decide required teams

        Return JSON:
        {{
          "incident": "...",
          "priority": "...",
          "teams": [...]
        }}
        """

        response = model.generate_content(prompt)
        text = (response.text or "").strip()

        if text.startswith("```"):
            text = text.strip("`")
            text = text.replace("json", "", 1).strip()

        return json.loads(text)
    except Exception:
        return None


def fallback_orchestrate(signals: list[dict]):
    types = [s["type"] for s in signals]

    if "heat_alert" in types:
        return {"incident": "fire", "priority": "high", "teams": ["fire_team", "security"]}

    if "fight" in types or "panic" in types:
        return {"incident": "fight", "priority": "medium", "teams": ["security"]}

    if "medical" in types:
        return {"incident": "medical", "priority": "high", "teams": ["medical"]}

    return {"incident": "unknown", "priority": "low", "teams": []}


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


@app.post("/orchestrate")
def orchestrate(input_data: SignalInput):
    signals = [s.model_dump() for s in input_data.signals]

    ai_result = ai_orchestrate(signals)
    ai_used = ai_result is not None

    result = ai_result if ai_result is not None else fallback_orchestrate(signals)

    assigned = assign_staff(result["teams"])
    route = get_route(signals[0]["location"] if signals else "")

    return {
        "incoming_signals": signals,
        "incident": result["incident"],
        "priority": result["priority"],
        "assigned_staff": assigned,
        "route": route,
        "ai_used": ai_used,
    }
