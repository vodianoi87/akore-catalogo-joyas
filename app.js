const products = [
  ...[['Cubana',3],['Carter',4],['Chinesca',5],['Lazo',6],['Veneciana',7],['Egipcia',8],['Serpiente',9],['Grabada',10],['Franco',11],['Ancla',12],['Tennis',13],['Barbada',14],['Rústica',15],['Espiga',16],['Engranaje',17],['Hélice',18],['Militar',19],['Griega',20],['Romana',21],['Cordón',22],['Singapur',22],['Espiral',23]].map(([name,page])=>({name,category:'Cadenas',page})),
  ...[['Cruz Brillante',24],['Corazón Caballo',25],['Cruz Calada',26],['Cruz Celestial',27],['Cruz Deluxe',28],['Cruz Grabada',29],['Cruz Liana',30],['Cruz Lisa',31],['Cruz Luxus',32],['Cruz Suprema',33],['Ala',34],['Barra',35],['Barra Pirámides',36],['Caballo',37],['Gladiador',38],['Hércules',39],['Jade',40],['Pegaso',41],['Ancla',42],['Equus',43],['León',44],['Placa',45],['Placa Griega',46],['Loyal',47],['Clásico',48]].map(([name,page])=>({name,category:page===42||page===43||page===44?'Medallas y dijes':'Dijes',page})),
  ...[['Aslan',49],['Calado',50],['León',51],['Liso',52],['Luxor',53],['Pantera',54],['Magno',55]].map(([name,page])=>({name,category:'Brazaletes',page})),
  ...[['Apolo',56],['Colosal',57],['Cubano',58],['Esparta',59],['Olimpus',60],['Panal',61],['Titán',62],['Zeus',63]].map(([name,page])=>({name,category:'Anillos',page})),
  ...[['Cubano',64],['Carter',65],['Chinesco',66],['Franco',67],['Grabado',68],['Serpiente',69],['Ancla',70],['Veneciano',71],['Lazo',72],['Tennis',73],['Tennis rectangular',74],['Tennis cuadrado',75],['Jade',76],['Zeus',77],['Atlas',78],['Monaco',79],['Titán',80],['Carter tejido',81],['Cubano tejido',82],['Chinesco tejido',83],['Franco tejido',84],['Ancla tejido',85],['Veneciano tejido',86],['Tejido placa',87],['Intercalada',88],['Doble intercalada',89],['Balines centrales',90],['Balines laterales',91],['Balines completa',92],['Trenzada',93],['Entrelazada',94],['Tres líneas',95]].map(([name,page])=>({name,category:'Pulseras',page})),
  ...[['Siena',96],['Astra',96],['Bria',97],['Greta',97],['Alma',98],['Tara',98],['Myra',98],['Aura',98]].map(([name,page])=>({name,category:'Argollas',page}))
].map((product,index)=>({...product,id:index+1,image:`assets/pages/joya-${String(product.page).padStart(2,'0')}.jpg`}));

const categories = ['Todas',...new Set(products.map(item=>item.category))];
const categoryHost = document.querySelector('#categories');
const grid = document.querySelector('#product-grid');
const search = document.querySelector('#search');
const count = document.querySelector('#result-count');
const empty = document.querySelector('#empty-state');
let activeCategory = 'Todas';

function renderCategories(){
  categoryHost.innerHTML = categories.map(category=>`<button class="category-button${category===activeCategory?' active':''}" type="button" data-category="${category}">${category}</button>`).join('');
  categoryHost.querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>{activeCategory=button.dataset.category;renderCategories();renderProducts()}));
}
function renderProducts(){
  const query=search.value.trim().toLocaleLowerCase('es');
  const filtered=products.filter(item=>(activeCategory==='Todas'||item.category===activeCategory)&&item.name.toLocaleLowerCase('es').includes(query));
  count.textContent=`${filtered.length} ${filtered.length===1?'diseño':'diseños'}`;
  empty.hidden=filtered.length>0;
  grid.innerHTML=filtered.map(item=>`<article class="product-card" tabindex="0" role="button" aria-label="Ver ${item.name}, ${item.category}" data-id="${item.id}"><div class="product-image"><img src="${item.image}" alt="${item.name}, ${item.category}. Referencia de catálogo página ${item.page}" loading="lazy"><span class="page-label">AKORE · ${String(item.page).padStart(2,'0')}</span><button class="card-action" type="button" aria-label="Ver ${item.name}">↗</button></div><div class="product-meta"><div><h3>${item.name}</h3><p>${item.category}</p></div><span class="price-note">Consultar precio</span></div></article>`).join('');
  grid.querySelectorAll('.product-card').forEach(card=>{
    const item=filtered.find(product=>product.id===Number(card.dataset.id));
    card.addEventListener('click',()=>openProduct(item));
    card.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();openProduct(item)}});
  });
}
const dialog=document.querySelector('#product-dialog');
function openProduct(item){
  document.querySelector('#dialog-image').src=item.image;
  document.querySelector('#dialog-image').alt=`${item.name} - ${item.category}`;
  document.querySelector('#dialog-category').textContent=`${item.category} · PÁGINA ${String(item.page).padStart(2,'0')}`;
  document.querySelector('#dialog-title').textContent=item.name;
  document.querySelector('#dialog-whatsapp').href=`https://wa.me/?text=${encodeURIComponent(`Hola Akore, quiero consultar por la joya ${item.name} de la categoría ${item.category} (página ${item.page}) del catálogo.`)}`;
  dialog.showModal();
}
search.addEventListener('input',renderProducts);
document.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close()});
renderCategories();
renderProducts();
