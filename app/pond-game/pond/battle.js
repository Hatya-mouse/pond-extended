"use client"

import * as Pond from '@pond-core/pond';
import * as Utils from '@pond-game/utils/utils';

/** List of events to be visualized. */
export var events = [];
/** List of missiles in flight. */
export var missiles = [];
/** Time for cannon to be reloaded. */
export var reload_time = 1;
/** Ordered list of avatar with the best avatar first. */
export var rank = [];
/** Speed of missiles. */
var missile_speed = 3;
/** Rate of acceleration. */
var avatarAccel = 5;
/** Statements per frame. */
var statementsPerFrame = 100;
/** Speed of avatars' movement. */
var avatarSpeed = 1;
/** Center to center distance for avatars to collide. */
var collisionRadius = 7;
/** Damage from worst-case collision. */
export var collisionDamage = 3;
/** PID of executing task. */
var pid = 0;
/** Time to end the battle, in milliseconds. */
var endTime = 0;
/** Time limit of the battle, in milliseconds. */
var timeLimit = 60 * 60 * 1000;
/** Callback function called when the battle is over. */
var doneCallback_ = 0;
/** Current interpreter processing avatar. */
var currentAvatar = 0;
/** Pond game settings. */
var settings_ = {};

/** Initializa the battle. */
export function init(settings) {
    settings_ = settings;
}

/** Reset the field. */
export function reset(settings) {
    // Get the settings.
    settings_ = settings;
    // Reset the battle.
    clearTimeout(pid);
    events = [];
    missiles = [];
    rank = [];
    for (const avatar of Pond.avatars) {
        avatar.reset();
    }
}

/** Start the battle. */
export function start(doneCallback) {
    doneCallback_ = doneCallback;
    endTime = Date.now() + timeLimit;
    for (const avatar of Pond.avatars) {
        try {
            avatar.initInterpreter();
        } catch (e) {
            Utils.errorLog(avatar, ' fails to load: ', e);
            avatar.die();
        }
    }
    update();
}

/** Update the frame. Called every frames. */
function update() {
    // Update the interpreter.
    updateInterpreters();
    // Update the missile states.
    updateMissiles();
    // Update the avatar states.
    updateAvatars();
    if (Pond.avatars.length <= rank.length + 1) {
        endTime = Math.min(endTime, Date.now() + 1000);
    }
    if (Date.now() > endTime) {
        stop();
    } else {
        // Do it all again in the moment.
        pid = setTimeout(update, 1000 / settings_.game.tps);
    }
}

/** Just pause the game. */
export function pause() {
    clearTimeout(pid);
}

function stop() {
    clearTimeout(pid);
    // Add the survivors to the ranks based on their damage.
    const survivors = [];
    for (const avatar of Pond.avatars) {
        if (!avatar.dead) {
            survivors.push(avatar);
        }
    }
    const survivorCount = survivors.length;
    survivors.sort((a, b) => { return a.damage - b.damage; });
    while (survivors.length) {
        rank.unshift(survivors.pop());
    }
    // Fire done callback.
    if (doneCallback_) doneCallback_(survivorCount);
}

/** Update missiles' states. */
function updateMissiles() {
    for (let i = missiles.length - 1; i >= 0; i--) {
        const missile = missiles[i];
        missile.progress += missile_speed;
        let maxDamage = 0;
        if (missile.range - missile.progress < missile_speed / 2) {
            // Boom.
            missiles.splice(i, 1);
            // Damage any avatar in range.
            for (const avatar of Pond.avatars) {
                if (avatar.dead) {
                    continue;
                }
                const range = Utils.math.getDistance(avatar.loc.x, avatar.loc.y, missile.endLoc.x, missile.endLoc.y);
                const damage = (1 - range / 4) * 10;
                if (damage > 0) {
                    avatar.addDamage(damage);
                    maxDamage = Math.max(maxDamage, damage);
                }
            }
            events.push({
                type: 'BOOM',
                damage: maxDamage,
                x: missile.endLoc.x,
                y: missile.endLoc.y
            })
        }
    }
}

