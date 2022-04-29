function extract_processes(input) {
    let raw_processes = input.split("),").map(function (x) {
        let ret = x.replaceAll(/\s+/g, "");
        if (!ret.endsWith(")")) {
            ret = `${ret})`;
        }
        return ret;
    });
    let processes = [];
    for (raw_process of raw_processes) {
        let name = raw_process.split("(")[0];
        let raw_numbers = raw_process.split("(")[1].split(")")[0];
        if (raw_numbers.includes(",")) {
            let numbers = raw_numbers.split(",").map(function (x) {
                return parseInt(x);
            });
            processes.push({
                name: name,
                arrival_time: numbers[0],
                burst_time: numbers[1],
            });
        } else {
            processes.push({
                name: name,
                arrival_time: 0,
                burst_time: parseInt(raw_numbers),
            });
        }
    }
    return processes;
}

function calculate_result(result) {
    let ret = "<br />";
    let average_response_time = 0;
    let average_turnaround_time = 0;
    let average_waiting_time = 0;
    for (k of result.keys()) {
        res = result.get(k);
        result.get(k).response_time = res.start_time - res.arrival_time;
        result.get(k).turnaround_time = res.end_time - res.arrival_time;
        result.get(k).waiting_time = res.turnaround_time - res.burst_time;
        console.log(res);
        ret += `${k}: <br />`;
        ret += `Turnaround Time: ${result.get(k).turnaround_time} <br />`;
        ret += `Waiting Time: ${result.get(k).waiting_time} <br />`;
        ret += `Response Time: ${result.get(k).response_time} <br />`;
        average_response_time += result.get(k).response_time;
        average_turnaround_time += result.get(k).turnaround_time;
        average_waiting_time += result.get(k).waiting_time;
    }
    average_response_time /= result.size;
    average_turnaround_time /= result.size;
    average_waiting_time /= result.size;
    ret += "<br />";
    ret += `Average Turnaround Time: ${average_turnaround_time} <br />`;
    ret += `Average Waiting Time: ${average_waiting_time} <br />`;
    ret += `Average Response Time: ${average_response_time} <br />`;
    return ret;
}

function FCFS_SORT(a, b) {
    return a.arrival_time - b.arrival_time;
}

function STF_SORT(a, b) {
    if (a.arrival_time == b.arrival_time) {
        return a.burst_time - b.burst_time;
    }
    return a.arrival_time - b.arrival_time;
}

function FCFS(processes) {
    let ret = "";
    processes.sort(FCFS_SORT);
    let processes_count = processes.length;
    let result = new Map();
    for (process of processes) {
        result.set(process.name, {
            arrival_time: process.arrival_time,
            burst_time: process.burst_time,
            end_time: Infinity,
            response_time: Infinity,
            start_time: Infinity,
            turnaround_time: Infinity,
            waiting_time: Infinity,
        });
    }
    let current_time = 0;
    for (process of processes) {
        if (process.arrival_time > current_time) {
            ret += `${current_time} - ${process.arrival_time}: Idle <br />`;
            current_time = process.arrival_time;
        }
        if (result.get(process.name).start_time == Infinity) {
            result.get(process.name).start_time = current_time;
        }
        ret += `${current_time} - ${current_time + process.burst_time}: ${
            process.name
        } <br />`;
        current_time += process.burst_time;
        if (result.get(process.name).end_time == Infinity) {
            result.get(process.name).end_time = current_time;
        }
    }
    ret += `Throughput: ${processes_count / current_time} <br />`;
    ret += calculate_result(result);
    return ret;
}

function STF(processes) {
    let ret = "";
    processes.sort(STF_SORT);
    let processes_count = processes.length;
    let result = new Map();
    for (process of processes) {
        result.set(process.name, {
            arrival_time: process.arrival_time,
            burst_time: process.burst_time,
            end_time: Infinity,
            response_time: Infinity,
            start_time: Infinity,
            turnaround_time: Infinity,
            waiting_time: Infinity,
        });
    }
    let current_time = 0;
    while (processes.length > 0) {
        let process = processes.shift();
        if (process.arrival_time > current_time) {
            ret += `${current_time} - ${process.arrival_time}: Idle <br />`;
            current_time = process.arrival_time;
        }
        if (result.get(process.name).start_time == Infinity) {
            result.get(process.name).start_time = current_time;
        }
        ret += `${current_time} - ${current_time + process.burst_time}: ${
            process.name
        } <br />`;
        current_time += process.burst_time;
        if (result.get(process.name).end_time == Infinity) {
            result.get(process.name).end_time = current_time;
        }
        for (let i = 0; i < processes.length; i++) {
            if (processes[i].arrival_time <= current_time) {
                processes[i].arrival_time = current_time;
            }
        }
        processes.sort(STF_SORT);
    }
    ret += `Throughput: ${processes_count / current_time} <br />`;
    ret += calculate_result(result);
    return ret;
}

