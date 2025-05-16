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
let textPosition = { x: 100, y: 100, opacity: 1, content: text, }; // Default start position
let imagePosition = { x: 100, y: 20, scaleX: 1, scaleY: 1, opacity: 1, }; // Default start position

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

////This is for delete text///////////////////
// Utility: Returns an object (text or image) if the (x,y) falls within its bounding box.

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
function getHandleUnderMouse(mx, my, obj) {
    const { x: ox, y: oy, boundingWidth: w, boundingHeight: h } = obj;
    const half = handleSize / 2;

    // define all 8 points in design‐space
    const pts = [
        { name: "top-left", x: ox, y: oy },
        { name: "top-middle", x: ox + w / 2, y: oy },
        { name: "top-right", x: ox + w, y: oy },
        { name: "right-middle", x: ox + w, y: oy + h / 2 },
        { name: "bottom-right", x: ox + w, y: oy + h },
        { name: "bottom-middle", x: ox + w / 2, y: oy + h },
        { name: "bottom-left", x: ox, y: oy + h },
        { name: "left-middle", x: ox, y: oy + h / 2 }
    ];

    // see if mx,my (in design coords) is within half‐size of any handle
    for (let pt of pts) {
        if (
            mx >= pt.x - half && mx <= pt.x + half &&
            my >= pt.y - half && my <= pt.y + half
        ) {
            return pt.name;
        }
    }
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

    const rect = canvas.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    const adjustX = 280;
    const adjustY = 64;
    const found = getObjectAtcontextmenu(offsetX, offsetY);
    if (found) {
        selectedForContextMenu = found.obj;
        selectedType = found.type;
        // Position the context menu relative to the canvas
        contextMenu.style.left = offsetX + adjustX + "px";
        contextMenu.style.top = offsetY + adjustY + "px";
        contextMenu.style.display = "block";
    } else {
        contextMenu.style.display = "none";
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



//function drawCanvas(condition) {
//    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear entire canvas
//    const bgColor = $("#hdnBackgroundSpecificColor").val();
//    if (bgColor && bgColor.trim() !== "") {
//        ctx.fillStyle = bgColor;
//        ctx.fillRect(0, 0, canvas.width, canvas.height);
//    }

//    // Draw background image if available.
//    if (canvas.bgImage) {
//        ctx.drawImage(canvas.bgImage, 0, 0, canvas.width, canvas.height);
//    }

//    // --- Draw multiple images from the images array ---
//    if (images && images.length) {
//        images.forEach(imgObj => {
//            ctx.save();
//            ctx.globalAlpha = imgObj.opacity || 1;
//            const scaleX = imgObj.scaleX || 1;
//            const scaleY = imgObj.scaleY || 1;
//            ctx.translate(imgObj.x, imgObj.y);
//            ctx.scale(scaleX, scaleY);
//            // Draw the image at (0,0) because translation has already been applied.
//            ctx.drawImage(imgObj.img, 0, 0, imgObj.width, imgObj.height);
//            ctx.restore();

//            // If this image is selected, draw a border and four resize handles.
//            if (imgObj.selected) {
//                ctx.save();
//                ctx.strokeStyle = "blue";
//                ctx.lineWidth = 2;
//                const dispW = imgObj.width * scaleX;
//                const dispH = imgObj.height * scaleY;
//                ctx.strokeRect(imgObj.x, imgObj.y, dispW, dispH);
//                // Draw handles at the four corners
//                const handles = getImageResizeHandles(imgObj); // Make sure this function uses your dynamic dimensions
//                ctx.fillStyle = "red";
//                handles.forEach(handle => {
//                    ctx.fillRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
//                });
//                ctx.restore();
//            }
//        });
//    }

//    ctx.save();
//    ctx.globalAlpha = textPosition.opacity || 1; // Apply text opacity

//    if (condition === 'Common' || condition === 'ChangeStyle') {
//        textObjects.forEach(obj => {
//            ctx.save();
//            // If selected, draw the bounding box and handles.
          
//            if (obj.selected) {
//                // Constrain the box if it goes beyond canvas boundaries.
//                if (obj.x < 0) obj.x = 0;
//                if (obj.x + obj.boundingWidth > canvas.width) {
//                    obj.boundingWidth = canvas.width - obj.x;
//                }
//                const boxX = obj.x - padding;
//                const boxY = obj.y - padding;
//                const boxWidth = obj.boundingWidth + 2 * padding - RECT_WIDTH_ADJUST;
//                //const boxHeight = obj.boundingHeight + 2 * padding;
//                const boxHeight = obj.boundingHeight + 2 * padding - RECT_HEIGHT_ADJUST;
//                drawRoundedRect(ctx, boxX, boxY, boxWidth, boxHeight, 5);

//                const handles = getTextResizeHandles(obj);
//                ctx.fillStyle = "#FF7F50";

//                const VISUAL_HANDLE_SIZE = 8;

//               // ctx.fillStyle = "#FF7F50";
//                handles.forEach(pt => {
//                    ctx.fillRect(
//                        pt.x - VISUAL_HANDLE_SIZE / 2,
//                        pt.y - VISUAL_HANDLE_SIZE / 2,
//                        VISUAL_HANDLE_SIZE,
//                        VISUAL_HANDLE_SIZE
//                    );
//                });
//            }

//            // Set text properties.
//            ctx.font = `${obj.fontSize}px ${obj.fontFamily}`;
//            ctx.fillStyle = obj.textColor;
//            ctx.textBaseline = "top";

//            // Determine the maximum text width for wrapping.
//            const maxTextWidth = obj.boundingWidth - 2 * padding;
//            let lines;
//            // If the text contains newline characters, use them; otherwise, wrap.
//            if (obj.text.indexOf("\n") !== -1) {
//                lines = obj.text.split("\n");
//            } else {
//                lines = wrapText(ctx, obj.text, maxTextWidth);
//            }
//            const lineHeight = obj.fontSize * 1.2;
//            const availableHeight = obj.boundingHeight - 2 * padding;
//            const maxLines = Math.floor(availableHeight / lineHeight);
//            const startY = obj.y + padding;

//            // Draw each line with the correct horizontal offset based on alignment.
//            for (let i = 0; i < Math.min(lines.length, maxLines); i++) {
//                const line = lines[i];
//                const lineWidth = ctx.measureText(line).width;
//                let offsetX;
//                if (obj.textAlign === "center") {
//                    offsetX = obj.x + (obj.boundingWidth - lineWidth) / 2;
//                } else if (obj.textAlign === "right") {
//                    offsetX = obj.x + obj.boundingWidth - lineWidth - padding;
//                } else { // left alignment
//                    offsetX = obj.x + padding;
//                }
//                ctx.fillText(line, offsetX, startY + i * lineHeight);
//            }
//            ctx.restore();
//        });
//    }

//    if (condition === 'applyAnimations') {
//        textObjects.forEach(obj => {
//            ctx.save();
//            ctx.font = `${obj.fontSize}px ${obj.fontFamily}`;
//            ctx.fillStyle = obj.textColor;
//            ctx.textBaseline = "top";

//            const maxTextWidth = obj.boundingWidth - 2 * padding;
//            let lines;
//            if (obj.text.indexOf("\n") !== -1) {
//                lines = obj.text.split("\n");
//            } else {
//                lines = wrapText(ctx, obj.text, maxTextWidth);
//            }
//            const lineHeight = obj.fontSize * 1.2;
//            const availableHeight = obj.boundingHeight - 2 * padding;
//            const maxLines = Math.floor(availableHeight / lineHeight);
//            const startY = obj.y + padding;

//            for (let i = 0; i < Math.min(lines.length, maxLines); i++) {
//                const line = lines[i];
//                const lineWidth = ctx.measureText(line).width;
//                let offsetX;
//                if (obj.textAlign === "center") {
//                    offsetX = obj.x + (obj.boundingWidth - lineWidth) / 2;
//                } else if (obj.textAlign === "right") {
//                    offsetX = obj.x + obj.boundingWidth - lineWidth - padding;
//                } else {
//                    offsetX = obj.x + padding;
//                }
//                ctx.fillText(line, offsetX, startY + i * lineHeight);
//            }
//            ctx.restore();
//        });
//    }

//    ctx.globalAlpha = 1;
//    ctx.restore();
//}
function drawCanvas(condition) {
    // 1) Refresh CTM: design→screen
    resizeCanvas();               // must set ctx.resetTransform(); ctx.scale(dpr,dpr); ctx.scale(scaleX,scaleY);
    const dpr = window.devicePixelRatio || 1;

    // compute “design‐space” dimensions for clearing
    const designW = canvas.width / dpr / scaleX;
    const designH = canvas.height / dpr / scaleY;

    // 2) Clear & draw background (in design units)
    ctx.clearRect(0, 0, designW, designH);
    const bgColor = document.getElementById('hdnBackgroundSpecificColor').value.trim();
    if (bgColor) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, designW, designH);
    }
    if (canvas.bgImage) {
        ctx.drawImage(canvas.bgImage, 0, 0, designW, designH);
    }

    // 3) Draw images (lazy‑load + design units)
    images.forEach(imgObj => {
        // design→screen position & size
        const x = imgObj.x;
        const y = imgObj.y;
        const w = imgObj.width * (imgObj.scaleX || 1);
        const h = imgObj.height * (imgObj.scaleY || 1);

        // lazy-load if this imgObj has no <img> yet
        if (!imgObj.img) {
            const img = new Image();
            img.onload = () => {
                imgObj.img = img;
                drawCanvas(condition);
            };
            img.src = imgObj.svgData || imgObj.src;
            return;
        }

        // draw in design space
        ctx.save();
        ctx.globalAlpha = imgObj.opacity || 1;
        ctx.translate(x, y);
        ctx.scale(imgObj.scaleX || 1, imgObj.scaleY || 1);
        try {
            ctx.drawImage(imgObj.img, 0, 0, imgObj.width, imgObj.height);
        } catch (e) {

        }
        
        ctx.restore();
    });

    // 4) Draw text (in design units)
    if (['Common', 'ChangeStyle', 'applyAnimations'].includes(condition)) {
        textObjects.forEach(obj => {
            ctx.save();
            ctx.globalAlpha = obj.opacity || 1;
            ctx.font = `${obj.fontSize}px ${obj.fontFamily}`;
            ctx.fillStyle = obj.textColor;
            ctx.textBaseline = "top";

            // wrap or split on \n
            const x = obj.x;
            const y = obj.y;
            const maxW = obj.boundingWidth - 2 * padding;
            //const lines = obj.text.includes("\n")
            //    ? obj.text.split("\n")
            //    : wrapText(ctx, obj.text, maxW);
            let lines;
            if (obj.boundingWidth < obj.fontSize) {
                // Force character-by-character vertical layout
                lines = obj.text.split(''); // Each char on its own line
            } else {
                lines = obj.text.includes("\n")
                    ? obj.text.split("\n")
                    : wrapText(ctx, obj.text, maxW); // your existing word wrap
            }
            const lineH = obj.fontSize * 1.2;
            const maxLines = Math.floor((obj.boundingHeight - 2 * padding) / lineH);
            const startY = y + padding;

            lines.slice(0, maxLines).forEach((line, i) => {
                const lw = ctx.measureText(line).width;
                let tx = x + padding;
                if (obj.textAlign === "center") tx = x + (obj.boundingWidth - lw) / 2;
                if (obj.textAlign === "right") tx = x + obj.boundingWidth - lw - padding;
                ctx.fillText(line, tx, startY + i * lineH);
            });
            ctx.restore();
        });
    }

    // 5) Overlay selection UI *in raw pixel space*  
    function toPixelSpace(fn) {
        ctx.save();
        ctx.resetTransform();    // drop design→screen CTM
        ctx.scale(dpr, dpr);     // keep only HiDPI
        fn();
        ctx.restore();
    }

    // 5a) Image selections
    toPixelSpace(() => {
        images.forEach(imgObj => {
            if (!imgObj.selected) return;
            // compute pixel coords from design coords
            const xPx = imgObj.x * scaleX;
            const yPx = imgObj.y * scaleY;
            const wPx = imgObj.width * (imgObj.scaleX || 1) * scaleX;
            const hPx = imgObj.height * (imgObj.scaleY || 1) * scaleY;

            ctx.strokeStyle = "blue";
            ctx.lineWidth = 2;
            ctx.strokeRect(xPx, yPx, wPx, hPx);

            ctx.fillStyle = "red";
            const hs = getImageResizeHandles(imgObj)
                .map(pt => ({ x: pt.x * scaleX, y: pt.y * scaleY }));
            const halfH = handleSize / 2;
            hs.forEach(pt => {
                ctx.fillRect(pt.x - halfH, pt.y - halfH, handleSize, handleSize);
            });
        });
    });

    // 5b) Text selections
    // 5b) Text selections (with 8 handles)
    toPixelSpace(() => {
        textObjects.forEach(obj => {
            if (!obj.selected) return;

            const xPx = obj.x * scaleX;
            const yPx = obj.y * scaleY;
            const wPx = obj.boundingWidth * scaleX;
            const hPx = obj.boundingHeight * scaleY;

            // draw rounded‐rect around text
            drawRoundedRect(
                ctx,
                xPx - padding * scaleX,
                yPx - padding * scaleY,
                wPx + 2 * padding * scaleX - RECT_WIDTH_ADJUST * scaleX,
                hPx + 2 * padding * scaleY - RECT_HEIGHT_ADJUST * scaleY,
                5 * scaleX
            );

            // all 8 handles: corners + midpoints
            ctx.fillStyle = "#FF7F50";
            const halfW = handleSize / 2;
            const liftY = 2;   // tweak Y offset if needed

            const handlePoints = [
                // corners
                { x: xPx, y: yPx },        // top-left
                { x: xPx + wPx, y: yPx },        // top-right
                { x: xPx, y: yPx + hPx },  // bottom-left
                { x: xPx + wPx, y: yPx + hPx },  // bottom-right
                // midpoints
               // { x: xPx + wPx / 2, y: yPx },        // top-middle
                //{ x: xPx + wPx / 2, y: yPx + hPx },  // bottom-middle
                { x: xPx, y: yPx + hPx / 2 }, // left-middle
                { x: xPx + wPx, y: yPx + hPx / 2 }  // right-middle
            ];

            handlePoints.forEach(pt => {
                ctx.fillRect(pt.x - halfW, pt.y - halfW - liftY, handleSize, handleSize);
            });
        });
    });

    // 6) reset alpha
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
function ChangeAlignStyle(value) {
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







function OnChangefontFamily(value) {
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
    const animationType = document.getElementById("hdnTextAnimationType").value;
   
    // Global timing settings (from your selected speeds).
    const inTime = parseFloat(selectedInSpeed) || 4;   // e.g. 4 seconds for all "in"
    const outTime = parseFloat(selectedOutSpeed) || 4;   // e.g. 3 seconds for all "out"
    const stayTime = parseFloat(selectedStaySpeed) || 3; // Overall stay time (applied globally if desired)
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
                obj.y = -(obj.boundingHeight + 5);
                obj.exitX = obj.finalX;
                obj.exitY = -(obj.boundingHeight + 5);
                break;
            case "bottom":
                obj.x = obj.finalX;
                obj.y = canvas.height + 5;
                obj.exitX = obj.finalX;
                obj.exitY = canvas.height + 5;
                break;
            case "left":
                obj.x = -(obj.boundingWidth + 5);
                obj.y = obj.finalY;
                obj.exitX = -(obj.boundingWidth + 5);
                obj.exitY = obj.finalY;
                break;
            case "right":
                obj.x = canvas.width + 5;
                obj.y = obj.finalY;
                obj.exitX = canvas.width + 5;
                obj.exitY = obj.finalY;
                break;
            default:
                // Default: animate offscreen to the right.
                obj.x = obj.finalX;
                obj.y = obj.finalY;
                obj.exitX = window.innerWidth;
                obj.exitY = obj.finalY;
        }
    });

    if (animationType === "delaylinear") {
        const nominalPerObj = .50;
        const countText = textObjects.length;

        const scaleInText = inTime / (countText * nominalPerObj);
        const scaleOutText = outTime / (countText * nominalPerObj);

        const individualTweenText = 0.15 * scaleInText;
        const individualTweenOutText = 0.15 * scaleOutText;

        let tlText = gsap.timeline({
            repeat: loopCount - 1,
            onUpdate: () => drawCanvas(condition)
        });

        // --- Text IN ---
        tlText.to(textObjects, {
            x: (i, target) => target.finalX,
            y: (i, target) => target.finalY,
            duration: individualTweenText,
            ease: "power1.in",
            stagger: individualTweenText * .70,
            onUpdate: () => drawCanvas(condition)
        });

        console.log("animateText", images);

        // --- Image IN ---
        images.forEach((imgObj) => {
            tlText.to(imgObj, {
                x: (i, target) => target.finalX,
                y: (i, target) => target.finalY,
                duration: individualTweenText,
                ease: "power1.in",
                stagger: individualTweenText * .70,
                onUpdate: () => drawCanvas(condition)
            });
        });

        // --- Stay Time ---
        tlText.to({}, { duration: stayTime, ease: "none" });

        // --- Image OUT (First!) ---
        [...images].reverse().forEach((imgObj) => {
            tlText.to(imgObj, {
                //x: imgObj.exitX,
                //y: imgObj.exitY,
                x: (i, target) => target.exitX,
                y: (i, target) => target.exitY,
                duration: individualTweenOutText,
                ease: "power1.out",
                stagger: individualTweenOutText * 0.70,
                onUpdate: () => drawCanvas(condition)
            });
        });

        // --- Text OUT (After Image) ---
        tlText.to([...textObjects].reverse(), {
            x: (i, target) => target.exitX,
            y: (i, target) => target.exitY,
            duration: individualTweenOutText,
            ease: "power1.out",
            stagger: individualTweenOutText * .70,
            onUpdate: () => drawCanvas(condition)
        });

        //// --- Reset text to final position only (leave image off-screen) ---
        //tlText.set([...textObjects, ...images], {
        //    x: (i, target) => target.finalX,
        //    y: (i, target) => target.finalY,
        //    duration: 0,
        //    onUpdate: () => drawCanvas(condition)
        //});
        tlText.eventCallback("onComplete", () => {
            images.forEach(img => {
                img.x = img.finalX;
                img.y = img.finalY;
            });
            textObjects.forEach(txt => {
                txt.x = txt.finalX;
                txt.y = txt.finalY;
            });

            drawCanvas(condition); // Force redraw
        });

    }


    else if (animationType === "linear" || animationType === "zoom" ||
        animationType === "bounce" || animationType === "blur") {
        // Keep your existing implementation for these cases.
        textObjects.forEach((obj) => {
            const endX = obj.finalX;
            const endY = obj.finalY;
            let exitX, exitY;
            switch (direction) {
                case "top":
                    exitX = endX;
                    exitY = -(obj.boundingHeight + 5);
                    break;
                case "bottom":
                    exitX = endX;
                    exitY = canvas.height + 5;
                    break;
                case "left":
                    exitX = -(obj.boundingWidth + 5);
                    exitY = endY;
                    break;
                case "right":
                    exitX = canvas.width + 5;
                    exitY = endY;
                    break;
                default:
                    exitX = window.innerWidth;
                    exitY = endY;
            }
            if (animationType === "linear" || animationType === "zoom") {
                let tl = gsap.timeline({
                    repeat: loopCount - 1,
                    onUpdate: function () {
                        drawCanvas(condition);
                    }
                });

                tl.to(obj, {
                    x: endX,
                    y: endY,
                    duration: inTime,
                    ease: "power1.in"
                });
                tl.to(obj, {
                    duration: stayTime,
                    ease: "none"
                });
                tl.to(obj, {
                    x: exitX,
                    y: exitY,
                    duration: outTime,
                    ease: "power1.out"
                });
                tl.set(obj, {
                    x: endX,
                    y: endY,
                    duration: 0,
                    ease: "power1.inOut",
                    onUpdate: () => drawCanvas(condition)
                });
            }
            else if (animationType === "bounce" || animationType === "blur") {

                ////This section is for in out and stay
                let tl = gsap.timeline({
                    repeat: loopCount - 1,
                    onUpdate: function () {
                        drawCanvas(condition);
                    }
                });

                // "In" phase: Animate the object onto the canvas.
                tl.to(obj, {
                    x: endX,
                    y: endY,
                    duration: inTime,
                    ease: "bounce.out"
                });

                // "Stay" phase: Hold the object in place for the stay duration.
                // This tween doesn't change any properties; it just acts as a pause.
                tl.to(obj, {
                    duration: stayTime,
                    ease: "none"
                });

                // "Out" phase: Animate the object off the canvas.
                tl.to(obj, {
                    x: exitX,
                    y: exitY,
                    duration: outTime,
                    ease: "bounce.out"
                });
                // Final phase: Reset the object to the final position with text.
                // This sets the object’s position to (endX, endY) after the out tween completes.
                tl.set(obj, {
                    x: endX,
                    y: endY,
                    duration: 0,
                    ease: "bounce.out",
                    onUpdate: () => drawCanvas(condition),


                });


                ////This is default effect of bounce
                //gsap.to(obj, {
                //    x: endX,
                //    y: endY,
                //    duration: parseFloat(selectedInSpeed) || 2,
                //    ease: "bounce.out",
                //    onUpdate: () => drawCanvas(condition),
                //});
            }

        });
    }
    // ----- IMAGE ANIMATION SECTION -----
    // (A similar approach can be applied to images.)
    images.forEach((imgObj) => {
        imgObj.finalX = imgObj.x;
        imgObj.finalY = imgObj.y;
        const dispWidth = imgObj.width * (imgObj.scaleX || 1);
        const dispHeight = imgObj.height * (imgObj.scaleY || 1);
        switch (direction) {
            case "top":
                imgObj.x = imgObj.finalX;
                imgObj.y = -(dispHeight + 5);
                imgObj.exitX = imgObj.finalX;
                imgObj.exitY = -(dispHeight + 5);
                break;
            case "bottom":
                imgObj.x = imgObj.finalX;
                imgObj.y = canvas.height + 5;
                imgObj.exitX = imgObj.finalX;
                imgObj.exitY = canvas.height + 5;
                break;
            case "left":
                imgObj.x = -(dispWidth + 5);
                imgObj.y = imgObj.finalY;
                imgObj.exitX = -(dispWidth + 5);
                imgObj.exitY = imgObj.finalY;
                break;
            case "right":
                imgObj.x = canvas.width + 5;
                imgObj.y = imgObj.finalY;
                imgObj.exitX = canvas.width + 5;
                imgObj.exitY = imgObj.finalY;
                break;
            default:
                imgObj.x = imgObj.finalX;
                imgObj.y = imgObj.finalY;
                imgObj.exitX = window.innerWidth;
                imgObj.exitY = imgObj.finalY;
        }
    });

    //if (animationType === "delaylinear") {
    //    if (images.length) {
    //        const countImg = images.length;
    //        const scaleImgIn = inTime / (countImg * 1.0);
    //        const indTweenImg = 0.5 * scaleImgIn;
    //        const indHoldImg = 0.5 * scaleImgIn;

    //        const scaleImgOut = outTime / (countImg * 1.0);
    //        const indTweenImgOut = 0.5 * scaleImgOut;
    //        const indHoldImgOut = 0.5 * scaleImgOut;

    //        let tlImg = gsap.timeline({
    //            repeat: loopCount - 1,
    //            onUpdate: () => { drawCanvas(condition); }
    //        });
    //        images.forEach((imgObj) => {
    //            tlImg.to(imgObj, {
    //                x: imgObj.finalX,
    //                y: imgObj.finalY,
    //                duration: indTweenImg,
    //                ease: "power1.in"
    //            });
    //            tlImg.to({}, { duration: indHoldImg, ease: "none" });
    //        });
    //        // (Optional: you can also add a global stay phase here if you wish.)
    //        tlImg.to({}, { duration: stayTime });
    //        [...images].reverse().forEach((imgObj) => {
    //            tlImg.to(imgObj, {
    //                x: imgObj.exitX,
    //                y: imgObj.exitY,
    //                duration: indTweenImgOut,
    //                ease: "power1.out"
    //            });
    //            tlImg.to({}, { duration: indHoldImgOut, ease: "none" });
    //        });
    //        tlImg.set(images, {
    //            x: (i, target) => target.finalX,
    //            y: (i, target) => target.finalY,
    //            duration: 0,
    //            ease: "power1.inOut",
    //            onUpdate: () => { drawCanvas(condition); }
    //        });
    //    }
    //}
    //else
    if (animationType === "linear" || animationType === "zoom" ||
        animationType === "bounce" || animationType === "blur") {
        // Keep the existing branches for images.
        let exitX, exitY;
        images.forEach((imgObj) => {
            const endX = imgObj.finalX;
            const endY = imgObj.finalY;
            let tl = gsap.timeline({
                repeat: loopCount - 1,
                onUpdate: function () {
                    drawCanvas(condition);
                }
            });

            if (animationType === "linear") {
                tl.to(imgObj, {
                    x: endX,
                    y: endY,
                    duration: inTime,
                    ease: "power1.in"
                });
                tl.to(imgObj, {
                    duration: stayTime,
                    ease: "none"
                });
                tl.to(imgObj, {
                    x: exitX,
                    y: exitY,
                    duration: outTime,
                    ease: "power1.out"
                });
                tl.set(imgObj, {
                    x: endX,
                    y: endY,
                    duration: 0,
                    ease: "power1.inOut",
                    onUpdate: () => drawCanvas(condition)
                });
            }
            else if (animationType === "bounce") {
                tl.to(imgObj, {
                    x: endX,
                    y: endY,
                    duration: inTime,
                    ease: "bounce.out"
                });
                tl.to(imgObj, {
                    duration: stayTime,
                    ease: "none"
                });
                tl.to(imgObj, {
                    x: exitX,
                    y: exitY,
                    duration: outTime,
                    ease: "bounce.out"
                });
                tl.set(imgObj, {
                    x: endX,
                    y: endY,
                    duration: 0,
                    ease: "bounce.out",
                    onUpdate: () => drawCanvas(condition)
                });
            }
            else if (animationType === "zoom") {
                // Zoom in then out.
                tl.fromTo(
                    imgObj,
                    { scaleX: 0, scaleY: 0, x: startX, y: startY },
                    {
                        scaleX: originalScaleX,
                        scaleY: originalScaleY,
                        x: endX,
                        y: endY,
                        duration: inTime,
                        ease: "power2.out",
                        onUpdate: () => drawCanvas(condition)
                    }
                );
                tl.to(imgObj, {
                    duration: stayTime,
                    ease: "none"
                });
                tl.to(imgObj, {
                    scaleX: 0,
                    scaleY: 0,
                    x: exitX,
                    y: exitY,
                    duration: outTime,
                    ease: "power2.in",
                    onUpdate: () => drawCanvas(condition)
                });
                tl.set(imgObj, {
                    x: endX,
                    y: endY,
                    scaleX: originalScaleX,
                    scaleY: originalScaleY,
                    duration: 0,
                    ease: "none",
                    onUpdate: () => drawCanvas(condition)
                });
            }
            else if (animationType === "blur") {
                imgObj.blur = 5;
                tl.fromTo(
                    imgObj,
                    { blur: 5, x: startX, y: startY },
                    {
                        blur: 0,
                        x: endX,
                        y: endY,
                        duration: inTime + 2,
                        ease: "power2.out",
                        onUpdate: () => {
                            ctx.filter = `blur(${imgObj.blur}px)`;
                            drawCanvas(condition);
                        },
                        onComplete: () => {
                            ctx.filter = "none";
                            drawCanvas(condition);
                        }
                    }
                );
                tl.to(imgObj, {
                    duration: stayTime,
                    ease: "none",
                    onUpdate: () => {
                        ctx.filter = "none";
                        drawCanvas(condition);
                    }
                });
                tl.to(imgObj, {
                    x: exitX,
                    y: exitY,
                    duration: outTime,
                    ease: "power2.in",
                    onUpdate: () => {
                        ctx.filter = "none";
                        drawCanvas(condition);
                    }
                });
                tl.set(imgObj, {
                    x: endX,
                    y: endY,
                    duration: 0,
                    ease: "none",
                    onUpdate: () => {
                        ctx.filter = "none";
                        drawCanvas(condition);
                    }
                });
            }
        });
    }
}







