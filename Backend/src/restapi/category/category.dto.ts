export class CreateCategoryDto {
  name: string;
  description?: string;

  is_active?: boolean;
}

export class UpdateCategoryDto {
  name?: string;
  description?: string;
  is_active?: boolean;
  is_activate?: boolean;
}
