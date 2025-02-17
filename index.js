function redir(id) {
    console.log(id);
    let _x = document.getElementById(id);
    let isRepo = false;
    let isOther = false;
    let hash = "";
    if (_x) {
        console.log("type:"+_x.type)
        if (_x.dataset.type == "repo") {
            isRepo = true;
        } else if (_x.dataset.type == "site") {
            isOther = true;
        }
        if (_x.dataset.hash != null) {
            hash = _x.dataset.hash;
        }
        let block = document.createElement("div");
        document.body.appendChild(block);
        block.style.position = "fixed";
        block.style.top = 0;
        block.style.width = "100vw";
        block.style.height = "100vh";
        block.style.pointerEvents = "all";
        block.style.zIndex = 1;
        block.style.backgroundColor = "rgba(0,0,0,0)";
        block.style.transition = 'all 200ms cubic-bezier(0,1,1,1)'
        window.getComputedStyle(block).transition;
        block.style.backdropFilter = 'blur(10px)';
        let x = _x.cloneNode();
        _x.parentElement.appendChild(x);
        x.style.top = "0%";
        window.getComputedStyle(x).transition;
        x.style.scale = 6;
        x.style.opacity = 0;
        x.style.position = "fixed";
    };

    setTimeout(function() {
        if (isOther) {
            window.location.replace(id);
        } else if (!isRepo) {
            window.location.replace("https://datbogie.github.io/"+id+hash);
        } else {
            window.location.replace("https://github.com/datbogie/"+id);
        }
    }, 100);
};
