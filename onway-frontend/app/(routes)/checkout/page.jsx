'use client'
import { CartUpdateContext } from '@/app/_context/CartUpdateContext';
import { useUser } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';
import React, { useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { useRouter } from 'next/navigation';
import { fetchCart } from '@/app/_utils/Api';
import axios from 'axios';

function Page() {
    const router = useRouter();
    const params = useSearchParams();
    const { user } = useUser();
    const { updateCart, setUpdateCart, cart, setCart } = useContext(CartUpdateContext);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [zip, setZip] = useState('');
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [orderId, setOrderId] = useState(null);

    useEffect(() => {
        if (user) {
            getCart();
        }
    }, [user, updateCart]);

    useEffect(() => {
        if (user) {
            setEmail(user.emailAddresses[0]?.emailAddress || '');
            setName(user.fullName || '');
        }
    }, [user]);

    const getCart = async () => {
        if (!user || !user.id){
                    toast('Sign up your Account!');
                    return;
                }
        const cartData = await fetchCart(user.id);
        if (cartData) {
            setCart(cartData);
        }
    };

    const deliveryCharge = 15;
    const total = cart.total_price + cart.total_price * 0.07 + deliveryCharge;



    const createOrder = async () => {
        try {
            // if (!(name && email && address && zip && phone)) {
            //     toast("Please fill all required fields correctly");
            //     return null;
            // }
    
            setLoading(true);
            const shippingAddress = { name, email, phone, zip, address };
            
            const response = await axios.post('http://localhost:5000/create-order', {
                user_id: user.id,
                shipping_address: shippingAddress,
                cart_items: cart.items,
                total_amount: total,
                currency: 'INR'
            });
            
            setLoading(false);
            
            if (response.data.paypal_order_id) {
                localStorage.setItem("order_id", response.data.order_id); 
                
          
                
                return response.data.paypal_order_id;
            } else {
                toast("Payment creation failed");
                return null;
            }
        } catch (error) {
            setLoading(false);
            toast("Error creating order");
            return null;
        }
    };

    

    const handleCashOnDelivery = async () => {
        try {
         

            setLoading(true);
            const shippingAddress = { name, email, phone, zip, address };
            
            const response = await axios.post('http://localhost:5000/create-order', {
                user_id: user.id,
                shipping_address: shippingAddress,
                cart_items: cart.items,
                total_amount: total,
                payment_method: "COD",
                currency: 'INR'
            });
            
            setLoading(false);
            
            if (response?.data?.display_order_id) {
                toast('Order placed successfully! Your order ID is: ' + response.data.display_order_id);
                setUpdateCart(!updateCart);
                router.replace('/users#/my-orders');
            } else {
                toast("Order creation failed");
            }
        } catch (error) {
            setLoading(false);
            toast("Error creating order");
        }
    };

const handleApprove = async (data, actions) => {
    try {
        setLoading(true);
        
        const response = await axios.post('http://localhost:5000/capture-payment', {
            order_id: localStorage.getItem("order_id"),
            paypal_order_id: data.orderID  // This is the PayPal order ID
        });
        
        setLoading(false);
        
        if (response.data.message) {
            toast('Payment successful! Order placed. Your order ID is: ' + response.data.display_order_id);
            setUpdateCart(!updateCart);
            router.replace('/users#/my-orders');
            return true;
        } else {
            toast('Error completing order');
            return false;
        }
    } catch (error) {
        console.error('Error completing order:', error);
        setLoading(false);
        toast('Error completing order');
        return false;
    }
};

    return (
        <div>
            <h3 className='font-bold text-3xl my-5 text-center'>Checkout</h3>
            <div className='p-5 px-5 md:px-10 grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div className='md:col-span-2 mx-8'>
                    <h3 className='text-3xl font-bold'>Billing Details</h3>
                    <div className='grid grid-cols-2 gap-10 mt-3'>
                        <input
                            placeholder='Name'
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className='w-full rounded border border-[#e0e0e0] bg-white p-2'
                            required
                        />
                        <input
                            placeholder='Email'
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className='w-full rounded border border-[#e0e0e0] bg-white p-2'
                            required
                            type="email"
                        />
                    </div>
                    <div className='grid grid-cols-2 gap-10 mt-3'>
                        <div>
                            <input
                                placeholder='Phone (10 digits)'
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                className='w-full rounded border border-[#e0e0e0] bg-white p-2'
                                required
                                maxLength={10}
                            />
                            {!phone  && 
                                <p className="text-red-500 text-sm mt-1">Enter a valid 10-digit Indian mobile number</p>
                            }
                        </div>
                        <div>
                            <input
                                placeholder='PIN Code (6 digits)'
                                value={zip}
                                onChange={e => setZip(e.target.value)}
                                className='w-full rounded border border-[#e0e0e0] bg-white p-2'
                                required
                                maxLength={6}
                            />
                            {!zip  && 
                                <p className="text-red-500 text-sm mt-1">Enter a valid 6-digit PIN code</p>
                            }
                        </div>
                    </div>
                    <div className='mt-3'>
                        <input
                            placeholder='Address'
                            value={address}
                            onChange={e => setAddress(e.target.value)}
                            className='w-full rounded border border-[#e0e0e0] bg-white p-2'
                            required
                        />
                    </div>
                    {(!(name && email && address && zip && phone) || loading) && 
                        <p className='text-red-600 mt-2'>Please fill all required fields</p>
                    }
                </div>

                <div className='mx-10 border'>
                    <h3 className='bg-gray-200 p-3 font-bold text-lg text-center'>
                        Total Cart - {cart.length} items
                    </h3>
                    <div className='p-4 flex flex-col gap-4'>
                        <h3 className='font-semibold flex justify-between'>
                            SubTotal: <span>&#8377;{cart.total_price}</span>
                        </h3>
                        <hr />
                        <h3 className='flex justify-between'>
                            Delivery: <span>&#8377;{deliveryCharge}</span>
                        </h3>
                        <h3 className='flex justify-between'>
                            Tax (7%): <span>&#8377;{(cart.total_price * 0.07).toFixed(2)}</span>
                        </h3>
                        <hr />
                        <h3 className='font-semibold flex justify-between'>
                            Total: <span>&#8377;{total.toFixed(2)}</span>
                        </h3>

                        <button
                            onClick={handleCashOnDelivery}
                            className='bg-red-500 p-1 text-lg w-full text-white font-semibold'
                            disabled={!(name && email && address && zip && phone ) || loading}
                        >
                            {loading ? 'Processing...' : 'Cash On Delivery'}
                        </button>

                        {total > 15 && (
                            <div className="mt-2">
                                <p className="text-center text-sm mb-2">Or pay online with PayPal</p>
                                <PayPalButtons
                                    disabled={!(name && email && address && zip && phone ) || loading}
                                    style={{ layout: "horizontal" }}
                                    onApprove={handleApprove}
                                    createOrder={async () => {
                                        const orderId = await createOrder();
                                        if (!orderId) {
                                            console.error("Order ID is missing. Cannot proceed.");
                                            throw new Error("Order ID is missing");
                                        }
                                        return orderId;  // Must be the PayPal Order ID
                                    }}
                                />
                                <p className="text-xs text-gray-500 mt-1 text-center">
                                    *International transaction fees may apply
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}

export default Page;