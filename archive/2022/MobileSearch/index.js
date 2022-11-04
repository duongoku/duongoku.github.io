// Read data.json
async function read_data() {
    const res = await fetch("data.json");
    const data = await res.json();
    return data;
}

// Remove non-alphanumeric characters and convert to lowercase
function normalize(input_str) {
    return input_str.replace(/[^a-z0-9]/gi, "").toLowerCase();
}

// Find matches
function find(question, data) {
    // Normalize question
    const normalized_question = normalize(question);
    // Filter data
    const filtered_data = data.filter((item) => {
        const normalized_full_question = normalize(item.q);
        return normalized_full_question.includes(normalized_question);
    });
    // Return filtered data
    return filtered_data;
}

// On #input_textarea change
async function process() {
    // Retrive question from #input_textarea
    const question = document.getElementById("input_textarea").value;
    const data = await read_data();
    const matches = find(question, data);
    const top5 = matches.slice(0, 5);
    const top5_str = top5.map((item) => {
        return `${item.a}<br>-------<br>`;
    }).join("");
    // Write to #answer
    document.getElementById("answer").innerHTML = top5_str;
}

// Initialize on-click event
function init() {
    document.querySelector("#input_textarea").onchange = process;
    // Run process() every 500ms
    setInterval(process, 500);
}

// Call init()
init();
