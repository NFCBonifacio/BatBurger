// script.js
document.addEventListener('DOMContentLoaded', function() {
    // ... (código anterior permanece igual até a função updatePixQRCode)

    // Função para atualizar o QR Code do PIX - MODIFICADA
    function updatePixQRCode() {
        const cart = getCart();
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const pixQrCode = document.getElementById('pix-qrcode');
        
        pixQrCode.innerHTML = '';
        
        if (total > 0) {
            const pixInfo = {
                chave: '33998096312', // CHAVE PIX CPF
                valor: total.toFixed(2),
                descricao: 'Pagamento do pedido'
            };
            
            new QRCode(pixQrCode, {
                text: `PIX:${pixInfo.chave}?amount=${pixInfo.valor}&message=${pixInfo.descricao}`,
                width: 150,
                height: 150,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });

            // Adiciona informações da chave PIX manualmente
            const pixKeyInfo = document.createElement('div');
            pixKeyInfo.className = 'pix-key-info';
            pixKeyInfo.innerHTML = `
                <p><strong>Chave PIX (CPF):</strong> 33998096312</p>
                <p><strong>Valor:</strong> R$ ${total.toFixed(2)}</p>
            `;
            pixQrCode.appendChild(pixKeyInfo);
        }
    }

    // Função para enviar o pedido via WhatsApp - MODIFICADA
    function sendOrder() {
        const cart = getCart();
        const nome = document.getElementById('nome').value;
        const endereco = document.getElementById('endereco').value;
        const telefone = document.getElementById('telefone').value;
        const observacoes = document.getElementById('observacoes').value;
        const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
        const troco = paymentMethod === 'dinheiro' ? document.getElementById('troco').value : '';
        
        if (cart.length === 0) {
            showNotification('Seu carrinho está vazio! Adicione itens antes de finalizar.', 'error');
            return;
        }
        
        if (!nome || !endereco || !telefone) {
            showNotification('Por favor, preencha todos os campos obrigatórios!', 'error');
            return;
        }
        
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // MENSAGEM DO WHATSAPP ATUALIZADA
        let message = `*NOVO PEDIDO* 🚀\n\n`;
        message += `*Cliente:* ${nome}\n`;
        message += `*Endereço:* ${endereco}\n`;
        message += `*Telefone:* ${telefone}\n\n`;
        message += `*ITENS:*\n`;
        
        cart.forEach(item => {
            message += `- ${item.name} x${item.quantity} - R$ ${(item.price * item.quantity).toFixed(2)}\n`;
        });
        
        message += `\n*Total: R$ ${total.toFixed(2)}*\n\n`;
        message += `*Pagamento:* ${getPaymentMethodName(paymentMethod)}\n`;
        
        if (paymentMethod === 'dinheiro' && troco) {
            message += `*Troco para:* R$ ${troco}\n`;
        } else if (paymentMethod === 'pix') {
            message += `\n*DADOS PIX (CPF):* 33998096312\n`;
        }
        
        if (observacoes) {
            message += `\n*OBS:* ${observacoes}\n`;
        }
        
        message += `\n✅ Pedido enviado via site`;
        
        // WhatsApp atualizado para (33) 99809-6312
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/5533998096312?text=${encodedMessage}`, '_blank');
        
        // Limpar carrinho após envio
        saveCart([]);
        updateCartDisplay();
        document.getElementById('nome').value = '';
        document.getElementById('endereco').value = '';
        document.getElementById('telefone').value = '';
        document.getElementById('observacoes').value = '';
        document.getElementById('troco').value = '';
        
        showNotification('Pedido enviado com sucesso!', 'success');
    }

    // ... (restante do código permanece igual)
});
