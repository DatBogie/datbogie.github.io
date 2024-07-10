function ClickerHTML() {
    let x = document.getElementById("ClickerHTML");
    if (x) {
        x.style.scale = 20;
        x.style.opacity = 0;
        x.style.position = "fixed";
        x.style.zIndex = 1;
    };

    setTimeout(function() {
        window.location.replace("https://datbogie.github.io/ClickerHTML");
    }, 200);
};
