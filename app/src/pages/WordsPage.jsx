import { useEffect, useMemo, useState } from 'react';
import { dataStore } from '../lib/dataStore';
import { tokenizeAdvancedQuery } from '../lib/advancedNameSearch';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 12;

export default function WordsPage() {
  const [query, setQuery] = useState('');
  const [advancedExpanded, setAdvancedExpanded] = useState(false);
  const [advancedQuery, setAdvancedQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagMatchMode, setTagMatchMode] = useState('any');
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

  const advancedTerms = useMemo(() => tokenizeAdvancedQuery(advancedQuery), [advancedQuery]);

  function toggleTag(tag) {
    setSelectedTags((current) => {
      if (current.includes(tag)) {
        return current.filter((item) => item !== tag);
      }
      return [...current, tag];
    });
  }

  function resetAdvanced() {
    setAdvancedExpanded(false);
    setAdvancedQuery('');
    setSelectedTags([]);
    setTagMatchMode('any');
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    const scored = dataStore.words
      .map((item) => {
        const text = String(item.text ?? '');
        const textLower = text.toLowerCase();
        const tags = Array.isArray(item.tags) ? item.tags : [];
        const tagsLower = tags.map((tag) => String(tag).toLowerCase());
        const tagsTextLower = tagsLower.join(' ');

        const quickMatch = !q || `${textLower} ${tagsTextLower}`.includes(q);
        if (!quickMatch) {
          return null;
        }

        const hasAdvanced = advancedExpanded;

        let termsMatched = 0;
        if (hasAdvanced && advancedTerms.length > 0) {
          termsMatched = advancedTerms.filter((term) => textLower.includes(String(term).toLowerCase())).length;
          if (termsMatched === 0) {
            return null;
          }
        }

        let tagsMatched = 0;
        if (hasAdvanced && selectedTags.length > 0) {
          tagsMatched = selectedTags.filter((tag) => tagsLower.includes(String(tag).toLowerCase())).length;
          const tagsCondition = tagMatchMode === 'all'
            ? tagsMatched === selectedTags.length
            : tagsMatched > 0;
          if (!tagsCondition) {
            return null;
          }
        }

        const score =
          (q && textLower.includes(q) ? 20 : 0) +
          (termsMatched * 25) +
          (tagsMatched * 18) +
          Math.min(12, tags.length);

        return {
          ...item,
          _advancedMeta: {
            score,
            termsMatched,
            tagsMatched,
          },
        };
      })
      .filter(Boolean);

    if (advancedExpanded && (advancedTerms.length > 0 || selectedTags.length > 0)) {
      return scored.sort((a, b) => Number(b._advancedMeta?.score ?? 0) - Number(a._advancedMeta?.score ?? 0));
    }

    return scored;
  }, [query, advancedExpanded, advancedTerms, selectedTags, tagMatchMode]);

  useEffect(() => {
    setPage(1);
  }, [query, advancedExpanded, advancedQuery, selectedTags, tagMatchMode]);

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

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            className={`h-12 w-full rounded-xl border px-4 text-sm transition ${
              advancedExpanded
                ? 'border-secondary bg-cover2 text-secondary'
                : 'border-borderc bg-cover2 text-[color:var(--white-light)] hover:border-secondary hover:text-secondary'
            }`}
            onClick={() => setAdvancedExpanded((value) => !value)}
          >
            {advancedExpanded ? 'بستن جستجوی پیشرفته متن' : 'جستجوی پیشرفته متن'}
          </button>

          <button
            type="button"
            className="h-12 w-full rounded-xl border border-[color:var(--red)] bg-[color:rgba(233,88,52,0.1)] px-4 text-sm text-[color:var(--red)] transition hover:bg-[color:var(--red)] hover:text-[color:var(--white)]"
            onClick={resetAdvanced}
          >
            پاکسازی پیشرفته
          </button>
        </div>

        {advancedExpanded ? (
          <div className="space-y-3 rounded-xl border border-borderc bg-cover2 p-3">
            <input
              className="h-12 w-full rounded-xl border border-borderc bg-cover px-4 text-sm text-foreground outline-none transition placeholder:text-[color:var(--white-light)] focus:border-secondary"
              placeholder="چند عبارت بنویس: مثلا امید / انگیزه"
              value={advancedQuery}
              onChange={(event) => setAdvancedQuery(event.target.value)}
            />

            <select
              className="h-12 w-full rounded-xl border border-borderc bg-cover px-3 text-sm text-foreground outline-none transition focus:border-secondary"
              value={tagMatchMode}
              onChange={(event) => setTagMatchMode(event.target.value)}
            >
              <option value="any">تگ ها: هرکدام کافی است</option>
              <option value="all">تگ ها: همه باید باشند</option>
            </select>

            <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto rounded-xl border border-borderc bg-cover p-2">
              {allTags.map((tag) => {
                const active = selectedTags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`rounded-full border px-3 py-1 text-xs transition ${
                      active
                        ? 'border-secondary bg-cover2 text-secondary'
                        : 'border-borderc bg-cover text-[color:var(--white-light)] hover:border-secondary hover:text-secondary'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>

            {selectedTags.length > 0 ? (
              <p className="text-xs text-[color:var(--white-light)]">
                {selectedTags.length.toLocaleString('fa-IR')} تگ انتخاب شده
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item, index) => (
          <article className="animate-fade-up rounded-2xl border border-borderc bg-cover p-4" key={`${index}-${item.text.slice(0, 24)}`}>
            <p className="text-sm leading-7">{item.text}</p>
            {advancedExpanded && (advancedTerms.length > 0 || selectedTags.length > 0) ? (
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full border border-secondary bg-cover2 px-3 py-1 text-xs text-secondary">
                  امتیاز: {Number(item._advancedMeta?.score ?? 0).toLocaleString('fa-IR')}
                </span>
                <span className="rounded-full border border-borderc bg-cover2 px-3 py-1 text-xs">
                  مچ متن: {Number(item._advancedMeta?.termsMatched ?? 0).toLocaleString('fa-IR')}
                </span>
                <span className="rounded-full border border-borderc bg-cover2 px-3 py-1 text-xs">
                  مچ تگ: {Number(item._advancedMeta?.tagsMatched ?? 0).toLocaleString('fa-IR')}
                </span>
              </div>
            ) : null}
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
