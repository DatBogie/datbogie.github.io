import { getLevelData } from "./modules/utils.js";
var justLoaded = true;

const urlParams = new URLSearchParams(document.location.search);

var xVel = 0;
var lastX = 0;

const xOffset = 9;
const yOffset = 2;
window.addEventListener("load",function() {
    document.body.style.transition = "margin-top 1s ease, opacity 1s ease-out";
    document.body.style.marginTop = "3px";
    document.body.style.opacity = "100%";
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

    getLevelData(function(levelData,levelTags,tagData) {
        const Title = urlParams.get("title");
        var Artist;
        var Tags;
        var yt;
        var images;
        var diff;
        try {
            Artist = urlParams.get("artist");
            Tags = urlParams.get("tags").split(",");
            yt = urlParams.get("ytcode");
            diff = urlParams.get("difficulty");
        } catch {}
        levelData.forEach((level)=>{
            if (level["Name"] != Title) return;
            Artist = level["Artist"];
            Tags = level["Tags"];
            console.log(Tags);
            yt = level["YTCode"];
            images = level["ImageCount"];
            diff = level["Difficulty"];
        });
        document.getElementById("title").textContent = Title;
        document.getElementById("artist").textContent = Artist;
        const tempTag = document.getElementById("template-tag");
        function mkTag(tagN) {
            const tag = tempTag.cloneNode(true);
            tag.querySelector(".tag-label").textContent = tagN;
            tag.querySelector(".tag-icon").style.backgroundColor = tagData[tagN]? tagData[tagN]["Color"] : "var(--accent)";
            tag.title = tagData[tagN]? tagData[tagN]["Category"]+": "+tagData[tagN]["Description"] : "";
            tempTag.parentElement.appendChild(tag);
        }
        Tags?.forEach(mkTag);
        mkTag("difficulty: "+diff.toLowerCase().replaceAll(" ","-"));
        tempTag.remove();
        document.getElementById("video").src = "https://youtube.com/embed/"+yt;
        const icon = document.getElementById("icon");
        if (images > 0) {
            var currentImage = 1;
            const left = document.getElementById("left");
            const right = document.getElementById("right");
            const label = document.getElementById("label");
            // Pre-load images
            for (let i=2; i <= images; i++) {
                let img = new Image();
                img.src = encodeURI(`https://assets.datbogie.org/${Title}-${i}.webp`).replaceAll("?","%3F");
            }
            function updateIcon(skipAnimation) {
                icon.src = encodeURI(`https://assets.datbogie.org/${Title}-${currentImage}.webp`).replaceAll("?","%3F");
                label.textContent = ` ${currentImage} / ${images} `;
                if (skipAnimation) return;
                icon.style.animation = "none";
                void icon.offsetHeight;
                icon.style.animation = "level-icon-change .25s ease";
            }
            updateIcon(true);
            left.addEventListener("click",()=>{
                currentImage--;
                if (currentImage < 1) currentImage = images;
                updateIcon();
            });
            right.addEventListener("click",()=>{
                currentImage++;
                if (currentImage > images) currentImage = 1;
                updateIcon();
            });
        }
    });
    document.querySelectorAll("iframe").forEach((ifr)=>{
        ifr.addEventListener("mouseenter",()=>{
            cur.style.display = "none";
        });
        ifr.addEventListener("mouseleave",()=>{
            cur.style.display = "block";
        });
    });
});
window.addEventListener("mousemove",function(m) {
    let cur = document.querySelector(".cursor");
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
    let cur = this.document.querySelector(".cursor");
    cur.style.scale = .85;
});

window.addEventListener("mouseup",function() {
    let cur = this.document.querySelector(".cursor");
    cur.style.scale = 1;
});