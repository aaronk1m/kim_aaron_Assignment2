//Aaron Kim Login.js
let params = (new URL(document.location)).searchParams;

//When the window loads up, do the following:
window.onload = function() {
    if (params.has('loginError')) {
        document.getElementById('errorMessage').innerText = params.get('loginError');
        
    }
    document.getElementById('email').value = params.get('email');
}

// Retrieve references to the password input and the checkbox for displaying the password
let passwordInput = document.getElementById('password');
let showPasswordCheckbox = document.getElementById('showPasswordCheckbox');

// Attach an event listener to the checkbox for toggling the visibility of the password
showPasswordCheckbox.addEventListener('change', function () {
    passwordInput.type = this.checked ? 'text' : 'password';
});