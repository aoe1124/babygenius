// Global variables
let results = {};
let potentialTypes = {};
let chart = null;

// Initialize results page
document.addEventListener('DOMContentLoaded', async function() {
    // Load results
    const savedResults = localStorage.getItem('babyTestResults');
    if (!savedResults) {
        window.location.href = 'index.html';
        return;
    }

    results = JSON.parse(savedResults);

    // Load potential types data from data.js
    potentialTypes = questionsData.potentialTypes;

    // Process and display results
    processResults();
    displayResults();
    createChart();
});

// Process results scores
function processResults() {
    // Convert scores to percentages
    const maxScore = Math.max(...Object.values(results.scores));
    const scorePercentages = {};

    Object.entries(results.scores).forEach(([type, score]) => {
        scorePercentages[type] = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    });

    results.scorePercentages = scorePercentages;

    // Sort types by score
    results.sortedTypes = Object.entries(results.scores)
        .sort((a, b) => b[1] - a[1])
        .map(([type, score]) => ({
            type,
            score,
            percentage: scorePercentages[type],
            ...potentialTypes[type]
        }));

    // Handle ties (prioritize more communicative types)
    const priorityOrder = ['artist', 'musician', 'diplomat', 'scientist', 'writer', 'athlete', 'logician', 'naturalist'];
    results.sortedTypes.sort((a, b) => {
        if (a.score !== b.score) return b.score - a.score;
        return priorityOrder.indexOf(a.type) - priorityOrder.indexOf(b.type);
    });
}

// Display results
function displayResults() {
    // Baby name
    document.getElementById('babyName').textContent = results.testInfo.babyName || '宝宝';

    // Main potential
    const mainType = results.sortedTypes[0];
    document.getElementById('resultEmoji').textContent = mainType.emoji;
    document.getElementById('mainPotential').textContent = mainType.name;
    document.getElementById('talentDescription').textContent = mainType.description;

    // Career list
    const careerList = document.getElementById('careerList');
    mainType.careers.forEach(career => {
        const div = document.createElement('div');
        div.className = 'career-item';
        div.textContent = career;
        careerList.appendChild(div);
    });

    // Suggestions
    const suggestionList = document.getElementById('suggestionList');
    mainType.suggestions.forEach(suggestion => {
        const li = document.createElement('li');
        li.className = 'suggestion-item';
        li.textContent = suggestion;
        suggestionList.appendChild(li);
    });

    // Potential talents (secondary potentials)
    if (results.sortedTypes.length > 1) {
        const potentialSection = document.getElementById('potentialTalentSection');
        const potentialList = document.getElementById('potentialTalentList');
        potentialSection.style.display = 'block';

        // Show top 2-3 secondary potentials
        const secondaryTypes = results.sortedTypes.slice(1, 4);
        secondaryTypes.forEach(type => {
            if (type.score > 0) {
                const div = document.createElement('div');
                div.className = 'potential-talent-item';
                div.style.marginBottom = '0.5rem';
                div.innerHTML = `
                    <span style="font-size: 1.2rem;">${type.emoji}</span>
                    <span style="margin-left: 0.5rem;">${type.name} (${type.percentage}%)</span>
                `;
                potentialList.appendChild(div);
            }
        });
    }
}

// Create radar chart
function createChart() {
    const ctx = document.getElementById('potentialChart').getContext('2d');

    // Prepare data
    const labels = results.sortedTypes.map(type => type.name);
    const data = results.sortedTypes.map(type => type.percentage);
    const emojis = results.sortedTypes.map(type => type.emoji);

    chart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: labels.map((label, i) => `${emojis[i]} ${label}`),
            datasets: [{
                label: '潜能指数',
                data: data,
                backgroundColor: 'rgba(255, 105, 180, 0.2)',
                borderColor: 'rgba(255, 105, 180, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(255, 105, 180, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(255, 105, 180, 1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        stepSize: 20,
                        display: false
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    angleLines: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.raw + '%';
                        }
                    }
                }
            }
        }
    });
}

// Save as PDF
async function saveAsPDF() {
    document.getElementById('loadingOverlay').style.display = 'flex';

    try {
        // Hide action buttons temporarily
        const actionButtons = document.querySelector('.action-buttons');
        actionButtons.style.display = 'none';

        // Create canvas from result container
        const element = document.querySelector('.result-container');
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
        });

        // Show action buttons again
        actionButtons.style.display = 'flex';

        // Create PDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');

        // Calculate dimensions
        const imgWidth = 190; // A4 width with margins
        const pageHeight = 297; // A4 height
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 10; // Top margin

        // Add first page
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight - 20;

        // Add new pages if needed
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight + 10;
            pdf.addPage();
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        // Generate filename
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const babyName = results.testInfo.babyName || '宝宝';
        const filename = `宝宝潜能测试报告_${babyName}_${date}.pdf`;

        // Save PDF
        pdf.save(filename);

        // Hide loading
        document.getElementById('loadingOverlay').style.display = 'none';

        // Show success message
        alert('PDF报告已保存！');
    } catch (error) {
        console.error('Error generating PDF:', error);
        document.getElementById('loadingOverlay').style.display = 'none';
        alert('生成PDF失败，请重试');
    }
}

// Retake test
function retakeTest() {
    // Clear saved data
    localStorage.removeItem('babyTestInfo');
    localStorage.removeItem('babyTestAnswers');
    localStorage.removeItem('babyTestResults');

    // Go to home page
    window.location.href = 'index.html';
}

// Share results (optional function)
function shareResults() {
    const mainType = results.sortedTypes[0];
    const text = `我发现${results.testInfo.babyName}是${mainType.emoji}${mainType.name}！测一测你的宝宝未来有什么职业天赋吧~`;

    if (navigator.share) {
        navigator.share({
            title: '宝宝未来职业潜力测试',
            text: text,
            url: window.location.origin
        }).catch(err => console.log('分享失败', err));
    } else {
        // Copy to clipboard
        navigator.clipboard.writeText(text + ' ' + window.location.origin).then(() => {
            alert('链接已复制到剪贴板！');
        });
    }
}

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + S to save PDF
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveAsPDF();
    }
    // R to retake test
    if (e.key === 'r' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (confirm('确定要重新测试吗？')) {
            retakeTest();
        }
    }
});