import { useEffect, useMemo, useState } from 'react';
import { dataStore } from '../lib/dataStore';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 18;

export default function NamesPage() {
  const [query, setQuery] = useState('');
  const [gender, setGender] = useState('all');
  const [registered, setRegistered] = useState('all');
  const [origin, setOrigin] = useState('all');
  const [sort, setSort] = useState('name');
  const [page, setPage] = useState(1);

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

    const list = dataStore.names.filter((item) => {
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

    if (sort === 'abjad') {
      return [...list].sort((a, b) => Number(a.abjad ?? 0) - Number(b.abjad ?? 0));
    }

    if (sort === 'registered') {
      return [...list].sort((a, b) => Number(Boolean(b.registered)) - Number(Boolean(a.registered)));
    }

    return [...list].sort((a, b) => String(a.persian_name).localeCompare(String(b.persian_name), 'fa'));
  }, [query, gender, registered, origin, sort]);

  useEffect(() => {
    setPage(1);
  }, [query, gender, registered, origin, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const items = filtered.slice(start, start + PAGE_SIZE);

  return (
    <section className="space-y-4">
      <div className="animate-fade-up flex items-center justify-between rounded-2xl border border-borderc bg-cover px-5 py-4">
        <h2 className="text-xl font-bold text-secondary">Names</h2>
        <p className="text-sm text-[color:var(--white-light)]">{filtered.length.toLocaleString('fa-IR')} نام</p>
      </div>

      <div className="grid gap-3 rounded-2xl border border-borderc bg-cover p-4 sm:grid-cols-2 xl:grid-cols-4">
        <input
          className="w-full rounded-xl border border-borderc bg-cover2 px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-[color:var(--white-light)] focus:border-secondary sm:col-span-2"
          placeholder="جستجو در نام، ریشه، تلفظ"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <select
          className="rounded-xl border border-borderc bg-cover2 px-3 py-3 text-sm text-foreground outline-none transition focus:border-secondary"
          value={gender}
          onChange={(event) => setGender(event.target.value)}
        >
          <option value="all">همه</option>
          <option value="male">مذکر</option>
          <option value="female">مونث</option>
        </select>
        <select
          className="rounded-xl border border-borderc bg-cover2 px-3 py-3 text-sm text-foreground outline-none transition focus:border-secondary"
          value={registered}
          onChange={(event) => setRegistered(event.target.value)}
        >
          <option value="all">ثبت احوال: همه</option>
          <option value="yes">ثبت احوال: بله</option>
          <option value="no">ثبت احوال: خیر</option>
        </select>
        <select
          className="rounded-xl border border-borderc bg-cover2 px-3 py-3 text-sm text-foreground outline-none transition focus:border-secondary"
          value={origin}
          onChange={(event) => setOrigin(event.target.value)}
        >
          {origins.map((item) => (
            <option key={item} value={item}>
              {item === 'all' ? 'ریشه: همه' : item}
            </option>
          ))}
        </select>
        <select
          className="rounded-xl border border-borderc bg-cover2 px-3 py-3 text-sm text-foreground outline-none transition focus:border-secondary"
          value={sort}
          onChange={(event) => setSort(event.target.value)}
        >
          <option value="name">مرتب‌سازی: نام</option>
          <option value="abjad">مرتب‌سازی: ابجد</option>
          <option value="registered">مرتب‌سازی: ثبت احوال</option>
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <article
            className="animate-fade-up rounded-2xl border border-borderc bg-cover p-4"
            key={`${item.persian_name}-${item.english_name}`}
          >
            <h3 className="text-lg font-semibold text-secondary">{item.persian_name}</h3>
            <p className="mt-2 text-sm leading-7 text-[color:var(--white-light)]">{item.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-borderc bg-cover2 px-3 py-1 text-xs">{item.english_name}</span>
              <span className="rounded-full border border-borderc bg-cover2 px-3 py-1 text-xs">{item.origin}</span>
              <span className="rounded-full border border-borderc bg-cover2 px-3 py-1 text-xs">{item.gender}</span>
              <span className="rounded-full border border-borderc bg-cover2 px-3 py-1 text-xs">ابجد: {item.abjad}</span>
              <span className="rounded-full border border-borderc bg-cover2 px-3 py-1 text-xs">تلفظ: {item.pronunciation}</span>
              <span className="rounded-full border border-borderc bg-cover2 px-3 py-1 text-xs">
                {item.registered ? 'ثبت احوال: بله' : 'ثبت احوال: خیر'}
              </span>
            </div>
          </article>
        ))}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </section>
  );
}
