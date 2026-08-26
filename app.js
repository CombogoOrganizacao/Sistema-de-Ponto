import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  addDoc,
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

// ==========================================
// CONFIGURAÇÃO DO FIREBASE
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyD3Tjefzcy-YxOr3c8YJ91HhH8AO3r1LuY",
  authDomain: "combogoponto.firebaseapp.com",
  projectId: "combogoponto",
  storageBucket: "combogoponto.firebasestorage.app",
  messagingSenderId: "20657185811",
  appId: "1:20657185811:web:21b6111d7a29b370a20be6",
  measurementId: "G-BJZKEBN9FH"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// E-mail Master de Administrador
const ADMIN_EMAIL = "combogounicap@gmail.com";

// ==========================================
// ESTADOS DA APLICAÇÃO
// ==========================================
let currentUserData = null;
let currentUserProfile = null;
let isCadastro = false;
let unsubscribePontos = null;
let unsubscribeUsers = null;
let allPontosData = [];
let allUsersData = [];

// ==========================================
// ELEMENTOS DO DOM
// ==========================================
const loadingContainer = document.getElementById("loading-container");
const authSection = document.getElementById("auth-section");
const dashboardSection = document.getElementById("dashboard-section");
const userHeader = document.getElementById("user-header");
const headerUserName = document.getElementById("header-user-name");
const headerUserBadge = document.getElementById("header-user-badge");
const btnLogout = document.getElementById("btn-logout");
const authForm = document.getElementById("auth-form");
const authTitle = document.getElementById("auth-title");
const btnAuthSubmit = document.getElementById("btn-auth-submit");
const btnToggleAuth = document.getElementById("btn-toggle-auth");
const nomeGroup = document.getElementById("nome-group");
const inputNome = document.getElementById("input-nome");
const inputEmail = document.getElementById("input-email");
const inputSenha = document.getElementById("input-senha");
const inputCurso = document.getElementById("input-curso");
const btnGoogleLogin = document.getElementById("btn-google-login");
const authError = document.getElementById("auth-error");
const authErrorMsg = document.getElementById("auth-error-msg");
const pontosTbody = document.getElementById("pontos-tbody");
const emptyState = document.getElementById("empty-state");
const tableWrapper = document.getElementById("table-wrapper");
const pontosCount = document.getElementById("pontos-count");
const filterDate = document.getElementById("filter-date");
const btnClearFilter = document.getElementById("btn-clear-filter");
const tabNavPontos = document.getElementById("tab-nav-pontos");
const tabNavAdmin = document.getElementById("tab-nav-admin");
const viewPontosSection = document.getElementById("view-pontos-section");
const viewAdminSection = document.getElementById("view-admin-section");
const adminUsersTbody = document.getElementById("admin-users-tbody");
const statTotalUsers = document.getElementById("stat-total-users");
const statPointsToday = document.getElementById("stat-points-today");
const statTotalHoursAll = document.getElementById("stat-total-hours-all");
const userTotalHours = document.getElementById("user-total-hours");
const cardUserCurso = document.getElementById("card-user-curso");
const cardUserHorario = document.getElementById("card-user-horario");

// Modal de Curso
const cursoModal = document.getElementById("curso-modal");
const modalSelectCurso = document.getElementById("modal-select-curso");
const btnConfirmarCurso = document.getElementById("btn-confirmar-curso");
const cursoModalError = document.getElementById("curso-modal-error");

// PWA & Toast Elements
const pwaToast = document.getElementById("pwa-toast");
const btnOpenInstallGuide = document.getElementById("btn-open-install-guide");
const btnDismissPwa = document.getElementById("btn-dismiss-pwa");
const btnCloseToast = document.getElementById("btn-close-toast");
const installModal = document.getElementById("install-modal");
const btnCloseModal = document.getElementById("btn-close-modal");
const btnModalOk = document.getElementById("btn-modal-ok");
const tabIos = document.getElementById("tab-ios");
const tabAndroid = document.getElementById("tab-android");
const contentIos = document.getElementById("content-ios");
const contentAndroid = document.getElementById("content-android");

// Bater Ponto & Geofence Elements
const btnBaterEntrada = document.getElementById("btn-bater-entrada");
const btnBaterSaida = document.getElementById("btn-bater-saida");
const pontoStatusMsg = document.getElementById("ponto-status-msg");
const geoStatusDot = document.getElementById("geo-status-dot");
const geoStatusText = document.getElementById("geo-status-text");
const btnRefreshLocation = document.getElementById("btn-refresh-location");
let currentGeoPosition = null;

function renderIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// ==========================================
// TOAST PWA (Instalação no Celular)
// ==========================================
function setupPWAToast() {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  const isDismissed = localStorage.getItem('combogo_pwa_dismissed');

  if (!isStandalone && !isDismissed) {
    setTimeout(() => {
      pwaToast.classList.remove('hidden');
      renderIcons();
    }, 1500);
  }

  function dismissToast() {
    pwaToast.classList.add('hidden');
    localStorage.setItem('combogo_pwa_dismissed', 'true');
  }

  btnDismissPwa?.addEventListener('click', dismissToast);
  btnCloseToast?.addEventListener('click', dismissToast);

  btnOpenInstallGuide?.addEventListener('click', () => {
    installModal.classList.remove('hidden');
    renderIcons();
  });

  btnCloseModal?.addEventListener('click', () => installModal.classList.add('hidden'));
  btnModalOk?.addEventListener('click', () => installModal.classList.add('hidden'));

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  if (isIOS) showTabIOS();
  else showTabAndroid();

  tabIos?.addEventListener('click', showTabIOS);
  tabAndroid?.addEventListener('click', showTabAndroid);
}

function showTabIOS() {
  tabIos.className = "flex-1 py-2 text-xs font-semibold rounded-lg bg-orange-500 text-white transition flex items-center justify-center gap-2";
  tabAndroid.className = "flex-1 py-2 text-xs font-semibold rounded-lg text-gray-400 hover:text-white transition flex items-center justify-center gap-2";
  contentIos.classList.remove('hidden');
  contentAndroid.classList.add('hidden');
  renderIcons();
}

function showTabAndroid() {
  tabAndroid.className = "flex-1 py-2 text-xs font-semibold rounded-lg bg-orange-500 text-white transition flex items-center justify-center gap-2";
  tabIos.className = "flex-1 py-2 text-xs font-semibold rounded-lg text-gray-400 hover:text-white transition flex items-center justify-center gap-2";
  contentAndroid.classList.remove('hidden');
  contentIos.classList.add('hidden');
  renderIcons();
}

setupPWAToast();

// ==========================================
// AUTH UTILS & FORM
// ==========================================
function showError(msg) {
  if (!msg) {
    authError.classList.add("hidden");
    authErrorMsg.textContent = "";
  } else {
    authErrorMsg.textContent = msg;
    authError.classList.remove("hidden");
  }
  renderIcons();
}

function toggleAuthMode() {
  isCadastro = !isCadastro;
  showError("");
  if (isCadastro) {
    authTitle.textContent = "Criar Conta";
    btnAuthSubmit.innerHTML = `<i data-lucide="user-plus" class="w-4 h-4"></i><span>Cadastrar</span>`;
    btnToggleAuth.textContent = "Já possui conta? Faça login";
    nomeGroup.classList.remove("hidden");
    inputNome.required = true;
    inputCurso.required = true;
  } else {
    authTitle.textContent = "Acessar Painel";
    btnAuthSubmit.innerHTML = `<i data-lucide="log-in" class="w-4 h-4"></i><span>Entrar</span>`;
    btnToggleAuth.textContent = "Novo por aqui? Crie uma conta";
    nomeGroup.classList.add("hidden");
    inputNome.required = false;
    inputCurso.required = false;
  }
  renderIcons();
}

btnToggleAuth.addEventListener("click", toggleAuthMode);

// Modal de Confirmação de Curso (Login Google ou 1º acesso)
btnConfirmarCurso.addEventListener("click", async () => {
  const selectedCurso = modalSelectCurso.value;
  if (!selectedCurso) {
    cursoModalError.textContent = "Por favor, selecione seu curso.";
    cursoModalError.classList.remove("hidden");
    return;
  }
  cursoModalError.classList.add("hidden");
  btnConfirmarCurso.disabled = true;

  try {
    if (!currentUserData) return;
    const userDocRef = doc(db, "usuarios", currentUserData.uid);
    await updateDoc(userDocRef, { curso: selectedCurso });
    currentUserProfile.curso = selectedCurso;
    cursoModal.classList.add("hidden");
    updateHeaderUI();
  } catch (err) {
    cursoModalError.textContent = "Erro ao salvar curso: " + err.message;
    cursoModalError.classList.remove("hidden");
  } finally {
    btnConfirmarCurso.disabled = false;
  }
});

