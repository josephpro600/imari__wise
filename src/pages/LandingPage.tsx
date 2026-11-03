import { useEffect, useState } from 'react';
import { ArrowRight, BarChart3, PiggyBank, Target, Wallet, WalletCards } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useFormatters } from '@/hooks/useFormatters';
import { Link, useRouter } from '@/lib/router';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { LanguageSwitcher } from '@/components/app/LanguageSwitcher';
import type { TranslationKey } from '@/i18n/translations';

const HERO_IMAGE = 'https://images.pexels.com/photos/6862458/pexels-photo-6862458.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';
const CTA_IMAGE = 'https://images.pexels.com/photos/6694964/pexels-photo-6694964.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

const FEATURES: { icon: typeof Wallet; titleKey: TranslationKey; textKey: TranslationKey }[] = [
  { icon: Wallet, titleKey: 'feature1Title', textKey: 'feature1Text' },
  { icon: WalletCards, titleKey: 'feature2Title', textKey: 'feature2Text' },
  { icon: BarChart3, titleKey: 'feature3Title', textKey: 'feature3Text' },
  { icon: Target, titleKey: 'feature4Title', textKey: 'feature4Text' },
];

const STEPS: { titleKey: TranslationKey; textKey: TranslationKey }[] = [
  { titleKey: 'step1Title', textKey: 'step1Text' },
  { titleKey: 'step2Title', textKey: 'step2Text' },
  { titleKey: 'step3Title', textKey: 'step3Text' },
];

const STAT_KEYS: TranslationKey[] = ['heroStat1', 'heroStat2', 'heroStat3'];

function AuthActions({ size = 'md', tone = 'light' }: { size?: 'md' | 'lg'; tone?: 'light' | 'dark' }) {
  const { t } = useFormatters();
  const { user } = useAuth();
  const { navigate } = useRouter();

  if (user) {
    return (
      <Button size={size} className="gap-2" onClick={() => navigate('/app/dashboard')}>
        {t('openDashboard')}
        <ArrowRight className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button size={size} variant={tone === 'light' ? 'secondary' : 'ghost'} onClick={() => navigate('/login')}>
        {t('login')}
      </Button>
      <Button size={size} className="gap-2" onClick={() => navigate('/register')}>
        {t('register')}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

function LandingHeader() {
  const { t } = useFormatters();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-all duration-300 ${
        scrolled ? 'border-stone-200 bg-white/95 shadow-sm backdrop-blur' : 'border-transparent bg-white'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-6 py-4 lg:px-8">
        <Link to="/" aria-label={t('appName')}>
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm font-semibold text-stone-600 transition hover:text-primary-700">
            {t('landingNavFeatures')}
          </a>
          <a href="#how" className="text-sm font-semibold text-stone-600 transition hover:text-primary-700">
            {t('landingNavHow')}
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <div className="hidden sm:block">
            <AuthActions size="md" />
          </div>
        </div>
      </div>
    </header>
  );
}

function HeroSection() {
  const { t } = useFormatters();

  return (
    <section className="relative overflow-hidden bg-stone-50">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 pb-20 pt-16 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:pb-28 lg:pt-24">
        <div className="fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5 text-sm font-semibold text-primary-800">
            <span className="h-2 w-2 rounded-full bg-success-500" />
            {t('heroBadge')}
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-[1.15] tracking-tight text-stone-900 sm:text-5xl lg:text-6xl">
            {t('heroTitle')}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-stone-600">{t('heroSubtitle')}</p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <AuthActions size="lg" />
          </div>

          <ul className="mt-12 grid gap-4 border-t border-stone-200 pt-8 sm:grid-cols-3">
            {STAT_KEYS.map((key) => (
              <li key={key} className="text-sm font-medium leading-snug text-stone-600">
                {t(key)}
              </li>
            ))}
          </ul>
        </div>

        <div className="fade-in relative">
          <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-primary-100/70" />
          <div className="overflow-hidden rounded-3xl shadow-2xl ring-1 ring-stone-900/5">
            <img
              src={HERO_IMAGE}
              alt=""
              className="aspect-[4/5] w-full object-cover sm:aspect-[5/4]"
              loading="eager"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const { t } = useFormatters();

  return (
    <section id="features" className="scroll-mt-24 bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl">{t('featuresTitle')}</h2>
          <p className="mt-4 text-lg text-stone-600">{t('featuresSubtitle')}</p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, titleKey, textKey }) => (
            <article
              key={titleKey}
              className="group rounded-2xl border border-stone-200 bg-stone-50 p-6 transition duration-300 hover:-translate-y-1 hover:border-primary-200 hover:bg-white hover:shadow-lg"
            >
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary-700 text-white transition group-hover:bg-accent-500 group-hover:text-stone-900">
                <Icon className="h-6 w-6" strokeWidth={2.2} />
              </span>
              <h3 className="mt-5 text-lg font-bold text-stone-900">{t(titleKey)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">{t(textKey)}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowSection() {
  const { t } = useFormatters();

  return (
    <section id="how" className="scroll-mt-24 bg-stone-50 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <h2 className="text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl">{t('howTitle')}</h2>
            <div className="mt-8 overflow-hidden rounded-3xl shadow-xl">
              <img
                src="https://images.pexels.com/photos/6693652/pexels-photo-6693652.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                alt=""
                className="aspect-[4/3] w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>

          <ol className="space-y-6">
            {STEPS.map(({ titleKey, textKey }, index) => (
              <li
                key={titleKey}
                className="flex gap-5 rounded-2xl border border-stone-200 bg-white p-6 transition duration-300 hover:shadow-md"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-accent-400 text-lg font-extrabold text-stone-900">
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-stone-900">{t(titleKey)}</h3>
                  <p className="mt-2 leading-relaxed text-stone-600">{t(textKey)}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  const { t } = useFormatters();

  return (
    <section className="bg-white px-6 py-20 lg:px-8 lg:py-28">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-primary-900">
        <img src={CTA_IMAGE} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" loading="lazy" />
        <div className="relative grid items-center gap-8 px-8 py-16 sm:px-14 lg:grid-cols-[1.4fr_1fr] lg:py-20">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{t('ctaTitle')}</h2>
            <p className="mt-4 max-w-xl text-lg text-primary-100">{t('ctaText')}</p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <AuthActions size="lg" tone="light" />
          </div>
        </div>
      </div>
    </section>
  );
}

function LandingFooter() {
  const { t } = useFormatters();

  return (
    <footer className="border-t border-stone-200 bg-stone-50">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-10 text-center sm:flex-row sm:text-left lg:px-8">
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <Logo />
          <p className="text-sm text-stone-600">{t('footerTagline')}</p>
        </div>
        <p className="text-sm text-stone-500">
          &copy; {new Date().getFullYear()} {t('appName')}. {t('footerRights')}
        </p>
      </div>
    </footer>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-stone-900">
      <LandingHeader />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowSection />
        <CtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}
