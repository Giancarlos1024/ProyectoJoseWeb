const pool = require("../Config/conexion");

const getGeneral = (req, res) => {
  try {
    const { notif, year, limit = 10, page = 1 } = req.query;

    // console.log("Parámetros recibidos:", { notif, year, limit, page });

    const parsedLimit = Number(limit) || 10;
    const parsedPage = Math.max(1, Number(page)) || 1;
    const offset = (parsedPage - 1) * parsedLimit;

    let queryParams = [];
    let whereClauses = [];

    if (notif && notif.trim() !== "") {
      whereClauses.push("final_query.Notif = ?");
      queryParams.push(notif);
    }

    if (year && !isNaN(year)) {
      whereClauses.push("YEAR(final_query.`Fecha Elab.`) = ?");
      queryParams.push(year);
    }

    const whereSQL = whereClauses.length ? ` WHERE ${whereClauses.join(" AND ")}` : "";

    const query = `
    SELECT * FROM (
      SELECT 
        nssb.\`#\` AS id_not_ssb, nssb.Falla, nssb.Notif, nssb.Zona, nssb.Agencia, 
        nssb.Tarifa, nssb.RPU, nssb.Cuenta, nssb.Nombre AS Nombre_nssb, 
        nssb.\`Cálculo\`, nssb.\`Elaboró\`, nssb.Kwh, 
        nssb.\`$ Energía\`, nssb.\`$ IVA\`, nssb.\`$ DAP\`, 
        nssb.\`$ Total\`, nssb.\`Fecha Ultimo Status\`, nssb.\`Status Actual\`, 
        sinot.\`# Notif\`, sinot.\`Fecha Elab.\`, sinot.\`Fecha Inicio\`, 
        sinot.\`Fecha Final\`, sinot.rpe_elaboronotif, sinot.Tarifa AS Tarifa_sinot, 
        sinot.Anomalía, sinot.Programa, sinot.\`Fecha Insp.\`, sinot.rpe_inspeccion, 
        sinot.tipo, sinot.\`Fecha Cál/Recal\`, sinot.\`RPE Calculó\`, 
        sinot.Nombre AS Nombre_sinot, sinot.\`KHW Total\` AS Khw_sinot, 
        sinot.\`Imp. Total\` AS Imp_Total_sinot, sinot.Dirección, sinot.Ciudad, 
        sinot.Cuenta AS Cuenta_sinot, sinot.Agencia AS Agencia_sinot, 
        sinot.Zona AS Zona_sinot, sinot.\`Obs_notif\`, sinot.\`Obs_edo\`, 
        b.NOMBRE AS Nombre_BD, b.DIRECCION AS Dirección_BD, b.ENTRE, b.CALLES, 
        b.RMU, b.NUMMED, b.TARIFA AS Tarifa_BD, b.GEO_Y, b.GEO_X
      FROM BD b
      INNER JOIN excel_db_not_ssb nssb ON LOWER(TRIM(b.RPU)) = LOWER(TRIM(nssb.RPU))
      INNER JOIN excel_db_sinot sinot ON LOWER(TRIM(nssb.RPU)) = LOWER(TRIM(sinot.rpu))

      UNION

      SELECT 
        nssb.\`#\` AS id_not_ssb, nssb.Falla, nssb.Notif, nssb.Zona, nssb.Agencia, 
        nssb.Tarifa, nssb.RPU, nssb.Cuenta, nssb.Nombre AS Nombre_nssb, 
        nssb.\`Cálculo\`, nssb.\`Elaboró\`, nssb.Kwh, 
        nssb.\`$ Energía\`, nssb.\`$ IVA\`, nssb.\`$ DAP\`, 
        nssb.\`$ Total\`, nssb.\`Fecha Ultimo Status\`, nssb.\`Status Actual\`, 
        sinot.\`# Notif\`, sinot.\`Fecha Elab.\`, sinot.\`Fecha Inicio\`, 
        sinot.\`Fecha Final\`, sinot.rpe_elaboronotif, sinot.Tarifa AS Tarifa_sinot, 
        sinot.Anomalía, sinot.Programa, sinot.\`Fecha Insp.\`, sinot.rpe_inspeccion, 
        sinot.tipo, sinot.\`Fecha Cál/Recal\`, sinot.\`RPE Calculó\`, 
        sinot.Nombre AS Nombre_sinot, sinot.\`KHW Total\` AS Khw_sinot, 
        sinot.\`Imp. Total\` AS Imp_Total_sinot, sinot.Dirección, sinot.Ciudad, 
        sinot.Cuenta AS Cuenta_sinot, sinot.Agencia AS Agencia_sinot, 
        sinot.Zona AS Zona_sinot, sinot.\`Obs_notif\`, sinot.\`Obs_edo\`, 
        NULL AS Nombre_BD, NULL AS Dirección_BD, NULL AS ENTRE, NULL AS CALLES, 
        NULL AS RMU, NULL AS NUMMED, NULL AS Tarifa_BD, NULL AS GEO_Y, NULL AS GEO_X
      FROM excel_db_not_ssb nssb
      INNER JOIN excel_db_sinot sinot 
        ON LOWER(TRIM(nssb.RPU)) = LOWER(TRIM(sinot.rpu))
      WHERE NOT EXISTS (
        SELECT 1 FROM BD b WHERE LOWER(TRIM(b.RPU)) = LOWER(TRIM(nssb.RPU))
      )
    ) AS final_query
    ${whereSQL}
    LIMIT ? OFFSET ?;
  `;

    queryParams.push(parsedLimit, offset);

    pool.query(query, queryParams, (err, results) => {
      if (err) {
        console.error("Error en la consulta SQL:", err);
        return res.status(500).json({ error: "Error en la consulta de datos" });
      }

      console.log("Resultados obtenidos:", results);

      // Consulta de conteo
      const countQuery = `
      SELECT COUNT(*) AS total FROM (
        SELECT nssb.RPU, nssb.Notif, sinot.\`Fecha Elab.\` FROM BD b
        INNER JOIN excel_db_not_ssb nssb ON LOWER(b.RPU) = LOWER(nssb.RPU)
        INNER JOIN excel_db_sinot sinot ON LOWER(nssb.RPU) = LOWER(sinot.rpu)
    
        UNION
    
        SELECT nssb.RPU, nssb.Notif, sinot.\`Fecha Elab.\` FROM excel_db_not_ssb nssb
        INNER JOIN excel_db_sinot sinot ON LOWER(nssb.RPU) = LOWER(sinot.rpu)
      ) AS final_query
      ${whereSQL};
    `;

      pool.query(countQuery, queryParams.slice(0, whereClauses.length), (countErr, countResults) => {
        if (countErr) {
          console.error("Error en la consulta de conteo:", countErr);
          return res.status(500).json({ error: "Error en la consulta de conteo" });
        }

        const totalRecords = countResults[0].total;
        const totalPages = Math.ceil(totalRecords / parsedLimit);

        return res.status(200).json({
          data: results,
          totalPages,
          totalRecords,
          currentPage: parsedPage
        });
      });
    });
  } catch (error) {
    console.error("Error en el servidor:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

module.exports = { getGeneral };
