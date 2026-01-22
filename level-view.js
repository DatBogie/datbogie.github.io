import { getLevelData, embedOpen, isMobile, getFavicon } from "./modules/utils.js";
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

    const links = document.querySelectorAll(".link, .functional-link");
    links.forEach((link)=>{
        link.addEventListener("click",()=>{
            embedOpen(link.dataset.href);
        });
        var targetted = false;
        link.addEventListener("mousedown",(e)=>{
            if (e.button != 1) return;
            targetted = true;
        });
        link.addEventListener("mouseup",(e)=>{
            if (e.button != 1 || !targetted) return;
            targetted = false;
            open(link.dataset.href);
        });
    });
    document.onclick = function(x) {
        if (x.target.tagName === "A") {
            const url = x.target.href;
            open(url);
            return false;
        }
    }

    getLevelData(function(levelData,levelTags,tagData) {
        const Title = urlParams.get("title");
        var Artist;
        var Tags;
        var yt;
        var images;
        var diff;
        var Links;
        try {
            Artist = urlParams.get("artist");
            Tags = urlParams.get("tags").split(",");
            yt = urlParams.get("ytcode");
            diff = urlParams.get("difficulty");
            Links = urlParams.get("links").split(",");
        } catch {}
        var dl;
        var dl_new;
        levelData.forEach((level)=>{
            if (level["Name"] != Title) return;
            Artist = level["Artist"];
            Tags = level["Tags"];
            yt = level["YTCode"];
            images = level["ImageCount"];
            diff = level["Difficulty"];
            Links = level["Links"] || [];
            dl = (level["DLCode"] != "")? "https://drive.usercontent.google.com/download?id="+level["DLCode"] : null;
            dl_new = encodeURI("https://assets.datbogie.org/levels/"+level["Name"]+".zip").replaceAll("?","%3F");
        });
        if (dl)
            Links.splice(0,0,dl);
        Links.splice(0,0,dl_new);
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
        const tempLink = document.getElementById("template-link");
        function mkLink(url) {
            const link = tempLink.cloneNode(true);
            // link.querySelector(".tag-label").textContent = "Link";
            link.title = url;
            link.querySelector("img").src = getFavicon(url);
            link.querySelector(".tag-icon").style.backgroundColor = "transparent";
            link.dataset.href = url;
            link.dataset.opennew = "true";
            tempLink.parentElement.appendChild(link);
        }
        Tags?.forEach(mkTag);
        Links?.forEach(mkLink);
        if (Links && Links.length === 0)
            tempLink.parentElement.style.display = "none";
        mkTag("difficulty: "+diff.toLowerCase().replaceAll(" ","-"));
        tempTag.remove();
        tempLink.remove();
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
            icon.addEventListener("click",()=>{
                embedOpen(icon.src);
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
    document.getElementById("if-open").addEventListener("click",() => {
        const url = document.querySelector(".if-popup").querySelector("#if-url").textContent;
        open(url);
        document.getElementById("if-close").click();
    });
    document.getElementById("if-close").addEventListener("click",() => {
        const blur = document.querySelector(".blur-bg");
        blur.style.animationName = "blur-bg-close";
        blur.classList.add("blur-bg-closing");
        setTimeout(() => {
            blur.style.display = "none";
            blur.classList.remove("blur-bg-closing");
        },Number(getComputedStyle(blur).animationDuration.slice(0,-1))*1000);

        const popup = document.querySelector(".if-popup");
        popup.style.animationName = "if-popup-close";
        popup.classList.add("if-closing");
        setTimeout(() => {
            popup.style.display = "none";
            popup.classList.remove("if-closing");
            popup.querySelector("iframe").src = "";
            document.getElementById("if-url").textContent = "";
        },Number(getComputedStyle(popup).animationDuration.slice(0,-1))*1000);
    });
    if (!isMobile()) {
        document.querySelector(".if-popup").addEventListener("mouseenter",() => {
            cur.style.display = "none";
        });
        document.querySelector(".if-popup").addEventListener("mouseleave",() => {
            cur.style.display = "block";
        });
    }
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

const observer = new MutationObserver((mL)=>{
    mL.forEach((m)=>{
        if (m.type == "childList" && m.addedNodes.length > 0) {
            m.addedNodes.forEach((n)=>{
                if (n.nodeType == Node.ELEMENT_NODE) {
                    var links;
                    if (n.classList?.contains("link")) {
                        links = [n];
                    } else {
                        let _links = n.querySelectorAll(".link");
                        if (_links.length > 0) {
                            links = _links
                        }
                    }
                    if (!links) return;
                    links.forEach((link)=>{
                        if (link.dataset.disableclick != "true") {
                            if (link.dataset.opennew == "true") {
                                link.addEventListener("click",()=>{
                                    open(link.dataset.href);
                                });
                            } else {
                                link.addEventListener("click",()=>{
                                    embedOpen(link.dataset.href);
                                });
                            }
                        }
                        var targetted = false;
                        link.addEventListener("mousedown",(e)=>{
                            if (e.button != 1) return;
                            targetted = true;
                        });
                        link.addEventListener("mouseup",(e)=>{
                            if (e.button != 1 || !targetted) return;
                            targetted = false;
                            open(link.dataset.href);
                        });
                    });
                }
            });
        }
    });
});

observer.observe(document.body, {
    childList: true,
    subtree: true,
});