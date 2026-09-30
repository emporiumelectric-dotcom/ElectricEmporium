(() => {
  'use strict';
  const data=window.EE_DATA,config=data.catalogue;
 const references=data.products.filter(p=>p.origin!=='catalogue');
  const aliases={'fans':'fans','lights and leds':'lighting','lighting':'lighting','switches':'switches','appliances':'appliances','acs and freezers':'ac','acs':'ac','air conditioning':'ac','geysers':'geysers','water heaters':'geysers','outdoor lighting':'outdoor','wires and cables':'wires','wires':'wires','circuit protection':'protection'};
  const price=value=>{const s=String(value??'').replace(/^(?:rs\.?|inr|\u20b9)\s*/i,'').replace(/,/g,'').trim();return /^\d+(?:\.\d+)?$/.test(s)?Number(s):null;};
  const image=value=>{try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)?u.href:null;}catch{return null;}};
  const normalize=row=>({id:String(row.id),name:row.Name||'Product',brand:row.Brand||'',category:aliases[String(row.Category||'').trim().toLowerCase()]||'appliances',price:price(row.Price),outOfStock:row.in_stock!==true,image:image(row.Photo_url),note:row.Spec||'',origin:'catalogue',source:`product-detail.html?id=${encodeURIComponent(row.id)}`});
  async function rows(table,query){const response=await fetch(`${config.url}/rest/v1/${table}?${query}`,{headers:{apikey:config.key},signal:AbortSignal.timeout(12000),cache:'no-store'});if(!response.ok)throw new Error(`Catalogue request ${response.status}`);const result=await response.json();if(!Array.isArray(result))throw new Error('Invalid catalogue response');return result;}
  data.catalogueState='loading';
  window.EE_CATALOGUE_READY=(async()=>{
    try{
      const live=[];for(let offset=0;;offset+=1000){const page=await rows('products',`select=*&order=id.asc&limit=1000&offset=${offset}`);live.push(...page.map(normalize));if(page.length<1000)break;}
      data.products.splice(0,data.products.length,...live,...references.filter(p=>!live.some(l=>l.id===p.id)));
      data.catalogueState='live';
      if(document.body.dataset.page==='product'){
        const id=new URLSearchParams(location.search).get('id'),p=data.products.find(p=>p.id===id);
        if(p?.origin==='catalogue'){
          const details=await Promise.allSettled([rows('product_images',`product_id=eq.${encodeURIComponent(id)}&order=sort_order.asc`),rows('product_variants',`product_id=eq.${encodeURIComponent(id)}`)]);
          p.images=details[0].status==='fulfilled'?details[0].value.map(i=>image(i.image_url)).filter(Boolean):[];
          if(!p.images.length&&p.image)p.images=[p.image];
          p.variants=details[1].status==='fulfilled'?details[1].value:[];
        }
      }
    }catch{
      data.products.splice(0,data.products.length,...references);data.catalogueState='unavailable';
    }
  })();
})();
