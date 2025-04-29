// [Todo o código existente permanece igual até o início do DOMContentLoaded]

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
    const pixLink = document.getElementById('pix-link');
    
    // Verificar horário e desativar pagamento em dinheiro se necessário
    if (isAfterMidnight()) {
        const dinheiroOption = document.getElementById('dinheiro');
        dinheiroOption.disabled = true;
        dinheiroOption.parentElement.classList.add('disabled-option');
        
        // Adicionar mensagem explicativa
        const dinheiroLabel = dinheiroOption.nextElementSibling;
        const message = document.createElement('span');
        message.className = 'night-time-message';
        message.textContent = '(Indisponível após meia-noite)';
        message.style.display = 'inline';
        dinheiroLabel.appendChild(message);
    }
    
    // [Restante do código existente permanece igual até a função updatePixQRCode]

    // Função para atualizar o QR Code do PIX
    function updatePixQRCode() {
        const cart = getCart();
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const pixQrCode = document.getElementById('pix-qrcode');
        const nome = document.getElementById('nome').value || 'Cliente BatBurger';
        
        // Limpar QR Code anterior
        pixQrCode.innerHTML = '';
        
        if (total > 0) {
            const pixInfo = {
                chave: '33998096312',
                valor: total.toFixed(2),
                descricao: 'BatBurger - Pedido de Lanches'
            };
            
            // Atualizar link PIX
            pixLink.href = `https://pix.gerencianet.com.br/pagar/${encodeURIComponent(nome)}/${pixInfo.valor}`;
            pixLink.textContent = `PAGAR R$ ${pixInfo.valor} VIA PIX`;
            
            // Gerar QR Code
            new QRCode(pixQrCode, {
                text: `PIX:${pixInfo.chave}?amount=${pixInfo.valor}&message=${pixInfo.descricao}`,
                width: 150,
                height: 150,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
        }
    }

    // [Restante do código existente permanece igual]

    // Nova função para verificar horário
    function isAfterMidnight() {
        const now = new Date();
        return now.getHours() >= 0 && now.getHours() < 6; // Das 00:00 às 06:00
    }
});

// [Restante do código existente permanece igual]
