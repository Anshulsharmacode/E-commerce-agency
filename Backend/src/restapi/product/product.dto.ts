import { ProductUnit } from 'src/db/schema';

export class CreateProductDto {
  category_id: string;
  product_name: string;
  name: string;
  description?: string;
  unit: ProductUnit;
  unit_weight: number;
  pieces_per_box: number;
  selling_price_box: number;
  purchase_price_box: number;
  image_urls?: string[];
  is_active?: boolean;
}

export class UpdateProductDto {
  category_id?: string;
  name?: string;
  description?: string;
  unit?: ProductUnit;
  unit_weight?: number;
  pieces_per_box?: number;
  selling_price_box?: number;
  purchase_price_box?: number;
  image_urls?: string[];
  is_active?: boolean;
  is_activate?: boolean;
}
