Prepare e crie um Pull Request para as mudanças atuais.

1. Execute `git log main..HEAD --oneline` para ver os commits da branch
2. Execute `git diff main...HEAD --stat` para ver o sumário das mudanças
3. Verifique se todos os testes passam (`mvn test` e `npm run test`)
4. Identifique o módulo AILER afetado
5. Proponha título e descrição do PR no formato abaixo
6. Aguarde confirmação antes de criar o PR

## Formato do PR

```markdown
## Resumo
- [bullet 1: o que foi feito]
- [bullet 2: por que foi feito]
- [bullet 3: impacto esperado]

## Módulo AILER Afetado
- Módulo X — [nome do módulo]

## Tipo de Mudança
- [ ] Nova feature
- [ ] Bug fix
- [ ] Refatoração
- [ ] Documentação
- [ ] Infra/DevOps

## Checklist
- [ ] Testes escritos e passando
- [ ] Sem credenciais/secrets no código
- [ ] LGPD verificado (se dados pessoais envolvidos)
- [ ] Acessibilidade verificada (se alteração de UI)
- [ ] Migration Flyway adicionada (se alteração de banco)
- [ ] OpenAPI/Swagger atualizado (se alteração de API)
```

NUNCA faça push direto para `main`.
