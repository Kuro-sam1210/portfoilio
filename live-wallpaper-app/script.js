// Electron IPC
const { ipcRenderer } = require('electron');

// File handling variables
let selectedFilePath = null;

// Mock data for wallpapers (keeping for compatibility)
const wallpapers = [
    {
        id: 1,
        title: "Mountain Landscape",
        category: "Nature",
        image: "https://picsum.photos/400/300?random=1",
        downloadUrl: "https://picsum.photos/1920/1080?random=1",
        description: "Beautiful mountain landscape with snow-capped peaks"
    },
    {
        id: 2,
        title: "Ocean Waves",
        category: "Nature",
        image: "https://picsum.photos/400/300?random=2",
        downloadUrl: "https://picsum.photos/1920/1080?random=2",
        description: "Calm ocean waves crashing on the shore"
    },
    {
        id: 3,
        title: "City Skyline",
        category: "Urban",
        image: "https://picsum.photos/400/300?random=3",
        downloadUrl: "https://picsum.photos/1920/1080?random=3",
        description: "Modern city skyline at night"
    },
    {
        id: 4,
        title: "Forest Path",
        category: "Nature",
        image: "https://picsum.photos/400/300?random=4",
        downloadUrl: "https://picsum.photos/1920/1080?random=4",
        description: "Peaceful forest path with sunlight filtering through trees"
    },
    {
        id: 5,
        title: "Abstract Art",
        category: "Abstract",
        image: "https://picsum.photos/400/300?random=5",
        downloadUrl: "https://picsum.photos/1920/1080?random=5",
        description: "Colorful abstract art with geometric patterns"
    },
    {
        id: 6,
        title: "Space Nebula",
        category: "Space",
        image: "https://picsum.photos/400/300?random=6",
        downloadUrl: "https://picsum.photos/1920/1080?random=6",
        description: "Stunning space nebula with vibrant colors"
    }
];

const categories = ["All", "Nature", "Urban", "Abstract", "Space"];

let currentCategory = "All";
let currentSearch = "";
let downloads = [];

// DOM elements
const homeSection = document.getElementById('home-section');
const downloadsSection = document.getElementById('downloads-section');
const instructionsSection = document.getElementById('instructions-section');
const wallpaperGrid = document.getElementById('wallpaper-grid');
const categoryButtons = document.getElementById('category-buttons');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const downloadList = document.getElementById('download-list');
const instructionContent = document.getElementById('instruction-content');

// New DOM elements for file handling
const selectFileBtn = document.getElementById('select-file-btn');
const fileInfo = document.getElementById('file-info');
const previewArea = document.getElementById('preview-area');
const setWallpaperBtn = document.getElementById('set-wallpaper-btn');

// Navigation
document.getElementById('home-btn').addEventListener('click', showHome);
document.getElementById('downloads-btn').addEventListener('click', showDownloads);
document.getElementById('instructions-btn').addEventListener('click', showInstructions);

// File handling events
selectFileBtn.addEventListener('click', selectFile);
setWallpaperBtn.addEventListener('click', setWallpaper);

// Initialize the app
function init() {
    createCategoryButtons();
    displayWallpapers();
    setupSearch();
    setupInstructions();
}

function createCategoryButtons() {
    categoryButtons.innerHTML = '';
    categories.forEach(category => {
        const button = document.createElement('button');
        button.className = 'category-btn';
        button.textContent = category;
        button.addEventListener('click', () => filterByCategory(category));
        if (category === currentCategory) {
            button.classList.add('active');
        }
        categoryButtons.appendChild(button);
    });
}

function displayWallpapers() {
    wallpaperGrid.innerHTML = '';
    const filteredWallpapers = wallpapers.filter(wallpaper => {
        const matchesCategory = currentCategory === "All" || wallpaper.category === currentCategory;
        const matchesSearch = wallpaper.title.toLowerCase().includes(currentSearch.toLowerCase()) ||
                              wallpaper.description.toLowerCase().includes(currentSearch.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    filteredWallpapers.forEach(wallpaper => {
        const card = createWallpaperCard(wallpaper);
        wallpaperGrid.appendChild(card);
    });
}

function createWallpaperCard(wallpaper) {
    const card = document.createElement('div');
    card.className = 'wallpaper-card';
    card.innerHTML = `
        <img src="${wallpaper.image}" alt="${wallpaper.title}">
        <div class="wallpaper-info">
            <h3>${wallpaper.title}</h3>
            <p>${wallpaper.description}</p>
            <button class="download-btn" data-id="${wallpaper.id}">Download</button>
        </div>
    `;

    card.querySelector('.download-btn').addEventListener('click', () => downloadWallpaper(wallpaper));
    return card;
}

function filterByCategory(category) {
    currentCategory = category;
    createCategoryButtons();
    displayWallpapers();
}

function setupSearch() {
    searchBtn.addEventListener('click', () => {
        currentSearch = searchInput.value;
        displayWallpapers();
    });

    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            currentSearch = searchInput.value;
            displayWallpapers();
        }
    });
}

