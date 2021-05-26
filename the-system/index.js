const gscript = "https://script.google.com/macros/s/AKfycbz5Sj2NdF2f3JRNcoB9VBlnmAnd6gT0sTV3aLrP-vXQGNPVyANzwOG2xsUf_rnrjjLGaA/exec";

let output;
function handleInitData(output_){
    output = output_;
    var i = 1;
    document.getElementById('chefs').innerHTML = "";
    document.getElementById('lobby').innerHTML = "";
    document.getElementById('calendar').innerHTML = "";
    document.getElementById('mealplan').innerHTML = "";

    document.getElementById('chefs').innerHTML += `<option value="0">Select a Chef...</option>`;
    for(let m of output.summary){
        document.getElementById('lobby').innerHTML += `
        <div onclick="personalProfile('${m.name}');" class="member">
        <a class="name">${m.name}</a>
        <a class="owed">${m.owed}</a>
        </div>`;
        document.getElementById('chefs').innerHTML += `<option value="${i++}">${m.name}</option>`;
    }

    let cal = output.calendar;
    i = 0;
    for(let c of cal){
        document.getElementById('calendar').innerHTML += `
        <div class="date">
        <center>
        <a class="date">${c.date}</a>
        <a class="mealname">${c.name}</a>
        <a class="mealdescription">${c.description}</a>
        <a class="cooked">${c.cooked}</a>
        <div id="eatenList-${i}" class="eaten"></a>
        </center>
        </div>`

        for(let e of c.eaten){
            document.getElementById("eatenList-" + i).innerHTML += `<a class="eaten">${e}</a>`;
        }
        i++;
    }

    document.getElementById('calendar').scrollLeft = 10000000;

    document.getElementById('calendar').innerHTML += `<div class="date" id="calendar-add"><a onclick="showAddMeal()">+</a></div>`;

    let plan = output.plan;
    for(let p of plan){
        document.getElementById('mealplan').innerHTML += `
        <div class="plan">
        <center>
        <a class="date">${p.date}</a>
        <a class="cooked">${p.chef}</a>
        </center>
        </div>`;
    }
}

window.onload = function(){
    loadInitData();

    document.getElementById('date-cooked').valueAsDate = new Date();
}

function loadInitData(){
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

document.getElementById('chefs').addEventListener('change', function(){
    if(document.getElementById('chefs').value > 0){
        document.getElementById('name-of-meal').style.display = "initial";

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

document.getElementById('meal-description').addEventListener('change', function(){
    document.getElementById('who-ate').style.display = "initial";
});

document.getElementById("back").addEventListener('click', function(){
    if(canClose == "new-meal"){
        document.getElementById('add-new-meal').style.display = "";
        canClose = false;
    }else if(canClose == "pp"){
        document.getElementById('personal-profile').style.display = "none";
        canClose = false;
    }
});

let canClose = false;
function showAddMeal(){
    document.getElementById('add-new-meal').style.display = "initial";
    setTimeout(function(){
        canClose = "new-meal";
    }, 500);
}

function addMeal(){
    let m = {};
    m.date = document.getElementById('date-cooked').value;
    m.chef = output.summary[document.getElementById('chefs').value-1].name;
    m.name = document.getElementById('meal-name').value;
    m.description = document.getElementById('meal-description').value;
    m.eaten = [];

    let eatenElements = document.querySelectorAll('input[name=eaten]:checked');
    for(let e of eatenElements) m.eaten.push(e.value);

    var param = objectToGET("addmeal", m);
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

function personalProfile(name){
    if(canClose != false) return;
    document.getElementById('pp-name').innerHTML = name;

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

    document.getElementById('pp-calendar').innerHTML = "";

    for(let c of mealsCookedData){
        document.getElementById('pp-calendar').innerHTML += `
        <div class="date">
        <center>
        <a class="date">${c.date}</a>
        <a class="mealname">${c.name}</a>
        <a class="mealdescription">${c.description}</a>
        <a class="cooked">${c.cooked}</a>
        <div id="${c.date}-${c.name}-${name}" class="eaten"></a>
        </center>
        </div>`

        for(let e of c.eaten){
            document.getElementById(c.date + "-" + c.name + "-" + name).innerHTML += `<a class="eaten">${e}</a>`;
        }
    }

    document.getElementById('pp-cooked').innerHTML = mealsCooked;
    document.getElementById('pp-eaten').innerHTML = mealsEaten;
    document.getElementById('pp-cooked-total').innerHTML = mealsCookedTotal;
    document.getElementById('pp-portions-per-meal').innerHTML = Math.round(100 * mealsCookedTotal / mealsCooked)/100;

    document.getElementById('personal-profile').style.display = "initial";
    setTimeout(function(){
        canClose = "pp";
    }, 500);
}

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
