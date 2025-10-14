import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { Loader2, CheckCircle, XCircle, X } from 'lucide-react'; // Added CheckCircle and XCircle icons
import { motion, AnimatePresence } from 'framer-motion'; // Added AnimatePresence for exit animations
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import useAuth from '../../hooks/useAuth'; // Assuming you have this hook
import { axiosSecure } from '../../hooks/useAxiosSecure'; // Ensure this import path is correct

// TODO: IMPORTANT: Replace with your actual Stripe Publishable Key
// Get this from your Stripe Dashboard -> Developers -> API Keys
// Ensure your .env file has VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Custom Modal Component for Alerts
const CustomAlertModal = ({ message, type, onClose }) => {
    const isSuccess = type === 'success';
    const bgColor = isSuccess ? 'bg-green-500' : 'bg-red-500';
    const icon = isSuccess ? <CheckCircle size={48} className="text-white" /> : <XCircle size={48} className="text-white" />;
    const title = isSuccess ? 'Payment Successful!' : 'Payment Failed!';

    // Removed sound effect logic (Tone.js useEffect)

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            // Removed background color and opacity to make it "normal" (transparent)
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            onClick={onClose} // Close on backdrop click
        >
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className={`relative p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center ${bgColor} text-white`}
                onClick={e => e.stopPropagation()} // Prevent closing when clicking inside modal
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
                    aria-label="Close alert"
                >
                    <X size={24} />
                </button>
                <div className="mb-4 flex justify-center">{icon}</div>
                <h3 className="text-2xl font-bold mb-3">{title}</h3>
                <p className="text-lg">{message}</p>
            </motion.div>
        </motion.div>
    );
};


