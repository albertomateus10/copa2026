// 🏆 LÓGICA DO FRONTEND - Bolão do Quintal - Copa 2026

// Configuração de travamento da votação
const VOTING_CLOSED = true; // Defina como true para encerrar a votação e travar o botão

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
let SUPABASE_URL = "https://wceamvewvirhqsobvpkg.supabase.co";
let SUPABASE_ANON_KEY = "sb_publishable_7qCtIykWOaYjouibqqCjjg_n7g00rnw";

let supabase = null;
let selectedTeam = null;
let allVotes = [];

// Elementos do DOM
const tabsContainer = document.getElementById("groupTabs");
const teamsGrid = document.getElementById("teamsGrid");
const selectedTeamDisplay = document.getElementById("selectedTeamDisplay");
const btnVote = document.getElementById("btnVote");
const voterFirstNameInput = document.getElementById("voterFirstName");
const voterLastNameInput = document.getElementById("voterLastName");
const totalVotesCount = document.getElementById("totalVotesCount");
const topTeamsList = document.getElementById("topTeamsList");

// Inicialização
function initApp() {
  // Inicializar ícones Lucide
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // Carregar configurações salvas do LocalStorage (se houver)
  loadSavedConfig();

  // Renderizar abas dos Grupos
  renderGroupTabs();

  // Inicializar o Supabase Client se as chaves existirem
  initSupabase();

  // Configurações do Modal de Chaves
  setupConfigModal();

  // Evento do botão de Votar
  if (btnVote) {
    btnVote.addEventListener("click", handleVoteSubmit);
  }

  // Monitorar campos de nome/sobrenome para habilitar/desabilitar botão
  function checkVoteButtonState() {
    if (VOTING_CLOSED) {
      if (btnVote) {
        btnVote.disabled = true;
        btnVote.innerHTML = '<i data-lucide="lock"></i> Votação Encerrada';
      }
      return;
    }
    const firstName = voterFirstNameInput ? voterFirstNameInput.value.trim() : '';
    const lastName = voterLastNameInput ? voterLastNameInput.value.trim() : '';
    if (btnVote && selectedTeam) {
      btnVote.disabled = !(firstName && lastName);
    }
  }

  if (voterFirstNameInput) voterFirstNameInput.addEventListener("input", checkVoteButtonState);
  if (voterLastNameInput) voterLastNameInput.addEventListener("input", checkVoteButtonState);

  // Expor para uso externo
  window._checkVoteButtonState = checkVoteButtonState;

  // Se a votação estiver fechada, aplicar substituição do layout de voto pelo aviso e a foto
  if (VOTING_CLOSED) {
    const voteForm = document.querySelector(".vote-form");
    if (voteForm) {
      voteForm.innerHTML = `
        <div class="votation-closed-container" style="display: flex; flex-direction: column; align-items: center; gap: 0.75rem; width: 100%;">
          <div style="font-size: 1.05rem; font-weight: 700; color: #f87171; display: flex; align-items: center; gap: 8px; justify-content: center; font-family: 'Outfit', sans-serif; padding: 0.25rem 0;">
            <i data-lucide="lock" style="width: 20px; height: 20px;"></i> A votação está oficialmente encerrada!
          </div>
          <div class="closed-photo-wrapper" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; width: 100%; padding: 0.75rem; display: flex; justify-content: center; align-items: center; box-shadow: 0 4px 15px rgba(0,0,0,0.3); max-height: 300px; overflow: hidden;">
            <img src="fotofez.png" alt="Votação Encerrada" style="max-height: 280px; width: auto; max-width: 100%; display: block; object-fit: contain;">
          </div>
        </div>
      `;
      // Recriar os ícones Lucide no novo conteúdo inserido
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }
  }
}

// Executar imediatamente se o DOM já estiver carregado, ou registrar evento
if (document.readyState !== 'loading') {
  initApp();
} else {
  document.addEventListener('DOMContentLoaded', initApp);
}