// Submissão do Formulário de Login / Cadastro
authForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  showError("");
  const email = inputEmail.value.trim().toLowerCase();
  const senha = inputSenha.value;
  const nome = inputNome.value.trim();
  const curso = inputCurso.value;

  try {
    if (isCadastro) {
      if (!nome) {
        showError("Informe seu nome completo.");
        return;
      }
      if (!curso) {
        showError("Por favor, selecione seu curso / graduação.");
        return;
      }
      const res = await createUserWithEmailAndPassword(auth, email, senha);
      const initialRole = (email === ADMIN_EMAIL) ? "admin" : "aluno";
      
      await setDoc(doc(db, "usuarios", res.user.uid), {
        uid: res.user.uid,
        nome: nome,
        email: res.user.email,
        cargo: initialRole,
        curso: curso,
        criadoEm: serverTimestamp()
      });
    } else {
      await signInWithEmailAndPassword(auth, email, senha);
    }
  } catch (err) {
    showError(err.message || "Erro na autenticação.");
  }
});

// Login com Google
btnGoogleLogin.addEventListener("click", async () => {
  showError("");
  try {
    const provider = new GoogleAuthProvider();
    const res = await signInWithPopup(auth, provider);
    const email = (res.user.email || "").toLowerCase();
    
    const userDocRef = doc(db, "usuarios", res.user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      const initialRole = (email === ADMIN_EMAIL) ? "admin" : "aluno";
      await setDoc(userDocRef, {
        uid: res.user.uid,
        nome: res.user.displayName || "Usuário Google",
        email: res.user.email,
        cargo: initialRole,
        curso: "",
        criadoEm: serverTimestamp()
      });
    } else if (email === ADMIN_EMAIL && userDoc.data().cargo !== "admin") {
      await updateDoc(userDocRef, { cargo: "admin" });
    }
  } catch (err) {
    showError(err.message || "Erro ao entrar com o Google.");
  }
});

// Logout
btnLogout.addEventListener("click", async () => {
  await signOut(auth);
});

// Navegação entre Abas
tabNavPontos.addEventListener("click", () => {
  tabNavPontos.className = "px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-orange-500 text-white transition flex items-center gap-2";
  tabNavAdmin.className = "px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gray-900 text-gray-400 hover:text-white border border-gray-800 transition flex items-center gap-2";
  viewPontosSection.classList.remove("hidden");
  viewAdminSection.classList.add("hidden");
  renderIcons();
});

tabNavAdmin.addEventListener("click", () => {
  tabNavAdmin.className = "px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-orange-500 text-white transition flex items-center gap-2";
  tabNavPontos.className = "px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gray-900 text-gray-400 hover:text-white border border-gray-800 transition flex items-center gap-2";
  viewAdminSection.classList.remove("hidden");
  viewPontosSection.classList.add("hidden");
  renderIcons();
});

// ==========================================
// GEOFENCE CONFIGURAÇÕES (UNICAP & MUSEU)
// ==========================================
const GEOFENCE_LOCATIONS = [
  {
    name: "Campus UNICAP (Rua do Príncipe)",
    lat: -8.0548955,
    lng: -34.8877622,
    radiusMeters: 450
  },
  {
    name: "Museu de Arqueologia da UNICAP",
    lat: -8.056223,
    lng: -34.888640,
    radiusMeters: 250
  }
];

