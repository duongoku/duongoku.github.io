//sprite from https://www.deviantart.com/ridgetroopa/art/Koopa-Paratroopa-ML-SS-Sheet-694761724

function preload() {
	img = loadImage("./shell.png");
}

let size_x = 400,
	size_y = 200; // canvas size
let n = 5; // number of shells on screen
let sf = 6; // number of sprite frames
let sw = 44,
	sh = 36; // sprite width and height
let frames = [];
let speed = [];

function setup() {
	for (let i = 0; i < sf; i++) {
		frames[i] = img.get(sw * i + 2, 0, sw, sh);
	}
	for (let i = 0; i < n; i++) {
		speed[i] = random(0.1, 1);
	}
	createCanvas(size_x, size_y);

}

function draw() {
	background(0, 255, 255);

	for(let i = 0; i < n ; i++) {
		let cnt = floor(frameCount * speed[i]);
		let x = cnt * 2;
		image(frames[cnt % sf], x%size_x, 40*i, sw, sh);
		if(size_x < x + sw) {
			image(frames[cnt % sf], x%size_x - size_x, 40*i, sw, sh);		
		}
		
	}

}