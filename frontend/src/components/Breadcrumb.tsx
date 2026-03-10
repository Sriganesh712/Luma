import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  if (!items.length) return null;
  return (
    <nav className="flex items-center gap-1.5 text-sm mb-5 flex-wrap">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--ink-5)' }} />}
            {isLast || !item.to ? (
              <span style={{ color: isLast ? 'var(--ink-3)' : 'var(--ink-4)', fontWeight: isLast ? 500 : 400 }}>
                {item.label}
              </span>
            ) : (
              <Link to={item.to} className="transition hover:underline" style={{ color: 'var(--blue)' }}>
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
