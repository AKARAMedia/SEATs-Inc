// Stand-ins for modules that can't run on Cloudflare Workers, swapped in by next.config.ts when
// CLOUDFLARE_BUILD=1 to keep the Worker under its size limit. Workers always use Neon (DATABASE_URL)
// and the upload route falls back to browser-measured image sizes, so these are never called.
function unavailable(): never {
  throw new Error("Not available on Cloudflare Workers");
}

export class PGlite {
  constructor() {
    unavailable();
  }
}
export const drizzle = unavailable;
export const migrate = unavailable;
export default unavailable;
