export const UserSelect = document.querySelectorAll('input[name="gender"]');
export const API_gender = document.querySelector('div.prediction_result--gender');
export const API_accuracy = document.querySelector('div.prediction_result--accuracy');
export const submited_gender = document.querySelector('div.saved_answer--gender');
export const notification = document.querySelector('div.notifications');
export const UserInputName = document.querySelector('input#fullname_input');
export const validationError = document.querySelector('div.validate_error');
export const form = document.querySelector('form.form');
export const clear_button = document.querySelector('button.btn.clear');
export const save_button = document.querySelector('button.btn.save');

// An async function to send GET request to API with name as query param
// Waits for result if response code wasn't 200 OK throw an error with error code
// Waits for body and parses it as JSON then returns it
async function submit_gender(fullname) {
    if(!validate_gender()) {
        throw new Error('Name should only include alphabet and space');
    }

    const result = await fetch(`https://api.genderize.io/?name=${fullname}`);
    clearNotification();
    if(result.status != 200) {
        throw new Error('Recieved response with error code:' + result.status);
    }
    return await result.json();
}

// An async function to show recieved result from API in DOM
// Also catches error and pass it to error handler
async function showPredictionResult(result) {
    try {
        reset();
        const resolvedResult = await result;
        API_gender.innerText = resolvedResult.gender || 'Not Specified';
        if(resolvedResult.gender){
            UserSelect[0].checked = resolvedResult.gender == 'male';
            UserSelect[1].checked = !UserSelect[0].checked;
        } else {
            handleError('Did not find a match in API database');
        }
        API_accuracy.innerText = resolvedResult.probability || 'Not Specified';
        fetchLocalStorage();
    } catch (error) {
        handleError(error);
    }
}

// Saves the name in input and radio option in local storage
function saveGuess() {
    if(!validate_gender()) {
        handleError('Name should only include alphabet and space');
        return;
    }
    const name = UserInputName.value;
    const gender = UserSelect[0].checked ? 'male' : 'female';
    localStorage.setItem(name, gender);
}

// Fetches data from local storage based on input and changes the value of saved answer
function fetchLocalStorage() {
    const name = UserInputName.value;
    const gender = localStorage.getItem(name) || 'Nothing in storage';
    submited_gender.innerText = gender;
}

// Tries to remove the item from local storage based in input value
function clearLocalStorage() {
    const name = UserInputName.value;
    localStorage.removeItem(name);
}

// Resets result in DOM to empty string
function reset() {
    API_gender.innerText = '';
    API_accuracy.innerText = '';
    submited_gender.innerText = '';
}

// Handles and shows errors clears after 2 seconds by adding classes
function handleError(error) {
    notification.innerText = error;
    notification.classList.add('show');
    notification.classList.add('error');
    setTimeout(clearNotification, 4000);
}

// Clears the notification by changing opacity to 0
function clearNotification() {
    notification.classList = 'notifications';
    notification.innerText = '';
}

// Checks validation of input with regex to only contain alphabet and space
// Checks if the input is empty
// Adds red border with invalid class
function validate_gender() {
    const name = UserInputName.value;
    const regex = /^[a-zA-Z ]*$/;
    if(!name.match(regex) || name.length == 0) {
        UserInputName.classList.add('invalid');
        handleError('Name should only include alphabet and space');
        return false;
    } else {
        UserInputName.classList.remove('invalid');
        return true;
    }
}

// Add eventListener on submit of the form with submit event
// Prevent default action and reload of page and use submit_gender
form.addEventListener('submit', (e) => {
    e.preventDefault();
    showPredictionResult(submit_gender(UserInputName.value));
});

// Add eventListener on click of the save button
// Prevent default action
save_button.addEventListener('click', (e) => {
    e.preventDefault();
    saveGuess();
});

// Add eventListener on click of the clear button
// Prevent default action
clear_button.addEventListener('click', (e) => {
    e.preventDefault();
    clearLocalStorage();
    submited_gender.innerText = '';
});

// Add eventListener on inputing of the fullname input
// Uses validation function as callback
UserInputName.addEventListener('input', validate_gender);