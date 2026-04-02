import { useEffect, useState } from 'react';
import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ColorsPage from './pages/ColorsPage';
import GradesPage from './pages/GradesPage';
import NamesPage from './pages/NamesPage';
import ProverbsPage from './pages/ProverbsPage';
import SkillsPage from './pages/SkillsPage';
import StatesPage from './pages/StatesPage';
import WordsPage from './pages/WordsPage';

const navItems = [
  { to: '/', label: 'خانه', hint: 'Overview' },
  { to: '/colors', label: 'رنگ ها', hint: 'Colors' },
  { to: '/grades', label: 'رشته ها', hint: 'Grades' },
  { to: '/names', label: 'نام ها', hint: 'Names' },
  { to: '/proverbs', label: 'ضرب المثل', hint: 'Proverbs' },
  { to: '/skills', label: 'مهارت ها', hint: 'Skills' },
  { to: '/states', label: 'موقعیت ها', hint: 'States' },
  { to: '/words', label: 'متن ها', hint: 'Words' },
];

function getInitialTheme() {
  const saved = localStorage.getItem('theme-mode');
  if (saved === 'dark' || saved === 'light') {
    return saved;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function App() {
  const [theme, setTheme] = useState(getInitialTheme);
  const location = useLocation();

  useEffect(() => {
    const pageTitles = {
      '/': 'خانه',
      '/colors': 'رنگ ها',
      '/grades': 'رشته ها',
      '/names': 'نام ها',
      '/proverbs': 'ضرب المثل',
      '/skills': 'مهارت ها',
      '/states': 'موقعیت ها',
      '/words': 'متن ها',
    };

    const activeTitle = pageTitles[location.pathname] ?? 'خانه';
    document.title = `${activeTitle} | Data Explorer`;
  }, [location.pathname]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme-mode', theme);
  }, [theme]);

  return (
    <div className="mx-auto min-h-screen w-full max-w-7xl px-3 py-4 md:px-5">
      <div className="grid gap-3 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="animate-fade-up relative flex flex-col overflow-hidden rounded-2xl border border-borderc bg-[var(--sidebar)] p-3 backdrop-blur-sm sm:p-4 lg:sticky lg:top-4 lg:h-fit">
          <div className="pointer-events-none absolute -left-10 -top-10 h-28 w-28 rounded-full bg-secondary/20 blur-2xl" />

          <div className="relative mb-3 rounded-xl border border-borderc bg-cover p-3">
            <p className="text-xs tracking-wide text-[color:var(--white-light)]">SQL DASHBOARD</p>
            <h1 className="mt-1 text-xl font-bold text-secondary">Data Explorer</h1>
            <p className="mt-2 hidden text-sm text-[color:var(--white-light)] sm:block">مرور سریع دیتاست های SQL</p>
          </div>

          <nav className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:mx-0 lg:grid lg:gap-1.5 lg:overflow-visible lg:px-0 lg:pb-0">
            {navItems.map((item, index) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `group min-w-[138px] shrink-0 rounded-xl border px-3 py-2 transition lg:min-w-0 ${
                    isActive
                      ? 'border-secondary bg-cover2 text-secondary'
                      : 'border-transparent text-[color:var(--white-light)] hover:border-borderc hover:bg-cover'
                  }`
                }
              >
                <div className="flex items-center justify-between gap-3 lg:block">
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-[11px] text-[color:var(--white-light)]">{item.hint}</p>
                </div>
               
              </NavLink>
            ))}
          </nav>

          <div className="mt-3 flex items-center justify-end gap-2 border-t border-borderc pt-3 lg:mt-auto lg:justify-start lg:pt-4">
            <button
              type="button"
              aria-label="تغییر تم"
              title="تغییر تم"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-borderc bg-cover text-foreground transition hover:bg-cover2"
              onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
            >
              {theme === 'dark' ? (
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 stroke-current" fill="none" strokeWidth="1.8">
                  <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm0 4v-2m0-16V2m8 10h2M2 12h2m12.95 4.95 1.41 1.41M5.64 5.64l1.41 1.41m9.9-1.41 1.41-1.41M5.64 18.36l1.41-1.41" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 stroke-current" fill="none" strokeWidth="1.8">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3c-.04.33-.06.66-.06 1A8 8 0 0 0 20 12c.34 0 .67-.02 1-.06Z" />
                </svg>
              )}
            </button>

            <a
              href="https://github.com/ghaninia/databases"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub repository"
              title="GitHub"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-borderc bg-cover text-foreground transition hover:bg-cover2"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
                <path d="M12 .5C5.65.5.5 5.73.5 12.17c0 5.15 3.3 9.52 7.88 11.06.58.11.79-.26.79-.57v-2.24c-3.2.71-3.87-1.57-3.87-1.57-.52-1.35-1.28-1.7-1.28-1.7-1.05-.73.08-.71.08-.71 1.16.09 1.77 1.22 1.77 1.22 1.03 1.8 2.7 1.28 3.36.98.1-.76.4-1.28.72-1.57-2.55-.3-5.23-1.3-5.23-5.79 0-1.28.45-2.32 1.18-3.14-.12-.3-.51-1.52.11-3.16 0 0 .97-.32 3.18 1.2a10.7 10.7 0 0 1 5.8 0c2.2-1.52 3.17-1.2 3.17-1.2.63 1.64.24 2.86.12 3.16.73.82 1.18 1.86 1.18 3.14 0 4.5-2.69 5.49-5.26 5.78.41.37.78 1.1.78 2.22v3.29c0 .31.2.69.8.57a11.7 11.7 0 0 0 7.86-11.06C23.5 5.73 18.35.5 12 .5Z" />
              </svg>
            </a>
          </div>
        </aside>

        <main className="animate-fade-up">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/colors" element={<ColorsPage />} />
            <Route path="/grades" element={<GradesPage />} />
            <Route path="/names" element={<NamesPage />} />
            <Route path="/proverbs" element={<ProverbsPage />} />
            <Route path="/skills" element={<SkillsPage />} />
            <Route path="/states" element={<StatesPage />} />
            <Route path="/words" element={<WordsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
