import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyDatabasePersistence() {
  try {
    console.log('🔍 Testing database persistence...');
    
    // Create a test product
    const testProduct = await prisma.product.create({
      data: {
        name: `Test Product ${new Date().toISOString()}`,
        description: 'This is a test product to verify database persistence',
        price: 99.99,
        iconId: 'test-icon'
      }
    });
    
    console.log('✅ Test product created:', testProduct.id);
    
    // Count all products
    const productCount = await prisma.product.count();
    console.log(`📊 Total products in database: ${productCount}`);
    
    // List recent products
    const recentProducts = await prisma.product.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        createdAt: true
      }
    });
    
    console.log('📝 Recent products:');
    recentProducts.forEach(product => {
      console.log(`  - ${product.name} (${product.createdAt.toISOString()})`);
    });
    
    console.log('\n🎉 Database persistence test completed successfully!');
    console.log('💡 To verify persistence:');
    console.log('   1. Note the product count and recent products above');
    console.log('   2. Deploy a code change (not schema change)');
    console.log('   3. Run this script again after deployment');
    console.log('   4. Verify the count increased and previous products are still there');
    
  } catch (error) {
    console.error('❌ Database persistence test failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if this file is executed directly
verifyDatabasePersistence();

export default verifyDatabasePersistence; 