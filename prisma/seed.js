// prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  // 1️⃣ Ensure gym exists
  const gym = await prisma.gym.upsert({
    where: { name: "Roll Academy Main Gym" },
    update: {},
    create: {
      name: "Roll Academy Main Gym",
    },
  });

  console.log("Gym ready:", gym.name, "ID:", gym.id);

  // 2️⃣ Admin credentials
  const email = "admin@rollacademy.com";
  const plain = "Admin@123";
  const hashed = await bcrypt.hash(plain, 10);
  const now = new Date();

  // 3️⃣ Upsert admin user (IMPORTANT FIX HERE)
  await prisma.user.upsert({
    where: { email },
    update: {
      role: "ADMIN",
      password: hashed,
      gymId: gym.id,
      gymName: gym.name,   // ✅ ADD THIS
      updatedAt: now,
    },
    create: {
      email,
      name: "Roll Admin",
      role: "ADMIN",
      password: hashed,
      gymId: gym.id,
      gymName: gym.name,   // ✅ ADD THIS
      createdAt: now,
      updatedAt: now,
    },
  });

  console.log("Seeded admin:", email, "password:", plain);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
