const API_URL = 'https://campus-lost-found-n7ig.onrender.com';
let base64Image = "";
let currentCollege = ""; 

const mumbaiColleges = [
    "Veermata Jijabai Technological Institute (VJTI) - Matunga",
    "Institute of Chemical Technology (ICT) - Matunga",
    "Sardar Patel College of Engineering (SPCE) - Andheri",
    "Sardar Patel Institute of Technology (SPIT) - Andheri",
    "Dwarkadas J. Sanghvi College of Engineering (DJSCE) - Vile Parle",
    "Thadomal Shahani Engineering College (TSEC) - Bandra",
    "Fr. Conceicao Rodrigues College of Engineering (CRCE) - Bandra",
    "Rajiv Gandhi Institute of Technology (RGIT) - Andheri",
    "Thakur College of Engineering and Technology (TCET) - Kandivali",
    "St. Francis Institute of Technology (SFIT) - Borivali",
    "Rizvi College of Engineering - Bandra",
    "Xavier Institute of Engineering - Mahim",
    "M.H. Saboo Siddik College of Engineering - Byculla",
    "K. J. Somaiya College of Engineering - Vidyavihar",
    "Vivekanand Education Society's Institute of Technology (VESIT)",
    "Shah and Anchor Kutchhi Engineering College (SAKEC) - Chembur",
    "Vidyalankar Institute of Technology (VIT) - Wadala",
    "Don Bosco Institute of Technology (DBIT) - Kurla",
    "Padmabhushan Vasantdada Patil Pratishthan's College of Engineering (PVPPCOE) - Sion",
    "Fr. C. Rodrigues Institute of Technology (FCRIT) - Vash",
    "Ramrao Adik Institute of Technology (RAIT) - Nerul",
    "SIES Graduate School of Technology - Nerul",
    "Bharati Vidyapeeth College of Engineering - Belapur",
    "Datta Meghe College of Engineering - Airoli",
    "A.C. Patil College of Engineering - Kharghar",
    "Saraswati College of Engineering - Kharghar",
    "Smt. Indira Gandhi College of Engineering - Koparkhairane",
    "Mahatma Gandhi Mission's (MGM) College of Engineering and Technology - Kamothe",
    "Pillai College of Engineering - New Panvel",
    "Vidyavardhini's College of Engineering and Technology (VCET) - Vasai",
    "Jondhale College of Engineering - Dombivli",
    "Pendharkar College of Engineering - Dombivli",
    "Konkan Gyanpeeth College of Engineering - Karjat",
    "Dilkap Research Institute of Engineering and Management Studies (DRIEMS)",
    "G V Acharya Institute of Engineering and Technology, Karjat",
];

// This runs automatically when the page loads to build the dropdown dynamically(First Page when user opens the Website) 
window.onload = function() {
    const dropdown = document.getElementById('collegeDropdown');
    mumbaiColleges.forEach(college => {
        let option = document.createElement('option');
        option.value = college;
        option.textContent = college;
        dropdown.appendChild(option);
    });
};

// enterCampus()
// WHY : Acts as a gatekeeper. It saves the user's college choice, hides the welcome screen, shows the main form of LOST/FOUND
function enterCampus() {
    const selected = document.getElementById('collegeDropdown').value;
    if (!selected) return alert("Please select a college first!");
    
    currentCollege = selected; 
    document.getElementById('college-selection-screen').style.display = 'none';
    document.getElementById('main-app').style.display = 'block';
    
    loadItems(); // Fetch items for this specific college campus
}

//  Image Input Event Listener
// WHY : Intercepts the file upload, reads the file, and converts it to a Base64 string (text representation of the image) so it can be saved in MongoDB easily.
document.getElementById('imageInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader(); // Built-in browser API
        reader.onloadend = function() {
            base64Image = reader.result; // Save the string
            const preview = document.getElementById('preview');
            preview.src = base64Image;
            preview.style.display = "block";
        }
        reader.readAsDataURL(file); // Trigger the conversion
    }
});

// reportItem()
// WHY :  all form data, packages it into a JSON playload, and POSTs it to the backend.
async function reportItem() {
    // 1. Grab all values from the DOM
    const type = document.getElementById('itemType').value;
    const item = document.getElementById('itemName').value;
    const name = document.getElementById('userName').value;
    const contact = document.getElementById('contact').value;
    const desc = document.getElementById('description').value;
    const pin = document.getElementById('secretPIN').value;

    if (!item || !name || !contact || !pin) return alert("Please fill Item Name, Your Name, Contact, and a Secret PIN!");

    // Fallback image if user didn't upload one
    let finalImage = base64Image || "https://cdn-icons-png.flaticon.com/512/681/681594.png";

    // 2. Package data for the backend
    const data = {
        type, item, name, contact, description: desc, image: finalImage,
        collegeName: currentCollege, secretPIN: pin
    };

    try {
        // 3. Send the HTTP POST request to our server(The Brain oof Website)
        await fetch(`${API_URL}/add-item`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // Stringify Converts the user inputed data to JSON Object
            body: JSON.stringify(data)
        });

        alert("Report Submitted Successfully!");
        // Clear the form for the next entry
        document.getElementById('itemForm').querySelectorAll('input, textarea').forEach(input => input.value = '');
        document.getElementById('preview').style.display = "none";
        base64Image = "";

        loadItems(); // Refresh the UI with the new item
    } catch (error) {
        console.error("Network Error:", error);
        alert("Server Error. Is the backend running?");
    }
}

// LOAD FEED LOGIC
async function loadItems() {
    try {
        const res = await fetch(`${API_URL}/items/${encodeURIComponent(currentCollege)}`);
        const items = await res.json();
        
        const container = document.getElementById('itemsContainer');
        container.innerHTML = `<h3>Showing items for: ${currentCollege}</h3>`;

        if(items.length === 0) {
            container.innerHTML += "<p>No items reported yet for this campus.</p>";
            return;
        }

        // The loop is back, and the HTML is restored!
        items.forEach(obj => {
            const typeClass = obj.type === 'Lost' ? 'lost' : 'found';
            container.innerHTML += `   
                <div class="item-card ${typeClass}">   
                    <div style="display:flex; align-items:flex-start;">   
                        <img src="${obj.image}" class="item-img" alt="Item Image">   
                        <div class="info" style="width:100%">   
                            <div class="card-header">   
                                <h3>${obj.item}</h3>   
                                <span class="tag ${typeClass}">${obj.type}</span>   
                            </div>   
                            <p><strong>Owner:</strong> ${obj.name}</p>   
                            <p class="desc">"${obj.description || 'No description'}"</p>   
                            <p><strong>Contact:</strong> ${obj.contact}</p>   
                            <button class="btn-delete" onclick="deleteItem('${obj._id}')">   
                                ${obj.type === 'Lost' ? 'Found It! (Resolve)' : 'Claimed (Resolve)'}   
                            </button>   
                        </div>   
                    </div>   
                </div>`;
        });
    } catch (error) {
        console.error("Error loading items:", error);
    }
}

// deleteItem(id)
// WHY : Prompts for a PIN, then sends a DELETE request. The backend will verify if the PIN is correct.
async function deleteItem(id) {
    const enteredPIN = prompt("Enter the 4-Digit Secret PIN to claim/delete this item:");
    if (!enteredPIN) return; 

    try {
        const response = await fetch(`${API_URL}/delete-item/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pin: enteredPIN }) // Send typed PIN to backend
        });

        const result = await response.json();

        // Checking for PIN
        if (response.ok) {
            alert("Success: " + result.message);
            loadItems(); 
        } else {
            alert(result.error);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}