document.addEventListener('DOMContentLoaded', function() {
    // Verifica se está aberto (Quarta a Domingo, 20h-3h)
    checkOpenStatus();
    
    // Atualiza contador de pedidos
    updateOrderCounter();
    
    // Configura eventos
    setupEventListeners();
    
    // Inicializa carrinho
    initCart();
    
    // Configura botão de voltar ao topo
    setupBackToTopButton();
    
    // Anima itens do menu
    animateMenuItems();
});

function checkOpenStatus() {
    const now = new Date();
    const day = now.getDay(); // 0=Domingo, 1=Segunda, ..., 6=Sábado
    const hour = now.getHours();
    
    // Fechado às segundas e terças
    if (day === 1 || day === 2) {
        showClosedMessage();
        return;
    }
    
    // Horário de funcionamento: 20h às 3h
    if ((hour < 20 && hour >= 3) || hour < 3) {
        // Se for depois das 3h e antes das 20h, está fechado
        if (day === 0 && hour >= 3 && hour < 20) { // Domingo após 3h
            showClosedMessage();
        } else if (day === 3 && hour < 20) { // Quarta antes das 20h
            showClosedMessage();
        }
    }
    
    // Verifica se é depois da meia-noite para mostrar aviso de taxa noturna
    if (hour >= 0 && hour < 3) {
        showNightFeeWarning();
    }
}

function showClosedMessage() {
    const closedMsg = document.getElementById('closed-message');
    const orderButtons = document.querySelectorAll('.menu button');
    const checkoutBtn = document.querySelector('.checkout-btn');
    
    closedMsg.style.display = 'block';
    orderButtons.forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
    });
    checkoutBtn.disabled = true;
    checkoutBtn.style.opacity = '0.5';
    checkoutBtn.style.cursor = 'not-allowed';
}

function showNightFeeWarning() {
    const warning = document.getElementById('payment-warning');
    const cashOption = document.getElementById('dinheiro');
    
    warning.style.display = 'block';
    cashOption.disabled = true;
    cashOption.nextElementSibling.style.opacity = '0.5';
}

function updateOrderCounter() {
    // Simula contagem de pedidos (poderia ser buscado de um backend)
    const orderCount = Math.floor(Math.random() * 50) + 10;
    document.getElementById('order-count').textContent = orderCount;
    
    // Atualiza a cada minuto
    setInterval(() => {
        const currentCount = parseInt(document.getElementById('order-count').textContent);
        document.getElementById('order-count').textContent = currentCount + Math.floor(Math.random() * 3);
    }, 60000);
}

function setupEventListeners() {
    // Forma de pagamento
    document.querySelectorAll('input[name="payment"]').forEach(radio => {
        radio.addEventListener('change', function() {
            updatePaymentFields();
        });
    });
    
    // Botão copiar chave PIX
    if (document.querySelector('.copy-pix-btn')) {
        document.querySelector('.copy-pix-btn').addEventListener('click', copyPixKey);
    }
    
    // Observa mudanças no carrinho para atualizar totais
    const observer = new MutationObserver(updateCartTotal);
    const cartItems = document.getElementById('cart-items');
    if (cartItems) {
        observer.observe(cartItems, { childList: true, subtree: true });
    }
}

function updatePaymentFields() {
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    const trocoField = document.getElementById('troco-field');
    const pixArea = document.getElementById('pix-area');
    
    if (paymentMethod === 'dinheiro') {
        trocoField.style.display = 'block';
        pixArea.style.display = 'none';
    } else if (paymentMethod === 'pix') {
        trocoField.style.display = 'none';
        pixArea.style.display = 'block';
        updatePixTotal();
    } else {
        trocoField.style.display = 'none';
        pixArea.style.display = 'none';
    }
}

function copyPixKey() {
    const pixKey = document.getElementById('pix-key').textContent;
    navigator.clipboard.writeText(pixKey).then(() => {
        const btn = document.querySelector('.copy-pix-btn');
        btn.innerHTML = '<i class="fas fa-check"></i> Chave copiada!';
        btn.style.backgroundColor = '#4CAF50';
        btn.style.borderColor = '#4CAF50';
        
        setTimeout(() => {
            btn.innerHTML = '<i class="far fa-copy"></i> Copiar Chave PIX';
            btn.style.backgroundColor = '#32BCAD';
            btn.style.borderColor = '#32BCAD';
        }, 2000);
    });
}

