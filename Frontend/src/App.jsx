// src/App.jsx
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './screens/Login';
import Admin from './screens/Admin';
import {UserProvider} from './Provider/UserContext'; 
import { Formulario } from './components/Formulario';
import { PanelControl } from './screens/PanelControl';
import { Formulario2 } from './components/Formulario2';
import { OficinasProvider } from './components/OficinasContext'; // Debe coincidir con la ruta correcta



function App() {
  return (
    <UserProvider>
        <OficinasProvider>

        <Router>
          <Routes>
            <Route path='/' element={<Login />} />
            <Route path="/admin" element={<Admin />}>
              <Route path="panel" element={<PanelControl />} />
              <Route path="formulario" element={<Formulario />} />
              <Route path="formulario2" element={<Formulario2 />} />
            </Route>
          </Routes>
        </Router>
      
        </OficinasProvider>
    </UserProvider>
  );
}

export default App;
