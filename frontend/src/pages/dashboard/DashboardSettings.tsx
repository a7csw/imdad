import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import CitySelect from '@/components/ui/CitySelect';

export default function DashboardSettings() {
  const { t } = useTranslation();

  const schema = z.object({
    name: z.string().min(2),
    description: z.string().max(500).optional(),
    address: z.string().min(5),
    city: z.string().min(1),
    phone: z.string().min(10),
    logo: z.string().url(t('dashboard.invalid_url')).optional().or(z.literal('')),
    banner: z.string().url(t('dashboard.invalid_url')).optional().or(z.literal('')),
  });

  type FormData = z.infer<typeof schema>;

  const { user, updateUser } = useAuthStore();
  const store = user?.store;

  const { register, handleSubmit, formState: { errors, isSubmitting, isSubmitSuccessful }, setError } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: store?.name ?? '',
      description: store?.description ?? '',
      address: store?.address ?? '',
      city: store?.city ?? '',
      phone: store?.phone ?? '',
      logo: store?.logo ?? '',
      banner: store?.banner ?? '',
    },
  });

  async function onSubmit(data: FormData) {
    try {
      const res = await api.patch('/stores/me', {
        ...data,
        logo: data.logo || undefined,
        banner: data.banner || undefined,
      });
      updateUser({ store: res.data });
    } catch (err: any) {
      setError('root', { message: err.response?.data?.message ?? t('common.error') });
    }
  }

  return (
    <div>
      <h1 className="text-xl font-bold font-display text-primary mb-6">{t('dashboard.store_settings')}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="bg-surface border border-default rounded-2xl p-6 flex flex-col gap-4 max-w-xl">
        <Input label={t('auth.store_name')} error={errors.name?.message} {...register('name')} />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-primary">{t('auth.store_description')}</label>
          <textarea rows={3} className="w-full bg-surface border border-default text-primary placeholder:text-tertiary rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold resize-none" {...register('description')} />
        </div>
        <Input label={t('auth.store_address')} error={errors.address?.message} {...register('address')} />
        <CitySelect label={t('auth.city')} error={errors.city?.message} {...register('city')} />
        <Input label={t('auth.phone')} type="tel" error={errors.phone?.message} {...register('phone')} />
        <Input label={t('dashboard.logo_url')} placeholder="https://..." {...register('logo')} />
        <Input label={t('dashboard.banner_url')} placeholder="https://..." {...register('banner')} />

        {errors.root && <p className="text-sm text-accent bg-accent/10 rounded-xl px-3 py-2 text-center">{errors.root.message}</p>}
        {isSubmitSuccessful && <p className="text-sm text-green-400 bg-green-400/10 rounded-xl px-3 py-2 text-center">{t('profile.save_success')}</p>}

        <Button type="submit" loading={isSubmitting}>{t('common.save')}</Button>
      </form>
    </div>
  );
}
