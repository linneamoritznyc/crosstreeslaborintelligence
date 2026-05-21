"""Kör detta direkt: python seed_neo4j.py
Kräver bara Python 3.8+ — inga extra paket.
"""
import json
import urllib.request
import urllib.error
import base64
import sys

URI      = "https://c23d102c.databases.neo4j.io"
USER     = "neo4j"
PASSWORD = "R2LxqkCUhMldMscblRYnOwXW6wbVKP1kVRpYl73GJnY"

OCCUPATIONS = [
  {"id":"35a28d4b-5a50-4ab9-9ac8-6a5f5c43d5b6","name":"Mjukvaruutvecklare","ssyk_code":"2512","definition":"Analyserar, konstruerar, testar och underhåller programvara och system.","workplace_model":"hybrid"},
  {"id":"7a24c02f-b1d0-4e5a-bfc3-ef209f3a1d88","name":"Systemarkitekt","ssyk_code":"2511","definition":"Planerar och utformar IT-system och teknisk infrastruktur.","workplace_model":"hybrid"},
  {"id":"c3e67890-d4f7-11ee-a506-0242ac120002","name":"Dataingenjör","ssyk_code":"2529","definition":"Bygger och underhåller datapipelines och infrastruktur för dataanalys.","workplace_model":"hybrid"},
  {"id":"e1f23456-d4f7-11ee-a506-0242ac120002","name":"IT-tekniker","ssyk_code":"3512","definition":"Installerar, konfigurerar och felsöker datorer, nätverk och programvara.","workplace_model":"on_site"},
  {"id":"c3e89102-d4f7-11ee-a506-0242ac120002","name":"Undersköterska","ssyk_code":"5321","definition":"Ger vård och omsorg till patienter och brukare inom hälso- och sjukvård.","workplace_model":"on_site"},
  {"id":"f5b12347-d4f7-11ee-a506-0242ac120002","name":"Sjuksköterska","ssyk_code":"2221","definition":"Planerar och utför omvårdnad samt administrerar medicinsk behandling.","workplace_model":"on_site"},
  {"id":"a8b91234-d4f7-11ee-a506-0242ac120002","name":"Personlig assistent","ssyk_code":"5341","definition":"Ger stöd och assistans till personer med funktionsnedsättning i vardagen.","workplace_model":"on_site"},
  {"id":"a1c45678-d4f7-11ee-a506-0242ac120002","name":"Lärare i grundskolan","ssyk_code":"2341","definition":"Planerar och genomför undervisning för elever i grundskolan.","workplace_model":"on_site"},
  {"id":"b3d57891-d4f7-11ee-a506-0242ac120002","name":"Förskollärare","ssyk_code":"2342","definition":"Planerar och genomför pedagogisk verksamhet för barn i förskoleåldern.","workplace_model":"on_site"},
  {"id":"b2d56789-d4f7-11ee-a506-0242ac120002","name":"Automationstekniker","ssyk_code":"3115","definition":"Installerar, programmerar och underhåller industrirobotar och automationssystem.","workplace_model":"on_site"},
  {"id":"c5e78901-d4f7-11ee-a506-0242ac120002","name":"Maskinoperatör","ssyk_code":"8121","definition":"Hanterar och övervakar industriella maskiner i tillverkningsprocesser.","workplace_model":"on_site"},
  {"id":"d6f89012-d4f7-11ee-a506-0242ac120002","name":"Svetsare","ssyk_code":"7212","definition":"Sammanfogar metaller med svetsning enligt ritningar och toleranser.","workplace_model":"on_site"},
  {"id":"e7a90123-d4f7-11ee-a506-0242ac120002","name":"Vindkrafttekniker","ssyk_code":"7412","definition":"Installerar och underhåller vindkraftverk samt tillhörande elsystem.","workplace_model":"on_site"},
  {"id":"f8b01234-d4f7-11ee-a506-0242ac120002","name":"Elektriker","ssyk_code":"7411","definition":"Installerar, underhåller och reparerar elinstallationer i byggnader och anläggningar.","workplace_model":"on_site"},
  {"id":"d4f78901-d4f7-11ee-a506-0242ac120002","name":"Logistikkoordinator","ssyk_code":"4321","definition":"Koordinerar transport, lager och leveranskedjor.","workplace_model":"on_site"},
  {"id":"a9c12345-d4f7-11ee-a506-0242ac120002","name":"Lagerarbetare","ssyk_code":"9333","definition":"Packar, plockar, lastar och lossar varor i lager och distributionscentraler.","workplace_model":"on_site"},
  {"id":"b0d23456-d4f7-11ee-a506-0242ac120002","name":"Truckförare","ssyk_code":"8344","definition":"Kör truck för att transportera, lasta och lossa material och varor.","workplace_model":"on_site"},
  {"id":"c1e34567-d4f7-11ee-a506-0242ac120002","name":"Lastbilsförare","ssyk_code":"8332","definition":"Transporterar gods med lastbil mellan kunder, lager och terminaler.","workplace_model":"on_site"},
  {"id":"d2f45678-d4f7-11ee-a506-0242ac120002","name":"Butikschef","ssyk_code":"1422","definition":"Leder driften av butik inklusive personal, försäljning och ekonomi.","workplace_model":"on_site"},
  {"id":"e3a56789-d4f7-11ee-a506-0242ac120002","name":"Restaurangchef","ssyk_code":"1411","definition":"Leder driften av restaurang inklusive personal, kök och serviceflöden.","workplace_model":"on_site"},
  {"id":"f4b67890-d4f7-11ee-a506-0242ac120002","name":"Kock","ssyk_code":"5120","definition":"Tillagar mat enligt recept och meny i restaurang- eller storkök.","workplace_model":"on_site"},
  {"id":"a5c78901-d4f7-11ee-a506-0242ac120002","name":"Snickare","ssyk_code":"7115","definition":"Bygger, monterar och renoverar trästommar, inredning och byggnadsdetaljer.","workplace_model":"on_site"},
]

