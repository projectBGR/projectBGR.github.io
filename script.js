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
});