/** Update avatars' states. */
function updateAvatars() {
    // Loop around avatars.
    for (const avatar of Pond.avatars) {
        if (avatar.dead) {
            continue;
        }
        // Accelerate the avatar's speed.
        if (avatar.speed < avatar.desiredSpeed) {
            avatar.speed = Math.min(avatar.speed + avatarAccel, avatar.desiredSpeed);
        } else if (avatar.speed > avatar.desiredSpeed) {
            avatar.speed = Math.max(avatar.speed - avatarAccel, avatar.desiredSpeed);
        }
        // Move.
        if (avatar.speed > 0) {
            // Get the closest avatar.
            const [, closestBefore] = closestNeighbour(avatar);
            // Get the movement from the angle and the speed.
            const angleRadians = Utils.math.degToRad(avatar.degree);
            const speed = avatar.speed / 100 * avatarSpeed;
            const dx = Math.cos(angleRadians) * speed;
            const dy = Math.sin(angleRadians) * speed;
            // Move the avatar.
            avatar.loc.x += dx;
            avatar.loc.y += dy;
            // Check if the avatar hit the edge.
            if (avatar.loc.x < 0 || avatar.loc.x > settings_.viewport.width ||
                avatar.loc.y < 0 || avatar.loc.y > settings_.viewport.height) {
                // Clamp the location of the avatar.
                avatar.loc.x = Utils.math.clamp(avatar.loc.x, 0, settings_.viewport.width);
                avatar.loc.y = Utils.math.clamp(avatar.loc.y, 0, settings_.viewport.height);
                // Calculate and give damage to the avatar.
                const damage = avatar.speed / 100 * collisionDamage;
                avatar.addDamage(damage);
                // Set the speed to zero.
                avatar.speed = 0;
                avatar.desiredSpeed = 0;
                events.push({
                    type: 'CRASH',
                    avatar: avatar,
                    damage: damage
                });
            } else {
                const [neighbour, closestAfter] = closestNeighbour(avatar);
                if (closestAfter < collisionRadius && closestBefore > closestAfter) {
                    // Collision with another avatar.
                    // Move to the position before.
                    avatar.loc.x -= dx;
                    avatar.loc.y -= dy;
                    // Calculate and give damage to the avatar.
                    const damage = Math.max(avatar.speed, neighbour.speed) / 100 * collisionDamage;
                    avatar.addDamage(damage);
                    // Stop the avatar.
                    avatar.speed = 0;
                    avatar.desiredSpeed = 0;
                    // Add the damage to the neighbour.
                    neighbour.addDamage(damage);
                    // Stop the neighbour too.
                    neighbour.speed = 0;
                    neighbour.desiredSpeed = 0;
                    // Push the collision event.
                    events.push({
                        type: 'CRASH',
                        avatar: avatar,
                        damage: damage
                    }, {
                        type: 'CRASH',
                        avatar: neighbour,
                        damage: damage
                    });
                }
            }
        }
    }
}

/** Update the Interpreters of each avatars. */
function updateInterpreters() {
    for (let i = 0; i < statementsPerFrame; i++) {
        for (const avatar of Pond.avatars) {
            if (avatar.dead) {
                continue;
            }
            currentAvatar = avatar;
            try {
                avatar.interpreter.step();
            } catch (e) {
                Utils.errorLog(avatar + ' throws an error: ' + e);
                avatar.die();
            }
            currentAvatar = null;
        }
    }
}

/**
 * Get the closest avatar to the given avatar.
 * @returns {[Avatar, Number]} Returns the closest avatar and the distance to it.
 */
function closestNeighbour(avatar) {
    let closest = null;
    let distance = Infinity;
    for (const neighbour of Pond.avatars) {
        if (!neighbour.dead && avatar !== neighbour) {
            const thisDistance = Math.min(distance, Utils.math.getDistance(avatar.loc.x, avatar.loc.y, neighbour.loc.x, neighbour.loc.y));
            if (thisDistance < distance) {
                distance = thisDistance;
                closest = neighbour;
            }
        }
    }
    return [closest, distance];
}

export var initInterpreter = (interpreter, globalObject) => {
    let log = (value) => {
        Utils.log(`${currentAvatar.name} logs: ${Number(value)}`);
    };
    wrap('log', log);

    let scan = (degree, resolution) => {
        return currentAvatar.scan(degree, resolution);
    };
    wrap('scan', scan);

    let cannon = (degree, range) => {
        return currentAvatar.cannon(degree, range);
    };
    wrap('cannon', cannon);

    let drive = (degree, speed) => {
        currentAvatar.drive(degree, speed);
    };
    wrap('drive', drive);
    wrap('swim', drive);

    let stop = () => {
        currentAvatar.speed = 0;
        currentAvatar.disiredSpeed = 0;
    };
    wrap('stop', stop);

    var damage = () => {
        return currentAvatar.damage;
    };
    wrap('damage', damage);

    var health = () => {
        return 100 - currentAvatar.damage;
    };
    wrap('health', health);

    var speed = () => {
        return currentAvatar.speed;
    };
    wrap('speed', speed);

    var getX = () => {
        return currentAvatar.loc.x;
    };
    wrap('loc_x', getX);
    wrap('getX', getX);

    var getY = () => {
        return currentAvatar.loc.y;
    };
    wrap('loc_y', getY);
    wrap('getY', getY);

    function wrap(name, func) {
        interpreter.setProperty(globalObject, name,
            interpreter.createNativeFunction(func, false));
    }

    var myMath = interpreter.getProperty(globalObject, 'Math');
    if (myMath) {
        let sin_deg = (v) => {
            return Math.sin(Utils.math.degToRad(v));
        };
        wrapMath('sin_deg', sin_deg);

        let cos_deg = (v) => {
            return Math.cos(Utils.math.degToRad(v));
        };
        wrapMath('cos_deg', cos_deg);

        let tan_deg = (v) => {
            return Math.tan(Utils.math.degToRad(v));
        };
        wrapMath('tan_deg', tan_deg);

        let asin_deg = (v) => {
            return Utils.math.radToDeg(Math.asin(v));
        };
        wrapMath('asin_deg', asin_deg);

        let acos_deg = (v) => {
            return Utils.math.radToDeg(Math.acos(v));
        };
        wrapMath('acos_deg', acos_deg);

        let atan_deg = (v) => {
            return Utils.math.radToDeg(Math.atan(v));
        };
        wrapMath('atan_deg', atan_deg);
    }

    function wrapMath(name, func) {
        interpreter.setProperty(myMath, name,
            interpreter.createNativeFunction(func, false));
    }
};
