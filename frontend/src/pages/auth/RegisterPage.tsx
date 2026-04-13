import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Phone, Store } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import CitySelect from '@/components/ui/CitySelect';
import logoSrc from '@/assets/brand/logo-primary.svg';
import { cn } from '@/lib/utils';

type RegisterType = 'buyer' | 'store';

type FormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  city: string;
  storeName?: string;
  storeAddress?: string;
  storePhone?: string;
  storeDescription?: string;
};

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [type, setType] = useState<RegisterType>('buyer');

  const isBuyer = type === 'buyer';

  const passwordField = z.string()
    .min(8, t('auth.passwordTooShort'))
    .regex(/[A-Z]/, t('auth.passwordNeedsUppercase'))
    .regex(/[0-9]/, t('auth.passwordNeedsNumber'));

  const baseFields = {
    name: z.string().min(2),
    email: z.string().email(),
    password: passwordField,
    confirmPassword: z.string(),
    phone: z.string().min(10),
    city: z.string().min(1),
  };

  const buyerSchema = z.object(baseFields).refine(
    (d) => d.password === d.confirmPassword,
    { message: t('auth.passwordMismatch'), path: ['confirmPassword'] }
  );

  const storeSchema = z.object({
    ...baseFields,
    storeName: z.string().min(2),
    storeAddress: z.string().min(5),
    storePhone: z.string().min(10),
    storeDescription: z.string().max(500).optional(),
  }).refine(
    (d) => d.password === d.confirmPassword,
    { message: t('auth.passwordMismatch'), path: ['confirmPassword'] }
  );

  const schema = isBuyer ? buyerSchema : storeSchema;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema as any),
  });

  function switchType(newType: RegisterType) {
    setType(newType);
    reset();
  }

  const passwordValue = watch('password') ?? '';
  const hasLength = passwordValue.length >= 8;
  const hasUpper = /[A-Z]/.test(passwordValue);
  const hasNumber = /[0-9]/.test(passwordValue);
  const strength = hasLength ? (hasUpper ? (hasNumber ? 3 : 2) : 1) : 0;

  const segmentColor = (level: number) => {
    if (strength < level) return 'bg-surface-3';
    if (level === 1) return 'bg-accent';
    if (level === 2) return 'bg-gold';
    return 'bg-green-400';
  };

  async function onSubmit(data: FormData) {
    try {
      const { confirmPassword, ...payload } = data;
      const endpoint = isBuyer ? '/auth/register/buyer' : '/auth/register/store';
      const res = await api.post(endpoint, payload);
      setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
      if (isBuyer) navigate('/');
      else navigate('/dashboard');
    } catch (err: any) {
      (setError as any)('root', { message: err.response?.data?.message ?? t('common.try_again') });
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12 bg-page overflow-hidden">
      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(201,168,76,0.08) 0%, transparent 60%)' }}
      />
      <div className="relative w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-surface border border-default rounded-2xl p-8 card-glow"
        >
          {/* Logo */}
          <div className="flex flex-col items-center gap-4 mb-6">
            <img src={logoSrc} alt="Imdad" className="h-10" />
            <h1 className="text-xl font-bold text-primary font-display">{t('auth.register')}</h1>
          </div>

          {/* Type Switcher */}
          <div className="flex bg-surface-2 p-1 rounded-xl mb-6">
            {(['buyer', 'store'] as RegisterType[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => switchType(tab)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  type === tab ? 'bg-gold text-dark-900' : 'text-secondary hover:text-primary'
                }`}
              >
                {tab === 'buyer' ? '🛒 ' + t('auth.buyer') : '🏪 ' + t('auth.store_owner')}
              </button>
            ))}
          </div>

          {/* Store pending notice */}
          <AnimatePresence>
            {type === 'store' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 bg-gold/10 border border-gold/30 rounded-xl"
              >
                <p className="text-xs text-gold">{t('auth.pending_notice')}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label={t('auth.name')}
                leftIcon={<User className="w-4 h-4" />}
                error={(errors as any).name?.message}
                {...register('name')}
              />
              <CitySelect
                label={t('auth.city')}
                error={(errors as any).city?.message}
                {...register('city')}
              />
            </div>

            <Input
              label={t('auth.email')}
              type="email"
              placeholder="example@email.com"
              leftIcon={<Mail className="w-4 h-4" />}
              error={(errors as any).email?.message}
              {...register('email')}
            />

            {/* Password + strength */}
            <div className="flex flex-col gap-1.5">
              <Input
                label={t('auth.password')}
                type="password"
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
                error={(errors as any).password?.message}
                {...register('password')}
              />
              {passwordValue && (
                <div className="flex flex-col gap-1.5 px-0.5">
                  {/* Strength bar */}
                  <div className="flex gap-1.5">
                    {[1, 2, 3].map((level) => (
                      <div
                        key={level}
                        className={cn(
                          'h-1 flex-1 rounded-full transition-all duration-300',
                          segmentColor(level)
                        )}
                      />
                    ))}
                  </div>
                  {/* Unsatisfied rules */}
                  <div className="flex flex-col gap-0.5">
                    {!hasLength && (
                      <p className="text-xs text-tertiary">{t('auth.passwordTooShort')}</p>
                    )}
                    {!hasUpper && (
                      <p className="text-xs text-tertiary">{t('auth.passwordNeedsUppercase')}</p>
                    )}
                    {!hasNumber && (
                      <p className="text-xs text-tertiary">{t('auth.passwordNeedsNumber')}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <Input
              label={t('auth.confirmPassword')}
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              error={(errors as any).confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <Input
              label={t('auth.phone')}
              type="tel"
              placeholder="07701234567"
              leftIcon={<Phone className="w-4 h-4" />}
              error={(errors as any).phone?.message}
              {...register('phone')}
            />

            {/* Store fields */}
            <AnimatePresence>
              {type === 'store' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-3 border-t border-default pt-3 mt-1"
                >
                  <p className="text-xs text-secondary font-medium">{t('auth.store_name')}</p>
                  <Input
                    label={t('auth.store_name')}
                    leftIcon={<Store className="w-4 h-4" />}
                    error={(errors as any).storeName?.message}
                    {...register('storeName' as any)}
                  />
                  <Input
                    label={t('auth.store_address')}
                    error={(errors as any).storeAddress?.message}
                    {...register('storeAddress' as any)}
                  />
                  <Input
                    label={t('auth.store_phone')}
                    type="tel"
                    placeholder="07701234567"
                    leftIcon={<Phone className="w-4 h-4" />}
                    error={(errors as any).storePhone?.message}
                    {...register('storePhone' as any)}
                  />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-primary">{t('auth.store_description')}</label>
                    <textarea
                      rows={2}
                      className="w-full bg-surface border border-default text-primary placeholder:text-tertiary rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:ring-[3px] focus:ring-gold/20 resize-none transition-all duration-200 hover:border-strong"
                      {...register('storeDescription' as any)}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {(errors as any).root && (
              <p className="text-sm text-accent text-center bg-accent/10 rounded-xl px-3 py-2">
                {(errors as any).root.message}
              </p>
            )}

            <Button type="submit" fullWidth size="lg" loading={isSubmitting} className="mt-2">
              {t('auth.register')}
            </Button>
          </form>

          <p className="text-center text-sm text-secondary mt-5">
            {t('auth.have_account')}{' '}
            <Link to="/login" className="text-gold hover:text-gold-light font-medium transition-colors">
              {t('auth.login')}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
