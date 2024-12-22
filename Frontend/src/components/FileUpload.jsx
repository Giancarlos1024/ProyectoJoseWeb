import React, { useState, useRef } from 'react';
import uploadIcon from '/img/excel.png'; // Asegúrate de tener la ruta correcta
import '../css/Formulario.css'; // Asegúrate de tener la ruta correcta

const FileUpload = () => {
  const [fileName, setFileName] = useState('');
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    if (event.target.files.length > 0) {
      const selectedFile = event.target.files[0];
      setFileName(selectedFile.name);
      setFile(selectedFile);
    } else {
      setFileName('');
      setFile(null);
    }
  };

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';


  const handleUpload = () => {
    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      fetch(`${apiBaseUrl}/api/upload`, { 
        method: 'POST',
        body: formData,
      })
        .then(response => response.json())
        .then(data => {
          alert('Archivo cargado exitosamente Sinot');
          // Aquí puedes manejar la respuesta del servidor
          // Limpiar el estado después de la carga si es necesario
          setFileName('');
          setFile(null);
        })
        .catch(error => {
          console.error('Error uploading file:', error);
        });
    }
  };

  return (
    <div className='contenedor-excel'>
      <p className='textoexcel'>SINOT IMPORTAR</p>
      <div>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <div className='contenedor-archivo-subido'>
          <img
            src={uploadIcon}
            alt="Subir Archivo"
            className="uploadIcon"
            onClick={handleClick}
          />
          {fileName && <p className="fileName">{fileName}</p>}
          
      
        </div>
        {file && (
          <button className="uploadButton buttonArchivo" onClick={handleUpload}>
            Subir Archivo
          </button>
          )}
      </div>
    </div>
  );
};

export default FileUpload;
