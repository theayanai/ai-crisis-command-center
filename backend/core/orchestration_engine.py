def orchestrate(signals: list[dict]) -> str:
    types = [str(signal.get("type", "")).lower().strip() for signal in signals]

    if "fire" in types:
        return "fire"
    if "fight" in types or "panic" in types:
        return "fight"
    if "medical" in types:
        return "medical"
    return "unknown"


def summarize_sources(signals: list[dict]) -> dict:
    sources = [str(signal.get("source", "Unknown")).strip() for signal in signals]
    unique_sources = []

    for source in sources:
        if source and source not in unique_sources:
            unique_sources.append(source)

    return {
        "count": len(unique_sources),
        "sources": unique_sources,
        "label": " + ".join(unique_sources) if unique_sources else "Unknown",
    }