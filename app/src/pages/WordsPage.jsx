import { useEffect, useMemo, useState } from 'react';
import { dataStore } from '../lib/dataStore';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 12;

export default function WordsPage() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return dataStore.words;
    }

    return dataStore.words.filter((item) => {
      const tagsText = Array.isArray(item.tags) ? item.tags.join(' ') : '';
      return `${item.text} ${tagsText}`.toLowerCase().includes(q);
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
        <h2 className="text-xl font-bold text-secondary">Words</h2>
        <p className="text-sm text-[color:var(--white-light)]">{filtered.length.toLocaleString('fa-IR')} متن</p>
      </div>

      <input
        className="w-full rounded-xl border border-borderc bg-cover px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-[color:var(--white-light)] focus:border-secondary"
        placeholder="جستجو در متن یا تگ"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item, index) => (
          <article className="animate-fade-up rounded-2xl border border-borderc bg-cover p-4" key={`${index}-${item.text.slice(0, 24)}`}>
            <p className="text-sm leading-7">{item.text}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(item.tags ?? []).map((tag) => (
                <span key={tag} className="rounded-full border border-borderc bg-cover2 px-3 py-1 text-xs">
                  {tag}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </section>
  );
}
