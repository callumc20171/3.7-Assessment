//Flags

const DAYS_ADD = 0;
const DAYS_SUBTRACT = 1;
const CHECK_PICKUP = 0;
const CHECK_RETURN = 1;

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
	updateBooking();
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


//End step by step form JS


function dateChecker(flag) {
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
			console.log(checkInDate);
			PickUpDateInput.value = stringifyDate(checkInDate);
			return true;
		} return false;
	} else {
		console.log("Unknown flag in dateChecker: " + flag);
		return false;
	}
  
}

function calcDays(date, days, flag) {
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

  var day = ("0" + date.getDate()).slice(-2);
  var month = ("0" + (date.getMonth() + 1)).slice(-2);

  var stringDate = date.getFullYear()+"-"+(month)+"-"+(day);
  return stringDate;
}

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
  var price = 0;
  for (let extra of extras) {
  		price += Number(extra.dataset.price);
  }
  return price;
}

function calculateCost(carPrice, days) {
	let bookingFee = 50;
	let insuranceFee = 20;
	return Number(Number(carPrice) * days) + bookingFee + insuranceFee;
}

function updateBooking() {
	var selectedCar = document.querySelector(".car[selected]").dataset;
	var extras = document.querySelectorAll(".extrasCheckbox:checked");
	Extras.innerHTML = "Extras: "
	var extrasArray = [];
	if (extras !== null) {
		var extrasPrice = calculateExtrasCost(extras);
		for (let e of extras) {
			extrasArray.push(e.value);
		}
		Extras.innerHTML += extrasArray.join(", ");
	} else {
		Extras.innerHTML += "No extras"
	}
	var pickUpDate = PickUpDateInput.value;
	var rentalDays = RentalDays.value;
	var returnDate = ReturnDateInput.value;
	var cost = calculateCost(selectedCar.price, rentalDays);
	var extraComments = ExtraDetail.value;

	PickUpLabel.innerHTML = "Pick up date: " + pickUpDate;
	ReturnLabel.innerHTML = "Return date: " + returnDate;
	SelectedCar.innerHTML = "Car: " + selectedCar.car;
	Price.innerHTML = "Final price: " + cost + "$";
}

	
//Car select JS

//todo add loading animation
//todo add car slideshow

function selectCar(car, card) {
	CarLoader.style.display = "grid";
	CarDetailsDiv.style.display = "none";
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

selectCar("toyota estima",
 document.getElementsByClassName("car")[0])

