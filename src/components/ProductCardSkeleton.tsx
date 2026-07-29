/** Shimmer skeleton matching the ProductCard footprint. */
const ProductCardSkeleton = ({ count = 8 }: { count?: number }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="rounded-xl overflow-hidden bg-secondary shadow-card">
        <div className="aspect-[4/5] skeleton-shimmer" />
        <div className="p-4 space-y-2.5 bg-background">
          <div className="h-2.5 w-1/3 rounded skeleton-shimmer" />
          <div className="h-3.5 w-4/5 rounded skeleton-shimmer" />
          <div className="h-4 w-1/2 rounded skeleton-shimmer" />
        </div>
      </div>
    ))}
  </>
);

export default ProductCardSkeleton;
