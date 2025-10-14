import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
// Using native modal instead of @headlessui/react Dialog
import { X, Calendar, Eye, Heart, Sparkles, BookOpen, ArrowRight, Coffee } from 'lucide-react';
import { axiosSecure } from '../../hooks/useAxiosSecure';

const LatestBlogsSection = () => {
    const queryClient = useQueryClient();
    const [selectedBlog, setSelectedBlog] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Format date function
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return 'Invalid Date';
        }
    };

    // Fetch latest 4 blogs
    const { data: blogs = [], isLoading, error } = useQuery({
        queryKey: ['latest-blogs'],
        queryFn: async () => {
            try {
                const res = await axiosSecure.get('/blogs?limit=4&sort=-publishDate');
                return res.data || [];
            } catch (error) {
                console.error('Error fetching latest blogs:', error);
                throw error;
            }
        },
        retry: 2,
        refetchOnWindowFocus: false,
    });

    // Update visit count mutation
    const updateVisitCount = useMutation({
        mutationFn: async (blogId) => {
            try {
                const res = await axiosSecure.patch(`/blogs/${blogId}/visit`);
                return res.data;
            } catch (error) {
                console.error('Error updating visit count:', error);
                throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['latest-blogs']);
        },
        onError: (error) => {
            console.error('Failed to update visit count:', error);
        },
    });

    // Handle read more
    const handleReadMore = (blog) => {
        setSelectedBlog(blog);
        setIsModalOpen(true);
        if (blog._id) {
            updateVisitCount.mutate(blog._id);
        }
    };

    // Close modal
    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedBlog(null), 300);
    };

    // Truncate text helper
    const truncateText = (text, maxLength = 80) => {
        if (!text) return 'No content available...';
        return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
    };

    // Navigate to all blogs (you'll need to implement this based on your routing)
    const handleViewAllBlogs = () => {
        // Replace with your navigation logic
        window.location.href = '/blogs';
        // Or if using React Router: navigate('/blogs');
    };



    if (error || blogs.length === 0) {
        return null; // Hide section if no blogs or error
    }

    return (
        <>
            <section className="mt-10 mb-10 rounded-2xl py-16 bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100 relative overflow-hidden">
                {/* Floatin g decorative elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(4)].map((_, i) => (
                        <motion.div
                            key={i}
                            className={`absolute text-2xl ${i % 2 === 0 ? 'text-pink-200' : 'text-purple-200'}`}
                            animate={{
                                y: [-15, -25, -15],
                                x: [0, 8, 0],
                                rotate: [0, 3, 0]
                            }}
                            transition={{
                                duration: 3 + i,
                                repeat: Infinity,
                                delay: i * 0.7
                            }}
                            style={{
                                left: `${15 + i * 20}%`,
                                top: `${15 + i * 15}%`
                            }}
                        >
                            {i % 3 === 0 ? '✨' : i % 3 === 1 ? '🌸' : '💫'}
                        </motion.div>
                    ))}
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    {/* Section Header */}
                    <motion.div
                        className="text-center mb-12"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <motion.h2
                            className="text-4xl font-black mb-4"
                            animate={{
                                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                            style={{
                                background: 'linear-gradient(45deg, #ec4899, #8b5cf6, #06b6d4, #ec4899)',
                                backgroundSize: '300% 300%',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}
                        >
                            ✨ Latest Stories ✨
                        </motion.h2>
                        <motion.p
                            className="text-gray-600 text-lg font-medium flex items-center justify-center gap-2"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                        >
                            <Heart className="text-pink-500" size={20} />
                            Fresh magical insights just for you
                            <Sparkles className="text-purple-500" size={20} />
                        </motion.p>
                    </motion.div>

                    {/* Blog Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
                        {blogs.map((blog, index) => (
                            <motion.div
                                key={blog._id}
                                className="group"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                                <motion.div
                                    className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 border border-pink-100 overflow-hidden relative h-full"
                                    whileHover={{
                                        y: -5,
                                        boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.15)"
                                    }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {/* Blog Image */}
                                    <div className="relative overflow-hidden">
                                        <motion.img
                                            src={blog.blogImageUrl || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=300&h=180&fit=crop&crop=entropy&auto=format&q=80'}
                                            alt={blog.title}
                                            className="w-full h-40 object-cover"
                                            whileHover={{ scale: 1.05 }}
                                            transition={{ duration: 0.3 }}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=300&h=180&fit=crop&crop=entropy&auto=format&q=80";
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

                                        {/* Visit count badge */}
                                        <div className="absolute top-3 right-3">
                                            <motion.div
                                                className="bg-white/90 backdrop-blur-sm text-gray-700 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-md"
                                                whileHover={{ scale: 1.1 }}
                                            >
                                                <Eye size={10} className="text-pink-500" />
                                                <span>{blog.visitCount || 0}</span>
                                            </motion.div>
                                        </div>
                                    </div>

                                    {/* Blog Content */}
                                    <div className="p-4 flex flex-col h-[calc(100%-10rem)]">
                                        <motion.h3
                                            className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-pink-600 transition-colors flex-shrink-0"
                                            initial={{ opacity: 0.8 }}
                                            whileHover={{ opacity: 1 }}
                                        >
                                            {blog.title || 'Untitled Story'}
                                        </motion.h3>

                                        <p className="text-gray-600 mb-3 line-clamp-2 text-sm leading-relaxed flex-grow">
                                            {truncateText(blog.content, 100)}
                                        </p>

                                        {/* Author and date info */}
                                        <div className="flex items-center justify-between mb-3 text-xs text-gray-500">
                                            <div className="flex items-center">
                                                <img
                                                    src={blog.authorImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(blog.authorName || 'Author')}&background=ec4899&color=fff&size=24&rounded=true`}
                                                    alt={blog.authorName}
                                                    className="w-5 h-5 rounded-full mr-2"
                                                />
                                                <span className="font-medium truncate">{blog.authorName || 'Anonymous'}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <Calendar size={8} className="mr-1 text-pink-400" />
                                                <span>{formatDate(blog.publishDate)}</span>
                                            </div>
                                        </div>

                                        {/* Read More Button */}
                                        <motion.button
                                            onClick={() => handleReadMore(blog)}
                                            className="w-full py-2 px-3 bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-500 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm"
                                            whileHover={{
                                                scale: 1.02,
                                                boxShadow: "0 8px 25px rgba(236, 72, 153, 0.3)"
                                            }}
                                            whileTap={{ scale: 0.98 }}
                                            disabled={updateVisitCount.isLoading}
                                        >
                                            {updateVisitCount.isLoading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                                                    Loading...
                                                </>
                                            ) : (
                                                <>
                                                    <Heart size={12} />
                                                    Read More
                                                    <Sparkles size={12} />
                                                </>
                                            )}
                                        </motion.button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        ))}
                    </div>

                    {/* View All Blogs Button */}
                    <motion.div
                        className="text-center"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <motion.button
                            onClick={handleViewAllBlogs}
                            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 text-lg"
                            whileHover={{
                                scale: 1.05,
                                boxShadow: "0 15px 35px rgba(236, 72, 153, 0.4)"
                            }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <BookOpen size={20} />
                            <span>✨ View All Story & Articles ✨</span>
                            <motion.div
                                animate={{ x: [0, 5, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            >
                                <ArrowRight size={20} />
                            </motion.div>
                        </motion.button>
                    </motion.div>
                </div>
            </section>

            {/* Modal for blog details */}
            <AnimatePresence>
                {isModalOpen && selectedBlog && (
                    <div className="fixed z-50 inset-0">
                        <motion.div
                            className="fixed inset-0 bg-black/50 backdrop-blur-md"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeModal}
                        />

                        <div className="fixed inset-0 flex items-center justify-center p-4">
                            <motion.div
                                className="bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl relative"
                                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8, y: 50 }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            >
                                {/* Modal Header */}
                                <div className="sticky top-0 bg-gradient-to-r from-pink-50 to-purple-50 border-b border-pink-200 p-6 rounded-t-3xl z-10">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 pr-4">
                                            <motion.h1
                                                className="text-3xl font-bold mb-3"
                                                style={{
                                                    background: 'linear-gradient(45deg, #ec4899, #8b5cf6)',
                                                    WebkitBackgroundClip: 'text',
                                                    WebkitTextFillColor: 'transparent',
                                                    backgroundClip: 'text'
                                                }}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                            >
                                                ✨ {selectedBlog.title}
                                            </motion.h1>
                                            <div className="flex items-center text-sm text-gray-600 flex-wrap gap-4">
                                                <div className="flex items-center gap-2">
                                                    <img
                                                        src={selectedBlog.authorImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedBlog.authorName || 'Author')}&background=ec4899&color=fff&size=24&rounded=true`}
                                                        alt={selectedBlog.authorName}
                                                        className="w-6 h-6 rounded-full border border-pink-200"
                                                    />
                                                    <span className="font-medium">By {selectedBlog.authorName}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Calendar size={14} className="text-pink-400" />
                                                    <span>{formatDate(selectedBlog.publishDate)}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Eye size={14} className="text-purple-400" />
                                                    <span>{selectedBlog.visitCount || 0} views</span>
                                                </div>
                                            </div>
                                        </div>
                                        <motion.button
                                            onClick={closeModal}
                                            className="text-gray-400 hover:text-pink-500 transition-colors duration-200 p-2 rounded-full hover:bg-pink-50"
                                            whileHover={{ scale: 1.1, rotate: 90 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            <X size={24} />
                                        </motion.button>
                                    </div>
                                </div>

                                {/* Modal Content */}
                                <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6 space-y-6">
                                    {/* Featured Image */}
                                    <motion.div
                                        className="relative rounded-3xl overflow-hidden shadow-lg"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <img
                                            src={selectedBlog.blogImageUrl || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=400&fit=crop&crop=entropy&auto=format&q=80'}
                                            alt={selectedBlog.title}
                                            className="w-full h-64 md:h-80 object-cover"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=400&fit=crop&crop=entropy&auto=format&q=80";
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                                    </motion.div>

                                    {/* Blog Content */}
                                    <motion.div
                                        className="prose prose-lg max-w-none"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
                                            {selectedBlog.content || 'No content available.'}
                                        </div>
                                    </motion.div>

                                    {/* Author Footer */}
                                    <motion.div
                                        className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-3xl p-6 border border-pink-100"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <motion.img
                                                    src={selectedBlog.authorImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedBlog.authorName || 'Author')}&background=ec4899&color=fff&size=48&rounded=true`}
                                                    alt={selectedBlog.authorName}
                                                    className="w-12 h-12 rounded-full mr-4 border-3 border-white shadow-lg"
                                                    whileHover={{ scale: 1.1 }}
                                                />
                                                <div>
                                                    <p className="font-bold text-gray-800 flex items-center gap-2">
                                                        <Heart size={16} className="text-pink-500" />
                                                        {selectedBlog.authorName}
                                                    </p>
                                                    <p className="text-sm text-gray-600">✨ Magical Storyteller ✨</p>
                                                </div>
                                            </div>
                                            <div className="text-right text-sm text-gray-500">
                                                <p>📅 Published: {formatDate(selectedBlog.publishDate)}</p>
                                                {selectedBlog.lastUpdatedAt && selectedBlog.lastUpdatedAt !== selectedBlog.publishDate && (
                                                    <p>🔄 Updated: {formatDate(selectedBlog.lastUpdatedAt)}</p>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default LatestBlogsSection;