// 1. Firebase Konfiguratsiyasi
const firebaseConfig = {
    apiKey: "AIzaSyCDgzdUF3n8rI_9zxs-cFyODn0Df5vxC_U",
    authDomain: "bgburger-savdo.firebaseapp.com",
    databaseURL: "https://bgburger-savdo-default-rtdb.asia-southeast1.firebasedatabase.app/",
    projectId: "bgburger-savdo",
    storageBucket: "bgburger-savdo.firebasestorage.app",
    messagingSenderId: "916871756784",
    appId: "1:916871756784:web:dc992046e491da5500bb35"
};

// Firebaseni ishga tushirish
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

// 2. Menyu ma'lumotlari
const menuData = {
    "Burgerlar": [
        { name: "Gamburger", price: 20000 }, { name: "Big Burger", price: 30000 },
        { name: "Chisburger", price: 25000 }, { name: "Chisburger 2 kotlet", price: 30000 },
        { name: "Nonburger", price: 32000 }, { name: "Nonburger dobriy", price: 35000 },
        { name: "Danar", price: 28000 }, { name: "Xaggi", price: 28000 }, { name: "Nonkabob", price: 35000 }
    ],
    "Lavashlar": [
        { name: "Lavash mini", price: 28000 }, { name: "Lavash tovuq", price: 25000 },
        { name: "Lavash standart", price: 32000 }, { name: "Lavash dobriy", price: 35000 },
        { name: "Lavash tandir", price: 38000 }, { name: "Lavash sirli", price: 38000 },
        { name: "Lavashda hotdog", price: 20000 }, { name: "Lavash s kotletoy", price: 35000 }
    ],
    "Hotdoglar": [
        { name: "Hotdog 1 sasiska", price: 10000 }, { name: "Hotdog kanada", price: 13000 },
        { name: "Hotdog 2 sasiska", price: 16000 }, { name: "Big hotdog", price: 20000 },
        { name: "Hotdog qazili", price: 35000 }
    ],
    "Pitsalar": [
        { name: "Pepperoni", price: 70000 }, { name: "Go`shtlik", price: 80000 }, { name: "Asarti", price: 90000 }
    ],
    "Tovuq": [
        { name: "Grill", price: 55000 },
        { name: "Kfs (tovuq) 500GR", price: 43000 },
        { name: "Kfs (tovuq) 50000 so'm", price: 50000 },
        { name: "Kfs (tovuq) 60000 so'm", price: 60000 },
        { name: "Kfs (tovuq) 70000 so'm", price: 70000 },
        { name: "Kfs (tovuq) 1KG", price: 85000 }
    ],
    "Ichimliklar": [
        { name: "Tara 0.25L", price: 5000 },
        { name: "Kofe 1 stakan", price: 5000 },
        { name: "Choy 1 stakan", price: 2000 },
        { name: "Choy 1 choynak", price: 5000 }
    ],
    "Shirinliklar": [
        { name: "Shirinlik 1 kusok", price: 10000 }
    ]
};

let currentOrder = [];
const adminPassword = "volk1111";

// DOM elementlar
const menuDiv = document.getElementById('menu-items');
const categoryDiv = document.getElementById('category-tabs');

// --- SAVDO QISMI ---

function renderCategories() {
    if (!categoryDiv) return;
    categoryDiv.innerHTML = "";
    let allBtn = document.createElement('button');
    allBtn.innerText = "Barchasi";
    allBtn.className = "cat-btn active";
    allBtn.onclick = (e) => {
        document.querySelectorAll('#category-tabs .cat-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        renderMenu("all");
    };
    categoryDiv.appendChild(allBtn);

    for (let cat in menuData) {
        let btn = document.createElement('button');
        btn.innerText = cat;
        btn.className = "cat-btn";
        btn.onclick = (e) => {
            document.querySelectorAll('#category-tabs .cat-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            renderMenu(cat);
        };
        categoryDiv.appendChild(btn);
    }
}

function renderMenu(category = "all") {
    if (!menuDiv) return;
    menuDiv.innerHTML = "";
    let itemsToShow = [];
    if (category === "all") {
        for (let cat in menuData) itemsToShow = itemsToShow.concat(menuData[cat]);
    } else {
        itemsToShow = menuData[category];
    }
    itemsToShow.forEach(item => {
        let btn = document.createElement('button');
        btn.className = 'menu-btn';
        btn.innerText = `${item.name}\n${item.price.toLocaleString()} so'm`;
        btn.onclick = () => addToOrder(item);
        menuDiv.appendChild(btn);
    });
}

function addToOrder(item) {
    const orderItem = { ...item, orderId: Date.now() + Math.random() };
    currentOrder.push(orderItem);
    updateTotal();
}

function removeFromOrder(id) {
    currentOrder = currentOrder.filter(item => item.orderId !== id);
    updateTotal();
}

function updateTotal() {
    const cartList = document.getElementById('cart-list');
    const totalSumLabel = document.getElementById('total-sum');
    if (!cartList) return;
    cartList.innerHTML = "";
    let sum = 0;
    currentOrder.forEach((item) => {
        let li = document.createElement('li');
        li.className = "cart-item";
        li.innerHTML = `<span>${item.name}</span><span><b>${item.price.toLocaleString()}</b> <button onclick="removeFromOrder(${item.orderId})" style="color:red; border:none; background:none; cursor:pointer; font-size:18px;">✖</button></span>`;
        cartList.appendChild(li);
        sum += item.price;
    });
    totalSumLabel.innerText = sum.toLocaleString();
}

function completeSale() {
    if (currentOrder.length === 0) return alert("Savat bo'sh!");
    let saleData = {
        time: new Date().toISOString(),
        items: [...currentOrder],
        total: currentOrder.reduce((a, b) => a + b.price, 0)
    };
    database.ref('sales').push(saleData).then(() => {
        alert("Sotuv muvaffaqiyatli saqlandi!");
        currentOrder = [];
        updateTotal();
    }).catch(err => alert("Xato: " + err.message));
}

// --- ADMIN VA HISOBOT QISMI ---

function toggleAdmin() {
    let pass = prompt("Admin parolini kiriting:");
    if (pass === adminPassword) {
        document.getElementById('admin-data').style.display = 'block';
        showStats('today');
    } else {
        alert("Parol noto'g'ri!");
    }
}

function showStats(filter = 'today', showAll = false) {
    const statsOutput = document.getElementById('stats-output');
    if (!statsOutput) return;

    // Tugmalarning rangini to'g'rilash
    const filterButtons = document.querySelectorAll('.filter-group button');
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick').includes(`'${filter}'`)) {
            btn.classList.add('active');
        }
    });

    database.ref('sales').on('value', (snapshot) => {
        const data = snapshot.val();
        let sales = [];
        for (let key in data) sales.push({ id: key, ...data[key] });

        let now = new Date();
        let filteredSales = sales.filter(sale => {
            let saleDate = new Date(sale.time);
            if (filter === 'today') return saleDate.toDateString() === now.toDateString();
            if (filter === 'week') return (now - saleDate) / (1000 * 60 * 60 * 24) <= 7;
            if (filter === 'month') return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
            return true;
        });
        renderStatsUI(filteredSales, filter, showAll);
    });
}