function textAnimationClick(clickedElement, type) {
    $("#hdnTextAnimationType").val(type);
    animationMode = type;
    if (activeSlide === 1) {
        $("#hdnEffectSlide1").val(type);
    }
    else if (activeSlide === 2) {
        $("#hdnEffectSlide2").val(type);
    }
    else if (activeSlide === 3) {
        $("#hdnEffectSlide3").val(type);
    }
    // Get the container using its ID.
    var ulEffects = document.getElementById("ulEffects");

    // Select all <a> elements within the container.
    var links = ulEffects.getElementsByTagName("a");

    // Remove the active_effect class from all links.
    for (var i = 0; i < links.length; i++) {
        links[i].classList.remove("active_effect");
    }

    // Add the active_effect class to the clicked element.
    clickedElement.classList.add("active_effect");

    // Get the container using its ID.
    var ulDirection = document.getElementById("uldirection");

    // Select all <a> elements within the container.
    var links = ulDirection.getElementsByTagName("a");

    // Remove the active_effect class from all links.
    for (var i = 0; i < links.length; i++) {
        links[i].classList.remove("active_effect");
    }
    initMiniCanvasHandlers();
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
function setCoordinate(clickedElement, direction, imageStartX, imageStartY, imageEndX, imageEndY) {
    // Get the container using its ID.
    var ulDirection = document.getElementById("uldirection");
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
    if ($("#hdnTextAnimationType").val() !== "") {
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
    else {
        //alert('Please select Text Animation')
        MessageShow('', 'Please select text Animation', 'error');
    }

}



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
function addDefaultText() {
    const newObj = {
        text: "Default Text",
        x: 117,
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
function isMouseOverImageOld(imageObj, pos) {
    const w = imageObj.width * imageObj.scaleX;
    const h = imageObj.height * imageObj.scaleY;
    return (
        pos.x >= imageObj.x &&
        pos.x <= imageObj.x + w &&
        pos.y >= imageObj.y &&
        pos.y <= imageObj.y + h
    );
}
function isMouseOverImage(imgObj, pos) {
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
canvas.addEventListener("mousedown", function (e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const pos = { x: mouseX, y: mouseY };

    // 0) if typing in the text editor, ignore
    if (document.activeElement === textEditor) return;

    // 1) IMAGE body‐click → drag
    for (let i = images.length - 1; i >= 0; i--) {
        const img = images[i];
        // use the SAME w/h/fallback logic as your handles
        const sx = (typeof img.scaleX === 'number') ? img.scaleX : 1;
        const sy = (typeof img.scaleY === 'number') ? img.scaleY : 1;
        const w = img.width * sx;
        const h = img.height * sy;
        if (
            pos.x >= img.x && pos.x <= img.x + w &&
            pos.y >= img.y && pos.y <= img.y + h
        ) {
            // select image, clear text
            textObjects.forEach(o => o.selected = false);
            activeText = null;

            images.forEach(i2 => i2.selected = false);
            img.selected = true;
            activeImage = img;
            isDraggingImage = true;
            dragOffsetImage.x = pos.x - img.x;
            dragOffsetImage.y = pos.y - img.y;
            enableFillColorDiv();
            enableStrockColorDiv();
            //// svg controls
            //if (img.src?.endsWith('.svg')) {
            //    enableFillColorDiv();
            //    enableStrockColorDiv();
            //} else {
            //    disableFillColorDiv();
            //    disableStrockColorDiv();
            //}

            e.preventDefault();
            drawCanvas('Common');
            return;
        }
    }

    // 2) IMAGE handle‐click → resize
    for (let i = images.length - 1; i >= 0; i--) {
        const img = images[i];
        const ih = getHandleUnderMouseForImage(img, pos);
        if (ih) {
            // select image, clear text
            textObjects.forEach(o => o.selected = false);
            activeText = null;

            images.forEach(i2 => i2.selected = false);
            img.selected = true;
            activeImage = img;
            isResizingImage = true;
            activeImageHandle = ih;

            e.preventDefault();
            drawCanvas('Common');
            return;
        }
    }

    // 3) TEXT logic (unchanged)
    const txt = getTextObjectAt(pos.x, pos.y);
    if (txt) {
        textObjects.forEach(o => o.selected = false);
        txt.selected = true;
        activeText = txt;

        const th = getHandleUnderMouse(pos.x, pos.y, txt);
        if (th) {
            isResizingText = true;
            activeTextHandle = th;
            e.preventDefault();
            drawCanvas('Common');
            return;
        }
        if (isInsideBox(pos.x, pos.y, txt)) {
            isDraggingText = true;
            dragOffsetText.x = pos.x - txt.x;
            dragOffsetText.y = pos.y - txt.y;
            e.preventDefault();
            drawCanvas('Common');
            return;
        }
    }

    // 4) nothing matched → clear all
    textObjects.forEach(o => o.selected = false);
    images.forEach(i2 => i2.selected = false);
    activeText = null;
    activeImage = null;
    //disableFillColorDiv();
    //disableStrockColorDiv();

    e.preventDefault();
    drawCanvas('Common');
});





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


canvas.addEventListener("mousemove", function (e) {
   
    const pos = getMousePos(canvas, e);

    // --- 1) TEXT RESIZE & DRAG ---
    if (isResizingText && activeText && activeTextHandle) {
        const obj = activeText;
        const oldL = obj.x, oldT = obj.y;
        const oldW = obj.boundingWidth, oldH = obj.boundingHeight;
        const oldR = oldL + oldW;
        switch (activeTextHandle) {
            // ─── Corners: diagonal uniform scale ───────────────────────
            case 'bottom-right':
            case 'bottom-left':
            case 'top-right':
            case 'top-left': {
                const ctx = canvas.getContext("2d");

                let dx, dy;
                if (activeTextHandle === 'bottom-right') {
                    dx = pos.x - oldL; dy = pos.y - oldT;
                } else if (activeTextHandle === 'bottom-left') {
                    dx = oldW - (pos.x - oldL); dy = pos.y - oldT;
                } else if (activeTextHandle === 'top-right') {
                    dx = pos.x - oldL; dy = oldH - (pos.y - oldT);
                } else { // top-left
                    dx = oldW - (pos.x - oldL);
                    dy = oldH - (pos.y - oldT);
                }

                let scale = Math.min(dx / oldW, dy / oldH);

                const minFontSize = 10;
                const minScale = minFontSize / obj.fontSize;
                scale = Math.max(scale, minScale);

                const newFontSize = obj.fontSize * scale;

                // Recalculate min bounding box based on new font size
                ctx.font = `${newFontSize}px ${obj.fontFamily}`;
                const lines = wrapText(ctx, obj.text.replace(/\n/g, ''), Infinity);
                const lineHeight = newFontSize * 1.2;
                const minHeight = lines.length * lineHeight + 2 * padding;

                // Find longest word or character to get minWidth
                const minWidth = getMinTextWidth(ctx, obj.text.replace(/\n/g, ''));

                const newW = Math.max(oldW * scale, minWidth);
                const newH = Math.max(oldH * scale, minHeight);

                if (activeTextHandle === 'bottom-right') {
                    obj.boundingWidth = newW;
                    obj.boundingHeight = newH;
                } else if (activeTextHandle === 'bottom-left') {
                    obj.x = oldL + oldW - newW;
                    obj.boundingWidth = newW;
                    obj.boundingHeight = newH;
                } else if (activeTextHandle === 'top-right') {
                    obj.y = oldT + oldH - newH;
                    obj.boundingWidth = newW;
                    obj.boundingHeight = newH;
                } else { // top-left
                    obj.x = oldL + oldW - newW;
                    obj.y = oldT + oldH - newH;
                    obj.boundingWidth = newW;
                    obj.boundingHeight = newH;
                }

                obj.fontSize = newFontSize;
                break;
            }





            // ─── Middle horizontal: resize width + rewrap ──────────────
           case 'right-middle': {
                //const ctx = canvas.getContext("2d");
                //ctx.font = `${obj.fontSize}px ${obj.fontFamily}`;
                //const minWidth = getMinCharWidth(ctx, obj.text.replace(/\n/g, ''));

                //const newW = pos.x - oldL;
                //if (newW >= minWidth) {
                //    obj.boundingWidth = newW;

                //    const lines = wrapText(ctx, obj.text.replace(/\n/g, ''), newW - 2 * padding);
                //    const lineHeight = obj.fontSize * 1.2;
                //    obj.boundingHeight = lines.length * lineHeight + 2 * padding;
                //}
                //break;
}

            case 'left-middle': {
                //const ctx = canvas.getContext("2d");
                //ctx.font = `${obj.fontSize}px ${obj.fontFamily}`;

                //const minWidth = getMinCharWidth(ctx, obj.text.replace(/\n/g, ''));

                //const oldR = oldL + oldW;
                //const newW = oldR - pos.x;

                //if (newW >= minWidth) {
                //    obj.x = pos.x;
                //    obj.boundingWidth = newW;

                //    const lines = wrapText(ctx, obj.text.replace(/\n/g, ''), newW - 2 * padding);
                //    const lineHeight = obj.fontSize * 1.2;
                //    obj.boundingHeight = lines.length * lineHeight + 2 * padding;
                //}
                //break;
            }



            // ─── Vertical middle: no-op (or add logic) ────────────────
            case 'top-middle':
            case 'bottom-middle':
                // nothing
                break;
        }

        drawCanvas('Common');
        return; // skip drag + image logic
    }


    // --- 2) TEXT DRAG ───────────────────────────────────────────────
    if (isDraggingText && activeText) {
        activeText.x = pos.x - dragOffsetText.x;
        activeText.y = pos.y - dragOffsetText.y;
        drawCanvas('Common');
        return;
    }

    // --- 3) IMAGE DRAG ─────────────────────────────────────────────
    if (isDraggingImage && activeImage) {
        activeImage.x = pos.x - dragOffsetImage.x;
        activeImage.y = pos.y - dragOffsetImage.y;
        drawCanvas("Common");
    }

    // --- 4) IMAGE RESIZE ───────────────────────────────────────────
    if (isResizingImage && activeImage && activeImageHandle) {
        let newWidth, newHeight;
        switch (activeImageHandle) {
            case "top-left":
                newWidth = activeImage.width * activeImage.scaleX + (activeImage.x - pos.x);
                newHeight = activeImage.height * activeImage.scaleY + (activeImage.y - pos.y);
                activeImage.x = pos.x;
                activeImage.y = pos.y;
                break;
            case "top-right":
                newWidth = pos.x - activeImage.x;
                newHeight = activeImage.height * activeImage.scaleY + (activeImage.y - pos.y);
                activeImage.y = pos.y;
                break;
            case "bottom-left":
                newWidth = activeImage.width * activeImage.scaleX + (activeImage.x - pos.x);
                newHeight = pos.y - activeImage.y;
                activeImage.x = pos.x;
                break;
            case "bottom-right":
                newWidth = pos.x - activeImage.x;
                newHeight = pos.y - activeImage.y;
                break;
        }
        if (newWidth > MIN_SIZE) activeImage.scaleX = newWidth / activeImage.width;
        if (newHeight > MIN_SIZE) activeImage.scaleY = newHeight / activeImage.height;
        drawCanvas("Common");
    }
});

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



function onBoxResizeEnd(obj) {
    const ctx = canvas.getContext('2d');
    const padding = obj.padding || 10;
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

canvas.addEventListener("mouseup", function () {
    if (isResizingText && activeText && activeTextHandle) {
        onBoxResizeEnd(activeText);
    }


    currentDrag = null;
    isResizing = false;
    isDragging = false;
    activeHandle = null;

    isDraggingImage = false;
    isResizingImage = false;

    isResizingText = false;
    isDraggingText = false;
    activeTextHandle = null;
    activeText = null;
});

canvas.addEventListener("mouseleave", function () {
    currentDrag = null;
    isResizing = false;
    isDragging = false;
    activeHandle = null;

    isDraggingImage = false;
    isResizingImage = false;
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
canvas.addEventListener("click", function (e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const pos = { x: mouseX, y: mouseY };

    const obj = getTextObjectAt(mouseX, mouseY);
    let imageFound = false;
    let imgObj = null;

    // Check if an image is clicked
    for (let i = images.length - 1; i >= 0; i--) {
        if (isMouseOverImage(images[i], pos)) {
            imgObj = images[i];
            imageFound = true;
            break;
        }
    }
   
    if (obj) {
        // Select text object and update UI
        textObjects.forEach(o => o.selected = false);
        obj.selected = true;

        $("#favcolor").val(obj.textColor);
        $("#fontstyle_popup").css("display", "block");
        $(".right-sec-two").css("display", "block");
        $(".right-sec-one").css("display", "none");
        document.getElementById("modeButton").innerText = "Animation Mode";
    } else if (imageFound) {
        // Select image and update UI
        images.forEach(img => img.selected = false);
        imgObj.selected = true;
        $("#fontstyle_popup").css("display", "block");
        $(".right-sec-two").css("display", "block");
        $(".right-sec-one").css("display", "none");
        document.getElementById("modeButton").innerText = "Animation Mode";
    } else {
        // Deselect all if clicking on empty canvas
        textObjects.forEach(o => o.selected = false);
        images.forEach(img => img.selected = false);

        //$("#fontstyle_popup").css("display", "none");
        //$(".right-sec-two").css("display", "none");
        //$(".right-sec-one").css("display", "block");
        //document.getElementById("modeButton").innerText = "Graphic Mode";
    }

    drawCanvas('Common'); // Redraw to update selection changes
});

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
        //canvas.focus();
        //textEditor.setSelectionRange(0, 0);
        setTimeout(() => {
            textEditor.setSelectionRange(0, 0);
        }, 1000);

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

function ChangeFillColor() {
    if (activeImage) {
        const fillColorPicker = document.getElementById("favFillcolor");
        $("#hdnfillColor").val(fillColorPicker.value);
        updateSelectedImageColors($("#hdnfillColor").val(), $("#hdnStrockColor").val());
    }
}
function ChangeStrockColor() {
    if (activeImage) {
        const strockColorPicker = document.getElementById("favStrockcolor");
        $("#hdnStrockColor").val(strockColorPicker.value);
        updateSelectedImageColors($("#hdnfillColor").val(), $("#hdnStrockColor").val());
    }
}
function TabShowHide(type) {
    if (type === 'In') {
        $("#marzen").css("display", "block");
        $("#rauchbier").css("display", "none");
        $("#dunkles").css("display", "none");
    }
    else if (type === 'Stay') {
        $("#marzen").css("display", "none");
        $("#rauchbier").css("display", "block");
        $("#dunkles").css("display", "none");
    }
    else if (type === 'Out') {
        $("#marzen").css("display", "none");
        $("#rauchbier").css("display", "none");
        $("#dunkles").css("display", "block");
    }
}
// Listen for clicks on the dropdown menu.
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

// Allow dropping on canvas
canvas.addEventListener("dragover", function (e) {
    e.preventDefault();
});

// When an image is dropped onto the canvas, add it to our images array
canvas.addEventListener("drop", function (e) {
    e.preventDefault();
    const src = e.dataTransfer.getData("text/plain");
    if (src) {
        // Create a new image object
        const img = new Image();
        img.src = src;
        img.onload = function () {
            // Default position is drop position; default size is half the natural size
            const newImgObj = {
                img: img,
                src: src, // keep the src path
                x: e.offsetX,
                y: e.offsetY,
                width: img.width / 4,
                height: img.height / 4,
                scaleX: 1,
                scaleY: 1,
                selected: false
            };
            images.push(newImgObj);
            drawCanvas('Common');
        };
    }
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
function updateSelectedImageColors(newFill, newStroke) {
    // 1) sanity‑check: do we have an SVG network URL?
    const svgUrl = activeImage.originalSrc || activeImage.src;
    //if (!activeImage || !svgUrl?.endsWith('.svg') || !activeImage.img) {
    //    console.warn("activeImage is not an SVG image");
    //    return;
    //}
    const isSvgFile = svgUrl.toLowerCase().endsWith('.svg');
    const isDataSvg = svgUrl.startsWith('data:image/svg+xml');
    if (!activeImage || (!isSvgFile && !isDataSvg) || !activeImage.img) {
        console.warn("activeImage is not an SVG image");
        return;
    }

    // 2) store the network URL once
    if (!activeImage.originalSrc) {
        activeImage.originalSrc = activeImage.src;
    }

    // 3) remember its displayed size
    const origW = activeImage.width;
    const origH = activeImage.height;

    // 4) core SVG patcher
    function patchSvg(svgText) {
        const doc = new DOMParser().parseFromString(svgText, "image/svg+xml");

        // update <style> block
        const styleEl = doc.querySelector("style");
        if (styleEl) {
            styleEl.textContent = styleEl.textContent
                .replace(/fill:[^;]+;/g, `fill:${newFill};`)
                .replace(/stroke:[^;]+;/g, `stroke:${newStroke};`);
        }

        // update inline fill/stroke on every element
        doc.querySelectorAll("*").forEach(el => {
            if (newFill) el.setAttribute("fill", newFill);
            if (newStroke) el.setAttribute("stroke", newStroke);
        });

        return new XMLSerializer().serializeToString(doc);
    }

    // 5) redraw into the existing <img> on the canvas
    //function redraw(updatedSvg) {
    //    const dataUri = "data:image/svg+xml;charset=utf-8,"
    //        + encodeURIComponent(updatedSvg);

    //    const imgEl = activeImage.img;
    //    imgEl.onload = () => {
    //        // restore size & re‑draw your canvas
    //        activeImage.width = origW;
    //        activeImage.height = origH;
    //        drawCanvas('Common');    // your custom full‐canvas render function
    //    };
    //    imgEl.src = dataUri;   // swap in the recolored SVG
    //}
    function redraw(updatedSvg) {
        const dataUri = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(updatedSvg);
        const imgEl = activeImage.img;

        imgEl.onload = () => {
            // restore display size
            activeImage.width = origW;
            activeImage.height = origH;
            // **important**: update your model’s src
            activeImage.src = dataUri;
            // now redraw the canvas
            drawCanvas('Common');
        };

        // swap the image URL
        imgEl.src = dataUri;
    }

    // 6) fetch & cache original SVG once, then always patch+redraw
    if (activeImage.originalSVG) {
        redraw(patchSvg(activeImage.originalSVG));
    } else {
        fetch(svgUrl)
            .then(res => res.text())
            .then(svgText => {
                activeImage.originalSVG = svgText;   // cache raw SVG
                redraw(patchSvg(svgText));           // apply first recolor
            })
            .catch(err => console.error("Error fetching SVG:", err));
    }
}

function updateSelectedImageColorsOld(newFill, newStroke) {
    // 1) sanity check
    if (
        !activeImage ||
        !activeImage.src?.endsWith(".svg") ||
        !activeImage.img        // your HTMLImageElement
    ) {
        console.warn("activeImage is not an SVG image on canvas");
        return;
    }

    // remember its displayed size
    const origW = activeImage.width;
    const origH = activeImage.height;

    // parse + patch the raw SVG text
    function patchSvg(svgText) {
        const doc = new DOMParser().parseFromString(svgText, "image/svg+xml");

        // update <style> block if present
        const styleEl = doc.querySelector("style");
        if (styleEl) {
            styleEl.textContent = styleEl.textContent
                .replace(/fill:[^;]+;/g, `fill:${newFill};`)
                .replace(/stroke:[^;]+;/g, `stroke:${newStroke};`);
        }
        // update inline fill/stroke on every element
        doc.querySelectorAll("*").forEach(el => {
            if (newFill) el.setAttribute("fill", newFill);
            if (newStroke) el.setAttribute("stroke", newStroke);
        });

        return new XMLSerializer().serializeToString(doc);
    }

    // swap in the recolored SVG as a data‑uri on the same <img>
    function redraw(updatedSvg) {
        const dataUri =
            "data:image/svg+xml;charset=utf-8," +
            encodeURIComponent(updatedSvg);

        const imgEl = activeImage.img;
        imgEl.onload = () => {
            // restore the canvas‐object’s width/height
            activeImage.width = origW;
            activeImage.height = origH;
            // finally, re‑draw your entire canvas:
            drawCanvas('Common');
        };
        // swap the source (this triggers imgEl.onload)
        imgEl.src = dataUri;
        // keep your model in sync
        activeImage.src = dataUri;
    }

    // fetch & cache the original SVG once
    if (activeImage.originalSVG) {
        redraw(patchSvg(activeImage.originalSVG));
    } else {
        fetch(activeImage.src)
            .then(res => res.text())
            .then(svgText => {
                activeImage.originalSVG = svgText;    // cache it
                redraw(patchSvg(svgText));            // apply your first recolor
            })
            .catch(err => console.error("Error fetching SVG:", err));
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
    document.getElementById("modeButton").innerText = "Graphic Mode";
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
    canvas.bgImage = null;
    drawCanvas('Common'); // Redraw the canvas without the background image.
    setCanvasBackground(controlid, backgroundSpecificColorPicker.value);
}
function setCanvasBackground(canvasId, color) {
    /* document.getElementById(canvasId).style.backgroundColor = color;*/
    ctx.fillStyle = color;
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
        canvas.bgImage = bgImage;
    };
    bgImage.src = imageSrc;
    $("#hdnBackgroundImage").val(imageSrc);
    $('#chkRemoveBackground').prop('checked', true);
}
function RemoveBackgroundImage() {
    canvas.bgImage = null;
    drawCanvas('Common'); // Redraw the canvas without the background image.

}
function clearCanvasOld() {
    const canvas = document.getElementById("myCanvas");
    const ctx = canvas.getContext("2d");
    canvas.bgImage = null;
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
    canvas.bgImage = null;

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
            const selectedInSpeed = event.target.getAttribute('value');
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
            const val = event.target.getAttribute('value');
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

