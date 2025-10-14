import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog } from '@headlessui/react';
import { X, Calendar, Eye, User, Heart, Sparkles, BookOpen, Coffee } from 'lucide-react';
import { Link } from 'react-router';
import { axiosSecure } from '../../hooks/useAxiosSecure';

const Blogs = () => {
    const queryClient = useQueryClient();
    const [selectedBlog, setSelectedBlog] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Format date function with cute styling
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

    // Fetch blogs query
    const { data: blogs = [], isLoading, error } = useQuery({
        queryKey: ['blogs'],
        queryFn: async () => {
            try {
                const res = await axiosSecure.get('/blogs');
                return res.data || [];
            } catch (error) {
                console.error('Error fetching blogs:', error);
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
            queryClient.invalidateQueries(['blogs']);
        },
        onError: (error) => {
            console.error('Failed to update visit count:', error);
        },
    });

    // Handle read more
    const handleReadMore = (blog) => {
        setSelectedBlog(blog);
        setIsModalOpen(true);
        // Update visit count
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
    const truncateText = (text, maxLength = 100) => {
        if (!text) return 'No content available...';
        return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
    };

    // Cute loading state
    // Cute error state
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100">
                <motion.div
                    className="text-center bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-pink-200"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                >
                    <div className="text-6xl mb-4">🥺</div>
                    <p className="text-pink-600 text-xl font-semibold mb-2">Oops! Something went wrong</p>
                    <p className="text-gray-600 mb-6">{error?.message || 'We couldn\'t load the blogs right now'}</p>
                    <motion.button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-gradient-to-r from-pink-400 to-purple-500 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        💫 Try Again
                    </motion.button>
                </motion.div>
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>NeoTakaful | Cute Blogs 💕</title>
                <meta name="description" content="Read the most adorable blogs and articles from NeoTakaful" />
            </Helmet>

            {/* Background with floating elements */}
            <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100 relative overflow-hidden">
                {/* Floating decorative elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={i}
                            className={`absolute ${i % 2 === 0 ? 'text-pink-200' : 'text-purple-200'}`}
                            animate={{
                                y: [-20, -40, -20],
                                x: [0, 10, 0],
                                rotate: [0, 5, 0]
                            }}
                            transition={{
                                duration: 4 + i,
                                repeat: Infinity,
                                delay: i * 0.5
                            }}
                            style={{
                                left: `${10 + i * 15}%`,
                                top: `${10 + i * 12}%`
                            }}
                        >
                            {i % 3 === 0 ? '✨' : i % 3 === 1 ? '🌸' : '💫'}
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    className="max-w-7xl mx-auto p-6 relative z-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    {/* Cute header */}
                    <motion.div
                        className="text-center mb-12"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <motion.h1
                            className="text-5xl font-black mb-4"
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
                            ✨   Stories ✨
                        </motion.h1>
                        <motion.p
                            className="text-gray-600 text-lg font-medium flex items-center justify-center gap-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            <Heart className="text-pink-500" size={20} />
                            Discover magical insights and adorable updates
                            <Sparkles className="text-purple-500" size={20} />
                        </motion.p>
                    </motion.div>

                    {blogs.length === 0 ? (
                        <motion.div
                            className="text-center py-20"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-pink-200 max-w-md mx-auto">
                                <div className="text-8xl mb-6">📚</div>
                                <h3 className="text-2xl font-bold text-gray-700 mb-3">No Stories Yet!</h3>
                                <p className="text-gray-600 mb-2">We're working on some amazing content</p>
                                <p className="text-sm text-pink-600 font-semibold">✨ Check back soon for magical stories! ✨</p>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                            {blogs.map((blog, index) => (
                                <motion.div
                                    key={blog._id}
                                    className="group"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                >
                                    <motion.div
                                        className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-pink-100 overflow-hidden relative"
                                        whileHover={{
                                            y: -8,
                                            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)"
                                        }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {/* Cute corner decoration */}
                                        <div className="absolute top-4 left-4 z-10">
                                            <motion.div
                                                className="bg-gradient-to-r from-pink-400 to-purple-500 text-white text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1"
                                                whileHover={{ scale: 1.1 }}
                                            >
                                                <BookOpen size={12} />
                                                Story
                                            </motion.div>
                                        </div>

                                        {/* Visit count with cute design */}
                                        <div className="absolute top-4 right-4 z-10">
                                            <motion.div
                                                className="bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-md"
                                                whileHover={{ scale: 1.1 }}
                                            >
                                                <Eye size={12} className="text-pink-500" />
                                                <span>{blog.visitCount || 0}</span>
                                            </motion.div>
                                        </div>

                                        {/* Blog Image with gradient overlay */}
                                        <div className="relative overflow-hidden rounded-t-3xl">
                                            <motion.img
                                                src={blog.blogImageUrl || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=250&fit=crop&crop=entropy&auto=format&q=80'}
                                                alt={blog.title}
                                                className="w-full h-52 object-cover"
                                                whileHover={{ scale: 1.05 }}
                                                transition={{ duration: 0.3 }}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=250&fit=crop&crop=entropy&auto=format&q=80";
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                        </div>

                                        {/* Blog Content */}
                                        <div className="p-6">
                                            <motion.h2
                                                className="text-xl font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-pink-600 transition-colors"
                                                initial={{ opacity: 0.8 }}
                                                whileHover={{ opacity: 1 }}
                                            >
                                                {blog.title || 'Untitled Story'}
                                            </motion.h2>

                                            <p className="text-gray-600 mb-4 line-clamp-3 text-sm leading-relaxed">
                                                {truncateText(blog.content, 120)}
                                            </p>

                                            {/* Author info with cute design */}
                                            <div className="flex items-center mb-6">
                                                <motion.div
                                                    className="relative"
                                                    whileHover={{ scale: 1.1 }}
                                                >
                                                    <img
                                                        src={blog.authorImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(blog.authorName || 'Author')}&background=ec4899&color=fff&size=40&rounded=true`}
                                                        alt={blog.authorName || 'Author'}
                                                        className="w-10 h-10 rounded-full border-3 border-pink-200 shadow-md"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = `https://ui-avatars.com/api/?name=Author&background=ec4899&color=fff&size=40&rounded=true`;
                                                        }}
                                                    />
                                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                                                </motion.div>
                                                <div className="ml-3 flex-1">
                                                    <p className="text-sm font-semibold text-gray-700">
                                                        {blog.authorName || 'Anonymous Storyteller'}
                                                    </p>
                                                    <div className="flex items-center text-xs text-gray-500">
                                                        <Calendar size={10} className="mr-1 text-pink-400" />
                                                        <span>{formatDate(blog.publishDate)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Cute Read More Button */}
                                            <motion.button
                                                onClick={() => handleReadMore(blog)}
                                                className="w-full py-3 px-4 bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-500 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                                                whileHover={{
                                                    scale: 1.03,
                                                    boxShadow: "0 10px 30px rgba(236, 72, 153, 0.3)"
                                                }}
                                                whileTap={{ scale: 0.97 }}
                                                disabled={updateVisitCount.isLoading}
                                            >
                                                {updateVisitCount.isLoading ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                                        Loading...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Heart size={16} />
                                                        Read More
                                                        <Sparkles size={16} />
                                                    </>
                                                )}
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Cute Modal */}
            <AnimatePresence>
                {isModalOpen && selectedBlog && (
                    <Dialog
                        open={isModalOpen}
                        onClose={closeModal}
                        className="fixed z-50 inset-0"
                    >
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
                                {/* Cute Header */}
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

                                    {/* Cute Footer */}
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
                    </Dialog>
                )}
            </AnimatePresence>
        </>
    );
};

export default Blogs;