import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

import { Register } from "./screens/Usuario/Registro/Registro";
import { Login } from "./screens/Usuario/Login/Login";
import { PetsList } from "./screens/Animal/PetsList/PetsList";
import { Home } from "./screens/Home/Home";
import { MedicalEvaluation } from "./screens/Medico/MedicalEvaluation/MedicalEvaluation";
import { EditMedicalEvaluation } from "./screens/Medico/EditMedicalEvaluation/EditMedicalEvaluation";
import { Geolocation } from "./screens/Geolocalizacion/Geolocation/Geolocation";
import { TransferHistory } from "./screens/Transferencias/TransferHistory/TransferHistory";
import { EditTransferHistory } from "./screens/Transferencias/EditTransferHistory/EditTransferHistory";
import { Reports } from "./screens/Reports/Reports";
import { Management } from "./screens/Gestiones/Management/Management";
import { MedicalTreatmentView } from "./screens/Medico/MedicalTreatment/MedicalTreatment";
import { Veterinario } from "./screens/Veterinarios/Veterinario/Veterinario";
import { VeterinarianList } from "./screens/Veterinarios/VeterinarioList";
import { Adopciones } from "./screens/Gestiones/Adopciones/Adopciones";
import { Liberaciones } from "./screens/Gestiones/Liberaciones/Liberaciones";
import { RescuerDetails } from "./screens/Rescatista/RescuerDetails/RescuerDetails";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          
          {/* Rutas protegidas */}
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/pets" element={<ProtectedRoute><PetsList /></ProtectedRoute>} />
          <Route path="/medical-evaluation/:id" element={<ProtectedRoute><MedicalEvaluation /></ProtectedRoute>} />
          <Route path="/medical-evaluation/:id/edit" element={<ProtectedRoute><EditMedicalEvaluation /></ProtectedRoute>} />
          <Route path="/geolocation/:id" element={<ProtectedRoute><Geolocation /></ProtectedRoute>} />
          <Route path="/transfer-history/:id" element={<ProtectedRoute><TransferHistory /></ProtectedRoute>} />
          <Route path="/transfer-history/:id/edit" element={<ProtectedRoute><EditTransferHistory /></ProtectedRoute>} />
          <Route path="/medical-treatment/:id" element={<ProtectedRoute><MedicalTreatmentView /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/management" element={<ProtectedRoute><Management /></ProtectedRoute>} />
          <Route path="/login" element={<Navigate to="/home" replace />} />
          <Route path="/veterinarios" element={<ProtectedRoute><VeterinarianList /></ProtectedRoute>} />
          <Route path="/veterinario/:id" element={<ProtectedRoute><Veterinario /></ProtectedRoute>} />
          <Route path="/adopciones" element={<ProtectedRoute><Adopciones /></ProtectedRoute>} />
          <Route path="/liberaciones" element={<ProtectedRoute><Liberaciones /></ProtectedRoute>} />
          <Route path="/rescuerdetails/:id" element={<ProtectedRoute><RescuerDetails /></ProtectedRoute>} />
        </Routes>
      </Router>
    </ThemeProvider>
  </StrictMode>
);
