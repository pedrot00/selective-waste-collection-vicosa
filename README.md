# ♻️ Coleta Seletiva | Plataforma Web para Gestão e Orientação de Reciclagem

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

O **Coleta Seletiva — Viçosa** é um protótipo funcional desenvolvido para facilitar o acesso da população às informações e serviços de reciclagem no município de Viçosa (MG). O projeto foi concebido com foco em **Interação Humano-Computador (IHC)** e **acessibilidade digital**, oferecendo fluxos completos de navegação e gestão para três perfis de usuário: **Morador ou Estudante**, **Comerciante** e **Associação de Catadores**.

> **Protótipo Front-end:** esta versão concentra-se na experiência do usuário, usabilidade e acessibilidade diretamente no navegador, utilizando armazenamento local (`localStorage`) para persistir preferências de interface e simular interações, agendamentos e registros em tempo real.

---
Link para versão online: https://selective-waste-collection-vicosa.vercel.app/pages/morador/

## ⚙️ Funcionalidades por perfil

### ♿ Recursos globais de acessibilidade
- **Ampliação de fonte:** ajuste global do tamanho dos textos em toda a plataforma.
- **Modo para daltonismo:** paleta alternativa de cores para facilitar a diferenciação visual.
- **Leitura em voz alta:** narração de textos selecionados via Web Speech API (`speechSynthesis`).

### 🏠 Área do Morador ou Estudante
- **Calendário de coleta:** consulta dos dias e horários da coleta seletiva por bairro.
- **Catálogo de recicláveis:** busca interativa com orientações de separação e preparo dos materiais.
- **Central de dúvidas:** envio de perguntas por texto, imagem ou áudio sobre o descarte correto.
- **Avisos e notificações:** ativação de alertas e acompanhamento de comunicados da coleta.

### 🏪 Área do Comerciante
- **Agendamento de coleta:** solicitação de datas para retirada planejada de materiais recicláveis no estabelecimento.
- **Coleta extraordinária:** pedido de recolhimento adicional em casos de acúmulo de resíduos.
- **Pontos de Entrega Voluntária (PEVs):** consulta dos locais disponíveis em Viçosa e confirmação de descarte via código do ponto.

### 🚛 Área da Associação
- **Solicitações de coleta:** busca, filtragem e gerenciamento de pedidos enviados pelos comerciantes.
- **Coletas realizadas:** consulta do histórico e registro de novos recolhimentos efetuados por bairro.
- **Calendário e bairros:** cadastro e organização dos dias e horários da coleta seletiva no município.
- **Indicadores de desempenho:** painel com métricas e resultados da coleta nos bairros atendidos.

---

## 🛠️ Tecnologias utilizadas

- **HTML5:** estruturação semântica e atributos ARIA para leitores de tela.
- **CSS3:** layout responsivo, variáveis CSS para temas e adaptação visual.
- **JavaScript (Vanilla):** gerenciamento de estado local, filtros, validações de formulários, feedback via *toasts* e recursos de acessibilidade.

---

## 🗂️ Estrutura do projeto

```text
coleta-seletiva-vicosa/
├── assets/
│   ├── icons/
│   └── images/
├── css/
│   └── style.css                  # Estilos globais, temas e responsividade
├── js/
│   ├── acessibilidade.js          # Controle de fonte, daltonismo e leitura em voz alta
│   └── app.js                     # Lógica de navegação, formulários e simulações
├── pages/
│   ├── acesso/
│   │   ├── cadastro.html
│   │   └── login.html
│   ├── associacao/
│   │   ├── calendario.html
│   │   ├── coletas.html
│   │   ├── indicadores.html
│   │   ├── inicio.html
│   │   └── solicitacoes.html
│   ├── comerciante/
│   │   ├── agendamento.html
│   │   ├── coleta-extra.html
│   │   ├── inicio.html
│   │   └── pevs.html
│   └── morador/
│       ├── avisos.html
│       ├── calendario.html
│       ├── catalogo.html
│       ├── duvidas.html
│       └── inicio.html
└── index.html                     # Página inicial e seleção de perfil
