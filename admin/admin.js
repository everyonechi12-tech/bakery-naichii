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

  window.addAdminProduct = function(prod){
    const list = getProducts();
    prod.id = Date.now();
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
      const el = document.createElement('div');
      el.className = 'product-row';
      el.innerHTML = `
        <div class="prod-left">
          <img src="${escapeHtml(p.image||'https://via.placeholder.com/120') }" alt="">
        </div>
        <div class="prod-mid">
          <strong>${escapeHtml(p.name)}</strong>
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
