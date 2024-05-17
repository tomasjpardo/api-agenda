import mysql from "mysql2/promise";

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "admin",
    database: "agenda",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export const query = async (sql: string, values?: any[] | undefined) => {
    const [results] = await pool.query(sql, values);
    return results;
};
