import { prisma } from '../services/database';

async function testOrderCreation() {
  try {
    console.log('Testing database connection...');
    await prisma.$connect();
    console.log('Database connected successfully');

    // Create a test product
    console.log('Creating test product...');
    const product = await prisma.product.create({
      data: {
        name: 'Test Product'
      }
    });
    console.log('Product created:', product);

    // Create a test order
    console.log('Creating test order...');
    const order = await prisma.order.create({
      data: {
        name: 'Test Order',
        creationDate: new Date(),
        purchaseDate: new Date(),
        lineItems: {
          create: [{
            productId: product.id,
            quantity: 1
          }]
        }
      },
      include: {
        lineItems: {
          include: {
            product: true
          }
        }
      }
    });
    console.log('Order created successfully:', order);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testOrderCreation(); 