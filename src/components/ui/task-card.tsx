import React from "react";
import { Link } from "react-router-dom";
import { useThemeClasses } from "../../hooks/useThemeClasses";

interface TaskCardProps {
  title: string;
  description: string;
  to: string;
  ctaText: string;
  icon?: React.ReactNode;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  title,
  description,
  to,
  ctaText,
  icon
}) => {
  const { getThemeClasses } = useThemeClasses();

  return (
    <div className={getThemeClasses(
      "bg-white rounded-lg p-4 shadow-md flex flex-col justify-between transition-all duration-200 hover:shadow-lg focus-within:shadow-lg",
      "bg-white rounded-lg p-4 shadow-md shadow-green-200/50 border border-green-100 flex flex-col justify-between transition-all duration-200 hover:shadow-lg hover:shadow-green-200/70 focus-within:shadow-lg focus-within:shadow-green-200/70"
    )}>
      <div>
        <div className="flex items-center gap-2 mb-2">
          {icon && (
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              {icon}
            </div>
          )}
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <p className="text-sm text-gray-600 mb-3">{description}</p>
      </div>
      <Link
        to={to}
        className="mt-2 inline-block px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors duration-200 text-center focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        aria-label={`Ir a ${title}`}
      >
        {ctaText}
      </Link>
    </div>
  );
};
