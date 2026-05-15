# 🛒 ListaSync

Sistema inteligente de listas de compras colaborativas desenvolvido com:

- Next.js 16
- React
- TypeScript
- TailwindCSS
- Supabase
- Realtime
- Storage
- Row Level Security (RLS)

---

# ✨ Funcionalidades

## 🔐 Autenticação

- Login
- Cadastro
- Logout
- Sessão persistente

---

## 📋 Listas de Compras

- Criar listas
- Excluir listas
- Compartilhar listas
- Atualização em tempo real
- Controle de orçamento

---

## 🏠 Modo Casa

Planejamento da compra:

- adicionar itens
- definir quantidade
- organizar lista antes da compra

---

## 🛒 Modo Mercado

Durante a compra:

- marcar itens comprados
- adicionar preço real da gôndola
- acompanhar orçamento em tempo real
- cálculo automático do total

---

## 👥 Compartilhamento

- Compartilhar listas por email
- Múltiplos usuários na mesma lista
- Sincronização realtime

---

## 🏪 Supermercados

- Cadastro de mercados
- Associação do mercado à lista
- Base preparada para comparação de preços

---

## 👤 Perfil do Usuário

- Nome personalizado
- Upload de avatar
- Armazenamento no Supabase Storage

---

# 🔒 Segurança

## Upload Seguro de Imagens

O sistema aceita apenas:

- JPG
- PNG
- WEBP

Proteções implementadas:

- validação MIME type
- limite de tamanho
- UUID aleatório
- isolamento por usuário
- bloqueio de SVG
- proteção contra overwrite

---

## Banco de Dados Seguro

Utilizamos:

- Row Level Security (RLS)
- Policies por usuário
- Controle de acesso por owner
- Policies para compartilhamento

---

# ⚡ Realtime

O sistema usa Supabase Realtime para:

- sincronizar listas
- atualizar itens instantaneamente
- refletir alterações entre usuários

---

# 🧠 Tecnologias

## Frontend

- Next.js
- React
- TypeScript
- TailwindCSS
- Lucide Icons

## Backend

- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Storage
- Supabase Realtime

---

# 📁 Estrutura

```bash
src/
├── app/
│   ├── dashboard/
│   ├── lists/
│   ├── login/
│   ├── profile/
│   └── supermarkets/
│
├── components/
│   └── AppLayout.tsx
│
├── lib/
│   └── supabase/
│
└── types/
```

##🗄️ Banco de Dados

# O projeto utiliza:

shopping_lists
items
list_members
profiles
supermarkets

Com RLS habilitado.

📌 Roadmap
Futuras funcionalidades
 - OCR de nota fiscal
 - Scanner de código de barras
 - Comparador de mercados
 - IA para economia
 - Histórico de compras
 - PWA instalável
 - Notificações realtime
 - Analytics inteligentes

#📱 Responsividade

## Interface otimizada para:

- Desktop
- Tablet
- Mobile
##🧑‍💻 Autor

- Desenvolvido por Luiz Henrique Pereira Caldas 🚀
