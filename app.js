// 1. Global Configurations (API Key and Custom Icon)
const apiKey = 'at_BpjP6hDSMim3vUBtr4B6b6X1XgO2y';
const myIcon = L.icon({
    iconUrl: './images/icon-location.svg', // Ensure this path matches your folder structure
    iconSize: [46, 56],
    iconAnchor: [23, 56]
});

// 2. Map Initialization (Declared ONLY ONCE)
const map = L.map('map').setView([0, 0], 2);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: 'Â© OpenStreetMap'
}).addTo(map);

// Fixes map rendering issues when resizing the window
window.addEventListener('resize', () => {
    map.invalidateSize();
});

// Marker variable declared globally to allow moving/removing it
let marker;

// 3. Function to Fetch Data from API (IPify)
async function getIpData(ipAddress = '') {
    // Visual feedback for loading state
    const ipDisplay = document.getElementById('ip-display');
    const originalText = ipDisplay.innerText;
    ipDisplay.innerText = "Loading...";

    try {
        const url = `https://geo.ipify.org/api/v2/country,city?apiKey=${apiKey}&ipAddress=${ipAddress}&domain=${ipAddress}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            // Triggered if the API returns an error (e.g., invalid IP)
            throw new Error("Invalid IP or Domain");
        }
        
        const data = await response.json();
        updateInterface(data);
    } catch (error) {
        console.error("Error:", error);
        
        // Friendly error handling for the user
        ipDisplay.innerText = originalText; // Reset to previous text
        alert("Ops! Could not find this IP or Domain. Please check and try again.");
    }
}

// 4. Function to Update UI and Map View
function updateInterface(data) {
    const { ip, location, isp } = data;
    const { lat, lng, city, region, timezone } = location;

    // Updating HTML text content
    document.getElementById('ip-display').innerText = ip;
    document.getElementById('location-display').innerText = `${city}, ${region}`;
    document.getElementById('timezone-display').innerText = `UTC ${timezone}`;
    document.getElementById('isp-display').innerText = isp;

    // Moving map camera to the new coordinates
    map.setView([lat, lng], 13);

    // Remove existing marker before adding a new one
    if (marker) {
        map.removeLayer(marker);
    }
    marker = L.marker([lat, lng], { icon: myIcon }).addTo(map);
}

// 5. Search Button Click Event
document.getElementById('search-btn').addEventListener('click', () => {
    const inputField = document.getElementById('ip-input');
    const value = inputField.value.trim(); // Removes whitespace

    if (value === "") {
        // Simple visual error feedback on the input field
        inputField.classList.add('border-2', 'border-red-500');
        setTimeout(() => inputField.classList.remove('border-red-500'), 2000);
        return; // Stops execution
    }

    getIpData(value);
});

// Event listener for "Enter" key within the input field
document.getElementById('ip-input').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        const value = event.target.value.trim();
        if (value !== "") {
            getIpData(value);
        }
    }
});

// 6. Initial fetch (Loads user's own IP data on page load)
getIpData();