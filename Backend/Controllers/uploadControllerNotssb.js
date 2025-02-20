const pool = require('../Config/conexion');
const multer = require('multer');
const path = require('path');
const xlsx = require('xlsx');
const fs = require('fs');
const moment = require('moment');

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

// Función para convertir fechas de Excel al formato `YYYY-MM-DD HH:mm:ss`
moment.locale('es'); // Para reconocer meses en español
function convertExcelDate(excelDate) {
  if (!excelDate) return null;

  // Verificar si es un número (fecha serial de Excel)
  if (typeof excelDate === 'number') {
    return moment((excelDate - 25569) * 86400 * 1000).format('YYYY-MM-DD HH:mm:ss');
  }

  // Intentar convertir utilizando múltiples formatos comunes
  const date = moment(excelDate, ['D-MMM-YY','DD/MM/YYYY HH:mm', 'D-MMM-YYYY', 'YYYY-MM-DD', 'DD/MM/YYYY', 'DD-MMM-YY', 'YYYY-MM-DD HH:mm:ss'], true);

  if (!date.isValid()) {
    console.warn('Formato de fecha inválido:', excelDate);
    return null;
  }

  return date.format('YYYY-MM-DD HH:mm:ss');
}

// Función para dividir los datos en bloques de tamaño `batchSize`
function chunkArray(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

// Controlador para manejar la subida y procesamiento del archivo
const uploadFileNotssb = async (req, res) => {
  try {
    await new Promise((resolve, reject) => {
      upload(req, res, function (err) {
        if (err) {
          console.error('Error en Multer:', err);
          return reject(new Error(err.message));
        }

        if (!req.file) {
          console.error('No se ha proporcionado ningún archivo.');
          return reject(new Error('No se ha proporcionado ningún archivo.'));
        }
        resolve();
      });
    });

    const { path: filePath } = req.file;

    // Leer y procesar el archivo Excel
    const workbook = xlsx.readFile(filePath);
    let allRows = [];

    workbook.SheetNames.forEach(sheetName => {
      const sheet = workbook.Sheets[sheetName];
      const rows = xlsx.utils.sheet_to_json(sheet, { defval: null });

      rows.forEach(row => {
        const mappedRow = {
          '#': row['#'],
          Falla: row['Falla'],
          Notif: row['Notif'],
          Zona: row['Zona'],
          Agencia: row['Agencia'],
          Tarifa: row['Tarifa'],
          RPU: row['RPU'],
          Cuenta: row['Cuenta'],
          Nombre: row['Nombre'],
          'Cálculo': convertExcelDate(row['Cálculo']),
          'Elaboró': convertExcelDate(row['Elaboró']),
          Kwh: row['Kwh'],
          '$ Energía': row['$ Energía'],
          '$ IVA': row['$ IVA'],
          '$ DAP': row['$ DAP'],
          '$ Total': row['$ Total'],
          'Fecha Ultimo Status': convertExcelDate(row['Fecha Ultimo Status']),
          'Status Actual': row['Status Actual'],
          Sicoss: row['Sicoss'],
          Mapa: row['Mapa'],
        };

        allRows.push(mappedRow);
      });
    });

    // Validar los datos antes de la inserción
    const values = allRows.map(row => [
      row['#'],
      row.Falla,
      row.Notif,
      row.Zona,
      row.Agencia,
      row.Tarifa,
      row.RPU,
      row.Cuenta,
      row.Nombre,
      row['Cálculo'],
      row['Elaboró'],
      row.Kwh,
      row['$ Energía'],
      row['$ IVA'],
      row['$ DAP'],
      row['$ Total'],
      row['Fecha Ultimo Status'],
      row['Status Actual'],
      row.Sicoss,
      row.Mapa,
    ]);

    const batchSize = 5000;  // Tamaño del lote

    // Dividir los datos en bloques de 5000 registros
    const batches = chunkArray(values, batchSize);

    // Eliminar todos los registros existentes antes de insertar nuevos datos
    const deleteSql = 'DELETE FROM excel_db_not_ssb';
    await pool.promise().query(deleteSql);

    // Función para insertar bloques de datos
    let batchIndex = 0;
    async function insertNextBatch() {
      if (batchIndex < batches.length) {
        const batch = batches[batchIndex];

        const insertSql = `INSERT INTO excel_db_not_ssb (
          \`#\`, Falla, Notif, Zona, Agencia, Tarifa, RPU, Cuenta, Nombre, \`Cálculo\`, \`Elaboró\`, Kwh,
          \`$ Energía\`, \`$ IVA\`, \`$ DAP\`, \`$ Total\`, \`Fecha Ultimo Status\`, \`Status Actual\`, Sicoss, Mapa
        ) VALUES ?`;

        try {
          await pool.promise().query(insertSql, [batch]);
          console.log(`Bloque ${batchIndex + 1} insertado exitosamente.`);
          batchIndex++;
          insertNextBatch();
        } catch (insertError) {
          console.error('Error al insertar el bloque en la base de datos:', insertError);
          res.status(500).json({ error: insertError.message });
        }
      } else {
        res.status(200).json({ message: 'Todos los bloques fueron insertados correctamente.' });
      }
    }

    // Iniciar la inserción del primer bloque
    insertNextBatch();

  } catch (error) {
    console.error('Error al procesar el archivo Excel:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  uploadFileNotssb,
};
