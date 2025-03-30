import Link from 'next/link';
import React from 'react'

function BuisnessItem({ buisness }) {
  let type = buisness.restroType;
  return (
    <Link href={'/buisness/' + buisness?.uniq_id} className='cursor-pointer group border border-gray-200 p-2 shadow-md' >
      <div className="h-[200px] w-full overflow-hidden rounded-lg group-hover:scale-105 transition-all duration-200 ease-in-out">
        <img
          className="h-full w-full object-contain"
          src={ buisness?.image[0]|| buisness?.image[1]|| buisness?.image[2]}
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
    </Link>
  )
}

export default BuisnessItem
