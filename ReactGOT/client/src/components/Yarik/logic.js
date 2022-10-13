var intersects = require('intersects');
const { GameRadio } = require('./radio');
const death1 = require('./Resources/Sounds/den1.mp3');
const death2 = require('./Resources/Sounds/den2.mp3');
const death3 = require('./Resources/Sounds/den3.mp3');
const death4 = require('./Resources/Sounds/den4.mp3');
const death5 = require('./Resources/Sounds/den5.mp3');
const boss = require('./Resources/Sounds/boss.mp3');
const boss1 = require('./Resources/Sounds/boss1.mp3');
const boss2 = require('./Resources/Sounds/boss3.mp3');
const bossdefeated = require('./Resources/Sounds/bossdefeated.mp3');
const yarik = require('./Resources/Sounds/yarik.ogg');
const yarik2 = require('./Resources/Sounds/yarikboosted.mp3');
const yarik3 = require('./Resources/Sounds/shavuha.mp3');

const junkie = require('./Resources/Sounds/junkie.mp3');

const shavuha1 = require('./Resources/Sounds/shavuha1.mp3');
const shavuha2 = require('./Resources/Sounds/shavuha2.mp3');
const { saveResult } = require('./result');

const DeadAnim = {
    Rotate: 0,
    Scale: 1,
    RotateReverse: 2,
    Fade: 3,
    ScaleUp: 4
}
const audios = [new Audio(death1), new Audio(death2), new Audio(death3), new Audio(death4), new Audio(death5)]
const shot = new Audio(yarik);
const shot2 = new Audio(yarik2);
const shot3 = new Audio(yarik3);
const needle = new Audio(junkie);
const bossArrival = [new Audio(boss), new Audio(boss1), new Audio(boss2)];
const shotshavuha = [new Audio(shavuha1), new Audio(shavuha2)];
const bossDefeated = new Audio(bossdefeated);

class Game {
    constructor(drops, enemies, balls, spawnTime, points, killedCount) {
        this.Drops = drops;
        this.Enemies = enemies;
        this.Balls = balls;
        this.Bonuses = [];
        this.spawnTime = spawnTime;
        this.Points = points;
        this.killedCount = killedCount;
        this.Over = false;
        this.Started = false;
        this.BulletsCount = 0;
        this.ShavuhaCount = 0;
        this.BusterTime = 0;
        this.TolikTime = 0;
        this.NeedleTime = 0;
        this.TimeAlive = 0;
        this.PillsCount = 0;
        this.UnityCount = 0;
        this.NeedlesCount = 0;
        this.Win = false;
        this.Boss = null;
        shot.volume = 0.35;
        shot3.volume = 0.35;
        needle.volume = 0.5;
        shotshavuha[0].volume = 0.35;
        shotshavuha[1].volume = 0.20;
    }

    addNewEnemy() {
        let leftBorder = - window.innerWidth / 2;
        let rightBorder = window.innerWidth / 2 - window.innerWidth * 0.05;
        let pos = leftBorder + rightBorder * 2 * Math.random();

        this.Enemies.push(new Enemy({ x: pos }));
    }

    addNewBonus(pos, type) {
        this.Bonuses.push(new Bonus(pos, type));
    }

    UpdateBonuses(player) {
        for (const key in this.Bonuses) {
            if (Object.hasOwnProperty.call(this.Bonuses, key)) {
                const item = this.Bonuses[key];
                item.pos.y += item.speed;
                item.speed += window.innerHeight / 108000;

                if (this.CheckPlayerKill(item, player)) {
                    this.Bonuses.splice(this.Bonuses.findIndex(x => x == item), 1);
                    if (item.type === 'Pill') {
                        this.BusterTime = 3;
                        this.PillsCount++;
                    }
                    else if (item.type === 'Shavuha') {
                        this.TolikTime = 5;
                    }
                    else if (item.type === 'Needle') {
                        this.NeedleTime = 2;
                        needle.currentTime = 0;
                        this.NeedlesCount++;
                        needle.play();
                    }
                    else if (item.type === 'Unity') {
                        this.UnityCount++;
                        for (const item of this.Enemies) {
                            this.Points += this.MultiplyPoints();
                            item.alive = false;
                            setTimeout(() => {
                                this.Enemies.splice(this.Enemies.findIndex(x => x == item), 1);
                            }, 500);
                        }
                        if (this.Boss !== null) {
                            this.Boss.hp -= 150;
                            if (this.Boss.hp < 0) {
                                this.Boss.alive = false;
                                this.Points += 10000;
                                bossDefeated.play();
                            }
                        }
                    }
                }
            }
        }
    }

    getWinConditions() {
        return (this.Enemies.length === 0 && this.Points > 20000);
    }

    getBulletType() {
        if (this.TolikTime === 0) {
            return 'Shishka';
        }
        else return 'Shavuha';
    }

    addNewDrop(pos) {
        this.Drops.push(new Drop(pos, this.getBulletType()));
        shot.volume = 1;

        if (this.TolikTime === 0) {
            this.BusterTime === 0 ? shot.play() : shot2.play()
        } else shot3.play();

        this.getBulletType() === 'Shishka' ? this.BulletsCount++ : this.ShavuhaCount++;
    }

