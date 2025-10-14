import React, { useState, useRef } from 'react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { Helmet } from 'react-helmet';

import { Loader2, X, Upload, FileText, CheckCircle } from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';

import { Dialog } from '@headlessui/react';

import { axiosSecure } from '../../hooks/useAxiosSecure';

import useAuth from '../../hooks/useAuth';

import Swal from 'sweetalert2';
import { saveImgCloud } from '../../api/utils';





export default function ClaimRequestPage() {

    const { user } = useAuth();

    const queryClient = useQueryClient();



    const [selectedPolicyForClaim, setSelectedPolicyForClaim] = useState(null);

    const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);

    const [reasonForClaim, setReasonForClaim] = useState('');

    const [documentFile, setDocumentFile] = useState(null);

    const fileInputRef = useRef(null);



    // Fetch all policies for the user (same API as MyPoliciesPage)

    const { data: applications = [], isLoading: isLoadingApplications } = useQuery({

        queryKey: ['userApplicationsForClaims', user?.email],

        queryFn: async () => {

            if (!user?.email) return [];

            const res = await axiosSecure.get(`/all-data-that-are-approvedByAgent/${user?.email}`);

            return res.data;

        },

        enabled: !!user?.email,

        staleTime: 5 * 60 * 1000, // Keep data fresh for 5 minutes

    });



    // Fetch existing claims for the user

    // This endpoint should return claims enriched with application data (agent, user, policy info)

    const { data: claims = [], isLoading: isLoadingClaims, refetch: refetchClaims } = useQuery({

        queryKey: ['userClaims', user?.email],

        queryFn: async () => {

            if (!user?.email) return [];

            // This endpoint is expected to return enriched claim data via backend aggregation

            const res = await axiosSecure.get(`/claims/user/${user.email}`);

            return res.data;

        },

        enabled: !!user?.email,

        staleTime: 30 * 1000, // Keep claim data relatively fresh

    });



    // Filter policies to show only approved ones

    const approvedPolicies = applications.filter(app => app.status === 'Approved');



    // Mutation for submitting a new claim

    const submitClaimMutation = useMutation({

        mutationFn: async (newClaimData) => {

            // This endpoint is for submitting new claims to the backend (for agent review)

            const res = await axiosSecure.post('/claimRequests', newClaimData); // Corrected endpoint to /claimRequests

            return res.data;

        },

        onSuccess: () => {

            Swal.fire({

                toast: true,

                position: "top-end",

                icon: "success",

                title: "Claim submitted successfully!",

                showConfirmButton: false,

                timer: 1500

            });

            setIsClaimModalOpen(false);

            setReasonForClaim('');

            setDocumentFile(null);

            // Invalidate queries to refetch policies and claims

            queryClient.invalidateQueries(['userApplicationsForClaims', user?.email]);

            queryClient.invalidateQueries(['userClaims', user?.email]);

        },

        onError: (error) => {

            console.error('Error submitting claim:', error);

            Swal.fire({

                position: "top-end",

                icon: "error",

                title: "Failed to submit claim. Please try again.",

                showConfirmButton: false,

                timer: 1500

            });

        },

    });



    const handleClaimButtonClick = (policy) => {

        // Find if there's an existing claim for this policy

        const existingClaim = claims.find(claim => claim.applicationId === policy._id);



        if (existingClaim) {

            // If a claim exists, check its status

            if (existingClaim.claimStatus === 'Approved') {

                Swal.fire({

                    title: 'Claim Approved!',

                    html: `Your claim for <strong>${policy.policyTitle}</strong> has been approved.<br>Transaction ID: ${existingClaim.transactionId || 'N/A'}<br>Document: <a href="${existingClaim.documentUrl}" target="_blank" class="text-blue-600 hover:underline">View Document</a>`,

                    icon: 'success',

                    confirmButtonText: 'Great!',

                    confirmButtonColor: '#10B981', // Tailwind green-500

                });

            } else if (existingClaim.claimStatus === 'Pending') {

                Swal.fire({

                    title: 'Claim Pending',

                    text: `Your claim for ${policy.policyTitle} is currently pending review.`,

                    icon: 'info',

                    confirmButtonText: 'OK',

                    confirmButtonColor: '#3B82F6', // Tailwind blue-500

                });

            } else if (existingClaim.claimStatus === 'Rejected') {

                Swal.fire({

                    title: 'Claim Rejected',

                    text: `Your claim for ${policy.policyTitle} was rejected. Please contact support for more details.`,

                    icon: 'error',

                    confirmButtonText: 'OK',

                    confirmButtonColor: '#EF4444', // Tailwind red-500

                });

            }

        } else {

            // No existing claim, open the claim submission modal

            setSelectedPolicyForClaim(policy);

            setIsClaimModalOpen(true);

        }

    };



    const handleFileChange = (event) => {

        if (event.target.files && event.target.files[0]) {

            setDocumentFile(event.target.files[0]);

        } else {

            setDocumentFile(null);

        }

    };



    const handleSubmitClaim = async (e) => {

        e.preventDefault();



        if (!reasonForClaim || !documentFile) {

            Swal.fire({

                icon: 'warning',

                title: 'Missing Information',

                text: 'Please provide a reason for the claim and upload a document.',

                confirmButtonColor: '#F59E0B', // Tailwind amber-500

            });

            return;

        }



        let documentUrl = ''; // Initialize documentUrl



        try {

            // Call saveImgCloud for file upload

            const urlForImgAndPdf = await saveImgCloud(documentFile);

            if (urlForImgAndPdf) {

                documentUrl = urlForImgAndPdf;

            } else {

                // Handle case where upload fails but doesn't throw an error

                Swal.fire({

                    icon: 'error',

                    title: 'Upload Failed',

                    text: 'Failed to get a URL for the uploaded document. Please try again.',

                    confirmButtonColor: '#EF4444',

                });

                return;

            }

        } catch (uploadError) {

            console.error('Error uploading document:', uploadError);

            Swal.fire({

                icon: 'error',

                title: 'Upload Error',

                text: 'There was an error uploading your document. Please try again.',

                confirmButtonColor: '#EF4444',

            });

            return; // Stop submission if upload fails

        }




        const claimData = {

            applicationId: selectedPolicyForClaim?._id,

            agentEmail: selectedPolicyForClaim?.agentEmail,
            customerEmail: user?.email,

            customerName: user?.displayName,
            customerImg: user?.photoURL,
            policyTitle: selectedPolicyForClaim?.policyTitle,
            policyID: selectedPolicyForClaim?.policyId,

            reason: reasonForClaim,

            documentUrl: documentUrl, // This will now be the actual URL from saveImgCloud

            claimStatus: 'Pending', // Initial status

            claimedAt: new Date().toISOString(),

        };



        submitClaimMutation.mutate(claimData);

    };



    const isLoading = isLoadingApplications || isLoadingClaims || submitClaimMutation.isPending;



    if (isLoading) {

        return (

            <div className="min-h-screen flex items-center justify-center bg-gray-50">

                <Loader2 className="h-10 w-10 animate-spin text-teal-500" />

                <p className="text-gray-600 ml-3 text-lg">Loading policies and claims...</p>

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

                <title>NeoTakaful | Claim Request</title>

            </Helmet>



            <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-teal-600 to-blue-500 bg-clip-text text-transparent mb-8 text-center">

                Request a Claim

            </h1>



            {approvedPolicies.length === 0 ? (

                <p className="text-center text-gray-600 text-lg py-10">No approved policies found to claim against.</p>

            ) : (

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {approvedPolicies.map(policy => {

                        const existingClaim = claims.find(claim => claim.applicationId === policy._id);

                        const claimStatus = existingClaim ? existingClaim.claimStatus : null;



                        let buttonText = 'Submit Claim';

                        let buttonClasses = 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700';

                        let isDisabled = false;

                        let showIcon = false;

                        let iconComponent = null;



                        if (claimStatus === 'Pending') {

                            buttonText = 'Claim Pending';

                            buttonClasses = 'bg-yellow-500 hover:bg-yellow-600 cursor-not-allowed';

                            isDisabled = true;

                            showIcon = true;

                            iconComponent = <Loader2 className="h-5 w-5 animate-spin" />;

                        } else if (claimStatus === 'Approved') {

                            buttonText = 'Claim Approved';

                            buttonClasses = 'bg-blue-500 hover:bg-blue-600'; // Clickable for SweetAlert

                            isDisabled = false; // Make it clickable for the sweet alert

                            showIcon = true;

                            iconComponent = <CheckCircle className="h-5 w-5" />;

                        } else if (claimStatus === 'Rejected') {

                            buttonText = 'Claim Rejected';

                            buttonClasses = 'bg-red-500 hover:bg-red-600 cursor-not-allowed';

                            isDisabled = true;

                            showIcon = true;

                            iconComponent = <X className="h-5 w-5" />;

                        }



                        return (

                            <motion.div

                                key={policy._id}

                                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 flex flex-col gap-4 transform hover:scale-102 transition-all duration-300"

                                initial={{ opacity: 0, y: 20 }}

                                animate={{ opacity: 1, y: 0 }}

                                transition={{ duration: 0.3 }}

                            >

                                <img

                                    src={policy.policyImg || 'https://placehold.co/300x180/E0F2F7/000?text=Policy'}

                                    alt={policy.policyTitle}

                                    className="w-full h-40 object-cover rounded-xl shadow-sm"

                                />

                                <h3 className="text-xl font-bold text-gray-800">{policy.policyTitle}</h3>

                                <p className="text-sm text-gray-600">

                                    <span className="font-semibold">Customer:</span> {policy.personal?.name || 'N/A'}

                                </p>

                                <p className="text-sm text-gray-600">

                                    <span className="font-semibold">Coverage:</span> ${policy.quoteDetails?.coverageAmount || 'N/A'}

                                </p>

                                <p className="text-sm text-gray-600">

                                    <span className="font-semibold">Monthly Premium:</span> ${policy.quoteDetails?.monthlyContribution || 'N/A'}

                                </p>

                                {claimStatus && (

                                    <p className="text-sm font-semibold">

                                        Claim Status: <span className={`font-bold ${claimStatus === 'Approved' ? 'text-green-600' : claimStatus === 'Pending' ? 'text-yellow-600' : 'text-red-600'}`}>{claimStatus}</span>

                                    </p>

                                )}



                                <motion.button

                                    onClick={() => handleClaimButtonClick(policy)}

                                    className={`w-full py-3 rounded-xl text-white font-semibold text-lg shadow-md transition-all duration-200 flex items-center justify-center gap-2 ${buttonClasses} ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-lg'}`}

                                    whileHover={!isDisabled ? { scale: 1.02 } : {}}

                                    whileTap={!isDisabled ? { scale: 0.98 } : {}}

                                    disabled={isDisabled}

                                >

                                    {showIcon && iconComponent} {buttonText}

                                </motion.button>

                            </motion.div>

                        );

                    })}

                </div>

            )}



            {/* Claim Submission Modal */}

            <AnimatePresence>

                {isClaimModalOpen && selectedPolicyForClaim && (

                    <Dialog

                        open={true}

                        onClose={() => setIsClaimModalOpen(false)}

                        className="fixed z-50 inset-0 overflow-y-auto"

                        initial={{ opacity: 0 }}

                        animate={{ opacity: 1 }}

                        exit={{ opacity: 0 }}

                        transition={{ duration: 0.3 }}

                    >

                        <div className="flex items-center justify-center min-h-screen px-4">

                            <Dialog.Panel className="bg-white w-full max-w-md p-6 rounded-2xl shadow-2xl transform transition-all duration-300 max-h-[80vh] overflow-y-auto">

                                <div className="flex justify-between items-center mb-4">

                                    <Dialog.Title className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-blue-500 bg-clip-text text-transparent">

                                        Submit Claim for {selectedPolicyForClaim.policyTitle}

                                    </Dialog.Title>

                                    <motion.button

                                        onClick={() => setIsClaimModalOpen(false)}

                                        className="text-gray-500 hover:text-red-500 transition-colors duration-200"

                                        whileHover={{ scale: 1.1 }}

                                        whileTap={{ scale: 0.9 }}

                                    >

                                        <X size={24} />

                                    </motion.button>

                                </div>

                                <form onSubmit={handleSubmitClaim} className="space-y-5">

                                    <div>

                                        <label className="block text-sm font-medium text-gray-700 mb-1">Policy Name</label>

                                        <input

                                            type="text"

                                            value={selectedPolicyForClaim.policyTitle}

                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"

                                            readOnly

                                        />

                                    </div>

                                    <div>

                                        <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">Reason for Claim</label>

                                        <textarea

                                            id="reason"

                                            value={reasonForClaim}

                                            onChange={(e) => setReasonForClaim(e.target.value)}

                                            rows={4}

                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200"

                                            placeholder="Describe the reason for your claim..."

                                            required

                                        ></textarea>

                                    </div>

                                    <div>

                                        <label htmlFor="document" className="block text-sm font-medium text-gray-700 mb-1">Document Upload (PDF/Image)</label>

                                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-teal-500 transition-all duration-200" onClick={() => fileInputRef.current.click()}>

                                            <div className="space-y-1 text-center">

                                                <Upload className="mx-auto h-12 w-12 text-gray-400" />

                                                <div className="flex text-sm text-gray-600">

                                                    <p className="pl-1">

                                                        {documentFile ? documentFile.name : 'Drag and drop or click to upload'}

                                                    </p>

                                                    <input

                                                        id="document"

                                                        name="document"

                                                        type="file"

                                                        className="sr-only"

                                                        onChange={handleFileChange}

                                                        ref={fileInputRef}

                                                        accept="application/pdf,image/*" // Accept PDF and any image type

                                                    />

                                                </div>

                                                <p className="text-xs text-gray-500">PDF, PNG, JPG, GIF up to 10MB</p>

                                            </div>

                                        </div>

                                        {documentFile && (

                                            <p className="mt-2 text-sm text-gray-700">Selected file: <span className="font-medium">{documentFile.name}</span></p>

                                        )}

                                    </div>

                                    <div className="flex justify-end gap-3">

                                        <motion.button

                                            type="button"

                                            onClick={() => setIsClaimModalOpen(false)}

                                            className="px-5 py-2 bg-gray-400 text-white rounded-lg shadow-md hover:bg-gray-500 transition-all duration-200"

                                            whileHover={{ scale: 1.05 }}

                                            whileTap={{ scale: 0.95 }}

                                        >

                                            Cancel

                                        </motion.button>

                                        <motion.button

                                            type="submit"

                                            className="px-5 py-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg shadow-md hover:from-teal-600 hover:to-blue-600 transition-all duration-200"

                                            whileHover={{ scale: 1.05 }}

                                            whileTap={{ scale: 0.95 }}

                                            disabled={submitClaimMutation.isPending}

                                        >

                                            {submitClaimMutation.isPending ? 'Submitting...' : 'Submit Claim'}

                                        </motion.button>

                                    </div>

                                </form>

                            </Dialog.Panel>

                        </div>

                    </Dialog>

                )}

            </AnimatePresence>

        </motion.div>

    );

}
