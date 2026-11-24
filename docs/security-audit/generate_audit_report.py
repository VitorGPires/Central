#!/usr/bin/env python3
"""
Gerador do Relatório de Auditoria de Segurança — CentralPinhal
Uso:
  docs/security-audit/.venv/Scripts/python.exe docs/security-audit/generate_audit_report.py
"""

from pathlib import Path
import html
import textwrap
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm, mm
from reportlab.platypus import (
    HRFlowable,
    Image,
    KeepTogether,
    PageBreak,
    Paragraph,
    Preformatted,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

BASE_DIR = Path(__file__).resolve().parent
PDF_PATH = BASE_DIR / "relatorio-auditoria-seguranca.pdf"
CHARTS_DIR = BASE_DIR / "charts"
CHARTS_DIR.mkdir(parents=True, exist_ok=True)

# Paleta oficial solicitada
HEX_CRITICA = "#B91C1C"
HEX_ALTA = "#EA580C"
HEX_MEDIA = "#D97706"
HEX_BAIXA = "#2563EB"
HEX_INFO = "#64748B"
HEX_FORTE = "#059669"
HEX_INK = "#1E293B"
HEX_MUTED = "#475569"
HEX_BORDER = "#CBD5E1"
HEX_BG_SOFT = "#F8FAFC"
HEX_BG_CODE = "#F1F5F9"
HEX_FOREST = "#1F3A2E"

C_CRITICA = colors.HexColor(HEX_CRITICA)
C_ALTA = colors.HexColor(HEX_ALTA)
C_MEDIA = colors.HexColor(HEX_MEDIA)
C_BAIXA = colors.HexColor(HEX_BAIXA)
C_INFO = colors.HexColor(HEX_INFO)
C_FORTE = colors.HexColor(HEX_FORTE)
C_INK = colors.HexColor(HEX_INK)
C_MUTED = colors.HexColor(HEX_MUTED)
C_BORDER = colors.HexColor(HEX_BORDER)
C_BG_SOFT = colors.HexColor(HEX_BG_SOFT)
C_BG_CODE = colors.HexColor(HEX_BG_CODE)
C_FOREST = colors.HexColor(HEX_FOREST)

SEV_COLORS = {
    "Crítica": (HEX_CRITICA, "#FEE2E2"),
    "Alta": (HEX_ALTA, "#FFEDD5"),
    "Média": (HEX_MEDIA, "#FEF3C7"),
    "Baixa": (HEX_BAIXA, "#DBEAFE"),
    "Informativa": (HEX_INFO, "#F1F5F9"),
}


def generate_charts():
    """Gera o gráfico de rosca por severidade e o gráfico de barras por categoria."""
    # 1. Gráfico de Rosca por Severidade
    sev_labels = ["Crítica", "Alta", "Média", "Baixa", "Informativa"]
    sev_values = [0, 2, 1, 2, 1]
    sev_colors = [HEX_CRITICA, HEX_ALTA, HEX_MEDIA, HEX_BAIXA, HEX_INFO]

    # Filtrar fatias com valor > 0 para o desenho da rosca, mantendo legenda completa
    nz_labels = [l for l, v in zip(sev_labels, sev_values) if v > 0]
    nz_values = [v for v in sev_values if v > 0]
    nz_colors = [c for c, v in zip(sev_colors, sev_values) if v > 0]

    fig, ax = plt.subplots(figsize=(4.4, 3.3), dpi=220)
    wedges, texts, autotexts = ax.pie(
        nz_values,
        labels=None,
        colors=nz_colors,
        autopct=lambda p: f"{int(round(p * sum(nz_values) / 100.0))}",
        startangle=130,
        pctdistance=0.77,
        wedgeprops=dict(width=0.40, edgecolor="white", linewidth=2.2),
    )
    for at in autotexts:
        at.set_color("white")
        at.set_fontsize(10)
        at.set_fontweight("bold")

    ax.text(0, 0.08, f"{sum(sev_values)}", ha="center", va="center", fontsize=22, fontweight="bold", color=HEX_INK)
    ax.text(0, -0.17, "Achados", ha="center", va="center", fontsize=9, color=HEX_MUTED)

    legend_labels = [f"{l}: {v}" for l, v in zip(sev_labels, sev_values)]
    legend_handles = [
        plt.Line2D([0], [0], marker="o", color="w", label=lbl, markerfacecolor=col, markersize=8)
        for lbl, col in zip(legend_labels, sev_colors)
    ]
    ax.legend(
        handles=legend_handles,
        loc="center left",
        bbox_to_anchor=(0.94, 0.5),
        frameon=False,
        fontsize=8.5,
    )
    ax.set_title("Distribuição por Severidade", fontsize=11, fontweight="bold", color=HEX_INK, pad=10)
    plt.tight_layout()
    donut_path = CHARTS_DIR / "chart_severity_donut.png"
    plt.savefig(donut_path, dpi=220, bbox_inches="tight", facecolor="white")
    plt.close(fig)

    # 2. Gráfico de Barras por Categoria
    cat_labels = [
        "1. Banco sem\nTranca",
        "2. Permissão\nno Navegador",
        "3. IDOR\n(Preparação)",
        "4. Chaves\nExpostas",
        "5. Inputs sem\nTratamento (XSS)",
    ]
    cat_counts = [1, 1, 1, 1, 2]
    cat_colors = [HEX_ALTA, HEX_MEDIA, HEX_INFO, HEX_BAIXA, HEX_ALTA]

    fig, ax = plt.subplots(figsize=(5.0, 3.3), dpi=220)
    x = np.arange(len(cat_labels))
    bars = ax.bar(x, cat_counts, width=0.56, color=cat_colors, edgecolor="none", zorder=3)
    ax.set_xticks(x)
    ax.set_xticklabels(cat_labels, fontsize=7.8, color=HEX_INK)
    ax.set_yticks([0, 1, 2, 3])
    ax.set_ylim(0, 2.65)
    ax.yaxis.grid(True, linestyle="--", alpha=0.45, color="#CBD5E1", zorder=0)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.spines["left"].set_color("#CBD5E1")
    ax.spines["bottom"].set_color("#CBD5E1")

    for bar, val in zip(bars, cat_counts):
        ax.text(
            bar.get_x() + bar.get_width() / 2,
            val + 0.08,
            str(val),
            ha="center",
            va="bottom",
            fontsize=10,
            fontweight="bold",
            color=HEX_INK,
        )

    ax.set_title("Achados por Categoria (5 Pilares)", fontsize=11, fontweight="bold", color=HEX_INK, pad=10)
    plt.tight_layout()
    bar_path = CHARTS_DIR / "chart_category_bars.png"
    plt.savefig(bar_path, dpi=220, bbox_inches="tight", facecolor="white")
    plt.close(fig)

    return donut_path, bar_path


def sev_chip(severity: str, styles) -> Table:
    fg, bg = SEV_COLORS[severity]
    p = Paragraph(
        f'<font color="{fg}"><b>{severity.upper()}</b></font>',
        ParagraphStyle("chip", parent=styles["Normal"], fontSize=7.0, alignment=TA_CENTER, leading=9),
    )
    t = Table([[p]], colWidths=[2.35 * cm])
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor(bg)),
                ("BOX", (0, 0), (-1, -1), 0.6, colors.HexColor(fg)),
                ("TOPPADDING", (0, 0), (-1, -1), 3),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
                ("LEFTPADDING", (0, 0), (-1, -1), 4),
                ("RIGHTPADDING", (0, 0), (-1, -1), 4),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ]
        )
    )
    return t


