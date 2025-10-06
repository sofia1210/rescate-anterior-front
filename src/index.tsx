import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { StrictRouteGuard } from "./components/StrictRouteGuard";

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
          
          {/* Rutas protegidas con StrictRouteGuard */}
          <Route path="/home" element={<StrictRouteGuard><Home /></StrictRouteGuard>} />
          <Route path="/pets" element={<StrictRouteGuard><PetsList /></StrictRouteGuard>} />
          <Route path="/medical-evaluation/:id" element={<StrictRouteGuard><MedicalEvaluation /></StrictRouteGuard>} />
          <Route path="/medical-evaluation/:id/edit" element={<StrictRouteGuard><EditMedicalEvaluation /></StrictRouteGuard>} />
          <Route path="/geolocation/:id" element={<StrictRouteGuard><Geolocation /></StrictRouteGuard>} />
          <Route path="/transfer-history/:id" element={<StrictRouteGuard><TransferHistory /></StrictRouteGuard>} />
          <Route path="/transfer-history/:id/edit" element={<StrictRouteGuard><EditTransferHistory /></StrictRouteGuard>} />
          <Route path="/medical-treatment/:id" element={<StrictRouteGuard><MedicalTreatmentView /></StrictRouteGuard>} />
          <Route path="/reports" element={<StrictRouteGuard><Reports /></StrictRouteGuard>} />
          <Route path="/management" element={<StrictRouteGuard><Management /></StrictRouteGuard>} />
          <Route path="/login" element={<Navigate to="/home" replace />} />
          <Route path="/veterinarios" element={<StrictRouteGuard><VeterinarianList /></StrictRouteGuard>} />
          <Route path="/veterinario/:id" element={<StrictRouteGuard><Veterinario /></StrictRouteGuard>} />
          <Route path="/adopciones" element={<StrictRouteGuard><Adopciones /></StrictRouteGuard>} />
          <Route path="/liberaciones" element={<StrictRouteGuard><Liberaciones /></StrictRouteGuard>} />
          <Route path="/rescuerdetails/:id" element={<StrictRouteGuard><RescuerDetails /></StrictRouteGuard>} />
        </Routes>
      </Router>
    </ThemeProvider>
  </StrictMode>
);
