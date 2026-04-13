# Frontend Mentor - IP address tracker solution

This is a solution to the [IP address tracker challenge on Frontend Mentor](https://www.frontendmentor.io/challenges/ip-address-tracker-I8-0yYAH0). Frontend Mentor challenges help you improve your coding skills by building realistic projects. 

## Table of contents

- [Overview](#overview)
  - [The challenge](#the-challenge)
  - [Screenshot](#screenshot)
  - [Links](#links)
  - [My process](#my-process)
  - [Built with](#built-with)
  - [What I learned](#what-i-learned)
  - [Continued development](#continued-development)
  - [Author](#author)

## Overview
Project Requirements:
- Responsive Design: Ensure the application is fully responsive across various devices and screen sizes.
- API Integration: Effectively integrate the specified API to fetch and display data dynamically.
- Interactivity: Implement interactive elements such as search functionality, form validation, and dynamic content updates.
- Accessibility: Follow best practices to make the application accessible to all users.
- Version Control: Use Git for version control, with regular commits and a well-documented GitHub repository.
- Documentation: Include a comprehensive README.md file detailing the project setup, features, and any additional notes.

### The challenge

Users should be able to:

- View the optimal layout for each page depending on their device's screen size
- See hover states for all interactive elements on the page
- See their own IP address on the map on the initial page load
- Search for any IP addresses or domains and see the key information and location

### Screenshot

Add a screenshot of your solution.
![](./images/Barber%20IP%20Address%20Tracker.png)

### Links

- Solution URL: [Add solution URL here](https://bbtechpro.github.io/Proj1-IP-Address-Tracker/)
- Live Site URL: [Add live site URL here](https://bbtechpro.github.io/Proj1-IP-Address-Tracker/)

## My process

- I decided to start by coding the logic using Javascript, and then refactoring it with Typescript.

- Global Configurations (API Key and Custom Icon)
const apiKey = "at_BpjP6hDSMim3vUBtr4B6b6X1XgO2y";

- Map Initialization

- This function acts as a safety layer for selecting elements from your web page (the DOM) and defines the rules for valid search inputs.
- ## 1. The getElementByIdOrThrow function
- This is a "fail-fast" helper. Instead of just grabbing an element, it verifies that the element actually exists and is a valid HTML element.
 * Why use it? Normally, document.getElementById returns null if it can't find the ID. If you try to use that null element later, your app crashes with a vague error. This function stops the app immediately with a specific message (Expected HTML element with id...), making debugging much easier.

- ## 2. Element Selectors
  The code then uses that function to grab all the UI pieces needed for your IP tracker:
  * Inputs: The form, the text input, and the search button.
  * Displays: Spots to inject the IP, location, timezone, and ISP data once the search finishes.
  * Feedback: An error text element to show messages to the user.

- ## 3. Validation Patterns (Regex)
  Finally, it defines two Regular Expressions to check if the user's input looks right before sending a request:
  * ipv4Pattern: Checks for a standard IP address (four sets of numbers 0-255 separated by dots, like 192.168.1.1).
  * domainPattern: Checks for a valid website address (like google.com or my-site.net). It ensures there are no protocol prefixes (like https://) and that the ending (TLD) is at least two characters long.

- Marker variable declared globally to allow moving/removing it
let marker;

- Trimming: It removes any accidental spaces at the start or end of the user's input.
  The "Empty" Check: If there's nothing left after trimming, it tells the main function the input is empty. This triggers the "Enter an IP address..." error.
  The Regex Tests:
  It runs .test(trimmed) against the ipv4Pattern. If it matches, it labels the data as ipv4.
  If not, it checks the domainPattern. If that matches, it labels it as domain.
  The Fallback: If it doesn't match either pattern, it returns invalid. This triggers the "Use a valid IPv4 address..." error.
  Normalizing function acts as a translator. It takes messy user input and turns it into a structured object ({ type, value }) that the rest of the app can easily understand.

- Function to Update UI and Map View

- Async function to Fetch Data from API (IPify)
    const response = await fetch(`https://geo.ipify.org/api/v2/country,city?${params.toString()}`);
  
- Async function to manage the logic for looking up geographic information based on an IP address or domain name.  It handles the process from the moment a user submits a search until the results (or errors) are displayed.
  Here is the step-by-step breakdown:
  - Validation: It first "normalizes" the input. If the search box is empty or the format is invalid (not a real IP or domain), it shows a specific error message and stops.
  - Preparation: It clears any old errors and triggers a "loading" state and disabling buttons.
  - Data Fetching: It calls fetchGeoData to get the actual location data. If successful, it passes that data to updateUI to refresh the screen.
  - Error Handling: If the network request fails or the address doesn't exist, it displays a "not found" message and logs the technical details to the console.
  -Cleanup: Regardless of whether it succeeded or failed, it turns off the loading state and tells the map component to resize itself to ensure it renders correctly.
  
### Built with

- Semantic HTML5 markup: 
  Created a section for the info-cards for ip-display, location-display, timezone-display, and isp-display.
- CSS custom properties
  Flexbox and Grid for alignment of elements
- Typescript (Compilrd to Javascript)
- Mobile-first workflow
- [Styled Components](style-guide.md) - For styles


### What I learned

"OpenStreetMap tile request 403r Access Blocked" #40581 error message was appearing after an early attempt at testing. I googled the error and found a solution at https://github.com/dbeaver/dbeaver/issues/40581, where I had to include referer and User-Agent fields in the tile request.
You must:

Use the correct URL: https://tile.openstreetmap.org/{z}/{x}/{y}.png.
Provide visible licence attribution, following the Attribution Guidelines.
Send a valid HTTP User-Agent that clearly identifies your application (or a platform X-Requested-With app ID where set automatically).
From web pages, ensure a valid HTTP Referer header is sent.
Cache tiles locally according to HTTP caching headers (or at least 7 days if your cache cannot read them).
Avoid encouraging or enabling copyright infringement.

Solution retrospective
What are you most proud of, and what would you do differently next time?
I'm really happy with how I handled the overlapping layout. Getting that results card to sit perfectly between the blue header and the map. Managing the state of the UI (the "Loading" text, updating the map, and changing the info card) were manageable using Tyescript for a project of this size. 

What challenges did you encounter, and how did you overcome them?
I’d say the biggest challenge was the layout positioning of the results card. Another tricky part was the map integration. It was my first time using LeafletJS, and I realized pretty quickly that the map wouldn't show up if the container didn't have a fixed height in CSS. I fixed that by using a mix of Flexbox and a min-height on the map div. Lastly, handling asynchronous data was a learning curve. I had to make sure the map only tried to move once the API actually returned the coordinates, otherwise the app would throw an error. Using async/await and adding a simple "Loading" state for the text fields helped keep everything synced up and smooth for the user.

### Continued development

I would look into "API Key masking" or using a proxy server, because right now the API key is visible in the frontend, which isn't ideal for real-world production apps.

## Author

- William Barber



