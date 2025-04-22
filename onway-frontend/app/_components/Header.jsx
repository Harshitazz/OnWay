'use client'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Link from 'next/link'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { SignedIn, SignedOut, SignUpButton, useClerk, UserButton, useUser } from '@clerk/nextjs'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CartUpdateContext } from '../_context/CartUpdateContext'
import { fetchCart, fetchProductsByCategory } from '../_utils/Api'
import { motion, AnimatePresence } from "framer-motion";
import CartIcon from '../(routes)/_components/CartIcon'

function Header() {

    const { signOut } = useClerk();
    const { user } = useUser()
    const { selectedCategory, setSelectedCategory, products, setProducts, setLoading,cart,setCart,updateCart } = useContext(CartUpdateContext);
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [debouncedQuery, setDebouncedQuery] = useState("");


    const handleSignOut = async () => {
        await signOut();

    };

      useEffect(() => {
        if (user) {
          getCart();
        }
      }, [updateCart, user]);
    
      const getCart = async () => {
        if (!user || !user.id){
          toast('Sign up your Account!');
          return;
      }
        const cartData = await fetchCart(user.id);
        if (cartData) {
          setCart(cartData);
        }
      };

    useEffect(() => {
        const getCategoryProducts = async () => {
            const data = await fetchProductsByCategory(selectedCategory);
            setProducts(data);
        };

        getCategoryProducts();
    }, [selectedCategory]);

    useEffect(() => {
        if(searchQuery===selectedCategory){
            return;
        }
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 200);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!debouncedQuery.trim()|| searchQuery === selectedCategory) {
                setSuggestions([]);
                return;
            }

            try {
                const response = await fetch(`http://localhost:5000/suggest_categories?query=${debouncedQuery}`);
                const data = await response.json();
                let parsedSuggestions = [];
                try {
                    parsedSuggestions = JSON.parse(data.suggestions); // ✅ Convert string to actual array
                } catch (error) {
                    console.error("Error parsing suggestions:", error);
                }
                setSuggestions(parsedSuggestions);

            } catch (error) {
                console.error("Error fetching suggestions:", error);
            }
        };

        fetchSuggestions();
    }, [debouncedQuery]);


    const searchRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target )) {
                setSuggestions([]); 
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);


    return (
        <div className="flex justify-between items-center bg-reddish-50 px-1 sm:px-6 py-1 shadow-md">
            <div className='flex gap-4 '>
                <div className=' p-1 text-black items-center flex gap-2'>
                    <img className="sm:w-12 w-6" src="/logo.png" />
                    <span className='sm:text-3xl text-xl text-green-700 font-bold font-serif'>OnWay</span>
                </div>

            </div>

            <div className="relative max-w-[150px] sm:max-w-none sm:w-80" ref={searchRef}>
                <div className="flex items-center border p-2 rounded-lg bg-gray-200 w-full">
                    <input
                        type="text"
                        placeholder="Search"
                        className="bg-transparent outline-none w-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                setSuggestions([]);
                                setSelectedCategory(searchQuery);
                            }
                        }}
                    />
                    <button onClick={() => {
                        setSelectedCategory(searchQuery);
                        setSuggestions([]);
                    }}>                    
                    <FontAwesomeIcon icon={faMagnifyingGlass} className="w-4 cursor-pointer" />
                    </button>
                </div>

                {/* Animated Suggestions Dropdown */}
                <AnimatePresence>
                    {suggestions.length > 0 && (
                        <motion.ul
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute scrollbar-hide bg-white border w-full  rounded-lg shadow-lg mt-2 ml-0 z-50 max-h-60 overflow-y-auto"
                        >
                            {suggestions.map((suggestion, index) => (
                                <motion.li
                                    key={index}
                                    className="p-2 cursor-pointer hover:bg-gray-100 transition-all"
                                    onClick={() => {
                                        setSearchQuery(suggestion);
                                        setSelectedCategory(suggestion);
                                        setSuggestions([]); 
                                    }}
                                    whileHover={{ scale: 1.02 }}
                                >
                                    {suggestion}
                                </motion.li>
                            ))}
                        </motion.ul>
                    )}
                </AnimatePresence>
            </div>




            <ul className="flex items-center justify-center gap-2">


                <SignedOut className='gap-2 flex'>
                    
                    <li className=' rounded-lg  hover:scale-105 flex bg-gray-200 py-2 px-2'>


                        <SignUpButton mode='modal'  >

                            <button >sign up</button>

                        </SignUpButton>
                    </li>
                </SignedOut>
                <SignedIn>

                {user &&<CartIcon cart={cart} />}

                    <DropdownMenu className='bg-white z-100'>
                        <DropdownMenuTrigger><img src={user?.imageUrl} width={30} className='rounded-full' alt="user" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className='bg-white z-100'>
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <Link href={'/users'}><DropdownMenuItem className='cursor-pointer hover:bg-slate-100'>Profile</DropdownMenuItem></Link>
                            <Link href={'/users#/my-orders'}><DropdownMenuItem className='cursor-pointer hover:bg-slate-100'>My Orders</DropdownMenuItem></Link>
                            <DropdownMenuItem className='cursor-pointer hover:bg-slate-100'><button onClick={handleSignOut}>Logout</button></DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                </SignedIn>


            </ul>
        </div>
    )
}

export default Header
