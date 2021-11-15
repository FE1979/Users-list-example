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

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const userData = {}

    for (let [key, value] of formData.entries()) {
        userData[key] = value
    }
    const newUserId = push(child(ref(database), 'users')).key;

    writeUserData(newUserId, userData);
});

function writeUserData (userID, obj) {
    set(ref(database, 'users' + userID), obj);
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