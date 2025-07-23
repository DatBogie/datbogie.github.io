export function getLevelData(doSomething) {
    const ret = new Array(2);
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
            doSomething(levelData,levelTags);
        });
    }).catch((error)=>{
        alert("An error occured whilst trying to load `leveldata.csv`: '"+error.toString()+"'\nPlease report this at 'https://github.com/DatBogie/datbogie.github.io/issues'!");
    });
    ret[0] = levelData;
    ret[1] = levelTags;
    return ret;
}