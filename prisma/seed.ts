import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PNW_SPECIES = [
  { name: "Chinook Salmon", category: "Salmon" },
  { name: "Coho Salmon", category: "Salmon" },
  { name: "Sockeye Salmon", category: "Salmon" },
  { name: "Pink Salmon", category: "Salmon" },
  { name: "Chum Salmon", category: "Salmon" },
  { name: "Steelhead", category: "Trout" },
  { name: "Cutthroat Trout", category: "Trout" },
  { name: "Rainbow Trout", category: "Trout" },
  { name: "Halibut", category: "Bottomfish" },
  { name: "Lingcod", category: "Bottomfish" },
  { name: "Rockfish", category: "Bottomfish" },
  { name: "Dungeness Crab", category: "Shellfish" },
  { name: "Spot Prawn", category: "Shellfish" },
  { name: "Albacore Tuna", category: "Pelagic" },
];

async function main() {
  for (const species of PNW_SPECIES) {
    await prisma.species.upsert({
      where: { name: species.name },
      update: { category: species.category },
      create: species,
    });
  }
  console.log(`Seeded ${PNW_SPECIES.length} Pacific Northwest species.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
