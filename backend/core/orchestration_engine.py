import json
import os
from typing import Any

try:
    from dotenv import load_dotenv
except ImportError:  # pragma: no cover
    load_dotenv = None

try:
    import google.generativeai as genai
except ImportError:  # pragma: no cover
    genai = None


DEFAULT_MODEL = "gemini-1.5-flash-latest"

if load_dotenv is not None:
    load_dotenv()


def _extract_json(text: str) -> dict[str, Any]:
    cleaned = text.strip()

    if "```" in cleaned:
        blocks = [part.strip() for part in cleaned.split("```") if part.strip()]
        json_candidates = [block.replace("json", "", 1).strip() for block in blocks]
        for candidate in json_candidates:
            try:
                parsed = json.loads(candidate)
                if isinstance(parsed, dict):
                    return parsed
            except json.JSONDecodeError:
                continue

    try:
        parsed = json.loads(cleaned)
        if isinstance(parsed, dict):
            return parsed
    except json.JSONDecodeError:
        pass

    raise ValueError("Gemini response did not contain a valid JSON object")


def _deterministic_fallback(signals: list[dict]) -> dict[str, Any]:
    types = [str(signal.get("type", "")).lower().strip() for signal in signals]

    incident = "unknown"
    priority = "medium"
    teams: list[str] = ["supervisor"]

    if "fire" in types:
        incident = "fire"
        priority = "critical"
        teams = ["fire", "evacuation"]
    elif "fight" in types or "panic" in types:
        incident = "fight"
        priority = "high"
        teams = ["security"]
    elif "medical" in types:
        incident = "medical"
        priority = "high"
        teams = ["medical"]

    return {
        "incident": incident,
        "priority": priority,
        "teams": teams,
        "reason": "Fallback mode used because Gemini is unavailable; signals were still unified into a structured response.",
        "ai_provider": "fallback",
    }


def ai_orchestrate(signals: list[dict]) -> dict[str, Any]:
    api_key = os.getenv("GEMINI_API_KEY", "").strip()

    if not api_key or genai is None:
        return _deterministic_fallback(signals)

    try:
        genai.configure(api_key=api_key)
        model_name = os.getenv("GEMINI_MODEL", DEFAULT_MODEL)
        model = genai.GenerativeModel(model_name)

        prompt = f"""
You are an AI crisis management system.

Given these fragmented inputs from multiple systems:
{json.dumps(signals, indent=2)}

Determine:
- incident type (one of: fire, fight, medical, unknown)
- priority (one of: critical, high, medium, low)
- required teams (list from: security, fire, medical, evacuation, supervisor)

Return only strict JSON in this shape:
{{
  "incident": "...",
  "priority": "...",
  "teams": ["..."],
  "reason": "one sentence"
}}
""".strip()

        response = model.generate_content(prompt)
        payload = _extract_json(response.text or "")

        incident = str(payload.get("incident", "unknown")).lower().strip()
        priority = str(payload.get("priority", "medium")).lower().strip()
        teams = payload.get("teams", ["supervisor"])

        if not isinstance(teams, list):
            teams = ["supervisor"]

        normalized_teams = [str(team).lower().strip() for team in teams if str(team).strip()]
        if not normalized_teams:
            normalized_teams = ["supervisor"]

        return {
            "incident": incident,
            "priority": priority,
            "teams": normalized_teams,
            "reason": str(payload.get("reason", "AI orchestration completed.")).strip(),
            "ai_provider": "gemini",
        }
    except Exception:
        return _deterministic_fallback(signals)


def explain_decision(incident_context: dict[str, Any]) -> str:
    api_key = os.getenv("GEMINI_API_KEY", "").strip()

    if not api_key or genai is None:
        return "Signals from multiple systems were unified into one coordinated response plan."

    try:
        genai.configure(api_key=api_key)
        model_name = os.getenv("GEMINI_MODEL", DEFAULT_MODEL)
        model = genai.GenerativeModel(model_name)

        prompt = f"""
Explain this emergency decision in simple terms for an operations dashboard:
{json.dumps(incident_context, indent=2)}

Keep it to one short sentence.
""".strip()

        response = model.generate_content(prompt)
        return (response.text or "Signals were unified into a structured response.").strip()
    except Exception:
        return "Signals from multiple systems were unified into one coordinated response plan."


def summarize_sources(signals: list[dict]) -> dict[str, Any]:
    sources = [str(signal.get("source", "Unknown")).strip() for signal in signals]
    unique_sources: list[str] = []

    for source in sources:
        if source and source not in unique_sources:
            unique_sources.append(source)

    return {
        "count": len(unique_sources),
        "sources": unique_sources,
        "label": " + ".join(unique_sources) if unique_sources else "Unknown",
    }
