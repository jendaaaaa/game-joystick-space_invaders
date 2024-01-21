////// INITIALIZATION
// CONSTANTS
let VALUE_DEADZONE = 400;
let VALUE_CENTER = 511;
let TIME_HOLD = 200;
let TIME_BULLET = 20;
let TIME_NEXT_BULLET = 100;
let INTERVAL_DEFAULT = 500;
let INTERVAL_STEP = 10;
let PIN_PRESSED = 0;

// PINS
let PIN_BUTTON = DigitalPin.P14;
let PIN_JOYSTICK = AnalogPin.P2;

// VARIABLES
let interval = INTERVAL_DEFAULT;
let value_joystick = 0;
let value_button = 0;
let bullet_exists = false;

// OBJECTS
let Enemy: game.LedSprite = null;
let Bullet: game.LedSprite = null;
let Player: game.LedSprite = null;

// STATES
let ST_INIT = 0;
let ST_NEW_ENEMY = 1;
let ST_MOVE = 2;
let ST_END = 3;

// INIT
pins.setPull(PIN_BUTTON, PinPullMode.PullUp);
let state = ST_INIT;

////// INPUT
// JOYSTICK
basic.forever(function(){
    value_joystick = pins.analogReadPin(PIN_JOYSTICK);
    value_button = pins.digitalReadPin(PIN_BUTTON);
    if (value_joystick > VALUE_CENTER + VALUE_DEADZONE) {
        Player.move(-1);
        pause(TIME_HOLD);
    } else if (value_joystick < VALUE_CENTER - VALUE_DEADZONE) {
        Player.move(1);
        pause(TIME_HOLD);
    }
    if (value_button === PIN_PRESSED) {
        if(!bullet_exists){
            shoot();
        }
    }
})

// BUTTONS
input.onButtonPressed(Button.A, function () {
    Player.move(-1);
})

input.onButtonPressed(Button.AB, function () {
    Bullet = game.createSprite(Player.get(LedSpriteProperty.X), Player.get(LedSpriteProperty.Y));
    bullet_exists = true;
})

input.onButtonPressed(Button.B, function () {
    Player.move(1);
})

////// MAIN
basic.forever(function () {
    if (state === ST_INIT){
        game.addScore(0);
        game.setScore(0);
        Player = game.createSprite(2, 4);
        state = ST_NEW_ENEMY;
    } else if (state === ST_NEW_ENEMY){
        Enemy = game.createSprite(randint(0, 4), 0);
        state = ST_MOVE;
    } else if (state === ST_MOVE){
        if (Enemy.isTouching(Player)) {
            game_over();
        }
        if (Enemy.get(LedSpriteProperty.Y) >= 4){
            Enemy.delete();
            state = ST_NEW_ENEMY;
        }
        pause(interval);
        Enemy.change(LedSpriteProperty.Y, 1);
    }
})

////// FUNCTIONS
// SHOOT
function shoot() {
    Bullet = game.createSprite(Player.get(LedSpriteProperty.X), Player.get(LedSpriteProperty.Y))
    for (let index = 0; index < 4; index++) {
        Bullet.change(LedSpriteProperty.Y, -1);
        basic.pause(TIME_BULLET);
    }
    if (Enemy.get(LedSpriteProperty.X) === Bullet.get(LedSpriteProperty.X)){
        Enemy.delete();
        game.addScore(1);
        if (interval - INTERVAL_STEP > 0) {
            interval = interval - INTERVAL_STEP;
        }
    }
    Bullet.delete();
    basic.pause(TIME_NEXT_BULLET);
}

// GAME OVER
function game_over() {
    game.addScore(0);
    pause(100);
    basic.showNumber(game.score());
    game.setScore(0);
    Enemy.delete();
    Player.set(LedSpriteProperty.X, 2);
    interval = INTERVAL_DEFAULT;
    state = ST_INIT;
}