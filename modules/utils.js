export async function getTagData(doSomething) {
    const tagData = {};
    fetch("tagdata.csv").then().then(raw=>{
        raw.text().then(text=>{
            const heading = text.split("\n")[0].split(",");
            const data = text.split("\n").slice(1,-1); // Remember: newline @ EOF
            data.forEach(row=>{
                const rawRowData = row.split(",")
                const key = rawRowData[0];
                var rowData = {};
                for (const [i, v] of rawRowData.entries()) {
                    rowData[heading[i]] = v.replaceAll("$comma",",");
                }
                tagData[key] = rowData;
            });
            if (doSomething !== undefined) doSomething(tagData);
        });
    }).catch(error=>{
        alert("An error occured whilst trying to load `tagdata.csv`: '"+error.toString()+"'\nPlease report this at 'https://github.com/DatBogie/datbogie.github.io/issues'!");
    });
    return tagData;
}

export async function getLevelData(doSomething) {
    const ret = new Array(3);
    var levelData = [];
    var levelTags = {};
    const tagData = await getTagData();
    fetch("leveldata.csv").then().then((raw)=>{
        raw.text().then((text)=>{
            const heading = text.split("\n")[0].split(",");
            const data = text.split("\n").slice(1,-1); // Remember: newline @ EOF
            data.forEach((row)=>{
                var rowData = {};
                for (const [i, v] of row.split(",").entries()) {
                    if (heading[i] != "Tags" && heading[i] != "Links") {
                        rowData[heading[i]] = v.replaceAll("$comma",",");
                    } else {
                        rowData[heading[i]] = v.replaceAll("$comma",",").split("|");
                        v.replaceAll("$comma",",").split("|").forEach((tag)=>{
                            if (heading[i] === "Tags") if (levelTags[tag] == null) levelTags[tag] = tagData[tag];
                        });
                    }
                    if (heading[i] == "Difficulty") {
                        let tag = "difficulty: " + v.replaceAll("$comma",",").replaceAll(" ","-").toLowerCase();
                        if (levelTags[tag] == null) levelTags[tag] = tagData[tag];
                    }
                };
                levelData.push(rowData);
            });
            if (doSomething !== undefined) doSomething(levelData,levelTags,tagData);
        });
    }).catch((error)=>{
        alert("An error occured whilst trying to load `leveldata.csv`: '"+error.toString()+"'\nPlease report this at 'https://github.com/DatBogie/datbogie.github.io/issues'!");
    });
    ret[0] = levelData;
    ret[1] = levelTags;
    ret[2] = tagData;
    return ret;
}

export function embedOpen(url) {
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

    if (url.indexOf("drive.usercontent.google") === -1) return;
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

export function isMobile() {
    let check = false;
    // http://detectmobilebrowsers.com, https://stackoverflow.com/a/11381730
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
}

export function getFavicon(url) {
    if (url.indexOf("drive.usercontent.google.com") !== -1)
        return "https://s2.googleusercontent.com/s2/favicons?domain=drive.google.com"
    if (url.indexOf("assets.datbogie.org") !== -1)
        return "../assets/favicon-dl.png";
    return "https://s2.googleusercontent.com/s2/favicons?domain_url=" + url;
}