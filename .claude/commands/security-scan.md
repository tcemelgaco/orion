Execute uma análise de segurança completa nas mudanças atuais ou no módulo especificado.

## Checklist de Segurança

### OWASP Top 10
- [ ] A01 — Broken Access Control: endpoints protegidos por roles corretas?
- [ ] A02 — Cryptographic Failures: dados sensíveis criptografados em repouso e trânsito?
- [ ] A03 — Injection: SQL dinâmico? JPQL parametrizado? XSS no frontend?
- [ ] A04 — Insecure Design: dados pessoais minimizados?
- [ ] A05 — Security Misconfiguration: perfis de produção seguros?
- [ ] A07 — Auth Failures: tokens expiram? Logout limpa sessão?
- [ ] A09 — Logging Failures: dados sensíveis no log?

### LGPD (Lei 13.709/2018)
- [ ] Dados pessoais identificados e documentados?
- [ ] Base legal definida para cada dado coletado?
- [ ] Dados sensíveis (saúde, origem racial, etc.) com tratamento especial?
- [ ] Retenção de dados definida?
- [ ] Dados pessoais logados? (não deve ocorrer)
- [ ] Consentimento registrado quando necessário?

### Spring Security
- [ ] CORS configurado explicitamente (não `*` em produção)?
- [ ] CSRF configurado ou desabilitado com justificativa?
- [ ] Actuator endpoints protegidos?
- [ ] JWT com expiração adequada?
- [ ] Senhas com BCryptPasswordEncoder?

### API OpenAI
- [ ] Chaves de API em variáveis de ambiente (nunca no código)?
- [ ] Rate limiting implementado?
- [ ] Dados pessoais removidos dos prompts enviados à OpenAI?
- [ ] Resposta da IA validada antes de persistir?

### Frontend
- [ ] Sem secrets no bundle JS?
- [ ] CSP headers configurados?
- [ ] Inputs sanitizados antes de renderizar HTML?
- [ ] Tokens armazenados em httpOnly cookies (não localStorage)?

## Formato do Relatório

```markdown
## Relatório de Segurança — [módulo] — [data]

### Críticos (bloqueiam deploy)
- [vulnerabilidade]: [arquivo:linha] — [como corrigir]

### Altos (corrigir antes de PR)
- [item]: [descrição]

### Médios (corrigir na próxima sprint)
- [item]: [descrição]

### LGPD
- Dados pessoais encontrados: [lista]
- Conformidade: SIM / PARCIAL / NÃO
- Ações necessárias: [lista]

### Veredito
SEGURO / REQUER CORREÇÕES / BLOQUEADO
```
