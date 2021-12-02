export const UserSelect = document.querySelectorAll('input[name="gender"]');
export const API_gender = document.querySelector('div.prediction_result--gender');
export const API_accuracy = document.querySelector('div.prediction_result--accuracy');
export const submited_gender = document.querySelector('div.saved_answer--gender');
export const notification = document.querySelector('div.notifications');
export const user_input_name = document.querySelector('input#fullname_input');
export const validation_error = document.querySelector('div.validate_error');
export const form = document.querySelector('form.form');
export const clear_button = document.querySelector('button.btn.clear');
export const save_button = document.querySelector('button.btn.save');

// send user name in input part and send it to https://api.genderize.io API for results.
async function submit_gender(input_name) {
    if(!validate_gender()) {
        throw new Error('Name should only include alphabet and space');
    }

    const result = await fetch(`https://api.genderize.io/?name=${input_name}`);
    clear_notification();
    if(result.status != 200) {
        throw new Error('Recieved response with error!');
    }
    return await result.json();
}

// show the API results when press the submit button.
async function show_api_results(result) {
    try {
        reset();
        const resolvedResult = await result;
        API_gender.innerText = resolvedResult.gender || 'Not Specified';
        if(resolvedResult.gender){
            UserSelect[0].checked = resolvedResult.gender == 'male';
            UserSelect[1].checked = !UserSelect[0].checked;
        } else {
            error_handler("API did't has a match");
        }
        API_accuracy.innerText = resolvedResult.probability || 'Not Specified';
        get_storage_data();
    } catch (error) {
        error_handler(error);
    }
}

// save the user choice for a name.
function save_user_choice() {
    if(!validate_gender()) {
        error_handler('Name should only include alphabet and space');
        return;
    }
    const name = user_input_name.value;
    const gender = UserSelect[0].checked ? 'male' : 'female';
    localStorage.setItem(name, gender);
}

// get saved data from storages
function get_storage_data() {
    const name = user_input_name.value;
    const gender = localStorage.getItem(name) || 'Storage is empty';
    submited_gender.innerText = gender;
}

// clears the key and value in storage
function clear_storage() {
    const name = user_input_name.value;
    localStorage.removeItem(name);
}

// resets the response part (right part)
function reset() {
    API_gender.innerText = '';
    API_accuracy.innerText = '';
    submited_gender.innerText = '';
}

// shows the error
function error_handler(error) {
    notification.innerText = error;
    notification.classList.add('show');
    notification.classList.add('error');
    setTimeout(clear_notification, 4000);
}

// Clears the notification
function clear_notification() {
    notification.classList = 'notifications';
    notification.innerText = '';
}

// checks if gender is created from alphabet and spaces.
function validate_gender() {
    const name = user_input_name.value;
    const regex = /^[a-zA-Z ]*$/;
    if(!name.match(regex) || name.length == 0) {
        user_input_name.classList.add('invalid');
        error_handler('Name should only include alphabet and space');
        return false;
    } else {
        user_input_name.classList.remove('invalid');
        return true;
    }
}

// call show_api_results after the submit button pressed.
form.addEventListener('submit', (e) => {
    e.preventDefault();
    show_api_results(submit_gender(user_input_name.value));
});

// call save_user_choice after the save button pressed.
save_button.addEventListener('click', (e) => {
    e.preventDefault();
    save_user_choice();
});

// call clear_storage after the clear button pressed. and clear the shown saved text.
clear_button.addEventListener('click', (e) => {
    e.preventDefault();
    clear_storage();
    submited_gender.innerText = '';
});
