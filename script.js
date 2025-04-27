let cart = [];

// Mostra notificação temporária
function showNotification(message) {
    const notification = document.getElementById("notification");
    notification.textContent = message;
    notification.style.opacity = "1";
    
    setTimeout(() => {
        notification.style.opacity = "0";
    }, 3000);
}

// Adiciona item ao carrinho com confirmação
function addToCart(name, price) {
    cart.push({ name, price });
    updateCart();
    showNotification(`✔ ${name} adicionado ao carrinho!`);
}

// Remove item do carrinho
function removeFromCart(index) {
    const removedItem = cart.splice(index, 1)[0];
    updateCart();
    showNotification(`✕ ${removedItem.name} removido`);
}

// Atualiza visualização do carrinho
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

// Envia pedido para WhatsApp
function sendOrder() {
    // Validação
    if (cart.length === 0) {
        showNotification("🦇 Seu carrinho está vazio!");
        return;
    }

    const nome = document.getElementById("nome").value;
    const telefone = document.getElementById("telefone").value;
    const endereco = document.getElementById("endereco").value;
    const pagamento = document.getElementById("pagamento").value;

    if (!nome || !telefone || !endereco || !pagamento) {
        showNotification("Preencha todos os campos obrigatórios!");
        return;
    }

    // Monta mensagem
    let message = "🦇 *NOVO PEDIDO - BATBURGER* 🍔\n\n";
    message += `*Cliente:* ${nome}\n`;
    message += `*Telefone:* ${telefone}\n`;
    message += `*Endereço:* ${endereco}\n`;
    message += `*Pagamento:* ${pagamento}\n\n`;
    
    message += "*ITENS:*\n";
    let total = 0;
    cart.forEach(item => {
        message += `➤ ${item.name} - R$ ${item.price.toFixed(2)}\n`;
        total += item.price;
    });

    message += `\n*TOTAL: R$ ${total.toFixed(2)}*\n\n`;
    message += "🦇 O Batmóvel já está a caminho!";

    // Envia para WhatsApp
    window.open(`https://wa.me/5533991255080?text=${encodeURIComponent(message)}`, "_blank");
}

// Formata telefone automaticamente
document.getElementById("telefone").addEventListener("input", function(e) {
    e.target.value = e.target.value
        .replace(/\D/g, "")
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2");
});
