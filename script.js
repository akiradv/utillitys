document.addEventListener('DOMContentLoaded', () => {
    // Dark mode (se existir)
    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'enabled') {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }

    // === GERADOR DE SENHAS MODERNO ===
    const passwordField = document.getElementById('password');
    const lengthRange = document.getElementById('length-range');
    const lengthNumber = document.getElementById('length-number');
    const generateBtn = document.getElementById('generate-btn');
    const showPasswordBtn = document.getElementById('show-password');
    const copyPasswordBtn = document.getElementById('copy-password');

    if (passwordField) {
        if (lengthRange && lengthNumber) {
            lengthRange.addEventListener('input', function() {
                lengthNumber.value = this.value;
                generatePassword();
            });
            lengthNumber.addEventListener('input', function() {
                let val = parseInt(this.value) || 4;
                if (val < 4) val = 4;
                if (val > 32) val = 32;
                this.value = val;
                lengthRange.value = val;
                generatePassword();
            });
        }

        document.querySelectorAll('#include-uppercase, #include-lowercase, #include-numbers, #include-symbols').forEach(cb => {
            cb.addEventListener('change', generatePassword);
        });

        if (generateBtn) {
            generateBtn.addEventListener('click', generatePassword);
        }

        if (showPasswordBtn) {
            showPasswordBtn.addEventListener('click', function() {
                const input = document.getElementById('password');
                if (input.type === 'password') {
                    input.type = 'text';
                    this.innerHTML = '<i class="fas fa-eye-slash"></i>';
                } else {
                    input.type = 'password';
                    this.innerHTML = '<i class="fas fa-eye"></i>';
                }
            });
        }

        if (copyPasswordBtn) {
            copyPasswordBtn.addEventListener('click', function() {
                const input = document.getElementById('password');
                if (input.value) {
                    navigator.clipboard.writeText(input.value)
                        .then(() => showNotification('Senha copiada com sucesso!', 'success'))
                        .catch(() => showNotification('Erro ao copiar.', 'error'));
                } else {
                    showNotification('Nenhuma senha para copiar.', 'error');
                }
            });
        }

        generatePassword();
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

    // === Busca de Livros (Open Library) ===
    const searchButton = document.getElementById('search-button');
    if (searchButton) {
        searchButton.addEventListener('click', function() {
            const title = document.getElementById('book-title').value.trim();
            const resultsDiv = document.getElementById('results');
            resultsDiv.innerHTML = '<p>🔍 Buscando...</p>';

            if (!title) {
                alert("Por favor, insira um título de livro!");
                resultsDiv.innerHTML = '';
                return;
            }

            const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(title)}`;

            fetch(url, {
                headers: {
                    'User-Agent': 'Utillitys-App/1.0'
                }
            })
            .then(response => {
                if (!response.ok) {
                    if (response.status === 422) {
                        throw new Error('A API do Open Library rejeitou a requisição. Tente um termo de busca mais simples.');
                    }
                    throw new Error(`Erro na API: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                resultsDiv.innerHTML = '';
                if (data.docs && data.docs.length > 0) {
                    data.docs.forEach(book => {
                        const bookElement = document.createElement('div');
                        bookElement.className = 'book-item';

                        const coverId = book.cover_i;
                        const coverUrl = coverId 
                            ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` 
                            : 'https://via.placeholder.com/200x300?text=Sem+Capa';

                        const authors = book.author_name ? book.author_name.join(', ') : 'Desconhecido';
                        const year = book.first_publish_year || 'Ano desconhecido';

                        bookElement.innerHTML = `
                            <img src="${coverUrl}" alt="${book.title}" onerror="this.src='https://via.placeholder.com/200x300?text=Sem+Imagem'" loading="lazy">
                            <h3>${book.title}</h3>
                            <p><strong>Autores:</strong> ${authors}</p>
                            <p><strong>Publicado:</strong> ${year}</p>
                            <p>${book.first_sentence ? book.first_sentence[0] : 'Sem descrição disponível.'}</p>
                            <a href="https://openlibrary.org${book.key}" target="_blank">Ver no Open Library</a>
                        `;
                        resultsDiv.appendChild(bookElement);
                    });
                } else {
                    resultsDiv.innerHTML = '<p>📭 Nenhum livro encontrado.</p>';
                }
            })
            .catch(error => {
                console.error('Erro ao buscar livros:', error);
                resultsDiv.innerHTML = `<p>❌ Erro ao buscar livros: ${error.message}. Tente novamente mais tarde.</p>`;
            });
        });
    }

    // === Filtro de busca ===
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

    // ============================================
    // TEXTO PARA VOZ (CORRIGIDO)
    // ============================================
    const speakBtn = document.getElementById('tts-speak');
    const stopBtn = document.getElementById('tts-stop');
    const downloadBtn = document.getElementById('tts-download');
    const textarea = document.getElementById('tts-text');
    const langSelect = document.getElementById('tts-lang');
    const rateRange = document.getElementById('tts-rate');
    const rateLabel = document.getElementById('rate-label');
    const statusDiv = document.getElementById('tts-status');

    if (speakBtn) {
        if (rateRange && rateLabel) {
            rateRange.addEventListener('input', function() {
                rateLabel.textContent = parseFloat(this.value).toFixed(1) + 'x';
            });
        }

        let utterance = null;
        let isSpeaking = false;
        let audioBlob = null;

        function gerarAudioParaDownload(texto, idioma) {
            const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(texto)}&tl=${idioma}&client=tw-ob`;
            if (statusDiv) statusDiv.textContent = '⏳ Gerando áudio para download...';

            fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            })
            .then(response => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return response.blob();
            })
            .then(blob => {
                audioBlob = blob;
                if (downloadBtn) {
                    downloadBtn.style.display = 'inline-flex';
                    downloadBtn.textContent = '⬇ Baixar Áudio (MP3)';
                }
                if (statusDiv) statusDiv.textContent = '✅ Áudio gerado! Clique em "Baixar Áudio" para salvar.';
            })
            .catch(error => {
                console.error('Erro ao gerar áudio:', error);
                if (statusDiv) statusDiv.textContent = '⚠️ Não foi possível gerar o arquivo de áudio. A fala ainda funciona normalmente.';
                if (downloadBtn) downloadBtn.style.display = 'none';
            });
        }

        speakBtn.addEventListener('click', function() {
            const text = textarea ? textarea.value.trim() : '';
            if (!text) {
                if (statusDiv) statusDiv.textContent = '⚠️ Digite algum texto primeiro.';
                return;
            }

            if (window.speechSynthesis.speaking) {
                window.speechSynthesis.cancel();
            }

            const lang = langSelect ? langSelect.value : 'en-US';
            const rate = rateRange ? parseFloat(rateRange.value) : 1;

            if (!window.speechSynthesis) {
                if (statusDiv) statusDiv.textContent = '❌ Seu navegador não suporta síntese de voz.';
                return;
            }

            utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang;
            utterance.rate = rate;

            utterance.onstart = function() {
                isSpeaking = true;
                if (statusDiv) statusDiv.textContent = '🔊 Falando...';
                speakBtn.disabled = true;
                speakBtn.textContent = '⏳ Falando...';
                if (downloadBtn) downloadBtn.style.display = 'none';
            };

            utterance.onend = function() {
                isSpeaking = false;
                if (statusDiv) statusDiv.textContent = '✅ Fala concluída! Gerando áudio...';
                speakBtn.disabled = false;
                speakBtn.textContent = '▶ Falar';
                gerarAudioParaDownload(text, lang);
            };

            utterance.onerror = function(event) {
                isSpeaking = false;
                if (statusDiv) statusDiv.textContent = '❌ Erro na fala: ' + event.error;
                speakBtn.disabled = false;
                speakBtn.textContent = '▶ Falar';
                console.error('Erro na fala:', event);
                gerarAudioParaDownload(text, lang);
            };

            try {
                window.speechSynthesis.speak(utterance);
                setTimeout(() => {
                    if (!isSpeaking && !window.speechSynthesis.speaking) {
                        if (statusDiv) statusDiv.textContent = '⚠️ A fala pode não estar disponível, mas você pode baixar o áudio.';
                        speakBtn.disabled = false;
                        speakBtn.textContent = '▶ Falar';
                        gerarAudioParaDownload(text, lang);
                    }
                }, 2000);
            } catch (e) {
                if (statusDiv) statusDiv.textContent = '❌ Erro ao iniciar fala: ' + e.message;
                speakBtn.disabled = false;
                speakBtn.textContent = '▶ Falar';
                console.error(e);
                gerarAudioParaDownload(text, lang);
            }
        });

        if (stopBtn) {
            stopBtn.addEventListener('click', function() {
                if (window.speechSynthesis.speaking) {
                    window.speechSynthesis.cancel();
                }
                isSpeaking = false;
                if (statusDiv) statusDiv.textContent = '⏹ Parado.';
                speakBtn.disabled = false;
                speakBtn.textContent = '▶ Falar';
                if (downloadBtn) downloadBtn.style.display = 'none';
            });
        }

        if (downloadBtn) {
            downloadBtn.addEventListener('click', function() {
                if (audioBlob) {
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(audioBlob);
                    link.download = 'audio.mp3';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    setTimeout(() => URL.revokeObjectURL(link.href), 5000);
                } else {
                    alert('Áudio ainda não disponível. Fale o texto primeiro ou clique em "Falar" para gerar.');
                }
            });
        }
    }

    // === CORRETOR ORTOGRÁFICO (melhorado) ===
    const checkButton = document.getElementById('check-button');
    if (checkButton) {
        checkButton.addEventListener('click', function() {
            const textInput = document.getElementById('text-input');
            const resultDiv = document.getElementById('result');
            const text = textInput.value.trim();

            if (!text) {
                resultDiv.innerHTML = '⚠️ Digite algum texto para verificar.';
                resultDiv.style.display = 'block';
                resultDiv.style.borderLeftColor = '#f39c12';
                return;
            }

            resultDiv.innerHTML = '⏳ Verificando ortografia...';
            resultDiv.style.display = 'block';
            resultDiv.style.borderLeftColor = '#3498db';

            // Remove pontuação para melhor análise
            const cleanText = text.replace(/[.,!?;:]/g, '');

            fetch('https://api.languagetoolplus.com/v2/check', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    'text': cleanText,
                    'language': 'pt-BR'
                })
            })
            .then(response => {
                if (!response.ok) throw new Error('Erro na API');
                return response.json();
            })
            .then(data => {
                const matches = data.matches;
                if (matches.length > 0) {
                    let html = '<p><strong>🔍 Palavras com possíveis erros:</strong></p>';
                    matches.forEach(match => {
                        const word = match.context.text.substring(match.context.offset, match.context.offset + match.context.length);
                        const suggestions = match.replacements.map(rep => rep.value).join(', ');
                        html += `
                            <div style="margin:6px 0; padding:6px 10px; background:var(--bg-input); border-radius:6px;">
                                <span class="error-word">${word}</span>
                                → <span class="suggestion">${suggestions || 'Sem sugestões'}</span>
                                ${match.message ? `<br><small style="color:var(--text-muted);">${match.message}</small>` : ''}
                            </div>
                        `;
                    });
                    resultDiv.innerHTML = html;
                    resultDiv.style.borderLeftColor = '#e74c3c';
                } else {
                    resultDiv.innerHTML = '<p class="no-errors">✅ Nenhum erro ortográfico encontrado!</p>';
                    resultDiv.style.borderLeftColor = '#2ecc71';
                }
            })
            .catch(error => {
                console.error('Erro:', error);
                resultDiv.innerHTML = '❌ Erro ao verificar a ortografia. Tente novamente mais tarde.';
                resultDiv.style.borderLeftColor = '#e74c3c';
            });
        });
    }

    // === Contador de caracteres/palavras (adicionado ao textarea do ortografia) ===
    const textInputSpell = document.getElementById('text-input');
    if (textInputSpell) {
        textInputSpell.addEventListener('input', updateTextStats);
        updateTextStats();
    }

    // === Calcular Ano de Nascimento ===
    const birthyearBtn = document.getElementById('calculate-birthyear');
    if (birthyearBtn) {
        birthyearBtn.addEventListener('click', calculateBirthYear);
    }

    // === TOGGLE DE VISUALIZAÇÃO (página inicial) ===
    const grid = document.querySelector('.utilidade-grid');
    const btnCompact = document.getElementById('btn-compact');
    const btnExpand = document.getElementById('btn-expand');

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
            grid.classList.add('compact');
            btnCompact.classList.add('active');
            btnExpand.classList.remove('active');
            localStorage.setItem('viewMode', 'compact');
        });

        btnExpand.addEventListener('click', function() {
            grid.classList.remove('compact');
            btnExpand.classList.add('active');
            btnCompact.classList.remove('active');
            localStorage.setItem('viewMode', 'expand');
        });
    }

    // === Conversor de Moedas ===
    const convertBtn = document.getElementById('convert-btn');
    if (convertBtn) {
        convertBtn.addEventListener('click', converterMoeda);
        converterMoeda();
    }
});

