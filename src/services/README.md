# 📡 Servicios de API - Rescate Animal

## ✅ Endpoints Implementados

### 🔐 Autenticación (`authService.ts`)
- `POST /users` - Registro de usuario
- `POST /users/login` - Login de usuario

### 🐾 Datos Principales (`dataService.ts`)
- `GET /animales` - Obtener todos los animales
- `POST /animales` - Crear animal
- `PUT /animales/{id}` - Actualizar animal
- `DELETE /animales/{id}` - Eliminar animal

- `GET /rescatistas` - Obtener todos los rescatistas
- `POST /rescatistas` - Crear rescatista
- `PUT /rescatistas/{id}` - Actualizar rescatista
- `DELETE /rescatistas/{id}` - Eliminar rescatista

- `GET /veterinarios` - Obtener todos los veterinarios
- `POST /veterinarios` - Crear veterinario
- `PUT /veterinarios/{id}` - Actualizar veterinario
- `DELETE /veterinarios/{id}` - Eliminar veterinario

- `GET /adopciones` - Obtener todas las adopciones

### 🏥 Servicios Médicos (`medicalService.ts`)
- `POST /evaluations` - Crear evaluación médica
- `GET /evaluations` - Obtener todas las evaluaciones
- `GET /evaluations?nombreAnimal={name}` - Obtener evaluaciones por animal

- `POST /tratamientos` - Crear tratamiento
- `GET /tratamientos` - Obtener todos los tratamientos
- `GET /tratamientos?nombreAnimal={name}` - Obtener tratamientos por animal

### 🚚 Transferencias y Liberaciones (`transferService.ts`)
- `POST /transfers` - Crear transferencia/traslado
- `GET /transfers` - Obtener todas las transferencias
- `GET /transfers?nombreAnimal={name}` - Obtener transferencias por animal

- `POST /liberaciones` - Crear liberación
- `GET /liberaciones` - Obtener todas las liberaciones
- `GET /liberaciones?nombreAnimal={name}` - Obtener liberaciones por animal

## 🔧 Configuración

### Variables de Entorno
```env
VITE_API_URL=http://localhost:5000/api
```

### Uso Básico
```typescript
import { createAnimal } from './services/dataService';
import { createEvaluation } from './services/medicalService';

// Crear animal
const animalData = {
  nombre: "Firulais",
  especie: "Canis lupus familiaris",
  // ... resto de datos
};

const response = await createAnimal(animalData);
```

## 📋 Validaciones Requeridas

### Para Evaluaciones/Tratamientos:
- `responsableNombre` debe existir en la tabla `veterinarios`

### Para Transferencias/Liberaciones:
- `nombreAnimal` debe existir en la tabla `animales`

## 🎯 Próximos Pasos

1. **Implementar hooks personalizados** para cada servicio
2. **Agregar manejo de errores** centralizado
3. **Implementar cache** con React Query
4. **Agregar validaciones** de formularios
5. **Crear componentes** para cada funcionalidad
