/*
index.js
Oliver Cass (c) 2020
All Rights Reserved
*/

var docs = document.getElementById('docs');

window.onload = function(){
    var xmlhttp = new XMLHttpRequest();
    var url = "manifest.json";

    xmlhttp.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            var list = JSON.parse(this.responseText);
            loadManifests(list);
        }
    }
    xmlhttp.open('GET', url, true);
    xmlhttp.send();
}

function loadManifests(list){
    for(var i = 0; i < list.length; i++){
        var xmlhttp = new XMLHttpRequest();
        var url = list[i] + "/manifest.json";

        xmlhttp.onreadystatechange = function(){
            if(this.readyState == 4 && this.status == 200){
                var manifest = JSON.parse(this.responseText);
                addDoc(manifest);
            }
        }
        xmlhttp.open('GET', url, true);
        xmlhttp.send();
    }
}

function addDoc(manifest){
    docs.innerHTML += `
        <div title="${manifest.title}" class="doc" onclick="location.href='/docs/${manifest.name}'">
            <h2>${manifest.title}</h2>
            <p>${manifest.description}</p>
            <div id="${manifest.name}-pages"></div>
        </div>
    `;
    if(manifest.pages.length > 1){
        var pages = document.getElementById(manifest.name + "-pages");
        for(var i = 0; i < manifest.pages.length; i++){
            pages.innerHTML += `
                <a title="${manifest.pages[i].title}" href="/docs/${manifest.name}?${manifest.pages[i].name}">${manifest.pages[i].title}</a>
            `;

            if(i < manifest.pages.length - 1) pages.innerHTML += " | ";
        }
    }
}