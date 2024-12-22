const pool = require('../Config/conexion');
const multer = require('multer');
const path = require('path');
const xlsx = require('xlsx');
const fs = require('fs');

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

// Función para convertir un número de serie de Excel a una fecha
const excelDateToJSDate = (serial) => {
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  const date_info = new Date(utc_value * 1000);

  const fractional_day = serial - Math.floor(serial) + 0.0000001;
  const total_seconds = Math.floor(86400 * fractional_day);
  const seconds = total_seconds % 60;
  const hours = Math.floor(total_seconds / (60 * 60));
  const minutes = Math.floor(total_seconds / 60) % 60;

  return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds);
};

// Controlador para manejar la subida y procesamiento del archivo
const uploadFileNotssb = (req, res) => {
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

      // Iterar sobre todas las hojas
      workbook.SheetNames.forEach(sheetName => {
        const sheet = workbook.Sheets[sheetName];
        const rows = xlsx.utils.sheet_to_json(sheet);

        // Validación de columnas esperadas
        rows.forEach(row => {
          if (
            !row.Falla || !row.Notif || !row.Zona || !row.Agencia || !row.Tarifa ||
            !row.RPU || !row.Cuenta || !row.Nombre || !row.Elaboro || !row.Kwh || 
            !row.Energia || !row.Total || !row.Calculo || !row.IVA || !row.DAP ||
            !row.Fecha_Ultimo_Status || !row['Status Actual']
          ) {
            console.warn('Fila con datos incompletos:', row);
          }
        });

        allRows = allRows.concat(rows);
      });

      // Preparar los datos para la inserción en la base de datos
      const values = allRows.map(row => [
        row.Falla, 
        row.Notif,
        row.Zona,
        row.Agencia,
        row.Tarifa,
        row.RPU,
        row.Cuenta,
        row.Nombre,
        row.Calculo,
        row.Elaboro,
        row.Kwh,
        row.Energia,
        row.IVA,
        row.DAP,
        row.Total,
        // excelDateToJSDate(row.Fecha_Ultimo_Status),
        row.Fecha_Ultimo_Status,
        row['Status Actual']
      ]);

      // Eliminar todos los registros existentes en la tabla antes de insertar nuevos datos
      const deleteSql = 'DELETE FROM excel_db_not_ssb';

      pool.query(deleteSql, (deleteError) => {
        if (deleteError) {
          console.error('Error al eliminar registros existentes:', deleteError);
          return res.status(500).json({ error: deleteError.message });
        }

        // Consulta SQL para insertar los datos en la base de datos
        const insertSql = `INSERT INTO excel_db_not_ssb (
          Falla, Notif, Zona, Agencia, Tarifa, RPU, Cuenta, Nombre, Calculo, Elaboro, Kwh, Energia, IVA, DAP, Total, Fecha_Ultimo_Status, Status_Actual
        ) VALUES ?`;

        pool.query(insertSql, [values], (insertError, results) => {
          if (insertError) {
            console.error('Error al insertar en la base de datos:', insertError);
            return res.status(500).json({ error: insertError.message });
          }

          res.status(200).json({ message: 'Archivo subido y datos guardados en la base de datos exitosamente', file: req.file });
        });
      });
    } catch (error) {
      console.error('Error al procesar el archivo Excel:', error);
      res.status(500).json({ error: 'Error al procesar el archivo Excel.' });
    }
  });
};

module.exports = {
  uploadFileNotssb
};
