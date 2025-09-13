const dataInput   = document.getElementById('dataInput');
    const generateBtn = document.getElementById('generateBtn');
    const errorMsg    = document.getElementById('errorMsg');
    const qrContainer = document.getElementById('qrcode');
    const popupOverlay= document.getElementById('popupOverlay');
    const downloadBtn = document.getElementById('downloadBtn');
    const closeBtn    = document.getElementById('closeBtn');
    const themeToggleBtn = document.getElementById('theme-toggle');

    // --- Fonctions de validation ---
    function validate(type, value) {
      if (!value) return false;
      if (type === 'phone') {
        return /^\+?[1-9]\d{1,14}$/.test(value);
      } else { // USSD
        return /^[*#][0-9*#]{0,38}#$/.test(value);
      }
    }
    
    function clearQR() {
      qrContainer.innerHTML = '';
    }

    // --- Fonctions pour le mode sombre/clair ---
    function toggleTheme() {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        themeToggleBtn.textContent = isDarkMode ? '☀️' : '🌙';
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }

    function setInitialTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            if (savedTheme === 'dark') {
                document.body.classList.add('dark-mode');
                themeToggleBtn.textContent = '☀️';
            } else {
                themeToggleBtn.textContent = '🌙';
            }
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.classList.add('dark-mode');
            themeToggleBtn.textContent = '☀️';
        }
    }
    
    // --- Événement pour générer le QR Code ---
    generateBtn.addEventListener('click', () => {
      const type = document.querySelector('input[name="type"]:checked').value;
      const rawValue  = dataInput.value.trim();
      errorMsg.style.display = 'none';

      if (!validate(type, rawValue)) {
        errorMsg.textContent = type === 'phone'
          ? 'Numéro invalide. Format international attendu, ex: +33123456789'
          : 'Code USSD invalide. Doit commencer par * ou # et finir par #.';
        errorMsg.style.display = 'block';
        return;
      }

      const payload = type === 'phone' ? `tel:${rawValue}` : `tel:${encodeURIComponent(rawValue)}`;
      clearQR();
      popupOverlay.classList.add('show');
      document.body.classList.add('popup-active');
      
      // Obtenir les valeurs de couleur calculées
      const bodyStyles = window.getComputedStyle(document.body);
      const qrDarkColor = bodyStyles.getPropertyValue('--text').trim();
      const qrLightColor = bodyStyles.getPropertyValue('--card').trim();

      new QRCode(qrContainer, {
        text: payload,
        width: 256,
        height: 256,
        colorDark : qrDarkColor,
        colorLight: qrLightColor,
        correctLevel: QRCode.CorrectLevel.H
      });
    });

    // --- Événement pour le téléchargement ---
    downloadBtn.addEventListener('click', () => {
      const type = document.querySelector('input[name="type"]:checked').value;
      const rawValue  = dataInput.value.trim();
      
      const payload = type === 'phone' ? `tel:${rawValue}` : `tel:${encodeURIComponent(rawValue)}`;

      const tempDiv = document.createElement('div');
      tempDiv.style.display = 'none';
      document.body.appendChild(tempDiv);

      const qrCodeHighRes = new QRCode(tempDiv, {
        text: payload,
        width: 1000,
        height: 1000,
        colorDark: "#000000ff",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
      });

      setTimeout(() => {
        const originalCanvas = tempDiv.querySelector('canvas');
        if (!originalCanvas) {
            document.body.removeChild(tempDiv);
            return;
        }

        const padding = 60;
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = originalCanvas.width + padding * 2;
        finalCanvas.height = originalCanvas.height + padding * 2;
        const ctx = finalCanvas.getContext('2d');
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
        ctx.drawImage(originalCanvas, padding, padding);
        
        const dataURL = finalCanvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataURL;
        a.download = 'qrcode.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        document.body.removeChild(tempDiv);
      }, 100); 
    });
    
    function closePopup() {
        popupOverlay.classList.remove('show');
        document.body.classList.remove('popup-active');
        dataInput.value = '';
    }

    // --- Événements pour fermer le pop-up ---
    closeBtn.addEventListener('click', closePopup);
    
    popupOverlay.addEventListener('click', (event) => {
        if(event.target === popupOverlay) {
            closePopup();
        }
    });

    // --- Initialisation ---
    setInitialTheme();
    themeToggleBtn.addEventListener('click', toggleTheme);