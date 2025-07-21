// --- Module 1: Crypto Logic (conceptual crypto.js) ---
const CryptoModule = (() => {
    const ENCRYPT_MAP = {
        // Uppercase
        A: 'E', B: 'K', C: 'G', D: 'P', E: '!', F: 'V', G: ':', H: 'T', I: 'Q', J: 'Y',
        K: '$', L: 'X', M: 'U', N: 'W', O: '%', P: '&', Q: '*', R: '#', S: '-', T: '×',
        U: '_', V: '"', W: '+', X: '?', Y: '>', Z: '<',

        // Lowercase
        a: 'e', b: 'k', c: 'g', d: 'p', e: '~', f: 'v', g: '↔', h: 't', i: 'q', j: 'y',
        k: '≠', l: 'x', m: 'u', n: 'w', o: '≥', p: '∞', q: '↕', r: '∑', s: '÷', t: '\\',
        u: '€', v: '←', w: '₽', x: '≤', y: '√', z: '→',

        // Numbers and symbols
        '1': ']', '2': '(', '3': '}', '4': '(', '5': '[', '6': '{', '7': '/', '8': '|', '9': ';', '0': ',',
        '@': '.', '$': '±'
    };

    const DECRYPT_MAP = {};
    for (const [key, val] of Object.entries(ENCRYPT_MAP)) {
        DECRYPT_MAP[val] = key;
    }

    /**
     * Encrypts the given text using the ENCRYPT_MAP.
     * @param {string} text - The text to encrypt.
     * @returns {string} - The encrypted text.
     */
    const encrypt = (text) => {
        return text.split('').map(char => ENCRYPT_MAP[char] || char).join('');
    };

    /**
     * Decrypts the given text using the DECRYPT_MAP.
     * @param {string} text - The text to decrypt.
     * @returns {string} - The decrypted text.
     */
    const decrypt = (text) => {
        return text.split('').map(char => DECRYPT_MAP[char] || char).join('');
    };

    return {
        encrypt,
        decrypt
    };
})();

