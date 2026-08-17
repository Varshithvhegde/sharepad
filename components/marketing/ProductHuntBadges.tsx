import { PRODUCT_HUNT } from "@/lib/site";

/** Official Product Hunt featured badge (250×54). */
export function ProductHuntFeaturedBadge() {
  return (
    <a
      href={PRODUCT_HUNT.badgeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block shrink-0"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- third-party PH widget */}
      <img
        src={PRODUCT_HUNT.badgeImage}
        alt="SharePad — Share markdown notebooks with one link. No signup. | Product Hunt"
        width={250}
        height={54}
      />
    </a>
  );
}

/** Rich embed card — styled to match SharePad sketch cards. */
export function ProductHuntEmbedCard() {
  return (
    <div className="relative w-full max-w-[28rem]">
      <span
        className="tape tape-o"
        style={{ top: -8, left: "50%", transform: "translateX(-50%) rotate(-2deg)", width: 52, height: 15 }}
      />
      <div className="sk sn-o" style={{ transform: "rotate(0.4deg)" }}>
        <div className="sk-b" />
        <div className="sk-i p-5">
          <div className="flex items-center gap-3 mb-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- PH CDN icon */}
            <img
              src={PRODUCT_HUNT.icon}
              alt=""
              width={64}
              height={64}
              className="shrink-0 rounded-lg object-cover"
              style={{ border: "1.5px solid rgba(28,28,28,0.15)" }}
            />
            <div className="min-w-0 flex-1">
              <h3
                className="truncate text-[1.05rem] leading-tight"
                style={{ fontFamily: "var(--font-sketch), serif" }}
              >
                SharePad
              </h3>
              <p className="text-[0.85rem] leading-snug mt-0.5 line-clamp-2" style={{ color: "var(--ink-2)" }}>
                {PRODUCT_HUNT.tagline}
              </p>
            </div>
          </div>
          <a
            href={PRODUCT_HUNT.embedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-red w-full text-[0.9rem] !py-2 justify-center"
          >
            Check it out on Product Hunt →
          </a>
        </div>
      </div>
    </div>
  );
}

/** Footer row: featured badge + optional embed card. */
export function ProductHuntBadges({ showCard = false }: { showCard?: boolean }) {
  return (
    <div
      className={`flex flex-col items-center gap-6 ${showCard ? "sm:flex-row sm:items-start sm:justify-center" : ""}`}
      aria-label="Product Hunt"
    >
      <ProductHuntFeaturedBadge />
      {showCard && <ProductHuntEmbedCard />}
    </div>
  );
}
