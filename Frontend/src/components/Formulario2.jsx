import React, { useState, useEffect} from 'react';
import '../css/Not_ssb.css';
import Modal from 'react-modal';
import jsPDF from 'jspdf';
import { PDFDocument, rgb } from 'pdf-lib';

export const Formulario2 = () => {
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState({
    Id: '',
    Falla: '',
    Notif: '',
    Zona: '',
    Agencia: '',
    Tarifa: '',
    RPU: '',
    Cuenta: '',
    Nombre: '',
    Calculo: '',
    Elaboro: '',
    Kwh: '',
    Energia: '',
    IVA: '',
    DAP: '',
    Total: '',
    Fecha_Ultimo_Status: '',
    Status_Actual: ''
  });


  const [oficinas, setOficinas] = useState([]);

  const [editing, setEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [filters, setFilters] = useState({
    notif: '',
    year: ''
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pdfData, setPdfData] = useState(null);
  const [selectedPDF, setSelectedPDF] = useState(null); // Estado para tipo de PDF
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || 'user');

  const [selectedRecord, setselectedRecord] = useState(null);

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };


  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

  const fetchRecords = async (page = 1) => {
    try {
      const response = await fetch(`${apiBaseUrl}/apinotssb/notssb?page=${page}&pageSize=10`);
      const data = await response.json();
      setRecords(data);
      
      // Obtener el conteo total de registros
      const countResponse = await fetch(`${apiBaseUrl}/apinotssb/recordcount?notif=${filters.notif}&year=${filters.year}`);
      const countData = await countResponse.json();
      const totalRecords = countData.count;
      setTotalPages(Math.ceil(totalRecords / 10));
    } catch (error) {
      console.error('Error fetching records:', error);
    }
  };
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Convierte las fechas al formato que el servidor espera
    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      return date.toISOString();
    };
  
    const formData = {
      ...form,
      Elaboro: formatDate(form.Elaboro),
      Fecha_Ultimo_Status: formatDate(form.Fecha_Ultimo_Status),
    };
  
    try {
      if (editing) {
        await fetch(`${apiBaseUrl}/apinotssb/notssb/${currentId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
        setRecords(records.map((record) =>
          record.Id === currentId ? { ...formData, Id: currentId } : record
        ));
      } else {
        const response = await fetch(`${apiBaseUrl}/apinotssb/notssb`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
        const newRecord = await response.json();
        setRecords([...records, newRecord]);
      }
      setForm({
        Id: '',
        Falla: '',
        Notif: '',
        Zona: '',
        Agencia: '',
        Tarifa: '',
        RPU: '',
        Cuenta: '',
        Nombre: '',
        Calculo: '',
        Elaboro: '',
        Kwh: '',
        Energia: '',
        IVA: '',
        DAP: '',
        Total: '',
        Fecha_Ultimo_Status: '',
        Status_Actual: ''
      });
    
      setEditing(false);
      setCurrentId(null);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };
  
  const handleEdit = async (id) => {
    try {
      const response = await fetch(`${apiBaseUrl}/apinotssb/notssb/${id}`);
      const data = await response.json();
  
      // Convierte las fechas al formato requerido por `datetime-local`
      const formatDateTime = (dateStr) => {
        const date = new Date(dateStr);
        return date.toISOString().slice(0, 16);
      };
  
      setForm({
        ...data,
        Elaboro: formatDateTime(data.Elaboro),
        Calculo: formatDateTime(data.Calculo),
        Fecha_Ultimo_Status: formatDateTime(data.Fecha_Ultimo_Status),
      });
  
      setEditing(true);
      setCurrentId(id);
    } catch (error) {
      console.error('Error fetching record for editing:', error);
    }
  };
  

  const handleDelete = async (id) => {
    try {
      await fetch(`${apiBaseUrl}/apinotssb/notssb/${id}`, {
        method: 'DELETE',
      });
      setRecords(records.filter((record) => record.Id !== id));
    } catch (error) {
      console.error('Error deleting record:', error);
    }
  };

  const applyFilters = async () => {
    try {
      const queryParams = new URLSearchParams({...filters, page: currentPage, pageSize: 10}).toString();
      const response = await fetch(`${apiBaseUrl}/apinotssb/notssb?${queryParams}`);
      const data = await response.json();
      setRecords(data);
      
      // Obtener el conteo total de registros
      const countResponse = await fetch(`${apiBaseUrl}/apinotssb/recordcount?${queryParams}`);
      const countData = await countResponse.json();
      const totalRecords = countData.count;
      setTotalPages(Math.ceil(totalRecords / 10));
    } catch (error) {
      console.error('Error applying filters:', error);
    }
  };
  
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchRecords(newPage);
  };
  
  const generatePDF = (record) => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [300, 700] // [height, width]
    });
    const logoWidth = 100; // Ajusta el tamaño del logo según sea necesario
    const logoHeight = 50;
    const logo = '/img/logopdf.jpg'; // Aquí deberías colocar la imagen codificada en base64 o la URL de la imagen
    doc.addImage(logo, 'PNG', 20, 20, logoWidth, logoHeight);
    doc.text(`CFE DISTRIBUCION ZONA SANTIAGO`, 20,120);
    doc.text(`ING. JULIO CESAR RAUIZ MONTAÑEZ`, 20,140);
    doc.text(`PRIMERA CORREGIDORA Y GRAL. NEGRETE`, 20,160);
    doc.text(`SANTIAGO IXCUINTLA, NAYARIT. C.P. : 63300`, 20,180);
    doc.setFont('helvetica', 'bold');
    doc.text(`${record.Nombre}`, 450, 200);
    doc.setFont('helvetica', 'normal');
    doc.text('Agencia: ', 450, 220);
    doc.setFont('helvetica', 'bold');
    doc.text(`${record.Agencia}`, 520, 220);
    doc.setFont('helvetica', 'normal');
    doc.text(`RPU: ${record.RPU}`, 450, 240);
    doc.text(`Zona: ${record.Zona}`, 450, 260);

    setPdfData(doc.output('datauristring'));
    setSelectedPDF('pdf1'); // Establece el tipo de PDF
    setIsModalOpen(true);
  };



  const generatePDF2 = (oficina) => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [300, 700] // [height, width]
    });

    doc.text('Nombre del destinatario: ESC SEC TEC 33 BENITO JUAREZ', 20, 120);
    doc.text('Domicilio: D C JESUS MARIA', 20, 140);
    doc.text('Entrecalles: ', 20, 160);
    doc.text('Población: JESUS MARIA', 20, 180);


    setPdfData(doc.output('datauristring'));
    setSelectedPDF('pdf2'); // Establece el tipo de PDF
    setIsModalOpen(true);
  };

  const generatePDF3 = async() => {
    
    if (!selectedRecord) {
      console.error('No hay oficina seleccionada');
      return; // Salir si no hay oficina seleccionada
  }

  const existingPdfBytes = await fetch('/01_ajuste_por_revision_EF_V3_sind.pdf').then(res => res.arrayBuffer());
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  const { height } = firstPage.getSize();

  firstPage.drawText(`${selectedRecord.Nombre}`, {
      x: 110,
      y: height - 202,
      size: 9,
      color: rgb(0, 0, 0),
  });
  firstPage.drawText(`${selectedRecord.Zona}`, {
      x: 120,
      y: height - 214,
      size: 9,
      color: rgb(0, 0, 0),
  });
  firstPage.drawText(`${selectedRecord.Agencia}`, {
      x: 122,
      y: height - 240,
      size: 9,
      color: rgb(0, 0, 0),
  });
  firstPage.drawText(`${selectedRecord.RPU}`, {
      x: 102,
      y: height - 252,
      size: 9,
      color: rgb(0, 0, 0),
  });

  // Función para dibujar texto limitado en líneas
  const drawLimitedLineText = (text, x, startY, size, limit, newPositionX, charLimitRest) => {
          let y = startY;
          let startIndex = 0;

          // Dibuja los primeros 54 caracteres
          if (text.length > 0) {
              const firstLine = text.substring(startIndex, Math.min(startIndex + limit, text.length));
              firstPage.drawText(firstLine, {
                  x: x,
                  y: y,
                  size: size,
                  color: rgb(0, 0, 0),
              });
              y -= size + 2; // Ajusta la posición para la siguiente línea
              startIndex += limit; // Mover el índice para la próxima línea
          }

          // Dibuja el resto del texto a partir de la nueva posición
          while (startIndex < text.length) {
              const line = text.substring(startIndex, startIndex + charLimitRest); // Límite de caracteres para el resto
              firstPage.drawText(line, {
                  x: newPositionX,
                  y: y,
                  size: size,
                  color: rgb(0, 0, 0),
              });
              y -= size + 2; // Ajusta la posición para la siguiente línea
              startIndex += charLimitRest; // Mover el índice para la próxima línea
          }
      };

      // Dibuja el texto de Obs_notif
      drawLimitedLineText(
          `${selectedRecord.Obs_notif}`,
          292,          // Posición inicial para los primeros 54 caracteres
          height - 418, // Altura inicial
          8,            // Tamaño de texto
          60,           // Límite de caracteres para la primera línea
          70,           // Nueva posición X para el resto
          93            // Límite de caracteres para el resto del texto
      );

      // Función para dibujar texto limitado en líneas
      const drawLimitedLineText2 = (text, x, startY, size, limit, newPositionX, charLimitRest) => {
          let y = startY;
          let startIndex = 0;

          // Dibuja los primeros 54 caracteres
          if (text.length > 0) {
              const firstLine = text.substring(startIndex, Math.min(startIndex + limit, text.length));
              firstPage.drawText(firstLine, {
                  x: x,
                  y: y,
                  size: size,
                  color: rgb(0, 0, 0),
              });
              y -= size + 2; // Ajusta la posición para la siguiente línea
              startIndex += limit; // Mover el índice para la próxima línea
          }

          // Dibuja el resto del texto a partir de la nueva posición
          while (startIndex < text.length) {
              const line = text.substring(startIndex, startIndex + charLimitRest); // Límite de caracteres para el resto
              firstPage.drawText(line, {
                  x: newPositionX,
                  y: y,
                  size: size,
                  color: rgb(0, 0, 0),
              });
              y -= size + 2; // Ajusta la posición para la siguiente línea
              startIndex += charLimitRest; // Mover el índice para la próxima línea
          }
      };

      // Dibuja el texto de Obs_edo
      drawLimitedLineText2(
          `${selectedRecord.Obs_edo}`,
          70,           // Posición inicial para los primeros 54 caracteres
          height - 580, // Altura inicial
          8,            // Tamaño de texto
          116,          // Límite de caracteres para la primera línea
          70,           // Nueva posición X para el resto
          93            // Límite de caracteres para el resto del texto
      );

      // Obtener la fecha actual y formatearla
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const currentDate = new Date().toLocaleDateString('es-ES', options); // Formato: "miércoles, 23 de octubre de 2024"

      // Dibujar la fecha en el PDF
      firstPage.drawText(currentDate, {
          x: 394,              // Posición X
          y: height - 149,     // Posición Y, ajusta según sea necesario
          size: 10,             // Tamaño de texto
          color: rgb(0, 0, 0), // Color del texto
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfData(url);
      setSelectedPDF('pdf3');
      setIsModalOpen(true);
  };
  const generatePDF4 = async() => {
  
    if (!selectedRecord) {
      console.error('No hay oficina seleccionada');
      return; // Salir si no hay oficina seleccionada
  }

  const existingPdfBytes = await fetch('/02_ajuste_por_revision_FM_V3_sind.pdf').then(res => res.arrayBuffer());
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  const { height } = firstPage.getSize();

  firstPage.drawText(`${selectedRecord.Nombre}`, {
      x: 108,
      y: height - 188,
      size: 9,
      color: rgb(0, 0, 0),
  });
  firstPage.drawText(`${selectedRecord.Zona}`, {
      x: 120,
      y: height - 200,
      size: 9,
      color: rgb(0, 0, 0),
  });
  firstPage.drawText(`${selectedRecord.Agencia}`, {
      x: 124,
      y: height - 226,
      size: 9,
      color: rgb(0, 0, 0),
  });
  firstPage.drawText(`${selectedRecord.RPU}`, {
      x: 100,
      y: height - 238,
      size: 9,
      color: rgb(0, 0, 0),
  });

  // Función para dibujar texto limitado en líneas
  const drawLimitedLineText = (text, x, startY, size, limit, newPositionX, charLimitRest) => {
          let y = startY;
          let startIndex = 0;

          // Dibuja los primeros 54 caracteres
          if (text.length > 0) {
              const firstLine = text.substring(startIndex, Math.min(startIndex + limit, text.length));
              firstPage.drawText(firstLine, {
                  x: x,
                  y: y,
                  size: size,
                  color: rgb(0, 0, 0),
              });
              y -= size + 2; // Ajusta la posición para la siguiente línea
              startIndex += limit; // Mover el índice para la próxima línea
          }

          // Dibuja el resto del texto a partir de la nueva posición
          while (startIndex < text.length) {
              const line = text.substring(startIndex, startIndex + charLimitRest); // Límite de caracteres para el resto
              firstPage.drawText(line, {
                  x: newPositionX,
                  y: y,
                  size: size,
                  color: rgb(0, 0, 0),
              });
              y -= size + 2; // Ajusta la posición para la siguiente línea
              startIndex += charLimitRest; // Mover el índice para la próxima línea
          }
      };

      // Dibuja el texto de Obs_notif
      drawLimitedLineText(
          `${selectedRecord.Obs_notif}`,
          292,          // Posición inicial para los primeros 54 caracteres
          height - 404, // Altura inicial
          8,            // Tamaño de texto
          60,           // Límite de caracteres para la primera línea
          70,           // Nueva posición X para el resto
          93            // Límite de caracteres para el resto del texto
      );

      // Función para dibujar texto limitado en líneas
      const drawLimitedLineText2 = (text, x, startY, size, limit, newPositionX, charLimitRest) => {
          let y = startY;
          let startIndex = 0;

          // Dibuja los primeros 54 caracteres
          if (text.length > 0) {
              const firstLine = text.substring(startIndex, Math.min(startIndex + limit, text.length));
              firstPage.drawText(firstLine, {
                  x: x,
                  y: y,
                  size: size,
                  color: rgb(0, 0, 0),
              });
              y -= size + 2; // Ajusta la posición para la siguiente línea
              startIndex += limit; // Mover el índice para la próxima línea
          }

          // Dibuja el resto del texto a partir de la nueva posición
          while (startIndex < text.length) {
              const line = text.substring(startIndex, startIndex + charLimitRest); // Límite de caracteres para el resto
              firstPage.drawText(line, {
                  x: newPositionX,
                  y: y,
                  size: size,
                  color: rgb(0, 0, 0),
              });
              y -= size + 2; // Ajusta la posición para la siguiente línea
              startIndex += charLimitRest; // Mover el índice para la próxima línea
          }
      };

      // Dibuja el texto de Obs_edo
      drawLimitedLineText2(
          `${selectedRecord.Obs_edo}`,
          223,           // Posición inicial para los primeros 54 caracteres
          height - 470, // Altura inicial
          8,            // Tamaño de texto
          78,          // Límite de caracteres para la primera línea
          70,           // Nueva posición X para el resto
          93            // Límite de caracteres para el resto del texto
      );

      // Obtener la fecha actual y formatearla
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const currentDate = new Date().toLocaleDateString('es-ES', options); // Formato: "miércoles, 23 de octubre de 2024"

      // Dibujar la fecha en el PDF
      firstPage.drawText(currentDate, {
          x: 394,              // Posición X
          y: height - 148,     // Posición Y, ajusta según sea necesario
          size: 10,             // Tamaño de texto
          color: rgb(0, 0, 0), // Color del texto
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfData(url);
      setSelectedPDF('pdf4');
      setIsModalOpen(true);
  };
  const generatePDF5 = async() => {
    
    if (!selectedRecord) {
      console.error('No hay oficina seleccionada');
      return; // Salir si no hay oficina seleccionada
    }
  
    const existingPdfBytes = await fetch('/03_ajuste_por_revision_UI_sin_contrato_V3_sind.pdf').then(res => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { height } = firstPage.getSize();
  
    firstPage.drawText(`${selectedRecord.Nombre}`, {
        x: 190,
        y: height - 213,
        size: 9,
        color: rgb(0, 0, 0),
    });
    firstPage.drawText(`${selectedRecord.Zona}`, {
        x: 120,
        y: height - 224,
        size: 9,
        color: rgb(0, 0, 0),
    });
    firstPage.drawText(`${selectedRecord.Agencia}`, {
        x: 124,
        y: height - 250,
        size: 9,
        color: rgb(0, 0, 0),
    });
    // firstPage.drawText(`${selectedRecord.rpu}`, {
    //     x: 100,
    //     y: height - 238,
    //     size: 9,
    //     color: rgb(0, 0, 0),
    // });
  
    // Función para dibujar texto limitado en líneas
    const drawLimitedLineText = (text, x, startY, size, limit, newPositionX, charLimitRest) => {
            let y = startY;
            let startIndex = 0;
  
            // Dibuja los primeros 54 caracteres
            if (text.length > 0) {
                const firstLine = text.substring(startIndex, Math.min(startIndex + limit, text.length));
                firstPage.drawText(firstLine, {
                    x: x,
                    y: y,
                    size: size,
                    color: rgb(0, 0, 0),
                });
                y -= size + 2; // Ajusta la posición para la siguiente línea
                startIndex += limit; // Mover el índice para la próxima línea
            }
  
            // Dibuja el resto del texto a partir de la nueva posición
            while (startIndex < text.length) {
                const line = text.substring(startIndex, startIndex + charLimitRest); // Límite de caracteres para el resto
                firstPage.drawText(line, {
                    x: newPositionX,
                    y: y,
                    size: size,
                    color: rgb(0, 0, 0),
                });
                y -= size + 2; // Ajusta la posición para la siguiente línea
                startIndex += charLimitRest; // Mover el índice para la próxima línea
            }
        };
  
        // Dibuja el texto de Obs_notif
        drawLimitedLineText(
            `${selectedRecord.Obs_notif}`,
            244,           // Posición inicial para los primeros 54 caracteres
            height - 465, // Altura inicial
            8,            // Tamaño de texto
            68,          // Límite de caracteres para la primera línea
            70,           // Nueva posición X para el resto
            93            // Límite de caracteres para el resto del texto
        );
  
        // Función para dibujar texto limitado en líneas
        const drawLimitedLineText2 = (text, x, startY, size, limit, newPositionX, charLimitRest) => {
            let y = startY;
            let startIndex = 0;
  
            // Dibuja los primeros 54 caracteres
            if (text.length > 0) {
                const firstLine = text.substring(startIndex, Math.min(startIndex + limit, text.length));
                firstPage.drawText(firstLine, {
                    x: x,
                    y: y,
                    size: size,
                    color: rgb(0, 0, 0),
                });
                y -= size + 2; // Ajusta la posición para la siguiente línea
                startIndex += limit; // Mover el índice para la próxima línea
            }
  
            // Dibuja el resto del texto a partir de la nueva posición
            while (startIndex < text.length) {
                const line = text.substring(startIndex, startIndex + charLimitRest); // Límite de caracteres para el resto
                firstPage.drawText(line, {
                    x: newPositionX,
                    y: y,
                    size: size,
                    color: rgb(0, 0, 0),
                });
                y -= size + 2; // Ajusta la posición para la siguiente línea
                startIndex += charLimitRest; // Mover el índice para la próxima línea
            }
        };
  
        // Dibuja el texto de Obs_edo
        // drawLimitedLineText2(
        //     `${selectedRecord.Obs_edo}`,
        //     223,           // Posición inicial para los primeros 54 caracteres
        //     height - 470, // Altura inicial
        //     8,            // Tamaño de texto
        //     78,          // Límite de caracteres para la primera línea
        //     70,           // Nueva posición X para el resto
        //     93            // Límite de caracteres para el resto del texto
        // );
  
        // Obtener la fecha actual y formatearla
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const currentDate = new Date().toLocaleDateString('es-ES', options); // Formato: "miércoles, 23 de octubre de 2024"
  
        // Dibujar la fecha en el PDF
        firstPage.drawText(currentDate, {
            x: 393,              // Posición X
            y: height - 135,     // Posición Y, ajusta según sea necesario
            size: 10,             // Tamaño de texto
            color: rgb(0, 0, 0), // Color del texto
        });
  
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setPdfData(url);
        setSelectedPDF('pdf5');
        setIsModalOpen(true);
  };
  const generatePDF6 = async() => {
    if (!selectedRecord) {
      console.error('No hay oficina seleccionada');
      return; // Salir si no hay oficina seleccionada
    }
  
    const existingPdfBytes = await fetch('/04_ajuste_por_revision_UI_con_contrato_V3_sind.pdf').then(res => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { height } = firstPage.getSize();
  
    firstPage.drawText(`${selectedRecord.Nombre}`, {
        x: 110,
        y: height - 188,
        size: 9,
        color: rgb(0, 0, 0),
    });
    firstPage.drawText(`${selectedRecord.Zona}`, {
        x: 120,
        y: height - 200,
        size: 9,
        color: rgb(0, 0, 0),
    });
    // firstPage.drawText(`${selectedRecord.Ciudad}`, {
    //     x: 122,
    //     y: height - 230,
    //     size: 9,
    //     color: rgb(0, 0, 0),
    // });
    firstPage.drawText(`${selectedRecord.RPU}`, {
        x: 102,
        y: height - 225,
        size: 9,
        color: rgb(0, 0, 0),
    });
  
    // Función para dibujar texto limitado en líneas
    const drawLimitedLineText = (text, x, startY, size, limit, newPositionX, charLimitRest) => {
            let y = startY;
            let startIndex = 0;
  
            // Dibuja los primeros 54 caracteres
            if (text.length > 0) {
                const firstLine = text.substring(startIndex, Math.min(startIndex + limit, text.length));
                firstPage.drawText(firstLine, {
                    x: x,
                    y: y,
                    size: size,
                    color: rgb(0, 0, 0),
                });
                y -= size + 2; // Ajusta la posición para la siguiente línea
                startIndex += limit; // Mover el índice para la próxima línea
            }
  
            // Dibuja el resto del texto a partir de la nueva posición
            while (startIndex < text.length) {
                const line = text.substring(startIndex, startIndex + charLimitRest); // Límite de caracteres para el resto
                firstPage.drawText(line, {
                    x: newPositionX,
                    y: y,
                    size: size,
                    color: rgb(0, 0, 0),
                });
                y -= size + 2; // Ajusta la posición para la siguiente línea
                startIndex += charLimitRest; // Mover el índice para la próxima línea
            }
        };
  
        // Dibuja el texto de Obs_notif
        drawLimitedLineText(
            `${selectedRecord.Obs_notif}`,
            292,           // Posición inicial para los primeros 54 caracteres
            height - 403, // Altura inicial
            8,            // Tamaño de texto
            60,          // Límite de caracteres para la primera línea
            70,           // Nueva posición X para el resto
            93            // Límite de caracteres para el resto del texto
        );
  
        // Función para dibujar texto limitado en líneas
        const drawLimitedLineText2 = (text, x, startY, size, limit, newPositionX, charLimitRest) => {
            let y = startY;
            let startIndex = 0;
  
            // Dibuja los primeros 54 caracteres
            if (text.length > 0) {
                const firstLine = text.substring(startIndex, Math.min(startIndex + limit, text.length));
                firstPage.drawText(firstLine, {
                    x: x,
                    y: y,
                    size: size,
                    color: rgb(0, 0, 0),
                });
                y -= size + 2; // Ajusta la posición para la siguiente línea
                startIndex += limit; // Mover el índice para la próxima línea
            }
  
            // Dibuja el resto del texto a partir de la nueva posición
            while (startIndex < text.length) {
                const line = text.substring(startIndex, startIndex + charLimitRest); // Límite de caracteres para el resto
                firstPage.drawText(line, {
                    x: newPositionX,
                    y: y,
                    size: size,
                    color: rgb(0, 0, 0),
                });
                y -= size + 2; // Ajusta la posición para la siguiente línea
                startIndex += charLimitRest; // Mover el índice para la próxima línea
            }
        };
  
        //Dibuja el texto de Obs_edo
        drawLimitedLineText2(
            `${selectedRecord.Obs_edo}`,
            105,           // Posición inicial para los primeros 54 caracteres
            height - 555, // Altura inicial
            8,            // Tamaño de texto
            100,          // Límite de caracteres para la primera línea
            70,           // Nueva posición X para el resto
            104           // Límite de caracteres para el resto del texto
        );
  
        // Obtener la fecha actual y formatearla
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const currentDate = new Date().toLocaleDateString('es-ES', options); // Formato: "miércoles, 23 de octubre de 2024"
  
        // Dibujar la fecha en el PDF
        firstPage.drawText(currentDate, {
            x: 393,              // Posición X
            y: height - 148,     // Posición Y, ajusta según sea necesario
            size: 10,             // Tamaño de texto
            color: rgb(0, 0, 0), // Color del texto
        });
  
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setPdfData(url);
        setSelectedPDF('pdf6');
        setIsModalOpen(true);
  };



  const closeModal = () => {
    setIsModalOpen(false);
    setPdfData(null);
    setSelectedPDF(null); // Resetea el tipo de PDF
  };

  const downloadPDF = () => {
    if (pdfData) {
      const link = document.createElement('a');
      link.href = pdfData;
      link.download = `Sobre Manual_${form.Notif || ''}.pdf`;
      link.click();
    }
  };


  const handleOnClick = (record) => {
    setselectedRecord(record);  // Almacena la oficina en el estado
    generatePDF(record);          // Genera el PDF
  };



  return (
    <div>
      {userRole === 'Admin' && (
        <div>
          <h2>{editing ? 'MODIFICAR REGISTRO NOT SSB' : 'CREAR REGISTRO NOT SSB'}</h2>
          <form className='form-notsbb' onSubmit={handleSubmit}>
            <div>
              <div>
                <label>FALLA</label>
                <input
                  type="text"
                  name="Falla"
                  value={form.Falla}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label>NOTIF</label>
                <input
                  type="number"
                  name="Notif"
                  value={form.Notif}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label>ZONA</label>
                <input
                  type="text"
                  name="Zona"
                  value={form.Zona}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label>AGENCIA</label>
                <input
                  type="text"
                  name="Agencia"
                  value={form.Agencia}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label>NOMBRE</label>
                <input
                  type="text"
                  name="Nombre"
                  value={form.Nombre}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <div>
                <label>TARIFA</label>
                <input
                  type="text"
                  name="Tarifa"
                  value={form.Tarifa}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label>RPU</label>
                <input
                  type="number"
                  name="RPU"
                  value={form.RPU}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label>CUENTA</label>
                <input
                  type="text"
                  name="Cuenta"
                  value={form.Cuenta}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label>CALCULO</label>
                <input
                  type="datetime-local"
                  name="Calculo"
                  value={form.Calculo}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label>ELABORO</label>
                <input
                  type="datetime-local"
                  name="Elaboro"
                  value={form.Elaboro}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <div>
                <label>KWH</label>
                <input
                  type="number"
                  name="Kwh"
                  step="0.001"
                  value={form.Kwh}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label>ENERGIA</label>
                <input
                  type="number"
                  name="Energia"
                  step="0.01"
                  value={form.Energia}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label>IVA</label>
                <input
                  type="number"
                  name="IVA"
                  step="0.01"
                  value={form.IVA}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label>DAP</label>
                <input
                  type="number"
                  name="DAP"
                  step="0.01"
                  value={form.DAP}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label>TOTAL</label>
                <input
                  type="number"
                  name="Total"
                  step="0.01"
                  value={form.Total}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <div>
                <label>FECHA_ULTIMO_STATUS</label>
                <input
                  type="datetime-local"
                  name="Fecha_Ultimo_Status"
                  value={form.Fecha_Ultimo_Status}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label>STATUS_ACTUAL</label>
                <input
                  type="text"
                  name="Status_Actual"
                  value={form.Status_Actual}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className='botones-bot'>
              <button className='button-notssb' type="submit">{editing ? 'Actualizar' : 'Crear'}</button>
              {editing && (
                <button
                  type="button"
                  className='button-notssb'
                  onClick={() => {
                    setEditing(false);
                    setCurrentId(null);
                    setForm({
                      Id: '',
                      Falla: '',
                      Notif: '',
                      Zona: '',
                      Agencia: '',
                      Tarifa: '',
                      RPU: '',
                      Cuenta: '',
                      Nombre: '',
                      Calculo: '',
                      Elaboro: '',
                      Kwh: '',
                      Energia: '',
                      IVA: '',
                      DAP: '',
                      Total: '',
                      Fecha_Ultimo_Status: '',
                      Status_Actual: ''
                    });
                  }}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>

        </div>

      )}
      <h2>REGISTROS DE NOT SSB</h2>
      <div className='contenedor-filtro'>
        
        <input 
          type="text" 
          name="notif" 
          placeholder='Notificación'
          value={filters.notif} 
          onChange={handleFilterChange} 
        />
        <input 
          type="number" 
          name="year"
          placeholder='Año'
          value={filters.year} 
          onChange={handleFilterChange} 
        />
        <button onClick={applyFilters}>Aplicar Filtros</button>
      </div>

      <div className='contenedor-listado'>
        <table>
          <thead className='encabezados-notssb'>
            <tr>
              <th>FALLA</th>
              <th>NOTIF</th>
              <th>ZONA</th>
              <th>AGENCIA</th>
              <th>TARIFA</th>
              <th>RPU</th>
              <th>CUENTA</th>
              <th>NOMBRE</th>
              <th>ELABORO</th>
              <th>KWH</th>
              <th>ENERGIA</th>
              <th>TOTAL</th>
              <th>FECHA_U_S</th>
              <th>STATUS_A</th>
              {userRole === 'Admin' && (
                <th>ACCIONES</th>
              )}
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.Id}>
                <td>{record.Falla}</td>
                <td onClick={() => handleOnClick(record)} style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}>
                  {record.Notif}
                </td>
                <td>{record.Zona}</td>
                <td>{record.Agencia}</td>
                <td>{record.Tarifa}</td>
                <td>{record.RPU}</td>
                <td>{record.Cuenta}</td>
                <td>{record.Nombre}</td>
                <td>{record.Elaboro}</td>
                <td>{record.Kwh}</td>
                <td>{record.Energia}</td>
                <td>{record.Total}</td>
                <td>{record.Fecha_Ultimo_Status}</td>
                <td>{record.Status_Actual}</td>
                {userRole === 'Admin' &&(
                <td>
                  <button className='tabla-notsbb tablebutton-editar' onClick={() => handleEdit(record.Id)}>Editar</button>
                  <button className='tabla-notsbb tablebutton-eliminar' onClick={() => handleDelete(record.Id)}>Eliminar</button>
                </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className='pagination-controls'>
        <button 
          onClick={() => handlePageChange(currentPage - 1)} 
          disabled={currentPage <= 1}
        >
          Anterior
        </button>
        <span>Página {currentPage} de {totalPages}</span>
        <button 
          onClick={() => handlePageChange(currentPage + 1)} 
          disabled={currentPage >= totalPages}
        >
          Siguiente
        </button>
      </div>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Vista Previa del PDF"
        style={{
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            height: '80%',
          },
        }}
      >
        <h2>Vista Previa del PDF</h2>
        <div>
          <button style={{margin:"0px 5px"}} onClick={() => { generatePDF(selectedPDF); }}>S-Manual</button>
          <button style={{margin:"0px 5px"}} onClick={() => { generatePDF2(selectedPDF); }}>AR-EV</button>
          <button style={{margin:"0px 5px"}} onClick={() => { generatePDF3(selectedPDF); }}>AR-EF</button>
          <button style={{margin:"0px 5px"}} onClick={() => { generatePDF4(selectedPDF); }}>AR-FM</button>
          <button style={{margin:"0px 5px"}} onClick={() => { generatePDF5(selectedPDF); }}>AR-UI-SC</button>
          <button style={{margin:"0px 5px"}} onClick={() => { generatePDF6(selectedPDF); }}>AR-UI-CC</button>
        </div>
        {pdfData && <iframe src={pdfData} width="100%" height="100%"></iframe>}
        <button style={{margin:"0px 5px"}} onClick={closeModal}>Cerrar</button>
        <button onClick={downloadPDF}>Descargar PDF</button>
      </Modal>
    </div>
  );
};
