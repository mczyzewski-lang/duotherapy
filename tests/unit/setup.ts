// Testy jednostkowe/RLS działają na osobnej bazie duo_unit.
process.env.DATABASE_URL = "postgres://duo_app:duo_app_dev@localhost:5432/duo_unit";
process.env.DATABASE_OWNER_URL = "postgres://duo_owner:duo_owner_dev@localhost:5432/duo_unit";
process.env.DEMO_MODE = "true";
