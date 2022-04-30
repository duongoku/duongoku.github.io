/**
 *
 * @param {Number[]} result
 */
function render_output(result) {
    const output = document.getElementById("set");
    let text = "";
    for (const item of result) {
        text += item + " ";
    }
    output.textContent = text;
}

async function calculate() {
    let temp = document.getElementById("reflist").value;
    temp = temp.trim();
    temp = temp.replace(/[^0-9\s]+/g, " ");
    temp = temp.replace(/\s+/g, " ");
    const reflist = temp.split(" ");

    temp = document.getElementById("index").value;
    const index = Number(temp);
    if (isNaN(index)) {
        document.getElementById("index").value = "6";
        return;
    }

    temp = document.getElementById("window").value;
    let window_size = Number(temp);
    if (isNaN(window_size)) {
        document.getElementById("window").value = "5";
        return;
    }

    const result = new Set();
    for (let i = index - 1; i >= 0 && window_size > 0; i--, window_size--) {
        result.add(reflist[i]);
    }

    if (document.getElementById("sort").checked) {
        render_output(Array.from(result).sort());
    } else {
        render_output(Array.from(result));
    }
}
