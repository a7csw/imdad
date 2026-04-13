import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import type { Category, Brand } from '@/types';
import { getCategoryName } from '@/lib/utils';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import ImageUploader from '@/components/ui/ImageUploader';

interface ProductFormData {
  name: string;
  nameAr?: string;
  descriptionShort?: string;
  descriptionFull?: string;
  priceIQD: string;
  discountPriceIQD?: string;
  stock: string;
  flavor?: string;
  size?: string;
  servings?: string;
  ingredients?: string;
  usage?: string;
  warnings?: string;
  origin?: string;
  authentic: boolean;
  featured: boolean;
  categoryId: string;
  brandId: string;
}

export default function DashboardAddProduct() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { isSubmitting } } = useForm<ProductFormData>({
    defaultValues: { authentic: false, featured: false },
  });

  useEffect(() => {
    Promise.all([api.get('/categories'), api.get('/brands')]).then(([c, b]) => {
      setCategories(c.data);
      setBrands(b.data);
    });
  }, []);

  async function onSubmit(data: ProductFormData) {
    setError('');
    try {
      await api.post('/products', {
        ...data,
        images,
        priceIQD: parseInt(data.priceIQD, 10),
        discountPriceIQD: data.discountPriceIQD ? parseInt(data.discountPriceIQD, 10) : undefined,
        stock: parseInt(data.stock, 10),
        servings: data.servings ? parseInt(data.servings, 10) : undefined,
      });
      navigate('/dashboard/products');
    } catch (err: any) {
      setError(err.response?.data?.message ?? t('common.error'));
    }
  }

  const textareaFields: [string, keyof ProductFormData, number][] = [
    [t('dashboard.short_desc'), 'descriptionShort', 2],
    [t('dashboard.full_desc'), 'descriptionFull', 4],
    [t('product.ingredients'), 'ingredients', 2],
    [t('product.usage'), 'usage', 2],
    [t('product.warnings'), 'warnings', 2],
  ];

  return (
    <div>
      <h1 className="text-xl font-bold font-display text-primary mb-6">{t('dashboard.add_product_title')}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="bg-surface border border-default rounded-2xl p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label={t('dashboard.product_name_en')} required {...register('name')} />
          <Input label={t('dashboard.product_name_ar')} {...register('nameAr')} />
          <Input label={t('dashboard.price_iqd')} type="number" required {...register('priceIQD')} />
          <Input label={t('dashboard.discount_price_iqd')} type="number" {...register('discountPriceIQD')} />
          <Input label={t('dashboard.stock')} type="number" required defaultValue="0" {...register('stock')} />
          <Input label={t('product.servings')} type="number" {...register('servings')} />
          <Input label={t('product.flavor')} {...register('flavor')} />
          <Input label={t('product.size')} {...register('size')} />
          <Input label={t('product.origin')} {...register('origin')} />
          <Select label={t('product.category')} required {...register('categoryId')}>
            <option value="">{t('dashboard.select_category')}</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{getCategoryName(c, i18n.language)}</option>)}
          </Select>
          <Select label={t('product.brand')} required {...register('brandId')}>
            <option value="">{t('dashboard.select_brand')}</option>
            {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </Select>
        </div>

        <div className="mt-4 flex flex-col gap-4">
          {textareaFields.map(([label, field, rows]) => (
            <div key={field} className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-primary">{label}</label>
              <textarea rows={rows} className="w-full bg-surface border border-default text-primary placeholder:text-tertiary rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold resize-none" {...register(field)} />
            </div>
          ))}

          {/* Image Upload */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-primary">{t('dashboard.product_images')}</label>
            <ImageUploader value={images} onChange={setImages} maxImages={10} />
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="accent-gold" {...register('authentic')} />
              <span className="text-sm text-primary">{t('dashboard.authentic_label')}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="accent-gold" {...register('featured')} />
              <span className="text-sm text-primary">{t('dashboard.featured_label')}</span>
            </label>
          </div>
        </div>

        {error && <p className="text-sm text-accent bg-accent/10 rounded-xl px-3 py-2 text-center mt-4">{error}</p>}

        <div className="flex gap-3 mt-6">
          <Button type="submit" loading={isSubmitting}>{t('dashboard.save_product')}</Button>
          <Button type="button" variant="ghost" onClick={() => navigate('/dashboard/products')}>{t('common.cancel')}</Button>
        </div>
      </form>
    </div>
  );
}