function calcularDistanciaMetros(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function checarGeofence(userLat, userLng) {
  for (const loc of GEOFENCE_LOCATIONS) {
    const distancia = calcularDistanciaMetros(userLat, userLng, loc.lat, loc.lng);
    if (distancia <= loc.radiusMeters) {
      return { dentro: true, localNome: loc.name, distancia: Math.round(distancia) };
    }
  }
  const dist1 = Math.round(calcularDistanciaMetros(userLat, userLng, GEOFENCE_LOCATIONS[0].lat, GEOFENCE_LOCATIONS[0].lng));
  return { dentro: false, distancia: dist1 };
}

function obterLocalizacaoAtual() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocalização não suportada pelo seu navegador/aparelho."));
      return;
    }

    geoStatusDot.className = "w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse";
    geoStatusText.textContent = "Obtendo sinal do GPS...";

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const geoCheck = checarGeofence(latitude, longitude);
        currentGeoPosition = { latitude, longitude, accuracy, ...geoCheck };

        if (geoCheck.dentro) {
          geoStatusDot.className = "w-2.5 h-2.5 rounded-full bg-emerald-500";
          geoStatusText.innerHTML = `<strong class="text-emerald-400">Dentro do perímetro permitido:</strong> ${geoCheck.localNome} (~${geoCheck.distancia}m)`;
        } else {
          geoStatusDot.className = "w-2.5 h-2.5 rounded-full bg-rose-500";
          geoStatusText.innerHTML = `<strong class="text-rose-400">Fora do perímetro:</strong> Você está a ~${geoCheck.distancia}m da UNICAP (Necessário estar no Campus ou Museu)`;
        }
        resolve(currentGeoPosition);
      },
      (err) => {
        geoStatusDot.className = "w-2.5 h-2.5 rounded-full bg-rose-500";
        let msg = "Permissão de localização negada ou GPS inativo.";
        if (err.code === err.TIMEOUT) msg = "Tempo esgotado ao buscar GPS.";
        geoStatusText.innerHTML = `<strong class="text-rose-400">GPS Indisponível:</strong> ${msg}`;
        reject(new Error(msg));
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  });
}

btnRefreshLocation.addEventListener("click", () => {
  obterLocalizacaoAtual().catch(() => {});
});

// ==========================================
// REGRAS DE HORÁRIO E TOLERÂNCIA (±20 min)
// ==========================================
function validarHorarioPonto(tipo, curso, isAdmin) {
  if (isAdmin) return { valido: true };

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  if (tipo === "entrada") {
    const minEntrada = 13 * 60 + 40; // 13:40
    const maxEntrada = 14 * 60 + 20; // 14:20

    if (currentMinutes < minEntrada || currentMinutes > maxEntrada) {
      const agoraStr = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      return {
        valido: false,
        motivo: `Horário de Entrada não permitido (${agoraStr}). O ponto deve ser registrado entre 13:40 e 14:20 (tolerância de 20 min para as 14h).`
      };
    }
    return { valido: true };
  }

  if (tipo === "saida") {
    const isJogos = (curso || "").toLowerCase().includes("jogos");
    
    if (isJogos) {
      const minSaidaJogos = 15 * 60 + 40; // 15:40
      const maxSaidaJogos = 16 * 60 + 20; // 16:20

      if (currentMinutes < minSaidaJogos || currentMinutes > maxSaidaJogos) {
        const agoraStr = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
        return {
          valido: false,
          motivo: `Horário de Saída para Jogos Digitais não permitido (${agoraStr}). O ponto deve ser registrado entre 15:40 e 16:20 (tolerância de 20 min para as 16h).`
        };
      }
    } else {
      const minSaidaGeral = 16 * 60 + 40; // 16:40
      const maxSaidaGeral = 17 * 60 + 20; // 17:20

      if (currentMinutes < minSaidaGeral || currentMinutes > maxSaidaGeral) {
        const agoraStr = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
        return {
          valido: false,
          motivo: `Horário de Saída não permitido (${agoraStr}). O ponto deve ser registrado entre 16:40 e 17:20 (tolerância de 20 min para as 17h).`
        };
      }
    }

    return { valido: true };
  }

  return { valido: true };
}

// Bater Ponto
function showPontoStatus(text, isError = false) {
  pontoStatusMsg.textContent = text;
  pontoStatusMsg.className = `text-xs font-medium px-3 py-1.5 rounded-xl ${
    isError 
      ? "bg-red-500/10 text-red-400 border border-red-500/20" 
      : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
  }`;
  pontoStatusMsg.classList.remove("hidden");
  setTimeout(() => {
    pontoStatusMsg.classList.add("hidden");
  }, 6000);
}

