// src/components/PayButton.jsx
import React, { useState } from 'react';
import axios from 'axios';

// This component handles initiating a payment using the eSewa gateway
const PayButton = ({ amount, purpose, publisherId, articleId, userToken }) => {
    // State to manage the loading status of the button
    const [loading, setLoading] = useState(false);
    // State to manage and display any errors
    const [error, setError] = useState(null);
    // Use your current ngrok URL for the redirect
    const ngrokUrl = 'https://946cf2a7dbc2.ngrok-free.app'; 

    // Handler for the payment button click
    const handlePayment = async () => {
        setLoading(true);
        setError(null);
        try {
            // Configuration for the API request, including the user's authentication token
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': userToken 
                }
            };
            
            // The data to be sent to your backend to initiate the transaction
            const body = {
                amount,
                purpose,
                publisherId,
                articleId
            };

            // 1. Call your backend route to get the signature for the payment
            const res = await axios.post('http://localhost:5001/api/payments/initiate', body, config);
            
            if (res.data.success) {
                const { amount, product_code, transaction_uuid, signature } = res.data.paymentDetails;
                
                // 2. Create a new form element dynamically
                const form = document.createElement('form');
                form.method = 'POST';
                // Set the form action to the eSewa payment gateway URL
                form.action = 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';

                // 3. Define the payment parameters for the form
                const params = {
                    amount: amount,
                    tax_amount: 0,
                    product_service_charge: 0,
                    product_delivery_charge: 0,
                    total_amount: amount,
                    transaction_uuid: transaction_uuid,
                    product_code: product_code,
                    // IMPORTANT: The success URL must be your public Ngrok URL
                    success_url: `${ngrokUrl}/api/payments/verify`,
                    failure_url: 'http://localhost:3000/payment-failed',
                    
                    // The field names that were used to generate the signature
                    signed_field_names: 'total_amount,transaction_uuid,product_code',
                    signature: signature
                };

                // 4. Create hidden input fields for each parameter and append to the form
                for (const key in params) {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = key;
                    input.value = params[key];
                    form.appendChild(input);
                }

                // 5. Append the form to the document body and submit it
                document.body.appendChild(form);
                form.submit();
                
            } else {
                setError('Payment initiation failed. Please try again.');
            }
        } catch (err) {
            console.error(err);
            setError('An error occurred during payment. Please try again.');
        } finally {
            setLoading(false); // Stop the loading state regardless of outcome
        }
    };

    return (
        <div>
            {/* The donate button with loading state and disabled prop */}
            <button 
                onClick={handlePayment} 
                disabled={loading}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
            >
                {loading ? 'Processing...' : 'Donate'}
            </button>
            {/* Display error message if an error exists */}
            {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
    );
};

export default PayButton;