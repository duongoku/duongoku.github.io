const input_textarea = document.getElementById("input_textarea");
const input_button = document.getElementById("input_button");
input_textarea.onchange = search;
input_button.onclick = search;

/**
 *
 * @param {String} str_a
 * @param {String} str_b
 * @returns
 */
function check_match(str_a, str_b) {
    const a = str_a.toLowerCase().replaceAll(/[^a-z0-9]/g, "");
    const b = str_b.toLowerCase().replaceAll(/[^a-z0-9]/g, "");
    if (a.includes(b) || b.includes(a)) {
        return true;
    }
    return false;
}

async function search() {
    const input_text = input_textarea.value;
    const answer_div = document.getElementById("answer");
    fetch("./data.json")
        .then((response) => response.json())
        .then((data) => {
            for (let i = 0; i < data.length; i++) {
                if (check_match(data[i].question, input_text)) {
                    const answer = `- ${data[i].answer}`;
                    answer_div.innerText = answer.replace("\n", "\n- ");
                    return true;
                }
            }
        });
    answer_div.innerText = "Not found";
    return false;
}

search();