async function registrarPontoWeb(tipo) {
  if (!currentUserData || !currentUserProfile) {
    showPontoStatus("Você precisa estar logado.", true);
    return;
  }

  const curso = currentUserProfile.curso || "";
  const isAdmin = currentUserProfile.cargo === "admin";

  const validacaoHorario = validarHorarioPonto(tipo, curso, isAdmin);
  if (!validacaoHorario.valido) {
    showPontoStatus(validacaoHorario.motivo, true);
    return;
  }

  btnBaterEntrada.disabled = true;
  btnBaterSaida.disabled = true;
  showPontoStatus("Validando sua localização por GPS...");

  try {
    const geo = await obterLocalizacaoAtual();

    if (!geo.dentro) {
      showPontoStatus(`Ponto Bloqueado: Você precisa estar no campus da UNICAP ou no Museu da UNICAP (Distância atual: ~${geo.distancia}m).`, true);
      return;
    }

    await addDoc(collection(db, "pontos"), {
      usuarioId: currentUserData.uid,
      usuarioNome: currentUserProfile.nome || currentUserData.displayName || "Colaborador",
      usuarioEmail: currentUserData.email || "",
      usuarioCurso: curso || "Não especificado",
      tipo: tipo,
      localizacao: `${geo.localNome} (GPS Validado)`,
      coordenadas: {
        latitude: geo.latitude,
        longitude: geo.longitude,
        precisao: geo.accuracy
      },
      registro: serverTimestamp(),
      criadoEm: serverTimestamp()
    });

    showPontoStatus(`Ponto de ${tipo.toUpperCase()} registrado com sucesso no ${geo.localNome}!`);
  } catch (err) {
    console.error("Erro ao registrar ponto:", err);
    showPontoStatus(err.message || "Erro ao verificar localização GPS.", true);
  } finally {
    btnBaterEntrada.disabled = false;
    btnBaterSaida.disabled = false;
  }
}

btnBaterEntrada.addEventListener("click", () => registrarPontoWeb("entrada"));
btnBaterSaida.addEventListener("click", () => registrarPontoWeb("saida"));

// ==========================================
// TABELA E HISTÓRICO DE PONTOS
// ==========================================
filterDate.addEventListener("input", renderPontosTable);
btnClearFilter.addEventListener("click", () => {
  filterDate.value = "";
  renderPontosTable();
});

onAuthStateChanged(auth, async (user) => {
  loadingContainer.classList.add("hidden");

  if (user) {
    currentUserData = user;
    authSection.classList.add("hidden");
    dashboardSection.classList.remove("hidden");
    userHeader.classList.remove("hidden");

    const email = (user.email || "").toLowerCase();
    const userDocRef = doc(db, "usuarios", user.uid);
    const userDoc = await getDoc(userDocRef);

    let cargo = (email === ADMIN_EMAIL) ? "admin" : "aluno";
    let nome = user.displayName || user.email;
    let curso = "";

    if (userDoc.exists()) {
      const data = userDoc.data();
      cargo = (email === ADMIN_EMAIL) ? "admin" : (data.cargo || "aluno");
      nome = data.nome || nome;
      curso = data.curso || "";
      
      if (email === ADMIN_EMAIL && data.cargo !== "admin") {
        await updateDoc(userDocRef, { cargo: "admin" });
      }
    } else {
      await setDoc(userDocRef, {
        uid: user.uid,
        nome: nome,
        email: user.email,
        cargo: cargo,
        curso: "",
        criadoEm: serverTimestamp()
      });
    }

    currentUserProfile = { uid: user.uid, nome, email, cargo, curso };
    updateHeaderUI();

    if (!curso && cargo !== "admin") {
      cursoModal.classList.remove("hidden");
      renderIcons();
    } else {
      cursoModal.classList.add("hidden");
    }

    listenPontos();
    if (cargo === "admin") {
      tabNavAdmin.classList.remove("hidden");
      listenAdminUsers();
    } else {
      tabNavAdmin.classList.add("hidden");
    }
  } else {
    currentUserData = null;
    currentUserProfile = null;
    if (unsubscribePontos) { unsubscribePontos(); unsubscribePontos = null; }
    if (unsubscribeUsers) { unsubscribeUsers(); unsubscribeUsers = null; }

    userHeader.classList.add("hidden");
    dashboardSection.classList.add("hidden");
    authSection.classList.remove("hidden");
    cursoModal.classList.add("hidden");
    pontosTbody.innerHTML = "";
  }
  renderIcons();
});

