import React from "react";
import { FaFacebookF, FaInstagram, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-gray-300 pt-12 pb-6 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* 🏬 Brand Info */}
        <div className="space-y-4">
          <h2 className="text-2xl font-extrabold text-white tracking-wide">
            Style Shoe Hub BD
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Step into style with comfort and confidence. From trendy sneakers to
            elegant formals — find the perfect pair for every step you take.
          </p>
          <div className="flex gap-4 mt-4">
            <a
              href="https://www.facebook.com/share/176jdRiSTg/?mibextid=wwXIfr"
              target="_blank"
              rel="noreferrer"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 transition-all duration-300"
            >
              <FaFacebookF className="text-white text-lg" />
            </a>
            <a
              href="https://www.instagram.com/styleshoehubbd?igsh=NnFmZW9yYXhhaW1p"
              target="_blank"
              rel="noreferrer"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-pink-600 hover:bg-pink-700 transition-all duration-300"
            >
              <FaInstagram className="text-white text-lg" />
            </a>
          </div>
        </div>

        {/* 🛍️ Quick Links */}
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-white">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="/" className="hover:text-teal-400 transition">Home</a></li>
            <li><a href="/policies" className="hover:text-teal-400 transition">All Shoes</a></li>
            <li><a href="/blogs" className="hover:text-teal-400 transition">Stories</a></li>
            <li><a href="/about" className="hover:text-teal-400 transition">About Us</a></li>
            <li><a href="/cart" className="hover:text-teal-400 transition">My Cart</a></li>
          </ul>
        </div>

        {/* 🧾 Customer Care */}
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-white">Customer Care</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-teal-400 transition">Size Guide</a></li>
            <li><a href="#" className="hover:text-teal-400 transition">Exchange & Returns</a></li>
            <li><a href="#" className="hover:text-teal-400 transition">FAQs</a></li>
            <li><a href="#" className="hover:text-teal-400 transition">Track Order</a></li>
            <li><a href="#" className="hover:text-teal-400 transition">Support</a></li>
          </ul>
        </div>

        {/* 📞 Contact Info */}
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-white">Contact Us</h3>
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <FaMapMarkerAlt className="text-teal-400 text-lg" />
            <span>Style Shoe Hub BD, Dhaka, Bangladesh</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <FaPhoneAlt className="text-teal-400 text-lg" />
            <span>+880 1756-869609</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <FaEnvelope className="text-teal-400 text-lg" />
            <span>styleshoehub@gmail.com
</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-700 my-8"></div>

      {/* Bottom Footer */}
      <div className="text-center text-sm text-gray-500">
        <p>
          © {new Date().getFullYear()}{" "}
          <span className="text-teal-400 font-semibold">Style Shoe Hub BD</span>. All Rights Reserved.
        </p>
        <p className="mt-2 text-gray-600">
          Designed with ❤️ by <span className="text-emerald-400">Your Creative Partner</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
