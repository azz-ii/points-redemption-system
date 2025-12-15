import * as React from "react";
import { cn } from "@/lib/utils";

interface ImageRootProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const ImageRoot = React.forwardRef<HTMLDivElement, ImageRootProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("relative overflow-hidden", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
ImageRoot.displayName = "ImageRoot";

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
}

const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  ({ className, src, alt = "", fallback, onError, ...props }, ref) => {
    const [error, setError] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
      setError(false);
      setIsLoading(true);
    }, [src]);

    const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      console.error(`[Image] Failed to load image: ${src}`);
      setError(true);
      setIsLoading(false);
      if (onError) {
        onError(e);
      }
    };

    const handleLoad = () => {
      setIsLoading(false);
    };

    if (error && fallback) {
      return (
        <img
          ref={ref}
          src={fallback}
          alt={alt}
          className={cn("w-full h-full object-cover", className)}
          onLoad={handleLoad}
          {...props}
        />
      );
    }

    return (
      <>
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse" />
        )}
        <img
          ref={ref}
          src={src}
          alt={alt}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100",
            className
          )}
          onError={handleError}
          onLoad={handleLoad}
          {...props}
        />
      </>
    );
  }
);
Image.displayName = "Image";

interface ImageFallbackProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const ImageFallback = React.forwardRef<HTMLDivElement, ImageFallbackProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center w-full h-full bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
ImageFallback.displayName = "ImageFallback";

export { ImageRoot, Image, ImageFallback };
