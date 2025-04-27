// Variáveis globais
let cart = JSON.parse(localStorage.getItem('batburger-cart')) || [];
let map;
let marker;
let menuItems = [
    {
        id: 1,
        name: "Hambúrguer do Robin",
        description: "Pão, bife, alface, tomate, milho e batata palha.",
        price: 18.90,
        image: "https://github.com/NFCBonifacio/BATBURGER/blob/main/hamburguer.png?raw=true",
        category: "classico"
    },
    {
        id: 2,
        name: "X-Batman",
        description: "Pão, bife, queijo, batata palha, milho, alface e tomate.",
        price: 22.90,
        image: "https://github.com/NFCBonifacio/BATBURGER/blob/main/xburguer.png?raw=true",
        category: "classico"
    },
    {
        id: 3,
        name: "X-Egg do Coringa",
        description: "Pão, bife, queijo, ovo, batata palha, milho e tomate.",
        price: 24.90,
        image: "https://github.com/NFCBonifacio/BATBURGER/blob/main/xegg.png?raw=true",
        category: "classico"
    },
    {
        id: 4,
        name: "X-Bacon do Alfred",
        description: "Pão, bife, queijo, bacon, batata palha, milho, alface e tomate.",
        price: 26.90,
        image: "https://github.com/NFCBonifacio/BATBURGER/blob/main/xbacon.png?raw=true",
        category: "especial"
    },
    {
        id: 5,
        name: "X-Egg Bacon do Asa Noturna",
        description: "Pão, bife, queijo, bacon, ovo, batata palha, milho, alface e tomate.",
        price: 28.90,
        image: "https://github.com/NFCBonifacio/BATBURGER/blob/main/eggbacon.png?raw=true",
        category: "especial"
    },
    {
        id: 6,
        name: "X-Tudo do Cavaleiro das Trevas",
        description: "Pão, bife, calabresa, ovo, bacon, presunto, alface, banana, tomate, milho, batata palha e molho especial.",
        price: 32.90,
        image: "https://github.com/NFCBonifacio/BATBURGER/blob/main/xtudo.png?raw=true",
        category: "especial"
    },
    {
        id: 7,
        name: "X-Picanha 90g do Comissário Gordon",
        description: "Pão, bife de picanha 90g, calabresa, ovo, presunto, alface, tomate, milho, banana, batata palha e molho especial.",
        price: 34.90,
        image: "https://github.com/NFCBonifacio/BATBURGER/blob/main/picanha90.png?raw=true",
        category: "picanha"
    },
    {
        id: 8,
        name: "X-Picanha 140g do Batman",
        description: "Pão, bife de 140g, presunto, ovo, calabresa, banana, bacon, alface, tomate, milho, batata palha e molho especial.",
        price: 38.90,
        image: "https://github.com/NFCBonifacio/BATBURGER/blob/main/picanha140.png?raw=true",
        category: "picanha"
    }
];

// Inicialização quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    initMap();
    renderMenuItems();
    updateCart();
    setupDarkMode();
});

// Configura o modo noturno
function setupDarkMode() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const isDarkMode = localStorage.getItem('batburger-darkMode') === 'true';
    
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        darkModeToggle.innerHTML = '<i class="fas fa-sun"></i> Modo Claro';
    }
    
    darkModeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('batburger-darkMode', isDark);
        
        if (isDark) {
            darkModeToggle.innerHTML = '<i class="fas fa-sun"></i> Modo Claro';
        } else {
            darkModeToggle.innerHTML = '<i class="fas fa-moon"></i> Modo Noturno';
        }
    });
}

// Inicializa o mapa
function initMap() {
    // Coordenadas centrais de Nanuque
    map = L.map('map').setView([-17.8399, -40.3539], 14);
    
    // Camada do mapa (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18
    }).addTo(map);
    
    // Marcador inicial
    marker = L.marker([-17.8399, -40.3539], {
        title: "BatBurger Nanuque",
        alt: "Localização do BatBurger",
        riseOnHover: true
    }).addTo(map);
    
    marker.bindPopup("<b>BatBurger Nanuque</b><br>Seu pedido será entregue aqui!").openPopup();
}

// Atualiza o mapa com o endereço do cliente
function updateMap() {
    const endereco = document.getElementById("endereco").value;
    
    if (endereco) {
        showLoading("Atualizando mapa...");
        
        // Simulação - em produção, use um serviço de geocodificação como Nominatim
        setTimeout(() => {
            // Mover marcador para posição aleatória próxima (simulação)
            const lat = -17.8399 + (Math.random() * 0.01 - 0.005);
            const lng = -40.3539 + (Math.random() * 0.01 - 0.005);
            marker.setLatLng([lat, lng]);
            map.setView([lat, lng], 15);
            marker.bindPopup(`<b>${endereco}</b><br>Confirme seu endereço`).openPopup();
            hideLoading();
            
            // Em produção real, você usaria algo como:
            // fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}`)
            // .then(response => response.json())
            // .then(data => {
            //     if (data.length > 0) {
            //         const lat = parseFloat(data[0].lat);
            //         const lon = parseFloat(data[0].lon);
            //         marker.setLatLng([lat, lon]);
            //         map.setView([lat, lon], 15);
            //         marker.bindPopup(`<b>${endereco}</b>`).openPopup();
            //     }
            //     hideLoading();
            // });
        }, 1000);
    } else {
        alert("Por favor, insira seu endereço primeiro!");
    }
}

