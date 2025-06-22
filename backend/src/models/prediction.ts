export interface Prediction {
  productId: string;
  predictedNextPurchaseDate: string; // ISO Date
  recommendedQuantity: number;
  monthlyConsumption: number;
}

interface OrderWithQuantity {
  purchaseDate: Date;
  quantity: number;
}

export interface ConsumptionAnalysis {
  recommendedQuantity: number;
  monthlyConsumption: number;
}

/**
 * Calculates the recommended quantity and monthly consumption rate based on order history
 * @param orders Array of orders with their quantities and dates
 * @returns Analysis containing recommended quantity and monthly consumption rate
 */
export function calculateAverageQuantityAndConsumption(orders: OrderWithQuantity[]): ConsumptionAnalysis {
  if (orders.length === 0) {
    return { recommendedQuantity: 0, monthlyConsumption: 0 };
  }

  // Calculate the mode (most common) quantity as the recommended quantity
  const quantityCounts = orders.reduce((acc, order) => {
    acc[order.quantity] = (acc[order.quantity] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const recommendedQuantity = Number(
    Object.entries(quantityCounts).reduce((a, b) => 
      quantityCounts[Number(a[0])] > quantityCounts[Number(b[0])] ? a : b
    )[0]
  );

  // Calculate monthly consumption rate
  const totalQuantity = orders.reduce((sum, order) => sum + order.quantity, 0);
  
  if (orders.length === 1) {
    return {
      recommendedQuantity,
      monthlyConsumption: totalQuantity // If only one order, assume that's the monthly rate
    };
  }

  // Sort orders by date
  const sortedOrders = [...orders].sort((a, b) => a.purchaseDate.getTime() - b.purchaseDate.getTime());
  
  // Calculate time span in months
  const firstOrder = sortedOrders[0];
  const lastOrder = sortedOrders[sortedOrders.length - 1];
  const monthsDiff = (lastOrder.purchaseDate.getTime() - firstOrder.purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44); // Average month length

  // Calculate monthly consumption rate
  const monthlyConsumption = totalQuantity / Math.max(1, monthsDiff); // Avoid division by zero

  return {
    recommendedQuantity,
    monthlyConsumption
  };
}
