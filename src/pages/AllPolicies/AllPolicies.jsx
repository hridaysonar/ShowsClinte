import React, { useState, useEffect } from "react";
import { axiosSecure } from "../../hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import LoadingSpinner from "../../components/Shared/Spinner/LoadingSpinner";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const AllPolicies = () => {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const limit = 8; // 4-column layout

  const { data, isLoading } = useQuery({
    queryKey: ["policies", page, category, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", limit);
      if (category) params.append("category", category);
      if (search) params.append("search", search);
      const res = await axiosSecure.get(`/policies?${params.toString()}`);
      return res.data;
    },
    keepPreviousData: true,
  });

  useEffect(() => {
    setPage(1);
  }, [category, search]);

  if (isLoading && !data) return <LoadingSpinner />;

  const categories = [
    "All",
    "Sneakers",
    "Formal",
    "Boots",
    "Sandals",
    "Sports",
    "Loafers",
    "Heels",
    "Kids",
  ];

  const totalPages = Math.ceil((data?.total || 0) / limit);

  return (
    <div className="container mx-auto px-4 py-16 bg-white">
      <h2 className="text-4xl font-extrabold text-center mb-12 text-gray-800">
        All Shoes
      </h2>

      {/* 🔍 Search + Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
        <input
          type="text"
          placeholder="Search shoes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-1/3 px-5 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black transition"
        />

        <div className="flex flex-wrap justify-center gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat === "All" ? "" : cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium border transition-all duration-300 ${
                category === cat || (cat === "All" && !category)
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-600 border-gray-300 hover:border-black"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 🛍️ Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {data?.policies?.length > 0 ? (
          data.policies.map((policy) => (
            <motion.div
              key={policy._id}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ y: -5, scale: 1.02 }}
              className="relative bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden group transition-all duration-300 hover:shadow-xl"
            >
              <Link to={`/policyDetails/${policy._id}`} className="block h-full">
                {/* Badges */}
                <div className="absolute top-3 left-3 bg-black text-white text-xs font-semibold px-2 py-1 rounded-md shadow">
                  New
                </div>
                <button
                  type="button"
                  className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition"
                >
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

                {/* Info */}
                <div className="p-5 text-center">
                  <h3 className="text-base font-semibold text-gray-800 mb-2 line-clamp-1">
                    {policy.title || policy.productName}
                  </h3>
                  <p className="text-sm text-gray-500 mb-1">
                    {policy.category || "Shoes"}
                  </p>

                  <div className="flex justify-center items-center gap-2 mt-2">
                    <p className="text-lg font-bold text-gray-900">
                      ৳  {policy.price || policy.coverageRange || "2999.00"}
                    </p>
                    {policy.discountPrice && (
                      <p className="text-sm text-gray-400 line-through">
                        ৳  {policy.discountPrice}
                      </p>
                    )}
                  </div>

                  <p className="text-xs text-gray-400 mt-1">
                    {policy.purchaseCount || 0} sold
                  </p>
                </div>
              </Link>
            </motion.div>
          ))
        ) : (
          <p className="text-center text-gray-600 col-span-full">
            No shoes found.
          </p>
        )}
      </div>

      {/* 📄 Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-10 flex-wrap">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-10 h-10 rounded-full text-sm font-medium ${
                page === i + 1
                  ? "bg-black text-white"
                  : "bg-white text-gray-800 border border-gray-300"
              } transition-all`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllPolicies;
