//Select needed elements with css selector and export them
export const fullNameInput = document.querySelector('input#fullname_input');
export const validationError = document.querySelector('div.validate_error');
export const genderRadioInputs = document.querySelectorAll('input[name="gender"]');
export const form = document.querySelector('form.form');
export const clearBtn = document.querySelector('button.btn.clear');
export const saveBtn = document.querySelector('button.btn.save');
export const predictionGender = document.querySelector('div.prediction_result--gender');
export const predictionAccuracy = document.querySelector('div.prediction_result--accuracy');
export const savedGender = document.querySelector('div.saved_answer--gender');
export const notification = document.querySelector('div.notifications');

// An async function to send GET request to API with name as query param
// Waits for result if response code wasn't 200 OK throw an error with error code
// Waits for body and parses it as JSON then returns it
async function submitForm(fullname) {
    if(!validateInput()) {
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
        resetResults();
        const resolvedResult = await result;
        predictionGender.innerText = resolvedResult.gender || 'Not Specified';
        if(resolvedResult.gender){
            genderRadioInputs[0].checked = resolvedResult.gender == 'male';
            genderRadioInputs[1].checked = !genderRadioInputs[0].checked;
            handleSuccess('Found a match in API database');
        } else {
            handleError('Did not find a match in API database');
        }
        predictionAccuracy.innerText = resolvedResult.probability || 'Not Specified';
        fetchLocalStorage();
    } catch (error) {
        handleError(error);
    }
}

// Saves the name in input and radio option in local storage
function saveGuess() {
    if(!validateInput()) {
        handleError('Name should only include alphabet and space');
        return;
    }
    const name = fullNameInput.value;
    const gender = genderRadioInputs[0].checked ? 'male' : 'female';
    localStorage.setItem(name, gender);
    handleSuccess('Record saved to local storage.')
}

// Fetches data from local storage based on input and changes the value of saved answer
function fetchLocalStorage() {
    const name = fullNameInput.value;
    const gender = localStorage.getItem(name) || 'Nothing in storage';
    savedGender.innerText = gender;
}

// Tries to remove the item from local storage based in input value
function clearLocalStorage() {
    const name = fullNameInput.value;
    localStorage.removeItem(name);
    handleSuccess('Record cleared from storage if existed.');
}

// Resets result in DOM to empty string
function resetResults() {
    predictionGender.innerText = '';
    predictionAccuracy.innerText = '';
    savedGender.innerText = '';
}

// Handles and shows errors clears after 2 seconds by adding classes
function handleError(error) {
    notification.innerText = error;
    notification.classList.add('show');
    notification.classList.add('error');
    setTimeout(clearNotification, 2000);
}

// Handles and shows success clears after 2 seconds by adding classes
function handleSuccess(msg) {
    notification.innerText = msg;
    notification.classList.add('show');
    notification.classList.add('success');
    setTimeout(clearNotification, 2000);
}

// Clears the notification by changing opacity to 0
function clearNotification() {
    notification.classList = 'notifications';
    notification.innerText = '';
}

// Checks validation of input with regex to only contain alphabet and space
// Checks if the input is empty
// Adds red border with invalid class
function validateInput() {
    const name = fullNameInput.value;
    const regex = /^[a-zA-Z ]*$/;
    if(!name.match(regex) || name.length == 0) {
        fullNameInput.classList.add('invalid');
        handleError('Name should only include alphabet and space');
        return false;
    } else {
        fullNameInput.classList.remove('invalid');
        return true;
    }
}

// Add eventListener on submit of the form with submit event
// Prevent default action and reload of page and use submitForm
form.addEventListener('submit', (e) => {
    e.preventDefault();
    showPredictionResult(submitForm(fullNameInput.value));
});

// Add eventListener on click of the save button
// Prevent default action
saveBtn.addEventListener('click', (e) => {
    e.preventDefault();
    saveGuess();
});

// Add eventListener on click of the clear button
// Prevent default action
clearBtn.addEventListener('click', (e) => {
    e.preventDefault();
    clearLocalStorage();
});

// Add eventListener on inputing of the fullname input
// Uses validation function as callback
fullNameInput.addEventListener('input', validateInput);