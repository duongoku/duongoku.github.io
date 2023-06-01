const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");

const image = document.querySelector("#tileset");

const UP = "UP";
const DOWN = "DOWN";
const LEFT = "LEFT";
const RIGHT = "RIGHT";

let board = new Array();
let block_size = 32;

/**
 *
 * @param {Array<number>} a First color array, in the form of [r, g, b]
 * @param {Array<number>} b Second color array, in the form of [r, g, b]
 * @param {number} st_a Start index of a
 * @param {number} st_b Start index of b
 * @param {number} threshold The distance threshold
 * @returns {boolean} True if the colors are close enough, false otherwise
 */
function color_diff(a, b, st_a, st_b, threshold = 7500) {
    return (
        (a[st_a] - b[st_b]) ** 2 +
            (a[st_a + 1] - b[st_b + 1]) ** 2 +
            (a[st_a + 2] - b[st_b + 2]) ** 2 <
        threshold
    );
}

/**
 * Checks if the second block can be placed adjacent to the first block in the given direction.
 * 2 blocks can be adjacent only if their meeting edge is identical.
 * Assuming blocks are square.
 *
 * @param {ImageData} block_a The first block
 * @param {ImageData} block_b The second block
 * @param {number} direction Matching edge of block_a
 * @param {number} m_thres The threshold for mismatch (in percentage)
 */
function match_block(block_a, block_b, direction, m_thres = 0) {
    const a = block_a.data;
    const b = block_b.data;
    const s = block_a.width;

    let mismatch = 0;
    switch (direction) {
        case UP:
            for (let i = 1; i < s - 1; i++) {
                const ida = i * 4;
                const idb = (s * (s - 1) + i) * 4;
                if (
                    !color_diff(a, b, ida, idb) &&
                    !color_diff(a, b, ida, idb + 1) &&
                    !color_diff(a, b, ida, idb - 1)
                ) {
                    mismatch += 1;
                }
            }
            break;
        case DOWN:
            for (let i = 1; i < s - 1; i++) {
                const ida = (s * (s - 1) + i) * 4;
                const idb = i * 4;
                if (
                    !color_diff(a, b, ida, idb) &&
                    !color_diff(a, b, ida, idb + 1) &&
                    !color_diff(a, b, ida, idb - 1)
                ) {
                    mismatch += 1;
                }
            }
            break;
        case LEFT:
            for (let i = 1; i < s - 1; i++) {
                const ida = s * i * 4;
                const idb = s * (i + 1) * 4 - 4;
                if (
                    !color_diff(a, b, ida, idb) &&
                    !color_diff(a, b, ida, idb + s * 4) &&
                    !color_diff(a, b, ida, idb - s * 4)
                ) {
                    mismatch += 1;
                }
            }
            break;
        case RIGHT:
            for (let i = 1; i < s - 1; i++) {
                const ida = s * (i + 1) * 4 - 4;
                const idb = s * i * 4;
                if (
                    !color_diff(a, b, ida, idb) &&
                    !color_diff(a, b, ida, idb + s * 4) &&
                    !color_diff(a, b, ida, idb - s * 4)
                ) {
                    mismatch += 1;
                    console.log(ida / 4, idb / 4);
                    console.log(
                        `(${a[ida]}, ${a[ida + 1]}, ${a[ida + 2]}) - (${
                            b[idb]
                        }, ${b[idb + 1]}, ${b[idb + 2]})`
                    );
                }
            }
            break;
        default:
            return false;
    }

    if (mismatch > m_thres * s) {
        return false;
    }
    return true;
}

/**
 * Creates an array of ImageData objects from a one-dimensional array of blocks.
 *
 * @param {Array<HTMLCanvasElement>} blocks An array of blocks
 */
function create_image_data(blocks) {
    const result = [];
    for (let i = 0; i < blocks.length; i++) {
        result.push(
            blocks[i]
                .getContext("2d")
                .getImageData(0, 0, blocks[i].width, blocks[i].height)
        );
    }
    return result;
}

// Blocks Image Data - B.I.D.
let bid = new Array();

/**
 *
 * @param {Array<Array<HTMLCanvasElement>>} blocks A 2-dimensional array of blocks
 * @param {number} m_thres The threshold for mismatch (in percentage)
 * @returns
 */
