import { defineConfig } from "@prisma/internals";

export default defineConfig({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  prisma: {
    seed: "./prisma/seed.js",
  },
});
