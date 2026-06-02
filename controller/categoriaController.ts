import { Request, Response } from 'express';
import { CategoriaService } from '@/service/categoriaService';

// Instancia o serviço para usar seus métodos
const categoriaService = new CategoriaService();

export class CategoriaController {

  // Endpoint: GET /api/categorias (Para os botões do topo)
  async getBotoesTopo(req: Request, res: Response) {
    try {
      const categorias = await categoriaService.listarTodasCategorias();
      return res.status(200).json(categorias);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: "Erro ao buscar botões de categorias." });
    }
  }

  // Endpoint: GET /api/servicos?categoria=2 (Para a lista de cards)
  async getCardsTela(req: Request, res: Response) {
    try {
      // Pega o id da categoria da URL se houver (ex: ?categoria=2)
      const { categoria } = req.query; 
      
      const cards = await categoriaService.listarCardsServicos(categoria as string);
      return res.status(200).json(cards);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: "Erro ao buscar cards de serviços." });
    }
  }
}
