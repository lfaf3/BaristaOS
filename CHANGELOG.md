# Changelog

Todas as mudanças relevantes do BaristaOS são registradas neste arquivo.

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
