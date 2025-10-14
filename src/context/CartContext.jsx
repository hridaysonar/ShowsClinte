import React, { createContext, useContext, useEffect, useState } from "react";
import { axiosSecure } from "../hooks/useAxiosSecure"; // তোমার axios hook

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const userEmail = localStorage.getItem("userEmail"); // login এর পর সেভ করা ইমেইল ধরো

  // 🔹 Load cart from backend
  useEffect(() => {
    if (userEmail) {
      axiosSecure
        .get(`/cart?email=${userEmail}`)
        .then((res) => setCart(res.data))
        .catch(() => console.error("Failed to load cart"));
    }
  }, [userEmail]);

  // ➕ Add item to cart
  const addToCart = async (product, size, color, quantity = 1) => {
    if (!userEmail) {
      alert("Please login first!");
      return;
    }

    if (!size || !color) {
      alert("Please select Size and Color!");
      return;
    }

    const payload = {
      email: userEmail,
      productId: product._id,
      title: product.title,
      price: product.price || product.coverageRange,
      image: product.image,
      size,
      color,
      quantity,
    };

    try {
      await axiosSecure.post("/cart", payload);
      const res = await axiosSecure.get(`/cart?email=${userEmail}`);
      setCart(res.data);
      alert("✅ Added to Cart!");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to add to cart");
    }
  };

  // ❌ Remove item
  const removeFromCart = async (id) => {
    try {
      await axiosSecure.delete(`/cart/${id}`);
      setCart((prev) => prev.filter((item) => item._id !== id));
    } catch {
      alert("Failed to remove item");
    }
  };

  // 🧹 Clear all
  const clearCart = async () => {
    try {
      await axiosSecure.delete(`/cart/clear/${userEmail}`);
      setCart([]);
    } catch {
      alert("Failed to clear cart");
    }
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
