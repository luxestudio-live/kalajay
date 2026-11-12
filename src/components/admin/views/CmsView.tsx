'use client';

import React, { useState } from 'react';
import {
  LayoutTemplate,
  FileText,
  Megaphone,
  Image as ImageIcon,
  BookOpen,
  HelpCircle,
  Globe,
  Edit2,
  Eye,
  CheckCircle2,
  Plus,
  Trash2,
  Upload,
  Copy,
  ExternalLink,
  Smartphone,
  Monitor,
  Sparkles,
  Save,
  Search,
  X,
  AlertTriangle,
  ArrowRight,
  Sliders,
  Check,
} from 'lucide-react';
import { useAdminStore } from '@/data/AdminStoreContext';
import { BannerItem } from '@/data/adminTypes';
import { ARTISAN_STORIES } from '@/data/extras';

interface PageInventoryItem {
  id: string;
  route: string;
  name: string;
  sections: number;
  lastEdited: string;
  status: 'Published' | 'Draft';
  template: 'Editorial Luxury' | 'Minimal Grid' | 'Full Cover Story';
}

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: 'Craft & Looms' | 'Materials' | 'Shipping & Fulfilment' | 'Custom Orders' | 'Product Care' | 'Returns & Refunds';
  order: number;
}

interface SeoPageConfig {
  route: string;
  pageName: string;
  title: string;
  description: string;
  canonicalUrl: string;
  ogImage: string;
  allowIndexing: boolean;
  keywords: string;
}

interface MediaAsset {
  id: string;
  name: string;
  url: string;
  dimensions: string;
  size: string;
  category: 'Product' | 'Lifestyle' | 'Atelier' | 'Campaign';
}

interface ArtisanMaker {
  id: string;
  name: string;
  location: string;
  experience: string;
  quote: string;
  specialty?: string;
}

const INITIAL_PAGES: PageInventoryItem[] = [
  { id: 'pg-1', route: '/', name: 'Home Flagship', sections: 12, lastEdited: '2026-11-11', status: 'Published', template: 'Editorial Luxury' },
  { id: 'pg-2', route: '/shop', name: 'Shop All Pieces', sections: 4, lastEdited: '2026-11-10', status: 'Published', template: 'Minimal Grid' },
  { id: 'pg-3', route: '/story', name: 'Our Story & Heritage', sections: 6, lastEdited: '2026-11-11', status: 'Published', template: 'Full Cover Story' },
  { id: 'pg-4', route: '/atelier', name: 'The Craft House (Looms)', sections: 5, lastEdited: '2026-11-09', status: 'Published', template: 'Full Cover Story' },
  { id: 'pg-5', route: '/customise', name: 'Bespoke Studio', sections: 4, lastEdited: '2026-11-11', status: 'Published', template: 'Editorial Luxury' },
  { id: 'pg-6', route: '/gifting', name: 'Gifting Concierge', sections: 5, lastEdited: '2026-11-08', status: 'Published', template: 'Editorial Luxury' },
  { id: 'pg-7', route: '/corporate-gifting', name: 'Corporate & Wedding', sections: 5, lastEdited: '2026-11-07', status: 'Published', template: 'Editorial Luxury' },
  { id: 'pg-8', route: '/cart', name: 'Shopping Bag', sections: 3, lastEdited: '2026-11-11', status: 'Published', template: 'Minimal Grid' },
  { id: 'pg-9', route: '/checkout', name: 'Checkout & Payment', sections: 3, lastEdited: '2026-11-11', status: 'Published', template: 'Minimal Grid' },
  { id: 'pg-10', route: '/account', name: 'Patron Portal', sections: 5, lastEdited: '2026-11-10', status: 'Published', template: 'Minimal Grid' },
  { id: 'pg-11', route: '/track', name: 'Live Order Tracking', sections: 3, lastEdited: '2026-11-11', status: 'Published', template: 'Minimal Grid' },
  { id: 'pg-12', route: '/faq', name: 'Frequently Asked Questions', sections: 4, lastEdited: '2026-11-06', status: 'Published', template: 'Minimal Grid' },
  { id: 'pg-13', route: '/shipping-returns', name: 'Shipping & Returns Policy', sections: 3, lastEdited: '2026-11-06', status: 'Published', template: 'Minimal Grid' },
  { id: 'pg-14', route: '/privacy', name: 'Privacy Policy (DPDP)', sections: 2, lastEdited: '2026-11-01', status: 'Published', template: 'Minimal Grid' },
  { id: 'pg-15', route: '/terms', name: 'Terms of Service', sections: 2, lastEdited: '2026-11-01', status: 'Published', template: 'Minimal Grid' },
];

const INITIAL_FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'Craft & Looms',
    question: 'How are Kalajay beaded creations crafted?',
    answer: 'Each piece is hand-strung bead by bead by our master women artisans in Bihar on traditional wooden looms. It requires between 10 to 18 patient hours of tension alignment to weave a single heirloom vanity box.',
    order: 1,
  },
  {
    id: 'faq-2',
    category: 'Materials',
    question: 'What materials are used for the beadwork and frame?',
    answer: 'We exclusively use high-refraction Czech faceted crystal glass beads, lustrous synthetic pearls, coated high-tensile steel wire, tarnish-resistant brass clasps, and pure mulberry silk interior linings.',
    order: 2,
  },
  {
    id: 'faq-3',
    category: 'Shipping & Fulfilment',
    question: 'What are the delivery charges and timelines?',
    answer: 'We offer complimentary express delivery across India on all orders above ₹599. Every order is packaged in a wax-sealed gift box and dispatched within 48 hours via BlueDart Express or Delhivery.',
    order: 3,
  },
  {
    id: 'faq-4',
    category: 'Custom Orders',
    question: 'Can I customize a piece for a bridal outfit or anniversary?',
    answer: 'Yes! Use our /customise Bespoke Studio or message our WhatsApp Concierge (+91 97405 40847). You can choose personalized bead palettes, initials/monograms, and custom strap drop lengths.',
    order: 4,
  },
  {
    id: 'faq-5',
    category: 'Product Care',
    question: 'How should I clean and preserve my beaded heirloom?',
    answer: 'Gently wipe with a soft, dry microfibre cloth. Avoid direct contact with perfumes, alcohol-based hairsprays, or chemical solvents. Store inside the included mulberry silk drawstring pouch.',
    order: 5,
  },
  {
    id: 'faq-6',
    category: 'Returns & Refunds',
    question: 'What is your transit damage and exchange guarantee?',
    answer: 'Every Kalajay shipment is insured. In the rare event of transit damage, we provide a 100% free immediate replacement within 48 hours. We also offer 7-day exchanges on unused pieces in original wax seals.',
    order: 6,
  },
];

