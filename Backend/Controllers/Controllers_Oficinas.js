const pool = require('../Config/conexion');

// Crear una nueva oficina
exports.create = (req, res) => {
  const {
    Notif, Fecha_Elab, rpe_elaboronotif, Tarifa, Anomalia, Programa, Fecha_Insp,
    rpe_inspeccion, tipo, Fecha_Cal_Recal, RPE_Calculo, Fecha_Inicio, Fecha_Final,
    KHW_Total, Imp_Energia, Imp_Total, Fecha_Venta, rpe_venta, Operacion,
    Fecha_Operacion, rpe_operacion, Nombre, Direccion, rpu, Ciudad, Cuenta,
    Cve_Agen, Agencia, Zona_A, Zona_B, medidor_inst, medidor_ret, Obs_notif, Obs_edo, Obs_term
  } = req.body;

  const sql = `INSERT INTO excel_db_sinot (
    Notif, Fecha_Elab, rpe_elaboronotif, Tarifa, Anomalia, Programa, Fecha_Insp,
    rpe_inspeccion, tipo, Fecha_Cal_Recal, RPE_Calculo, Fecha_Inicio, Fecha_Final,
    KHW_Total, Imp_Energia, Imp_Total, Fecha_Venta, rpe_venta, Operacion, 
    Fecha_Operacion, rpe_operacion, Nombre, Direccion, rpu, Ciudad, Cuenta,
    Cve_Agen, Agencia, Zona_A, Zona_B, medidor_inst, medidor_ret, Obs_notif, Obs_edo, Obs_term
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?);`;

  const values = [
    Notif, Fecha_Elab, rpe_elaboronotif, Tarifa, Anomalia, Programa, Fecha_Insp,
    rpe_inspeccion, tipo, Fecha_Cal_Recal, RPE_Calculo, Fecha_Inicio, Fecha_Final,
    KHW_Total, Imp_Energia, Imp_Total, Fecha_Venta, rpe_venta, Operacion,
    Fecha_Operacion, rpe_operacion, Nombre, Direccion, rpu, Ciudad, Cuenta,
    Cve_Agen, Agencia, Zona_A, Zona_B, medidor_inst, medidor_ret, Obs_notif, Obs_edo, Obs_term
  ];


  console.log('Columnas:', sql.split('(')[1].split(')')[0].split(',').length); // Número de columnas
  console.log('Valores:', values.length); // Número de valores
  

  pool.query(sql, values, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al crear la oficina' });
    } else {
      res.status(201).json({ message: 'Oficina creada exitosamente' });
    }
  });
};


// Obtener todas las oficinas con filtros
exports.getAll = (req, res) => {
  const { notif, year, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  let sql = 'SELECT COUNT(*) AS total FROM excel_db_sinot';
  const queryParams = [];

  if (notif || year) {
    sql += ' WHERE';
    if (notif) {
      sql += ' notif = ?';
      queryParams.push(notif);
    }
    if (year) {
      if (queryParams.length > 0) sql += ' AND';
      sql += ' YEAR(Fecha_Elab) = ?';
      queryParams.push(year);
    }
  }

  pool.query(sql, queryParams, (err, countResults) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error al obtener el conteo de oficinas');
    }

    const totalRecords = countResults[0].total;
    const totalPages = Math.ceil(totalRecords / limit);

    sql = 'SELECT * FROM excel_db_sinot';
    queryParams.length = 0;

    if (notif || year) {
      sql += ' WHERE';
      if (notif) {
        sql += ' notif = ?';
        queryParams.push(notif);
      }
      if (year) {
        if (queryParams.length > 0) sql += ' AND';
        sql += ' YEAR(Fecha_Elab) = ?';
        queryParams.push(year);
      }
    }

    sql += ' ORDER BY Fecha_Elab ASC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), parseInt(offset));

    pool.query(sql, queryParams, (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error al obtener las oficinas');
      } else {
        res.status(200).json({ data: results, totalPages });
      }
    });
  });
};

// Actualizar una oficina
exports.update = (req, res) => {
  const { id } = req.params;
  const {
    Notif, Fecha_Elab, rpe_elaboronotif, Tarifa, Anomalia, Programa, Fecha_Insp,
    rpe_inspeccion, tipo, Fecha_Cal_Recal, RPE_Calculo, Fecha_Inicio, Fecha_Final,
    KHW_Total, Imp_Energia, Imp_Total, Fecha_Venta, rpe_venta, Operacion,
    Fecha_Operacion, rpe_operacion, Nombre, Direccion, rpu, Ciudad, Cuenta,
    Cve_Agen, Agencia, Zona_A, Zona_B, medidor_inst, medidor_ret, Obs_notif, Obs_edo, Obs_term
  } = req.body;

  const sql = `UPDATE excel_db_sinot SET
    Notif = ?, Fecha_Elab = ?, rpe_elaboronotif = ?, Tarifa = ?, Anomalia = ?, Programa = ?,
    Fecha_Insp = ?, rpe_inspeccion = ?, tipo = ?, Fecha_Cal_Recal = ?, RPE_Calculo = ?,
    Fecha_Inicio = ?, Fecha_Final = ?, KHW_Total = ?, Imp_Energia = ?, Imp_Total = ?,
    Fecha_Venta = ?, rpe_venta = ?, Operacion = ?, Fecha_Operacion = ?, rpe_operacion = ?,
    Nombre = ?, Direccion = ?, rpu = ?, Ciudad = ?, Cuenta = ?, Cve_Agen = ?, Agencia = ?,
    Zona_A = ?, Zona_B = ?, medidor_inst = ?, medidor_ret = ?, Obs_notif = ?, Obs_edo = ?, Obs_term = ?
    WHERE Id = ?`;

  const values = [
    Notif, Fecha_Elab, rpe_elaboronotif, Tarifa, Anomalia, Programa, Fecha_Insp,
    rpe_inspeccion, tipo, Fecha_Cal_Recal, RPE_Calculo, Fecha_Inicio, Fecha_Final,
    KHW_Total, Imp_Energia, Imp_Total, Fecha_Venta, rpe_venta, Operacion,
    Fecha_Operacion, rpe_operacion, Nombre, Direccion, rpu, Ciudad, Cuenta,
    Cve_Agen, Agencia, Zona_A, Zona_B, medidor_inst, medidor_ret, Obs_notif, Obs_edo, Obs_term, id
  ];

  pool.query(sql, values, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al actualizar la oficina' });
    } else {
      res.status(200).json({ message: 'Oficina actualizada exitosamente' });
    }
  });
};


// Eliminar una oficina
exports.delete = (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM excel_db_sinot WHERE id = ?';
  pool.query(sql, [id], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error al eliminar la oficina');
    } else {
      res.status(200).send('Oficina eliminada');
    }
  });
};
