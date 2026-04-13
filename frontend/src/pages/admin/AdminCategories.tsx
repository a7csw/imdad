import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import type { Category } from '@/types';
import { getCategoryName } from '@/lib/utils';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';

const schema = z.object({
  name: z.string().min(2),
  nameAr: z.string().min(2),
  nameKu: z.string().optional(),
  icon: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function AdminCategories() {
  const { t, i18n } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data ?? [])).finally(() => setLoading(false));
  }, []);

  async function onSubmit(data: FormData) {
    const res = await api.post('/categories', data);
    setCategories((prev) => [...prev, res.data]);
    reset();
  }

  async function handleDelete(id: string) {
    if (!confirm(t('admin.delete_category_confirm'))) return;
    await api.delete(`/categories/${id}`);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;

  return (
    <div>
      <h1 className="text-xl font-bold font-display text-primary mb-6">{t('admin.categories')}</h1>

      {/* Add form */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-surface border border-default rounded-2xl p-5 mb-6">
        <h2 className="font-semibold text-primary mb-4">{t('admin.add_category')}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Input label={t('admin.name_en')} {...register('name')} />
          <Input label={t('admin.name_ar')} {...register('nameAr')} />
          <Input label={t('admin.name_ku')} {...register('nameKu')} />
          <Input label={t('admin.icon_emoji')} {...register('icon')} />
        </div>
        <Button type="submit" size="sm" loading={isSubmitting} className="mt-4 gap-1.5">
          <Plus className="w-4 h-4" /> {t('admin.add')}
        </Button>
      </form>

      {/* List */}
      <div className="flex flex-col gap-2">
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center justify-between p-3 bg-surface border border-default rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-xl">{cat.icon ?? '📦'}</span>
              <div>
                <p className="font-medium text-primary">{getCategoryName(cat, i18n.language)}</p>
                <p className="text-xs text-secondary">{cat.name}</p>
              </div>
            </div>
            <button onClick={() => handleDelete(cat.id)} className="p-1.5 rounded-lg text-tertiary hover:text-accent hover:bg-accent/10 transition-all">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
