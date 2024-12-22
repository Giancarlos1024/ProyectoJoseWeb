const pool = require('../Config/conexion');

// Obtener todos los registros con paginación y filtros opcionales
exports.getAllRecords = (req, res) => {
  const { notif, year, page = 1, pageSize = 10 } = req.query;

  let sql = 'SELECT * FROM excel_db_not_ssb WHERE 1=1';

  if (notif) {
    sql += ' AND Notif = ?';
  }
  if (year) {
    sql += ' AND YEAR(Fecha_Ultimo_Status) = ?';
  }

  // Agregar paginación
  const offset = (page - 1) * pageSize;
  sql += ' LIMIT ?, ?';

  const values = [];
  if (notif) values.push(notif);
  if (year) values.push(year);
  values.push(offset, parseInt(pageSize));

  pool.query(sql, values, (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error al obtener los registros');
    } else {
      res.json(results);
    }
  });
};

// Obtener el conteo total de registros con filtros opcionales
exports.getRecordCount = (req, res) => {
  const { notif, year } = req.query;

  let sql = 'SELECT COUNT(*) AS count FROM excel_db_not_ssb WHERE 1=1';

  if (notif) {
    sql += ' AND Notif = ?';
  }
  if (year) {
    sql += ' AND YEAR(Fecha_Ultimo_Status) = ?';
  }

  const values = [];
  if (notif) values.push(notif);
  if (year) values.push(year);

  pool.query(sql, values, (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error al obtener el conteo de registros');
    } else {
      res.json({ count: results[0].count });
    }
  });
};

// Obtener un solo registro por ID
exports.getRecordById = (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM excel_db_not_ssb WHERE Id = ?';
  pool.query(sql, [id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error al obtener el registro');
    } else if (results.length === 0) {
      res.status(404).send('Registro no encontrado');
    } else {
      res.json(results[0]);
    }
  });
};

// Crear un nuevo registro
exports.createRecord = (req, res) => {
  const {
    Falla, Notif, Zona, Agencia, Tarifa, RPU, Cuenta, Nombre, Calculo, Elaboro,
    Kwh, Energia, IVA, DAP, Total, Fecha_Ultimo_Status, Status_Actual
  } = req.body;

  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const sql = 'INSERT INTO excel_db_not_ssb SET ?';
  const values = {
    Falla, Notif, Zona, Agencia, Tarifa, RPU, Cuenta, Nombre,
    Calculo: formatDate(Calculo),
    Elaboro: formatDate(Elaboro),
    Kwh, Energia, IVA, DAP, Total,
    Fecha_Ultimo_Status: formatDate(Fecha_Ultimo_Status),
    Status_Actual
  };

  pool.query(sql, values, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error al crear el registro');
    } else {
      res.status(201).json({ id: result.insertId, ...values });
    }
  });
};


// Actualizar un registro por ID
exports.updateRecord = (req, res) => {
  const { id } = req.params;
  const {
    Falla, Notif, Zona, Agencia, Tarifa, RPU, Cuenta, Nombre, Calculo, Elaboro,
    Kwh, Energia, IVA, DAP, Total, Fecha_Ultimo_Status, Status_Actual
  } = req.body;

  const sql = `UPDATE excel_db_not_ssb SET
    Falla = ?, Notif = ?, Zona = ?, Agencia = ?, Tarifa = ?, RPU = ?, Cuenta = ?, 
    Nombre = ?, Calculo = ?, Elaboro = ?, Kwh = ?, Energia = ?, IVA = ?, DAP = ?, 
    Total = ?, Fecha_Ultimo_Status = ?, Status_Actual = ?
    WHERE Id = ?`;

  const values = [
    Falla, Notif, Zona, Agencia, Tarifa, RPU, Cuenta, Nombre, Calculo, Elaboro,
    Kwh, Energia, IVA, DAP, Total, Fecha_Ultimo_Status, Status_Actual, id
  ];

  pool.query(sql, values, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error al actualizar el registro');
    } else if (result.affectedRows === 0) {
      res.status(404).send('Registro no encontrado');
    } else {
      res.json({ id, ...req.body });
    }
  });
};

// Eliminar un registro por ID
exports.deleteRecord = (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM excel_db_not_ssb WHERE Id = ?';
  pool.query(sql, [id], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error al eliminar el registro');
    } else if (result.affectedRows === 0) {
      res.status(404).send('Registro no encontrado');
    } else {
      res.status(204).send();
    }
  });
};
