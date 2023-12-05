//Aaron Kim
//This sets up the params from headder, order array, error value
let params = (new URL(document.location)).searchParams;
let error;
let order = [];

//This is if there was an error prior
error = params.get('error');

//Fill order array with item ammounts from previous attempts
params.forEach((value,key) => {
    if (key.startsWith('prod')) {
            order.push(parseInt(value));
        }
});


//If there is an error submitted, then it shows the error text 
if(error == 'true'){
    
    document.getElementById('errorDiv').innerHTML += `<h3 class="text-danger">Please enter a valid quantity!</h3><br>`;
}

//Displays product image in loop with bootstrap 4 elements
for (let i = 0; i < products.length; i++) {
    document.querySelector('.row').innerHTML += 
        `<div class="col-md-4 product_name mb-2">
        <div class="name">
            <div class="text-center">
                <img src="${products[i].image}" class="name-img" alt="Product Image">
            </div>
            <div class="name-body">
                <h5 class="name-title">${products[i].name}</h5>
                <p class="name-text">
                    Price: $${(products[i].price).toFixed(2)}<br>
                    In Stock: ${products[i].qty_available}<br>
                    Total Sold: ${products[i].total_sold}
                </p>
                
                <input type="text" placeholder="0" name="quantity_textbox" id="${[i]}" class="form-control mb-2" oninput="validateQuantity(this)" value="${order[i] !== 0 && order[i] !== undefined ? order[i] : ''}" onload="validateQuantity(this)">
                <p id="invalidQuantity${[i]}" class="text-danger"></p>
                </div>
            </div>
        </div>`
        validateQuantity(document.getElementById(`${[i]}`));
 ;}

//Runs to generate the validation message
    function validateQuantity(quantity){
        //Set variables, and grab number from the quantity and set it to an number
        let valMessage = '';
        let quantityNumber = Number(quantity.value);
        //console.log(Number.isInteger(quantityNumber));
        document.getElementById(`invalidQuantity${quantity.id}`).innerHTML = "validationMessage";
        //console.log(products[quantity.id]['qty_available']);
        //This gets validation message if not a number, negative, not an integer, or if there is not enough items in stock
        //Else empty string 
        if(isNaN(quantityNumber)){
            valMessage = "Please Enter a Number";
        }else if (quantityNumber<0 && !Number.isInteger(quantityNumber)){
            valMessage = "Please Enter a Positive Integer";
        }else if (quantityNumber <0){
            valMessage = "Please Enter a Positive Value";
        }else if(!Number.isInteger(quantityNumber)){
            valMessage = "Please Enter an Integer";
        }else if(quantityNumber > products[quantity.id]['qty_available']){
            valMessage = "Not Enough Items in Stock";
        }
        else{
            valMessage = '';
        }
        //Lets the valMessage to the innerHTML to the section
        document.getElementById(`invalidQuantity${quantity.id}`).innerHTML = valMessage;
        //console.log(products[quantity.id])
    }