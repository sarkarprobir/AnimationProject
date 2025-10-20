// Global variables
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const contextMenu = document.getElementById("contextMenu");
const canvasContainer = document.getElementById("canvasContainer");
let selectedInSpeed = null;
let selectedStaySpeed = null;
let selectedOutSpeed = null;
let scaleX = 1, scaleY = 1;
const dpr = window.devicePixelRatio || 1;
let animationMode = "delaylinear";
let selectedItems = [];
let nextGroupId = 1;
let textResizeStart = null;
let isDraggingGroup = false;
let groupDragStart = null;
let groupStarts = []; // { obj, x, y }[]
let resizeState = null;

let isRotating = false;
let rotatingObject = null;
let rotationStartAngle = 0;
let rotationStartValue = 0;

let canvasClipboard = {
    textItems: [],
    imageItems: []
};
let isDraggingMulti = false;
let multiDragStart = { x: 0, y: 0 };
let multiDragLast = { x: 0, y: 0 };
let multiDragTargets = [];
let multiDragOffsets = [];
const MULTI_DRAG_THRESHOLD = 2;
let multiDragDidMove = false;
let currentZIndex = 0;
function getNextZIndex() {
    return ++currentZIndex;
}
const __LINE_SVGS = new Set([
    'ico-shapes-line.svg',
]);
let layers = []; // global
//document.getElementById('alinear').classList.add('active_effect');
//const stream = canvas.captureStream(7); // Capture at 30 fps
//const recorder = new MediaRecorder(stream);
//const chunks = [];
//const deg2rad = d => (d || 0) * Math.PI / 180;
const HANDLE_SIZE = 8;
const HANDLE_HITAREA = 20;
let activeText,      // the text object under manipulation
    isDraggingText = false,
    isResizingText = false,
    activeTextHandle,
    dragOffsetText = { x: 0, y: 0 };
const fillInput = document.getElementById('favFillcolor');
const strokeInput = document.getElementById('favStrockcolor');

let scrollTop = 0;
let image = null;
let recordedChunks = [];
let text = $("#textInput").val();
let textPosition = { x: 100, y: 100, opacity: 100, content: text, }; // Default start position
let imagePosition = { x: 100, y: 20, scaleX: 1, scaleY: 1, opacity: 100, }; // Default start position

const FACTOR_INCREMENT = 0.1;

/////this is for add multiple text
const textEditor = document.getElementById("textEditor");
const addTextBtn = document.getElementById("addTextBtn");

// Settings for default text style
const fontSize = 35;
const fontFamily = "Arial Regular";
const textColor = "black";

// Default text style settings
const defaultFontSize = 35;
const defaultFontFamily = "Arial Regular";
const defaultTextColor = "black";
const RECT_HEIGHT_ADJUST = 15;
const RECT_WIDTH_ADJUST = 4;
let AfterDrag_ObjectSize = null;
// corner names must match your resize logic
const CORNER_NAMES = ["top-left", "top-right", "bottom-right", "bottom-left", "right-middle", "left-middle", "bottom-middle", "top-middle"];
// Array to hold our text objects
// Each text object will have: text, x, y, selected, editing
let textObjects = [];

// For dragging state
let currentDrag = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

// For dragging/resizing state.
let isDragging = false;
let isResizing = false;
let activeHandle = null;
let dragOffset = { x: 0, y: 0 };
let activeImageHandle = null;

// Configuration constants.
const padding = 5;         // Padding inside the bounding box
const handleSize = 10;     // Resize handle square size (in pixels)
const minWidth = 50;       // Minimum bounding width
const minHeight = 30;      // Minimum bounding height
const HANDLE_HIT_RADIUS = handleSize * 2;
/////////Image Section///////////////////
let images = []; // Array to store image objects
// Each image object: { img, src, x, y, width, height, scaleX, scaleY, selected }
// Default minimum size for resizing
const MIN_SIZE = 50;
// Resize handle size
let dragOffsetImage = { x: 0, y: 0 };
// For dragging/resizing state
let isDraggingImage = false;
let isResizingImage = false;
let activeImage = null;
window.__paintChangeRequested = false;  // only true when user changed a picker/checkbox

let scrollSelectionMode = false;
let scrollStartY = 0;
let lastScrollY = 0;
let selectableObjects = [];
let scrollIndex = -1;
let isDraggingToSelect = false;
let dragStartY = 0;
let dragCurrentY = 0;
let isDraggingSelectionBox = false;
let selectionStart = { x: 0, y: 0 };
let selectionEnd = { x: 0, y: 0 };
let skipNextClick = false;
window.__marqueeCommittedAt = 0;          // timestamp of last marquee commit
let isClickSingle = false;
// ─── Marquee selection state ────────────────────────────────────────────────
let isMarquee = false;
let marqueeStart = { x: 0, y: 0 };   // in canvas/design space
let marqueeNow = { x: 0, y: 0 };   // in canvas/design space
const MARQUEE_MIN_DRAG = 4;          // px threshold to switch from click → box
// Globals you likely already have:
globalThis.ItemsSelected ??= []; // keep your existing structure


////This is for delete text///////////////////
// Utility: Returns an object (text or image) if the (x,y) falls within its bounding box."
function __isLINESvg(name) {

    try {
        if (__LINE_SVGS.has(name)) return true;
    }
    catch { false }
    return __LINE_SVGS.has(name);
}
function wrapText(ctx, text, maxWidth) {
    if (ctx.measureText(text).width <= maxWidth) {
        return [text];
    }

    // fallback to character wrapping
    const lines = [];
    let currentLine = "";

    for (let char of text) {
        const testLine = currentLine + char;
        const testWidth = ctx.measureText(testLine).width;
        if (testWidth < maxWidth) {
            currentLine = testLine;
        } else {
            if (currentLine) lines.push(currentLine);
            currentLine = char;
        }
    }

    if (currentLine) lines.push(currentLine);
    return lines;
}
// helper: hit­test a point against all your shapes
function hitTest(mx, my, items = getAllItems()) {
    // Prefer topmost hit. If you track z-order, iterate from topmost → bottom.
    for (let i = items.length - 1; i >= 0; i--) {
        const o = items[i];
        if (
            mx >= o.x && mx <= o.x + o.width &&
            my >= o.y && my <= o.y + o.height
        ) return o;
    }
    return null;
}
function getMousePos(canvas, evt) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}
function getObjectAtcontextmenu(x, y) {
    // Check text objects.
    for (let obj of textObjects) {
        if (
            x >= obj.x - padding &&
            x <= obj.x - padding + obj.boundingWidth + 2 * padding &&
            y >= obj.y - padding &&
            y <= obj.y - padding + obj.boundingHeight + 2 * padding
        ) {
            return { type: "text", obj: obj };
        }
    }

    // Check image objects (from the images array)
    if (images && images.length) {
        // Loop from top-most (last in array) to bottom.
        for (let i = images.length - 1; i >= 0; i--) {
            let imgObj = images[i];
            // Calculate the displayed width and height dynamically.
            const dispWidth = imgObj.width * (imgObj.scaleX || 1);
            const dispHeight = imgObj.height * (imgObj.scaleY || 1);
            if (
                x >= imgObj.x &&
                x <= imgObj.x + dispWidth &&
                y >= imgObj.y &&
                y <= imgObj.y + dispHeight
            ) {
                return { type: "image", obj: imgObj };
            }
        }
    }

    return null;
}

// Returns the text object (or image) if the (x,y) falls inside its bounding box.
// For text objects, we use the stored bounding box properties. KD ignore
function getObjectAt(x, y) {
    for (let obj of textObjects) {
        // Bounding box (including padding): top-left at (obj.x - padding, obj.y - padding)
        // and dimensions: (obj.boundingWidth + 2*padding, obj.boundingHeight + 2*padding)
        if (
            x >= obj.x - padding &&
            x <= obj.x - padding + obj.boundingWidth + 2 * padding &&
            y >= obj.y - padding &&
            y <= obj.y - padding + obj.boundingHeight + 2 * padding
        ) {
            return { type: "text", obj: obj };
        }
    }
    if (image) {
        if (x >= image.x && y >= image.y) {
            return { type: "image", obj: image };
        }
    }
    return null;
}
// Returns which resize handle (if any) is under the given mouse position.
// Handles are drawn at the corners of the bounding box (including padding).
//function getHandleUnderMouse(mouseX, mouseY, obj) {
//    // Calculate the outer bounding box including padding.
//    const boxX = obj.x - padding;
//    const boxY = obj.y - padding;
//    const boxWidth = obj.boundingWidth + 2 * padding;
//    const boxHeight = obj.boundingHeight + 2 * padding;

//    // Define eight handles: four corners and four midpoints.
//    const handles = {
//        "top-left": { x: boxX, y: boxY },
//        "top-middle": { x: boxX + boxWidth / 2, y: boxY },
//        "top-right": { x: boxX + boxWidth, y: boxY },
//        "right-middle": { x: boxX + boxWidth, y: boxY + boxHeight / 2 },
//        "bottom-right": { x: boxX + boxWidth, y: boxY + boxHeight },
//        "bottom-middle": { x: boxX + boxWidth / 2, y: boxY + boxHeight },
//        "bottom-left": { x: boxX, y: boxY + boxHeight },
//        "left-middle": { x: boxX, y: boxY + boxHeight / 2 }
//    };

//    for (let key in handles) {
//        const hx = handles[key].x;
//        const hy = handles[key].y;
//        if (Math.abs(mouseX - hx) <= handleSize && Math.abs(mouseY - hy) <= handleSize) {
//            return key;
//        }
//    }
//    return null;
//}
// Enhanced handle detection for text with tolerance
function getHandleUnderMouse(x, y, obj) {
    const tol = 15;  // same cornerTolerance
    const center = {
        x: obj.x + obj.boundingWidth / 2,
        y: obj.y + obj.boundingHeight / 2
    };
    // Transform into unrotated box space
    const pt = rotatePoint(x, y, center.x, center.y, -obj.rotation);
    const x0 = obj.x, y0 = obj.y;
    const x1 = x0 + obj.boundingWidth, y1 = y0 + obj.boundingHeight;

    // Corners
    if (Math.hypot(pt.x - x0, pt.y - y0) < tol) return 'top-left';
    if (Math.hypot(pt.x - x1, pt.y - y0) < tol) return 'top-right';
    if (Math.hypot(pt.x - x0, pt.y - y1) < tol) return 'bottom-left';
    if (Math.hypot(pt.x - x1, pt.y - y1) < tol) return 'bottom-right';

    // (optional) Middle edges if you want
    if (Math.abs(pt.x - x0) < tol && pt.y > y0 + tol && pt.y < y1 - tol) return 'left-middle';
    if (Math.abs(pt.x - x1) < tol && pt.y > y0 + tol && pt.y < y1 - tol) return 'right-middle';
    if (Math.abs(pt.y - y0) < tol && pt.x > x0 + tol && pt.x < x1 - tol) return 'top-middle';
    if (Math.abs(pt.y - y1) < tol && pt.x > x0 + tol && pt.x < x1 - tol) return 'bottom-middle';

    return null;
}

//function getHandleUnderMouse(x, y, obj) {
//    const boxX = obj.x - padding;
//    const boxY = obj.y - padding;
//    const boxW = obj.boundingWidth + 2 * padding;
//    const boxH = obj.boundingHeight + 2 * padding;

//    const points = {
//        "top-left": { cx: boxX, cy: boxY },
//        "top-middle": { cx: boxX + boxW / 2, cy: boxY },
//        "top-right": { cx: boxX + boxW, cy: boxY },
//        "right-middle": { cx: boxX + boxW, cy: boxY + boxH / 2 },
//        "bottom-right": { cx: boxX + boxW, cy: boxY + boxH },
//        "bottom-middle": { cx: boxX + boxW / 2, cy: boxY + boxH },
//        "bottom-left": { cx: boxX, cy: boxY + boxH },
//        "left-middle": { cx: boxX, cy: boxY + boxH / 2 }
//    };

//    for (let key in points) {
//        const dx = x - points[key].cx;
//        const dy = y - points[key].cy;
//        if (dx * dx + dy * dy <= HANDLE_HIT_RADIUS * HANDLE_HIT_RADIUS) {
//            return key;
//        }
//    }
//    return null;
//}
// same radius you’re using for hit-testing
//const HANDLE_HIT_RADIUS = (handleSize || 5) * 3;

/**
 * Return an array of {x,y} points for the eight text handles.
 */
function getTextResizeHandles(obj) {
    const boxX = obj.x - padding;
    const boxY = obj.y - padding;
    const boxW = obj.boundingWidth + 2 * padding - RECT_WIDTH_ADJUST;
    const boxH = obj.boundingHeight + 2 * padding - RECT_HEIGHT_ADJUST;

    return [
        { x: boxX, y: boxY }, // top‐left
        //{ x: boxX + boxW / 2, y: boxY }, // top‐middle
        { x: boxX + boxW, y: boxY }, // top‐right
        //{ x: boxX + boxW, y: boxY + boxH / 2 }, // right‐middle
        { x: boxX + boxW, y: boxY + boxH }, // bottom‐right
        // { x: boxX + boxW / 2, y: boxY + boxH }, // bottom‐middle
        { x: boxX, y: boxY + boxH }, // bottom‐left
        // { x: boxX, y: boxY + boxH / 2 }  // left‐middle
    ];
}

let selectedForContextMenu = null;
let selectedType = null; // "text" or "image"



// Show dynamic context menu on right-click.



canvas.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Use the same coord helper you use everywhere else
    const { x, y } = getCanvasMousePosition(e);

    // Always resolve with the same topmost helper
    const hit = getTopHitAt(x, y);
    contextTarget = hit;
    selectedForContextMenu = hit; // <-- keep legacy readers happy
    selectedType = hit ? (isImageItem(hit) ? 'image' : 'text') : null; // if you still use it

    // Show/hide items
    const items = contextMenu.querySelectorAll(".context-options");
    items.forEach(li => li.style.display = hit ? "block" : (li.id === "pasteOption" ? "block" : "none"));

    // Position menu
    const adjustX = -280, adjustY = -30;
    contextMenu.style.left = (e.clientX + adjustX) + "px";
    contextMenu.style.top = (e.clientY + adjustY) + "px";
    contextMenu.style.display = "block";

    // Visually select what we right-clicked (optional, but recommended)
    if (hit) {
        (textObjects || []).forEach(o => o.selected = (o === hit));
        (images || []).forEach(o => o.selected = (o === hit));
        activeBox = hit;
        if (hit.type === "image" || hit.img) { activeImage = hit; activeText = null; }
        else { activeText = hit; activeImage = null; }

        // (Optional) sync any UI like rotation/opacity if your mousedown does it
        // updateRotationUI(hit); updateOpacityUI(hit);
    } else {
        activeBox = null;
        activeText = activeImage = null;
    }

    drawText();
    skipNextClick = true; // prevent the next click from clearing selection
});



// Hide the context menu when clicking elsewhere.
document.addEventListener("click", function (e) {
    contextMenu.style.display = "none";
});


// When the Delete option is clicked, remove the selected object.
//document.getElementById("deleteOption").addEventListener("click", function (e) {
//    if (selectedForContextMenu) {
//        if (selectedType === "text") {
//            textObjects = textObjects.filter(obj => obj !== selectedForContextMenu);
//        } else if (selectedType === "image") {
//            // Remove from images array
//            images = images.filter(imgObj => imgObj !== selectedForContextMenu);
//        }
//        drawCanvas('Common');
//        selectedForContextMenu = null;
//        contextMenu.style.display = "none";
//    }
//});
function isImageItem(obj) {
    return !!obj && (obj.type === 'image' || obj.img === true || obj.isSVG === true);
}

document.getElementById("deleteOption").addEventListener("click", function (e) {
    e.preventDefault(); e.stopPropagation();

    const target = contextTarget || selectedForContextMenu || activeBox;
    if (!target) return;

    const arr = isImageItem(target) ? (images || []) : (textObjects || []);
    const idx = arr.indexOf(target);
    if (idx > -1) arr.splice(idx, 1);

    // clear state
    if (activeBox === target) activeBox = null;
    if (activeText === target) activeText = null;
    if (activeImage === target) activeImage = null;
    target.selected = false;

    selectedForContextMenu = null;
    contextTarget = null;
    selectedType = null;

    contextMenu.style.display = "none";
    drawText();
});


window.addEventListener("keydown", function (e) {
    const active = document.activeElement;
    // if focus is in any input/textarea or a contenteditable element, skip our canvas‐delete logic
    if (
        active.tagName === "INPUT" ||
        active.tagName === "TEXTAREA" ||
        active.isContentEditable
    ) {
        return; // allow native delete/backspace
    }
    if (e.key === "Escape" && isDraggingMulti) endMultiDrag(false);
    const isDelete =
        e.key === "Delete" ||      // Windows “Delete”
        e.key === "Backspace";     // Mac “Backspace”

    if (!isDelete) return;
    e.preventDefault();         // stop browser navigating back on Backspace

    // Remove *all* selected text objects
    if (textObjects.some(o => o.selected)) {
        textObjects = textObjects.filter(o => !o.selected);
    }
    // Remove *all* selected images
    if (images.some(i => i.selected)) {
        images = images.filter(i => !i.selected);
    }
    // (…other types…)

    // Clear context‐menu state
    selectedForContextMenu = null;
    selectedType = null;
    contextMenu.style.display = "none";

    // Redraw canvas
    // drawCanvas("Common");
    drawText();
});



////END   This is for delete text///////////////////
// Draw Canvas Elements
//function drawRoundedRect(ctx, x, y, width, height, radius) {
//    ctx.save();
//    ctx.beginPath();
//    ctx.moveTo(x + radius, y);
//    ctx.lineTo(x + width - radius, y);
//    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
//    ctx.lineTo(x + width, y + height - radius);
//    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
//    ctx.lineTo(x + radius, y + height);
//    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
//    ctx.lineTo(x, y + radius);
//    ctx.quadraticCurveTo(x, y, x + radius, y);
//    ctx.closePath();

//    const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
//    gradient.addColorStop(0, "#FF7F50");  // Coral
//    gradient.addColorStop(1, "#FFD700");  // Gold

//    ctx.strokeStyle = gradient;
//    ctx.lineWidth = 3;
//    ctx.setLineDash([]);
//    ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
//    ctx.shadowBlur = 10;
//    ctx.shadowOffsetX = 4;
//    ctx.shadowOffsetY = 4;

//    ctx.stroke();
//    ctx.restore();
//}
function drawRoundedRect(ctx, x, y, width, height, radius) {
    // ——— 1) coerce to numbers ———
    x = Number(x);
    y = Number(y);
    width = Number(width);
    height = Number(height);
    radius = Number(radius);

    // ——— 2) bail if any value is NaN/Infinity or the box has no area ———
    if (![x, y, width, height].every(Number.isFinite) || width <= 0 || height <= 0) {
        return;
    }

    // ——— 3) clamp radius so it never exceeds half the rect’s size ———
    radius = Math.max(0, Math.min(radius, width / 2, height / 2));

    ctx.save();
    ctx.beginPath();

    // ——— 4) draw the rounded rectangle path ———
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();

    // ——— 5) build a finite gradient ———
    const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
    gradient.addColorStop(0, "#FF7F50");
    gradient.addColorStop(1, "#FFD700");

    // ——— 6) stroke it ———
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
    ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 4;
    ctx.stroke();

    ctx.restore();
}





function getLinesFor(obj) {
    ctx.font = `${obj.fontSize}px ${obj.fontFamily}`;
    const maxW = obj.boundingWidth - 2 * padding;

    if (obj.boundingWidth < obj.fontSize) {
        return obj.text.split('');
    }
    if (obj.text.includes('\n')) {
        return obj.text.split('\n');
    }
    return wrapText(ctx, obj.text, maxW);
}


// 2) Adjust line spacing for the *selected* text object
//function changeLineSpacing(deltaPx) {

//    const obj = textObjects.find(o => o.selected);
//    if (!obj) return;

//    // bump the factor, but don’t let it go below, say, 1.0 (100%)
//    obj.lineSpacing = Math.max(.20, obj.lineSpacing + deltaPx);

//    drawCanvas('Common');
//}
function changeLineSpacingOLD(deltaFactor) {
    const obj = textObjects.find(o => o.selected);
    if (!obj) return;

    // 1) Update spacing factor (allow down to 0.2× for overlap)
    if (deltaFactor < 0) {
        obj.lineSpacing = Math.max(0.2, obj.lineSpacing + deltaFactor);
    } else {
        obj.lineSpacing = obj.lineSpacing + deltaFactor;
    }

    drawCanvas('Common');
}

function changeLineSpacing(deltaFactor) {
    const obj = textObjects.find(o => o.selected);
    if (!obj) return;

    // clamp and update model
    const current = typeof obj.lineSpacing === "number" ? obj.lineSpacing : 1.2;
    const next = Math.max(0.2, current + deltaFactor); // clamp lower bound
    obj.lineSpacing = next;

    // keep canvas box in sync
    if (activeBox) activeBox.lineSpacing = next;

    if (isEditing && textEditorNew) {
        // preserve selection while we tweak DOM
        textEditorNew.focus();
        restoreSelection();
        const bm = bookmarkSelection(textEditorNew); // ← invisible markers

        // apply unitless line-height multiplier to line DIVs (or editor root)
        applyLineSpacingInEditor(textEditorNew, next);

        // restore selection
        restoreSelectionFromBookmarks(textEditorNew, bm);

        // sync editor → model → canvas
        activeBox.text = textEditorNew.innerHTML;
        if (obj) obj.text = activeBox.text;

    }

    // redraw
    drawText();
    console.log(textObjects);
}

// Apply line spacing in place without nuking selection/HTML
function applyLineSpacingInEditor(root, multiplier) {
    const value = String(multiplier); // unitless
    const topDivs = Array.from(root.childNodes).filter(
        n => n.nodeType === 1 && n.tagName === "DIV"
    );
    if (topDivs.length) {
        topDivs.forEach(div => { div.style.lineHeight = value; });
    } else {
        root.style.lineHeight = value;
    }
}



function drawImageOnCanvas(img) {
    ctx.save();
    ctx.globalAlpha = img.opacity ?? 100;
    ctx.translate(img.x, img.y);
    ctx.scale(img.scaleX ?? 1, img.scaleY ?? 1);
    ctx.drawImage(img.img, 0, 0, img.width, img.height);
    ctx.restore();
}
//let allItems = [...images, ...textObjects];
//allItems.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
//reindex();

function initializeLayers() {
    allItems = [...images, ...textObjects];
    allItems.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
    reindex();
}
function invertDirection(direction) {
    if (direction === "left") return "right";
    if (direction === "right") return "left";
    if (direction === "top") return "bottom";
    if (direction === "bottom") return "top";
    return direction;
}
function drawCanvas(condition) {
    initializeLayers();
    resizeCanvas();
    const dpr = window.devicePixelRatio || 1;

    const designW = canvas.width / dpr / scaleX;
    const designH = canvas.height / dpr / scaleY;

    ctx.clearRect(0, 0, designW, designH);
    const bgColor = document.getElementById('hdnBackgroundSpecificColor').value.trim();

    if (bgColor) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, designW, designH);
    }

    if (canvas._bgImg) {
        ctx.drawImage(canvas._bgImg, 0, 0, designW, designH);
    }

    // ── 1) MARQUEE SELECTION LOGIC ─────────────────────────────────────
    if (isDraggingSelectionBox) {
        const x1 = Math.min(selectionStart.x, selectionEnd.x);
        const y1 = Math.min(selectionStart.y, selectionEnd.y);
        const x2 = Math.max(selectionStart.x, selectionEnd.x);
        const y2 = Math.max(selectionStart.y, selectionEnd.y);

        // clear prior selections
        textObjects.forEach(o => o.selected = false);
        images.forEach(i => i.selected = false);

        // select texts
        textObjects.forEach(o => {
            if (o.x < x2 && o.x + o.boundingWidth > x1
                && o.y < y2 && o.y + o.boundingHeight > y1) {
                o.selected = true;
            }
        });
        // select images
        images.forEach(i => {
            const w = i.width * (i.scaleX || 1),
                h = i.height * (i.scaleY || 1);
            if (i.x < x2 && i.x + w > x1
                && i.y < y2 && i.y + h > y1) {
                i.selected = true;
            }
        });
    }

    allItems.forEach(item => {
        ctx.save();

        if (item.clip >= 1) {
            ctx.restore();
            return;
        }

        if (item.clip > 0 && item.clip < 1) {
            const originalDir = item.clipDirection || "top";

            // If clip is increasing (masking), invert direction automatically
            const isHiding = item.clip > item.previousClip;
            const effectiveDirection = isHiding ? invertDirection(originalDir) : originalDir;

            item.previousClip = item.clip;   // Track for next render frame

            const isImage = item.type === 'image';
            const width = isImage ? item.width : item.boundingWidth;
            const height = isImage ? item.height : item.boundingHeight;
            const x = item.x;
            const y = item.y;

            ctx.beginPath();

            if (effectiveDirection === "top") {
                const visibleHeight = height * (1 - item.clip);
                ctx.rect(x, y, width, visibleHeight);

            } else if (effectiveDirection === "bottom") {
                const visibleHeight = height * (1 - item.clip);
                ctx.rect(x, y + height - visibleHeight, width, visibleHeight);

            } else if (effectiveDirection === "left") {
                const visibleWidth = width * (1 - item.clip);
                ctx.rect(x, y, visibleWidth, height);

            } else if (effectiveDirection === "right") {
                const visibleWidth = width * (1 - item.clip);
                ctx.rect(x + width - visibleWidth, y, visibleWidth, height);
            }

            ctx.clip();
        }





        ctx.globalAlpha = item.opacity || 100;

        if (item.type === 'image') {
            const scaleX_ = item.scaleX || 1;
            const scaleY_ = item.scaleY || 1;
            const w = item.width * scaleX_;
            const h = item.height * scaleY_;
            const rot = (item.rotation || 0) * Math.PI / 180;

            if (!item.img) {
                const img = new Image();
                img.onload = () => {
                    item.img = img;
                    drawCanvas(condition);
                };
                img.src = item.svgData || item.src;
                ctx.restore();
                return;
            }

            ctx.translate(item.x + w / 2, item.y + h / 2);
            ctx.rotate(rot);
            ctx.scale(scaleX_, scaleY_);

            try {
                ctx.drawImage(item.img, -item.width / 2, -item.height / 2, item.width, item.height);
            } catch (e) { }

            ctx.restore();
            if (item.selected) drawRotateHandle(item);
        }

        else if (item.type === 'text' && ['Common', 'ChangeStyle', 'applyAnimations'].includes(condition)) {
            let styleParts = [];
            if (item.isItalic) styleParts.push("italic");
            if (item.isBold) styleParts.push("bold");
            styleParts.push(`${item.fontSize}px`);
            styleParts.push(item.fontFamily);
            ctx.font = styleParts.join(" ");
            ctx.fillStyle = item.textColor;
            ctx.textBaseline = "top";

            const pad = padding;
            const maxW = item.boundingWidth - 2 * pad;
            const rot = (item.rotation || 0) * Math.PI / 180;
            const scaleX = item.scaleX || 1;
            const scaleY = item.scaleY || 1;


            const lines = item.text.includes('\n')
                ? item.text.split('\n')
                : wrapText(ctx, item.text, maxW);

            const lineH = item.lineSpacing * item.fontSize;
            if (lines.length > 1) {
                item.boundingHeight = lines.length * lineH + 2 * pad;
            }
            const maxLines = Math.floor((item.boundingHeight - 2 * pad) / lineH);

            ctx.translate(item.x + item.boundingWidth / 2, item.y + item.boundingHeight / 2);
            ctx.rotate(rot);
            ctx.scale(scaleX, scaleY);  //  Apply scaling here

            lines.slice(0, maxLines).forEach((line, i) => {
                const lw = ctx.measureText(line).width;
                let ox = -item.boundingWidth / 2 + pad;
                if (item.textAlign === 'center') ox = -lw / 2;
                else if (item.textAlign === 'right') ox = item.boundingWidth / 2 - lw - pad;
                const oy = -item.boundingHeight / 2 + pad + i * lineH;
                ctx.fillText(line, ox, oy);
            });

            ctx.restore();
            if (item.selected) drawRotateHandle(item);
        }

        ctx.restore();
    });






    // === Selection Overlays ===
    function toPixelSpace(fn) {
        ctx.save();
        ctx.resetTransform();
        ctx.scale(dpr, dpr);
        fn();
        ctx.restore();
    }

    // Image Selection
    toPixelSpace(() => {
        images.forEach(imgObj => {
            if (!imgObj.selected || !imgObj.img) return;

            const scaleXImg = imgObj.scaleX || 1;
            const scaleYImg = imgObj.scaleY || 1;
            const wPx = imgObj.width * scaleXImg * scaleX;
            const hPx = imgObj.height * scaleYImg * scaleY;

            const xPx = (imgObj.x + imgObj.width * scaleXImg / 2) * scaleX;
            const yPx = (imgObj.y + imgObj.height * scaleYImg / 2) * scaleY;
            const rotation = (imgObj.rotation || 0) * Math.PI / 180;

            ctx.save();
            ctx.translate(xPx, yPx); // move to center of image
            ctx.rotate(rotation);    // rotate canvas
            ctx.strokeStyle = "blue";
            ctx.lineWidth = 2;
            ctx.strokeRect(-wPx / 2, -hPx / 2, wPx, hPx); // draw rect centered

            // Draw resize handles
            ctx.fillStyle = "red";
            const halfH = handleSize / 2;
            const corners = [
                { x: -wPx / 2, y: -hPx / 2 },
                { x: wPx / 2, y: -hPx / 2 },
                { x: -wPx / 2, y: hPx / 2 },
                { x: wPx / 2, y: hPx / 2 },
            ];
            corners.forEach(pt => {
                ctx.fillRect(pt.x - halfH, pt.y - halfH, handleSize, handleSize);
            });

            ctx.restore();
        });
    });


    toPixelSpace(() => {
        textObjects.forEach(obj => {
            if (!obj.selected || obj.type !== 'text') return;

            // Compute on‐screen coordinates
            const xPx = obj.x * scaleX;
            const yPx = obj.y * scaleY;
            const wPx = obj.boundingWidth * scaleX;
            const hPx = obj.boundingHeight * scaleY;
            const rot = (obj.rotation || 0) * Math.PI / 180;

            ctx.save();
            ctx.translate(xPx + wPx / 2, yPx + hPx / 2);
            ctx.rotate(rot);

            // 1) Draw square‐corner rectangle
            ctx.strokeStyle = "#00AEEF";  // your desired outline color
            ctx.lineWidth = 2;          // thickness
            ctx.setLineDash([]);          // solid line
            ctx.strokeRect(
                -wPx / 2 - padding * scaleX,
                -hPx / 2 - padding * scaleY,
                wPx + 2 * padding * scaleX - RECT_WIDTH_ADJUST * scaleX,
                hPx + 2 * padding * scaleY - RECT_HEIGHT_ADJUST * scaleY
            );

            // 2) Draw big corner handles
            const handleSize = 16 * scaleX;  // increase from your previous value
            const half = handleSize / 2;

            // corners: TL, TR, BR, BL
            const pts = [
                { x: -wPx / 2 - padding * scaleX, y: -hPx / 2 - padding * scaleY },
                { x: wPx / 2 + padding * scaleX - handleSize, y: -hPx / 2 - padding * scaleY },
                { x: wPx / 2 + padding * scaleX - handleSize, y: hPx / 2 + padding * scaleY - handleSize },
                { x: -wPx / 2 - padding * scaleX, y: hPx / 2 + padding * scaleY - handleSize }
            ];

            ctx.fillStyle = "#FFF";    // handle fill color
            ctx.strokeStyle = "#00AEEF"; // handle border color
            ctx.lineWidth = 2;

            pts.forEach(pt => {
                ctx.beginPath();
                ctx.rect(pt.x, pt.y, handleSize, handleSize);
                ctx.fill();
                ctx.stroke();
            });

            ctx.restore();
        });
    });


    // ── 4) DRAW DRAG BOX OUTLINE ──────────────────────────────────────
    if (isDraggingSelectionBox) {
        ctx.save();
        ctx.setLineDash([6, 4]);
        ctx.strokeStyle = "#007BFF";
        ctx.lineWidth = 1;
        const x = Math.min(selectionStart.x, selectionEnd.x),
            y = Math.min(selectionStart.y, selectionEnd.y),
            w = Math.abs(selectionEnd.x - selectionStart.x),
            h = Math.abs(selectionEnd.y - selectionStart.y);
        ctx.strokeRect(x, y, w, h);
        ctx.restore();
    }


    ctx.globalAlpha = 1;
}




// ──────────────────────────────────────────────────────────────────────
// 2) DRAW: convert those % back into pixels on every render
// ──────────────────────────────────────────────────────────────────────
//function drawCanvas(condition) {
//    // make sure our resizeCanvas() (with its global ctx.scale) has run
//    resizeCanvas();
//    const dpr = window.devicePixelRatio || 1;
//    // compute CSS‑pixel drawing area
//    const screenW = canvas.width / dpr;
//    const screenH = canvas.height / dpr;

//    // 1) clear + background
//    ctx.clearRect(0, 0, screenW, screenH);
//    const bgColor = $("#hdnBackgroundSpecificColor").val().trim();
//    if (bgColor) {
//        ctx.fillStyle = bgColor;
//        ctx.fillRect(0, 0, screenW, screenH);
//    }
//    if (canvas.bgImage) {
//        ctx.drawImage(canvas.bgImage, 0, 0, screenW, screenH);
//    }

//    // 2) draw images
//    images.forEach(imgObj => {
//        // recalc pixel values
//        const x = imgObj.xPct * screenW;
//        const y = imgObj.yPct * screenH;
//        const w = imgObj.widthPct * screenW;
//        const h = imgObj.heightPct * screenH;

//        ctx.save();
//        ctx.globalAlpha = imgObj.opacity || 1;
//        ctx.drawImage(imgObj.img, x, y, w, h);
//        ctx.restore();

//        // selected outline + handles
//        if (imgObj.selected) {
//            ctx.save();
//            ctx.strokeStyle = "blue";
//            ctx.lineWidth = 2;
//            ctx.strokeRect(x, y, w, h);

//            const handles = getImageResizeHandles(imgObj);
//            ctx.fillStyle = "red";
//            handles.forEach(pt => {
//                ctx.fillRect(pt.x - handleSize / 2, pt.y - handleSize / 2,
//                    handleSize, handleSize);
//            });
//            ctx.restore();
//        }
//    });

//    // 3) draw text (common & change‑style)
//    if (condition === 'Common' || condition === 'ChangeStyle') {
//        textObjects.forEach(obj => {
//            // recalc pixel and box dims
//            const x = obj.xPct * screenW;
//            const y = obj.yPct * screenH;
//            const boxW = obj.widthPct * screenW;
//            const boxH = obj.heightPct * screenH;

//            ctx.save();

//            // selection box + handles
//            if (obj.selected) {
//                drawRoundedRect(ctx, x - padding, y - padding,
//                    boxW + 2 * padding, boxH + 2 * padding, 5);
//                const handles = getTextResizeHandles(obj);
//                ctx.fillStyle = "#FF7F50";
//                handles.forEach(pt => {
//                    ctx.fillRect(pt.x - 4, pt.y - 4, 8, 8);
//                });
//            }

//            // text styling
//            ctx.font = `${obj.fontSize}px ${obj.fontFamily}`;
//            ctx.fillStyle = obj.textColor;
//            ctx.textBaseline = "top";
//            ctx.globalAlpha = obj.opacity || 1;

//            // wrapping
//            const maxW = boxW - 2 * padding;
//            const lines = obj.text.includes("\n")
//                ? obj.text.split("\n")
//                : wrapText(ctx, obj.text, maxW);
//            const lineH = obj.fontSize * 1.2;
//            const maxLines = Math.floor((boxH - 2 * padding) / lineH);
//            const startY = y + padding;

//            lines.slice(0, maxLines).forEach((line, i) => {
//                const lw = ctx.measureText(line).width;
//                let tx = x + padding;
//                if (obj.textAlign === "center") tx = x + (boxW - lw) / 2;
//                if (obj.textAlign === "right") tx = x + boxW - lw - padding;
//                ctx.fillText(line, tx, startY + i * lineH);
//            });

//            ctx.restore();
//        });
//    }

//        if (condition === 'applyAnimations') {
//            textObjects.forEach(obj => {
//                ctx.save();
//                ctx.font = `${obj.fontSize}px ${obj.fontFamily}`;
//                ctx.fillStyle = obj.textColor;
//                ctx.textBaseline = "top";

//                const maxTextWidth = obj.boundingWidth - 2 * padding;
//                let lines;
//                if (obj.text.indexOf("\n") !== -1) {
//                    lines = obj.text.split("\n");
//                } else {
//                    lines = wrapText(ctx, obj.text, maxTextWidth);
//                }
//                const lineHeight = obj.fontSize * 1.2;
//                const availableHeight = obj.boundingHeight - 2 * padding;
//                const maxLines = Math.floor(availableHeight / lineHeight);
//                const startY = obj.y + padding;

//                for (let i = 0; i < Math.min(lines.length, maxLines); i++) {
//                    const line = lines[i];
//                    const lineWidth = ctx.measureText(line).width;
//                    let offsetX;
//                    if (obj.textAlign === "center") {
//                        offsetX = obj.x + (obj.boundingWidth - lineWidth) / 2;
//                    } else if (obj.textAlign === "right") {
//                        offsetX = obj.x + obj.boundingWidth - lineWidth - padding;
//                    } else {
//                        offsetX = obj.x + padding;
//                    }
//                    ctx.fillText(line, offsetX, startY + i * lineHeight);
//                }
//                ctx.restore();
//            });
//        }
//    ctx.globalAlpha = 1;  // reset

//    // … inside drawCanvas, after you finish drawing text/images …

//    // helper to run code in pure pixel space
//    function toPixelSpace(fn) {
//        ctx.save();
//        ctx.resetTransform();     // drop design-scale & translate
//        ctx.scale(dpr, dpr);      // only HiDPI
//        fn();
//        ctx.restore();
//    }
//    textObjects.forEach(obj => {
//        if (!obj.selected) return;

//        // 1) compute CSS‑pixel coords & dims
//        //    obj.x / obj.boundingWidth are in your DESIGN units
//        const xPx = obj.x * scaleX;
//        const yPx = obj.y * scaleY;
//        const wPx = obj.boundingWidth * scaleX;
//        const hPx = obj.boundingHeight * scaleY;

//        // 2) draw the rounded rect in pixel space
//        toPixelSpace(() => {
//            drawRoundedRect(
//                ctx,
//                xPx - padding * scaleX,                // pad outwards
//                yPx - padding * scaleY,
//                wPx + 2 * padding * scaleX - RECT_WIDTH_ADJUST * scaleX,
//                hPx + 2 * padding * scaleY - RECT_HEIGHT_ADJUST * scaleY,
//                5 * scaleX                           // radius in CSS‑px
//            );
//        });

//        // 3) draw the corner‑handles in pixel space
//        toPixelSpace(() => {
//            ctx.fillStyle = "#FF7F50";
//            const handleSizePx = 8;
//            // if your getTextResizeHandles returns design coords, scale them:
//            const handles = getTextResizeHandles(obj)
//                .map(pt => ({ x: pt.x * scaleX, y: pt.y * scaleY }));
//            handles.forEach(pt => {
//                ctx.fillRect(
//                    pt.x - handleSizePx / 2,
//                    pt.y - handleSizePx / 2,
//                    handleSizePx,
//                    handleSizePx
//                );
//            });
//        });
//    });
//}





//// Text Input Handler
//document.getElementById("textInput").addEventListener("input", (e) => {

//    text = e.target.value || "Hello, SBOED!";
//    drawCanvas();
//});
function ChangeStyle() {
    const fontSize = parseInt(document.getElementById("fontSize").value, 10); // Get new font size (as a number)
    const Obj = textObjects.find(obj => obj.selected);
    if (Obj) {
        Obj.fontSize = fontSize;
        // Set the canvas font for accurate measurement.
        ctx.font = `${Obj.fontSize}px ${Obj.fontFamily}`;
        const metrics = ctx.measureText(Obj.text);
        const width = metrics.width;
        // Use actual metrics if available; otherwise, approximate.
        const ascent = metrics.actualBoundingBoxAscent || Obj.fontSize * 0.8;
        const descent = metrics.actualBoundingBoxDescent || Obj.fontSize * 0.2;
        const height = ascent + descent;
        // Add a little extra space if desired.
        const offsetX = 20;  // adjust if needed
        const offsetY = 28;  // adjust if needed

        Obj.boundingWidth = width + offsetX;
        Obj.boundingHeight = height + offsetY;
    }
    drawCanvas('ChangeStyle');
}

//function ChangeAlignStyle(value) {
//    $("#textAlign").val(value);
//    const textAlign = document.getElementById("textAlign").value; // Text alignment from dropdown

//    const Obj = textObjects.find(obj => obj.selected);
//    if (Obj) {
//        Obj.textAlign = textAlign || 'left';
//    }
//    drawCanvas('ChangeStyle');
//}
function ChangeAlignStyleOLD(value) {
    // Update the alignment control value.
    $("#textAlign").val(value);
    const newAlign = document.getElementById("textAlign").value; // "left", "center", or "right"
    const Obj = textObjects.find(obj => obj.selected);
    if (Obj) {
        // Set the canvas font for accurate measurement.
        ctx.font = `${Obj.fontSize}px ${Obj.fontFamily}`;
        const measuredWidth = ctx.measureText(Obj.text).width;

        // Use a fixed inner padding (for both left and right sides).
        const innerPadding = 15;
        // Compute new boundingWidth from measured text width plus fixed inner padding on both sides.
        const newBoundingWidth = measuredWidth + 2 * innerPadding;
        const oldBoundingWidth = Obj.boundingWidth;

        // Helper: Calculate text offset inside the box.
        // - For "left": offset = innerPadding.
        // - For "center": offset = (boundingWidth - measuredWidth) / 2.
        // - For "right": offset = boundingWidth - measuredWidth - innerPadding.
        function getTextOffset(alignment, boundingWidth, measuredWidth, pad) {
            if (alignment === "left") {
                return pad;
            } else if (alignment === "center") {
                return (boundingWidth - measuredWidth) / 2;
            } else if (alignment === "right") {
                return boundingWidth - measuredWidth - pad;
            }
        }

        const oldAlign = Obj.textAlign || "left";
        const oldOffset = getTextOffset(oldAlign, oldBoundingWidth, measuredWidth, innerPadding);
        const newOffset = getTextOffset(newAlign, newBoundingWidth, measuredWidth, innerPadding);

        // Calculate the difference in offset (delta) and shift the entire object.
        const delta = newOffset - oldOffset;
        Obj.x = Obj.x - delta;

        // Update the object's boundingWidth and textAlign.
        Obj.boundingWidth = newBoundingWidth;
        Obj.textAlign = newAlign;
    }
    drawCanvas("ChangeStyle");
}

function ChangeAlignStyleOLD1(value) {
    // 1) Store the new alignment on your control
    $("#textAlign").val(value);
    const newAlign = $("#textAlign").val(); // "left", "center", or "right"

    // 2) Find your selected text object
    const obj = textObjects.find(o => o.selected);
    if (!obj) return;

    // 3) Only set the alignment—don't recompute width or move x
    obj.textAlign = newAlign;

    // 4) Cap the box to the canvas bounds if you like:
    const maxAllowedW = canvas.width - obj.x;
    obj.boundingWidth = Math.min(obj.boundingWidth, maxAllowedW);

    // 5) Redraw
    drawCanvas("ChangeStyle");
}
function ChangeAlignStyle(value) {
    // 1) persist UI value
    $("#textAlign").val(value);
    const newAlign = $("#textAlign").val(); // "left" | "center" | "right"

    // 2) selected object
    const Obj = (typeof textObjects !== "undefined") ? textObjects.find(o => o.selected) : null;
    if (!Obj) return;

    // 3) update model + canvas box
    Obj.textAlign = newAlign;
    if (activeBox) activeBox.align = newAlign;

    // 4) (optional) keep box inside canvas horizontally if you were capping width
    //    Do NOT change x for alignment; just keep your old width cap if desired
    const maxAllowedW = canvas.width - Obj.x;
    Obj.boundingWidth = Math.min(Obj.boundingWidth, maxAllowedW);

    // 5) If the inline editor is open, apply to editor DOM without nuking selection
    if (isEditing && textEditorNew) {
        textEditorNew.style.textAlign = newAlign;

        // preserve selection while changing DOM styles
        restoreSelection?.();
        const bm = bookmarkSelection?.(textEditorNew);

        applyAlignInEditor(textEditorNew, newAlign); // set on line <div>s too

        // restore selection
        if (bm) restoreSelectionFromBookmarks?.(textEditorNew, bm);

        // sync html back to model/canvas
        if (activeBox) activeBox.text = textEditorNew.innerHTML;
        Obj.text = activeBox?.text || Obj.text;
    }

    // 6) redraw
    drawText()
    console.log(textObjects);
}
function applyAlignInEditor(root, align) {
    // apply to top-level line <div>s so the editor WYSIWYG matches the canvas
    const lineDivs = Array.from(root.childNodes)
        .filter(n => n.nodeType === 1 && n.tagName === "DIV");

    if (lineDivs.length) {
        lineDivs.forEach(div => { div.style.textAlign = align; });
    } else {
        // fallback if no line divs
        root.style.textAlign = align;
    }
}

const famSel = document.getElementById('fontFamily');
if (famSel) {
    famSel.addEventListener('mousedown', e => {
        e.preventDefault();                 // don't steal focus
        textEditorNew && textEditorNew.focus();
    });
}
function OnChangefontFamily(value) {
    $("#fontFamily").val(value);
    const fontFamily = document.getElementById("fontFamily").value || "Arial Regular";

    const Obj = Array.isArray(textObjects) ? textObjects.find(o => o.selected) : null;
    if (Obj) Obj.fontFamily = fontFamily;

    if (!activeBox) { drawText?.(); return; }

    const ed = textEditorNew;
    const hasRange = !!_lastEditorRange && ed && ed.isConnected &&
        ed.contains(_lastEditorRange.commonAncestorContainer);

    if (isEditing && hasRange) {
        ed.focus();

        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(_lastEditorRange);

        let ok = wrapSelectionInSpan(span => { span.style.fontFamily = fontFamily; });
        if (!ok) ok = applyInlineStyleSafe('fontFamily', fontFamily);

        // Optional normalize (must NOT collapse blocks)
        if (ok && typeof normalizeEditorInPlace === "function") {
            normalizeEditorInPlace(ed);
        }

        // ✅ ADD: force wrapping back on (avoids single-line collapse)
        ensureEditorWrapping(ed);

        activeBox.text = ed.innerHTML;
        if (Obj) Obj.text = activeBox.text;

        resizeEditorToContent(ed, activeBox);
        if (typeof invalidateTextRaster === "function") invalidateTextRaster(activeBox);
        drawText();
        console.log(textObjects);
        console.log(images);
        return;
    }

    // Not editing → apply to whole box, but keep line <div>s intact
    // ✅ ADD: safe whole-box update (preserves lines)
    const safeHTML = applyFontFamilyToWholeBoxHTML(activeBox.text, fontFamily);
    if (safeHTML != null) {
        activeBox.text = safeHTML;
        if (Obj) Obj.text = activeBox.text;

        // if editor is open, keep it wrapped
        ensureEditorWrapping(ed);

        resizeEditorToContent(ed, activeBox);
        if (typeof invalidateTextRaster === "function") invalidateTextRaster(activeBox);
        drawText();
        console.log(textObjects);
        console.log(images);
        return;
    }

    // (fallback — your original span-around-all, kept for completeness)
    const wrap = document.createElement("div");
    wrap.innerHTML = activeBox.text || "";
    const span = document.createElement("span");
    span.style.fontFamily = fontFamily;
    span.innerHTML = wrap.innerHTML;
    activeBox.text = span.outerHTML;
    if (Obj) Obj.text = activeBox.text;

    ensureEditorWrapping(ed); // ✅ keep wrapping even in fallback

    resizeEditorToContent(ed, activeBox);
    if (typeof invalidateTextRaster === "function") invalidateTextRaster(activeBox);
    drawText();
    console.log(textObjects);
    console.log(images);
}



function OnChangefontFamilyOLD(value) {
    $("#fontFamily").val(value);
    const fontFamily = document.getElementById("fontFamily").value || "Arial";

    // meta
    const Obj = Array.isArray(textObjects) ? textObjects.find(o => o.selected) : null;
    if (Obj) Obj.fontFamily = fontFamily;

    if (!activeBox) { drawText?.(); return; }

    const ed = textEditorNew;
    const hasRange = !!_lastEditorRange && ed && ed.isConnected && ed.contains(_lastEditorRange.commonAncestorContainer);

    if (isEditing && hasRange) {
        ed.focus();

        // restore saved selection
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(_lastEditorRange);

        // Try your helper first (some setups support this)
        let ok = false;
        if (typeof applySelectionStyleReplace === "function") {
            ok = !!(applySelectionStyleReplace("fontFamily", fontFamily) ||
                applySelectionStyleReplace("font-family", fontFamily));
        }

        // Fallback: manual wrap
        if (!ok) {
            const r = sel.getRangeAt(0);
            if (!r.collapsed) {
                const span = document.createElement("span");
                span.style.fontFamily = fontFamily; // ← raw name; browser quotes if needed
                const frag = r.extractContents();
                span.appendChild(frag);
                r.insertNode(span);

                // caret after + recache range
                sel.removeAllRanges();
                const after = document.createRange();
                after.setStartAfter(span); after.collapse(true);
                sel.addRange(after);
                _lastEditorRange = after.cloneRange();
                ok = true;
            }
        }

        // normalize (optional) → persist → redraw
        if (ok && typeof normalizeEditorInPlace === "function") {
            normalizeEditorInPlace(ed);
        }
        activeBox.text = ed.innerHTML;
        if (Obj) Obj.text = activeBox.text;

        drawText();
        console.log(textObjects);
        return;
    }

    // Not editing (or no valid selection) → apply to whole box
    applyFontFamilyToWholeBox(fontFamily);
    if (Obj) Obj.text = activeBox.text;

    drawText();
    console.log(textObjects);
}
function applyFontFamilyToWholeBox(family) {
    const container = document.createElement("div");
    container.innerHTML = activeBox.text || "";

    const topDivs = Array.from(container.childNodes).filter(n => n.nodeType === 1 && n.tagName === "DIV");

    if (topDivs.length > 0) {
        topDivs.forEach(div => {
            if (!div.style.fontFamily) div.style.fontFamily = family; // raw name
        });
    } else {
        const wrap = document.createElement("div");
        const span = document.createElement("span");
        span.style.fontFamily = family; // raw name
        span.innerHTML = container.innerHTML;
        wrap.appendChild(span);
        container.innerHTML = wrap.innerHTML;
    }

    if (typeof sanitizeSingleLine === "function") {
        container.innerHTML = sanitizeSingleLine(container.innerHTML);
    }

    activeBox.text = container.innerHTML;
}


function OnChangefontFamilyOld(value) {
    $("#fontFamily").val(value);
    const fontFamily = document.getElementById("fontFamily").value || "Arial";
    const familyForCss = /[, ]/.test(fontFamily) ? `"${fontFamily}"` : fontFamily;

    const Obj = (typeof textObjects !== "undefined") ? textObjects.find(o => o.selected) : null;
    if (Obj) Obj.fontFamily = fontFamily;

    if (!activeBox) { drawText?.(); return; }

    if (isEditing) {
        textEditorNew.focus();
        restoreSelection();

        const span = applySelectionStyleReplace("fontFamily", familyForCss); // ← keeps selection
        normalizeEditorInPlace(textEditorNew, span);

        activeBox.text = textEditorNew.innerHTML;
        if (Obj) Obj.text = activeBox.text;
    } else {
        applyFontFamilyToWholeBox(familyForCss);
        if (Obj) Obj.text = activeBox.text;
    }

    drawText();
    console.log(textObjects);
}




// Apply font-family to the entire box without blowing away other inline styles.
// If you want to FORCE override everywhere, set style.fontFamily on every element via querySelectorAll("*").
function applyFontFamilyToWholeBoxOLD(family) {
    const container = document.createElement("div");
    container.innerHTML = activeBox.text;

    const topDivs = Array.from(container.childNodes).filter(
        n => n.nodeType === 1 && n.tagName === "DIV"
    );

    if (topDivs.length > 0) {
        topDivs.forEach(div => {
            // only set if not already set inline
            if (!div.style.fontFamily) div.style.fontFamily = family;
        });
    } else {
        // no top-level divs -> wrap everything in a span with font-family
        const wrap = document.createElement("div");
        const span = document.createElement("span");
        span.style.fontFamily = family;
        span.innerHTML = container.innerHTML;
        wrap.appendChild(span);
        container.innerHTML = wrap.innerHTML;
    }

    // keep single-line content on one line
    if (typeof sanitizeSingleLine === "function") {
        container.innerHTML = sanitizeSingleLine(container.innerHTML);
    }

    activeBox.text = container.innerHTML;
}








function OnChangefontFamilyOLD(value) {
    //const paddingX = 23;
    //const paddingY = 15;
    $("#fontFamily").val(value);
    const fontFamily = document.getElementById("fontFamily").value; // Font family from dropdown
    const Obj = textObjects.find(obj => obj.selected);
    if (Obj) {
        Obj.fontFamily = fontFamily || 'Arial';

    }

    drawCanvas('ChangeStyle');
}

function uploadImage(blob, existingFolderId = 'new') {
    const formData = new FormData();
    formData.append('image', blob, 'canvas.png'); // Save as canvas.png
    formData.append('folderId', existingFolderId);

    fetch(baseURL + "video/save-image", {  // Adjust API endpoint as needed
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            console.log('Image saved successfully:', data);
            // Update hidden input field with the saved file path
            $(`#hdnDesignBoardDetailsIdSlideImageFilePath${activeSlide}`).val('');
            $(`#hdnDesignBoardDetailsIdSlideImageFilePath${activeSlide}`).val(data.filePath);
            const imageVerticalControl = $(`#imageVertical${activeSlide}`);
            imageVerticalControl.attr('src', `${data.filePath}&t=${new Date().getTime()}`);
        })
        .catch(error => {
            console.error('Error saving image:', error);
        });
}
function animateText(direction, condition, loopCount) {
    const hiddenField = ($("#hdnTabType").val() === 'In')
        ? `#hdnEffectSlide${activeSlide}`
        : `#hdnOutEffectSlide${activeSlide}`;
    const effectType = $(hiddenField).val();

    // const animationType = document.getElementById("hdnTextAnimationType").value;
    const animationType = effectType;
    let tabType = $("#hdnTabType").val();

    // default to "In" if it’s null, undefined, or just an empty string
    if (!tabType) {
        tabType = "In";
    }

    // Global timing settings (from your selected speeds).
    const inTime = parseFloat(selectedInSpeed) || 4;   // e.g. 4 seconds for all "in"
    const outTime = parseFloat(selectedOutSpeed) || 4;   // e.g. 3 seconds for all "out"
    const stayTime = parseFloat(selectedStaySpeed) || 3; // Overall stay time (applied globally if desired)

    const offscreenMargin = 80;
    const margin = 40;
    // ----- TEXT ANIMATION SECTION -----
    // Pre-calculate final positions and offscreen positions.
    textObjects.forEach((obj) => {

        // Save the final (target) position.
        obj.finalX = obj.x;
        obj.finalY = obj.y;

        // Compute the starting (offscreen) and exit positions based on the direction.
        switch (direction) {
            case "top":
                obj.x = obj.finalX;
                obj.y = -canvas.height / 2 + offscreenMargin;
                obj.exitX = obj.finalX;
                obj.exitY = canvas.height;
                break;

            case "bottom":
                obj.x = obj.finalX;
                obj.y = canvas.height / 2 + 250;
                obj.exitX = obj.finalX;
                obj.exitY = -canvas.height / 2;
                break;
            case "left":
                obj.x = -canvas.width / 2;
                obj.y = obj.finalY;
                obj.exitX = canvas.width + margin;
                obj.exitY = obj.finalY;
                break;

            case "right":
                obj.x = canvas.width / 2 + 150;
                obj.y = obj.finalY;
                obj.exitX = -obj.boundingWidth - margin;
                obj.exitY = obj.finalY;
                break;
            default:
                // Default: animate offscreen to the right.
                obj.x = obj.finalX;
                obj.y = obj.finalY;
                obj.exitX = window.innerWidth;
                obj.exitY = obj.finalY;
        }
        console.log("Left dist:", -canvas.width / 2, canvas.width + margin);
        console.log("Right dist:", canvas.width / 2 + 150, -obj.boundingWidth - margin);
        console.log("top dist:", -canvas.width / 2 - 100, -obj.boundingWidth - margin);
        console.log("bottom dist:", canvas.height, canvas.width);
    });
    // ----- IMAGE ANIMATION SECTION -----
    // (A similar approach can be applied to images.)
    images.forEach((imgObj) => {
        imgObj.finalX = imgObj.x;
        imgObj.finalY = imgObj.y;
        const dispWidth = imgObj.width * (imgObj.scaleX || 1);
        const dispHeight = imgObj.height * (imgObj.scaleY || 1);
        switch (direction) {
            case "top":
                //imgObj.x = imgObj.finalX;
                //imgObj.y = -(dispHeight + 55);
                //imgObj.exitX = imgObj.finalX;
                //imgObj.exitY = -(dispHeight + 5);
                imgObj.x = imgObj.finalX;
                imgObj.y = -canvas.height / 2 + offscreenMargin;
                imgObj.exitX = imgObj.finalX;
                imgObj.exitY = canvas.height;
                break;
            case "bottom":
                //imgObj.x = imgObj.finalX;
                //imgObj.y = canvas.height + 5;
                //imgObj.exitX = imgObj.finalX;
                //imgObj.exitY = canvas.height + 5;

                imgObj.x = imgObj.finalX;
                imgObj.y = canvas.height / 2 + 270;
                imgObj.exitX = imgObj.finalX;
                imgObj.exitY = -canvas.height / 2;

                break;
            case "left":
                //imgObj.x = -(dispWidth + 5);
                //imgObj.y = imgObj.finalY;
                //imgObj.exitX = -(dispWidth + 5);
                //imgObj.exitY = imgObj.finalY;
                imgObj.x = -canvas.width / 2;
                imgObj.y = imgObj.finalY;
                imgObj.exitX = canvas.width + margin;
                imgObj.exitY = imgObj.finalY;
                break;
            case "right":
                //imgObj.x = canvas.width + 5;
                //imgObj.y = imgObj.finalY;
                //imgObj.exitX = canvas.width + 5;
                //imgObj.exitY = imgObj.finalY;
                imgObj.x = canvas.width / 2 + 150;
                imgObj.y = imgObj.finalY;
                imgObj.exitX = -canvas.width;
                imgObj.exitY = imgObj.finalY;
                break;
            default:
                imgObj.x = imgObj.finalX;
                imgObj.y = imgObj.finalY;
                imgObj.exitX = window.innerWidth;
                imgObj.exitY = imgObj.finalY;
        }
    });




    if (animationType === "delaylinear") {
        // 1) Collect animatable items
        const allItems = [
            ...images.filter(i => !i.noAnim),
            ...textObjects.filter(t => !t.noAnim)
        ];

        // 2) Bucket into units by groupId
        const groupMap = new Map();
        const units = [];

        allItems.forEach(item => {
            const gid = item.groupId;
            if (gid != null) {
                if (!groupMap.has(gid)) {
                    groupMap.set(gid, []);
                    units.push(groupMap.get(gid));
                }
                groupMap.get(gid).push(item);
            } else {
                units.push([item]);
            }
        });




        // 3) Compute timings
        const scaleInText = inTime;
        const scaleOutText = outTime;
        const individualIn = 0.15 * scaleInText;   // time per‐unit for “In”
        const individualOut = 0.15 * scaleOutText;  // time per‐unit for “Out”
        const staggerIn = individualIn;         // gap between each group‐In
        const staggerOut = individualOut;        // gap between each group‐Out

        // 4) Build the GSAP timeline
        const tlText = gsap.timeline({
            repeat: loopCount - 1,
            onStart: () => drawText(),
            onUpdate: () => drawText(),
        });

        // ✅ Pin noAnim items at t=0 — ensure they are visible always
        images.filter(i => i.noAnim).forEach(imgObj => {
            tlText.set(imgObj, {
                x: imgObj.finalX,
                y: imgObj.finalY,
                rotation: 0,
                opacity: imgObj.opacity ?? 100
            }, 0);
        });
        textObjects.filter(t => t.noAnim).forEach(txtObj => {
            tlText.set(txtObj, {
                x: txtObj.finalX,
                y: txtObj.finalY,
                rotation: 0,
                opacity: txtObj.opacity ?? 100
            }, 0);
        });

        // 🔥 Force immediate draw, outside GSAP
        drawText();

        // ── IN ── (only when tabType === "In")
        //if (tabType === "In") {
        //    units.forEach((unit, idx) => {
        //        tlText.to(unit, {
        //            x: (i, target) => target.finalX,
        //            y: (i, target) => target.finalY,
        //            duration: individualIn,
        //            ease: "power1.in",
        //            onUpdate: () => drawCanvas(condition)
        //        }, idx * staggerIn);
        //    });
        //}
        if (tabType === "In") {
            units.forEach((unit, idx) => {
                tlText.to(unit, {
                    x: (i, target) => target.finalX,
                    y: (i, target) => target.finalY,
                    duration: scaleInText * .20,
                    ease: "power1.in",
                    onUpdate: () => drawText()
                }, 0);
            });
        }
        // ── STAY ── (runs for both "Stay" and "Out")
        if (tabType === "Stay") {
            const startStayTime = (tabType === "In")
                ? (units.length * staggerIn)
                : 0;

            tlText.to({}, {
                duration: stayTime,
                ease: "none"
            }, startStayTime);
        }

        // ── OUT ── (only when tabType === "Out")
        // ── OUT ── (only when tabType === "Out")
        if (tabType === "Out") {
            // Snap everything to final immediately at t=0
            tlText.set([...textObjects, ...images], {
                x: (i, target) => target.finalX,
                y: (i, target) => target.finalY,
                opacity: (i, target) => target.opacity ?? 100
            }, 0);

            // OUT starts immediately (no artificial delay)
            units.forEach((unit, idx) => {
                tlText.to(unit, {
                    x: (i, target) => target.exitX,
                    y: (i, target) => target.exitY,
                    duration: 0.20 * scaleOutText,
                    ease: "power1.out",
                    onUpdate: () => drawText()
                }, idx * 0);
            });
        }

        // ── RESET ──
        let totalDuration;
        if (tabType === "In") {
            totalDuration = (units.length * staggerIn) + stayTime + (units.length * staggerOut);
        } else if (tabType === "Stay") {
            totalDuration = stayTime;
        } else {
            totalDuration = (units.length * staggerOut);
        }

        tlText.set([...textObjects, ...images], {
            x: (i, target) => target.finalX,
            y: (i, target) => target.finalY
        }, totalDuration);

        tlText.eventCallback("onComplete", () => {
            images.forEach(img => {
                img.x = img.finalX;
                img.y = img.finalY;
                img.opacity = img.opacity ?? 100;
            });
            textObjects.forEach(txt => {
                txt.x = txt.finalX;
                txt.y = txt.finalY;
            });
            drawText();
        });
    }
    else if (animationType === "delaylinear2") {
        // 1) Collect animatable items
        const allItems = [
            ...images.filter(i => !i.noAnim),
            ...textObjects.filter(t => !t.noAnim)
        ];

        // 2) Bucket into units by groupId
        const groupMap = new Map();
        const units = [];
        allItems.forEach(item => {
            const gid = item.groupId;
            if (gid != null) {
                if (!groupMap.has(gid)) {
                    groupMap.set(gid, []);
                    units.push(groupMap.get(gid));
                }
                groupMap.get(gid).push(item);
            } else {
                units.push([item]);
            }
        });

        // 3) Compute timings
        const individualIn = 0.15 * inTime;    // per‐unit “In”
        const individualOut = 0.15 * outTime;   // per‐unit “Out”
        const staggerIn = individualIn / 3; // 50% overlap
        const staggerOut = individualOut / 3; // 50% overlap

        // 4) Build the GSAP timeline
        const tlText = gsap.timeline({
            repeat: loopCount - 1,
            repeatDelay: 0,
            onRepeat: () => {
                // reset positions on loop
                images.forEach(img => { img.x = img.startX; img.y = img.startY; });
                textObjects.forEach(txt => { txt.x = txt.startX; txt.y = txt.startY; });
                drawText();
            },
            onUpdate: () => drawText()
        });
        // ✅ Pin noAnim items at t=0 — ensure they are visible always
        images.filter(i => i.noAnim).forEach(imgObj => {
            tlText.set(imgObj, {
                x: imgObj.finalX,
                y: imgObj.finalY,
                rotation: 0,
                opacity: imgObj.opacity ?? 100
            }, 0);
        });
        textObjects.filter(t => t.noAnim).forEach(txtObj => {
            tlText.set(txtObj, {
                x: txtObj.finalX,
                y: txtObj.finalY,
                rotation: 0,
                opacity: txtObj.opacity ?? 100
            }, 0);
        });

        // 🔥 Force immediate draw, outside GSAP
        drawText();


        // ── IN ── (only if requested)
        if (tabType === "In") {
            tlText.to(units, {
                x: (i, target) => target.finalX,
                y: (i, target) => target.finalY,
                duration: individualIn,
                ease: "power1.in",
                stagger: staggerIn,
                onUpdate: () => drawText()
            }, 0);
        }

        // compute when the last In actually finishes
        const inEndTime = (tabType === "In")
            ? (units.length - 1) * staggerIn + individualIn
            : 0;

        // ── STAY ── (for both Stay and Out)
        if (tabType === "Stay") {
            tlText.to({}, {
                duration: stayTime,
                ease: "none"
            }, inEndTime);
        }

        // ── OUT ── (only if requested)
        if (tabType === "Out") {
            tlText.set([...images, ...textObjects], {
                x: (i, t) => t.finalX,
                y: (i, t) => t.finalY,
                opacity: (i, t) => t.opacity ?? 100
            }, 0);

            tlText.to(units, {
                x: (i, target) => target.exitX,
                y: (i, target) => target.exitY,
                duration: individualOut,
                ease: "power1.out",
                stagger: staggerOut,
                onUpdate: () => drawText()
            }, 0);
        }

        // ── RESET “snap‐back” at end ──
        // total duration = inEndTime + stayTime + (if Out) last exit end
        let totalDuration = inEndTime;
        if (tabType === "Out") {
            totalDuration += (units.length - 1) * staggerOut + individualOut;
        }

        tlText.set([...images, ...textObjects], {
            x: (i, t) => t.finalX,
            y: (i, t) => t.finalY
        }, totalDuration);

        tlText.eventCallback("onComplete", () => {
            images.forEach(img => {
                img.x = img.finalX; img.y = img.finalY; img.opacity = img.opacity ?? 100;
            });
            textObjects.forEach(txt => {
                txt.x = txt.finalX; txt.y = txt.finalY;
            });
            drawText();
        });

        // ── OPTIONAL: normalize to exact slide length ──
        // const slideExec = inTime + stayTime + outTime;
        // const ratio     = tlText.duration() / slideExec;
        // tlText.timeScale(ratio);
    }


    // ── Fade (canvas-only)  not working───────────────────────────
    else if (animationType === "fadeCanvas") {
        const items = [...images.filter(i => !i.noAnim), ...textObjects.filter(t => !t.noAnim)];
        // Reset to final and directional offset
        items.forEach(o => { o.x = o.finalX; o.y = o.finalY; });
        // Initialize opacity
        if (tabType === "In") items.forEach(o => o.opacity = 0);
        else items.forEach(o => o.opacity = 1);

        const tl = gsap.timeline({ repeat: loopCount - 1, onUpdate: () => drawText() });

        // IN fade in
        if (tabType === "In") {
            tl.to(items, {
                opacity: 1,
                duration: inTime,
                ease: "power2.out",
                stagger: 0.1
            }, 0);
        }

        // STAY
        const fadeDelay = (tabType === "In") ? inTime : 0;
        if (["Stay", "Out"].includes(tabType)) {
            tl.to({}, { duration: stayTime, ease: "none" }, fadeDelay);
        }

        // OUT fade out
        if (tabType === "Out") {
            tl.to(items, {
                opacity: 0,
                duration: outTime,
                ease: "power2.in",
                stagger: 0.1
            }, fadeDelay);
        }

        // RESET
        tl.eventCallback("onComplete", () => {
            items.forEach(o => o.opacity = 1);
            drawText();
        });
    }

    // ── Bounce (canvas-only, directional) not working ────────────
    else if (animationType === "bounceCanvas") {
        const items = [...images.filter(i => !i.noAnim), ...textObjects.filter(t => !t.noAnim)];
        // Reset to final and record start offsets
        items.forEach(o => {
            o.x = o.finalX;
            o.y = o.finalY;
            // apply initial offset saved earlier in precompute (exitX/exitY serve as offset direction)
            o.startX = o.exitX || o.finalX;
            o.startY = o.exitY || o.finalY;
        });

        const tl = gsap.timeline({ repeat: loopCount - 1, onUpdate: () => drawText() });

        // IN bounce from startX/startY to finalX/finalY
        if (tabType === "In") {
            tl.fromTo(items,
                { x: i => items[i].startX, y: i => items[i].startY },
                { x: i => items[i].finalX, y: i => items[i].finalY, duration: inTime, ease: "bounce.out", stagger: 0.1 }
                , 0);
        }

        // STAY
        const bounceDelay = (tabType === "In")
            ? inTime + 0.1 * (items.length - 1)
            : 0;
        if (["Stay", "Out"].includes(tabType)) {
            tl.to({}, { duration: stayTime, ease: "none" }, bounceDelay);
        }

        // OUT bounce back to start positions
        if (tabType === "Out") {
            tl.to(items, {
                x: i => items[i].startX,
                y: i => items[i].startY,
                duration: outTime,
                ease: "bounce.in",
                stagger: 0.1
            }, bounceDelay);
        }

        // RESET
        tl.eventCallback("onComplete", () => {
            items.forEach(o => { o.x = o.finalX; o.y = o.finalY; });
            drawText();
        });
    }
    // ── Zoom (canvas-only) In working Out not working also only image working for In ───────────────────────────
    else if (animationType === "zoomCanvas") {
        const items = [...images.filter(i => !i.noAnim), ...textObjects.filter(t => !t.noAnim)];
        // reset home & init small
        items.forEach(o => {
            o.x = o.finalX; o.y = o.finalY;
            o.scaleX = o.scaleY = 0.1;
            o.opacity = (tabType === "In" ? 0 : 1);
        });

        const tl = gsap.timeline({ repeat: loopCount - 1, onStart: () => drawText(), onUpdate: () => drawText() });

        if (tabType === "In") {
            tl.to(items, {
                scaleX: 1, scaleY: 1, opacity: 1,
                duration: inTime, ease: "power2.out", stagger: 0.1
            }, 0);
        }
        const delayZ = (tabType === "In") ? inTime + 0.1 * (items.length - 1) : 0;
        if (["Stay", "Out"].includes(tabType)) {
            tl.to({}, { duration: stayTime, ease: "none" }, delayZ);
        }
        if (tabType === "Out") {
            tl.to(items, {
                scaleX: 0.1, scaleY: 0.1, opacity: 0,
                duration: outTime, ease: "power2.in", stagger: 0.1
            }, delayZ);
        }
        tl.eventCallback("onComplete", () => {
            items.forEach(o => { o.scaleX = 1; o.scaleY = 1; o.opacity = 1; });
            drawText();
        });
    }

    // ── Mask Reveal (canvas-only) not working────────────────────
    else if (animationType === "mask") {
        if (window.currentPopcornTimeline) {
            window.currentPopcornTimeline.kill();
        }
        const animItems = [...images.filter(i => !i.noAnim), ...textObjects.filter(t => !t.noAnim)];
        const staticItems = [...images.filter(i => i.noAnim), ...textObjects.filter(t => t.noAnim)];

        // Group items by groupId
        const groupMap = new Map();
        const units = [];
        animItems.forEach(item => {
            const gid = item.groupId;
            if (gid != null) {
                if (!groupMap.has(gid)) {
                    groupMap.set(gid, []);
                    units.push(groupMap.get(gid));
                }
                groupMap.get(gid).push(item);
            } else {
                units.push([item]);
            }
        });

        // Initialize
        animItems.forEach(o => {
            o.x = o.finalX;
            o.y = o.finalY;
            o.clip = (tabType === "In") ? 1 : 0;   // Fully masked if entering, visible if exiting

            o.clipDirection = (tabType === "Out")
                ? invertDirection(direction)
                : direction;
        });

        staticItems.forEach(o => {
            o.x = o.finalX;
            o.y = o.finalY;
            o.clip = 0;   // Always fully visible
        });

        const tl = gsap.timeline({
            repeat: loopCount - 1,
            onUpdate: () => drawText()
        });

        // Static items pinned
        staticItems.forEach(o => {
            tl.set(o, { clip: 0 }, 0);
        });

        if (tabType === "In") {
            units.forEach(unit => {
                tl.to(unit, {
                    clip: 0,
                    duration: inTime,
                    ease: "power2.out",
                    onUpdate: () => drawText()
                }, 0);
            });
        }

        const delayM = (tabType === "In") ? inTime : 0;

        if (["Stay", "Out"].includes(tabType)) {
            tl.to({}, { duration: stayTime, ease: "none" }, delayM);
        }

        if (tabType === "Out") {
            units.forEach(unit => {
                tl.to(unit, {
                    clip: 1,
                    duration: outTime,
                    ease: "power2.out",
                    onUpdate: () => drawText()
                }, delayM);
            });
        }

        tl.eventCallback("onComplete", () => {
            animItems.forEach(o => {
                o.clip = 0;  // Always fully visible after IN or OUT
                o.x = o.finalX;
                o.y = o.finalY;
            });

            [...animItems, ...staticItems].forEach(o => o.rotation = o.rotation);

            drawText();
        });

    }




    // ── Shake (canvas-only) working but direction not working all──────────────────────────
    else if (animationType === "shakeCanvas") {
        const items = [...images.filter(i => !i.noAnim), ...textObjects.filter(t => !t.noAnim)];
        // reset home
        items.forEach(o => { o.x = o.finalX; o.y = o.finalY; });
        const tl = gsap.timeline({ repeat: loopCount - 1, onUpdate: () => drawText() });

        if (tabType === "In") {
            tl.to(items, {
                x: '+=10', duration: 0.05, yoyo: true, repeat: 5, stagger: 0.05
            }, 0);
        }
        const delayS = (tabType === "In") ? 0.05 * 5 : 0;
        if (["Stay", "Out"].includes(tabType)) {
            tl.to({}, { duration: stayTime, ease: "none" }, delayS);
        }
        if (tabType === "Out") {
            tl.to(items, {
                x: '+=10', duration: 0.05, yoyo: true, repeat: 5, stagger: 0.05
            }, delayS);
        }
        tl.eventCallback("onComplete", () => {
            items.forEach(o => { o.x = o.finalX; o.y = o.finalY; });
            drawText();
        });
    }

    // ── Blur (canvas-only) not working───────────────────────────
    else if (animationType === "blurCanvas") {
        const items = [...images.filter(i => !i.noAnim), ...textObjects.filter(t => !t.noAnim)];
        items.forEach(o => { o.x = o.finalX; o.y = o.finalY; o.blur = 20; });
        const tl = gsap.timeline({ repeat: loopCount - 1, onUpdate: () => drawText() });

        if (tabType === "In") {
            tl.to(items, { blur: 0, duration: inTime, ease: "power2.out", stagger: 0.1 }, 0);
        }
        const delayB = (tabType === "In") ? inTime : 0;
        if (["Stay", "Out"].includes(tabType)) {
            tl.to({}, { duration: stayTime, ease: "none" }, delayB);
        }
        if (tabType === "Out") {
            tl.to(items, { blur: 20, duration: outTime, ease: "power2.in", stagger: 0.1 }, delayB);
        }
        tl.eventCallback("onComplete", () => {
            items.forEach(o => o.blur = 0);
            drawText();
        });
    }

    // ── Roll (canvas-only) working───────────────────────────
    else if (animationType === "roll") {
        const animItems = [...images.filter(i => !i.noAnim), ...textObjects.filter(t => !t.noAnim)];
        const staticItems = [...images.filter(i => i.noAnim), ...textObjects.filter(t => t.noAnim)];

        // Grouping
        const groupMap = new Map();
        const units = [];

        animItems.forEach(item => {
            const gid = item.groupId;
            if (gid != null) {
                if (!groupMap.has(gid)) {
                    groupMap.set(gid, []);
                    units.push(groupMap.get(gid));
                }
                groupMap.get(gid).push(item);
            } else {
                units.push([item]);
            }
        });

        const halfIn = inTime * 0.5;
        const halfOut = outTime * 0.5;

        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;

        const inRotationAmount = direction === "left" ? 360 : direction === "right" ? -360 : 360;
        const outRotationAmount = direction === "right" ? 360 : -360;

        const tl = gsap.timeline({
            repeat: loopCount - 1,
            onRepeat: () => {
                animItems.forEach(o => {
                    o.rotation = 0;
                    if (direction === "left") o.x = -200;
                    else if (direction === "right") o.x = canvasWidth + 200;
                    else if (direction === "top") o.y = -200;
                    else if (direction === "bottom") o.y = canvasHeight + 200;
                });
                drawText();
            },
            onUpdate: () => drawText(),
            onComplete: () => {
                // snap back exactly to startRotation
                allItems.concat(staticItems).forEach(o => {
                    o.x = o.finalX;
                    o.y = o.finalY;
                    o.rotation = o.startRotation;
                });
                drawText();
            }
        });
        // ✅ Pin noAnim items at t=0 — ensure they are visible always
        images.filter(i => i.noAnim).forEach(imgObj => {
            tl.set(imgObj, {
                x: imgObj.finalX,
                y: imgObj.finalY,
                rotation: imgObj.rotation,
                opacity: imgObj.opacity ?? 100
            }, 0);
        });
        textObjects.filter(t => t.noAnim).forEach(txtObj => {
            tl.set(txtObj, {
                x: txtObj.finalX,
                y: txtObj.finalY,
                rotation: txtObj.rotation,
                opacity: txtObj.opacity ?? 100
            }, 0);
        });
        // 🔥 Force immediate draw, outside GSAP
        drawText();
        const tweenIn = 0.15 * inTime;
        const tweenOut = 0.15 * outTime;

        // 🔵 IN phase — animate grouped units
        if (tabType === "In") {
            units.forEach((unit, idx) => {
                unit.forEach(item => {
                    if (direction === "left") item.x = -200;
                    else if (direction === "right") item.x = canvasWidth + 200;
                    else if (direction === "top") item.y = -200;
                    else if (direction === "bottom") item.y = canvasHeight + 200;
                });

                tl.to(unit, {
                    duration: halfIn,
                    ease: "back.inOut(1.7)",
                    rotation: `+=${inRotationAmount}`,
                    x: (i, t) => t.finalX,
                    y: (i, t) => t.finalY,
                    onUpdate: () => drawText()
                }, tweenIn);
            });
        }

        // 🟡 STAY phase
        const delayR = (tabType === "In") ? inTime : 0;
        if (["Stay"].includes(tabType)) {
            tl.to({}, { duration: 0.5, ease: "none" }, delayR);
        }

        // 🔴 OUT phase — animate grouped units
        if (tabType === "Out") {
            units.forEach((unit, idx) => {
                unit.forEach(item => {
                    // 🟢 Ensure they start from final position
                    item.x = item.finalX;
                    item.y = item.finalY;

                    // 🟢 Fix: preserve IN rotation so OUT continues from there
                    item.rotation = item.rotation ?? 0;
                    item.rotation += inRotationAmount;

                    // 🔁 Prepare exitX and exitY if missing
                    if (item.exitX == null || item.exitY == null) {
                        if (direction === "left") item.exitX = -200;
                        else if (direction === "right") item.exitX = canvasWidth + 200;
                        else item.exitX = item.finalX;

                        if (direction === "top") item.exitY = -200;
                        else if (direction === "bottom") item.exitY = canvasHeight + 200;
                        else item.exitY = item.finalY;
                    }
                });

                // 🔴 Animate to exit position
                tl.to(unit, {
                    duration: halfOut,
                    ease: "power1.inOut",
                    rotation: `+=${outRotationAmount}`,
                    x: (i, t) => t.exitX,
                    y: (i, t) => t.exitY,
                    onUpdate: () => drawText()
                }, tweenOut);
            });

            const scaleInText = inTime;
            const scaleOutText = outTime;
            const individualIn = 0.15 * scaleInText;
            const individualOut = 0.15 * scaleOutText;
            const staggerIn = individualIn;
            const staggerOut = individualOut;

            const inEndTime = (units.length - 1) * staggerIn + individualIn;

            let totalDuration = inEndTime;
            if (tabType === "Out") {
                totalDuration += (units.length - 1) * staggerOut + individualOut;
            }

            // 🟡 Force TL to run at least totalDuration using dummy tween
            if (tl.duration() < totalDuration) {
                tl.to({}, { duration: totalDuration - tl.duration() }, tl.duration());
            }

            // ✅ Now apply snap-back/reset after everything
            tl.set([...images, ...textObjects], {
                x: (i, t) => t.finalX,
                y: (i, t) => t.finalY
            }, totalDuration);

            tl.eventCallback("onComplete", () => {
                images.forEach(img => {
                    img.x = img.finalX;
                    img.y = img.finalY;
                    img.opacity = img.opacity ?? 100;
                });
                textObjects.forEach(txt => {
                    txt.x = txt.finalX;
                    txt.y = txt.finalY;
                });
                drawText();
            });
        }



        // 🔄 Reset
        tl.eventCallback("onComplete", () => {
            [...animItems, ...staticItems].forEach(o => o.rotation = o.rotation);

        });
    }








    // ── Curtain (canvas-only) In working not OUt and only image works────────────────────────
    else if (animationType === "curtainCanvas") {
        const items = [...images.filter(i => !i.noAnim), ...textObjects.filter(t => !t.noAnim)];
        items.forEach(o => { o.x = o.finalX; o.y = o.finalY; o.scaleY = 0; });
        const tl = gsap.timeline({ repeat: loopCount - 1, onUpdate: () => drawText() });

        if (tabType === "In") {
            tl.to(items, { scaleY: 1, duration: inTime, ease: "power2.out", stagger: 0.1 }, 0);
        }
        const delayC = (tabType === "In") ? inTime : 0;
        if (["Stay", "Out"].includes(tabType)) {
            tl.to({}, { duration: stayTime, ease: "none" }, delayC);
        }
        if (tabType === "Out") {
            tl.to(items, { scaleY: 0, duration: outTime, ease: "power2.in", stagger: 0.1 }, delayC);
        }
        tl.eventCallback("onComplete", () => {
            items.forEach(o => o.scaleY = 1);
            drawText();
        });
    }

    // ── BlurFlash (canvas-only) working───────────────────────
    else if (animationType === "blurFlashCanvas") {
        const items = [...images.filter(i => !i.noAnim), ...textObjects.filter(t => !t.noAnim)];
        items.forEach(o => { o.x = o.finalX; o.y = o.finalY; o.blur = 0; o.opacity = 1; });
        const tl = gsap.timeline({ repeat: loopCount - 1, onUpdate: () => drawText() });

        if (tabType === "In") {
            tl.to(items, {
                blur: 10, opacity: 0.5,
                duration: inTime / 2, yoyo: true, repeat: 1, stagger: 0.1
            }, 0);
        }
        const delayBF = (tabType === "In") ? inTime : 0;
        if (["Stay", "Out"].includes(tabType)) {
            tl.to({}, { duration: stayTime, ease: "none" }, delayBF);
        }
        if (tabType === "Out") {
            tl.to(items, {
                blur: 10, opacity: 0.5,
                duration: outTime / 2, yoyo: true, repeat: 1, stagger: 0.1
            }, delayBF);
        }
        tl.eventCallback("onComplete", () => {
            items.forEach(o => { o.blur = 0; o.opacity = 1; });
            drawText();
        });
    }

    // ── Popcorn (canvas-only) In working Out not working and only Image working not tex ────────────────────────
    else if (animationType === "popcorn") {
        const animItems = [...images.filter(i => !i.noAnim), ...textObjects.filter(t => !t.noAnim)];
        const staticItems = [...images.filter(i => i.noAnim), ...textObjects.filter(t => t.noAnim)];

        // Group animatable items by groupId
        const groupMap = new Map();
        const units = [];
        animItems.forEach(item => {
            const gid = item.groupId;
            if (gid != null) {
                if (!groupMap.has(gid)) {
                    groupMap.set(gid, []);
                    units.push(groupMap.get(gid));
                }
                groupMap.get(gid).push(item);
            } else {
                units.push([item]);
            }
        });

        // Set initial positions and scales
        animItems.forEach(o => {
            o.x = o.finalX;
            o.y = o.finalY;
            o.scaleX = 0;
            o.scaleY = 0;
        });
        staticItems.forEach(o => {
            o.x = o.finalX;
            o.y = o.finalY;
            o.scaleX = 1;
            o.scaleY = 1;
        });

        const tl = gsap.timeline({
            repeat: loopCount - 1,
            onUpdate: () => drawText()
        });

        // 🧷 Pin static items immediately
        staticItems.forEach(o => {
            tl.set(o, { x: o.finalX, y: o.finalY, scaleX: 1, scaleY: 1 }, 0);
        });

        const totalUnits = units.length;
        const staggerIn = (inTime / 2) / totalUnits;
        const staggerOut = (outTime / 2) / totalUnits;

        if (tabType === "In" || tabType === "Out") {
            units.forEach((unit, i) => {
                const start = i * staggerIn;
                tl.set(unit, { scaleX: 0, scaleY: 0 }, 0);

                tl.to(unit, {
                    scaleX: 1.3,
                    scaleY: 1.3,
                    duration: 0.2,
                    ease: "power2.out"
                }, start);

                tl.to(unit, {
                    scaleX: 1.0,
                    scaleY: 1.0,
                    duration: 0.3,
                    ease: "bounce.out"
                }, start + 0.2);
            });
        }

        const delayP = (tabType === "In") ? inTime : 0;

        if (["Stay", "Out"].includes(tabType)) {
            tl.to({}, { duration: stayTime, ease: "none" }, delayP);
        }


    }

    else if (animationType === "zoom") {
        const animItems = [...images.filter(i => !i.noAnim), ...textObjects.filter(t => !t.noAnim)];
        const staticItems = [...images.filter(i => i.noAnim), ...textObjects.filter(t => t.noAnim)];

        // Group items by groupId
        const groupMap = new Map();
        const units = [];
        animItems.forEach(item => {
            const gid = item.groupId;
            if (gid != null) {
                if (!groupMap.has(gid)) {
                    groupMap.set(gid, []);
                    units.push(groupMap.get(gid));
                }
                groupMap.get(gid).push(item);
            } else {
                units.push([item]);
            }
        });

        // Initialize all
        animItems.forEach(o => {
            o.x = o.finalX;
            o.y = o.finalY;
            o.scaleX = 0.5;
            o.scaleY = 0.5;
        });
        staticItems.forEach(o => {
            o.x = o.finalX;
            o.y = o.finalY;
            o.scaleX = 1;
            o.scaleY = 1;
        });

        const tl = gsap.timeline({
            repeat: loopCount - 1,
            onUpdate: () => drawText()
        });

        // Pin static items immediately
        staticItems.forEach(o => {
            tl.set(o, { x: o.finalX, y: o.finalY, scaleX: 1, scaleY: 1 }, 0);
        });

        if (tabType === "In") {
            // Start small (or invisible)
            tl.set(units.flat(), {
                scaleX: 0.1,
                scaleY: 0.1
            }, 0);

            // Animate to large size and stop there
            tl.to(units.flat(), {
                scaleX: 1,
                scaleY: 1,
                duration: inTime / 2,
                ease: "power2.out",
                onUpdate: () => drawText()
            }, 0);
        }


        const delayP = (tabType === "In") ? inTime : 0;

        // STAY phase (optional)
        if (["Stay", "Out"].includes(tabType)) {
            tl.to({}, { duration: stayTime, ease: "none" }, delayP);
        }

        if (tabType === "Out") {
            // Ensure full size before starting OUT
            tl.set(units.flat(), {
                scaleX: 1,   // Or 1.0 depending on your entry state
                scaleY: 1
            }, 0);

            // Animate shrink to invisible
            tl.to(units.flat(), {
                scaleX: 0,
                scaleY: 0,
                duration: outTime / 2,
                ease: "power2.inOut",
                onUpdate: () => drawText()
            }, 0);

        }
    }

    // ── Glitch (canvas-only) working ─────────────────────────
    else if (animationType === "glitchCanvas") {
        const items = [...images.filter(i => !i.noAnim), ...textObjects.filter(t => !t.noAnim)];
        items.forEach(o => { o.x = o.finalX; o.y = o.finalY; });
        const tl = gsap.timeline({ repeat: loopCount - 1, onUpdate: () => drawText() });

        if (tabType === "In") {
            tl.to(items, {
                x: i => items[i].finalX + gsap.utils.random(-10, 10),
                duration: 0.1, repeat: 10, yoyo: true, stagger: 0.05
            }, 0);
        }
        const delayG = (tabType === "In") ? 10 * 0.1 : 0;
        if (["Stay", "Out"].includes(tabType)) {
            tl.to({}, { duration: stayTime, ease: "none" }, delayG);
        }
        if (tabType === "Out") {
            tl.to(items, {
                x: i => items[i].finalX + gsap.utils.random(-10, 10),
                duration: 0.1, repeat: 10, yoyo: true, stagger: 0.05
            }, delayG);
        }
        tl.eventCallback("onComplete", () => {
            items.forEach(o => { o.x = o.finalX; });
            drawText();
        });
    }






}







function textAnimationClick(clickedElement, type, from) {
    $("#hdnTextAnimationType").val(type);
    animationMode = type;
    //if (activeSlide === 1) {
    //    $("#hdnEffectSlide1").val(type);
    //}
    //else if (activeSlide === 2) {
    //    $("#hdnEffectSlide2").val(type);
    //}
    //else if (activeSlide === 3) {
    //    $("#hdnEffectSlide3").val(type);
    //}
    if (from == 'Out') {
        if (activeSlide === 1) {
            $("#hdnOutEffectSlide1").val(type);
        }
        else if (activeSlide === 2) {
            $("#hdnOutEffectSlide2").val(type);
        }
        else if (activeSlide === 3) {
            $("#hdnOutEffectSlide3").val(type);
        }
        $('.effectOut_btn').removeClass('active_effect');
        clickedElement.classList.add("active_effect");
    }
    else if (from == 'In') {

        if (activeSlide === 1) {
            $("#hdnEffectSlide1").val(type);
        }
        else if (activeSlide === 2) {
            $("#hdnEffectSlide2").val(type);
        }
        else if (activeSlide === 3) {
            $("#hdnEffectSlide3").val(type);
        }
        $('.effectIn_btn').removeClass('active_effect');
        clickedElement.classList.add("active_effect");
    }
    //if (type === 'roll') {
    //    document.getElementById('abottom')?.classList.add('disabled-ani-button');
    //    document.getElementById('atop')?.classList.add('disabled-ani-button');
    //    document.getElementById('obottom')?.classList.add('disabled-ani-button');
    //    document.getElementById('otop')?.classList.add('disabled-ani-button');


    //} else {
    //    document.getElementById('abottom')?.classList.remove('disabled-ani-button');
    //    document.getElementById('atop')?.classList.remove('disabled-ani-button');
    //    document.getElementById('obottom')?.classList.remove('disabled-ani-button');
    //    document.getElementById('otop')?.classList.remove('disabled-ani-button');
    //}

    // Get the container using its ID.
    //var ulEffects = document.getElementById("ulEffects");

    //// Select all <a> elements within the container.
    //var links = ulEffects.getElementsByTagName("a");

    //// Remove the active_effect class from all links.
    //for (var i = 0; i < links.length; i++) {
    //    links[i].classList.remove("active_effect");
    //}

    //// Add the active_effect class to the clicked element.
    //clickedElement.classList.add("active_effect");

    //// Get the container using its ID.
    //var ulDirection = document.getElementById("uldirection");

    //// Select all <a> elements within the container.
    //var links = ulDirection.getElementsByTagName("a");

    //// Remove the active_effect class from all links.
    //for (var i = 0; i < links.length; i++) {
    //    links[i].classList.remove("active_effect");
    //}
    // initMiniCanvasHandlers();
}
// miniCanvasHandlers.js

(function (window, document, gsap) {

    // all your canvases & centers live here:
    let miniCanvasAtop,
        miniCanvasAleft,
        miniCanvasAright,
        miniCanvasAbottom;

    // your init function
    function initMiniCanvasHandlers() {
        const dpr = window.devicePixelRatio || 1;

        // grab the elements (they MUST exist in the DOM before this runs!)
        miniCanvasAtop = document.getElementById('miniCanvasAtop');
        miniCanvasAleft = document.getElementById('miniCanvasAleft');
        miniCanvasAright = document.getElementById('miniCanvasAright');
        miniCanvasAbottom = document.getElementById('miniCanvasAbottom');

        if (!miniCanvasAtop || !miniCanvasAleft || !miniCanvasAright || !miniCanvasAbottom) {
            console.warn('miniCanvasHandlers: some canvas elements not found.');
            return;
        }

        // Top
        miniCanvasAtop.addEventListener('mouseleave', () => {
            gsap.to({ pos: centerY_top }, {
                duration: 0.5,
                pos: centerY_top,
                ease: getEase(),
                onUpdate() {
                    drawArrowFromTop(this.targets()[0].pos);
                }
            });
        });

        // Left
        miniCanvasAleft.addEventListener('mouseleave', () => {
            gsap.to({ pos: centerX_left }, {
                duration: 0.5,
                pos: centerX_left,
                ease: getEase(),
                onUpdate() {
                    drawArrow(ctxAleft, this.targets()[0].pos, centerY_left);
                }
            });
        });

        // Right
        miniCanvasAright.addEventListener('mouseleave', () => {
            gsap.to({ pos: centerX_right }, {
                duration: 0.5,
                pos: centerX_right,
                ease: getEase(),
                onUpdate() {
                    drawArrowFromRight(this.targets()[0].pos);
                }
            });
        });

        // Bottom
        miniCanvasAbottom.addEventListener('mouseleave', () => {
            gsap.to({ pos: centerY_bottom }, {
                duration: 0.5,
                pos: centerY_bottom,
                ease: getEase(),
                onUpdate() {
                    drawArrowFromBottom(this.targets()[0].pos);
                }
            });
        });
    }

    // expose it globally
    window.initMiniCanvasHandlers = initMiniCanvasHandlers;

    // optionally auto-init on DOMContentLoaded here too:
    // document.addEventListener('DOMContentLoaded', initMiniCanvasHandlers);

})(window, document, gsap);

function animateImage(condition) {
    const startX = parseInt(document.getElementById("imageStartX").value);
    const startY = parseInt(document.getElementById("imageStartY").value);
    const endX = parseInt(document.getElementById("imageEndX").value);
    const endY = parseInt(document.getElementById("imageEndY").value);
    const animationType = $("#hdnTextAnimationType").val();

    if (animationType === "linear") {
        gsap.to(imagePosition, {
            x: endX,
            y: endY,
            duration: 2,
            ease: "power1.inOut",
            onUpdate: function () { drawText(); },
        });
    } else if (animationType === "elastic") {
        gsap.to(imagePosition, {
            x: endX,
            y: endY,
            duration: 2.5,
            ease: "elastic.out(1, 0.3)",
            onUpdate: function () { drawText(); },
        });
    } else if (animationType === "spin") {
        let angle = 0;
        gsap.ticker.add(() => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.translate(imagePosition.x + 75, imagePosition.y + 75); // Center of image
            ctx.rotate(angle);
            ctx.drawImage(image, -75, -75, 150, 150);
            ctx.restore();
            angle += 0.05;
        });
    } else if (animationType === "fade-in") {
        gsap.fromTo(
            imagePosition,
            { opacity: 0, x: startX, y: startY },
            {
                opacity: 1,
                x: endX,
                y: endY,
                duration: 2,
                ease: "power2.out",
                onUpdate: function () { drawText(); },
            }
        );
    } else if (animationType === "zoom-in") {
        gsap.fromTo(
            imagePosition,
            { scale: 0, x: startX, y: startY },
            {
                scale: 1,
                x: endX,
                y: endY,
                duration: 2,
                ease: "power2.inOut",
                onUpdate: function () { drawText(); },
            }
        );
    } else if (animationType === "bounce") {
        gsap.to(imagePosition, {
            x: endX,
            y: endY,
            duration: 2,
            ease: "bounce.out",
            onUpdate: function () { drawText(); },
        });
    } else if (animationType === "path") {
        gsap.to(imagePosition, {
            duration: 10,
            motionPath: {
                path: [
                    { x: startX, y: startY },
                    { x: (startX + endX) / 2, y: startY - 100 },
                    { x: endX, y: endY },
                ],
                autoRotate: true,
            },
            ease: "power2.inOut",
            onUpdate: function () { drawText(); },
        });
    } else if (animationType === "flip") {
        gsap.fromTo(
            imagePosition,
            { rotationY: 0, x: startX, y: startY },
            {
                rotationY: 180,
                x: endX,
                y: endY,
                duration: 2,
                ease: "power2.inOut",
                onUpdate: function () { drawText(); },
            }
        );
    } else if (animationType === "blur") {
        gsap.to(imagePosition, {
            x: endX,
            y: endY,
            duration: 2,
            ease: "power2.out",
            onUpdate: () => {
                ctx.filter = "blur(5px)";
                drawText();
            },
            onComplete: () => {
                ctx.filter = "none";
                drawText();
            },
        });
    }
    else if (animationType === "zoomImage") {
        gsap.fromTo(
            imagePosition,
            { scaleX: 0, scaleY: 0, x: startX, y: startY },
            {
                scaleX: 1,
                scaleY: 1,
                x: endX,
                y: endY,
                duration: 2,
                ease: "power2.out",
                onUpdate: function () { drawText(); },
            }
        );

    }
    else if (animationType === "pathMotion") {
        gsap.to(imagePosition, {
            duration: 5,
            ease: "power1.inOut",
            motionPath: {
                path: [{ x: 50, y: 200 }, { x: 150, y: 100 }, { x: 250, y: 300 }, { x: 100, y: 20 }],
                curviness: 1.5,
                autoRotate: true,
            },
            onUpdate: function () { drawText(); },
        });


    }
}


// Apply Animations
function applyAnimations(direction, conditionvalue) {
    // Reset text and image positions
    //textPosition.x = parseInt(document.getElementById("textStartX").value);
    //textPosition.y = parseInt(document.getElementById("textStartY").value);
    imagePosition.x = parseInt(document.getElementById("imageStartX").value);
    imagePosition.y = parseInt(document.getElementById("imageStartY").value);
    // Start recording before starting your GSAP animation
    // recorder.start();
    const bgColor = $("#hdnBackgroundSpecificColor").val();
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    //drawCanvas(conditionvalue);
    drawText();
    animateText(direction, conditionvalue, parseInt($("#hdnlLoopControl").val()) || 1);
    animateImage(conditionvalue);


    // Later, when you want to stop recording (e.g., after the animation completes)
    //setTimeout(() => {
    //    recorder.stop();
    //}, 4000);
}
// Save Canvas State
function saveCanvasState() {
    const canvasState = {
        text: {
            content: text,
            startX: parseInt(document.getElementById("textStartX").value),
            startY: parseInt(document.getElementById("textStartY").value),
            endX: parseInt(document.getElementById("textEndX").value),
            endY: parseInt(document.getElementById("textEndY").value),
            animation: document.getElementById("textAnimation").value,
            fontSize: document.getElementById("fontSize").value, // Save font size
            fontFamily: document.getElementById("fontFamily").value, // Save font family
            textColor: document.getElementById("textColor").value, // Save text color
            textAlign: document.getElementById("textAlign").value, // Save text alignment
        },
        image: {
            startX: parseInt(document.getElementById("imageStartX").value),
            startY: parseInt(document.getElementById("imageStartY").value),
            endX: parseInt(document.getElementById("imageEndX").value),
            endY: parseInt(document.getElementById("imageEndY").value),
            animation: document.getElementById("imageAnimation").value,
            imageSrc: image ? image.src : "https://thumbs.dreamstime.com/z/nature-background-water-lotus-flower-space-your-text-327414585.jpg?w=992",
        },
    };
    document.getElementById("output").textContent = JSON.stringify(canvasState, null, 2);
    return canvasState;
}
// Load Canvas State
function loadCanvasState(state) {
    // Load text
    const textState = state.text;
    document.getElementById("textInput").value = textState.content;
    document.getElementById("textStartX").value = textState.startX;
    document.getElementById("textStartY").value = textState.startY;
    document.getElementById("textEndX").value = textState.endX;
    document.getElementById("textEndY").value = textState.endY;
    document.getElementById("textAnimation").value = textState.animation;

    text = textState.content;
    textPosition.x = textState.startX;
    textPosition.y = textState.startY;
    $("#fontSize").val(textState.fontSize);
    $("#fontFamily").val(textState.fontFamily);
    $("#textColor").val(textState.textColor);
    $("#textAlign").val(textState.textAlign);

    // Load image
    const imageState = state.image;
    document.getElementById("imageStartX").value = imageState.startX;
    document.getElementById("imageStartY").value = imageState.startY;
    document.getElementById("imageEndX").value = imageState.endX;
    document.getElementById("imageEndY").value = imageState.endY;
    document.getElementById("imageAnimation").value = imageState.animation;

    imagePosition.x = imageState.startX;
    imagePosition.y = imageState.startY;
    if (imageState.imageSrc) {
        const img = new Image();
        img.onload = function () {
            image = img; // Set the image
            drawCanvas(); // Redraw the canvas with the loaded image
        };
        // img.src = imageState.imageSrc; // Set the image source from the JSON
        if (imageState.imageSrc) {
            loadImage(imageState.imageSrc); // Call loadImage to handle image loading
        }

    }
    drawCanvas();
    applyAnimations();
}
function loadImage(src) {
    const img = new Image();
    img.crossOrigin = "anonymous"; // Allow cross-origin image loading
    img.onload = function () {
        image = img;
        drawCanvas(); // Redraw the canvas with the loaded image
    };
    img.src = src; // Set the image source from the JSON
}




function ShowAnimationOption() {
    document.getElementById("imageCoordinationforBounce").style.display = "block";
}
function setCoordinate(clickedElement, direction, imageStartX, imageStartY, imageEndX, imageEndY, from) {
    // Get the container using its ID.
    var ulDirection = document.getElementById("uldirection");
    if (from == 'In') {
        $("#hdnslideDedirection").val(direction);
        if (activeSlide === 1) {
            $("#hdnDirectiontSlide1").val(direction);
        }
        else if (activeSlide === 2) {
            $("#hdnDirectiontSlide2").val(direction);
        }
        else if (activeSlide === 3) {
            $("#hdnDirectiontSlide3").val(direction);
        }
    }
    if (from == 'Out') {
        if (activeSlide === 1) {
            $("#hdnOutDirectiontSlide1").val(direction);
        }
        else if (activeSlide === 2) {
            $("#hdnOutDirectiontSlide2").val(direction);
        }
        else if (activeSlide === 3) {
            $("#hdnOutDirectiontSlide3").val(direction);
        }
    }
    // Find the closest container wrapping the <a>
    var container = clickedElement.closest('div.btn-canvas-container');
    // From that container, select the first <a> element.
    var targetLink = container ? container.querySelector("canvas") : null;

    if (targetLink) {
        // Remove the active_effect class from all <a> elements in the ul.
        var links = document.getElementById("uldirection").getElementsByTagName("canvas");
        for (var i = 0; i < links.length; i++) {
            links[i].classList.remove("active_effect");
        }
        // Add the active_effect class to the target link.
        clickedElement.classList.add("active_effect");
    }


    textObjects.forEach(o => o.selected = false);
    images.forEach(img => img.selected = false);
    if ($("#hdnEffectSlide1").val() == "") {
        $("#hdnTextAnimationType").val('delaylinear');
        animationMode = "delaylinear";
        $("#hdnEffectSlide1").val('delaylinear');
        $("#hdnOutEffectSlide1").val('delaylinear');

        $("#hdnDirectiontSlide1").val('left');
        $("#hdnOutDirectiontSlide1").val('left');

        $('#aleft').addClass('active_effect');
        $('#oleft').addClass('active_effect');
    }
    if ($("#hdnDirectiontSlide1").val() == "") {

        $("#hdnDirectiontSlide1").val('left');
        $("#hdnOutDirectiontSlide1").val('left');

        $('#aleft').addClass('active_effect');
        $('#oleft').addClass('active_effect');
    }

    document.getElementById("imageStartX").value = imageStartX;
    document.getElementById("imageStartY").value = imageStartY;
    document.getElementById("imageEndX").value = imageEndX;
    document.getElementById("imageEndY").value = imageEndY;
    // document.getElementById("imageAnimation").value = $("#imageAnimation option:selected").val();
    applyAnimations(direction, 'applyAnimations');
    //// Start recording before starting your GSAP animation
    //recorder.start();

    //// Later, when you want to stop recording (e.g., after the animation completes)
    //setTimeout(() => {
    //    recorder.stop();
    //}, 4000);
}
//else {
//    //alert('Please select Text Animation')
//    MessageShow('', 'Please select text Animation', 'error');
//}

//}



//recorder.onstop = () => {
//    const blob = new Blob(chunks, { type: 'video/mp4;codecs=vp9' });
//    const url = URL.createObjectURL(blob);
//    const formData = new FormData();
//    formData.append('video', blob, 'animation.mp4');
//    //// Use this URL to download or replay the animation video
//    //const a = document.createElement('a');
//    //a.href = url;
//    //a.download = 'animation.mp4';
//    //a.click();

//    // Set video source to recorded video
//    const videoPlayer = document.getElementById('miniPlayer');
//    videoPlayer.src = url;
//    videoPlayer.play();
//    console.log(url);

//    fetch('/api/video/save-video', {
//        method: 'POST',
//        body: formData
//    })
//        .then(response => response.json())
//        .then(data => {
//            console.log('Video saved successfully:', data);
//            // You can now update your mini player or UI as needed.
//        })
//        .catch(error => {
//            console.error('Error saving video:', error);
//        });
//};
// Start Recording
function startRecording() {
    let stream = canvas.captureStream(30); // 30 FPS
    mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });

    mediaRecorder.ondataavailable = (event) => recordedChunks.push(event.data);
    mediaRecorder.start();

    console.log("Recording started...");
    loadNextJson();
}
function startVideoCapture() {
    const stream = canvas.captureStream(30); // Capture 30 fps from the canvas

    const recorder = new MediaRecorder(stream);
    const chunks = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/mp4' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'animation.mp4';
        a.click();
    };

    // Start recording the stream
    recorder.start();

    // Stop recording after 5 seconds (or when the animation ends)
    setTimeout(() => {
        recorder.stop();
    }, 8000); // Record for 5 seconds (change as needed)
}


// Add a new text object with default text
function addDefaultTextOld() {
    const newObj = {
        text: "Default Text",
        x: 92,
        y: 100,
        //boundingWidth: 200,
        //boundingHeight: 60,
        selected: false,
        editing: false,
        fontFamily: "Arial",     // Default font family
        textColor: "#000000",    // Default text color (black)
        textAlign: "left",        // Default text alignment
        fontSize: 30
    };
    // Set the canvas font for accurate measurement.
    ctx.font = `${newObj.fontSize}px ${newObj.fontFamily}`;
    const metrics = ctx.measureText(newObj.text);
    const width = metrics.width;
    // Use actual bounding box values if available; otherwise, use a multiplier.
    const ascent = metrics.actualBoundingBoxAscent || newObj.fontSize * 0.8;
    const descent = metrics.actualBoundingBoxDescent || newObj.fontSize * 0.2;
    const height = ascent + descent;

    // Set bounding dimensions based on measured values.
    const offsetX = 15;  // adjust if needed
    const offsetY = 20;  // adjust if needed
    newObj.boundingWidth = width + offsetX;
    newObj.boundingHeight = height + offsetY;


    // Deselect all, then add and select the new object
    textObjects.forEach(obj => obj.selected = false);
    newObj.selected = true;
    textObjects.push(newObj);
    drawCanvas('Common');
    $("#opengl_popup").hide();
}
function addDefaultTextNew() {
    images.forEach(img => img.selected = false);
    const fs = 30;
    const factor = 1.2;        // 120% of fontSize
    const buttons = document.querySelectorAll('.toggle-btn');
    const graphicBtn = document.querySelector('.toggle-btn[data-mode="graphic"]');
    const text = "Default Text";
    // 2) Clear `active` from all
    buttons.forEach(b => b.classList.remove('active'));

    // 3) Activate only the Graphic button
    graphicBtn.classList.add('active');
    // 1) Create with defaults
    const newObj = {
        text,
        x: 92,
        y: 100,
        selected: false,
        editing: false,
        fontFamily: "Arial",
        textColor: "#000000",
        textAlign: "left",
        fontSize: fs,

        // store only the factor
        lineSpacing: factor,

        // bounding box placeholders—will be set below
        boundingWidth: 0,
        boundingHeight: 0,
        noAnim: false,
        groupId: null,
        rotation: 0,
        isBold: false,
        isItalic: false,
        type: 'text',
        zIndex: getNextZIndex(),
        opacity: 100
    };

    // 2) Measure it
    ctx.font = `${newObj.fontSize}px ${newObj.fontFamily}`;
    const metrics = ctx.measureText(text);
    const width = metrics.width;
    const ascent = metrics.actualBoundingBoxAscent || fs * 0.8;
    const descent = metrics.actualBoundingBoxDescent || fs * 0.2;
    const height = ascent + descent;

    // 3) Tiny padding around
    const offsetX = 20;
    const offsetY = 25;

    // 4) Assign your bounding dimensions
    newObj.boundingWidth = width + offsetX;
    newObj.boundingHeight = height + offsetY;

    // 5) Make it the only selected object
    textObjects.forEach(o => o.selected = false);
    newObj.selected = true;
    textObjects.push(newObj);

    // 6) Redraw
    drawCanvas('Common');
    $("#opengl_popup").hide();
    $("#elementsPopup").hide();
}

// ─── 2) Clone helpers ────────────────────────────────────────────────
function cloneTextObject(srcObj) {
    return {
        x: srcObj.x,
        y: srcObj.y,
        text: srcObj.text,
        fontSize: srcObj.fontSize,
        fontFamily: srcObj.fontFamily,
        isBold: srcObj.isBold,
        isItalic: srcObj.isItalic,
        textColor: srcObj.textColor,
        lineSpacing: srcObj.lineSpacing,
        textAlign: srcObj.textAlign,
        boundingWidth: srcObj.boundingWidth,
        boundingHeight: srcObj.boundingHeight,
        opacity: srcObj.opacity,
        rotation: srcObj.rotation,
        selected: false,
        zIndex: getNextZIndex(),
        type: 'text',

        // Copy any other fields you need...
    };
}

function cloneImageObject(srcObj) {
    return {
        x: srcObj.x,
        y: srcObj.y,
        width: srcObj.width,
        height: srcObj.height,
        scaleX: srcObj.scaleX,
        scaleY: srcObj.scaleY,
        src: srcObj.src,
        svgData: srcObj.svgData,
        opacity: srcObj.opacity,
        rotation: srcObj.rotation,
        img: null,      // will reload from `src` during draw
        selected: false,
        zIndex: getNextZIndex(),
        type: 'image',
        fillNoColorStatus: srcObj.fillNoColorStatus || false,
        strokeNoColorStatus: srcObj.strokeNoColorStatus || false,
        fillNoColor: srcObj.fillNoColor || "#FFFFFF",
        strokeNoColor: srcObj.strokeNoColor || "#FFFFFF",
        strokeWidth: srcObj.strokeWidth || 0.1,
        isBasic: srcObj.isBasic,
        isLINESvg: srcObj.isLine,
        curvature: srcObj.curvature || 0,
        basicName: srcObj.basicName || ''
        // Copy any other custom fields if needed...
    };
}
// ─── 3) Copy / Paste menu handlers ───────────────────────────────────
const copyOption = document.getElementById('copyOption');
const pasteOption = document.getElementById('pasteOption');

copyOption.addEventListener('click', () => {
    // Find all currently selected items
    const selectedTexts = textObjects.filter(obj => obj.selected);
    const selectedImages = images.filter(img => img.selected);

    // If nothing is selected, do nothing
    if (selectedTexts.length === 0 && selectedImages.length === 0) {
        return;
    }

    // Clear previous clipboard
    canvasClipboard.textItems = [];
    canvasClipboard.imageItems = [];

    // Deep-clone each selected object into clipboard
    selectedTexts.forEach(txt => {
        canvasClipboard.textItems.push(cloneTextObject(txt));
    });
    selectedImages.forEach(img => {
        canvasClipboard.imageItems.push(cloneImageObject(img));
    });

    // (Optional) give user feedback: e.g. flash “Copied” somewhere
});

function cloneTextObject(src) {
    // list all properties your renderer uses
    const fields = [
        "type", "x", "y", "width", "height", "scaleX", "scaleY", "rotate", "opacity",
        "text", "html", "fontFamily", "fontSize", "fontWeight", "fontStyle", "textColor",
        "align", "lineHeight", "letterSpacing", "wrap", "whiteSpace", "padding",
        "strokeColor", "strokeWidth", "bgColor", "zIndex", "groupId", "noAnim"
    ];
    const o = {};
    fields.forEach(k => { if (k in src) o[k] = structuredClone(src[k]); });

    // give pasted item a fresh id if you track ids
    o.id = crypto.randomUUID ? crypto.randomUUID() : ("id_" + Math.random().toString(36).slice(2));
    return o;
}
// define once, early in app boot
window.renderScene = function () {
    // schedule on next frame to coalesce multiple calls
    requestAnimationFrame(() => {
        if (typeof drawText === "function") {
            drawText();               // your existing full repaint
        } else {
            // optional: minimal safe fallback
            const c = document.getElementById("myCanvas");
            if (!c) return;
            const ctx = c.getContext("2d");
            ctx.clearRect(0, 0, c.width, c.height);
        }
    });
};
function cloneImageObject(src) {
    const fields = [
        "type", "x", "y", "width", "height", "scaleX", "scaleY", "rotate", "opacity",
        "zIndex", "groupId", "noAnim", "crop", "flipX", "flipY", "src", "isBasic", "isLINESvg","basicName" // keep a plain src string if you have it
    ];
    const o = {};
    fields.forEach(k => { if (k in src) o[k] = structuredClone(src[k]); });

    // ensure we have a drawable bitmap
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src.src || (src.img && src.img.src) || "";
    o.img = img;

    // optional: keep natural dims if width/height missing
    img.onload = () => {
        if (!o.width) o.width = img.naturalWidth;
        if (!o.height) o.height = img.naturalHeight;
        renderScene(); // redraw when the image finishes loading
    };

    // fresh id
    o.id = crypto.randomUUID ? crypto.randomUUID() : ("img_" + Math.random().toString(36).slice(2));
    return o;
}
pasteOption.addEventListener('click', pasteFromClipboard);

function pasteFromClipboard() {
    if (
        canvasClipboard.textItems.length === 0 &&
        canvasClipboard.imageItems.length === 0
    ) return;

    // clear selection & editing state
    isEditing = false;
    activeBox = null;
    if (textEditorNew) textEditorNew.style.display = "none";
    textObjects.forEach(o => o.selected = false);
    images.forEach(o => o.selected = false);

    // current top z
    const all = [...textObjects, ...images];
    let zTop = all.reduce((m, it) => Math.max(m, it.zIndex || 0), 0);

    // ✅ NO OFFSET
    // const dx = 12, dy = 12;  // ❌ remove/ignore

    // TEXTS
    canvasClipboard.textItems.forEach(orig => {
        const pasted = cloneTextObject(orig);

        // ✅ exact same position (coerce to numbers so "123" doesn't round weirdly)
        pasted.x = Number(orig.x) || 0;
        pasted.y = Number(orig.y) || 0;

        // keep size (guard zero)
        if (!pasted.width || pasted.width < 5) pasted.width = orig.width || 200;
        if (!pasted.height || pasted.height < 5) pasted.height = orig.height || 50;

        // keep transform
        pasted.rotation = orig.rotation || 0;
        pasted.scaleX = (orig.scaleX != null) ? orig.scaleX : 1;
        pasted.scaleY = (orig.scaleY != null) ? orig.scaleY : 1;
        if (orig.anchorX != null) pasted.anchorX = orig.anchorX;
        if (orig.anchorY != null) pasted.anchorY = orig.anchorY;

        pasted.wrap = (orig.wrap !== undefined) ? orig.wrap : true;
        pasted.whiteSpace = orig.whiteSpace || "normal";

        pasted.selected = true;
        pasted.zIndex = ++zTop;          // just above the original (and above anything below it)
        textObjects.push(pasted);
    });

    // IMAGES
    canvasClipboard.imageItems.forEach(orig => {
        const pasted = cloneImageObject(orig);

        // ✅ exact same position
        pasted.x = Number(orig.x) || 0;
        pasted.y = Number(orig.y) || 0;

        // keep transform
        pasted.rotation = orig.rotation || 0;
        pasted.scaleX = (orig.scaleX != null) ? orig.scaleX : 1;
        pasted.scaleY = (orig.scaleY != null) ? orig.scaleY : 1;
        if (orig.anchorX != null) pasted.anchorX = orig.anchorX;
        if (orig.anchorY != null) pasted.anchorY = orig.anchorY;

        pasted.selected = true;
        pasted.zIndex = ++zTop;
        images.push(pasted);
    });

    // redraw EVERYTHING (your drawText already draws bg + images + texts)
    drawText();
}




// ─── 5) Keyboard shortcuts (Ctrl+C/Cmd+C, Ctrl+V/Cmd+V) ─────────────────────────
window.addEventListener('keydown', (e) => {
    const isCopy = (e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C');
    const isPaste = (e.ctrlKey || e.metaKey) && (e.key === 'v' || e.key === 'V');

    const activeEl = document.activeElement;
    const isEditable = activeEl && (
        activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA' ||
        activeEl.isContentEditable
    );

    if (!isEditable) {
        if (isCopy) {
            e.preventDefault();
            copyOption.click();  // your custom copy
        }
        if (isPaste) {
            e.preventDefault();
            pasteFromClipboard(); // your custom paste
        }
    }
});


// Utility: Check if point (x, y) is within the bounding box of a text object
function isWithinText(obj, x, y) {
    ctx.font = `${fontSize}px ${fontFamily}`;
    const textWidth = ctx.measureText(obj.text).width;
    return (x >= obj.x && x <= obj.x + textWidth &&
        y >= obj.y - fontSize && y <= obj.y);
}

// Return the topmost text object at position (x, y) (if any)
function getTextObjectAt(x, y) {
    for (let obj of textObjects) {
        const boxX = obj.x - padding;
        const boxY = obj.y - padding;
        const boxWidth = obj.boundingWidth + 2 * padding;
        const boxHeight = obj.boundingHeight + 2 * padding;

        if (x >= boxX && x <= boxX + boxWidth && y >= boxY && y <= boxY + boxHeight) {
            return obj;
        }
    }
    return null;
}
// Returns an array of handle positions for a given image object

// 2) Your existing handle generator stays the same:
function getImageResizeHandles(img) {
    const sx = img.scaleX || 1, sy = img.scaleY || 1;
    const w = img.width * sx, h = img.height * sy;
    const x0 = img.x, y0 = img.y;
    const x1 = x0 + w, y1 = y0 + h;

    // **these are the exact corner points** in design space
    return [
        { name: "top-left", x: x0, y: y0 },
        { name: "top-right", x: x1, y: y0 },
        { name: "bottom-left", x: x0, y: y1 },
        { name: "bottom-right", x: x1, y: y1 },
    ];
}

// 3) Swap in this smoother hit‑test:
function getHandleUnderMouseForImage(imgObj, pos) {
    const handles = getImageResizeHandles(imgObj);

    for (let h of handles) {
        // handle center in design space:
        const cx = h.x + HANDLE_SIZE / 2;
        const cy = h.y + HANDLE_SIZE / 2;

        // if mouse is within a circle of radius HANDLE_HIT_RADIUS
        const dx = pos.x - cx;
        const dy = pos.y - cy;
        if (dx * dx + dy * dy <= HANDLE_HIT_RADIUS * HANDLE_HIT_RADIUS) {
            return h.name;
        }
    }
    return null;
}


// Check if the mouse is over an image (returns the image object or null)
//function isMouseOverImage(imageObj, pos) {
//    const w = imageObj.width * imageObj.scaleX;
//    const h = imageObj.height * imageObj.scaleY;
//    return (
//        pos.x >= imageObj.x &&
//        pos.x <= imageObj.x + w &&
//        pos.y >= imageObj.y &&
//        pos.y <= imageObj.y + h
//    );
//}
function isMouseOverImage(img, pos) {
    // --- effective size (handle both "already scaled" and "raw×scale" models)
    const sx = Number(img.scaleX ?? 1);
    const sy = Number(img.scaleY ?? 1);

    // Many editors store width/height as the on-screen size already.
    // We'll try both interpretations and accept a hit if either matches.
    const wA = Number(img.width ?? 0);            // assume already scaled
    const hA = Number(img.height ?? 0);
    const wB = wA * sx;                             // assume raw; apply scale
    const hB = hA * sy;

    // Allow small padding (e.g., stroke) so clicks near edge still count
    const pad = Number(img.hitPad ?? img.strokeWidth ?? 0) * 0.5;

    // helper: point-in-rotated-rect around center
    function hitWithSize(w, h) {
        const cx = img.x + w / 2;
        const cy = img.y + h / 2;

        const dx = pos.x - cx;
        const dy = pos.y - cy;

        const rad = -Number(img.rotation || 0) * Math.PI / 180;
        const cos = Math.cos(rad), sin = Math.sin(rad);
        const lx = dx * cos - dy * sin;
        const ly = dx * sin + dy * cos;

        const hw = w / 2 + pad;
        const hh = h / 2 + pad;
        return (lx >= -hw && lx <= hw && ly >= -hh && ly <= hh);
    }

    // Try A (width/height already scaled). If miss, try B (raw×scale)
    return hitWithSize(wA, hA) || hitWithSize(wB, hB);
}


function isMouseOverImageNewOLD(imgObj, pos) {
    const sx = (typeof imgObj.scaleX === 'number') ? imgObj.scaleX : 1;
    const sy = (typeof imgObj.scaleY === 'number') ? imgObj.scaleY : 1;
    const w = imgObj.width * sx;
    const h = imgObj.height * sy;

    return (
        pos.x >= imgObj.x &&
        pos.x <= imgObj.x + w &&
        pos.y >= imgObj.y &&
        pos.y <= imgObj.y + h
    );
}

// Working canvas code with multi-resize and centered text positioning
// Assumes existing helpers: getTextObjectAt, getHandleUnderMouse, getHandleUnderMouseForImage,
// isInsideBox, drawCanvas, SaveDesignBoard, enableFillColorDiv, enableStrockColorDiv

//let resizeState = null;

// Working canvas code with multi-resize and centered text positioning
// Assumes existing helpers: getTextObjectAt, getHandleUnderMouse, getHandleUnderMouseForImage,
// isInsideBox, drawCanvas, SaveDesignBoard, enableFillColorDiv, enableStrockColorDiv


// Full canvas interaction with multi-resize and centered text positioning
// Assumes helpers: getTextObjectAt, getHandleUnderMouse, getHandleUnderMouseForImage,
// isInsideBox, drawCanvas, SaveDesignBoard, enableFillColorDiv, enableStrockColorDiv

function rotateSelectedItems(degrees) {
    const rad = degrees * Math.PI / 180;

    // Update rotation for selected text
    textObjects.forEach(obj => {
        if (obj.selected) {
            obj.rotation = rad;
        }
    });

    // Update rotation for selected images
    images.forEach(img => {
        if (img.selected) {
            img.rotation = rad;
        }
    });

    drawCanvas('Common');
}

/**
 * Returns true if (mouseX, mouseY) lies inside the rotated text object's bounding box.
 * txt.x/y is the top‐left of the unrotated box; txt.boundingWidth/Height are its unrotated dimensions.
 */
function isInsideRotatedBox(mouseX, mouseY, txt) {
    // 1) Grab width/height
    const w = txt.boundingWidth;
    const h = txt.boundingHeight;

    // 2) Compute center of that unrotated box
    //    (top-left + half width/height)
    const cx = txt.x + w / 2;
    const cy = txt.y + h / 2;

    // 3) Convert rotation° to radians, then invert (−θ) to “undo” rotation
    const θ = -(txt.rotation || 0) * Math.PI / 180;

    // 4) Translate the mouse point into the text’s local coordinate frame
    const dx = mouseX - cx;
    const dy = mouseY - cy;

    // 5) Apply the “undo rotation” matrix
    const localX = dx * Math.cos(θ) - dy * Math.sin(θ);
    const localY = dx * Math.sin(θ) + dy * Math.cos(θ);

    // 6) Check if (localX, localY) lies inside the unrotated [−w/2, +w/2]×[−h/2, +h/2]
    return (
        localX >= -w / 2 &&
        localX <= w / 2 &&
        localY >= -h / 2 &&
        localY <= h / 2
    );
}

/**
 * Returns true if (mouseX, mouseY) lies inside the rotated image object.
 * img.x/y is the top‐left of the unrotated, unscaled image.
 * img.width/height are intrinsic; img.scaleX/scaleY default to 1 if missing.
 */
function isInsideRotatedImageOLD(mouseX, mouseY, imgObj) {
    // 1) Compute the on-canvas width/height after scaling:
    const sx = (typeof imgObj.scaleX === 'number' && !isNaN(imgObj.scaleX)) ? imgObj.scaleX : 1;
    const sy = (typeof imgObj.scaleY === 'number' && !isNaN(imgObj.scaleY)) ? imgObj.scaleY : 1;
    const w = imgObj.width * sx;
    const h = imgObj.height * sy;

    // 2) Compute the image’s center (in screen coordinates):
    //    Since x/y is top-left, the center is x + w/2, y + h/2
    const cx = imgObj.x + w / 2;
    const cy = imgObj.y + h / 2;

    // 3) Convert rotation (in degrees) into radians, then negate to "undo"
    const θ = -(imgObj.rotation || 0) * Math.PI / 180;

    // 4) Translate the mouse point into the image’s local (unrotated) frame
    const dx = mouseX - cx;
    const dy = mouseY - cy;

    // 5) Apply the inverse rotation matrix:
    const localX = dx * Math.cos(θ) - dy * Math.sin(θ);
    const localY = dx * Math.sin(θ) + dy * Math.cos(θ);

    // 6) Now check if (localX, localY) is inside the axis-aligned rectangle
    //    that spans from (−w/2, −h/2) to (+w/2, +h/2).
    const halfW = w / 2;
    const halfH = h / 2;

    // Optional: small epsilon to handle edge cases
    const EPS = 0.5;
    return (
        localX >= -halfW - EPS &&
        localX <= halfW + EPS &&
        localY >= -halfH - EPS &&
        localY <= halfH + EPS
    );
}
/**
 * Returns one of:
 *   'top-left', 'top-right', 'bottom-left', 'bottom-right'  (corner)
 *   'left', 'right', 'top', 'bottom'                        (edge)
 *   null if none
 * for a rotated, scaled image under (mouseX, mouseY).
 */
function getImageHandleUnderMouse(mouseX, mouseY, img) {
    const sx = (typeof img.scaleX === 'number') ? img.scaleX : 1;
    const sy = (typeof img.scaleY === 'number') ? img.scaleY : 1;
    const w = img.width * sx;
    const h = img.height * sy;
    const cx = img.x + w / 2;
    const cy = img.y + h / 2;
    const θ = -(img.rotation || 0) * Math.PI / 180;

    const dx = mouseX - cx;
    const dy = mouseY - cy;
    const localX = dx * Math.cos(θ) - dy * Math.sin(θ);
    const localY = dx * Math.sin(θ) + dy * Math.cos(θ);

    // In local space, image spans [-w/2, +w/2] × [-h/2, +h/2]
    const lx = -w / 2, ly = -h / 2, rx = +w / 2, ry = +h / 2;
    const cornerTolerance = 10;
    const edgeTolerance = 6;

    // Corners
    const corners = [
        { x: lx, y: ly, name: 'top-left' },
        { x: rx, y: ly, name: 'top-right' },
        { x: lx, y: ry, name: 'bottom-left' },
        { x: rx, y: ry, name: 'bottom-right' }
    ];
    for (const c of corners) {
        if (Math.hypot(localX - c.x, localY - c.y) < cornerTolerance) {
            return c.name;
        }
    }
    // Vertical edges
    if ((Math.abs(localX - lx) < edgeTolerance || Math.abs(localX - rx) < edgeTolerance)
        && localY > ly + cornerTolerance && localY < ry - cornerTolerance) {
        return (Math.abs(localX - lx) < edgeTolerance) ? 'left' : 'right';
    }
    // Horizontal edges
    if ((Math.abs(localY - ly) < edgeTolerance || Math.abs(localY - ry) < edgeTolerance)
        && localX > lx + cornerTolerance && localX < rx - cornerTolerance) {
        return (Math.abs(localY - ly) < edgeTolerance) ? 'top' : 'bottom';
    }
    return null;
}

/**
 * Returns one of:
 *   'top-left', 'top-right', 'bottom-left', 'bottom-right'  (corner)
 *   'left', 'right', 'top', 'bottom'                        (edge)
 *   null if none
 * for a rotated text object under (mouseX, mouseY).
 */
function getTextHandleUnderMouse(mouseX, mouseY, txt) {
    const w = txt.boundingWidth;
    const h = txt.boundingHeight;
    const cx = txt.x + w / 2;
    const cy = txt.y + h / 2;
    const θ = -(txt.rotation || 0) * Math.PI / 180;

    const dx = mouseX - cx;
    const dy = mouseY - cy;
    const localX = dx * Math.cos(θ) - dy * Math.sin(θ);
    const localY = dx * Math.sin(θ) + dy * Math.cos(θ);

    // In local (unrotated) space, text box spans [-w/2, +w/2] × [-h/2, +h/2]
    const lx = -w / 2, ly = -h / 2, rx = +w / 2, ry = +h / 2;
    const cornerTolerance = 20; // pixels
    const edgeTolerance = 12; // pixels

    // Corners
    const corners = [
        { x: lx, y: ly, name: 'top-left' },
        { x: rx, y: ly, name: 'top-right' },
        { x: lx, y: ry, name: 'bottom-left' },
        { x: rx, y: ry, name: 'bottom-right' }
    ];
    for (const c of corners) {
        if (Math.hypot(localX - c.x, localY - c.y) < cornerTolerance) {
            return c.name;
        }
    }
    //// Vertical edges (not in corner zone)
    //if ((Math.abs(localX - lx) < edgeTolerance || Math.abs(localX - rx) < edgeTolerance)
    //    && localY > ly + cornerTolerance && localY < ry - cornerTolerance) {
    //    return (Math.abs(localX - lx) < edgeTolerance) ? 'left' : 'right';
    //}
    //// Horizontal edges
    //if ((Math.abs(localY - ly) < edgeTolerance || Math.abs(localY - ry) < edgeTolerance)
    //    && localX > lx + cornerTolerance && localX < rx - cornerTolerance) {
    //    return (Math.abs(localY - ly) < edgeTolerance) ? 'top' : 'bottom';
    //}
    return null;
}

/**
 * Returns true if (mouseX, mouseY) lies inside the rotated, scaled image object.
 * img.x/y = top‐left of the unrotated image.
 * img.width/height = intrinsic size.
 * img.scaleX/scaleY default to 1 if missing.
 * img.rotation in degrees.
 */
function isInsideRotatedImage(mouseX, mouseY, img) {
    const sx = (typeof img.scaleX === 'number') ? img.scaleX : 1;
    const sy = (typeof img.scaleY === 'number') ? img.scaleY : 1;
    const w = img.width * sx;
    const h = img.height * sy;
    const cx = img.x + w / 2;
    const cy = img.y + h / 2;
    const θ = -(img.rotation || 0) * Math.PI / 180;

    const dx = mouseX - cx;
    const dy = mouseY - cy;
    const localX = dx * Math.cos(θ) - dy * Math.sin(θ);
    const localY = dx * Math.sin(θ) + dy * Math.cos(θ);

    return (
        localX >= -w / 2 &&
        localX <= w / 2 &&
        localY >= -h / 2 &&
        localY <= h / 2
    );
}


/**
 * Returns true if (mouseX, mouseY) lies inside the rotated text object.
 * txt.x/y = top‐left of the unrotated text box.
 * txt.boundingWidth/Height = size of unrotated text box.
 * txt.rotation is in degrees.
 */
function isInsideRotatedText(mouseX, mouseY, txt) {
    const w = txt.boundingWidth;
    const h = txt.boundingHeight;
    const cx = txt.x + w / 2;
    const cy = txt.y + h / 2;
    const θ = -(txt.rotation || 0) * Math.PI / 180;

    const dx = mouseX - cx;
    const dy = mouseY - cy;
    const localX = dx * Math.cos(θ) - dy * Math.sin(θ);
    const localY = dx * Math.sin(θ) + dy * Math.cos(θ);

    return (
        localX >= -w / 2 &&
        localX <= w / 2 &&
        localY >= -h / 2 &&
        localY <= h / 2
    );
}




//function isInsideRotatedImage(mouseX, mouseY, imgObj) {
//    // 1) Compute the image’s on‐canvas width/height after scaling:
//    const sx = (typeof imgObj.scaleX === 'number') ? imgObj.scaleX : 1;
//    const sy = (typeof imgObj.scaleY === 'number') ? imgObj.scaleY : 1;
//    const w = imgObj.width * sx;
//    const h = imgObj.height * sy;

//    // 2) Find the center of the image (in screen coords):
//    //const centerX = imgObj.x + w / 2;
//    //const centerY = imgObj.y + h / 2;
//    const centerX = imgObj.x + w / 2;
//    const centerY = imgObj.y + h / 2;

//    // 3) Convert the rotation from degrees into a negative‐radian (to undo it):
//    const θ = -(imgObj.rotation || 0) * Math.PI / 180;

//    // 4) Translate the mouse point into the image’s local frame:
//    const dx = mouseX - centerX;
//    const dy = mouseY - centerY;

//    // 5) Apply the “undo rotation” to get localX/localY:
//    const localX = dx * Math.cos(θ) - dy * Math.sin(θ);
//    const localY = dx * Math.sin(θ) + dy * Math.cos(θ);

//    // 6) Finally, check if that local point lies inside the unrotated rectangle:
//    //    (−w/2 ≤ localX ≤ +w/2)  and  (−h/2 ≤ localY ≤ +h/2)
//    return (
//        localX >= -w / 2 &&
//        localX <= +w / 2 &&
//        localY >= -h / 2 &&
//        localY <= +h / 2
//    );
//}
////KD Need to be Include in project////////
//canvas.addEventListener("mousedown", e => {
//    const rect = canvas.getBoundingClientRect();
//    const mouseX = e.clientX - rect.left;
//    const mouseY = e.clientY - rect.top;
//    const shift = e.shiftKey;
//    if (document.activeElement === textEditor) return;

//    // ── 1) ROTATION HANDLE CHECK ─────────────────────────────────────
//    let hitRotate = null;
//    [...textObjects, ...images].forEach(obj => {
//        if (!obj.selected || !obj._rotateHandle) return;
//        const h = obj._rotateHandle; // { x, y, radius }
//        const dist = Math.hypot(mouseX - h.x, mouseY - h.y);
//        if (dist < h.radius) hitRotate = obj;
//    });
//    if (hitRotate) {
//        isRotating = true;
//        rotatingObject = hitRotate;
//        rotationStartAngle = Math.atan2(mouseY - hitRotate.y, mouseX - hitRotate.x);
//        rotationStartValue = hitRotate.rotation || 0;
//        e.preventDefault();
//        return;
//    }

//    // ── 2) HIT-TEST FOR TEXT AND IMAGE ───────────────────────────────
//    let txtHit = null;
//    for (let i = textObjects.length - 1; i >= 0; i--) {
//        if (isInsideRotatedText(mouseX, mouseY, textObjects[i])) {
//            txtHit = textObjects[i];
//            break;
//        }
//    }

//    let imgHit = null;
//    for (let i = images.length - 1; i >= 0; i--) {
//        if (isInsideRotatedImage(mouseX, mouseY, images[i])) {
//            imgHit = images[i];
//            break;
//        }
//    }

//    // ── 3) SHIFT-CLICK TOGGLE SELECTION ─────────────────────────────
//    if (shift) {
//        if (txtHit) {
//            toggleSelect(txtHit);
//            selectedForContextMenu = txtHit.selected ? txtHit : null;
//            selectedType = txtHit.selected ? "text" : null;
//        }
//        if (imgHit) {
//            toggleSelect(imgHit);
//            selectedForContextMenu = imgHit.selected ? imgHit : null;
//            selectedType = imgHit.selected ? "image" : null;
//        }
//        drawCanvas("Common");
//        return;
//    }

//    // ── 4) RESIZE HANDLE ON SELECTED OBJECT ──────────────────────────
//    let primary = null;
//    let handle;

//    if (txtHit && txtHit.selected) {
//        handle = getTextHandleUnderMouse(mouseX, mouseY, txtHit);
//        if (handle && !handle.includes("middle")) {
//            primary = { obj: txtHit, type: "text", handle };
//        }
//    }
//    if (!primary) {
//        for (let i = images.length - 1; i >= 0; i--) {
//            const img = images[i];
//            if (!img.selected) continue;
//            handle = getImageHandleUnderMouse(mouseX, mouseY, img);
//            if (handle) {
//                primary = { obj: img, type: "image", handle };
//                break;
//            }
//        }
//    }

//    // ── 5) COUNT SELECTED ITEMS ──────────────────────────────────────
//    const selectedCount =
//        textObjects.filter(o => o.selected).length +
//        images.filter(i => i.selected).length;

//    // Multi-resize or single-resize...
//    if (primary && selectedCount > 1) {
//        startMultiResize(primary.obj, e);
//        e.preventDefault();
//        return;
//    }
//    if (primary && selectedCount === 1) {
//        if (primary.type === "text") {
//            // Begin text resize: store starting width/height/font
//            isResizingText = true;
//            activeTextHandle = primary.handle;
//            activeText = primary.obj;
//            textResizeStart = {
//                mouseX: e.clientX,
//                mouseY: e.clientY,
//                origX: activeText.x,
//                origY: activeText.y,
//                origW: activeText.boundingWidth,
//                origH: activeText.boundingHeight,
//                origFont: activeText.fontSize
//            };
//            // STORE “start‐of‐drag” dims for text:
//            activeText._resizeStartW = activeText.boundingWidth;
//            activeText._resizeStartH = activeText.boundingHeight;
//            activeText._resizeStartFont = activeText.fontSize;
//        } else {
//            // Begin image resize: store starting on-canvas width/height & scale
//            isResizingImage = true;
//            activeImageHandle = primary.handle;
//            activeImage = primary.obj;

//            const startSX = (typeof activeImage.scaleX === 'number')
//                ? activeImage.scaleX : 1;
//            const startSY = (typeof activeImage.scaleY === 'number')
//                ? activeImage.scaleY : 1;

//            activeImage._resizeStartSX = startSX;
//            activeImage._resizeStartSY = startSY;
//            activeImage._resizeStartW = activeImage.width * startSX;
//            activeImage._resizeStartH = activeImage.height * startSY;
//        }
//        e.preventDefault();
//        drawCanvas("Common");
//        return;
//    }

//    // ── 6) GROUP-DRAG ────────────────────────────────────────────────
//    if ((txtHit && txtHit.selected) || (imgHit && imgHit.selected)) {
//        isDraggingGroup = true;
//        groupDragStart = { x: e.clientX, y: e.clientY };
//        groupStarts = [];
//        textObjects.filter(o => o.selected)
//            .forEach(o => groupStarts.push({ obj: o, x: o.x, y: o.y }));
//        images.filter(i => i.selected)
//            .forEach(i => groupStarts.push({ obj: i, x: i.x, y: i.y }));
//        e.preventDefault();
//        return;
//    }

//    // ── 7) DESELECT ALL BEFORE NEW SELECTION ─────────────────────────
//    textObjects.forEach(o => o.selected = false);
//    images.forEach(i => i.selected = false);
//    selectedForContextMenu = null;
//    selectedType = null;
//    activeText = activeImage = null;

//    // ── 8) CLICK-TO-SELECT TEXT ─────────────────────────────────────
//    if (txtHit) {
//        txtHit.selected = true;
//        selectedForContextMenu = txtHit;
//        selectedType = "text";
//        activeText = txtHit;
//        const angle = txtHit.rotation || 0;
//        rotationSlider.value = angle;
//        document.getElementById("rotationValue").textContent = angle + "°";
//        rotationBadge.textContent = angle;


//        var opacity = txtHit.opacity * 100 || 100;
//        if (opacity > 100) opacity = 100;
//        opacitySlider.value = opacity;
//        document.getElementById("opacityValue").textContent = opacity + "";
//        opacityBadge.textContent = opacity;

//        handle = getTextHandleUnderMouse(mouseX, mouseY, txtHit);
//        if (handle && !handle.includes("middle")) {
//            isResizingText = true;
//            activeTextHandle = handle;
//            textResizeStart = {
//                mouseX: e.clientX,
//                mouseY: e.clientY,
//                origX: txtHit.x,
//                origY: txtHit.y,
//                origW: txtHit.boundingWidth,
//                origH: txtHit.boundingHeight,
//                origFont: txtHit.fontSize
//            };
//            // Also store “start” values in case user rotates then drags again:
//            txtHit._resizeStartW = txtHit.boundingWidth;
//            txtHit._resizeStartH = txtHit.boundingHeight;
//            txtHit._resizeStartFont = txtHit.fontSize;
//        } else {
//            isDraggingText = true;
//            dragOffsetText = { x: mouseX - txtHit.x, y: mouseY - txtHit.y };
//        }

//        e.preventDefault();
//        drawCanvas("Common");
//        return;
//    }

//    // ── 9) CLICK-TO-SELECT IMAGE ────────────────────────────────────
//    if (imgHit) {
//        images.forEach(i => i.selected = false);
//        imgHit.selected = true;
//        selectedForContextMenu = imgHit;
//        selectedType = "image";
//        activeImage = imgHit;
//        const angle = imgHit.rotation || 0;
//        rotationSlider.value = angle;
//        document.getElementById("rotationValue").textContent = angle + "°";
//        rotationBadge.textContent = angle;

//        var opacity = imgHit.opacity * 100 || 100;
//        if (opacity > 100) opacity = 100;
//        opacitySlider.value = opacity;
//        document.getElementById("opacityValue").textContent = opacity + "";
//        opacityBadge.textContent = opacity;

//        isDraggingImage = true;
//        dragOffsetImage = { x: mouseX - imgHit.x, y: mouseY - imgHit.y };
//        enableFillColorDiv();
//        enableStrockColorDiv();

//        e.preventDefault();
//        drawCanvas("Common");
//        return;
//    }

//    //// ── 10) CLICKED EMPTY SPACE ─────────────────────────────────────
//    //textObjects.forEach(o => o.selected = false);
//    //images.forEach(i => i.selected = false);
//    //selectedForContextMenu = null;
//    //selectedType = null;
//    //activeText = activeImage = null;
//    //rotationSlider.value = 0;
//    //rotationBadge.textContent = "0";

//    //e.preventDefault();
//    //drawCanvas("Common");

//    // ── 10) CLICKED EMPTY SPACE ─────────────────────────────────────
//    const clickedEmpty =
//        !hitRotate &&
//        !txtHit &&
//        !imgHit &&
//        !primary;

//    if (clickedEmpty) {
//        // clear any existing selection
//        textObjects.forEach(o => o.selected = false);
//        images.forEach(i => i.selected = false);
//        selectedForContextMenu = null;
//        selectedType = null;
//        activeText = activeImage = null;
//        rotationSlider.value = 0;
//        rotationBadge.textContent = "0";

//        opacitySlider.value = 100;
//        opacityBadge.textContent = "100";


//        // begin drag-to-select
//        isDraggingSelectionBox = true;
//        const rect = canvas.getBoundingClientRect();
//        selectionStart = {
//            x: e.clientX - rect.left,
//            y: e.clientY - rect.top
//        };
//        selectionEnd = { ...selectionStart };

//        e.preventDefault();
//        drawCanvas("Common");
//        return;
//    }
//});








function drawRotateHandle(obj) {
    const ctx = canvas.getContext('2d');
    ctx.save();

    const isText = obj.text !== undefined;
    let handleX, handleY;

    if (isText) {
        // ── TEXT ROTATE HANDLE ──
        // 1) Find center of text‐box:
        const centerX = obj.x + obj.boundingWidth / 2;
        const centerY = obj.y + obj.boundingHeight / 2;

        // 2) Compute rotation in radians and a fixed offset:
        const angle = (obj.rotation || 0) * Math.PI / 180;
        const offset = 35;                       // “extra distance” beyond the text edge
        const halfH = obj.boundingHeight / 2;   // half the text’s height

        // 3) Total distance from center to handle = halfH + offset:
        const dist = halfH + offset;

        // 4) Place “dist” away from center, in the current “up” direction:
        handleX = centerX + dist * Math.sin(angle);
        handleY = centerY - dist * Math.cos(angle);

    } else {
        // ── IMAGE ROTATE HANDLE ──
        // 1) Compute scaled width/height and center:
        const scaleX = obj.scaleX || 1;
        const scaleY = obj.scaleY || 1;
        const w = (obj.width || 0) * scaleX;
        const h = (obj.height || 0) * scaleY;

        const centerX = obj.x + w / 2;
        const centerY = obj.y + h / 2;

        // 2) Compute rotation in radians and a fixed offset:
        const angle = (obj.rotation || 0) * Math.PI / 180;
        const offset = 35;  // “extra distance” beyond the image’s top edge
        const halfH = h / 2; // half the image’s height

        // 3) Total distance from center to handle = halfH + offset:
        const dist = halfH + offset;

        // 4) Place “dist” away from center, in the current “up” direction:
        handleX = centerX + dist * Math.sin(angle);
        handleY = centerY - dist * Math.cos(angle);
    }

    // ── DRAW CIRCLE HANDLE ──
    ctx.beginPath();
    ctx.arc(handleX, handleY, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#15cf91';
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();

    ctx.restore();

    // ── STORE FOR HIT‐TESTING ──
    obj._rotateHandle = {
        x: handleX,
        y: handleY,
        radius: 10
    };
}





// Mouseup
//canvas.addEventListener('mouseup', e => {
//    if (isResizingText && activeText && activeTextHandle) {
//        onBoxResizeEnd(activeText);
//    }

//    if (isDraggingGroup) {
//        isDraggingGroup = false;
//        //SaveDesignBoard();
//    }
//    if (isResizingText) {
//        isResizingText = false;
//        //SaveDesignBoard();
//    }
//    if (isResizingImage) {
//        isResizingImage = false;
//        //SaveDesignBoard();
//    }
//    if (isDraggingText) {
//        isDraggingText = false;
//        //SaveDesignBoard();
//    }
//    if (isDraggingImage) {
//        isDraggingImage = false;
//        //SaveDesignBoard();
//    }
//});

// Multi-resize helpers
function startMultiResize(primaryObj, e) {
    const group = [...textObjects.filter(o => o.selected), ...images.filter(i => i.selected)];
    const pW = primaryObj.boundingWidth ?? (primaryObj.width * (primaryObj.scaleX || 1));
    const pH = primaryObj.boundingHeight ?? (primaryObj.height * (primaryObj.scaleY || 1));
    const pivot = { x: primaryObj.x + pW / 2, y: primaryObj.y + pH / 2 };
    const startData = group.map(o => {
        const w = o.boundingWidth ?? (o.width * (o.scaleX || 1));
        const h = o.boundingHeight ?? (o.height * (o.scaleY || 1));
        return { obj: o, startW: w, startH: h, startFont: o.fontSize, dx: o.x + w / 2 - pivot.x, dy: o.y + h / 2 - pivot.y };
    });
    resizeState = { startMouseX: e.clientX, primaryStartW: pW, pivot, startData };
    window.addEventListener('mousemove', onMultiResizeMove);
    window.addEventListener('mouseup', onMultiResizeUp);
}

function onMultiResizeMove(e) {
    if (!resizeState) return;
    const { startMouseX, primaryStartW, pivot, startData } = resizeState;
    const scale = (primaryStartW + (e.clientX - startMouseX)) / primaryStartW;
    startData.forEach(d => {
        const { obj, startW, startH, startFont, dx, dy } = d;
        if (startFont != null) {
            obj.fontSize = startFont * scale;
            obj.boundingWidth = startW * scale;
            obj.boundingHeight = startH * scale;
        } else {
            obj.scaleX = (startW * scale) / obj.width;
            obj.scaleY = (startH * scale) / obj.height;
        }
        obj.x = pivot.x + dx * scale - (startW * scale) / 2;
        obj.y = pivot.y + dy * scale - (startH * scale) / 2;
    });
    drawCanvas('Common');
}

function onMultiResizeUp() {
    window.removeEventListener('mousemove', onMultiResizeMove);
    window.removeEventListener('mouseup', onMultiResizeUp);
    resizeState = null;
    // SaveDesignBoard();
}

// Helpers
/**
 * Returns the topmost (last‐drawn) text object under (mouseX, mouseY), or null if none.
 */
function findTextAt(mouseX, mouseY) {
    for (let i = textObjects.length - 1; i >= 0; i--) {
        const txt = textObjects[i];
        if (isInsideRotatedBox(mouseX, mouseY, txt)) {
            return txt;
        }
    }
    return null;
}

/**
 * Returns the topmost (last‐drawn) image object under (mouseX, mouseY), or null if none.
 */
function findImageAt(mouseX, mouseY) {
    for (let i = images.length - 1; i >= 0; i--) {
        const img = images[i];
        if (isInsideRotatedImage(mouseX, mouseY, img)) {
            return img;
        }
    }
    return null;
}



function toggleSelect(item) {
    item.selected = !item.selected;
    drawCanvas('Common');
}




//canvas.addEventListener("mousedown", function (e) {
//    const rect = canvas.getBoundingClientRect();
//    const mouseX = e.clientX - rect.left;
//    const mouseY = e.clientY - rect.top;
//    const pos = { x: mouseX, y: mouseY };
//    const shift = e.shiftKey;

//    if (document.activeElement === textEditor) return;

//    function findImageAt(pt) {
//        for (let i = images.length - 1; i >= 0; i--) {
//            const img = images[i];
//            const sx = img.scaleX ?? 1, sy = img.scaleY ?? 1;
//            const w = img.width * sx, h = img.height * sy;
//            if (
//                pt.x >= img.x && pt.x <= img.x + w &&
//                pt.y >= img.y && pt.y <= img.y + h
//            ) return img;
//        }
//        return null;
//    }

//    const txtHit = getTextObjectAt(pos.x, pos.y);
//    const imgHit = findImageAt(pos);

//    // 1) Shift+click toggles selection
//    if (shift) {
//        if (txtHit) {
//            txtHit.selected = !txtHit.selected;
//            activeText = txtHit.selected ? txtHit : activeText;
//            activeImage = null;
//            drawCanvas('Common');
//            return;
//        }
//        if (imgHit) {
//            imgHit.selected = !imgHit.selected;
//            activeImage = imgHit.selected ? imgHit : activeImage;
//            activeText = null;
//            drawCanvas('Common');
//            return;
//        }
//        return;
//    }

//    // 2) TEXT: check for resize handle FIRST (before group-drag)
//    if (txtHit && txtHit.selected) {
//        const th = getHandleUnderMouse(pos.x, pos.y, txtHit);
//        if (th) {
//            isResizingText = true;
//            activeText = txtHit;
//            activeTextHandle = th;
//            textResizeStart = {
//                mouseX: e.clientX,
//                mouseY: e.clientY,
//                origX: txtHit.x,
//                origY: txtHit.y,
//                origW: txtHit.boundingWidth,
//                origH: txtHit.boundingHeight,
//                origFont: txtHit.fontSize
//            };
//            e.preventDefault();
//            drawCanvas('Common');
//            return;
//        }
//    }

//    // 3) GROUP-DRAG for already-selected text or image
//    if ((txtHit && txtHit.selected) || (imgHit && imgHit.selected)) {
//        isDraggingGroup = true;
//        groupDragStart = { x: e.clientX, y: e.clientY };
//        groupStarts = [];
//        textObjects.filter(o => o.selected)
//            .forEach(o => groupStarts.push({ obj: o, x: o.x, y: o.y }));
//        images.filter(i => i.selected)
//            .forEach(i => groupStarts.push({ obj: i, x: i.x, y: i.y }));
//        e.preventDefault();
//        return;
//    }

//    // 4) Reset selection for single-select logic
//    textObjects.forEach(o => o.selected = false);
//    images.forEach(i => i.selected = false);
//    activeText = null;
//    activeImage = null;

//    // 5) TEXT single-select and resize/drag
//    if (txtHit) {
//        txtHit.selected = true;
//        activeText = txtHit;
//        const th = getHandleUnderMouse(pos.x, pos.y, txtHit);
//        if (th) {
//            isResizingText = true;
//            activeTextHandle = th;
//            textResizeStart = {
//                mouseX: e.clientX,
//                mouseY: e.clientY,
//                origX: txtHit.x,
//                origY: txtHit.y,
//                origW: txtHit.boundingWidth,
//                origH: txtHit.boundingHeight,
//                origFont: txtHit.fontSize
//            };
//            e.preventDefault();
//            drawCanvas('Common');
//            return;
//        }
//        if (isInsideBox(pos.x, pos.y, txtHit)) {
//            isDraggingText = true;
//            dragOffsetText.x = pos.x - txtHit.x;
//            dragOffsetText.y = pos.y - txtHit.y;
//            e.preventDefault();
//            drawCanvas('Common');
//            return;
//        }
//    }

//    // 6) IMAGE resize via handle
//    for (let i = images.length - 1; i >= 0; i--) {
//        const img = images[i];
//        const ih = getHandleUnderMouseForImage(img, pos);
//        if (ih) {
//            textObjects.forEach(o => o.selected = false);
//            images.forEach(i2 => i2.selected = false);
//            activeText = null;
//            img.selected = true;
//            activeImage = img;
//            isResizingImage = true;
//            activeImageHandle = ih;
//            e.preventDefault();
//            drawCanvas('Common');
//            return;
//        }
//    }

//    // 7) IMAGE body click → drag
//    if (imgHit) {
//        textObjects.forEach(o => o.selected = false);
//        images.forEach(i2 => i2.selected = false);
//        activeText = null;
//        imgHit.selected = true;
//        activeImage = imgHit;
//        isDraggingImage = true;
//        dragOffsetImage.x = pos.x - imgHit.x;
//        dragOffsetImage.y = pos.y - imgHit.y;
//        enableFillColorDiv();
//        enableStrockColorDiv();
//        e.preventDefault();
//        drawCanvas('Common');
//        return;
//    }

//    // 8) Clicked empty space → deselect all
//    textObjects.forEach(o => o.selected = false);
//    images.forEach(i2 => i2.selected = false);
//    activeText = null;
//    activeImage = null;
//    e.preventDefault();
//    drawCanvas('Common');
//});









function disableFillColorDiv() {
    const divfillColor = document.getElementById("divFillColor");
    divfillColor.style.display = "none";
    const div = document.getElementById("divfill");
    div.style.pointerEvents = "none";
    div.style.opacity = "0.5";
}
function enableFillColorDiv() {
    const divfillColor = document.getElementById("divFillColor");
    divfillColor.style.display = "block";
    const div = document.getElementById("divfill");
    div.style.pointerEvents = "auto";
    div.style.opacity = "1";
}
function disableStrockColorDiv() {
    const divstrockColor = document.getElementById("divStrockColor");
    divstrockColor.style.display = "none";
    const div = document.getElementById("divStrock");
    div.style.pointerEvents = "none";
    div.style.opacity = "0.5";
}
function enableStrockColorDiv() {
    const divstrockColor = document.getElementById("divStrockColor");
    divstrockColor.style.display = "block";
    const div = document.getElementById("divStrock");
    div.style.pointerEvents = "auto";
    div.style.opacity = "1";
}

// Adjusts font size so that the wrapped text fits inside the new bounding box.
// It measures the text using your wrapText helper and ensures that the total height of the lines is less than or equal to the available height.
function adjustFontSizeToFitBox(obj) {
    const availableWidth = obj.boundingWidth - 2 * padding;
    const availableHeight = obj.boundingHeight - 2 * padding;
    // We'll try from a maximum possible font size down to a minimum of 5.
    let maxFontSize = Math.floor(availableHeight); // maximum based on height
    for (let fs = maxFontSize; fs >= 5; fs--) {
        ctx.font = `${fs}px ${obj.fontFamily}`;
        let lines = wrapText(ctx, obj.text.replace(/\\n/g, '\n'), availableWidth);
        const lineHeight = fs * 1.2;
        if (lines.length * lineHeight <= availableHeight) {
            return fs;
        }
    }
    return 15; // fallback minimum
}
function drawImageObject(ctx, imgObj) {
    // 1) compute on-canvas width/height
    const sx = (typeof imgObj.scaleX === 'number') ? imgObj.scaleX : 1;
    const sy = (typeof imgObj.scaleY === 'number') ? imgObj.scaleY : 1;
    const w = imgObj.width * sx;
    const h = imgObj.height * sy;

    // 2) find the center of the unrotated image
    const cx = imgObj.x + w / 2;
    const cy = imgObj.y + h / 2;

    // 3) save, translate to center, rotate, then draw from center
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((imgObj.rotation || 0) * Math.PI / 180);
    // drawImage(image, offsetX, offsetY, drawWidth, drawHeight)
    ctx.drawImage(
        imgObj.element,   // your HTMLImageElement or CanvasImageSource
        -w / 2, -h / 2,
        w, h
    );
    ctx.restore();
}


//canvas.addEventListener("mousemove", function (e) {
//    const pos = getMousePos(canvas, e);
//    let cursor = "default";

//    // ── 1) ROTATION (live) ─────────────────────────────────────────────
//    if (isRotating && rotatingObject) {
//        const angleNow = Math.atan2(pos.y - rotatingObject.y, pos.x - rotatingObject.x);
//        const delta = angleNow - rotationStartAngle;
//        const angleDeg = (rotationStartValue + delta * 180 / Math.PI) % 360;
//        const roundedAngle = Math.round(angleDeg);
//        updateRotation(roundedAngle);
//        rotationBadge.textContent = roundedAngle;
//        return;
//    }

//    // ── 2) TEXT HANDLE HOVER ────────────────────────────────────────────
//    if (!isDraggingText && !isResizingText && activeText) {
//        const center = {
//            x: activeText.x + activeText.boundingWidth / 2,
//            y: activeText.y + activeText.boundingHeight / 2
//        };
//        const pt = rotatePoint(pos.x, pos.y, center.x, center.y, -activeText.rotation);
//        const x0 = activeText.x;
//        const y0 = activeText.y;
//        const x1 = x0 + activeText.boundingWidth;
//        const y1 = y0 + activeText.boundingHeight;

//        // Corner zones
//        const cornerTolerance = 16;
//        const corners = [
//            { x: x0, y: y0, cursor: 'nwse-resize' },
//            { x: x1, y: y0, cursor: 'nesw-resize' },
//            { x: x0, y: y1, cursor: 'nesw-resize' },
//            { x: x1, y: y1, cursor: 'nwse-resize' }
//        ];
//        for (const c of corners) {
//            if (Math.hypot(pt.x - c.x, pt.y - c.y) < cornerTolerance) {
//                canvas.style.cursor = c.cursor;
//                return;
//            }
//        }
//        // Edges
//        const edgeTolerance = 12;
//        if ((Math.abs(pt.x - x0) < edgeTolerance || Math.abs(pt.x - x1) < edgeTolerance)
//            && pt.y > y0 + cornerTolerance && pt.y < y1 - cornerTolerance) {
//            canvas.style.cursor = 'ew-resize';
//            return;
//        }
//        if ((Math.abs(pt.y - y0) < edgeTolerance || Math.abs(pt.y - y1) < edgeTolerance)
//            && pt.x > x0 + cornerTolerance && pt.x < x1 - cornerTolerance) {
//            canvas.style.cursor = 'ns-resize';
//            return;
//        }
//    }

//    // ── 3) IMAGE HANDLE HOVER ───────────────────────────────────────────
//    if (!isDraggingImage && !isResizingImage && activeImage) {
//        const handle = getImageHandleUnderMouse(pos.x, pos.y, activeImage);
//        if (handle) {
//            if (handle === 'top-left' || handle === 'bottom-right') {
//                canvas.style.cursor = 'nwse-resize';
//            } else if (handle === 'top-right' || handle === 'bottom-left') {
//                canvas.style.cursor = 'nesw-resize';
//            } else if (handle === 'left' || handle === 'right') {
//                canvas.style.cursor = 'ew-resize';
//            } else if (handle === 'top' || handle === 'bottom') {
//                canvas.style.cursor = 'ns-resize';
//            }
//            return;
//        }
//    }

//    // ── 4) GROUP DRAG ───────────────────────────────────────────────────
//    if (isDraggingGroup) {
//        const dx = e.clientX - groupDragStart.x;
//        const dy = e.clientY - groupDragStart.y;
//        groupStarts.forEach(({ obj, x, y }) => {
//            obj.x = x + dx;
//            obj.y = y + dy;
//        });
//        drawCanvas("Common");
//        canvas.style.cursor = "grabbing";
//        return;
//    }

//    // ── 5) TEXT RESIZE & DRAG ───────────────────────────────────────────
//    if (isResizingText && activeText && activeTextHandle) {
//        const txt = activeText;

//        const wStart = txt._resizeStartW;
//        const hStart = txt._resizeStartH;
//        const fontStart = txt._resizeStartFont;

//        const cx = txt.x + wStart / 2;
//        const cy = txt.y + hStart / 2;
//        const θ = (txt.rotation || 0) * Math.PI / 180;

//        const dx = pos.x - cx;
//        const dy = pos.y - cy;
//        const localX = dx * Math.cos(-θ) - dy * Math.sin(-θ);
//        const localY = dx * Math.sin(-θ) + dy * Math.cos(-θ);

//        let origLX = 0, origLY = 0, cursorLocal = "default";
//        switch (activeTextHandle) {
//            case "bottom-right": origLX = wStart / 2; origLY = hStart / 2; cursorLocal = "nwse-resize"; break;
//            case "bottom-left": origLX = -wStart / 2; origLY = hStart / 2; cursorLocal = "nesw-resize"; break;
//            case "top-right": origLX = wStart / 2; origLY = -hStart / 2; cursorLocal = "nesw-resize"; break;
//            case "top-left": origLX = -wStart / 2; origLY = -hStart / 2; cursorLocal = "nwse-resize"; break;
//        }

//        const origDist = Math.hypot(origLX, origLY);
//        const newDist = Math.hypot(localX, localY);
//        const scaleFactor = newDist / origDist;

//        const newFontSize = Math.max(8, fontStart * scaleFactor);

//        const context = canvas.getContext("2d");
//        context.font = `${newFontSize}px ${txt.fontFamily}`;
//        //const lines = wrapText(context, txt.text.replace(/\n/g, ""), Infinity);
//        //const lineHeight = newFontSize * txt.lineSpacing;
//        //const measuredH = lines.length * lineHeight + 2 * padding;
//        //const measuredW = Math.max(...lines.map(line => context.measureText(line).width)) + 2 * padding;

//        const rawLines = txt.text.split('\n');
//        context.font = `${newFontSize}px ${txt.fontFamily}`;
//        const lineHeight = newFontSize * txt.lineSpacing;
//        const measuredW = Math.max(...rawLines.map(line => context.measureText(line).width)) + 2 * padding;
//        const measuredH = rawLines.length * lineHeight + 2 * padding;


//        txt.fontSize = newFontSize;
//        txt.boundingWidth = measuredW;
//        txt.boundingHeight = measuredH;

//        // Shift x/y if resizing from top or left
//        //if (activeTextHandle.includes("left") || activeTextHandle.includes("top")) {
//        //    const deltaLX = localX - origLX;
//        //    const deltaLY = localY - origLY;
//        //    const s = Math.sin(θ), c = Math.cos(θ);
//        //    const dxShift = (activeTextHandle.includes("left") ? deltaLX : 0);
//        //    const dyShift = (activeTextHandle.includes("top") ? deltaLY : 0);
//        //    txt.x += dxShift * c - dyShift * s;
//        //    txt.y += dxShift * s + dyShift * c;
//        //}

//        drawCanvas("Common");
//        canvas.style.cursor = cursorLocal;
//        return;
//    }
//    if (isDraggingText && activeText) {
//        const txt = activeText;
//        const center = { x: txt.x + txt.boundingWidth / 2, y: txt.y + txt.boundingHeight / 2 };
//        const pt = rotatePoint(pos.x, pos.y, center.x, center.y, -txt.rotation);
//        txt.x = pt.x - dragOffsetText.x;
//        txt.y = pt.y - dragOffsetText.y;
//        drawCanvas("Common");
//        canvas.style.cursor = "grabbing";
//        return;
//    }

//    // ── 6) IMAGE DRAG ───────────────────────────────────────────────────
//    if (isDraggingImage && activeImage) {
//        activeImage.x = pos.x - dragOffsetImage.x;
//        activeImage.y = pos.y - dragOffsetImage.y;
//        drawCanvas("Common");
//        canvas.style.cursor = "grabbing";
//        return;
//    }

//    // ── 7) IMAGE RESIZE ─────────────────────────────────────────────────
//    if (isResizingImage && activeImage && activeImageHandle) {
//        const img = activeImage;
//        // (image block remains exactly as you already verified it works)

//        const wStart = img._resizeStartW;
//        const hStart = img._resizeStartH;
//        const cx = img.x + wStart / 2;
//        const cy = img.y + hStart / 2;
//        const θ = (img.rotation || 0) * Math.PI / 180;

//        const dx = pos.x - cx;
//        const dy = pos.y - cy;
//        const localX = dx * Math.cos(-θ) - dy * Math.sin(-θ);
//        const localY = dx * Math.sin(-θ) + dy * Math.cos(-θ);

//        let origLX = 0, origLY = 0, cursorImg = "default";
//        switch (activeImageHandle) {
//            case "bottom-right":
//                origLX = wStart / 2; origLY = hStart / 2; cursorImg = "nwse-resize"; break;
//            case "bottom-left":
//                origLX = -wStart / 2; origLY = hStart / 2; cursorImg = "nesw-resize"; break;
//            case "top-right":
//                origLX = wStart / 2; origLY = -hStart / 2; cursorImg = "nesw-resize"; break;
//            case "top-left":
//                origLX = -wStart / 2; origLY = -hStart / 2; cursorImg = "nwse-resize"; break;
//            case "right":
//                origLX = wStart / 2; origLY = 0; cursorImg = "ew-resize"; break;
//            case "left":
//                origLX = -wStart / 2; origLY = 0; cursorImg = "ew-resize"; break;
//            case "bottom":
//                origLX = 0; origLY = hStart / 2; cursorImg = "ns-resize"; break;
//            case "top":
//                origLX = 0; origLY = -hStart / 2; cursorImg = "ns-resize"; break;
//        }

//        const deltaLX = localX - origLX;
//        const deltaLY = localY - origLY;

//        let newLocalW = wStart;
//        let newLocalH = hStart;
//        if (activeImageHandle.includes("right")) newLocalW = wStart + 2 * deltaLX;
//        else if (activeImageHandle.includes("left")) newLocalW = wStart - 2 * deltaLX;
//        if (activeImageHandle.includes("bottom")) newLocalH = hStart + 2 * deltaLY;
//        else if (activeImageHandle.includes("top")) newLocalH = hStart - 2 * deltaLY;

//        const minW = 20;
//        const minH = 20;
//        newLocalW = Math.max(newLocalW, minW);
//        newLocalH = Math.max(newLocalH, minH);

//        img.scaleX = newLocalW / img.width;
//        img.scaleY = newLocalH / img.height;

//        if (activeImageHandle.includes("left")) {
//            const shiftLX = deltaLX;
//            const shiftLY = 0;
//            const s = Math.sin(θ), c = Math.cos(θ);
//            img.x += shiftLX * c - shiftLY * s;
//            img.y += shiftLX * s + shiftLY * c;
//        }
//        if (activeImageHandle.includes("top")) {
//            const shiftLX = 0;
//            const shiftLY = deltaLY;
//            const s = Math.sin(θ), c = Math.cos(θ);
//            img.x += shiftLX * c - shiftLY * s;
//            img.y += shiftLX * s + shiftLY * c;
//        }

//        drawCanvas("Common");
//        canvas.style.cursor = cursorImg;
//        return;
//    }

//    // ── 8) HOVER FEEDBACK ───────────────────────────────────────────────
//    if (!isDraggingText && !isResizingText && activeText) {
//        const cx = activeText.x + activeText.boundingWidth / 2;
//        const cy = activeText.y + activeText.boundingHeight / 2;
//        const θ = -(activeText.rotation || 0) * Math.PI / 180;
//        const dx = pos.x - cx;
//        const dy = pos.y - cy;
//        const localX = dx * Math.cos(θ) - dy * Math.sin(θ);
//        const localY = dx * Math.sin(θ) + dy * Math.cos(θ);
//        if (
//            localX >= -activeText.boundingWidth / 2 &&
//            localX <= activeText.boundingWidth / 2 &&
//            localY >= -activeText.boundingHeight / 2 &&
//            localY <= activeText.boundingHeight / 2
//        ) {
//            cursor = "grab";
//        }
//    }
//    if (!isDraggingImage && !isResizingImage && activeImage) {
//        const sx = (typeof activeImage.scaleX === "number") ? activeImage.scaleX : 1;
//        const sy = (typeof activeImage.scaleY === "number") ? activeImage.scaleY : 1;
//        const w = activeImage.width * sx;
//        const h = activeImage.height * sy;
//        const cx = activeImage.x + w / 2;
//        const cy = activeImage.y + h / 2;
//        const θ = -(activeImage.rotation || 0) * Math.PI / 180;
//        const dx = pos.x - cx;
//        const dy = pos.y - cy;
//        const localX = dx * Math.cos(θ) - dy * Math.sin(θ);
//        const localY = dx * Math.sin(θ) + dy * Math.cos(θ);
//        if (
//            localX >= -w / 2 &&
//            localX <= w / 2 &&
//            localY >= -h / 2 &&
//            localY <= h / 2
//        ) {
//            cursor = "grab";
//        }
//    }
//    if (isDraggingSelectionBox) {
//        const r = canvas.getBoundingClientRect();
//        selectionEnd = { x: e.clientX - r.left, y: e.clientY - r.top };
//        drawCanvas("Common");        // live update
//    }

//    canvas.style.cursor = cursor;
//});


function drawSelectionBox() {
    const ctx = canvas.getContext("2d");
    const x = Math.min(selectionStart.x, selectionEnd.x);
    const y = Math.min(selectionStart.y, selectionEnd.y);
    const w = Math.abs(selectionEnd.x - selectionStart.x);
    const h = Math.abs(selectionEnd.y - selectionStart.y);

    ctx.save();
    ctx.strokeStyle = "rgba(0, 122, 255, 0.8)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(x, y, w, h);
    ctx.restore();
}





function getMinTextWidth(ctx, text) {
    let minWidth = 0;

    // Use individual characters to avoid line-break surprises
    for (const ch of text) {
        const width = ctx.measureText(ch).width;
        if (width > minWidth) minWidth = width;
    }

    return minWidth + 2 * padding; // include padding
}

function getMinCharWidth(ctx, text) {
    let maxCharWidth = 0;
    for (let char of text) {
        const width = ctx.measureText(char).width;
        if (width > maxCharWidth) maxCharWidth = width;
    }
    return maxCharWidth + 2 * padding;
}

function getHandleUnderMouseForImageOld(imgObj, pos) {
    const handles = getImageResizeHandles(imgObj); // returns an array of handles with {name, x, y}
    for (let h of handles) {
        if (
            Math.abs(pos.x - h.x) < handleSize &&
            Math.abs(pos.y - h.y) < handleSize
        ) {
            return h.name;
        }
    }
    return null;
}

function rotatePoint(px, py, cx, cy, angleInDegrees) {
    const angle = angleInDegrees * Math.PI / 180;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const dx = px - cx;
    const dy = py - cy;
    return {
        x: cx + dx * cos - dy * sin,
        y: cy + dx * sin + dy * cos
    };
}

function onBoxResizeEndOld(obj) {
    const ctx = canvas.getContext('2d');
    const padding = obj.padding || 5;
    const fontSize = obj.fontSize;
    ctx.font = `${fontSize}px ${obj.fontFamily}`;

    // Use the text you already committed
    const lines = obj.text.split('\n');

    // Measure how big that text block is now
    const blockW = Math.max(...lines.map(l => ctx.measureText(l).width));
    const blockH = lines.length * fontSize * 1.2;

    // Snap the box to exactly wrap that text
    obj.boundingWidth = blockW + 2 * padding;
    obj.boundingHeight = blockH + 2 * padding;

    // And put it back on screen
    drawCanvas('Common');
}
function onBoxResizeEnd(obj) {
    const ctx = canvas.getContext('2d');
    const padding = obj.padding || 5;
    const maxW = obj.boundingWidth - 2 * padding;
    const maxH = obj.boundingHeight - 2 * padding;

    const lines = obj.text.split('\n');
    let fontSize = obj.fontSize;
    const lineSpacingMultiplier = obj.lineSpacing ?? 1.2;

    function measure(fs) {
        ctx.font = `${fs}px ${obj.fontFamily}`;
        const w = Math.max(...lines.map(l => ctx.measureText(l).width));
        const h = lines.length * fs * lineSpacingMultiplier;
        return { w, h };
    }

    // Shrink if too big
    let { w: blockW, h: blockH } = measure(fontSize);
    while ((blockW > maxW || blockH > maxH) && fontSize > 1) {
        fontSize--;
        ({ w: blockW, h: blockH } = measure(fontSize));
    }

    // Grow if too small
    while (true) {
        const next = measure(fontSize + 1);
        if (next.w <= maxW && next.h <= maxH) {
            fontSize++;
        } else {
            break;
        }
    }

    fontSize = Math.max(fontSize, 4); // Clamp to minimum
    obj.fontSize = fontSize;
    drawCanvas('Common');
}


function updateRotation(angle) {
    angle = ((angle % 360) + 360) % 360; // normalize
    if (rotationSlider) rotationSlider.value = angle;
    if (rotationValueDisplay) rotationValueDisplay.textContent = angle + '°';
    if (rotationBadge) rotationBadge.innerText = angle;

    [...textObjects, ...images].forEach(obj => {
        if (obj.selected) obj.rotation = angle;
    });
    drawText();
    // drawCanvas('Common');
}


//canvas.addEventListener("mouseup", function () {
//    if (isResizingText && activeText && activeTextHandle) {
//        onBoxResizeEnd(activeText);
//    }
//    isDraggingGroup = false;
//    groupDragStart = null;
//    groupStarts = [];

//    currentDrag = null;
//    isResizing = false;
//    isDragging = false;
//    activeHandle = null;

//    isDraggingImage = false;
//    isResizingImage = false;

//    isResizingText = false;
//    isDraggingText = false;
//    activeTextHandle = null;
//    activeText = null;

//    isRotating = false;
//    rotatingObject = null;

//});

////canvas.addEventListener("mouseup", function (e) {
////    const graphicBtn = document.querySelector('.toggle-btn[data-mode="graphic"]');
////    const buttons = document.querySelectorAll('.toggle-btn');

////    if (isResizingText && activeText && activeTextHandle) {
////        onBoxResizeEnd(activeText);
////    }

////    if (isDraggingSelectionBox) {
////        skipNextClick = true;
////        isDraggingSelectionBox = false;
////        drawCanvas("Common");        // final update + UI panels
////    }

////    // Final cleanup
////    isDraggingGroup = false;
////    isDraggingText = false;
////    isDraggingImage = false;
////    isResizingText = false;
////    isResizingImage = false;
////    isRotating = false;
////    groupDragStart = null;
////    groupStarts = [];
////    activeTextHandle = null;
////    activeImageHandle = null;
////    rotatingObject = null;
////    currentDrag = null;
////});

// Helper function to check if object is inside selection box
function isObjectInSelection(objX, objY, objW, objH, x1, y1, x2, y2) {
    return objX < x2 && objX + objW > x1 && objY < y2 && objY + objH > y1;
}


function updateCheckboxFor(groupId) {
    // Example: update some UI checkbox based on the groupId
    if (groupId != null) {
        console.log('Checkbox updated for group:', groupId);
        // If you have an actual checkbox update, you can do it here.
        // Example:
        // document.getElementById('groupCheckbox').checked = true;
    } else {
        console.log('No group selected, reset checkbox.');
        // document.getElementById('groupCheckbox').checked = false;
    }
}


canvas.addEventListener("mouseleave", function (e) {
    if (isMarquee) {
        // use the last rubber-band point we drew to
        finalizeMarqueeSelection(marqueeNow.x, marqueeNow.y, e);
        return; // finalizeMarqueeSelection() already clears flags & redraws
    }

    // reset transient drag/resize flags so nothing gets “stuck”
    currentDrag = null;
    isResizing = false;
    isDragging = false;
    activeHandle = null;

    isDraggingImage = false;
    isResizingImage = false;

    isDraggingToSelect = false;

    // if you also use these elsewhere, clear them too:
    isDraggingNew = false;
    isResizingNew = false;
    isCornerImageScale = false;
    isCornerFontScale = false;
    isDraggingMulti = false;
    isResizingMulti = false;

    resizeDirection = resizeDirectionNorm = null;

    canvas.style.cursor = "default";
});




function currentSelectedText() {
    return textObjects.find(obj => obj.selected);
}

// Check if a point is inside a text object's bounding box.
function isInsideBox(mouseX, mouseY, obj) {
    const boxX = obj.x - padding;
    const boxY = obj.y - padding;
    const boxWidth = obj.boundingWidth + 2 * padding;
    const boxHeight = obj.boundingHeight + 2 * padding;
    return mouseX >= boxX && mouseX <= boxX + boxWidth &&
        mouseY <= boxY + boxHeight;
    /* mouseY >= boxY && mouseY <= boxY + boxHeight;*/
}
//canvasContainer.addEventListener("click", function (e) {
//    // Deselect all if clicking on empty canvas
//    textObjects.forEach(o => o.selected = false);
//    images.forEach(img => img.selected = false);
//    drawCanvas('Common');

//});
//////canvas.addEventListener("click", function (e) {
//////    // 0) If shift is held, we’ve already toggled selection in mousedown—skip click logic
//////    if (e.shiftKey) return;

//////    const rect = canvas.getBoundingClientRect();
//////    const mouseX = e.clientX - rect.left;
//////    const mouseY = e.clientY - rect.top;
//////    const pos = { x: mouseX, y: mouseY };
//////    const shift = false; // we already know Shift is not held here

//////    // helpers: (shift is false, so these always clear)
//////    const clearText = () => textObjects.forEach(o => o.selected = false);
//////    const clearImages = () => images.forEach(img => img.selected = false);

//////    // find top‐most text under cursor
//////    const txt = getTextObjectAt(mouseX, mouseY);

//////    // find top‐most image under cursor
//////    let imgFound = null;
//////    for (let i = images.length - 1; i >= 0; i--) {
//////        if (isMouseOverImage(images[i], pos)) {
//////            imgFound = images[i];
//////            break;
//////        }
//////    }

//////    if (txt) {
//////        // — TEXT clicked (no Shift) —
//////        clearText();
//////        clearImages();

//////        txt.selected = true;
//////        activeText = txt;
//////        activeImage = null;

//////        // update UI for this text
//////        $("#favcolor").val(txt.textColor);
//////        $("#noAnimCheckbox").prop("checked", !!txt.noAnim);
//////        $("#fontstyle_popup").show();
//////        $(".right-sec-two").show();
//////        $(".right-sec-one").hide();
//////        document.getElementById("modeButton").innerText = "Animation Mode";
//////        $("#opengl_popup").hide();
//////    }
//////    else if (imgFound) {
//////        // — IMAGE clicked (no Shift) —
//////        clearText();
//////        clearImages();

//////        imgFound.selected = true;
//////        activeImage = imgFound;
//////        activeText = null;

//////        // update UI for this image
//////        $("#noAnimCheckbox").prop("checked", !!imgFound.noAnim);
//////        $("#fontstyle_popup").show();
//////        $(".right-sec-two").show();
//////        $(".right-sec-one").hide();
//////        document.getElementById("modeButton").innerText = "Animation Mode";
//////        $("#opengl_popup").hide();
//////    }
//////    else {
//////        // — clicked empty space —
//////        clearText();
//////        clearImages();
//////        activeText = null;
//////        activeImage = null;
//////        // optionally hide panels here
//////    }

//////    drawCanvas('Common');
//////});

function getSelectedType() {
    const selectedText = textObjects.find(o => o.selected);
    if (selectedText) {
        if (selectedText.groupId != null) return "Group";
        return "Text";
    }

    const selectedImage = images.find(img => img.selected);
    if (selectedImage) {
        if (selectedImage.groupId != null) return "Group";
        if (selectedImage.img?.src?.toLowerCase().includes("svg")) {
            return "Shape";
        }
        return "Image";
    }

    return null;
}
// ✅ ADD: hit test for a rotated box (works for text boxes)
function isPointInRotatedBox(box, x, y) {
    const { w, h, cx, cy } = getBoxRect(box);              // you already have this
    const ang = deg2rad(box.rotation || 0);                // you already have this
    const dx = x - cx, dy = y - cy;
    const cos = Math.cos(-ang), sin = Math.sin(-ang);      // rotate mouse into box's local space
    const rx = dx * cos - dy * sin;
    const ry = dx * sin + dy * cos;
    return (rx >= -w / 2 && rx <= w / 2 && ry >= -h / 2 && ry <= h / 2);
}

// ✅ ADD: get the topmost item under (x,y) by zIndex
//function getTopHitAt(x, y) {
//    const all = [...(images || []), ...(textObjects || [])]
//        .slice()
//        .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0)); // bottom→top

//    for (let i = all.length - 1; i >= 0; i--) {           // check from topmost
//        const it = all[i];
//        if (it.type === 'image') {
//            if (isMouseOverImage?.(it, { x, y })) return it;  // you already have this
//        } else {
//            if (isPointInRotatedBox(it, x, y)) return it;
//        }
//    }
//    return null;
//}
function getTopHitAt(x, y) {
    const arr = sortTopFirst(getAllItems());
    for (const { it } of arr) {
        const hit = (it.type === 'image' || it.img)
            ? (typeof isMouseOverImage === 'function' && isMouseOverImage(it, { x, y }))
            : (typeof isPointInRotatedBox === 'function' && isPointInRotatedBox(it, x, y));
        if (hit) return it;
    }
    return null;
}
function findHandleAt(x, y) {
    const arr = sortTopFirst(getAllItems());        // check top → bottom
    for (const { it: box } of arr) {
        const raw = (typeof getResizeHandleRotated === 'function')
            ? getResizeHandleRotated(box, x, y)
            : getResizeHandle(box, x, y);
        if (raw) return { box, raw, handle: normalizeHandle(raw) };
    }
    return null;
}
function setSelectionTarget(obj, { setActive = true, setContext = true } = {}) {
    if (!obj) return;
    // single select this object
    (textObjects || []).forEach(o => o.selected = (o === obj));
    (images || []).forEach(o => o.selected = (o === obj));

    if (setContext) selectedForContextMenu = obj;

    if (setActive) {
        activeBox = obj;
        if (obj.type === 'image' || obj.img) {
            activeImage = obj; activeText = null;
        } else {
            activeText = obj; activeImage = null;
        }
    }
}
function displayNameFromSrc(src, basicName) {
    if (!src) return '';

    // helper: strip query/hash, remove extension, take up to first underscore
    const fromFile = (file) => {
        if (!file) return '';
        const noQuery = String(file).split(/[?#]/)[0];
        const base = noQuery.replace(/\.[^/.]+$/, '');
        return decodeURIComponent(base.split('_')[0]);
    };

    // 1) Inline SVG → use basicName (there's no real file name in data URI)
    if (/^data:image\/svg\+xml/i.test(src)) {
        return basicName ? fromFile(basicName) : 'SVG';
    }

    // 2) Other non-file sources (data:, blob:) → also lean on basicName
    if (/^(data:|blob:)/i.test(src)) {
        return basicName ? fromFile(basicName) : '';
    }

    // 3) Normal URL or path
    try {
        const file = new URL(src, window.location.href).pathname.split('/').pop() || '';
        return fromFile(file);
    } catch {
        // Fallback if URL parsing fails
        return basicName ? fromFile(basicName) : '';
    }
}

canvas.addEventListener("click", function onCanvasClick(e) {
    // one-time init
    window.__marqueeCommittedAt ??= 0;
    document.getElementById('spanName').textContent = '';
    // ignore shift-click additive selection here
    if (e.shiftKey) return;

    // ✅ SOFT-SWALLOW: don't return; just mark to ignore a single empty/unselected clear
    let ignoreClearOnce = false;
    if (skipNextClick) {
        skipNextClick = false;
        ignoreClearOnce = true;
    }
    // also treat the first click right after a marquee commit as ignorable-clear
    if (window.__marqueeCommittedAt && (performance.now() - window.__marqueeCommittedAt) < 300) {
        window.__marqueeCommittedAt = 0;
        ignoreClearOnce = true;
    }

    // NEW: if a group drag/resize just happened (or we routed group action on mousedown),
    // ignore this click so it doesn't clear the multi-selection.
    if (isDraggingMulti || isResizingMulti || isGroupAction) {
        isGroupAction = false;
        e.preventDefault(); e.stopPropagation();
        return;
    }

    e.preventDefault();
    e.stopPropagation();

    // --- UI refs (guarded) ---
    const buttons = document.querySelectorAll('.toggle-btn');
    const graphicBtn = document.querySelector('.toggle-btn[data-mode="graphic"]');
    const groupCheckbox = document.getElementById("groupCheckbox");
    const opacitySlider = document.getElementById("opacitySlider");
    const opacityValue = document.getElementById("opacityValue");
    const opacityBadge = document.getElementById("opacityBadge");

    // --- mouse position in canvas CSS px ---
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // --- helpers (same as your version) ---
    function clearSelection() {
        (textObjects || []).forEach(o => o.selected = false);
        (images || []).forEach(i => i.selected = false);
        activeText = null;
        activeImage = null;
    }
    function selectGroup(id) {
        if (id == null) return;
        (textObjects || []).forEach(o => { if (o.groupId === id) o.selected = true; });
        (images || []).forEach(i => { if (i.groupId === id) i.selected = true; });
    }
    function setGroupCheckbox(id) {
        if (!groupCheckbox) return;
        groupCheckbox.checked = (id != null);
    }
    function setGraphicModeActive() {
        buttons.forEach(b => b.classList.remove('active'));
        if (graphicBtn) graphicBtn.classList.add('active');
    }
    function setOpacityUI(alpha0to1) {
        const pct = Math.max(0, Math.min(100, Math.round((isFinite(alpha0to1) ? alpha0to1 : 1) * 100)));
        if (opacitySlider) opacitySlider.value = String(pct);
        if (opacityValue) opacityValue.textContent = String(pct);
        if (opacityBadge) opacityBadge.textContent = String(pct);
    }

    // --- hit testing (topmost) ---
    let txtHit = getTextObjectAt?.(mouseX, mouseY) || null;
    let imgHit = null;
    for (let i = (images ? images.length : 0) - 1; i >= 0; i--) {
        if (isMouseOverImage?.(images[i], { x: mouseX, y: mouseY })) { imgHit = images[i]; break; }
    }
    (function resolveByZIndex() {
        const top = getTopHitAt?.(mouseX, mouseY);
        if (!top) return;
        const topZ = top.zIndex || 0;
        const txtZ = txtHit ? (txtHit.zIndex || 0) : -Infinity;
        const imgZ = imgHit ? (imgHit.zIndex || 0) : -Infinity;

        if (top.type === 'image') {
            if (!imgHit || topZ >= imgZ) { imgHit = top; if (txtHit && txtZ < topZ) txtHit = null; }
        } else {
            if (!txtHit || topZ >= txtZ) { txtHit = top; if (imgHit && imgZ < topZ) imgHit = null; }
        }
    })();

    // Determine selection context BEFORE clearing anything
    const topHit = getTopHitAt?.(mouseX, mouseY) || txtHit || imgHit || null;
    const selCount =
        (textObjects?.filter(o => o.selected).length || 0) +
        (images?.filter(i => i.selected).length || 0);

    // If clicking an already-selected item while multiple are selected,
    // KEEP the whole selection; just set "active" and update UI. No clearing.
    if (topHit && topHit.selected && selCount >= 2) {
        if (topHit.type === 'image') { activeImage = topHit; activeText = null; }
        else { activeText = topHit; activeImage = null; }

        drawText?.();
        updateFontStyleButtons?.();
        applyImagePaintToUI?.(activeImage);
        HideShowRightPannel?.(getSelectedType?.());

        if (activeImage && activeImage.isBasic) {
            document.getElementById("divCurvature")?.style && (document.getElementById("divCurvature").style.display = 'block');
        } else {
            document.getElementById("divCurvature")?.style && (document.getElementById("divCurvature").style.display = 'none');
        }
        if (activeImage && activeImage.isLINESvg) {
            document.getElementById("divFillColor")?.style && (document.getElementById("divFillColor").style.display = 'none');
            document.getElementById("divStrokeCheck")?.style && (document.getElementById("divStrokeCheck").style.display = 'none');
        } else if (activeImage != null) {
            document.getElementById("divFillColor")?.style && (document.getElementById("divFillColor").style.display = 'block');
            document.getElementById("divStrokeCheck")?.style && (document.getElementById("divStrokeCheck").style.display = 'block');
        }
        return; // <-- important
    }

    // Only clear when clicked empty OR an unselected item
    const clickedEmpty = !txtHit && !imgHit;
    const clickedUnselected = !!(topHit && !topHit.selected);
    if (clickedEmpty || clickedUnselected) {
        contextMenu.style.display = 'none';
        // ✅ if this is the synthetic click right after marquee, ignore the clear ONCE
        if (ignoreClearOnce) return;
        clearSelection();
    }
   
    // Apply selection + UI as in your original code
    if (txtHit) {
        txtHit.selected = true;
        activeText = txtHit;

        selectGroup(txtHit.groupId);
        setGroupCheckbox(txtHit.groupId);

        //$("#favcolor").val(txtHit.textColor);
        $("#noAnimCheckbox").prop("checked", !!txtHit.noAnim);
        $("#fontstyle_popup").show();
        $(".right-sec-two").show();
        $(".right-sec-one").hide();
        $("#opengl_popup").hide();

        setGraphicModeActive();
        setOpacityUI(normAlpha?.(txtHit.opacity));
        isMarquee = false;  

    } else if (imgHit) {
        imgHit.selected = true;
        activeImage = imgHit;
        isMarquee = false;  
        selectGroup(imgHit.groupId);
        setGroupCheckbox(imgHit.groupId);
        const name = displayNameFromSrc(imgHit.src, imgHit.basicName);
        document.getElementById('spanName').textContent = name ? `${name}` : 'No File';
        $("#noAnimCheckbox").prop("checked", !!imgHit.noAnim);
        $("#fontstyle_popup").show();
        $(".right-sec-two").show();
        $(".right-sec-one").hide();
        $("#opengl_popup").hide();

        setGraphicModeActive();
        setOpacityUI(normAlpha?.(imgHit.opacity));

        if ($("#hdnFillStrockColorFlag").val() === '1') {
            $("#hdnfillColor").val(imgHit.fillNoColor || "#FFFFFF");
            $("#hdnStrockColor").val(imgHit.strokeNoColor || "#FFFFFF");
            $("#favFillcolor").val($("#hdnfillColor").val());
            $("#favStrockcolor").val($("#hdnStrockColor").val());
            $("#hdnFillStrockColorFlag").val('2');
        }

    } else {
        setGroupCheckbox(null);
        setGraphicModeActive();
        setOpacityUI(1);
    }

    drawText?.();
    updateFontStyleButtons?.();

    const selectedType = getSelectedType?.();
    
    if (selectedType === "Shape" && activeImage) {
        $("#hdnfillNoColorStatus").val(activeImage.fillNoColorStatus || false);
        $("#hdnstrokeNoColorStatus").val(activeImage.strokeNoColorStatus || false);

        const swEl = document.getElementById('ddlStrokeWidth');
        if (swEl) swEl.value = String(activeImage.strokeWidth || 3);

        // sync visible checkboxes to the active image (optional but recommended)
        const fillNoneEl = document.getElementById("noColorCheck");
        const strokeNoneEl = document.getElementById("noColorCheck2");
        if (fillNoneEl) fillNoneEl.checked = !!activeImage.fillNoColorStatus;
        if (strokeNoneEl) strokeNoneEl.checked = !!activeImage.strokeNoColorStatus;

        // READ UI
        const noColorChecked = document.getElementById("noColorCheck")?.checked;
        const noStrokeChecked = document.getElementById("noColorCheck2")?.checked;

        // ✅ ONLY apply colors when user explicitly changed something (picker/checkbox)
        if (window.__paintChangeRequested === true) {
            if (noColorChecked) {
                updateSelectedImageColors(
                    activeImage,
                    "none",
                    noStrokeChecked ? "none" : $("#hdnStrockColor").val(),
                    (document.getElementById("ddlStrokeWidth")?.value || 2)
                );
            }
            if (noStrokeChecked) {
                updateSelectedImageColors(
                    activeImage,
                    noColorChecked ? "none" : $("#hdnfillColor").val(),
                    "none",
                    (document.getElementById("ddlStrokeWidth")?.value || 2)
                );
            }
            // reset after applying from UI
            window.__paintChangeRequested = false;
        }
    }

    applyImagePaintToUI?.(activeImage);
    HideShowRightPannel?.(selectedType);

    if (activeImage && activeImage.isBasic) {
        document.getElementById("divCurvature")?.style && (document.getElementById("divCurvature").style.display = 'block');
    } else {
        document.getElementById("divCurvature")?.style && (document.getElementById("divCurvature").style.display = 'none');
    }
    if (activeImage && activeImage.isLINESvg) {
        document.getElementById("divFillColor")?.style && (document.getElementById("divFillColor").style.display = 'none');
        document.getElementById("divStrokeCheck")?.style && (document.getElementById("divStrokeCheck").style.display = 'none');
    } else if (activeImage != null) {
        document.getElementById("divFillColor")?.style && (document.getElementById("divFillColor").style.display = 'block');
        document.getElementById("divStrokeCheck")?.style && (document.getElementById("divStrokeCheck").style.display = 'block');
    }
});




function applyImagePaintToUI(imgHit) {
    if (!imgHit) return;

    const fillPicker = document.getElementById('favFillcolor');
    const strokePicker = document.getElementById('favStrockcolor');
    const noFillBox = document.getElementById('noColorCheck');   // fill no-color
    const noStrokeBox = document.getElementById('noColorCheck2');  // stroke no-color
    const swEl = document.getElementById('ddlStrokeWidth');
    const curvature = document.getElementById('ddlCurvature');

    // 1) Set checkboxes from statuses
    if (noFillBox) noFillBox.checked = !!imgHit.fillNoColorStatus;
    if (noStrokeBox) noStrokeBox.checked = !!imgHit.strokeNoColorStatus;

    // 2) Push colors into the color inputs (only if they are valid hex)
    const isHex = v => typeof v === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v);

    if (fillPicker) {
        const fv = imgHit.fillNoColor;
        if (isHex(fv)) fillPicker.value = fv; // 'none' cannot be set on a color input
        // keep hidden in sync (store 'none' if status true)
        $('#hdnfillColor').val(imgHit.fillNoColorStatus ? 'none' : (isHex(fv) ? fv : fillPicker.value));
    }

    if (strokePicker) {
        const sv = imgHit.strokeNoColor;
        if (isHex(sv)) strokePicker.value = sv;
        $('#hdnStrockColor').val(imgHit.strokeNoColorStatus ? 'none' : (isHex(sv) ? sv : strokePicker.value));
    }

    if (swEl && imgHit.strokeWidth != null) swEl.value = String(imgHit.strokeWidth);
    if (curvature && imgHit.curvature != null) curvature.value = String(imgHit.curvature);

    
}
function applyPaintFromUI() {
    if (!window.activeImage) return;
    window.__paintChangeRequested = true;

    // Reuse the same logic your click block uses:
    const noColorChecked = document.getElementById("noColorCheck")?.checked;
    const noStrokeChecked = document.getElementById("noColorCheck2")?.checked;
    const sw = (document.getElementById("ddlStrokeWidth")?.value || 2);

    if (noColorChecked) {
        updateSelectedImageColors(
            activeImage,
            "none",
            noStrokeChecked ? "none" : $("#hdnStrockColor").val(),
            sw
        );
    }
    if (noStrokeChecked) {
        updateSelectedImageColors(
            activeImage,
            noColorChecked ? "none" : $("#hdnfillColor").val(),
            "none",
            sw
        );
    }

    window.__paintChangeRequested = false;
    if (typeof drawText === "function") drawText();
}

// Hook UI events (run once after DOM ready)
document.getElementById("noColorCheck")?.addEventListener("change", () => {
    applyPaintFromUI();
});
document.getElementById("noColorCheck2")?.addEventListener("change", () => {
    applyPaintFromUI();
});
document.getElementById("favFillcolor")?.addEventListener("input", () => {
    // Fill picker changed → apply with current states
    window.__paintChangeRequested = true;
    applyPaintFromUI();
});
document.getElementById("favStrockcolor")?.addEventListener("input", () => {
    // Stroke picker changed → apply
    window.__paintChangeRequested = true;
    applyPaintFromUI();
});
document.getElementById("ddlStrokeWidth")?.addEventListener("change", () => {
    // Stroke width changed → apply
    window.__paintChangeRequested = true;
    applyPaintFromUI();
});


////KD Need to be Include in project////////
//canvas.addEventListener("click", function (e) {
//    // ignore shift here
//    if (e.shiftKey) return;

//    if (skipNextClick) {
//        skipNextClick = false;
//        return;    // swallow this click so it doesn’t clear selection
//    }

//    const buttons = document.querySelectorAll('.toggle-btn');
//    const graphicBtn = document.querySelector('.toggle-btn[data-mode="graphic"]');





//    const rect = canvas.getBoundingClientRect();
//    const mouseX = e.clientX - rect.left;
//    const mouseY = e.clientY - rect.top;
//    const pos = { x: mouseX, y: mouseY };

//    // helpers to clear selection
//    const clearText = () => textObjects.forEach(o => o.selected = false);
//    const clearImages = () => images.forEach(i => i.selected = false);

//    // find what was clicked
//    const txtHit = getTextObjectAt(mouseX, mouseY);
//    let imgHit = null;
//    for (let i = images.length - 1; i >= 0; i--) {
//        if (isMouseOverImage(images[i], pos)) {
//            imgHit = images[i];
//            break;
//        }
//    }

//    // always start fresh
//    clearText();
//    clearImages();
//    activeText = null;
//    activeImage = null;

//    // helper to select a whole group
//    function selectGroup(id) {
//        textObjects.forEach(o => { if (o.groupId === id) o.selected = true; });
//        images.forEach(i => { if (i.groupId === id) i.selected = true; });
//    }

//    // update the groupCheckbox UI
//    const groupCheckbox = document.getElementById("groupCheckbox");
//    function updateCheckboxFor(id) {
//        if (id != null) {
//            groupCheckbox.checked = true;
//        } else {
//            groupCheckbox.checked = false;
//        }
//    }

//    if (txtHit) {
//        // TEXT clicked
//        txtHit.selected = true;
//        activeText = txtHit;

//        // if this text is grouped, select its entire group
//        if (txtHit.groupId != null) {
//            selectGroup(txtHit.groupId);
//            updateCheckboxFor(txtHit.groupId);
//        } else {
//            updateCheckboxFor(null);
//        }

//        // update UI panels...
//        $("#favcolor").val(txtHit.textColor);
//        $("#noAnimCheckbox").prop("checked", !!txtHit.noAnim);
//        $("#fontstyle_popup").show();
//        $(".right-sec-two").show();
//        $(".right-sec-one").hide();
//        //document.getElementById("modeButton").innerText = "Animation Mode";
//        $("#opengl_popup").hide();
//        // 2) Clear `active` from all
//        buttons.forEach(b => b.classList.remove('active'));

//        // 3) Activate only the Graphic button
//        graphicBtn.classList.add('active');

//        var opacity = txtHit.opacity * 100 || 100;
//        if (opacity > 100) opacity = 100;
//        opacitySlider.value = opacity;
//        document.getElementById("opacityValue").textContent = opacity + "";
//        opacityBadge.textContent = opacity;

//    }
//    else if (imgHit) {
//        // IMAGE clicked
//        imgHit.selected = true;
//        activeImage = imgHit;

//        if (imgHit.groupId != null) {
//            selectGroup(imgHit.groupId);
//            updateCheckboxFor(imgHit.groupId);
//        } else {
//            updateCheckboxFor(null);
//        }

//        // update UI panels...
//        $("#noAnimCheckbox").prop("checked", !!imgHit.noAnim);
//        $("#fontstyle_popup").show();
//        $(".right-sec-two").show();
//        $(".right-sec-one").hide();
//        //document.getElementById("modeButton").innerText = "Animation Mode";
//        $("#opengl_popup").hide();
//        // 2) Clear `active` from all
//        buttons.forEach(b => b.classList.remove('active'));

//        // 3) Activate only the Graphic button
//        graphicBtn.classList.add('active');

//        var opacity = imgHit.opacity * 100 || 100;
//        if (opacity > 100) opacity = 100;
//        opacitySlider.value = opacity;
//        document.getElementById("opacityValue").textContent = opacity + "";
//        opacityBadge.textContent = opacity;
//        if ($("#hdnFillStrockColorFlag").val() == '1') {
//            $("#hdnfillColor").val(imgHit.fillNoColor || "#FFFFFF");
//            $("#hdnStrockColor").val(imgHit.strokeNoColor || "#FFFFFF");
//            $("#favFillcolor").val($("#hdnfillColor").val());
//            $("#favStrockcolor").val($("#hdnStrockColor").val());
//            $("#hdnFillStrockColorFlag").val('2');
//        }

//    }
//    else {
//                // — clicked empty space —
//                clearText();
//                clearImages();
//                activeText = null;
//                activeImage = null;
//        // no group selected
//        updateCheckboxFor(null);

//        // 2) Clear `active` from all
//        buttons.forEach(b => b.classList.remove('active'));

//        // 3) Activate only the Graphic button
//        graphicBtn.classList.add('active');

//        const opacity =  100;
//        opacitySlider.value = opacity;
//        document.getElementById("opacityValue").textContent = opacity + "";
//        opacityBadge.textContent = opacity;
//    }

//    drawCanvas('Common');
//    updateFontStyleButtons();
//    const selectedType = getSelectedType();
//    if (selectedType == "Shape") {
//        $("#hdnfillNoColorStatus").val(imgHit.fillNoColorStatus || false);
//        $("#hdnstrokeNoColorStatus").val(imgHit.strokeNoColorStatus || false);
//        //if ($("#hdnfillColor").val() == imgHit.fillNoColor) {
//        //    $("#hdnfillColor").val(imgHit.fillNoColor || "#FFFFFF");
//        //}
//        //if ($("#hdnStrockColor").val() == imgHit.strokeNoColor) {
//        //    $("#hdnStrockColor").val(imgHit.strokeNoColor || "#FFFFFF");
//        //}

//        //$("#favFillcolor").val($("#hdnfillColor").val());
//        //$("#favStrockcolor").val($("#hdnStrockColor").val());

//        document.getElementById('ddlStrokeWidth').value = (imgHit.strokeWidth || 3).toString();
//        document.getElementById("noColorCheck").checked = toBool(imgHit.fillNoColorStatus)||false;
//        document.getElementById("noColorCheck2").checked = toBool(imgHit.strokeNoColorStatus) || false;

//        const noColorChecked = document.getElementById("noColorCheck").checked;
//        const noStrokeChecked = document.getElementById("noColorCheck2").checked;
//        if (noColorChecked) {
//            updateSelectedImageColors(
//                "none", noStrokeChecked ? "none" : $("#hdnStrockColor").val(), document.getElementById("ddlStrokeWidth").value || 2
//            );
//        }


//        if (noStrokeChecked) {
//            updateSelectedImageColors(
//                noColorChecked ? "none" : $("#hdnfillColor").val(),
//                "none", document.getElementById("ddlStrokeWidth").value || 2
//            );
//        }


//    }
//    console.log("Selected Type:", selectedType);
//    HideShowRightPannel(selectedType);

//});
function toBool(x) {
    return x === true || x === "true";
}
function HideShowRightPannel(selectedType) {
    ShowLoader();
    const heading = document.getElementById("text_heading");
    const fontPannel = document.getElementById("fontstyle_popup");
    if (selectedType == 'Image') {
        heading.innerHTML = "Image";
        if (fontPannel) { fontPannel.style.display = 'none'; }
        document.getElementById("text_alignment_tool").style.display = 'none';
        document.getElementById("text_decoration_tool").style.display = 'none';
        document.getElementById("text_color_tool").style.display = 'none';
        document.getElementById("text_size_tool").style.display = 'none';
        document.getElementById("line_spacing_tool").style.display = 'none';
        document.getElementById("divStrockColor").style.display = 'none';
        document.getElementById("divFillColor").style.display = 'none';
        document.getElementById("divCurvature").style.display = 'none';
        document.getElementById("divCopyPaste").style.display = 'none';
        HideLoader();
    }
    else if (selectedType == 'Text') {
        heading.innerHTML = "Text";
        document.getElementById("text_alignment_tool").style.display = 'block';
        document.getElementById("text_decoration_tool").style.display = 'flex';
        document.getElementById("text_color_tool").style.display = 'block';
        document.getElementById("text_size_tool").style.display = 'block';
        document.getElementById("line_spacing_tool").style.display = 'block';
        document.getElementById("divStrockColor").style.display = 'none';
        document.getElementById("divFillColor").style.display = 'none';
        document.getElementById("divCurvature").style.display = 'none';
        document.getElementById("divCopyPaste").style.display = 'block';
        HideLoader();
    }
    else if (selectedType == 'Shape') {
        heading.innerHTML = "Shape";
        if (fontPannel) { fontPannel.style.display = 'none'; }
        document.getElementById("text_alignment_tool").style.display = 'none';
        document.getElementById("text_decoration_tool").style.display = 'none';
        document.getElementById("text_color_tool").style.display = 'none';
        document.getElementById("text_size_tool").style.display = 'none';
        document.getElementById("line_spacing_tool").style.display = 'none';
        document.getElementById("divStrockColor").style.display = 'block';
        document.getElementById("divFillColor").style.display = 'block';
        document.getElementById("divCurvature").style.display = 'block';
        document.getElementById("divCopyPaste").style.display = 'none';
        HideLoader();
    }
    else if (selectedType == 'Icon') {
        heading.innerHTML = "Icon";
        if (fontPannel) { fontPannel.style.display = 'none'; }
        document.getElementById("text_alignment_tool").style.display = 'none';
        document.getElementById("text_decoration_tool").style.display = 'none';
        document.getElementById("text_color_tool").style.display = 'none';
        document.getElementById("line_spacing_tool").style.display = 'none';
        document.getElementById("divStrockColor").style.display = 'block';
        document.getElementById("divFillColor").style.display = 'block';
        document.getElementById("divCurvature").style.display = 'none';
        HideLoader();
    }
    else if (selectedType == null) {
        const animationBtn = document.querySelector('.toggle-btn[data-mode="animation"]');
        if (animationBtn) animationBtn.click();
        HideLoader();
    }
    else {
        heading.innerHTML = "Text";
        document.getElementById("text_alignment_tool").style.display = 'block';
        document.getElementById("text_decoration_tool").style.display = 'flex';
        document.getElementById("text_color_tool").style.display = 'block';
        document.getElementById("line_spacing_tool").style.display = 'block';
        document.getElementById("divStrockColor").style.display = 'none';
        document.getElementById("divFillColor").style.display = 'none';
        document.getElementById("divCurvature").style.display = 'none';
        document.getElementById("divCopyPaste").style.display = 'none';
        HideLoader();
    }
}
// Arrow key nudge for all selected items
document.addEventListener('keydown', (e) => {
    // don't move while typing in inputs or your rich text editor
    const ae = document.activeElement;
    if (ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.isContentEditable)) return;
    if (window.isEditing) return;

    let dx = 0, dy = 0;
    const step = e.shiftKey ? 10 : 1;

    switch (e.key) {
        case 'ArrowLeft': dx = -step; break;
        case 'ArrowRight': dx = step; break;
        case 'ArrowUp': dy = -step; break;
        case 'ArrowDown': dy = step; break;
        default: return;
    }
    e.preventDefault();

    const selected = [...(textObjects || []), ...(images || [])].filter(o => o.selected);
    selected.forEach(o => { o.x += dx; o.y += dy; });

    drawText();
});

//document.addEventListener('keydown', (e) => {
//    if (!window.isEditing || !window.textEditorNew) return;

//    const ed = textEditorNew;
//    const inEditor = ed.contains(document.activeElement) || ed.contains((window.getSelection()?.anchorNode) || null);
//    if (!inEditor) return;

//    // Let browser handle arrows/home/end/page… naturally, just stop canvas listeners
//    // NOTE: we don't preventDefault (except for Tab handled above), only stopPropagation.
//    const passThroughKeys = [
//        'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'
//    ];
//    if (passThroughKeys.includes(e.key)) {
//        e.stopPropagation();
//    }
//    // Tab is handled on the editor element (above)
//}, true);
// Arrow-key nudge: move all selected items by the arrow direction
//document.addEventListener('keydown', function (e) {
//    // only when the canvas is “active”—you can tighten this to a focused flag if you like
//    const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
//    if (!arrowKeys.includes(e.key)) return;

//    e.preventDefault();
//    // how many pixels per tap? +Shift for larger step
//    const step = e.shiftKey ? 10 : 1;
//    let dx = 0, dy = 0;
//    switch (e.key) {
//        case 'ArrowUp': dy = -step; break;
//        case 'ArrowDown': dy = step; break;
//        case 'ArrowLeft': dx = -step; break;
//        case 'ArrowRight': dx = step; break;
//    }

//    // move each selected text
//    textObjects.filter(o => o.selected).forEach(o => {
//        o.x += dx;
//        o.y += dy;
//    });

//    // move each selected image
//    images.filter(i => i.selected).forEach(i => {
//        i.x += dx;
//        i.y += dy;
//    });

//    // redraw with updated positions
//    drawCanvas('Common');
//});

function updateGroupCheckbox() {
    const sel = [
        ...images.filter(i => i.selected),
        ...textObjects.filter(t => t.selected)
    ];
    if (sel.length === 0) {
        groupCheckbox.checked = false;
    } else {
        const firstId = sel[0].groupId;
        groupCheckbox.checked = firstId != null && sel.every(o => o.groupId === firstId);
    }
}
function GroupPropertySet() {
    const groupCheckbox = document.getElementById('groupCheckbox');
    const isChecked = groupCheckbox.checked;
    const selectedItems = [
        ...images.filter(i => i.selected),
        ...textObjects.filter(t => t.selected)
    ];

    if (selectedItems.length === 0) {
        alert("No items selected to (un)group.");
        groupCheckbox.checked = false;
        return;
    }

    if (isChecked) {
        const newGroupId = generateUUID();
        const id = newGroupId;
        selectedItems.forEach(obj => obj.groupId = id);
    } else {
        selectedItems.forEach(obj => obj.groupId = null);
    }

    SaveDesignBoard();
    //drawCanvas('Common');
    drawText();
    updateGroupCheckbox();
}
function generateUUID() {
    return 'xxxx-xxxx-4xxx'.replace(/[x]/g, c =>
        (Math.random() * 16 | 0).toString(16)
    );
}

function ImagePropertySet() {
    console.log(textObjects);
    console.log(images);
    const noAnimCheckbox = document.getElementById('noAnimCheckbox');
    const isChecked = noAnimCheckbox.checked;

    // collect whatever is currently selected
    const selectedImgs = images.filter(img => img.selected);
    const selectedTexts = textObjects.filter(txt => txt.selected);
    const selectedItems = [...selectedImgs, ...selectedTexts];

    if (selectedItems.length === 0) {
        // nothing selected → nothing to do
        return;
    }

    // assume you only care about the first selected item's groupId
    const { groupId } = selectedItems[0];

    if (groupId) {
        // Case 1: there _is_ a groupId → toggle every item in that group
        images
            .filter(img => img.groupId === groupId)
            .forEach(img => { img.noAnim = isChecked; });

        textObjects
            .filter(txt => txt.groupId === groupId)
            .forEach(txt => { txt.noAnim = isChecked; });
    } else {
        // Case 2: no groupId on the selected item(s) → only toggle exactly those selected
        selectedItems.forEach(item => {
            item.noAnim = isChecked;
        });
    }

    // one save at the end
    SaveDesignBoard();
    console.log(textObjects);
    console.log(images);
}
//canvasContainer.addEventListener("dblclick", function (e) {
//    const rect = canvas.getBoundingClientRect();
//    const mouseX = e.clientX - rect.left;
//    const mouseY = e.clientY - rect.top;
//    const obj = getTextObjectAt(mouseX, mouseY);

//    if (obj) {
//        obj.editing = true;

//        // Use the object's bounding box and padding to set the editor's dimensions.
//        const editorX = obj.x - padding;  // Position relative to object's x
//        const editorY = obj.y - padding;  // Position relative to object's y
//        const offsetX = 260;  // adjust if needed
//        const offsetY = 45;  // adjust if needed



//        // Position the text editor over the object's bounding box.
//        textEditor.style.left = `${rect.left + editorX - offsetX}px`;
//        textEditor.style.top = `${rect.top + editorY + scrollTop - offsetY}px`;
//        //textEditor.style.left = `${rect.left + editorX}px`;
//        //textEditor.style.top = `${rect.top + editorY}px`;
//        textEditor.style.width = `${obj.boundingWidth + 2 * padding}px`;
//        textEditor.style.height = `${obj.boundingHeight + 2 * padding}px`;

//        // Match styles with the text object.
//        textEditor.style.fontSize = `${obj.fontSize}px`;
//        textEditor.style.fontFamily = obj.fontFamily;
//        textEditor.style.color = obj.textColor;
//        textEditor.style.textAlign = obj.textAlign;
//        /*textEditor.style.background = "rgba(255,255,255,0.95)";*/
//        if (obj.textColor === "#000000") {
//            // mostly‑opaque white
//            textEditor.style.background = "rgba(255,255,255,0.95)";
//        } else {
//             textEditor.style.background = "rgba(34, 34, 34, 1)";
//        }
//        textEditor.style.border = "1px solid #ccc";
//        textEditor.style.padding = "2px 4px";
//        textEditor.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.3)";

//        // Set the current text and show the editor.
//        textEditor.value = obj.text.replace(/\\n/g, "\n");
//        textEditor.style.display = "block";
//        textEditor.focus();
//        //requestAnimationFrame(() => {
//        //    textEditor.setSelectionRange(0, 0);
//        //});
//        setTimeout(() => textEditor.setSelectionRange(0, 0), 0);


//        // Finish editing when Enter is pressed (unless using Shift+Enter for a new line) or on blur.


//        function finishEditing() {
//            const editedText = textEditor.value;
//            obj.editing = false;
//            textEditor.style.display = "none";

//            const ctx = canvas.getContext("2d");
//            const padding = obj.padding || 10; // default padding if not set on obj
//            const fontSize = obj.fontSize;
//            ctx.font = `${fontSize}px ${obj.fontFamily}`;

//            // Split text only on explicit newlines; no wrapping or font resizing
//            const lines = editedText.split("\n");

//            // Update obj properties
//            obj.text = lines.join("\n");

//            // Recompute bounding box width based on longest line
//            const lineWidths = lines.map(line => ctx.measureText(line).width);
//            const maxLineWidth = Math.max(...lineWidths, 0);
//            obj.boundingWidth = maxLineWidth + 2 * padding;

//            // Recompute bounding box height based on line count
//            const lineHeight = fontSize * 1.2;
//            obj.boundingHeight = lines.length * lineHeight + 2 * padding;

//            drawCanvas('Common');
//            textEditor.removeEventListener("blur", finishEditing);
//        }


//        //function onKeyDown(e) {
//        //    if (e.key === "Enter" && !e.shiftKey) {
//        //        finishEditing();
//        //    }
//        //}


//       // textEditor.addEventListener("keydown", onKeyDown);
//        textEditor.addEventListener("blur", finishEditing);
//    }
//});

// When the text editor loses focus or Enter is pressed, update the text
textEditor.addEventListener("blur", function () {
    const editingObj = textObjects.find(o => o.editing);
    if (editingObj) {
        editingObj.text = textEditor.value;
        editingObj.editing = false;
        textEditor.style.display = "none";
        drawCanvas('Common');
    }
});

//textEditor.addEventListener("keydown", function (e) {
//    if (e.key === "Enter") {
//        textEditor.blur();
//    }
//});




//function ChangeColor() {
//    const colorPicker = document.getElementById("favcolor");
//    $("#hdnTextColor").val(colorPicker.value);
//    const textColor = document.getElementById("hdnTextColor").value; // Text color from dropdown
//    const Obj = textObjects.find(obj => obj.selected);
//    if (Obj) {
//        Obj.textColor = textColor || 'black';
//    }
//    drawCanvas('ChangeStyle');
//}
function normalizeSingleLine(html) {
    // Wrap HTML so we can inspect/modify safely
    const doc = new DOMParser().parseFromString(`<div id="__wrap">${html}</div>`, "text/html");
    const wrap = doc.getElementById("__wrap");

    // If there is an explicit <br>, we do nothing (user wants multiple lines)
    const hasBR = !!wrap.querySelector("br");

    // Count top-level divs (your renderer treats each top-level <div> as a line)
    const topDivs = Array.from(wrap.childNodes).filter(
        n => n.nodeType === 1 && n.tagName === "DIV"
    );

    // Only enforce single-line when it's truly single-line content:
    // - no <br>
    // - 0 or 1 top-level <div>
    if (!hasBR && topDivs.length <= 1) {
        // Make sure there is one top-level <div>
        let lineDiv;
        if (topDivs.length === 1) {
            lineDiv = topDivs[0];
        } else {
            lineDiv = doc.createElement("div");
            // move all children into this single line div
            while (wrap.firstChild) lineDiv.appendChild(wrap.firstChild);
            wrap.appendChild(lineDiv);
        }

        // Prevent wrapping
        lineDiv.style.whiteSpace = "nowrap";

        // Optional: preserve multiple spaces visually
        // (only needed if you care about double spaces)
        lineDiv.innerHTML = lineDiv.innerHTML.replace(/  /g, "&nbsp;&nbsp;");
    }

    // Return innerHTML of the wrapper (what your box stores)
    return wrap.innerHTML;
}
function applySelectionStyleReplace(cssProp, value) {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    const range = sel.getRangeAt(0);
    if (range.collapsed) return null;

    // Pull out selection
    const frag = range.extractContents();

    // Strip same prop inside selection so we don't nest
    stripStylePropInFragment(frag, cssProp);

    // Wrap once with new style
    const span = document.createElement("span");
    span.style[cssProp] = value;
    span.appendChild(frag);
    range.insertNode(span);

    // Reselect this exact span
    sel.removeAllRanges();
    const r = document.createRange();
    r.selectNodeContents(span);
    sel.addRange(r);

    // Persist for next action
    if (typeof saveSelection === "function") saveSelection();

    return span;
}
function normalizeEditorInPlace(root, keepSpan) {
    if (!root) return;
    // 1) Remove empty spans
    removeEmptySpans(root);
    // 2) Collapse span>span chains
    collapseSpanChains(root);
    // 3) Merge adjacent spans with identical style
    mergeAdjacentSameStyleSpans(root);
    // 4) If single-line, enforce nowrap – but IN PLACE
    //if (!root.querySelector("br")) {
    //    const line = (root.childElementCount === 1 && root.firstElementChild?.tagName === "DIV")
    //        ? root.firstElementChild
    //        : root;
    //    line.style.whiteSpace = "nowrap";
    //}

    // Re-select keepSpan if it still exists
    if (keepSpan && root.contains(keepSpan)) {
        const sel = window.getSelection();
        sel.removeAllRanges();
        const r = document.createRange();
        r.selectNodeContents(keepSpan);
        sel.addRange(r);
        if (typeof saveSelection === "function") saveSelection();
    }
}

function stripStylePropInFragment(fragment, cssProp) {
    const walker = document.createTreeWalker(fragment, NodeFilter.SHOW_ELEMENT, null, false);
    const nodesToCleanup = [];

    while (walker.nextNode()) {
        const el = walker.currentNode;
        if (!(el instanceof HTMLElement)) continue;
        // Remove the property if present
        if (el.style && el.style[cssProp]) {
            el.style[cssProp] = "";
            // If that makes style empty, we’ll try to unwrap later
            nodesToCleanup.push(el);
        }
        // Legacy <font> handling for color / font-family if you have those
        if (cssProp === "color" && el.tagName === "FONT" && el.hasAttribute("color")) {
            el.removeAttribute("color");
            nodesToCleanup.push(el);
        }
        if (cssProp === "fontFamily" && el.tagName === "FONT" && el.hasAttribute("face")) {
            el.removeAttribute("face");
            nodesToCleanup.push(el);
        }
    }

    // unwrap empty spans (no style and <span> only)
    nodesToCleanup.forEach(tryUnwrapIfUseless);
}

function tryUnwrapIfUseless(el) {
    if (!(el instanceof HTMLElement)) return;
    const isSpan = el.tagName === "SPAN";
    const hasNoStyle = !el.getAttribute("style") || el.getAttribute("style").trim() === "";
    if (isSpan && hasNoStyle) {
        // unwrap
        const parent = el.parentNode;
        while (el.firstChild) parent.insertBefore(el.firstChild, el);
        parent.removeChild(el);
    }
}
function mergeRedundantSpansAround(node) {
    // Bubble up to a reasonable parent container (editor root or its child line div)
    let root = node;
    for (let i = 0; i < 3 && root.parentElement; i++) root = root.parentElement;

    // 1) Merge adjacent spans with identical style
    const children = Array.from(root.childNodes);
    for (let i = 0; i < children.length - 1; i++) {
        const a = children[i], b = children[i + 1];
        if (a?.nodeType === 1 && b?.nodeType === 1 &&
            a.tagName === "SPAN" && b.tagName === "SPAN" &&
            a.getAttribute("style") === b.getAttribute("style")) {
            while (b.firstChild) a.appendChild(b.firstChild);
            b.remove();
            i--; // re-check from this index
        }
    }

    // 2) Collapse span > span chains by merging styles
    collapseSpanChains(root);
}

function normalizeEditorHtml(html) {
    const doc = new DOMParser().parseFromString(`<div id="__wrap">${html}</div>`, "text/html");
    const wrap = doc.getElementById("__wrap");

    // 1) Remove empty spans (no text and no element children)
    removeEmptySpans(wrap);

    // 2) Collapse span > span chains by merging styles (child overrides parent)
    collapseSpanChains(wrap);

    // 3) Merge adjacent spans that have identical style strings
    mergeAdjacentSameStyleSpans(wrap);

    // 4) If it's effectively single-line (no <br> and <=1 top-level <div>),
    //    enforce nowrap so “Default Text” won’t break after styling.
    enforceSingleLineNowrap(wrap);

    return wrap.innerHTML;
}

function removeEmptySpans(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null, false);
    const toRemove = [];
    while (walker.nextNode()) {
        const el = walker.currentNode;
        if (el.tagName === "SPAN") {
            const hasElementChild = Array.from(el.childNodes).some(n => n.nodeType === 1);
            const hasText = el.textContent && el.textContent.replace(/\u200B/g, "").trim().length > 0; // ignore zero-width
            if (!hasElementChild && !hasText) toRemove.push(el);
        }
    }
    toRemove.forEach(el => el.remove());
}

function collapseSpanChains(root) {
    let changed = true;
    while (changed) {
        changed = false;
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null, false);
        const toProcess = [];
        while (walker.nextNode()) {
            const el = walker.currentNode;
            if (el.tagName === "SPAN" &&
                el.childNodes.length === 1 &&
                el.firstChild.nodeType === 1 &&
                el.firstChild.tagName === "SPAN") {
                toProcess.push(el);
            }
        }

        // ✅ ADD: process deepest spans first (children before parents)
        toProcess.sort((a, b) => {
            const depth = (n) => { let d = 0; for (let p = n; p; p = p.parentElement) d++; return d; };
            return depth(b) - depth(a);
        });

        toProcess.forEach(parent => {
            // ✅ ADD: re-validate; this node may have changed since we collected it
            if (!parent || !parent.isConnected) return;

            // still exactly one ELEMENT child and it's a <span>?
            const child = parent.firstElementChild;
            if (!child) return;
            if (parent.childElementCount !== 1) return;
            if (child.tagName !== "SPAN") return;

            // ✅ ADD: getAttribute only when nodes are valid
            const pStyle = parent.getAttribute("style") || "";
            const cStyle = child.getAttribute("style") || "";

            // ✅ ADD: be resilient if mergeStyleStrings throws
            let merged = "";
            try { merged = mergeStyleStrings(pStyle, cStyle) || ""; } catch (e) { merged = pStyle; }

            if (merged.trim()) parent.setAttribute("style", merged);
            else parent.removeAttribute("style");

            // move grandchildren up (guard while child still alive)
            while (child.firstChild) parent.insertBefore(child.firstChild, child);
            child.remove();
            changed = true;
        });
    }
}

function mergeAdjacentSameStyleSpans(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null, false);
    const parents = new Set();
    while (walker.nextNode()) {
        parents.add(walker.currentNode.parentElement);
    }
    parents.forEach(parent => {
        if (!parent) return;
        for (let i = 0; i < parent.childNodes.length - 1; i++) {
            const a = parent.childNodes[i];
            const b = parent.childNodes[i + 1];
            if (a?.nodeType === 1 && b?.nodeType === 1 &&
                a.tagName === "SPAN" && b.tagName === "SPAN" &&
                (a.getAttribute("style") || "") === (b.getAttribute("style") || "")) {
                // merge b into a
                while (b.firstChild) a.appendChild(b.firstChild);
                b.remove();
                i--; // re-check at same index
            }
        }
    });
}
function mergeStyleStrings(a, b) {
    const map = {};
    (a || "").split(";").forEach(s => {
        const [k, v] = s.split(":").map(x => x && x.trim());
        if (k && v) map[k.toLowerCase()] = v; // normalize keys
    });
    (b || "").split(";").forEach(s => {
        const [k, v] = s.split(":").map(x => x && x.trim());
        if (k && v) map[k.toLowerCase()] = v; // child wins
    });
    const out = Object.entries(map)
        .filter(([k, v]) => v && v.length)
        .map(([k, v]) => `${k}: ${v}`)
        .join("; ");
    return out;
}
function enforceSingleLineNowrap(wrap) {
    const hasBR = !!wrap.querySelector("br");
    const topDivs = Array.from(wrap.childNodes).filter(n => n.nodeType === 1 && n.tagName === "DIV");

    if (!hasBR && topDivs.length <= 1) {
        let lineDiv;
        if (topDivs.length === 1) {
            lineDiv = topDivs[0];
        } else {
            lineDiv = wrap.ownerDocument.createElement("div");
            while (wrap.firstChild) lineDiv.appendChild(wrap.firstChild);
            wrap.appendChild(lineDiv);
        }
        lineDiv.style.whiteSpace = "nowrap";
    }
}
const colorInput = document.getElementById('favcolor');
if (colorInput) {
    colorInput.addEventListener('mousedown', e => {
        e.preventDefault();
        textEditorNew && textEditorNew.focus();
    });
}
function getSelectionCharacterOffsetsWithin(root, rngOpt) {
    if (!root) return null;
    const sel = window.getSelection && window.getSelection();
    const rng = rngOpt || (sel && sel.rangeCount ? sel.getRangeAt(0) : null);
    if (!rng || !root.contains(rng.commonAncestorContainer)) return null;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    let node, start = 0, end = 0, seenStart = false;
    while ((node = walker.nextNode())) {
        const len = node.nodeValue.length;
        if (!seenStart) {
            if (node === rng.startContainer) { start += rng.startOffset; seenStart = true; }
            else { start += len; }
        }
        if (node === rng.endContainer) { end += rng.endOffset; break; }
        else { end += len; }
    }
    return { start, end };
}

function setSelectionByCharacterOffsets(root, start, end) {
    if (!root || start == null || end == null) return false;
    const range = document.createRange();
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    let node, pos = 0, sNode = null, sOff = 0, eNode = null, eOff = 0;
    while ((node = walker.nextNode())) {
        const len = node.nodeValue.length;
        if (sNode == null && start <= pos + len) { sNode = node; sOff = Math.max(0, start - pos); }
        if (eNode == null && end <= pos + len) { eNode = node; eOff = Math.max(0, end - pos); break; }
        pos += len;
    }
    if (!sNode) return false;
    if (!eNode) { eNode = sNode; eOff = sOff; }
    range.setStart(sNode, sOff);
    range.setEnd(eNode, eOff);
    const sel = window.getSelection();
    sel.removeAllRanges(); sel.addRange(range);
    window._lastEditorRange = range.cloneRange();
    return true;
}
// Normalize any color string to computed rgb(...) for reliable compare
function normalizeColorString(c) {
    const el = document.createElement('span');
    el.style.color = c;
    document.body.appendChild(el);
    const out = getComputedStyle(el).color;
    document.body.removeChild(el);
    return out;
}

// Remove inline 'color' from descendants of rootEl ONLY (keep rootEl’s own color)
function stripInlineColorInside(rootEl) {
    if (!rootEl) return;
    const walker = document.createTreeWalker(rootEl, NodeFilter.SHOW_ELEMENT, null, false);
    const list = [];
    while (walker.nextNode()) {
        const el = walker.currentNode;
        if (el === rootEl) continue;                 // don’t strip the wrapper itself
        if (el.hasAttribute && el.hasAttribute('data-color-root')) continue; // don’t strip protected nodes
        if (el.style && el.style.color) list.push(el);
    }
    list.forEach(el => { try { el.style.removeProperty('color'); } catch (_) { } });
}

// Ensure everything intersecting current selection has the target color (important)
// REPLACE your ensureSelectedInlineColor with this version
function ensureSelectedInlineColor(ed, charSel, color) {
    if (!ed || !charSel) return;

    const saveSel = window.getSelection && window.getSelection();
    const prevRange = (saveSel && saveSel.rangeCount) ? saveSel.getRangeAt(0).cloneRange() : null;

    if (!setSelectionByCharacterOffsets(ed, charSel.start, charSel.end)) return;
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    const rng = sel.getRangeAt(0);

    const walker = document.createTreeWalker(
        rng.commonAncestorContainer,
        NodeFilter.SHOW_ELEMENT,
        {
            acceptNode(el) {
                if (!ed.contains(el)) return NodeFilter.FILTER_REJECT;
                if (!rng.intersectsNode(el)) return NodeFilter.FILTER_REJECT;
                // ✅ only enforce color on inline-ish elements; skip blocks
                return __isBlockTag(el.tagName) ? NodeFilter.FILTER_SKIP : NodeFilter.FILTER_ACCEPT;
            }
        }
    );

    const els = [];
    while (walker.nextNode()) els.push(walker.currentNode);

    // set explicit color on inline elements we intersect
    const want = normalizeColorString ? normalizeColorString(color) : color;
    els.forEach(el => {
        if (el.hasAttribute && el.hasAttribute('data-color-root')) return;
        try {
            const cur = getComputedStyle(el).color;
            if (!cur || cur !== want) el.style.setProperty('color', color, 'important');
        } catch (_) { }
    });

    // restore previous selection cache (you reselect later anyway)
    if (prevRange) { saveSel.removeAllRanges(); saveSel.addRange(prevRange); }
}
function ChangeColor() {
    // --- pick color & sync model ---
    const colorPicker = document.getElementById("favcolor");
    const color = (colorPicker && colorPicker.value) ? colorPicker.value : "#000000";

    $("#hdnTextColor").val(color);
    const textColor = document.getElementById("hdnTextColor").value;

    const Obj = Array.isArray(textObjects) ? textObjects.find(o => o.selected) : null;
    if (Obj) Obj.textColor = textColor || "black";

    if (!activeBox) return;

    const ed = textEditorNew;
    if (!ed || !ed.isConnected) return;

    // --- helpers (scoped) ---
    const BLOCK_TAGS = new Set(["DIV", "P", "LI", "UL", "OL", "H1", "H2", "H3", "H4", "H5", "H6", "TABLE", "THEAD", "TBODY", "TFOOT", "TR", "TD", "TH"]);

    function isBlock(el) { return el && el.nodeType === 1 && BLOCK_TAGS.has(el.tagName); }

    function removeOnlyColorDecl(el) {
        const st = el.getAttribute && el.getAttribute("style");
        if (!st) return;
        const cleaned = st.split(";").map(s => s.trim()).filter(s => s && !/^color\s*:/.test(s)).join("; ");
        if (cleaned) el.setAttribute("style", cleaned); else el.removeAttribute("style");
    }

    function toComputedRGB(root, anyColor) {
        try {
            const probe = document.createElement("span");
            probe.style.color = anyColor;
            (root || document.body).appendChild(probe);
            const rgb = (getComputedStyle(probe).color || "").toLowerCase();
            probe.remove();
            return rgb;
        } catch { return ("" + anyColor).toLowerCase(); }
    }

    function rangeIntersectsNode(rng, node) {
        try {
            const tr = document.createRange();
            tr.selectNode(node.nodeType === 3 ? node.parentNode : node);
            return rng.compareBoundaryPoints(Range.END_TO_START, tr) < 0 &&
                rng.compareBoundaryPoints(Range.START_TO_END, tr) > 0;
        } catch { return false; }
    }

    function forEachTextNodeInRange(root, rng, cb) {
        const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
        let n;
        while ((n = tw.nextNode())) {
            if (!n.nodeValue) continue;
            // quickly skip nodes not intersecting
            const nodeRange = document.createRange();
            nodeRange.selectNodeContents(n);
            if (rng.compareBoundaryPoints(Range.END_TO_START, nodeRange) >= 0) continue; // node starts after rng end
            if (rng.compareBoundaryPoints(Range.START_TO_END, nodeRange) <= 0) continue; // node ends before rng start

            // compute local start/end offsets within this text node
            let start = 0, end = n.nodeValue.length;
            if (n === rng.startContainer) start = rng.startOffset;
            if (n === rng.endContainer) end = Math.min(end, rng.endOffset);
            if (end > start) cb(n, start, end);
        }
    }

    function wrapTextSliceWithSpan(node, start, end, colorCSS) {
        // split end first to keep offsets stable
        if (end < node.nodeValue.length) node.splitText(end);
        let slice = node;
        if (start > 0) slice = node.splitText(start);
        const span = document.createElement("span");
        span.setAttribute("data-color-root", "1");
        span.style.setProperty("color", colorCSS, "important");
        slice.parentNode.replaceChild(span, slice);
        span.appendChild(slice); // moves text into span
        return span;
    }

    function demoteAncestorColorInIntersectedBlocks(root, selectionRange, computedTarget) {
        // Collect blocks the selection intersects
        const blocks = [];
        const bw = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
            acceptNode(el) {
                if (!isBlock(el)) return NodeFilter.FILTER_SKIP;
                try {
                    const br = document.createRange();
                    br.selectNodeContents(el);
                    const hit = selectionRange.compareBoundaryPoints(Range.END_TO_START, br) < 0 &&
                        selectionRange.compareBoundaryPoints(Range.START_TO_END, br) > 0;
                    return hit ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
                } catch { return NodeFilter.FILTER_SKIP; }
            }
        });
        while (bw.nextNode()) blocks.push(bw.currentNode);

        blocks.forEach(block => {
            const colored = block.querySelectorAll('[style*="color"]');
            colored.forEach(el => {
                if (el.hasAttribute && el.hasAttribute("data-color-root")) return; // keep precise wraps
                let cur = "";
                try { cur = (getComputedStyle(el).color || "").toLowerCase(); } catch { }
                if (cur !== computedTarget) return;

                // If this element is completely outside the selection, strip color.
                if (!rangeIntersectsNode(selectionRange, el)) {
                    removeOnlyColorDecl(el);
                    return;
                }

                // If only partially covered, or if it contains our precise wrappers, demote it.
                try {
                    const er = document.createRange(); er.selectNodeContents(el);
                    const fullyCovered =
                        selectionRange.compareBoundaryPoints(Range.START_TO_START, er) <= 0 &&
                        selectionRange.compareBoundaryPoints(Range.END_TO_END, er) >= 0;
                    if (!fullyCovered || el.querySelector('[data-color-root]')) {
                        removeOnlyColorDecl(el);
                    }
                } catch {
                    // best effort
                    removeOnlyColorDecl(el);
                }
            });
        });
    }

    // --- selection acquisition ---
    let sel = window.getSelection && window.getSelection();
    let rng = (sel && sel.rangeCount && ed.contains(sel.getRangeAt(0).commonAncestorContainer))
        ? sel.getRangeAt(0).cloneRange()
        : null;
    if (!rng && _lastEditorRange && ed.contains(_lastEditorRange.commonAncestorContainer)) {
        rng = _lastEditorRange.cloneRange();
    }

    const computedTarget = toComputedRGB(ed, color);

    // --- editing path: precise, range-based coloring ---
    if (isEditing && rng && !rng.collapsed) {
        // focus & restore live selection
        ed.focus();
        if (sel) { sel.removeAllRanges(); sel.addRange(rng); }

        // 1) wrap ONLY the selected characters across all intersecting text nodes
        const createdSpans = [];
        forEachTextNodeInRange(ed, rng, (textNode, s, e) => {
            const span = wrapTextSliceWithSpan(textNode, s, e, color);
            createdSpans.push(span);
        });

        // 2) remove inline color from ancestors that are outside / partially inside selection
        demoteAncestorColorInIntersectedBlocks(ed, rng, computedTarget);

        // 3) sync & restore selection bounds (between first and last created span)
        if (createdSpans.length) {
            try {
                const first = createdSpans[0];
                const last = createdSpans[createdSpans.length - 1];
                const newRange = document.createRange();
                newRange.setStart(first.firstChild || first, 0);
                const lastText = last.lastChild && last.lastChild.nodeType === 3 ? last.lastChild : last;
                const endOffset = lastText.nodeType === 3 ? lastText.nodeValue.length : last.childNodes.length;
                newRange.setEnd(lastText, endOffset);
                sel.removeAllRanges(); sel.addRange(newRange);
                _lastEditorRange = newRange.cloneRange();
            } catch { }
        }

        // 4) update backing model & visuals
        activeBox.text = ed.innerHTML;
        if (Obj) Obj.text = activeBox.text;

        resizeEditorToContent && resizeEditorToContent(ed, activeBox);
        if (typeof invalidateTextRaster === "function") invalidateTextRaster(activeBox);
        drawText && drawText();
        return;
    }

    // --- whole-box path (no selection or not editing): wrap everything ---
    const holder = document.createElement("div");
    holder.innerHTML = activeBox.text || "";
    const spanAll = document.createElement("span");
    spanAll.style.setProperty("color", color, "important");
    spanAll.innerHTML = holder.innerHTML;
    activeBox.text = spanAll.outerHTML;
    if (Obj) Obj.text = activeBox.text;

    resizeEditorToContent && resizeEditorToContent(ed, activeBox);
    if (typeof invalidateTextRaster === "function") invalidateTextRaster(activeBox);
    drawText && drawText();
}







function ChangeColorOLD() {
    const colorPicker = document.getElementById("favcolor");
    const color = (colorPicker && colorPicker.value) ? colorPicker.value : "#000000";

    $("#hdnTextColor").val(color);
    const textColor = document.getElementById("hdnTextColor").value;

    const Obj = Array.isArray(textObjects) ? textObjects.find(o => o.selected) : null;
    if (Obj) Obj.textColor = textColor || "black";

    if (!activeBox) return;

    const ed = textEditorNew;
    const hasRange = !!_lastEditorRange && ed && ed.isConnected &&
        ed.contains(_lastEditorRange.commonAncestorContainer);

    if (isEditing && hasRange) {
        ed.focus();

        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(_lastEditorRange);

        // 1) safe span wrap if within one block
        let wrappedSpanRef = null; // ADD
        let ok = wrapSelectionInSpan(span => {
            span.style.color = color;
            wrappedSpanRef = span;    // ADD: capture the wrapper we just created
        });

        // 2) else execCommand
        if (!ok) ok = applyInlineStyleSafe('color', color);

        // 🔧 ADD: ensure our color wins over any inner spans with their own color
        if (ok) {
            if (wrappedSpanRef) {
                stripInlineColorInside(wrappedSpanRef);
            } else {
                // best-effort clean for execCommand path: limit to current selection subtree
                const r = sel && sel.rangeCount ? sel.getRangeAt(0) : null;
                const common = r ? (r.commonAncestorContainer.nodeType === 1
                    ? r.commonAncestorContainer
                    : r.commonAncestorContainer.parentElement) : null;
                if (common && ed.contains(common)) {
                    stripInlineColorInside(common);
                }
            }
        }

        if (ok && typeof normalizeEditorInPlace === "function") {
            normalizeEditorInPlace(ed);   // your existing normalizer
        }

        activeBox.text = ed.innerHTML;
        if (Obj) Obj.text = activeBox.text;

        resizeEditorToContent(ed, activeBox);
        if (typeof invalidateTextRaster === "function") invalidateTextRaster(activeBox);
        drawText();
        return;
    }

    // Whole box (unchanged)
    const holder = document.createElement("div");
    holder.innerHTML = activeBox.text || "";
    const spanAll = document.createElement("span");
    spanAll.style.color = color;
    spanAll.innerHTML = holder.innerHTML;
    activeBox.text = spanAll.outerHTML;
    if (Obj) Obj.text = activeBox.text;

    resizeEditorToContent(ed, activeBox);
    if (typeof invalidateTextRaster === "function") invalidateTextRaster(activeBox);
    drawText();
}

function stripInlineColorInside(rootSpan) {
    if (!rootSpan) return;
    // remove color on descendants only; keep rootSpan's color
    rootSpan.querySelectorAll('span[style*="color"]').forEach(el => {
        el.style.color = '';
    });
}


function ChangeColorOLD() {
    const colorPicker = document.getElementById("favcolor");
    const color = (colorPicker && colorPicker.value) ? colorPicker.value : "#000000";

    $("#hdnTextColor").val(color);
    const textColor = document.getElementById("hdnTextColor").value;
    const Obj = (typeof textObjects !== "undefined") ? textObjects.find(o => o.selected) : null;
    if (Obj) Obj.textColor = textColor || "black";

    if (!activeBox) return;

    if (isEditing) {
        textEditorNew.focus();
        restoreSelection();

        const span = applySelectionStyleReplace("color", color); // ← keeps selection
        normalizeEditorInPlace(textEditorNew, span);             // ← no innerHTML replace

        activeBox.text = textEditorNew.innerHTML;
        if (Obj) Obj.text = activeBox.text;
    } else {
        applyColorToWholeBox(color);
        if (Obj) Obj.text = activeBox.text;
    }

    drawText();
    console.log(textObjects);
}




/* ------- helpers ------- */

// Color the whole box safely without blowing away existing inline colors.
// If you want to FORCE one color across everything, set every element's style.color below.
function applyColorToWholeBox(color) {
    const container = document.createElement("div");
    container.innerHTML = activeBox.text;

    const divs = Array.from(container.childNodes).filter(n => n.nodeType === 1 && n.tagName === "DIV");
    if (divs.length > 0) {
        divs.forEach(div => {
            if (!div.style.color) div.style.color = color;
        });
    } else {
        const wrap = document.createElement("div");
        const span = document.createElement("span");
        span.style.color = color;
        span.innerHTML = container.innerHTML;
        wrap.appendChild(span);
        container.innerHTML = wrap.innerHTML;
    }

    // avoid spurious wraps on truly single-line content
    container.innerHTML = sanitizeSingleLine(container.innerHTML);

    activeBox.text = container.innerHTML;
}

// If the content is effectively a single line, prevent breaking by using white-space:nowrap

function sanitizeSingleLine(html) {
    // Wrap/parse safely
    const doc = new DOMParser().parseFromString(`<div id="__wrap">${html}</div>`, "text/html");
    const wrap = doc.getElementById("__wrap");

    // If there is any explicit line break, leave it alone (user wants multiline)
    const hasBR = !!wrap.querySelector("br");

    // Count top-level DIVs (your renderer treats each top-level div as a line)
    const topDivs = Array.from(wrap.childNodes).filter(
        n => n.nodeType === 1 && n.tagName === "DIV"
    );

    // If it’s truly single-line (no <br>, and <= 1 top-level div),
    // flatten everything into ONE div and prevent wrapping.
    if (!hasBR) {
        // Create a single line div
        const lineDiv = doc.createElement("div");
        lineDiv.style.whiteSpace = "nowrap";

        // Move all content into lineDiv (flatten multiple top-level divs/spans/text)
        while (wrap.firstChild) {
            const node = wrap.firstChild;
            if (node.nodeType === 1 && node.tagName === "DIV") {
                // Move its children instead of the div wrapper itself
                while (node.firstChild) lineDiv.appendChild(node.firstChild);
                wrap.removeChild(node);
            } else {
                lineDiv.appendChild(node); // spans/text/etc.
            }
        }

        // Merge accidental adjacent spans with the same inline styles (keeps HTML tidy)
        mergeAdjacentSpans(lineDiv);

        // Optional: collapse CR/LF to spaces to avoid accidental breaks
        lineDiv.innerHTML = lineDiv.innerHTML.replace(/\n+/g, " ");

        // Put our normalized single line back into the wrapper
        wrap.innerHTML = "";
        wrap.appendChild(lineDiv);
    }

    return wrap.innerHTML;
}
function mergeAdjacentSpans(rootEl) {
    // Walk shallowly; good enough for post-color output
    let i = 0;
    while (i < rootEl.childNodes.length - 1) {
        const a = rootEl.childNodes[i];
        const b = rootEl.childNodes[i + 1];

        const isSpanA = a.nodeType === 1 && a.tagName === "SPAN";
        const isSpanB = b && b.nodeType === 1 && b.tagName === "SPAN";

        if (isSpanA && isSpanB && a.getAttribute("style") === b.getAttribute("style")) {
            // Same style → merge contents
            while (b.firstChild) a.appendChild(b.firstChild);
            rootEl.removeChild(b);
            // Do not increment i; try merging again in case there are more
        } else {
            i++;
        }
    }
}


/* ---------- helpers ---------- */

// Apply color to the entire box content without blowing away existing inline colors.
// This sets color where it’s missing; if you want to FORCE override everywhere,
// change the if-block to always set el.style.color = color.
//function applyColorToWholeBox(color) {
//    const container = document.createElement("div");
//    container.innerHTML = activeBox.text;

//    // If there are top-level <div> lines, color each unless already colored
//    const divs = Array.from(container.childNodes).filter(
//        n => n.nodeType === 1 && n.tagName === "DIV"
//    );
//    if (divs.length > 0) {
//        divs.forEach(div => {
//            const hasInlineColor = div.style && div.style.color && div.style.color.trim() !== "";
//            if (!hasInlineColor) div.style.color = color;
//        });
//    } else {
//        // No top-level divs → wrap everything in a colored span
//        const wrapper = document.createElement("div");
//        const span = document.createElement("span");
//        span.style.color = color;
//        span.innerHTML = container.innerHTML;
//        wrapper.appendChild(span);
//        container.innerHTML = wrapper.innerHTML;
//    }

//    activeBox.text = container.innerHTML;
//}

function ChangeTranColor1() {
    const colorPicker = document.getElementById("tranColor1");
    $("#hdnTransition1").val(colorPicker.value);
    const textColor = document.getElementById("hdnTransition1").value; // Text color from dropdown 
    const Obj = textObjects.find(obj => obj.selected);
    if (Obj) {
        Obj.textColor = textColor || 'black';
    }
    //drawCanvas('ChangeStyle');
    drawText();
}

function ChangeTranColor2() {
    const colorPicker = document.getElementById("tranColor2");
    $("#hdnTransition2").val(colorPicker.value);
    const textColor = document.getElementById("hdnTransition2").value; // Text color from dropdown 
    const Obj = textObjects.find(obj => obj.selected);
    if (Obj) {
        Obj.textColor = textColor || 'black';
    }
    //drawCanvas('ChangeStyle');
    drawText();
}

function getSelectedImageOLD() {
    // Prefer activeImage if it’s a real image object
    if (activeImage && (activeImage.type === 'image' || activeImage.img instanceof Image)) {
        return activeImage;
    }
    // Else pick the selected image (topmost by zIndex if multiple)
    if (Array.isArray(images)) {
        const selected = images.filter(it => it && (it.type === 'image' || it.img instanceof Image) && it.selected);
        if (selected.length) {
            selected.sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));
            return selected[0];
        }
    }
    return null;
}
function getSelectedImage() {
    // 1) Active box wins if it's an image (most reliable, always current)
    if (activeBox && activeBox.type === 'image') return activeBox;

    // 2) Fallback to legacy pointer if still used elsewhere
    if (activeImage && (activeImage.type === 'image' || activeImage.img instanceof Image)) {
        return activeImage;
    }

    // 3) Otherwise topmost selected image
    if (Array.isArray(images)) {
        const selected = images.filter(it => it && it.type === 'image' && it.selected);
        if (selected.length) {
            selected.sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));
            return selected[0];
        }
    }
    return null;
}


function ChangeFillColor() {
    const target = getSelectedImage();
    if (!target) return;

    const fillColorPicker = document.getElementById("favFillcolor");
    if (!fillColorPicker) return;

    const noStrokeChecked =
        (document.getElementById("noColorCheck2") || document.getElementById("noColorCheck"))?.checked || false;

    const newFill = fillColorPicker.value;
    const newStroke = noStrokeChecked ? "none" : ($("#hdnStrockColor").val() || "#000");
    const newStrokeWidth = parseFloat(document.getElementById("ddlStrokeWidth")?.value) || 2;

    $("#hdnfillColor").val(newFill);
    $("#hdnfillNoColorStatus").val(false);

    // optional: mirror on the object for serialization, if you track these
    target.fillNoColorStatus = false;
    target.fillNoColor = newFill;
    target.strokeNoColor = newStroke;
    target.strokeWidth = newStrokeWidth;
    target.fillNoColor = document.getElementById('favFillcolor')?.value || "#FFFFFF";
    updateSelectedImageColors(target, newFill, newStroke, newStrokeWidth);
}
function updateSelectedImageColors(targetImage, newFill, newStroke, newStrokeWidth = null) {
    if (!targetImage) return null;

    const svgUrl = targetImage.originalSrc || targetImage.src || "";
    const isSvg = svgUrl.toLowerCase().endsWith(".svg") || svgUrl.startsWith("data:image/svg+xml");
    if (!isSvg || !targetImage.img) { console.warn("Target is not an SVG"); return null; }

    if (!targetImage.originalSrc) targetImage.originalSrc = targetImage.src;

    targetImage._paintJobId = (targetImage._paintJobId || 0) + 1;
    const myJob = targetImage._paintJobId;

    const origW = targetImage.width, origH = targetImage.height;
    if (newStrokeWidth != null) targetImage.strokeWidth = newStrokeWidth; // keep numeric too

    const PAINT_TAGS = new Set(["path", "rect", "circle", "ellipse", "polygon", "polyline", "line", "g", "use", "text"]);

    function patchSvg(svgText) {
        // parse
        const doc = new DOMParser().parseFromString(svgText, "image/svg+xml");
        const svg = doc.documentElement;
        if (!svg || svg.nodeName.toLowerCase() === "parsererror") return svgText;

        // 1) Dynamic per-side padding that collapses after reload
        (function applyViewBoxForStroke() {
            const sw = Number(newStrokeWidth ?? targetImage?.strokeWidth ?? 0);
            const half = (Number.isFinite(sw) && sw > 0) ? sw / 2 : 0;

            // current viewBox or fallback
            let vbStr = (svg.getAttribute("viewBox") || "").trim();
            let vbCur;
            if (vbStr) {
                const a = vbStr.split(/[\s,]+/).map(Number);
                if (a.length >= 4 && a.every(Number.isFinite)) {
                    vbCur = { x: a[0], y: a[1], w: a[2], h: a[3] };
                }
            }
            if (!vbCur) {
                const w = Number(svg.getAttribute("width")) || Number(origW) || 0;
                const h = Number(svg.getAttribute("height")) || Number(origH) || 0;
                vbCur = { x: 0, y: 0, w, h };
            }

            // geometry bbox (stroke excluded)
            const SVG_NS = "http://www.w3.org/2000/svg";
            let bbox = { x: vbCur.x, y: vbCur.y, width: vbCur.w, height: vbCur.h };
            try {
                const tmpSvg = document.createElementNS(SVG_NS, "svg");
                tmpSvg.setAttribute("viewBox", `${vbCur.x} ${vbCur.y} ${vbCur.w} ${vbCur.h}`);
                tmpSvg.style.cssText = "position:absolute;left:-99999px;top:-99999px;visibility:hidden;width:0;height:0";
                const g = document.createElementNS(SVG_NS, "g");
                Array.from(svg.childNodes).forEach(n => g.appendChild(n.cloneNode(true)));
                tmpSvg.appendChild(g);
                document.body.appendChild(tmpSvg);
                const gb = g.getBBox(); // excludes stroke
                bbox = { x: gb.x, y: gb.y, width: gb.width, height: gb.height };
                tmpSvg.remove();
            } catch { /* keep bbox as vbCur */ }

            // keep tiny author margin, drop prior saved padding
            const tol = Math.max(0.25, Math.min(vbCur.w, vbCur.h) * 0.005); // 0.25 units or 0.5%
            const keepL = Math.min(Math.max(0, bbox.x - vbCur.x), tol);
            const keepT = Math.min(Math.max(0, bbox.y - vbCur.y), tol);
            const keepR = Math.min(Math.max(0, (vbCur.x + vbCur.w) - (bbox.x + bbox.width)), tol);
            const keepB = Math.min(Math.max(0, (vbCur.y + vbCur.h) - (bbox.y + bbox.height)), tol);

            const base = {
                x: bbox.x - keepL,
                y: bbox.y - keepT,
                w: bbox.width + keepL + keepR,
                h: bbox.height + keepT + keepB
            };

            svg.setAttribute("overflow", "visible");

            if (half === 0) {
                svg.setAttribute("viewBox", `${base.x} ${base.y} ${base.w} ${base.h}`);
                targetImage.__svgPad = { l: 0, t: 0, r: 0, b: 0 };
                return;
            }

            // add only what’s needed for current stroke
            const padL = Math.max(0, half - keepL);
            const padT = Math.max(0, half - keepT);
            const padR = Math.max(0, half - keepR);
            const padB = Math.max(0, half - keepB);

            svg.setAttribute(
                "viewBox",
                `${base.x - padL} ${base.y - padT} ${base.w + padL + padR} ${base.h + padT + padB}`
            );
            targetImage.__svgPad = { l: padL, t: padT, r: padR, b: padB };
        })();

        // 2) Style block updates
        const styleEl = svg.querySelector("style");
        if (styleEl) {
            let css = styleEl.textContent || "";
            if (newFill != null) css = css.replace(/(^|[^\w-])fill\s*:\s*[^;]+;?/g, `$1fill:${newFill};`);
            if (newStroke != null) css = css.replace(/(^|[^\w-])stroke\s*:\s*[^;]+;?/g, `$1stroke:${newStroke};`);
            if (newStrokeWidth != null) css = css.replace(/stroke-width\s*:\s*[^;]+;?/g, `stroke-width:${newStrokeWidth};`);
            styleEl.textContent = css;
        }

        // 3) Inline attributes (skip <defs>)
        const PAINT_TAGS = new Set(["path", "rect", "circle", "ellipse", "polygon", "polyline", "line", "g", "use", "text"]);
        svg.querySelectorAll("*").forEach(el => {
            if (!PAINT_TAGS.has(el.tagName.toLowerCase())) return;
            if (el.closest("defs")) return;
            if (newFill != null) el.setAttribute("fill", newFill);
            if (newStroke != null) el.setAttribute("stroke", newStroke);
            if (newStrokeWidth != null) el.setAttribute("stroke-width", String(newStrokeWidth));
            // optional for nicer corners:
            // el.setAttribute("stroke-linejoin","round");
            // el.setAttribute("stroke-linecap","round");
            // el.setAttribute("paint-order","stroke fill");
        });

        return new XMLSerializer().serializeToString(doc);
    }

    function redrawSVG(svgText) {
        if (myJob !== targetImage._paintJobId) return null;

        const uri = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgText);
        const imgEl = targetImage.img;

        // Ensure we persist the modified source regardless of onload timing
        targetImage.modifiedSVG = svgText;        // raw svg text (optional but handy)
        targetImage.modifiedSrc = uri;            // persist this to DB
        targetImage.hasPaintOverrides = true;     // boolean flag for your loader
        targetImage.src = uri;                    // keep model in sync (used by your serializer?)

        // Update the display image
        imgEl.onload = () => {
            if (myJob !== targetImage._paintJobId) return;
            targetImage.width = origW;
            targetImage.height = origH;
            if (typeof drawText === "function") drawText();
        };
        imgEl.onerror = () => {
            console.warn("Failed to repaint SVG:", targetImage.originalSrc || targetImage.src);
        };
        imgEl.src = uri;

        return uri; // allow caller to persist immediately
    }

    if (targetImage.originalSVG) {
        return redrawSVG(patchSvg(targetImage.originalSVG));
    } else if (svgUrl.startsWith("data:image/svg+xml")) {
        const afterComma = svgUrl.split(",")[1] || "";
        let raw = "";
        if (/;base64/i.test(svgUrl)) {
            try { raw = atob(afterComma); } catch { raw = ""; }
        } else {
            try { raw = decodeURIComponent(afterComma); } catch { raw = ""; }
        }
        if (raw) {
            targetImage.originalSVG = raw;
            return redrawSVG(patchSvg(raw));
        } else {
            console.warn("Could not decode inline SVG data.");
            return null;
        }
    } else {
        return fetch(svgUrl)
            .then(r => r.text())
            .then(text => { targetImage.originalSVG = text; return redrawSVG(patchSvg(text)); })
            .catch(err => { console.error("Fetch SVG failed:", err); return null; });
    }
}

function updateSelectedImageColorsOLD1(targetImage, newFill, newStroke, newStrokeWidth = null) {
    if (!targetImage) return;

    const svgUrl = targetImage.originalSrc || targetImage.src || "";
    const isSvg = svgUrl.toLowerCase().endsWith(".svg") || svgUrl.startsWith("data:image/svg+xml");
    if (!isSvg || !targetImage.img) { console.warn("Target is not an SVG"); return; }

    // Cache original once
    if (!targetImage.originalSrc) targetImage.originalSrc = targetImage.src;

    // Race guard so fast re-clicks don’t repaint the wrong image
    targetImage._paintJobId = (targetImage._paintJobId || 0) + 1;
    const myJob = targetImage._paintJobId;

    const origW = targetImage.width, origH = targetImage.height;
    if (newStrokeWidth != null) targetImage.strokeWidth = newStrokeWidth;

    // whitelist of paintable elements; skip <defs>, gradients, masks, etc.
    const PAINT_TAGS = new Set(["path", "rect", "circle", "ellipse", "polygon", "polyline", "line", "g", "use", "text"]);

    function patchSvg(svgText) {
        const doc = new DOMParser().parseFromString(svgText, "image/svg+xml");
        const svg = doc.documentElement;

        // Expand viewBox if stroke width grows
        if (newStrokeWidth != null) {
            svg.setAttribute("overflow", "visible");
            let vb = svg.getAttribute("viewBox");
            if (!vb) vb = `0 0 ${origW} ${origH}`;
            let [x, y, w, h] = vb.split(/\s+|,/).map(Number);
            const pad = newStrokeWidth / 2;
            svg.setAttribute("viewBox", `${x - pad} ${y - pad} ${w + 2 * pad} ${h + 2 * pad}`);
        }

        // Update existing <style> rules (simple replacement, avoids stop-color)
        const styleEl = svg.querySelector("style");
        if (styleEl) {
            if (newFill != null) styleEl.textContent = styleEl.textContent.replace(/(^|[^-])fill:[^;]+;/g, `$1fill:${newFill};`);
            if (newStroke != null) styleEl.textContent = styleEl.textContent.replace(/stroke:[^;]+;/g, `stroke:${newStroke};`);
            if (newStrokeWidth != null) styleEl.textContent = styleEl.textContent.replace(/stroke-width:[^;]+;/g, `stroke-width:${newStrokeWidth};`);
        }

        // Inline attributes for visible shapes only, and not inside <defs>
        svg.querySelectorAll("*").forEach(el => {
            if (!PAINT_TAGS.has(el.tagName.toLowerCase())) return;
            if (el.closest("defs")) return; // don’t disturb gradients/masks/patterns

            if (newFill != null) el.setAttribute("fill", newFill);
            if (newStroke != null) el.setAttribute("stroke", newStroke);
            if (newStrokeWidth != null) el.setAttribute("stroke-width", newStrokeWidth);
        });

        return new XMLSerializer().serializeToString(doc);
    }

    function redrawSVG(svgText) {
        if (myJob !== targetImage._paintJobId) return; // still same job?

        const uri = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgText);
        const imgEl = targetImage.img;

        imgEl.onload = () => {
            if (myJob !== targetImage._paintJobId) return;
            targetImage.width = origW;  // keep box size
            targetImage.height = origH;
            targetImage.src = uri;    // keep for save/serialize
            if (typeof drawText === "function") drawText();
        };
        imgEl.onerror = () => {
            console.warn("Failed to repaint SVG:", targetImage.originalSrc || targetImage.src);
        };
        imgEl.src = uri; // updates only this instance
    }

    // Source resolution (percent-encoded vs base64)
    if (targetImage.originalSVG) {
        redrawSVG(patchSvg(targetImage.originalSVG));
    } else if (svgUrl.startsWith("data:image/svg+xml")) {
        const afterComma = svgUrl.split(",")[1] || "";
        let raw = "";
        if (/;base64/i.test(svgUrl)) {
            try { raw = atob(afterComma); } catch { raw = ""; }
        } else {
            try { raw = decodeURIComponent(afterComma); } catch { raw = ""; }
        }
        if (raw) {
            targetImage.originalSVG = raw;
            redrawSVG(patchSvg(raw));
        } else {
            console.warn("Could not decode inline SVG data.");
        }
    } else {
        fetch(svgUrl)
            .then(r => r.text())
            .then(text => { targetImage.originalSVG = text; redrawSVG(patchSvg(text)); })
            .catch(err => console.error("Fetch SVG failed:", err));
    }
}

//No color option for fill color 
/*let previousFillColor = null; */

function SetNoFillColor() {
    const target = getSelectedImage();
    if (!target) return;

    const noColorChecked = document.getElementById("noColorCheck")?.checked || false;   // fill no-color
    const noStrokeChecked = document.getElementById("noColorCheck2")?.checked || false;  // stroke no-color
    const fillColorPicker = document.getElementById("favFillcolor");

    const strokeWidth = parseFloat(document.getElementById("ddlStrokeWidth")?.value) || 2;
    const strokeColor = noStrokeChecked ? "none" : ($("#hdnStrockColor").val() || "#000");

    if (noColorChecked) {
        // Store current fill for restore if you have a hidden field for it
        if ($("#hdnPrevFillColor").length) {
            $("#hdnPrevFillColor").val(fillColorPicker?.value || "");
        }

        // Mark fill as 'none'
        $("#hdnfillColor").val("none");
        $("#hdnfillNoColorStatus").val(true);

        // mirror on object (optional, if you serialize these)
        target.fillNoColorStatus = true;
        target.fillNoColor = "none";
        // ✅ pass the target image FIRST
        updateSelectedImageColors(target, "none", strokeColor, strokeWidth);

    } else {
        // Restore previous color if available, else use picker
        let restoreFill = fillColorPicker?.value || "#000";
        if ($("#hdnPrevFillColor").length) {
            const stored = $("#hdnPrevFillColor").val();
            if (stored && stored !== "none") restoreFill = stored;
        }

        $("#hdnfillColor").val(restoreFill);
        $("#hdnfillNoColorStatus").val(false);

        // mirror on object
        target.fillNoColorStatus = false;
        target.fillNoColor = restoreFill;

        // ✅ pass the target image FIRST
        updateSelectedImageColors(target, restoreFill, strokeColor, strokeWidth);

        // (optional) sync the picker UI if you restored from hidden
        if ($("#hdnPrevFillColor").length && $("#hdnPrevFillColor").val()) {
            if (fillColorPicker) fillColorPicker.value = restoreFill;
        }
    }
}


function ChangeStrockColor() {
    const target = getSelectedImage();
    if (!target) return;

    const noFillChecked = document.getElementById("noColorCheck")?.checked || false;

    const strockColorPicker = document.getElementById("favStrockcolor");
    const newStroke = strockColorPicker?.value || "#000";
    $("#hdnStrockColor").val(newStroke);

    // Uncheck "no stroke color"
    const noStrokeBox = document.getElementById("noColorCheck2");
    if (noStrokeBox) noStrokeBox.checked = false;

    const strokeWidth = parseFloat(document.getElementById("ddlStrokeWidth")?.value) || 2;
    if (target.isLINESvg) {
        $("#hdnfillColor").val(newStroke);
    }

    // Keep same logic for fill: if fill 'no color' is checked, send "none"
    const fillValue = noFillChecked ? "none" : ($("#hdnfillColor").val() || "#000");

    // ✅ pass target image as first argument
    updateSelectedImageColors(target, fillValue, newStroke, strokeWidth);

    // reflect state in hidden
    $("#hdnstrokeNoColorStatus").val(false);

    // (optional) mirror on object if you serialize these
    target.strokeNoColor = newStroke;
    target.strokeWidth = strokeWidth;
    target.strokeNoColor = document.getElementById('favStrockcolor')?.value || "#FFFFFF";
}

//No color option for stroke color 
let previousStrokeColor = null; // Store the previous stroke color

function SetNoStrokeColor() {
    const target = getSelectedImage();
    if (!target) return;

    const noStrokeChecked = document.getElementById("noColorCheck2")?.checked || false; // stroke no-color
    const strokeColorPicker = document.getElementById("favStrockcolor");
    const noFillChecked = document.getElementById("noColorCheck")?.checked || false;    // fill no-color
    const strokeWidth = parseFloat(document.getElementById("ddlStrokeWidth")?.value) || 2;

    if (noStrokeChecked) {
        // remember current stroke color (optional)
        if ($("#hdnPrevStrokeColor").length) {
            $("#hdnPrevStrokeColor").val(strokeColorPicker?.value || "");
        }

        // mark stroke as none
        $("#hdnStrockColor").val("none");
        $("#hdnstrokeNoColorStatus").val(true);

        const fillValue = noFillChecked ? "none" : ($("#hdnfillColor").val() || "#000");

        // ✅ target image FIRST
        updateSelectedImageColors(target, fillValue, "none", strokeWidth);

        // mirror on object (optional for serialization)
        target.strokeNoColor = "none";
        target.strokeWidth = strokeWidth;
        target.strokeNoColorStatus = true;


    } else {
        // restore stroke color (prefer saved value if present)
        let restoreStroke = strokeColorPicker?.value || "#000";
        if ($("#hdnPrevStrokeColor").length) {
            const stored = $("#hdnPrevStrokeColor").val();
            if (stored && stored !== "none") restoreStroke = stored;
        }

        $("#hdnStrockColor").val(restoreStroke);
        $("#hdnstrokeNoColorStatus").val(false);

        const fillValue = noFillChecked ? "none" : ($("#hdnfillColor").val() || "#000");

        // ✅ target image FIRST
        updateSelectedImageColors(target, fillValue, restoreStroke, strokeWidth);

        // sync picker if we restored from hidden (optional)
        if ($("#hdnPrevStrokeColor").length && $("#hdnPrevStrokeColor").val()) {
            if (strokeColorPicker) strokeColorPicker.value = restoreStroke;
        }

        // mirror on object (optional)
        target.strokeNoColor = restoreStroke;
        target.strokeWidth = strokeWidth;
        target.strokeNoColorStatus = false;
    }
}

//stroke width change function
function strokeWidthChanges() {
    const selectEl = document.getElementById("ddlStrokeWidth");
    let strokeWidth = parseFloat(selectEl?.value ?? 0);
    if (!Number.isFinite(strokeWidth)) strokeWidth = 0;

    // highlight selected option
    if (selectEl) {
        Array.from(selectEl.options).forEach(opt => opt.classList.remove("selected"));
        if (selectEl.selectedIndex >= 0) {
            selectEl.options[selectEl.selectedIndex].classList.add("selected");
        }
    }

    if (!activeImage) return;

    // persist in UI/model
    $("#hdnStrokeWidth").val(String(strokeWidth));
    activeImage.strokeWidth = strokeWidth;
    // If this is the special line SVG, use stroke width as its visual thickness
    if (activeImage.type === "image" && activeImage.isLINESvg === true) {
        const H = canvas?.height ?? Infinity;
        const minH = 1;
        const newH = Math.max(minH, strokeWidth);

        // keep center anchored
        const cy = (activeImage.y || 0) + (activeImage.height || minH) / 2;
        activeImage.height = newH;
        activeImage.y = cy - newH / 2;

        // clamp inside canvas vertically
        if (Number.isFinite(H)) {
            if (activeImage.y < 0) activeImage.y = 0;
            if (activeImage.y + activeImage.height > H) {
                activeImage.y = Math.max(0, H - activeImage.height);
            }
        }
        $("#hdnfillColor").val($("#hdnStrockColor").val());
    }

    // compute fill/stroke respecting "no color" checkboxes
    const noFill = !!document.getElementById("noColorCheck")?.checked;
    const noStroke = !!document.getElementById("noColorCheck2")?.checked;

    const fill = noFill ? "none" : ($("#hdnfillColor").val() || activeImage.fillNoColor || "#FFFFFF");
    const stroke = noStroke ? "none" : ($("#hdnStrockColor").val() || activeImage.strokeNoColor || "#000000");

    // ✅ correct argument order: (targetImage, newFill, newStroke, newStrokeWidth)
    if (activeImage.type === "image" && activeImage.img) {
        updateSelectedImageColors(activeImage, fill, stroke, strokeWidth);
    } else {
        // non-SVG fallback
        drawText?.();
    }

    // ensure the canvas reflects the new height immediately
    drawText?.();
}





function TabShowHide(type) {
    if (type === 'In') {
        $("#hdnTabType").val('In');
        $("#marzen").css("display", "block");
        $("#rauchbier").css("display", "none");
        $("#dunkles").css("display", "none");
    }
    else if (type === 'Stay') {
        $("#hdnTabType").val('Stay');
        $("#marzen").css("display", "none");
        $("#rauchbier").css("display", "block");
        $("#dunkles").css("display", "none");
    }
    else if (type === 'Out') {
        $("#hdnTabType").val('Out');
        $("#marzen").css("display", "none");
        $("#rauchbier").css("display", "none");
        $("#dunkles").css("display", "block");
    }
    // Set the corresponding radio button as checked
    if (type === 'In') {
        document.getElementById("tab1").checked = true;
    } else if (type === 'Stay') {
        document.getElementById("tab2").checked = true;
    } else if (type === 'Out') {
        document.getElementById("tab3").checked = true;
    }

}
function updateEffectButtons(type) {
    // 1) pick the right hidden‑field based on In vs Out
    const hiddenField = (type === 'In')
        ? `#hdnEffectSlide${activeSlide}`
        : `#hdnOutEffectSlide${activeSlide}`;
    const effectType = $(hiddenField).val();

    // 2) clear any previously active button
    // $('.effect_btn').removeClass('active_effect');

    // 3) pick the button selector
    let btnSelector = null;
    if (type === 'In') {
        $('.effectIn_btn').removeClass('active_effect');
        if (effectType === 'delaylinear') btnSelector = '#adelaylinear';
        else if (effectType === 'delaylinear2') btnSelector = '#adelaylinear2';
        else if (effectType === 'roll') btnSelector = '#aroll';
        else if (effectType === 'popcorn') btnSelector = '#apopcorn';
        else if (effectType === 'mask') btnSelector = '#amask';
        else if (effectType === 'zoom') btnSelector = '#azoom';
    } else {
        $('.effectOut_btn').removeClass('active_effect');
        if (effectType === 'delaylinear') btnSelector = '#adelaylinearOut1';
        else if (effectType === 'delaylinear2') btnSelector = '#adelaylinearOut2';
        else if (effectType === 'roll') btnSelector = '#arollOut';
        else if (effectType === 'popcorn') btnSelector = '#apopcornOut';
        else if (effectType === 'mask') btnSelector = '#amaskOut';
        else if (effectType === 'zoom') btnSelector = '#azoomOut';
    }
    //if (effectType === 'roll') {
    //    document.getElementById('abottom')?.classList.add('disabled-ani-button');
    //    document.getElementById('atop')?.classList.add('disabled-ani-button');
    //    document.getElementById('obottom')?.classList.add('disabled-ani-button');
    //    document.getElementById('otop')?.classList.add('disabled-ani-button');


    //} else {
    //    document.getElementById('abottom')?.classList.remove('disabled-ani-button');
    //    document.getElementById('atop')?.classList.remove('disabled-ani-button');
    //    document.getElementById('obottom')?.classList.remove('disabled-ani-button');
    //    document.getElementById('otop')?.classList.remove('disabled-ani-button');
    //}
    // 4) activate it (if any)
    if (btnSelector) {
        $(btnSelector).addClass('active_effect');
    }
}
function updateDirectionButtons(type) {
    // 1) pick the right hidden‑field based on In vs Out
    const hiddenField = (type === 'In')
        ? `#hdnDirectiontSlide${activeSlide}`
        : `#hdnOutDirectiontSlide${activeSlide}`;
    const directionType = $(hiddenField).val();

    // 2) clear any previously active button
    // $('.effect_btn').removeClass('active_effect');

    // 3) pick the button selector
    let btnSelector = null;
    if (type === 'In') {
        $('.direction_link').removeClass('active_effect');
        if (directionType === 'left') btnSelector = '#aleft';
        else if (directionType === 'right') btnSelector = '#aright';
        else if (directionType === 'bottom') btnSelector = '#abottom';
        else if (directionType === 'top') btnSelector = '#atop';
    } else {
        $('.direction_link .out_link').removeClass('active_effect');
        if (directionType === 'left') btnSelector = '#oleft';
        else if (directionType === 'right') btnSelector = '#oright';
        else if (directionType === 'bottom') btnSelector = '#obottom';
        else if (directionType === 'top') btnSelector = '#otop';
    }

    // 4) activate it (if any)
    if (btnSelector) {
        $(btnSelector).addClass('active_effect');
    }
}



//Listen for clicks on the dropdown menu.
//document.getElementById('ddlSpeedControl').addEventListener('click', function (event) {
//    if (event.target.matches('a.dropdown-item')) {
//        // Retrieve the 'value' attribute from the clicked dropdown item.
//        selectedInSpeed = event.target.getAttribute('value');
//        document.getElementById('lblSpeed').textContent = event.target.textContent;
//    }
//});


//document.getElementById('ddlSecondsControl').addEventListener('click', function (event) {
//    if (event.target.matches('a.dropdown-item')) {
//        // Retrieve the 'value' attribute from the clicked dropdown item.
//        selectedStaySpeed = event.target.getAttribute('value');
//        document.getElementById('lblSeconds').textContent = event.target.textContent;
//    }
//});

//document.getElementById('ddlOutSpeedControl').addEventListener('click', function (event) {
//    if (event.target.matches('a.dropdown-item')) {
//        // Retrieve the 'value' attribute from the clicked dropdown item.
//        selectedOutSpeed = event.target.getAttribute('value');
//        document.getElementById('lblOutSpeed').textContent = event.target.textContent;
//    }
//});
//document.getElementById('ddlLoopControl').addEventListener('click', function (event) {
//    if (event.target.matches('a.dropdown-item')) {
//        // Retrieve the 'value' attribute from the clicked dropdown item.
//        selectedInSpeed = event.target.getAttribute('value');
//        document.getElementById('lblLoop').textContent = event.target.textContent;
//        $("#hdnlLoopControl").val(selectedInSpeed);
//    }
//});
//Calculate scroll height that travell
canvasContainer.addEventListener("scroll", function () {
    scrollTop = canvasContainer.scrollTop;
});



// Make images draggable from the DOM
document.querySelectorAll("#imageContainer img").forEach(img => {
    img.addEventListener("dragstart", function (e) {
        // Transfer the image src as text
        e.dataTransfer.setData("text/plain", e.target.src);
    });
});

//// Allow dropping on canvas
//canvas.addEventListener("dragover", function (e) {
//    e.preventDefault();
//});
canvas.addEventListener('dragover', e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
});
// --------------------------------------------------------------------
// Basic-shape detector
// --------------------------------------------------------------------
const __BASIC_SHAPES = new Set([
    //'ico-shapes-circle.svg',
    // 'ico-shapes-heart.svg',
    // 'ico-shapes-hexagon.svg',
    //'ico-shapes-line.svg',
    'ico-shapes-rec.svg',
    //'ico-shapes-triangle.svg'
]);

function __isBasicFromSource(src, fileName = '') {
    // 1) filename passed explicitly (e.g., File.name)
    if (fileName) {
        const n = fileName.toLowerCase();
        if (__BASIC_SHAPES.has(n)) return true;
    }

    // 2) pull filename from URL / relative path
    try {
        const u = new URL(String(src), window.location.href);
        const name = (u.pathname.split('/').pop() || '').toLowerCase();
        if (__BASIC_SHAPES.has(name)) return true;
    } catch {
        const name = String(src).split(/[?#]/)[0].split('/').pop().toLowerCase();
        if (__BASIC_SHAPES.has(name)) return true;
    }

    // 3) data: URLs — peek at the SVG text for the tokens
    if (String(src).startsWith('data:image/svg')) {
        let svgText = '';
        try {
            const payload = src.split(',')[1] || '';
            // base64?
            if (/;base64/i.test(src)) svgText = atob(payload);
            else svgText = decodeURIComponent(payload);
            const s = svgText.toLowerCase();
            if (
                //   s.includes('ico-shapes-circle') ||
                //  s.includes('ico-shapes-heart') ||
                //  s.includes('ico-shapes-hexagon') ||
                //   s.includes('ico-shapes-line') ||
                s.includes('ico-shapes-rec')
                //  s.includes('ico-shapes-triangle')
            ) return true;
        } catch { /* ignore */ }
    }

    return false;
}

// --------------------------------------------------------------------
// DROP: create image + mark whether it is a BASIC SHAPE
// --------------------------------------------------------------------


canvas.addEventListener('drop', e => {
    e.preventDefault();

    let src = "";
    let droppedFileName = "";

    // 1) text/uri-list (drag from web)
    if (e.dataTransfer.types?.includes('text/uri-list')) {
        src = e.dataTransfer.getData('text/uri-list').trim();
    } else {
        // fallback: plain text that looks like a URL or path
        const plain = (e.dataTransfer.getData('text/plain') || "").trim();
        if (plain) src = plain;
    }

    // 2) local files (drag from Finder/Explorer)
    if (!src && e.dataTransfer.files?.length > 0) {
        const file = e.dataTransfer.files[0];
        if (file.type.startsWith('image/')) {
            src = URL.createObjectURL(file);
            droppedFileName = file.name || "";
        }
    }

    if (!src) return;

    // ─────────────────────────────────────────────────────────────
    // A) Normalize *_thumb → full filename (before creating Image)
    //    Examples:
    //    Car-Dealerships-02_20250830_011740_thumb.png
    //    → Car-Dealerships-02_20250830_011740.png
    (function normalizeThumbSuffix() {
        const stripThumb = (name) => name.replace(/_thumb(?=\.[^.\/?#]+$)/i, "");

        // Update visible dropped file name if present
        if (droppedFileName && /_thumb(?=\.[^.\/?#]+$)/i.test(droppedFileName)) {
            droppedFileName = stripThumb(droppedFileName);
        }

        // Update src if it looks like a URL/path string containing *_thumb.*
        if (/_thumb(?=\.[^.\/?#]+$)/i.test(src)) {
            try {
                const u = new URL(src, location.href);
                const parts = u.pathname.split("/");
                const last = parts.pop() || "";
                const fixed = stripThumb(last);
                if (fixed !== last) {
                    parts.push(fixed);
                    u.pathname = parts.join("/");
                    src = u.toString();
                }
            } catch {
                // not a URL → plain path or data string; do a direct replace
                src = stripThumb(src);
            }
        }
    })();
    // ─────────────────────────────────────────────────────────────

    const img = new Image();

    // ✅ mark whether this is one of the 6 basic shape SVGs
    const isBasic = __isBasicFromSource(src, droppedFileName);
    // extract file name (for BasicName check)
    let basicName = "";
    try {
        basicName = new URL(src, location.href).pathname.split('/').pop() || "";
    } catch {
        basicName = (droppedFileName || src).split(/[?#]/)[0].split('/').pop() || "";
    }
    const isLine = __isLINESvg(basicName);
    // IMPORTANT: create & select the object *before* the image loads,
    // so UI actions (fill/stroke) after drop hit THIS object.
    const newImgObj = {
        img,
        src,
        x: e.offsetX,
        y: e.offsetY,
        // provisional size; will be corrected in onload
        width: 1,
        height: 1,
        scaleX: 1,
        scaleY: 1,
        opacity: 100,
        selected: true,
        noAnim: false,
        groupId: null,
        rotation: 0,
        type: "image",
        zIndex: getNextZIndex(),
        fillNoColorStatus: false,
        strokeNoColorStatus: false,
        fillNoColor: "#42b3f5",
        strokeNoColor: "#000000",
        strokeWidth: 0.1,
        isBasic: isBasic,
        isLINESvg: isLine,
        __capsOrientation: 'horizontal',
        basicName: basicName,
        loading: true,
        curvature:0
    };

    // Deselect others and set selection pointers *now*
    images.forEach(it => { if (it) it.selected = false; });
    textObjects.forEach(t => { if (t) t.selected = false; });
    images.push(newImgObj);

    // keep both pointers in sync; many older paths still use activeImage
    activeBox = newImgObj;
    activeImage = newImgObj;

    // 👇 ensure it renders on top
    if (typeof bringToFront === 'function') {
        bringToFront(newImgObj);
    } else {
        // fallback if helper doesn't exist
        const all = [...images, ...textObjects].filter(Boolean);
        const maxZ = all.length ? Math.max(...all.map(o => o.zIndex || 0)) : 0;
        newImgObj.zIndex = maxZ + 1;
    }
    // try { ChangeFillColor(); } catch (_) { }

    img.onload = () => {
        const MAX_DIM = 300;
        const iw = img.naturalWidth || img.width || 1;
        const ih = img.naturalHeight || img.height || 1;
        const scale = Math.min(1, MAX_DIM / Math.max(iw, ih));

        newImgObj.height = Math.max(1, Math.round(ih * scale));
        newImgObj.width = Math.max(1, Math.round(iw * scale));
        if (isLine) {
            newImgObj.height = 5;
            newImgObj.width = 250;
        } else {
            newImgObj.height = Math.max(1, Math.round(ih * scale));
        }
        newImgObj.loading = false;

        // keep it selected after load
        newImgObj.selected = true;
        activeBox = newImgObj;
        activeImage = newImgObj;

        drawText();
    };

    img.onerror = () => {
        // If it fails, clear the pointers to avoid coloring a stale object
        if (activeBox === newImgObj) activeBox = null;
        if (activeImage === newImgObj) activeImage = null;
    };

    img.src = src;
});



//canvas.addEventListener('drop', e => {
//    e.preventDefault();

//    let src = "";

//    // 1) Preferred: a real URI (e.g. dragging from another site)
//    // try text/uri-list first (for standards-compliant browsers)
//    if (e.dataTransfer.types.includes('text/uri-list')) {
//        src = e.dataTransfer.getData('text/uri-list').trim();
//    }
//    // fallback: if plain text *looks* like an http URL
//    else {
//        const plain = e.dataTransfer.getData('text/plain').trim();
//        if (/^https?:\/\//i.test(plain)) {
//            src = plain;
//        }
//    }

//    // 2) If that fails, check for File objects (drag from Finder or Explorer)
//    if (!src && e.dataTransfer.files.length > 0) {
//        const file = e.dataTransfer.files[0];
//        if (file.type.startsWith('image/')) {
//            src = URL.createObjectURL(file);
//        }
//    }

//    // 3) Nothing valid? bail out
//    if (!src) return;

//    const img = new Image();
//    img.onload = () => {
//        // maximum dimension on drop
//        const MAX_DIM = 300;

//        // compute ratio so the longest side is MAX_DIM
//        const ratio = img.width > img.height
//            ? MAX_DIM / img.width
//            : MAX_DIM / img.height;

//        // never upscale small images
//        const scale = Math.min(ratio, 1);

//        // new “design-space” dimensions
//        const newWidth = img.width * scale;
//        const newHeight = img.height * scale;
//        const newImgObj = {
//            img,
//            src,
//            x: e.offsetX,
//            y: e.offsetY,
//            width: newWidth,
//            height: newHeight,
//            scaleX: 1,
//            scaleY: 1,
//            opacity: 100,
//            selected: true,            // ⬅ select it
//            noAnim: false,
//            groupId: null,
//            rotation: 0,
//            type: "image",
//            zIndex: getNextZIndex(),
//            fillNoColorStatus: false,
//            strokeNoColorStatus: false,
//            fillNoColor: "#FFFFFF",
//            strokeNoColor: "#FFFFFF",
//            strokeWidth: parseInt(document.getElementById('ddlStrokeWidth').value, 10) || .5
//        };
//        images.forEach(it => it.selected = false);
//        textObjects.forEach(t => t.selected = false);
//        images.push(newImgObj);
//        activeBox = newImgObj;       // ⬅ reuse same selected “box” concept
//        drawText();
//        //ChangeFillColor();
//    };
//    img.src = src;
//});


function deg2rad(a) { return a * Math.PI / 180; }

function rectCenter(o) {
    return { cx: o.x + o.width / 2, cy: o.y + o.height / 2 };
}

function toLocal(o, mx, my) {
    const { cx, cy } = rectCenter(o);
    const ang = -deg2rad(o.rotation || 0);
    const cos = Math.cos(ang), sin = Math.sin(ang);
    const dx = mx - cx, dy = my - cy;
    return { x: dx * cos - dy * sin + o.width / 2, y: dx * sin + dy * cos + o.height / 2 };
}

function pointInBox(o, mx, my) {
    const p = toLocal(o, mx, my);
    return p.x >= 0 && p.x <= o.width && p.y >= 0 && p.y <= o.height;
}

function whichHandle(box, mx, my) {
    const { cx, cy } = rectCenter(box);
    const ang = deg2rad(box.rotation || 0);
    const cos = Math.cos(ang), sin = Math.sin(ang);
    const halfW = box.width / 2, halfH = box.height / 2, H = HANDLE_SIZE / 2;

    const centers = {
        tl: { x: -halfW, y: -halfH }, tr: { x: halfW, y: -halfH },
        bl: { x: -halfW, y: halfH }, br: { x: halfW, y: halfH },
        l: { x: -halfW, y: 0 }, r: { x: halfW, y: 0 },
        t: { x: 0, y: -halfH }, b: { x: 0, y: halfH }
    };

    for (const k in centers) {
        const p = centers[k];
        const sx = cx + p.x * cos - p.y * sin;
        const sy = cy + p.x * sin + p.y * cos;
        if (mx >= sx - H && mx <= sx + H && my >= sy - H && my <= sy + H) return k;
    }
    return null;
}

function getAllHandles(o) {
    // returns handle rects in *screen space*, rotation-aware (we’ll draw test in object local)
    // We'll test in local space like the box; handle keys: tl,tr,bl,br,t,r,b,l
    const hs = HANDLE_SIZE, half = hs / 2;
    const ptsLocal = {
        tl: { x: 0, y: 0 },                                   // top-left
        tr: { x: o.width, y: 0 },
        bl: { x: 0, y: o.height },
        br: { x: o.width, y: o.height },
        t: { x: o.width / 2, y: 0 },
        r: { x: o.width, y: o.height / 2 },
        b: { x: o.width / 2, y: o.height },
        l: { x: 0, y: o.height / 2 }
    };
    // rotate each local point into screen coords
    const { cx, cy } = rectCenter(o);
    const cos = Math.cos(deg2rad(o.rotation || 0));
    const sin = Math.sin(deg2rad(o.rotation || 0));
    const out = {};
    for (const k in ptsLocal) {
        const lx = ptsLocal[k].x - o.width / 2;
        const ly = ptsLocal[k].y - o.height / 2;
        const sx = cx + lx * cos - ly * sin;
        const sy = cy + lx * sin + ly * cos;
        out[k] = { key: k, x: sx, y: sy, w: hs, h: hs };
    }
    return out;
}

//const HANDLE_SIZE = 8;




function drawSelection(o) {
    const { cx, cy } = rectCenter(o);
    const hs = HANDLE_SIZE, half = hs / 2;
    const place = (lx, ly) => ctx.fillRect(lx - half, ly - half, hs, hs);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(deg2rad(o.rotation || 0));
    ctx.strokeStyle = "red"; ctx.lineWidth = 1;
    ctx.strokeRect(-o.width / 2, -o.height / 2, o.width, o.height);
    ctx.fillStyle = "blue";
    place(-o.width / 2, -o.height / 2);  // tl
    place(o.width / 2, -o.height / 2);  // tr
    place(-o.width / 2, o.height / 2);  // bl
    place(o.width / 2, o.height / 2);  // br
    place(0, -o.height / 2);           // t
    place(0, o.height / 2);           // b
    place(-o.width / 2, 0);            // l
    place(o.width / 2, 0);            // r
    ctx.restore();
}


function updateSelectedImageColorsOld(newFill, newStroke) {
    if (activeImage && activeImage.src && activeImage.src.endsWith('.svg')) {
        if (activeImage.originalSVG) {
            applySvgColorChanges(activeImage.originalSVG);
        } else {
            fetch(activeImage.src)
                .then(response => response.text())
                .then(svgText => {
                    activeImage.originalSVG = svgText; // Cache original markup
                    applySvgColorChanges(svgText);
                })
                .catch(err => console.error("Error fetching SVG:", err));
        }
    }
}
//canvas.on('selection:created', e => {
//    if (e.target && e.target.src?.endsWith('.svg')) {
//        activeImage = e.target;
//    }
//});
//canvas.on('selection:updated', e => {
//    if (e.target && e.target.src?.endsWith('.svg')) {
//        activeImage = e.target;
//    }
//});

function handleSvgSelection(e) {
    if (e.selected && e.selected.length > 0) {
        const target = e.selected[0];
        if (target && target.src?.endsWith('.svg')) {
            activeImage = target;
        }
    }
}

// Only bind if canvas supports .on (i.e. Fabric.js is in use)
if (canvas && typeof canvas.on === 'function') {
    canvas.on('selection:created', handleSvgSelection);
    canvas.on('selection:updated', handleSvgSelection);

    canvas.on('selection:cleared', () => {
        activeImage = null;
    });
}











function applySvgColorChangesOld(svgText) {
    // Update fill attributes
    let updatedSvg = svgText.replace(/fill="[^"]*"/gi, `fill="${newFill}"`);
    // Update stroke attributes (if exists, replace; if not, insert stroke attribute)
    if (/stroke="[^"]*"/gi.test(updatedSvg)) {
        updatedSvg = updatedSvg.replace(/stroke="[^"]*"/gi, `stroke="${newStroke}"`);
    } else {
        updatedSvg = updatedSvg.replace(/<svg([^>]*)>/i, `<svg$1 stroke="${newStroke}">`);
    }

    // Save the updated markup to a property (for later saving)
    activeImage.svgData = updatedSvg;

    // Create a new Blob URL for displaying the updated image
    const svgBlob = new Blob([updatedSvg], { type: 'image/svg+xml;charset=utf-8' });
    const newUrl = URL.createObjectURL(svgBlob);

    const updatedImg = new Image();
    updatedImg.onload = function () {
        activeImage.img = updatedImg;
        activeImage.src = newUrl;
        drawCanvas('Common');
    };
    updatedImg.src = newUrl;
}

function applySvgColorChanges(svgText, newFill, newStroke) {
    // parse it
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgText, "image/svg+xml");

    // 1a) update any <style> rules
    const styleEl = doc.querySelector("style");
    if (styleEl) {
        // replace all fill:…; and stroke:…; in the CSS
        styleEl.textContent = styleEl.textContent
            .replace(/fill:[^;]+;/g, `fill:${newFill};`)
            .replace(/stroke:[^;]+;/g, `stroke:${newStroke};`);
    }

    // 1b) update inline attributes on every element
    doc.querySelectorAll("*").forEach(el => {
        if (newFill) el.setAttribute("fill", newFill);
        if (newStroke) el.setAttribute("stroke", newStroke);
    });

    // serialize back to a string
    return new XMLSerializer().serializeToString(doc);
}
const backgroundColorPicker = document.getElementById("favBackgroundcolor");
function hideBack() {
    const popup = document.getElementById("background_popup");
    if (popup) {
        popup.style.display = "none";
    }
    // document.getElementById("modeButton").innerText = "Graphic Mode";
}

function ChangeAllBackgroundColor() {
    $("#hdnBackgroundAllColor").val(backgroundColorPicker.value);
    //RemoveBackgroundImage
    canvas.bgImage = null;
    drawCanvas('Common'); // Redraw the canvas without the background image.
    setAllCanvasesBackground('.clsmyCanvas', backgroundColorPicker.value);
}
function ChangeSpecificBackgroundColor(controlid) {
    const backgroundSpecificColorPicker = document.getElementById("favBackgroundSpecificcolor");
    $("#hdnBackgroundSpecificColor").val(backgroundSpecificColorPicker.value);
    //RemoveBackgroundImage
    canvas._bgImg = null;
    canvas.style.backgroundImage = 'none';
    //drawCanvas('Common'); // Redraw the canvas without the background image.
    drawText();
    setCanvasBackground(controlid, backgroundSpecificColorPicker.value);
}
function setCanvasBackgroundOld(canvasId, color) {
    /* document.getElementById(canvasId).style.backgroundColor = color;*/
    ctx.fillStyle = color;
    // ctx.fillRect(0, 0, canvas.width, canvas.height);
}
function setAllCanvasesBackground(selector, color) {
    const canvases = document.querySelectorAll(selector);
    canvases.forEach(canvas => {
        canvas.style.backgroundColor = color;
    });
}
function setCanvasBackground(canvasId, color) {
    document.getElementById(canvasId).style.backgroundColor = color;
}
function setCanvasBackgroundImage(imageSrc) {
    const bgImage = new Image();
    bgImage.onload = function () {
        // Clear the canvas, then draw the background image to fill the canvas.
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Draw the image so that it fills the entire canvas.
        ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
        // Optionally, you can store the background image info for later use.
        canvas._bgImg = bgImage;
    };
    bgImage.src = imageSrc;
    $("#hdnBackgroundImage").val(imageSrc);
    $('#chkRemoveBackground').prop('checked', true);
    $("#hdnBackgroundSpecificColor").val("rgba(255, 255, 255, 0.95)");
}

//function setCanvasBackgroundImage(imageSrc) {
//    const bgImage = new Image();
//    bgImage.onload = function () {
//        ctx.clearRect(0, 0, canvas.width, canvas.height);

//        // Calculate scale while preserving aspect ratio
//        const imageAspectRatio = bgImage.width / bgImage.height;
//        const canvasAspectRatio = canvas.width / canvas.height;

//        let drawWidth, drawHeight, offsetX, offsetY;

//        if (imageAspectRatio > canvasAspectRatio) {
//            // Image is wider than canvas
//            drawHeight = canvas.height;
//            drawWidth = bgImage.width * (canvas.height / bgImage.height);
//            offsetX = -(drawWidth - canvas.width) / 2;
//            offsetY = 0;
//        } else {
//            // Image is taller than canvas
//            drawWidth = canvas.width;
//            drawHeight = bgImage.height * (canvas.width / bgImage.width);
//            offsetX = 0;
//            offsetY = -(drawHeight - canvas.height) / 2;
//        }

//        ctx.drawImage(bgImage, offsetX, offsetY, drawWidth, drawHeight);

//        canvas._bgImg = bgImage;
//    };
//    bgImage.src = imageSrc;

//    $("#hdnBackgroundImage").val(imageSrc);
//    $('#chkRemoveBackground').prop('checked', true);
//    $("#hdnBackgroundSpecificColor").val("rgba(255, 255, 255, 0.95)");
//}

function RemoveBackgroundImage() {
    canvas._bgImg = null;
    drawCanvas('Common'); // Redraw the canvas without the background image.

}
function clearCanvasOld() {
    const canvas = document.getElementById("myCanvas");
    const ctx = canvas.getContext("2d");
    canvas._bgImg = null;
    // Clear the entire canvas
    ctx.fillStyle = "#ffffff"; // Your desired background color
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    gsap.globalTimeline.clear();
    canvas.width = canvas.width;
    images = [];
    textObjects = [];
    //canvas.clear()
}
function clearCanvas() {
    const canvas = document.getElementById("myCanvas");
    const ctx = canvas.getContext("2d");

    // 1) Drop any background image reference
    canvas._bgImg = null;

    // 2) Clear the existing pixels
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 3) Paint a solid white background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 4) Reset your animation timeline / state
    gsap.globalTimeline.clear();

    // 5) Clear your data arrays
    images = [];
    textObjects = [];

    // (No need for canvas.width = canvas.width hack unless you
    //  intentionally want to reset state such as transforms.)
}




//const arrowImage = new Image();
//arrowImage.src = "/images/icons/icon-lr.png";

//function getEase() {
//    return animationMode === "bounce" ? "bounce.out" : "linear";
//}

//function drawArrow(ctx, x, centerY) {
//    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
//    ctx.save();
//    ctx.translate(x, centerY);
//    const type = document.getElementById("hdnTextAnimationType").value;
//    if (type === "zoom") {
//        ctx.drawImage(arrowImage, -25, -25, 50, 50);
//    } else if (type === "blur") {
//        ctx.filter = "blur(4px)";
//        ctx.drawImage(arrowImage, -20, -20, 40, 40);
//        ctx.filter = "none";
//    } else {
//        ctx.drawImage(arrowImage, -20, -20, 40, 40);
//    }
//    ctx.restore();
//}

//// grab elements & context
//const miniCanvasAleft = document.getElementById('miniCanvas_aleft');
//const ctxAleft = miniCanvasAleft.getContext('2d');
//const centerX_left = miniCanvasAleft.width / 2;
//const centerY_left = miniCanvasAleft.height / 2;

//// draw the arrow at center immediately
//drawArrow(ctxAleft, centerX_left, centerY_left);

//// animate on hover
//miniCanvasAleft.addEventListener('mouseenter', () => {
//    drawArrow(ctxAleft, 0, centerY_left);
//    gsap.to({ pos: 0 }, {
//        duration: 0.5,
//        pos: centerX_left,
//        ease: getEase(),
//        onUpdate() {
//            drawArrow(ctxAleft, this.targets()[0].pos, centerY_left);
//        }
//    });
//});

//miniCanvasAleft.addEventListener('mouseleave', () => {
//    gsap.to({ pos: centerX_left }, {
//        duration: 0.5,
//        pos: centerX_left,
//        ease: getEase(),
//        onUpdate() {
//            drawArrow(ctxAleft, this.targets()[0].pos, centerY_left);
//        }
//    });
//});

//// --------------------------------------------------------------------
//// 2. Right-to-Center (Canvas id: "miniCanvas_aright")
//const miniCanvasAright = document.getElementById('miniCanvas_aright');
//const ctxAright = miniCanvasAright.getContext('2d');
//const centerX_right = miniCanvasAright.width / 2;
//const centerY_right = miniCanvasAright.height / 2;

//// Helper to draw & rotate the arrow so it points left
//function drawArrowFromRight(x) {
//    ctxAright.clearRect(0, 0, miniCanvasAright.width, miniCanvasAright.height);
//    ctxAright.save();
//    ctxAright.translate(x, centerY_right);
//    ctxAright.rotate(Math.PI);  // flip 180°
//    const type = document.getElementById("hdnTextAnimationType").value;
//    if (type === "zoom") {
//        ctxAright.drawImage(arrowImage, -25, -25, 50, 50);
//    } else if (type === "blur") {
//        ctxAright.filter = "blur(4px)";
//        ctxAright.drawImage(arrowImage, -20, -20, 40, 40);
//        ctxAright.filter = "none";
//    } else {
//        ctxAright.drawImage(arrowImage, -20, -20, 40, 40);
//    }
//    ctxAright.restore();
//}

//// draw arrow centered by default
//drawArrowFromRight(centerX_right);

//// animate on hover
//miniCanvasAright.addEventListener('mouseenter', () => {
//    // start off-screen at right edge
//    drawArrowFromRight(miniCanvasAright.width);
//    gsap.to({ pos: miniCanvasAright.width }, {
//        duration: 0.5,
//        pos: centerX_right,
//        ease: getEase(),
//        onUpdate() {
//            drawArrowFromRight(this.targets()[0].pos);
//        }
//    });
//});

//miniCanvasAright.addEventListener('mouseleave', () => {
//    // smoothly “reset” to center (or just remain)
//    gsap.to({ pos: centerX_right }, {
//        duration: 0.5,
//        pos: centerX_right,
//        ease: getEase(),
//        onUpdate() {
//            drawArrowFromRight(this.targets()[0].pos);
//        }
//    });
//});


//// --------------------------------------------------------------------
//// 3. Bottom-to-Center (Canvas id: "miniCanvas_abottom")
//const miniCanvasAbottom = document.getElementById('miniCanvas_abottom');
//const ctxAbottom = miniCanvasAbottom.getContext('2d');
//const centerX_bottom = miniCanvasAbottom.width / 2;
//const centerY_bottom = miniCanvasAbottom.height / 2;

//// Draw & rotate the arrow so it points up
//function drawArrowFromBottom(y) {
//    ctxAbottom.clearRect(0, 0, miniCanvasAbottom.width, miniCanvasAbottom.height);
//    ctxAbottom.save();
//    ctxAbottom.translate(centerX_bottom, y);
//    ctxAbottom.rotate(-Math.PI / 2);  // rotate -90°
//    const type = document.getElementById("hdnTextAnimationType").value;
//    if (type === "zoom") {
//        ctxAbottom.drawImage(arrowImage, -25, -25, 50, 50);
//    } else if (type === "blur") {
//        ctxAbottom.filter = "blur(4px)";
//        ctxAbottom.drawImage(arrowImage, -20, -20, 40, 40);
//        ctxAbottom.filter = "none";
//    } else {
//        ctxAbottom.drawImage(arrowImage, -20, -20, 40, 40);
//    }
//    ctxAbottom.restore();
//}

//// Draw arrow at center on load
//drawArrowFromBottom(centerY_bottom);

//// Animate on hover
//miniCanvasAbottom.addEventListener('mouseenter', () => {
//    // start off-screen at bottom edge
//    drawArrowFromBottom(miniCanvasAbottom.height);
//    gsap.to({ pos: miniCanvasAbottom.height }, {
//        duration: 0.5,
//        pos: centerY_bottom,
//        ease: getEase(),
//        onUpdate() {
//            drawArrowFromBottom(this.targets()[0].pos);
//        }
//    });
//});

//miniCanvasAbottom.addEventListener('mouseleave', () => {
//    // smoothly reset to center
//    gsap.to({ pos: centerY_bottom }, {
//        duration: 0.5,
//        pos: centerY_bottom,
//        ease: getEase(),
//        onUpdate() {
//            drawArrowFromBottom(this.targets()[0].pos);
//        }
//    });
//});


//// --------------------------------------------------------------------
//// 4. Top-to-Center (Canvas id: "miniCanvas_atop")
//const miniCanvasAtop = document.getElementById('miniCanvas_atop');
//const ctxAtop = miniCanvasAtop.getContext('2d');
//const centerX_top = miniCanvasAtop.width / 2;
//const centerY_top = miniCanvasAtop.height / 2;

//// Draw & rotate the arrow so it points down
//function drawArrowFromTop(y) {
//    ctxAtop.clearRect(0, 0, miniCanvasAtop.width, miniCanvasAtop.height);
//    ctxAtop.save();
//    ctxAtop.translate(centerX_top, y);
//    ctxAtop.rotate(Math.PI / 2);  // rotate 90°
//    const type = document.getElementById("hdnTextAnimationType").value;
//    if (type === "zoom") {
//        ctxAtop.drawImage(arrowImage, -25, -25, 50, 50);
//    } else if (type === "blur") {
//        ctxAtop.filter = "blur(4px)";
//        ctxAtop.drawImage(arrowImage, -20, -20, 40, 40);
//        ctxAtop.filter = "none";
//    } else {
//        ctxAtop.drawImage(arrowImage, -20, -20, 40, 40);
//    }
//    ctxAtop.restore();
//}

//// Draw arrow at center on load
//drawArrowFromTop(centerY_top);

//// Animate on hover
//miniCanvasAtop.addEventListener('mouseenter', () => {
//    // start off-screen at top edge (y=0)
//    drawArrowFromTop(0);
//    gsap.to({ pos: 0 }, {
//        duration: 0.5,
//        pos: centerY_top,
//        ease: getEase(),
//        onUpdate() {
//            drawArrowFromTop(this.targets()[0].pos);
//        }
//    });
//});

//miniCanvasAtop.addEventListener('mouseleave', () => {
//    // smoothly reset to center
//    gsap.to({ pos: centerY_top }, {
//        duration: 0.5,
//        pos: centerY_top,
//        ease: getEase(),
//        onUpdate() {
//            drawArrowFromTop(this.targets()[0].pos);
//        }
//    });
//});

function CreateHeaderSectionhtml() {
    try {
        $.ajax({
            url: baseURL + "Canvas/CreateHeaderSectionhtml",
            type: "POST",
            dataType: "html",
            success: function (result) {
                $("#divHeaderSection").html(result);

                const lin = document.getElementById('alinear');
                if (lin) {
                    lin.classList.add('active_effect');
                } else {
                    // console.warn("#alinear still not found!");
                }


                wireSpeedDropdown();
                wireOutSpeedDropdown();
                wireLoopDropdown();
                /* wireUpPopupHandlers();*/
            },
            error: function () {
            }
        })

    } catch (e) {
        console.log("catch", e);
    }
}
function CreateBackgroundSectionhtml() {
    try {
        $.ajax({
            url: baseURL + "Canvas/CreateBackgroundSectionhtml",
            type: "POST",
            dataType: "html",
            success: function (result) {
                $("#background_popup").html(result);
                //  wireUpPopupHandlers();
            },
            error: function () {
            }
        })

    } catch (e) {
        console.log("catch", e);
    }
}
function CreateLeftSectionhtml() {
    try {
        $.ajax({
            url: baseURL + "Canvas/CreateLeftSectionhtml",
            type: "POST",
            dataType: "html",
            success: function (result) {
                $("#divpanelleft").html(result);
               
            },
            error: function () {
            }
        })

    } catch (e) {
        console.log("catch", e);
    }
}
function CreateLayoutModalSectionhtml() {
    try {
        $.ajax({
            url: baseURL + "Canvas/CreateLayoutModalSectionhtml",
            type: "POST",
            dataType: "html",
            success: function (result) {
                $("#exampleModal").html(result);
                //  wireUpPopupHandlers();
            },
            error: function () {
            }
        })

    } catch (e) {
        console.log("catch", e);
    }
}
//function CreateRightSectionhtml() {
//    try {
//        $.ajax({
//            url: baseURL + "Canvas/CreateRightSectionhtml",
//            type: "POST",
//            dataType: "html",
//            success: function (result) {
//                $("#divpanelright").html(result);
//                // Now safe to access elements from the partial
//                document.getElementById('lblSpeed').textContent = "4 Sec";
//                document.getElementById('lblSeconds').textContent = "6 Sec";
//                document.getElementById('lblOutSpeed').textContent = "4 Sec";
//                document.getElementById('lblLoop').textContent = "1 time";

//            },
//            error: function () {
//            }
//        })

//    } catch (e) {
//        console.log("catch", e);
//    }
//}
function CreateRightSectionhtml() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: baseURL + "Canvas/CreateRightSectionhtml",
            type: "POST",
            dataType: "html"
        })
            .done(result => {
                // 1) Inject the partial
                $("#divpanelright").html(result);

                // 2) Now it’s safe to wire up your controls
                document.getElementById('lblSpeed').textContent = "4 Sec";
                //document.getElementById('lblSeconds').textContent = "3 Sec";
                //document.getElementById('lblOutSpeed').textContent = "4 Sec";
                //document.getElementById('lblLoop').textContent = "1 time";

                // 3) Resolve so callers can chain .then()
                resolve();
            })
            .fail((jqXHR, textStatus, errorThrown) => {
                console.error("Failed to load right section:", textStatus, errorThrown);
                reject(errorThrown);
            });
    });
}

function wireSpeedDropdown() {
    const ddl = document.getElementById('ddlSpeedControl');
    if (!ddl) {
        // console.warn("#ddlSpeedControl not found!");
        return;
    }
    ddl.addEventListener('click', function (event) {
        if (event.target.matches('a.dropdown-item')) {
            selectedInSpeed = event.target.getAttribute('value');
            document.getElementById('lblSpeed').textContent = event.target.textContent;
            SetTimeWhileSelect();
        }
    });
}
function wireSecondsDropdown() {
    const ddl = document.getElementById('ddlSecondsControl');
    if (!ddl) {
        console.warn("#ddlSecondsControl not found!");
        return;
    }
    ddl.addEventListener('click', function (event) {
        if (event.target.matches('a.dropdown-item')) {
            selectedStaySpeed = event.target.getAttribute('value');
            document.getElementById('lblSeconds').textContent = event.target.textContent;
            // store val if you need it: selectedStaySpeed = val;
            SetTimeWhileSelect();
        }
    });
   
}
function wireOutSpeedDropdown() {
  
    const ddlOut = document.getElementById('ddlOutSpeedControl');
    if (!ddlOut) {
        // console.warn("#ddlOutSpeedControl not found!");
        return;
    }

    ddlOut.addEventListener('click', function (event) {
        if (!event.target.matches('a.dropdown-item')) return;

        // store the value
        selectedOutSpeed = event.target.getAttribute('value');

        // update the label
        const lbl = document.getElementById('lblOutSpeed');
        if (lbl) {
            lbl.textContent = event.target.textContent;
            SetTimeWhileSelect();
        }
    });
  
}
function wireLoopDropdown() {
    const ddlLoop = document.getElementById('ddlLoopControl');
    if (!ddlLoop) {
        //   console.warn("#ddlLoopControl not found!");
        return;
    }

    ddlLoop.addEventListener('click', function (event) {
        if (!event.target.matches('a.dropdown-item')) return;

        // grab the value and update your globals/hidden field
        const val = event.target.getAttribute('value');
        selectedInSpeed = val;
        $("#hdnlLoopControl").val(val);

        // update the visible label
        const lbl = document.getElementById('lblLoop');
        if (lbl) lbl.textContent = event.target.textContent;
    });
}

function handleThumbClick(clickedElement) {
    const items = document.querySelectorAll('.menuboard-vertical-thum');

    items.forEach(el => el.classList.remove('active_border'));
    clickedElement.classList.add('active_border');
}

//function toggleShapePopup() {
//    const popup = document.getElementById('shapePopup');
//    popup.style.display = (popup.style.display === 'block') ? 'none' : 'block';
//}

//// Optional: click outside to close
//document.addEventListener('click', function (event) {
//    const popup = document.getElementById('shapePopup');
//    const button = document.getElementById('shapeToggleBtn');

//    if (!popup.contains(event.target) && !button.contains(event.target)) {
//        popup.style.display = 'none';
//    }
//});


// function for elements popup
function elementsTogglePopup() {
    const popup = document.getElementById('elementsPopup');
    const otherPopups = [
        document.getElementById('opengl_popup'),
        document.getElementById('fontstyle_popup'),
        document.getElementById('background_popup'),
        document.getElementById('tranPopup')
    ];

    // Hide all other popups
    otherPopups.forEach(p => p.style.display = 'none');

    // Toggle the target popup
    popup.style.display = (popup.style.display === 'block') ? 'none' : 'block';
}

// Optional: click outside to close
//document.addEventListener('click', function (event) {
//    const popup = document.getElementById('elementsPopup');
//    const button = document.querySelector('.elementsToggleBtn');

//    if (!popup.contains(event.target) && !button.contains(event.target)) {
//        popup.style.display = 'none';
//    }
//});
function boldTextOLD() {
    //const paddingX = 23;
    //const paddingY = 15;
    textObjects.forEach(obj => {
        if (obj.selected) obj.isBold = !obj.isBold;


    });

    drawCanvas("Common");
    updateFontStyleButtons();
}

function italicTextOLD() {
    //const paddingX = 23;
    //const paddingY = 15;
    textObjects.forEach(obj => {
        if (obj.selected) obj.isItalic = !obj.isItalic;
        //// 3) Measure the text
        //const metrics = ctx.measureText(obj.text);
        //const measuredWidth = metrics.width;

        //// 4) Measure height if supported; otherwise fallback to fontSize:
        //let measuredHeight;
        //if (
        //    typeof metrics.actualBoundingBoxAscent === "number" &&
        //    typeof metrics.actualBoundingBoxDescent === "number"
        //) {
        //    measuredHeight =
        //        metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
        //} else {
        //    // Fallback: approximate height with fontSize (not pixel‐perfect,
        //    // but better than nothing)
        //    measuredHeight = obj.fontSize;
        //}

        //// 5) Overwrite boundingWidth/boundingHeight with dynamic values + padding:
        //obj.boundingWidth = measuredWidth + paddingX * 2;
        //obj.boundingHeight = measuredHeight + paddingY * 2;
    });
    drawCanvas("Common");
    updateFontStyleButtons();
}
document.getElementById('btnBold')?.addEventListener('mousedown', e => { e.preventDefault(); textEditorNew?.focus(); });
document.getElementById('btnItalic')?.addEventListener('mousedown', e => { e.preventDefault(); textEditorNew?.focus(); });

// ensure you already have these from the font-size/color fixes
// let _lastEditorRange = null;
// function captureEditorRange() { ... add listeners to textEditorNew + document ... }

function boldText() {
    const Obj = (typeof textObjects !== "undefined") ? textObjects.find(o => o.selected) : null;
    if (!activeBox && !Obj) return;

    if (isEditing && textEditorNew) {
        textEditorNew.focus();

        // restore last selection inside editor (reliable)
        const sel = window.getSelection();
        const canRestore = _lastEditorRange && textEditorNew.contains(_lastEditorRange.commonAncestorContainer);
        if (canRestore) { sel.removeAllRanges(); sel.addRange(_lastEditorRange); }

        let ok = false;
        try {
            document.execCommand("styleWithCSS", false, true);
            document.execCommand("bold");
            ok = true;
        } catch (_) { }

        // fallback: manual wrap if execCommand failed or selection collapsed
        if (!ok) {
            if (sel.rangeCount) {
                const r = sel.getRangeAt(0);
                if (!r.collapsed) {
                    const span = document.createElement("span");
                    span.style.fontWeight = "900";
                    span.appendChild(r.extractContents());
                    r.insertNode(span);

                    // caret after + cache
                    sel.removeAllRanges();
                    const after = document.createRange();
                    after.setStartAfter(span); after.collapse(true);
                    sel.addRange(after);
                    _lastEditorRange = after.cloneRange();
                    ok = true;
                }
            }
        }

        if (typeof normalizeEditorInPlace === "function") normalizeEditorInPlace(textEditorNew);

        // persist + redraw
        activeBox.text = textEditorNew.innerHTML;
        if (Obj) {
            Obj.isBold = isSelectionBoldInEditor?.(textEditorNew) ?? Obj.isBold;
            Obj.text = activeBox.text;
        }
        if (typeof redrawCanvas === "function") redrawCanvas();
        else drawText();
        console.log(textObjects);
        return;
    }

    // Not editing → toggle whole box
    if (Obj) Obj.isBold = !Obj.isBold;
    applyWholeBoxStyle({ fontWeight: Obj && Obj.isBold ? "bold" : "" });
    if (Obj) Obj.text = activeBox.text;

    if (typeof redrawCanvas === "function") redrawCanvas();
    else drawText();
    console.log(textObjects);
}

function italicText() {
    const Obj = (typeof textObjects !== "undefined") ? textObjects.find(o => o.selected) : null;
    if (!activeBox && !Obj) return;

    if (isEditing && textEditorNew) {
        textEditorNew.focus();

        const sel = window.getSelection();
        const canRestore = _lastEditorRange && textEditorNew.contains(_lastEditorRange.commonAncestorContainer);
        if (canRestore) { sel.removeAllRanges(); sel.addRange(_lastEditorRange); }

        let ok = false;
        try {
            document.execCommand("styleWithCSS", false, true);
            document.execCommand("italic");
            ok = true;
        } catch (_) { }

        if (!ok) {
            if (sel.rangeCount) {
                const r = sel.getRangeAt(0);
                if (!r.collapsed) {
                    const span = document.createElement("span");
                    span.style.fontStyle = "italic";
                    span.appendChild(r.extractContents());
                    r.insertNode(span);

                    sel.removeAllRanges();
                    const after = document.createRange();
                    after.setStartAfter(span); after.collapse(true);
                    sel.addRange(after);
                    _lastEditorRange = after.cloneRange();
                    ok = true;
                }
            }
        }

        if (typeof normalizeEditorInPlace === "function") normalizeEditorInPlace(textEditorNew);

        activeBox.text = textEditorNew.innerHTML;
        if (Obj) {
            Obj.isItalic = isSelectionItalicInEditor?.(textEditorNew) ?? Obj.isItalic;
            Obj.text = activeBox.text;
        }
        if (typeof redrawCanvas === "function") redrawCanvas();
        else drawText();
        console.log(textObjects);
        return;
    }

    // Not editing → toggle whole box
    if (Obj) Obj.isItalic = !Obj.isItalic;
    applyWholeBoxStyle({ fontStyle: Obj && Obj.isItalic ? "italic" : "" });
    if (Obj) Obj.text = activeBox.text;

    if (typeof redrawCanvas === "function") redrawCanvas();
    else drawText();
    console.log(textObjects);
}

function boldTextOLD() {
    const Obj = (typeof textObjects !== "undefined") ? textObjects.find(o => o.selected) : null;
    if (!activeBox && !Obj) return;

    if (isEditing) {
        // Edit mode: toggle bold on the current selection (keeps selection)
        try {
            textEditorNew.focus();
            document.execCommand("styleWithCSS", false, true);
            restoreSelection();
            document.execCommand("bold");

            // sync model + canvas
            activeBox.text = textEditorNew.innerHTML;
            if (Obj) {
                Obj.isBold = isSelectionBoldInEditor(textEditorNew); // best-effort reflect state
                Obj.text = activeBox.text;
            }
            redrawCanvas();
            updateFontStyleButtons();
            console.log(textObjects);
            return;
        } catch (e) {
            // fall through to whole-box toggle if execCommand fails
        }
    }

    // Not editing (or execCommand failed): toggle whole box
    if (Obj) Obj.isBold = !Obj.isBold;
    applyWholeBoxStyle({ fontWeight: Obj && Obj.isBold ? "bold" : "" });
    if (Obj) Obj.text = activeBox.text;

    redrawCanvas();
    updateFontStyleButtons();

}

function italicTextOLD() {
    const Obj = (typeof textObjects !== "undefined") ? textObjects.find(o => o.selected) : null;
    if (!activeBox && !Obj) return;

    if (isEditing) {
        // Edit mode: toggle italic on the current selection (keeps selection)
        try {
            textEditorNew.focus();
            document.execCommand("styleWithCSS", false, true);
            restoreSelection();
            document.execCommand("italic");

            // sync model + canvas
            activeBox.text = textEditorNew.innerHTML;
            if (Obj) {
                Obj.isItalic = isSelectionItalicInEditor(textEditorNew); // best-effort reflect state
                Obj.text = activeBox.text;
            }
            redrawCanvas();
            updateFontStyleButtons();
            console.log(textObjects);
            return;
        } catch (e) {
            // fall through to whole-box toggle if execCommand fails
        }
    }

    // Not editing (or execCommand failed): toggle whole box
    if (Obj) Obj.isItalic = !Obj.isItalic;
    applyWholeBoxStyle({ fontStyle: Obj && Obj.isItalic ? "italic" : "" });
    if (Obj) Obj.text = activeBox.text;

    redrawCanvas();
    updateFontStyleButtons();

}

// Apply a style to the entire box without nuking existing spans.
// Sets style on each top-level <div> if present; otherwise wraps in a <span>.
function applyWholeBoxStyle(styleObj) {
    if (!activeBox) return;
    const container = document.createElement("div");
    container.innerHTML = activeBox.text;

    const topDivs = Array.from(container.childNodes).filter(
        n => n.nodeType === 1 && n.tagName === "DIV"
    );

    if (topDivs.length > 0) {
        topDivs.forEach(div => Object.assign(div.style, styleObj));
    } else {
        const wrap = document.createElement("div");
        const span = document.createElement("span");
        Object.assign(span.style, styleObj);
        span.innerHTML = container.innerHTML;
        wrap.appendChild(span);
        container.innerHTML = wrap.innerHTML;
    }

    activeBox.text = container.innerHTML;
}

// Best-effort: detect if current selection is bold in the editor
function isSelectionBoldInEditor(root) {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return false;
    const range = sel.getRangeAt(0);
    let node = range.commonAncestorContainer.nodeType === 1
        ? range.commonAncestorContainer
        : range.commonAncestorContainer.parentNode;
    while (node && node !== root) {
        const fw = (node.style && node.style.fontWeight) || "";
        if (node.tagName === "B" || node.tagName === "STRONG" || fw === "bold" || parseInt(fw, 10) >= 600) return true;
        node = node.parentNode;
    }
    return false;
}

// Best-effort: detect if current selection is italic in the editor
function isSelectionItalicInEditor(root) {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return false;
    const range = sel.getRangeAt(0);
    let node = range.commonAncestorContainer.nodeType === 1
        ? range.commonAncestorContainer
        : range.commonAncestorContainer.parentNode;
    while (node && node !== root) {
        const fs = (node.style && node.style.fontStyle) || "";
        if (node.tagName === "I" || node.tagName === "EM" || fs === "italic") return true;
        node = node.parentNode;
    }
    return false;
}

// Use your canvas draw if present; otherwise your old drawCanvas
function redrawCanvas() {
    if (typeof drawText === "function") drawText();
    else if (typeof drawCanvas === "function") drawCanvas("Common");
}

//  Sync button “active” state to selection:
function updateFontStyleButtons() {
    const anySelected = textObjects.some(o => o.selected);
    if (!anySelected) {
        document.getElementById("boldBtn").classList.remove("active");
        document.getElementById("italicBtn").classList.remove("active");
        return;
    }
    const anyBold = textObjects.some(o => o.selected && o.isBold);
    document.getElementById("boldBtn").classList.toggle("active", anyBold);

    const anyItalic = textObjects.some(o => o.selected && o.isItalic);
    document.getElementById("italicBtn").classList.toggle("active", anyItalic);
}
let allItems = [];
function reindex() {
    allItems.forEach((obj, idx) => obj.zIndex = idx + 1)
}
function bringToFront(item) {
    // item.zIndex = getNextZIndex(); // highest zIndex = drawn last = on top
    const i = allItems.indexOf(item)
    if (i === -1) return
    allItems.splice(i, 1)     // remove it
    allItems.push(item)       // insert at end (top)
    reindex()
}
function getAllItems() {
    return [...textObjects, ...images];
}
//window.allItems = window.allItems || getAllItems();
// ✅ ADD: whenever you add/remove an item elsewhere, call this to resync the working list

function refreshAllItems() {
    const current = getAllItems();
    // Keep only those that still exist; add new ones that weren't tracked yet.
    const set = new Set(current);
    allItems = allItems.filter(it => set.has(it));
    for (const it of current) if (!allItems.includes(it)) allItems.push(it);
}
// ✅ ADD: compact and normalize z-order based on current zIndex values
function reindexZ() {
    const arr = getAllItems().map((o, i) => ({ o, i, z: Number(o.zIndex ?? 0) }));
    arr.sort((A, B) => A.z - B.z || A.i - B.i); // bottom → top
    arr.forEach((rec, idx) => { rec.o.zIndex = idx; });
}
// ✅ ADD: when a brand-new item is created, call this so it lands on top
function giveTopZ(item) {
    refreshAllItems();
    const maxZ = allItems.reduce((m, it) => Math.max(m, it.zIndex ?? 0), -1);
    item.zIndex = maxZ + 1;
    refreshAllItems();
    reindexZ();
}
// ✅ ADD: move one step toward front (increase z)
function bringForward(item) {
    refreshAllItems();
    reindex(); // ensure dense 0..N-1
    const i = allItems.indexOf(item);
    if (i === -1 || i === allItems.length - 1) return; // already top or missing
    const tmp = allItems[i + 1];
    allItems[i + 1] = allItems[i];
    allItems[i] = tmp;
    reindex();
}

// ✅ ADD: move one step toward back (decrease z)
function sendBackward(item) {
    refreshAllItems();
    reindex();
    const i = allItems.indexOf(item);
    if (i <= 0) return; // already bottom or missing
    const tmp = allItems[i - 1];
    allItems[i - 1] = allItems[i];
    allItems[i] = tmp;
    reindex();
}

// ✅ ADD: to absolute front (highest z)
function bringToFront(item) {
    const all = getAllItems();
    if (!all.includes(item)) return;
    const maxZ = Math.max(0, ...all.map(o => Number(o.zIndex ?? 0)));
    item.zIndex = maxZ + 1;
    // reindexZ(); // uncomment if you want zIndex compacted each time
}

function sortTopFirst(arr) {
    // top-first: higher zIndex first; tie -> later item first
    return arr.map((it, i) => ({ it, i }))
        .sort((A, B) => {
            const za = Number(A.it.zIndex ?? 0), zb = Number(B.it.zIndex ?? 0);
            if (za !== zb) return zb - za;
            return B.i - A.i;
        });
}
sendBackOption.addEventListener('click', () => {
    const target = contextTarget || selectedForContextMenu || activeBox;
    if (!target) return;
    sendToBack(target);
    drawText();
    contextMenu.style.display = 'none';
});

bringFrontOption.addEventListener('click', () => {
    const target = contextTarget || selectedForContextMenu || activeBox;
    if (!target) return;
    bringToFront(target);
    drawText();
    contextMenu.style.display = 'none';
});

// define at top-level

function sendToBack(item) {
    const all = getAllItems();
    if (!all.includes(item)) return;
    const minZ = Math.min(0, ...all.map(o => Number(o.zIndex ?? 0)));
    item.zIndex = minZ - 1;
    // reindexZ(); // uncomment if you want zIndex compacted each time
}



//function sendToBack(item) {
//    // item.zIndex = Math.min(...getAllItems().map(i => i.zIndex || 0)) - 1;
//    const i = allItems.indexOf(item)
//    if (i === -1) return
//    allItems.splice(i, 1)     // remove it
//    allItems.unshift(item)    // insert at start (bottom)
//    reindex()
//}
//bringFrontOption.addEventListener('click', () => {
//    if (!selectedForContextMenu) return;
//    bringToFront(selectedForContextMenu);
//    drawCanvas("Common");
//    contextMenu.style.display = 'none';
//});

//sendBackOption.addEventListener('click', () => {
//    if (!selectedForContextMenu) return;
//    sendToBack(selectedForContextMenu);
//    drawCanvas("Common");
//    contextMenu.style.display = 'none';
//});
function transitionSelected() {
    if ($("#hdntransition").val() != '') {
        $('.sd-btn-right').addClass('activeB');
    }
}
// function for transition popup
function tranTogglePopup() {
    const popup = document.getElementById('tranPopup');
    const color_add = document.getElementById('tranColor');
    const otherPopups = [
        document.getElementById('opengl_popup'),
        document.getElementById('fontstyle_popup'),
        document.getElementById('background_popup'),
        document.getElementById('tranPopup'),
        document.querySelector('.right-sec-one'),
        document.querySelector('.right-sec-two'),
    ];

    // Hide all other popups
    otherPopups.forEach(p => p.style.display = 'none');

    // Toggle the target popup
    popup.style.display = 'block';
    color_add.style.display = 'block';



    // read the current transition type
    const t = $('#hdntransition').val();

    // clear any previously active transition buttons
    $('.tran_button').removeClass('active_tran');

    // if it’s slideLeft, add `.active` to the #TslideLeft button
    if (t === 'slideLeft') {
        $('#TslideLeft').addClass('active_tran');
    }
    // (repeat for other types if you want)
    else if (t === 'slideRight') {
        $('#TslideRight').addClass('active_tran');
    }
    else {
        $('.tran_button').removeClass('active_tran');
    }


}

function hideTran() {
    const popup = document.getElementById("tranPopup");
    const color_add = document.getElementById('tranColor');
    const boardAnimation = document.querySelector('.right-sec-one');
    if (popup) {
        popup.style.display = "none";
    }
    if (color_add) {
        color_add.style.display = "none";
    }
    if (boardAnimation) {
        boardAnimation.style.display = "block";
    }
}

function changeTranBcak1() {
    const color = document.getElementById('tranColor1').value;
    document.getElementById('targetDiv1').style.backgroundColor = color;
}
function changeTranBcak2() {
    const color = document.getElementById('tranColor2').value;
    document.getElementById('targetDiv2').style.backgroundColor = color;
}
// ─── 3) Duplicate menu handlers ───────────────────────────────────
//const duplicateOption = document.getElementById('duplicateOption');


//duplicateOption.addEventListener('click', () => {
//    let DesignBoardDetailsId;
//    if (activeSlide === 1) {
//        DesignBoardDetailsId = $(`#hdnDesignBoardDetailsIdSlide1`).val();
//    } else if (activeSlide === 2) {
//        DesignBoardDetailsId = $(`#hdnDesignBoardDetailsIdSlide2`).val();
//    }
//    else if (activeSlide === 3) {
//        MessageShow('', 'Already 3 slide created.Delete any one and then duplicate!', 'error');
//        return;
//    }
//    const isDefaultOrBlank = !slideId || slideId.trim() === "" || slideId === "00000000-0000-0000-0000-000000000000";

//    if (!isDefaultOrBlank) {
//        try {
//        ShowLoader();
//        const dataSlide = {
//            DesignBoardDetailsId: slideId
//        };

//        $.ajax({
//            url: baseURL + "Canvas/DuplicateDesignSlideBoard",
//            type: "POST",
//            dataType: "json",
//            data: dataSlide,
//            success: function (slideResult) {
//                HideLoader();
//                if (slideResult.response === 'ok') {
//                    MessageShow('RedirectToVerticalPageWithQueryString()', 'Slide duplicate successfully!', 'success');
//                } else {
//                    MessageShow('', 'Failed to duplicate slide.', 'error');
//                }
//            },
//            error: function (data) {
//                console.log("Error in delete slide", data);
//                HideLoader();
//                MessageShow('', 'Error duplicate slide.', 'error');
//            }
//        });

//    } catch (e) {
//        console.log("catch", e);
//        HideLoader();
//    }
//    }
//});

////function strokeWidthChanges() {
////    const ddl = document.getElementById('ddlStrokeWidth');
////    const newWidth = ddl.value;    // e.g. "4"
////    const widthNum = parseInt(newWidth, 10);

////    console.log('Stroke width changed to:', widthNum);
////}
//zoom function

let scale = 1;
const scaleStep = 0.1;
const maxScale = 3;
const minScale = 0.5;
const scaleText = document.getElementById("scaleValue");

let activeHandleKey = null;          // 'tl','tr','bl','br','t','r','b','l'
let resizeDirectionRaw = null;   // e.g. "mr","ml","mt","mb","top-left", etc
let resizeDirectionNorm = null;  // "r","l","t","b","tl","tr","bl","br"
function applyScale() {
    /*   resizeCanvas();*/
    canvas.style.transform = `scale(${scale})`;
    scaleText.textContent = `Scale: ${scale.toFixed(1)}`;
    /* drawCanvas("Common");*/
}

function zoomIn() {
    if (scale < maxScale) {
        scale += scaleStep;
        applyScale();
    }
}

function zoomOut() {
    if (scale > minScale) {
        scale -= scaleStep;
        applyScale();
    }
}


//zoom function end

const textEditorNew = document.getElementById("textEditorNew");
const colorPickerNew = document.getElementById("colorPickerNew");
let selectedLineSpacing = 8;
const fontSizeNew = 30;
const lineHeight = 20;
const fontFamilyNew = "Arial Regular";

let boxes = [];
let activeBox = null;
let isDraggingNew = false, isResizingNew = false, isEditing = false;
let resizeDirection = null;
let prevMouseX = 0, prevMouseY = 0;
let dragOffsetXNew = 0, dragOffsetYNew = 0;
let savedRange = null;
let isFontScaling = false;
let _cornerScale = null; // { cx, cy, startDist, startScale, baseFontSize }
let isCornerImageScale = false;
const CORNER_HANDLES = new Set(["tl", "tr", "bl", "br"]); // use normalized names only
/*const CORNER_HANDLES = new Set(["tl", "tr", "bl", "br", "top-left", "top-right", "bottom-left", "bottom-right"]);*/
let _cornerScaleState = null; // { cx, cy, startDist, startScale, baseFontSize }

//const CORNER_HANDLES = new Set(['tl', 'tr', 'bl', 'br']);
let isCornerFontScale = false;
let startMXCanvas = 0, startMYCanvas = 0; // canvas-space drag start
const defaultLineSpacing = 8;


function _mouseCanvas(e) { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
// Helper: multiply any CSS font-size (e.g. "30px") by box.fontScale
function fontSizePxWithScale(sizeStr, box) { const basePx = parseFloat(sizeStr) || 16; const sc = (box && box.fontScale) ? box.fontScale : 1; return basePx * sc; }

function mouseInCanvas(e) {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
}
function onCornerScaleMove(ev) {
    if (!_cornerScaleState || !activeBox) return;
    const { x, y } = mouseInCanvas(ev);
    const newDist = Math.hypot(x - _cornerScaleState.cx, y - _cornerScaleState.cy) || 1;
    let newScale = (newDist / _cornerScaleState.startDist) * _cornerScaleState.startScale;
    newScale = Math.max(0.25, Math.min(8, newScale));
    activeBox.fontScale = newScale;

    // If editor visible, mirror font size live (WYSIWYG)
    if (isEditing && textEditorNew) {
        textEditorNew.style.fontSize = (_cornerScaleState.baseFontSize * newScale) + "px";
        activeBox.text = textEditorNew.innerHTML;
    }

    drawText();
}
function endCornerScale() {
    document.removeEventListener("mousemove", onCornerScaleMove);
    document.removeEventListener("mouseup", endCornerScale);
    _cornerScaleState = null;
}

function beginCornerScale(box, mx, my) {
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    const startDist = Math.hypot(mx - cx, my - cy) || 1;
    const startScale = box.fontScale || 1;
    let baseFontSize = parseFloat(box.fontSize);
    if (isNaN(baseFontSize)) {
        try { baseFontSize = parseFloat(getComputedStyle(textEditorNew).fontSize) || 16; } catch { baseFontSize = 16; }
    }
    _cornerScaleState = { cx, cy, startDist, startScale, baseFontSize };
}

// ——————— Helpers ———————

//function getCanvasMousePosition(e) {
//    const rect = canvas.getBoundingClientRect();
//    const scaleX = canvas.width / rect.width;
//    const scaleY = canvas.height / rect.height;
//    return {
//        x: (e.clientX - rect.left) * scaleX,
//        y: (e.clientY - rect.top) * scaleY
//    };
//}
function endEditingIfOpen() {
    if (isEditing) {
        // save if you need, then hide
        textEditorNew.style.display = "none";
        isEditing = false;
    }
}

function getCanvasMousePosition(e) {
    const r = canvas.getBoundingClientRect();
    const sx = canvas.width / r.width, sy = canvas.height / r.height;
    return { x: (e.clientX - r.left) * sx, y: (e.clientY - r.top) * sy };
}
function cursorForHandle(k) {
    if (k === 'tl' || k === 'br') return 'nwse-resize';
    if (k === 'tr' || k === 'bl') return 'nesw-resize';
    if (k === 'l' || k === 'r') return 'ew-resize';
    if (k === 't' || k === 'b') return 'ns-resize';
    return 'default';
}

//function getAllHandles(box) {
//    const { x, y, width: w, height: h } = box;
//    return {
//        tl: { x, y }, tm: { x: x + w / 2, y }, tr: { x: x + w, y },
//        ml: { x, y: y + h / 2 }, mr: { x: x + w, y: y + h / 2 },
//        bl: { x, y: y + h }, bm: { x: x + w / 2, y: y + h }, br: { x: x + w, y: y + h }
//    };
//}
function getAllHandles(box, scaleX = 1, scaleY = 1) {
    const { x, y, width: w, height: h } = box;
    return {
        tl: { x: x, y: y },
        tm: { x: x + w / 2, y: y },
        tr: { x: x + w, y: y },
        ml: { x: x, y: y + h / 2 },
        mr: { x: x + w, y: y + h / 2 },
        bl: { x: x, y: y + h },
        bm: { x: x + w / 2, y: y + h },
        br: { x: x + w, y: y + h }
    };
}
function getResizeHandleOLD(box, mx, my) {
    const hit = 8;
    for (let [key, h] of Object.entries(getAllHandles(box))) {
        if (Math.abs(mx - h.x) < hit && Math.abs(my - h.y) < hit) return key;
    }
    return null;
}
function getResizeHandle(box, mx, my) {
    const hs = 8, half = hs / 2;
    const handles = getAllHandles(box); // returns tl,tr,bl,br,l,r,t,b with .x/.y in screen space
    for (const [key, h] of Object.entries(handles)) {
        if (mx >= h.x - half && mx <= h.x + half && my >= h.y - half && my <= h.y + half) return key;
    }
    return null;
}



function stripHTML(html) {
    let tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.innerText;
}
// Helper to clean HTML and preserve caret in contentEditable editor
function cleanEditorHTMLPreserveCaret() {
    const temp = document.createElement("div");
    temp.innerHTML = textEditorNew.innerHTML;

    const cleanedLines = [];
    temp.childNodes.forEach(node => {
        let div;
        if (node.nodeType === 1 && node.tagName === "DIV") {
            div = document.createElement("div");
            node.childNodes.forEach(child => {
                div.appendChild(child.cloneNode(true));
            });
        } else if (node.nodeType === 1 || node.nodeType === 3) {
            div = document.createElement("div");
            div.appendChild(node.cloneNode(true));
        }

        // ✅ guard: skip comment/other nodes
        if (!div) return;

        // (optional) merge adjacent text nodes inside the new line
        div.normalize();

        // Ensure empty lines have a <br> (but don't erase lines that end with <br>)
        const textNoZW = (div.textContent || "").replace(/\u200B/g, ""); // drop zero-width
        const onlyWhitespace = !/[^\s\u00A0]/.test(textNoZW);            // only spaces/newlines/NBSP
        const hasBR = !!div.querySelector('br');                         // existing <br>
        const hasElementChildren = div.children.length > 0;              // spans, etc.

        // Truly empty iff no text AND no children AND no <br>
        const isTrulyEmpty = onlyWhitespace && !hasElementChildren && !hasBR;
        if (isTrulyEmpty) {
            div.innerHTML = "<br>";
        }

        cleanedLines.push(div);
    });


    // Trim leading and trailing blank lines
    while (cleanedLines.length > 1 && cleanedLines[0].innerText.trim() === "") {
        cleanedLines.shift();
    }
    while (cleanedLines.length > 1 && cleanedLines[cleanedLines.length - 1].innerText.trim() === "") {
        cleanedLines.pop();
    }

    // Remove blank divs from temp as well
    while (temp.firstChild && temp.firstChild.tagName === "DIV" && temp.firstChild.innerText.trim() === "") {
        temp.removeChild(temp.firstChild);
    }
    while (temp.lastChild && temp.lastChild.tagName === "DIV" && temp.lastChild.innerText.trim() === "") {
        temp.removeChild(temp.lastChild);
    }

    // Apply cleaned content back
    textEditorNew.innerHTML = "";
    cleanedLines.forEach(line => textEditorNew.appendChild(line));
}
function normAlpha(op) {
    if (op == null) return 1;         // default fully opaque
    return op > 1 ? op / 100 : op;    // handle legacy 0–100
}
function pointInBox(b, x, y) {
    const w = Number(b.width) || 0;
    const h = Number(b.height) || 0;
    return x >= b.x && x <= b.x + w && y >= b.y && y <= b.y + h;
}
function __drawImageThreeSliceLocalYOLD(ctx2, img, w, h) {
    const sw = img.naturalWidth || img.width || 1;
    const sh = img.naturalHeight || img.height || 1;

    // use the source's half-height as the cap thickness
    const capSrc = Math.max(1, Math.round(sh / 2));

    // center slice in source, ≥1px
    let midSrcH = sh - capSrc * 2;
    let midSrcY = capSrc;
    if (midSrcH < 1) { midSrcH = 1; midSrcY = Math.max(0, Math.floor(sh / 2)); }

    // destination: cap radius = min(w/2, h/2) so pill ends never distort
    const capDst = Math.max(1e-3, Math.min(w / 2, h / 2));
    const midDst = Math.max(0, h - capDst * 2);

    // TOP cap
    ctx2.drawImage(img, 0, 0, sw, capSrc, -w / 2, -h / 2, w, capDst);

    // MIDDLE (stretched vertically)
    if (midDst > 0) {
        ctx2.drawImage(img, 0, midSrcY, sw, midSrcH, -w / 2, -h / 2 + capDst, w, midDst);
    }

    // BOTTOM cap
    const bottomSrcY = Math.max(0, sh - capSrc);
    ctx2.drawImage(img, 0, bottomSrcY, sw, capSrc, -w / 2, -h / 2 + capDst + midDst, w, capDst);
}
// prev signature kept; just adds optional `curv`
function __drawImageThreeSliceLocalY(ctx2, img, w, h, curv) {
    const sw = img.naturalWidth || img.width || 1;
    const sh = img.naturalHeight || img.height || 1;

    // Resolve curvature k (ratio of HEIGHT). Prefer explicit curv, then img.__curvatureRatio, else 0.5.
    let k;
    if (typeof curv === 'number' && isFinite(curv)) {
        // <=1 => ratio; >1 => pixels converted to ratio by /h
        k = (curv > 1) ? (curv / h) : curv;
    } else if (typeof img?.__curvatureRatio === 'number' && isFinite(img.__curvatureRatio)) {
        k = img.__curvatureRatio;
    } else {
        k = 0.5; // default pill
    }
    // clamp to [0..0.5]
    k = Math.max(0, Math.min(0.5, k));

    // --- Source cap (keep same proportion on the source) ---
    let capSrc = Math.round(k * sh);
    capSrc = Math.max(1, Math.min(capSrc, Math.floor(sh / 2)));

    // middle source (≥1px)
    let midSrcH = sh - capSrc * 2;
    let midSrcY = capSrc;
    if (midSrcH < 1) { midSrcH = 1; midSrcY = Math.max(0, Math.floor(sh / 2)); }

    // --- Destination cap: use curvature k*h but never exceed w/2 (so caps don't bulge out) ---
    const capDst = Math.max(1e-3, Math.min((k * h), (w / 2)));
    const midDst = Math.max(0, h - capDst * 2);

    // Optional tiny overlap to hide seams on high-DPI
    const DPR = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
    const OY = 1 / DPR;

    // TOP cap
    ctx2.drawImage(img, 0, 0, sw, capSrc, -w / 2, -h / 2, w, capDst + OY);

    // MIDDLE (stretched vertically)
    if (midDst > 0) {
        ctx2.drawImage(img, 0, midSrcY, sw, midSrcH, -w / 2, -h / 2 + capDst - OY, w, midDst + 2 * OY);
    }

    // BOTTOM cap
    const bottomSrcY = Math.max(0, sh - capSrc);
    ctx2.drawImage(img, 0, bottomSrcY, sw, capSrc, -w / 2, -h / 2 + capDst + midDst - OY, w, capDst + OY);
}

function drawText() {
    const designW = canvas.width;
    const designH = canvas.height;
    // clear & bg
    ctx.clearRect(0, 0, designW, designH);

    const bgEl = document.getElementById('hdnBackgroundSpecificColor');
    const bgColor = (bgEl?.value || canvas.style.backgroundColor || "").trim();
    if (bgColor) {
        ctx.save();
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, designW, designH);
        ctx.restore();
    }

    if (canvas._bgImg) {
        if (canvas._bgImg.complete) {
            ctx.drawImage(canvas._bgImg, 0, 0, designW, designH);
        } else {
            canvas._bgImg.onload = () => drawText();
            canvas._bgImg.onerror = () => { };
        }
    }

    // text defaults
    ctx.textBaseline = "top";
    const defaultStyle = window.getComputedStyle(textEditorNew);
    const defaultFontSize = defaultStyle.fontSize || "13px";
    const defaultFontFamily = defaultStyle.fontFamily || "Arial Regular";
    const defaultFontWeight = defaultStyle.fontWeight || "normal";
    const defaultFontStyle = defaultStyle.fontStyle || "normal";
    const defaultColor = defaultStyle.color || "#000";

    // === local mask helper (rotated/local space) ===
    function __applyLocalRectMask(ctx, w, h, clipVal, direction) {
        if (!(clipVal > 0 && clipVal < 1)) return;

        let vw = w, vh = h;
        if (direction === "left" || direction === "right") vw = w * (1 - clipVal);
        if (direction === "top" || direction === "bottom") vh = h * (1 - clipVal);

        let rx = -w / 2, ry = -h / 2;
        if (direction === "right") rx = (w / 2) - vw;
        if (direction === "bottom") ry = (h / 2) - vh;

        ctx.beginPath();
        ctx.rect(rx, ry, vw, vh);
        ctx.clip();
    }

    // ===== BASIC SHAPES detection =====
    const __BASIC_SHAPES = new Set(['ico-shapes-rec.svg']);
    function __isBasicShapeSvg(box) {
        if (!box || box.type !== 'image' || !box.src) return false;
        let name = '';
        try { name = new URL(String(box.src), location.href).pathname.split('/').pop() || ''; }
        catch { name = String(box.src).split(/[?#]/)[0].split('/').pop() || ''; }
        return __BASIC_SHAPES.has(name.toLowerCase());
    }

    function __applyLocalRectMask(ctx, w, h, clipVal, direction) {
        if (!(clipVal > 0 && clipVal < 1)) return;

        let vw = w, vh = h;
        if (direction === "left" || direction === "right") vw = w * (1 - clipVal);
        if (direction === "top" || direction === "bottom") vh = h * (1 - clipVal);

        let rx = -w / 2, ry = -h / 2;
        if (direction === "right") rx = (w / 2) - vw;
        if (direction === "bottom") ry = (h / 2) - vh;

        ctx.beginPath();
        ctx.rect(rx, ry, vw, vh);
        ctx.clip();
    }

    // === 3-slice / 9-slice helpers (unchanged) ===
    function __drawImageThreeSliceLocalX(ctx2, img, w, h) {
        const sw = img.naturalWidth || img.width || 1;
        const sh = img.naturalHeight || img.height || 1;
        const capSrc = Math.max(1, Math.round(sh / 2));
        let midSrcW = sw - capSrc * 2;
        let midSrcX = capSrc;
        if (midSrcW < 1) { midSrcX = Math.max(0, Math.floor(sw / 2)); midSrcW = 1; }
        const capDst = Math.max(1e-3, Math.min(h / 2, w / 2));
        const midDst = Math.max(0, w - capDst * 2);
        ctx2.drawImage(img, 0, 0, capSrc, sh, -w / 2, -h / 2, capDst, h);
        if (midDst > 0) ctx2.drawImage(img, midSrcX, 0, midSrcW, sh, -w / 2 + capDst, -h / 2, midDst, h);
        const rightSrcX = Math.max(0, sw - capSrc);
        ctx2.drawImage(img, rightSrcX, 0, capSrc, sh, -w / 2 + capDst + midDst, -h / 2, capDst, h);
    }

    function __drawImageNineSliceLocal(ctx2, img, w, h, curv) {
        const sw = img.naturalWidth || img.width || 1;
        const sh = img.naturalHeight || img.height || 1;

        let k;
        if (typeof curv === "number" && isFinite(curv)) {
            k = (curv > 1) ? (curv / h) : curv;
        } else if (typeof img.__curvatureRatio === "number" && isFinite(img.__curvatureRatio)) {
            k = img.__curvatureRatio;
        } else {
            k = 0.5;
        }
        k = Math.max(0, Math.min(0.5, k));

        const cap = Math.min(k * h, w * 0.5, h * 0.5);
        const capDstX = cap, capDstY = cap;
        const midDstX = Math.max(0, w - 2 * capDstX);
        const midDstY = Math.max(0, h - 2 * capDstY);

        let capSrc = Math.round(k * sh);
        capSrc = Math.max(1, Math.min(capSrc, Math.floor(Math.min(sw, sh) / 2)));

        let midSrcW = sw - capSrc * 2; if (midSrcW < 1) midSrcW = 1;
        let midSrcH = sh - capSrc * 2; if (midSrcH < 1) midSrcH = 1;
        const midSrcX = capSrc, midSrcY = capSrc;

        const x0 = -w / 2, y0 = -h / 2;
        const left = x0, right = x0 + w, top = y0, bottom = y0 + h;

        ctx2.save();
        ctx2.beginPath();
        ctx2.rect(left, top, w, h);
        ctx2.clip();

        // Top row
        ctx2.drawImage(img, 0, 0, capSrc, capSrc, left, top, capDstX, capDstY);
        if (midDstX > 0)
            ctx2.drawImage(img, midSrcX, 0, midSrcW, capSrc, left + capDstX, top, midDstX, capDstY);
        {
            const trX = left + capDstX + midDstX;
            const trW = Math.max(0, right - trX);
            if (trW > 0)
                ctx2.drawImage(img, Math.max(0, sw - capSrc), 0, capSrc, capSrc, trX, top, trW, capDstY);
        }

        // Middle row
        if (midDstY > 0) {
            ctx2.drawImage(img, 0, midSrcY, capSrc, midSrcH, left, top + capDstY, capDstX, midDstY);
            if (midDstX > 0)
                ctx2.drawImage(img, midSrcX, midSrcY, midSrcW, midSrcH,
                    left + capDstX, top + capDstY, midDstX, midDstY);
            {
                const rX = left + capDstX + midDstX;
                const rW = Math.max(0, right - rX);
                if (rW > 0)
                    ctx2.drawImage(img, Math.max(0, sw - capSrc), midSrcY, capSrc, midSrcH,
                        rX, top + capDstY, rW, midDstY);
            }
        } else {
            if (capDstX > 0)
                ctx2.drawImage(img, 0, midSrcY, capSrc, midSrcH, left, top + capDstY, capDstX, midDstY);
            const rX = left + capDstX + midDstX;
            const rW = Math.max(0, right - rX);
            if (rW > 0)
                ctx2.drawImage(img, Math.max(0, sw - capSrc), midSrcY, capSrc, midSrcH,
                    rX, top + capDstY, rW, midDstY);
        }

        // Bottom row
        {
            const blY = top + capDstY + midDstY;
            const blH = Math.max(0, bottom - blY);
            if (blH > 0) {
                ctx2.drawImage(img, 0, Math.max(0, sh - capSrc), capSrc, capSrc,
                    left, blY, capDstX, blH);
                if (midDstX > 0)
                    ctx2.drawImage(img, midSrcX, Math.max(0, sh - capSrc), midSrcW, capSrc,
                        left + capDstX, blY, midDstX, blH);
                const brX = left + capDstX + midDstX;
                const brW = Math.max(0, right - brX);
                if (brW > 0)
                    ctx2.drawImage(img, Math.max(0, sw - capSrc), Math.max(0, sh - capSrc), capSrc, capSrc,
                        brX, blY, brW, blH);
            }
        }

        ctx2.restore();
    }

    // --- NEW: plain-text drawer that respects \n and blank lines (pre-wrap) ---
    function drawTextPreWrap(ctx2, x, y, maxWidth, lineHeight, text, align /* 'left'|'center'|'right' */) {
        const paragraphs = String(text ?? "").replace(/\r/g, "").split("\n");
        const startX = (lineW) => {
            if (align === "center") return x + Math.max(0, (maxWidth - lineW) / 2);
            if (align === "right") return x + Math.max(0, (maxWidth - lineW));
            return x;
        };

        for (let p = 0; p < paragraphs.length; p++) {
            const raw = paragraphs[p];

            // blank line → advance
            if (raw === "") { y += lineHeight; continue; }

            const tokens = raw.split(/(\s+)/); // keep spaces
            let line = "";

            for (let i = 0; i < tokens.length; i++) {
                const test = line + tokens[i];
                if (maxWidth && ctx2.measureText(test).width > maxWidth && line !== "") {
                    ctx2.fillText(line, startX(ctx2.measureText(line).width), y);
                    y += lineHeight;
                    // avoid leading large spaces at start of wrapped line
                    line = tokens[i].replace(/^\s+/, "");
                } else {
                    line = test;
                }
            }
            if (line !== "") {
                ctx2.fillText(line, startX(ctx2.measureText(line).width), y);
                y += lineHeight;
            }
        }
        return y; // final y baseline
    }

    // z-ordered
    const all = [...(images || []), ...(textObjects || [])]
        .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

    for (const box of all) {
        if (box.width == null || Number.isNaN(box.width)) box.width = 50;
        if (box.height == null || Number.isNaN(box.height)) box.height = 30;

        const { w, h, cx, cy } = getBoxRect(box);
        const angleRad = deg2rad(box.rotation || 0);

        // normalize clip & compute effective direction
        if (typeof box.previousClip !== "number") {
            box.previousClip = Number(box.clip) || 0;
        }
        const __clipVal = Math.max(0, Math.min(1, Number(box.clip) || 0));
        const __isHiding = __clipVal > box.previousClip;
        const __origDir = box.clipDirection || "top";
        const __effDir = __isHiding ? invertDirection(__origDir) : __origDir;
        box.previousClip = __clipVal;

        if (__clipVal >= 1) continue;

        box.__clipVal = __clipVal;
        box.__effDir = __effDir;

        if (typeof box.scaleX !== "number") box.scaleX = 1;
        if (typeof box.scaleY !== "number") box.scaleY = 1;
        const __sx = (Number(box.scaleX) || 0);
        const __sy = (Number(box.scaleY) || 0);
        if (__sx === 0 || __sy === 0) continue;

        // world-space clip sandbox
        ctx.save();
        if (box.clip >= 1) { ctx.restore(); ctx.restore(); return; }

        if (box.clip > 0 && box.clip < 1) {
            const originalDir = box.clipDirection || "top";
            const isHiding = box.clip > box.previousClip;
            const effectiveDirection = isHiding ? invertDirection(originalDir) : originalDir;

            box.previousClip = box.clip;

            const isImage = box.type === 'image';
            const width = isImage ? box.width : box.boundingWidth;
            const height = isImage ? box.height : box.boundingHeight;
            const x = box.x;
            const y = box.y;

            ctx.beginPath();
            if (effectiveDirection === "top") {
                const visibleHeight = height * (1 - box.clip);
                ctx.rect(x, y, width, visibleHeight);
            } else if (effectiveDirection === "bottom") {
                const visibleHeight = height * (1 - box.clip);
                ctx.rect(x, y + height - visibleHeight, width, visibleHeight);
            } else if (effectiveDirection === "left") {
                const visibleWidth = width * (1 - box.clip);
                ctx.rect(x, y, visibleWidth, height);
            } else if (effectiveDirection === "right") {
                const visibleWidth = width * (1 - box.clip);
                ctx.rect(x + width - visibleWidth, y, visibleWidth, height);
            }
            ctx.clip();
        }
        ctx.restore();

        const isBasic = box.isBasic ?? false;
        if (isBasic) {
            if (box.type === "image") {
                const { w, h, cx, cy } = getBoxRect(box);
                const angleRad = deg2rad(box.rotation || 0);

                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(angleRad);
                ctx.scale(__sx, __sy);
                ctx.globalAlpha = normAlpha(box.opacity);

                if (box.__clipVal > 0 && box.__clipVal < 1) {
                    __applyLocalRectMask(ctx, w, h, box.__clipVal, box.__effDir || "top");
                }

                if (box.img) {
                    if (box.img.complete) {
                        const natW = box.img.naturalWidth || box.img.width || w;
                        const natH = box.img.naturalHeight || box.img.height || h;
                        const arImg = natW / Math.max(natH, 1e-6);
                        const arBox = w / Math.max(h, 1e-6);
                        const aspectChanged = Math.abs(arBox - arImg) > 1e-3;
                        const preserveCaps = (box.preserveCaps === true) || aspectChanged;
                        if (preserveCaps) {
                            const wantVerticalCaps = (box.__capsOrientation === 'vertical');
                            const k = 0.480732281680149;
                            let __didCapsDraw = false;
                            if (wantVerticalCaps) {
                                ctx.save(); ctx.rotate(Math.PI / 2);
                                if (typeof __drawImageNineSliceLocal === 'function') {
                                    __drawImageNineSliceLocal(ctx, box.img, h, w, k, box);
                                    __didCapsDraw = true;
                                } else if (typeof __drawImageThreeSliceLocalX === 'function') {
                                    __drawImageThreeSliceLocalX(ctx, box.img, h, w, k);
                                    __didCapsDraw = true;
                                } else if (typeof __drawImageThreeSliceLocalY === 'function') {
                                    __drawImageThreeSliceLocalY(ctx, box.img, w, h, k);
                                    __didCapsDraw = true;
                                }
                                ctx.restore();
                            }
                            if (!__didCapsDraw) {
                                if (typeof __drawImageNineSliceLocal === 'function') {
                                    __drawImageNineSliceLocal(ctx, box.img, w, h, k, box);
                                } else if (typeof __drawImageThreeSliceLocalX === 'function') {
                                    __drawImageThreeSliceLocalX(ctx, box.img, w, h, k);
                                } else {
                                    ctx.drawImage(box.img, -w / 2, -h / 2, w, h);
                                }
                            }
                        } else {
                            ctx.drawImage(box.img, -w / 2, -h / 2, w, h);
                        }
                    } else {
                        const img = box.img;
                        img.onload = () => { img.onload = null; drawText(); };
                        img.onerror = () => { img.onerror = null; };
                    }
                }

                ctx.restore();

                if (box.selected && w > 0 && h > 0) {
                    drawRotatedSelection(ctx, { ...box, width: w * __sx, height: h * __sy });
                }
                continue;
            }

        } else {
            if (box.type === "image") {
                const { w, h, cx, cy } = getBoxRect(box);
                const angleRad = deg2rad(box.rotation || 0);

                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(angleRad);
                ctx.scale(__sx, __sy);
                ctx.globalAlpha = normAlpha(box.opacity);

                if (box.__clipVal > 0 && box.__clipVal < 1) {
                    __applyLocalRectMask(ctx, w, h, box.__clipVal, box.__effDir || "top");
                }

                if (box.img) {
                    if (box.img.complete) {
                        try { ctx.drawImage(box.img, -w / 2, -h / 2, w, h); } catch (e) { }
                    } else {
                        const img = box.img;
                        img.onload = () => { img.onload = null; drawText(); };
                        img.onerror = () => { img.onerror = null; };
                    }
                }
                ctx.restore();
                if (box.selected && w > 0 && h > 0) {
                    drawRotatedSelection(ctx, { ...box, width: w * __sx, height: h * __sy });
                }
                continue;
            }
        }

        // ---------------- TEXT ----------------
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angleRad);
        ctx.scale(__sx, __sy);
        ctx.globalAlpha = normAlpha(box.opacity);

        if (box.__clipVal > 0 && box.__clipVal < 1) {
            __applyLocalRectMask(ctx, w, h, box.__clipVal, box.__effDir || "top");
        }

        // PLAIN TEXT PATH (no tags): draw with pre-wrap semantics
        const rawText = String(box.text || "");
        const isPlain = rawText.indexOf('<') === -1 && rawText.indexOf('>') === -1;

        const innerLeft = -w / 2 + 5;
        const innerTop = -h / 2 + 5;
        const innerWidth = Math.max(0, w - 10);

        ctx.fillStyle = box.color || defaultColor;
        ctx.font = `${defaultFontStyle} ${defaultFontWeight} ${defaultFontSize} ${defaultFontFamily}`;

        const basePx = parseFloat(defaultFontSize) || 16;
        const lineH = basePx * (box.lineSpacing || 1.2);

        if (isPlain) {
            // honor align
            const align = (box.align || 'left');
            // draw and get the final y to compute used height
            const yEnd = drawTextPreWrap(ctx, innerLeft, innerTop, innerWidth, lineH, rawText, align);
            const usedHeight = (yEnd - innerTop) + 5;
            box.height = usedHeight;
            syncTextDims(box);
            ctx.restore();
            if (box.selected && w > 0 && h > 0) {
                drawRotatedSelection(ctx, { ...box, width: w * __sx, height: h * __sy });
            }
            continue; // skip rich HTML path
        }

        // ---- RICH HTML PATH (UNCHANGED from your code) ----
        const wrapper = document.createElement("div");
        wrapper.innerHTML = box.text || "";
        // 🚫 prune ghost placeholders BEFORE your normalizers run
        (function pruneGhostPlaceholders(root) {
            // 1) remove empty <p> without <br>
            Array.from(root.querySelectorAll('p')).forEach(p => {
                const hasBR = !!p.querySelector('br');
                const txt = (p.textContent || '').replace(/[\u200B\u00A0\s]/g, ''); // strip ZWSP, NBSP, spaces
                if (!hasBR && txt === '') p.remove();
            });
            // 2) remove now-empty <div>/<p> that contain no <br> and no real text
            Array.from(root.querySelectorAll('div,p')).forEach(el => {
                const hasBR = !!el.querySelector('br');
                const txt = (el.textContent || '').replace(/[\u200B\u00A0\s]/g, '');
                if (!hasBR && txt === '') el.remove();
            });
        })(wrapper);
        __normalizeToLineDivs(wrapper);
        // __unwrapSpanBlocks(wrapper);     // handles <div><span>…block lines…</span></div>
        __fixEmptyLineDivs(wrapper);     // ensures <div><br></div> for blank lines
        __explodeNewlinesToBR(wrapper);



        const lines = [];

        // helpers
        const hasExplicitBRDeep = (node) =>
            !!(node.querySelector ? node.querySelector('br') : (node.tagName === 'BR'));

        const hasRealContentDeep = (node) => {
            // any non-whitespace text or a non-BR element counts as content
            if (node.nodeType === 3) return /\S/.test(node.nodeValue || '');
            if (node.nodeType !== 1) return false;
            if (node.tagName === 'BR') return false;
            for (const c of node.childNodes) if (hasRealContentDeep(c)) return true;
            return false;
        };

        const pushBlank = () => {
            const blank = document.createElement('div');
            blank.appendChild(document.createElement('br'));
            __stripTrailingBRs?.(blank);
            lines.push(blank);
        };

        const pushFromChildren = (node) => {
            const ln = document.createElement('div');
            // unwrap a single child <p> so you don't get <div><p>…</p></div> artifacts
            if (node.children && node.children.length === 1 && node.firstElementChild.tagName === 'P') {
                ln.append(...node.firstElementChild.cloneNode(true).childNodes);
            } else {
                ln.append(...node.cloneNode(true).childNodes);
            }
            __stripTrailingBRs?.(ln);
            lines.push(ln);
        };

        // build lines
        wrapper.childNodes.forEach((n) => {
            if (n.nodeType === 1 && (n.tagName === 'DIV' || n.tagName === 'P')) {
                const hasContent = hasRealContentDeep(n);
                const hasBR = hasExplicitBRDeep(n);

                if (!hasContent && !hasBR) {
                    // EMPTY <div> / <p> with NO <br> → ignore (no newline on canvas)
                    return;
                }
                if (!hasContent && hasBR) {
                    // pure blank, but explicitly marked with <br> → count as one blank line
                    pushBlank();
                    return;
                }
                // has some real content → render the children as a normal line
                pushFromChildren(n);
                return;
            }

            if (n.nodeType === 1 && n.tagName === 'BR') {
                // top-level <br> becomes one blank line
                pushBlank();
                return;
            }

            // top-level text/inline nodes → append to the current line
            if (lines.length === 0) lines.push(document.createElement('div'));
            lines[lines.length - 1].appendChild(n.cloneNode(true));
            __stripTrailingBRs?.(lines[lines.length - 1]);
        });


        const left = -w / 2;
        const top = -h / 2;

        let cursorY = top + 5;
        let usedHeight = 0;

        let __maxRunWidthObserved = 0;
        let __maxTokenWidthObserved = 0;

        lines.forEach(lineNode => {
            let cursorX = left + 5;
            if (box.align === "center") {
                ctx.textAlign = "center";
                cursorX = left + w / 2;
            } else if (box.align === "right") {
                ctx.textAlign = "right";
                cursorX = left + w - 5;
            } else {
                ctx.textAlign = "left";
            }

            const innerLeft2 = left + 5;
            const innerRight2 = left + w - 5;
            const innerWidth2 = Math.max(0, innerRight2 - innerLeft2);
            const alignMode = box.align || "left";
            ctx.textAlign = "left";

            let segments = [];
            let maxFontPx = 0;
            const __originalTextForLine = (lineNode.textContent || "");
            function measureWords(node, style) {
                if (node.nodeType === 3) {
                    // text node → split but keep whitespace tokens
                    const tokens = (node.nodeValue.match(/(\s+|\S+)/g) || []);
                    for (let tk of tokens) {
                        const fs = style.fontSize || defaultFontSize;
                        const ff = style.fontFamily || defaultFontFamily;
                        const fw = style.fontWeight || defaultFontWeight;
                        const fst = style.fontStyle || defaultFontStyle;
                        const col = style.color || defaultColor;

                        ctx.font = `${fst} ${fw} ${fs} ${ff}`;
                        const width = ctx.measureText(tk).width;
                        const px = parseFloat(fs);
                        if (!isNaN(px)) maxFontPx = Math.max(maxFontPx, px);

                        const isSpace = /^\s+$/.test(tk);
                        segments.push({ text: tk, width, style: { fs, ff, fw, fst, col }, isSpace });

                        if (!isSpace && width > __maxTokenWidthObserved) {
                            __maxTokenWidthObserved = width;
                        }
                    }
                    return;
                } 
                if (node.nodeType === 1) {
                    // <br> → hard newline (no space token)
                    if (node.tagName === "BR") {
                        // Find the nearest "line" container (DIV or P), climbing over SPAN wrappers, etc.
                        let lineContainer = null;
                        if (node.closest) lineContainer = node.closest('div, p');

                        // Treat as a real blank line if the container has a BR somewhere and no visible text
                        let onlyBRLine = false;
                        if (lineContainer) {
                            const textNoZW = (lineContainer.textContent || '').replace(/\u200B/g, '');
                            const onlyWS = !/[^\s\u00A0]/.test(textNoZW);
                            const hasBR = !!lineContainer.querySelector('br');
                            if (hasBR && onlyWS) onlyBRLine = true;
                        }

                        // "Trailing BR" detection (nothing meaningful after it),
                        // BUT do not treat as trailing if the next sibling is another <br>, or if it's an onlyBRLine.
                        let trailing = true;
                        if (!onlyBRLine) {
                            for (let s = node.nextSibling; s; s = s.nextSibling) {
                                if (s.nodeType === 3) {
                                    const val = (s.nodeValue || "").replace(/\r/g, "");
                                    if (/\S/.test(val)) { trailing = false; break; }
                                } else if (s.nodeType === 1) {
                                    if (s.tagName === 'BR') { trailing = false; break; } // allow <br><br> chains
                                    const txt = (s.textContent || "").replace(/\r/g, "");
                                    if (/\S/.test(txt)) { trailing = false; break; }
                                }
                            }
                        }

                        // If it's an onlyBRLine (visual blank line), DO NOT skip it.
                        // Otherwise, skip truly trailing BRs.
                        if (!onlyBRLine && trailing) return;

                        // Record font metrics so line-height stays correct
                        const fs = style.fontSize || defaultFontSize;
                        const ff = style.fontFamily || defaultFontFamily;
                        const fw = style.fontWeight || defaultFontWeight;
                        const fst = style.fontStyle || defaultFontStyle;
                        const col = style.color || defaultColor;
                        const px = parseFloat(fs);
                        if (!isNaN(px)) maxFontPx = Math.max(maxFontPx, px);

                        // Emit a hard newline marker (renderer should flush on seg.nl)
                        segments.push({ nl: true, style: { fs, ff, fw, fst, col } });
                        return;
                    }

                    // normal element: recurse with inherited inline styles
                    const s = node.style || {};
                    const nextStyle = {
                        fontSize: s.fontSize || style.fontSize,
                        fontFamily: s.fontFamily || style.fontFamily,
                        fontWeight: s.fontWeight || style.fontWeight,
                        fontStyle: s.fontStyle || style.fontStyle,
                        color: s.color || style.color,
                    };
                    node.childNodes.forEach(child => measureWords(child, nextStyle));
                    return;
                }
            }

            measureWords(lineNode, {
                fontSize: defaultFontSize,
                fontFamily: defaultFontFamily,
                fontWeight: defaultFontWeight,
                fontStyle: defaultFontStyle,
                color: defaultColor
            });

            const basePx2 = parseFloat(defaultFontSize) || 16;
            const lineHeight = (maxFontPx > 0 ? maxFontPx : basePx2) * (box.lineSpacing || 1.2);
            /* ✅ OPTIONAL ROBUSTNESS ADD — insert these lines */
            const __hasRealContent = segments.some(seg =>
                !seg?.nl && !seg?.isSpace && typeof seg.text === "string" && seg.text.trim() !== ""
            );
            // draw that text directly so it never disappears.
            if (!__hasRealContent && __originalTextForLine.trim() !== "") {
                const drawLeft = innerLeft2;   // you already computed innerLeft2/innerWidth2 above
                ctx.textAlign = (alignMode === "center") ? "center" : (alignMode === "right" ? "right" : "left");
                let startX;
                if (alignMode === "center") startX = drawLeft + Math.max(0, innerWidth2 / 2);
                else if (alignMode === "right") startX = innerRight2;
                else startX = drawLeft;

                // use default font/color for the fallback
                ctx.font = `${defaultFontStyle} ${defaultFontWeight} ${defaultFontSize} ${defaultFontFamily}`;
                ctx.fillStyle = defaultColor;
                ctx.fillText(__originalTextForLine.trim(), startX, cursorY);

                cursorY += lineHeight;
                usedHeight = cursorY - top + 5;
                return; // move to next line
            }
            //const isBlankLine = (segments.length === 0) ||
            //    segments.every(seg => seg.isSpace || ((seg.text || '').trim() === ''));

            const hasBROnly = (lineNode.children.length > 0) &&
                Array.from(lineNode.childNodes).every(
                    c => c.nodeType === 1 && c.tagName === 'BR'
                );

            const onlyWhitespace = !/\S/.test(lineNode.textContent || '');
            const isBlankLine = hasBROnly || onlyWhitespace;

            if (isBlankLine) {
                cursorY += lineHeight;
                usedHeight = cursorY - top + 5;
                return;
            }

            const __usePerRun = true;

            if (__usePerRun) {
                function startXForWidth(runWidth) {
                    if (alignMode === "center") return innerLeft2 + Math.max(0, (innerWidth2 - runWidth) / 2);
                    if (alignMode === "right") return innerRight2 - runWidth;
                    return innerLeft2;
                }

                let runSegs = [];
                let runWidth = 0;
                let runMaxPx = 0;

                function flushRun(forceLine, heightPx) {
                    if (runSegs.length === 0 && !forceLine) return;

                    // draw the buffered segments when present
                    if (runSegs.length) {
                        let x2 = startXForWidth(runWidth);
                        for (const seg of runSegs) {
                            ctx.font = `${seg.style.fst} ${seg.style.fw} ${seg.style.fs} ${seg.style.ff}`;
                            ctx.fillStyle = seg.style.col;
                            ctx.fillText(seg.text, x2, cursorY);
                            x2 += seg.width;
                        }
                    }

                    // decide line height
                    const px = forceLine ? (heightPx || basePx2)
                        : (runMaxPx || basePx2);
                    const lh = px * (box.lineSpacing || 1.2);

                    cursorY += lh;
                    usedHeight = cursorY - top + 5;

                    // reset run
                    runSegs = [];
                    runWidth = 0;
                    runMaxPx = 0;
                }

                for (const seg of segments) {
                    // ---- handle hard line break tokens first ----
                    if (seg.nl) {
                        const segPx = parseFloat(seg.style?.fs) || basePx2;
                        flushRun(true, segPx);   // force a line advance even if run is empty
                        continue;
                    }

                    const segPx = parseFloat(seg.style.fs) || basePx2;
                    if (seg.isSpace && runSegs.length === 0) continue;
                    if (runWidth + seg.width > innerWidth2 && runSegs.length > 0) {
                        flushRun(false);
                        if (seg.isSpace) continue;
                    }
                    runSegs.push(seg);
                    runWidth += seg.width;
                    if (segPx > runMaxPx) runMaxPx = segPx;
                }
                flushRun(runSegs.length === 0 ? false : false); // keep as-is; last line flush


            } else {
                let x = cursorX;
                let drewSomething = false;
                segments.forEach(seg => {
                    if (x + seg.width > left + w - 0.01) {
                        cursorY += lineHeight;
                        x = cursorX;
                    }
                    ctx.font = `${seg.style.fst} ${seg.style.fw} ${seg.style.fs} ${seg.style.ff}`;
                    ctx.fillStyle = seg.style.col;
                    ctx.fillText(seg.text, x, cursorY);
                    x += seg.width;
                    drewSomething = true;
                });

                if (drewSomething) cursorY += lineHeight;
                usedHeight = cursorY - top + 5;
            }
        });

        const __minOuterWidthByWord = Math.ceil(__maxTokenWidthObserved + 10);
        if (__minOuterWidthByWord > (box.width || 0)) {
            box.width = __minOuterWidthByWord;
        }

        box.height = usedHeight;
        syncTextDims(box);
        ctx.restore();

        if (box.selected && w > 0 && h > 0) {
            drawRotatedSelection(ctx, { ...box, width: w * __sx, height: h * __sy });
        }
    }
}

// Turn text nodes that contain \n (or \r\n) into text + <br> nodes
function __explodeNewlinesToBR(root) {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const toReplace = [];
    while (walker.nextNode()) {
        const t = walker.currentNode;
        if (t.nodeValue && /[\r\n]/.test(t.nodeValue)) toReplace.push(t);
    }
    for (const t of toReplace) {
        const parts = t.nodeValue.replace(/\r/g, "").split("\n");
        const frag = document.createDocumentFragment();
        parts.forEach((s, i) => {
            if (s) frag.appendChild(document.createTextNode(s));
            if (i < parts.length - 1) frag.appendChild(document.createElement("br"));
        });
        t.parentNode.replaceChild(frag, t);
    }
}



function __stripTrailingBRs(div) {
    if (!div) return;
    // remove any <br> at the very end of the block
    while (div.lastChild && div.lastChild.nodeType === 1 && div.lastChild.tagName === 'BR') {
        div.removeChild(div.lastChild);
    }
    // remove trailing whitespace-only text nodes (incl. \r\n)
    while (div.lastChild && div.lastChild.nodeType === 3) {
        const t = div.lastChild.nodeValue || "";
        if (t.replace(/\s|\r|\n/g, "") === "") div.removeChild(div.lastChild); else break;
    }
}


function pickTopObject(mx, my) {
    // highest zIndex among all objects under the pointer
    let best = null;
    const all = [...images, ...textObjects];
    for (const o of all) {
        if (pointInBox(o, mx, my)) {
            if (!best || (o.zIndex || 0) >= (best.zIndex || 0)) best = o;
        }
    }
    return best;
}


function measureTextHTML(html, referenceStyle) {
    const temp = document.createElement("div");
    temp.innerHTML = html;
    temp.style.position = "absolute";
    temp.style.visibility = "hidden";
    temp.style.whiteSpace = "pre-wrap";
    temp.style.fontSize = referenceStyle.fontSize;
    temp.style.fontFamily = referenceStyle.fontFamily;
    temp.style.lineHeight = referenceStyle.lineHeight;
    temp.style.fontWeight = referenceStyle.fontWeight;
    temp.style.fontStyle = referenceStyle.fontStyle;
    temp.style.padding = "5px";
    temp.style.maxWidth = "400px";
    document.body.appendChild(temp);

    const size = {
        width: temp.offsetWidth,
        height: temp.offsetHeight
    };

    document.body.removeChild(temp);
    return size;
}

function computeMinFontPxFromHTML(html, fallback = 16) {
    let min = Infinity;
    const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
    (function walk(n) {
        if (n.nodeType === 1) {
            // inline style font-size
            const fs = n.style?.fontSize;
            if (fs) {
                const px = parseFloat(fs);
                if (!isNaN(px)) min = Math.min(min, px);
            }
            // legacy <font size="...">
            if (n.tagName === 'FONT' && n.getAttribute('size')) {
                const size = parseInt(n.getAttribute('size'), 10);
                if (!isNaN(size)) {
                    const map = { 1: 10, 2: 13, 3: 16, 4: 18, 5: 24, 6: 32, 7: 48 };
                    min = Math.min(min, map[size] ?? 16);
                }
            }
            n.childNodes.forEach(walk);
        }
    })(doc.body);
    return (min === Infinity ? fallback : min);
}
function scaleBoxContent(box, scale) {
    const container = document.createElement("div");
    container.innerHTML = box.text;
    container.querySelectorAll("*").forEach(el => {
        if (el.style.fontSize) {
            const px = parseFloat(el.style.fontSize);
            if (!isNaN(px)) el.style.fontSize = (px * scale).toFixed(2) + "px";
        }
        if (el.tagName === "FONT" && el.getAttribute("size")) {
            const size = parseInt(el.getAttribute("size"));
            if (!isNaN(size)) {
                const px = sizeToPx(size);
                el.style.fontSize = (px * scale).toFixed(2) + "px";
                el.removeAttribute("size");
            }
        }
        if (el.style.lineHeight && el.style.lineHeight.includes("px")) {
            const lh = parseFloat(el.style.lineHeight);
            if (!isNaN(lh)) el.style.lineHeight = (lh * scale).toFixed(2) + "px";
        }
    });
    box.text = container.innerHTML;
}
const HANDLE_CURSOR = {
    tl: "nwse-resize", br: "nwse-resize",
    tr: "nesw-resize", bl: "nesw-resize",
    l: "ew-resize", r: "ew-resize",
    t: "ns-resize", b: "ns-resize"
};
function normalizeHandle(h) {
    if (!h) return h;
    switch (h) {
        // corners
        case "top-left": return "tl";
        case "top-right": return "tr";
        case "bottom-left": return "bl";
        case "bottom-right": return "br";
        // sides
        case "ml": case "middle-left": return "l";
        case "mr": case "middle-right": return "r";
        case "mt": case "middle-top": return "t";
        case "mb": case "middle-bottom": return "b";
        default: return h; // already "tl","tr","bl","br","l","r","t","b"
    }
}
function setGlobalCursor(cursor) {
    const c = cursor || "";
    canvas.style.cursor = c || "default";
    document.body.style.cursor = c;
    document.documentElement.style.cursor = c;
}

// ——————— Mouse Events ———————

function deselectAllText() {
    if (!Array.isArray(textObjects)) return;
    textObjects.forEach(o => o.selected = false);
}

function hitTestTextObject(mx, my) {
    const items = (Array.isArray(textObjects) ? textObjects : [])
        .slice()
        .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0)); // bottom→top
    for (let i = items.length - 1; i >= 0; i--) {    // pick topmost
        const o = items[i];
        const w = o.width ?? o.boundingWidth ?? 0;
        const h = o.height ?? o.boundingHeight ?? 0;
        if (mx >= o.x && mx <= o.x + w && my >= o.y && my <= o.y + h) return o;
    }
    return null;
}


function objW(o) { return Number.isFinite(o.width) ? o.width : (Number.isFinite(o.boundingWidth) ? o.boundingWidth : 0); }
function objH(o) { return Number.isFinite(o.height) ? o.height : (Number.isFinite(o.boundingHeight) ? o.boundingHeight : 0); }
function deselectAllText() { if (Array.isArray(textObjects)) textObjects.forEach(o => o.selected = false); }
function topmostAt(mx, my) {
    if (!Array.isArray(textObjects)) return null;
    const items = textObjects.slice().sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
    for (let i = items.length - 1; i >= 0; i--) {
        const o = items[i], w = objW(o), h = objH(o);
        if (mx >= o.x && mx <= o.x + w && my >= o.y && my <= o.y + h) return o;
    }
    return null;
}



function scaleTextHTML(html, scale) {
    const div = document.createElement("div");
    div.innerHTML = html;

    (function walk(node) {
        if (node.nodeType === 1) {
            // inline style: font-size: Npx;
            if (node.style && node.style.fontSize) {
                const px = parseFloat(node.style.fontSize);
                if (!isNaN(px)) node.style.fontSize = (px * scale).toFixed(2) + "px";
            }

            // inline style: line-height: Npx;  (only px to avoid double-scaling %/unitless)
            if (node.style && node.style.lineHeight && node.style.lineHeight.includes("px")) {
                const lh = parseFloat(node.style.lineHeight);
                if (!isNaN(lh)) node.style.lineHeight = (lh * scale).toFixed(2) + "px";
            }

            // legacy <font size="1..7">
            if (node.tagName === "FONT" && node.hasAttribute("size")) {
                const map = { 1: 10, 2: 13, 3: 16, 4: 18, 5: 24, 6: 32, 7: 48 };
                const sz = parseInt(node.getAttribute("size"), 10);
                const basePx = map[sz] ?? 16;
                node.style.fontSize = (basePx * scale).toFixed(2) + "px";
                node.removeAttribute("size");
            }

            // recurse
            for (const child of node.childNodes) walk(child);
        }
    })(div);

    return div.innerHTML;
}
function sizeToPx(size) {
    const map = { 1: 10, 2: 13, 3: 16, 4: 18, 5: 24, 6: 32, 7: 48 };
    return map[size] ?? 16;
}
let contextTarget = null;
let startDrag = null;
// make canvas focusable once
//if (!canvas.hasAttribute('tabindex')) canvas.setAttribute('tabindex', '0');
canvas.addEventListener("mousedown", e => {
    if (e.button === 2) return;
    isGroupAction = false;

    const { x: mx, y: my } = getCanvasMousePosition(e);

    // ⬅️ ADDED: reset single-click/drag mode BEFORE any mousemove
    isClickSingle = false;

    // Remember starting point (design space)
    marqueeStart.x = mx;
    marqueeStart.y = my;
    marqueeNow.x = mx;
    marqueeNow.y = my;
    isMarquee = true;

    const sel = getSelectedItems?.() || [];
    if (sel.length >= 2) {
        const g = aabbOfItems(sel);
        const dir = g ? hitGroupHandle(mx, my, g, 10) : null;
        const top = getTopHitAt?.(mx, my);
        const clickedSelected = !!(top && top.selected);

        if (dir || clickedSelected) {
            // ⬅️ ADDED: we’re acting on selection → no marquee, it’s a single/group action
            isMarquee = false;
            isClickSingle = true;

            startGroupDragOrResize(mx, my, dir || null);
            isGroupAction = true;
            e.preventDefault();
            return;               // ← don't fall into single-select path
        }
    }


    // click handler (early exit)
    if (isDraggingMulti || isResizingMulti || isGroupAction) {
        isGroupAction = false;
        e.preventDefault(); e.stopPropagation();
        return;
    }

    // if (e.button === 2) return; // don't let right-click alter selection/drag
    canvas.focus({ preventScroll: true });

    const RIGHT = 2;
    // const { x: mx, y: my } = getCanvasMousePosition(e);
    startX = e.clientX; startY = e.clientY;
    prevMouseX = mx; prevMouseY = my;
    startMXCanvas = mx; startMYCanvas = my;

    // --- local safe helpers (used only if globals aren't defined) ---
    const __isLineSvg = (typeof globalThis.__isLineSvg === "function")
        ? globalThis.__isLineSvg
        : (box) => !!(box && box.isLINESvg === true);

    const __allowedHandlesFor =
        (typeof globalThis.__allowedHandlesFor === "function")
            ? globalThis.__allowedHandlesFor
            : (box) => __isLineSvg(box)
                ? new Set(["l", "r"])                                       // lines → only L/R
                : new Set(["l", "r", "t", "b", "tl", "tr", "bl", "br"]);    // others → everything

    // NEW: map any corner on a line to its nearest side; block t/b
    function __mapHandleForLine(box, handleStr, rawStr) {
        if (!__isLineSvg(box)) return (handleStr || rawStr || "").toLowerCase();
        const s = String(handleStr || "").toLowerCase();
        const r = String(rawStr || "").toLowerCase();
        let h = s || r;
        if (h === "ml") h = "l";
        else if (h === "mr") h = "r";
        // corners → sides (so side-resize works even when corners overlap)
        if (h === "tl" || h === "l" || h === "bl") h = "l";
        else if (h === "tr" || h === "r" || h === "br") h = "r";
        // block top/bottom for lines
        if (h === "t" || h === "b") h = "";
        return h;
    }
    // -----------------------------------------------------------------

    // finish editing if any
    if (isEditing && activeBox) {
        cleanEditorHTMLPreserveCaret?.();
        activeBox.text = textEditorNew.innerHTML;
        activeBox.align = textEditorNew.style.textAlign || "left";
        isEditing = false;
        if (textEditorNew) textEditorNew.style.display = "none";
    }

    // Right button: don't start drags/resizes. Just remember target and exit.
    if (e.button === RIGHT) {
        const top = getTopHitAt(mx, my);
        setSelectionTarget(top, { setActive: true, setContext: true });
        drawText();
        return;
    }

    // 1) HANDLE TEST (TOP → BOTTOM). If a handle is hit, that box WINS.
    const h = findHandleAt(mx, my);
    if (h) {
        // ⬅️ ADDED
        isMarquee = false;
        isClickSingle = true;

        // clear others (unless you want shift-handle to multi-resize)
        if (!e.shiftKey) {
            (textObjects || []).forEach(o => o.selected = false);
            (images || []).forEach(o => o.selected = false);
        }
        setSelectionTarget(h.box, { setActive: true, setContext: true });
        drawText();

        // proceed with your existing handle logic
        const handle = h.handle;        // raw hit name (could be 'ml','mr','tl', etc.)
        resizeDirectionRaw = h.raw;
        resizeDirectionNorm = handle;
        resizeDirection = handle;

        // NEW: normalize specifically for line items
        if (__isLineSvg(h.box)) {
            const mapped = __mapHandleForLine(h.box, handle, resizeDirectionRaw);
            if (mapped === "l" || mapped === "r") {
                // keep resizing but force to side
                resizeDirectionNorm = mapped;
                resizeDirection = mapped;
            } else {
                // not allowed (t/b or anything empty) → body drag
                isCornerFontScale = false;
                isCornerImageScale = false;
                isResizingNew = false;
                isDraggingNew = true;
                dragOffsetXNew = mx - h.box.x;
                dragOffsetYNew = my - h.box.y;
                resizeDirectionRaw = resizeDirectionNorm = resizeDirection = null;
                try { setGlobalCursor?.("move"); } catch { }
                return;
            }
        }

        // --- ADD: enable preserved caps on L/R for all images, and also on T/B for BASIC images ---
        if (h.box && h.box.type === "image") {
            const raw = (resizeDirectionRaw || handle || "").toLowerCase(); // e.g. 'ml','mr','mt','mb'
            const norm = (resizeDirectionNorm || "").toLowerCase();

            const isLR = (norm === "l" || norm === "r" || raw === "ml" || raw === "mr");
            const isTB = (norm === "t" || norm === "b" || raw === "mt" || raw === "mb");

            // For BASIC shapes, make top/bottom behave like left/right (preserve end caps / curvature)
            h.box.preserveCaps = isLR || (h.box.isBasic === true && isTB);
        }
        // --- END ADD ---

        // ─────────────────────────────────────────────────────────────
        // A) BASIC-only: set caps orientation on mousedown based on handle
        // ─────────────────────────────────────────────────────────────
        // A) BASIC-only: set caps orientation on mousedown based on handle
        (function setCapsOrientationForBasic() {
            const b = h.box;
            const norm = (resizeDirectionNorm || "").toLowerCase();
            if (!(b && b.type === "image" && b.isBasic === true && !__isLineSvg(b))) return;

            // remember base curvature once
            if (!Number.isFinite(b._baseCurvRatio)) {
                const k = Number.isFinite(b.curvatureRatio) ? b.curvatureRatio : 0.5;
                b._baseCurvRatio = Math.max(0, Math.min(0.5, k));
            }

            // keep 9-slice on for basic shapes during resize
            b.preserveCaps = true;

            // NEW 👇: capture the initial cap radius in pixels (constant during vertical resizing)
            {
                const w0 = b._orig?.width ?? b.width ?? 0;
                const h0 = b._orig?.height ?? b.height ?? 0;
                const capPx0 = Math.min(b._baseCurvRatio * h0, (w0 / 2)); // cannot exceed w/2
                b._capPxBase = Number.isFinite(capPx0) ? Math.max(0, capPx0) : 0;
            }

            if (norm === "l" || norm === "r") {
                b.__capsOrientation = "horizontal";
                if (b.img) b.img.__curvatureRatio = b._baseCurvRatio; // reset to base for smooth L/R
            } else if (norm === "t" || norm === "b") {
                b.__capsOrientation = "vertical";
                if (b.img) b.img.__curvatureRatio = b._baseCurvRatio; // we’ll override per-frame on mousemove
            }
        })();

        // ─────────────────────────────────────────────────────────────

        // NOTE: use the *normalized* direction for corner logic
        if (CORNER_HANDLES.has((resizeDirectionNorm || "").toLowerCase())) {
            if (h.box.type === "image") {
                isCornerImageScale = true; isResizingNew = false; isDraggingNew = false;
                activeBox._orig = { x: h.box.x, y: h.box.y, width: h.box.width, height: h.box.height };
                activeBox._origMouse = { x: startMXCanvas, y: startMYCanvas };
                setGlobalCursor("nwse-resize");
                document.addEventListener("mouseup", () => { isCornerImageScale = false; setGlobalCursor(""); }, { once: true });
                return;
            } else {
                isCornerFontScale = true; isResizingNew = false; isDraggingNew = false;
                activeBox._orig = { x: h.box.x, y: h.box.y, width: h.box.width, height: h.box.height, text: h.box.text };
                activeBox._origMouse = { x: startMXCanvas, y: startMYCanvas };
                setGlobalCursor("nwse-resize");
                document.addEventListener("mouseup", () => { isCornerFontScale = false; setGlobalCursor(""); }, { once: true });
                return;
            }
        }

        // side handles
        isCornerFontScale = false; isCornerImageScale = false;
        isResizingNew = true; isDraggingNew = false;

        activeBox._orig = (h.box.type === "image")
            ? { x: h.box.x, y: h.box.y, width: h.box.width, height: h.box.height }
            : { x: h.box.x, y: h.box.y, width: h.box.width, height: h.box.height, text: h.box.text, fontSize: h.box.fontSize };

        activeBox._origMouse = { x: startMXCanvas, y: startMYCanvas };

        // Use *normalized* direction for cursor (so ml/mr and corners mapped → ew-resize)
        const norm = (resizeDirectionNorm || "").toLowerCase();
        setGlobalCursor((norm === "l" || norm === "r") ? "ew-resize" : "ns-resize");

        //if (h.box.type !== "image" && (norm === "l" || norm === "r")) {
        //    if (typeof startTextSideResize === "function") startTextSideResize(activeBox);
        //    // cache the minimum width for this resize interaction
        //    activeBox._minTextOuterWidth = computeMinTextOuterWidthPx(activeBox);
        //}
        if (h.box.type !== "image" && (norm === "l" || norm === "r")) {
            if (typeof startTextSideResize === "function") startTextSideResize(activeBox);
            // allow extreme squish (no computed min width)
            activeBox._minTextOuterWidth = 1; // tiny floor to avoid negatives
        }
        return; // handle takes precedence; stop here
    }

    // 2) NO HANDLE → BODY HIT (TOPMOST)
    const hit = getTopHitAt(mx, my);

    // clear selection only when clicking empty or a different non-selected
    if (!e.shiftKey && (!hit || !hit.selected)) {
        (images || []).forEach(b => b.selected = false);
        (textObjects || []).forEach(b => b.selected = false);
        activeText = null; activeImage = null;
    }

    // Shift-click toggles and exits early
    if (e.shiftKey && hit) {
        // ⬅️ ADDED: we are acting on an item; don't let marquee engage
        isMarquee = false;
        isClickSingle = true;

        hit.selected = !hit.selected;
        drawText();
        return;
    }

    if (hit) {
        // ⬅️ ADDED: body hit is a single-item action → disable marquee
        isMarquee = false;
        isClickSingle = true;

        setSelectionTarget(hit, { setActive: true, setContext: true });

        // start drag on body
        isDraggingNew = true;
        dragOffsetXNew = mx - hit.x;
        dragOffsetYNew = my - hit.y;

        // (optional) update rotation/opacity UI here as you already do
        drawText();
    } else {
        // empty space → keep marquee armed
        activeBox = null;
        isDraggingNew = false; isResizingNew = false; resizeDirection = null;
        (textObjects || []).forEach(o => o.selected = false);
        (images || []).forEach(o => o.selected = false);
        selectedForContextMenu = null; activeText = activeImage = null;

        // ⬅️ ADDED: explicitly in marquee mode on empty
        isMarquee = true;
        isClickSingle = false;
        try { setGlobalCursor?.("crosshair"); } catch { }

        drawText();
    }
});









// ADD: measure the minimum outer width so the box can't be narrower than the longest token.
// Uses the editor's default font; good enough for interactive clamping.
function computeMinTextOuterWidthPx(box) {
    const pad = 10; // matches your 5px left/right padding in draw
    const fallbackStyle = window.getComputedStyle(textEditorNew);
    const fs = fallbackStyle.fontSize || "16px";
    const ff = fallbackStyle.fontFamily || "Arial Regular";
    const fw = fallbackStyle.fontWeight || "normal";
    const fst = fallbackStyle.fontStyle || "normal";

    // Extract plain text and split into tokens (words)
    const div = document.createElement('div');
    div.innerHTML = (box._orig && box._orig.text) ? box._orig.text : (box.text || "");
    const text = div.textContent || "";
    const tokens = text.split(/\s+/).filter(Boolean);

    // Measure with the same canvas context
    const oldFont = ctx.font;
    ctx.font = `${fst} ${fw} ${fs} ${ff}`;
    let maxTok = 0;
    for (const tk of tokens) {
        const w = ctx.measureText(tk).width;
        if (w > maxTok) maxTok = w;
    }
    ctx.font = oldFont;

    // outer width = inner content width + padding
    return Math.ceil(maxTok + pad);
}
// Canvas size helper (uses designW/H if present, else canvas dims)
function __canvasSize() {
    const W = Number.isFinite(designW) ? designW : (canvas?.width || 0);
    const H = Number.isFinite(designH) ? designH : (canvas?.height || 0);
    return { W, H };
}
function __minImageWidth(box) {
    // Respect BASIC curvature min width if applicable
    return __isBasicImage(box) ? Math.max(1, __minWidthForBasic(box)) : 1;
}
function __minImageHeight(box) {
    // Lines lock to 1px; otherwise 1px minimum (you can wire curvature here if you want)
    return (__isLineBasic?.(box)) ? 1 : 1;
}

/**
 * Clamp an IMAGE box so it cannot sit outside the canvas.
 * `handle` can be: 'drag' | 'l'|'r'|'t'|'b'|'tl'|'tr'|'bl'|'br'
 * Anchors the opposite edge(s) based on which handle is active.
 */
function __clampImageToCanvas(box, handle) {
    const { W, H } = __canvasSize();
    if (!W || !H || !box) return;

    // Ensure minimums first
    const minW = __minImageWidth(box);
    const minH = __minImageHeight(box);
    if (!Number.isFinite(box.width)) box.width = minW;
    if (!Number.isFinite(box.height)) box.height = minH;
    if (box.width < minW) box.width = minW;
    if (box.height < minH) box.height = minH;

    const movingLeft = /l/.test(String(handle || ''));
    const movingRight = /r/.test(String(handle || ''));
    const movingTop = /t/.test(String(handle || ''));
    const movingBottom = /b/.test(String(handle || ''));

    // === Drag case: just clamp position ===
    if (handle === 'drag' || !handle) {
        if (box.x < 0) box.x = 0;
        if (box.y < 0) box.y = 0;
        if (box.x + box.width > W) box.x = Math.max(0, W - box.width);
        if (box.y + box.height > H) box.y = Math.max(0, H - box.height);
        return;
    }

    // === Resizing case: keep opposite edge anchored ===
    // LEFT edge (keep right anchored)
    if (movingLeft) {
        const right = box.x + box.width;
        if (box.x < 0) {
            box.width = right; // shrink by overflow
            box.x = 0;
        }
        // enforce minW with right anchored
        if (box.width < minW) {
            box.width = Math.min(minW, W); // cannot exceed canvas width
            box.x = right - box.width;
            if (box.x < 0) { box.x = 0; box.width = right; }
        }
    }
    // RIGHT edge (keep left anchored)
    if (movingRight) {
        if (box.x + box.width > W) {
            box.width = W - box.x;
        }
        if (box.width < minW) {
            box.width = Math.min(minW, W - box.x);
        }
    }
    // TOP edge (keep bottom anchored)
    if (movingTop) {
        const bottom = box.y + box.height;
        if (box.y < 0) {
            box.height = bottom;
            box.y = 0;
        }
        if (box.height < minH) {
            box.height = Math.min(minH, H); // cannot exceed canvas height
            box.y = bottom - box.height;
            if (box.y < 0) { box.y = 0; box.height = bottom; }
        }
    }
    // BOTTOM edge (keep top anchored)
    if (movingBottom) {
        if (box.y + box.height > H) {
            box.height = H - box.y;
        }
        if (box.height < minH) {
            box.height = Math.min(minH, H - box.y);
        }
    }

    // Final safety for any simultaneous corner movement
    if (box.x < 0) box.x = 0;
    if (box.y < 0) box.y = 0;
    if (box.x + box.width > W) box.width = W - box.x;
    if (box.y + box.height > H) box.height = H - box.y;

    // Keep minimums one last time
    if (box.width < minW) box.width = minW;
    if (box.height < minH) box.height = minH;
}
// per-object switch (you said you have images.isLINESvg)
function __isLineSvg(box) {
    return !!(box && box.isLINESvg === true);
}

const __ALL_HANDLES = new Set(['tl', 't', 'tr', 'r', 'br', 'b', 'bl', 'l']);
const __LINE_HANDLES = new Set(['l', 'r']);

// which set is allowed for this box
function __allowedHandlesFor(box) {
    return __isLineSvg(box) ? __LINE_HANDLES : __ALL_HANDLES;
}
// ---- safe shim: treat "line basic" as (isBasic && isLINESvg) ----
const __isLineBasic = (typeof globalThis.__isLineBasic === 'function')
    ? globalThis.__isLineBasic
    : (box) => !!(box && box.isBasic === true && box.isLINESvg === true);

function redraw() { if (typeof drawText === 'function') drawText(); }


function __ensureCapBasePx(box) {
    if (!Number.isFinite(box._capPxBase)) {
        // Prefer explicit px radius if you store it (curvature / curvaturePx)
        let r = Number.isFinite(box.curvaturePx) ? box.curvaturePx
            : Number.isFinite(box.curvature) ? box.curvature
                : NaN;

        const w0 = box._orig?.width ?? box.width ?? 0;
        const h0 = box._orig?.height ?? box.height ?? 0;

        if (!Number.isFinite(r)) {
            const k = Number.isFinite(box.curvatureRatio) ? Math.max(0, Math.min(0.5, box.curvatureRatio)) : 0.5;
            r = k * Math.min(w0, h0);
        }
        // radius can’t exceed half of either side
        box._capPxBase = Math.max(0, Math.min(r, Math.min(w0, h0) / 2));
    }
}

function __applyBasicDimsConstantCaps(box, newX, newY, newW, newH) {
    const r0 = Number(box._capPxBase) || 0;
    const minW = Math.max(1, 2 * r0);
    const minH = Math.max(1, 2 * r0);
    if (newW < minW) newW = minW;
    if (newH < minH) newH = minH;

    box.x = newX; box.y = newY; box.width = newW; box.height = newH;

    // Keep a constant pixel corner radius by updating the curvatureRatio
    // so your renderer derives r_px = kEff * min(w, h) = r0
    const kEff = Math.min(0.5, r0 / Math.max(1e-6, Math.min(newW, newH)));
    if (box.img) box.img.__curvatureRatio = kEff;

    box.preserveCaps = true;
    box.__capsOrientation = 'neutral'; // ignore H/V split; we’re using constant px radius
}




canvas.addEventListener("mousemove", e => {
    // const { x: gmx, y: gmy } = getCanvasMousePosition(e);
    const { x: mx, y: my } = getCanvasMousePosition(e);

    if (isDraggingMulti) { updateGroupDrag(mx, my); return; }
    if (isResizingMulti) { updateGroupResize(mx, my); return; }

    const dx = mx - prevMouseX;
    const dy = my - prevMouseY;

    // ✨ EARLY-RETURN MARQUEE (only when not acting on a single item)
    if (isMarquee && !isClickSingle) {
        marqueeNow.x = mx;
        marqueeNow.y = my;
        try { setGlobalCursor?.("crosshair"); } catch { }
        drawText();
        drawMarqueeOverlay(ctx);   // or drawMarqueeOverlay()
        return;                    // stop here while band-selecting
    }

    // ──────────────────────────────────────────────────────────
    // 🔧 ROTATION HELPERS (ADD)
    function __deg2rad(a) { return (a || 0) * Math.PI / 180; }
    // world delta → local delta (relative to start point)
    function __toLocalDelta(mx, my, sx, sy, rotDeg) {
        const dxx = mx - sx, dyy = my - sy;
        const aa = __deg2rad(rotDeg || 0), cc = Math.cos(aa), ss = Math.sin(aa);
        return { dxL: dxx * cc + dyy * ss, dyL: -dxx * ss + dyy * cc };
    }

    // ──────────────────────────────────────────────────────────
    // NEW: make sure we have a baked baseline for TEXT scaling
    function __ensureBakedOrigText(box) {
        if (!box || !box._orig || typeof box._orig.text !== 'string') return;
        if (box._orig.__baked) return;

        const t = box._orig.text;
        const hasSpanFS = /<span[^>]*style\s*=\s*"[^"]*font-size\s*:/i.test(t);
        // If font-size is only on <p> or not present on spans, bake per-line spans
        if (!hasSpanFS) {
            try {
                box._orig.text = bakeInlineFontOnLinesHTML(box._orig.text, textEditorNew);
            } catch { /* ignore but keep going */ }
        }
        // freeze the baseline we will always scale from
        box._orig.textBaked = box._orig.text;
        box._orig.__baked = true;
    }

    // ──────────────────────────────────────────────────────────
    // Generic anchored resize (images/svg): opposite edge/corner fixed (ADD)
    function __applyResizeGenericAnchRot(box, dir, dxL, dyL) {
        const o = box._orig || { x: box.x, y: box.y, width: box.width, height: box.height };
        const ow = o.width, oh = o.height;

        const useX = dir.includes('l') || dir.includes('r');
        const useY = dir.includes('t') || dir.includes('b');
        const signX = dir.includes('l') ? -1 : (dir.includes('r') ? +1 : 0);
        const signY = dir.includes('t') ? -1 : (dir.includes('b') ? +1 : 0);

        let newW = ow, newH = oh;

        if (useX && useY) {
            let sX = 1 + (signX ? (signX * dxL) / Math.max(1e-6, ow) : 0);
            let sY = 1 + (signY ? (signY * dyL) / Math.max(1e-6, oh) : 0);
            sX = Math.max(0.1, sX); sY = Math.max(0.1, sY);
            const sU = Math.min(sX, sY);
            newW = ow * sU; newH = oh * sU;
        } else {
            if (useX) newW = Math.max(1, ow + signX * dxL);
            if (useY) newH = Math.max(1, oh + signY * dyL);
        }

        const dW = newW - ow, dH = newH - oh;
        const sLX = useX ? (signX * dW / 2) : 0;
        const sLY = useY ? (signY * dH / 2) : 0;

        const aa = __deg2rad(box.rotation || 0), cc = Math.cos(aa), ss = Math.sin(aa);
        const shiftX = sLX * cc - sLY * ss;
        const shiftY = sLX * ss + sLY * cc;

        const cx0 = o.x + ow / 2, cy0 = o.y + oh / 2;
        const cx = cx0 + shiftX, cy = cy0 + shiftY;

        box.x = cx - newW / 2;
        box.y = cy - newH / 2;
        box.width = newW;
        box.height = newH;
    }

    // BASIC SVG anchored resize with curvature floors + uniform corner scale (ADD / FIX)
    function __applyResizeBasicAnchRot(box, dir, dxL, dyL) {
        const o = box._orig || { x: box.x, y: box.y, width: box.width, height: box.height };
        const ow = o.width, oh = o.height;

        const useX = dir.includes('l') || dir.includes('r');
        const useY = dir.includes('t') || dir.includes('b');
        const signX = dir.includes('l') ? -1 : (dir.includes('r') ? +1 : 0);
        const signY = dir.includes('t') ? -1 : (dir.includes('b') ? +1 : 0);

        // --- floors (NO dynamic dependence on current box size) ---
        const MIN_PX = 6;
        const capPx0 = Number.isFinite(box._capPxBase) ? box._capPxBase : 0; // frozen on mousedown
        const minWUser = Number.isFinite(box.minWidth) ? box.minWidth : 1;
        const minHUser = Number.isFinite(box.minHeight) ? box.minHeight : 1;
        const minW = Math.max(MIN_PX, minWUser, Math.ceil(2 * capPx0)); // side-X floor
        const minH = Math.max(MIN_PX, minHUser, Math.ceil(2 * capPx0)); // side-Y floor

        let newW = ow, newH = oh;

        if (useX && useY) {
            // CORNER → uniform scale (match your non-rotated feel)
            let sX = 1 + (signX ? (signX * dxL) / Math.max(1e-6, ow) : 0);
            let sY = 1 + (signY ? (signY * dyL) / Math.max(1e-6, oh) : 0);
            let sU = Math.min(sX, sY);

            // allow squish back in: clamp to 0.1 and pixel floors (not to current size)
            const sMin = Math.max(0.1, MIN_PX / Math.max(1e-6, ow), MIN_PX / Math.max(1e-6, oh));
            sU = Math.max(sU, sMin);

            newW = ow * sU;
            newH = oh * sU;
        } else {
            // SIDE → single axis with stable floors (so you can squish after scaling out)
            if (useX) newW = Math.max(minW, ow + signX * dxL);
            if (useY) newH = Math.max(minH, oh + signY * dyL);
        }

        // center shift along the active local axes (opposite edge stays fixed)
        const dW = newW - ow, dH = newH - oh;
        const sLX = useX ? (signX * dW / 2) : 0;
        const sLY = useY ? (signY * dH / 2) : 0;

        const aa = __deg2rad(box.rotation || 0), cc = Math.cos(aa), ss = Math.sin(aa);
        const shiftX = sLX * cc - sLY * ss;
        const shiftY = sLX * ss + sLY * cc;

        const cx0 = o.x + ow / 2, cy0 = o.y + oh / 2;
        const cx = cx0 + shiftX, cy = cy0 + shiftY;

        box.x = cx - newW / 2;
        box.y = cy - newH / 2;
        box.width = newW;
        box.height = newH;

        // keep caps consistent (orientation hint same as your code)
        if (box.img) {
            const kEff = Math.min(0.5, capPx0 / Math.max(1e-6, box.height));
            box.img.__curvatureRatio = kEff;
        }
        box.preserveCaps = true;
        if (useX && !useY) box.__capsOrientation = 'horizontal';
        else if (!useX && useY) box.__capsOrientation = 'vertical';
    }

    // TEXT corner + side anchored with rotation (ADD)
    function __applyCornerTextAnchRot(box, dir, dxL, dyL) {
        const o = box._orig; if (!o) return;
        const ow = o.width, oh = o.height;
        const sgnX = dir.includes('l') ? -1 : (dir.includes('r') ? +1 : 0);
        const sgnY = dir.includes('t') ? -1 : (dir.includes('b') ? +1 : 0);

        let sX = 1 + (sgnX ? (sgnX * dxL) / Math.max(1e-6, ow) : 0);
        let sY = 1 + (sgnY ? (sgnY * dyL) / Math.max(1e-6, oh) : 0);
        sX = Math.max(0.1, sX); sY = Math.max(0.1, sY);
        const sU = Math.min(sX, sY);

        const newW = ow * sU, newH = oh * sU;
        const dW = newW - ow, dH = newH - oh;

        const sLX = (sgnX ? (sgnX * dW / 2) : 0);
        const sLY = (sgnY ? (sgnY * dH / 2) : 0);

        const aa = __deg2rad(box.rotation || 0), cc = Math.cos(aa), ss = Math.sin(aa);
        const shiftX = sLX * cc - sLY * ss;
        const shiftY = sLX * ss + sLY * cc;

        const cx0 = o.x + ow / 2, cy0 = o.y + oh / 2;
        const cx = cx0 + shiftX, cy = cy0 + shiftY;

        box.x = cx - newW / 2;
        box.y = cy - newH / 2;
        box.width = newW;
        box.height = newH;

        if (typeof box._orig.text === 'string') {
            // CHANGED: always scale from baked baseline
            const baseHTML = box._orig.textBaked || box._orig.text;
            box.text = scaleTextHTML(baseHTML, sU);
        }
    }
    function __applySideTextAnchRot(box, side, deltaL) {
        const o = box._orig || { x: box.x, y: box.y, width: box.width, height: box.height };
        const ow = o.width, oh = o.height;
        const isX = side === 'l' || side === 'r';
        const isY = side === 't' || side === 'b';
        const sgn = (side === 'l' || side === 't') ? -1 : +1;

        let newW = ow, newH = oh;
        if (isX) newW = Math.max(1, ow + sgn * deltaL);
        if (isY) newH = Math.max(1, oh + sgn * deltaL);

        const dW = newW - ow, dH = newH - oh;
        const sLX = isX ? (sgn * dW / 2) : 0;
        const sLY = isY ? (sgn * dH / 2) : 0;

        const aa = __deg2rad(box.rotation || 0), cc = Math.cos(aa), ss = Math.sin(aa);
        const shiftX = sLX * cc - sLY * ss;
        const shiftY = sLX * ss + sLY * cc;

        const cx0 = o.x + ow / 2, cy0 = o.y + oh / 2;
        const cx = cx0 + shiftX, cy = cy0 + shiftY;

        box.x = cx - newW / 2;
        box.y = cy - newH / 2;
        box.width = newW;
        box.height = newH;
    }

    // ──────────────────────────────────────────────────────────
    // BASIC-shape helpers (your originals kept)
    function __isBasicImage(box) {
        return !!(box && box.type === 'image' && (
            box.isBasic === true ||
            (typeof __isBasicShapeSvg === 'function' && __isBasicShapeSvg(box))
        ));
    }
    function __curvRatio(box) {
        let k = (typeof box?.curvatureRatio === 'number') ? box.curvatureRatio : 0.5;
        if (!isFinite(k)) k = 0.5;
        return Math.max(0, Math.min(0.5, k));
    }
    function __minWidthForBasic(box) {
        return Math.max(6, 2 * __curvRatio(box) * (box.width || 0));//box.height
    }
    function __minHeightForBasic(box) {
        return Math.max(6, 2 * __curvRatio(box) * (box.width || 0));
    }
    function __clampBasicSideResize(box, side /* 'l'|'r'|'t'|'b' */) {
        if (!__isBasicImage(box)) return { clamped: false };
        if (side === 'l' || side === 'r') {
            const minW = __minWidthForBasic(box);
            if ((box.width || 0) < minW) {
                const right = box.x + box.width;
                if (side === 'l') box.x = right - minW; // anchor right
                box.width = minW;
                return { clamped: true, edgeX: (side === 'l') ? box.x : (box.x + box.width) };
            }
        }
        else if (side === 't' || side === 'b') {
            const minH = __minHeightForBasic(box);
            if ((box.height || 0) < minH) {
                const bottom = box.y + box.height;
                if (side === 't') box.y = bottom - minH; // anchor bottom
                box.height = minH;
                return { clamped: true, edgeY: (side === 't') ? box.y : (box.y + box.height) };
            }
        }
        return { clamped: false };
    }

    // ──────────────────────────────────────────────────────────
    // ADD: line-only helpers (kept)
    function __isLineSvg(box) { return !!(box && box.isLINESvg === true); }
    const __LINE_HANDLES = (globalThis.__LINE_HANDLES instanceof Set)
        ? globalThis.__LINE_HANDLES
        : new Set(['l', 'r']);

    // ──────────────────────────────────────────────────────────
    // When resizing, ignore disallowed handles on line items (kept)
    if (isResizingNew && activeBox && __isLineSvg(activeBox)) {
        const side = (resizeDirectionNorm || resizeDirection || '').toLowerCase();
        if (side && !__LINE_HANDLES.has(side)) {
            isResizingNew = false;
            isDraggingNew = true;
            dragOffsetXNew = mx - activeBox.x;
            dragOffsetYNew = my - activeBox.y;
            try { setGlobalCursor?.("move"); } catch { }
            return;
        }
    }

    // ✅ TEXT left/right side-resize — rotation-aware first, then your original
    if (isResizingNew && activeBox && activeBox.type !== 'image' &&
        (resizeDirection === 'l' || resizeDirection === 'r')) {

        // NEW: ensure baked baseline exists before any text scaling/width ops
        __ensureBakedOrigText(activeBox);

        if ((activeBox.rotation || 0) % 360 !== 0) {
            const { dxL } = __toLocalDelta(mx, my, startMXCanvas, startMYCanvas, activeBox.rotation || 0);
            __applySideTextAnchRot(activeBox, resizeDirection, dxL);
            drawText();
            prevMouseX = mx; prevMouseY = my;
            return;
        }

        // your original non-rotated path
        resizeTextSideToMouse(activeBox, resizeDirection, mx, my);
        if (activeBox.width < 1) {
            if (resizeDirection === 'l') {
                const right = activeBox.x + activeBox.width;
                activeBox.width = 1;
                activeBox.x = right - 1;      // keep the right edge anchored
            } else {
                activeBox.width = 1;          // keep the left edge anchored
            }
        }
        drawText();
        return;
    }

    if (isDraggingMulti) {
        updateMultiDrag(mx, my);
        prevMouseX = mx;
        prevMouseY = my;
        return;
    }

    // cursor logic unchanged (optional to extend for images)

    if (isDraggingNew && activeBox) {
        activeBox.x = mx - dragOffsetXNew;
        activeBox.y = my - dragOffsetYNew;
        prevMouseX = mx; prevMouseY = my;
        drawText();
        return;
    }

    // OLD guard kept; now complemented by __ensureBakedOrigText above
    if (activeBox && activeBox._orig && typeof activeBox._orig.text === 'string') {
        if (!/font-size\s*:/i.test(activeBox._orig.text)) {
            activeBox._orig.text = bakeInlineFontOnLinesHTML(activeBox._orig.text, textEditorNew);
        }
    }
    // NEW: also bake if font-size appears only on <p> (nested color spans won't scale)
    if (activeBox && activeBox._orig && typeof activeBox._orig.text === 'string' && !activeBox._orig.__baked) {
        const t0 = activeBox._orig.text;
        const hasSpanFS0 = /<span[^>]*style\s*=\s*"[^"]*font-size\s*:/i.test(t0);
        if (!hasSpanFS0) {
            try { activeBox._orig.text = bakeInlineFontOnLinesHTML(activeBox._orig.text, textEditorNew); } catch { }
        }
        activeBox._orig.textBaked = activeBox._orig.text;
        activeBox._orig.__baked = true;
    }

    // TEXT corner — rotation-aware first, then your original
    if (isCornerFontScale && activeBox && resizeDirectionNorm && CORNER_HANDLES.has(resizeDirectionNorm)) {
        // NEW: ensure baked baseline exists
        __ensureBakedOrigText(activeBox);

        if ((activeBox.rotation || 0) % 360 !== 0) {
            const { dxL, dyL } = __toLocalDelta(mx, my, startMXCanvas, startMYCanvas, activeBox.rotation || 0);
            __applyCornerTextAnchRot(activeBox, resizeDirectionNorm, dxL, dyL);
            drawText();
            prevMouseX = mx; prevMouseY = my;
            return;
        }

        // your original non-rotated text-corner code (kept)
        const dir = resizeDirectionNorm;
        const ow = activeBox._orig.width, oh = activeBox._orig.height;
        const dxAbs = mx - startMXCanvas, dyAbs = my - startMYCanvas;

        let scaleX = 1, scaleY = 1;
        switch (dir) {
            case 'tl': scaleX = (ow - dxAbs) / ow; scaleY = (oh - dyAbs) / oh; break;
            case 'tr': scaleX = (ow + dxAbs) / ow; scaleY = (oh - dyAbs) / oh; break;
            case 'bl': scaleX = (ow - dxAbs) / ow; scaleY = (oh + dyAbs) / oh; break;
            case 'br': scaleX = (ow + dxAbs) / ow; scaleY = (oh + dyAbs) / oh; break;
        }
        scaleX = Math.max(0.1, scaleX); scaleY = Math.max(0.1, scaleY);
        const sU = Math.min(scaleX, scaleY), newW = ow * sU, newH = oh * sU;

        switch (dir) {
            case 'tl': activeBox.x = activeBox._orig.x + (ow - newW); activeBox.y = activeBox._orig.y + (oh - newH); break;
            case 'tr': activeBox.x = activeBox._orig.x; activeBox.y = activeBox._orig.y + (oh - newH); break;
            case 'bl': activeBox.x = activeBox._orig.x + (ow - newW); activeBox.y = activeBox._orig.y; break;
            case 'br': activeBox.x = activeBox._orig.x; activeBox.y = activeBox._orig.y; break;
        }
        activeBox.width = newW; activeBox.height = newH;

        // CHANGED: always scale from baked baseline
        const baseHTML = activeBox._orig.textBaked || activeBox._orig.text;
        activeBox.text = scaleTextHTML(baseHTML, sU);

        drawText();
        return;
    }

    // IMAGE corner
    if (isCornerImageScale && activeBox && activeBox.type === "image" &&
        resizeDirectionNorm && CORNER_HANDLES.has(resizeDirectionNorm)) {

        // block corner-resize for line items → fallback to drag (kept)
        if (__isLineSvg(activeBox)) {
            isCornerImageScale = false; isDraggingNew = true;
            dragOffsetXNew = mx - activeBox.x;
            dragOffsetYNew = my - activeBox.y;
            prevMouseX = mx; prevMouseY = my;
            try { setGlobalCursor?.("move"); } catch { }
            return;
        }

        // ➜ rotation-aware (BASIC or normal) (ADD)
        if ((activeBox.rotation || 0) % 360 !== 0) {
            const { dxL, dyL } = __toLocalDelta(mx, my, startMXCanvas, startMYCanvas, activeBox.rotation || 0);
            if (__isBasicImage(activeBox)) {
                __applyResizeBasicAnchRot(activeBox, resizeDirectionNorm, dxL, dyL);
            } else {
                __applyResizeGenericAnchRot(activeBox, resizeDirectionNorm, dxL, dyL);
            }
            prevMouseX = mx; prevMouseY = my; drawText();
            return;
        }

        // your original non-rotated corner image scale (kept)
        const dir = resizeDirectionNorm;
        const ow = activeBox._orig.width, oh = activeBox._orig.height;
        const dxAbs = mx - startMXCanvas, dyAbs = my - startMYCanvas;

        let scaleX = 1, scaleY = 1;
        switch (dir) {
            case 'tl': scaleX = (ow - dxAbs) / ow; scaleY = (oh - dyAbs) / oh; break;
            case 'tr': scaleX = (ow + dxAbs) / ow; scaleY = (oh - dyAbs) / oh; break;
            case 'bl': scaleX = (ow - dxAbs) / ow; scaleY = (oh + dyAbs) / oh; break;
            case 'br': scaleX = (ow + dxAbs) / ow; scaleY = (oh + dyAbs) / oh; break;
        }
        scaleX = Math.max(0.1, scaleX); scaleY = Math.max(0.1, scaleY);
        const sImg = Math.min(scaleX, scaleY), newW = ow * sImg, newH = oh * sImg;

        switch (dir) {
            case 'tl': activeBox.x = activeBox._orig.x + (ow - newW); activeBox.y = activeBox._orig.y + (oh - newH); break;
            case 'tr': activeBox.x = activeBox._orig.x; activeBox.y = activeBox._orig.y + (oh - newH); break;
            case 'bl': activeBox.x = activeBox._orig.x + (ow - newW); activeBox.y = activeBox._orig.y; break;
            case 'br': activeBox.x = activeBox._orig.x; activeBox.y = activeBox._orig.y; break;
        }
        activeBox.width = newW; activeBox.height = newH;
        drawText();
        return;
    }

    // Sides (text or image)
    if (isResizingNew && activeBox && resizeDirection) {
        const side = (resizeDirectionNorm || resizeDirection).toLowerCase(); // 'l'|'r'|'t'|'b'

        if (activeBox.type === "image") {

            // --- TOP / BOTTOM handles for IMAGES ---
            if (side === 't' || side === 'b') {

                if (activeBox.isBasic === true && !__isLineSvg?.(activeBox)) {
                    const o = activeBox._orig || {
                        x: activeBox.x, y: activeBox.y,
                        width: activeBox.width, height: activeBox.height
                    };

                    // base cap radius (stable floor)
                    const baseK = Number.isFinite(activeBox.curvatureRatio)
                        ? Math.max(0, Math.min(0.5, activeBox.curvatureRatio)) : 0.5;
                    const capPx0 = Number.isFinite(activeBox._capPxBase)
                        ? activeBox._capPxBase
                        : Math.min(baseK * o.height, (o.width || 0) / 2);

                    // compute delta in LOCAL space when rotated
                    const rot = activeBox.rotation || 0;
                    let delta = (side === 't')
                        ? -(my - startMYCanvas)
                        : +(my - startMYCanvas);

                    if ((rot % 360) !== 0) {
                        const { dyL } = __toLocalDelta(mx, my, startMXCanvas, startMYCanvas, rot);
                        delta = (side === 't') ? -dyL : dyL; // use local-Y movement
                    }

                    // new height with floors
                    let newH = o.height + delta;
                    const minHHard = Math.ceil(2 * capPx0);
                    const minHUser = Number.isFinite(activeBox.minHeight) ? activeBox.minHeight : 1;
                    const minH = Math.max(1, minHUser, minHHard);
                    if (newH < minH) newH = minH;

                    // keep opposite edge anchored:
                    // shift center by half the change along local-Y, then rotate into world
                    const dH = newH - o.height;
                    const sgn = (side === 't') ? -1 : +1;              // which edge we drag
                    const sLX = 0;
                    const sLY = sgn * dH / 2;

                    const aa = __deg2rad(rot), cc = Math.cos(aa), ss = Math.sin(aa);
                    const shiftX = sLX * cc - sLY * ss;
                    const shiftY = sLX * ss + sLY * cc;

                    const cx0 = o.x + o.width / 2, cy0 = o.y + o.height / 2;
                    const cx = cx0 + shiftX, cy = cy0 + shiftY;

                    // write back (width unchanged for T/B)
                    activeBox.x = cx - o.width / 2;
                    activeBox.y = cy - newH / 2;
                    activeBox.width = o.width;
                    activeBox.height = newH;

                    // update caps
                    const kEff = Math.min(0.5, capPx0 / Math.max(1e-6, newH));
                    if (activeBox.img) activeBox.img.__curvatureRatio = kEff;
                    activeBox.__capsOrientation = (newH >= (activeBox.width || 0) + 0.5) ? 'vertical' : 'horizontal';

                    // (optional) keep inside canvas
                    const W = canvas.width, H = canvas.height;
                    if (activeBox.y < 0) activeBox.y = 0;
                    if (activeBox.y + activeBox.height > H) {
                        activeBox.y = Math.max(0, H - activeBox.height);
                    }

                    prevMouseX = mx; prevMouseY = my;
                    drawText();
                    return; // IMPORTANT: skip the generic handler below
                }
                // 🔧 ADD: rotation-aware TOP/BOTTOM for NORMAL image / normal SVG (non-BASIC, non-line)
                if (!__isBasicImage(activeBox) && !__isLineSvg?.(activeBox) && ((activeBox.rotation || 0) % 360 !== 0)) {
                    // project mouse delta into box-local Y so the opposite edge stays anchored (no walk)
                    const { dyL } = __toLocalDelta(mx, my, startMXCanvas, startMYCanvas, activeBox.rotation || 0);
                    __applyResizeGenericAnchRot(activeBox, side, 0, dyL);
                    prevMouseX = mx; prevMouseY = my;
                    drawText();
                    return;
                }

                // ── your previous paths (kept) ─────────────────────────────────
                if (activeBox.isBasic === true) {
                    if (typeof __isLineBasic === 'function' && __isLineBasic(activeBox)) {
                        const bottom = activeBox.y + activeBox.height;
                        if (side === 't') {
                            activeBox.height = 1;
                            activeBox.y = bottom - 1; // keep bottom anchored
                        } else { // 'b'
                            activeBox.height = 1;     // keep top anchored
                        }
                        prevMouseX = mx; prevMouseY = my;
                    } else {
                        scaleImageBoxWithHandle(activeBox, side, mx, my);
                        const { edgeY } = __clampBasicSideResize(activeBox, side);
                        prevMouseX = mx;
                        prevMouseY = (typeof edgeY === 'number') ? edgeY : my;
                    }
                } else {
                    // NON-BASIC images
                    scaleImageBoxWithHandle(activeBox, side, mx, my);
                    prevMouseX = mx; prevMouseY = my;
                }
                drawText();
                return;
            }

            // --- LEFT / RIGHT handles for IMAGES ---

            // LINES: rotation-aware L/R so it doesn't walk (ADD / FIX)
            if (__isLineSvg?.(activeBox) && (side === 'l' || side === 'r')) {
                const o = activeBox._orig || { x: activeBox.x, y: activeBox.y, width: activeBox.width, height: activeBox.height };
                const rot = activeBox.rotation || 0;

                if ((rot % 360) !== 0) {
                    const { dxL } = __toLocalDelta(mx, my, startMXCanvas, startMYCanvas, rot);
                    const sgn = (side === 'l') ? -1 : +1;

                    let newW = Math.max(1, o.width + sgn * dxL);

                    // anchor opposite side in local-X
                    const dW = newW - o.width;
                    const sLX = sgn * dW / 2;

                    const aa = __deg2rad(rot), cc = Math.cos(aa), ss = Math.sin(aa);
                    const shiftX = sLX * cc;  // sLY=0
                    const shiftY = sLX * ss;

                    const cx0 = o.x + o.width / 2, cy0 = o.y + o.height / 2;
                    const cx = cx0 + shiftX, cy = cy0 + shiftY;

                    activeBox.x = cx - newW / 2;
                    activeBox.y = cy - o.height / 2;
                    activeBox.width = newW;
                    activeBox.height = o.height;

                    prevMouseX = mx; prevMouseY = my; drawText();
                    return;
                }

                // your original non-rotated line path (kept)
                const dxAbs = mx - startMXCanvas;
                let newW = (side === 'l') ? (o.width - dxAbs) : (o.width + dxAbs);
                newW = Math.max(1, newW);
                if (side === 'l') {
                    activeBox.x = o.x + (o.width - newW); // anchor right
                } else {
                    activeBox.x = o.x;                    // anchor left
                }
                activeBox.width = newW;

                prevMouseX = mx; prevMouseY = my;
                drawText();
                return;
            }

            // rotation-aware BASIC L/R with floors (ADD)
            if ((side === 'l' || side === 'r') && __isBasicImage(activeBox) && ((activeBox.rotation || 0) % 360 !== 0)) {
                const { dxL } = __toLocalDelta(mx, my, startMXCanvas, startMYCanvas, activeBox.rotation || 0);
                __applyResizeBasicAnchRot(activeBox, side, dxL, 0);
                prevMouseX = mx; prevMouseY = my; drawText();
                return;
            }

            // rotation-aware NORMAL L/R (ADD)
            if ((side === 'l' || side === 'r') && !__isBasicImage(activeBox) && ((activeBox.rotation || 0) % 360 !== 0)) {
                const { dxL } = __toLocalDelta(mx, my, startMXCanvas, startMYCanvas, activeBox.rotation || 0);
                __applyResizeGenericAnchRot(activeBox, side, dxL, 0);
                prevMouseX = mx; prevMouseY = my; drawText();
                return;
            }

            // fallback: your generic side-resize path (kept)
            scaleImageBoxWithHandle(activeBox, side, mx, my);

            // BASIC post-fix (kept)
            if (activeBox.isBasic === true && !__isLineSvg?.(activeBox) && (side === 'l' || side === 'r')) {
                if (!Number.isFinite(activeBox._baseCurvRatio)) {
                    const k0 = Number.isFinite(activeBox.curvatureRatio) ? activeBox.curvatureRatio : 0.5;
                    activeBox._baseCurvRatio = Math.max(0, Math.min(0.5, k0));
                }
                activeBox.__capsOrientation = 'horizontal';
                activeBox.preserveCaps = true;
                if (activeBox.img) activeBox.img.__curvatureRatio = activeBox._baseCurvRatio; // restore
            }

            //let snappedX = null;
            //if (side === 'l' || side === 'r') {
            //    const { edgeX } = __clampBasicSideResize(activeBox, side);
            //    if (typeof edgeX === 'number') snappedX = edgeX;
            //}
            let snappedX = null;
            if (side === 'l' || side === 'r') {
                if (activeBox.isBasic === true && !__isLineSvg?.(activeBox)) {
                    const o = activeBox._orig || { x: activeBox.x, y: activeBox.y, width: activeBox.width, height: activeBox.height };

                    const baseK = Number.isFinite(activeBox.curvatureRatio)
                        ? Math.max(0, Math.min(0.5, activeBox.curvatureRatio)) : 0.5;
                    const capPx0 = Number.isFinite(activeBox._capPxBase)
                        ? activeBox._capPxBase
                        : Math.min(baseK * o.height, (o.width || 0) / 2);
                    const minWHard = Math.ceil(2 * capPx0);
                    const minWUser = Number.isFinite(activeBox.minWidth) ? activeBox.minWidth : 1;
                    const minW = Math.max(1, minWUser, minWHard);

                    const rot = activeBox.rotation || 0;

                    if ((rot % 360) !== 0) {
                        // rotation-aware horizontal resize (no “walk”, can squish back)
                        const { dxL } = __toLocalDelta(mx, my, startMXCanvas, startMYCanvas, rot);
                        __applyResizeBasicAnchRot(activeBox, side, dxL, 0);
                        prevMouseX = mx; prevMouseY = my; drawText(); return;
                    } else {
                        // your original non-rotated BASIC path (unchanged)
                        const dxAbs = mx - startMXCanvas;
                        let newW = (side === 'l') ? (o.width - dxAbs) : (o.width + dxAbs);
                        if (newW < minW) newW = minW;

                        if (side === 'l') {
                            activeBox.x = o.x + (o.width - newW); // anchor right
                        } else {
                            activeBox.x = o.x;                    // anchor left
                        }
                        activeBox.width = newW;

                        if (activeBox.img) {
                            const kEff = Math.min(0.5, capPx0 / Math.max(1e-6, activeBox.height));
                            activeBox.img.__curvatureRatio = kEff;
                        }
                        activeBox.preserveCaps = true;
                        activeBox.__capsOrientation = 'horizontal';

                        snappedX = (side === 'l') ? activeBox.x : (activeBox.x + activeBox.width);
                    }
                }
                else if (!__isBasicImage(activeBox) && ((activeBox.rotation || 0) % 360) !== 0) {
                    // 🔧 ADD: rotation-aware LEFT/RIGHT for NORMAL image / normal SVG (non-BASIC, non-line)
                    const { dxL } = __toLocalDelta(mx, my, startMXCanvas, startMYCanvas, activeBox.rotation || 0);
                    __applyResizeGenericAnchRot(activeBox, side, dxL, 0);
                    prevMouseX = mx; prevMouseY = my;
                    drawText();
                    return; // important: skip the generic fallback to avoid walk
                }
                else {
                    // non-BASIC (or lines) → your existing clamp
                    const { edgeX } = __clampBasicSideResize(activeBox, side);
                    if (typeof edgeX === 'number') snappedX = edgeX;
                }
            }

            prevMouseX = (snappedX !== null ? snappedX : mx);
            prevMouseY = my;
            drawText();
            return;

        } else {
            // TEXT (kept)
            // NEW: bake once so side-resize + later corner-resize share the same baseline
            __ensureBakedOrigText(activeBox);

            scaleTextBoxWithHandle(activeBox, (resizeDirectionRaw || resizeDirection), mx, my);
            prevMouseX = mx; prevMouseY = my;
            drawText();
            return;
        }
    }

    // ──────────────────────────────────────────────────────────
    // HOVER CURSOR FIX FOR LINES (no active drag/resize) (kept)
    if (!isResizingNew && !isDraggingNew && !isCornerImageScale && !isCornerFontScale) {
        const hHover = (typeof findHandleAt === 'function') ? findHandleAt(mx, my) : null;
        if (hHover && hHover.box && __isLineSvg(hHover.box)) {
            const norm = String(hHover.handle || '').toLowerCase();
            const raw = String(hHover.raw || '').toLowerCase();
            const isLR = (norm === 'l' || norm === 'r' || raw === 'ml' || raw === 'mr');
            try { setGlobalCursor?.(isLR ? 'ew-resize' : 'move'); } catch { }
            return; // prevent other code from flipping the cursor back
        }

        const hit = (typeof getTopHitAt === 'function') ? getTopHitAt(mx, my) : null;
        if (hit && __isLineSvg(hit)) {
            try { setGlobalCursor?.('move'); } catch { }
            return;
        }
        // otherwise let normal hover logic run (if any)
    }
});







//canvas.addEventListener("mousemove", e => {
//    const { x: mx, y: my } = getCanvasMousePosition(e);
//    const dx = mx - prevMouseX;
//    const dy = my - prevMouseY;

//    // ──────────────────────────────────────────────────────────
//    // BASIC-shape helpers (local to this handler)
//    function __isBasicImage(box) {
//        return !!(box && box.type === 'image' && (
//            box.isBasic === true ||
//            (typeof __isBasicShapeSvg === 'function' && __isBasicShapeSvg(box))
//        ));
//    }
//    // Curvature you render with. Default = pill ends (0.5 of height).
//    function __curvRatio(box) {
//        let k = (typeof box?.curvatureRatio === 'number') ? box.curvatureRatio : 0.5;
//        if (!isFinite(k)) k = 0.5;
//        return Math.max(0, Math.min(0.5, k));
//    }
//    // Min feasible width for BASIC shape (keep ends round): minW = 2 * k * height
//    function __minWidthForBasic(box) {
//        return Math.max(8, 2 * __curvRatio(box) * (box.height || 0));
//    }
//    // Min feasible height for BASIC shape (symmetric rule, if you ever need top/bottom)
//    function __minHeightForBasic(box) {
//        return Math.max(8, 2 * __curvRatio(box) * (box.width || 0));
//    }
//    /**
//     * Clamp BASIC image during side resize; keep opposite edge anchored.
//     * Returns {clamped:boolean, edgeX:number|undefined, edgeY:number|undefined}
//     */
//    function __clampBasicSideResize(box, side /* 'l'|'r'|'t'|'b' */) {
//        if (!__isBasicImage(box)) return { clamped: false };
//        if (side === 'l' || side === 'r') {
//            const minW = __minWidthForBasic(box);
//            if ((box.width || 0) < minW) {
//                const right = box.x + box.width;
//                if (side === 'l') box.x = right - minW; // anchor right
//                box.width = minW;
//                return { clamped: true, edgeX: (side === 'l') ? box.x : (box.x + box.width) };
//            }
//        }
//        else if (side === 't' || side === 'b') {
//            const minH = __minHeightForBasic(box);
//            if ((box.height || 0) < minH) {
//                const bottom = box.y + box.height;
//                if (side === 't') box.y = bottom - minH; // anchor bottom
//                box.height = minH;
//                return { clamped: true, edgeY: (side === 't') ? box.y : (box.y + box.height) };
//            }
//        }
//        return { clamped: false };
//    }
//    // ──────────────────────────────────────────────────────────

//    // ✅ TEXT left/right side-resize in rotated space
//    if (isResizingNew && activeBox && activeBox.type !== 'image' &&
//        (resizeDirection === 'l' || resizeDirection === 'r')) {
//        resizeTextSideToMouse(activeBox, resizeDirection, mx, my);
//        // ADD: clamp to minimum width so you can't go narrower than the longest word
//        const minW = Math.max(1, Math.ceil(activeBox._minTextOuterWidth || computeMinTextOuterWidthPx(activeBox)));
//        if (activeBox.width < minW) {
//            if (resizeDirection === 'l') {
//                // Anchor right edge when shrinking from the left
//                const right = activeBox.x + activeBox.width;
//                activeBox.width = minW;
//                activeBox.x = right - minW;
//            } else {
//                // From right: just set width
//                activeBox.width = minW;
//            }
//        }
//        drawText();
//        return;
//    }

//    // 🔁 FIX: run multi-drag only when active; don't early-return otherwise
//    if (isDraggingMulti) {
//        updateMultiDrag(mx, my);
//        // (optional) keep these in sync if other code relies on them
//        prevMouseX = mx;
//        prevMouseY = my;
//        return;
//    }

//    // cursor logic unchanged (optional to extend for images)

//    if (isDraggingNew && activeBox) {
//        activeBox.x = mx - dragOffsetXNew;
//        activeBox.y = my - dragOffsetYNew;
//        prevMouseX = mx; prevMouseY = my;
//        drawText();
//        return;
//    }
//    // --- at top of the TEXT corner-scale block ---
//    if (activeBox && activeBox._orig && typeof activeBox._orig.text === 'string') {
//        // If original text has no inline font-size, bake in computed editor font once
//        if (!/font-size\s*:/i.test(activeBox._orig.text)) {
//            activeBox._orig.text = bakeInlineFontOnLinesHTML(activeBox._orig.text, textEditorNew);
//        }
//    }

//    if (isCornerFontScale && activeBox && resizeDirectionNorm && CORNER_HANDLES.has(resizeDirectionNorm)) {
//        const dir = resizeDirectionNorm;          // ← normalized "tl/tr/bl/br"
//        const ow = activeBox._orig.width, oh = activeBox._orig.height;
//        const dxAbs = mx - startMXCanvas, dyAbs = my - startMYCanvas;

//        let scaleX = 1, scaleY = 1;
//        switch (dir) {
//            case 'tl': scaleX = (ow - dxAbs) / ow; scaleY = (oh - dyAbs) / oh; break;
//            case 'tr': scaleX = (ow + dxAbs) / ow; scaleY = (oh - dyAbs) / oh; break;
//            case 'bl': scaleX = (ow - dxAbs) / ow; scaleY = (oh + dyAbs) / oh; break;
//            case 'br': scaleX = (ow + dxAbs) / ow; scaleY = (oh + dyAbs) / oh; break;
//        }
//        scaleX = Math.max(0.1, scaleX); scaleY = Math.max(0.1, scaleY);
//        const s = Math.min(scaleX, scaleY), newW = ow * s, newH = oh * s;

//        switch (dir) {
//            case 'tl': activeBox.x = activeBox._orig.x + (ow - newW); activeBox.y = activeBox._orig.y + (oh - newH); break;
//            case 'tr': activeBox.x = activeBox._orig.x; activeBox.y = activeBox._orig.y + (oh - newH); break;
//            case 'bl': activeBox.x = activeBox._orig.x + (ow - newW); activeBox.y = activeBox._orig.y; break;
//            case 'br': activeBox.x = activeBox._orig.x; activeBox.y = activeBox._orig.y; break;
//        }
//        activeBox.width = newW; activeBox.height = newH;
//        activeBox.text = scaleTextHTML(activeBox._orig.text, s);
//        drawText();
//        return;
//    }

//    // IMAGE corner
//    if (isCornerImageScale && activeBox && activeBox.type === "image" &&
//        resizeDirectionNorm && CORNER_HANDLES.has(resizeDirectionNorm)) {
//        const dir = resizeDirectionNorm;
//        const ow = activeBox._orig.width, oh = activeBox._orig.height;
//        const dxAbs = mx - startMXCanvas, dyAbs = my - startMYCanvas;

//        let scaleX = 1, scaleY = 1;
//        switch (dir) {
//            case 'tl': scaleX = (ow - dxAbs) / ow; scaleY = (oh - dyAbs) / oh; break;
//            case 'tr': scaleX = (ow + dxAbs) / ow; scaleY = (oh - dyAbs) / oh; break;
//            case 'bl': scaleX = (ow - dxAbs) / ow; scaleY = (oh + dyAbs) / oh; break;
//            case 'br': scaleX = (ow + dxAbs) / ow; scaleY = (oh + dyAbs) / oh; break;
//        }
//        scaleX = Math.max(0.1, scaleX); scaleY = Math.max(0.1, scaleY);
//        const s = Math.min(scaleX, scaleY), newW = ow * s, newH = oh * s;

//        switch (dir) {
//            case 'tl': activeBox.x = activeBox._orig.x + (ow - newW); activeBox.y = activeBox._orig.y + (oh - newH); break;
//            case 'tr': activeBox.x = activeBox._orig.x; activeBox.y = activeBox._orig.y + (oh - newH); break;
//            case 'bl': activeBox.x = activeBox._orig.x + (ow - newW); activeBox.y = activeBox._orig.y; break;
//            case 'br': activeBox.x = activeBox._orig.x; activeBox.y = activeBox._orig.y; break;
//        }
//        activeBox.width = newW; activeBox.height = newH;
//        drawText();
//        return;
//    }

//    // Sides (text or image)
//    ////if (isResizingNew && activeBox && resizeDirection) {
//    ////    const side = (resizeDirectionNorm || resizeDirection); // 'l'|'r'|'t'|'b'

//    ////    if (activeBox.type === "image") {
//    ////        // IMAGES: normalized ("l","r","t","b")
//    ////        scaleImageBoxWithHandle(activeBox, side, mx, my);

//    ////        // NEW: Stop BASIC shapes at curvature limit ONLY for left/right; keep top/bottom unchanged
//    ////        let snappedX = null; // preserve snap so we don't overwrite later
//    ////        if (side === 'l' || side === 'r') {
//    ////            const { clamped, edgeX } = __clampBasicSideResize(activeBox, side);
//    ////            if (clamped && typeof edgeX === 'number') snappedX = edgeX;
//    ////        }

//    ////        // update prevs without losing snap
//    ////        prevMouseX = (snappedX !== null ? snappedX : mx);
//    ////        prevMouseY = my;

//    ////    } else {
//    ////        // TEXT: raw ("mr","ml","mt","mb" or already-short)
//    ////        scaleTextBoxWithHandle(activeBox, resizeDirectionRaw || resizeDirection, mx, my);
//    ////        prevMouseX = mx;
//    ////        prevMouseY = my;
//    ////    }

//    ////    drawText();
//    ////    return;
//    ////}
//    // Sides (text or image)  ⟵ REPLACE your current block with this one
//    if (isResizingNew && activeBox && resizeDirection) {
//        const side = (resizeDirectionNorm || resizeDirection); // 'l'|'r'|'t'|'b'

//        if (activeBox.type === "image") {

//            // --- TOP / BOTTOM handles for IMAGES ---
//            if (side === 't' || side === 'b') {

//                if (__isBasicImage(activeBox)) {
//                    // ✅ BASIC shapes
//                    if (__isLineBasic(activeBox)) {
//                        // Lock line height to 1px; anchor the opposite edge
//                        const bottom = activeBox.y + activeBox.height;
//                        if (side === 't') {
//                            activeBox.height = 1;
//                            activeBox.y = bottom - 1; // keep bottom anchored
//                        } else { // 'b'
//                            activeBox.height = 1;     // keep top anchored (y unchanged)
//                        }
//                        prevMouseX = mx; prevMouseY = my;
//                    } else {
//                        // For other BASIC shapes: allow T/B resize but clamp to min height
//                        // so curvature constraints are respected.
//                        scaleImageBoxWithHandle(activeBox, side, mx, my);
//                        const { clamped, edgeY } = __clampBasicSideResize(activeBox, side);
//                        prevMouseX = mx;
//                        prevMouseY = (typeof edgeY === 'number') ? edgeY : my;
//                    }

//                } else {
//                    // ✅ NON-BASIC images → your current behavior
//                    scaleImageBoxWithHandle(activeBox, side, mx, my);
//                    prevMouseX = mx; prevMouseY = my;
//                }

//                drawText();
//                return;
//            }

//            // --- LEFT / RIGHT handles for IMAGES (unchanged, with BASIC clamp on width) ---
//            scaleImageBoxWithHandle(activeBox, side, mx, my);

//            let snappedX = null; // preserve snap so we don't overwrite later
//            if (side === 'l' || side === 'r') {
//                const { clamped, edgeX } = __clampBasicSideResize(activeBox, side);
//                if (clamped && typeof edgeX === 'number') snappedX = edgeX;
//            }

//            prevMouseX = (snappedX !== null ? snappedX : mx);
//            prevMouseY = my;
//            drawText();
//            return;
//        } else {
//            // TEXT: raw ("mr","ml","mt","mb" or already-short)
//            scaleTextBoxWithHandle(activeBox, (resizeDirectionRaw || resizeDirection), mx, my);
//            prevMouseX = mx; prevMouseY = my;
//            drawText();
//            return;
//        }
//    }
//});



// ensure this exists once globally
// let skipNextClick = false;

window.addEventListener("mouseup", (e) => {
    // ⬅ ADD: if any direct action finished, reset the per-action flag AND disarm marquee
    if (isDraggingNew || isResizingNew || isCornerFontScale || isCornerImageScale ||
        isDraggingMulti || isResizingMulti) {
        isClickSingle = false;   // done with item/handle action
        isMarquee = false;       // ⬅ ADD: ensure band mode is not left on after a drag/resize
    }
    // 1) Commit marquee selection on window mouseup
    if (isMarquee) {
        const { x: mx, y: my } = getCanvasMousePosition(e);
        marqueeNow.x = mx; marqueeNow.y = my;

        const dragDist = Math.hypot(marqueeNow.x - marqueeStart.x, marqueeNow.y - marqueeStart.y);
        const additive = e.shiftKey;
        const toggle = e.ctrlKey || e.metaKey;

        const imgs = Array.isArray(images) ? images : [];
        const txts = Array.isArray(textObjects) ? textObjects : [];
        const all = imgs.concat(txts);

        const newSel = new Set(all.filter(it => it.selected));

        function topHit(mx, my) {
            if (typeof getTopHitAt === 'function') return getTopHitAt(mx, my);
            const sorted = [...all].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
            for (let i = sorted.length - 1; i >= 0; i--) {
                const a = getItemAABB(sorted[i]);
                if (mx >= a.x && mx <= a.x + a.w && my >= a.y && my <= a.y + a.h) return sorted[i];
            }
            return null;
        }

        if (dragDist < (typeof MARQUEE_MIN_DRAG === 'number' ? MARQUEE_MIN_DRAG : 4)) {
            const hit = topHit(mx, my);
            if (!additive && !toggle) newSel.clear();
            if (hit) {
                if (toggle && newSel.has(hit)) newSel.delete(hit); else newSel.add(hit);
                activeBox = hit;
            } else if (!additive && !toggle) {
                newSel.clear();
                activeBox = null;
            }
        } else {
            const box = rectFromPoints(marqueeStart, marqueeNow);
            if (!additive && !toggle) newSel.clear();
            for (const it of all) {
                if (rectsIntersect(box, getItemAABB(it))) {
                    if (toggle && newSel.has(it)) newSel.delete(it); else newSel.add(it);
                }
            }
            const hoverHit = topHit(mx, my);
            if (hoverHit && newSel.has(hoverHit)) {
                activeBox = hoverHit;
            } else if (newSel.size) {
                let top = null, topZ = -Infinity;
                for (const it of newSel) {
                    const z = it.zIndex || 0;
                    if (z >= topZ) { topZ = z; top = it; }
                }
                activeBox = top;
            } else {
                activeBox = null;
            }
        }

        // write flags your renderer reads
        for (const it of all) it.selected = false;
        for (const it of newSel) it.selected = true;

        if (activeBox) {
            if (activeBox.type === 'image') { activeImage = activeBox; activeText = null; }
            else { activeText = activeBox; activeImage = null; }
        } else {
            activeText = null; activeImage = null;
        }

        // optional legacy mirrors
        globalThis.ItemsSelected = all.filter(it => it.selected);
        globalThis.selectedItems = globalThis.ItemsSelected;

        isMarquee = false;

        // ✨ swallow the next canvas click so it doesn't clear selection on empty release
        skipNextClick = true;

        try { setGlobalCursor?.("default"); } catch { }
        drawText();
    }

    // 2) your original resets
    isDraggingNew = false;
    isResizingNew = false;
    isCornerFontScale = false;
    isCornerImageScale = false;
    resizeDirection = null;
    setGlobalCursor("default");

    if (isDraggingMulti) endMultiDrag(true);
    if (isDraggingMulti || isResizingMulti) finishGroupTransform();
    isGroupAction = false;
    skipNextClick = true;                      // swallow the very next click
    window.__marqueeCommittedAt = performance.now();
});





function scaleImageBoxWithHandle(box, handle, mx, my) {
    handle = normalizeHandle(handle); // ensure canonical for images
    const minW = 10, minH = 10;
    const o = box._orig || { x: box.x, y: box.y, width: box.width, height: box.height };
    const dx = mx - startMXCanvas, dy = my - startMYCanvas;

    let x = o.x, y = o.y, w = o.width, h = o.height;
    if (handle === 'r') { w = Math.max(minW, o.width + dx); }
    if (handle === 'l') { w = Math.max(minW, o.width - dx); x = o.x + (o.width - w); }
    if (handle === 'b') { h = Math.max(minH, o.height + dy); }
    if (handle === 't') { h = Math.max(minH, o.height - dy); y = o.y + (o.height - h); }

    box.x = x; box.y = y; box.width = w; box.height = h;
}



// Draw image with horizontal 3-slice so caps don't distort when width changes.
// Assumes a "pill/rounded-rect" style where the cap radius ≈ height/2.
function drawImageThreeSliceX(ctx, o) {
    const img = o.img;
    if (!img) return;

    const sw = img.naturalWidth || img.width || 1;
    const sh = img.naturalHeight || img.height || 1;

    const dw = o.width, dh = o.height;

    // source cap width ~ half the source height (good for pill/rounded-rect SVGs)
    const capSrc = Math.max(1, Math.round(sh / 2));

    // destination cap width mirrors radius; also cannot exceed half of dest width
    const capDst = Math.min(Math.round(dh / 2), Math.round(dw / 2));

    const midSrc = Math.max(1, sw - capSrc * 2);
    const midDst = Math.max(0, dw - capDst * 2);

    ctx.save();

    // respect rotation if you have it
    if (o.rotation) {
        const cx = o.x + dw / 2, cy = o.y + dh / 2;
        ctx.translate(cx, cy);
        ctx.rotate((o.rotation * Math.PI) / 180);
        ctx.translate(-cx, -cy);
    }

    // Left cap
    ctx.drawImage(img,
        0, 0, capSrc, sh,
        o.x, o.y, capDst, dh
    );

    // Middle stretch (only this part scales horizontally)
    if (midDst > 0) {
        ctx.drawImage(img,
            capSrc, 0, midSrc, sh,
            o.x + capDst, o.y, midDst, dh
        );
    }

    // Right cap
    ctx.drawImage(img,
        capSrc + midSrc, 0, capSrc, sh,
        o.x + capDst + midDst, o.y, capDst, dh
    );

    ctx.restore();
}


// ADD: helper to normalize handle ids
function _normHandleId(h) {
    const id = (typeof h === 'string') ? h : (h && (h.handle || h.raw)) || '';
    // ml/mr/mt/mb → l/r/t/b
    return ({ ml: 'l', mr: 'r', mt: 't', mb: 'b' }[id] || id);
}

const MIN_W = 10, MIN_H = 10;

// NEW: tiny global to remember we're over an image side handle
let _imgSideAsCornerHover = null;

canvas.addEventListener('mousemove', (e) => {
    const { x: mx, y: my } = getCanvasMousePosition(e);

    // if dragging/resizing we keep the cursor set elsewhere
    if (isDragging || isResizing) return;

    let cur = 'default';
    const all = [...images, ...textObjects].sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));

    // 1) handles first (topmost first)
    for (const o of all) {
        const h = whichHandle(o, mx, my);
        if (h) {
            // ADD: normalize and override for side handles
            const id = _normHandleId(h);          // 'l','r','t','b','tl','tr','bl','br'
            if (id === 'l' || id === 'r') {
                cur = 'ew-resize';                // ← horizontal arrows for left/right
            } else if (id === 't' || id === 'b') {
                cur = 'ns-resize';                // vertical arrows for top/bottom
            } else {
                cur = cursorForHandle(h);         // corners (tl/tr/bl/br) use your existing logic
            }
            break;
        }
        if (pointInBox(o, mx, my)) { cur = 'move'; break; }
    }
    canvas.style.cursor = cur;
});


canvas.addEventListener("mouseup", (e) => {
    if (!isMarquee) return;

    const { x: mx, y: my } = getCanvasMousePosition(e);
    marqueeNow.x = mx; marqueeNow.y = my;

    const dragDist = Math.hypot(marqueeNow.x - marqueeStart.x, marqueeNow.y - marqueeStart.y);
    const additive = e.shiftKey;
    const toggle = e.ctrlKey || e.metaKey;

    const all = __drawables(); // images + textObjects
    const newSel = new Set(all.filter(it => it.selected)); // ← start from current flags

    if (dragDist < (typeof MARQUEE_MIN_DRAG === 'number' ? MARQUEE_MIN_DRAG : 4)) {
        // CLICK path
        const hit = (typeof getTopHitAt === 'function') ? getTopHitAt(mx, my) : __hitTopDrawable(mx, my);

        if (!additive && !toggle) newSel.clear();

        if (hit) {
            if (toggle && newSel.has(hit)) newSel.delete(hit);
            else newSel.add(hit);
            activeBox = hit; // make it active
        } else if (!additive && !toggle) {
            newSel.clear();
            activeBox = null;
        }
    } else {
        // MARQUEE path
        const box = rectFromPoints(marqueeStart, marqueeNow);
        if (!additive && !toggle) newSel.clear();

        for (const it of all) {
            if (rectsIntersect(box, getItemAABB(it))) {
                if (toggle && newSel.has(it)) newSel.delete(it);
                else newSel.add(it);
            }
        }

        // Prefer item under mouse if it’s selected; else topmost selected
        const hoverHit = (typeof getTopHitAt === 'function') ? getTopHitAt(mx, my) : __hitTopDrawable(mx, my);
        if (hoverHit && newSel.has(hoverHit)) {
            activeBox = hoverHit;
        } else if (newSel.size) {
            let top = null, topZ = -Infinity;
            for (const it of newSel) {
                const z = it.zIndex || 0;
                if (z >= topZ) { topZ = z; top = it; }
            }
            activeBox = top;
        } else {
            activeBox = null;
        }
    }

    // ── Write back to the exact flags your renderer reads ──
    for (const it of all) it.selected = false;   // clear old
    for (const it of newSel) it.selected = true; // set new

    // Keep your active* globals in sync with click-logic
    if (activeBox) {
        if (activeBox.type === 'image') { activeImage = activeBox; activeText = null; }
        else { activeText = activeBox; activeImage = null; }
    } else {
        activeText = null; activeImage = null;
    }

    // Optional: keep arrays for any legacy paths
    globalThis.ItemsSelected = all.filter(it => it.selected);
    globalThis.selectedItems = globalThis.ItemsSelected; // compat alias

    isMarquee = false;
    try { setGlobalCursor?.("default"); } catch { }
    drawText(); // redraw without marquee overlay
    skipNextClick = true;                      // swallow the very next click
    window.__marqueeCommittedAt = performance.now();
});



function drawMarqueeOverlay(ctxIn) {
    if (!isMarquee) return;

    // use provided ctx or fall back to your global ctx
    const c = ctxIn || (typeof ctx !== "undefined" ? ctx : null);
    if (!c) return; // nothing to draw on

    const r = rectFromPoints(marqueeStart, marqueeNow);

    c.save();
    c.setLineDash([6, 4]);
    c.lineWidth = 1;
    c.strokeStyle = 'rgba(0,0,0,0.7)';
    c.strokeRect(r.x, r.y, r.w, r.h);

    c.fillStyle = 'rgba(0,0,0,0.07)';
    c.fillRect(r.x, r.y, r.w, r.h);
    c.restore();
}



//canvas.addEventListener("mouseup", () => {
//    isDraggingNew = false;
//    isResizingNew = false;
//    resizeDirection = null;
//    if (activeBox) delete activeBox._orig;
//});

// ADD: helper to ensure Roboto (or any webfont) is ready before measuring

async function __fontsReadyForEditor(editorEl) {
    if (document.fonts && document.fonts.ready) {
        try { await document.fonts.ready; } catch { }
    }
    // Preload common Roboto faces/sizes you use so metrics are stable on macOS
    try {
        await Promise.all([
            document.fonts.load('400 14px "Roboto"'),
            document.fonts.load('400 16px "Roboto"'),
            document.fonts.load('400 24px "Roboto"'),
            document.fonts.load('700 16px "Roboto"'),
            document.fonts.load('700 24px "Roboto"')
        ]);
    } catch { }
}


function __resizeEditorToContentNow() {
    if (!window.textEditorNew || !window.activeBox) return;

    // lock the width we already have (we won't change width here)
    const cs = getComputedStyle(textEditorNew);
    const wCss = cs.width;                    // e.g., "200px"
    textEditorNew.style.width = wCss;
    textEditorNew.style.minWidth = wCss;
    textEditorNew.style.boxSizing = 'border-box';

    // measure height from content
    const prevH = textEditorNew.style.height;
    textEditorNew.style.height = 'auto';
    const newHcss = Math.ceil(textEditorNew.scrollHeight);  // includes first \n case
    textEditorNew.style.height = prevH;

    // respect any min-height you already set
    const minHcss = parseFloat(textEditorNew.style.minHeight) || 0;
    const finalHcss = Math.max(newHcss, minHcss, 30);

    // apply to editor (CSS px)
    textEditorNew.style.height = finalHcss + 'px';

    // and to canvas box (canvas px)
    const canvasRect = canvas.getBoundingClientRect();
    const scaleY = canvas.height / canvasRect.height;
    activeBox.height = finalHcss * scaleY;

    drawText();
}


// made async (ADD: async)
canvas.addEventListener("dblclick", async e => {
    const { x: mx, y: my } = getCanvasMousePosition(e);
    const box = textObjects.find(b =>
        mx >= b.x && mx <= b.x + b.width &&
        my >= b.y && my <= b.y + b.height
    );
    if (!box) return;

    // If we were editing a different box, save it first
    if (isEditing && activeBox !== box) {
        cleanEditorHTMLPreserveCaret();
        activeBox.text = textEditorNew.innerHTML;
    }

    activeBox = box;

    // CHANGED: await fonts before positioning/sizing
    await showEditorAtBox(box);

    // And save the caret/selection if you need it:
    saveSelection();
});






// ✅ Apply any text style and reflect in canvas
function applyStyleToSelectionOLD(styleProp, value) {
    textEditorNew.focus();
    document.execCommand("styleWithCSS", false, true);

    if (styleProp === "color") {
        document.execCommand("foreColor", false, value);
    } else if (styleProp === "bold") {
        document.execCommand("bold");
    } else if (styleProp === "italic") {
        document.execCommand("italic");
    } else if (styleProp === "fontFamily") {
        document.execCommand("fontName", false, value);
    }
    else if (styleProp === "fontSize") {
        restoreSelection(); // 👈 Restore first!

        const sel = window.getSelection();
        if (sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            const span = document.createElement("span");
            span.style.fontSize = value;
            span.appendChild(range.extractContents());
            range.insertNode(span);

            // Move cursor after the inserted span
            sel.removeAllRanges();
            const newRange = document.createRange();
            newRange.setStartAfter(span);
            newRange.collapse(true);
            sel.addRange(newRange);
        }
    }


    // After styling, sync editor content into canvas
    if (activeBox) {
        activeBox.text = textEditorNew.innerHTML;
        drawText();
    }
}

// Helper to insert custom HTML at current caret position
function insertHTML(html) {
    const sel = window.getSelection();
    if (!sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    range.deleteContents();

    const el = document.createElement("div");
    el.innerHTML = html;
    const frag = document.createDocumentFragment();
    let node;
    while ((node = el.firstChild)) frag.appendChild(node);
    range.insertNode(frag);
    sel.collapseToEnd();
}

function getSelectionText() {
    const sel = window.getSelection();
    return sel.rangeCount ? sel.toString() : "";
}
function getSelectionItem() {
    return getAllItems().filter(o => o.selected);
}
// ——————— Text Editor Helpers (unchanged) ———————
function execCommandSafely(cmd, val) { textEditorNew.focus(); document.execCommand(cmd, false, val); }

function saveSelection() {
    const sel = window.getSelection();
    if (sel.rangeCount > 0) {
        savedRange = sel.getRangeAt(0);
    }
}

function restoreSelection() {
    const sel = window.getSelection();
    if (savedRange) {
        sel.removeAllRanges();
        sel.addRange(savedRange);
    }
}
// … include your cleanEditorHTMLPreserveCaret, applyStyleToSelection, etc …

// ——————— Box Creation & JSON ———————
// Ensure default text is drawn once at start
//function addNewBox() {
//    boxes.push({
//        x: 120,
//        y: 200,
//        width: 200,
//        height: 38,
//        align: "left",
//        text: "<span style='color:black;font-size:30px;'>Default Text</span>"
//    });
//    activeBox = boxes[boxes.length - 1];
//    drawText();
//}
function addDefaultText(opts = {}) {
    // --- defaults (kept from your working function + addDefaultText) ---
    const fs = opts.fontSize ?? 13;
    const text = opts.text ?? "Default Text";
    const factor = opts.lineSpacing ?? 1.2;           // multiplier
    const fontFam = opts.fontFamily ?? "Roboto";
    const color = opts.textColor ?? "#000000";
    const align = opts.align ?? "left";
    const x0 = opts.x ?? 120;
    const y0 = opts.y ?? 200;
    const minW = opts.width ?? 200;
    const minH = opts.height ?? 38;

    // --- build the box content (inline styles preserved) ---
    const html = `<span style="color:${color};font-size:${fs}px;font-family:${fontFam};">${text}</span>`;

    // --- create the box as you already do ---
    const newBox = {
        x: x0,
        y: y0,
        width: minW,
        height: minH,
        align: align,
        text: html,
        lineSpacing: factor,
        fontScale: 1,
        type: 'text',
        zIndex: (typeof getNextZIndex === 'function')
            ? getNextZIndex()
            : (Math.max(0, ...(boxes.map(b => b.zIndex || 0))) + 1)
    };

    // --- measure to give a better starting size (respects your minW/minH) ---
    const padX = 20, padY = 25;
    ctx.font = `${fs}px ${fontFam}`;
    const m = ctx.measureText(text);
    const ascent = m.actualBoundingBoxAscent || fs * 0.8;
    const descent = m.actualBoundingBoxDescent || fs * 0.2;
    const textW = m.width;
    const textH = ascent + descent;

    newBox.width = Math.max(minW, Math.ceil(textW + padX));
    newBox.height = Math.max(minH, Math.ceil(textH + padY));

    // --- push to boxes and set active ---
    if (Array.isArray(boxes)) boxes.push(newBox);
    activeBox = newBox;
    // --- bring the new box to the very top (uses your existing function) ---
    if (typeof bringToFront === 'function') {
        bringToFront(newBox);
    } else {
        // fallback: bump zIndex
        const maxZ = Math.max(0, ...(boxes.map(b => b.zIndex || 0)));
        newBox.zIndex = maxZ + 1;
    }

    // --- mirror into textObjects with your exact selection flow ---
    if (Array.isArray(textObjects)) {
        textObjects.forEach(o => o.selected = false);
        const newObj = {
            text: html,
            x: newBox.x,
            y: newBox.y,
            selected: true,
            editing: false,
            fontFamily: fontFam,
            textColor: color,
            textAlign: align,
            fontSize: fs,
            lineSpacing: factor,
            boundingWidth: newBox.width,
            boundingHeight: newBox.height,
            noAnim: false,
            groupId: null,
            rotation: 0,
            isBold: false,
            isItalic: false,
            type: 'text',
            zIndex: newBox.zIndex,   // keep in sync with the box
            opacity: 100,
            width: newBox.width,
            height: newBox.height,
            align: align
        };
        textObjects.push(newObj);
    }

    // --- keep editor in sync if you open it later (optional safe-guard) ---
    if (typeof textEditorNew !== "undefined" && textEditorNew) {
        textEditorNew.innerHTML = newBox.text;
        textEditorNew.style.textAlign = newBox.align;
    }

    // --- redraw with your renderer ---
    drawText();

    // ---- optional UI tidy (from addDefaultText) ----
    try {
        if (window.$) {
            $("#opengl_popup").hide();
            $("#elementsPopup").hide();
        }
    } catch (_) { /* noop */ }

    console.log("Add", textObjects);
}



function generateJson() {
    console.log(JSON.stringify(textObjects, null, 2));
    alert("See console.");
}

window.onload = () => {
    // size canvas to container
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    // addNewBox();
};




//colorPickerNew.addEventListener("input", e => {
//    textEditorNew.focus();
//    applyStyleToSelection("color", e.target.value);
//});


// Track selection changes within the editor
let _lastEditorRange = null;

function captureEditorRange() {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    const r = sel.getRangeAt(0);
    if (textEditorNew && textEditorNew.contains(r.commonAncestorContainer)) {
        // clone so it survives DOM edits
        _lastEditorRange = r.cloneRange();
    }
}

if (window.textEditorNew) {
    textEditorNew.addEventListener('mouseup', captureEditorRange);
    textEditorNew.addEventListener('keyup', captureEditorRange);
    document.addEventListener('selectionchange', captureEditorRange);
    textEditorNew.addEventListener('paste', () => {
        setTimeout(() => {
            // your existing hoist call already runs; this is an extra safety pass
            __normalizeEmptyLinesPreservingNBSP(textEditorNew);
            __saveLiveCaretRange(textEditorNew);
        }, 0);
    });
}
// on the <select id="fontSizeSelect">
const fontSel = document.getElementById('fontSizeSelect');
if (fontSel) {
    fontSel.addEventListener('mousedown', e => {
        // keep focus in the editor so selection doesn’t collapse
        e.preventDefault();
        textEditorNew && textEditorNew.focus();
    });
}
// FONT SIZE LINKS
//sizeList.querySelectorAll("a").forEach(link => {
//    link.addEventListener("click", e => {
//        e.preventDefault();
//        restoreSelection();
//        applyStyleToSelection("fontSize", e.target.getAttribute("data-size"));
//    });
//});

// FONT FAMILY LINKS
//fontList.querySelectorAll("a").forEach(link => {
//    link.addEventListener("click", e => {
//        e.preventDefault();
//        restoreSelection();
//        applyStyleToSelection("fontFamily", e.target.getAttribute("data-font"));
//    });
//});


// ALIGNMENT can still use execCommand,
// but if you want per-span alignment:
//////document.querySelectorAll("#alignList a").forEach(link => {
//////    link.addEventListener("click", e => {
//////        e.preventDefault();
//////        const align = e.target.getAttribute("data-align");
//////        textEditorNew.focus();
//////        applyStyleToSelection("textAlign", align);
//////    });
//////});
const alignLinks = document.querySelectorAll("#alignList a");
alignLinks.forEach(link => {
    link.addEventListener("click", e => {
        e.preventDefault();
        const align = e.target.getAttribute("data-align");

        if (!activeBox) return;

        // CASE 1: Editing mode, update editor alignment
        if (isEditing) {
            textEditorNew.style.textAlign = align;
            activeBox.align = align;
            activeBox.text = textEditorNew.innerHTML;
        } else {
            // CASE 2: Not editing: just update box align and redraw
            activeBox.align = align;
        }

        drawText();
    });
});


//function showEditorAtBox(box) {
//    const OFFSET_X = 73;
//    const OFFSET_Y = 45;

//    const container = document.getElementById("canvasContainer");
//    const crect = container.getBoundingClientRect();

//    const editorX = crect.left + box.x + OFFSET_X;
//    const editorY = crect.top + box.y + OFFSET_Y;

//    textEditorNew.innerHTML = box.text;
//    textEditorNew.style.textAlign = box.align || "left";
//    textEditorNew.style.left = `${editorX}px`;
//    textEditorNew.style.top = `${editorY}px`;
//    textEditorNew.style.width = `${box.width}px`;
//    //textEditorNew.style.height = `${box.height}px`;
//    textEditorNew.style.height = (box.height + (typeof selectedLineSpacing === "number" ? selectedLineSpacing : 12)) + "px";
//    textEditorNew.style.display = "block";
//    textEditorNew.focus();
//    isEditing = true;
//}
// ✅ showEditorAtBox with correct offset + line spacing support
// Default fallback

//function showEditorAtBox(box) {
//    if (!box) return;

//    const OFFSET_X = 73;
//    const OFFSET_Y = 45;
//    const container = document.getElementById("canvasContainer");
//    const crect = container.getBoundingClientRect();

//    const editorX = crect.left + box.x + OFFSET_X;
//    const editorY = crect.top + box.y + OFFSET_Y;

//    const spacing = typeof selectedLineSpacing === "number" ? selectedLineSpacing : defaultLineSpacing;

//    textEditorNew.innerHTML = box.text;
//    textEditorNew.style.textAlign = box.align || "left";
//    textEditorNew.style.left = `${editorX}px`;
//    textEditorNew.style.top = `${editorY}px`;
//    textEditorNew.style.width = `${box.width}px`;
//    textEditorNew.style.lineHeight = `calc(1.2em + ${spacing}px)`;
//    textEditorNew.style.display = "block";

//    applyTextEditorStyleFromBox(box);
//    textEditorNew.focus();
//    isEditing = true;
//}
function showEditorAtBoxOLD(box) {
    const OFFSET_X = 73, OFFSET_Y = 45;
    const container = document.getElementById("canvasContainer");
    const crect = container.getBoundingClientRect();
    textEditorNew.innerHTML = box.text;

    textEditorNew.style.textAlign = box.align || "left";
    textEditorNew.style.left = `${crect.left + box.x + OFFSET_X}px`;
    textEditorNew.style.top = `${crect.top + box.y + OFFSET_Y}px`;
    textEditorNew.style.width = `${box.width}px`;
    textEditorNew.style.display = "block";
    applyTextEditorStyleFromBox(box);
    textEditorNew.focus();
    isEditing = true;
}
// ✅ FIXED POSITIONING FOR TEXTEDITOR
// ✅ Corrected function to place textEditorNew accurately on top of the active box
// Universal version of `showEditorAtBox` that works whether the canvas is scaled or not
function showEditorAtBox_6_8(box) {
    const canvasRect = canvas.getBoundingClientRect();
    const containerRect = document.getElementById("canvasContainer").getBoundingClientRect();

    const scaleX = canvas.width / canvasRect.width;
    const scaleY = canvas.height / canvasRect.height;

    // Get position relative to canvas
    const offsetX = box.x / scaleX;
    const offsetY = box.y / scaleY;

    // Adjust based on canvas position inside container
    const relativeX = canvasRect.left - containerRect.left + offsetX;
    const relativeY = canvasRect.top - containerRect.top + offsetY;

    textEditorNew.innerHTML = box.text;
    textEditorNew.style.textAlign = box.align || "left";
    textEditorNew.style.left = `${relativeX}px`;
    textEditorNew.style.top = `${relativeY}px`;
    textEditorNew.style.width = `${box.width / scaleX}px`;
    textEditorNew.style.display = "block";

    applyTextEditorStyleFromBox(box);
    textEditorNew.focus();
    isEditing = true;
}

////Today
//function showEditorAtBox(box) {
//    const canvasRect = canvas.getBoundingClientRect();
//    const containerRect = document.getElementById("canvasContainer").getBoundingClientRect();

//    const scaleX = canvas.width / canvasRect.width;
//    const scaleY = canvas.height / canvasRect.height;

//    const offsetX = box.x / scaleX;
//    const offsetY = box.y / scaleY;

//    const relativeX = canvasRect.left - containerRect.left + offsetX;
//    const relativeY = canvasRect.top - containerRect.top + offsetY;

//    textEditorNew.innerHTML = box.text;
//    textEditorNew.style.textAlign = box.align || "left";
//    textEditorNew.style.left = `${relativeX}px`;
//    textEditorNew.style.top = `${relativeY}px`;
//    textEditorNew.style.width = `${box.width / scaleX}px`;
//    textEditorNew.style.display = "block";

//    applyTextEditorStyleFromBox(box);
//    textEditorNew.focus();
//    isEditing = true;
//}

// Updated showEditorAtBox to rely only on box coordinates and canvas offsets
// Revised showEditorAtBox using only canvas positioning
// ✅ Corrected version of `showEditorAtBox` that fixes incorrect offset
// Final working approach to properly position `textEditorNew` over canvas boxes
function showEditorAtBoxNew(box) {
    const canvasRect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / canvasRect.width;
    const scaleY = canvas.height / canvasRect.height;

    const screenX = canvasRect.left + box.x / scaleX;
    const screenY = canvasRect.top + box.y / scaleY;

    textEditorNew.innerHTML = box.text;
    textEditorNew.style.textAlign = box.align || "left";
    textEditorNew.style.left = `${screenX}px`;
    textEditorNew.style.top = `${screenY}px`;
    textEditorNew.style.width = `${box.width / scaleX}px`;
    textEditorNew.style.height = "auto"; // let it recalculate
    textEditorNew.style.display = "block";
    textEditorNew.style.zIndex = 9999; // ensure it appears topmost

    applyTextEditorStyleFromBox(box);

    // textEditorNew.dispatchEvent(new Event("input"));
    textEditorNew.focus();
    isEditing = true;
}






// ✅ Modify showEditorAtBox to dynamically position based on scaling



//function applyTextEditorStyleFromBox(box) {
//    if (!box) return;

//    const fontSize = parseFloat(window.getComputedStyle(textEditorNew).fontSize) || 16;
//    const lineHeight = fontSize + selectedLineSpacing;

//    Object.assign(textEditorNew.style, {
//        lineHeight: `${lineHeight}px`,
//        whiteSpace: "pre-wrap",
//        fontSize: `${fontSize}px`
//    });
//}

function applyTextEditorStyleFromBoxNEWOLD(box) {
    if (!box) return;

    const fontSize = parseFloat(getComputedStyle(textEditorNew).fontSize) || 16;
    const spacingMultiplier = parseFloat(lineSpacingInput.value);

    // 🧮 Safeguard against too-small values causing visual glitches
    const lineHeightPx = Math.max(fontSize * spacingMultiplier, fontSize * 0.5);

    Object.assign(textEditorNew.style, {
        fontSize: `${fontSize}px`,
        lineHeight: `${lineHeightPx}px`,
        height: "auto"  // ✅ let JS measure height properly again
    });

    // 🔄 Manually resize box height to fit content
    const meas = document.createElement("div");
    Object.assign(meas.style, {
        position: "absolute",
        visibility: "hidden",
        fontSize: `${fontSize}px`,
        lineHeight: `${lineHeightPx}px`,
        whiteSpace: "pre-wrap",
        width: textEditorNew.style.width
    });

    meas.innerHTML = textEditorNew.innerHTML;
    document.body.appendChild(meas);
    const neededHeight = meas.scrollHeight;
    document.body.removeChild(meas);

    textEditorNew.style.height = neededHeight + "px";
    activeBox.height = neededHeight;
    syncEditorLineSpacingFromBox(box);
}
function applyTextEditorStyleFromBox(box) {
    if (!box || !window.textEditorNew) return;
    const ed = textEditorNew;

    // keep your existing spacing/align logic
    const spacing = (typeof box.lineSpacing === "number" && isFinite(box.lineSpacing))
        ? box.lineSpacing : 1.2;
    ed.style.lineHeight = String(spacing);
    ed.style.textAlign = box.align || "left";
    ed.style.whiteSpace = "pre-wrap";
    ed.style.wordBreak = "break-word";

    // ---------- NEW: width must match the select box ----------
    // If you have the DOM node of the red box, use it; otherwise fall back to box.width
    const selectEl = (box.el instanceof Element) ? box.el
        : document.getElementById(box.id) || null;

    let contentW = Number(box.width) || 0;
    if (selectEl) {
        const cs = getComputedStyle(selectEl);
        const padX = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
        contentW = Math.max(0, selectEl.clientWidth - padX);
    }
    if (contentW > 0) ed.style.width = contentW + "px";  // <-- key to matching wrapping
    // ----------------------------------------------------------

    // Make sure line wrappers behave like lines
    Array.from(ed.children).forEach(n => {
        if (n.tagName === "DIV") {
            n.style.display = "block";
            n.style.margin = "0";
            n.style.lineHeight = String(spacing);
        }
    });

    // Measure and set height (unchanged idea)
    ed.style.height = "auto";
    const csEd = getComputedStyle(ed);
    const meas = document.createElement("div");
    Object.assign(meas.style, {
        position: "absolute",
        visibility: "hidden",
        whiteSpace: "pre-wrap",
        boxSizing: csEd.boxSizing,
        padding: csEd.padding,
        width: ed.getBoundingClientRect().width + "px",
        lineHeight: String(spacing),
        font: csEd.font,
        letterSpacing: csEd.letterSpacing
    });
    meas.innerHTML = ed.innerHTML;
    document.body.appendChild(meas);
    const needed = meas.scrollHeight;
    document.body.removeChild(meas);

    ed.style.height = Math.max(needed, Number(box.height) || 0) + "px";
}


function applyTextEditorStyleFromBox_09_08(box) {
    if (!box) return;

    // Use the value coming from your changeLineSpacing() updates
    const spacingMultiplier = (typeof box.lineSpacing === "number" && !isNaN(box.lineSpacing))
        ? box.lineSpacing
        : 1.2; // default

    // Apply alignment & line-height on the editor itself
    textEditorNew.style.textAlign = box.align || "left";
    textEditorNew.style.lineHeight = String(spacingMultiplier); // unitless multiplier

    // Also apply to each top-level <div> line (to match your canvas line model)
    const lineDivs = Array.from(textEditorNew.childNodes)
        .filter(n => n.nodeType === 1 && n.tagName === "DIV");
    lineDivs.forEach(div => { div.style.lineHeight = String(spacingMultiplier); });

    // --- Measure height (don’t force a font-size; let inline sizes stand) ---
    // Temporarily set height:auto to measure correctly
    textEditorNew.style.height = "auto";

    const meas = document.createElement("div");
    Object.assign(meas.style, {
        position: "absolute",
        visibility: "hidden",
        whiteSpace: "pre-wrap",
        lineHeight: String(spacingMultiplier),
        // mirror width so measurement matches
        width: textEditorNew.style.width || (textEditorNew.clientWidth + "px"),
    });

    // Mirror line divs’ unitless line-height for accuracy
    meas.innerHTML = textEditorNew.innerHTML;
    const measDivs = Array.from(meas.childNodes).filter(n => n.nodeType === 1 && n.tagName === "DIV");
    measDivs.forEach(div => { div.style.lineHeight = String(spacingMultiplier); });

    document.body.appendChild(meas);
    const neededHeight = meas.scrollHeight;
    document.body.removeChild(meas);

    textEditorNew.style.height = neededHeight + "px";
    if (activeBox) activeBox.height = neededHeight;

    // Keep your existing helper to ensure consistency (safe no-op if already set)
    if (typeof syncEditorLineSpacingFromBox === "function") {
        syncEditorLineSpacingFromBox(box);
    }
}

// (1) helper to measure HTML content size
function measureHTML(html, maxWidth = 1000) {
    const temp = document.createElement("div");
    temp.style.position = "absolute";
    temp.style.visibility = "hidden";
    temp.style.whiteSpace = "pre-wrap";
    temp.style.font = window.getComputedStyle(textEditorNew).font;
    temp.style.lineHeight = window.getComputedStyle(textEditorNew).lineHeight;
    temp.style.width = maxWidth + "px";
    temp.innerHTML = html;
    document.body.appendChild(temp);
    const size = { width: temp.scrollWidth + 10, height: temp.scrollHeight + 10 };
    document.body.removeChild(temp);
    return size;
}

// (2) whenever the content changes (including ENTER), resize the box
// whenever the editor content changes (including Enter/new-line), resize the box


//textEditorNew.addEventListener("input", () => {
//    if (!activeBox || !isEditing) return;

//    // Grab accurate font + size from computed styles
//    const edStyle = window.getComputedStyle(textEditorNew);
//    const meas = document.createElement("div");
//    Object.assign(meas.style, {
//        position: "absolute",
//        visibility: "hidden",
//        whiteSpace: "pre-wrap",
//        fontFamily: edStyle.fontFamily,
//        fontSize: edStyle.fontSize,
//        lineHeight: edStyle.lineHeight,
//        width: textEditorNew.style.width
//    });

//    meas.innerHTML = textEditorNew.innerHTML; // ✅ include all <span> with styles
//    document.body.appendChild(meas);

//    const neededH = meas.scrollHeight + 8;
//    document.body.removeChild(meas);

//    activeBox.height = Math.max(neededH, 30);
//    textEditorNew.style.height = activeBox.height + "px";

//    activeBox.text = textEditorNew.innerHTML; // ✅ This must be full styled HTML
//    drawText();
//});
// ✅ Enhance line spacing and increase activeBox height when Enter is pressed
function ensureEditorWrapping() {
    if (!window.textEditorNew) return;

    // Root must wrap
    textEditorNew.style.whiteSpace = 'pre-wrap';

    // Each top-level line should be a block and allowed to wrap
    textEditorNew.querySelectorAll(':scope > div').forEach(d => {
        if (d.style.display !== 'block') d.style.display = 'block';
        if (d.style.whiteSpace && d.style.whiteSpace.toLowerCase() === 'nowrap') {
            d.style.whiteSpace = 'pre-wrap';
        }
    });

    // Remove accidental nowrap on descendants (spans created by styling)
    textEditorNew.querySelectorAll('[style*="white-space"]').forEach(el => {
        const ws = (el.style.whiteSpace || '').toLowerCase();
        if (ws === 'nowrap') el.style.whiteSpace = ''; // let it inherit/wrap
    });
}

// once at startup
let __fontsReadyOnce = false;

textEditorNew.addEventListener("input", () => {
    if (!activeBox || !isEditing) return;

    // normalize structure first
    ensureEditorWrapping();
    hoistNestedLines(textEditorNew);

    // let the browser finish the mutation & layout
    requestAnimationFrame(async () => {
        // wait for fonts only once (macOS flicker fix) — not on every keystroke
        if (!__fontsReadyOnce && document.fonts?.ready) {
            try { await document.fonts.ready; } catch { }
            __fontsReadyOnce = true;
        }

        const cs = getComputedStyle(textEditorNew);

        // build a faithful measurer
        const meas = document.createElement("div");
        Object.assign(meas.style, {
            position: "absolute",
            visibility: "hidden",
            left: "-99999px",
            top: "0",
            width: cs.width,                  // computed width, not style string
            boxSizing: "border-box",
            padding: cs.padding,
            border: cs.border,
            whiteSpace: cs.whiteSpace,        // mirror wrapping…
            wordBreak: cs.wordBreak,
            overflowWrap: cs.overflowWrap,
            fontFamily: cs.fontFamily,        // mirror font exactly
            fontSize: cs.fontSize,
            fontWeight: cs.fontWeight,
            fontStyle: cs.fontStyle,
            lineHeight: cs.lineHeight,        // see note below re: “normal”
            letterSpacing: cs.letterSpacing
        });

        // If Safari reports "normal", convert it once to pixels to match canvas
        if (meas.style.lineHeight === "" || cs.lineHeight === "normal") {
            const fs = parseFloat(cs.fontSize) || 16;
            // keep this in sync with your canvas line-height rule!
            const pxLH = Math.round(fs * (box?.lineSpacing || 1.2));
            meas.style.lineHeight = `${pxLH}px`;
        }

        // (optional) prune like canvas so line counts match
        const tmp = document.createElement("div");
        tmp.innerHTML = textEditorNew.innerHTML;
        (function pruneGhostPlaceholders(root) {
            Array.from(root.querySelectorAll('p')).forEach(p => {
                const hasBR = !!p.querySelector('br');
                const txt = (p.textContent || '').replace(/[\u200B\u00A0\s]/g, '');
                if (!hasBR && txt === '') p.remove();
            });
            Array.from(root.querySelectorAll('div,p')).forEach(el => {
                const hasBR = !!el.querySelector('br');
                const txt = (el.textContent || '').replace(/[\u200B\u00A0\s]/g, '');
                if (!hasBR && txt === '') el.remove();
            });
        })(tmp);

        meas.innerHTML = tmp.innerHTML;
        document.body.appendChild(meas);

        const neededH = meas.scrollHeight;  // trust scrollHeight; no manual +spacing
        document.body.removeChild(meas);

        activeBox.height = Math.max(neededH, 30);
        textEditorNew.style.height = `${activeBox.height}px`;

        activeBox.text = textEditorNew.innerHTML;
        drawText();
    });
});





//textEditorNew.addEventListener("keydown", e => {
//    if (e.key === "Enter") {
//        // let the line break happen, then re-fire input
//        setTimeout(() => textEditorNew.dispatchEvent(new Event("input")), 0);
//    }
//});

//textEditorNew.addEventListener("keydown", e => {
//    if (e.isComposing) return;
//    if (e.key === "Enter") {
//        // Let the browser finish its contenteditable mutation first.
//        setTimeout(() => {
//            requestAnimationFrame(() => {
//                if (activeBox && isEditing) {
//                    // copy after DOM is fully updated, so the first <div> (Text <br>) is included
//                    activeBox.text = textEditorNew.innerHTML;
//                    drawText();
//                }
//            });
//        }, 0);
//    }
//});

// ADD near your other editor globals:
let __enterShift = false;
let __suppressBeforeInputOnce = false;
function __emitSyntheticInputNextFrame(el) {
    requestAnimationFrame(() => {
        try {
            el.dispatchEvent(new Event('input', { bubbles: true }));
        } catch {
            const ev = document.createEvent('Event');
            ev.initEvent('input', true, false);
            el.dispatchEvent(ev);
        }
    });
}
// keep your existing listener if already present; otherwise:
textEditorNew.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    __enterShift = !!e.shiftKey;

    // Robust path for browsers that don't give a clean insertParagraph beforeinput
    if (!__enterShift) {
        e.preventDefault();                    // stop default split
        __suppressBeforeInputOnce = true;      // don't also run in beforeinput
        __insertEmptyLineBlock(textEditorNew); // split-at-caret

        // 🔧 make your input-size logic run
        __emitSyntheticInputNextFrame(textEditorNew);
    }
});

// ADD: on 'insertParagraph' (normal Enter), insert <div><br></div> ourselves
textEditorNew.addEventListener('beforeinput', (e) => {
    if (e.inputType === 'insertParagraph') {
        if (__suppressBeforeInputOnce) {
            __suppressBeforeInputOnce = false;   // consume once
            return;
        }
        if (__enterShift) { __enterShift = false; return; } // let Shift+Enter be a soft break
        e.preventDefault();
        __insertEmptyLineBlock(textEditorNew);  // split-at-caret

        // 🔧 make your input-size logic run
        __emitSyntheticInputNextFrame(textEditorNew);
    }
});



// ADD: helper – insert <div><br></div> AFTER the caret's top-level line block
function __insertEmptyLineBlock(root) {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return;

  const range = sel.getRangeAt(0);
  if (!range.collapsed) range.deleteContents();

  // find current top-level line (DIV or P)
  let line = range.startContainer;
  while (line && line !== root && line.parentNode !== root) line = line.parentNode;

  // if we don't have a line yet, wrap once (same as your current behavior)
  if (!line || line === root) {
    const wrap = document.createElement('div');
    wrap.setAttribute('style','line-height:1.2;display:block;margin:0');
    while (root.firstChild) wrap.appendChild(root.firstChild);
    root.appendChild(wrap);
    line = wrap;
  }

  const isLine = el => el && el.nodeType === 1 && (el.tagName === 'DIV' || el.tagName === 'P');

  const isBlankLine = el => {
    if (!isLine(el)) return false;
    // visible blank if it has a <br> somewhere or only whitespace
    const txt = (el.textContent || '').replace(/\u200B/g,''); // strip ZWSP
    const onlyWS = !/[^\s\u00A0]/.test(txt);
    const hasBR = !!el.querySelector && el.querySelector('br');
    // also treat <div><p><br></p></div> as blank
    const singlePWithBR = (el.tagName === 'DIV' &&
                           el.children.length === 1 &&
                           el.children[0].tagName === 'P' &&
                           !!el.children[0].querySelector('br'));
    return hasBR || singlePWithBR || onlyWS;
  };

  const mkParaBlank = () => {
    const p = document.createElement('p');
    p.setAttribute('style','margin:0;line-height:1.2;display:block;');
    p.innerHTML = '<br>';
    return p;
  };

  // build left/right fragments
  const caretRange = sel.getRangeAt(0).cloneRange();

  const rLeft = document.createRange();
  rLeft.setStart(line, 0);
  rLeft.setEnd(caretRange.startContainer, caretRange.startOffset);
  const fragLeft = rLeft.cloneContents();

  const rRight = document.createRange();
  rRight.setStart(caretRange.startContainer, caretRange.startOffset);
  rRight.setEnd(line, line.childNodes.length);
  const fragRight = rRight.cloneContents();

  const leftHasContent  = !!fragLeft && fragLeft.childNodes.length > 0;
  const rightHasContent = !!fragRight && fragRight.childNodes.length > 0;

  const prevLine = line.previousSibling;
  const nextLine = line.nextSibling;

  // CASE 1: caret at START (no left content)
  if (!leftHasContent && rightHasContent) {
    // If previous sibling is already a blank line, don't add—just move caret there.
    if (isLine(prevLine) && isBlankLine(prevLine)) {
      const r = document.createRange();
      r.setStart(prevLine, 0);
      r.collapse(true);
      sel.removeAllRanges(); sel.addRange(r);
      return;
    }
    // Insert exactly ONE blank before current line; do not touch right content or existing blanks.
    const blank = mkParaBlank();
    root.insertBefore(blank, line);

    // place caret into the new blank
    const r = document.createRange();
    r.setStart(blank, 0);
    r.collapse(true);
    sel.removeAllRanges(); sel.addRange(r);
    return;
  }

  // CASE 2: caret at END (no right content)
  if (leftHasContent && !rightHasContent) {
    // If next sibling is already a blank line, don't add—just move caret there.
    if (isLine(nextLine) && isBlankLine(nextLine)) {
      const r = document.createRange();
      r.setStart(nextLine, 0);
      r.collapse(true);
      sel.removeAllRanges(); sel.addRange(r);
      return;
    }
    // Insert exactly ONE blank after current line; keep left content as-is.
    const blank = mkParaBlank();
    if (line.nextSibling) root.insertBefore(blank, line.nextSibling);
    else root.appendChild(blank);

    const r = document.createRange();
    r.setStart(blank, 0);
    r.collapse(true);
    sel.removeAllRanges(); sel.addRange(r);
    return;
  }

  // CASE 3: caret in the MIDDLE (both sides have content)
  if (leftHasContent && rightHasContent) {
    // Replace current line with  [left-content line] [ONE blank] [right-content line]
    const leftLine = document.createElement(line.tagName); // keep DIV/P
    leftLine.setAttribute('style','line-height:1.2;display:block;margin:0');
    leftLine.appendChild(fragLeft);

    const rightLine = document.createElement(line.tagName);
    rightLine.setAttribute('style','line-height:1.2;display:block;margin:0');
    rightLine.appendChild(fragRight);

    const blank = mkParaBlank();

    root.insertBefore(leftLine, line);
    root.insertBefore(blank, line);
    root.insertBefore(rightLine, line);
    root.removeChild(line);

    const r = document.createRange();
    r.setStart(blank, 0);
    r.collapse(true);
    sel.removeAllRanges(); sel.addRange(r);
    return;
  }

  // CASE 4: line has no real content (already blank)
  // Don't change blank count; if neighbor already blank, just put caret there;
  // otherwise insert exactly one new blank AFTER it (standard Enter behavior in blank line).
  if (!leftHasContent && !rightHasContent) {
    if (isLine(nextLine) && isBlankLine(nextLine)) {
      const r = document.createRange();
      r.setStart(nextLine, 0);
      r.collapse(true);
      sel.removeAllRanges(); sel.addRange(r);
      return;
    }
    const blank = mkParaBlank();
    if (line.nextSibling) root.insertBefore(blank, line.nextSibling);
    else root.appendChild(blank);

    const r = document.createRange();
    r.setStart(blank, 0);
    r.collapse(true);
    sel.removeAllRanges(); sel.addRange(r);
    return;
  }
}



//boldBtn.addEventListener("click", e => {
//    e.preventDefault();
//    restoreSelection();
//    document.execCommand("bold");
//});

//// 3. Italic
//italicBtn.addEventListener("click", e => {
//    e.preventDefault();
//    restoreSelection();
//    document.execCommand("italic");
//});

//// 4. Font Change
//fontList.querySelectorAll("a[data-font]").forEach(a => {
//    a.addEventListener("click", e => {
//        e.preventDefault();
//        restoreSelection();
//        const font = a.getAttribute("data-font");
//        document.execCommand("fontName", false, font);
//    });
//});

//// 5. Font Size Change
//sizeList.querySelectorAll("a[data-size]").forEach(a => {
//    a.addEventListener("click", e => {
//        e.preventDefault();
//        restoreSelection();
//        const size = a.getAttribute("data-size");
//        const span = document.createElement("span");
//        span.style.fontSize = size;
//        wrapSelectionWithSpan(span);
//    });
//});

// 6. Line Spacing
//const lineSpacingSelect = document.getElementById("lineSpacingSelect");
//lineSpacingSelect.addEventListener("change", () => {
//    const val = parseFloat(lineSpacingSelect.value);
//    selectedLineSpacing = isNaN(val) ? defaultLineSpacing : val * 8;

//    if (activeBox) {
//        applyTextEditorStyleFromBox(activeBox);
//        textEditorNew.dispatchEvent(new Event("input"));
//    }
//});
////lineSpacingSelect.addEventListener("change", () => {
////    const val = parseFloat(lineSpacingSelect.value);
////    selectedLineSpacing = isNaN(val) ? defaultLineSpacing : val * 8;

////    // Apply spacing inline using execCommand
////    applyStyleToSelection("lineSpacing", selectedLineSpacing);

////    // Also refresh editor height for the box
////    if (activeBox) {
////        applyTextEditorStyleFromBox(activeBox);
////        textEditorNew.dispatchEvent(new Event("input"));
////    }
////});


//window.addEventListener("DOMContentLoaded", () => {
//    const lineSpacingInput = document.getElementById("lineSpacingInput");
//    lineSpacingInput.addEventListener("change", () => {
//        const val = parseFloat(lineSpacingInput.value);
//        if (isNaN(val)) return;

//        const clamped = Math.max(-3, Math.min(7, val));
//        const pxSpacing = clamped * 8;

//        let fontSize;
//        if (textEditorNew.offsetParent !== null) {
//            fontSize = parseFloat(window.getComputedStyle(textEditorNew).fontSize) || 16;
//        } else if (activeBox?.fontSize) {
//            fontSize = parseFloat(activeBox.fontSize);
//        } else {
//            fontSize = 16; // fallback
//        }

//        const lineSpacingMultiplier = (fontSize + pxSpacing) / fontSize;

//        // ✅ Apply to editor even if hidden — so it’s ready on open
//        textEditorNew.style.lineHeight = `${fontSize + pxSpacing}px`;

//        if (activeBox) {
//            activeBox.lineSpacing = lineSpacingMultiplier;
//            if (isEditing) {
//                activeBox.text = textEditorNew.innerHTML;
//            }
//            drawText();
//        }
//    });


//    //lineSpacingInput.addEventListener("change", () => {
//    //    const val = parseFloat(lineSpacingInput.value);
//    //    if (isNaN(val)) return;

//    //    // Clamp to reasonable values if necessary
//    //    const clamped = Math.max(-3, Math.min(7, val));
//    //    selectedLineSpacing = clamped * 8; // convert to px spacing

//    //    const html = textEditorNew.innerHTML;
//    //    const divCount = (html.match(/<div>|<br>/g) || []).length;
//    //    const hasMultipleLines = divCount >= 1;

//    //    const sel = window.getSelection();

//    //    // CASE 1: We're editing and no selection but multiple lines present
//    //    if (activeBox && isEditing) {
//    //        if (sel && sel.rangeCount === 1 && sel.isCollapsed && hasMultipleLines) {
//    //            applyTextEditorStyleFromBox(activeBox);
//    //            textEditorNew.dispatchEvent(new Event("input"));
//    //            activeBox.text = textEditorNew.innerHTML;
//    //            drawText();
//    //        }
//    //    }
//    //    // CASE 2: Not editing but activeBox has multiple lines
//    //    else if (activeBox && !isEditing && hasMultipleLines) {
//    //        showEditorAtBox(activeBox);
//    //        applyTextEditorStyleFromBox(activeBox);
//    //        activeBox.text = textEditorNew.innerHTML;
//    //        drawText();
//    //    }
//    //});
//});
// ✅ Line spacing will apply at box level if a box is active and editor has multiline
//lineSpacingSelect.addEventListener("change", () => {
//    const val = parseFloat(lineSpacingSelect.value);
//    selectedLineSpacing = isNaN(val) ? defaultLineSpacing : val * 8; // px value

//    // ✅ Apply even when not editing yet
//    const html = textEditorNew.innerHTML;
//    const divCount = (html.match(/<div>|<br>/g) || []).length;
//    const hasMultipleLines = divCount >= 1;

//    const sel = window.getSelection();

//    // ✅ CASE 1: If actively editing
//    if (activeBox && isEditing) {
//        if (sel && sel.rangeCount === 1 && sel.isCollapsed && hasMultipleLines) {
//            applyTextEditorStyleFromBox(activeBox);
//            textEditorNew.dispatchEvent(new Event("input"));
//            activeBox.text = textEditorNew.innerHTML;
//            drawText();
//        }
//        // Optional inline selection logic
//        // else if (sel && !sel.isCollapsed) {
//        //     applyStyleToSelection("lineSpacing", selectedLineSpacing);
//        // }
//    }

//    // ✅ CASE 2: Not editing but we have a multiline activeBox
//    else if (activeBox && !isEditing && hasMultipleLines) {
//        showEditorAtBox(activeBox);
//        applyTextEditorStyleFromBox(activeBox);
//        activeBox.text = textEditorNew.innerHTML;
//        drawText();
//    }
//});

/*});*/

// 7. Alignment
//alignList.querySelectorAll("a[data-align]").forEach(a => {
//    a.addEventListener("click", e => {
//        e.preventDefault();
//        const align = a.getAttribute("data-align");
//        if (activeBox) {
//            activeBox.align = align;
//            textEditorNew.style.textAlign = align;
//            drawText();
//        }
//    });
//});


function wrapSelectionWithSpan(styleObj) {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;

    const range = sel.getRangeAt(0);
    if (range.collapsed) return null;

    const span = document.createElement("span");
    Object.assign(span.style, styleObj);

    // Keep existing formatting: wrap the extracted nodes
    const frag = range.extractContents();
    span.appendChild(frag);
    range.insertNode(span);

    // Reselect the styled text
    sel.removeAllRanges();
    const newRange = document.createRange();
    newRange.selectNodeContents(span);
    sel.addRange(newRange);

    return span;
}
function sanitizeSingleLineInPlace(editorEl) {
    if (!editorEl) return;
    if (editorEl.querySelector("br")) return; // skip if multiline on purpose

    // If exactly one top-level DIV, apply nowrap there; otherwise on editor itself
    if (editorEl.childElementCount === 1 && editorEl.firstElementChild?.tagName === "DIV") {
        editorEl.firstElementChild.style.whiteSpace = "nowrap";
    } else {
        editorEl.style.whiteSpace = "nowrap";
    }
}

function wrapSelectionWithSpanOLD(span) {
    restoreSelection();
    if (!savedRange) return;
    const range = savedRange.cloneRange();
    range.surroundContents(span);
    saveSelection();
}

// Logic for scaling and resizing text box with different handle behaviors
// Updated `scaleTextBoxWithHandle` to follow:
// 1. Corner handles scale font size only
// 2. Middle handles only break into characters if box is squished beyond text line length

// Revised `scaleTextBoxWithHandle` based on your feedback
// Enhanced letter-level wrapping for squishing via middle handles
//function showEditorAtBox(box) {
//    const canvasRect = canvas.getBoundingClientRect();
//    const containerRect = document.getElementById("canvasContainer").getBoundingClientRect();

//    const scaleX = canvas.width / canvasRect.width;
//    const scaleY = canvas.height / canvasRect.height;

//    const offsetX = box.x / scaleX;
//    const offsetY = box.y / scaleY;

//    const relativeX = canvasRect.left - containerRect.left + offsetX;
//    const relativeY = canvasRect.top - containerRect.top + offsetY;

//    textEditorNew.innerHTML = box.text;
//    textEditorNew.style.textAlign = box.align || "left";
//    textEditorNew.style.left = `${relativeX}px`;
//    textEditorNew.style.top = `${relativeY}px`;
//    textEditorNew.style.width = `${box.width / scaleX}px`;
//    textEditorNew.style.display = "block";

//    applyTextEditorStyleFromBox(box);
//    textEditorNew.focus();
//    isEditing = true;
//}

function getAllHandles(box, scaleX = 1, scaleY = 1) {
    const { x, y, width: w, height: h } = box;
    return {
        tl: { x: x, y: y }, tm: { x: x + w / 2, y: y }, tr: { x: x + w, y: y },
        ml: { x: x, y: y + h / 2 }, mr: { x: x + w, y: y + h / 2 },
        bl: { x: x, y: y + h }, bm: { x: x + w / 2, y: y + h }, br: { x: x + w, y: y + h }
    };
}

function showEditorAtBoxOLD(box) {
    const canvasRect = canvas.getBoundingClientRect();
    const containerRect = document.getElementById("canvasContainer").getBoundingClientRect();

    const scaleX = canvas.width / canvasRect.width;
    const scaleY = canvas.height / canvasRect.height;

    const offsetX = box.x / scaleX;
    const offsetY = box.y / scaleY;

    const relativeX = canvasRect.left - containerRect.left + offsetX;
    const relativeY = canvasRect.top - containerRect.top + offsetY;

    textEditorNew.innerHTML = box.text;
    textEditorNew.style.textAlign = box.align || "left";
    textEditorNew.style.left = `${relativeX}px`;
    textEditorNew.style.top = `${relativeY}px`;
    textEditorNew.style.width = `${box.width / scaleX}px`;
    textEditorNew.style.display = "block";
    textEditorNew.style.cursor = "text";
    applyTextEditorStyleFromBox(box);
    textEditorNew.focus();
    isEditing = true;
}
// made async (ADD: async + one await)
async function showEditorAtBox(box) {
    const canvasRect = canvas.getBoundingClientRect();
    const containerRect = document.getElementById("canvasContainer").getBoundingClientRect();

    const scaleX = canvas.width / canvasRect.width;
    const scaleY = canvas.height / canvasRect.height;

    const offsetX = box.x / scaleX;
    const offsetY = box.y / scaleY;

    const relativeX = canvasRect.left - containerRect.left + offsetX;
    const relativeY = canvasRect.top - containerRect.top + offsetY;

    textEditorNew.innerHTML = box.text;
    hoistNestedLines(textEditorNew); // optional safety on open
    textEditorNew.style.textAlign = box.align || "left";

    // **WAIT HERE** so macOS uses the correct font metrics
    await __fontsReadyForEditor(textEditorNew); // ← ADD

    // position & size (your existing lines)
    textEditorNew.style.left = `${relativeX}px`;
    textEditorNew.style.top = `${relativeY}px`;
    textEditorNew.style.width = `${box.width / scaleX}px`;
    textEditorNew.style.height = `${box.height / scaleY}px`; // keeps visual parity with canvas

    // ───────────── existing ADD block you had ─────────────
    (function syncEditorOuterBoxToSelection() {
        const snap = v => Math.round(v * window.devicePixelRatio) / window.devicePixelRatio;

        const { w, h } = getBoxRect(box);   // canvas pixels
        const outerWcss = w / scaleX;
        const outerHcss = h / scaleY;

        textEditorNew.style.boxSizing = "border-box";

        textEditorNew.style.left = `${snap(relativeX)}px`;
        textEditorNew.style.top = `${snap(relativeY)}px`;
        textEditorNew.style.width = `${snap(outerWcss)}px`;
        textEditorNew.style.height = `${snap(outerHcss)}px`;

        textEditorNew.style.minWidth = `${snap(outerWcss)}px`;
        textEditorNew.style.minHeight = `${snap(outerHcss)}px`;
    })();
    // ──────────────────────────────────────────────────────

    // apply the box's spacing to the editor DOM
    syncEditorLineSpacingFromBox(box);

    textEditorNew.style.display = "block";
    textEditorNew.style.cursor = "text";

    // keep the rest of your styling logic
    applyTextEditorStyleFromBox(box);

    // ✅ enable keyboard support once
    if (!textEditorNew._keyboardEnabled) {
        enableEditorKeyboard();
        textEditorNew._keyboardEnabled = true;
    }

    textEditorNew.focus();
    isEditing = true;
}


function syncEditorLineSpacingFromBox(box) {
    const lh = String(box.lineSpacing || 1.2); // unitless multiplier
    // set on editor (fallback when there are no top-level divs)
    textEditorNew.style.lineHeight = lh;

    // set on each top-level <div> (your renderer treats these as lines)
    Array.from(textEditorNew.childNodes)
        .filter(n => n.nodeType === 1 && n.tagName === "DIV")
        .forEach(div => { div.style.lineHeight = lh; });
}
//function showEditorAtBox(box) {
//    const canvasRect = canvas.getBoundingClientRect();
//    const containerRect = document.getElementById("canvasContainer").getBoundingClientRect();

//    const scaleX = canvas.width / canvasRect.width;
//    const scaleY = canvas.height / canvasRect.height;

//    const offsetX = box.x / scaleX;
//    const offsetY = box.y / scaleY;

//    const relativeX = canvasRect.left - containerRect.left + offsetX;
//    const relativeY = canvasRect.top - containerRect.top + offsetY;

//    textEditorNew.innerHTML = box.text;
//    textEditorNew.style.textAlign = box.align || "left";
//    textEditorNew.style.left = `${relativeX}px`;
//    textEditorNew.style.top = `${relativeY}px`;
//    textEditorNew.style.width = `${box.width / scaleX}px`;
//    textEditorNew.style.display = "block";

//    applyTextEditorStyleFromBox(box);
//    textEditorNew.focus();
//    isEditing = true;
//}

//function getAllHandles(box, scaleX = 1, scaleY = 1) {
//    const { x, y, width: w, height: h } = box;
//    return {
//        tl: { x: x, y: y }, tm: { x: x + w / 2, y: y }, tr: { x: x + w, y: y },
//        ml: { x: x, y: y + h / 2 }, mr: { x: x + w, y: y + h / 2 },
//        bl: { x: x, y: y + h }, bm: { x: x + w / 2, y: y + h }, br: { x: x + w, y: y + h }
//    };
//}


// Updates to scaleTextBoxWithHandle function
// Updated version of `scaleTextBoxWithHandle` to fix:
// 1. Letter-wise text wrapping during middle handle squishing
// 2. Font size scaling via corner handles only

// Unified version of scaleTextBoxWithHandle
// Function to handle resizing based on the handle direction

function scaleTextBoxWithHandle(box, dir, mx, my) {
    const orig = box._orig;
    const minWidth = 10;
    const minHeight = 10;

    if (["tl", "tr", "bl", "br"].includes(dir)) {
        let factor = 1;
        const dx = mx - orig.x;
        const dy = my - orig.y;
        const avgScale = ((dx / orig.width) + (dy / orig.height)) / 2;
        factor = Math.max(0.1, avgScale);
        box.fontSize = Math.max(5, orig.fontSize * factor);

        const context = canvas.getContext("2d");
        context.font = `${box.fontSize}px ${box.fontFamily || 'Arial Regular'}`;
        const lines = box.text.split(/<br\s*\/?>/);
        const widths = lines.map(line => context.measureText(stripHTML(line)).width);
        const maxWidth = Math.max(...widths);
        box.width = maxWidth;
        box.height = lines.length * box.fontSize * 1.2;
    } else if (["ml", "mr"].includes(dir)) {
        let newWidth = orig.width;
        if (dir === "ml") {
            newWidth = orig.width + (orig.x - mx);
            if (newWidth > minWidth) {
                box.x = mx;
                box.width = newWidth;
            }
        } else if (dir === "mr") {
            newWidth = mx - orig.x;
            if (newWidth > minWidth) {
                box.width = newWidth;
            }
        }

        const text = stripHTML(box.text).replace(/\s/g, "");
        const approxCharWidth = box.fontSize * 0.6;
        const charsPerLine = Math.max(1, Math.floor(box.width / approxCharWidth));
        const estLines = Math.ceil(text.length / charsPerLine);
        box.height = estLines * box.fontSize * 1.2;
    } else if (["tm", "bm"].includes(dir)) {
        let newHeight = orig.height;
        if (dir === "tm") {
            newHeight = orig.height + (orig.y - my);
            if (newHeight > minHeight) {
                box.y = my;
                box.height = newHeight;
            }
        } else if (dir === "bm") {
            newHeight = my - orig.y;
            if (newHeight > minHeight) {
                box.height = newHeight;
            }
        }
    }
}



////function scaleTextBoxWithHandle(box, dir, mx, my) {
////    const orig = box._orig;
////    const minWidth = 10;
////    const minHeight = 10;
////    const context = canvas.getContext("2d");

////    // Update context font
////    context.font = `${box.fontSize}px ${box.fontFamily || 'Arial'}`;

////    // ---- 1. CORNER HANDLES: resize by scaling font size ----
////    if (["tl", "tr", "bl", "br"].includes(dir)) {
////        const dx = mx - orig.x;
////        const dy = my - orig.y;
////        const avgScale = ((dx / orig.width) + (dy / orig.height)) / 2;
////        const scale = Math.max(0.1, avgScale);

////        box.fontSize = Math.max(5, orig.fontSize * scale);
////        context.font = `${box.fontSize}px ${box.fontFamily || 'Arial'}`;

////        // Recalculate size
////        const text = stripHTML(box.text).replace(/\s+/g, "");
////        const approxCharWidth = box.fontSize * 0.6;
////        const charsPerLine = Math.floor(orig.width / approxCharWidth);
////        const lineCount = Math.ceil(text.length / charsPerLine);
////        box.width = approxCharWidth * charsPerLine;
////        box.height = box.fontSize * 1.2 * lineCount;
////        return;
////    }

////    // ---- 2. LEFT/RIGHT MIDDLE: Letter-wise wrapping ----
////    if (["ml", "mr"].includes(dir)) {
////        let newWidth = orig.width;
////        if (dir === "ml") {
////            newWidth = orig.width + (orig.x - mx);
////            if (newWidth > minWidth) {
////                box.x = mx;
////                box.width = newWidth;
////            }
////        } else {
////            newWidth = mx - orig.x;
////            if (newWidth > minWidth) {
////                box.width = newWidth;
////            }
////        }

////        const text = stripHTML(box.text).replace(/\s+/g, "");
////        const approxCharWidth = box.fontSize * 0.6;
////        const charsPerLine = Math.max(1, Math.floor(box.width / approxCharWidth));
////        const lineCount = Math.ceil(text.length / charsPerLine);
////        box.height = box.fontSize * 1.2 * lineCount;
////        return;
////    }

////    // ---- 3. TOP/BOTTOM MIDDLE: Resize height freely ----
////    if (["tm", "bm"].includes(dir)) {
////        let newHeight = orig.height;
////        if (dir === "tm") {
////            newHeight = orig.height + (orig.y - my);
////            if (newHeight > minHeight) {
////                box.y = my;
////                box.height = newHeight;
////            }
////        } else {
////            newHeight = my - orig.y;
////            if (newHeight > minHeight) {
////                box.height = newHeight;
////            }
////        }
////    }
////}









function scaleTextBoxWithHandle_6_8(box, handle, deltaX, deltaY, scaleX = 1, scaleY = 1) {
    const minFontSize = 8;
    const maxFontSize = 300;
    const minWidth = 10;
    const minHeight = 10;

    // Handle midpoint stretching without font size change
    const isMiddleHandle = ["ml", "mr", "tm", "bm"].includes(handle);
    const isCornerHandle = ["tl", "tr", "bl", "br"].includes(handle);

    if (isMiddleHandle) {
        // Horizontal handles (left-middle or right-middle)
        if (handle === "ml") {
            const newWidth = box.width - deltaX / scaleX;
            if (newWidth > minWidth) {
                box.x += deltaX / scaleX;
                box.width = newWidth;
            }
        } else if (handle === "mr") {
            const newWidth = box.width + deltaX / scaleX;
            if (newWidth > minWidth) box.width = newWidth;
        }

        // Vertical handles (top-middle or bottom-middle)
        if (handle === "tm") {
            const newHeight = box.height - deltaY / scaleY;
            if (newHeight > minHeight) {
                box.y += deltaY / scaleY;
                box.height = newHeight;
            }
        } else if (handle === "bm") {
            const newHeight = box.height + deltaY / scaleY;
            if (newHeight > minHeight) box.height = newHeight;
        }

        // Don't change font size here
    }

    if (isCornerHandle) {
        // Change font size based on diagonal scale (deltaX + deltaY)
        const fontGrowth = (deltaX + deltaY) / 10; // tune the factor
        let newFontSize = box.fontSize + fontGrowth;
        newFontSize = Math.max(minFontSize, Math.min(maxFontSize, newFontSize));

        // Apply new font size
        box.fontSize = newFontSize;

        // Optionally update width/height to reflect font size visually
        const measured = measureTextSize(box.text, box.fontFamily, newFontSize, box.width);
        box.width = measured.width;
        box.height = measured.height;
    }
}

function measureTextSize(text, fontFamily, fontSize, maxWidth = 1000) {
    const temp = document.createElement("div");
    temp.style.position = "absolute";
    temp.style.visibility = "hidden";
    temp.style.fontFamily = fontFamily;
    temp.style.fontSize = fontSize + "px";
    temp.style.whiteSpace = "pre-wrap";
    temp.style.lineHeight = "1.2";
    temp.style.width = maxWidth + "px";
    temp.innerText = text;
    document.body.appendChild(temp);
    const size = {
        width: temp.scrollWidth + 4,
        height: temp.scrollHeight + 4
    };
    document.body.removeChild(temp);
    return size;
}


// 1) Pointer → canvas coords helper (adjust if you already have one)
function getMouseInCanvas(e) {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
}

// 2) State for corner scaling
let cornerScaleState = null; // { startDist, startScale }

function isCornerHandleName(h) {
    return (
        h === "top-left" || h === "top-right" || h === "bottom-left" || h === "bottom-right"
    );
}
function isEditorActive() {
    const ed = window.textEditorNew;
    if (!ed) return false;
    const visible = ed.isConnected && ed.offsetParent !== null && ed.style.display !== 'none';
    const sel = window.getSelection && window.getSelection();
    const inEd = sel && sel.rangeCount && ed.contains(sel.anchorNode);
    return visible && inEd;
}

function getSelectedObj() {
    return Array.isArray(window.textObjects) ? textObjects.find(o => o.selected) : null;
}

function isEditorVisible(ed) {
    return ed && ed.isConnected && ed.style.display !== 'none' && ed.offsetParent !== null;
}

function ChangeFontSizeOld(val) {
    // normalize to px
    const px = /px$/i.test(val) ? val : (parseInt(val, 10) || 16) + 'px';

    const Obj = (typeof textObjects !== "undefined") ? textObjects.find(o => o.selected) : null;
    if (Obj) Obj.fontSize = parseInt(px, 10); // optional meta sync like your color meta

    if (!activeBox) return;

    if (isEditing) {
        // ----- EDITING: apply to current selection, then persist -----
        textEditorNew.focus();
        restoreSelection(); // same as your color path

        // Try your existing helper first (camelCase); if it returns falsy, try hyphen case
        let span = applySelectionStyleReplace?.("fontSize", px);
        if (!span && typeof applySelectionStyleReplace === "function") {
            span = applySelectionStyleReplace("font-size", px);
        }

        // Keep DOM clean like you do for color
        if (typeof normalizeEditorInPlace === "function") {
            normalizeEditorInPlace(textEditorNew, span);
        }

        // Persist RAW html back to models (this is what updates textObjects.html)
        activeBox.text = textEditorNew.innerHTML;
        if (Obj) Obj.text = activeBox.text;
    } else {
        // ----- NOT EDITING: apply to entire box html, then persist -----
        applyFontSizeToWholeBox(px);
        if (Obj) Obj.text = activeBox.text;
    }

    drawText();
    console.log("change", textObjects);
}
function ChangeFontSizeOLD1(val) {
    const px = /px$/i.test(val) ? val : (parseInt(val, 10) || 16) + 'px';
    const Obj = Array.isArray(textObjects) ? textObjects.find(o => o.selected) : null;
    if (Obj) Obj.fontSize = parseInt(px, 10);
    if (!activeBox) return;

    // Are we editing and do we have a valid range?
    const ed = textEditorNew;
    const hasRange =
        !!_lastEditorRange &&
        ed && ed.isConnected &&
        ed.contains(_lastEditorRange.commonAncestorContainer);

    if (isEditing && hasRange) {
        ed.focus();

        // restore the saved range
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(_lastEditorRange);

        // try your helper; if it returns falsy, do a robust manual wrap
        let ok = false;
        if (typeof applySelectionStyleReplace === 'function') {
            ok = !!(applySelectionStyleReplace('fontSize', px) ||
                applySelectionStyleReplace('font-size', px));
        }
        if (!ok) {
            // manual surround
            const r = sel.getRangeAt(0);
            if (!r.collapsed) {
                const span = document.createElement('span');
                span.style.fontSize = px;
                const frag = r.extractContents();
                span.appendChild(frag);
                r.insertNode(span);

                // move caret after and re-capture for next time
                sel.removeAllRanges();
                const after = document.createRange();
                after.setStartAfter(span); after.collapse(true);
                sel.addRange(after);
                _lastEditorRange = after.cloneRange();
                ok = true;
            }
        }

        // normalize (if you have it), persist, redraw
        if (ok) {
            if (typeof normalizeEditorInPlace === 'function') normalizeEditorInPlace(ed);
            activeBox.text = ed.innerHTML;
            if (Obj) Obj.text = activeBox.text;
            drawText();
            console.log("size", textObjects);
        }
        return;
    }

    // Not editing or no valid range → apply to whole box
    applyFontSizeToWholeBox(px);
    if (Obj) Obj.text = activeBox.text;
    drawText();
}
// tiny helpers (put once near your editor code)
function blockOf(node, editor) {
    if (!node) return null;
    let n = (node.nodeType === 3) ? node.parentNode : node;
    while (n && n.parentNode && n.parentNode !== editor) n = n.parentNode;
    return (n && n.parentNode === editor) ? n : null;
}
function selectionIsSingleBlock(ed, range) {
    const b1 = blockOf(range.startContainer, ed);
    const b2 = blockOf(range.endContainer, ed);
    return b1 && b1 === b2;
}
function resizeEditorToContent(ed, box) {
    if (!ed || !box) return;
    ed.style.boxSizing = "border-box";
    ed.style.whiteSpace = "normal";
    ed.style.wordBreak = "break-word";
    ed.style.overflowWrap = "break-word";
    ed.style.width = Math.max(1, Math.round(box.width || 0)) + "px";
    ed.style.minWidth = ed.style.width;
    ed.style.maxWidth = ed.style.width;
    requestAnimationFrame(() => {
        ed.style.height = "auto";
        const minH = Math.max(1, Math.round(box.height || 0));
        ed.style.height = Math.max(minH, ed.scrollHeight) + "px";
    });
}

function ChangeFontSize(val) {
    const px = /px$/i.test(val) ? val : (parseInt(val, 10) || 16) + 'px';
    const Obj = Array.isArray(textObjects) ? textObjects.find(o => o.selected) : null;
    if (Obj) Obj.fontSize = parseInt(px, 10);
    if (!activeBox) return;

    const ed = textEditorNew;
    const hasRange =
        !!_lastEditorRange &&
        ed && ed.isConnected &&
        ed.contains(_lastEditorRange.commonAncestorContainer);

    if (isEditing && hasRange) {
        ed.focus();

        // restore saved range
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(_lastEditorRange);

        let ok = false;

        // try your helper first
        if (typeof applySelectionStyleReplace === 'function') {
            ok = !!(applySelectionStyleReplace('fontSize', px) ||
                applySelectionStyleReplace('font-size', px));
        }

        // manual surround ONLY if selection is within one editor block
        if (!ok) {
            const r = sel.getRangeAt(0);
            if (!r.collapsed && selectionIsSingleBlock(ed, r)) {
                const span = document.createElement('span');
                span.style.fontSize = px;
                const frag = r.extractContents();
                span.appendChild(frag);
                r.insertNode(span);

                // move caret after and re-capture
                sel.removeAllRanges();
                const after = document.createRange();
                after.setStartAfter(span); after.collapse(true);
                sel.addRange(after);
                _lastEditorRange = after.cloneRange();
                ok = true;
            }
        }

        if (ok) {
            if (typeof normalizeEditorInPlace === 'function') normalizeEditorInPlace(ed);
            activeBox.text = ed.innerHTML;
            if (Obj) Obj.text = activeBox.text;

            // keep editor height in sync with new wrapping
            resizeEditorToContent(ed, activeBox);
            drawText();
        }
        return;
    }

    // Not editing or no valid range → apply to whole box
    applyFontSizeToWholeBox(px);
    if (Obj) Obj.text = activeBox.text;
    // also keep editor sized if it's visible
    if (ed) resizeEditorToContent(ed, activeBox);
    drawText();
}

function applyFontSizeToWholeBox(px) {
    const container = document.createElement("div");
    container.innerHTML = activeBox.text || "";

    // Prefer updating existing spans so we don’t overwrite other per-char styles
    const spans = container.querySelectorAll("span");
    if (spans.length > 0) {
        spans.forEach(s => { s.style.fontSize = px; });
    } else {
        // No spans? wrap content once so size persists (like your color fallback)
        const wrap = document.createElement("div");
        const span = document.createElement("span");
        span.style.fontSize = px;
        span.innerHTML = container.innerHTML;
        wrap.appendChild(span);
        container.innerHTML = wrap.innerHTML;
    }

    // optional: use your sanitizer to avoid unnecessary extra wrapper on single line
    if (typeof sanitizeSingleLine === "function") {
        container.innerHTML = sanitizeSingleLine(container.innerHTML);
    }

    activeBox.text = container.innerHTML; // <-- PERSIST
}



function applyFontSizeToSelection(sizePx) {
    const ed = textEditorNew;
    const sel = window.getSelection();
    if (!ed || !sel || !sel.rangeCount) return false;

    const range = sel.getRangeAt(0);
    if (!ed.contains(range.commonAncestorContainer) || range.collapsed) return false;

    const span = document.createElement('span');
    span.style.fontSize = sizePx;

    // Robust surround
    const frag = range.extractContents();
    span.appendChild(frag);
    range.insertNode(span);

    // merge adjacent same-size spans to avoid fragmentation
    mergeAdjacentSameStyleSpan(span, 'fontSize');

    // caret after inserted span
    sel.removeAllRanges();
    const r = document.createRange();
    r.setStartAfter(span);
    r.collapse(true);
    sel.addRange(r);
    return true;
}

function mergeAdjacentSameStyleSpan(node, styleKey) {
    if (!node || node.nodeType !== 1 || node.tagName !== 'SPAN') return;
    const val = node.style[styleKey];

    // left
    let prev = node.previousSibling;
    while (prev && prev.nodeType === 3 && !prev.nodeValue.trim()) prev = prev.previousSibling;
    if (prev && prev.nodeType === 1 && prev.tagName === 'SPAN' && prev.style[styleKey] === val) {
        while (node.firstChild) prev.appendChild(node.firstChild);
        node.parentNode.removeChild(node);
        node = prev;
    }
    // right
    let next = node.nextSibling;
    while (next && next.nodeType === 3 && !next.nodeValue.trim()) next = next.nextSibling;
    if (next && next.nodeType === 1 && next.tagName === 'SPAN' && next.style[styleKey] === val) {
        while (next.firstChild) node.appendChild(next.firstChild);
        next.parentNode.removeChild(next);
    }
}


// Merge prev/next sibling spans if they have identical font-size styles.
function mergeAdjacentFontSizeSpans(node) {
    if (!node || node.nodeType !== 1) return;
    const getSize = el => (el && el.nodeType === 1 && el.tagName === 'SPAN')
        ? (el.style && el.style.fontSize) : null;

    // merge left
    let prev = node.previousSibling;
    while (prev && prev.nodeType === 3 && !prev.nodeValue.trim()) prev = prev.previousSibling;
    if (prev && prev.nodeType === 1 && prev.tagName === 'SPAN' && getSize(prev) === getSize(node)) {
        // append node's children into prev and remove node
        while (node.firstChild) prev.appendChild(node.firstChild);
        node.parentNode.removeChild(node);
        node = prev; // merged node becomes prev
    }

    // merge right
    let next = node.nextSibling;
    while (next && next.nodeType === 3 && !next.nodeValue.trim()) next = next.nextSibling;
    if (next && next.nodeType === 1 && next.tagName === 'SPAN' && getSize(next) === getSize(node)) {
        while (next.firstChild) node.appendChild(next.firstChild);
        next.parentNode.removeChild(next);
    }
}

function setAllSpanFontSizes(html, px) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html || '';

    const spans = tmp.querySelectorAll('span');
    if (spans.length) {
        spans.forEach(s => { s.style.fontSize = px; });
    } else {
        // if no spans exist, wrap text nodes so font-size can persist
        Array.from(tmp.childNodes).forEach(n => {
            if (n.nodeType === 3 && n.nodeValue.trim()) {
                const wrap = document.createElement('span');
                wrap.style.fontSize = px;
                n.parentNode.insertBefore(wrap, n);
                wrap.appendChild(n);
            }
        });
    }
    return tmp.innerHTML;
}


function insertTabIntoEditor(ed) {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    const r = sel.getRangeAt(0);
    if (!ed.contains(r.commonAncestorContainer)) return;

    const tabText = '\u00A0\u00A0\u00A0\u00A0'; // 4 spaces (non-breaking)
    const node = document.createTextNode(tabText);

    r.deleteContents();
    r.insertNode(node);

    // place caret after the inserted spaces
    sel.removeAllRanges();
    const after = document.createRange();
    after.setStartAfter(node);
    after.collapse(true);
    sel.addRange(after);

    // keep your models/canvas in sync
    if (window.activeBox) activeBox.text = ed.innerHTML;
    if (typeof drawText === 'function') drawText();
    if (typeof captureEditorRange === 'function') captureEditorRange();
}

function enableEditorKeyboard() {
    const ed = window.textEditorNew;
    if (!ed) return;

    ed.setAttribute('contenteditable', 'true');
    // ed.setAttribute('tabindex', '0');
    ed.spellcheck = false;
    ed.autocapitalize = 'off';
    ed.autocomplete = 'off';
    ed.autocorrect = 'off';

    // TAB should insert spaces inside the editor
    ed.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            insertTabIntoEditor(ed);
        }
    }, true);
}
function getBoxRect(box) {
    const w = (typeof box.width === 'number') ? box.width : (box.boundingWidth || 0);
    const h = (typeof box.height === 'number') ? box.height : (box.boundingHeight || 0);
    return { x: box.x, y: box.y, w, h, cx: box.x + w / 2, cy: box.y + h / 2 };
}

function syncTextDims(box) {
    if (box?.type === 'text') {
        if (typeof box.width === 'number') box.boundingWidth = box.width;
        if (typeof box.height === 'number') box.boundingHeight = box.height;
    }
}


function drawRotatedSelection(ctx, box) {
    const { w, h, cx, cy } = getBoxRect(box);
    const ang = deg2rad(box.rotation || 0);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(ang);

    ctx.strokeStyle = "red";
    ctx.lineWidth = 1;
    ctx.strokeRect(-w / 2, -h / 2, w, h);

    ctx.fillStyle = "blue";
    const s = HANDLE_SIZE, hs = s / 2, w2 = w / 2, h2 = h / 2;

    // name each handle so we can filter
    const handlesNamed = [
        ['tl', -w2, -h2], ['t', 0, -h2], ['tr', w2, -h2], // top row
        ['r', w2, 0],                                   // right mid
        ['br', w2, h2], ['b', 0, h2], ['bl', -w2, h2], // bottom row
        ['l', -w2, 0]                                    // left mid
    ];

    const allowed = __allowedHandlesFor(box); // ← NEW

    for (const [name, hx, hy] of handlesNamed) {
        if (!allowed.has(name)) continue;       // ← hide disallowed handles for line items
        ctx.fillRect(hx - hs, hy - hs, s, s);
    }

    ctx.restore();

    // (optional) expose which ones we drew—some hit-tests can reuse this
    box.__visibleHandles = allowed;
}

function getResizeHandleRotated(box, mx, my) {
    const { w, h, cx, cy } = getBoxRect(box);
    const ang = deg2rad(box.rotation || 0);

    // world → local (inverse rotate about center)
    const dx = mx - cx, dy = my - cy;
    const cos = Math.cos(-ang), sin = Math.sin(-ang);
    const lx = cos * dx - sin * dy;
    const ly = sin * dx + cos * dy;

    // handle positions in local space
    const w2 = w / 2, h2 = h / 2;
    const hs = HANDLE_SIZE + 2; // tolerance
    const handles = {
        tl: { x: -w2, y: -h2 }, t: { x: 0, y: -h2 }, tr: { x: w2, y: -h2 },
        r: { x: w2, y: 0 }, br: { x: w2, y: h2 }, b: { x: 0, y: h2 },
        bl: { x: -w2, y: h2 }, l: { x: -w2, y: 0 }
    };

    for (const [name, p] of Object.entries(handles)) {
        if (Math.abs(lx - p.x) <= hs && Math.abs(ly - p.y) <= hs) return name;
    }
    return null;
}
// called when text side-resize starts
function startTextSideResize(box) {
    const { w, h, cx, cy } = getBoxRect(box);
    box._rs = { w, h, cx, cy, ang: deg2rad(box.rotation || 0) };
}

// called on mousemove to update width + top-left while keeping the opposite edge anchored
function resizeTextSideToMouse(box, handle, mx, my) {
    const rs = box._rs; if (!rs) return;

    // mouse to LOCAL (relative to original center at mousedown)
    const dx = mx - rs.cx, dy = my - rs.cy;
    const cosa = Math.cos(-rs.ang), sina = Math.sin(-rs.ang);
    const lx = cosa * dx - sina * dy;  // local X
    // const ly =  sina * dx + cosa * dy;  // (unused)

    const minW = 10;
    let newW, dCenterLocal; // shift of center along local X to keep opposite edge anchored

    if (handle === 'r') {
        // right handle moves to mouse x; left edge stays where it was (-rs.w/2)
        newW = Math.max(minW, lx - (-rs.w / 2));
        dCenterLocal = (newW - rs.w) / 2;            // center moves +X half the delta
    } else if (handle === 'l') {
        // left handle moves; right edge stays at +rs.w/2
        newW = Math.max(minW, (rs.w / 2) - lx);
        dCenterLocal = -(newW - rs.w) / 2;           // center moves -X half the delta
    } else {
        return; // only l/r here
    }

    // LOCAL center shift → WORLD
    const cosw = Math.cos(rs.ang), sinw = Math.sin(rs.ang);
    const newCx = rs.cx + cosw * dCenterLocal;     // (local y shift is 0)
    const newCy = rs.cy + sinw * dCenterLocal;

    // update box geometry
    box.width = newW;
    box.x = newCx - newW / 2;
    box.y = rs.cy - rs.h / 2;                      // height unchanged for l/r
    syncTextDims(box);
}
let _edRO; // ResizeObserver for the editor

function mountEditorOverBox(box) {
    const ed = textEditorNew;
    if (!ed || !box) return;

    // position and width
    ed.style.left = box.x + 'px';
    ed.style.top = box.y + 'px';
    ed.style.width = Math.max(10, box.width) + 'px';
    ed.style.minHeight = Math.max(10, box.height) + 'px';
    ed.style.height = 'auto';

    // start observing size changes to keep box.height in sync
    if (!_edRO) {
        _edRO = new ResizeObserver(() => {
            if (!isEditing || !activeBox) return;
            const h = Math.ceil(ed.getBoundingClientRect().height);
            activeBox.height = activeBox.boundingHeight = h;
            drawText();
        });
        _edRO.observe(ed);
    }

    // grow once now
    autoGrowEditor(true);
    // keep growing while typing/pasting
    ed.addEventListener('input', () => autoGrowEditor(true), { passive: true });
    ed.addEventListener('keyup', () => autoGrowEditor(true), { passive: true });
}

function autoGrowEditor(commitToBox = true) {
    const ed = textEditorNew;
    if (!ed) return;
    // measure natural height
    ed.style.height = 'auto';
    const h = Math.ceil(ed.scrollHeight);
    // keep at least the box min-height
    const minH = activeBox ? Math.max(10, activeBox.height || 0) : 10;
    const finalH = Math.max(h, minH);
    ed.style.height = finalH + 'px';

    if (commitToBox && activeBox) {
        activeBox.height = activeBox.boundingHeight = finalH;
    }
}
function quoteFont(ff) { return /["',\s]/.test(ff) ? `"${ff}"` : ff; }

async function afterTextStyleChanged(maybeFontFamily) {
    // If a font changes, wait for it so wrapping is correct
    try {
        if (maybeFontFamily) {
            const px = activeBox?.fontSize || 16;
            await document.fonts.load(`${px}px ${quoteFont(maybeFontFamily)}`);
        }
        await document.fonts.ready;
    } catch { }

    autoGrowEditor(true);  // resize editor + sync box.height
    if (activeBox && textEditorNew) activeBox.text = textEditorNew.innerHTML;
    if (typeof invalidateTextRaster === 'function') invalidateTextRaster(activeBox);
    drawText();
}
function beginEdit(box) {
    isEditing = true;
    activeBox = box;
    textEditorNew.innerHTML = box.text || '';
    mountEditorOverBox(box);
    textEditorNew.focus();
    autoGrowEditor(true); // initial sync
}

function closestBlock(node) {
    while (node && node !== textEditorNew) {
        if (node.nodeType === 1) {
            const d = window.getComputedStyle(node).display;
            if (d === 'block' || d === 'list-item' || d === 'table') return node;
            if (node.tagName === 'DIV' || node.tagName === 'P' || node.tagName === 'LI') return node;
        }
        node = node.parentNode;
    }
    return textEditorNew;
}

function selectionCrossesBlocks(ed) {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return false;
    const r = sel.getRangeAt(0);
    if (r.collapsed) return false;
    return closestBlock(r.startContainer) !== closestBlock(r.endContainer);
}

function resizeEditorToContentOld(ed, box) {
    // keep width; only grow height to fit
    ed.style.height = 'auto';
    const h = Math.ceil(ed.scrollHeight);
    ed.style.height = h + 'px';
    // reflect back to box so canvas matches when you save/close
    if (box) {
        box.height = h;
        box.boundingHeight = h;
    }
}

function applyInlineStyleSafe(prop, value) {
    // Prefer browser to apply inline styling without changing block structure.
    try { document.execCommand('styleWithCSS', true); } catch (_e) { }
    switch (prop) {
        case 'color':
            return document.execCommand('foreColor', false, value);
        case 'fontFamily':
            // Most browsers map to <font face=""> and then to CSS.
            return document.execCommand('fontName', false, value);
        default:
            return false;
    }
}

function wrapSelectionInSpan(styleCb) {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return false;
    const r = sel.getRangeAt(0);
    if (r.collapsed) return false;

    // Surround only if range stays within a single block;
    // otherwise return false so caller can fall back to execCommand.
    if (selectionCrossesBlocks(textEditorNew)) return false;

    const span = document.createElement('span');
    styleCb(span);
    span.appendChild(r.extractContents());
    r.insertNode(span);

    // move caret after span & save
    sel.removeAllRanges();
    const after = document.createRange();
    after.setStartAfter(span); after.collapse(true);
    sel.addRange(after);
    window._lastEditorRange = after.cloneRange();
    return true;
}
function beginMultiDrag(e, mx, my) {
    multiDragTargets = getSelectionItem();
    if (multiDragTargets.length < 2) return false;   // only when 2+ are selected
    isDraggingMulti = true;
    multiDragDidMove = false;
    multiDragStart = { x: mx, y: my };
    multiDragLast = { x: mx, y: my };
    multiDragOffsets = multiDragTargets.map(o => ({ o, startX: o.x, startY: o.y }));
    return true;
}


function updateMultiDrag(mx, my) {
    if (!isDraggingMulti) return;
    const dx = mx - multiDragLast.x;
    const dy = my - multiDragLast.y;

    if (!multiDragDidMove) {
        const tdx = mx - multiDragStart.x, tdy = my - multiDragStart.y;
        if (Math.abs(tdx) >= MULTI_DRAG_THRESHOLD || Math.abs(tdy) >= MULTI_DRAG_THRESHOLD) multiDragDidMove = true;
    }
    if (dx === 0 && dy === 0) return;

    multiDragTargets.forEach(o => { o.x += dx; o.y += dy; });
    multiDragLast = { x: mx, y: my };
    redraw();
}
function endMultiDrag(commit = true) {
    if (!isDraggingMulti) return;
    if (!multiDragDidMove || !commit) {
        multiDragOffsets.forEach(({ o, startX, startY }) => { o.x = startX; o.y = startY; });
        redraw();
    }
    isDraggingMulti = false;
    multiDragTargets = [];
    multiDragOffsets = [];
}
function ensureEditorWrapping(root = textEditorNew) {
    if (!root) return;
    root.style.whiteSpace = 'pre-wrap'; // the editor root must wrap
    root.querySelectorAll(':scope > div').forEach(d => {
        if (d.style.display !== 'block') d.style.display = 'block';
        if (d.style.whiteSpace && d.style.whiteSpace.toLowerCase() === 'nowrap') {
            d.style.whiteSpace = 'pre-wrap';
        }
    });
    // remove accidental nowrap on descendants (from style buttons etc.)
    root.querySelectorAll('[style*="white-space"]').forEach(el => {
        if ((el.style.whiteSpace || '').toLowerCase() === 'nowrap') el.style.whiteSpace = '';
    });
}

// Safely apply a font-family to the WHOLE BOX without breaking line <div>s
function applyFontFamilyToWholeBoxHTML(html, fontFamily) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html || '';

    const topLines = tmp.querySelectorAll(':scope > div');
    const targets = topLines.length ? topLines : [tmp]; // if no lines, treat root as a single line

    targets.forEach(div => {
        // if it already has a single span, just update it
        const onlyChild = div.childNodes.length === 1 && div.firstChild?.nodeType === 1 && div.firstChild.tagName === 'SPAN';
        if (onlyChild) {
            div.firstChild.style.fontFamily = fontFamily;
        } else {
            // wrap the line's content in a span (valid: DIV > SPAN > inline...)
            const sp = document.createElement('span');
            sp.style.fontFamily = fontFamily;
            while (div.firstChild) sp.appendChild(div.firstChild);
            div.appendChild(sp);
        }
    });

    return tmp.innerHTML;
}

// Hoist any nested <div> blocks so the editor root has only top-level lines.
function hoistNestedLines(root) {
    if (!root) return;

    // Keep hoisting until no nested blocks remain
    let moved;
    do {
        moved = false;
        const topLines = Array.from(root.children).filter(el => el.tagName === 'DIV');
        for (const line of topLines) {
            const nestedBlocks = Array.from(line.children).filter(el => el.tagName === 'DIV');
            for (const block of nestedBlocks) {
                const newLine = document.createElement('div');
                while (block.firstChild) newLine.appendChild(block.firstChild);
                line.parentNode.insertBefore(newLine, line.nextSibling);
                block.remove();
                moved = true;
            }
        }
    } while (moved);

    // Normalize truly empty lines → <div><br></div>
    Array.from(root.children).forEach(d => {
        if (d.tagName === 'DIV' && d.textContent.trim() === '' && d.children.length === 0) {
            d.appendChild(document.createElement('br'));
        }
    });
}
function hoistNestedLines(root) {
    if (!root) return;

    const topLines = Array.from(root.children).filter(el => el.tagName === 'DIV');

    topLines.forEach(line => {
        // moving anchor so order is preserved
        let anchor = line;
        const nestedBlocks = Array.from(line.children).filter(el => el.tagName === 'DIV');
        nestedBlocks.forEach(block => {
            const newLine = document.createElement('div');
            while (block.firstChild) newLine.appendChild(block.firstChild);
            anchor.parentNode.insertBefore(newLine, anchor.nextSibling);
            anchor = newLine;        // advance anchor to keep A,B,C order
            block.remove();
        });
    });

    // normalize truly empty lines
    Array.from(root.children).forEach(d => {
        if (d.tagName === 'DIV' && d.textContent.trim() === '' && d.children.length === 0) {
            d.appendChild(document.createElement('br'));
        }
    });
}
function bakeInlineFontOnLinesHTML(html, refEl) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html || '';

    const cs = refEl ? getComputedStyle(refEl) : null;
    const fs = cs ? cs.fontSize : '16px';
    const ff = cs ? cs.fontFamily : 'Arial Regular';
    const fw = cs ? cs.fontWeight : 'normal';
    const fst = cs ? cs.fontStyle : 'normal';
    const col = cs ? cs.color : '#000';

    // ensure each top-level line is <div>…</div>
    const top = tmp.children.length ? Array.from(tmp.children) : [tmp];

    top.forEach(div => {
        if (div.tagName !== 'DIV') return;

        // already a span with font-size? leave it
        const span = (div.children.length === 1 && div.firstElementChild.tagName === 'SPAN')
            ? div.firstElementChild
            : null;

        if (span) {
            // if span lacks inline font-size, bake it in
            const st = span.style;
            if (!st.fontSize) st.fontSize = fs;
            if (!st.fontFamily) st.fontFamily = ff;
            if (!st.fontWeight) st.fontWeight = fw;
            if (!st.fontStyle) st.fontStyle = fst;
            if (!st.color) st.color = col;
            return;
        }

        // wrap existing nodes in a span with inline font styles
        const sp = document.createElement('span');
        sp.style.fontSize = fs;
        sp.style.fontFamily = ff;
        sp.style.fontWeight = fw;
        sp.style.fontStyle = fst;
        sp.style.color = col;

        while (div.firstChild) sp.appendChild(div.firstChild);
        div.appendChild(sp);
    });

    return tmp.innerHTML;
}
// === NEW: block-aware check; only DIV/P/LI/Hx/etc are "blocks" (SPANs never) ===
function selectionWithinSingleBlock(root, rng) {
    if (!root || !rng) return false;
    const blockTags = new Set(["DIV", "P", "LI", "H1", "H2", "H3", "H4", "H5", "H6"]);
    const getBlock = (node) => {
        let n = (node && node.nodeType === 3) ? node.parentNode : node;
        while (n && n !== root) {
            if (n.nodeType === 1 && blockTags.has(n.tagName)) return n;
            n = n.parentNode;
        }
        return root; // treat editor root as a block boundary fallback
    };
    const startBlock = getBlock(rng.startContainer);
    const endBlock = getBlock(rng.endContainer);
    return startBlock === endBlock;
}

// === NEW: get a live DOM Range from char offsets ===
function getLiveRangeFromCharOffsets(root, charSel) {
    if (!root || !charSel) return null;
    if (!setSelectionByCharacterOffsets(root, charSel.start, charSel.end)) return null;
    const s = window.getSelection();
    return (s && s.rangeCount) ? s.getRangeAt(0).cloneRange() : null;
}

// === NEW: wrap exact text portions inside the range with <span style="color:... !important"> ===
// This is the "surgical" per-text-node path to avoid coloring everything.
function colorizeRangePrecisely(root, charSel, color) {
    const rng = getLiveRangeFromCharOffsets(root, charSel);
    if (!rng) return false;

    // Walk text nodes intersecting the selection and wrap only their overlapping slices.
    const walker = document.createTreeWalker(
        rng.commonAncestorContainer,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode(node) {
                // only consider nodes in editor and that intersect rng
                if (!root.contains(node)) return NodeFilter.FILTER_REJECT;
                try {
                    // Quick check: make a temp range covering this node to test intersection
                    const tr = document.createRange();
                    tr.selectNodeContents(node);
                    const intersects = rng.compareBoundaryPoints(Range.END_TO_START, tr) < 0 &&
                        rng.compareBoundaryPoints(Range.START_TO_END, tr) > 0;
                    return intersects ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
                } catch (_) { return NodeFilter.FILTER_REJECT; }
            }
        },
        false
    );

    const toWrap = [];

    // Collect exact sub-ranges to wrap (we’ll create small ranges per node)
    while (walker.nextNode()) {
        const node = walker.currentNode;
        // Build a subrange = intersection(rng, nodeTextRange)
        const sub = document.createRange();
        sub.selectNodeContents(node);

        // Clamp sub to rng boundaries
        if (sub.compareBoundaryPoints(Range.START_TO_START, rng) < 0) {
            sub.setStart(rng.startContainer, rng.startOffset);
        }
        if (sub.compareBoundaryPoints(Range.END_TO_END, rng) > 0) {
            sub.setEnd(rng.endContainer, rng.endOffset);
        }

        // Ensure it's inside this text node (selection may start/end in other nodes)
        if (sub.startContainer !== node) {
            sub.setStart(node, 0);
        }
        if (sub.endContainer !== node) {
            sub.setEnd(node, node.nodeValue.length);
        }

        if (!sub.collapsed) toWrap.push(sub);
    }

    // Wrap from last to first to avoid range invalidation while mutating
    for (let i = toWrap.length - 1; i >= 0; i--) {
        const r = toWrap[i];
        // Extract the exact text slice and wrap it
        const span = document.createElement("span");
        span.setAttribute("data-color-root", "1");
        span.style.setProperty("color", color, "important");
        try {
            const frag = r.extractContents();
            span.appendChild(frag);
            r.insertNode(span);
        } catch (_) {
            // Fall back: split text manually (rare)
            const textNode = r.startContainer;
            if (textNode && textNode.nodeType === 3) {
                const full = textNode.nodeValue;
                const a = full.slice(0, r.startOffset);
                const b = full.slice(r.startOffset, r.endOffset);
                const c = full.slice(r.endOffset);
                const parent = textNode.parentNode;
                const span2 = document.createElement("span");
                span2.setAttribute("data-color-root", "1");
                span2.style.setProperty("color", color, "important");
                span2.textContent = b;
                if (a) parent.insertBefore(document.createTextNode(a), textNode);
                parent.insertBefore(span2, textNode);
                if (c) parent.insertBefore(document.createTextNode(c), textNode);
                parent.removeChild(textNode);
            }
        }
    }

    return toWrap.length > 0;
}


// REPLACE your stripInlineColorInRange with this version
function stripInlineColorInRange(root, rng) {
    if (!root || !rng) return;

    const walker = document.createTreeWalker(
        rng.commonAncestorContainer,
        NodeFilter.SHOW_ELEMENT,
        {
            acceptNode(el) {
                if (!root.contains(el)) return NodeFilter.FILTER_REJECT;
                return rng.intersectsNode(el) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
            }
        }
    );

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach(el => {
        if (el.hasAttribute && el.hasAttribute('data-color-root')) return;

        // ✅ do NOT touch block elements unless the selection fully covers them
        if (__isBlockTag(el.tagName)) {
            try {
                const er = document.createRange();
                er.selectNodeContents(el);
                const fullyCovered =
                    rng.compareBoundaryPoints(Range.START_TO_START, er) <= 0 &&
                    rng.compareBoundaryPoints(Range.END_TO_END, er) >= 0;
                if (!fullyCovered) return; // skip partial-cover blocks
            } catch (_) { return; }
        }

        const st = el.getAttribute && el.getAttribute("style");
        if (!st) return;
        const cleaned = st
            .split(";")
            .map(s => s.trim())
            .filter(s => s && !/^color\s*:/.test(s))
            .join("; ");
        if (cleaned) el.setAttribute("style", cleaned);
        else el.removeAttribute("style");
    });
}
// helper: block tag check
function __isBlockTag(tag) {
    return ["DIV", "P", "LI", "UL", "OL", "H1", "H2", "H3", "H4", "H5", "H6", "TABLE", "THEAD", "TBODY", "TFOOT", "TR", "TD", "TH"].includes(tag);
}
// ✅ ADD: keep the live caret cached so the next paste appends instead of replacing
function __saveLiveCaretRange(root) {
    try {
        const s = window.getSelection && window.getSelection();
        if (s && s.rangeCount) {
            const r = s.getRangeAt(0);
            if (root && root.contains(r.commonAncestorContainer)) {
                window._lastEditorRange = r.cloneRange();
            }
        }
    } catch (_) { }
}

// ✅ ADD: treat only truly-empty lines as empty (preserve &nbsp;)
function __normalizeEmptyLinesPreservingNBSP(root) {
    if (!root) return;
    Array.from(root.children).forEach(d => {
        if (d.tagName !== 'DIV') return;
        const textNoZW = (d.textContent || "").replace(/\u200B/g, "");     // remove zero-width only
        const asciiOnly = textNoZW.replace(/[ \t\r\n]/g, "");               // strip ASCII whitespace, keep \u00A0
        const hasNBSP = /\u00A0/.test(d.innerHTML);
        const isTrulyEmpty = !asciiOnly && !hasNBSP && d.children.length === 0;
        if (isTrulyEmpty && !d.querySelector('br')) d.appendChild(document.createElement('br'));
    });
}
// ✅ ADD: keep cached caret in sync after any input so next paste lands at the right place
//textEditorNew.addEventListener('input', () => {
//    requestAnimationFrame(() => {
//        __normalizeEmptyLinesPreservingNBSP(textEditorNew);
//        __saveLiveCaretRange(textEditorNew);
//    });
//});

// ✅ ADD: also track selection changes driven by mouse/keyboard
document.addEventListener('selectionchange', () => {
    __saveLiveCaretRange(textEditorNew);
});
//function applySvgCurvature(targetImage, radiusPx, strokeWidthOpt) {
//    if (!targetImage) return;

//    const svgUrl = targetImage.originalSrc || targetImage.src || "";
//    const isSvg = svgUrl.toLowerCase().endsWith(".svg") || svgUrl.startsWith("data:image/svg+xml");
//    if (!isSvg || !targetImage.img) { console.warn("Target is not an SVG"); return; }

//    // read stroke width from dropdown if not provided
//    let sw = strokeWidthOpt;
//    if (!Number.isFinite(sw)) {
//        const swEl = document.getElementById("ddlStrokeWidth");
//        sw = parseFloat(swEl?.value);
//    }
//    if (!Number.isFinite(sw)) sw = 0;
//    targetImage.strokeWidth = sw;              // persist on object
//    $("#hdnStrokeWidth").val(String(sw));      // keep UI in sync

//    // race guard
//    targetImage._curveJobId = (targetImage._curveJobId || 0) + 1;
//    const myJob = targetImage._curveJobId;

//    const origW = targetImage.width, origH = targetImage.height;

//    function patchCurvature(svgText) {
//        const doc = new DOMParser().parseFromString(svgText, "image/svg+xml");
//        const svg = doc.documentElement;

//        // if we’re changing stroke width, avoid clipping by expanding viewBox
//        if (sw > 0) {
//            svg.setAttribute("overflow", "visible");
//            let vb = svg.getAttribute("viewBox");
//            if (!vb) vb = `0 0 ${origW} ${origH}`;
//            let [x, y, w, h] = vb.split(/\s+|,/).map(Number);
//            const pad = sw / 2;
//            svg.setAttribute("viewBox", `${x - pad} ${y - pad} ${w + 2 * pad} ${h + 2 * pad}`);
//        }

//        // 1) Round joints/caps when radius > 0
//        const PAINT_TAGS = new Set(["path", "rect", "circle", "ellipse", "polygon", "polyline", "line", "g", "use", "text"]);
//        svg.querySelectorAll("*").forEach(el => {
//            if (!PAINT_TAGS.has(el.tagName.toLowerCase())) return;
//            if (radiusPx > 0) {
//                el.setAttribute("stroke-linejoin", "round");
//                el.setAttribute("stroke-linecap", "round");
//                el.setAttribute("stroke-miterlimit", "1");
//            } else {
//                el.removeAttribute("stroke-linejoin");
//                el.removeAttribute("stroke-linecap");
//                el.removeAttribute("stroke-miterlimit");
//            }
//            // apply dropdown stroke width (even if stroke is 'none', harmless)
//            el.setAttribute("stroke-width", String(sw));
//        });

//        // 2) True rounded corners for <rect>
//        svg.querySelectorAll("rect").forEach(rect => {
//            const w = parseFloat(rect.getAttribute("width") || "0");
//            const h = parseFloat(rect.getAttribute("height") || "0");
//            const maxR = Math.max(0, Math.min(radiusPx, Math.min(w, h) / 2));
//            if (maxR > 0) {
//                rect.setAttribute("rx", maxR);
//                rect.setAttribute("ry", maxR);
//            } else {
//                rect.removeAttribute("rx");
//                rect.removeAttribute("ry");
//            }
//        });

//        return new XMLSerializer().serializeToString(doc);
//    }

//    function redraw(svgText) {
//        if (myJob !== targetImage._curveJobId) return;
//        const uri = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgText);
//        const imgEl = targetImage.img;

//        imgEl.onload = () => {
//            if (myJob !== targetImage._curveJobId) return;
//            targetImage.width = origW;
//            targetImage.height = origH;
//            targetImage.src = uri;
//            drawText?.();
//        };
//        imgEl.onerror = () => console.warn("Curvature apply failed:", targetImage.originalSrc || targetImage.src);

//        imgEl.src = uri;
//    }

//    // Source resolution (use cached original if available)
//    const have = targetImage.originalSVG;
//    if (have) { redraw(patchCurvature(have)); return; }

//    if (svgUrl.startsWith("data:image/svg+xml")) {
//        const afterComma = svgUrl.split(",")[1] || "";
//        let raw = "";
//        if (/;base64/i.test(svgUrl)) { try { raw = atob(afterComma); } catch { } }
//        else { try { raw = decodeURIComponent(afterComma); } catch { } }
//        if (raw) { targetImage.originalSVG = raw; redraw(patchCurvature(raw)); }
//        return;
//    }

//    fetch(svgUrl)
//        .then(r => r.text())
//        .then(text => { targetImage.originalSVG = text; redraw(patchCurvature(text)); })
//        .catch(err => console.error("Fetch SVG failed:", err));
//}

//function curvatureChanges() {
//    if (!activeImage || !(activeImage.type === "image" && activeImage.img)) return;

//    let r = parseFloat(document.getElementById("ddlCurvature").value);
//    if (!Number.isFinite(r)) r = 0;

//    // read current stroke width from dropdown and pass it in
//    const swEl = document.getElementById("ddlStrokeWidth");
//    let sw = parseFloat(swEl?.value);
//    if (!Number.isFinite(sw)) sw = activeImage.strokeWidth || 0;

//    applySvgCurvature(activeImage, r, sw);
//}

function applySvgCurvature(targetImage, radiusPx, strokeWidthOpt, paintOpt = {}) {
    if (!targetImage) return;

    const svgUrl = targetImage.originalSrc || targetImage.src || "";
    const isSvg = svgUrl.toLowerCase().endsWith(".svg") || svgUrl.startsWith("data:image/svg+xml");
    if (!isSvg || !targetImage.img) { console.warn("Target is not an SVG"); return; }

    // read paint options
    const fillOpt = Object.prototype.hasOwnProperty.call(paintOpt, "fill") ? paintOpt.fill : null;
    const strokeOpt = Object.prototype.hasOwnProperty.call(paintOpt, "stroke") ? paintOpt.stroke : null;

    // stroke width from dropdown if not provided
    let sw = strokeWidthOpt;
    if (!Number.isFinite(sw)) {
        sw = parseFloat(document.getElementById("ddlStrokeWidth")?.value);
    }
    if (!Number.isFinite(sw)) sw = targetImage.strokeWidth || 0;

    targetImage.strokeWidth = sw;
    $("#hdnStrokeWidth").val(String(sw));

    // race guard
    targetImage._curveJobId = (targetImage._curveJobId || 0) + 1;
    const myJob = targetImage._curveJobId;

    const origW = targetImage.width, origH = targetImage.height;

    function patch(svgText) {
        const doc = new DOMParser().parseFromString(svgText, "image/svg+xml");
        const svg = doc.documentElement;

        // avoid clipping when stroke grows
        if (sw > 0) {
            // svg.setAttribute("overflow", "visible");
            // let vb = svg.getAttribute("viewBox");
            // if (!vb) vb = `0 0 ${origW} ${origH}`;
            // let [x, y, w, h] = vb.split(/\s+|,/).map(Number);
            ///*  const pad = sw / 2;*/
            // const pad = 0;
            // svg.setAttribute("viewBox", `${x - pad} ${y - pad} ${w + 2 * pad} ${h + 2 * pad}`);

            // // ✅ TAG the image with the pad we added so the renderer can crop it out
            // targetImage.__svgPad = { l: pad, t: pad, r: pad, b: pad };

            // --- dynamic pad so rendered image is (w-0.1) × (h-0.1) inside the box
            svg.setAttribute("overflow", "visible");

            // read/seed the current viewBox
            let vb = svg.getAttribute("viewBox");
            if (!vb) vb = `0 0 ${origW} ${origH}`;
            let [x, y, w, h] = vb.split(/\s+|,/).map(Number);

            // we want to inset the final drawing by 0.1 in each dimension
            const insetX = 0.1;             // active-box width - 0.1
            const insetY = 0.1;             // active-box height - 0.1

            // to get that, expand the viewBox by half the inset on each side
            const padX = Math.max(0, insetX * 0.5);
            const padY = Math.max(0, insetY * 0.5);

            // apply expanded viewBox (width + insetX, height + insetY)
            svg.setAttribute(
                "viewBox",
                `${x - padX} ${y - padY} ${w + insetX} ${h + insetY}`
            );

            // ✅ TAG the image with the pad we added so the renderer can crop it out later
            targetImage.__svgPad = { l: padX, t: padY, r: padX, b: padY };
        }

        // curvature: rounded joints/caps
        const PAINT_TAGS = new Set(["path", "rect", "circle", "ellipse", "polygon", "polyline", "line", "g", "use", "text"]);
        svg.querySelectorAll("*").forEach(el => {
            if (!PAINT_TAGS.has(el.tagName.toLowerCase())) return;
            if (radiusPx > 0) {
                el.setAttribute("stroke-linejoin", "round");
                el.setAttribute("stroke-linecap", "round");
                el.setAttribute("stroke-miterlimit", "1");
            } else {
                el.removeAttribute("stroke-linejoin");
                el.removeAttribute("stroke-linecap");
                el.removeAttribute("stroke-miterlimit");
            }
            // always apply the current stroke width
            el.setAttribute("stroke-width", String(sw));
        });

        // true rounded corners for <rect>
        svg.querySelectorAll("rect").forEach(rect => {
            const w = parseFloat(rect.getAttribute("width") || "0");
            const h = parseFloat(rect.getAttribute("height") || "0");
            const maxR = Math.max(0, Math.min(radiusPx, Math.min(w, h) / 2));
            if (maxR > 0) { rect.setAttribute("rx", maxR); rect.setAttribute("ry", maxR); }
            else { rect.removeAttribute("rx"); rect.removeAttribute("ry"); }
        });

        // paint in the same pass (honor "none")
        const styleEl = svg.querySelector("style");
        if (styleEl) {
            if (fillOpt != null) styleEl.textContent = styleEl.textContent.replace(/(^|[^-])fill:[^;]+;/g, `$1fill:${fillOpt};`);
            if (strokeOpt != null) styleEl.textContent = styleEl.textContent.replace(/stroke:[^;]+;/g, `stroke:${strokeOpt};`);
            styleEl.textContent = styleEl.textContent.replace(/stroke-width:[^;]+;/g, `stroke-width:${sw};`);
        }

        svg.querySelectorAll("*").forEach(el => {
            if (!PAINT_TAGS.has(el.tagName.toLowerCase())) return;
            if (el.closest("defs")) return;
            if (fillOpt != null) el.setAttribute("fill", fillOpt);
            if (strokeOpt != null) el.setAttribute("stroke", strokeOpt);
            el.setAttribute("stroke-width", String(sw));
        });

        return new XMLSerializer().serializeToString(doc);
    }


    function redraw(svgText) {
        if (myJob !== targetImage._curveJobId) return;
        // ✅ update baseline so later recolors keep the curvature
        targetImage.originalSVG = svgText;

        const uri = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgText);
        const imgEl = targetImage.img;

        imgEl.onload = () => {
            if (myJob !== targetImage._curveJobId) return;
            targetImage.width = origW;
            targetImage.height = origH;
            targetImage.src = uri;
            drawText?.();
        };
        imgEl.onerror = () => console.warn("Curvature apply failed:", targetImage.originalSrc || targetImage.src);

        imgEl.src = uri;
    }

    const cached = targetImage.originalSVG;
    if (cached) { redraw(patch(cached)); return; }

    if (svgUrl.startsWith("data:image/svg+xml")) {
        const after = svgUrl.split(",")[1] || "";
        let raw = "";
        if (/;base64/i.test(svgUrl)) { try { raw = atob(after); } catch { } }
        else { try { raw = decodeURIComponent(after); } catch { } }
        if (raw) { targetImage.originalSVG = raw; redraw(patch(raw)); }
        return;
    }

    fetch(svgUrl)
        .then(r => r.text())
        .then(text => { targetImage.originalSVG = text; redraw(patch(text)); })
        .catch(err => console.error("Fetch SVG failed:", err));
}
function curvatureChanges() {
    const img = activeImage;
    if (!(img && img.type === "image" && img.img)) return;

    // curvature radius
    let r = parseFloat(document.getElementById("ddlCurvature")?.value);
    if (!Number.isFinite(r)) r = 0;

    // stroke width from dropdown
    let sw = parseFloat(document.getElementById("ddlStrokeWidth")?.value);
    if (!Number.isFinite(sw)) sw = img.strokeWidth || 0;

    // honor checkboxes
    const noFill = !!document.getElementById("noColorCheck")?.checked;
    const noStroke = !!document.getElementById("noColorCheck2")?.checked;

    const fill = noFill ? "none" : ($("#hdnfillColor").val() || img.fillNoColor || "#FFFFFF");
    const stroke = noStroke ? "none" : ($("#hdnStrockColor").val() || img.strokeNoColor || "#000000");
    activeImage.curvature = r;
    // one-pass patch: curvature + paint + strokeWidth
    applySvgCurvature(img, r, sw, { fill, stroke });
}


// ── Group transform state ─────────────────────────────────────────────
let isResizingMulti = false;
let multiResizeDir = null;  // 'l','r','t','b','tl','tr','bl','br'
let groupSnap = null;  // snapshot of group & items for transform
function getSelectedItems() {
    allItems = [...images, ...textObjects];
    // adapt to your selection flag/array
    return (allItems || []).filter(it => it && it.selected);
}

function aabbOfItem(it) {
    // axis-aligned bounding box in design space
    // If you already have a rotated bbox helper, use it. This fallback assumes x,y,w,h are unrotated.
    const x = it.x, y = it.y, w = it.width, h = it.height;
    return { x, y, w, h, left: x, top: y, right: x + w, bottom: y + h, cx: x + w / 2, cy: y + h / 2 };
}

function aabbOfItems(items) {
    let minX = +Infinity, minY = +Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const it of items) {
        const b = aabbOfItem(it);
        minX = Math.min(minX, b.left);
        minY = Math.min(minY, b.top);
        maxX = Math.max(maxX, b.right);
        maxY = Math.max(maxY, b.bottom);
    }
    if (!isFinite(minX)) return null;
    const w = Math.max(0, maxX - minX);
    const h = Math.max(0, maxY - minY);
    return { x: minX, y: minY, w, h, left: minX, top: minY, right: maxX, bottom: maxY, cx: minX + w / 2, cy: minY + h / 2 };
}

function hitGroupHandle(mx, my, box, hs = 10) {
    // Bigger corner squares win; sides exclude those squares
    const near = (x, y) => Math.abs(mx - x) <= hs && Math.abs(my - y) <= hs;

    // 1) Corners FIRST
    if (near(box.left, box.top)) return 'tl';
    if (near(box.right, box.top)) return 'tr';
    if (near(box.left, box.bottom)) return 'bl';
    if (near(box.right, box.bottom)) return 'br';

    // 2) Sides (exclude corners with padding)
    const thick = hs, pad = hs;
    const onTop = (my >= box.top - thick) && (my <= box.top + thick) &&
        (mx >= box.left + pad) && (mx <= box.right - pad);
    const onBottom = (my >= box.bottom - thick) && (my <= box.bottom + thick) &&
        (mx >= box.left + pad) && (mx <= box.right - pad);
    const onLeft = (mx >= box.left - thick) && (mx <= box.left + thick) &&
        (my >= box.top + pad) && (my <= box.bottom - pad);
    const onRight = (mx >= box.right - thick) && (mx <= box.right + thick) &&
        (my >= box.top + pad) && (my <= box.bottom - pad);

    if (onTop) return 't';
    if (onBottom) return 'b';
    if (onLeft) return 'l';
    if (onRight) return 'r';

    return null;
}




function startGroupDragOrResize(mx, my, maybeDir = null) {
    const sel = getSelectedItems?.() || [];
    if (sel.length < 2) return false;

    const g = aabbOfItems(sel);
    if (!g) return false;

    // fixed point (anchor) and original dragged-corner point
    let ax = g.left, ay = g.top, bx0 = g.right, by0 = g.bottom; // defaults
    const d = (maybeDir || "").toLowerCase();
    if (d === 'tl') { ax = g.right; ay = g.bottom; bx0 = g.left; by0 = g.top; }
    if (d === 'tr') { ax = g.left; ay = g.bottom; bx0 = g.right; by0 = g.top; }
    if (d === 'bl') { ax = g.right; ay = g.top; bx0 = g.left; by0 = g.bottom; }
    if (d === 'br') { ax = g.left; ay = g.top; bx0 = g.right; by0 = g.bottom; }
    if (d === 'l') { ax = g.right; ay = g.cy; }
    if (d === 'r') { ax = g.left; ay = g.cy; }
    if (d === 't') { ax = g.cx; ay = g.bottom; }
    if (d === 'b') { ax = g.cx; ay = g.top; }

    groupSnap = {
        startMX: mx, startMY: my,
        box0: {
            left: g.left, top: g.top, right: g.right, bottom: g.bottom,
            w: g.w, h: g.h, cx: g.cx, cy: g.cy,
            dir: d, ax, ay, bx0, by0
        },
        items: sel.map(it => {
            const x0 = it.x, y0 = it.y, w0 = it.width, h0 = it.height;
            const cx0 = x0 + w0 / 2, cy0 = y0 + h0 / 2;
            return {
                ref: it,
                x0, y0, w0, h0, cx0, cy0,
                ox: cx0 - ax,            // center offset from anchor
                oy: cy0 - ay,
                _origText: (it.type !== 'image' && typeof it.text === 'string') ? { text: it.text } : null
            };
        })
    };

    if (d) { isResizingMulti = true; isDraggingMulti = false; multiResizeDir = d; }
    else { isDraggingMulti = true; isResizingMulti = false; multiResizeDir = null; }

    const onceUp = () => { finishGroupTransform(); document.removeEventListener('mouseup', onceUp, true); };
    document.addEventListener('mouseup', onceUp, true);
    return true;
}




function startGroupDragOrResizeOLD(mx, my, maybeDir = null) {
    const sel = getSelectedItems();
    if (sel.length < 2) return false;

    const groupBox = aabbOfItems(sel);
    if (!c) return false;

    // snapshot base for transform
    //groupSnap = {
    //    startMX: mx, startMY: my,
    //    box0: { ...groupBox },
    //    items: sel.map(it => ({
    //        ref: it,
    //        x0: it.x, y0: it.y,
    //        w0: it.width, h0: it.height,
    //        rot0: it.rotation || 0
    //    }))
    //};

    groupSnap = {
        box0: { left: groupBox.left, top: groupBox.top, right: groupBox.right, bottom: groupBox.bottom, w: groupBox.w, h: groupBox.h, cx: groupBox.cx, cy: groupBox.cy },
        items: sel.map(it => ({ ref: it, x0: it.x, y0: it.y, w0: it.width, h0: it.height, _type: it.type }))
    };

    if (maybeDir) {
        isResizingMulti = true;
        multiResizeDir = maybeDir;
    } else {
        isDraggingMulti = true;
    }

    if (maybeDir) { isResizingMulti = true; multiResizeDir = maybeDir; }
    else { isDraggingMulti = true; }

    // one-shot fallback to guarantee release
    const onceUp = () => { finishGroupTransform(); document.removeEventListener('mouseup', onceUp, true); };
    document.addEventListener('mouseup', onceUp, true);

    return true;

}

function updateGroupDrag(mx, my) {
    if (!isDraggingMulti || !groupSnap) return;

    const dx = mx - groupSnap.startMX;
    const dy = my - groupSnap.startMY;

    for (const s of groupSnap.items) {
        s.ref.x = s.x0 + dx;
        s.ref.y = s.y0 + dy;
    }
    if (typeof drawText === "function") drawText();
}

function updateGroupResize_Old(mx, my) {
    if (!isResizingMulti || !groupSnap) return;

    const b0 = groupSnap.box0 || {};
    const dir = (b0.dir || multiResizeDir || "").toLowerCase();
    if (!dir) return;

    // ---- Rebuild anchor & dragged-corner if not captured (self-heal) ----
    const left = Number.isFinite(b0.left) ? b0.left : 0;
    const top = Number.isFinite(b0.top) ? b0.top : 0;
    const right = Number.isFinite(b0.right) ? b0.right : left + (b0.w || 0);
    const bottom = Number.isFinite(b0.bottom) ? b0.bottom : top + (b0.h || 0);
    const cx = Number.isFinite(b0.cx) ? b0.cx : (left + right) / 2;
    const cy = Number.isFinite(b0.cy) ? b0.cy : (top + bottom) / 2;

    let ax = b0.ax, ay = b0.ay, bx0 = b0.bx0, by0 = b0.by0;

    function ensureAnchorAndCorner() {
        if (dir === "tl") { ax = right; ay = bottom; bx0 = left; by0 = top; }
        if (dir === "tr") { ax = left; ay = bottom; bx0 = right; by0 = top; }
        if (dir === "bl") { ax = right; ay = top; bx0 = left; by0 = bottom; }
        if (dir === "br") { ax = left; ay = top; bx0 = right; by0 = bottom; }
        if (dir === "l") { ax = right; ay = cy; }
        if (dir === "r") { ax = left; ay = cy; }
        if (dir === "t") { ax = cx; ay = bottom; }
        if (dir === "b") { ax = cx; ay = top; }
    }
    if (!Number.isFinite(ax) || !Number.isFinite(ay) || (dir.length === 2 && (!Number.isFinite(bx0) || !Number.isFinite(by0)))) {
        ensureAnchorAndCorner();
    }
    // persist back for future frames
    b0.ax = ax; b0.ay = ay;
    if (dir.length === 2) { b0.bx0 = bx0; b0.by0 = by0; }

    // ---- Ensure per-item center offsets exist (ox/oy) ----
    for (const s of groupSnap.items) {
        if (!s) continue;
        if (!Number.isFinite(s.ox) || !Number.isFinite(s.oy)) {
            const cx0 = Number.isFinite(s.cx0) ? s.cx0 : (s.x0 + s.w0 / 2);
            const cy0 = Number.isFinite(s.cy0) ? s.cy0 : (s.y0 + s.h0 / 2);
            s.ox = cx0 - ax;
            s.oy = cy0 - ay;
        }
    }

    const isCorner = (dir.length === 2);

    // ---------- Corner: anchor-based UNIFORM scaling (robust) ----------
    if (isCorner) {
        const EPS = 1e-6;

        // original vector from anchor to dragged corner
        let dx0 = (bx0 - ax), dy0 = (by0 - ay);
        if (!Number.isFinite(dx0)) dx0 = EPS;
        if (!Number.isFinite(dy0)) dy0 = EPS;
        if (Math.abs(dx0) < EPS) dx0 = (dx0 >= 0 ? EPS : -EPS);
        if (Math.abs(dy0) < EPS) dy0 = (dy0 >= 0 ? EPS : -EPS);

        // current vector from anchor to mouse
        let dx = (mx - ax), dy = (my - ay);
        if (!Number.isFinite(dx)) dx = 0;
        if (!Number.isFinite(dy)) dy = 0;

        let kx = dx / dx0, ky = dy / dy0;
        if (!Number.isFinite(kx)) kx = 1;
        if (!Number.isFinite(ky)) ky = 1;

        const uAbs = Math.max(0.02, Math.min(50, Math.min(Math.abs(kx), Math.abs(ky))));
        const sx = (kx >= 0 ? 1 : -1);
        const sy = (ky >= 0 ? 1 : -1);

        const posKx = sx * uAbs;
        const posKy = sy * uAbs;

        for (const s of groupSnap.items) {
            const it = s.ref; if (!it) continue;

            // new center from anchor (no walking)
            const cx1 = ax + s.ox * posKx;
            const cy1 = ay + s.oy * posKy;

            const w1 = Math.max(1, s.w0 * uAbs);
            const h1 = Math.max(1, s.h0 * uAbs);

            it.x = cx1 - w1 / 2;
            it.y = cy1 - h1 / 2;
            it.width = w1;
            it.height = h1;

            // text content scaling (uniform)
            const isText = (it.type !== 'image');
            if (isText && s._origText && typeof scaleTextHTML === 'function') {
                it.text = scaleTextHTML(s._origText.text, uAbs);
            }
        }

        drawText?.();
        return;
    }

    // ---------- Sides: mirror single-item; lock non-active axis for centers ----------
    let L = left, T = top, R = right, B = bottom;
    if (dir === "l") L = mx;
    if (dir === "r") R = mx;
    if (dir === "t") T = my;
    if (dir === "b") B = my;

    const MINW = 3, MINH = 3;
    if (R - L < MINW) { if (dir === 'l') L = R - MINW; else if (dir === 'r') R = L + MINW; }
    if (B - T < MINH) { if (dir === 't') T = B - MINH; else if (dir === 'b') B = T + MINH; }

    const EPS = 1e-6;
    const gw = Math.max(EPS, (right - left));
    const gh = Math.max(EPS, (bottom - top));
    let kx = (R - L) / gw;
    let ky = (B - T) / gh;

    // centers move only on active axis
    let posKx = kx, posKy = ky;
    if (dir === 'l' || dir === 'r') posKy = 1;
    if (dir === 't' || dir === 'b') posKx = 1;

    // clamp absurd scales
    posKx = Math.max(0.02, Math.min(50, posKx));
    posKy = Math.max(0.02, Math.min(50, posKy));
    kx = Math.max(0.02, Math.min(50, Math.abs(kx))) * Math.sign(kx || 1);
    ky = Math.max(0.02, Math.min(50, Math.abs(ky))) * Math.sign(ky || 1);

    for (const s of groupSnap.items) {
        const it = s.ref; if (!it) continue;
        const isText = (it.type !== 'image');

        const cx1 = ax + s.ox * posKx;
        const cy1 = ay + s.oy * posKy;

        let sizeKx = 1, sizeKy = 1;
        if (dir === 'l' || dir === 'r') {
            // L/R
            if (isText) { sizeKx = Math.abs(kx); sizeKy = 1; }      // text width-only
            else { sizeKx = Math.abs(kx); sizeKy = 1; }      // image/svg width-only
        } else {
            // T/B
            if (isText) { const u = Math.abs(ky); sizeKx = u; sizeKy = u; } // text uniform via vertical
            else { sizeKx = 1; sizeKy = Math.abs(ky); }              // image/svg height-only
        }

        const w1 = Math.max(1, s.w0 * sizeKx);
        const h1 = Math.max(1, s.h0 * sizeKy);
        it.x = cx1 - w1 / 2;
        it.y = cy1 - h1 / 2;
        it.width = w1;
        it.height = h1;

        if (isText) {
            const uniform = Math.abs(sizeKx - sizeKy) < 1e-6;
            if (uniform && s._origText && typeof scaleTextHTML === 'function') {
                it.text = scaleTextHTML(s._origText.text, sizeKx);
            }
        }

        if (!isText && it.isBasic === true && !it.isLINESvg) {
            if (dir === 'l' || dir === 'r') { it.__capsOrientation = 'horizontal'; it.preserveCaps = true; }
            else { it.__capsOrientation = 'vertical'; it.preserveCaps = true; }
        }
    }

    drawText?.();
}
function updateGroupResize(mx, my) {
    if (!isResizingMulti || !groupSnap) return;

    const b0 = groupSnap.box0 || {};
    const dir = String(multiResizeDir || b0.dir || "").toLowerCase();
    if (!dir) return;

    // Rebuild group box if needed
    const left = Number.isFinite(b0.left) ? b0.left : 0;
    const top = Number.isFinite(b0.top) ? b0.top : 0;
    const right = Number.isFinite(b0.right) ? b0.right : left + (b0.w || 0);
    const bottom = Number.isFinite(b0.bottom) ? b0.bottom : top + (b0.h || 0);
    const cx = Number.isFinite(b0.cx) ? b0.cx : (left + right) / 2;
    const cy = Number.isFinite(b0.cy) ? b0.cy : (top + bottom) / 2;

    // Ensure anchor & dragged-corner present
    let { ax, ay, bx0, by0 } = b0;
    const fillAnchorAndCorner = () => {
        if (dir === "tl") { ax = right; ay = bottom; bx0 = left; by0 = top; }
        if (dir === "tr") { ax = left; ay = bottom; bx0 = right; by0 = top; }
        if (dir === "bl") { ax = right; ay = top; bx0 = left; by0 = bottom; }
        if (dir === "br") { ax = left; ay = top; bx0 = right; by0 = bottom; }
        if (dir === "l") { ax = right; ay = cy; }
        if (dir === "r") { ax = left; ay = cy; }
        if (dir === "t") { ax = cx; ay = bottom; }
        if (dir === "b") { ax = cx; ay = top; }
    };
    if (!Number.isFinite(ax) || !Number.isFinite(ay) ||
        (dir.length === 2 && (!Number.isFinite(bx0) || !Number.isFinite(by0)))) {
        fillAnchorAndCorner();
    }
    b0.ax = ax; b0.ay = ay; if (dir.length === 2) { b0.bx0 = bx0; b0.by0 = by0; }

    // Ensure per-item offsets
    for (const s of (groupSnap.items || [])) {
        if (!Number.isFinite(s.ox) || !Number.isFinite(s.oy)) {
            const cx0 = Number.isFinite(s.cx0) ? s.cx0 : (s.x0 + s.w0 / 2);
            const cy0 = Number.isFinite(s.cy0) ? s.cy0 : (s.y0 + s.h0 / 2);
            s.ox = cx0 - ax; s.oy = cy0 - ay;
        }
    }

    const isCorner = (dir.length === 2);

    // ---------- CORNERS: anchor-based uniform signed scaling ----------
    if (isCorner) {
        const EPS = 1e-6;

        let dx0 = (bx0 - ax), dy0 = (by0 - ay);
        if (!Number.isFinite(dx0)) dx0 = EPS;
        if (!Number.isFinite(dy0)) dy0 = EPS;
        if (Math.abs(dx0) < EPS) dx0 = (dx0 >= 0 ? EPS : -EPS);
        if (Math.abs(dy0) < EPS) dy0 = (dy0 >= 0 ? EPS : -EPS);

        let dx = (mx - ax), dy = (my - ay);
        if (!Number.isFinite(dx)) dx = 0;
        if (!Number.isFinite(dy)) dy = 0;

        let kx = dx / dx0, ky = dy / dy0;
        if (!Number.isFinite(kx)) kx = 1;
        if (!Number.isFinite(ky)) ky = 1;

        const clamp = v => Math.max(0.02, Math.min(50, v));
        const uAbs = clamp(Math.min(Math.abs(kx), Math.abs(ky)));
        const sx = (kx >= 0 ? 1 : -1);
        const sy = (ky >= 0 ? 1 : -1);

        const posKx = sx * uAbs;   // centers move uniformly from anchor
        const posKy = sy * uAbs;
        const u = uAbs;        // uniform size factor

        for (const s of (groupSnap.items || [])) {
            const it = s.ref; if (!it) continue;

            const cx1 = ax + s.ox * posKx;
            const cy1 = ay + s.oy * posKy;

            const w1 = Math.max(1, s.w0 * u);
            const h1 = Math.max(1, s.h0 * u);

            it.x = cx1 - w1 / 2;
            it.y = cy1 - h1 / 2;
            it.width = w1;
            it.height = h1;

            // TEXT content update on uniform
            if (it.type !== 'image' && s._origText && typeof scaleTextHTML === 'function') {
                it.text = scaleTextHTML(s._origText.text, u);
            }
        }

        drawText?.();
        return;
    }

    // ---------- SIDES: mirror single-item & lock non-active axis ----------
    let L = left, T = top, R = right, B = bottom;
    if (dir === "l") L = mx;
    if (dir === "r") R = mx;
    if (dir === "t") T = my;
    if (dir === "b") B = my;

    const MINW = 3, MINH = 3;
    if (R - L < MINW) { if (dir === 'l') L = R - MINW; else if (dir === 'r') R = L + MINW; }
    if (B - T < MINH) { if (dir === 't') T = B - MINH; else if (dir === 'b') B = T + MINH; }

    const EPS = 1e-6;
    const gw = Math.max(EPS, right - left);
    const gh = Math.max(EPS, bottom - top);
    let kx = (R - L) / gw;
    let ky = (B - T) / gh;

    // centers move only on active axis (no “walk”)
    let posKx = kx, posKy = ky;
    if (dir === 'l' || dir === 'r') posKy = 1;
    if (dir === 't' || dir === 'b') posKx = 1;

    const clamp = v => Math.max(0.02, Math.min(50, v));
    posKx = clamp(posKx);
    posKy = clamp(posKy);
    kx = Math.sign(kx || 1) * clamp(Math.abs(kx));
    ky = Math.sign(ky || 1) * clamp(Math.abs(ky));

    for (const s of (groupSnap.items || [])) {
        const it = s.ref; if (!it) continue;
        const isText = (it.type !== 'image');

        const cx1 = ax + s.ox * posKx;
        const cy1 = ay + s.oy * posKy;

        // per-type size behavior (same as single-item)
        let sizeKx = 1, sizeKy = 1;
        if (dir === 'l' || dir === 'r') {
            // width-only
            sizeKx = Math.abs(kx); sizeKy = 1;
        } else {
            // top/bottom
            if (isText) {
                const u = Math.abs(ky); sizeKx = u; sizeKy = u;   // text uniform via vertical
            } else {
                sizeKx = 1; sizeKy = Math.abs(ky);                // image/svg height-only
            }
        }

        const w1 = Math.max(1, s.w0 * sizeKx);
        const h1 = Math.max(1, s.h0 * sizeKy);

        it.x = cx1 - w1 / 2;
        it.y = cy1 - h1 / 2;
        it.width = w1;
        it.height = h1;

        if (isText) {
            const uniform = Math.abs(sizeKx - sizeKy) < 1e-6;
            if (uniform && s._origText && typeof scaleTextHTML === 'function') {
                it.text = scaleTextHTML(s._origText.text, sizeKx);
            }
        }

        if (!isText && it.isBasic === true && !it.isLINESvg) {
            if (dir === 'l' || dir === 'r') { it.__capsOrientation = 'horizontal'; it.preserveCaps = true; }
            else { it.__capsOrientation = 'vertical'; it.preserveCaps = true; }
        }
    }

    drawText?.();
}










function finishGroupTransform() {
    isDraggingMulti = false;
    isResizingMulti = false;
    multiResizeDir = null;
    groupSnap = null;
    isGroupAction = false;
    canvas.style.cursor = 'default';
}
//function groupCursorFor(dir) {
//    return ({
//        tl: 'nwse-resize', br: 'nwse-resize', tr: 'nesw-resize', bl: 'nesw-resize',
//        l: 'ew-resize', r: 'ew-resize', t: 'ns-resize', b: 'ns-resize'
//    })[dir] || 'default';
//}
function groupCursorFor(dir) {
    return ({
        tl: 'nwse-resize', br: 'nwse-resize',
        tr: 'nesw-resize', bl: 'nesw-resize',
        l: 'ew-resize', r: 'ew-resize', t: 'ns-resize', b: 'ns-resize'
    })[dir] || 'default';
}


function onGlobalMouseUp() { if (isDraggingMulti || isResizingMulti) finishGroupTransform(); }

window.addEventListener('mouseup', onGlobalMouseUp);
canvas.addEventListener('mouseleave', onGlobalMouseUp);

// Utility: axis-aligned rect from two points
function rectFromPoints(p0, p1) {
    const x = Math.min(p0.x, p1.x);
    const y = Math.min(p0.y, p1.y);
    const w = Math.abs(p1.x - p0.x);
    const h = Math.abs(p1.y - p0.y);
    return { x, y, w, h };
}
function rectsIntersect(a, b) {
    return !(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y);
}

// Rotation-aware AABB (works for text + image objects that have x,y,width,height,rotation)
function getItemAABB(item) {
    const cx = item.x + item.width / 2, cy = item.y + item.height / 2;
    const rad = ((item.rotation || 0) * Math.PI) / 180;
    const c = Math.cos(rad), s = Math.sin(rad);
    const hw = item.width / 2, hh = item.height / 2;
    const pts = [
        { x: -hw, y: -hh }, { x: hw, y: -hh }, { x: hw, y: hh }, { x: -hw, y: hh }
    ].map(p => ({ x: p.x * c - p.y * s + cx, y: p.x * s + p.y * c + cy }));
    const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}
// Topmost hit (fallback if you already have getTopHitAt)
function hitTopItem(mx, my, items = allItems) {
    const sorted = [...items].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
    for (let i = sorted.length - 1; i >= 0; i--) {
        const a = getItemAABB(sorted[i]);
        if (mx >= a.x && mx <= a.x + a.w && my >= a.y && my <= a.y + a.h) return sorted[i];
    }
    return null;
}

// Commit marquee selection at mx,my (design/canvas coords)
// Commit the marquee selection directly into images/textObjects via `.selected`
function finalizeMarqueeSelection(mx, my, e) {
    if (!isMarquee) return;

    // Close the band at the last point
    marqueeNow.x = mx; marqueeNow.y = my;

    const dragDist = Math.hypot(marqueeNow.x - marqueeStart.x, marqueeNow.y - marqueeStart.y);
    const additive = !!(e && e.shiftKey);            // Shift adds
    const toggle = !!(e && (e.ctrlKey || e.metaKey)); // Ctrl/Cmd toggles

    const all = __drawables();

    // Build current selection set from the flags your drawText() already uses
    const currSel = new Set(all.filter(it => it.selected));

    if (dragDist < (typeof MARQUEE_MIN_DRAG === 'number' ? MARQUEE_MIN_DRAG : 4)) {
        // CLICK path: behave like your click (single select, with optional toggle/add)
        const hit = __topHitAt(mx, my);

        if (!additive && !toggle) currSel.clear();

        if (hit) {
            if (toggle) {
                if (currSel.has(hit)) currSel.delete(hit); else currSel.add(hit);
            } else {
                currSel.add(hit);
            }
        } else if (!additive && !toggle) {
            currSel.clear();
        }
    } else {
        // MARQUEE path: select everything intersecting the band
        const box = rectFromPoints(marqueeStart, marqueeNow);
        if (!additive && !toggle) currSel.clear();

        for (const it of all) {
            if (rectsIntersect(box, getItemAABB(it))) {
                if (toggle && currSel.has(it)) currSel.delete(it); else currSel.add(it);
            }
        }
    }

    // Write back the exact flags your renderer reads
    for (const it of all) it.selected = false;
    for (const it of currSel) it.selected = true;

    // Set active item like your click does:
    // 1) prefer the item under mouse if it’s selected
    // 2) else topmost among selected
    let active = null;
    const hoverHit = __topHitAt(mx, my);
    if (hoverHit && hoverHit.selected) {
        active = hoverHit;
    } else if (currSel.size) {
        let top = null, topZ = -Infinity;
        for (const it of currSel) {
            const z = it.zIndex || 0;
            if (z >= topZ) { topZ = z; top = it; }
        }
        active = top;
    }

    // Update your globals exactly like the click path
    if (active && active.type === 'image') {
        activeImage = active;
        activeText = null;
    } else if (active) {
        activeText = active;
        activeImage = null;
    } else {
        activeText = null;
        activeImage = null;
    }

    // (Optional) keep a list if you also track it elsewhere
    globalThis.ItemsSelected = all.filter(it => it.selected);

    isMarquee = false;
    try { setGlobalCursor?.('default'); } catch { }
    drawText(); // no changes needed inside drawText()
}
function isBoxSelected(it) {
    return !!(
        it?.isSelected === true ||
        (Array.isArray(globalThis.ItemsSelected) && globalThis.ItemsSelected.includes(it)) ||
        (Array.isArray(globalThis.selectedItems) && globalThis.selectedItems.includes(it)) // compat
    );
}

// example usage inside your draw loop
for (const it of allItems) {
    drawItem(it);
    if (isBoxSelected(it) || it === activeBox) {
        drawSelectionHandles(it); // your existing handle/outline drawer
    }
}
function __drawables() {
    const imgs = Array.isArray(images) ? images : [];
    const texts = Array.isArray(textObjects) ? textObjects : [];
    return imgs.concat(texts);
}
function __zsorted(list) {
    return [...list].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
}
function __topHitAt(mx, my) {
    // Prefer your existing hit if available (uses your own precise logic)
    if (typeof getTopHitAt === 'function') return getTopHitAt(mx, my);
    // Fallback: rotated AABB scan, topmost by zIndex
    const sorted = __zsorted(__drawables());
    for (let i = sorted.length - 1; i >= 0; i--) {
        const a = getItemAABB(sorted[i]);
        if (mx >= a.x && mx <= a.x + a.w && my >= a.y && my <= a.y + a.h) return sorted[i];
    }
    return null;
}
function __hitTopDrawable(mx, my) {
    const sorted = __zsorted(__drawables());
    for (let i = sorted.length - 1; i >= 0; i--) {
        const aabb = getItemAABB(sorted[i]);
        if (mx >= aabb.x && mx <= aabb.x + aabb.w &&
            my >= aabb.y && my <= aabb.y + aabb.h) {
            return sorted[i];
        }
    }
    return null;
}
// helper: bounds-safe insert
function __insertAt(arr, index, item) {
    const i = Math.max(0, Math.min(index, arr.length));
    arr.splice(i, 0, item);
}

// NEW: global set of pending uploads to await before saving
window.__pendingUploads = window.__pendingUploads || new Set();

// ensure a hidden input exists (reused)
(function initUploadReplacementInput() {
    if (!document.getElementById('uploadReplacementInput')) {
        const inp = document.createElement('input');
        inp.type = 'file';
        inp.accept = 'image/*';
        inp.id = 'uploadReplacementInput';
        inp.style.display = 'none';
        document.body.appendChild(inp);
    }
})();

// Upload: ONLY delete after a file is chosen & loaded
// Upload: ONLY delete after a file is chosen & loaded (using SERVER URL, no blob:)
document.getElementById("uploadOption").addEventListener("click", function (e) {
    e.preventDefault(); e.stopPropagation();
    ShowLoader(); // show immediately

    const target = contextTarget || selectedForContextMenu || activeBox;
    if (!target) { if (contextMenu) contextMenu.style.display = "none"; HideLoader(); return; }

    // capture placement/props to reuse
    const bbox = { x: target.x, y: target.y, width: target.width, height: target.height };
    const preserved = {
        rotation: (target.rotation ?? target.angle ?? 0),
        z: (target.z ?? target.zIndex ?? null)
    };

    const wasImage = (typeof isImageItem === 'function') ? isImageItem(target) : (target?.type === 'image');
    const sourceArr = wasImage ? (images || []) : (textObjects || []);
    const input = document.getElementById('uploadReplacementInput');
    input.value = '';

    // ───── CANCEL GUARD (robust) ─────
    let changeFired = false;                // set true as soon as 'change' triggers
    let guardActive = true;                 // guard is active until we pick a file
    const openedAt = performance.now();
    let guardTimer = null;

    const detachCancelGuard = () => {
        guardActive = false;
        window.removeEventListener('focus', onWindowFocus, true);
        document.removeEventListener('visibilitychange', onVisChange, true);
        clearTimeout(guardTimer);
    };

    // Run a deferred check ONLY after a short grace period, and only if no file + no change
    const scheduleCancelCheck = (delay = 700) => {
        if (!guardActive) return;
        clearTimeout(guardTimer);
        guardTimer = setTimeout(() => {
            if (!guardActive) return;                 // change already fired
            // if a file is already present, do nothing (selection in progress)
            if (input.files && input.files.length > 0) return;
            // ensure enough time has passed since opening the picker
            const elapsed = performance.now() - openedAt;
            if (elapsed >= delay && (!input.files || input.files.length === 0)) {
                HideLoader();                         // true cancel → hide
                detachCancelGuard();
            }
        }, delay);
    };

    function onWindowFocus() { scheduleCancelCheck(700); }
    function onVisChange() { if (document.visibilityState === 'visible') scheduleCancelCheck(700); }

    window.addEventListener('focus', onWindowFocus, true);
    document.addEventListener('visibilitychange', onVisChange, true);

    // Optional hard fallback if the dialog stays open or focus events don’t fire
    const fallbackTimeout = setTimeout(() => {
        if (!changeFired && (!input.files || input.files.length === 0)) {
            HideLoader();
            detachCancelGuard();
        }
    }, 20000);
    // ─────────────────────────────────

    async function onPick(ev) {
        input.removeEventListener('change', onPick);

        changeFired = true;        // mark selection happened ASAP
        detachCancelGuard();       // stop cancel guard from running
        clearTimeout(fallbackTimeout);

        const file = ev.target.files && ev.target.files[0];
        if (!file) { HideLoader(); return; } // extremely rare: empty change

        // 1) Upload FIRST to get the server URL (no blob preview)
        let res;
        try {
            // let the loader paint before async work
            await new Promise(r => requestAnimationFrame(r));

            const form = new FormData();
            form.append("file", file);

            const resp = await fetch(baseURL + "fileUploader/UploadElementImage", { method: "POST", body: form });
            if (!resp.ok) {
                const _msg = (resp.error || resp.statusText || ("HTTP " + resp.status));
                MessageShow('', _msg, 'error');
                console.warn("UploadElementImage HTTP error:", resp.status);
                HideLoader();
                return false;
            }
            res = await resp.json();
        } catch (err) {
            HideLoader();
            console.error("UploadElementImage error:", err);
            return;
        }

        if (!res?.ok || !res.mainUrl) {
            MessageShow('', res?.error || 'Upload failed', 'error');
            HideLoader();
            console.warn("UploadElementImage failed:", res?.error);
            return false;
        }

        // 2) Build absolute server URL; cache-bust for freshness
        const serverSrcAbs = (() => { try { return new URL(res.mainUrl, location.origin).href; } catch { return res.mainUrl; } })();
        const serverThumbAbs = res.thumbUrl ? (() => { try { return new URL(res.thumbUrl, location.origin).href; } catch { return res.thumbUrl; } })() : null;
        const serverSrcForLoad = serverSrcAbs + (serverSrcAbs.includes('?') ? '&' : '?') + 'v=' + Date.now();

        // 3) Load the server image; only then replace the old target
        const img2 = new Image();
        img2.crossOrigin = "anonymous";
        img2.onload = () => {
            const arrNow = wasImage ? (images || []) : (textObjects || []);
            const idxNow = arrNow.indexOf(target);
            if (idxNow > -1) arrNow.splice(idxNow, 1);

            if (activeBox === target) activeBox = null;
            if (activeText === target) activeText = null;
            if (activeImage === target) activeImage = null;
            if (target) target.selected = false;

            const newBox = {
                type: 'image',
                img: img2,
                src: serverSrcAbs,
                serverSrc: serverSrcAbs,
                thumbSrc: serverThumbAbs || undefined,
                x: bbox.x, y: bbox.y,
                width: bbox.width, height: bbox.height,
                isBasic: false
            };
            if (preserved.rotation != null) { newBox.rotation = preserved.rotation; newBox.angle = preserved.rotation; }
            if (preserved.z != null) { newBox.z = preserved.z; newBox.zIndex = preserved.z; }

            try {
                const droppedFileName = file?.name || "";
                let basicName = "";
                try { basicName = new URL(serverSrcAbs).pathname.split('/').pop() || ""; }
                catch { basicName = (droppedFileName || serverSrcAbs).split(/[?#]/)[0].split('/').pop() || ""; }
                if (typeof __isBasicFromSource === 'function') newBox.isBasic = __isBasicFromSource(serverSrcAbs, droppedFileName);
                if (typeof __isLINESvg === 'function') newBox.isLINESvg = __isLINESvg(basicName);
                newBox.basicName = basicName;
            } catch { }

            if (Array.isArray(images)) {
                if (wasImage && idxNow >= 0) {
                    __insertAt(images, idxNow, newBox);
                } else {
                    if (typeof newBox.zIndex === 'number') {
                        const insertAt = images.findIndex(it => (it?.z ?? it?.zIndex ?? 0) > newBox.zIndex);
                        if (insertAt === -1) images.push(newBox); else __insertAt(images, insertAt, newBox);
                    } else {
                        images.push(newBox);
                    }
                }
            }

            activeImage = newBox;
            activeBox = newBox;
            drawText();
            HideLoader(); // success
        };

        img2.onerror = () => {
            console.warn("Server image failed to load:", serverSrcAbs);
            HideLoader(); // error
        };

        img2.src = serverSrcForLoad;
    }

    input.addEventListener('change', onPick, { once: true });

    if (contextMenu) contextMenu.style.display = "none";
    input.click();

    return; // keep loader visible until one of the above paths hides it
    HideLoader(); // (unreachable)
});

async function deleteMyImage(id) {
    const confirmDelete = await customConfirm("Do you want to delete this image?");
    if (!confirmDelete) return;
    try {
        var data = {
            ElementId: id
        };

        ShowLoader();
        const result = await $.ajax({
            url: baseURL + "Canvas/DeleteElementFromFrontEnd",
            type: "POST",
            dataType: "json",
            data: data
        });
        if (result) {
            switchTab(null, 'my-images', 1);
            HideLoader();
        }
    }
    catch (e) {
        console.log("catch", e);
        HideLoader();
    }
}

async function updateFileName() {
    const input = document.getElementById('fileUpload');
    const nameSpan = document.getElementById('fileName');

    const file = input.files && input.files[0];
    nameSpan.textContent = file ? file.name : 'No File';
    if (!file) return;

    try { if (typeof ShowLoader === 'function') ShowLoader(); } catch { }

    try {
        const form = new FormData();
        form.append('file', file);

        const resp = await fetch((typeof baseURL !== 'undefined' ? baseURL : '') + 'fileUploader/UploadElementImageByControl', {
            method: 'POST',
            body: form
        });

        const res = await resp.json().catch(() => null);

        // Endpoint is expected to return: { ok: true, mainUrl, thumbUrl } or { ok:false, error }
        if (res && res.ok) {
            MessageShow('', 'Upload successfully!', 'success');
            switchTab(null, 'my-images', 1);
            console.log('Upload success:', res);
            // nothing else to do per your requirement
            nameSpan.textContent = 'No File';
        } else {
            MessageShow(null, 'Failed to upload.', 'error');
            console.warn('Upload failed:', res?.error || resp.statusText);
        }
    } catch (err) {
        console.error('Upload error:', err);
    } finally {
        try { if (typeof HideLoader === 'function') HideLoader(); } catch { }
    }
}

function SetTimeWhileSelect() {
    if (activeSlide == 1) {
        $('#hdnInSpeedforSlide1').val(parseInt(document.getElementById('lblSpeed').textContent)) || 4;
        $('#hdnStaySpeedforSlide1').val(parseInt(document.getElementById('lblSeconds').textContent)) || 3;
        $('#hdnOutSpeedforSlide1').val(parseInt(document.getElementById('lblOutSpeed').textContent)) || 4;
    }
    else if (activeSlide == 2) {
        $('#hdnInSpeedforSlide2').val(parseInt(document.getElementById('lblSpeed').textContent)) || 4;
        $('#hdnStaySpeedforSlide2').val(parseInt(document.getElementById('lblSeconds').textContent)) || 3;
        $('#hdnOutSpeedforSlide2').val(parseInt(document.getElementById('lblOutSpeed').textContent)) || 4;

    }
    else if (activeSlide == 3) {
        $('#hdnInSpeedforSlide3').val(parseInt(document.getElementById('lblSpeed').textContent)) || 4;
        $('#hdnStaySpeedforSlide3').val(parseInt(document.getElementById('lblSeconds').textContent)) || 3;
        $('#hdnOutSpeedforSlide3').val(parseInt(document.getElementById('lblOutSpeed').textContent)) || 4;

    }
}
// Normalize any pasted/editor HTML into "one line per <div>".
// • <p>…</p>  → <div>…</div>
// • <p><br></p> → <div><br></div>
// • top-level text/BR → wrap into line <div>s
function __normalizeToLineDivs(root) {
    if (!root) return;

    // ========= Helper: turn one <p> into a line <div>, preserving blank-line styles =========
    function pToDiv(p) {
        const d = document.createElement('div');
        const textNoZW = (p.textContent || '').replace(/\u200B/g, '');
        const onlyWS = !/[^\s\u00A0]/.test(textNoZW);
        const hasDeepBR = !!p.querySelector('br');

        if (onlyWS && hasDeepBR) {
            // Keep one style span if present (handles <p><span style><span><br>…)
            const styledSpan = p.querySelector('span[style]');
            if (styledSpan) {
                const wrap = document.createElement('span');
                wrap.setAttribute('style', styledSpan.getAttribute('style') || '');
                wrap.appendChild(document.createElement('br'));
                d.appendChild(wrap);
            } else {
                d.appendChild(document.createElement('br'));
            }
            return d;
        }

        // Not a blank paragraph → move its children as-is
        while (p.firstChild) d.appendChild(p.firstChild);
        return d;
    }

    // ========= Case 1: root has top-level <p>/<br> (no top-level <div>) =========
    (function maybeHoistTopLevelP() {
        const hasTopDiv = Array.from(root.childNodes).some(n => n.nodeType === 1 && n.tagName === 'DIV');
        const hasTopP = Array.from(root.childNodes).some(n => n.nodeType === 1 && n.tagName === 'P');
        if (!hasTopDiv && hasTopP) {
            const frag = document.createDocumentFragment();
            Array.from(root.childNodes).forEach(n => {
                if (n.nodeType === 1 && n.tagName === 'P') {
                    frag.appendChild(pToDiv(n));
                } else if (n.nodeType === 1 && n.tagName === 'BR') {
                    const d = document.createElement('div');
                    d.appendChild(document.createElement('br'));
                    frag.appendChild(d);
                } else if (n.nodeType === 3) {
                    // split stray text into line <div>s, preserving empty lines
                    String(n.nodeValue).replace(/\r/g, '').split('\n').forEach(chunk => {
                        const d = document.createElement('div');
                        if (chunk === '') d.appendChild(document.createElement('br'));
                        else d.appendChild(document.createTextNode(chunk));
                        frag.appendChild(d);
                    });
                } else if (n.nodeType === 1 && n.tagName === 'DIV') {
                    frag.appendChild(n); // already a line
                }
            });
            root.innerHTML = '';
            root.appendChild(frag);
        }
    })();

    // ========= Case 2A: spans that wrap ONLY block lines (DIV/P/BR) → unwrap to line DIVs, carry styles =========
    (function unwrapBlockOnlySpans() {
        // Query all spans; we’ll filter by contents so we catch nested cases too.
        Array.from(root.querySelectorAll('span')).forEach(span => {
            const kids = Array.from(span.childNodes);
            if (kids.length === 0) return;

            const hasInlineText = kids.some(n => n.nodeType === 3 && (n.nodeValue ?? '').trim().length);
            const blockOnly = kids.every(n =>
                (n.nodeType === 1 && /^(DIV|P|BR)$/i.test(n.tagName)) ||            // elements are DIV/P/BR
                (n.nodeType === 3 && !/\S/.test(n.nodeValue || ''))                 // or whitespace text nodes
            );
            if (hasInlineText || !blockOnly) return;

            const carryStyle = span.getAttribute('style') || '';
            const frag = document.createDocumentFragment();

            const lineFrom = (node) => {
                const line = document.createElement('div');
                if (node.tagName === 'BR') {
                    line.appendChild(document.createElement('br'));
                } else {
                    // node is DIV or P → move inner children
                    if (node.tagName === 'P') {
                        // reuse pToDiv for <p> consistency (handles blank styled <p><span><br>)
                        const divLine = pToDiv(node.cloneNode(true));
                        // pToDiv returned a <div> already — lift its children into our 'line'
                        while (divLine.firstChild) line.appendChild(divLine.firstChild);
                    } else {
                        while (node.firstChild) line.appendChild(node.firstChild);
                    }
                }
                if (carryStyle) {
                    const wrap = document.createElement('span');
                    wrap.setAttribute('style', carryStyle);
                    while (line.firstChild) wrap.appendChild(line.firstChild);
                    line.appendChild(wrap);
                }
                return line;
            };

            kids.forEach(n => {
                if (n.nodeType === 1 && /^(DIV|P|BR)$/i.test(n.tagName)) {
                    frag.appendChild(lineFrom(n.cloneNode(true)));
                }
            });

            // Replace the span, or its container DIV if it was the only child
            const containerDiv = span.closest('div');
            if (containerDiv && containerDiv.childNodes.length === 1 && containerDiv.firstChild === span) {
                containerDiv.replaceWith(frag);
            } else {
                span.replaceWith(frag);
            }
        });
    })();

    // ========= Case 2B: a DIV whose children are only P/BR/whitespace → each becomes its own line DIV =========
    (function hoistPInsideDivs() {
        Array.from(root.querySelectorAll('div')).forEach(div => {
            const onlyPBrOrWS = Array.from(div.childNodes).every(n =>
                (n.nodeType === 1 && (n.tagName === 'P' || n.tagName === 'BR')) ||
                (n.nodeType === 3 && !/\S/.test(n.nodeValue || ''))
            );
            if (!onlyPBrOrWS) return;

            const frag = document.createDocumentFragment();
            Array.from(div.childNodes).forEach(n => {
                if (n.nodeType === 1 && n.tagName === 'P') {
                    frag.appendChild(pToDiv(n));
                } else if (n.nodeType === 1 && n.tagName === 'BR') {
                    const d = document.createElement('div');
                    d.appendChild(document.createElement('br'));
                    frag.appendChild(d);
                }
                // ignore pure whitespace text nodes
            });
            div.replaceWith(frag);
        });
    })();

    // ========= Final pass: wrap any top-level text/BR into line DIVs =========
    (function wrapTopLevelStrays() {
        const needsWrap = Array.from(root.childNodes).some(n =>
            (n.nodeType === 3 && (n.nodeValue ?? '').length) ||
            (n.nodeType === 1 && n.tagName === 'BR')
        );
        if (!needsWrap) return;

        const frag = document.createDocumentFragment();
        Array.from(root.childNodes).forEach(n => {
            if (n.nodeType === 3) {
                String(n.nodeValue).replace(/\r/g, '').split('\n').forEach(chunk => {
                    const d = document.createElement('div');
                    if (chunk === '') d.appendChild(document.createElement('br'));
                    else d.appendChild(document.createTextNode(chunk));
                    frag.appendChild(d);
                });
            } else if (n.nodeType === 1 && n.tagName === 'BR') {
                const d = document.createElement('div');
                d.appendChild(document.createElement('br'));
                frag.appendChild(d);
            } else {
                frag.appendChild(n);
            }
        });
        root.innerHTML = '';
        root.appendChild(frag);
    })();

    // ========= Make sure every truly empty line is <div><br></div> (even if nested spans existed) =========
    (function fixEmptyLineDivs() {
        Array.from(root.querySelectorAll('div')).forEach(d => {
            // If it already has a BR anywhere, it's a blank line already
            if (d.querySelector('br')) return;

            const textNoZW = (d.textContent || '').replace(/\u200B/g, '');
            const onlyWS = !/[^\s\u00A0]/.test(textNoZW);

            if (onlyWS) {
                // Try to preserve a single style span if present
                const styledSpan = d.querySelector('span[style]');
                d.innerHTML = '';
                if (styledSpan) {
                    const wrap = document.createElement('span');
                    wrap.setAttribute('style', styledSpan.getAttribute('style') || '');
                    wrap.appendChild(document.createElement('br'));
                    d.appendChild(wrap);
                } else {
                    d.appendChild(document.createElement('br'));
                }
            }
        });
    })();
}

// Put this helper above your TEXT section in drawText
function __unwrapStylingSpans(root) {
    // unwrap spans that only contain block-levels (DIV/P/BR) or whitespace
    const spans = root.querySelectorAll('span');
    spans.forEach(sp => {
        const onlyBlocksOrSpace = Array.from(sp.childNodes).every(n => {
            if (n.nodeType === 3) return (n.nodeValue || '').trim() === ''; // whitespace text
            if (n.nodeType === 1) return /^(DIV|P|BR)$/i.test(n.tagName);
            return true;
        });
        if (onlyBlocksOrSpace) {
            while (sp.firstChild) sp.parentNode.insertBefore(sp.firstChild, sp);
            sp.remove();
        }
    });
}
function __unwrapBlockWrappingSpans(root) {
    if (!root) return;
    const BLOCK = /^(DIV|P|H1|H2|H3|H4|H5|H6|UL|OL|LI|TABLE|THEAD|TBODY|TFOOT|TR|TD|TH|BR)$/i;

    root.querySelectorAll('span').forEach(sp => {
        // If span contains any block-level element (or BR), we should unwrap
        const containsBlock = Array.from(sp.childNodes).some(n =>
            (n.nodeType === 1 && (BLOCK.test(n.tagName)))
        );
        if (!containsBlock) return;

        // Preserve the span's inline styles by pushing them onto block children
        const spanStyle = sp.getAttribute('style');
        if (spanStyle && sp.children.length) {
            Array.from(sp.children).forEach(el => {
                // Don't overwrite — append so existing child styles win
                el.style.cssText = (el.style.cssText ? el.style.cssText + ';' : '') + spanStyle;
            });
        }

        // Unwrap: move children out, then remove the span
        while (sp.firstChild) sp.parentNode.insertBefore(sp.firstChild, sp);
        sp.remove();
    });
}
function __isBlockish(el) {
    return el && el.nodeType === 1 && /^(DIV|P|BR)$/i.test(el.tagName);
}

// Make a <div> that represents one visual line; preserve a <br> as a blank line.
function __makeLineDivFrom(node) {
    const line = document.createElement('div');
    if (node.nodeType === 1 && node.tagName === 'BR') {
        line.appendChild(document.createElement('br'));
    } else {
        while (node.firstChild) line.appendChild(node.firstChild);
    }
    return line;
}

// Re-wrap line contents with a style-carrying <span> using the original span's inline style
function __applyCarryStyle(line, carryStyleText) {
    if (!carryStyleText) return;
    const wrap = document.createElement('span');
    wrap.setAttribute('style', carryStyleText);
    while (line.firstChild) wrap.appendChild(line.firstChild);
    line.appendChild(wrap);
}

// Unwrap ANY span that wraps block children (DIV/P/BR), preserving styles on each line
function __unwrapSpansWrappingBlocks(root) {
    Array.from(root.querySelectorAll('span')).forEach(span => {
        const kids = Array.from(span.childNodes);
        const hasBlockKids = kids.some(n => __isBlockish(n));
        // if the span has inline text with non-whitespace, leave it alone
        const hasInlineText = kids.some(n => n.nodeType === 3 && /\S/.test(n.nodeValue || ''));

        if (!hasBlockKids || hasInlineText) return;

        const carryStyleText = span.getAttribute('style') || '';
        const frag = document.createDocumentFragment();

        kids.forEach(n => {
            if (__isBlockish(n)) {
                const line = __makeLineDivFrom(n);
                __applyCarryStyle(line, carryStyleText);
                frag.appendChild(line);
            }
        });

        // Replace the span; if its parent was a single-line holder div, replace that instead
        const holderDiv = span.parentElement?.tagName === 'DIV'
            && span.parentElement.childNodes.length === 1
            ? span.parentElement
            : null;

        (holderDiv || span).replaceWith(frag);
    });
}

// Clean up "empty" or whitespace-only line DIVs so they remain visible as blank lines


function __pToDiv(p) {
    const d = document.createElement('div');
    if (
        p.childNodes.length === 1 &&
        p.firstChild.nodeType === 1 &&
        p.firstChild.tagName === 'BR'
    ) {
        d.appendChild(document.createElement('br')); // blank line
    } else {
        while (p.firstChild) d.appendChild(p.firstChild);
    }
    return d;
}

// 1) Hoist paragraphs into line DIVs (works for your “From … <p><br></p> … $699 …” case)
function __hoistParagraphsToTopDivs(root) {
    if (!root) return;

    // If a top-level DIV contains only P/BR, split them into sibling DIV lines
    Array.from(root.querySelectorAll('div')).forEach(div => {
        const onlyPOrBr = Array.from(div.childNodes).every(n =>
            n.nodeType === 1 && (n.tagName === 'P' || n.tagName === 'BR')
        );
        if (!onlyPOrBr) return;

        const frag = document.createDocumentFragment();
        Array.from(div.childNodes).forEach(n => {
            if (n.tagName === 'P') {
                frag.appendChild(__pToDiv(n));
            } else if (n.tagName === 'BR') {
                const d = document.createElement('div');
                d.appendChild(document.createElement('br'));
                frag.appendChild(d);
            }
        });
        div.replaceWith(frag);
    });

    // If root itself has top-level P/BR (no div lines yet), hoist them too
    const hasTopDiv = Array.from(root.childNodes).some(n => n.nodeType === 1 && n.tagName === 'DIV');
    const hasTopP = Array.from(root.childNodes).some(n => n.nodeType === 1 && n.tagName === 'P');
    if (!hasTopDiv && hasTopP) {
        const frag = document.createDocumentFragment();
        Array.from(root.childNodes).forEach(n => {
            if (n.nodeType === 1 && n.tagName === 'P') {
                frag.appendChild(__pToDiv(n));
            } else if (n.nodeType === 1 && n.tagName === 'BR') {
                const d = document.createElement('div');
                d.appendChild(document.createElement('br'));
                frag.appendChild(d);
            } else {
                frag.appendChild(n);
            }
        });
        root.innerHTML = '';
        root.appendChild(frag);
    }
}

// 2) Unwrap spans that wrap block children (DIV/P/BR), keeping inline styles on the line content
// Unwrap ANY span that wraps block children (DIV/P/BR), keeping inline styles.
// Deep + reverse so we process innermost spans first.
// Unwrap spans that wrap block lines (DIV/P/BR), carrying inline styles down.
// Works even when the SPAN is the only child of a line DIV, and recurses deep.
function __unwrapSpansWrappingBlocksDeep(root) {
    if (!root) return;

    let changed = true;
    while (changed) {
        changed = false;

        // Go inside-out so inner spans unwrap before outers
        const spans = Array.from(root.querySelectorAll('span')).reverse();

        for (const span of spans) {
            // Skip if span is already detached
            if (!span.parentNode) continue;

            const kids = Array.from(span.childNodes);

            // Does this span contain only block-ish nodes and/or whitespace text?
            const onlyBlockishOrWS = kids.length > 0 && kids.every(n => {
                if (n.nodeType === 3) return !/\S/.test(n.nodeValue || ""); // whitespace text
                if (n.nodeType === 1) return (n.tagName === 'DIV' || n.tagName === 'P' || n.tagName === 'BR' || n.tagName === 'SPAN');
                return false;
            });

            if (!onlyBlockishOrWS) continue;

            // Gather inline styles to carry
            const s = span.style || {};
            const carry = {
                fontSize: s.fontSize || '',
                fontFamily: s.fontFamily || '',
                fontWeight: s.fontWeight || '',
                fontStyle: s.fontStyle || '',
                color: s.color || ''
            };
            const hasCarry = !!(carry.fontSize || carry.fontFamily || carry.fontWeight || carry.fontStyle || carry.color);

            // Build replacement fragment
            const frag = document.createDocumentFragment();

            const makeLineDiv = () => {
                const d = document.createElement('div');
                if (hasCarry) {
                    const wrap = document.createElement('span');
                    if (carry.fontSize) wrap.style.fontSize = carry.fontSize;
                    if (carry.fontFamily) wrap.style.fontFamily = carry.fontFamily;
                    if (carry.fontWeight) wrap.style.fontWeight = carry.fontWeight;
                    if (carry.fontStyle) wrap.style.fontStyle = carry.fontStyle;
                    if (carry.color) wrap.style.color = carry.color;
                    d.appendChild(wrap);
                    return { line: d, sink: wrap };
                }
                return { line: d, sink: d };
            };

            for (const n of kids) {
                if (n.nodeType === 3) {
                    // ignore pure whitespace between block children
                    if (!/\S/.test(n.nodeValue || "")) continue;
                    // if real text appears (rare in this case), keep it on its own styled line
                    const { line, sink } = makeLineDiv();
                    sink.appendChild(n.cloneNode(true));
                    frag.appendChild(line);
                    continue;
                }

                if (n.tagName === 'BR') {
                    const { line, sink } = makeLineDiv();
                    sink.appendChild(document.createElement('br'));
                    frag.appendChild(line);
                    continue;
                }

                if (n.tagName === 'P' || n.tagName === 'DIV') {
                    const { line, sink } = makeLineDiv();
                    // Move *contents* of the block into the styled sink
                    const tmp = n.cloneNode(true);
                    while (tmp.firstChild) sink.appendChild(tmp.firstChild);
                    frag.appendChild(line);
                    continue;
                }

                if (n.tagName === 'SPAN') {
                    // Recurse into nested span by cloning, then its children will be handled next loop
                    const tmp = n.cloneNode(true);
                    const { line, sink } = makeLineDiv();
                    while (tmp.firstChild) sink.appendChild(tmp.firstChild);
                    frag.appendChild(line);
                    continue;
                }
            }

            // Replace span (or its parent div if span is the only child) with flattened lines
            if (span.parentElement && span.parentElement.tagName === 'DIV' && span.parentElement.childNodes.length === 1) {
                span.parentElement.replaceWith(frag);
            } else {
                span.replaceWith(frag);
            }

            changed = true;
        }
    }
}



// 3) Ensure truly-empty lines become <div><br></div> (so blank lines stay visible)
function __fixEmptyLineDivs(root) {
    Array.from(root.querySelectorAll('div')).forEach(d => {
        // already has a BR somewhere inside → it's a blank line, leave it
        if (d.querySelector('br')) return;

        const text = (d.textContent || '').replace(/\u200B/g, '');
        const onlyWS = !/[^\s\u00A0]/.test(text);

        if (onlyWS) {
            d.innerHTML = '';
            d.appendChild(document.createElement('br'));
        }
    });
}

function __unwrapSpanBlocks(root) {
    // Find spans that are *direct* children of a DIV and only contain block-ish nodes
    Array.from(root.querySelectorAll('div > span')).forEach(span => {
        const kids = Array.from(span.childNodes);
        const onlyBlockish = kids.length &&
            kids.every(n => n.nodeType === 1 && (n.tagName === 'DIV' || n.tagName === 'P' || n.tagName === 'BR'));

        if (!onlyBlockish) return;

        // carry inline text styles from span
        const s = span.style || {};
        const carry = {
            fontSize: s.fontSize, fontFamily: s.fontFamily,
            fontWeight: s.fontWeight, fontStyle: s.fontStyle, color: s.color
        };

        const frag = document.createDocumentFragment();

        kids.forEach(n => {
            // Normalize each child into a line <div>
            let line;
            if (n.tagName === 'BR') {
                line = document.createElement('div');
                line.appendChild(document.createElement('br'));       // <div><br></div>
            } else if (n.tagName === 'P' || n.tagName === 'DIV') {
                line = document.createElement('div');
                while (n.firstChild) line.appendChild(n.firstChild);  // move contents out
            } else {
                return;
            }

            // if span had inline styles, wrap the line contents to preserve them
            if (carry.fontSize || carry.fontFamily || carry.fontWeight || carry.fontStyle || carry.color) {
                const wrap = document.createElement('span');
                if (carry.fontSize) wrap.style.fontSize = carry.fontSize;
                if (carry.fontFamily) wrap.style.fontFamily = carry.fontFamily;
                if (carry.fontWeight) wrap.style.fontWeight = carry.fontWeight;
                if (carry.fontStyle) wrap.style.fontStyle = carry.fontStyle;
                if (carry.color) wrap.style.color = carry.color;
                while (line.firstChild) wrap.appendChild(line.firstChild);
                line.appendChild(wrap);
            }

            frag.appendChild(line);
        });

        // Replace the original <div><span>…</span></div> block
        span.parentElement.replaceWith(frag);
    });
}
function __stripOneLeadingLF(el) {
    const n = el && el.firstChild;
    if (n && n.nodeType === 3) {                 // text node
        n.nodeValue = n.nodeValue.replace(/^\r?\n/, '');
        if (n.nodeValue === '') el.removeChild(n); // clean empty node
    }
}
function __stripOneTrailingLF(el) {
    const n = el && el.lastChild;
    if (n && n.nodeType === 3) {
        n.nodeValue = n.nodeValue.replace(/\r?\n$/, '');
        if (n.nodeValue === '') el.removeChild(n);
    }
}
// optional: trim one leading LF on every top-level line div
function __stripLeadingLFOnTopLines(root) {
    Array.from(root.children).forEach(d => {
        if (d.tagName === 'DIV') __stripOneLeadingLF(d);
    });
}
function __getCaretLineOffset(root) {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return null;
    const r = sel.getRangeAt(0);
    // find top-level line div
    let line = r.startContainer;
    while (line && line !== root && line.parentNode !== root) line = line.parentNode;
    if (!line || line === root) return { lineIndex: Math.max(0, root.children.length - 1), ch: 0 };

    const lineIndex = Array.prototype.indexOf.call(root.children, line);

    // accumulate character offset inside that line
    const walker = document.createTreeWalker(line, NodeFilter.SHOW_TEXT);
    let ch = 0, n;
    while ((n = walker.nextNode())) {
        if (n === r.startContainer) { ch += r.startOffset; return { lineIndex, ch }; }
        ch += n.nodeValue.length;
    }
    return { lineIndex, ch: 0 }; // e.g., caret before <br>
}

function __setCaretLineOffset(root, pos) {
    const line = root.children[pos?.lineIndex] || root.lastElementChild || root;
    if (!line) return;

    const walker = document.createTreeWalker(line, NodeFilter.SHOW_TEXT);
    let remaining = pos.ch, n;
    while ((n = walker.nextNode())) {
        const len = n.nodeValue.length;
        if (remaining <= len) {
            const r = document.createRange();
            r.setStart(n, Math.max(0, remaining));
            r.collapse(true);
            const sel = window.getSelection();
            sel.removeAllRanges(); sel.addRange(r);
            return;
        }
        remaining -= len;
    }

    // no text nodes → place before <br> or create one
    const sel = window.getSelection();
    const r = document.createRange();
    if (line.firstChild) { r.setStart(line, 0); }
    else {
        const tn = document.createTextNode('');
        line.appendChild(tn);
        r.setStart(tn, 0);
    }
    r.collapse(true);
    sel.removeAllRanges(); sel.addRange(r);
}
// ================= nearest text style (single, complete) ===================

// 1) caret node inside root (textEditorNew by default)
function __getCaretNode(root = textEditorNew) {
    const sel = window.getSelection?.();
    if (!sel || sel.rangeCount === 0) return null;
    const r = sel.getRangeAt(0);
    let n = r.startContainer || r.commonAncestorContainer;
    if (n === root && root.firstChild) n = root.firstChild;
    return n;
}

// 2) ensure an element (if caret is in a text node)
function __toElement(node) {
    if (!node) return null;
    return node.nodeType === 1 ? node : node.parentElement;
}

// 3) semantic tags that imply style even without inline CSS
function __applySemanticStyle(el, out) {
    if (!el) return;
    const tag = el.tagName;
    if (tag === 'B' || tag === 'STRONG') out.fontWeight = 'bold';
    if (tag === 'I' || tag === 'EM') out.fontStyle = 'italic';
    if (tag === 'U') out.textDecoration = 'underline';
}

// 4) walk up to find the closest element that *sets* font-related style
function __closestStyleElement(node, root) {
    let el = __toElement(node);
    let firstElement = el;
    while (el && el !== root && el.nodeType === 1) {
        const st = el.getAttribute && el.getAttribute('style');
        const setsFont = st && /(font|text-decoration|font-weight|font-style|font-family)/i.test(st);
        const isSemantic = /^(B|STRONG|I|EM|U|SPAN)$/i.test(el.tagName);
        if (setsFont || isSemantic) return el;
        el = el.parentElement;
    }
    return firstElement || root || null;
}

// 5) produce a concise style summary (computed + inline overrides + semantics)
function __styleSummaryFor(el, root) {
    if (!el) return null;

    const inline = el.style || {};
    const has = prop => inline && inline[prop] && inline[prop].trim().length;

    const cs = window.getComputedStyle(el);

    const summary = {
        fontFamily: has('fontFamily') ? inline.fontFamily : cs.fontFamily,
        fontWeight: has('fontWeight') ? inline.fontWeight : cs.fontWeight,
        fontStyle: has('fontStyle') ? inline.fontStyle : cs.fontStyle,
        fontSize: has('fontSize') ? inline.fontSize : cs.fontSize,
        color: has('color') ? inline.color : cs.color,
        textDecoration: has('textDecoration') ? inline.textDecoration : cs.textDecoration
    };

    __applySemanticStyle(el, summary);

    // normalize numeric weights to normal/bold (optional)
    const fw = String(summary.fontWeight || '');
    if (/^\d+$/.test(fw)) summary.fontWeight = (parseInt(fw, 10) >= 600) ? 'bold' : 'normal';

    // clean family to first name (optional)
    if (summary.fontFamily) {
        summary.fontFamily = summary.fontFamily.split(',')[0].trim().replace(/^["']|["']$/g, '');
    }

    return summary;
}

// 6) public function: call this whenever you need the current style
function getNearestTextStyle(root = textEditorNew) {
    const node = __getCaretNode(root);
    if (!node) return null;
    const el = __closestStyleElement(node, root);
    return __styleSummaryFor(el, root);
}

// ================= wire it once (minimal) ==================================
(function wireNearestStyle() {
    const root = window.textEditorNew;
    if (!root) return;

    const report = () => {
        const style = getNearestTextStyle(root);
        if (!style) return;
        // TODO: update your UI (replace console.log)
       // console.log('[nearest-style]', style);
        // e.g., toolbar.setFontFamily(style.fontFamily); toolbar.setFontWeight(style.fontWeight);
    };

    const reportRAF = (() => { let id; return () => { cancelAnimationFrame(id); id = requestAnimationFrame(report); }; })();

    root.addEventListener('mouseup', reportRAF);
    root.addEventListener('keyup', (e) => {
        if (
            e.key.length === 1 ||
            e.key.startsWith('Arrow') ||
            e.key === 'Home' || e.key === 'End' ||
            e.key === 'Enter' || e.key === 'Backspace' ||
            e.key === 'Delete' || e.key === 'Tab'
        ) reportRAF();
    });
    document.addEventListener('selectionchange', () => {
        const sel = window.getSelection();
        if (sel && sel.rangeCount && root.contains(sel.anchorNode)) reportRAF();
    });
    root.addEventListener('focusin', reportRAF);
    root.addEventListener('paste', () => setTimeout(reportRAF, 0));
    root.addEventListener('compositionend', reportRAF); // IME

    // fire once if caret already inside
    const sel = window.getSelection();
    if (sel && sel.rangeCount && root.contains(sel.anchorNode)) reportRAF();
})();
// ===== STYLE SYNC PACK =====================================================

// -- tiny helpers
const __rgbToHex = (rgb) => {
    // rgb(a) → #RRGGBB
    if (!rgb) return "#000000";
    const m = rgb.replace(/\s+/g, '').match(/^rgba?\((\d+),(\d+),(\d+)/i);
    if (!m) return rgb; // already hex or named
    const toHex = x => ('0' + (parseInt(x, 10) & 255).toString(16)).slice(-2);
    return `#${toHex(m[1])}${toHex(m[2])}${toHex(m[3])}`.toUpperCase();
};

const __closestOptionValue = (selectEl, pxStr) => {
    if (!selectEl) return pxStr;
    const want = Math.round(parseFloat(pxStr || 0));
    let best = selectEl.options[0]?.value || (want + "px");
    let bestDiff = Infinity;
    for (const opt of selectEl.options) {
        const v = Math.round(parseFloat(opt.value || 0));
        const d = Math.abs(v - want);
        if (d < bestDiff) { bestDiff = d; best = opt.value; }
    }
    return best;
};

const __toggleClass = (el, cls, on) => { if (el) el.classList.toggle(cls, !!on); };

// -- style extraction
function __getCaretNode(root) {
    const sel = window.getSelection?.();
    if (!sel || !sel.rangeCount) return null;
    const r = sel.getRangeAt(0);
    let n = r.startContainer || r.commonAncestorContainer;
    if (n === root && root.firstChild) n = root.firstChild;
    return n;
}

function __toElement(node) { return !node ? null : (node.nodeType === 1 ? node : node.parentElement); }
function __applySemantic(el, sum) {
    if (!el) return;
    const t = el.tagName;
    if (t === 'B' || t === 'STRONG') sum.fontWeight = 'bold';
    if (t === 'I' || t === 'EM') sum.fontStyle = 'italic';
    if (t === 'U') sum.textDecoration = 'underline';
}

function __closestStyleElement(node, root) {
    let el = __toElement(node);
    let first = el;
    while (el && el !== root && el.nodeType === 1) {
        const st = el.getAttribute && el.getAttribute('style');
        const setsFont = st && /(font|text-decoration|font-weight|font-style|font-family)/i.test(st);
        const semantic = /^(B|STRONG|I|EM|U|SPAN)$/i.test(el.tagName);
        if (setsFont || semantic) return el;
        el = el.parentElement;
    }
    return first || root || null;
}

function __nearestStyleSummary(root) {
    const node = __getCaretNode(root);
    if (!node) return null;
    const el = __closestStyleElement(node, root);
    if (!el) return null;

    const inline = el.style || {};
    const cs = getComputedStyle(el);

    const pick = (prop) => (inline[prop] && inline[prop].trim()) ? inline[prop] : cs[prop];

    const sum = {
        fontFamily: pick('fontFamily'),
        fontWeight: pick('fontWeight'),
        fontStyle: pick('fontStyle'),
        fontSize: pick('fontSize'),
        color: pick('color'),
        textDecoration: pick('textDecoration')
    };
    __applySemantic(el, sum);

    // normalize weight
    const fwNum = parseInt(sum.fontWeight, 10);
    if (!isNaN(fwNum)) sum.fontWeight = (fwNum >= 600) ? 'bold' : 'normal';

    // normalize family → first name
    if (sum.fontFamily) {
        sum.fontFamily = sum.fontFamily.split(',')[0].trim().replace(/^["']|["']$/g, '');
    }
    return sum;
}

// -- UI updater
//function __updateToolbarFromStyle(style) {
//    if (!style) return;

//    // 1) Font size select
//    const sizeSel = document.getElementById('fontSizeSelect');
//    if (sizeSel) {
//        const best = __closestOptionValue(sizeSel, style.fontSize);
//        if (sizeSel.value !== best) sizeSel.value = best;
//    }

//    // 2) Color input (#favcolor expects hex)
//    const colorInput = document.getElementById('favcolor');
//    if (colorInput) {
//        const hex = __rgbToHex(style.color || '#000');
//        if (colorInput.value.toUpperCase() !== hex) colorInput.value = hex;
//    }

//    // 3) Bold / Italic buttons
//    __toggleClass(document.getElementById('boldBtn'), 'active', style.fontWeight === 'bold');
//    __toggleClass(document.getElementById('italicBtn'), 'active', style.fontStyle === 'italic');

//    // 4) Font family list (your <ul class="TextStyle">)
//    //    We’ll mark the <a> whose text OR family name matches as active.
//    const list = document.querySelector('ul.TextStyle');
//    if (list) {
//        // clear previous
//        list.querySelectorAll('a').forEach(a => a.classList.remove('active'));
//        // find match
//        const want = (style.fontFamily || '').toLowerCase();
//        let match = null;

//        // (a) match by the onclick argument OnChangefontFamily('Name')
//        match = Array.from(list.querySelectorAll('a')).find(a => {
//            const oc = a.getAttribute('onclick') || '';
//            return oc.toLowerCase().includes("'" + want + "'") || oc.toLowerCase().includes('"' + want + '"');
//        });

//        // (b) fallback: match by visible text
//        if (!match) {
//            match = Array.from(list.querySelectorAll('a')).find(a => a.textContent.trim().toLowerCase() === want);
//        }

//        if (match) match.classList.add('active');
//    }
//}

// -- wiring (one RAF-throttled reporter)
(function wireStyleSync() {
    const root = window.textEditorNew;
    if (!root) return;

    let rafId;
    const report = () => {
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
            const style = __nearestStyleSummary(root);
            __updateToolbarFromStyle(style);
        });
    };

    // Mouse & keyboard move caret or change style
    root.addEventListener('mouseup', report);
    root.addEventListener('keyup', (e) => {
        if (
            e.key.length === 1 || e.key.startsWith('Arrow') ||
            e.key === 'Enter' || e.key === 'Backspace' || e.key === 'Delete' ||
            e.key === 'Home' || e.key === 'End' || e.key === 'Tab'
        ) report();
    });

    // Selection changes (dragging, programmatic)
    document.addEventListener('selectionchange', () => {
        const sel = window.getSelection?.();
        if (sel && sel.rangeCount && root.contains(sel.anchorNode)) report();
    });

    // After paste / focus
    root.addEventListener('paste', () => setTimeout(report, 0));
    root.addEventListener('focusin', report);

    // initial
    report();
})();
function __normalizeFamily(name) {
    if (!name) return "";
    let n = name.split(",")[0].trim().replace(/^["']|["']$/g, "");
    n = n.replace(/\s+/g, " ").toLowerCase();
    n = n.replace(/\s*regular\b/g, "");
    return n;
}

function __toggleActiveClass(el, className, on) {
    if (!el) return;
    el.classList.toggle(className, !!on);
}

function __toggleBtnAndIcon(btn, className, on) {
    if (!btn) return;
    __toggleActiveClass(btn, className, on);
    //const icon = btn.querySelector("i");
    //if (icon) __toggleActiveClass(icon, className, on);
}

function __extractOnclickFamily(aEl) {
    const oc = aEl.getAttribute("onclick") || "";
    const m = oc.match(/OnChangefontFamily\(['"]([^'"]+)['"]\)/i);
    return m ? m[1] : "";
}

function __updateToolbarFromStyle(style) {
    if (!style) return;

    // 1) Font size select (choose closest)
    const sizeSel = document.getElementById("fontSizeSelect");
    if (sizeSel) {
        const want = Math.round(parseFloat(style.fontSize || 0));
        let best = sizeSel.value, bestDiff = Infinity;
        for (const opt of sizeSel.options) {
            const v = Math.round(parseFloat(opt.value || 0));
            const d = Math.abs(v - want);
            if (d < bestDiff) { bestDiff = d; best = opt.value; }
        }
        if (sizeSel.value !== best) sizeSel.value = best;
    }

    // 2) Color input → hex
    const colorInput = document.getElementById("favcolor");
    if (colorInput) {
        const toHex = (c) => {
            const m = (c || "").replace(/\s+/g, '').match(/^rgba?\((\d+),(\d+),(\d+)/i);
            if (!m) return (c || "#000000");
            const h = x => ("0" + (parseInt(x, 10) & 255).toString(16)).slice(-2);
            return ("#" + h(m[1]) + h(m[2]) + h(m[3])).toUpperCase();
        };
        const hex = toHex(style.color || "#000");
        if (colorInput.value.toUpperCase() !== hex) colorInput.value = hex;
    }

    // 3) Bold / Italic with custom classes
    const isBold = (String(style.fontWeight).toLowerCase() === "bold" || parseInt(style.fontWeight, 10) >= 600);
    const isItalic = (String(style.fontStyle).toLowerCase() === "italic");

    __toggleBtnAndIcon(document.getElementById("boldBtn"), "activeBold", isBold);
    __toggleBtnAndIcon(document.getElementById("italicBtn"), "activeItalic", isItalic);

    // 4) Font family list — robust matching with custom active class
    const list = document.querySelector("ul.TextStyle");
    if (list) {
        // clear previous custom active
        list.querySelectorAll("a").forEach(a => a.classList.remove("activeFontfamily"));

        const want = __normalizeFamily(style.fontFamily);
        let match = null;

        // (a) match by onclick payload
        match = Array.from(list.querySelectorAll("a")).find(a => {
            const ocFam = __normalizeFamily(__extractOnclickFamily(a));
            return ocFam === want;
        });

        // (b) match by visible text
        if (!match) {
            match = Array.from(list.querySelectorAll("a")).find(a =>
                __normalizeFamily(a.textContent || "") === want
            );
        }

        // (c) match by class name hint
        if (!match) {
            match = Array.from(list.querySelectorAll("a")).find(a =>
                __normalizeFamily(a.className || "").includes(want)
            );
        }

        // (d) starts-with fallback (e.g., "georgia" vs "georgia regular")
        if (!match && want) {
            match = Array.from(list.querySelectorAll("a")).find(a => {
                const ocFam = __normalizeFamily(__extractOnclickFamily(a));
                return ocFam.startsWith(want) || want.startsWith(ocFam);
            });
        }

        if (match) match.classList.add("activeFontfamily");
    }
}

// ========= STYLE CLIPBOARD =========
let __styleClipboard = null;

// normalize / sanitize bits for consistent paste
function __normTextDecoration(value) {
    if (!value) return 'none';
    const v = String(value).toLowerCase();
    return v.includes('underline') ? 'underline' : 'none';
}
function __normFontWeight(value) {
    if (!value) return 'normal';
    const v = String(value).toLowerCase();
    if (v === 'bold') return 'bold';
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? (n >= 600 ? 'bold' : 'normal') : 'normal';
}
function __firstFamily(name) {
    if (!name) return '';
    return name.split(',')[0].trim().replace(/^["']|["']$/g, '');
}

// Convert the style summary → inline CSS object
function __styleSummaryToInline(style) {
    if (!style) return null;
    return {
        fontFamily: __firstFamily(style.fontFamily) || '',
        fontSize: style.fontSize || '',
        fontWeight: __normFontWeight(style.fontWeight),
        fontStyle: (String(style.fontStyle || '').toLowerCase() === 'italic') ? 'italic' : 'normal',
        color: style.color || '',
        textDecoration: __normTextDecoration(style.textDecoration),
    };
}

// Build a CSS text from the inline object
function __inlineToCssText(inline) {
    const parts = [];
    if (inline.fontFamily) parts.push(`font-family:"${inline.fontFamily.replace(/"/g, '\\"')}"`);
    if (inline.fontSize) parts.push(`font-size:${inline.fontSize}`);
    if (inline.fontWeight) parts.push(`font-weight:${inline.fontWeight}`);
    if (inline.fontStyle) parts.push(`font-style:${inline.fontStyle}`);
    if (inline.color) parts.push(`color:${inline.color}`);
    if (inline.textDecoration) parts.push(`text-decoration:${inline.textDecoration}`);
    return parts.join(';');
}

// ========= COPY =========
function copyTextStyle(root = window.textEditorNew) {
    const style = getNearestTextStyle(root);
    if (!style) return;
    __styleClipboard = __styleSummaryToInline(style);
    // enable paste button
    const btn = document.getElementById('pasteStyleBtn');
    if (btn) btn.disabled = false;
}

// ========= PASTE (apply to selection or caret) =========
function pasteTextStyle(root = window.textEditorNew) {
    if (!__styleClipboard || !root) return;

    const sel = window.getSelection?.();
    if (!sel || !sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    // ensure selection is inside the editor
    if (!root.contains(range.commonAncestorContainer)) return;

    const cssText = __inlineToCssText(__styleClipboard);

    if (range.collapsed) {
        // collapsed: insert a styled span and keep caret inside
        const span = document.createElement('span');
        span.setAttribute('style', cssText);
        // use a zero-width non-joiner to keep caret
        span.textContent = '\u200C';
        range.insertNode(span);

        // move caret inside span, after the ZWNJ
        sel.removeAllRanges();
        const r = document.createRange();
        r.setStart(span.firstChild, 1);
        r.setEnd(span.firstChild, 1);
        sel.addRange(r);
        return;
    }

    // non-collapsed: try surroundContents; if it fails, use a text-wrapping fallback
    try {
        const wrapper = document.createElement('span');
        wrapper.setAttribute('style', cssText);
        range.surroundContents(wrapper);

        // reselect the wrapped content (optional)
        sel.removeAllRanges();
        const r2 = document.createRange();
        r2.selectNodeContents(wrapper);
        sel.addRange(r2);
    } catch (err) {
        // Fallback: wrap each text node portion that intersects the range
        __wrapIntersectionsWithStyle(range, cssText);

        // set caret at end of the pasted region for a smooth UX
        const endRange = document.createRange();
        endRange.setStart(range.endContainer, Math.min(range.endOffset, (range.endContainer.nodeType === 3 ? range.endContainer.length : range.endContainer.childNodes.length)));
        endRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(endRange);
    }
}

// Walk text nodes intersecting the range and wrap selected portions
function __wrapIntersectionsWithStyle(range, cssText) {
    const root = range.commonAncestorContainer;
    const tw = document.createTreeWalker(
        root,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode(node) {
                if (!node.nodeValue || !node.nodeValue.length) return NodeFilter.FILTER_REJECT;
                try { return range.intersectsNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT; }
                catch { return NodeFilter.FILTER_REJECT; }
            }
        }
    );

    const targets = [];
    for (let n = tw.nextNode(); n; n = tw.nextNode()) targets.push(n);

    targets.forEach(node => {
        let start = 0, end = node.nodeValue.length;

        if (node === range.startContainer) start = range.startOffset;
        if (node === range.endContainer) end = range.endOffset;

        if (start >= end) return;

        // split end first to preserve offsets
        if (end < node.length) node.splitText(end);
        let mid = node;
        if (start > 0) mid = node.splitText(start);

        const span = document.createElement('span');
        span.setAttribute('style', cssText);
        mid.parentNode.insertBefore(span, mid);
        span.appendChild(mid);
    });
}

// ========= BUTTON WIRING =========
// Robust wiring: works for late-rendered buttons too
(function wireCopyPasteButtons() {
    // 1) Delegate clicks anywhere in the document
    document.addEventListener('click', function (e) {
        const copyBtn = e.target.closest('#copyStyleBtn');
        const pasteBtn = e.target.closest('#pasteStyleBtn');

        if (copyBtn) {
            e.preventDefault();
            // textEditorNew must be globally accessible
            copyTextStyle(window.textEditorNew);
        }
        if (pasteBtn) {
            e.preventDefault();
            pasteTextStyle(window.textEditorNew);
        }
    });

    // 2) Optional: enable paste button after first copy via a simple event
    //    (if you already enable it in copyTextStyle, you can skip this)
    document.addEventListener('style:copied', () => {
        const pb = document.getElementById('pasteStyleBtn');
        if (pb) pb.disabled = false;
    });

    // 3) Safety: if buttons already exist at load, nothing else needed.
    //    If your UI mounts after DOMContentLoaded, delegation still works.
})();
document.addEventListener('DOMContentLoaded', () => {
    const copyBtn = document.getElementById('copyStyleBtn');
    const pasteBtn = document.getElementById('pasteStyleBtn');
    if (copyBtn) copyBtn.addEventListener('click', () => copyTextStyle(textEditorNew));
    if (pasteBtn) pasteBtn.addEventListener('click', () => pasteTextStyle(textEditorNew));
});

///Style////////////////////////////////////

// util: add a class for some ms, then auto-remove
function flashClass(el, cls, ms = 1100) {
    if (!el) return;
    el.classList.add(cls);
    setTimeout(() => el.classList.remove(cls), ms);
}

// Wire clicks (delegation safe)
(function wireFancyButtons() {
    document.addEventListener('click', function (e) {
        const copyBtn = e.target.closest('#copyStyleBtn');
        const pasteBtn = e.target.closest('#pasteStyleBtn');

        if (copyBtn) {
            e.preventDefault();
            copyTextStyle(window.textEditorNew);
            // visual: copied success
            flashClass(copyBtn, 'is-copied', 950);

            // enable + hint paste button
            const pb = document.getElementById('pasteStyleBtn');
            if (pb) {
                pb.disabled = false;
                flashClass(pb, 'is-ready', 1200);
            }
        }

        if (pasteBtn) {
            e.preventDefault();
            pasteTextStyle(window.textEditorNew);
            // visual: magic paste
            flashClass(pasteBtn, 'is-magic', 1100);
        }
    });
})();
