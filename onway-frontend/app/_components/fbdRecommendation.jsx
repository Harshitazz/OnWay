import { useUser } from "@clerk/nextjs";
import React, { useContext } from "react";
import { CartUpdateContext } from "../_context/CartUpdateContext";
import { addToCart } from "../_utils/Api";
import Link from "next/link";

const truncateText = (text, maxLength = 30) =>
  text.length > maxLength ? text.substring(0, maxLength) + "..." : text;

const FrequentlyBoughtTogether = ({ recommendations, loading }) => {
  const { user } = useUser();
  const { setUpdateCart } = useContext(CartUpdateContext);



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
          Frequently Bought Together Items Based on Your Cart
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
          <div className="grid md:grid-cols-2 gap-4 p-4 border-2">
            {recommendations.slice(0, 2).map((item, index) => (
              <div key={index} className="flex items-center bg-gray-100 rounded-lg p-2 shadow-md">
                <div className="flex-1 text-center">
                  <div className="h-[200px] mb-2 bg-white w-full overflow-hidden rounded-lg">
                    <img
                      className="h-full w-full object-contain"
                      src={item.cart_product.image[0]}
                      alt={item.cart_product.product_name}
                    />
                  </div>
                  <p className="text-xs font-medium">{truncateText(item.cart_product.product_name)}</p>
                  <p className="text-xs text-gray-600 font-semibold">₹{item.cart_product.discounted_price}</p>
                </div>

                <div className="text-xl font-bold text-gray-500 mx-2">+</div>

                <Link className="flex-1 text-center" href={'/buisness/' + item.recommended_product?.uniq_id}>
                  <div className="h-[200px] mb-2 w-full overflow-hidden rounded-lg bg-white">
                    <img
                      className="h-full w-full object-contain"
                      src={item.recommended_product.image[0]}
                      alt={item.recommended_product.product_name}
                    />
                  </div>
                  <p className="text-xs font-medium">{truncateText(item.recommended_product.product_name)}</p>
                  <p className="text-xs text-gray-600 font-semibold mb-1">₹{item.recommended_product.discounted_price}</p>
                </Link>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default FrequentlyBoughtTogether;
