Execute a suíte de testes e analise os resultados.

## Backend (Spring Boot / Java)

1. Execute `mvn test` (ou `./gradlew test`)
2. Se houver falhas, mostre o stack trace e identifique a causa raiz
3. Verifique cobertura com JaCoCo (meta mínima: 80% para lógica de negócio)
4. Identifique classes sem cobertura adequada

## Frontend (React + TypeScript)

1. Execute `npm run test` (Vitest)
2. Se houver falhas, mostre o erro e identifique a causa raiz
3. Verifique se componentes novos têm testes

## Relatório de Resultado

```markdown
## Resultado dos Testes — [data]

### Backend
- Total: X testes | Passou: X | Falhou: X | Pulou: X
- Cobertura: X% (meta: 80%)

### Frontend
- Total: X testes | Passou: X | Falhou: X

### Falhas Críticas
- [arquivo:linha] — [descrição do erro]

### Gaps de Cobertura
- [classe/componente] — [o que falta testar]

### Próximos Passos
- [ ] [ação]
```

Se os testes passarem, confirme que está seguro para criar o PR.
