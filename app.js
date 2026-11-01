const $ = s => document.querySelector(s);
const money = n => new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(Number(n)||0);
let books=[], cart={}, currentUser=null, authMode="login";
const palette=["#315b55","#c16e4c","#334b78","#8d594d","#d0a65d","#587d8b","#a16d87","#526b55"];
function toast(msg){const el=$("#toast");el.textContent=msg;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2400)}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
async function init(){books=await StoreAPI.getBooks();$("#modeIndicator").textContent=StoreAPI.isLive?"LIVE API":"DEMO PREVIEW";renderBooks();renderCart();renderAdmin();renderOrders()}
function renderBooks(){
 const q=$("#searchInput").value.trim().toLowerCase(),cat=$("#categoryFilter").value,sort=$("#sortFilter").value;
 const cats=[...new Set(books.map(b=>b.category).filter(Boolean))].sort();
 const selected=$("#categoryFilter").value;
 $("#categoryFilter").innerHTML='<option value="">All categories</option>'+cats.map(c=>`<option>${esc(c)}</option>`).join("");
 $("#categoryFilter").value=selected;
 let list=books.filter(b=>(!q||`${b.title} ${b.author}`.toLowerCase().includes(q))&&(!cat||b.category===cat)&&Number(b.stock_qty)>0);
 if(sort==="price-low")list.sort((a,b)=>a.price-b.price);if(sort==="price-high")list.sort((a,b)=>b.price-a.price);if(sort==="title")list.sort((a,b)=>a.title.localeCompare(b.title));
 $("#resultCount").textContent=`Showing ${list.length} book${list.length===1?"":"s"}`;
 $("#bookGrid").innerHTML=list.map((b,i)=>`<article class="book-card"><div class="cover-wrap"><div class="book-cover" style="background:${b.color||palette[i%palette.length]}"><span class="cover-title">${esc(b.title)}</span><span class="cover-decoration">✳</span><span class="cover-author">${esc(b.author)}</span></div></div><div class="book-info"><span class="book-category">${esc(b.category||"Books")}</span><h3 title="${esc(b.title)}">${esc(b.title)}</h3><p class="book-author">by ${esc(b.author)}</p><div class="book-buy-row"><span class="price">${money(b.price)}</span><button class="add-btn" data-add="${b.book_id}">+ Add</button></div><p class="stock-note">${b.stock_qty} available</p></div></article>`).join("");
 $("#emptyState").classList.toggle("hidden",list.length!==0);
}
function renderCart(){
 const entries=Object.entries(cart).map(([id,qty])=>({book:books.find(b=>Number(b.book_id)===Number(id)),qty})).filter(x=>x.book);
 const count=entries.reduce((s,x)=>s+x.qty,0),total=entries.reduce((s,x)=>s+x.qty*Number(x.book.price),0);
 $("#cartCount").textContent=count;$("#cartSubtotal").textContent=money(total);$("#checkoutTotal").textContent=money(total);
 $("#cartItems").innerHTML=entries.length?entries.map(({book,qty})=>`<div class="cart-row"><div class="mini-cover" style="background:${book.color||"#526b55"}">${esc(book.title.slice(0,18))}</div><div><h4>${esc(book.title)}</h4><small>${money(book.price)} each</small><div class="qty-controls"><button data-qty="${book.book_id}" data-delta="-1">−</button><span>${qty}</span><button data-qty="${book.book_id}" data-delta="1">+</button><button class="remove-link" data-remove="${book.book_id}">Remove</button></div></div><strong>${money(qty*book.price)}</strong></div>`).join(""):'<div class="empty-state"><div>♡</div><h3>Your bag is waiting</h3><p>Add a book that speaks to you.</p></div>';
}
function renderAdmin(){
 $("#adminStats").innerHTML=[["Titles in catalogue",books.length],["Total copies in stock",books.reduce((s,b)=>s+Number(b.stock_qty),0)],["Orders placed",JSON.parse(localStorage.getItem("co_orders")||"[]").length]].map(([l,v])=>`<div class="stat-card"><span>${l}</span><strong>${v}</strong></div>`).join("");
 $("#inventoryBody").innerHTML=books.map(b=>`<tr><td><strong>${esc(b.title)}</strong><br><span class="muted">${esc(b.author)}</span></td><td>${esc(b.category)}</td><td>${money(b.price)}</td><td>${b.stock_qty}</td><td><button class="table-action" data-delete="${b.book_id}">Remove</button></td></tr>`).join("");
}
async function renderOrders(){
 const orders=await StoreAPI.getOrders();
 $("#ordersList").innerHTML=orders.length?orders.map(o=>`<article class="order-card"><div><h3>Order #${o.order_id}</h3><p class="muted">${new Date(o.order_date).toLocaleString("en-IN")} · ${o.items?.length||0} item(s)</p><strong>${money(o.total_amount)}</strong></div><span class="status-pill">${esc(o.order_status)}</span></article>`).join(""):'<div class="empty-state"><div>⌑</div><h3>No orders yet</h3><p>Your next great read is just around the corner.</p></div>';
}
function showView(name){document.querySelectorAll(".view").forEach(v=>v.classList.add("hidden"));$(`#${name}View`).classList.remove("hidden");document.querySelectorAll(".nav-link").forEach(b=>b.classList.toggle("active",b.dataset.view===name));if(name==="admin")renderAdmin();if(name==="orders")renderOrders();window.scrollTo({top:0,behavior:"smooth"})}
function openCart(){closeModals();$("#overlay").classList.remove("hidden");$("#cartDrawer").classList.add("open");$("#cartDrawer").setAttribute("aria-hidden","false")}
function closeCart(){ $("#cartDrawer").classList.remove("open");$("#cartDrawer").setAttribute("aria-hidden","true");$("#overlay").classList.add("hidden")}
function closeModals(){ $("#accountModal").classList.add("hidden");$("#checkoutModal").classList.add("hidden"); }
function openModal(id){closeCart();$("#overlay").classList.remove("hidden");$(id).classList.remove("hidden")}
function closeAll(){closeCart();closeModals();$("#overlay").classList.add("hidden")}
document.addEventListener("click",async e=>{
 const add=e.target.closest("[data-add]");if(add){const b=books.find(x=>Number(x.book_id)===Number(add.dataset.add));if(!b)return;if((cart[b.book_id]||0)>=Number(b.stock_qty))return toast("You have reached the available stock.");cart[b.book_id]=(cart[b.book_id]||0)+1;renderCart();toast("Added to your book bag.");}
 const qty=e.target.closest("[data-qty]");if(qty){const id=qty.dataset.qty,next=(cart[id]||0)+Number(qty.dataset.delta),book=books.find(b=>Number(b.book_id)===Number(id));if(next<=0)delete cart[id];else if(next>Number(book.stock_qty))toast("Not enough stock available.");else cart[id]=next;renderCart();}
 const rem=e.target.closest("[data-remove]");if(rem){delete cart[rem.dataset.remove];renderCart();}
 const del=e.target.closest("[data-delete]");if(del){if(confirm("Remove this book from the catalogue?")){await StoreAPI.deleteBook(del.dataset.delete);books=await StoreAPI.getBooks();renderBooks();renderAdmin();toast("Book removed.");}}
 const nav=e.target.closest("[data-view]");if(nav)showView(nav.dataset.view);
 const tab=e.target.closest("[data-auth]");if(tab){authMode=tab.dataset.auth;document.querySelectorAll(".auth-tab").forEach(x=>x.classList.toggle("active",x===tab));$("#nameField").classList.toggle("hidden",authMode!=="register");$("#authSubmit").textContent=authMode==="register"?"Create account":"Sign in";}
});
$("#searchInput").addEventListener("input",renderBooks);$("#categoryFilter").addEventListener("change",renderBooks);$("#sortFilter").addEventListener("change",renderBooks);
$("#exploreBtn").onclick=()=>$("#catalog").scrollIntoView({behavior:"smooth"});$("#cartBtn").onclick=openCart;$("#closeCart").onclick=closeAll;$("#overlay").onclick=closeAll;$("#accountBtn").onclick=()=>openModal("#accountModal");$("#closeAccount").onclick=closeAll;$("#closeCheckout").onclick=closeAll;
$("#authForm").addEventListener("submit",async e=>{e.preventDefault();const f=new FormData(e.target),data=Object.fromEntries(f.entries());try{currentUser=authMode==="register"?await StoreAPI.register(data):await StoreAPI.login(data);closeAll();toast(`Welcome${currentUser.full_name?", "+currentUser.full_name:""}!`);e.target.reset()}catch(err){toast(err.message)}});
$("#addBookForm").addEventListener("submit",async e=>{e.preventDefault();const f=new FormData(e.target);try{await StoreAPI.addBook({title:f.get("title"),author:f.get("author"),category:f.get("category"),price:Number(f.get("price")),stock_qty:Number(f.get("stock"))});books=await StoreAPI.getBooks();e.target.reset();renderBooks();renderAdmin();toast("Book added to catalogue.")}catch(err){toast(err.message)}});
$("#checkoutBtn").onclick=()=>{if(!Object.keys(cart).length)return toast("Your bag is empty.");if(!currentUser){toast("Please sign in or create a preview account first.");openModal("#accountModal");return;}openModal("#checkoutModal")};
$("#checkoutForm").addEventListener("submit",async e=>{e.preventDefault();const f=new FormData(e.target),items=Object.entries(cart).map(([book_id,quantity])=>({book_id:Number(book_id),quantity}));const total_amount=items.reduce((s,x)=>s+x.quantity*Number(books.find(b=>Number(b.book_id)===x.book_id).price),0);try{const order=await StoreAPI.placeOrder({user_id:currentUser.user_id,customer_name:f.get("name"),email:f.get("email"),address:f.get("address"),items,total_amount});cart={};books=await StoreAPI.getBooks();renderCart();renderBooks();renderAdmin();closeAll();e.target.reset();toast(`Order #${order.order_id} placed successfully!`);showView("orders")}catch(err){toast(err.message)}});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeAll()});
init().catch(err=>toast(err.message));