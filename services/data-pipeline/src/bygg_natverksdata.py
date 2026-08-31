"""Bygger den fullständiga nätverksdatan för /natverk direkt från AF:s taxonomi.

Kör i GitHub Actions på en runner med nätverk. Kräver varken Neo4j, Railway
eller några secrets: AF:s taxonomi-API är öppet.

    python -m src.bygg_natverksdata

Skriver apps/kompetensgrafen/public/natverk-full.json, som frontend hämtar
direkt. Skriptet använder enbart standardbiblioteket, så CI inte kan falla
på ett beroende.

Regel: inget fält fabriceras. Saknas SSYK för ett yrke sätts sektorn till
"ovrigt" och antalet loggas, i stället för att gissas.
"""
from __future__ import annotations

import json
import re
import sys
import time
import urllib.error
import urllib.request
from collections import Counter
from pathlib import Path
from typing import Any

TAXONOMY_BASE = "https://taxonomy.api.jobtechdev.se"
DATASET_PORTAL = "https://data.arbetsformedlingen.se/data/dataset"
SSYK_SLUG = "ssyk-level-4-groups-with-related-occupations"
PAGE_SIZE = 1000
UA = "crosstrees-kompetensgrafen/1.0 (+https://github.com/linneamoritznyc)"

UTDATA = (
    Path(__file__).resolve().parents[3]
    / "apps" / "kompetensgrafen" / "public" / "natverk-full.json"
)

# Samma SSYK-2-prefix per sektor som resten av kodbasen använder.
SEKTOR_PREFIX: dict[str, tuple[str, ...]] = {
    "industri": ("31", "72", "81", "82", "74"),
    "vard": ("22", "53", "32"),
    "it": ("25", "35"),
    "bygg": ("71", "75"),
    "logistik": ("43", "83", "93"),
    "service": ("14", "51", "52"),
    "utbildning": ("23",),
}

# AF rapporterar substituerbarhet som nivå 1-3. Samma mappning som pipelinen.
NIVA_TILL_SCORE = {1: 25, 2: 50, 3: 75}


def logga(handelse: str, **falt: Any) -> None:
    detaljer = " ".join(f"{k}={v}" for k, v in falt.items())
    print(f"[{handelse}] {detaljer}", flush=True)


def hamta(url: str, forsok: int = 4) -> bytes:
    sista: Exception | None = None
    for n in range(forsok):
        try:
            begaran = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(begaran, timeout=120) as svar:
                return svar.read()
        except (urllib.error.URLError, TimeoutError, OSError) as exc:
            sista = exc
            vanta = 2 ** n
            logga("http.retry", url=url[:90], forsok=n + 1, vantar=f"{vanta}s", fel=str(exc)[:90])
            if n < forsok - 1:
                time.sleep(vanta)
    assert sista is not None
    raise sista


def hamta_json(url: str) -> Any:
    return json.loads(hamta(url).decode("utf-8"))


def forst(post: dict, *nycklar: str) -> str | None:
    for nyckel in nycklar:
        varde = post.get(nyckel)
        if isinstance(varde, str) and varde:
            return varde
    return None


def hamta_koncept(typ: str) -> list[dict]:
    """Pagineras genom taxonomins koncept av en given typ."""
    alla: list[dict] = []
    offset = 0
    while True:
        url = (
            f"{TAXONOMY_BASE}/v1/taxonomy/concepts"
            f"?type={typ}&offset={offset}&limit={PAGE_SIZE}"
        )
        sida = hamta_json(url)
        if not isinstance(sida, list) or not sida:
            break
        alla.extend(sida)
        logga("taxonomi.sida", typ=typ, offset=offset, antal=len(sida), totalt=len(alla))
        if len(sida) < PAGE_SIZE:
            break
        offset += PAGE_SIZE
    return alla


def hamta_substituerbarhet() -> list[dict]:
    url = (
        f"{TAXONOMY_BASE}/v1/taxonomy/specific/relations/"
        "substitutability-relations-between-occupations"
    )
    data = hamta_json(url)
    return data if isinstance(data, list) else []


def hamta_ssyk_karta() -> dict[str, str]:
    """concept_id → fyrsiffrig SSYK-kod, via AF:s öppna dataportal."""
    try:
        sida = hamta(f"{DATASET_PORTAL}/{SSYK_SLUG}/").decode("utf-8", "replace")
    except Exception as exc:
        logga("ssyk.sida.misslyckades", fel=str(exc)[:120])
        return {}

    lankar = re.findall(r'href=["\']([^"\']+\.json(?:\?[^"\']*)?)["\']', sida, re.I)
    if not lankar:
        logga("ssyk.json_lank.saknas")
        return {}

    url = lankar[0]
    if not url.startswith("http"):
        url = f"{DATASET_PORTAL}/{SSYK_SLUG}/".rstrip("/") + "/" + url.lstrip("/")

    try:
        grupper = hamta_json(url)
    except Exception as exc:
        logga("ssyk.nedladdning.misslyckades", url=url[:90], fel=str(exc)[:120])
        return {}

    karta: dict[str, str] = {}
    for grupp in grupper if isinstance(grupper, list) else []:
        if not isinstance(grupp, dict):
            continue
        kod = forst(grupp, "ssyk_code_2012", "ssyk_code", "code")
        relaterade = grupp.get("related_occupations") or grupp.get("occupations") or []
        if not kod or not isinstance(relaterade, list):
            continue
        for yrke in relaterade:
            if isinstance(yrke, dict):
                cid = forst(yrke, "concept_id", "id")
                if cid:
                    karta[cid] = str(kod)
    logga("ssyk.karta", poster=len(karta), url=url[:90])
    return karta


