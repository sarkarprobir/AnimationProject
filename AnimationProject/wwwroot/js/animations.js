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

let currentZIndex = 0;
function getNextZIndex() {
    return ++currentZIndex;
}
let layers = []; // global
//document.getElementById('alinear').classList.add('active_effect');
//const stream = canvas.captureStream(7); // Capture at 30 fps
//const recorder = new MediaRecorder(stream);
//const chunks = [];
const HANDLE_SIZE = 12;
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
const fontFamily = "Arial";
const textColor = "black";

// Default text style settings
const defaultFontSize = 35;
const defaultFontFamily = "Arial";
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
const padding =5;         // Padding inside the bounding box
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

////This is for delete text///////////////////
// Utility: Returns an object (text or image) if the (x,y) falls within its bounding box."

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
function hitTest(x, y) {
    // assuming each object has x,y,width,height
    const all = [...images, ...textObjects];
    return all.find(obj =>
        x >= obj.x &&
        x <= obj.x + obj.width &&
        y >= obj.y &&
        y <= obj.y + obj.height
    );
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
canvas.addEventListener("contextmenu", function (e) {
    e.preventDefault(); // Prevent default browser context menu
    const items = contextMenu.querySelectorAll('.context-options');
    const rect = canvas.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    const adjustX = -280;
    const adjustY = -30;
    const found = getObjectAtcontextmenu(offsetX, offsetY);
    if (found) {
        // ── If an object is found, show ALL menu items ────────────────
        items.forEach(li => {
            li.style.display = "block";
        });

        // Optionally disable/enable specific items based on 'found'
        // e.g. disable "Paste" if your clipboard is empty, or enable "Copy", "Delete", etc.

        contextMenu.style.left = e.clientX + adjustX + "px";
        contextMenu.style.top = e.clientY + adjustY + "px";
        contextMenu.style.display = "block";
        selectedForContextMenu = found.obj;
        selectedType = found.type;
    }
    else {
        // ── No object under cursor: show ONLY "Paste" ────────────────
        items.forEach(li => {
            items.forEach(li => {
                li.style.display = (li.id === "pasteOption") ? "block" : "none";
            });
        });

        contextMenu.style.left = e.clientX + adjustX + "px";
        contextMenu.style.top = e.clientY + adjustY + "px";
        contextMenu.style.display = "block";
        selectedForContextMenu = null;
        selectedType = null;
    }
});

// Hide the context menu when clicking elsewhere.
document.addEventListener("click", function (e) {
    contextMenu.style.display = "none";
});


// When the Delete option is clicked, remove the selected object.
document.getElementById("deleteOption").addEventListener("click", function (e) {
    if (selectedForContextMenu) {
        if (selectedType === "text") {
            textObjects = textObjects.filter(obj => obj !== selectedForContextMenu);
        } else if (selectedType === "image") {
            // Remove from images array
            images = images.filter(imgObj => imgObj !== selectedForContextMenu);
        }
        drawCanvas('Common');
        selectedForContextMenu = null;
        contextMenu.style.display = "none";
    }
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
    drawCanvas("Common");
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
function changeLineSpacing(deltaFactor) {
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

function ChangeAlignStyle(value) {
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








function OnChangefontFamily(value) {
    //const paddingX = 23;
    //const paddingY = 15;
    $("#fontFamily").val(value);
    const fontFamily = document.getElementById("fontFamily").value; // Font family from dropdown
    const Obj = textObjects.find(obj => obj.selected);
    if (Obj) {
        Obj.fontFamily = fontFamily || 'Arial';

        //// 3) Measure the text
        //const metrics = ctx.measureText(Obj.text);
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
        //    measuredHeight = Obj.fontSize;
        //}

        //// 5) Overwrite boundingWidth/boundingHeight with dynamic values + padding:
        //Obj.boundingWidth = measuredWidth + paddingX * 2;
        //Obj.boundingHeight = measuredHeight + paddingY * 2;
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
    const hiddenField = ($("#hdnTabType").val()  === 'In')
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
                obj.y = -canvas.height / 2 + offscreenMargin ;
                obj.exitX = obj.finalX;
                obj.exitY = canvas.height ;
                break;

            case "bottom":
                obj.x = obj.finalX;
                obj.y = canvas.height / 2 + 250;
                obj.exitX = obj.finalX;
                obj.exitY = -canvas.height/2;
                break;
            case "left":
                obj.x = -canvas.width/2 ;
                obj.y = obj.finalY;
                obj.exitX = canvas.width + margin;
                obj.exitY = obj.finalY;
                break;

            case "right":
                obj.x = canvas.width /2 +150;
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
                imgObj.exitY = canvas.height ;
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
            onStart: () => drawCanvas(condition),
            onUpdate: () => drawCanvas(condition),
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
        drawCanvas(condition);

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
                    duration: scaleInText*.20,
                    ease: "power1.in",
                    onUpdate: () => drawCanvas(condition)
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
                    onUpdate: () => drawCanvas(condition)
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
            drawCanvas(condition);
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
                drawCanvas(condition);
            },
            onUpdate: () => drawCanvas(condition)
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
        drawCanvas(condition);


        // ── IN ── (only if requested)
        if (tabType === "In") {
            tlText.to(units, {
                x: (i, target) => target.finalX,
                y: (i, target) => target.finalY,
                duration: individualIn,
                ease: "power1.in",
                stagger: staggerIn,
                onUpdate: () => drawCanvas(condition)
            }, 0);
        }

        // compute when the last In actually finishes
        const inEndTime = (tabType === "In")
            ? (units.length - 1) * staggerIn + individualIn
            : 0;

        // ── STAY ── (for both Stay and Out)
        if (tabType === "Stay" ) {
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
                onUpdate: () => drawCanvas(condition)
            }, 0);
        }

        // ── RESET “snap‐back” at end ──
        // total duration = inEndTime + stayTime + (if Out) last exit end
        let totalDuration = inEndTime ;
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
            drawCanvas(condition);
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

        const tl = gsap.timeline({ repeat: loopCount - 1, onUpdate: () => drawCanvas(condition) });

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
            drawCanvas(condition);
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

        const tl = gsap.timeline({ repeat: loopCount - 1, onUpdate: () => drawCanvas(condition) });

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
            drawCanvas(condition);
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

        const tl = gsap.timeline({ repeat: loopCount - 1, onStart: () => drawCanvas(condition), onUpdate: () => drawCanvas(condition) });

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
            drawCanvas(condition);
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
            onUpdate: () => drawCanvas(condition)
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
                    onUpdate: () => drawCanvas(condition)
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
                    onUpdate: () => drawCanvas(condition)
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

            drawCanvas(condition);
        });

    }




    // ── Shake (canvas-only) working but direction not working all──────────────────────────
    else if (animationType === "shakeCanvas") {
        const items = [...images.filter(i => !i.noAnim), ...textObjects.filter(t => !t.noAnim)];
        // reset home
        items.forEach(o => { o.x = o.finalX; o.y = o.finalY; });
        const tl = gsap.timeline({ repeat: loopCount - 1, onUpdate: () => drawCanvas(condition) });

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
            drawCanvas(condition);
        });
    }

    // ── Blur (canvas-only) not working───────────────────────────
    else if (animationType === "blurCanvas") {
        const items = [...images.filter(i => !i.noAnim), ...textObjects.filter(t => !t.noAnim)];
        items.forEach(o => { o.x = o.finalX; o.y = o.finalY; o.blur = 20; });
        const tl = gsap.timeline({ repeat: loopCount - 1, onUpdate: () => drawCanvas(condition) });

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
            drawCanvas(condition);
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
                drawCanvas(condition);
            },
            onUpdate: () => drawCanvas(condition),
            onComplete: () => {
                // snap back exactly to startRotation
                allItems.concat(staticItems).forEach(o => {
                    o.x = o.finalX;
                    o.y = o.finalY;
                    o.rotation = o.startRotation;
                });
               drawCanvas(condition);
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
        drawCanvas(condition);
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
                    onUpdate: () => drawCanvas(condition)
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
                    onUpdate: () => drawCanvas(condition)
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
                drawCanvas(condition);
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
        const tl = gsap.timeline({ repeat: loopCount - 1, onUpdate: () => drawCanvas(condition) });

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
            drawCanvas(condition);
        });
    }

    // ── BlurFlash (canvas-only) working───────────────────────
    else if (animationType === "blurFlashCanvas") {
        const items = [...images.filter(i => !i.noAnim), ...textObjects.filter(t => !t.noAnim)];
        items.forEach(o => { o.x = o.finalX; o.y = o.finalY; o.blur = 0; o.opacity = 1; });
        const tl = gsap.timeline({ repeat: loopCount - 1, onUpdate: () => drawCanvas(condition) });

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
            drawCanvas(condition);
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
        onUpdate: () => drawCanvas(condition)
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

    //if (tabType === "Out") {
    //    units.slice().reverse().forEach((unit, i) => {
    //        const start = delayP + i * staggerOut;

    //        tl.to(unit, {
    //            scaleX: 0,
    //            scaleY: 0,
    //            duration: 0.3,
    //            ease: "back.in"
    //        }, start);
    //    });
    //}

    //// 🔄 Reset everything at end of timeline
    //tl.eventCallback("onComplete", () => {
    //    [...animItems, ...staticItems].forEach(o => {
    //        o.x = o.finalX;
    //        o.y = o.finalY;
    //        o.scaleX = 1;
    //        o.scaleY = 1;
    //    });
    //    drawCanvas(condition);
    //});
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
        onUpdate: () => drawCanvas(condition)
    });

    // Pin static items immediately
    staticItems.forEach(o => {
        tl.set(o, { x: o.finalX, y: o.finalY, scaleX: 1, scaleY: 1 }, 0);
    });

        if(tabType === "In") {
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
                onUpdate: () => drawCanvas(condition)
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
                onUpdate: () => drawCanvas(condition)
            }, 0);
            
        }
}

    // ── Glitch (canvas-only) working ─────────────────────────
    else if (animationType === "glitchCanvas") {
        const items = [...images.filter(i => !i.noAnim), ...textObjects.filter(t => !t.noAnim)];
        items.forEach(o => { o.x = o.finalX; o.y = o.finalY; });
        const tl = gsap.timeline({ repeat: loopCount - 1, onUpdate: () => drawCanvas(condition) });

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
            drawCanvas(condition);
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
            onUpdate: function () { drawCanvas(condition); },
        });
    } else if (animationType === "elastic") {
        gsap.to(imagePosition, {
            x: endX,
            y: endY,
            duration: 2.5,
            ease: "elastic.out(1, 0.3)",
            onUpdate: function () { drawCanvas(condition); },
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
                onUpdate: function () { drawCanvas(condition); },
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
                onUpdate: function () { drawCanvas(condition); },
            }
        );
    } else if (animationType === "bounce") {
        gsap.to(imagePosition, {
            x: endX,
            y: endY,
            duration: 2,
            ease: "bounce.out",
            onUpdate: function () { drawCanvas(condition); },
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
            onUpdate: function () { drawCanvas(condition); },
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
                onUpdate: function () { drawCanvas(condition); },
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
                drawCanvas(condition);
            },
            onComplete: () => {
                ctx.filter = "none";
                drawCanvas(condition);
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
                onUpdate: function () { drawCanvas(condition); },
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
            onUpdate: function () { drawCanvas(condition); },
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
    drawCanvas(conditionvalue);

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
function setCoordinate(clickedElement, direction, imageStartX, imageStartY, imageEndX, imageEndY,from) {
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
        opacity:100
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
        fillNoColorStatus: srcObj.fillNoColorStatus|| false,
        strokeNoColorStatus: srcObj.strokeNoColorStatus || false,
        fillNoColor: srcObj.fillNoColor|| "#FFFFFF",
        strokeNoColor: srcObj.strokeNoColor ||"#FFFFFF",
        strokeWidth: parseInt(document.getElementById('ddlStrokeWidth').value, 10) || 3
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

pasteOption.addEventListener('click', () => {
    pasteFromClipboard();
});

// ─── 4) pasteFromClipboard implementation ───────────────────────────
function pasteFromClipboard() {
    // If nothing in clipboard, do nothing
    if (
        canvasClipboard.textItems.length === 0 &&
        canvasClipboard.imageItems.length === 0
    ) {
        return;
    }

    // 4.1) Clear existing selection
    textObjects.forEach(obj => obj.selected = false);
    images.forEach(img => img.selected = false);

    // Compute the current highest zIndex
    //const allItems = [...textObjects, ...images];
    //const maxZ = allItems.reduce((max, item) => Math.max(max, item.zIndex || 0), 0);

    //let currentZ = maxZ + 1;


    // 4.2) Paste text items at the same x/y as the original
    canvasClipboard.textItems.forEach(orig => {
        const pasted = cloneTextObject(orig);
        pasted.x = orig.x;
        pasted.y = orig.y;
        pasted.selected = true;
        pasted.zIndex = orig.zIndex;
        type: orig.type,
        textObjects.push(pasted);
    });

    // 4.3) Paste image items at the same x/y as the original
    canvasClipboard.imageItems.forEach(orig => {
        const pasted = cloneImageObject(orig);
        pasted.x = orig.x;
        pasted.y = orig.y;
        pasted.selected = true;
        pasted.zIndex = orig.zIndex;
        type: orig.type,
        images.push(pasted);
    });

    // 4.4) Redraw the canvas
    drawCanvas('Common');
}


//// ─── 5) Keyboard shortcuts (Ctrl+C, Ctrl+V) ─────────────────────────
//window.addEventListener('keydown', (e) => {
//    if (e.ctrlKey && (e.key === 'c' || e.key === 'C')) {
//        e.preventDefault();
//        copyOption.click();
//    }
//    if (e.ctrlKey && (e.key === 'v' || e.key === 'V')) {
//        e.preventDefault();
//        pasteFromClipboard();
//    }
//});
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
function isMouseOverImage(imgObj, pos) {
    // 1) Compute pixel dimensions & center
    const w = imgObj.width * (imgObj.scaleX || 1);
    const h = imgObj.height * (imgObj.scaleY || 1);
    const cx = imgObj.x + w / 2;
    const cy = imgObj.y + h / 2;

    // 2) Translate mouse into object‑center coords
    let dx = pos.x - cx;
    let dy = pos.y - cy;

    // 3) Inverse‐rotate the point by –rotation
    const rad = -(imgObj.rotation || 0) * Math.PI / 180;
    const cos = Math.cos(rad), sin = Math.sin(rad);
    const localX = dx * cos - dy * sin;
    const localY = dx * sin + dy * cos;

    // 4) Now do a simple half‑width/height check
    return (
        localX >= -w / 2 &&
        localX <= w / 2 &&
        localY >= -h / 2 &&
        localY <= h / 2
    );
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

    drawCanvas('Common');
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


canvas.addEventListener("mouseleave", function () {
    currentDrag = null;
    isResizing = false;
    isDragging = false;
    activeHandle = null;

    isDraggingImage = false;
    isResizingImage = false;

    isDraggingToSelect = false;
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
        document.getElementById("line_spacing_tool").style.display = 'none';
        document.getElementById("divStrockColor").style.display = 'none';
        document.getElementById("divFillColor").style.display = 'none';
        HideLoader();
    }
    else if (selectedType == 'Text') {
        heading.innerHTML = "Text";
        document.getElementById("text_alignment_tool").style.display = 'block';
        document.getElementById("text_decoration_tool").style.display = 'flex';
        document.getElementById("text_color_tool").style.display = 'block';
        document.getElementById("line_spacing_tool").style.display = 'block';
        document.getElementById("divStrockColor").style.display = 'none';
        document.getElementById("divFillColor").style.display = 'none';
        HideLoader();
    }
    else if (selectedType == 'Shape') {
        heading.innerHTML = "Shape";
        if (fontPannel) { fontPannel.style.display = 'none'; }
        document.getElementById("text_alignment_tool").style.display = 'none';
        document.getElementById("text_decoration_tool").style.display = 'none';
        document.getElementById("text_color_tool").style.display = 'none';
        document.getElementById("line_spacing_tool").style.display = 'none';
        HideLoader();
    }
    else if (selectedType == 'Icon') {
        heading.innerHTML = "Icon";
        if (fontPannel) { fontPannel.style.display = 'none'; }
        document.getElementById("text_alignment_tool").style.display = 'none';
        document.getElementById("text_decoration_tool").style.display = 'none';
        document.getElementById("text_color_tool").style.display = 'none';
        document.getElementById("line_spacing_tool").style.display = 'none';
        document.getElementById("divStrockColor").style.display = 'none';
        document.getElementById("divFillColor").style.display = 'none';
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
        HideLoader();
    }
}

// Arrow-key nudge: move all selected items by the arrow direction
document.addEventListener('keydown', function (e) {
    // only when the canvas is “active”—you can tighten this to a focused flag if you like
    const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    if (!arrowKeys.includes(e.key)) return;

    e.preventDefault();
    // how many pixels per tap? +Shift for larger step
    const step = e.shiftKey ? 10 : 1;
    let dx = 0, dy = 0;
    switch (e.key) {
        case 'ArrowUp': dy = -step; break;
        case 'ArrowDown': dy = step; break;
        case 'ArrowLeft': dx = -step; break;
        case 'ArrowRight': dx = step; break;
    }

    // move each selected text
    textObjects.filter(o => o.selected).forEach(o => {
        o.x += dx;
        o.y += dy;
    });

    // move each selected image
    images.filter(i => i.selected).forEach(i => {
        i.x += dx;
        i.y += dy;
    });

    // redraw with updated positions
    drawCanvas('Common');
});

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
    drawCanvas('Common');
    updateGroupCheckbox();
}
function generateUUID() {
    return 'xxxx-xxxx-4xxx'.replace(/[x]/g, c =>
        (Math.random() * 16 | 0).toString(16)
    );
}

function ImagePropertySet() {
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
}
canvasContainer.addEventListener("dblclick", function (e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const obj = getTextObjectAt(mouseX, mouseY);

    if (obj) {
        obj.editing = true;

        // Use the object's bounding box and padding to set the editor's dimensions.
        const editorX = obj.x - padding;  // Position relative to object's x
        const editorY = obj.y - padding;  // Position relative to object's y
        const offsetX = 260;  // adjust if needed
        const offsetY = 45;  // adjust if needed



        // Position the text editor over the object's bounding box.
        textEditor.style.left = `${rect.left + editorX - offsetX}px`;
        textEditor.style.top = `${rect.top + editorY + scrollTop - offsetY}px`;
        //textEditor.style.left = `${rect.left + editorX}px`;
        //textEditor.style.top = `${rect.top + editorY}px`;
        textEditor.style.width = `${obj.boundingWidth + 2 * padding}px`;
        textEditor.style.height = `${obj.boundingHeight + 2 * padding}px`;

        // Match styles with the text object.
        textEditor.style.fontSize = `${obj.fontSize}px`;
        textEditor.style.fontFamily = obj.fontFamily;
        textEditor.style.color = obj.textColor;
        textEditor.style.textAlign = obj.textAlign;
        /*textEditor.style.background = "rgba(255,255,255,0.95)";*/
        if (obj.textColor === "#000000") {
            // mostly‑opaque white
            textEditor.style.background = "rgba(255,255,255,0.95)";
        } else {
             textEditor.style.background = "rgba(34, 34, 34, 1)";
        }
        textEditor.style.border = "1px solid #ccc";
        textEditor.style.padding = "2px 4px";
        textEditor.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.3)";

        // Set the current text and show the editor.
        textEditor.value = obj.text.replace(/\\n/g, "\n");
        textEditor.style.display = "block";
        textEditor.focus();
        //requestAnimationFrame(() => {
        //    textEditor.setSelectionRange(0, 0);
        //});
        setTimeout(() => textEditor.setSelectionRange(0, 0), 0);
     

        // Finish editing when Enter is pressed (unless using Shift+Enter for a new line) or on blur.
       

        function finishEditing() {
            const editedText = textEditor.value;
            obj.editing = false;
            textEditor.style.display = "none";

            const ctx = canvas.getContext("2d");
            const padding = obj.padding || 10; // default padding if not set on obj
            const fontSize = obj.fontSize;
            ctx.font = `${fontSize}px ${obj.fontFamily}`;

            // Split text only on explicit newlines; no wrapping or font resizing
            const lines = editedText.split("\n");

            // Update obj properties
            obj.text = lines.join("\n");

            // Recompute bounding box width based on longest line
            const lineWidths = lines.map(line => ctx.measureText(line).width);
            const maxLineWidth = Math.max(...lineWidths, 0);
            obj.boundingWidth = maxLineWidth + 2 * padding;

            // Recompute bounding box height based on line count
            const lineHeight = fontSize * 1.2;
            obj.boundingHeight = lines.length * lineHeight + 2 * padding;

            drawCanvas('Common');
            textEditor.removeEventListener("blur", finishEditing);
        }


        //function onKeyDown(e) {
        //    if (e.key === "Enter" && !e.shiftKey) {
        //        finishEditing();
        //    }
        //}


       // textEditor.addEventListener("keydown", onKeyDown);
        textEditor.addEventListener("blur", finishEditing);
    }
});

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




function ChangeColor() {
    const colorPicker = document.getElementById("favcolor");
    $("#hdnTextColor").val(colorPicker.value);
    const textColor = document.getElementById("hdnTextColor").value; // Text color from dropdown 
    const Obj = textObjects.find(obj => obj.selected);
    if (Obj) {
        Obj.textColor = textColor || 'black';
    }
    drawCanvas('ChangeStyle');
}
function ChangeTranColor1() {
    const colorPicker = document.getElementById("tranColor1");
    $("#hdnTransition1").val(colorPicker.value);
    const textColor = document.getElementById("hdnTransition1").value; // Text color from dropdown 
    const Obj = textObjects.find(obj => obj.selected);
    if (Obj) {
        Obj.textColor = textColor || 'black';
    }
    drawCanvas('ChangeStyle');
}

function ChangeTranColor2() {
    const colorPicker = document.getElementById("tranColor2");
    $("#hdnTransition2").val(colorPicker.value);
    const textColor = document.getElementById("hdnTransition2").value; // Text color from dropdown 
    const Obj = textObjects.find(obj => obj.selected);
    if (Obj) {
        Obj.textColor = textColor || 'black';
    }
    drawCanvas('ChangeStyle');
}

function ChangeFillColor() {
    const noStrokeChecked = document.getElementById("noColorCheck2").checked;
    if (activeImage) {
        const fillColorPicker = document.getElementById("favFillcolor");
        $("#hdnfillColor").val(fillColorPicker.value);

        // Uncheck the "no color" box if color is manually changed
        document.getElementById("noColorCheck").checked = false;

        updateSelectedImageColors($("#hdnfillColor").val(), noStrokeChecked ? "none" : $("#hdnStrockColor").val(), document.getElementById("ddlStrokeWidth").value || 2);
        $("#hdnfillNoColorStatus").val(false);
    }
}
//No color option for fill color 
/*let previousFillColor = null; */

function SetNoFillColor() {
    const noColorChecked = document.getElementById("noColorCheck").checked;
    const fillColorPicker = document.getElementById("favFillcolor");

    const noStrokeChecked = document.getElementById("noColorCheck2").checked;
    if (activeImage) {
        if (noColorChecked) {
            // Store current color before removing
           // previousFillColor = fillColorPicker.value;
            $("#hdnfillColor").val("none");
          //  updateSelectedImageColors("none", $("#hdnStrockColor").val());

            updateSelectedImageColors(
                "none", noStrokeChecked ? "none" : $("#hdnStrockColor").val(),document.getElementById("ddlStrokeWidth").value || 2
            );

            $("#hdnfillNoColorStatus").val(true);
            $("#hdnfillColor").val(fillColorPicker.value);
        } else {
            $("#hdnfillNoColorStatus").val(false);
            /*document.getElementById("noColorCheck").checked = false;*/
            // Restore previous fill color
            //if (previousFillColor) {
            $("#hdnfillColor").val(fillColorPicker.value);
           // updateSelectedImageColors($("#hdnfillColor").val(), $("#hdnStrockColor").val());

            updateSelectedImageColors(
                $("#hdnfillColor").val(), noStrokeChecked ? "none" : $("#hdnStrockColor").val(), document.getElementById("ddlStrokeWidth").value || 2
            );

            //    // Also update the color picker value visually
            //    fillColorPicker.value = previousFillColor;
            //}
           /* ChangeFillColor();*/
        }
    }
}

function ChangeStrockColor() {
    const noColorChecked = document.getElementById("noColorCheck").checked;
    if (activeImage) {
        const strockColorPicker = document.getElementById("favStrockcolor");
        $("#hdnStrockColor").val(strockColorPicker.value);

        // Uncheck "no stroke color" checkbox
        document.getElementById("noColorCheck2").checked = false;

        updateSelectedImageColors(noColorChecked ? "none" : $("#hdnfillColor").val(), $("#hdnStrockColor").val(), document.getElementById("ddlStrokeWidth").value||2);
        $("#hdnstrokeNoColorStatus").val(false);
    }
}
//No color option for stroke color 
let previousStrokeColor = null; // Store the previous stroke color

function SetNoStrokeColor() {
    const noStrokeChecked = document.getElementById("noColorCheck2").checked;
    const strokeColorPicker = document.getElementById("favStrockcolor");

    const noColorChecked = document.getElementById("noColorCheck").checked;
    //previousStrokeColor = strokeColorPicker.value;
    if (activeImage) {
        if (noStrokeChecked) {
            // Save current stroke color
            /*previousStrokeColor = strokeColorPicker.value;*/
            $("#hdnStrockColor").val("none");
            updateSelectedImageColors(
                noColorChecked ? "none" : $("#hdnfillColor").val(),
                "none", document.getElementById("ddlStrokeWidth").value || 2
            );
          
            $("#hdnstrokeNoColorStatus").val(true);
            $("#hdnStrockColor").val(strokeColorPicker.value);
        } else {
            $("#hdnstrokeNoColorStatus").val(false);
           /* document.getElementById("noColorCheck2").checked = false;*/
            // Restore previous stroke color
            //if (previousStrokeColor) {
            $("#hdnStrockColor").val(strokeColorPicker.value);
            updateSelectedImageColors(noColorChecked ? "none" : $("#hdnfillColor").val(), $("#hdnStrockColor").val(), document.getElementById("ddlStrokeWidth").value || 2);

            //    // Also update the color picker UI
            //    strokeColorPicker.value = previousStrokeColor;
            //}
            //ChangeStrockColor();
        }
    }
}
//stroke width change function
function strokeWidthChanges() {
    const selectEl = document.getElementById("ddlStrokeWidth");
    const strokeWidth = selectEl.value;

    if (activeImage) {
        $("#hdnStrokeWidth").val(strokeWidth);

        // Update SVG stroke-width
        const fill = $("#hdnfillColor").val();
        const stroke = $("#hdnStrockColor").val();

        const noColorChecked = document.getElementById("noColorCheck").checked;
        const noStrokeChecked = document.getElementById("noColorCheck2").checked;

        updateSelectedImageColors(noColorChecked ? "none" : $("#hdnfillColor").val(), noStrokeChecked ? "none" : $("#hdnStrockColor").val(), strokeWidth);
    }

    // Remove 'selected' class from all options
    Array.from(selectEl.options).forEach(opt => opt.classList.remove("selected"));

    // Add 'selected' class to the selected option
    selectEl.options[selectEl.selectedIndex].classList.add("selected");
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
// When an image is dropped onto the canvas, add it to our images array
////canvas.addEventListener("drop", function (e) {
////    e.preventDefault();
////    const src = e.dataTransfer.getData("text/plain");
////    if (src) {
////        // Create a new image object
////        const img = new Image();
////        img.src = src;
////        img.onload = function () {
////            // Default position is drop position; default size is half the natural size
////            const newImgObj = {
////                img: img,
////                src: src, // keep the src path
////                x: e.offsetX,
////                y: e.offsetY,
////                width: img.width / 4,
////                height: img.height / 4,
////                scaleX: 1,
////                scaleY: 1,
////                selected: false
////            };
////            images.push(newImgObj);
////            drawCanvas('Common');
////        };
////    }
////});
canvas.addEventListener('drop', e => {
    e.preventDefault();

    let src = "";

    // 1) Preferred: a real URI (e.g. dragging from another site)
    // try text/uri-list first (for standards-compliant browsers)
    if (e.dataTransfer.types.includes('text/uri-list')) {
        src = e.dataTransfer.getData('text/uri-list').trim();
    }
    // fallback: if plain text *looks* like an http URL
    else {
        const plain = e.dataTransfer.getData('text/plain').trim();
        if (/^https?:\/\//i.test(plain)) {
            src = plain;
        }
    }

    // 2) If that fails, check for File objects (drag from Finder or Explorer)
    if (!src && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        if (file.type.startsWith('image/')) {
            src = URL.createObjectURL(file);
        }
    }

    // 3) Nothing valid? bail out
    if (!src) return;

    const img = new Image();
    img.onload = () => {
        // maximum dimension on drop
        const MAX_DIM = 200;

        // compute ratio so the longest side is MAX_DIM
        const ratio = img.width > img.height
            ? MAX_DIM / img.width
            : MAX_DIM / img.height;

        // never upscale small images
        const scale = Math.min(ratio, 1);

        // new “design-space” dimensions
        const newWidth = img.width * scale;
        const newHeight = img.height * scale;

        images.push({
            img,
            src,
            x: e.offsetX,
            y: e.offsetY,
            // assign downsized values here:
            width: newWidth,
            height: newHeight,
            // keep these at 1 so drawCanvas draws at exactly width×height:
            scaleX: 1,
            scaleY: 1,
            opacity: 100,
            selected: false,
            noAnim: false,
            groupId: null,
            rotation: 0,
            type: "image",
            zIndex: getNextZIndex(),
            fillNoColorStatus: false,
            strokeNoColorStatus: false,
            fillNoColor: "#FFFFFF",
            strokeNoColor: "#FFFFFF",
            strokeWidth: parseInt(document.getElementById('ddlStrokeWidth').value, 10) || 3
        });
        drawCanvas('Common');
    };
    img.src = src;
});
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
function updateSelectedImageColors(newFill, newStroke, newStrokeWidth = null) {
    const svgUrl = activeImage.originalSrc || activeImage.src;
    const isSvg = svgUrl.toLowerCase().endsWith('.svg');
    const isData = svgUrl.startsWith('data:image/svg+xml');
    if (!activeImage || (!isSvg && !isData) || !activeImage.img) {
        console.warn("activeImage is not an SVG");
        return;
    }
    if (!activeImage.originalSrc) activeImage.originalSrc = activeImage.src;
    const origW = activeImage.width, origH = activeImage.height;
    // stash strokeWidth so your selection‐box can pad accordingly:
    activeImage.strokeWidth = newStrokeWidth;

    function patchSvg(svgText) {
        const doc = new DOMParser().parseFromString(svgText, "image/svg+xml");
        const svg = doc.documentElement;

        // 1) expand viewBox by half the stroke on each side:
        if (newStrokeWidth != null) {
            svg.setAttribute("overflow", "visible");
            let vb = svg.getAttribute("viewBox");
            if (!vb) {
                // no viewBox? assume [0,0,width,height]
                vb = [0, 0, origW, origH];
            } else {
                vb = vb.split(/\s+|,/).map(Number);
            }
            const pad = newStrokeWidth / 2;
            vb[0] -= pad;
            vb[1] -= pad;
            vb[2] += pad * 2;
            vb[3] += pad * 2;
            svg.setAttribute("viewBox", vb.join(" "));
        }

        // 2) update <style>
        const styleEl = svg.querySelector("style");
        if (styleEl) {
            if (newFill !== null) styleEl.textContent = styleEl.textContent.replace(/fill:[^;]+;/g, `fill:${newFill};`);
            if (newStroke !== null) styleEl.textContent = styleEl.textContent.replace(/stroke:[^;]+;/g, `stroke:${newStroke};`);
            if (newStrokeWidth !== null) styleEl.textContent = styleEl.textContent.replace(/stroke-width:[^;]+;/g, `stroke-width:${newStrokeWidth};`);
        }

        // 3) inline attributes
        doc.querySelectorAll("*").forEach(el => {
            if (newFill !== null) el.setAttribute("fill", newFill);
            if (newStroke !== null) el.setAttribute("stroke", newStroke);
            if (newStrokeWidth !== null) el.setAttribute("stroke-width", newStrokeWidth);
        });

        return new XMLSerializer().serializeToString(doc);
    }

    function redraw(svgText) {
        const uri = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgText);
        const imgEl = activeImage.img;
        imgEl.onload = () => {
            activeImage.width = origW;
            activeImage.height = origH;
            activeImage.src = uri;
            drawCanvas("Common");
        };
        imgEl.src = uri;
    }

    if (activeImage.originalSVG) {
        redraw(patchSvg(activeImage.originalSVG));
    } else {
        fetch(svgUrl)
            .then(r => r.text())
            .then(text => {
                activeImage.originalSVG = text;
                redraw(patchSvg(text));
            })
            .catch(console.error);
    }
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
    drawCanvas('Common'); // Redraw the canvas without the background image.
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
                document.getElementById('lblSeconds').textContent = "3 Sec";
                document.getElementById('lblOutSpeed').textContent = "4 Sec";
                document.getElementById('lblLoop').textContent = "1 time";

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
document.addEventListener('click', function (event) {
    const popup = document.getElementById('elementsPopup');
    const button = document.querySelector('.elementsToggleBtn');

    if (!popup.contains(event.target) && !button.contains(event.target)) {
        popup.style.display = 'none';
    }
});
function boldText() {
    //const paddingX = 23;
    //const paddingY = 15;
    textObjects.forEach(obj => {
        if (obj.selected) obj.isBold = !obj.isBold;
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

function italicText() {
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
function sendToBack(item) {
    // item.zIndex = Math.min(...getAllItems().map(i => i.zIndex || 0)) - 1;
    const i = allItems.indexOf(item)
    if (i === -1) return
    allItems.splice(i, 1)     // remove it
    allItems.unshift(item)    // insert at start (bottom)
    reindex()
}
bringFrontOption.addEventListener('click', () => {
    if (!selectedForContextMenu) return;
    bringToFront(selectedForContextMenu);
    drawCanvas("Common");
    contextMenu.style.display = 'none';
});

sendBackOption.addEventListener('click', () => {
    if (!selectedForContextMenu) return;
    sendToBack(selectedForContextMenu);
    drawCanvas("Common");
    contextMenu.style.display = 'none';
});
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
const fontFamilyNew = "Arial";

let boxes = [];
let activeBox = null;
let isDraggingNew = false, isResizingNew = false, isEditing = false;
let resizeDirection = null;
let prevMouseX = 0, prevMouseY = 0;
let dragOffsetXNew = 0, dragOffsetYNew = 0;
let savedRange = null;
let isFontScaling = false;
let _cornerScale = null; // { cx, cy, startDist, startScale, baseFontSize }

const CORNER_HANDLES = new Set(["tl", "tr", "bl", "br", "top-left", "top-right", "bottom-left", "bottom-right"]);
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

function getCanvasMousePosition(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
    };
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
function getResizeHandle(box, mx, my) {
    const hit = 8;
    for (let [key, h] of Object.entries(getAllHandles(box))) {
        if (Math.abs(mx - h.x) < hit && Math.abs(my - h.y) < hit) return key;
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

        // Ensure empty lines have a <br>
        const isEmpty =
            !div ||
            div.innerText.trim() === "" ||
            div.innerHTML.trim() === "" ||
            div.innerHTML.includes("<br");

        if (isEmpty) {
            div.innerHTML = "<br>";
        }

        if (div) cleanedLines.push(div);
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
// 🟢 Fix line height calculation in drawText
// 🟢 Fix line height calculation in drawText
function drawText() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.textBaseline = "top";

    const defaultStyle = window.getComputedStyle(textEditorNew);
    const defaultFontSize = defaultStyle.fontSize || "16px";
    const defaultFontFamily = defaultStyle.fontFamily || "Arial";
    const defaultFontWeight = defaultStyle.fontWeight || "normal";
    const defaultFontStyle = defaultStyle.fontStyle || "normal";
    const defaultColor = defaultStyle.color || "#000";
    const defaultLineHeight = parseFloat(defaultStyle.lineHeight) || (parseFloat(defaultFontSize) * 1.2);

    for (const box of boxes) {
        ctx.save();

        if (!box.width || isNaN(box.width)) box.width = 50;
        if (!box.height || isNaN(box.height)) box.height = 30;

        const wrapper = document.createElement("div");
        wrapper.innerHTML = box.text;

        const lines = [];
        //let currentLine = document.createElement("div");
        //lines.push(currentLine);

        wrapper.childNodes.forEach(n => {
            if (n.nodeType === 1 && n.tagName === "DIV") {
                const hasContent = n.textContent.trim().length > 0 || n.children.length > 0;

                if (!hasContent) {
                    // Empty <div><br></div> → blank line
                    const blankLine = document.createElement("div");
                    blankLine.appendChild(document.createTextNode(" "));
                    lines.push(blankLine);
                } else {
                    const newLine = document.createElement("div");
                    newLine.append(...n.cloneNode(true).childNodes);
                    lines.push(newLine);
                }
            } else if (n.nodeType === 1 && n.tagName === "BR") {
                const brLine = document.createElement("div");
                brLine.appendChild(document.createTextNode(" "));
                lines.push(brLine);
            } else {
                // Text directly outside div (rare, but possible)
                if (lines.length === 0) {
                    lines.push(document.createElement("div"));
                }
                lines[lines.length - 1].appendChild(n.cloneNode(true));
            }
            
        });
        
        //wrapper.childNodes.forEach(n => {
        //    if (n.nodeType === 1 && n.tagName === "DIV") {
        //        if (currentLine.childNodes.length > 0) {
        //            currentLine = document.createElement("div");
        //            lines.push(currentLine);
        //        }
        //        currentLine.append(...n.childNodes);
        //        currentLine = document.createElement("div");
        //        lines.push(currentLine);
        //    } else if (n.nodeType === 1 && n.tagName === "BR") {
        //        currentLine = document.createElement("div");
        //        lines.push(currentLine);
        //    } else {
        //        currentLine.appendChild(n.cloneNode(true));
        //    }
        //});
      

        let cursorY = box.y + 5;
        let usedHeight = 0;

        lines.forEach(lineNode => {
            let cursorX = box.x + 5;
            if (box.align === "center") {
                ctx.textAlign = "center";
                cursorX = box.x + box.width / 2;
            } else if (box.align === "right") {
                ctx.textAlign = "right";
                cursorX = box.x + box.width - 5;
            } else {
                ctx.textAlign = "left";
            }

            let segments = [];
            let maxFontPx = 0;

            //function measureWords(node, style) {
            //    if (node.nodeType === 3) {
            //        const words = node.nodeValue.split("");
            //        for (let word of words) {
            //            const fs = style.fontSize || defaultFontSize;
            //            const ff = style.fontFamily || defaultFontFamily;
            //            const fw = style.fontWeight || defaultFontWeight;
            //            const fst = style.fontStyle || defaultFontStyle;
            //            const col = style.color || defaultColor;

            //            ctx.font = `${fst} ${fw} ${fs} ${ff}`;
            //            const width = ctx.measureText(word).width;
            //            const px = parseFloat(fs);
            //            if (!isNaN(px)) maxFontPx = Math.max(maxFontPx, px);

            //            segments.push({
            //                text: word,
            //                width,
            //                style: { fs, ff, fw, fst, col }
            //            });
            //        }
            //    } else if (node.nodeType === 1) {
            //        const s = node.style;
            //        const nextStyle = {
            //            fontSize: s.fontSize || style.fontSize,
            //            fontFamily: s.fontFamily || style.fontFamily,
            //            fontWeight: s.fontWeight || style.fontWeight,
            //            fontStyle: s.fontStyle || style.fontStyle,
            //            color: s.color || style.color,
            //        };
            //        node.childNodes.forEach(child => measureWords(child, nextStyle));
            //    }
            //}
            function measureWords(node, style) {
                if (node.nodeType === 3) {
                    // Handle text node (split into individual characters)
                    const words = node.nodeValue.split("");
                    for (let word of words) {
                        const fs = style.fontSize || defaultFontSize;
                        const ff = style.fontFamily || defaultFontFamily;
                        const fw = style.fontWeight || defaultFontWeight;
                        const fst = style.fontStyle || defaultFontStyle;
                        const col = style.color || defaultColor;

                        ctx.font = `${fst} ${fw} ${fs} ${ff}`;
                        const width = ctx.measureText(word).width;
                        const px = parseFloat(fs);
                        if (!isNaN(px)) maxFontPx = Math.max(maxFontPx, px);

                        segments.push({
                            text: word,
                            width,
                            style: { fs, ff, fw, fst, col }
                        });
                    }
                } else if (node.nodeType === 1) {
                    // ✅ Special case: if node is a <br>, treat it as a blank line
                    if (node.tagName === "BR") {
                        const fs = style.fontSize || defaultFontSize;
                        const ff = style.fontFamily || defaultFontFamily;
                        const fw = style.fontWeight || defaultFontWeight;
                        const fst = style.fontStyle || defaultFontStyle;
                        const col = style.color || defaultColor;

                        ctx.font = `${fst} ${fw} ${fs} ${ff}`;
                        const width = ctx.measureText(" ").width;
                        const px = parseFloat(fs);
                        if (!isNaN(px)) maxFontPx = Math.max(maxFontPx, px);

                        segments.push({
                            text: " ",
                            width,
                            style: { fs, ff, fw, fst, col }
                        });
                        return; // Don’t process children
                    }

                    // Normal element with children
                    const s = node.style;
                    const nextStyle = {
                        fontSize: s.fontSize || style.fontSize,
                        fontFamily: s.fontFamily || style.fontFamily,
                        fontWeight: s.fontWeight || style.fontWeight,
                        fontStyle: s.fontStyle || style.fontStyle,
                        color: s.color || style.color,
                    };
                    node.childNodes.forEach(child => measureWords(child, nextStyle));
                }
            }
            measureWords(lineNode, {
                fontSize: defaultFontSize,
                fontFamily: defaultFontFamily,
                fontWeight: defaultFontWeight,
                fontStyle: defaultFontStyle,
                color: defaultColor
            });

            const lineHeight = maxFontPx * (box.lineSpacing || 1.2);
            let x = cursorX;
            segments.forEach(segment => {
                if (x + segment.width > box.x + box.width - 10) {
                    cursorY += lineHeight;
                    x = cursorX;
                }
                ctx.font = `${segment.style.fst} ${segment.style.fw} ${segment.style.fs} ${segment.style.ff}`;
                ctx.fillStyle = segment.style.col;
                ctx.fillText(segment.text, x, cursorY);
                x += segment.width;
            });

            cursorY += lineHeight;
            usedHeight = cursorY - box.y + 5;
        });

        box.height = usedHeight;

        if (box === activeBox && box.width > 0 && box.height > 0) {
            ctx.strokeStyle = isEditing ? "red" : "red";
            ctx.lineWidth = isEditing ? 2 : 1;
            ctx.strokeRect(box.x, box.y, box.width, box.height);
            ctx.fillStyle = "blue";
            for (let h of Object.values(getAllHandles(box))) {
                ctx.fillRect(h.x - 4, h.y - 4, 8, 8);
            }
        }

        ctx.restore();
    }
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


// ——————— Mouse Events ———————
// Modified canvas mousedown, mousemove, and mouseup with scaleTextBoxWithHandle logic
// Updated mouse handlers with integrated scaling and handle logic
// ✅ MOUSE DOWN EVENT
canvas.addEventListener("mousedown", e => {
    const { x: mx, y: my } = getCanvasMousePosition(e);
    startX = e.clientX;
    startY = e.clientY;
    prevMouseX = mx;
    prevMouseY = my;
    startMXCanvas = mx;
    startMYCanvas = my;

    // Save & close editor if editing (unchanged)
    if (isEditing && activeBox) {
        cleanEditorHTMLPreserveCaret();
        activeBox.text = textEditorNew.innerHTML;
        activeBox.align = textEditorNew.style.textAlign || "left";
        isEditing = false;
        textEditorNew.style.display = "none";
    }

    // Check if resizing
    for (const box of boxes) {
        const handle = getResizeHandle(box, mx, my);
        if (handle) {
            activeBox = box;

            if (CORNER_HANDLES.has(handle)) {
                // CORNER: font-scale ONLY
                resizeDirection = handle;
                isCornerFontScale = true;
                isResizingNew = false; // block normal resize

                activeBox._orig = {
                    x: box.x, y: box.y,
                    width: box.width, height: box.height,
                    text: box.text
                };
                // compute min font once from original HTML
                activeBox._origMinFontPx = computeMinFontPxFromHTML(activeBox._orig.text, 16);

                const endCorner = () => { isCornerFontScale = false; };
                document.addEventListener("mouseup", endCorner, { once: true });

                drawText();
                return; // don't fall through
            }

            // NOT a corner: normal resize path (unchanged)
            resizeDirection = handle;      // ✅ set resize direction
            isResizingNew = true;          // ✅ enable resize mode
            activeBox._orig = {
                x: box.x,
                y: box.y,
                width: box.width,
                height: box.height,
                fontSize: box.fontSize,
                text: box.text
            };
            drawText();
            return;
        }
    }

    // Drag (unchanged)
    const clickedBox = boxes.find(box =>
        mx >= box.x && mx <= box.x + box.width &&
        my >= box.y && my <= box.y + box.height
    );
    activeBox = clickedBox;
    if (activeBox) {
        isDraggingNew = true;
        dragOffsetXNew = mx - activeBox.x;
        dragOffsetYNew = my - activeBox.y;
    } else {
        activeBox = null;
    }
    drawText();
});



canvas.addEventListener("mousemove", e => {
    const { x: mx, y: my } = getCanvasMousePosition(e);
    const dx = mx - prevMouseX;
    const dy = my - prevMouseY;

    // Cursor
    if (activeBox) {
        const h = getResizeHandle(activeBox, mx, my);
        if (["tl", "br"].includes(h)) canvas.style.cursor = "nwse-resize";
        else if (["tr", "bl"].includes(h)) canvas.style.cursor = "nesw-resize";
        else if (["tm", "bm"].includes(h)) canvas.style.cursor = "ns-resize";
        else if (["ml", "mr"].includes(h)) canvas.style.cursor = "ew-resize";
        else if (mx >= activeBox.x && mx <= activeBox.x + activeBox.width &&
            my >= activeBox.y && my <= activeBox.y + activeBox.height) canvas.style.cursor = "move";
        else canvas.style.cursor = "default";
    }

    if (isDraggingNew) {
        activeBox.x = mx - dragOffsetXNew;
        activeBox.y = my - dragOffsetYNew;

    } else if (isCornerFontScale && activeBox && resizeDirection && CORNER_HANDLES.has(resizeDirection)) {
        // Font-scale ONLY (no box stretch)
        const ow = activeBox._orig.width;
        const oh = activeBox._orig.height;

        const dxAbs = mx - startMXCanvas;
        const dyAbs = my - startMYCanvas;

        let scaleX = 1, scaleY = 1;
        switch (resizeDirection) {
            case 'tl': scaleX = (ow - dxAbs) / ow; scaleY = (oh - dyAbs) / oh; break;
            case 'tr': scaleX = (ow + dxAbs) / ow; scaleY = (oh - dyAbs) / oh; break;
            case 'bl': scaleX = (ow - dxAbs) / ow; scaleY = (oh + dyAbs) / oh; break;
            case 'br': scaleX = (ow + dxAbs) / ow; scaleY = (oh + dyAbs) / oh; break;
        }
        scaleX = Math.max(0.1, scaleX);
        scaleY = Math.max(0.1, scaleY);
        let uniform = Math.min(scaleX, scaleY);

        // clamp so min font never < 10px (tweakable)
        const minBase = activeBox._origMinFontPx || 16;
        const minAllowed = 10;
        if (minBase * uniform < minAllowed) {
            uniform = minAllowed / minBase;
        }

        // scale the ORIGINAL html each move (no compounding)
        activeBox.text = scaleTextHTML(activeBox._orig.text, uniform);

    } else if (isResizingNew && activeBox && resizeDirection) {
        // Side handles: normal behavior
        scaleTextBoxWithHandle(activeBox, resizeDirection, mx, my);
    }

    prevMouseX = mx;
    prevMouseY = my;
    drawText();
});
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



canvas.addEventListener("mouseup", () => {
    isDraggingNew = false;
    isResizingNew = false;
    resizeDirection = null;
    if (activeBox) delete activeBox._orig;
});



canvas.addEventListener("dblclick", e => {
    const { x: mx, y: my } = getCanvasMousePosition(e);
    const box = boxes.find(b =>
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
    // Now simply call our helper:
    showEditorAtBox(box);

    // And save the caret/selection if you need it:
    saveSelection();
});





// ✅ Apply any text style and reflect in canvas
function applyStyleToSelection(styleProp, value) {
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
    const fs = opts.fontSize ?? 30;
    const text = opts.text ?? "Default Text";
    const factor = opts.lineSpacing ?? 1.2;           // multiplier
    const fontFam = opts.fontFamily ?? "Arial";
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
        lineSpacing: factor,   // your drawText() uses multiplier
        fontScale: 1,          // for corner font-scaling path (if used)
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
    boxes.push(newBox);
    activeBox = newBox;

    // --- mirror into textObjects with your exact selection flow ---
    if (Array.isArray(textObjects)) {
        // deselect all, select the new one, push
        textObjects.forEach(o => o.selected = false);
        const newObj = {
            html,                   // plain text string (matches your addDefaultText)
            x: newBox.x,
            y: newBox.y,
            selected: true,
            editing: false,
            fontFamily: fontFam,
            textColor: color,
            textAlign: align,
            fontSize: fs,
            lineSpacing: factor,    // multiplier
            boundingWidth: newBox.width,
            boundingHeight: newBox.height,
            noAnim: false,
            groupId: null,
            rotation: 0,
            isBold: false,
            isItalic: false,
            type: 'text',
            zIndex: (typeof getNextZIndex === 'function') ? getNextZIndex() : 0,
            opacity: 100
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
    console.log(textObjects);
    // (optional) if you also need your other pipeline:
    // if (typeof drawCanvas === 'function') drawCanvas('Common');
}


function generateJson() {
    console.log(JSON.stringify(boxes, null, 2));
    alert("See console.");
}

window.onload = () => {
    // size canvas to container
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
   // addNewBox();
};




colorPickerNew.addEventListener("input", e => {
    textEditorNew.focus();
    applyStyleToSelection("color", e.target.value);
});


// Track selection changes within the editor
textEditorNew.addEventListener("mouseup", saveSelection);
textEditorNew.addEventListener("keyup", saveSelection);

// FONT SIZE LINKS
sizeList.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", e => {
        e.preventDefault();
        restoreSelection();
        applyStyleToSelection("fontSize", e.target.getAttribute("data-size"));
    });
});

// FONT FAMILY LINKS
fontList.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", e => {
        e.preventDefault();
        restoreSelection();
        applyStyleToSelection("fontFamily", e.target.getAttribute("data-font"));
    });
});


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

function applyTextEditorStyleFromBox(box) {
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
// ✅ Enhance line spacing and increase activeBox height when Enter is pressed
textEditorNew.addEventListener("input", () => {
    if (!activeBox || !isEditing) return;

    const edStyle = window.getComputedStyle(textEditorNew);
    const lineSpacing = (typeof selectedLineSpacing === "number" ? selectedLineSpacing : 8);

    const meas = document.createElement("div");
    Object.assign(meas.style, {
        position: "absolute",
        visibility: "hidden",
        whiteSpace: "pre-wrap",
        fontFamily: edStyle.fontFamily,
        fontSize: edStyle.fontSize,
        lineHeight: `${parseFloat(edStyle.lineHeight) + lineSpacing}px`,
        width: textEditorNew.style.width
    });

    meas.innerHTML = textEditorNew.innerHTML;
    document.body.appendChild(meas);

    const lines = meas.querySelectorAll("div").length || 1;
    const neededH = meas.scrollHeight + lineSpacing * lines;

    document.body.removeChild(meas);

    activeBox.height = Math.max(neededH, 30);
    textEditorNew.style.height = activeBox.height + "px";

    activeBox.text = textEditorNew.innerHTML;
    drawText();
});


//textEditorNew.addEventListener("keydown", e => {
//    if (e.key === "Enter") {
//        // let the line break happen, then re-fire input
//        setTimeout(() => textEditorNew.dispatchEvent(new Event("input")), 0);
//    }
//});

textEditorNew.addEventListener("keydown", e => {
    if (e.key === "Enter") {
        // ✅ Let line break happen first
        setTimeout(() => {
            // Check if we're still editing and an activeBox exists
            if (activeBox && isEditing) {
                activeBox.text = textEditorNew.innerHTML;
             
                drawText();
            }
        }, 0);
    }
});


boldBtn.addEventListener("click", e => {
    e.preventDefault();
    restoreSelection();
    document.execCommand("bold");
});

// 3. Italic
italicBtn.addEventListener("click", e => {
    e.preventDefault();
    restoreSelection();
    document.execCommand("italic");
});

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


window.addEventListener("DOMContentLoaded", () => {
    const lineSpacingInput = document.getElementById("lineSpacingInput");
    lineSpacingInput.addEventListener("change", () => {
        const val = parseFloat(lineSpacingInput.value);
        if (isNaN(val)) return;

        const clamped = Math.max(-3, Math.min(7, val));
        const pxSpacing = clamped * 8;

        let fontSize;
        if (textEditorNew.offsetParent !== null) {
            fontSize = parseFloat(window.getComputedStyle(textEditorNew).fontSize) || 16;
        } else if (activeBox?.fontSize) {
            fontSize = parseFloat(activeBox.fontSize);
        } else {
            fontSize = 16; // fallback
        }

        const lineSpacingMultiplier = (fontSize + pxSpacing) / fontSize;

        // ✅ Apply to editor even if hidden — so it’s ready on open
        textEditorNew.style.lineHeight = `${fontSize + pxSpacing}px`;

        if (activeBox) {
            activeBox.lineSpacing = lineSpacingMultiplier;
            if (isEditing) {
                activeBox.text = textEditorNew.innerHTML;
            }
            drawText();
        }
    });


    //lineSpacingInput.addEventListener("change", () => {
    //    const val = parseFloat(lineSpacingInput.value);
    //    if (isNaN(val)) return;

    //    // Clamp to reasonable values if necessary
    //    const clamped = Math.max(-3, Math.min(7, val));
    //    selectedLineSpacing = clamped * 8; // convert to px spacing

    //    const html = textEditorNew.innerHTML;
    //    const divCount = (html.match(/<div>|<br>/g) || []).length;
    //    const hasMultipleLines = divCount >= 1;

    //    const sel = window.getSelection();

    //    // CASE 1: We're editing and no selection but multiple lines present
    //    if (activeBox && isEditing) {
    //        if (sel && sel.rangeCount === 1 && sel.isCollapsed && hasMultipleLines) {
    //            applyTextEditorStyleFromBox(activeBox);
    //            textEditorNew.dispatchEvent(new Event("input"));
    //            activeBox.text = textEditorNew.innerHTML;
    //            drawText();
    //        }
    //    }
    //    // CASE 2: Not editing but activeBox has multiple lines
    //    else if (activeBox && !isEditing && hasMultipleLines) {
    //        showEditorAtBox(activeBox);
    //        applyTextEditorStyleFromBox(activeBox);
    //        activeBox.text = textEditorNew.innerHTML;
    //        drawText();
    //    }
    //});
});
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
alignList.querySelectorAll("a[data-align]").forEach(a => {
    a.addEventListener("click", e => {
        e.preventDefault();
        const align = a.getAttribute("data-align");
        if (activeBox) {
            activeBox.align = align;
            textEditorNew.style.textAlign = align;
            drawText();
        }
    });
});



function wrapSelectionWithSpan(span) {
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

function showEditorAtBox(box) {
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

    applyTextEditorStyleFromBox(box);
    textEditorNew.focus();
    isEditing = true;
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
        context.font = `${box.fontSize}px ${box.fontFamily || 'Arial'}`;
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