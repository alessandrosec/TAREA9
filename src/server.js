// src/server.js
const express = require('express');
const path = require('path');
const WebSocket = require('ws');
const sql = require('mssql');

const app = express();
const port = 3000;

// Configuración de la conexión a la base de datos SQL Server
// ¡IMPORTANTE! Reemplaza 'your_sql_user' y 'your_sql_password' con tus credenciales reales
const dbConfig = {
    user: 'your_sql_user', // Reemplaza con tu usuario de SQL Server
    password: 'your_sql_password', // Reemplaza con tu contraseña
    server: 'localhost', // O la IP/nombre de tu servidor SQL Server
    database: 'ElectricidadDB',
    options: {
        encrypt: false, // Cambiar a true si usas SSL/TLS
        trustServerCertificate: true // Cambiar a false en producción y si el certificado es válido
    }
};

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, '../public')));

// NUEVA RUTA: Redirige la ruta raíz '/' a consulta.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/consulta.html'));
});

// Iniciar el servidor HTTP
const server = app.listen(port, () => {
    console.log(`Servidor HTTP escuchando en http://localhost:${port}`);
});

// Iniciar el servidor WebSocket
const wss = new WebSocket.Server({ server });

wss.on('connection', ws => {
    console.log('Cliente WebSocket conectado');

    ws.on('message', async message => {
        console.log(`Mensaje recibido: ${message}`);
        const data = JSON.parse(message);

        switch (data.type) {
            case 'consultarRecibo':
                try {
                    const pool = await sql.connect(dbConfig);
                    // Llama al procedimiento almacenado sp_ConsultarRecibosPendientes
                    const result = await pool.request()
                        .input('numeroCuenta', sql.NVarChar(20), data.numeroCuenta)
                        .execute('sp_ConsultarRecibosPendientes');

                    ws.send(JSON.stringify({ type: 'recibosPendientes', payload: result.recordset }));
                } catch (err) {
                    console.error('Error al consultar recibo:', err);
                    ws.send(JSON.stringify({ type: 'error', payload: 'Error al consultar recibo: ' + err.message }));
                }
                break;

            case 'pagarRecibo':
                try {
                    const pool = await sql.connect(dbConfig);
                    // Llama al procedimiento almacenado sp_ProcesarPago
                    const result = await pool.request()
                        .input('idRecibo', sql.Int, data.idRecibo)
                        .input('numeroCuenta', sql.NVarChar(20), data.numeroCuenta)
                        .input('metodoPago', sql.NVarChar(50), 'Saldo en cuenta') // Puedes hacer esto dinámico si lo necesitas
                        .execute('sp_ProcesarPago');

                    // sp_ProcesarPago retorna un SELECT con los detalles del pago
                    if (result.recordset && result.recordset.length > 0) {
                        const pagoInfo = result.recordset[0];
                        ws.send(JSON.stringify({
                            type: 'pagoExitoso',
                            payload: {
                                idRecibo: data.idRecibo,
                                numeroCuenta: data.numeroCuenta,
                                monto: pagoInfo.montoPagado, // Usar el monto retornado por el SP
                                numeroTransaccion: pagoInfo.numeroTransaccion,
                                nuevoSaldo: pagoInfo.nuevoSaldo
                            }
                        }));
                    } else {
                        throw new Error('El procedimiento de pago no retornó información.');
                    }

                } catch (err) {
                    console.error('Error al pagar recibo:', err);
                    // Los RAISERROR de SQL Server se capturan como errores en Node.js
                    ws.send(JSON.stringify({ type: 'error', payload: err.message || 'Error al procesar el pago.' }));
                }
                break;

            case 'visualizarRecibo':
                try {
                    const pool = await sql.connect(dbConfig);
                    // Llama al procedimiento almacenado sp_ObtenerReciboPagado
                    const result = await pool.request()
                        .input('idRecibo', sql.Int, data.idRecibo)
                        .input('numeroCuenta', sql.NVarChar(20), data.numeroCuenta || '') // numeroCuenta podría no venir si se accede directamente
                        .execute('sp_ObtenerReciboPagado');

                    if (result.recordset && result.recordset.length > 0) {
                        ws.send(JSON.stringify({ type: 'reciboPagadoDetalles', payload: result.recordset[0] }));
                    } else {
                        ws.send(JSON.stringify({ type: 'error', payload: 'Recibo no encontrado o no pagado.' }));
                    }
                } catch (err) {
                    console.error('Error al visualizar recibo:', err);
                    ws.send(JSON.stringify({ type: 'error', payload: 'Error al visualizar recibo: ' + err.message }));
                }
                break;

            // Nuevo caso para obtener detalles del recibo en pago.html (opcional, si quieres mostrar el monto antes de pagar)
            case 'getReciboDetails':
                try {
                    const pool = await sql.connect(dbConfig);
                    const result = await pool.request()
                        .input('idRecibo', sql.Int, data.idRecibo)
                        .query('SELECT idRecibo, numeroCuenta, monto, fecha, fechaVencimiento, estado FROM Recibos WHERE idRecibo = @idRecibo');

                    if (result.recordset.length > 0) {
                        ws.send(JSON.stringify({ type: 'reciboDetails', payload: result.recordset[0] }));
                    } else {
                        ws.send(JSON.stringify({ type: 'error', payload: 'Detalles del recibo no encontrados.' }));
                    }
                } catch (err) {
                    console.error('Error al obtener detalles del recibo:', err);
                    ws.send(JSON.stringify({ type: 'error', payload: 'Error al obtener detalles del recibo.' }));
                }
                break;
        }
    });

    ws.on('close', () => {
        console.log('Conexión WebSocket cerrada');
    });

    ws.on('error', error => {
        console.error('Error WebSocket:', error);
    });
});

sql.on('error', err => {
    console.error('Error general en MSSQL:', err);
});