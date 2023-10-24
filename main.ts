pins.setPull(DigitalPin.P14, PinPullMode.PullUp)
let DEAD_ZONE = 400
let CENTER = 511
let TIME_HOLD = 200
let TIME_BULLET = 5
let TIME_BULLET_DEACTIVATED = 100
let INTERVAL_DEFAULT = 500
let INTERVAL_STEP = 10
let interval = INTERVAL_DEFAULT
let readJoystick = 0
let readButton14 = 0
let bulletExists = false
let Enemy: game.LedSprite = null
let Bullet: game.LedSprite = null
let Player: game.LedSprite = null

let ST_INIT = 0
let ST_NEW_ENEMY = 1
let ST_MOVE = 2
let ST_END = 3

let state = ST_INIT
basic.forever(function () {
    if (state === ST_INIT){
        game.addScore(0)
        game.setScore(0)
        Player = game.createSprite(2, 4)
        state = ST_NEW_ENEMY
    } else if (state === ST_NEW_ENEMY){
        Enemy = game.createSprite(randint(0, 4), 0)
        state = ST_MOVE
    } else if (state === ST_MOVE){
        if (Enemy.isTouching(Player)) {
            game_over()
        }
        pause(interval)
        if (Enemy.get(LedSpriteProperty.Y) < 4){
            Enemy.change(LedSpriteProperty.Y, 1)
        } else {
            Enemy.delete()
            state = ST_NEW_ENEMY
        }
    }
})

basic.forever(function(){
    readJoystick = pins.analogReadPin(AnalogPin.P2)
    readButton14 = pins.digitalReadPin(DigitalPin.P14)
    if (readJoystick > CENTER + DEAD_ZONE) {
        Player.move(-1)
        pause(TIME_HOLD)
    }
    if (readJoystick < CENTER - DEAD_ZONE) {
        Player.move(1)
        pause(TIME_HOLD)
    }
    if (pins.digitalReadPin(DigitalPin.P14) == 0) {
        fire()
    }
})

//////// BUTTONS CONTROL
input.onButtonPressed(Button.A, function () {
    Player.move(-1)
})

input.onButtonPressed(Button.AB, function () {
    Bullet = game.createSprite(Player.get(LedSpriteProperty.X), Player.get(LedSpriteProperty.Y))
    bulletExists = true
})

input.onButtonPressed(Button.B, function () {
    Player.move(1)
})

//////// FUNCTIONS
function fire() {
    Bullet = game.createSprite(Player.get(LedSpriteProperty.X), Player.get(LedSpriteProperty.Y))
    for (let index = 0; index < 4; index++) {
        Bullet.change(LedSpriteProperty.Y, -1)
        basic.pause(10)
        if (Enemy.isTouching(Bullet)) {
            Enemy.delete()
            Bullet.delete()
            game.addScore(1)
            if (interval - INTERVAL_STEP > 0) {
                interval = interval - INTERVAL_STEP
            }
        }
    }
    Bullet.delete()
    basic.pause(80)
}

function game_over() {
    game.addScore(0)
    pause(100)
    basic.showNumber(game.score())
    game.setScore(0)
    Enemy.delete()
    Player.set(LedSpriteProperty.X, 2)
    interval = INTERVAL_DEFAULT
    state = ST_INIT
}