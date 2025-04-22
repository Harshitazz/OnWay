"use client";
import { useContext, useEffect, useState, useCallback } from "react";
import BuisnessList from "./_components/BuisnessList";
import CategoryList from "./_components/CategoryList";
import { CartUpdateContext } from "./_context/CartUpdateContext";
import CartIcon from "./(routes)/_components/CartIcon";
import { useUser } from "@clerk/nextjs";
import {
  fetchCart,
  fetchCartAndRecommendations,
  fetchProductsByCategory,
  fetchRandomProducts,
} from "./_utils/Api";
import FrequentlyBoughtTogether from "./_components/fbdRecommendation";
import CustomLoader from "./loading";

export default function Home() {
  const { user } = useUser();
  const {
    selectedCategory,
    setSelectedCategory,
    products,
    setProducts,
    cart,
    setCart,
    updateCart,
  } = useContext(CartUpdateContext);

  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1); 
  const [categoryPage, setCategoryPage] = useState(1);
  const [hasMore, setHasMore] = useState(true); 
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  const getProducts = async () => {
    if (!hasMore|| isLoadingMore) return;
    try {
      const data = await fetchRandomProducts(page);
      if (data.length === 0) {
        setHasMore(false);
      } else {
        setProducts((prev) => [...prev, ...data]);
        setPage((prev) => prev + 1);
      }
    } finally {
      // setLoading(false);
    }
  };

  useEffect(() => {
    const fetchInitial = async () => {
      setLoading(true);
      await getProducts();
      setLoading(false);   
    };
    fetchInitial();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      // Reset products and pagination when changing categories
      setProducts([]);
      setCategoryPage(1);
      setHasMore(true);

      // Initial fetch for the selected category
      const fetchInitialCategoryProducts = async () => {
        setLoading(true);
        try {
          const data = await fetchProductsByCategory(selectedCategory, 1);
          setProducts(data);
          setCategoryPage(2); // Set to 2 for the next fetch
          setHasMore(data.length > 0);
        } finally {
          setLoading(false);
        }
      };

      fetchInitialCategoryProducts();
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (user) {
      // getCart();
      fetchRecommendation();
    }
  }, [updateCart, user]);

  const fetchRecommendation = async () => {
    if (!user || !user.id) {
      toast("Sign up your Account!");
      return;
    }
    setLoadingRecommendations(true);
    const data = await fetchCartAndRecommendations(user.id);
    setRecommendedProducts(data.recommendations);
    setLoadingRecommendations(false);
  };

  const getCategoryProducts = async () => {
    if ( !hasMore || isLoadingMore) return;

    // setLoading(true);
    try {
      const data = await fetchProductsByCategory(
        selectedCategory,
        categoryPage
      );

      if (data.length === 0) {
        setHasMore(false);
      } else {
        //  Check if we're getting the same products again
        const newProductIds = new Set(data.map((p) => p.uniq_id));
        const existingProductIds = new Set(products.map((p) => p.uniq_id));

        // Filter out any products we already have
        const uniqueNewProducts = data.filter(
          (p) => !existingProductIds.has(p.uniq_id)
        );

        if (uniqueNewProducts.length === 0) {
          setHasMore(false);
        } else {
          setProducts((prev) => [...prev, ...uniqueNewProducts]);
          setCategoryPage((prev) => prev + 1);
        }
      }
    } catch (error) {
      console.error("Error fetching category products:", error);
    } 
  };

// Debounce function
const debounce = (func, wait) => {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const [isLoadingMore, setIsLoadingMore] = useState(false); // New state to track ongoing requests

// Debounced scroll handler
const handleScroll = useCallback(
  debounce(() => {
    if (
      !loading && 
      !isLoadingMore && 
      hasMore &&
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - 100
    ) {
      if (selectedCategory) {
        getCategoryProducts();
      } else {
        getProducts();
      }
    }
  }, 250), // 250ms debounce
  [selectedCategory, loading, hasMore, isLoadingMore, categoryPage, products]
);

useEffect(() => {
  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, [handleScroll]);

  if(loading  ){
    return <CustomLoader/>
  }

  return (
    <div className="w-[80%] m-auto">
      <CategoryList
        setProducts={setProducts}
        setSelectedCategory={setSelectedCategory}
        selectedCategory={selectedCategory}
      />
      {user && (
        <FrequentlyBoughtTogether
          recommendations={recommendedProducts}
          loading={loadingRecommendations}
        />
      )}

      <BuisnessList
        products={products}
        setProducts={setProducts}
        loading={loading}
      />
    </div>
  );
}
