"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Minus, Plus, ShoppingCart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useCart } from "@/context/cart-context"
import { getProduct } from "@/lib/api"

interface Product {
  id: number
  name: string
  description: string
  price: number
  category: string
  image_url: string
  dimensions?: string
  weight?: string
  material?: string
  capacity?: string
}

export default function ProductPage({ params }: { params: { category: string; id: string } }) {
  const { category, id } = params
  const productId = Number.parseInt(id)

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const { addToCart } = useCart()

  useEffect(() => {
    async function loadProduct() {
      try {
        const data = await getProduct(productId)
        setProduct(data)
      } catch (error) {
        console.error("Failed to load product:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [productId])

  const incrementQuantity = () => {
    setQuantity((prev) => prev + 1)
  }

  const decrementQuantity = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1))
  }

  const handleAddToCart = async () => {
    if (product) {
      await addToCart(product.id, quantity)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="border rounded-lg overflow-hidden">
              <div className="w-full h-[500px] bg-gray-200 animate-pulse" />
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <div className="h-10 bg-gray-200 animate-pulse w-3/4 mb-4" />
              <div className="h-8 bg-gray-200 animate-pulse w-1/4" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 animate-pulse w-full" />
              <div className="h-4 bg-gray-200 animate-pulse w-full" />
              <div className="h-4 bg-gray-200 animate-pulse w-3/4" />
            </div>
            <div className="border-t border-b py-4">
              <div className="h-6 bg-gray-200 animate-pulse w-1/3 mb-4" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 animate-pulse w-full" />
                <div className="h-4 bg-gray-200 animate-pulse w-full" />
                <div className="h-4 bg-gray-200 animate-pulse w-full" />
              </div>
            </div>
            <div className="h-10 bg-gray-200 animate-pulse w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="mb-6">Sorry, the product you're looking for doesn't exist.</p>
        <Link href="/products">
          <Button>Return to Products</Button>
        </Link>
      </div>
    )
  }

  // Create an array of images (in a real app, this would come from the API)
  const productImages = [product.image_url, product.image_url, product.image_url]

  return (
    <div className="container mx-auto px-4 py-12">
      <Link
        href={`/products/${category}`}
        className="inline-flex items-center text-amber-800 hover:text-amber-900 mb-8"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to {category === "wall-art" ? "Wall Art" : "Copper Bottles"}
      </Link>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="border rounded-lg overflow-hidden">
            <img
              src={product.image_url || "/placeholder.svg?height=600&width=600"}
              alt={product.name}
              className="w-full h-auto object-contain aspect-square"
            />
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-amber-900">{product.name}</h1>
            <p className="text-2xl font-bold mt-2">${product.price.toFixed(2)}</p>
          </div>

          <div className="prose max-w-none">
            <p>{product.description}</p>
          </div>

          <div className="border-t border-b py-4">
            <h3 className="font-semibold mb-2">Product Details</h3>
            <ul className="space-y-2">
              {category === "wall-art" ? (
                <>
                  {product.dimensions && (
                    <li className="flex justify-between">
                      <span className="text-zinc-500">Dimensions</span>
                      <span>{product.dimensions}</span>
                    </li>
                  )}
                  {product.weight && (
                    <li className="flex justify-between">
                      <span className="text-zinc-500">Weight</span>
                      <span>{product.weight}</span>
                    </li>
                  )}
                </>
              ) : (
                <>
                  {product.capacity && (
                    <li className="flex justify-between">
                      <span className="text-zinc-500">Capacity</span>
                      <span>{product.capacity}</span>
                    </li>
                  )}
                  {product.weight && (
                    <li className="flex justify-between">
                      <span className="text-zinc-500">Weight</span>
                      <span>{product.weight}</span>
                    </li>
                  )}
                </>
              )}
              {product.material && (
                <li className="flex justify-between">
                  <span className="text-zinc-500">Material</span>
                  <span>{product.material}</span>
                </li>
              )}
            </ul>
          </div>

          <div className="space-y-4">
            <div className="flex items-center">
              <Button
                variant="outline"
                size="icon"
                onClick={decrementQuantity}
                disabled={quantity <= 1}
                className="h-10 w-10"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="w-16 text-center">{quantity}</div>
              <Button variant="outline" size="icon" onClick={incrementQuantity} className="h-10 w-10">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <Button onClick={handleAddToCart} className="w-full bg-amber-800 hover:bg-amber-900">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

