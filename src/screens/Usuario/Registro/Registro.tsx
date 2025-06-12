import React, { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { registerUser } from "../../../services/authService";

export const Register = (): JSX.Element => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    const fields = ["username", "email", "firstName", "lastName"] as const;

    for (const field of fields) {
      const input = form[field] as HTMLInputElement;
      const value = input.value.trim();

      if (!value) {
        input.setCustomValidity("Este campo es obligatorio.");
        input.reportValidity();
        return;
      }

      if (field === "email" && !value.includes("@")) {
        input.setCustomValidity("El correo debe contener un @ y ser válido.");
        input.reportValidity();
        return;
      }

      input.setCustomValidity("");
    }

    const passwordInput = form.password as HTMLInputElement;
    const confirmInput = form.confirmPassword as HTMLInputElement;
    const password = passwordInput.value;
    const confirm = confirmInput.value;

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{12,}$/;

    if (!passwordRegex.test(password)) {
      passwordInput.setCustomValidity(
        "Debe tener mínimo 12 caracteres, una mayúscula y un número."
      );
      passwordInput.reportValidity();
      return;
    } else {
      passwordInput.setCustomValidity("");
    }

    if (password !== confirm) {
      confirmInput.setCustomValidity("Las contraseñas no coinciden.");
      confirmInput.reportValidity();
      return;
    } else {
      confirmInput.setCustomValidity("");
    }

    // ✅ Conexión al backend
    try {
      await registerUser({
        username: form.username.value,
        email: form.email.value,
        firstName: form.firstName.value,
        lastName: form.lastName.value,
        password: form.password.value,
      });

      alert("Usuario registrado con éxito");
      navigate("/");
    } catch (err: any) {
      alert(err.response?.data?.message || "Error al registrar");
    }
  };

  return (
    <div className="flex h-screen w-full bg-green-400/80">
      <div className="flex flex-col justify-center w-full md:w-1/2 p-8 rounded-r-3xl bg-green-500/80">
        <div className="max-w-md mx-auto w-full">
          <h1 className="text-2xl font-medium text-white mb-6">Crear una cuenta</h1>

          <form onSubmit={handleRegister} className="space-y-4" noValidate>
            <div>
              <label htmlFor="username" className="block text-sm text-white mb-1">
                Nombre de usuario:
              </label>
              <Input
                id="username"
                name="username"
                placeholder="Ingresa tu usuario"
                className="bg-transparent border-white/30 text-white placeholder:text-white/50"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm text-white mb-1">
                Correo electrónico:
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="ejemplo@correo.com"
                className="bg-transparent border-white/30 text-white placeholder:text-white/50"
              />
            </div>

            <div>
              <label htmlFor="firstName" className="block text-sm text-white mb-1">
                Nombre:
              </label>
              <Input
                id="firstName"
                name="firstName"
                placeholder="Ingresa tu nombre"
                className="bg-transparent border-white/30 text-white placeholder:text-white/50"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm text-white mb-1">
                Apellido:
              </label>
              <Input
                id="lastName"
                name="lastName"
                placeholder="Ingresa tu apellido"
                className="bg-transparent border-white/30 text-white placeholder:text-white/50"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm text-white mb-1">
                Contraseña:
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Crea una contraseña segura"
                  className="bg-transparent border-white/30 text-white placeholder:text-white/50 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm text-white mb-1">
                Confirmar contraseña:
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repite tu contraseña"
                  className="bg-transparent border-white/30 text-white placeholder:text-white/50 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white"
                >
                  {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

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

      <div className="hidden md:block md:w-1/2 bg-green-400/80 relative" />
    </div>
  );
};
