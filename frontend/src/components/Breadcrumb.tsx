import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  to?: string;
}

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm mb-4">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="w-3.5 h-3.5" style={{ color: 'var(--ink-5)' }} />}
          {item.to ? (
            <Link to={item.to} className="font-medium hover:underline transition" style={{ color: 'var(--blue)' }}>
              {item.label}
            </Link>
          ) : (
            <span className="font-medium" style={{ color: 'var(--ink-3)' }}>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
