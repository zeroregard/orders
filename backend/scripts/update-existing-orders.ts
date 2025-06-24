import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateExistingOrders() {
  try {
    console.log('Updating existing orders to non-draft status...');
    
    const result = await prisma.order.updateMany({
      where: {
        isDraft: true,
        // Only update orders created before we added the draft feature
        createdAt: {
          lt: new Date('2024-06-23')
        }
      },
      data: {
        isDraft: false,
        source: 'MANUAL'
      }
    });
    
    console.log(`Updated ${result.count} existing orders to non-draft status`);
    
    // Also update any existing products to non-draft
    const productResult = await prisma.product.updateMany({
      where: {
        isDraft: true
      },
      data: {
        isDraft: false
      }
    });
    
    console.log(`Updated ${productResult.count} existing products to non-draft status`);
    
  } catch (error) {
    console.error('Error updating existing orders:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateExistingOrders(); 