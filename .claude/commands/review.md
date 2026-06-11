Realize uma code review completa dos arquivos modificados. Para cada arquivo:

1. **Correctness**: O código faz o que deveria fazer?
2. **Security**: Há vulnerabilidades (OWASP Top 10, injection, XSS, SQL injection)?
3. **Performance**: Há operações custosas desnecessárias? N+1 queries? Chamadas síncronas à IA que poderiam ser assíncronas?
4. **LGPD**: O código manipula dados pessoais? Está protegido adequadamente?
5. **Maintainability**: O código é legível e bem estruturado?
6. **Test Coverage**: Há testes adequados (JUnit 5 para backend, Vitest para frontend)?
7. **Best Practices Spring Boot**: DTOs usados? `@Transactional` no lugar certo? Sem lógica no Controller?
8. **Best Practices React**: Componentes tipados? Sem `any`? Acessibilidade (aria-*)?

Formato da review:
## Review: [nome do arquivo]
### Pontos positivos
### Pontos de atenção
### Problemas críticos
### Sugestões de melhoria

Ao final, dê um veredito: **APROVADO** / **APROVADO COM RESSALVAS** / **REPROVADO**

Se houver problemas críticos de segurança ou LGPD, classifique automaticamente como REPROVADO.
