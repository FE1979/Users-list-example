import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyD5LkOnzYbIGtNVJysjad4FE-P8vuEBdTo",
    authDomain: "my-projects-1f367.firebaseapp.com",
    projectId: "my-projects-1f367",
    storageBucket: "my-projects-1f367.appspot.com",
    messagingSenderId: "543781647796",
    appId: "1:543781647796:web:ea69f05e1676bd9b3b2ee1",
    measurementId: "G-MKBGXRG65K"
  };

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

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