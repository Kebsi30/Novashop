
(async function(){
  // load products
  const resp = await fetch('products.json');
  const products = await resp.json();

  // Utility: get query param
  function q(name){ const u = new URL(location.href); return u.searchParams.get(name); }

  // render product grid if present
  const grid = document.getElementById('products-grid');
  if(grid){
    const cat = q('cat');
    const filtered = cat ? products.filter(p=>p.category===cat) : products;
    filtered.forEach(p=>{
      const el = document.createElement('div');
      el.className = 'product-card';
      el.innerHTML = `
        <img src="assets/${p.img}" alt="">
        <h3 class="p-title" data-name-ar="${p.name_ar}" data-name-en="${p.name_en}">${p.name_ar}</h3>
        <div class="price">${p.price} دج</div>
        <div style="display:flex;gap:8px;margin-top:8px">
          <button class="btn add" data-id="${p.id}">أضف إلى السلة</button>
        </div>
      `;
      grid.appendChild(el);
    });
  }

  // language translations (simple)
  const translations = {
    en:{
      home:'Home', products:'Products', about:'About', contact:'Contact', cart:'Cart',
      hero_title:'Welcome to Novashop', hero_sub:'Modern design and easy shopping experience in Arabic & English.',
      shop_now:'Shop now', categories:'Categories', about_preview:'About us', about_text:'Novashop is a modern e-shop offering high quality products with elegant presentation.'
    },
    ar:{
      home:'الرئيسية', products:'المنتجات', about:'من نحن', contact:'اتصل بنا', cart:'السلة',
      hero_title:'مرحبًا بك في Novashop', hero_sub:'تصميم أنيق وتجربة تسوق سهلة باللغة العربية والإنجليزية.',
      shop_now:'تسوق الآن', categories:'التصنيفات', about_preview:'لمحة عنا', about_text:'Novashop متجر إلكتروني عصري يقدّم منتجات عالية الجودة بأسلوب عرض راقٍ.'
    }
  };

  // Language switcher
  const langBtnList = document.querySelectorAll('#lang-switch');
  const setLang = (lang)=>{
    document.documentElement.lang = (lang==='en'?'en':'ar');
    document.body.setAttribute('data-lang', lang==='en'?'en':'ar');
    document.documentElement.dir = (lang==='en'?'ltr':'rtl');
    // translate elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el=>{
      const key = el.getAttribute('data-i18n');
      if(translations[lang] && translations[lang][key]) el.textContent = translations[lang][key];
    });
    // translate product names if present
    document.querySelectorAll('.p-title').forEach(t=>{
      t.textContent = (lang==='en'? t.dataset.nameEn || t.dataset.name_en || t.dataset.nameEn : t.dataset.nameAr || t.dataset.name_ar || t.dataset.nameAr);
      // fallback
      if(!t.textContent) t.textContent = (lang==='en'? t.dataset.name_en || t.dataset.name_en : t.dataset.name_ar);
    });
    // update language button label
    langBtnList.forEach(b=> b.textContent = lang==='en'?'AR':'EN');
  };

  // initialize language from localStorage or default 'ar'
  let lang = localStorage.getItem('novashop_lang') || 'ar';
  setLang(lang);
  document.addEventListener('click', function(e){
    if(e.target && e.target.id==='lang-switch'){
      lang = (document.body.getAttribute('data-lang')==='ar'?'en':'ar');
      localStorage.setItem('novashop_lang', lang);
      setLang(lang);
    }
    if(e.target && e.target.classList.contains('add')){
      const id = e.target.dataset.id;
      addToCart(parseInt(id,10));
    }
    if(e.target && e.target.classList.contains('remove-item')){
      const id = parseInt(e.target.dataset.id,10);
      removeFromCart(id);
      renderCart();
    }
  });

  // Cart handling using localStorage
  function getCart(){ return JSON.parse(localStorage.getItem('novashop_cart')||'[]'); }
  function saveCart(c){ localStorage.setItem('novashop_cart', JSON.stringify(c)); updateCartCount(); }
  function addToCart(id){
    const cart = getCart();
    const found = cart.find(i=>i.id===id);
    if(found) found.qty++;
    else cart.push({id:id, qty:1});
    saveCart(cart);
    alert('تمت الإضافة إلى السلة');
  }
  function removeFromCart(id){
    let cart = getCart();
    cart = cart.filter(i=>i.id!==id);
    saveCart(cart);
  }
  function updateCartCount(){
    const count = getCart().reduce((s,i)=>s+i.qty,0);
    document.querySelectorAll('#cart-count').forEach(el=>el.textContent = count);
  }
  updateCartCount();

  // Render cart items on cart page
  function renderCart(){
    const container = document.getElementById('cart-items');
    if(!container) return;
    container.innerHTML = '';
    const cart = getCart();
    if(cart.length===0){ container.innerHTML = '<p>السلة فارغة</p>'; return; }
    cart.forEach(ci=>{
      const p = products.find(px=>px.id===ci.id);
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        <img src="assets/${p.img}" alt="">
        <div style="flex:1">
          <h4>${p.name_ar}</h4>
          <div>السعر: <strong>${p.price} دج</strong></div>
          <div>الكمية: ${ci.qty}</div>
          <div style="margin-top:8px"><button class="btn remove-item" data-id="${p.id}">إزالة</button></div>
        </div>
      `;
      container.appendChild(div);
    });
  }
  renderCart();

  // populate wilayas in contact and order forms
  const wilayas = ["الجزائر","وهران","قسنطينة","عنابة","سطيف","باتنة","جيجل","بجاية","تيبازة","تيارت","بشار","تلمسان","مسيلة","سوق أهراس","خنشلة","الجلفة","تبسة","سعيدة","وادي سوف","البليدة","الطارف","المدية","بومرداس","تيزي وزو","الطارف","معسكر","سكيكدة","أدرار","غرداية","أم البواقي","البويرة","الشلف","النعامة","غليزان","سيدي بلعباس","مستغانم","تيمنراست","وهران2","بسكرة","ورقلة","تندوف"];
  document.querySelectorAll('#wilaya-select, #order-wilaya').forEach(sel=>{
    if(!sel) return;
    sel.innerHTML = '<option value="">اختر الولاية</option>';
    wilayas.forEach(w=>{ const o=document.createElement('option'); o.value=w; o.textContent=w; sel.appendChild(o); });
  });

  // Handle contact form submit (demo: open whatsapp prefilled)
  const contactForm = document.getElementById('contact-form');
  if(contactForm){
    contactForm.addEventListener('submit', function(e){
      e.preventDefault();
      const data = new FormData(contactForm);
      const text = `رسالة من ${data.get('name')}\nالهاتف: ${data.get('phone')}\nالولاية: ${data.get('wilaya')}\nالبلدية: ${data.get('commune')}\nالرسالة: ${data.get('message')}`;
      const url = 'https://wa.me/213000000000?text=' + encodeURIComponent(text);
      document.getElementById('whatsapp-link').href = url;
      window.open(url,'_blank');
    });
  }

  // Handle order form submit
  const orderForm = document.getElementById('order-form');
  if(orderForm){
    orderForm.addEventListener('submit', function(e){
      e.preventDefault();
      const data = new FormData(orderForm);
      const cart = getCart();
      if(cart.length===0){ alert('السلة فارغة'); return; }
      const summary = cart.map(ci=>{
        const p = products.find(px=>px.id===ci.id);
        return `${p.name_ar} x${ci.qty} - ${p.price*ci.qty} دج`;
      }).join('\n');
      const text = `طلب جديد\nاسم: ${data.get('name')}\nهاتف: ${data.get('phone')}\nالولاية: ${data.get('wilaya')}\nالبلدية: ${data.get('commune')}\n\nالمنتجات:\n${summary}`;
      // open whatsapp (simulate sending)
      const url = 'https://wa.me/213000000000?text=' + encodeURIComponent(text);
      window.open(url,'_blank');
      // clear cart
      localStorage.removeItem('novashop_cart');
      updateCartCount();
      renderCart();
      alert('تم إرسال الطلب (فتح واتساب).');
    });
  }

})();
