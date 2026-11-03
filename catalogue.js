(() => {
  'use strict';
  // Reads the live catalogue from Supabase. Each page fetches only what it shows;
  // the full product list is loaded on demand (catalogue page, or the first search).
  const data=window.EE_DATA,config=data.catalogue,page=document.body.dataset.page;
  const references=data.products.filter(p=>p.origin!=='catalogue');
  const aliases={'fans':'fans','lights and leds':'lighting','lighting':'lighting','switches':'switches','appliances':'appliances','acs and freezers':'ac','acs':'ac','air conditioning':'ac','geysers':'geysers','water heaters':'geysers','outdoor lighting':'outdoor','wires and cables':'wires','wires':'wires','circuit protection':'protection'};
  const LIST_COLUMNS='id,Name,Brand,Category,Price,in_stock,Photo_url';
  const FEATURED=['4','157','140','crysta'];
  // Every raw Category spelling that maps to this site category, as a PostgREST or=() list.
  const sameCategory=id=>Object.keys(aliases).filter(k=>aliases[k]===id).map(k=>`Category.ilike.${encodeURIComponent(`"${k}"`)}`).join(',');
  const numericId=id=>/^\d+$/.test(String(id??''));
  const price=value=>{const s=String(value??'').replace(/^(?:rs\.?|inr|₹)\s*/i,'').replace(/,/g,'').trim();return /^\d+(?:\.\d+)?$/.test(s)?Number(s):null;};
  const image=value=>{try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)?u.href:null;}catch{return null;}};
  const normalize=row=>({id:String(row.id),name:row.Name||'Product',brand:row.Brand||'',category:aliases[String(row.Category||'').trim().toLowerCase()]||'appliances',price:price(row.Price),outOfStock:row.in_stock!==true,image:image(row.Photo_url),note:row.Spec||'',origin:'catalogue'});

  // Pre-rendered pages (products/<id>.html) bake the ID in; the legacy URL passes ?id=.
  data.productId=window.PREFILLED_ID!=null?String(window.PREFILLED_ID):new URLSearchParams(location.search).get('id');

  async function request(table,query){
    const response=await fetch(`${config.url}/rest/v1/${table}?${query}`,{headers:{apikey:config.key},signal:AbortSignal.timeout(12000),cache:'no-store'});
    if(!response.ok){const error=new Error(`Catalogue request ${response.status}`);error.status=response.status;throw error;}
    const result=await response.json();if(!Array.isArray(result))throw new Error('Invalid catalogue response');return result;
  }
  // Ask for named columns only; if the schema has drifted (PostgREST 400), fall back to every column.
  async function rows(table,query,columns){
    try{return await request(table,`select=${columns}&${query}`);}
    catch(error){if(error.status===400&&columns!=='*')return request(table,`select=*&${query}`);throw error;}
  }
  async function everything(){
    const live=[];
    for(let offset=0;;offset+=1000){const page=await rows('products',`order=id.asc&limit=1000&offset=${offset}`,LIST_COLUMNS);live.push(...page.map(normalize));if(page.length<1000)break;}
    return live;
  }
  // Keep the shared array identity (app.js holds a reference) and keep any richer
  // objects already loaded for this page (images, variants, description).
  function merge(live){
    const known=new Map(data.products.filter(p=>p.origin==='catalogue').map(p=>[p.id,p]));
    const merged=live.map(p=>known.has(p.id)?Object.assign(known.get(p.id),{...p,note:known.get(p.id).note||p.note}):p);
    data.products.splice(0,data.products.length,...merged,...references.filter(p=>!merged.some(l=>l.id===p.id)));
  }

  let allPromise=null;
  // Memoised full-list load. Used by the catalogue page and by global search.
  window.EE_LOAD_ALL=()=>allPromise||(allPromise=everything().then(live=>{merge(live);data.allLoaded=true;},error=>{allPromise=null;throw error;}));

  async function forPage(){
    if(page==='catalogue')return window.EE_LOAD_ALL();
    if(page==='home'){
      const ids=FEATURED.filter(numericId);
      if(ids.length)merge((await rows('products',`id=in.(${ids.join(',')})`,LIST_COLUMNS)).map(normalize));
      return;
    }
    if(page==='product'){
      const id=data.productId;if(!numericId(id))return; // display/reference items live in data.js
      const found=await rows('products',`id=eq.${id}`,`${LIST_COLUMNS},Spec`);if(!found.length)return;
      const p=normalize(found[0]),related=[];
      const [images,variants,siblings]=await Promise.allSettled([
        rows('product_images',`product_id=eq.${id}&order=sort_order.asc`,'image_url'),
        rows('product_variants',`product_id=eq.${id}`,'*'),
        rows('products',`or=(${sameCategory(p.category)})&id=neq.${id}&order=id.asc&limit=4`,LIST_COLUMNS)
      ]);
      p.images=images.status==='fulfilled'?images.value.map(i=>image(i.image_url)).filter(Boolean):[];
      if(!p.images.length&&p.image)p.images=[p.image];
      p.variants=variants.status==='fulfilled'?variants.value:[];
      if(siblings.status==='fulfilled')related.push(...siblings.value.map(normalize));
      merge([p,...related]);
    }
    // about and other pages need no catalogue data until someone searches.
  }

  data.catalogueState='loading';
  window.EE_CATALOGUE_READY=forPage().then(()=>{data.catalogueState='live';},()=>{
    data.products.splice(0,data.products.length,...references);data.catalogueState='unavailable';
  });
})();
