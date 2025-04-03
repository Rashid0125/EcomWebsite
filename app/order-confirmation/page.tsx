"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CheckCircle, ShoppingBag } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"

export default function OrderConfirmationPage() {
  const { user } = useAuth()
  const router = useRouter()

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
  }, [user, router])

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl text-center">
      <div className="mb-8">
        <CheckCircle className="h-20 w-20 text-green-500 mx-auto" />
      </div>

      <h1 className="text-3xl font-bold mb-4 text-amber-900">Order Confirmed!</h1>

      <p className="text-lg mb-8">
        Thank you for your purchase. Your order has been received and is being processed. You will receive a
        confirmation email shortly.
      </p>

      <div className="bg-[#f8f5f0] p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Order Details</h2>
        <p className="mb-2">
          Order Number: <span className="font-semibold">ORD-{Math.floor(Math.random() * 10000)}</span>
        </p>
        <p className="mb-2">
          Order Date: <span className="font-semibold">{new Date().toLocaleDateString()}</span>
        </p>
        <p>
          Estimated Delivery:{" "}
          <span className="font-semibold">{new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/orders">
          <Button variant="outline" className="w-full sm:w-auto">
            <ShoppingBag className="mr-2 h-4 w-4" />
            View My Orders
          </Button>
        </Link>
        <Link href="/">
          <Button className="w-full sm:w-auto bg-amber-800 hover:bg-amber-900">Continue Shopping</Button>
        </Link>
      </div>
    </div>
  )
}

