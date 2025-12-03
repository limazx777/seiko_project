document.addEventListener('DOMContentLoaded', function() {
    // Menu de navegação móvel
    const mobileMenuBtn = document.querySelector('.mobile-menu');
    const nav = document.querySelector('nav');

    if (mobileMenuBtn && nav) {
        mobileMenuBtn.addEventListener('click', function() {
            nav.classList.toggle('active');
            this.classList.toggle('active');
        });
    }


    // Lógica do Carrinho
    const cartIcon = document.getElementById('cart-icon');
    const cartModal = document.getElementById('cart-modal');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCounter = document.getElementById('cart-counter');
    const cartTotalEl = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    const goToStep2Btn = document.getElementById('go-to-step-2-btn');
    const backToStep1Btn = document.getElementById('back-to-step-1-btn');
    const cartStep1 = document.getElementById('cart-step-1');
    const cartStep2 = document.getElementById('cart-step-2');
    const cartTitle = document.getElementById('cart-title');
    const menuItemsContainer = document.querySelector('.menu-items');
    const menuCategoriesContainer = document.querySelector('.menu-categories');

    let cart = [];

    // Função para salvar o carrinho no sessionStorage
    const saveCart = () => {
        sessionStorage.setItem('seikoCart', JSON.stringify(cart));
    };

    // Função para carregar o carrinho do sessionStorage
    const loadCart = () => {
        const savedCart = sessionStorage.getItem('seikoCart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
        }
    };

    if (menuCategoriesContainer && menuItemsContainer) {
        // Gerar botões de categoria
        Object.keys(menuData).forEach((key, index) => {
            let categoryName = key.replace(/-/g, ' ');
            if (key === 'dim-sum') categoryName = 'Dim Sum';
            else if (key === 'sushi-burger') categoryName = 'Sushi Burger';
            else categoryName = categoryName.replace(/\b\w/g, l => l.toUpperCase());

            const categoryButton = document.createElement('div');
            categoryButton.className = `category ${index === 0 ? 'active' : ''}`;
            categoryButton.setAttribute('data-category', key);
            categoryButton.textContent = categoryName;
            menuCategoriesContainer.appendChild(categoryButton);
        });

        // Função para renderizar itens
        const renderMenuItems = (categoryKey) => {
            menuItemsContainer.innerHTML = ''; // Limpar itens existentes
            const items = menuData[categoryKey];
            items.forEach(item => {
                let optionsHTML = '';
                let priceHTML = `<span class="price">${item.price}</span>`;

                if (item.options && item.options.length > 0) {
                    const selectId = `select-${item.name.replace(/\s+/g, '-')}`;
                    optionsHTML = `
                        <div class="item-options ">
                            <label for="${selectId}">Escolha uma opção:</label>
                            <div class="select-wrapper">
                                <select id="${selectId}" class="flavor-select">
                                    ${item.options.map(opt => `<option value="${opt.price}">${opt.flavor}</option>`).join('')}
                                </select>
                            </div>
                        </div>
                    `;
                    priceHTML = `<span class="price">${item.options[0].price}</span>`; // Preço inicial
                }

                // Se não houver preço (item sem opções e sem preço direto), não mostra o span
                if (!item.price && !item.options) {
                    priceHTML = '';
                }

                const itemHTML = `
                    <div class="menu-item">
                        <div class="item-image">
                            <img src="${item.img}" alt="${item.name}" loading="lazy" width="300" height="200">
                        </div>
                        <div class="item-info">
                            <h3>${item.name}</h3>
                            <p>${item.description}</p>
                            ${optionsHTML}
                            <div class="item-footer">
                                ${priceHTML}
                                <button class="add-to-cart-btn">Adicionar</button>
                            </div>
                        </div>
                    </div>
                `;
                menuItemsContainer.insertAdjacentHTML('beforeend', itemHTML);
            });

            // Adicionar listeners aos novos selects
            document.querySelectorAll('.flavor-select').forEach(select => {
                select.addEventListener('change', function() {
                    const menuItem = this.closest('.menu-item');
                    const priceElement = menuItem.querySelector('.price');
                    priceElement.textContent = this.value;
                });
            });
        };

        // Adicionar listeners aos botões de categoria
        const categoryButtons = document.querySelectorAll('.category');
        categoryButtons.forEach(button => {
            button.addEventListener('click', function() {
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                const selectedCategory = this.getAttribute('data-category');
                renderMenuItems(selectedCategory);
            });
        });

        // Renderizar a primeira categoria por padrão
        renderMenuItems(Object.keys(menuData)[0]);

        // Lógica do Carrossel de Categorias
        const carousel = document.querySelector('.menu-categories');
        const prevBtn = document.getElementById('carousel-prev');
        const nextBtn = document.getElementById('carousel-next');

        const checkCarouselButtons = () => {
            if (!carousel || !prevBtn || !nextBtn) return;

            const maxScrollLeft = carousel.scrollWidth - carousel.clientWidth;
            
            // Se não houver overflow, esconde os botões
            if (maxScrollLeft <= 0) {
                prevBtn.style.display = 'none';
                nextBtn.style.display = 'none';
                return;
            }

            prevBtn.style.display = carousel.scrollLeft > 0 ? 'block' : 'none';
            nextBtn.style.display = carousel.scrollLeft < maxScrollLeft - 1 ? 'block' : 'none';
        };

        nextBtn.addEventListener('click', () => {
            carousel.scrollLeft += 200;
        });

        prevBtn.addEventListener('click', () => {
            carousel.scrollLeft -= 200;
        });

        carousel.addEventListener('scroll', checkCarouselButtons);
        window.addEventListener('resize', checkCarouselButtons); // Verifica ao redimensionar a janela
        checkCarouselButtons(); // Verificação inicial
    }

    // --- FUNÇÕES DO CARRINHO ---

    const openCart = () => {
        cartStep1.style.display = 'block';
        cartStep2.style.display = 'none';
        cartTitle.textContent = 'Seu Pedido';
        cartModal.classList.add('active');
    };

    const closeCart = () => {
        cartModal.classList.remove('active');
    };

    const addToCart = (item) => {
        // Gera um ID único para o item (nome + sabor)
        const itemId = item.name + (item.flavor || '');
        const existingItem = cart.find(cartItem => cartItem.id === itemId);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...item, id: itemId, quantity: 1 });
        }
        saveCart();
        updateCartUI();
    };

    const removeFromCart = (index) => {
        cart.splice(index, 1);
        updateCartUI();
    };


    const updateQuantity = (index, change) => {
        const item = cart[index];
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                removeFromCart(index);
            } else {
                saveCart();
                updateCartUI();
            }
        }
    };

    const updateCartUI = () => {
        if (!cartItemsContainer) return;
        const cartTotalStep2El = document.querySelector('#cart-step-2 .cart-total span'); // Total na etapa 2
        const orderNotesContainer = document.getElementById('order-notes').parentElement;
        const deliveryFeeEl = document.getElementById('cart-delivery-fee');
        cartItemsContainer.innerHTML = '';
        let total = 0;
        let totalItems = 0;

        cart.forEach((item, index) => {
            const itemEl = document.createElement('div');
            itemEl.classList.add('cart-item');
            itemEl.innerHTML = `
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>${item.flavor || 'Único'}</p>
                    <span class="price">${item.price}</span>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn" data-action="decrease" data-index="${index}">-</button>
                    <span class="item-quantity">${item.quantity}</span>
                    <button class="quantity-btn" data-action="increase" data-index="${index}">+</button>
                </div>
                <button class="remove-item-btn" data-index="${index}" title="Remover item">&times;</button>
            `;
            cartItemsContainer.appendChild(itemEl);

            // Calcula o total
            const priceNumber = parseFloat(item.price.replace('R$', '').replace(',', '.').trim());
            if (!isNaN(priceNumber)) {
                total += priceNumber * item.quantity;
            }
            totalItems += item.quantity;
        });

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p style="text-align:center;">Seu carrinho está vazio.</p>';
            orderNotesContainer.style.display = 'none'; // Esconde o campo de observações
        } else {
            orderNotesContainer.style.display = 'block'; // Mostra o campo de observações quando há itens
        }

        cartCounter.textContent = totalItems;
        // Atualiza o total na Etapa 1 (sem taxa)
        cartTotalEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;

        // Adiciona taxa de entrega e atualiza o total da Etapa 2
        const deliveryType = document.querySelector('input[name="delivery-type"]:checked').value;
        let finalTotal = total;
        if (deliveryType === 'Delivery' && cart.length > 0) {
            finalTotal += 5;
            deliveryFeeEl.style.display = 'flex';
        } else {
            deliveryFeeEl.style.display = 'none';
        }
        if (cartTotalStep2El) {
            cartTotalStep2El.textContent = `R$ ${finalTotal.toFixed(2).replace('.', ',')}`;
        }
    };

    // --- EVENT LISTENERS ---

    // Navegação do Carrinho e Checkout
    if (cartIcon) cartIcon.addEventListener('click', openCart);
    if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
    if (cartModal) {
        cartModal.addEventListener('click', (e) => { if (e.target === cartModal) closeCart(); });
    }
    if (goToStep2Btn) {
        goToStep2Btn.addEventListener('click', () => {
            if (cart.length === 0) {
                alert('Seu carrinho está vazio!');
                return;
            }
            cartStep1.style.display = 'none';
            cartStep2.style.display = 'block';
            cartTitle.textContent = 'Finalizar Pedido';
        });
    }
    if (backToStep1Btn) {
        backToStep1Btn.addEventListener('click', () => {
            cartStep1.style.display = 'block';
            cartStep2.style.display = 'none';
            cartTitle.textContent = 'Seu Pedido';
        });
    }

    // Lógica do Formulário de Pagamento
    const paymentRadios = document.querySelectorAll('input[name="payment"]');
    const changeForContainer = document.getElementById('change-for-container');
    const changeForInput = document.getElementById('change-for');
    const changeDisplay = document.getElementById('change-display');
    const deliveryTypeRadios = document.querySelectorAll('input[name="delivery-type"]');
    const deliveryInfoContainer = document.getElementById('delivery-info-container');
    const cardTypeContainer = document.getElementById('card-type-container');
    paymentRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.value === 'Dinheiro') {
                changeForContainer.style.display = 'block';
                cardTypeContainer.style.display = 'none';
            } else if (radio.value === 'Cartão') {
                cardTypeContainer.style.display = 'block';
                changeForContainer.style.display = 'none';
            } else {
                changeForContainer.style.display = 'none';
                cardTypeContainer.style.display = 'none';
            }
        });
    });

    // Lógica do Tipo de Entrega
    deliveryTypeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.value === 'Delivery') {
                deliveryInfoContainer.style.display = 'block';
                updateCartUI(); // Recalcula o total ao mudar para Delivery
            } else {
                deliveryInfoContainer.style.display = 'none';
                updateCartUI(); // Recalcula o total ao mudar para Retirada
            }
        });
    });

    // Cálculo automático do troco
    if (changeForInput) {
        changeForInput.addEventListener('input', () => {
            const totalStep2Text = document.getElementById('cart-total-step2').textContent;
            const totalValue = parseFloat(totalStep2Text.replace('R$', '').replace(',', '.').trim());
            const paidAmount = parseFloat(changeForInput.value.replace(',', '.').trim());

            if (!isNaN(paidAmount) && paidAmount >= totalValue) {
                const change = paidAmount - totalValue;
                changeDisplay.textContent = `Troco: R$ ${change.toFixed(2).replace('.', ',')}`;
                changeDisplay.style.display = 'block';
            } else {
                changeDisplay.style.display = 'none';
            }
        });
    }

    // Limpa o campo de troco ao fechar o carrinho para recalcular na próxima vez
    if(closeCartBtn) {
        closeCartBtn.addEventListener('click', () => { changeForInput.value = ''; changeDisplay.style.display = 'none'; });
    }

    // Interações com itens (Adicionar, Remover, Quantidade)
    if (menuItemsContainer) { // Adicionar
        menuItemsContainer.addEventListener('click', function(e) {
            if (e.target.classList.contains('add-to-cart-btn')) {
                const button = e.target;
                const menuItemEl = button.closest('.menu-item');
                const name = menuItemEl.querySelector('h3').textContent;
                const price = menuItemEl.querySelector('.price').textContent;
                const selectEl = menuItemEl.querySelector('.flavor-select');
                const flavor = selectEl ? selectEl.options[selectEl.selectedIndex].text : null;

                const item = { name, price, flavor };
                addToCart(item);

                if (button.classList.contains('confirmed')) return;
                button.classList.add('confirmed');
                button.innerHTML = '<i class="fas fa-check"></i> Adicionado';
                setTimeout(() => {
                    button.classList.remove('confirmed');
                    button.innerHTML = 'Adicionar';
                }, 1500);
            }
        });
    }
    if (cartItemsContainer) { // Remover e Quantidade
        cartItemsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-item-btn')) {
                const index = parseInt(e.target.dataset.index, 10);
                removeFromCart(index);
            }
            if (e.target.classList.contains('quantity-btn')) {
                const index = parseInt(e.target.dataset.index, 10);
                const action = e.target.dataset.action;
                updateQuantity(index, action === 'increase' ? 1 : -1);
            }
        });
    }

    // Finalizar Pedido e Enviar para WhatsApp
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            const nome = document.getElementById('client-name').value;
            const telefone = document.getElementById('client-phone').value;
            const endereco = document.getElementById('client-address').value;
            const bairro = document.getElementById('client-neighborhood').value;
            const complemento = document.getElementById('client-complement').value;
            const obs = document.getElementById('order-notes').value;
            const deliveryType = document.querySelector('input[name="delivery-type"]:checked').value;
            const pagamento = document.querySelector('input[name="payment"]:checked').value;
            const troco = document.getElementById('change-for').value;

            if (deliveryType === 'Delivery') {
                if (!nome || !telefone || !endereco || !bairro) {
                    alert('Por favor, preencha nome, telefone e endereço completo para o delivery.');
                    return;
                }
            } else { // Para Retirada no local
                if (!nome || !telefone) {
                    alert('Por favor, preencha seu nome e telefone para a retirada.');
                    return;
                }
            }

            const numeroTelefone = '5599981331304'; // << SUBSTITUA PELO SEU NÚMERO DE WHATSAPP
            let mensagem = '🏮 *NOVO PEDIDO - SEIKO SUSHI BAR* 🏮\n\n';
            
            mensagem += '*Itens do Pedido:*\n';
            cart.forEach(item => {
                mensagem += `- ${item.quantity}x *${item.name}*`;
                if (item.flavor) mensagem += ` (${item.flavor})`;
                mensagem += `\n`;
            });

            if (deliveryType === 'Delivery') {
                mensagem += `Taxa de Entrega: R$ 5,00\n`;
            }

            mensagem += `\n*Total do Pedido: ${document.getElementById('cart-total-step2').textContent}*\n\n`;
            if (obs) mensagem += `*Observações:* ${obs}\n\n`;

            mensagem += `*Tipo de Entrega:* ${deliveryType}\n\n`;

            mensagem += '*Dados do Cliente:*\n';
            mensagem += `*Nome:* ${nome}\n`;
            mensagem += `*Telefone:* ${telefone}\n`;
            if (deliveryType === 'Delivery') {
                mensagem += `*Endereço:* ${endereco}, ${bairro}\n`;
                if (complemento) mensagem += `*Complemento:* ${complemento}\n`;
            }
            mensagem += `\n`;

            mensagem += '*Forma de Pagamento:*\n';
            mensagem += `${pagamento}`;
            if (pagamento === 'Dinheiro' && troco) {
                const trocoCalculado = changeDisplay.textContent;
                mensagem += ` (Pagar com R$ ${troco})`;
                if (trocoCalculado) {
                    mensagem += ` - ${trocoCalculado}`;
                }
            }
            if (pagamento === 'Cartão') {
                const cardType = document.querySelector('input[name="card-type"]:checked').value;
                mensagem += ` (${cardType})`;
            }

            const linkWhatsApp = `https://wa.me/${numeroTelefone}?text=${encodeURIComponent(mensagem)}`;
            window.location.href = linkWhatsApp;
        });
    }

    // Botão Voltar ao Topo
    const backToTopBtn = document.getElementById('back-to-top-btn');

    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Carregar o carrinho e atualizar a UI assim que a página carregar
    loadCart();
    updateCartUI();
});