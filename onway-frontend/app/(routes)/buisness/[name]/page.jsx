'use client'
import React, { useContext, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Intro from '../_components/Intro'

import { CartUpdateContext } from '@/app/_context/CartUpdateContext'
import { useUser } from "@clerk/clerk-react";

import CartIcon from '../../_components/CartIcon'
import { fetchCart, fetchProductDetails } from '@/app/_utils/Api'
import { motion } from 'framer-motion';
import Skeleton from '@/app/_utils/Skeleton'

function Page() {
    const { user ,isLoaded} = useUser();
    const [restro, setRetro] = useState([]);
    const [loading, setLoading] = useState(false);

    const param = usePathname();
    const { products, setProducts, updateCart ,cart, setCart} = useContext(CartUpdateContext);


    useEffect(() => {
        if (param) {
          const productId = param.split("/")[2];
          setLoading(true)
          fetchProductDetails(productId).then((data) => {
            if (data) setRetro(data);
          }).finally(() => setLoading(false));
          
        }
      }, [param]);

    

      useEffect(() => {
        if (user) {
          getCart();
        }
      }, [updateCart, user]);
    
      const getCart = async () => {
        if (!user) return;
        setLoading(true)
        const cartData = await fetchCart(user.id);

        if (cartData) {
          setCart(cartData);
        }
       setLoading(false)
      };




      if (loading || !restro) {
        return (
            <div className="flex items-center justify-center h-[500px]">
                <div className="h-[90%] w-[70%] bg-gray-300/50 rounded-xl animate-pulse"></div>
            </div>
        );
    }
    return (
       
        <div className='w-[90%] md:w-[70%] m-auto '>
            <Intro product={restro} cart={cart} />
            
            {/* Floating Cart Icon */}
            <CartIcon cart={cart}/>
                

            
        </div>
    );
}

export default Page;
