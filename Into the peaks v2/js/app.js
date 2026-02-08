/**
 * INTO THE PEAKS - SUPREME MASTER CONTROLLER (v13.0)
 * Status: MISSION ACCOMPLISHED | Hub: Srinagar Garhwal
 * Fixes: Reserve My Slot Button, Blog Title Size, & WhatsApp Engine
 */

/* ==========================================
   1. GLOBAL CONFIG & DATABASE
=========================================== */
const AppConfig = {
    brandName: "IntoThePeaks",
    supportNumber: "918057608837",
    adminID: "Gammi",
    adminKey: "BOSS"
};

let activeTrekName = "";
let activeTrekPrice = 0;

var cloudDB = firebase.database();

document.addEventListener('DOMContentLoaded', () => {
    // 1. Purane Button ka Fix
window.handleItineraryBooking = function() {
    console.log("ITP: Redirecting Legacy Trigger...");
    // Itinerary page se price aur title uthana
    const pText = document.getElementById('trekPrice')?.innerText || "0";
    activeTrekPrice = Number(pText.replace(/[^0-9]/g, ""));
    activeTrekName = document.getElementById('trekTitle')?.innerText || "";
    
    // Modal kholna
    const modal = document.getElementById('bookingModal');
    if (modal) {
        if(document.getElementById('trekTitleModal')) document.getElementById('trekTitleModal').innerText = activeTrekName;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
};
    const path = window.location.pathname.toLowerCase();
    
    // UI Systems
    initNavbarDynamics();
    initMobileSystem();
    initAdminAccess();
    
    // Cloud Data Sync
    initCloudSync(path);

    // Global Form Listener (For Booking Modal)
    const bookingForm = document.getElementById('trekBookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleFormSubmission);
    }

    // --- BLOG TITLE SIZE FIX (CSS INJECTION) ---
    const style = document.createElement('style');
    style.innerHTML = `
        #blogTitle, #title { 
            font-size: clamp(2.2rem, 6vw, 4.5rem) !important; 
            line-height: 1.1 !important; 
            font-weight: 900 !important; 
            margin-bottom: 20px !important;
            font-family: 'Playfair Display', serif !important;
        }
        .reserve-btn { 
            cursor: pointer !important; 
            transition: 0.3s;
        }
        .reserve-btn:hover { transform: translateY(-3px); opacity: 0.9; }
    `;
    document.head.appendChild(style);

    document.body.classList.add('app-loaded');
    console.log("ITP v13.0: Master System Operational.");
});

/* ==========================================
   2. MASTER DATA SYNC (The Brain)
=========================================== */
function initCloudSync(path) {
    cloudDB.ref('itp_data').on('value', (snapshot) => {
        const cloudData = snapshot.val();
        if (!cloudData) return;

        // Routing
        if (path === "/" || path.includes("index") || path === "") {
            if (cloudData.tours) renderTreks(Object.values(cloudData.tours), 'journeyDisplay', 3);
            if (cloudData.blogs) renderBlogs(Object.values(cloudData.blogs), 'blogDisplay', 3);
        } else if (path.includes("packages")) {
            if (cloudData.tours) renderTreks(Object.values(cloudData.tours), 'journeyDisplay', 100);
        } else if (path.includes("itinerary")) {
            if (cloudData.tours) renderItineraryDetails(Object.values(cloudData.tours));
        } else if (path.includes("blogs")) {
            if (cloudData.blogs) renderBlogs(Object.values(cloudData.blogs), 'blogDisplay', 100);
        } else if (path.includes("blog-detail")) {
            if (cloudData.blogs) renderFullBlogArticle(Object.values(cloudData.blogs));
        }
    });
}
// 2. Reserve Button se Data Pakadna
window.openBookingDirect = function(name, price) {
    activeTrekName = name;
    activeTrekPrice = Number(String(price).replace(/[^0-9]/g, ""));
    
    const modal = document.getElementById('bookingModal');
    if (modal) {
        // Modal ke andar trek ka naam set karna
        const modalTitle = document.getElementById('trekTitleModal') || document.getElementById('trekTitle');
        if(modalTitle) modalTitle.innerText = activeTrekName;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
};

/* ==========================================
   3. UI RENDERERS (Design Restoration)
=========================================== */
function renderTreks(tours, targetId, limit) {
    const container = document.getElementById(targetId);
    if (!container) return;
    container.innerHTML = tours.slice(0, limit).map(trek => `
        <div class="package-card" style="background:#fff; border-radius:15px; overflow:hidden; box-shadow:0 8px 25px rgba(0,0,0,0.08); margin-bottom:20px;">
            <div class="package-img" style="position:relative; height:240px;">
                <img src="${trek.img || 'assets/placeholder.jpg'}" alt="${trek.title}" style="width:100%; height:100%; object-fit:cover;">
                <div style="position:absolute; top:15px; right:15px; background:#1E1E2D; color:#FFB800; padding:6px 18px; border-radius:50px; font-weight:800; font-size:0.95rem;">₹${Number(trek.price).toLocaleString('en-IN')}</div>
            </div>
            <div class="package-content" style="padding:22px;">
                <h3 style="margin:0 0 10px 0; color:#1E1E2D; font-size:1.4rem;">${trek.title}</h3>
                <p style="color:#666; font-size:0.9rem; line-height:1.6;">${trek.desc ? trek.desc.substring(0, 95) : ''}...</p>
                <div style="margin-top:25px; display:flex; gap:10px;">
                    <a href="itinerary.html?id=${createSlug(trek.title)}" style="flex:1; background:#1E1E2D; color:white; text-align:center; padding:12px; border-radius:10px; text-decoration:none; font-weight:700; font-size:0.9rem;">View Details</a>
                    <div onclick="openBookingDirect('${trek.title}', '${trek.price}')" class="reserve-btn" style="background:#FFB800; color:#1E1E2D; padding:12px; border-radius:10px; font-weight:800; font-size:0.85rem; text-align:center; cursor:pointer;">Reserve</div>
                </div>
            </div>
        </div>`).join('');
}

function renderBlogs(blogs, targetId, limit) {
    const container = document.getElementById(targetId);
    if (!container) return;
    container.innerHTML = blogs.slice(0, limit).map(blog => `
        <div class="blog-card" style="margin-bottom:25px; border-radius:15px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.05); background:white;">
            <img src="${blog.img}" alt="${blog.title}" style="width:100%; height:200px; object-fit:cover;">
            <div style="padding:20px;">
                <h4 style="font-family:'Playfair Display',serif; font-size:1.3rem; margin-bottom:15px; color:#1E1E2D;">${blog.title}</h4>
                <a href="blog-detail.html?id=${createSlug(blog.title)}" style="color:#FFB800; font-weight:800; text-decoration:none;">Read Full Story →</a>
            </div>
        </div>`).join('');
}

/* ==========================================
   4. BLOG FULL STORY (Fetch & Match)
=========================================== */
function renderFullBlogArticle(blogs) {
    const params = new URLSearchParams(window.location.search);
    let blogId = params.get('id');
    if (!blogId) return;

    const blog = blogs.find(b => {
        const dbSlug = createSlug(b.title);
        const urlSlug = blogId.replace('title-', '').toLowerCase().trim();
        return urlSlug.includes(dbSlug) || dbSlug.includes(urlSlug);
    });

    if (blog) {
        const titleEl = document.getElementById('blogTitle') || document.getElementById('title');
        const contentEl = document.getElementById('blogContent') || document.getElementById('content');
        const heroEl = document.getElementById('blogHero') || document.getElementById('heroImg');

        if(titleEl) titleEl.innerText = blog.title;
        if(heroEl) heroEl.src = blog.img || blog.image;
        if(contentEl) {
            contentEl.innerText = blog.content || blog.desc;
            contentEl.style.whiteSpace = "pre-wrap"; 
        }
    }
}

/* ==========================================
   5. BOOKING ENGINE (WhatsApp & Modal)
=========================================== */
window.openBookingDirect = function(name, price) {
    activeTrekName = name;
    activeTrekPrice = Number(String(price).replace(/[^0-9]/g, ""));
    openBooking();
};

function renderItineraryDetails(tours) {
    const params = new URLSearchParams(window.location.search);
    const trekSlug = params.get('id');
    const trek = tours.find(t => createSlug(t.title) === trekSlug);
    if (!trek) return;

    activeTrekName = trek.title;
    activeTrekPrice = Number(String(trek.price).replace(/[^0-9]/g, ""));

    const setUI = (id, val) => { if(document.getElementById(id)) document.getElementById(id).innerText = val; };
    setUI('trekTitle', trek.title);
    setUI('trekPrice', `₹${activeTrekPrice.toLocaleString('en-IN')}`);
    setUI('trekDesc', trek.desc);
    if(document.getElementById('trekHero')) document.getElementById('trekHero').src = trek.img;

    const timeline = document.getElementById('timelineDisplay');
    if (timeline && trek.itinerary) {
        timeline.innerHTML = trek.itinerary.split('|').map((content, i) => `
            <div class="timeline-item" style="margin-bottom:20px; padding-left:20px; border-left:4px solid #FFB800;">
                <span style="background:#1E1E2D; color:#FFB800; padding:2px 12px; border-radius:4px; font-weight:800; font-size:0.75rem;">DAY ${i + 1}</span>
                <p style="margin-top:10px; color:#444; line-height:1.6;">${content.trim()}</p>
            </div>`).join('');
    }
}

// 3. Submit par Total Price Calculate karna
function handleFormSubmission(e) {
    e.preventDefault();
    
    const name = document.getElementById('userName').value;
    const phone = document.getElementById('userPhone').value;
    const group = Number(document.getElementById('groupSize').value) || 1;
    const date = document.getElementById('trekDate').value;

    // Yahan ho rahi hai asli calculation
    const totalAmount = group * activeTrekPrice;

    if (totalAmount <= 0) {
        alert("Bhai, Price nahi mil raha! Ek baar page refresh karke try karo.");
        return;
    }

    const bookingData = {
        name: name,
        trek: activeTrekName,
        totalPrice: totalAmount, // Admin ke liye
        groupSize: group,
        phone: phone,
        date: date,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    };

    // Firebase Upload
    cloudDB.ref('itp_data/bookings').push(bookingData).then(() => {
        const waMessage = `🏔️ *NEW RESERVATION*\n📍 Trek: ${activeTrekName}\n👥 Group: ${group}\n💰 Total: ₹${totalAmount.toLocaleString('en-IN')}`;
        window.open(`https://wa.me/918057608837?text=${encodeURIComponent(waMessage)}`, '_blank');
        closeBooking();
    });
}
/* ==========================================
   6. UI UTILS & NAVIGATION
=========================================== */
window.openBooking = function() {
    const modal = document.getElementById('bookingModal');
    if (modal) {
        const modalTitle = document.getElementById('trekTitle'); // Modal ke andar ka title
        if(modalTitle && activeTrekName) modalTitle.innerText = activeTrekName;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
};

window.closeBooking = function() {
    const modal = document.getElementById('bookingModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
};

function createSlug(text) {
    if(!text) return "";
    return text.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-');
}

function initNavbarDynamics() {
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            window.scrollY > 60 ? navbar.classList.add('scrolled') : navbar.classList.remove('scrolled');
        });
    }
}

function initMobileSystem() {
    const hamburger = document.querySelector('.hamburger') || document.getElementById('navTrigger');
    const navLinks = document.getElementById('navLinks') || document.getElementById('mainMenu');
    window.toggleMenu = window.togglePeaksMenu = function() {
        if (hamburger && navLinks) {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : 'auto';
        }
    };
}

function initAdminAccess() {
    const trigger = document.getElementById('adminTrigger');
    if (trigger) {
        trigger.addEventListener('dblclick', () => {
            const id = prompt("Admin ID:");
            if (id === AppConfig.adminID) {
                const key = prompt("Key:");
                if (key === AppConfig.adminKey) window.location.href = 'admin.html';
            }
        });
    }
}
/* ==========================================
   FINAL COMPATIBILITY PATCH (v13.1)
   Fix: handleItineraryBooking is not defined
=========================================== */

// Agar button purana function dhoond raha hai, toh ye usey naye modal par bhej dega
window.handleItineraryBooking = function() {
    console.log("ITP: Redirecting legacy booking trigger to Master Engine...");
    if (typeof openBooking === 'function') {
        openBooking();
    } else {
        // Fallback agar openBooking bhi na mile
        const modal = document.getElementById('bookingModal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }
};

// Extra Safety: Itinerary page par title check
if (window.location.pathname.includes('itinerary')) {
    setTimeout(() => {
        const title = document.getElementById('trekTitle')?.innerText;
        if(title) activeTrekName = title;
    }, 1000);
}
/* ==========================================
   GALLERY HUB PATCH (v26.5) - NO CONFLICT
   Logic: Multimedia Rendering & Lightbox
=========================================== */

// 1. Gallery Route Add karna initCloudSync mein interference ke bina
cloudDB.ref('itp_data/gallery').on('value', (snapshot) => {
    const path = window.location.pathname.toLowerCase();
    if (path.includes("gallery")) {
        const data = snapshot.val();
        if (data) renderMultimediaGallery(Object.values(data));
    }
});

// 2. Multimedia Gallery Renderer
function renderMultimediaGallery(galleryData) {
    const container = document.getElementById('galleryDisplay');
    if (!container) return;

    // Latest items first
    const items = galleryData.reverse();
    
    container.innerHTML = items.map(album => {
        const media = album.media || [];
        if(media.length === 0) return "";
        
        const first = media[0];
        const isVid = first.type === 'video' || first.url.match(/\.(mp4|mov|webm)$/i);
        const multiTag = media.length > 1 ? `<div style="position:absolute; top:10px; right:10px; background:rgba(0,0,0,0.6); color:white; padding:4px 10px; border-radius:50px; font-size:0.7rem; z-index:5;"><i class="fas fa-layer-group"></i> 1/${media.length}</div>` : "";

        return `
        <div class="gallery-card" onclick='openLightbox(${JSON.stringify(album)})' style="cursor:pointer; background:white; border-radius:15px; overflow:hidden; box-shadow:0 10px 25px rgba(0,0,0,0.05); transition:0.3s;">
            <div style="position:relative; height:280px; background:#000;">
                ${multiTag}
                ${isVid ? 
                    `<video src="${first.url}" muted style="width:100%; height:100%; object-fit:cover;"></video><div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); color:white; font-size:2rem; opacity:0.8;"><i class="fas fa-play-circle"></i></div>` : 
                    `<img src="${first.url}" loading="lazy" style="width:100%; height:100%; object-fit:cover;">`
                }
            </div>
            <div style="padding:15px;">
                <h3 style="font-family:'Playfair Display',serif; font-size:1.1rem; margin:0; color:#1E1E2D;">${album.title || 'Himalayan Moment'}</h3>
            </div>
        </div>`;
    }).join('');
}

// 3. Carousel Styles Inject karna (Zaruri hai)
const galleryStyle = document.createElement('style');
galleryStyle.innerHTML = `
    .gallery-card:hover { transform: translateY(-5px); }
    .gallery-card video { width: 100%; height: 100%; object-fit: cover; }
`;
document.head.appendChild(galleryStyle);

console.log("ITP Patch v26.5: Gallery Engine Injected Successfully.");