/*
 * API ADAPTER
 * DEMO MODE works immediately with browser localStorage.
 * To connect Oracle, deploy the PL/SQL package behind a secure REST API
 * (normally Oracle REST Data Services / ORDS), then set API_BASE_URL below.
 *
 * Never put Oracle database usernames/passwords in browser JavaScript.
 */
const API_BASE_URL = ""; // Example: "https://your-domain.example/ords/your_schema/bookstore"

const demoBooks = [
  {book_id:1,title:"The Alchemist",author:"Paulo Coelho",category:"Fiction",price:299,stock_qty:20,isbn:"9780061122415",color:"#315b55"},
  {book_id:2,title:"Wings of Fire",author:"A. P. J. Abdul Kalam",category:"Biography",price:250,stock_qty:15,isbn:"9788173711466",color:"#c16e4c"},
  {book_id:3,title:"Clean Code",author:"Robert C. Martin",category:"Technology",price:650,stock_qty:10,isbn:"9780132350884",color:"#334b78"},
  {book_id:4,title:"The Silent Patient",author:"Alex Michaelides",category:"Mystery",price:399,stock_qty:12,isbn:"9781250301697",color:"#8d594d"},
  {book_id:5,title:"Atomic Habits",author:"James Clear",category:"Self Help",price:499,stock_qty:18,isbn:"9780735211292",color:"#d0a65d"},
  {book_id:6,title:"Ikigai",author:"Héctor García",category:"Self Help",price:350,stock_qty:14,isbn:"9780143130727",color:"#587d8b"},
  {book_id:7,title:"Pride and Prejudice",author:"Jane Austen",category:"Classic",price:220,stock_qty:9,isbn:"9780141439518",color:"#a16d87"},
  {book_id:8,title:"Deep Work",author:"Cal Newport",category:"Productivity",price:425,stock_qty:11,isbn:"9781455586691",color:"#526b55"}
];

const StoreAPI = {
  isLive: Boolean(API_BASE_URL),
  async request(path, options={}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options, headers: {"Content-Type":"application/json", ...(options.headers||{})}
    });
    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `API request failed (${response.status})`);
    }
    return response.status === 204 ? null : response.json();
  },
  async getBooks() {
    if (this.isLive) return this.request("/books");
    const saved = localStorage.getItem("co_books");
    if (saved) return JSON.parse(saved);
    localStorage.setItem("co_books", JSON.stringify(demoBooks));
    return demoBooks;
  },
  async addBook(book) {
    if (this.isLive) return this.request("/books", {method:"POST",body:JSON.stringify(book)});
    const books = await this.getBooks();
    const item = {...book,book_id:Date.now(),color:"#496d5a",isbn:"DEMO-"+Date.now()};
    books.unshift(item); localStorage.setItem("co_books",JSON.stringify(books)); return item;
  },
  async placeOrder(payload) {
    if (this.isLive) return this.request("/orders", {method:"POST",body:JSON.stringify(payload)});
    const orders = JSON.parse(localStorage.getItem("co_orders")||"[]");
    const order = {order_id:Date.now(),order_date:new Date().toISOString(),order_status:"PENDING",...payload};
    orders.unshift(order); localStorage.setItem("co_orders",JSON.stringify(orders));
    const books = await this.getBooks();
    payload.items.forEach(item => {
      const book = books.find(b=>Number(b.book_id)===Number(item.book_id));
      if (book) book.stock_qty = Math.max(0,Number(book.stock_qty)-Number(item.quantity));
    });
    localStorage.setItem("co_books",JSON.stringify(books));
    return order;
  },
  async getOrders() {
    if (this.isLive) return this.request("/orders");
    return JSON.parse(localStorage.getItem("co_orders")||"[]");
  },
  async login(credentials) {
    if (this.isLive) return this.request("/auth/login",{method:"POST",body:JSON.stringify(credentials)});
    const users=JSON.parse(localStorage.getItem("co_users")||"[]");
    const user=users.find(u=>u.email.toLowerCase()===credentials.email.toLowerCase()&&u.password===credentials.password);
    if(!user) throw new Error("Account not found. Create a preview account first.");
    return {user_id:user.user_id,full_name:user.name,email:user.email};
  },
  async register(user) {
    if (this.isLive) return this.request("/users",{method:"POST",body:JSON.stringify(user)});
    const users=JSON.parse(localStorage.getItem("co_users")||"[]");
    if(users.some(u=>u.email.toLowerCase()===user.email.toLowerCase())) throw new Error("An account with this email already exists.");
    const created={...user,user_id:Date.now()};users.push(created);localStorage.setItem("co_users",JSON.stringify(users));
    return {user_id:created.user_id,full_name:created.name,email:created.email};
  },
  async deleteBook(bookId) {
    if (this.isLive) return this.request(`/books/${bookId}`,{method:"DELETE"});
    const books=(await this.getBooks()).filter(b=>Number(b.book_id)!==Number(bookId));
    localStorage.setItem("co_books",JSON.stringify(books));
  }
};