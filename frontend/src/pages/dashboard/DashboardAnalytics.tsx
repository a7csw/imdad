import { useTranslation } from 'react-i18next';

export default function DashboardAnalytics() {
  const { t } = useTranslation();
  return (
    <div>
      <h1 className="text-xl font-bold font-display text-primary mb-6">{t('dashboard.analytics')}</h1>
      <div className="bg-surface border border-default rounded-2xl p-8 text-center text-secondary">
        <p>{t('dashboard.analytics_soon')}</p>
      </div>
    </div>
  );
}
