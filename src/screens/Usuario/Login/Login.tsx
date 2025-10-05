import React, { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { loginUser } from "../../../services/authService";
import { useThemeClasses } from "../../../hooks/useThemeClasses";
import { Notification } from "../../../components/ui/notification";

export const Login = (): JSX.Element => {
  const navigate = useNavigate();
  const { getThemeClasses } = useThemeClasses();
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const stripEmojis = (value: string): string => {
    try {
      return value.replace(/\p{Extended_Pictographic}/gu, "");
    } catch {
      return value.replace(/[\uD800-\uDFFF]|\uFE0F/gu, "");
    }
  };

  const sanitizeEmail = (value: string): string => {
    const noEmojiNoSpace = stripEmojis(value).replace(/\s+/g, "");
    return noEmojiNoSpace.replace(/[^a-zA-Z0-9._%+\-@]/g, "");
  };

  const emailRegex = /^[a-zA-Z0-9._%+\-]{1,64}@[A-Za-z0-9.-]{1,253}\.[A-Za-z]{2,}$/;

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let hasError = false;

    if (!emailRegex.test(email)) {
      setEmailError("Correo electrónico inválido. Ingrese un correo con formato válido.");
      hasError = true;
    }

    if (!password.trim()) {
      setPasswordError("La contraseña es obligatoria.");
      hasError = true;
    } else if (password.length < 12 || password.length > 64) {
      setPasswordError("La contraseña debe tener entre 12 y 64 caracteres.");
      hasError = true;
    }

    if (hasError) return;

    try {
      const res = await loginUser({
        email,
        password,
      });

      // Guardar token en localStorage
      localStorage.setItem("token", res.data.token);
      setNotification({
        type: 'success',
        message: '¡Sesión iniciada correctamente!'
      });
      
      // Navegar después de un breve delay para que se vea la notificación
      setTimeout(() => {
        navigate("/pets");
      }, 1500);
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || "Error al iniciar sesión"
      });
    }
  };

  return (
    <div className={getThemeClasses(
      "flex h-screen w-full bg-green-400/80",
      "flex h-screen w-full bg-green-50"
    )}>
      <div className={getThemeClasses(
        "flex flex-col justify-center w-full md:w-1/2 p-8 rounded-r-3xl bg-green-500/80",
        "flex flex-col justify-center w-full md:w-1/2 p-8 rounded-r-3xl bg-gradient-to-br from-green-600 to-green-700"
      )}>
        <div className="max-w-md mx-auto w-full">
          <div className="text-center mb-8">
            <img src="/imagenes/Patota.png" alt="Logo" className="w-24 h-24 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">RedSilvestre</h1>
            <p className="text-white/80 text-sm font-medium tracking-wide">Tu red de rescate animal</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-white mb-1 tracking-wide"
              >
                Correo electrónico
              </label>
              <Input
                id="username"
                name="username"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                pattern="^[a-zA-Z0-9._%+\-]{1,64}@[A-Za-z0-9.-]{1,253}\.[A-Za-z]{2,}$"
                value={email}
                onChange={(e) => {
                  const v = sanitizeEmail(e.target.value);
                  if (emailError) setEmailError("");
                  setEmail(v);
                }}
                onKeyDown={(e) => {
                  if (e.key === " ") { e.preventDefault(); return; }
                  if (e.key.length === 1) {
                    const allowed = /[a-zA-Z0-9._%+\-@]/;
                    if (!allowed.test(e.key)) { e.preventDefault(); }
                  }
                }}
                onPaste={(e) => {
                  const text = e.clipboardData.getData('text');
                  const sanitized = sanitizeEmail(text);
                  e.preventDefault();
                  const target = e.target as HTMLInputElement;
                  const start = target.selectionStart ?? target.value.length;
                  const end = target.selectionEnd ?? target.value.length;
                  const next = target.value.slice(0, start) + sanitized + target.value.slice(end);
                  if (emailError) setEmailError("");
                  setEmail(next);
                }}
                className={`bg-transparent border-white/30 text-white placeholder:text-white/50 ${emailError ? 'border-amber-400 focus-visible:ring-amber-400' : ''}`}
                placeholder="ej. emilia.rodriguez@correo.com"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
              />
              {emailError && (
                <p className="mt-1 text-sm text-amber-200" role="alert" aria-live="polite">{emailError}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-white mb-1 tracking-wide"
              >
                Contraseña
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  minLength={12}
                  maxLength={64}
                  required
                  value={password}
                  onChange={(e) => {
                    if (passwordError) setPasswordError("");
                    setPassword(e.target.value);
                  }}
                  className={`bg-transparent border-white/30 text-white placeholder:text-white/50 pr-10 ${passwordError ? 'border-amber-400 focus-visible:ring-amber-400' : ''}`}
                  placeholder="Mín. 12, mayúscula, minúscula y número"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {passwordError && (
                <p className="mt-1 text-sm text-amber-200" role="alert" aria-live="polite">{passwordError}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-white text-green-700 hover:bg-white/90 mt-6 font-semibold tracking-wide"
            >
              INICIAR SESIÓN
            </Button>

            <p className="text-center text-white mt-4 font-medium">
              ¿No tienes una cuenta?{" "}
              <Link to="/registro" className="underline font-semibold">
                Regístrate aquí
              </Link>
            </p>
          </form>
        </div>
      </div>

     
      
      {/* Notification component stays the same */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};
