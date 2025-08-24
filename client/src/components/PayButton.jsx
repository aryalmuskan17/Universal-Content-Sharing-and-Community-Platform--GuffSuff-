// src/components/PayButton.jsx
import React, { useState } from 'react';
import axios from 'axios';

const PayButton = ({ amount, purpose, publisherId, articleId, userToken }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const ngrokUrl = 'https://946cf2a7dbc2.ngrok-free.app'; // Use your actual current ngrok URL

    const handlePayment = async () => {
        setLoading(true);
        setError(null);
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': userToken 
                }
            };
            
            const body = {
                amount,
                purpose,
                publisherId,
                articleId
            };

            // 1. Call your new backend route to get the signature
            const res = await axios.post('http://localhost:5001/api/payments/initiate', body, config);
            
            if (res.data.success) {
                const { amount, product_code, transaction_uuid, signature } = res.data.paymentDetails;
                
                // 2. Create a new form element
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';

                // 3. Define the parameters for the form
                const params = {
                    amount: amount,
                    tax_amount: 0,
                    product_service_charge: 0,
                    product_delivery_charge: 0,
                    total_amount: amount,
                    transaction_uuid: transaction_uuid,
                    product_code: product_code,
                    success_url: `${ngrokUrl}/api/payments/verify`, // IMPORTANT: Use your Ngrok URL here
                    failure_url: 'http://localhost:3000/payment-failed',
                    
                    // THIS IS THE CORRECTED LINE
                    signed_field_names: 'total_amount,transaction_uuid,product_code',
                    signature: signature
                };

                // 4. Add the parameters as hidden inputs
                for (const key in params) {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = key;
                    input.value = params[key];
                    form.appendChild(input);
                }

                // 5. Append the form to the body and submit it
                document.body.appendChild(form);
                form.submit();
                
            } else {
                setError('Payment initiation failed. Please try again.');
            }
        } catch (err) {
            console.error(err);
            setError('An error occurred during payment. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <button 
                onClick={handlePayment} 
                disabled={loading}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
            >
                {loading ? 'Processing...' : 'Donate'}
            </button>
            {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
    );
};

export default PayButton;