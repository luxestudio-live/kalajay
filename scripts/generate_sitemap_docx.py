import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn
from xml.sax.saxutils import escape
import os

def set_cell_background(cell, hex_color):
    """Sets the background color of a table cell."""
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=120, bottom=120, left=150, right=150):
    """Sets inner padding for a table cell (in twips, 20 twips = 1 pt)."""
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(
        f'<w:tcMar {nsdecls("w")}>'
        f'<w:top w:w="{top}" w:type="dxa"/>'
        f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
        f'<w:left w:w="{left}" w:type="dxa"/>'
        f'<w:right w:w="{right}" w:type="dxa"/>'
        f'</w:tcMar>'
    )
    tcPr.append(tcMar)

def add_hyperlink(paragraph, url, text, color="8C3A38", underline=True, bold=False):
    """Adds a clickable external hyperlink to a python-docx paragraph."""
    part = paragraph.part
    r_id = part.relate_to(url, docx.opc.constants.RELATIONSHIP_TYPE.HYPERLINK, is_external=True)

    hyperlink = parse_xml(
        f'<w:hyperlink {nsdecls("w")} r:id="{r_id}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/>'
    )
    new_run = parse_xml(f'<w:r {nsdecls("w")}/>')
    rPr = parse_xml(f'<w:rPr {nsdecls("w")}/>')

    if color:
        c = parse_xml(f'<w:color {nsdecls("w")} w:val="{color}"/>')
        rPr.append(c)
    if underline:
        u = parse_xml(f'<w:u {nsdecls("w")} w:val="single"/>')
        rPr.append(u)
    if bold:
        b = parse_xml(f'<w:b {nsdecls("w")}/>')
        rPr.append(b)

    new_run.append(rPr)
    text_node = parse_xml(f'<w:t {nsdecls("w")}>{escape(text)}</w:t>')
    new_run.append(text_node)
    hyperlink.append(new_run)
    paragraph._p.append(hyperlink)
    return hyperlink

