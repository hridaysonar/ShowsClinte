import React, { useState, useEffect } from "react";
import { BadgeCheck, Pencil, Save } from "lucide-react";
import { motion } from "framer-motion";
import useAuth from "../../hooks/useAuth";
import { saveImgCloud } from "../../api/utils";

const roleColors = {
    admin: "bg-red-500",
    agent: "bg-blue-500",
    customer: "bg-green-500",
};

export default function ProfileComponent() {
    const { user, updateUserProfile } = useAuth();

    // Initialize with user data and handle updates with fallbacks
    const [name, setName] = useState(user?.displayName || "No Name");
    const [photo, setPhoto] = useState(user?.photoURL || "/default-avatar.png");
    const [imagePreview, setImagePreview] = useState(user?.photoURL || "/default-avatar.png");
    const [editMode, setEditMode] = useState(false);
    const [loader, setLoader] = useState(false);

    // Sync with auth state changes
    useEffect(() => {
        setName(user?.displayName || "No Name");
        setPhoto(user?.photoURL || "/default-avatar.png");
        setImagePreview(user?.photoURL || "/default-avatar.png");
    }, [user]);

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            setLoader(true);
            const imgUrl = await saveImgCloud(file);
            setImagePreview(imgUrl);
            setPhoto(imgUrl);
        } catch (err) {
            console.error("Image upload error:", err);
        } finally {
            setLoader(false);
        }
    };

    const handleSave = () => {
        if (updateUserProfile) {
            updateUserProfile(name, photo);
            console.log("Saved:", { name, photo });
        } else {
            console.error("updateUserProfile function is not available");
        }
        setEditMode(false);
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 rounded-2xl shadow-xl bg-white dark:bg-gray-900 text-gray-800 dark:text-white">
            <div className="flex flex-col items-center">
                <div className="relative group">
                    {loader ? (
                        <img
                            src="https://cdn.dribbble.com/userupload/21183802/file/original-80d7cf1f35a06cfd4d1226b6005026c1.gif"
                            alt="Loading"
                            className="w-32 h-32 rounded-full object-cover border-4 border-indigo-500 animate-pulse"
                        />
                    ) : (
                        <motion.img
                            src={imagePreview || "/default-avatar.png"}
                            alt="Profile"
                            className="w-32 h-32 rounded-full object-cover border-4 border-indigo-500 group-hover:border-teal-500 transition-all duration-300"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.3 }}
                        />
                    )}
                    {editMode && (
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                    )}
                </div>

                {editMode ? (
                    <input
                        className="mt-4 text-center text-xl font-semibold bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-teal-500 transition-all duration-300"
                        value={name || ""}
                        onChange={(e) => setName(e.target.value)}
                    />
                ) : (
                    <h2 className="mt-4 text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-500 bg-clip-text text-transparent hover:from-green-700 hover:to-teal-600 transition-all duration-300">
                        {name || "No Name"}
                    </h2>
                )}

                <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email || "No Email"}</p>

                {user?.role && (
                    <div
                        className={`mt-2 px-3 py-1 rounded-full text-white text-sm flex items-center gap-1 ${roleColors[user.role] || "bg-gray-500"} hover:opacity-90 transition-opacity duration-300`}
                    >
                        <BadgeCheck size={16} />
                        {user.role.toUpperCase()}
                    </div>
                )}

                {user?.metadata?.lastSignInTime && (
                    <p className="mt-2 text-xs text-gray-400">
                        Last login: {new Date(user.metadata.lastSignInTime).toLocaleString()}
                    </p>
                )}

                <div className="mt-5">
                    {editMode ? (
                        <motion.button
                            onClick={handleSave}
                            className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl hover:from-green-600 hover:to-teal-600 transition-all duration-300"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Save size={18} /> Save
                        </motion.button>
                    ) : (
                        <motion.button
                            onClick={() => setEditMode(true)}
                            className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl hover:from-indigo-600 hover:to-cyan-600 transition-all duration-300"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Pencil size={18} /> Edit Profile
                        </motion.button>
                    )}
                </div>
            </div>
        </div>
    );
}
