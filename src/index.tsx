import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'

const app = new Hono()

// Serve static files
app.use('/static/*', serveStatic({ root: './' }))

// Serve favicon inline
app.get('/favicon.svg', (c) => {
  return new Response(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#1d4ed8"/><path d="M16 8c-2.2-2.2-5.8-2.2-8 0-2.2 2.2-2.2 5.8 0 8l8 8 8-8c2.2-2.2 2.2-5.8 0-8-2.2-2.2-5.8-2.2-8 0z" fill="#facc15"/></svg>`,
    { headers: { 'Content-Type': 'image/svg+xml' } }
  )
})
app.get('/favicon.ico', (c) => c.redirect('/favicon.svg', 301))

// ─── Campaign Data ─────────────────────────────────────────────────────────────
const campaigns = [
  {
    id: 1,
    title: "Help Ramesh's Heart Surgery",
    description: "Ramesh is a 34-year-old father of two who needs urgent heart surgery. His family cannot afford the medical bills. Your donation can save his life.",
    category: "Medical",
    categoryColor: "blue",
    raised: 150000,
    goal: 300000,
    image: "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=400&q=80",
    donors: 128,
    daysLeft: 12,
    btnColor: "blue",
  },
  {
    id: 2,
    title: "Education for Rural Kids",
    description: "Over 200 children in remote villages of Nepal lack access to basic education. Help us build a school and provide essential learning materials.",
    category: "Education",
    categoryColor: "yellow",
    raised: 80000,
    goal: 200000,
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=80",
    donors: 87,
    daysLeft: 25,
    btnColor: "yellow",
  },
  {
    id: 3,
    title: "Relief for Flood Victims",
    description: "Recent floods in the Terai region have displaced thousands of families. We need immediate funds for food, shelter, and medical care.",
    category: "Disaster Relief",
    categoryColor: "green",
    raised: 120000,
    goal: 250000,
    image: "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=400&q=80",
    donors: 204,
    daysLeft: 8,
    btnColor: "blue",
  },
  {
    id: 4,
    title: "Clean Water for Humla",
    description: "Families in Humla district walk miles every day for unsafe drinking water. Help us install water purification systems for 5 villages.",
    category: "Community",
    categoryColor: "teal",
    raised: 45000,
    goal: 180000,
    image: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=400&q=80",
    donors: 52,
    daysLeft: 30,
    btnColor: "blue",
  },
  {
    id: 5,
    title: "Cancer Treatment for Sita",
    description: "Sita is a 28-year-old teacher diagnosed with breast cancer. She needs immediate chemotherapy. Stand with her in this battle.",
    category: "Medical",
    categoryColor: "blue",
    raised: 220000,
    goal: 400000,
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&q=80",
    donors: 315,
    daysLeft: 5,
    btnColor: "blue",
  },
  {
    id: 6,
    title: "Rebuild After Earthquake",
    description: "The recent earthquake destroyed hundreds of homes in Sindhupalchok. Help families rebuild and restart their lives with dignity.",
    category: "Disaster Relief",
    categoryColor: "orange",
    raised: 350000,
    goal: 500000,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
    donors: 421,
    daysLeft: 15,
    btnColor: "blue",
  },
]

const totalRaised = campaigns.reduce((s, c) => s + c.raised, 0)
const totalDonors = campaigns.reduce((s, c) => s + c.donors, 0)

// ─── Helpers ───────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return n.toLocaleString('en-IN')
}
function pct(raised: number, goal: number) {
  return Math.min(100, Math.round((raised / goal) * 100))
}

