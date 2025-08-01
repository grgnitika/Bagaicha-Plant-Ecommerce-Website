import axios from "axios";
import { QueryClient } from "@tanstack/react-query";

let url = import.meta.env.VITE_BACKEND;

let csrfToken = null;

// Fetch CSRF token and store it
export async function fetchCsrfToken() {
  const res = await axios.get(`${url}/csrf-token`, { withCredentials: true });
  csrfToken = res.data.csrfToken;
  return csrfToken;
}

// Return header with CSRF token (used only in POST/PUT/DELETE)
export function getCsrfHeader() {
  return csrfToken ? { "X-CSRF-Token": csrfToken } : {};
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

// Search
export function SearchProduct({ signal, search }) {
  const searchResult = axios
    .get(url + `/search?input=${search}`, { signal })
    .then((response) => {
      if (response.status === 200) {
        return response.data;
      }
    })
    .catch((error) => {
      if (error.response) {
        throw error.response;
      }
      throw error;
    });

  return searchResult;
}

// Shop Home
export function getShopHome() {
  const shop = axios
    .get(url + `/shop`)
    .then((response) => {
      if (response.status === 200) {
        return response.data;
      }
    })
    .catch((error) => {
      if (error.response) {
        throw error.response;
      }
      throw error;
    });

  return shop;
}

// GET Fetch signed in user to browse single order details
export function fetchSingleUserOrderDetail(id, signal) {
  const token = localStorage.getItem("token");
  const singleuserorderdetails = axios
    .get(url + "/user/orders/" + id, {
      signal: signal,
      headers: {
        Authorization: "Bearer " + token,
      },
    })
    .then((response) => {
      if (response.status === 200) {
        return response.data;
      }
    })
    .catch((error) => {
      if (error.response) {
        throw error.response;
      }
      throw error;
    });

  return singleuserorderdetails;
}

export function getSingleProductDetails({ productname, signal }) {
  const products = axios
    .get(url + `/products/${productname}`, { signal: signal })
    .then((response) => {
      if (response.status === 200) {
        return response.data;
      }
    })
    .catch((error) => {
      if (error.response) {
        throw error.response;
      }
      throw error;
    });

  return products;
}

// GET Category list
export function getCategoryList() {
  const categoriesList = axios
    .get(url + "/categories")
    .then((response) => {
      if (response.status === 200) {
        return response.data;
      }
    })
    .catch((error) => {
      if (error.response) {
        throw error.response;
      }
      throw error;
    });

  return categoriesList;
}

// GET collection info and attribute filter options
export function getCollectionInfowithAttributes({ categoryid, signal }) {
  const api_data = axios
    .get(url + `/collections/${categoryid}`, {
      signal: signal,
    })
    .then((response) => {
      if (response.status === 200) {
        return response.data;
      }
    })
    .catch((error) => {
      if (error.response) {
        throw error.response;
      }
      throw error;
    });
  return api_data;
}

// GET All details of collection as well as filter
export function getCollection({ collectionname, pageParam }) {
  const urlParams = new URLSearchParams(window.location.search);
  urlParams.set("cursor", pageParam);

  const full_url = `${url}/collections-product/${collectionname}?${urlParams.toString()}`;

  return axios
    .get(full_url)
    .then((response) => {
      if (response.status === 200) return response.data;
    })
    .catch((error) => {
      if (error.response) throw error.response;
      throw error;
    });
}

// POST COD Checkout with CSRF
export function codCheckout(amount, formdetails, cart_items) {
  const neworder = axios
    .post(
      url + "/checkout/cod",
      {
        amount,
        formdetails,
        cart_items,
      },
      {
        headers: {
          ...getCsrfHeader(),
        },
      }
    )
    .then((response) => {
      if (response.status === 200) {
        return response.data;
      }
    })
    .catch((error) => {
      if (error.response) {
        throw error.response;
      }
      throw error;
    });
  return neworder;
}