SKILLS = [
  {"id":"sk-python","name":"Python"},{"id":"sk-sql","name":"SQL"},{"id":"sk-java","name":"Java"},
  {"id":"sk-javascript","name":"JavaScript"},{"id":"sk-react","name":"React"},
  {"id":"sk-kubernetes","name":"Kubernetes"},{"id":"sk-cloud","name":"Molntjänster"},
  {"id":"sk-linux","name":"Linux"},{"id":"sk-git","name":"Versionshantering med Git"},
  {"id":"sk-rest-api","name":"REST API"},{"id":"sk-agile","name":"Agil systemutveckling"},
  {"id":"sk-dataanalys","name":"Dataanalys"},{"id":"sk-patientvard","name":"Patientvård"},
  {"id":"sk-journaling","name":"Journalföring"},{"id":"sk-lakemedel","name":"Läkemedelshantering"},
  {"id":"sk-hlr","name":"Hjärt- och lungräddning"},{"id":"sk-hygien","name":"Vårdhygien"},
  {"id":"sk-vardplan","name":"Vårdplanering"},{"id":"sk-demens","name":"Demensvård"},
  {"id":"sk-palliativ","name":"Palliativ vård"},{"id":"sk-svetsning","name":"Svetsning"},
  {"id":"sk-cnc","name":"CNC-programmering"},{"id":"sk-plc","name":"PLC-programmering"},
  {"id":"sk-cad","name":"CAD"},{"id":"sk-kvalitet","name":"Kvalitetskontroll"},
  {"id":"sk-lean","name":"Lean produktion"},{"id":"sk-hydraulik","name":"Hydraulik"},
  {"id":"sk-ritning","name":"Ritningsläsning"},{"id":"sk-elinstall","name":"Elinstallation"},
  {"id":"sk-elsakerhet","name":"Elsäkerhet"},{"id":"sk-truckkort","name":"Truckkort"},
  {"id":"sk-lager","name":"Lagerhantering"},{"id":"sk-yrkesbevis-ce","name":"Körkort CE"},
  {"id":"sk-adr","name":"ADR-intyg"},{"id":"sk-kassa","name":"Kassahantering"},
  {"id":"sk-kundservice","name":"Kundservice"},{"id":"sk-forsaljning","name":"Försäljning"},
  {"id":"sk-varuhantering","name":"Varuhantering"},{"id":"sk-livsmedel","name":"Livsmedelshantering"},
  {"id":"sk-mathantverk","name":"Mathantverk"},{"id":"sk-pedagogik","name":"Pedagogik"},
  {"id":"sk-laroplan","name":"Läroplansförståelse"},{"id":"sk-barnpsyk","name":"Barns utveckling"},
  {"id":"sk-specialpedagogik","name":"Specialpedagogik"},{"id":"sk-snickeri","name":"Snickeri"},
  {"id":"sk-ledarskap","name":"Ledarskap"},{"id":"sk-projektledning","name":"Projektledning"},
  {"id":"sk-kommunikation","name":"Kommunikation"},{"id":"sk-problemlosning","name":"Problemlösning"},
  {"id":"sk-svenska","name":"Svenska i tal och skrift"},{"id":"sk-engelska","name":"Engelska i tal och skrift"},
]

