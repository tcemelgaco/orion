import { describe, it, expect } from 'vitest'
import type { BuscaSemanticaResult, TipoDocumento } from '../types/conhecimento'
import type { TipoAgente } from '../types/agente'
import { AGENTES_CONFIG } from '../types/agente'

// ── Módulo 13 — tipos de conhecimento ───────────────────────────────────────

describe('BuscaSemanticaResult', () => {
  it('score deve estar no intervalo [0, 1]', () => {
    const result: BuscaSemanticaResult = {
      documento: {
        id: '1',
        titulo: 'Manual',
        conteudo: 'Texto',
        tipo: 'DOCUMENTO',
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
      },
      score: 0.92,
    }
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(1)
  })

  it('tipos de documento válidos devem ser aceitos', () => {
    const tipos: TipoDocumento[] = ['DOCUMENTO', 'ESPECIFICACAO', 'ATA', 'MANUAL', 'NORMA', 'OUTRO']
    expect(tipos).toHaveLength(6)
  })
})

// ── Módulo 14 — configuração dos agentes ────────────────────────────────────

describe('AGENTES_CONFIG', () => {
  it('deve conter configuração para todos os 7 tipos de agente', () => {
    const tipos: TipoAgente[] = [
      'ANALISTA_NEGOCIO',
      'ANALISTA_REQUISITOS',
      'PRODUCT_OWNER',
      'AGENTE_QA',
      'ARQUITETO',
      'AGENTE_GOVERNANCA',
      'ESTIMADOR',
    ]
    tipos.forEach(tipo => {
      expect(AGENTES_CONFIG).toHaveProperty(tipo)
      expect(AGENTES_CONFIG[tipo].label).toBeTruthy()
      expect(AGENTES_CONFIG[tipo].descricao).toBeTruthy()
    })
  })

  it('cada agente deve ter label e descricao não vazios', () => {
    Object.values(AGENTES_CONFIG).forEach(config => {
      expect(config.label.length).toBeGreaterThan(0)
      expect(config.descricao.length).toBeGreaterThan(0)
    })
  })
})
