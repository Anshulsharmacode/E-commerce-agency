import type { Offer } from "@/api";
import { CalendarDays, Tag, TicketPercent, X } from "lucide-react";

interface OfferDetailsModalProps {
  isOpen: boolean;
  offer: Offer | null;
  onClose: () => void;
}

const formatDate = (value?: Date | string) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getDiscountText = (offer: Offer) => {
  if (offer.discount_type === "PERCENTAGE") {
    return `${offer.discount_value}% off`;
  }
  if (offer.discount_type === "FIXED") {
    return `₹${offer.discount_value} off`;
  }
  if (offer.discount_type === "FREE_PRODUCT") {
    return `Free product reward`;
  }
  return `${offer.discount_value}`;
};

function OfferDetailsModal({ isOpen, offer, onClose }: OfferDetailsModalProps) {
  if (!isOpen || !offer) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-[1.75rem] border border-border bg-card p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">
              {offer.offer_type} Offer
            </p>
            <h3 className="mt-1 text-xl font-black leading-tight text-foreground">
              {offer.offer_name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="rounded-2xl bg-primary/10 px-4 py-3">
            <p className="text-[11px] font-bold text-muted-foreground">Code</p>
            <p className="mt-1 inline-block rounded-lg bg-primary px-2.5 py-1 text-sm font-black text-primary-foreground">
              {offer.offer_code}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-border bg-background px-3 py-2.5">
              <p className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground">
                <TicketPercent className="h-3.5 w-3.5" />
                Discount
              </p>
              <p className="mt-1 text-sm font-black text-foreground">
                {getDiscountText(offer)}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-background px-3 py-2.5">
              <p className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground">
                <Tag className="h-3.5 w-3.5" />
                Type
              </p>
              <p className="mt-1 text-sm font-black text-foreground">
                {offer.discount_type}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-background px-4 py-3">
            <p className="mb-1.5 flex items-center gap-1 text-[11px] font-bold text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              Validity
            </p>
            <p className="text-sm font-semibold text-foreground">
              {formatDate(offer.start_date)} to {formatDate(offer.end_date)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl bg-secondary px-3 py-2">
              <p className="font-bold text-muted-foreground">Min order value</p>
              <p className="mt-1 font-black text-foreground">
                {offer.min_order_value ? `₹${offer.min_order_value}` : "N/A"}
              </p>
            </div>
            <div className="rounded-xl bg-secondary px-3 py-2">
              <p className="font-bold text-muted-foreground">Min boxes</p>
              <p className="mt-1 font-black text-foreground">
                {offer.min_order_boxes ?? "N/A"}
              </p>
            </div>
            <div className="rounded-xl bg-secondary px-3 py-2">
              <p className="font-bold text-muted-foreground">Usage limit</p>
              <p className="mt-1 font-black text-foreground">
                {offer.usage_limit ?? "Unlimited"}
              </p>
            </div>
            <div className="rounded-xl bg-secondary px-3 py-2">
              <p className="font-bold text-muted-foreground">Used</p>
              <p className="mt-1 font-black text-foreground">
                {offer.usage_count ?? 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OfferDetailsModal;
