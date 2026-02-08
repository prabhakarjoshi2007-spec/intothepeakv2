/* ==========================================================================
   INTO THE PEAKS - SUPREME ADMIN ENGINE (v31.0)
   Location: Srinagar Garhwal | Powered by Firebase
   Functions: Tours, Blogs, Bookings, Hybrid Gallery, Revenue, Inventory
   ========================================================================== */

// 1. GLOBAL INITIALIZATION (Anti-Conflict Mode)
var db = db || firebase.database();
var dbRef = dbRef || db.ref('itp_data');
var storage = storage || firebase.storage();
var base64String = base64String || "";

// 2. TAB NAVIGATION SYSTEM
window.showTab = function(id, btn) {
    // Sabhi contents aur buttons ko reset karo
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.admin-nav-btn').forEach(b => b.classList.remove('active'));
    
    // Target tab ko activate karo
    const target = document.getElementById(id);
    if(target) {
        target.classList.add('active');
        btn.classList.add('active');
    }
    
    // Data Load Triggers
    if(id === 'manageTab') window.loadInventory();
    if(id === 'bookingTab') window.loadBookings();
    if(id === 'galleryTab') window.loadAdminGallery();
};

// 3. MEDIA UTILITIES (YouTube & Image Preview)
function extractYTID(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

window.preview = function(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            base64String = e.target.result;
            const previewBox = document.getElementById('previewBox');
            const previewImg = document.getElementById('previewImg');
            if(previewImg) previewImg.src = e.target.result;
            if(previewBox) previewBox.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    }
};

// 4. CONTENT MANAGEMENT (Tours & Blogs)
window.saveToCloud = async function(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const originalText = btn.innerText;
    btn.innerText = "Syncing...";
    btn.disabled = true;

    const type = document.getElementById('type').value; 
    const itemData = {
        title: document.getElementById('title').value,
        price: document.getElementById('price').value || 0,
        img: base64String || document.getElementById('imgUrl').value || "assets/placeholder.jpg",
        desc: document.getElementById('desc').value,
        content: document.getElementById('content').value || "",
        itinerary: document.getElementById('itinerary').value || "",
        createdAt: firebase.database.ServerValue.TIMESTAMP
    };

    try {
        await dbRef.child(type === 'tour' ? 'tours' : 'blogs').push(itemData);
        alert("Bhai, Archive Update Ho Gaya! 🏔️");
        location.reload(); 
    } catch (error) {
        alert("Error: " + error.message);
        btn.disabled = false;
        btn.innerText = originalText;
    }
};

// 5. HYBRID GALLERY SYSTEM (Photos + YouTube)
window.saveSupremeAlbum = async function() {
    const files = document.getElementById('albumFiles').files;
    const ytLink = document.getElementById('ytLink').value;
    const title = document.getElementById('albumTitle').value;
    const desc = document.getElementById('albumDesc').value;
    const status = document.getElementById('uploadStatus');
    const btn = document.getElementById('uploadBtn');

    if (!title || (files.length === 0 && !ytLink)) {
        return alert("Bhai, Title aur kam se kam ek Photo ya YouTube link toh dalo!");
    }

    btn.disabled = true;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Syncing...`;
    let mediaArray = [];

    try {
        // Handle YouTube
        if(ytLink) {
            const ytID = extractYTID(ytLink);
            if(ytID) {
                mediaArray.push({
                    url: `https://www.youtube.com/embed/${ytID}`,
                    thumbnail: `https://img.youtube.com/vi/${ytID}/maxresdefault.jpg`,
                    type: 'youtube'
                });
            }
        }

        // Handle Photos via Firebase Storage
        for (let i = 0; i < files.length; i++) {
            status.innerText = `Uploading Photo ${i+1}/${files.length}...`;
            const file = files[i];
            const storageRef = storage.ref(`gallery/${Date.now()}_${file.name}`);
            const task = await storageRef.put(file);
            const url = await task.ref.getDownloadURL();
            mediaArray.push({ url: url, type: 'image' });
        }

        await dbRef.child('gallery').push({
            title, description: desc, media: mediaArray, timestamp: Date.now()
        });

        alert("Gallery Synchronized! 📷");
        location.reload();
    } catch (err) {
        alert("Locha: " + err.message);
        btn.disabled = false;
        btn.innerHTML = "Sync with Himalayan Clouds";
    }
};

