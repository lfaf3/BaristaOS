# BaristaOS v3.3.3

## Sprint — Identificação personalizada do atendimento

Esta versão permite informar uma identificação livre ao abrir um atendimento, sem limitar a operação ao número fixo exibido no mapa.

## Implementado

- Modal de identificação antes da abertura do atendimento.
- Campo opcional com limite de 30 caracteres.
- Sugestões rápidas: Mesa, Balcão, Delivery, iFood e Retirada.
- Validação de duplicidade sem diferenciar maiúsculas e minúsculas.
- Identificação exibida no mapa, na comanda, no histórico e na impressão.
- Registro permanente da identificação na comanda para preservar o histórico.
- Limpeza da identificação temporária quando o atendimento é cancelado ou a mesa é liberada.

## Banco de dados

Foi adicionada a coluna opcional `attendance_label` à tabela `orders`.

Execute no backend:

```bash
npm run db:generate
npm run db:migrate:deploy
```

## Roteiro de homologação

1. Clique em uma mesa livre.
2. Confirme que o modal de identificação é aberto.
3. Abra sem preencher o campo e confirme que o nome padrão da mesa foi usado automaticamente.
4. Abra outro atendimento com `Mesa 12` e confirme que a identificação aparece no mapa e na comanda.
5. Tente abrir um segundo atendimento com `mesa 12` e confirme a mensagem específica de duplicidade.
6. Finalize ou cancele o primeiro atendimento.
7. Confirme que `Mesa 12` pode ser reutilizada.
8. Finalize uma venda e confira a identificação no histórico e na impressão.


## Correção pós-homologação

- Ao deixar a identificação vazia, o backend usa `Mesa {número}` automaticamente.
- O frontend passou a interpretar tanto erros aninhados quanto o formato padrão do Fastify (`code` e `message` na raiz), exibindo corretamente a mensagem de identificação duplicada.
- Não há migration adicional nesta correção.