// ─── Shared Layout ─────────────────────────────────────────────────────────────
function Layout({ title, children }: { title: string; children: any }) {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title} – Jeevani Nepal NODAS</title>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" />
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
        <style>{`
          * { font-family: 'Poppins', sans-serif; }
          .progress-bar { transition: width 1.5s cubic-bezier(.4,0,.2,1); }
          .card-hover { transition: all .35s cubic-bezier(.4,0,.2,1); }
          .card-hover:hover { transform: translateY(-10px); box-shadow: 0 25px 60px rgba(0,0,0,0.15); }
          .btn-glow:hover { box-shadow: 0 8px 30px rgba(37,99,235,0.5); }
          .btn-glow-yellow:hover { box-shadow: 0 8px 30px rgba(234,179,8,0.5); }
          .hero-gradient { background: linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 40%, #3b82f6 100%); }
          .cta-gradient { background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%); }
          .top-bar { background: #1e3a8a; }
          .nav-link { position: relative; }
          .nav-link::after { content:''; position:absolute; bottom:-2px; left:0; width:0; height:2px; background:#facc15; transition: width .3s; }
          .nav-link:hover::after { width:100%; }
          .reveal { opacity:0; transform:translateY(40px); }
          .reveal.active { opacity:1; transform:translateY(0); transition: all .8s cubic-bezier(.4,0,.2,1); }
          .stagger-1.active { transition-delay:.1s; }
          .stagger-2.active { transition-delay:.2s; }
          .stagger-3.active { transition-delay:.3s; }
          .stagger-4.active { transition-delay:.4s; }
          .stagger-5.active { transition-delay:.5s; }
          .stagger-6.active { transition-delay:.6s; }
          .hero-img-float { animation: floatImg 4s ease-in-out infinite; }
          @keyframes floatImg { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
          .counter { font-variant-numeric: tabular-nums; }
          .wave-divider { position:relative; overflow:hidden; }
          .wave-divider::after { content:''; position:absolute; bottom:0; left:0; width:100%; height:60px; background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 60'%3E%3Cpath fill='%23f8fafc' d='M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z'/%3E%3C/svg%3E") no-repeat bottom; background-size:cover; }
          .mobile-menu { display:none; }
          .mobile-menu.open { display:block; }
          @media(max-width:768px) { .desktop-nav { display:none; } }
          input:focus, textarea:focus, select:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }
        `}</style>
      </head>
      <body class="bg-slate-50">
        {/* Top Bar */}
        <div class="top-bar text-white text-center py-2 text-sm font-medium tracking-wide">
          <i class="fas fa-heart text-yellow-400 mr-2"></i>
          The Source Of Life – Empowering Nepal One Cause at a Time
        </div>

        {/* Navbar */}
        <nav class="bg-white shadow-lg sticky top-0 z-50">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
              {/* Logo */}
              <a href="/" class="flex items-center gap-3 group">
                <div class="w-10 h-10 bg-gradient-to-br from-blue-700 to-blue-500 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                  <i class="fas fa-heart text-white text-lg"></i>
                </div>
                <div class="leading-tight">
                  <div class="font-bold text-blue-900 text-lg leading-none">Jeevani Nepal</div>
                  <div class="text-yellow-500 font-black text-xs tracking-widest">NODAS</div>
                </div>
              </a>

              {/* Desktop Nav */}
              <div class="desktop-nav flex items-center gap-6">
                <a href="/" class="nav-link text-gray-700 hover:text-blue-700 font-medium text-sm transition-colors">Home</a>
                <a href="/campaigns" class="nav-link text-gray-700 hover:text-blue-700 font-medium text-sm transition-colors">Campaigns</a>
                <a href="/donate" class="nav-link text-gray-700 hover:text-blue-700 font-medium text-sm transition-colors">Donate</a>
                <a href="/resources" class="nav-link text-gray-700 hover:text-blue-700 font-medium text-sm transition-colors">Resources</a>
                <a href="/contact" class="nav-link text-gray-700 hover:text-blue-700 font-medium text-sm transition-colors">Contact</a>
                <a href="/start-fundraiser" class="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all btn-glow flex items-center gap-2">
                  <i class="fas fa-plus-circle"></i> Start a Fundraiser
                </a>
              </div>

              {/* Mobile Menu Button */}
              <button onclick="toggleMenu()" class="md:hidden p-2 rounded-lg hover:bg-gray-100">
                <i class="fas fa-bars text-gray-700 text-xl" id="menuIcon"></i>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <div id="mobileMenu" class="mobile-menu bg-white border-t border-gray-100 px-4 py-4">
            <div class="flex flex-col gap-4">
              <a href="/" class="text-gray-700 font-medium py-2 border-b border-gray-100">Home</a>
              <a href="/campaigns" class="text-gray-700 font-medium py-2 border-b border-gray-100">Campaigns</a>
              <a href="/donate" class="text-gray-700 font-medium py-2 border-b border-gray-100">Donate</a>
              <a href="/resources" class="text-gray-700 font-medium py-2 border-b border-gray-100">Resources</a>
              <a href="/contact" class="text-gray-700 font-medium py-2 border-b border-gray-100">Contact</a>
              <a href="/start-fundraiser" class="bg-blue-700 text-white px-4 py-3 rounded-xl font-semibold text-center">Start a Fundraiser</a>
            </div>
          </div>
        </nav>

        {children}

        {/* Footer */}
        <footer class="bg-gray-900 text-white pt-16 pb-8">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
              <div class="col-span-1">
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                    <i class="fas fa-heart text-white text-lg"></i>
                  </div>
                  <div>
                    <div class="font-bold text-white text-lg leading-none">Jeevani Nepal</div>
                    <div class="text-yellow-400 font-black text-xs tracking-widest">NODAS</div>
                  </div>
                </div>
                <p class="text-gray-400 text-sm leading-relaxed">Crowdfunding for Nepal with Trust & Transparency. From medical emergencies to social causes, we help save lives.</p>
                <div class="flex gap-3 mt-4">
                  <a href="#" class="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-500 transition-colors"><i class="fab fa-facebook-f text-sm"></i></a>
                  <a href="#" class="w-9 h-9 bg-sky-500 rounded-lg flex items-center justify-center hover:bg-sky-400 transition-colors"><i class="fab fa-twitter text-sm"></i></a>
                  <a href="#" class="w-9 h-9 bg-pink-600 rounded-lg flex items-center justify-center hover:bg-pink-500 transition-colors"><i class="fab fa-instagram text-sm"></i></a>
                  <a href="#" class="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center hover:bg-red-500 transition-colors"><i class="fab fa-youtube text-sm"></i></a>
                </div>
              </div>

              <div>
                <h4 class="font-bold text-white mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
                <ul class="space-y-2 text-sm text-gray-400">
                  <li><a href="/" class="hover:text-yellow-400 transition-colors flex items-center gap-2"><i class="fas fa-chevron-right text-xs"></i>Home</a></li>
                  <li><a href="/campaigns" class="hover:text-yellow-400 transition-colors flex items-center gap-2"><i class="fas fa-chevron-right text-xs"></i>Browse Campaigns</a></li>
                  <li><a href="/start-fundraiser" class="hover:text-yellow-400 transition-colors flex items-center gap-2"><i class="fas fa-chevron-right text-xs"></i>Start a Fundraiser</a></li>
                  <li><a href="/donate" class="hover:text-yellow-400 transition-colors flex items-center gap-2"><i class="fas fa-chevron-right text-xs"></i>Make a Donation</a></li>
                  <li><a href="/resources" class="hover:text-yellow-400 transition-colors flex items-center gap-2"><i class="fas fa-chevron-right text-xs"></i>Resources</a></li>
                </ul>
              </div>

              <div>
                <h4 class="font-bold text-white mb-4 text-sm uppercase tracking-wider">Categories</h4>
                <ul class="space-y-2 text-sm text-gray-400">
                  <li><a href="/campaigns?cat=medical" class="hover:text-yellow-400 transition-colors flex items-center gap-2"><i class="fas fa-heartbeat text-xs text-red-400"></i>Medical</a></li>
                  <li><a href="/campaigns?cat=education" class="hover:text-yellow-400 transition-colors flex items-center gap-2"><i class="fas fa-graduation-cap text-xs text-blue-400"></i>Education</a></li>
                  <li><a href="/campaigns?cat=disaster" class="hover:text-yellow-400 transition-colors flex items-center gap-2"><i class="fas fa-house-damage text-xs text-orange-400"></i>Disaster Relief</a></li>
                  <li><a href="/campaigns?cat=community" class="hover:text-yellow-400 transition-colors flex items-center gap-2"><i class="fas fa-users text-xs text-green-400"></i>Community</a></li>
                  <li><a href="/campaigns?cat=animal" class="hover:text-yellow-400 transition-colors flex items-center gap-2"><i class="fas fa-paw text-xs text-yellow-400"></i>Animal Welfare</a></li>
                </ul>
              </div>

              <div>
                <h4 class="font-bold text-white mb-4 text-sm uppercase tracking-wider">Contact Us</h4>
                <ul class="space-y-3 text-sm text-gray-400">
                  <li class="flex items-start gap-3"><i class="fas fa-map-marker-alt text-yellow-400 mt-0.5"></i><span>Kathmandu, Nepal<br/>Baneshwor, 44600</span></li>
                  <li class="flex items-center gap-3"><i class="fas fa-phone text-yellow-400"></i><span>+977 01-4567890</span></li>
                  <li class="flex items-center gap-3"><i class="fas fa-envelope text-yellow-400"></i><span>help@jeevaninepal.org</span></li>
                  <li class="flex items-center gap-3"><i class="fas fa-clock text-yellow-400"></i><span>Mon–Fri: 9 AM – 6 PM</span></li>
                </ul>
              </div>
            </div>

            <div class="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p class="text-gray-500 text-sm">© 2026 Jeevani Nepal <strong class="text-yellow-400">NODAS</strong> | <em>The Source Of Life</em></p>
              <div class="flex gap-6 text-gray-500 text-sm">
                <a href="#" class="hover:text-gray-300 transition-colors">Privacy Policy</a>
                <a href="#" class="hover:text-gray-300 transition-colors">Terms of Use</a>
                <a href="#" class="hover:text-gray-300 transition-colors">Transparency</a>
              </div>
            </div>
          </div>
        </footer>

        <script dangerouslySetInnerHTML={{__html: `
          function toggleMenu() {
            const menu = document.getElementById('mobileMenu');
            const icon = document.getElementById('menuIcon');
            menu.classList.toggle('open');
            icon.className = menu.classList.contains('open') ? 'fas fa-times text-gray-700 text-xl' : 'fas fa-bars text-gray-700 text-xl';
          }

          // Scroll reveal
          function revealOnScroll() {
            document.querySelectorAll('.reveal').forEach(el => {
              if (el.getBoundingClientRect().top < window.innerHeight - 80) {
                el.classList.add('active');
              }
            });
          }
          window.addEventListener('scroll', revealOnScroll);
          setTimeout(revealOnScroll, 100);

          // Progress bars animate on scroll
          function animateProgressBars() {
            document.querySelectorAll('.prog-bar').forEach(bar => {
              const rect = bar.getBoundingClientRect();
              if (rect.top < window.innerHeight - 50 && !bar.dataset.animated) {
                bar.dataset.animated = 'true';
                bar.style.width = bar.dataset.pct + '%';
              }
            });
          }
          window.addEventListener('scroll', animateProgressBars);
          setTimeout(animateProgressBars, 400);
        `}}></script>
      </body>
    </html>
  )
}