const INITIAL_SEO: SeoPageConfig[] = [
  {
    route: '/',
    pageName: 'Home Flagship',
    title: 'Kalajay — A World of Little Wonders | Handcrafted Luxury Accessories',
    description: 'Discover handcrafted beaded vanity boxes, evening purses, clutches, and AirPod jewel cases hand-strung one bead at a time by 21 master women artisans in India.',
    canonicalUrl: 'https://kalajay.theluxestudio.in/',
    ogImage: 'https://kalajay.theluxestudio.in/og-home.jpg',
    allowIndexing: true,
    keywords: 'beaded handbag, handcrafted pearl jewellery box, luxury bridal clutch, artisan craft Bihar',
  },
  {
    route: '/shop',
    pageName: 'Shop All Pieces',
    title: 'Handcrafted Beaded Creations & Objects of Affection | Kalajay',
    description: 'Explore the complete archive of 69 handcrafted beaded wonders: vanity cases, envelope clutches, cross-body slings, and crystal table lanterns.',
    canonicalUrl: 'https://kalajay.theluxestudio.in/shop',
    ogImage: 'https://kalajay.theluxestudio.in/og-shop.jpg',
    allowIndexing: true,
    keywords: 'beaded bags online, pearl evening clutch, luxury vanity box India, slow craft luxury',
  },
  {
    route: '/customise',
    pageName: 'Bespoke Studio',
    title: 'Customise Your Handcrafted Heirloom | Kalajay Bespoke Studio',
    description: 'Co-create your bespoke beaded creation. Select your silhouette, Czech crystal palette, and personal monogram with our atelier master artisans.',
    canonicalUrl: 'https://kalajay.theluxestudio.in/customise',
    ogImage: 'https://kalajay.theluxestudio.in/og-customise.jpg',
    allowIndexing: true,
    keywords: 'custom beaded bag, monogrammed bridal purse, bespoke vanity box India',
  },
  {
    route: '/story',
    pageName: 'Our Story & Artisans',
    title: 'The Artisanal Sisterhood — 21 Women Makers | Kalajay Heritage',
    description: 'Read the chronicle of Kalajay: an artisanal collective honoring ancient loom traditions, living wages, and women empowerment in Madhubani, Bihar.',
    canonicalUrl: 'https://kalajay.theluxestudio.in/story',
    ogImage: 'https://kalajay.theluxestudio.in/og-story.jpg',
    allowIndexing: true,
    keywords: 'women artisans India, Madhubani craft collective, handcrafted beadwork heritage',
  },
  {
    route: '/faq',
    pageName: 'Frequently Asked Questions',
    title: 'FAQs & Product Care Guide | Kalajay Handcrafted Luxuries',
    description: 'Frequently asked questions regarding loom craft timelines, Czech beads, BlueDart shipping, custom bridal orders, and heirloom care advice.',
    canonicalUrl: 'https://kalajay.theluxestudio.in/faq',
    ogImage: 'https://kalajay.theluxestudio.in/og-faq.jpg',
    allowIndexing: true,
    keywords: 'Kalajay FAQ, beaded bag care guide, luxury bag shipping India',
  },
];

const INITIAL_MEDIA: MediaAsset[] = [
  {
    id: 'med-1',
    name: 'Signature Pearl Vanity Box (Hero)',
    url: 'https://www.kalajay.in/media/products/c6ba77320bf18d7c8d58f35eb9cecc5b8f79055d2b92fae00d22cfdbc40d3f85.webp',
    dimensions: '1200 x 1200 px',
    size: '142 KB',
    category: 'Product',
  },
  {
    id: 'med-2',
    name: 'Vintage Pearl Evening Bag (Atelier)',
    url: 'https://www.kalajay.in/v2/p3-2.jpg',
    dimensions: '1080 x 1350 px',
    size: '210 KB',
    category: 'Lifestyle',
  },
  {
    id: 'med-3',
    name: 'Crystal Beaded Tealight Lantern',
    url: 'https://www.kalajay.in/media/products/82de6afd08ff448280211f0bfcc8dde73ecbfa427b97749596ad38de44c9d763.webp',
    dimensions: '1200 x 1200 px',
    size: '188 KB',
    category: 'Product',
  },
  {
    id: 'med-4',
    name: 'Luminous Pearl Envelope Clutch',
    url: 'https://www.kalajay.in/media/products/b57e3efd6e2f7c2f0bcac6be9aaf5e1b506ff561e72739f1c3041d6fbf4afe8b.webp',
    dimensions: '1200 x 1200 px',
    size: '165 KB',
    category: 'Product',
  },
  {
    id: 'med-5',
    name: 'Pastel Blossoms Crossbody Sling',
    url: 'https://www.kalajay.in/v2/p2-2.jpg',
    dimensions: '1080 x 1080 px',
    size: '195 KB',
    category: 'Campaign',
  },
  {
    id: 'med-6',
    name: 'Bihar Atelier Wooden Loom Weaving',
    url: 'https://www.kalajay.in/v2/banner-1.jpg',
    dimensions: '1920 x 800 px',
    size: '340 KB',
    category: 'Atelier',
  },
];

const INITIAL_ARTISANS: ArtisanMaker[] = [
  {
    id: 'art-1',
    name: 'Sunita Devi',
    location: 'Madhubani Craft House, Bihar',
    experience: '8 years of bead loom mastery',
    quote: 'When I sit down with a tray of crystal beads, time slows down. Stringing each row with exact tension requires complete presence. Knowing that our boxes and purses travel to homes across India and abroad gives our hands immense pride.',
    specialty: 'Signature Pearl Vanity Boxes',
  },
  {
    id: 'art-2',
    name: 'Pooja Kumari',
    location: 'Patna Studio, Bihar',
    experience: 'Specialist in sculptural bag weaving',
    quote: 'The honeycomb and diamond purse patterns require counting every single bead so the bag stands upright without collapsing. It is geometry made with love and devotion.',
    specialty: 'Structured Evening Clutches',
  },
  {
    id: 'art-3',
    name: 'Amina Sheikh',
    location: 'Bandra Studio, Mumbai',
    experience: 'Finishing, quality control & bridal curation',
    quote: 'Before any piece leaves our studio, I inspect the knots, the silk lining, and the magnetic clasps. It must feel like an heirloom the moment you open the box.',
    specialty: 'Wax Sealing & Master QC',
  },
  {
    id: 'art-4',
    name: 'Renu Devi',
    location: 'Madhubani Hub · Loom A2',
    experience: '12 years master weaver',
    quote: 'The rhythm of the wooden loom is like music in the atelier. Each bead row is tightly locked so it never loosens even after decades of use.',
    specialty: 'High-Tensile Wire Loom Weaving',
  },
];

