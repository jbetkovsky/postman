// Global variables
pm.globals.set("myvar", "test123");
pm.globals.unset("myvar");
pm.globals.clear();

// Environment variables
pm.environment.set("myvar", "test123");
pm.environment.unset("myvar");
pm.environment.clear();

// Variables
pm.variables.set("myvar", "test123");
pm.variables.unset("myvar");
pm.variables.clear();

// Postman response
var jsonData = pm.response.json();
var textData = pm.response.text();
var responseTime = pm.response.responseTime;
var responseCode = pm.response.code;

// equals
pm.test("Something equals something", function () {
    pm.expect("test123").to.eql("test123");
});

// includes
pm.test("Text contains/includes text", function () {
    pm.expect("test123").to.include("123");
});

// not include
pm.test("Text does not contain/include text", function () {
    pm.expect("test123").to.not.include("456");
});

// one of 
pm.test("Value is one of Array", function () {
    pm.expect(2).to.be.oneOf([1, 2, 3]);
});

// expect true
pm.test("Result is true", function() {
    pm.expect(5>1).to.be.true;
});

// response code
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Successful POST request", function () {
    pm.expect(pm.response.code).to.be.oneOf([201,202]);
});

pm.test("Status code name has string", function () {
    pm.response.to.have.status("Created");
});

// response header
pm.test("Content-Type is present", function () {
    pm.response.to.have.header("Content-Type");
}); 

// response body
pm.test("Body is present", function () {
    pm.response.to.have.body();
});

pm.test("Body is correct", function () {
    pm.response.to.have.body("response_body_string");
});

// response time
pm.test("Response time is less than 200ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(200);
});

/*******************************************/
// If responseCode equals expectedCode, then...
// logic to run only if the response code matches the expected code
/*******************************************/
var responseCode = pm.response.code;
var expectedCode = 200;

if(responseCode === expectedCode) {
    // your logic here
} else {
    // your logic here
}

/*******************************************/
// testBodyContainsStringxTimes
// test that the response body contains a specific string, 'x' number of times
// example: response body must contain the word 'token' exactly 3 times
/*******************************************/
var responseText = pm.response.text();

// function to get a regex expression that is based on 'str', adding a global flag
function getRegex(str) {
    var newRgx = new RegExp(str, 'g');
    return newRgx;
}

// function containing the test (expect true)
function testBodyContainsStringxTimes(str, times) {
    var message = "Body contains " + times + " " + str;
    pm.test(message, function() {
        var count = (responseText.match(getRegex(str))).length;
        pm.expect(count == times).to.be.true;
    });
}

// finally, call the function with the string and the number of times
testBodyContainsStringxTimes('token', 3);

/*******************************************/
// testBodyDoesNotContainsString
// test that the response body does NOT contain a specific string
// example: response body must NOT have the string 'error' anywhere
/*******************************************/
var responseText = pm.response.text();

// function containing the test
function testBodyDoesNotContainsString(str) {
    pm.test("Body does not contain " + str, function () {
        pm.expect(responseText).to.not.include(str);
    });
}

// call the function with the appropriate params
testBodyDoesNotContainsString('error');

/*******************************************/
// 2-requests test
// sometimes you want to save the result of a response and use it in the next request
// example: if RQ 1 is successful, it will return a total amount of $200. Save the amount.
//      In RQ 2, the same amount will have a discount of $5. The test is to compare these two.
/*******************************************/

// RQ 1 -
var responseCode = pm.response.code;
var expectedCode = 200;
var amountGlobalName = "amount1";
var responseCodeGlobalName = "responseCode1";

// Check status code to get a failure if the code is not 200
pm.test("Status code is " + responseCode, function () {
    pm.response.to.have.status(expectedCode);
});

// Save the response code to use in the second RQ
pm.globals.set(responseCodeGlobalName, responseCode);

// Save the amount only if the status code was 200
if (responseCode === expectedCode) {
    var jsonData = pm.response.json();
    var amount = jsonData.Amount;

    pm.globals.set(amountGlobalName, amount);
}

// RQ 2 -
var responseCode = pm.response.code;
var expectedCode = 200;
var amountGlobalName = "amount1";
var responseCodeGlobalName = "responseCode1";

// Get the response code from the first RS
var responseCode1 = pm.globals.get(responseCodeGlobalName);

// Check status code to get a failure if the code is not 200
pm.test("Status code is " + responseCode, function () {
    pm.response.to.have.status(expectedCode);
});

// Compare the amounts only if the status code OF BOTH RS was 200
if (responseCode === expectedCode && responseCode1 === expectedCode) {
    var jsonData = pm.response.json();
    var amount1 = pm.globals.get(amountGlobalName); // This returns a string
    var amount2 = jsonData.Amount;
    
    // Need to transform 'amount1' to Number (from string)
    // In this RS we're expecting $5 less from 'amount1' (full amount)
    var expectedResult = Number(amount1) - 5; 
    
    pm.test('The discount is correct', function() {
        pm.expect(expectedResult === amount2).to.be.true;
    });
}