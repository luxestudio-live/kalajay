const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const HTML_CONTENT = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Kalajay — Client Handover & Design Monograph</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;600&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 13mm 12mm 13mm;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #FAF9F6;
      color: #141312;
      line-height: 1.5;
      font-size: 10pt;
      -webkit-font-smoothing: antialiased;
    }

    .page {
      background: #FAF9F6;
      width: 100%;
      min-height: 271mm;
      position: relative;
      padding: 5mm 3mm;
      page-break-after: always;
      break-after: page;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .page:last-child {
      page-break-after: avoid;
      break-after: avoid;
    }

    /* Running Header & Footer */
    .doc-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 3.5mm;
      border-bottom: 1px solid #EBE6DE;
      margin-bottom: 5mm;
      font-size: 7.5pt;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #68625C;
    }

    .doc-header .brand-title {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 11pt;
      font-weight: 600;
      color: #141312;
      letter-spacing: 0.18em;
    }

    .doc-header .studio-pill {
      background: #FAF7F2;
      border: 1px solid #E0CBAB;
      padding: 1mm 2.5mm;
      border-radius: 4px;
      font-weight: 600;
      color: #9A7D55;
    }

    .doc-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 3.5mm;
      border-top: 1px solid #EBE6DE;
      margin-top: 5mm;
      font-size: 7.5pt;
      letter-spacing: 0.08em;
      color: #999187;
    }

    /* Typography */
    h1, h2, h3, h4 {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-weight: 600;
      color: #141312;
      line-height: 1.15;
    }

    h1 {
      font-size: 27pt;
      letter-spacing: 0.03em;
      margin-bottom: 3mm;
    }

    h2 {
      font-size: 18pt;
      letter-spacing: 0.03em;
      margin-bottom: 2mm;
    }

    h3 {
      font-size: 13pt;
      letter-spacing: 0.02em;
      margin-bottom: 1.5mm;
    }

    p {
      color: #44403C;
      margin-bottom: 2.5mm;
      font-size: 9.5pt;
      line-height: 1.55;
    }

    p.lead {
      font-size: 10.5pt;
      color: #141312;
      line-height: 1.55;
      font-weight: 400;
    }

    .stamp {
      display: inline-block;
      font-size: 6.8pt;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      padding: 1.2mm 3mm;
      border-radius: 999px;
      background: #F3EFEA;
      color: #68625C;
      border: 1px solid #EBE6DE;
      margin-bottom: 2.5mm;
    }

    .stamp.gold {
      background: #FAF7F2;
      border-color: #E0CBAB;
      color: #9A7D55;
    }

    .quote-box {
      border-left: 2px solid #C5A880;
      padding: 3mm 4.5mm;
      background: #FAF7F2;
      margin: 3.5mm 0;
      border-radius: 0 6px 6px 0;
    }

    .quote-box .quote-txt {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 12.5pt;
      font-style: italic;
      color: #141312;
      line-height: 1.35;
      margin-bottom: 1mm;
    }

    .quote-box .quote-author {
      font-size: 7.5pt;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #9A7D55;
      font-weight: 600;
    }

    /* Cover Page */
    .cover-page {
      justify-content: space-between;
      text-align: center;
      padding: 10mm 8mm;
      background: radial-gradient(circle at 50% 25%, #FFFFFF 0%, #FAF9F6 65%, #F3EFEA 100%);
      border: 1px solid #EBE6DE;
      border-radius: 12px;
    }

    .cover-brand {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 40pt;
      letter-spacing: 0.26em;
      text-transform: uppercase;
      font-weight: 500;
      color: #141312;
      margin-bottom: 1mm;
    }

    .cover-subbrand {
      font-size: 8.5pt;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: #68625C;
      margin-bottom: 5mm;
    }

    .cover-divider {
      width: 45mm;
      height: 1px;
      background: linear-gradient(90deg, transparent, #C5A880, transparent);
      margin: 3mm auto;
    }

    .cover-center {
      margin: auto 0;
      padding: 6mm 0;
    }

    .cover-main-title {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 25pt;
      font-weight: 400;
      line-height: 1.2;
      color: #141312;
      margin-top: 3mm;
      margin-bottom: 2.5mm;
    }

    .cover-desc {
      font-size: 10.5pt;
      color: #68625C;
      max-width: 140mm;
      margin: 0 auto;
      line-height: 1.6;
    }

    .cover-badges {
      display: flex;
      gap: 2.5mm;
      justify-content: center;
      margin-top: 5mm;
      flex-wrap: wrap;
    }

    .badge-tag {
      display: inline-block;
      font-size: 6.5pt;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 0.9mm 2.2mm;
      border-radius: 4px;
      background: #FAF7F2;
      color: #9A7D55;
      border: 1px solid #E0CBAB;
    }

    .cover-handover-box {
      background: #FFFFFF;
      border: 1px solid #EBE6DE;
      border-radius: 8px;
      padding: 3.5mm 5mm;
      max-width: 150mm;
      margin: 5mm auto 0 auto;
      display: grid;
      grid-template-columns: 1fr 1fr;
      text-align: left;
      gap: 3mm;
    }

    .handover-item strong {
      display: block;
      font-size: 7pt;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #9A7D55;
      margin-bottom: 0.8mm;
    }

    .handover-item span {
      font-size: 9pt;
      font-weight: 600;
      color: #141312;
    }

    .cover-meta {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 3mm;
      border-top: 1px solid #EBE6DE;
      padding-top: 5mm;
      text-align: left;
      font-size: 8pt;
      color: #68625C;
    }

    .cover-meta-col strong {
      display: block;
      color: #141312;
      font-size: 7.5pt;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 0.8mm;
    }

    /* Cards & Grids */
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3.5mm;
    }

    .grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 3mm;
    }

    .card {
      background: #FFFFFF;
      border: 1px solid #EBE6DE;
      border-radius: 6px;
      padding: 3.5mm 4mm;
      margin-bottom: 2.5mm;
    }

    .card h3 {
      margin-bottom: 1.2mm;
      font-size: 11.5pt;
    }

    .card p {
      font-size: 8.8pt;
      line-height: 1.45;
      margin-bottom: 0;
    }

    /* Color Swatch Card */
    .swatch-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 2.2mm;
      margin-bottom: 3.5mm;
    }

    .swatch-card {
      display: flex;
      align-items: center;
      background: #FFFFFF;
      border: 1px solid #EBE6DE;
      border-radius: 6px;
      padding: 2.2mm 2.5mm;
    }

    .swatch-chip {
      width: 11mm;
      height: 11mm;
      border-radius: 5px;
      border: 1px solid rgba(0,0,0,0.08);
      margin-right: 2.8mm;
      flex-shrink: 0;
    }

    .swatch-info {
      flex: 1;
      font-size: 7.8pt;
      line-height: 1.35;
    }

    .swatch-name {
      font-weight: 700;
      color: #141312;
      font-size: 8.8pt;
      margin-bottom: 0.4mm;
    }

    .swatch-hex {
      font-family: 'SFMono-Regular', Consolas, Menlo, monospace;
      font-size: 7.8pt;
      color: #68625C;
      font-weight: 600;
    }

    .swatch-role {
      color: #999187;
      font-size: 7.2pt;
      margin-top: 0.4mm;
    }

    /* Tables */
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 2.5mm 0 3.5mm 0;
      background: #FFFFFF;
      border: 1px solid #EBE6DE;
      border-radius: 6px;
      overflow: hidden;
      font-size: 8.2pt;
    }

    .data-table th {
      background: #F3EFEA;
      color: #141312;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 6.8pt;
      letter-spacing: 0.12em;
      padding: 2.2mm 3mm;
      text-align: left;
      border-bottom: 1px solid #EBE6DE;
    }

    .data-table td {
      padding: 2.2mm 3mm;
      border-bottom: 1px solid #F3EFEA;
      color: #44403C;
      vertical-align: middle;
    }

    .data-table tr:last-child td {
      border-bottom: none;
    }

    .data-table tr:nth-child(even) td {
      background: #FAF9F6;
    }

    .page-link {
      color: #141312;
      font-weight: 600;
      text-decoration: none;
      font-family: 'SFMono-Regular', Consolas, Menlo, monospace;
      font-size: 7.8pt;
      display: inline-block;
    }

    .page-link:hover {
      color: #9A7D55;
      text-decoration: underline;
    }

    /* Feature List */
    .feature-item {
      display: flex;
      gap: 2.8mm;
      margin-bottom: 2.8mm;
      align-items: flex-start;
    }

    .feature-icon-box {
      width: 6.5mm;
      height: 6.5mm;
      border-radius: 4px;
      background: #FAF7F2;
      border: 1px solid #E0CBAB;
      color: #9A7D55;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 8.5pt;
      font-weight: 700;
      flex-shrink: 0;
      margin-top: 0.4mm;
    }

    .feature-content h4 {
      font-size: 10.5pt;
      margin-bottom: 0.6mm;
      color: #141312;
    }

    .feature-content p {
      font-size: 8.3pt;
      line-height: 1.45;
      color: #44403C;
      margin-bottom: 0;
    }
  </style>
