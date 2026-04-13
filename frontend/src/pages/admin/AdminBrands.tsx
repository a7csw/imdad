import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import type { Brand } from '@/types';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';

const schema = z.object({ name: z.string().min(2), origin: z.string().optional() });
type FormData = z.infer<typeof schema>;

export default function AdminBrands() {
  const { t } = useTranslation();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    api.get('/brands').then((res) => setBrands(res.data ?? [])).finally(() => setLoading(false));
  }, []);

  async function onSubmit(data: FormData) {
    const res = await api.post('/brands', data);
    setBrands((prev) => [...prev, res.data]);
    reset();
  }

  async function handleDelete(id: string) {
    if (!confirm(t('admin.delete_brand_confirm'))) return;
    await api.delete(`/brands/${id}`);
    setBrands((prev) => prev.filter((b) => b.id !== id));
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;

  return (
    <div>
      <h1 className="text-xl font-bold font-display text-primary mb-6">{t('admin.brands')}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="bg-surface border border-default rounded-2xl p-5 mb-6">
        <h2 className="font-semibold text-primary mb-4">{t('admin.add_brand')}</h2>
        <div className="flex gap-3">
          <Input label={t('admin.name_en')} {...register('name')} />
          <Input label={t('admin.origin')} {...register('origin')} />
        </div>
        <Button type="submit" size="sm" loading={isSubmitting} className="mt-4 gap-1.5">
          <Plus className="w-4 h-4" /> {t('admin.add')}
        </Button>
      </form>
      <div className="flex flex-col gap-2">
        {brands.map((brand) => (
          <div key={brand.id} className="flex items-center justify-between p-3 bg-surface border border-default rounded-xl">
            <div>
              <p className="font-medium text-primary">{brand.name}</p>
              {brand.origin && <p className="text-xs text-secondary">{brand.origin}</p>}
            </div>
            <button onClick={() => handleDelete(brand.id)} className="p-1.5 rounded-lg text-tertiary hover:text-accent hover:bg-accent/10 transition-all">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
