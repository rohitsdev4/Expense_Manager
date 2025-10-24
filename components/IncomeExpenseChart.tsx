import React, { useMemo, useContext } from 'react';
import { DataContext } from '../contexts/DataContext';

// Helper functions to avoid adding a date library
const subDaysManual = (date: Date, days: number): Date => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() - days);
    return newDate;
}

const isSameDayManual = (date1: Date, date2: Date): boolean => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
};

const IncomeExpenseChart: React.FC = () => {
    const { payments, expenses, connectionStatus } = useContext(DataContext);

    const chartData = useMemo(() => {
        if (!payments.length && !expenses.length) return [];
        const today = new Date();
        const data = [];
        for (let i = 29; i >= 0; i--) {
            const date = subDaysManual(today, i);
            const dailyIncome = payments
                .filter(p => p.date && isSameDayManual(new Date(p.date), date))
                .reduce((sum, p) => sum + p.amount, 0);
            const dailyExpense = expenses
                .filter(e => e.date && isSameDayManual(new Date(e.date), date))
                .reduce((sum, e) => sum + e.amount, 0);
            data.push({
                date,
                income: dailyIncome,
                expense: dailyExpense,
            });
        }
        return data;
    }, [payments, expenses]);

    const maxValue = useMemo(() => {
        if (chartData.length === 0) return 10000;
        const max = Math.max(...chartData.map(d => d.income), ...chartData.map(d => d.expense));
        if (max === 0) return 10000; // Return a default value if no data
        return Math.ceil(max / 10000) * 10000; // Round up to nearest 10k for a clean axis
    }, [chartData]);

    if (connectionStatus === 'loading') {
        return <div className="p-6 rounded-2xl border border-gray-700/50 bg-gray-800/50 h-80 flex items-center justify-center text-gray-400">Loading Chart Data...</div>;
    }

    return (
        <div className="p-6 rounded-2xl border border-gray-700/50 bg-gray-800/50 h-80 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-200">Income vs. Expense (Last 30 Days)</h3>
            <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-sm bg-green-500"></div>
                    <span className="text-gray-400">Income</span>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-sm bg-red-500"></div>
                    <span className="text-gray-400">Expense</span>
                </div>
            </div>
          </div>
          <div className="flex-grow flex items-end justify-between space-x-1 relative">
             {/* Y-axis labels */}
             <div className="absolute top-0 left-0 -translate-x-full pr-2 h-full flex flex-col justify-between text-xs text-gray-500 py-1">
                 <span>₹{maxValue.toLocaleString()}</span>
                 <span>₹0</span>
             </div>
             {chartData.map(({ date, income, expense }, index) => (
                  <div key={index} className="w-full flex flex-col items-center justify-end h-full group">
                      <div className="w-full flex items-end h-full gap-px justify-center">
                          <div
                              className="w-1/2 bg-green-500/70 hover:bg-green-500 rounded-t-sm transition-colors"
                              style={{ height: `${(income / maxValue) * 100}%` }}
                          ></div>
                          <div
                              className="w-1/2 bg-red-500/70 hover:bg-red-500 rounded-t-sm transition-colors"
                              style={{ height: `${(expense / maxValue) * 100}%` }}
                          ></div>
                      </div>
                      <span className={`text-xs mt-2 ${[0, 6, 13, 20, 29].includes(index) ? 'text-gray-400' : 'text-transparent'}`}>
                          {date.getDate()}
                      </span>
                      <div className="absolute bottom-10 mb-4 hidden group-hover:block bg-gray-900 border border-gray-600 p-2 rounded-lg text-xs shadow-lg z-10 whitespace-nowrap">
                          <p className="font-bold">{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                          <p className="text-green-400">Income: ₹{income.toLocaleString()}</p>
                          <p className="text-red-400">Expense: ₹{expense.toLocaleString()}</p>
                      </div>
                  </div>
              ))}
          </div>
        </div>
    );
};

export default IncomeExpenseChart;