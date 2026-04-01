import { useEffect, useMemo, useState } from 'react';
import { dataStore } from '../lib/dataStore';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 18;

export default function GradesPage() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const { roots, childrenByParent } = useMemo(() => {
    const list = dataStore.grades;
    const q = query.trim().toLowerCase();
    const visible = q
      ? list.filter((row) => String(row.title).toLowerCase().includes(q))
      : list;

    const ids = new Set(visible.map((item) => item.id));
    const children = {};

    list.forEach((row) => {
      if (row.grade_id != null) {
        const arr = children[row.grade_id] ?? [];
        arr.push(row);
        children[row.grade_id] = arr;
      }
    });

    const rootRows = visible.filter((row) => row.grade_id == null || !ids.has(row.grade_id));

    return {
      roots: rootRows,
      childrenByParent: children,
    };
  }, [query]);

  useEffect(() => {
    setPage(1);
  }, [query]);

  const totalPages = Math.max(1, Math.ceil(roots.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const items = roots.slice(start, start + PAGE_SIZE);

  return (
    <section className="space-y-4">
      <div className="animate-fade-up flex items-center justify-between rounded-2xl border border-borderc bg-cover px-5 py-4">
        <h2 className="text-xl font-bold text-secondary">Grades</h2>
        <p className="text-sm text-[color:var(--white-light)]">{dataStore.grades.length.toLocaleString('fa-IR')} رشته</p>
      </div>

      <input
        className="w-full rounded-xl border border-borderc bg-cover px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-[color:var(--white-light)] focus:border-secondary"
        placeholder="جستجو در عنوان رشته"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      <div className="space-y-3">
        {items.map((root) => {
          const children = childrenByParent[root.id] ?? [];
          return (
            <details key={root.id} open className="animate-fade-up rounded-2xl border border-borderc bg-cover p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                <span className="font-semibold text-foreground">{root.title}</span>
                <small className="rounded-md bg-cover2 px-2 py-1 text-xs text-[color:var(--white-light)]">
                  {children.length.toLocaleString('fa-IR')} زیرشاخه
                </small>
              </summary>
              {children.length > 0 ? (
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {children.map((child) => (
                    <li key={child.id} className="rounded-lg border border-borderc bg-cover2 px-3 py-2 text-sm">
                      {child.title}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-[color:var(--white-light)]">زیرشاخه‌ای ثبت نشده است.</p>
              )}
            </details>
          );
        })}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </section>
  );
}
