import * as PIXI from 'pixi.js';

const config = {
    width: 800,
    height: 600,
    backgroundColor: 0x87CEEB,
};
const app = new PIXI.Application({
    width: config.width,
    height: config.height,
    backgroundColor: config.backgroundColor,
    antialias: true,
});

document.getElementById('game-container').appendChild(app.view);

const gameState = {
    isPlaying: false,
    altitude: 0,
    score: 0,
    balloonSpeed: 1,
};

const backgroundContainer = new PIXI.Container();
const gameContainer = new PIXI.Container();
const uiContainer = new PIXI.Container();

app.stage.addChild(backgroundContainer);
app.stage.addChild(gameContainer);
app.stage.addChild(uiContainer);

function createBalloon() {
    const balloon = new PIXI.Container();

    const envelope = new PIXI.Graphics();
    envelope.beginFill(0xFF6B6B);
    envelope.drawCircle(0, 0, 50);
    envelope.endFill();

    const basket = new PIXI.Graphics();
    basket.beginFill(0x8B4513);
    basket.drawRect(-15, 60, 30, 25);
    basket.endFill();

    const ropes = new PIXI.Graphics();
    ropes.lineStyle(2, 0x000000);
    ropes.moveTo(-10, 50);
    ropes.lineTo(-15, 60);
    ropes.moveTo(10, 50);
    ropes.lineTo(15, 60);

    balloon.addChild(envelope);
    balloon.addChild(ropes);
    balloon.addChild(basket);

    balloon.x = config.width / 2;
    balloon.y = config.height - 100;

    return balloon;
}

const balloon = createBalloon();
gameContainer.addChild(balloon);

const balloonInitialX = balloon.x;
let wiggleTime = 0;

app.ticker.add((delta) => {
    if (gameState.isPlaying) {
        balloon.y -= gameState.balloonSpeed * delta;

        gameState.altitude += gameState.balloonSpeed * delta;
        gameState.score = Math.floor(gameState.altitude);

        wiggleTime += 0.05 * delta;
        const wiggleAmount = Math.sin(wiggleTime) * 15;
        balloon.x = balloonInitialX + wiggleAmount;
    }
});

function startGame() {
    gameState.isPlaying = true;
    gameState.altitude = 0;
    gameState.score = 0;
    balloon.y = config.height - 100;
}

startGame();
