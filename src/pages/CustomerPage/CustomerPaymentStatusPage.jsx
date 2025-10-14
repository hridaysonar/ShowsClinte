
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router'; // For navigation
import useAuth from '../../hooks/useAuth'; // Assuming you have this hook
import { axiosSecure } from '../../hooks/useAxiosSecure'; // Ensure this import path is correct

const CustomerPaymentStatusPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth(); // Get logged-in user
    const [filterStatus, setFilterStatus] = useState('Approved'); // Filter by 'Approved' by default
    const [selectedFrequency, setSelectedFrequency] = useState('monthly'); // 'monthly' or 'annual'

    const userEmail = user?.email;

    const { data: applications = [], isLoading, error } = useQuery({
        queryKey: ['userApplications', userEmail],
        queryFn: async () => {
            if (!userEmail) {
                console.warn("No user email available. Cannot fetch applications.");
                return [];
            }
            // Fetch all applications, then filter on the frontend
            const res = await axiosSecure.get('/applications');
            return res.data || [];
        },
        enabled: !!userEmail,
    });

    // Filter applications based on status and user email
    const filteredApplications = applications.filter(app =>
        app.personal?.email === userEmail && app.status === filterStatus
    );

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="h-10 w-10 animate-spin text-teal-500" />
                <p className="text-gray-600 ml-3 text-lg">Loading policies...</p>
            </div>
        );
    }

    if (error) {
        return <p className="text-red-600 text-center">Error fetching policies: {error.message}</p>;
    }

    const handlePayClick = (applicationId) => {
        navigate(`/payment/${applicationId}`); // Redirect to payment page with application ID
    };

    return (
        <>
            <Helmet>
                <title>Payment Status</title>
            </Helmet>

            <motion.div
                className="max-w-7xl mx-auto p-4 sm:p-6 bg-white rounded-3xl shadow-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-teal-600 to-blue-500 bg-clip-text text-transparent mb-6">
                    Policy Payment Status
                </h1>

                {/* Filter and Frequency Selection */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                        <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">Filter by Status:</label>
                        <select
                            id="statusFilter"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="Approved">Approved</option>
                            <option value="Pending">Pending</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Active">Active</option> {/* If you use 'Active' for paid policies */}
                        </select>
                    </div>
                    <div className="flex-1">
                        <label htmlFor="frequencySelect" className="block text-sm font-medium text-gray-700 mb-1">Premium Frequency:</label>
                        <select
                            id="frequencySelect"
                            value={selectedFrequency}
                            onChange={(e) => setSelectedFrequency(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="monthly">Monthly</option>
                            <option value="annual">Annual</option>
                        </select>
                    </div>
                </div>

                {filteredApplications.length === 0 ? (
                    <p className="text-center text-gray-600 text-lg py-10">
                        {filterStatus === 'Approved' ? 'No approved policies found for your account.' : `No policies with status "${filterStatus}" found.`}
                    </p>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="overflow-x-auto hidden md:block">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-3 text-left text-xs sm:px-4 sm:text-sm font-semibold text-gray-700 whitespace-nowrap">Customer</th>
                                        <th className="px-3 py-3 text-left text-xs sm:px-4 sm:text-sm font-semibold text-gray-700 whitespace-nowrap">Policy</th>
                                        <th className="px-3 py-3 text-left text-xs sm:px-4 sm:text-sm font-semibold text-gray-700 whitespace-nowrap">Premium</th>
                                        <th className="px-3 py-3 text-left text-xs sm:px-4 sm:text-sm font-semibold text-gray-700 whitespace-nowrap">Payment Status</th>
                                        <th className="px-3 py-3 text-left text-xs sm:px-4 sm:text-sm font-semibold text-gray-700 whitespace-nowrap">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredApplications.map(app => (
                                        <tr key={app._id} className="hover:bg-gray-50 transition-all">
                                            <td className="px-3 py-4 text-sm sm:px-4 sm:text-base whitespace-nowrap flex items-center gap-2">
                                                <img
                                                    src={app.personal?.userImg || `https://placehold.co/40x40/E0F2F7/000?text=${app.personal?.name?.charAt(0) || 'U'}`}
                                                    alt={app.personal?.name || 'User'}
                                                    className="w-8 h-8 rounded-full object-cover border border-teal-300"
                                                />
                                                <span>{app.personal?.name}</span>
                                            </td>
                                            <td className="px-3 py-4 text-xs sm:px-4 sm:text-sm whitespace-nowrap">{app.policyTitle}</td>
                                            <td className="px-3 py-4 text-xs sm:px-4 sm:text-sm whitespace-nowrap">
                                                ${selectedFrequency === 'monthly' ? app.quoteDetails?.monthlyContribution : app.quoteDetails?.annualContribution}
                                                /{selectedFrequency === 'monthly' ? 'mo' : 'yr'}
                                            </td>
                                            <td className="px-3 py-4 sm:px-4">
                                                <span
                                                    className={`px-2 py-0.5 text-xs sm:px-3 sm:py-1 sm:text-sm font-medium rounded-full ${app.paymentStatus === 'Due'
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-green-100 text-green-800'
                                                        }`}
                                                >
                                                    {app.paymentStatus || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-3 py-4 sm:px-4">
                                                {app.paymentStatus === 'Due' && (
                                                    <motion.button
                                                        onClick={() => handlePayClick(app._id)}
                                                        className="px-3 py-1 rounded-md bg-blue-600 text-white text-xs sm:text-sm shadow hover:bg-blue-700 whitespace-nowrap"
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        Pay Now
                                                    </motion.button>
                                                )}
                                                {app.paymentStatus === 'Paid' && (
                                                    <span className="text-green-600 text-sm">Paid</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card Layout */}
                        <div className="md:hidden flex flex-col gap-3">
                            {filteredApplications.map(app => (
                                <motion.div
                                    key={app._id}
                                    className="w-full p-4 rounded-2xl shadow-md border bg-white flex flex-col gap-2"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={app.personal?.userImg || `https://placehold.co/56x56/E0F2F7/000?text=${app.personal?.name?.charAt(0) || 'U'}`}
                                            alt={app.personal?.name || 'User'}
                                            className="w-14 h-14 rounded-full border-2 border-teal-500 shadow-md object-cover"
                                        />
                                        <div className="flex-1 text-left">
                                            <p className="font-semibold text-lg text-gray-800">{app.personal?.name}</p>
                                            <p className="text-sm text-gray-500">{app.policyTitle}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                                        <span className="text-sm text-gray-700 whitespace-nowrap">
                                            Premium: ${selectedFrequency === 'monthly' ? app.quoteDetails?.monthlyContribution : app.quoteDetails?.annualContribution}
                                            /{selectedFrequency === 'monthly' ? 'mo' : 'yr'}
                                        </span>
                                        <span
                                            className={`text-sm px-3 py-1 rounded-full capitalize font-medium ${app.paymentStatus === 'Due'
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-green-100 text-green-800'
                                                }`}
                                        >
                                            {app.paymentStatus || 'N/A'}
                                        </span>
                                    </div>
                                    {app.paymentStatus === 'Due' && (
                                        <motion.button
                                            onClick={() => handlePayClick(app._id)}
                                            className="mt-3 px-4 py-2 rounded-md bg-blue-600 text-white text-sm shadow hover:bg-blue-700"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            Pay Now
                                        </motion.button>
                                    )}
                                    {app.paymentStatus === 'Paid' && (
                                        <span className="text-green-600 text-sm text-center mt-3">Paid</span>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </>
                )}
            </motion.div>
        </>
    );
};

export default CustomerPaymentStatusPage;
