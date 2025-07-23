import { getLevelData } from "./modules/utils.js";

var xVel = 0;
var lastX = 0;

const xOffset = 9;
const yOffset = 2;

var justLoaded = true;

var selectedTab = "t-1";

function embedOpen(url) {
    const blur = document.querySelector(".blur-bg");
    blur.style.animationName = "blur-bg-open";
    blur.style.display = "block";

    const popup = document.querySelector(".if-popup");
    popup.style.animationName = "if-popup-open";
    popup.style.display = "block";
    const urlBar = document.getElementById("if-url");
    urlBar.textContent = url;
    const iframe = popup.querySelector("iframe");
    iframe.src = url;

    if (url.indexOf("drive.usercontent.google") == -1) return;
    const doc = (iframe.contentDocument || iframe.contentWindow.document);
    const style = doc.createElement("style");
    style.textContent =
    `body {
        background-color: #24273a;
    }
    div {
        position: fixed;
        width: 100vw;
        height: 100vh;
        background-color: #24273a;
        color: #cad3f5;
        margin-left: 2vw;
        margin-right: 2vw;
        margin-top: 2vh;
        margin-bottom: 2vh;
        font-size: 2rem;
        font-family: "Nunito", serif;
    }
    span {
        opacity: 0%;
        transition: opacity 200ms ease;
    }
    p {
        font-size: 1rem;
    }`;
    doc.head.appendChild(style);

    const link0 = doc.createElement("link");
    link0.textContent = `<link rel="preconnect" href="https://fonts.googleapis.com">`;
    const link1 = doc.createElement("link");
    link1.textContent = `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`;
    const link2 = doc.createElement("link");
    link2.textContent = `<link href="https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap" rel="stylesheet">`;

    const div = doc.createElement("div");
    div.id = "dl-loading";
    div.innerHTML = `<i>Preparing your download</i><span id="1">.</span><span id="2">.</span><span id="3">.</span><br><p>Some levels take longer to download than others.<br>Please be patient!</p>`;
    doc.body.appendChild(div);

    const script = doc.createElement("script");
    script.textContent =
    `const a = document.getElementById("1");
    const b = document.getElementById("2");
    const c = document.getElementById("3");
    var active = -1;
    setInterval(()=>{
        a.style.opacity = "100%";
        setTimeout(()=>{
            b.style.opacity = "100%"
        },100);
        setTimeout(()=>{
            c.style.opacity = "100%"
        },200);
        setTimeout(()=>{
            a.style.opacity = "0%";
        },600);
        setTimeout(()=>{
            b.style.opacity = "0%";
        },700);
        setTimeout(()=>{
            c.style.opacity = "0%";
        },800);
    },1200);`;
    doc.body.appendChild(script);
}

function easeOutElastic(x) {
    const c4 = (2 * Math.PI) / 4;
    return x === 0
    ? 0
    : x === 1
    ? 1
    : Math.pow(2, -10 * x) * Math.sin((x * 10 - .75) * c4) + 1;
}

