document.addEventListener('DOMContentLoaded', function() {
    // Variáveis globais
    let cart = [];
    let orderCount = 0;
    const cartItems = document.getElementById('cart-items');
    const cartEmpty = document.getElementById('cart-empty');
    const cartCount = document.getElementById('cart-count');
    const orderCountElement = document.getElementById('order-count');
    const totalElement = document.getElementById('total');
    const deliveryFeeElement = document.getElementById('delivery-fee');
    const totalWithDeliveryElement = document.getElementById('total-with-delivery');
    const paymentOptions = document.getElementsByName('payment');
    const trocoField = document.getElementById('troco-field');
    const pixArea = document.getElementById('pix-area');
    const paymentWarning = document.getElementById('payment-warning');
    const backToTopButton = document.getElementById('back-to-top');
    const whatsappNumber = '5533998351903';
    
    // Verificar horário de funcionamento e definir taxa de entrega
    const now = new Date();
    const currentHour = now.getHours();
    const isAfterMidnight = currentHour >= 0 && currentHour < 3;
    const deliveryFee = isAfterMidnight ? 8.00 : 4.00;
    
    if (currentHour < 21 && currentHour > 3) {
        showNotification('Estamos fechados no momento. Funcionamos das 21h às 3h.', 'warning');
    }
    
    // Atualizar taxa de entrega
    deliveryFeeElement.textContent = `Taxa de entrega: R$ ${deliveryFee.toFixed(2)}`;
    updateTotalWithDelivery();
    
    // Mostrar aviso se for após meia-noite
    if (isAfterMidnight) {
        paymentWarning.style.display = 'block';
    }

    // Configurar listeners para os métodos de pagamento
    paymentOptions.forEach(option => {
        option.addEventListener('change', function() {
            if (this.value === 'dinheiro') {
                if (isAfterMidnight) {
                    showNotification('Não aceitamos dinheiro após meia-noite. Por favor, escolha outra forma de pagamento.', 'error');
                    document.getElementById('cartao').checked = true;
                    trocoField.style.display = 'none';
                    pixArea.style.display = 'none';
                    return;
                }
                trocoField.style.display = 'block';
                pixArea.style.display = 'none';
                document.getElementById('troco').focus();
            } else if (this.value === 'pix') {
                trocoField.style.display = 'none';
                pixArea.style.display = 'block';
            } else {
                trocoField.style.display = 'none';
                pixArea.style.display = 'none';
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
    menuItems.forEach((item, index) => {
        item.style.setProperty('--order', index);
        item.style.animationDelay = `${index * 0.1}s`;
    });
    
    // Validação do formulário
    const form = document.querySelector('.customer-info');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        sendOrder();
    });
    
    // Inicializar o carrinho
    updateCartDisplay();
});

// Função para copiar chave PIX
function copyPixKey() {
    const pixKey = document.getElementById('pix-key').textContent;
    navigator.clipboard.writeText(pixKey).then(() => {
        showNotification('Chave PIX copiada!', 'success');
    }).catch(err => {
        console.error('Erro ao copiar chave PIX:', err);
    });
}

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
    const deliveryFeeElement = document.getElementById('delivery-fee');
    const totalWithDeliveryElement = document.getElementById('total-with-delivery');
    const pixTotalElement = document.querySelector('#pix-total span');
    
    // Limpar o carrinho
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartEmpty.style.display = 'block';
        cartCount.textContent = '(0)';
        totalElement.textContent = 'Total: R$ 0,00';
        deliveryFeeElement.textContent = 'Taxa de entrega: R$ 0,00';
        totalWithDeliveryElement.textContent = 'Total com entrega: R$ 0,00';
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
                <button class="remove-btn" onclick="removeFromCart('${item.name.replace(/'/g, "\\'")}')" aria-label="Remover ${item.name} do carrinho">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            cartItems.appendChild(li);
        });
        
        // Atualizar contador e total
        cartCount.textContent = `(${itemCount})`;
        totalElement.textContent = `Total: R$ ${total.toFixed(2)}`;
        
        // Atualizar taxa de entrega
        const now = new Date();
        const currentHour = now.getHours();
        const isAfterMidnight = currentHour >= 0 && currentHour < 3;
        const deliveryFee = isAfterMidnight ? 8.00 : 4.00;
        deliveryFeeElement.textContent = `Taxa de entrega: R$ ${deliveryFee.toFixed(2)}`;
        
        // Atualizar total com entrega
        const totalWithDelivery = total + deliveryFee;
        totalWithDeliveryElement.textContent = `Total com entrega: R$ ${totalWithDelivery.toFixed(2)}`;
        pixTotalElement.textContent = `R$ ${totalWithDelivery.toFixed(2)}`;
    }
}

