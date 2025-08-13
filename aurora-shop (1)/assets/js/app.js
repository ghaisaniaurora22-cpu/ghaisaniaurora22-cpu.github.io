
// Utilities
const $ = (sel, el=document) => el.querySelector(sel);
const $$ = (sel, el=document) => Array.from(el.querySelectorAll(sel));
const fmtIDR = n => new Intl.NumberFormat('id-ID', {style:'currency', currency:'IDR', maximumFractionDigits:0}).format(n);

// Data
const PRODUCTS = [
  {id:"A01", name:"Aurora Silk Dress", price:1499000, img:"assets/img/product_1.svg", cat:"dress", sizes:["S","M","L"], badge:"Baru", desc:"Gaun sutra dengan potongan A-line untuk tampilan elegan."},
  {id:"A02", name:"Rose Blouse", price:699000, img:"assets/img/product_2.svg", cat:"top", sizes:["S","M","L"], badge:"Terlaris", desc:"Blouse romantis dengan detail ruffle halus."},
  {id:"A03", name:"Luxe Pleated Skirt", price:899000, img:"assets/img/product_3.svg", cat:"bottom", sizes:["S","M","L"], badge:"", desc:"Rok plisket premium dengan jatuh yang indah."},
  {id:"A04", name:"Bloom Knit Top", price:549000, img:"assets/img/product_4.svg", cat:"top", sizes:["S","M","L"], badge:"", desc:"Rajut lembut bernuansa pink muda untuk keseharian."},
  {id:"A05", name:"Pearl Satin Pants", price:999000, img:"assets/img/product_5.svg", cat:"bottom", sizes:["S","M","L"], badge:"", desc:"Celana satin high-waist dengan siluet memanjang."},
  {id:"A06", name:"Lace Midi Dress", price:1699000, img:"assets/img/product_6.svg", cat:"dress", sizes:["S","M","L"], badge:"Eksklusif", desc:"Dress renda detail premium, cocok untuk acara spesial."},
  {id:"A07", name:"Aurora Silk Scarf", price:299000, img:"assets/img/product_7.svg", cat:"accessory", sizes:["All"], badge:"", desc:"Scarf sutra motif minimalis."},
  {id:"A08", name:"Rose Headband", price:199000, img:"assets/img/product_8.svg", cat:"accessory", sizes:["All"], badge:"", desc:"Headband warna blush untuk final touch."},
];

// State
let cart = JSON.parse(localStorage.getItem('aurora_cart')||'[]');
let wishlist = JSON.parse(localStorage.getItem('aurora_wishlist')||'[]');

// Init
document.addEventListener('DOMContentLoaded', () => {
  // Year
  $('#year').textContent = new Date().getFullYear();

  // Slider
  setupSlider();

  // Grid
  renderProducts(PRODUCTS);

  // Reveal on scroll
  setupReveal();

  // Parallax
  setupParallax();

  // Search & Filter
  setupFilters();

  // Cart
  updateCartCount();
  $('#btnCart').addEventListener('click', toggleCart);
  $('#closeCart').addEventListener('click', toggleCart);
  $('#btnCheckout').addEventListener('click', openCheckout);

  // Checkout form
  $('#checkoutForm').addEventListener('submit', handleCheckout);

  // Newsletter
  $('#newsletterForm').addEventListener('submit', e => {
    e.preventDefault();
    toast('Terima kasih telah berlangganan ✨');
  });

  // Contact
  $('#contactForm').addEventListener('submit', e => {
    e.preventDefault();
    toast('Pesan terkirim. Kami akan balas via email 💌');
    e.target.reset();
  });

  // Explore scroll
  $('#scrollExplore').addEventListener('click', ()=> document.querySelector('#koleksi').scrollIntoView({behavior:'smooth'}));
});

// Slider (auto + manual)
function setupSlider(){
  const slider = $('#heroSlider');
  const track = slider.querySelector('.slides');
  const slides = $$('.slide', slider);
  const dots = slider.querySelector('.dots');
  let i = 0, auto;

  slides.forEach((_, idx) => {
    const b = document.createElement('button');
    if(idx===0) b.classList.add('active');
    b.addEventListener('click', ()=>go(idx));
    dots.appendChild(b);
  });

  const prev = slider.querySelector('.prev');
  const next = slider.querySelector('.next');
  prev.addEventListener('click', ()=>go(i-1));
  next.addEventListener('click', ()=>go(i+1));

  function go(n){
    i = (n+slides.length)%slides.length;
    track.style.transform = `translateX(-${i*100}%)`;
    $$('.dots button', slider).forEach((d,idx)=>d.classList.toggle('active', idx===i));
    reset();
  }
  function reset(){
    clearInterval(auto);
    auto = setInterval(()=>go(i+1), 4500);
  }
  reset();
}

