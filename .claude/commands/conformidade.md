# /conformidade — Verificar Conformidade e Qualidade (Módulo 12)

Use este comando para verificar conformidade de artefatos ou código com LGPD, segurança e acessibilidade.

## Modo: Verificar Artefato (requisitos, US, canvas)

Analise o documento fornecido e verifique:

### Segurança
- [ ] Requisitos de perfis de acesso definidos?
- [ ] Auditoria de ações críticas especificada?
- [ ] Segregação de funções considerada?
- [ ] Autenticação e autorização explicitadas?

### LGPD (Lei 13.709/2018)
- [ ] Dados pessoais identificados? (nome, CPF, e-mail, cargo...)
- [ ] Dados sensíveis identificados? (saúde, biometria, opiniões políticas...)
- [ ] Base legal para cada dado coletado definida?
  - Cumprimento de obrigação legal
  - Execução de políticas públicas
  - Legítimo interesse
- [ ] Prazo de retenção especificado?
- [ ] Titular pode solicitar exclusão? Portabilidade?
- [ ] DPO/encarregado notificado sobre novos dados?

### Acessibilidade (WCAG 2.1 AA)
- [ ] Requisitos de contraste de cores mencionados?
- [ ] Navegação por teclado especificada?
- [ ] Textos alternativos para imagens?
- [ ] Formulários com labels associados?
- [ ] Mensagens de erro descritivas?
- [ ] Compatibilidade com leitores de tela?

### Qualidade dos Requisitos
- [ ] Ambiguidades identificadas e corrigidas?
- [ ] Duplicidades eliminadas?
- [ ] Conflitos resolvidos?
- [ ] Requisitos mensuráveis (não apenas "deve ser bom")?
- [ ] Rastreabilidade presente?

## Modo: Verificar Código

Analise os arquivos modificados e verifique:

### LGPD no Código
- [ ] Dados pessoais logados? (CPF, e-mail, nome em logs = violação)
- [ ] Dados pessoais armazenados criptografados?
- [ ] Dados pessoais incluídos em prompts da OpenAI? (risco de exposição)
- [ ] Consentimento registrado antes de processar dados sensíveis?

### Acessibilidade no Frontend
- [ ] `alt` em todas as `<img>`?
- [ ] `aria-label` em botões sem texto visível?
- [ ] `role` correto em componentes customizados?
- [ ] Focus management em modais/drawers?
- [ ] Contraste de cores testado?

## Formato do Relatório

```markdown
## Relatório de Conformidade — [artefato/módulo] — [data]

### LGPD
**Status:** CONFORME / REQUER ATENÇÃO / NÃO CONFORME
- Dados pessoais encontrados: [lista]
- Dados sensíveis encontrados: [lista]
- Bases legais: [descrição]
- Problemas: [lista]
- Ações necessárias: [lista]

### Segurança
**Status:** CONFORME / REQUER ATENÇÃO / NÃO CONFORME
- Problemas: [lista]
- Ações necessárias: [lista]

### Acessibilidade
**Status:** CONFORME / REQUER ATENÇÃO / NÃO CONFORME
- Problemas: [lista]
- Critérios WCAG 2.1 AA afetados: [lista]

### Qualidade dos Artefatos
**Status:** CONFORME / REQUER ATENÇÃO / NÃO CONFORME
- Ambiguidades: [lista]
- Duplicidades: [lista]
- Conflitos: [lista]

### Veredito Geral
APROVADO / APROVADO COM RESSALVAS / REPROVADO

**Próximas ações obrigatórias:**
1. [ação]
```