// --- Module 2: Utility Functions (conceptual utils.js) ---
const Utils = (() => {
    /**
     * Displays a toast message.
     * @param {string} message - The message to display.
     * @param {'success' | 'error' | 'info'} type - The type of toast (e.g., 'success', 'error').
     */
    const showToast = (message, type = 'info') => {
        const toastContainer = document.getElementById('toastContainer');
        // If toastContainer doesn't exist (e.g., on some pages without the div), create a fallback
        if (!toastContainer) {
            console.warn('Toast container not found. Toast message not displayed:', message);
            return;
        }

        const toast = document.createElement('div');
        toast.classList.add('toast', type);
        let icon = '';
        if (type === 'success') {
            icon = '<i class="fas fa-check-circle icon"></i>';
        } else if (type === 'error') {
            icon = '<i class="fas fa-times-circle icon"></i>';
        } else {
            icon = '<i class="fas fa-info-circle icon"></i>';
        }
        toast.innerHTML = `${icon}<span class="message">${message}</span>`;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 50); // Small delay to allow CSS transition

        setTimeout(() => {
            toast.classList.remove('show');
            toast.addEventListener('transitionend', () => toast.remove());
        }, 3000); // Toast disappears after 3 seconds
    };

    /**
     * Validates an email address format.
     * @param {string} email - The email string to validate.
     * @returns {boolean} - True if valid, false otherwise.
     */
    const validateEmail = (email) => {
        // Basic regex for email validation
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    };

    /**
     * Validates password strength.
     * Requirements: Minimum 8 characters, at least one uppercase letter, one lowercase letter, one number, and one special character.
     * @param {string} password - The password string to validate.
     * @returns {boolean} - True if valid, false otherwise.
     */
    const validatePassword = (password) => {
        const minLength = 8;
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`€↔≠≥∞↕∑÷₽≤√→±]/.test(password); // Adjusted for characters in ENCRYPT_MAP

        return password.length >= minLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
    };

    /**
     * Toggles the visibility of the password input field.
     */
    const togglePasswordVisibility = () => {
        const passwordInput = document.getElementById('password');
        const toggleIcon = document.getElementById('togglePassword');
        if (passwordInput && toggleIcon) { // Check if elements exist on the current page
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                toggleIcon.classList.remove('fa-eye');
                toggleIcon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                toggleIcon.classList.remove('fa-eye-slash');
                toggleIcon.classList.add('fa-eye');
            }
        }
    };

    /**
     * Helper to export text content to a TXT file (CSV format).
     * @param {string} content - The text content to export.
     * @param {string} filename - The desired filename (e.g., "my_list.txt").
     */
    const exportToTxt = (content, filename) => {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' }); // Change type to text/csv
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
        Utils.showToast(`Exported ${filename} successfully!`, 'success');
    };

    /**
     * Helper to export data to a PDF file using jsPDF-Autotable.
     * @param {string} title - The main title of the PDF.
     * @param {string[]} headers - Array of column headers.
     * @param {Array<Array<string>>} data - 2D array of row data.
     * @param {string} footerText - Text to display in the footer.
     * @param {string} filename - The desired output filename.
     */
    const exportToPdf = (title, headers, data, footerText, filename) => {
        if (typeof window.jspdf === 'undefined' || typeof window.jspdf.autoTable === 'undefined') {
            Utils.showToast('PDF export libraries (jsPDF, autoTable) not loaded. Cannot export to PDF.', 'error');
            console.error('jsPDF or AutoTable library not found. Make sure they are loaded.');
            return;
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        const generatedBy = "Generated by Eebrahimjoy";
        const generationDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

        let yPos = 15; // Starting Y position

        // Title
        doc.setFontSize(18);
        doc.text(title, doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
        yPos += 10;

        // Metadata (Generated by, Date)
        doc.setFontSize(10);
        doc.text(`${generatedBy} on ${generationDate}`, doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
        yPos += 15; // Move down for table

        doc.autoTable({
            startY: yPos,
            head: [headers],
            body: data,
            theme: 'striped', // Optional: 'striped', 'grid', 'plain'
            headStyles: { fillColor: [99, 102, 241], textColor: [255, 255, 255], fontStyle: 'bold' }, // Indigo header
            didDrawPage: (data) => {
                // Footer on each page
                doc.setFontSize(8);
                const pageCount = doc.internal.getNumberOfPages();
                doc.text(`Page ${data.pageNumber} of ${pageCount}`, data.settings.margin.left, doc.internal.pageSize.getHeight() - 10);
            }
        });

        yPos = doc.autoTable.previous.finalY + 10; // Position for footer text after table

        // Footer Total/Summary
        doc.setFontSize(12);
        doc.text(footerText, 10, yPos);

        doc.save(filename);
        Utils.showToast(`Exported ${filename} successfully!`, 'success');
    };


    return {
        showToast,
        validateEmail,
        validatePassword,
        togglePasswordVisibility,
        exportToTxt,
        exportToPdf
    };
})();

// --- Module 3: App State and Core Logic (conceptual app.js) ---
const App = (() => {
    // Valid credentials (Base64 obfuscated for client-side demo)
    const VALID_USER = btoa('secret@ehaan.com');
    const VALID_PASS = btoa('200923@En');

    // Element references (will be initialized based on the current page)
    let elements = {};

    // --- Data Stores (in-memory for this demo, usually from backend/storage) ---
    // In a real application, this data would be stored persistently (e.g., Firebase, LocalStorage)
    let expenses = [];
    let dailyNeeds = [];

    // Science Story Data
    const scienceStories = [
        {
            id: 'river-flow',
            title: 'How Rivers Flow and Shape Landscapes',
            content: 'Rivers are dynamic systems that continuously reshape the Earth\'s surface. They flow from higher elevations to lower ones due to gravity, eroding land and transporting sediment along their paths. The speed of a river\'s flow, its discharge, and the type of rock and soil it encounters all influence how it carves out valleys, creates deltas, and contributes to the water cycle. Rivers are vital for ecosystems, agriculture, and human settlements worldwide.'
        },
        {
            id: 'raining',
            title: 'The Wonders of Rain: From Clouds to Ground',
            content: 'Rain is a fundamental component of the Earth\'s water cycle, essential for life. It forms when water vapor in the atmosphere condenses around tiny particles (condensation nuclei) to form clouds. As these water droplets or ice crystals grow heavier, gravity pulls them down as precipitation. Different types of clouds, temperature, and atmospheric pressure all play roles in whether precipitation falls as rain, snow, sleet, or hail.'
        },
        {
            id: 'venom-works',
            title: 'How Venom Works: A Biological Weapon',
            content: 'Venom is a complex cocktail of toxins produced by certain animals (snakes, spiders, scorpions, some insects) for defense or to subdue prey. These toxins can include neurotoxins (affecting the nervous system), hemotoxins (damaging blood cells and vessels), cytotoxins (destroying cells), and myotoxins (damaging muscles). The specific composition of venom determines its effect on the victim, ranging from paralysis and tissue necrosis to internal bleeding.'
        },
        {
            id: 'plane-flying',
            title: 'The Physics of Flight: How Planes Soar',
            content: 'Airplanes fly due to four fundamental forces: lift, weight, thrust, and drag. Lift is generated by the wings, which are shaped (airfoils) to create a pressure difference—lower pressure above and higher pressure below—thus pushing the plane upwards. Thrust, provided by engines, propels the plane forward, overcoming drag, the resistance of air. Weight, the force of gravity, opposes lift. When lift exceeds weight, and thrust exceeds drag, the plane takes off and flies.'
        },
        {
            id: 'weather-humidity',
            title: 'Understanding Weather and Humidity',
            content: 'Weather refers to the state of the atmosphere at a particular place and time, encompassing phenomena like temperature, precipitation, wind, and humidity. Humidity is the amount of water vapor in the air. High humidity makes the air feel muggy because less sweat evaporates from our skin. It plays a crucial role in cloud formation, precipitation, and thermal comfort. Understanding these elements helps us predict and adapt to atmospheric conditions.'
        }
    ];

    /**
     * Initializes DOM element references based on the current page.
     * This function should be called once the DOM is fully loaded.
     */
    const initElements = () => {
        const currentPage = window.location.pathname.split('/').pop();

        if (currentPage === 'login.html') {
            elements = {
                emailInput: document.getElementById('email'),
                passwordInput: document.getElementById('password'),
                emailError: document.getElementById('emailError'),
                passwordError: document.getElementById('passwordError'),
                togglePasswordIcon: document.getElementById('togglePassword'),
                loginButton: document.getElementById('loginButton')
            };
        } else if (currentPage === 'home.html') {
            elements = {
                inputText: document.getElementById('inputText'),
                resultText: document.getElementById('resultText'),
                encryptButton: document.getElementById('encryptButton'),
                decryptButton: document.getElementById('decryptButton'),
                logoutButton: document.getElementById('logoutButton')
            };
        } else if (currentPage === 'index.html' || currentPage === '') { // '' for root path serving index.html
            elements = {
                loginNavigateButton: document.getElementById('loginNavigateButton'),
                dashboardNavLink: document.getElementById('dashboardNavLink'),
                encryptionNavLink: document.getElementById('encryptionNavLink'),
                scienceNavLink: document.getElementById('scienceNavLink'),
                percentageCalculatorNavBtn: document.getElementById('percentageCalculatorNavBtn'),
                weatherTimeNavBtn: document.getElementById('weatherTimeNavBtn'),
                dailyExpensesNavBtn: document.getElementById('dailyExpensesNavBtn'),
                imageBgRemoverNavBtn: document.getElementById('imageBgRemoverNavBtn'),
                imageResizerNavBtn: document.getElementById('imageResizerNavBtn'),
                pdfNavBtn: document.getElementById('pdfNavBtn'),
                pdfToImageNavBtn: document.getElementById('pdfToImageNavBtn')
            };
        } else if (currentPage === 'percentage_calculator.html') {
            elements = {
                percentValue: document.getElementById('percentValue'),
                totalValue: document.getElementById('totalValue'),
                calculatePercentageBtn: document.getElementById('calculatePercentageBtn'),
                percentageResult: document.getElementById('percentageResult'),
                backToDashboardBtn: document.getElementById('backToDashboardBtn')
            };
        } else if (currentPage === 'weather_time.html') {
            elements = {
                citySearch: document.getElementById('citySearch'),
                searchWeatherTimeBtn: document.getElementById('searchWeatherTimeBtn'),
                currentLocationWeatherTimeBtn: document.getElementById('currentLocationWeatherTimeBtn'),
                weatherTimeResult: document.getElementById('weatherTimeResult'),
                backToDashboardBtn: document.getElementById('backToDashboardBtn')
            };
        } else if (currentPage === 'daily_expenses.html') {
            elements = {
                expenseAmount: document.getElementById('expenseAmount'),
                expenseDescription: document.getElementById('expenseDescription'),
                addExpenseBtn: document.getElementById('addExpenseBtn'),
                expenseList: document.getElementById('expenseList'),
                exportExpensesTxt: document.getElementById('exportExpensesTxt'),
                exportExpensesPdf: document.getElementById('exportExpensesPdf'),
                backToDashboardBtn: document.getElementById('backToDashboardBtn')
            };
            expenses = JSON.parse(localStorage.getItem('expenses')) || []; // Load data
        } else if (currentPage === 'daily_needs.html') {
            elements = {
                needItem: document.getElementById('needItem'),
                needApproxPrice: document.getElementById('needApproxPrice'),
                needType: document.getElementById('needType'),
                needQuantity: document.getElementById('needQuantity'),
                addNeedBtn: document.getElementById('addNeedBtn'),
                needsList: document.getElementById('needsList'),
                exportNeedsTxt: document.getElementById('exportNeedsTxt'),
                exportNeedsPdf: document.getElementById('exportNeedsPdf'),
                backToDashboardBtn: document.getElementById('backToDashboardBtn')
            };
            dailyNeeds = JSON.parse(localStorage.getItem('dailyNeeds')) || []; // Load data
        } else if (currentPage === 'cricket.html') { // New page
            elements = {
                cricketMatchesList: document.getElementById('cricketMatchesList'),
                backToDashboardBtn: document.getElementById('backToDashboardBtn')
            };
        } else if (currentPage === 'football.html') { // New page
            elements = {
                footballLeaguesList: document.getElementById('footballLeaguesList'),
                backToDashboardBtn: document.getElementById('backToDashboardBtn')
            };
        } else if (currentPage === 'science.html') { // New page
            elements = {
                scienceTopicsList: document.getElementById('scienceTopicsList'),
                scienceDetailsOutput: document.getElementById('scienceDetailsOutput'),
                backToDashboardBtn: document.getElementById('backToDashboardBtn')
            };
        }
    };

    // --- Common Navigation Handler ---
    const navigateTo = (page) => {
        window.location.href = page;
    };

    // --- Handlers for Login Page ---
    const handleLogin = () => {
        const email = elements.emailInput.value.trim();
        const password = elements.passwordInput.value.trim();

        let isValid = true;

        if (!Utils.validateEmail(email)) {
            elements.emailError.classList.remove('hidden');
            elements.emailInput.classList.add('border-red-500');
            isValid = false;
        } else {
            elements.emailError.classList.add('hidden');
            elements.emailInput.classList.remove('border-red-500');
        }

        if (!Utils.validatePassword(password)) {
            elements.passwordError.classList.remove('hidden');
            elements.passwordInput.classList.add('border-red-500');
            isValid = false;
        } else {
            elements.passwordError.classList.add('hidden');
            elements.passwordInput.classList.remove('border-red-500');
        }

        if (!isValid) {
            Utils.showToast('Please correct the errors in the form.', 'error');
            return;
        }

        const encodedEmail = btoa(email);
        const encodedPassword = btoa(password);

        if (encodedEmail === VALID_USER && encodedPassword === VALID_PASS) {
            sessionStorage.setItem('loggedIn', 'true');
            Utils.showToast('Login successful! Redirecting...', 'success');
            setTimeout(() => {
                navigateTo('home.html'); // Redirect to home page (crypto tool)
            }, 500); // Give toast time to show
        } else {
            Utils.showToast('Invalid email or password. Please try again.', 'error');
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('loggedIn');
        Utils.showToast('You have been logged out. Redirecting...', 'info');
        setTimeout(() => {
            navigateTo('login.html'); // Redirect to login page
        }, 500); // Give toast time to show
    };

    // --- Handlers for Crypto Page (`home.html`) ---
    const handleEncrypt = () => {
        const input = elements.inputText.value;
        if (!input) {
            Utils.showToast('Please enter text to encrypt.', 'error');
            return;
        }
        const output = CryptoModule.encrypt(input);
        elements.resultText.value = output;
        Utils.showToast('Text encrypted!', 'success');
    };

    const handleDecrypt = () => {
        const input = elements.inputText.value;
        if (!input) {
            Utils.showToast('Please enter text to decrypt.', 'error');
            return;
        }
        const output = CryptoModule.decrypt(input);
        elements.resultText.value = output;
        Utils.showToast('Text decrypted!', 'success');
    };

    // --- Handlers for Percentage Calculator Page (`percentage_calculator.html`) ---
    const handleCalculatePercentage = () => {
        const percent = parseFloat(elements.percentValue.value);
        const total = parseFloat(elements.totalValue.value);

        if (isNaN(percent) || isNaN(total)) {
            elements.percentageResult.textContent = 'Please enter valid numbers.';
            Utils.showToast('Please enter valid numbers for calculation.', 'error');
            return;
        }
        const result = (percent / 100) * total;
        elements.percentageResult.textContent = `${percent}% of ${total} is ${result.toFixed(2)}`;
        Utils.showToast('Percentage calculated!', 'success');
    };

    // --- Handlers for Weather & Time Page (`weather_time.html`) ---
    // Simulated Weather and Time Logic (using current date/time)
    const fetchWeatherAndTime = (location) => {
        // This is a simulated API call. In a real app, you'd use fetch() to a weather API.
        elements.weatherTimeResult.innerHTML = `<p>Fetching data for "${location}"...</p>`;
        setTimeout(() => {
            let weatherInfo;
            let timeInfo;
            const now = new Date();
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };

            // Simple "mock" responses based on input
            if (location.toLowerCase().includes('london')) {
                weatherInfo = 'Sunny, 18°C';
                timeInfo = now.toLocaleString('en-GB', { timeZone: 'Europe/London', ...options });
            } else if (location.toLowerCase().includes('dubai')) {
                weatherInfo = 'Hot, 35°C';
                timeInfo = now.toLocaleString('en-GB', { timeZone: 'Asia/Dubai', ...options });
            } else if (location.toLowerCase().includes('new york')) {
                weatherInfo = 'Cloudy, 22°C';
                timeInfo = now.toLocaleString('en-US', { timeZone: 'America/New_York', ...options });
            } else if (location.includes('/')) { // Assume it's a timezone string (e.g., "Asia/Kolkata")
                try {
                    timeInfo = now.toLocaleString('en-US', { timeZone: location, ...options });
                    weatherInfo = 'Weather data not available for specific timezone search.';
                } catch (e) {
                    timeInfo = 'Invalid time zone format. Try "America/New_York".';
                    weatherInfo = 'Weather data not available.';
                    Utils.showToast('Invalid time zone. Please use a valid IANA time zone (e.g., "America/New_York").', 'error');
                }
            }
            else {
                weatherInfo = 'Partly Cloudy, 25°C';
                timeInfo = now.toLocaleString(); // Default local time
            }

            elements.weatherTimeResult.innerHTML = `
                <p><strong>Location:</strong> ${location || 'Unknown'}</p>
                <p><strong>Weather:</strong> ${weatherInfo}</p>
                <p><strong>Local Time:</strong> ${timeInfo}</p>
            `;
            Utils.showToast('Weather and time updated!', 'success');
        }, 1500); // Simulate network delay
    };

    const fetchCurrentLocationWeatherTime = () => {
        elements.weatherTimeResult.innerHTML = `<p>Getting your current location...</p>`;
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    // In a real app, you'd use a reverse geocoding API to get city name
                    // For demo, we'll just show coordinates and current time zone
                    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                    const now = new Date();
                    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
                    const localTime = now.toLocaleString('en-US', { timeZone: timeZone, ...options });

                    elements.weatherTimeResult.innerHTML = `
                        <p><strong>Your Location:</strong> Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}</p>
                        <p><strong>Weather:</strong> (Simulated) Clear skies, 28°C</p>
                        <p><strong>Your Time Zone:</strong> ${timeZone}</p>
                        <p><strong>Local Time:</strong> ${localTime}</p>
                    `;
                    Utils.showToast('Current location weather and time loaded!', 'success');
                },
                (error) => {
                    elements.weatherTimeResult.innerHTML = `<p class="text-red-500">Error getting location: ${error.message}.</p>`;
                    Utils.showToast('Failed to get current location. Please ensure location services are enabled.', 'error');
                    console.error('Geolocation error:', error);
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 } // Geolocation options
            );
        } else {
            elements.weatherTimeResult.innerHTML = `<p class="text-red-500">Geolocation is not supported by your browser.</p>`;
            Utils.showToast('Geolocation not supported by your browser.', 'error');
        }
    };

    // --- Handlers for Daily Expenses Page (`daily_expenses.html`) ---
    const saveExpenses = () => {
        localStorage.setItem('expenses', JSON.stringify(expenses));
    };

    const renderExpenses = () => {
        if (elements.expenseList) { // Check if the element exists (only on daily_expenses.html)
            if (expenses.length === 0) {
                elements.expenseList.innerHTML = '<p class="text-gray-500">No expenses added yet.</p>';
                return;
            }
            elements.expenseList.innerHTML = expenses.map((exp, index) => `
                <div class="list-item">
                    <span>${exp.description} - $${exp.amount.toFixed(2)}</span>
                    <button class="delete-btn" data-index="${index}" data-list="expenses"><i class="fas fa-times"></i></button>
                </div>
            `).join('');
            // Attach delete listeners
            elements.expenseList.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', handleDeleteItem);
            });
        }
    };

    const addExpense = () => {
        const amount = parseFloat(elements.expenseAmount.value);
        const description = elements.expenseDescription.value.trim();

        if (isNaN(amount) || amount <= 0 || !description) {
            Utils.showToast('Please enter a valid amount (greater than 0) and description for the expense.', 'error');
            return;
        }
        expenses.push({ amount, description, date: new Date().toISOString() }); // Add date for more info
        elements.expenseAmount.value = '';
        elements.expenseDescription.value = '';
        saveExpenses();
        renderExpenses();
        Utils.showToast('Expense added!', 'success');
    };

    const exportExpenses = (format) => {
        if (expenses.length === 0) {
            Utils.showToast('No expenses to export.', 'error');
            return;
        }

        const reportTitle = "Daily Expenses Report";
        const dateGenerated = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        const generatedBy = "eebrahimjoy";
        const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2);
        const footerText = `Total Expenses: $${totalAmount}`;

        if (format === 'txt') {
            // CSV format
            let csvContent = `"${reportTitle}"\n`;
            csvContent += `"Generated by: ${generatedBy}", "Date: ${dateGenerated}"\n\n`;
            csvContent += `"Date","Description","Amount"\n`; // Headers

            expenses.forEach(exp => {
                const itemDate = new Date(exp.date).toLocaleDateString();
                csvContent += `"${itemDate}","${exp.description.replace(/"/g, '""')}","${exp.amount.toFixed(2)}"\n`;
            });
            csvContent += `\n"","Total","${totalAmount}"\n`; // Total row
            Utils.exportToTxt(csvContent, 'daily_expenses.csv'); // Change filename to .csv
        } else if (format === 'pdf') {
            const headers = ["Date", "Description", "Amount ($)"];
            const data = expenses.map(exp => [
                new Date(exp.date).toLocaleDateString(),
                exp.description,
                exp.amount.toFixed(2)
            ]);
            Utils.exportToPdf(reportTitle, headers, data, footerText, 'daily_expenses.pdf');
        }
    };


    // --- Handlers for Daily Needs Page (`daily_needs.html`) ---
    const saveDailyNeeds = () => {
        localStorage.setItem('dailyNeeds', JSON.stringify(dailyNeeds));
    };

    const renderDailyNeeds = () => {
        if (elements.needsList) { // Check if the element exists (only on daily_needs.html)
            if (dailyNeeds.length === 0) {
                elements.needsList.innerHTML = '<p class="text-gray-500">No items added yet.</p>';
                return;
            }
            elements.needsList.innerHTML = dailyNeeds.map((item, index) => `
                <div class="list-item">
                    <span>
                        ${item.item}${item.approxPrice !== null ? ` ($${item.approxPrice.toFixed(2)})` : ''}
                        ${item.quantity !== null ? ` - ${item.quantity}` : ''}${item.type !== 'other' && item.quantity !== null ? ` ${item.type}` : ''}
                    </span>
                    <button class="delete-btn" data-index="${index}" data-list="needs"><i class="fas fa-times"></i></button>
                </div>
            `).join('');
            // Attach delete listeners
            elements.needsList.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', handleDeleteItem);
            });
        }
    };

    const addNeed = () => {
        const item = elements.needItem.value.trim();
        const approxPrice = parseFloat(elements.needApproxPrice.value);
        const type = elements.needType.value;
        const quantity = parseFloat(elements.needQuantity.value);

        if (!item) {
            Utils.showToast('Please enter an item for the daily needs list.', 'error');
            return;
        }
        if (elements.needApproxPrice.value.trim() !== '' && isNaN(approxPrice)) { // If price was entered, validate it
            Utils.showToast('Please enter a valid approximate price (number).', 'error');
            return;
        }
        if (elements.needQuantity.value.trim() !== '' && isNaN(quantity)) { // If quantity was entered, validate it
            Utils.showToast('Please enter a valid quantity (number).', 'error');
            return;
        }

        dailyNeeds.push({
            item,
            approxPrice: elements.needApproxPrice.value.trim() !== '' ? parseFloat(approxPrice) : null,
            type,
            quantity: elements.needQuantity.value.trim() !== '' ? parseFloat(quantity) : null
        });
        elements.needItem.value = '';
        elements.needApproxPrice.value = '';
        elements.needType.value = 'piece'; // Reset to default
        elements.needQuantity.value = '';
        saveDailyNeeds();
        renderDailyNeeds();
        Utils.showToast('Item added to daily needs!', 'success');
    };

    const exportNeeds = (format) => {
        if (dailyNeeds.length === 0) {
            Utils.showToast('No daily needs to export.', 'error');
            return;
        }

        const reportTitle = "Daily Needs List";
        const dateGenerated = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        const generatedBy = "eebrahimjoy";
        const approxTotalCost = dailyNeeds.reduce((sum, item) => sum + ((item.approxPrice || 0) * (item.quantity || 1)), 0).toFixed(2);
        const footerText = `Approx. Total Cost: $${approxTotalCost}`;


        if (format === 'txt') {
            // CSV format
            let csvContent = `"${reportTitle}"\n`;
            csvContent += `"Generated by: ${generatedBy}", "Date: ${dateGenerated}"\n\n`;
            csvContent += `"Item","Approx. Price","Type","Quantity"\n`; // Headers

            dailyNeeds.forEach(item => {
                const price = item.approxPrice !== null ? item.approxPrice.toFixed(2) : '';
                const qty = item.quantity !== null ? item.quantity.toString() : '';
                const typeDisplay = item.type !== 'other' ? item.type : 'Other';
                csvContent += `"${item.item.replace(/"/g, '""')}","${price}","${typeDisplay}","${qty}"\n`;
            });
            csvContent += `\n"","Approx. Total Cost","","","${approxTotalCost}"\n`; // Total row for 4 columns
            Utils.exportToTxt(csvContent, 'daily_needs.csv'); // Change filename to .csv
        } else if (format === 'pdf') {
            const headers = ["Item", "Approx. Price ($)", "Type", "Quantity"];
            const data = dailyNeeds.map(item => [
                item.item,
                item.approxPrice !== null ? item.approxPrice.toFixed(2) : '-',
                item.type !== 'other' ? item.type : 'Other',
                item.quantity !== null ? item.quantity.toString() : '-'
            ]);
            Utils.exportToPdf(reportTitle, headers, data, footerText, 'daily_needs.pdf');
        }
    };


    // Generic Delete Item for Lists
    const handleDeleteItem = (event) => {
        const index = parseInt(event.currentTarget.dataset.index);
        const listType = event.currentTarget.dataset.list;

        if (listType === 'expenses') {
            expenses.splice(index, 1);
            saveExpenses();
            renderExpenses();
            Utils.showToast('Expense deleted.', 'info');
        } else if (listType === 'needs') {
            dailyNeeds.splice(index, 1);
            saveDailyNeeds();
            renderDailyNeeds();
            Utils.showToast('Daily need item deleted.', 'info');
        }
    };

    // --- Handlers for Cricket Page (`cricket.html`) ---
    const renderCricketMatches = () => {
        if (!elements.cricketMatchesList) return;
        const simulatedMatches = [
            { team1: 'India', team2: 'Australia', status: 'Live', score: 'IND 150/3 (15 ov)', info: 'T20 World Cup Warm-up' },
            { team1: 'England', team2: 'New Zealand', status: 'Upcoming', time: 'Tomorrow 10:00 AM UTC', info: 'ODI Series Match 2' },
            { team1: 'Pakistan', team2: 'South Africa', status: 'Finished', result: 'PAK won by 5 wickets', info: 'Test Series Match 1' },
            { team1: 'Bangladesh', team2: 'Sri Lanka', status: 'Live', score: 'BAN 120/5 (12 ov)', info: 'Asia Cup Qualifier' }
        ];

        let content = '';
        if (simulatedMatches.length === 0) {
            content = '<p class="text-gray-500">No live or upcoming matches available.</p>';
        } else {
            content = simulatedMatches.map(match => `
                <div class="list-item flex-col items-start">
                    <span class="font-semibold text-lg">${match.team1} vs ${match.team2}</span>
                    <span class="text-sm text-gray-700">${match.status}: ${match.score || match.time || match.result}</span>
                    <span class="text-xs text-gray-500">${match.info}</span>
                </div>
            `).join('');
        }
        elements.cricketMatchesList.innerHTML = content;
        Utils.showToast('Simulated cricket matches loaded!', 'info');
    };

    // --- Handlers for Football Page (`football.html`) ---
    const renderFootballLeagues = () => {
        if (!elements.footballLeaguesList) return;
        const simulatedLeagues = [
            { name: 'FIFA World Cup', status: 'Next World Cup 2026', info: 'Qualifiers ongoing in various regions.' },
            { name: 'UEFA Champions League', status: 'Season 2024-2025', info: 'Group stage draw soon.' },
            { name: 'Premier League (EPL)', status: 'Season 2024-2025', info: 'Pre-season tours commencing.' },
            { name: 'La Liga', status: 'Season 2024-2025', info: 'Transfer window active.' },
            { name: 'Bundesliga', status: 'Season 2024-2025', info: 'Team training camps underway.' }
        ];

        let content = '';
        if (simulatedLeagues.length === 0) {
            content = '<p class="text-gray-500">No league information available.</p>';
        } else {
            content = simulatedLeagues.map(league => `
                <div class="list-item flex-col items-start">
                    <span class="font-semibold text-lg">${league.name}</span>
                    <span class="text-sm text-gray-700">${league.status}</span>
                    <span class="text-xs text-gray-500">${league.info}</span>
                </div>
            `).join('');
        }
        elements.footballLeaguesList.innerHTML = content;
        Utils.showToast('Simulated football league info loaded!', 'info');
    };

    // --- Handlers for Science Page (`science.html`) ---
    const renderScienceTopics = () => {
        if (!elements.scienceTopicsList) return;

        elements.scienceTopicsList.innerHTML = scienceStories.map(story => `
            <li class="science-topic-item" data-id="${story.id}">${story.title}</li>
        `).join('');

        elements.scienceTopicsList.querySelectorAll('.science-topic-item').forEach(item => {
            item.addEventListener('click', handleScienceTopicClick);
        });
    };

    const handleScienceTopicClick = (event) => {
        const storyId = event.target.dataset.id;
        const selectedStory = scienceStories.find(story => story.id === storyId);

        if (selectedStory && elements.scienceDetailsOutput) {
            elements.scienceDetailsOutput.innerHTML = `
                <h4>${selectedStory.title}</h4>
                <p>${selectedStory.content}</p>
            `;
            Utils.showToast(`Details for "${selectedStory.title}" loaded.`, 'info');
        } else {
            elements.scienceDetailsOutput.innerHTML = '<p class="text-red-500">Story details not found.</p>';
            Utils.showToast('Could not load story details.', 'error');
        }
    };


    /**
     * Initializes event listeners and checks initial login state based on the current page.
     */
    const init = () => {
        initElements(); // Initialize elements relevant to the current page
        const currentPage = window.location.pathname.split('/').pop();

        // Add page-specific body class for styling adjustments
        // This ensures the correct display properties are applied to the body based on the page
        document.body.classList.add(currentPage.replace('.html', '-page') || 'index-page');

        // Common Back to Dashboard Button Listener (exists on all tool pages)
        if (elements.backToDashboardBtn) {
            elements.backToDashboardBtn.addEventListener('click', () => navigateTo('index.html'));
        }

        if (currentPage === 'login.html') {
            if (elements.togglePasswordIcon) elements.togglePasswordIcon.addEventListener('click', Utils.togglePasswordVisibility);
            if (elements.loginButton) elements.loginButton.addEventListener('click', handleLogin);

            if (sessionStorage.getItem('loggedIn') === 'true') {
                Utils.showToast('Already logged in! Redirecting to home...', 'info');
                setTimeout(() => {
                    navigateTo('home.html');
                }, 500);
            }
        } else if (currentPage === 'home.html') {
            if (sessionStorage.getItem('loggedIn') !== 'true') {
                Utils.showToast('You need to log in to access this page. Redirecting...', 'error');
                setTimeout(() => {
                    navigateTo('login.html');
                }, 500);
                return;
            }
            if (elements.encryptButton) elements.encryptButton.addEventListener('click', handleEncrypt);
            if (elements.decryptButton) elements.decryptButton.addEventListener('click', handleDecrypt);
            if (elements.logoutButton) elements.logoutButton.addEventListener('click', handleLogout);
        } else if (currentPage === 'index.html' || currentPage === '') {
            // Header Navigation
            if (elements.loginNavigateButton) elements.loginNavigateButton.addEventListener('click', () => navigateTo('login.html'));
            if (elements.dashboardNavLink) {
                elements.dashboardNavLink.addEventListener('click', () => navigateTo('index.html'));
                // Add active class for current page
                elements.dashboardNavLink.classList.add('active');
            }
            if (elements.encryptionNavLink) elements.encryptionNavLink.addEventListener('click', () => navigateTo('home.html'));
            if (elements.scienceNavLink) elements.scienceNavLink.addEventListener('click', () => navigateTo('science.html'));


            // Dashboard Tool Navigation Cards
            if (elements.percentageCalculatorNavBtn) elements.percentageCalculatorNavBtn.addEventListener('click', () => navigateTo('percentage_calculator.html'));
            if (elements.weatherTimeNavBtn) elements.weatherTimeNavBtn.addEventListener('click', () => navigateTo('weather_time.html'));
            if (elements.dailyExpensesNavBtn) elements.dailyExpensesNavBtn.addEventListener('click', () => navigateTo('daily_expenses.html'));
            if (elements.imageBgRemoverNavBtn) elements.imageBgRemoverNavBtn.addEventListener('click', () => navigateTo('image_bg_remover.html'));
            if (elements.imageResizerNavBtn) elements.imageResizerNavBtn.addEventListener('click', () => navigateTo('image_resizer.html'));
            if (elements.pdfNavBtn) elements.pdfNavBtn.addEventListener('click', () => navigateTo('pdf_helper.html'));
            if (elements.pdfToImageNavBtn) elements.pdfToImageNavBtn.addEventListener('click', () => navigateTo('pdf_to_images.html'));

        } else if (currentPage === 'percentage_calculator.html') {
            if (elements.calculatePercentageBtn) elements.calculatePercentageBtn.addEventListener('click', handleCalculatePercentage);
        } else if (currentPage === 'weather_time.html') {
            if (elements.searchWeatherTimeBtn) elements.searchWeatherTimeBtn.addEventListener('click', () => fetchWeatherAndTime(elements.citySearch.value));
            if (elements.currentLocationWeatherTimeBtn) elements.currentLocationWeatherTimeBtn.addEventListener('click', fetchCurrentLocationWeatherTime);
            fetchCurrentLocationWeatherTime(); // Initial load
        } else if (currentPage === 'daily_expenses.html') {
            if (elements.addExpenseBtn) elements.addExpenseBtn.addEventListener('click', addExpense);
            if (elements.exportExpensesTxt) elements.exportExpensesTxt.addEventListener('click', () => exportExpenses('txt'));
            if (elements.exportExpensesPdf) elements.exportExpensesPdf.addEventListener('click', () => exportExpenses('pdf'));
            renderExpenses(); // Initial render
        } else if (currentPage === 'daily_needs.html') {
            if (elements.addNeedBtn) elements.addNeedBtn.addEventListener('click', addNeed);
            if (elements.exportNeedsTxt) elements.exportNeedsTxt.addEventListener('click', () => exportNeeds('txt'));
            if (elements.exportNeedsPdf) elements.exportNeedsPdf.addEventListener('click', () => exportNeeds('pdf'));
            renderDailyNeeds(); // Initial render
        } else if (currentPage === 'cricket.html') {
            renderCricketMatches(); // Render simulated matches on load
        } else if (currentPage === 'football.html') {
            renderFootballLeagues(); // Render simulated leagues on load
        } else if (currentPage === 'science.html') {
            renderScienceTopics(); // Render science topics on load
        }
    };

    return {
        init
    };
})();

// Initialize the application when the window loads
window.onload = App.init;
