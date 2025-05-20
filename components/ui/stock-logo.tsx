import Image from "next/image";

interface StockLogoProps {
  name: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
}

export function StockLogo({
  name,
  alt,
  width = 24,
  height = 24,
  className = "w-full h-full object-contain",
}: Readonly<StockLogoProps>) {
  const baseUrl =
    process.env.NEXT_PUBLIC_STOCK_LOGO_URL ?? "https://logo.clearbit.com";
  const src = `${baseUrl}/${name.toLowerCase().replace(/\s+/g, "")}.com`;
  const fallback = "/default-logo.png";

  return (
    <Image
      src={src}
      alt={alt || `${name} logo`}
      width={width}
      height={height}
      className={className}
      loading="lazy"
      onError={(e) => {
        const target = e.currentTarget as HTMLImageElement;
        target.onerror = null;
        target.src = fallback;
      }}
      aria-hidden="true"
    />
  );
}
