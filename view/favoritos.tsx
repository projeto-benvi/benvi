'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle,
  Filter,
  Heart,
  Loader2,
  MapPin,
  Search,
  ShieldCheck,
  Star,
  Trash2,
  UserRound,
  X,
} from 'lucide-react';
import SearchBar from '@/components/searchBar';
import { useAuth } from '@/hooks/useAuth';

interface FavoritoItem {
	id_favorito: number;
	id_usuario: number;
	id_prestador: number;
	data_favorito: string;
	nome: string;
	foto_perfil?: string;
	cidade?: string;
	categoria_principal?: string;
	descricao_profissional?: string;
	servicos_oferecidos?: string;
	media_nota: number;
	total_avaliacoes: number;
}

type Ordenacao = 'mais-recentes' | 'melhor-avaliados' | 'nome';

type NotaFiltro = 0 | 1 | 2 | 3 | 4;

function extrairServicos(item: FavoritoItem): string[] {
	const valor = item.servicos_oferecidos || '';
	if (!valor.trim()) return [item.categoria_principal || 'Servicos gerais'];

	return valor
		.split('||')
		.map((servico) => servico.trim())
		.filter(Boolean)
		.slice(0, 3);
}

export default function FavoritosView() {
	const { user, logado } = useAuth();
	const router = useRouter();
	const painelRef = useRef<HTMLDivElement | null>(null);
	const botaoFiltrosRef = useRef<HTMLButtonElement | null>(null);

	const [favoritos, setFavoritos] = useState<FavoritoItem[]>([]);
	const [busca, setBusca] = useState('');
	const [carregando, setCarregando] = useState(true);
	const [removendo, setRemovendo] = useState<number | null>(null);
	const [ordenacao, setOrdenacao] = useState<Ordenacao>('mais-recentes');
	const [filtrosAbertos, setFiltrosAbertos] = useState(false);
	const [categoriaFiltro, setCategoriaFiltro] = useState('');
	const [cidadeFiltro, setCidadeFiltro] = useState('');
	const [servicosSelecionados, setServicosSelecionados] = useState<string[]>([]);
	const [notaMinima, setNotaMinima] = useState<NotaFiltro>(0);

	const carregarFavoritos = useCallback(async () => {
		if (!user?.id) return;

		setCarregando(true);
		try {
			const params = new URLSearchParams({
				id_usuario: String(user.id),
				ordenarPor: ordenacao,
			});

			if (busca.trim()) {
				params.set('termo', busca.trim());
			}

			if (categoriaFiltro.trim()) {
				params.set('categoria', categoriaFiltro.trim());
			}

			if (cidadeFiltro.trim()) {
				params.set('cidade', cidadeFiltro.trim());
			}

			if (notaMinima > 0) {
				params.set('notaMinima', String(notaMinima));
			}

			if (servicosSelecionados.length > 0) {
				params.set('servicos', servicosSelecionados.join(','));
			}

			const response = await fetch(`/api/favoritos?${params.toString()}`, {
				cache: 'no-store',
			});

			if (!response.ok) {
				throw new Error('Erro ao buscar favoritos.');
			}

			const dados = await response.json();
			setFavoritos(Array.isArray(dados) ? dados : []);
		} catch (error) {
			console.error(error);
			setFavoritos([]);
		} finally {
			setCarregando(false);
		}
	}, [user?.id, busca, categoriaFiltro, cidadeFiltro, notaMinima, servicosSelecionados, ordenacao]);

	useEffect(() => {
		if (!logado) {
			setCarregando(false);
			return;
		}

		if (user?.id) {
			carregarFavoritos();
		}
	}, [logado, user?.id, carregarFavoritos]);

	useEffect(() => {
		function handleClickFora(event: MouseEvent) {
			if (!filtrosAbertos) return;

			const alvo = event.target as Node;
			const clicouNoPainel = painelRef.current?.contains(alvo);
			const clicouNoBotao = botaoFiltrosRef.current?.contains(alvo);

			if (!clicouNoPainel && !clicouNoBotao) {
				setFiltrosAbertos(false);
			}
		}

		document.addEventListener('mousedown', handleClickFora);
		return () => document.removeEventListener('mousedown', handleClickFora);
	}, [filtrosAbertos]);

	const favoritosOrdenados = useMemo(() => {
		return [...favoritos];
	}, [favoritos]);

	const opcoesServicos = useMemo(() => {
		const unicos = new Set<string>();
		favoritos.forEach((item) => {
			extrairServicos(item).forEach((servico) => unicos.add(servico));
		});
		return Array.from(unicos).slice(0, 8);
	}, [favoritos]);

	async function removerFavorito(item: FavoritoItem) {
		if (!user?.id) return;

		setRemovendo(item.id_favorito);
		try {
			const params = new URLSearchParams({
				id_usuario: String(user.id),
				id_prestador: String(item.id_prestador),
			});

			const response = await fetch(`/api/favoritos?${params.toString()}`, {
				method: 'DELETE',
			});

			if (!response.ok) {
				throw new Error('Não foi possível remover o favorito.');
			}

			setFavoritos((anterior) =>
				anterior.filter((favorito) => favorito.id_favorito !== item.id_favorito)
			);
		} catch (error) {
			console.error(error);
		} finally {
			setRemovendo(null);
		}
	}

	function alternarServicoFiltro(servico: string) {
		setServicosSelecionados((anterior) => {
			if (anterior.includes(servico)) {
				return anterior.filter((item) => item !== servico);
			}
			return [...anterior, servico];
		});
	}

	function limparFiltros() {
		setCategoriaFiltro('');
		setCidadeFiltro('');
		setServicosSelecionados([]);
		setNotaMinima(0);
		setOrdenacao('mais-recentes');
	}

	if (!logado) {
		return (
			<div className="min-h-screen bg-gray-50">
				<SearchBar />
				<div className="mx-auto max-w-4xl px-6 py-16 text-center">
					<h1 className="text-2xl font-bold text-gray-800">Entre na sua conta</h1>
					<p className="mt-2 text-sm text-gray-500">Faça login para visualizar seus prestadores favoritos.</p>
					<button
						onClick={() => router.push('/login')}
						className="mt-6 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
					>
						Ir para login
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<SearchBar />

			<section className="mx-auto max-w-[1240px] px-4 py-8 md:px-6">
				<div className="mb-6 flex flex-wrap items-center justify-between gap-4">
					<div className="flex items-center gap-3">
						<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
							<Heart size={22} fill="currentColor" />
						</div>
						<div>
							<h1 className="text-2xl font-bold text-gray-900">Meus favoritos</h1>
							<p className="text-sm text-gray-500">{favoritos.length} prestadores salvos.</p>
						</div>
					</div>

					<div className="flex flex-wrap items-center gap-3">
						<div className="relative">
							<Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
							<input
								value={busca}
								onChange={(e) => setBusca(e.target.value)}
								placeholder="Buscar favorito"
								className="h-10 w-56 rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-700 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100 md:w-64"
							/>
						</div>

						<button
							ref={botaoFiltrosRef}
							onClick={() => setFiltrosAbertos((valor) => !valor)}
							className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
						>
							<Filter size={16} />
							Filtros
						</button>

						<button
							onClick={carregarFavoritos}
							className="h-10 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-600 transition hover:bg-gray-100"
						>
							Atualizar
						</button>
					</div>
				</div>

				<div>
						{carregando ? (
							<div className="flex min-h-[260px] items-center justify-center">
								<Loader2 className="animate-spin text-blue-500" size={28} />
							</div>
						) : favoritosOrdenados.length === 0 ? (
							<div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
								<Heart size={40} className="mx-auto text-gray-300" />
								<p className="mt-4 text-lg font-semibold text-gray-700">Nenhum favorito encontrado</p>
								<p className="mt-1 text-sm text-gray-500">
									Adicione prestadores aos favoritos para visualizar aqui.
								</p>
							</div>
						) : (
							<div className="space-y-4">
								<div className="flex items-center justify-end gap-2 text-sm text-gray-500">
									<span>Ordenar por</span>
									<select
										value={ordenacao}
										onChange={(e) => setOrdenacao(e.target.value as Ordenacao)}
										aria-label="Ordenar favoritos"
										className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-600 outline-none"
									>
										<option value="mais-recentes">Mais recentes</option>
										<option value="melhor-avaliados">Melhor avaliados</option>
										<option value="nome">Nome</option>
									</select>
								</div>

								{favoritosOrdenados.map((item) => {
									const servicos = extrairServicos(item);

									return (
										<article
											key={item.id_favorito}
											className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
										>
											<div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.35fr_1fr_0.9fr] lg:items-center">
												<div className="flex items-center gap-4 lg:border-r lg:border-gray-200 lg:pr-5">
													{item.foto_perfil ? (
														<img
															src={item.foto_perfil}
															alt={item.nome}
															className="h-24 w-24 shrink-0 rounded-full object-cover ring-2 ring-gray-100"
														/>
													) : (
														<div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-2 ring-gray-100">
															<UserRound size={32} />
														</div>
													)}

													<div className="min-w-0">
														<div className="flex items-center gap-2">
															<p className="truncate text-2xl font-semibold leading-tight text-slate-800">{item.nome}</p>
															<ShieldCheck size={18} className="shrink-0 text-blue-500" />
														</div>
														<p className="mt-1 text-base font-medium text-slate-600">
															{item.categoria_principal || 'Prestador'}
														</p>
														<div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
															<MapPin size={14} />
															<span className="truncate">{item.cidade || 'Cidade nao informada'}</span>
														</div>

														<div className="mt-3 flex items-center gap-2 text-gray-700">
															<Star size={18} fill="currentColor" className="text-amber-500" />
															<span className="text-xl font-bold leading-none">{Number(item.media_nota).toFixed(1)}</span>
															<span className="text-sm text-gray-500">{item.total_avaliacoes} Avaliacoes</span>
														</div>
													</div>
												</div>

												<div className="space-y-2 lg:border-r lg:border-gray-200 lg:px-5">
													{servicos.map((servico, index) => (
														<div key={`${item.id_favorito}-servico-${index}`} className="flex items-start gap-2 text-slate-700">
															<CheckCircle size={18} className="text-green-500" />
															<span className="text-sm leading-snug">{servico}</span>
														</div>
													))}
												</div>

												<div className="flex h-full flex-col justify-between gap-3 lg:pl-1">
													<p className="line-clamp-4 text-sm leading-relaxed text-gray-600">
														{item.descricao_profissional || 'Prestador com experiencia em servicos residenciais e comerciais.'}
													</p>

													<div className="flex flex-wrap items-center gap-2">
														<button
															onClick={() => {
																const idPrestador = Number(item.id_prestador);
																if (Number.isNaN(idPrestador) || idPrestador <= 0) return;
																router.push(`/perfil/prestador/${idPrestador}`);
															}}
															className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
														>
															Ver perfil
														</button>

														<button
															onClick={() => removerFavorito(item)}
															disabled={removendo === item.id_favorito}
															className="inline-flex items-center justify-center gap-1 rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
														>
															{removendo === item.id_favorito ? (
																<Loader2 size={14} className="animate-spin" />
															) : (
																<Trash2 size={14} />
															)}
															Remover
														</button>
													</div>
												</div>
											</div>
										</article>
									);
								})}
							</div>
						)}
				</div>
			</section>

			{filtrosAbertos && (
				<div className="fixed inset-0 z-40 bg-black/30">
					<div
						ref={painelRef}
						className="absolute right-0 top-0 h-full w-[340px] max-w-full overflow-y-auto bg-white p-5 shadow-2xl"
					>
						<div className="mb-4 flex items-center justify-between">
							<h3 className="text-xl font-bold text-gray-800">Filtros</h3>
							<button
								aria-label="Fechar filtros"
								onClick={() => setFiltrosAbertos(false)}
								className="rounded-lg p-1 hover:bg-gray-100"
							>
								<X size={18} />
							</button>
						</div>

						<div className="space-y-4">
							<div>
								<label className="mb-1 block text-sm font-semibold text-gray-700">Categoria</label>
								<input
									value={categoriaFiltro}
									onChange={(e) => setCategoriaFiltro(e.target.value)}
									placeholder="Encanador"
									className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none"
								/>
							</div>

							<div>
								<label className="mb-1 block text-sm font-semibold text-gray-700">Servicos</label>
								<div className="space-y-2">
									{opcoesServicos.slice(0, 6).map((servico) => (
										<label key={`mobile-${servico}`} className="flex items-center gap-2 text-sm text-gray-700">
											<input
												type="checkbox"
												checked={servicosSelecionados.includes(servico)}
												onChange={() => alternarServicoFiltro(servico)}
											/>
											<span>{servico}</span>
										</label>
									))}
								</div>
							</div>

							<div>
								<label className="mb-1 block text-sm font-semibold text-gray-700">Localizacao</label>
								<input
									value={cidadeFiltro}
									onChange={(e) => setCidadeFiltro(e.target.value)}
									placeholder="Digite sua cidade"
									className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none"
								/>
							</div>

							<div>
								<p className="mb-2 text-sm font-semibold text-gray-700">Avaliacao minima</p>
								<div className="grid grid-cols-5 gap-2">
									{([0, 1, 2, 3, 4] as NotaFiltro[]).map((nota) => (
										<button
											key={`mobile-nota-${nota}`}
											onClick={() => setNotaMinima(nota)}
											className={`rounded-lg border px-2 py-1 text-sm font-semibold ${
												notaMinima === nota
													? 'border-blue-500 bg-blue-50 text-blue-700'
													: 'border-gray-200 text-gray-600'
											}`}
										>
											{nota === 0 ? 'Todos' : `${nota}+`}
										</button>
									))}
								</div>
							</div>

							<div className="space-y-2 pt-3">
								<button
									onClick={() => {
										carregarFavoritos();
										setFiltrosAbertos(false);
									}}
									className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white"
								>
									Aplicar Filtros
								</button>
								<button
									onClick={limparFiltros}
									className="w-full rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-700"
								>
									Limpar
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