function renderStatsUI(filteredSales, filter, showAll) {
    const statsOutput = document.getElementById('stats-output');
    let totalSum = filteredSales.reduce((sum, s) => sum + s.total, 0);

    const filterNames = { 'today': 'BUGUNGI', 'week': 'HAFTALIK', 'month': 'OYLIK', 'all': 'UMUMIY' };
    let currentFilterName = filterNames[filter] || filter.toUpperCase();

    let output = `
        <div style="background: #f8f9fa; padding: 15px; border-radius: 12px; margin-bottom: 20px; border-left: 5px solid #28a745; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
            <span style="font-size: 12px; color: #888; font-weight: bold;">${currentFilterName} HISOBOTI</span>
            <h2 style="color:#28a745; margin: 5px 0 0 0; font-size: 26px;">${totalSum.toLocaleString()} <small style="font-size:14px;">so'm</small></h2>
        </div>
        <b style="display: block; margin-bottom: 10px; color: #444;">Sotuvlar tarixi:</b>`;

    let displayList = filteredSales.slice().reverse();
    let limit = 10;
    let listToRender = (!showAll && displayList.length > limit) ? displayList.slice(0, limit) : displayList;

    listToRender.forEach(s => {
        let itemNames = s.items ? s.items.map(i => i.name).join(", ") : "Noma'lum";
        let timeStr = new Date(s.time).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });

        output += `
            <div style="background: #fff; border: 1px solid #eee; border-radius: 10px; padding: 12px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
                <div style="flex: 1;">
                    <span style="font-size: 11px; color: #aaa;">${timeStr}</span><br>
                    <b style="font-size: 16px; color: #333;">${s.total.toLocaleString()} so'm</b><br>
                    <div style="font-size: 12px; color: #777; margin-top: 2px;">${itemNames}</div>
                </div>
                <button onclick="deleteSale('${s.id}')" 
                        style="background: #fff5f5; border: 1px solid #fed7d7; color: #e53e3e; padding: 10px; border-radius: 10px; cursor: pointer; font-size: 18px;">
                    🗑️
                </button>
            </div>`;
    });

    if (filteredSales.length > limit) {
        let btnText = showAll ? "Qisqartirish ↑" : `Barchasini ko'rsatish (${filteredSales.length}) ↓`;
        output += `<button onclick="showStats('${filter}', ${!showAll})" style="width:100%; border:1px solid #ddd; background: white; color:#555; padding:12px; margin-top:10px; border-radius:10px; cursor:pointer; font-weight:bold;">${btnText}</button>`;
    }

    statsOutput.innerHTML = filteredSales.length > 0 ? output : "<p style='text-align:center; color:#999; padding:20px;'>Hozircha ma'lumot yo'q.</p>";
}

function deleteSale(saleId) {
    if (confirm("Ushbu sotuvni o'chirib tashlamoqchimisiz?")) {
        database.ref('sales/' + saleId).remove();
    }
}

function clearHistory() {
    if (confirm("BUTUN TARIX o'chib ketadi. Ishonchingiz komilmi?")) {
        database.ref('sales').remove();
    }
}

// Qidiruv funksiyasi
function filterMenu() {
    let text = document.getElementById('search-input').value.toLowerCase();
    let allItems = [];
    for (let cat in menuData) allItems = allItems.concat(menuData[cat]);
    let filtered = allItems.filter(item => item.name.toLowerCase().includes(text));
    menuDiv.innerHTML = "";
    filtered.forEach(item => {
        let btn = document.createElement('button');
        btn.className = 'menu-btn';
        btn.innerText = `${item.name}\n${item.price.toLocaleString()} so'm`;
        btn.onclick = () => addToOrder(item);
        menuDiv.appendChild(btn);
    });
}

// Ishga tushirish
renderCategories();
renderMenu("all");