function LoadingSkeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-xl bg-gray-200 ${className}`} />;
}

export function CardSkeleton({ lines = 3 }) {
  return (
    <div className="bg-white/60 backdrop-blur-lg border rounded-2xl p-5 shadow-lg">
      <LoadingSkeleton className="h-5 w-40 mb-3" />
      <LoadingSkeleton className="h-4 w-24 mb-4" />
      {Array.from({ length: lines }).map((_, index) => (
        <LoadingSkeleton key={index} className="h-3 w-full mb-2" />
      ))}
      <div className="flex gap-2 mt-4">
        <LoadingSkeleton className="h-8 w-24" />
        <LoadingSkeleton className="h-8 w-24" />
      </div>
    </div>
  );
}

export function PanelSkeleton() {
  return (
    <div className="bg-white/60 backdrop-blur-lg border rounded-2xl p-6 shadow-lg">
      <LoadingSkeleton className="h-5 w-48 mb-4" />
      <LoadingSkeleton className="h-4 w-full mb-2" />
      <LoadingSkeleton className="h-4 w-3/4 mb-2" />
      <LoadingSkeleton className="h-4 w-2/3" />
    </div>
  );
}

export default LoadingSkeleton;
