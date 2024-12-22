import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Login.css';
import { UserContext } from '../Provider/UserContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setUsername: setGlobalUsername, setToken } = useContext(UserContext);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(`${apiBaseUrl}/autenticarlogin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      setMessage(data.message);

      if (response.status === 200) {
        setGlobalUsername(username);
        setToken(data.token);
        
        // Guardar en localStorage
        localStorage.setItem('username', username);
        localStorage.setItem('userToken', data.token);
        
        // Guardar el rol del usuario
        localStorage.setItem('userRole', data.role); // 'role' devuelto por el backend

        // Redirigir según el rol
        if (data.role === 'Admin') {
          navigate('/admin/panel');
        } else {
          navigate('/admin/formulario'); // Redirigir a esta ruta si no es Admin
        }
      } else {
        setMessage(data.message || 'Error al iniciar sesión');
      }
    } catch (error) {
      console.error('Error en la solicitud de inicio de sesión:', error);
      setMessage('Error al iniciar sesión');
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className='FondoLogin'>
      <div className="container">
        <form onSubmit={handleSubmit} className="form">
          <div className='logoLogin'>
            <img src="/img/LogoNotix.jpeg" alt="error" />
          </div>
          <h2 className="title">Iniciar sesión</h2>
          <div className="inputGroup">
            <label htmlFor="username">RPE</label>
            <input
              className="input"
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder='Ingresa tu usuario'
              required
            />
          </div>
          <div className="inputGroup">
            <label htmlFor="password">Contraseña</label>
            <div className="passwordInput">
              <input
                className="input"
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='Ingresa tu contraseña'
                required
              />
              <button type="button" onClick={toggleShowPassword} className="togglePassword">
                <img className='inputimagen' src={showPassword ? "/img/ojoabierto.png" : "/img/ojocerrado.png"} alt="toggle visibility" />
              </button>
            </div>
          </div>
          <div className='divButton'>
            <button type="submit" className="button">Ingresar</button>
          </div>
        </form>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
};

export default Login;