// =====================================================
// FUNÇÕES GLOBAIS
// =====================================================

// ============================================
// CALCULADORA MELHORADA
// ============================================
let calcHistory = [];

function appendToCalc(value) {
    const input = document.getElementById('calcInput');
    const expression = document.getElementById('calcExpression');
    if (!input) return;

    const operators = ['+', '-', '*', '/', '%'];
    const lastChar = input.value.slice(-1);
    if (operators.includes(value) && operators.includes(lastChar)) {
        input.value = input.value.slice(0, -1) + value;
        return;
    }

    input.value += value;

    if (expression) {
        let displayExpr = input.value
            .replace(/\*/g, '×')
            .replace(/\//g, '÷')
            .replace(/-/g, '−');
        expression.textContent = displayExpr;
    }

    updateTextStats();
}

function calculate() {
    const input = document.getElementById('calcInput');
    const expression = document.getElementById('calcExpression');
    if (!input || !input.value) return;

    try {
        let expr = input.value.replace(/%/g, '/100');
        const result = Function('"use strict";return (' + expr + ')')();

        const historyItem = `${input.value} = ${result}`;
        calcHistory.push(historyItem);
        if (calcHistory.length > 10) calcHistory.shift();
        updateHistory();

        if (expression) expression.textContent = input.value + ' =';
        input.value = result;

        updateTextStats();
    } catch {
        input.value = 'Erro';
        if (expression) expression.textContent = '';
        setTimeout(() => {
            input.value = '';
            if (expression) expression.textContent = '';
        }, 1500);
    }
}

function clearCalc() {
    const input = document.getElementById('calcInput');
    const expression = document.getElementById('calcExpression');
    if (input) input.value = '';
    if (expression) expression.textContent = '';
    updateTextStats();
}

function deleteLast() {
    const input = document.getElementById('calcInput');
    const expression = document.getElementById('calcExpression');
    if (!input) return;
    input.value = input.value.slice(0, -1);
    if (expression) {
        expression.textContent = input.value
            .replace(/\*/g, '×')
            .replace(/\//g, '÷')
            .replace(/-/g, '−');
    }
    updateTextStats();
}

function updateHistory() {
    const list = document.getElementById('historyList');
    if (!list) return;
    list.innerHTML = calcHistory.map(item => `<li>${item}</li>`).join('');
}

// ============================================
// CONTADOR DE TEXTO (para verificador ortográfico e calculadora)
// ============================================
function updateTextStats() {
    const textarea = document.getElementById('text-input');
    const charCount = document.getElementById('charCount');
    const wordCount = document.getElementById('wordCount');
    if (textarea && charCount && wordCount) {
        const text = textarea.value;
        charCount.textContent = text.length;
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        wordCount.textContent = words;
    }
}

// ============================================
// GERADOR DE SENHAS (MODERNO)
// ============================================
function generatePassword() {
    const passwordField = document.getElementById('password');
    if (!passwordField) return;

    const length = parseInt(document.getElementById('length-range')?.value) || 12;
    const includeUpper = document.getElementById('include-uppercase')?.checked ?? true;
    const includeLower = document.getElementById('include-lowercase')?.checked ?? true;
    const includeNumbers = document.getElementById('include-numbers')?.checked ?? true;
    const includeSymbols = document.getElementById('include-symbols')?.checked ?? true;

    let charset = '';
    if (includeUpper) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeLower) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (charset === '') {
        alert('Selecione pelo menos um tipo de caractere.');
        return;
    }

    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }

    passwordField.value = password;
    updateStrength(password);
}

