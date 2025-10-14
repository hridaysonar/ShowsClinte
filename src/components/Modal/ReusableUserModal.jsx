// ReusableUserModal.jsx
import React from 'react';
import { Dialog } from '@headlessui/react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const ReusableUserModal = ({
    isOpen,
    onClose,
    user,
    onPromote,
    onDemote,
    onDelete,
}) => {
    if (!user) return null;

    return (
        <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
                <Dialog.Panel className="bg-green-50 w-full max-w-md p-6 rounded-2xl shadow-xl">
                    <div className="flex justify-between items-center mb-4">
                        <Dialog.Title className="text-2xl font-bold text-gray-800">
                            Manage {user.name}
                        </Dialog.Title>
                        <button onClick={onClose}>
                            <X className="text-gray-500" />
                        </button>
                    </div>

                    <div className="space-y-2 text-gray-700">
                        <div className="flex justify-start gap-2 items-center">
                            <img className="w-10 h-10 rounded-full" src={user.image} alt={user.name} />
                            <p>{user.name}</p>
                        </div>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Current Role:</strong> {user.role}</p>
                        <p><strong>Registered:</strong> {new Date(user.created_at).toLocaleDateString()}</p>

                        <div className="flex gap-3 mt-4 flex-wrap">
                            {user.role !== 'agent' && (
                                <motion.button
                                    onClick={() => onPromote(user)}
                                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl shadow-lg hover:shadow-xl hover:from-green-600 hover:to-teal-600 transition-all duration-300"
                                    whileHover={{ scale: 1.05, boxShadow: '0 10px 20px rgba(0, 128, 0, 0.3)' }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Promote to TurGide
                                </motion.button>
                            )}

                            {user.role === 'agent' && (
                                <motion.button
                                    onClick={() => onDemote(user)}
                                    className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-xl shadow-lg hover:shadow-xl hover:from-yellow-600 hover:to-amber-600 transition-all duration-300"
                                    whileHover={{ scale: 1.05, boxShadow: '0 10px 20px rgba(255, 193, 7, 0.3)' }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Demote to Customer
                                </motion.button>
                            )}

                            <motion.button
                                onClick={() => onDelete(user)}
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
        </Dialog>
    );
};

export default ReusableUserModal;
