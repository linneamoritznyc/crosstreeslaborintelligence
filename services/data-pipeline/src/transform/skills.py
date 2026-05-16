"""Normaliserar kompetensdata från AF-taxonomin."""


def transform_skills(raw: list[dict]) -> list[dict]:
    result = []
    for item in raw:
        if not item.get("conceptId") or not item.get("preferredLabel"):
            continue
        result.append({
            "id": item["conceptId"],
            "name": item["preferredLabel"],
            "type": item.get("type", "skill"),
        })
    return result
