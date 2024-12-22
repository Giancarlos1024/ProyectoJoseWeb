import React, { useContext, useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../css/Admin.css';
import { UserContext } from '../Provider/UserContext'; // Asegúrate de que la ruta sea correcta

const Admin = () => {
  const navigate = useNavigate();
  // Obtiene el contexto del usuario
  const { username } = useContext(UserContext);
  
  const userRole = localStorage.getItem('userRole'); // Obtener el rol del usuario
  const [formattedDate, setFormattedDate] = useState('');

  const isAdmin = userRole === 'Admin'; // Verificar si el usuario es Admin

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

    // Actualiza la fecha cada segundo
    const intervalId = setInterval(updateDate, 1000);

    // Limpia el intervalo cuando el componente se desmonta
    return () => clearInterval(intervalId);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('username'); // Limpia el nombre de usuario también
    localStorage.removeItem('userRole'); // Limpia el rol del usuario
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

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <div className='headerLogo'>
          <img className='logoStyle' src="/img/LogoNotix.jpeg" alt="Error" />
        </div>
        <div className="nav-container">
          <nav>
            <ul>
              {isAdmin && ( // Solo muestra el Panel de control si el usuario es Admin
                <li>
                  <NavLink
                    to="/admin/panel"
                    className={({ isActive }) => (isActive ? 'active' : '')}
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && <div className="active-bar"></div>}
                        <img src={isActive ? "/img/homeActivo.png" : "/img/home.png"} alt="error" className='iconNavDashboard' />
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
                      <img src={isActive ? "/img/ingresarfacturasActivo.png" : "/img/ingresarfacturas.png"} alt="error" className='iconNavDashboard' />
                      SINOT
                    </>
                  )}
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/formulario2"
                  className={({ isActive }) => (isActive ? 'active' : '')}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && <div className="active-bar"></div>}
                      <img src={isActive ? "/img/ingresarfacturasActivo.png" : "/img/ingresarfacturas.png"} alt="error" className='iconNavDashboard' />
                      NOT SSB
                    </>
                  )}
                </NavLink>
              </li>
            </ul>
          </nav>
        </div>
        <button onClick={confirmLogout} className="logout-button">
          <img src="/img/close.png" alt="error" className='iconNavDashboard' />
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
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Admin;
