const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      publicId: true,
      slug: true,
      status: true,
      variants: {
        select: {
          id: true,
          publicId: true,
          status: true,
          optionValues: true,
        },
      },
    },
  });
  console.log('Total products in DB:', products.length);
  for (const p of products) {
    console.log(`Product: slug=${p.slug}, status=${p.status}, variantsCount=${p.variants.length}`);
    for (const v of p.variants) {
      console.log(`  -> Variant: id=${v.id}, publicId=${v.publicId}, status=${v.status}, options=${JSON.stringify(v.optionValues)}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());

