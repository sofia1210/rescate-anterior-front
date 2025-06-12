import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import { Register } from "./screens/Usuario/Registro/Registro";
import { Login } from "./screens/Usuario/Login/Login";
import { PetsList } from "./screens/Animal/PetsList/PetsList";
import { MedicalEvaluation } from "./screens/Medico/MedicalEvaluation/MedicalEvaluation";
import { EditMedicalEvaluation } from "./screens/Medico/EditMedicalEvaluation/EditMedicalEvaluation";
import { Geolocation } from "./screens/Geolocalizacion/Geolocation/Geolocation";
import { TransferHistory } from "./screens/Transferencias/TransferHistory/TransferHistory";
import { EditTransferHistory } from "./screens/Transferencias/EditTransferHistory/EditTransferHistory";
import { Reports } from "./screens/Reports/Reports";
import { Management } from "./screens/Gestiones/Management/Management";
import { MedicalTreatmentView } from "./screens/Medico/MedicalTreatment/MedicalTreatment";
import { Veterinario } from "./screens/Veterinarios/Veterinario/Veterinario";
import { Adopciones } from "./screens/Gestiones/Adopciones/Adopciones";
import { Liberaciones } from "./screens/Gestiones/Liberaciones/Liberaciones";
import { RescuerDetails } from "./screens/Rescatista/RescuerDetails/RescuerDetails";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/pets" element={<PetsList />} />
        <Route path="/medical-evaluation/:id" element={<MedicalEvaluation />} />
        <Route path="/medical-evaluation/:id/edit" element={<EditMedicalEvaluation />} />
        <Route path="/geolocation/:id" element={<Geolocation />} />
        <Route path="/transfer-history/:id" element={<TransferHistory />} />
        <Route path="/transfer-history/:id/edit" element={<EditTransferHistory />} />
        <Route path="/medical-treatment/:id" element={<MedicalTreatmentView />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/management" element={<Management />} />
        <Route path="/login" element={<Navigate to="/pets" replace />} />
        <Route path="/veterinario/:id" element={<Veterinario />} />
        <Route path="/adopciones" element={<Adopciones />} />
        <Route path="/liberaciones" element={<Liberaciones />} />
        <Route path="/rescuerdetails/:id" element={<RescuerDetails />} />
      </Routes>
    </Router>
  </StrictMode>
);
