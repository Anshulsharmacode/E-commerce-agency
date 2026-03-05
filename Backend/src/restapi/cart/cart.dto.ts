export class AddCartItemDto {
  product_id: string;
  quantity_boxes: number;
  applied_offer_id?: string;
}

export class UpdateCartItemDto {
  quantity_boxes: number;
  applied_offer_id?: string;
}
