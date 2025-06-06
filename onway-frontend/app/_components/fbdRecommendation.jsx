import React, { useContext, useState } from "react";
import Intro from "./Intro";

const truncateText = (text, maxLength = 30) =>
  text?.length > maxLength ? text?.substring(0, maxLength) + "..." : text;

const FrequentlyBoughtTogether = ({ recommendations, loading }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clickedId, setClickedId] = useState(null);

  const openModal = (uniqId) => {
    setClickedId(uniqId);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="p-2">
      <div className="bg-white rounded-lg">
        <h1 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 mr-2 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          {recommendations?.length > 0 ? (
            <div>
              Frequently Bought Together Items Based on Your Cart
            </div>
          ) : (
            <div>
              Add items in your cart to get Ai powered Recommendations!
            </div>
          )}
        </h1>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 p-4">
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center bg-gray-200 rounded-lg p-2 shadow-md animate-pulse h-48"
              ></div>
            ))}
          </div>
        ) : recommendations?.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4 p-4">
            {recommendations.slice(0, 2).map((item, index) => (
              <div key={index} className="flex items-center bg-gray-100 rounded-lg p-2 shadow-md">
                <div className="flex-1 text-center">
                  <div className="overflow-hidden bg-white rounded-lg hover:scale-105 transition-all duration-200 ease-in-out">
                    <img
                      className="aspect-square w-full object-contain h-[200px]"
                      src={item.cart_product?.image?.find(Boolean) || '/default-image.jpg'}
                    // alt={product?.product_name || 'Product image'}
                    />
                  </div>
                  <p className="text-xs font-medium">{truncateText(item.cart_product.product_name)}</p>
                  <p className="text-xs text-gray-600 font-semibold">₹{item.cart_product.discounted_price}</p>
                </div>

                <div className="text-xl font-bold text-gray-500 mx-2">+</div>

                <div
                  className="flex-1 text-center cursor-pointer"
                  onClick={() => openModal(item.recommended_product.uniq_id)}
                >
                  <div className="overflow-hidden bg-white rounded-lg hover:scale-105 transition-all duration-200 ease-in-out">
                    <img
                      className="aspect-square w-full object-contain h-[200px]"
                      src={item.recommended_product?.image?.find(Boolean) || '/default-image.jpg'}
                    // alt={product?.product_name || 'Product image'}
                    />
                  </div>
                  <p className="text-xs font-medium">{truncateText(item.recommended_product?.product_name)}</p>
                  <p className="text-xs text-gray-600 font-semibold mb-1">₹{item.recommended_product?.discounted_price}</p>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {isModalOpen && (
        <Intro closeModal={closeModal} Id={clickedId} />
      )}
    </div>
  );
};

export default FrequentlyBoughtTogether;