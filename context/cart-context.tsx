"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "./auth-context"
import { API_URL } from "@/lib/config"

interface CartItem {
  id: number
  product_id: number
  quantity: number
  product: {
    id: number
    name: string
    price: number
    image_url: string
    category: string
  }
}

interface CartContextType {
  cartItems: CartItem[]
  loading: boolean
  addToCart: (productId: number, quantity: number) => Promise<void>
  updateCartItem: (itemId: number, quantity: number) => Promise<void>
  removeFromCart: (itemId: number) => Promise<void>
  clearCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  // Fetch cart when user changes
  useEffect(() => {
    if (user) {
      fetchCart()
    } else {
      // Load cart from local storage if not logged in
      const localCart = localStorage.getItem("cart")
      if (localCart) {
        setCartItems(JSON.parse(localCart))
      } else {
        setCartItems([])
      }
    }
  }, [user])

  // Save cart to local storage when it changes (for non-logged in users)
  useEffect(() => {
    if (!user && cartItems.length > 0) {
      localStorage.setItem("cart", JSON.stringify(cartItems))
    }
  }, [cartItems, user])

  const fetchCart = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      if (!token) return

      const response = await fetch(`${API_URL}/cart/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setCartItems(data.items || [])
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error)
      toast({
        title: "Error",
        description: "Failed to load your cart. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (productId: number, quantity: number) => {
    try {
      setLoading(true)

      if (user) {
        // If logged in, add to server cart
        const token = localStorage.getItem("token")

        const response = await fetch(`${API_URL}/cart/items/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            product_id: productId,
            quantity,
          }),
        })

        if (response.ok) {
          // Refresh cart after adding
          await fetchCart()
          toast({
            title: "Added to cart",
            description: `Item has been added to your cart.`,
          })
        } else {
          throw new Error("Failed to add item to cart")
        }
      } else {
        // If not logged in, add to local cart
        // First, fetch product details
        const productResponse = await fetch(`${API_URL}/products/${productId}`)
        if (!productResponse.ok) {
          throw new Error("Failed to fetch product details")
        }

        const product = await productResponse.json()

        // Check if item already in cart
        const existingItemIndex = cartItems.findIndex((item) => item.product_id === productId)

        if (existingItemIndex >= 0) {
          // Update quantity if item exists
          const updatedItems = [...cartItems]
          updatedItems[existingItemIndex].quantity += quantity
          setCartItems(updatedItems)
        } else {
          // Add new item
          const newItem: CartItem = {
            id: Date.now(), // Temporary ID for local cart
            product_id: productId,
            quantity,
            product: {
              id: product.id,
              name: product.name,
              price: product.price,
              image_url: product.image_url,
              category: product.category,
            },
          }
          setCartItems([...cartItems, newItem])
        }

        toast({
          title: "Added to cart",
          description: `${product.name} has been added to your cart.`,
        })
      }
    } catch (error) {
      console.error("Failed to add to cart:", error)
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateCartItem = async (itemId: number, quantity: number) => {
    try {
      setLoading(true)

      if (user) {
        // If logged in, update server cart
        const token = localStorage.getItem("token")

        const response = await fetch(`${API_URL}/cart/items/${itemId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            quantity,
          }),
        })

        if (response.ok) {
          // Refresh cart after updating
          await fetchCart()
        } else {
          throw new Error("Failed to update cart item")
        }
      } else {
        // If not logged in, update local cart
        if (quantity <= 0) {
          // Remove item if quantity is 0 or less
          setCartItems(cartItems.filter((item) => item.id !== itemId))
        } else {
          // Update quantity
          setCartItems(cartItems.map((item) => (item.id === itemId ? { ...item, quantity } : item)))
        }
      }
    } catch (error) {
      console.error("Failed to update cart item:", error)
      toast({
        title: "Error",
        description: "Failed to update cart. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const removeFromCart = async (itemId: number) => {
    try {
      setLoading(true)

      if (user) {
        // If logged in, remove from server cart
        const token = localStorage.getItem("token")

        const response = await fetch(`${API_URL}/cart/items/${itemId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          // Refresh cart after removing
          await fetchCart()
          toast({
            title: "Item removed",
            description: "Item has been removed from your cart.",
          })
        } else {
          throw new Error("Failed to remove cart item")
        }
      } else {
        // If not logged in, remove from local cart
        setCartItems(cartItems.filter((item) => item.id !== itemId))
        toast({
          title: "Item removed",
          description: "Item has been removed from your cart.",
        })
      }
    } catch (error) {
      console.error("Failed to remove cart item:", error)
      toast({
        title: "Error",
        description: "Failed to remove item from cart. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const clearCart = async () => {
    try {
      setLoading(true)

      if (user) {
        // If logged in, clear server cart by removing each item
        const token = localStorage.getItem("token")

        for (const item of cartItems) {
          await fetch(`${API_URL}/cart/items/${item.id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
        }

        // Refresh cart
        await fetchCart()
      } else {
        // If not logged in, clear local cart
        setCartItems([])
        localStorage.removeItem("cart")
      }

      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart.",
      })
    } catch (error) {
      console.error("Failed to clear cart:", error)
      toast({
        title: "Error",
        description: "Failed to clear cart. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

