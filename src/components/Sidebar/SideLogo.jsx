
import React from 'react';
import { Link } from 'react-router';

const SideLogo = () => {
    return (
       <Link to={'/'}>
  <div
    className="flex items-center gap-3 bg-gradient-to-r from-green-50 to-teal-50 
               rounded-3xl px-4 py-2 shadow-sm hover:shadow-md transition-all duration-300"
  >
    <div className="flex-shrink-0">
      <img
        className="w-14 h-14 rounded-full ring-2 ring-green-400 hover:ring-teal-500 transition-all duration-300"
        src="https://i.ibb.co.com/8nG0pYw3/IMG-20250827-WA0001.jpg"
        alt="Style Shoe Hub BD Logo"
      />
    </div>

    <h1
      className="text-2xl font-extrabold bg-clip-text text-transparent 
                 bg-gradient-to-r from-green-600 to-teal-500 
                 hover:from-green-700 hover:to-teal-600 transition-all duration-300"
    >
      Style Shoe Hub BD
    </h1>
  </div>
</Link>

    );
};

export default SideLogo;