function init_adj_blocks(blocks, m_thres = 0) {
    if (blocks.length === 0) {
        return [];
    }

    bid = new Array();
    for (let i = 0; i < blocks.length; i++) {
        bid.push(create_image_data(blocks[i]));
    }

    const N = blocks.length;
    const M = blocks[0].length;
    const NM = N * M;

    const result = new Array(N);
    for (let i = 0; i < N; i++) {
        result[i] = new Array(M);
        for (let j = 0; j < M; j++) {
            result[i][j] = {
                UP: [],
                DOWN: [],
                LEFT: [],
                RIGHT: [],
            };
        }
    }

    for (let i = 0; i < NM; i++) {
        for (let j = i; j < NM; j++) {
            ii = Math.floor(i / N);
            ji = Math.floor(j / N);
            ij = i % N;
            jj = j % N;
            if (match_block(bid[ii][ij], bid[ji][jj], UP, m_thres)) {
                result[ii][ij][UP].push(blocks[ji][jj]);
                result[ji][jj][DOWN].push(blocks[ii][ij]);
            }
            if (match_block(bid[ii][ij], bid[ji][jj], DOWN, m_thres)) {
                result[ii][ij][DOWN].push(blocks[ji][jj]);
                result[ji][jj][UP].push(blocks[ii][ij]);
            }
            if (match_block(bid[ii][ij], bid[ji][jj], LEFT, m_thres)) {
                result[ii][ij][LEFT].push(blocks[ji][jj]);
                result[ji][jj][RIGHT].push(blocks[ii][ij]);
            }
            if (match_block(bid[ii][ij], bid[ji][jj], RIGHT, m_thres)) {
                result[ii][ij][RIGHT].push(blocks[ji][jj]);
                result[ji][jj][LEFT].push(blocks[ii][ij]);
            }
        }
    }

    return result;
}

function init_blocks(image, block_size) {
    const blocks = [];
    for (let i = 0; i < image.height; i += block_size) {
        const row = [];
        for (let j = 0; j < image.width; j += block_size) {
            const cv = document.createElement("canvas");
            cv.width = block_size;
            cv.height = block_size;
            const ctx = cv.getContext("2d");
            ctx.drawImage(
                image,
                j,
                i,
                block_size,
                block_size,
                0,
                0,
                block_size,
                block_size
            );
            row.push(cv);
        }
        blocks.push(row);
    }
    return blocks;
}

let blocks, adj_blocks;

function init() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    block_size = parseInt(document.querySelector("#blocksize").value);
    blocks = init_blocks(image, block_size);
    adj_blocks = init_adj_blocks(blocks, 0.1);

    board = new Array();
    for (let i = 0; i < canvas.height; i += block_size) {
        const row = [];
        for (let j = 0; j < canvas.width; j += block_size) {
            const possibilities = [];
            for (let k = 0; k < blocks.length; k++) {
                for (let l = 0; l < blocks[k].length; l++) {
                    // Check if blocks[k][l] contains a (0, 0, 0, 0) pixel
                    let tr = blocks[k][l]
                        .getContext("2d")
                        .getImageData(0, 0, 1, 1);
                    if (
                        tr.data[0] === 0 &&
                        tr.data[1] === 0 &&
                        tr.data[2] === 0 &&
                        tr.data[3] === 0
                    ) {
                        continue;
                    }
                    possibilities.push([k, l]);
                }
            }
            row.push(possibilities);
        }
        board.push(row);
    }

    window.requestAnimationFrame(render);
}

function collapse(blocks, blocks_board, blocks_adjacent) {
    let min_entropy = Infinity;
    let choices = new Array();

    for (let i = 0; i < blocks_board.length; i++) {
        for (let j = 0; j < blocks_board[i].length; j++) {
            if (blocks_board[i][j].length < 2) {
                continue;
            }
            if (blocks_board[i][j].length < min_entropy) {
                min_entropy = blocks_board[i][j].length;
                choices = new Array();
                choices.push([i, j]);
            } else if (blocks_board[i][j].length == min_entropy) {
                choices.push([i, j]);
            }
        }
    }

    if (min_entropy === Infinity) {
        return false;
    }

    // Select a random block with the minimum entropy
    const choice = choices[Math.floor(Math.random() * choices.length)];
    const min_i = choice[0];
    const min_j = choice[1];

    // Select a random block from the possibilities then propagate it
    blocks_board[min_i][min_j] = [
        blocks_board[min_i][min_j][
            Math.floor(Math.random() * blocks_board[min_i][min_j].length)
        ],
    ];
    propagate(blocks, blocks_board, blocks_adjacent, min_j, min_i);

    return true;
}

function eliminate(src, dst, blocks_adjacent, blocks, direction) {
    let available = new Array();
    for (let k = 0; k < src.length; k++) {
        available = available.concat(
            blocks_adjacent[src[k][0]][src[k][1]][direction]
        );
    }

    for (let i = 0; i < dst.length; i++) {
        if (!available.includes(blocks[dst[i][0]][dst[i][1]])) {
            dst.splice(i, 1);
            i--;
        }
    }
}

