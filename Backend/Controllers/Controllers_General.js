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
      excel_db_not_ssb AS nssb
    INNER JOIN 
      excel_db_sinot AS sinot
    ON 
      nssb.Notif = sinot.\`# Notif\`
    INNER JOIN 
      BD b
    ON 
      TRIM(LOWER(sinot.Nombre)) = TRIM(LOWER(b.NOMBRE))
      AND TRIM(LOWER(sinot.Dirección)) = TRIM(LOWER(b.DIRECCION))
  `;

  // Construcción dinámica del filtro
  if (notif || year) {
    query += ' WHERE';
    if (notif) {
      query += ' sinot.\`# Notif\` = ?';
      queryParams.push(notif);
    }
    if (year) {
      if (queryParams.length > 0) query += ' AND';
      query += ' YEAR(sinot.\`Fecha Elab.\`) = ?';
      queryParams.push(year);
    }
  }

  pool.query(query, queryParams, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
  
    // Simula la paginación si no tienes lógica en la consulta SQL
    const totalRecords = results.length;
    const limit = parseInt(req.query.limit, 10) || 10; // Límite por página (default: 10)
    const currentPage = parseInt(req.query.page, 10) || 1; // Página actual (default: 1)
    const totalPages = Math.ceil(totalRecords / limit);
  
    // Corta los resultados según la paginación
    const paginatedResults = results.slice((currentPage - 1) * limit, currentPage * limit);
  
    res.status(200).json({
      data: paginatedResults,
      totalPages,
      totalRecords,
      currentPage
    });
  });
  
};


module.exports = { getGeneral };