function updateStrength(password) {
    const bar = document.getElementById('strength-bar-fill');
    const text = document.getElementById('strength-text');
    if (!bar || !text) return;

    let score = 0;
    const len = password.length;
    if (len >= 8) score += 1;
    if (len >= 12) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;

    let percent, label, color;
    if (score <= 2) { percent = 20; label = 'Fraca'; color = '#e74c3c'; }
    else if (score <= 3) { percent = 45; label = 'Média'; color = '#f39c12'; }
    else if (score <= 4) { percent = 70; label = 'Forte'; color = '#2ecc71'; }
    else { percent = 100; label = 'Muito Forte'; color = '#27ae60'; }

    bar.style.width = percent + '%';
    bar.style.background = color;
    text.textContent = label;
    text.style.color = color;
}

// ============================================
// OUTRAS FUNÇÕES
// ============================================
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

// Relógio Mundial
function updateClocks() {
    const now = new Date();
    const localOffsetMinutes = now.getTimezoneOffset();
    const localOffsetHours = -localOffsetMinutes / 60;

    const cities = [
        { id: 'local', offset: localOffsetHours, label: 'Sua localização', icon: '📍', isLocal: true },
        { id: 'ny', offset: -4, label: 'Nova York', icon: '🗽' },
        { id: 'london', offset: 1, label: 'Londres', icon: '🇬🇧' },
        { id: 'berlin', offset: 2, label: 'Berlim', icon: '🇩🇪' },
        { id: 'paris', offset: 2, label: 'Paris', icon: '🇫🇷' },
        { id: 'rome', offset: 2, label: 'Roma', icon: '🇮🇹' },
        { id: 'moscow', offset: 3, label: 'Moscou', icon: '🇷🇺' },
        { id: 'dubai', offset: 4, label: 'Dubai', icon: '🇦🇪' },
        { id: 'tokyo', offset: 9, label: 'Tóquio', icon: '🇯🇵' },
        { id: 'sydney', offset: 10, label: 'Sydney', icon: '🇦🇺' },
        { id: 'shanghai', offset: 8, label: 'Xangai', icon: '🇨🇳' },
        { id: 'singapore', offset: 8, label: 'Singapura', icon: '🇸🇬' },
        { id: 'sao-paulo', offset: -3, label: 'São Paulo', icon: '🇧🇷' },
        { id: 'buenos-aires', offset: -3, label: 'Buenos Aires', icon: '🇦🇷' },
        { id: 'mexico-city', offset: -6, label: 'Cidade do México', icon: '🇲🇽' },
        { id: 'los-angeles', offset: -7, label: 'Los Angeles', icon: '🇺🇸' }
    ];

    const container = document.getElementById('clock-container');
    if (!container) return;

    if (container.children.length === 0) {
        cities.forEach(city => {
            const card = document.createElement('div');
            card.className = `clock-card${city.isLocal ? ' local' : ''}`;
            card.id = `card-${city.id}`;
            card.innerHTML = `
                <span class="city-icon">${city.icon}</span>
                <div class="city-name">${city.label}</div>
                <div class="time" id="${city.id}-time">--:--:--</div>
                <div class="date" id="${city.id}-date">--</div>
                <div class="offset-info">UTC ${city.offset >= 0 ? '+' : ''}${city.offset}</div>
                <div class="diff-hours" id="${city.id}-diff"></div>
            `;
            container.appendChild(card);
        });
    }

    const utc = now.getTime() + now.getTimezoneOffset() * 60000;

    cities.forEach(city => {
        const timeElement = document.getElementById(`${city.id}-time`);
        const dateElement = document.getElementById(`${city.id}-date`);
        const diffElement = document.getElementById(`${city.id}-diff`);
        if (!timeElement) return;

        const cityTime = new Date(utc + city.offset * 3600000);
        const hours = String(cityTime.getHours()).padStart(2, '0');
        const minutes = String(cityTime.getMinutes()).padStart(2, '0');
        const seconds = String(cityTime.getSeconds()).padStart(2, '0');
        timeElement.textContent = `${hours}:${minutes}:${seconds}`;

        if (dateElement) {
            const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
            dateElement.textContent = cityTime.toLocaleDateString('pt-BR', options);
        }

        if (diffElement && !city.isLocal) {
            const diff = city.offset - localOffsetHours;
            const diffText = diff > 0 ? `+${diff}h` : (diff < 0 ? `${diff}h` : 'mesmo fuso');
            diffElement.textContent = `⏱️ ${diffText}`;
        } else if (diffElement && city.isLocal) {
            diffElement.textContent = '📍 Você está aqui';
        }
    });
}

