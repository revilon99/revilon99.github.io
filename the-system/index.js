const gscript = "https://script.google.com/macros/s/AKfycbz5Sj2NdF2f3JRNcoB9VBlnmAnd6gT0sTV3aLrP-vXQGNPVyANzwOG2xsUf_rnrjjLGaA/exec";

let canClose = false;

let output;
function handleInitData(output_){
    // Set Global Output Variable
    output = output_;

    // Reset Document
    document.getElementById('chefs').innerHTML = "";
    document.getElementById('lobby').innerHTML = "";
    document.getElementById('calendar').innerHTML = "";
    document.getElementById('mealplan').innerHTML = "";

    // Add First Option in Chef List
    document.getElementById('chefs').innerHTML += `<option value="0">Select a Chef...</option>`;

    output.summary.sort((a, b) => b.owed - a.owed); //Sort lobby by points

    let i = 1; //continue options from 1
    for(let m of output.summary){
        // Add System Member to Lobby
        document.getElementById('lobby').innerHTML += `
        <div onclick="personalProfile('${m.name}');" class="member">
        <a class="name">${m.name}</a>
        <a class="owed">${m.owed}</a>
        </div>`;

        // Add System Member to Chef Lift
        document.getElementById('chefs').innerHTML += `<option value="${i++}">${m.name}</option>`;
    }

    // Add Calendar
    let cal = output.calendar;
    cal.sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort Calendar By Date
    i = 0;
    for(let c of cal){
        // Add Date Element
        document.getElementById('calendar').innerHTML += `
        <div class="date box">
        <center>
        <a class="date">${c.date}</a>
        <a class="mealname">${c.name}</a>
        <a class="mealdescription">${c.description}</a>
        <a class="cooked">${c.cooked}</a>
        <div id="eatenList-${i}" class="eaten"></a>
        </center>
        </div>`

        // Add to Eaten List
        for(let e of c.eaten){
            document.getElementById("eatenList-" + i).innerHTML += `<a class="eaten">${e}</a>`;
        }
        i++;
    }

    // Add Meal Plan
    let plan = output.plan;
    for(let p of plan){
        document.getElementById('mealplan').innerHTML += `
        <div class="plan box">
        <center>
        <a class="date">${p.date}</a>
        <a class="cooked">${p.chef}</a>
        </center>
        </div>`;
    }

    // Make Content Visable
    document.getElementById('content').style.display = "block";
    document.getElementById('intro').style.display = "none";

    // Scroll to last meal in calendar
    document.getElementById('calendar').scrollLeft = 10000000;

    // Add 'Add Meal' Option
    document.getElementById('calendar').innerHTML += `<div class="date box" id="calendar-add"><a onclick="showAddMeal()">+</a></div>`;
}

window.onload = function(){
    loadInitData();

    // Set the 'date cooked' option in 'add meal' to today
    document.getElementById('date-cooked').valueAsDate = new Date();
}

function loadInitData(){
    // Hide content and show loading screen whilst content loads
    document.getElementById('content').style.display = "";
    document.getElementById('intro').style.display = "block";

    //Make HTTP Request to Google App Script
    var xmlhttp = new XMLHttpRequest();
    var url = gscript + "?initdata";

    xmlhttp.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            var initData = JSON.parse(this.responseText);
            handleInitData(initData);
        }
    }
    xmlhttp.open('GET', url, true);
    xmlhttp.send();
}

/*
    Meal Add Sequence Event Listeners
*/
function showAddMeal(){
    document.getElementById('add-new-meal').style.display = "initial";
    setTimeout(function(){
        canClose = "new-meal";
    }, 500);
}

document.getElementById('chefs').addEventListener('change', function(){
    if(document.getElementById('chefs').value > 0){
        document.getElementById('name-of-meal').style.display = "block";

        document.getElementById('ate-list').innerHTML = "";
        for(let i = 0; i < output.summary.length; i++){
            if(i == document.getElementById('chefs').value - 1) continue;
            document.getElementById('ate-list').innerHTML += `
            <label class="container">${output.summary[i].name}
            <input value="${output.summary[i].name}" name="eaten" type="checkbox">
            <span class="checkmark"></span>
            </label>`;
        }
    }
});

document.getElementById('meal-description').addEventListener('keydown', function(){
    document.getElementById('who-ate').style.display = "block";
});

document.getElementById("content").addEventListener('click', function(){
    if(canClose == "new-meal"){
        document.getElementById('add-new-meal').style.display = "";
        canClose = false;
    }else if(canClose == "pp"){
        document.getElementById('personal-profile').style.display = "none";
        canClose = false;
    }
});

function addMeal(){
    // Turn input data into object
    let m = {};
    m.date = document.getElementById('date-cooked').value;
    m.chef = output.summary[document.getElementById('chefs').value-1].name;
    m.name = document.getElementById('meal-name').value;
    m.description = document.getElementById('meal-description').value;
    m.eaten = [];

    let eatenElements = document.querySelectorAll('input[name=eaten]:checked');
    for(let e of eatenElements) m.eaten.push(e.value);

    // Turn meal object into GET request string
    var param = objectToGET("addmeal", m);

    //Send HTTP request to Google App Script
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            loadInitData();
            document.getElementById('add-new-meal').style.display = "";
            canClose = false;
        }
    }
    xmlhttp.open('GET', gscript + param, true);
    xmlhttp.send();
}

/*
    Personal Profile
*/

function personalProfile(name){
    if(canClose != false) return; // Only run if not showing anything

    // Calculate and Find Personal Data
    let mealsEaten = 0;
    let mealsCooked = 0;
    let mealsCookedTotal = 0;
    let mealsCookedData = [];

    for(let c of output.calendar){
        if(c.cooked == name) {
        mealsCooked++;
        mealsCookedData.push(c);
        mealsCookedTotal += c.eaten.length;
        }else for(let e of c.eaten) if(e == name) mealsEaten++;
    }

    // Update Personal Profile Calendar
    document.getElementById('pp-calendar').innerHTML = "";

    for(let c of mealsCookedData){
        document.getElementById('pp-calendar').innerHTML += `
        <div class="date box">
        <center>
        <a class="date">${c.date}</a>
        <a class="mealname">${c.name}</a>
        <a class="mealdescription">${c.description}</a>
        <div id="${c.date}-${c.name}-${name}" class="eaten"></a>
        </center>
        </div>`

        for(let e of c.eaten){
            document.getElementById(c.date + "-" + c.name + "-" + name).innerHTML += `<a class="eaten">${e}</a>`;
        }
    }

    // Update Personal Profile Info
    document.getElementById('pp-name').innerHTML = name;
    document.getElementById('pp-cooked').innerHTML = mealsCooked;
    document.getElementById('pp-eaten').innerHTML = mealsEaten;
    document.getElementById('pp-cooked-total').innerHTML = mealsCookedTotal;
    document.getElementById('pp-portions-per-meal').innerHTML = Math.round(100 * mealsCookedTotal / mealsCooked)/100;

    // Show Personal Profile Popup
    document.getElementById('personal-profile').style.display = "initial";

    // Set Personal Profile Calendar Scroll to 0
    document.getElementById('pp-calendar').scrollLeft = 0;

    // Allow to close popup after 0.5s
    setTimeout(function(){
        canClose = "pp";
    }, 500);
}

// Function that converts an Object to a GET string
function objectToGET(req, obj){
    var param ="?req=" + req;
    for(o in obj){
        if(Array.isArray(obj[o])){
            for(let e of obj[o]){
                param += "&" + o + "=" + e;
            }
        }else{
            param += "&" + o + "=" + obj[o];
        }
    }
    return param;
}
