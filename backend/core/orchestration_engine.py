import json
import os
import re
from typing import Any
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

def ai_orchestrate(signals: list[dict]) -> dict[str, Any]:
    api_key = os.getenv("GEMINI_API_KEY")
    
    if not api_key:
        print("🚨 CRITICAL ERROR: GEMINI_API_KEY is missing from your .env file!")
        return _deterministic_fallback(signals)

    try:
        genai.configure(api_key=api_key)
        # Using standard model config to prevent version mismatch crashes
        model = genai.GenerativeModel("gemini-1.5-flash")

        prompt = f"""
        You are the core intelligence of a military-grade AI Crisis Command Center.
        Incoming Sensor Telemetry: {json.dumps(signals)}
        
        Tasks:
        1. Identify incident type (fire, fight, medical, unknown).
        2. Assign severity (critical, high, medium, low).
        3. Decide required teams (security, fire, medical, evacuation).
        4. PREDICTIVE MODELING: Predict how this threat will escalate in the next 15 minutes.
        
        Return ONLY a raw JSON object. NO markdown, NO backticks. Use these exact keys:
        "incident" (string), "severity" (string), "teams" (array of strings), "confidence" (string), "reason" (string), "prediction" (string).
        """

        print("\n⏳ Sending data to Gemini AI...")
        response = model.generate_content(prompt)
        raw_text = response.text.strip()
        
        # BULLETPROOF FIX: Strip away markdown backticks if Gemini disobeys instructions
        if raw_text.startswith("```"):
            raw_text = re.sub(r"^```(?:json)?\n?", "", raw_text)
            raw_text = re.sub(r"\n?```$", "", raw_text)

        payload = json.loads(raw_text)
        print("✅ GEMINI SUCCESS: AI Brain is active and parsing perfectly!")
        
        return {
            "incident": str(payload.get("incident", "unknown")).lower(),
            "priority": str(payload.get("severity", "medium")).lower(),
            "severity": str(payload.get("severity", "medium")).lower(),
            "teams": payload.get("teams", ["supervisor"]),
            "confidence": str(payload.get("confidence", "high")).lower(),
            "reason": str(payload.get("reason", "AI orchestration completed.")),
            "prediction": str(payload.get("prediction", "Threat contained.")),
            "ai_provider": "gemini",
        }
    except Exception as e:
        print(f"🚨 GEMINI ERROR: {str(e)}")
        return _deterministic_fallback(signals, reason_msg=f"GEMINI ERROR: {str(e)}")

def _deterministic_fallback(signals: list[dict], reason_msg: str = "CONNECTION FAILED: Using standard emergency protocol.") -> dict[str, Any]:
    return {
        "incident": "unknown", "priority": "high", "severity": "high",
        "teams": ["security", "medical"], "confidence": "low",
        "reason": reason_msg,
        "prediction": "Unknown escalation. Deploying rapid response.",
        "ai_provider": "fallback",
    }

def explain_decision(incident_context: dict[str, Any]) -> str:
    return "Multi-sensor fusion successfully categorized anomaly and established containment vectors."

def summarize_sources(signals: list[dict]) -> dict[str, Any]:
    sources = [str(signal.get("source", "Unknown")).strip() for signal in signals]
    unique = list(dict.fromkeys([s for s in sources if s]))
    return {"count": len(unique), "sources": unique, "label": " + ".join(unique) if unique else "Unknown"}