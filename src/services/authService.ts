import { api } from "../lib/api";

interface RegisterData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

interface LoginData {
  username: string;
  password: string;
}

// 🟢 Registro de usuario
export const registerUser = (data: RegisterData) => {
  return api.post("/users/register", data);
};

// 🟢 Login de usuario
export const loginUser = (data: LoginData) => {
  return api.post("/users/login", data);
};