// ─── Campaign Card Component ───────────────────────────────────────────────────
function CampaignCard({ c, delay }: { c: typeof campaigns[0]; delay: number }) {
  const p = pct(c.raised, c.goal)
  const barColor = c.btnColor === 'yellow' ? '#eab308' : c.categoryColor === 'green' ? '#22c55e' : '#2563eb'
  return (
    <div class={`reveal stagger-${delay} bg-white rounded-2xl overflow-hidden card-hover shadow-md border border-gray-100`}>
      <div class="relative">
        <img src={c.image} alt={c.title} class="w-full h-48 object-cover" loading="lazy" />
        <div class="absolute top-3 left-3">
          <span class={`bg-white text-blue-700 text-xs font-bold px-3 py-1 rounded-full shadow-sm`}>
            {c.category}
          </span>
        </div>
        {c.daysLeft <= 10 && (
          <div class="absolute top-3 right-3">
            <span class="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
              {c.daysLeft} days left!
            </span>
          </div>
        )}
      </div>
      <div class="p-5">
        <h3 class="font-bold text-gray-900 text-base mb-2 leading-snug">{c.title}</h3>
        <p class="text-gray-500 text-xs mb-4 leading-relaxed line-clamp-2">{c.description}</p>

        <div class="mb-3">
          <div class="flex justify-between text-xs font-medium mb-1">
            <span class="text-blue-700 font-bold">NPR {fmt(c.raised)}</span>
            <span class="text-gray-500">of NPR {fmt(c.goal)}</span>
          </div>
          <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div class="prog-bar h-2 rounded-full transition-all duration-1000" style={`width:0%; background:${barColor}`} data-pct={p}></div>
          </div>
          <div class="flex justify-between text-xs text-gray-400 mt-1">
            <span><i class="fas fa-users mr-1"></i>{c.donors} donors</span>
            <span class="font-semibold text-blue-700">{p}% funded</span>
          </div>
        </div>

        <a href={`/campaigns/${c.id}`} class={`block text-center py-2.5 rounded-xl font-bold text-sm transition-all ${c.btnColor === 'yellow' ? 'bg-yellow-400 hover:bg-yellow-500 text-gray-900 btn-glow-yellow' : 'bg-blue-700 hover:bg-blue-800 text-white btn-glow'}`}>
          Donate Now
        </a>
      </div>
    </div>
  )
}

