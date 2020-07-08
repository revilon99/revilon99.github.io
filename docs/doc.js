/*
doc.js
Oliver Cass (c) 2020
All Rights Reserved

The fundamental javascript file that loads all
the content of the doc.

The purpose of the multiple index files is to
have a nice looking url.

The file should be the same for all the places,
which means that any changes should be changed on all
but that is obviously a faff.
Although it shouldn't be changed ever, since all the content
is loaded via this javascript.
*/

window.onload = function(){
    document.head.innerHTML += '<link href="https://fonts.googleapis.com/css2?family=Open+Sans&display=swap" rel="stylesheet">';
    document.head.innerHTML += '<meta name="viewport" content="width=device-width, initial-scale=1"/>';

    var xmlhttp = new XMLHttpRequest();
    var url = "manifest.json";

    xmlhttp.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            var manifest = JSON.parse(this.responseText);
            loadManifest(manifest);
        }
    }
    xmlhttp.open('GET', url, true);
    xmlhttp.send();
}

var footer = `
<div id="footer">
<a href="/docs/">Oli Cass's Guide To</a> |
Oliver Cass (c) 2020 |
All Rights Reserved
</div>
`;

function loadManifest(manifest){
    document.body.innerHTML = `
        <h1 onclick="location.href = '/docs'">Oli Cass's Guide To:</h1>
        <div id="header">
            <h2>${manifest.title}</h2>
            <p>${manifest.description}</p>
        </div>
    `;

    var search = location.search;
    
    var page;
    for(var p of manifest.pages){
        if(search.substring(1) === p.name) page = p;
    }
    if(page == null) page = manifest.pages[0];

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            document.body.innerHTML += this.responseText;
            document.body.innerHTML += footer;
            checkDocument();
        }
    }
    xmlhttp.open('GET', page.filename, true);
    xmlhttp.send();
    
    if(manifest.pages.length > 1)  document.title = page.title + " - " + manifest.title + " - Oli Cass's Guide";
    else document.title = manifest.title + " - Oli Cass's Guide";
}

function checkDocument(){
    var ocass = document.querySelectorAll('ocass');
    for(var i = 0; i < ocass.length; i++) loadOcass(ocass[i]);

    var eq = document.querySelectorAll('eq');
    for(var i = 0; i < eq.length; i++) loadEq(eq[i], i + 1);
}

var ocasses = {};

function loadOcass(ocass){
    var script = document.createElement('script');

    script.innerHTML = `ocasses['${ocass.id}'] = new (function (){

var canvas = document.createElement('canvas');
var ctx = canvas.getContext('2d');

var eles = document.createElement('div');

canvas.width  = ${ocass.getAttribute('width')};
canvas.height = ${ocass.getAttribute('height')};

`;

    if(ocass.getAttribute('js')){
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function(){
            if(this.readyState == 4 && this.status == 200){
                script.innerHTML += this.responseText;
                script.innerHTML += `
document.getElementById('${ocass.id}').appendChild(canvas);
document.getElementById('${ocass.id}').appendChild(eles);
})();`;
                
                ocass.innerHTML = "";
                ocass.appendChild(script);

                var ranges = ocass.querySelectorAll('input[type="range"]');
                for(var r of ranges){
                    r.addEventListener('input', function(e){
                        var updateFunc = e.target.getAttribute('update');
                        console.log(updateFunc);
                        console.log(ocass.id)
                        ocasses[ocass.id][updateFunc](e.target.value);
                    }, false);
                }
            }
        }
        xmlhttp.open('GET', ocass.getAttribute('js'), true);
        xmlhttp.send();
    }
}

function loadEq(eq, i){
    var formula = eq.innerHTML;
    eq.innerHTML = `
        <a class="eq">${formula}</a> <a class="eqnum">(${i})</a>
    `
}