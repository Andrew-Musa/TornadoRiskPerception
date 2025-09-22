// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

// Navigation functionality
hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger?.classList.remove('active');
        navMenu?.classList.remove('active');
    });
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Animated counters for hero stats
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start);
        }
    }, 16);
}

// Initialize counters when they come into view
const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px 0px -100px 0px'
};

const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const target = parseInt(entry.target.dataset.target);
            animateCounter(entry.target, target);
            counterObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.stat-number').forEach(counter => {
    counterObserver.observe(counter);
});

// Risk Assessment Form
class RiskAssessment {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 3;
        this.responses = {};
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateSliderValue();
    }

    bindEvents() {
        // Next step buttons
        document.querySelectorAll('.next-step').forEach(btn => {
            btn.addEventListener('click', () => this.nextStep());
        });

        // Previous step buttons
        document.querySelectorAll('.prev-step').forEach(btn => {
            btn.addEventListener('click', () => this.prevStep());
        });

        // Calculate results button
        document.querySelector('.calculate-results')?.addEventListener('click', () => {
            this.calculateResults();
        });

        // Restart assessment button
        document.querySelector('.restart-assessment')?.addEventListener('click', () => {
            this.restart();
        });

        // Slider value update
        const slider = document.getElementById('likelihood');
        if (slider) {
            slider.addEventListener('input', this.updateSliderValue);
        }
    }

    updateSliderValue() {
        const slider = document.getElementById('likelihood');
        const valueDisplay = document.querySelector('.slider-value');
        if (slider && valueDisplay) {
            valueDisplay.textContent = slider.value + '%';
        }
    }

    nextStep() {
        if (this.validateCurrentStep()) {
            this.saveCurrentStep();
            if (this.currentStep < this.totalSteps) {
                this.currentStep++;
                this.showStep(this.currentStep);
            }
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.showStep(this.currentStep);
        }
    }

    showStep(step) {
        document.querySelectorAll('.form-step').forEach(stepEl => {
            stepEl.classList.remove('active');
        });
        const targetStep = document.querySelector(`[data-step="${step}"]`);
        if (targetStep) {
            targetStep.classList.add('active');
        }
    }

    validateCurrentStep() {
        const currentStepEl = document.querySelector(`[data-step="${this.currentStep}"]`);
        if (!currentStepEl) return false;

        const requiredInputs = currentStepEl.querySelectorAll('input[required], select[required]');
        let isValid = true;

        requiredInputs.forEach(input => {
            if (!input.value.trim()) {
                input.style.borderColor = 'var(--danger-color)';
                isValid = false;
            } else {
                input.style.borderColor = 'var(--gray-300)';
            }
        });

        if (this.currentStep === 2) {
            const preparednessRadios = document.querySelectorAll('input[name="preparedness"]');
            const isRadioSelected = Array.from(preparednessRadios).some(radio => radio.checked);
            if (!isRadioSelected) {
                isValid = false;
                // Add visual feedback for radio group
            }
        }

        if (this.currentStep === 3) {
            const sourceCheckboxes = document.querySelectorAll('input[name="sources"]');
            const isCheckboxSelected = Array.from(sourceCheckboxes).some(checkbox => checkbox.checked);
            if (!isCheckboxSelected) {
                isValid = false;
                // Add visual feedback for checkbox group
            }
        }

        return isValid;
    }

    saveCurrentStep() {
        const currentStepEl = document.querySelector(`[data-step="${this.currentStep}"]`);
        if (!currentStepEl) return;

        switch (this.currentStep) {
            case 1:
                this.responses.location = document.getElementById('location').value;
                this.responses.experience = document.getElementById('experience').value;
                break;
            case 2:
                this.responses.likelihood = document.getElementById('likelihood').value;
                const preparedness = document.querySelector('input[name="preparedness"]:checked');
                this.responses.preparedness = preparedness ? preparedness.value : '';
                break;
            case 3:
                const sources = Array.from(document.querySelectorAll('input[name="sources"]:checked'))
                    .map(cb => cb.value);
                this.responses.sources = sources;
                break;
        }
    }

    calculateResults() {
        this.saveCurrentStep();
        
        // Simple risk assessment algorithm
        let riskScore = 0;
        let perceptionScore = 0;
        let preparednessScore = 0;

        // Location-based risk (simplified)
        const zipCode = this.responses.location;
        const floridaZips = ['33620', '33612', '33613', '33614', '33615'];
        const highRiskStates = ['TX', 'OK', 'KS', 'NE'];
        
        if (floridaZips.includes(zipCode)) {
            riskScore = 3; // Moderate risk for Florida
        } else {
            riskScore = 2; // Default moderate risk
        }

        // Experience factor
        switch (this.responses.experience) {
            case 'direct':
                perceptionScore += 3;
                break;
            case 'nearby':
                perceptionScore += 2;
                break;
            case 'no':
                perceptionScore += 1;
                break;
        }

        // Likelihood perception
        const likelihood = parseInt(this.responses.likelihood);
        if (likelihood > 70) perceptionScore += 3;
        else if (likelihood > 40) perceptionScore += 2;
        else perceptionScore += 1;

        // Preparedness level
        switch (this.responses.preparedness) {
            case 'very':
                preparednessScore = 3;
                break;
            case 'somewhat':
                preparednessScore = 2;
                break;
            case 'not':
                preparednessScore = 1;
                break;
        }

        this.displayResults(riskScore, perceptionScore, preparednessScore);
    }

    displayResults(riskScore, perceptionScore, preparednessScore) {
        const resultsEl = document.getElementById('results');
        const resultsContent = document.querySelector('.results-content');
        
        if (!resultsEl || !resultsContent) return;

        // Hide form steps and show results
        document.querySelectorAll('.form-step').forEach(step => {
            step.style.display = 'none';
        });
        resultsEl.style.display = 'block';

        // Generate personalized results
        const riskLevel = riskScore >= 3 ? 'High' : riskScore >= 2 ? 'Moderate' : 'Low';
        const perceptionLevel = perceptionScore >= 6 ? 'High' : perceptionScore >= 4 ? 'Moderate' : 'Low';
        const preparednessLevel = preparednessScore >= 3 ? 'Well Prepared' : preparednessScore >= 2 ? 'Moderately Prepared' : 'Needs Improvement';

        const resultsHTML = `
            <div class="result-item">
                <h4>Actual Risk Level</h4>
                <div class="risk-indicator ${riskLevel.toLowerCase()}">${riskLevel}</div>
                <p>Based on your location and historical tornado data</p>
            </div>
            <div class="result-item">
                <h4>Your Risk Perception</h4>
                <div class="perception-indicator ${perceptionLevel.toLowerCase()}">${perceptionLevel}</div>
                <p>How you perceive tornado risk in your area</p>
            </div>
            <div class="result-item">
                <h4>Preparedness Level</h4>
                <div class="preparedness-indicator ${preparednessLevel.toLowerCase().replace(' ', '-')}">${preparednessLevel}</div>
                <p>Your current level of tornado preparedness</p>
            </div>
            <div class="recommendations">
                <h4>Personalized Recommendations</h4>
                ${this.generateRecommendations(riskScore, perceptionScore, preparednessScore)}
            </div>
        `;

        resultsContent.innerHTML = resultsHTML;

        // Add CSS for result indicators
        this.addResultStyles();
    }

    generateRecommendations(riskScore, perceptionScore, preparednessScore) {
        const recommendations = [];

        if (preparednessScore < 3) {
            recommendations.push("• Create a family emergency plan and practice tornado drills");
            recommendations.push("• Identify safe rooms in your home and workplace");
        }

        if (perceptionScore < 4) {
            recommendations.push("• Learn about tornado warning signs and safety procedures");
            recommendations.push("• Install a weather alert app on your mobile device");
        }

        if (riskScore >= 2) {
            recommendations.push("• Consider a weather radio for reliable alerts");
            recommendations.push("• Prepare an emergency kit with supplies for 72 hours");
        }

        recommendations.push("• Stay informed about local weather conditions during severe weather season");
        recommendations.push("• Review and update your emergency plan annually");

        return `<ul>${recommendations.map(rec => `<li>${rec}</li>`).join('')}</ul>`;
    }

    addResultStyles() {
        if (document.getElementById('result-styles')) return;

        const style = document.createElement('style');
        style.id = 'result-styles';
        style.textContent = `
            .result-item {
                margin-bottom: 2rem;
                text-align: center;
            }
            .result-item h4 {
                margin-bottom: 0.5rem;
                color: var(--gray-700);
            }
            .risk-indicator, .perception-indicator, .preparedness-indicator {
                display: inline-block;
                padding: 0.5rem 1rem;
                border-radius: var(--border-radius);
                font-weight: 600;
                margin-bottom: 0.5rem;
            }
            .high { background-color: var(--danger-color); color: white; }
            .moderate { background-color: var(--warning-color); color: white; }
            .low { background-color: var(--success-color); color: white; }
            .well-prepared { background-color: var(--success-color); color: white; }
            .moderately-prepared { background-color: var(--warning-color); color: white; }
            .needs-improvement { background-color: var(--danger-color); color: white; }
            .recommendations {
                text-align: left;
                background-color: var(--gray-100);
                padding: 1.5rem;
                border-radius: var(--border-radius);
                margin-top: 2rem;
            }
            .recommendations ul {
                margin: 1rem 0 0 0;
                padding-left: 0;
                list-style: none;
            }
            .recommendations li {
                margin-bottom: 0.5rem;
                color: var(--gray-700);
            }
        `;
        document.head.appendChild(style);
    }

    restart() {
        this.currentStep = 1;
        this.responses = {};
        
        // Reset form
        document.querySelectorAll('.form-step').forEach((step, index) => {
            step.style.display = index === 0 ? 'block' : 'none';
            step.classList.toggle('active', index === 0);
        });
        
        // Hide results
        document.getElementById('results').style.display = 'none';
        
        // Clear form inputs
        document.querySelectorAll('input, select').forEach(input => {
            if (input.type === 'checkbox' || input.type === 'radio') {
                input.checked = false;
            } else {
                input.value = '';
            }
            input.style.borderColor = 'var(--gray-300)';
        });
        
        // Reset slider
        const slider = document.getElementById('likelihood');
        if (slider) {
            slider.value = 50;
            this.updateSliderValue();
        }
    }
}

