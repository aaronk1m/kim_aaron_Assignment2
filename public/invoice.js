//Aaron Kim
//This set of code initilizaies the variables
let extendedPrices = [];
let extendedPrice = 0;
let subtotal = 0;
let taxAmount = 0;
let shipping = 0;

//This opens up the URL params
let params = (new URL(document.location)).searchParams;
        //This initializes empty order array
        let order = [];
        //For each prod, this will push the value to the array
        params.forEach((value,key) => {
            if (key.startsWith('prod')) {
                    order.push(parseInt(value));
                }
        });

        console.log(params.get('name'));

//This generates all the item rows
generateItemRows();

//This calculates subtotal/tax

 let tax = (subtotal*0.0575);

//Checks the shipping price
if(subtotal <= 50)
{
    shipping = 2;
}else if(subtotal <=100)
{
    shipping = 5;
}
else{
    shipping = subtotal*.05;
}

//This will calculate the total
let total = tax+subtotal+shipping;

//Inserts footer row values
document.getElementById("subtotal_cell").innerHTML = "$" + subtotal.toFixed(2);
document.getElementById("tax_cell").innerHTML = "$" + tax.toFixed(2);
document.getElementById("shipping_cell").innerHTML = "$"+shipping.toFixed(2);
document.getElementById("total_cell").innerHTML = "$"+total.toFixed(2);
document.getElementById("invoicename").innerHTML = "Thank you for ordering, " + params.get('name') + "!";

//Validates the quantity, returns a string if not a number, negative, not an integer, or combination of both
//If no errors in quantity, returns empty string
function validateQuantity(quantity){
    if(isNaN(quantity)){
        return "Please Enter a Number";
    }else if (quantity<0 && !Number.isInteger(quantity)){
        return "Please Enter a Positive Integer";
    }else if (quantity <0){
        return "Please Enter a Positive Number";
    }else if(!Number.isInteger(quantity)){
        return "Please Enter an Integer";
    }else{
        return"";
    }

}
//Generate all the item rows
function generateItemRows(){

//This sets table to the invoice table on the invoice.html
let table = document.getElementById("invoiceTable");

//Checks if it has errors
//Set to false for now
let hasErrors = false; 

//For each member of the array
for(let i=0;i<products.length;i++){
        
        //Sets item and itemQuantity from the products array, and the array gotten from the url
        let item = products[i];
        let itemQuantity = order[i];
        
        //Validate the quantity, we are just kinda looking for if its negative so we dont show it
        let validationMessage = validateQuantity(itemQuantity);
        
        //If there is an error, just ignore this 
        if(validationMessage !== ""){
            hasErrors = true;
            let row =table.insertRow();
            row.insertCell(0).insertHTML = item.name;
            row.insertCell(1).innerHTML = validationMessage;
        } 
        //Otherwise, lets create the row in the invoice and update the extended price and subtotal
        else if(itemQuantity >0){
            //This updates the variables
            extendedPrice = item.price * itemQuantity;
            subtotal += extendedPrice;

            //Creates a new row and insert the info
            let row = table.insertRow();


            row.insertCell(0).innerHTML = `<img src="${item.image}" class="img-invoice" name = "img">`;
            row.insertCell(1).innerHTML = item.name;
            row.insertCell(2).innerHTML = itemQuantity;
            row.insertCell(3).innerHTML = "$" + item.price.toFixed(2);
            row.insertCell(4).innerHTML = "$"+extendedPrice.toFixed(2);


        }

    }

}