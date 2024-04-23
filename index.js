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
