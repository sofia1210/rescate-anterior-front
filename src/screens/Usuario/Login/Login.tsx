import React, { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { loginUser } from "../../../services/authService";

export const Login = (): JSX.Element => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    const emailInput = form.username as HTMLInputElement;
    const passwordInput = form.password as HTMLInputElement;

    if (!emailInput.value.trim()) {
      emailInput.setCustomValidity("El nombre de usuario es obligatorio.");
      emailInput.reportValidity();
      return;
    } else {
      emailInput.setCustomValidity("");
    }

    if (!passwordInput.value.trim()) {
      passwordInput.setCustomValidity("La contraseña es obligatoria.");
      passwordInput.reportValidity();
      return;
    } else {
      passwordInput.setCustomValidity("");
    }

    try {
      const res = await loginUser({
        email: emailInput.value,
        password: passwordInput.value,
      });

      // Guardar token en localStorage
      localStorage.setItem("token", res.data.token);
      alert("Sesión iniciada correctamente");
      navigate("/pets");
    } catch (err: any) {
      alert(err.response?.data?.message || "Error al iniciar sesión");
    }
  };

  return (
    <div className="flex h-screen w-full bg-green-400/80">
      <div className="flex flex-col justify-center w-full md:w-1/2 p-8 rounded-r-3xl bg-green-500/80">
        <div className="max-w-md mx-auto w-full">
          <div className="flex justify-center mb-8">
            <img src="/imagenes/Patota.png" alt="Logo" className="w-24 h-24" />
          </div>

          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="username"
                className="block text-sm text-white mb-1"
              >
                Email:
              </label>
              <Input
                id="username"
                name="username"
                className="bg-transparent border-white/30 text-white placeholder:text-white/50"
                placeholder="Ingresa tu usuario"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm text-white mb-1"
              >
                Contraseña:
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="bg-transparent border-white/30 text-white placeholder:text-white/50 pr-10"
                  placeholder="Ingresa tu contraseña"
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

            <Button
              type="submit"
              className="w-full bg-white text-green-700 hover:bg-white/90 mt-6"
            >
              INICIAR SESIÓN
            </Button>

            <p className="text-center text-white mt-4">
              ¿No tienes una cuenta?{" "}
              <Link to="/registro" className="underline">
                Regístrate aquí
              </Link>
            </p>
          </form>
        </div>
      </div>

      <div className="hidden md:block md:w-1/2 bg-green-400/80 relative" />
    </div>
  );
};
