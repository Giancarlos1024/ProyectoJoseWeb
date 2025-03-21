import React, { useContext, useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../css/Admin.css';
import { UserContext } from '../Provider/UserContext';
import { Formulario } from '../components/Formulario';
import { Formulario2 } from '../components/Formulario2';

const Admin = () => {
  const navigate = useNavigate();
  const { username } = useContext(UserContext);
  const userRole = localStorage.getItem('userRole'); // Obtener el rol del usuario
  const [formattedDate, setFormattedDate] = useState('');
  // const isAdmin = userRole === 'Admin';

  const allowedRoles = ['Admin', 'Jefe de Area']; // Lista de roles permitidos
  const canAccessPanel = allowedRoles.includes(userRole);

  const [formularioSeleccionado, setFormularioSeleccionado] = useState('sinot'); // Estado para seleccionar el formulario
  const location = useLocation(); // Obtener la ruta actual

  useEffect(() => {
    const updateDate = () => {
      const today = new Date();
      const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: 'numeric', 
        second: 'numeric',  
        hour12: true 
      };
      const formatted = today.toLocaleDateString('es-ES', options);
      setFormattedDate(formatted);
    };

    const intervalId = setInterval(updateDate, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  const confirmLogout = () => {
    Swal.fire({
      title: '¿Estás seguro de que quieres cerrar sesión?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#81BB49',
      cancelButtonColor: '#B1B1B1',
      confirmButtonText: 'Sí',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.isConfirmed) {
        handleLogout();
        Swal.fire(
          'Cerrado!',
          'Tu sesión ha sido cerrada.',
          'success'
        );
      }
    });
  };

  // Verifica si estamos en la ruta "/admin/formulario"
  const isFormularioRoute = location.pathname === '/admin/formulario';

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <div className="headerLogo">
          <img className="logoStyle" src="/img/LogoNotix.jpeg" alt="Error" />
        </div>
        <div className="nav-container">
          <nav>
            <ul>
              {canAccessPanel && ( // Solo muestra el Panel de Control si el usuario tiene un rol permitido
                <li>
                  <NavLink
                    to="/admin/panel"
                    className={({ isActive }) => (isActive ? 'active' : '')}
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && <div className="active-bar"></div>}
                        <img 
                          src={isActive ? "/img/homeActivo.png" : "/img/home.png"} 
                          alt="icono del panel" 
                          className="iconNavDashboard" 
                        />
                        Panel de control
                      </>
                    )}
                  </NavLink>
                </li>
              )}
              <li>
                <NavLink
                  to="/admin/formulario"
                  className={({ isActive }) => (isActive ? 'active' : '')}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && <div className="active-bar"></div>}
                      <img src={isActive ? "/img/ingresarfacturasActivo.png" : "/img/ingresarfacturas.png"} alt="error" className="iconNavDashboard" />
                      Formularios
                    </>
                  )}
                </NavLink>
              </li>
            </ul>
          </nav>
        </div>
        <button onClick={confirmLogout} className="logout-button">
          <img src="/img/close.png" alt="error" className="iconNavDashboard" />
          Cerrar sesión
        </button>
      </div>

      <div className="containerPanel">
        <div className="user-info">
          <h3>👋🏼 Hola : {username}</h3>
          <div>
            <h4>Resumen de Hoy</h4>
            <p>{formattedDate}</p>
          </div>
        </div>

        <div className="content">
          {/* Solo se renderiza el Outlet si no estamos en la ruta "/admin/formulario" */}
          {!isFormularioRoute && <Outlet />}

          {/* Solo aparece si estamos en /admin/formulario */}
          {isFormularioRoute && (
            <>
              {/* <div className="form-selector">
                <button onClick={() => setFormularioSeleccionado('sinot')} className={formularioSeleccionado === 'sinot' ? 'active' : ''}>
                  SINOT
                </button>
                <button onClick={() => setFormularioSeleccionado('notssb')} className={formularioSeleccionado === 'notssb' ? 'active' : ''}>
                  NOT SSB
                </button>
              </div>

              {formularioSeleccionado === 'sinot' && <Formulario />}
              {formularioSeleccionado === 'notssb' && <Formulario2 />} */}
              <Formulario />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
