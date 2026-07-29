type Props = {
  page: number;
  totalPages: number;
  baseUrl: string;
};

export default function Pagination({ page, totalPages, baseUrl }: Props) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="mt-6 flex items-center justify-center gap-1">
      <a
        href={page > 1 ? `${baseUrl}?page=${page - 1}` : undefined}
        aria-disabled={page <= 1}
        className={`flex h-9 w-9 items-center justify-center rounded-md border text-sm ${
          page <= 1
            ? 'pointer-events-none border-gray-200 text-gray-300'
            : 'border-gray-300 text-gray-600 hover:bg-gray-100'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </a>

      <div className="flex gap-1 overflow-x-auto">
        {pages.map((p) => (
          <a
            key={p}
            href={`${baseUrl}?page=${p}`}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border text-sm ${
              p === page ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 text-gray-600 hover:bg-gray-100'
            }`}
          >
            {p}
          </a>
        ))}
      </div>

      <a
        href={page < totalPages ? `${baseUrl}?page=${page + 1}` : undefined}
        aria-disabled={page >= totalPages}
        className={`flex h-9 w-9 items-center justify-center rounded-md border text-sm ${
          page >= totalPages
            ? 'pointer-events-none border-gray-200 text-gray-300'
            : 'border-gray-300 text-gray-600 hover:bg-gray-100'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </a>
    </div>
  );
}