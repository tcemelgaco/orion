package br.gov.tce.ailer.modulo14.domain.enums;

public enum TipoAgente {

    ANALISTA_NEGOCIO("Analista de Negócio", "agente-analista-negocio.txt"),
    ANALISTA_REQUISITOS("Analista de Requisitos", "agente-analista-requisitos.txt"),
    PRODUCT_OWNER("Product Owner", "agente-product-owner.txt"),
    AGENTE_QA("Agente QA", "agente-qa.txt"),
    ARQUITETO("Arquiteto de Solução", "agente-arquiteto.txt"),
    AGENTE_GOVERNANCA("Agente de Governança", "agente-governanca.txt"),
    ESTIMADOR("Estimador de Esforço", "agente-estimador.txt");

    public final String displayName;
    public final String promptFile;

    TipoAgente(String displayName, String promptFile) {
        this.displayName = displayName;
        this.promptFile = promptFile;
    }
}
