import { gql, request } from "graphql-request";
import bcrypt from "bcryptjs"; // Function to hash a password using bcrypt


async function hashPassword(password) {
  const saltRounds = 10; // Salt rounds for bcrypt hashing

  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    throw new Error("Error hashing password");
  }
}


// Your GraphQL request code here

const MASTER_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

/**
 * @returns
 */
export const GetCategory = async () => {
  const query = gql`
    query MyQuery {
      categories(first: 50) {
        id
        name
        slug
        icon {
          url
        }
      }
    }
  `;

  const result = await request(MASTER_URL, query);
  return result;
};


export const submitContactForm = async (formValue, email, file) => {
  const hashedPassword = await hashPassword(formValue.password);
  const slug = formValue.name.toLowerCase().replace(/\s+/g, '-');
  const query = gql`
    mutation MyMutation {
      createRestro(
        data: {
          name: "${formValue.name}"
          aboutUs: "${formValue.aboutUs}"
          password: "${hashedPassword}"
          restroType: top
          address: "${formValue.address}"
          workingHours: "${formValue.workingHours}"
          restroUser: { create: { email: "${email}" } }
          category: { connect: { slug: "all" } }
          image: "${file}"
          slug: "${slug}"
        }
      ) {
        id
        name
      }
      publishManyRestros(to: PUBLISHED) {
        count
      }
    }
  `;

  const result = await request(MASTER_URL, query);
  return result;
};


export const getRestaurantLogin = async (formValue) => {
  const query = gql`
    query GetRestaurantId($name: String!) {
      restros(where: { name: $name }) {
        id
        password
      }
    }
  `;
  const variables = {
    name: formValue.name,
  };
  const result = await request(MASTER_URL, query, variables);
  return result;
};

export const getTopRestros = async (category) => {
  const query =
    gql`
    query GetTopRestros {
      restros(
        where: {
          AND: { category_some: { slug: "` +
    category +
    `" } },
          restroType_contains_some:top
        }
      ) {
        id
        name
       slug
        aboutUs
        address
        restroType
        workingHours
        image
        banner {
          url
        }
      }
    }
  `;

  const result = await request(MASTER_URL, query);
  return result.restros;
};

export const GetBuiesnessDetails = async (buisnessSlug) => {
  const query =
    gql`
    query MyQuery {
      restro(where: { slug: "` +
    buisnessSlug +
    `" }) {
        name
        slug
        aboutUs
        address
        restroType
        banner {
          url
        }
        image
        category {
          name
        }
        menu {
          ... on Menu {
            id
            category
            menuItem {
              ... on MenuItem {
                id
                name
                description
                price
                productImage {
                  url
                }
              }
            }
          }
        }
      }
    }
  `;

  const result = await request(MASTER_URL, query);
  return result;
};

export const AddToCart = async (data) => {
  const query =
    gql`
  mutation MyMutation {
  createUserCart(
    data: {email: "` +
    data?.email +
    `", price: ` +
    data?.price +
    `, 
    productDescription: "` +
    data?.description +
    `",
     productImage: "` +
    data?.productImage +
    `", 
     restaurant:{connect:{slug:"` +
    data.slug +
    `"}} ,
     productName: "` +
    data?.name +
    `"}
  ) {
    id
  }
  publishManyUserCarts(to: PUBLISHED) {
    count
  }
}
  `;

  const result = await request(MASTER_URL, query);
  return result;
};

export const GetUserCart = async (email, restro) => {
  const query =
    gql`
  query MyQuery {
  userCarts(where: {email: "` +
    email +
    `" , restaurant: {slug: "` +
    restro +
    `"}}) {
    id
    email
    price
    productDescription
    productName
    productImage
    restaurant {
      name
      slug
    }
  }
}
  `;

  const result = await request(MASTER_URL, query);
  return result;
};

export const DisconnectRestroFromUserCart = async (id) => {
  const query =
    gql`
    mutation MyMutation {
      updateUserCart(
        data: { restaurant: { disconnect: true } }
        where: { id: "` +
    id +
    `" }
      ){
        id
        }
      publishManyUserCarts(to: PUBLISHED) {
        count
      }
      deleteUserCart(where: {id: "` +
    id +
    `"}){
      id
      }
    }
  `;

  const result = await request(MASTER_URL, query);
  return result;
};

export const AddNewReview = async (data) => {
  const query =
    gql`
    mutation MyMutation {
      createReview(
        data: {
          email: "` +
    data.email +
    `"
          profileImage: "` +
    data.profileImage +
    `"
          reviewText: "` +
    data.reviewText +
    `"
          userName: "` +
    data.userName +
    `"
          restraurant: { connect: { slug: "` +
    data.RestroSlug +
    `" } }
        }
      ) {
        id
      }
      publishManyReviews(to: PUBLISHED) {
    count
  }
    }
  `;

  const result = await request(MASTER_URL, query);
  return result;
};

export const getRestroReview = async (slug) => {
  const query =
    gql`
    query MyQuery {
      reviews(where: { restraurant: { slug: "` +
    slug +
    `" } }, orderBy: createdAt_DESC ) {
        reviewText
        profileImage
        email
        userName
        createdAt
        id
      }
    }
  `;

  const result = await request(MASTER_URL, query);
  return result;
};

export const createNewOrder = async (data) => {
  const query =
    gql`
    mutation MyMutation {
      createOrder(
        data: {
          address: "` +
    data.address +
    `"
          email: "` +
    data.email +
    `"
          orderAmount: ` +
    data.orderAmount +
    `
          phoneNo: "` +
    data.phone +
    `"
          restaurantSlug: "` +
    data.restroName +
    `"
          userName: "` +
    data.userName +
    `"
          zip: "` +
    data.zipCode +
    `"
    
        }
      ) {
        id
      }
    }
  `;

  const result = await request(MASTER_URL, query);
  return result;
};

export const updateOrderItems = async (name, counts, price, id, email) => {
  const query =
    gql`
    mutation MyMutation {
      updateOrder(
    data: {orderDetails: {create: {OrderItem: {data:{countItems: ${counts}, name: "` +
    name +
    `", price: ` +
    price +
    `}}}}}
    where: {id: "` +
    id +
    `"}
  ) {
    id
  }

      publishManyOrders(to: PUBLISHED) {
    count
  }
    deleteManyUserCarts(where: {email:"` +
    email +
    `"}){
    count
    }
    }
  `;
  console.log("GraphQL Query:", query);

  const result = await request(MASTER_URL, query);
  return result;
};

export const getOrders = async (email) => {
  const query =
    gql`
    query MyQuery {
  orders(where: {email: "` +
    email +
    `"}, orderBy: createdAt_DESC) {
    address
    createdAt
    email
    id
    orderAmount
    phoneNo
    userName
    zip
    
    orderDetails {
      ... on OrderItem {
        id
        name
        price
        countItems
      }
    }
    restaurantSlug
  }
}
  `;

  const result = await request(MASTER_URL, query);
  return result;
};
