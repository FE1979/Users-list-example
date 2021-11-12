import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, push, child } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyD5LkOnzYbIGtNVJysjad4FE-P8vuEBdTo",
    authDomain: "my-projects-1f367.firebaseapp.com",
    projectId: "my-projects-1f367",
    databaseURL: "https://my-projects-1f367-default-rtdb.europe-west1.firebasedatabase.app",
    storageBucket: "my-projects-1f367.appspot.com",
    messagingSenderId: "543781647796",
    appId: "1:543781647796:web:ea69f05e1676bd9b3b2ee1",
    measurementId: "G-MKBGXRG65K"
  };

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const form = document.getElementById("user-form");
const inputs = form.querySelectorAll("input");

form.addEventListener('submit', (e) => {
    e.preventDefault();
    let firstName, lastName, email, phoneNumber, birthDate;
    const newUserId = push(child(ref(database), 'users')).key;

    console.log('Form submitted')
    
    inputs.forEach((input) => {
        switch (input.id) {
            case "user-first-name":
                firstName = input.value
            case "user-last-name":
                lastName = input.value
            case "user-email":
                email = input.value
            case "user-phone":
                phoneNumber = input.value
            case "user-birthdate":
                birthDate = input.value
        }
    
    
    })

    console.log("About to write ", firstName, lastName)
    writeUserData(newUserId, firstName, lastName, email, phoneNumber, birthDate);
})

function writeUserData(userID, firstName, lastName, email, phoneNumber, birthDate) {
    set(ref(database, 'users' + userID), {
        firstName: firstName,
        lastName: lastName,
        email: email,
        phoneNumber: phoneNumber,
        birthDate: birthDate
    });
    console.log('Data should be written')
}



setMinMaxBirthdate();

function setMinMaxBirthdate() {
    const today = new Date();
    const [currentYear, currentMonth, currentDay] = [today.getFullYear(), today.getMonth(), today.getDate()];
    const birthdateInput = document.getElementById("user-birthdate");

    const month = currentMonth < 10 && '0'+currentMonth || ''+currentMonth;
    const day = currentDay < 10 && '0'+currentDay || ''+currentDay;

    birthdateInput.setAttribute("max", `${currentYear}-${month}-${day}`);
    birthdateInput.setAttribute("min", `${currentYear-120}-${month}-${day}`);
}