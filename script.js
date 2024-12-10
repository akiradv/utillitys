document.addEventListener('DOMContentLoaded', () => {
    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'enabled') {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }

    // Adiciona o evento de clique para o botão de gerar QR Code
    const generateButton = document.getElementById('generate-qr-code');
    if (generateButton) {
        generateButton.addEventListener('click', generateQRCode);
    }

    // Adiciona o evento de clique para o botão de calcular idade
    const calculateButton = document.getElementById('calculate-age');
    if (calculateButton) {
        calculateButton.addEventListener('click', calculateAge);
    }

    // Adiciona o evento de clique para comparar datas
    const compareButton = document.getElementById('compare-dates');
    if (compareButton) {
        compareButton.addEventListener('click', compareDates);
    }

    // Adiciona o evento de clique para calcular idade no futuro
    const futureAgeButton = document.getElementById('calculate-future-age');
    if (futureAgeButton) {
        futureAgeButton.addEventListener('click', calculateFutureAge);
    }

    // Adiciona o evento de clique para o botão de busca de livros
    const searchButton = document.getElementById('search-button');
    if (searchButton) {
        searchButton.addEventListener('click', function() {
            const title = document.getElementById('book-title').value;
            const resultsDiv = document.getElementById('results');
            resultsDiv.innerHTML = ''; // Limpa resultados anteriores

            if (!title) {
                alert("Por favor, insira um título de livro!");
                return;
            }

            fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(title)}`)
                .then(response => response.json())
                .then(data => {
                    if (data.items) {
                        data.items.forEach(item => {
                            const bookInfo = item.volumeInfo;
                            const bookElement = document.createElement('div');
                            bookElement.className = 'book-item';
                            bookElement.innerHTML = `
                                <img src="${bookInfo.imageLinks ? bookInfo.imageLinks.thumbnail : 'https://via.placeholder.com/200x300?text=Sem+Imagem'}" alt="${bookInfo.title}">
                                <h3>${bookInfo.title}</h3>
                                <p>Autores: ${bookInfo.authors ? bookInfo.authors.join(', ') : 'Desconhecido'}</p>
                                <p>${bookInfo.description ? bookInfo.description : 'Sem descrição disponível.'}</p>
                                <a href="${bookInfo.infoLink}" target="_blank">Mais informações</a>
                            `;
                            resultsDiv.appendChild(bookElement);
                        });
                    } else {
                        resultsDiv.innerHTML = '<p>Nenhum livro encontrado.</p>';
                    }
                })
                .catch(error => {
                    console.error('Erro ao buscar livros:', error);
                    resultsDiv.innerHTML = '<p>Erro ao buscar livros. Tente novamente mais tarde.</p>';
                });
        });
    }
});

function appendToCalc(value) {
    const input = document.getElementById('calcInput');
    input.value += value;
}

function calculate() {
    const input = document.getElementById('calcInput');
    try {
        input.value = Function('"use strict";return (' + input.value + ')')();
    } catch {
        input.value = 'Erro';
    }
}

function clearCalc() {
    document.getElementById('calcInput').value = '';
}

function generatePassword() {
    const length = 12; // Tamanho da senha
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let password = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }
    document.getElementById('password').value = password;
}

function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const showPasswordButton = document.getElementById('show-password');
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        showPasswordButton.innerHTML = '<i class="fas fa-eye-slash"></i>'; // Ícone de esconder
    } else {
        passwordInput.type = "password";
        showPasswordButton.innerHTML = '<i class="fas fa-eye"></i>'; // Ícone de mostrar
    }
}

function copyToClipboard() {
    const passwordInput = document.getElementById('password');
    
    // Tenta usar a API de Clipboard
    navigator.clipboard.writeText(passwordInput.value)
        .then(() => {
            showNotification("Senha copiada!", "success"); // Exibe notificação de sucesso
        })
        .catch(err => {
            console.error("Erro ao tentar copiar: ", err);
            showNotification("Erro ao copiar a senha.", "error"); // Exibe notificação de erro
        });
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = 'notification ' + type;
    notification.textContent = message;

    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    notification.appendChild(progressBar);

    notification.onclick = () => {
        notification.style.transform = 'translateY(-100%)';
        notification.style.opacity = '0';
        setTimeout(() => {
            notification.remove();
        }, 300); // Tempo para a animação de subida
    };

    document.getElementById('notificationsContainer').appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000); // A notificação desaparece após 3 segundos
}

document.getElementById('check-button').addEventListener('click', function() {
    let textInput = document.getElementById('text-input').value;

    // Remover pontuação
    textInput = textInput.replace(/[.,!?;:]/g, ''); // Remove vírgulas, pontos, interrogações, etc.

    // Chamada à API do LanguageTool
    fetch('https://api.languagetoolplus.com/v2/check', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            'text': textInput,
            'language': 'pt-BR'
        })
    })
    .then(response => response.json())
    .then(data => {
        const matches = data.matches;
        const resultDiv = document.getElementById('result');

        if (matches.length > 0) {
            const incorrectWords = matches.map(match => {
                return {
                    word: match.context.text.substring(match.context.offset, match.context.offset + match.context.length),
                    suggestions: match.replacements.map(rep => rep.value).join(', ')
                };
            });

            resultDiv.innerHTML = "Palavras incorretas:<br>" + incorrectWords.map(item => 
                `${item.word} (Sugestões: ${item.suggestions})`
            ).join('<br>');
        } else {
            resultDiv.innerHTML = "Nenhuma palavra incorreta encontrada.";
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        document.getElementById('result').innerHTML = "Erro ao verificar a ortografia.";
    });
});

// Função para gerar QR Code
function generateQRCode() {
    const qrInput = document.getElementById('qr-input');
    const qrCodeDiv = document.getElementById('qr-code');
    const inputValue = qrInput.value.trim();

    if (!inputValue) {
        alert("Por favor, insira algo no campo de texto!");
        return;
    }

    // Limpa qualquer QR Code anterior
    qrCodeDiv.innerHTML = '';

    // Cria a imagem do QR Code
    const qrCodeImage = document.createElement('img');
    qrCodeImage.src = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(inputValue)}&size=200x200`;
    qrCodeDiv.appendChild(qrCodeImage);
}

// Função para calcular a idade
function calculateAge() {
    const birthdateInput = document.getElementById('birthdate');
    const ageResultDiv = document.getElementById('age-result');
    const birthdate = new Date(birthdateInput.value);

    if (!birthdateInput.value) {
        alert("Por favor, insira sua data de nascimento!");
        return;
    }

    const today = new Date();
    const ageInMilliseconds = today - birthdate;
    const ageInSeconds = Math.floor(ageInMilliseconds / 1000);
    const ageInMinutes = Math.floor(ageInSeconds / 60);
    const ageInHours = Math.floor(ageInMinutes / 60);
    const ageInDays = Math.floor(ageInHours / 24);
    const ageInYears = today.getFullYear() - birthdate.getFullYear();

    // Ajusta a idade se o aniversário ainda não tiver ocorrido este ano
    if (today < new Date(today.getFullYear(), birthdate.getMonth(), birthdate.getDate())) {
        ageInYears--;
    }

    // Calcular dias totais
    const totalDays = Math.floor(ageInMilliseconds / (1000 * 60 * 60 * 24));

    // Calcular próximo aniversário
    const nextBirthday = new Date(today.getFullYear(), birthdate.getMonth(), birthdate.getDate());
    if (nextBirthday < today) {
        nextBirthday.setFullYear(today.getFullYear() + 1);
    }
    const daysUntilNextBirthday = Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));

    // Horóscopo
    const zodiacSign = getZodiacSign(birthdate);

    ageResultDiv.innerHTML = `
        <h2>Resultados:</h2>
        <p>Idade: ${ageInYears} anos</p>
        <p>Minutos: ${ageInMinutes} minutos</p>
        <p>Segundos: ${ageInSeconds} segundos</p>
        <p>Dias Totais: ${totalDays} dias</p>
        <p>Próximo Aniversário: ${daysUntilNextBirthday} dias</p>
        <p>Signo: ${zodiacSign}</p>
    `;
}

