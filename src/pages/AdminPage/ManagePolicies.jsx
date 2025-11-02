// src/pages/AdminPage/ManagePolicies.jsx
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Edit, Trash2, Loader2, Search, RotateCcw, X } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import { axiosSecure } from '../../hooks/useAxiosSecure';
import { saveImgCloud } from '../../api/utils';

/* ------------------------ utils ------------------------ */
const safeJoin = (arr, sep = ', ') => (Array.isArray(arr) ? arr.join(sep) : '');
const toNumber = (v, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

/* =========================================================================
   usePolicyManagement Hook
   ========================================================================= */
const usePolicyManagement = (page = 1, limit = 9, category = '', search = '') => {
  const queryClient = useQueryClient();

  const {
    data: policiesData = { policies: [], total: 0 },
    isLoading,
    error,
  } = useQuery({
    queryKey: ['policies', page, limit, category, search],
    queryFn: async () => {
      const params = { page, limit };
      if (category) params.category = category;
      if (search) params.search = search;

      const res = await axiosSecure.get('/policies', { params });
      const raw = res.data || { policies: [], total: 0 };

      const policies = (raw.policies || []).map((p) => {
        const normalizedDurations = Array.isArray(p.durationOptions)
          ? p.durationOptions
          : typeof p.durationOptions === 'string'
          ? p.durationOptions
              .split(',')
              .map((x) => toNumber(x.trim()))
              .filter(Boolean)
          : [];

        return {
          ...p,
          title: p.title || p.name || 'Untitled Policy',
          category: p.category || 'General',
          image: p.image || p.imageUrl || '',
          minAge: toNumber(p.minAge),
          maxAge: toNumber(p.maxAge),
          basePremiumRate: toNumber(p.basePremiumRate),
          durationOptions: normalizedDurations,
          benefits: Array.isArray(p.benefits)
            ? p.benefits
            : p.benefits
            ? [String(p.benefits)]
            : [],
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

  const preparePolicyData = async (data) => {
    let policyImageURL = data.image; // existing URL by default
    if (data.imageFile) {
      const url = await saveImgCloud(data.imageFile);
      policyImageURL = url;
    }
    const finalData = { ...data, image: policyImageURL };
    delete finalData.imageFile;

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

  const isMutating =
    addPolicyMutation.isPending ||
    updatePolicyMutation.isPending ||
    deletePolicyMutation.isPending;

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

/* =========================================================================
   useFoods Hook (GET list + CREATE + UPDATE + DELETE)
   ========================================================================= */
const useFoods = (
  page = 1,
  limit = 10,
  search = '',
  nutType = '',
  minPrice = '',
  maxPrice = '',
  sort = '-createdAt'
) => {
  const queryClient = useQueryClient();

  const { data = { foods: [], total: 0 }, isLoading, error } = useQuery({
    queryKey: ['foods', { page, limit, search, nutType, minPrice, maxPrice, sort }],
    queryFn: async () => {
      const params = { page, limit };
      if (search) params.search = search;
      if (nutType) params.nutType = nutType;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (sort) params.sort = sort;

      const res = await axiosSecure.get('/foods', { params });
      const payload = res.data || {};
      return { foods: payload.foods || [], total: payload.total || 0 };
    },
    placeholderData: (prev) => prev,
    staleTime: 5 * 60 * 1000,
  });

  const createFoodMutation = useMutation({
    mutationFn: async (newFood) => {
      const res = await axiosSecure.post('/foods', newFood, { withCredentials: true });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foods'] });
      Swal.fire({ icon: 'success', title: 'Food created!', timer: 1500, showConfirmButton: false });
    },
    onError: (err) => {
      Swal.fire({ icon: 'error', title: 'Failed to create', text: err?.response?.data?.message || 'Something went wrong' });
    },
  });

  const updateFoodMutation = useMutation({
    mutationFn: async (updatedFood) => {
      const res = await axiosSecure.patch(`/foods/${updatedFood._id}`, updatedFood, { withCredentials: true });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foods'] });
      Swal.fire({ icon: 'success', title: 'Food updated!', timer: 1200, showConfirmButton: false });
    },
    onError: (err) => {
      Swal.fire({ icon: 'error', title: 'Failed to update', text: err?.response?.data?.message || 'Something went wrong' });
    },
  });

  const deleteFoodMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axiosSecure.delete(`/foods/${id}`, { withCredentials: true });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foods'] });
      Swal.fire({ icon: 'success', title: 'Food deleted!', timer: 1200, showConfirmButton: false });
    },
    onError: (err) => {
      Swal.fire({ icon: 'error', title: 'Failed to delete', text: err?.response?.data?.message || 'Something went wrong' });
    },
  });

  return {
    foods: data.foods,
    foodsTotal: data.total,
    isFoodsLoading: isLoading,
    foodsError: error,
    createFood: createFoodMutation.mutateAsync,
    updateFood: updateFoodMutation.mutateAsync,
    deleteFood: deleteFoodMutation.mutateAsync,
    isCreatingFood: createFoodMutation.isPending,
    isFoodMutating: updateFoodMutation.isPending || deleteFoodMutation.isPending,
  };
};

/* =========================================================================
   PolicyModal
   ========================================================================= */
const PolicyModal = ({ isOpen, onClose, policyData, onSubmit, isMutating }) => {
  const [formData, setFormData] = useState(() =>
    policyData
      ? {
          ...policyData,
          durationOptions: policyData.durationOptions || [],
          imageUrl: policyData.image || '',
          benefits: policyData.benefits && policyData.benefits.length > 0 ? policyData.benefits : [''],
        }
      : {
          title: '',
          category: '',
          description: '',
          minAge: '',
          maxAge: '',
          coverageRange: '',
          durationOptions: [],
          basePremiumRate: '',
          imageUrl: '',
          benefits: [''],
          eligibility: '',
          premiumLogicNote: '',
        }
  );
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (policyData) {
      setFormData({
        ...policyData,
        durationOptions: policyData.durationOptions || [],
        imageUrl: policyData.image || '',
        benefits: policyData.benefits && policyData.benefits.length > 0 ? policyData.benefits : [''],
      });
    }
  }, [policyData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'minAge' || name === 'maxAge' || name === 'basePremiumRate') {
      setFormData({ ...formData, [name]: Number(value) });
    } else if (name === 'durationOptions') {
      const durations = value
        .split(',')
        .map((d) => Number(d.trim()))
        .filter((d) => !isNaN(d) && d > 0);
      setFormData({ ...formData, [name]: durations });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    setImageFile(file || null);
    setFormData((prev) => ({ ...prev, imageUrl: file ? URL.createObjectURL(file) : policyData?.image || '' }));
  };

  const handleBenefitChange = (index, value) => {
    const next = [...formData.benefits];
    next[index] = value;
    setFormData({ ...formData, benefits: next });
  };

  const addBenefitField = () => setFormData({ ...formData, benefits: [...formData.benefits, ''] });
  const removeBenefitField = (index) => {
    const next = formData.benefits.filter((_, i) => i !== index);
    setFormData({ ...formData, benefits: next.length > 0 ? next : [''] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSubmit = {
      ...formData,
      minAge: Number(formData.minAge),
      maxAge: Number(formData.maxAge),
      basePremiumRate: Number(formData.basePremiumRate),
      durationOptions: formData.durationOptions.map(Number),
      benefits: formData.benefits.filter((b) => b.trim() !== ''),
    };
    onSubmit({ ...dataToSubmit, imageFile, image: policyData?.image });
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-200 bg-opacity-50 p-4 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleOverlayClick}
        >
          <motion.div
            className="relative bg-white w-full max-w-lg p-6 rounded-2xl shadow-xl transform overflow-y-auto max-h-[90vh]"
            initial={{ scale: 0.95, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 30 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
              <X size={22} />
            </button>

            <h2 className="text-2xl font-extrabold text-gray-800 mb-4">{policyData ? 'Edit Policy' : 'Add New Policy'}</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Policy Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Age</label>
                  <input
                    type="number"
                    name="minAge"
                    value={formData.minAge}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Age</label>
                  <input
                    type="number"
                    name="maxAge"
                    value={formData.maxAge}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                    min={formData.minAge || 0}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coverage Range</label>
                <input
                  type="text"
                  name="coverageRange"
                  value={formData.coverageRange}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                  placeholder="e.g., 100000 – 5000000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration Options</label>
                <input
                  type="text"
                  name="durationOptions"
                  value={formData.durationOptions.join(', ')}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                  placeholder="e.g., 5,10,15"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Base Premium Rate</label>
                <input
                  type="number"
                  step="0.000001"
                  name="basePremiumRate"
                  value={formData.basePremiumRate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Policy Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-2 border rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0"
                />
                {formData.imageUrl && (
                  <div className="mt-2">
                    <img src={formData.imageUrl} alt="Policy" className="w-28 h-28 object-cover rounded-lg border" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Benefits</label>
                {formData.benefits.map((b, i) => (
                  <div key={i} className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={b}
                      onChange={(e) => handleBenefitChange(i, e.target.value)}
                      className="flex-1 px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder={`Benefit ${i + 1}`}
                    />
                    {formData.benefits.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBenefitField(i)}
                        className="p-2 rounded-full text-red-500 hover:bg-red-100"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addBenefitField}
                  className="mt-2 inline-flex items-center px-4 py-2 rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  <PlusCircle className="mr-2 h-5 w-5" /> Add Benefit
                </button>
              </div>

              <motion.button
                type="submit"
                className="w-full flex justify-center items-center px-6 py-3 rounded-xl text-white bg-gradient-to-r from-teal-500 to-green-600"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isMutating}
              >
                {isMutating ? <Loader2 className="h-5 w-5 mr-3 animate-spin" /> : null}
                {policyData ? (isMutating ? 'Updating Policy...' : 'Update Policy') : isMutating ? 'Adding Policy...' : 'Add Policy'}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* =========================================================================
   FoodModal
   ========================================================================= */
const FoodModal = ({ isOpen, onClose, initial, onSubmit, isMutating }) => {
  const [form, setForm] = useState(() => initial || {
    title: '', description: '', nutType: '', qtyKg: '', pricePerKg: '', sellerName: '', image: ''
  });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (initial) setForm(initial);
    else setForm({ title: '', description: '', nutType: '', qtyKg: '', pricePerKg: '', sellerName: '', image: '' });
  }, [initial]);

  const handle = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleImage = (e) => {
    const f = e.target.files?.[0];
    setImageFile(f || null);
    if (f) setForm((prev) => ({ ...prev, image: URL.createObjectURL(f) }));
  };

  const submit = async (e) => {
    e.preventDefault();
    let imageUrl = initial?.image || '';
    if (imageFile) imageUrl = await saveImgCloud(imageFile);

    const payload = {
      _id: initial?._id,
      title: form.title.trim(),
      description: form.description.trim(),
      nutType: form.nutType,
      qtyKg: Number(form.qtyKg),
      pricePerKg: Number(form.pricePerKg),
      sellerName: form.sellerName.trim(),
      image: imageUrl,
    };

    if (!payload.title || !payload.description || !payload.nutType || !payload.qtyKg || !payload.pricePerKg || !payload.sellerName) {
      return Swal.fire({ icon: 'warning', title: 'Missing fields', text: 'সবগুলো প্রয়োজনীয় তথ্য দিন।' });
    }
    onSubmit(payload);
  };

  const closeOverlay = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-200/60 p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeOverlay}>
          <motion.div className="relative bg-white w-full max-w-lg p-6 rounded-2xl shadow-xl"
            initial={{ scale: .95, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: .95, y: 30 }}
            onClick={(e) => e.stopPropagation()}>
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
              <X size={22} />
            </button>
            <h3 className="text-2xl font-bold mb-4">{initial ? 'Edit Food' : 'Add Food'}</h3>

            <form onSubmit={submit} className="space-y-4">
              <input name="title" value={form.title} onChange={handle} placeholder="Title" className="w-full px-4 py-2 border rounded-lg" required />
              <textarea name="description" value={form.description} onChange={handle} rows="2" className="w-full px-4 py-2 border rounded-lg" placeholder="Description" required />
              <select name="nutType" value={form.nutType} onChange={handle} className="w-full px-4 py-2 border rounded-lg" required>
                <option value="">-- Select Nut --</option>
                <option value="almond">Medjool Dates(মেডজুল খেজুর)</option>
                <option value="cashew"> Ajwa Dates(আজওয়া খেজুর)</option>
                <option value="peanut">Kamranga Morium Dates(কামরাঙ্গা মরিয়ম খেজুর)</option>
                <option value="pistachio">Sukkari Dates(সুক্কারি খেজুর)</option>
                <option value="walnut">Mabrum Dates (A Grade)</option>
                <option value="hazelnut">Others Organic Foods( অন্যান্য অর্গানিক খাবার)
</option>
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" name="qtyKg" value={form.qtyKg} onChange={handle} min="1" className="px-4 py-2 border rounded-lg" placeholder="Qty (kg)" required />
                <input type="number" name="pricePerKg" value={form.pricePerKg} onChange={handle} min="0" className="px-4 py-2 border rounded-lg" placeholder="Price/kg (৳)" required />
              </div>
              <input name="sellerName" value={form.sellerName} onChange={handle} placeholder="Seller Name" className="w-full px-4 py-2 border rounded-lg" required />
              <div>
                <input type="file" accept="image/*" onChange={handleImage} className="w-full px-4 py-2 border rounded-lg file:mr-4 file:px-3 file:py-1.5 file:rounded-full" />
                {form.image && <img src={form.image} alt="" className="mt-2 w-28 h-28 rounded-lg object-cover border" />}
              </div>
              <motion.button type="submit" disabled={isMutating} className="w-full px-5 py-3 rounded-xl text-white bg-gradient-to-r from-teal-500 to-green-600">
                {isMutating ? 'Saving...' : (initial ? 'Update' : 'Create')}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* =========================================================================
   ManagePolicies (main)
   ========================================================================= */
function ManagePolicies() {
  /* ---------- POLICIES ---------- */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [policyToEdit, setPolicyToEdit] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  /* ---------- FOODS ---------- */
  const [foodPage, setFoodPage] = useState(1);
  const [foodLimit] = useState(10);
  const [foodSearch, setFoodSearch] = useState('');
  const [foodDebouncedSearch, setFoodDebouncedSearch] = useState('');
  const [nutType, setNutType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('-createdAt');

  // Food modal state
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [foodToEdit, setFoodToEdit] = useState(null);

  /* Debounce searches */
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500);
    return () => clearTimeout(id);
  }, [searchTerm]);

  useEffect(() => {
    const id = setTimeout(() => setFoodDebouncedSearch(foodSearch), 500);
    return () => clearTimeout(id);
  }, [foodSearch]);

  /* Hooks: Policies */
  const {
    policies,
    totalPolicies,
    isLoading,
    error,
    addPolicy,
    updatePolicy,
    deletePolicy,
    isMutating,
  } = usePolicyManagement(currentPage, itemsPerPage, selectedCategory, debouncedSearchTerm);

  /* Hooks: Foods */
  const {
    foods,
    foodsTotal,
    isFoodsLoading,
    foodsError,
    createFood,
    updateFood,
    deleteFood,
    isCreatingFood,
    isFoodMutating,
  } = useFoods(foodPage, foodLimit, foodDebouncedSearch, nutType, minPrice, maxPrice, sort);

  /* Policies handlers */
  const totalPages = Math.max(1, Math.ceil((totalPolicies || 0) / itemsPerPage));
  const handlePageChange = (n) => setCurrentPage(n);
  const handlePrevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
  };
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };
  const handleClearFilters = () => {
    setSelectedCategory('');
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setCurrentPage(1);
  };

  const handleAddPolicyClick = () => {
    setPolicyToEdit(null);
    setIsModalOpen(true);
  };
  const handleEditPolicyClick = (policy) => {
    setPolicyToEdit(policy);
    setIsModalOpen(true);
  };

  const handleDeletePolicy = async (policyId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    });
    if (result.isConfirmed) deletePolicy(policyId);
  };

  const handlePolicyFormSubmit = (data) => {
    if (policyToEdit) updatePolicy({ _id: policyToEdit._id, ...data });
    else addPolicy(data);
    setIsModalOpen(false);
    setPolicyToEdit(null);
    setSearchTerm('');
    setDebouncedSearchTerm('');
  };

  /* Foods handlers */
  const foodsTotalPages = Math.max(1, Math.ceil((foodsTotal || 0) / foodLimit));
  const handleFoodsPageChange = (n) => setFoodPage(n);
  const handleFoodsPrev = () => setFoodPage((p) => Math.max(1, p - 1));
  const handleFoodsNext = () => setFoodPage((p) => Math.min(foodsTotalPages, p + 1));

  const resetFoodFilters = () => {
    setFoodSearch('');
    setFoodDebouncedSearch('');
    setNutType('');
    setMinPrice('');
    setMaxPrice('');
    setSort('-createdAt');
    setFoodPage(1);
  };

  const openCreateFood = () => {
    setFoodToEdit(null);
    setIsFoodModalOpen(true);
  };
  const onFoodEdit = (f) => {
    setFoodToEdit(f);
    setIsFoodModalOpen(true);
  };
  const onFoodDelete = async (id) => {
    const ok = await Swal.fire({
      title: 'Are you sure?',
      text: 'Delete this item?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
    });
    if (ok.isConfirmed) await deleteFood(id);
  };
  const handleFoodModalSubmit = async (payload) => {
    if (payload._id) {
      await updateFood(payload);
    } else {
      // convert to backend POST payload shape
      await createFood({
        title: payload.title,
        description: payload.description,
        nutType: payload.nutType,
        qty: payload.qtyKg,
        price: payload.pricePerKg,
        seller: payload.sellerName,
        imageUrl: payload.image,
      });
    }
    setIsFoodModalOpen(false);
    setFoodToEdit(null);
    setFoodPage(1);
  };

  /* Loading / error for policies */
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
      <Helmet>
        <title>Manage Policies & Foods</title>
      </Helmet>

      <motion.div
        className="max-w-7xl mx-auto p-4 sm:p-6 bg-white rounded-3xl shadow-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-green-600 to-teal-500 bg-clip-text text-transparent">
              Add Food
            </h1>
            <button
              onClick={openCreateFood}
              className="mt-4 px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg shadow-md transition"
            >
              Add Now
            </button>
          </div>

          <motion.button
            onClick={handleAddPolicyClick}
            className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 rounded-xl shadow-lg text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isMutating}
          >
            <PlusCircle className="mr-2 h-5 w-5" /> Add Package
          </motion.button>
        </div>

        {/* -------------------- POLICIES SECTION -------------------- */}
        <div className="mb-2">
          <h2 className="text-2xl font-bold mb-3">Policies</h2>
        </div>

        {/* Filters (Policies) */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Policy</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by title or description..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Category</label>
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
              <motion.button
                onClick={handleClearFilters}
                className="w-full inline-flex items-center justify-center px-4 py-2 rounded-xl text-gray-700 bg-gray-100 hover:bg-gray-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <RotateCcw className="mr-2 h-4 w-4" /> Clear Filters
              </motion.button>
            )}
          </div>
        </div>

        {/* Desktop Table (Policies) */}
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
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">No policies found.</td>
                </tr>
              ) : (
                policies.map((policy) => (
                  <tr key={policy._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <img
                        src={policy.image || 'https://via.placeholder.com/80'}
                        alt={policy.title}
                        className="w-16 h-16 object-cover rounded-md shadow-sm"
                      />
                    </td>
                    <td className="px-4 py-4 font-medium text-gray-900">{policy.title}</td>
                    <td className="px-4 py-4 text-gray-700">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">{policy.category}</span>
                    </td>
                    <td className="px-4 py-4 text-gray-700">{policy.minAge} - {policy.maxAge}</td>
                    <td className="px-4 py-4 text-gray-700">Tk. {policy.coverageRange}</td>
                    <td className="px-4 py-4 text-gray-700">{(toNumber(policy.basePremiumRate) * 100).toFixed(4)}%</td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2 items-center">
                        <motion.button
                          onClick={() => handleEditPolicyClick(policy)}
                          className="p-2 rounded-full text-blue-600 hover:bg-blue-100"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          disabled={isMutating}
                        >
                          <Edit size={20} />
                        </motion.button>
                        <motion.button
                          onClick={() => handleDeletePolicy(policy._id)}
                          className="p-2 rounded-full text-red-600 hover:bg-red-100"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          disabled={isMutating}
                        >
                          <Trash2 size={20} />
                        </motion.button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards (Policies) */}
        <div className="md:hidden flex flex-col gap-4">
          {policies.length === 0 ? (
            <div className="py-8 text-center text-gray-500">No policies found.</div>
          ) : (
            policies.map((policy) => (
              <motion.div
                key={policy._id}
                className="w-full p-4 bg-white rounded-2xl shadow-lg border border-gray-100"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-4 mb-3">
                  <img
                    src={policy.image || 'https://via.placeholder.com/100'}
                    alt={policy.title}
                    className="w-20 h-20 object-cover rounded-lg shadow-md border"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 leading-tight">{policy.title}</h3>
                    <span className="text-sm px-2 py-0.5 mt-1 font-medium rounded-full bg-blue-100 text-blue-800 inline-block">
                      {policy.category}
                    </span>
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
                  <motion.button
                    onClick={() => handleEditPolicyClick(policy)}
                    className="flex-1 px-4 py-2 rounded-lg bg-blue-500 text-white flex items-center justify-center gap-1 text-sm hover:bg-blue-600 disabled:opacity-50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={isMutating}
                  >
                    <Edit size={16} /> Edit
                  </motion.button>
                  <motion.button
                    onClick={() => handleDeletePolicy(policy._id)}
                    className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white flex items-center justify-center gap-1 text-sm hover:bg-red-600 disabled:opacity-50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={isMutating}
                  >
                    <Trash2 size={16} /> Delete
                  </motion.button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Pagination (Policies) */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <motion.button
              onClick={handlePrevPage}
              disabled={currentPage === 1 || isLoading || isMutating}
              className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Previous
            </motion.button>

            {Array.from({ length: totalPages }).map((_, i) => (
              <motion.button
                key={i + 1}
                onClick={() => handlePageChange(i + 1)}
                className={`px-4 py-2 rounded-lg ${
                  currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isLoading || isMutating}
              >
                {i + 1}
              </motion.button>
            ))}

            <motion.button
              onClick={handleNextPage}
              disabled={currentPage === totalPages || isLoading || isMutating}
              className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Next
            </motion.button>
          </div>
        )}

        {/* -------------------- FOODS SECTION -------------------- */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Foods</h2>
          </div>

          {/* Foods Filters */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search Foods</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by title, description, seller..."
                  value={foodSearch}
                  onChange={(e) => {
                    setFoodSearch(e.target.value);
                    setFoodPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-teal-500"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nut Type</label>
              <select
                value={nutType}
                onChange={(e) => {
                  setNutType(e.target.value);
                  setFoodPage(1);
                }}
                className="w-full px-4 py-2 border rounded-lg focus:ring-teal-500"
              >
                <option value="">All</option>
                <option value="almond">Almond</option>
                <option value="cashew">Cashew</option>
                <option value="peanut">Peanut</option>
                <option value="pistachio">Pistachio</option>
                <option value="walnut">Walnut</option>
                <option value="hazelnut">Hazelnut</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value);
                    setFoodPage(1);
                  }}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500"
                  placeholder="৳"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    setFoodPage(1);
                  }}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500"
                  placeholder="৳"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort</label>
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    setFoodPage(1);
                  }}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-teal-500"
                >
                  <option value="-createdAt">Newest</option>
                  <option value="createdAt">Oldest</option>
                  <option value="pricePerKg">Price (Low→High)</option>
                  <option value="-pricePerKg">Price (High→Low)</option>
                  <option value="title">Title (A→Z)</option>
                  <option value="-title">Title (Z→A)</option>
                </select>
              </div>

              <div className="flex items-end">
                {(nutType || minPrice || maxPrice || foodSearch || sort !== '-createdAt') && (
                  <motion.button
                    onClick={resetFoodFilters}
                    className="w-full inline-flex items-center justify-center px-4 py-2 rounded-xl text-gray-700 bg-gray-100 hover:bg-gray-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" /> Reset
                  </motion.button>
                )}
              </div>
            </div>
          </div>

          {/* Foods Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Image</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Title</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nut</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Qty (kg)</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Price/kg (৳)</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Seller</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isFoodsLoading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">Loading foods...</td>
                  </tr>
                ) : foodsError ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-red-500">Failed to load foods.</td>
                  </tr>
                ) : foods.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">No foods found.</td>
                  </tr>
                ) : (
                  foods.map((f) => (
                    <tr key={f._id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <img
                          src={f.image || 'https://via.placeholder.com/80'}
                          alt={f.title}
                          className="w-16 h-16 object-cover rounded-md shadow-sm"
                        />
                      </td>
                      <td className="px-4 py-4 font-medium text-gray-900">{f.title}</td>
                      <td className="px-4 py-4 text-gray-700 capitalize">{f.nutType}</td>
                      <td className="px-4 py-4 text-gray-700">{f.qtyKg}</td>
                      <td className="px-4 py-4 text-gray-700">{f.pricePerKg}</td>
                      <td className="px-4 py-4 text-gray-700">{f.sellerName}</td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2 items-center">
                          <motion.button
                            onClick={() => onFoodEdit(f)}
                            className="p-2 rounded-full text-blue-600 hover:bg-blue-100"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            disabled={isFoodMutating || isCreatingFood}
                          >
                            <Edit size={20} />
                          </motion.button>
                          <motion.button
                            onClick={() => onFoodDelete(f._id)}
                            className="p-2 rounded-full text-red-600 hover:bg-red-100"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            disabled={isFoodMutating || isCreatingFood}
                          >
                            <Trash2 size={20} />
                          </motion.button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Foods Pagination */}
          {foodsTotalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <motion.button
                onClick={handleFoodsPrev}
                disabled={foodPage === 1 || isFoodsLoading}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Previous
              </motion.button>

              {Array.from({ length: foodsTotalPages }).map((_, i) => (
                <motion.button
                  key={i + 1}
                  onClick={() => handleFoodsPageChange(i + 1)}
                  className={`px-4 py-2 rounded-lg ${
                    foodPage === i + 1 ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isFoodsLoading}
                >
                  {i + 1}
                </motion.button>
              ))}

              <motion.button
                onClick={handleFoodsNext}
                disabled={foodPage === foodsTotalPages || isFoodsLoading}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Next
              </motion.button>
            </div>
          )}
        </div>

        {/* Modals */}
        <PolicyModal
          key={policyToEdit?._id || 'new-policy'}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setPolicyToEdit(null);
          }}
          policyData={policyToEdit}
          onSubmit={handlePolicyFormSubmit}
          isMutating={isMutating}
        />

        <FoodModal
          isOpen={isFoodModalOpen}
          onClose={() => {
            setIsFoodModalOpen(false);
            setFoodToEdit(null);
          }}
          initial={foodToEdit}
          onSubmit={handleFoodModalSubmit}
          isMutating={isFoodMutating || isCreatingFood}
        />
      </motion.div>
    </>
  );
}

export default ManagePolicies;
