import Image from "next/image";

type BrandLogoProps = {
  compact?: boolean;
};

export function BrandLogo({ compact = false }: BrandLogoProps) {
  return (
    <div className={`inline-flex w-max items-center ${compact ? "-ml-0.5 gap-0 sm:-ml-0.5 md:-ml-1" : "gap-2 sm:gap-3 md:gap-4"}`}>
      <Image
        src="/brand/logo-main.png"
        alt="Negosyante Island icon"
        width={512}
        height={512}
        className={`block shrink-0 object-contain ${compact ? "h-[3.4rem] w-auto sm:h-[3.55rem] md:h-[3.6rem]" : "w-20 sm:w-20 md:w-24"}`}
        priority
      />
      {compact ? (
        <div className="shrink-0 -ml-0 leading-none sm:-ml-1 md:-ml-1.5">
          <Image
            src="/brand/NegosyanteIslandNewLogoTextOnly.png"
            alt="Negosyante Island"
            width={2752}
            height={1536}
            className="block h-[2.65rem] w-auto object-contain sm:h-[2.9rem] md:h-[3.1rem]"
            priority
          />
        </div>
      ) : (
        <div className="shrink-0 leading-none">
          <Image
            src="/brand/NegosyanteIslandNewLogoTextOnly.png"
            alt="Negosyante Island"
            width={2752}
            height={1536}
            className="block h-auto w-40 sm:w-56 md:w-[17.5rem]"
            priority
          />
        </div>
      )}
    </div>
  );
}
