import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { Loader2, DollarSign } from 'lucide-react'; // Removed Calendar, User, FileText icons as filters are removed
import { motion } from 'framer-motion';
import { axiosSecure } from '../../hooks/useAxiosSecure'; // Ensure this import path is correct
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area // Added AreaChart and Area for a potentially more modern look
} from 'recharts'; // Import Recharts components

const ManageTransactions = () => {
    // Removed filter states as filters are no longer needed
    // const [filterDateRange, setFilterDateRange] = useState('');
    // const [filterUser, setFilterUser] = useState('');
    // const [filterPolicy, setFilterPolicy] = useState('');

    // Fetch all payment information
    const { data: payments = [], isLoading, error } = useQuery({
        queryKey: ['allPayments'],
        queryFn: async () => {
            const res = await axiosSecure.get('/payments');
            return res.data || [];
        },
        // Data will be refetched if the component remounts or window is refocused
        staleTime: 60 * 1000, // 1 minute stale time
    });

    // Calculate total income from successful payments
    const totalIncome = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

    // Process payment data for the chart
    const processPaymentDataForChart = (payments) => {
        const dailyIncome = {};

        payments.forEach(payment => {
            // Ensure paymentDate exists and is a valid date string
            if (payment.paymentDate) {
                const date = new Date(payment.paymentDate).toISOString().split('T')[0]; // Get YYYY-MM-DD
                dailyIncome[date] = (dailyIncome[date] || 0) + (payment.amount || 0);
            }
        });

        // Convert to array of objects and sort by date
        const chartData = Object.keys(dailyIncome).map(date => ({
            date: date,
            totalAmount: parseFloat(dailyIncome[date].toFixed(2))
        })).sort((a, b) => new Date(a.date) - new Date(b.date));

        return chartData;
    };

    const chartData = processPaymentDataForChart(payments);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="h-10 w-10 animate-spin text-teal-500" />
                <p className="text-gray-600 ml-3 text-lg">Loading transactions...</p>
            </div>
        );
    }

    if (error) {
        return <p className="text-red-600 text-center text-lg py-10">Error fetching transactions: {error.message}</p>;
    }

    return (
        <>
            <Helmet>
                <title> Manage Transactions</title>
            </Helmet>

            <motion.div
                className="max-w-7xl mx-auto p-4 sm:p-6 bg-white rounded-3xl shadow-2xl my-8" // Added vertical margin
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-8 text-center">
                    Manage Transactions
                </h1>

                {/* Total Income Display */}
                <motion.div
                    className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-xl shadow-xl mb-10 flex items-center justify-between transform hover:scale-102 transition-transform duration-300 ease-in-out"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    <div className="flex items-center gap-4">
                        <DollarSign size={48} className="text-blue-200 opacity-80" />
                        <div>
                            <p className="text-lg font-light">Total Income</p>
                            <p className="text-5xl font-extrabold tracking-tight">${totalIncome.toFixed(2)}</p>
                        </div>
                    </div>
                    <p className="text-base text-blue-200 opacity-90">from {payments.length} transactions</p>
                </motion.div>

                {/* Removed Filter Buttons as requested */}
                {/* <div className="flex flex-wrap gap-4 mb-10 justify-center">
                    <motion.button
                        className="flex items-center gap-2 px-6 py-3 bg-white text-gray-800 rounded-full shadow-md hover:shadow-lg hover:bg-gray-50 transition-all duration-200 border border-gray-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => alert('Date Range filter functionality would go here!')}
                    >
                        <Calendar size={20} className="text-blue-500" /> Filter by Date
                    </motion.button>
                    <motion.button
                        className="flex items-center gap-2 px-6 py-3 bg-white text-gray-800 rounded-full shadow-md hover:shadow-lg hover:bg-gray-50 transition-all duration-200 border border-gray-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => alert('User filter functionality would go here!')}
                    >
                        <User size={20} className="text-green-500" /> Filter by User
                    </motion.button>
                    <motion.button
                        className="flex items-center gap-2 px-6 py-3 bg-white text-gray-800 rounded-full shadow-md hover:shadow-lg hover:bg-gray-50 transition-all duration-200 border border-gray-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => alert('Policy filter functionality would go here!')}
                    >
                        <FileText size={20} className="text-purple-500" /> Filter by Policy
                    </motion.button>
                </div> */}

                {/* Graph/Chart for Total Earnings Over Time */}
                {chartData.length > 0 && (
                    <motion.div
                        className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-10"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Total Earnings Over Time</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart
                                data={chartData}
                                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                <XAxis dataKey="date" tickFormatter={(tick) => new Date(tick).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                                <YAxis tickFormatter={(tick) => `$${tick}`} />
                                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} labelFormatter={(label) => `Date: ${new Date(label).toLocaleDateString()}`} />
                                <Area type="monotone" dataKey="totalAmount" stroke="#8884d8" fillOpacity={1} fill="url(#colorUv)" />
                                <defs>
                                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                            </AreaChart>
                        </ResponsiveContainer>
                        <p className="text-center text-gray-500 text-sm mt-4">Daily total income from transactions.</p>
                    </motion.div>
                )}


                {payments.length === 0 ? (
                    <p className="text-center text-gray-600 text-lg py-10">No transactions recorded yet.</p>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="overflow-x-auto hidden md:block border border-gray-200 rounded-xl shadow-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">Transaction ID</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">Customer Email</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">Policy Name</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">Paid Amount</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">Date</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {payments.map(payment => (
                                        <motion.tr
                                            key={payment.transactionId || payment._id}
                                            className="hover:bg-gray-50 transition-colors duration-150"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <td className="px-4 py-4 text-sm text-gray-800 truncate max-w-[180px]">{payment.transactionId}</td>
                                            <td className="px-4 py-4 text-sm text-gray-800 truncate">{payment.customerEmail}</td>
                                            <td className="px-4 py-4 text-sm text-gray-800 whitespace-nowrap">{payment.policyTitle}</td>
                                            <td className="px-4 py-4 text-sm whitespace-nowrap font-semibold text-green-700">${payment.amount?.toFixed(2)} {payment.currency?.toUpperCase()}</td>
                                            <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">
                                                {new Date(payment.paymentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                                    Success
                                                </span>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card Layout */}
                        <div className="md:hidden flex flex-col gap-4">
                            {payments.map(payment => (
                                <motion.div
                                    key={payment.transactionId || payment._id}
                                    className="w-full p-5 rounded-2xl shadow-lg border border-gray-200 bg-white hover:shadow-xl flex flex-col gap-3 transition-all duration-200"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div className="flex justify-between items-center">
                                        <p className="font-bold text-lg text-gray-800 truncate">
                                            {payment.policyTitle}
                                        </p>
                                        <span className="px-3 py-1 rounded-full capitalize font-medium text-sm bg-green-100 text-green-800">
                                            Success
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-700 space-y-1">
                                        <p><span className="font-semibold">Customer:</span> {payment.customerEmail}</p>
                                        <p><span className="font-semibold">Amount:</span> <span className="text-green-700 font-semibold">${payment.amount?.toFixed(2)} {payment.currency?.toUpperCase()}</span></p>
                                        <p><span className="font-semibold">Date:</span> {new Date(payment.paymentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                                        <p className="break-all"><span className="font-semibold">Txn ID:</span> {payment.transactionId}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </>
                )}
            </motion.div>
        </>
    );
};

export default ManageTransactions;
