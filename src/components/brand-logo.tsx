import Image from "next/image";

type BrandLogoProps = {
  compact?: boolean;
};

export function BrandLogo({ compact = false }: BrandLogoProps) {
  return (
    <div className={`flex max-w-full items-center ${compact ? "gap-1.5 sm:gap-3" : "gap-2 sm:gap-3"}`}>
      <Image
        src="/brand/logo-main.png"
        alt="Negosyante Island icon"
        width={compact ? 120 : 180}
        height={compact ? 120 : 180}
        className={`h-auto w-auto shrink-0 ${compact ? "w-8 sm:w-12 md:w-20" : "w-14 sm:w-20 md:w-24"}`}
        priority
      />
      <div className="min-w-0 leading-none">
        <Image
          src="/brand/wordmark.png"
          alt="Negosyante Island"
          width={compact ? 420 : 560}
          height={compact ? 140 : 190}
          className={`h-auto w-auto max-w-full ${compact ? "w-[7.5rem] sm:w-36 md:w-52" : "w-40 sm:w-56 md:w-[17.5rem]"}`}
          priority
        />
      </div>
    </div>
  );
}
