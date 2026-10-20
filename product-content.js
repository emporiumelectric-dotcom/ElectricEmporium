/* Readable catalogue sections, with support for older plain-text Spec values. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ProductContent=api;})(globalThis,function(){
  function parse(value){
    const result={description:[],features:[],specs:[]};let section='description';
    const structured=/^Technical specifications\s*$/im.test(value||'');
    for(const raw of String(value||'').split('\n')){
      const line=raw.trim();if(!line)continue;
      if(structured&&/^(Description|Features|Technical specifications)$/i.test(line)){section=/^Features$/i.test(line)?'features':/^Technical/i.test(line)?'specs':'description';continue;}
      if(section==='features'){const text=line.replace(/^•\s*/,''),at=text.indexOf(' — ');result.features.push({title:at<0?text:text.slice(0,at),text:at<0?'':text.slice(at+3)});}
      else if(section==='specs'){const at=line.indexOf(':');if(at>0)result.specs.push([line.slice(0,at).trim(),line.slice(at+1).trim()]);else result.description.push(line);}
      else result.description.push(line);
    }
    return result;
  }
  function render(value,doc){
    const data=parse(value),root=doc.createElement('div');root.className='product-details';
    const el=(tag,text)=>{const e=doc.createElement(tag);e.textContent=text;return e;};
    function section(title){const node=doc.createElement('section');node.append(el('h2',title));root.append(node);return node;}
    if(data.description.length){const node=section('Description');data.description.forEach(text=>node.append(el('p',text)));}
    if(data.features.length){const node=section('Features'),grid=doc.createElement('div');grid.className='product-feature-grid';for(const f of data.features){const card=doc.createElement('article');card.append(el('h3',f.title));if(f.text)card.append(el('p',f.text));grid.append(card);}node.append(grid);}
    if(data.specs.length){const node=section('Technical specifications'),dl=doc.createElement('dl');dl.className='product-spec-grid';for(const [key,value] of data.specs){const row=doc.createElement('div');row.append(el('dt',key),el('dd',value));dl.append(row);}node.append(dl);}
    return root;
  }
  return {parse,render};
});
