import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2'; // For sweet alerts
import { motion } from 'framer-motion'; // For animations

// Assuming axiosSecure is available for API calls
import { axiosSecure } from '../../hooks/useAxiosSecure'; // Adjust path if necessary

const NewsletterSubscription = () => {
    const queryClient = useQueryClient();
    // Removed 'name' state as per the new design
    const [email, setEmail] = useState('');

    // Mutation to save newsletter subscription data to the database
    const subscribeMutation = useMutation({
        mutationFn: async (subscriptionData) => {
            // This is a placeholder API endpoint.
            // You will need to create a POST endpoint on your backend, e.g., /subscribe-newsletter
            // that accepts { email } and saves it to your database.
            const res = await axiosSecure.post('/subscribe-newsletter', subscriptionData);
            return res.data;
        },
        onSuccess: () => {
            Swal.fire({
                icon: 'success',
                title: 'Subscribed!',
                text: 'Thank you for subscribing to our newsletter!',
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false,
            });
            // Clear form fields on success
            setEmail(''); // Only clear email
            // Optionally, invalidate a query if you have a list of subscribers to refetch
            // queryClient.invalidateQueries(['newsletterSubscribers']);
        },
        onError: (error) => {
            console.error('Error subscribing to newsletter:', error);
            Swal.fire({
                icon: 'error',
                title: 'Subscription Failed',
                text: error.response?.data?.message || 'Failed to subscribe. Please try again.',
            });
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Updated validation to only check email
        if (!email.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Please enter your email address.',
            });
            return;
        }

        // Trigger the mutation, sending only email
        subscribeMutation.mutate({ email });
    };

    return (
        <div className="mx-auto  lg:mt-45  p-2 lg:px-8 font-inter">
            <div
                className="relative isolate overflow-hidden bg-gray-900 px-6 py-24 shadow-2xl rounded-2xl sm:rounded-3xl sm:px-24 xl:py-32">

                <h2 className="mx-auto  text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    Keep Updated
                </h2>

                <p className="mx-auto mt-2 max-w-xl text-center text-lg leading-8 text-gray-300">
                    Keep pace with SecureCloud advancements! Join our mailing list for selective, noteworthy updates.
                </p>

                <form className="mx-auto mt-10 flex max-w-md gap-x-4" onSubmit={handleSubmit}>
                    {/* Removed the 'name' input field */}
                    {/* <label htmlFor="name-input" className="sr-only">Your Name</label>
                    <input
                        id="name-input"
                        name="name"
                        type="text"
                        autoComplete="name"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="min-w-0 flex-auto rounded-md border-0 bg-white/5 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-white sm:text-sm sm:leading-6 placeholder-gray-400"
                        placeholder="Enter your name"
                        disabled={subscribeMutation.isPending}
                    /> */}

                    <label htmlFor="email-address" className="sr-only">Email address</label>
                    <input
                        id="email-address"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="min-w-0 flex-auto rounded-md border-0 bg-white/5 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-white sm:text-sm sm:leading-6 placeholder-gray-400"
                        placeholder="Enter your email"
                        disabled={subscribeMutation.isPending} // Disable input while submitting
                    />

                    <motion.button
                        type="submit"
                        className="flex-none rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={subscribeMutation.isPending} // Disable button while submitting
                    >
                        {subscribeMutation.isPending ? 'Subscribing...' : 'Notify me'}
                    </motion.button>
                </form>

                {/* Background SVG elements */}
                <svg viewBox="0 0 1024 1024" className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2"
                    aria-hidden="true">
                    <circle cx="512" cy="512" r="512" fill="url(#759c1415-0410-454c-8f7c-9a820de03641)" fillOpacity="0.7">
                    </circle>
                    <defs>
                        <radialGradient id="759c1415-0410-454c-8f7c-9a820de03641" cx="0" cy="0" r="1"
                            gradientUnits="userSpaceOnUse" gradientTransform="translate(512 512) rotate(90) scale(512)">
                            <stop stopColor="#7775D6"></stop>
                            <stop offset="1" stopColor="#7ED321" stopOpacity="0"></stop>
                        </radialGradient>
                    </defs>
                </svg>
            </div>
        </div>
    );
};

export default NewsletterSubscription;
