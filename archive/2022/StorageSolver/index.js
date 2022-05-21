import { parse_cylinder } from "./cylinder.js";
import { parse_fs } from "./filesystem.js";
import { parse_raid } from "./raid.js";

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
 */
function parse_text(text) {
    text = preprocess(text);
    const answer = document.getElementById("answer");
    if (text.includes("cylinder")) {
        const result = parse_cylinder(text);
        answer.innerText = `Distance: ${
            result.distance
        }\nOrder: ${result.order.join(" ")}`;
        return;
    }
    if (text.includes("allocation") || text.includes("filesystem")) {
        const result = parse_fs(text);
        answer.innerText = "";
        for (const key in result) {
            answer.innerText += `${key}: ${result[key]}\n`;
        }
        return;
    }
    if (text.includes("raid")) {
        const result = parse_raid(text);
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

document.getElementById("solve").onclick = solve;
document.getElementById("problem").onchange = solve;
solve();
