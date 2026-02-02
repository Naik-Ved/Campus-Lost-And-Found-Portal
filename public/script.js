// When i search on Goggle address Bar 
const API_URL = 'http://localhost:5000';
let base64Image = "";
// base64 is use to converts img to String 

//EVENT LISTENER: IMAGE PREVIEW 
//Converts uploaded file to Base64 string for immediate preview & storage.
document.getElementById('imageInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = function() {
            base64Image = reader.result;
            //(DOM Manipulation)By this line we i see the preview image
            const preview = document.getElementById('preview');
            preview.src = base64Image;
            preview.style.display = "block";
        }
        reader.readAsDataURL(file);
    }
});

//(ASYNC FUNCTION) To Submit the Report  
async function reportItem() {
    // Here I Collect Data from DOM Elements 
    const type = document.getElementById('itemType').value;
    const item = document.getElementById('itemName').value;
    const name = document.getElementById('userName').value;
    const contact = document.getElementById('contact').value;
    const desc = document.getElementById('description').value;

    //If Someone Not Fill the Data in Correct Way and click the submit Button
    if (!item || !name || !contact) return alert("Please fill Item Name, Your Name, and Contact!");

    //Use default icon(if someone Forgot add Image) if no image is uploaded
    let finalImage = base64Image;
    if (!finalImage) {
        finalImage = "https://cdn-icons-png.flaticon.com/512/681/681594.png";
    }   
    // This is the Basic Information fill for the Report
    const data = { type, item, name, contact, description: desc, image: finalImage };

    try {
        //(API CALL)POST request to server
        // Here i am using async and await just because i don't want when 10 users hiting the website then webpage freez
        await fetch(`${API_URL}/add-item`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        alert("Report Submitted Successfully!");

        //RESET logic after click on submit Button: Clear form fields after successful submission
        document.getElementById('itemForm').querySelectorAll('input, textarea').forEach(input => input.value = '');
        document.getElementById('preview').style.display = "none";
        base64Image = "";

        loadItems(); // When Submission is completed System redirects on same webpage and user can see his item(lost or Found) 
    } catch (error) {
        console.error("Network Error:", error);
        alert("Server Error. Is the backend running?");
    }
}

//(ASYNC FUNCTION)LOAD FEED
//Here Data Fetched from backend and renders to HTML Cards
async function loadItems() {
    try {
        const res = await fetch(`${API_URL}/items`);
        const items = await res.json();
        
        const container = document.getElementById('itemsContainer');
        container.innerHTML = ""; // Clear existing content

        // EMPTY STATE HANDLING(If No Items are Lost or Found by Someone)
        if(items.length === 0) {
            container.innerHTML = "<p>No items reported yet.</p>";
            return;
        }

        // DYNAMIC RENDERING LOOP
        items.forEach(obj => {
            // Here I Style the Conditionally on the base of item Lost or Found
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
                            
                            <button class="btn-delete" onclick="deleteItem('${obj.id}')">
                                ${obj.type === 'Lost' ? 'Found It! (Resolve)' : 'Claimed (Resolve)'}
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error("Error loading items:", error);
        document.getElementById('itemsContainer').innerHTML = "<p style='color:red'>Failed to load items. Check Server.</p>";
    }
}

//ASYNC FUNCTION TO DELETE ITEM
async function deleteItem(id) {
    if(confirm('Mark this issue as resolved?')) {
        await fetch(`${API_URL}/delete-item/${id}`, { method: 'DELETE' });
        loadItems(); // Redirecting on the same webpage to see the changes by user
    }
}

//Calling for the 1st time to load the Webpage
loadItems();