const CheckoutForm = ({ application, premiumAmount, paymentFrequency }) => {
    const stripe = useStripe();
    const elements = useElements();
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [clientSecret, setClientSecret] = useState('');
    const [processing, setProcessing] = useState(false);
    const [alertMessage, setAlertMessage] = useState(null); // For custom alert message
    const [alertType, setAlertType] = useState(null); // 'success' or 'error'

    // Fetch client secret for Payment Intent
    useEffect(() => {
        setAlertMessage(null); // Clear previous alerts when premiumAmount changes
        setAlertType(null);
        if (premiumAmount > 0) {
            axiosSecure.post('/create-payment-intent', { amount: premiumAmount })
                .then(res => {
                    setClientSecret(res.data.clientSecret);
                })
                .catch(err => {
                    console.error('Error creating payment intent:', err);
                    setAlertMessage('Failed to initialize payment. Please check your network and try again.');
                    setAlertType('error');
                });
        } else {
            setClientSecret('');
        }
    }, [premiumAmount]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements || !clientSecret) {
            setAlertMessage('Payment system not ready. Please wait or refresh.');
            setAlertType('error');
            return;
        }

        setProcessing(true);
        setAlertMessage(null);
        setAlertType(null);

        const card = elements.getElement(CardElement);

        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: card,
                billing_details: {
                    email: user?.email || application?.personal?.email,
                    name: user?.displayName || application?.personal?.name,
                },
            },
        });

        if (error) {
            console.error('[Stripe Error]', error);
            setAlertMessage(error.message);
            setAlertType('error');
            setProcessing(false);
        } else if (paymentIntent.status === 'succeeded') {
            console.log('[PaymentIntent]', paymentIntent);

            const paymentInfo = {
                applicationId: application._id,
                transactionId: paymentIntent.id,
                amount: paymentIntent.amount / 100,
                currency: paymentIntent.currency,
                paymentDate: new Date().toISOString(),
                paymentMethod: 'card',
                customerEmail: user?.email || application?.personal?.email,
                customerName: user?.displayName || application?.personal?.name,
                policyTitle: application.policyTitle,
                paymentFrequency: paymentFrequency,
            };

            try {
                await axiosSecure.post('/payments', paymentInfo);
                queryClient.invalidateQueries(['userApplications', user?.email]);
                queryClient.invalidateQueries(['application', application._id]);

                setAlertMessage(`Payment successful! Transaction ID: ${paymentIntent.id}`);
                setAlertType('success');

                setTimeout(() => {
                    navigate('/dashboard/payment-status'); // Corrected redirect path
                }, 2000);
            } catch (dbError) {
                console.error('Error saving payment info to DB:', dbError);
                setAlertMessage('Payment successful, but failed to update records. Please contact support.');
                setAlertType('error');
            } finally {
                setProcessing(false);
            }
        } else {
            setAlertMessage('Payment failed. Please try again.');
            setAlertType('error');
            setProcessing(false);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Enter Card Details</h2>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Card Information
                        </label>
                        <div className="p-3 border border-gray-300 rounded-md bg-white shadow-sm">
                            <CardElement
                                options={{
                                    style: {
                                        base: {
                                            fontSize: '16px',
                                            color: '#424770',
                                            '::placeholder': {
                                                color: '#aab7c4',
                                            },
                                        },
                                        invalid: {
                                            color: '#ef4444',
                                            iconColor: '#ef4444',
                                        },
                                    },
                                    hidePostalCode: true,
                                }}
                            />
                        </div>
                    </div>
                </div>

                <motion.button
                    type="submit"
                    disabled={!stripe || !elements || processing || !clientSecret}
                    className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold text-lg shadow-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all duration-200"
                    whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
                    whileTap={{ scale: 0.98 }}
                >
                    {processing ? (
                        <>
                            <Loader2 className="h-6 w-6 animate-spin" /> Processing...
                        </>
                    ) : (
                        `Pay $${premiumAmount.toFixed(2)} ${paymentFrequency === 'monthly' ? 'Monthly' : 'Annually'}`
                    )}
                </motion.button>
            </form>

            {/* Custom Alert Modal */}
            <AnimatePresence>
                {alertMessage && (
                    <CustomAlertModal
                        message={alertMessage}
                        type={alertType}
                        onClose={() => { setAlertMessage(null); setAlertType(null); }}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

const PaymentPage = () => {
    const { applicationId } = useParams();
    const { user } = useAuth();

    const { data: application, isLoading, error } = useQuery({
        queryKey: ['application', applicationId],
        queryFn: async () => {
            if (!applicationId) return null;
            const res = await axiosSecure.get(`/applications/${applicationId}`);
            return res.data;
        },
        enabled: !!applicationId,
        staleTime: 5 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
    });

    const [premiumAmount, setPremiumAmount] = useState(0);
    const [paymentFrequency, setPaymentFrequency] = useState('monthly');

    useEffect(() => {
        if (application?.quoteDetails) {
            if (paymentFrequency === 'monthly') {
                setPremiumAmount(parseFloat(application.quoteDetails.monthlyContribution));
            } else {
                setPremiumAmount(parseFloat(application.quoteDetails.annualContribution));
            }
        }
    }, [application, paymentFrequency]);


    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="h-10 w-10 animate-spin text-teal-500" />
                <p className="text-gray-600 ml-3 text-lg">Loading payment details...</p>
            </div>
        );
    }

    if (error) {
        return <p className="text-red-600 text-center text-lg py-10">Error fetching application details: {error.message}</p>;
    }

    if (!application) {
        return <p className="text-center text-gray-600 text-lg py-10">Application not found or invalid ID.</p>;
    }

    return (
        <>
            <Helmet>
                <title>NeoTakaful | Payment</title>
            </Helmet>

            <motion.div
                className="max-w-xl mx-auto p-6 bg-white rounded-3xl shadow-2xl my-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-3xl font-extrabold bg-gradient-to-r from-green-600 to-blue-500 bg-clip-text text-transparent mb-6 text-center">
                    Complete Your Payment
                </h1>

                <div className="space-y-4 mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h2 className="text-xl font-bold text-blue-800">Policy Details</h2>
                    <p><strong>Customer:</strong> {application.personal?.name}</p>
                    <p><strong>Email:</strong> {application.personal?.email}</p>
                    <p><strong>Policy:</strong> {application.policyTitle}</p>
                    {application.policyImg && (
                        <img src={application.policyImg} alt="Policy" className="w-full h-32 object-cover rounded-md mt-2" />
                    )}

                    {/* Payment Frequency Selector */}
                    <div className="mt-4">
                        <label className="block text-base font-semibold text-gray-800 mb-2">Select Payment Frequency:</label>
                        <div className="flex gap-4">
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    className="form-radio text-blue-600 h-5 w-5"
                                    name="paymentFrequency"
                                    value="monthly"
                                    checked={paymentFrequency === 'monthly'}
                                    onChange={() => setPaymentFrequency('monthly')}
                                />
                                <span className="ml-2 text-gray-700">Monthly</span>
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    className="form-radio text-blue-600 h-5 w-5"
                                    name="paymentFrequency"
                                    value="annual"
                                    checked={paymentFrequency === 'annual'}
                                    onChange={() => setPaymentFrequency('annual')}
                                />
                                <span className="ml-2 text-gray-700">Annual</span>
                            </label>
                        </div>
                    </div>

                    <p className="text-lg font-bold text-gray-900">
                        Premium Amount:{' '}
                        <span className="text-green-700">
                            ${premiumAmount.toFixed(2)} / {paymentFrequency === 'monthly' ? 'Month' : 'Year'}
                        </span>
                    </p>
                </div>

                {premiumAmount > 0 && stripePromise ? (
                    <Elements stripe={stripePromise}>
                        <CheckoutForm
                            application={application}
                            premiumAmount={premiumAmount}
                            paymentFrequency={paymentFrequency}
                        />
                    </Elements>
                ) : (
                    <p className="text-center text-red-600 font-medium py-4">
                        Unable to load payment form. Please ensure a valid premium amount is available.
                    </p>
                )}
            </motion.div>
        </>
    );
};

export default PaymentPage;
