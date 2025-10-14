import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { axiosSecure } from "../../hooks/useAxiosSecure";
import { Heart } from "lucide-react"; // for wishlist icon

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const PopularPolicies = () => {
  const [activeTab, setActiveTab] = useState("packages");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: policies = [], isLoading, error } = useQuery({
    queryKey: ["popularPolicies"],
    queryFn: async () => {
      const response = await axiosSecure.get("/policies");
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.policies || [];

      return data
        .sort((a, b) => (b.purchaseCount || 0) - (a.purchaseCount || 0))
        .slice(0, 8); // show 8 for 4-column layout
    },
  });

  const filteredPolicies = policies.filter((policy) =>
    policy.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading)
    return (
      <div className="text-center text-gray-500 py-10 font-medium">
        Loading...
      </div>
    );

  if (error)
    return (
      <div className="text-center text-red-500 py-10 font-medium">
        Error loading data: {error.message}
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-16 bg-white">
      <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 flex items-center justify-center gap-3">
        <span className="w-12 h-[2px] bg-gray-300"></span>
        Best Selling
        <span className="w-12 h-[2px] bg-gray-300"></span>
      </h2>

      {/* Tabs */}
      <div className="flex justify-center gap-3 mb-8">
        {[].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-full text-sm font-medium border transition-all duration-300 ${
              activeTab === tab
                ? "bg-black text-white border-black"
                : "bg-white text-gray-600 border-gray-300 hover:border-black"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex justify-center mb-10">
        <input
          type="text"
          placeholder="Search..."
          className="w-full max-w-md px-5 py-3 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-black"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredPolicies.map((policy) => (
          <motion.div
            key={policy._id}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -5, scale: 1.02 }}
            className="relative bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden group transition-all duration-300 hover:shadow-xl"
          >
            <Link to={`/policyDetails/${policy._id}`} className="block h-full">
              {/* Top Badges */}
              <div className="absolute top-3 left-3 bg-black text-white text-xs font-semibold px-2 py-1 rounded-md shadow">
                New
              </div>
              <button className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition">
                <Heart size={18} />
              </button>

              {/* Image */}
              <div className="relative w-full h-56 overflow-hidden">
                <img
                  src={policy.image || policy.imageUrl}
                  alt={policy.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) =>
                    (e.target.src = "https://via.placeholder.com/300x200")
                  }
                />
              </div>

              {/* Product Info */}
              <div className="p-5 text-center">
                <h3 className="text-base font-semibold text-gray-800 mb-2 line-clamp-1">
                  {policy.title}
                </h3>
                <p className="text-sm text-gray-500 mb-1">Category: {policy.category}</p>

                <div className="flex justify-center items-center gap-2 mt-2">
                  <p className="text-lg font-bold text-gray-900">
                    ৳  {policy.coverageRange || "2,999.00"}
                  </p>
                  {policy.discount && (
                    <p className="text-sm text-gray-400 line-through">
                      ৳  {policy.discount}
                    </p>
                  )}
                </div>

                <p className="text-xs text-gray-400 mt-1">
                  {policy.purchaseCount || 0} sold
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PopularPolicies;
