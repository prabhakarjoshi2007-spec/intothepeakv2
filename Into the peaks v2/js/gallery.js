/**
 * INTO THE PEAKS - SUPREME GALLERY ENGINE (v25.0)
 * Features: Multi-media Carousel, Description Support, Auto-Video Detection
 */

const db = firebase.database();
let currentAlbum = [];
let currentMediaIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
    loadGalleryData();
});

// 1. DATA FETCHING (Firebase to Grid)
function loadGalleryData() {
    const display = document.getElementById('galleryDisplay');
    
    db.ref('itp_data/gallery').on('value', (snapshot) => {
        const data = snapshot.val();
        if (!data) {
            display.innerHTML = "<p style='text-align:center; grid-column:1/-1;'>No memories found yet. 🏔️</p>";
            return;
        }

        const albums = Object.values(data).reverse();
        display.innerHTML = albums.map((album, index) => renderGalleryCard(album, index)).join('');
    });
}

// 2. GRID CARD RENDERER
function renderGalleryCard(album, index) {
    const firstMedia = album.media[0];
    const isVid = firstMedia.type === 'video';
    const multiCount = album.media.length > 1 ? `<div class="multi-indicator"><i class="fas fa-layer-group"></i> 1/${album.media.length}</div>` : "";

    return `
        <div class="gallery-card" onclick='openLightbox(${JSON.stringify(album)})'>
            ${multiCount}
            <div class="media-wrapper">
                ${isVid ? 
                    `<video src="${firstMedia.url}" muted></video><div class="play-btn"><i class="fas fa-play-circle"></i></div>` : 
                    `<img src="${firstMedia.url}" loading="lazy">`
                }
            </div>
            <div class="card-info">
                <h3>${album.title || 'Himalayan Moment'}</h3>
                <p>${album.description ? album.description.substring(0, 60) + '...' : 'Explore the peaks.'}</p>
            </div>
        </div>
    `;
}

// 3. LIGHTBOX / CAROUSEL LOGIC
window.openLightbox = function(album) {
    currentAlbum = album.media;
    currentMediaIndex = 0;
    
    document.getElementById('modalTitle').innerText = album.title || "Adventure";
    document.getElementById('modalDesc').innerText = album.description || "";
    
    updateCarouselMedia();
    document.getElementById('galleryModal').style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Stop scrolling
};

function updateCarouselMedia() {
    const container = document.getElementById('mediaContainer');
    const media = currentAlbum[currentMediaIndex];
    
    if (media.type === 'video') {
        container.innerHTML = `<video id="modalVideo" src="${media.url}" controls autoplay style="width:100%; max-height:70vh; border-radius:10px;"></video>`;
    } else {
        container.innerHTML = `<img src="${media.url}" style="width:100%; max-height:70vh; border-radius:10px; object-fit:contain;">`;
    }

    // Hide arrows if only one photo
    const btns = document.querySelectorAll('.nav-btn');
    btns.forEach(b => b.style.display = currentAlbum.length > 1 ? 'block' : 'none');
}

window.nextMedia = function() {
    currentMediaIndex = (currentMediaIndex + 1) % currentAlbum.length;
    updateCarouselMedia();
};

window.prevMedia = function() {
    currentMediaIndex = (currentMediaIndex - 1 + currentAlbum.length) % currentAlbum.length;
    updateCarouselMedia();
};

window.closeModal = function() {
    document.getElementById('galleryModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    // Stop video if playing
    const vid = document.getElementById('modalVideo');
    if(vid) vid.pause();
};

// Close on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === "Escape") closeModal();
    if (document.getElementById('galleryModal').style.display === 'flex') {
        if (e.key === "ArrowRight") nextMedia();
        if (e.key === "ArrowLeft") prevMedia();
    }
});