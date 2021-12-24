var projects = [
    {
        "name": "Pong",
        "id": "pong"
    },
    {
        "name": "Boids",
        "id": "boids"
    },
    {
        "name": "Verlet",
        "id": "verlet"
    },
    {
        "name": "Boids VR",
        "id": "boidsVR",
        "altLink": "ocean-demo.html"
    },
    {
        "name": "Ants",
        "id": "ants"
    },
    {
        "name": "Pong w/ Music",
        "id": "pong-music"
    }
];

function load_projects(){
    for(let p of projects){
        let link = p.id;
        if(p.altLink) link += "/" + p.altLink
        document.getElementById("projects").innerHTML += `
            <div class="project" id="${p.id}" title="${p.name}" onclick="window.open('/${link}', '_blank').focus();">
                <div>
                    <img src="/${p.id}/logo.png">
                </div>
                <a>${p.name}</a>
            </div>
        `
    }
}