// ─── Home Page ─────────────────────────────────────────────────────────────────
app.get('/', (c) => {
  return c.html(
    <Layout title="Home">
      {/* Hero */}
      <section class="hero-gradient wave-divider relative overflow-hidden min-h-[560px] flex items-center">
        <div class="absolute inset-0 opacity-10">
          <div class="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          <div class="absolute bottom-10 right-20 w-48 h-48 bg-yellow-300 rounded-full blur-3xl"></div>
        </div>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 relative z-10">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div class="inline-flex items-center gap-2 bg-white/10 text-white text-xs font-semibold px-4 py-2 rounded-full mb-6 backdrop-blur-sm border border-white/20">
                <i class="fas fa-shield-alt text-yellow-400"></i>
                Verified & Transparent Platform
              </div>
              <h1 class="text-4xl lg:text-6xl font-black text-white leading-tight mb-4">
                Crowdfunding for Nepal with<br />
                <span class="text-yellow-400">Trust & Transparency</span>
              </h1>
              <p class="text-blue-100 text-lg mb-8 leading-relaxed max-w-lg">
                From medical emergencies to social causes, Jeevani Nepal NODAS helps save lives by connecting donors with verified campaigns.
              </p>
              <div class="flex flex-wrap gap-4">
                <a href="/start-fundraiser" class="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-8 py-4 rounded-xl text-lg transition-all btn-glow-yellow inline-flex items-center gap-2">
                  <i class="fas fa-rocket"></i>Start a Fundraiser
                </a>
                <a href="/campaigns" class="border-2 border-white/50 text-white hover:bg-white/10 font-semibold px-8 py-4 rounded-xl text-lg transition-all inline-flex items-center gap-2">
                  <i class="fas fa-search"></i>Browse Campaigns
                </a>
              </div>
              <div class="flex items-center gap-2 mt-6 text-blue-100 text-sm">
                <i class="fas fa-check-circle text-green-400"></i>
                <span>100% Secure Payments</span>
                <span class="mx-2">•</span>
                <i class="fas fa-check-circle text-green-400"></i>
                <span>Verified Campaigns</span>
                <span class="mx-2">•</span>
                <i class="fas fa-check-circle text-green-400"></i>
                <span>Zero Hidden Fees</span>
              </div>
            </div>
            <div class="flex justify-center lg:justify-end">
              <div class="relative">
                <img
                  src="https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=500&q=80"
                  alt="Patient receiving care"
                  class="hero-img-float w-full max-w-md rounded-3xl shadow-2xl border-4 border-white/20"
                />
                <div class="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl px-5 py-3 flex items-center gap-3">
                  <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <i class="fas fa-heart text-green-600"></i>
                  </div>
                  <div>
                    <div class="font-black text-gray-900 text-lg leading-none counter">NPR {fmt(totalRaised)}+</div>
                    <div class="text-gray-500 text-xs">Total Raised</div>
                  </div>
                </div>
                <div class="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl px-4 py-2.5 flex items-center gap-2">
                  <i class="fas fa-users text-blue-600 text-xl"></i>
                  <div>
                    <div class="font-black text-gray-900 leading-none">{fmt(totalDonors)}+</div>
                    <div class="text-gray-500 text-xs">Happy Donors</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section class="bg-white border-b border-gray-100 py-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { icon: 'fa-hand-holding-heart', val: 'NPR ' + fmt(totalRaised) + '+', label: 'Total Raised', color: 'text-blue-700' },
              { icon: 'fa-users', val: fmt(totalDonors) + '+', label: 'Donors', color: 'text-green-600' },
              { icon: 'fa-flag', val: campaigns.length + '+', label: 'Active Campaigns', color: 'text-yellow-600' },
              { icon: 'fa-shield-alt', val: '100%', label: 'Transparent', color: 'text-purple-600' },
            ].map((stat, i) => (
              <div class="reveal" key={i}>
                <div class={`text-3xl font-black ${stat.color} mb-1`}>{stat.val}</div>
                <div class="text-gray-500 text-sm flex items-center justify-center gap-2">
                  <i class={`fas ${stat.icon}`}></i>{stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Campaigns */}
      <section class="py-20 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-14 reveal">
            <span class="text-blue-600 font-semibold text-sm uppercase tracking-widest">Making a Difference</span>
            <h2 class="text-4xl font-black text-gray-900 mt-2 mb-3">Popular Campaigns</h2>
            <p class="text-gray-500 max-w-xl mx-auto">Join thousands of donors making a real difference in Nepal. Every contribution matters.</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {campaigns.slice(0, 3).map((camp, i) => (
              <CampaignCard c={camp} delay={(i + 1) as 1 | 2 | 3 | 4 | 5 | 6} key={camp.id} />
            ))}
          </div>
          <div class="text-center mt-12 reveal">
            <a href="/campaigns" class="bg-blue-700 hover:bg-blue-800 text-white font-bold px-10 py-4 rounded-xl text-lg transition-all btn-glow inline-flex items-center gap-3">
              View All Campaigns <i class="fas fa-arrow-right"></i>
            </a>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section class="py-20 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-14 reveal">
            <span class="text-blue-600 font-semibold text-sm uppercase tracking-widest">Simple Process</span>
            <h2 class="text-4xl font-black text-gray-900 mt-2 mb-3">How It Works</h2>
            <p class="text-gray-500 max-w-xl mx-auto">Getting started is easy. Create your campaign in just 3 simple steps.</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div class="hidden md:block absolute top-16 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-blue-200 via-yellow-300 to-blue-200 z-0"></div>

            {[
              { icon: 'fa-edit', num: '1', title: 'Start a Campaign', desc: 'Create your fundraiser with easy steps. Add your story, set your goal, and upload supporting documents.', color: 'from-blue-500 to-blue-700', iconBg: 'bg-blue-100 text-blue-600' },
              { icon: 'fa-share-alt', num: '2', title: 'Share & Promote', desc: 'Spread the word on social media and beyond. Our tools make it easy to reach more donors quickly.', color: 'from-yellow-400 to-yellow-600', iconBg: 'bg-yellow-100 text-yellow-600' },
              { icon: 'fa-wallet', num: '3', title: 'Receive Donations', desc: 'Collect funds quickly and securely via eSewa, Khalti, or bank transfer. Withdraw anytime.', color: 'from-green-500 to-green-700', iconBg: 'bg-green-100 text-green-600' },
            ].map((step, i) => (
              <div class={`reveal stagger-${i + 1} relative z-10 text-center bg-white rounded-3xl p-8 shadow-md border border-gray-100 card-hover`} key={i}>
                <div class={`w-16 h-16 ${step.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl`}>
                  <i class={`fas ${step.icon}`}></i>
                </div>
                <div class={`w-8 h-8 bg-gradient-to-br ${step.color} text-white text-sm font-black rounded-full flex items-center justify-center mx-auto -mt-12 mb-4 shadow-lg`}>
                  {step.num}
                </div>
                <h3 class="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p class="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Transparency Section */}
      <section class="py-20 bg-blue-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div class="reveal">
              <span class="text-blue-600 font-semibold text-sm uppercase tracking-widest">Why Choose Us</span>
              <h2 class="text-4xl font-black text-gray-900 mt-2 mb-6">Built on Trust &<br />Transparency</h2>
              <div class="space-y-5">
                {[
                  { icon: 'fa-id-card', color: 'text-blue-600 bg-blue-100', title: 'Document Verification', desc: 'Every campaign is reviewed with supporting documents (ID, medical records, etc.) before going live.' },
                  { icon: 'fa-lock', color: 'text-green-600 bg-green-100', title: 'Secure Payments', desc: 'All transactions are encrypted and processed through trusted gateways like eSewa and Khalti.' },
                  { icon: 'fa-chart-line', color: 'text-purple-600 bg-purple-100', title: 'Real-time Tracking', desc: 'Donors can track exactly how funds are used with regular updates from campaign organizers.' },
                  { icon: 'fa-rupee-sign', color: 'text-yellow-600 bg-yellow-100', title: 'Zero Hidden Fees', desc: 'We believe in transparency – no surprise charges. 100% of your donation goes to the cause.' },
                ].map((item, i) => (
                  <div class="flex gap-4 items-start" key={i}>
                    <div class={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center flex-shrink-0 text-lg`}>
                      <i class={`fas ${item.icon}`}></i>
                    </div>
                    <div>
                      <h4 class="font-bold text-gray-900 mb-1">{item.title}</h4>
                      <p class="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div class="reveal stagger-2">
              <div class="bg-white rounded-3xl p-8 shadow-xl border border-blue-100">
                <h3 class="font-bold text-gray-900 text-xl mb-6 flex items-center gap-2">
                  <i class="fas fa-chart-pie text-blue-600"></i> Platform Statistics
                </h3>
                <div class="space-y-5">
                  {[
                    { label: 'Medical Campaigns', pct: 72, color: '#ef4444' },
                    { label: 'Education Campaigns', pct: 45, color: '#3b82f6' },
                    { label: 'Disaster Relief', pct: 58, color: '#f59e0b' },
                    { label: 'Community Projects', pct: 31, color: '#10b981' },
                  ].map((stat, i) => (
                    <div key={i}>
                      <div class="flex justify-between text-sm font-medium mb-1">
                        <span class="text-gray-700">{stat.label}</span>
                        <span class="text-gray-500">{stat.pct}% funded</span>
                      </div>
                      <div class="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div class="prog-bar h-3 rounded-full" style={`width:0%; background:${stat.color}`} data-pct={stat.pct}></div>
                      </div>
                    </div>
                  ))}
                </div>
                <div class="mt-8 grid grid-cols-2 gap-4">
                  <div class="bg-blue-50 rounded-2xl p-4 text-center">
                    <div class="text-2xl font-black text-blue-700">98%</div>
                    <div class="text-xs text-gray-500 mt-1">Campaigns Verified</div>
                  </div>
                  <div class="bg-green-50 rounded-2xl p-4 text-center">
                    <div class="text-2xl font-black text-green-700">4.9★</div>
                    <div class="text-xs text-gray-500 mt-1">Donor Rating</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section class="py-20 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-14 reveal">
            <span class="text-blue-600 font-semibold text-sm uppercase tracking-widest">Success Stories</span>
            <h2 class="text-4xl font-black text-gray-900 mt-2">Lives Changed</h2>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Priya Sharma', role: 'Cancer Survivor', text: '"Jeevani Nepal NODAS helped me raise funds for my treatment. The platform was transparent and my donors trusted it completely. I am forever grateful."', rating: 5, avatar: 'PS' },
              { name: 'Ram Bahadur', role: 'School Teacher', text: '"We raised NPR 3 Lakhs in just 20 days for our village school. The team at Jeevani NODAS guided us at every step. Our children now have books and desks!"', rating: 5, avatar: 'RB' },
              { name: 'Anita Gurung', role: 'Flood Victim', text: '"When floods destroyed our home, strangers from across Nepal donated to help us rebuild. Jeevani NODAS made it possible. This platform truly saves lives."', rating: 5, avatar: 'AG' },
            ].map((t, i) => (
              <div class={`reveal stagger-${i + 1} bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-100 card-hover`} key={i}>
                <div class="flex items-center gap-1 mb-4">
                  {Array(t.rating).fill(0).map((_, j) => <i class="fas fa-star text-yellow-400 text-sm" key={j}></i>)}
                </div>
                <p class="text-gray-600 text-sm leading-relaxed mb-6 italic">{t.text}</p>
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-blue-700 text-white rounded-full flex items-center justify-center font-bold text-sm">{t.avatar}</div>
                  <div>
                    <div class="font-bold text-gray-900 text-sm">{t.name}</div>
                    <div class="text-gray-500 text-xs">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section class="cta-gradient py-20">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div class="reveal">
            <div class="text-6xl mb-6">❤️</div>
            <h2 class="text-4xl lg:text-5xl font-black text-white mb-4">Ready to Help Someone Today?</h2>
            <p class="text-blue-100 text-xl mb-10 max-w-2xl mx-auto">Start a fundraiser in minutes and reach thousands of compassionate donors across Nepal.</p>
            <a href="/start-fundraiser" class="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-black px-12 py-5 rounded-2xl text-xl transition-all btn-glow-yellow inline-flex items-center gap-3 shadow-2xl">
              <i class="fas fa-rocket"></i> Start Your Campaign
            </a>
            <p class="text-blue-200 text-sm mt-6"><i class="fas fa-lock mr-2"></i>100% Secure • Verified Platform • Free to Start</p>
          </div>
        </div>
      </section>
    </Layout>
  )
})

// ─── All Campaigns Page ─────────────────────────────────────────────────────────
app.get('/campaigns', (c) => {
  return c.html(
    <Layout title="Browse Campaigns">
      <section class="bg-blue-700 py-14">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 class="text-4xl font-black text-white mb-3">Browse All Campaigns</h1>
          <p class="text-blue-100 text-lg">Find a cause you care about and make a real difference today.</p>
        </div>
      </section>

      {/* Filters */}
      <section class="bg-white border-b border-gray-100 py-5 sticky top-16 z-40 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex flex-wrap gap-3 items-center">
            <span class="text-sm font-semibold text-gray-600">Filter:</span>
            {['All', 'Medical', 'Education', 'Disaster Relief', 'Community'].map(cat => (
              <button key={cat} class={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${cat === 'All' ? 'bg-blue-700 text-white border-blue-700' : 'border-gray-200 text-gray-600 hover:border-blue-700 hover:text-blue-700'}`}>
                {cat}
              </button>
            ))}
            <div class="ml-auto">
              <select class="border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-600 focus:border-blue-500">
                <option>Sort: Newest</option>
                <option>Most Funded</option>
                <option>Ending Soon</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section class="py-16 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {campaigns.map((camp, i) => (
              <CampaignCard c={camp} delay={((i % 3) + 1) as 1 | 2 | 3} key={camp.id} />
            ))}
          </div>
        </div>
      </section>
    </Layout>
  )
})

