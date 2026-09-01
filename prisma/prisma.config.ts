import { defineConfig } from "@prisma/internals";

export default defineConfig({
  prisma: {
    seed: "./prisma/seed.js",
  },
});
