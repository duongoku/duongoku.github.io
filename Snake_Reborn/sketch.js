let snake;
let field;
let fps = 6; //It's actually both fps and number of draw() loops per sec
let scale = 20;
let width = 30;
let height = 20;
let dirX = [0, 1, 0, -1, 0],
	dirY = [-1, 0, 1, 0, 0]; //UP, RIGHT, DOWN, LEFT, STOP

function setup() {
	frameRate(fps);
	createCanvas(width * scale, height * scale);

	field = new Field();
	for(let i=0; i<width; i++){
		let arr = [];
		for(let j=0; j<height; j++){
			arr.push(0);
		}
		field.state.push(arr);
	}
	snake = new Snake();
	snake.body.push([0, int(height / 2) - 1]);
	field.state[0][int(height / 2) - 1]=1;
	snake.dir = 4;
	field.food = [Math.floor(Math.random()*width), Math.floor(Math.random()*height)]
	do{
		field.food = [Math.floor(Math.random()*width), Math.floor(Math.random()*height)];
	}while(field.state[field.food[0]][field.food[1]]==1);
	// console.log(snake.body);
}

function keyPressed() {
	if (keyCode == UP_ARROW && snake.dir != 2) {
		snake.dir = 0;
	} else if (keyCode == RIGHT_ARROW && snake.dir != 3) {
		snake.dir = 1;
	} else if (keyCode == DOWN_ARROW && snake.dir != 0) {
		snake.dir = 2;
	} else if (keyCode == LEFT_ARROW && snake.dir != 1) {
		snake.dir = 3;
	}
}

function reset() {
	snake = new Snake();
	snake.body.push([0, int(height / 2) - 1]);
	snake.dir = 4;
}

function eat_food(){
	snake.body.push([snake.body[snake.body.length - 1][0], snake.body[snake.body.length - 1][1]]);
	do{
		field.food = [Math.floor(Math.random()*width), Math.floor(Math.random()*height)];
	}while(field.state[field.food[0]][field.food[1]]==1);
	console.log(snake.body);
}

function draw() {
	background(200);
	let len = snake.body.length;
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
		for(let i = 1; i<len;i++){
			if(snake.body[i][0]==snake.body[0][0] && snake.body[i][1]==snake.body[0][1]) die = 1;
		}
		if (snake.body[0][0] < 0 || snake.body[0][1] < 0) die = 1;
		if (snake.body[0][0] >= width || snake.body[0][1] >= height) die = 1;
		if(die == 1) setup();
		else{
			if (snake.body[0][0] == field.food[0] && snake.body[0][1] == field.food[1]) eat_food();
			for (let i = len - 1; i > 0; i--) {
				snake.body[i][0] = snake.body[i - 1][0];
				snake.body[i][1] = snake.body[i - 1][1];
			}
			snake.body[0][0] += dirX[snake.dir];
			snake.body[0][1] += dirY[snake.dir];
		}
		// if (snake.body[0][0] < 0) snake.body[0][0] += width;
		// if (snake.body[0][1] < 0) snake.body[0][1] += height;
		// snake.body[0][0] %= width;
		// snake.body[0][1] %= height;
	}
}