// ─── Single Campaign Page ───────────────────────────────────────────────────────
app.get('/campaigns/:id', (c) => {
  const id = parseInt(c.req.param('id'))
  const camp = campaigns.find(x => x.id === id)
  if (!camp) return c.html(<Layout title="Not Found"><div class="p-20 text-center text-gray-500">Campaign not found.</div></Layout>)
  const p = pct(camp.raised, camp.goal)

  return c.html(
    <Layout title={camp.title}>
      <div class="max-w-6xl mx-auto px-4 py-12">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left */}
          <div class="lg:col-span-2">
            <img src={camp.image} alt={camp.title} class="w-full h-80 object-cover rounded-3xl mb-6 shadow-lg" />
            <div class="flex items-center gap-2 mb-4">
              <span class="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">{camp.category}</span>
              {camp.daysLeft <= 10 && <span class="bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full animate-pulse">{camp.daysLeft} days left!</span>}
            </div>
            <h1 class="text-3xl font-black text-gray-900 mb-4">{camp.title}</h1>
            <p class="text-gray-600 leading-relaxed mb-6">{camp.description}</p>
            <div class="bg-blue-50 rounded-2xl p-6">
              <h3 class="font-bold text-gray-900 mb-3"><i class="fas fa-info-circle text-blue-600 mr-2"></i>About this Campaign</h3>
              <p class="text-gray-600 text-sm leading-relaxed">
                This campaign is verified by Jeevani Nepal NODAS. All documents including identity proof and supporting evidence have been reviewed and approved by our moderation team.
                100% of your donation goes directly to the beneficiary. Funds are released in stages with regular updates.
              </p>
            </div>
          </div>

          {/* Right - Donation Widget */}
          <div>
            <div class="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sticky top-24">
              <div class="mb-4">
                <div class="flex justify-between text-sm font-semibold mb-2">
                  <span class="text-blue-700 text-lg font-black">NPR {fmt(camp.raised)}</span>
                  <span class="text-gray-500">of NPR {fmt(camp.goal)}</span>
                </div>
                <div class="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div class="prog-bar h-3 rounded-full bg-blue-600" style="width:0%" data-pct={p}></div>
                </div>
                <div class="flex justify-between text-xs text-gray-500 mt-1.5">
                  <span><i class="fas fa-users mr-1"></i>{camp.donors} donors</span>
                  <span class="font-bold text-blue-700">{p}% funded</span>
                </div>
              </div>

              <div class="bg-red-50 text-red-600 text-sm font-semibold text-center py-2 rounded-xl mb-5">
                <i class="fas fa-clock mr-1"></i> {camp.daysLeft} days remaining
              </div>

              <h3 class="font-bold text-gray-900 mb-3">Make a Donation</h3>
              <div class="grid grid-cols-3 gap-2 mb-4">
                {[500, 1000, 2000, 5000, 10000, 25000].map(amt => (
                  <button key={amt} onclick={`setAmount(${amt})`} class="amt-btn border border-gray-200 hover:border-blue-500 hover:bg-blue-50 text-sm font-semibold py-2 rounded-xl transition-all text-gray-700">
                    {amt >= 1000 ? `₹${amt / 1000}K` : `₹${amt}`}
                  </button>
                ))}
              </div>
              <input type="number" id="donationAmt" placeholder="Enter custom amount (NPR)" class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm mb-4" />
              <a href={`/donate?campaign=${camp.id}`} class="block bg-blue-700 hover:bg-blue-800 text-white font-black text-center py-4 rounded-xl text-lg transition-all btn-glow mb-3">
                <i class="fas fa-heart mr-2"></i>Donate Now
              </a>
              <div class="text-center text-xs text-gray-400">
                <i class="fas fa-lock mr-1"></i>Secured by 256-bit SSL encryption
              </div>

              <div class="mt-6 pt-5 border-t border-gray-100">
                <h4 class="font-bold text-gray-700 text-sm mb-3">Share this Campaign</h4>
                <div class="flex gap-2">
                  <button class="flex-1 bg-blue-600 text-white text-xs py-2 rounded-lg hover:bg-blue-700 transition-colors"><i class="fab fa-facebook-f mr-1"></i>Share</button>
                  <button class="flex-1 bg-sky-400 text-white text-xs py-2 rounded-lg hover:bg-sky-500 transition-colors"><i class="fab fa-twitter mr-1"></i>Tweet</button>
                  <button class="flex-1 bg-green-500 text-white text-xs py-2 rounded-lg hover:bg-green-600 transition-colors"><i class="fab fa-whatsapp mr-1"></i>WhatsApp</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{__html: `
        function setAmount(amt) {
          document.getElementById('donationAmt').value = amt;
          document.querySelectorAll('.amt-btn').forEach(b => b.classList.remove('bg-blue-600','text-white','border-blue-600'));
          event.target.classList.add('bg-blue-600','text-white','border-blue-600');
        }
      `}}></script>
    </Layout>
  )
})

