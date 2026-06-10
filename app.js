// 🏆 LÓGICA DO FRONTEND - MONITOR DE TORCIDA COPA 2026

// Definição dos grupos oficiais da Copa de 2026 com base nas eliminatórias e grupos definidos
const COPA_GROUPS = {
  "Grupo A": [
    { name: "México", flag: "mx" },
    { name: "África do Sul", flag: "za" },
    { name: "Coreia do Sul", flag: "kr" },
    { name: "Tchéquia", flag: "cz" }
  ],
  "Grupo B": [
    { name: "Canadá", flag: "ca" },
    { name: "Bósnia e Herzegovina", flag: "ba" },
    { name: "Catar", flag: "qa" },
    { name: "Suíça", flag: "ch" }
  ],
  "Grupo C": [
    { name: "Brasil", flag: "br" },
    { name: "Marrocos", flag: "ma" },
    { name: "Haiti", flag: "ht" },
    { name: "Escócia", flag: "gb-sct" }
  ],
  "Grupo D": [
    { name: "Estados Unidos", flag: "us" },
    { name: "Paraguai", flag: "py" },
    { name: "Austrália", flag: "au" },
    { name: "Turquia", flag: "tr" }
  ],
  "Grupo E": [
    { name: "Alemanha", flag: "de" },
    { name: "Curaçao", flag: "cw" },
    { name: "Costa do Marfim", flag: "ci" },
    { name: "Equador", flag: "ec" }
  ],
  "Grupo F": [
    { name: "Holanda", flag: "nl" },
    { name: "Japão", flag: "jp" },
    { name: "Suécia", flag: "se" },
    { name: "Tunísia", flag: "tn" }
  ],
  "Grupo G": [
    { name: "Bélgica", flag: "be" },
    { name: "Egito", flag: "eg" },
    { name: "Irã", flag: "ir" },
    { name: "Nova Zelândia", flag: "nz" }
  ],
  "Grupo H": [
    { name: "Espanha", flag: "es" },
    { name: "Cabo Verde", flag: "cv" },
    { name: "Arábia Saudita", flag: "sa" },
    { name: "Uruguai", flag: "uy" }
  ],
  "Grupo I": [
    { name: "França", flag: "fr" },
    { name: "Senegal", flag: "sn" },
    { name: "Iraque", flag: "iq" },
    { name: "Noruega", flag: "no" }
  ],
  "Grupo J": [
    { name: "Argentina", flag: "ar" },
    { name: "Argélia", flag: "dz" },
    { name: "Áustria", flag: "at" },
    { name: "Jordânia", flag: "jo" }
  ],
  "Grupo K": [
    { name: "Portugal", flag: "pt" },
    { name: "RD Congo", flag: "cd" },
    { name: "Uzbequistão", flag: "uz" },
    { name: "Colômbia", flag: "co" }
  ],
  "Grupo L": [
    { name: "Inglaterra", flag: "gb-eng" },
    { name: "Croácia", flag: "hr" },
    { name: "Gana", flag: "gh" },
    { name: "Panamá", flag: "pa" }
  ]
};

// Configurações do Supabase
// NOTA: Se você já tiver configurado as chaves no banco de dados, insira-as abaixo.
// Se preferir, você pode inseri-las diretamente no painel de configurações na tela!
let SUPABASE_URL = "";
let SUPABASE_ANON_KEY = "";

let supabase = null;
let selectedTeam = null;
let votesChart = null;
let allVotes = [];

// Elementos do DOM
const tabsContainer = document.getElementById("groupTabs");
const teamsGrid = document.getElementById("teamsGrid");
const selectedTeamDisplay = document.getElementById("selectedTeamDisplay");
const btnVote = document.getElementById("btnVote");
const voterNameInput = document.getElementById("voterName");
const voterCommentInput = document.getElementById("voterComment");
const wallFeed = document.getElementById("wallFeed");
const totalVotesCount = document.getElementById("totalVotesCount");
const topTeamsList = document.getElementById("topTeamsList");

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  // Inicializar ícones Lucide
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // Carregar configurações salvas do LocalStorage (se houver)
  loadSavedConfig();

  // Iniciar contagem regressiva
  startCountdown("2026-06-11T00:00:00Z");

  // Renderizar abas dos Grupos
  renderGroupTabs();

  // Inicializar o Supabase Client se as chaves existirem
  initSupabase();

  // Configurações do Modal de Chaves
  setupConfigModal();

  // Evento do botão de Votar
  btnVote.addEventListener("click", handleVoteSubmit);
});

