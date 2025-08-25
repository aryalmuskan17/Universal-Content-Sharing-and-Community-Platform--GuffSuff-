// src/pages/PaymentFailed.jsx

import React from 'react';
import { useSearchParams } from 'react-router-dom';

// This component displays a page for a failed payment transaction.
// It retrieves the reason for the failure from the URL's query parameters to provide a more specific message.
const PaymentFailed = () => {
  // `useSearchParams` is a React Router hook that reads and modifies the query string in the URL.
  const [searchParams] = useSearchParams();
  // Get the 'reason' parameter from the URL. If it doesn't exist, use a default message.
  const reason = searchParams.get('reason') || 'An unknown error occurred';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-4">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-lg text-center">
        {/* A simple SVG icon to visually indicate a failure */}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-20 w-20 text-red-500 mx-auto mb-4" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Payment Failed</h1>
        {/* Display the dynamic failure reason */}
        <p className="text-gray-600 dark:text-gray-400">
          Your transaction could not be completed. Reason: {reason}.
        </p>
        {/* A call-to-action button to navigate the user back to a safe starting point */}
        <a href="/" className="mt-6 inline-block bg-indigo-500 text-white py-2 px-4 rounded-lg hover:bg-indigo-600 transition-colors">
          Back to Home
        </a>
      </div>
    </div>
  );
};

export default PaymentFailed;