import { useEffect, useMemo, useState } from 'react';
import { dataStore } from '../lib/dataStore';
import { getCombinedAdvancedMatch, tokenizeAdvancedQuery } from '../lib/advancedNameSearch';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 18;

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

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const items = filtered.slice(start, start + PAGE_SIZE);

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
          <p className="rounded-full border border-borderc bg-cover2 px-3 py-1 text-sm text-[color:var(--white-light)]">
            {filtered.length.toLocaleString('fa-IR')} نام
          </p>
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
              {advancedEnabled && item._advancedMatch ? (
                <span className="rounded-full border border-secondary/60 bg-cover2 px-2.5 py-1 text-[11px] text-secondary">
                  {item._advancedMatch.score.toLocaleString('fa-IR')}٪
                </span>
              ) : null}
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
    </section>
  );
}