// Carregar chaves do local storage ou definir valores padrão fictícios se estiver testando sem banco
function loadSavedConfig() {
  const savedUrl = localStorage.getItem("supabase_url");
  const savedKey = localStorage.getItem("supabase_anon_key");

  if (savedUrl) SUPABASE_URL = savedUrl;
  if (savedKey) SUPABASE_ANON_KEY = savedKey;

  // Atualizar inputs no modal de configurações
  document.getElementById("inputSupaUrl").value = SUPABASE_URL;
  document.getElementById("inputSupaKey").value = SUPABASE_ANON_KEY;
}

// Inicializar o Cliente Supabase
function initSupabase() {
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    if (typeof window.supabase === 'undefined') {
      console.warn("Supabase CDN não está carregado. Entrando no modo de demonstração.");
      showToast("Supabase CDN indisponível. Usando modo demonstração.", "error");
      initMockData();
      return;
    }
    try {
      supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      showToast("Supabase conectado com sucesso!", "success");
      loadVotesData();
      subscribeToRealtime();
    } catch (e) {
      console.error(e);
      showToast("Erro ao conectar ao Supabase. Verifique suas chaves.", "error");
      initMockData();
    }
  } else {
    // Se não tiver chaves, inicializa com dados mockados para o usuário ver o layout completo e funcional
    showToast("Usando modo de demonstração. Configure o Supabase para salvar em nuvem.", "info");
    initMockData();
  }
}

// Iniciar com dados de demonstração interativos se não houver Supabase conectado
function initMockData() {
  allVotes = [
    { team_name: "Brasil", team_code: "br", user_name: "Alberto", comment: "Rumo ao Hexa! Ninguém segura!", created_at: new Date().toISOString() },
    { team_name: "Argentina", team_code: "ar", user_name: "Mateo", comment: "Messi de nuevo en 2026!", created_at: new Date(Date.now() - 3600000).toISOString() },
    { team_name: "Alemanha", team_code: "de", user_name: "Lars", comment: "Wir sind bereit!", created_at: new Date(Date.now() - 7200000).toISOString() },
    { team_name: "Brasil", team_code: "br", user_name: "Carlos", comment: "Torcida brasileira unida!", created_at: new Date(Date.now() - 10800000).toISOString() },
    { team_name: "Portugal", team_code: "pt", user_name: "Cristiano", comment: "Força Portugal! O último dançar!", created_at: new Date(Date.now() - 14400000).toISOString() },
    { team_name: "México", team_code: "mx" , user_name: "Alejandro", comment: "¡Viva México! Jugamos en casa.", created_at: new Date(Date.now() - 18000000).toISOString() }
  ];
  updateUI();
}

// Carregar dados de votos do Supabase
async function loadVotesData() {
  if (!supabase) return;

  try {
    const { data, error } = await supabase
      .from("votos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    allVotes = data || [];
    updateUI();
  } catch (err) {
    console.error("Erro ao carregar dados:", err);
    showToast("Erro ao carregar os dados de votos do Supabase.", "error");
  }
}

// Inscrever no Canal em Tempo Real do Supabase (Realtime)
function subscribeToRealtime() {
  if (!supabase) return;

  supabase
    .channel("votos-changes")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "votos" },
      (payload) => {
        // Inserir novo voto no topo da lista local
        allVotes.unshift(payload.new);
        updateUI();
        showToast(`Novo voto computado para ${payload.new.team_name}!`, "success");
      }
    )
    .subscribe();
}

