/**
 *
 * @param {String} text
 * @returns
 */
function parse_raid(text) {
    if (text.includes("parityblock")) {
        const blocks_as_str = text
            .match(/\([01]+\)/g)
            .map((x) => x.replace("(", "").replace(")", ""));
        const blocks = blocks_as_str.map((x) => parseInt(x, 2));
        const parity_block = blocks.reduce((a, b) => a ^ b);
        return {
            "Parity Block": parity_block
                .toString(2)
                .padStart(blocks_as_str[0].length, "0"),
        };
    }
    if (text.includes("level-5")) {
        let temp = text.match(/[0-9]+hard-disk/g)[0];
        temp = temp.replace("hard-disk", "");
        const disk_count = parseInt(temp);

        temp = text.match(/size[0-9]+[a-z]+/g)[0];
        let temp_2 = temp.match(/size[0-9]+/g)[0];
        const unit = temp.replace(temp_2, "");
        const disk_size = parseInt(temp_2.replace("size", ""));
        const performance = disk_count - 1;
        const max_size = `${disk_size * performance} ${unit.toUpperCase()}`;

        return {
            "Performance Improvement": `${performance} times`,
            "Maximum Size": max_size,
        };
    }
    if (text.includes("level-6")) {
        let temp = text.match(/[0-9]+hard-disk/g)[0];
        temp = temp.replace("hard-disk", "");
        const disk_count = parseInt(temp);

        temp = text.match(/size[0-9]+[a-z]+/g)[0];
        let temp_2 = temp.match(/size[0-9]+/g)[0];
        const unit = temp.replace(temp_2, "");
        const disk_size = parseInt(temp_2.replace("size", ""));
        const performance = disk_count - 2;
        const max_size = `${disk_size * performance} ${unit}`;

        return {
            "Performance Improvement": `${performance} times`,
            "Maximum Size": max_size,
        };
    }
}

export { parse_raid };