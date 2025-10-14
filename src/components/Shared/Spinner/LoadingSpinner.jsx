import React from 'react';

const LoadingSpinner = () => {
    return (

        <div className="min-h-screen flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-green-600"></div>
            <span className="ml-4 text-xl font-semibold text-gray-700">Loading ...</span>
        </div>








    );
};

export default LoadingSpinner;