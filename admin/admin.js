// Simple admin auth + product management (localStorage)
(function(){
  const ADMIN_USER = 'admin';
  const ADMIN_PASS = 'password123';

  function isAuth(){ return localStorage.getItem('naichiiAdminAuth') === 'true'; }
  function setAuth(val){ if(val) localStorage.setItem('naichiiAdminAuth','true'); else localStorage.removeItem('naichiiAdminAuth'); }

  window.adminAuthLogin = function(username, password){
    if (username === ADMIN_USER && password === ADMIN_PASS){
      setAuth(true);
      window.location = 'dashboard.html';
    } else {
      alert('Username atau password salah');
    }
  };

  window.requireAdminAuth = function(){ if(!isAuth()) window.location = 'login.html'; };
  window.adminLogout = function(){ setAuth(false); window.location = 'login.html'; };

  function getProducts(){ try{ return JSON.parse(localStorage.getItem('naichiiProducts')||'[]'); }catch(e){ return []; } }
  function saveProducts(arr){ localStorage.setItem('naichiiProducts', JSON.stringify(arr)); }

  function getDefaultImage(name){
    const key = (name||'').toLowerCase();
    if (key.includes('croissant')) return 'https://images.unsplash.com/photo-1511381939415-67373f4faa98?w=400';
    if (key.includes('chocolate') || key.includes('cake')) return 'https://images.unsplash.com/photo-1542831371-d531d36971e6?w=400';
    if (key.includes('strawberry')) return 'https://images.unsplash.com/photo-1505250469679-203ad9ced0cb?w=400';
    if (key.includes('matcha') || key.includes('latte')) return 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=400';
    if (key.includes('red velvet')) return 'https://images.unsplash.com/photo-1517685352821-92cf88aee5a5?w=400';
    if (key.includes('pain au chocolat') || (key.includes('chocolat') && key.includes('pain'))) return 'https://images.unsplash.com/photo-1517686469429-b73d1d9f7d2d?w=400';
    if (key.includes('caramel')) return 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400';
    if (key.includes('tart') || key.includes('fruit')) return 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400';
    if (key.includes('roti') || key.includes('bread')) return 'https://images.unsplash.com/photo-1508182310851-20e9c2f7c4d1?w=400';
    if (key.includes('mille')) return 'https://images.unsplash.com/photo-1535914254981-b5012e21c2f7?w=400';
    if (key.includes('almond')) return 'https://images.unsplash.com/photo-1498817696200-8c78eaa5f0d5?w=400';
    if (key.includes('blueberry') || key.includes('cheesecake')) return 'https://images.unsplash.com/photo-1559628234-ba67689d49bb?w=400';
    return 'https://via.placeholder.com/120?text=' + encodeURIComponent(name || 'Produk');
  }

  window.addAdminProduct = function(prod){
    const list = getProducts();
    prod.id = Date.now();
    prod.image = prod.image || getDefaultImage(prod.name);
    list.unshift(prod);
    saveProducts(list);
    if (window.renderProducts) window.renderProducts();
    alert('Produk ditambahkan');
  };

  window.renderProducts = function(){
    const container = document.getElementById('product-list');
    if (!container) return;
    const list = getProducts();
    if (list.length === 0){ container.innerHTML = '<p>Belum ada produk</p>'; return; }
    container.innerHTML = '';
    list.forEach((p, idx) => {
      const name = p.name || 'Produk Baru';
      const el = document.createElement('div');
      el.className = 'product-row';
      el.innerHTML = `
        <div class="prod-left">
          <img src="${escapeHtml(p.image||getDefaultImage(name)) }" alt="${escapeHtml(name)}">
        </div>
        <div class="prod-mid">
          <strong>${escapeHtml(name)}</strong>
          <div class="muted">Rp ${Number(p.price).toLocaleString()}</div>
          <div>${escapeHtml(p.description||'')}</div>
        </div>
        <div class="prod-actions">
          <button onclick="deleteAdminProduct(${p.id})" class="btn outline danger">Hapus</button>
        </div>
      `;
      container.appendChild(el);
    });
  };

  window.deleteAdminProduct = function(id){
    if(!confirm('Hapus produk ini?')) return;
    const list = getProducts().filter(p=>p.id !== id);
    saveProducts(list);
    if (window.renderProducts) window.renderProducts();
  };

  function escapeHtml(s){ if(!s) return ''; return String(s).replace(/[&"'<>]/g, function(c){ return {'&':'&amp;','"':'&quot;','\'':'&#39;','<':'&lt;','>':'&gt;'}[c]; }); }

})();
