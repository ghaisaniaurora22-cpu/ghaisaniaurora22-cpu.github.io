
/* Aurora Shop — Interaksi, Slider, Keranjang, Checkout (LS) */
const state = {
  products: [
    {id:1, name:'Gaun Aurora', price: 489000, image:'assets/product1.svg'},
    {id:2, name:'Blazer Velvet', price: 559000, image:'assets/product2.svg'},
    {id:3, name:'Kemeja Satin', price: 299000, image:'assets/product3.svg'},
    {id:4, name:'Rok Plissé', price: 279000, image:'assets/product4.svg'},
    {id:5, name:'Cardigan Pastel', price: 319000, image:'assets/product5.svg'},
    {id:6, name:'Dress Minimal', price: 449000, image:'assets/product6.svg'},
    {id:7, name:'Atasan Renda', price: 259000, image:'assets/product7.svg'},
    {id:8, name:'Celana Palazzo', price: 339000, image:'assets/product8.svg'},
  ],
  cart: [],
  sliderIndex: 0,
};

// Utils
const fmt = n => 'Rp' + n.toLocaleString('id-ID');
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const saveCart = () => localStorage.setItem('aurora_cart', JSON.stringify(state.cart));
const loadCart = () => { try{ state.cart = JSON.parse(localStorage.getItem('aurora_cart')) || [] }catch{ state.cart=[] } };

// Year
(function(){ const y = new Date().getFullYear(); $$('#year').forEach ? $$('#year').forEach(el=>el.textContent=y): ($('#year')||{}).textContent=y })();

// Build Products
function renderProducts(filter=''){
  const grid = $('#productGrid'); if(!grid) return;
  let items = state.products.slice();
  const sort = $('#sortSelect')?.value || 'pop';
  if(filter){
    items = items.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()))
  }
  if(sort==='price-asc') items.sort((a,b)=>a.price-b.price);
  if(sort==='price-desc') items.sort((a,b)=>b.price-a.price);
  if(sort==='name-asc') items.sort((a,b)=>a.name.localeCompare(b.name,'id'));

  grid.innerHTML = items.map(p => `
    <article class="product-card card" data-id="${p.id}">
      <img src="${p.image}" alt="${p.name}" loading="lazy"/>
      <div class="row" style="justify-content:space-between">
        <div>
          <h4 style="margin:0">${p.name}</h4>
          <div class="price">${fmt(p.price)}</div>
        </div>
        <button class="btn-primary add-to-cart">Tambah</button>
      </div>
    </article>
  `).join('');
}

// Slider
function initSlider(){
  const slider = $('#heroSlider'); if(!slider) return;
  const slides = slider.querySelector('.slides');
  const dots = $('#sliderDots');
  const total = slides.children.length;

  function go(i){
    state.sliderIndex = (i+total)%total;
    slides.style.transform = `translateX(-${state.sliderIndex*100}%)`;
    Array.from(dots.children).forEach((d, idx)=>{
      d.classList.toggle('active', idx===state.sliderIndex);
    });
  }

  // dots
  dots.innerHTML = Array.from({length: total}).map((_,i)=>`<button data-i="${i}" aria-label="Slide ${i+1}"></button>`).join('');
  dots.addEventListener('click', e=>{
    if(e.target.matches('button')) go(parseInt(e.target.dataset.i,10));
  });

  $('#prevSlide').addEventListener('click', ()=>go(state.sliderIndex-1));
  $('#nextSlide').addEventListener('click', ()=>go(state.sliderIndex+1));

  // auto
  let timer = setInterval(()=>go(state.sliderIndex+1), 5000);
  slider.addEventListener('mouseenter', ()=>clearInterval(timer));
  slider.addEventListener('mouseleave', ()=>timer = setInterval(()=>go(state.sliderIndex+1), 5000));

  // swipe
  let startX=0;
  slides.addEventListener('touchstart', e=>startX = e.touches[0].clientX, {passive:true});
  slides.addEventListener('touchend', e=>{
    const dx = e.changedTouches[0].clientX - startX;
    if(Math.abs(dx) > 40) go(state.sliderIndex + (dx<0?1:-1));
  });
  go(0);
}