// Função para comparar datas
function compareDates() {
    const date1Input = document.getElementById('date1');
    const date2Input = document.getElementById('date2');
    const comparisonResultDiv = document.getElementById('date-comparison-result');

    const date1 = new Date(date1Input.value);
    const date2 = new Date(date2Input.value);

    if (!date1Input.value || !date2Input.value) {
        alert("Por favor, insira ambas as datas!");
        return;
    }

    const differenceInMilliseconds = Math.abs(date2 - date1);
    const differenceInSeconds = Math.floor(differenceInMilliseconds / 1000);
    const differenceInMinutes = Math.floor(differenceInSeconds / 60);
    const differenceInHours = Math.floor(differenceInMinutes / 60);
    const differenceInDays = Math.floor(differenceInHours / 24);

    comparisonResultDiv.innerHTML = `
        <h2>Diferença:</h2>
        <p>${differenceInDays} dias</p>
        <p>${differenceInHours} horas</p>
        <p>${differenceInMinutes} minutos</p>
        <p>${differenceInSeconds} segundos</p>
    `;
}

// Função para calcular a idade no futuro
function calculateFutureAge() {
    const birthdateInput = document.getElementById('birthdate');
    const futureYearInput = document.getElementById('future-year');
    const futureAgeResultDiv = document.getElementById('future-age-result');
    const birthdate = new Date(birthdateInput.value);
    const futureYear = parseInt(futureYearInput.value);

    if (!birthdateInput.value || isNaN(futureYear)) {
        alert("Por favor, insira sua data de nascimento e um ano futuro!");
        return;
    }

    const currentYear = new Date().getFullYear();

    // Verifica se o ano futuro é maior que o ano atual
    if (futureYear <= currentYear) {
        alert("Por favor, insira um ano futuro válido!");
        return;
    }

    const futureAge = futureYear - birthdate.getFullYear();
    futureAgeResultDiv.innerHTML = `
        <h2>Idade em ${futureYear}:</h2>
        <p>${futureAge} anos</p>
    `;
}

// Função para obter o signo zodiacal
function getZodiacSign(birthdate) {
    const month = birthdate.getMonth() + 1; // Janeiro é 0
    const day = birthdate.getDate();

    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Aquário";
    if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return "Peixes";
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Áries";
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Touro";
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gêmeos";
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Câncer";
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leão";
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgem";
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Escorpião";
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagitário";
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Capricórnio";
}

// Função para calcular o ano de nascimento
function calculateBirthYear() {
    const ageInput = document.getElementById('age-input');
    const birthyearResultDiv = document.getElementById('birthyear-result');
    const age = parseInt(ageInput.value);

    if (isNaN(age) || age < 0) {
        alert("Por favor, insira uma idade válida!");
        return;
    }

    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - age;

    birthyearResultDiv.innerHTML = `Você nasceu em: ${birthYear}`;
}

// Adiciona o evento de clique para o botão de calcular ano de nascimento
document.getElementById('calculate-birthyear').addEventListener('click', calculateBirthYear);

// ... código existente ...

