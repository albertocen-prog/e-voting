import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node prisma/seed.js",
  },
  datasource: {
    // Provide a dummy fallback value if DATABASE_URL is missing during build time
    url: env("DATABASE_URL") ?? "postgresql://dummy:dummy@localhost:5432/dummy",
  },
});
