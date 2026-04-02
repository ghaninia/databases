import { useEffect, useMemo, useState } from 'react';
import { dataStore } from '../lib/dataStore';
import { getCombinedAdvancedMatch, tokenizeAdvancedQuery } from '../lib/advancedNameSearch';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 18;
const FAVORITES_STORAGE_KEY = 'favorite-names-v1';

function getNameKey(item) {
  return `${String(item.persian_name)}|${String(item.english_name)}`;
}

function HeartIcon({ filled, className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} className={className} aria-hidden="true">
      <path
        d="M12 21s-6.716-4.35-9.193-8.088C.86 9.912 2.09 6 6.03 6c2.157 0 3.414 1.157 3.97 2.09C10.556 7.157 11.813 6 13.97 6c3.94 0 5.17 3.912 3.223 6.912C18.716 16.65 12 21 12 21z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function NamesPage() {
  const [query, setQuery] = useState('');
  const [advancedQuery, setAdvancedQuery] = useState('');
  const [advancedEnabled, setAdvancedEnabled] = useState(false);
  const [advancedExpanded, setAdvancedExpanded] = useState(false);
  const [advancedThreshold, setAdvancedThreshold] = useState(55);
  const [gender, setGender] = useState('all');
  const [registered, setRegistered] = useState('all');
  const [origin, setOrigin] = useState('all');
  const [sort, setSort] = useState('name');
  const [page, setPage] = useState(1);
  const [likedNameKeys, setLikedNameKeys] = useState([]);
  const [favoritesModalOpen, setFavoritesModalOpen] = useState(false);

  const advancedTerms = useMemo(() => tokenizeAdvancedQuery(advancedQuery), [advancedQuery]);

  const origins = useMemo(() => {
    const set = new Set();
    dataStore.names.forEach((item) => {
      String(item.origin ?? '')
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean)
        .forEach((part) => set.add(part));
    });
    return ['all', ...Array.from(set).sort((a, b) => a.localeCompare(b, 'fa'))];
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = dataStore.names.filter((item) => {
      const matchGender = gender === 'all' || String(item.gender) === gender;
      const matchRegistered =
        registered === 'all' ||
        (registered === 'yes' ? Boolean(item.registered) : !Boolean(item.registered));
      const matchOrigin = origin === 'all' || String(item.origin).split(',').map((part) => part.trim()).includes(origin);
      const matchQuery =
        !q ||
        [item.persian_name, item.english_name, item.origin, item.pronunciation, item.description]
          .join(' ')
          .toLowerCase()
          .includes(q);

      return matchGender && matchRegistered && matchOrigin && matchQuery;
    });

    if (advancedEnabled) {
      list = list
        .map((item) => {
          const advancedMatch = getCombinedAdvancedMatch(item.persian_name, advancedTerms);
          return {
            ...item,
            _advancedMatch: advancedMatch,
          };
        });
    }

    if (advancedEnabled && advancedTerms.length > 0) {
      list = list.filter((item) => item._advancedMatch.score >= advancedThreshold);
    }

    if (advancedEnabled && advancedTerms.length > 0) {
      return [...list].sort((a, b) => {
        const scoreDelta = Number(b._advancedMatch?.score ?? 0) - Number(a._advancedMatch?.score ?? 0);
        if (scoreDelta !== 0) {
          return scoreDelta;
        }
        return String(a.persian_name).localeCompare(String(b.persian_name), 'fa');
      });
    }

    if (sort === 'abjad') {
      return [...list].sort((a, b) => Number(a.abjad ?? 0) - Number(b.abjad ?? 0));
    }

    if (sort === 'registered') {
      return [...list].sort((a, b) => Number(Boolean(b.registered)) - Number(Boolean(a.registered)));
    }

    return [...list].sort((a, b) => String(a.persian_name).localeCompare(String(b.persian_name), 'fa'));
  }, [query, gender, registered, origin, sort, advancedEnabled, advancedTerms, advancedThreshold]);

  useEffect(() => {
    setPage(1);
  }, [query, gender, registered, origin, sort, advancedEnabled, advancedQuery, advancedThreshold]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setLikedNameKeys(parsed.filter((item) => typeof item === 'string'));
      }
    } catch {
      setLikedNameKeys([]);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(likedNameKeys));
    } catch {
      // Ignore storage errors (e.g., private mode quota)
    }
  }, [likedNameKeys]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const items = filtered.slice(start, start + PAGE_SIZE);
  const favoriteNames = useMemo(() => {
    const likesSet = new Set(likedNameKeys);
    return dataStore.names.filter((item) => likesSet.has(getNameKey(item)));
  }, [likedNameKeys]);

  function toggleLike(item) {
    const key = getNameKey(item);
    setLikedNameKeys((prev) => {
      if (prev.includes(key)) {
        return prev.filter((entry) => entry !== key);
      }
      return [...prev, key];
    });
  }

  function isLiked(item) {
    return likedNameKeys.includes(getNameKey(item));
  }

  function resetAllFilters() {
    setQuery('');
    setAdvancedQuery('');
    setAdvancedEnabled(false);
    setAdvancedExpanded(false);
    setAdvancedThreshold(55);
    setGender('all');
    setRegistered('all');
    setOrigin('all');
    setSort('name');
  }

  return (
    <section className="space-y-4">
      <div className="animate-fade-up relative overflow-hidden rounded-2xl border border-borderc bg-cover px-5 py-4">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              'radial-gradient(1200px 220px at 95% 10%, rgba(245,183,84,0.22), transparent 58%), radial-gradient(900px 220px at 10% 100%, rgba(233,88,52,0.2), transparent 56%)',
          }}
        />
        <div className="relative flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-secondary">Names</h2>
            <p className="mt-1 text-xs text-[color:var(--white-light)]">جستجوی هوشمند نام با فیلترهای ترکیبی</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full border border-secondary bg-cover2 px-3 py-1 text-xs text-secondary transition hover:bg-cover"
              onClick={() => setFavoritesModalOpen(true)}
            >
              <HeartIcon filled className="h-3.5 w-3.5" />
              علاقه مندی ها: {favoriteNames.length.toLocaleString('fa-IR')}
            </button>
            <p className="rounded-full border border-borderc bg-cover2 px-3 py-1 text-sm text-[color:var(--white-light)]">
              {filtered.length.toLocaleString('fa-IR')} نام
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border border-borderc bg-cover p-4">
        <div className="grid gap-3">
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-[color:var(--white-light)]">
              جستجو
            </span>
            <input
              className="h-12 w-full rounded-xl border border-borderc bg-cover2 px-4 pr-16 text-sm text-foreground outline-none transition placeholder:text-[color:var(--white-light)] focus:border-secondary"
              placeholder="نام، ریشه، تلفظ"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <select
            className="h-12 w-full rounded-xl border border-borderc bg-cover2 px-3 text-sm text-foreground outline-none transition focus:border-secondary"
            value={gender}
            onChange={(event) => setGender(event.target.value)}
          >
            <option value="all">جنسیت: همه</option>
            <option value="male">جنسیت: مذکر</option>
            <option value="female">جنسیت: مونث</option>
          </select>
          <select
            className="h-12 w-full rounded-xl border border-borderc bg-cover2 px-3 text-sm text-foreground outline-none transition focus:border-secondary"
            value={registered}
            onChange={(event) => setRegistered(event.target.value)}
          >
            <option value="all">ثبت احوال: همه</option>
            <option value="yes">ثبت احوال: بله</option>
            <option value="no">ثبت احوال: خیر</option>
          </select>
          <select
            className="h-12 w-full rounded-xl border border-borderc bg-cover2 px-3 text-sm text-foreground outline-none transition focus:border-secondary"
            value={origin}
            onChange={(event) => setOrigin(event.target.value)}
          >
            {origins.map((item) => (
              <option key={item} value={item}>
                {item === 'all' ? 'ریشه: همه' : `ریشه: ${item}`}
              </option>
            ))}
          </select>
          <select
            className="h-12 w-full rounded-xl border border-borderc bg-cover2 px-3 text-sm text-foreground outline-none transition focus:border-secondary"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          >
            <option value="name">مرتب‌سازی: نام</option>
            <option value="abjad">مرتب‌سازی: ابجد</option>
            <option value="registered">مرتب‌سازی: ثبت احوال</option>
          </select>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            className={`h-12 w-full rounded-xl border px-4 text-sm transition ${
              advancedExpanded
                ? 'border-secondary bg-cover2 text-secondary'
                : 'border-borderc bg-cover2 text-[color:var(--white-light)] hover:border-secondary hover:text-secondary'
            }`}
            onClick={() => {
              setAdvancedExpanded((value) => {
                const next = !value;
                setAdvancedEnabled(next);
                return next;
              });
            }}
          >
            {advancedExpanded ? 'بستن جستجوی پیشرفته' : 'جستجوی پیشرفته'}
          </button>

          <button
            type="button"
            className="h-12 w-full rounded-xl border border-[color:var(--red)] bg-[color:rgba(233,88,52,0.1)] px-4 text-sm text-[color:var(--red)] transition hover:bg-[color:var(--red)] hover:text-[color:var(--white)]"
            onClick={resetAllFilters}
          >
            پاکسازی فیلتر
          </button>
        </div>

        {advancedExpanded ? (
          <div className="rounded-xl border border-borderc bg-cover2 p-3">

            <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
              <div className="space-y-2">
                <input
                  className="w-full rounded-xl border border-borderc bg-cover px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-[color:var(--white-light)] focus:border-secondary disabled:opacity-50"
                  placeholder="مثال: احسان / سحر"
                  value={advancedQuery}
                  onChange={(event) => setAdvancedQuery(event.target.value)}
                  disabled={!advancedEnabled}
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-full border border-borderc bg-cover px-3 py-1 text-xs text-[color:var(--white-light)] transition hover:border-secondary hover:text-secondary"
                    onClick={() => setAdvancedQuery('احسان / سحر')}
                    disabled={!advancedEnabled}
                  >
                    نمونه ۱
                  </button>
                </div>
              </div>

              <div className="space-y-2 rounded-xl border border-borderc bg-cover p-3">
                <div className="flex items-center justify-between text-xs text-[color:var(--white-light)]">
                  <span>حداقل مچ</span>
                  <span className="text-secondary">{advancedThreshold.toLocaleString('fa-IR')}٪</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="90"
                  step="5"
                  value={advancedThreshold}
                  onChange={(event) => setAdvancedThreshold(Number(event.target.value))}
                  disabled={!advancedEnabled}
                  className="w-full accent-[var(--secondary)]"
                />
                <div className="flex items-center justify-between text-[10px] text-[color:var(--white-light)]">
                  <span>نرم</span>
                  <span>دقیق</span>
                </div>
              </div>
            </div>

            {advancedEnabled && advancedTerms.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {advancedTerms.map((term) => (
                  <span key={term} className="rounded-full border border-secondary/40 bg-cover px-3 py-1 text-xs text-secondary">
                    {term}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-borderc bg-cover p-8 text-center">
          <p className="text-base text-secondary">نتیجه ای پیدا نشد</p>
          <p className="mt-2 text-sm text-[color:var(--white-light)]">
            مقدار جستجو را کوتاه تر کنید یا حداقل درصد مچ را کمتر بگذارید.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
          <article
            className="animate-fade-up rounded-2xl border border-borderc bg-cover p-4 transition hover:-translate-y-0.5 hover:border-secondary/50"
            key={`${item.persian_name}-${item.english_name}`}
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-lg font-semibold text-secondary">{item.persian_name}</h3>
              <div className="flex items-center gap-2">
                {advancedEnabled && item._advancedMatch ? (
                  <span className="rounded-full border border-secondary/60 bg-cover2 px-2.5 py-1 text-[11px] text-secondary">
                    {item._advancedMatch.score.toLocaleString('fa-IR')}٪
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={() => toggleLike(item)}
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] transition ${
                    isLiked(item)
                      ? 'border-[color:var(--red)] bg-[color:rgba(233,88,52,0.1)] text-[color:var(--red)]'
                      : 'border-borderc bg-cover2 text-[color:var(--white-light)] hover:border-secondary hover:text-secondary'
                  }`}
                >
                  <HeartIcon filled={isLiked(item)} className="h-3.5 w-3.5" />
                  {isLiked(item) ? 'لایک شده' : 'لایک'}
                </button>
              </div>
            </div>
            <p className="mt-2 text-sm leading-7 text-[color:var(--white-light)]">{item.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-borderc bg-cover2 px-3 py-1 text-xs">{item.english_name}</span>
              <span className="rounded-full border border-borderc bg-cover2 px-3 py-1 text-xs">{item.origin}</span>
              <span className="rounded-full border border-borderc bg-cover2 px-3 py-1 text-xs">{item.gender}</span>
              <span className="rounded-full border border-borderc bg-cover2 px-3 py-1 text-xs">ابجد: {item.abjad}</span>
              <span className="rounded-full border border-borderc bg-cover2 px-3 py-1 text-xs">تلفظ: {item.pronunciation}</span>
              {advancedEnabled && item._advancedMatch ? (
                <span className="rounded-full border border-secondary bg-cover2 px-3 py-1 text-xs text-secondary">
                  مچ ترکیبی: {item._advancedMatch.score.toLocaleString('fa-IR')}٪ ({item._advancedMatch.matchedTerms.toLocaleString('fa-IR')} از {item._advancedMatch.totalTerms.toLocaleString('fa-IR')} کلمه)
                </span>
              ) : null}
              <span className="rounded-full border border-borderc bg-cover2 px-3 py-1 text-xs">
                {item.registered ? 'ثبت احوال: بله' : 'ثبت احوال: خیر'}
              </span>
            </div>
          </article>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {favoritesModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => setFavoritesModalOpen(false)}
        >
          <div
            className="max-h-[82vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-borderc bg-[color:var(--primary)] shadow-[0_28px_80px_rgba(0,0,0,0.45)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-borderc px-4 py-3">
              <h3 className="text-base font-semibold text-secondary">
                لیست علاقه مندی ها ({favoriteNames.length.toLocaleString('fa-IR')})
              </h3>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-lg border border-borderc bg-cover2 px-3 py-1.5 text-xs text-[color:var(--white-light)] transition hover:border-secondary hover:text-secondary"
                onClick={() => setFavoritesModalOpen(false)}
              >
                <CloseIcon className="h-3.5 w-3.5" />
                بستن
              </button>
            </div>

            <div className="max-h-[60vh] space-y-2 overflow-y-auto p-4">
              {favoriteNames.length === 0 ? (
                <p className="rounded-xl border border-borderc bg-cover p-4 text-center text-sm text-[color:var(--white-light)]">
                  هنوز نامی را لایک نکرده اید.
                </p>
              ) : (
                favoriteNames.map((item) => (
                  <div
                    key={getNameKey(item)}
                    className="flex items-center justify-between rounded-xl border border-borderc bg-cover p-3"
                  >
                    <div>
                      <p className="font-medium text-secondary">{item.persian_name}</p>
                      <p className="mt-1 text-xs text-[color:var(--white-light)]">
                        {item.english_name} - {item.origin}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-lg border border-[color:var(--red)] bg-[color:rgba(233,88,52,0.1)] px-3 py-1.5 text-xs text-[color:var(--red)] transition hover:bg-[color:var(--red)] hover:text-[color:var(--white)]"
                      onClick={() => toggleLike(item)}
                    >
                      <HeartIcon filled className="h-3.5 w-3.5" />
                      حذف از لیست
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
