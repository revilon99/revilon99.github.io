/*
RigPlanner/index.js
*/

let today;
const backWeeks = 52;
const forwardWeeks = 52;
const daysInWeek = 7;

let calendar;

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const britishDays = [1, 2, 3, 4, 5, 6, 0];

function init(){
    setTimeout(function(){window.scrollTo(0, 9050);}, 100);
    today = new Date();
    calendar = document.getElementById("calendar");

    let start = false;

    for(let i = -backWeeks; i < forwardWeeks; i++){
        let j = 0;
        let monday = getMonday(new Date());
        for(let j = 0; j < daysInWeek; j++){
            let newDate = new Date(monday.getTime() + i*daysInWeek*24*3600*1000 + j*24*3600*1000);
            let classes = "";
            if(datesAreOnSameDay(today, newDate)) classes += " today";
            if(newDate.getDay() == 0 || newDate.getDay() == 6) classes += " weekend";

            if(newDate.getDate() == 1){
                start = true;
                calendar.innerHTML += `<div class='monthBreak'>${months[newDate.getMonth()]} ${newDate.getFullYear()}</div>`;
                for(let x = j - 1; x >= 0 && newDate.getDay() != 1; x--) {
                    calendar.innerHTML += `
                        <div class="date blank"></div>
                    `
                }
            }

            if(start) calendar.innerHTML += `
                <div class="date${classes}" id="${String(newDate.getDate()).padStart(2, '0')}/${String(newDate.getMonth() + 1).padStart(2, '0')}/${newDate.getFullYear()}">
                    <a>${newDate.getDate()}</a>
                </div>
            `;
        }
    }

    let todayString = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;


}

function getMonday(d) {
  d = new Date(d);
  var day = d.getDay(),
      diff = d.getDate() - day + (day == 0 ? -6:1);
  return new Date(d.setDate(diff));
}

const datesAreOnSameDay = (first, second) =>
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate();


class Job{
    constructor(name, type, start, end){
        this.name = name;
        this.type = type;
        this.start = start;
        this.end = end;
    }
}

function addJob(){
    document.getElementById('jobBuilder').style.display = "";
}

document.getElementById("jobType").addEventListener('change', function(e){
    switch(e.target.value){
        case "Hot Soak":
        case "Cold Soak":
        case "Thermal Cycle":
        case "Salt Corrosion":
            document.getElementById('jobCyclesContainer').style.display = "none";
            document.getElementById('jobTimeContainer').style.display = "";
        break;
        case "Pressure Pulse":
            document.getElementById('jobCyclesContainer').style.display = "";
            document.getElementById('jobTimeContainer').style.display = "none";
        break;
        default:
            document.getElementById('jobCyclesContainer').style.display = "none";
            document.getElementById('jobTimeContainer').style.display = "none";
    }
}, false);
