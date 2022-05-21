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
        request_list = request_list.splice(request_list.indexOf(current), 1);
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
        request_list = request_list.splice(request_list.indexOf(current), 1);
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
 * @param {Number} blockSize
 * @param {Number} pointerSize
 * @param {Number} directPointers
 * @param {Array<Number>} references
 * @returns
 */
function calculate_fs(blockSize, pointerSize, directPointers, reference) {
    const pointerPerBlock = Math.floor(blockSize / pointerSize);
    const indirectPointers = pointerPerBlock;
    const doubleIndirectPointers = pointerPerBlock ** 2;
    const tripleIndirectPointers = pointerPerBlock ** 3;
    const directThreshold = directPointers * blockSize;
    const indirectThreshold = directThreshold + indirectPointers * blockSize;
    const doubleIndirectThreshold =
        indirectThreshold + doubleIndirectPointers * blockSize;
    const tripleIndirectThreshold =
        doubleIndirectThreshold + tripleIndirectPointers * blockSize;
    const ref = reference;
    const result = [];
    if (ref < directThreshold) {
        const block = Math.floor(ref / blockSize);
        const offset = ref % blockSize;
        result.push({
            block,
            offset,
        });
    } else if (ref < indirectThreshold) {
        const block = Math.floor(ref / blockSize);
        const offset = ref % blockSize;
        const indirectBlock = block - directPointers;
        result.push({
            block,
            indirectBlock,
            offset,
        });
    } else if (ref < doubleIndirectThreshold) {
        const block = Math.floor(ref / blockSize);
        const offset = ref % blockSize;
        const blocksInSecond = block - indirectPointers - directPointers;
        const secondBlock = Math.floor(blocksInSecond / pointerPerBlock);
        const secondBlockOffset = blocksInSecond % pointerPerBlock;
        result.push({
            block,
            secondBlock,
            secondBlockOffset,
            offset,
        });
    } else if (ref < tripleIndirectThreshold) {
        const block = Math.floor(ref / blockSize);
        const offset = ref % blockSize;
        const blocksInThird =
            block - doubleIndirectPointers - indirectPointers - directPointers;
        const thirdBlock = Math.floor(blocksInThird / doubleIndirectPointers);
        const thirdBlockOffset = blocksInThird % doubleIndirectPointers;
        const secondBlock = Math.floor(thirdBlockOffset / pointerPerBlock);
        const secondBlockOffset = thirdBlockOffset % pointerPerBlock;
        result.push({
            block,
            thirdBlock,
            secondBlock,
            secondBlockOffset,
            offset,
        });
    } else {
        result.push({});
    }
    return result[0];
}

/**
 *
 * @param {Number} block_size
 * @param {Number} pointer_size
 * @param {Number} reference
 * @returns
 */
function calculate_linked_list_alloc(block_size, pointer_size, reference) {
    const data_size = block_size - pointer_size;
    const data_block = Math.floor(reference / data_size);
    const offset = (reference % data_size) + pointer_size;
    return {
        "Block ID": data_block,
        Offset: offset,
    };
}

/**
 *
 * @param {Number} block_size
 * @param {Number} pointer_size
 * @param {Number} reference
 * @returns
 */
function calculate_linked_index_alloc(block_size, pointer_size, reference) {
    const pointer_per_block = Math.floor(block_size / pointer_size) - 1;
    const block_id = Math.floor(reference / block_size);
    const offset = reference % block_size;
    const index_block_id = Math.floor(block_id / pointer_per_block);
    const index_block_offset = block_id % pointer_per_block;
    return {
        "Index Block ID": index_block_id,
        "Index Block Offset": index_block_offset,
        "Block ID": block_id,
        Offset: offset,
    };
}

/**
 *
 * @param {Number} block_size
 * @param {Number} pointer_size
 * @param {Number} reference
 * @returns
 */
function calculate_contiguous_alloc(block_size, reference) {
    const block_id = Math.floor(reference / block_size);
    const offset = reference % block_size;
    return {
        "Block ID": block_id,
        Offset: offset,
    };
}

