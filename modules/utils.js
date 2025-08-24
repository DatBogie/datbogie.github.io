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
                    if (heading[i] != "Tags") {
                        rowData[heading[i]] = v.replaceAll("$comma",",");
                    } else {
                        rowData[heading[i]] = v.replaceAll("$comma",",").split("|");
                        v.replaceAll("$comma",",").split("|").forEach((tag)=>{
                            if (levelTags[tag] == null) levelTags[tag] = tagData[tag];
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