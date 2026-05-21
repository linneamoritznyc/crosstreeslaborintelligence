"""
Laddar seed-data för demo i Neo4j AuraDB.
Kör: python -m services.data-pipeline.seed.load_seed

Kräver miljövariabler:
  NEO4J_URI       neo4j+s://c23d102c.databases.neo4j.io
  NEO4J_USERNAME  neo4j
  NEO4J_PASSWORD  <ditt lösenord>
"""
import os
import sys
from neo4j import GraphDatabase

URI      = os.environ["NEO4J_URI"]
USERNAME = os.environ.get("NEO4J_USERNAME", "neo4j")
PASSWORD = os.environ["NEO4J_PASSWORD"]

OCCUPATIONS = [
    {
        "id": "vindkraftstekniker",
        "name": "Vindkraftstekniker",
        "ssyk": "7233",
        "substitutability": 0.21,
        "region": "Jönköpings län",
        "demand": "hög",
        "median_salary_sek": 38500,
    },
    {
        "id": "maskinoperator",
        "name": "Maskinoperatör",
        "ssyk": "8189",
        "substitutability": 0.68,
        "region": "Jönköpings län",
        "demand": "medel",
        "median_salary_sek": 32000,
    },
    {
        "id": "industrimekanicer",
        "name": "Industrimekaniker",
        "ssyk": "7233",
        "substitutability": 0.35,
        "region": "Jönköpings län",
        "demand": "hög",
        "median_salary_sek": 40000,
    },
    {
        "id": "underskoterskа",
        "name": "Undersköterska",
        "ssyk": "5321",
        "substitutability": 0.28,
        "region": "Jönköpings län",
        "demand": "hög",
        "median_salary_sek": 30500,
    },
    {
        "id": "mjukvaruutvecklare",
        "name": "Mjukvaruutvecklare",
        "ssyk": "2512",
        "substitutability": 0.15,
        "region": "Jönköpings län",
        "demand": "hög",
        "median_salary_sek": 58000,
    },
    {
        "id": "elektriker",
        "name": "Elektriker",
        "ssyk": "7411",
        "substitutability": 0.25,
        "region": "Jönköpings län",
        "demand": "hög",
        "median_salary_sek": 42000,
    },
    {
        "id": "svetsare",
        "name": "Svetsare",
        "ssyk": "7212",
        "substitutability": 0.45,
        "region": "Jönköpings län",
        "demand": "medel",
        "median_salary_sek": 36000,
    },
    {
        "id": "sjukskoterska",
        "name": "Sjuksköterska",
        "ssyk": "2221",
        "substitutability": 0.12,
        "region": "Jönköpings län",
        "demand": "hög",
        "median_salary_sek": 41000,
    },
]

SKILLS = [
    {"id": "el-sakerhet",       "name": "Elsäkerhet",           "category": "Teknik"},
    {"id": "hydraulik",         "name": "Hydraulik",            "category": "Teknik"},
    {"id": "cnc-programmering", "name": "CNC-programmering",    "category": "Teknik"},
    {"id": "python",            "name": "Python",               "category": "IT"},
    {"id": "plc-programmering", "name": "PLC-programmering",    "category": "Teknik"},
    {"id": "patientvard",       "name": "Patientvård",          "category": "Vård"},
    {"id": "omvardnad",         "name": "Omvårdnad",            "category": "Vård"},
    {"id": "heta-arbeten",      "name": "Heta arbeten",         "category": "Teknik"},
    {"id": "liftkortet",        "name": "Liftkort",             "category": "Certifikat"},
    {"id": "vindkraft-certif",  "name": "GWO-certifikat",       "category": "Certifikat"},
    {"id": "ritningsläsning",   "name": "Ritningsläsning",      "category": "Teknik"},
    {"id": "lean",              "name": "Lean-produktion",      "category": "Metod"},
    {"id": "agile",             "name": "Agile/Scrum",          "category": "Metod"},
    {"id": "javascript",        "name": "JavaScript",           "category": "IT"},
    {"id": "sql",               "name": "SQL",                  "category": "IT"},
]

