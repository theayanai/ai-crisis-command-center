def create_alert(message: str, level: str = "info") -> dict:
    return {
        "status": "queued",
        "level": level,
        "message": message,
    }
