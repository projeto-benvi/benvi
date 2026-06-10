
import pool from '@/app/lib/dataBase';
import { up as createUsuario }   from './001_create_usuario';
import { up as createPrestador } from './002_create_prestador';
import { up as createAvaliacao } from './003_create_solicaoServico';
import { up as createSolicitacaoServico } from './004_create_avaliacao';
import { up as createAgenda } from './010_creat_agenda';
import { up as creatAssinaturaPlano } from './019_assinaturaPlano';


//A ordem de criação importa, então prestem atenção nas FK's
const migrations = [
  { name: '001_create_usuario',   fn: createUsuario },
  { name: '002_create_prestador', fn: createPrestador },
  { name: '003_create_SolicitacaoServico', fn: createSolicitacaoServico },
  { name: '004_create_avaliacao', fn: createAvaliacao },
  { name: '010_create_agenda', fn: createAgenda },
  { name: '019_create_assinaturaPlano', fn: creatAssinaturaPlano },
];

export async function runMigrations(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      name       VARCHAR(255) PRIMARY KEY,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const [rows] = await pool.query<any[]>('SELECT name FROM _migrations');
  const applied = new Set(rows.map((r: any) => r.name));

  for (const migration of migrations) {
    if (applied.has(migration.name)) {
      console.log(`Já aplicada: ${migration.name}`);
      continue;
    }

    try {
      await migration.fn();
      await pool.query('INSERT INTO _migrations (name) VALUES (?)', [migration.name]);
      console.log(`Aplicada: ${migration.name}`);
    } catch (err) {
      console.error(`Erro em ${migration.name}:`, err);
      throw err; // interrompe para não criar tabelas em estado inválido
    }
  }
}