// Renderiza os itens do menu
function renderMenuItems() {
    const menuContainer = document.getElementById('menu-items');
    menuContainer.innerHTML = '';
    
    menuItems.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'item';
        itemElement.dataset.category = item.category;
        itemElement.dataset.name = item.name.toLowerCase();
        
        itemElement.innerHTML = `
            <div class="item-img" style="background-image: url('${item.image}')"></div>
            <h3>${item.name}</h3>
            <p>${item.description}</p>
            <span class="price">R$ ${item.price.toFixed(2)}</span>
            <button onclick="addToCart(${item.id})">PEDIR AGORA</button>
        `;
        
        menuContainer.appendChild(itemElement);
    });
}

// Filtra os itens do menu
function filterItems() {
    const searchTerm = document.getElementById('search').value.toLowerCase();
    const category = document.getElementById('category-filter').value;
    
    const items = document.querySelectorAll('.item');
    
    items.forEach(item => {
        const itemCategory = item.dataset.category;
        const itemName = item.dataset.name;
        const matchesSearch = itemName.includes(searchTerm);
        const matchesCategory = category === 'all' || itemCategory === category;
        
        if (matchesSearch && matchesCategory) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Adiciona item ao carrinho
function addToCart(itemId) {
    const item = menuItems.find(i => i.id === itemId);
    if (!item) return;
    
    // Verifica se o item já está no carrinho
    const existingItem = cart.find(i => i.id === itemId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: 1
        });
    }
    
    updateCart();
    showNotification(`${item.name} adicionado ao carrinho!`);
}

// Remove item do carrinho
function removeFromCart(index) {
    const removedItem = cart[index];
    cart.splice(index, 1);
    updateCart();
    showNotification(`${removedItem.name} removido do carrinho`, 'warning');
}

// Atualiza a exibição do carrinho
function updateCart() {
    const cartList = document.getElementById('cart-items');
    const totalElement = document.getElementById('total');
    const cartCount = document.getElementById('cart-count');
    const cartEmpty = document.getElementById('cart-empty');
    
    cartList.innerHTML = '';
    let total = 0;
    
    if (cart.length === 0) {
        cartEmpty.style.display = 'block';
        cartCount.textContent = '(0)';
    } else {
        cartEmpty.style.display = 'none';
        cartCount.textContent = `(${cart.reduce((acc, item) => acc + item.quantity, 0)})`;
        
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${item.name} x${item.quantity}</span>
                <span>R$ ${itemTotal.toFixed(2)}</span>
                <button class="remove-btn" onclick="removeFromCart(${index})" title="Remover">
                    <i class="fas fa-times"></i>
                </button>
            `;
            cartList.appendChild(li);
        });
    }
    
    totalElement.textContent = `Total: R$ ${total.toFixed(2)}`;
    localStorage.setItem('batburger-cart', JSON.stringify(cart));
}

// Envia o pedido para o WhatsApp
function sendOrder() {
    const nome = document.getElementById('nome').value.trim();
    const endereco = document.getElementById('endereco').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    
    // Validações
    if (cart.length === 0) {
        showNotification('🦇 O carrinho está vazio! Adicione itens do BatMenu!', 'error');
        return;
    }
    
    if (!nome || !endereco || !telefone) {
        showNotification('Por favor, preencha todos os dados de entrega!', 'error');
        return;
    }
    
    // Formata o número de telefone (remove caracteres não numéricos)
    const formattedPhone = telefone.replace(/\D/g, '');
    
    // Monta a mensagem
    let message = "🦇 *PEDIDO DO BATBURGER* 🍔\n\n";
    message += `*Cliente:* ${nome}\n`;
    message += `*Endereço:* ${endereco}\n`;
    message += `*Telefone:* ${telefone}\n\n`;
    message += "*Itens do Pedido:*\n`;
    
    let total = 0;
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        message += `✔ ${item.name} x${item.quantity} - R$ ${itemTotal.toFixed(2)}\n`;
        total += itemTotal;
    });
    
    message += `\n💰 *Total: R$ ${total.toFixed(2)}*`;
    message += "\n\n🔔 *Observações:* ________________";
    
    // Abre o WhatsApp
    const whatsappUrl = `https://wa.me/55${formattedPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// Mostra notificação
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// Mostra loading
function showLoading(text = 'Carregando...') {
    const loading = document.createElement('div');
    loading.className = 'loading active';
    loading.innerHTML = `
        <div class="loading-spinner"></div>
        <div class="loading-text">${text}</div>
    `;
    document.body.appendChild(loading);
}

// Esconde loading
function hideLoading() {
    const loading = document.querySelector('.loading');
    if (loading) {
        loading.classList.remove('active');
        setTimeout(() => loading.remove(), 500);
    }
}

// Adiciona estilos dinâmicos para notificações
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
.notification {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 15px 25px;
    border-radius: 5px;
    color: white;
    font-weight: bold;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
}

.notification.success {
    background: #4CAF50;
    border-left: 5px solid #2E7D32;
}

.notification.warning {
    background: #FF9800;
    border-left: 5px solid #F57C00;
}

.notification.error {
    background: #F44336;
    border-left: 5px solid #D32F2F;
}

.notification.fade-out {
    animation: fadeOut 0.5s ease-out forwards;
}

@keyframes slideIn {
    from { bottom: -50px; opacity: 0; }
    to { bottom: 20px; opacity: 1; }
}

@keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
}
`;
document.head.appendChild(notificationStyles);