// 6. DATA LOADERS (Inventory, Bookings, Gallery)
window.loadBookings = function() {
    const list = document.getElementById('bookingList');
    const revDisp = document.getElementById('totalRevenueDisplay');
    if (!list) return;

    dbRef.child('bookings').on('value', (snap) => {
        const data = snap.val();
        list.innerHTML = "";
        let total = 0;
        if (data) {
            Object.keys(data).reverse().forEach(id => {
                const b = data[id];
                const amt = Number(b.price || b.totalPrice || 0);
                total += amt;
                list.innerHTML += `
                    <div class="booking-item">
                        <div>
                            <span class="trek-tag">${b.trek || 'Trek'}</span>
                            <div class="cust-name">${b.name}</div>
                            <div class="cust-meta"><i class="fas fa-phone"></i> ${b.phone} | <i class="fas fa-users"></i> ${b.groupSize || 1}</div>
                        </div>
                        <div style="text-align: right;">
                            <div class="price-display">₹${amt.toLocaleString('en-IN')}</div>
                            <button onclick="window.deleteFromCloud('${id}', 'bookings')" class="del-booking-btn">Delete</button>
                        </div>
                    </div>`;
            });
        }
        if(revDisp) revDisp.innerText = `₹${total.toLocaleString('en-IN')}`;
    });
};

window.loadInventory = function() {
    const list = document.getElementById('inventoryList');
    if (!list) return;
    dbRef.on('value', (snap) => {
        const val = snap.val();
        list.innerHTML = "";
        if (val) {
            if(val.tours) Object.keys(val.tours).forEach(id => list.innerHTML += createRow(id, val.tours[id], 'tours'));
            if(val.blogs) Object.keys(val.blogs).forEach(id => list.innerHTML += createRow(id, val.blogs[id], 'blogs'));
        }
    });
};

window.loadAdminGallery = function() {
    const list = document.getElementById('adminGalleryList');
    if(!list) return;
    dbRef.child('gallery').on('value', (snap) => {
        const data = snap.val();
        list.innerHTML = "";
        if(data) {
            Object.keys(data).reverse().forEach(id => {
                const alb = data[id];
                const thumb = alb.media[0].type === 'youtube' ? alb.media[0].thumbnail : alb.media[0].url;
                list.innerHTML += `
                    <div class="admin-gallery-card">
                        <img src="${thumb}">
                        <div style="font-weight:700; margin:10px 0; font-size:0.9rem;">${alb.title}</div>
                        <button onclick="window.deleteFromCloud('${id}', 'gallery')" class="del-btn-small">Delete Album</button>
                    </div>`;
            });
        }
    });
};

function createRow(id, item, type) {
    return `<div class="booking-item" style="margin-bottom:10px;">
                <div><strong>[${type.toUpperCase()}]</strong> ${item.title}</div>
                <button onclick="window.deleteFromCloud('${id}', '${type}')" class="del-booking-btn">Delete</button>
            </div>`;
}

// 7. GLOBAL DELETE ENGINE
window.deleteFromCloud = async function(id, path) {
    if(confirm("Bhai, pakka uda doon? Ye wapas nahi aayega!")) {
        try {
            await dbRef.child(path).child(id).remove();
            console.log(`${id} removed from ${path}`);
        } catch (e) {
            alert("Delete failed: " + e.message);
        }
    }
};

// 8. INITIALIZE
document.addEventListener('DOMContentLoaded', () => {
    console.log("ITP Admin Hub v31.0: Operational.");
    window.loadInventory();
    window.loadBookings();
});