// Render products
function renderProducts(list){
  const grid = $('#productGrid');
  grid.innerHTML = '';
  list.forEach(p => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <div class="media">
        <img src="${p.img}" alt="${p.name}">
        ${p.badge?`<span class="badge">${p.badge}</span>`:''}
        <button class="quick">Lihat cepat</button>
      </div>
      <div class="content">
        <h3>${p.name}</h3>
        <p class="muted">${p.cat}</p>
        <div class="price"><strong>${fmtIDR(p.price)}</strong></div>
        <div class="sizes">${p.sizes.map(s=>`<button class="size-pill" data-size="${s}">${s}</button>`).join('')}</div>
        <div class="actions">
          <button class="btn ghost fav">${wishlist.includes(p.id)?'♥ Favorit':'♡ Favorit'}</button>
          <button class="btn primary add">Tambah</button>
        </div>
      </div>
    `;
    // events
    $('.quick', card).addEventListener('click', ()=>openQuickView(p));
    $('.fav', card).addEventListener('click', (e)=>toggleFav(p.id, e.target));
    $('.add', card).addEventListener('click', ()=>addToCart(p, p.sizes[0]));
    $$('.size-pill', card).forEach(b=>b.addEventListener('click', (e)=>{
      $$('.size-pill', card).forEach(x=>x.classList.remove('active'));
      e.currentTarget.classList.add('active');
    }));
    grid.appendChild(card);
    requestAnimationFrame(()=>card.classList.add('show'));
  });
}

// Filters & search
function setupFilters(){
  $$('.chip').forEach(ch => {
    ch.addEventListener('click', ()=>{
      $$('.chip').forEach(c=>c.classList.remove('active'));
      ch.classList.add('active');
      applyFilter();
    });
  });
  $('#searchInput').addEventListener('input', applyFilter);

  function applyFilter(){
    const q = $('#searchInput').value.toLowerCase();
    const cat = $('.chip.active').dataset.filter;
    const filtered = PRODUCTS.filter(p => {
      const okCat = cat==='all' || p.cat===cat;
      const okQ = !q || p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q);
      return okCat && okQ;
    });
    renderProducts(filtered);
  }
}

// Wishlist
function toggleFav(id, btn){
  if(wishlist.includes(id)){
    wishlist = wishlist.filter(x=>x!==id);
    btn.textContent = '♡ Favorit';
    toast('Dihapus dari favorit');
  }else{
    wishlist.push(id);
    btn.textContent = '♥ Favorit';
    toast('Ditambahkan ke favorit');
  }
  localStorage.setItem('aurora_wishlist', JSON.stringify(wishlist));
}

// Cart
function addToCart(p, size){
  const sizeSel = size || p.sizes[0];
  const existing = cart.find(i=>i.id===p.id && i.size===sizeSel);
  if(existing){ existing.qty += 1; }
  else{ cart.push({id:p.id, name:p.name, price:p.price, img:p.img, size:sizeSel, qty:1}); }
  persistCart();
  renderCart();
  updateCartCount();
  toast('Ditambahkan ke keranjang 🧺');
}
function removeFromCart(idx){
  cart.splice(idx,1); persistCart(); renderCart(); updateCartCount();
}
function changeQty(idx, delta){
  cart[idx].qty = Math.max(1, cart[idx].qty+delta);
  persistCart(); renderCart(); updateCartCount();
}
function persistCart(){ localStorage.setItem('aurora_cart', JSON.stringify(cart)); }
function updateCartCount(){
  const count = cart.reduce((a,b)=>a+b.qty,0);
  $('#cartCount').textContent = count;
}
function renderCart(){
  const c = $('#cartItems');
  c.innerHTML = '';
  let subtotal = 0;
  cart.forEach((item, idx)=>{
    subtotal += item.price * item.qty;
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.innerHTML = \`
      <img src="\${item.img}" alt="">
      <div class="meta">
        <div><strong>\${item.name}</strong></div>
        <div class="muted tiny">Ukuran: \${item.size}</div>
        <div class="qty">
          <button class="icon-btn" aria-label="Kurangi">-</button>
          <span>\${item.qty}</span>
          <button class="icon-btn" aria-label="Tambah">+</button>
          <button class="icon-btn" aria-label="Hapus">✕</button>
        </div>
      </div>
      <div><strong>\${fmtIDR(item.price*item.qty)}</strong></div>
    \`;
    const [minus, plus, del] = $$('.qty .icon-btn', el);
    minus.addEventListener('click', ()=>changeQty(idx,-1));
    plus.addEventListener('click', ()=>changeQty(idx,+1));
    del.addEventListener('click', ()=>removeFromCart(idx));
    c.appendChild(el);
  });
  $('#cartSubtotal').textContent = fmtIDR(subtotal);
}
function toggleCart(){
  const dr = $('#cartDrawer');
  if(!dr.classList.contains('open')) renderCart();
  dr.classList.toggle('open');
  dr.setAttribute('aria-hidden', String(!dr.classList.contains('open')));
}
function openCheckout(){
  $('#checkoutModal').classList.add('show');
  $('#checkoutModal').setAttribute('aria-hidden','false');
}
$$('.modal-close').forEach(b=>b.addEventListener('click', (e)=>{
  const id = e.currentTarget.dataset.close;
  document.getElementById(id).classList.remove('show');
  document.getElementById(id).setAttribute('aria-hidden','true');
}));

// Quick view
function openQuickView(p){
  $('#qvImg').src = p.img;
  $('#qvTitle').textContent = p.name;
  $('#qvPrice').textContent = fmtIDR(p.price);
  $('#qvDesc').textContent = p.desc;
  const sizes = $('#qvSizes');
  sizes.innerHTML = p.sizes.map(s=>`<button class="size-pill" data-size="${s}">${s}</button>`).join('');
  let sel = p.sizes[0];
  $$('.size-pill', sizes).forEach(b=>b.addEventListener('click', (e)=>{
    $$('.size-pill', sizes).forEach(x=>x.classList.remove('active'));
    e.currentTarget.classList.add('active'); sel = e.currentTarget.dataset.size;
  }));
  $('#qvAdd').onclick = ()=>addToCart(p, sel);
  $('#qvFav').onclick = (e)=>toggleFav(p.id, e.currentTarget);
  $('#quickViewModal').classList.add('show');
  $('#quickViewModal').setAttribute('aria-hidden','false');
}

// Checkout
function handleCheckout(e){
  e.preventDefault();
  if(cart.length===0){ return toast('Keranjang masih kosong'); }
  // fake validation
  const form = e.target;
  const required = $$('input[required]', form);
  for(const inp of required){ if(!inp.value.trim()) return toast('Mohon lengkapi semua data'); }
  // success
  const orderId = 'AUR' + Math.floor(Math.random()*1e6).toString().padStart(6,'0');
  confetti();
  toast('Pembayaran sukses ✨ Order #' + orderId);
  cart = []; persistCart(); renderCart(); updateCartCount();
  $('#checkoutModal').classList.remove('show');
  $('#checkoutModal').setAttribute('aria-hidden','true');
}

// Toast
let toastTimer;
function toast(msg){
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(()=>t.classList.remove('show'), 2600);
}

// Reveal animation
function setupReveal(){
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ e.target.classList.add('show'); io.unobserve(e.target); }
    })
  }, {threshold: .12});
  $$('.reveal-parent .card, .reveal').forEach(el=>io.observe(el));
}

// Parallax media
function setupParallax(){
  const el = $('.parallax');
  if(!el) return;
  window.addEventListener('scroll', ()=>{
    const y = window.scrollY;
    el.style.transform = `translateY(${y*.05}px)`;
  }, {passive:true});
}

// Confetti minimal
function confetti(){
  const canvas = $('#fx'), ctx = canvas.getContext('2d');
  const dpr = Math.max(1, window.devicePixelRatio||1);
  const w = canvas.width = innerWidth*dpr;
  const h = canvas.height = innerHeight*dpr;
  canvas.style.width = innerWidth+'px'; canvas.style.height = innerHeight+'px';
  let parts = Array.from({length: 120}, ()=>({
    x: Math.random()*w, y: -Math.random()*h/2, r: 6+Math.random()*10, vy: 2+Math.random()*3, vx: -2+Math.random()*4, rot: Math.random()*360
  }));
  const colors = ['#F7C6D9','#E99BB6','#FFF6EC','#FADDE1','#F4A7BB'];
  let alive = true, ticks = 0;
  (function loop(){
    if(!alive) return;
    ctx.clearRect(0,0,w,h);
    parts.forEach(p=>{
      p.x += p.vx; p.y += p.vy; p.rot += p.vx*2;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot*Math.PI/180);
      ctx.fillStyle = colors[Math.floor(Math.random()*colors.length)];
      ctx.fillRect(-p.r/2, -p.r/2, p.r, p.r);
      ctx.restore();
    });
    ticks++;
    if(ticks<180) requestAnimationFrame(loop); else { ctx.clearRect(0,0,w,h); alive=false; }
  })();
}

// Keyboard shortcuts
document.addEventListener('keydown', e=>{
  if(e.key==='Escape'){
    $('#cartDrawer').classList.remove('open');
    $$('.modal').forEach(m=>m.classList.remove('show'));
  }
});
