//Sprite: STOLEN lol

let frames = [];

function preload() {
	for(let i=0;i<6;i++) {
		frames[i] = loadImage("./frame_0" +(i+1).toString()+ ".png");
	}
}

function setup() {
	createCanvas(500, 500);
}

function draw() {
	clear();
	image(frames[floor(frameCount/3) % 6], 605, 150);
}