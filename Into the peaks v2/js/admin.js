/* ==========================================================================
   INTO THE PEAKS - SUPREME ADMIN ENGINE (v32.0 ERROR-FREE)
   Srinagar Garhwal Edition | Full Hybrid Integration
   ========================================================================== */

// 1. GLOBAL SAFETY INITIALIZATION (Preventing "Already Declared" Errors)
if (typeof window.itpInitialized === 'undefined') {
    window.itpInitialized = true;
    window.db = firebase.database();
    window.dbRef = window.db.ref('itp_data');
    window.storage = firebase.storage();
}

// Global scope check for base64
if (typeof window.base64String === 'undefined') {
    window.base64String = "";
}

// 2. TAB NAVIGATION
window.showTab = function(id, btn) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.admin-nav-btn').forEach(b => b.classList.remove('active'));
    
    const target = document.getElementById(id);
    if(target) {
        target.classList.add('active');
        btn.classList.add('active');
    }
    
    // Auto Load Data
    if(id === 'manageTab') window.loadInventory();
    if(id === 'bookingTab') window.loadBookings();
    if(id === 'galleryTab') window.loadAdminGallery();
};

// 3. MEDIA UTILS
function extractYTID(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

window.preview = function(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            window.base64String = e.target.result;
            const pBox = document.getElementById('previewBox');
            if(pBox) {
                document.getElementById('previewImg').src = e.target.result;
                pBox.style.display = 'block';
            }
        };
        reader.readAsDataURL(input.files[0]);
    }
};

// 4. CONTENT SAVE (Tours & Blogs)
window.saveToCloud = async function(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.innerText = "Syncing...";
    btn.disabled = true;

    const type = document.getElementById('type').value; 
    const itemData = {
        title: document.getElementById('title').value,
        price: document.getElementById('price').value || 0,
        img: window.base64String || document.getElementById('imgUrl').value || "assets/placeholder.jpg",
        desc: document.getElementById('desc').value,
        content: document.getElementById('content').value || "",
        itinerary: document.getElementById('itinerary').value || "",
        createdAt: firebase.database.ServerValue.TIMESTAMP
    };

    try {
        await window.dbRef.child(type === 'tour' ? 'tours' : 'blogs').push(itemData);
        alert("Success: Content Published! 🏔️");
        location.reload(); 
    } catch (err) {
        alert("Error: " + err.message);
        btn.disabled = false;
        btn.innerText = "Save to Database";
    }
};

// 5. HYBRID GALLERY SYSTEM
window.saveSupremeAlbum = async function() {
    const files = document.getElementById('albumFiles').files;
    const ytLink = document.getElementById('ytLink').value;
    const title = document.getElementById('albumTitle').value;
    const desc = document.getElementById('albumDesc').value;
    const status = document.getElementById('uploadStatus');
    const btn = document.getElementById('uploadBtn');

    if (!title || (files.length === 0 && !ytLink)) {
        return alert("Bhai, kam se kam ek Photo ya YouTube link toh dalo!");
    }

    btn.disabled = true;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Syncing...`;
    let mediaArray = [];

    try {
        if(ytLink) {
            const ytID = extractYTID(ytLink);
            if(ytID) mediaArray.push({
                url: `https://www.youtube.com/embed/${ytID}`,
                thumbnail: `https://img.youtube.com/vi/${ytID}/maxresdefault.jpg`,
                type: 'youtube'
            });
        }

        for (let i = 0; i < files.length; i++) {
            status.innerText = `Uploading Photo ${i+1}/${files.length}...`;
            const storageRef = window.storage.ref(`gallery/${Date.now()}_${files[i].name}`);
            const task = await storageRef.put(files[i]);
            const url = await task.ref.getDownloadURL();
            mediaArray.push({ url: url, type: 'image' });
        }

        await window.dbRef.child('gallery').push({
            title, description: desc, media: mediaArray, timestamp: Date.now()
        });

        alert("Gallery Updated Successfully! 📷");
        location.reload();
    } catch (err) {
        alert("Locha: " + err.message);
        btn.disabled = false;
        btn.innerHTML = "Sync with Himalayan Clouds";
    }
};

// 6. LOADERS
window.loadBookings = function() {
    const list = document.getElementById('bookingList');
    const revDisp = document.getElementById('totalRevenueDisplay');
    if (!list) return;

    window.dbRef.child('bookings').on('value', (snap) => {
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
                            <div class="cust-meta"><i class="fas fa-phone"></i> ${b.phone}</div>
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

window.loadAdminGallery = function() {
    const list = document.getElementById('adminGalleryList');
    if(!list) return;
    window.dbRef.child('gallery').on('value', (snap) => {
        const data = snap.val();
        list.innerHTML = "";
        if(data) {
            Object.keys(data).reverse().forEach(id => {
                const alb = data[id];
                const thumb = alb.media[0].type === 'youtube' ? alb.media[0].thumbnail : alb.media[0].url;
                list.innerHTML += `
                    <div class="admin-gallery-card">
                        <img src="${thumb}">
                        <div style="font-weight:700; font-size:0.9rem;">${alb.title}</div>
                        <button onclick="window.deleteFromCloud('${id}', 'gallery')" class="del-btn-small">Delete</button>
                    </div>`;
            });
        }
    });
};

window.loadInventory = function() {
    const list = document.getElementById('inventoryList');
    if (!list) return;
    window.dbRef.on('value', (snap) => {
        const val = snap.val();
        list.innerHTML = "";
        if (val) {
            if(val.tours) Object.keys(val.tours).forEach(id => list.innerHTML += `<div class="booking-item"><div><strong>[TOUR]</strong> ${val.tours[id].title}</div><button onclick="window.deleteFromCloud('${id}', 'tours')" class="del-booking-btn">Delete</button></div>`);
            if(val.blogs) Object.keys(val.blogs).forEach(id => list.innerHTML += `<div class="booking-item"><div><strong>[BLOG]</strong> ${val.blogs[id].title}</div><button onclick="window.deleteFromCloud('${id}', 'blogs')" class="del-booking-btn">Delete</button></div>`);
        }
    });
};

// 7. DELETE SYSTEM
window.deleteFromCloud = async function(id, path) {
    if(confirm("Confirm Delete?")) {
        await window.dbRef.child(path).child(id).remove();
        if(path === 'gallery') window.loadAdminGallery();
    }
};

// 8. AUTO START
document.addEventListener('DOMContentLoaded', () => {
    console.log("ITP Admin Hub v32.0 Ready.");
    window.loadInventory();
    window.loadBookings();
});
