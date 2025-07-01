var xVel = 0;
var lastX = 0;

const xOffset = 9;
const yOffset = 2;

var justLoaded = true;

var selectedTab = "t-1";

window.addEventListener("load",function() {
    document.getElementById("open-adofai").addEventListener("click",function() {
        window.open("adofai-level-browser-legacy.html");
    });
    document.querySelectorAll(".expanding-hr").forEach((el)=>{
        // el.classList.add("start");
        el.style.animationName = "hr-expand";
    });
    const cur = document.querySelector(".cursor");
    setInterval(function() {
        if (xVel < 0) {
            xVel+=700;
            if (xVel > 0) {
                xVel = 0;
            }
        } else {
            xVel-=700;
            if (xVel < 0) {
                xVel = 0
            }
        }
        cur.style.rotate = xVel+"deg";
    },100);
    document.body.style.transition = "margin-top 1s ease, opacity 1s ease-out";
    document.body.style.marginTop = "8px";
    document.body.style.opacity = "100%";

    const tabbtns = this.document.querySelectorAll(".tabbtn");
    tabbtns.forEach((el)=>{
        if (el.id == selectedTab) {
            el.classList.add("selected");
            document.getElementById("tab."+selectedTab).style.display = "block";
        }
        el.addEventListener("click",function() {
            document.getElementById("tab."+selectedTab).style.display = "none";
            document.getElementById(selectedTab).classList.remove("selected");
            selectedTab = el.id;
            el.classList.add("selected");
            document.getElementById("tab."+selectedTab).style.display = "block";
            document.getElementById("tab."+selectedTab).style.animationName = "tabpage";
        });
    });

    var levelData = [];
    var levelTags = {};
    fetch("leveldata.csv").then().then((raw)=>{
        raw.text().then((text)=>{
            const heading = text.split("\n")[0].split(",");
            const data = text.split("\n").slice(1,-1); // Remember: newline @ EOF
            data.forEach((row)=>{
                var rowData = {};
                for (const [i, v] of row.split(",").entries()) {
                    if (heading[i] != "Tags") {
                        rowData[heading[i]] = v.replaceAll("$comma",",");
                    } else {
                        rowData[heading[i]] = v.replaceAll("$comma",",").split("|");
                        v.replaceAll("$comma",",").split("|").forEach((tag)=>{
                            if (levelTags[tag] == null) levelTags[tag] = {};
                        });
                    }
                };
                levelData.push(rowData);
            });
            const cardTemplate = document.getElementById("level-card-template");
            levelData.forEach((level)=>{
                const card = cardTemplate.cloneNode(true);
                const title = card.querySelector(".title");
                var titleText = level["Name"];
                title.title = titleText;
                title.textContent = titleText;
                const artist = card.querySelector(".subtext");
                var artistText = level["Artist"].replaceAll("|",", ");
                artist.title = artistText;
                artist.textContent = artistText;
                const icon = card.querySelector(".level-icon");
                var iconSrc = "assets/adofai-levels/"+level["Name"]+"-1.png";
                icon.src = iconSrc;
                card.addEventListener("click",()=>{
                    const oldSel = document.querySelector(".level-card-selected");
                    if (oldSel != null)
                        oldSel.classList.remove("level-card-selected");
                    if (oldSel != card)
                        card.classList.add("level-card-selected");
                });
                const perspective = 250;
                card.addEventListener("mousemove",(m)=>{
                    let constraint = 85;
                    window.requestAnimationFrame(()=>{
                        let rect = card.getBoundingClientRect();
                        let rotX = -(m.y - rect.y - (rect.height / 2)) / constraint;
                        let rotY = (m.x - rect.x - (rect.width / 2)) / constraint;
                        let out = "perspective("+perspective+"px) rotateX("+rotX+"deg) rotateY("+rotY+"deg)";
                        card.style.transform = out;
                    });
                    const highlight = card.querySelector(".card-highlight");
                    if (highlight) {
                        highlight.style.opacity = "35%";
                        let rect = card.querySelector("div:has(.card-highlight)").getBoundingClientRect();
                        let radius = highlight.offsetWidth / 2;
                        highlight.style.left = (m.x - rect.x - radius) + "px";
                        highlight.style.top  = (m.y - rect.y - radius) + "px";
                        // highlight.style.left = m.x-(rect.x+(rect.width/2))+"px";
                        // highlight.style.top = m.y-(rect.y+(rect.height/2))+"px";
                    }
                });
                card.addEventListener("mouseleave",()=>{
                    card.style.transform = "perspective("+perspective+"px)";
                    const highlight = card.querySelector(".card-highlight");
                    if (highlight)
                        highlight.style.opacity = "0%";
                });
                cardTemplate.parentElement.appendChild(card);
            });
            cardTemplate.remove();
        });
    }).catch((error)=>{
        alert("An error occured whilst trying to load `leveldata.csv`: '"+error.toString()+"'\nPlease report this at 'https://github.com/DatBogie/datbogie.github.io/issues'!");
    });

    document.getElementById("dl-adofai").addEventListener("click",()=>{
        const selLevel = document.getElementById("level-cards").querySelector(".level-card-selected");
        const title = selLevel.querySelector(".title");
        const artist = selLevel.querySelector(".subtext");
        alert("Download "+title.textContent+" by "+artist.textContent+"...");
    });
});

window.addEventListener("mousemove",function(m) {
    const cur = document.querySelector(".cursor");
    cur.style.left = m.x-xOffset + "px";
    cur.style.top = m.y-yOffset + "px";
    cur.style.display = "block";

    xVel += (m.x-lastX)/12;
    if (xVel > 90) {
        xVel = 90;
    } else if (xVel < -90) {
        xVel = -90;
    }

    if (justLoaded) {
        xVel = 0;
    }

    cur.style.rotate = xVel+"deg";

    lastX = m.x;

    justLoaded = false;
});

window.addEventListener("mousedown",function() {
    const cur = this.document.querySelector(".cursor");
    cur.style.scale = .85;
});

window.addEventListener("mouseup",function() {
    const cur = this.document.querySelector(".cursor");
    cur.style.scale = 1;
});