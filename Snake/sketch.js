// Sprites here is homemade, only the lost screen pic is stolen
// Init lmao so messy
let head, body, prey, wall, blank, lostscreen;
let w = 30, //box length idk why I set "w"
	l = 20, //box height idk why I set "l"
	f = 20, //size multiplier
	spd = 2,
	ate = 0,
	dead = 0,
	dir = 2; //current direction of the head
let preyx = 5,
	preyy = 5;
let dirx = [-1, 0, 1, 0], //don't know how to explain
	diry = [0, -1, 0, 1]; //don't know how to explain

let field = [];
let snake = [];
snake[0] = [1, 1];

for (let i = 0; i < 1000; i++) {
	field[i] = new Array();
	for (let j = 0; j < 1000; j++) {
		field[i][j] = 0;
	}
}
field[preyx][preyy] = 1;

function Udt() {
	console.log(field[5][1]);
	if (field[snake[0][0]][snake[0][1]]==1) {
		field[snake[0][0]][snake[0][1]]==0;
		preyx = floor(random(1,w+0.9));
		preyy = floor(random(1,l+0.9));
		field[preyx][preyy] = 1;
		ate++;
	}
	if (ate > 0) {
		ate--;
		snake[snake.length] = [600, 0]; // set this out of canvas so no one can see :>
	}

	//update body
	// why this didn't work lol
	field[snake[snake.length - 1][0]][snake[snake.length - 1][1]] = 0; //set tail position to unoccupied "0"
	for (let i = snake.length - 1; i > 0; i--) {
		snake[i] = snake[i - 1];
	}

	//update head
	snake[0][0] = dirx[dir] + snake[0][0];
	snake[0][1] = diry[dir] + snake[0][1];

	if (field[snake[0][0]][snake[0][1]] == 5) dead = 1;

	field[snake[0][0]][snake[0][1]] = 5; //set head position to occupied "5"
}

function preload() {
	lostscreen = loadImage("lost.png");
	head = loadImage("Head.png");
	body = loadImage("Body.png");
	wall = loadImage("Wall.png");
	prey = [loadImage("Prey0.png"), loadImage("Prey1.png")];
}

function setup() {
	createCanvas((w + 1) * f, (l + 1) * f);
	preyx = floor(random(1,w+0.9));
	preyy = floor(random(1,l+0.9));
}

function draw() {
	background(224, 245, 66);

	if (dead == 1) image(lostscreen, 0, 0, (w + 1) * f, (l + 1) * f); // this is obvious lol

	else {
		//draw borders
		//size of the border sprite is a half of orther sprite size lol
		for (let i = 1; i <= w * 2; i++) {
			image(wall, f * i / 2, f / 2);
			image(wall, f * i / 2, f * l);
		}
		for (let j = 1; j <= l * 2; j++) {
			image(wall, f / 2, f * j / 2);
			image(wall, f * w, f * j / 2);
		}
		for (let i = 0; i <= w; i++) {
			field[i][0] = 5;
			field[i][l] = 5;
		}
		for (let i = 0; i <= l; i++) {
			field[0][i] = 5;
			field[w][i] = 5;
		}

		if(keyIsDown(LEFT_ARROW)&&dir!=2) dir=0;
		else if(keyIsDown(UP_ARROW)&&dir!=3) dir=1; 
		else if(keyIsDown(RIGHT_ARROW)&&dir!=0) dir=2;
		else if(keyIsDown(DOWN_ARROW)&&dir!=1) dir=3;

		//update
		if (frameCount % 10 == 0) Udt();

		//draw prey
		image(prey[floor(frameCount/30) % 2], preyx*f, preyy*f);

		//draw snake
		image(head, snake[0][0] * f, snake[0][1] * f);
		for (let i = 1; i < snake.length; i++) {
			if (frameCount % 10 == 0) console.log(i + "," + snake[i][0]);
			image(body, snake[i][0] * f, snake[i][1] * f);
		}

	}
}