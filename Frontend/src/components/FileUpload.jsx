import React, { useState, useRef, useEffect } from 'react';
import uploadIcon from '/img/excel.png'; // Ruta correcta
import '../css/Formulario.css'; // Ruta correcta

const FileUpload = ({ onFileUpload }) => {
  const [fileName, setFileName] = useState('');
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

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

  const handleUpload = () => {
    if (file) {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('file', file);

      fetch(`${apiBaseUrl}/apupload/upload`, {
        method: 'POST',
        body: formData,
      })
        .then(response => response.json())
        .then(data => {
          alert('Archivo cargado exitosamente.');
          setFileName('');
          setFile(null);
          fileInputRef.current.value = null;
          onFileUpload(); // Llama a la función para actualizar la tabla
        })
        .catch(error => {
          console.error('Error al subir archivo:', error);
        })
        .finally(() => {
          setIsLoading(false);
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
        {isLoading && (
          <div className="spinner">
            <div className="loader"></div>
            <p>Cargando datos...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
