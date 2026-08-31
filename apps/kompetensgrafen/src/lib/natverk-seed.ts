// GENERERAD FIL — ändra inte för hand.
// Källa: services/data-pipeline/seed/{occupations,substitutability}_seed.json
// Detta är exakt den datamängd som services/matching-api/src/services/seeder.py
// laddar in i Neo4j vid uppstart. Används som fallback när API:t inte svarar,
// så att grafen aldrig renderas tom — och märks då tydligt ut i gränssnittet.
//
// Omfattning: 22 yrken, 19 kompetensöverlapp (38 riktade kanter i databasen).
// Ingen siffra här är uppskattad eller påhittad.

import type { Natverk } from "./natverk-typer";

export const SEED_NATVERK: Natverk = {
  "noder": [
    {
      "id": "35a28d4b-5a50-4ab9-9ac8-6a5f5c43d5b6",
      "namn": "Mjukvaruutvecklare",
      "ssyk": "2512",
      "sektor": "it",
      "definition": "Analyserar, konstruerar, testar och underhåller programvara och system.",
      "arbetsform": "hybrid"
    },
    {
      "id": "7a24c02f-b1d0-4e5a-bfc3-ef209f3a1d88",
      "namn": "Systemarkitekt",
      "ssyk": "2511",
      "sektor": "it",
      "definition": "Planerar och utformar IT-system och teknisk infrastruktur.",
      "arbetsform": "hybrid"
    },
    {
      "id": "c3e67890-d4f7-11ee-a506-0242ac120002",
      "namn": "Dataingenjör",
      "ssyk": "2529",
      "sektor": "it",
      "definition": "Bygger och underhåller datapipelines och infrastruktur för dataanalys.",
      "arbetsform": "hybrid"
    },
    {
      "id": "e1f23456-d4f7-11ee-a506-0242ac120002",
      "namn": "IT-tekniker",
      "ssyk": "3512",
      "sektor": "it",
      "definition": "Installerar, konfigurerar och felsöker datorer, nätverk och programvara.",
      "arbetsform": "on_site"
    },
    {
      "id": "c3e89102-d4f7-11ee-a506-0242ac120002",
      "namn": "Undersköterska",
      "ssyk": "5321",
      "sektor": "vard",
      "definition": "Ger vård och omsorg till patienter och brukare inom hälso- och sjukvård.",
      "arbetsform": "on_site"
    },
    {
      "id": "f5b12347-d4f7-11ee-a506-0242ac120002",
      "namn": "Sjuksköterska",
      "ssyk": "2221",
      "sektor": "vard",
      "definition": "Planerar och utför omvårdnad samt administrerar medicinsk behandling.",
      "arbetsform": "on_site"
    },
    {
      "id": "a8b91234-d4f7-11ee-a506-0242ac120002",
      "namn": "Personlig assistent",
      "ssyk": "5341",
      "sektor": "vard",
      "definition": "Ger stöd och assistans till personer med funktionsnedsättning i vardagen.",
      "arbetsform": "on_site"
    },
    {
      "id": "a1c45678-d4f7-11ee-a506-0242ac120002",
      "namn": "Lärare i grundskolan",
      "ssyk": "2341",
      "sektor": "utbildning",
      "definition": "Planerar och genomför undervisning för elever i grundskolan.",
      "arbetsform": "on_site"
    },
    {
      "id": "b3d57891-d4f7-11ee-a506-0242ac120002",
      "namn": "Förskollärare",
      "ssyk": "2342",
      "sektor": "utbildning",
      "definition": "Planerar och genomför pedagogisk verksamhet för barn i förskoleåldern.",
      "arbetsform": "on_site"
    },
    {
      "id": "b2d56789-d4f7-11ee-a506-0242ac120002",
      "namn": "Automationstekniker",
      "ssyk": "3115",
      "sektor": "industri",
      "definition": "Installerar, programmerar och underhåller industrirobotar och automationssystem.",
      "arbetsform": "on_site"
    },
    {
      "id": "c5e78901-d4f7-11ee-a506-0242ac120002",
      "namn": "Maskinoperatör",
      "ssyk": "8121",
      "sektor": "industri",
      "definition": "Hanterar och övervakar industriella maskiner i tillverkningsprocesser.",
      "arbetsform": "on_site"
    },
    {
      "id": "d6f89012-d4f7-11ee-a506-0242ac120002",
      "namn": "Svetsare",
      "ssyk": "7212",
      "sektor": "industri",
      "definition": "Sammanfogar metaller med svetsning enligt ritningar och toleranser.",
      "arbetsform": "on_site"
    },
    {
      "id": "e7a90123-d4f7-11ee-a506-0242ac120002",
      "namn": "Vindkrafttekniker",
      "ssyk": "7412",
      "sektor": "industri",
      "definition": "Installerar och underhåller vindkraftverk samt tillhörande elsystem.",
      "arbetsform": "on_site"
    },
    {
      "id": "f8b01234-d4f7-11ee-a506-0242ac120002",
      "namn": "Elektriker",
      "ssyk": "7411",
      "sektor": "industri",
      "definition": "Installerar, underhåller och reparerar elinstallationer i byggnader och anläggningar.",
      "arbetsform": "on_site"
    },
    {
      "id": "d4f78901-d4f7-11ee-a506-0242ac120002",
      "namn": "Logistikkoordinator",
      "ssyk": "4321",
      "sektor": "logistik",
      "definition": "Koordinerar transport, lager och leveranskedjor.",
      "arbetsform": "on_site"
    },
    {
      "id": "a9c12345-d4f7-11ee-a506-0242ac120002",
      "namn": "Lagerarbetare",
      "ssyk": "9333",
      "sektor": "logistik",
      "definition": "Packar, plockar, lastar och lossar varor i lager och distributionscentraler.",
      "arbetsform": "on_site"
    },
    {
      "id": "b0d23456-d4f7-11ee-a506-0242ac120002",
      "namn": "Truckförare",
      "ssyk": "8344",
      "sektor": "logistik",
      "definition": "Kör truck för att transportera, lasta och lossa material och varor.",
      "arbetsform": "on_site"
    },
    {
      "id": "c1e34567-d4f7-11ee-a506-0242ac120002",
      "namn": "Lastbilsförare",
      "ssyk": "8332",
      "sektor": "logistik",
      "definition": "Transporterar gods med lastbil mellan kunder, lager och terminaler.",
      "arbetsform": "on_site"
    },
    {
      "id": "d2f45678-d4f7-11ee-a506-0242ac120002",
      "namn": "Butikschef",
      "ssyk": "1422",
      "sektor": "service",
      "definition": "Leder driften av butik inklusive personal, försäljning och ekonomi.",
      "arbetsform": "on_site"
    },
    {
      "id": "e3a56789-d4f7-11ee-a506-0242ac120002",
      "namn": "Restaurangchef",
      "ssyk": "1411",
      "sektor": "service",
      "definition": "Leder driften av restaurang inklusive personal, kök och serviceflöden.",
      "arbetsform": "on_site"
    },
    {
      "id": "f4b67890-d4f7-11ee-a506-0242ac120002",
      "namn": "Kock",
      "ssyk": "5120",
      "sektor": "service",
      "definition": "Tillagar mat enligt recept och meny i restaurang- eller storkök.",
      "arbetsform": "on_site"
    },
    {
      "id": "a5c78901-d4f7-11ee-a506-0242ac120002",
      "namn": "Snickare",
      "ssyk": "7115",
      "sektor": "bygg",
      "definition": "Bygger, monterar och renoverar trästommar, inredning och byggnadsdetaljer.",
      "arbetsform": "on_site"
    }
  ],
  "kanter": [
    {
      "kalla": "35a28d4b-5a50-4ab9-9ac8-6a5f5c43d5b6",
      "mal": "7a24c02f-b1d0-4e5a-bfc3-ef209f3a1d88",
      "score": 75,
      "riktningar": [
        {
          "fran": "35a28d4b-5a50-4ab9-9ac8-6a5f5c43d5b6",
          "till": "7a24c02f-b1d0-4e5a-bfc3-ef209f3a1d88",
          "typ": "can_become"
        },
        {
          "fran": "7a24c02f-b1d0-4e5a-bfc3-ef209f3a1d88",
          "till": "35a28d4b-5a50-4ab9-9ac8-6a5f5c43d5b6",
          "typ": "can_replace"
        }
      ]
    },
    {
      "kalla": "35a28d4b-5a50-4ab9-9ac8-6a5f5c43d5b6",
      "mal": "c3e67890-d4f7-11ee-a506-0242ac120002",
      "score": 75,
      "riktningar": [
        {
          "fran": "35a28d4b-5a50-4ab9-9ac8-6a5f5c43d5b6",
          "till": "c3e67890-d4f7-11ee-a506-0242ac120002",
          "typ": "can_become"
        },
        {
          "fran": "c3e67890-d4f7-11ee-a506-0242ac120002",
          "till": "35a28d4b-5a50-4ab9-9ac8-6a5f5c43d5b6",
          "typ": "can_replace"
        }
      ]
    },
    {
      "kalla": "35a28d4b-5a50-4ab9-9ac8-6a5f5c43d5b6",
      "mal": "e1f23456-d4f7-11ee-a506-0242ac120002",
      "score": 50,
      "riktningar": [
        {
          "fran": "35a28d4b-5a50-4ab9-9ac8-6a5f5c43d5b6",
          "till": "e1f23456-d4f7-11ee-a506-0242ac120002",
          "typ": "can_become"
        },
        {
          "fran": "e1f23456-d4f7-11ee-a506-0242ac120002",
          "till": "35a28d4b-5a50-4ab9-9ac8-6a5f5c43d5b6",
          "typ": "can_replace"
        }
      ]
    },
    {
      "kalla": "7a24c02f-b1d0-4e5a-bfc3-ef209f3a1d88",
      "mal": "c3e67890-d4f7-11ee-a506-0242ac120002",
      "score": 50,
      "riktningar": [
        {
          "fran": "7a24c02f-b1d0-4e5a-bfc3-ef209f3a1d88",
          "till": "c3e67890-d4f7-11ee-a506-0242ac120002",
          "typ": "can_become"
        },
        {
          "fran": "c3e67890-d4f7-11ee-a506-0242ac120002",
          "till": "7a24c02f-b1d0-4e5a-bfc3-ef209f3a1d88",
          "typ": "can_replace"
        }
      ]
    },
    {
      "kalla": "a1c45678-d4f7-11ee-a506-0242ac120002",
      "mal": "b3d57891-d4f7-11ee-a506-0242ac120002",
      "score": 50,
      "riktningar": [
        {
          "fran": "a1c45678-d4f7-11ee-a506-0242ac120002",
          "till": "b3d57891-d4f7-11ee-a506-0242ac120002",
          "typ": "can_become"
        },
        {
          "fran": "b3d57891-d4f7-11ee-a506-0242ac120002",
          "till": "a1c45678-d4f7-11ee-a506-0242ac120002",
          "typ": "can_replace"
        }
      ]
    },
    {
      "kalla": "a5c78901-d4f7-11ee-a506-0242ac120002",
      "mal": "d6f89012-d4f7-11ee-a506-0242ac120002",
      "score": 25,
      "riktningar": [
        {
          "fran": "a5c78901-d4f7-11ee-a506-0242ac120002",
          "till": "d6f89012-d4f7-11ee-a506-0242ac120002",
          "typ": "can_become"
        },
        {
          "fran": "d6f89012-d4f7-11ee-a506-0242ac120002",
          "till": "a5c78901-d4f7-11ee-a506-0242ac120002",
          "typ": "can_replace"
        }
      ]
    },
    {
      "kalla": "a5c78901-d4f7-11ee-a506-0242ac120002",
      "mal": "f8b01234-d4f7-11ee-a506-0242ac120002",
      "score": 25,
      "riktningar": [
        {
          "fran": "f8b01234-d4f7-11ee-a506-0242ac120002",
          "till": "a5c78901-d4f7-11ee-a506-0242ac120002",
          "typ": "can_become"
        },
        {
          "fran": "a5c78901-d4f7-11ee-a506-0242ac120002",
          "till": "f8b01234-d4f7-11ee-a506-0242ac120002",
          "typ": "can_replace"
        }
      ]
    },
    {
      "kalla": "a8b91234-d4f7-11ee-a506-0242ac120002",
      "mal": "c3e89102-d4f7-11ee-a506-0242ac120002",
      "score": 75,
      "riktningar": [
        {
          "fran": "c3e89102-d4f7-11ee-a506-0242ac120002",
          "till": "a8b91234-d4f7-11ee-a506-0242ac120002",
          "typ": "can_become"
        },
        {
          "fran": "a8b91234-d4f7-11ee-a506-0242ac120002",
          "till": "c3e89102-d4f7-11ee-a506-0242ac120002",
          "typ": "can_replace"
        }
      ]
    },
    {
      "kalla": "a8b91234-d4f7-11ee-a506-0242ac120002",
      "mal": "f5b12347-d4f7-11ee-a506-0242ac120002",
      "score": 25,
      "riktningar": [
        {
          "fran": "a8b91234-d4f7-11ee-a506-0242ac120002",
          "till": "f5b12347-d4f7-11ee-a506-0242ac120002",
          "typ": "can_become"
        },
        {
          "fran": "f5b12347-d4f7-11ee-a506-0242ac120002",
          "till": "a8b91234-d4f7-11ee-a506-0242ac120002",
          "typ": "can_replace"
        }
      ]
    },
    {
      "kalla": "a9c12345-d4f7-11ee-a506-0242ac120002",
      "mal": "b0d23456-d4f7-11ee-a506-0242ac120002",
      "score": 75,
      "riktningar": [
        {
          "fran": "a9c12345-d4f7-11ee-a506-0242ac120002",
          "till": "b0d23456-d4f7-11ee-a506-0242ac120002",
          "typ": "can_become"
        },
        {
          "fran": "b0d23456-d4f7-11ee-a506-0242ac120002",
          "till": "a9c12345-d4f7-11ee-a506-0242ac120002",
          "typ": "can_replace"
        }
      ]
    },
    {
      "kalla": "a9c12345-d4f7-11ee-a506-0242ac120002",
      "mal": "d4f78901-d4f7-11ee-a506-0242ac120002",
      "score": 25,
      "riktningar": [
        {
          "fran": "a9c12345-d4f7-11ee-a506-0242ac120002",
          "till": "d4f78901-d4f7-11ee-a506-0242ac120002",
          "typ": "can_become"
        },
        {
          "fran": "d4f78901-d4f7-11ee-a506-0242ac120002",
          "till": "a9c12345-d4f7-11ee-a506-0242ac120002",
          "typ": "can_replace"
        }
      ]
    },
    {
      "kalla": "b0d23456-d4f7-11ee-a506-0242ac120002",
      "mal": "c1e34567-d4f7-11ee-a506-0242ac120002",
      "score": 50,
      "riktningar": [
        {
          "fran": "b0d23456-d4f7-11ee-a506-0242ac120002",
          "till": "c1e34567-d4f7-11ee-a506-0242ac120002",
          "typ": "can_become"
        },
        {
          "fran": "c1e34567-d4f7-11ee-a506-0242ac120002",
          "till": "b0d23456-d4f7-11ee-a506-0242ac120002",
          "typ": "can_replace"
        }
      ]
    },
    {
      "kalla": "b2d56789-d4f7-11ee-a506-0242ac120002",
      "mal": "c5e78901-d4f7-11ee-a506-0242ac120002",
      "score": 50,
      "riktningar": [
        {
          "fran": "b2d56789-d4f7-11ee-a506-0242ac120002",
          "till": "c5e78901-d4f7-11ee-a506-0242ac120002",
          "typ": "can_become"
        },
        {
          "fran": "c5e78901-d4f7-11ee-a506-0242ac120002",
          "till": "b2d56789-d4f7-11ee-a506-0242ac120002",
          "typ": "can_replace"
        }
      ]
    },
    {
      "kalla": "b2d56789-d4f7-11ee-a506-0242ac120002",
      "mal": "e7a90123-d4f7-11ee-a506-0242ac120002",
      "score": 50,
      "riktningar": [
        {
          "fran": "b2d56789-d4f7-11ee-a506-0242ac120002",
          "till": "e7a90123-d4f7-11ee-a506-0242ac120002",
          "typ": "can_become"
        },
        {
          "fran": "e7a90123-d4f7-11ee-a506-0242ac120002",
          "till": "b2d56789-d4f7-11ee-a506-0242ac120002",
          "typ": "can_replace"
        }
      ]
    },
    {
      "kalla": "c3e89102-d4f7-11ee-a506-0242ac120002",
      "mal": "f5b12347-d4f7-11ee-a506-0242ac120002",
      "score": 50,
      "riktningar": [
        {
          "fran": "c3e89102-d4f7-11ee-a506-0242ac120002",
          "till": "f5b12347-d4f7-11ee-a506-0242ac120002",
          "typ": "can_become"
        },
        {
          "fran": "f5b12347-d4f7-11ee-a506-0242ac120002",
          "till": "c3e89102-d4f7-11ee-a506-0242ac120002",
          "typ": "can_replace"
        }
      ]
    },
    {
      "kalla": "c5e78901-d4f7-11ee-a506-0242ac120002",
      "mal": "d6f89012-d4f7-11ee-a506-0242ac120002",
      "score": 25,
      "riktningar": [
        {
          "fran": "c5e78901-d4f7-11ee-a506-0242ac120002",
          "till": "d6f89012-d4f7-11ee-a506-0242ac120002",
          "typ": "can_become"
        },
        {
          "fran": "d6f89012-d4f7-11ee-a506-0242ac120002",
          "till": "c5e78901-d4f7-11ee-a506-0242ac120002",
          "typ": "can_replace"
        }
      ]
    },
    {
      "kalla": "d2f45678-d4f7-11ee-a506-0242ac120002",
      "mal": "e3a56789-d4f7-11ee-a506-0242ac120002",
      "score": 50,
      "riktningar": [
        {
          "fran": "d2f45678-d4f7-11ee-a506-0242ac120002",
          "till": "e3a56789-d4f7-11ee-a506-0242ac120002",
          "typ": "can_become"
        },
        {
          "fran": "e3a56789-d4f7-11ee-a506-0242ac120002",
          "till": "d2f45678-d4f7-11ee-a506-0242ac120002",
          "typ": "can_replace"
        }
      ]
    },
    {
      "kalla": "e3a56789-d4f7-11ee-a506-0242ac120002",
      "mal": "f4b67890-d4f7-11ee-a506-0242ac120002",
      "score": 50,
      "riktningar": [
        {
          "fran": "f4b67890-d4f7-11ee-a506-0242ac120002",
          "till": "e3a56789-d4f7-11ee-a506-0242ac120002",
          "typ": "can_become"
        },
        {
          "fran": "e3a56789-d4f7-11ee-a506-0242ac120002",
          "till": "f4b67890-d4f7-11ee-a506-0242ac120002",
          "typ": "can_replace"
        }
      ]
    },
    {
      "kalla": "e7a90123-d4f7-11ee-a506-0242ac120002",
      "mal": "f8b01234-d4f7-11ee-a506-0242ac120002",
      "score": 75,
      "riktningar": [
        {
          "fran": "e7a90123-d4f7-11ee-a506-0242ac120002",
          "till": "f8b01234-d4f7-11ee-a506-0242ac120002",
          "typ": "can_become"
        },
        {
          "fran": "f8b01234-d4f7-11ee-a506-0242ac120002",
          "till": "e7a90123-d4f7-11ee-a506-0242ac120002",
          "typ": "can_replace"
        }
      ]
    }
  ],
  "meta": {
    "kalla": "seed",
    "yrken": 22,
    "kompetenser": 51,
    "kanter_riktade": 38,
    "kanter_odirigerade": 19,
    "annonser_live": false,
    "delade_kompetenser_tillgangliga": false
  }
};
