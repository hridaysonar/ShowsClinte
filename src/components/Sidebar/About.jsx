import React from "react";
import { motion } from "framer-motion";
import {
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaFacebook,
  FaInstagram,
} from "react-icons/fa";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.3, delayChildren: 0.2 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const About = () => {
  return (
    <section className="min-h-screen bg-gradient-to-br from-[#f0f4ff] to-[#e0ffe8] py-16 sm:py-20 px-4 sm:px-6 lg:px-10">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={fadeUp} className="text-center mb-16">
          <h1 className="text-4xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">
            👟 Style Shoe Hub BD
          </h1>
          <p className="mt-4 text-base sm:text-xl text-gray-700 font-medium tracking-wide">
            “Step into Style – Comfort that walks with you.”
          </p>
        </motion.div>

        {/* About the Store */}
        <motion.div
          variants={fadeUp}
          className="bg-white/90 backdrop-blur-xl p-6 sm:p-10 md:p-16 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.1)]"
        >
          <motion.div
            variants={fadeUp}
            className="grid md:grid-cols-2 gap-10 md:gap-14 items-start"
          >
            {/* Left Side */}
            <motion.div variants={fadeUp} className="space-y-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-teal-700">
                🧾 About Our Shop
              </h2>
              <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
                Welcome to <strong>Style Shoe Hub BD</strong> — your trusted
                destination for stylish, durable, and comfortable footwear in
                Bangladesh. We bring you a curated selection of the finest shoes
                for every occasion — from casual sneakers to classy office wear.
              </p>
              <p className="text-gray-700 text-base sm:text-lg">
                Our mission is simple — to make every step confident, comfortable,
                and stylish. Each pair we offer is crafted with quality materials
                and designed to match your lifestyle, blending fashion with
                durability.
              </p>
            </motion.div>

            {/* Right Side */}
            <motion.div
              variants={fadeUp}
              className="bg-gradient-to-br from-emerald-100 to-teal-50 p-6 sm:p-8 rounded-2xl shadow-lg border border-teal-200"
            >
              <h3 className="text-2xl font-semibold text-teal-800 mb-4">
                ⭐ Why People Love Us
              </h3>
              <ul className="list-disc list-inside text-gray-800 space-y-2 text-sm sm:text-base">
                <li>High-quality materials & modern designs</li>
                <li>Comfortable for long wear</li>
                <li>Affordable prices & exciting offers</li>
                <li>Fast home delivery & easy returns</li>
                <li>Thousands of satisfied customers</li>
              </ul>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Gallery Section */}
        <motion.div variants={fadeUp} className="mt-20">
          <h2 className="text-3xl font-bold text-teal-700 mb-10 text-center">
            🥿 Our Featured Collections
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Classic Leather Boots",
                img: "https://images.unsplash.com/photo-1600181952727-3c9f3b1c0f61",
              },
              {
                title: "Casual Everyday Sneakers",
                img: "https://images.unsplash.com/photo-1528701800489-20be1f5e94d3",
              },
              {
                title: "Elegant Office Shoes",
                img: "https://images.unsplash.com/photo-1549298916-b41d501d3772",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ scale: 1.04 }}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300"
              >
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-56 sm:h-64 object-cover"
                />
                <div className="p-5 text-center">
                  <h4 className="text-lg sm:text-xl font-semibold text-teal-700">
                    {item.title}
                  </h4>
                  <p className="text-gray-600 text-sm mt-2">
                    Crafted for comfort, made for every step.
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Admin / Contact Section */}
        <motion.div variants={fadeUp} className="text-center mt-24">
          <h3 className="text-3xl font-bold text-gray-800 mb-8">
            📞 Store Information
          </h3>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 text-gray-700 text-base sm:text-lg">
            <div className="flex items-center gap-3">
              <FaMapMarkerAlt className="text-teal-500 text-xl" />
              <span>Style Shoe Hub BD, Dhaka, Bangladesh</span>
            </div>
            <div className="flex items-center gap-3">
              <FaPhoneAlt className="text-teal-500 text-xl" />
              <span>+880 1756-869609</span>
            </div>
            <div className="flex items-center gap-3">
              <FaEnvelope className="text-teal-500 text-xl" />
              <span>styleshoehub@gmail.com
</span>
            </div>
          </div>

          {/* Social Media */}
          <div className="flex justify-center gap-6 sm:gap-10 mt-10">
            <a
              href="https://www.facebook.com/share/176jdRiSTg/?mibextid=wwXIfr"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition text-sm sm:text-base"
            >
              <FaFacebook size={20} /> Facebook
            </a>
            <a
              href="https://www.instagram.com/styleshoehubbd?igsh=NnFmZW9yYXhhaW1p"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 bg-pink-600 text-white px-5 py-2 rounded-full hover:bg-pink-700 transition text-sm sm:text-base"
            >
              <FaInstagram size={20} /> Instagram
            </a>
          </div>

          <p className="mt-10 text-gray-500 text-xs sm:text-sm">
            © 2025 Style Shoe Hub BD. All Rights Reserved.
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default About;
