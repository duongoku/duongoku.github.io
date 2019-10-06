let snake;
let fps = 6;	//It's actually both fps and number of draw() loops per sec
let scale = 20;
let width = 30;
let height = 20;
let dirX = [0, 1, 0, -1, 0], dirY = [-1, 0, 1, 0, 0];

function setup(){
	snake = new Snake();
	snake.body.push([0, int(height/2)-1]);
	snake.dir = 4;
	frameRate(fps);
	createCanvas(width*scale, height*scale);
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

function draw(){
	background(200);
	let len = snake.body.length;
	fill(255);
	square(snake.body[0][0]*scale, snake.body[0][1]*scale, scale); //head
	fill(200);
	for(let i = len - 1; i > 0; i--){
		square(snake.body[i][0]*scale, snake.body[i][1]*scale, scale); // rest of the body
	}
	if(snake.dir!=4){ //if game started then we start updating things
		if(frameCount%6 == 0) snake.body.push([snake.body[len-1][0], snake.body[len-1][1]]);
		for(let i = len - 1; i > 0; i--){
			snake.body[i][0] = snake.body[i-1][0];
			snake.body[i][1] = snake.body[i-1][1];
		}
		snake.body[0][0]+=dirX[snake.dir];
		snake.body[0][1]+=dirY[snake.dir];
		if(snake.body[0][0]<0) snake.body[0][0]+=width;
		if(snake.body[0][1]<0) snake.body[0][1]+=height;
		snake.body[0][0]%=width;
		snake.body[0][1]%=height;
	}
}