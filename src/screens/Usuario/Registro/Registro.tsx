import React, { useEffect, useRef, useState } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { registerUser } from "../../../services/authService";
import { useThemeClasses } from "../../../hooks/useThemeClasses";
import { Notification } from "../../../components/ui/notification";

export const Register = (): JSX.Element => {
  const navigate = useNavigate();
  const { getThemeClasses } = useThemeClasses();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");

  const usernameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);

  const stripEmojis = (value: string): string => {
    try {
      return value.replace(/\p{Extended_Pictographic}/gu, "");
    } catch {
      return value.replace(/[\uD800-\uDFFF]|\uFE0F/gu, "");
    }
  };

  const sanitizeUsername = (value: string): string => {
    const noEmoji = stripEmojis(value);
    return noEmoji.replace(/[^a-zA-Z0-9._-]/g, "");
  };

  const sanitizeName = (value: string): string => {
    const noEmoji = stripEmojis(value);
    return noEmoji.replace(/[^\p{L}\s'’-]/gu, "");
  };

  const sanitizeEmail = (value: string): string => {
    const noEmojiNoSpace = stripEmojis(value).replace(/\s+/g, "");
    // Permitir solo caracteres comunes en emails en la mayoría de proveedores
    return noEmojiNoSpace.replace(/[^a-zA-Z0-9._%+\-@]/g, "");
  };

  // Patrón más estricto y común para emails
  const emailRegex = /^[a-zA-Z0-9._%+\-]{1,64}@[A-Za-z0-9.-]{1,253}\.[A-Za-z]{2,}$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[\S ]{12,64}$/;

  useEffect(() => {
    if (!password) {
      setConfirmPassword("");
      setConfirmError("");
    }
  }, [password]);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Reset previous errors
    setUsernameError("");
    setEmailError("");
    setFirstNameError("");
    setLastNameError("");
    setPasswordError("");
    setConfirmError("");

    // Trim values
    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const pwd = password;
    const pwdConfirm = confirmPassword;

    let firstInvalid: React.RefObject<HTMLInputElement> | null = null;

    if (!trimmedUsername) {
      setUsernameError("El nombre de usuario es obligatorio.");
      firstInvalid = firstInvalid || usernameRef;
    } else if (trimmedUsername.length < 3 || trimmedUsername.length > 30) {
      setUsernameError("Debe tener entre 3 y 30 caracteres.");
      firstInvalid = firstInvalid || usernameRef;
    }

    if (!trimmedEmail) {
      setEmailError("El correo electrónico es obligatorio.");
      firstInvalid = firstInvalid || emailRef;
    } else if (!emailRegex.test(trimmedEmail) || trimmedEmail.length > 254) {
      setEmailError("Ingresa un correo con formato válido.");
      firstInvalid = firstInvalid || emailRef;
    } else {
      // Validaciones adicionales: sin puntos consecutivos, etiquetas de dominio válidas
      const [local, domain] = trimmedEmail.split("@");
      if (!local || !domain) {
        setEmailError("Ingresa un correo con formato válido.");
        firstInvalid = firstInvalid || emailRef;
      } else if (local.startsWith(".") || local.endsWith(".") || local.includes("..")) {
        setEmailError("El nombre antes de @ no puede iniciar/terminar con punto ni tener ..");
        firstInvalid = firstInvalid || emailRef;
      } else {
        const labels = domain.split(".");
        if (labels.some(l => l.length === 0)) {
          setEmailError("El dominio no puede tener puntos consecutivos.");
          firstInvalid = firstInvalid || emailRef;
        } else if (labels.some(l => l.startsWith("-") || l.endsWith("-"))) {
          setEmailError("Cada parte del dominio no puede iniciar o terminar con -");
          firstInvalid = firstInvalid || emailRef;
        }
      }
    }

    if (!trimmedFirstName) {
      setFirstNameError("El nombre es obligatorio.");
      firstInvalid = firstInvalid || firstNameRef;
    } else if (trimmedFirstName.length < 2 || trimmedFirstName.length > 60) {
      setFirstNameError("Debe tener entre 2 y 60 caracteres.");
      firstInvalid = firstInvalid || firstNameRef;
    }

    if (!trimmedLastName) {
      setLastNameError("El apellido es obligatorio.");
      firstInvalid = firstInvalid || lastNameRef;
    } else if (trimmedLastName.length < 2 || trimmedLastName.length > 60) {
      setLastNameError("Debe tener entre 2 y 60 caracteres.");
      firstInvalid = firstInvalid || lastNameRef;
    }

    if (!pwd) {
      setPasswordError("La contraseña es obligatoria.");
      firstInvalid = firstInvalid || passwordRef;
    } else if (!passwordRegex.test(pwd)) {
      setPasswordError("12-64 caracteres, al menos 1 mayúscula, 1 minúscula y 1 número.");
      firstInvalid = firstInvalid || passwordRef;
    }

    if (!pwdConfirm) {
      setConfirmError("Confirma tu contraseña.");
      firstInvalid = firstInvalid || confirmRef;
    } else if (pwd !== pwdConfirm) {
      setConfirmError("Las contraseñas no coinciden.");
      firstInvalid = firstInvalid || confirmRef;
    }

    if (firstInvalid) {
      firstInvalid.current?.focus();
      return;
    }

    // ✅ Conexión al backend
    try {
      await registerUser({
        username: trimmedUsername,
        email: trimmedEmail,
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        password: pwd,
      });

      setNotification({
        type: 'success',
        message: '¡Usuario registrado con éxito!'
      });
      
      // Navegar después de un breve delay para que se vea la notificación
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || "Error al registrar usuario"
      });
    }
  };

  return (
    <div className={getThemeClasses(
      "flex min-h-screen w-full bg-green-400/80",
      "flex min-h-screen w-full bg-green-100"
    )}>
      <div className={getThemeClasses(
        "flex flex-col justify-start w-full md:w-1/2 p-8 md:p-12 rounded-r-3xl bg-green-500/80",
        "flex flex-col justify-start w-full md:w-1/2 p-8 md:p-12 rounded-r-3xl bg-gradient-to-br from-green-600 to-green-700"
      )}>
        <div className="max-w-md mx-auto w-full">
          <h1 className="text-2xl font-medium text-white mb-6">Crear una cuenta</h1>

          <form onSubmit={handleRegister} className="space-y-4" noValidate>
            <div>
              <label htmlFor="username" className="block text-sm text-white mb-1">
                Nombre de usuario
              </label>
              <Input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                ref={usernameRef}
                minLength={3}
                maxLength={30}
                required
                inputMode="text"
                value={username}
                onChange={(e) => {
                  const v = sanitizeUsername(e.target.value);
                  if (usernameError) setUsernameError("");
                  setUsername(v);
                }}
                placeholder="ej. emilia.rodriguez, emilia_rodriguez"
                className={`bg-transparent border-white/30 text-white placeholder:text-white/50 ${usernameError ? 'border-amber-400 focus-visible:ring-amber-400' : ''}`}
              />
              {usernameError && (
                <p className="mt-1 text-sm text-amber-200" role="alert" aria-live="polite">{usernameError}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm text-white mb-1">
                Correo electrónico
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                ref={emailRef}
                required
                value={email}
                onChange={(e) => {
                  const v = sanitizeEmail(e.target.value);
                  if (emailError) setEmailError("");
                  setEmail(v);
                }}
                onKeyDown={(e) => {
                  // Evitar espacios y caracteres no permitidos al escribir
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
                pattern="^[a-zA-Z0-9._%+\-]{1,64}@[A-Za-z0-9.-]{1,253}\.[A-Za-z]{2,}$"
                maxLength={254}
                placeholder="ej. emilia.rodriguez@correo.com"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                className={`bg-transparent border-white/30 text-white placeholder:text-white/50 ${emailError ? 'border-amber-400 focus-visible:ring-amber-400' : ''}`}
              />
              {emailError && (
                <p className="mt-1 text-sm text-amber-200" role="alert" aria-live="polite">{emailError}</p>
              )}
            </div>

            <div>
              <label htmlFor="firstName" className="block text-sm text-white mb-1">
                Nombre
              </label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                ref={firstNameRef}
                minLength={2}
                maxLength={60}
                required
                inputMode="text"
                value={firstName}
                onChange={(e) => {
                  const v = sanitizeName(e.target.value);
                  if (firstNameError) setFirstNameError("");
                  setFirstName(v);
                }}
                placeholder="ej. Emilia Valentina"
                className={`bg-transparent border-white/30 text-white placeholder:text-white/50 ${firstNameError ? 'border-amber-400 focus-visible:ring-amber-400' : ''}`}
              />
              {firstNameError && (
                <p className="mt-1 text-sm text-amber-200" role="alert" aria-live="polite">{firstNameError}</p>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm text-white mb-1">
                Apellido
              </label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                ref={lastNameRef}
                minLength={2}
                maxLength={60}
                required
                inputMode="text"
                value={lastName}
                onChange={(e) => {
                  const v = sanitizeName(e.target.value);
                  if (lastNameError) setLastNameError("");
                  setLastName(v);
                }}
                placeholder="ej. Rodríguez García"
                className={`bg-transparent border-white/30 text-white placeholder:text-white/50 ${lastNameError ? 'border-amber-400 focus-visible:ring-amber-400' : ''}`}
              />
              {lastNameError && (
                <p className="mt-1 text-sm text-amber-200" role="alert" aria-live="polite">{lastNameError}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm text-white mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  ref={passwordRef}
                  minLength={12}
                  maxLength={64}
                  required
                  value={password}
                  onChange={(e) => {
                    const v = stripEmojis(e.target.value);
                    if (passwordError) setPasswordError("");
                    setPassword(v);
                  }}
                  placeholder="Mín. 12, mayúscula, minúscula y número"
                  className={`bg-transparent border-white/30 text-white placeholder:text-white/50 pr-10 ${passwordError ? 'border-amber-400 focus-visible:ring-amber-400' : ''}`}
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

            {password.length > 0 && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm text-white mb-1">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    ref={confirmRef}
                    minLength={12}
                    maxLength={64}
                    required
                    value={confirmPassword}
                    onChange={(e) => {
                      const v = stripEmojis(e.target.value);
                      if (confirmError) setConfirmError("");
                      setConfirmPassword(v);
                    }}
                    placeholder="Vuelve a escribirla"
                    className={`bg-transparent border-white/30 text-white placeholder:text-white/50 pr-10 ${confirmError ? 'border-amber-400 focus-visible:ring-amber-400' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white"
                  >
                    {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {confirmError && (
                  <p className="mt-1 text-sm text-amber-200" role="alert" aria-live="polite">{confirmError}</p>
                )}
              </div>
            )}

            <Button type="submit" className="w-full bg-white text-green-700 hover:bg-white/90 mt-4">
              REGISTRARSE
            </Button>

            <p className="text-center text-white mt-4">
              ¿Ya tienes una cuenta?{" "}
              <Link to="/" className="underline">
                Inicia sesión aquí
              </Link>
            </p>
          </form>
        </div>
      </div>

      <div className={getThemeClasses(
        "hidden md:block md:w-1/2 bg-green-400/80 relative",
        "hidden md:block md:w-1/2 bg-green-100 relative"
      )} />
      
      {/* Notificación */}
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