// Função para atualizar o total com entrega
function updateTotalWithDelivery() {
    const cart = getCart();
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const now = new Date();
    const currentHour = now.getHours();
    const isAfterMidnight = currentHour >= 0 && currentHour < 3;
    const deliveryFee = isAfterMidnight ? 8.00 : 4.00;
    const totalWithDelivery = total + deliveryFee;
    
    document.getElementById('total-with-delivery').textContent = `Total com entrega: R$ ${totalWithDelivery.toFixed(2)}`;
    document.querySelector('#pix-total span').textContent = `R$ ${totalWithDelivery.toFixed(2)}`;
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

// Função para enviar o pedido via WhatsApp
function sendOrder() {
    const cart = getCart();
    const nome = document.getElementById('nome').value.trim();
    const endereco = document.getElementById('endereco').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const observacoes = document.getElementById('observacoes').value.trim();
    const paymentMethod = document.querySelector('input[name="payment"]:checked');
    const troco = paymentMethod.value === 'dinheiro' ? document.getElementById('troco').value.trim() : '';
    const whatsappNumber = '5533998351903';
    
    if (!paymentMethod) {
        showNotification('Por favor, selecione uma forma de pagamento!', 'error');
        return;
    }
    
    // Verificar se é após meia-noite e tentativa de pagamento em dinheiro
    const now = new Date();
    const currentHour = now.getHours();
    const isAfterMidnight = currentHour >= 0 && currentHour < 3;
    
    if (isAfterMidnight && paymentMethod.value === 'dinheiro') {
        showNotification('Não aceitamos dinheiro após meia-noite. Por favor, escolha outra forma de pagamento.', 'error');
        document.getElementById('cartao').checked = true;
        return;
    }
    
    if (cart.length === 0) {
        showNotification('Seu carrinho está vazio! Adicione itens antes de finalizar.', 'error');
        return;
    }
    
    if (!nome || !endereco || !telefone) {
        showNotification('Por favor, preencha todos os campos obrigatórios!', 'error');
        
        // Destacar campos faltantes
        if (!nome) document.getElementById('nome').focus();
        else if (!endereco) document.getElementById('endereco').focus();
        else if (!telefone) document.getElementById('telefone').focus();
        
        return;
    }
    
    // Validar telefone (formato simples)
    const phoneRegex = /^\(?\d{2}\)?[\s-]?\d{4,5}[\s-]?\d{4}$/;
    if (!phoneRegex.test(telefone)) {
        showNotification('Por favor, insira um número de telefone válido!', 'error');
        document.getElementById('telefone').focus();
        return;
    }
    
    // Calcular total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = isAfterMidnight ? 8.00 : 4.00;
    const totalWithDelivery = total + deliveryFee;
    
    // Montar mensagem
    let message = `🦇 *NOVO PEDIDO BATBURGER* 🦇\n\n`;
    message += `*Cliente:* ${nome}\n`;
    message += `*Endereço:* ${endereco}\n`;
    message += `*Telefone:* ${telefone}\n\n`;
    message += `*ITENS DO PEDIDO:*\n`;
    
    cart.forEach(item => {
        message += `- ${item.name} x${item.quantity} - R$ ${(item.price * item.quantity).toFixed(2)}\n`;
    });
    
    message += `\n*Subtotal: R$ ${total.toFixed(2)}*\n`;
    message += `*Taxa de entrega: R$ ${deliveryFee.toFixed(2)} ${isAfterMidnight ? '(taxa noturna)' : ''}*\n`;
    message += `*Total: R$ ${totalWithDelivery.toFixed(2)}*\n\n`;
    message += `*FORMA DE PAGAMENTO:* ${getPaymentMethodName(paymentMethod.value)}\n`;
    
    if (paymentMethod.value === 'dinheiro' && troco) {
        message += `*Troco para:* R$ ${troco}\n`;
    }
    
    if (paymentMethod.value === 'pix') {
        message += `*Chave PIX:* morcegoburgers@gmail.com\n`;
        message += `*Valor PIX:* R$ ${totalWithDelivery.toFixed(2)}\n`;
        message += `\n*ENVIE O COMPROVANTE PARA ESTE NÚMERO APÓS O PAGAMENTO*\n`;
    }
    
    if (observacoes) {
        message += `\n*OBSERVAÇÕES:*\n${observacoes}\n`;
    }
    
    message += `\n🦇 Obrigado por escolher o BatBurger! Seu pedido será preparado e enviado o mais rápido possível! 🍔`;
    
    // Codificar mensagem para URL
    const encodedMessage = encodeURIComponent(message);
    
    // Criar link do WhatsApp
    let whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    // Abrir WhatsApp
    window.open(whatsappUrl, '_blank');
    
    // Limpar carrinho após envio
    saveCart([]);
    updateCartDisplay();
    document.getElementById('nome').value = '';
    document.getElementById('endereco').value = '';
    document.getElementById('telefone').value = '';
    document.getElementById('observacoes').value = '';
    document.getElementById('troco').value = '';
    
    // Mostrar notificação de sucesso
    showNotification('Pedido enviado com sucesso!', 'success');
    
    // Atualizar contador de pedidos
    updateOrderCount();
}

// Função auxiliar para obter o nome do método de pagamento
function getPaymentMethodName(method) {
    switch (method) {
        case 'cartao': return 'Cartão de Crédito/Débito';
        case 'dinheiro': return 'Dinheiro';
        case 'pix': return 'PIX';
        default: return method;
    }
}

// Função para mostrar notificações
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'assertive');
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
