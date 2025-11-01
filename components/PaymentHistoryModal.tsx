import React from 'react';
import type { PaymentHistory } from '../types';
import { XIcon, CalendarIcon, DollarSignIcon, BuildingIcon, UserIcon } from './icons';

interface PaymentHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    paymentHistory: PaymentHistory[];
    totalPaid: number;
}

const PaymentHistoryModal: React.FC<PaymentHistoryModalProps> = ({
    isOpen,
    onClose,
    title,
    paymentHistory,
    totalPaid
}) => {
    if (!isOpen) return null;

    const sortedHistory = [...paymentHistory].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                            {title}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Total Paid: ₹{totalPaid.toLocaleString()} • {paymentHistory.length} transactions
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    {paymentHistory.length === 0 ? (
                        <div className="text-center py-8">
                            <DollarSignIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">No payment history found</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {sortedHistory.map((payment) => (
                                <div
                                    key={payment.id}
                                    className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center space-x-2">
                                            <CalendarIcon className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {new Date(payment.date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                                                ₹{payment.amount.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                        {payment.site && (
                                            <div className="flex items-center space-x-2">
                                                <BuildingIcon className="w-4 h-4 text-blue-500" />
                                                <span className="text-gray-600 dark:text-gray-400">Site:</span>
                                                <span className="font-medium text-gray-800 dark:text-gray-200">
                                                    {payment.site}
                                                </span>
                                            </div>
                                        )}

                                        {payment.task && (
                                            <div className="flex items-center space-x-2">
                                                <BuildingIcon className="w-4 h-4 text-purple-500" />
                                                <span className="text-gray-600 dark:text-gray-400">Task:</span>
                                                <span className="font-medium text-gray-800 dark:text-gray-200">
                                                    {payment.task}
                                                </span>
                                            </div>
                                        )}

                                        {payment.user && (
                                            <div className="flex items-center space-x-2">
                                                <UserIcon className="w-4 h-4 text-orange-500" />
                                                <span className="text-gray-600 dark:text-gray-400">Paid by:</span>
                                                <span className="font-medium text-gray-800 dark:text-gray-200">
                                                    {payment.user}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {payment.description && (
                                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                <span className="font-medium">Description:</span> {payment.description}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentHistoryModal;