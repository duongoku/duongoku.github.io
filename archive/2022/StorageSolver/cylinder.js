/**
 *
 * @param {Array<Number>} request_list
 * @param {Number} current
 * @returns
 */
function fcfs_seek(request_list, current) {
    let order = [];
    let distance = 0;
    if (request_list.includes(current)) {
        request_list.splice(request_list.indexOf(current), 1);
        order.push(current);
    }
    for (let i = 0; i < request_list.length; i++) {
        distance += Math.abs(request_list[i] - current);
        current = request_list[i];
        order.push(current);
    }
    return { distance, order };
}

/**
 *
 * @param {Array<Number>} request_list
 * @param {Number} current
 * @returns
 */
function sstf_seek(request_list, current) {
    let order = [];
    let distance = 0;
    if (request_list.includes(current)) {
        request_list.splice(request_list.indexOf(current), 1);
        order.push(current);
    }
    while (request_list.length > 0) {
        let min_id = 0;
        let min_dist = Math.abs(request_list[0] - current);
        for (let i = 0; i < request_list.length; i++) {
            let dist = Math.abs(request_list[i] - current);
            if (dist < min_dist) {
                min_dist = dist;
                min_id = i;
            }
        }
        distance += min_dist;
        current = request_list[min_id];
        order.push(current);
        request_list.splice(min_id, 1);
    }
    return { distance, order };
}

/**
 *
 * @param {Array<Number>} request_list
 * @param {Number} current
 * @param {Number} begin
 * @param {Number} end
 * @param {Boolean} isForward
 * @returns
 */
function scan_seek(request_list, current, begin, end, isForward) {
    let order = [];
    let distance = 0;
    request_list = request_list.sort((a, b) => a - b);

    // Calculate move distance
    if (isForward) {
        distance += Math.abs(end - current);
        distance += Math.abs(end - request_list[0]);
    } else {
        distance += Math.abs(begin - current);
        distance += Math.abs(begin - request_list[request_list.length - 1]);
    }

    // Calculate serve order
    if (!request_list.includes(current)) {
        request_list.push(current);
    }
    request_list = request_list.sort((a, b) => a - b);
    const current_id = request_list.indexOf(current);
    if (isForward) {
        for (let i = current_id + 1; i < request_list.length; i++) {
            order.push(request_list[i]);
        }
        // if (request_list[request_list.length - 1] !== end) {
        //     order.push(end);
        // }
        for (let i = current_id - 1; i >= 0; i--) {
            order.push(request_list[i]);
        }
    } else {
        for (let i = current_id - 1; i >= 0; i--) {
            order.push(request_list[i]);
        }
        // if (request_list[0] !== begin) {
        //     order.push(begin);
        // }
        for (let i = current_id + 1; i < request_list.length; i++) {
            order.push(request_list[i]);
        }
    }

    return { distance, order };
}

/**
 *
 * @param {Array<Number>} request_list
 * @param {Number} current
 * @param {Number} begin
 * @param {Number} end
 * @param {Boolean} isForward
 * @returns
 */
function cscan_seek(request_list, current, begin, end, isForward) {
    let order = [];
    let distance = Math.abs(end - begin);
    if (!request_list.includes(current)) {
        request_list.push(current);
    }
    request_list = request_list.sort((a, b) => a - b);
    const current_id = request_list.indexOf(current);

    // Calculate move distance
    if (isForward) {
        distance += Math.abs(end - current);
        if (current_id > 0) {
            distance += Math.abs(request_list[current_id - 1] - begin);
        }
    } else {
        distance += Math.abs(current - begin);
        if (current_id < request_list.length - 1) {
            distance += Math.abs(end - request_list[current_id + 1]);
        }
    }

    // Calculate serve order
    if (isForward) {
        for (let i = current_id + 1; i < request_list.length; i++) {
            order.push(request_list[i]);
        }
        // if (request_list[request_list.length - 1] !== end) {
        //     order.push(end);
        // }
        // if (request_list[0] !== begin) {
        //     order.push(begin);
        // }
        for (let i = 0; i < current_id; i++) {
            order.push(request_list[i]);
        }
    } else {
        for (let i = current_id - 1; i >= 0; i--) {
            order.push(request_list[i]);
        }
        // if (request_list[0] !== begin) {
        //     order.push(begin);
        // }
        // if (request_list[request_list.length - 1] !== end) {
        //     order.push(end);
        // }
        for (let i = request_list.length - 1; i > current_id; i--) {
            order.push(request_list[i]);
        }
    }

    return { distance, order };
}

/**
 *
 * @param {Array<Number>} request_list
 * @param {Number} current
 * @param {Boolean} isForward
 * @returns
 */
