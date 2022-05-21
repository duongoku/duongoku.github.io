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
        temp = text.match(/\(from0\)[0-9\.]+[a-z]+/g);
        if (temp == null) {
            temp = "(from0)0byte";
        }
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

export { parse_fs };
