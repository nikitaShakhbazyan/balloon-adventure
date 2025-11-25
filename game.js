import { Application, Graphics, Text } from 'pixi.js';
import { sound } from '@pixi/sound';

const app = new Application();

await app.init({
    width: 1000,
    height: 800,
    backgroundColor: 0x87CEEB,
});

document.getElementById('game-container').appendChild(app.canvas);

sound.add('wind', {
    url: '/sounds/mixkit-air-sound.wav',
    volume: 0.3,
    loop: true,
    autoPlay: true,
    preload: true,
});

sound.add('pop', {
    url: 'https://assets.mixkit.co/active_storage/sfx/2073/2073-preview.mp3',
    volume: 1,
    sprites: {
        short: {
            start: 0,
            end: 0.5,
        }
    }
});

sound.volumeAll = 1;

let soundStarted = false;

const tryStartSound = async () => {
    if (soundStarted) return;

    try {
        const context = sound.context;
        if (context.state === 'suspended') {
            await context.resume();
        }
        const windSound = sound.find('wind');
        if (windSound && !windSound.isPlaying) {
            sound.play('wind');
            soundStarted = true;
        }
    } catch (err) {
        console.log('Sound start:', err.message);
    }
};

setTimeout(tryStartSound, 100);

window.addEventListener('mousemove', tryStartSound, { once: true });
window.addEventListener('keydown', tryStartSound, { once: true });
window.addEventListener('touchstart', tryStartSound, { once: true });
window.addEventListener('click', tryStartSound, { once: true });

const gameState = {
    isPlaying: true,
    altitude: 0,
    score: 0,
    balloonSpeed: 1.5,
    popTime: 8 + Math.random() * 7,
    elapsedTime: 0,
};

const balloon = new Graphics();
balloon.circle(0, 0, 70);
balloon.fill(0xFF6B6B);
balloon.x = 500;
balloon.y = 500;
app.stage.addChild(balloon);

const basket = new Graphics();
basket.rect(0, 20, 30, 25);
basket.fill(0x8B4513);
basket.x = 425;
basket.y = 580;
app.stage.addChild(basket);

const clouds = [];
for (let i = 0; i < 6; i++) {
    const cloud = new Graphics();
    const scale = 0.9 + Math.random() * 0.7;
    cloud.ellipse(0, 0, 40 * scale, 25 * scale);
    cloud.ellipse(30 * scale, -25 * scale, 35 * scale, 25 * scale);
    cloud.ellipse(60 * scale, 0, 40 * scale, 25 * scale);
    cloud.ellipse(60 * scale, 40 * scale, 25 * scale);
    cloud.fill({ color: 0xFFFFFF, alpha: 0.8 });
    cloud.x = Math.random() * 800;
    cloud.y = Math.random() * 500;
    cloud.speed = 0.5 + Math.random() * 0.4;
    app.stage.addChild(cloud);
    clouds.push(cloud);
}

const scoreText = new Text({
    text: 'Score: 0',
    style: {
        fontFamily: 'Arial',
        fontSize: 28,
        fill: 0xFFFFFF,
        fontWeight: 'bold',
    }
});
scoreText.x = 20;
scoreText.y = 20;
app.stage.addChild(scoreText);

const landButtonBg = new Graphics();
landButtonBg.roundRect(0, 0, 150, 50, 10);
landButtonBg.fill(0x4CAF50);
landButtonBg.x = 425;
landButtonBg.y = 700;
landButtonBg.eventMode = 'static';
landButtonBg.cursor = 'pointer';
app.stage.addChild(landButtonBg);

const landButtonText = new Text({
    text: 'Land Now',
    style: {
        fontFamily: 'Arial',
        fontSize: 22,
        fill: 0xFFFFFF,
        fontWeight: 'bold',
    }
});
landButtonText.x = 450;
landButtonText.y = 710;
app.stage.addChild(landButtonText);

landButtonBg.on('pointerdown', () => {
    if (gameState.isPlaying) {
        gameState.isPlaying = false;
        showGameOver(true);
    }
});

landButtonBg.on('pointerover', () => {
    landButtonBg.tint = 0x45a049;
});