    addNewBall(pos) {
        this.Balls.push(new Ball(pos, 0));
    }

    UpdateBalls(player) {
        for (const key in this.Balls) {
            if (Object.hasOwnProperty.call(this.Balls, key)) {
                const item = this.Balls[key];
                item.pos.y += item.speed;
                if (item.dir !== null) {
                    item.pos.x += item.dir;
                }
                item.speed += window.innerHeight / 54000;
                if (this.CheckPlayerKill(item, player)) {
                    this.Over = true;
                    saveResult(this.Points);
                    GameRadio.ToggleSomething();
                }
            }
        }
    }

    CheckPlayerKill(ball, player) {
        if (intersects.boxBox(player.x + window.innerHeight * 0.02, window.innerHeight * 0.82, window.innerWidth * 0.04, window.innerHeight * 0.02, ball.pos.x, ball.pos.y, window.innerWidth * 0.02, window.innerHeight * 0.02)) {
            return true;
        }
        return false;
    }

    UpdateBoss() {
        if (this.Boss !== null && this.Boss.alive) {
            this.Boss.Move();

            if (this.Boss.hp > 200 ? Math.random() < 0.012 : Math.random() < 0.021) {
                this.Balls.push(this.Boss.Shot());
            }
        }
    }

    UpdateDrops() {
        for (const key in this.Drops) {
            if (Object.hasOwnProperty.call(this.Drops, key)) {
                const item = this.Drops[key];
                item.pos.y -= item.speed;
                item.speed += window.innerHeight / 42000;
                if (this.CheckKill(item)) {
                    if (item.type === 'Shishka') {
                        this.Drops.splice(this.Drops.findIndex(x => x == item), 1);
                    }
                    else if (item.type === 'Shavuha') {
                        shotshavuha.at(Math.floor(Math.random() * shotshavuha.length)).play();
                    }
                    this.Points += this.MultiplyPoints();
                    if (Math.random() < 0.005 * this.TimeAlive) {
                        if (Math.random() > 0.75) {
                            this.addNewBonus({ x: item.pos.x, y: window.innerHeight * 0.05 }, 'Pill');
                        }
                        else if (Math.random() > 0.5) {
                            this.addNewBonus({ x: item.pos.x, y: window.innerHeight * 0.05 }, 'Shavuha');
                        }
                        else if (Math.random() > 0.25) {
                            this.addNewBonus({ x: item.pos.x, y: window.innerHeight * 0.05 }, 'Needle');
                        }
                        else {
                            this.addNewBonus({ x: item.pos.x, y: window.innerHeight * 0.05 }, 'Unity');
                        }
                    }
                }
                if (this.Boss !== null && this.CheckBossHit(item)) {
                    if (item.type === 'Shishka') {
                        this.Drops.splice(this.Drops.findIndex(x => x == item), 1);
                        this.Boss.hp -= 20;
                    }
                    else if (item.type === 'Shavuha') {
                        shotshavuha.at(Math.floor(Math.random() * shotshavuha.length)).play();
                        this.Drops.splice(this.Drops.findIndex(x => x == item), 1);
                        this.Boss.hp -= 60;
                    }
                    if (Math.random() < 0.0075 * this.TimeAlive) {
                        if (Math.random() > 0.5) {
                            this.addNewBonus({ x: item.pos.x, y: window.innerHeight * 0.05 }, 'Pill');
                        }
                        else {
                            this.addNewBonus({ x: item.pos.x, y: window.innerHeight * 0.05 }, 'Shavuha');
                        }
                    }
                    if (this.Boss.hp < 0) {
                        this.Boss.alive = false;
                        this.Points += 10000;
                        saveResult(this.Points);
                        bossDefeated.play();
                    }
                }
            }
        }
    }

    MultiplyPoints() {
        let NewPoints = this.AddPoints();
        NewPoints += (3000 - this.spawnTime) / 100;
        return Math.floor(NewPoints);
    }

    AddPoints() {
        ++this.killedCount;
        if (this.killedCount < 10) return 100;
        else if (this.killedCount < 30) return 150;
        else if (this.killedCount < 50) return 250;
        else return 400;
    }

    CheckKill(drop) {
        for (const item of this.Enemies) {
            if (item.alive) {
                if (intersects.boxBox(drop.pos.x, drop.pos.y, window.innerWidth * 0.03, window.innerWidth * 0.03, item.pos.x + window.innerWidth * 0.02, 0, window.innerWidth * 0.03, window.innerHeight * 0.18)) {
                    item.alive = false;
                    audios[Math.floor(Math.random() * 5)].play();
                    setTimeout(() => {
                        this.Enemies.splice(this.Enemies.findIndex(x => x == item), 1);
                    }, 500);
                    return true;
                }
            }
        }
        return false;
    }

