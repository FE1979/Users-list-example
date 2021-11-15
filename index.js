self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;

import { initializeApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { getDatabase, ref, set, push, child } from 'firebase/database';
import { firebaseConfig,DEBUG_TOKEN } from './firebase_config.js';

const app = initializeApp(firebaseConfig);
const appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(DEBUG_TOKEN),
    isTokenAutoRefreshEnabled: false
});

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