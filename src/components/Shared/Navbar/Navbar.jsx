import React, { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router';
import { FaBars, FaTimes, FaShoppingCart } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import useAuth from '../../../hooks/useAuth';
import SideLogo from '../../Sidebar/SideLogo';
import { useCart } from '../../../context/CartContext';

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user, logOut } = useAuth();
  const [photoURL, setPhotoURL] = useState(null);
  const { cart } = useCart();

  useEffect(() => {
    if (user) setPhotoURL(user?.photoURL);
    else setPhotoURL(null);
  }, [user]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Story', path: '/blogs' },
    { name: 'All Shoes', path: '/policies' },
    { name: 'About Us', path: '/about' },
  ];

  const mobileMenuVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50 w-full">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-6 py-3 flex justify-between items-center">
        {/* 🔹 Logo */}
        <Link to="/" className="flex items-center gap-2">
          <SideLogo />
        </Link>

        {/* 💻 Desktop Menu */}
        <div className="hidden md:flex space-x-5 lg:space-x-8 items-center">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `text-[15px] font-medium transition-all duration-300 ${
                  isActive
                    ? 'text-teal-600 border-b-2 border-teal-600'
                    : 'text-gray-700 hover:text-teal-500 hover:border-b-2 hover:border-teal-300'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}

          {/* 🛒 Shopping Cart Icon (updated) */}
          <NavLink
            to="/cart"
            className="relative text-gray-700 hover:text-teal-500 transition-colors duration-300"
          >
            <FaShoppingCart size={22} />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-teal-500 text-white text-[10px] font-bold rounded-full px-1.5">
                {cart.length}
              </span>
            )}
          </NavLink>

          {/* 👤 User Section */}
          {user ? (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `text-[15px] font-medium transition-colors duration-300 ${
                    isActive
                      ? 'text-teal-600'
                      : 'text-gray-700 hover:text-teal-500'
                  }`
                }
              >
                Dashboard
              </NavLink>

              {/* 🧑 Profile Image */}
              <div className="group relative">
                <NavLink to="/profile">
                  <motion.img
                    src={photoURL}
                    alt={user?.displayName || 'User'}
                    className="w-9 h-9 rounded-full object-cover border-2 border-teal-500 hover:border-teal-600 transition-all duration-200"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  />
                </NavLink>
                <motion.div
                  className="absolute hidden group-hover:block bg-gray-800 text-white text-xs font-medium px-2 py-1 rounded-md -bottom-8 left-1/2 transform -translate-x-1/2"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {user?.displayName?.split(' ')[0] || 'User'}
                </motion.div>
              </div>

              <motion.button
                onClick={logOut}
                className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-3 py-1.5 rounded-lg font-medium hover:from-red-600 hover:to-rose-600 shadow-md hover:shadow-lg transition-all duration-300 text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Logout
              </motion.button>
            </>
          ) : (
            <NavLink
              to="/login"
              className="bg-gradient-to-r from-green-600 to-teal-500 text-white px-4 py-1.5 rounded-lg font-medium hover:from-green-700 hover:to-teal-600 shadow-md hover:shadow-lg transition-all duration-300 text-sm"
            >
              Login
            </NavLink>
          )}
        </div>

        {/* 📱 Mobile Menu Toggle */}
        <div className="md:hidden flex items-center gap-4 text-xl text-gray-700">
          <Link to="/cart" className="relative">
            <FaShoppingCart />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-teal-500 text-white text-[10px] font-bold rounded-full px-1.5">
                {cart.length}
              </span>
            )}
          </Link>
          <motion.button onClick={() => setOpen(!open)} whileTap={{ scale: 0.9 }}>
            {open ? <FaTimes /> : <FaBars />}
          </motion.button>
        </div>
      </div>

      {/* 📱 Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="md:hidden bg-white shadow-md px-4 py-4 w-full"
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `block py-2 text-[16px] font-medium ${
                    isActive
                      ? 'text-teal-600'
                      : 'text-gray-700 hover:text-teal-500'
                  }`
                }
                onClick={() => setOpen(false)}
              >
                {link.name}
              </NavLink>
            ))}

            <NavLink
              to="/cart"
              className="block py-2 text-[16px] font-medium text-gray-700 hover:text-teal-500"
              onClick={() => setOpen(false)}
            >
              🛒 Cart ({cart.length})
            </NavLink>

            {user ? (
              <>
                <NavLink
                  to="/dashboard"
                  className="block py-2 text-[16px] font-medium text-gray-700 hover:text-teal-500"
                  onClick={() => setOpen(false)}
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/profile"
                  className="block py-2 text-[16px] font-medium text-gray-700 hover:text-teal-500"
                  onClick={() => setOpen(false)}
                >
                  Profile
                </NavLink>
                <button
                  onClick={() => {
                    logOut();
                    setOpen(false);
                  }}
                  className="block py-2 text-[16px] font-medium text-red-500 hover:text-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className="block py-2 text-[16px] font-medium text-gray-700 hover:text-teal-500"
                  onClick={() => setOpen(false)}
                >
                  Login
                </NavLink>
                <NavLink
                  to="/signup"
                  className="block py-2 text-[16px] font-medium text-gray-700 hover:text-teal-500"
                  onClick={() => setOpen(false)}
                >
                  Register
                </NavLink>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
