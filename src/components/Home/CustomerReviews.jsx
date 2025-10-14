import { useQuery } from '@tanstack/react-query';
import { Star } from 'lucide-react'; // Import Star icon from lucide-react
import { Swiper, SwiperSlide } from 'swiper/react'; // Core Swiper components
import { Pagination, Autoplay } from 'swiper/modules'; // Swiper modules for pagination and autoplay
import { motion } from 'framer-motion'; // For animations

// Import Swiper styles (ensure these paths are correct relative to your setup)
import 'swiper/css';
import 'swiper/css/pagination';
import { axiosSecure } from '../../hooks/useAxiosSecure';
import LoadingSpinner from '../Shared/Spinner/LoadingSpinner';




// Helper Component: Fetches and displays specific policy info for a review card
const PolicyInfoForReview = ({ policyId }) => {
    // useQuery to fetch details for a single policy by its ID
    const {
        data: policy,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['policyDetailsForReviewCard', policyId], // Unique query key per policy ID
        queryFn: async () => {
            const res = await axiosSecure(`/policies/${policyId}`); // API call to get policy by ID
            return res.data;
        },
        enabled: !!policyId, // Only run this query if a valid policyId is provided
        staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes (adjust as needed)
        cacheTime: 10 * 60 * 1000, // Data stays in cache for 10 minutes
    });

    if (isLoading) {
        return (
            <div className="text-xs text-gray-400 mt-2">Loading policy info...</div>
        );
    }

    if (isError || !policy) {
        // Log the error for debugging purposes
        console.error(`Failed to load policy for review ID: ${policyId}`, isError || 'No policy data received.');
        return (
            <div className="text-xs text-red-400 mt-2">Policy info not available.</div>
        );
    }

    // Render policy image and title using the correct field names ('image', 'title')
    return (
        <div className="mt-auto pt-4 border-t border-gray-100 w-full flex items-center justify-center gap-3">
            <img
                src={policy?.image || '/default-policy-review.jpg'} // Use policy.image, fallback to a default image
                alt={policy?.title || 'Policy Image'} // Use policy.title for alt text, fallback
                className="w-10 h-10 object-cover rounded-md shadow-sm border border-gray-200"
            />
            <p className="text-sm font-medium text-gray-800">
                {policy?.title || 'Policy Title N/A'} {/* Use policy.title, fallback */}
            </p>
        </div>
    );
};

// Main CustomerReviews Component
const CustomerReviews = () => {
    // useQuery to fetch all customer reviews
    const {
        data: reviews = [], // Destructure data as 'reviews', default to empty array
        isLoading, // Loading state
        isError, // Error state
    } = useQuery({
        queryKey: ['customerReviews'], // Unique query key for this data
        queryFn: async () => {
            const res = await axiosSecure.get('/reviews'); // API call to get all reviews
            // Sort reviews by date in descending order and take the latest 5
            return res.data.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
        },
    });
    if (isLoading) return <LoadingSpinner></LoadingSpinner>
    if (isError) {
        return (
            <div className="text-center py-10 text-red-500 font-semibold">
                Failed to load customer testimonials. Please try again later.
            </div>
        );
    }

    if (reviews.length === 0) {
        return (
            <div className="text-center py-10 text-gray-500 text-lg">
                No customer testimonials yet. Be the first to leave a review!
            </div>
        );
    }

    // --- Main Component Rendering ---
    return (
        <section className="py-16 mb-10 lg:-mb-40 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl shadow-xl overflow-hidden">
            <div className="container mx-auto px-4">
                <motion.h2
                    className="text-5xl font-extrabold text-center mb-12 bg-gradient-to-r from-purple-600 to-indigo-700 bg-clip-text text-transparent leading-tight"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    What Our Customers Say
                </motion.h2>

                <Swiper
                    modules={[Pagination, Autoplay]} // Enable Swiper modules
                    spaceBetween={30} // Space between slides in pixels
                    slidesPerView={1} // Number of slides visible at once (default)
                    pagination={{ clickable: true }} // Enable clickable pagination dots
                    autoplay={{
                        delay: 5000, // Time (ms) between slide transitions
                        disableOnInteraction: false, // Autoplay continues even after user interacts with Swiper
                    }}
                    breakpoints={{ // Responsive settings for different screen widths
                        640: {
                            slidesPerView: 1,
                        },
                        768: {
                            slidesPerView: 2,
                        },
                        1024: {
                            slidesPerView: 3,
                        },
                    }}
                    loop={true} // Enables continuous looping of slides
                    className="mySwiper !pb-12" // Custom class for styling, !pb-12 adds padding at the bottom for pagination dots
                >
                    {reviews.map((review) => (
                        <SwiperSlide key={review?._id}>
                            <motion.div
                                className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center text-center h-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                {/* User Profile Image */}
                                <img
                                    src={review?.userImg || 'https://via.placeholder.com/80/cccccc/ffffff?text=User'} // Fallback placeholder image
                                    alt={review.userName || 'User'}
                                    className="w-20 h-20 rounded-full object-cover mb-4 border-4 border-purple-300 shadow-md"
                                />
                                {/* User Name */}
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">{review?.userName}</h3>
                                {/* Star Rating Display */}
                                <div className="flex justify-center mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-5 h-5 ${i < review?.rating ? 'text-yellow-400' : 'text-gray-300'
                                                }`}
                                            fill={i < review.rating ? 'currentColor' : 'none'} // Fill star if rating is met
                                        />
                                    ))}
                                </div>
                                {/* Customer Feedback */}
                                <p className="text-gray-600 italic leading-relaxed mb-4 flex-grow">"{review?.feedback}"</p>

                                {/* Render PolicyInfoForReview component if policyId exists in the review */}
                                {review.policyId && <PolicyInfoForReview policyId={review.policyId} />}
                            </motion.div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </section>
    );
};

export default CustomerReviews;