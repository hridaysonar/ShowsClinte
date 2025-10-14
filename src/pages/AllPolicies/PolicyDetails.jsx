import React, { useState } from "react";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { axiosSecure } from "../../hooks/useAxiosSecure";
import { useCart } from "../../context/CartContext";
import { Star } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

const PolicyDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    streetAddress: "",
    city: "",
    postalCode: "",
    landmark: "",
  });

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["policy", id],
    queryFn: async () => {
      const res = await axiosSecure.get(`/policies/${id}`);
      return res.data;
    },
  });

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin h-10 w-10 border-t-4 border-red-500 rounded-full"></div>
        <p className="ml-3 text-gray-600">Loading product details...</p>
      </div>
    );

  if (error || !product)
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Failed to load product details.
      </div>
    );

  const images = [product.image, product.image2, product.image3, product.image4].filter(Boolean);
  const displayImage = selectedImage || product.image;

  const handleBuyNow = () => setShowForm((prev) => !prev);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();

    const orderData = {
      ...formData,
      shoeSize: selectedSize,
      color: selectedColor,
      quantity,
      modelSKU: product._id,
      productTitle: product.title,
      price: product.price || product.coverageRange,
      category: product.category,
      image: product.image,
      coverageRange: product.coverageRange,
      description: product.description,
      orderDate: new Date().toISOString(),
      status: "Pending",
    };

    try {
      const res = await axiosSecure.post("/orders", orderData);
      if (res.data.insertedId) {
        alert("✅ Order placed successfully!");
        setFormData({
          fullName: "",
          phone: "",
          email: "",
          streetAddress: "",
          city: "",
          postalCode: "",
          landmark: "",
        });
        setShowForm(false);
      }
    } catch (err) {
      console.error("Order submit failed:", err);
      alert("❌ Failed to submit order.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid lg:grid-cols-2 gap-10">
        {/* LEFT */}
        <div className="flex flex-col items-center">
          <div className="w-full bg-gray-50 rounded-2xl overflow-hidden shadow">
            <img
              src={displayImage}
              alt={product.title}
              className="w-full h-[450px] object-contain p-6"
            />
          </div>

          {/* Thumbnails */}
          <div className="flex gap-3 mt-4">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(img)}
                className={`w-20 h-20 border-2 rounded-lg ${
                  selectedImage === img ? "border-red-500" : "border-gray-200"
                }`}
              >
                <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-4">
          <p className="text-xs uppercase text-gray-500">
            {product.brand || "Nawabi Shoes BD"}
          </p>
          <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>

          {/* Ratings */}
          <div className="flex items-center gap-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={18} className="text-yellow-400 fill-yellow-400" />
            ))}
            <span className="text-gray-500 text-sm">5.0 (10 reviews)</span>
          </div>

          {/* Price */}
          <p className="text-2xl font-bold text-red-600">
            ৳ {product.price || product.coverageRange || "Price Not Available"}
          </p>

          {/* Size */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Shoe Size</h3>
            <div className="flex gap-2 flex-wrap">
              {["39", "40", "41", "42", "43", "44"].map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`px-4 py-2 border rounded ${
                    selectedSize === s ? "bg-black text-white" : "border-gray-300 hover:border-black"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Color</h3>
            <div className="flex gap-2 flex-wrap">
              {["Black", "White", "Brown", "Blue", "Gray", "Red"].map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  className={`px-4 py-2 border rounded ${
                    selectedColor === c
                      ? "bg-gray-900 text-white"
                      : "border-gray-300 hover:border-gray-700"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Quantity</h3>
            <div className="flex items-center border w-max rounded">
              <button
                onClick={() => setQuantity((q) => (q > 1 ? q - 1 : 1))}
                className="px-3 py-2 text-gray-600 hover:text-red-600"
              >
                -
              </button>
              <span className="px-5 font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="px-3 py-2 text-gray-600 hover:text-red-600"
              >
                +
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-3 pt-4">
            <button
              onClick={() => addToCart(product, selectedSize, selectedColor, quantity)}
              className="w-full border border-red-600 text-red-600 py-3 rounded-lg hover:bg-red-600 hover:text-white transition"
            >
              Add to Cart
            </button>

            <button
              onClick={handleBuyNow}
              className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition"
            >
              {showForm ? "Close Form" : "Buy It Now"}
            </button>

            <a
              href="https://wa.me/8801756869609?text=Hello!%20I%20want%20to%20order%20your%20product."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              <FaWhatsapp size={20} />
              Order on WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* ✅ Inline Form */}
      {showForm && (
        <div className="mt-10 bg-gray-50 p-6 rounded-2xl shadow-lg max-w-2xl mx-auto border">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
            Complete Your Order
          </h2>
          <form onSubmit={handleOrderSubmit} className="space-y-4">
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded-lg"
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded-lg"
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded-lg"
            />
            <input
              type="text"
              name="streetAddress"
              placeholder="Street Address"
              value={formData.streetAddress}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded-lg"
            />
            <input
              type="text"
              name="city"
              placeholder="City / Thana / District"
              value={formData.city}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded-lg"
            />
            <input
              type="text"
              name="postalCode"
              placeholder="Postal Code"
              value={formData.postalCode}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded-lg"
            />
            <input
              type="text"
              name="landmark"
              placeholder="Landmark (optional)"
              value={formData.landmark}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg"
            />

            <button
              type="submit"
              className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition"
            >
              Confirm Order(Cash On Delivery)
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PolicyDetails;
