import React, { useState } from "react";
import { useCart } from "../../context/CartContext";
import { FaTrash } from "react-icons/fa";
import axios from "axios";

const CartPage = () => {
  const { cart, removeFromCart, clearCart } = useCart();
  const [openFormId, setOpenFormId] = useState(null); // ✅ কোন আইটেমে ফর্ম ওপেন আছে ট্র্যাক করবে
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    streetAddress: "",
    city: "",
    postalCode: "",
    landmark: "",
  });

  const extractPrice = (range) => {
    if (!range) return 0;
    const match = range.match(/\$?([\d,]+)/);
    if (!match) return 0;
    return parseInt(match[1].replace(/,/g, ""), 10);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ✅ Handle Order Submission
  const handleOrderSubmit = async (e, item) => {
    e.preventDefault();
    try {
      const orderData = {
        ...formData,
        productId: item.productId,
        title: item.title,
        image: item.image,
        quantity: item.quantity,
        price:
          item.price && item.price > 0
            ? item.price
            : extractPrice(item.coverageRange),
        total:
          (item.price && item.price > 0
            ? item.price
            : extractPrice(item.coverageRange)) * item.quantity,
        status: "Pending",
        email: formData.email,
        createdAt: new Date(),
      };

      await axios.post("https://servers003.vercel.app/orders", orderData);
      alert("✅ Order placed successfully!");
      setOpenFormId(null);
      setFormData({
        fullName: "",
        phone: "",
        email: "",
        streetAddress: "",
        city: "",
        postalCode: "",
        landmark: "",
      });
    } catch (err) {
      console.error(err);
      alert("❌ Failed to place order");
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-gray-600">
        <img
          src="https://cdn-icons-png.flaticon.com/512/11329/11329060.png"
          alt="Empty Cart"
          className="w-40 mb-4 opacity-70"
        />
        <h2 className="text-2xl font-semibold mb-2">Your Cart is Empty</h2>
        <p className="text-gray-500">Add some products to see them here!</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-5 py-10">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
        🛒 Your Cart
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cart.map((item, i) => {
          const price =
            (typeof item.price === "number" && item.price > 0
              ? item.price
              : extractPrice(item.coverageRange)) || 0;

          return (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all p-4 border border-gray-100 flex flex-col"
            >
              {/* Product Image */}
              <div className="relative w-full h-60 bg-gray-50 rounded-xl overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-contain p-4"
                />
              </div>

              {/* Product Info */}
              <div className="flex-1 mt-4">
                <h2 className="text-lg font-bold text-gray-800 mb-1">
                  {item.title}
                </h2>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {item.description || "No description available."}
                </p>

                <p className="text-red-600 font-bold text-xl mb-2">
                  ৳ {price.toLocaleString()}
                </p>

                <div className="text-sm text-gray-700 space-y-1">
                  <p>
                    <span className="font-semibold">Size:</span>{" "}
                    {item.size || "N/A"}
                  </p>
                  <p>
                    <span className="font-semibold">Color:</span>{" "}
                    {item.color || "N/A"}
                  </p>
                  <p>
                    <span className="font-semibold">Quantity:</span>{" "}
                    {item.quantity}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex justify-between items-center border-t pt-3">
                <button
                  onClick={() =>
                    removeFromCart(item._id, item.size, item.color)
                  }
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium transition"
                >
                  <FaTrash /> Remove
                </button>

                <button
                  onClick={() =>
                    setOpenFormId(openFormId === item._id ? null : item._id)
                  }
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  {openFormId === item._id ? "Cancel" : "Buy Now"}
                </button>
              </div>

              {/* ✅ Conditional Order Form */}
              {openFormId === item._id && (
                <div className="mt-6 bg-gray-50 p-4 rounded-2xl shadow-inner border">
                  <h3 className="text-lg font-bold mb-4 text-center text-gray-700">
                    Complete Your Order
                  </h3>
                  <form
                    onSubmit={(e) => handleOrderSubmit(e, item)}
                    className="space-y-3"
                  >
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Full Name"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone Number"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    <input
                      type="email"
                      name="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    <input
                      type="text"
                      name="streetAddress"
                      placeholder="Street Address"
                      value={formData.streetAddress}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    <input
                      type="text"
                      name="city"
                      placeholder="City / Thana / District"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    <input
                      type="text"
                      name="postalCode"
                      placeholder="Postal Code"
                      value={formData.postalCode}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    <input
                      type="text"
                      name="landmark"
                      placeholder="Landmark (optional)"
                      value={formData.landmark}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg"
                    />

                    <button
                      type="submit"
                      className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition"
                    >
                      Confirm Order
                    </button>
                  </form>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Total Section */}
      <div className="mt-10 bg-white shadow-md border rounded-xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <button
          onClick={clearCart}
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition"
        >
          Clear Cart
        </button>
      </div>
    </div>
  );
};

export default CartPage;