// Submeter o voto do usuário
async function handleVoteSubmit() {
  if (!selectedTeam) {
    showToast("Selecione um país primeiro!", "error");
    return;
  }

  const voterName = voterNameInput.value.trim() || "Anônimo";
  const voterComment = voterCommentInput.value.trim();

  btnVote.disabled = true;
  btnVote.innerHTML = '<span class="spinner" style="width:20px; height:20px; border-width:2px; display:inline-block"></span> Votando...';

  const newVote = {
    team_name: selectedTeam.name,
    team_code: selectedTeam.flag,
    user_name: voterName,
    comment: voterComment || null
  };

  if (supabase) {
    try {
      const { error } = await supabase.from("votos").insert([newVote]);
      if (error) throw error;
      
      // O Supabase Realtime cuidará de atualizar o UI se o canal estiver ativo, 
      // mas se houver atraso ou falha, recarregamos.
      showToast("Seu voto foi registrado!", "success");
      
      // Resetar form
      voterCommentInput.value = "";
    } catch (err) {
      console.error(err);
      showToast("Falha ao registrar voto no Supabase.", "error");
    } finally {
      btnVote.disabled = false;
      btnVote.innerHTML = '<i data-lucide="award"></i> Confirmar Meu Voto';
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  } else {
    // Modo Demo local
    newVote.created_at = new Date().toISOString();
    allVotes.unshift(newVote);
    updateUI();
    showToast("Voto computado no modo demonstração!", "success");
    
    // Resetar form
    voterCommentInput.value = "";
    btnVote.disabled = false;
    btnVote.innerHTML = '<i data-lucide="award"></i> Confirmar Meu Voto';
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
}

// Atualizar toda a interface baseada nos votos armazenados em allVotes
function updateUI() {
  totalVotesCount.textContent = allVotes.length;

  // 1. Processar dados para estatísticas
  const votesCountByTeam = {};
  allVotes.forEach(vote => {
    votesCountByTeam[vote.team_name] = (votesCountByTeam[vote.team_name] || 0) + 1;
  });

  // Transformar em array e ordenar descrescente
  const sortedTeams = Object.keys(votesCountByTeam).map(name => {
    // Encontrar código da bandeira
    let flag = "un";
    outerLoop:
    for (const group of Object.values(COPA_GROUPS)) {
      for (const t of group) {
        if (t.name === name) {
          flag = t.flag;
          break outerLoop;
        }
      }
    }
    return {
      name,
      flag,
      votes: votesCountByTeam[name]
    };
  }).sort((a, b) => b.votes - a.votes);

  // 2. Renderizar lista dos Top 5 mais votados
  renderTopTeamsList(sortedTeams.slice(0, 5));

  // 3. Renderizar Gráfico
  renderChart(sortedTeams.slice(0, 7));

  // 4. Renderizar Mural de Torcida
  renderWallFeed();
}

// Renderizar a lista de líderes no painel de estatísticas
function renderTopTeamsList(topTeams) {
  if (topTeams.length === 0) {
    topTeamsList.innerHTML = '<div class="empty-state">Nenhum voto registrado ainda.</div>';
    return;
  }

  topTeamsList.innerHTML = topTeams.map((team, idx) => `
    <div class="top-team-item">
      <div class="rank-badge rank-${idx + 1}">${idx + 1}</div>
      <img src="https://flagcdn.com/w80/${team.flag}.png" alt="${team.name}" class="top-team-flag" onerror="this.src='https://flagcdn.com/w80/un.png'">
      <div class="top-team-name">${team.name}</div>
      <div class="top-team-votes">${team.votes} ${team.votes === 1 ? 'voto' : 'votos'}</div>
    </div>
  `).join('');
}

// Renderizar / atualizar o gráfico do Chart.js
function renderChart(dataList) {
  if (typeof Chart === 'undefined') {
    console.warn("Chart.js não está disponível.");
    const chartContainer = document.querySelector(".chart-container");
    if (chartContainer) {
      chartContainer.innerHTML = '<div class="empty-state" style="padding:4rem 1rem;">Gráfico indisponível offline (Sem conexão com Chart.js).</div>';
    }
    return;
  }
  const ctx = document.getElementById("votesChart").getContext("2d");

  const labels = dataList.map(t => t.name);
  const data = dataList.map(t => t.votes);

  if (votesChart) {
    // Se o gráfico já existe, atualizar dados
    votesChart.data.labels = labels;
    votesChart.data.datasets[0].data = data;
    votesChart.update();
  } else {
    // Criar novo gráfico
    votesChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Votos',
          data: data,
          backgroundColor: [
            'rgba(251, 191, 36, 0.85)', // Dourado
            'rgba(6, 182, 212, 0.85)',  // Cyan
            'rgba(16, 185, 129, 0.85)', // Verde
            'rgba(139, 92, 246, 0.85)', // Roxo
            'rgba(236, 72, 153, 0.85)', // Rosa
            'rgba(59, 130, 246, 0.85)',  // Azul
            'rgba(244, 63, 94, 0.85)'   // Vermelho
          ],
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y', // Gráfico de barras horizontal
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: '#111827',
            titleColor: '#fff',
            bodyColor: '#cbd5e1',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.05)'
            },
            ticks: {
              color: '#94a3b8',
              font: { family: 'Inter' },
              stepSize: 1
            }
          },
          y: {
            grid: {
              display: false
            },
            ticks: {
              color: '#f8fafc',
              font: { family: 'Inter', weight: 'bold' }
            }
          }
        }
      }
    });
  }
}

// Renderizar o mural de mensagens (filtrando registros sem comentários para destacar as mensagens)
function renderWallFeed() {
  const feedItems = allVotes.filter(v => v.comment && v.comment.trim() !== "");

  if (feedItems.length === 0) {
    wallFeed.innerHTML = '<div class="empty-state">As mensagens de torcida aparecerão aqui. Deixe a sua abaixo!</div>';
    return;
  }

  wallFeed.innerHTML = feedItems.map(vote => {
    const timeFormatted = formatDate(vote.created_at);
    return `
      <div class="message-card">
        <div class="message-header">
          <img src="https://flagcdn.com/w40/${vote.team_code}.png" class="message-avatar" alt="${vote.team_name}" onerror="this.src='https://flagcdn.com/w40/un.png'">
          <span class="message-user">${escapeHTML(vote.user_name)}</span>
          <span class="message-team">${vote.team_name}</span>
        </div>
        <div class="message-body">"${escapeHTML(vote.comment)}"</div>
        <div class="message-time">${timeFormatted}</div>
      </div>
    `;
  }).join('');
}

