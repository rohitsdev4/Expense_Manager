import React, { useMemo, useContext } from 'react';
import { DataContext } from '../contexts/DataContext';
import { PieChartIcon } from './icons';
import type { Expense } from '../types';

const COLORS = ['#3b82f6', '#ef4444', '#f97316', '#eab308', '#84cc16', '#14b8a6', '#8b5cf6', '#ec4899'];

const ExpensePieChart: React.FC = () => {
    const { expenses, expenseCategories, connectionStatus } = useContext(DataContext);

    const chartData = useMemo(() => {
        if (expenses.length === 0) return { segments: [], legend: [] };

        // FIX: Explicitly type the accumulator `sum` as a number.
        // This resolves an issue where TypeScript might not infer the correct type,
        // causing an arithmetic operation error on `sum + e.amount`.
        const totalExpenses = expenses.reduce((sum: number, e: Expense) => sum + e.amount, 0);
        if (totalExpenses === 0) return { segments: [], legend: [] };

        // FIX: Explicitly type the accumulator `acc` to have a string index signature with number values.
        // This ensures that `acc[expense.category]` is treated as a number,
        // resolving the arithmetic operation error on the following line.
        const categoryTotals = expenses.reduce((acc: Record<string, number>, expense: Expense) => {
            acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
            return acc;
        }, {});

        const sortedCategories = Object.entries(categoryTotals)
            .sort(([, a], [, b]) => b - a);

        let accumulatedPercentage = 0;
        const segments = [];
        const legend = [];

        sortedCategories.forEach(([categoryName, amount], index) => {
            const percentage = (amount / totalExpenses) * 100;
            const color = COLORS[index % COLORS.length];
            
            segments.push({ color, percentage });
            legend.push({
                name: categoryName,
                percentage: percentage.toFixed(1),
                color,
                amount
            });
            accumulatedPercentage += percentage;
        });

        return { segments, legend };
    }, [expenses, expenseCategories]);

    const conicGradient = useMemo(() => {
        let gradient = '';
        let currentPercentage = 0;
        chartData.segments.forEach(({ color, percentage }) => {
            gradient += `${color} ${currentPercentage}% ${currentPercentage + percentage}%, `;
            currentPercentage += percentage;
        });
        return `conic-gradient(${gradient.slice(0, -2)})`;
    }, [chartData.segments]);


    if (connectionStatus === 'loading') {
         return <div className="p-6 rounded-2xl border border-gray-700/50 bg-gray-800/50 h-80 flex items-center justify-center text-gray-400">Loading Chart Data...</div>;
    }

    return (
        <div className="p-6 rounded-2xl border border-gray-700/50 bg-gray-800/50 h-80 flex flex-col">
            <h3 className="text-lg font-medium text-gray-200 mb-4">Expense Distribution</h3>
            {expenses.length > 0 ? (
                <div className="flex-grow flex flex-col md:flex-row items-center gap-6">
                    <div className="relative w-40 h-40 flex-shrink-0">
                        <div
                            className="w-full h-full rounded-full"
                            style={{ background: conicGradient }}
                        ></div>
                         <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center">
                               <PieChartIcon className="w-8 h-8 text-gray-500"/>
                            </div>
                        </div>
                    </div>
                    <div className="w-full overflow-y-auto text-sm">
                        <ul className="space-y-2">
                            {chartData.legend.map(({ name, percentage, color, amount }) => (
                                <li key={name} className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }}></div>
                                        <span className="text-gray-300">{name}</span>
                                    </div>
                                    <div className="text-right">
                                      <span className="font-semibold text-white">{percentage}%</span>
                                      <span className="text-xs text-gray-400 ml-2">(₹{amount.toLocaleString()})</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            ) : (
                 <div className="flex-grow flex flex-col items-center justify-center text-gray-500">
                    <PieChartIcon className="w-12 h-12 mb-2" />
                    <p className="text-sm">No expense data to display.</p>
                </div>
            )}
        </div>
    );
};

export default ExpensePieChart;