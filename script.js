let tile = 32;
let rows = 16;
let columns = 16;

let canvas;
let canvasWidth = tile * columns; // 32 * 16
let canvasHeight = tile * rows; // 32 * 16
let canvasContext;

let shipWidth = tile * 2;
let shipHeight = tile;
let shipX = (tile * columns) / 2 - tile;
let shipY = tile * rows - tile * 2;

let ship = {
  x: shipX,
  y: shipY,
  width: shipWidth,
  height: shipHeight,
};

let shipImg;
let shipSpeed = tile;

let alienArray = [];
let alienWidth = tile * 2;
let alienHeight = tile;
let alienX = tile;
let alienY = tile;
let alienImg;

let alienRows = 2;
let alienColumns = 3;
let alienCount = 0;
let alienSpeed = 1;

let bulletArray = [];
let bulletSpeed = -10;

let score = 0;
let gameOver = false;
let highScore = 0;

let gameOverMessage = document.getElementById("game-over-message");
let restartButton = document.getElementById("restartButton");

window.onload = function () {
  highScore = localStorage.getItem("highScore");
  if (highScore !== null) {
    highScore = parseInt(highScore);
  } else {
    highScore = 0;
    localStorage.setItem("highScore", highScore);
  }

  canvas = document.getElementById("gameCanvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  canvasContext = canvas.getContext("2d");

  shipImg = new Image();
  shipImg.src = "./ship.png";
  shipImg.onload = function () {
    canvasContext.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);
  };

  alienImg = new Image();
  alienImg.src = "./alien.png";
  createAliens();

  requestAnimationFrame(update);
  document.addEventListener("keydown", moveShip);
  document.addEventListener("keyup", shoot);

  restartButton.addEventListener("click", restartGame);
};

function update() {
  requestAnimationFrame(update);

  if (gameOver) {
    gameOverMessage.style.display = "block";
    restartButton.style.display = "block";
    return;
  }

  canvasContext.clearRect(0, 0, canvas.width, canvas.height);
  canvasContext.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);

  for (let i = 0; i < alienArray.length; i++) {
    let alien = alienArray[i];
    if (alien.alive) {
      alien.x += alienSpeed;

      if (alien.x + alien.width >= canvas.width || alien.x <= 0) {
        alienSpeed *= -1;
        alien.x += alienSpeed * 2;

        for (let j = 0; j < alienArray.length; j++) {
          alienArray[j].y += alienHeight;
        }
      }

      canvasContext.drawImage(
        alienImg,
        alien.x,
        alien.y,
        alien.width,
        alien.height
      );

      if (detectCollision(ship, alien)) {
        gameOver = true;
      }

      if (alien.y >= ship.y) {
        gameOver = true;
      }
    }
  }

  for (let i = 0; i < bulletArray.length; i++) {
    let bullet = bulletArray[i];
    bullet.y += bulletSpeed;
    canvasContext.fillStyle = "pink";
    canvasContext.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

    for (let j = 0; j < alienArray.length; j++) {
      let alien = alienArray[j];
      if (!bullet.used && alien.alive && detectCollision(bullet, alien)) {
        bullet.used = true;
        alien.alive = false;
        alienCount--;
        score += 100;
      }
    }
  }

  while (
    bulletArray.length > 0 &&
    (bulletArray[0].used || bulletArray[0].y < 0)
  ) {
    bulletArray.shift();
  }

  if (alienCount == 0) {
    score += alienColumns * alienRows * 100;
    alienColumns = Math.min(alienColumns + 1, columns / 2 - 2);
    alienRows = Math.min(alienRows + 1, rows - 4);
    if (alienSpeed > 0) {
      alienSpeed += 0.2;
    } else {
      alienSpeed -= 0.2;
    }
    alienArray = [];
    bulletArray = [];
    createAliens();
  }

  canvasContext.fillStyle = "white";
  canvasContext.font = "16px courier";
  canvasContext.fillText("Score: " + score, 5, 20);
  canvasContext.fillText("High Score: " + highScore, 5, 40);
}

function moveShip(e) {
  if (gameOver) {
    return;
  }

  if (e.code == "ArrowLeft" && ship.x - shipSpeed >= 0) {
    ship.x -= shipSpeed;
  } else if (
    e.code == "ArrowRight" &&
    ship.x + shipSpeed + ship.width <= canvas.width
  ) {
    ship.x += shipSpeed;
  }
}

function createAliens() {
  for (let c = 0; c < alienColumns; c++) {
    for (let r = 0; r < alienRows; r++) {
      let alien = {
        img: alienImg,
        x: alienX + c * alienWidth,
        y: alienY + r * alienHeight,
        width: alienWidth,
        height: alienHeight,
        alive: true,
      };
      alienArray.push(alien);
    }
  }
  alienCount = alienArray.length;
}

function shoot(e) {
  if (gameOver) {
    return;
  }

  if (e.code == "Space") {
    let bullet = {
      x: ship.x + (shipWidth * 15) / 32,
      y: ship.y,
      width: tile / 8,
      height: tile / 2,
      used: false,
    };
    bulletArray.push(bullet);
  }
}

function detectCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function restartGame() {
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
  }

  window.location.reload();
}
