import { getLevelData, embedOpen, isMobile, getFavicon } from "./modules/utils.js";

var xVel = 0;
var lastX = 0;

const xOffset = 9;
const yOffset = 2;

var justLoaded = true;

var selectedTab = "t-1";

const urlParams = new URLSearchParams(document.location.search);

if (urlParams.get("tab"))
    selectedTab=urlParams.get("tab");

const Accounts = {
    Youtube: "https://youtube.com/@datbogie",
    GitHub: "https://github.com/DatBogie",
    Steam: "https://steamcommunity.com/id/DatBogie",
    BlueSky: "https://bsky.app/profile/datbogie.bsky.social",
    Roblox: "https://www.roblox.com/users/479943271/profile",
    "Roblox Group": "https://www.roblox.com/communities/7789323/x",
    "PROJECT DΣNTΔ": "https://www.roblox.com/communities/17161898/x"
};

const tempLink = document.getElementById("template-link");
function mkLink(name, url) {
    const link = tempLink.cloneNode(true);
    link.querySelector(".link-label").textContent = name;
    link.title = url;
    link.querySelector("img").src = getFavicon(url);
    link.querySelector(".link-icon").style.backgroundColor = "transparent";
    link.dataset.href = url;
    link.dataset.opennew = "true";
    tempLink.parentElement.appendChild(link);
}

for (const [name, url] of Object.entries(Accounts)) {
    mkLink(name,url);
}
tempLink.remove();

const LevelData = await getLevelData(function(levelData,levelTags,tagData){
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
        const seizure = card.querySelector("#seizure-warning");
        if (!level["Tags"].includes("seizure")) { seizure.style.display = "none"; seizure.parentElement.title = ""; }
        const diff = card.querySelector("#difficulty-indicator");
        diff.title = `Difficulty: ${level["Difficulty"]}`;
        diff.src = `./assets/diff-indicators/${level["Difficulty"]}.svg`;
        level["Tags"].push(`difficulty: ${level["Difficulty"].toLowerCase().replaceAll(" ","-")}`);
        const icon = card.querySelector(".level-icon");
        // var iconSrc = "assets/adofai-levels/"+level["Name"]+"-1.png";
        var iconSrc = encodeURI("https://assets.datbogie.org/"+level["Name"]+"-1.webp").replaceAll("?","%3F");
        icon.src = iconSrc;
        level["Tags"].forEach(tag=>{
            const newTag = cardTagTemplate.cloneNode(true);
            newTag.id = "";
            newTag.title = tagData[tag]? tagData[tag]["Category"]+": "+tag : tag;
            newTag.style.backgroundColor = (tagData[tag])? tagData[tag]["Color"] : "var(--accent)";
            cardTagTemplate.parentElement.appendChild(newTag);
        });
        cardTagTemplate.remove();
        const download = card.querySelector("#dl");
        const newDownload = card.querySelector("#dl-new");
        const expBtn = card.querySelector("#exp");
        var dl = (level["DLCode"] != "")? "https://drive.usercontent.google.com/download?id="+level["DLCode"] : null;
        var dl_new = encodeURI("https://assets.datbogie.org/levels/"+level["Name"]+".zip").replaceAll("?","%3F");
        var exp = "level-view.html?title="+level["Name"];
        if (dl) {
            download.dataset.dl = dl;
            download.dataset.href = dl;
        } else {
            download.remove();
        }
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
        if (dl) {
            card.querySelector("#dl").addEventListener("click",()=>{
                embedOpen(dl);
            });
        }
        card.querySelector("#dl-new").addEventListener("click",()=>{
            open(dl_new);
        });
        card.querySelector("#exp").addEventListener("click",()=>{
            embedOpen(exp);
        });
        cardTemplate.parentElement.appendChild(card);
    });
    const tempCat = document.getElementById("template-category");
    const tempTag = document.getElementById("template-tag");
    for (const tag in levelTags) {
        var category = "Other";
        var tagColor = "var(--accent)";
        var tagDesc = "";
        if (tagData[tag] !== undefined) {
            category = tagData[tag]["Category"];
            tagColor = tagData[tag]["Color"];
            tagDesc = tagData[tag]["Description"];
        }
        var cat = document.querySelector("#filter-cat-"+category);
        if (cat === null) {
            cat = tempCat.cloneNode(true);
            cat.querySelector("#template-tag").remove();
            cat.id = "filter-cat-"+category;
            cat.querySelector(".summary").textContent = category;
            tempCat.parentElement.appendChild(cat);
        }
        const newTag = tempTag.cloneNode(true);
        newTag.id = `filter-tag-${category}-${tag}`;
        newTag.querySelector(".tag-icon").style.backgroundColor = tagColor;
        newTag.title = tagDesc;
        const checkBox = newTag.querySelector("#enabled");
        newTag.querySelector(".tag-label").textContent = tag;
        newTag.addEventListener("click",()=>{
            checkBox.checked = !checkBox.checked;
            filterByCurrentTerm()
        });
        cat.querySelector(".content").appendChild(newTag);
    };
    tempTag.remove();
    tempCat.remove();
    cardTemplate.remove();
    filterByCurrentTerm();

    document.querySelectorAll(".details").forEach(det=>{
        const summ = det.querySelector(".summary");
        const cont = det.querySelector(".content");
        if (det.classList.contains("open"))
            cont.style.maxHeight = cont.scrollHeight+"px";
        summ.addEventListener("click",()=>{
            if (det.classList.contains("open"))
                det.classList.remove("open");
            else
                det.classList.add("open");
        });
    });
});

