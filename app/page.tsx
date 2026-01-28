"use client";

import { useState, useEffect } from "react";

export default function EstoquePage() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ id: null, nome: "", quantidade: 0, preco: 0 });
  const [editando, setEditando] = useState(false);

  const API_URL = "https://suassuna-api-estoque.onrender.com/produtos";

  // 1. CARREGAR PRODUTOS
  const fetchProdutos = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setProdutos(data);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    }
  };

  useEffect(() => {
    fetchProdutos();
  }, []);

  // 2. CADASTRAR OU ATUALIZAR (Correção do Erro de Salvar)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Se estiver editando, usa PUT e a URL com ID. Se não, usa POST.
    const url = editando ? `${API_URL}/${formData.id}` : API_URL;
    const metodo = editando ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: formData.nome,
          quantidade: Number(formData.quantidade),
          preco: Number(formData.preco),
        }),
      });

      if (res.ok) {
        alert(editando ? "✅ Alteração salva com sucesso!" : "✅ Produto cadastrado com sucesso!");
        setFormData({ id: null, nome: "", quantidade: 0, preco: 0 });
        setEditando(false);
        fetchProdutos();
      } else {
        alert("❌ Erro ao processar a requisição.");
      }
    } catch (error) {
      alert("🚀 Erro de conexão com o servidor.");
    }
  };

  // 3. EXCLUIR PRODUTO
  const handleExcluir = async (id) => {
    if (confirm("Deseja realmente excluir este item do estoque?")) {
      try {
        const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        if (res.ok) {
          alert("🗑️ Produto removido com sucesso!");
          fetchProdutos();
        } else {
          alert("❌ Erro ao excluir produto.");
        }
      } catch (error) {
        alert("🚀 Erve de conexão.");
      }
    }
  };

  // 4. PREPARAR EDIÇÃO
  const prepararEdicao = (produto) => {
    setEditando(true);
    setFormData(produto);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Sobe a página para o formulário
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>📦 Sistema de Estoque - Suassuna Fernandes</h1>

      {/* FORMULÁRIO */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "30px", border: "1px solid #ccc", padding: "15px" }}>
        <h3>{editando ? "Editar Produto" : "Novo Cadastro"}</h3>
        <input 
          type="text" placeholder="Nome" value={formData.nome}
          onChange={(e) => setFormData({...formData, nome: e.target.value})} required 
        />
        <input 
          type="number" placeholder="Quantidade" value={formData.quantidade}
          onChange={(e) => setFormData({...formData, quantidade: e.target.value})} required 
        />
        <input 
          type="number" step="0.01" placeholder="Preço" value={formData.preco}
          onChange={(e) => setFormData({...formData, preco: e.target.value})} required 
        />
        <button type="submit" style={{ marginLeft: "10px", cursor: "pointer" }}>
          {editando ? "Salvar Alterações" : "Cadastrar Produto"}
        </button>
        {editando && <button onClick={() => {setEditando(false); setFormData({id:null, nome:"", quantidade:0, preco:0})}}>Cancelar</button>}
      </form>

      {/* TABELA DE PRODUTOS */}
      {loading ? <p>Carregando estoque...</p> : (
        <table border="1" cellPadding="10" style={{ width: "100%", textAlign: "left" }}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Quantidade</th>
              <th>Preço</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map((p) => (
              <tr key={p.id}>
                <td>{p.nome}</td>
                <td>{p.quantidade}</td>
                <td>R$ {Number(p.preco).toFixed(2)}</td>
                <td>
                  <button onClick={() => prepararEdicao(p)}>✏️ Editar</button>
                  <button onClick={() => handleExcluir(p.id)} style={{ marginLeft: "10px" }}>🗑️ Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