</head>
<body>

  <!-- ================= PAGE 1: CLIENT HANDOVER COVER ================= -->
  <div class="page cover-page">
    <div class="cover-top">
      <div class="cover-brand">KALAJAY</div>
      <div class="cover-subbrand">A World of Little Wonders &middot; Luxury Craft House</div>
      <div class="cover-divider"></div>
      <span class="stamp gold">OFFICIAL CLIENT HANDOVER &middot; LAUNCH EDITION</span>
    </div>

    <div class="cover-center">
      <div class="cover-main-title">Digital Flagship Website<br>Design & Operations Monograph</div>
      <p class="cover-desc">
        Prepared for the founders and team of <strong>Kalajay Handcrafted</strong>. A comprehensive handover dossier detailing the creative concept, visual identity, color tokens, business features, and the master sitemap directory of your new digital flagship.
      </p>

      <div class="cover-handover-box">
        <div class="handover-item">
          <strong>Prepared For</strong>
          <span>Kalajay Handcrafted</span>
        </div>
        <div class="handover-item">
          <strong>Design & Development</strong>
          <span>The Luxe Studio</span>
        </div>
        <div class="handover-item">
          <strong>Client Domain</strong>
          <span>kalajay.theluxestudio.in</span>
        </div>
        <div class="handover-item">
          <strong>Infrastructure</strong>
          <span>AWS Amplify & CloudFront Edge</span>
        </div>
      </div>

      <div class="cover-badges">
        <span class="badge-tag">21 Women Master Artisans</span>
        <span class="badge-tag">69 Handcrafted Creations</span>
        <span class="badge-tag">9 Curated Collections</span>
        <span class="badge-tag">Sub-Second Edge Loading</span>
      </div>
    </div>

    <div class="cover-meta">
      <div class="cover-meta-col">
        <strong>Client Contact</strong>
        support@kalajay.in &middot; +91 97405 40847
      </div>
      <div class="cover-meta-col">
        <strong>Craft Houses Represented</strong>
        Bihar (Craft) &amp; Mumbai (Curating)
      </div>
      <div class="cover-meta-col">
        <strong>Handover Date</strong>
        November 2026 &middot; Production Ready
      </div>
    </div>
  </div>

  <!-- ================= PAGE 2: STORY & CREATIVE CONCEPT (CLIENT PERSPECTIVE) ================= -->
  <div class="page">
    <div>
      <div class="doc-header">
        <span class="brand-title">KALAJAY</span>
        <span class="studio-pill">The Luxe Studio &middot; Handover Dossier</span>
      </div>

      <span class="stamp">Section 01 &middot; Creative Direction</span>
      <h2>The Story & Design Concept Behind Your Website</h2>
      <p class="lead">
        When designing the Kalajay digital flagship, our primary objective was to celebrate the soul of your craft&mdash;transforming casual visitors into appreciative, lifelong patrons of your slow-luxury philosophy.
      </p>

      <div class="quote-box">
        <div class="quote-txt">
          &ldquo;A single bead or a strand of yarn or a paint brush. A little patience. Something beautiful.&rdquo;
        </div>
        <div class="quote-author">&mdash; Kalajay Brand Manifesto</div>
      </div>

      <div class="card" style="margin-top: 3mm; background: #FAF7F2; border-color: #E0CBAB;">
        <h3 style="color: #9A7D55;">Why We Rejected Generic E-Commerce Templates</h3>
        <p>
          Generic Shopify or standard storefront themes display items like factory commodities in sterile grids with loud countdown timers. That approach depreciates handcrafted goods. For Kalajay, we designed a <strong>"Sanctum of Craft"</strong>&mdash;an immersive digital monograph that justifies your artisan price points by communicating patience, generational skill, and heirloom quality.
        </p>
      </div>

      <h3 style="margin-top: 3.5mm; margin-bottom: 2mm;">The Three Core Pillars Built Into Your Website</h3>
      <div class="grid-3">
        <div class="card">
          <h4 style="font-size: 10.5pt; margin-bottom: 1.2mm;">1. Elevating Your 21 Artisans</h4>
          <p>
            Your team of 21 master women artisans in Bihar isn't buried in an 'About' page. Their names, craft hours (4 to 28 hours), and generational bead-weaving expertise are woven directly into product cards, the story scroll, and the homepage.
          </p>
        </div>
        <div class="card">
          <h4 style="font-size: 10.5pt; margin-bottom: 1.2mm;">2. Tactile Luxury Aesthetics</h4>
          <p>
            Warm porcelain paper textures, restrained champagne gold lines, and 28px/32px curved organic borders replicate the smooth tactile curves of hand-strung pearls and glass beads.
          </p>
        </div>
        <div class="card">
          <h4 style="font-size: 10.5pt; margin-bottom: 1.2mm;">3. Direct Patron Relationship</h4>
          <p>
            Built-in WhatsApp Concierge routes bespoke enquiries directly to your studio phone (+91 97405 40847) with pre-filled product details, eliminating sales friction and fostering personal patron connections.
          </p>
        </div>
      </div>

      <div class="grid-2" style="margin-top: 3mm;">
        <div class="card">
          <h4 style="font-size: 10.5pt; margin-bottom: 1.2mm;">Bihar Artisan Studio Spotlight</h4>
          <p>Highlights the raw handcrafted creation: manual loom stringing, bead tensioning, and reinforced wire frames built to last generations.</p>
        </div>
        <div class="card">
          <h4 style="font-size: 10.5pt; margin-bottom: 1.2mm;">Mumbai Studio Curation Spotlight</h4>
          <p>Reassures patrons regarding quality control: velvet interior lining, custom calligraphy notes, wax-sealed packaging, and insured courier delivery.</p>
        </div>
      </div>
    </div>

    <div class="doc-footer">
      <span>Prepared by The Luxe Studio for Kalajay Handcrafted</span>
      <span>Page 2 &middot; kalajay.theluxestudio.in</span>
    </div>
  </div>

  <!-- ================= PAGE 3: COLOR PALETTE & DESIGN SYSTEM IN DETAIL ================= -->
  <div class="page">
    <div>
      <div class="doc-header">
        <span class="brand-title">KALAJAY</span>
        <span class="studio-pill">The Luxe Studio &middot; Handover Dossier</span>
      </div>

      <span class="stamp gold">Section 02 &middot; Brand Identity System</span>
      <h2>The Visual Language & Color Palette (In Detail)</h2>
      <p class="lead">
        We curated a bespoke luxury palette that balances high-fashion editorial warmth with modern digital contrast, ensuring seamless readability and prestige across all screen sizes.
      </p>

      <h3 style="margin-top: 2.5mm; margin-bottom: 2mm;">Primary Brand Color Tokens</h3>
      <div class="swatch-grid">
        <div class="swatch-card">
          <div class="swatch-chip" style="background: #FAF9F6;"></div>
          <div class="swatch-info">
            <div class="swatch-name">Porcelain Canvas</div>
            <div class="swatch-hex">#FAF9F6 &middot; RGB(250, 249, 246)</div>
            <div class="swatch-role">Primary background; feels like tactile handmade parchment</div>
          </div>
        </div>

        <div class="swatch-card">
          <div class="swatch-chip" style="background: #141312;"></div>
          <div class="swatch-info">
            <div class="swatch-name">Architectural Noir</div>
            <div class="swatch-hex">#141312 &middot; RGB(20, 19, 18)</div>
            <div class="swatch-role">Headings, primary CTA buttons, brand logo wordmark</div>
          </div>
        </div>

        <div class="swatch-card">
          <div class="swatch-chip" style="background: #F3EFEA;"></div>
          <div class="swatch-info">
            <div class="swatch-name">Bone Alabaster</div>
            <div class="swatch-hex">#F3EFEA &middot; RGB(243, 239, 234)</div>
            <div class="swatch-role">Card backgrounds, category pills, table header wash</div>
          </div>
        </div>

        <div class="swatch-card">
          <div class="swatch-chip" style="background: #C5A880;"></div>
          <div class="swatch-info">
            <div class="swatch-name">Champagne Gold</div>
            <div class="swatch-hex">#C5A880 &middot; RGB(197, 168, 128)</div>
            <div class="swatch-role">Luxury insignia, focus rings, heirloom highlight trims</div>
          </div>
        </div>

        <div class="swatch-card">
          <div class="swatch-chip" style="background: #44403C;"></div>
          <div class="swatch-info">
            <div class="swatch-name">Warm Deep Charcoal</div>
            <div class="swatch-hex">#44403C &middot; RGB(68, 64, 60)</div>
            <div class="swatch-role">Editorial body typography (exceeds 8.2:1 contrast ratio)</div>
          </div>
        </div>

        <div class="swatch-card">
          <div class="swatch-chip" style="background: #A85A48;"></div>
          <div class="swatch-info">
            <div class="swatch-name">Warm Terracotta</div>
            <div class="swatch-hex">#A85A48 &middot; RGB(168, 90, 72)</div>
            <div class="swatch-role">Artisan badges, price savings & handcrafted accents</div>
          </div>
        </div>

        <div class="swatch-card">
          <div class="swatch-chip" style="background: #FFFFFF; border: 1px solid #DDD;"></div>
          <div class="swatch-info">
            <div class="swatch-name">Gallery White</div>
            <div class="swatch-hex">#FFFFFF &middot; RGB(255, 255, 255)</div>
            <div class="swatch-role">Product photo backdrop cards, checkout modals</div>
          </div>
        </div>

        <div class="swatch-card">
          <div class="swatch-chip" style="background: #EBE6DE;"></div>
          <div class="swatch-info">
            <div class="swatch-name">Subtle Border Linen</div>
            <div class="swatch-hex">#EBE6DE &middot; RGB(235, 230, 222)</div>
            <div class="swatch-role">Hairline structural boundaries & subtle card outlines</div>
          </div>
        </div>
      </div>

      <h3 style="margin-top: 2mm; margin-bottom: 2mm;">Typography System & Hierarchy</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th>Role</th>
            <th>Typeface</th>
            <th>Weights</th>
            <th>Strategic Purpose for Your Brand</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Display Headlines</strong></td>
            <td>Cormorant Garamond</td>
            <td>400, 500, 600</td>
            <td>Conveys heritage, prestige, and bespoke Craft House craftsmanship</td>
          </tr>
          <tr>
            <td><strong>Interface & Commerce</strong></td>
            <td>Plus Jakarta Sans</td>
            <td>400, 500, 600</td>
            <td>Clean, modern geometric sans; ultra-legible on mobile checkout screens</td>
          </tr>
          <tr>
            <td><strong>Artisan Hand Script</strong></td>
            <td>Caveat</td>
            <td>400, 600</td>
            <td>Adds authentic handwritten intimacy for quotes and wax seal notes</td>
          </tr>
          <tr>
            <td><strong>Monumental Stamps</strong></td>
            <td>Plus Jakarta Sans (Caps)</td>
            <td>700 &middot; 0.22em</td>
            <td>High letterspacing uppercase labels for chapter stamps and badges</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="doc-footer">
      <span>Prepared by The Luxe Studio for Kalajay Handcrafted</span>
      <span>Page 3 &middot; kalajay.theluxestudio.in</span>
    </div>
  </div>

  <!-- ================= PAGE 4: BUSINESS FEATURES & FUNCTIONALITY ================= -->
  <div class="page">
    <div>
      <div class="doc-header">
        <span class="brand-title">KALAJAY</span>
        <span class="studio-pill">The Luxe Studio &middot; Handover Dossier</span>
      </div>

      <span class="stamp">Section 03 &middot; Business Capabilities</span>
      <h2>Features & Functionality Built for Your Business</h2>
      <p class="lead">
        Your new digital flagship is packed with bespoke e-commerce features specifically tailored to increase Average Order Value (AOV) and automate patron engagement.
      </p>

      <div class="feature-item">
        <div class="feature-icon-box">01</div>
        <div class="feature-content">
          <h4>Dynamic Cover Triptych & Story Showcase</h4>
          <p>
            A high-impact 3-frame editorial cover on the homepage that presents your brand's finest creations immediately on mobile and desktop, transitioning smoothly into the artisan chronicle and customer reviews.
          </p>
        </div>
      </div>

      <div class="feature-item">
        <div class="feature-icon-box">02</div>
        <div class="feature-content">
          <h4>Instant Catalogue Filtering (All 69 Creations)</h4>
          <p>
            Your patrons can browse all 69 handcrafted pieces with instantaneous client-side filtering across 9 collections and 3 price brackets (Under ₹500, ₹500–₹1,500, Luxury Above ₹1,500) without page reload delays.
          </p>
        </div>
      </div>

      <div class="feature-item">
        <div class="feature-icon-box">03</div>
        <div class="feature-content">
          <h4>Patron Circle Authentication (Mobile-First OTP)</h4>
          <p>
            Eliminates password fatigue with rapid 6-digit SMS/WhatsApp OTP login, 10-digit phone formatting, auto-triggering numeric keyboard on iOS & Android, and a ₹300 welcome gift voucher that drives customer list growth.
          </p>
        </div>
      </div>

      <div class="feature-item">
        <div class="feature-icon-box">04</div>
        <div class="feature-content">
          <h4>Bespoke Customisation Desk</h4>
          <p>
            A dedicated custom commission portal allowing patrons to request specific bead colors, personalized initials, and bridal trousseau sets. Generates pre-filled WhatsApp messages straight to your studio team.
          </p>
        </div>
      </div>

      <div class="feature-item">
        <div class="feature-icon-box">05</div>
        <div class="feature-content">
          <h4>Gifting Suite & Corporate Bulk Concierge</h4>
          <p>
            Showcases your luxury wax-seal unboxing experience and opens a dedicated corporate portal for 25+ unit bulk orders, wedding return favours, and corporate festive gifting with tiered volume pricing.
          </p>
        </div>
      </div>

      <div class="feature-item">
        <div class="feature-icon-box">06</div>
        <div class="feature-content">
          <h4>Smart Shopping Bag & Free Shipping Threshold</h4>
          <p>
            A slide-out drawer cart with a live dynamic progress bar calculating the distance to free shipping (₹599 threshold), encouraging patrons to add smaller items (like keyrings or coasters) to cross the limit.
          </p>
        </div>
      </div>

      <div class="feature-item">
        <div class="feature-icon-box">07</div>
        <div class="feature-content">
          <h4>Self-Service Shipment Tracking</h4>
          <p>
            Reduces customer support overhead by providing a live order tracker where patrons can type in their Tracking ID or Phone Number to view dispatch progress and estimated delivery dates.
          </p>
        </div>
      </div>

      <div class="feature-item">
        <div class="feature-icon-box">08</div>
        <div class="feature-content">
          <h4>Global Cloud Infrastructure (AWS Amplify & CloudFront)</h4>
          <p>
            100% pre-rendered static site architecture hosted globally across edge servers, delivering lightning sub-second page loads, zero server crashes during traffic spikes, and bank-grade SSL encryption.
          </p>
        </div>
      </div>
    </div>

    <div class="doc-footer">
      <span>Prepared by The Luxe Studio for Kalajay Handcrafted</span>
      <span>Page 4 &middot; kalajay.theluxestudio.in</span>
    </div>
  </div>

  <!-- ================= PAGE 5: MASTER PAGES & ROUTE DIRECTORY ================= -->
  <div class="page">
    <div>
      <div class="doc-header">
        <span class="brand-title">KALAJAY</span>
        <span class="studio-pill">The Luxe Studio &middot; Handover Dossier</span>
      </div>

      <span class="stamp gold">Section 04 &middot; Master Sitemap Directory</span>
      <h2>Core Brand & Commerce Routes</h2>
      <p class="lead">
        Direct canonical URL links to all primary brand sections and customer checkout flows built for your website on <strong>kalajay.theluxestudio.in</strong>.
      </p>

      <h3 style="margin-top: 2.5mm; margin-bottom: 1.5mm;">Core Brand & Editorial Pages</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 25%;">Page Name</th>
            <th style="width: 38%;">Canonical Live Route</th>
            <th>Business & Patron Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Digital Flagship</strong></td>
            <td><a class="page-link" href="https://kalajay.theluxestudio.in/">/</a></td>
            <td>Homepage cover triptych, story scroll, bestseller showcase, reviews</td>
          </tr>
          <tr>
            <td><strong>All Creations</strong></td>
            <td><a class="page-link" href="https://kalajay.theluxestudio.in/shop/">/shop/</a></td>
            <td>Complete 69-piece catalogue with instant category filtering & sorting</td>
          </tr>
          <tr>
            <td><strong>The Kalajay Story</strong></td>
            <td><a class="page-link" href="https://kalajay.theluxestudio.in/story/">/story/</a></td>
            <td>Artisan narrative, women collective empowerment, loom chronicles</td>
          </tr>
          <tr>
            <td><strong>The Craft House</strong></td>
            <td><a class="page-link" href="https://kalajay.theluxestudio.in/atelier/">/atelier/</a></td>
            <td>Bead tensioning, material craftsmanship, dual-house structure</td>
          </tr>
          <tr>
            <td><strong>Bespoke Orders</strong></td>
            <td><a class="page-link" href="https://kalajay.theluxestudio.in/customise/">/customise/</a></td>
            <td>Custom colourway, initials, and bespoke bridal commission concierge</td>
          </tr>
          <tr>
            <td><strong>The Art of Gifting</strong></td>
            <td><a class="page-link" href="https://kalajay.theluxestudio.in/gifting/">/gifting/</a></td>
            <td>Luxury unboxing showcase, wax-sealed calligraphy notes, gift hampers</td>
          </tr>
          <tr>
            <td><strong>Corporate Favours</strong></td>
            <td><a class="page-link" href="https://kalajay.theluxestudio.in/corporate-gifting/">/corporate-gifting/</a></td>
            <td>Wedding return gifts & corporate bulk favours concierge (25+ units)</td>
          </tr>
        </tbody>
      </table>

      <h3 style="margin-top: 3.5mm; margin-bottom: 1.5mm;">Patron Circle & Commerce Workflows</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 25%;">Page Name</th>
            <th style="width: 38%;">Canonical Live Route</th>
            <th>Business & Patron Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Shopping Bag</strong></td>
            <td><a class="page-link" href="https://kalajay.theluxestudio.in/cart/">/cart/</a></td>
            <td>Full-page bag review, coupon codes, and free delivery threshold</td>
          </tr>
          <tr>
            <td><strong>Secured Checkout</strong></td>
            <td><a class="page-link" href="https://kalajay.theluxestudio.in/checkout/">/checkout/</a></td>
            <td>Shipping address entry, price breakdown, and secure payment processing</td>
          </tr>
          <tr>
            <td><strong>Patron Sign In</strong></td>
            <td><a class="page-link" href="https://kalajay.theluxestudio.in/login/">/login/</a></td>
            <td>Mobile OTP passcode login, password fallback, 1-click evaluation demo</td>
          </tr>
          <tr>
            <td><strong>Circle Registration</strong></td>
            <td><a class="page-link" href="https://kalajay.theluxestudio.in/signup/">/signup/</a></td>
            <td>Patron account registration with ₹300 welcome gift incentive</td>
          </tr>
          <tr>
            <td><strong>Patron Dashboard</strong></td>
            <td><a class="page-link" href="https://kalajay.theluxestudio.in/account/">/account/</a></td>
            <td>Patron profile, saved delivery addresses, and membership tier status</td>
          </tr>
          <tr>
            <td><strong>Order Chronicle</strong></td>
            <td><a class="page-link" href="https://kalajay.theluxestudio.in/account/orders/">/account/orders/</a></td>
            <td>Patron order history, detailed receipts, and downloadable tax invoices</td>
          </tr>
          <tr>
            <td><strong>Shipment Tracker</strong></td>
            <td><a class="page-link" href="https://kalajay.theluxestudio.in/track/">/track/</a></td>
            <td>Live courier tracking via Tracking ID or Order Number</td>
          </tr>
          <tr>
            <td><strong>Affection List</strong></td>
            <td><a class="page-link" href="https://kalajay.theluxestudio.in/wishlist/">/wishlist/</a></td>
            <td>Saved handcrafted pieces with instant "Move to Bag" buttons</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="doc-footer">
      <span>Prepared by The Luxe Studio for Kalajay Handcrafted</span>
      <span>Page 5 &middot; kalajay.theluxestudio.in</span>
    </div>
  </div>

  <!-- ================= PAGE 6: COLLECTIONS & CLIENT HANDOVER NOTES ================= -->
  <div class="page">
    <div>
      <div class="doc-header">
        <span class="brand-title">KALAJAY</span>
        <span class="studio-pill">The Luxe Studio &middot; Handover Dossier</span>
      </div>

      <span class="stamp">Section 05 &middot; Collections & Client Handover</span>
      <h2>Curated Collections & Client Care</h2>
      <p class="lead">
        The 9 curated collection hubs categorizing your 69 creations, followed by customer care policies and launch instructions.
      </p>

      <h3 style="margin-top: 2.5mm; margin-bottom: 1.5mm;">The 9 Curated Collection Hubs</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 22%;">Collection</th>
            <th style="width: 40%;">Canonical Live Route</th>
            <th style="width: 8%;">Items</th>
            <th>Curated Products Included</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Organisers</strong></td>
            <td><a class="page-link" href="https://kalajay.theluxestudio.in/collections/organisers/">/collections/organisers/</a></td>
            <td>13</td>
            <td>Pearl jewellery boxes, mirror boxes, pen stands, vanity trays</td>
          </tr>
          <tr>
            <td><strong>Purses</strong></td>
            <td><a class="page-link" href="https://kalajay.theluxestudio.in/collections/purses/">/collections/purses/</a></td>
            <td>22</td>
            <td>Evening clutches, pearl drop bags, baguette bags & totes</td>
          </tr>
          <tr>
            <td><strong>Slings</strong></td>
            <td><a class="page-link" href="https://kalajay.theluxestudio.in/collections/slings/">/collections/slings/</a></td>
            <td>4</td>
            <td>Structured crossbody sling bags & sunset ombre pieces</td>
          </tr>
          <tr>
            <td><strong>AirPod Cases</strong></td>
            <td><a class="page-link" href="https://kalajay.theluxestudio.in/collections/airpod-cases/">/collections/airpod-cases/</a></td>
            <td>5</td>
            <td>Crystal, pearl & fluorescent handcrafted protective cases</td>
          </tr>
          <tr>
            <td><strong>Coasters & Mats</strong></td>
            <td><a class="page-link" href="https://kalajay.theluxestudio.in/collections/coasters-mats/">/collections/coasters-mats/</a></td>
            <td>10</td>
            <td>Beaded table runners, hexagon coaster sets, accent placemats</td>
          </tr>
          <tr>
            <td><strong>Candle Holders</strong></td>
            <td><a class="page-link" href="https://kalajay.theluxestudio.in/collections/candle-holders/">/collections/candle-holders/</a></td>
            <td>2</td>
            <td>Luminous pearl and multi-color beaded tealight holders</td>
          </tr>
          <tr>
            <td><strong>Key Rings</strong></td>
            <td><a class="page-link" href="https://kalajay.theluxestudio.in/collections/key-rings/">/collections/key-rings/</a></td>
            <td>6</td>
            <td>Custom alphabet initials, music notes & pearl heart keyrings</td>
          </tr>
          <tr>
            <td><strong>Crochet Magic</strong></td>
            <td><a class="page-link" href="https://kalajay.theluxestudio.in/collections/crochet-magic/">/collections/crochet-magic/</a></td>
            <td>4</td>
            <td>Hand-crocheted bookmarks, flower charms & keyrings</td>
          </tr>
          <tr>
            <td><strong>Little Treasures</strong></td>
            <td><a class="page-link" href="https://kalajay.theluxestudio.in/collections/little-treasures/">/collections/little-treasures/</a></td>
            <td>3</td>
            <td>Crystal bling bottles, coin bags & custom name plaques</td>
          </tr>
        </tbody>
      </table>

      <h3 style="margin-top: 3mm; margin-bottom: 1.5mm;">Customer Concierge & Legal Policies</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 22%;">Section</th>
            <th style="width: 40%;">Canonical Live Route</th>
            <th>Policy & Assurance Details</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Concierge Desk</strong></td>
            <td><a class="page-link" href="https://kalajay.theluxestudio.in/contact/">/contact/</a></td>
            <td>Direct studio contact, WhatsApp hotline (+91 97405 40847), Mumbai studio</td>
          </tr>
          <tr>
            <td><strong>FAQ & Care</strong></td>
            <td><a class="page-link" href="https://kalajay.theluxestudio.in/faq/">/faq/</a></td>
            <td>Detailed bead care, storage guidelines, transit protection questions</td>
          </tr>
          <tr>
            <td><strong>Shipping & Guarantee</strong></td>
            <td><a class="page-link" href="https://kalajay.theluxestudio.in/shipping-returns/">/shipping-returns/</a></td>
            <td>Free shipping above ₹599, 48-hour transit protection replacement pledge</td>
          </tr>
          <tr>
            <td><strong>Privacy Policy</strong></td>
            <td><a class="page-link" href="https://kalajay.theluxestudio.in/privacy/">/privacy/</a></td>
            <td>Patron data protection, OTP verification safeguards, encrypted sessions</td>
          </tr>
          <tr>
            <td><strong>Terms of Service</strong></td>
            <td><a class="page-link" href="https://kalajay.theluxestudio.in/terms/">/terms/</a></td>
            <td>Artisan handcrafting warranty, delivery terms, patron agreement</td>
          </tr>
          <tr>
            <td><strong>Artisanal 404</strong></td>
            <td><a class="page-link" href="https://kalajay.theluxestudio.in/404">/404</a></td>
            <td>Custom error recovery page directing patrons back to top collections</td>
          </tr>
        </tbody>
      </table>

      <div class="card" style="margin-top: 2.5mm; background: #FAF7F2; border-color: #E0CBAB; padding: 2.8mm 3.5mm;">
        <p style="font-size: 8pt; color: #44403C; margin: 0; line-height: 1.45;">
          <strong style="color: #141312;">Client Handover Sign-Off:</strong> Your website is 100% production ready and live on AWS Amplify CloudFront edge at <a href="https://main.d1fnh1ysikb7wo.amplifyapp.com" style="color: #9A7D55; font-weight: 600;">https://main.d1fnh1ysikb7wo.amplifyapp.com</a>. When you wish to point your apex domain (e.g. <code>kalajay.in</code>), create a DNS <code>CNAME</code> record pointing to the CloudFront distribution.
        </p>
      </div>
    </div>

    <div class="doc-footer">
      <span>Prepared by The Luxe Studio for Kalajay Handcrafted</span>
      <span>Page 6 &middot; kalajay.theluxestudio.in</span>
    </div>
  </div>

