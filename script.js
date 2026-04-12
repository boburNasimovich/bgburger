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

// 3. Global holat (State)
let orders = {
    "Olib ketish": [],
    "1-stol": [],
    "2-stol": [],
    "3-stol": [],
    "4-stol": [],
    "5-stol": []
};
let activeTable = "Olib ketish";
const adminPassword = "volk1111";

// DOM elementlar
const menuDiv = document.getElementById('menu-items');
const categoryDiv = document.getElementById('category-tabs');

// --- SAVDO QISMI ---

function switchTable() {
    activeTable = document.getElementById('table-number').value;
    updateTotal();
}

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
    orders[activeTable].push(orderItem); 
    updateTotal();
}

function removeFromOrder(id) {
    orders[activeTable] = orders[activeTable].filter(item => item.orderId !== id);
    updateTotal();
}

function updateTotal() {
    const cartList = document.getElementById('cart-list');
    const totalSumLabel = document.getElementById('total-sum');
    if (!cartList) return;
    
    cartList.innerHTML = "";
    let sum = 0;
    
    orders[activeTable].forEach((item) => {
        let li = document.createElement('li');
        li.className = "cart-item";
        li.innerHTML = `<span>${item.name}</span><span><b>${item.price.toLocaleString()}</b> <button onclick="removeFromOrder(${item.orderId})" style="color:red; border:none; background:none; cursor:pointer; font-size:18px;">✖</button></span>`;
        cartList.appendChild(li);
        sum += item.price;
    });
    totalSumLabel.innerText = sum.toLocaleString();
    updateTableIndicator();
}

function updateTableIndicator() {
    const select = document.getElementById('table-number');
    for (let i = 0; i < select.options.length; i++) {
        let val = select.options[i].value;
        if (orders[val].length > 0) {
            select.options[i].text = val + " (⏳)";
        } else {
            select.options[i].text = val;
        }
    }
}

function completeSale() {
    const currentTableOrder = orders[activeTable];
    if (currentTableOrder.length === 0) return alert("Savat bo'sh!");
    
    if (confirm(`${activeTable} uchun to'lov qabul qilindimi?`)) {
        let saleData = {
            time: new Date().toISOString(), 
            items: [...currentTableOrder],
            total: currentTableOrder.reduce((a, b) => a + b.price, 0),
            tableName: activeTable
        };
        
        database.ref('sales').push(saleData).then(() => {
            alert("Sotuv muvaffaqiyatli saqlandi!");
            orders[activeTable] = []; 
            updateTotal();
        }).catch(err => alert("Xato: " + err.message));
    }
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

    // Tugmalarning vizual 'active' holatini yangilash
    const filterButtons = document.querySelectorAll('.filter-group button');
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        // Tugmadagi onclick matniga qarab tanlanganini aniqlash
        if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(`'${filter}'`)) {
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
        <div style="background: #f8f9fa; padding: 15px; border-radius: 12px; margin-bottom: 20px; border-left: 5px solid #28a745;">
            <span style="font-size: 11px; color: #888;">${currentFilterName} TUSHUM</span>
            <h2 style="color:#28a745; margin: 0;">${totalSum.toLocaleString()} so'm</h2>
        </div>`;

    let displayList = filteredSales.slice().reverse();
    let limit = 10;
    let listToRender = (!showAll && displayList.length > limit) ? displayList.slice(0, limit) : displayList;

    listToRender.forEach(s => {
        let itemNames = s.items ? s.items.map(i => i.name).join(", ") : "Noma'lum";
        let tableLabel = s.tableName || "Olib ketish";
        let timeStr = new Date(s.time).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });

        output += `
            <div style="background: #fff; border: 1px solid #eee; border-radius: 10px; padding: 12px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
                <div style="flex: 1;">
                    <span style="font-size: 11px; color: #aaa;">${timeStr} — <b style="color:#007bff">${tableLabel}</b></span><br>
                    <b style="font-size: 15px;">${s.total.toLocaleString()} so'm</b><br>
                    <div style="font-size: 12px; color: #777;">${itemNames}</div>
                </div>
                <button onclick="deleteSale('${s.id}')" style="background:none; border:none; cursor:pointer; font-size:18px;">🗑️</button>
            </div>`;
    });

    if (filteredSales.length > limit) {
        let btnText = showAll ? "Qisqartirish ↑" : `Barchasini ko'rsatish ↓`;
        output += `<button onclick="showStats('${filter}', ${!showAll})" style="width:100%; padding:10px; margin-top:5px; cursor:pointer; border: 1px solid #ddd; background: white; border-radius: 8px;">${btnText}</button>`;
    }
    statsOutput.innerHTML = output;
}

function deleteSale(saleId) {
    if (confirm("Ushbu sotuv o'chirilsinmi?")) {
        database.ref('sales/' + saleId).remove();
    }
}

function clearHistory() {
    if (confirm("DIQQAT! Barcha sotuvlar tarixi butunlay o'chib ketadi. Rozimisiz?")) {
        database.ref('sales').remove()
            .then(() => {
                alert("Barcha tarix tozalandi!");
                showStats('today'); 
            })
            .catch(err => alert("Xato: " + err.message));
    }
}

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