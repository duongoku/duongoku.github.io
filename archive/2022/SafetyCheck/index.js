function get_problem_type() {
    let problem_type = document.getElementById("problem-type").value;
    return problem_type;
}

async function apply_changes(processes, available) {
    let res_elem = document.getElementById("res-cnt");
    let pro_elem = document.getElementById("pro-cnt");
    res_elem.value = available.length;
    pro_elem.value = processes.length;
    await generate();
    let table_elem = document.getElementsByClassName("input-table")[0];
    let tbody_elem = table_elem.children[0].children[0];
    let row_elems = tbody_elem.children;
    if (available.length > 0) {
        let row_elem = row_elems[1];
        let available_elems = row_elem.children[3].children;
        for (let i = 0; i < available_elems.length; i++) {
            available_elems[i].value = available[i];
        }
    }
    for (let i = 1; i < row_elems.length; i++) {
        let name_elem = row_elems[i].children[0].children[0];
        let alloc_elems = row_elems[i].children[1].children;
        let max_elems = row_elems[i].children[2].children;
        let process = processes[i - 1];
        name_elem.value = process.name;
        for (let j = 0; j < alloc_elems.length; j++) {
            alloc_elems[j].value = process.allocation[j];
            max_elems[j].value = process.max[j];
        }
    }
    await check();
}

async function parse_text() {
    let textarea = document.getElementById("text-to-parse");
    let text = textarea.value;

    // Whitespaces trimming
    text = text.replaceAll(/\s+/g, " ");
    text = text.trim();

    // Filter out words with no number in them
    let words = text.split(" ").filter((word) => {
        return /\d/.test(word);
    });
    words.push("dummy");

    let processes = [];
    let pre_processes = [];
    let last = 0;

    for (let i = 1; i < words.length; i++) {
        if (/[a-zA-Z]/.test(words[i])) {
            pre_processes.push(words.slice(last, i));
            last = i;
        }
    }

    let resource_count = (pre_processes[0].length - 1) / 3;
    let available = pre_processes[0].slice(resource_count * 2 + 1);

    for (let i = 0; i < pre_processes.length; i++) {
        let process = {
            name: pre_processes[i][0],
            allocation: [],
            max: [],
        };
        for (let j = 0; j < resource_count; j++) {
            process.allocation.push(parseInt(pre_processes[i][j + 1]));
        }
        for (let j = resource_count; j < resource_count * 2; j++) {
            process.max.push(parseInt(pre_processes[i][j + 1]));
        }
        processes.push(process);
    }

    // console.log(JSON.stringify(processes));
    // console.log(JSON.stringify(available));

    apply_changes(processes, available);
}

async function init_check() {
    let resource_count = parseInt(document.getElementById("res-cnt").value);
    let process_elems = document.getElementsByClassName("input-row");
    let problem_type = get_problem_type();
    let processes = [];
    let available = [];
    for (elem of process_elems) {
        let process = {
            name: elem.children[0].children[0].value,
            allocation: [],
            max: [],
            need: [],
        };
        for (let i = 0; i < resource_count; i++) {
            process.allocation.push(
                parseInt(elem.children[1].children[i].value)
            );
            process.max.push(parseInt(elem.children[2].children[i].value));
            if (elem.children.length > 3) {
                available.push(parseInt(elem.children[3].children[i].value));
            }
        }
        if (problem_type === "banker") {
            process.need = math.subtract(process.max, process.allocation);
        } else if (problem_type === "resreq") {
            process.need = process.max;
        }
        processes.push(process);
    }
    return {
        processes,
        available,
    };
}

function get_finish_array(processes) {
    let finish_array = [];
    for (let i = 0; i < processes.length; i++) {
        if (processes[i].finished) {
            finish_array.push(true);
        } else {
            finish_array.push(false);
        }
    }
    return finish_array;
}

