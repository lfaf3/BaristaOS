# Changelog

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
