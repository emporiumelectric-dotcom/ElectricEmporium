window.dataLayer=window.dataLayer||[];
window.gtag=function(){window.dataLayer.push(arguments);};
gtag('js',new Date());
gtag('config','G-V14YKCWGSH');
// Contact clicks are the site's conversions. Attribute them to the product card
// they came from, or to the product page being viewed.
document.addEventListener('click',e=>{
 const a=e.target.closest('a');if(!a)return;
 const action=a.href.startsWith('https://wa.me/')?'whatsapp_click':a.href.startsWith('tel:')?'call_click':null;
 if(!action)return;
 const card=a.closest('.product-card'),link=card?.querySelector('h3 a')?.getAttribute('href')||'';
 const name=(card?.querySelector('h3')||document.querySelector('.detail-info h1'))?.textContent?.trim()||'';
 const id=card?(link.match(/products\/(\d+)\.html|[?&]id=([^&]+)/)||[]).slice(1).find(Boolean)||'':window.EE_DATA?.productId||'';
 gtag('event',action,{event_category:'engagement',event_label:document.body.dataset.page,item_name:name,item_id:id});
});
