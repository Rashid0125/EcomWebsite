"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ShoppingCart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useCart } from "@/context/cart-context"
import { getProducts } from "@/lib/api"

interface Product {
  id: number
  name: string
  description: string
  price: number
  category: string
  image_url: string
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { addToCart } = useCart()

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts()
        // Get 3 featured products
        setProducts(data.slice(0, 3))
      } catch (error) {
        console.error("Failed to load products:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  const handleAddToCart = async (product: Product) => {
    await addToCart(product.id, 1)
  }

  if (loading) {
    return (
      <>
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="h-48 bg-gray-200 animate-pulse" />
            <CardContent className="p-4">
              <div className="h-6 bg-gray-200 animate-pulse mb-2" />
              <div className="h-4 bg-gray-200 animate-pulse w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 animate-pulse w-1/2" />
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <div className="h-10 bg-gray-200 animate-pulse w-full" />
            </CardFooter>
          </Card>
        ))}
      </>
    )
  }

  return (
    <>
      {products.map((product) => (
        <Card key={product.id} className="overflow-hidden">
          <Link href={`/products/${product.category}/${product.id}`}>
            <img
              src={product.image_url || "/placeholder.svg?height=300&width=300"}
              alt={product.name}
              width={300}
              height={300}
              className="object-cover w-full h-48 transition-all hover:scale-105"
            />
          </Link>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold">{product.name}</h3>
            <p className="text-sm text-zinc-500 line-clamp-2 mt-1">{product.description}</p>
            <p className="font-bold text-amber-800 mt-2">${product.price.toFixed(2)}</p>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <Button onClick={() => handleAddToCart(product)} className="w-full bg-amber-800 hover:bg-amber-900">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
          </CardFooter>
        </Card>
      ))}
    </>
  )
}

