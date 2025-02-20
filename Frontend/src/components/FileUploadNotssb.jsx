import React, { useState, useRef } from 'react';
import uploadIcon from '/img/excel.png'; // Asegúrate de tener la ruta correcta
import '../css/Formulario.css'; // Asegúrate de tener la ruta correcta

const FileUploadNotssb = () => {
  const [fileName2, setFileName2] = useState('');
  const [file, setFile2] = useState(null);
  const [isLoading2, setIsLoading2] = useState(false); // Estado para la animación de carga
  const fileInputRef2 = useRef(null);

  const handleClick = () => {
    fileInputRef2.current.click();
  };

  const handleFileChange2 = (event) => {
    if (event.target.files.length > 0) {
      const selectedFile = event.target.files[0];
      setFileName2(selectedFile.name);
      setFile2(selectedFile);
    } else {
      setFileName2('');
      setFile2(null);
    }
  };

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

  const handleUpload2 = () => {
    if (file) {
      setIsLoading2(true); // Activar animación de carga
      const formData = new FormData();
      formData.append('file', file);

      fetch(`${apiBaseUrl}/apinot/upload2`, { // Cambia esta URL a la de tu endpoint
        method: 'POST',
        body: formData,
      })
        .then(response => response.json())
        .then(data => {
          alert('Archivo cargado exitosamente Not ssb');
          setFileName2('');
          setFile2(null);
        })
        .catch(error => {
          console.error('Error uploading file:', error);
        })
        .finally(() => {
          setIsLoading2(false); // Desactivar animación de carga
        });
    }
  };

  return (
    <div className='contenedor-excel2'>
      <p className='textoexcel'>NOT SSB IMPORTAR</p>
      <div>
        <input
          type="file"
          ref={fileInputRef2}
          style={{ display: 'none' }}
          onChange={handleFileChange2}
        />
        <div className='contenedor-archivo-subido'>
          <img
            src={uploadIcon}
            alt="Subir Archivo"
            className="uploadIcon"
            onClick={handleClick}
          />
          {fileName2 && <p className="fileName">{fileName2}</p>}
        </div>
        {file && (
          <button className="uploadButton buttonArchivo" onClick={handleUpload2}>
            Subir Archivo
          </button>
        )}
        {isLoading2 && (
          <div className="spinner">
            <div className="loader"></div>
            <p>Cargando datos...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploadNotssb;
