//Flags

const DAYS_ADD = 0; //Add days to JS Date
const DAYS_SUBTRACT = 1; //Subtract days from JS Date
const CHECK_PICKUP = 0; //Checks the pickup value
const CHECK_RETURN = 1; //Checks the return value

database = firebase.database() //Set up firebase

//Step by step form JS

var currentTab = 0; // Current tab is set to be the first tab (0)
showTab(currentTab); // Display the current tab

function showTab(n) {
	// This function will display the specified tab of the form ...
	var x = document.getElementsByClassName("tab");
	x[n].style.display = "block";
	// ... and fix the Previous/Next buttons:
	if (n == 0) {
	document.getElementById("prevBtn").style.display = "none";
	} else {
	document.getElementById("prevBtn").style.display = "inline";
	}
	if (n == (x.length - 1)) {
	document.getElementById("nextBtn").innerHTML = "Submit";
	} else {
	document.getElementById("nextBtn").innerHTML = "Next";
	}
	// ... and run a function that displays the correct step indicator:
	fixStepIndicator(n)
}

function nextPrev(n) {
	updateBooking(); //Booking is updated on every attemptedpage change
  // This function will figure out which tab to display
	var x = document.getElementsByClassName("tab");
	// Exit the function if any field in the current tab is invalid:
	if (n == 1 && !validateForm()) return false;
	// Hide the current tab:
	x[currentTab].style.display = "none";
	// Increase or decrease the current tab by 1:
	currentTab = currentTab + n;
	// if you have reached the end of the form... :
	if (currentTab >= x.length) {
		generateTicket(Math.round(Math.random() * 10000000));
	//...the form gets submitted:
	}
	// Otherwise, display the correct tab:
	showTab(currentTab);
}

function validateForm() {
	// This function deals with validation of the form fields
	var x, y, i, valid = true;
	x = document.getElementsByClassName("tab");
	y = x[currentTab].getElementsByTagName("input");
	// A loop that checks every input field in the current tab:
	for (i = 0; i < y.length; i++) {
	// If a field is empty...
	if (y[i].value == "") {
	  // add an "invalid" class to the field:
	  y[i].className += " invalid";
	  // and set the current valid status to false:
	  valid = false;
	}

	if (!y[i].validity.valid) {
	  valid = false;
	}
	}
	// If the valid status is true, mark the step as finished and valid:
	if (valid) {
		document.getElementsByClassName("step")[currentTab].className += " finish";
	} else {
		ErrorDiv.style.display = "block";
		StepForm.style.marginTop = "12px";
		setTimeout(function () {
			ErrorDiv.style.display = "none";
			StepForm.style.marginTop = "4%";
		}, 3000);
	}
	return valid; // return the valid status
}

function fixStepIndicator(n) {
	// This function removes the "active" class of all steps...
	var i, x = document.getElementsByClassName("step");
	for (i = 0; i < x.length; i++) {
	x[i].className = x[i].className.replace(" active", "");
	}
	//... and adds the "active" class to the current step:
	x[n].className += " active";
}

//Car slideshow code

var slideIndex = 1;
showSlides(slideIndex);

// Next/previous controls
function plusSlides(n) {
  showSlides(slideIndex += n);
}

// Thumbnail image controls
function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {
  var i;
  var slides = document.getElementsByClassName("carSlide");
  var dots = document.getElementsByClassName("dot");
  if (n > slides.length) {slideIndex = 1}
  if (n < 1) {slideIndex = slides.length}
  for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";
  }
  for (i = 0; i < dots.length; i++) {
      dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndex-1].style.display = "block";
  dots[slideIndex-1].className += " active";
  eval(slides[slideIndex].dataset.for + ".onclick()");
}

//End step by step form JS


function dateChecker(flag) {
	//Flags defined at top of JS
	//If flag is for the pick up date function changes
	//the return date input value in accordance with the days selected
	//If flag is for return date the function changes the pickup input
	//Returns true if flag valid and input valid
	if (flag == CHECK_PICKUP) {
		if (PickUpDateInput.value != "") {
		  let checkOutDate = calcDays(new Date(PickUpDateInput.value),
		   RentalDays.value, DAYS_ADD);
		  ReturnDateInput.value = stringifyDate(checkOutDate);
		  return true;
		} return false;
	}
	if (flag == CHECK_RETURN) {
		if (ReturnDateInput.value != "") {
			let checkInDate = calcDays(new Date(ReturnDateInput.value),
			 RentalDays.value, DAYS_SUBTRACT);
			PickUpDateInput.value = stringifyDate(checkInDate);
			return true;
		} return false;
	} else { //If invalid flag
		console.log("Unknown flag in dateChecker: " + flag);
		return false;
	}
  
}

function calcDays(date, days, flag) {
	//Flags defined at top of JS
	//Function to add or subtract days to a JS Date class
	//Returns the JS date with the changed days
	var result = new Date(date);
	if (flag == DAYS_ADD) {  	
		result.setDate(result.getDate() + Number(days));
	} else if (flag == DAYS_SUBTRACT) {
		result.setDate(result.getDate() - Number(days));
	} else {
		console.log("Unknown flag in calcDays: " + flag);
	}
	return result;
}

