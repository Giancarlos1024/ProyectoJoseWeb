const pool = require('../Config/conexion');


const getBD= (req, res) => {
  const query = `SELECT * FROM BD`;

  pool.query(query, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(200).json(results);
  });
};

module.exports = { getBD};