EDGES = [
  {"s":"35a28d4b-5a50-4ab9-9ac8-6a5f5c43d5b6","t":"7a24c02f-b1d0-4e5a-bfc3-ef209f3a1d88","score":75},
  {"s":"7a24c02f-b1d0-4e5a-bfc3-ef209f3a1d88","t":"35a28d4b-5a50-4ab9-9ac8-6a5f5c43d5b6","score":75},
  {"s":"35a28d4b-5a50-4ab9-9ac8-6a5f5c43d5b6","t":"c3e67890-d4f7-11ee-a506-0242ac120002","score":75},
  {"s":"c3e67890-d4f7-11ee-a506-0242ac120002","t":"35a28d4b-5a50-4ab9-9ac8-6a5f5c43d5b6","score":75},
  {"s":"c3e89102-d4f7-11ee-a506-0242ac120002","t":"f5b12347-d4f7-11ee-a506-0242ac120002","score":50},
  {"s":"f5b12347-d4f7-11ee-a506-0242ac120002","t":"c3e89102-d4f7-11ee-a506-0242ac120002","score":50},
  {"s":"c3e89102-d4f7-11ee-a506-0242ac120002","t":"a8b91234-d4f7-11ee-a506-0242ac120002","score":75},
  {"s":"a8b91234-d4f7-11ee-a506-0242ac120002","t":"c3e89102-d4f7-11ee-a506-0242ac120002","score":75},
  {"s":"b2d56789-d4f7-11ee-a506-0242ac120002","t":"c5e78901-d4f7-11ee-a506-0242ac120002","score":50},
  {"s":"c5e78901-d4f7-11ee-a506-0242ac120002","t":"b2d56789-d4f7-11ee-a506-0242ac120002","score":50},
  {"s":"b2d56789-d4f7-11ee-a506-0242ac120002","t":"e7a90123-d4f7-11ee-a506-0242ac120002","score":50},
  {"s":"e7a90123-d4f7-11ee-a506-0242ac120002","t":"b2d56789-d4f7-11ee-a506-0242ac120002","score":50},
  {"s":"e7a90123-d4f7-11ee-a506-0242ac120002","t":"f8b01234-d4f7-11ee-a506-0242ac120002","score":75},
  {"s":"f8b01234-d4f7-11ee-a506-0242ac120002","t":"e7a90123-d4f7-11ee-a506-0242ac120002","score":75},
  {"s":"a9c12345-d4f7-11ee-a506-0242ac120002","t":"b0d23456-d4f7-11ee-a506-0242ac120002","score":75},
  {"s":"b0d23456-d4f7-11ee-a506-0242ac120002","t":"a9c12345-d4f7-11ee-a506-0242ac120002","score":75},
  {"s":"b0d23456-d4f7-11ee-a506-0242ac120002","t":"c1e34567-d4f7-11ee-a506-0242ac120002","score":50},
  {"s":"c1e34567-d4f7-11ee-a506-0242ac120002","t":"b0d23456-d4f7-11ee-a506-0242ac120002","score":50},
  {"s":"d2f45678-d4f7-11ee-a506-0242ac120002","t":"e3a56789-d4f7-11ee-a506-0242ac120002","score":50},
  {"s":"e3a56789-d4f7-11ee-a506-0242ac120002","t":"d2f45678-d4f7-11ee-a506-0242ac120002","score":50},
  {"s":"f4b67890-d4f7-11ee-a506-0242ac120002","t":"e3a56789-d4f7-11ee-a506-0242ac120002","score":50},
  {"s":"e3a56789-d4f7-11ee-a506-0242ac120002","t":"f4b67890-d4f7-11ee-a506-0242ac120002","score":50},
]

def cypher(query: str, params: dict = None):
    token = base64.b64encode(f"{USER}:{PASSWORD}".encode()).decode()
    body = json.dumps({"statements": [{"statement": query, "parameters": params or {}}]}).encode()
    req = urllib.request.Request(
        f"{URI}/db/neo4j/tx/commit",
        data=body,
        headers={"Authorization": f"Basic {token}", "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        result = json.loads(r.read())
    errors = result.get("errors", [])
    if errors:
        raise RuntimeError(errors)
    return result

def main():
    print("Ansluter till Neo4j Aura…")
    cypher("RETURN 1")
    print("OK — anslutning lyckades\n")

    print(f"Laddar {len(OCCUPATIONS)} yrken…")
    cypher(
        """
        UNWIND $rows AS row
        MERGE (o:Occupation {id: row.id})
        SET o.name = row.name,
            o.ssyk_code = row.ssyk_code,
            o.definition = row.definition,
            o.workplace_model = row.workplace_model,
            o.updated_at = datetime()
        """,
        {"rows": OCCUPATIONS},
    )
    print("  ✓ Yrken klara")

    print(f"Laddar {len(SKILLS)} kompetenser…")
    cypher(
        """
        UNWIND $rows AS row
        MERGE (s:Skill {id: row.id})
        SET s.name = row.name, s.updated_at = datetime()
        """,
        {"rows": SKILLS},
    )
    print("  ✓ Kompetenser klara")

    print(f"Skapar {len(EDGES)} substituerbarhetskanter…")
    cypher(
        """
        UNWIND $rows AS row
        MATCH (a:Occupation {id: row.s}), (b:Occupation {id: row.t})
        MERGE (a)-[r:SUBSTITUTABLE_WITH]->(b)
        SET r.score = row.score, r.updated_at = datetime()
        """,
        {"rows": EDGES},
    )
    print("  ✓ Kanter klara")

    count = cypher("MATCH (n) RETURN count(n) AS c")
    n = count["results"][0]["data"][0]["row"][0]
    print(f"\nKLART — {n} noder totalt i databasen. Demo redo!")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"\nFEL: {e}", file=sys.stderr)
        sys.exit(1)
