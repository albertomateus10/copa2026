# 🏆 Aplicativo Monitor de Torcida - Copa do Mundo 2026

Este é um aplicativo moderno e interativo de monitoramento de torcida em tempo real para a Copa do Mundo de 2026. O projeto foi estruturado de forma limpa e profissional para que você possa publicá-lo de forma totalmente gratuita usando o **GitHub Pages**, alimentando os votos dos torcedores em tempo real usando a nuvem do **Supabase**.

---

## 🚀 Como colocar seu app no ar (Passo a Passo)

### Passo 1: Executar o Script no Supabase
1. Acesse o painel do seu projeto no Supabase: `https://supabase.com` e abra o projeto com ID **`wceamvewvirhqsobvpkg`**.
2. No menu lateral esquerdo, clique em **SQL Editor** (ícone `SQL`).
3. Clique em **New Query** (Nova Consulta).
4. Abra o arquivo `setup.sql` localizado na pasta raiz deste projeto, copie todo o seu conteúdo, cole no editor do Supabase e clique no botão **Run** (Executar).
   * *Este script criará a tabela `votos`, habilitará o Row Level Security (RLS) para permitir que qualquer pessoa vote de forma pública e ativará as atualizações Realtime para sincronizar o ranking instantaneamente.*

### Passo 2: Ajustar a Anon Key no Código
1. No painel do seu projeto Supabase, acesse **Project Settings** (ícone de engrenagem no canto inferior esquerdo) > **API**.
2. Copie o valor da sua **`anon` `public` key** (uma chave longa que começa com `eyJ...`).
3. Abra o arquivo [app.js](file:///c:/Users/alber/OneDrive/Área de Trabalho/copa/app.js) na sua máquina.
4. Na **linha 83**, insira a sua chave anônima na variável:
   ```javascript
   let SUPABASE_ANON_KEY = "SUA_CHAVE_ANON_AQUI";
   ```
5. Salve o arquivo [app.js](file:///c:/Users/alber/OneDrive/Área de Trabalho/copa/app.js).

*Dica: Se você abrir a página local [index.html](file:///c:/Users/alber/OneDrive/Área de Trabalho/copa/index.html) e não quiser editar o código diretamente, você também pode clicar no ícone de engrenagem ⚙️ flutuante no canto inferior direito para colar a chave e salvar diretamente no navegador para testes rápidos.*

### Passo 3: Enviar os arquivos para o GitHub
Para hospedar o app no GitHub Pages no seu repositório `https://github.com/albertomateus10/copa2026`, execute os seguintes comandos no terminal Git na pasta do seu projeto:

```bash
# Inicializar o repositório local (caso ainda não tenha feito)
git init

# Adicionar todos os arquivos
git add .

# Criar o commit inicial
git commit -m "feat: configuracao do supabase e interface interativa do monitor de torcida"

# Adicionar o repositório remoto oficial
git remote add origin https://github.com/albertomateus10/copa2026.git

# Renomear branch para main
git branch -M main

# Enviar os arquivos
git push -u origin main
```

### Passo 4: Ativar o GitHub Pages
1. Acesse o seu repositório no navegador: `https://github.com/albertomateus10/copa2026`.
2. Vá na aba **Settings** (Configurações) no menu superior.
3. No menu lateral esquerdo, clique em **Pages**.
4. Em *Build and deployment*, certifique-se de que a Source está definida como **Deploy from a branch**.
5. Na seção *Branch*, selecione **`main`** e a pasta **`/ (root)`**. Clique em **Save**.
6. Aguarde cerca de 1 a 2 minutos. O GitHub gerará um link público parecido com: `https://albertomateus10.github.io/copa2026/`.
7. Compartilhe o link com seus amigos para que todos votem pelo celular!

---

## 🛠️ Tecnologias Utilizadas
* **HTML5** estruturado de forma semântica e acessível.
* **CSS3 Avançado** com Dark Mode, Glassmorphism, layout fluido 100% responsivo para celulares e animações suaves de expansão.
* **JavaScript (Vanilla ES6)** com escuta de canal Supabase Realtime para carregamento imediato das estatísticas de votos.
* **Supabase** (Banco de dados Postgres na nuvem com escuta a eventos INSERT em tempo real).
* **Lucide Icons** (Ícones em SVG modernos e leves).
* **Flagpedia / Flagcdn** (API externa para carregar as bandeiras dos países do mundial de 2026).
