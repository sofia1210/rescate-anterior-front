import React from "react";
import { Link } from "react-router-dom";
import { useThemeClasses } from "../../hooks/useThemeClasses";

interface BreadcrumbItem {
  label: string;
  path?: string;
  current?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  const { getThemeClasses } = useThemeClasses();

  return (
    <nav 
      className="mb-4" 
      aria-label="Navegación"
      role="navigation"
    >
      <ol className="flex items-center space-x-2 text-sm">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <svg 
                className="w-4 h-4 mx-2 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
            {item.current ? (
              <span 
                className={getThemeClasses(
                  "text-gray-600 font-medium",
                  "text-gray-700 font-medium"
                )}
                aria-current="page"
              >
                {item.label}
              </span>
            ) : (
              <Link
                to={item.path || '#'}
                className={getThemeClasses(
                  "text-green-600 hover:text-green-700 hover:underline focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 rounded",
                  "text-green-600 hover:text-green-700 hover:underline focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 rounded"
                )}
                aria-label={`Ir a ${item.label}`}
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
