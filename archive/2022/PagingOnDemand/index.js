/**
 * Optimal Algorithm
 * @param {Number[]} references
 * @param {Number} frames
 */
function optimal(references, frames) {
    if (references.length < 1) {
        return;
    }
    const in_use = [];
    const faults = [];
    const removes = [];
    for (let i = 0; i < references.length; i++) {
        const ref = references[i];
        if (in_use.length === frames && !in_use.includes(ref)) {
            const used = [];
            const not_used = in_use.slice();
            for (
                let j = i + 1;
                j < references.length && not_used.length > 1;
                j++
            ) {
                if (
                    not_used.includes(references[j]) &&
                    !used.includes(references[j])
                ) {
                    not_used.splice(not_used.indexOf(references[j]), 1);
                    used.push(references[j]);
                }
            }
            removes.push(not_used[0]);
            in_use.splice(in_use.indexOf(not_used[0]), 1);
        } else {
            removes.push(null);
        }
        if (!in_use.includes(ref)) {
            in_use.push(ref);
            faults.push(true);
        } else {
            faults.push(false);
        }
    }
    render_output(references, faults, removes);
}

/**
 * Least Recently Used Algorithm
 * @param {Number[]} references
 * @param {Number} frames
 */
function lru(references, frames) {
    if (references.length < 1) {
        return;
    }
    const last_used = new Map();
    const in_use = [];
    const faults = [];
    const removes = [];
    for (let i = 0; i < references.length; i++) {
        const ref = references[i];
        last_used.set(ref, i);
        if (in_use.length === frames && !in_use.includes(ref)) {
            let min_time = Infinity;
            let min_ref;
            for (let j = 0; j < in_use.length; j++) {
                const time = last_used.get(in_use[j]);
                if (time < min_time) {
                    min_time = time;
                    min_ref = in_use[j];
                }
            }
            removes.push(min_ref);
            in_use.splice(in_use.indexOf(min_ref), 1);
        } else {
            removes.push(null);
        }
        if (!in_use.includes(ref)) {
            in_use.push(ref);
            faults.push(true);
        } else {
            faults.push(false);
        }
    }
    render_output(references, faults, removes);
}

/**
 * Second Chance Algorithm
 * @param {Number[]} references
 * @param {Number} frames
 */
function sc(references, frames) {
    if (references.length < 1) {
        return;
    }
    const in_use = [];
    const faults = [];
    const removes = [];
    const ref_bit = new Array(frames).fill(false);
    let pointer = 0;
    for (let i = 0; i < references.length; i++) {
        const ref = references[i];
        // console.log(
        //     `Frames: ${in_use} | Current: ${ref} | Pointer: ${pointer}`
        // );
        if (!in_use.includes(ref)) {
            faults.push(true);
        } else {
            faults.push(false);
        }
        if (in_use.includes(ref)) {
            ref_bit[in_use.indexOf(ref)] = true;
            removes.push(null);
            continue;
        }
        if (in_use.length < frames && !in_use.includes(ref)) {
            in_use.push(ref);
            removes.push(null);
            continue;
        }
        if (in_use.length === frames && !in_use.includes(ref)) {
            while (ref_bit[pointer]) {
                ref_bit[pointer] = false;
                pointer += 1;
                pointer %= frames;
            }
            removes.push(in_use[pointer]);
            in_use[in_use.indexOf(in_use[pointer])] = ref;
            pointer += 1;
            pointer %= frames;
        }
    }
    render_output(references, faults, removes);
}

/**
 * Least Frequently Used Algorithm
 * @param {Number[]} references
 * @param {Number} frames
 */
function lfu(references, frames) {
    if (references.length < 1) {
        return;
    }
    const freq = new Map();
    const in_use = [];
    const faults = [];
    const removes = [];
    for (const ref of references) {
        freq.set(ref, 0);
    }
    for (const ref of references) {
        if (in_use.length === frames && !in_use.includes(ref)) {
            let min_freq = Infinity;
            let min_ref;
            for (const [key, value] of freq.entries()) {
                if (value < min_freq && in_use.includes(key)) {
                    min_freq = value;
                    min_ref = key;
                }
            }
            removes.push(min_ref);
            in_use.splice(in_use.indexOf(min_ref), 1);
        } else {
            removes.push(null);
        }
        if (!in_use.includes(ref)) {
            in_use.push(ref);
            faults.push(true);
        } else {
            faults.push(false);
        }
        freq.set(ref, freq.get(ref) + 1);
    }
    render_output(references, faults, removes);
}

/**
 * First In First Out Algorithm
 * @param {Number[]} references
 * @param {Number} frames
 */
function fifo(references, frames) {
    if (references.length < 1) {
        return;
    }
    const queue = [];
    const faults = [];
    const removes = [];
    for (const ref of references) {
        if (queue.length === frames && !queue.includes(ref)) {
            const removed = queue.shift();
            removes.push(removed);
        } else {
            removes.push(null);
        }
        if (!queue.includes(ref)) {
            queue.push(ref);
            faults.push(true);
        } else {
            faults.push(false);
        }
    }
    render_output(references, faults, removes);
}

function render_output(references, faults, removes) {
    const tbody = document.getElementById("output-tbody");
    tbody.innerHTML = "";
    const ref_row = document.createElement("tr");
    let ref_cell = document.createElement("td");
    ref_cell.textContent = "References";
    ref_row.appendChild(ref_cell);
    for (let i = 0; i < references.length; i++) {
        ref_cell = document.createElement("td");
        ref_cell.textContent = references[i];
        ref_row.appendChild(ref_cell);
    }
    tbody.appendChild(ref_row);

    const fault_row = document.createElement("tr");
    let fault_cell = document.createElement("td");
    fault_cell.textContent = "Faults";
    fault_row.appendChild(fault_cell);
    for (let i = 0; i < faults.length; i++) {
        fault_cell = document.createElement("td");
        if (faults[i]) {
            fault_cell.textContent = "F";
        } else {
            fault_cell.textContent = "–";
        }
        fault_row.appendChild(fault_cell);
    }
    tbody.appendChild(fault_row);

    const remove_row = document.createElement("tr");
    let remove_cell = document.createElement("td");
    remove_cell.textContent = "Removed";
    remove_row.appendChild(remove_cell);
    for (let i = 0; i < removes.length; i++) {
        remove_cell = document.createElement("td");
        if (removes[i]) {
            remove_cell.textContent = removes[i];
        } else {
            remove_cell.textContent = "–";
        }
        remove_row.appendChild(remove_cell);
    }
    tbody.appendChild(remove_row);

    const pf = document.getElementById("pf");
    const pr = document.getElementById("pr");
    pf.textContent = `Page Faults: ${faults.filter((f) => f).length}`;
    pr.textContent = `Page Replacements: ${removes.filter((r) => r).length}`;
}

async function calculate() {
    const algo = document.getElementById("algo").value;

    /** @type {string} */
    let reflist = document.getElementById("reflist").value;
    reflist = reflist.replace(/[^0-9\s]+/g, "");
    reflist = reflist.replace(/\s+/g, " ");
    reflist = reflist.trim();

    const references = reflist.split(" ").map(Number);
    let frames = Number(document.getElementById("frames").value);
    if (isNaN(frames) || frames < 1) {
        frames = 1;
        document.getElementById("frames").value = frames;
    }

    switch (algo) {
        case "optimal":
            optimal(references, frames);
            break;
        case "lru":
            lru(references, frames);
            break;
        case "lfu":
            lfu(references, frames);
            break;
        case "fifo":
            fifo(references, frames);
            break;
        case "sc":
            sc(references, frames);
            break;
        default:
            break;
    }
}
