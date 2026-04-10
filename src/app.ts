type QueryType = "empty" | "invalid" | "ip" | "domain";

interface QueryResult {
  type: QueryType;
  value: string;
}

const apiKey = "at_BpjP6hDSMim3vUBtr4B6b6X1XgO2y";

const map = L.map("map", {
  zoomControl: false
}).setView([0, 0], 2);

L.control.zoom({ position: "bottomright" }).addTo(map);

L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
  subdomains: "abcd",
  maxZoom: 19,
  attribution: "&copy; OpenStreetMap contributors &copy; CARTO"
}).addTo(map);

const markerIcon = L.icon({
  iconUrl: "./images/icon-location.svg",
  iconSize: [46, 56],
  iconAnchor: [23, 56]
});

function getElementByIdOrThrow<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!(element instanceof HTMLElement)) {
    throw new Error(`Expected HTML element with id '${id}'`);
  }
  return element as T;
}

const form = getElementByIdOrThrow<HTMLFormElement>("ip-form");
const input = getElementByIdOrThrow<HTMLInputElement>("ip-input");
const errorText = getElementByIdOrThrow<HTMLParagraphElement>("form-error");
const ipDisplay = getElementByIdOrThrow<HTMLParagraphElement>("ip-display");
const locationDisplay = getElementByIdOrThrow<HTMLParagraphElement>("location-display");
const timezoneDisplay = getElementByIdOrThrow<HTMLParagraphElement>("timezone-display");
const ispDisplay = getElementByIdOrThrow<HTMLParagraphElement>("isp-display");
const submitButton = getElementByIdOrThrow<HTMLButtonElement>("search-btn");

const ipv4Pattern =
  /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;
const domainPattern = /^(?!:\/\/)([a-zA-Z0-9-]{1,63}\.)+[A-Za-z]{2,63}$/;

let marker: L.Marker | undefined;

function setError(message = ""): void {
  const hasError = Boolean(message);
  errorText.textContent = message;
  errorText.dataset.visible = String(hasError);
  input.classList.toggle("is-invalid", hasError);
  input.setAttribute("aria-invalid", String(hasError));
}

function setLoadingState(isLoading: boolean): void {
  input.disabled = isLoading;
  submitButton.disabled = isLoading;
  form.setAttribute("aria-busy", String(isLoading));
}

function normalizeQuery(rawValue: string): QueryResult {
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

function getLocationString(location: GeoLocation): string {
  const parts = [location.city, location.region, location.country].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "--";
}

function updateUI(data: GeoResponse): void {
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

async function fetchGeoData(query?: QueryResult): Promise<GeoResponse> {
  const params = new URLSearchParams({ apiKey });

  if (query?.type === "ip") {
    params.set("ipAddress", query.value);
  } else if (query?.type === "domain") {
    params.set("domain", query.value);
  }

  const response = await fetch(`https://geo.ipify.org/api/v2/country,city?${params.toString()}`);
  const data: GeoResponse = await response.json();

  if (!response.ok || data.code) {
    throw new Error(data.messages || "Unable to find this address.");
  }

  return data;
}

async function handleLookup(rawValue = ""): Promise<void> {
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
  } catch (error) {
    setError("Address not found. Try a different IP address or domain.");
    console.error("Geo lookup failed:", error);
  } finally {
    setLoadingState(false);
    map.invalidateSize();
  }
}

form.addEventListener("submit", (event: SubmitEvent) => {
  event.preventDefault();
  void handleLookup(input.value);
});

window.addEventListener("resize", () => map.invalidateSize());

void fetchGeoData()
  .then((data) => updateUI(data))
  .catch((error: unknown) => {
    console.error("Initial lookup failed:", error);
    setError("Could not load your current IP information.");
  });
