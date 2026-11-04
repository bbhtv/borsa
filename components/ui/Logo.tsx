import Image from "next/image";

export function Logo({ white, height = 34, sub = true, className = "" }: { white?: boolean; height?: number; sub?: boolean; className?: string }) {
  const w = Math.round((height * 900) / 241);
  return (
    <span className={`inline-flex flex-col items-center gap-1 ${className}`}>
      <Image src={white ? "/logo-white.png" : "/logo.png"} alt="Tavşan" width={w} height={height} priority style={{ height, width: "auto" }} />
      {sub && (
        <span
          className={`font-extrabold uppercase leading-none ${white ? "text-logo" : "text-brand"}`}
          style={{ fontSize: Math.max(7, height * 0.27), letterSpacing: height * 0.075 }}
        >
          Hızlı Okuma
        </span>
      )}
    </span>
  );
}
