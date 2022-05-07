/**
 *
 * @param {string} text
 */
function parse_text(text) {
    text = text.toLowerCase();
    text = text.replace(/%/g, "/100");
    text = text.replace(/:/g, "");
    text = text.replace(/;/g, "");
    text = text.replace(/ms/g, "milliseconds");
    text = text.replace(/mili/g, "milli");
    text = text.replace(/\n+/g, " ");
    text = text.replace(/is\s+/g, "= ");
    text = text.replace(/\s+/g, "");
    if (text.includes("slowdown")) {
        let raw_access_time = text.match(/accesstime=[0-9\.]+nano/g)[0];
        let raw_handling_time = text.match(/handlingtime=[0-9\.]+milli/g)[0];
        let raw_fault_rate = text.match(/faultrate=[0-9\./]+/g)[0];
        raw_access_time = raw_access_time.split("=")[1].split("nano")[0];
        raw_handling_time = raw_handling_time.split("=")[1].split("milli")[0];
        raw_fault_rate = raw_fault_rate.split("=")[1];
        const numerator = raw_fault_rate.split("/")[0];
        const denominator = raw_fault_rate.split("/")[1];
        let access_time = parseFloat(raw_access_time) / 1e9;
        let handling_time = parseFloat(raw_handling_time) / 1e3;
        let fault_rate = parseFloat(numerator) / parseFloat(denominator);
        calculate_slow(access_time, handling_time, fault_rate);
    } else if (
        text.includes("(eat)") &&
        (text.includes("without") || text.includes("notuse"))
    ) {
        let raw_access_time = text.match(/accesstime=[0-9\.]+nano/g)[0];
        let raw_handling_time = text.match(/servicetime=[0-9\.]+milli/g)[0];
        let raw_fault_rate = text.match(/faultrate=[0-9\./]+/g)[0];
        raw_access_time = raw_access_time.split("=")[1].split("nano")[0];
        raw_handling_time = raw_handling_time.split("=")[1].split("milli")[0];
        raw_fault_rate = raw_fault_rate.split("=")[1];
        const numerator = raw_fault_rate.split("/")[0];
        const denominator = raw_fault_rate.split("/")[1];
        let access_time = parseFloat(raw_access_time) / 1e9;
        let handling_time = parseFloat(raw_handling_time) / 1e3;
        let fault_rate = parseFloat(numerator) / parseFloat(denominator);
        calculate_eat(access_time, handling_time, fault_rate);
    } else if (text.includes("(eat)")) {
        let raw_access_time = text.match(
            /accesstimeofthememory=[0-9\.]+milli/g
        )[0];
        let raw_handling_time = text.match(/accesstimeoftlb=[0-9\.]+milli/g)[0];
        let raw_fault_rate = text.match(/hitrateoftlb=[0-9\./]+/g)[0];
        raw_access_time = raw_access_time.split("=")[1].split("nano")[0];
        raw_handling_time = raw_handling_time.split("=")[1].split("milli")[0];
        raw_fault_rate = raw_fault_rate.split("=")[1];
        const numerator = raw_fault_rate.split("/")[0];
        const denominator = raw_fault_rate.split("/")[1];
        let access_time = parseFloat(raw_access_time) / 1e3;
        let handling_time = parseFloat(raw_handling_time) / 1e3;
        let fault_rate = parseFloat(numerator) / parseFloat(denominator);
        calculate_eat_tlb(access_time, handling_time, fault_rate);
    }
    return null;
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
    answer.textContent = `${eat * 1e3}ms`;
    rounded.textContent = `${Math.round(eat * 1e4) / 10}ms`;
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

async function solve() {
    const problem = document.getElementById("problem").value;
    try {
        parse_text(problem);
    } catch (e) {
        answer.textContent = "Not supported";
        rounded.textContent = "Not supported";
    }
}
