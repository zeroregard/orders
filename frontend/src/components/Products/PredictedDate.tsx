import { Calendar } from 'lucide-react';
import { formatDate } from '../../utils/dateFormatting';
import './PredictedDate.css';

interface PredictedDateProps {
  date: string;
}

export function PredictedDate({ date }: PredictedDateProps) {
  const getDateStyle = (predictedDate: Date) => {
    const now = new Date();
    const weekFromNow = new Date();
    weekFromNow.setDate(now.getDate() + 7);
    
    if (predictedDate < now) {
      return {
        color: 'text-red-400',
        isWithinWeek: false
      };
    } else if (predictedDate <= weekFromNow) {
      return {
        color: 'text-violet-400',
        isWithinWeek: true
      };
    } else {
      return {
        color: 'text-gray-400',
        isWithinWeek: false
      };
    }
  };

  const predictedDate = new Date(date);
  const { color, isWithinWeek } = getDateStyle(predictedDate);
 //  const isWithinWeek = true;

  return (
    <div className="flex items-center gap-2">
      <Calendar size={16} className={color} />
      <span className={`text-sm font-medium ${isWithinWeek ? 'predicted-date-shine' : color}`}>
        Next: {formatDate(date)}
      </span>
    </div>
  );
} 