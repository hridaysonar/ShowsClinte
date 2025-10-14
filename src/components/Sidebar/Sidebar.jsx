import React from 'react';
import { Link, useLocation } from 'react-router';
import { motion } from 'framer-motion';
import {
  User,
  FileText,
  Users,
  ClipboardList,
  CreditCard,
  UserCheck,
  Newspaper,
  CheckCircle,
  File,
  DollarSign,
  FileWarning,
  ShoppingBag, // 🛍️ Added icon for Orders
} from 'lucide-react';
import SideLogo from './SideLogo';

const Sidebar = ({ role, isOpen }) => {
  const location = useLocation();

  const commonLinks = [
    { to: '/profile', label: 'Profile', icon: <User size={20} /> },
  ];

  const adminLinks = [
    { to: '/dashboard/manage-applications', label: 'Manage Booking', icon: <FileText size={20} /> },
    { to: '/dashboard/manage-users', label: 'Manage Users', icon: <Users size={20} /> },
    { to: '/dashboard/manage-policies', label: 'Manage Package', icon: <ClipboardList size={20} /> },
    { to: '/dashboard/orders', label: 'Manage Orders', icon: <ShoppingBag size={20} /> },
 // 🆕 Added Manage Orders
    { to: '/dashboard/manage-transactions', label: 'Manage Transactions', icon: <CreditCard size={20} /> },
    { to: '/dashboard/manage-blogs', label: 'Manage Story', icon: <Newspaper size={20} /> },
  ];

  const agentLinks = [
    { to: '/dashboard/assigned-customers', label: 'Tour Guide Customers', icon: <UserCheck size={20} /> },
    { to: '/dashboard/manage-blogs', label: 'Manage Story', icon: <Newspaper size={20} /> },
    { to: '/dashboard/policy-clearance', label: 'Policy Clearance', icon: <CheckCircle size={20} /> },
  ];

  const customerLinks = [
    { to: '/dashboard/my-orders', label: 'My Orders', icon: <ShoppingBag size={20} /> },
 // 🆕 Added My Orders
    { to: '/dashboard/my-policies', label: 'My Policies', icon: <File size={20} /> },
    { to: '/dashboard/payment-status', label: 'Payment Status', icon: <DollarSign size={20} /> },
    { to: '/dashboard/claim-request', label: 'Claim Request', icon: <FileWarning size={20} /> },
  ];

  const roleLinks =
    role === 'admin'
      ? adminLinks
      : role === 'agent'
      ? agentLinks
      : customerLinks;

  return (
    <aside
      className={`fixed p-4 md:p-6 h-full md:h-screen overflow-y-auto  
        ${isOpen ? 'block' : 'hidden md:block'} w-64 lg:w-72 transition-all duration-300`}
    >
      {/* Dashboard Title */}
      <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-6 bg-gradient-to-r from-green-600 to-teal-500 bg-clip-text text-transparent">
        Dashboard
      </h2>

      {/* Role Badge */}
      <div className="mb-6">
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium 
          ${
            role === 'admin'
              ? 'bg-red-100 text-red-600'
              : role === 'agent'
              ? 'bg-blue-100 text-blue-600'
              : 'bg-yellow-100 text-yellow-600'
          }`}
        >
          {role?.charAt(0).toUpperCase() + role?.slice(1)}
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="space-y-3 md:space-y-4">
        {[...roleLinks, ...commonLinks].map((item, idx) => (
          <motion.div key={idx} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to={item.to}
              className={`flex items-center px-4 py-2 rounded-xl transition-all duration-200
                ${
                  location.pathname === item.to
                    ? 'bg-green-100 text-green-600 font-semibold'
                    : 'text-gray-700 hover:bg-green-50 hover:text-green-600'
                }`}
            >
              <span className="mr-3">{item.icon}</span>
              <span className="text-sm md:text-base">{item.label}</span>
            </Link>
          </motion.div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
