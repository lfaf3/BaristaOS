# BaristaOS — Sprint v3.4.1 — Entrega 06

## Objetivo

Finalizar a infraestrutura de pagamentos da v3.4.1, mantendo o Mock funcional e deixando contratos explícitos para TEF físico e para o futuro fluxo fiscal da v3.5.0.

## Conteúdo do PATCH

### Configurações de pagamentos

- Nova tela **Configurações → Pagamentos**.
- Provedores listados: Mock, SiTef e PayGo; apenas Mock selecionável nesta versão.
- `PaymentSettings` com `provider`, `timeout`, `retryAttempts`, `autoConfirm` e `logTransactions`.
- Persistência local no frontend (`localStorage`) e store em memória preparado no backend.
- Timeouts permitidos: 30, 60 e 120 segundos, copiados para cada sessão ao ser criada.

### Sessões, falhas e auditoria

- Timeout aplicado à autorização sem acoplar o Caixa ao adaptador.
- Estados visuais completos para timeout, falha, cancelamento e erro de comunicação.
- Mensagens orientadas ao operador para recuperação da operação.
- Registro de cada sessão encerrada com data, hora, sessão, operadora, valor, status e duração.
- Consulta dos logs na tela de configurações; retenção local das 500 entradas mais recentes.
- Sequência das sessões Mock persistida localmente para impedir colisões de identificador após recarregar a aplicação.

### Contratos de integração

- `PaymentProvider` documentado quanto a normalização, callbacks assíncronos, idempotência e responsabilidade pela sessão.
- Portas `FiscalIntegration`/`FiscalIntegrationService` reservadas para:
  1. emissão da NFC-e após confirmação do pagamento;
  2. armazenamento do XML;
  3. impressão do DANFE NFC-e;
  4. cancelamento da NFC-e quando aplicável.
- O ponto de orquestração fiscal está indicado no fechamento da venda, sem ativar emissão fiscal nesta sprint.

## Aplicação

Extraia o ZIP na raiz do projeto homologado da Entrega 05, preservando a estrutura de pastas e substituindo os arquivos coincidentes.

## Homologação sugerida

1. Acessar **Configurações → Pagamentos** e salvar cada timeout permitido.
2. Confirmar que SiTef e PayGo aparecem como indisponíveis e que Mock permanece funcional.
3. Finalizar uma venda e conferir sessão, linha do tempo e registro no log.
4. Usar `configureFailure()` no Mock para validar `DECLINED`, `CANCELLED`, `TIMEOUT` e `COMMUNICATION_LOST`.
5. Ativar/desativar confirmação automática e log de transações.

## Observação

Conforme solicitado, nenhum build foi executado durante a preparação deste PATCH.
