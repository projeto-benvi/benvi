
import pool from '@/app/lib/dataBase';
import { up as createUsuario } from './001_create_usuario';
import { up as createPrestador } from './002_create_prestador';
import { up as createCategoria } from './003_create_categoria';
import { up as createServico } from './004_create_servico';
import { up as createSolicitacaoServico } from './008_create_solicitacaoServico';
import { up as createAgenda } from './009_create_agenda';
import { up as createAvaliacao } from './010_create_avaliacao';
import { up as createConversa } from './015_create_conversa';
import { up as createConversaMensagem } from './016_create_mensagem';
import { up as creatAssinaturaPlano } from './018_assinaturaPlano';
import { up as createReporte } from './017_create_reporte';

//A ordem de criação importa, então prestem atenção nas FK's
const migrations = [
  { name: '001_create_usuario', fn: createUsuario },
  { name: '002_create_prestador', fn: createPrestador },
  { name: '003_create_categoria', fn: createCategoria },
  { name: '004_create_servico', fn: createServico },
  { name: '008_create_SolicitacaoServico', fn: createSolicitacaoServico },
  { name: '009_create_agenda', fn: createAgenda },
  { name: '010_create_avaliacao', fn: createAvaliacao },
  { name: '015_create_conversa', fn: createConversa },
  { name: '016_create_mensagem', fn: createConversaMensagem },
  { name: '017_create_reporte', fn: createReporte },
  { name: '018_create_assinaturaPlano', fn: creatAssinaturaPlano },

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