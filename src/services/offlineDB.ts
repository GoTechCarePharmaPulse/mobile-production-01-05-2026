import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("pharmapulse.db");

export const initDB = () => {

  db.execSync(`
    CREATE TABLE IF NOT EXISTS doctors (
      id TEXT PRIMARY KEY,
      name TEXT,
      clinic TEXT,
      dtcreateon TEXT,
      dtlastmodify TEXT
    );
  `);

};