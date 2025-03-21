CREATE DATABASE NewProject;

USE NewProject;

DROP DATABASE NewProject;


DROP TABLE excel_db_not_ssb;
/*SE CAMBIO DE BIGINT A VARCHAR EN RPU*/

CREATE TABLE excel_db_not_ssb (
    `#` INT AUTO_INCREMENT PRIMARY KEY, -- Campo con el símbolo #
    Falla VARCHAR(150),
    Notif INT,
    Zona VARCHAR(150),
    Agencia VARCHAR(150),
    Tarifa VARCHAR(150),
    RPU VARCHAR(255),
    Cuenta VARCHAR(150),
    Nombre VARCHAR(255),
    `Cálculo` DATETIME,       -- Campo con tilde
    `Elaboró` DATETIME,       -- Campo con tilde
    Kwh DECIMAL(10, 3),
    `$ Energía` DECIMAL(10, 2), -- Campo con símbolo $
    `$ IVA` DECIMAL(10, 2),     -- Campo con símbolo $
    `$ DAP` DECIMAL(10, 2),     -- Campo con símbolo $
    `$ Total` DECIMAL(10, 2),   -- Campo con símbolo $
    `Fecha Ultimo Status` DATETIME, -- Campo con espacios
    `Status Actual` VARCHAR(250),  -- Campo con espacios
    Sicoss VARCHAR(150),
    Mapa VARCHAR(255)
);
DROP TABLE excel_db_sinot;
CREATE TABLE excel_db_sinot (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    `# Notif` INT,
    `Fecha Elab.` DATE NULL,
    `rpe_elaboronotif` VARCHAR(50),
    `Tarifa` VARCHAR(50),
    `Anomalía` VARCHAR(50),
    `Programa` INT,
    `Fecha Insp.` DATE NULL,
    `rpe_inspeccion` VARCHAR(50),
    `tipo` VARCHAR(10),
    `Fecha Cál/Recal` DATE NULL,
    `RPE Calculó` VARCHAR(50),
    `Fecha Inicio` DATE NULL,
    `Fecha Final` DATE NULL,
    `KHW Total` DECIMAL(10, 2),
    `Imp. Energía` DECIMAL(10, 2),
    `Imp. Total` DECIMAL(10, 2),
    `Fecha Venta` DATE NULL,
    `rpe_venta` VARCHAR(50),
    `Operación` VARCHAR(50),
    `Fecha Operación` DATE NULL,
    `rpe_operacion` VARCHAR(50),
    `Nombre` VARCHAR(255),
    `Dirección` VARCHAR(255),
    `rpu` VARCHAR(50),
    `Ciudad` VARCHAR(100),
    `Cuenta` VARCHAR(50),
    `Cve. Agen` VARCHAR(50),
    `Agencia` VARCHAR(100),
    `Zona.` VARCHAR(50),
    `Zona` VARCHAR(50),
    `medidor_inst` VARCHAR(50),
    `medidor_ret` VARCHAR(50),
    `Obs_notif` TEXT,
    `Obs_edo` LONGTEXT,
    `Obs_term` LONGTEXT
);
DROP TABLE BD;

CREATE TABLE BD (
    id INT AUTO_INCREMENT PRIMARY KEY,
    RPU VARCHAR(255),
    NOMBRE VARCHAR(100),
    DIRECCION VARCHAR(255),
    ENTRE VARCHAR(255),
    CALLES VARCHAR(255),
    NUMMED VARCHAR(50),
    TARIFA VARCHAR(50),
    RMU VARCHAR(50),
    STS_SERVICIO VARCHAR(50),
    TELEFONO VARCHAR(20),
    CUENTA VARCHAR(50),
    GEO_X DECIMAL(15, 8),  -- Aumentar la precisión para coordenadas
    GEO_Y DECIMAL(15, 8)   -- Aumentar la precisión para coordenadas
);


/* CÓDIGO PARA INSERTAR REGISTROS DE UN ARCHIVO CSV A MYSQL */
LOAD DATA INFILE 'C:\\ProgramData\\MySQL\\MySQL Server 8.0\\Uploads\\si_not.csv'
INTO TABLE excel_db_sinot
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ';'
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(Notif, Fecha_Elab, rpe_elaboronotif, Tarifa, Anomalia, Programa, Fecha_Insp, rpe_inspeccion, tipo, Fecha_Cal_Recal, RPE_Calculo, Fecha_Inicio, Fecha_Final, KHW_Total, Imp_Energia, Imp_Total, Nombre, Direccion, rpu, Ciudad, Cuenta, Cve_Agen, Agencia, Zona_A, Zona_B, medidor_inst, medidor_ret, Obs_notif, Obs_edo);


CREATE TABLE IF NOT EXISTS usuarios(
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(20) NOT NULL,
    contrasena VARCHAR(20) NOT NULL,
    roles VARCHAR(50) NOT NULL,
    creado_por VARCHAR(50) NOT NULL
);




INSERT INTO usuarios(usuario, contrasena, roles, creado_por)
VALUES('Admin','jose123*','Admin','Admin');


SELECT * FROM usuarios;


/* CÓDIGO PARA INSERTAR REGISTROS DE UN ARCHIVO CSV A MYSQL */
LOAD DATA INFILE 'C:\\ProgramData\\MySQL\\MySQL Server 8.0\\Uploads\\BD128000.csv'
INTO TABLE BD
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ';'
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(RPU, NOMBRE, DIRECCION, ENTRE, CALLES, NUMMED, TARIFA, RMU, STS_SERVICIO, TELEFONO, CUENTA, GEO_X, GEO_Y);

SELECT * FROM excel_db_sinot;
SELECT * FROM excel_db_not_ssb;
SELECT * FROM BD;

SELECT count(*) FROM BD;