function stringifyDate(date) {
	//Writes a JS date class into a string used for input values and booking summary
	var day = ("0" + date.getDate()).slice(-2);
	var month = ("0" + (date.getMonth() + 1)).slice(-2);

	var stringDate = date.getFullYear()+"-"+(month)+"-"+(day);
	return stringDate;
}

//Add event listeners to the date inputs
PickUpDateInput.min = stringifyDate(new Date());
PickUpDateInput.addEventListener("change", function() {
	dateChecker(CHECK_PICKUP)
});
ReturnDateInput.min = stringifyDate(new Date());
ReturnDateInput.addEventListener("change", function() {
	dateChecker(CHECK_RETURN);
});
RentalDays.addEventListener("change", function() {
	dateChecker(CHECK_PICKUP);
});

//Booking information updater

function calculateExtrasCost(extras) {
	//Runs through list of extras and adds the price to a running total
	//Returns the price of all extras
	//Works for any list with a dataset.price value that is a number
	var price = 0;
	for (let extra of extras) {
			price += Number(extra.dataset.price);
	}
	return price;
}

function calculateCost(carPrice, days) {
	//Adds the consts booking fee and insurance fee to the total cost
	let bookingFee = 50;
	let insuranceFee = 20;
	return Number(Number(carPrice) * days) + bookingFee + insuranceFee; //Total coast of everything added
}

function updateBooking() {
	//Updates the booking summary tab using the users information
	var selectedCar = document.querySelector(".car[selected]").dataset;
	var extras = document.querySelectorAll(".extrasCard[selected]");
	Extras.innerHTML = "Extras: "
	var extrasArray = []; //Updates the extras and adds them to an array
	if (extras.length != 0) {
		var extrasPrice = calculateExtrasCost(extras);
		for (let e of extras) {
			extrasArray.push(e.dataset.name);
		}
		Extras.innerHTML += extrasArray.join(", ");
	} else {
		Extras.innerHTML += "No extras"
	}

	//Values to be shown in booking summary
	var pickUpDate = PickUpDateInput.value;
	var rentalDays = RentalDays.value;
	var returnDate = ReturnDateInput.value;
	var cost = calculateCost(selectedCar.price, rentalDays);
	var extraComments = ExtraDetail.value;
	//Label update
	PickUpLabel.innerHTML = "Pick up date: " + pickUpDate;
	ReturnLabel.innerHTML = "Return date: " + returnDate;
	SelectedCar.innerHTML = "Car: " + selectedCar.car;
	Price.innerHTML = "Final price: " + cost + "$";
	//Returns JSON of booking info
	return {
		"PickUp" : pickUpDate,
		"Return" : returnDate,
		"RentedDays" : rentalDays,
		"cost" : cost,
		"extras" : extrasArray,
		"comments" : extraComments
	}

}

function pushToFirebase(ticket) {
	//Pushes the users booking to firebase with the given ticket

    var bookingInfo = updateBooking();

	//Personal info details
	bookingInfo.name = NameInput.value;
	bookingInfo.email = EmailInput.value;
	bookingInfo.phone = CellInput.value;
	bookingInfo.licenseNumber = DLNumber.value;
	bookingInfo.age = AgeInput.value;


    database.ref("bookings/" + ticket).set(bookingInfo);
    //Hide the form HTML
    TicketNo.innerHTML += ticket;
    PageContainer.style.display = "none";

    ConfirmOverlay.style.display = "block";
}

function generateTicket(ticket) {
	//Recursivvely generates a ticket that is not in use.
	let ticketRef = database.ref("Bookings/" + ticket);
	ticketRef.once('value', function(snapshot) { //Recursively generate unused ticket
	if (!snapshot.exists()) {
	  pushToFirebase(ticket);
	} else {
	  generateTicket(Math.round(Math.random() * 10000000));
	}
	});
}

	
//Car select JS

function selectExtra(extraDiv) {
	if (extraDiv.getAttribute("selected")) {
		extraDiv.removeAttribute("selected");
	} else {
		extraDiv.setAttribute("selected", true);
	}
}

//todo add car slideshow

function selectCar(car, card) {
	//Selects and deselects the users picked car based
	//Loads an animation while waiting for the database
	CarLoader.style.display = "grid";
	CarDetailsDiv.style.display = "none";
	//Retireve information from database
	database.ref("cars/"+car).once("value", function(snapshot) {
		CarInformation.innerHTML = snapshot.val().desc
		CarPrice.innerHTML = snapshot.val().price + "$/day<br>(" + Number(
			snapshot.val().price) * Number(RentalDays.value) + "$ total)";
		CarDetailsDiv.style.display = "grid";
		CarLoader.style.display = "none";
	});
	let selectedCars = document.querySelectorAll(".car[selected]");
	if (selectedCars < 1){

	} else {
		for (let c of selectedCars) {
			c.removeAttribute("selected");
		}
	}
	
	card.setAttribute("selected", "true");

}

function changeCarSelect(button) {
	//Returns true when changed to cards
	//Returns false when changed to slideshow
	if (button.value == "Slideshow") {
		CarCards.style.display = "none";
		CarSlideshow.style.display = "block";
		button.value = "Cards";
		return true;
	} else {
		CarSlideshow.style.display = "none";
		CarCards.style.display = "flex";
		button.value = "Slideshow";
		return false;
	}
}

//Default set car to avoid errors
selectCar("toyota estima",
 document.getElementsByClassName("car")[0])

