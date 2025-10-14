import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { Loader2, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { axiosSecure } from '../../hooks/useAxiosSecure';

// Utility function to shuffle array and pick n items
const pickRandom = (array, n) => {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
};

const MeetOurAgents = () => {
    // Fetch agents from the /agents API
    const { data: agents = [], isLoading, error } = useQuery({
        queryKey: ['agents'],
        queryFn: async () => {
            const res = await axiosSecure.get('/agents');
            return res.data || [];
        },
    });

    // Select 3 random agents
    const featuredAgents = pickRandom(agents, 3);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="h-10 w-10 animate-spin text-teal-500" />
                <p className="text-gray-600 ml-3 text-lg">Loading agents...</p>
            </div>
        );
    }

    if (error) {
        return <p className="text-red-600 text-center">Error fetching agents: {error.message}</p>;
    }

    return (
        <>
            <Helmet>
                <title>Meet Our Tur Employee</title>
            </Helmet>

            <motion.div
                className=" mx-auto p-4 sm:p-6 bg-white rounded-3xl shadow-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-green-600 to-teal-500 bg-clip-text text-transparent mb-8 text-center">
                    Meet Our Tur Gide
                </h1>

                {featuredAgents.length === 0 ? (
                    <p className="text-center text-gray-600 text-lg py-10">No agents available at the moment.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {featuredAgents.map(agent => (
                            <motion.div
                                key={agent._id}
                                className="bg-gray-50 rounded-2xl shadow-md p-6 flex flex-col items-center text-center hover:shadow-lg transition-all"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                                whileHover={{ scale: 1.02 }}
                            >
                                <img
                                    src={agent.image || `https://placehold.co/120x120/E0F2F7/000?text=${agent.name?.charAt(0) || 'A'}`}
                                    alt={agent.name || 'Agent'}
                                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-2 border-teal-500 object-cover mb-4"
                                />
                                <h3 className="text-xl font-bold text-gray-800">{agent.name || 'Unknown Agent'}</h3>
                                <p className="text-sm text-gray-600 mt-1">{agent.email || 'N/A'}</p>
                                <p className="text-sm text-gray-600 mt-2">
                                    <strong>Last Logged In</strong> {agent.last_loggedIn || 'N/A'}
                                </p>
                                {/* <p className="text-sm text-gray-600 mt-2">

                                    {Array.isArray(agent.specialties) && agent.specialties.length > 0
                                        ? agent.specialties.join(', ')
                                        : agent.specialties || 'None'}
                                </p> */}
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>
        </>
    );
};

export default MeetOurAgents;