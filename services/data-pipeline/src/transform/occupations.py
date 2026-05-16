"""Normaliserar yrkesdata från AF-taxonomin till internt format."""
from typing import Any


def transform_occupations(raw: list[dict]) -> list[dict]:
    result = []
    for item in raw:
        if not item.get("conceptId") or not item.get("preferredLabel"):
            continue
        result.append({
            "id": item["conceptId"],
            "name": item["preferredLabel"],
            "ssyk_code": item.get("ssyk", {}).get("code") if isinstance(item.get("ssyk"), dict) else None,
            "description": item.get("definition", ""),
        })
    return result