// Carregar chaves do local storage ou definir valores padrão fictícios se estiver testando sem banco
function loadSavedConfig() {
  try {
    const savedUrl = localStorage.getItem("supabase_url");
    const savedKey = localStorage.getItem("supabase_anon_key");

    if (savedUrl) SUPABASE_URL = savedUrl;
    if (savedKey) SUPABASE_ANON_KEY = savedKey;
  } catch (e) {
    console.warn("Não foi possível ler chaves do localStorage:", e);
  }

  // Atualizar inputs no modal de configurações com segurança
  const inputUrl = document.getElementById("inputSupaUrl");
  const inputKey = document.getElementById("inputSupaKey");
  if (inputUrl) inputUrl.value = SUPABASE_URL;
  if (inputKey) inputKey.value = SUPABASE_ANON_KEY;
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
    { team_name: "Brasil", team_code: "br", user_name: "Alberto", created_at: new Date().toISOString() },
    { team_name: "Argentina", team_code: "ar", user_name: "Mateo", created_at: new Date(Date.now() - 3600000).toISOString() },
    { team_name: "Alemanha", team_code: "de", user_name: "Lars", created_at: new Date(Date.now() - 7200000).toISOString() },
    { team_name: "Brasil", team_code: "br", user_name: "Carlos", created_at: new Date(Date.now() - 10800000).toISOString() },
    { team_name: "Portugal", team_code: "pt", user_name: "Cristiano", created_at: new Date(Date.now() - 14400000).toISOString() },
    { team_name: "México", team_code: "mx" , user_name: "Alejandro", created_at: new Date(Date.now() - 18000000).toISOString() }
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
    console.error("Erro ao carregar dados do Supabase. Usando dados locais como fallback:", err);
    showToast("Erro ao carregar dados do Supabase. Carregando dados locais.", "warning");
    initMockData();
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
  if (VOTING_CLOSED) {
    showToast("A votação do bolão está encerrada!", "error");
    return;
  }

  if (!selectedTeam) {
    showToast("Selecione um país primeiro!", "error");
    return;
  }

  const firstName = voterFirstNameInput ? voterFirstNameInput.value.trim() : '';
  const lastName = voterLastNameInput ? voterLastNameInput.value.trim() : '';

  if (!firstName || !lastName) {
    showToast("Preencha seu nome e sobrenome antes de votar!", "error");
    return;
  }

  const voterName = `${firstName} ${lastName}`;

  btnVote.disabled = true;
  btnVote.innerHTML = '<span class="spinner" style="width:20px; height:20px; border-width:2px; display:inline-block"></span> Votando...';

  const newVote = {
    team_name: selectedTeam.name,
    team_code: selectedTeam.flag,
    user_name: voterName
  };

  if (supabase) {
    try {
      const { error } = await supabase.from("votos").insert([newVote]);
      if (error) throw error;
      
      // O Supabase Realtime cuidará de atualizar o UI se o canal estiver ativo, 
      // mas se houver atraso ou falha, recarregamos.
      showToast("Seu voto foi registrado!", "success");
    } catch (err) {
      console.error(err);
      showToast("Falha ao registrar voto no Supabase.", "error");
    } finally {
      btnVote.disabled = true;
      btnVote.innerHTML = '<i data-lucide="award"></i> Confirmar Meu Voto';
      selectedTeam = null;
      if (voterFirstNameInput) voterFirstNameInput.value = '';
      if (voterLastNameInput) voterLastNameInput.value = '';
      document.querySelectorAll('.team-card').forEach(c => c.classList.remove('selected'));
      selectedTeamDisplay.innerHTML = `<i data-lucide="info" style="width:16px; height:16px; display:inline-block; vertical-align:middle; margin-right:4px;"></i> Após clicar na sua seleção, digite abaixo o seu nome e sobrenome e confirme seu voto.`;
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  } else {
    // Modo Demo local
    newVote.created_at = new Date().toISOString();
    allVotes.unshift(newVote);
    updateUI();
    showToast("Voto computado no modo demonstração!", "success");

    btnVote.disabled = true;
    btnVote.innerHTML = '<i data-lucide="award"></i> Confirmar Meu Voto';
    selectedTeam = null;
    if (voterFirstNameInput) voterFirstNameInput.value = '';
    if (voterLastNameInput) voterLastNameInput.value = '';
    document.querySelectorAll('.team-card').forEach(c => c.classList.remove('selected'));
    selectedTeamDisplay.innerHTML = `<i data-lucide="info" style="width:16px; height:16px; display:inline-block; vertical-align:middle; margin-right:4px;"></i> Após clicar na sua seleção, digite abaixo o seu nome e sobrenome e confirme seu voto.`;
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
}

// Atualizar toda a interface baseada nos votos armazenados em allVotes
function updateUI() {
  totalVotesCount.textContent = allVotes.length;

  // 1. Processar dados para estatísticas e votantes
  const votesCountByTeam = {};
  const votersByTeam = {};

  allVotes.forEach(vote => {
    const team = vote.team_name;
    votesCountByTeam[team] = (votesCountByTeam[team] || 0) + 1;
    if (!votersByTeam[team]) {
      votersByTeam[team] = [];
    }
    votersByTeam[team].push(vote.user_name || "Anônimo");
  });

  // Transformar em array e ordenar descrescente
  const sortedTeams = Object.keys(votesCountByTeam).map(name => {
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
      votes: votesCountByTeam[name],
      voters: votersByTeam[name] || []
    };
  }).sort((a, b) => b.votes - a.votes);

  // 2. Renderizar lista das seleções que receberam voto (toda a lista!)
  renderTopTeamsList(sortedTeams);
}

// Renderizar a lista de líderes no painel de estatísticas (com dropdown de votantes)
function renderTopTeamsList(topTeams) {
  if (topTeams.length === 0) {
    topTeamsList.innerHTML = '<div class="empty-state">Nenhum voto registrado ainda.</div>';
    return;
  }

  topTeamsList.innerHTML = topTeams.map((team, idx) => {
    const votersHTML = team.voters.map(voter => `
      <span class="voter-tag">${escapeHTML(voter)}</span>
    `).join('');

    return `
      <div class="top-team-item" onclick="toggleVotersDropdown(this)">
        <div class="top-team-header">
          <div class="rank-badge rank-${idx + 1}">${idx + 1}</div>
          <img src="https://flagcdn.com/w80/${team.flag}.png" alt="${team.name}" class="top-team-flag" onerror="this.src='https://flagcdn.com/w80/un.png'">
          <div class="top-team-name">${team.name}</div>
          <div class="top-team-votes">${team.votes} ${team.votes === 1 ? 'voto' : 'votos'}</div>
          <i data-lucide="chevron-down" class="dropdown-icon"></i>
        </div>
        <div class="voters-dropdown">
          <div class="voters-list">
            ${votersHTML}
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Recriar ícones Lucide nos dropdowns
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

// Alternar a visualização dos votantes
window.toggleVotersDropdown = function(element) {
  element.classList.toggle("active");
};

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
      if (VOTING_CLOSED) {
        showToast("A votação está encerrada! Não é possível votar.", "warning");
        return;
      }
      document.querySelectorAll(".team-card").forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      
      selectedTeam = {
        name: card.dataset.name,
        flag: card.dataset.flag
      };
      
      // Manter instrução visível e adicionar seleção abaixo
      selectedTeamDisplay.innerHTML = `
        <div style="font-size: 0.95rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px;">
          <i data-lucide="info" style="width:16px; height:16px; display:inline-block; vertical-align:middle; margin-right:4px;"></i> Após clicar na sua seleção, digite abaixo o seu nome e sobrenome e confirme seu voto.
        </div>
        <div style="display:flex; align-items:center; gap:8px; margin-top:4px;">
          <img src="https://flagcdn.com/w80/${selectedTeam.flag}.png" style="width:24px; height:18px; border-radius:2px; object-fit:cover; border:1px solid rgba(255,255,255,0.1)">
          Torcendo para: <strong style="color:var(--primary); margin-left:4px;">${selectedTeam.name}</strong>
        </div>
      `;
      if (typeof lucide !== 'undefined') lucide.createIcons();

      // Verificar estado do botão com base nos campos de nome/sobrenome
      if (window._checkVoteButtonState) {
        window._checkVoteButtonState();
      } else {
        // Fallback: só habilita se ambos os campos estiverem preenchidos
        const firstName = voterFirstNameInput ? voterFirstNameInput.value.trim() : '';
        const lastName = voterLastNameInput ? voterLastNameInput.value.trim() : '';
        btnVote.disabled = !(firstName && lastName);
      }
    });
  });
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

    try {
      localStorage.setItem("supabase_url", urlVal);
      localStorage.setItem("supabase_anon_key", keyVal);
    } catch (e) {
      console.warn("Não foi possível salvar chaves no localStorage:", e);
    }

    SUPABASE_URL = urlVal;
    SUPABASE_ANON_KEY = keyVal;

    modal.classList.remove("open");

    // Reinicializar conexão
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
