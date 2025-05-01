document.addEventListener('DOMContentLoaded', function() {
    // Variáveis globais
    let cart = [];
    let orderCount = 0;
    const cartItems = document.getElementById('cart-items');
    const cartEmpty = document.getElementById('cart-empty');
    const cartCount = document.getElementById('cart-count');
    const orderCountElement = document.getElementById('order-count');
    const totalElement = document.getElementById('total');
    const pixTotalElement = document.getElementById('pix-total');
    const paymentOptions = document.getElementsByName('payment');
    const trocoField = document.getElementById('troco-field');
    const pixArea = document.getElementById('pix-area');
    const backToTopButton = document.getElementById('back-to-top');
    const dinheiroOption = document.getElementById('dinheiro');
    
    // Verificar se é depois da meia-noite
    const now = new Date();
    const currentHour = now.getHours();
    
    // Desativar pagamento em dinheiro após meia-noite (0 horas)
    if (currentHour >= 0 && currentHour < 6) {
        dinheiroOption.disabled = true;
        dinheiroOption.nextElementSibling.style.opacity = '0.5';
        dinheiroOption.nextElementSibling.style.cursor = 'not-allowed';
    }
    
    // Inicializar contador de pedidos com um valor aleatório para simular atividade
    orderCount = Math.floor(Math.random() * 50) + 10;
    updateOrderCount();
    
    // Configurar listeners para os métodos de pagamento
    paymentOptions.forEach(option => {
        option.addEventListener('change', function() {
            if (this.value === 'dinheiro') {
                trocoField.style.display = 'block';
                pixArea.style.display = 'none';
            } else if (this.value === 'pix') {
                trocoField.style.display = 'none';
                pixArea.style.display = 'block';
                updatePixQRCode();
            }
        });
    });
    
    // Botão voltar ao topo
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopButton.style.display = 'flex';
        } else {
            backToTopButton.style.display = 'none';
        }
    });
    
    backToTopButton.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // Animação dos itens do cardápio
    const menuItems = document.querySelectorAll('.item');
    menuItems.forEach(item => {
        const order = item.style.getPropertyValue('--order');
        item.style.animationDelay = `${order * 0.1}s`;
    });

    // Inicializar carrinho
    updateCartDisplay();
});

// Função para adicionar item ao carrinho
function addToCart(itemName, itemPrice) {
    const cart = getCart();
    const existingItem = cart.find(item => item.name === itemName);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: itemName,
            price: itemPrice,
            quantity: 1
        });
    }
    
    saveCart(cart);
    updateCartDisplay();
    updateOrderCount();
    showNotification(`${itemName} adicionado ao carrinho!`, 'success');
}

// Função para remover item do carrinho
function removeFromCart(itemName) {
    let cart = getCart();
    cart = cart.filter(item => item.name !== itemName);
    saveCart(cart);
    updateCartDisplay();
    showNotification(`${itemName} removido do carrinho`, 'warning');
}

// Função para atualizar a exibição do carrinho
function updateCartDisplay() {
    const cart = getCart();
    const cartItems = document.getElementById('cart-items');
    const cartEmpty = document.getElementById('cart-empty');
    const cartCount = document.getElementById('cart-count');
    const totalElement = document.getElementById('total');
    const pixTotalElement = document.getElementById('pix-total');
    
    // Limpar o carrinho
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartEmpty.style.display = 'block';
        cartCount.textContent = '(0)';
        totalElement.textContent = 'Total: R$ 0,00';
        pixTotalElement.textContent = 'R$ 0,00';
    } else {
        cartEmpty.style.display = 'none';
        
        // Calcular total
        let total = 0;
        let itemCount = 0;
        
        // Adicionar itens ao carrinho
        cart.forEach(item => {
            const li = document.createElement('li');
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            itemCount += item.quantity;
            
            li.innerHTML = `
                <span>${item.name} x${item.quantity}</span>
                <span>R$ ${itemTotal.toFixed(2)}</span>
                <button class="remove-btn" onclick="removeFromCart('${item.name}')" aria-label="Remover ${item.name} do carrinho">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            cartItems.appendChild(li);
        });
        
        // Atualizar contador e total
        cartCount.textContent = `(${itemCount})`;
        totalElement.textContent = `Total: R$ ${total.toFixed(2)}`;
        pixTotalElement.textContent = `R$ ${total.toFixed(2)}`;
    }
}

// Função para atualizar o contador de pedidos
function updateOrderCount() {
    const cart = getCart();
    const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
    
    // Atualizar apenas se houver novos itens
    if (itemCount > 0) {
        const orderCountElement = document.getElementById('order-count');
        let currentCount = parseInt(orderCountElement.textContent);
        const newCount = currentCount + itemCount;
        
        // Animação de contagem
        const interval = setInterval(() => {
            if (currentCount < newCount) {
                currentCount++;
                orderCountElement.textContent = currentCount;
            } else {
                clearInterval(interval);
            }
        }, 100);
    }
}

// Função para atualizar o QR Code do PIX
function updatePixQRCode() {
    const cart = getCart();
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const pixQrCode = document.getElementById('pix-qrcode');
    
    // Limpar QR Code anterior
    pixQrCode.innerHTML = '';
    
    if (total > 0) {
        const pixPayload = {
            chave: 'morcegoburgers@gmail.com',
            valor: total.toFixed(2),
            descricao: 'BatBurger - Pedido de Lanches',
            merchant: 'BatBurger Lanches',
            cidade: 'Gotham City'
        };
        
        // Gerar QR Code com a chave por email
        new QRCode(pixQrCode, {
            text: `00020126580014BR.GOV.BCB.PIX0136${pixPayload.chave}520400005303986540${pixPayload.valor}5802BR59${pixPayload.merchant.substring(0,25)}60${pixPayload.cidade.substring(0,15)}62070503***6304`,
            width: 180,
            height: 180,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    }
}

// Função para copiar a chave PIX
function copyPixKey() {
    const tempInput = document.createElement('input');
    tempInput.value = 'morcegoburgers@gmail.com';
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    showNotification('Chave PIX copiada! Cole no seu app de banco.', 'success');
}

// Função para confirmar pagamento PIX
function confirmPixPayment() {
    const cart = getCart();
    if (cart.length === 0) {
        showNotification('Seu carrinho está vazio!', 'error');
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const nome = document.getElementById('nome').value;
    
    if (!nome) {
        showNotification('Por favor, informe seu nome antes de confirmar o pagamento', 'error');
        return;
    }
    
    showNotification(`Pagamento de R$ ${total.toFixed(2)} confirmado! Seu pedido está sendo preparado.`, 'success');
    
    // Aqui você pode adicionar lógica para:
    // 1. Enviar notificação para o administrador
    // 2. Registrar o pedido no sistema
    // 3. Limpar o carrinho
    saveCart([]);
    updateCartDisplay();
}

// Função para mostrar notificações
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Remover notificação após 3 segundos
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 3000);
}

// Funções para manipulação do carrinho no localStorage
function getCart() {
    const cartJson = localStorage.getItem('batburger-cart');
    return cartJson ? JSON.parse(cartJson) : [];
}

function saveCart(cart) {
    localStorage.setItem('batburger-cart', JSON.stringify(cart));
}
