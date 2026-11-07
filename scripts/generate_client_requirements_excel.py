import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
import os

def create_requirements_workbook():
    wb = openpyxl.Workbook()
    
    # ---------------------------------------------------------
    # STYLES & COLOR PALETTE
    # ---------------------------------------------------------
    ink_fill = PatternFill(start_color="1A1715", end_color="1A1715", fill_type="solid")
    gold_fill = PatternFill(start_color="9E6720", end_color="9E6720", fill_type="solid")
    subtle_champagne_fill = PatternFill(start_color="F9F6F0", end_color="F9F6F0", fill_type="solid")
    client_input_fill = PatternFill(start_color="FFFDF5", end_color="FFFDF5", fill_type="solid")
    highlight_fill = PatternFill(start_color="F3EBE1", end_color="F3EBE1", fill_type="solid")

    font_title = Font(name="Calibri", size=15, bold=True, color="FFFFFF")
    font_header = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
    font_sec_hdr = Font(name="Calibri", size=11, bold=True, color="9E6720")
    font_bold = Font(name="Calibri", size=10, bold=True, color="1A1715")
    font_regular = Font(name="Calibri", size=10, color="2B2724")
    font_draft = Font(name="Calibri", size=9.5, italic=True, color="5A544F")
    font_notes = Font(name="Calibri", size=9, color="7A736B")
    font_client_input = Font(name="Calibri", size=10.5, bold=True, color="8C3A38") # Rosewood client text

    thin_border_side = Side(border_style="thin", color="E0D9D0")
    cell_border = Border(left=thin_border_side, right=thin_border_side, top=thin_border_side, bottom=thin_border_side)
    thick_bottom = Border(bottom=Side(border_style="medium", color="9E6720"))

    align_center = Alignment(horizontal="center", vertical="center", wrap_text=True)
    align_left = Alignment(horizontal="left", vertical="center", wrap_text=True)
    align_left_top = Alignment(horizontal="left", vertical="top", wrap_text=True)

    # ---------------------------------------------------------
    # SHEET 1: OVERVIEW & INSTRUCTIONS
    # ---------------------------------------------------------
    ws_intro = wb.active
    ws_intro.title = "Overview & Guide"
    ws_intro.views.sheetView[0].showGridLines = True

    intro_data = [
        ("THE LUXE STUDIO · CLIENT CONTENT INTAKE WORKBOOK",),
        ("Kalajay Handcrafted — Non-Product Website Requirements",),
        ("",),
        ("PURPOSE OF THIS DOCUMENT:",),
        ("Since your ERP system directly provides all product data (SKUs, inventory, retail prices, dimensions, and individual product catalogue photos), this workbook gathers ONLY the non-product brand, storytelling, operational, and policy assets required to complete the website.",),
        ("",),
        ("HOW TO USE THIS WORKBOOK:",),
        ("1. Navigate through the tabs below corresponding to different sections of the website.",),
        ("2. Column 'Current Draft on Website' shows what is currently live on https://kalajay.theluxestudio.in.",),
        ("3. Fill in your actual brand information, policies, or drive links in Column 'Client Actual Data / Input'.",),
        ("4. If a current draft on the website is already 100% accurate, simply enter 'APPROVED' in the client column.",),
        ("",),
        ("SUMMARY OF TABS IN THIS WORKBOOK:",),
        ("• Tab 1: Home Page & Story (Hero, Manifesto, 4-Step Making Process, Makers Route, Reviews, Founder Genesis)",),
        ("• Tab 2: Craft House & Bespoke (The Making techniques, Bihar & Mumbai hubs, Customise studio options & charms)",),
        ("• Tab 3: Gifting & Contact (Wedding & Corporate gifting packages, MOQ, Studio coordinates, WhatsApp & GSTIN)",),
        ("• Tab 4: Logistics, Legal & Circle (Free delivery threshold, dispatch timelines, return guarantee, legal entity, Welcome bonus)",),
        ("",),
        ("DELIVERY & ASSISTANCE:",),
        ("Please share the completed file or Google Drive folder link with The Luxe Studio team (nuvobyluxestudio@gmail.com).",),
    ]

    for r_idx, row in enumerate(intro_data, start=1):
        for c_idx, val in enumerate(row, start=1):
            cell = ws_intro.cell(row=r_idx, column=c_idx, value=val)
            if r_idx == 1:
                cell.font = Font(name="Calibri", size=9.5, bold=True, color="9E6720")
            elif r_idx == 2:
                cell.font = Font(name="Georgia", size=18, bold=True, color="1A1715")
            elif "PURPOSE" in val or "HOW TO USE" in val or "SUMMARY" in val or "DELIVERY" in val:
                cell.font = Font(name="Calibri", size=11, bold=True, color="1A1715")
                cell.fill = highlight_fill
            else:
                cell.font = font_regular
    ws_intro.column_dimensions['A'].width = 110

    # ---------------------------------------------------------
    # HELPER TO POPULATE STANDARD REQUIREMENT SHEETS
    # ---------------------------------------------------------
    headers = [
        "Page / Route",
        "Section / Component",
        "Specific Requirement",
        "Current Draft on Website",
        "Client Actual Data / Input (Fill Here)",
        "Asset / Media Link (Google Drive / Cloud)",
        "Notes & Guidelines"
    ]

    def setup_req_sheet(ws, title, rows_data):
        ws.views.sheetView[0].showGridLines = True
        
        # Header title banner
        ws.merge_cells("A1:G1")
        cell_t = ws.cell(row=1, column=1, value=f"KALAJAY DIGITAL FLAGSHIP · {title.upper()}")
        cell_t.font = font_title
        cell_t.fill = ink_fill
        cell_t.alignment = align_center
        ws.row_dimensions[1].height = 36

        # Subtitle instructions
        ws.merge_cells("A2:G2")
        cell_sub = ws.cell(row=2, column=1, value="Please review the current draft and provide the real brand copy, numbers, or asset links in Column E & F.")
        cell_sub.font = font_draft
        cell_sub.fill = subtle_champagne_fill
        cell_sub.alignment = align_center
        ws.row_dimensions[2].height = 22

        # Column Headers
        ws.row_dimensions[4].height = 28
        for col_idx, h_text in enumerate(headers, start=1):
            c = ws.cell(row=4, column=col_idx, value=h_text)
            c.font = font_header
            c.fill = ink_fill if col_idx != 5 else gold_fill
            c.alignment = align_center
            c.border = cell_border

        # Populate Rows
        curr_row = 5
        for item in rows_data:
            ws.row_dimensions[curr_row].height = 42
            page, section, req, draft, notes = item

            # Col A: Page
            c_a = ws.cell(row=curr_row, column=1, value=page)
            c_a.font = font_bold
            c_a.alignment = align_left_top
            c_a.border = cell_border

            # Col B: Section
            c_b = ws.cell(row=curr_row, column=2, value=section)
            c_b.font = font_regular
            c_b.alignment = align_left_top
            c_b.border = cell_border

            # Col C: Specific Requirement
            c_c = ws.cell(row=curr_row, column=3, value=req)
            c_c.font = font_bold
            c_c.alignment = align_left_top
            c_c.border = cell_border

            # Col D: Current Draft
            c_d = ws.cell(row=curr_row, column=4, value=draft)
            c_d.font = font_draft
            c_d.alignment = align_left_top
            c_d.fill = subtle_champagne_fill
            c_d.border = cell_border

            # Col E: Client Input
            c_e = ws.cell(row=curr_row, column=5, value="")
            c_e.font = font_client_input
            c_e.alignment = align_left_top
            c_e.fill = client_input_fill
            c_e.border = cell_border

            # Col F: Media Link
            c_f = ws.cell(row=curr_row, column=6, value="")
            c_f.font = font_regular
            c_f.alignment = align_left_top
            c_f.fill = client_input_fill
            c_f.border = cell_border

            # Col G: Notes
            c_g = ws.cell(row=curr_row, column=7, value=notes)
            c_g.font = font_notes
            c_g.alignment = align_left_top
            c_g.border = cell_border

            curr_row += 1

        # Adjust Column Widths
        col_widths = [16, 20, 26, 38, 38, 30, 32]
        for idx, w in enumerate(col_widths, start=1):
            ws.column_dimensions[get_column_letter(idx)].width = w

    # ---------------------------------------------------------
    # SHEET 2: HOME & BRAND STORY
    # ---------------------------------------------------------
    ws_home_story = wb.create_sheet(title="Home & Story")
    home_story_data = [
        # (Page, Section, Requirement, Current Draft, Notes)
        ("Home Page (/)", "Top Ticker Bar", "Announcement & Offer Ticker", "Handcrafted with love, one at a time · Ships Across India · Free Delivery above INR 599 · 21 Master Women Artisans", "Short promotional message running at the very top of all pages."),
        ("Home Page (/)", "Hero Showcase", "3 Featured Hero Objects", "Left: Pearl Beaded Mini Tote\nCenter: Signature Pearl Vanity Box\nRight: Rose Pink Crystal Butterfly Clutch", "Confirm which 3 hero pieces from your collection should appear in the primary interactive 3-card spread."),
        ("Home Page (/)", "Brand Manifesto", "Full-width Philosophy Statement", "'Every piece is an invitation to slow down. Counted by human fingers, tensioned with patience, and made to turn ordinary moments into quiet celebrations.'", "Scroll-animated large serif sentence on the home page. Edit or approve."),
        ("Home Page (/)", "Process Scroll Step 01", "Step 1: Raw Materials", "Title: Choose Colours & Minerals\nCopy: Zero industrial plastics, zero automated molding. Faceted glass beads and high-tensile wire.", "Provide high-res craft photo showing raw sorted beads, spools, or minerals."),
        ("Home Page (/)", "Process Scroll Step 02", "Step 2: Hand-Stringing", "Title: String Bead by Bead\nCopy: 21 master women artisans sit together. Each bead hand-threaded with calibrated finger tension.", "Provide photo of artisan hands stringing beads on a loom or frame."),
        ("Home Page (/)", "Process Scroll Step 03", "Step 3: Structure & Fitting", "Title: Finish & Inspect Structure\nCopy: Rigid geometric planes form. Vanity mirrors hand-framed and velvet pads trimmed.", "Provide photo of assembled structured box, mirror fitting, or lining."),
        ("Home Page (/)", "Process Scroll Step 04", "Step 4: Luxury Packaging", "Title: Pack with Wax Seal & Care\nCopy: Wrapped at Mumbai studio with hand-stamped wax seals, calligraphed notes, and dust bags.", "Provide photo of your luxury gift box, wax seal stamp, or cotton dust pouch."),
        ("Home Page (/)", "Makers Route", "Operational Statistics", "• 21 Women Artisans\n• 2 Craft House Coordinates (Bihar & Mumbai)\n• 100% Hand-Strung\n• 14+ Hours Per Heirloom", "Confirm actual artisan headcount and estimated handcraft hours."),
        ("Home Page (/)", "Social Rail", "Instagram Community Photos", "6 lifestyle photos tagged with @kalajay_store and #kalajaycrafthouse", "Share links or folder of 6 square lifestyle photos of pieces in real customer settings."),
        ("Home Page (/)", "Customer Reviews", "4 Featured Customer Testimonials", "1. Radhika M., Mumbai (Bridal Vanity Box)\n2. Ananya S., Bengaluru (50 Wedding Favours)\n3. Tara V., Delhi NCR (Crystal Clutch)\n4. Pooja K., Kolkata (AirPod Jewel Case)", "Provide real customer names, cities, occasion, and their genuine review quotes."),
        ("Story Page (/story)", "Genesis & Meaning", "Brand Origin & Sanskrit Etymology", "Kalajay unites 'Kala' (art, sacred time) and 'Jay' (triumph). Founded to bring soul and patient craft to everyday accessories.", "Confirm or expand on the founding motivation and philosophy."),
        ("Story Page (/story)", "Founder Spotlight", "Founder Name, Story & Portrait", "Draft quotes celebrating handmade dignity in regional India.", "Founder's full name, short 1-paragraph bio, and a high-resolution portrait photo."),
        ("Story Page (/story)", "Artisan Spotlight 1", "Master Artisan Profile (Bihar)", "Reena Devi · Master Loom Weaver · Bihar Craft House\nQuote: 'When I weave a bridal box, I know it will sit on someone’s dresser for ten years...'", "Real artisan name, photo, and 1-2 sentence quote regarding their craft."),
        ("Story Page (/story)", "Artisan Spotlight 2", "Curation & Quality Lead (Mumbai)", "Pooja Sharma · Curation & Quality Lead · Mumbai Studio\nQuote: 'Every parcel leaving Mumbai is wrapped as if it’s our own sister’s wedding favour...'", "Real studio lead name, photo, and quote regarding inspection & packaging."),
    ]
    setup_req_sheet(ws_home_story, "Home Page & Story Requirements", home_story_data)

    # ---------------------------------------------------------
    # SHEET 3: CRAFT HOUSE & BESPOKE STUDIO
    # ---------------------------------------------------------
    ws_craft_custom = wb.create_sheet(title="Craft House & Customise")
    craft_custom_data = [
        ("The Craft House (/atelier)", "Geography: Hub 1", "Bihar Craft House Coordinates", "Role: Loom Weaving & Hand-Stringing\nLocation: Bihar, India", "Specify exact district/town in Bihar (e.g. Madhubani, Darbhanga, or Patna) and specific craft focus."),
        ("The Craft House (/atelier)", "Geography: Hub 2", "Mumbai Studio Coordinates", "Role: Curation, Finishing, Quality Audit & Global Dispatch\nLocation: Mumbai, Maharashtra", "Specify neighborhood/area in Mumbai (e.g. Bandra, Andheri) and dispatch role."),
        ("The Craft House (/atelier)", "Studio Visit Policy", "Physical Visit Protocol", "Private appointments available on request.", "Can customers visit your Mumbai studio in person? If yes, provide booking instructions."),
        ("The Craft House (/atelier)", "Craft Techniques", "4 Pillars of Construction", "1. Monofilament Wire Tensioning (6–10h)\n2. Faceted Crystal Weaving (12–16h)\n3. Botanical Crochet Needlework (3–5h)\n4. Mirror & Velvet Fitting (Finishing)", "Confirm or adjust your core construction methods and artisan labor hours."),
        ("The Craft House (/atelier)", "Material Taxonomy", "Sourcing Standards Table", "• Synthetic Pearls: High-density polished core\n• Faceted Crystals: Prismatic glass bicones\n• Monofilament Wire: High-tensile stainless steel\n• Cotton Yarn: 100% mercerised botanical", "Confirm raw material grades and origins to maintain transparent luxury standards."),
        ("Customise (/customise)", "Available Silhouettes", "Customizable Product Base Types", "1. Beaded Crossbody Sling (Base ₹1,299)\n2. Beaded Vanity Organiser / Box (Base ₹799)\n3. AirPods Pearl Jewel Case (Base ₹449)", "Which product types can customers customize on your interactive studio? Confirm base starting prices."),
        ("Customise (/customise)", "Color Palettes", "Offered Colorway Options", "Sling: Pearl White, Golden Honey, Silver Starlight, Rose Quartz.\nBox: Lustrous White, Blush, Champagne, Jet Crystal.", "List the real bead colorways available for custom orders."),
        ("Customise (/customise)", "Charms & Add-ons", "Personalized Accessories", "• Detachable Pearl Wristlet\n• Monogram Initial Charm\n• Botanical Crochet Floret\n• Tassel Fringe\nPrice: +₹99 each", "Confirm list of available charm attachments and additional fee per charm."),
        ("Customise (/customise)", "Turnaround Time", "Custom Handcraft Lead Time", "Sling: 7 days | Box: 5 days | AirPods: 3 days", "How many working days do your artisans need to complete a custom piece?"),
    ]
    setup_req_sheet(ws_craft_custom, "Craft House & Bespoke Studio Requirements", craft_custom_data)

    # ---------------------------------------------------------
    # SHEET 4: GIFTING & CONTACT
    # ---------------------------------------------------------
    ws_gifting_contact = wb.create_sheet(title="Gifting & Contact")
    gifting_contact_data = [
        ("Gifting (/gifting)", "Gift Packaging Inclusions", "Standard Gift Box Protocol", "Rigid matte gift box in deep plum/champagne, handwritten calligraphy card with personalized recipient message, hand-stamped wax seal.", "Confirm what complimentary or paid gift wrapping elements you provide."),
        ("Corporate Gifting (/corporate-gifting)", "Bridal & Wedding Favours", "Wedding Ceremonial Keepsakes", "Features: Exact palette matching to wedding decor/lehenga, hot-foil couple monogram tags, individual gift boxing.\nMOQ: 25 pieces | Lead time: 3-4 weeks", "Confirm minimum order quantity (MOQ) and advance notice required for wedding bulk orders."),
        ("Corporate Gifting (/corporate-gifting)", "Corporate Hampers", "Executive Appreciation Hampers", "Features: Desk trays, crystal coaster sets, debossed corporate identity note, GST tax invoicing, multi-drop direct dispatch.\nMOQ: 15 pieces | Lead time: 2-3 weeks", "Confirm corporate gifting parameters and minimum quantities."),
        ("Corporate Gifting (/corporate-gifting)", "Brochure Download", "Gifting Lookbook / PDF Catalog", "None currently linked.", "Provide downloadable PDF catalogue/lookbook for corporate clients if available."),
        ("Contact (/contact)", "WhatsApp Business", "Official Concierge Number", "+91 97405 40847", "Confirm your official primary WhatsApp Business number for instant orders and concierge inquiries."),
        ("Contact (/contact)", "Customer Care Phone", "Calling Phone Line", "+91 97405 40847", "Phone number for direct calling assistance."),
        ("Contact (/contact)", "Customer Care Email", "Primary & Alternate Email", "support@kalajay.in | kalajay.handcrafted@gmail.com", "Provide official support email addresses."),
        ("Contact (/contact)", "Instagram Handle", "Official Social Channel", "@kalajay.handcrafted\nURL: https://www.instagram.com/kalajay.handcrafted/", "Confirm your active Instagram handle and profile link."),
        ("Contact (/contact)", "Physical Studio Address", "Headquarters / Dispatch Address", "Mumbai, Maharashtra, India", "Full physical postal address for Google Maps embed and customer correspondence."),
        ("Contact (/contact)", "Operating Hours", "Concierge Availability", "Monday to Saturday · 10:00 AM – 8:00 PM IST", "Customer service hours and days of operation."),
    ]
    setup_req_sheet(ws_gifting_contact, "Gifting & Contact Requirements", gifting_contact_data)

    # ---------------------------------------------------------
    # SHEET 5: POLICIES, LEGAL & PATRON CIRCLE
    # ---------------------------------------------------------
    ws_policies_legal = wb.create_sheet(title="Policies & Legal")
    policies_legal_data = [
        ("Shipping & Returns", "Free Delivery Rule", "Order Value Threshold", "Free Pan-India Delivery on orders above ₹599.\nFlat delivery fee of ₹79 for orders under ₹599.", "Confirm your free shipping threshold (e.g. ₹599, ₹999, or ₹1,499) and standard courier charge."),
        ("Shipping & Returns", "Delivery Timelines", "Pan-India Transit Schedules", "Metro Cities: 2–4 business days.\nRest of India: 4–7 business days.\nDispatch within 24–48 hours for in-stock items.", "Confirm actual shipping timelines with your courier partners."),
        ("Shipping & Returns", "Courier Partners", "Logistics Carriers", "Blue Dart, Delhivery, DTDC, India Post Speed Post.", "Which courier services do you use for parcel dispatches?"),
        ("Shipping & Returns", "Transit Guarantee", "Damage in Transit Protection", "48-Hour Transit Guarantee: Immediate complimentary replacement if customer shares unboxing photo/video within 48 hours of delivery.", "Confirm damage reporting policy and window."),
        ("Shipping & Returns", "Exchange & Return Terms", "Return Eligibility Rules", "Eligible: Unused items with tags within 7 days, transit defects.\nNon-eligible: Custom/monogrammed pieces, earrings/hair accessories for hygiene.", "List any non-returnable categories and exchange windows."),
        ("FAQ (/faq)", "Key Customer Questions", "Product Care & Repairs", "Beads are water-resistant but avoid submerging. Wipe with dry microfiber cloth. Re-stringing / repair service available on request.", "Confirm aftercare recommendations and repair policy."),
        ("Terms & Privacy (/terms)", "Legal Entity", "Registered Business Name", "Kalajay Handcrafted", "Exact registered legal entity name (LLP, Private Limited, or Sole Proprietorship) for invoices and terms."),
        ("Terms & Privacy (/terms)", "GSTIN Number", "Official GST Registration", "11XXXXX1111X1Z1 (Current placeholder in code)", "Official 15-digit GSTIN number to print on tax invoices."),
        ("Terms & Privacy (/terms)", "Legal Jurisdiction", "Dispute Resolution City", "Courts of Mumbai, Maharashtra, India", "Jurisdiction city for legal dispute clauses."),
        ("Account / Circle (/signup)", "Patron Welcome Offer", "Welcome Discount Code", "₹300 Welcome Gift Code upon joining Patron Circle.", "Confirm welcome coupon details (e.g. ₹300 off on first order, 10% off code, or minimum spend rule)."),
    ]
    setup_req_sheet(ws_policies_legal, "Policies, Legal & Patron Circle", policies_legal_data)

    # Save to root, public, and out directories
    paths = [
        "kalajay-client-content-requirements.xlsx",
        "public/kalajay-client-content-requirements.xlsx",
        "out/kalajay-client-content-requirements.xlsx"
    ]
    for p in paths:
        try:
            wb.save(p)
            print(f"Saved: {p} ({os.path.getsize(p)} bytes)")
        except PermissionError:
            print(f"Notice: {p} is currently open in Excel. Saved other destinations.")

if __name__ == "__main__":
    create_requirements_workbook()

