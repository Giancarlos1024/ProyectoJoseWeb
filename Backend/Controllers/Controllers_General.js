const pool = require('../Config/conexion');

const getGeneral = (req, res) => {
  const { notif, year } = req.query; // Obtener los filtros del query
  const queryParams = [];
  let query = `
  SELECT 
    nssb.\`#\` AS id_not_ssb,
    nssb.Falla,
    nssb.Notif,
    nssb.Zona,
    nssb.Agencia,
    nssb.Tarifa,
    nssb.RPU,
    nssb.Cuenta,
    nssb.Nombre AS Nombre_nssb,
    nssb.\`Cálculo\`,
    nssb.\`Elaboró\`,
    nssb.Kwh,
    nssb.\`$ Energía\`,
    nssb.\`$ IVA\`,
    nssb.\`$ DAP\`,
    nssb.\`$ Total\`,
    nssb.\`Fecha Ultimo Status\`,
    nssb.\`Status Actual\`,
    sinot.\`# Notif\`,
    sinot.\`Fecha Elab.\`,
    sinot.\`Fecha Inicio\`,
    sinot.\`Fecha Final\`,
    sinot.rpe_elaboronotif,
    sinot.Tarifa AS Tarifa_sinot,
    sinot.Anomalía,
    sinot.Programa,
    sinot.\`Fecha Insp.\`,
    sinot.rpe_inspeccion,
    sinot.tipo,
    sinot.\`Fecha Cál/Recal\`,
    sinot.\`RPE Calculó\`,
    sinot.\`Nombre\` AS Nombre_sinot,
    sinot.\`KHW Total\` AS Khw_sinot,
    sinot.\`Imp. Total\` AS Imp_Total_sinot,
    sinot.Dirección,
    sinot.rpu,
    sinot.Ciudad,
    sinot.Cuenta AS Cuenta_sinot,
    sinot.Agencia AS Agencia_sinot,
    sinot.Zona AS Zona_sinot,
    sinot.\`Obs_notif\`,
    sinot.\`Obs_edo\`,
    b.NOMBRE AS Nombre_BD,
    b.DIRECCION AS Dirección_BD,
    b.ENTRE,
    b.CALLES,
    b.RMU,
    b.NUMMED,
    b.TARIFA,
    b.GEO_Y,
    b.GEO_X
  FROM 
    BD b
  INNER JOIN 
    excel_db_not_ssb nssb
  ON 
    TRIM(LOWER(b.RPU)) = TRIM(LOWER(nssb.RPU))
  INNER JOIN 
    excel_db_sinot sinot
  ON 
    nssb.Notif = sinot.\`# Notif\`
    AND DATE(nssb.Elaboró) = DATE(sinot.\`Fecha Elab.\`)
  `;

  // Construcción dinámica del filtro
  if (notif) {
    query += ' AND sinot.`# Notif` = ?';
    queryParams.push(notif);
  }
  if (year) {
    query += ' AND YEAR(sinot.`Fecha Elab.`) = ?';  
    queryParams.push(year);
  }
  

  // Agregar filtros de paginación
  const limit = parseInt(req.query.limit, 10) || 10;
  const page = parseInt(req.query.page, 10) || 1;
  const offset = (page - 1) * limit;

  query += ' LIMIT ? OFFSET ?';
  queryParams.push(limit, offset);

  // Ejecutar la consulta para obtener los resultados
  pool.query(query, queryParams, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    // Consulta para obtener el total de registros sin paginación
    const countQuery = `
      SELECT COUNT(*) AS total 
      FROM 
        BD b
      INNER JOIN 
        excel_db_not_ssb nssb
      ON 
        TRIM(LOWER(b.RPU)) = TRIM(LOWER(nssb.RPU))
      INNER JOIN 
        excel_db_sinot sinot
      ON 
        nssb.Notif = sinot.\`# Notif\`
        AND DATE(nssb.Elaboró) = DATE(sinot.\`Fecha Elab.\`)
    `;
    
    pool.query(countQuery, queryParams.slice(0, queryParams.length - 2), (countErr, countResults) => {
      if (countErr) {
        res.status(500).json({ error: countErr.message });
        return;
      }

      const totalRecords = countResults[0].total;
      const totalPages = Math.ceil(totalRecords / limit);

      res.status(200).json({
        data: results,
        totalPages,
        totalRecords,
        currentPage: page
      });
    });
  });
};

module.exports = { getGeneral };
