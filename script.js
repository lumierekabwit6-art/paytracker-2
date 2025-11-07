class PayTracker {
    constructor() {
        this.workEntries = [];
        this.currentChart = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadEntries();
        this.setupMonthFilter();
    }

    bindEvents() {
        // Form submission
        document.getElementById('workForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addEntry();
        });

        // Rate type change
        document.querySelectorAll('input[name="rateType"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.toggleRateInputs(e.target.value);
            });
        });

        // Auto-calculate pay
        document.getElementById('hoursWorked').addEventListener('input', () => this.calculatePay());
        document.getElementById('hourlyRateInput').addEventListener('input', () => this.calculatePay());
        document.getElementById('dailyRateInput').addEventListener('input', () => this.calculatePay());

        // Month filter
        document.getElementById('monthFilter').addEventListener('change', () => {
            this.filterByMonth();
        });
    }

    toggleRateInputs(rateType) {
        const hourlyGroup = document.getElementById('hourlyRateGroup');
        const dailyGroup = document.getElementById('dailyRateGroup');
        const hourlyInput = document.getElementById('hourlyRateInput');
        const dailyInput = document.getElementById('dailyRateInput');

        if (rateType === 'hourly') {
            hourlyGroup.style.display = 'block';
            dailyGroup.style.display = 'none';
            hourlyInput.required = true;
            dailyInput.required = false;
        } else {
            hourlyGroup.style.display = 'none';
            dailyGroup.style.display = 'block';
            hourlyInput.required = false;
            dailyInput.required = true;
        }
        this.calculatePay();
    }

    calculatePay() {
        const hours = parseFloat(document.getElementById('hoursWorked').value) || 0;
        const rateType = document.querySelector('input[name="rateType"]:checked').value;
        
        let pay = 0;
        
        if (rateType === 'hourly') {
            const hourlyRate = parseFloat(document.getElementById('hourlyRateInput').value) || 0;
            pay = hours * hourlyRate;
        } else {
            const dailyRate = parseFloat(document.getElementById('dailyRateInput').value) || 0;
            pay = dailyRate;
        }

        const calculatedPay = document.getElementById('calculatedPay');
        const payAmount = document.getElementById('payAmount');
        
        if (pay > 0) {
            payAmount.textContent = pay.toFixed(2);
            calculatedPay.style.display = 'block';
        } else {
            calculatedPay.style.display = 'none';
        }
    }

    async addEntry() {
        const date = document.getElementById('date').value;
        const hours = parseFloat(document.getElementById('hoursWorked').value);
        const rateType = document.querySelector('input[name="rateType"]:checked').value;
        
        let rate, pay;
        
        if (rateType === 'hourly') {
            rate = parseFloat(document.getElementById('hourlyRateInput').value);
            pay = hours * rate;
        } else {
            rate = parseFloat(document.getElementById('dailyRateInput').value);
            pay = rate;
            // Calculate equivalent hourly rate for display
            rate = pay / hours;
        }

        const entry = {
            date,
            hours,
            rateType,
            rate,
            pay
        };

        try {
            // Save to Google Sheets
            await saveToGoogleSheets(entry);
            
            // Add to local storage and update UI
            this.workEntries.push(entry);
            this.saveEntries();
            this.updateUI();
            this.resetForm();
            
            alert('Entry added successfully!');
        } catch (error) {
            console.error('Error saving entry:', error);
            alert('Error saving entry. Please try again.');
        }
    }

    resetForm() {
        document.getElementById('workForm').reset();
        document.getElementById('calculatedPay').style.display = 'none';
        document.getElementById('hourlyRate').checked = true;
        this.toggleRateInputs('hourly');
    }

    async loadEntries() {
        try {
            // Try to load from Google Sheets first
            const entries = await loadFromGoogleSheets();
            if (entries && entries.length > 0) {
                this.workEntries = entries;
            } else {
                // Fallback to local storage
                const saved = localStorage.getItem('payTrackerEntries');
                if (saved) {
                    this.workEntries = JSON.parse(saved);
                }
            }
            this.updateUI();
        } catch (error) {
            console.error('Error loading entries:', error);
            // Fallback to local storage
            const saved = localStorage.getItem('payTrackerEntries');
            if (saved) {
                this.workEntries = JSON.parse(saved);
                this.updateUI();
            }
        }
    }

    saveEntries() {
        localStorage.setItem('payTrackerEntries', JSON.stringify(this.workEntries));
    }

    updateUI() {
        this.updateTable();
        this.updateStats();
        this.updateChart();
    }

    updateTable() {
        const tbody = document.querySelector('#workTable tbody');
        tbody.innerHTML = '';

        const filteredEntries = this.getFilteredEntries();

        filteredEntries.forEach((entry, index) => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${this.formatDate(entry.date)}</td>
                <td>${entry.hours.toFixed(2)}</td>
                <td>${entry.rateType}</td>
                <td>$${entry.rate.toFixed(2)}</td>
                <td>$${entry.pay.toFixed(2)}</td>
                <td>
                    <button class="delete-btn" onclick="payTracker.deleteEntry(${index})">Delete</button>
                </td>
            `;
            
            tbody.appendChild(row);
        });
    }

    updateStats() {
        const filteredEntries = this.getFilteredEntries();
        
        const totalHours = filteredEntries.reduce((sum, entry) => sum + entry.hours, 0);
        const totalPay = filteredEntries.reduce((sum, entry) => sum + entry.pay, 0);
        const averagePay = filteredEntries.length > 0 ? totalPay / filteredEntries.length : 0;

        document.getElementById('totalHours').textContent = totalHours.toFixed(2);
        document.getElementById('totalPay').textContent = `$${totalPay.toFixed(2)}`;
        document.getElementById('averagePay').textContent = `$${averagePay.toFixed(2)}`;
    }

    setupMonthFilter() {
        const monthFilter = document.getElementById('monthFilter');
        const months = this.getAvailableMonths();
        
        months.forEach(month => {
            const option = document.createElement('option');
            option.value = month;
            option.textContent = month;
            monthFilter.appendChild(option);
        });
    }

    getAvailableMonths() {
        const months = new Set();
        this.workEntries.forEach(entry => {
            const date = new Date(entry.date);
            const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            months.add(monthYear);
        });
        return Array.from(months).sort();
    }

    getFilteredEntries() {
        const selectedMonth = document.getElementById('monthFilter').value;
        if (!selectedMonth) return this.workEntries;

        return this.workEntries.filter(entry => {
            const entryMonth = entry.date.substring(0, 7); // YYYY-MM
            return entryMonth === selectedMonth;
        });
    }

    filterByMonth() {
        this.updateUI();
    }

    updateChart() {
        const ctx = document.getElementById('payChart').getContext('2d');
        
        if (this.currentChart) {
            this.currentChart.destroy();
        }

        const filteredEntries = this.getFilteredEntries();
        const groupedData = this.groupDataByMonth(filteredEntries);

        const labels = Object.keys(groupedData);
        const payData = Object.values(groupedData).map(month => month.totalPay);

        this.currentChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Monthly Pay ($)',
                    data: payData,
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value;
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Pay: $${context.parsed.y.toFixed(2)}`;
                            }
                        }
                    }
                }
            }
        });
    }

    groupDataByMonth(entries) {
        const grouped = {};
        
        entries.forEach(entry => {
            const date = new Date(entry.date);
            const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
            
            if (!grouped[monthKey]) {
                grouped[monthKey] = {
                    totalPay: 0,
                    totalHours: 0,
                    entries: 0
                };
            }
            
            grouped[monthKey].totalPay += entry.pay;
            grouped[monthKey].totalHours += entry.hours;
            grouped[monthKey].entries += 1;
        });
        
        return grouped;
    }

    deleteEntry(index) {
        if (confirm('Are you sure you want to delete this entry?')) {
            this.workEntries.splice(index, 1);
            this.saveEntries();
            this.updateUI();
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US');
    }
}

// Initialize the app
const payTracker = new PayTracker();