def sektor_for(ssyk: str | None) -> str:
    if not ssyk:
        return "ovrigt"
    for sektor, prefix in SEKTOR_PREFIX.items():
        if any(ssyk.startswith(p) for p in prefix):
            return sektor
    return "ovrigt"


def relation_falt(rel: dict) -> tuple[str | None, str | None, int | None]:
    kalla = forst(rel, "from_occupation_id", "source_id", "from", "concept_id")
    mal = forst(rel, "to_occupation_id", "target_id", "to", "related_concept_id")
    niva_ratt = rel.get("substitutability_level", rel.get("level"))
    niva: int | None = None
    if isinstance(niva_ratt, bool):
        niva = None
    elif isinstance(niva_ratt, int):
        niva = niva_ratt
    elif isinstance(niva_ratt, float) and niva_ratt.is_integer():
        niva = int(niva_ratt)
    elif isinstance(niva_ratt, str) and niva_ratt.strip().isdigit():
        niva = int(niva_ratt.strip())
    return kalla, mal, niva


def main() -> int:
    logga("start", utdata=str(UTDATA))

    yrken_rader = hamta_koncept("occupation-name")
    logga("yrken.hamtade", antal=len(yrken_rader))
    if yrken_rader:
        logga("yrken.exempelnycklar", nycklar=",".join(sorted(yrken_rader[0].keys())[:12]))

    relationer = hamta_substituerbarhet()
    logga("substituerbarhet.hamtad", antal=len(relationer))
    if relationer:
        logga("relation.exempelnycklar", nycklar=",".join(sorted(relationer[0].keys())[:12]))

    if not yrken_rader or not relationer:
        logga("avbryter", orsak="tom hämtning från AF, skriver inte över befintlig data")
        return 1

    ssyk_karta = hamta_ssyk_karta()

    yrke_namn: dict[str, str] = {}
    yrke_def: dict[str, str] = {}
    for rad in yrken_rader:
        cid = forst(rad, "id", "concept_id")
        namn = forst(rad, "preferred_label", "preferredLabel")
        if cid and namn:
            yrke_namn[cid] = namn
            beskrivning = forst(rad, "definition", "description")
            if beskrivning:
                yrke_def[cid] = beskrivning

    # Kollapsa riktade relationer till yrkespar, behåll riktningarna.
    par: dict[tuple[str, str], dict] = {}
    hoppade = 0
    for rel in relationer:
        kalla, mal, niva = relation_falt(rel)
        if not kalla or not mal or kalla == mal or niva not in NIVA_TILL_SCORE:
            hoppade += 1
            continue
        if kalla not in yrke_namn or mal not in yrke_namn:
            hoppade += 1
            continue
        score = NIVA_TILL_SCORE[niva]
        nyckel = (kalla, mal) if kalla < mal else (mal, kalla)
        post = par.setdefault(nyckel, {"score": score, "r": []})
        post["score"] = max(post["score"], score)
        post["r"].append(
            {"f": kalla, "t": mal, "d": "can_become" if kalla == nyckel[0] else "can_replace"}
        )

    logga("par.byggda", par=len(par), hoppade=hoppade)

    # Bara yrken som faktiskt har minst en koppling — annars blir grafen
    # tusentals lösryckta punkter utan informationsvärde.
    med_kant: set[str] = set()
    for a, b in par:
        med_kant.add(a)
        med_kant.add(b)

    kort = {cid: f"n{i}" for i, cid in enumerate(sorted(med_kant))}

    noder = []
    utan_ssyk = 0
    for cid in sorted(med_kant):
        ssyk = ssyk_karta.get(cid)
        if not ssyk:
            utan_ssyk += 1
        noder.append({
            "id": kort[cid],
            "namn": yrke_namn[cid],
            "ssyk": ssyk or "",
            "sektor": sektor_for(ssyk),
            "def": yrke_def.get(cid, ""),
        })

    kanter = [
        {
            "a": kort[a],
            "b": kort[b],
            "score": v["score"],
            "r": [{"f": kort[x["f"]], "t": kort[x["t"]], "d": x["d"]} for x in v["r"]],
        }
        for (a, b), v in sorted(par.items())
    ]

    fordelning = Counter(n["sektor"] for n in noder)
    grader = Counter()
    for k in kanter:
        grader[k["a"]] += 1
        grader[k["b"]] += 1

    payload = {
        "noder": noder,
        "kanter": kanter,
        "meta": {
            "kalla": "af-taxonomi",
            "hamtad": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "yrken": len(noder),
            "yrken_i_taxonomin": len(yrke_namn),
            "kanter_riktade": sum(len(k["r"]) for k in kanter),
            "kanter_odirigerade": len(kanter),
            "yrken_utan_ssyk": utan_ssyk,
            "relationer_hoppade": hoppade,
            "medelgrad": round(sum(grader.values()) / max(len(noder), 1), 2),
            "maxgrad": max(grader.values()) if grader else 0,
        },
    }

    UTDATA.parent.mkdir(parents=True, exist_ok=True)
    UTDATA.write_text(
        json.dumps(payload, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )

    logga(
        "klart",
        noder=len(noder),
        kanter=len(kanter),
        riktade=payload["meta"]["kanter_riktade"],
        medelgrad=payload["meta"]["medelgrad"],
        maxgrad=payload["meta"]["maxgrad"],
        utan_ssyk=utan_ssyk,
        bytes=UTDATA.stat().st_size,
    )
    logga("sektorer", **{k: v for k, v in fordelning.most_common()})
    return 0


if __name__ == "__main__":
    sys.exit(main())