// Cart
function refreshCartUI(){
  const list = $('#cartItems'); if(!list) return;
  const count = state.cart.reduce((a,c)=>a+c.qty,0);
  const total = state.cart.reduce((a,c)=>a+c.qty*c.price,0);
  $('#cartCount').textContent = count;
  $('#cartTotal').textContent = fmt(total);
  list.innerHTML = state.cart.map(item=>`
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}" width="64" height="64"/>
      <div>
        <div style="font-weight:600">${item.name}</div>
        <div class="price">${fmt(item.price)}</div>
      </div>
      <div class="qty">
        <button class="dec" data-id="${item.id}">−</button>
        <span>${item.qty}</span>
        <button class="inc" data-id="${item.id}">+</button>
        <button class="remove" data-id="${item.id}" title="Hapus" style="margin-left:6px">✕</button>
      </div>
    </div>
  `).join('') || '<p>Keranjangmu kosong.</p>';
}

function addToCart(id){
  const p = state.products.find(x=>x.id===id);
  if(!p) return;
  const item = state.cart.find(x=>x.id===id);
  if(item) item.qty++; else state.cart.push({...p, qty:1});
  saveCart(); refreshCartUI();
  openCart();
}

function modifyQty(id, delta){
  const i = state.cart.findIndex(x=>x.id===id); if(i<0) return;
  state.cart[i].qty += delta;
  if(state.cart[i].qty<=0) state.cart.splice(i,1);
  saveCart(); refreshCartUI();
}

function removeItem(id){
  state.cart = state.cart.filter(x=>x.id!==id);
  saveCart(); refreshCartUI();
}

function bindCartEvents(){
  $('#openCartBtn')?.addEventListener('click', openCart);
  $('#closeCartBtn')?.addEventListener('click', closeCart);
  $('#overlay')?.addEventListener('click', closeCart);
  $('#cartItems')?.addEventListener('click', e=>{
    const id = parseInt(e.target.dataset.id,10);
    if(e.target.classList.contains('inc')) modifyQty(id, +1);
    if(e.target.classList.contains('dec')) modifyQty(id, -1);
    if(e.target.classList.contains('remove')) removeItem(id);
  });
}

function openCart(){
  $('#cartDrawer')?.classList.add('open');
  $('#overlay')?.classList.add('show');
}
function closeCart(){
  $('#cartDrawer')?.classList.remove('open');
  $('#overlay')?.classList.remove('show');
}

// Search/sort
$('#searchInput')?.addEventListener('input', e=>renderProducts(e.target.value));
$('#sortSelect')?.addEventListener('change', ()=>renderProducts($('#searchInput')?.value||''));

// Product grid click
document.addEventListener('click', e=>{
  if(e.target.classList?.contains('add-to-cart')){
    const card = e.target.closest('.product-card');
    addToCart(parseInt(card.dataset.id,10));
  }
});

// Checkout page logic (summary + submit)
function renderSummary(){
  const container = $('#summaryItems'); if(!container) return;
  if(state.cart.length===0){
    container.innerHTML = '<p>Keranjang kosong.</p>';
    $('#summaryTotal').textContent = fmt(0);
    return;
  }
  container.innerHTML = state.cart.map(i=>`
    <div class="row" style="justify-content:space-between;margin-bottom:8px">
      <span>${i.name} × ${i.qty}</span>
      <strong>${fmt(i.qty*i.price)}</strong>
    </div>
  `).join('');
  const total = state.cart.reduce((a,c)=>a+c.qty*c.price,0);
  $('#summaryTotal').textContent = fmt(total);
}

// Submit checkout (simulate)
$('#checkoutForm')?.addEventListener('submit', e=>{
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  const total = state.cart.reduce((a,c)=>a+c.qty*c.price,0);
  const text = `Halo ${data.name}, pesananmu sebesar ${fmt(total)} dengan metode ${data.payment} akan segera diproses. Detail dikirim ke ${data.email}.`;
  $('#orderText').textContent = text;
  $('#orderModal')?.classList.add('show');
  $('#overlay')?.classList.add('show');
});
$('#clearCart')?.addEventListener('click', ()=>{
  state.cart = []; saveCart(); renderSummary(); refreshCartUI();
  $('#orderModal')?.classList.remove('show');
  $('#overlay')?.classList.remove('show');
});

// Init
function init(){
  loadCart();
  renderProducts();
  initSlider();
  refreshCartUI();
  bindCartEvents();
  renderSummary();

  // Reveal on scroll animation
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting) e.target.classList.add('revealed');
    });
  }, {threshold:.1});
  $$('.product-card, .about-card').forEach(el=>{
    el.classList.add('fade-in-up'); io.observe(el);
  });
}
document.addEventListener('DOMContentLoaded', init);
