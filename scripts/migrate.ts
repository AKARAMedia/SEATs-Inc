// Apply pending Drizzle migrations (Neon when DATABASE_URL is set, else local PGlite).
import { scriptDb } from "./script-db";

scriptDb() // migrates on connect
  .then(({ close }) => close())
  .then(() => console.log("migrations applied"))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
