# Todo List App - Front-end

Aplicação web para gerenciamento de tarefas (To-Do List) com interface moderna e responsiva.

## Tecnologias Utilizadas

- **Angular**: Framework front-end para construção de aplicações SPA
- **TypeScript**: Linguagem de programação tipada
- **Bootstrap**: Framework CSS para design responsivo
- **Angular Material**: Componentes de UI seguindo o Material Design
- **RxJS**: Biblioteca para programação reativa

## Funcionalidades

- **Interface de usuário intuitiva**:
  - Tela de login e registro com validações
  - Dashboard com listagem de tarefas
  - Criação, edição e exclusão de tarefas
  - Marcação de tarefas como concluídas
  - Filtragem por status (pendente/concluída)

- **Design responsivo**:
  - Otimizado para desktops, tablets e smartphones
  - Layout adaptável a diferentes tamanhos de tela

- **Citações motivacionais**:
  - Exibição de citações motivacionais aleatórias

## Como Executar

### Pré-requisitos

- Node.js (v16+)
- npm ou yarn
- Angular CLI (v17)

### Passos para Execução

1. **Clone o repositório**

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Execute a aplicação**:
   ```bash
   ng serve
   ```

4. **Acesse a aplicação**:
   - Abra o navegador e acesse [http://localhost:4200](http://localhost:4200)
   - Nota: Certifique-se que o backend esteja rodando em http://localhost:3000

## Estrutura do Projeto

- `/src/app/components`: Componentes reutilizáveis da aplicação
- `/src/app/pages`: Páginas principais da aplicação
- `/src/app/services`: Serviços para comunicação com a API
- `/src/app/models`: Modelos de dados/interfaces
- `/src/app/guards`: Guards para proteção de rotas

## Integração com Backend

Esta aplicação se conecta com uma API RESTful construída em NestJS:
- Base URL: http://localhost:3000
- Endpoints principais:
  - `/auth`: Autenticação e registro
  - `/tasks`: Gerenciamento de tarefas
  - `/quotes`: Obtenção de citações motivacionais

## Observações para Avaliação

- Implementação de autenticação com JWT
- Gerenciamento de estado global
- Tratamento de erros e feedback ao usuário
- Validação de formulários
- Design responsivo
- Componentes reutilizáveis
- Padrão de arquitetura seguindo boas práticas Angular
