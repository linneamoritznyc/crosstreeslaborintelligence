// Crosstrees Labor Intelligence — Neo4j Schema
// Kör en gång i AuraDB Console efter provisionering

// Constraints
CREATE CONSTRAINT occupation_id IF NOT EXISTS
  FOR (o:Occupation) REQUIRE o.id IS UNIQUE;

CREATE CONSTRAINT skill_id IF NOT EXISTS
  FOR (s:Skill) REQUIRE s.id IS UNIQUE;

CREATE CONSTRAINT ssyk_code IF NOT EXISTS
  FOR (g:SSYKGroup) REQUIRE g.code IS UNIQUE;

CREATE CONSTRAINT education_id IF NOT EXISTS
  FOR (e:Education) REQUIRE e.id IS UNIQUE;

// Index
CREATE INDEX occupation_name IF NOT EXISTS
  FOR (o:Occupation) ON (o.name);

CREATE INDEX skill_name IF NOT EXISTS
  FOR (s:Skill) ON (s.name);

CREATE INDEX occupation_ssyk IF NOT EXISTS
  FOR (o:Occupation) ON (o.ssyk_code);

// Bakåtkanter-index för "vem kan ersätta X"
CREATE INDEX substitutable_direction IF NOT EXISTS
  FOR ()-[r:SUBSTITUTABLE_BY]-()
  ON (r.direction);
