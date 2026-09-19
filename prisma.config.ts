import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  // 'schema' must be a single string path, not an object
  schema: "prisma/schema.prisma",

  migrations: {
    path: "prisma/migrations",
    seed: "node prisma/seed.js",
  },

  datasource: {
    url: env("DATABASE_URL"),
  },
});
