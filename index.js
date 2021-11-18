self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;

import { async } from '@firebase/util';
import { initializeApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { getDatabase, onValue, ref, set, get, update, push, child } from 'firebase/database';
import { firebaseConfig,DEBUG_TOKEN } from './firebase_config.js';

const app = initializeApp(firebaseConfig);
const appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(DEBUG_TOKEN),
    isTokenAutoRefreshEnabled: false
});

window.addEventListener('DOMContentLoaded', async () => {
    setMinMaxBirthdate();
    await showUsersList();
})

const database = getDatabase(app);
const form = document.getElementById("user-form");
const updateBtn = document.getElementById("update-btn");

updateBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const userID = form.getAttribute("userID");
    const formData = new FormData(form);
    const userData = {}

    for (let [key, value] of formData.entries()) {
        userData[key] = value
    }
    update(ref(database, `users/${ userID }`), userData);
});

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

/* remove before merge into develop */
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

async function showUsersList(snapshot) {
    const usersList = snapshot;
    const list = document.getElementById("users-list");

    let listItems = document.querySelectorAll(".user-item");
    listItems.forEach((item) => {
        list.removeChild(item);
    })

    usersList.forEach((item) => {
        let userData = item.exportVal();
        let listItem = document.createElement("li");
        let deleteBtn = document.createElement('button');

        deleteBtn.textContent = 'Delete';
        deleteBtn.id = item.key;
        deleteBtn.addEventListener('click', deleteUser)

        listItem.textContent = `${userData.firstName}, 
                                ${userData.lastName}, 
                                ${userData.birthDate}, 
                                ${userData.email},
                                ${userData.phoneNumber}`;
        listItem.id = item.key;
        listItem.className = "user-item"

        listItem.addEventListener('click', getUser)

        listItem.appendChild(deleteBtn);
        list.appendChild(listItem);
    })
}

function deleteUser(event) {
    const userID = event.target.id;
    set(ref(database, 'users/' + userID), null)
    console.log(userID, 'deleted')
}

onValue(ref(database, 'users/'), (snapshot) => {
    showUsersList(snapshot);
})

function getUser(event) {
    const userID = event.target.id;
    const userRef = ref(database, `users/${ userID }`);
    form.setAttribute("userID", userID);

    get(userRef).then((userData) => {
        const userObj = userData.exportVal()
        const inputs = form.querySelectorAll("input");

        for (let input of inputs) {
            let key = input.getAttribute("name");
            input.value = userObj[key];
        }
    })
}