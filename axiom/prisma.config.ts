// prisma.config.ts — Prisma 7 configuration
// Docs: https://pris.ly/d/config-datasource
import "dotenv/config"
import { defineConfig } from "prisma/config"

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Prisma 7: connection URL phải khai báo ở đây thay vì schema.prisma
    url: process.env.DATABASE_URL ?? "postgresql://axiom:axiom_password@localhost:5432/axiom_hrm?schema=public",
  },
})
