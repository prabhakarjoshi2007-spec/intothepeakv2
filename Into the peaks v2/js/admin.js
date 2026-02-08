/* ==========================================================================
   INTO THE PEAKS - SUPREME ADMIN ENGINE (v30.0 FINAL)
   Full Integration: Inventory + Bookings + Hybrid Gallery
   ========================================================================== */

// admin.js ke top par ye replace karo
if (typeof db === 'undefined') {
    window.db = firebase.database();
}
if (typeof dbRef === 'undefined') {
    window.dbRef = db.ref('itp_data');
}
if (typeof storage === 'undefined') {
    window.storage = firebase.storage();
}
let base64String = "";

// 1. TAB SWITCHING (Global Scope)
window.showTab = function(id, btn) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.admin-nav-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(id).classList.add('active');
    btn.classList.add('active');
    
    if(id === 'manageTab') window.loadInventory();
    if(id === 'bookingTab') window.loadBookings();
    if(id === 'galleryTab') window.loadAdminGallery(); // Naya function Gallery load karne ke liye
};

// 2. IMAGE PREVIEW (For Tours/Blogs)
window.preview = function(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            base64String = e.target.result;
            document.getElementById('previewImg').src = e.target.result;
            document.getElementById('previewBox').style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    }
};

// 3. SAVE CONTENT (Tours & Blogs)
window.saveToCloud = async function(e) {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button');
    submitBtn.innerText = "Syncing...";
    submitBtn.disabled = true;

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
        alert("Bhai, Save ho gaya!");
        location.reload(); 
    } catch (error) {
        alert("Error: " + error.message);
        submitBtn.disabled = false;
        submitBtn.innerText = "Save to Database";
    }
};

// 4. LIVE BOOKINGS & REVENUE
window.loadBookings = function() {
    const list = document.getElementById('bookingList');
    const revenueLabel = document.getElementById('totalRevenueDisplay');
    if (!list) return;

    dbRef.child('bookings').on('value', (snapshot) => {
        const data = snapshot.val();
        list.innerHTML = "";
        let totalRev = 0;

        if (data) {
            Object.keys(data).reverse().forEach(id => {
                const b = data[id];
                const amount = Number(b.price || b.totalPrice || 0);
                totalRev += amount;

                list.innerHTML += `
                    <div class="booking-item">
                        <div>
                            <span class="trek-tag">${b.trek || 'Trek'}</span>
                            <div class="cust-name">${b.name || 'Anonymous'}</div>
                            <div class="cust-meta">
                                <i class="fas fa-phone"></i> ${b.phone || 'N/A'} | 
                                <i class="fas fa-users"></i> Group: ${b.groupSize || 1}
                            </div>
                            <div style="font-size:0.8rem; color:#94a3b8;">ID: ${id}</div>
                        </div>
                        <div style="text-align: right;">
                            <div class="price-display">₹${amount.toLocaleString('en-IN')}</div>
                            <button onclick="window.deleteFromCloud('${id}', 'bookings')" class="del-booking-btn">Delete</button>
                        </div>
                    </div>
                `;
            });
        } else {
            list.innerHTML = "<p style='text-align:center; padding:20px;'>Bhai, abhi koi booking nahi aayi hai.</p>";
        }
        if(revenueLabel) revenueLabel.innerText = `₹${totalRev.toLocaleString('en-IN')}`;
    });
};

// 5. INVENTORY & DELETE ENGINE
window.loadInventory = function() {
    const list = document.getElementById('inventoryList');
    if (!list) return;

    dbRef.on('value', (snapshot) => {
        const dbVal = snapshot.val();
        list.innerHTML = "";
        if (dbVal) {
            if(dbVal.tours) Object.keys(dbVal.tours).forEach(id => list.innerHTML += createRow(id, dbVal.tours[id], 'tours'));
            if(dbVal.blogs) Object.keys(dbVal.blogs).forEach(id => list.innerHTML += createRow(id, dbVal.blogs[id], 'blogs'));
        }
    });
};

function createRow(id, item, type) {
    return `
        <div style="background:#f8fafc; padding:15px; border-radius:15px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center; border:1px solid #eee;">
            <div><strong>[${type.toUpperCase()}]</strong> ${item.title}</div>
            <button onclick="window.deleteFromCloud('${id}', '${type}')" style="background:#ff4d4d; color:white; border:none; padding:8px 12px; border-radius:8px; cursor:pointer;">Delete</button>
        </div>
    `;
}

window.deleteFromCloud = async function(id, path) {
    if(confirm("Delete kar doon bhai?")) {
        const folder = (path === 'tours' || path === 'blogs' || path === 'gallery') ? path : 'bookings';
        await dbRef.child(folder).child(id).remove();
        if(path === 'gallery') window.loadAdminGallery();
    }
};

/* ==========================================
   SUPREME HYBRID GALLERY ENGINE
   ========================================== */

function extractYTID(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

window.saveSupremeAlbum = async function() {
    const files = document.getElementById('albumFiles').files;
    const ytLink = document.getElementById('ytLink').value;
    const title = document.getElementById('albumTitle').value;
    const desc = document.getElementById('albumDesc').value;
    const status = document.getElementById('uploadStatus');
    const btn = document.getElementById('uploadBtn');

    if (!title || (files.length === 0 && !ytLink)) {
        alert("Bhai, Title aur kam se kam ek Photo ya YT Link toh dalo!");
        return;
    }

    btn.disabled = true;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Processing Archives...`;
    
    let mediaArray = [];

    try {
        // --- YouTube Handle ---
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

        // --- Firebase Storage Photos ---
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            status.innerText = `Syncing Photo ${i + 1}/${files.length}...`;
            const storageRef = storage.ref(`gallery/${Date.now()}_${file.name}`);
            const uploadTask = await storageRef.put(file);
            const downloadURL = await uploadTask.ref.getDownloadURL();
            mediaArray.push({ url: downloadURL, type: 'image' });
        }

        await dbRef.child('gallery').push({
            title: title,
            description: desc,
            media: mediaArray,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });

        alert("Gallery Updated! 🏔️");
        location.reload();

    } catch (err) {
        alert("Locha ho gaya: " + err.message);
        btn.disabled = false;
        btn.innerHTML = `Sync with Himalayan Clouds`;
    }
};

// Gallery Manage Loader
window.loadAdminGallery = function() {
    const list = document.getElementById('adminGalleryList');
    if(!list) return;
    dbRef.child('gallery').on('value', (snap) => {
        const data = snap.val();
        list.innerHTML = "";
        if(data) {
            Object.keys(data).reverse().forEach(id => {
                const album = data[id];
                const thumb = album.media[0].type === 'youtube' ? album.media[0].thumbnail : album.media[0].url;
                list.innerHTML += `
                    <div class="admin-gallery-card">
                        <img src="${thumb}" style="width:100%; border-radius:10px;">
                        <div style="font-weight:700; margin:10px 0; font-size:0.9rem;">${album.title}</div>
                        <button onclick="window.deleteFromCloud('${id}', 'gallery')" class="del-btn-small">Delete Album</button>
                    </div>`;
            });
        }
    });
};

// Initialize on Page Load
document.addEventListener('DOMContentLoaded', () => {
    console.log("ITP Admin Hub v30.0: Ready.");
    window.loadInventory(); 
    window.loadBookings();
});