
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-analytics.js";
  import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js'
  import { getFirestore, doc, setDoc, getDoc, getDocs, collection } from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js';
  import { db } from '../../helperClasses/firestoreService.js';
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyDkJbt9ewyYvPLb5LJDpDAFIaIvva9iaec",
    authDomain: "freshpicks-da3ef.firebaseapp.com",
    projectId: "freshpicks-da3ef",
    storageBucket: "freshpicks-da3ef.appspot.com",
    messagingSenderId: "610098249496",
    appId: "1:610098249496:web:0475aa3b2c11a9f049686d",
    measurementId: "G-82WSX2M2V3"
  };


  // Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const auth = getAuth(app);

const submitButton = document.getElementById("submit");
const signupButton = document.getElementById("sign-up");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const main = document.getElementById("main");
const createacct = document.getElementById("create-acct")

const signupEmailIn = document.getElementById("email-signup");
const confirmSignupEmailIn = document.getElementById("confirm-email-signup");
const signupPasswordIn = document.getElementById("password-signup");
const confirmSignUpPasswordIn = document.getElementById("confirm-password-signup");
const createacctbtn = document.getElementById("create-acct-btn");

const returnBtn = document.getElementById("return-btn");

var email, password, signupEmail, signupPassword, confirmSignupEmail, confirmSignUpPassword;


createacctbtn.addEventListener("click", function() {
  var isVerified = true;

  signupEmail = signupEmailIn.value;
  confirmSignupEmail = confirmSignupEmailIn.value;
  if(signupEmail != confirmSignupEmail) {
      window.alert("Email fields do not match. Try again.")
      isVerified = false;
  }

  signupPassword = signupPasswordIn.value;
  confirmSignUpPassword = confirmSignUpPasswordIn.value;
  if(signupPassword != confirmSignUpPassword) {
      window.alert("Password fields do not match. Try again.")
      isVerified = false;
  }
  
  if(signupEmail == null || confirmSignupEmail == null || signupPassword == null || confirmSignUpPassword == null) {
    window.alert("Please fill out all required fields.");
    isVerified = false;
  }
  
  if(isVerified) {
    createUserWithEmailAndPassword(auth, signupEmail, signupPassword)
      .then((userCredential) => {
      // Signed in 
      const user = userCredential.user;
      
      sessionStorage.setItem('userDisplayName', user.displayName);
      sessionStorage.setItem('userEmail', user.email);
      sessionStorage.setItem('user', JSON.stringify(user))
      
      console.log(user)
      // ...
      window.alert("Success! Account created.");
      window.location.href = '../authentication/userType.html'

    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      // ..
      window.alert("Error occurred. Try again.");
    });
  }
});

submitButton.addEventListener("click", function() {
  email = emailInput.value;
  console.log(email);
  password = passwordInput.value;
  console.log(password);

  signInWithEmailAndPassword(auth, email, password)
  .then(async (userCredential) => {
    // Signed in
    const user = userCredential.user;

    sessionStorage.setItem('userDisplayName', user.displayName);
    sessionStorage.setItem('userEmail', user.email);
    sessionStorage.setItem('user', JSON.stringify(user));

    console.log("Success! Welcome back!");
    window.alert("Success! Welcome back!");

    const organizerDocRef = doc(db, "Organizer", user.email);

    try {
      const docSnapshot = await getDoc(organizerDocRef);

      if (docSnapshot.exists()) {
        window.location.href = "/html/OrganizerPages/Dashboard.html";
      } else {
        window.location.href = '/html/User/userHomePage.html';
      }
    } catch (error) {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(error);
      console.log("Error occurred. Try again.");
      window.alert("Error occurred. Try again.");
    }
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log(error);
    console.log("Error occurred. Try again.");
    window.alert("Error occurred. Try again.");
  });

});

signupButton.addEventListener("click", function() {
    main.style.display = "none";
    createacct.style.display = "block";
});

returnBtn.addEventListener("click", function() {
    main.style.display = "block";
    createacct.style.display = "none";
});
