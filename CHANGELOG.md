# v3.3.6.1

## Fixed

- Corrigida a ausência de rolagem vertical no Dashboard em telas desktop.
- Ajustado o comportamento responsivo da área principal.

# Changelog

## [3.3.5] - 2026-07-29

### Adicionado
- Módulo de configurações da empresa com dados cadastrais, endereço, contatos, identidade, impressão e sistema.
- Upload de logomarca e personalização do nome exibido.
- Personalização do comprovante com dados e preferências da loja.
- Endpoint autenticado `GET/PUT /api/v1/company`.

### Alterado
- Identidade da barra lateral e comprovante passam a consumir as configurações da empresa.
- Versão exibida atualizada para v3.3.5.

## v3.3.4

### Added

- Sistema global de notificações com toasts de sucesso, informação, atenção e erro.
- Pesquisa rápida no mapa por número da mesa ou identificação personalizada.
- Contador de resultados e estado vazio para pesquisas sem correspondência.

### Changed

- Operações principais da comanda agora exibem confirmação visual padronizada.
- Botões mantêm estado de carregamento e permanecem bloqueados durante requisições.
- Mensagens conhecidas do backend são traduzidas para textos operacionais mais claros.
- Identificação visual da versão atualizada para v3.3.4.

### Fixed

- Redução do risco de ações duplicadas durante abertura, edição, pagamento e liberação de mesas.

### Banco de dados

- Nenhuma migration necessária.

## v3.3.3

### Added

- Identificação personalizada na abertura do atendimento.
- Sugestões rápidas de identificação.
- Validação de identificadores duplicados em atendimentos ativos.
- Snapshot da identificação na comanda para histórico e impressão.

### Changed

- Mesas liberadas ou canceladas removem a identificação temporária.
- Campo de identificação passou a ser opcional; quando vazio, o sistema usa automaticamente o nome padrão da mesa.

### Fixed

- Tratamento de erros compatível com a resposta padrão do Fastify, exibindo a mensagem específica de duplicidade.

Todas as mudanças relevantes do BaristaOS são registradas neste arquivo.

## [3.3.2] - 2026-07-28

### Adicionado
- Cancelamento seguro de atendimento vazio com motivo obrigatório.
- Auditoria do cancelamento com operador, data/hora e justificativa.
- Endpoint `PATCH /api/v1/tables/:id/order/cancel`.

### Alterado
- Mesa cancelada retorna automaticamente ao status `FREE`.
- Comanda cancelada recebe status `CANCELLED` sem afetar vendas ou faturamento.

### Banco de dados
- Migration para os campos `cancelled_at`, `cancelled_by_id` e `cancellation_reason` em pedidos.

## [3.3.1] - 2026-07-27

### Corrigido
- Pré-visualização de impressão em branco no histórico de comandas.
- Impressão cortada pela altura do modal e barra de rolagem aparecendo no PDF.
- Documento de impressão agora é renderizado em uma área independente, sem `overflow` ou limite de altura.

### Adicionado
- Print Engine com modal de pré-visualização, cupom reutilizável e CSS para bobina de 80 mm.
- Renderização isolada por portal para imprimir somente o cupom.

## [3.2.8]

### Adicionado
- Liberação definitiva de mesa após pagamento concluído.
- Endpoint `PATCH /api/v1/tables/:id/release`.
- Auditoria e limpeza técnica do repositório.

### Corrigido
- Declaração TypeScript duplicada na tela de comanda.
- Validação de `READY_TO_CLOSE` nos status aceitos pelo backend.

### Removido
- Arquivos compilados, duplicados e artefatos sem uso comprovado.

## [3.2.7]
- Pagamentos em dinheiro, PIX, crédito, débito, cortesia preparada e pagamento misto.
- Histórico de pagamentos e estado `READY_TO_CLOSE`.

## [3.2.6]
- Fechamento de conta, taxa de serviço, desconto e estado `PAYMENT`.

## [3.2.5]
- Consulte `RELEASE-3.2.5.md`.

## [3.2.4]
- Consulte `RELEASE-3.2.4.md`.

## v3.2.9

- Adicionado histórico de comandas encerradas.
- Incluídos filtros por período e número da mesa.
- Adicionado detalhamento de itens, pagamentos, desconto e taxa de serviço.
- Menu lateral atualizado com navegação para Pedidos.

## [3.3.0] - 2026-07-27

### Adicionado
- Dashboard gerencial com indicadores diários.
- Comparação de faturamento e pedidos com o dia anterior.
- Destaques de produto, pagamento e mesa.
- Resumo operacional das mesas.
- Impressão de comandas encerradas em formato de bobina de 80 mm.
- Endpoint `GET /api/v1/dashboard/summary`.

### Alterado
- Menu lateral atualizado com acesso ao Dashboard.
- Identificação visual da versão atualizada para v3.3.0.

### Banco de dados
- Nenhuma migration necessária.

### Fixed — v3.3.2 homologação 1

- Corrigido erro `OPEN_ORDER_NOT_FOUND` ao cancelar uma mesa aberta sem adicionar produtos.
- Preservado o registro de auditoria para atendimentos vazios cancelados.

## [3.3.5.1] - 2026-07-29

### Corrigido
- Cor principal configurada passou a controlar as variáveis visuais usadas em toda a interface.
- Adicionada geração automática da tonalidade escura usada no hover dos componentes primários.


## [3.3.5.2] - 2026-07-29

### Adicionado
- Presets de tema Espresso e Espresso Dark na configuração de identidade.
- Opção de cor personalizada mantida.

### Alterado
- Espresso (`#3F2C27`) definido como padrão visual para novas configurações e fallback do sistema.
- Versão exibida no menu lateral atualizada para v3.3.5.2.

### Banco de dados
- Nenhuma migration necessária.

## [3.3.6] - 2026-07-29

### Adicionado
- Dashboard inteligente com gráfico de vendas dos últimos sete dias.
- Meta diária e barra de progresso.
- Top 10 de produtos por quantidade e faturamento.
- Indicadores operacionais e gráfico de situação das mesas.
- Alertas de mesas demoradas e pedidos sem movimentação.
- Feed de atividades recentes.
- Atualização automática a cada 60 segundos e skeletons de carregamento.

### Alterado
- Endpoint de resumo do dashboard ampliado com dados gerenciais e operacionais.
- Versão exibida no menu lateral atualizada para v3.3.6.

### Banco de dados
- Nenhuma migration necessária.

# v3.3.7

## Added
- Gestão de estoque fase 1.
- Cadastro de insumos e unidades de medida.
- Entradas, saídas e ajustes.
- Histórico e auditoria de movimentações.
- Alertas de estoque mínimo.
- Indicadores e busca de estoque.

# v3.3.7.1

## Fixed
- Altura e rolagem independentes para a tabela de itens e para a auditoria do estoque.
- Correção da sobreposição visual causada pelo crescimento do histórico de movimentações.
- Margens, espaçamento e exibição das labels no modal de novo item.
- Rolagem interna e responsividade dos modais de estoque.

## Database
- Nenhuma migration necessária.
