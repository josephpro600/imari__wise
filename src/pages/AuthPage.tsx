import { useState, type FormEvent } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useFormatters } from '@/hooks/useFormatters';
import { Link } from '@/lib/router';
import type { TranslationKey } from '@/i18n/translations';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';

type AuthMode = 'login' | 'register';

interface AuthPageProps {
  mode: AuthMode;
}

const HERO_IMAGE = 'https://images.pexels.com/photos/6963026/pexels-photo-6963026.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

function mapAuthError(error: unknown): TranslationKey {
  const message = error instanceof Error ? error.message : '';
  if (/invalid login credentials/i.test(message)) return 'invalidCredentials';
  if (/already registered|already exists/i.test(message)) return 'userExists';
  if (/at least 6 characters|password should be/i.test(message)) return 'weakPassword';
  return 'genericError';
}

export function AuthPage({ mode }: AuthPageProps) {
  const { t } = useFormatters();
  const { signIn, signUp } = useAuth();
  const isLogin = mode === 'login';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorKey, setErrorKey] = useState<TranslationKey | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorKey(null);
    setSubmitting(true);
    try {
      if (isLogin) {
        await signIn(email.trim(), password);
      } else {
        await signUp(fullName.trim(), email.trim(), password);
      }
    } catch (error) {
      console.error(error);
      setErrorKey(mapAuthError(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-primary-900 lg:block">
        <img src={HERO_IMAGE} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-950/90 via-primary-900/40 to-transparent" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link to="/" className="inline-flex w-fit items-center gap-2 text-white">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-semibold">{t('backHome')}</span>
          </Link>
          <p className="max-w-md text-2xl font-bold leading-snug text-white">{t('heroSubtitle')}</p>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-12 sm:px-12">
        <div className="fade-up w-full max-w-md">
          <div className="mb-10 flex items-center justify-between">
            <Link to="/" aria-label={t('appName')}>
              <Logo />
            </Link>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-stone-900">
            {isLogin ? t('loginTitle') : t('registerTitle')}
          </h1>
          <p className="mt-2 text-stone-600">{isLogin ? t('loginSubtitle') : t('registerSubtitle')}</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
            {!isLogin && (
              <FormField label={t('fullName')} htmlFor="auth-name">
                <input
                  id="auth-name"
                  type="text"
                  autoComplete="name"
                  required
                  maxLength={80}
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="field-input"
                />
              </FormField>
            )}

            <FormField label={t('email')} htmlFor="auth-email">
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="field-input"
              />
            </FormField>

            <FormField label={t('password')} htmlFor="auth-password">
              <input
                id="auth-password"
                type="password"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                required
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="field-input"
              />
              {!isLogin && <p className="text-xs text-stone-500">{t('passwordHint')}</p>}
            </FormField>

            {errorKey && (
              <p role="alert" className="rounded-xl bg-error-50 px-4 py-3 text-sm font-medium text-error-700">
                {t(errorKey)}
              </p>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? t('loading') : isLogin ? t('submitLogin') : t('submitRegister')}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-stone-600">
            {isLogin ? t('noAccount') : t('haveAccount')}{' '}
            <Link
              to={isLogin ? '/register' : '/login'}
              className="font-semibold text-primary-700 hover:text-primary-900"
            >
              {isLogin ? t('register') : t('login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
