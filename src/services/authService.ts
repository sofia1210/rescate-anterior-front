import { api } from "../lib/api";

interface RegisterData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

// 🟢 Registro de usuario
export const registerUser = (data: RegisterData) => {
  return api.post("/users", data);
};

// 🟢 Login de usuario
export const loginUser = (data: LoginData) => {
  return api.post("/users/login", data);
};
