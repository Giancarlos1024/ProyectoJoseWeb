CREATE DATABASE NewProject;

USE NewProject;

DROP TABLE excel_db_not_ssb;
-- tabla con campos agregados que son 3 campos mas
CREATE TABLE excel_db_not_ssb (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Falla VARCHAR(150),
    Notif INT,
    Zona VARCHAR(150),
    Agencia VARCHAR(150),
    Tarifa VARCHAR(150),
    RPU BIGINT,
    Cuenta VARCHAR(150),
    Nombre VARCHAR(255),
    Calculo DATETIME,
    Elaboro DATETIME,
    Kwh DECIMAL(10, 3),
    Energia DECIMAL(10, 2),
    IVA DECIMAL(10, 2),
    DAP DECIMAL(10, 2),
    Total DECIMAL(10, 2),
    Fecha_Ultimo_Status DATETIME,
    Status_Actual VARCHAR(250)
);


-- tabla con campos agregados que son 6 campos mas
CREATE TABLE excel_db_sinot (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Notif INT,
    Fecha_Elab DATE NULL,
    rpe_elaboronotif VARCHAR(50),
    Tarifa VARCHAR(50),
    Anomalia VARCHAR(50),
    Programa INT,
    Fecha_Insp DATE NULL,
    rpe_inspeccion VARCHAR(50),
    tipo VARCHAR(10),
    Fecha_Cal_Recal DATE NULL,
    RPE_Calculo VARCHAR(50),
    Fecha_Inicio DATE NULL,
    Fecha_Final DATE NULL,
    KHW_Total DECIMAL(10, 2),
    Imp_Energia DECIMAL(10, 2),
    Imp_Total DECIMAL(10, 2),
    Fecha_Venta DATE NULL,
    rpe_venta VARCHAR(50),
    Operacion VARCHAR(50),
    Fecha_Operacion DATE NULL,
    rpe_operacion VARCHAR(50),
    Nombre VARCHAR(255),
    Direccion VARCHAR(255),
    rpu VARCHAR(50),
    Ciudad VARCHAR(100),
    Cuenta VARCHAR(50),
    Cve_Agen VARCHAR(50),
    Agencia VARCHAR(100),
    Zona_A VARCHAR(50),
    Zona_B VARCHAR(50),
    medidor_inst VARCHAR(50),
    medidor_ret VARCHAR(50),
    Obs_notif TEXT,
    Obs_edo LONGTEXT,
    Obs_term LONGTEXT
);



CREATE TABLE IF NOT EXISTS usuarios(
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(20) NOT NULL,
    contrasena VARCHAR(20) NOT NULL,
    roles VARCHAR(50) NOT NULL
);

INSERT INTO usuarios(usuario, contrasena, roles)
VALUES('Admin','jose123*','Admin');

SELECT * FROM usuarios;
