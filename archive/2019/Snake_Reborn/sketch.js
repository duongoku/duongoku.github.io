let snake;
let field;
let fps = 10; //It's actually both fps and number of draw() loops per sec
let scale = 15;
let width = 20;
let height = 15;
let check = 0;
let wall = 0;
let overlap = 0;
let dirX = [0, 1, 0, -1, 0],
	dirY = [-1, 0, 1, 0, 0]; //UP, RIGHT, DOWN, LEFT, STOP

let isThemePlaying = false;
let theme;
let eat_sound;

function preload() {
	soundFormats('mp3');
	theme = loadSound('theme.mp3');
	eat_sound = loadSound('eat.mp3');
}

function setup() {
	frameRate(fps);
	createCanvas(width * scale, height * scale);
	field = new Field();
	snake = new Snake();
	snake.body.push([0, Math.floor(height / 2)]);
	snake.dir = 4;
	do {
		overlap = 0;
		field.food = [Math.floor(Math.random() * width), Math.floor(Math.random() * height)];
		for (let i = 0; i < snake.body.length; i++) {
			if (field.food[0] == snake.body[i][0] && field.food[1] == snake.body[i][1]) {
				overlap = 1;
				break;
			}
		}
	} while (overlap == 1);
}

function keyTyped() {
	if (key == 'w') {
		if (wall == 0) wall = 1;
		else wall = 0;
		setup();
	}
}

function keyPressed() {
	if (!isThemePlaying) {
		isThemePlaying = true;
		theme.loop();
	}
	if (check == 0) {
		if (keyCode == UP_ARROW && snake.dir != 2) {
			snake.dir = 0;
		} else if (keyCode == RIGHT_ARROW && snake.dir != 3) {
			snake.dir = 1;
		} else if (keyCode == DOWN_ARROW && snake.dir != 0) {
			snake.dir = 2;
		} else if (keyCode == LEFT_ARROW && snake.dir != 1) {
			snake.dir = 3;
		}
		check = 1;
	}
}

function eat_food() {
	// console.log(snake.body);
	eat_sound.play();
	snake.body.push([snake.body[snake.body.length - 1][0], snake.body[snake.body.length - 1][1]]);
	do {
		overlap = 0;
		field.food = [Math.floor(Math.random() * width), Math.floor(Math.random() * height)];
		for (let i = 0; i < snake.body.length; i++) {
			if (field.food[0] == snake.body[i][0] && field.food[1] == snake.body[i][1]) {
				overlap = 1;
				break;
			}
		}
	} while (overlap == 1);
	// console.log(snake.body);
}

function draw() {
	let len = snake.body.length;
	background(200);
	strokeWeight(1);
	fill(100);
	square(field.food[0] * scale, field.food[1] * scale, scale); //food
	fill(255);
	square(snake.body[0][0] * scale, snake.body[0][1] * scale, scale); //head
	fill(200);
	for (let i = len - 1; i > 0; i--) {
		square(snake.body[i][0] * scale, snake.body[i][1] * scale, scale); // rest of the body
	}
	if (snake.dir != 4) { //if game is started then we start updating things
		let die = 0;
		if (snake.body.length == width * height) die = 1;
		for (let i = 1; i < len; i++) {
			if (snake.body[i][0] == snake.body[0][0] && snake.body[i][1] == snake.body[0][1]) die = 1;
		}
		if (wall == 1) {
			if (snake.body[0][0] < 0 || snake.body[0][1] < 0) die = 1;
			if (snake.body[0][0] >= width || snake.body[0][1] >= height) die = 1;
		}
		if (die == 1) setup();
		else {
			if (snake.body[0][0] == field.food[0] && snake.body[0][1] == field.food[1]) eat_food();
			for (let i = len - 1; i > 0; i--) {
				snake.body[i][0] = snake.body[i - 1][0];
				snake.body[i][1] = snake.body[i - 1][1];
			}
			snake.body[0][0] += dirX[snake.dir];
			snake.body[0][1] += dirY[snake.dir];
			if (wall == 0) {
				if (snake.body[0][0] < 0) snake.body[0][0] += width;
				if (snake.body[0][1] < 0) snake.body[0][1] += height;
				snake.body[0][0] %= width;
				snake.body[0][1] %= height;
			}
		}
	}
	noFill();
	if (wall == 1) {
		strokeWeight(3);
		rect(0, 0, width * scale, height * scale);
	}
	check = 0;
}