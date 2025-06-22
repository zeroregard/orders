import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import type { PurchaseHistory } from '../../api/backend';

interface PurchaseCalendarProps {
  purchaseHistory: PurchaseHistory;
}

export function PurchaseCalendar({ purchaseHistory }: PurchaseCalendarProps) {
  // Transform purchase history into FullCalendar events
  const events = purchaseHistory.purchases.map(purchase => ({
    title: `x${purchase.quantity}`,
    date: purchase.date,
    backgroundColor: 'rgb(139 92 246)', // violet-500
    borderColor: 'rgb(139 92 246)',
    textColor: 'white',
    className: 'rounded-lg'
  }));

  return (
    <div className="purchase-calendar">
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={events}
        height="auto"
        headerToolbar={{
          start: 'title',
          center: '',
          end: 'prev,next'
        }}
        dayMaxEvents={1}
        eventDisplay="block"
        displayEventTime={false}
        themeSystem="standard"
        contentHeight="auto"
      />

      {/* Custom styles for dark mode */}
      <style>{`
        .fc {
          --fc-border-color: rgb(55 65 81); /* gray-700 */
          --fc-button-bg-color: rgb(139 92 246); /* violet-500 */
          --fc-button-border-color: rgb(139 92 246);
          --fc-button-hover-bg-color: rgb(124 58 237); /* violet-600 */
          --fc-button-hover-border-color: rgb(124 58 237);
          --fc-button-active-bg-color: rgb(109 40 217); /* violet-700 */
          --fc-button-active-border-color: rgb(109 40 217);
          --fc-today-bg-color: rgba(139, 92, 246, 0.1); /* violet-500 with opacity */
          --fc-neutral-bg-color: rgb(17 24 39); /* gray-900 */
          --fc-page-bg-color: transparent;
          background: transparent;
        }

        .fc .fc-button {
          border-radius: 0.375rem;
          padding: 0.25rem 0.5rem;
          font-weight: 500;
          font-size: 0.875rem;
        }

        .fc .fc-toolbar-title {
          color: rgb(229 231 235); /* gray-200 */
          font-size: 1rem;
          font-weight: 600;
        }

        .fc .fc-col-header-cell {
          background: rgb(31 41 55); /* gray-800 */
          padding: 0.5rem;
          color: rgb(156 163 175); /* gray-400 */
          font-weight: 500;
          font-size: 0.75rem;
        }

        .fc .fc-daygrid-day {
          background: rgb(17 24 39); /* gray-900 */
          min-height: 2.5rem;
          max-height: 4rem;
        }

        .fc-daygrid-day-events {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin: 0 !important;
          padding: 0 !important;
          min-height: 1.5rem !important;
        }

        .fc-daygrid-event-harness {
          width: fit-content;
          margin: 1px 0 !important;
        }

        .fc .fc-daygrid-day-number {
          color: rgb(209 213 219); /* gray-300 */
          padding: 0.25rem;
          font-weight: 500;
          font-size: 0.75rem;
        }

        .fc .fc-daygrid-day.fc-day-today {
          background: rgba(139, 92, 246, 0.1); /* violet-500 with opacity */
        }

        .fc .fc-event {
          border-radius: 0.25rem;
          padding: 0.125rem 0.375rem;
          font-size: 0.75rem;
          font-weight: 500;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
          transition: transform 0.1s ease-in-out;
          margin: 1px 2px !important;
        }

        .fc .fc-event:hover {
          transform: translateY(-1px);
        }

        .fc .fc-more-popover {
          background: rgb(31 41 55); /* gray-800 */
          border: 1px solid rgb(55 65 81); /* gray-700 */
          border-radius: 0.375rem;
        }

        .fc .fc-more-popover .fc-popover-title {
          background: rgb(31 41 55); /* gray-800 */
          color: rgb(229 231 235); /* gray-200 */
          padding: 0.5rem;
          font-weight: 600;
          font-size: 0.875rem;
          border-top-left-radius: 0.375rem;
          border-top-right-radius: 0.375rem;
        }

        .fc .fc-more-popover .fc-popover-body {
          padding: 0.5rem;
        }

        /* Mobile optimizations */
        @media (max-width: 640px) {
          .fc .fc-toolbar {
            flex-direction: row !important;
            gap: 0.5rem;
          }

          .fc .fc-toolbar-title {
            font-size: 0.875rem;
          }

          .fc .fc-button {
            padding: 0.25rem 0.375rem;
            font-size: 0.75rem;
          }

          .fc .fc-daygrid-day {
            min-height: 2rem;
          }
        }
      `}</style>
    </div>
  );
} 