import type { Offer } from "../../types/offer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";

const formatDiscount = (offer: Offer) => {
  if (offer.discount_type === "percentage") return `${offer.discount_value}% OFF`;
  if (offer.discount_type === "flat") return `₹${offer.discount_value} OFF`;
  return "Free Product";
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

type OfferCardProps = {
  offer: Offer;
};

export default function OfferCard({ offer }: OfferCardProps) {
  return (
    <Card className="border-border/70 bg-card/95">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg">{offer.offer_name}</CardTitle>
            <CardDescription className="mt-1 font-mono text-xs">
              {offer.offer_code}
            </CardDescription>
          </div>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              offer.is_active ? "bg-chart-5/30 text-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {offer.is_active ? "Active" : "Inactive"}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className="font-semibold text-primary">{formatDiscount(offer)}</p>
        <p className="text-muted-foreground">Type: {offer.offer_type}</p>
        <p className="text-muted-foreground">
          Valid: {formatDate(offer.start_date)} to {formatDate(offer.end_date)}
        </p>
      </CardContent>
    </Card>
  );
}
