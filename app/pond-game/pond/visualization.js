import * as Utils from '../utils/utils';
import * as Pond from './pond';
import * as Battle from './battle';

/** Private variable to hold the highlighted avatar index */
let _highlightedAvatar = NaN;

/** Actual avatar size to be shown. */
var avatarSize = 0.1;
/** Size of missiles. */
var missileRadius = 0.03;
/** Length of the beam. */
var beamLength = 2.0;
/** Viewport canvas. */
var viewport;
/** Canvas for scratch. */
var scratchCanvas;
/** Canvas context of viewport canvas. */
var ctxViewport;
/** Canvas context of scratch canvas. */
var ctxScratch;
/** PID of the next update process. */
var pid = 0;
/** Last frame date. */
var lastFrame = 0;
/** Delay between previous draw() and next frame upate. */
var lastDelay = 0;
/** Pond game settings. */
var _settings = {};

/** Initializa the canvas. */
export function init(canvas, scratch, settings) {
    // Get the canvas.
    viewport = canvas;
    scratchCanvas = scratch;
    ctxViewport = canvas.getContext('2d');
    ctxScratch = scratch.getContext('2d');
    // Get the settings;
    _settings = settings;
    // Draw.
    draw();
}

/** Stop and reset the visualization, and draw once. */
export function reset(settings) {
    _settings = settings;
    stop();
    draw();
}

// Setter for highlightedAvatar
export function setHighlightedAvatar(index) {
    _highlightedAvatar = index;
}

export function setFieldSize(width, height) {
    _settings.viewport.width = width;
    _settings.viewport.height = height;
}

export function redraw() {
    draw();
}

/** Called when stop the rendering. */
function stop() {
    clearTimeout(pid);
}

/** Called when start the game. */
export function start() {
    update();
}

/** Called every frame. */
function update() {
    // Draw the frame.
    draw();
    // Calculate the work time.
    const now = Date.now();
    const workTime = now - lastFrame - lastDelay;
    const delay = Math.max(1, (1000 / _settings.game.fps) - workTime);
    pid = setTimeout(update, delay);
    lastFrame = now;
    lastDelay = delay;
}

/** Draw the frame. */
function draw() {
    // Set up the canvas.
    const ctx = ctxScratch;
    if (!ctx) return;

    ctx.clearRect(0, 0, scratchCanvas.width, scratchCanvas.height);
    ctxViewport.clearRect(0, 0, viewport.width, viewport.height);

    // Fill the canvas with blue.
    ctx.fillStyle = _settings.viewport.backgroundColor;
    ctx.fillRect(0, 0, scratchCanvas.width, scratchCanvas.height);

    // Draw dead avatars first.
    const avatars = [];
    for (const avatar of Pond.avatars) {
        if (avatar.dead) {
            avatars.unshift(avatar);
        } else {
            avatars.push(avatar);
        }
    }

    // Draw avatars.
    avatars.forEach((avatar) => {
        // Highlight is the avatar is highlighted.
        drawAvatar(ctx, avatar, avatar.id === _highlightedAvatar);
    });

    // Draw the missiles.
    for (const missile of Battle.missiles) {
        drawMissile(ctx, missile);
    }

    // Draw events.
    for (const event of Battle.events) {
        const avatar = event.avatar;
        if (event.type === 'SCAN') {
            // Draw a scan beam.
            drawBeam(ctx, event, avatar);
        }
    }
    // Remove all events to prevent events to be shown in the next frame.
    Battle.events.length = 0;

    // Commit changes to the viewport context.
    ctxViewport.drawImage(scratchCanvas, 0, 0, viewport.width, viewport.height);
}

/** Draw avatar's body and waves. */
function drawAvatar(ctx, avatar, highlighted) {
    // Highlight amount.
    const highlightFactor = highlighted * 0.3;

    ctx.save();
    const { x, y } = canvasCoordinate(avatar.loc.x, avatar.loc.y);
    const scale = avatarSize * _settings.viewport.width;
    ctx.translate(x, y);

    const colour = avatar.colour;
    if (avatar.dead) {
        ctx.globalAlpha = 0.25;
    }

    // Draw duck's body.
    drawCircle(ctx, 0, 0, scale, darkenHexColor(colour, -0.2 + highlightFactor), darkenHexColor(colour, 0.2 + highlightFactor));
    drawCircle(ctx, 0, 0, scale / 3, darkenHexColor(_settings.avatar.circleColor, highlightFactor));

    // Calculate values to draw avatar's head.
    // Convert avatar's facing angle into radians.
    const radians = Utils.math.degToRad(avatar.facing);
    // Avatar head's offset.
    const headRadialOffset = scale * 0.8;
    const headVerticalOffset = scale * 0.2;
    // Avatar head's global position.
    const hx = Math.cos(radians) * headRadialOffset;
    const hy = -Math.sin(radians) * headRadialOffset - headVerticalOffset;

    // If avatar is looking up,. draw duck bill first to draw it behind avatar's head.
    if (avatar.facing <= 180) {
        // Draw duck's bill.
        drawDuckBill(ctx, hx * 1.5, hy * 1.5, radians, scale);
    }
    // Draw duck's head.
    drawCircle(ctx, hx, hy, scale / 1.8, darkenHexColor(colour, -0.5 + highlightFactor), darkenHexColor(colour, -0.2 + highlightFactor));
    if (avatar.facing > 180) {
        // Draw duck's bill.
        drawDuckBill(ctx, hx * 1.5, hy * 1.5, radians, scale);
    }
    // Draw duck's eye.
    drawEye(ctx, hx, hy, radians, scale);
    ctx.restore();
}

