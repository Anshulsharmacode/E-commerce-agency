import type { Offer } from "../../types/offer";
import OfferCard from "./OfferCard";

type OffersSectionProps = {
  offers: Offer[];
  isLoading: boolean;
};

export default function OffersSection({ offers, isLoading }: OffersSectionProps) {
  return (
    <section className="px-4 pb-16 md:px-6">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-3xl font-semibold">Current Offers</h2>
          <span className="rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-medium">
            Pulled from `/offer/all`
          </span>
        </div>

        {isLoading ? (
          <div className="rounded-xl border border-border/70 bg-card/90 p-8 text-center text-muted-foreground">
            Loading offers...
          </div>
        ) : offers.length === 0 ? (
          <div className="rounded-xl border border-border/70 bg-card/90 p-8 text-center text-muted-foreground">
            No offers available yet.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {offers.map((offer) => (
              <OfferCard key={offer._id} offer={offer} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
