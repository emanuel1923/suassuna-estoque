'use client'
import { useEffect, useState } from 'react'
import { 
  History, PlusCircle, Barcode, LayoutDashboard, RefreshCw, 
  Settings, ArrowUpRight, ArrowDownLeft, AlertTriangle, Edit3, Trash2, Save, X 
} from 'lucide-react'

export default function SistemaEstoque() {
  const [abaAtiva, setAbaAtiva] = useState('visao-geral')
  const [produtos, setProdutos] = useState<any[]>([])
  const [historico, setHistorico] = useState<any[]>([])
  
  // Estados para Edição
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [formEdit, setFormEdit] = useState<any>({})

  // Estados para Operações
  const [skuEntrada, setSkuEntrada] = useState('')
  const [qtdEntrada, setQtdEntrada] = useState(1)
  const [skuSaida, setSkuSaida] = useState('')
  const [qtdSaida, setQtdSaida] = useState(1)
  const [destinoSaida, setDestinoSaida] = useState('')

  // Estados para Cadastro
  const [novoProd, setNovoProd] = useState({ 
    nome: '', sku: '', preco_unitario: 0, quantidade_atual: 0, estoque_minimo: 5, categoria: 'EPIs' 
  })

  const carregarDados = async () => {
    try {
      const resProd = await fetch('https://suassuna-api-estoque.onrender.com/produtos')
      const dataP = await resProd.json()
      setProdutos(Array.isArray(dataP) ? dataP : [])
      
      const resHist = await fetch('https://suassuna-api-estoque.onrender.com/historico')
      const dataH = await resHist.json()
      setHistorico(Array.isArray(dataH) ? dataH : [])
    } catch (err) { console.error("Erro ao carregar:", err) }
  }

  useEffect(() => { carregarDados() }, [])

  const registrarOperacao = async (tipo: 'entrada' | 'saida') => {
    const sku = tipo === 'entrada' ? skuEntrada : skuSaida
    const qtd = tipo === 'entrada' ? qtdEntrada : qtdSaida
    const produto = produtos.find(p => p.sku === sku)

    if (!produto) return alert("Material não identificado!")

    const res = await fetch(`http://127.0.0.1:8000/estoque/${tipo}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        produto_id: produto.id, 
        quantidade: qtd, 
        setor: tipo === 'saida' ? destinoSaida : "Almoxarifado",
        funcionario: tipo === 'saida' ? "Saída via Painel" : "Entrada via Painel"
      })
    })

    if (res.ok) {
      alert(`${tipo.toUpperCase()} realizada!`)
      setSkuEntrada(''); setSkuSaida(''); setDestinoSaida('')
      carregarDados(); setAbaAtiva('visao-geral')
    }
  }

  const handleCadastrar = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('http://127.0.0.1:8000/produtos/cadastrar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novoProd)
    })
    setNovoProd({ nome: '', sku: '', preco_unitario: 0, quantidade_atual: 0, estoque_minimo: 5, categoria: 'EPIs' })
    carregarDados(); setAbaAtiva('visao-geral')
  }

  const handleSalvarEdicao = async (id: number) => {
    await fetch(`http://127.0.0.1:8000/produtos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formEdit)
    })
    setEditandoId(null); carregarDados()
  }

  return (
    <div className="min-h-screen bg-black text-white flex font-sans selection:bg-white selection:text-black">
      {/* SIDEBAR CORPORATIVA */}
      <aside className="w-72 bg-[#111111] border-r border-[#333333] p-8 space-y-10 shrink-0 shadow-2xl">
        <div className="border-l-4 border-white pl-4 mb-10">
          <h2 className="text-xl font-black uppercase tracking-tighter">Suassuna</h2>
          <h2 className="text-xl font-light uppercase tracking-widest text-gray-500">Fernandes</h2>
        </div>
        <nav className="space-y-2 text-xs uppercase font-bold tracking-widest">
          <button onClick={() => setAbaAtiva('visao-geral')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-lg transition-all ${abaAtiva === 'visao-geral' ? 'bg-white text-black' : 'text-gray-500 hover:bg-[#222222]'}`}>
            <LayoutDashboard size={18}/> Estoque Atual
          </button>
          <button onClick={() => setAbaAtiva('entrada')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-lg transition-all ${abaAtiva === 'entrada' ? 'bg-white text-black' : 'text-gray-500 hover:text-green-500'}`}>
            <ArrowDownLeft size={18}/> Entrada (+)
          </button>
          <button onClick={() => setAbaAtiva('saida')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-lg transition-all ${abaAtiva === 'saida' ? 'bg-white text-black' : 'text-gray-500 hover:text-red-500'}`}>
            <ArrowUpRight size={18}/> Saída (-)
          </button>
          <button onClick={() => setAbaAtiva('cadastrar')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-lg transition-all ${abaAtiva === 'cadastrar' ? 'bg-white text-black' : 'text-gray-500'}`}>
            <PlusCircle size={18}/> Novo Item
          </button>
          <button onClick={() => setAbaAtiva('gerenciar')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-lg transition-all ${abaAtiva === 'gerenciar' ? 'bg-white text-black' : 'text-gray-500'}`}>
            <Settings size={18}/> Gerenciar
          </button>
          <button onClick={() => setAbaAtiva('historico')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-lg transition-all ${abaAtiva === 'historico' ? 'bg-white text-black' : 'text-gray-500'}`}>
            <History size={18}/> Histórico
          </button>
        </nav>
      </aside>

      <main className="flex-1 p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-12 border-b-2 border-[#222222] pb-6">
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">{abaAtiva}</h1>
          <button onClick={carregarDados} className="p-3 hover:bg-white hover:text-black transition-all rounded-lg"><RefreshCw size={24}/></button>
        </header>

        {/* VISÃO GERAL */}
        {abaAtiva === 'visao-geral' && (
          <div className="bg-[#050505] border border-[#222222]">
            <table className="w-full text-left uppercase font-bold">
              <thead className="bg-[#111111] text-gray-500 text-[10px] tracking-widest border-b border-[#333333]">
                <tr>
                  <th className="p-6 text-center w-20">Status</th>
                  <th className="p-6">Material / SKU</th>
                  <th className="p-6 text-center">Mínimo</th>
                  <th className="p-6 text-right font-black">Saldo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#111111]">
                {produtos.map((p) => {
                  const alerta = p.quantidade_atual <= p.estoque_minimo;
                  return (
                    <tr key={p.id} className="hover:bg-[#080808]">
                      <td className="p-6 text-center">{alerta ? <AlertTriangle className="text-red-600 inline" size={20}/> : <div className="w-2 h-2 rounded-full bg-green-600 mx-auto"/>}</td>
                      <td className="p-6"><p className="text-xl font-black text-white">{p.nome}</p><span className="text-xs font-mono text-gray-600 uppercase">{p.sku}</span></td>
                      <td className="p-6 text-center text-gray-500 text-lg font-mono">{p.estoque_minimo}</td>
                      <td className={`p-6 text-right text-4xl font-black ${alerta ? 'text-red-600' : 'text-white'}`}>{p.quantidade_atual}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ENTRADA (+) */}
        {abaAtiva === 'entrada' && (
          <div className="max-w-xl mx-auto bg-[#111111] border border-[#333333] p-12">
            <h2 className="text-xl font-black uppercase mb-8 text-gray-400">Reposição</h2>
            <div className="space-y-8">
              <input value={skuEntrada} onChange={e => setSkuEntrada(e.target.value.toUpperCase())} className="w-full bg-black border border-[#333333] p-6 text-3xl font-mono focus:border-white outline-none" placeholder="BIPAR SKU" autoFocus/>
              <div className="p-6 bg-black border-l-4 border-white">
                <p className="text-2xl font-black uppercase">{produtos.find(p => p.sku === skuEntrada)?.nome || "Aguardando Leitura..."}</p>
              </div>
              <input type="number" value={qtdEntrada} onChange={e => setQtdEntrada(parseInt(e.target.value))} className="w-full bg-black border border-[#333333] p-5 text-2xl font-black outline-none" placeholder="QTD" />
              <button onClick={() => registrarOperacao('entrada')} className="w-full bg-white text-black py-6 text-lg font-black uppercase tracking-widest">Confirmar Entrada</button>
            </div>
          </div>
        )}

        {/* SAÍDA (-) */}
        {abaAtiva === 'saida' && (
          <div className="max-w-xl mx-auto bg-[#111111] border border-[#333333] p-12 shadow-2xl">
            <h2 className="text-xl font-black uppercase mb-8 text-gray-400">Baixa de Insumo</h2>
            <div className="space-y-6">
              <input value={skuSaida} onChange={e => setSkuSaida(e.target.value.toUpperCase())} className="w-full bg-black border border-[#333333] p-6 text-3xl font-mono focus:border-white outline-none" placeholder="BIPAR SKU" autoFocus/>
              <div className="p-6 bg-black border-l-4 border-white">
                <p className="text-2xl font-black uppercase">{produtos.find(p => p.sku === skuSaida)?.nome || "Aguardando Leitura..."}</p>
              </div>
              <input value={destinoSaida} onChange={e => setDestinoSaida(e.target.value)} className="w-full bg-black border border-[#333333] p-5 text-lg font-black uppercase outline-none" placeholder="DESTINO (SETOR - FUNCIONÁRIO)" />
              <input type="number" value={qtdSaida} onChange={e => setQtdSaida(parseInt(e.target.value))} className="w-full bg-black border border-[#333333] p-5 text-2xl font-black outline-none" />
              <button onClick={() => registrarOperacao('saida')} className="w-full bg-white text-black py-6 text-lg font-black uppercase tracking-widest hover:bg-gray-200">Registrar Saída</button>
            </div>
          </div>
        )}

        {/* CADASTRAR NOVO */}
        {abaAtiva === 'cadastrar' && (
          <div className="max-w-xl mx-auto bg-[#111111] border border-[#333333] p-12 shadow-2xl">
            <h2 className="text-xl font-black mb-10 uppercase border-b border-[#333333] pb-4">Novo Insumo</h2>
            <form onSubmit={handleCadastrar} className="space-y-6">
              <input required value={novoProd.sku} placeholder="CÓDIGO SKU" className="w-full bg-black border border-[#333333] p-4 text-xl font-mono focus:border-white outline-none" onChange={e => setNovoProd({...novoProd, sku: e.target.value.toUpperCase()})}/>
              <input required value={novoProd.nome} placeholder="DESCRIÇÃO DO MATERIAL" className="w-full bg-black border border-[#333333] p-4 text-xs font-bold uppercase outline-none" onChange={e => setNovoProd({...novoProd, nome: e.target.value})}/>
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="SALDO INICIAL" className="bg-black border border-[#333333] p-4 font-bold outline-none text-xs" onChange={e => setNovoProd({...novoProd, quantidade_atual: parseInt(e.target.value)})}/>
                <input type="number" placeholder="ESTOQUE MÍNIMO" className="bg-black border border-[#333333] p-4 font-bold outline-none text-xs" onChange={e => setNovoProd({...novoProd, estoque_minimo: parseInt(e.target.value)})}/>
              </div>
              <select className="w-full bg-black border border-[#333333] p-4 text-[10px] font-bold uppercase outline-none" value={novoProd.categoria} onChange={e => setNovoProd({...novoProd, categoria: e.target.value})}>
                <option value="EPIs">EPIs</option><option value="Ferramentas">Ferramentas</option><option value="Escritorio">Escritório</option><option value="Outros">Outros</option>
              </select>
              <button type="submit" className="w-full bg-white text-black py-5 font-black text-xs uppercase tracking-[0.2em]">Cadastrar Insumo</button>
            </form>
          </div>
        )}

        {/* GERENCIAR (EDIÇÃO DE SKU E EXCLUSÃO) */}
        {abaAtiva === 'gerenciar' && (
          <div className="bg-[#050505] border border-[#222222] shadow-2xl">
            <table className="w-full text-left uppercase font-bold">
              <thead className="bg-[#111111] text-gray-500 text-[10px] tracking-widest border-b border-[#333333]">
                <tr><th className="p-6">Dados do Material</th><th className="p-6 text-center">Ações</th></tr>
              </thead>
              <tbody className="divide-y divide-[#111111]">
                {produtos.map((p) => (
                  <tr key={p.id} className="hover:bg-[#080808]">
                    {editandoId === p.id ? (
                      <td colSpan={2} className="p-8 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <input className="bg-black border border-white p-4 text-xl font-black" value={formEdit.nome} onChange={e => setFormEdit({...formEdit, nome: e.target.value})}/>
                          <input className="bg-black border border-white p-4 text-xl font-mono uppercase" value={formEdit.sku} onChange={e => setFormEdit({...formEdit, sku: e.target.value.toUpperCase()})}/>
                        </div>
                        <div className="flex gap-4">
                          <button onClick={() => handleSalvarEdicao(p.id)} className="bg-white text-black px-10 py-4 font-black">SALVAR</button>
                          <button onClick={() => setEditandoId(null)} className="text-gray-500">CANCELAR</button>
                        </div>
                      </td>
                    ) : (
                      <>
                        <td className="p-6">
                          <p className="text-xl font-black text-white">{p.nome}</p>
                          <span className="text-xs font-mono text-gray-500">{p.sku} | {p.categoria}</span>
                        </td>
                        <td className="p-6 flex justify-center gap-10">
                          <button onClick={() => {setEditandoId(p.id); setFormEdit(p)}} className="text-gray-500 hover:text-white"><Edit3 size={28}/></button>
                          <button onClick={() => {if(confirm("Excluir?")) fetch(`http://127.0.0.1:8000/produtos/${p.id}`, {method:'DELETE'}).then(()=>carregarDados())}} className="text-gray-800 hover:text-red-600"><Trash2 size={28}/></button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* HISTÓRICO */}
        {abaAtiva === 'historico' && (
          <div className="bg-[#050505] border border-[#222222] overflow-hidden">
            <table className="w-full text-left uppercase font-bold">
              <thead className="bg-[#111111] text-gray-500 text-[10px] tracking-widest uppercase">
                <tr><th className="p-8">Data</th><th className="p-8">Item</th><th className="p-8">Destino</th><th className="p-8 text-right">Qtd</th></tr>
              </thead>
              <tbody className="divide-y divide-[#111111]">
                {historico.length > 0 ? historico.map((h) => (
                  <tr key={h.id} className="text-sm">
                    <td className="p-8 text-gray-600 font-mono text-xs">{new Date(h.data_movimentacao).toLocaleDateString()}</td>
                    <td className="p-8"><p className="text-lg font-black">{h.produtos?.nome || "Material"}</p><span className="text-[10px] text-gray-600 font-mono">{h.produtos?.sku}</span></td>
                    <td className="p-8 text-gray-500 font-black tracking-widest">{h.setor}</td>
                    <td className={`p-8 text-right text-3xl font-black ${h.tipo === 'ENTRADA' ? 'text-white' : 'text-gray-700'}`}>{h.tipo === 'ENTRADA' ? '+' : '-'}{h.quantidade}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="p-20 text-center text-gray-700 font-black">Sem registros.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}