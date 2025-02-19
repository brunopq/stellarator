import { defineConfig } from "drizzle-kit"

import { env } from "~/utils/envConfig"

export default defineConfig({
  schema: "./app/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  casing: "snake_case",
  dbCredentials: {
    url: env.DB_URL,
  },
})
