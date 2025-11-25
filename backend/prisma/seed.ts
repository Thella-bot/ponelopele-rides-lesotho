import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding PricingConfig...');

  const existingConfig = await prisma.pricingConfig.findFirst();

  if (!existingConfig) {
    await prisma.pricingConfig.create({
      data: {
        baseFare: 20.0, // Example: 20 LSL base fare
        perKmRate: 10.0, // Example: 10 LSL per kilometer
        perMinuteRate: 2.0, // Example: 2 LSL per minute
        surgeMultiplier: 1.0, // Default surge multiplier (no surge)
        isActive: true,
      },
    });
    console.log('Default PricingConfig created.');
  } else {
    console.log('PricingConfig already exists, skipping seed.');
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
