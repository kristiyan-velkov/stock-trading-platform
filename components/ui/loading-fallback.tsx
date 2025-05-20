import { Loader } from "lucide-react";

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="flex flex-col items-center gap-2">
      <Loader className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">
        Loading stock dashboard...
      </p>
    </div>
  </div>
);

export default LoadingFallback;
