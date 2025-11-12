import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  const fishes = await prisma.fish.findMany();
  for (const f of fishes) {
    console.log(
      `${f.name} -> sizeCm: ${f.sizeCm ?? "null"}, weightKg: ${
        f.weightKg ?? "null"
      }`
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
