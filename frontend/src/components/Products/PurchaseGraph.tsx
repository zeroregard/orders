import React, { useEffect, useState } from 'react';
import type { PurchaseHistory } from '../../api/backend';
import './PurchaseGraph.css';

interface PurchaseGraphProps {
  purchaseHistory: PurchaseHistory;
  predictedDate?: string;
}

interface DayData {
  date: string;
  quantity: number;
  isPredicted: boolean;
}

const PurchaseGraph: React.FC<PurchaseGraphProps> = ({ purchaseHistory, predictedDate }) => {
  const [days, setDays] = useState<DayData[]>([]);

  useEffect(() => {
    // Get current year's start and end dates
    const now = new Date();
    const startDate = new Date(now.getFullYear(), 0, 1);
    const endDate = new Date(now.getFullYear(), 11, 31);

    // Create array of all days in the year
    const allDays: DayData[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const purchase = purchaseHistory.purchases.find(p => p.date === dateStr);
      const isPredicted = predictedDate === dateStr;

      allDays.push({
        date: dateStr,
        quantity: purchase?.quantity || 0,
        isPredicted
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    setDays(allDays);
  }, [purchaseHistory, predictedDate]);

  // Calculate color intensity based on quantity
  const getColorStyle = (quantity: number, isPredicted: boolean) => {
    if (quantity === 0 && !isPredicted) {
      return { backgroundColor: '#ebedf0' };
    }

    const intensity = purchaseHistory.max > 0 ? quantity / purchaseHistory.max : 0;
    const baseColor = [103, 58, 183]; // Purple RGB
    const color = baseColor.map(c => Math.round(c * intensity)).join(',');

    if (isPredicted) {
      return {
        backgroundColor: 'transparent',
        border: `2px dashed rgb(${color})`,
      };
    }

    return {
      backgroundColor: `rgba(${color}, ${0.3 + intensity * 0.7})`,
    };
  };

  // Group days by week for the grid layout
  const weeks = days.reduce<DayData[][]>((acc, day, index) => {
    const weekIndex = Math.floor(index / 7);
    if (!acc[weekIndex]) {
      acc[weekIndex] = [];
    }
    acc[weekIndex].push(day);
    return acc;
  }, []);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="purchase-graph">
      <div className="months-header">
        {months.map(month => (
          <div key={month} className="month-label">{month}</div>
        ))}
      </div>
      <div className="days-container">
        <div className="day-labels">
          <div>Mon</div>
          <div>Wed</div>
          <div>Fri</div>
        </div>
        <div className="weeks-container">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="week">
              {week.map(day => (
                <div
                  key={day.date}
                  className="day"
                  style={getColorStyle(day.quantity, day.isPredicted)}
                  title={`${day.date}: ${day.quantity} ${day.quantity === 1 ? 'purchase' : 'purchases'}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PurchaseGraph; 