// Renderizar Abas dos Grupos
function renderGroupTabs() {
  const groupNames = Object.keys(COPA_GROUPS);
  tabsContainer.innerHTML = groupNames.map((group, idx) => `
    <button class="tab-btn ${idx === 2 ? 'active' : ''}" data-group="${group}">
      ${group}
    </button>
  `).join('');

  // Evento das abas
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      e.target.classList.add("active");
      renderTeams(e.target.dataset.group);
    });
  });

  // Renderizar o Grupo C por padrão (Brasil está nele!)
  renderTeams("Grupo C");
}

// Renderizar Seleções de um Grupo Específico
function renderTeams(groupName) {
  const teams = COPA_GROUPS[groupName];
  teamsGrid.innerHTML = teams.map(team => `
    <div class="team-card ${selectedTeam && selectedTeam.name === team.name ? 'selected' : ''}" data-name="${team.name}" data-flag="${team.flag}">
      <div class="flag-wrapper">
        <img src="https://flagcdn.com/w160/${team.flag}.png" alt="${team.name}" class="flag-img" onerror="this.src='https://flagcdn.com/w160/un.png'">
      </div>
      <div class="team-name">${team.name}</div>
    </div>
  `).join('');

  // Evento de seleção do card de país
  document.querySelectorAll(".team-card").forEach(card => {
    card.addEventListener("click", () => {
      document.querySelectorAll(".team-card").forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      
      selectedTeam = {
        name: card.dataset.name,
        flag: card.dataset.flag
      };
      
      // Habilitar display
      selectedTeamDisplay.innerHTML = `
        <div style="display:flex; align-items:center; gap:8px;">
          <img src="https://flagcdn.com/w80/${selectedTeam.flag}.png" style="width:24px; height:18px; border-radius:2px; object-fit:cover; border:1px solid rgba(255,255,255,0.1)">
          Torcendo para: <strong style="color:var(--primary); margin-left:4px;">${selectedTeam.name}</strong>
        </div>
      `;
      btnVote.disabled = false;
    });
  });
}

// Contagem regressiva
function startCountdown(targetDateStr) {
  const targetDate = new Date(targetDateStr).getTime();

  function updateCountdown() {
    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference <= 0) {
      document.getElementById("countdown").innerHTML = "A Copa do Mundo de 2026 Começou! ⚽";
      return;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    document.getElementById("cdDays").textContent = String(days).padStart(2, '0');
    document.getElementById("cdHours").textContent = String(hours).padStart(2, '0');
    document.getElementById("cdMinutes").textContent = String(minutes).padStart(2, '0');
    document.getElementById("cdSeconds").textContent = String(seconds).padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
}

// Configurações do painel do modal
function setupConfigModal() {
  const btnTrigger = document.getElementById("btnConfigTrigger");
  const modal = document.getElementById("configModal");
  const btnClose = document.getElementById("btnConfigClose");
  const btnSave = document.getElementById("btnSaveConfig");

  btnTrigger.addEventListener("click", () => {
    modal.classList.add("open");
  });

  btnClose.addEventListener("click", () => {
    modal.classList.remove("open");
  });

  btnSave.addEventListener("click", () => {
    const urlVal = document.getElementById("inputSupaUrl").value.trim();
    const keyVal = document.getElementById("inputSupaKey").value.trim();

    localStorage.setItem("supabase_url", urlVal);
    localStorage.setItem("supabase_anon_key", keyVal);

    SUPABASE_URL = urlVal;
    SUPABASE_ANON_KEY = keyVal;

    modal.classList.remove("open");

    // Reinicializar conexão
    if (votesChart) {
      votesChart.destroy();
      votesChart = null;
    }
    initSupabase();
  });
}

// Toasts e Mensagens de Feedback
function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  
  // Criar elemento do toast
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  // Trigger animacao
  setTimeout(() => {
    toast.classList.add("show");
  }, 50);

  // Auto-remove
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 4000);
}

// Formatar data relativa ou amigável
function formatDate(dateString) {
  const d = new Date(dateString);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Agora mesmo";
  if (diffMins < 60) return `Há ${diffMins} min`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Há ${diffHours} h`;

  return d.toLocaleDateString("pt-BR", { day: 'numeric', month: 'short' }) + " às " + d.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' });
}

// Auxiliar contra XSS
function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}
