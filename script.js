// script.js - Versão Simplificada
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
    const whatsappNumber = '5533998351903'; // Seu número de WhatsApp
    
    // Verificar horário de funcionamento (21h às 3h)
    const now = new Date();
    const currentHour = now.getHours();
    
    if (currentHour < 21 && currentHour > 3) {
        showNotification('Estamos fechados no momento. Funcionamos das 21h às 3h.', 'warning');
    }

    // Inicializar contador de pedidos zerado
    orderCount = 0;
    updateOrderCount();
    
    // Configurar listeners para os métodos de pagamento
    paymentOptions.forEach(option => {
        option.addEventListener('change', function() {
            if (this.value === 'dinheiro') {
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
                <button class="remove-btn" onclick="removeFromCart('${item.name.replace(/'/g, "\\'")}')" aria-label="Remover ${item.name} do carrinho">
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

// Atualize a função updatePixQRCode
function updatePixQRCode() {
    const cart = getCart();
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const pixQrCode = document.getElementById('pix-qrcode');
    
    pixQrCode.innerHTML = '';
    
    if (total > 0) {
        const pixInfo = {
            chave: 'morcegoburgers@gmail.com', // Chave PIX corrigida
            nome: 'BatBurger',
            cidade: 'Gotham City',
            valor: total.toFixed(2),
            identificador: 'BAT' + Math.floor(Math.random() * 10000)
        };

        const payload = [
            '000201',
            '2636',
            '0014br.gov.bcb.pix',
            '01' + pixInfo.chave.length.toString().padStart(2, '0') + pixInfo.chave,
            '52040000',
            '5303986',
            '54' + pixInfo.valor.length.toString().padStart(2, '0') + pixInfo.valor,
            '5802BR',
            '59' + pixInfo.nome.length.toString().padStart(2, '0') + pixInfo.nome,
            '60' + pixInfo.cidade.length.toString().padStart(2, '0') + pixInfo.cidade,
            '62' + (pixInfo.identificador.length + 4).toString().padStart(2, '0') +
                '05' + pixInfo.identificador.length.toString().padStart(2, '0') + pixInfo.identificador,
            '6304'
        ].join('');

        const crc = calculateCRC16(payload);
        const payloadFinal = payload + crc;

        new QRCode(pixQrCode, {
            text: payloadFinal,
            width: 150,
            height: 150,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    }
}

// Adicione esta nova função para copiar a chave PIX
function copyPixKey() {
    const pixKeyInput = document.getElementById('pix-key');
    pixKeyInput.select();
    document.execCommand('copy');
    
    // Mostrar feedback visual
    const copyButton = event.currentTarget;
    const originalText = copyButton.innerHTML;
    copyButton.innerHTML = '<i class="fas fa-check"></i> Copiado!';
    
    setTimeout(() => {
        copyButton.innerHTML = originalText;
    }, 2000);
    
    showNotification('Chave PIX copiada! Cole no seu app bancário.', 'success');
}
    // Limpar QR Code anterior
    pixQrCode.innerHTML = '';
    
    if (total > 0) {
        const pixInfo = {
            chave: 'morcegoburgers@gmail.com',
            valor: total.toFixed(2),
            descricao: 'BatBurger - Pedido de Lanches'
        };
        
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
    
    if (!paymentMethod) {
        showNotification('Por favor, selecione uma forma de pagamento!', 'error');
        return;
    }
    
    if (paymentMethod.value === 'pix') {
    message += `*Chave PIX:* morcegoburgers@gmail.com\n`;
    message += `*Valor PIX:* R$ ${total.toFixed(2)}\n`;
    message += `\n*INSTRUÇÕES PARA PAGAMENTO:*\n`;
    message += `1. Abra seu app bancário\n`;
    message += `2. Toque em "Pagar com PIX"\n`;
    message += `3. Cole a chave PIX copiada\n`;
    message += `4. Confirme o valor e pague\n`;
    message += `5. Envie o comprovante para este WhatsApp\n`;
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
    
    // Montar mensagem
    let message = `🦇 *NOVO PEDIDO BATBURGER* 🦇\n\n`;
    message += `*Cliente:* ${nome}\n`;
    message += `*Endereço:* ${endereco}\n`;
    message += `*Telefone:* ${telefone}\n\n`;
    message += `*ITENS DO PEDIDO:*\n`;
    
    cart.forEach(item => {
        message += `- ${item.name} x${item.quantity} - R$ ${(item.price * item.quantity).toFixed(2)}\n`;
    });
    
    message += `\n*Total: R$ ${total.toFixed(2)}*\n\n`;
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
