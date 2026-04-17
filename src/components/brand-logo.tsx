import Image from "next/image";

type BrandLogoProps = {
  compact?: boolean;
};

export function BrandLogo({ compact = false }: BrandLogoProps) {
  return (
    <div className={`flex items-center ${compact ? "gap-2 sm:gap-3" : "gap-2 sm:gap-3"}`}>
      <Image
        src="/brand/logo-main.png"
        alt="Negosyante Island icon"
        width={compact ? 120 : 180}
        height={compact ? 120 : 180}
        className={`h-auto w-auto ${compact ? "w-10 sm:w-14 md:w-20" : "w-16 sm:w-20 md:w-24"}`}
        priority
      />
      <div className="leading-none">
        <Image
          src="/brand/wordmark.png"
          alt="Negosyante Island"
          width={compact ? 420 : 560}
          height={compact ? 140 : 190}
          className={`h-auto w-auto ${compact ? "w-24 sm:w-36 md:w-52" : "w-44 sm:w-56 md:w-[17.5rem]"}`}
          priority
        />
      </div>
    </div>
  );
}
