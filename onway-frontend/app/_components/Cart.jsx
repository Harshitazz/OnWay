import { MinusIcon, PlusIcon, X } from 'lucide-react';
import React, { useContext } from 'react';
import { useUser } from '@clerk/nextjs';
import axios from 'axios';
import Link from 'next/link';
import { CartUpdateContext } from '../_context/CartUpdateContext';
import { addToCart, removeItemFromCart } from '../_utils/Api';

function Cart({ cart }) {
  const { user } = useUser();
  const { updateCart, setUpdateCart } = useContext(CartUpdateContext);

  const handleRemoveItem = async (uniqId) => {
    if (!user || !user.id) return;
  
    const success = await removeItemFromCart(user.id, uniqId);
    if (success) {
      setUpdateCart((prev) => !prev); // Toggle to trigger re-fetch
    }
  };
   const handleAddToCart = async (item) => {
        if (!user || !user.id) return;

        const success = await addToCart(user.id, item);
        if (success) {
            setUpdateCart((prev) => !prev); // Trigger re-fetch
        }
    };
  const truncateText = (text, wordLimit = 20) => {
    const words = text.split(" ");
    return words.length > wordLimit ? words.slice(0, wordLimit).join(" ") + "..." : text;
  };

  return (
    <div className="p-4 ">
      <h2 className="font-semibold mb-3">My Order</h2>
      
      {/* Scrollable container for cart items */}
      <div className="overflow-y-auto max-h-[300px] border border-gray-300 rounded-md">
        <table className="w-full border-collapse">
          <thead className="bg-gray-200 z-50   ">
            <tr>
              <th className="border border-gray-300 p-2 text-left w-2/5">Product</th>
              <th className="border border-gray-300 p-2 w-1/5">Quantity</th>
              <th className="border border-gray-300 p-2 w-1/5">Price</th>
            </tr>
          </thead>
          <tbody>
            {cart &&
              cart.items.map((item, index) => (
                <tr key={index} className="border border-gray-300">
                  <td className="border border-gray-300 p-2 max-w-[250px] truncate">
                    <div className="relative group">
                      <span className="block whitespace-nowrap overflow-hidden text-ellipsis">
                        {truncateText(item?.product_name)}
                      </span>
                      {/* Tooltip for full product name */}
                      <span className="absolute left-0 bottom-[-30px] hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1">
                        {item?.product_name}
                      </span>
                    </div>
                  </td>
                  <td className="border p-2 flex items-center justify-center gap-4">
                    <button
                      className="p-1 bg-red-500 text-white rounded"
                      onClick={() => handleRemoveItem(item.uniq_id)}
                    >
                      <MinusIcon className="h-3 w-3" />
                    </button>
                    {item?.quantity}
                    <button className="p-1 bg-green-500 text-white rounded"
                    onClick={() => handleAddToCart(item)}
                    >
                      <PlusIcon className="h-3 w-3" />
                    </button>
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    &#8377;{item?.discounted_price * item?.quantity}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <Link href={`/checkout?business=${cart?.items[0]?.restaurant?.slug}`} className="w-full mt-4 block">
        <button className="bg-red-500 text-white p-2 text-lg w-full">Checkout &#8377;{cart.total_price}</button>
      </Link>
    </div>
  );
}

export default Cart;