function SRTF(processes) {
    let ret = "";
    processes.sort(STF_SORT);
    let processes_count = processes.length;
    let result = new Map();
    for (process of processes) {
        result.set(process.name, {
            arrival_time: process.arrival_time,
            burst_time: process.burst_time,
            end_time: Infinity,
            response_time: Infinity,
            start_time: Infinity,
            turnaround_time: Infinity,
            waiting_time: Infinity,
        });
    }
    let queue = [];
    queue.push(processes.shift());
    let current_time = 0;
    while (queue.length > 0) {
        console.log(JSON.stringify(queue));
        let process = queue.shift();
        let next_arrival_time = Infinity;
        if (processes.length > 0) {
            next_arrival_time = processes[0].arrival_time;
        }
        if (process.arrival_time > current_time) {
            ret += `${current_time} - ${process.arrival_time}: Idle <br />`;
            current_time = process.arrival_time;
        }
        if (result.get(process.name).start_time == Infinity) {
            result.get(process.name).start_time = current_time;
        }
        if (current_time + process.burst_time > next_arrival_time) {
            if (next_arrival_time > current_time) {
                ret += `${current_time} - ${next_arrival_time}: ${process.name} <br />`;
            }
            process.burst_time -= next_arrival_time - current_time;
            current_time = next_arrival_time;
            queue.push(process);
            queue.push(processes.shift());
        } else {
            ret += `${current_time} - ${current_time + process.burst_time}: ${
                process.name
            } <br />`;
            current_time += process.burst_time;
            if (result.get(process.name).end_time == Infinity) {
                result.get(process.name).end_time = current_time;
            }
        }
        if (queue.length == 0 && processes.length > 0) {
            queue.push(processes.shift());
        }
        queue = queue.map(function (x) {
            if (x.arrival_time < current_time) {
                x.arrival_time = current_time;
            }
            return x;
        });
        queue.sort(STF_SORT);
    }
    ret += `Throughput: ${processes_count / current_time} <br />`;
    ret += calculate_result(result);
    return ret;
}

function RR(processes, quantum) {
    let ret = "";
    processes.sort(FCFS_SORT);
    let processes_count = processes.length;
    let result = new Map();
    for (process of processes) {
        result.set(process.name, {
            arrival_time: process.arrival_time,
            burst_time: process.burst_time,
            end_time: Infinity,
            response_time: Infinity,
            start_time: Infinity,
            turnaround_time: Infinity,
            waiting_time: Infinity,
        });
    }
    let queue = [];
    queue.push(processes.shift());
    let current_time = 0;
    while (queue.length > 0) {
        // console.log(`Processes: ${JSON.stringify(processes)}`);
        // console.log(`Queue: ${JSON.stringify(queue)}`);
        let process = queue.shift();
        if (process.arrival_time > current_time) {
            ret += `${current_time} - ${process.arrival_time}: Idle <br />`;
            current_time = process.arrival_time;
        } else {
            process.arrival_time = current_time;
        }
        if (result.get(process.name).start_time == Infinity) {
            result.get(process.name).start_time = current_time;
        }
        if (process.burst_time > quantum) {
            process.burst_time -= quantum;
            ret += `${current_time} - ${current_time + quantum}: ${
                process.name
            } <br />`;
            current_time += quantum;
            while (true) {
                if (processes.length > 0) {
                    let next_process = processes.shift();
                    if (next_process.arrival_time <= current_time) {
                        queue.push(next_process);
                    } else {
                        processes.unshift(next_process);
                        break;
                    }
                } else {
                    break;
                }
            }
            queue.push(process);
        } else {
            ret += `${current_time} - ${current_time + process.burst_time}: ${
                process.name
            } <br />`;
            current_time += process.burst_time;
            if (result.get(process.name).end_time == Infinity) {
                result.get(process.name).end_time = current_time;
            }
            if (processes.length > 0 && queue.length == 0) {
                queue.push(processes.shift());
            }
        }
    }
    ret += `Throughput: ${processes_count / current_time} <br />`;
    ret += calculate_result(result);
    return ret;
}

async function calculate(processes, algorithm, quantum) {
    let ret = "";
    switch (algorithm) {
        case "FCFS":
            ret = FCFS(processes);
            break;
        case "STF":
            ret = STF(processes);
            break;
        case "SRTF":
            ret = SRTF(processes);
            break;
        case "RR":
            ret = RR(processes, quantum);
            break;
        default:
            ret = "Invalid algorithm";
            break;
    }
    return ret;
}

function solve() {
    let input = document.getElementById("input").value;
    let algorithm = document.getElementById("algorithm").value;
    let quantum = document.getElementById("quantum").value;
    if (quantum == "") {
        quantum = 15;
    } else {
        quantum = parseInt(quantum);
    }
    let processes = extract_processes(input);
    calculate(processes, algorithm, quantum).then(function (result) {
        document.getElementById("result").innerHTML = result;
    });
}