function downloadWallpaper(wallpaper) {
    const downloadId = Date.now();
    const download = {
        id: downloadId,
        title: wallpaper.title,
        progress: 0,
        status: 'downloading'
    };

    downloads.push(download);
    updateDownloadList();

    // Simulate download progress
    const interval = setInterval(() => {
        download.progress += Math.random() * 20;
        if (download.progress >= 100) {
            download.progress = 100;
            download.status = 'completed';
            clearInterval(interval);
        }
        updateDownloadList();
    }, 500);
}

function updateDownloadList() {
    downloadList.innerHTML = '';
    downloads.forEach(download => {
        const item = document.createElement('div');
        item.className = 'download-item';
        item.innerHTML = `
            <div class="info">
                <h4>${download.title}</h4>
                <p>Status: ${download.status}</p>
            </div>
            <div class="progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${download.progress}%"></div>
                </div>
                <span>${Math.round(download.progress)}%</span>
            </div>
        `;
        downloadList.appendChild(item);
    });
}

function setupInstructions() {
    const pcInstructions = `
        <h3>Setting Live Wallpapers on PC</h3>
        <ol>
            <li>Download and install a live wallpaper software like Wallpaper Engine or Rainmeter.</li>
            <li>Launch the software and import the downloaded wallpaper file.</li>
            <li>Configure the wallpaper settings according to your preferences.</li>
            <li>Apply the wallpaper through your desktop settings.</li>
            <li>Enjoy your new live wallpaper!</li>
        </ol>
    `;

    const mobileInstructions = `
        <h3>Setting Live Wallpapers on Mobile</h3>
        <ol>
            <li>Download a live wallpaper app from your app store (e.g., VideoWall, KLWP).</li>
            <li>Transfer the downloaded wallpaper file to your device.</li>
            <li>Open the live wallpaper app and select the wallpaper file.</li>
            <li>Customize the settings if available.</li>
            <li>Go to your device's wallpaper settings and select the live wallpaper app.</li>
            <li>Choose your wallpaper and set it as your home screen or lock screen background.</li>
        </ol>
    `;

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if (btn.dataset.tab === 'pc') {
                instructionContent.innerHTML = pcInstructions;
            } else {
                instructionContent.innerHTML = mobileInstructions;
            }
        });
    });

    // Show PC instructions by default
    instructionContent.innerHTML = pcInstructions;
}

function showHome() {
    hideAllSections();
    homeSection.classList.remove('hidden');
}

function showDownloads() {
    hideAllSections();
    downloadsSection.classList.remove('hidden');
}

function showInstructions() {
    hideAllSections();
    instructionsSection.classList.remove('hidden');
}

function hideAllSections() {
    homeSection.classList.add('hidden');
    downloadsSection.classList.add('hidden');
    instructionsSection.classList.add('hidden');
}

// File handling functions
async function selectFile() {
    try {
        const filePath = await ipcRenderer.invoke('select-file');
        if (filePath) {
            selectedFilePath = filePath;
            const fileName = filePath.split('\\').pop();
            fileInfo.textContent = `Selected: ${fileName}`;
            previewFile(filePath);
            setWallpaperBtn.disabled = false;
        }
    } catch (error) {
        console.error('Error selecting file:', error);
    }
}

function previewFile(filePath) {
    const extension = filePath.split('.').pop().toLowerCase();
    previewArea.innerHTML = '';

    if (extension === 'gif') {
        const img = document.createElement('img');
        img.src = `file://${filePath}`;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'contain';
        previewArea.appendChild(img);
    } else {
        // For video files
        const video = document.createElement('video');
        video.src = `file://${filePath}`;
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'contain';
        video.controls = true;
        video.muted = true; // Muted for preview
        previewArea.appendChild(video);
    }
}

function setWallpaper() {
    if (selectedFilePath) {
        ipcRenderer.send('set-wallpaper', selectedFilePath);
        alert('Wallpaper set! The video/GIF should now be playing in the background.');
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', init);