// Data Visualization with Chart.js
class DataVisualization {
    constructor() {
        this.charts = {};
        this.init();
    }

    init() {
        // Wait for Chart.js to load
        if (typeof Chart !== 'undefined') {
            this.createCharts();
        } else {
            // Retry after a short delay
            setTimeout(() => this.init(), 100);
        }
    }

    createCharts() {
        this.createTornadoFrequencyChart();
        this.createPerceptionChart();
        this.createPreparednessChart();
        this.createSourcesChart();
    }

    createTornadoFrequencyChart() {
        const ctx = document.getElementById('tornadoChart');
        if (!ctx) return;

        this.charts.tornado = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Texas', 'Kansas', 'Oklahoma', 'Florida', 'Nebraska', 'Iowa'],
                datasets: [{
                    label: 'Annual Tornado Count',
                    data: [155, 96, 62, 66, 57, 51],
                    backgroundColor: [
                        '#ef4444',
                        '#f97316',
                        '#eab308',
                        '#22c55e',
                        '#3b82f6',
                        '#8b5cf6'
                    ],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#e2e8f0'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    createPerceptionChart() {
        const ctx = document.getElementById('perceptionChart');
        if (!ctx) return;

        this.charts.perception = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Risk Perception vs Actual Risk',
                    data: [
                        {x: 85, y: 92},
                        {x: 70, y: 45},
                        {x: 60, y: 78},
                        {x: 45, y: 30},
                        {x: 30, y: 65},
                        {x: 25, y: 15},
                        {x: 90, y: 88},
                        {x: 75, y: 55}
                    ],
                    backgroundColor: '#3b82f6',
                    borderColor: '#1d4ed8',
                    borderWidth: 2,
                    pointRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Actual Risk Level (%)'
                        },
                        grid: {
                            color: '#e2e8f0'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Perceived Risk Level (%)'
                        },
                        grid: {
                            color: '#e2e8f0'
                        }
                    }
                }
            }
        });
    }

    createPreparednessChart() {
        const ctx = document.getElementById('preparednessChart');
        if (!ctx) return;

        this.charts.preparedness = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Well Prepared', 'Somewhat Prepared', 'Not Prepared'],
                datasets: [{
                    data: [25, 45, 30],
                    backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                    borderWidth: 3,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
    }

    createSourcesChart() {
        const ctx = document.getElementById('sourcesChart');
        if (!ctx) return;

        this.charts.sources = new Chart(ctx, {
            type: 'horizontalBar',
            data: {
                labels: ['TV Weather', 'Weather Apps', 'Emergency Alerts', 'Social Media', 'Radio'],
                datasets: [{
                    label: 'Usage Percentage',
                    data: [68, 52, 41, 35, 28],
                    backgroundColor: '#3b82f6',
                    borderColor: '#1d4ed8',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: '#e2e8f0'
                        }
                    },
                    y: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }
}

// Contact Form Handler
class ContactForm {
    constructor() {
        this.form = document.getElementById('contactForm');
        this.init();
    }

    init() {
        if (this.form) {
            this.form.addEventListener('submit', this.handleSubmit.bind(this));
        }
    }

    handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData);
        
        // Simulate form submission
        this.showSubmissionFeedback();
        
        // Reset form
        this.form.reset();
    }

    showSubmissionFeedback() {
        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        submitBtn.textContent = 'Message Sent!';
        submitBtn.style.backgroundColor = 'var(--success-color)';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            submitBtn.textContent = originalText;
            submitBtn.style.backgroundColor = 'var(--primary-color)';
            submitBtn.disabled = false;
        }, 3000);
    }
}

