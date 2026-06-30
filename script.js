document.addEventListener('DOMContentLoaded', () => {
    // Dark mode (se existir)
    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'enabled') {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }

    // === QR Code Generator ===
    const generateButton = document.getElementById('generate-qr-code');
    if (generateButton) {
        generateButton.addEventListener('click', generateQRCode);
    }

    // === Calculadora de Idade ===
    const calculateButton = document.getElementById('calculate-age');
    if (calculateButton) {
        calculateButton.addEventListener('click', calculateAge);
    }

    const compareButton = document.getElementById('compare-dates');
    if (compareButton) {
        compareButton.addEventListener('click', compareDates);
    }

    const futureAgeButton = document.getElementById('calculate-future-age');
    if (futureAgeButton) {
        futureAgeButton.addEventListener('click', calculateFutureAge);
    }

    // === Busca de Livros ===
    const searchButton = document.getElementById('search-button');
    if (searchButton) {
        searchButton.addEventListener('click', function() {
            const title = document.getElementById('book-title').value;
            const resultsDiv = document.getElementById('results');
            resultsDiv.innerHTML = '';

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

// Filtro de busca
const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('input', function() {
        const term = this.value.toLowerCase().trim();
        const cards = document.querySelectorAll('.utilidade-card');
        cards.forEach(card => {
            const title = card.querySelector('h3')?.textContent?.toLowerCase() || '';
            const desc = card.querySelector('p')?.textContent?.toLowerCase() || '';
            const match = title.includes(term) || desc.includes(term);
            card.style.display = match ? '' : 'none';
        });
    });
}

    // === Encurtador de URL ===
    const shortenBtn = document.getElementById('shorten-button');
    if (shortenBtn) {
        shortenBtn.addEventListener('click', shortenURL);
    }

    async function shortenURL() {
        const urlInput = document.getElementById('url-input').value;
        const shortenedUrlElement = document.getElementById('shortened-url');

        if (!urlInput) {
            shortenedUrlElement.textContent = "Por favor, insira uma URL.";
            return;
        }

        try {
            const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(urlInput)}`);
            if (response.ok) {
                const shortUrl = await response.text();
                shortenedUrlElement.innerHTML = `
                    URL Encurtada: <a href="${shortUrl}" target="_blank">${shortUrl}</a>
                    <button onclick="copyToClipboard('${shortUrl}')" class="btn">Copiar</button>
                `;
            } else {
                shortenedUrlElement.textContent = "Erro ao encurtar a URL. Verifique se a URL é válida.";
            }
        } catch (error) {
            console.error('Erro:', error);
            shortenedUrlElement.textContent = "Erro ao conectar com o serviço de encurtamento.";
        }
    }

    // === Texto para Fala ===
    const textInput = document.getElementById('text-input');
    const speakButton = document.getElementById('speak-button');
    const pauseButton = document.getElementById('pause-button');
    const resumeButton = document.getElementById('resume-button');
    const stopButton = document.getElementById('stop-button');
    const rateInput = document.getElementById('rate');
    const langSelect = document.getElementById('lang');

    let utterance = null;
    let speaking = false;

    if (speakButton) {
        speakButton.addEventListener('click', () => {
            const text = textInput.value.trim();
            if (!text) {
                alert('Por favor, digite algum texto para falar.');
                return;
            }
            window.speechSynthesis.cancel();
            utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = langSelect.value;
            utterance.rate = parseFloat(rateInput.value);
            utterance.onstart = () => { speaking = true; };
            utterance.onend = () => { speaking = false; };
            window.speechSynthesis.speak(utterance);
        });
    }

    if (pauseButton) {
        pauseButton.addEventListener('click', () => {
            if (speaking && window.speechSynthesis.speaking) {
                window.speechSynthesis.pause();
            }
        });
    }

    if (resumeButton) {
        resumeButton.addEventListener('click', () => {
            if (speaking && window.speechSynthesis.paused) {
                window.speechSynthesis.resume();
            }
        });
    }

    if (stopButton) {
        stopButton.addEventListener('click', () => {
            if (speaking) {
                window.speechSynthesis.cancel();
                speaking = false;
            }
        });
    }

    // === Corretor Ortográfico ===
    const checkButton = document.getElementById('check-button');
    if (checkButton) {
        checkButton.addEventListener('click', function() {
            let textInput = document.getElementById('text-input').value;
            textInput = textInput.replace(/[.,!?;:]/g, '');

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
    }

    // === Calcular Ano de Nascimento ===
    const birthyearBtn = document.getElementById('calculate-birthyear');
    if (birthyearBtn) {
        birthyearBtn.addEventListener('click', calculateBirthYear);
    }
});

// =====================================================
// FUNÇÕES GLOBAIS (usadas em várias páginas)
// =====================================================

function appendToCalc(value) {
    const input = document.getElementById('calcInput');
    if (input) input.value += value;
}

function calculate() {
    const input = document.getElementById('calcInput');
    if (!input) return;
    try {
        input.value = Function('"use strict";return (' + input.value + ')')();
    } catch {
        input.value = 'Erro';
    }
}

function clearCalc() {
    const input = document.getElementById('calcInput');
    if (input) input.value = '';
}

function generatePassword() {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let password = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }
    const passwordField = document.getElementById('password');
    if (passwordField) passwordField.value = password;
}

function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const showPasswordButton = document.getElementById('show-password');
    if (!passwordInput || !showPasswordButton) return;
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        showPasswordButton.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
        passwordInput.type = "password";
        showPasswordButton.innerHTML = '<i class="fas fa-eye"></i>';
    }
}

function copyToClipboard(text) {
    // Para senha (sem argumento) ou URL encurtada (com argumento)
    const textToCopy = text || document.getElementById('password')?.value || '';
    if (!textToCopy) {
        showNotification("Nada para copiar.", "error");
        return;
    }
    navigator.clipboard.writeText(textToCopy)
        .then(() => {
            showNotification("Copiado com sucesso!", "success");
        })
        .catch(() => {
            showNotification("Erro ao copiar.", "error");
        });
}

function showNotification(message, type) {
    const container = document.getElementById('notificationsContainer');
    if (!container) {
        // fallback: alert simples
        alert(message);
        return;
    }
    const notification = document.createElement('div');
    notification.className = 'notification ' + type;
    notification.textContent = message;
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    notification.appendChild(progressBar);
    notification.onclick = () => {
        notification.style.transform = 'translateY(-100%)';
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    };
    container.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function generateQRCode() {
    const qrInput = document.getElementById('qr-input');
    const qrCodeDiv = document.getElementById('qr-code');
    if (!qrInput || !qrCodeDiv) return;
    const inputValue = qrInput.value.trim();
    if (!inputValue) {
        alert("Por favor, insira algo no campo de texto!");
        return;
    }
    qrCodeDiv.innerHTML = '';
    const qrCodeImage = document.createElement('img');
    qrCodeImage.src = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(inputValue)}&size=200x200`;
    qrCodeDiv.appendChild(qrCodeImage);
}

function calculateAge() {
    const birthdateInput = document.getElementById('birthdate');
    const ageResultDiv = document.getElementById('age-result');
    if (!birthdateInput || !ageResultDiv) return;
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
    let ageInYears = today.getFullYear() - birthdate.getFullYear();
    if (today < new Date(today.getFullYear(), birthdate.getMonth(), birthdate.getDate())) {
        ageInYears--;
    }
    const totalDays = Math.floor(ageInMilliseconds / (1000 * 60 * 60 * 24));
    const nextBirthday = new Date(today.getFullYear(), birthdate.getMonth(), birthdate.getDate());
    if (nextBirthday < today) {
        nextBirthday.setFullYear(today.getFullYear() + 1);
    }
    const daysUntilNextBirthday = Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));
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

function compareDates() {
    const date1Input = document.getElementById('date1');
    const date2Input = document.getElementById('date2');
    const comparisonResultDiv = document.getElementById('date-comparison-result');
    if (!date1Input || !date2Input || !comparisonResultDiv) return;
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

function calculateFutureAge() {
    const birthdateInput = document.getElementById('birthdate');
    const futureYearInput = document.getElementById('future-year');
    const futureAgeResultDiv = document.getElementById('future-age-result');
    if (!birthdateInput || !futureYearInput || !futureAgeResultDiv) return;
    const birthdate = new Date(birthdateInput.value);
    const futureYear = parseInt(futureYearInput.value);
    if (!birthdateInput.value || isNaN(futureYear)) {
        alert("Por favor, insira sua data de nascimento e um ano futuro!");
        return;
    }
    const currentYear = new Date().getFullYear();
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

function getZodiacSign(birthdate) {
    const month = birthdate.getMonth() + 1;
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

function calculateBirthYear() {
    const ageInput = document.getElementById('age-input');
    const birthyearResultDiv = document.getElementById('birthyear-result');
    if (!ageInput || !birthyearResultDiv) return;
    const age = parseInt(ageInput.value);
    if (isNaN(age) || age < 0) {
        alert("Por favor, insira uma idade válida!");
        return;
    }
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - age;
    birthyearResultDiv.innerHTML = `Você nasceu em: ${birthYear}`;
}

function speak() {
    const text = document.getElementById("text")?.value;
    if (!text || text.trim() === "") {
        showNotification("Por favor, insira algum texto.", "error");
        return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    window.speechSynthesis.speak(utterance);
}

function calculateIMC() {
    const peso = parseFloat(document.getElementById('peso')?.value);
    const altura = parseFloat(document.getElementById('altura')?.value);
    const resultado = document.getElementById('resultado-imc');
    if (!peso || !altura || altura <= 0 || !resultado) {
        alert('Por favor, insira valores válidos.');
        return;
    }
    const imc = peso / (altura * altura);
    let classificacao = '';
    if (imc < 18.5) classificacao = 'Abaixo do peso';
    else if (imc < 25) classificacao = 'Peso normal';
    else if (imc < 30) classificacao = 'Sobrepeso';
    else if (imc < 35) classificacao = 'Obesidade grau 1';
    else if (imc < 40) classificacao = 'Obesidade grau 2';
    else classificacao = 'Obesidade grau 3';
    resultado.innerHTML = `<p>Seu IMC é <strong>${imc.toFixed(2)}</strong> - ${classificacao}</p>`;
}

// =====================================================
// TOGGLE DE VISUALIZAÇÃO (somente na página inicial)
// =====================================================
document.addEventListener('DOMContentLoaded', function() {
    const grid = document.querySelector('.utilidade-grid');
    const btnCompact = document.getElementById('btn-compact');
    const btnExpand = document.getElementById('btn-expand');

    // Só executa se os elementos existirem (página inicial)
    if (grid && btnCompact && btnExpand) {
        const modo = localStorage.getItem('viewMode') || 'expand';
        if (modo === 'compact') {
            grid.classList.add('compact');
            btnCompact.classList.add('active');
            btnExpand.classList.remove('active');
        } else {
            grid.classList.remove('compact');
            btnExpand.classList.add('active');
            btnCompact.classList.remove('active');
        }

        btnCompact.addEventListener('click', function() {
            console.log('Clicou em Compactado');
            grid.classList.add('compact');
            btnCompact.classList.add('active');
            btnExpand.classList.remove('active');
            localStorage.setItem('viewMode', 'compact');
        });

        btnExpand.addEventListener('click', function() {
            console.log('Clicou em Expandido');
            grid.classList.remove('compact');
            btnExpand.classList.add('active');
            btnCompact.classList.remove('active');
            localStorage.setItem('viewMode', 'expand');
        });
    }
});

// Relógio Mundial
function updateClocks() {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;

    const cities = [
        { id: 'local', offset: 0, label: 'Local' },
        { id: 'ny', offset: -4, label: 'Nova York' },
        { id: 'london', offset: 1, label: 'Londres' },
        { id: 'tokyo', offset: 9, label: 'Tóquio' },
        { id: 'sydney', offset: 10, label: 'Sydney' },
        { id: 'berlin', offset: 2, label: 'Berlim' }
    ];

    cities.forEach(city => {
        const timeElement = document.getElementById(`${city.id}-time`);
        const dateElement = document.getElementById(`${city.id}-date`);
        if (!timeElement) return;

        const localTime = new Date(utc + city.offset * 3600000);
        const hours = String(localTime.getHours()).padStart(2, '0');
        const minutes = String(localTime.getMinutes()).padStart(2, '0');
        const seconds = String(localTime.getSeconds()).padStart(2, '0');
        timeElement.textContent = `${hours}:${minutes}:${seconds}`;

        if (dateElement) {
            const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
            dateElement.textContent = localTime.toLocaleDateString('pt-BR', options);
        }
    });
}

// Atualiza a cada segundo
if (document.getElementById('local-time')) {
    updateClocks();
    setInterval(updateClocks, 1000);
}

function gerarCurriculo() {
    const nome = document.getElementById('nome').value.trim();
    if (!nome) {
        alert('Por favor, preencha pelo menos o nome.');
        return;
    }
    const email = document.getElementById('email').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const endereco = document.getElementById('endereco').value.trim();
    const resumo = document.getElementById('resumo').value.trim();
    const experiencia = document.getElementById('experiencia').value.trim();
    const formacao = document.getElementById('formacao').value.trim();
    const habilidades = document.getElementById('habilidades').value.trim();

    const html = `
        <div style="background:#fff; color:#000; padding:30px; border-radius:10px; text-align:left; max-width:700px; margin:0 auto; font-family:Arial, sans-serif;">
            <h1 style="font-size:28px; margin-bottom:4px;">${nome}</h1>
            <p style="margin:4px 0;">${email} ${telefone ? '| ' + telefone : ''}</p>
            <p style="margin:4px 0;">${endereco}</p>
            ${resumo ? `<hr><h3>Resumo</h3><p>${resumo}</p>` : ''}
            ${experiencia ? `<hr><h3>Experiência</h3><p>${experiencia.replace(/\n/g, '<br>')}</p>` : ''}
            ${formacao ? `<hr><h3>Formação</h3><p>${formacao.replace(/\n/g, '<br>')}</p>` : ''}
            ${habilidades ? `<hr><h3>Habilidades</h3><p>${habilidades.split(',').map(h => h.trim()).join(' • ')}</p>` : ''}
        </div>
    `;

    document.getElementById('resume-content').innerHTML = html;
    document.getElementById('resume-preview').style.display = 'block';
    document.querySelector('.resume-form').style.display = 'none';
}

function imprimirCurriculo() {
    const content = document.getElementById('resume-content').innerHTML;
    const win = window.open('', '_blank');
    win.document.write(`
        <html>
            <head><title>Currículo</title>
            <style>body { margin: 0; padding: 20px; }</style>
            </head>
            <body>${content}</body>
        </html>
    `);
    win.document.close();
    win.print();
}

function voltarFormulario() {
    document.getElementById('resume-preview').style.display = 'none';
    document.querySelector('.resume-form').style.display = 'block';
    // Opcional: limpa os campos se quiser
    // document.getElementById('resume-form').reset();
}