function updateHeaderUI() {
  if (!currentUserProfile) return;
  headerUserName.textContent = currentUserProfile.nome || currentUserProfile.email;
  
  const cargo = currentUserProfile.cargo || "aluno";
  const curso = currentUserProfile.curso || "Geral";
  headerUserBadge.textContent = `${cargo.toUpperCase()} • ${curso}`;

  if (cardUserCurso) {
    cardUserCurso.textContent = curso || "Não especificado";
  }

  if (cardUserHorario) {
    if (curso.toLowerCase().includes("jogos")) {
      cardUserHorario.textContent = "14:00 às 16:00 (±20 min)";
    } else {
      cardUserHorario.textContent = "14:00 às 17:00 (±20 min)";
    }
  }

  if (cargo === "admin") {
    headerUserBadge.className = "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20 uppercase tracking-wider";
  } else if (cargo === "colaborador") {
    headerUserBadge.className = "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider";
  } else {
    headerUserBadge.className = "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20 uppercase tracking-wider";
  }
}

function listenPontos() {
  if (unsubscribePontos) unsubscribePontos();

  const q = query(collection(db, "pontos"), orderBy("registro", "desc"));
  unsubscribePontos = onSnapshot(q, (snapshot) => {
    allPontosData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    renderPontosTable();
    calculateUserHours();
    if (currentUserProfile && currentUserProfile.cargo === "admin") {
      renderAdminStats();
      renderAdminUsersTable();
    }
  }, (err) => console.error("Erro ao carregar pontos:", err));
}

