window.dataLayer=window.dataLayer||[];
window.gtag=function(){window.dataLayer.push(arguments);};
gtag('js',new Date());
gtag('config','G-V14YKCWGSH');
document.addEventListener('click',e=>{
 const a=e.target.closest('a');if(!a)return;
 const action=a.href.startsWith('https://wa.me/')?'whatsapp_click':a.href.startsWith('tel:')?'call_click':null;
 if(action)gtag('event',action,{event_category:'engagement',event_label:document.body.dataset.page,item_name:document.querySelector('.detail-info h1')?.textContent||''});
});
