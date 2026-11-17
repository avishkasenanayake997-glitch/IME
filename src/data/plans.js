export const plans = [
  { id: 'starter', name: 'Starter POS', price: 5000, tagline: 'For small shops getting started', features: ['Core POS and billing', 'Basic inventory', 'Basic sales reports', 'Printable receipts', 'Email support'] },
  { id: 'business', name: 'Business Management', price: 7500, popular: true, tagline: 'Everything to run daily operations', features: ['POS and billing', 'Inventory management', 'Customer management', 'Employee roles & permissions', 'Business reports', 'Cloud data (demo)'] },
  { id: 'professional', name: 'Professional', price: 12000, tagline: 'For growing multi-branch businesses', features: ['All Business Management features', 'Advanced reports & analytics', 'Nexus Insight Assistant', 'Multi-feature support', 'Multi-branch capabilities', 'Priority support'] },
];

export const services = [
  { title: 'Setup & Onboarding Packages', text: 'Hands-on setup of products, users and branches, plus staff training so you are billing from day one.' },
  { title: 'Data Migration Services', text: 'Move records from handwritten books, Excel sheets and older software into Nexus safely.' },
  { title: 'Customization Services', text: 'Custom receipts, fields, workflows and reports tailored to your business.' },
  { title: 'Third-Party Integrations', text: 'Connect accounting tools, payment providers and e-commerce channels as needed.' },
  { title: 'Premium Maintenance & Support', text: 'Priority response, regular health checks and dedicated support for critical operations.' },
];

export const sectors = [
  ['🛒', 'Retail Shops'], ['🥬', 'Grocery Stores'], ['💊', 'Pharmacies'], ['☕', 'Cafés & Restaurants'], ['👕', 'Clothing Stores'],
  ['🔧', 'Hardware Stores'], ['💇', 'Beauty Salons'], ['📦', 'Small Wholesalers'], ['🛠️', 'Service Businesses'],
];

export const faqs = [
  ['Do I need special hardware?', 'No. Nexus runs in a modern web browser on a PC, tablet or phone. Receipt printers and barcode scanners are optional.'],
  ['Can I switch plans later?', 'Yes. You can move between Starter POS, Business Management and Professional as your business grows.'],
  ['Can you move my existing data?', 'Our Data Migration Service imports your products, customers and balances from spreadsheets or older systems.'],
  ['What is the Nexus Insight Assistant?', 'A business insights tool that analyses your sales and inventory to flag low stock, slow movers and trends, and suggests reorder quantities. It is available on the Professional plan.'],
  ['Is my data safe?', 'Nexus is designed for cloud-based data storage with backups. This demo stores data locally in your browser only.'],
];

export const testimonials = [
  { name: 'Demo Customer A', role: 'Grocery store owner, Colombo', text: 'Replacing my handwritten ledger with Nexus saved me hours every week.' },
  { name: 'Demo Customer B', role: 'Pharmacy manager, Kandy', text: 'Low-stock alerts mean we rarely run out of essential items now.' },
  { name: 'Demo Customer C', role: 'Café owner, Galle', text: 'Billing is fast and my staff learned the system in one afternoon.' },
];
