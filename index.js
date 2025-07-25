import { getLevelData } from "./modules/utils.js";

var xVel = 0;
var lastX = 0;

const xOffset = 9;
const yOffset = 2;

var justLoaded = true;

var selectedTab = "t-1";

const LevelData = await getLevelData(function(levelData,levelTags){
    const cardTemplate = document.getElementById("level-card-template");
    levelData.forEach((level)=>{
        const card = cardTemplate.cloneNode(true);
        card.id = "";
        const cardTagTemplate = card.querySelector("#card-tag-template");
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
        level["Tags"].forEach(tag=>{
            const newTag = cardTagTemplate.cloneNode(true);
            newTag.id = "";
            newTag.title = tag;
            cardTagTemplate.parentElement.appendChild(newTag);
        });
        cardTagTemplate.remove();
        const download = card.querySelector("#dl");
        const newDownload = card.querySelector("#dl-new");
        const expBtn = card.querySelector("#exp");
        var dl = "https://drive.usercontent.google.com/download?id="+level["DLCode"];
        var dl_new = "https://assets.datbogie.org/levels/"+level["Name"]+".zip";
        var exp = "level-view.html?title="+level["Name"];
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
    const tempTag = document.getElementById("template-tag");
    for (const tag in levelTags) {
        const newTag = tempTag.cloneNode(true);
        newTag.id = "";
        const checkBox = newTag.querySelector("#enabled");
        newTag.querySelector(".tag-label").textContent = tag;
        newTag.addEventListener("click",()=>{
            checkBox.checked = !checkBox.checked;
            filterByCurrentTerm()
        });
        tempTag.parentElement.appendChild(newTag);
    };
    tempTag.remove();
    cardTemplate.remove();
});

var filterTypeIndex = 0;
const filterTypes = ["Include","Exclude"];


function filterByCurrentTerm() {
    filterByText(document.getElementById("level-search").value.toLowerCase());
}

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
    filterByTags();
};

function filterByTags() {
    const selTags = [];
    const tags = document.querySelector(".filter-tags").querySelectorAll(".filter-tag");
    const filterType = filterTypes[filterTypeIndex];
    tags.forEach(tag=>{
        const checkBox = tag.querySelector("#enabled");
        if (!checkBox.checked) return;
        selTags.push(tag.querySelector(".tag-label").textContent);
    });
    if (selTags.length === tags.length && filterType === "Include") return; // works
    document.getElementById("level-cards").querySelectorAll(".level-card").forEach((card)=>{
        if (card.style.display == "none") return;
        if (selTags.length === tags.length && filterType === "Exclude") { card.style.display = "none"; return; } // works
        const title = card.querySelector(".title").textContent;
        const _data = LevelData[0].find(level => level["Name"] === title);
        if (!_data) return;
        var next = false;
        for (const tag of selTags) {
            if (filterType === "Include" && !_data["Tags"].includes(tag)) {
                next = true;
                break;
            } else if (filterType === "Exclude" && _data["Tags"].includes(tag)) {
                next = true;
                break;
            }
        }
        if (next) card.style.display = "none";
    });
}

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

var popupHidden = true;

const searchTags = document.getElementById("level-search-tags");
const searchPopup = document.getElementById("level-filter-popup");
function updatePopupPos() {
    if (popupHidden) return;
    const rect = searchTags.getBoundingClientRect();
    searchPopup.style.top = `${rect.top + window.scrollY}px`;
    searchPopup.style.left = `${rect.left - searchPopup.getBoundingClientRect().width - 30}px`;
}

searchTags.addEventListener("click",()=>{
    if (searchPopup.classList.contains("closed")) {
        popupHidden = false;
        searchPopup.classList.remove("closed");
        searchPopup.style.animation = "level-filter-popup-unroll .25s ease";
    } else {
        popupHidden = true;
        searchPopup.classList.add("closed");
        searchPopup.style.animation = "level-filter-popup-roll .25s ease";
    }
    updatePopupPos();
});

const resizeObserver = new ResizeObserver(updatePopupPos);
resizeObserver.observe(searchTags);
window.addEventListener("scroll",updatePopupPos,true);
window.addEventListener("resize",updatePopupPos);

const cur = document.querySelector(".cursor");
if (!isMobile()) {
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
}

var iterNum = -1;
const loadingCircle = document.getElementById("loading-circle");
const dots = document.querySelectorAll(".loading-dot");
const intervalId = setInterval(()=>{
    iterNum++;
    if (iterNum % 500 == 0) {
        console.log(iterNum);
        let circ = loadingCircle.cloneNode();
        circ.classList.add("pulse");
        loadingCircle.parentElement.appendChild(circ);
        circ.offsetHeight;
        circ.style.scale = "10";
        circ.style.opacity = "0";
        setTimeout(()=>{
            circ.remove();
        },650);
    }
});
function loadingDotJump(i) {
    dots[i].style.animation = "none";
    void dots[i].offsetHeight;
    dots[i].style.animation = "loading-dot-jump 1s linear";
}
const intervalId1 = setInterval(()=>{
    for (let i=0; i<3; i++) {
        setTimeout(()=>{
            loadingDotJump(i);
        },i*500);
    }
},3*500);

function isMobile() {
    let check = false;
    // http://detectmobilebrowsers.com, https://stackoverflow.com/a/11381730
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
}

if (isMobile()) {
    cur.remove();
}

window.addEventListener("load",function() {
    clearInterval(intervalId);
    clearInterval(intervalId1);
    document.getElementById("loading").remove();
    document.body.style.opacity = "0";
    void document.body.offsetHeight;
    document.getElementById("tabbar-bg").style.opacity = "100%";
    document.getElementById("all-tags").addEventListener("click",()=>{
        var value = false;
        const tags = document.querySelector(".filter-tags").querySelectorAll(".filter-tag");
        for (const tag of tags) {
            const checkBox = tag.querySelector("#enabled");
            if (!checkBox.checked) {
                value = true;
                break;
            }
        }
        tags.forEach(tag=>{
            const checkBox = tag.querySelector("#enabled");
            checkBox.checked = value;
        });
        filterByCurrentTerm();
    });
    document.getElementById("invert-tags").addEventListener("click",()=>{
        const tags = document.querySelector(".filter-tags").querySelectorAll(".filter-tag");
        tags.forEach(tag=>{
            const checkBox = tag.querySelector("#enabled");
            checkBox.checked = !checkBox.checked;
        });
        filterByCurrentTerm();
    });
    const filterType = document.getElementById("tag-filter-type");
    function updateFilterType(changeValue=true) {
        if (changeValue) {
            filterTypeIndex++;
            if (filterTypeIndex >= filterTypes.length)
                filterTypeIndex = 0;
        }
        filterType.textContent = `Filter Type: ${filterTypes[filterTypeIndex]}`;
    }
    filterType.addEventListener("click",()=>{
        updateFilterType();
        filterByCurrentTerm();
    });
    updateFilterType(false);
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
    if (!isMobile()) {
        document.querySelector(".if-popup").addEventListener("mouseenter",() => {
            cur.style.display = "none";
        });
        document.querySelector(".if-popup").addEventListener("mouseleave",() => {
            cur.style.display = "block";
        });
    }
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

    document.getElementById("adofai-select-all").addEventListener("click",()=>{
        document.getElementById("level-cards").querySelectorAll(".level-card").forEach(card=>{
            if (!card.classList.contains("level-card-selected"))
                card.classList.add("level-card-selected");
        });
    });

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
            open(selLevels.querySelector("#dl-new").dataset.dl);
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

    document.getElementById("level-search").addEventListener("input",(e)=>{
        const term = e.target.value.toLowerCase();
        filterByText(term);
    });
    document.getElementById("level-search-clear").addEventListener("click",() => {
        document.getElementById("level-search").value = "";
        filterByText("");
    });
});

if (!isMobile()) {
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
}