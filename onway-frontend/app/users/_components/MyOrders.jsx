'use client'
import { useUser } from '@clerk/nextjs';
import moment from 'moment';
import React, { useEffect, useState } from 'react'
import axios from 'axios';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const getOrders = async (userIdentifier) => {
  try {
    const response = await axios.get(`http://localhost:5000/get-orders/${userIdentifier}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    return { orders: [] };
  }
};

function MyOrders() {
  const { user } = useUser();
  const [orderList, setOrderList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const userId = user?.id;
      
      const response = await getOrders(userId);
      
      setOrderList(response?.orders || []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h2 className='font-bold text-2xl mb-4'>My Orders</h2>
      
      {loading ? (
        <div className="text-center">Loading your orders...</div>
      ) : orderList.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className='w-full max-w-4xl'>
          {orderList.map((order, index) => (
            <div key={index} className='p-4 border rounded-xl my-3 shadow-sm'>
              <div className="flex justify-between items-center mb-2">
                <h3 className='font-medium'>{moment(order?.createdAt).format('DD-MM-YYYY')}</h3>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {order.status || "Delivered"}
                </span>
              </div>
              
              <div className='flex justify-between text-sm mb-1'>
                <span className="text-gray-600">Order Total:</span>
                <span className="font-medium">₹{order.total_amount}</span>
              </div>
              
             
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="order-details">
                  <AccordionTrigger className="text-blue-600 text-sm hover:no-underline py-1">
                    View Order Details
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pt-2">
                      {order?.items?.map((item, idx) => (
                        <div className='flex justify-between items-center py-1 border-b border-gray-100' key={idx}>
                          <h2 className="text-sm">{item.product_name}</h2>
                          <div className='flex items-center space-x-1'>
                            <span className="text-sm">{item.quantity}</span>
                            <span className="text-xs text-gray-500">x</span>
                            <span className="text-sm font-medium">₹{item.discounted_price}</span>
                          </div>
                        </div>
                      ))}
                      <div className="pt-2 mt-2 border-t border-gray-200">
                        <h2 className='text-base font-semibold'>
                          Total Order Amount (incl. taxes + delivery): ₹{order.total_amount}
                        </h2>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyOrders;