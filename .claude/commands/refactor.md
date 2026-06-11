Refatore o código especificado aplicando boas práticas sem alterar comportamento externo.

## Processo

1. Leia e compreenda o código atual completamente
2. Identifique os problemas de qualidade:
   - Código duplicado (DRY)
   - Métodos longos (> 20 linhas)
   - Classes com muitas responsabilidades (SRP)
   - Nomes não descritivos
   - Magic numbers/strings
   - Complexidade ciclomática alta
3. Proponha o plano de refatoração
4. Aguarde confirmação antes de executar
5. Execute em pequenos passos verificáveis
6. Execute os testes após cada passo

## Regras

- NUNCA mude comportamento externo — apenas a estrutura interna
- SEMPRE execute os testes antes e depois
- Se não houver testes, proponha criar antes de refatorar
- Documente o que mudou e por quê no commit

## Específico para Spring Boot

- Extrair lógica de Service para classes de domínio especializadas
- Remover lógica de negócio de Controller
- Substituir `@Autowired` em campo por injeção por construtor
- Eliminar `FetchType.EAGER` desnecessário
- Criar DTOs específicos onde a entidade está sendo exposta diretamente

## Específico para React/TypeScript

- Extrair componentes grandes em componentes menores e focados
- Mover lógica de UI para custom hooks
- Substituir `any` por tipos específicos
- Eliminar prop drilling com Context ou estado global
- Memoizar com `useMemo`/`useCallback` apenas onde há problema de performance real

## Formato do Commit de Refatoração

```
refactor(módulo): [descrição clara do que mudou]

- Extrai [X] para [Y]
- Remove duplicação em [Z]
- Melhora legibilidade de [W]

Comportamento externo: inalterado
Testes: X passando (mesmos que antes)
```