/**
 *
 * @param {Number} block_size
 * @param {Number} extent_size
 * @param {Number} reference
 * @returns
 */
function calculate_extent_alloc(block_size, extent_size, reference) {
    const extent_id = Math.floor(reference / (extent_size * block_size));
    const block_id = Math.floor(reference / block_size) % extent_size;
    const offset = reference % block_size;
    return {
        "Extent ID": extent_id,
        "Block ID": block_id,
        Offset: offset,
    };
}

/**
 *
 * @param {Number} block_size
 * @param {Number} pointer_size
 * @param {Number} reference
 * @param {Number} level
 * @returns
 */
function calculate_indexed_alloc(block_size, pointer_size, reference, level) {
    if (level == 1) {
        const block_id = Math.floor(reference / block_size);
        const offset = reference % block_size;
        const pointer_per_block = Math.floor(block_size / pointer_size);
        const max_file_size = pointer_per_block * block_size;
        return {
            "Block ID": block_id,
            Offset: offset,
            "Max File Size": parse_file_size(max_file_size),
        };
    }
    if (level == 2) {
        const pointer_per_block = Math.floor(block_size / pointer_size);
        const block_id = Math.floor(reference / block_size);
        const offset = reference % block_size;
        const block_level_2_id = Math.floor(block_id / pointer_per_block);
        const block_level_2_offset = block_id % pointer_per_block;
        const max_file_size = pointer_per_block ** 2 * block_size;
        return {
            "Block Level 2 ID": block_level_2_id,
            "Block Level 2 Offset": block_level_2_offset,
            Offset: offset,
            "Max File Size": parse_file_size(max_file_size),
        };
    }
    return {};
}

/**
 *
 * @param {Number} size_in_bytes
 * @returns
 */
function parse_file_size(size_in_bytes) {
    if (size_in_bytes % 2 ** 30 == 0) {
        return `${size_in_bytes / 2 ** 30} GB`;
    } else if (size_in_bytes % 2 ** 20 == 0) {
        return `${size_in_bytes / 2 ** 20} MB`;
    } else if (size_in_bytes % 2 ** 10 == 0) {
        return `${size_in_bytes / 2 ** 10} KB`;
    } else {
        return `${size_in_bytes} bytes`;
    }
}

/**
 *
 * @param {String} text
 */
function parse_size(text) {
    const numstring = text.replace(/[^0-9\.]/g, "");
    if (text.endsWith("kb") || text.endsWith("kbs")) {
        return Math.round(parseFloat(numstring) * 1024);
    }
    if (text.endsWith("mb") || text.endsWith("mbs")) {
        return Math.round(parseFloat(numstring) * 1024 * 1024);
    }
    if (text.endsWith("gb") || text.endsWith("gbs")) {
        return Math.round(parseFloat(numstring) * 1024 * 1024 * 1024);
    }
    return parseInt(numstring);
}

/**
 *
 * @param {String} text
 */
