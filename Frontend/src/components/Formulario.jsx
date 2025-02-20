import React, { useState, useEffect,useRef  } from 'react';
import jsPDF from 'jspdf';
import { PDFDocument, rgb } from 'pdf-lib';
import fs from 'fs'; // Si trabajas con Node.js, si no puedes usar fetch
import Modal from 'react-modal';
import '../css/Formulario.css';
import FileUpload from './FileUpload';
import FileUploadNotssb from './FileUploadNotssb';

export const Formulario = () => {
  
  const [oficinas, setOficinas] = useState([]);
  const [dataGeneral, setDataGeneral] = useState([]);
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

  

  const [poblaciones, setPoblaciones] = useState([]);
  const [poblacionSeleccionada2, setPoblacionSeleccionada2] = useState(''); // Selección actual

  const[estado, setEstado] = useState('')
  const[cp, setCp] = useState('')
  const[cp2, setCp2] = useState('')
  const[municipio, setMunicipio] = useState('')

  const [fallaTipo, setFallaTipo] = useState(null);


  // console.log("datos general :",dataGeneral)

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  const cpToPoblaciones = {
    '46056': { poblaciones: ['SOCONITA MEZQUITOC'], estado: 'NAYARIT', municipio: 'MEZQUITIC' },
    '46070': { poblaciones: ['SAN MIGUEL HUAXTITA', 'LOS LOBOS', 'POPOTITA', 'CIENEGA DE HUAIXTIT', 'SAN JUAN POPOTITA', 'MEZQUITES', 'EL TECOLOTE', 'SAN LUIS HUAIXTITA'], estado: 'NAYARIT', municipio: 'MEZQUITIC' },
    '46072': { poblaciones: ['LA CODORNIZ'], estado: 'NAYARIT', municipio: 'MEZQUITIC' },
    '46073': { poblaciones: ['SANTA CLARA', 'BAJIO DEL CARRIZAL', 'EL CAMPAMENTO'], estado: 'NAYARIT', municipio: 'MEZQUITIC' },
    '46074': { poblaciones: ['SAN ANDRES COAMIATA', 'COHAMIATA', 'SAN JOSE DE COHAMIA'], estado: 'JALISCO', municipio: 'MEZQUITIC' },
    '46075': { poblaciones: ['EL MIRADOR HUAIXTIT'], estado: 'NAYARIT', municipio: 'MEZQUITIC' },
    '46076': { poblaciones: ['SANTA GERTRUDIS'], estado: 'NAYARIT', municipio: 'MEZQUITIC' },
    '46083': { poblaciones: ['SAN JOSE EL TESORER'], estado: 'NAYARIT', municipio: 'MEZQUITIC' },
    '63200': { poblaciones: ['TUXPAN (CENTRO)'], estado: 'NAYARIT', municipio: 'TUXPAN' },
    '63202': { poblaciones: ['ANTONIO R LAURELES', 'DEPORTIVA', 'TALPITA DX11E'], estado: 'NAYARIT', municipio: 'TUXPAN' },
    '63203': { poblaciones: ['INDEPENDENCIA DX11E'], estado: 'NAYARIT', municipio: 'TUXPAN' },
    '63421': { poblaciones: ['LOS SANDOVALES', 'BUENA VISTA', 'EL ALACRAN', 'HIGUERITA VIEJA'], estado: 'ACAPONETA', municipio: 'NAYARIT' },
  };

  const cuentasDescripcion = {
    'DX11A': '1ra Corregidora y 2d Corregidora S/N Santiago, Ixcuintla Nayarit',
    'DX11B': 'Emiliano Zapata #24, Villa Hidalgo Nayarit',
    'DX11C': 'Zapata #1 San Blas Nayarit',
    'DX11D': 'Av Juarez #407 Pte Ruiz Neyarit',
    'DX11E': 'Manuel Uribe #88 Tuxpan Nayarit',
    'DX11F': 'Mina #150, Tecuala Nayarit',
    'DX11G': 'Av. Prolongación Morelos #147, Acaponeta Nayarit',
    
  };




  
  const obtenerDescripcionCuenta = (numeroCuenta) => {
    const clave = numeroCuenta.substring(2, 7); // Obtén la clave entre el tercer y séptimo carácter
    return cuentasDescripcion[clave] || 'Descripción no disponible'; // Retorna la descripción o un valor por defecto
  };

  useEffect(() => {
    if (cp && cpToPoblaciones[cp]) {
      const { poblaciones, estado, municipio } = cpToPoblaciones[cp];

      // Establecer estado, municipio y poblaciones automáticamente
      setEstado(estado);
      setMunicipio(municipio);
      setPoblaciones(poblaciones);
      setPoblacionSeleccionada2(poblaciones[0]); // Preseleccionamos la primera colonia
    } else {
      // Limpiar valores si el CP no existe
      setEstado('');
      setMunicipio('');
      setPoblaciones([]);
      setPoblacionSeleccionada2('');
    }
  }, [cp]);

  const handleCpChange = (e) => {
    const cpIngresado = e.target.value;
    setCp(cpIngresado);
  };

  const handleColoniaChange = (e) => {
    setPoblacionSeleccionada2(e.target.value);
  };

  const handleLimpiarDatos = () =>{
    setEstado('');
    setCp('');
    setMunicipio('');
    setPoblacionSeleccionada2('');
  }

  const fetchGeneral = () => {
    fetch(`${apiBaseUrl}/general?${new URLSearchParams({ ...filters, page: currentPage, limit: 10 })}`)
      .then(response => response.json())
      .then(data => {
        // Verificar la estructura correcta
        if (Array.isArray(data.data)) {
          setDataGeneral(data.data); // Actualiza las oficinas
          setTotalPages(data.totalPages); // Actualiza el número total de páginas
        } else {
          console.error('La respuesta del servidor no tiene la estructura esperada:', data);
          setDataGeneral([]);
        }
      })
      .catch(error => {
        console.error('Error al obtener las oficinas:', error);
        setOficinas([]); // Establecer un array vacío en caso de error
      });
  };
  
  useEffect(() => {
    fetchGeneral();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const applyFilters = () => {
    console.log(filters); // Verifica los valores de los filtros
    fetchGeneral();
  };
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchGeneral();
    }
  };
  
  const generatePDF1 = (oficina, poblacionSeleccionada2, estado, cp, municipio) => {

    setPoblacionSeleccionada2(poblacionSeleccionada2);
    setCp2(cp);

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [300, 700],
    });
    // Añadir el logo
    const logoWidth = 250;
    const logoHeight = 50;
    const logo = '/img/logoP.png'; // Cambia por la ruta o base64 del logo
    doc.addImage(logo, 'PNG', 10, 10, logoWidth, logoHeight);
    doc.text(`CFE SUMINISTRADOR DE SERVICIO BASICOS`, 20, 80);
    doc.text(`ZONA SANTIAGO`, 20, 100);
    doc.text(`PRIMERA CORREGIDORA Y GRAL. NEGRETE`, 20, 120);
    doc.text(`SANTIAGO IXCUINTLA, NAYARIT. C.P. : 63300`, 20, 140);
    const yearFechaElab = new Date(oficina['Fecha Elab.']).getFullYear();
    doc.setFont('helvetica', 'normal');
    doc.text('DOCUMENTO: NOT. AJUSTE: ', 20, 160);
    doc.setFont('helvetica', 'bold');
    doc.text(`${oficina['# Notif']} / ${yearFechaElab} `, 190, 160);
    doc.setFont('helvetica', 'bold');
    doc.text(`${oficina.Nombre_sinot}`, 350, 200);
    doc.setFont('helvetica', 'normal');
    doc.text('Dirección: ', 350, 220);
    doc.setFont('helvetica', 'bold');
    doc.text(`${oficina.Dirección}`, 405, 220);
    doc.setFont('helvetica', 'normal');
    doc.text('POBLACION: ', 350, 240);
    doc.setFont('helvetica', 'bold');
    doc.text(`${poblacionSeleccionada2}, ${municipio}, ${estado}`, 425, 240);
    doc.setFont('helvetica', 'normal');
    doc.text('C.P: ', 350, 260);
    doc.setFont('helvetica', 'bold');
    doc.text(`${cp}`, 375, 260);
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
    firstPage.drawText(`${selectedOficina.Nombre_sinot}`, {
        x: 150,
        y: height - 238,
        size: 7,
        color: rgb(0, 0, 0),
    });
    firstPage.drawText(`${selectedOficina.Dirección}`, {
        x: 150,
        y: height - 248,
        size: 7,
        color: rgb(0, 0, 0),
    });
    firstPage.drawText(`${poblacionSeleccionada2}`, {
        x: 185,
        y: height - 259,
        size: 7,
        color: rgb(0, 0, 0),
    });
    firstPage.drawText(`${cp2}`, {
        x: 300,
        y: height - 259,
        size: 7,
        color: rgb(0, 0, 0),
    });

    const yearFechaElab = new Date(selectedOficina['Fecha Elab.']).getFullYear();
    firstPage.drawText(`${selectedOficina['# Notif']} / ${yearFechaElab} `, {
      x: 285,
      y: height - 269,
      size: 7,
      color: rgb(0, 0, 0),
    });

    //Duplicacion 2 poblacion y cp2
    firstPage.drawText(`${selectedOficina.Nombre}`, {
        x: 150,
        y: height - 455,
        size: 7,
        color: rgb(0, 0, 0),
    });
    firstPage.drawText(`${selectedOficina.Dirección}`, {
        x: 150,
        y: height - 465,
        size: 7,
        color: rgb(0, 0, 0),
    });
    firstPage.drawText(`${poblacionSeleccionada2}`, {
        x: 185,
        y: height - 476,
        size: 7,
        color: rgb(0, 0, 0),
    });
    firstPage.drawText(`${cp2}`, {
        x: 300,
        y: height - 476,
        size: 7,
        color: rgb(0, 0, 0),
    });

    firstPage.drawText(`${selectedOficina['# Notif']} / ${yearFechaElab} `, {
      x: 285,
      y: height - 486,
      size: 7,
      color: rgb(0, 0, 0),
    });

    //Duplicacion 3 poblacion y cp2
    firstPage.drawText(`${selectedOficina.Nombre}`, {
      x: 150,
      y: height - 672,
      size: 7,
      color: rgb(0, 0, 0),
    });
    firstPage.drawText(`${selectedOficina.Dirección}`, {
      x: 150,
      y: height - 682,
      size: 7,
      color: rgb(0, 0, 0),
    });
    firstPage.drawText(`${poblacionSeleccionada2}`, {
        x: 185,
        y: height - 693,
        size: 7,
        color: rgb(0, 0, 0),
    });
    firstPage.drawText(`${cp2}`, {
        x: 300,
        y: height - 693,
        size: 7,
        color: rgb(0, 0, 0),
    });

    firstPage.drawText(`${selectedOficina['# Notif']} / ${yearFechaElab} `, {
      x: 285,
      y: height - 703,
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

    const existingPdfBytes = await fetch('/pdf/Formato_FM_y_EF.pdf').then(res => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const secondPage = pages[1];
    const { height } = firstPage.getSize();

    firstPage.drawText(`${selectedOficina.Nombre_sinot}`, {
        x: 73,
        y: height - 124,
        size: 9,
        color: rgb(0, 0, 0),
    });
    firstPage.drawText(`${selectedOficina.Dirección}`, {
        x: 80,
        y: height - 135,
        size: 9,
        color: rgb(0, 0, 0),
    });
  //   firstPage.drawText(`${selectedOficina.ENTRE},${selectedOficina.CALLES}`, {
  //       x: 130,
  //       y: height - 228,
  //       size: 9,
  //       color: rgb(0, 0, 0),
  //   });

  //   firstPage.drawText(`N/A`, {
  //     x: 125,
  //     y: height - 240,
  //     size: 9,
  //     color: rgb(0, 0, 0),
  // });

    firstPage.drawText(`${selectedOficina.rpu}`, {
        x: 63,
        y: height - 146,
        size: 10,
        color: rgb(0, 0, 0),
    });

    firstPage.drawText(`${selectedOficina.RMU}`, {
      x: 67,
      y: height - 157,
      size: 10,
      color: rgb(0, 0, 0),
    });

    firstPage.drawText(`${selectedOficina.Cuenta}`, {
      x: 71,
      y: height - 168,
      size: 10,
      color: rgb(0, 0, 0),
    });

    firstPage.drawText(`${selectedOficina.GEO_X}, ${selectedOficina.GEO_Y}`, {
      x: 125,
      y: height - 179,
      size: 10,
      color: rgb(0, 0, 0),
    });


    const yearFechaElab = new Date(selectedOficina['Fecha Elab.']).getFullYear();
    firstPage.drawText(`${selectedOficina.Notif}`, {
      x: 525,
      y: height - 90,
      size: 9,
      color: rgb(0, 0, 0),
    });

    firstPage.drawText(`${yearFechaElab} `, {
      x: 550,
      y: height - 90,
      size: 9,
      color: rgb(0, 0, 0),
    });


    // Obtener el día, mes y año por separado
    const fechaInsp = new Date(selectedOficina['Fecha Elab.']);
    const day = fechaInsp.getDate(); // Día (4)
    const month = fechaInsp.toLocaleDateString('es-ES', { month: 'long' }); // Mes en texto (marzo)
    const year = fechaInsp.getFullYear(); // Año (2021)

    // Dibujar cada parte en posiciones específicas
    firstPage.drawText(`${day}`, {
      x: 45,          // Posición X del día
      y: height - 204, // Posición Y del día
      size: 10,
      color: rgb(0, 0, 0),
    });

    firstPage.drawText(`${month}`, {
      x: 74,          // Posición X del mes
      y: height - 204, // Posición Y del mes
      size: 10,
      color: rgb(0, 0, 0),
    });

    firstPage.drawText(`${year}`, {
      x: 130,          // Posición X del año
      y: height - 204, // Posición Y del año
      size: 10,
      color: rgb(0, 0, 0),
    });

  
     // Obtener el día, mes y año por separado
    const fechaInicio = new Date(selectedOficina['Fecha Inicio']);
    const day2 = fechaInicio.getDate(); // Día (4)
    const month2 = fechaInicio.toLocaleDateString('es-ES', { month: 'long' }); // Mes en texto (marzo)
    const year2 = fechaInicio.getFullYear(); // Año (2021)

    // Dibujar cada parte en posiciones específicas
    firstPage.drawText(`${day2}`, {
      x: 108,          // Posición X del día
      y: height - 334, // Posición Y del día
      size: 10,
      color: rgb(0, 0, 0),
    });

    firstPage.drawText(`${month2}`, {
      x: 136,          // Posición X del mes
      y: height - 334, // Posición Y del mes
      size: 10,
      color: rgb(0, 0, 0),
    });

    firstPage.drawText(`${year2}`, {
      x: 192,          // Posición X del año
      y: height - 334, // Posición Y del año
      size: 10,
      color: rgb(0, 0, 0),
    });

    const fechaFinal = new Date(selectedOficina['Fecha Final']);
    const day3 = fechaFinal.getDate(); // Día (4)
    const month3 = fechaFinal.toLocaleDateString('es-ES', { month: 'long' }); // Mes en texto (marzo)
    const year3 = fechaFinal.getFullYear(); // Año (2021)

    // Dibujar cada parte en posiciones específicas
    firstPage.drawText(`${day3}`, {
      x: 232,          // Posición X del día
      y: height - 334, // Posición Y del día
      size: 10,
      color: rgb(0, 0, 0),
    });

    firstPage.drawText(`${month3}`, {
      x: 265,          // Posición X del mes
      y: height - 334, // Posición Y del mes
      size: 10,
      color: rgb(0, 0, 0),
    });

    firstPage.drawText(`${year3}`, {
      x: 326,          // Posición X del año
      y: height - 334, // Posición Y del año
      size: 10,
      color: rgb(0, 0, 0),
    });

    firstPage.drawText(`8550`, {
      x: 362,          // Posición X del año
      y: height - 258, // Posición Y del año
      size: 10,
      color: rgb(0, 0, 0),
    });

    firstPage.drawText(`No definido`, {
      x: 35,          // Posición X del año
      y: height - 300, // Posición Y del año
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
            120,          // Posición inicial para los primeros 54 caracteres
            height - 270, // Altura inicial
            9,            // Tamaño de texto
            45,           // Límite de caracteres para la primera línea
            70,           // Nueva posición X para el resto
            92            // Límite de caracteres para el resto del texto
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
            205,      // Posición inicial para los primeros 54 caracteres
            height - 345, // Altura inicial
            9,            // Tamaño de texto
            77,          // Límite de caracteres para la primera línea
            35,           // Nueva posición X para el resto
            92           // Límite de caracteres para el resto del texto
        );

        // // Obtener la fecha actual y formatearla
        // const options = { year: 'numeric', month: 'long', day: 'numeric' };
        // const currentDate = new Date().toLocaleDateString('es-ES', options); // Formato: "miércoles, 23 de octubre de 2024"

        

        // // Dibujar la fecha en el PDF
        // firstPage.drawText(currentDate, {
        //     x: 394,              // Posición X
        //     y: height - 149,     // Posición Y, ajusta según sea necesario
        //     size: 10,             // Tamaño de texto
        //     color: rgb(0, 0, 0), // Color del texto
        // });

        const currentDate = new Date();

        const dayValue = currentDate.getDate(); // Día
        const monthValue = currentDate.toLocaleString('es-ES', { month: 'long' }); // Nombre del mes
        const yearValue = currentDate.getFullYear(); // Año

        // Dibujar cada parte en una posición diferente
        firstPage.drawText(dayValue.toString(), {
            x: 467,
            y: height - 102,
            size: 10,
            color: rgb(0, 0, 0),
        });

        firstPage.drawText(monthValue, {
            x: 496, // Cambia la X para que no se sobrepongan
            y: height - 102,
            size: 10,
            color: rgb(0, 0, 0),
        });

        firstPage.drawText(yearValue.toString(), {
            x: 550, // Ajusta la posición según necesites
            y: height - 102,
            size: 10,
            color: rgb(0, 0, 0),
        });


        firstPage.drawText(`${selectedOficina.Khw_sinot}`, {
          x: 433,          // Posición X en la segunda página
          y: height - 335, // Posición Y en la segunda página
          size: 10,
          color: rgb(0, 0, 0),
        });

        firstPage.drawText(`${selectedOficina.TARIFA}`, {
          x: 368,          // Posición X en la segunda página
          y: height - 368, // Posición Y en la segunda página
          size: 10,
          color: rgb(0, 0, 0),
        });

        firstPage.drawText(`${selectedOficina['$ Total']}`, {
          x: 530,          // Posición X en la segunda página
          y: height - 379, // Posición Y en la segunda página
          size: 10,
          color: rgb(0, 0, 0),
        });

        // Escribe en la segunda página
        firstPage.drawText(`${selectedOficina['$ Energía']}`, {
          x: 330,          // Posición X en la segunda página
          y: height - 424, // Posición Y en la segunda página
          size: 10,
          color: rgb(0, 0, 0),
        });

        firstPage.drawText(`${selectedOficina['$ IVA']}`, {
          x: 330,          // Posición X en la segunda página
          y: height - 438, // Posición Y en la segunda página
          size: 10,
          color: rgb(0, 0, 0),
        });
        
        firstPage.drawText(`${selectedOficina['$ Total']}`, {
          x: 330,          // Posición X en la segunda página
          y: height - 465, // Posición Y en la segunda página
          size: 10,
          color: rgb(0, 0, 0),
        });
        const drawTextWithLineBreak = (text, x, startY, size, maxCharsPerLine, secondLineX, page) => {
          let y = startY; // La posición Y inicial
          let startIndex = 0; // El índice inicial para cortar el texto

          // Recorre el texto y divide en líneas
          while (startIndex < text.length) {
              const line = text.substring(startIndex, startIndex + maxCharsPerLine); // Extrae la línea de texto
              page.drawText(line, {
                  x: x,  // Primera línea en la posición X original
                  y: y,
                  size: size,
                  color: rgb(0, 0, 0),
              });

              // Ajusta la posición Y para la siguiente línea
              y -= size + 2; 

              // Si ya hemos dibujado la primera línea, cambia la posición X para la siguiente línea
              if (startIndex + maxCharsPerLine < text.length) {
                  x = secondLineX;  // Cambia la posición X para la segunda línea
              }

              startIndex += maxCharsPerLine; // Mover el índice para la próxima línea
          }
        };

        // Usar la función para dibujar el texto con saltos de línea y coordenada X modificada
        const descripcionCuenta = obtenerDescripcionCuenta(selectedOficina.Cuenta);
        drawTextWithLineBreak(descripcionCuenta, 50, height - 515, 10, 100, 70, firstPage);

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

  const existingPdfBytes = await fetch('/pdf/Formato_FM_y_EF.pdf').then(res => res.arrayBuffer());
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  const secondPage = pages[1];
  const { height } = firstPage.getSize();

  firstPage.drawText(`${selectedOficina.Nombre_sinot}`, {
      x: 73,
      y: height - 124,
      size: 9,
      color: rgb(0, 0, 0),
  });
  firstPage.drawText(`${selectedOficina.Dirección}`, {
      x: 80,
      y: height - 135,
      size: 9,
      color: rgb(0, 0, 0),
  });
//   firstPage.drawText(`${selectedOficina.ENTRE},${selectedOficina.CALLES}`, {
//       x: 130,
//       y: height - 228,
//       size: 9,
//       color: rgb(0, 0, 0),
//   });

//   firstPage.drawText(`N/A`, {
//     x: 125,
//     y: height - 240,
//     size: 9,
//     color: rgb(0, 0, 0),
// });

  firstPage.drawText(`${selectedOficina.rpu}`, {
      x: 63,
      y: height - 146,
      size: 10,
      color: rgb(0, 0, 0),
  });

  firstPage.drawText(`${selectedOficina.RMU}`, {
    x: 67,
    y: height - 157,
    size: 10,
    color: rgb(0, 0, 0),
  });

  firstPage.drawText(`${selectedOficina.Cuenta}`, {
    x: 71,
    y: height - 168,
    size: 10,
    color: rgb(0, 0, 0),
  });

  firstPage.drawText(`${selectedOficina.GEO_X}, ${selectedOficina.GEO_Y}`, {
    x: 125,
    y: height - 179,
    size: 10,
    color: rgb(0, 0, 0),
  });


  const yearFechaElab = new Date(selectedOficina['Fecha Elab.']).getFullYear();
  firstPage.drawText(`${selectedOficina.Notif}`, {
    x: 525,
    y: height - 90,
    size: 9,
    color: rgb(0, 0, 0),
  });

  firstPage.drawText(`${yearFechaElab} `, {
    x: 550,
    y: height - 90,
    size: 9,
    color: rgb(0, 0, 0),
  });


  // Obtener el día, mes y año por separado
  const fechaInsp = new Date(selectedOficina['Fecha Elab.']);
  const day = fechaInsp.getDate(); // Día (4)
  const month = fechaInsp.toLocaleDateString('es-ES', { month: 'long' }); // Mes en texto (marzo)
  const year = fechaInsp.getFullYear(); // Año (2021)

  // Dibujar cada parte en posiciones específicas
  firstPage.drawText(`${day}`, {
    x: 45,          // Posición X del día
    y: height - 204, // Posición Y del día
    size: 10,
    color: rgb(0, 0, 0),
  });

  firstPage.drawText(`${month}`, {
    x: 74,          // Posición X del mes
    y: height - 204, // Posición Y del mes
    size: 10,
    color: rgb(0, 0, 0),
  });

  firstPage.drawText(`${year}`, {
    x: 130,          // Posición X del año
    y: height - 204, // Posición Y del año
    size: 10,
    color: rgb(0, 0, 0),
  });


   // Obtener el día, mes y año por separado
  const fechaInicio = new Date(selectedOficina['Fecha Inicio']);
  const day2 = fechaInicio.getDate(); // Día (4)
  const month2 = fechaInicio.toLocaleDateString('es-ES', { month: 'long' }); // Mes en texto (marzo)
  const year2 = fechaInicio.getFullYear(); // Año (2021)

  // Dibujar cada parte en posiciones específicas
  firstPage.drawText(`${day2}`, {
    x: 108,          // Posición X del día
    y: height - 334, // Posición Y del día
    size: 10,
    color: rgb(0, 0, 0),
  });

  firstPage.drawText(`${month2}`, {
    x: 136,          // Posición X del mes
    y: height - 334, // Posición Y del mes
    size: 10,
    color: rgb(0, 0, 0),
  });

  firstPage.drawText(`${year2}`, {
    x: 192,          // Posición X del año
    y: height - 334, // Posición Y del año
    size: 10,
    color: rgb(0, 0, 0),
  });

  const fechaFinal = new Date(selectedOficina['Fecha Final']);
  const day3 = fechaFinal.getDate(); // Día (4)
  const month3 = fechaFinal.toLocaleDateString('es-ES', { month: 'long' }); // Mes en texto (marzo)
  const year3 = fechaFinal.getFullYear(); // Año (2021)

  // Dibujar cada parte en posiciones específicas
  firstPage.drawText(`${day3}`, {
    x: 232,          // Posición X del día
    y: height - 334, // Posición Y del día
    size: 10,
    color: rgb(0, 0, 0),
  });

  firstPage.drawText(`${month3}`, {
    x: 263,          // Posición X del mes
    y: height - 334, // Posición Y del mes
    size: 10,
    color: rgb(0, 0, 0),
  });

  firstPage.drawText(`${year3}`, {
    x: 326,          // Posición X del año
    y: height - 334, // Posición Y del año
    size: 10,
    color: rgb(0, 0, 0),
  });

  firstPage.drawText(`8550`, {
    x: 362,          // Posición X del año
    y: height - 258, // Posición Y del año
    size: 10,
    color: rgb(0, 0, 0),
  });

  firstPage.drawText(`No definido`, {
    x: 35,          // Posición X del año
    y: height - 300, // Posición Y del año
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
          120,          // Posición inicial para los primeros 54 caracteres
          height - 270, // Altura inicial
          9,            // Tamaño de texto
          80,           // Límite de caracteres para la primera línea
          36,           // Nueva posición X para el resto
          92            // Límite de caracteres para el resto del texto
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
          197,      // Posición inicial para los primeros 54 caracteres
          height - 345, // Altura inicial
          9,            // Tamaño de texto
          77,          // Límite de caracteres para la primera línea
          35,           // Nueva posición X para el resto
          92           // Límite de caracteres para el resto del texto
      );

      // // Obtener la fecha actual y formatearla
      // const options = { year: 'numeric', month: 'long', day: 'numeric' };
      // const currentDate = new Date().toLocaleDateString('es-ES', options); // Formato: "miércoles, 23 de octubre de 2024"

      

      // // Dibujar la fecha en el PDF
      // firstPage.drawText(currentDate, {
      //     x: 394,              // Posición X
      //     y: height - 149,     // Posición Y, ajusta según sea necesario
      //     size: 10,             // Tamaño de texto
      //     color: rgb(0, 0, 0), // Color del texto
      // });

      const currentDate = new Date();

      const dayValue = currentDate.getDate(); // Día
      const monthValue = currentDate.toLocaleString('es-ES', { month: 'long' }); // Nombre del mes
      const yearValue = currentDate.getFullYear(); // Año

      // Dibujar cada parte en una posición diferente
      firstPage.drawText(dayValue.toString(), {
          x: 467,
          y: height - 102,
          size: 10,
          color: rgb(0, 0, 0),
      });

      firstPage.drawText(monthValue, {
          x: 496, // Cambia la X para que no se sobrepongan
          y: height - 102,
          size: 10,
          color: rgb(0, 0, 0),
      });

      firstPage.drawText(yearValue.toString(), {
          x: 550, // Ajusta la posición según necesites
          y: height - 102,
          size: 10,
          color: rgb(0, 0, 0),
      });


      firstPage.drawText(`${selectedOficina.Khw_sinot}`, {
        x: 433,          // Posición X en la segunda página
        y: height - 335, // Posición Y en la segunda página
        size: 10,
        color: rgb(0, 0, 0),
      });

      firstPage.drawText(`${selectedOficina.TARIFA}`, {
        x: 368,          // Posición X en la segunda página
        y: height - 368, // Posición Y en la segunda página
        size: 10,
        color: rgb(0, 0, 0),
      });

      firstPage.drawText(`${selectedOficina['$ Total']}`, {
        x: 530,          // Posición X en la segunda página
        y: height - 379, // Posición Y en la segunda página
        size: 10,
        color: rgb(0, 0, 0),
      });

      // Escribe en la segunda página
      firstPage.drawText(`${selectedOficina['$ Energía']}`, {
        x: 330,          // Posición X en la segunda página
        y: height - 424, // Posición Y en la segunda página
        size: 10,
        color: rgb(0, 0, 0),
      });

      firstPage.drawText(`${selectedOficina['$ IVA']}`, {
        x: 330,          // Posición X en la segunda página
        y: height - 438, // Posición Y en la segunda página
        size: 10,
        color: rgb(0, 0, 0),
      });
      
      firstPage.drawText(`${selectedOficina['$ Total']}`, {
        x: 330,          // Posición X en la segunda página
        y: height - 465, // Posición Y en la segunda página
        size: 10,
        color: rgb(0, 0, 0),
      });
      const drawTextWithLineBreak = (text, x, startY, size, maxCharsPerLine, secondLineX, page) => {
        let y = startY; // La posición Y inicial
        let startIndex = 0; // El índice inicial para cortar el texto

        // Recorre el texto y divide en líneas
        while (startIndex < text.length) {
            const line = text.substring(startIndex, startIndex + maxCharsPerLine); // Extrae la línea de texto
            page.drawText(line, {
                x: x,  // Primera línea en la posición X original
                y: y,
                size: size,
                color: rgb(0, 0, 0),
            });

            // Ajusta la posición Y para la siguiente línea
            y -= size + 2; 

            // Si ya hemos dibujado la primera línea, cambia la posición X para la siguiente línea
            if (startIndex + maxCharsPerLine < text.length) {
                x = secondLineX;  // Cambia la posición X para la segunda línea
            }

            startIndex += maxCharsPerLine; // Mover el índice para la próxima línea
        }
      };

      // Usar la función para dibujar el texto con saltos de línea y coordenada X modificada
      const descripcionCuenta = obtenerDescripcionCuenta(selectedOficina.Cuenta);
      drawTextWithLineBreak(descripcionCuenta, 50, height - 515, 10, 100, 70, firstPage);

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

  const existingPdfBytes = await fetch('/pdf/FormatoCobroAjuste_sin_contrato.pdf').then(res => res.arrayBuffer());
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  const secondPage = pages[1];
  const { height } = firstPage.getSize();

  firstPage.drawText(`${selectedOficina.Nombre_sinot}`, {
      x: 124,
      y: height - 122.5,
      size: 9,
      color: rgb(0, 0, 0),
  });
  firstPage.drawText(`${selectedOficina.Dirección}`, {
      x: 82,
      y: height - 132.5,
      size: 9,
      color: rgb(0, 0, 0),
  });

  // firstPage.drawText(`${selectedOficina.ENTRE}, ${selectedOficina.CALLES}`, {
  //   x: 132,
  //   y: height - 238,
  //   size: 10,
  //   color: rgb(0, 0, 0),
  // });

  // firstPage.drawText(`N/A`, {
  //   x: 124,
  //   y: height - 250,
  //   size: 10,
  //   color: rgb(0, 0, 0),
  // });

  const yearFechaElab = new Date(selectedOficina['Fecha Elab.']).getFullYear();
  firstPage.drawText(`${selectedOficina.Notif}`, {
    x: 534,
    y: height - 90,
    size: 9,
    color: rgb(0, 0, 0),
  });

  firstPage.drawText(`${yearFechaElab} `, {
    x: 557,
    y: height - 90,
    size: 9,
    color: rgb(0, 0, 0),
  });

  // Obtener el día, mes y año por separado
  const fechaInsp = new Date(selectedOficina['Fecha Elab.']);
  const day = fechaInsp.getDate(); // Día (4)
  const month = fechaInsp.toLocaleDateString('es-ES', { month: 'long' }); // Mes en texto (marzo)
  const year = fechaInsp.getFullYear(); // Año (2021)

  // Dibujar cada parte en posiciones específicas
  firstPage.drawText(`${day}`, {
    x: 48,          // Posición X del día
    y: height - 205.5, // Posición Y del día
    size: 10,
    color: rgb(0, 0, 0),
  });

  firstPage.drawText(`${month}`, {
    x: 72,          // Posición X del mes
    y: height - 205.5, // Posición Y del mes
    size: 10,
    color: rgb(0, 0, 0),
  });

  firstPage.drawText(`${year}`, {
    x: 120.5,          // Posición X del año
    y: height - 205.5, // Posición Y del año
    size: 10,
    color: rgb(0, 0, 0),
  });


  firstPage.drawText(`8550`, {
    x: 295,          // Posición X del año
    y: height - 255, // Posición Y del año
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
          36,           // Posición inicial para los primeros 54 caracteres
          height - 300, // Altura inicial
          9,            // Tamaño de texto
          99,          // Límite de caracteres para la primera línea
          36,           // Nueva posición X para el resto
          89            // Límite de caracteres para el resto del texto
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

      const currentDate = new Date();

        const dayValue = currentDate.getDate(); // Día
        const monthValue = currentDate.toLocaleString('es-ES', { month: 'long' }); // Nombre del mes
        const yearValue = currentDate.getFullYear(); // Año

        // Dibujar cada parte en una posición diferente
        firstPage.drawText(dayValue.toString(), {
            x: 467,
            y: height - 100.5,
            size: 10,
            color: rgb(0, 0, 0),
        });

        firstPage.drawText(monthValue, {
            x: 496, // Cambia la X para que no se sobrepongan
            y: height - 100.5,
            size: 10,
            color: rgb(0, 0, 0),
        });

        firstPage.drawText(yearValue.toString(), {
            x: 550, // Ajusta la posición según necesites
            y: height - 100.5,
            size: 10,
            color: rgb(0, 0, 0),
        });


      // Obtener el día, mes y año por separado
      const fechaInicio = new Date(selectedOficina['Fecha Inicio']);
      const day2 = fechaInicio.getDate(); // Día (4)
      const month2 = fechaInicio.toLocaleDateString('es-ES', { month: 'long' }); // Mes en texto (marzo)
      const year2 = fechaInicio.getFullYear(); // Año (2021)

      // Dibujar cada parte en posiciones específicas
      firstPage.drawText(`${day2}`, {
        x: 105,          // Posición X del día
        y: height - 330, // Posición Y del día
        size: 10,
        color: rgb(0, 0, 0),
      });

      firstPage.drawText(`${month2}`, {
        x: 128,          // Posición X del mes
        y: height - 330, // Posición Y del mes
        size: 10,
        color: rgb(0, 0, 0),
      });

      firstPage.drawText(`${year2}`, {
        x: 177.5,          // Posición X del año
        y: height - 330, // Posición Y del año
        size: 10,
        color: rgb(0, 0, 0),
      });

      const fechaFinal = new Date(selectedOficina['Fecha Final']);
      const day3 = fechaFinal.getDate(); // Día (4)
      const month3 = fechaFinal.toLocaleDateString('es-ES', { month: 'long' }); // Mes en texto (marzo)
      const year3 = fechaFinal.getFullYear(); // Año (2021)

      // Dibujar cada parte en posiciones específicas
      firstPage.drawText(`${day3}`, {
        x: 210,          // Posición X del día
        y: height - 330, // Posición Y del día
        size: 10,
        color: rgb(0, 0, 0),
      });

      firstPage.drawText(`${month3}`, {
        x: 233,          // Posición X del mes
        y: height - 330, // Posición Y del mes
        size: 10,
        color: rgb(0, 0, 0),
      });

      firstPage.drawText(`${year3}`, {
        x: 280.5,          // Posición X del año
        y: height - 330, // Posición Y del año
        size: 10,
        color: rgb(0, 0, 0),
      });


      firstPage.drawText(`${selectedOficina.Khw_sinot}`, {
        x: 375,          // Posición X en la segunda página
        y: height - 330, // Posición Y en la segunda página
        size: 10,
        color: rgb(0, 0, 0),
      });

      firstPage.drawText(`N/A`, {
        x: 130,          // Posición X en la segunda página
        y: height - 340, // Posición Y en la segunda página
        size: 10,
        color: rgb(0, 0, 0),
      });

      firstPage.drawText(`${selectedOficina.TARIFA}`, {
        x: 190,          // Posición X en la segunda página
        y: height - 382, // Posición Y en la segunda página
        size: 10,
        color: rgb(0, 0, 0),
      });

      firstPage.drawText(`${selectedOficina['$ Total']}`, {
        x: 530,          // Posición X en la segunda página
        y: height - 413.5, // Posición Y en la segunda página
        size: 10,
        color: rgb(0, 0, 0),
      });

      // Escribe en la segunda página
      firstPage.drawText(`${selectedOficina['$ Energía']}`, {
        x: 333,          // Posición X en la segunda página
        y: height - 457, // Posición Y en la segunda página
        size: 10,
        color: rgb(0, 0, 0),
      });

      firstPage.drawText(`${selectedOficina['$ IVA']}`, {
        x: 333,          // Posición X en la segunda página
        y: height - 470, // Posición Y en la segunda página
        size: 10,
        color: rgb(0, 0, 0),
      });
      
      firstPage.drawText(`${selectedOficina['$ Total']}`, {
        x: 333,          // Posición X en la segunda página
        y: height - 499, // Posición Y en la segunda página
        size: 10,
        color: rgb(0, 0, 0),
      });


      const drawTextWithLineBreak = (text, x, startY, size, maxCharsPerLine, secondLineX, page) => {
        let y = startY; // La posición Y inicial
        let startIndex = 0; // El índice inicial para cortar el texto

        // Recorre el texto y divide en líneas
        while (startIndex < text.length) {
            const line = text.substring(startIndex, startIndex + maxCharsPerLine); // Extrae la línea de texto
            page.drawText(line, {
                x: x,  // Primera línea en la posición X original
                y: y,
                size: size,
                color: rgb(0, 0, 0),
            });

            // Ajusta la posición Y para la siguiente línea
            y -= size + 2; 

            // Si ya hemos dibujado la primera línea, cambia la posición X para la siguiente línea
            if (startIndex + maxCharsPerLine < text.length) {
                x = secondLineX;  // Cambia la posición X para la segunda línea
            }

            startIndex += maxCharsPerLine; // Mover el índice para la próxima línea
        }
      };

      // Usar la función para dibujar el texto con saltos de línea y coordenada X modificada
      const descripcionCuenta = obtenerDescripcionCuenta(selectedOficina.Cuenta);
      drawTextWithLineBreak(descripcionCuenta, 158, height - 533, 10, 80, 70, firstPage);



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
  
    const existingPdfBytes = await fetch('/pdf/FormatoCobroAjuste_con_contrato.pdf').then(res => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const secondPage= pages[1];
    const { height } = firstPage.getSize();
  
    firstPage.drawText(`${selectedOficina.Nombre_sinot}`, {
        x: 72,
        y: height - 111,
        size: 9,
        color: rgb(0, 0, 0),
    });
    firstPage.drawText(`${selectedOficina.Dirección}`, {
        x: 81,
        y: height - 121.5,
        size: 9,
        color: rgb(0, 0, 0),
    });

    // firstPage.drawText(`${selectedOficina.ENTRE},${selectedOficina.CALLES}`, {
    //   x: 130,
    //   y: height - 214,
    //   size: 9,
    //   color: rgb(0, 0, 0),
    // });
  
    firstPage.drawText(`${selectedOficina.rpu}`, {
        x: 63,
        y: height - 131,
        size: 10,
        color: rgb(0, 0, 0),
    });
  
    firstPage.drawText(`${selectedOficina.RMU}`, {
      x: 63,
      y: height - 142,
      size: 10,
      color: rgb(0, 0, 0),
    });
  
    firstPage.drawText(`${selectedOficina.Cuenta}`, {
      x: 66,
      y: height - 152,
      size: 10,
      color: rgb(0, 0, 0),
    });
  
    firstPage.drawText(`${selectedOficina.GEO_X}, ${selectedOficina.GEO_Y}`, {
      x: 120,
      y: height - 163,
      size: 10,
      color: rgb(0, 0, 0),
    });
  
    const yearFechaElab = new Date(selectedOficina['Fecha Elab.']).getFullYear();
  firstPage.drawText(`${selectedOficina.Notif}`, {
    x: 534,
    y: height - 79,
    size: 9,
    color: rgb(0, 0, 0),
  });

  firstPage.drawText(`${yearFechaElab} `, {
    x: 558,
    y: height - 79,
    size: 9,
    color: rgb(0, 0, 0),
  });


    // Obtener el día, mes y año por separado
    const fechaInsp = new Date(selectedOficina['Fecha Elab.']);
    const day = fechaInsp.getDate(); // Día (4)
    const month = fechaInsp.toLocaleDateString('es-ES', { month: 'long' }); // Mes en texto (marzo)
    const year = fechaInsp.getFullYear(); // Año (2021)

    // Dibujar cada parte en posiciones específicas
    firstPage.drawText(`${day}`, {
      x: 47,          // Posición X del día
      y: height - 185, // Posición Y del día
      size: 10,
      color: rgb(0, 0, 0),
    });

    firstPage.drawText(`${month}`, {
      x: 72,          // Posición X del mes
      y: height - 185, // Posición Y del mes
      size: 10,
      color: rgb(0, 0, 0),
    });

    firstPage.drawText(`${year}`, {
      x: 125,          // Posición X del año
      y: height - 185, // Posición Y del año
      size: 10,
      color: rgb(0, 0, 0),
    });


    firstPage.drawText(`8550`, {
      x: 340,          // Posición X del año
      y: height - 237, // Posición Y del año
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
            36,           // Posición inicial para los primeros 54 caracteres
            height - 277, // Altura inicial
            9,            // Tamaño de texto
            99,          // Límite de caracteres para la primera línea
            36,           // Nueva posición X para el resto
            87            // Límite de caracteres para el resto del texto
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
            225,           // Posición inicial para los primeros 54 caracteres
            height - 320, // Altura inicial
            8,            // Tamaño de texto
            78,          // Límite de caracteres para la primera línea
            35,           // Nueva posición X para el resto
            120           // Límite de caracteres para el resto del texto
        );
  
        // Obtener la fecha actual y formatearla
        const currentDate = new Date();

        const dayValue = currentDate.getDate(); // Día
        const monthValue = currentDate.toLocaleString('es-ES', { month: 'long' }); // Nombre del mes
        const yearValue = currentDate.getFullYear(); // Año

        // Dibujar cada parte en una posición diferente
        firstPage.drawText(dayValue.toString(), {
            x: 467,
            y: height - 90,
            size: 10,
            color: rgb(0, 0, 0),
        });

        firstPage.drawText(monthValue, {
            x: 498, // Cambia la X para que no se sobrepongan
            y: height - 90,
            size: 10,
            color: rgb(0, 0, 0),
        });

        firstPage.drawText(yearValue.toString(), {
            x: 550, // Ajusta la posición según necesites
            y: height - 90,
            size: 10,
            color: rgb(0, 0, 0),
        });

  

            // Obtener el día, mes y año por separado
        const fechaInicio = new Date(selectedOficina['Fecha Inicio']);
        const day2 = fechaInicio.getDate(); // Día (4)
        const month2 = fechaInicio.toLocaleDateString('es-ES', { month: 'long' }); // Mes en texto (marzo)
        const year2 = fechaInicio.getFullYear(); // Año (2021)

        // Dibujar cada parte en posiciones específicas
        firstPage.drawText(`${day2}`, {
          x: 182,          // Posición X del día
          y: height - 310, // Posición Y del día
          size: 10,
          color: rgb(0, 0, 0),
        });

        firstPage.drawText(`${month2}`, {
          x: 208,          // Posición X del mes
          y: height - 310, // Posición Y del mes
          size: 10,
          color: rgb(0, 0, 0),
        });

        firstPage.drawText(`${year2}`, {
          x: 263,          // Posición X del año
          y: height - 310, // Posición Y del año
          size: 10,
          color: rgb(0, 0, 0),
        });

        const fechaFinal = new Date(selectedOficina['Fecha Final']);
        const day3 = fechaFinal.getDate(); // Día (4)
        const month3 = fechaFinal.toLocaleDateString('es-ES', { month: 'long' }); // Mes en texto (marzo)
        const year3 = fechaFinal.getFullYear(); // Año (2021)

        // Dibujar cada parte en posiciones específicas
        firstPage.drawText(`${day3}`, {
          x: 293,          // Posición X del día
          y: height - 310, // Posición Y del día
          size: 10,
          color: rgb(0, 0, 0),
        });

        firstPage.drawText(`${month3}`, {
          x: 318,          // Posición X del mes
          y: height - 310, // Posición Y del mes
          size: 10,
          color: rgb(0, 0, 0),
        });

        firstPage.drawText(`${year3}`, {
          x: 375,          // Posición X del año
          y: height - 310, // Posición Y del año
          size: 10,
          color: rgb(0, 0, 0),
        });


        firstPage.drawText(`${selectedOficina.Khw_sinot}`, {
          x: 480,          // Posición X en la segunda página
          y: height - 310, // Posición Y en la segunda página
          size: 10,
          color: rgb(0, 0, 0),
        });

        firstPage.drawText(`${selectedOficina.TARIFA}`, {
          x: 370,          // Posición X en la segunda página
          y: height - 350, // Posición Y en la segunda página
          size: 10,
          color: rgb(0, 0, 0),
        });

        firstPage.drawText(`${selectedOficina['$ Total']}`, {
          x: 533,          // Posición X en la segunda página
          y: height - 362, // Posición Y en la segunda página
          size: 10,
          color: rgb(0, 0, 0),
        });

        // Escribe en la segunda página
        firstPage.drawText(`${selectedOficina['$ Energía']}`, {
          x: 320,          // Posición X en la segunda página
          y: height - 408, // Posición Y en la segunda página
          size: 10,
          color: rgb(0, 0, 0),
        });

        firstPage.drawText(`${selectedOficina['$ IVA']}`, {
          x: 320,          // Posición X en la segunda página
          y: height - 421, // Posición Y en la segunda página
          size: 10,
          color: rgb(0, 0, 0),
        });
        
        firstPage.drawText(`${selectedOficina['$ Total']}`, {
          x: 320,          // Posición X en la segunda página
          y: height - 449, // Posición Y en la segunda página
          size: 10,
          color: rgb(0, 0, 0),
        });


        const drawTextWithLineBreak = (text, x, startY, size, maxCharsPerLine, secondLineX, page) => {
          let y = startY; // La posición Y inicial
          let startIndex = 0; // El índice inicial para cortar el texto

          // Recorre el texto y divide en líneas
          while (startIndex < text.length) {
              const line = text.substring(startIndex, startIndex + maxCharsPerLine); // Extrae la línea de texto
              page.drawText(line, {
                  x: x,  // Primera línea en la posición X original
                  y: y,
                  size: size,
                  color: rgb(0, 0, 0),
              });

              // Ajusta la posición Y para la siguiente línea
              y -= size + 2; 

              // Si ya hemos dibujado la primera línea, cambia la posición X para la siguiente línea
              if (startIndex + maxCharsPerLine < text.length) {
                  x = secondLineX;  // Cambia la posición X para la segunda línea
              }

              startIndex += maxCharsPerLine; // Mover el índice para la próxima línea
          }
        };

        // Usar la función para dibujar el texto con saltos de línea y coordenada X modificada
        const descripcionCuenta = obtenerDescripcionCuenta(selectedOficina.Cuenta);
        drawTextWithLineBreak(descripcionCuenta, 35, height - 495, 10, 120, 120, firstPage);


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
    setFallaTipo(null);
  };
  const downloadPDF = () => {
    if (pdfData) {
      const link = document.createElement('a');
      link.href = pdfData;
      link.download = `descargaPdfSeleccionado${dataGeneral['# Notif'] || ''}.pdf`;
      link.click();
    }
  };


  const handleOnClick = (data) => {
    setSelectedOficina(data);  // Almacena la oficina en el estado
  
    // Establecer el tipo de falla y abrir el modal
    if (data.Falla) {
      setFallaTipo(data.Falla);  // Establece el tipo de Falla
  
      // Abrir el modal solo si la falla cumple con las condiciones necesarias
      if (data.Falla.startsWith("UI") || data.Falla.startsWith("EF")|| data.Falla.startsWith("FM")) {
        setIsModalOpen(true);  // Abre el modal
        generatePDF1(data, poblacionSeleccionada2, estado, cp, municipio); // Genera el PDF
      }
    }
  };
  
  


  return (
    <div>
      
      <div>
        <div className="CamposAdicionales">
          <div>
            <label htmlFor="cp">CP</label>
            <input
              type="text"
              value={cp}
              onChange={handleCpChange}
            />
          </div>

          <div>
            <label htmlFor="colonia">Colonia</label>
            {poblaciones.length > 0 ? (
              <select
                value={poblacionSeleccionada2}
                onChange={handleColoniaChange}
              >
                <option value="">Seleccione una colonia</option>
                {poblaciones.map((colonia, index) => (
                  <option key={index} value={colonia}>
                    {colonia}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={poblacionSeleccionada2}
                onChange={(e) => setPoblacionSeleccionada2(e.target.value)}
                placeholder="Ingrese la colonia"
              />
            )}
          </div>

          <div>
            <label htmlFor="estado">Estado</label>
            <input
              type="text"
              value={estado}
              readOnly
            />
          </div>

          <div>
            <label htmlFor="municipio">Municipio</label>
            <input
              type="text"
              value={municipio}
              readOnly
            />
          </div>
        </div>
        <div>
          <button type='button' onClick={handleLimpiarDatos}>Limpiar</button>
        </div>
      </div>
      
      <h1>REGISTROS DE SINOT</h1>
      <div className='contenedor-filtro'>
        {userRole === 'Admin' && (
          <div className='importExcel'>
            <FileUpload />
            <FileUploadNotssb />
          </div>
        )}

        <input
          type="text"
          name="notif"
          placeholder='Notificación'
          value={filters.notif}  // Cambia "Notif" por "notif"
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
          <thead className='encabezados-sinot'>
            <tr>
              <th>NOTIF</th>
              <th>FECHA_ELAB</th>
              <th>KHW_TOTAL</th>
              <th>IMP_TOTAL</th>
              <th>FALLA</th>
              <th>NOMBRE</th>
              <th>DIRECCION</th>
              <th>RPU</th>
              {/* <th>CIUDAD</th> */}
              <th>CUENTA</th>
              <th>AGENCIA</th>
            </tr>
          </thead>
            <tbody>
              {dataGeneral.map((data, index) => (
                <tr key={data.Id || index}>
                <td
                  onClick={() => handleOnClick(data)}
                  style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
                >
                  {data['# Notif']}
                </td>
                <td>{data['Fecha Elab.']?.slice(0, 10)}</td>
                <td>{data['Khw_sinot']}</td>
                <td>{data['Imp_Total_sinot']}</td>
                <td>{data.Falla}</td>
                <td>{data.Nombre_sinot}</td>
                <td>{data.Dirección}</td>
                <td>{data.rpu}</td>
                {/* <td>{data.Ciudad}</td> */}
                <td>{data.Cuenta}</td>
                <td>{data.Agencia}</td>
              </tr>
              
              ))}
            </tbody>
        </table>
      </div>
      <div className="pagination-controls">
      <button 
        onClick={() => handlePageChange(currentPage - 1)} 
        disabled={currentPage <= 1}
      >
        Anterior
      </button>
      <span>
      { (currentPage - 1) * 10 + 1 } - {currentPage * 10} registros - Página {currentPage} - {totalPages * 10} Registros
      </span>
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
      {fallaTipo && fallaTipo.startsWith("UI") ? (
        <>
          <button style={{ margin: "0px 5px" }} onClick={() => { generatePDF1(selectedPDF); }}>Sobre-M</button>
          <button style={{ margin: "0px 5px" }} onClick={() => { generatePDF2(selectedPDF); }}>ACUSES-CM</button>
          <button style={{ margin: "0px 5px" }} onClick={() => { generatePDF5(selectedPDF); }}>AR-UI-SC</button>
          <button style={{ margin: "0px 5px" }} onClick={() => { generatePDF6(selectedPDF); }}>AR-UI-CC</button>
        </>
      ) : fallaTipo && fallaTipo.startsWith("EF") ? (
        <>
          <button style={{ margin: "0px 5px" }} onClick={() => { generatePDF1(selectedPDF); }}>Sobre-M</button>
          <button style={{ margin: "0px 5px" }} onClick={() => { generatePDF2(selectedPDF); }}>ACUSES-CM</button>
          <button style={{ margin: "0px 5px" }} onClick={() => { generatePDF3(selectedPDF); }}>AR-EF</button>
        </>
      ) : fallaTipo && fallaTipo.startsWith("FM") ? (
        <>
          <button style={{ margin: "0px 5px" }} onClick={() => { generatePDF1(selectedPDF); }}>Sobre-M</button>
          <button style={{ margin: "0px 5px" }} onClick={() => { generatePDF2(selectedPDF); }}>ACUSES-CM</button>
          <button style={{ margin: "0px 5px" }} onClick={() => { generatePDF4(selectedPDF); }}>AR-FM</button>
        </>
      ) : (
        <>
          <button style={{ margin: "0px 5px" }} onClick={() => { generatePDF1(selectedPDF); }}>Sobre-M</button>
          <button style={{ margin: "0px 5px" }} onClick={() => { generatePDF2(selectedPDF); }}>ACUSES-CM</button>
        </>
      )}

      </div>
      {pdfData && <iframe src={pdfData} width="100%" height="100%"></iframe>}
      <button style={{ margin: "0px 5px" }} onClick={closeModal}>Cerrar</button>
      <button onClick={downloadPDF}>Descargar PDF</button>
    </Modal>
  
    </div>
  );
};
