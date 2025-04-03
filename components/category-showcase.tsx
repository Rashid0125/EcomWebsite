import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function CategoryShowcase() {
  return (
    <>
      <Card className="overflow-hidden">
        <img
          src="/placeholder.svg?height=400&width=600"
          alt="Metal Wall Art Collection"
          className="w-full h-64 object-cover"
        />
        <CardContent className="p-6">
          <h3 className="text-2xl font-bold text-amber-900">Metal Wall Art</h3>
          <p className="mt-2 text-zinc-700">
            Discover our collection of handcrafted metal wall art pieces, from intricate mandalas to nature-inspired
            designs.
          </p>
          <Link href="/products/wall-art">
            <Button className="mt-4 bg-amber-800 hover:bg-amber-900">View Collection</Button>
          </Link>
        </CardContent>
      </Card>
      <Card className="overflow-hidden">
        <img
          src="/placeholder.svg?height=400&width=600"
          alt="Copper Bottles Collection"
          className="w-full h-64 object-cover"
        />
        <CardContent className="p-6">
          <h3 className="text-2xl font-bold text-amber-900">Copper Bottles</h3>
          <p className="mt-2 text-zinc-700">
            Explore our range of premium copper bottles, known for their health benefits and beautiful craftsmanship.
          </p>
          <Link href="/products/copper-bottles">
            <Button className="mt-4 bg-amber-800 hover:bg-amber-900">View Collection</Button>
          </Link>
        </CardContent>
      </Card>
    </>
  )
}

