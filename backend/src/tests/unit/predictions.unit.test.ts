import { calculateAverageQuantityAndConsumption } from '../../models/prediction';

describe('Prediction Calculations', () => {
  describe('calculateAverageQuantityAndConsumption', () => {
    it('should calculate average quantity correctly', () => {
      const orders = [
        { purchaseDate: new Date('2024-01-01'), quantity: 2 },
        { purchaseDate: new Date('2024-02-01'), quantity: 2 },
        { purchaseDate: new Date('2024-03-01'), quantity: 3 }
      ];

      const result = calculateAverageQuantityAndConsumption(orders);
      expect(result.recommendedQuantity).toBe(2); // 2 is more common than 3
      expect(result.monthlyConsumption).toBeCloseTo(2.33); // (2+2+3)/3 per month
    });

    it('should handle single order', () => {
      const orders = [
        { purchaseDate: new Date('2024-01-01'), quantity: 2 }
      ];

      const result = calculateAverageQuantityAndConsumption(orders);
      expect(result.recommendedQuantity).toBe(2);
      expect(result.monthlyConsumption).toBe(2);
    });

    it('should calculate monthly consumption rate correctly', () => {
      const orders = [
        { purchaseDate: new Date('2024-01-01'), quantity: 4 }, // 4 units
        { purchaseDate: new Date('2024-03-01'), quantity: 6 }, // 6 units, 2 months later
        { purchaseDate: new Date('2024-04-01'), quantity: 2 }  // 2 units, 1 month later
      ];

      const result = calculateAverageQuantityAndConsumption(orders);
      expect(result.monthlyConsumption).toBeCloseTo(4); // 12 units over 3 months = 4/month
      expect(result.recommendedQuantity).toBe(4); // Mode of quantities
    });
  });
}); 