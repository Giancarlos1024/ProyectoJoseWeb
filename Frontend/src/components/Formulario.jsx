import React, { useState, useEffect,useRef  } from 'react';
import jsPDF from 'jspdf';
import { PDFDocument, rgb } from 'pdf-lib';
import fs from 'fs'; // Si trabajas con Node.js, si no puedes usar fetch
import Modal from 'react-modal';
import '../css/Formulario.css';
import FileUpload from './FileUpload';
import FileUploadNotssb from './FileUploadNotssb';

export const Formulario = () => {
  const [formData, setFormData] = useState({
    Notif: '',
    Fecha_Elab: '',
    rpe_elaboronotif: '',
    Tarifa: '',
    Anomalia: '',
    Programa: '',
    Fecha_Insp: '',
    rpe_inspeccion: '',
    tipo: '',
    Fecha_Cal_Recal: '',
    RPE_Calculo: '',
    Fecha_Inicio: '',
    Fecha_Final: '',
    KHW_Total: '',
    Imp_Energia: '',
    Imp_Total: '',
    Fecha_Venta: '',
    rpe_venta: '',
    Operacion: '',
    Fecha_Operacion: '',
    rpe_operacion: '',
    Nombre: '',
    Direccion: '',
    rpu: '',
    Ciudad: '',
    Cuenta: '',
    Cve_Agen: '',
    Agencia: '',
    Zona_A: '',
    Zona_B: '',
    medidor_inst: '',
    medidor_ret: '',
    Obs_notif: '',
    Obs_edo: '',
    Obs_term: ''
  });

  

  const [oficinas, setOficinas] = useState([]);
  const [editId, setEditId] = useState(null);
  const [filters, setFilters] = useState({
    notif: '',year: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pdfData, setPdfData] = useState(null);
  const [selectedPDF, setSelectedPDF] = useState(null); // Estado para tipo de PDF
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || 'user'); // Obtener rol del localStorage
  
  const [selectedOficina, setSelectedOficina] = useState(null);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

  const fetchOficinas = () => {
    fetch(`${apiBaseUrl}/api/oficinas?${new URLSearchParams({ ...filters, page: currentPage, limit: 10 })}`)
      .then(response => response.json())
      .then(data => {
        // Verificar que data.data es un array
        if (Array.isArray(data.data)) {
          setOficinas(data.data);
          setTotalPages(data.totalPages); // Asegúrate de que esto esté en la respuesta del backend
        } else {
          console.error('La respuesta del servidor no tiene la estructura esperada:', data);
          setOficinas([]);
        }
      })
      .catch(error => {
        console.error('Error al obtener las oficinas:', error);
        setOficinas([]); // Establecer un array vacío en caso de error
      });
  };
  useEffect(() => {
    fetchOficinas();
  }, []);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `${apiBaseUrl}/api/oficinas/${editId}` : `${apiBaseUrl}/api/oficinas`;

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
      .then(response => response.json())
      .then(data => {
        console.log('Oficina guardada:', data);
        setFormData({
          Notif: '',
          Fecha_Elab: '',
          rpe_elaboronotif: '',
          Tarifa: '',
          Anomalia: '',
          Programa: '',
          Fecha_Insp: '',
          rpe_inspeccion: '',
          tipo: '',
          Fecha_Cal_Recal: '',
          RPE_Calculo: '',
          Fecha_Inicio: '',
          Fecha_Final: '',
          KHW_Total: '',
          Imp_Energia: '',
          Imp_Total: '',
          Fecha_Venta: '',
          rpe_venta: '',
          Operacion: '',
          Fecha_Operacion: '',
          rpe_operacion: '',
          Nombre: '',
          Direccion: '',
          rpu: '',
          Ciudad: '',
          Cuenta: '',
          Cve_Agen: '',
          Agencia: '',
          Zona_A: '',
          Zona_B: '',
          medidor_inst: '',
          medidor_ret: '',
          Obs_notif: '',
          Obs_edo: '',
          Obs_term: ''
        });
        setEditId(null);
        alert(editId ? 'Oficina actualizada exitosamente' : 'Oficina creada exitosamente');
        fetchOficinas();
      })
      .catch(error => {
        console.error('Error al guardar la oficina:', error);
        alert('Error al guardar la oficina');
      });
  };
  const handleEdit = (oficina) => {
    setFormData({
      Notif: oficina.Notif,
      Fecha_Elab: oficina.Fecha_Elab ? oficina.Fecha_Elab.slice(0, 10) : '',
      rpe_elaboronotif: oficina.rpe_elaboronotif,
      Tarifa: oficina.Tarifa,
      Anomalia: oficina.Anomalia,
      Programa: oficina.Programa,
      Fecha_Insp: oficina.Fecha_Insp ? oficina.Fecha_Insp.slice(0, 10) : '',
      rpe_inspeccion: oficina.rpe_inspeccion,
      tipo: oficina.tipo,
      Fecha_Cal_Recal: oficina.Fecha_Cal_Recal ? oficina.Fecha_Cal_Recal.slice(0, 10) : '',
      RPE_Calculo: oficina.RPE_Calculo,
      Fecha_Inicio: oficina.Fecha_Inicio ? oficina.Fecha_Inicio.slice(0, 10) : '',
      Fecha_Final: oficina.Fecha_Final ? oficina.Fecha_Final.slice(0, 10) : '',
      KHW_Total: oficina.KHW_Total,
      Imp_Energia: oficina.Imp_Energia,
      Imp_Total: oficina.Imp_Total,
      Fecha_Venta: oficina.Fecha_Venta ? oficina.Fecha_Venta.slice(0, 10) : '',
      rpe_venta: oficina.rpe_venta,
      Operacion: oficina.Operacion,
      Fecha_Operacion: oficina.Fecha_Operacion ? oficina.Fecha_Operacion.slice(0, 10) : '',
      rpe_operacion: oficina.rpe_operacion,
      Nombre: oficina.Nombre,
      Direccion: oficina.Direccion,
      rpu: oficina.rpu,
      Ciudad: oficina.Ciudad,
      Cuenta: oficina.Cuenta,
      Cve_Agen: oficina.Cve_Agen,
      Agencia: oficina.Agencia,
      Zona_A: oficina.Zona_A,
      Zona_B: oficina.Zona_B,
      medidor_inst: oficina.medidor_inst,
      medidor_ret: oficina.medidor_ret,
      Obs_notif: oficina.Obs_notif,
      Obs_edo: oficina.Obs_edo,
      Obs_term: oficina.Obs_term
    });
    setEditId(oficina.Id);
  };
  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta oficina?')) {
      fetch(`${apiBaseUrl}/api/oficinas/${id}`, { method: 'DELETE' })
        .then(response => response.text())
        .then(message => {
          console.log('Oficina eliminada:', message);
          alert('Oficina eliminada exitosamente');
          fetchOficinas();
        })
        .catch(error => {
          console.error('Error al eliminar la oficina:', error);
          alert('Error al eliminar la oficina');
        });
    }
  };
  const applyFilters = () => {
    fetchOficinas();
  };
  const handleCancel = () => {
    setFormData({
      Notif: '',
      Fecha_Elab: '',
      rpe_elaboronotif: '',
      Tarifa: '',
      Anomalia: '',
      Programa: '',
      Fecha_Insp: '',
      rpe_inspeccion: '',
      tipo: '',
      Fecha_Cal_Recal: '',
      RPE_Calculo: '',
      Fecha_Inicio: '',
      Fecha_Final: '',
      KHW_Total: '',
      Imp_Energia: '',
      Imp_Total: '',
      Fecha_Venta: '',
      rpe_venta: '',
      Operacion: '',
      Fecha_Operacion: '',
      rpe_operacion: '',
      Nombre: '',
      Direccion: '',
      rpu: '',
      Ciudad: '',
      Cuenta: '',
      Cve_Agen: '',
      Agencia: '',
      Zona_A: '',
      Zona_B: '',
      medidor_inst: '',
      medidor_ret: '',
      Obs_notif: '',
      Obs_edo: '',
      Obs_term: ''
    });
    setEditId(null);
  };
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchOficinas();
    }
  };
  const generatePDF = (oficina) => {
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [300, 700],
    });
    const logoWidth = 100; // Ajusta el tamaño del logo según sea necesario
    const logoHeight = 50;
    const logo = '/img/logopdf.jpg'; // Aquí deberías colocar la imagen codificada en base64 o la URL de la imagen
    doc.addImage(logo, 'PNG', 20, 20, logoWidth, logoHeight);
    doc.text(`CFE DISTRIBUCION ZONA SANTIAGO`, 20, 120);
    doc.text(`ING. JULIO CESAR RAUIZ MONTAÑEZ`, 20, 140);
    doc.text(`PRIMERA CORREGIDORA Y GRAL. NEGRETE`, 20, 160);
    doc.text(`SANTIAGO IXCUINTLA, NAYARIT. C.P. : 63300`, 20, 180);
    doc.setFont('helvetica', 'bold');
    doc.text(`${oficina.Nombre}`, 450, 200);
    doc.setFont('helvetica', 'normal');
    doc.text('Dirección: ', 450, 220);
    doc.setFont('helvetica', 'bold');
    doc.text(`${oficina.Direccion}`, 520, 220);
    doc.setFont('helvetica', 'normal');
    doc.text(`RPU: ${oficina.rpu}`, 450, 240);
    doc.text(`Ciudad: ${oficina.Ciudad}`, 450, 260);
    setPdfData(doc.output('datauristring'));
    setSelectedPDF('pdf1'); // Establece el tipo de PDF
    setIsModalOpen(true);
  };
  //SE ACTUALIZO EL PDF 2 - INICIO
  const generatePDF2 = async () => {
    if (!selectedOficina) {
        console.error('No hay oficina seleccionada');
        return; // Salir si no hay oficina seleccionada
    }

    // Cargar el PDF existente (puedes usar cualquier ruta de archivo que tengas)
    const existingPdfBytes = await fetch('/02-1-actualizado.pdf').then(res => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { height } = firstPage.getSize();

    // Insertar los datos de la oficina en el PDF
    firstPage.drawText(`${selectedOficina.Nombre}`, {
        x: 150,
        y: height - 238,
        size: 7,
        color: rgb(0, 0, 0),
    });
    firstPage.drawText(`${selectedOficina.Direccion}`, {
        x: 150,
        y: height - 248,
        size: 7,
        color: rgb(0, 0, 0),
    });
    firstPage.drawText(`${selectedOficina.Ciudad}`, {
        x: 185,
        y: height - 258,
        size: 7,
        color: rgb(0, 0, 0),
    });
    firstPage.drawText(`${selectedOficina.Notif}`, {
        x: 300,
        y: height - 258,
        size: 7,
        color: rgb(0, 0, 0),
    });

    const yearFechaElab = new Date(selectedOficina.Fecha_Elab).getFullYear();
    firstPage.drawText(`${selectedOficina.Notif} / ${yearFechaElab} `, {
      x: 285,
      y: height - 268,
      size: 7,
      color: rgb(0, 0, 0),
    });


    // Guardar el PDF modificado
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    // Establecer el PDF y abrir el modal
    setPdfData(url);
    setSelectedPDF('pdf2');
    setIsModalOpen(true);
  };
  // FIN DEL PDF2

  const generatePDF3 = async () => {
    if (!selectedOficina) {
        console.error('No hay oficina seleccionada');
        return; // Salir si no hay oficina seleccionada
    }

    const existingPdfBytes = await fetch('/01_ajuste_por_revision_EF_V3_sind.pdf').then(res => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const secondPage = pages[1];
    const { height } = firstPage.getSize();

    firstPage.drawText(`${selectedOficina.Nombre}`, {
        x: 110,
        y: height - 202,
        size: 9,
        color: rgb(0, 0, 0),
    });
    firstPage.drawText(`${selectedOficina.Direccion}`, {
        x: 120,
        y: height - 214,
        size: 9,
        color: rgb(0, 0, 0),
    });
    firstPage.drawText(`${selectedOficina.Ciudad}`, {
        x: 122,
        y: height - 240,
        size: 9,
        color: rgb(0, 0, 0),
    });
    firstPage.drawText(`${selectedOficina.rpu}`, {
        x: 102,
        y: height - 252,
        size: 9,
        color: rgb(0, 0, 0),
    });

    const yearFechaElab = new Date(selectedOficina.Fecha_Elab).getFullYear();
    firstPage.drawText(`${selectedOficina.Notif} / ${yearFechaElab} `, {
      x: 510,
      y: height - 112,
      size: 9,
      color: rgb(0, 0, 0),
    });

    const yearFechaElab2 = new Date(selectedOficina.Fecha_Elab).getFullYear();
    firstPage.drawText(`${selectedOficina.Notif} / ${yearFechaElab2}`, {
      x: 510,
      y: height - 124,
      size: 9,
      color: rgb(0, 0, 0),
    });

    // Obtener el día, mes y año por separado
    const fechaInsp = new Date(selectedOficina.Fecha_Insp);
    const day = fechaInsp.getDate(); // Día (4)
    const month = fechaInsp.toLocaleDateString('es-ES', { month: 'long' }); // Mes en texto (marzo)
    const year = fechaInsp.getFullYear(); // Año (2021)

    // Dibujar cada parte en posiciones específicas
    firstPage.drawText(`${day}`, {
      x: 90,          // Posición X del día
      y: height - 341, // Posición Y del día
      size: 10,
      color: rgb(0, 0, 0),
    });

    firstPage.drawText(`${month}`, {
      x: 125,          // Posición X del mes
      y: height - 341, // Posición Y del mes
      size: 10,
      color: rgb(0, 0, 0),
    });

    firstPage.drawText(`${year}`, {
      x: 190,          // Posición X del año
      y: height - 341, // Posición Y del año
      size: 10,
      color: rgb(0, 0, 0),
    });

  
     // Obtener el día, mes y año por separado
    const fechaInicio = new Date(selectedOficina.Fecha_Inicio);
    const day2 = fechaInicio.getDate(); // Día (4)
    const month2 = fechaInicio.toLocaleDateString('es-ES', { month: 'long' }); // Mes en texto (marzo)
    const year2 = fechaInicio.getFullYear(); // Año (2021)

    // Dibujar cada parte en posiciones específicas
    firstPage.drawText(`${day2}`, {
      x: 380,          // Posición X del día
      y: height - 556, // Posición Y del día
      size: 10,
      color: rgb(0, 0, 0),
    });

    firstPage.drawText(`${month2}`, {
      x: 410,          // Posición X del mes
      y: height - 556, // Posición Y del mes
      size: 10,
      color: rgb(0, 0, 0),
    });

    firstPage.drawText(`${year2}`, {
      x: 467,          // Posición X del año
      y: height - 556, // Posición Y del año
      size: 10,
      color: rgb(0, 0, 0),
    });

    const fechaFinal = new Date(selectedOficina.Fecha_Final);
    const day3 = fechaFinal.getDate(); // Día (4)
    const month3 = fechaFinal.toLocaleDateString('es-ES', { month: 'long' }); // Mes en texto (marzo)
    const year3 = fechaFinal.getFullYear(); // Año (2021)

    // Dibujar cada parte en posiciones específicas
    firstPage.drawText(`${day3}`, {
      x: 510,          // Posición X del día
      y: height - 556, // Posición Y del día
      size: 10,
      color: rgb(0, 0, 0),
    });

    firstPage.drawText(`${month3}`, {
      x: 70,          // Posición X del mes
      y: height - 570, // Posición Y del mes
      size: 10,
      color: rgb(0, 0, 0),
    });

    firstPage.drawText(`${year3}`, {
      x: 138,          // Posición X del año
      y: height - 570, // Posición Y del año
      size: 10,
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
            `${selectedOficina.Obs_notif}`,
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
            `${selectedOficina.Obs_edo}`,
            153,           // Posición inicial para los primeros 54 caracteres
            height - 581, // Altura inicial
            8,            // Tamaño de texto
            94,          // Límite de caracteres para la primera línea
            70,           // Nueva posición X para el resto
            105           // Límite de caracteres para el resto del texto
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

        firstPage.drawText(`${selectedOficina.KHW_Total}`, {
          x: 270,          // Posición X en la segunda página
          y: height - 570, // Posición Y en la segunda página
          size: 10,
          color: rgb(0, 0, 0),
        });

        firstPage.drawText(`${selectedOficina.Tarifa}`, {
          x: 445,          // Posición X en la segunda página
          y: height - 633, // Posición Y en la segunda página
          size: 10,
          color: rgb(0, 0, 0),
        });

        // Escribe en la segunda página
        secondPage.drawText(`${selectedOficina.Imp_Energia}`, {
          x: 380,          // Posición X en la segunda página
          y: height - 112, // Posición Y en la segunda página
          size: 10,
          color: rgb(0, 0, 0),
        });

        secondPage.drawText(`${selectedOficina.Imp_Total}`, {
          x: 380,          // Posición X en la segunda página
          y: height - 149, // Posición Y en la segunda página
          size: 10,
          color: rgb(0, 0, 0),
        });



        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setPdfData(url);
        setSelectedPDF('pdf3');
        setIsModalOpen(true);
    };


  
  const generatePDF4 = async() => {
    
    if (!selectedOficina) {
      console.error('No hay oficina seleccionada');
      return; // Salir si no hay oficina seleccionada
  }

  const existingPdfBytes = await fetch('/02_ajuste_por_revision_FM_V3_sind.pdf').then(res => res.arrayBuffer());
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  const { height } = firstPage.getSize();

  firstPage.drawText(`${selectedOficina.Nombre}`, {
      x: 108,
      y: height - 188,
      size: 9,
      color: rgb(0, 0, 0),
  });
  firstPage.drawText(`${selectedOficina.Direccion}`, {
      x: 120,
      y: height - 200,
      size: 9,
      color: rgb(0, 0, 0),
  });
  firstPage.drawText(`${selectedOficina.Ciudad}`, {
      x: 124,
      y: height - 226,
      size: 9,
      color: rgb(0, 0, 0),
  });
  firstPage.drawText(`${selectedOficina.rpu}`, {
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
          `${selectedOficina.Obs_notif}`,
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
          `${selectedOficina.Obs_edo}`,
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
  
  if (!selectedOficina) {
    console.error('No hay oficina seleccionada');
    return; // Salir si no hay oficina seleccionada
  }

  const existingPdfBytes = await fetch('/03_ajuste_por_revision_UI_sin_contrato_V3_sind.pdf').then(res => res.arrayBuffer());
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  const { height } = firstPage.getSize();

  firstPage.drawText(`${selectedOficina.Nombre}`, {
      x: 190,
      y: height - 213,
      size: 9,
      color: rgb(0, 0, 0),
  });
  firstPage.drawText(`${selectedOficina.Direccion}`, {
      x: 120,
      y: height - 224,
      size: 9,
      color: rgb(0, 0, 0),
  });
  firstPage.drawText(`${selectedOficina.Ciudad}`, {
      x: 124,
      y: height - 250,
      size: 9,
      color: rgb(0, 0, 0),
  });
  // firstPage.drawText(`${selectedOficina.rpu}`, {
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
          `${selectedOficina.Obs_notif}`,
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
      //     `${selectedOficina.Obs_edo}`,
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
  
    if (!selectedOficina) {
      console.error('No hay oficina seleccionada');
      return; // Salir si no hay oficina seleccionada
    }
  
    const existingPdfBytes = await fetch('/04_ajuste_por_revision_UI_con_contrato_V3_sind.pdf').then(res => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { height } = firstPage.getSize();
  
    firstPage.drawText(`${selectedOficina.Nombre}`, {
        x: 110,
        y: height - 188,
        size: 9,
        color: rgb(0, 0, 0),
    });
    firstPage.drawText(`${selectedOficina.Direccion}`, {
        x: 120,
        y: height - 200,
        size: 9,
        color: rgb(0, 0, 0),
    });
    // firstPage.drawText(`${selectedOficina.Ciudad}`, {
    //     x: 122,
    //     y: height - 230,
    //     size: 9,
    //     color: rgb(0, 0, 0),
    // });
    firstPage.drawText(`${selectedOficina.rpu}`, {
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
            `${selectedOficina.Obs_notif}`,
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
            `${selectedOficina.Obs_edo}`,
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
      link.download = `Sobre Manual_${formData.Notif || ''}.pdf`;
      link.click();
    }
  };


  const handleOnClick = (oficina) => {
    setSelectedOficina(oficina);  // Almacena la oficina en el estado
    generatePDF(oficina);          // Genera el PDF
  };


  return (
    <div>
      {userRole === 'Admin' && (
        <div>
        <div className='contenedor-registro'>
          <h2>CREAR REGISTRO SINOT</h2>
          <form className='formulario-sinot-data' onSubmit={handleSubmit}>
            <div>
              <label htmlFor="Notif">Notificación</label>
              <input type="text" name="Notif" value={formData.Notif} onChange={handleChange} />
              <label htmlFor="Fecha_Elab">Fecha de Elaboración</label>
              <input type="date" name="Fecha_Elab" value={formData.Fecha_Elab} onChange={handleChange} />
              <label htmlFor="rpe_elaboronotif">RPE Elaboró Notif</label>
              <input type="text" name="rpe_elaboronotif" value={formData.rpe_elaboronotif} onChange={handleChange} />
              <label htmlFor="Tarifa">Tarifa</label>
              <input type="text" name="Tarifa" value={formData.Tarifa} onChange={handleChange} />
              <label htmlFor="Anomalia">Anomalía</label>
              <input type="text" name="Anomalia" value={formData.Anomalia} onChange={handleChange} />
              <label htmlFor="Programa">Programa</label>
              <input type="text" name="Programa" value={formData.Programa} onChange={handleChange} />
              <label htmlFor="Fecha_Insp">Fecha de Inspección</label>
              <input type="date" name="Fecha_Insp" value={formData.Fecha_Insp} onChange={handleChange} />
            </div>
            <div>
              <label htmlFor="rpe_inspeccion">RPE Inspección</label>
              <input type="text" name="rpe_inspeccion" value={formData.rpe_inspeccion} onChange={handleChange} />
              <label htmlFor="tipo">Tipo</label>
              <input type="text" name="tipo" value={formData.tipo} onChange={handleChange} />
              <label htmlFor="Fecha_Cal_Recal">Fecha Cal/Recal</label>
              <input type="date" name="Fecha_Cal_Recal" value={formData.Fecha_Cal_Recal} onChange={handleChange} />
              <label htmlFor="RPE_Calculo">RPE Cálculo</label>
              <input type="text" name="RPE_Calculo" value={formData.RPE_Calculo} onChange={handleChange} />
              <label htmlFor="Fecha_Inicio">Fecha de Inicio</label>
              <input type="date" name="Fecha_Inicio" value={formData.Fecha_Inicio} onChange={handleChange} />
              <label htmlFor="Fecha_Final">Fecha Final</label>
              <input type="date" name="Fecha_Final" value={formData.Fecha_Final} onChange={handleChange} />
              <label htmlFor="KHW_Total">KHW Total</label>
              <input type="number" step="0.01" name="KHW_Total" value={formData.KHW_Total} onChange={handleChange} />
            </div>
            <div>
              <label htmlFor="Imp_Energia">Imp Energía</label>
              <input type="number" step="0.01" name="Imp_Energia" value={formData.Imp_Energia} onChange={handleChange} />
              <label htmlFor="Imp_Total">Imp Total</label>
              <input type="number" step="0.01" name="Imp_Total" value={formData.Imp_Total} onChange={handleChange} />
              <label htmlFor="Fecha_Venta">Fecha Venta</label>
              <input type="date" name="Fecha_Venta" value={formData.Fecha_Venta} onChange={handleChange} />
              <label htmlFor="rpe_venta">RPE Venta</label>
              <input type="text" name="rpe_venta" value={formData.rpe_venta} onChange={handleChange} />
              <label htmlFor="Operacion">Operación</label>
              <input type="text" name="Operacion" value={formData.Operacion} onChange={handleChange} />
              <label htmlFor="Fecha_Operacion">Fecha Operación</label>
              <input type="date" name="Fecha_Operacion" value={formData.Fecha_Operacion} onChange={handleChange} />
              <label htmlFor="rpe_operacion">RPE Operación</label>
              <input type="text" name="rpe_operacion" value={formData.rpe_operacion} onChange={handleChange} />
            </div>
            <div>
              <label htmlFor="Nombre">Nombre</label>
              <input type="text" name="Nombre" value={formData.Nombre} onChange={handleChange} />
              <label htmlFor="Direccion">Dirección</label>
              <input type="text" name="Direccion" value={formData.Direccion} onChange={handleChange} />
              <label htmlFor="rpu">RPU</label>
              <input type="text" name="rpu" value={formData.rpu} onChange={handleChange} />
              <label htmlFor="Ciudad">Ciudad</label>
              <input type="text" name="Ciudad" value={formData.Ciudad} onChange={handleChange} />
              <label htmlFor="Cuenta">Cuenta</label>
              <input type="text" name="Cuenta" value={formData.Cuenta} onChange={handleChange} />
              <label htmlFor="Cve_Agen">Clave Agencia</label>
              <input type="text" name="Cve_Agen" value={formData.Cve_Agen} onChange={handleChange} />
              <label htmlFor="Agencia">Agencia</label>
              <input type="text" name="Agencia" value={formData.Agencia} onChange={handleChange} />
            </div>
            <div>
              <label htmlFor="Zona_A">Zona A</label>
              <input type="text" name="Zona_A" value={formData.Zona_A} onChange={handleChange} />
              <label htmlFor="Zona_B">Zona B</label>
              <input type="text" name="Zona_B" value={formData.Zona_B} onChange={handleChange} />
              <label htmlFor="medidor_inst">Medidor Instalado</label>
              <input type="text" name="medidor_inst" value={formData.medidor_inst} onChange={handleChange} />
              <label htmlFor="medidor_ret">Medidor Retirado</label>
              <input type="text" name="medidor_ret" value={formData.medidor_ret} onChange={handleChange} />
              <label htmlFor="Obs_notif">Observaciones Notif</label>
              <input type="text" name="Obs_notif" value={formData.Obs_notif} onChange={handleChange} />
              <label htmlFor="Obs_edo">Observaciones Edo</label>
              <input type="text" name="Obs_edo" value={formData.Obs_edo} onChange={handleChange} />
              <label htmlFor="Obs_term">Observaciones Term</label>
              <input type="text" name="Obs_term" value={formData.Obs_term} onChange={handleChange} />
            </div>
            <div className='butones-sinot'>
              <button className="button-sinot" type="submit">{editId ? 'Actualizar' : 'Registrar'}</button>
              <button type="button" onClick={handleCancel}>Cancelar</button>
            </div>
          </form>
        </div>
      </div>
      )}
      <h1>Registros de SINOT</h1>
      <div className='contenedor-filtro'>
        {userRole === 'Admin' && (
          <div className='importExcel'>
            <FileUpload/>
            <FileUploadNotssb/>
          </div>
        )}
        
        <input 
        type="text" 
        name="notif" 
        placeholder='Notificación'
        value={filters.Notif} 
        onChange={handleFilterChange} />
        <input 
        type="number" 
        name="year"
        placeholder='Año'
        value={filters.year} 
        onChange={handleFilterChange} /> 
        <button onClick={applyFilters}>Aplicar Filtros</button>
      </div>
      <div className='contenedor-listado'>
        <table>
          <thead className='encabezados-sinot'>
            <tr>
              <th>NOTIF</th>
              <th>FECHA_ELAB</th>
              <th>KHW_TOTAL</th>
              <th>IMP_TOTAL</th>
              <th>NOMBRE</th>
              <th>DIRECCION</th>
              <th>RPU</th>
              <th>CIUDAD</th>
              <th>CUENTA</th>
              <th>AGENCIA</th>
              {userRole === 'Admin' && (
                <th>ACCIONES</th>
              )}
            </tr>
          </thead>
          <tbody>
            {oficinas.map(oficina => (
              <tr key={oficina.Id}>
                <td onClick={() => handleOnClick(oficina)} style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}>
                  {oficina.Notif}
                </td>
                <td>{oficina.Fecha_Elab?.slice(0, 10)}</td>
                <td>{oficina.KHW_Total}</td>
                <td>{oficina.Imp_Total}</td>
                <td>{oficina.Nombre}</td>
                <td>{oficina.Direccion}</td>
                <td>{oficina.rpu}</td>
                <td>{oficina.Ciudad}</td>
                <td>{oficina.Cuenta}</td>
                <td>{oficina.Agencia}</td>
                {userRole === 'Admin' && (
                  <td>
                    <button className='button-sinot button-sinoteditar' onClick={(e) => { e.stopPropagation(); handleEdit(oficina); }}>Editar</button>
                    <button className='button-sinot button-sinoteliminar' onClick={(e) => { e.stopPropagation(); handleDelete(oficina.Id); }}>Eliminar</button>
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
