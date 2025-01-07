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
          'Cálculo': convertExcelDate(row['Cálculo']), // Usando la nueva función de conversión con hora
          'Elaboró': convertExcelDate(row['Elaboró']), // Usando la nueva función de conversión con hora
          Kwh: row['Kwh'],
          '$ Energía': row['$ Energía'],
          '$ IVA': row['$ IVA'],
          '$ DAP': row['$ DAP'],
          '$ Total': row['$ Total'],
          'Fecha Ultimo Status': convertExcelDate(row['Fecha Ultimo Status']), // Usando la nueva función de conversión con hora
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

    // Eliminar todos los registros existentes antes de insertar nuevos datos (si es necesario)
    const deleteSql = 'DELETE FROM excel_db_not_ssb';
    await pool.promise().query(deleteSql);

    // Consulta SQL para insertar los datos
    const insertSql = `INSERT INTO excel_db_not_ssb (
      \`#\`, Falla, Notif, Zona, Agencia, Tarifa, RPU, Cuenta, Nombre, \`Cálculo\`, \`Elaboró\`, Kwh,
      \`$ Energía\`, \`$ IVA\`, \`$ DAP\`, \`$ Total\`, \`Fecha Ultimo Status\`, \`Status Actual\`, Sicoss, Mapa
    ) VALUES ?`;

    await pool.promise().query(insertSql, [values]);

    res.status(200).json({ message: 'Archivo subido y datos guardados en la base de datos exitosamente', file: req.file });
  } catch (error) {
    console.error('Error al procesar el archivo Excel:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  uploadFileNotssb,
};
