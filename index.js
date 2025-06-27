// function redir(id) {
//     console.log(id);
//     let _x = document.getElementById(id);
//     let isRepo = false;
//     let isOther = false;
//     let hash = "";
//     if (_x) {
//         console.log("type:"+_x.type)
//         if (_x.dataset.type == "repo") {
//             isRepo = true;
//         } else if (_x.dataset.type == "site") {
//             isOther = true;
//         }
//         if (_x.dataset.hash != null) {
//             hash = _x.dataset.hash;
//         }
//         let block = document.createElement("div");
//         document.body.appendChild(block);
//         block.style.position = "fixed";
//         block.style.top = 0;
//         block.style.width = "100vw";
//         block.style.height = "100vh";
//         block.style.pointerEvents = "all";
//         block.style.zIndex = 1;
//         block.style.backgroundColor = "rgba(0,0,0,0)";
//         block.style.transition = 'all 200ms cubic-bezier(0,1,1,1)'
//         window.getComputedStyle(block).transition;
//         block.style.backdropFilter = 'blur(10px)';
//         let x = _x.cloneNode();
//         _x.parentElement.appendChild(x);
//         x.style.top = "0%";
//         window.getComputedStyle(x).transition;
//         x.style.scale = 6;
//         x.style.opacity = 0;
//         x.style.position = "fixed";
//     };

//     setTimeout(function() {
//         console.log(isOther);
//         if (isOther) {
//             window.location.replace(id);
//         } else if (!isRepo) {
//             window.location.replace("https://datbogie.github.io/"+id+hash);
//         } else {
//             window.location.replace("https://github.com/datbogie/"+id);
//         }
//     }, 100);
// };

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
            xVel+=7;
            if (xVel > 0) {
                xVel = 0;
            }
        } else {
            xVel-=7;
            if (xVel < 0) {
                xVel = 0
            }
        }
        cur.style.rotate = xVel+"deg";
    },1);
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
});

window.addEventListener("mousemove",function(m) {
    const cur = document.querySelector(".cursor");
    cur.style.left = m.x-xOffset + "px";
    cur.style.top = m.y-yOffset + "px";
    cur.style.display = "block";

    xVel += (m.x-lastX)/2;
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