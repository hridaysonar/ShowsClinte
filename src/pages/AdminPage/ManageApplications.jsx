import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { Loader2, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Dialog } from '@headlessui/react';
import { axiosSecure } from '../../hooks/useAxiosSecure';
import Swal from 'sweetalert2';

const ManageApplications = () => {
    const queryClient = useQueryClient();
    const [selectedApp, setSelectedApp] = useState(null); // State for the application opened in the modal
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false); // State for rejection feedback modal
    const [rejectFeedback, setRejectFeedback] = useState(''); // State for rejection feedback text
    const [rejectAppId, setRejectAppId] = useState(null); // State for the application being rejected

    // Query to fetch all applications
    const { data: applications = [], isLoading, error } = useQuery({
        queryKey: ['applications'],
        queryFn: async () => {
            const res = await axiosSecure.get('/applications');
            return res.data || [];
        },
    });

    // Query to fetch all agents
    const { data: agents = [] } = useQuery({
        queryKey: ['agents'],
        queryFn: async () => {
            const res = await axiosSecure.get('/agents');
            return res.data || [];
        },
    });

    // Mutation to update an application
    const updateApplication = useMutation({
        mutationFn: async ({ id, updatesForApplicationUpdate, agentIdForDataForAgents }) => {
            const res = await axiosSecure.patch(`/applicationUpdate/${id}`, updatesForApplicationUpdate);
            return {
                patchResult: res.data,
                originalUpdates: updatesForApplicationUpdate,
                applicationId: id,
                agentIdForDataForAgents: agentIdForDataForAgents
            };
        },
        onSuccess: async (data) => {
            queryClient.invalidateQueries(['applications']);

            const { originalUpdates, applicationId, agentIdForDataForAgents } = data;

            let fullApplicationData = null;
            try {
                const fetchRes = await axiosSecure.get(`/applications/${applicationId}`);
                fullApplicationData = fetchRes.data;
            } catch (fetchError) {
                console.error('Error fetching full application data after update:', fetchError.message);
                Swal.fire({
                    icon: 'error',
                    title: 'Update Failed!',
                    text: 'Could not fetch full application details for agent assignment.',
                });
                setSelectedApp(null);
                setIsRejectModalOpen(false);
                return;
            }

            // Logic for agent assignment
            if (agentIdForDataForAgents && fullApplicationData) {
                const assignedAgent = agents.find(agent => agent._id === agentIdForDataForAgents);

                const agentAssignmentData = {
                    applicationId: fullApplicationData._id,
                    agentId: agentIdForDataForAgents,
                    agentName: assignedAgent?.name || 'Unknown Agent',
                    agentEmail: assignedAgent?.email || 'Unknown Email',
                    customerName: fullApplicationData.personal?.name,
                    customerEmail: fullApplicationData.personal?.email,
                    policyTitle: fullApplicationData.policyTitle,
                    policyId: fullApplicationData.policyId,
                    assignedAt: new Date().toISOString(),
                    personal: fullApplicationData.personal,
                    nominee: fullApplicationData.nominee,
                    healthDisclosure: fullApplicationData.healthDisclosure,
                    policyImg: fullApplicationData.policyImg,
                    quoteDetails: fullApplicationData.quoteDetails,
                };

                try {
                    await axiosSecure.post('/dataForAgents', agentAssignmentData);
                    Swal.fire({
                        icon: 'success',
                        title: 'Application Approved and Agent Assigned!',
                        text: `Application ${applicationId} has been approved and assigned to ${assignedAgent?.name || 'an agent'}.`,
                        timer: 2000,
                        showConfirmButton: false,
                    });
                } catch (assignError) {
                    console.error('Error recording agent assignment in dataForAgents:', assignError.message);
                    Swal.fire({
                        icon: 'error',
                        title: 'Assignment Failed!',
                        text: 'Could not record agent assignment. Please try again.',
                    });
                }
            } else if (originalUpdates.status === 'Rejected') {
                Swal.fire({
                    icon: 'info',
                    title: 'Application Rejected!',
                    text: `Application ${applicationId} has been rejected. Feedback: ${originalUpdates.rejectFeedback || 'No feedback provided.'}`,
                    timer: 2000,
                    showConfirmButton: false,
                });
            } else if (originalUpdates.status === 'Approved') {
                Swal.fire({
                    icon: 'success',
                    title: 'Application Approved!',
                    text: `Application ${applicationId} has been approved.`,
                    timer: 2000,
                    showConfirmButton: false,
                });
            }

            setSelectedApp(null);
            setIsRejectModalOpen(false);
            setRejectFeedback('');
        },
        onError: (mutationError) => {
            console.error('Mutation error:', mutationError.message);
            Swal.fire({
                icon: 'error',
                title: 'Operation Failed!',
                text: `Failed to update application: ${mutationError.message}`,
            });
            setIsRejectModalOpen(false);
            setRejectFeedback('');
        },
    });

    const handleAssignAgentInRow = (appId, agentId, currentStatus) => {
        if (!agentId) return;

        if (currentStatus === 'Approved' || currentStatus === 'Rejected') {
            Swal.fire({
                icon: 'warning',
                title: 'Action Not Allowed',
                text: `Cannot assign agent to application ${appId}: status is already ${currentStatus}.`,
            });
            return;
        }

        updateApplication.mutate({
            id: appId,
            updatesForApplicationUpdate: { paymentStatus: 'Due', agentId: agentId },
            agentIdForDataForAgents: agentId
        });
    };

    const handleRejectInRow = (appId, currentStatus) => {
        if (currentStatus === 'Approved' || currentStatus === 'Rejected') {
            Swal.fire({
                icon: 'warning',
                title: 'Action Not Allowed',
                text: `Cannot reject application ${appId}: status is already ${currentStatus}.`,
            });
            return;
        }
        setRejectAppId(appId);
        setIsRejectModalOpen(true);
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

        updateApplication.mutate({
            id: rejectAppId,
            updatesForApplicationUpdate: { status: 'Rejected', rejectFeedback: rejectFeedback.trim() },
            agentIdForDataForAgents: null
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="h-10 w-10 animate-spin text-teal-500" />
                <p className="text-gray-600 ml-3 text-lg">Loading applications...</p>
            </div>
        );
    }

    if (error) {
        return <p className="text-red-600 text-center">Error fetching applications: {error.message}</p>;
    }

    return (
        <>
            <Helmet>
                <title>Manage Booking</title>
            </Helmet>

            <motion.div
                className="max-w-7xl mx-auto p-4 sm:p-6 bg-white rounded-3xl shadow-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-green-600 to-teal-500 bg-clip-text text-transparent mb-6">
                    Manage Booking
                </h1>

                {applications.length === 0 ? (
                    <p className="text-center text-gray-600 text-lg py-10">No new applications to manage.</p>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="overflow-x-auto hidden md:block">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-3 text-left text-xs sm:px-4 sm:text-sm font-semibold text-gray-700 whitespace-nowrap">Applicant</th>
                                        <th className="px-3 py-3 text-left text-xs sm:px-4 sm:text-sm font-semibold text-gray-700 whitespace-nowrap">Email</th>
                                        <th className="px-3 py-3 text-left text-xs sm:px-4 sm:text-sm font-semibold text-gray-700 whitespace-nowrap">Policy</th>
                                        <th className="px-3 py-3 text-left text-xs sm:px-4 sm:text-sm font-semibold text-gray-700 whitespace-nowrap">Date</th>
                                        <th className="px-3 py-3 text-left text-xs sm:px-4 sm:text-sm font-semibold text-gray-700 whitespace-nowrap">Status</th>
                                        <th className="px-3 py-3 text-left text-xs sm:px-4 sm:text-sm font-semibold text-gray-700 whitespace-nowrap">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {applications.map(app => (
                                        <tr key={app._id} className="hover:bg-gray-50 transition-all">
                                            <td className="px-3 py-4 flex items-center gap-2 sm:px-4">
                                                <img src={app.personal?.userImg || `https://placehold.co/40x40/E0F2F7/000?text=${app.personal?.name?.charAt(0) || 'U'}`} alt={app.personal?.name || 'User'} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-teal-500" />
                                                <span className="text-sm sm:text-base whitespace-nowrap">{app.personal?.name}</span>
                                            </td>
                                            <td className="px-3 py-4 text-xs sm:px-4 sm:text-sm truncate">{app.personal?.email}</td>
                                            <td className="px-3 py-4 text-xs sm:px-4 sm:text-sm whitespace-nowrap">{app.policyTitle}</td>
                                            <td className="px-3 py-4 text-xs sm:px-4 sm:text-sm whitespace-nowrap">{new Date(app.createdAt).toLocaleDateString()}</td>
                                            <td className="px-3 py-4 sm:px-4">
                                                <span
                                                    className={`px-2 py-0.5 text-xs sm:px-3 sm:py-1 sm:text-sm font-medium rounded-full ${app.status === 'Pending'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : app.status === 'Approved' || app.status === 'Assigned'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                        }`}
                                                >
                                                    {app.status}
                                                </span>
                                            </td>
                                            <td className="px-3 py-4 sm:px-4">
                                                <div className="flex flex-col sm:flex-row flex-wrap gap-2 items-stretch sm:items-center">
                                                    <select
                                                        value={app.agentId || ''}
                                                        onChange={(e) => handleAssignAgentInRow(app._id, e.target.value, app.status)}
                                                        className="flex-grow px-2 py-1 border rounded-md text-xs sm:text-sm focus:ring-blue-500 focus:border-blue-500 min-w-[100px] sm:min-w-[120px]"
                                                        disabled={app.status === 'Approved' || app.status === 'Rejected' || updateApplication.isLoading}
                                                    >
                                                        <option value="">
                                                            {app.agentId ? `Assigned: ${agents.find(a => a._id === app.agentId)?.name || 'Unknown Agent'}` : 'Assign Agent'}
                                                        </option>
                                                        {agents.map(agent => (
                                                            <option key={agent._id} value={agent._id}>{agent.name}</option>
                                                        ))}
                                                    </select>

                                                    <motion.button
                                                        onClick={() => handleRejectInRow(app._id, app.status)}
                                                        className="flex-grow px-2 py-1 rounded-md bg-red-500 text-white text-xs sm:text-sm shadow hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        disabled={app.status === 'Approved' || app.status === 'Rejected' || updateApplication.isLoading}
                                                    >
                                                        Reject
                                                    </motion.button>

                                                    <motion.button
                                                        onClick={() => setSelectedApp(app)}
                                                        className="flex-grow px-2 py-1 rounded-md bg-blue-500 text-white text-xs sm:text-sm shadow hover:bg-blue-600 whitespace-nowrap"
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        Details
                                                    </motion.button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card Layout */}
                        <div className="md:hidden flex flex-col gap-3">
                            {applications.map(app => {
                                const isApprovedOrRejected = app.status === 'Approved' || app.status === 'Rejected';

                                return (
                                    <motion.div
                                        key={app._id}
                                        whileHover={!isApprovedOrRejected ? { scale: 1.02 } : {}}
                                        whileTap={!isApprovedOrRejected ? { scale: 0.98 } : {}}
                                        onClick={!isApprovedOrRejected ? () => setSelectedApp(app) : undefined}
                                        className={`w-full p-4 rounded-2xl shadow-md border flex flex-col gap-2 transition-all ${isApprovedOrRejected
                                            ? 'bg-gray-100 cursor-not-allowed opacity-80'
                                            : 'bg-white hover:shadow-lg'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={app.personal?.userImg || `https://placehold.co/56x56/E0F2F7/000?text=${app.personal?.name?.charAt(0) || 'U'}`}
                                                alt={app.personal?.name || 'User'}
                                                className="w-14 h-14 rounded-full border-2 border-green-500 shadow-md"
                                            />
                                            <div className="flex-1 text-left">
                                                <p className="font-semibold text-lg text-gray-800">{app.personal?.name}</p>
                                                <p className="text-sm text-gray-500 break-all">{app.personal?.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                                            <span
                                                className={`text-sm px-3 py-1 rounded-full capitalize font-medium ${app.status === 'Pending'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : app.status === 'Approved' || app.status === 'Assigned'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                    }`}
                                            >
                                                {app.status}
                                            </span>
                                            <span className="text-sm text-gray-500 whitespace-nowrap">
                                                Applied: {new Date(app.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="mt-2 text-sm text-gray-600">
                                            <p><strong>Policy:</strong> {app.policyTitle}</p>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mt-3">
                                            <select
                                                value={app.agentId || ''}
                                                onChange={(e) => handleAssignAgentInRow(app._id, e.target.value, app.status)}
                                                className="flex-grow px-2 py-1 border rounded-md text-xs focus:ring-blue-500 focus:border-blue-500"
                                                disabled={isApprovedOrRejected || updateApplication.isLoading}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <option value="">
                                                    {app.agentId ? `Assigned: ${agents.find(a => a._id === app.agentId)?.name || 'Unknown Agent'}` : 'Assign Agent'}
                                                </option>
                                                {agents.map(agent => (
                                                    <option key={agent._id} value={agent._id}>{agent.name}</option>
                                                ))}
                                            </select>

                                            <motion.button
                                                onClick={(e) => { e.stopPropagation(); handleRejectInRow(app._id, app.status); }}
                                                className="flex-grow px-2 py-1 rounded-md bg-red-500 text-white text-xs shadow hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                disabled={isApprovedOrRejected || updateApplication.isLoading}
                                            >
                                                Reject
                                            </motion.button>

                                            <motion.button
                                                onClick={(e) => { e.stopPropagation(); setSelectedApp(app); }}
                                                className="flex-grow px-2 py-1 rounded-md bg-blue-500 text-white text-xs shadow hover:bg-blue-600 whitespace-nowrap"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                Details
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </>
                )}

                {/* Modal for application details */}
                {selectedApp && (
                    <Dialog open={true} onClose={() => setSelectedApp(null)} className="fixed z-50 inset-0 overflow-y-auto bg-opacity-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white w-full max-w-lg p-6 rounded-2xl shadow-2xl relative"
                        >
                            <button
                                onClick={() => setSelectedApp(null)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition"
                            >
                                <X size={24} />
                            </button>

                            <Dialog.Title className="text-2xl font-bold text-gray-800 mb-4">
                                {selectedApp?.personal?.name}'s Application Details
                            </Dialog.Title>

                            <div className="space-y-4 text-gray-700 text-sm sm:text-base overflow-y-auto max-h-[70vh] pr-2">
                                <h3 className="font-semibold text-lg border-b pb-2 mb-2 text-green-700">Applicant Information</h3>
                                <div className="flex items-center gap-3 mb-4">
                                    <img
                                        src={selectedApp.personal?.userImg || `https://placehold.co/60x60/E0F2F7/000?text=${selectedApp.personal?.name?.charAt(0) || 'U'}`}
                                        alt={selectedApp.personal?.name || 'User'}
                                        className="w-16 h-16 rounded-full border-2 border-teal-500 object-cover"
                                    />
                                    <div>
                                        <p className="font-medium text-gray-900">{selectedApp?.personal?.name}</p>
                                        <p className="text-sm text-gray-600">{selectedApp?.personal?.email}</p>
                                    </div>
                                </div>
                                <p><strong>Phone:</strong> {selectedApp?.personal?.phone || 'N/A'}</p>
                                <p><strong>Address:</strong> {selectedApp?.personal?.address || 'N/A'}</p>
                                <p><strong>NID:</strong> {selectedApp?.personal?.nid || 'N/A'}</p>

                                <h3 className="font-semibold text-lg border-b pb-2 mb-2 text-green-700 pt-4">parents</h3>
                                <p><strong>Name:</strong> {selectedApp?.nominee?.name || 'N/A'}</p>
                                <p><strong>Relationship:</strong> {selectedApp?.nominee?.relationship || 'N/A'}</p>

                                <h3 className="font-semibold text-lg border-b pb-2 mb-2 text-green-700 pt-4">Health Disclosure</h3>
                                <p>{selectedApp?.healthDisclosure?.length > 0 ? selectedApp.healthDisclosure.join(', ') : 'None'}</p>

                                <h3 className="font-semibold text-lg border-b pb-2 mb-2 text-green-700 pt-4">Policy & Quote Details</h3>
                                <p><strong>Policy Title:</strong> {selectedApp?.policyTitle || 'N/A'}</p>
                                {selectedApp?.policyImg && (
                                    <img src={selectedApp.policyImg} alt="Policy" className="rounded-xl w-full h-32 object-cover border mt-2" />
                                )}
                                <p><strong>Applied Date:</strong> {new Date(selectedApp.applicationDate).toLocaleDateString()}</p>
                                <p><strong>Age at Application:</strong> {selectedApp.quoteDetails?.age || 'N/A'}</p>
                                <p><strong>Gender:</strong> {selectedApp.quoteDetails?.gender || 'N/A'}</p>
                                <p><strong>Coverage Amount:</strong> Tk{Number(selectedApp.quoteDetails?.coverageAmount).toLocaleString() || 'N/A'}</p>
                                <p><strong>Duration:</strong> {selectedApp.quoteDetails?.duration || 'N/A'} Years</p>
                                <p><strong>Smoker Status:</strong> {selectedApp.quoteDetails?.smoker || 'N/A'}</p>
                                <p><strong>Estimated Monthly Contribution:</strong> <span className="font-bold text-green-600">Tk{Number(selectedApp.quoteDetails?.monthlyContribution).toLocaleString() || 'N/A'}</span></p>
                                <p><strong>Estimated Annual Contribution:</strong> <span className="font-bold text-green-600">Tk{Number(selectedApp.quoteDetails?.annualContribution).toLocaleString() || 'N/A'}</span></p>

                                <h3 className="font-semibold text-lg border-b pb-2 mb-2 text-green-700 pt-4">Status & Assignment</h3>
                                <p><strong>Current Status:</strong> <span
                                    className={`px-3 py-1 text-sm font-medium rounded-full ${selectedApp.status === 'Pending'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : selectedApp.status === 'Approved' || selectedApp.status === 'Assigned'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                        }`}
                                >
                                    {selectedApp.status}
                                </span></p>
                                {selectedApp.agentId && <p><strong>Assigned Agent:</strong> {agents.find(a => a._id === selectedApp.agentId)?.name || selectedApp.agentId}</p>}
                                {selectedApp.status === 'Rejected' && selectedApp.rejectFeedback && (
                                    <p><strong>Rejection Feedback:</strong> {selectedApp.rejectFeedback}</p>
                                )}
                            </div>
                        </motion.div>
                    </Dialog>
                )}

                {/* Modal for rejection feedback */}
                {isRejectModalOpen && (
                    <Dialog open={true} onClose={() => setIsRejectModalOpen(false)} className="fixed z-50 inset-0 overflow-y-auto bg-opacity-50 flex items-center justify-center p-4">
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

export default ManageApplications;