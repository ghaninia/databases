import { useEffect, useMemo, useState } from 'react';
import { dataStore } from '../lib/dataStore';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 12;

export default function WordsPage() {
  const [query, setQuery] = useState('');
  const [tagQuery, setTagQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [page, setPage] = useState(1);

  const allTags = useMemo(() => {
    const set = new Set();
    dataStore.words.forEach((item) => {
      (item.tags ?? []).forEach((tag) => {
        const normalizedTag = String(tag).trim();
        if (normalizedTag) {
          set.add(normalizedTag);
        }
      });
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'fa'));
  }, []);

  function toggleTag(tag) {
    setSelectedTags((current) => {
      if (current.includes(tag)) {
        return current.filter((item) => item !== tag);
      }
      return [...current, tag];
    });
  }

  function clearSelectedTags() {
    setSelectedTags([]);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return dataStore.words.filter((item) => {
      const text = String(item.text ?? '');
      const textLower = text.toLowerCase();
      const tags = Array.isArray(item.tags) ? item.tags : [];
      const tagsLower = tags.map((tag) => String(tag).toLowerCase());
      const tagsTextLower = tagsLower.join(' ');

      const quickMatch = !q || `${textLower} ${tagsTextLower}`.includes(q);
      if (!quickMatch) {
        return false;
      }

      if (selectedTags.length === 0) {
        return true;
      }

      return selectedTags.every((tag) => tagsLower.includes(String(tag).toLowerCase()));
    });
  }, [query, selectedTags]);

  const relatedTags = useMemo(() => {
    if (selectedTags.length === 0) {
      return [];
    }

    const counts = new Map();
    dataStore.words.forEach((item) => {
      const tags = Array.isArray(item.tags) ? item.tags : [];
      const tagsLower = tags.map((tag) => String(tag).toLowerCase());
      const containsSelected = selectedTags.every((tag) => tagsLower.includes(String(tag).toLowerCase()));
      if (!containsSelected) {
        return;
      }

      tags.forEach((tag) => {
        const normalizedTag = String(tag).trim();
        if (!normalizedTag || selectedTags.includes(normalizedTag)) {
          return;
        }

        counts.set(normalizedTag, (counts.get(normalizedTag) ?? 0) + 1);
      });
    });

    return Array.from(counts.entries())
      .sort((a, b) => {
        const countDelta = b[1] - a[1];
        if (countDelta !== 0) {
          return countDelta;
        }
        return a[0].localeCompare(b[0], 'fa');
      })
      .map(([tag]) => tag);
  }, [selectedTags]);

  const filteredAllTags = useMemo(() => {
    const q = tagQuery.trim().toLowerCase();
    if (!q) {
      return allTags;
    }

    return allTags.filter((tag) => String(tag).toLowerCase().includes(q));
  }, [allTags, tagQuery]);

  useEffect(() => {
    setPage(1);
  }, [query, selectedTags]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const items = filtered.slice(start, start + PAGE_SIZE);

  return (
    <section className="space-y-4">
      <div className="animate-fade-up flex items-center justify-between rounded-2xl border border-borderc bg-cover px-5 py-4">
        <h2 className="text-xl font-bold text-secondary">Words</h2>
        <p className="text-sm text-[color:var(--white-light)]">{filtered.length.toLocaleString('fa-IR')} متن</p>
      </div>

      <div className="space-y-3 rounded-2xl border border-borderc bg-cover p-4">
        <input
          className="h-12 w-full rounded-xl border border-borderc bg-cover2 px-4 text-sm text-foreground outline-none transition placeholder:text-[color:var(--white-light)] focus:border-secondary"
          placeholder="جستجوی سریع در متن یا تگ"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item, index) => (
          <article className="animate-fade-up rounded-2xl border border-borderc bg-cover p-4" key={`${index}-${item.text.slice(0, 24)}`}>
            <p className="text-sm leading-7">{item.text}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(item.tags ?? []).map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`rounded-full border px-3 py-1 text-xs transition ${
                    selectedTags.includes(tag)
                      ? 'border-secondary bg-cover2 text-secondary'
                      : 'border-borderc bg-cover2 hover:border-secondary hover:text-secondary'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </article>
        ))}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </section>
  );
}
