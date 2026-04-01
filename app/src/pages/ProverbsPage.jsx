import { useEffect, useMemo, useState } from 'react';
import { dataStore } from '../lib/dataStore';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 40;

export default function ProverbsPage() {
  const [query, setQuery] = useState('');
  const [startLetter, setStartLetter] = useState('all');
  const [size, setSize] = useState('all');
  const [sort, setSort] = useState('default');
  const [page, setPage] = useState(1);

  const letters = useMemo(() => {
    const set = new Set();
    dataStore.proverbs.forEach((item) => {
      const first = String(item).trim().charAt(0);
      if (first) {
        set.add(first);
      }
    });
    return ['all', ...Array.from(set).sort((a, b) => a.localeCompare(b, 'fa'))];
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    const list = dataStore.proverbs.filter((item) => {
      const text = String(item).trim();
      const wordsCount = text.split(/\s+/).filter(Boolean).length;
      const matchQuery = !q || text.toLowerCase().includes(q);
      const matchLetter = startLetter === 'all' || text.charAt(0) === startLetter;
      const matchSize =
        size === 'all' ||
        (size === 'short' && wordsCount <= 5) ||
        (size === 'medium' && wordsCount > 5 && wordsCount <= 10) ||
        (size === 'long' && wordsCount > 10);
      return matchQuery && matchLetter && matchSize;
    });

    if (sort === 'length') {
      return [...list].sort((a, b) => String(a).length - String(b).length);
    }

    if (sort === 'alphabet') {
      return [...list].sort((a, b) => String(a).localeCompare(String(b), 'fa'));
    }

    return list;
  }, [query, startLetter, size, sort]);

  useEffect(() => {
    setPage(1);
  }, [query, startLetter, size, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const items = filtered.slice(start, start + PAGE_SIZE);

  return (
    <section className="space-y-4">
      <div className="animate-fade-up flex items-center justify-between rounded-2xl border border-borderc bg-cover px-5 py-4">
        <h2 className="text-xl font-bold text-secondary">Proverbs</h2>
        <p className="text-sm text-[color:var(--white-light)]">{filtered.length.toLocaleString('fa-IR')} ضرب‌المثل</p>
      </div>

      <div className="grid gap-3 rounded-2xl border border-borderc bg-cover p-4 sm:grid-cols-2 xl:grid-cols-4">
        <input
          className="rounded-xl border border-borderc bg-cover2 px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-[color:var(--white-light)] focus:border-secondary sm:col-span-2"
          placeholder="جستجو در متن ضرب‌المثل"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <select
          className="rounded-xl border border-borderc bg-cover2 px-3 py-3 text-sm text-foreground outline-none transition focus:border-secondary"
          value={startLetter}
          onChange={(event) => setStartLetter(event.target.value)}
        >
          {letters.map((item) => (
            <option key={item} value={item}>
              {item === 'all' ? 'حرف شروع: همه' : `شروع با: ${item}`}
            </option>
          ))}
        </select>
        <select
          className="rounded-xl border border-borderc bg-cover2 px-3 py-3 text-sm text-foreground outline-none transition focus:border-secondary"
          value={size}
          onChange={(event) => setSize(event.target.value)}
        >
          <option value="all">اندازه: همه</option>
          <option value="short">کوتاه (تا ۵ کلمه)</option>
          <option value="medium">متوسط (۶ تا ۱۰ کلمه)</option>
          <option value="long">بلند (بیشتر از ۱۰ کلمه)</option>
        </select>
        <select
          className="rounded-xl border border-borderc bg-cover2 px-3 py-3 text-sm text-foreground outline-none transition focus:border-secondary"
          value={sort}
          onChange={(event) => setSort(event.target.value)}
        >
          <option value="default">مرتب‌سازی: پیش‌فرض</option>
          <option value="alphabet">مرتب‌سازی: الفبایی</option>
          <option value="length">مرتب‌سازی: طول متن</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="rounded-full border border-borderc bg-cover px-3 py-1 text-xs">
          کل: {dataStore.proverbs.length.toLocaleString('fa-IR')}
        </span>
        <span className="rounded-full border border-borderc bg-cover px-3 py-1 text-xs">
          نتیجه: {filtered.length.toLocaleString('fa-IR')}
        </span>
      </div>

      <ol className="space-y-2">
        {items.map((item, index) => (
          <li key={`${item}-${index}`} className="animate-fade-up rounded-xl border border-borderc bg-cover px-4 py-3 text-sm leading-7">
            {item}
          </li>
        ))}
      </ol>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </section>
  );
}
