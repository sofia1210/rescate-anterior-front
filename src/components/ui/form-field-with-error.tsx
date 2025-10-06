import React, { useState, useEffect } from "react";
import { Input } from "./input";
// import { useThemeClasses } from "../../hooks/useThemeClasses";

interface FormFieldWithErrorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  min?: string;
  max?: string;
  autoComplete?: string;
  className?: string;
  inputMode?: "text" | "search" | "email" | "tel" | "url" | "none" | "numeric" | "decimal";
  validateMessage?: string;
  forceValidate?: boolean;
}

export const FormFieldWithError: React.FC<FormFieldWithErrorProps> = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  pattern,
  minLength,
  maxLength,
  min,
  max,
  autoComplete,
  className = "w-full",
  inputMode,
  validateMessage,
  forceValidate
}) => {
  // const { getThemeClasses } = useThemeClasses();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [shouldValidate, setShouldValidate] = useState(false);
  const slug = React.useMemo(
    () =>
      String(label)
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9_-]/gi, ""),
    [label]
  );

  useEffect(() => {
    if (!shouldValidate) return;

    let message = "";

    if (required && !value.trim()) {
      message = `${label} es obligatorio`;
    } else if (minLength && value.length < minLength) {
      message = `Mínimo ${minLength} caracteres`;
    } else if (maxLength && value.length > maxLength) {
      message = `Máximo ${maxLength} caracteres`;
    } else if (pattern) {
      const regex = new RegExp(pattern);
      if (!regex.test(value)) {
        message = validateMessage || "Formato inválido";
      }
    }

    // Validación adicional para fechas con min/max
    if (!message && type === "date" && value) {
      const val = value;
      if (min && val < min) {
        message = validateMessage || `Fecha mínima permitida: ${min}`;
      } else if (max && val > max) {
        message = validateMessage || `Fecha máxima permitida: ${max}`;
      }
    }

    setErrorMessage(message);
  }, [value, shouldValidate, required, minLength, maxLength, pattern, validateMessage, label, type, min, max]);

  useEffect(() => {
    if (forceValidate) setShouldValidate(true);
  }, [forceValidate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShouldValidate(true);
    onChange(e.target.value);
  };

  const handleBlur = () => {
    setShouldValidate(true);
  };

  return (
    <div className="space-y-1">
      <label htmlFor={`field-${slug}`} className="block text-sm font-medium mb-1">
        {label} {required && <span className="text-current">*</span>}
      </label>
      <Input
        id={`field-${slug}`}
        type={type}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        pattern={pattern}
        minLength={minLength}
        maxLength={maxLength}
      min={min}
      max={max}
        autoComplete={autoComplete}
        inputMode={inputMode}
        className={`${className} ${errorMessage ? 'border-amber-400 focus:border-amber-400 focus:ring-amber-400' : ''}`}
        required={required}
        aria-describedby={errorMessage ? `error-${slug}` : undefined}
        aria-invalid={errorMessage ? true : undefined}
      />
      {errorMessage && (
        <div 
          id={`error-${slug}`}
          className="text-amber-600 text-sm"
          role="alert"
          aria-live="polite"
        >
          {errorMessage}
        </div>
      )}
    </div>
  );
};
