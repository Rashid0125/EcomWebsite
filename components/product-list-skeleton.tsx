export default function ProductListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="border rounded-lg overflow-hidden">
          <div className="h-48 bg-gray-200 animate-pulse" />
          <div className="p-4">
            <div className="h-6 bg-gray-200 animate-pulse mb-2" />
            <div className="h-4 bg-gray-200 animate-pulse w-3/4 mb-2" />
            <div className="h-4 bg-gray-200 animate-pulse w-1/2 mb-4" />
            <div className="h-10 bg-gray-200 animate-pulse w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