function renderPontosTable() {
  let filtered = [...allPontosData];
  const selectedDate = filterDate.value;

  if (selectedDate) {
    filtered = filtered.filter(p => {
      if (!p.registro) return false;
      const dateObj = p.registro.toDate ? p.registro.toDate() : new Date(p.registro);
      if (isNaN(dateObj.getTime())) return false;
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}` === selectedDate;
    });
  }

  pontosCount.textContent = `${filtered.length} registro${filtered.length === 1 ? '' : 's'}`;

  if (filtered.length === 0) {
    emptyState.classList.remove("hidden");
    tableWrapper.classList.add("hidden");
    return;
  }

  emptyState.classList.add("hidden");
  tableWrapper.classList.remove("hidden");
  pontosTbody.innerHTML = "";

  filtered.forEach((ponto) => {
    const tr = document.createElement("tr");
    tr.className = "hover:bg-gray-800/30 transition";

    let dataStr = "-";
    if (ponto.registro) {
      const dateObj = ponto.registro.toDate ? ponto.registro.toDate() : new Date(ponto.registro);
      if (!isNaN(dateObj.getTime())) {
        dataStr = dateObj.toLocaleString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        });
      }
    }

    const isEntrada = ponto.tipo === "entrada";
    const badgeClass = isEntrada 
      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
      : "bg-rose-500/10 text-rose-400 border border-rose-500/20";
    const badgeIcon = isEntrada ? "arrow-down-left" : "arrow-up-right";
    const badgeLabel = isEntrada ? "Entrada" : "Saída";

    const localizacao = typeof ponto.localizacao === "string" ? ponto.localizacao : "Local registrado";
    const nomeColab = ponto.usuarioNome || ponto.usuarioEmail || "Colaborador";

    tr.innerHTML = `
      <td class="px-4 py-3.5">
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${badgeClass}">
          <i data-lucide="${badgeIcon}" class="w-3.5 h-3.5"></i>
          ${badgeLabel}
        </span>
      </td>
      <td class="px-4 py-3.5 font-medium text-white">${nomeColab}</td>
      <td class="px-4 py-3.5 text-gray-400 flex items-center gap-1">
        <i data-lucide="map-pin" class="w-3.5 h-3.5 text-gray-500"></i>
        <span>${localizacao}</span>
      </td>
      <td class="px-4 py-3.5 font-mono text-xs text-gray-300">${dataStr}</td>
    `;

    pontosTbody.appendChild(tr);
  });

  renderIcons();
}

function calculateHoursForUser(userId) {
  const userPontos = allPontosData
    .filter(p => p.usuarioId === userId && p.registro)
    .map(p => ({
      tipo: p.tipo,
      date: p.registro.toDate ? p.registro.toDate() : new Date(p.registro)
    }))
    .filter(p => !isNaN(p.date.getTime()))
    .sort((a, b) => a.date - b.date);

  let totalMillis = 0;
  let lastEntrada = null;

  userPontos.forEach(p => {
    if (p.tipo === "entrada") {
      lastEntrada = p.date;
    } else if (p.tipo === "saida" && lastEntrada) {
      const diff = p.date - lastEntrada;
      if (diff > 0 && diff < 24 * 60 * 60 * 1000) {
        totalMillis += diff;
      }
      lastEntrada = null;
    }
  });

  const totalMinutes = Math.floor(totalMillis / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return { hours, minutes, totalMinutes, text: `${hours}h ${String(minutes).padStart(2, '0')}m` };
}

function calculateUserHours() {
  if (!currentUserData) return;
  const userStats = calculateHoursForUser(currentUserData.uid);
  userTotalHours.textContent = userStats.text;
}

// ==========================================
// PAINEL ADMINISTRATIVO
// ==========================================
function listenAdminUsers() {
  if (unsubscribeUsers) unsubscribeUsers();

  const q = query(collection(db, "usuarios"), orderBy("nome", "asc"));
  unsubscribeUsers = onSnapshot(q, (snapshot) => {
    allUsersData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    statTotalUsers.textContent = allUsersData.length;
    renderAdminStats();
    renderAdminUsersTable();
  });
}

function renderAdminStats() {
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCount = allPontosData.filter(p => {
    if (!p.registro) return false;
    const d = p.registro.toDate ? p.registro.toDate() : new Date(p.registro);
    return !isNaN(d.getTime()) && d.toISOString().split('T')[0] === todayStr;
  }).length;
  statPointsToday.textContent = todayCount;

  let totalAllMinutes = 0;
  allUsersData.forEach(u => {
    const stats = calculateHoursForUser(u.uid || u.id);
    totalAllMinutes += stats.totalMinutes;
  });
  const totalAllHours = Math.floor(totalAllMinutes / 60);
  statTotalHoursAll.textContent = `${totalAllHours}h`;
}

function renderAdminUsersTable() {
  adminUsersTbody.innerHTML = "";

  allUsersData.forEach(u => {
    const uid = u.uid || u.id;
    const email = (u.email || "").toLowerCase();
    const isMasterAdmin = (email === ADMIN_EMAIL);
    const stats = calculateHoursForUser(uid);

    const tr = document.createElement("tr");
    tr.className = "hover:bg-gray-800/30 transition";

    const currentRole = isMasterAdmin ? "admin" : (u.cargo || "aluno");
    
    let badgeColor = "bg-orange-500/10 text-orange-400 border-orange-500/20";
    if (currentRole === "admin") badgeColor = "bg-red-500/10 text-red-400 border-red-500/20";
    if (currentRole === "colaborador") badgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";

    tr.innerHTML = `
      <td class="px-4 py-3.5">
        <div class="font-medium text-white">${u.nome || 'Sem nome'}</div>
        <div class="text-xs text-gray-400">${u.email || '-'}</div>
        <div class="text-[11px] text-orange-400 font-medium mt-0.5">🎓 ${u.curso || 'Curso não definido'}</div>
      </td>
      <td class="px-4 py-3.5">
        <span class="font-mono text-xs font-semibold text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-lg border border-orange-500/20">
          ${stats.text}
        </span>
      </td>
      <td class="px-4 py-3.5">
        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${badgeColor} border">
          ${currentRole}
        </span>
      </td>
      <td class="px-4 py-3.5 text-right">
        ${isMasterAdmin ? `
          <span class="text-xs text-gray-500 italic">Admin Principal</span>
        ` : `
          <select
            data-user-id="${uid}"
            class="role-select px-3 py-1.5 bg-gray-950 border border-gray-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500 cursor-pointer"
          >
            <option value="aluno" ${currentRole === 'aluno' ? 'selected' : ''}>Aluno</option>
            <option value="colaborador" ${currentRole === 'colaborador' ? 'selected' : ''}>Colaborador</option>
            <option value="admin" ${currentRole === 'admin' ? 'selected' : ''}>Administrador</option>
          </select>
        `}
      </td>
    `;

    adminUsersTbody.appendChild(tr);
  });

  document.querySelectorAll(".role-select").forEach(select => {
    select.addEventListener("change", async (e) => {
      const targetUserId = e.target.getAttribute("data-user-id");
      const newRole = e.target.value;
      
      try {
        await updateDoc(doc(db, "usuarios", targetUserId), {
          cargo: newRole
        });
      } catch (err) {
        alert("Erro ao alterar cargo: " + err.message);
      }
    });
  });

  renderIcons();
}

renderIcons();
