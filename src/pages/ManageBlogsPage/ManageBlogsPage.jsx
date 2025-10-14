import React, { useState, useEffect, useContext } from 'react';
import { Plus, Edit, Trash2, X, Save, Eye, Image as ImageIcon, BookOpen, UploadCloud } from 'lucide-react';
import Swal from 'sweetalert2'; // NEW: Import SweetAlert2

// Assuming these hooks are available in your project structure
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';

// UPDATED: Importing saveImgCloud from a utility file
import { saveImgCloud } from '../../api/utils';


const ManageBlogsPage = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentBlog, setCurrentBlog] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        authorName: '',
        authorEmail: '',
        authorImageUrl: '',
        blogImageUrl: '',
    });
    const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false); // State for image upload loading

    const axiosSecure = useAxiosSecure();
    const { user } = useAuth();

    const userRole = user?.role || 'agent';

    useEffect(() => {
        if (user?.email) {
            fetchBlogs();
        }
    }, [user]);

    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobileOrTablet(window.innerWidth < 1024);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);

        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            let response;

            if (userRole === 'admin') {
                response = await axiosSecure.get('/blogs');
            } else {
                response = await axiosSecure.get(`/blogs/author/${user.email}`);
            }

            setBlogs(response.data);
        } catch (error) {
            console.error('Error fetching blogs:', error);
            // UPDATED: Using SweetAlert2 for error notification
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Failed to fetch blogs. Please try again.',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBlog = () => {
        setFormData({
            title: '',
            content: '',
            authorName: user?.displayName || user?.name || '',
            authorEmail: user?.email || '',
            authorImageUrl: user?.photoURL || 'https://via.placeholder.com/40/FFC107/FFFFFF?text=AU', // Default author image
            blogImageUrl: '',
        });
        setShowCreateModal(true);
    };

    const handleEditBlog = (blog) => {
        setCurrentBlog(blog);
        setFormData({
            title: blog.title,
            content: blog.content,
            authorName: blog.authorName,
            authorEmail: blog.authorEmail,
            authorImageUrl: blog.authorImageUrl || 'https://via.placeholder.com/40/FFC107/FFFFFF?text=AU',
            blogImageUrl: blog.blogImageUrl || '',
        });
        setShowEditModal(true);
    };

    const handleDeleteBlog = async (blogId) => {
        // UPDATED: Using SweetAlert2 for confirmation
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (!result.isConfirmed) {
            return;
        }

        try {
            await axiosSecure.delete(`/blogs/${blogId}`);
            setBlogs(blogs.filter(blog => blog._id !== blogId));
            // UPDATED: Using SweetAlert2 for success notification
            Swal.fire(
                'Deleted!',
                'Your blog post has been deleted.',
                'success'
            );
        } catch (error) {
            console.error('Error deleting blog:', error);
            // UPDATED: Using SweetAlert2 for error notification
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Failed to delete blog. Please try again.',
            });
        }
    };

    const handleSaveBlog = async () => {
        if (!formData.title.trim() || !formData.content.trim()) {
            // UPDATED: Using SweetAlert2 for warning notification
            Swal.fire({
                icon: 'warning',
                title: 'Missing Fields',
                text: 'Please fill in all required fields (Title and Content).',
            });
            return;
        }

        try {
            const blogData = {
                title: formData.title,
                content: formData.content,
                authorName: formData.authorName,
                authorEmail: formData.authorEmail,
                authorImageUrl: formData.authorImageUrl,
                blogImageUrl: formData.blogImageUrl,
            };

            if (showCreateModal) {
                const response = await axiosSecure.post('/blogs', blogData);
                // UPDATED: Using SweetAlert2 for success notification
                Swal.fire(
                    'Published!',
                    'Your blog post has been published successfully!',
                    'success'
                );
            } else if (showEditModal && currentBlog) {
                await axiosSecure.patch(`/blogs/${currentBlog._id}`, blogData);
                // UPDATED: Using SweetAlert2 for success notification
                Swal.fire(
                    'Updated!',
                    'Your blog post has been updated successfully!',
                    'success'
                );
            }

            closeModals();
            fetchBlogs();
        } catch (error) {
            console.error('Error saving blog:', error);
            // UPDATED: Using SweetAlert2 for error notification
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Failed to save blog. Please try again.',
            });
        }
    };

    const closeModals = () => {
        setShowCreateModal(false);
        setShowEditModal(false);
        setCurrentBlog(null);
        setFormData({
            title: '',
            content: '',
            authorName: '',
            authorEmail: '',
            authorImageUrl: '',
            blogImageUrl: '',
        });
        setIsUploadingImage(false); // Reset upload state on modal close
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const canEditDelete = (blog) => {
        return userRole === 'admin' || blog.authorEmail === user?.email;
    };

    const getTodayBlogsCount = () => {
        return blogs.filter(blog => {
            const today = new Date().toDateString();
            return new Date(blog.publishDate).toDateString() === today;
        }).length;
    };

    const getWordCount = (text) => {
        const cleanText = text.replace(/<[^>]*>/g, '');
        return cleanText.split(/\s+/).filter(word => word.length > 0).length;
    };

    const getReadTime = (wordCount) => {
        const wordsPerMinute = 200;
        return Math.ceil(wordCount / wordsPerMinute);
    };

    // Handler for file input change
    const handleImageFileChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            setIsUploadingImage(true); // Set loading state
            try {
                const imageUrl = await saveImgCloud(file);
                setFormData(prev => ({ ...prev, blogImageUrl: imageUrl }));
                console.log('Image uploaded successfully:', imageUrl);
                // UPDATED: Using SweetAlert2 for upload success notification
                Swal.fire({
                    icon: 'success',
                    title: 'Image Uploaded!',
                    text: 'The blog cover image has been uploaded successfully.',
                    timer: 2000, // Auto-close after 2 seconds
                    timerProgressBar: true,
                    showConfirmButton: false,
                });
            } catch (error) {
                console.error('Error uploading image:', error);
                // UPDATED: Using SweetAlert2 for upload error notification
                Swal.fire({
                    icon: 'error',
                    title: 'Upload Failed',
                    text: 'Failed to upload image. Please try again.',
                });
            } finally {
                setIsUploadingImage(false); // Reset loading state
                event.target.value = null; // Clear the file input to allow re-uploading the same file
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading blogs...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 font-inter">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">📰 Manage Story</h1>
                                <p className="text-gray-600 mt-1">
                                    {userRole === 'admin'
                                        ? 'Manage all insurance blog posts'
                                        : 'Manage your insurance blog posts'}
                                </p>
                            </div>
                            <button
                                onClick={handleCreateBlog}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                            >
                                <Plus size={20} />
                                Add New Story
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-500">Total Blogs</h3>
                        <p className="text-3xl font-bold text-gray-900">{blogs.length}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-500">Published Today</h3>
                        <p className="text-3xl font-bold text-green-600">{getTodayBlogsCount()}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-500">Your Role</h3>
                        <p className="text-3xl font-bold text-blue-600 capitalize">{userRole}</p>
                    </div>
                </div>

                {/* Blogs Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Blog Posts</h2>
                    </div>

                    {blogs.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-gray-400 mb-4">
                                <Eye size={48} className="mx-auto" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No blogs found</h3>
                            <p className="text-gray-600 mb-4">Get started by creating your first blog post about insurance tips.</p>
                            <button
                                onClick={handleCreateBlog}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
                            >
                                <Plus size={20} />
                                Create First Story
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Table View (Hidden on Mobile/Tablet) */}
                            <div className="hidden lg:block overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Title
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Author
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Image
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Published Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Last Updated
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Read Info
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {blogs.map((blog) => (
                                            <tr key={blog._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <h4 className="text-sm font-medium text-gray-900">{blog.title}</h4>
                                                        <p className="text-sm text-gray-600 mt-1 truncate max-w-xs">
                                                            {blog.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <img
                                                            src={blog.authorImageUrl || 'https://via.placeholder.com/30/FFC107/FFFFFF?text=AU'}
                                                            alt={blog.authorName}
                                                            className="w-8 h-8 rounded-full object-cover"
                                                        />
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">{blog.authorName}</div>
                                                            <div className="text-sm text-gray-500">{blog.authorEmail}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {blog.blogImageUrl ? (
                                                        <img
                                                            src={blog.blogImageUrl}
                                                            alt={blog.title}
                                                            className="w-20 h-12 object-cover rounded-md"
                                                            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/80x48/CCCCCC/333333?text=N/A"; }}
                                                        />
                                                    ) : (
                                                        <span className="text-gray-400 text-xs">No Image</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {formatDate(blog.publishDate)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {blog.lastUpdatedAt ? formatDate(blog.lastUpdatedAt) : 'Not updated'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    <div className="flex items-center gap-1">
                                                        <span className="font-medium">{getWordCount(blog.content)}</span> words
                                                    </div>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <BookOpen size={14} className="text-gray-500" />
                                                        <span>{getReadTime(getWordCount(blog.content))} min read</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    {canEditDelete(blog) && (
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => handleEditBlog(blog)}
                                                                className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                                                title="Edit blog"
                                                            >
                                                                <Edit size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteBlog(blog._id)}
                                                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                                                title="Delete blog"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Card View (Visible on Mobile/Tablet) */}
                            <div className="lg:hidden grid grid-cols-1 gap-4 p-4">
                                {blogs.map((blog) => (
                                    <div key={blog._id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                                        {blog.blogImageUrl && (
                                            <img
                                                src={blog.blogImageUrl}
                                                alt={blog.title}
                                                className="w-full h-40 object-cover rounded-md mb-3"
                                                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x200/CCCCCC/333333?text=N/A"; }}
                                            />
                                        )}
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{blog.title}</h3>
                                        <p className="text-sm text-gray-700 mb-3">
                                            {blog.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                                        </p>
                                        <div className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                                            <img
                                                src={blog.authorImageUrl || 'https://via.placeholder.com/24/FFC107/FFFFFF?text=AU'}
                                                alt={blog.authorName}
                                                className="w-6 h-6 rounded-full object-cover"
                                            />
                                            <strong>Author:</strong> {blog.authorName} ({blog.authorEmail})
                                        </div>
                                        <div className="text-sm text-gray-600 mb-1">
                                            <strong>Published:</strong> {formatDate(blog.publishDate)}
                                        </div>
                                        {blog.lastUpdatedAt && (
                                            <div className="text-sm text-gray-600 mb-3">
                                                <strong>Last Updated:</strong> {formatDate(blog.lastUpdatedAt)}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                                            <span>{getWordCount(blog.content)} words</span>
                                            <span className="flex items-center gap-1">
                                                <BookOpen size={14} className="text-gray-500" />
                                                {getReadTime(getWordCount(blog.content))} min read
                                            </span>
                                        </div>
                                        {canEditDelete(blog) && (
                                            <div className="flex justify-end gap-2 mt-4 border-t pt-3 border-gray-100">
                                                <button
                                                    onClick={() => handleEditBlog(blog)}
                                                    className="text-blue-600 hover:text-blue-900 p-2 rounded-full hover:bg-blue-50 transition-colors"
                                                    title="Edit blog"
                                                >
                                                    <Edit size={20} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteBlog(blog._id)}
                                                    className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition-colors"
                                                    title="Delete blog"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Create Blog Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900">📝 Create New Blog Post</h2>
                            <button
                                onClick={closeModals}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter blog title..."
                                />
                            </div>

                            {/* Blog Cover Image URL and Upload Button */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Blog Cover Image URL (Optional)
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="url"
                                        value={formData.blogImageUrl}
                                        onChange={(e) => setFormData({ ...formData, blogImageUrl: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Paste image URL or upload below..."
                                        id="createBlogImageUrlInput"
                                    />
                                    <label
                                        htmlFor="upload-create-blog-image"
                                        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer
                                            ${isUploadingImage ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 text-white'}
                                        `}
                                    >
                                        {isUploadingImage ? (
                                            <span className="animate-spin h-5 w-5 border-b-2 border-white rounded-full"></span>
                                        ) : (
                                            <UploadCloud size={20} />
                                        )}
                                        Upload
                                        <input
                                            type="file"
                                            id="upload-create-blog-image"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleImageFileChange}
                                            disabled={isUploadingImage}
                                        />
                                    </label>
                                </div>
                                {formData.blogImageUrl && (
                                    <img
                                        src={formData.blogImageUrl}
                                        alt="Blog Preview"
                                        className="mt-2 h-24 object-cover rounded-md border border-gray-200"
                                        onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/96x96/CCCCCC/333333?text=N/A"; }}
                                    />
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Content *
                                </label>
                                <textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    rows={8}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Write your insurance tips and content here..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Author (Read-only)
                                </label>
                                <div className="flex items-center gap-3">
                                    <img
                                        src={formData.authorImageUrl || 'https://via.placeholder.com/40/FFC107/FFFFFF?text=AU'}
                                        alt={formData.authorName}
                                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                    />
                                    <input
                                        type="text"
                                        value={formData.authorName}
                                        readOnly
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                                    />
                                </div>
                            </div>

                            {/* Optional: Input for Author Image URL if it can be changed per blog */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Author Image URL (Optional)
                                </label>
                                <input
                                    type="url"
                                    value={formData.authorImageUrl}
                                    onChange={(e) => setFormData({ ...formData, authorImageUrl: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., https://example.com/author-profile.jpg"
                                />
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <p className="text-sm text-blue-800">
                                    📅 <strong>Publish Date:</strong> Will be set automatically when you publish this post.
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                            <button
                                onClick={closeModals}
                                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveBlog}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
                                disabled={isUploadingImage} // Disable save while uploading
                            >
                                {isUploadingImage ? 'Uploading...' : 'Publish Blog'}
                                {!isUploadingImage && <Save size={16} />}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Blog Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900">✏️ Edit Blog Post</h2>
                            <button
                                onClick={closeModals}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Blog Cover Image URL and Upload Button in Edit Modal */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Blog Cover Image URL (Optional)
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="url"
                                        value={formData.blogImageUrl}
                                        onChange={(e) => setFormData({ ...formData, blogImageUrl: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Paste image URL or upload below..."
                                        id="editBlogImageUrlInput"
                                    />
                                    <label
                                        htmlFor="upload-edit-blog-image"
                                        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer
                                            ${isUploadingImage ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 text-white'}
                                        `}
                                    >
                                        {isUploadingImage ? (
                                            <span className="animate-spin h-5 w-5 border-b-2 border-white rounded-full"></span>
                                        ) : (
                                            <UploadCloud size={20} />
                                        )}
                                        Upload
                                        <input
                                            type="file"
                                            id="upload-edit-blog-image"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleImageFileChange}
                                            disabled={isUploadingImage}
                                        />
                                    </label>
                                </div>
                                {formData.blogImageUrl && (
                                    <img
                                        src={formData.blogImageUrl}
                                        alt="Blog Preview"
                                        className="mt-2 h-24 object-cover rounded-md border border-gray-200"
                                        onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/96x96/CCCCCC/333333?text=N/A"; }}
                                    />
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Content *
                                </label>
                                <textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    rows={8}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Author (Read-only)
                                </label>
                                <div className="flex items-center gap-3">
                                    <img
                                        src={formData.authorImageUrl || 'https://via.placeholder.com/40/FFC107/FFFFFF?text=AU'}
                                        alt={formData.authorName}
                                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                    />
                                    <input
                                        type="text"
                                        value={formData.authorName}
                                        readOnly
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                                    />
                                </div>
                            </div>

                            {/* Optional: Input for Author Image URL if it can be changed per blog */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Author Image URL (Optional)
                                </label>
                                <input
                                    type="url"
                                    value={formData.authorImageUrl}
                                    onChange={(e) => setFormData({ ...formData, authorImageUrl: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., https://example.com/author-profile.jpg"
                                />
                            </div>

                            {currentBlog && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                    <p className="text-sm text-yellow-800">
                                        📅 <strong>Originally Published:</strong> {formatDate(currentBlog.publishDate)}
                                        <br />
                                        🔄 <strong>Last Updated:</strong> {currentBlog.lastUpdatedAt ? formatDate(currentBlog.lastUpdatedAt) : 'Never'}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                            <button
                                onClick={closeModals}
                                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveBlog}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
                                disabled={isUploadingImage} // Disable save while uploading
                            >
                                {isUploadingImage ? 'Uploading...' : 'Save Changes'}
                                {!isUploadingImage && <Save size={16} />}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

export default ManageBlogsPage;
