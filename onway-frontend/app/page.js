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

  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1); // Pagination for random products
  const [categoryPage, setCategoryPage] = useState(1); // Pagination for category-based products
  const [hasMore, setHasMore] = useState(true); // Track if more products are available
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  // Fetch random products with pagination
  const getProducts = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const data = await fetchRandomProducts(page);
      if (data.length === 0) {
        setHasMore(false);
      } else {
        setProducts((prev) => [...prev, ...data]);
        setPage((prev) => prev + 1);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProducts();
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

  // Fetch category-based products with pagination
  const getCategoryProducts = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  // Infinite Scroll Handler
  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - 100
    ) {
      if (selectedCategory) {
        getCategoryProducts();
      } else {
        getProducts();
      }
    }
  }, [
    selectedCategory,
    loading,
    hasMore,
    categoryPage,
    products,
    getProducts,
    getCategoryProducts,
  ]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  if(!user||loading  ){
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
      {/* {user &&<CartIcon cart={cart} />} */}
    </div>
  );
}
