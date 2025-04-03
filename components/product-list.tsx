"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ShoppingCart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useCart } from "@/context/cart-context"
import { getProducts } from "@/lib/api"
import ProductListSkeleton from "./product-list-skeleton"

interface Product {
  id: number
  name: string
  description: string
  price: number
  category: string
  image_url: string
}

export default function ProductList({ category }: { category: string }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { addToCart } = useCart()

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts(category)
        setProducts(data)
      } catch (error) {
        console.error("Failed to load products:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [category])

  const handleAddToCart = async (product: Product) => {
    await addToCart(product.id, 1)
  }

  if (loading) {
    return <ProductListSkeleton />
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <Card key={product.id} className="overflow-hidden">
          <Link href={`/products/${category}/${product.id}`}>
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
    </div>
  )
}