// Inicialização do relógio mundial
if (document.getElementById('clock-container')) {
    updateClocks();
    setInterval(updateClocks, 1000);
}

// Gerador de Currículo
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

    const fotoInput = document.getElementById('foto');
    if (fotoInput.files && fotoInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const fotoBase64 = e.target.result;
            gerarHTMLCurriculo(nome, email, telefone, endereco, resumo, experiencia, formacao, habilidades, fotoBase64);
        };
        reader.readAsDataURL(fotoInput.files[0]);
    } else {
        gerarHTMLCurriculo(nome, email, telefone, endereco, resumo, experiencia, formacao, habilidades, '');
    }
}

function gerarHTMLCurriculo(nome, email, telefone, endereco, resumo, experiencia, formacao, habilidades, fotoBase64) {
    const fotoHTML = fotoBase64 ? `
        <img src="${fotoBase64}" alt="Foto" style="width:120px; height:120px; border-radius:50%; object-fit:cover; float:right; margin-left:20px; border:3px solid #ff5722;">
    ` : '';

    const html = `
        <div style="background:#fff; color:#000; padding:30px; border-radius:10px; text-align:left; max-width:700px; margin:0 auto; font-family:Arial, sans-serif; position:relative; overflow:hidden; box-shadow:0 4px 15px rgba(0,0,0,0.1);">
            <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:20px;">
                <div style="flex:1;">
                    <h1 style="font-size:28px; margin-bottom:4px; color:#ff5722;">${nome}</h1>
                    <p style="margin:4px 0; color:#555;">${email} ${telefone ? '| ' + telefone : ''}</p>
                    <p style="margin:4px 0; color:#555;">${endereco}</p>
                </div>
                ${fotoHTML}
            </div>
            ${resumo ? `<hr style="margin:20px 0; border:1px solid #eee;"><h3 style="color:#ff5722;">Resumo</h3><p style="color:#333;">${resumo}</p>` : ''}
            ${experiencia ? `<hr style="margin:20px 0; border:1px solid #eee;"><h3 style="color:#ff5722;">Experiência</h3><p style="color:#333;">${experiencia.replace(/\n/g, '<br>')}</p>` : ''}
            ${formacao ? `<hr style="margin:20px 0; border:1px solid #eee;"><h3 style="color:#ff5722;">Formação</h3><p style="color:#333;">${formacao.replace(/\n/g, '<br>')}</p>` : ''}
            ${habilidades ? `<hr style="margin:20px 0; border:1px solid #eee;"><h3 style="color:#ff5722;">Habilidades</h3><p style="color:#333;">${habilidades.split(',').map(h => h.trim()).join(' • ')}</p>` : ''}
        </div>
    `;

    document.getElementById('resume-content').innerHTML = html;
    document.getElementById('resume-preview').style.display = 'block';
    document.querySelector('.resume-form').style.display = 'none';
}

