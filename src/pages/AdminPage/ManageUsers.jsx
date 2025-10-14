import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';

import { Loader2, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Dialog } from '@headlessui/react';
import { axiosSecure } from '../../hooks/useAxiosSecure';

import ReusableUserModal from '../../components/Modal/ReusableUserModal';

const ManageUsers = () => {
    const queryClient = useQueryClient();
    const [selectedUser, setSelectedUser] = useState(null);


    console.log();

    const { data: users = [], isLoading, error } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const res = await axiosSecure.get('/users');
            return res.data;
        },
    });

    const updateUserRole = useMutation({
        mutationFn: async ({ email, role }) => {
            const res = await axiosSecure.patch(`/user/role/update/${email}`, {
                role,
            });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['users']);
            setSelectedUser(null);
        },
    });


    const deleteUser = useMutation({
        mutationFn: async (id) => {
            const res = await axiosSecure.delete(`/user/${id}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['users']);
            setSelectedUser(null);
        },
    });


    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <p className="text-red-600 text-xl">Error loading users: {error.message}</p>
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>Manage Users</title>
            </Helmet>
            <motion.div
                className="max-w-7xl mx-auto p-6 bg-white rounded-3xl shadow-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-4xl font-extrabold bg-gradient-to-r from-green-600 to-teal-500 bg-clip-text text-transparent mb-6">
                    Manage Users
                </h1>

                {/* Desktop Table */}
                <div className="overflow-x-auto hidden md:block">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">User</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Registered</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map(user => (
                                <tr key={user._id} className="hover:bg-gray-50">
                                    <td className="px-4 py-4 flex items-center gap-2">
                                        <img src={user.image} className="w-10 h-10 rounded-full" />
                                        {user.name}
                                    </td>
                                    <td className="px-4 py-4 ">{user.email}</td>
                                    <td>

                                        <div
                                            className={`badge badge-soft capitalize ${user.role === 'admin'
                                                ? 'bg-red-100 text-red-500 font-medium'     // green
                                                : user.role === 'agent'
                                                    ? 'text-green-500 bg-green-100 font-medium'        // blue
                                                    : 'text-cyan-700  font-medium'     // yellow
                                                }`}
                                        >
                                            {user.role}
                                        </div>




                                    </td>

                                    <td className="px-4 py-4">{new Date(user.created_at).toLocaleDateString()}</td>
                                    <td className="px-4 py-4">
                                        <motion.button
                                            onClick={() => setSelectedUser(user)}
                                            disabled={user.role === 'admin'} // ✅ Disable if user is admin
                                            className={`px-5 py-2 rounded-xl shadow-lg transition-all duration-300 
      ${user.role === 'admin'
                                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' // Style for disabled
                                                    : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-xl hover:from-blue-600 hover:to-cyan-600'
                                                }`}
                                            whileHover={user.role !== 'admin' ? { scale: 1.05, boxShadow: '0 10px 20px rgba(59, 130, 246, 0.3)' } : {}}
                                            whileTap={user.role !== 'admin' ? { scale: 0.95 } : {}}
                                        >
                                            Manage
                                        </motion.button>
                                    </td>

                                    {/* <td className="px-4 py-4">
                                        <motion.button
                                            onClick={() => setSelectedUser(user)}
                                            className="px-3 py-1 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                                        >
                                            Manage
                                        </motion.button>
                                    </td> */}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card */}
                <div className="md:hidden flex flex-col gap-3">
                    {users.map(user => {
                        const isAdmin = user.role === 'admin';

                        // Role badge color logic
                        const roleBadgeColor =
                            user.role === 'admin'
                                ? 'bg-red-100 text-red-500'
                                : user.role === 'agent'
                                    ? 'bg-green-100 text-green-600'
                                    : 'bg-yellow-100 text-yellow-600';

                        return (
                            <motion.div
                                key={user?._id}
                                whileHover={!isAdmin ? { scale: 1.03 } : {}}
                                whileTap={!isAdmin ? { scale: 0.97 } : {}}
                                onClick={!isAdmin ? () => setSelectedUser(user) : undefined}
                                className={`w-full px-4 py-3 rounded-2xl shadow-md border flex items-center gap-4 transition-all
          ${isAdmin
                                        ? 'bg-gray-100 cursor-not-allowed opacity-80'
                                        : 'bg-white hover:shadow-lg'}`}
                            >
                                <img
                                    src={user.image}
                                    alt={user.name}
                                    className="w-12 h-12 rounded-full border-2 border-green-500"
                                />

                                <div className="flex-1 text-left">
                                    <div className="flex gap-2 items-center">
                                        <p className="font-semibold text-gray-800">{user?.name}</p>
                                        <span className={`text-xs px-2 py-1 rounded-full capitalize font-medium ${roleBadgeColor}`}>
                                            {user?.role}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>



                {/* Modal */}

                <ReusableUserModal
                    isOpen={!!selectedUser}
                    onClose={() => setSelectedUser(null)}
                    user={selectedUser}
                    onPromote={({ email }) => updateUserRole.mutate({ email, role: 'agent' })}
                    onDemote={({ email }) => updateUserRole.mutate({ email, role: 'customer' })}
                    onDelete={({ _id }) => deleteUser.mutate(_id)}
                />


                {/* <Dialog open={!!selectedUser} onClose={() => setSelectedUser(null)} className="fixed z-50 inset-0 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4">
                        <Dialog.Panel className="bg-green-50 w-full max-w-md p-6 rounded-2xl shadow-xl">
                            <div className="flex justify-between items-center mb-4">
                                <Dialog.Title className="text-2xl font-bold text-gray-800">
                                    Manage {selectedUser?.name}
                                </Dialog.Title>
                                <button onClick={() => setSelectedUser(null)}><X className="text-gray-500" /></button>
                            </div>

                            <div className="space-y-2 text-gray-700">
                                <div className="flex justify-start gap-2 items-center">
                                    <img
                                        className="w-10 h-10 rounded-full"
                                        src={selectedUser?.image}
                                        alt=""

                                    />
                                    <p>{selectedUser?.name}</p>
                                </div>

                                <p><strong>Email:</strong> {selectedUser?.email}</p>
                                <p><strong>Current Role:</strong> {selectedUser?.role}</p>
                                <p><strong>Registered:</strong> {new Date(selectedUser?.created_at).toLocaleDateString()}</p>


                                <div className="flex gap-3 mt-4 flex-wrap">
                                    {selectedUser?.role !== 'agent' && (
                                        <motion.button
                                            onClick={() => updateUserRole.mutate({ email: selectedUser?.email, role: 'agent' })}
                                            className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl shadow-lg hover:shadow-xl hover:from-green-600 hover:to-teal-600 transition-all duration-300"
                                            whileHover={{ scale: 1.05, boxShadow: '0 10px 20px rgba(0, 128, 0, 0.3)' }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            TurGide
                                        </motion.button>
                                    )}
                                    {selectedUser?.role === 'agent' && (
                                        <motion.button
                                            onClick={() => updateUserRole.mutate({ email: selectedUser?.email, role: 'customer' })}
                                            className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-xl shadow-lg hover:shadow-xl hover:from-yellow-600 hover:to-amber-600 transition-all duration-300"
                                            whileHover={{ scale: 1.05, boxShadow: '0 10px 20px rgba(255, 193, 7, 0.3)' }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            Demote to Customer
                                        </motion.button>
                                    )}
                                    <motion.button
                                        onClick={() => deleteUser.mutate(selectedUser?._id)}
                                        className="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl shadow-lg hover:shadow-xl hover:from-red-600 hover:to-rose-600 transition-all duration-300"
                                        whileHover={{ scale: 1.05, boxShadow: '0 10px 20px rgba(220, 38, 38, 0.3)' }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Delete User
                                    </motion.button>
                                </div>
                            </div>
                        </Dialog.Panel>
                    </div>
                </Dialog> */}
            </motion.div >
        </>
    );
};

export default ManageUsers;



