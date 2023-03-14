let EPSILON = "ε";
let START_SYMBOL = "S";

let grammar = new Map();
let non_terminals = new Set();
let first_set = new Map();
let follow_set = new Map();
let select_set = new Map();

let DEFAULT_ERROR_MSG = "Errors will be displayed here";

function show_error(msg) {
    document.getElementById("error").innerHTML = msg;
}

function non_empty_filter(e) {
    return e.length > 0;
}

function set_on_modified(element, callback) {
    element.onchange = callback;
    element.onkeyup = callback;
    element.onpaste = callback;
    element.oninput = callback;
}

function reset() {
    show_error(DEFAULT_ERROR_MSG);

    grammar = new Map();
    first_set = new Map();
    follow_set = new Map();
    select_set = new Map();
    non_terminals = new Set();
    EPSILON = document.getElementById("epsilon").value;
    START_SYMBOL = document.getElementById("start").value;

    document.getElementById("parse-button").onclick = parse;
    set_on_modified(document.getElementById("grammar"), parse);
    set_on_modified(document.getElementById("epsilon"), parse);
    set_on_modified(document.getElementById("start"), parse);

    document.getElementById("first").innerHTML = "";
    document.getElementById("follow").innerHTML = "";
    document.getElementById("select").innerHTML = "";
    document.getElementById("parse-table").innerHTML = "";
}

function create_parse_table() {
    let parse_table = new Map();
    let terminals = new Set();
    for (let [key, value] of select_set) {
        for (let select of value) {
            if (select != EPSILON) {
                terminals.add(select);
            }
            if (parse_table.has(key[0])) {
                if (parse_table.get(key[0]).has(select)) {
                    show_error("Grammar is not LL(1)");
                    return;
                }
                parse_table.get(key[0]).set(select, key[1].join(" "));
            } else {
                parse_table.set(key[0], new Map());
                parse_table.get(key[0]).set(select, key[1].join(" "));
            }
        }
    }
    let table = document.getElementById("parse-table");
    table.innerHTML = "";
    let header = table.createTHead();
    let row = header.insertRow(0);
    let cell = row.insertCell(0);
    cell.innerHTML = "Non-Terminal";
    for (let terminal of terminals) {
        cell = row.insertCell(-1);
        cell.innerHTML = terminal;
    }
    let body = table.createTBody();
    for (let [key, value] of parse_table) {
        row = body.insertRow(-1);
        cell = row.insertCell(0);
        cell.innerHTML = key;
        for (let terminal of terminals) {
            cell = row.insertCell(-1);
            if (value.has(terminal)) {
                cell.innerHTML = value.get(terminal);
            }
        }
    }
}

function parse() {
    load_grammar();
    for (let [key, value] of grammar) {
        first(key);
        follow(key);
        document.getElementById(
            "first"
        ).innerHTML += `<tr><td>${key}</td><td>{${[...first_set.get(key)]
            .sort()
            .join(", ")}}</td></tr>`;
        document.getElementById(
            "follow"
        ).innerHTML += `<tr><td>${key}</td><td>{${[...follow_set.get(key)]
            .sort()
            .reverse()
            .join(", ")}}</td></tr>`;

        for (let i = 0; i < value.length; i++) {
            let rule = value[i];
            let select_set = select(key, rule);
            document.getElementById(
                "select"
            ).innerHTML += `<tr><td>${key} -> ${rule.join(" ")}</td><td>{${[
                ...select_set,
            ]
                .sort()
                .reverse()
                .join(", ")}}</td></tr>`;
        }
    }
    create_parse_table();
}

function load_grammar() {
    reset();
    let rules = document.getElementById("grammar").value.split("\n");
    rules = rules.map((e) => {
        return e.trim();
    });
    rules = rules.filter(non_empty_filter);
    try {
        for (let i = 0; i < rules.length; i++) {
            rules[i] = rules[i].replace("→", "->");
            let rule = rules[i].split("->");
            let left = rule[0].trim();
            let right = rule[1].trim();
            right = right.split("|");
            right = right.map((e) => {
                return e
                    .split(" ")
                    .map((e) => {
                        return e.trim();
                    })
                    .filter(non_empty_filter);
            });
            if (grammar.has(left)) {
                let old = grammar.get(left);
                right = old.concat(right);
            }
            grammar.set(left, right);
        }
        console.log(grammar);
        for (let [key, value] of grammar) {
            non_terminals.add(key);
        }
    } catch (e) {
        show_error("Invalid grammar");
        console.log(e);
    }
}

function first(symbol) {
    if (first_set.has(symbol)) {
        return first_set.get(symbol);
    }
    let first_set_symbol = new Set();
    if (non_terminals.has(symbol)) {
        let rules = grammar.get(symbol);
        for (let i = 0; i < rules.length; i++) {
            let rule = rules[i];
            if (rule.length == 0) {
                first_set_symbol.add(EPSILON);
            } else {
                let first_rule = first(rule[0]);
                first_set_symbol = new Set([
                    ...first_set_symbol,
                    ...first_rule,
                ]);
            }
        }
    } else {
        first_set_symbol.add(symbol);
    }
    first_set.set(symbol, first_set_symbol);
    return first_set_symbol;
}

// No recursion
function follow(symbol) {
    if (follow_set.has(symbol)) {
        return follow_set.get(symbol);
    }
    let follow_set_symbol = new Set();
    if (symbol == START_SYMBOL) {
        follow_set_symbol.add("$");
    }
    for (let [key, value] of grammar) {
        for (let i = 0; i < value.length; i++) {
            let rule = value[i];
            for (let j = 0; j < rule.length; j++) {
                if (rule[j] == symbol) {
                    if (j == rule.length - 1) {
                        if (key != symbol) {
                            follow_set_symbol = new Set([
                                ...follow_set_symbol,
                                ...follow(key),
                            ]);
                        }
                    } else {
                        let first_rule = first(rule[j + 1]);
                        if (first_rule.has(EPSILON)) {
                            follow_set_symbol = new Set([
                                ...follow_set_symbol,
                                ...first_rule,
                                ...follow(key),
                            ]);
                        } else {
                            follow_set_symbol = new Set([
                                ...follow_set_symbol,
                                ...first_rule,
                            ]);
                        }
                    }
                }
            }
        }
    }
    follow_set_symbol.delete(EPSILON);
    follow_set.set(symbol, follow_set_symbol);
    return follow_set_symbol;
}

function select(symbol, rule) {
    let first_rule = first(rule[0]);
    let select_set_symbol = new Set();
    if (first_rule.has(EPSILON)) {
        select_set_symbol = new Set([...first_rule, ...follow(symbol)]);
    } else {
        select_set_symbol = first_rule;
    }
    select_set_symbol.delete(EPSILON);
    select_set.set([symbol, rule], select_set_symbol);
    return select_set_symbol;
}

parse();
