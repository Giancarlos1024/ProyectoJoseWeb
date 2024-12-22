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
      
      // Arreglo para acumular los datos de todas las hojas
      let allRows = [];

      // Iterar sobre todas las hojas
      workbook.SheetNames.forEach(sheetName => {
        const sheet = workbook.Sheets[sheetName];
        const rows = xlsx.utils.sheet_to_json(sheet);

        // Acumular las filas de cada hoja
        allRows = allRows.concat(rows);
      });

      // Preparar los datos para inserción
      const values = allRows.map(row => [
        row.Notif,
        excelDateToJSDate(row.Fecha_Elab), // Convertir la fecha
        row.rpe_elaboronotif,
        row.Tarifa,
        row['Anomalía'], // Asegurarse de que el nombre del campo coincide
        row.Programa,
        excelDateToJSDate(row['Fecha Insp']), // Convertir la fecha
        row.rpe_inspeccion,
        row.tipo,
        excelDateToJSDate(row['Fecha Cal_Recal']), // Convertir la fecha
        row.RPE_Calculo,
        excelDateToJSDate(row.Fecha_Inicio), // Convertir la fecha
        excelDateToJSDate(row.Fecha_Final), // Convertir la fecha
        row.KHW_Total,
        row['Imp_Energía'], // Asegurarse de que el nombre del campo coincide
        row.Imp_Total,
        excelDateToJSDate(row['Fecha Venta']), // Convertir la fecha
        row.rpe_venta,
        row.Operacion,
        excelDateToJSDate(row['Fecha Operación']), // Convertir la fecha
        row.rpe_operacion,
        row.Nombre,
        row['Dirección'], // Asegurarse de que el nombre del campo coincide
        row.rpu,
        row.Ciudad,
        row.Cuenta,
        row.Cve_Agen,
        row.Agencia,
        row.Zona_A,
        row.Zona_B,
        row.medidor_inst,
        row.medidor_ret,
        row.Obs_notif,
        row.Obs_edo,
        row.Obs_term // Incluir Obs_term aquí
      ]);
      
      // Primero, borrar los datos existentes en la tabla
      pool.query('DELETE FROM excel_db_sinot', (deleteError) => {
        if (deleteError) {
          console.error('Error al borrar los datos existentes:', deleteError);
          return res.status(500).json({ error: deleteError.message });
        }

        // Luego, insertar los nuevos datos
        const sql = `INSERT INTO excel_db_sinot (
              Notif, Fecha_Elab, rpe_elaboronotif, Tarifa, Anomalia, Programa, Fecha_Insp,
              rpe_inspeccion, tipo, Fecha_Cal_Recal, RPE_Calculo, Fecha_Inicio, Fecha_Final,
              KHW_Total, Imp_Energia, Imp_Total, Fecha_Venta, rpe_venta, Operacion, 
              Fecha_Operacion, rpe_operacion, Nombre, Direccion, rpu, Ciudad, Cuenta,
              Cve_Agen, Agencia, Zona_A, Zona_B, medidor_inst, medidor_ret, Obs_notif, Obs_edo, Obs_term
            ) VALUES ?`;

        pool.query(sql, [values], (insertError, results) => {
          if (insertError) {
            console.error('Error al insertar en la base de datos:', insertError);
            return res.status(500).json({ error: insertError.message });
          }

          res.status(200).json({ message: 'File uploaded and data saved to database successfully', file: req.file });
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
