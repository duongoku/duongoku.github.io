/**
 *
 * @param {string} text
 */
function parse_fraction(text) {
    const numerator = text.split("/")[0];
    const denominator = text.split("/")[1];
    const frac = parseFloat(numerator) / parseFloat(denominator);
    return frac;
}

/**
 *
 * @param {string} text
 * @param {string} access_time_name
 * @param {string} handling_time_name
 * @param {string} fault_rate_name
 * @returns
 */
function parse_value(
    text,
    access_time_name,
    handling_time_name,
    fault_rate_name
) {
    let access_regex = new RegExp(`${access_time_name}=[0-9\\./]+`, "g");
    let handling_regex = new RegExp(`${handling_time_name}=[0-9\\./]+`, "g");
    let fault_regex = new RegExp(`${fault_rate_name}=[0-9\\./]+`, "g");
    let raw_access_time = text.match(access_regex)[0];
    let raw_handling_time = text.match(handling_regex)[0];
    let raw_fault_rate = text.match(fault_regex)[0];
    raw_access_time = raw_access_time.split("=")[1];
    raw_handling_time = raw_handling_time.split("=")[1];
    raw_fault_rate = raw_fault_rate.split("=")[1];
    let access_time = parse_fraction(raw_access_time);
    let handling_time = parse_fraction(raw_handling_time);
    let fault_rate = parse_fraction(raw_fault_rate);
    return { access_time, handling_time, fault_rate };
}

/**
 *
 * @param {string} text
 */
function preprocess(text) {
    text = text.toLowerCase();
    text = text.replace(/:/g, "");
    text = text.replace(/;/g, "");
    text = text.replace(/ms/g, "milliseconds");
    text = text.replace(/mili/g, "milli");
    text = text.replace(/\n+/g, " ");
    text = text.replace(/is\s+/g, "= ");
    text = text.replace(/\s+/g, "");
    text = text.replace(/%/g, "/100");
    text = text.replace(/millisec/g, "/1000");
    text = text.replace(/microsec/g, "/1000000");
    text = text.replace(/nanosec/g, "/1000000000");
    return text;
}

function calculate_eat(access_time, handling_time, fault_rate) {
    const eat = access_time * (1 - fault_rate) + handling_time * fault_rate;
    const answer = document.getElementById("answer");
    const rounded = document.getElementById("rounded");
    answer.textContent = `${eat * 1e6} microseconds`;
    rounded.textContent = `${Math.round(eat * 1e7) / 10} microseconds`;
}

function calculate_eat_tlb(access_time, handling_time, fault_rate) {
    const eat =
        (access_time * 2 + handling_time) * (1 - fault_rate) +
        (access_time + handling_time) * fault_rate;
    const answer = document.getElementById("answer");
    const rounded = document.getElementById("rounded");
    console.log(eat);
    answer.textContent = `${eat * 1e3} ms`;
    rounded.textContent = `${Math.round(eat * 1e4) / 10} ms`;
}

function calculate_slow(access_time, handling_time, fault_rate) {
    const slow =
        (access_time * (1 - fault_rate) + handling_time * fault_rate) /
        access_time;
    const answer = document.getElementById("answer");
    const rounded = document.getElementById("rounded");
    answer.textContent = slow;
    rounded.textContent = Math.round(slow);
}

/**
 *
 * @param {string} text
 */
function parse_text(text) {
    text = preprocess(text);
    if (text.includes("slowdown")) {
        const { access_time, handling_time, fault_rate } = parse_value(
            text,
            "accesstime",
            "handlingtime",
            "faultrate"
        );
        calculate_slow(access_time, handling_time, fault_rate);
    } else if (
        text.includes("(eat)") &&
        (text.includes("without") || text.includes("notuse"))
    ) {
        const { access_time, handling_time, fault_rate } = parse_value(
            text,
            "accesstime",
            "servicetime",
            "faultrate"
        );
        calculate_eat(access_time, handling_time, fault_rate);
    } else if (text.includes("(eat)")) {
        const { access_time, handling_time, fault_rate } = parse_value(
            text,
            "accesstimeofthememory",
            "accesstimeoftlb",
            "hitrateoftlb"
        );
        calculate_eat_tlb(access_time, handling_time, fault_rate);
    } else {
        throw new Error("Not supported");
    }
}

async function solve() {
    const problem = document.getElementById("problem").value;
    try {
        parse_text(problem);
    } catch (e) {
        answer.textContent = "Not supported";
        rounded.textContent = "Not supported";
    }
}
