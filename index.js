let img = new Image();
img.src = "./assets/mimikyu.png";
img.onload = function () {
    window.requestAnimationFrame(gameLoop);
};

let canvas = document.querySelector("canvas");
let ctx = canvas.getContext("2d");

const SCALE = 1;
const WIDTH = 64;
const HEIGHT = 64;
const SCALED_WIDTH = SCALE * WIDTH;
const SCALED_HEIGHT = SCALE * HEIGHT;

function drawFrame(frameX, frameY, canvasX, canvasY) {
    ctx.drawImage(img,
        frameX * WIDTH, frameY * HEIGHT, WIDTH, HEIGHT,
        canvasX, canvasY, SCALED_WIDTH, SCALED_HEIGHT);
}

let currentLoopIndex = 0;
// let frameCount = 0;
let currentDirectionIndex = 0;
let directions = [2, 0, 1, 3];
let currentPosition = [200, 0];
let positionChange = [[0, 1], [-1, 0], [1, 0], [0, -1]];
let spriteSpeed = 4;

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    currentLoopIndex = (currentLoopIndex + 1) % 4;
    // frameCount++;

    // if (frameCount % 5 === 0) {
    if (Math.random() * 8 < 1) {
        currentDirectionIndex = Math.floor(Math.random() * 4);
    }
    // }

    currentPosition[0] += positionChange[directions[currentDirectionIndex]][0] * spriteSpeed;
    currentPosition[1] += positionChange[directions[currentDirectionIndex]][1] * spriteSpeed;
    if (currentPosition[0] >= canvas.width - SCALED_WIDTH) {
        currentPosition[0] = 0;
    } else if (currentPosition[0] < 0) {
        currentPosition[0] = canvas.width - SCALED_WIDTH;
    }
    if (currentPosition[1] >= canvas.height - SCALED_HEIGHT) {
        currentPosition[1] = 0;
    } else if (currentPosition[1] < 0) {
        currentPosition[1] = canvas.height - SCALED_HEIGHT;
    }

    // console.log(currentPosition);

    drawFrame(currentLoopIndex, directions[currentDirectionIndex], currentPosition[0], currentPosition[1]);
    setTimeout(() => {
        window.requestAnimationFrame(gameLoop);
    }, 1000 / 60);
}

const MIN_DISTANCE_TO_MOUSE = 20;
function handleMouseMove(event) {
    var eventDoc, doc, body;

    if (event.pageX == null && event.clientX != null) {
        eventDoc = (event.target && event.target.ownerDocument) || document;
        doc = eventDoc.documentElement;
        body = eventDoc.body;

        event.pageX = event.clientX +
            (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
            (doc && doc.clientLeft || body && body.clientLeft || 0);
        event.pageY = event.clientY +
            (doc && doc.scrollTop || body && body.scrollTop || 0) -
            (doc && doc.clientTop || body && body.clientTop || 0);
    }

    let center_x = currentPosition[0] + SCALED_WIDTH / 2;
    let center_y = currentPosition[1] + SCALED_HEIGHT / 2;
    let mouse_x = event.pageX;
    let mouse_y = event.pageY;
    let distance = Math.sqrt((mouse_x - center_x) * (mouse_x - center_x) + (mouse_y - center_y) * (mouse_y - center_y))
    let min_distance = MIN_DISTANCE_TO_MOUSE;
    if (distance < min_distance) {
        let move_x = (min_distance / distance - 1) * (center_x - mouse_x);
        let move_y = (min_distance / distance - 1) * (center_y - mouse_y);
        currentPosition[0] += move_x;
        currentPosition[1] += move_y;
        console.log(`${currentPosition}`);
    }
}
document.onmousemove = handleMouseMove;