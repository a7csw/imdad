import { forwardRef, type SelectHTMLAttributes } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { IRAQI_CITIES, type IraqiCity } from '@/data/iraqiCities';

interface CitySelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

function getCityName(city: IraqiCity, lang: string): string {
  if (lang.startsWith('ku')) return city.ku;
  if (lang.startsWith('ar')) return city.ar;
  return city.en;
}

const CitySelect = forwardRef<HTMLSelectElement, CitySelectProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const { t, i18n } = useTranslation();
    const lang = i18n.language;
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-') ?? 'city-select';
    const isRtl = lang.startsWith('ar') || lang.startsWith('ku');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-primary">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          dir={isRtl ? 'rtl' : 'ltr'}
          className={cn(
            'w-full bg-surface border border-default text-primary rounded-xl px-4 py-2.5 text-sm',
            'transition-all duration-200',
            'focus:outline-none focus:border-gold focus:ring-[3px] focus:ring-gold/20',
            'hover:border-strong',
            error && 'border-accent focus:border-accent focus:ring-accent/20',
            className
          )}
          {...props}
        >
          <option value="">{t('auth.selectCity')}</option>
          {IRAQI_CITIES.map((city) => (
            <option key={city.value} value={city.value}>
              {getCityName(city, lang)}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-accent">{error}</p>}
      </div>
    );
  }
);

CitySelect.displayName = 'CitySelect';
export default CitySelect;