function propagate(blocks, blocks_board, blocks_adjacent, x, y) {
    // let log = "";
    // for (let i = 0; i < blocks_board.length; i++) {
    //     for (let j = 0; j < blocks_board[i].length; j++) {
    //         log += blocks_board[i][j].length + " ";
    //     }
    //     log += "\n";
    // }
    // console.log(log);

    if (y > 0) {
        // Propagate up
        const b = blocks_board[y - 1][x];
        const before = b.length;
        if (before > 1) {
            eliminate(blocks_board[y][x], b, blocks_adjacent, blocks, UP);
            if (before > b.length) {
                propagate(blocks, blocks_board, blocks_adjacent, x, y - 1);
            }
        }
    }
    if (y < blocks_board.length - 1) {
        // Propagate down
        const b = blocks_board[y + 1][x];
        const before = b.length;
        if (before > 1) {
            eliminate(blocks_board[y][x], b, blocks_adjacent, blocks, DOWN);
            if (before > b.length) {
                propagate(blocks, blocks_board, blocks_adjacent, x, y + 1);
            }
        }
    }
    if (x > 0) {
        // Propagate left
        const b = blocks_board[y][x - 1];
        const before = b.length;
        if (before > 1) {
            eliminate(blocks_board[y][x], b, blocks_adjacent, blocks, LEFT);
            if (before > b.length) {
                propagate(blocks, blocks_board, blocks_adjacent, x - 1, y);
            }
        }
    }
    if (x < blocks_board[0].length - 1) {
        // Propagate right
        const b = blocks_board[y][x + 1];
        const before = b.length;
        if (before > 1) {
            eliminate(blocks_board[y][x], b, blocks_adjacent, blocks, RIGHT);
            if (before > b.length) {
                propagate(blocks, blocks_board, blocks_adjacent, x + 1, y);
            }
        }
    }
}

function check_delta_time(timestamp, p_timestamp, fps) {
    const delta_time = timestamp - p_timestamp;
    if (delta_time < 1000 / fps) {
        return false;
    }
    return true;
}

let previous_timestamp = 0;

function render(timestamp) {
    if (!check_delta_time(timestamp, previous_timestamp, Infinity)) {
        window.requestAnimationFrame(render);
        return;
    }

    // let x = 1, y = 1;
    // for (i = 0; i < adj_blocks[x][y][UP].length; i++) {
    //     const block = adj_blocks[x][y][UP][i];
    //     ctx.drawImage(block, block_size*i, 0);
    //     ctx.drawImage(blocks[x][y], block_size*i, block_size);
    // }

    // x = 2, y = 2;
    // for (i = 0; i < adj_blocks[x][y][DOWN].length; i++) {
    //     const block = adj_blocks[x][y][DOWN][i];
    //     ctx.drawImage(blocks[x][y], block_size*i, block_size*3);
    //     ctx.drawImage(block, block_size*i, block_size*4);
    // }

    // x = 1, y = 0;
    // for (i = 0; i < adj_blocks[x][y][LEFT].length; i++) {
    //     const block = adj_blocks[x][y][LEFT][i];
    //     ctx.drawImage(block, block_size*8, block_size*i);
    //     ctx.drawImage(blocks[x][y], block_size*9, block_size*i);
    // }

    // x = 0, y = 0;
    // for (i = 0; i < adj_blocks[x][y][RIGHT].length; i++) {
    //     const block = adj_blocks[x][y][RIGHT][i];
    //     ctx.drawImage(blocks[x][y], block_size*10, block_size*i);
    //     ctx.drawImage(block, block_size*11, block_size*i);
    // }
    // return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            ctx.strokeText(
                board[i][j].length,
                j * block_size + 9,
                i * block_size + 20
            );
        }
    }

    for (let i = 0; i < board.length; i++) {
        let check = false;
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j].length === 1) {
                ctx.drawImage(
                    blocks[board[i][j][0][0]][board[i][j][0][1]],
                    j * block_size,
                    i * block_size
                );
            } else if (board[i][j].length === 0) {
                // Reset the board
                init();
                check = true;
                break;
            }
        }
        if (check) {
            break;
        }
    }

    if (!collapse(blocks, board, adj_blocks)) {
        return;
    }

    window.requestAnimationFrame(render);
    previous_timestamp = timestamp;
    return;
}

window.onload = init;
document.querySelector("#restart").onclick = init;
