self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;

import { initializeApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { getDatabase, onValue, ref, set, get, update, push, child } from 'firebase/database';
import { getStorage, uploadBytes, getDownloadURL, deleteObject, listAll, ref as storageRef } from 'firebase/storage';
import { firebaseConfig,DEBUG_TOKEN } from './firebase_config.js';

const app = initializeApp(firebaseConfig);
const appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(DEBUG_TOKEN),
    isTokenAutoRefreshEnabled: false
});

window.addEventListener('DOMContentLoaded', async () => {
    setMinMaxBirthdate();
})

const database = getDatabase(app);
const storage = getStorage(app);
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

    const userPic = formData.get("userPic");
    if (userPic) {
        const userPicRef = storageRef(storage, `userPics/${ newUserId }/` + userPic.name);
        userData['userPic'] = userPicRef.fullPath;
        uploadBytes(userPicRef, userPic);
    }
    
    console.log(userData);
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

        if (userData['userPic']) {
            let userPic = document.createElement('img');
            const userPicRef = storageRef(storage, userData['userPic']);
            getDownloadURL(userPicRef)
                .then((url) => userPic.src = url)
                .then(() => { listItem.appendChild(userPic) });
        }

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
    const userPicRef = storageRef(storage, `userPics/${ userID }`);
    set(ref(database, 'users/' + userID), null);

    listAll(userPicRef)
        .then((files) => {
            files.items.forEach((file) => {
                deleteObject(file);
            })
        })
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