function initCart() {
    const cart = JSON.parse(localStorage.getItem('batburger_cart')) || [];
    if (cart.length > 0) {
        renderCartItems(cart);
        updateCartTotal();
    }
}

function addToCart(itemName, itemPrice) {
    let cart = JSON.parse(localStorage.getItem('batburger_cart')) || [];
    
    // Verifica se o item já está no carrinho
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
    
    // Salva no localStorage
    localStorage.setItem('batburger_cart', JSON.stringify(cart));
    
    // Atualiza a exibição do carrinho
    renderCartItems(cart);
    updateCartTotal();
    
    // Animação de confirmação
    const button = event.target;
    button.innerHTML = '<i class="fas fa-check"></i> ADICIONADO';
    button.style.backgroundColor = '#4CAF50';
    button.style.borderColor = '#4CAF50';
    
    setTimeout(() => {
        button.textContent = 'PEDIR AGORA';
        button.style.backgroundColor = '';
        button.style.borderColor = '';
    }, 1000);
}

function renderCartItems(cart) {
    const cartItemsEl = document.getElementById('cart-items');
    const cartEmptyEl = document.getElementById('cart-empty');
    
    if (cart.length === 0) {
        cartItemsEl.innerHTML = '';
        cartEmptyEl.style.display = 'block';
        document.getElementById('cart-count').textContent = '(0)';
        return;
    }
    
    cartEmptyEl.style.display = 'none';
    cartItemsEl.innerHTML = '';
    
    cart.forEach(item => {
        const li = document.createElement('li');
        li.className = 'cart-item';
        
        li.innerHTML = `
            <span class="cart-item-name">${item.name}</span>
            <div class="quantity-control">
                <button class="quantity-btn" onclick="changeQuantity('${item.name}', -1)" aria-label="Reduzir quantidade">-</button>
                <span class="quantity-value">${item.quantity}</span>
                <button class="quantity-btn" onclick="changeQuantity('${item.name}', 1)" aria-label="Aumentar quantidade">+</button>
            </div>
            <span class="cart-item-price">R$ ${(item.price * item.quantity).toFixed(2)}</span>
            <button class="remove-btn" onclick="removeFromCart('${item.name}')" aria-label="Remover item">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        cartItemsEl.appendChild(li);
    });
    
    document.getElementById('cart-count').textContent = `(${cart.reduce((total, item) => total + item.quantity, 0)})`;
}

function changeQuantity(itemName, change) {
    let cart = JSON.parse(localStorage.getItem('batburger_cart')) || [];
    const itemIndex = cart.findIndex(item => item.name === itemName);
    
    if (itemIndex !== -1) {
        cart[itemIndex].quantity += change;
        
        // Remove se quantidade for zero ou menos
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
        }
        
        localStorage.setItem('batburger_cart', JSON.stringify(cart));
        renderCartItems(cart);
        updateCartTotal();
    }
}

function removeFromCart(itemName) {
    let cart = JSON.parse(localStorage.getItem('batburger_cart')) || [];
    cart = cart.filter(item => item.name !== itemName);
    
    localStorage.setItem('batburger_cart', JSON.stringify(cart));
    renderCartItems(cart);
    updateCartTotal();
}

function updateCartTotal() {
    const cart = JSON.parse(localStorage.getItem('batburger_cart')) || [];
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    // Calcula taxa de entrega (R$4 antes da meia-noite, R$7 depois)
    const now = new Date();
    const hour = now.getHours();
    const deliveryFee = (hour >= 0 && hour < 3) ? 7 : 4;
    
    document.getElementById('total').textContent = `Total: R$ ${subtotal.toFixed(2)}`;
    document.getElementById('delivery-fee').textContent = `Taxa de entrega: R$ ${deliveryFee.toFixed(2)}`;
    document.getElementById('total-with-delivery').textContent = `Total com entrega: R$ ${(subtotal + deliveryFee).toFixed(2)}`;
    
    // Atualiza também no PIX se estiver visível
    if (document.getElementById('pix-area').style.display === 'block') {
        updatePixTotal();
    }
}

function updatePixTotal() {
    const cart = JSON.parse(localStorage.getItem('batburger_cart')) || [];
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const now = new Date();
    const hour = now.getHours();
    const deliveryFee = (hour >= 0 && hour < 3) ? 6 : 4;
    
    document.querySelector('#pix-total span').textContent = `R$ ${(subtotal + deliveryFee).toFixed(2)}`;
}

function sendOrder() {
    const cart = JSON.parse(localStorage.getItem('batburger_cart')) || [];
    if (cart.length === 0) {
        alert('Seu carrinho está vazio! Adicione itens antes de finalizar o pedido.');
        return;
    }
    
    const nome = document.getElementById('nome').value.trim();
    const endereco = document.getElementById('endereco').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    
    if (!nome || !endereco || !telefone) {
        alert('Por favor, preencha todos os campos obrigatórios: Nome, Endereço e Telefone.');
        return;
    }
    
    // Validação básica de telefone
    if (!/^\(?\d{2}\)?[\s-]?\d{4,5}[\s-]?\d{4}$/.test(telefone)) {
        alert('Por favor, insira um número de telefone válido.');
        return;
    }
    
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    const observacoes = document.getElementById('observacoes').value.trim();
    
    let troco = '';
    if (paymentMethod === 'dinheiro') {
        const trocoValue = document.getElementById('troco').value.trim();
        if (!trocoValue) {
            alert('Por favor, informe o valor para troco quando pagar em dinheiro.');
            return;
        }
        troco = `*Troco para:* R$ ${trocoValue}\n`;
    }
    
    // Calcula totais
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const now = new Date();
    const hour = now.getHours();
    const deliveryFee = (hour >= 0 && hour < 3) ? 6 : 4;
    const total = subtotal + deliveryFee;
    
    // Monta mensagem para WhatsApp
    let message = `*🦇 PEDIDO BATBURGER* 🍔\n\n`;
    message += `*Cliente:* ${nome}\n`;
    message += `*Endereço:* ${endereco}\n`;
    message += `*Telefone:* ${telefone}\n\n`;
    message += `*ITENS DO PEDIDO:*\n`;
    
    cart.forEach(item => {
        message += `- ${item.name} (${item.quantity}x) - R$ ${(item.price * item.quantity).toFixed(2)}\n`;
    });
    
    message += `\n*Subtotal:* R$ ${subtotal.toFixed(2)}\n`;
    message += `*Taxa de entrega:* R$ ${deliveryFee.toFixed(2)}\n`;
    message += `*Total:* R$ ${total.toFixed(2)}\n\n`;
    message += `*FORMA DE PAGAMENTO:* ${paymentMethod.toUpperCase()}\n`;
    message += troco;
    message += `*Observações:* ${observacoes || 'Nenhuma'}\n\n`;
    message += `🦇 OBRIGADO POR PEDIR NO BATBURGER! 🍔`;
    
    // Codifica a mensagem para URL
    const encodedMessage = encodeURIComponent(message);
    
    // Número de WhatsApp (substitua pelo número real)
    const whatsappNumber = '5533991975298';
    
    // Abre o WhatsApp
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
    
    // Limpa o carrinho após enviar
    localStorage.removeItem('batburger_cart');
    renderCartItems([]);
    updateCartTotal();
    
    // Mostra confirmação
    showOrderConfirmation();
}

function showOrderConfirmation() {
    const confirmation = document.createElement('div');
    confirmation.className = 'order-confirmation';
    confirmation.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <h3>PEDIDO ENVIADO!</h3>
        <p>Seu pedido foi enviado para o WhatsApp.</p>
        <p>Por favor, aguarde a confirmação do restaurante.</p>
    `;
    
    const customerInfo = document.querySelector('.customer-info');
    customerInfo.appendChild(confirmation);
    
    setTimeout(() => {
        confirmation.style.opacity = '0';
        setTimeout(() => {
            confirmation.remove();
        }, 500);
    }, 5000);
}

function setupBackToTopButton() {
    const backToTopButton = document.getElementById('back-to-top');
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopButton.style.display = 'flex';
        } else {
            backToTopButton.style.display = 'none';
        }
    });
    
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

function animateMenuItems() {
    const items = document.querySelectorAll('.item');
    items.forEach(item => {
        const delay = parseInt(item.style.getPropertyValue('--order')) * 0.1;
        item.style.animationDelay = `${delay}s`;
    });
}