    CheckBossHit(drop) {
        if (this.Boss.alive) {
            if (intersects.boxBox(drop.pos.x, drop.pos.y, window.innerWidth * 0.03, window.innerWidth * 0.03, this.Boss.pos.x + window.innerWidth * 0.02, 0, window.innerWidth * 0.03, window.innerHeight * 0.18)) {
                audios[Math.floor(Math.random() * 5)].play();
                return true;
            }
        }
        return false
    }

    UpdateEnemies() {
        for (const key in this.Enemies) {
            if (Object.hasOwnProperty.call(this.Enemies, key)) {
                const item = this.Enemies[key];
                item.Move();
                if (Math.random() < 0.0015 * (this.killedCount < 10 ? this.killedCount : Math.sqrt(Math.sqrt(this.killedCount))) && item.alive) {
                    this.addNewBall({ x: item.pos.x + window.innerWidth * 0.01, y: window.innerHeight * 0.1 });
                }
            }
        }

        if (this.Points >= 20000 && this.Enemies.length === 0 && this.Boss !== null && this.Boss.alive === false) {
            this.Over = true;
            GameRadio.ReduceVolume();
            GameRadio.PlayWinSound(true);
            this.Win = true;
            return true;
        }
        return false;
    }

    BossInit() {
        let leftBorder = - window.innerWidth / 2;
        let rightBorder = window.innerWidth / 2 - window.innerWidth * 0.05;
        let pos = leftBorder + rightBorder * 2 * Math.random();

        this.Boss = new Boss({ x: pos });
        bossArrival.at(Math.floor(Math.random() * bossArrival.length)).play();
    }

    RemoveLast() {
        if (this.Drops.at(0) !== undefined && this.Drops.at(0).pos.y < -100) {
            this.Drops.splice(0, 1);
        }
        if (this.Balls.at(0) !== undefined && this.Balls.at(0).pos.y > window.innerHeight + 100) {
            this.Balls.splice(0, 1);
        }
    }

    ChangeDelay() {
        if (this.spawnTime > 250) {
            this.spawnTime -= this.spawnTime / 10;
        }
        else this.spawnTime = 250;
    }

    InitGame() {
        if (!this.Started) {
            this.addNewEnemy();
            this.Started = true;
        }
    }
}

class Enemy {
    constructor(pos) {
        let rand = Math.random();
        this.pos = pos;
        this.alive = true;
        this.deadAnim = Math.floor(rand * 5);
        this.direction = rand > 0.5 ? 1 : 2;
    }

    Die = () => {
        this.alive = false;
    }

    ChangeDirection = () => {
        this.direction == 1 ? this.direction = 2 : this.direction = 1;
    }

    CheckBorders() {
        let leftBorder = - window.innerWidth / 2;
        let rightBorder = window.innerWidth / 2 - window.innerWidth * 0.05;

        if (this.pos.x < leftBorder) {
            this.pos.x = leftBorder;
            this.ChangeDirection();
        }
        else if (this.pos.x > rightBorder) {
            this.pos.x = rightBorder;
            this.ChangeDirection();
        }
    }

    Move() {
        if (this.direction != 0) {
            this.direction == 1 ? this.pos.x -= window.innerWidth / 1920 : this.pos.x += window.innerWidth / 1920;
        }
        this.CheckBorders();
    }
}

class Boss {
    constructor(pos) {
        this.pos = pos;
        this.alive = true;
        this.reloadtime = 25;
        let rand = Math.random();
        this.deadAnim = Math.floor(rand * 5);
        this.direction = rand > 0.5 ? 1 : 2;
        this.hp = 1000;
    }

    ChangeDirection = () => {
        this.direction == 1 ? this.direction = 2 : this.direction = 1;
    }

    CheckBorders() {
        let leftBorder = - window.innerWidth / 2;
        let rightBorder = window.innerWidth / 2 - window.innerWidth * 0.05;

        if (this.pos.x < leftBorder) {
            this.pos.x = leftBorder;
            this.ChangeDirection();
        }
        else if (this.pos.x > rightBorder) {
            this.pos.x = rightBorder;
            this.ChangeDirection();
        }
    }

    Move() {
        if (this.direction != 0) {
            this.direction == 1 ? this.pos.x -= window.innerWidth / 1340 : this.pos.x += window.innerWidth / 1340;
        }
        if (Math.random() < 0.001) {
            this.ChangeDirection();
        }
        this.CheckBorders();
    }

    Shot() {
        let dir = Math.random();
        return new Ball({ x: this.pos.x + window.innerWidth * 0.01, y: window.innerHeight * 0.1 }, dir > 0.66 ? window.innerWidth * 0.001 : dir > 0.33 ? -(window.innerWidth * 0.001) : 0);
    }
}

class Drop {
    constructor(pos, type) {
        this.pos = pos;
        this.speed = window.innerHeight / 540;
        this.type = type;
    }
}

class Ball {
    constructor(pos, dir) {
        this.pos = pos;
        this.speed = window.innerHeight / 540;
        this.dir = dir === null ? null : dir;
    }
}

class Bonus {
    constructor(pos, type) {
        this.pos = pos;
        this.speed = window.innerHeight / 1080;
        this.type = type;
    }
}

module.exports = {
    Game,
    DeadAnim
}