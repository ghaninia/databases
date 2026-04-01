export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);

  for (let i = start; i <= end; i += 1) {
    pages.push(i);
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2" role="navigation" aria-label="pagination">
      <button
        type="button"
        onClick={() => onPageChange(1)}
        disabled={page === 1}
        className="rounded-lg border border-borderc bg-cover px-3 py-1.5 text-xs text-foreground transition hover:bg-cover2 disabled:cursor-not-allowed disabled:opacity-40"
      >
        ابتدا
      </button>
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="rounded-lg border border-borderc bg-cover px-3 py-1.5 text-xs text-foreground transition hover:bg-cover2 disabled:cursor-not-allowed disabled:opacity-40"
      >
        قبلی
      </button>

      {start > 1 ? <span className="px-1 text-sm text-[color:var(--white-light)]">...</span> : null}
      {pages.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onPageChange(item)}
          className={`rounded-lg border px-3 py-1.5 text-xs transition ${
            item === page
              ? 'border-secondary bg-cover2 text-secondary'
              : 'border-borderc bg-cover text-foreground hover:bg-cover2'
          }`}
        >
          {item.toLocaleString('fa-IR')}
        </button>
      ))}
      {end < totalPages ? <span className="px-1 text-sm text-[color:var(--white-light)]">...</span> : null}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="rounded-lg border border-borderc bg-cover px-3 py-1.5 text-xs text-foreground transition hover:bg-cover2 disabled:cursor-not-allowed disabled:opacity-40"
      >
        بعدی
      </button>
      <button
        type="button"
        onClick={() => onPageChange(totalPages)}
        disabled={page === totalPages}
        className="rounded-lg border border-borderc bg-cover px-3 py-1.5 text-xs text-foreground transition hover:bg-cover2 disabled:cursor-not-allowed disabled:opacity-40"
      >
        انتها
      </button>
    </div>
  );
}
