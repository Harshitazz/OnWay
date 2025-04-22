import React, { useContext, useEffect, useState, } from 'react'
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { CartUpdateContext } from '@/app/_context/CartUpdateContext';
import { useUser } from '@clerk/nextjs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquarePlus } from '@fortawesome/free-solid-svg-icons';

import { addToCart, fetchProductDetails } from '@/app/_utils/Api';
import { toast } from 'sonner';

function Intro({ Id, closeModal }) {
    const { user } = useUser();
    const { setUpdateCart } = useContext(CartUpdateContext);
    const [product, setProduct] = useState([]);
    const [loading, setLoading] = useState(false);



    useEffect(() => {
        setLoading(true)
        fetchProductDetails(Id).then((data) => {
            if (data) setProduct(data);
        }).finally(() => setLoading(false));


    }, [Id]);



    const handleAddToCart = async (item) => {
        if (!user || !user.id) {
            toast('Sign up your Account!',{
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
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        arrows: true,
    };

    if (loading || !product || Object.keys(product).length === 0) {
        return (
            <div className="flex items-center justify-center h-[500px]">
                <div className="h-[90%]  bg-gray-300/50 rounded-xl animate-pulse"></div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] min-h-[70vh] overflow-y-auto">
                <div className="flex justify-between bg-gray-200 items-center px-4 pt-2">
                <h2 className="text-xl font-bold">{product.product_name}</h2>
                    <button
                        onClick={closeModal}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                {/* Modal Header with Close Button */}
                <div className=" mx-auto px-4  rounded-lg m-auto">
                    {/* Title */}
                    

                    <h3 className="text-lg text-gray-700 font-semibold">{product.brand}</h3>

                    {/* Swiper Carousel */}
                    <div className="flex flex-col md:flex-row gap-6 mt-6 items-start justify-center">
                        <div className="md:w-1/2 w-full">

                            <Slider {...settings}
                            >
                                {product?.image?.map((img, index) => (
                                    <div key={index} >
                                        <img src={img} alt={`Slide ${index}`} className="object-contain w-full p-2 h-80 rounded-lg" />
                                    </div>
                                ))}
                            </Slider>
                        </div>

                        <div className="md:w-1/2 w-full">

                            {/* Pricing */}
                            <div className="flex justify-between items-center">
                                <p className="text-lg text-gray-700">
                                    <span className="line-through text-gray-500">&#8377;{product.retail_price}</span>
                                    <span className="text-red-600 font-bold ml-2">&#8377;{product.discounted_price}</span>
                                </p>
                                <div onClick={() => handleAddToCart(product)} className="p-2 m-2 cursor-pointer hover:bg-gray-100 rounded-lg">
                                    Add to Cart
                                    <FontAwesomeIcon icon={faSquarePlus} size="lg" className="text-indigo-600 hover:text-indigo-800" />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mt-4 text-gray-800">
                                {/* <h3 className="font-semibold text-lg">Product Description:</h3> */}
                                <div dangerouslySetInnerHTML={{ __html: product.description }} className="text-gray-700 text-sm" />
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>



    )
}

export default Intro