function preprocess(text) {
    text = text.toLowerCase();
    text = text.replace(/\n+/g, " ");
    text = text.replace(/is\s+/g, "= ");
    text = text.replace(/of\s+/g, "= ");
    text = text.replace(/\s+/g, "");
    return text;
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

/**
 *
 * @param {String} text
 * @returns
 */
function parse_fs(text) {
    let temp = text.match(/blocksize=[0-9\.]+[a-z]+/g)[0];
    const block_size = parse_size(temp.replace("blocksize=", ""));

    temp = text.replace(/pointersize/g, "pointer");
    temp = temp.match(/pointer=[0-9\.]+[a-z]+/g);
    if (temp == null) {
        temp = "pointer=0byte";
    } else {
        temp = temp[0];
    }
    const pointer_size = parse_size(temp.replace("pointer=", ""));

    if (text.includes("unix") || text.includes("linux")) {
        temp = text.match(/addressx=[0-9]+/g)[0];
        const reference = parseInt(temp.replace("addressx=", ""));
        if (text.includes("unix")) {
            return calculate_fs(block_size, pointer_size, 12, reference);
        }
        if (text.includes("linux")) {
            return calculate_fs(block_size, pointer_size, 10, reference);
        }
        return null;
    }

    if (text.includes("allocation")) {
        temp = text.match(/\(from0\)[0-9\.]+[a-z]+/g)[0];
        const reference = parse_size(temp.replace("(from0)", ""));
        if (text.includes("linkedlist")) {
            return calculate_linked_list_alloc(
                block_size,
                pointer_size,
                reference
            );
        }
        if (text.includes("linkedindex")) {
            return calculate_linked_index_alloc(
                block_size,
                pointer_size,
                reference
            );
        }
        if (text.includes("extent-based")) {
            const extent_size = parseInt(
                text
                    .match(/extentconsists=[0-9]+/g)[0]
                    .replace("extentconsists=", "")
            );
            return calculate_extent_alloc(block_size, extent_size, reference);
        }
        if (
            text.includes("indexed") &&
            (text.includes("1-level") || text.includes("1level"))
        ) {
            return calculate_indexed_alloc(
                block_size,
                pointer_size,
                reference,
                1
            );
        }
        if (
            text.includes("indexed") &&
            (text.includes("2-level") || text.includes("2level"))
        ) {
            return calculate_indexed_alloc(
                block_size,
                pointer_size,
                reference,
                2
            );
        }
        if (text.includes("contiguous")) {
            return calculate_contiguous_alloc(block_size, reference);
        }
    }
}

/**
 *
 * @param {String} text
 */
function parse_text(text) {
    text = preprocess(text);
    if (text.includes("cylinder")) {
        const answer = document.getElementById("answer");
        const result = parse_cylinder(text);
        answer.innerText = `Distance: ${
            result.distance
        }\nOrder: ${result.order.join(" ")}`;
        return;
    }
    if (text.includes("allocation") || text.includes("filesystem")) {
        const answer = document.getElementById("answer");
        const result = parse_fs(text);
        answer.innerText = "";
        for (const key in result) {
            answer.innerText += `${key}: ${result[key]}\n`;
        }
        return;
    }
}

async function solve() {
    const problem = document.getElementById("problem").value;
    try {
        parse_text(problem);
    } catch (e) {
        const answer = document.getElementById("answer");
        answer.innerText = "Not supported";
    }
}

function test_request_list(request_list, current, begin, end) {
    console.log(`Request list: ${request_list}`);
    console.log(
        `FCFS: ${JSON.stringify(fcfs_seek(request_list.slice(), current))}`
    );
    console.log(
        `SSTF: ${JSON.stringify(sstf_seek(request_list.slice(), current))}`
    );
    console.log(
        `SCAN: ${JSON.stringify(
            scan_seek(request_list.slice(), current, begin, end, false)
        )}`
    );
    console.log(
        `CSCAN: ${JSON.stringify(
            cscan_seek(request_list.slice(), current, begin, end, false)
        )}`
    );
    console.log(
        `LOOK: ${JSON.stringify(
            look_seek(request_list.slice(), current, false)
        )}`
    );
    console.log(
        `CLOOK: ${JSON.stringify(
            clook_seek(request_list.slice(), current, false)
        )}`
    );
}

async function test() {
    const current = 47;
    const begin = 0;
    const end = 320;
    test_request_list(
        [87, 312, 147, 64, 212, 15, 89, 5, 128, 192, 50],
        current,
        begin,
        end
    );
    test_request_list(
        [14, 82, 198, 237, 7, 319, 192, 71, 281, 194, 47],
        current,
        begin,
        end
    );
    test_request_list(
        [89, 303, 78, 298, 132, 14, 93, 147, 249, 152],
        current,
        begin,
        end
    );
    // test_request_list([98, 183, 37, 122, 14, 124, 65, 67], current, begin, end);
}

// test();
