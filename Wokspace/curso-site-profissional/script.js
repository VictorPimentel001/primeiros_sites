// ===== Utils de armazenamento =====
function getUsuarios() {
  try { return JSON.parse(localStorage.getItem('usuarios')) || []; } catch(e) { return []; }
}
function setUsuarios(list) { localStorage.setItem('usuarios', JSON.stringify(list)); }

function getUsuarioLogado() {
  try { return JSON.parse(localStorage.getItem('usuario')); } catch(e) { return null; }
}
function setUsuarioLogado(u) { localStorage.setItem('usuario', JSON.stringify(u)); }

// ===== Autenticação =====
function cadastrarUsuario() {
  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();

  if (!nome || !email || !senha) {
    alert("Preencha todos os campos!");
    return;
  }

  let usuarios = getUsuarios();

  if (usuarios.find(u => u.email === email)) {
    alert("Este email já está cadastrado!");
    return;
  }

  const novo = { nome, email, senha, cursos: {} };
  usuarios.push(novo);
  setUsuarios(usuarios);

  alert("Cadastro realizado com sucesso!");
  document.getElementById("nome").value = "";
  document.getElementById("email").value = "";
  document.getElementById("senha").value = "";
}

function login() {
  const email = document.getElementById('loginEmail').value.trim();
  const senha = document.getElementById('loginSenha').value.trim();

  if (!email || !senha) {
    alert("Preencha todos os campos!");
    return;
  }

  let usuarios = getUsuarios();
  const usuario = usuarios.find(u => u.email === email && u.senha === senha);

  if (usuario) {
    setUsuarioLogado(usuario);
    alert("Bem-vindo, " + usuario.nome + "!");
    window.location.href = 'perfil.html';
  } else {
    alert("Email ou senha inválidos.");
  }
}

function logout() {
  localStorage.removeItem('usuario');
  window.location.href = 'login.html';
}

// ===== Cursos =====
function ensureCurso(u, curso) {
  if (!u.cursos) u.cursos = {};
  if (!u.cursos[curso]) u.cursos[curso] = { inscrito: false, concluido: false, concluidoEm: null };
}

function inscreverCurso(curso) {
  let u = getUsuarioLogado();
  if (!u) return alert('Faça login para se inscrever.');
  ensureCurso(u, curso);
  if (!u.cursos[curso].inscrito) {
    u.cursos[curso].inscrito = true;
    setUsuarioLogado(u);

    let usuarios = getUsuarios().map(user => user.email === u.email ? u : user);
    setUsuarios(usuarios);

    alert(`Você se inscreveu em ${curso}!`);
  } else {
    alert('Você já está inscrito neste curso.');
  }
}

function concluirCurso(curso) {
  let u = getUsuarioLogado();
  if (!u) return alert('Faça login para concluir o curso.');
  ensureCurso(u, curso);
  u.cursos[curso].inscrito = true;
  u.cursos[curso].concluido = true;
  u.cursos[curso].concluidoEm = new Date().toISOString();
  setUsuarioLogado(u);

  let usuarios = getUsuarios().map(user => user.email === u.email ? u : user);
  setUsuarios(usuarios);

  alert(`Parabéns! Você concluiu ${curso}. Seu certificado está disponível no perfil.`);
}

// ===== Perfil render =====
function renderPerfil() {
  const u = getUsuarioLogado();
  const dadosEl = document.getElementById('dadosUsuario');
  const inscEl = document.getElementById('listaInscritos');
  const certEl = document.getElementById('listaCertificados');

  if (!u) {
    document.body.innerHTML = "<main class='container'><div class='panel'><h2>Você não está logado.</h2><a class='btn' href='login.html'>Fazer login</a></div></main>";
    return;
  }

  if (dadosEl) {
    dadosEl.innerHTML = `
      <p><strong>Nome:</strong> ${u.nome}</p>
      <p><strong>Email:</strong> ${u.email}</p>
    `;
  }

  const cursos = u.cursos || {};
  const nomes = Object.keys(cursos);
  inscEl && (inscEl.innerHTML = '');
  certEl && (certEl.innerHTML = '');

  const mapaCert = {
    'HTML': 'certificados/HTML.pdf',
    'CSS': 'certificados/CSS.pdf',
    'JavaScript': 'certificados/JavaScript.pdf'
  };

  // Cursos inscritos
  nomes.forEach(nome => {
    const c = cursos[nome];
    if (c.inscrito) {
      const li = document.createElement('li');
      li.innerHTML = `
        <div class="row">
          <span>${nome} ${c.concluido ? '— ✅ Concluído' : '— ⏳ Em andamento'}</span>
          <div class="actions">
            <a class="btn small" href="${linkDoCurso(nome)}">Acessar</a>
          </div>
        </div>
      `;
      inscEl && inscEl.appendChild(li);
    }
  });

  // Certificados (apenas concluídos)
  nomes.forEach(nome => {
    const c = cursos[nome];
    if (c.concluido) {
      const li = document.createElement('li');
      const href = mapaCert[nome];
      li.innerHTML = `
        <div class="row">
          <span>Certificado ${nome}</span>
          <div class="actions">
            <a class="btn small" href="${href}" download>Baixar</a>
          </div>
        </div>
      `;
      certEl && certEl.appendChild(li);
    }
  });
}

function linkDoCurso(nome) {
  switch (nome) {
    case 'HTML': return 'cursos/curso-html.html';
    case 'CSS': return 'cursos/curso-css.html';
    case 'JavaScript': return 'cursos/curso-js.html';
    default: return 'index.html';
  }
}
