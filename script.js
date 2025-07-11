const canvas = document.getElementById("pong");
const ctx = canvas.getContext("2d");

// Dynamic canvas resize
canvas.width = window.innerWidth > 800 ? 800 : window.innerWidth - 40;
canvas.height = window.innerHeight > 500 ? 500 : window.innerHeight - 100;

// Difficulty selection
let difficulty = prompt("Select difficulty: Easy or Hard", "Easy");
difficulty = difficulty.toLowerCase();

let aiFactor = difficulty === "hard" ? 0.1 : 0.05;
let initialSpeed = difficulty === "hard" ? 7 : 4;

// Ball
const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 10,
  velocityX: initialSpeed,
  velocityY: initialSpeed,
  speed: initialSpeed,
  color: "WHITE"
};

const paddleWidth = 10;
const paddleHeight = 100;

const user = {
  x: 0,
  y: canvas.height / 2 - paddleHeight / 2,
  width: paddleWidth,
  height: paddleHeight,
  color: "WHITE",
  score: 0
};

const com = {
  x: canvas.width - paddleWidth,
  y: canvas.height / 2 - paddleHeight / 2,
  width: paddleWidth,
  height: paddleHeight,
  color: "WHITE",
  score: 0
};

const net = {
  x: canvas.width / 2 - 1,
  y: 0,
  width: 2,
  height: 10,
  color: "WHITE"
};

let messages = [
  "Nice try, human!",
  "Too slow!",
  "You blinked!",
  "You're not ready!",
  "AI wins again!",
  "That was cute."
];

let cheer = [
  "Gotcha!",
  "Score one for you.",
  "Hmm... interesting.",
  "Lucky shot!",
  "Well played."
];

let fireworks = [];
let gameOver = false;

function drawRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawArc(x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.fill();
}

function drawText(text, x, y) {
  ctx.fillStyle = "WHITE";
  ctx.font = "45px fantasy";
  ctx.fillText(text, x, y);
}

function drawNet() {
  for (let i = 0; i <= canvas.height; i += 15) {
    drawRect(net.x, net.y + i, net.width, net.height, net.color);
  }
}

canvas.addEventListener("mousemove", movePaddle);
document.addEventListener("keydown", keyControl);
canvas.addEventListener("touchmove", touchMove, false);

function movePaddle(evt) {
  let rect = canvas.getBoundingClientRect();
  user.y = evt.clientY - rect.top - user.height / 2;
}

function touchMove(evt) {
  evt.preventDefault();
  let touch = evt.touches[0];
  let rect = canvas.getBoundingClientRect();
  user.y = touch.clientY - rect.top - user.height / 2;
}

function keyControl(e) {
  const step = 20;
  if (e.key === "ArrowUp") user.y -= step;
  if (e.key === "ArrowDown") user.y += step;
}

function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.velocityX = -ball.velocityX;
  ball.speed = initialSpeed;
}

function collision(b, p) {
  return (
    b.x - b.radius < p.x + p.width &&
    b.x + b.radius > p.x &&
    b.y < p.y + p.height &&
    b.y > p.y
  );
}

function showSmackTalk(text) {
  ctx.fillStyle = "red";
  ctx.font = "20px sans-serif";
  ctx.fillText(text, canvas.width - 250, canvas.height - 30);
}

function update() {
  if (gameOver) return;

  ball.x += ball.velocityX;
  ball.y += ball.velocityY;

  com.y += (ball.y - (com.y + com.height / 2)) * aiFactor;

  if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0)
    ball.velocityY = -ball.velocityY;

  let player = ball.x < canvas.width / 2 ? user : com;

  if (collision(ball, player)) {
    let collidePoint = ball.y - (player.y + player.height / 2);
    collidePoint = collidePoint / (player.height / 2);

    let angleRad = (Math.PI / 4) * collidePoint;
    let direction = ball.x < canvas.width / 2 ? 1 : -1;

    ball.velocityX = direction * ball.speed * Math.cos(angleRad);
    ball.velocityY = ball.speed * Math.sin(angleRad);
    ball.speed += 0.5;
  }

  if (ball.x - ball.radius < 0) {
    com.score++;
    showSmackTalk(messages[Math.floor(Math.random() * messages.length)]);
    resetBall();
  } else if (ball.x + ball.radius > canvas.width) {
    user.score++;
    showSmackTalk(cheer[Math.floor(Math.random() * cheer.length)]);
    resetBall();
  }

  if (user.score >= 10 || com.score >= 10) {
    gameOver = true;
    for (let i = 0; i < 100; i++) {
      fireworks.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: Math.random() * 3 + 2,
        color: `hsl(${Math.random() * 360}, 100%, 50%)`,
        speedX: (Math.random() - 0.5) * 10,
        speedY: (Math.random() - 0.5) * 10
      });
    }
  }
}

function render() {
  drawRect(0, 0, canvas.width, canvas.height, "BLACK");
  drawNet();

  drawText(user.score, canvas.width / 4, canvas.height / 5);
  drawText(com.score, (3 * canvas.width) / 4, canvas.height / 5);

  drawRect(user.x, user.y, user.width, user.height, user.color);
  drawRect(com.x, com.y, com.width, com.height, com.color);
  drawArc(ball.x, ball.y, ball.radius, ball.color);

  if (gameOver) {
    fireworks.forEach(f => {
      drawArc(f.x, f.y, f.radius, f.color);
      f.x += f.speedX;
      f.y += f.speedY;
    });
  }
}

function game() {
  update();
  render();
}

setInterval(game, 1000 / 50);