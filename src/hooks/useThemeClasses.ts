import { useTheme } from '../contexts/ThemeContext';

export const useThemeClasses = () => {
  const { theme } = useTheme();

  const getThemeClasses = (lightClasses: string, warmClasses: string) => {
    return theme === 'warm' ? warmClasses : lightClasses;
  };

  return { theme, getThemeClasses };
};