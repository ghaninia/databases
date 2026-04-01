import { useEffect, useMemo, useState } from 'react';
import { dataStore } from '../lib/dataStore';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 120;

export default function SkillsPage() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return dataStore.skills;
    }

    return dataStore.skills.filter((item) => item.toLowerCase().includes(q));
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
        <h2 className="text-xl font-bold text-secondary">Skills</h2>
        <p className="text-sm text-[color:var(--white-light)]">{filtered.length.toLocaleString('fa-IR')} مهارت</p>
      </div>

      <input
        className="w-full rounded-xl border border-borderc bg-cover px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-[color:var(--white-light)] focus:border-secondary"
        placeholder="جستجو در مهارت‌ها"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      <div className="flex flex-wrap gap-2 rounded-2xl border border-borderc bg-cover p-4">
        {items.map((item, index) => (
          <span className="animate-fade-up rounded-full border border-borderc bg-cover2 px-3 py-1.5 text-xs" key={`${item}-${index}`}>
            {item}
          </span>
        ))}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </section>
  );
}
