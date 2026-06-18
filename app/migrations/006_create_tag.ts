import pool from '@/app/lib/dataBase';

export async function up(): Promise<void> {
    const sql = `
    CREATE TABLE IF NOT EXISTS tag (
    id_tag INT AUTO_INCREMENT PRIMARY KEY,
    id_categoria INT,
    id_usuario INT,
    FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria),
    FOREIGN KEY (id_usuario) REFERENCES prestador(id_usuario)
    );
    `;
    await pool.query(sql);
}