landButtonBg.on('pointerout', () => {
    landButtonBg.tint = 0xFFFFFF;
});

function showGameOver(won) {
    landButtonBg.visible = false;
    landButtonText.visible = false;

    const message = new Text({
        text: won ? `Success! Score: ${gameState.score}` : `Balloon Popped at ${gameState.score} meters!`,
        style: {
            fontFamily: 'Arial',
            fontSize: 48,
            fill: won ? 0x00FF00 : 0xFF0000,
            fontWeight: 'bold',
        }
    });
    message.x = 500 - message.width / 2;
    message.y = 250;
    app.stage.addChild(message);

    const playAgainBg = new Graphics();
    playAgainBg.roundRect(0, 0, 180, 60, 10);
    playAgainBg.fill(0x2196F3);
    playAgainBg.x = 410;
    playAgainBg.y = 330;
    playAgainBg.eventMode = 'static';
    playAgainBg.cursor = 'pointer';
    app.stage.addChild(playAgainBg);

    const playAgainText = new Text({
        text: 'Play Again',
        style: {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xFFFFFF,
            fontWeight: 'bold',
        }
    });
    playAgainText.x = 450;
    playAgainText.y = 348;
    app.stage.addChild(playAgainText);

    playAgainBg.on('pointerdown', () => {
        app.stage.removeChild(message);
        app.stage.removeChild(playAgainBg);
        app.stage.removeChild(playAgainText);
        resetGame();
    });
}
function popBalloon() {
    gameState.isPlaying = false;
    try {
        sound.play('pop', { sprite: 'short' });
    } catch (err) {
        console.log('Pop sound error:', err.message);
    }
    balloon.clear();
    balloon.poly([
        { x: 0, y: -30 },
        { x: 20, y: 10 },
        { x: -20, y: 10 }
    ]);
    balloon.fill(0xFF0000);
    showGameOver(false);
}

// logic of popping balloon with pieces(could be added later, btw looks fine:) )


// function popBalloon() {
//     gameState.isPlaying = false;
//     balloon.clear();

//     for (let i = 0; i < 15; i++) {
//         const piece = new Graphics();
//         piece.beginFill(0xFF0000);
//         const angle = Math.random() * Math.PI * 2;
//         const dist = 20 + Math.random() * 30;
//         piece.drawCircle(Math.cos(angle) * dist, Math.sin(angle) * dist, 5 + Math.random() * 5);
//         piece.endFill();
//         balloon.addChild(piece);
//     }
//     showGameOver(false);
// }



function resetGame() {
    // balloon.removeChildren();
    balloon.clear();
    balloon.circle(0, 0, 50);
    balloon.fill(0xFF6B6B);
    balloon.y = 400;

    basket.y = 460;

    landButtonBg.visible = true;
    landButtonText.visible = true;

    gameState.isPlaying = true;
    gameState.altitude = 0;
    gameState.score = 0;
    gameState.elapsedTime = 0;
    gameState.popTime = 8 + Math.random() * 7;

    clouds.forEach(cloud => {
        cloud.y = Math.random() * 600;
        cloud.x = Math.random() * 800;
    });
}

const balloonInitialX = balloon.x;
let wiggleTime = 0;

app.ticker.add((time) => {
    if (gameState.isPlaying) {
        const delta = time.deltaTime;
        gameState.elapsedTime += delta / 60;

        if (gameState.elapsedTime >= gameState.popTime) {
            popBalloon();
            return;
        }

        gameState.altitude += gameState.balloonSpeed * delta;
        gameState.score = Math.floor(gameState.altitude);
        scoreText.text = `Score: ${gameState.score ? gameState.score : 0}`;

        wiggleTime += 0.05 * delta;
        const wiggleAmount = Math.sin(wiggleTime) * 15;
        balloon.x = balloonInitialX + wiggleAmount;
        basket.x = balloonInitialX + wiggleAmount - 15;

        clouds.forEach(cloud => {
            cloud.y += gameState.balloonSpeed * delta * cloud.speed;
            if (cloud.y > 850) {
                cloud.y = -50;
                cloud.x = Math.random() * 800;
            }
        });
    }
});
