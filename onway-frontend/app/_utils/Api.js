import axios from 'axios'

const API_BASE_URL = "http://localhost:5000"; // Change if needed

// Fetch products by catego

export const fetchProductsByCategory = async (category, page = 1) => {
  if (!category) return []; // Avoid unnecessary API calls

  try {
    const response = await axios.get(`${API_BASE_URL}/search`, {
      params: { query: category, page },
    });
    return response.data?.products || [];
  } catch (error) {
    console.error("Error fetching category products:", error);
    return [];
  }
};

export const fetchRandomProducts = async (page = 1) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/random-products`, {
      params: { page },
    });
    return response.data?.products || [];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};


  export const fetchCart = async (userId) => {
    if (!userId) return null;
  
    try {
      const response = await axios.get(`${API_BASE_URL}/cart/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching cart:", error);
      return null;
    }
  };

  export const removeItemFromCart = async (userId, uniqId) => {
    if (!userId) {
      console.error("User not logged in.");
      return;
    }
  
    try {
      await axios.post(`${API_BASE_URL}/cart/remove`, {
        user_id: userId,
        uniq_id: uniqId,
      });
      console.log("Item removed successfully.");
      return true;
    } catch (error) {
      console.error("Error removing item from cart:", error);
      return false;
    }
  };

  export const addToCart = async (userId, item) => {
    if (!userId) {
      console.error("User not logged in.");
      return false;
    }
  
    const data = {
      product_name: item.product_name,
      discounted_price: item.discounted_price,
      uniq_id: item.uniq_id,
      image: item.image,
      category:item.category,
      quantity: 1,
    };
  
    try {
      await axios.post(`${API_BASE_URL}/cart/add`, {
        user_id: userId,
        product: data,
      });
      console.log("Item added to cart.");
      return true;
    } catch (error) {
      console.error("Error adding item to cart:", error);
      return false;
    }
  };

  export const fetchProductDetails = async (productId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/product/${productId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching product:", error);
      return null;
    }
  };

  export const fetchSuggestions = async (query) => {
    if (!query.trim()) return [];
  
    try {
      const response = await axios.get(`${API_BASE_URL}/suggest_categories`, {
        params: { query },
      });
      return response.data.suggestions;
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      return []; // Return empty array on error
    }
  };

  export const fetchCartAndRecommendations = async (userId) => {
    if (!userId) return { cartItems: [], recommendedProducts: [] };
  
    try {
      const response = await axios.get(`${API_BASE_URL}/cart/recommendations/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      return { cartItems: [], recommendedProducts: [] };
    }
  };

  const getOrders = async (userIdentifier) => {
    try {
      const response = await axios.get(`/api/orders/get-orders/${userIdentifier}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching orders:", error);
      return { orders: [] };
    }
  };