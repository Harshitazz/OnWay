'use client';

import React, { useState } from 'react';
import Intro from './Intro';

function BusinessItem({ buisness }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  let type = buisness.restroType;

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      {/* Business Item Card */}
      <div
        className='cursor-pointer group border border-gray-200 p-2 shadow-md'
        onClick={openModal}
      >
        <div className="h-[200px] w-full overflow-hidden rounded-lg group-hover:scale-105 transition-all duration-200 ease-in-out">
          <img
            className="h-full w-full object-contain"
            src={buisness?.image[0] || buisness?.image[1] || buisness?.image[2]}
            alt={buisness.product_name}
          />
        </div>

        <div className='mt-2'>
          <h2 className='text-lg font-semibold group-hover:underline'>{buisness.product_name}</h2>
          <h2 className="text-gray-500">
            <del className="text-red-500">₹ {buisness.retail_price}</del> &nbsp;
            <span className="text-green-600 font-semibold">₹ {buisness.discounted_price}</span>
          </h2>
        </div>
      </div>

      {isModalOpen && (
        <Intro closeModal={closeModal} Id={buisness?.uniq_id}/>
      )}
    </>
  );
}

export default BusinessItem;