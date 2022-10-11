import React from 'react';
import YarikImage from './Resources/Yarik.png';
import DropImage from './Resources/Шишка.png';
import BallImage from './Resources/ball.png';
import EnemyImage from './Resources/enemy.png';
import EnemyDeadImage from './Resources/enemy-stuffed.png';
import classes from './yarik.module.css';
import { DeadAnim, Game } from './logic';
import { GameRadio } from './radio';

const Yarik = function () {
    const [pos, setPos] = React.useState({ x: -55 });
    const [game, setGame] = React.useState(new Game([], [], [], 3000, 0, 0));
    const [movement, setMovement] = React.useState({ dirleft: false, dirright: false, shooting: false });
    const [reload, setReload] = React.useState({ time: 0 });

    React.useState(() => {
        document.body.addEventListener('keydown', (event) => Move(event, true));
        document.body.addEventListener('keyup', (event) => Move(event, false));
        document.body.style.overflow = 'hidden';
        CreateEnemy();
    });
    React.useEffect(() => {
        const Interval = setInterval(() => {
            if (!game.Over) {
                calcPos();
                setGame(game, game.UpdateDrops());
                setGame(game, game.UpdateBalls(pos));
                setGame(game, game.UpdateEnemies());
                setGame(game, game.RemoveLast());
                setGame(game, game.Balls = game.Balls);

                if (reload.time > 0)
                    setReload(reload.time = reload.time - 1);
            }
        }, 1);

        return function stopTimer() {
            clearInterval(Interval);
        }
    }, [])

    function CreateEnemy() {
        if (!game.Over) {
            if (game.Started) {
                if (game.Enemies.length < 12) {
                    game.addNewEnemy();
                    game.ChangeDelay();
                    setGame(game, game.Enemies = game.Enemies);
                    setGame(game, game.spawnTime = game.spawnTime);
                }
            }

            setTimeout(function () {
                CreateEnemy();
            }, game.spawnTime);
        }
    }
    function calcPos() {
        let tempPos = pos;
        let leftBorder = - window.innerWidth / 2;
        let rightBorder = window.innerWidth / 2 - window.innerWidth * 0.05;

        if (movement.dirleft || movement.dirright || movement.shooting) {
            GameRadio.InitRadio();
            setGame(game, game.InitGame());

            if (movement.dirleft) {
                tempPos.x -= window.innerWidth / 300;
            }
            if (movement.dirright) {
                tempPos.x += window.innerWidth / 300;
            }
            if (movement.shooting && reload.time == 0) {
                setGame(game, game.addNewDrop({ x: tempPos.x + window.innerWidth * 0.01, y: window.innerHeight * 0.8 }));
                setReload(reload.time = 150);
            }
        }

        if (tempPos.x < leftBorder) tempPos.x = leftBorder;
        else if (tempPos.x > rightBorder) tempPos.x = rightBorder;

        setPos({ x: tempPos.x });
    }
    function getDeadAnim(enemy) {
        if (enemy.deadAnim === DeadAnim.Rotate) return classes.dead1;
        else if (enemy.deadAnim === DeadAnim.Scale) return classes.dead2;
        else if (enemy.deadAnim === DeadAnim.RotateReverse) return classes.dead3;
        else if (enemy.deadAnim === DeadAnim.Fade) return classes.dead4;
        else return classes.dead4;
    }
    function Move(event, truth) {
        if (event.key === 'a' || event.key === 'ф') {
            setMovement(movement.dirleft = truth);
        }
        if (event.key === 'd' || event.key === 'в') {
            setMovement(movement.dirright = truth);
        }
        if (event.code === 'Space') {
            setMovement(movement.shooting = truth);
        }
    }
    function StartAgain() {
        setGame(new Game([], [], [], 3000, 0, 0));
        setGame(game, game.Balls = []);
        setGame(game, game.Drops = []);
        setGame(game, game.Enemies = []);
        setGame(game, game.spawnTime = 3000);
        setGame(game, game.Points = 0);
        setGame(game, game.killedCount = 0);
        setGame(game, game.Started = false);
        setGame(game, game.Over = false);
        setPos(pos, pos.x = -55);
        CreateEnemy();
    }

    function getHints(){
        if(!game.Started) return classes.hintContainer;
        else return `${classes.hintContainer + ' ' + classes.fade}`;
    }

    return (
        <div className={classes.container}>
            <div className={getHints()}>
                <div className={classes.keysContainer}>
                    <div className={classes.keybutton}>A</div>
                    <div className={classes.keybutton}>D</div>
                </div>
            </div>
            <div className={`${classes.deadtitle} ${game.Over ? classes.show : ''}`}>
                <div>Денчик выиграл)</div>
                <div>Очки: <span className={classes.counter}>{game.Points}</span></div>
                <div>Прибито: <span className={classes.counter}>{game.killedCount}</span></div>
                <div className={classes.button} onClick={StartAgain}>Начать заново</div>
            </div>
            <img style={{ transform: `translate(${pos.x}px)`, height: `calc(18%)`, width: `5%` }} className={`${classes.yarik} ${game.Over ? classes.gameOver : ''}`} alt='yarik' src={YarikImage} />
            {game.Drops.map((item, index) => {
                return <img key={index} style={{ transform: `translate(${item.pos.x}px, ${item.pos.y}px)` }} className={classes.drop} src={DropImage} />
            })}
            {game.Enemies.map((item, index) => {
                return <img key={index} style={{ transform: `translate(${item.pos.x}px` }} className={`${classes.enemy} ${item.alive ? '' : getDeadAnim(item)}`} src={item.alive ? EnemyImage : EnemyDeadImage} />
            })}
            {game.Balls.map((item, index) => {
                return <img key={index} style={{ transform: `translate(${item.pos.x}px, ${item.pos.y}px)` }} className={classes.drop} src={BallImage} />
            })}
            <div className={classes.points}>{game.Points}</div>
        </div>
    )
}

export default Yarik;