def create_document():
    doc = Document()

    # Set page margins (0.75 in all sides for clean layout)
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(0.75)
        section.bottom_margin = Inches(0.75)
        section.left_margin = Inches(0.75)
        section.right_margin = Inches(0.75)

    # Set default font style
    style = doc.styles['Normal']
    font = style.font
    font.name = 'Calibri'
    font.size = Pt(10.5)
    font.color.rgb = RGBColor(0x1A, 0x17, 0x15) # Warm ink

    # -------------------------------------------------------------
    # HEADER / COVER TITLE SECTION
    # -------------------------------------------------------------
    p_meta = doc.add_paragraph()
    p_meta.paragraph_format.space_before = Pt(0)
    p_meta.paragraph_format.space_after = Pt(4)
    run_meta = p_meta.add_run("THE LUXE STUDIO · CLIENT HANDOVER DELIVERABLE")
    run_meta.font.size = Pt(8.5)
    run_meta.font.bold = True
    run_meta.font.color.rgb = RGBColor(0x9E, 0x67, 0x20) # Ochre/Gold

    p_title = doc.add_paragraph()
    p_title.paragraph_format.space_before = Pt(2)
    p_title.paragraph_format.space_after = Pt(2)
    run_title = p_title.add_run("Kalajay Handcrafted")
    run_title.font.name = 'Georgia'
    run_title.font.size = Pt(24)
    run_title.font.bold = True
    run_title.font.color.rgb = RGBColor(0x1A, 0x17, 0x15)

    p_subtitle = doc.add_paragraph()
    p_subtitle.paragraph_format.space_before = Pt(0)
    p_subtitle.paragraph_format.space_after = Pt(14)
    run_sub = p_subtitle.add_run("Complete Website URL & Master Sitemap Directory")
    run_sub.font.size = Pt(13)
    run_sub.font.color.rgb = RGBColor(0x8C, 0x3A, 0x38) # Rosewood accent

    # Summary Callout Box
    table_callout = doc.add_table(rows=1, cols=1)
    table_callout.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = table_callout.cell(0, 0)
    set_cell_background(cell, "F9F6F0") # Champagne subtle fill
    set_cell_margins(cell, top=140, bottom=140, left=180, right=180)

    p_callout = cell.paragraphs[0]
    p_callout.paragraph_format.space_before = Pt(0)
    p_callout.paragraph_format.space_after = Pt(4)
    r1 = p_callout.add_run("Primary Canonical Domain: ")
    r1.bold = True
    r1.font.size = Pt(10)
    add_hyperlink(p_callout, "https://kalajay.theluxestudio.in", "https://kalajay.theluxestudio.in", color="8C3A38", bold=True)

    p_callout2 = cell.add_paragraph()
    p_callout2.paragraph_format.space_before = Pt(2)
    p_callout2.paragraph_format.space_after = Pt(0)
    r2 = p_callout2.add_run("AWS Amplify CloudFront Host: ")
    r2.bold = True
    r2.font.size = Pt(9.5)
    add_hyperlink(p_callout2, "https://main.d1fnh1ysikb7wo.amplifyapp.com", "https://main.d1fnh1ysikb7wo.amplifyapp.com", color="1A56DB")

    p_callout3 = cell.add_paragraph()
    p_callout3.paragraph_format.space_before = Pt(2)
    p_callout3.paragraph_format.space_after = Pt(0)
    r3 = p_callout3.add_run("GitHub Source Repository: ")
    r3.bold = True
    r3.font.size = Pt(9.5)
    add_hyperlink(p_callout3, "https://github.com/luxestudio-live/kalajay", "https://github.com/luxestudio-live/kalajay", color="1A56DB")

    doc.add_paragraph().paragraph_format.space_after = Pt(10)

    # -------------------------------------------------------------
    # SECTION 1: QUICK REFERENCE LIST (USER'S REQUESTED FORMAT)
    # -------------------------------------------------------------
    h1 = doc.add_paragraph()
    h1.paragraph_format.space_before = Pt(14)
    h1.paragraph_format.space_after = Pt(6)
    run_h1 = h1.add_run("1. Quick Reference Link List")
    run_h1.font.name = 'Georgia'
    run_h1.font.size = Pt(14)
    run_h1.font.bold = True
    run_h1.font.color.rgb = RGBColor(0x1A, 0x17, 0x15)

    p_desc1 = doc.add_paragraph()
    p_desc1.paragraph_format.space_after = Pt(8)
    p_desc1.add_run("Use this clean, direct list to quickly copy and share links across marketing, client conversations, WhatsApp, or social profiles:")

    quick_links = [
        ("Home Page", "https://kalajay.theluxestudio.in", "The flagship immersive landing page with video cover, artisan narrative, and curated rails"),
        ("All Products / Shop", "https://kalajay.theluxestudio.in/shop", "Full handcrafted product catalogue with multi-facet filters, sorting, and live search"),
        ("Our Story", "https://kalajay.theluxestudio.in/story", "The brand chronicle, philosophy, material poetry, and founding vision"),
        ("The Craft House (The Making)", "https://kalajay.theluxestudio.in/atelier", "Interactive craft house chronicle featuring Bihar & Mumbai artisan coordinates and techniques"),
        ("Bespoke Customisation Studio", "https://kalajay.theluxestudio.in/customise", "Interactive bespoke bag and organiser customizer with live preview and direct WhatsApp handover"),
        ("Gifting Concierge", "https://kalajay.theluxestudio.in/gifting", "Curated gifting experiences for weddings, anniversaries, birthdays, and festive celebrations"),
        ("Corporate & Bulk Gifting", "https://kalajay.theluxestudio.in/corporate-gifting", "B2B bespoke catalogue and quotation inquiry for luxury corporate milestones"),
        ("Shopping Bag / Cart", "https://kalajay.theluxestudio.in/cart", "Interactive slide-over cart and full cart review page with complimentary shipping progress bar"),
        ("Secure Checkout", "https://kalajay.theluxestudio.in/checkout", "Full checkout with address management, gift notes, and multi-gateway payment triggers"),
        ("Patron Sign In", "https://kalajay.theluxestudio.in/login", "Instant mobile OTP and email authentication with 1-click evaluation access"),
        ("Patron Register / Join Circle", "https://kalajay.theluxestudio.in/signup", "VIP patron onboarding with ₹300 welcome gift code unlock"),
        ("Patron Account Dashboard", "https://kalajay.theluxestudio.in/account", "Customer profile, saved addresses, membership tier status, and preferences"),
        ("Order History", "https://kalajay.theluxestudio.in/account/orders", "Comprehensive log of past orders, item breakdown, and delivery status"),
        ("Live Order Tracking", "https://kalajay.theluxestudio.in/track", "Real-time dispatch tracking and milestone timeline for patrons"),
        ("Curated Wishlist", "https://kalajay.theluxestudio.in/wishlist", "Saved patron wishlist and favorite handcrafted objects"),
        ("Contact & Craft House Visits", "https://kalajay.theluxestudio.in/contact", "Direct WhatsApp concierge, phone, email, and craft house visit appointments"),
        ("Frequently Asked Questions", "https://kalajay.theluxestudio.in/faq", "Comprehensive FAQ covering craftsmanship, bead care, shipping, and custom orders"),
        ("Shipping & Returns Policy", "https://kalajay.theluxestudio.in/shipping-returns", "Dispatch timelines, pan-India courier partners, and exchange policy"),
        ("Privacy Policy", "https://kalajay.theluxestudio.in/privacy", "Customer data protection, cookie policy, and transaction privacy compliance"),
        ("Terms & Conditions", "https://kalajay.theluxestudio.in/terms", "E-commerce terms of service, artisan handmade tolerances, and intellectual property"),
    ]

    for label, url, desc in quick_links:
        p_item = doc.add_paragraph()
        p_item.paragraph_format.space_before = Pt(2)
        p_item.paragraph_format.space_after = Pt(3)
        p_item.paragraph_format.left_indent = Inches(0.2)

        r_bullet = p_item.add_run("•  ")
        r_bullet.bold = True
        r_bullet.font.color.rgb = RGBColor(0x9E, 0x67, 0x20)

        r_label = p_item.add_run(f"{label}: ")
        r_label.bold = True
        r_label.font.color.rgb = RGBColor(0x1A, 0x17, 0x15)

        add_hyperlink(p_item, url, url.replace("https://", ""), color="8C3A38", underline=True)

    # -------------------------------------------------------------
    # SECTION 2: CURATED PRODUCT COLLECTIONS
    # -------------------------------------------------------------
    h2 = doc.add_paragraph()
    h2.paragraph_format.space_before = Pt(16)
    h2.paragraph_format.space_after = Pt(6)
    run_h2 = h2.add_run("2. Curated Product Collection Category Links")
    run_h2.font.name = 'Georgia'
    run_h2.font.size = Pt(14)
    run_h2.font.bold = True
    run_h2.font.color.rgb = RGBColor(0x1A, 0x17, 0x15)

    p_desc2 = doc.add_paragraph()
    p_desc2.paragraph_format.space_after = Pt(8)
    p_desc2.add_run("Direct category landing pages for each of the 9 signature Kalajay product collections:")

    collections = [
        ("Desk Organisers & Trays", "https://kalajay.theluxestudio.in/collections/organisers", "Pearl-beaded boxes & vanity trays for jewellery and everyday essentials"),
        ("Evening Bags & Purses", "https://kalajay.theluxestudio.in/collections/purses", "Sculptural evening clutches and statement handheld purses constructed from faceted crystals"),
        ("Crossbody & Sling Bags", "https://kalajay.theluxestudio.in/collections/slings", "Colourful beaded sling bags with long handle straps for effortless daytime statement wear"),
        ("AirPod & Tech Cases", "https://kalajay.theluxestudio.in/collections/airpod-cases", "Snug pearl-beaded protective cases elevating daily technology into jewellery"),
        ("Table Mats & Coasters", "https://kalajay.theluxestudio.in/collections/coasters-mats", "Intricate glass bead and pearl dining table coasters, trivets, and placemats"),
        ("Candle Holders & Lanterns", "https://kalajay.theluxestudio.in/collections/candle-holders", "Prismatic beaded candle holders engineered for dramatic ambient evening lighting"),
        ("Charms & Key Rings", "https://kalajay.theluxestudio.in/collections/key-rings", "Handcrafted talisman bag charms, keychains, and miniature beaded accents"),
        ("Crochet Magic", "https://kalajay.theluxestudio.in/collections/crochet-magic", "Hand-knit artisanal crochet bags and textural yarn & bead silhouettes"),
        ("Little Treasures", "https://kalajay.theluxestudio.in/collections/little-treasures", "Curated pocket gems, miniature coin pouches, and intimate giftable trinkets"),
    ]

    for label, url, desc in collections:
        p_item = doc.add_paragraph()
        p_item.paragraph_format.space_before = Pt(2)
        p_item.paragraph_format.space_after = Pt(3)
        p_item.paragraph_format.left_indent = Inches(0.2)

        r_bullet = p_item.add_run("•  ")
        r_bullet.bold = True
        r_bullet.font.color.rgb = RGBColor(0x9E, 0x67, 0x20)

        r_label = p_item.add_run(f"{label}: ")
        r_label.bold = True
        r_label.font.color.rgb = RGBColor(0x1A, 0x17, 0x15)

        add_hyperlink(p_item, url, url.replace("https://", ""), color="8C3A38", underline=True)

    # -------------------------------------------------------------
    # SECTION 3: COMPREHENSIVE DIRECTORY TABLE
    # -------------------------------------------------------------
    h3 = doc.add_paragraph()
    h3.paragraph_format.space_before = Pt(18)
    h3.paragraph_format.space_after = Pt(6)
    run_h3 = h3.add_run("3. Master Page Directory Table")
    run_h3.font.name = 'Georgia'
    run_h3.font.size = Pt(14)
    run_h3.font.bold = True
    run_h3.font.color.rgb = RGBColor(0x1A, 0x17, 0x15)

    p_desc3 = doc.add_paragraph()
    p_desc3.paragraph_format.space_after = Pt(8)
    p_desc3.add_run("Detailed structured reference including section category, page title, live hyperlink, and core purpose:")

    # Define all rows
    table_data = [
        # (Category, Page Name, URL, Description)
        ("Core Brand", "Home Page", "https://kalajay.theluxestudio.in/", "Flagship hero, artisan reels, bestsellers rail, and world narrative"),
        ("Core Brand", "Shop (All Products)", "https://kalajay.theluxestudio.in/shop/", "Full 20-product catalogue with filters, sorting, and pagination"),
        ("Core Brand", "Our Story", "https://kalajay.theluxestudio.in/story/", "Brand chronicle, artisan manifesto, and material standards"),
        ("Core Brand", "The Craft House", "https://kalajay.theluxestudio.in/atelier/", "Making process, Bihar & Mumbai craft houses, and artisan profiles"),
        ("Core Brand", "Customisation Studio", "https://kalajay.theluxestudio.in/customise/", "Interactive bespoke builder with bead selection and WhatsApp handoff"),
        ("Core Brand", "Gifting Concierge", "https://kalajay.theluxestudio.in/gifting/", "Occasion-based gifting curation, custom packaging, and gift cards"),
        ("Core Brand", "Corporate Gifting", "https://kalajay.theluxestudio.in/corporate-gifting/", "B2B bulk orders, custom branding, and corporate lead submission form"),

        ("Collections", "Organisers & Trays", "https://kalajay.theluxestudio.in/collections/organisers/", "Handcrafted pearl vanity boxes and desk trays"),
        ("Collections", "Purses & Clutches", "https://kalajay.theluxestudio.in/collections/purses/", "Evening clutches and statement handheld purses"),
        ("Collections", "Crossbody Slings", "https://kalajay.theluxestudio.in/collections/slings/", "Colourful beaded sling bags with long handles"),
        ("Collections", "Airpod Cases", "https://kalajay.theluxestudio.in/collections/airpod-cases/", "Pearl-beaded luxury covers for AirPods"),
        ("Collections", "Coasters & Mats", "https://kalajay.theluxestudio.in/collections/coasters-mats/", "Table mats, coasters, and festive dining accessories"),
        ("Collections", "Candle Holders", "https://kalajay.theluxestudio.in/collections/candle-holders/", "Beaded ambient candle holders and lanterns"),
        ("Collections", "Key Rings & Charms", "https://kalajay.theluxestudio.in/collections/key-rings/", "Artisanal charms, bag accessories, and keychains"),
        ("Collections", "Crochet Magic", "https://kalajay.theluxestudio.in/collections/crochet-magic/", "Handmade crochet bags and textural yarn creations"),
        ("Collections", "Little Treasures", "https://kalajay.theluxestudio.in/collections/little-treasures/", "Miniature accents, coin purses, and pocket treasures"),

        ("Commerce", "Shopping Cart", "https://kalajay.theluxestudio.in/cart/", "Cart drawer & dedicated page with free delivery progress meter"),
        ("Commerce", "Checkout Flow", "https://kalajay.theluxestudio.in/checkout/", "3-step checkout with address validation and gift wrap option"),
        ("Commerce", "Patron Sign In", "https://kalajay.theluxestudio.in/login/", "Instant 6-digit mobile OTP & email login with 1-click demo"),
        ("Commerce", "Patron Register", "https://kalajay.theluxestudio.in/signup/", "New customer sign-up with birthday rewards and ₹300 coupon"),
        ("Commerce", "Account Dashboard", "https://kalajay.theluxestudio.in/account/", "Patron profile, tiers, saved addresses, and active orders"),
        ("Commerce", "Order History", "https://kalajay.theluxestudio.in/account/orders/", "Past order tracking, invoices, and reorder shortcuts"),
        ("Commerce", "Order Tracking", "https://kalajay.theluxestudio.in/track/", "Live consignment tracking with visual milestone timeline"),
        ("Commerce", "Wishlist", "https://kalajay.theluxestudio.in/wishlist/", "Saved customer favorites with 1-click add to cart"),

        ("Client Care", "Contact & Visits", "https://kalajay.theluxestudio.in/contact/", "Concierge WhatsApp, contact inquiry form, and visit booking"),
        ("Client Care", "FAQ", "https://kalajay.theluxestudio.in/faq/", "Complete answers on materials, ordering, custom work, and care"),
        ("Client Care", "Shipping & Returns", "https://kalajay.theluxestudio.in/shipping-returns/", "Pan-India delivery times, courier partners, and replacement terms"),
        ("Client Care", "Privacy Policy", "https://kalajay.theluxestudio.in/privacy/", "Data privacy, transaction security, and customer rights"),
        ("Client Care", "Terms & Conditions", "https://kalajay.theluxestudio.in/terms/", "Legal sales terms, artisan tolerances, and copyright"),
        ("Client Care", "Custom 404 Page", "https://kalajay.theluxestudio.in/404", "Polished luxury error recovery page with quick route shortcuts"),
    ]

    # Create Table
    table = doc.add_table(rows=len(table_data) + 1, cols=4)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False

    # Widths: Category (1.0 in), Page (1.4 in), Link (2.3 in), Purpose (2.3 in) = 7.0 in total
    col_widths = [Inches(1.0), Inches(1.3), Inches(2.2), Inches(2.5)]

    # Header Row
    headers = ["Category", "Page Name", "Live URL", "Purpose & Experience"]
    hdr_cells = table.rows[0].cells
    for i, title in enumerate(headers):
        hdr_cells[i].width = col_widths[i]
        set_cell_background(hdr_cells[i], "1A1715") # Dark Ink
        set_cell_margins(hdr_cells[i], top=120, bottom=120, left=140, right=140)
        p = hdr_cells[i].paragraphs[0]
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(title)
        r.bold = True
        r.font.size = Pt(9)
        r.font.color.rgb = RGBColor(0xFA, 0xF8, 0xF5)

    # Populate Data
    for row_idx, (cat, name, url, desc) in enumerate(table_data, start=1):
        row_cells = table.rows[row_idx].cells
        bg_color = "FFFFFF" if row_idx % 2 != 0 else "FAF8F5"

        for c_idx in range(4):
            row_cells[c_idx].width = col_widths[c_idx]
            set_cell_background(row_cells[c_idx], bg_color)
            set_cell_margins(row_cells[c_idx], top=90, bottom=90, left=120, right=120)

        # Category
        p0 = row_cells[0].paragraphs[0]
        p0.paragraph_format.space_before = Pt(0)
        p0.paragraph_format.space_after = Pt(0)
        r_cat = p0.add_run(cat)
        r_cat.font.size = Pt(8.5)
        r_cat.font.bold = True
        r_cat.font.color.rgb = RGBColor(0x9E, 0x67, 0x20)

        # Page Name
        p1 = row_cells[1].paragraphs[0]
        p1.paragraph_format.space_before = Pt(0)
        p1.paragraph_format.space_after = Pt(0)
        r_name = p1.add_run(name)
        r_name.font.size = Pt(8.5)
        r_name.font.bold = True
        r_name.font.color.rgb = RGBColor(0x1A, 0x17, 0x15)

        # Live URL (Hyperlink)
        p2 = row_cells[2].paragraphs[0]
        p2.paragraph_format.space_before = Pt(0)
        p2.paragraph_format.space_after = Pt(0)
        display_url = url.replace("https://kalajay.theluxestudio.in", "") or "/"
        add_hyperlink(p2, url, f"kalajay.theluxestudio.in{display_url}", color="8C3A38", underline=True)
        for r in p2.runs:
            r.font.size = Pt(8)

        # Purpose & Description
        p3 = row_cells[3].paragraphs[0]
        p3.paragraph_format.space_before = Pt(0)
        p3.paragraph_format.space_after = Pt(0)
        r_desc = p3.add_run(desc)
        r_desc.font.size = Pt(8.5)
        r_desc.font.color.rgb = RGBColor(0x4A, 0x45, 0x40)

    # -------------------------------------------------------------
    # SECTION 4: DEPLOYMENT & HOST SPECIFICATIONS
    # -------------------------------------------------------------
    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    h4 = doc.add_paragraph()
    h4.paragraph_format.space_before = Pt(16)
    h4.paragraph_format.space_after = Pt(6)
    run_h4 = h4.add_run("4. Hosting & Infrastructure Reference")
    run_h4.font.name = 'Georgia'
    run_h4.font.size = Pt(14)
    run_h4.font.bold = True
    run_h4.font.color.rgb = RGBColor(0x1A, 0x17, 0x15)

    specs = [
        ("Primary Live Domain", "https://kalajay.theluxestudio.in", "Configured via AWS Route 53 / CNAME to Amplify CloudFront distribution"),
        ("AWS Amplify CloudFront Host", "https://main.d1fnh1ysikb7wo.amplifyapp.com", "Active staging and edge-deployed CDN endpoint (App ID: d1fnh1ysikb7wo, Region: ap-southeast-1)"),
        ("GitHub Repository", "https://github.com/luxestudio-live/kalajay", "Active git remote tracking origin/main with production codebase"),
        ("Client Handover Monograph (PDF)", "https://kalajay.theluxestudio.in/kalajay-client-handover-monograph.pdf", "6-page luxury editorial brand specification and design story PDF"),
        ("Support & Agency Contact", "nuvobyluxestudio@gmail.com", "The Luxe Studio official engineering & design concierge"),
    ]

    for label, val, note in specs:
        p_spec = doc.add_paragraph()
        p_spec.paragraph_format.space_before = Pt(2)
        p_spec.paragraph_format.space_after = Pt(3)
        p_spec.paragraph_format.left_indent = Inches(0.2)

        r_bullet = p_spec.add_run("•  ")
        r_bullet.bold = True
        r_bullet.font.color.rgb = RGBColor(0x9E, 0x67, 0x20)

        r_lbl = p_spec.add_run(f"{label}: ")
        r_lbl.bold = True
        r_lbl.font.color.rgb = RGBColor(0x1A, 0x17, 0x15)

        if val.startswith("http"):
            add_hyperlink(p_spec, val, val, color="8C3A38", underline=True)
        else:
            r_val = p_spec.add_run(val)
            r_val.font.bold = True

        r_note = p_spec.add_run(f" — {note}")
        r_note.font.size = Pt(9.5)
        r_note.font.color.rgb = RGBColor(0x6E, 0x67, 0x5F)

    # Footer note
    doc.add_paragraph().paragraph_format.space_after = Pt(14)
    p_footer = doc.add_paragraph()
    p_footer.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_foot = p_footer.add_run("Handcrafted for Kalajay Handcrafted · Built by The Luxe Studio · 2026")
    r_foot.font.size = Pt(8.5)
    r_foot.font.color.rgb = RGBColor(0x9E, 0x67, 0x20)

    # Save documents to root and public directories
    out_paths = [
        "kalajay-website-links.docx",
        "public/kalajay-website-links.docx"
    ]
    for p in out_paths:
        doc.save(p)
        print(f"Saved: {p} ({os.path.getsize(p)} bytes)")

if __name__ == "__main__":
    create_document()
