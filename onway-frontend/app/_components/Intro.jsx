'use client';

import React, { useContext, useEffect, useState } from 'react';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { CartUpdateContext } from '@/app/_context/CartUpdateContext';
import { useUser } from '@clerk/nextjs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquarePlus, faShoppingCart, faTimes, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

import { addToCart, fetchProductDetails } from '@/app/_utils/Api';
import { toast } from 'sonner';
import CustomLoading from '../loading';

// Custom arrow components for the slider
const PrevArrow = (props) => {
    const { className, onClick } = props;
    return (
        <div
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 cursor-pointer bg-white/80 hover:bg-white p-2 rounded-full shadow-md flex items-center justify-center w-10 h-10"
            onClick={onClick}
        >
            <FontAwesomeIcon icon={faChevronLeft} className="text-gray-800" />
        </div>
    );
};

const NextArrow = (props) => {
    const { className, onClick } = props;
    return (
        <div
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 cursor-pointer bg-white/80 hover:bg-white p-2 rounded-full shadow-md flex items-center justify-center w-10 h-10"
            onClick={onClick}
        >
            <FontAwesomeIcon icon={faChevronRight} className="text-gray-800" />
        </div>
    );
};

function Intro({ Id, closeModal }) {
    const { user } = useUser();
    const { setUpdateCart } = useContext(CartUpdateContext);
    const [product, setProduct] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        setLoading(true);
        fetchProductDetails(Id).then((data) => {
            if (data) setProduct(data);
        }).finally(() => setLoading(false));
    }, [Id]);

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

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 4000,
        pauseOnHover: true,
        prevArrow: <PrevArrow />,
        nextArrow: <NextArrow />,
        beforeChange: (current, next) => setCurrentSlide(next),
        customPaging: (i) => (
            <div
                className={`w-3 h-3 mx-1 rounded-full transition-all duration-300 ${i === currentSlide ? 'bg-indigo-600 w-6' : 'bg-gray-300'}`}
            ></div>
        ),
        dotsClass: "slick-dots custom-dots flex justify-center items-center mt-4 gap-2",
    };

    // Custom CSS styles for Slick slider
    const customSliderStyles = `
    .slick-track {
      display: flex !important;
      align-items: center;
    }
    .slick-slide {
      padding: 1rem;
      transition: all 0.3s ease;
      opacity: 0.7;
    }
    .slick-slide.slick-active {
      opacity: 1;
    }
    .slick-dots {
      bottom: -30px;
    }
    .custom-dots {
      padding: 10px 0;
    }
  `;

    if (loading) {
        return <CustomLoading />;
    }

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300">
            <style>{customSliderStyles}</style>
            <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] min-h-[70vh]  shadow-2xl animate-fadeIn">

                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-800">{product.product_name}</h2>
                    <button
                        onClick={closeModal}
                        className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-all"
                        aria-label="Close modal"
                    >
                        <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
                    </button>
                </div>

                <div className="px-6 ">
                    {product.brand && product.brand !== "N/A" && (
                        <h3 className="text-lg text-gray-700 font-medium">{product.brand}</h3>
                    )}

                    <div className="flex flex-col md:flex-row gap-8 mt-6 items-start">
                        <div className="md:w-1/2 w-full">
                            <div className="bg-gray-50 rounded-xl p-4 shadow-inner">
                                <Slider {...settings}>
                                    {product?.image?.map((img, index) => (
                                        <div key={index} className="focus-within:outline-none">
                                            <div className="bg-white p-4 rounded-lg shadow-sm">
                                                <img
                                                    src={img}
                                                    alt={`${product.product_name} - Image ${index + 1}`}
                                                    className="object-contain w-full h-[350px] rounded-md mx-auto"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </Slider>
                            </div>
                        </div>

                        <div className="md:w-1/2 w-full space-y-6">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <div className="space-y-1">
                                        <p className="text-sm text-gray-500">Price</p>
                                        <div>
                                            <span className="line-through text-gray-500 text-lg">₹{product.retail_price}</span>
                                            <span className="text-indigo-600 font-bold ml-3 text-2xl">₹{product.discounted_price}</span>
                                            {product.retail_price && product.discounted_price && (
                                                <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                                                    {Math.round(((product.retail_price - product.discounted_price) / product.retail_price) * 100)}% OFF
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleAddToCart(product)}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
                                    >
                                        <FontAwesomeIcon icon={faShoppingCart} className="text-white" />
                                        Add to Cart
                                    </button>
                                </div>
                            </div>

                            <div className="mt-4">
                                {product.description ? (
                                    <div
                                        dangerouslySetInnerHTML={{ __html: product.description }}
                                        className="text-gray-700 prose max-w-none overflow-auto max-h-[300px] pr-2 scrollbar-thin"
                                    />
                                ) : (
                                    <p className="text-gray-500 italic">No description available for this product.</p>
                                )}
                            </div>


                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Intro;