function look_seek(request_list, current, isForward) {
    let order = [];
    request_list = request_list.sort((a, b) => a - b);

    // Calculate move distance
    let distance = Math.abs(
        request_list[0] - request_list[request_list.length - 1]
    );
    if (isForward) {
        distance += Math.abs(current - request_list[request_list.length - 1]);
    } else {
        distance += Math.abs(current - request_list[0]);
    }

    // Calculate serve order
    if (!request_list.includes(current)) {
        request_list.push(current);
    }
    request_list = request_list.sort((a, b) => a - b);
    const current_id = request_list.indexOf(current);
    if (isForward) {
        for (let i = current_id + 1; i < request_list.length; i++) {
            order.push(request_list[i]);
        }
        for (let i = current_id - 1; i >= 0; i--) {
            order.push(request_list[i]);
        }
    } else {
        for (let i = current_id - 1; i >= 0; i--) {
            order.push(request_list[i]);
        }
        for (let i = current_id + 1; i < request_list.length; i++) {
            order.push(request_list[i]);
        }
    }

    return { distance, order };
}

/**
 *
 * @param {Array<Number>} request_list
 * @param {Number} current
 * @param {Boolean} isForward
 * @returns
 */
function clook_seek(request_list, current, isForward) {
    let order = [];
    if (!request_list.includes(current)) {
        request_list.push(current);
    }
    request_list = request_list.sort((a, b) => a - b);
    let distance = Math.abs(
        request_list[0] - request_list[request_list.length - 1]
    );
    const current_id = request_list.indexOf(current);

    // Calculate move distance
    if (isForward) {
        distance += Math.abs(current - request_list[request_list.length - 1]);
        if (current_id > 0) {
            distance += Math.abs(
                request_list[0] - request_list[current_id - 1]
            );
        }
    } else {
        distance += Math.abs(current - request_list[0]);
        if (current_id < request_list.length - 1) {
            distance += Math.abs(
                request_list[request_list.length - 1] -
                    request_list[current_id + 1]
            );
        }
    }

    // Calculate serve order
    if (isForward) {
        for (let i = current_id + 1; i < request_list.length; i++) {
            order.push(request_list[i]);
        }
        for (let i = 0; i < current_id; i++) {
            order.push(request_list[i]);
        }
    } else {
        for (let i = current_id - 1; i >= 0; i--) {
            order.push(request_list[i]);
        }
        for (let i = request_list.length - 1; i > current_id; i--) {
            order.push(request_list[i]);
        }
    }

    return { distance, order };
}

/**
 *
 * @param {String} text
 * @returns
 */
function parse_cylinder(text) {
    let temp = text.match(/requeststring=[,0-9]+/g)[0];
    temp = temp.replace("requeststring=", "");
    const request_list = temp.split(",").map((x) => parseInt(x));

    temp = text.match(/atthecylinder[0-9]+/g)[0];
    const current = parseInt(temp.replace("atthecylinder", ""));

    temp = text.match(/markedfrom[0-9]+to[0-9]+/g)[0];
    temp = temp.replace("markedfrom", "");
    temp = temp.split("to");
    const begin = parseInt(temp[0]);
    const end = parseInt(temp[1]);

    let isForward = true;
    temp = text.match(/towardthecylinder[0-9]+/g);
    if (temp != null) {
        temp = parseInt(temp[0].replace("towardthecylinder", ""));
        isForward = temp === end;
    }

    if (text.includes("fcfs")) {
        return fcfs_seek(request_list, current, begin, end, isForward);
    }
    if (text.includes("sstf") || text.includes("ssft")) {
        return sstf_seek(request_list, current, begin, end, isForward);
    }
    if (text.includes("c-scan")) {
        return cscan_seek(request_list, current, begin, end, isForward);
    }
    if (text.includes("scan")) {
        return scan_seek(request_list, current, begin, end, isForward);
    }
    if (text.includes("c-look")) {
        return clook_seek(request_list, current, isForward);
    }
    if (text.includes("look")) {
        return look_seek(request_list, current, isForward);
    }

    return null;
}

// function test_request_list(request_list, current, begin, end) {
//     console.log(`Request list: ${request_list}`);
//     console.log(
//         `FCFS: ${JSON.stringify(fcfs_seek(request_list.slice(), current))}`
//     );
//     console.log(
//         `SSTF: ${JSON.stringify(sstf_seek(request_list.slice(), current))}`
//     );
//     console.log(
//         `SCAN: ${JSON.stringify(
//             scan_seek(request_list.slice(), current, begin, end, false)
//         )}`
//     );
//     console.log(
//         `CSCAN: ${JSON.stringify(
//             cscan_seek(request_list.slice(), current, begin, end, false)
//         )}`
//     );
//     console.log(
//         `LOOK: ${JSON.stringify(
//             look_seek(request_list.slice(), current, false)
//         )}`
//     );
//     console.log(
//         `CLOOK: ${JSON.stringify(
//             clook_seek(request_list.slice(), current, false)
//         )}`
//     );
// }

// async function test() {
//     const current = 47;
//     const begin = 0;
//     const end = 320;
//     test_request_list(
//         [87, 312, 147, 64, 212, 15, 89, 5, 128, 192, 50],
//         current,
//         begin,
//         end
//     );
//     test_request_list(
//         [14, 82, 198, 237, 7, 319, 192, 71, 281, 194, 47],
//         current,
//         begin,
//         end
//     );
//     test_request_list(
//         [89, 303, 78, 298, 132, 14, 93, 147, 249, 152],
//         current,
//         begin,
//         end
//     );
//     test_request_list([98, 183, 37, 122, 14, 124, 65, 67], current, begin, end);
// }

// test();

export { parse_cylinder };