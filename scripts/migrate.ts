// Apply pending Drizzle migrations (Neon when DATABASE_URL is set, else local PGlite).
import { scriptDb } from "./script-db";
import { databaseUnavailableReason, warnSkipped } from "./db-probe";

async function main() {
  // Neon unreachable (suspended / over quota): skip instead of failing the whole deploy. If it IS reachable,
  // a failing migration below still fails the build.
  const down = await databaseUnavailableReason();
  if (down) {
    warnSkipped("database migrations", down);
    return;
  }
  const { close } = await scriptDb(); // migrates on connect
  await close();
  console.log("migrations applied");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
