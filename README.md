# 🏆 Aplicativo Monitor de Torcida - Copa do Mundo 2026

Este é um projeto simples e pronto para ser publicado de forma totalmente gratuita usando o **GitHub Pages** e alimentado em tempo real usando a nuvem do **Supabase**.

## 🚀 Como colocar seu app no ar (Passo a Passo)

### Passo 1: Configurar o Supabase (Banco de dados)
1. Acesse [supabase.com](https://supabase.com) e crie uma conta gratuita.
2. Crie um novo projeto chamado `BolaoCopa2026`.
3. No menu esquerdo, acesse **SQL Editor**, clique em **New Query**, cole todo o conteúdo presente no arquivo `setup.sql` deste pacote e clique em **Run**.
4. Acesse **Project Settings** (Ícone de engrenagem) > **API** e copie os valores de:
   * `Project URL`
   * `anon public`

### Passo 2: Ajustar as Credenciais no arquivo HTML
1. Abra o arquivo `index.html`.
2. Vá até a linha **113 e 114** (dentro da tag `<script>`).
3. Substitua o link fictício e a chave anon pelos valores reais do seu painel copiados no passo anterior. Salve o arquivo.

### Passo 3: Publicar no GitHub
1. Crie um repositório no seu GitHub (ex: `bolao-copa-2026`).
2. Suba o arquivo `index.html` para a raiz desse repositório.
3. No painel do seu repositório no GitHub, vá em **Settings** > **Pages**.
4. Em *Build and deployment*, mude a Source para **Deploy from a branch**.
5. Em *Branch*, selecione `main` (ou `master`) e `/root` e clique em **Save**.
6. Pronto! O GitHub vai gerar o link público da sua aplicação em menos de 2 minutos.

## 🛠️ Tecnologias Utilizadas
* HTML5 / CSS3 Avançado
* JavaScript (Vanilla ES6)
* **Supabase** (Database Cloud em Tempo Real)
* **Chart.js** (Gráficos dinâmicos de percentual)