var filterTypeIndex = 0;
var previousFilterType = undefined;
const filterTypes = ["Strict","Include","Exclude"];


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
        if (tag.id === "filter-tag-Other-hq")
            document.getElementById("featured-adofai").textContent = (checkBox.checked && filterTypeIndex === 0)? "Show All" : "Show Featured Only";
        if (!checkBox.checked) return;
        selTags.push(tag.querySelector(".tag-label").textContent);
    });
    if (selTags.length === tags.length && filterType !== "Exclude") return; // works
    document.getElementById("level-cards").querySelectorAll(".level-card").forEach((card)=>{
        if (card.style.display == "none") return;
        if (selTags.length === tags.length && filterType === "Exclude") { card.style.display = "none"; return; } // works
        const title = card.querySelector(".title").textContent;
        const _data = LevelData[0].find(level => level["Name"] === title);
        if (!_data) return;
        var next = false;
        for (const tag of selTags) {
            if (filterType === "Strict" && !_data["Tags"].includes(tag)) {
                next = true;
                break;
            } else if (filterType === "Exclude" && _data["Tags"].includes(tag)) {
                next = true;
                break;
            } else if (filterType === "Include") {
                if (_data["Tags"].includes(tag)) {
                    next = false;
                    break;
                } else {
                    next = true;
                }
            }
        }
        if (next) card.style.display = "none";
    });
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
const expand = document.getElementById("expand-adofai");
const levelCards = document.getElementById("level-cards");
function updatePopupPos() {
    const enabled = document.querySelector(".tabpage").classList.contains("mobile");
    if (window.innerWidth <= 700) {
        if (!enabled) {
            document.querySelectorAll(".tabpage").forEach(tabpage=>{
                tabpage.classList.add("mobile");
            });
        }
    } else {
        if (enabled) {
            document.querySelectorAll(".tabpage").forEach(tabpage=>{
                if (tabpage.classList.contains("mobile"))
                    tabpage.classList.remove("mobile");
            });
        }
    }

    if (window.innerWidth < 800) {
        expand.style.display = "none";
        levelCards.style.gridTemplateColumns = "repeat(1,1fr)";
        levelCards.style.marginLeft = "unset";
        levelCards.style.marginRight = "unset";
    } else if (window.innerWidth < 1174 ) {
        expand.style.display = "none";
        levelCards.style.gridTemplateColumns = "repeat(2,1fr)";
        levelCards.style.marginLeft = "unset";
        levelCards.style.marginRight = "unset";
    } else {
        expand.style.display = "block";
        if (expand.textContent !== "Expand View") {
            levelCards.style.gridTemplateColumns = "repeat(6,1fr)";
            levelCards.style.marginLeft = "-45%";
            levelCards.style.marginRight = "-45%";
        } else {
            levelCards.style.gridTemplateColumns = "repeat(3, 1fr)";
            levelCards.style.gridAutoColumns = "unset";
            levelCards.style.marginLeft = "unset";
            levelCards.style.marginRight = "unset";
        }
    }
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

if (isMobile()) {
    cur.remove();
}

function disableAllTags(filter=true) {
    const tags = document.querySelector(".filter-tags").querySelectorAll(".filter-tag");
    tags.forEach(tag=>{
        const checkBox = tag.querySelector("#enabled");
        checkBox.checked = false;
    });
    if (filter) filterByCurrentTerm();
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
            previousFilterType = undefined;
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
            if (!link.classList.contains("functional-a"))
                embedOpen(link.dataset.href);
            else
                open(link.dataset.href);
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
            if (url.startsWith("mailto:")) return true;
            open(url);
            return false;
        }
    }
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
    
    document.getElementById("adofai-deselect-all").addEventListener("click",()=>{
        document.getElementById("level-cards").querySelectorAll(".level-card").forEach(card=>{
            if (card.classList.contains("level-card-selected"))
                card.classList.remove("level-card-selected");
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

    expand.addEventListener("click",()=>{
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
        if (compact.textContent == "Compact View") {
            compact.textContent = "Normal View";
            levelCards.querySelectorAll(".level-card").forEach((card)=>{
                card.classList.add("collapsed");
            });
        } else {
            compact.textContent = "Compact View";
            levelCards.querySelectorAll(".level-card").forEach((card)=>{
                card.classList.remove("collapsed");
            });
        }
    });

    const featured = document.getElementById("featured-adofai");
    const hqTag = document.getElementById("filter-tag-Other-hq").querySelector("#enabled");
    featured.addEventListener("click",()=>{
        const enabled = !hqTag.checked;
        hqTag.checked = enabled;
        if (enabled && filterTypeIndex !== 0) {
            previousFilterType = filterTypeIndex;
            filterTypeIndex = 0;
            updateFilterType(false);
        } else if (!enabled && previousFilterType !== undefined) {
            filterTypeIndex = previousFilterType;
            previousFilterType = undefined;
            updateFilterType(false);
        }
        filterByCurrentTerm();
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