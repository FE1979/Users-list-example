self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;

import { initializeApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { getDatabase, onValue, ref, set, update, push, child } from 'firebase/database';
import { getStorage, uploadBytes, getDownloadURL, deleteObject, listAll, ref as storageRef } from 'firebase/storage';
import { firebaseConfig,DEBUG_TOKEN } from './firebase_config.js';

const app = initializeApp(firebaseConfig);
initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(DEBUG_TOKEN),
    isTokenAutoRefreshEnabled: false
});

const database = getDatabase(app);
const storage = getStorage(app);
const form = document.getElementById("user-form");
const updateBtn = document.getElementById("update-btn");
let users = new Map();

window.addEventListener('DOMContentLoaded', () => {
    setMinMaxBirthdate();
})

function setMinMaxBirthdate() {
    const today = new Date();
    const [currentYear, currentMonth, currentDay] = [today.getFullYear(), today.getMonth()+1, today.getDate()];
    const birthdateInput = document.getElementById("user-birthdate");

    const month = currentMonth < 10 && '0'+currentMonth || ''+currentMonth;
    const day = currentDay < 10 && '0'+currentDay || ''+currentDay;

    birthdateInput.setAttribute("max", `${currentYear}-${month}-${day}`);
    birthdateInput.setAttribute("min", `${currentYear-120}-${month}-${day}`);
}

onValue(ref(database, 'users/'), (snapshot) => {
    users.clear();
    snapshot.forEach((user) => {
        const userData = user.exportVal();
        users.set(user.key, userData)
    })
    renderList();
})

function renderList() {
    const usersList = new Map(users);
    const list = document.querySelector("table#users-list > tbody");
    const listItems = list.querySelectorAll(".user-item");

    listItems.forEach((item) => {
        list.removeChild(item);
    })

    usersList.forEach((userData, userID) => {
        const listItem = document.createElement("tr");
        const userPicCell = document.createElement('td');
        const firstNameCell = document.createElement('td');
        const lastNameCell = document.createElement('td');
        const birthDateCell = document.createElement('td');
        const emailCell = document.createElement('td');
        const phoneCell = document.createElement('td');
        const delBtnCell = document.createElement('td');
        const deleteBtn = document.createElement('button');

        if (userData['userPic']) {
            const userPic = document.createElement('img');
            userPic.setAttribute('width', '100%');
            const userPicRef = storageRef(storage, userData['userPic']);
            getDownloadURL(userPicRef)
                .then((url) => userPic.src = url)
                .then(() => { userPicCell.appendChild(userPic) });
        }

        listItem.id = userID;
        listItem.className = "user-item";
        listItem.addEventListener('click', getListItemData)

        deleteBtn.textContent = 'Delete';
        deleteBtn.id = userID;
        deleteBtn.className = "btn btn-sm btn-outline-danger";
        deleteBtn.addEventListener('click', deleteUser);
        delBtnCell.appendChild(deleteBtn);

        firstNameCell.textContent = `${userData.firstName}`;
        lastNameCell.textContent = `${userData.lastName}`;
        birthDateCell.textContent = `${userData.birthDate}`;
        emailCell.textContent = `${userData.email}`;
        phoneCell.textContent = `${userData.phoneNumber}`;

        listItem.appendChild(userPicCell);
        listItem.appendChild(firstNameCell);
        listItem.appendChild(lastNameCell);
        listItem.appendChild(birthDateCell);
        listItem.appendChild(emailCell);
        listItem.appendChild(phoneCell);
        listItem.appendChild(delBtnCell);

        list.appendChild(listItem);
    })
}

updateBtn.addEventListener('click', updateUser);

form.addEventListener('submit', createUser);

async function createUser(e) {
    e.preventDefault();
    const newUserId = push(child(ref(database), 'users')).key;
    const userData = getFormData();
    const userPic = userData['userPic'];

    console.log('run create user')

    if (userPic) {
        const userPicRef = storageRef(storage, `userPics/${ newUserId }/` + userPic.name);
        userData['userPic'] = userPicRef.fullPath;
        await uploadBytes(userPicRef, userPic);
    }

    set(ref(database, 'users/' + newUserId), userData)
        .then(() => (console.log('New user created')))
        .catch((err) => (console.error(err)));
}

function updateUser(e) {
    e.preventDefault();
    const userID = form.getAttribute("userID");
    
    update(ref(database, `users/${ userID }`), getFormData());
}

function deleteUser(event) {
    event.preventDefault();
    event.stopPropagation();
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

function getFormData() {
    const formData = new FormData(form);
    const userData = {}

    for (let [key, value] of formData.entries()) {
        userData[key] = value
    }

    return userData;
}

function getListItemData(event) {
    const clickedElement = event.target;
    const userID = clickedElement.id ? clickedElement.id : clickedElement.parentNode.id;

    const itemData = users.get(userID);
    const inputs = form.querySelectorAll('input');

    form.setAttribute("userID", userID);
    inputs.forEach((input) => {
        let key = input.getAttribute("name");
        input.value = itemData[key]
    })
}