// ─── Donate Page ───────────────────────────────────────────────────────────────
app.get('/donate', (c) => {
  return c.html(
    <Layout title="Donate">
      <section class="bg-blue-700 py-14">
        <div class="max-w-7xl mx-auto px-4 text-center">
          <h1 class="text-4xl font-black text-white mb-3">Make a Donation</h1>
          <p class="text-blue-100 text-lg">Your generosity saves lives. Choose a campaign and donate securely.</p>
        </div>
      </section>

      <section class="py-16 bg-gray-50">
        <div class="max-w-4xl mx-auto px-4">
          <div class="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div class="bg-gradient-to-r from-blue-700 to-blue-500 p-8 text-white">
              <h2 class="text-2xl font-bold mb-2">Secure Donation Form</h2>
              <p class="text-blue-100 text-sm">All payments are secured with 256-bit SSL encryption</p>
            </div>
            <div class="p-8">
              <form onsubmit="handleDonate(event)">
                <div class="mb-6">
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Select Campaign</label>
                  <select name="campaign" class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm">
                    <option value="">-- Choose a Campaign --</option>
                    {campaigns.map(c => (
                      <option key={c.id} value={c.id}>{c.title} (NPR {fmt(c.raised)} raised)</option>
                    ))}
                  </select>
                </div>

                <div class="mb-6">
                  <label class="block text-sm font-semibold text-gray-700 mb-3">Select Amount</label>
                  <div class="grid grid-cols-3 md:grid-cols-6 gap-3 mb-3">
                    {[500, 1000, 2500, 5000, 10000, 25000].map(amt => (
                      <button type="button" key={amt} onclick={`selectAmt(${amt}, this)`} class="donate-amt-btn border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 text-sm font-bold py-3 rounded-xl transition-all text-gray-700">
                        NPR {fmt(amt)}
                      </button>
                    ))}
                  </div>
                  <input type="number" name="amount" id="customAmt" placeholder="Or enter custom amount in NPR" class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" />
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Your Name</label>
                    <input type="text" name="name" placeholder="Full Name" class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" required />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                    <input type="email" name="email" placeholder="your@email.com" class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" required />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                    <input type="tel" name="phone" placeholder="+977 98XXXXXXXX" class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Payment Method</label>
                    <select name="method" class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm">
                      <option>eSewa</option>
                      <option>Khalti</option>
                      <option>IME Pay</option>
                      <option>Bank Transfer</option>
                      <option>ConnectIPS</option>
                    </select>
                  </div>
                </div>

                <div class="mb-6">
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Message (Optional)</label>
                  <textarea name="message" rows={3} placeholder="Leave a message of support..." class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none"></textarea>
                </div>

                <div class="flex items-start gap-3 mb-6">
                  <input type="checkbox" id="anonymous" class="mt-1" />
                  <label for="anonymous" class="text-sm text-gray-600">Make my donation anonymous (your name won't be shown publicly)</label>
                </div>

                <button type="submit" class="w-full bg-blue-700 hover:bg-blue-800 text-white font-black py-4 rounded-xl text-lg transition-all btn-glow">
                  <i class="fas fa-heart mr-2"></i> Donate Securely Now
                </button>
                <p class="text-center text-xs text-gray-400 mt-3"><i class="fas fa-shield-alt mr-1"></i>Your payment details are never stored. 100% secure.</p>
              </form>
            </div>
          </div>

          <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: 'fa-shield-alt', title: 'Secure & Safe', desc: 'All transactions are SSL encrypted and processed through trusted Nepali payment gateways.', color: 'text-blue-600 bg-blue-50' },
              { icon: 'fa-receipt', title: 'Instant Receipt', desc: 'You will receive a donation receipt instantly on your email for tax purposes.', color: 'text-green-600 bg-green-50' },
              { icon: 'fa-eye', title: 'Full Transparency', desc: 'Track how your donation is being used through real-time campaign updates.', color: 'text-purple-600 bg-purple-50' },
            ].map((item, i) => (
              <div key={i} class={`${item.color} rounded-2xl p-5 text-center`}>
                <i class={`fas ${item.icon} text-2xl mb-2`}></i>
                <h4 class="font-bold text-gray-900 text-sm mb-1">{item.title}</h4>
                <p class="text-gray-500 text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <script dangerouslySetInnerHTML={{__html: `
        function selectAmt(amt, btn) {
          document.getElementById('customAmt').value = amt;
          document.querySelectorAll('.donate-amt-btn').forEach(b => {
            b.classList.remove('bg-blue-700','text-white','border-blue-700');
            b.classList.add('border-gray-200','text-gray-700');
          });
          btn.classList.remove('border-gray-200','text-gray-700');
          btn.classList.add('bg-blue-700','text-white','border-blue-700');
        }
        function handleDonate(e) {
          e.preventDefault();
          const btn = e.target.querySelector('button[type=submit]');
          btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Processing...';
          btn.disabled = true;
          setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-check-circle mr-2"></i>Donation Successful! Thank you ❤️';
            btn.classList.remove('bg-blue-700','hover:bg-blue-800');
            btn.classList.add('bg-green-600');
          }, 2000);
        }
      `}}></script>
    </Layout>
  )
})

// ─── Start Fundraiser Page ──────────────────────────────────────────────────────
app.get('/start-fundraiser', (c) => {
  return c.html(
    <Layout title="Start a Fundraiser">
      <section class="bg-blue-700 py-14">
        <div class="max-w-7xl mx-auto px-4 text-center">
          <h1 class="text-4xl font-black text-white mb-3">Start Your Fundraiser</h1>
          <p class="text-blue-100 text-lg">Create a campaign in minutes and start receiving donations from across Nepal.</p>
        </div>
      </section>

      <section class="py-16 bg-gray-50">
        <div class="max-w-4xl mx-auto px-4">
          {/* Steps indicator */}
          <div class="flex items-center justify-center mb-10">
            {[{ n: '1', label: 'Campaign Info' }, { n: '2', label: 'Your Story' }, { n: '3', label: 'Documents' }].map((s, i) => (
              <>
                <div key={i} class={`flex flex-col items-center ${i === 0 ? '' : ''}`}>
                  <div class={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm ${i === 0 ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-500'}`}>{s.n}</div>
                  <span class={`text-xs mt-1 font-medium ${i === 0 ? 'text-blue-700' : 'text-gray-400'}`}>{s.label}</span>
                </div>
                {i < 2 && <div class="flex-1 h-0.5 bg-gray-200 mx-3 mb-5"></div>}
              </>
            ))}
          </div>

          <div class="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div class="bg-gradient-to-r from-blue-700 to-indigo-600 p-8 text-white">
              <h2 class="text-2xl font-bold mb-2">Campaign Information</h2>
              <p class="text-blue-100 text-sm">Tell us about your cause. All campaigns are reviewed within 24-48 hours.</p>
            </div>
            <div class="p-8">
              <form onsubmit="handleSubmit(event)">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Fundraiser Title *</label>
                    <input type="text" placeholder="e.g. Help John's Heart Surgery" class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" required />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                    <select class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" required>
                      <option value="">Select Category</option>
                      <option>Medical Emergency</option>
                      <option>Education</option>
                      <option>Disaster Relief</option>
                      <option>Community Project</option>
                      <option>Animal Welfare</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Goal Amount (NPR) *</label>
                    <input type="number" placeholder="e.g. 300000" class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" required />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Campaign Duration</label>
                    <select class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm">
                      <option>30 Days</option>
                      <option>60 Days</option>
                      <option>90 Days</option>
                      <option>Open-ended</option>
                    </select>
                  </div>
                </div>

                <div class="mb-6">
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Your Story *</label>
                  <textarea rows={5} placeholder="Tell donors why you need help. Be specific and honest. Include medical reports, location, and how funds will be used..." class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none" required></textarea>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Your Name *</label>
                    <input type="text" placeholder="Full Name" class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" required />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                    <input type="tel" placeholder="+977 98XXXXXXXX" class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" required />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                    <input type="email" placeholder="your@email.com" class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" required />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                    <input type="text" placeholder="e.g. Kathmandu, Nepal" class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" />
                  </div>
                </div>

                <div class="mb-6">
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Upload Documents</label>
                  <div class="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                    <i class="fas fa-cloud-upload-alt text-4xl text-gray-300 mb-3"></i>
                    <p class="text-sm text-gray-500">Drag & drop files here or <span class="text-blue-600 font-semibold">browse</span></p>
                    <p class="text-xs text-gray-400 mt-1">Accepted: ID proof, Medical records, Letters (PDF, JPG, PNG)</p>
                  </div>
                </div>

                <div class="bg-blue-50 rounded-2xl p-5 mb-6 flex gap-3 items-start">
                  <i class="fas fa-info-circle text-blue-600 mt-0.5"></i>
                  <div class="text-sm text-blue-800">
                    <strong>Review Process:</strong> Our team will verify your documents within 24-48 hours. Once approved, your campaign goes live instantly. You will be notified by email and SMS.
                  </div>
                </div>

                <div class="flex items-start gap-3 mb-6">
                  <input type="checkbox" id="terms" class="mt-1" required />
                  <label for="terms" class="text-sm text-gray-600">I agree to the <a href="#" class="text-blue-600 underline">Terms of Use</a> and confirm that all information provided is accurate and truthful.</label>
                </div>

                <button type="submit" class="w-full bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-black py-4 rounded-xl text-lg transition-all btn-glow-yellow">
                  <i class="fas fa-rocket mr-2"></i>Submit Campaign for Review
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <script dangerouslySetInnerHTML={{__html: `
        function handleSubmit(e) {
          e.preventDefault();
          const btn = e.target.querySelector('button[type=submit]');
          btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Submitting...';
          btn.disabled = true;
          setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-check-circle mr-2"></i>Campaign Submitted! We\\'ll review within 24 hrs.';
            btn.classList.remove('bg-yellow-400');
            btn.classList.add('bg-green-500','text-white');
          }, 2000);
        }
      `}}></script>
    </Layout>
  )
})

