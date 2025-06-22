import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateLastOrdered() {
  try {
    // Get all products with their last order dates
    const lastOrders = await prisma.$queryRaw`
      SELECT 
        p.id as product_id,
        MAX(o."purchaseDate") as last_ordered
      FROM "products" p
      LEFT JOIN "order_line_items" oli ON p.id = oli."productId"
      LEFT JOIN "orders" o ON oli."orderId" = o.id
      GROUP BY p.id
    `;

    // Update each product
    for (const { product_id, last_ordered } of lastOrders as { product_id: string, last_ordered: Date }[]) {
      await prisma.product.update({
        where: { id: product_id },
        data: { lastOrdered: last_ordered }
      });
    }

    console.log('Successfully updated lastOrdered for all products');
  } catch (error) {
    console.error('Error updating lastOrdered:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateLastOrdered(); 