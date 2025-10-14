// 📁 src/hooks/useSaveUser.js
import axios from "axios";

// ⚙️ Secure Axios instance with credentials enabled
export const axiosSecure = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // ✅ send cookies automatically
});

// 🧩 Save or update user in database
export const saveUserInDb = async (user) => {
  try {
    // ✅ Step 1: Create JWT first (so cookie will be set)
    await axiosSecure.post("/jwt", { email: user.email });

    // ✅ Step 2: Save user to DB
    const { data } = await axiosSecure.post("/user", user);
    console.log("✅ User saved:", data);
    return data;
  } catch (error) {
    console.error("❌ saveUserInDb error:", error.response?.data || error);
    throw new Error(error.response?.data?.message || "Failed to save user");
  }
};
