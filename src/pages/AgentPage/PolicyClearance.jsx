import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { Loader2, Eye, Check, X, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog } from '@headlessui/react';
import Swal from 'sweetalert2';
import { axiosSecure } from '../../hooks/useAxiosSecure'; // Your authenticated Axios instance
import useAuth from '../../hooks/useAuth'; // To get agent's email and user info

export default function AgentPolicyClearancePage() {
    const { user } = useAuth(); // Get logged-in user (agent) info
    const queryClient = useQueryClient();

    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedClaimDetails, setSelectedClaimDetails] = useState(null);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectionFeedback, setRejectionFeedback] = useState('');
    const [claimToReject, setClaimToReject] = useState(null);

    // 1. Fetch all claims assigned to the logged-in agent
    const {
        data: claims = [],
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: ['agentSpecificClaims', user?.email], // Query key includes agent's email
        queryFn: async () => {
            if (!user?.email) return []; // Don't fetch if user email is not available
            const res = await axiosSecure.get(`/claims/agent/${user.email}`); // Use the new agent-specific API
            // Filter to only show pending claims for review by the agent
            return res.data.filter(claim => claim.claimStatus === 'Pending');
        },
        enabled: !!user?.email, // Only enable query if user email exists
        staleTime: 60 * 1000, // Data fresh for 1 minute
    });

    // Mutation for updating claim status (Approve/Reject)
    const updateClaimStatusMutation = useMutation({
        mutationFn: async ({ claimId, status, feedback = '' }) => {
            const res = await axiosSecure.patch(`/claims/status/${claimId}`, { status, feedback });
            return res.data;
        },
        onSuccess: (data, variables) => {
            Swal.fire({
                toast: true,
                position: "top-end",
                icon: "success",
                title: data.message || `Claim ${variables.status} successfully!`,
                showConfirmButton: false,
                timer: 1500
            });
            setIsDetailsModalOpen(false); // Close modal if open
            setIsRejectModalOpen(false); // Close reject modal if open
            setRejectionFeedback(''); // Clear feedback
            refetch(); // Refetch claims after update (important for agent's view)
            // Optionally, if the customer's claim page also needs to update quickly,
            // you might invalidate their query too:
            // queryClient.invalidateQueries(['userClaims', selectedClaimDetails?.customerEmail]);
        },
        onError: (err) => {
            console.error("Error updating claim status:", err);
            Swal.fire({
                position: "top-end",
                icon: "error",
                title: err.response?.data?.message || "Failed to update claim status.",
                showConfirmButton: false,
                timer: 2000
            });
        },
    });

    const handleViewDetails = async (claim) => {
        // For now, assuming 'claims' array has all necessary details.
        setSelectedClaimDetails(claim);
        setIsDetailsModalOpen(true);
    };

    const handleApproveClaim = (claimId) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "Do you want to approve this claim?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#10B981', // Tailwind green
            cancelButtonColor: '#EF4444', // Tailwind red
            confirmButtonText: 'Yes, approve it!'
        }).then((result) => {
            if (result.isConfirmed) {
                updateClaimStatusMutation.mutate({ claimId, status: 'Approved' });
            }
        });
    };

    const handleRejectClaimInitiate = (claim) => {
        setClaimToReject(claim);
        setIsRejectModalOpen(true);
    };

    const handleRejectClaimSubmit = (e) => {
        e.preventDefault();
        if (!rejectionFeedback.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Feedback Required',
                text: 'Please provide a reason for rejecting the claim.',
                confirmButtonColor: '#F59E0B',
            });
            return;
        }
        updateClaimStatusMutation.mutate({
            claimId: claimToReject._id,
            status: 'Rejected',
            feedback: rejectionFeedback
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="h-10 w-10 animate-spin text-teal-500" />
                <p className="text-gray-600 ml-3 text-lg">Loading assigned claim requests...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-10">
                <p className="text-red-500 text-lg">Error loading claims: {error.message}</p>
                <button onClick={() => refetch()} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
                    Retry
                </button>
            </div>
        );
    }

    return (
        <motion.div
            className="max-w-7xl mx-auto p-4 sm:p-6 bg-white rounded-3xl shadow-2xl my-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Helmet>
                <title>NeoTakaful | Assigned Claims</title>
            </Helmet>

            <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent mb-8 text-center">
                Assigned Policy Claims
            </h1>

            {claims.length === 0 ? (
                <p className="text-center text-gray-600 text-lg py-10">You have no pending claim requests assigned to you at this time.</p>
            ) : (
                <>
                    {/* Desktop Table */}
                    <div className="overflow-x-auto hidden md:block">
                        <table className="min-w-full bg-white rounded-xl shadow-md overflow-hidden">
                            <thead className="bg-gray-100 border-b border-gray-200">
                                <tr>
                                    <th className="py-3 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="py-3 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Policy Title
                                    </th>
                                    <th className="py-3 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Claimed At
                                    </th>
                                    <th className="py-3 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="py-3 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {claims.map((claim) => (
                                    <tr key={claim._id} className="hover:bg-gray-50 transition-colors duration-150">
                                        <td className="py-4 px-6 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center gap-2">
                                            <img
                                                src={claim.customerImg || `https://placehold.co/40x40/E0F2F7/000?text=${claim.customerName?.charAt(0) || 'U'}`}
                                                alt={claim.customerName || 'User'}
                                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-purple-500 object-cover"
                                            />
                                            <span>{claim.customerName || 'N/A'}</span>
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-700">
                                            {claim.policyTitle || 'N/A'}
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-700">
                                            {new Date(claim.claimedAt).toLocaleDateString()}
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${claim.claimStatus === 'Approved' ? 'bg-green-100 text-green-800' :
                                                claim.claimStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                {claim.claimStatus}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap text-sm font-medium flex gap-2 items-center">
                                            <motion.button
                                                onClick={() => handleViewDetails(claim)}
                                                className="text-blue-600 hover:text-blue-800 transition-colors duration-200 p-2 rounded-full hover:bg-blue-50"
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                title="View Details"
                                            >
                                                <Eye size={20} />
                                            </motion.button>
                                            {/* Only show action buttons if status is Pending */}
                                            {claim.claimStatus === 'Pending' && (
                                                <>
                                                    <motion.button
                                                        onClick={() => handleApproveClaim(claim._id)}
                                                        className="text-green-600 hover:text-green-800 transition-colors duration-200 p-2 rounded-full hover:bg-green-50"
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        title="Approve Claim"
                                                        disabled={updateClaimStatusMutation.isPending}
                                                    >
                                                        <Check size={20} />
                                                    </motion.button>
                                                    <motion.button
                                                        onClick={() => handleRejectClaimInitiate(claim)}
                                                        className="text-red-600 hover:text-red-800 transition-colors duration-200 p-2 rounded-full hover:bg-red-50"
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        title="Reject Claim"
                                                        disabled={updateClaimStatusMutation.isPending}
                                                    >
                                                        <X size={20} />
                                                    </motion.button>
                                                </>
                                            )}
                                            {/* Always show document link if available */}
                                            {claim.documentUrl && (
                                                <motion.a
                                                    href={claim.documentUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-purple-600 hover:text-purple-800 transition-colors duration-200 p-2 rounded-full hover:bg-purple-50"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    title="View Document"
                                                >
                                                    <FileText size={20} />
                                                </motion.a>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card Layout */}
                    <div className="md:hidden flex flex-col gap-4">
                        {claims.map((claim) => {
                            const isPending = claim.claimStatus === 'Pending';
                            return (
                                <motion.div
                                    key={claim._id}
                                    whileHover={isPending ? { scale: 1.02 } : {}}
                                    whileTap={isPending ? { scale: 0.98 } : {}}
                                    onClick={isPending ? () => handleViewDetails(claim) : undefined}
                                    className={`w-full p-4 rounded-2xl shadow-md border flex flex-col gap-3 transition-all ${isPending
                                        ? 'bg-white hover:shadow-lg cursor-pointer'
                                        : 'bg-gray-100 cursor-not-allowed opacity-80'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={claim.customerImg || `https://placehold.co/56x56/E0F2F7/000?text=${claim.customerName?.charAt(0) || 'U'}`}
                                            alt={claim.customerName || 'User'}
                                            className="w-14 h-14 rounded-full border-2 border-purple-500 shadow-md object-cover"
                                        />
                                        <div className="flex-1 text-left">
                                            <p className="font-semibold text-lg text-gray-800">{claim.customerName}</p>
                                            <p className="text-sm text-gray-500 break-all">{claim.customerEmail}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                                        <span
                                            className={`text-sm px-3 py-1 rounded-full capitalize font-medium ${claim.claimStatus === 'Approved' ? 'bg-green-100 text-green-800' :
                                                claim.claimStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}
                                        >
                                            {claim.claimStatus}
                                        </span>
                                        <span className="text-sm text-gray-500 whitespace-nowrap">
                                            Claimed: {new Date(claim.claimedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="mt-2 text-sm text-gray-600">
                                        <p><strong>Policy:</strong> {claim.policyTitle}</p>
                                    </div>

                                    {/* Actions for Mobile Card */}
                                    <div className="flex flex-wrap gap-2 mt-3 justify-end">
                                        <motion.button
                                            onClick={(e) => { e.stopPropagation(); handleViewDetails(claim); }}
                                            className="flex-grow px-3 py-1 rounded-md bg-blue-500 text-white text-sm shadow hover:bg-blue-600 whitespace-nowrap"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            Details
                                        </motion.button>
                                        {isPending && (
                                            <>
                                                <motion.button
                                                    onClick={(e) => { e.stopPropagation(); handleApproveClaim(claim._id); }}
                                                    className="flex-grow px-3 py-1 rounded-md bg-green-500 text-white text-sm shadow hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    disabled={updateClaimStatusMutation.isPending}
                                                >
                                                    Approve
                                                </motion.button>
                                                <motion.button
                                                    onClick={(e) => { e.stopPropagation(); handleRejectClaimInitiate(claim); }}
                                                    className="flex-grow px-3 py-1 rounded-md bg-red-500 text-white text-sm shadow hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    disabled={updateClaimStatusMutation.isPending}
                                                >
                                                    Reject
                                                </motion.button>
                                            </>
                                        )}
                                        {claim.documentUrl && (
                                            <motion.a
                                                href={claim.documentUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-grow px-3 py-1 rounded-md bg-purple-500 text-white text-sm shadow hover:bg-purple-600 whitespace-nowrap text-center"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                Document
                                            </motion.a>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* Claim Details Modal */}
            <AnimatePresence>
                {isDetailsModalOpen && selectedClaimDetails && (
                    <Dialog
                        open={true}
                        onClose={() => setIsDetailsModalOpen(false)}
                        className="fixed z-50 inset-0 overflow-y-auto bg-black bg-opacity-40 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white w-full max-w-lg p-6 rounded-2xl shadow-2xl relative max-h-[80vh] overflow-y-auto"
                        >
                            <button
                                onClick={() => setIsDetailsModalOpen(false)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition"
                            >
                                <X size={24} />
                            </button>

                            <Dialog.Title className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent mb-4">
                                Claim Details
                            </Dialog.Title>

                            <div className="space-y-4 text-gray-700 text-sm sm:text-base">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={selectedClaimDetails.customerImg || `https://placehold.co/60x60/E0F2F7/000?text=${selectedClaimDetails.customerName?.charAt(0) || 'U'}`}
                                        alt={selectedClaimDetails.customerName || 'User'}
                                        className="w-16 h-16 rounded-full border-2 border-purple-500 object-cover"
                                    />
                                    <div>
                                        <p className="font-medium text-gray-900"><strong>Customer Name:</strong> {selectedClaimDetails.customerName}</p>
                                        <p className="text-sm text-gray-600"><strong>Customer Email:</strong> {selectedClaimDetails.customerEmail}</p>
                                    </div>
                                </div>
                                <p><strong>Policy Title:</strong> {selectedClaimDetails.policyTitle}</p>
                                <p><strong>Claimed At:</strong> {new Date(selectedClaimDetails.claimedAt).toLocaleString()}</p>
                                <p><strong>Current Status:</strong> <span className={`px-3 py-1 text-sm font-medium rounded-full ${selectedClaimDetails.claimStatus === 'Approved' ? 'bg-green-100 text-green-800' :
                                    selectedClaimDetails.claimStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>{selectedClaimDetails.claimStatus}</span></p>
                                <p><strong>Reason for Claim:</strong> {selectedClaimDetails.reason}</p>
                                {selectedClaimDetails.documentUrl && (
                                    <p><strong>Supporting Document:</strong> <a href={selectedClaimDetails.documentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">View Document <FileText size={16} /></a></p>
                                )}
                                {selectedClaimDetails.claimStatus === 'Rejected' && selectedClaimDetails.agentFeedback && (
                                    <p><strong>Agent Feedback:</strong> <span className="text-red-500 italic">{selectedClaimDetails.agentFeedback}</span></p>
                                )}
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                {selectedClaimDetails.claimStatus === 'Pending' && (
                                    <>
                                        <motion.button
                                            onClick={() => handleApproveClaim(selectedClaimDetails._id)}
                                            className="px-5 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition-all duration-200"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            disabled={updateClaimStatusMutation.isPending}
                                        >
                                            Approve
                                        </motion.button>
                                        <motion.button
                                            onClick={() => handleRejectClaimInitiate(selectedClaimDetails)}
                                            className="px-5 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition-all duration-200"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            disabled={updateClaimStatusMutation.isPending}
                                        >
                                            Reject
                                        </motion.button>
                                    </>
                                )}
                                <motion.button
                                    type="button"
                                    onClick={() => setIsDetailsModalOpen(false)}
                                    className="px-5 py-2 bg-gray-400 text-white rounded-lg shadow-md hover:bg-gray-500 transition-all duration-200"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Close
                                </motion.button>
                            </div>
                        </motion.div>
                    </Dialog>
                )}
            </AnimatePresence>

            {/* Reject Claim Modal with Feedback */}
            <AnimatePresence>
                {isRejectModalOpen && claimToReject && (
                    <Dialog
                        open={true}
                        onClose={() => setIsRejectModalOpen(false)}
                        className="fixed z-50 inset-0 overflow-y-auto bg-black bg-opacity-40 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white w-full max-w-sm p-6 rounded-2xl shadow-2xl relative"
                        >
                            <button
                                onClick={() => setIsRejectModalOpen(false)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition"
                            >
                                <X size={24} />
                            </button>

                            <Dialog.Title className="text-xl font-bold text-red-600 mb-4">
                                Reject Claim for {claimToReject?.policyTitle}
                            </Dialog.Title>

                            <form onSubmit={handleRejectClaimSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-1">Reason for Rejection</label>
                                    <textarea
                                        id="feedback"
                                        value={rejectionFeedback}
                                        onChange={(e) => setRejectionFeedback(e.target.value)}
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
                                        placeholder="Provide specific feedback for the customer..."
                                        required
                                    ></textarea>
                                </div>
                                <div className="flex justify-end gap-3">
                                    <motion.button
                                        type="button"
                                        onClick={() => setIsRejectModalOpen(false)}
                                        className="px-4 py-2 bg-gray-400 text-white rounded-lg shadow-md hover:bg-gray-500 transition-all duration-200"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Cancel
                                    </motion.button>
                                    <motion.button
                                        type="submit"
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition-all duration-200"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        disabled={updateClaimStatusMutation.isPending}
                                    >
                                        {updateClaimStatusMutation.isPending ? 'Rejecting...' : 'Reject Claim'}
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    </Dialog>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
