-- CREATE DATABASE ElectricidadDB;
-- GO
-- USE ElectricidadDB;
-- GO

CREATE TABLE Cuentas (
    numeroCuenta VARCHAR(50) PRIMARY KEY,
    saldo DECIMAL(10, 2)
);

CREATE TABLE Recibos (
    idRecibo INT PRIMARY KEY IDENTITY(1,1),
    numeroCuenta VARCHAR(50) NOT NULL,
    monto DECIMAL(10, 2),
    fecha DATE,
    estado VARCHAR(20) DEFAULT 'pendiente',
    FOREIGN KEY (numeroCuenta) REFERENCES Cuentas(numeroCuenta)
);

-- Insertar datos de prueba
INSERT INTO Cuentas (numeroCuenta, saldo) VALUES
('1001', 1000.00),
('1002', 500.00),
('1003', 2000.00);

INSERT INTO Recibos (numeroCuenta, monto, fecha, estado) VALUES
('1001', 150.75, '2025-06-01', 'pendiente'),
('1001', 200.00, '2025-05-01', 'pagado'),
('1002', 75.20, '2025-06-15', 'pendiente'),
('1003', 300.50, '2025-06-10', 'pendiente');