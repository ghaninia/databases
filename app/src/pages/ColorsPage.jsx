import { useEffect, useMemo, useState } from 'react';
import { dataStore } from '../lib/dataStore';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 24;

export default function ColorsPage() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return dataStore.colors;
    }

    return dataStore.colors.filter((item) => {
      return [item.fa, item.en, item.hex].some((value) => String(value).toLowerCase().includes(q));
    });
  }, [query]);

  useEffect(() => {
    setPage(1);
  }, [query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const items = filtered.slice(start, start + PAGE_SIZE);

  return (
    <section className="space-y-4">
      <div className="animate-fade-up flex items-center justify-between rounded-2xl border border-borderc bg-cover px-5 py-4">
        <h2 className="text-xl font-bold text-secondary">Colors</h2>
        <p className="text-sm text-[color:var(--white-light)]">{filtered.length.toLocaleString('fa-IR')} رنگ</p>
      </div>

      <input
        className="w-full rounded-xl border border-borderc bg-cover px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-[color:var(--white-light)] focus:border-secondary"
        placeholder="جستجو بر اساس نام فارسی، انگلیسی یا کد رنگ"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item, index) => (
          <article
            className="animate-fade-up overflow-hidden rounded-2xl border border-borderc bg-cover"
            key={`${item.hex}-${item.en}-${index}`}
          >
            <div className="h-24" style={{ backgroundColor: item.hex }} />
            <div className="space-y-1 p-4">
              <h3 className="font-semibold text-foreground">{item.fa}</h3>
              <p className="text-sm text-[color:var(--white-light)]">{item.en}</p>
              <code className="inline-block rounded-md bg-cover2 px-2 py-1 text-xs">{item.hex}</code>
            </div>
          </article>
        ))}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </section>
  );
}
