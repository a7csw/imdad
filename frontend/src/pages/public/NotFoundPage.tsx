import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="text-8xl font-black font-display text-gradient-gold mb-4">404</div>
        <h1 className="text-2xl font-bold text-primary font-display mb-2">الصفحة غير موجودة</h1>
        <p className="text-secondary mb-8">الصفحة التي تبحث عنها غير موجودة أو تم نقلها.</p>
        <Link to="/">
          <Button size="lg" className="gap-2">
            <Home className="w-5 h-5" />
            العودة للرئيسية
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
