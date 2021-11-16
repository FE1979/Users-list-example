self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;

import { async } from '@firebase/util';
import { initializeApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { getDatabase, ref, set, get, push, child } from 'firebase/database';
import { firebaseConfig,DEBUG_TOKEN } from './firebase_config.js';

const app = initializeApp(firebaseConfig);
const appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(DEBUG_TOKEN),
    isTokenAutoRefreshEnabled: false
});

window.addEventListener('DOMContentLoaded', () => {
    setMinMaxBirthdate();
    showUsersList();
})

const database = getDatabase(app);
const form = document.getElementById("user-form");

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const newUserId = push(child(ref(database), 'users')).key;
    const formData = new FormData(form);
    const userData = {}

    for (let [key, value] of formData.entries()) {
        userData[key] = value
    }

    writeUserData(newUserId, userData);
});

function writeUserData(userID, obj) {
    set(ref(database, 'users/' + userID), obj)
        .then(() => (alert('Data transfered succssfully')))
        .catch((err) => (alert('Something went wrong!')));
}

function setMinMaxBirthdate() {
    const today = new Date();
    const [currentYear, currentMonth, currentDay] = [today.getFullYear(), today.getMonth()+1, today.getDate()];
    const birthdateInput = document.getElementById("user-birthdate");

    const month = currentMonth < 10 && '0'+currentMonth || ''+currentMonth;
    const day = currentDay < 10 && '0'+currentDay || ''+currentDay;

    birthdateInput.setAttribute("max", `${currentYear}-${month}-${day}`);
    birthdateInput.setAttribute("min", `${currentYear-120}-${month}-${day}`);
}

async function getUserList() {
    return get(ref(database, 'users/'))
        .then((usersList) => {
            if (usersList.exists()) {
                return usersList;
            } else {
                return;
            }
        }).catch((err) => {
            console.error(err)
        })
}

/* remove before merge into develop */
async function migrateUsers() {
    const data = await getUserList();
    
    if (data) {
        data.forEach((item) => {
            let user = item.exportVal(); // get JS object

            if (user["-MocbBsON2imUcnMihGR"]) {
                return; // do nothing if true item
            } else {
                let newUserId = push(child(ref(database), 'users/')).key; // get new ID
                writeUserData(newUserId, user) // write item to new place
            }

            set(ref(database, item.key), null); // clear item from previous place
        })
    }
};

async function showUsersList() {
    const usersList = await getUserList();
    const list = document.getElementById("users-list");

    console.log(usersList.key, usersList.exportVal())

    usersList.forEach((item) => {
        console.log('next Item')
        console.log(item.key, item.exportVal());
    })

    usersList.forEach((item) => {
        let userData = item.exportVal();
        let listItem = document.createElement("li");
        let deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';

        listItem.textContent = `${userData.firstName}, 
                                ${userData.lastName}, 
                                ${userData.birthDate}, 
                                ${userData.email},
                                ${userData.phoneNumber}`;
        listItem.id = item.key;
        listItem.appendChild(deleteBtn);
        list.appendChild(listItem);
    })
}