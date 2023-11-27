import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Initialize Firebase

const firebaseConfig = {
    apiKey: "AIzaSyDkJbt9ewyYvPLb5LJDpDAFIaIvva9iaec",
    authDomain: "freshpicks-da3ef.firebaseapp.com",
    projectId: "freshpicks-da3ef",
    storageBucket: "freshpicks-da3ef.appspot.com",
    messagingSenderId: "610098249496",
    appId: "1:610098249496:web:0475aa3b2c11a9f049686d",
    measurementId: "G-82WSX2M2V3"
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
    // Handle form submission
document.getElementById('create-seller-btn').addEventListener('click', async function () {
  // Access the input values
  const companyName = document.getElementById('company-name').value;
  const companyEmail = document.getElementById('company-email').value;
  const companyWebsite = document.getElementById('company-website').value;
  const address = document.getElementById('address').value;
  const contactNumber = document.getElementById('contact-number').value;


const collectionName = 'Organizer';
const docID = sessionStorage.getItem('userEmail');
    const docRef = doc(db, collectionName, docID); 

    // Define the data for the document
    const data = {
        companyName: companyName,
        companyEmail: companyEmail,
        companyWebsite: companyWebsite,
        address: address,
        contactNumber: contactNumber,
    };

    try {
        await setDoc(docRef, data);
        console.log('Document successfully written!');
        window.location.href = '../Organizer/AddMarket.html';
    } catch (error) {
        console.error('Error adding document: ', error);
    }
});