</body>
</html>
`;

async function generatePDF() {
  console.log('Launching browser for client handover PDF generation...');
  const browser = await chromium.launch({ channel: 'msedge' });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Setting HTML content and loading typography...');
  await page.setContent(HTML_CONTENT, { waitUntil: 'networkidle' });
  await page.evaluateHandle('document.fonts.ready');
  await page.waitForTimeout(1000);

  const outputPath = path.resolve('kalajay-client-handover-monograph.pdf');
  const mainPdfPath = path.resolve('kalajay-brand-specification.pdf');
  const publicPath = path.resolve('public/kalajay-client-handover-monograph.pdf');
  const publicMainPath = path.resolve('public/kalajay-brand-specification.pdf');
  const outPath = path.resolve('out/kalajay-client-handover-monograph.pdf');
  const outMainPath = path.resolve('out/kalajay-brand-specification.pdf');

  console.log('Rendering high-resolution print PDF...');
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '10mm',
      bottom: '10mm',
      left: '11mm',
      right: '11mm'
    },
    displayHeaderFooter: false,
    preferCSSPageSize: true
  });

  // Mirror to all standard download paths so both file names work seamlessly
  fs.copyFileSync(outputPath, mainPdfPath);
  fs.copyFileSync(outputPath, publicPath);
  fs.copyFileSync(outputPath, publicMainPath);
  fs.copyFileSync(outputPath, outPath);
  fs.copyFileSync(outputPath, outMainPath);

  await browser.close();
  console.log(`Client Handover PDF successfully generated at: ${outputPath}`);

  const stats = fs.statSync(outputPath);
  console.log(`File size: ${(stats.size / 1024).toFixed(2)} KB`);
}

generatePDF().catch(err => {
  console.error('Error generating client handover PDF:', err);
  process.exit(1);
});

