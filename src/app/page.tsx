'use client';

import React, { useState, useEffect } from 'react';
import { Cliente, Emprestimo, Amortizacao, CalculoEmprestimo } from '../lib/types';
import { calcularValoresEmprestimo } from '../lib/finance';
import {
  carregarDadosCompletos,
  cadastrarCliente,
  cadastrarEmprestimo,
  alterarStatusEmprestimo,
  apagarEmprestimo,
  cadastrarAmortizacao,
  apagarAmortizacao,
  estaUsandoNuvem,
  inscreverTempoReal,
} from '../lib/dataService';
import {
  getPIN,
  limparTodaBase,
  carregarExemploJosefa,
} from '../lib/storage';

import { Header } from '../components/Header';
import { Dashboard } from '../components/Dashboard';
import { LoanDetail } from '../components/LoanDetail';
import { AmortizationDrawer } from '../components/AmortizationDrawer';
import { NewLoanModal } from '../components/NewLoanModal';
import { PINScreen } from '../components/PINScreen';

export default function Home() {
  // Estado de Autenticação / PIN (Atualizado para 251077)
  const [desbloqueado, setDesbloqueado] = useState(false);
  const [savedPin, setSavedPin] = useState('251077');
  const [isCloud, setIsCloud] = useState(false);

  // Estado dos Dados
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
  const [amortizacoes, setAmortizacoes] = useState<Amortizacao[]>([]);
  const [carregando, setCarregando] = useState(true);

  // Navegação e Modais
  const [emprestimoSelecionadoId, setEmprestimoSelecionadoId] = useState<string | null>(null);
  const [drawerAmortizacaoAberto, setDrawerAmortizacaoAberto] = useState(false);
  const [modalNovoEmprestimoAberto, setModalNovoEmprestimoAberto] = useState(false);

  // Carrega os dados persistidos no navegador ou Supabase
  const carregarDados = async () => {
    setIsCloud(estaUsandoNuvem());
    setSavedPin(getPIN());
    const dados = await carregarDadosCompletos();
    setClientes(dados.clientes);
    setEmprestimos(dados.emprestimos);
    setAmortizacoes(dados.amortizacoes);
    setCarregando(false);
  };

  useEffect(() => {
    carregarDados();

    // 1. Inscrição em WebSockets (Supabase Realtime)
    const desinscreverWS = inscreverTempoReal(() => {
      carregarDados();
    });

    // 2. Atualização imediata ao focar na aba ou desbloquear a tela do celular
    const handleFoco = () => {
      carregarDados();
    };
    window.addEventListener('focus', handleFoco);
    document.addEventListener('visibilitychange', handleFoco);

    // 3. Heartbeat em segundo plano (a cada 4 segundos) para sincronização perfeita sem F5
    const timer = setInterval(() => {
      carregarDados();
    }, 4000);

    return () => {
      desinscreverWS();
      window.removeEventListener('focus', handleFoco);
      document.removeEventListener('visibilitychange', handleFoco);
      clearInterval(timer);
    };
  }, []);

  // Recalcula os 5 valores para todos os empréstimos
  const calculos: CalculoEmprestimo[] = emprestimos.map((emp) => {
    const cli = clientes.find((c) => c.id === emp.clienteId);
    const amorts = amortizacoes.filter((a) => a.emprestimoId === emp.id);
    return calcularValoresEmprestimo(emp, amorts, cli);
  });

  // Empréstimo em foco no momento
  const calculoSelecionado = calculos.find(
    (c) => c.emprestimo.id === emprestimoSelecionadoId
  );

  // Handlers de Ações
  const handleNovoEmprestimo = async (dados: {
    clienteId?: string;
    novoCliente?: {
      nome: string;
      apelido?: string;
      telefone?: string;
    };
    valorOriginal: number;
    taxaMensal: number;
    dataInicio: string;
    dataVencimento: string;
    observacao?: string;
  }) => {
    let finalClienteId = dados.clienteId;

    if (!finalClienteId && dados.novoCliente) {
      const novoCli = await cadastrarCliente(dados.novoCliente);
      finalClienteId = novoCli.id;
    }

    if (!finalClienteId) return;

    const novoEmp = await cadastrarEmprestimo({
      clienteId: finalClienteId,
      valorOriginal: dados.valorOriginal,
      taxaMensal: dados.taxaMensal,
      dataInicio: dados.dataInicio,
      dataVencimento: dados.dataVencimento,
      status: 'Ativo',
      observacao: dados.observacao,
    });

    await carregarDados();
    setModalNovoEmprestimoAberto(false);
    // Abre direto na ficha do novo empréstimo
    setEmprestimoSelecionadoId(novoEmp.id);
  };

  const handleSalvarAmortizacao = async (dados: {
    valor: number;
    dataPagamento: string;
    formaPagamento: string;
    observacao: string;
  }) => {
    if (!emprestimoSelecionadoId) return;

    await cadastrarAmortizacao({
      emprestimoId: emprestimoSelecionadoId,
      valor: dados.valor,
      dataPagamento: dados.dataPagamento,
      formaPagamento: dados.formaPagamento,
      observacao: dados.observacao,
    });

    await carregarDados();
    setDrawerAmortizacaoAberto(false);
  };

  const handleAlternarStatus = async (novoStatus: 'Ativo' | 'Quitado') => {
    if (!emprestimoSelecionadoId) return;
    await alterarStatusEmprestimo(emprestimoSelecionadoId, novoStatus);
    await carregarDados();
  };

  const handleExcluirAmortizacao = async (id: string) => {
    await apagarAmortizacao(id);
    await carregarDados();
  };

  const handleExcluirEmprestimo = async (id: string) => {
    await apagarEmprestimo(id);
    setEmprestimoSelecionadoId(null);
    await carregarDados();
  };

  const handleLimparBase = async () => {
    if (confirm('Atenção: deseja limpar toda a base e começar com tudo vazio?')) {
      limparTodaBase();
      setEmprestimoSelecionadoId(null);
      await carregarDados();
    }
  };

  const handleCarregarExemplo = async () => {
    carregarExemploJosefa();
    await carregarDados();
  };

  if (carregando) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        Carregando...
      </div>
    );
  }

  // Se a tela estiver bloqueada por PIN
  if (!desbloqueado) {
    return (
      <PINScreen
        savedPIN={savedPin}
        onUnlock={() => setDesbloqueado(true)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Header */}
      <Header
        isCloud={isCloud}
        onLock={() => setDesbloqueado(false)}
        onCarregarExemplo={handleCarregarExemplo}
        onLimparBase={handleLimparBase}
      />

      {/* Conteúdo Principal (Container Mobile Primeiro) */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 pt-4">
        {calculoSelecionado ? (
          <LoanDetail
            calculo={calculoSelecionado}
            onVoltar={() => setEmprestimoSelecionadoId(null)}
            onAbrirAmortizacao={() => setDrawerAmortizacaoAberto(true)}
            onAlternarStatus={handleAlternarStatus}
            onExcluirAmortizacao={handleExcluirAmortizacao}
            onExcluirEmprestimo={handleExcluirEmprestimo}
          />
        ) : (
          <Dashboard
            calculos={calculos}
            onSelecionarEmprestimo={(id) => setEmprestimoSelecionadoId(id)}
            onNovoEmprestimo={() => setModalNovoEmprestimoAberto(true)}
            onCarregarExemplo={handleCarregarExemplo}
          />
        )}
      </main>

      {/* Bottom Sheet de Lançamento de Amortização */}
      {drawerAmortizacaoAberto && calculoSelecionado && (
        <AmortizationDrawer
          saldoAtual={calculoSelecionado.v5_valorAtualizado}
          clienteNome={calculoSelecionado.cliente?.nome || 'Cliente'}
          onSalvar={handleSalvarAmortizacao}
          onFechar={() => setDrawerAmortizacaoAberto(false)}
        />
      )}

      {/* Modal de Cadastro de Novo Empréstimo */}
      {modalNovoEmprestimoAberto && (
        <NewLoanModal
          clientesExistentes={clientes}
          onCriar={handleNovoEmprestimo}
          onFechar={() => setModalNovoEmprestimoAberto(false)}
        />
      )}
    </div>
  );
}
