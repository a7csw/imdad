import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import logoSrc from '@/assets/brand/logo-primary.svg';

const schema = z.object({
  email: z.string().email('بريد إلكتروني غير صالح'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    try {
      const res = await api.post('/auth/login', data);
      setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
      const role = res.data.user.role;
      if (role === 'ADMIN') navigate('/admin');
      else if (role === 'STORE_OWNER') navigate('/dashboard');
      else navigate('/');
    } catch (err: any) {
      setError('root', { message: err.response?.data?.message ?? 'حدث خطأ، حاول مرة أخرى' });
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12 bg-page overflow-hidden">
      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(201,168,76,0.08) 0%, transparent 60%)' }}
      />
      <div className="relative w-full max-w-sm">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-surface border border-default rounded-2xl p-8 card-glow"
        >
          {/* Logo */}
          <div className="flex flex-col items-center gap-4 mb-8">
            <img src={logoSrc} alt="Imdad" className="h-10" />
            <div className="text-center">
              <h1 className="text-xl font-bold text-primary font-display">{t('auth.login')}</h1>
              <p className="text-sm text-secondary mt-1">أهلاً بعودتك</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              label={t('auth.email')}
              type="email"
              placeholder="example@email.com"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label={t('auth.password')}
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.password?.message}
              {...register('password')}
            />

            {errors.root && (
              <p className="text-sm text-accent text-center bg-accent/10 rounded-xl px-3 py-2">
                {errors.root.message}
              </p>
            )}

            <Button type="submit" fullWidth size="lg" loading={isSubmitting} className="mt-2">
              <LogIn className="w-4 h-4" />
              {t('auth.login')}
            </Button>
          </form>

          <p className="text-center text-sm text-secondary mt-6">
            {t('auth.no_account')}{' '}
            <Link to="/register" className="text-gold hover:text-gold-light font-medium transition-colors">
              {t('auth.register')}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
