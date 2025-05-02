'use client';

import React, { useContext, useState } from 'react';
import Intro from './Intro';
import { CartUpdateContext } from '../_context/CartUpdateContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faSquarePlus } from '@fortawesome/free-solid-svg-icons';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import { addToCart } from '../_utils/Api';
import { Eye, PlusIcon } from 'lucide-react';

function BusinessItem({ product }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { setUpdateCart } = useContext(CartUpdateContext);
  const { user } = useUser();

  const handleAddToCart = async (item) => {
    if (!user || !user.id) {
      toast('Sign up your Account!', {
        style: {
          backgroundColor: "#ffffff",
          color: "#000000",
          border: "1px solid #e5e7eb",
        },
      });
      return;
    }


    const success = await addToCart(user.id, item);
    if (success) {
      setUpdateCart((prev) => !prev);
      toast("Added item Successfully", {
        style: {
          backgroundColor: "#ffffff",
          color: "#000000",
          border: "1px solid #e5e7eb",
        },
      });
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <div className="w-full max-w-sm h-full border p-4 shadow-md flex flex-col">
        <div className="overflow-hidden rounded-lg group-hover:scale-105 transition-all duration-200 ease-in-out">
          <img
            className="aspect-square w-full object-contain h-[200px]"
            src={product?.image?.find(Boolean) || '/default-image.jpg'}
          // alt={product?.product_name || 'Product image'}
          />
        </div>

        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              <span aria-hidden="true" className="absolute inset-0" />
              {product?.product_name}
            </h3>
          </div>
          <div className="sm:text-right  ">
            <div className="text-sm text-red-500 line-through">₹{product?.retail_price}</div>
            <div className="text-lg font-semibold text-green-600">₹{product?.discounted_price}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 items-center mt-auto pt-4">
          <button
            onClick={() => handleAddToCart(product)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
          >
            <FontAwesomeIcon icon={faShoppingCart} className="text-white" />
            Add to Cart
          </button>
          <button
            onClick={openModal}
            className="flex border items-center justify-center gap-2 bg-gray-100 hover:bg-gray-300 rounded-md p-2 transition"
          >
            <Eye className="size-4" />
            View Details
          </button>
        </div>
      </div>



      {isModalOpen && (
        <Intro closeModal={closeModal} Id={product?.uniq_id} />
      )}
    </>
  );
}

export default BusinessItem;