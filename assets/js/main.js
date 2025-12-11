// DOM elements
const startBtn = document.getElementById('startBtn');
const babyNameInput = document.getElementById('babyName');

// State
let babyName = '';

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners
    startBtn.addEventListener('click', handleStartTest);
    babyNameInput.addEventListener('input', handleNameInput);

    // Enable start button by default
    startBtn.disabled = false;

    // Add floating animation to type items
    addFloatingAnimation();
});

// Handle name input
function handleNameInput() {
    babyName = babyNameInput.value.trim();
}

// Handle start test button click
function handleStartTest() {
    // Use default name if not provided
    const finalBabyName = babyName || '宝宝';

    // Save test info to localStorage
    const testInfo = {
        babyName: finalBabyName,
        gender: 'neutral',
        startTime: new Date().toISOString()
    };

    localStorage.setItem('babyTestInfo', JSON.stringify(testInfo));

    // Navigate to test page
    window.location.href = 'test.html';
}

// Add interactive effects to type items
function addFloatingAnimation() {
    const typeItems = document.querySelectorAll('.type-item');
    typeItems.forEach((item, index) => {
        // Add click effect
        item.addEventListener('click', function() {
            // Create ripple effect
            const ripple = document.createElement('span');
            ripple.style.position = 'absolute';
            ripple.style.width = '100%';
            ripple.style.height = '100%';
            ripple.style.background = 'radial-gradient(circle, rgba(255,105,180,0.2) 0%, transparent 70%)';
            ripple.style.borderRadius = '50%';
            ripple.style.transform = 'scale(0)';
            ripple.style.animation = 'rippleEffect 0.6s ease-out';
            ripple.style.pointerEvents = 'none';

            this.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// Add some interactive effects
document.addEventListener('DOMContentLoaded', function() {
    // Add ripple effect to buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');

            // Add ripple styles if not already added
            if (!document.querySelector('#ripple-styles')) {
                const style = document.createElement('style');
                style.id = 'ripple-styles';
                style.textContent = `
                    button {
                        position: relative;
                        overflow: hidden;
                    }
                    .ripple {
                        position: absolute;
                        border-radius: 50%;
                        background: rgba(255, 255, 255, 0.6);
                        transform: scale(0);
                        animation: ripple-animation 0.6s ease-out;
                        pointer-events: none;
                    }
                    @keyframes ripple-animation {
                        to {
                            transform: scale(4);
                            opacity: 0;
                        }
                    }
                `;
                document.head.appendChild(style);
            }

            this.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // Add floating animation to type items
    const typeItems = document.querySelectorAll('.type-item');
    typeItems.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.1}s`;
        item.classList.add('fade-in');
    });
});