function imprimirCurriculo() {
    const content = document.getElementById('resume-content').innerHTML;
    const nome = document.getElementById('nome').value.trim() || 'curriculo';
    const nomeArquivo = `curriculo_${nome.replace(/[^a-zA-Z0-9]/g, '_')}`;

    const win = window.open('', '_blank');
    win.document.write(`
        <html>
            <head>
                <title>${nomeArquivo}</title>
                <style>
                    body { margin: 0; padding: 20px; background: #f5f5f5; }
                    @media print {
                        body { background: #fff; padding: 0; }
                    }
                </style>
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
}

// Conversor de Moedas
async function converterMoeda() {
    const amount = parseFloat(document.getElementById('amount').value);
    const fromCurrency = document.getElementById('from-currency').value;
    const toCurrency = document.getElementById('to-currency').value;
    const resultSpan = document.getElementById('converted-amount');
    const rateInfo = document.getElementById('rate-info');

    if (isNaN(amount) || amount <= 0) {
        alert('Por favor, insira um valor válido maior que zero.');
        return;
    }

    try {
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
        if (!response.ok) throw new Error('Falha ao buscar taxas');
        const data = await response.json();

        const rate = data.rates[toCurrency];
        if (!rate) {
            alert('Moeda de destino não encontrada.');
            return;
        }

        const converted = amount * rate;
        resultSpan.textContent = `${converted.toFixed(2)} ${toCurrency}`;
        rateInfo.textContent = `1 ${fromCurrency} = ${rate.toFixed(4)} ${toCurrency}`;
    } catch (error) {
        console.error('Erro na conversão:', error);
        alert('Erro ao obter taxas de câmbio. Tente novamente mais tarde.');
        resultSpan.textContent = '--';
        rateInfo.textContent = '';
    }
}