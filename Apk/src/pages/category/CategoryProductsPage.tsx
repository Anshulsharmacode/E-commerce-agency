import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, ShoppingBag, Package } from 'lucide-react';
import { getAllProducts, getCategoryById, type Category, type Product } from '@/api';

const inr = new Intl.NumberFormat('en-IN');

function CategoryProductsPage() {
  const { categoryId = '' } = useParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (!categoryId) {
        setError('Category id is missing.');
        return;
      }

      setIsLoading(true);
      setError('');
      try {
        const [categoryRes, productRes] = await Promise.all([getCategoryById(categoryId), getAllProducts(300)]);
        setCategory(categoryRes.data);
        setProducts(productRes.data.filter((product) => product.is_active));
      } catch (err: unknown) {
        const apiErr = err as { response?: { data?: { message?: string } } };
        setError(apiErr.response?.data?.message ?? 'Failed to load category products.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadData();
  }, [categoryId]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => product.category_id === categoryId);
  }, [products, categoryId]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f2f7ff] via-[#f7fafc] to-white text-foreground">
      <div className="px-4 pb-10 pt-6">
        <header className="mb-4 flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white/90 px-3 py-2.5">
          <Link to="/categories" className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900">
            <ChevronLeft className="h-3.5 w-3.5" /> Categories
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0f172a]">
              <ShoppingBag className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="max-w-28 truncate text-[15px] font-semibold tracking-tight">{category?.name ?? 'Products'}</span>
          </div>
        </header>

        <section className="mb-4 rounded-3xl bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] px-4 py-5 text-white">
          <h1 className="line-clamp-2 text-[24px] font-semibold leading-[1.15] tracking-tight">
            {category?.name ?? 'Category Products'}
          </h1>
          {!error && category?.description && (
            <p className="mt-2 line-clamp-3 text-[13px] leading-5 text-slate-200">{category.description}</p>
          )}
          <p className="mt-3 inline-flex rounded-lg border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-medium">
            {filteredProducts.length} active products
          </p>
        </section>

        {error && (
          <div className="mb-3 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-xs text-destructive">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-5 text-sm text-slate-500">
            Loading products...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-5 text-sm text-slate-500">
            No products found in this category.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {filteredProducts.map((product) => (
              <Link
                to={`/products/${product.product_id}`}
                state={{ product, backTo: `/categories/${categoryId}`, backLabel: 'Category' }}
                key={product.product_id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
              >
                {product.image_urls?.[0] ? (
                  <img src={product.image_urls[0]} alt={product.name} className="h-24 w-full object-cover" />
                ) : (
                  <div className="flex h-24 w-full items-center justify-center bg-slate-100 text-xl font-semibold text-slate-500">
                    {product.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="p-3">
                  <div className="mb-1.5 inline-flex rounded-lg bg-[#eef2ff] p-1.5 text-[#3730a3]">
                    <Package className="h-3 w-3" />
                  </div>
                  <p className="line-clamp-1 text-[13px] font-semibold tracking-tight">{product.name}</p>
                  <p className="mt-1 text-[14px] font-semibold text-[#0f172a]">Rs. {inr.format(product.selling_price_box)}</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">{product.pieces_per_box} pcs/box</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CategoryProductsPage;