OCC_SKILL_EDGES = [
    ("vindkraftstekniker", "el-sakerhet",      "krävs"),
    ("vindkraftstekniker", "hydraulik",        "krävs"),
    ("vindkraftstekniker", "vindkraft-certif", "krävs"),
    ("vindkraftstekniker", "liftkortet",       "krävs"),
    ("vindkraftstekniker", "ritningsläsning",  "meriterande"),
    ("maskinoperator",     "cnc-programmering","meriterande"),
    ("maskinoperator",     "plc-programmering","krävs"),
    ("maskinoperator",     "lean",             "meriterande"),
    ("maskinoperator",     "ritningsläsning",  "krävs"),
    ("industrimekanicer",  "hydraulik",        "krävs"),
    ("industrimekanicer",  "heta-arbeten",     "krävs"),
    ("industrimekanicer",  "ritningsläsning",  "krävs"),
    ("underskoterskа",     "patientvard",      "krävs"),
    ("underskoterskа",     "omvardnad",        "krävs"),
    ("sjukskoterska",      "patientvard",      "krävs"),
    ("sjukskoterska",      "omvardnad",        "krävs"),
    ("mjukvaruutvecklare", "python",           "krävs"),
    ("mjukvaruutvecklare", "javascript",       "krävs"),
    ("mjukvaruutvecklare", "sql",              "meriterande"),
    ("mjukvaruutvecklare", "agile",            "meriterande"),
    ("elektriker",         "el-sakerhet",      "krävs"),
    ("elektriker",         "ritningsläsning",  "krävs"),
    ("svetsare",           "heta-arbeten",     "krävs"),
    ("svetsare",           "ritningsläsning",  "meriterande"),
]

TRANSITIONS = [
    ("maskinoperator",    "vindkraftstekniker", 0.72),
    ("maskinoperator",    "industrimekanicer",  0.85),
    ("svetsare",          "industrimekanicer",  0.78),
    ("elektriker",        "vindkraftstekniker", 0.81),
    ("underskoterskа",    "sjukskoterska",      0.65),
    ("maskinoperator",    "elektriker",         0.60),
    ("industrimekanicer", "vindkraftstekniker", 0.75),
]


def load(driver):
    with driver.session() as session:
        print("Rensar befintlig data…")
        session.run("MATCH (n) DETACH DELETE n")

        print("Laddar yrken…")
        for occ in OCCUPATIONS:
            session.run(
                """
                MERGE (o:Occupation {id: $id})
                SET o.name = $name,
                    o.ssyk = $ssyk,
                    o.substitutability_score = $substitutability,
                    o.region = $region,
                    o.demand = $demand,
                    o.median_salary_sek = $median_salary_sek
                """,
                **occ,
            )

        print("Laddar kompetenser…")
        for skill in SKILLS:
            session.run(
                """
                MERGE (s:Skill {id: $id})
                SET s.name = $name, s.category = $category
                """,
                **skill,
            )

        print("Skapar yrke→kompetens-relationer…")
        for occ_id, skill_id, rel_type in OCC_SKILL_EDGES:
            session.run(
                """
                MATCH (o:Occupation {id: $occ_id})
                MATCH (s:Skill {id: $skill_id})
                MERGE (o)-[:REQUIRES {type: $rel_type}]->(s)
                """,
                occ_id=occ_id,
                skill_id=skill_id,
                rel_type=rel_type,
            )

        print("Skapar omställningsrelationer…")
        for from_id, to_id, score in TRANSITIONS:
            session.run(
                """
                MATCH (a:Occupation {id: $from_id})
                MATCH (b:Occupation {id: $to_id})
                MERGE (a)-[:TRANSITION_TO {score: $score}]->(b)
                """,
                from_id=from_id,
                to_id=to_id,
                score=score,
            )

        result = session.run(
            "MATCH (n) RETURN labels(n)[0] AS typ, count(n) AS antal"
        )
        print("\n── Verifiering ──────────────────")
        for row in result:
            print(f"  {row['typ']:20s} {row['antal']} noder")

        rel_result = session.run("MATCH ()-[r]->() RETURN count(r) AS antal")
        print(f"  {'Relationer':20s} {rel_result.single()['antal']}")
        print("─────────────────────────────────")


def main():
    missing = [k for k in ("NEO4J_URI", "NEO4J_PASSWORD") if not os.environ.get(k)]
    if missing:
        print(f"Saknade miljövariabler: {', '.join(missing)}", file=sys.stderr)
        sys.exit(1)

    print(f"Ansluter till {URI}…")
    driver = GraphDatabase.driver(URI, auth=(USERNAME, PASSWORD))
    try:
        driver.verify_connectivity()
        print("Anslutning OK")
        load(driver)
        print("\nSeed klar!")
    finally:
        driver.close()


if __name__ == "__main__":
    main()
