const pool = require('../Config/conexion');
const multer = require('multer');
const path = require('path');
const xlsx = require('xlsx');
const fs = require('fs');
const moment = require('moment'); // Para manejar las conversiones de fechas

// Configuración de almacenamiento de Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage }).single('file');

// Función para convertir fechas de Excel al formato `YYYY-MM-DD`
// Función para convertir fechas de Excel al formato `YYYY-MM-DD` utilizando moment
moment.locale('es'); // Para reconocer meses en español

function convertExcelDate(excelDate) {
  if (!excelDate) return null;

  // Verificar si es un número (fecha serial de Excel)
  if (typeof excelDate === 'number') {
    return moment((excelDate - 25569) * 86400 * 1000).format('YYYY-MM-DD');
  }

  // Intentar convertir utilizando múltiples formatos comunes
  const date = moment(excelDate, ['D-MMM-YY', 'D-MMM-YYYY', 'YYYY-MM-DD', 'DD/MM/YYYY', 'DD-MMM-YY'], true);

  if (!date.isValid()) {
    console.warn('Formato de fecha inválido:', excelDate);
    return null;
  }

  return date.format('YYYY-MM-DD');
}


const batchSize = 5000;  // Tamaño del lote, es decir, 5000 registros por vez

function chunkArray(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

const uploadFile = (req, res) => {
  upload(req, res, function (err) {
    if (err) {
      console.error('Error en Multer:', err);
      return res.status(500).json({ error: err.message });
    }

    if (!req.file) {
      console.error('No se ha proporcionado ningún archivo.');
      return res.status(400).json({ error: 'No se ha proporcionado ningún archivo.' });
    }

    const { path: filePath } = req.file;

    try {
      // Leer y procesar el archivo Excel
      const workbook = xlsx.readFile(filePath);

      let allRows = [];
      workbook.SheetNames.forEach(sheetName => {
        const sheet = workbook.Sheets[sheetName];
        const rows = xlsx.utils.sheet_to_json(sheet);
        allRows = allRows.concat(rows);
      });

      // Preparar los datos para inserción
      const values = allRows.map(row => [
        row['# Notif'],
        convertExcelDate(row['Fecha Elab.']),
        row['rpe_elaboronotif'],
        row['Tarifa'],
        row['Anomalía'],
        row['Programa'],
        convertExcelDate(row['Fecha Insp.']),
        row['rpe_inspeccion'],
        row['tipo'],
        convertExcelDate(row['Fecha Cál/Recal']),
        row['RPE Calculó'],
        convertExcelDate(row['Fecha Inicio']),
        convertExcelDate(row['Fecha Final']),
        row['KHW Total'],
        row['Imp. Energía'],
        row['Imp. Total'],
        convertExcelDate(row['Fecha Venta']),
        row['rpe_venta'],
        row['Operación'],
        convertExcelDate(row['Fecha Operación']),
        row['rpe_operacion'],
        row['Nombre'],
        row['Dirección'],
        row['rpu'],
        row['Ciudad'],
        row['Cuenta'],
        row['Cve. Agen'],
        row['Agencia'],
        row['Zona.'],
        row['Zona'],
        row['medidor_inst'],
        row['medidor_ret'],
        row['Obs_notif'],
        row['Obs_edo'],
        row['Obs_term']
      ]);

      // Dividir los datos en bloques de 5000 registros
      const batches = chunkArray(values, batchSize);

      // Primero, borrar los datos existentes en la tabla
      pool.query('DELETE FROM excel_db_sinot', (deleteError) => {
        if (deleteError) {
          console.error('Error al borrar los datos existentes:', deleteError);
          return res.status(500).json({ error: deleteError.message });
        }

        // Insertar los datos por bloques
        let batchIndex = 0;
        function insertNextBatch() {
          if (batchIndex < batches.length) {
            const batch = batches[batchIndex];

            // Inserta el bloque actual
            const sql = `INSERT INTO excel_db_sinot (
              \`# Notif\`, \`Fecha Elab.\`, \`rpe_elaboronotif\`, \`Tarifa\`, \`Anomalía\`, \`Programa\`, \`Fecha Insp.\`,
              \`rpe_inspeccion\`, \`tipo\`, \`Fecha Cál/Recal\`, \`RPE Calculó\`, \`Fecha Inicio\`, \`Fecha Final\`,
              \`KHW Total\`, \`Imp. Energía\`, \`Imp. Total\`, \`Fecha Venta\`, \`rpe_venta\`, \`Operación\`,
              \`Fecha Operación\`, \`rpe_operacion\`, \`Nombre\`, \`Dirección\`, \`rpu\`, \`Ciudad\`, \`Cuenta\`,
              \`Cve. Agen\`, \`Agencia\`, \`Zona.\`, \`Zona\`, \`medidor_inst\`, \`medidor_ret\`, \`Obs_notif\`, \`Obs_edo\`, \`Obs_term\`
            ) VALUES ?`;

            pool.query(sql, [batch], (insertError, results) => {
              if (insertError) {
                console.error('Error al insertar el bloque en la base de datos:', insertError);
                return res.status(500).json({ error: insertError.message });
              }

              console.log(`Bloque ${batchIndex + 1} insertado exitosamente.`);

              // Proceder al siguiente bloque
              batchIndex++;
              insertNextBatch();
            });
          } else {
            res.status(200).json({ message: 'Todos los bloques fueron insertados correctamente.' });
          }
        }

        // Iniciar la inserción del primer bloque
        insertNextBatch();
      });
    } catch (error) {
      console.error('Error al procesar el archivo:', error);
      return res.status(500).json({ error: 'Error al procesar el archivo.' });
    }
  });
};



module.exports = {
  uploadFile
};

/*
const pool = require('../Config/conexion');
const multer = require('multer');
const path = require('path');
const xlsx = require('xlsx');
const fs = require('fs');
const moment = require('moment'); // Para manejar las conversiones de fechas

// Configuración de almacenamiento de Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage }).single('file');

// Función para convertir fechas de Excel al formato `YYYY-MM-DD`
function convertExcelDate(excelDate, date1904 = false) {
  if (!excelDate || isNaN(excelDate)) return null;

  // Ajustar la fecha base según el sistema de fechas
  const baseDate = new Date(date1904 ? 1904 : 1900, 0, date1904 ? 1 : -1);
  
  // Calcular la fecha correcta
  const days = Math.floor(excelDate);
  const milliseconds = (excelDate - days) * 24 * 60 * 60 * 1000;
  return new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000 + milliseconds).toISOString().split('T')[0];
}

// Controlador para manejar la subida y procesamiento del archivo
const uploadFile = (req, res) => {
  upload(req, res, function (err) {
    if (err) {
      console.error('Error en Multer:', err);
      return res.status(500).json({ error: err.message });
    }

    if (!req.file) {
      console.error('No se ha proporcionado ningún archivo.');
      return res.status(400).json({ error: 'No se ha proporcionado ningún archivo.' });
    }

    const { path: filePath } = req.file;

    try {
      // Leer y procesar el archivo Excel
      const workbook = xlsx.readFile(filePath);

      let allRows = [];
      workbook.SheetNames.forEach(sheetName => {
        const sheet = workbook.Sheets[sheetName];
        const rows = xlsx.utils.sheet_to_json(sheet);
        allRows = allRows.concat(rows);
      });

      // Preparar los datos para inserción
      const values = allRows.map(row => [
        row['# Notif'],
        convertExcelDate(row['Fecha Elab.']),
        row['rpe_elaboronotif'],
        row['Tarifa'],
        row['Anomalía'],
        row['Programa'],
        convertExcelDate(row['Fecha Insp.']),
        row['rpe_inspeccion'],
        row['tipo'],
        convertExcelDate(row['Fecha Cál/Recal']),
        row['RPE Calculó'],
        convertExcelDate(row['Fecha Inicio']),
        convertExcelDate(row['Fecha Final']),
        row['KHW Total'],
        row['Imp. Energía'],
        row['Imp. Total'],
        convertExcelDate(row['Fecha Venta']),
        row['rpe_venta'],
        row['Operación'],
        convertExcelDate(row['Fecha Operación']),
        row['rpe_operacion'],
        row['Nombre'],
        row['Dirección'],
        row['rpu'],
        row['Ciudad'],
        row['Cuenta'],
        row['Cve. Agen'],
        row['Agencia'],
        row['Zona.'],
        row['Zona'],
        row['medidor_inst'],
        row['medidor_ret'],
        row['Obs_notif'],
        row['Obs_edo'],
        row['Obs_term']
      ]);

      // Primero, borrar los datos existentes en la tabla
      pool.query('DELETE FROM excel_db_sinot', (deleteError) => {
        if (deleteError) {
          console.error('Error al borrar los datos existentes:', deleteError);
          return res.status(500).json({ error: deleteError.message });
        }

        // Luego, insertar los nuevos datos
        const sql = `INSERT INTO excel_db_sinot (
          \`# Notif\`, \`Fecha Elab.\`, \`rpe_elaboronotif\`, \`Tarifa\`, \`Anomalía\`, \`Programa\`, \`Fecha Insp.\`,
          \`rpe_inspeccion\`, \`tipo\`, \`Fecha Cál/Recal\`, \`RPE Calculó\`, \`Fecha Inicio\`, \`Fecha Final\`,
          \`KHW Total\`, \`Imp. Energía\`, \`Imp. Total\`, \`Fecha Venta\`, \`rpe_venta\`, \`Operación\`, 
          \`Fecha Operación\`, \`rpe_operacion\`, \`Nombre\`, \`Dirección\`, \`rpu\`, \`Ciudad\`, \`Cuenta\`,
          \`Cve. Agen\`, \`Agencia\`, \`Zona.\`, \`Zona\`, \`medidor_inst\`, \`medidor_ret\`, \`Obs_notif\`, \`Obs_edo\`, \`Obs_term\`
        ) VALUES ?`;

        pool.query(sql, [values], (insertError, results) => {
          if (insertError) {
            console.error('Error al insertar en la base de datos:', insertError);
            return res.status(500).json({ error: insertError.message });
          }

          res.status(200).json({ message: 'Archivo subido y datos guardados en la base de datos exitosamente.', file: req.file });
        });
      });
    } catch (error) {
      console.error('Error al procesar el archivo Excel:', error);
      res.status(500).json({ error: 'Error al procesar el archivo Excel.' });
    }
  });
};

module.exports = {
  uploadFile
};


*/