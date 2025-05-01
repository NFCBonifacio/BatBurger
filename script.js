// script.js - Versão Corrigida
document.addEventListener('DOMContentLoaded', function() {
    // Variáveis globais
    const cartItems = document.getElementById('cart-items');
    const cartEmpty = document.getElementById('cart-empty');
    const cartCount = document.getElementById('cart-count');
    const orderCountElement = document.getElementById('order-count');
    const totalElement = document.getElementById('total');
    const deliveryFeeElement = document.getElementById('delivery-fee');
    const pixTotalElement = document.getElementById('pix-total');
    const paymentOptions = document.getElementsByName('payment');
    const trocoField = document.getElementById('troco-field');
    const pixArea = document.getElementById('pix-area');
    const backToTopButton = document.getElementById('back-to-top');
    const whatsappNumber = '5533998351903';

    // Funções para PIX no padrão BR
function generatePixCode(total) {
    const pixData = {
        key: 'morcegoburgers@gmail.com',
        receiverName: 'BRUNA LUISA DE OLIVEIRA QUARESMA',
        receiverCity: 'NANUQUE MG',
        description: 'Pagamento BatBurger',
        amount: total.toFixed(2)
    };

    const payload = [
        '000201',
        '26' + '0014BR.GOV.BCB.PIX' + '01' + pixData.key.length.toString().padStart(2, '0') + pixData.key,
        '52040000',
        '5303986',
        '54' + pixData.amount.length.toString().padStart(2, '0') + pixData.amount,
        '5802BR',
        '59' + pixData.receiverName.length.toString().padStart(2, '0') + pixData.receiverName,
        '60' + pixData.receiverCity.length.toString().padStart(2, '0') + pixData.receiverCity,
        '62' + '05' + (pixData.description.length + 4).toString().padStart(2, '0') + pixData.description,
        '6304'
    ].join('');

    const crc = calculateCRC16(payload);
    return payload + crc;
}

function calculateCRC16(payload) {
    let crc = 0xFFFF;
    for (let i = 0; i < payload.length; i++) {
        crc ^= payload.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) {
            crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1;
        }
    }
    return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}

function copyPixCode() {
    const pixCode = document.getElementById('pix-code');
    pixCode.select();
    document.execCommand('copy');
    
    const copyBtn = document.querySelector('#pix-copy-area button');
    copyBtn.textContent = 'Copiado!';
    copyBtn.style.background = '#4CAF50';
    
    setTimeout(() => {
        copyBtn.textContent = 'Copiar';
        copyBtn.style.background = 'var(--primary-color)';
    }, 2000);
    
    showNotification('Código PIX copiado! Cole no seu app bancário.', 'success');
}
    
    // Verificar horário de funcionamento (21h às 3h)
    const now = new Date();
    const currentHour = now.getHours();
    
    if (currentHour < 21 && currentHour > 3) {
        showNotification('Estamos fechados no momento. Funcionamos das 21h às 3h.', 'warning');
    }

    // Inicializar contador de pedidos zerado
    updateOrderCount();
    
    // Configurar listeners para os métodos de pagamento
    paymentOptions.forEach(option => {
        option.addEventListener('change', function() {
            if (this.value === 'dinheiro') {
                // Verificar se é depois da meia-noite
                if (currentHour >= 0 && currentHour < 3) {
                    showNotification('Pagamento em dinheiro não disponível após meia-noite', 'error');
                    document.getElementById('cartao').checked = true;
                    trocoField.style.display = 'none';
                    return;
                }
                trocoField.style.display = 'block';
                pixArea.style.display = 'none';
                document.getElementById('troco').focus();
            } else if (this.value === 'pix') {
                trocoField.style.display = 'none';
                pixArea.style.display = 'block';
                updatePixQRCode();
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

// Função para calcular taxa de entrega
function calculateDeliveryFee() {
    const now = new Date();
    const currentHour = now.getHours();
    // Taxa de entrega é R$4 até 23:59 e R$8 depois da meia-noite
    return (currentHour >= 0 && currentHour < 3) ? 8 : 4;
}

// Função para atualizar a exibição do carrinho
function updateCartDisplay() {
    const cart = getCart();
    const cartItems = document.getElementById('cart-items');
    const cartEmpty = document.getElementById('cart-empty');
    const cartCount = document.getElementById('cart-count');
    const totalElement = document.getElementById('total');
    const deliveryFeeElement = document.getElementById('delivery-fee');
    const pixTotalElement = document.getElementById('pix-total');
    
    // Limpar o carrinho
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartEmpty.style.display = 'block';
        cartCount.textContent = '(0)';
        totalElement.textContent = 'Total: R$ 0,00';
        deliveryFeeElement.textContent = 'Taxa de entrega: R$ 0,00';
        pixTotalElement.textContent = 'R$ 0,00';
    } else {
        cartEmpty.style.display = 'none';
        
        // Calcular total
        let subtotal = 0;
        let itemCount = 0;
        
        // Adicionar itens ao carrinho
        cart.forEach(item => {
            const li = document.createElement('li');
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
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
        
        // Calcular taxa de entrega e total
        const deliveryFee = calculateDeliveryFee();
        const total = subtotal + deliveryFee;
        
        // Atualizar contador, taxa e total
        cartCount.textContent = `(${itemCount})`;
        deliveryFeeElement.textContent = `Taxa de entrega: R$ ${deliveryFee.toFixed(2)}`;
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
    const pixCodeElement = document.getElementById('pix-code');
    const pixTotalElement = document.getElementById('pix-total');
    
    pixQrCode.innerHTML = '';
    pixCodeElement.value = '';
    
    if (total > 0) {
        const pixCode = generatePixCode(total);
        pixTotalElement.textContent = `R$ ${total.toFixed(2)}`;
        
        // Atualiza QR Code
        new QRCode(pixQrCode, {
            text: pixCode,
            width: 150,
            height: 150,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
        
        // Atualiza código copiável
        pixCodeElement.value = pixCode;
    }
}
        
        // Gerar QR Code (usando a biblioteca QRCode.js)
        new QRCode(pixQrCode, {
            text: `PIX:${pixInfo.chave}?amount=${pixInfo.valor}&message=${encodeURIComponent(pixInfo.descricao)}`,
            width: 150,
            height: 150,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
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
    const now = new Date();
    const currentHour = now.getHours();
    
    if (!paymentMethod) {
        showNotification('Por favor, selecione uma forma de pagamento!', 'error');
        return;
    }
    
    // Verificar pagamento em dinheiro após meia-noite
    if (paymentMethod.value === 'dinheiro' && currentHour >= 0 && currentHour < 3) {
        showNotification('Pagamento em dinheiro não disponível após meia-noite', 'error');
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
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = calculateDeliveryFee();
    const total = subtotal + deliveryFee;
    
    // Montar mensagem
    let message = `🦇 *NOVO PEDIDO BATBURGER* 🦇\n\n`;
    message += `*Cliente:* ${nome}\n`;
    message += `*Endereço:* ${endereco}\n`;
    message += `*Telefone:* ${telefone}\n\n`;
    message += `*ITENS DO PEDIDO:*\n`;
    
    cart.forEach(item => {
        message += `- ${item.name} x${item.quantity} - R$ ${(item.price * item.quantity).toFixed(2)}\n`;
    });
    
    message += `\n*Subtotal: R$ ${subtotal.toFixed(2)}*\n`;
    message += `*Taxa de entrega: R$ ${deliveryFee.toFixed(2)}*\n`;
    message += `*Total: R$ ${total.toFixed(2)}*\n\n`;
    message += `*FORMA DE PAGAMENTO:* ${getPaymentMethodName(paymentMethod.value)}\n`;
    
    if (paymentMethod.value === 'dinheiro' && troco) {
        message += `*Troco para:* R$ ${troco}\n`;
    }
    
    if (paymentMethod.value === 'pix') {
        message += `*Chave PIX:* morcegoburgers@gmail.com\n`;
        message += `*Valor PIX:* R$ ${total.toFixed(2)}\n`;
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
