export interface Offer {
  _id: string;
  offer_name: string;
  offer_code: string;
  offer_type: string;
  discount_type: string;
  discount_value: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
}
