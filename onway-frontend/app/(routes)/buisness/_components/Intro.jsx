import React, { useContext, } from 'react'
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { CartUpdateContext } from '@/app/_context/CartUpdateContext';
import { useUser } from '@clerk/nextjs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquarePlus } from '@fortawesome/free-solid-svg-icons';

import { addToCart } from '@/app/_utils/Api';
import { toast } from 'sonner';

function Intro({ product }) {
    const { user } = useUser();
    const { setUpdateCart } = useContext(CartUpdateContext);


    const handleAddToCart = async (item) => {
        if (!user || !user.id){
            toast('Log in!');
            return;
        }
             

        const success = await addToCart(user.id, item);
        if (success) {
            setUpdateCart((prev) => !prev); // Trigger re-fetch
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

    if (!product || Object.keys(product).length === 0) {
        return (
            <div className="flex items-center justify-center h-[500px]">
                <div className="h-[90%]  bg-gray-300/50 rounded-xl animate-pulse"></div>
            </div>
        );
    }

    return (
        <div className=" mx-auto p-6 bg-white shadow-lg rounded-lg mt-10 m-auto">
            {/* Title */}
            <h2 className="text-3xl font-bold text-gray-900">{product.product_name}</h2>
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


    )
}

export default Intro
