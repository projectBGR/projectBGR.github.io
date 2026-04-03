fetch('../nav.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('navbar-placeholder').innerHTML = data;
    });

// Toolbox filter functionality
function filterToolbox() {
    const filterInput = document.getElementById('categoryFilter');
    if (!filterInput) return; // Exit if filter input doesn't exist on this page
    
    const filterValue = filterInput.value.toLowerCase();
    const tableRows = document.querySelectorAll('.toolbox-table tbody tr');
    
    tableRows.forEach(row => {
        const categoryCell = row.querySelector('td:nth-child(2)');
        const categoryText = categoryCell ? categoryCell.textContent.toLowerCase() : '';
        
        if (categoryText.includes(filterValue)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function getMarkdownContent(markdownElement) {
    const markdownPath = markdownElement.getAttribute("data-src");
    if (!markdownPath) return;

    fetch(markdownPath)
        .then(response => response.text())
        .then(text => {
            markdownElement.innerHTML = marked.parse(text);
        });
}

function updateSophiePhotos() {
    const images = document.querySelectorAll('.memorial-left > div img');
    images.forEach((img, index) => {
        img.src = `../images/sophie/sophie${index}.jpeg`;
    });
}

// Initialize toolbox filter when page loads (only if elements exist)
document.addEventListener('DOMContentLoaded', function() {
    const filterInput = document.getElementById('categoryFilter');
    const markdownInput = document.querySelector('md');
    const includesHeader = document.querySelector('h1');
    
    if (filterInput) {
        filterInput.addEventListener('keyup', filterToolbox);
        filterInput.addEventListener('input', filterToolbox);
    }

    if (markdownInput) {
        getMarkdownContent(markdownInput);
    }

    if (includesHeader) {
        if(includesHeader.textContent.includes("Sophie")) {
            updateSophiePhotos();
        }
    }

    // Fitness dynamic loading
    loadFitnessData();
});

function parseCSV(text) {
    if (!text) return [];
    const lines = text.trim().split(/\r?\n/).filter(line => line.trim());
    if (!lines.length) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).map(line => {
        const cols = line.split(',');
        const row = {};
        headers.forEach((header, idx) => {
            row[header] = cols[idx] ? cols[idx].trim() : '';
        });
        return row;
    });
}

function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
    const monday = new Date(d.setDate(diff));
    return monday.toISOString().slice(0, 10);
}

function findCurrentWeekData(data) {
    if (!data || !data.length) return null;
    const currentWeek = getWeekStart(new Date());
    const match = data.find(row => row.week_start === currentWeek);
    return match || data[data.length - 1];
}

function updateWorkoutRegimen(data) {
    if (!data || !Array.isArray(data) || data.length === 0) return;
    
    const tbody = document.getElementById('workout-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    data.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.Exercise || '—'}</td>
            <td>${row.Muscle || '—'}</td>
            <td>${row.Sets || '—'}</td>
            <td>${row.Reps || '—'}</td>
            <td>${row.Weight || '—'}</td>
        `;
        tbody.appendChild(tr);
    });
}

function updateMealPrep(data) {
    if (!data) return;
    document.getElementById('meal-breakfast').textContent = data.breakfast || '—';
    document.getElementById('meal-breakfast-detail').textContent = data.breakfast_detail || '';
    document.getElementById('meal-lunch').textContent = data.lunch || '—';
    document.getElementById('meal-lunch-detail').textContent = data.lunch_detail || '';
    document.getElementById('meal-dinner').textContent = data.dinner || '—';
    document.getElementById('meal-dinner-detail').textContent = data.dinner_detail || '';
}

function updateWeeklyProgress(data) {
    if (!data) return;
    
    // Display current week
    const weekStart = getWeekStart(new Date());
    const weekDate = new Date(weekStart);
    const weekEnd = new Date(weekDate);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const monthOptions = { month: 'short', day: 'numeric' };
    const formattedWeek = `${weekDate.toLocaleDateString('en-US', monthOptions)} - ${weekEnd.toLocaleDateString('en-US', monthOptions)}`;
    const weekDisplay = document.getElementById('current-week');
    if (weekDisplay) {
        weekDisplay.textContent = formattedWeek;
    }
    
    const gymVisits = Number(data.gym_visits || 0);
    const gymGoal = Number(data.gym_goal || 1);
    const steps = Number(data.steps || 0);
    const stepsGoal = Number(data.steps_goal || 1);
    const eating = Number(data.healthy_eating || 0);
    const eatingGoal = Number(data.healthy_goal || 1);

    const gymPercent = Math.min(100, Math.round((gymVisits / gymGoal) * 100));
    const stepsPercent = Math.min(100, Math.round((steps / stepsGoal) * 100));
    const eatingPercent = Math.min(100, Math.round((eating / eatingGoal) * 100));

    document.getElementById('gym-label').textContent = `${gymVisits}/${gymGoal}`;
    document.getElementById('gym-progress').value = gymPercent;
    document.getElementById('gym-progress').max = 100;

    document.getElementById('steps-label').textContent = `${steps}/${stepsGoal}`;
    document.getElementById('steps-progress').value = stepsPercent;
    document.getElementById('steps-progress').max = 100;

    document.getElementById('eating-label').textContent = `${eating}/${eatingGoal}`;
    document.getElementById('eating-progress').value = eatingPercent;
    document.getElementById('eating-progress').max = 100;

    // Challenge progress
    const challengeProgress = Number(data.challenge_progress || 0);
    const challengeGoal = Number(data.challenge_goal || 1);
    const challengePercent = Math.min(100, Math.round((challengeProgress / challengeGoal) * 100));
    document.getElementById('challenge-progress').value = challengePercent;
    document.getElementById('challenge-progress').max = 100;

    document.getElementById('challenge-title').textContent = data.challenge_title || 'No Challenge Yet';
    document.getElementById('challenge-description').textContent = data.challenge_description || 'Add your monthly challenge details in progress CSV.';
    document.getElementById('challenge-month').textContent = data.challenge_month || 'Month TBD';
    document.getElementById('challenge-emblem').textContent = data.challenge_emblem || '🏅';
}

function loadFitnessData() {
    const base = '../fitness';

    fetch(`${base}/workout.csv`)
        .then(r => r.ok ? r.text() : Promise.reject('no workout csv'))
        .then(parseCSV)
        .then(rows => updateWorkoutRegimen(rows))
        .catch(() => console.warn('Workout CSV not found or failed to load'));

    fetch(`${base}/progress.csv`)
        .then(r => r.ok ? r.text() : Promise.reject('no progress csv'))
        .then(parseCSV)
        .then(rows => updateWeeklyProgress(findCurrentWeekData(rows)))
        .catch(() => console.warn('Progress CSV not found or failed to load'));

    fetch(`${base}/meals.csv`)
        .then(r => r.ok ? r.text() : Promise.reject('no meals csv'))
        .then(parseCSV)
        .then(rows => updateMealPrep(findCurrentWeekData(rows)))
        .catch(() => console.warn('Meals CSV not found or failed to load'));
}