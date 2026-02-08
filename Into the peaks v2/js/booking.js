/**
 * INTO THE PEAKS - MASTER BOOKING & INQUIRY ENGINE
 * Logic: Live Price Calculation, WhatsApp API Integration, Form Validation
 * Author: Gammi (Admin)
 */

/* ==========================================
   1. BOOKING STATE MANAGEMENT
=========================================== */
let currentBooking = {
    trekTitle: "",
    basePrice: 0,
    pax: 1,
    travelDate: "",
    totalAmount: 0
};

/**
 * 
 */

/* ==========================================
   2. INITIALIZATION & LISTENERS
=========================================== */
document.addEventListener('DOMContentLoaded', () => {
    // Check if we are on a page with a booking form
    initBookingListeners();
    console.log("IntoThePeaks: Booking Engine Initialized.");
});

function initBookingListeners() {
    // Dynamic Price Update Listener
    const paxInput = document.getElementById('b_pax');
    if (paxInput) {
        paxInput.addEventListener('input', (e) => {
            currentBooking.pax = e.target.value || 1;
            calculateLivePrice();
        });
    }

    // Main Booking Form Submission
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBookingSubmit);
    }

    // Contact Page Form Submission
    const contactForm = document.getElementById('contactInquiryForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
}

/* ==========================================
   3. PRICE CALCULATION LOGIC
=========================================== */
function calculateLivePrice() {
    const totalDisplay = document.getElementById('liveTotalPrice');
    if (!totalDisplay) return;

    // Logic: Base Price * Number of People
    currentBooking.totalAmount = currentBooking.basePrice * currentBooking.pax;
    
    // Smooth transition effect for price update
    totalDisplay.classList.add('updating');
    totalDisplay.innerText = `₹${currentBooking.totalAmount.toLocaleString('en-IN')}`;
    
    setTimeout(() => {
        totalDisplay.classList.remove('updating');
    }, 300);
}

/**
 * Function called from render.js or itinerary.html 
 * to set context for the booking modal
 */
window.prepBookingModal = function(title, price) {
    currentBooking.trekTitle = title;
    currentBooking.basePrice = parseInt(price);
    currentBooking.pax = 1;

    // Fill UI elements
    const modalTitle = document.getElementById('bookTrekName');
    const modalPrice = document.getElementById('bookTrekPrice');
    
    if (modalTitle) modalTitle.innerText = title;
    if (modalPrice) modalPrice.innerText = `₹${currentBooking.basePrice} / person`;
    
    calculateLivePrice();
};

/* ==========================================
   4. WHATSAPP API INTEGRATION (The Generator)
=========================================== */
function generateWAMessage(type, data) {
    const separator = "--------------------------";
    const header = type === 'booking' ? "*NEW BOOKING: INTOTHEPEAKS*" : "*NEW CONTACT INQUIRY*";
    
    let message = `${header}%0A${separator}%0A`;

    if (type === 'booking') {
        message += `*Trek:* ${data.trek}%0A`;
        message += `*Travelers:* ${data.pax} Person(s)%0A`;
        message += `*Travel Date:* ${data.date}%0A`;
        message += `*Est. Total:* ₹${data.total}%0A`;
    } else {
        message += `*Subject:* ${data.subject}%0A`;
        message += `*Message:* ${data.message}%0A`;
    }

    message += `${separator}%0A`;
    message += `*Customer Name:* ${data.name}%0A`;
    if (data.email) message += `*Email:* ${data.email}%0A`;
    message += `*Phone:* ${data.phone}%0A`;
    message += `${separator}%0A`;
    message += `_Sent via IntoThePeaks Web Portal_`;

    return message;
}

/* ==========================================
   5. FORM HANDLERS
=========================================== */
function handleBookingSubmit(e) {
    e.preventDefault();
    
    const formData = {
        trek: currentBooking.trekTitle,
        pax: currentBooking.pax,
        date: document.getElementById('b_date').value,
        total: currentBooking.totalAmount,
        name: document.getElementById('b_name').value,
        phone: document.getElementById('b_phone') ? document.getElementById('b_phone').value : "Not Provided"
    };

    // Validation
    if (!formData.date) {
        alert("Please select a travel date.");
        return;
    }

    const waLink = generateWAMessage('booking', formData);
    triggerWhatsApp(waLink);
}

function handleContactSubmit(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('c_name').value,
        email: document.getElementById('c_email').value,
        phone: document.getElementById('c_phone').value,
        subject: document.getElementById('c_subject').value,
        message: document.getElementById('c_message').value
    };

    const waLink = generateWAMessage('contact', formData);
    triggerWhatsApp(waLink);
}

function triggerWhatsApp(encodedMsg) {
    const myNumber = "918057608837"; // IntoThePeaks Official
    const fullURL = `https://wa.me/${myNumber}?text=${encodedMsg}`;
    
    // Tracking/Analytics placeholder
    console.log("Redirecting to WhatsApp API...");
    
    // Open in new tab
    window.open(fullURL, '_blank');
    
    // Feedback to user
    alert("Redirecting to WhatsApp for confirmation. Please click 'Send'.");
    
    // If modal is open, close it
    if (typeof closeAll === 'function') closeAll();
}

/* ==========================================
   6. HELPER: DATE RESTRICTIONS
=========================================== */
// Prevent users from selecting past dates
const datePicker = document.getElementById('b_date');
if (datePicker) {
    const today = new Date().toISOString().split('T')[0];
    datePicker.setAttribute('min', today);
}