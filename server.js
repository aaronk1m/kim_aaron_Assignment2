//Aaron Kim
// Importing the Express.js framework 
const express = require('express');
// Importing the crypto module
const crypto = require('crypto');
const qs = require('querystring');
// Create an instance of the Express application called "app"
// app will be used to define routes, handle requests, etc
const app = express();

app.use(express.urlencoded({ extended: true }));

//grabs everything from public
app.use(express.static(__dirname + '/public'));

//sets up the product array from the json file
let products = require(__dirname + '/products.json');
products.forEach( (prod,i) => {prod.total_sold = 0});

// Define a route for handling a GET request to a path that matches "./products.js"
app.get("/products.js", function (request, response, next) {
    response.type('.js');
    let products_str = `var products = ${JSON.stringify(products)};`;
    //console.log(products_str);
    response.send(products_str);
});

let url = '';
//Whenever a post with proccess form is recieved
app.post("/process_form", function (request, response) {

    //It will get the textbox inputs in an array
    let qtys = request.body[`quantity_textbox`];
    //Initially set the valid check to true
    let valid = true;
    //Instantiate an empty string to hold the url
    url = '';
    let soldArray =[];

    //..
    //This is for each member of qtys
    for (i in qtys) {
        
        //set q as the number
        let q = Number(qtys[i]);
        
        //console.log(validateQuantity(q));
        //If the validate quantity string is empty
        if (validateQuantity(q)=='') {
            //Check if we will go into the negative if we buy this, set valid to false if so
            if(products[i]['qty_available'] - Number(q) < 0){
                valid = false;
                url += `&prod${i}=${q}`
            }
            //Otherwise, add to total sold, and subtract from available
            else{
               
                soldArray[i] = Number(q);
                
                //Add argument to url
                url += `&prod${i}=${q}`
            }
            
            
        }
        //If the validate quantity string has stuff in it, set valid to false
         else {
            
            valid = false;
            url += `&prod${i}=${q}`
        }
        //Check if no products were bought, set valid to false if so
        if(url == `&prod0=0&prod1=0&prod2=0&prod3=0&prod4=0&prod5=0`){
            valid = false
        }
    }
    //If its false, return to the store with error=true
    if(valid == false)
    {
       
        response.redirect(`products_display.html?error=true`);
        
        
    }
    //Otherwise, redirect to the invoice with the url attached
    else{

         for (i in qtys)
        {
            //It will update total and qty only if everything is good
            products[i]['total_sold'] += soldArray[i];
            products[i]['qty_available'] -= soldArray[i];
        }
        
        response.redirect('login.html?' + url);
        
    }
 });

//Route all other GET requests to serve static files from a directory named "public"

app.all('*', function (request, response, next) {
    //console.log(request.method + ' to ' + request.path);
    next();
 });

//Start the server; listen on port 8080 for incoming HTTP requests
app.listen(8080, () => console.log(`listening on port 8080`));

//Function to validate the quantity, returns a string if not a number, negative, not an integer, or a combination of both
//If no errors in quantity, returns empty string
function validateQuantity(quantity){
    //console.log(quantity);
    if(isNaN(quantity)){
        return "Not a Number";
    }else if (quantity<0 && !Number.isInteger(quantity)){
        return "Negative Inventory & Not an Integer";
    }else if (quantity <0){
        return "Negative Inventory";
    }else if(!Number.isInteger(quantity)){
        return "Not an Integer";
    }else{
        return"";
    }

}

//=Assignment 2 Shenanigans=\\

// Declare a variable to store user data
let user_data;

// Import the 'fs' module for file system operations
const fs = require('fs');

// Define the file path of the JSON file containing user data
const filename= __dirname + '/user_data.json';

// Check if the file exists
if (fs.existsSync(filename)){
    // If the file exists, read its contents
    let data = fs.readFileSync(filename, 'utf8');
    // Parse the JSON data into a JavaScript object
    user_data = JSON.parse(data);
    // Log the user data to the console
    console.log(user_data);
} else {
    // If the file does not exist, log an error message
    console.log(`${filename} does not exist`);
    // Initialize the user_data variable as an empty object
    user_data = {};
}

// Declare a temporary variable to store user inputs
let temp_user = {}; // temp storage for user inputs to be passed along

/*
for (let i in products){
    products.forEach((prod, i) => {prod.qty_sold = 0});
}
*/                         

//=App Post Login Form=\\
// This code block handles a POST request to the '/process_login' endpoint of the app.
app.post('/process_login', (request, response) => {
    // Retrieve the data from the request body
    let POST = request.body;
    let entered_email = POST['email'].toLowerCase();
    let entered_password = POST['password'];

    // Check if the entered email and password are empty
    if (entered_email.length == 0 && entered_password.length == 0) {
        // Set an error message indicating that the email and password should be entered
        request.query.loginError = 'Please enter email and password';
        response.redirect(`./login.html?${qs.stringify(request.query)}`);
        return;
    }

    //If the entered email exists in the user_data object
    if (user_data[entered_email]) {
        //Extract the stored password and salt from the stored password string
        const [storedSalt, storedHash] = user_data[entered_email].password.split(':');

        //Utilize the provided password and stored salt to generate a hash using the SHA-256 algorithm
        const enteredHash = crypto.pbkdf2Sync(entered_password, storedSalt, 10000, 512, 'sha256').toString('hex');
        //Check if the entered hash matches the stored hash
        if (enteredHash === storedHash) {
            //If the password is correct it will then create a temporary user object with the entered email and name
            temp_user['email'] = entered_email;
            temp_user['name'] = user_data[entered_email].name;

            //Log the temporary user object
            console.log(temp_user);

            //Redirect the user to the invoice page, appending a query parameter to signal success and including temporary user information
            let params = new URLSearchParams(temp_user);
            console.log(params);
            response.redirect('./invoice.html?valid&' + url + `${params.toString()}`);
            return;
        } else {
            //If the entered password is incorrect
            request.query.loginError = 'Incorrect password';
        }
    } else {
        //If the entered email does not exist in the user_data object
        request.query.loginError = 'Incorrect email';
    }

    //Set the entered email as a query parameter in the request
    request.query.email = entered_email;
    //Create a URLSearchParams object with the request query parameters
    let params = new URLSearchParams(request.query);
    //Direct the user back to the login page, incorporating query parameters to signify the login error and retain the entered email information
    response.redirect(`./login.html?${params.toString()}`);
});


//=App Post Continue Shopping=\\
//This code block handles a POST request to the '/continue_shopping' endpoint of the app.

app.post("/continue_shopping", function (request, response) {
    //Create a new URLSearchParams object with the 'temp_user' parameter.
    let params = new URLSearchParams(temp_user);

    //Direct the response to the '/products_display.html' endpoint, incorporating the query parameters from the 'params' object.
    response.redirect(`/products_display.html?${params.toString()}`);
})

//=App Post Purchase Logout=\\
app.post("/purchase_logout", function (request, response) {
    //Loop through each product in the products array
    for (let i in products) {
        //Increase the quantity sold for the current product by the specified number in the 'temp_user' object
        products[i].qty_sold += Number(temp_user[`qty${[i]}`]);
        //Reduce the available quantity of the current product by the specified number in the 'temp_user' object
        products[i].qty_available = products[i].qty_available - Number(temp_user[`qty${[i]}`]);
    }

    //Write the updated products array to the products.json file
    fs.writeFile(__dirname + '/products.json', JSON.stringify(products), 'utf-8', (error) => {
        if (error) {
            //In case of an error during file writing, log the error message
            console.log('error updating products', error);
        } else {
            //Upon successful file writing, log a message indicating success
            console.log('File written successfully. Products are updated.');
        }
    });

    //Delete the 'email' and 'name' properties from the 'temp_user' object
    delete temp_user['email'];
    delete temp_user['name'];

    //Redirect the user to the products_display.html page
    response.redirect('./products_display.html');
})

//=App Post Register Form=\\
//Declare registration errors
let registration_errors = {};

app.post("/process_register", function (request, response) {
    //Get user's input from form
    let reg_name = request.body.name;
    let reg_email = request.body.email.toLowerCase();
    let reg_password = request.body.password;
    let reg_confirm_password = request.body.confirm_password;

    //Validate Password
    validateConfirmPassword(reg_password, reg_confirm_password);
    validatePassword(reg_password);
    //Validate Email to see if it's only letters and "@"  "." and domain names
    validateEmail(reg_email);
    //Validate Name to see if it's only letters
    validateName(reg_name);


    //Server Response to check if there are no errors
    if (Object.keys(registration_errors).length == 0) {
        const encryptedPassword = encryptPassword(reg_password);
        user_data[reg_email] = {};
        user_data[reg_email].name = reg_name;
        user_data[reg_email].password = encryptedPassword;
        
        //Write the updated user_data object to the user_data.json file
        fs.writeFile(__dirname + '/user_data.json', JSON.stringify(user_data), 'utf-8', (error) => {
            if (error) {
                //In the event of an error during file writing, log the corresponding error message
                console.log('error updating user_data', error);
            } else {
                //If the file is written successfully, log a success message
                console.log('File written successfully. User data is updated.');

            //Add user's info to temp_user
            temp_user['name'] = reg_name;
            temp_user['email'] = reg_email;

            //console log temp_user
            console.log(temp_user);
            console.log(user_data);

            let params = new URLSearchParams(temp_user);
            response.redirect('./invoice.html?regSuccess&valid&' + url + `${params.toString()}`);
            }
        });
            
        
    }else { //If there could be errors
        delete request.body.password;
        delete request.body.confirm_password;

        let params = new URLSearchParams(request.body);
        response.redirect(`/register.html?${params.toString()}&${qs.stringify(registration_errors)}`);
    }
});
function validateConfirmPassword(password, confirm_password) {
    delete registration_errors['confirm_password_type'];
    console.log(registration_errors);

    if (confirm_password !== password) {
        registration_errors ['confirm_password_type'] = 'Passwords do not match';
    }
}

//Encrypt Password Function
function encryptPassword(password) {
    //Generate a random salt for each user
    const salt = crypto.randomBytes(16).toString('hex');
    //Employ the password and salt to generate a hash utilizing the SHA-256 algorithm
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 512, 'sha256').toString('hex');
    //Store both the salt and hash in the database
    return `${salt}:${hash}`;
}

//Validate Password Function
function validatePassword(password) {
    if (password.length < 10 || password.length > 16) {
        registration_errors.password_error = "Password must be between 10 and 16 characters.";
    } else if (/\s/.test(password)) {
        registration_errors.password_error = "Password must not contain spaces.";
    }
    //Incorporate additional password validation rules as required in the section below if need be
}


//Validate Email Function
function validateEmail(email) {
    //Implement basic email validation using a regular expression
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        registration_errors.email_error = "Invalid email format.";
    }
}

//Validate Name
function validateName(name) {
    //Basic name validation using a regular expression
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(name)) {
        registration_errors.name_error = "Invalid name format.";
    }
}