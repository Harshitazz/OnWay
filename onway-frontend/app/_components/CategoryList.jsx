'use client'
import React, { useContext, useEffect, useRef, useState } from 'react'

function CategoryList({ setProducts, setSelectedCategory, selectedCategory }) {
  const listRef = useRef(null);
  const [categories, setCategories] = useState([
    { name: "Women Fashion", image: "/women.jpg" },
    { name: "Electronics", image: "/electronics.jpg" },
    { name: "Home Essentials", image: "/home.jpg" },

    { name: "Jewellery", image: "/jewelley.jpg" },
    { name: "Beauty", image: "/beauty.jpg" },
    { name: "Mens Clothes", image: "/mens.jpg" },

  ]);

  return (
    <div className='relative'>
<div
  ref={listRef}
  className='p-4 flex gap-7 my-6 overflow-x-auto no-scrollbar cursor-grab active:cursor-grabbing'
>
      {categories.map((category, i) => (
      <button
      key={i}
      onClick={() => setSelectedCategory(category.name)}
      className={ `group relative p-2 shadow-lg bg-slate-50 flex flex-col items-center border-2 border-gray-300 min-w-48 min-h-60
        hover:border-gray-600 hover:bg-green-50 cursor-pointer group overflow-hidden
        ${selectedCategory === category.name && "border-green-600 bg-green-100"}`}
    >
      <img
        src={category.image}
        alt={category.name}
        className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity duration-300"
      />
    
      <div className="relative z-10 mt-auto mb-4 transition-transform duration-300 transform group-hover:scale-110">
        <h2 className="text-xl font-semibold text-gray-900 group-hover:text-white transition-colors duration-300">
          {category.name}
        </h2>
      </div>
    </button>
    
    ))}
      </div>
    </div>
  );
}

export default CategoryList;
