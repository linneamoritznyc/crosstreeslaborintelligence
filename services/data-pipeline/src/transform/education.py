"""Normaliserar utbildningsdata från Jobed Connect."""


def transform_education(raw: list[dict]) -> list[dict]:
    result = []
    for item in raw:
        if not item.get("educationId") or not item.get("title"):
            continue
        result.append({
            "id": item["educationId"],
            "title": item["title"],
            "provider": item.get("provider", ""),
            "url": item.get("url", ""),
            "duration_weeks": item.get("durationWeeks"),
        })
    return result
