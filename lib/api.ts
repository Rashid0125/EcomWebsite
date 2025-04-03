import { API_URL } from "./config"

// Helper function to handle API requests
export async function fetchAPI(endpoint: string, options = {}) {
  const url = `${API_URL}${endpoint}`
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  // Handle 401 Unauthorized errors
  if (response.status === 401 && typeof window !== "undefined") {
    // Clear token and redirect to login
    localStorage.removeItem("token")
    window.location.href = "/login"
    return null
  }

  return response
}

// Product API functions
export async function getProducts(category?: string) {
  const endpoint = category ? `/products/?category=${category}` : "/products/"

  const response = await fetchAPI(endpoint)

  if (!response || !response.ok) {
    throw new Error("Failed to fetch products")
  }

  return response.json()
}

export async function getProduct(id: number) {
  const response = await fetchAPI(`/products/${id}`)

  if (!response || !response.ok) {
    throw new Error("Failed to fetch product")
  }

  return response.json()
}

// Order API functions
export async function createOrder(orderData: any) {
  const response = await fetchAPI("/orders/", {
    method: "POST",
    body: JSON.stringify(orderData),
  })

  if (!response || !response.ok) {
    throw new Error("Failed to create order")
  }

  return response.json()
}

export async function getOrders() {
  const response = await fetchAPI("/orders/")

  if (!response || !response.ok) {
    throw new Error("Failed to fetch orders")
  }

  return response.json()
}

export async function getOrder(id: number) {
  const response = await fetchAPI(`/orders/${id}`)

  if (!response || !response.ok) {
    throw new Error("Failed to fetch order")
  }

  return response.json()
}

