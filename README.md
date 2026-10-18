# Sistema de Voluntariado IFRS

Sistema monolítico para gerenciar **voluntários** e **eventos sociais** (doação de sangue, arrecadação de alimentos, mutirões ambientais).

- **Back-end:** Node.js + Express + MySQL (arquitetura em camadas, autenticação JWT)
- **Front-end:** React (Vite) + React Router
- **Documentação:** Swagger/OpenAPI (API) e JSDoc (código)
- **Qualidade:** ESLint + Prettier nos dois projetos e testes automatizados no back-end

## Estrutura

```
prova-p1/
├── backend/
│   ├── database/script.sql      # tabelas + dados fictícios
│   ├── src/
│   │   ├── config/              # conexão MySQL e Swagger
│   │   ├── models/              # operações no banco
│   │   ├── services/            # regras de negócio
│   │   ├── controllers/         # recebem a requisição e chamam o service
│   │   ├── routes/              # endpoints (+ anotações Swagger)
│   │   ├── middlewares/         # autenticação/autorização e tratamento de erros
│   │   └── utils/               # hash de senha, validações, HttpError
│   ├── scripts/api-check.js     # teste automático de todas as rotas (npm run test:api)
│   └── tests/                   # testes unitários
├── frontend/                    # aplicação React
├── tests.rest                   # exemplos de requisições (REST Client)
└── video.txt                    # link do vídeo explicativo
```

## Pré-requisitos

- Node.js 20 ou superior
- MySQL 8 em execução

## Instalação e execução

### 1. Banco de dados

```bash
cd backend
mysql -u root -p < database/script.sql
```

O script cria o banco `voluntariado`, as tabelas e os dados fictícios.

### 2. Back-end (porta 3000)

```bash
cd backend
cp .env.example .env     # edite DB_PASSWORD e JWT_SECRET
npm install
npm run dev              # ou: npm start
```

- API: http://localhost:3000
- Documentação Swagger: http://localhost:3000/docs

### 3. Front-end (porta 5173)

```bash
cd frontend
cp .env.example .env     # VITE_API_URL=http://localhost:3000
npm install
npm run dev
```

Acesse http://localhost:5173

## Usuários de teste

| E-mail            | Senha  | Perfil (role) | Pode fazer                                                      |
| ----------------- | ------ | ------------- | --------------------------------------------------------------- |
| admin@ifrs.edu.br | 123456 | admin         | tudo: criar, editar e excluir eventos e voluntários; cancelar inscrições |
| user@ifrs.edu.br  | 123456 | user          | consultar e inscrever voluntários em eventos                    |

Novos usuários podem ser criados em `/register` (sempre com perfil `user`). As senhas são guardadas com hash **scrypt** (módulo `crypto` nativo do Node, com salt aleatório).

## API

Todas as rotas, exceto `/auth/login` e `/auth/register`, exigem o header `Authorization: Bearer <token>`. O token JWT tem payload `{ email, role }` e expira em 1 hora.

| Método | Rota                                  | Acesso      | Descrição                                           |
| ------ | ------------------------------------- | ----------- | --------------------------------------------------- |
| POST   | `/auth/login`                         | público     | Autentica e devolve o token JWT                     |
| POST   | `/auth/register`                      | público     | Cadastra usuário comum                              |
| GET    | `/dashboard`                          | autenticado | Resumo com totais de eventos e voluntários          |
| GET    | `/events`                             | autenticado | Lista eventos (com o total de inscritos)            |
| GET    | `/events/:id`                         | autenticado | Busca um evento                                     |
| POST   | `/events`                             | **admin**   | Cria evento                                         |
| PUT    | `/events/:id`                         | **admin**   | Atualiza evento                                     |
| DELETE | `/events/:id`                         | **admin**   | Exclui evento                                       |
| GET    | `/events/:id/volunteers`              | autenticado | Lista os voluntários inscritos no evento            |
| POST   | `/events/:id/volunteers`              | autenticado | Inscreve voluntário (respeita `max_volunteers`)     |
| DELETE | `/events/:id/volunteers/:volunteerId` | **admin**   | Cancela a inscrição                                 |
| GET    | `/volunteers`                         | autenticado | Lista voluntários                                   |
| GET    | `/volunteers/:id`                     | autenticado | Busca um voluntário                                 |
| POST   | `/volunteers`                         | **admin**   | Cria voluntário                                     |
| PUT    | `/volunteers/:id`                     | **admin**   | Atualiza voluntário                                 |
| DELETE | `/volunteers/:id`                     | **admin**   | Exclui voluntário                                   |

Códigos de erro: `400` dados inválidos · `401` sem token/credenciais inválidas · `403` sem permissão · `404` não encontrado · `409` conflito (e-mail repetido, evento lotado, voluntário já inscrito).

Todos os endpoints estão documentados no Swagger (`/docs`) e há exemplos prontos em [`tests.rest`](./tests.rest) (extensão **REST Client** do VS Code).

## Regras de negócio (camada Service)

- Cada evento tem um limite de vagas (`max_volunteers`). Ao inscrever um voluntário, o service confere o total de inscritos e responde `409 Evento lotado` quando o limite é atingido.
- Um voluntário não pode se inscrever duas vezes no mesmo evento.
- Não é possível reduzir o limite de vagas abaixo do total de inscritos.
- Validação de dados: título e local obrigatórios, data real no formato `AAAA-MM-DD`, vagas inteiras maiores que zero, e-mails válidos, ids numéricos.

## Qualidade de código

Em `backend/` e em `frontend/`:

```bash
npm run lint      # ESLint
npm run format    # Prettier
```

Testes automatizados do back-end (não precisam de MySQL):

```bash
cd backend
npm test
```

Cobrem hash de senha, validadores, login/cadastro com JWT, middlewares de autenticação/autorização e as regras de negócio de eventos.

### Teste automático de todas as rotas

Com o MySQL populado e o back-end rodando (`npm run dev`), em outro terminal:

```bash
cd backend
npm run test:api
```

O script `backend/scripts/api-check.js` chama todas as rotas (GET, POST, PUT e DELETE), confere o status esperado de cada uma (sucesso, 400, 401, 403, 404 e 409, incluindo a regra de evento lotado), mostra ✅/❌ e termina com o resumo. Os dados criados são removidos no final, então ele pode ser repetido. Para outro endereço: `API_URL=http://host:porta npm run test:api`.

## Pontos de atenção

- O token JWT é guardado no `localStorage` do navegador e enviado no header `Authorization: Bearer`, conforme o enunciado. Uma alternativa mais restritiva seria cookie `httpOnly`.
- Os testes automatizados são unitários (models simulados); não há testes de integração HTTP com o banco.
- A checagem de vagas não é transacional: duas inscrições simultâneas na última vaga poderiam passar ao mesmo tempo.
