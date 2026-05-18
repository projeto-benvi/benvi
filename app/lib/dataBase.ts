import mysql from "mysql2/promise";
    
const pool = mysql.createPool({
    host: "localhost",
    user: "app_user",
    password: "123456",
    database: "benvi",
    port: 3306,
    waitForConnections: true,
})

export default pool;