-- pgcrypto's crypt() lets the database check/create bcrypt password hashes (see src/lib/auth.ts).
-- bcrypt in JavaScript costs hundreds of ms of CPU, far over the Cloudflare Free plan's 10 ms limit.
-- Wrapped so an environment without the extension (the embedded PGlite used in local dev) just skips it:
-- the app falls back to bcryptjs there.
DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS pgcrypto;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pgcrypto not available: %', SQLERRM;
END
$$;
