import { useEffect, useMemo, useState } from "react";
import { adminApi } from "../lib/adminApi";
import type { Offer } from "../types/offer";

export const useOffers = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      setIsLoading(true);
      try {
        const data = await adminApi.getOffers();
        setOffers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch offers", error);
        setOffers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOffers();
  }, []);

  const activeOfferCount = useMemo(
    () => offers.filter((offer) => offer.is_active).length,
    [offers],
  );

  return { offers, isLoading, activeOfferCount };
};