export default function CmsView() {
  const {
    homepageSections,
    updateHomepageSection,
    banners,
    updateBanner,
    createBanner,
    deleteBanner,
    activeSubPage,
    setActiveSubPage,
    logAction,
    can,
  } = useAdminStore();

  // Active subpage to internal tab mapper
  const getTabFromSubPage = (sub: string): 'homepage' | 'pages' | 'banners' | 'media' | 'artisans' | 'policies' | 'seo' => {
    switch (sub) {
      case 'cms.banners': return 'banners';
      case 'cms.media': return 'media';
      case 'cms.story': return 'artisans';
      case 'cms.navigation': return 'pages';
      case 'cms.policies': return 'policies';
      case 'cms.seo': return 'seo';
      case 'cms.homepage':
      default: return 'homepage';
    }
  };

  const activeTab = getTabFromSubPage(activeSubPage);

  const handleTabClick = (tabId: string) => {
    const subMap: Record<string, string> = {
      homepage: 'cms.homepage',
      banners: 'cms.banners',
      media: 'cms.media',
      artisans: 'cms.story',
      pages: 'cms.navigation',
      policies: 'cms.policies',
      seo: 'cms.seo',
    };
    setActiveSubPage(subMap[tabId] || 'cms.homepage');
  };

  // State collections
  const [pages, setPages] = useState<PageInventoryItem[]>(INITIAL_PAGES);
  const [faqs, setFaqs] = useState<FaqItem[]>(INITIAL_FAQS);
  const [seoConfigs, setSeoConfigs] = useState<SeoPageConfig[]>(INITIAL_SEO);
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>(INITIAL_MEDIA);
  const [artisans, setArtisans] = useState<ArtisanMaker[]>(INITIAL_ARTISANS);

  // Policy threshold settings
  const [shippingThreshold, setShippingThreshold] = useState(599);
  const [dispatchHours, setDispatchHours] = useState(48);
  const [returnDays, setReturnDays] = useState(7);
  const [helplineNumber, setHelplineNumber] = useState('+91 97405 40847');

  // Homepage builder state
  const [selectedSectionId, setSelectedSectionId] = useState<string>('sec-hero');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Modals state
  // 1. FAQ Modal
  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  const [faqCategory, setFaqCategory] = useState<FaqItem['category']>('Craft & Looms');

  // 2. SEO Modal
  const [seoModalOpen, setSeoModalOpen] = useState(false);
  const [editingSeo, setEditingSeo] = useState<SeoPageConfig | null>(null);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDesc, setSeoDesc] = useState('');
  const [seoCanonical, setSeoCanonical] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [seoIndexing, setSeoIndexing] = useState(true);

  // 3. Media Upload Modal
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [newMediaName, setNewMediaName] = useState('');
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaCategory, setNewMediaCategory] = useState<MediaAsset['category']>('Product');
  const [newMediaDimensions, setNewMediaDimensions] = useState('1200 x 1200 px');

  // 4. Artisan Modal
  const [artisanModalOpen, setArtisanModalOpen] = useState(false);
  const [editingArtisan, setEditingArtisan] = useState<ArtisanMaker | null>(null);
  const [artisanName, setArtisanName] = useState('');
  const [artisanLocation, setArtisanLocation] = useState('');
  const [artisanExperience, setArtisanExperience] = useState('');
  const [artisanQuote, setArtisanQuote] = useState('');
  const [artisanSpecialty, setArtisanSpecialty] = useState('');

  // 5. Page Config Modal
  const [pageModalOpen, setPageModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<PageInventoryItem | null>(null);
  const [pageName, setPageName] = useState('');
  const [pageRoute, setPageRoute] = useState('');
  const [pageStatus, setPageStatus] = useState<'Published' | 'Draft'>('Published');
  const [pageTemplate, setPageTemplate] = useState<PageInventoryItem['template']>('Editorial Luxury');

  // 6. Banner Modal
  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerText, setBannerText] = useState('');
  const [bannerCtaText, setBannerCtaText] = useState('Explore');
  const [bannerCtaUrl, setBannerCtaUrl] = useState('/shop');
  const [bannerLoc, setBannerLoc] = useState<BannerItem['location']>('top-ticker');

  const showToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 3000);
  };

  const activeSection = homepageSections.find(s => s.id === selectedSectionId) || homepageSections[0];

  const handleFieldChange = (key: string, value: any) => {
    updateHomepageSection(selectedSectionId, { [key]: value });
    showToast('Section content updated in live operational store.');
  };

  // --- FAQ Handlers ---
  const handleOpenAddFaq = () => {
    setEditingFaq(null);
    setFaqQuestion('');
    setFaqAnswer('');
    setFaqCategory('Craft & Looms');
    setFaqModalOpen(true);
  };

  const handleOpenEditFaq = (faq: FaqItem) => {
    setEditingFaq(faq);
    setFaqQuestion(faq.question);
    setFaqAnswer(faq.answer);
    setFaqCategory(faq.category);
    setFaqModalOpen(true);
  };

  const handleSaveFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqQuestion.trim() || !faqAnswer.trim()) return;

    if (editingFaq) {
      setFaqs(prev =>
        prev.map(f =>
          f.id === editingFaq.id
            ? { ...f, question: faqQuestion.trim(), answer: faqAnswer.trim(), category: faqCategory }
            : f
        )
      );
      logAction('UPDATE_FAQ', 'cms', `Updated FAQ question: "${faqQuestion.slice(0, 30)}..."`);
      showToast('FAQ updated successfully');
    } else {
      const newFaq: FaqItem = {
        id: `faq-${Date.now()}`,
        question: faqQuestion.trim(),
        answer: faqAnswer.trim(),
        category: faqCategory,
        order: faqs.length + 1,
      };
      setFaqs(prev => [...prev, newFaq]);
      logAction('CREATE_FAQ', 'cms', `Added new FAQ question: "${faqQuestion.slice(0, 30)}..."`);
      showToast('New FAQ added successfully');
    }
    setFaqModalOpen(false);
  };

  const handleDeleteFaq = (id: string) => {
    if (confirm('Are you sure you want to delete this FAQ question?')) {
      setFaqs(prev => prev.filter(f => f.id !== id));
      logAction('DELETE_FAQ', 'cms', `Deleted FAQ #${id}`);
      showToast('FAQ removed');
    }
  };

  const handleSavePolicies = (e: React.FormEvent) => {
    e.preventDefault();
    logAction('UPDATE_STORE_POLICIES', 'cms', `Updated store thresholds: Free shipping ₹${shippingThreshold}, Dispatch ${dispatchHours}h, Returns ${returnDays}d`);
    showToast('Store policies and delivery thresholds saved to live storefront!');
  };

  // --- SEO Handlers ---
  const handleOpenEditSeo = (seo: SeoPageConfig) => {
    setEditingSeo(seo);
    setSeoTitle(seo.title);
    setSeoDesc(seo.description);
    setSeoCanonical(seo.canonicalUrl);
    setSeoKeywords(seo.keywords);
    setSeoIndexing(seo.allowIndexing);
    setSeoModalOpen(true);
  };

  const handleSaveSeo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSeo) return;

    setSeoConfigs(prev =>
      prev.map(s =>
        s.route === editingSeo.route
          ? {
              ...s,
              title: seoTitle.trim(),
              description: seoDesc.trim(),
              canonicalUrl: seoCanonical.trim(),
              keywords: seoKeywords.trim(),
              allowIndexing: seoIndexing,
            }
          : s
      )
    );
    logAction('UPDATE_PAGE_SEO', 'cms', `Updated SEO metadata for route: ${editingSeo.route}`);
    showToast(`Updated SEO & Meta tags for ${editingSeo.pageName}`);
    setSeoModalOpen(false);
  };

  // --- Media Handlers ---
  const handleSaveMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMediaName.trim()) return;

    const newAsset: MediaAsset = {
      id: `med-${Date.now()}`,
      name: newMediaName.trim(),
      url: newMediaUrl.trim() || 'https://www.kalajay.in/v2/banner-1.jpg',
      dimensions: newMediaDimensions,
      size: '180 KB',
      category: newMediaCategory,
    };
    setMediaAssets(prev => [newAsset, ...prev]);
    logAction('UPLOAD_MEDIA_ASSET', 'cms', `Uploaded media asset: ${newMediaName}`);
    showToast(`Uploaded "${newMediaName}" to digital asset library`);
    setMediaModalOpen(false);
    setNewMediaName('');
    setNewMediaUrl('');
  };

  const handleDeleteMedia = (id: string) => {
    if (confirm('Are you sure you want to delete this media asset?')) {
      setMediaAssets(prev => prev.filter(m => m.id !== id));
      logAction('DELETE_MEDIA_ASSET', 'cms', `Deleted media asset #${id}`);
      showToast('Media asset removed from gallery');
    }
  };

  // --- Artisan Handlers ---
  const handleOpenAddArtisan = () => {
    setEditingArtisan(null);
    setArtisanName('');
    setArtisanLocation('Madhubani Craft House, Bihar');
    setArtisanExperience('6 years of bead weaving');
    setArtisanQuote('');
    setArtisanSpecialty('Pearl Beadwork');
    setArtisanModalOpen(true);
  };

  const handleOpenEditArtisan = (artisan: ArtisanMaker) => {
    setEditingArtisan(artisan);
    setArtisanName(artisan.name);
    setArtisanLocation(artisan.location);
    setArtisanExperience(artisan.experience);
    setArtisanQuote(artisan.quote);
    setArtisanSpecialty(artisan.specialty || '');
    setArtisanModalOpen(true);
  };

  const handleSaveArtisan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!artisanName.trim()) return;

    if (editingArtisan) {
      setArtisans(prev =>
        prev.map(a =>
          a.id === editingArtisan.id
            ? {
                ...a,
                name: artisanName.trim(),
                location: artisanLocation.trim(),
                experience: artisanExperience.trim(),
                quote: artisanQuote.trim(),
                specialty: artisanSpecialty.trim(),
              }
            : a
        )
      );
      logAction('UPDATE_ARTISAN', 'cms', `Updated profile for artisan maker: ${artisanName}`);
      showToast(`Updated artisan profile for ${artisanName}`);
    } else {
      const newMaker: ArtisanMaker = {
        id: `art-${Date.now()}`,
        name: artisanName.trim(),
        location: artisanLocation.trim(),
        experience: artisanExperience.trim(),
        quote: artisanQuote.trim(),
        specialty: artisanSpecialty.trim(),
      };
      setArtisans(prev => [...prev, newMaker]);
      logAction('CREATE_ARTISAN', 'cms', `Added new artisan maker: ${artisanName}`);
      showToast(`Added master artisan ${artisanName} to collective`);
    }
    setArtisanModalOpen(false);
  };

  const handleDeleteArtisan = (id: string) => {
    if (confirm('Are you sure you want to delete this artisan profile?')) {
      setArtisans(prev => prev.filter(a => a.id !== id));
      logAction('DELETE_ARTISAN', 'cms', `Deleted artisan profile #${id}`);
      showToast('Artisan profile removed');
    }
  };

  // --- Page Inventory Handlers ---
  const handleOpenEditPage = (page: PageInventoryItem) => {
    setEditingPage(page);
    setPageName(page.name);
    setPageRoute(page.route);
    setPageStatus(page.status);
    setPageTemplate(page.template);
    setPageModalOpen(true);
  };

  const handleSavePage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage) return;

    setPages(prev =>
      prev.map(p =>
        p.id === editingPage.id
          ? {
              ...p,
              name: pageName.trim(),
              status: pageStatus,
              template: pageTemplate,
              lastEdited: new Date().toISOString().split('T')[0],
            }
          : p
      )
    );
    logAction('UPDATE_STOREFRONT_PAGE', 'cms', `Updated page configuration for ${editingPage.route}`);
    showToast(`Saved layout settings for ${pageName}`);
    setPageModalOpen(false);
  };

  // --- Banner Handlers ---
  const handleOpenAddBanner = () => {
    setEditingBanner(null);
    setBannerTitle('');
    setBannerText('');
    setBannerCtaText('Explore');
    setBannerCtaUrl('/shop');
    setBannerLoc('top-ticker');
    setBannerModalOpen(true);
  };

  const handleOpenEditBanner = (banner: BannerItem) => {
    setEditingBanner(banner);
    setBannerTitle(banner.title);
    setBannerText(banner.text);
    setBannerCtaText(banner.ctaText || 'Explore');
    setBannerCtaUrl(banner.ctaUrl || '/shop');
    setBannerLoc(banner.location);
    setBannerModalOpen(true);
  };

  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerTitle.trim() || !bannerText.trim()) return;

    if (editingBanner) {
      updateBanner(editingBanner.id, {
        title: bannerTitle.trim(),
        text: bannerText.trim(),
        ctaText: bannerCtaText.trim(),
        ctaUrl: bannerCtaUrl.trim(),
        location: bannerLoc,
      });
      logAction('UPDATE_BANNER', 'cms', `Updated announcement banner: ${bannerTitle}`);
      showToast(`Updated announcement banner "${bannerTitle}"`);
    } else {
      createBanner({
        title: bannerTitle.trim(),
        text: bannerText.trim(),
        ctaText: bannerCtaText.trim(),
        ctaUrl: bannerCtaUrl.trim(),
        location: bannerLoc,
        priority: 5,
        startDate: new Date().toISOString().split('T')[0],
        endDate: '2026-12-31',
        isActive: true,
      });
      logAction('CREATE_BANNER', 'cms', `Created announcement banner: ${bannerTitle}`);
      showToast(`Created announcement banner "${bannerTitle}"`);
    }
    setBannerModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DED3C5]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#9E5430]/10 text-[#9E5430] text-[10.5px] uppercase tracking-wider font-semibold mb-1">
            <LayoutTemplate className="w-3.5 h-3.5" />
            <span>Structured Visual CMS</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#372921] font-semibold">
            Website &amp; Content Management
          </h1>
          <p className="text-xs sm:text-sm text-[#76695F] mt-1">
            Edit storefront copy, hero showcases, announcement tickers, artisan stories, FAQs, and global SEO.
          </p>
        </div>

        {saveToast && (
          <span className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 font-medium animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{saveToast}</span>
          </span>
        )}
      </div>

      {/* 2. SUB-NAVIGATION TABS (Two-Way Synced) */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-[#DED3C5] text-xs">
        {[
          { id: 'homepage', label: 'Homepage Builder', icon: LayoutTemplate },
          { id: 'pages', label: `All Pages (${pages.length})`, icon: FileText },
          { id: 'banners', label: `Banners & Marquee (${banners.length})`, icon: Megaphone },
          { id: 'media', label: `Media Library (${mediaAssets.length})`, icon: ImageIcon },
          { id: 'artisans', label: `Our Story & Artisans (${artisans.length})`, icon: BookOpen },
          { id: 'policies', label: `FAQ & Policies (${faqs.length})`, icon: HelpCircle },
          { id: 'seo', label: `SEO & Metadata (${seoConfigs.length})`, icon: Globe },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabClick(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-t-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-white border-t-2 border-t-[#9E5430] border-x border-[#DED3C5] text-[#9E5430] font-semibold shadow-2xs'
                  : 'text-[#76695F] hover:text-[#372921] hover:bg-[#F0E9DF]/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. TAB 1: HOMEPAGE BUILDER */}
      {activeTab === 'homepage' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Section Selector & Field Editor (Span 7) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-2xl border border-[#DED3C5] p-4 shadow-xs">
              <span className="text-[10px] uppercase tracking-wider text-[#A99583] font-bold block mb-2">
                Select Storefront Section to Edit
              </span>
              <div className="flex flex-wrap gap-1.5">
                {homepageSections.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedSectionId(s.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      s.id === selectedSectionId
                        ? 'bg-[#9E5430] text-white shadow-xs font-semibold'
                        : 'bg-[#F7F3EC] text-[#372921] hover:bg-[#EAE2D8]'
                    }`}
                  >
                    <span>{s.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#DED3C5] p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D8]">
                <div>
                  <h3 className="font-serif text-base font-semibold text-[#372921]">
                    {activeSection.name}
                  </h3>
                  <p className="text-[11px] text-[#76695F]">{activeSection.subtitle}</p>
                </div>
                <span className="text-[10px] font-mono text-[#76695F]">
                  Order #{activeSection.order}
                </span>
              </div>

              <div className="space-y-3.5">
                {Object.entries(activeSection.fields).map(([fieldKey, fieldValue]) => (
                  <div key={fieldKey}>
                    <label className="block text-xs font-semibold text-[#372921] mb-1 capitalize">
                      {fieldKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </label>
                    {typeof fieldValue === 'string' && fieldValue.length > 50 ? (
                      <textarea
                        rows={3}
                        value={fieldValue}
                        onChange={e => handleFieldChange(fieldKey, e.target.value)}
                        className="w-full bg-[#FAF8F5] border border-[#DED3C5] rounded-xl p-3 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                      />
                    ) : (
                      <input
                        type="text"
                        value={String(fieldValue ?? '')}
                        onChange={e => handleFieldChange(fieldKey, e.target.value)}
                        className="w-full bg-[#FAF8F5] border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Live Responsive Preview (Span 5) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="bg-white rounded-2xl border border-[#DED3C5] p-4 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#9E5430]" />
                <span className="text-xs font-semibold text-[#372921]">Live Storefront Simulation</span>
              </div>
              <div className="flex items-center gap-1 bg-[#F7F3EC] p-0.5 rounded-lg border border-[#DED3C5]">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-1.5 rounded text-xs cursor-pointer ${
                    previewDevice === 'desktop' ? 'bg-white shadow-2xs text-[#9E5430]' : 'text-[#76695F]'
                  }`}
                  title="Desktop Preview (1440px)"
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-1.5 rounded text-xs cursor-pointer ${
                    previewDevice === 'mobile' ? 'bg-white shadow-2xs text-[#9E5430]' : 'text-[#76695F]'
                  }`}
                  title="Mobile Preview (375px)"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="bg-[#1D1916] rounded-2xl p-4 flex items-center justify-center overflow-hidden border border-[#372921]">
              <div
                className={`bg-[#F7F3EC] text-[#372921] rounded-xl overflow-hidden transition-all duration-300 shadow-2xl ${
                  previewDevice === 'mobile' ? 'w-[320px] min-h-[500px]' : 'w-full min-h-[460px]'
                }`}
              >
                <div className="p-4 border-b border-[#DED3C5] bg-[#FAF8F5] text-center">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#9E5430] block">
                    KALAJAY CRAFT HOUSE
                  </span>
                  <span className="text-[11px] text-[#76695F] italic">A World of Little Wonders</span>
                </div>
                <div className="p-6 space-y-4">
                  <span className="inline-block px-2 py-0.5 rounded-full bg-[#9E5430]/10 text-[#9E5430] text-[10px] font-semibold uppercase">
                    {activeSection.name}
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-[#372921] leading-tight">
                    {activeSection.fields.headline || 'Handcrafted Luxury'}
                  </h3>
                  <p className="text-xs text-[#76695F] leading-relaxed">
                    {activeSection.fields.subheadline || activeSection.fields.storyQuote || 'Small wonders. Patiently made.'}
                  </p>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-full bg-[#372921] text-white text-xs font-semibold"
                  >
                    {activeSection.fields.ctaText || 'Explore Creations'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB 2: ALL PAGES INVENTORY */}
      {activeTab === 'pages' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div>
              <h3 className="font-serif text-lg font-semibold text-[#372921]">
                Storefront Page Directory (15 Active Routes)
              </h3>
              <p className="text-xs text-[#76695F] mt-0.5">
                Manage layout templates, page publishing status, and URL routes.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#DED3C5] shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F7F3EC] text-[#76695F] border-b border-[#DED3C5] text-[10.5px] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Page Title &amp; Slug</th>
                  <th className="py-3 px-4">Layout Template</th>
                  <th className="py-3 px-4 text-center">Sections</th>
                  <th className="py-3 px-4">Last Updated</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE2D8]">
                {pages.map(p => (
                  <tr key={p.id} className="hover:bg-[#FFFCF7] transition-colors">
                    <td className="py-3 px-4">
                      <strong className="text-[#372921] font-semibold block">{p.name}</strong>
                      <span className="font-mono text-[10.5px] text-[#9E5430]">{p.route}</span>
                    </td>
                    <td className="py-3 px-4 text-[#76695F]">
                      <span className="px-2 py-0.5 rounded-full bg-[#F7F3EC] border border-[#DED3C5] text-[10.5px]">
                        {p.template}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-[#372921]">
                      {p.sections}
                    </td>
                    <td className="py-3 px-4 text-[#76695F] text-[11px]">
                      {p.lastEdited}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10.5px] font-semibold">
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenEditPage(p)}
                        className="px-3 py-1 rounded-lg bg-[#FAF8F5] hover:bg-[#F7F3EC] border border-[#DED3C5] text-[#372921] font-medium text-xs inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-[#9E5430]" />
                        <span>Edit Layout</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. TAB 3: BANNERS & MARQUEE */}
      {activeTab === 'banners' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div>
              <h3 className="font-serif text-lg font-semibold text-[#372921]">
                Promotional Banners &amp; Marquee Tickers
              </h3>
              <p className="text-xs text-[#76695F] mt-0.5">
                Top ticker announcement, free delivery callouts, and seasonal marquee strips.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenAddBanner}
              className="px-4 py-2 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Announcement Banner</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {banners.map(banner => (
              <div
                key={banner.id}
                className="bg-white rounded-2xl border border-[#DED3C5] p-5 shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-[#EAE2D8]">
                    <div className="flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-[#9E5430]" />
                      <strong className="font-serif text-base text-[#372921]">{banner.title}</strong>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10.5px] font-semibold">
                      Active
                    </span>
                  </div>

                  <p className="text-xs text-[#76695F] mt-2 leading-relaxed">
                    "{banner.text}"
                  </p>

                  <div className="mt-3 flex items-center gap-2 text-xs">
                    <span className="text-[10px] uppercase font-bold text-[#A99583]">Placement:</span>
                    <span className="px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#DED3C5] text-[#372921] font-mono text-[11px]">
                      {banner.location}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#EAE2D8] flex items-center justify-between">
                  <span className="text-[11px] text-[#76695F]">
                    CTA: <strong>{banner.ctaText}</strong> → {banner.ctaUrl}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditBanner(banner)}
                      className="p-1.5 rounded-lg hover:bg-[#FAF8F5] text-[#76695F] hover:text-[#9E5430] cursor-pointer"
                      title="Edit Banner"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete banner "${banner.title}"?`)) {
                          deleteBanner(banner.id);
                          logAction('DELETE_BANNER', 'cms', `Deleted banner: ${banner.title}`);
                          showToast('Banner removed');
                        }
                      }}
                      className="p-1.5 rounded-lg hover:bg-rose-50 text-[#76695F] hover:text-rose-600 cursor-pointer"
                      title="Delete Banner"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. TAB 4: MEDIA LIBRARY */}
      {activeTab === 'media' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div>
              <h3 className="font-serif text-lg font-semibold text-[#372921]">
                Digital Asset Library &amp; Atelier Photography
              </h3>
              <p className="text-xs text-[#76695F] mt-0.5">
                Inspect image aspect ratios, copy CDN image URLs, and upload new campaign photography.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMediaModalOpen(true)}
              className="px-4 py-2 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload New Asset</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {mediaAssets.map(asset => (
              <div
                key={asset.id}
                className="bg-white rounded-2xl border border-[#DED3C5] p-3 shadow-xs space-y-2 group hover:border-[#9E5430]/60 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-square rounded-xl bg-[#FAF8F5] overflow-hidden border border-[#DED3C5] relative">
                    <img
                      src={asset.url}
                      alt={asset.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(asset.url);
                          showToast(`Copied URL for ${asset.name}`);
                        }}
                        className="p-1.5 rounded-full bg-white/95 shadow text-[#372921] hover:text-[#9E5430] cursor-pointer"
                        title="Copy direct URL"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteMedia(asset.id)}
                        className="p-1.5 rounded-full bg-white/95 shadow text-rose-600 hover:bg-rose-50 cursor-pointer"
                        title="Delete Asset"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-2 space-y-0.5">
                    <span className="text-xs font-semibold text-[#372921] block truncate" title={asset.name}>
                      {asset.name}
                    </span>
                    <div className="flex items-center justify-between text-[10px] text-[#76695F] font-mono">
                      <span>{asset.dimensions}</span>
                      <span>{asset.size}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#EAE2D8] flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-[#9E5430] bg-[#9E5430]/10 px-2 py-0.5 rounded-full">
                    {asset.category}
                  </span>
                  <a
                    href={asset.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10.5px] text-[#76695F] hover:text-[#372921] inline-flex items-center gap-0.5"
                  >
                    <span>View</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. TAB 5: OUR STORY & 21 ARTISANS */}
      {activeTab === 'artisans' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div>
              <h3 className="font-serif text-lg font-semibold text-[#372921]">
                The 21 Women Master Artisans of Kalajay
              </h3>
              <p className="text-xs text-[#76695F] mt-0.5">
                Our collective honors traditional beadwork, fair living wages, and dignified craft autonomy.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenAddArtisan}
              className="px-4 py-2 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Master Artisan Profile</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {artisans.map(artisan => (
              <div
                key={artisan.id}
                className="bg-white rounded-2xl border border-[#DED3C5] p-5 shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#F0E9DF] border border-[#DED3C5] flex items-center justify-center font-serif text-[#9E5430] font-bold text-lg shrink-0">
                        {artisan.name.charAt(0)}
                      </div>
                      <div>
                        <strong className="font-serif text-base text-[#372921] block">
                          {artisan.name}
                        </strong>
                        <span className="text-xs text-[#9E5430] font-medium block">
                          {artisan.experience}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditArtisan(artisan)}
                        className="p-1.5 rounded-lg hover:bg-[#FAF8F5] text-[#76695F] hover:text-[#9E5430] cursor-pointer"
                        title="Edit Profile"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteArtisan(artisan.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-[#76695F] hover:text-rose-600 cursor-pointer"
                        title="Delete Profile"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-[#76695F] leading-relaxed italic font-serif mt-3 bg-[#FAF8F5] p-3 rounded-xl border border-[#EAE2D8]">
                    &ldquo;{artisan.quote}&rdquo;
                  </p>
                </div>

                <div className="pt-2 border-t border-[#EAE2D8] flex items-center justify-between text-[11px] text-[#76695F]">
                  <span>Hub: <strong className="text-[#372921]">{artisan.location}</strong></span>
                  {artisan.specialty && (
                    <span className="text-[#9E5430] font-semibold">{artisan.specialty}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. TAB 6: FAQ & POLICIES (DEDICATED INTERACTIVE SCREEN WITH EDIT/UPDATE/DELETE) */}
      {activeTab === 'policies' && (
        <div className="space-y-6">
          {/* Section 1: Store Policies & Delivery Thresholds Form */}
          <form onSubmit={handleSavePolicies} className="bg-white rounded-2xl border border-[#DED3C5] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D8]">
              <div>
                <h3 className="font-serif text-lg font-semibold text-[#372921] flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#9E5430]" />
                  <span>Storewide Delivery &amp; Operational Thresholds</span>
                </h3>
                <p className="text-xs text-[#76695F] mt-0.5">
                  Update customer-facing policy values used in header tickers, cart free shipping bars, and checkout.
                </p>
              </div>
              <button
                type="submit"
                className="px-5 py-2 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Policy Changes</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#DED3C5]">
                <label className="block text-[11px] font-semibold text-[#372921] mb-1">
                  Free Pan-India Delivery Threshold (₹)
                </label>
                <input
                  type="number"
                  value={shippingThreshold}
                  onChange={e => setShippingThreshold(Number(e.target.value))}
                  className="w-full bg-white border border-[#DED3C5] rounded-lg p-2 font-mono font-bold text-[#372921] text-xs focus:outline-none focus:border-[#9E5430]"
                />
                <span className="text-[10px] text-[#76695F] mt-1 block">
                  Orders above this value get automatic free delivery.
                </span>
              </div>

              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#DED3C5]">
                <label className="block text-[11px] font-semibold text-[#372921] mb-1">
                  Dispatch Timeline Window (Hours)
                </label>
                <input
                  type="number"
                  value={dispatchHours}
                  onChange={e => setDispatchHours(Number(e.target.value))}
                  className="w-full bg-white border border-[#DED3C5] rounded-lg p-2 font-mono font-bold text-[#372921] text-xs focus:outline-none focus:border-[#9E5430]"
                />
                <span className="text-[10px] text-[#76695F] mt-1 block">
                  Handcrafted and dispatched within this time limit.
                </span>
              </div>

              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#DED3C5]">
                <label className="block text-[11px] font-semibold text-[#372921] mb-1">
                  Exchange Window Guarantee (Days)
                </label>
                <input
                  type="number"
                  value={returnDays}
                  onChange={e => setReturnDays(Number(e.target.value))}
                  className="w-full bg-white border border-[#DED3C5] rounded-lg p-2 font-mono font-bold text-[#372921] text-xs focus:outline-none focus:border-[#9E5430]"
                />
                <span className="text-[10px] text-[#76695F] mt-1 block">
                  Allowed exchange period in wax-sealed condition.
                </span>
              </div>

              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#DED3C5]">
                <label className="block text-[11px] font-semibold text-[#372921] mb-1">
                  Concierge WhatsApp Helpline
                </label>
                <input
                  type="text"
                  value={helplineNumber}
                  onChange={e => setHelplineNumber(e.target.value)}
                  className="w-full bg-white border border-[#DED3C5] rounded-lg p-2 font-mono font-bold text-[#372921] text-xs focus:outline-none focus:border-[#9E5430]"
                />
                <span className="text-[10px] text-[#76695F] mt-1 block">
                  Displayed on policy pages and floating widget.
                </span>
              </div>
            </div>
          </form>

          {/* Section 2: Interactive FAQ Accordion Manager */}
          <div className="bg-white rounded-2xl border border-[#DED3C5] p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#EAE2D8]">
              <div>
                <h3 className="font-serif text-lg font-semibold text-[#372921]">
                  Customer FAQ Accordion Database ({faqs.length} Questions)
                </h3>
                <p className="text-xs text-[#76695F] mt-0.5">
                  Directly populates customer-facing <code>/faq</code> page. Add, edit, or delete questions and responses.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenAddFaq}
                className="px-4 py-2 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New FAQ Question</span>
              </button>
            </div>

            <div className="space-y-3">
              {faqs.map(faq => (
                <div
                  key={faq.id}
                  className="p-4 rounded-xl border border-[#DED3C5] bg-[#FAF8F5] hover:border-[#9E5430]/60 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-[#F7F3EC] border border-[#DED3C5] text-[10.5px] font-semibold text-[#9E5430]">
                        {faq.category}
                      </span>
                      <span className="text-[10.5px] font-mono text-[#76695F]">
                        Order #{faq.order}
                      </span>
                    </div>
                    <h4 className="font-serif text-base font-semibold text-[#372921]">
                      {faq.question}
                    </h4>
                    <p className="text-xs text-[#76695F] leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                    <button
                      type="button"
                      onClick={() => handleOpenEditFaq(faq)}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#F7F3EC] border border-[#DED3C5] text-[#372921] text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-[#9E5430]" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteFaq(faq.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-50 text-[#76695F] hover:text-rose-600 cursor-pointer transition-colors"
                      title="Delete FAQ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 9. TAB 7: GLOBAL SEO & METADATA STUDIO (DEDICATED INTERACTIVE SCREEN) */}
      {activeTab === 'seo' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div>
              <h3 className="font-serif text-lg font-semibold text-[#372921]">
                Global SEO, OpenGraph &amp; Canonical Metadata
              </h3>
              <p className="text-xs text-[#76695F] mt-0.5">
                Optimize search engine discovery, social sharing cards, and search snippet previews across all public routes.
              </p>
            </div>
            <button
              type="button"
              onClick={() => showToast('Rebuilt XML Sitemap & submitted ping to Google Search Console')}
              className="px-4 py-2 rounded-full border border-[#DED3C5] bg-white hover:bg-[#F7F3EC] text-[#372921] text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
            >
              <Globe className="w-3.5 h-3.5 text-[#9E5430]" />
              <span>Ping Sitemap &amp; Robots.txt</span>
            </button>
          </div>

          <div className="space-y-4">
            {seoConfigs.map(seo => (
              <div
                key={seo.route}
                className="bg-white rounded-2xl border border-[#DED3C5] p-5 shadow-xs space-y-4"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#EAE2D8]">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#9E5430]/10 text-[#9E5430]">
                      {seo.route}
                    </span>
                    <strong className="font-serif text-base text-[#372921]">{seo.pageName}</strong>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10.5px] font-semibold ${
                        seo.allowIndexing
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {seo.allowIndexing ? 'Index, Follow' : 'NoIndex, NoFollow'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenEditSeo(seo)}
                      className="px-3 py-1.5 rounded-lg bg-[#FAF8F5] hover:bg-[#F7F3EC] border border-[#DED3C5] text-[#372921] text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-[#9E5430]" />
                      <span>Edit SEO Meta</span>
                    </button>
                  </div>
                </div>

                {/* Google SERP Live Simulation Preview */}
                <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#EAE2D8] space-y-1 text-xs">
                  <span className="text-[10px] uppercase font-bold text-[#A99583] tracking-wider block mb-1">
                    Google Search Result Snippet Preview:
                  </span>
                  <div className="text-[#1a0dab] font-sans font-medium text-sm hover:underline cursor-pointer">
                    {seo.title}
                  </div>
                  <div className="text-[#006621] font-mono text-[11px]">
                    {seo.canonicalUrl}
                  </div>
                  <div className="text-[#545454] leading-relaxed line-clamp-2 text-xs">
                    {seo.description}
                  </div>
                </div>

                {/* Metadata Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#76695F]">
                  <div className="p-2.5 bg-white rounded-lg border border-[#DED3C5]">
                    <span className="text-[10px] uppercase font-bold text-[#A99583] block">Target Keywords</span>
                    <span className="text-[#372921] font-medium block mt-0.5 truncate">{seo.keywords}</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-[#DED3C5]">
                    <span className="text-[10px] uppercase font-bold text-[#A99583] block">Canonical Target</span>
                    <span className="text-[#372921] font-mono text-[11px] block mt-0.5 truncate">{seo.canonicalUrl}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- ALL INTERACTIVE MODAL FORMS --- */}

      {/* 1. FAQ MODAL (CREATE & EDIT) */}
      {faqModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <form
            onSubmit={handleSaveFaq}
            className="bg-white rounded-2xl max-w-lg w-full border border-[#DED3C5] shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="p-5 border-b border-[#DED3C5] bg-[#F7F3EC] flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg text-[#372921] font-semibold flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#9E5430]" />
                  <span>{editingFaq ? 'Edit FAQ Question' : 'Add New FAQ Question'}</span>
                </h3>
                <p className="text-xs text-[#76695F] mt-0.5">
                  Update customer question and response for the /faq storefront page.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFaqModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-stone-200 text-[#76695F] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#372921] mb-1">Topic Category</label>
                <select
                  value={faqCategory}
                  onChange={e => setFaqCategory(e.target.value as any)}
                  className="w-full bg-[#FAF8F5] border border-[#DED3C5] rounded-lg p-2.5 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                >
                  <option value="Craft & Looms">Craft &amp; Looms (Bihar Artisans)</option>
                  <option value="Materials">Materials &amp; Bead Sourcing</option>
                  <option value="Shipping & Fulfilment">Shipping &amp; Express Fulfilment</option>
                  <option value="Custom Orders">Custom Orders &amp; Bridal Monograms</option>
                  <option value="Product Care">Product Care &amp; Silk Storage</option>
                  <option value="Returns & Refunds">Returns &amp; 100% Transit Guarantee</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#372921] mb-1">Question</label>
                <input
                  type="text"
                  required
                  value={faqQuestion}
                  onChange={e => setFaqQuestion(e.target.value)}
                  placeholder="e.g. Can I order bespoke wedding favours for my guests?"
                  className="w-full bg-[#FAF8F5] border border-[#DED3C5] rounded-lg p-2.5 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#372921] mb-1">Answer / Response Copy</label>
                <textarea
                  rows={4}
                  required
                  value={faqAnswer}
                  onChange={e => setFaqAnswer(e.target.value)}
                  placeholder="Write clear, warm, luxury response..."
                  className="w-full bg-[#FAF8F5] border border-[#DED3C5] rounded-lg p-2.5 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                />
              </div>
            </div>

            <div className="p-4 border-t border-[#DED3C5] bg-[#F7F3EC] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setFaqModalOpen(false)}
                className="px-4 py-2 rounded-full border border-[#DED3C5] bg-white text-[#76695F] text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white text-xs font-semibold cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save FAQ</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. SEO MODAL (EDIT META) */}
      {seoModalOpen && editingSeo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <form
            onSubmit={handleSaveSeo}
            className="bg-white rounded-2xl max-w-lg w-full border border-[#DED3C5] shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="p-5 border-b border-[#DED3C5] bg-[#F7F3EC] flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg text-[#372921] font-semibold flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#9E5430]" />
                  <span>Edit SEO Metadata ({editingSeo.pageName})</span>
                </h3>
                <p className="text-xs text-[#76695F] mt-0.5">Route: {editingSeo.route}</p>
              </div>
              <button
                type="button"
                onClick={() => setSeoModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-stone-200 text-[#76695F] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-semibold text-[#372921]">Page Meta Title</label>
                  <span className={`text-[10px] ${seoTitle.length > 60 ? 'text-rose-600 font-bold' : 'text-[#76695F]'}`}>
                    {seoTitle.length} / 60 chars
                  </span>
                </div>
                <input
                  type="text"
                  required
                  value={seoTitle}
                  onChange={e => setSeoTitle(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#DED3C5] rounded-lg p-2.5 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-semibold text-[#372921]">Meta Description</label>
                  <span className={`text-[10px] ${seoDesc.length > 160 ? 'text-rose-600 font-bold' : 'text-[#76695F]'}`}>
                    {seoDesc.length} / 160 chars
                  </span>
                </div>
                <textarea
                  rows={3}
                  required
                  value={seoDesc}
                  onChange={e => setSeoDesc(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#DED3C5] rounded-lg p-2.5 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#372921] mb-1">Canonical URL</label>
                <input
                  type="url"
                  required
                  value={seoCanonical}
                  onChange={e => setSeoCanonical(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#DED3C5] rounded-lg p-2.5 font-mono text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#372921] mb-1">Target Keywords (comma-separated)</label>
                <input
                  type="text"
                  value={seoKeywords}
                  onChange={e => setSeoKeywords(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#DED3C5] rounded-lg p-2.5 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                />
              </div>

              <div className="pt-2 flex items-center justify-between p-3 bg-[#FAF8F5] rounded-xl border border-[#DED3C5]">
                <div>
                  <span className="font-semibold block text-[#372921]">Search Engine Indexing</span>
                  <span className="text-[10.5px] text-[#76695F]">Allow Google &amp; Bing to crawl and index this route</span>
                </div>
                <input
                  type="checkbox"
                  checked={seoIndexing}
                  onChange={e => setSeoIndexing(e.target.checked)}
                  className="w-4 h-4 text-[#9E5430] accent-[#9E5430] cursor-pointer"
                />
              </div>
            </div>

            <div className="p-4 border-t border-[#DED3C5] bg-[#F7F3EC] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSeoModalOpen(false)}
                className="px-4 py-2 rounded-full border border-[#DED3C5] bg-white text-[#76695F] text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white text-xs font-semibold cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save SEO Config</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. MEDIA UPLOAD MODAL */}
      {mediaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <form
            onSubmit={handleSaveMedia}
            className="bg-white rounded-2xl max-w-md w-full border border-[#DED3C5] shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="p-5 border-b border-[#DED3C5] bg-[#F7F3EC] flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg text-[#372921] font-semibold flex items-center gap-2">
                  <Upload className="w-4 h-4 text-[#9E5430]" />
                  <span>Upload Digital Asset</span>
                </h3>
                <p className="text-xs text-[#76695F] mt-0.5">Add photography to the CDN asset registry.</p>
              </div>
              <button
                type="button"
                onClick={() => setMediaModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-stone-200 text-[#76695F] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#372921] mb-1">Asset Name</label>
                <input
                  type="text"
                  required
                  value={newMediaName}
                  onChange={e => setNewMediaName(e.target.value)}
                  placeholder="e.g. Autumn Bridal Lookbook Cover"
                  className="w-full bg-[#FAF8F5] border border-[#DED3C5] rounded-lg p-2.5 text-xs text-[#372921]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#372921] mb-1">Image URL</label>
                <input
                  type="url"
                  required
                  value={newMediaUrl}
                  onChange={e => setNewMediaUrl(e.target.value)}
                  placeholder="https://www.kalajay.in/media/photo.webp"
                  className="w-full bg-[#FAF8F5] border border-[#DED3C5] rounded-lg p-2.5 font-mono text-xs text-[#372921]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#372921] mb-1">Category</label>
                  <select
                    value={newMediaCategory}
                    onChange={e => setNewMediaCategory(e.target.value as any)}
                    className="w-full bg-[#FAF8F5] border border-[#DED3C5] rounded-lg p-2.5 text-xs text-[#372921]"
                  >
                    <option value="Product">Product</option>
                    <option value="Lifestyle">Lifestyle</option>
                    <option value="Atelier">Atelier</option>
                    <option value="Campaign">Campaign</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#372921] mb-1">Dimensions</label>
                  <input
                    type="text"
                    value={newMediaDimensions}
                    onChange={e => setNewMediaDimensions(e.target.value)}
                    placeholder="1200 x 1200 px"
                    className="w-full bg-[#FAF8F5] border border-[#DED3C5] rounded-lg p-2.5 text-xs text-[#372921]"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#DED3C5] bg-[#F7F3EC] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setMediaModalOpen(false)}
                className="px-4 py-2 rounded-full border border-[#DED3C5] bg-white text-[#76695F] text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white text-xs font-semibold cursor-pointer shadow-xs"
              >
                Upload to Gallery
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. ARTISAN MODAL (CREATE & EDIT) */}
      {artisanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <form
            onSubmit={handleSaveArtisan}
            className="bg-white rounded-2xl max-w-lg w-full border border-[#DED3C5] shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="p-5 border-b border-[#DED3C5] bg-[#F7F3EC] flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg text-[#372921] font-semibold flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#9E5430]" />
                  <span>{editingArtisan ? 'Edit Master Artisan' : 'Add Master Artisan'}</span>
                </h3>
                <p className="text-xs text-[#76695F] mt-0.5">Celebrate the women makers of Kalajay.</p>
              </div>
              <button
                type="button"
                onClick={() => setArtisanModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-stone-200 text-[#76695F] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#372921] mb-1">Artisan Name</label>
                  <input
                    type="text"
                    required
                    value={artisanName}
                    onChange={e => setArtisanName(e.target.value)}
                    placeholder="e.g. Suman Devi"
                    className="w-full bg-[#FAF8F5] border border-[#DED3C5] rounded-lg p-2.5 text-xs text-[#372921]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#372921] mb-1">Craft Specialization</label>
                  <input
                    type="text"
                    value={artisanSpecialty}
                    onChange={e => setArtisanSpecialty(e.target.value)}
                    placeholder="e.g. Glass Beaded Clutches"
                    className="w-full bg-[#FAF8F5] border border-[#DED3C5] rounded-lg p-2.5 text-xs text-[#372921]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#372921] mb-1">Atelier Hub Location</label>
                  <input
                    type="text"
                    value={artisanLocation}
                    onChange={e => setArtisanLocation(e.target.value)}
                    placeholder="Madhubani Craft House, Bihar"
                    className="w-full bg-[#FAF8F5] border border-[#DED3C5] rounded-lg p-2.5 text-xs text-[#372921]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#372921] mb-1">Loom Experience</label>
                  <input
                    type="text"
                    value={artisanExperience}
                    onChange={e => setArtisanExperience(e.target.value)}
                    placeholder="e.g. 7 years loom mastery"
                    className="w-full bg-[#FAF8F5] border border-[#DED3C5] rounded-lg p-2.5 text-xs text-[#372921]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#372921] mb-1">Personal Artisan Quote / Voice</label>
                <textarea
                  rows={3}
                  required
                  value={artisanQuote}
                  onChange={e => setArtisanQuote(e.target.value)}
                  placeholder="Share the maker's relationship with the craft..."
                  className="w-full bg-[#FAF8F5] border border-[#DED3C5] rounded-lg p-2.5 text-xs text-[#372921]"
                />
              </div>
            </div>

            <div className="p-4 border-t border-[#DED3C5] bg-[#F7F3EC] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setArtisanModalOpen(false)}
                className="px-4 py-2 rounded-full border border-[#DED3C5] bg-white text-[#76695F] text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white text-xs font-semibold cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 5. PAGE CONFIG MODAL */}
      {pageModalOpen && editingPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <form
            onSubmit={handleSavePage}
            className="bg-white rounded-2xl max-w-md w-full border border-[#DED3C5] shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="p-5 border-b border-[#DED3C5] bg-[#F7F3EC] flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg text-[#372921] font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#9E5430]" />
                  <span>Edit Page Configuration</span>
                </h3>
                <p className="text-xs text-[#76695F] mt-0.5">Route: {editingPage.route}</p>
              </div>
              <button
                type="button"
                onClick={() => setPageModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-stone-200 text-[#76695F] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#372921] mb-1">Display Title</label>
                <input
                  type="text"
                  required
                  value={pageName}
                  onChange={e => setPageName(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#DED3C5] rounded-lg p-2.5 text-xs text-[#372921]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#372921] mb-1">Publishing Status</label>
                <select
                  value={pageStatus}
                  onChange={e => setPageStatus(e.target.value as any)}
                  className="w-full bg-[#FAF8F5] border border-[#DED3C5] rounded-lg p-2.5 text-xs text-[#372921]"
                >
                  <option value="Published">Published</option>
                  <option value="Draft">Draft (Internal Only)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#372921] mb-1">Layout Architecture</label>
                <select
                  value={pageTemplate}
                  onChange={e => setPageTemplate(e.target.value as any)}
                  className="w-full bg-[#FAF8F5] border border-[#DED3C5] rounded-lg p-2.5 text-xs text-[#372921]"
                >
                  <option value="Editorial Luxury">Editorial Luxury (Serif Hero + Rail)</option>
                  <option value="Minimal Grid">Minimal Grid (Filters + 3-Col)</option>
                  <option value="Full Cover Story">Full Cover Story (Immersive Scroll)</option>
                </select>
              </div>
            </div>

            <div className="p-4 border-t border-[#DED3C5] bg-[#F7F3EC] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPageModalOpen(false)}
                className="px-4 py-2 rounded-full border border-[#DED3C5] bg-white text-[#76695F] text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white text-xs font-semibold cursor-pointer shadow-xs"
              >
                Save Page Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 6. BANNER MODAL (CREATE & EDIT) */}
      {bannerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <form
            onSubmit={handleSaveBanner}
            className="bg-white rounded-2xl max-w-md w-full border border-[#DED3C5] shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="p-5 border-b border-[#DED3C5] bg-[#F7F3EC] flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg text-[#372921] font-semibold flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-[#9E5430]" />
                  <span>{editingBanner ? 'Edit Announcement Banner' : 'Create Storefront Announcement'}</span>
                </h3>
                <p className="text-xs text-[#76695F] mt-0.5">Top ticker and modal announcements.</p>
              </div>
              <button
                type="button"
                onClick={() => setBannerModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-stone-200 text-[#76695F] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-[#372921]">Campaign Title</label>
                <input
                  type="text"
                  required
                  value={bannerTitle}
                  onChange={e => setBannerTitle(e.target.value)}
                  placeholder="e.g. Wedding Season Complimentary Gift Wrap"
                  className="w-full bg-[#FAF8F5] border border-[#DED3C5] rounded-lg p-2.5 text-xs text-[#372921]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#372921]">Announcement Copy</label>
                <textarea
                  rows={2}
                  required
                  value={bannerText}
                  onChange={e => setBannerText(e.target.value)}
                  placeholder="e.g. Complimentary handwritten calligraphy note on all orders."
                  className="w-full bg-[#FAF8F5] border border-[#DED3C5] rounded-lg p-2.5 text-xs text-[#372921]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[#372921]">CTA Button Text</label>
                  <input
                    type="text"
                    value={bannerCtaText}
                    onChange={e => setBannerCtaText(e.target.value)}
                    placeholder="Explore"
                    className="w-full bg-[#FAF8F5] border border-[#DED3C5] rounded-lg p-2.5 text-xs text-[#372921]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[#372921]">CTA Target URL</label>
                  <input
                    type="text"
                    value={bannerCtaUrl}
                    onChange={e => setBannerCtaUrl(e.target.value)}
                    placeholder="/shop"
                    className="w-full bg-[#FAF8F5] border border-[#DED3C5] rounded-lg p-2.5 text-xs text-[#372921]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#372921]">Display Location</label>
                <select
                  value={bannerLoc}
                  onChange={e => setBannerLoc(e.target.value as any)}
                  className="w-full bg-[#FAF8F5] border border-[#DED3C5] rounded-lg p-2.5 text-xs text-[#372921]"
                >
                  <option value="top-ticker">Top Header Marquee Ticker</option>
                  <option value="hero-announcement">Hero Cover Announcement</option>
                  <option value="modal-popup">Modal Welcome Popup</option>
                </select>
              </div>
            </div>

            <div className="p-4 border-t border-[#DED3C5] bg-[#F7F3EC] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setBannerModalOpen(false)}
                className="px-4 py-2 rounded-full border border-[#DED3C5] bg-white text-[#76695F] text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white text-xs font-semibold cursor-pointer shadow-xs"
              >
                Save Announcement
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
