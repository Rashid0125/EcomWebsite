import { Suspense } from "react"
import ProductList from "@/components/product-list"
import ProductListSkeleton from "@/components/product-list-skeleton"

const categoryTitles = {
  "wall-art": "Metal Wall Art Collection",
  "copper-bottles": "Premium Copper Bottles",
}

const categoryDescriptions = {
  "wall-art":
    "Transform your space with our handcrafted metal wall art pieces. Each piece is meticulously designed and crafted to add elegance and character to your home.",
  "copper-bottles":
    "Discover the health benefits and timeless beauty of our copper bottles. Handcrafted with care, these bottles not only look stunning but also provide the natural benefits of copper.",
}

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const category = params.category
  const title = categoryTitles[category as keyof typeof categoryTitles] || "Products"
  const description = categoryDescriptions[category as keyof typeof categoryDescriptions] || ""

  return (
    <div className="container px-4 py-12 mx-auto">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-amber-900">{title}</h1>
        <p className="mt-4 max-w-3xl mx-auto text-zinc-700">{description}</p>
      </div>

      <Suspense fallback={<ProductListSkeleton />}>
        <ProductList category={category} />
      </Suspense>
    </div>
  )
}

