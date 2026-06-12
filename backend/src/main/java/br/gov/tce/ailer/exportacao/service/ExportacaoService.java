package br.gov.tce.ailer.exportacao.service;

import br.gov.tce.ailer.modulo1.domain.Demanda;
import br.gov.tce.ailer.modulo1.repository.DemandaRepository;
import br.gov.tce.ailer.modulo3.domain.CanvasProjeto;
import br.gov.tce.ailer.modulo3.repository.CanvasProjetoRepository;
import br.gov.tce.ailer.modulo4.domain.Requisito;
import br.gov.tce.ailer.modulo4.domain.enums.TipoRequisito;
import br.gov.tce.ailer.modulo4.repository.RequisitoRepository;
import br.gov.tce.ailer.modulo5.domain.Epico;
import br.gov.tce.ailer.modulo5.repository.EpicoRepository;
import com.lowagie.text.Chunk;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.xwpf.usermodel.ParagraphAlignment;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFRun;
import org.apache.poi.xwpf.usermodel.XWPFTable;
import org.apache.poi.xwpf.usermodel.XWPFTableCell;
import org.apache.poi.xwpf.usermodel.XWPFTableRow;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTTblWidth;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.STTblWidth;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigInteger;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExportacaoService {

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final DemandaRepository demandaRepo;
    private final CanvasProjetoRepository canvasRepo;
    private final RequisitoRepository requisitoRepo;
    private final EpicoRepository epicoRepo;

    // ── DOCX ──────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public byte[] gerarDocx(UUID demandaId) {
        Demanda d             = findDemanda(demandaId);
        CanvasProjeto canvas  = canvasRepo.findByDemandaId(demandaId).orElse(null);
        List<Requisito> reqs  = requisitoRepo.findByDemandaIdOrderByTipoAscOrdemExibicaoAsc(demandaId);
        List<Epico> epicos    = epicoRepo.findByDemandaIdOrderByOrdemExibicaoAsc(demandaId);

        try (XWPFDocument doc = new XWPFDocument(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            docxCabecalho(doc, d);
            docxSecao(doc, "1. INFORMAÇÕES DA DEMANDA");
            docxInfoDemanda(doc, d);

            if (canvas != null) {
                docxSecao(doc, "2. CANVAS DO PROJETO");
                docxCanvas(doc, canvas);
            }

            if (!reqs.isEmpty()) {
                docxSecao(doc, "3. ESPECIFICAÇÃO DE REQUISITOS");
                for (TipoRequisito tipo : TipoRequisito.values()) {
                    List<Requisito> grupo = reqs.stream().filter(r -> r.getTipo() == tipo).toList();
                    if (!grupo.isEmpty()) {
                        docxSubSecao(doc, tipoLabel(tipo));
                        docxTabelaRequisitos(doc, grupo);
                    }
                }
            }

            if (!epicos.isEmpty()) {
                docxSecao(doc, "4. HISTÓRIAS DE USUÁRIO E BACKLOG");
                docxBacklog(doc, epicos);
            }

            doc.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            log.error("Erro ao gerar DOCX para demanda {}", demandaId, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Falha ao gerar DOCX");
        }
    }

    private void docxCabecalho(XWPFDocument doc, Demanda d) {
        XWPFParagraph inst = doc.createParagraph();
        inst.setAlignment(ParagraphAlignment.CENTER);
        XWPFRun rInst = inst.createRun();
        rInst.setText("TRIBUNAL DE CONTAS DO ESTADO DO CEARÁ — TCE-CE");
        rInst.setBold(true);
        rInst.setFontSize(11);
        rInst.setColor("0D1F3C");

        XWPFParagraph sub = doc.createParagraph();
        sub.setAlignment(ParagraphAlignment.CENTER);
        XWPFRun rSub = sub.createRun();
        rSub.setText("Diretoria de Desenvolvimento e Sustentação de Sistemas — D2S2");
        rSub.setFontSize(9);
        rSub.setColor("555555");

        doc.createParagraph(); // espaço

        XWPFParagraph title = doc.createParagraph();
        title.setStyle("Heading1");
        title.setAlignment(ParagraphAlignment.CENTER);
        XWPFRun rTitle = title.createRun();
        rTitle.setText(d.getTitulo());

        XWPFParagraph meta = doc.createParagraph();
        meta.setAlignment(ParagraphAlignment.CENTER);
        XWPFRun rMeta = meta.createRun();
        rMeta.setText("Área: " + d.getAreaDemandante() +
                "  |  Status: " + d.getStatus().name() +
                "  |  Gerado em: " + LocalDate.now().format(FMT));
        rMeta.setFontSize(9);
        rMeta.setColor("777777");

        doc.createParagraph();
    }

    private void docxSecao(XWPFDocument doc, String titulo) {
        doc.createParagraph();
        XWPFParagraph p = doc.createParagraph();
        p.setStyle("Heading1");
        p.createRun().setText(titulo);
    }

    private void docxSubSecao(XWPFDocument doc, String titulo) {
        XWPFParagraph p = doc.createParagraph();
        p.setStyle("Heading2");
        p.createRun().setText(titulo);
    }

    private void docxInfoDemanda(XWPFDocument doc, Demanda d) {
        String[][] rows = {
            {"Solicitante",    d.getNomeSolicitante() != null ? d.getNomeSolicitante() : d.getMatriculaSolicitante()},
            {"Área Demandante", d.getAreaDemandante()},
            {"Tipo",           d.getTipo().name()},
            {"Prioridade",     d.getPrioridade().name()},
            {"Prazo Estimado", d.getPrazoEstimado() != null ? d.getPrazoEstimado().format(FMT) : "—"},
            {"Descrição",      d.getDescricao() != null ? d.getDescricao() : "—"},
            {"Premissas",      d.getPremissas() != null ? d.getPremissas() : "—"},
            {"Restrições",     d.getRestricoes() != null ? d.getRestricoes() : "—"},
        };
        XWPFTable table = doc.createTable(rows.length, 2);
        setTableWidth(table);
        for (int i = 0; i < rows.length; i++) {
            XWPFTableRow row = table.getRow(i);
            cellBold(row.getCell(0), rows[i][0]);
            row.getCell(1).setText(rows[i][1]);
        }
    }

    private void docxCanvas(XWPFDocument doc, CanvasProjeto c) {
        String[][] rows = {
            {"Contexto",              c.getContexto()},
            {"Problema / Necessidade", c.getProblema()},
            {"Solução Proposta",      c.getSolucaoProposta()},
            {"Usuários / Stakeholders", c.getUsuarios()},
            {"Funcionalidades-Chave", c.getFuncionalidadesChave()},
            {"Integrações",           c.getIntegracoes()},
            {"Restrições",            c.getRestricoes()},
            {"Premissas",             c.getPremissas()},
            {"Riscos",                c.getRiscos()},
            {"Critérios de Sucesso",  c.getCriteriosSucesso()},
        };
        XWPFTable table = doc.createTable();
        setTableWidth(table);
        for (String[] row : rows) {
            if (row[1] == null || row[1].isBlank()) continue;
            XWPFTableRow tr = table.createRow();
            cellBold(tr.getCell(0), row[0]);
            tr.getCell(1).setText(row[1]);
        }
        if (table.getNumberOfRows() == 0) table.removeRow(0);
    }

    private void docxTabelaRequisitos(XWPFDocument doc, List<Requisito> reqs) {
        XWPFTable table = doc.createTable(1, 5);
        setTableWidth(table);
        String[] headers = {"Código", "Título", "Descrição", "Prioridade", "Status"};
        XWPFTableRow header = table.getRow(0);
        for (int i = 0; i < headers.length; i++) {
            cellBold(header.getCell(i), headers[i]);
        }
        for (Requisito r : reqs) {
            XWPFTableRow row = table.createRow();
            row.getCell(0).setText(r.getCodigo());
            row.getCell(1).setText(r.getTitulo());
            row.getCell(2).setText(r.getDescricao() != null ? r.getDescricao() : "");
            row.getCell(3).setText(r.getPrioridade().name());
            row.getCell(4).setText(r.getStatus().name());
        }
    }

    private void docxBacklog(XWPFDocument doc, List<Epico> epicos) {
        for (Epico e : epicos) {
            XWPFParagraph ep = doc.createParagraph();
            ep.setStyle("Heading2");
            ep.createRun().setText(e.getCodigo() + " — " + e.getTitulo());

            if (e.getDescricao() != null) {
                XWPFParagraph desc = doc.createParagraph();
                XWPFRun r = desc.createRun();
                r.setItalic(true);
                r.setFontSize(9);
                r.setColor("666666");
                r.setText(e.getDescricao());
            }

            e.getFeatures().forEach(feat -> {
                XWPFParagraph fp = doc.createParagraph();
                fp.setStyle("Heading3");
                fp.createRun().setText(feat.getCodigo() + " — " + feat.getTitulo());

                if (!feat.getHistorias().isEmpty()) {
                    XWPFTable table = doc.createTable(1, 4);
                    setTableWidth(table);
                    String[] headers = {"Código", "História de Usuário", "SP", "Prioridade"};
                    XWPFTableRow hRow = table.getRow(0);
                    for (int i = 0; i < headers.length; i++) cellBold(hRow.getCell(i), headers[i]);
                    feat.getHistorias().forEach(h -> {
                        XWPFTableRow row = table.createRow();
                        row.getCell(0).setText(h.getCodigo());
                        row.getCell(1).setText("Como " + h.getComoPapel() +
                                ", quero " + h.getQueroAcao() +
                                (h.getParaBeneficio() != null ? ", para " + h.getParaBeneficio() : ""));
                        row.getCell(2).setText(h.getStoryPoints() != null ? String.valueOf(h.getStoryPoints()) : "");
                        row.getCell(3).setText(h.getPrioridade().name());
                    });
                }
            });
        }
    }

    private void setTableWidth(XWPFTable table) {
        CTTblWidth width = table.getCTTbl().getTblPr().addNewTblW();
        width.setType(STTblWidth.PCT);
        width.setW(BigInteger.valueOf(5000));
    }

    private void cellBold(XWPFTableCell cell, String text) {
        cell.removeParagraph(0);
        XWPFParagraph p = cell.addParagraph();
        XWPFRun r = p.createRun();
        r.setBold(true);
        r.setText(text);
    }

    // ── PDF ───────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public byte[] gerarPdf(UUID demandaId) {
        Demanda d             = findDemanda(demandaId);
        CanvasProjeto canvas  = canvasRepo.findByDemandaId(demandaId).orElse(null);
        List<Requisito> reqs  = requisitoRepo.findByDemandaIdOrderByTipoAscOrdemExibicaoAsc(demandaId);
        List<Epico> epicos    = epicoRepo.findByDemandaIdOrderByOrdemExibicaoAsc(demandaId);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 50, 50, 60, 50);

        try {
            PdfWriter.getInstance(doc, out);
            doc.open();

            Font fontTitle   = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, new Color(13, 31, 60));
            Font fontH1      = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13, new Color(13, 31, 60));
            Font fontH2      = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, new Color(26, 52, 96));
            Font fontH3      = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, new Color(70, 90, 130));
            Font fontBody    = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.BLACK);
            Font fontBold    = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.BLACK);
            Font fontSmall   = FontFactory.getFont(FontFactory.HELVETICA, 8, new Color(100, 100, 100));
            Font fontHeader  = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, Color.WHITE);

            // Cabeçalho
            Paragraph inst = new Paragraph("TRIBUNAL DE CONTAS DO ESTADO DO CEARÁ — TCE-CE", fontTitle);
            inst.setAlignment(Element.ALIGN_CENTER);
            doc.add(inst);

            Paragraph sub = new Paragraph("Diretoria de Desenvolvimento e Sustentação de Sistemas — D2S2", fontSmall);
            sub.setAlignment(Element.ALIGN_CENTER);
            doc.add(sub);
            doc.add(Chunk.NEWLINE);

            Paragraph titleP = new Paragraph(d.getTitulo(), fontTitle);
            titleP.setAlignment(Element.ALIGN_CENTER);
            titleP.setSpacingBefore(8);
            doc.add(titleP);

            Paragraph metaP = new Paragraph(
                    "Área: " + d.getAreaDemandante() + "  |  Status: " + d.getStatus().name() +
                    "  |  Gerado em: " + LocalDate.now().format(FMT), fontSmall);
            metaP.setAlignment(Element.ALIGN_CENTER);
            doc.add(metaP);

            PdfPTable rule = new PdfPTable(1);
            rule.setWidthPercentage(100);
            rule.setSpacingBefore(6);
            rule.setSpacingAfter(6);
            PdfPCell ruleLine = new PdfPCell(new Phrase(" "));
            ruleLine.setBorderWidthBottom(1);
            ruleLine.setBorderColorBottom(new Color(13, 31, 60));
            ruleLine.setBorderWidthTop(0);
            ruleLine.setBorderWidthLeft(0);
            ruleLine.setBorderWidthRight(0);
            ruleLine.setPadding(0);
            rule.addCell(ruleLine);
            doc.add(rule);

            // 1. Informações da demanda
            doc.add(pdfH1("1. INFORMAÇÕES DA DEMANDA", fontH1));
            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.setWidths(new float[]{2f, 5f});
            pdfRow(infoTable, "Solicitante",
                    d.getNomeSolicitante() != null ? d.getNomeSolicitante() : d.getMatriculaSolicitante(),
                    fontBold, fontBody);
            pdfRow(infoTable, "Área Demandante", d.getAreaDemandante(), fontBold, fontBody);
            pdfRow(infoTable, "Tipo", d.getTipo().name(), fontBold, fontBody);
            pdfRow(infoTable, "Prioridade", d.getPrioridade().name(), fontBold, fontBody);
            pdfRow(infoTable, "Prazo Estimado",
                    d.getPrazoEstimado() != null ? d.getPrazoEstimado().format(FMT) : "—",
                    fontBold, fontBody);
            if (d.getDescricao() != null)
                pdfRow(infoTable, "Descrição", d.getDescricao(), fontBold, fontBody);
            if (d.getPremissas() != null)
                pdfRow(infoTable, "Premissas", d.getPremissas(), fontBold, fontBody);
            if (d.getRestricoes() != null)
                pdfRow(infoTable, "Restrições", d.getRestricoes(), fontBold, fontBody);
            doc.add(infoTable);

            // 2. Canvas
            if (canvas != null) {
                doc.add(Chunk.NEWLINE);
                doc.add(pdfH1("2. CANVAS DO PROJETO", fontH1));
                PdfPTable ct = new PdfPTable(2);
                ct.setWidthPercentage(100);
                ct.setWidths(new float[]{2.5f, 5f});
                pdfCanvasRow(ct, "Contexto",               canvas.getContexto(),            fontBold, fontBody);
                pdfCanvasRow(ct, "Problema / Necessidade", canvas.getProblema(),             fontBold, fontBody);
                pdfCanvasRow(ct, "Solução Proposta",       canvas.getSolucaoProposta(),      fontBold, fontBody);
                pdfCanvasRow(ct, "Usuários",               canvas.getUsuarios(),             fontBold, fontBody);
                pdfCanvasRow(ct, "Funcionalidades-Chave",  canvas.getFuncionalidadesChave(), fontBold, fontBody);
                pdfCanvasRow(ct, "Integrações",            canvas.getIntegracoes(),          fontBold, fontBody);
                pdfCanvasRow(ct, "Restrições",             canvas.getRestricoes(),           fontBold, fontBody);
                pdfCanvasRow(ct, "Premissas",              canvas.getPremissas(),            fontBold, fontBody);
                pdfCanvasRow(ct, "Riscos",                 canvas.getRiscos(),               fontBold, fontBody);
                pdfCanvasRow(ct, "Critérios de Sucesso",   canvas.getCriteriosSucesso(),     fontBold, fontBody);
                doc.add(ct);
            }

            // 3. Requisitos
            if (!reqs.isEmpty()) {
                doc.add(Chunk.NEWLINE);
                doc.add(pdfH1("3. ESPECIFICAÇÃO DE REQUISITOS", fontH1));
                for (TipoRequisito tipo : TipoRequisito.values()) {
                    List<Requisito> grupo = reqs.stream().filter(r -> r.getTipo() == tipo).toList();
                    if (grupo.isEmpty()) continue;
                    doc.add(pdfH2(tipoLabel(tipo), fontH2));
                    PdfPTable rt = new PdfPTable(5);
                    rt.setWidthPercentage(100);
                    rt.setWidths(new float[]{1.2f, 3f, 5f, 1.5f, 1.5f});
                    for (String h : new String[]{"Código", "Título", "Descrição", "Prioridade", "Status"})
                        rt.addCell(pdfHeaderCell(h, fontHeader));
                    for (Requisito r : grupo) {
                        rt.addCell(pdfCell(r.getCodigo(), fontBody));
                        rt.addCell(pdfCell(r.getTitulo(), fontBody));
                        rt.addCell(pdfCell(r.getDescricao() != null ? r.getDescricao() : "", fontBody));
                        rt.addCell(pdfCell(r.getPrioridade().name(), fontBody));
                        rt.addCell(pdfCell(r.getStatus().name(), fontBody));
                    }
                    doc.add(rt);
                    doc.add(Chunk.NEWLINE);
                }
            }

            // 4. Backlog
            if (!epicos.isEmpty()) {
                doc.add(Chunk.NEWLINE);
                doc.add(pdfH1("4. HISTÓRIAS DE USUÁRIO E BACKLOG", fontH1));
                for (Epico e : epicos) {
                    doc.add(pdfH2(e.getCodigo() + " — " + e.getTitulo(), fontH2));
                    if (e.getDescricao() != null) {
                        Paragraph pd = new Paragraph(e.getDescricao(), fontSmall);
                        pd.setIndentationLeft(12);
                        doc.add(pd);
                    }
                    for (var feat : e.getFeatures()) {
                        doc.add(pdfH3(feat.getCodigo() + " — " + feat.getTitulo(), fontH3));
                        if (!feat.getHistorias().isEmpty()) {
                            PdfPTable ht = new PdfPTable(4);
                            ht.setWidthPercentage(97);
                            ht.setWidths(new float[]{1.2f, 7f, 0.8f, 1.5f});
                            for (String h : new String[]{"Código", "História de Usuário", "SP", "Prioridade"})
                                ht.addCell(pdfHeaderCell(h, fontHeader));
                            for (var h : feat.getHistorias()) {
                                String texto = "Como " + h.getComoPapel() +
                                        ", quero " + h.getQueroAcao() +
                                        (h.getParaBeneficio() != null ? ", para " + h.getParaBeneficio() : "");
                                ht.addCell(pdfCell(h.getCodigo(), fontBody));
                                ht.addCell(pdfCell(texto, fontBody));
                                ht.addCell(pdfCell(h.getStoryPoints() != null ? String.valueOf(h.getStoryPoints()) : "", fontBody));
                                ht.addCell(pdfCell(h.getPrioridade().name(), fontBody));
                            }
                            doc.add(ht);
                        }
                    }
                    doc.add(Chunk.NEWLINE);
                }
            }

            doc.close();
        } catch (Exception e) {
            log.error("Erro ao gerar PDF para demanda {}", demandaId, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Falha ao gerar PDF");
        }
        return out.toByteArray();
    }

    // ── PDF helpers ────────────────────────────────────────────────────────────

    private Paragraph pdfH1(String text, Font font) {
        Paragraph p = new Paragraph(text, font);
        p.setSpacingBefore(10);
        p.setSpacingAfter(6);
        return p;
    }

    private Paragraph pdfH2(String text, Font font) {
        Paragraph p = new Paragraph(text, font);
        p.setSpacingBefore(8);
        p.setSpacingAfter(4);
        return p;
    }

    private Paragraph pdfH3(String text, Font font) {
        Paragraph p = new Paragraph(text, font);
        p.setSpacingBefore(5);
        p.setSpacingAfter(2);
        p.setIndentationLeft(12);
        return p;
    }

    private void pdfRow(PdfPTable table, String label, String value, Font labelFont, Font valueFont) {
        PdfPCell lc = new PdfPCell(new Phrase(label, labelFont));
        lc.setBorderColor(new Color(220, 220, 220));
        lc.setPadding(5);
        lc.setBackgroundColor(new Color(245, 247, 250));
        table.addCell(lc);

        PdfPCell vc = new PdfPCell(new Phrase(value, valueFont));
        vc.setBorderColor(new Color(220, 220, 220));
        vc.setPadding(5);
        table.addCell(vc);
    }

    private void pdfCanvasRow(PdfPTable table, String label, String value, Font lf, Font vf) {
        if (value == null || value.isBlank()) return;
        pdfRow(table, label, value, lf, vf);
    }

    private PdfPCell pdfHeaderCell(String text, Font font) {
        PdfPCell c = new PdfPCell(new Phrase(text, font));
        c.setBackgroundColor(new Color(13, 31, 60));
        c.setPadding(5);
        c.setBorderColor(new Color(13, 31, 60));
        return c;
    }

    private PdfPCell pdfCell(String text, Font font) {
        PdfPCell c = new PdfPCell(new Phrase(text, font));
        c.setBorderColor(new Color(220, 220, 220));
        c.setPadding(4);
        return c;
    }

    // ── utils ──────────────────────────────────────────────────────────────────

    private Demanda findDemanda(UUID id) {
        return demandaRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Demanda não encontrada"));
    }

    private String tipoLabel(TipoRequisito tipo) {
        return switch (tipo) {
            case RF  -> "3.1 Requisitos Funcionais (RF)";
            case RNF -> "3.2 Requisitos Não Funcionais (RNF)";
            case RN  -> "3.3 Regras de Negócio (RN)";
            case RI  -> "3.4 Requisitos de Integração (RI)";
            case RS  -> "3.5 Requisitos de Sistema (RS)";
        };
    }
}
