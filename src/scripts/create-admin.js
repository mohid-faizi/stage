// scripts/create-admin.js
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@school.com";

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    console.log("Admin already exists:", existing.email);
    process.exit(0);
  }

  const bcrypt = await import("bcryptjs");
  const hashed = await bcrypt.default.hash("AdminPass!", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Super Admin",
      email,
      password: hashed,
      role: "ADMIN",
      isVerified: true,
      isApproved: true,
      isRejected: false,
    },
  });

  console.log("Admin created:", admin.email);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
