# TAREA9

Sistema de Gestión de Recibos Eléctricos en Tiempo Real
Este documento te guiará a través de los pasos necesarios para configurar y ejecutar la aplicación de gestión de recibos eléctricos en tu entorno local.

🚀 Cómo Ejecutar el Programa
Sigue estas instrucciones paso a paso para poner en marcha la aplicación.

1. **Requisitos Previos**
Antes de comenzar, asegúrate de tener instalados los siguientes componentes en tu sistema:

- Node.js y npm (Node Package Manager):
- SQL Server:


2. **Configuración de la Base de Datos**
- Crea la Base de Datos y las Tablas:
- Abre tu herramienta de gestión de SQL Server (SSMS o Azure Data Studio).
- Conéctate a tu instancia de SQL Server.
- Abre el archivo database/init.sql que se encuentra en la carpeta de tu proyecto.
- Ejecuta todo el contenido de este script.


3. **Configuración del Backend (Node.js)**
- Navega a la Carpeta del Proyecto:
- Abre tu terminal o línea de comandos.
- Navega hasta la carpeta raíz de tu proyecto electric-bill-system:
cd ruta/a/tu/carpeta/electric-bill-system

- Instala las Dependencias de Node.js:
- Ejecuta el siguiente comando para instalar todas las librerías necesarias (Express, ws, mssql):
npm install

- Configura las Credenciales de la Base de Datos en el Código:
- Abre el archivo src/server.js en tu editor de código.
- Busca el objeto dbConfig y reemplaza 'your_sql_user' y 'your_sql_password' con las credenciales de tu usuario de SQL Server que tiene acceso a la base de datos ElectricidadDB.

const dbConfig = {
    user: 'TU_USUARIO_SQL',       // <--- ¡ACTUALIZA ESTO!
    password: 'TU_CONTRASEÑA_SQL', // <--- ¡ACTUALIZA ESTO!
    server: 'localhost',         // Generalmente 'localhost' si está en tu máquina
    database: 'ElectricidadDB',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

4. **Ejecutar la Aplicación**
- Inicia el Servidor Node.js:
- En tu terminal, desde la carpeta raíz del proyecto (electric-bill-system), ejecuta:
- node src/server.js


Ve a la siguiente dirección:

http://localhost:3000/

Serás redirigido automáticamente a la página de consulta de recibos (consulta.html).
