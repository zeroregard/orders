import React, { useEffect, useState } from 'react';
import type { PurchaseHistory } from '../../api/backend';
import './PurchaseGraph.css';

interface PurchaseGraphProps {
  purchaseHistory: PurchaseHistory;
  predictedDates?: string[];
}

interface DayData {
  date: string;
  quantity: number;
  isPredicted: boolean;
  month: number; // Add month to track which month each day belongs to
}

const PurchaseGraph: React.FC<PurchaseGraphProps> = ({ purchaseHistory, predictedDates }) => {
  const [days, setDays] = useState<DayData[]>([]);
  const [currentYearPredictions, setCurrentYearPredictions] = useState<string[]>([]);

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
      const isPredicted = currentYearPredictions?.includes(dateStr) ?? false;

      allDays.push({
        date: dateStr,
        quantity: purchase?.quantity || 0,
        isPredicted,
        month: currentDate.getMonth()
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    setDays(allDays);
  }, [purchaseHistory, predictedDates, currentYearPredictions]);

  useEffect(() => {
    setCurrentYearPredictions(
      predictedDates?.filter(date => new Date(date).getFullYear() === new Date().getFullYear()) || []
    );
  }, [predictedDates, currentYearPredictions]);

  // Calculate color intensity based on quantity
  const getColorStyle = (quantity: number, isPredicted: boolean) => {
    if (quantity === 0 && !isPredicted) {
      return { backgroundColor: 'transparent' };
    }

    const intensity = purchaseHistory.max > 0 ? quantity / purchaseHistory.max : 0;
    const baseColor = [103, 58, 183]; // Purple RGB
    const color = baseColor.map(c => Math.round(c * intensity)).join(',');

    if (isPredicted) {
      return {
        backgroundColor: 'transparent',
        borderColor: '#7c4dff',
        bordeStyle: 'solid',
        borderWidth: '1px'
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
  
  // Split months into two rows
  const topMonths = months.slice(0, 6);
  const bottomMonths = months.slice(6);

  const renderMonthLabels = (monthsToRender: string[]) => (
    <div className="flex mb-2 p">
      {monthsToRender.map((month, index) => (
        <div 
          key={month} 
          className="month-label !text-left p-1 rounded-md"
          style={{
            backgroundColor: index % 2 === 1 ? 'rgba(255, 255, 255, 0.05)' : 'transparent'
          }}
        >
          {month}
        </div>
      ))}
    </div>
  );

  const renderWeeksRow = (startMonth: number, endMonth: number) => {
    // Filter weeks that have at least one day in the current month range
    const rowWeeks = weeks.filter(week => 
      week.some(day => day.month >= startMonth && day.month <= endMonth)
    );

    return (
      <div className="flex flex-row gap-1 w-full">
        {rowWeeks.map((week, weekIndex) => (
          <div 
            key={weekIndex} 
            className="week flex flex-col gap-1" 
            style={{
              flexGrow: 1,
              padding: '1px'
            }}
          >
            {week.map(day => {
              // Only render days that belong to the current row's month range
              if (day.month < startMonth || day.month > endMonth) {
                return null;
              }

              const colorStyle = getColorStyle(day.quantity, day.isPredicted);
              const monthStyle = {
                backgroundColor: day.month % 2 === 1 && !day.quantity && !day.isPredicted 
                  ? 'rgba(255, 255, 255, 0.05)' 
                  : colorStyle.backgroundColor
              };
              
              return (
                <div
                  key={day.date}
                  className="border w-full min-w-full aspect-square rounded border-white/10"
                  style={{
                    ...colorStyle,
                    ...monthStyle
                  }}
                  title={`${day.date}: ${day.quantity} ${day.quantity === 1 ? 'purchase' : 'purchases'}`}
                />
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        {renderMonthLabels(topMonths)}
        {renderWeeksRow(0, 5)}
      </div>
      <div>
        {renderMonthLabels(bottomMonths)}
        {renderWeeksRow(6, 11)}
      </div>
    </div>
  );
};

export default PurchaseGraph; 