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
        { name: "Tandir tovuq 1", price: 50000 },
        { name: "Tandir tovuq 0.5", price: 25000 },
        { name: "Kfs (tovuq) 500GR", price: 43000 },
        { name: "Kfs (tovuq) 50000 so'm", price: 50000 },
        { name: "Kfs (tovuq) 60000 so'm", price: 60000 },
        { name: "Kfs (tovuq) 70000 so'm", price: 70000 },
        { name: "Kfs (tovuq) 1KG", price: 85000 }
    ],
    "Ichimliklar": [
        { name: "Tara 0.25L", price: 5000 },
        { name: "Suv gazsiz 0.5L", price: 3000 },
        { name: "Kofe 1 stakan", price: 5000 },
        { name: "Choy 1 stakan", price: 2000 },
        { name: "Choy 1 choynak", price: 5000 }
    ],
    "Shirinliklar": [
        { name: "Shirinlik 1 kusok", price: 10000 },
        { name: "Kartoshka fri 1 porsya", price: 10000 }
    ]
};

// 3. Global holat (State)
let orders = {
    "1-stol": [],
    "2-stol": [],
    "3-stol": [],
    "4-stol": [],
    "5-stol": [],
    "Olib ketish": []
};
let activeTable = "1-stol";
const adminPassword = "volk1111";

// DOM elementlar
const menuDiv = document.getElementById('menu-items');
const categoryDiv = document.getElementById('category-tabs');

// --- SAVDO QISMI ---

function switchTable() {
    const tableSelect = document.getElementById('table-number');
    activeTable = tableSelect.value;
    updateTotal(); // Bu funksiya avtomatik orders[activeTable] ni ko'rsatadi
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
    // 1. Hozirgi tanlangan stolni aniq elementdan qayta tekshirib olamiz
    const tableSelect = document.getElementById('table-number');
    activeTable = tableSelect.value; 

    const currentTableOrder = orders[activeTable];
    const paymentMethod = document.getElementById('payment-method').value;

    if (!currentTableOrder || currentTableOrder.length === 0) {
        return alert("Savat bo'sh!");
    }
    
    if (confirm(`${activeTable} uchun ${paymentMethod} orqali to'lov qabul qilindimi?`)) {
        let saleData = {
            time: new Date().toISOString(),
            items: [...currentTableOrder],
            total: currentTableOrder.reduce((a, b) => a + b.price, 0),
            tableName: activeTable, // Endi bu aniq tanlangan stolni oladi
            paymentMethod: paymentMethod 
        };
        
        database.ref('sales').push(saleData).then(() => {
            alert("Sotuv muvaffaqiyatli saqlandi! ✅");
            orders[activeTable] = []; // Faqat sotilgan stol savatini tozalaymiz
            updateTotal();
            if(typeof showStats === "function") showStats('today'); 
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

    // Tugmalar rangini yangilash
    const filterButtons = document.querySelectorAll('.filter-group button');
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(`'${filter}'`)) {
            btn.classList.add('active');
        }
    });

    // 1. Sotuvlarni olish
    database.ref('sales').once('value', (salesSnapshot) => {
        const salesData = salesSnapshot.val() || {};
        let sales = [];
        for (let key in salesData) sales.push({ id: key, ...salesData[key] });

        // 2. Rasxodlarni olish
        database.ref('expenses').once('value', (expSnapshot) => {
            const expData = expSnapshot.val() || {};
            let expenses = [];
            for (let key in expData) expenses.push({ id: key, ...expData[key] });

            let now = new Date();
            
            // Filtrlash mantiqi
            const filterFn = (item) => {
                let itemDate = new Date(item.time);
                if (filter === 'today') return itemDate.toDateString() === now.toDateString();
                if (filter === 'week') return (now - itemDate) / (1000 * 60 * 60 * 24) <= 7;
                if (filter === 'month') return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
                return true;
            };

            let filteredSales = sales.filter(filterFn);
            let filteredExpenses = expenses.filter(filterFn);

            renderStatsUI(filteredSales, filteredExpenses, filter, showAll);
        });
    });
}

