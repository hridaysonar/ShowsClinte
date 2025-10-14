import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router';
import { motion } from 'framer-motion';
import { axiosSecure } from '../../hooks/useAxiosSecure';
import Swal from 'sweetalert2';
import useAuth from '../../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from '../../components/Shared/Spinner/LoadingSpinner';

const ApplicationFormPage = () => {
    const { id } = useParams();
    const location = useLocation();
    const { user } = useAuth();
    const navigate = useNavigate();

    const { quoteData } = location.state || {};

    const { data: policy, isLoading: policyLoading, error: policyError } = useQuery({
        queryKey: ['policy', id],
        queryFn: async () => {
            const res = await axiosSecure.get(`/policies/${id}`);
            return res.data;
        },
    });

    const [formData, setFormData] = useState({
        policyId: '',
        policyTitle: '',
        policyImg: '',
        personal: {
            name: user?.displayName || '',
            email: user?.email || '',
            userImg: user?.photoURL || '',
            address: '',
            nid: '',
            phone: '' // ✨ ADDED: Phone number field
        },
        nominee: { name: '', relationship: '' },
        healthDisclosure: [],
        quoteDetails: {
            age: quoteData?.age || '',
            gender: quoteData?.gender || 'male',
            coverageAmount: quoteData?.coverageAmount || '',
            duration: quoteData?.duration || '',
            smoker: quoteData?.smoker || 'non-smoker',
            monthlyContribution: quoteData?.monthly || '',
            annualContribution: quoteData?.annual || '',
        },
        status: 'Pending',
        applicationDate: new Date().toISOString(),
    });

    useEffect(() => {
        if (policy) {
            setFormData((prev) => ({
                ...prev,
                policyId: policy?._id,
                policyTitle: policy?.title,
                policyImg: policy?.image,
            }));
        }
    }, [policy]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null); // Keep this for general errors

    // Add a state for field-specific errors
    const [fieldErrors, setFieldErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        const [section, field] = name.split('.');

        if (section && field) {
            setFormData((prev) => ({
                ...prev,
                [section]: { ...prev[section], [field]: value },
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }

        // Clear the specific field's error when the user starts typing
        if (fieldErrors[name]) {
            setFieldErrors(prevErrors => {
                const newErrors = { ...prevErrors };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleHealthChange = (e) => {
        const { value, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            healthDisclosure: checked
                ? [...prev.healthDisclosure, value]
                : prev.healthDisclosure.filter((item) => item !== value),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); // Clear general errors
        setFieldErrors({}); // Clear field-specific errors
        setIsSubmitting(true);

        const { personal, nominee, policyId, policyTitle, policyImg, quoteDetails } = formData;
        let hasValidationErrors = false;
        const currentFieldErrors = {};

        // Basic validation for required fields
        if (!personal.name) {
            currentFieldErrors['personal.name'] = 'Full Name is required.';
            hasValidationErrors = true;
        }
        if (!personal.email) {
            currentFieldErrors['personal.email'] = 'Email is required.';
            hasValidationErrors = true;
        }
        if (!personal.address) {
            currentFieldErrors['personal.address'] = 'Address is required.';
            hasValidationErrors = true;
        }
        if (!personal.nid) {
            currentFieldErrors['personal.nid'] = 'NID / Aadhaar Number is required.';
            hasValidationErrors = true;
        }

        // ✨ ADDED: Phone number validation
        if (!personal.phone) {
            currentFieldErrors['personal.phone'] = 'Phone number is required.';
            hasValidationErrors = true;
        } else if (!/^01\d{9}$/.test(personal.phone)) { // Simple regex for Bangladeshi numbers (01xxxxxxxxx)
            currentFieldErrors['personal.phone'] = 'Please enter a valid Bangladeshi phone number (e.g., 01xxxxxxxxx).';
            hasValidationErrors = true;
        }

        if (!nominee.name) {
            currentFieldErrors['nominee.name'] = 'Nominee Name is required.';
            hasValidationErrors = true;
        }
        if (!nominee.relationship) {
            currentFieldErrors['nominee.relationship'] = 'Nominee Relationship is required.';
            hasValidationErrors = true;
        }

        // Check if policy and quote details are present (as in your original code)
        if (
            !policyId ||
            !policyTitle ||
            !policyImg ||
            !quoteDetails.monthlyContribution ||
            !quoteDetails.annualContribution
        ) {
            setError('Missing policy or quote details. Please go back to the quote page and try again.');
            hasValidationErrors = true;
        }

        if (hasValidationErrors) {
            setFieldErrors(currentFieldErrors);
            setIsSubmitting(false);
            return;
        }

        try {
            await axiosSecure.post('/applications', {
                ...formData,
                customerName: formData.personal.name,
                customerEmail: formData.personal.email,
                applicationDate: new Date().toISOString(),
            });

            Swal.fire({
                title: 'Application Submitted!',
                text: 'Your Takaful application has been received. Status: Pending.',
                icon: 'success',
                confirmButtonColor: '#10B981',
                confirmButtonText: 'OK'
            }).then(() => {
                navigate('/dashboard/my-policies');
            });

        } catch (err) {
            console.error("Application submission error:", err);
            setError('Error submitting application. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (policyLoading) {
        return <LoadingSpinner />;
    }

    if (policyError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <p className="text-red-600 text-xl">Error loading policy details: {policyError.message}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white py-16 px-4">
            <motion.div
                className="max-w-5xl mx-auto"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <h1 className="text-center text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-green-600 to-teal-500 text-transparent bg-clip-text mb-8">
                    Apply for Booking {policy?.title} Plan
                </h1>
                <p className="text-center text-gray-600 text-lg mb-10 ">
                    Fill the form below to apply for a halal, interest-free insurance plan.
                </p>

                <form
                    onSubmit={handleSubmit}
                    className="bg-white border border-gray-100 shadow-2xl rounded-3xl p-8 space-y-10"
                >
                    {error && <p className="text-red-600 font-medium text-sm text-center mb-4">{error}</p>}

                    {/* Policy Overview (from Quote Page) */}
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">💰 Quote Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl shadow-inner">
                            <div>
                                <p className="text-sm text-gray-600">Policy Title</p>
                                <p className="font-medium text-gray-800">{formData.policyTitle}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Coverage Amount</p>
                                <p className="font-medium text-gray-800">৳{Number(formData.quoteDetails.coverageAmount).toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Duration</p>
                                <p className="font-medium text-gray-800">{formData.quoteDetails.duration} Years</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Smoker Status</p>
                                <p className="font-medium text-gray-800">{formData.quoteDetails.smoker}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Estimated Monthly Contribution</p>
                                <p className="font-bold text-green-600 text-lg">৳{formData.quoteDetails.monthlyContribution}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Estimated Annual Contribution</p>
                                <p className="font-bold text-green-600 text-lg">৳{formData.quoteDetails.annualContribution}</p>
                            </div>
                        </div>
                    </section>
                    <hr className="border-gray-200" />

                    {/* Personal Info */}
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">👤 Personal Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm text-gray-600">Full Name *</label>
                                <input
                                    type="text"
                                    name="personal.name"
                                    value={formData.personal.name}
                                    onChange={handleChange}
                                    className="input-style"
                                    placeholder="Your full name"
                                    required
                                />
                                {fieldErrors['personal.name'] && <p className="text-red-600 text-sm mt-1">{fieldErrors['personal.name']}</p>}
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Email *</label>
                                <input
                                    type="email"
                                    disabled
                                    name="personal.email"
                                    value={formData.personal.email}
                                    onChange={handleChange}
                                    className="input-style cursor-not-allowed"
                                    placeholder="you@example.com"
                                    required
                                />
                                {fieldErrors['personal.email'] && <p className="text-red-600 text-sm mt-1">{fieldErrors['personal.email']}</p>}
                            </div>
                            {/* ✨ ADDED: Phone Number Input */}
                            <div>
                                <label className="text-sm text-gray-600">Phone Number *</label>
                                <input
                                    type="tel" // Use type="tel" for phone numbers
                                    name="personal.phone"
                                    value={formData.personal.phone}
                                    onChange={handleChange}
                                    className="input-style"
                                    placeholder="e.g., 01xxxxxxxxx" // Example for Bangladeshi number
                                    pattern="01[0-9]{9}" // Basic regex pattern for client-side hint
                                    title="Please enter a valid Bangladeshi phone number (e.g., 01712345678)" // Tooltip
                                    required
                                />
                                {fieldErrors['personal.phone'] && <p className="text-red-600 text-sm mt-1">{fieldErrors['personal.phone']}</p>}
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">NID / Aadhaar Number *</label>
                                <input
                                    type="text"
                                    name="personal.nid"
                                    value={formData.personal.nid}
                                    onChange={handleChange}
                                    className="input-style"
                                    placeholder="National ID"
                                    required
                                />
                                {fieldErrors['personal.nid'] && <p className="text-red-600 text-sm mt-1">{fieldErrors['personal.nid']}</p>}
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-sm text-gray-600">Address *</label>
                                <textarea
                                    name="personal.address"
                                    rows={3}
                                    value={formData.personal.address}
                                    onChange={handleChange}
                                    className="input-style"
                                    placeholder="Your address"
                                    required
                                />
                                {fieldErrors['personal.address'] && <p className="text-red-600 text-sm mt-1">{fieldErrors['personal.address']}</p>}
                            </div>
                        </div>
                    </section>
                    <hr className="border-gray-200" />

                    {/* Nominee Info */}
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">👥 parents </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm text-gray-600">Nominee Name *</label>
                                <input
                                    type="text"
                                    name="nominee.name"
                                    value={formData.nominee.name}
                                    onChange={handleChange}
                                    className="input-style"
                                    required
                                />
                                {fieldErrors['nominee.name'] && <p className="text-red-600 text-sm mt-1">{fieldErrors['nominee.name']}</p>}
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Relationship *</label>
                                <select
                                    name="nominee.relationship"
                                    value={formData.nominee.relationship}
                                    onChange={handleChange}
                                    className="input-style"
                                    required
                                >
                                    <option value="">Select</option>
                                    <option value="spouse">Spouse</option>
                                    <option value="child">Child</option>
                                    <option value="parent">Parent</option>
                                    <option value="sibling">Sibling</option>
                                    <option value="other">Other</option>
                                </select>
                                {fieldErrors['nominee.relationship'] && <p className="text-red-600 text-sm mt-1">{fieldErrors['nominee.relationship']}</p>}
                            </div>
                        </div>
                    </section>
                    <hr className="border-gray-200" />

                    {/* Health Disclosure */}
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">🩺 Health Conditions</h2>
                        <p className="text-gray-500 text-sm mb-2">Select if you have any of the following:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {['Diabetes', 'Heart Disease', 'Hypertension', 'Cancer', 'Respiratory Issues', 'None'].map((cond) => (
                                <label key={cond} className="inline-flex items-center gap-2 text-gray-700">
                                    <input
                                        type="checkbox"
                                        value={cond}
                                        checked={formData.healthDisclosure.includes(cond)}
                                        onChange={handleHealthChange}
                                        className="text-green-600 border-gray-300 rounded focus:ring-green-500"
                                    />
                                    {cond}
                                </label>
                            ))}
                        </div>
                    </section>
                    <hr className="border-gray-200" />

                    {/* Submit */}
                    <motion.button
                        type="submit"
                        disabled={isSubmitting || policyLoading}
                        whileTap={{ scale: 0.97 }}
                        className={`w-full mt-6 px-6 py-3 text-white font-bold rounded-xl transition-all duration-300 bg-gradient-to-r from-green-600 to-teal-500 hover:from-green-700 hover:to-teal-600 shadow-lg ${isSubmitting || policyLoading ? 'opacity-60 cursor-not-allowed' : ''
                            }`}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Application'}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
};

export default ApplicationFormPage;