# AGENTS.md

## Escopo
Este arquivo vale para todo o repositório.

## Objetivo do projeto
Construir o FreelaDash (Next.js + TypeScript + SQLite) com autenticação (Google e email/senha), dashboard protegido e seed de dados.

## Convenções
- Priorize App Router (`src/app`).
- Use português-BR em textos da interface.
- Formatação de moeda em BRL e datas no padrão brasileiro.
- Armazene valores monetários em centavos (`integer`) no banco.
- Sempre validar entrada em rotas de API.

## Comandos esperados
- `npm run dev`
- `npm run seed`

## Entrega
- Manter estrutura organizada em camadas: `lib`, `app`, `components`.
- Garantir middleware de proteção de rotas.
