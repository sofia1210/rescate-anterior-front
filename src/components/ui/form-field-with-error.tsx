import React, { useState, useEffect } from "react";
import { Input } from "./input";
import { useThemeClasses } from "../../hooks/useThemeClasses";

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
  autoComplete?: string;
  className?: string;
  inputMode?: "text" | "search" | "email" | "tel" | "url" | "none" | "numeric" | "decimal";
  validateMessage?: string;
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
  autoComplete,
  className = "w-full",
  inputMode,
  validateMessage
}) => {
  const { getThemeClasses } = useThemeClasses();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [shouldValidate, setShouldValidate] = useState(false);

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
    
    setErrorMessage(message);
  }, [value, shouldValidate, required, minLength, maxLength, pattern, validateMessage, label]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShouldValidate(true);
    onChange(e.target.value);
  };

  const handleBlur = () => {
    setShouldValidate(true);
  };

  return (
    <div className="space-y-1">
      <label htmlFor={`field-${label}`} className="block text-sm font-medium mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Input
        id={`field-${label}`}
        type={type}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        pattern={pattern}
        minLength={minLength}
        maxLength={maxLength}
        autoComplete={autoComplete}
        inputMode={inputMode}
        className={`${className} ${errorMessage ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
        required={required}
        aria-describedby={errorMessage ? `error-${label}` : undefined}
      />
      {errorMessage && (
        <div 
          id={`error-${label}`}
          className="text-red-600 text-sm"
          role="alert"
          aria-live="polite"
        >
          {errorMessage}
        </div>
      )}
    </div>
  );
};
