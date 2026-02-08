/**
 * INTO THE PEAKS - SUPREME UI RENDER ENGINE
 * Version: 11.0 (Xerox Precision)
 * Focus: UI Architecture & Design Preservation
 * Hub: Srinagar Garhwal
 */

/* ==========================================================================
   1. TREK CARDS DESIGN (v22.0 Stable Structure)
   ========================================================================== */
function renderTreks(tours, targetId, limit) {
    const container = document.getElementById(targetId);
    if (!container) return;

    container.innerHTML = tours.slice(0, limit).map(trek => {
        const slug = createSlug(trek.title);
        // Original HTML Structure with Inline Safety Guards
        return `
        <div class="package-card" style="background:#fff; border-radius:15px; overflow:hidden; box-shadow:0 8px 25px rgba(0,0,0,0.08); margin-bottom:20px;">
            <div class="package-img" style="position:relative; height:240px;">
                <img src="${trek.img || 'assets/placeholder.jpg'}" alt="${trek.title}" style="width:100%; height:100%; object-fit:cover;">
                <div style="position:absolute; top:15px; right:15px; background:#1E1E2D; color:#FFB800; padding:6px 18px; border-radius:50px; font-weight:800; font-size:0.95rem;">
                    ₹${Number(trek.price).toLocaleString('en-IN')}
                </div>
            </div>
            <div class="package-content" style="padding:22px;">
                <h3 style="margin:0 0 10px 0; color:#1E1E2D; font-size:1.4rem;">${trek.title}</h3>
                <p style="color:#666; font-size:0.9rem; line-height:1.6;">${trek.desc ? trek.desc.substring(0, 95) : ''}...</p>
                
                <div style="margin-top:25px; display:flex; gap:12px;">
                    <a href="itinerary.html?id=${slug}" style="flex:1; background:#1E1E2D; color:white; text-align:center; padding:12px; border-radius:10px; text-decoration:none; font-weight:700; font-size:0.9rem;">
                        View Details
                    </a>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

/* ==========================================================================
   2. BLOG CARDS DESIGN (Editorial Grid System)
   ========================================================================== */
function renderBlogs(blogs, targetId, limit) {
    const container = document.getElementById(targetId);
    if (!container) return;

    container.innerHTML = blogs.slice(0, limit).map(blog => {
        const slug = createSlug(blog.title);
        return `
        <div class="blog-card" style="margin-bottom:25px; border-radius:15px; overflow:hidden; background:white; box-shadow:0 10px 30px rgba(0,0,0,0.05);">
            <div style="height:200px; overflow:hidden;">
                <img src="${blog.img}" alt="${blog.title}" style="width:100%; height:100%; object-fit:cover; transition: 0.5s;">
            </div>
            <div style="padding:20px;">
                <h4 style="font-family: 'Playfair Display', serif; font-size:1.3rem; color:#1E1E2D; margin-bottom:15px;">${blog.title}</h4>
                <a href="blog-detail.html?id=${slug}" style="color:#FFB800; font-weight:800; text-decoration:none; font-size:0.9rem;">
                    Read Story <i class="fas fa-arrow-right" style="margin-left:5px;"></i>
                </a>
            </div>
        </div>
        `;
    }).join('');
}

/* ==========================================================================
   3. ITINERARY TIMELINE DESIGN (Magazine Style)
   ========================================================================== */
function renderTimeline(itineraryText) {
    if (!itineraryText) return "";
    
    return itineraryText.split('|').map((content, i) => `
        <div class="timeline-item" style="margin-bottom:30px; padding-left:25px; border-left:4px solid #FFB800; position:relative;">
            <div style="position:absolute; left:-12px; top:0; width:20px; height:20px; background:#1E1E2D; border:4px solid #FFB800; border-radius:50%;"></div>
            <span style="background:#1E1E2D; color:#FFB800; padding:4px 15px; border-radius:4px; font-weight:800; font-size:0.7rem; text-transform:uppercase; letter-spacing:1px;">
                DAY ${i + 1}
            </span>
            <p style="margin-top:15px; color:#444; line-height:1.8; font-size:1rem;">
                ${content.trim()}
            </p>
        </div>
    `).join('');
}

/* ==========================================================================
   4. CORE UTILITIES (The Foundation)
   ========================================================================== */
/**
 * Create SEO Friendly Slugs
 */
function createSlug(text) {
    if(!text) return "";
    return text.toString().toLowerCase().trim()
        .replace(/\s+/g, '-')           // Spaces to -
        .replace(/[^\w\-]+/g, '')       // Remove special chars
        .replace(/\-\-+/g, '-');        // Double -- to single -
}

/**
 * Format Currency for Indian Market
 */
function formatINR(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
}

// System Logger
console.log("ITP: UI Render Engine v11.0 Loaded. Design Protected.");
