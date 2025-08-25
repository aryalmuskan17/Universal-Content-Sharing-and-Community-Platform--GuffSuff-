// src/pages/PaymentSuccess.jsx

import React from 'react';
import { useSearchParams } from 'react-router-dom';

// This component displays a success page after a user completes a payment.
// It retrieves the amount from the URL's query parameters to provide a personalized confirmation message.
const PaymentSuccess = () => {
  // `useSearchParams` is a React Router hook that provides access to the URL's query string.
  const [searchParams] = useSearchParams();
  // Get the 'amount' parameter from the URL. This value is used to confirm the payment amount to the user.
  const amount = searchParams.get('amount');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-4">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-lg text-center">
        {/* A simple SVG icon to visually confirm the success of the transaction */}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-20 w-20 text-green-500 mx-auto mb-4" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Payment Successful!</h1>
        {/* Display the dynamic payment amount */}
        <p className="text-gray-600 dark:text-gray-400">
          Thank you for your support! Your payment of NPR. {amount} has been successfully processed.
        </p>
        {/* A link to navigate the user back to the home page */}
        <a href="/" className="mt-6 inline-block bg-indigo-500 text-white py-2 px-4 rounded-lg hover:bg-indigo-600 transition-colors">
          Back to Home
        </a>
      </div>
    </div>
  );
};

export default PaymentSuccess;