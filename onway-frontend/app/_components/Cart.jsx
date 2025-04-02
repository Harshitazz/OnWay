import { MinusIcon, PlusIcon } from "lucide-react";
import React, { useContext } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { CartUpdateContext } from "../_context/CartUpdateContext";
import { addToCart, removeItemFromCart } from "../_utils/Api";

function Cart({ cart }) {
  const { user } = useUser();
  const { setUpdateCart } = useContext(CartUpdateContext);

  const handleRemoveItem = async (uniqId) => {
    if (!user || !user.id) return;
    const success = await removeItemFromCart(user.id, uniqId);
    if (success) {
      setUpdateCart((prev) => !prev);
    }
  };

  const handleAddToCart = async (item) => {
    if (!user || !user.id) return;
    const success = await addToCart(user.id, item);
    if (success) {
      setUpdateCart((prev) => !prev);
    }
  };

  const formatProductName = (name) => {
    if (!name) return "";
    const words = name.split(" ");
    let formattedText = "";
    for (let i = 0; i < words.length; i++) {
      formattedText += words[i] + " ";
      if ((i + 1) % 4 === 0) formattedText += "\n"; // Add a line break every 3 words
    }
    return formattedText.trim();
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="font-semibold mb-3 text-lg md:text-xl">My Order</h2>

      {/* Scrollable cart container */}
      <div className="overflow-y-auto max-h-[300px] border border-gray-300 rounded-md p-2">
        {/* Desktop Table Layout */}
        <div className="hidden md:block">
          <table className="w-full border-collapse">
            <thead className="bg-gray-200 sticky top-0">
              <tr>
                <th className="border border-gray-300 p-2 text-left">Product</th>
                <th className="border border-gray-300 p-2">Quantity</th>
                <th className="border border-gray-300 p-2">Price</th>
              </tr>
            </thead>
            <tbody>
              {cart?.items.map((item, index) => (
                <tr key={index} className="border border-gray-300">
                  <td className="border border-gray-300 p-2 whitespace-pre-line">
                    {item?.product_name}
                  </td>
                  <td className="border p-2 flex items-center justify-center gap-2">
                    <button
                      className="p-1 bg-red-500 text-white rounded"
                      onClick={() => handleRemoveItem(item.uniq_id)}
                    >
                      <MinusIcon className="h-4 w-4" />
                    </button>
                    {item?.quantity}
                    <button
                      className="p-1 bg-green-500 text-white rounded"
                      onClick={() => handleAddToCart(item)}
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    ₹{item?.discounted_price * item?.quantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card Layout */}
        <div className="md:hidden space-y-3">
          {cart?.items.map((item, index) => (
            <div key={index} className="border rounded-lg shadow-sm ">
              <div className="flex justify-between items-center">
                <p className="font-semibold text-sm whitespace-pre-line">
                  {formatProductName(item?.product_name)}
                </p>
                <p className="text-gray-600 font-medium">₹{item?.discounted_price * item?.quantity}</p>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                <button
                      className="p-1 bg-red-500 text-white rounded"
                      onClick={() => handleRemoveItem(item.uniq_id)}
                    >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                  <span className="text-sm">{item?.quantity}</span>
                  <button
                      className="p-1 bg-green-500 text-white rounded"
                      onClick={() => handleAddToCart(item)}
                    >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Checkout Button */}
      <Link href={`/checkout?business=${cart?.items[0]?.restaurant?.slug}`} className="block w-full mt-4">
        <button className="bg-red-500 text-white p-3 text-lg w-full rounded-lg shadow-md">
          Checkout ₹{cart.total_price}
        </button>
      </Link>
    </div>
  );
}

export default Cart;
