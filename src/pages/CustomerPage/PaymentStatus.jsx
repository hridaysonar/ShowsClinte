import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import useAuth from '../../hooks/useAuth';
import { axiosSecure } from '../../hooks/useAxiosSecure';





const PaymentStatus = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    // Fetch approved applications for the logged-in user
    // We now assume the backend will provide premiumAmount, paymentFrequency, and paymentStatus
    const {
        data: applications = [], // Renamed from approvedApplications for clarity
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ['userPayments', user?.email],
        queryFn: async () => {
            if (!user?.email) return [];
            // This endpoint should return applications that are 'Approved'
            // AND include 'premiumAmount', 'paymentFrequency', 'paymentStatus' fields
            const res = await axiosSecure(`/applications/${user?.email}/approved-for-payment`);
            console.log(res);

            return res.data;
        },
        enabled: !!user?.email && !loading, // Only run if user email is available and not loading auth
    });

    if (loading || isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-100px)]">
                <span className="loading loading-spinner loading-lg text-indigo-600"></span>
                <p className="text-gray-700 ml-3">Loading payment status...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="text-center py-10 text-red-500 font-semibold">
                Error loading payment status: {error.message}
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-10 text-red-500 text-xl font-semibold">
                Please log in to view your payment status.
            </div>
        );
    }

    const handlePayClick = (application) => {
        // Pass all necessary data to the payment page via state
        navigate('/payment', {
            state: {
                applicationId: application._id,
                policyId: application.policyId,
                policyTitle: application.policyTitle,
                premiumAmount: application.premiumAmount, // Directly from application
                paymentFrequency: application.paymentFrequency, // Directly from application
                userEmail: user.email,
                userName: user.displayName,
            },
        });
    };

    return (
        <motion.div
            className="max-w-7xl mx-auto p-6 bg-white rounded-3xl shadow-2xl my-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent mb-8">
                Payment Status
            </h1>

            {applications.length === 0 ? (
                <p className="text-center text-gray-500 text-lg py-10">
                    No approved policies requiring payment found.
                </p>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-md">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Policy Title</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Premium Amount</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Frequency</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {applications.map((app) => (
                                <motion.tr
                                    key={app._id}
                                    className="hover:bg-gray-50 transition-colors duration-300"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <td className="px-4 py-3 whitespace-nowrap text-gray-800 font-medium">
                                        {app.policyTitle}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                                        ${app.premiumAmount ? app.premiumAmount.toFixed(2) : 'N/A'}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-gray-700 capitalize">
                                        {app.paymentFrequency || 'N/A'}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${app.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {app.paymentStatus || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        {app.paymentStatus === 'Due' && (
                                            <motion.button
                                                onClick={() => handlePayClick(app)}
                                                className="px-4 py-2 bg-gradient-to-r from-teal-500 to-green-600 text-white rounded-lg shadow-md hover:shadow-lg hover:from-teal-600 hover:to-green-700 transition-all duration-300 text-sm"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                Pay Now
                                            </motion.button>
                                        )}
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </motion.div>
    );
};

export default PaymentStatus;