def header_footer(canvas, doc):
    """Cabeçalho e rodapé a partir da página 2."""
    if doc.page == 1:
        return
    canvas.saveState()
    w, h = A4
    # Header line
    canvas.setStrokeColor(C_BORDER)
    canvas.setLineWidth(0.6)
    canvas.line(2 * cm, h - 1.45 * cm, w - 2 * cm, h - 1.45 * cm)
    canvas.setFont("Helvetica-Bold", 8)
    canvas.setFillColor(C_MUTED)
    canvas.drawString(2 * cm, h - 1.25 * cm, "Relatório de Auditoria de Segurança — CentralPinhal")
    canvas.setFont("Helvetica", 8)
    canvas.drawRightString(w - 2 * cm, h - 1.25 * cm, "24 de novembro de 2026")

    # Footer line
    canvas.line(2 * cm, 1.45 * cm, w - 2 * cm, 1.45 * cm)
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(C_MUTED)
    canvas.drawString(2 * cm, 1.05 * cm, "Confidencial — Uso interno de Engenharia e Segurança")
    canvas.drawRightString(w - 2 * cm, 1.05 * cm, f"Página {doc.page}")
    canvas.restoreState()


def build_pdf():
    donut_path, bar_path = generate_charts()

    doc = SimpleDocTemplate(
        str(PDF_PATH),
        pagesize=A4,
        leftMargin=2 * cm,
        rightMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
        title="Relatório de Auditoria de Segurança — CentralPinhal",
        author="Auditoria Técnica de Segurança",
    )

    styles = getSampleStyleSheet()
    s_cover_tag = ParagraphStyle(
        "CoverTag",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=9,
        textColor=C_FORTE,
        spaceAfter=8,
    )
    s_cover_title = ParagraphStyle(
        "CoverTitle",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=24,
        leading=30,
        textColor=C_INK,
        alignment=TA_LEFT,
        spaceAfter=8,
    )
    s_cover_sub = ParagraphStyle(
        "CoverSub",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=11,
        leading=16,
        textColor=C_MUTED,
        spaceAfter=18,
    )
    s_h1 = ParagraphStyle(
        "H1",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=15,
        leading=20,
        textColor=C_FOREST,
        spaceBefore=12,
        spaceAfter=8,
    )
    s_h2 = ParagraphStyle(
        "H2",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=11.5,
        leading=15,
        textColor=C_INK,
        spaceBefore=10,
        spaceAfter=5,
    )
    s_body = ParagraphStyle(
        "Body",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9.2,
        leading=13.5,
        textColor=C_INK,
        alignment=TA_JUSTIFY,
        spaceAfter=6,
    )
    s_small = ParagraphStyle(
        "Small",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.3,
        leading=11.8,
        textColor=C_MUTED,
        spaceAfter=4,
    )
    s_bullet = ParagraphStyle(
        "Bullet",
        parent=s_body,
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=4,
    )
    s_code = ParagraphStyle(
        "CodeBlock",
        parent=styles["Code"],
        fontName="Courier",
        fontSize=7.5,
        leading=10.2,
        textColor=C_INK,
        backColor=C_BG_CODE,
        leftIndent=6,
        rightIndent=6,
        spaceBefore=3,
        spaceAfter=6,
    )
    s_issue = ParagraphStyle(
        "IssueBlock",
        parent=styles["Code"],
        fontName="Courier",
        fontSize=7.3,
        leading=10.0,
        textColor=C_INK,
        backColor=C_BG_SOFT,
        leftIndent=8,
        rightIndent=8,
        spaceBefore=4,
        spaceAfter=8,
    )

    story = []

    # ===================== CAPA =====================
    story.append(Spacer(1, 0.8 * cm))
    story.append(Paragraph("AUDITORIA DEFENSIVA DE CÓDIGO-FONTE · 5 PILARES DE SEGURANÇA", s_cover_tag))
    story.append(Paragraph("Relatório de Auditoria de Segurança — CentralPinhal", s_cover_title))
    story.append(
        Paragraph(
            "Análise linha a linha da plataforma de gestão pessoal e profissional "
            "(Tarefas, Hábitos, Saúde Mental, Segundo Cérebro, Financeiro, Agenda e Conteúdo).",
            s_cover_sub,
        )
    )
    story.append(HRFlowable(width="100%", thickness=1.8, color=C_FOREST, spaceAfter=14))

    meta_data = [
        [Paragraph("<b>Data da Auditoria</b>", s_small), Paragraph("24 de novembro de 2026", s_small)],
        [Paragraph("<b>Projeto Auditado</b>", s_small), Paragraph("CentralPinhal (nova-pasta--3- · v0.0.0)", s_small)],
        [
            Paragraph("<b>Stack Detectada</b>", s_small),
            Paragraph(
                "TypeScript ~7.0.2 · React 19.3.1 · Vite 8.3.6 · Tailwind CSS v4 · Recharts · Lucide React. "
                "SPA 100% client-side com persistência via window.localStorage. Sem backend, ORM, autenticação, Docker/CI ou repositório .git.",
                s_small,
            ),
        ],
        [
            Paragraph("<b>Escopo Verificado</b>", s_small),
            Paragraph(
                "Todos os arquivos de código-fonte em src/** (App.tsx, main.tsx, AppContext.tsx, seedData.ts, "
                "types/index.ts, utils/format.ts, Sidebar.tsx, QuickModals.tsx, HeroLandscape.tsx e os 7 módulos), "
                "além de index.html, vite.config.ts, package.json e bundle dist/.",
                s_small,
            ),
        ],
    ]
    meta_table = Table(meta_data, colWidths=[4.2 * cm, 12.8 * cm])
    meta_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), C_BG_SOFT),
                ("BOX", (0, 0), (-1, -1), 0.7, C_BORDER),
                ("INNERGRID", (0, 0), (-1, -1), 0.4, C_BORDER),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("TOPPADDING", (0, 0), (-1, -1), 7),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    story.append(meta_table)
    story.append(Spacer(1, 0.7 * cm))

    story.append(Paragraph("Nota Metodológica — Adaptação das 5 Categorias à Stack Detectada", s_h2))
    story.append(
        Paragraph(
            "Como o CentralPinhal é atualmente uma Single-Page Application (SPA) 100% executada no navegador "
            "(sem API HTTP, banco de dados remoto ou camada de autenticação server-side), cada uma das 5 categorias "
            "de auditoria foi mapeada com precisão para o equivalente real da arquitetura existente, sem especulações:",
            s_body,
        )
    )

    method_rows = [
        [Paragraph("<b>Categoria</b>", s_small), Paragraph("<b>Mapeamento para a Stack (React/Vite SPA)</b>", s_small)],
        [
            Paragraph("<b>1. Banco sem Tranca</b>", s_small),
            Paragraph(
                "Auditado o armazenamento local (localStorage em AppContext.tsx): isolamento de dados entre usuários do mesmo "
                "navegador, proteção de dados sensíveis (finanças/saúde mental) e validação de schema na hidratação JSON.",
                s_small,
            ),
        ],
        [
            Paragraph("<b>2. Permissão no Navegador</b>", s_small),
            Paragraph(
                "Não há backend ou RBAC hoje (parcialmente N/A). Avaliada a ausência de autenticação/confirmação em ações "
                "destrutivas/administrativas (resetDemoData, edição de perfil) totalmente controladas no cliente.",
                s_small,
            ),
        ],
        [
            Paragraph("<b>3. IDOR</b>", s_small),
            Paragraph(
                "Não aplicável diretamente hoje (ausência de endpoints HTTP). Verificada a modelagem de mutações por ID "
                "em AppContext.tsx e types/index.ts quanto à prontidão de posse (ownerId/tenantId) para futura API.",
                s_small,
            ),
        ],
        [
            Paragraph("<b>4. Chaves Expostas</b>", s_small),
            Paragraph(
                "Varredura integral em src/**, configs, package.json e bundle dist/ por segredos, tokens, API keys, "
                "defaults inseguros e vazamento de dados pessoais (PII) embutidos no cliente.",
                s_small,
            ),
        ],
        [
            Paragraph("<b>5. Inputs sem Tratamento (XSS)</b>", s_small),
            Paragraph(
                "Auditoria de todos os sinks DOM (dangerouslySetInnerHTML, innerHTML, eval, href/src controlados pelo usuário), "
                "bibliotecas de sanitização e cabeçalhos/políticas de segurança (CSP) em index.html.",
                s_small,
            ),
        ],
    ]
    method_table = Table(method_rows, colWidths=[4.5 * cm, 12.5 * cm])
    method_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), C_FOREST),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, C_BG_SOFT]),
                ("BOX", (0, 0), (-1, -1), 0.6, C_BORDER),
                ("INNERGRID", (0, 0), (-1, -1), 0.4, C_BORDER),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("TOPPADDING", (0, 0), (-1, -1), 5.5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5.5),
                ("LEFTPADDING", (0, 0), (-1, -1), 7),
                ("RIGHTPADDING", (0, 0), (-1, -1), 7),
            ]
        )
    )
    # Fix header white text
    method_rows[0][0] = Paragraph('<font color="white"><b>Categoria</b></font>', s_small)
    method_rows[0][1] = Paragraph('<font color="white"><b>Mapeamento para a Stack (React/Vite SPA)</b></font>', s_small)
    method_table = Table(method_rows, colWidths=[4.5 * cm, 12.5 * cm])
    method_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), C_FOREST),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, C_BG_SOFT]),
                ("BOX", (0, 0), (-1, -1), 0.6, C_BORDER),
                ("INNERGRID", (0, 0), (-1, -1), 0.4, C_BORDER),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("TOPPADDING", (0, 0), (-1, -1), 5.5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5.5),
                ("LEFTPADDING", (0, 0), (-1, -1), 7),
                ("RIGHTPADDING", (0, 0), (-1, -1), 7),
            ]
        )
    )
    story.append(method_table)
    story.append(PageBreak())

    # ===================== RESUMO EXECUTIVO =====================
    story.append(Paragraph("1. Resumo Executivo", s_h1))
    story.append(
        Paragraph(
            "A auditoria identificou <b>6 achados verificados</b> distribuídos em <b>0 Crítica</b>, "
            "<b>2 Alta</b>, <b>1 Média</b>, <b>2 Baixa</b> e <b>1 Informativa</b>, além de <b>5 pontos fortes</b> "
            "comprovados no código. Os dois riscos prioritários concentram-se na validação de protocolo de URLs "
            "renderizadas em links clicáveis (vetor de XSS via esquema <i>javascript:</i>) e na persistência "
            "sem isolamento, criptografia ou validação de schema de dados financeiros e de saúde mental no localStorage.",
            s_body,
        )
    )

    # KPI Cards Strip
    kpi_items = [
        ("CRÍTICA", "0", HEX_CRITICA, "#FEE2E2"),
        ("ALTA", "2", HEX_ALTA, "#FFEDD5"),
        ("MÉDIA", "1", HEX_MEDIA, "#FEF3C7"),
        ("BAIXA", "2", HEX_BAIXA, "#DBEAFE"),
        ("INFORMATIVA", "1", HEX_INFO, "#F1F5F9"),
        ("PONTOS FORTES", "5", HEX_FORTE, "#D1FAE5"),
    ]
    kpi_cells = []
    for label, num, fg, bg in kpi_items:
        cell = Paragraph(
            f'<font color="{fg}" size="16"><b>{num}</b></font><br/>'
            f'<font color="{fg}" size="6.5"><b>{label}</b></font>',
            ParagraphStyle("kpi", parent=styles["Normal"], alignment=TA_CENTER, leading=13),
        )
        kpi_cells.append(cell)

    kpi_table = Table([kpi_cells], colWidths=[2.83 * cm] * 6)
    kpi_style = [
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("GRID", (0, 0), (-1, -1), 1.5, colors.white),
    ]
    for idx, (_, _, fg, bg) in enumerate(kpi_items):
        kpi_style.append(("BACKGROUND", (idx, 0), (idx, 0), colors.HexColor(bg)))
        kpi_style.append(("LINEABOVE", (idx, 0), (idx, 0), 2.5, colors.HexColor(fg)))
    kpi_table.setStyle(TableStyle(kpi_style))
    story.append(kpi_table)
    story.append(Spacer(1, 0.45 * cm))

    # Charts side-by-side
    charts_table = Table(
        [[Image(str(donut_path), width=8.1 * cm, height=6.0 * cm), Image(str(bar_path), width=8.6 * cm, height=6.0 * cm)]],
        colWidths=[8.3 * cm, 8.7 * cm],
    )
    charts_table.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("BOX", (0, 0), (0, 0), 0.5, C_BORDER),
                ("BOX", (1, 0), (1, 0), 0.5, C_BORDER),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    story.append(charts_table)
    story.append(Spacer(1, 0.5 * cm))

    # ===================== PONTOS FORTES E PONTOS FRACOS =====================
    story.append(Paragraph("2. Pontos Fortes e Pontos Fracos", s_h1))

    pf_left = [
        Paragraph(f'<font color="{HEX_FORTE}"><b>PONTOS FORTES (VERIFICADOS NO CÓDIGO)</b></font>', s_small),
        Paragraph("• <b>Zero sinks HTML inseguros:</b> Nenhum uso de dangerouslySetInnerHTML, innerHTML, outerHTML, document.write, eval() ou new Function() em todo o diretório src/.", s_small),
        Paragraph("• <b>Escape automático do React:</b> Toda renderização de textos (tarefas, notas, transações, eventos e roteiros) usa interpolação JSX segura.", s_small),
        Paragraph("• <b>Zero segredos hardcoded:</b> Nenhuma API key, token JWT, senha ou credencial privada em src/, configs, package.json ou bundle dist/.", s_small),
        Paragraph("• <b>Proteção contra tabnabbing:</b> O link externo em SecondBrainModule.tsx:320 define rel=\"noreferrer\".", s_small),
        Paragraph("• <b>Higiene de build e dependências:</b> TypeScript estrito (tsc -b com 0 erros), try/catch na leitura de localStorage e 0 vulnerabilidades em npm audit (97 pacotes).", s_small),
    ]
    pf_right = [
        Paragraph(f'<font color="{HEX_ALTA}"><b>PONTOS FRACOS (RISCOS CENTRAIS)</b></font>', s_small),
        Paragraph("• <b>XSS via esquema de URL em href:</b> SecondBrainModule.tsx:318 renderiza note.url diretamente em &lt;a href&gt; sem restringir protocolo a http:/https:.", s_small),
        Paragraph("• <b>Dados sensíveis sem isolamento nem validação:</b> AppContext.tsx:147-173 salva finanças e saúde mental em texto plano no localStorage e faz merge de JSON sem schema.", s_small),
        Paragraph("• <b>Sem autenticação nem confirmação destrutiva:</b> QuickModals.tsx:825 executa resetDemoData() sem diálogo de confirmação ou controle de acesso.", s_small),
        Paragraph("• <b>Ausência de CSP e validação em assetLink:</b> index.html não define Content-Security-Policy; ContentModule.tsx:180 aceita URLs arbitrárias.", s_small),
        Paragraph("• <b>PII em dados seed + ausência de ownerId:</b> seedData.ts:410 inclui nome nominal no bundle; entidades ainda não modelam ownerId/tenantId para futura API.", s_small),
    ]

    sw_table = Table([[pf_left, pf_right]], colWidths=[8.4 * cm, 8.6 * cm])
    sw_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (0, 0), colors.HexColor("#ECFDF5")),
                ("BACKGROUND", (1, 0), (1, 0), colors.HexColor("#FFF7ED")),
                ("BOX", (0, 0), (0, 0), 0.7, C_FORTE),
                ("BOX", (1, 0), (1, 0), 0.7, C_ALTA),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    story.append(sw_table)
    story.append(PageBreak())

    # ===================== TABELA DE ACHADOS DETALHADOS =====================
    story.append(Paragraph("3. Achados Detalhados por Categoria", s_h1))
    story.append(
        Paragraph(
            "A tabela abaixo consolida todos os achados confirmados no código-fonte real, acompanhados "
            "em seguida pelas evidências linha a linha e condições de explorabilidade.",
            s_body,
        )
    )

    findings = [
        {
            "id": "A-01",
            "cat": "5. Inputs sem Tratamento (XSS)",
            "sev": "Alta",
            "loc": "src/modules/SecondBrainModule.tsx:316-326\nsrc/modules/SecondBrainModule.tsx:113",
            "short": "URL controlada pelo usuário injetada diretamente em <a href={note.url}> sem validação de protocolo (http:/https:), permitindo XSS via esquema javascript:.",
            "code": (
                "316: {note.url && (\n"
                "317:   <a\n"
                "318:     href={note.url}\n"
                "319:     target=\"_blank\"\n"
                "320:     rel=\"noreferrer\""
            ),
            "why": (
                "A validação nativa de <input type=\"url\"> (linha 452) verifica sintaxe genérica de URI e pode ser "
                "contornada por dados vindos do localStorage (AppContext.tsx:149-150) ou futuras importações. "
                "Se note.url iniciar com um esquema executável (ex.: javascript:), o clique no link executa código "
                "no contexto da origem, podendo ler/exfiltrar todos os dados financeiros e notas do localStorage."
            ),
            "cond": "Requer interação do usuário (clique no link da nota) e entrada de URL com esquema não-HTTP (via formulário ou adulteração de localStorage/sincronização futura).",
        },
        {
            "id": "A-02",
            "cat": "1. Banco sem Tranca (Isolamento)",
            "sev": "Alta",
            "loc": "src/context/AppContext.tsx:96,147-151,173",
            "short": "Persistência de dados financeiros e de saúde mental em texto plano sob chave única global no localStorage, sem isolamento de usuário e com merge JSON sem validação de schema.",
            "code": (
                " 96: const STORAGE_KEY = 'centralpinhal_state_v1';\n"
                "147: const raw = localStorage.getItem(STORAGE_KEY);\n"
                "149: const parsed = JSON.parse(raw);\n"
                "150: return { ...defaultState, ...parsed };\n"
                "173: localStorage.setItem(STORAGE_KEY, JSON.stringify(state));"
            ),
            "why": (
                "Todos os dados sensíveis (saldos, cartões, lançamentos, humor e anotações de gratidão) ficam "
                "acessíveis em texto claro na origem para qualquer pessoa no mesmo perfil de navegador, extensões "
                "ou eventual XSS. Além disso, o spread cego de parsed sem validação de schema (ex.: Zod) permite "
                "injetar campos malformados ou URLs maliciosas diretamente no estado da aplicação."
            ),
            "cond": "Acesso ao mesmo perfil do navegador, extensão com permissão na origem, ou cadeia com XSS (Achado A-01).",
        },
        {
            "id": "A-03",
            "cat": "2. Permissão no Navegador",
            "sev": "Média",
            "loc": "src/components/QuickModals.tsx:822-835\nsrc/context/AppContext.tsx:398-401",
            "short": "Ação destrutiva resetDemoData() e edição de perfil/finanças sem autenticação nem confirmação explícita; controle 100% client-side.",
            "code": (
                "825: onClick={() => {\n"
                "826:   resetDemoData();\n"
                "827:   onClose();\n"
                "828: }}\n"
                "// AppContext.tsx:399\n"
                "399: localStorage.removeItem(STORAGE_KEY);"
            ),
            "why": (
                "Atualmente não há backend (portanto não há bypass de RBAC server-side). Porém, um clique acidental "
                "em 'Restaurar dados demo' apaga imediatamente todos os dados reais do usuário sem diálogo de confirmação. "
                "Caso a aplicação seja conectada a um backend sem mover autorização para o servidor, esse padrão "
                "exporá operações sensíveis apenas ao controle de UI."
            ),
            "cond": "Uso atual: perda acidental de dados locais com 1 clique. Cenário futuro (com backend): escalonamento se autorização ficar apenas no frontend.",
        },
        {
            "id": "A-04",
            "cat": "4. Chaves Expostas (Hardcode / PII)",
            "sev": "Baixa",
            "loc": "src/data/seedData.ts:23,410,421,670",
            "short": "Nenhuma chave/segredo encontrado, porém dados seed embutidos no bundle de produção contêm nome nominal aparentemente real (PII) e links internos.",
            "code": (
                " 23: email: 'contato@centralpinhal.com.br',\n"
                "410: holder: 'Ana C V Boier',\n"
                "670: assetLink: 'https://figma.com/file/carrossel-central',"
            ),
            "why": (
                "O Vite empacota seedData.ts diretamente no bundle JavaScript público (dist/assets/index-*.js). "
                "Embora não sejam credenciais, incluir nomes de pessoas reais em dados de demonstração viola "
                "boas práticas de minimização de dados (LGPD)."
            ),
            "cond": "Exposição pública automática ao fazer deploy do bundle estático em produção.",
        },
        {
            "id": "A-05",
            "cat": "5. Inputs sem Tratamento (XSS / Hardening)",
            "sev": "Baixa",
            "loc": "src/modules/ContentModule.tsx:180,1007-1012\nindex.html:1-18",
            "short": "Campo assetLink aceita qualquer string sem validação de protocolo HTTP(S), e index.html não define Content-Security-Policy (CSP).",
            "code": (
                "// ContentModule.tsx:180\n"
                "180: assetLink: assetLink.trim() || undefined,\n"
                "// index.html:1-13 (sem <meta http-equiv=\"Content-Security-Policy\">)"
            ),
            "why": (
                "Mesmo que assetLink ainda não seja renderizado como <a href> na versão atual, armazená-lo sem "
                "validação cria risco latente assim que um link clicável for adicionado. Adicionalmente, a falta "
                "de CSP em index.html elimina uma camada crítica de mitigação contra execução de scripts inesperados."
            ),
            "cond": "Risco latente para assetLink (quando exibido como link) e redução de defesa em profundidade sem CSP.",
        },
        {
            "id": "A-06",
            "cat": "3. IDOR (Prontidão Arquitetural)",
            "sev": "Informativa",
            "loc": "src/context/AppContext.tsx:198-396\nsrc/types/index.ts:27-196",
            "short": "Categoria N/A no estado atual (sem backend). Entidades de domínio não possuem ownerId/tenantId para futura migração a API/Supabase.",
            "code": (
                "// AppContext.tsx:204\n"
                "204: const updateTask = (id: string, patch: Partial<Task>) =>\n"
                "207:   tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),"
            ),
            "why": (
                "Não existe vulnerabilidade IDOR explorável hoje porque toda a persistência é local. O registro "
                "serve como alerta preventivo: ao conectar um backend/Supabase, cada tabela deverá carregar "
                "user_id/workspace_id e aplicar validação de posse (ou RLS) em todas as rotas de leitura/escrita."
            ),
            "cond": "Aplicável somente na evolução futura para arquitetura cliente-servidor multiusuário.",
        },
    ]

    table_rows = [
        [
            Paragraph('<font color="white"><b>Severidade</b></font>', s_small),
            Paragraph('<font color="white"><b>Arquivo:linha</b></font>', s_small),
            Paragraph('<font color="white"><b>Categoria e Descrição</b></font>', s_small),
        ]
    ]
    for f in findings:
        table_rows.append(
            [
                sev_chip(f["sev"], styles),
                Paragraph(f'<font face="Courier" size="7.2">{f["loc"].replace(chr(10), "<br/>")}</font>', s_small),
                Paragraph(f'<b>[{f["id"]}] {html.escape(f["cat"])}</b><br/>{html.escape(f["short"])}', s_small),
            ]
        )

    summary_tbl = Table(table_rows, colWidths=[2.65 * cm, 5.15 * cm, 9.2 * cm], repeatRows=1)
    summary_tbl.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), C_FOREST),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, C_BG_SOFT]),
                ("BOX", (0, 0), (-1, -1), 0.6, C_BORDER),
                ("INNERGRID", (0, 0), (-1, -1), 0.4, C_BORDER),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("LEFTPADDING", (0, 0), (-1, -1), 5),
                ("RIGHTPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    story.append(summary_tbl)
    story.append(Spacer(1, 0.45 * cm))

    story.append(Paragraph("Detalhamento Técnico e Evidências", s_h2))
    for f in findings:
        fg, _ = SEV_COLORS[f["sev"]]
        block = [
            Paragraph(
                f'<b>{f["id"]} — {f["cat"]}</b> &nbsp; '
                f'<font color="{fg}"><b>[{f["sev"].upper()}]</b></font>',
                s_h2,
            ),
            Paragraph(f'<b>Localização:</b> <font face="Courier" size="8">{f["loc"].replace(chr(10), " | ")}</font>', s_small),
            Preformatted(f["code"], s_code),
            Paragraph(f'<b>Por que é explorável / Risco:</b> {html.escape(f["why"])}', s_body),
            Paragraph(f'<b>Condição de explorabilidade:</b> {html.escape(f["cond"])}', s_small),
            HRFlowable(width="100%", thickness=0.4, color=C_BORDER, spaceBefore=3, spaceAfter=6),
        ]
        story.append(KeepTogether(block))

    # ===================== RECOMENDAÇÕES PRIORIZADAS =====================
    story.append(PageBreak())
    story.append(Paragraph("4. Recomendações Priorizadas", s_h1))

    recs = [
        (
            "P1 — Imediata (Alta)",
            HEX_ALTA,
            "Sanitizar e validar protocolos de URL antes de salvar e renderizar",
            "Criar um utilitário safeUrl(raw: string): string | null usando new URL(raw) que permita exclusivamente "
            "protocolos 'http:' e 'https:'. Aplicá-lo tanto no submit de SecondBrainModule.tsx e ContentModule.tsx "
            "quanto na renderização do atributo href em SecondBrainModule.tsx:318 (com rel=\"noopener noreferrer\").",
        ),
        (
            "P2 — Curto Prazo (Alta)",
            HEX_ALTA,
            "Validar schema na hidratação do localStorage e planejar persistência segura",
            "Substituir o spread cego { ...defaultState, ...parsed } em AppContext.tsx:150 por validação estrita "
            "com Zod (ou validador dedicado) descartando campos inválidos e URLs não-HTTP. Para dados financeiros "
            "e de saúde mental em produção, migrar para backend autenticado com TLS + banco isolado (ex.: PostgreSQL com RLS).",
        ),
        (
            "P3 — Médio Prazo (Média)",
            HEX_MEDIA,
            "Adicionar confirmação em ações destrutivas e preparar modelo de autenticação/posse",
            "Exigir confirmação explícita antes de executar resetDemoData() em QuickModals.tsx:825. Ao introduzir "
            "backend, incluir owner_id/tenant_id nas entidades de src/types/index.ts, impor verificação de sessão/papel "
            "no servidor em toda rota sensível e validar posse de objeto por ID para impedir IDOR.",
        ),
        (
            "P4 — Hardening (Baixa)",
            HEX_BAIXA,
            "Remover PII dos dados seed e configurar Content-Security-Policy (CSP)",
            "Substituir nomes reais em src/data/seedData.ts (ex.: 'Ana C V Boier') por nomes fictícios genéricos. "
            "Adicionar cabeçalho HTTP Content-Security-Policy (e Referrer-Policy: strict-origin-when-cross-origin) "
            "no servidor de hospedagem e meta tag restritiva em index.html.",
        ),
    ]

    for prio, col, title, desc in recs:
        card = Table(
            [
                [
                    Paragraph(f'<font color="{col}"><b>{prio}</b></font><br/><b>{title}</b>', s_body),
                ],
                [Paragraph(desc, s_small)],
            ],
            colWidths=[17.0 * cm],
        )
        card.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, -1), C_BG_SOFT),
                    ("LINEBEFORE", (0, 0), (0, -1), 3.5, colors.HexColor(col)),
                    ("BOX", (0, 0), (-1, -1), 0.5, C_BORDER),
                    ("TOPPADDING", (0, 0), (-1, -1), 6),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                    ("LEFTPADDING", (0, 0), (-1, -1), 10),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                ]
            )
        )
        story.append(card)
        story.append(Spacer(1, 0.3 * cm))

    # ===================== ISSUES PARA O GITHUB =====================
    story.append(PageBreak())
    story.append(Paragraph("5. ISSUES PARA O GITHUB", s_h1))
    story.append(
        Paragraph(
            "Os blocos abaixo contêm issues completas em Markdown prontas para copiar e colar diretamente "
            "no GitHub. Achados relacionados foram agrupados para evitar spam no backlog.",
            s_body,
        )
    )

    issues = [
        """--- ISSUE 1 ---
# [Segurança] XSS via esquema de URL não validado em links de notas e ativos

**Labels sugeridas:** `security`, `severity:alta`, `xss`

### Descrição do problema e por que é explorável
O componente `SecondBrainModule` renderiza `note.url` diretamente no atributo `href` de uma tag `<a>` sem restringir o protocolo a `http:` ou `https:`. Além disso, `ContentModule` persiste `assetLink` sem validação de esquema. Como o estado é hidratado de `localStorage` sem validação de schema, uma URL com esquema executável (como `javascript:`) pode ser injetada e, ao ser clicada pelo usuário, executar código arbitrário no contexto da origem da aplicação.

### Evidência
- `src/modules/SecondBrainModule.tsx:316-326`
```tsx
{note.url && (
  <a
    href={note.url}
    target="_blank"
    rel="noreferrer"
    onClick={(e) => e.stopPropagation()}
```
- `src/modules/ContentModule.tsx:180`
```ts
assetLink: assetLink.trim() || undefined,
```

### Impacto
Execução de JavaScript arbitrário no navegador da vítima (XSS), permitindo leitura, modificação ou exfiltração de todos os dados pessoais, financeiros e de saúde mental armazenados no `localStorage`.

### Sugestão de correção
1. Criar `src/utils/url.ts` com `sanitizeHttpUrl(raw: string): string | null` utilizando `new URL(raw)` e aceitando apenas `url.protocol === 'http:' || url.protocol === 'https:'`.
2. Aplicar `sanitizeHttpUrl` no salvamento (`SecondBrainModule.tsx` e `ContentModule.tsx`) e na renderização de qualquer `<a href>`.
3. Atualizar `rel="noreferrer"` para `rel="noopener noreferrer"`.

### Critérios de aceite
- [ ] Utilitário `sanitizeHttpUrl` criado e testado rejeitando esquemas `javascript:`, `data:` e `vbscript:`.
- [ ] `SecondBrainModule.tsx` não renderiza `<a>` quando `sanitizeHttpUrl(note.url)` retornar `null`.
- [ ] `ContentModule.tsx` valida `assetLink` antes de persistir no estado.
- [ ] Todos os links externos utilizam `rel="noopener noreferrer"`.
--- FIM ISSUE 1 ---""",
        """--- ISSUE 2 ---
# [Segurança] Ausência de validação de schema e isolamento no armazenamento local (localStorage)

**Labels sugeridas:** `security`, `severity:alta`, `data-protection`

### Descrição do problema e por que é explorável
Todo o estado da aplicação (contas bancárias, faturas, lançamentos financeiros, metas e diário de saúde mental) é salvo em texto plano em uma única chave global (`centralpinhal_state_v1`) no `localStorage`. Na inicialização, o JSON salvo é mesclado diretamente no estado com `{ ...defaultState, ...parsed }` sem validação de tipos ou sanitização. Em navegadores compartilhados, extensões maliciosas ou em cadeia com XSS, todos os dados ficam expostos e podem ser corrompidos/envenenados.

### Evidência
- `src/context/AppContext.tsx:96,147-151,173`
```ts
const STORAGE_KEY = 'centralpinhal_state_v1';
const raw = localStorage.getItem(STORAGE_KEY);
if (raw) {
  const parsed = JSON.parse(raw);
  return { ...defaultState, ...parsed };
}
```

### Impacto
Exposição integral de dados financeiros e de saúde mental a outros usuários do mesmo perfil de navegador ou scripts na origem, além de risco de corrupção de estado ou injeção de campos maliciosos na hidratação.

### Sugestão de correção
1. Validar o objeto carregado do `localStorage` com `zod` (ou validador estrito equivalente) antes de aplicá-lo ao estado, fazendo fallback seguro para `defaultState` em caso de falha.
2. Exibir aviso claro ao usuário de que o modo atual é local-only e oferecer botão de "Limpar dados locais" seguro.
3. No roadmap de produção, migrar dados sensíveis para backend autenticado com TLS e isolamento por `user_id`/RLS.

### Critérios de aceite
- [ ] Validação de schema implementada na leitura de `centralpinhal_state_v1` em `AppContext.tsx`.
- [ ] JSON adulterado ou com tipos inválidos não quebra a aplicação nem injeta URLs inválidas.
- [ ] Documentada a arquitetura alvo com backend autenticado e isolamento por inquilino antes de uso multiusuário.
--- FIM ISSUE 2 ---""",
        """--- ISSUE 3 ---
# [Segurança] Ação destrutiva de reset sem confirmação e preparo de autorização/posse para backend

**Labels sugeridas:** `security`, `severity:media`, `access-control`

### Descrição do problema e por que é explorável
Em `ProfileModal`, o botão "Restaurar dados demo" invoca `resetDemoData()` diretamente no clique, apagando `localStorage` sem confirmação. Adicionalmente, as entidades em `src/types/index.ts` e mutações em `src/context/AppContext.tsx` operam apenas por `id` sem `ownerId`/`tenantId` e sem camada de autenticação/autorização.

### Evidência
- `src/components/QuickModals.tsx:822-829`
```tsx
onClick={() => {
  resetDemoData();
  onClose();
}}
```
- `src/context/AppContext.tsx:204-207,398-401`
```ts
const updateTask = (id: string, patch: Partial<Task>) => ...
const resetDemoData = () => { localStorage.removeItem(STORAGE_KEY); ... };
```

### Impacto
Perda irreversível de dados locais por clique acidental hoje; risco estrutural de IDOR e autorização client-side caso o projeto seja conectado a uma API sem adicionar verificação de posse e papéis no servidor.

### Sugestão de correção
1. Adicionar modal/etapa explícita de confirmação antes de executar `resetDemoData()`.
2. Ao evoluir para backend, incluir `ownerId`/`workspaceId` nas entidades e validar autenticação, papéis e posse de recurso no servidor em 100% dos endpoints.

### Critérios de aceite
- [ ] `resetDemoData()` exige confirmação explícita do usuário antes de limpar `localStorage`.
- [ ] Checklist de migração para backend exige verificação de sessão e posse por `ownerId` em todas as rotas (prevenção de IDOR).
--- FIM ISSUE 3 ---""",
        """--- ISSUE 4 ---
# [Segurança] Hardening: Remover PII dos dados seed e adicionar Content-Security-Policy (CSP)

**Labels sugeridas:** `security`, `severity:baixa`, `hardening`, `privacy`

### Descrição do problema e por que é explorável
O arquivo `src/data/seedData.ts` embute nome nominal aparentemente real (`Ana C V Boier`) e URL de arquivo Figma no bundle JavaScript público (`dist/`). Além disso, `index.html` não declara política de segurança de conteúdo (`Content-Security-Policy`), reduzindo a defesa em profundidade contra injeção de scripts e carregamento indevido de recursos externos.

### Evidência
- `src/data/seedData.ts:23,410,670`
```ts
email: 'contato@centralpinhal.com.br',
holder: 'Ana C V Boier',
assetLink: 'https://figma.com/file/carrossel-central',
```
- `index.html:1-18` (ausência de `Content-Security-Policy` e `Referrer-Policy`)

### Impacto
Exposição desnecessária de dados pessoais (PII) no código-fonte/bundle distribuído ao cliente e ausência de barreira adicional no navegador contra XSS.

### Sugestão de correção
1. Substituir nomes e links reais em `src/data/seedData.ts` por dados fictícios genéricos (ex.: `Titular Exemplo`, `exemplo@dominio.invalid`).
2. Configurar cabeçalhos HTTP `Content-Security-Policy` e `Referrer-Policy: strict-origin-when-cross-origin` no servidor de deploy e adicionar meta tag CSP compatível em `index.html`.

### Critérios de aceite
- [ ] Nenhum nome pessoal real ou link privado permanece em `src/data/seedData.ts` ou no bundle `dist/`.
- [ ] CSP restritiva configurada bloqueando `object-src 'none'`, `base-uri 'self'` e origens de script não autorizadas.
- [ ] Build de produção (`npm run build`) continua funcionando sem violações de CSP no console.
--- FIM ISSUE 4 ---""",
    ]

    def wrap_block(text: str, width: int = 92) -> str:
        out = []
        for line in text.splitlines():
            if len(line) <= width or line.strip().startswith("```") or line.startswith("---"):
                out.append(line)
            else:
                indent = "  " if line.startswith(("- ", "1. ", "2. ", "3. ")) else ""
                out.extend(textwrap.wrap(line, width=width, subsequent_indent=indent))
        return "\n".join(out)

    for iss in issues:
        story.append(Preformatted(wrap_block(iss, 92), s_issue))
        story.append(Spacer(1, 0.25 * cm))

    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    print(f"PDF gerado com sucesso em: {PDF_PATH}")


if __name__ == "__main__":
    build_pdf()
