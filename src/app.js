"use strict";
// Global Configurations (API Key and Custom Icon)
const apiKey = "at_BpjP6hDSMim3vUBtr4B6b6X1XgO2y";
const markerIcon = L.icon({
    iconUrl: "./images/icon-location.svg",
    iconSize: [46, 56],
    iconAnchor: [23, 56]
});
// Map Initialization (Declared ONLY ONCE)
const map = L.map("map", {
    zoomControl: false
}).setView([0, 0], 2);
L.control.zoom({ position: "bottomright" }).addTo(map);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors &copy; CARTO"
}).addTo(map);

// This function acts as a safety layer for selecting elements from your web page (the DOM) and defines the rules for valid search inputs.
// ## 1. The getElementByIdOrThrow function
// This is a "fail-fast" helper. Instead of just grabbing an element, it verifies that the element actually exists and is a valid HTML element.

// * Why use it? Normally, document.getElementById returns null if it can't find the ID. If you try to use that null element later, your app crashes with a vague error. This function stops the app immediately with a specific message (Expected HTML element with id...), making debugging much easier.

// ## 2. Element Selectors
// The code then uses that function to grab all the UI pieces needed for your IP tracker:

// * Inputs: The form, the text input, and the search button.
// * Displays: Spots to inject the IP, location, timezone, and ISP data once the search finishes.
// * Feedback: An error text element to show messages to the user.

// ## 3. Validation Patterns (Regex)
// Finally, it defines two Regular Expressions to check if the user's input looks right before sending a request:

// * ipv4Pattern: Checks for a standard IP address (four sets of numbers 0-255 separated by dots, like 192.168.1.1).
// * domainPattern: Checks for a valid website address (like google.com or my-site.net). It ensures there are no protocol prefixes (like https://) and that the ending (TLD) is at least two characters long.
function getElementByIdOrThrow(id) {
    const element = document.getElementById(id);
    if (!(element instanceof HTMLElement)) {
        throw new Error(`Expected HTML element with id '${id}'`);
    }
    return element;
}
const form = getElementByIdOrThrow("ip-form");
const input = getElementByIdOrThrow("ip-input");
const errorText = getElementByIdOrThrow("form-error");
const ipDisplay = getElementByIdOrThrow("ip-display");
const locationDisplay = getElementByIdOrThrow("location-display");
const timezoneDisplay = getElementByIdOrThrow("timezone-display");
const ispDisplay = getElementByIdOrThrow("isp-display");
const submitButton = getElementByIdOrThrow("search-btn");
const ipv4Pattern = /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;
const domainPattern = /^(?!:\/\/)([a-zA-Z0-9-]{1,63}\.)+[A-Za-z]{2,63}$/;
// Marker variable declared globally to allow moving/removing it
let marker;

function setError(message = "") {
    const hasError = Boolean(message);
    errorText.textContent = message;
    errorText.dataset.visible = String(hasError);
    input.classList.toggle("is-invalid", hasError);
    input.setAttribute("aria-invalid", String(hasError));
}
function setLoadingState(isLoading) {
    input.disabled = isLoading;
    submitButton.disabled = isLoading;
    form.setAttribute("aria-busy", String(isLoading));
}
// // Trimming: It removes any accidental spaces at the start or end of the user's input.
// The "Empty" Check: If there's nothing left after trimming, it tells the main function the input is empty. This triggers the "Enter an IP address..." error.
// The Regex Tests:
// It runs .test(trimmed) against the ipv4Pattern. If it matches, it labels the data as ipv4.
// If not, it checks the domainPattern. If that matches, it labels it as domain.
// The Fallback: If it doesn't match either pattern, it returns invalid. This triggers the "Use a valid IPv4 address..." error.
// This function acts as a translator. It takes messy user input and turns it into a structured object ({ type, value }) that the rest of the app can easily understand.
function normalizeQuery(rawValue) {
    const value = rawValue.trim();
    if (!value) {
        return { type: "empty", value };
    }
    if (ipv4Pattern.test(value)) {
        return { type: "ip", value };
    }
    if (domainPattern.test(value)) {
        return { type: "domain", value };
    }
    return { type: "invalid", value };
}
function getLocationString(location) {
    const parts = [location.city, location.region, location.country].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "--";
}
// Function to Update UI and Map View
function updateUI(data) {
    const { ip, location, isp } = data;
    const { lat, lng, timezone } = location;
    ipDisplay.textContent = ip || "--";
    locationDisplay.textContent = getLocationString(location);
    timezoneDisplay.textContent = timezone ? `UTC ${timezone}` : "--";
    ispDisplay.textContent = isp || "--";
    map.setView([lat, lng], 13);
    marker?.remove();
    marker = L.marker([lat, lng], { icon: markerIcon }).addTo(map);
}
// Function to Fetch Data from API (IPify)
async function fetchGeoData(query) {
    const params = new URLSearchParams({ apiKey });
    if (query?.type === "ip") {
        params.set("ipAddress", query.value);
    }
    else if (query?.type === "domain") {
        params.set("domain", query.value);
    }
    const response = await fetch(`https://geo.ipify.org/api/v2/country,city?${params.toString()}`);
    const data = await response.json();
    if (!response.ok || data.code) {
        throw new Error(data.messages || "Unable to find this address.");
    }
    return data;
}
// This function manages the logic for looking up geographic information based on an IP address or domain name. It handles the process from the moment a user submits a search until the results (or errors) are displayed.
// Here is the step-by-step breakdown:
// Validation: It first "normalizes" the input. If the search box is empty or the format is invalid (not a real IP or domain), it shows a specific error message and stops.
// Preparation: It clears any old errors and triggers a "loading" state and disabling buttons.
// Data Fetching: It calls fetchGeoData to get the actual location data. If successful, it passes that data to updateUI to refresh the screen.
// Error Handling: If the network request fails or the address doesn't exist, it displays a "not found" message and logs the technical details to the console.
// Cleanup: Regardless of whether it succeeded or failed, it turns off the loading state and tells the map component to resize itself (map.invalidateSize) to ensure it renders correctly.

async function handleLookup(rawValue = "") {
    const query = normalizeQuery(rawValue);
    if (query.type === "empty") {
        setError("Enter an IP address or a domain to search.");
        return;
    }
    if (query.type === "invalid") {
        setError("Use a valid IPv4 address or domain (example.com).");
        return;
    }
    setError();
    setLoadingState(true);
    try {
        const data = await fetchGeoData(query);
        updateUI(data);
    }
    catch (error) {
        setError("Address not found. Try a different IP address or domain.");
        console.error("Geo lookup failed:", error);
    }
    finally {
        setLoadingState(false);
        map.invalidateSize();
    }
}
form.addEventListener("submit", (event) => {
    event.preventDefault();
    void handleLookup(input.value);
});
window.addEventListener("resize", () => map.invalidateSize());
void fetchGeoData()
    .then((data) => updateUI(data))
    .catch((error) => {
        console.error("Initial lookup failed:", error);
        setError("Could not load your current IP information.");
    });
//# sourceMappingURL=app.js.map