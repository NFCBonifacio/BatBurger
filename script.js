let cart = JSON.parse(localStorage.getItem('batburger-cart')) || [];

// Atualiza o carrinho quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    updateCart();
});

// Adiciona item ao carrinho
function addToCart(name, price) {
    // Verifica se o item já está no carrinho
    const existingItem = cart.find(item => item.name === name);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: name,
            price: price,
            quantity: 1
        });
    }
    
    updateCart();
    showNotification(`${name} adicionado ao carrinho!`);
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
    message += "*Itens do Pedido:*\n";
    
    let total = 0;
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        message += `✔ ${item.name} x${item.quantity} - R$ ${itemTotal.toFixed(2)}\n`;
        total += itemTotal;
    });
    
    message += `\n💰 *Total: R$ ${total.toFixed(2)}*`;
    message += "\n\n🔔 *Observações:* ________________";
    
    // Abre o WhatsApp
    const whatsappUrl = `https://wa.me/5533998351903}?text=${encodeURIComponent(message)}`;
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
