import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { Loader2, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Dialog } from '@headlessui/react';
import useAuth from '../../hooks/useAuth';
import { axiosSecure } from '../../hooks/useAxiosSecure';
import Swal from 'sweetalert2';

const AssignedCustomers = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false); // State for rejection feedback modal
    const [rejectFeedback, setRejectFeedback] = useState(''); // State for rejection feedback text
    const [rejectAssignmentId, setRejectAssignmentId] = useState(null); // State for the assignment being rejected
    const [rejectApplicationId, setRejectApplicationId] = useState(null); // State for the application being rejected

    const agentEmail = user?.email;

    const { data: assignedCustomers = [], isLoading, error } = useQuery({
        queryKey: ['assignedCustomers', agentEmail],
        queryFn: async () => {
            if (!agentEmail) {
                console.warn('No agent email found.');
                return [];
            }

            const res = await axiosSecure(`/get-all-data-for-agents/${user?.email}`);
            return res.data || [];
        },
        enabled: !!agentEmail,
    });

    const updateAssignedCustomerStatus = useMutation({
        mutationFn: async ({ assignmentId, applicationId, newStatus, policyId, rejectFeedback }) => {
            // Update dataForAgents collection
            const updatePayload = { status: newStatus };
            if (rejectFeedback) {
                updatePayload.rejectFeedback = rejectFeedback;
            }

            const dataForAgentsRes = await axiosSecure.patch(`/dataForAgents/${assignmentId}`, updatePayload);

            // Update applications collection
            const applicationUpdatePayload = { status: newStatus };
            if (rejectFeedback) {
                applicationUpdatePayload.rejectFeedback = rejectFeedback;
            }

            const applicationRes = await axiosSecure.patch(`/applicationUpdate/${applicationId}`, applicationUpdatePayload);

            return { dataForAgentsRes: dataForAgentsRes.data, applicationRes: applicationRes.data, newStatus, policyId };
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries(['assignedCustomers', agentEmail]);

            // SweetAlert for successful status change
            Swal.fire({
                icon: 'success',
                title: 'Status Updated!',
                text: `Customer status changed to ${variables.newStatus}${variables.newStatus === 'Rejected' ? '. Feedback recorded.' : '.'}`,
                timer: 2000,
                showConfirmButton: false,
            });

            if (variables.newStatus === 'Approved' && variables.policyId) {
                axiosSecure
                    .patch(`/policies/${variables.policyId}`, { $inc: { purchaseCount: 1 } })
                    .then(() => console.log(`Policy ${variables.policyId} purchase count updated.`))
                    .catch((err) => console.error('Error updating policy count:', err.message));
            }

            setIsRejectModalOpen(false);
            setRejectFeedback('');
            setRejectAssignmentId(null);
            setRejectApplicationId(null);
        },
        onError: (err) => {
            console.error('Status update failed:', err.message);
            Swal.fire({
                icon: 'error',
                title: 'Update Failed!',
                text: `Failed to update status: ${err.message}`,
            });
            setIsRejectModalOpen(false);
            setRejectFeedback('');
            setRejectAssignmentId(null);
            setRejectApplicationId(null);
        },
    });

    const handleStatusChange = (assignmentId, applicationId, newStatus, policyId) => {
        if (newStatus === 'Rejected') {
            setRejectAssignmentId(assignmentId);
            setRejectApplicationId(applicationId);
            setIsRejectModalOpen(true);
        } else {
            updateAssignedCustomerStatus.mutate({ assignmentId, applicationId, newStatus, policyId });
        }
    };

    const handleSubmitRejectFeedback = () => {
        if (!rejectFeedback.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Feedback Required',
                text: 'Please provide a reason for rejecting the application.',
            });
            return;
        }

        updateAssignedCustomerStatus.mutate({
            assignmentId: rejectAssignmentId,
            applicationId: rejectApplicationId,
            newStatus: 'Rejected',
            policyId: null, // Policy ID not needed for rejection
            rejectFeedback: rejectFeedback.trim(),
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="h-10 w-10 animate-spin text-teal-500" />
                <p className="text-gray-600 ml-3 text-lg">Loading assigned customers...</p>
            </div>
        );
    }

    if (error) {
        return <p className="text-red-600 text-center">Error: {error.message}</p>;
    }

    return (
        <>
            <Helmet>
                <title>Assigned Customers</title>
            </Helmet>

            <motion.div
                className="max-w-7xl mx-auto p-4 sm:p-6 bg-white rounded-3xl shadow-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text text-transparent mb-6">
                    Tur Gide Customers
                </h1>

                {assignedCustomers.length === 0 ? (
                    <p className="text-center text-gray-600 text-lg py-10">No customers assigned to you yet.</p>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="overflow-x-auto hidden md:block">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700">Customer Name</th>
                                        <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                                        <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700">Policy</th>
                                        <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                        <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {assignedCustomers.map((customer) => (
                                        <tr key={customer._id}>
                                            <td className="px-3 py-4 text-sm flex items-center">
                                                {customer.personal?.userImg && (
                                                    <img
                                                        src={customer.personal.userImg}
                                                        alt={customer.customerName}
                                                        className="w-8 h-8 rounded-full mr-2 object-cover"
                                                    />
                                                )}
                                                {customer.customerName}
                                            </td>
                                            <td className="px-3 py-4 text-sm">{customer.customerEmail}</td>
                                            <td className="px-3 py-4 text-sm">{customer.policyTitle}</td>
                                            <td className="px-3 py-4">
                                                <select
                                                    value={customer.status}
                                                    onChange={(e) =>
                                                        handleStatusChange(customer._id, customer.applicationId, e.target.value, customer.policyId)
                                                    }
                                                    className={`px-2 py-1 border rounded-md text-sm ${customer.status === 'Pending'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : customer.status === 'Approved'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                        }`}
                                                    disabled={updateAssignedCustomerStatus.isLoading}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Approved">Approved</option>
                                                    <option value="Rejected">Rejected</option>
                                                </select>
                                            </td>
                                            <td className="px-3 py-4">
                                                <motion.button
                                                    onClick={() => setSelectedCustomer(customer)}
                                                    className="px-2 py-1 rounded-md bg-blue-500 text-white text-sm hover:bg-blue-600"
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    View Details
                                                </motion.button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile View */}
                        <div className="md:hidden flex flex-col gap-3">
                            {assignedCustomers.map((customer) => (
                                <motion.div
                                    key={customer._id}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setSelectedCustomer(customer)}
                                    className="p-4 bg-white shadow-md rounded-xl border"
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-lg font-semibold flex items-center">
                                                {customer.personal?.userImg && (
                                                    <img
                                                        src={customer.personal.userImg}
                                                        alt={customer.customerName}
                                                        className="w-8 h-8 rounded-full mr-2 object-cover"
                                                    />
                                                )}
                                                {customer.customerName}
                                            </p>
                                            <p className="text-sm text-gray-500">{customer.customerEmail}</p>
                                            <p className="text-sm text-gray-500">Policy: {customer.policyTitle}</p>
                                        </div>
                                        <select
                                            value={customer.status}
                                            onChange={(e) =>
                                                handleStatusChange(customer._id, customer.applicationId, e.target.value, customer.policyId)
                                            }
                                            onClick={(e) => e.stopPropagation()}
                                            disabled={updateAssignedCustomerStatus.isLoading}
                                            className={`text-xs rounded-full px-3 py-1 font-medium ${customer.status === 'Pending'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : customer.status === 'Approved'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                }`}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Approved">Approved</option>
                                            <option value="Rejected">Rejected</option>
                                        </select>
                                    </div>

                                    <motion.button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedCustomer(customer);
                                        }}
                                        className="mt-3 px-4 py-2 rounded-md bg-blue-500 text-white text-sm hover:bg-blue-600"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        View Details
                                    </motion.button>
                                </motion.div>
                            ))}
                        </div>
                    </>
                )}

                {/* Modal for Customer Details */}
                {selectedCustomer && (
                    <Dialog
                        open={true}
                        onClose={() => setSelectedCustomer(null)}
                        className="fixed z-50 inset-0 overflow-y-auto bg-black/40 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white w-full max-w-lg p-6 rounded-2xl shadow-xl relative"
                        >
                            <button
                                onClick={() => setSelectedCustomer(null)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
                            >
                                <X size={24} />
                            </button>

                            <Dialog.Title className="text-xl font-bold mb-4">
                                {selectedCustomer.customerName}'s Details
                            </Dialog.Title>

                            <div className="space-y-3 text-sm text-gray-700 overflow-y-auto max-h-[70vh] pr-2">
                                {selectedCustomer.personal?.userImg && (
                                    <>
                                        <img
                                            src={selectedCustomer.personal.userImg}
                                            alt={`${selectedCustomer.customerName}'s profile`}
                                            className="rounded-full w-24 h-24 object-cover mx-auto mb-4"
                                        />
                                        <hr className="border-gray-200" />
                                    </>
                                )}
                                <p>
                                    <strong>Email:</strong> {selectedCustomer.customerEmail}
                                </p>
                                <p>
                                    <strong>Phone:</strong> {selectedCustomer.personal?.phone || 'N/A'}
                                </p>
                                <p>
                                    <strong>Policy:</strong> {selectedCustomer.policyTitle}
                                </p>
                                <p>
                                    <strong>Status:</strong>{' '}
                                    <span
                                        className={`px-3 py-1 text-sm rounded-full ${selectedCustomer.status === 'Pending'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : selectedCustomer.status === 'Approved'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}
                                    >
                                        {selectedCustomer.status}
                                    </span>
                                </p>
                                {selectedCustomer.status === 'Rejected' && selectedCustomer.rejectFeedback && (
                                    <p>
                                        <strong>Rejection Feedback:</strong> {selectedCustomer.rejectFeedback}
                                    </p>
                                )}
                                {selectedCustomer.personal && (
                                    <>
                                        <hr className="border-gray-200" />
                                        <p>
                                            <strong>Address:</strong> {selectedCustomer.personal.address || 'N/A'}
                                        </p>
                                        <p>
                                            <strong>NID:</strong> {selectedCustomer.personal.nid || 'N/A'}
                                        </p>
                                    </>
                                )}

                                {selectedCustomer.nominee && (
                                    <>
                                        <hr className="border-gray-200" />
                                        <p>
                                            <strong>Nominee Name:</strong> {selectedCustomer.nominee.name || 'N/A'}
                                        </p>
                                        <p>
                                            <strong>Relationship:</strong> {selectedCustomer.nominee.relationship || 'N/A'}
                                        </p>
                                    </>
                                )}

                                {selectedCustomer.healthDisclosure?.length > 0 && (
                                    <>
                                        <hr className="border-gray-200" />
                                        <p>
                                            <strong>Health Issues:</strong>{' '}
                                            {selectedCustomer.healthDisclosure.join(', ') || 'None'}
                                        </p>
                                    </>
                                )}

                                {selectedCustomer.quoteDetails && (
                                    <>
                                        <hr className="border-gray-200" />
                                        <h3 className="font-semibold text-base mt-4 mb-2 text-blue-700">Policy & Quote Details</h3>
                                        {selectedCustomer.policyImg && (
                                            <img
                                                src={selectedCustomer.policyImg}
                                                alt="Policy"
                                                className="rounded-xl w-full h-40 object-cover mt-2"
                                            />
                                        )}
                                        <p>
                                            <strong>Age at Application:</strong> {selectedCustomer.quoteDetails.age || 'N/A'}
                                        </p>
                                        <p>
                                            <strong>Gender:</strong> {selectedCustomer.quoteDetails.gender || 'N/A'}
                                        </p>
                                        <p>
                                            <strong>Coverage Amount:</strong> Tk{Number(selectedCustomer.quoteDetails.coverageAmount).toLocaleString() || 'N/A'}
                                        </p>
                                        <p>
                                            <strong>Duration:</strong> {selectedCustomer.quoteDetails.duration || 'N/A'} Years
                                        </p>
                                        <p>
                                            <strong>Smoker Status:</strong> {selectedCustomer.quoteDetails.smoker || 'N/A'}
                                        </p>
                                        <p>
                                            <strong>Monthly Contribution:</strong>{' '}
                                            <span className="font-bold text-green-600">
                                                Tk{Number(selectedCustomer.quoteDetails.monthlyContribution).toLocaleString() || 'N/A'}
                                            </span>
                                        </p>
                                        <p>
                                            <strong>Annual Contribution:</strong>{' '}
                                            <span className="font-bold text-green-600">
                                                Tk{Number(selectedCustomer.quoteDetails.annualContribution).toLocaleString() || 'N/A'}
                                            </span>
                                        </p>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </Dialog>
                )}

                {/* Modal for Rejection Feedback */}
                {isRejectModalOpen && (
                    <Dialog
                        open={true}
                        onClose={() => setIsRejectModalOpen(false)}
                        className="fixed z-50 inset-0 overflow-y-auto bg-black/40 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white w-full max-w-md p-6 rounded-2xl shadow-2xl relative"
                        >
                            <button
                                onClick={() => setIsRejectModalOpen(false)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition"
                            >
                                <X size={24} />
                            </button>

                            <Dialog.Title className="text-2xl font-bold text-gray-800 mb-4">
                                Provide Rejection Feedback
                            </Dialog.Title>

                            <div className="space-y-4">
                                <p className="text-gray-600">Please provide a reason for rejecting this application:</p>
                                <textarea
                                    value={rejectFeedback}
                                    onChange={(e) => setRejectFeedback(e.target.value)}
                                    className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    rows="4"
                                    placeholder="Enter reason for rejection..."
                                />
                                <div className="flex justify-end gap-2">
                                    <motion.button
                                        onClick={() => setIsRejectModalOpen(false)}
                                        className="px-4 py-2 rounded-md bg-gray-300 text-gray-800 text-sm shadow hover:bg-gray-400"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Cancel
                                    </motion.button>
                                    <motion.button
                                        onClick={handleSubmitRejectFeedback}
                                        className="px-4 py-2 rounded-md bg-red-500 text-white text-sm shadow hover:bg-red-600"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Submit Rejection
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </Dialog>
                )}
            </motion.div>
        </>
    );
};

export default AssignedCustomers;