function drawDuckBill(ctx, x, y, radians, scale) {
    // Adjust bill length based on facing angle.
    const angleFactor = (4 + Math.abs(Math.cos(radians))) / 5;
    const billLength = scale * 0.5 * angleFactor;
    const billRadius = scale * 0.3 * angleFactor;
    // Draw the bill.
    drawCylinder(ctx, x, y, -radians, billLength, billRadius);
}

function drawEye(ctx, headX, headY, radians, scale) {
    // Get the eye color from the settings.
    const innerColor = _settings.avatar.innerEyeColor;
    const outerColor = _settings.avatar.outerEyeColor;
    // Convert pond angle system into html canvas coordinate system.
    radians = Math.PI * 2 - radians;
    // Get the eye angle.
    const eyeOffset = scale * 0.45;
    const eyeLAngle = (radians + Math.PI * 0.4) % (Math.PI * 2);
    const eyeRAngle = (radians - Math.PI * 0.4) % (Math.PI * 2);
    if (eyeLAngle < Math.PI - 0.35) {
        const eyeL = {
            x: headX + eyeOffset * Math.cos(eyeLAngle),
            y: headY + eyeOffset * Math.sin(eyeLAngle) - scale / 8
        }
        const innerEyeL = {
            x: headX + eyeOffset * Math.cos(eyeLAngle + 0.1),
            y: headY + eyeOffset * Math.sin(eyeLAngle + 0.1) - scale / 8
        }
        // Draw an outer eye ellipse.
        ctx.beginPath();
        ctx.ellipse(eyeL.x, eyeL.y, scale / 8, scale / 6, 0, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = outerColor;
        ctx.fill();
        // Draw an inner one too.
        ctx.beginPath();
        ctx.ellipse(innerEyeL.x, innerEyeL.y, scale / 12, scale / 8, 0, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = innerColor;
        ctx.fill();
    }
    if (eyeRAngle < Math.PI - 0.35) {
        const eyeR = {
            x: headX + eyeOffset * Math.cos(eyeRAngle),
            y: headY + eyeOffset * Math.sin(eyeRAngle) - scale / 8
        }
        const innerEyeR = {
            x: headX + eyeOffset * Math.cos(eyeRAngle - 0.1),
            y: headY + eyeOffset * Math.sin(eyeRAngle - 0.1) - scale / 8
        }
        // Draw an outer eye ellipse.
        ctx.beginPath();
        ctx.ellipse(eyeR.x, eyeR.y, scale / 8, scale / 6, 0, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = outerColor;
        ctx.fill();
        // Draw an inner one too.
        ctx.beginPath();
        ctx.ellipse(innerEyeR.x, innerEyeR.y, scale / 12, scale / 8, 0, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = innerColor;
        ctx.fill();
    }
}

/** Draws a missile. */
function drawMissile(ctx, missile) {
    ctx.save();
    const progress = missile.progress / missile.range;
    const dx = (missile.endLoc.x - missile.startLoc.x) * progress;
    const dy = (missile.endLoc.y - missile.startLoc.y) * progress;
    // Calculate parabolic arc.
    const halfRange = missile.range / 2;
    // Change to set height of arc.
    const height = missile.range * 0.15;
    const xAxis = missile.progress - halfRange;
    const parabola = height - Math.pow(xAxis / Math.sqrt(height) * height / halfRange, 2);
    // Calculate the on-canvas coordinates.
    const missilePos = canvasCoordinate(missile.startLoc.x + dx, missile.startLoc.y + dy + parabola);
    const shadowPos = canvasCoordinate(0, missile.startLoc.y + dy);
    // Draw missile and its shadow.
    ctx.beginPath();
    ctx.arc(missilePos.x, shadowPos.y, Math.max(0, 1 - parabola / 10) * missileRadius * _settings.viewport.width, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fillStyle = 'rgba(128, 128, 128, ' + Math.max(0, 1 - parabola / 10) + ')';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(missilePos.x, missilePos.y, missileRadius * _settings.viewport.width, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fillStyle = getColour(missile.avatar);
    ctx.fill();
}

/** Draws a scan beam. */
function drawBeam(ctx, event, avatar) {
    const halfResolution = Math.max(event.resolution / 2, 0.5);
    const angle1 = -Utils.math.degToRad(event.degree + halfResolution);
    const angle2 = -Utils.math.degToRad(event.degree - halfResolution);
    // Begin drawing scan ray.
    ctx.beginPath();
    // Get the coordinates.
    const { x, y } = canvasCoordinate(avatar.loc.x, avatar.loc.y);
    const r = _settings.viewport.width * beamLength;
    ctx.lineTo(x + Math.cos(angle1) * r, y + Math.sin(angle1) * r);
    ctx.arc(x, y, r, angle1, angle2);
    ctx.lineTo(x, y);
    const gradient = ctx.createRadialGradient(x, y, avatarSize / 2, x, y, r);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fill();
}

/**
 * Draws a circle on the given canvas context.
 * @param {CanvasRenderingContext2D} ctx Canvas context to draw a circle.
 * @param {number} x Center x postion of the circle.
 * @param {number} y Center y postion of the circle.
 * @param {number} radius Radius of the circle.
 * @param {string} colour1 Fill colour. If colour2 is given, this will be used as colour 1.
 * @param {string} colour2 Colour 2 for gradient (optional).
 */
function drawCircle(ctx, x, y, radius, colour1, colour2 = null) {
    if (!colour2) colour2 = colour1;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.closePath();
    // Set the gradient.
    /** Center of the radial gradient. */
    const gc = {
        x: x - radius * 0.3,
        y: y - radius
    };
    const gradient = ctx.createRadialGradient(gc.x, gc.y, 0, gc.x, gc.y, radius * 1.5);
    gradient.addColorStop(0, colour1);
    gradient.addColorStop(1, colour2);
    ctx.fillStyle = gradient;
    ctx.fill();
}

/**
 * Draw a cylinder on the given canvas context.
 * @param {CanvasRenderingContext2D} ctx Canvas context to render a cylinder.
 * @param {number} startX Start x position to draw cylinder.
 * @param {number} startY Start y position to draw cylinder.
 * @param {number} angle An direction to extend the cylinder (in radians).
 * @param {number} length Length to extend the cylinder.
 * @param {number} radius The cylinder's radius.
 */
function drawCylinder(ctx, startX, startY, angle, length, radius) {
    ctx.beginPath();
    // Calculate the end position
    const endPos = {
        x: startX + length * Math.cos(angle),
        y: startY + length * Math.sin(angle)
    };

    // Draw the start ellipse
    ctx.ellipse(startX, startY, radius * 0.7, radius, angle, Math.PI / 2, -Math.PI / 2);

    // Draw the end ellipse
    ctx.ellipse(endPos.x, endPos.y, radius * 0.7, radius, angle, -Math.PI / 2, Math.PI / 2);

    // Connect the ellipses with lines
    const closePosStart = {
        x: startX + radius * Math.cos(angle - Math.PI / 2),
        y: startY + radius * Math.sin(angle - Math.PI / 2)
    };
    const closePosEnd = {
        x: endPos.x + radius * Math.cos(angle - Math.PI / 2),
        y: endPos.y + radius * Math.sin(angle - Math.PI / 2)
    };

    ctx.moveTo(closePosStart.x, closePosStart.y);
    ctx.lineTo(closePosEnd.x, closePosEnd.y);

    ctx.moveTo(closePosStart.x, closePosStart.y);
    ctx.lineTo(closePosStart.x - 10, closePosStart.y);  // Adding a small offset for a visual effect

    ctx.moveTo(closePosEnd.x, closePosEnd.y);
    ctx.lineTo(closePosEnd.x - 10, closePosEnd.y);  // Adding a small offset for a visual effect

    ctx.closePath();

    // Set a gradient for the cylinder
    const gradient = ctx.createLinearGradient(startX, startY, endPos.x, endPos.y);
    gradient.addColorStop(0, _settings.avatar.billColor1);
    gradient.addColorStop(1, _settings.avatar.billColor2);
    ctx.fillStyle = gradient;

    // Fill the cylinder
    ctx.fill();
}

/** Get the coordinate on the canvas from pond coordinate system (0-100). */
function canvasCoordinate(x, y) {
    return {
        x: x / _settings.viewport.width * viewport.width,
        y: (_settings.viewport.height - y) / _settings.viewport.height * viewport.height
    }
}

/** Get avatar's colour. */
function getColour(avatar) {
    return avatar.colour;
}

/**
 * Darkens a hexadecimal color by a given percentage.
 * @param {string} hexColor - The hexadecimal color code (e.g., "#FF5733").
 * @param {number} amount - The percentage to darken the color (0 to 1, where 0.1 means 10% darker).
 * @returns {string} The darkened hexadecimal color code.
 */
export function darkenHexColor(hexColor, amount = 0.1) {
    // Remove the "#" if present
    hexColor = hexColor.replace(/^#/, "");

    // Parse the hexadecimal color into RGB values
    const r = parseInt(hexColor.substring(0, 2), 16);
    const g = parseInt(hexColor.substring(2, 4), 16);
    const b = parseInt(hexColor.substring(4, 6), 16);

    // Darken each color component
    const darken = (value) => Math.max(0, Math.min(255, Math.floor(value * (1 - amount))));

    const newR = darken(r);
    const newG = darken(g);
    const newB = darken(b);

    // Convert the darkened RGB values back to a hexadecimal color string
    const toHex = (value) => value.toString(16).padStart(2, "0");
    return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
}
