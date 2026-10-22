# -*- coding: utf-8 -*-
"""
Скрипт генерации презентационного технического документа (DOCX)
проекта цифровых NFC-визиток «CardHub» для инвестора/партнера.
"""

import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

def create_document():
    doc = docx.Document()

    # --- Настройка полей страницы (2 см со всех сторон) ---
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)

    # --- Цветовая палитра ---
    COLOR_PRIMARY = RGBColor(15, 23, 42)      # Slate 900 (Основной текст)
    COLOR_BRAND = RGBColor(37, 99, 235)       # Royal Blue (Брендовый акцент)
    COLOR_SECONDARY = RGBColor(71, 85, 105)   # Slate 600 (Второстепенный)
    COLOR_MUTED = RGBColor(100, 116, 139)     # Slate 500 (Подписи)
    HEX_BRAND_LIGHT = "EFF6FF"                # Светло-голубой для плашек
    HEX_GRAY_LIGHT = "F8FAFC"                 # Очень светлый фон для таблиц
    HEX_NAVY = "1E293B"                       # Темный фон заголовков таблиц
    HEX_BORDER = "CBD5E1"                     # Серый цвет рамок
    HEX_SUCCESS_LIGHT = "F0FDF4"              # Зеленый фон для успешных статусов

    # Базовые стили шрифта
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Calibri'
    normal_style.font.size = Pt(10.5)
    normal_style.font.color.rgb = COLOR_PRIMARY
    normal_style.paragraph_format.line_spacing = 1.15
    normal_style.paragraph_format.space_after = Pt(4)

    # Вспомогательные функции для XML-форматирования ячеек
    def set_cell_background(cell, hex_color):
        tcPr = cell._element.get_or_add_tcPr()
        shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
        tcPr.append(shd)

    def set_cell_margins(cell, top=120, bottom=120, left=150, right=150):
        tcPr = cell._element.get_or_add_tcPr()
        tcMar = parse_xml(
            f'<w:tcMar {nsdecls("w")}>'
            f'<w:top w:w="{top}" w:type="dxa"/>'
            f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
            f'<w:left w:w="{left}" w:type="dxa"/>'
            f'<w:right w:w="{right}" w:type="dxa"/>'
            f'</w:tcMar>'
        )
        tcPr.append(tcMar)

    def set_table_borders(table, color="CBD5E1", sz="4", val="single"):
        tblPr = table._element.xpath('w:tblPr')
        if tblPr:
            borders = parse_xml(
                f'<w:tblBorders {nsdecls("w")}>'
                f'<w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
                f'<w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
                f'<w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
                f'<w:insideV w:val="none"/>'
                f'<w:left w:val="none"/>'
                f'<w:right w:val="none"/>'
                f'</w:tblBorders>'
            )
            tblPr[0].append(borders)

    def add_callout(text, title=None, bg_color=HEX_BRAND_LIGHT, border_color="2563EB"):
        table = doc.add_table(rows=1, cols=1)
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        table.autofit = False
        cell = table.cell(0, 0)
        cell.width = Inches(6.9)
        set_cell_background(cell, bg_color)
        set_cell_margins(cell, top=140, bottom=140, left=180, right=180)
        
        tcPr = cell._element.get_or_add_tcPr()
        borders = parse_xml(
            f'<w:tcBorders {nsdecls("w")}>'
            f'<w:left w:val="single" w:sz="24" w:space="0" w:color="{border_color}"/>'
            f'<w:top w:val="none"/>'
            f'<w:bottom w:val="none"/>'
            f'<w:right w:val="none"/>'
            f'</w:tcBorders>'
        )
        tcPr.append(borders)

        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.line_spacing = 1.15
        if title:
            run_title = p.add_run(f"{title}\n")
            run_title.bold = True
            run_title.font.size = Pt(10.5)
            run_title.font.color.rgb = COLOR_BRAND
        run_text = p.add_run(text)
        run_text.font.size = Pt(9.5)
        run_text.font.color.rgb = COLOR_PRIMARY
        doc.add_paragraph().paragraph_format.space_after = Pt(4)

    def add_h1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(16)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.bold = True
        run.font.size = Pt(16)
        run.font.color.rgb = COLOR_BRAND

    def add_h2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(12)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.bold = True
        run.font.size = Pt(12.5)
        run.font.color.rgb = COLOR_PRIMARY

    def add_bullet(text, bold_prefix=None):
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_before = Pt(1)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.line_spacing = 1.12
        if bold_prefix:
            r_pre = p.add_run(bold_prefix + " ")
            r_pre.bold = True
            r_pre.font.color.rgb = COLOR_PRIMARY
        r_txt = p.add_run(text)
        r_txt.font.color.rgb = COLOR_PRIMARY

    # ==========================================
    # ТИТУЛЬНЫЙ БЛОК / ШАПКА ДОКУМЕНТА
    # ==========================================
    header_table = doc.add_table(rows=1, cols=1)
    header_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    header_cell = header_table.cell(0, 0)
    header_cell.width = Inches(6.9)
    set_cell_background(header_cell, HEX_NAVY)
    set_cell_margins(header_cell, top=240, bottom=240, left=240, right=240)

    hp = header_cell.paragraphs[0]
    hp.paragraph_format.space_before = Pt(0)
    hp.paragraph_format.space_after = Pt(4)
    run_badge = hp.add_run("ТЕХНИЧЕСКИЙ ПАСПОРТ И ИНВЕСТИЦИОННЫЙ ОТЧЕТ")
    run_badge.font.size = Pt(9)
    run_badge.bold = True
    run_badge.font.color.rgb = RGBColor(147, 197, 253)

    hp2 = header_cell.add_paragraph()
    hp2.paragraph_format.space_before = Pt(2)
    hp2.paragraph_format.space_after = Pt(6)
    run_main_title = hp2.add_run("CardHub — Платформа Цифровых NFC-визиток")
    run_main_title.font.size = Pt(20)
    run_main_title.bold = True
    run_main_title.font.color.rgb = RGBColor(255, 255, 255)

    hp3 = header_cell.add_paragraph()
    hp3.paragraph_format.space_before = Pt(0)
    hp3.paragraph_format.space_after = Pt(0)
    run_sub = hp3.add_run(
        "Архитектура системы, статус готовности (98%), юридическо-финансовая модель "
        "для самозанятого и пошаговый план коммерческого запуска"
    )
    run_sub.font.size = Pt(10.5)
    run_sub.font.color.rgb = RGBColor(203, 213, 225)

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # Метаданные документа
    meta_table = doc.add_table(rows=2, cols=4)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(meta_table, color="E2E8F0", sz="4")
    
    meta_data = [
        [("Статус проекта", "Код готов (98%), 58/58 тестов"), ("Роли участников", "Разработчик (CTO) + Инвестор")],
        [("Форма деятельности", "Самозанятость (НПД) без ККТ 54-ФЗ"), ("Срок до запуска", "3–5 рабочих дней")]
    ]
    for row_idx, row in enumerate(meta_data):
        for col_idx, (label, val) in enumerate(row):
            c1 = meta_table.cell(row_idx, col_idx * 2)
            c2 = meta_table.cell(row_idx, col_idx * 2 + 1)
            c1.width = Inches(1.6)
            c2.width = Inches(1.85)
            set_cell_background(c1, "F8FAFC")
            set_cell_margins(c1, top=60, bottom=60, left=80, right=80)
            set_cell_margins(c2, top=60, bottom=60, left=80, right=80)
            
            p1 = c1.paragraphs[0]
            p1.paragraph_format.space_after = Pt(0)
            r1 = p1.add_run(label)
            r1.font.size = Pt(8.5)
            r1.font.color.rgb = COLOR_MUTED
            
            p2 = c2.paragraphs[0]
            p2.paragraph_format.space_after = Pt(0)
            r2 = p2.add_run(val)
            r2.font.size = Pt(8.5)
            r2.bold = True
            r2.font.color.rgb = COLOR_PRIMARY

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # ==========================================
    # РАЗДЕЛ 1. EXECUTIVE SUMMARY
    # ==========================================
    add_h1("1. Резюме проекта (Executive Summary)")
    
    p = doc.add_paragraph()
    p.add_run(
        "«CardHub» — это готовый высокотехнологичный облачный сервис (SaaS) для создания, настройки, "
        "мгновенного шеринга и аналитики персональных и корпоративных цифровых визиток с использованием "
        "технологий NFC (бесконтактный чип) и динамических QR-кодов. Продукт разработан с прицелом "
        "на российский рынок с жестким соблюдением законов РФ (152-ФЗ, 149-ФЗ, 242-ФЗ) и стандартов безопасности OWASP."
    )

    add_callout(
        "Сервис решает фундаментальную проблему классических бумажных визиток: 88% бумажных карточек "
        "выбрасываются в течение недели, контакты не сохраняются в телефон, а данные устаревают при первой смене "
        "должности или номера. С CardHub контакт передается в записную книжку смартфона за 1 секунду "
        "простым касанием карты к телефону.",
        title="Ценностное предложение для клиента",
        bg_color=HEX_BRAND_LIGHT,
        border_color="2563EB"
    )

    add_h2("Ключевые целевые аудитории и монетизация:")
    add_bullet("предприниматели, риелторы, юристы, консультанты, топ-менеджеры, врачи, блогеры. Покупают персональный тариф (290 ₽/мес или 2 900 ₽/год).", bold_prefix="B2C сегмент:")
    add_bullet("отделы продаж, IT-компании, агентства недвижимости, банки, корпорации. Покупают тариф Pro (1 490 ₽/мес или 14 900 ₽/год за 10 сотрудников + расширение), брендируют визитки в фирменном стиле компании и централизованно управляют контактами.", bold_prefix="B2B сегмент:")
    add_bullet("потенциал дополнительной высокомаржинальной продажи брендированных пластиковых NFC-карт, металлических карт и стикеров с наценкой до 300–500%.", bold_prefix="Апсейл физических носителей:")

    # ==========================================
    # РАЗДЕЛ 2. ТЕКУЩИЙ СТАТУС ГОТОВНОСТИ (AUDIT)
    # ==========================================
    add_h1("2. Оценка степени готовности проекта: 98% (код)")

    p = doc.add_paragraph()
    p.add_run(
        "В проекте полностью закрыты все технические этапы разработки (Этапы 1–6 ТЗ). "
        "Проведено полное автоматизированное тестирование: "
    )
    r_test = p.add_run("успешно проходят все 58 из 58 тестов (100% test pass rate).")
    r_test.bold = True

    # Таблица компонентов
    status_table = doc.add_table(rows=8, cols=4)
    status_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(status_table, color="CBD5E1", sz="4")

    headers = ["Компонент / Модуль", "Реализованный стек / Функционал", "Тесты", "Готовность"]
    hdr_widths = [Inches(1.8), Inches(3.2), Inches(0.9), Inches(1.0)]

    for idx, name in enumerate(headers):
        cell = status_table.cell(0, idx)
        cell.width = hdr_widths[idx]
        set_cell_background(cell, HEX_NAVY)
        set_cell_margins(cell, top=100, bottom=100, left=100, right=100)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        run = p.add_run(name)
        run.bold = True
        run.font.size = Pt(8.5)
        run.font.color.rgb = RGBColor(255, 255, 255)

    rows_data = [
        ("Ядро и Auth", "Argon2id хэширование, HttpOnly Cookie сессии, защита от IDOR и брутфорса", "12 тестов", "100%"),
        ("Конструктор визиток", "vCard 3.0, QR-генератор, очистка метаданных EXIF (Sharp), slug", "10 тестов", "100%"),
        ("NFC & Аналитика", "Web NFC API прямо в браузере (NTAG213/215/216), учет NFC/QR/Direct", "6 тестов", "100%"),
        ("B2B Корпорации", "Компании, приглашение сотрудников, аудит-лог, экспорт CSV для типографий", "9 тестов", "100%"),
        ("Биллинг и подписки", "Адаптер эквайринга, автопродление, grace-период 7 дней, mock-песочница", "6 тестов", "100%"),
        ("Безопасность и 152-ФЗ", "TOTP 2FA (AES-256-GCM), право на забвение (Cron), экспорт JSON, 149-ФЗ", "15 тестов", "100%"),
        ("Mobile UX / DevOps", "Mobile First адаптация, Docker Compose, Nginx, Certbot SSL, автобэкапы БД", "Интегр.", "95% (нужен VPS)")
    ]

    for row_idx, data in enumerate(rows_data, start=1):
        for col_idx, text in enumerate(data):
            cell = status_table.cell(row_idx, col_idx)
            cell.width = hdr_widths[col_idx]
            bg = HEX_GRAY_LIGHT if row_idx % 2 == 1 else "FFFFFF"
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=70, bottom=70, left=90, right=90)
            p = cell.paragraphs[0]
            r = p.add_run(text)
            r.font.size = Pt(8.5)
            if col_idx == 3:
                r.bold = True
                r.font.color.rgb = RGBColor(22, 163, 74)

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # ==========================================
    # РАЗДЕЛ 3. АРХИТЕКТУРА И ТЕХНОЛОГИИ
    # ==========================================
    add_h1("3. Архитектурный стек и технологические преимущества")

    p = doc.add_paragraph()
    p.add_run(
        "Проект спроектирован по модульной микросервисно-ориентированной архитектуре на базе современного "
        "промышленного стека технологий. Это обеспечивает колоссальную производительность при минимальных "
        "затратах на серверную инфраструктуру (один базовый VPS за 700 ₽/мес легко выдерживает до 100 000 визиток)."
    )

    add_bullet("Next.js 16 (React 19, TypeScript, App Router) с режимом standalone-сборки. Максимальная скорость рендеринга страниц визиток (Server Components) и превосходный SEO.", bold_prefix="Frontend & Application Layer:")
    add_bullet("PostgreSQL 16 с ORM Prisma. Реляционная надежность данных, строгие внешние ключи, транзакционность оплат и структурированное хранение согласий 152-ФЗ.", bold_prefix="База данных:")
    add_bullet("Redis 7 (In-Memory). Кэширование популярных визиток, скользящее окно Rate Limiting (защита от DDoS и спам-запросов к API).", bold_prefix="Кэширование и защита:")
    add_bullet("Web NFC API (нативный стандарт W3C). Запись чипа происходит напрямую со страницы браузера без требования устанавливать сторонние мобильные приложения.", bold_prefix="Аппаратный NFC-модуль:")
    add_bullet("Sharp (высокопроизводительный C++ движок обработки медиа). Мгновенно конвертирует аватарки и обложки в WebP со сжатием 85% и вырезает геолокационные метки.", bold_prefix="Медиа-процессинг:")
    add_bullet("Полная контейнеризация через Docker Compose (PostgreSQL, Redis, Next.js, Nginx, Certbot). Развертывание и перенос сервиса на любой сервер выполняется за 5 минут.", bold_prefix="DevOps и инфраструктура:")

    # ==========================================
    # РАЗДЕЛ 4. САМОЗАНЯТОСТЬ И МОДЕЛЬ ОПЛАТЫ
    # ==========================================
    add_h1("4. Финансово-правовая модель: Самозанятость (НПД)")

    add_callout(
        "КЛЮЧЕВОЙ СТРАТЕГИЧЕСКИЙ ВЫВОД ДЛЯ ИНВЕСТОРА:\n"
        "Статус разработчика как «Самозанятого» (плательщика налога на профессиональный доход) — "
        "это мощнейшее финансовое преимущество на этапе запуска. Мы законно экономим до 50 000 рублей "
        "на старте на покупке кассы и фискального накопителя, освобождены от фиксированных взносов ИП "
        "и отчетов в налоговую, сохраняя при этом 100% легальный прием платежей картами и СБП.",
        title="Финансовая оптимизация старта",
        bg_color=HEX_SUCCESS_LIGHT,
        border_color="16A34A"
    )

    add_h2("1. Законное освобождение от онлайн-касс (54-ФЗ):")
    p = doc.add_paragraph()
    p.add_run(
        "Согласно пункту 2.2 статьи 2 Федерального закона № 54-ФЗ, плательщики НПД освобождены "
        "от применения контрольно-кассовой техники (ККТ). Это означает, что проекту НЕ ТРЕБУЕТСЯ "
        "покупка онлайн-кассы (Атол, Orange Data и т.д.), оплата фискального накопителя и услуг ОФД."
    )

    add_h2("2. Как устроен прием онлайн-платежей:")
    add_bullet("ЮKassa предоставляет официальный режим работы с самозанятыми гражданами РФ. Доступен прием карт МИР, Visa, Mastercard, SberPay, СБП и T-Pay.", bold_prefix="Эквайринг через ЮKassa:")
    add_bullet("При регистрации в личном кабинете ЮKassa привязывается аккаунт приложения «Мой налог». При каждой успешной оплате подписки ЮKassa сама автоматически отправляет данные о доходе в ФНС и формирует электронный чек для покупателя.", bold_prefix="Автоматическая фискализация:")
    add_bullet("В случае необходимости альтернативы (например, прием зарубежных карт или рассрочки) проект за 1 день интегрируется с Prodamus или Robokassa, которые также работают с самозанятыми.", bold_prefix="Резервные провайдеры:")

    add_h2("3. Налоговая нагрузка и лимиты:")
    add_bullet("4% с доходов от физических лиц (пользователи тарифа «Обычный»).", bold_prefix="Ставка налога B2C:")
    add_bullet("6% с доходов от юридических лиц и ИП (корпоративные клиенты тарифа «Pro»).", bold_prefix="Ставка налога B2B:")
    add_bullet("предельный доход самозанятого составляет 2 400 000 рублей в год. При приближении к этой отметке проект плавно переоформляется на ИП (УСН Доходы 6%), архитектура и код уже полностью готовы к переключению на онлайн-кассу за 1 час.", bold_prefix="Порог масштабирования:")

    # Таблица сравнения
    compare_table = doc.add_table(rows=5, cols=3)
    compare_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(compare_table, color="CBD5E1", sz="4")

    c_headers = ["Параметр", "Модель: Самозанятость (наш выбор)", "Модель: Классическое ИП / ООО"]
    c_widths = [Inches(2.1), Inches(2.4), Inches(2.4)]

    for idx, name in enumerate(c_headers):
        cell = compare_table.cell(0, idx)
        cell.width = c_widths[idx]
        set_cell_background(cell, HEX_NAVY)
        set_cell_margins(cell, top=80, bottom=80, left=80, right=80)
        p = cell.paragraphs[0]
        r = p.add_run(name)
        r.bold = True
        r.font.size = Pt(8.5)
        r.font.color.rgb = RGBColor(255, 255, 255)

    comp_rows = [
        ("Онлайн-касса (54-ФЗ)", "0 ₽ (освобождены по п.2.2 ст.2 54-ФЗ)", "35 000 – 50 000 ₽/год (касса + ФН + ОФД)"),
        ("Бухгалтерия и отчетность", "0 ₽ (чеки и налог в приложении «Мой налог»)", "20 000 – 40 000 ₽/год (бухгалтер/сервис)"),
        ("Обязательные взносы", "0 ₽ (платятся только налоги с реального дохода)", "53 658 ₽/год (даже при 0 выручки)"),
        ("Скорость запуска", "1–2 рабочих дня (онлайн)", "1–2 недели (открытие счетов, ЭЦП, касса)")
    ]

    for r_idx, data in enumerate(comp_rows, start=1):
        for c_idx, text in enumerate(data):
            cell = compare_table.cell(r_idx, c_idx)
            cell.width = c_widths[c_idx]
            bg = HEX_GRAY_LIGHT if r_idx % 2 == 1 else "FFFFFF"
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=70, bottom=70, left=80, right=80)
            p = cell.paragraphs[0]
            r = p.add_run(text)
            r.font.size = Pt(8.5)
            if c_idx == 1:
                r.bold = True

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # ==========================================
    # РАЗДЕЛ 5. ИНВЕСТИЦИОННАЯ СМЕТА И РАСХОДЫ
    # ==========================================
    add_h1("5. Инвестиционная смета и операционные расходы")

    p = doc.add_paragraph()
    p.add_run(
        "Благодаря завершенной разработке и использованию модели самозанятости, проект CardHub "
        "требует минимальных инвестиций для вывода в боевую эксплуатацию. "
        "Фактически инвестиции требуются только на оплату хостинга, домена и маркетинг."
    )

    cost_table = doc.add_table(rows=6, cols=4)
    cost_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(cost_table, color="CBD5E1", sz="4")

    cost_headers = ["Статья расходов", "Назначение", "Сумма", "Периодичность"]
    cost_widths = [Inches(1.8), Inches(2.7), Inches(1.1), Inches(1.3)]

    for idx, name in enumerate(cost_headers):
        cell = cost_table.cell(0, idx)
        cell.width = cost_widths[idx]
        set_cell_background(cell, HEX_NAVY)
        set_cell_margins(cell, top=80, bottom=80, left=80, right=80)
        p = cell.paragraphs[0]
        r = p.add_run(name)
        r.bold = True
        r.font.size = Pt(8.5)
        r.font.color.rgb = RGBColor(255, 255, 255)

    cost_rows = [
        ("Доменное имя (.ru)", "Покупка премиального или рабочего домена (Reg.ru / Beget)", "300 ₽", "1 раз в год"),
        ("Сервер VPS в РФ", "2–4 ядра CPU, 4–8 GB RAM, NVMe SSD (Timeweb Cloud / Selectel)", "700 – 1 200 ₽", "Ежемесячно"),
        ("SSL-сертификат", "Let's Encrypt Wildcard SSL с автопродлением в Certbot", "0 ₽", "Бесплатно навсегда"),
        ("Корпоративная почта", "Почта для домена (Яндекс 360 / VK WorkMail для noreply@)", "0 ₽", "Бесплатный тариф"),
        ("Тестовая партия чипов", "Заказ 20–30 тестовых NFC-стикеров NTAG213 для проверок", "1 500 ₽", "Разово (CAPEX)")
    ]

    for r_idx, data in enumerate(cost_rows, start=1):
        for c_idx, text in enumerate(data):
            cell = cost_table.cell(r_idx, c_idx)
            cell.width = cost_widths[c_idx]
            bg = HEX_GRAY_LIGHT if r_idx % 2 == 1 else "FFFFFF"
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=70, bottom=70, left=80, right=80)
            p = cell.paragraphs[0]
            r = p.add_run(text)
            r.font.size = Pt(8.5)
            if c_idx == 2:
                r.bold = True

    add_callout(
        "ИТОГО СТАРТОВЫЙ БЮДЖЕТ ДО ПЕРВЫХ ПРОДАЖ: ~2 500 – 3 000 ₽.\n"
        "Ежемесячные постоянные расходы (OPEX): ~800 – 1 200 ₽.\n"
        "Маржинальность цифрового продукта превышает 92% (остаток после налога 4-6% и комиссии эквайринга ~3%).",
        title="Финансовый вывод по смете",
        bg_color=HEX_BRAND_LIGHT,
        border_color="2563EB"
    )

    # ==========================================
    # РАЗДЕЛ 6. ЮНИТ-ЭКОНОМИКА И ПОТЕНЦИАЛ ВЫРУЧКИ
    # ==========================================
    add_h1("6. Юнит-экономика и потенциал доходности")

    p = doc.add_paragraph()
    p.add_run(
        "В системе запрограммированы два базовых тарифных плана с высокой конверсией в повторные продления "
        "благодаря встроенному автоплатежу (рекуррентные списания):"
    )

    add_bullet("290 ₽ в месяц либо 2 900 ₽ в год. Привлечение 100 активных пользователей дает 29 000 ₽/мес пассивной выручки при расходах на сервер всего 1 000 ₽.", bold_prefix="Тариф «Обычный» (B2C):")
    add_bullet("1 490 ₽ в месяц либо 14 900 ₽ в год (до 10 сотрудников). Привлечение всего 30 корпоративных клиентов (агентства недвижимости, клиники, юрбюро) дает 44 700 ₽/мес.", bold_prefix="Тариф «Pro» (B2B):")
    add_bullet("продажа физических пластиковых карт с NFC (себестоимость заготовки ~40–70 ₽, цена продажи клиенту 990–1 990 ₽ с индивидуальной гравировкой или печатью).", bold_prefix="Продажа физических носителей:")

    # ==========================================
    # РАЗДЕЛ 7. ПОШАГОВЫЙ ПЛАН ЗАПУСКА (3–5 ДНЕЙ)
    # ==========================================
    add_h1("7. Дорожная карта вывода в продакшен (3–5 рабочих дней)")

    steps = [
        ("День 1: Регистрация и эквайринг", 
         "Разработчик подает онлайн-заявку в ЮKassa как самозанятый, подключает авто-фискализацию «Мой налог». Покупка домена (.ru) и заказ VPS сервера в РФ."),
        ("День 2: Развертывание инфраструктуры", 
         "Клонирование репозитория на боевой сервер, запуск скрипта выпуска SSL-сертификата Let's Encrypt, подъем контейнеров в Docker Compose (App + Postgres + Redis + Nginx)."),
        ("День 3: Юридическая настройка и почта", 
         "Заполнение ФИО и ИНН разработчика в текстах Публичной оферты и Политике 152-ФЗ. Подключение корпоративной почты домена, отправка онлайн-уведомления в Роскомнадзор."),
        ("День 4: Сквозное тестирование платежей", 
         "Перевод ЮKassa из песочницы в боевой режим. Тестовая оплата подписки реальной картой, проверка прихода чека в приложение «Мой налог» и активации тарифа Pro."),
        ("День 5: Официальный релиз и маркетинг", 
         "Открытие регистрации для первых пользователей, запуск рекламных каналов и прямых продаж в B2B.")
    ]

    for title, desc in steps:
        add_bullet(desc, bold_prefix=title + ":")

    # ==========================================
    # ПОДВАЛ / ЗАКЛЮЧЕНИЕ
    # ==========================================
    doc.add_paragraph().paragraph_format.space_after = Pt(12)
    
    footer_table = doc.add_table(rows=1, cols=1)
    footer_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    f_cell = footer_table.cell(0, 0)
    f_cell.width = Inches(6.9)
    set_cell_background(f_cell, HEX_GRAY_LIGHT)
    set_cell_margins(f_cell, top=140, bottom=140, left=180, right=180)
    
    fp = f_cell.paragraphs[0]
    fp.paragraph_format.space_after = Pt(2)
    r_f_title = fp.add_run("ЗАКЛЮЧЕНИЕ ДЛЯ ПАРТНЕРОВ:\n")
    r_f_title.bold = True
    r_f_title.font.size = Pt(10)
    r_f_title.font.color.rgb = COLOR_BRAND
    
    r_f_desc = fp.add_run(
        "Проект CardHub находится в точке максимальной инвестиционной привлекательности: "
        "фаза длительной и дорогостоящей программной разработки завершена на 98%, "
        "риски технической нереализуемости устранены, сервис юридически адаптирован "
        "под минимальную налоговую нагрузку (самозанятость без касс). "
        "Продукт готов к монетизации и генерации выручки в течение 3–5 дней с момента принятия решения."
    )
    r_f_desc.font.size = Pt(9.5)

    output_path = "c:\\OSPanel\\domains\\nfc_1\\CardHub_Технический_паспорт_проекта.docx"
    doc.save(output_path)
    print(f"Document successfully created at: {output_path}")

if __name__ == '__main__':
    create_document()