async function check() {
    let init = await init_check();
    let problem_type = get_problem_type();
    let processes = init.processes;
    let available = init.available;
    let log = `AVAILABLE: ${JSON.stringify(available)}`;
    let changed = true;
    // console.log(JSON.stringify(processes));
    // console.log(JSON.stringify(available));
    if (problem_type === "resreq") {
        let zeros = math.zeros(available.length);
        for (let i = 0; i < processes.length; i++) {
            let process = processes[i];
            processes[i].finished = false;
            if (
                math.deepEqual(process.need, zeros) &&
                math.deepEqual(process.allocation, zeros)
            ) {
                processes[i].finished = true;
                log = `${log}<br />${
                    processes[i].name
                } FINISHED, FINISH: ${JSON.stringify(
                    get_finish_array(processes)
                )}, WORK: ${JSON.stringify(available)}`;
            }
        }
    }
    while (changed) {
        changed = false;
        for (let i = 0; i < processes.length; i++) {
            if (!("finished" in processes[i])) {
                processes[i].finished = false;
            }
            if (!processes[i].finished) {
                let comparison = math.smallerEq(processes[i].need, available);
                if (comparison.length < 2) {
                    comparison.push(true);
                    comparison.push(true);
                }

                if (comparison.reduce((a, b) => a && b)) {
                    available = math.add(available, processes[i].allocation);
                    processes[i].finished = true;
                    changed = true;
                    log = `${log}<br />${
                        processes[i].name
                    } FINISHED, FINISH: ${JSON.stringify(
                        get_finish_array(processes)
                    )}, WORK: ${JSON.stringify(available)}`;
                    break;
                }
            }
        }
    }

    if (processes.every((process) => process.finished)) {
        if (problem_type === "banker") {
            document.getElementById("result").innerText = "The system is safe";
        } else if (problem_type === "resreq") {
            document.getElementById("result").innerText =
                "Deadlock NOT DETECTED";
        }
        document.getElementById("result").classList.remove("red");
    } else {
        if (problem_type === "banker") {
            document.getElementById("result").innerText =
                "The system is NOT safe";
        } else if (problem_type === "resreq") {
            document.getElementById("result").innerText = "Deadlock DETECTED";
        }
        document.getElementById("result").classList.add("red");
    }
    document.getElementsByClassName("log")[0].innerHTML = log;
}

async function generate() {
    let problem_type = get_problem_type();
    let header_row = document.getElementById("header-row");

    if (problem_type === "banker") {
        header_row.children[2].textContent = "Max";
    } else if (problem_type === "resreq") {
        header_row.children[2].textContent = "Request";
    }

    let resource_count = parseInt(document.getElementById("res-cnt").value);
    let processes_count = parseInt(document.getElementById("pro-cnt").value);
    let table_div = document.getElementsByClassName("input-table")[0];
    let table = table_div.firstElementChild;
    let tbody = table.firstElementChild;
    let rows = tbody.children;
    for (let i = rows.length - 1; i > 0; i--) {
        tbody.removeChild(rows[i]);
    }
    for (let i = 0; i < processes_count; i++) {
        let row = document.createElement("tr");
        let name_cell = document.createElement("td");
        let name_input = document.createElement("input");
        name_input.setAttribute("type", "text");
        name_input.setAttribute("value", "P" + (i + 1));
        name_cell.appendChild(name_input);
        row.appendChild(name_cell);
        let max_j;
        if (i === 0) {
            max_j = 4;
        } else {
            max_j = 3;
        }
        for (let j = 1; j < max_j; j++) {
            let cell = document.createElement("td");
            for (let k = 0; k < resource_count; k++) {
                let input = document.createElement("input");
                input.setAttribute("type", "text");
                input.setAttribute("value", Math.floor(Math.random() * 10));
                cell.appendChild(input);
            }
            row.appendChild(cell);
        }
        row.classList.add("input-row");
        tbody.appendChild(row);
    }
}
