import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { User, Phone, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import CitySelect from '@/components/ui/CitySelect';

const schema = z.object({
  name: z.string().min(2),
  phone: z.string().min(10),
  city: z.string().min(1),
});

type FormData = z.infer<typeof schema>;

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user, updateUser } = useAuthStore();

  const { register, handleSubmit, formState: { errors, isSubmitting, isSubmitSuccessful }, setError } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: user?.name, phone: user?.phone, city: user?.city ?? '' },
  });

  async function onSubmit(data: FormData) {
    try {
      const res = await api.patch('/users/me', data);
      updateUser(res.data);
    } catch (err: any) {
      setError('root', { message: err.response?.data?.message ?? t('common.error') });
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold font-display text-primary mb-8">{t('profile.title')}</h1>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface border border-default rounded-3xl p-8 card-glow"
      >
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-gold flex items-center justify-center">
            <span className="text-dark-900 font-bold text-2xl">{user?.name[0].toUpperCase()}</span>
          </div>
          <div>
            <p className="font-bold text-primary text-lg font-display">{user?.name}</p>
            <div className="flex items-center gap-1.5 text-sm text-secondary">
              <Mail className="w-3.5 h-3.5" /> {user?.email}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label={t('profile.full_name')} leftIcon={<User className="w-4 h-4" />} error={errors.name?.message} {...register('name')} />
          <Input label={t('auth.phone')} type="tel" leftIcon={<Phone className="w-4 h-4" />} error={errors.phone?.message} {...register('phone')} />
          <CitySelect label={t('auth.city')} error={errors.city?.message} {...register('city')} />

          {errors.root && (
            <p className="text-sm text-accent bg-accent/10 rounded-xl px-3 py-2 text-center">{errors.root.message}</p>
          )}
          {isSubmitSuccessful && (
            <p className="text-sm text-green-400 bg-green-400/10 rounded-xl px-3 py-2 text-center">{t('profile.save_success')}</p>
          )}

          <Button type="submit" fullWidth loading={isSubmitting}>{t('profile.save_changes')}</Button>
        </form>
      </motion.div>
    </div>
  );
}
