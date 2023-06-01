function onupload(event) {
    const image = document.querySelector("#tileset");
    image.src = URL.createObjectURL(event.target.files[0]);
}

function assign_event() {
    document.querySelector("#upload").onchange = onupload;
}

assign_event();
