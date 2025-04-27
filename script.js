let cart = [];
let map;
let marker;

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

// Atualiza o mapa (simulação)
function updateMap() {
    const endereco = document.getElementById("endereco").value;
    
    if (endereco) {
        // Simulação - em produção, use um serviço de geocodificação
        alert("Endereço atualizado no mapa! (Simulação)\nNa implementação real, isso mostraria a localização exata.");
        
        // Mover marcador para posição aleatória próxima (simulação)
        const lat = -17.8399 + (Math.random() * 0.01 - 0.005);
        const lng = -40.3539 + (Math.random() * 0.01 - 0.005);
        marker.setLatLng([lat, lng]);
        map.setView([lat, lng], 15);
        marker.bindPopup(`<b>${endereco}</b><br>Confirme seu endereço`).openPopup();
    } else {
        alert("Por favor, insira seu endereço primeiro!");
    }
}

// Funções do carrinho
function addToCart(name, price) {
    cart.push({ name, price });
    updateCart();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
}

function updateCart() {
    const cartList = document.getElementById("cart-items");
    const totalElement = document.getElementById("total");

    cartList.innerHTML = "";
    let total = 0;

    cart.forEach((item, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span>${item.name}</span>
            <span>R$ ${item.price.toFixed(2)}</span>
            <button class="remove-btn" onclick="removeFromCart(${index})">✕</button>
        `;
        cartList.appendChild(li);
        total += item.price;
    });

    totalElement.textContent = `Total: R$ ${total.toFixed(2)}`;
}

function sendOrder() {
    const nome = document.getElementById("nome").value;
    const endereco = document.getElementById("endereco").value;
    const telefone = document.getElementById("telefone").value;

    if (cart.length === 0) {
        alert("🦇 O carrinho está vazio! Adicione itens do BatMenu!");
        return;
    }

    if (!nome || !endereco || !telefone) {
        alert("Por favor, preencha todos os dados de entrega!");
        return;
    }

    let message = "🦇 *PEDIDO DO BATBURGER* 🍔\n\n";
    message += `*Cliente:* ${nome}\n`;
    message += `*Endereço:* ${endereco}\n`;
    message += `*Telefone:* ${telefone}\n\n`;
    message += "*Itens do Pedido:*\n";

    let total = 0;
    cart.forEach(item => {
        message += `✔ ${item.name} - R$ ${item.price.toFixed(2)}\n`;
        total += item.price;
    });

    message += `\n💰 *Total: R$ ${total.toFixed(2)}*`;
    message += "\n\n🔔 *Observações:* ________________";

    const whatsappUrl = `https://wa.me/5533998351903?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
}

// Inicializa o mapa quando a página carrega
window.onload = initMap;
