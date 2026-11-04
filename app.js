(async () => {
  'use strict';
  const {categories,products,icons,frameCount,brands,galleries,archive}=window.EE_DATA;
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon=n=>icons[n]||icons.ArrowRight;
  const money=n=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n);
  const categoryUrl=id=>`products.html?category=${encodeURIComponent(id)}`;
  // Catalogue products have pre-rendered pages; display/reference items use the dynamic page.
  const productUrl=id=>/^\d+$/.test(String(id))?`products/${id}.html`:`product-detail.html?id=${encodeURIComponent(id)}`;
  const setMeta=(selector,attr,value)=>{const n=$(selector);if(n)n.setAttribute(attr,value);};
  const wa=text=>`https://wa.me/919425831035?text=${encodeURIComponent(text)}`;
  const enquiry=p=>wa(`Hello Electric Emporium, I am interested in ${p.brand} ${p.name}. Please share the current price and availability.`);
  const page=document.body.dataset.page;
  function decorate(root=document){
    $$('[data-icon]',root).forEach(n=>n.innerHTML=icon(n.dataset.icon));
    $$('[data-whatsapp]',root).forEach(a=>{a.href=wa(a.dataset.whatsapp);a.target='_blank';a.rel='noopener';});
  }
  const nav=[['index.html#showroom','Showroom','home'],['products.html','Products','catalogue'],['about.html','Our story','about'],['index.html#visit','Visit us','visit']];
  $('#header').innerHTML=`<div class="header-inner"><a class="wordmark" href="index.html" aria-label="Electric Emporium home"><img class="brand-mark" src="media/logo.webp" alt=""><span class="brand-name">Electric Emporium<small>BALAGHAT &nbsp; / &nbsp; SINCE 1989</small></span></a><nav class="desktop-nav" aria-label="Main navigation">${nav.map(([url,label,key])=>`<a href="${url}" ${page===key?'aria-current="page"':''}>${label}</a>`).join('')}</nav><div class="header-actions"><button class="icon-button" id="open-search" title="Search products" aria-label="Search products">${icon('Search')}</button><a class="header-contact" href="${wa('Hello Electric Emporium, I would like some help choosing a product.')}" target="_blank" rel="noopener">${icon('MessageCircle')} Let's talk</a><button class="icon-button mobile-menu-button" id="menu-toggle" aria-expanded="false" aria-controls="mobile-nav" aria-label="Open menu">${icon('Menu')}</button></div></div><nav class="mobile-nav" id="mobile-nav" aria-label="Mobile navigation" hidden>${nav.map(([url,label])=>`<a href="${url}">${label}</a>`).join('')}<a href="tel:+919425831035">+91 94258 31035</a></nav>`;
  $('.brand-mark').src='media/logo-mark.webp';
  $('#footer').innerHTML=`<div class="footer-inner"><div class="footer-top"><div><a href="index.html" class="footer-brand">Electric Emporium<span>.</span></a><p>Lighting, cooling and electrical essentials. A family store in Balaghat, since 1989.</p></div><div class="footer-links"><h3>EXPLORE</h3><a href="index.html#explore">The showroom</a><a href="products.html">All products</a><a href="about.html">Our story</a></div><div class="footer-links"><h3>COME BY. GET IN TOUCH.</h3><a href="index.html#visit">Gujri Chowk, Balaghat</a><a href="tel:+919425831035">+91 94258 31035</a><a href="https://instagram.com/electricemporiumbgt" target="_blank" rel="noopener">Instagram ${icon('ArrowUpRight')}</a></div></div><div class="footer-bottom"><span>&copy; ${new Date().getFullYear()} Electric Emporium. All rights reserved.</span><span>Genuine products. Personal guidance. &nbsp; <a href="${wa('Hello Electric Emporium, I have a product enquiry.')}" target="_blank" rel="noopener">Enquire on WhatsApp</a></span></div></div>`;
  $('#menu-toggle').addEventListener('click',()=>{const n=$('#mobile-nav'),open=n.hidden;n.hidden=!open;$('#menu-toggle').setAttribute('aria-expanded',String(open));$('#menu-toggle').setAttribute('aria-label',open?'Close menu':'Open menu');$('#menu-toggle').innerHTML=icon(open?'X':'Menu');});
  $$('#mobile-nav a').forEach(a=>a.addEventListener('click',()=>{ $('#mobile-nav').hidden=true;$('#menu-toggle').setAttribute('aria-expanded','false');$('#menu-toggle').innerHTML=icon('Menu'); }));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#mobile-nav').hidden)$('#menu-toggle').click();});
  function card(p){return `<article class="product-card"><a class="product-image-link" href="${productUrl(p.id)}" tabindex="-1" aria-hidden="true">${p.outOfStock?'<span class="product-badge">Out of stock</span>':p.origin==='display'?'<span class="product-badge">Display reference</span>':''}${p.image?`<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy" decoding="async">`:'<span class="missing-image">Image coming soon</span>'}</a><p class="product-brand">${esc(p.brand)}</p><h3><a href="${productUrl(p.id)}">${esc(p.name)}</a></h3><div class="product-bottom"><span class="product-price ${p.price==null?'enquiry':''}">${p.price==null?'Price on enquiry':money(p.price)}</span><a class="icon-button" href="${enquiry(p)}" target="_blank" rel="noopener" title="Enquire on WhatsApp" aria-label="Enquire on WhatsApp about ${esc(p.name)}">${icon('MessageCircle')}</a></div></article>`;}
  function display(c){const d=$('#display-dialog');d.innerHTML=`<div class="dialog-header"><h2>${esc(c.name)}</h2><button class="icon-button close-dialog" aria-label="Close display">${icon('X')}</button></div><img src="${c.photo}" alt="${esc(c.name)} showroom display"><p>Showroom visualisation. Confirm specific models and finishes with our team.</p>`;d.showModal();$('.close-dialog',d).onclick=()=>d.close();}
  $$('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
  const searchDialog=$('#search-dialog');
  searchDialog.innerHTML=`<div class="dialog-header">${icon('Search')}<input id="global-search" type="search" aria-label="Search all products" placeholder="What are you looking for?"><button class="icon-button" id="close-search" aria-label="Close search">${icon('X')}</button></div><div class="search-results" id="search-results" aria-live="polite"><p class="search-hint">Search by product, category or brand.</p></div>`;
  // The full list is only fetched once someone opens search.
  const loadAll=()=>window.EE_DATA.allLoaded||!window.EE_LOAD_ALL?Promise.resolve():window.EE_LOAD_ALL();
  $('#open-search').onclick=()=>{searchDialog.showModal();$('#global-search').focus();loadAll().then(runSearch,()=>{});};
  $('#close-search').onclick=()=>searchDialog.close();
  function runSearch(){const q=$('#global-search').value.trim().toLowerCase();if(q&&!window.EE_DATA.allLoaded){$('#search-results').innerHTML='<p class="search-hint">Searching the catalogue…</p>';loadAll().then(runSearch,()=>{$('#search-results').innerHTML=`<p class="search-hint">Search is unavailable right now. <a href="${wa('Hello Electric Emporium, I am looking for '+q+'.')}" target="_blank" rel="noopener">Ask us on WhatsApp</a>.</p>`;});return;}const found=q?products.filter(p=>`${p.name} ${p.brand} ${categories.find(c=>c.id===p.category)?.name}`.toLowerCase().includes(q)).slice(0,8):[];$('#search-results').innerHTML=!q?'<p class="search-hint">Search by product, category or brand.</p>':found.length?found.map(p=>`<a class="search-item" href="${productUrl(p.id)}">${p.image?`<img src="${esc(p.image)}" alt="">`:''}<div><strong>${esc(p.name)}</strong><p>${esc(p.brand)} &middot; ${p.price==null?'Price on enquiry':money(p.price)}</p></div>${icon('ArrowUpRight')}</a>`).join('')+`<a class="text-link search-hint" href="products.html?q=${encodeURIComponent(q)}">See all results ${icon('ArrowRight')}</a>`:'<p class="search-hint">No matching products. Try a category or brand name.</p>';}
  $('#global-search').addEventListener('input',runSearch);
  if(page==='home'){setupShowroom();setupBrands();}
  if(page==='about')setupStory();
  if(window.EE_CATALOGUE_READY)await window.EE_CATALOGUE_READY;
  if(window.EE_DATA.catalogueState==='unavailable'&&(page==='catalogue'||page==='product')){
    const notice=document.createElement('div');notice.className='catalogue-notice';notice.setAttribute('role','status');notice.innerHTML=`<span>Product availability is temporarily unavailable.</span><button class="text-button">Try again</button><a href="${wa('Hello Electric Emporium, please help me with current product prices and availability.')}" target="_blank" rel="noopener">Enquire on WhatsApp</a>`;$('#main').prepend(notice);$('button',notice).onclick=()=>location.reload();
  }
  if(page==='home'){
    $('#category-grid').innerHTML=categories.map(c=>`<a class="category-card" href="${categoryUrl(c.id)}"><div class="category-image ${c.thumbnail?'complete-display':''}"><img src="${c.thumbnail||c.photo}" alt="${esc(c.name)} display" loading="lazy"></div><div class="category-card-heading"><h3>${esc(c.name)}</h3>${icon('ArrowUpRight')}</div><p>${esc(c.summary)}</p></a>`).join('');
    $('#featured-grid').innerHTML=['4','157','140','crysta'].map(id=>products.find(p=>p.id===id)).filter(Boolean).map(card).join('');
  }
  if(page==='catalogue')setupCatalogue();
  if(page==='product')setupProduct();
  decorate();

  function setupBrands(){
    const band=$('.brands-band');
    band.innerHTML=`<div class="section-inner"><p class="eyebrow" id="brands-title">THE BRANDS YOU KNOW</p><div class="brand-carousel" role="region" aria-roledescription="carousel" aria-labelledby="brands-title"><div class="brand-viewport">${brands.map((b,i)=>`<div class="brand-slide" role="group" aria-roledescription="slide" aria-label="${esc(b.name)}"><div>${b.image?`<img src="${b.image}" alt="${esc(b.name)}" loading="lazy">`:`<span>${esc(b.name)}</span>`}</div></div>`).join('')}</div><div class="brand-controls"><button class="icon-button brand-prev" aria-label="Previous brand" title="Previous brand">${icon('ArrowLeft')}</button><div class="brand-dots">${brands.map((b,i)=>`<button data-brand="${i}" aria-label="Show ${esc(b.name)}" title="${esc(b.name)}"></button>`).join('')}</div><button class="icon-button brand-next" aria-label="Next brand" title="Next brand">${icon('ArrowRight')}</button><button class="icon-button brand-pause" aria-label="Pause brand rotation" title="Pause rotation">${icon('Pause')}</button></div></div></div>`;
    const carousel=$('.brand-carousel'),slides=$$('.brand-slide'),dots=$$('[data-brand]'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
    let index=0,paused=reduced.matches,hover=false,focused=false,visible=false,timer=null,startX=null;
    function render(){slides.forEach((s,i)=>{let offset=(i-index+brands.length)%brands.length;if(offset>brands.length/2)offset-=brands.length;s.style.setProperty('--position',Math.max(-3,Math.min(3,offset)));s.classList.toggle('brand-active',offset===0);s.classList.toggle('brand-adjacent',Math.abs(offset)===1);s.classList.toggle('brand-outer',Math.abs(offset)===2);s.setAttribute('aria-hidden',String(offset!==0));});dots.forEach((d,i)=>d.setAttribute('aria-pressed',String(i===index)));carousel.dataset.active=String(index);$('.brand-pause').innerHTML=icon(paused?'Play':'Pause');$('.brand-pause').setAttribute('aria-label',paused?'Resume brand rotation':'Pause brand rotation');$('.brand-pause').title=paused?'Resume rotation':'Pause rotation';}
    function schedule(){clearTimeout(timer);if(!paused&&!hover&&!focused&&visible&&!document.hidden)timer=setTimeout(()=>{index=(index+1)%brands.length;render();schedule();},3200);}
    function select(i){index=(i+brands.length)%brands.length;render();schedule();}
    $('.brand-prev').onclick=()=>select(index-1);$('.brand-next').onclick=()=>select(index+1);dots.forEach(d=>d.onclick=()=>select(Number(d.dataset.brand)));
    $('.brand-pause').onclick=()=>{paused=!paused;render();schedule();};
    carousel.onpointerenter=e=>{if(e.pointerType==='mouse'){hover=true;schedule();}};carousel.onpointerleave=()=>{hover=false;schedule();};
    carousel.onfocusin=()=>{focused=true;schedule();};carousel.onfocusout=e=>{focused=carousel.contains(e.relatedTarget);schedule();};
    $('.brand-viewport').onpointerdown=e=>startX=e.clientX;$('.brand-viewport').onpointerup=e=>{if(startX!=null&&Math.abs(e.clientX-startX)>40)select(index+(e.clientX<startX?1:-1));startX=null;};$('.brand-viewport').onpointercancel=()=>startX=null;
    new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule();},{threshold:.2}).observe(carousel);
    document.addEventListener('visibilitychange',schedule);reduced.addEventListener('change',()=>{paused=reduced.matches;render();schedule();});render();
  }
  function setupStory(){
    const thumb=src=>src.replace(/^media\//,'media/thumbs/');
    $('#archive-image').src=thumb(archive);
    $('#story-galleries').innerHTML=galleries.map(g=>`<section class="section story-gallery" id="gallery-${g.id}"><div class="section-heading"><div><p class="eyebrow">${esc(g.caption.toUpperCase())}</p><h2>${esc(g.title)}</h2></div><span class="gallery-count">${g.photos.length} photographs</span></div><div class="story-gallery-grid">${g.photos.map((p,i)=>`<button class="gallery-photo" data-gallery="${g.id}" data-photo="${i}" aria-label="Open ${esc(p.alt)}"><img src="${thumb(p.src)}" alt="${esc(p.alt)}" loading="lazy" decoding="async"><span>${icon('ZoomIn')}</span></button>`).join('')}</div></section>`).join('');
    const dialog=$('#display-dialog');let activePhotos=[],activeIndex=0,title='',zoomed=false;
    function render(){const p=activePhotos[activeIndex];dialog.innerHTML=`<div class="dialog-header"><div><h2>${esc(title)}</h2><p class="lightbox-count">${activeIndex+1} / ${activePhotos.length}</p></div><button class="icon-button photo-zoom" aria-label="${zoomed?'Fit image':'Enlarge image'}" title="${zoomed?'Fit image':'Enlarge image'}">${icon(zoomed?'Minus':'ZoomIn')}</button><button class="icon-button close-dialog" aria-label="Close gallery">${icon('X')}</button></div><div class="photo-lightbox ${zoomed?'zoomed':''}"><img src="${p.src}" alt="${esc(p.alt)}"></div>${activePhotos.length>1?`<div class="lightbox-navigation"><button class="icon-button gallery-prev" aria-label="Previous photograph" title="Previous photograph">${icon('ArrowLeft')}</button><span>${esc(p.alt)}</span><button class="icon-button gallery-next" aria-label="Next photograph" title="Next photograph">${icon('ArrowRight')}</button></div>`:''}`;$('.close-dialog',dialog).onclick=()=>dialog.close();$('.photo-zoom',dialog).onclick=()=>{zoomed=!zoomed;render();$('.photo-zoom',dialog).focus();};if(activePhotos.length>1){$('.gallery-prev',dialog).onclick=()=>move(-1);$('.gallery-next',dialog).onclick=()=>move(1);}}
    function move(d){activeIndex=(activeIndex+d+activePhotos.length)%activePhotos.length;zoomed=false;render();$(d<0?'.gallery-prev':'.gallery-next',dialog)?.focus();}
    function open(photos,index,heading){activePhotos=photos;activeIndex=index;title=heading;zoomed=false;render();dialog.classList.add('gallery-dialog');dialog.showModal();}
    $$('[data-gallery]').forEach(b=>b.onclick=()=>{const g=galleries.find(g=>g.id===b.dataset.gallery);open(g.photos,Number(b.dataset.photo),g.title);});
    $('#open-archive').onclick=()=>open([{src:archive,alt:'Electric Emporium newspaper advertisement, 2000'}],0,'From Our Archives, 2000');
    dialog.addEventListener('keydown',e=>{if(activePhotos.length>1&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();move(e.key==='ArrowLeft'?-1:1);}});
  }

  function setupCatalogue(){
    const params=new URLSearchParams(location.search);
    const aliases={'acs':'ac','acs and freezers':'ac','lights':'lighting','lights and leds':'lighting','wires and cables':'wires','water heaters':'geysers'};
    const raw=(params.get('category')||'').toLowerCase().replace(/\+/g,' ');
    const c=categories.find(x=>x.id===(aliases[raw]||raw));
    let categoryProducts=c?products.filter(p=>p.category===c.id):products;
    $('#catalogue-title').textContent=c?.name||'All products';
    $('#catalogue-description').textContent=c?.summary||'Considered choices for every corner of your space.';
    $('#breadcrumb-current').textContent=c?.name||'Products';
    document.title=c?`${c.name} in Balaghat | Electric Emporium`:'Products | Electric Emporium';
    if(c){const url=`https://electricemporium.in/${categoryUrl(c.id)}`,description=`${c.summary}. Browse ${c.name.toLowerCase()} at Electric Emporium, Balaghat, and enquire on WhatsApp.`;setMeta('link[rel=canonical]','href',url);setMeta('meta[property="og:url"]','content',url);setMeta('meta[name=description]','content',description);setMeta('meta[property="og:description"]','content',description);setMeta('meta[property="og:title"]','content',document.title);}
    if(c){$('#view-display').hidden=false;$('#view-display').onclick=()=>display(c);}
    $('#category-tabs').innerHTML=`<a href="products.html" ${!c?'aria-current="page"':''}>All products</a>`+categories.map(x=>`<a href="${categoryUrl(x.id)}" ${x.id===c?.id?'aria-current="page"':''}>${esc(x.name)}</a>`).join('');
    const current=$('[aria-current=page]',$('#category-tabs'));if(current)$('#category-tabs').scrollLeft=Math.max(0,current.offsetLeft-30);
    $('.filters').id='filters-panel';
    const filterToggle=document.createElement('button');filterToggle.className='filter-toggle button secondary';filterToggle.innerHTML=`${icon('SlidersHorizontal')} Search & filters`;filterToggle.setAttribute('aria-controls','filters-panel');filterToggle.setAttribute('aria-expanded','false');$('.catalogue-body').prepend(filterToggle);
    filterToggle.onclick=()=>{const open=document.body.classList.toggle('filters-open');filterToggle.setAttribute('aria-expanded',String(open));};
    $('#brand-filters').innerHTML=[...new Set(categoryProducts.map(p=>p.brand))].sort().map(b=>`<label class="check-row"><input type="checkbox" value="${esc(b)}" ${b.toLowerCase()===(params.get('brand')||'').toLowerCase()?'checked':''}>${esc(b)}</label>`).join('');
    $('#catalogue-search').value=params.get('q')||'';
    function render(){
      const q=$('#catalogue-search').value.trim().toLowerCase(),brands=$$('#brand-filters input:checked').map(e=>e.value);
      let list=categoryProducts.filter(p=>(!q||`${p.name} ${p.brand} ${categories.find(c=>c.id===p.category)?.name}`.toLowerCase().includes(q))&&(!brands.length||brands.includes(p.brand))&&(!$('#available-only').checked||!p.outOfStock)&&(!$('#priced-only').checked||p.price!=null));
      const sort=$('#sort').value;
      if(sort==='name')list.sort((a,b)=>a.name.localeCompare(b.name));
      if(sort.startsWith('price'))list.sort((a,b)=>a.price==null?(b.price==null?0:1):b.price==null?-1:sort==='price-low'?a.price-b.price:b.price-a.price);
      $('#products-grid').innerHTML=list.map(card).join('');
      $('#results-count').textContent=`${list.length} ${list.length===1?'product':'products'}`;
      $('#empty-state').hidden=list.length>0;
    }
    function reset(){$('#catalogue-search').value='';$$('.filters input[type=checkbox]').forEach(n=>n.checked=false);$('#sort').value='featured';render();}
    $$('.filters input').forEach(n=>n.addEventListener('input',render));$('#sort').onchange=render;$('#clear-filters').onclick=reset;$('#empty-reset').onclick=reset;render();
  }
  function setupProduct(){
    const id=window.EE_DATA.productId,p=products.find(p=>p.id===id);
    if(!p&&window.EE_DATA.catalogueState==='unavailable'&&$('#main').dataset.prerendered!=null)return;
    if(!p){$('#main').innerHTML=`<div class="not-found"><p class="eyebrow">ELECTRIC EMPORIUM</p><h1>${window.EE_DATA.catalogueState==='unavailable'?'Product temporarily unavailable.':'Product not found.'}</h1><p>Explore the collection or ask our team for help.</p><a class="button primary" href="products.html">Browse all products</a><a class="button secondary" href="${wa('Hello Electric Emporium, please help me with product '+id)}">Enquire on WhatsApp</a></div>`;return;}
    const c=categories.find(c=>c.id===p.category),prerendered=$('#main').dataset.prerendered!=null;if(!prerendered)document.title=`${p.name} | Electric Emporium`;
    $('#main').innerHTML=`<nav class="breadcrumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span>/</span><a href="products.html">Products</a><span>/</span><a href="${categoryUrl(c.id)}">${esc(c.name)}</a></nav><article class="product-detail"><div class="detail-photo">${p.image?`<img class="display-zoom" src="${p.image}" alt="${esc(p.brand+' '+p.name)}">`:'<span class="missing-image">Product image coming soon</span>'}</div><div class="detail-info"><p class="eyebrow">${esc(p.brand.toUpperCase())}</p><h1>${esc(p.name)}</h1><p class="detail-price">${p.price==null?'Price on enquiry':money(p.price)}</p><p class="availability">${p.outOfStock?'Currently listed out of stock. Ask about the next availability.':p.origin==='catalogue'?'From our published catalogue. Confirm current availability.':'Selected display range. Enquire for availability.'}</p><a class="button primary" href="${enquiry(p)}" target="_blank" rel="noopener">Enquire on WhatsApp ${icon('MessageCircle')}</a><a class="button secondary" href="tel:+919425831035">Call the store ${icon('Phone')}</a><p class="detail-note">${p.note?'':'Speak to our team about the right model, finish and specifications for your space.'} ${p.price!=null?'Please confirm the current price before purchase.':''}</p><div class="detail-facts"><div>${icon('MapPin')}<span>Visit us at Gujri Chowk, Balaghat</span></div><div>${icon('Clock')}<span>Open every day, 10 AM to 9 PM</span></div><div>${icon('MessageCircle')}<span>Personal guidance, from selection to enquiry</span></div></div></div></article><h2 class="related-heading">More in ${esc(c.name.toLowerCase())}</h2><div class="product-grid">${products.filter(x=>x.category===p.category&&x.id!==p.id).slice(0,4).map(card).join('')}</div>`;
    const photo=$('.display-zoom');if(photo){photo.tabIndex=0;photo.setAttribute('role','button');photo.setAttribute('aria-label','Enlarge product image');const open=()=>{const d=$('#display-dialog');d.innerHTML=`<div class="dialog-header"><h2>${esc(p.name)}</h2><button class="icon-button close-dialog" aria-label="Close image">${icon('X')}</button></div><img src="${esc(photo.src)}" alt="${esc(p.name)}">`;d.showModal();$('.close-dialog',d).onclick=()=>d.close();};photo.onclick=open;photo.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}};}
    if(p.origin==='catalogue')$('.availability').textContent=p.outOfStock?'Currently out of stock. Ask about the next availability.':'In stock. Contact us to confirm your preferred model and delivery.';
    const images=[...new Set([p.image,...(p.images||[])].filter(Boolean))];
    if(photo&&images.length>1){
      const gallery=document.createElement('div');gallery.className='detail-gallery';$('.detail-photo').replaceWith(gallery);gallery.append(photo.parentElement);
      const thumbs=document.createElement('div');thumbs.className='product-thumbnails';thumbs.setAttribute('aria-label','Product photographs');
      thumbs.innerHTML=images.map((src,i)=>`<button type="button" aria-label="View product photo ${i+1}" aria-pressed="${i===0}"><img src="${esc(src)}" alt="" loading="lazy"></button>`).join('');gallery.append(thumbs);
      $$('button',thumbs).forEach((b,i)=>b.onclick=()=>{photo.src=images[i];$$('button',thumbs).forEach(t=>t.setAttribute('aria-pressed',String(t===b)));});
    }
    if(p.variants?.length){
      const selections=new Map(),groups=new Map();p.variants.forEach(v=>{const type=v.variant_type||'Option';if(!groups.has(type))groups.set(type,[]);groups.get(type).push(v);});
      const variants=document.createElement('div');variants.className='product-variants';$('.availability').after(variants);
      for(const [type,options] of groups){
        const field=document.createElement('fieldset'),legend=document.createElement('legend');legend.textContent=type;field.append(legend);
        options.forEach(v=>{const b=document.createElement('button');b.type='button';b.className='variant-choice';b.textContent=v.variant_value;b.disabled=v.in_stock!==true;b.setAttribute('aria-pressed',String(String(v.linked_product_id)===p.id));if(b.disabled)b.title='Out of stock';field.append(b);
          b.onclick=()=>{if(v.linked_product_id&&String(v.linked_product_id)!==p.id){location.href=productUrl(v.linked_product_id);return;}
            $$('button',field).forEach(t=>t.setAttribute('aria-pressed',String(t===b)));selections.set(type,v.variant_value);
            const raw=String(v.price??'').replace(/^(?:rs\.?|inr|\u20b9)\s*/i,'').replace(/,/g,'').trim();if(/^\d+(?:\.\d+)?$/.test(raw))$('.detail-price').textContent=money(Number(raw));
            $('.detail-info .primary').href=wa(`Hello Electric Emporium, I am interested in ${p.brand} ${p.name}. Selected: ${[...selections].map(([k,value])=>k+': '+value).join(', ')}. Please share the current price and availability.`);
          };});variants.append(field);
      }
    }
    if(p.note&&window.ProductContent)$('.related-heading').before(ProductContent.render(p.note,document));
    const canonical=$('link[rel=canonical]');if(canonical)canonical.href='https://electricemporium.in/'+productUrl(p.id);
    if(p.origin==='catalogue'){
      const schema=document.createElement('script');schema.type='application/ld+json';schema.textContent=JSON.stringify({'@context':'https://schema.org','@type':'Product',name:p.name,description:p.note||p.name,image:images,brand:{'@type':'Brand',name:p.brand},...(p.price==null?{}:{offers:{'@type':'Offer',priceCurrency:'INR',price:p.price,availability:'https://schema.org/'+(p.outOfStock?'OutOfStock':'InStock'),url:canonical?.href}})});document.head.append(schema);
    }
  }
  function setupShowroom(){
    const journey=$('.journey'),stage=$('.journey-stage'),canvas=$('#flight'),ctx=canvas.getContext('2d',{alpha:false});
    const layer=$('.room-layer'),viewport=$('.room-viewport'),scene=$('.room-scene'),popover=$('#category-popover');
    const reduced=matchMedia('(prefers-reduced-motion: reduce)'),touch=matchMedia('(hover: none), (pointer: coarse)');
    const regions=[['outdoor',0,12,10,37],['fans',0,48,11,43],['fans',29,8,44,17],['lighting',11,55,22,24],['appliances',20,33,14,24],['geysers',34,33,10,32],['fans',44,44,7,20],['ac',54,31,19,29],['switches',77,23,15,36],['protection',66,60,15,23],['wires',82,56,18,37]];
    $('#hotspots').innerHTML=regions.map(([id,x,y,w,h],i)=>{const c=categories.find(c=>c.id===id);return `<a class="hotspot" data-category="${id}" href="${categoryUrl(id)}" aria-label="Explore ${esc(c.name)}" style="left:${x}%;top:${y}%;width:${w}%;height:${h}%"><span class="hotspot-dot">${icon('Plus')}</span></a>`;}).join('');
    $('.room-nav').innerHTML=categories.map(c=>`<a href="${categoryUrl(c.id)}">${esc(c.name)}</a>`).join('');
    const categoryIcons={fans:'Fan',lighting:'LampCeiling',switches:'ToggleLeft',appliances:'CookingPot',ac:'AirVent',geysers:'Heater',outdoor:'Sun',wires:'Cable',protection:'ShieldCheck'};
    const overview=document.createElement('div');overview.className='mobile-overview';
    overview.innerHTML=`<div class="overview-actions"><button class="text-link explore-closer" type="button">${icon('ZoomIn')} Explore closer</button></div><h2>Browse categories</h2><nav class="overview-categories" aria-label="Browse showroom categories">${categories.map(c=>`<a href="${categoryUrl(c.id)}"><i>${icon(categoryIcons[c.id])}</i><span>${esc(c.name)}</span>${icon('ArrowRight')}</a>`).join('')}</nav><a class="overview-enquiry" href="${wa('Hello Electric Emporium, I would like help choosing products for my space.')}" target="_blank" rel="noopener">${icon('MessageCircle')}<span>Enquire on WhatsApp</span>${icon('ArrowUpRight')}</a>`;
    layer.append(overview);
    $('.room-topline>span').textContent='The showroom';
    const closeup=document.createElement('dialog');closeup.id='closeup-dialog';closeup.setAttribute('aria-label','Explore showroom closer');document.body.append(closeup);
    let zoom=1;
    function sizeCloseup(){const v=$('.closeup-viewport',closeup),s=$('.closeup-scene',closeup);if(!v)return;const previousWidth=s.offsetWidth||1,center=(v.scrollLeft+v.clientWidth/2)/previousWidth;const h=v.clientHeight*zoom;s.style.height=h+'px';s.style.width=(h*2)+'px';v.scrollLeft=center*s.offsetWidth-v.clientWidth/2;$('.zoom-out',closeup).disabled=zoom<=1;$('.zoom-in',closeup).disabled=zoom>=2;}
    $('.explore-closer').onclick=()=>{
      closeup.innerHTML=`<div class="dialog-header"><h2>The showroom</h2><button class="icon-button zoom-out" title="Zoom out" aria-label="Zoom out">${icon('Minus')}</button><button class="icon-button zoom-in" title="Zoom in" aria-label="Zoom in">${icon('Plus')}</button><button class="icon-button close-closeup" title="Back to overview" aria-label="Back to overview">${icon('X')}</button></div><div class="closeup-viewport"><div class="closeup-scene"><img src="media/showroom.webp" alt="Electric Emporium showroom"><div class="closeup-hotspots">${$('#hotspots').innerHTML}</div></div></div><div class="closeup-controls"><button class="icon-button" data-closeup-pan="-1" aria-label="Pan left" title="Pan left">${icon('ArrowLeft')}</button><button class="text-link close-overview">Back to overview</button><button class="icon-button" data-closeup-pan="1" aria-label="Pan right" title="Pan right">${icon('ArrowRight')}</button></div>`;
      zoom=1;closeup.showModal();document.body.classList.add('closeup-open');sizeCloseup();const v=$('.closeup-viewport',closeup);v.scrollLeft=(v.scrollWidth-v.clientWidth)/2;
      $$('.close-closeup,.close-overview',closeup).forEach(b=>b.onclick=()=>closeup.close());
      $('.zoom-in',closeup).onclick=()=>{zoom=Math.min(2,zoom+.25);sizeCloseup();};$('.zoom-out',closeup).onclick=()=>{zoom=Math.max(1,zoom-.25);sizeCloseup();};
      $$('[data-closeup-pan]',closeup).forEach(b=>b.onclick=()=>v.scrollBy({left:Number(b.dataset.closeupPan)*v.clientWidth*.7,behavior:reduced.matches?'instant':'smooth'}));
    };
    closeup.addEventListener('close',()=>document.body.classList.remove('closeup-open'));
    addEventListener('resize',()=>{if(closeup.open)sizeCloseup();});
    let hideTimer;
    function hide(){popover.hidden=true;}
    function show(a){if(touch.matches)return;clearTimeout(hideTimer);const c=categories.find(c=>c.id===a.dataset.category);popover.innerHTML=`<p class="eyebrow">EXPLORE THE COLLECTION</p><h3>${esc(c.name)}</h3><p>${esc(c.summary)}</p><a class="text-link" href="${categoryUrl(c.id)}">View ${esc(c.name.toLowerCase())} ${icon('ArrowUpRight')}</a>`;popover.hidden=false;const r=a.getBoundingClientRect(),s=stage.getBoundingClientRect();const right=r.right-s.left+16,left=r.left-s.left-306;const preferred=right+290<s.width-16?right:left>=16?left:r.left-s.left+r.width/2-145;const x=Math.max(16,Math.min(s.width-306,preferred));const y=Math.max(65,Math.min(s.height-popover.offsetHeight-82,r.top-s.top+r.height/2-popover.offsetHeight/2));popover.style.left=x+'px';popover.style.top=y+'px';}
    $$('.hotspot').forEach(a=>{a.onpointerenter=()=>show(a);a.onfocus=()=>show(a);a.onpointerleave=()=>hideTimer=setTimeout(hide,180);a.onblur=()=>hideTimer=setTimeout(()=>{if(!popover.contains(document.activeElement))hide();},180);});
    popover.onpointerenter=()=>clearTimeout(hideTimer);popover.onpointerleave=()=>hideTimer=setTimeout(hide,180);popover.onfocusin=()=>clearTimeout(hideTimer);popover.onfocusout=e=>{if(!popover.contains(e.relatedTarget))hide();};document.addEventListener('keydown',e=>{if(e.key==='Escape')hide();});
    $$('[data-pan]').forEach(b=>b.onclick=()=>viewport.scrollBy({left:Number(b.dataset.pan)*viewport.clientWidth*.75,behavior:reduced.matches?'instant':'smooth'}));
    function updateArrows(){const max=scene.offsetWidth-viewport.clientWidth; $('[data-pan="-1"]').disabled=viewport.scrollLeft<2;$('[data-pan="1"]').disabled=viewport.scrollLeft>max-2;}
    viewport.addEventListener('scroll',updateArrows,{passive:true});
    // ---- Fly-in frames -----------------------------------------------------
    // Scroll position is the only clock. Frames load coarse-to-fine (every 32nd,
    // 16th, ... frame) so every part of the journey gets a nearby frame early.
    // The canvas always shows the nearest loaded frame and eases toward the
    // scroll target, so wheel steps and slow networks never freeze the image.
    // Frames are kept compressed; only a small window around the scroll position
    // is decoded (off the main thread) into ImageBitmaps, so drawing never decodes.
    const frameBase=window.EE_DATA.framePath||'media/flight-v3/';
    const conn=navigator.connection||{},saveData=!!conn.saveData||/(^|-)2g$/.test(conn.effectiveType||'');
    const blobs=new Map(),bitmaps=new Map(),decodingSet=new Set(),loading=new Set(),failed=new Set();
    const KEEP=8; // decoded frames held at once (~3-5 MB each)
    const toBitmap=window.createImageBitmap?blob=>createImageBitmap(blob):blob=>{const img=new Image(),url=URL.createObjectURL(blob);img.src=url;return img.decode().then(()=>{URL.revokeObjectURL(url);return img;});};
    let set=null,order=[],orderAt=0,coarseCount=0,fullLoad=false,active=0,decoding=0;
    let wantF=1,eased=1,shown='',easing=0,lastTick=0,progress=0,raf=0,roomCentered=false;
    let headerH=80,travel=1,stageW=1,stageH=1,narrow=false,sceneKey='';
    const frameUrl=(s,n)=>`${s.dir}${String(n).padStart(4,'0')}.webp`;
    function chooseSet(){
      // Portrait phones get a 3:4 centre crop with half the frames; everything else the 16:10 set.
      const next=stageW/stageH<=.75?{dir:frameBase+'m/',count:80,w:750,h:1000}:{dir:frameBase+'d/',count:160,w:1440,h:900};
      if(set&&set.dir===next.dir)return;
      bitmaps.forEach(b=>b.close?.());bitmaps.clear();blobs.clear();decodingSet.clear();loading.clear();failed.clear();
      set=next;shown='';orderAt=0;active=0;decoding=0;
      // Both ends first, then progressively finer passes. Save-Data stops at every 4th frame.
      const seen=new Set([1,set.count]);order=[1,set.count];
      for(let step=32;step>=1;step/=2){if(saveData&&step<4)break;for(let i=1;i<=set.count;i+=step)if(!seen.has(i)){seen.add(i);order.push(i);}if(step===16)coarseCount=order.length;}
    }
    function nextFrame(){
      const want=Math.round(wantF),usable=n=>n>=1&&n<=set.count&&!blobs.has(n)&&!loading.has(n)&&!failed.has(n);
      // Frames right around the scroll position jump the queue once the user is scrolling.
      if(fullLoad)for(let d=0;d<=3;d++){if(usable(want+d))return want+d;if(usable(want-d))return want-d;}
      const limit=fullLoad?order.length:coarseCount;
      while(orderAt<limit){const n=order[orderAt++];if(usable(n))return n;}
      return 0;
    }
    function pump(){
      if(reduced.matches||!set)return;
      const s=set;
      while(active<6){const n=nextFrame();if(!n)return;active++;loading.add(n);
        fetch(frameUrl(s,n)).then(r=>{if(!r.ok)throw new Error(r.status);return r.blob();})
          .then(blob=>{if(s===set){blobs.set(n,blob);warm();}},()=>{if(s===set)failed.add(n);})
          .finally(()=>{if(s!==set)return;active--;loading.delete(n);pump();});}
    }
    // Decode the KEEP loaded frames nearest the scroll target; release the rest.
    function warm(){
      if(!set||reduced.matches)return;
      const s=set,keep=new Set([...blobs.keys()].sort((x,y)=>Math.abs(x-wantF)-Math.abs(y-wantF)).slice(0,KEEP));
      for(const [n,b] of bitmaps)if(!keep.has(n)){bitmaps.delete(n);b.close?.();}
      for(const n of keep){
        if(decoding>=3)break;if(bitmaps.has(n)||decodingSet.has(n))continue;
        decoding++;decodingSet.add(n);
        toBitmap(blobs.get(n)).then(b=>{if(s===set){bitmaps.set(n,b);kick();}else b.close?.();},()=>{})
          .finally(()=>{if(s!==set)return;decoding--;decodingSet.delete(n);warm();});
      }
    }
    function below(x){for(let n=Math.floor(x);n>=1;n--)if(bitmaps.has(n))return n;return 0;}
    function above(x){for(let n=Math.ceil(x);n<=set.count;n++)if(bitmaps.has(n))return n;return 0;}
    function paint(img,alpha){const w=canvas.width,h=canvas.height,iw=img.width,ih=img.height,scale=Math.max(w/iw,h/ih);ctx.globalAlpha=alpha;ctx.drawImage(img,(w-iw*scale)/2,(h-ih*scale)/2,iw*scale,ih*scale);}
    // Blend the loaded frames either side of x. While frames are still arriving the
    // gaps are wide, and a crossfade reads as motion where a hard cut would stutter.
    function draw(x){
      if(!ctx||reduced.matches)return;
      const lo=below(x),hi=above(x);if(!lo&&!hi)return;
      const a=lo||hi,b=hi||lo,mix=a===b||b-a===1||b-a>16?(x-a<b-x?0:1):(x-a)/(b-a); // adjacent frames: plain cut, one draw
      const key=mix===0?String(a):mix===1?String(b):`${a}|${b}|${Math.round(mix*48)}`;if(key===shown)return;shown=key;
      if(mix===1)paint(bitmaps.get(b),1);else{paint(bitmaps.get(a),1);if(mix>0)paint(bitmaps.get(b),mix);}ctx.globalAlpha=1;
      canvas.dataset.frame=String(Math.round((mix<.5?a:b)*160/set.count));canvas.style.opacity='1';
    }
    function tick(now){
      easing=0;const dt=Math.min(64,lastTick?now-lastTick:16);lastTick=now;
      eased+=(wantF-eased)*(1-Math.exp(-dt/70));if(Math.abs(wantF-eased)<.05)eased=wantF;
      draw(eased);
      if(eased!==wantF)easing=requestAnimationFrame(tick);else lastTick=0;
    }
    function kick(){if(!easing&&set&&!reduced.matches)easing=requestAnimationFrame(tick);}
    function startFullLoad(){if(fullLoad)return;fullLoad=true;pump();}
    ['scroll','wheel','touchstart','keydown'].forEach(type=>addEventListener(type,startFullLoad,{passive:true,once:true}));
    function measure(){
      headerH=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header'))||80;
      travel=Math.max(1,journey.offsetHeight-stage.offsetHeight);stageW=stage.clientWidth;stageH=stage.clientHeight;
      narrow=matchMedia('(max-width: 700px)').matches;sceneKey='';
    }
    function update(){raf=0;const r=journey.getBoundingClientRect();progress=reduced.matches?1:Math.max(0,Math.min(1,(headerH-r.top)/travel));
      // The model's endpoint is the centre 80% of the wide room. Match that crop,
      // swap opaque images, then reveal the whole photograph using scroll alone.
      const photoVisible=reduced.matches||progress>=.84;
      const t=Math.max(0,Math.min(1,(progress-.84)/.14)),settle=t*t*(3-2*t);
      const frameHeight=Math.max(stageH,stageW/1.6);
      const finalHeight=narrow?stageW/2:Math.min(stageH,stageW/2);
      const height=reduced.matches?finalHeight:frameHeight+(finalHeight-frameHeight)*settle;
      const top=narrow?((reduced.matches?1:settle)*58)+'px':'';
      // Only touch the room's layout when it actually changes.
      const key=`${height.toFixed(1)}|${top}`;if(key!==sceneKey){sceneKey=key;scene.style.width=(height*2)+'px';scene.style.height=height+'px';scene.style.top=top;}
      const ready=reduced.matches||progress>=.98;
      layer.style.opacity=photoVisible?'1':'0';layer.classList.toggle('ready',ready);layer.inert=!ready;layer.setAttribute('aria-hidden',String(!ready));
      stage.dataset.phase=ready?'explore':photoVisible?'settle':'flight';
      $('.hero-copy').style.opacity=String(Math.max(0,1-progress*5));$('.hero-copy').inert=progress>.2;$('.hero-shade').style.opacity=String(Math.max(0,1-progress*4));$('.journey-caption').style.opacity=String(Math.max(0,1-progress*5));$('.journey-caption').inert=progress>.2;$('.scroll-track span').style.width=(progress*100)+'%';stage.dataset.progress=progress.toFixed(3);
      if(!ready)hide();
      if(photoVisible){
        if(narrow&&(!roomCentered||!ready)){viewport.scrollLeft=Math.max(0,(scene.offsetWidth-viewport.clientWidth)/2);roomCentered=true;}else if(!narrow&&viewport.scrollLeft)viewport.scrollLeft=0;
        updateArrows();
      }
      if(!reduced.matches&&!photoVisible&&r.bottom>0&&r.top<innerHeight){wantF=1+Math.min(1,progress/.84)*(set.count-1);kick();warm();pump();}
    }
    function schedule(){if(!raf)raf=requestAnimationFrame(update);}
    function resize(){
      measure();chooseSet();
      // Never back the canvas with more pixels than the frame provides.
      const cover=Math.max(stageW/set.w,stageH/set.h),dpr=Math.min(devicePixelRatio||1,2,Math.max(1,1/cover));
      canvas.width=Math.round(stageW*dpr);canvas.height=Math.round(stageH*dpr);
      shown='';kick();pump();updateArrows();schedule();
    }
    addEventListener('scroll',schedule,{passive:true});addEventListener('resize',resize);reduced.addEventListener('change',()=>{measure();schedule();});resize();
    $('.enter-room').addEventListener('click',e=>{e.preventDefault();const y=journey.offsetTop+journey.offsetHeight-stage.offsetHeight-parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header'));scrollTo({top:y,behavior:reduced.matches?'instant':'smooth'});});
  }
})();