const observer = new MutationObserver((mL)=>{
    mL.forEach((m)=>{
        if (m.type == "childList" && m.addedNodes.length > 0) {
            m.addedNodes.forEach((n)=>{
                if (n.nodeType == Node.ELEMENT_NODE) {
                    var links;
                    if (n.classList?.contains("functional-link")) {
                        links = [n];
                    } else {
                        let _links = n.querySelectorAll(".functional-link");
                        if (_links.length > 0) {
                            links = _links
                        }
                    }
                    if (!links) return;
                    links.forEach((link)=>{
                        if (link.dataset.disableclick != "true") {
                            link.addEventListener("click",()=>{
                                embedOpen(link.dataset.href);
                            });
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

window.addEventListener("load",function() {
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
    document.querySelectorAll(".tabpage").forEach((tab)=>{
        tab.querySelectorAll("div:has(input)").forEach((div)=>{
            div.firstElementChild.classList.add("first-el");
            div.lastElementChild.classList.add("last-el");
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
    // document.getElementById("open-adofai").addEventListener("click",function() {
    //     embedOpen("adofai-level-browser-legacy.html");
    // });
    document.querySelectorAll(".expanding-hr").forEach((el)=>{
        el.style.animationName = "hr-expand";
    });
    const cur = document.querySelector(".cursor");
    document.querySelector(".if-popup").addEventListener("mouseenter",() => {
        cur.style.display = "none";
    });
    document.querySelector(".if-popup").addEventListener("mouseleave",() => {
        cur.style.display = "block";
    });
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

    const _levelData = getLevelData(function(levelData){
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
            // var iconSrc = "assets/adofai-levels/"+level["Name"]+"-1.png";
            var iconSrc = "https://assets.datbogie.org/"+level["Name"]+"-1.png";
            icon.src = iconSrc;
            const download = card.querySelector("#dl");
            const newDownload = card.querySelector("#dl-new");
            const expBtn = card.querySelector("#exp");
            var dl = "https://drive.usercontent.google.com/download?id="+level["DLCode"];
            var dl_new = "https://assets.datbogie.org/levels/"+level["Name"]+".zip";
            var exp = "./level-view.html?title="+level["Name"];
            download.dataset.dl = dl;
            download.dataset.href = dl;
            newDownload.dataset.dl = dl_new;
            newDownload.dataset.href = dl_new;
            expBtn.dataset.href = exp;
            card.addEventListener("click",(e)=>{
                if (e.target.classList.contains("div-button")) return;
                const oldSel = document.querySelectorAll(".level-card-selected");
                // if (oldSel != null)
                //     oldSel.classList.remove("level-card-selected");
                if ([...oldSel].includes(card)) {
                    card.classList.remove("level-card-selected");
                } else {
                    card.classList.add("level-card-selected");
                }
                
                const dur = 800;
                const start = performance.now();
                const initScale = .85;
                card.style.scale = initScale;
                function step(time) {
                    let elapsed = time - start;
                    let prog = Math.min(elapsed / dur, 1);
                    let eased = easeOutElastic(prog);
                    card.style.scale = initScale + (1-initScale) * eased;
                    if (prog < 1) {
                        window.requestAnimationFrame(step);
                    } else {
                        card.style.scale = 1;
                    }
                }
                window.requestAnimationFrame(step);
            });
            const perspective = 500; // px
            card.addEventListener("mousemove",(m)=>{
                const constraint = 45 * (window.innerWidth/1920);
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
            card.querySelector("#dl").addEventListener("click",()=>{
                embedOpen(dl);
            });
            card.querySelector("#dl-new").addEventListener("click",()=>{
                open(dl_new);
            });
            card.querySelector("#exp").addEventListener("click",()=>{
                embedOpen(exp);
            });
            cardTemplate.parentElement.appendChild(card);
        });
        cardTemplate.remove();
    });

    const levelData = _levelData[0];
    const levelTags = _levelData[1];

    var dltriggered = false;
    document.getElementById("dl-adofai").addEventListener("mousedown",(e)=>{
        if (e.button != 1) return;
        dltriggered = true;
    });
    document.getElementById("dl-adofai").addEventListener("mouseup",(e)=>{
        if (e.button != 1 || !dltriggered) return;
        dltriggered = false;
        const selLevel = document.getElementById("level-cards").querySelectorAll(".level-card-selected");
        if (!selLevel) return;
        const dl = selLevel.querySelector("#dl-new");
        open(dl.dataset.dl)
    });
    document.getElementById("dl-adofai").addEventListener("click",async()=>{
        const selLevels = document.getElementById("level-cards").querySelectorAll(".level-card-selected");
        if (!selLevels) return;

        if (selLevels.length > 1) {
            const zip = new JSZip();

            for (const selLevel of selLevels) {
                const dl = selLevel.querySelector("#dl-new");
                const url = dl.dataset.dl;
                try {
                    const response = await fetch(url);
                    const blob = await response.blob();
                    zip.file(selLevel.querySelector(".title").textContent, blob);
                } catch(err) {
                    alert(`Failed to fetch ${url}: ${err}`);
                }
                // open(dl.dataset.dl);
            }
            zip.generateAsync({ type: "blob" }).then((content)=>{
                const a = document.createElement("a");
                a.href = URL.createObjectURL(content);
                a.download = "ADOFAI Levels.zip";
                a.click();
                a.remove();
            });
        } else {
            open(selLevels[0].querySelector("#dl-new").dataset.dl);
        }
    });

    const expand = document.getElementById("expand-adofai");
    expand.addEventListener("click",()=>{
        let levelCards = document.getElementById("level-cards");
        if (expand.textContent == "Expand View") {
            expand.textContent = "Collapse View";
            levelCards.style.gridTemplateColumns = "repeat(6,1fr)";
            levelCards.style.marginLeft = "-45%";
            levelCards.style.marginRight = "-45%";
            
        } else {
            expand.textContent = "Expand View";
            levelCards.style.gridTemplateColumns = "repeat(3, 1fr)";
            levelCards.style.gridAutoColumns = "unset";
            levelCards.style.marginLeft = "unset";
            levelCards.style.marginRight = "unset";
        }
    });

    const compact = document.getElementById("compact-adofai");
    compact.addEventListener("click",()=>{
        let levelCards = document.getElementById("level-cards");
        if (compact.textContent == "Compact View") {
            compact.textContent = "Normal View";
            levelCards.querySelectorAll(".level-card").forEach((card)=>{
                card.style.aspectRatio = "unset";
                card.querySelector("hr").style.display = "none";
                card.querySelector(".level-icon").style.display = "none";
                card.querySelector(".card-tags").classList.add("collapsed");
            });
            
        } else {
            compact.textContent = "Compact View";
            levelCards.querySelectorAll(".level-card").forEach((card)=>{
                card.style.aspectRatio = "1";
                card.querySelector("hr").style.display = "block";
                card.querySelector(".level-icon").style.display = "block";
                card.querySelector(".card-tags").classList.remove("collapsed");
            });
        }
    });

    function filterByText(term) {
        document.getElementById("level-cards").querySelectorAll(".level-card").forEach((card)=>{
            if (term == "") {card.style.display = "block"; return};
            const title = card.querySelector(".title").textContent.toLowerCase();
            const artist = card.querySelector(".subtext").textContent.toLowerCase();
            if (title.indexOf(term) != -1 || artist.indexOf(term) != -1)
                card.style.display = "block";
            else
                card.style.display = "none";
        });
    };

    document.getElementById("level-search").addEventListener("input",(e)=>{
        const term = e.target.value.toLowerCase();
        filterByText(term);
    });
    document.getElementById("level-search-clear").addEventListener("click",() => {
        document.getElementById("level-search").value = "";
        filterByText("");
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
    let cur = document.querySelector(".cursor");
    cur.style.scale = .85;
});

window.addEventListener("mouseup",function() {
    let cur = document.querySelector(".cursor");
    cur.style.scale = 1;
});