// Scroll animations
class ScrollAnimations {
    constructor() {
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        this.init();
    }

    init() {
        this.observer = new IntersectionObserver(this.handleIntersection.bind(this), this.observerOptions);
        
        // Observe elements for animation
        document.querySelectorAll('.research-card, .resource-card, .chart-container').forEach(el => {
            this.observer.observe(el);
        });
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                this.observer.unobserve(entry.target);
            }
        });
    }
}

// Navbar scroll effect
class NavbarScrollEffect {
    constructor() {
        this.navbar = document.querySelector('.navbar');
        this.init();
    }

    init() {
        if (this.navbar) {
            window.addEventListener('scroll', this.handleScroll.bind(this));
        }
    }

    handleScroll() {
        if (window.scrollY > 100) {
            this.navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
            this.navbar.style.boxShadow = 'var(--shadow-md)';
        } else {
            this.navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            this.navbar.style.boxShadow = 'none';
        }
    }
}

// Initialize all components when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new RiskAssessment();
    new DataVisualization();
    new ContactForm();
    new ScrollAnimations();
    new NavbarScrollEffect();
    
    // Add loading states and error handling
    console.log('Tornado Risk Perception website initialized successfully');
});

// Add some interactive tornado particles for visual appeal
class TornadoParticles {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.init();
    }

    init() {
        this.createCanvas();
        this.createParticles();
        this.animate();
    }

    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '-1';
        this.canvas.style.opacity = '0.1';
        
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticles() {
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                size: Math.random() * 3 + 1,
                speedX: (Math.random() - 0.5) * 2,
                speedY: (Math.random() - 0.5) * 2,
                opacity: Math.random() * 0.5 + 0.3
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(particle => {
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            // Wrap around edges
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.y > this.canvas.height) particle.y = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            
            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(59, 130, 246, ${particle.opacity})`;
            this.ctx.fill();
        });
        
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize particles after a delay to avoid impacting initial load
setTimeout(() => {
    new TornadoParticles();
}, 2000);