function renderStatsUI(filteredSales, filteredExpenses, filter, showAll) {
    const statsOutput = document.getElementById('stats-output');
    
    // 1. Hisob-kitoblar
    let totalCash = filteredSales
        .filter(s => s.paymentMethod === 'naqd' || !s.paymentMethod)
        .reduce((sum, s) => sum + s.total, 0);

    let totalCard = filteredSales
        .filter(s => s.paymentMethod === 'karta')
        .reduce((sum, s) => sum + s.total, 0);

    let totalSales = totalCash + totalCard;
    let totalExp = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    let netProfit = totalSales - totalExp;

    const filterNames = { 'today': 'BUGUNGI', 'week': 'HAFTALIK', 'month': 'OYLIK', 'all': 'UMUMIY' };
    let currentFilterName = filterNames[filter] || filter.toUpperCase();

    // 2. Vidjet - Eng tepada Naqd va Karta ko'rinadi
    let output = `
        <div style="background: #f8f9fa; padding: 15px; border-radius: 12px; margin-bottom: 20px; border: 1px solid #eee;">
            <div style="font-size: 11px; color: #888; margin-bottom: 10px; text-align: center; font-weight:bold;">${currentFilterName} QISQA HISOBOT</div>
            
            <div style="display:flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #444;">💵 Naqd pul:</span>
                <b>${totalCash.toLocaleString()} so'm</b>
            </div>
            
            <div style="display:flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #007bff;">💳 Karta orqali:</span>
                <b>${totalCard.toLocaleString()} so'm</b>
            </div>

            <div style="display:flex; justify-content: space-between; margin-bottom: 8px; border-top: 1px solid #ddd; pt-5; margin-top:5px;">
                <span style="color: #28a745; font-weight:bold;">💰 Jami Savdo:</span>
                <b style="color: #28a745;">${totalSales.toLocaleString()}</b>
            </div>

            <div style="display:flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #dc3545;">💸 Jami Rasxod:</span>
                <b style="color: #dc3545;">${totalExp.toLocaleString()}</b>
            </div>

            <hr style="border: 0; border-top: 1px dashed #ccc;">
            
            <div style="display:flex; justify-content: space-between; font-size: 18px; margin-top: 5px;">
                <span style="font-weight:bold;">💵 Sof Foyda:</span>
                <b style="color: #007bff;">${netProfit.toLocaleString()} so'm</b>
            </div>
        </div>
    `;

    // 3. Xarajatlar ro'yxati (Tepadan keyin keladi)
    output += `<h4 style="margin-bottom:10px;">Xarajatlar tafsiloti:</h4>`;
    if (filteredExpenses.length === 0) {
        output += `<p style="color:#888; font-size:12px;">Rasxodlar yo'q.</p>`;
    } else {
        filteredExpenses.slice().reverse().forEach(e => {
            output += `
                <div style="background: #fff5f5; border: 1px solid #ffebeb; padding: 10px; border-radius: 8px; margin-bottom: 8px; border-left: 4px solid #dc3545; display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <b style="font-size:14px;">${e.reason}</b><br>
                        <small style="color:#999;">${new Date(e.time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</small>
                    </div>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <b style="color:#dc3545;">-${e.amount.toLocaleString()}</b>
                        <button onclick="deleteExpense('${e.id}')" style="background:none; border:none; cursor:pointer; font-size:16px;">🗑️</button>
                    </div>
                </div>`;
        });
    }

    // 4. Savdolar ro'yxati (Eng oxirida)
    output += `<h4 style="margin-top:20px;">Savdolar tafsiloti:</h4>`;
    let displayList = filteredSales.slice().reverse();
    let limit = 10;
    let listToRender = (!showAll && displayList.length > limit) ? displayList.slice(0, limit) : displayList;

    listToRender.forEach(s => {
        let timeStr = new Date(s.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        let pMethodIcon = s.paymentMethod === 'karta' ? '💳' : '💵';
        
        output += `
            <div style="background: #fff; border: 1px solid #eee; border-radius: 10px; padding: 12px; margin-bottom: 8px; border-left: 4px solid #007bff; display:flex; justify-content:space-between; align-items:center;">
                <div style="flex:1;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                        <span style="font-size: 12px; color: #aaa;">${timeStr} - <b>${s.tableName}</b> ${pMethodIcon}</span>
                        <b style="color:#333;">${s.total.toLocaleString()} so'm</b>
                    </div>
                    <div style="font-size: 12px; color: #777;">${s.items ? s.items.map(i => i.name).join(", ") : "Noma'lum"}</div>
                </div>
                <button onclick="deleteSale('${s.id}')" style="background:none; border:none; cursor:pointer; font-size:18px; margin-left:10px;">🗑️</button>
            </div>`;
    });

    if (filteredSales.length > limit) {
        let btnText = showAll ? "Qisqartirish ↑" : "Barchasini ko'rsatish ↓";
        output += `<button onclick="showStats('${filter}', ${!showAll})" style="width:100%; padding:10px; margin-top:5px; cursor:pointer; background:#f0f0f0; border:none; border-radius:8px; font-weight:500;">${btnText}</button>`;
    }

    statsOutput.innerHTML = output;
}

// O'chirish funksiyalari
function deleteSale(id) {
    if (confirm("Ushbu savdo tarixdan o'chirilsinmi?")) {
        database.ref('sales/' + id).remove().then(() => showStats());
    }
}

function deleteExpense(id) {
    if (confirm("Ushbu xarajat o'chirilsinmi?")) {
        database.ref('expenses/' + id).remove().then(() => showStats());
    }
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
// Modalni ochish va yopish
function openExpenseModal() {
    document.getElementById('expense-modal').style.display = 'flex';
}
function closeExpenseModal() {
    document.getElementById('expense-modal').style.display = 'none';
    document.getElementById('exp-amount').value = '';
    document.getElementById('exp-reason').value = '';
}

// Rasxodni Firebase-ga saqlash
function saveExpense() {
    const amount = document.getElementById('exp-amount').value;
    const reason = document.getElementById('exp-reason').value;

    if (!amount || !reason) return alert("Hamma maydonni toldiring!");

    const expenseData = {
        amount: parseInt(amount),
        reason: reason,
        time: new Date().toISOString()
    };

    database.ref('expenses').push(expenseData).then(() => {
        alert("Xarajat saqlandi!");
        closeExpenseModal();
    }).catch(err => alert("Xato: " + err.message));
}
const telegramConfig = {
    token: "8232650087:AAEQtCj3DkXlrb8NxdeGPyklgbJamyD4Hy8", 
    adminChatId: "983089996"
};

async function sendDailyReportToTelegram() {
    // 1. Ma'lumotlarni bazadan olish
    database.ref('sales').once('value', async (snapshot) => {
        const salesData = snapshot.val() || {};
        
        // Rasxodlarni ham parallel ravishda olamiz
        const expSnapshot = await database.ref('expenses').once('value');
        const expData = expSnapshot.val() || {};

        let sales = Object.values(salesData);
        let expenses = Object.values(expData);

        let now = new Date();
        let todayStr = now.toDateString();

        // 2. Faqat bugungi ma'lumotlarni saralash
        let todaySales = sales.filter(s => new Date(s.time).toDateString() === todayStr);
        let todayExp = expenses.filter(e => new Date(e.time).toDateString() === todayStr);

        // 3. To'lov turlari bo'yicha hisoblash
        let totalCash = todaySales
            .filter(s => s.paymentMethod === 'naqd' || !s.paymentMethod) // paymentMethod bo'lmasa 'naqd' deb olamiz
            .reduce((sum, s) => sum + s.total, 0);

        let totalCard = todaySales
            .filter(s => s.paymentMethod === 'karta')
            .reduce((sum, s) => sum + s.total, 0);

        let totalSum = totalCash + totalCard; // Umumiy tushum
        let totalExpAmount = todayExp.reduce((sum, e) => sum + e.amount, 0); // Jami rasxod
        let netProfit = totalSum - totalExpAmount; // Sof foyda

        // 4. Telegram xabari matni (Markdown formatida)
        let message = `📊 *BUGUNGI YAKUNIY HISOBOT*\n`;
        message += `📅 Sana: ${now.toLocaleDateString('uz-UZ')}\n`;
        message += `━━━━━━━━━━━━━━━\n`;
        message += `💵 Naqd tushum: *${totalCash.toLocaleString()} so'm*\n`;
        message += `💳 Karta orqali: *${totalCard.toLocaleString()} so'm*\n`;
        message += `💰 Jami Savdo: *${totalSum.toLocaleString()} so'm*\n`;
        message += `━━━━━━━━━━━━━━━\n`;
        message += `💸 Jami Rasxod: *${totalExpAmount.toLocaleString()} so'm*\n`;
        message += `━━━━━━━━━━━━━━━\n`;
        message += `💵 *SOF FOYDA: ${netProfit.toLocaleString()} so'm*\n\n`;
        message += `🛒 Sotuvlar soni: ${todaySales.length} ta\n`;
        message += `🚀 Bigburger App tizimi`;

        // 5. Telegram API orqali yuborish
        const url = `https://api.telegram.org/bot${telegramConfig.token}/sendMessage`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: telegramConfig.adminChatId,
                    text: message,
                    parse_mode: "Markdown"
                })
            });

            const result = await response.json();

            if (response.ok) {
                alert("Hisobot Telegramga yuborildi! ✅");
            } else {
                console.error("Telegram error:", result);
                alert("Xato: " + (result.description || "Yuborib bo'lmadi"));
            }
        } catch (err) {
            console.error("Fetch error:", err);
            alert("Internet aloqasini tekshiring!");
        }
    });
}
// Ishga tushirish
renderCategories();
renderMenu("all");