// src/pages/AdminPage/ManagePolicies.jsx (Fixed)

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Edit, Trash2, Loader2, Search, RotateCcw, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import { axiosSecure } from '../../hooks/useAxiosSecure';
import { saveImgCloud } from '../../api/utils';

// ------------------------ utils ------------------------
const safeJoin = (arr, sep = ', ') => Array.isArray(arr) ? arr.join(sep) : '';
const toNumber = (v, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

// =========================================================================
// usePolicyManagement Hook (safer + normalized)
// =========================================================================
const usePolicyManagement = (page = 1, limit = 9, category = '', search = '') => {
  const queryClient = useQueryClient();

  const { data: policiesData = { policies: [], total: 0 }, isLoading, error } = useQuery({
    queryKey: ['policies', page, limit, category, search],
    queryFn: async () => {
      const params = { page, limit };
      if (category) params.category = category;
      if (search) params.search = search;

      const res = await axiosSecure.get('/policies', { params });
      const raw = res.data || { policies: [], total: 0 };

      // Normalize each policy so UI never crashes
      const policies = (raw.policies || []).map((p) => {
        const normalizedDurations = Array.isArray(p.durationOptions)
          ? p.durationOptions
          : (typeof p.durationOptions === 'string'
              ? p.durationOptions.split(',').map(x => toNumber(x.trim())).filter(Boolean)
              : []);

        return {
          ...p,
          title: p.title || p.name || 'Untitled Policy',
          category: p.category || 'General',
          image: p.image || p.imageUrl || '',
          minAge: toNumber(p.minAge),
          maxAge: toNumber(p.maxAge),
          basePremiumRate: toNumber(p.basePremiumRate),
          durationOptions: normalizedDurations,
          benefits: Array.isArray(p.benefits) ? p.benefits : (p.benefits ? [String(p.benefits)] : []),
          coverageRange: p.coverageRange || '',
          description: p.description || '',
        };
      });

      return { total: toNumber(raw.total), policies };
    },
    placeholderData: (prev) => prev,
    staleTime: 5 * 60 * 1000,
  });

  const policies = policiesData.policies;
  const totalPolicies = policiesData.total;

  // Prepare image + payload
  const preparePolicyData = async (data) => {
    let policyImageURL = data.image; // existing URL by default
    if (data.imageFile) {
      const url = await saveImgCloud(data.imageFile);
      policyImageURL = url;
    }
    const finalData = { ...data, image: policyImageURL };
    delete finalData.imageFile;

    // Ensure types
    finalData.minAge = toNumber(finalData.minAge);
    finalData.maxAge = toNumber(finalData.maxAge);
    finalData.basePremiumRate = toNumber(finalData.basePremiumRate);
    finalData.durationOptions = Array.isArray(finalData.durationOptions)
      ? finalData.durationOptions.map((n) => toNumber(n)).filter(Boolean)
      : [];
    finalData.benefits = (finalData.benefits || []).filter(Boolean);

    return finalData;
  };

  const addPolicyMutation = useMutation({
    mutationFn: async (newPolicyData) => {
      const payload = await preparePolicyData(newPolicyData);
      const res = await axiosSecure.post('/policies', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['policies']);
      Swal.fire({ icon: 'success', title: 'Policy Added!', timer: 1700, showConfirmButton: false });
    },
    onError: (err) => {
      Swal.fire({ icon: 'error', title: 'Failed to Add', text: err?.response?.data?.message || 'Something went wrong' });
    },
  });

  const updatePolicyMutation = useMutation({
    mutationFn: async (updatedPolicyData) => {
      const payload = await preparePolicyData(updatedPolicyData);
      const res = await axiosSecure.patch(`/policyUpdate/${updatedPolicyData._id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['policies']);
      Swal.fire({ icon: 'success', title: 'Policy Updated!', timer: 1700, showConfirmButton: false });
    },
    onError: (err) => {
      Swal.fire({ icon: 'error', title: 'Failed to Update', text: err?.response?.data?.message || 'Something went wrong' });
    },
  });

  const deletePolicyMutation = useMutation({
    mutationFn: async (policyId) => {
      const res = await axiosSecure.delete(`/policy/${policyId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['policies']);
      Swal.fire({ icon: 'success', title: 'Policy Deleted!', timer: 1400, showConfirmButton: false });
    },
    onError: (err) => {
      Swal.fire({ icon: 'error', title: 'Failed to Delete', text: err?.response?.data?.message || 'Something went wrong' });
    },
  });

  const isMutating = addPolicyMutation.isPending || updatePolicyMutation.isPending || deletePolicyMutation.isPending;

  return {
    policies,
    totalPolicies,
    isLoading,
    error,
    addPolicy: addPolicyMutation.mutate,
    updatePolicy: updatePolicyMutation.mutate,
    deletePolicy: deletePolicyMutation.mutate,
    isMutating,
  };
};

// =========================================================================
// PolicyModal (safe durationOptions binding)
// =========================================================================

const PolicyModal = ({ isOpen, onClose, policyData, onSubmit, isMutating }) => {
    // Initialize formData based on whether policyData is provided (edit mode) or null (add mode)
    const [formData, setFormData] = useState(() => policyData ? {
        ...policyData,
        durationOptions: policyData.durationOptions || [],
        imageUrl: policyData.image || '', // For displaying existing image preview
        benefits: policyData.benefits && policyData.benefits.length > 0 ? policyData.benefits : [''],
    } : {
        title: '',
        category: '', // Re-added category field for new policies
        description: '',
        minAge: '',
        maxAge: '',
        coverageRange: '',
        durationOptions: [],
        basePremiumRate: '',
        imageUrl: '',
        benefits: [''],
        eligibility: '',
        premiumLogicNote: ''
    });

    // State to hold the actual image File object before upload
    const [imageFile, setImageFile] = useState(null);

    // Handles changes for text and number input fields
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'minAge' || name === 'maxAge' || name === 'basePremiumRate') {
            setFormData({ ...formData, [name]: Number(value) });
        } else if (name === 'durationOptions') {
            // Parse comma-separated durations into an array of numbers
            const durations = value.split(',').map(d => Number(d.trim())).filter(d => !isNaN(d) && d > 0);
            setFormData({ ...formData, [name]: durations });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    // Handles changes for the image file input
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImageFile(file); // Store the actual file object for submission
        if (file) {
            setFormData({ ...formData, imageUrl: URL.createObjectURL(file) }); // Create a temporary URL for immediate preview
        } else {
            // If no file selected, revert image preview to existing URL or empty
            setFormData({ ...formData, imageUrl: policyData?.image || '' });
        }
    };

    // Handles changes for individual benefit input fields
    const handleBenefitChange = (index, value) => {
        const newBenefits = [...formData.benefits];
        newBenefits[index] = value;
        setFormData({ ...formData, benefits: newBenefits });
    };

    // Adds a new empty benefit input field
    const addBenefitField = () => {
        setFormData({ ...formData, benefits: [...formData.benefits, ''] });
    };

    // Removes a benefit input field at a specific index
    const removeBenefitField = (index) => {
        const newBenefits = formData.benefits.filter((_, i) => i !== index);
        setFormData({ ...formData, benefits: newBenefits.length > 0 ? newBenefits : [''] }); // Ensure at least one empty field remains
    };

    // Handles form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Prepare data for submission, ensuring correct types and cleaning empty benefits
        const dataToSubmit = {
            ...formData,
            minAge: Number(formData.minAge),
            maxAge: Number(formData.maxAge),
            basePremiumRate: Number(formData.basePremiumRate),
            durationOptions: formData.durationOptions.map(Number),
            benefits: formData.benefits.filter(b => b.trim() !== '') // Filter out empty benefit strings
        };

        // Call the onSubmit prop with the prepared data and the image file
        onSubmit({
            ...dataToSubmit,
            imageFile: imageFile, // Pass the File object for upload
            image: policyData?.image // Pass existing image URL if no new file was selected
        });
    };

    // Closes the modal if the overlay (outside the modal content) is clicked
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    // Modal Overlay - Light gray with opacity, not black
                    className="fixed inset-0 z-50 flex items-center justify-center bg-gray-200 bg-opacity-50 p-4 overflow-y-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={handleOverlayClick} // Close on overlay click
                >
                    {/* Modal Content - Adjusted size and added internal scrolling */}
                    <motion.div
                        className="relative bg-white w-full max-w-lg p-6 rounded-2xl shadow-xl transform overflow-y-auto max-h-[90vh]" // max-w-lg for smaller width, max-h-[90vh] for vertical fit
                        initial={{ scale: 0.9, y: 50 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 50 }}
                        transition={{ duration: 0.3 }}
                        // Prevent event bubbling from content to overlay
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition"
                        >
                            <X size={24} />
                        </button>

                        <h2 className="text-3xl font-extrabold text-gray-800 mb-6">
                            {policyData ? 'Edit Policy' : 'Add New Policy'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Policy Title</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                            {/* Category field re-added as per request */}
                           <div>
  <label
    htmlFor="category"
    className="block text-sm font-medium text-gray-700 mb-1"
  >
    Category
  </label>
  <select
    id="category"
    name="category"
    value={formData.category}
    onChange={handleChange}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
    required
  >
    <option value="">Select Category</option>
    <option value="All">All</option>
    <option value="Sneakers">Sneakers</option>
    <option value="Formal">Formal</option>
    <option value="Boots">Boots</option>
    <option value="Sandals">Sandals</option>
    <option value="Sports">Sports</option>
    <option value="Loafers">Loafers</option>
    <option value="Heels">Heels</option>
    <option value="Kids">Kids</option>
  </select>
</div>


                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    required
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="minAge" className="block text-sm font-medium text-gray-700 mb-1">Minimum Age</label>
                                    <input
                                        type="number"
                                        id="minAge"
                                        name="minAge"
                                        value={formData.minAge}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                        required
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="maxAge" className="block text-sm font-medium text-gray-700 mb-1">Maximum Age</label>
                                    <input
                                        type="number"
                                        id="maxAge"
                                        name="maxAge"
                                        value={formData.maxAge}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                        required
                                        min={formData.minAge || 0}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="coverageRange" className="block text-sm font-medium text-gray-700 mb-1">Coverage Range (e.g., 100000 – 5000000)</label>
                                <input
                                    type="text"
                                    id="coverageRange"
                                    name="coverageRange"
                                    value={formData.coverageRange}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    required
                                    placeholder="e.g., 100000 – 5000000"
                                />
                            </div>

                            <div>
                                <label htmlFor="durationOptions" className="block text-sm font-medium text-gray-700 mb-1">Duration Options (comma-separated years, e.g., 5,10,15)</label>
                                <input
                                    type="text"
                                    id="durationOptions"
                                    name="durationOptions"
                                    value={formData.durationOptions.join(', ')}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    required
                                    placeholder="e.g., 5,10,15"
                                />
                            </div>

                            <div>
                                <label htmlFor="basePremiumRate" className="block text-sm font-medium text-gray-700 mb-1">Base Premium Rate (e.g., 0.0003)</label>
                                <input
                                    type="number"
                                    step="0.000001"
                                    id="basePremiumRate"
                                    name="basePremiumRate"
                                    value={formData.basePremiumRate}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="policyImage" className="block text-sm font-medium text-gray-700 mb-1">Policy Image</label>
                                <input
                                    type="file"
                                    id="policyImage"
                                    name="policyImage"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                                {formData.imageUrl && (
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-600 mb-1">Current/New Image Preview:</p>
                                        <img src={formData.imageUrl} alt="Policy Preview" className="w-32 h-32 object-cover rounded-lg shadow-md" />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Benefits</label>
                                {formData.benefits.map((benefit, index) => (
                                    <div key={index} className="flex items-center gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={benefit}
                                            onChange={(e) => handleBenefitChange(index, e.target.value)}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                            placeholder={`Benefit ${index + 1}`}
                                        />
                                        {formData.benefits.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeBenefitField(index)}
                                                className="p-2 rounded-full text-red-500 hover:bg-red-100 transition"
                                            >
                                                <X size={18} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addBenefitField}
                                    className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                >
                                    <PlusCircle className="mr-2 h-5 w-5" /> Add Benefit
                                </button>
                            </div>

                            <div>
                                <label htmlFor="eligibility" className="block text-sm font-medium text-gray-700 mb-1">Eligibility</label>
                                <textarea
                                    id="eligibility"
                                    name="eligibility"
                                    value={formData.eligibility}
                                    onChange={handleChange}
                                    rows="2"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    required
                                ></textarea>
                            </div>

                            <div>
                                <label htmlFor="premiumLogicNote" className="block text-sm font-medium text-gray-700 mb-1">Premium Logic Note</label>
                                <textarea
                                    id="premiumLogicNote"
                                    name="premiumLogicNote"
                                    value={formData.premiumLogicNote}
                                    onChange={handleChange}
                                    rows="2"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    required
                                ></textarea>
                            </div>

                            <motion.button
                                type="submit"
                                className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-lg text-white bg-gradient-to-r from-teal-500 to-green-600 hover:from-teal-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-300"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={isMutating}
                            >
                                {isMutating && <Loader2 className="h-5 w-5 mr-3 animate-spin" />}
                                {policyData ? (isMutating ? 'Updating Policy...' : 'Update Policy') : (isMutating ? 'Adding Policy...' : 'Add Policy')}
                            </motion.button>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// =========================================================================
// ManagePolicies (main)
// =========================================================================
function ManagePolicies() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [policyToEdit, setPolicyToEdit] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500);
    return () => clearTimeout(id);
  }, [searchTerm]);

  const { policies, totalPolicies, isLoading, error, addPolicy, updatePolicy, deletePolicy, isMutating } = usePolicyManagement(currentPage, itemsPerPage, selectedCategory, debouncedSearchTerm);

  const totalPages = Math.max(1, Math.ceil((totalPolicies || 0) / itemsPerPage));
  const handlePageChange = (n) => setCurrentPage(n);
  const handlePrevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  const handleCategoryChange = (e) => { setSelectedCategory(e.target.value); setCurrentPage(1); };
  const handleSearchChange = (e) => { setSearchTerm(e.target.value); setCurrentPage(1); };
  const handleClearFilters = () => { setSelectedCategory(''); setSearchTerm(''); setDebouncedSearchTerm(''); setCurrentPage(1); };

  const handleAddPolicyClick = () => { setPolicyToEdit(null); setIsModalOpen(true); };
  const handleEditPolicyClick = (policy) => { setPolicyToEdit(policy); setIsModalOpen(true); };

  const handleDeletePolicy = async (policyId) => {
    const result = await Swal.fire({ title: 'Are you sure?', text: "You won't be able to revert this!", icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#3085d6', confirmButtonText: 'Yes, delete it!' });
    if (result.isConfirmed) deletePolicy(policyId);
  };

  const handlePolicyFormSubmit = (data) => {
    if (policyToEdit) updatePolicy({ _id: policyToEdit._id, ...data }); else addPolicy(data);
    setIsModalOpen(false); setPolicyToEdit(null); setSearchTerm(''); setDebouncedSearchTerm('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-teal-500" />
        <p className="text-gray-600 ml-3 text-lg">Loading policies...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-red-600 text-xl">Error loading policies: {String(error.message || error)}</p>
      </div>
    );
  }

  return (
    <>
      <Helmet><title>Manage Policies</title></Helmet>
      <motion.div className="max-w-7xl mx-auto p-4 sm:p-6 bg-white rounded-3xl shadow-2xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-green-600 to-teal-500 bg-clip-text text-transparent">Manage Package</h1>
          <motion.button onClick={handleAddPolicyClick} className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 rounded-xl shadow-lg text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} disabled={isMutating}>
            <PlusCircle className="mr-2 h-5 w-5" /> Add Package
          </motion.button>
        </div>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Policy</label>
            <div className="relative">
              <input type="text" placeholder="Search by title or description..." value={searchTerm} onChange={handleSearchChange} className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500" />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>
          <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Filter by Category
  </label>
  <select
    value={selectedCategory}
    onChange={handleCategoryChange}
    className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500"
  >
    <option value="">All Categories</option>
    <option value="All">All</option>
    <option value="Sneakers">Sneakers</option>
    <option value="Formal">Formal</option>
    <option value="Boots">Boots</option>
    <option value="Sandals">Sandals</option>
    <option value="Sports">Sports</option>
    <option value="Loafers">Loafers</option>
    <option value="Heels">Heels</option>
    <option value="Kids">Kids</option>
  </select>
</div>

          <div>
            {(selectedCategory || searchTerm) && (
              <motion.button onClick={handleClearFilters} className="w-full inline-flex items-center justify-center px-4 py-2 rounded-xl text-gray-700 bg-gray-100 hover:bg-gray-200" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <RotateCcw className="mr-2 h-4 w-4" /> Clear Filters
              </motion.button>
            )}
          </div>
        </div>

        {/* Desktop Table */}
        <div className="overflow-x-auto hidden md:block">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Image</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Title</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Age Range</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Coverage</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Premium Rate</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {policies.length === 0 ? (
                <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-500">No policies found.</td></tr>
              ) : (
                policies.map((policy) => (
                  <tr key={policy._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4"><img src={policy.image || 'https://via.placeholder.com/80'} alt={policy.title} className="w-16 h-16 object-cover rounded-md shadow-sm" /></td>
                    <td className="px-4 py-4 font-medium text-gray-900">{policy.title}</td>
                    <td className="px-4 py-4 text-gray-700"><span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">{policy.category}</span></td>
                    <td className="px-4 py-4 text-gray-700">{policy.minAge} - {policy.maxAge}</td>
                    <td className="px-4 py-4 text-gray-700">Tk. {policy.coverageRange}</td>
                    <td className="px-4 py-4 text-gray-700">{(toNumber(policy.basePremiumRate) * 100).toFixed(4)}%</td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2 items-center">
                        <motion.button onClick={() => handleEditPolicyClick(policy)} className="p-2 rounded-full text-blue-600 hover:bg-blue-100" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} disabled={isMutating}><Edit size={20} /></motion.button>
                        <motion.button onClick={() => handleDeletePolicy(policy._id)} className="p-2 rounded-full text-red-600 hover:bg-red-100" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} disabled={isMutating}><Trash2 size={20} /></motion.button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden flex flex-col gap-4">
          {policies.length === 0 ? (
            <div className="py-8 text-center text-gray-500">No policies found.</div>
          ) : (
            policies.map((policy) => (
              <motion.div key={policy._id} className="w-full p-4 bg-white rounded-2xl shadow-lg border border-gray-100" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <div className="flex items-center gap-4 mb-3">
                  <img src={policy.image || 'https://via.placeholder.com/100'} alt={policy.title} className="w-20 h-20 object-cover rounded-lg shadow-md border border-gray-200" />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 leading-tight">{policy.title}</h3>
                    <span className="text-sm px-2 py-0.5 mt-1 font-medium rounded-full bg-blue-100 text-blue-800 inline-block">{policy.category}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{policy.description}</p>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-700 mb-4">
                  <p><strong>Age:</strong> {policy.minAge}-{policy.maxAge}</p>
                  <p><strong>Coverage:</strong> Tk. {policy.coverageRange}</p>
                  <p><strong>Premium:</strong> {(toNumber(policy.basePremiumRate) * 100).toFixed(4)}%</p>
                  <p><strong>Durations:</strong> {safeJoin(policy.durationOptions) || 'N/A'} Yrs</p>
                </div>
                <div className="flex justify-end gap-2">
                  <motion.button onClick={() => handleEditPolicyClick(policy)} className="flex-1 px-4 py-2 rounded-lg bg-blue-500 text-white flex items-center justify-center gap-1 text-sm shadow hover:bg-blue-600 disabled:opacity-50" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} disabled={isMutating}><Edit size={16} /> Edit</motion.button>
                  <motion.button onClick={() => handleDeletePolicy(policy._id)} className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white flex items-center justify-center gap-1 text-sm shadow hover:bg-red-600 disabled:opacity-50" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} disabled={isMutating}><Trash2 size={16} /> Delete</motion.button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <motion.button onClick={handlePrevPage} disabled={currentPage === 1 || isLoading || isMutating} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Previous</motion.button>
            {[...Array(totalPages)].map((_, i) => (
              <motion.button key={i + 1} onClick={() => handlePageChange(i + 1)} className={`px-4 py-2 rounded-lg ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} disabled={isLoading || isMutating}>{i + 1}</motion.button>
            ))}
            <motion.button onClick={handleNextPage} disabled={currentPage === totalPages || isLoading || isMutating} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Next</motion.button>
          </div>
        )}

        {/* Modal */}
        <PolicyModal key={policyToEdit?._id || 'new-policy'} isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setPolicyToEdit(null); }} policyData={policyToEdit} onSubmit={handlePolicyFormSubmit} isMutating={isMutating} />
      </motion.div>
    </>
  );
}

export default ManagePolicies;