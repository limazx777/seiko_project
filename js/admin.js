document.addEventListener('DOMContentLoaded', () => {
    const correctPassword = 'seiko2025'; // Defina sua senha aqui

    const loginOverlay = document.getElementById('login-overlay');
    const adminPanel = document.getElementById('admin-panel');
    const passwordInput = document.getElementById('password-input');
    const loginBtn = document.getElementById('login-btn');
    const menuEditor = document.getElementById('menu-editor');
    const generateCodeBtn = document.getElementById('generate-code-btn');
    const outputCode = document.getElementById('output-code');

    // Função para mostrar o painel e renderizar o editor
    const showAdminPanel = () => {
        loginOverlay.style.display = 'none';
        adminPanel.style.display = 'block';
        renderEditor();
    };

    // Função de Login
    const attemptLogin = () => {
        if (passwordInput.value === correctPassword) {
            // Salva o estado de login na sessão do navegador
            sessionStorage.setItem('seikoAdminLoggedIn', 'true');
            showAdminPanel();
        } else {
            alert('Senha incorreta!');
            sessionStorage.removeItem('seikoAdminLoggedIn'); // Garante que o estado de login seja removido em caso de falha
        }
    };

    loginBtn.addEventListener('click', attemptLogin);
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            attemptLogin();
        }
    });

    // Função para renderizar o editor
    const renderEditor = () => {
        menuEditor.innerHTML = '';
        Object.keys(menuData).forEach(categoryKey => {
            const categoryName = categoryKey.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            const categorySection = document.createElement('div');
            categorySection.innerHTML = `<h2 class="section-title">${categoryName}</h2>`;

            menuData[categoryKey].forEach((item, index) => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'admin-item';
                itemDiv.setAttribute('data-category', categoryKey);
                itemDiv.setAttribute('data-index', index);

                let optionsHTML = '';
                if (item.options) {
                    optionsHTML = '<div class="options-container"><h5>Opções</h5>';
                    item.options.forEach((opt, optIndex) => {
                        optionsHTML += `
                            <div class="option" data-opt-index="${optIndex}">
                                <input type="text" value="${opt.flavor}" placeholder="Sabor">
                                <input type="text" value="${opt.price}" placeholder="Preço (R$ 0,00)">
                            </div>
                        `;
                    });
                    optionsHTML += '</div>';
                }

                // Container para a lógica de upload de imagem
                const imageUploadId = `image-upload-${categoryKey}-${index}`;
                const imagePreviewId = `image-preview-${categoryKey}-${index}`;
                const removeImageBtnId = `remove-image-${categoryKey}-${index}`;
                const imagePathInputId = `image-path-${categoryKey}-${index}`;
                const imageUploadHTML = `
                    <div class="form-group">
                        <label>Imagem do Item</label>
                        <input type="file" id="${imageUploadId}" class="item-img-input" accept="image/*">
                        <label for="${imageUploadId}" class="image-upload-label">Escolher Imagem</label>
                        <button type="button" id="${removeImageBtnId}" class="remove-image-btn">Remover</button>
                        <input type="text" id="${imagePathInputId}" class="item-img-path" value="${item.img}" placeholder="Caminho da imagem (ex: images/cardapio/nome.jpg)">
                        <div class="image-preview-container">
                            <img id="${imagePreviewId}" src="${item.img}" alt="Pré-visualização" class="image-preview" style="${item.img ? 'display: block;' : ''}">
                        </div>
                    </div>`;

                // Nova estrutura de Acordeão
                itemDiv.innerHTML = `
                    <div class="admin-item-header">
                        <h4 class="item-name-header">${item.name}</h4>
                        <span class="toggle-icon">+</span>
                    </div>
                    <div class="admin-item-body">
                        <div class="form-group">
                            <label>Nome</label>
                            <input type="text" class="item-name" value="${item.name}">
                        </div>
                        <div class="form-group">
                            <label>Descrição</label>
                            <textarea class="item-description">${item.description}</textarea>
                        </div>
                        ${imageUploadHTML}
                        ${item.price ? `
                        <div class="form-group">
                            <label>Preço</label>
                            <input type="text" class="item-price" value="${item.price}">
                        </div>
                        ` : ''}
                        ${optionsHTML}
                    </div>
                `;
                categorySection.appendChild(itemDiv);
            });
            menuEditor.appendChild(categorySection);
        });

        // Adiciona os listeners para os novos inputs de imagem
        document.querySelectorAll('.item-img-input').forEach(input => {
            input.addEventListener('change', function(event) {
                const file = event.target.files[0];
                if (file) {
                    const preview = document.getElementById(this.id.replace('upload', 'preview'));
                    const removeBtn = document.getElementById(this.id.replace('upload', 'remove'));
                    const pathInput = document.getElementById(this.id.replace('upload', 'path'));

                    // Gera o caminho relativo padronizado
                    const newPath = `images/cardapio/${file.name}`;
                    pathInput.value = newPath;

                    // Para a pré-visualização, precisamos ler o arquivo
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        preview.src = e.target.result;
                        preview.style.display = 'block';
                        removeBtn.style.display = 'inline-block';
                    }
                    reader.readAsDataURL(file);

                    // Adiciona um listener para atualizar a preview se o caminho for editado manualmente
                    pathInput.addEventListener('input', () => {
                        preview.src = pathInput.value;
                    });
                }
            });
        });

        document.querySelectorAll('.remove-image-btn').forEach(button => {
            button.addEventListener('click', function() {
                const preview = document.getElementById(this.id.replace('remove', 'preview'));
                const fileInput = document.getElementById(this.id.replace('remove', 'upload'));
                const pathInput = document.getElementById(this.id.replace('remove', 'path'));
                preview.src = '#';
                preview.style.display = 'none';
                this.style.display = 'none';
                fileInput.value = ''; // Limpa o input de arquivo
                pathInput.value = ''; // Limpa o input de texto do caminho
            });
        });

        // Adiciona listener para o acordeão
        document.querySelectorAll('.admin-item-header').forEach(header => {
            header.addEventListener('click', () => {
                const item = header.closest('.admin-item');
                item.classList.toggle('active');

                // Atualiza o nome no header ao digitar no campo "Nome"
                const nameInput = item.querySelector('.item-name');
                const nameHeader = item.querySelector('.item-name-header');
                nameInput.addEventListener('input', () => {
                    nameHeader.textContent = nameInput.value;
                });
            });
        });
    };

    // Função para gerar o código
    generateCodeBtn.addEventListener('click', () => {
        const updatedMenuData = {};

        document.querySelectorAll('.admin-item').forEach(itemDiv => {
            const category = itemDiv.getAttribute('data-category');
            const index = parseInt(itemDiv.getAttribute('data-index'));

            if (!updatedMenuData[category]) {
                updatedMenuData[category] = [];
            }

            const newItem = {
                name: itemDiv.querySelector('.item-name').value,
                description: itemDiv.querySelector('.item-description').value,
                img: itemDiv.querySelector('.item-img-path').value, // Pega o caminho do input de texto
            };

            const priceInput = itemDiv.querySelector('.item-price');
            if (priceInput) {
                newItem.price = priceInput.value;
            }

            const optionsContainer = itemDiv.querySelector('.options-container');
            if (optionsContainer) {
                newItem.options = [];
                optionsContainer.querySelectorAll('.option').forEach(optDiv => {
                    const flavor = optDiv.querySelectorAll('input')[0].value;
                    const price = optDiv.querySelectorAll('input')[1].value;
                    newItem.options.push({ flavor, price });
                });
            }

            updatedMenuData[category].push(newItem);
        });

        // Formata o objeto como uma string de código JavaScript
        let outputString = 'const menuData = ';
        outputString += JSON.stringify(updatedMenuData, null, 4);
        outputString += ';';

        outputCode.value = outputString;
        alert('Código gerado! Agora você pode copiá-lo da caixa de texto.');
    });

    // Verifica se o usuário já está logado na sessão ao carregar a página
    if (sessionStorage.getItem('seikoAdminLoggedIn') === 'true') {
        showAdminPanel();
    }
});