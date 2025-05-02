

import React, { useContext, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import BuisnessItem from './BuisnessItem'
import  Skeleton from '../_utils/Skeleton';
import { CartUpdateContext } from "../_context/CartUpdateContext";

const BuisnessList = ({products,setProducts,loading}) => {

    const { selectedCategory, setSelectedCategory } = useContext(CartUpdateContext);
  



  return (
    <div className='mt-5'>
      <h1 className='font-bold text-2xl'>Top {selectedCategory} Products</h1>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-3'>
        {!loading?products.map((r,i)=>(
          <BuisnessItem key={i} product={r}/>
        )):
          [1,2,3,4,5,6,7,8].map((item,index)=>(
            <Skeleton key={index}/>
          ))
          }
      </div>
    </div>
  );
};

export default BuisnessList;