// ─── Resources Page ─────────────────────────────────────────────────────────────
app.get('/resources', (c) => {
  return c.html(
    <Layout title="Resources">
      <section class="bg-blue-700 py-14">
        <div class="max-w-7xl mx-auto px-4 text-center">
          <h1 class="text-4xl font-black text-white mb-3">Resources & Guides</h1>
          <p class="text-blue-100 text-lg">Everything you need to run a successful fundraising campaign in Nepal.</p>
        </div>
      </section>

      <section class="py-16 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              { icon: 'fa-book-open', title: "Fundraiser's Guide", desc: 'Step-by-step guide to creating a compelling campaign that resonates with donors and meets our verification standards.', tag: 'Guide', color: 'bg-blue-50 text-blue-600' },
              { icon: 'fa-video', title: 'Video Tutorials', desc: 'Watch our video series on how to write your story, upload documents, and promote your campaign on social media.', tag: 'Video', color: 'bg-red-50 text-red-600' },
              { icon: 'fa-file-alt', title: 'Document Templates', desc: 'Download free templates for authorization letters, medical certificates, and other documents required for verification.', tag: 'Download', color: 'bg-green-50 text-green-600' },
              { icon: 'fa-question-circle', title: 'FAQ', desc: 'Answers to the most frequently asked questions about campaigning, donations, withdrawals, and platform policies.', tag: 'FAQ', color: 'bg-yellow-50 text-yellow-600' },
              { icon: 'fa-shield-alt', title: 'Safety & Privacy', desc: 'Learn about our data protection policies, how we secure your information, and fraud prevention measures.', tag: 'Policy', color: 'bg-purple-50 text-purple-600' },
              { icon: 'fa-headset', title: 'Live Support', desc: 'Reach our dedicated support team via phone, email, or live chat. Available Monday to Friday, 9 AM to 6 PM.', tag: 'Support', color: 'bg-teal-50 text-teal-600' },
            ].map((item, i) => (
              <div key={i} class={`reveal stagger-${(i % 3) + 1} bg-white rounded-2xl p-7 shadow-md border border-gray-100 card-hover`}>
                <div class={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center text-2xl mb-4`}>
                  <i class={`fas ${item.icon}`}></i>
                </div>
                <span class={`text-xs font-bold px-2 py-1 rounded-full ${item.color} mb-3 inline-block`}>{item.tag}</span>
                <h3 class="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p class="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                <a href="#" class="inline-flex items-center gap-1 text-blue-600 font-semibold text-sm mt-4 hover:gap-2 transition-all">
                  Learn More <i class="fas fa-arrow-right text-xs"></i>
                </a>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div class="max-w-3xl mx-auto">
            <h2 class="text-3xl font-black text-gray-900 text-center mb-10 reveal">Frequently Asked Questions</h2>
            <div class="space-y-4">
              {[
                { q: 'How long does campaign verification take?', a: 'Our team reviews all submitted campaigns within 24-48 hours on business days. You will receive an email notification once approved or if additional documents are needed.' },
                { q: 'What payment methods are accepted?', a: 'We accept eSewa, Khalti, IME Pay, ConnectIPS, and direct bank transfers. All transactions are secured with 256-bit SSL encryption.' },
                { q: 'How can I withdraw my funds?', a: 'Once your campaign reaches its goal or the duration ends, you can request a withdrawal to your bank account or mobile wallet. Processing takes 2-3 business days.' },
                { q: 'Are there any platform fees?', a: 'Jeevani Nepal NODAS charges a minimal 3% platform fee to cover operational costs. This fee is transparently shown before each transaction. 97% goes directly to the beneficiary.' },
                { q: 'Can I donate anonymously?', a: 'Yes! You can choose to make your donation anonymous when filling out the donation form. Your name will not be shown publicly, but you will still receive a receipt email.' },
              ].map((item, i) => (
                <div key={i} class="reveal bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                  <button onclick={`toggleFaq(${i})`} class="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors">
                    <span class="font-semibold text-gray-900 text-sm">{item.q}</span>
                    <i class={`fas fa-chevron-down text-gray-400 transition-transform`} id={`faq-icon-${i}`}></i>
                  </button>
                  <div id={`faq-${i}`} class="hidden px-5 pb-5 text-gray-500 text-sm leading-relaxed">{item.a}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <script dangerouslySetInnerHTML={{__html: `
        function toggleFaq(i) {
          const el = document.getElementById('faq-' + i);
          const icon = document.getElementById('faq-icon-' + i);
          el.classList.toggle('hidden');
          icon.style.transform = el.classList.contains('hidden') ? '' : 'rotate(180deg)';
        }
      `}}></script>
    </Layout>
  )
})

// ─── Contact Page ──────────────────────────────────────────────────────────────
app.get('/contact', (c) => {
  return c.html(
    <Layout title="Contact Us">
      <section class="bg-blue-700 py-14">
        <div class="max-w-7xl mx-auto px-4 text-center">
          <h1 class="text-4xl font-black text-white mb-3">Contact Us</h1>
          <p class="text-blue-100 text-lg">We are here to help. Reach out to our team anytime.</p>
        </div>
      </section>

      <section class="py-16 bg-gray-50">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Contact Info */}
            <div class="space-y-6">
              <div class="reveal">
                <h2 class="text-2xl font-black text-gray-900 mb-4">Get in Touch</h2>
                <p class="text-gray-500 text-sm leading-relaxed">Whether you have questions about a campaign, need technical support, or want to partner with us – our team is ready to help.</p>
              </div>
              {[
                { icon: 'fa-map-marker-alt', color: 'bg-blue-100 text-blue-600', title: 'Office Address', lines: ['Jeevani Nepal NODAS', 'Baneshwor, Kathmandu', 'Nepal – 44600'] },
                { icon: 'fa-phone-alt', color: 'bg-green-100 text-green-600', title: 'Phone / Hotline', lines: ['+977 01-4567890', '+977 9801234567 (24/7)'] },
                { icon: 'fa-envelope', color: 'bg-yellow-100 text-yellow-600', title: 'Email', lines: ['help@jeevaninepal.org', 'campaigns@jeevaninepal.org'] },
                { icon: 'fa-clock', color: 'bg-purple-100 text-purple-600', title: 'Working Hours', lines: ['Monday – Friday: 9 AM – 6 PM', 'Saturday: 10 AM – 2 PM', 'Sunday: Closed'] },
              ].map((item, i) => (
                <div key={i} class="reveal flex gap-4 items-start">
                  <div class={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <i class={`fas ${item.icon}`}></i>
                  </div>
                  <div>
                    <h4 class="font-bold text-gray-900 text-sm mb-1">{item.title}</h4>
                    {item.lines.map((line, j) => <p key={j} class="text-gray-500 text-sm">{line}</p>)}
                  </div>
                </div>
              ))}
            </div>

            {/* Contact Form */}
            <div class="lg:col-span-2 reveal stagger-2">
              <div class="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                <h3 class="text-xl font-bold text-gray-900 mb-6">Send us a Message</h3>
                <form onsubmit="handleContact(event)">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                    <div>
                      <label class="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                      <input type="text" placeholder="Your Name" class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" required />
                    </div>
                    <div>
                      <label class="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                      <input type="email" placeholder="your@email.com" class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" required />
                    </div>
                    <div>
                      <label class="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                      <input type="tel" placeholder="+977 98XXXXXXXX" class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" />
                    </div>
                    <div>
                      <label class="block text-sm font-semibold text-gray-700 mb-2">Subject *</label>
                      <select class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" required>
                        <option value="">Select Subject</option>
                        <option>Campaign Inquiry</option>
                        <option>Donation Issue</option>
                        <option>Withdrawal Request</option>
                        <option>Technical Support</option>
                        <option>Partnership Inquiry</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>
                  <div class="mb-5">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Message *</label>
                    <textarea rows={5} placeholder="Describe your query or feedback in detail..." class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none" required></textarea>
                  </div>
                  <button type="submit" class="w-full bg-blue-700 hover:bg-blue-800 text-white font-black py-4 rounded-xl text-lg transition-all btn-glow">
                    <i class="fas fa-paper-plane mr-2"></i>Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <script dangerouslySetInnerHTML={{__html: `
        function handleContact(e) {
          e.preventDefault();
          const btn = e.target.querySelector('button[type=submit]');
          btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Sending...';
          btn.disabled = true;
          setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-check-circle mr-2"></i>Message Sent! We\\'ll respond within 24 hours.';
            btn.classList.replace('bg-blue-700','bg-green-600');
          }, 1500);
        }
      `}}></script>
    </Layout>
  )
})

// ─── API Endpoints ─────────────────────────────────────────────────────────────
app.get('/api/campaigns', (c) => {
  return c.json({ success: true, data: campaigns, total: campaigns.length })
})

app.get('/api/campaigns/:id', (c) => {
  const id = parseInt(c.req.param('id'))
  const camp = campaigns.find(x => x.id === id)
  if (!camp) return c.json({ success: false, error: 'Campaign not found' }, 404)
  return c.json({ success: true, data: camp })
})

app.post('/api/donate', async (c) => {
  const body = await c.req.json()
  return c.json({ success: true, message: 'Donation recorded', transactionId: 'TXN' + Date.now(), data: body })
})

export default app
