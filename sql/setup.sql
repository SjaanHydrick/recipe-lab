DROP TABLE IF EXISTS recipes CASCADE;
DROP TABLE IF EXISTS logs;

CREATE TABLE recipes (
  id BIGINT GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  directions TEXT[]
);

CREATE TABLE logs (
  id BIGINT GENERATED ALWAYS AS IDENTITY,
  recipe_id BIGINT REFERENCES recipes(id),
  dateOfEvents TEXT NOT NULL,
  notes TEXT NOT NULL,
  rating TEXT NOT NULL
);
