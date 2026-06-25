'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface FavoritoItem {
  id_prestador: number;
}

interface FavoritarPrestadorButtonProps {
  idPrestador: number;
}

export default function FavoritarPrestadorButton({ idPrestador }: FavoritarPrestadorButtonProps) {
  const { user, logado } = useAuth();
  const router = useRouter();

  const [carregandoStatus, setCarregandoStatus] = useState(false);
  const [processando, setProcessando] = useState(false);
  const [ehFavorito, setEhFavorito] = useState(false);

  const idUsuario = useMemo(() => Number(user?.id), [user?.id]);

  useEffect(() => {
    async function buscarStatusFavorito() {
      if (!logado || !idUsuario || Number.isNaN(idUsuario)) {
        setEhFavorito(false);
        return;
      }

      setCarregandoStatus(true);
      try {
        const params = new URLSearchParams({ id_usuario: String(idUsuario) });
        const response = await fetch(`/api/favoritos?${params.toString()}`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Erro ao buscar status do favorito.');
        }

        const dados = await response.json();
        const lista: FavoritoItem[] = Array.isArray(dados) ? dados : [];
        const jaFavorito = lista.some((item) => Number(item.id_prestador) === idPrestador);
        setEhFavorito(jaFavorito);
      } catch (error) {
        console.error(error);
        setEhFavorito(false);
      } finally {
        setCarregandoStatus(false);
      }
    }

    buscarStatusFavorito();
  }, [logado, idUsuario, idPrestador]);

  async function alternarFavorito() {
    if (!logado || !idUsuario || Number.isNaN(idUsuario)) {
      router.push('/login');
      return;
    }

    setProcessando(true);
    try {
      if (ehFavorito) {
        const params = new URLSearchParams({
          id_usuario: String(idUsuario),
          id_prestador: String(idPrestador),
        });

        const response = await fetch(`/api/favoritos?${params.toString()}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Não foi possível remover dos favoritos.');
        }

        setEhFavorito(false);
        return;
      }

      const response = await fetch('/api/favoritos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_usuario: idUsuario,
          id_prestador: idPrestador,
        }),
      });

      if (response.status === 409) {
        setEhFavorito(true);
        return;
      }

      if (!response.ok) {
        throw new Error('Não foi possível adicionar aos favoritos.');
      }

      setEhFavorito(true);
    } catch (error) {
      console.error(error);
    } finally {
      setProcessando(false);
    }
  }

  const carregando = carregandoStatus || processando;

  return (
    <button
      onClick={alternarFavorito}
      disabled={carregando}
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
        ehFavorito
          ? 'border border-pink-200 bg-pink-50 text-pink-700 hover:bg-pink-100'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      } ${carregando ? 'cursor-not-allowed opacity-70' : ''}`}
      aria-label={ehFavorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      title={ehFavorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
    >
      {carregando ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Heart size={16} className={ehFavorito ? 'fill-current' : ''} />
      )}
      {carregando ? 'Aguarde...' : ehFavorito ? 'Favoritado' : 'Favoritar'}
    </button>
  );
}