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
let DESIGN_W, DESIGN_H;
let firstRun = true;
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
const canvasElement = document.getElementById("myCanvasElement");
const ctxElement = canvasElement.getContext("2d");
const stream = canvasElement.captureStream(7); // Capture at 30 fps
const recorder = new MediaRecorder(stream);
const chunks = [];
let publishDownloadcondition = '';
const transitionState = { x: 0, y: 0, scale: 1, opacity: 1 };
const options = {
    mimeType: 'video/webm; codecs=vp9',
    videoBitsPerSecond: 10_000_000  // 10 Mbps; adjust as needed
};
let currentIndexForDownload = 0;
const canvasForDownload = document.getElementById("myCanvasElementDownload");
const ctxElementForDownload = canvasForDownload.getContext("2d");
const streamForDownload = canvasForDownload.captureStream(60); // Capture at 120 fps
const recorderForDownload = new MediaRecorder(streamForDownload, options);
const chunksForDownload = [];
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
const padding = 5;         // Padding inside the bounding box
const handleSize = 10;     // Resize handle square size (in pixels)
const minWidth = 50;       // Minimum bounding width
const minHeight = 30;      // Minimum bounding height
const HANDLE_HIT_RADIUS = handleSize * 2;
/////////Image Section///////////////////
let images = []; // Array to store image objects

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
var activeSlide = 1;

const canvas_d = document.getElementById('myCanvasElementDownload');
const container_d = document.getElementById('canvasContainerDownload');
const ctx_d = canvas_d.getContext('2d');
const dpr_d = window.devicePixelRatio || 1;

//──────────────────────────────────────────────────────────
// STATE: these will be set dynamically on first resize
let DESIGN_W_d, DESIGN_H_d;
let scaleX_d = 1, scaleY_d = 1;
let firstRun_d = true;
//──────────────────────────────────────────────────────────

function CreateHeaderSectionHorizontalhtml() {
    try {
        $.ajax({
            url: baseURL + "Canvas/CreateHeaderSectionHorizontalhtml",
            type: "POST",
            dataType: "html",
            success: function (result) {
                $("#divHeaderSectionH").html(result);

                const lin = document.getElementById('alinear');
                if (lin) {
                    lin.classList.add('active_effect');
                } 


                wireSpeedDropdown();
                wireOutSpeedDropdown();
                wireLoopDropdown();
               
            },
            error: function () {
            }
        })

    } catch (e) {
        console.log("catch", e);
    }
}
function CreateBackgroundSectionHorizontalhtml() {
    try {
        $.ajax({
            url: baseURL + "Canvas/CreateBackgroundHorizontalSectionhtml",
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
function CreateLeftSectionHorizontalhtml() {
    try {
        $.ajax({
            url: baseURL + "Canvas/CreateLeftSectionHorizontalhtml",
            type: "POST",
            dataType: "html",
            success: function (result) {
                $("#divpanelleftH").html(result);

            },
            error: function () {
            }
        })

    } catch (e) {
        console.log("catch", e);
    }
}

function CreateRightSectionHorizontalhtml() {
    try {
        $.ajax({
            url: baseURL + "Canvas/CreateRightSectionHorizontalhtml",
            type: "POST",
            dataType: "html",
            success: function (result) {
                $("#divpanelrightH").html(result);
                // Now safe to access elements from the partial
                document.getElementById('lblSpeed').textContent = "4 Sec";
                document.getElementById('lblSeconds').textContent = "3 Sec";
                document.getElementById('lblOutSpeed').textContent = "4 Sec";
                document.getElementById('lblLoop').textContent = "1 time";

            },
            error: function () {
            }
        })

    } catch (e) {
        console.log("catch", e);
    }
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
//function textAnimationClick(clickedElement, type) {
//    $("#hdnTextAnimationType").val(type);
//    animationMode = type;
//    if (activeSlide === 1) {
//        $("#hdnEffectSlide1").val(type);
//    }
//    else if (activeSlide === 2) {
//        $("#hdnEffectSlide2").val(type);
//    }
//    else if (activeSlide === 3) {
//        $("#hdnEffectSlide3").val(type);
//    }
//    // Get the container using its ID.
//    var ulEffects = document.getElementById("ulEffects");

//    // Select all <a> elements within the container.
//    var links = ulEffects.getElementsByTagName("a");

//    // Remove the active_effect class from all links.
//    for (var i = 0; i < links.length; i++) {
//        links[i].classList.remove("active_effect");
//    }

//    // Add the active_effect class to the clicked element.
//    clickedElement.classList.add("active_effect");

//    // Get the container using its ID.
//    var ulDirection = document.getElementById("uldirection");

//    // Select all <a> elements within the container.
//    var links = ulDirection.getElementsByTagName("a");

//    // Remove the active_effect class from all links.
//    for (var i = 0; i < links.length; i++) {
//        links[i].classList.remove("active_effect");
//    }
//}
function hideBack() {
    const popup = document.getElementById("background_popup");
    if (popup) {
        popup.style.display = "none";
    }
}

function getNextZIndex() {
    return ++currentZIndex;
}
function addDefaultText() {
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
        x: 250,
        y: 150,
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


function reindex() {
    allItems.forEach((obj, idx) => obj.zIndex = idx + 1)
}

window.addEventListener('DOMContentLoaded', () => {
    // 3) hook up events and initial draw
    window.resizeCanvas = resizeCanvas;
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('DOMContentLoaded', resizeCanvas);
    resizeCanvas();
});

function resizeCanvas() {
    // console.log("resizeCanvas");
    // 1) Figure out how big the canvas *looks* on the page (CSS px)
    const containerW = canvasContainer.clientWidth;
    const cssW = containerW * 0.66;          // e.g. 32% of container
    const cssH = cssW * (9 / 16);              // your chosen aspect

    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';

    // 2) Resize the internal buffer for HiDPI
    const bufW = Math.round(cssW * dpr);
    const bufH = Math.round(cssH * dpr);
    if (canvas.width !== bufW || canvas.height !== bufH) {
        canvas.width = bufW;
        canvas.height = bufH;
    }

    // 3) Compute the *actual* drawing‐space size in CSS pixels
    const screenW = canvas.width / dpr;
    const screenH = canvas.height / dpr;

    // 4) On very first run, “lock in” your design resolution
    if (firstRun) {
        DESIGN_W = screenW;
        DESIGN_H = screenH;
        firstRun = false;
        console.log(`Captured design size: ${DESIGN_W}×${DESIGN_H}`);
    }

    // 5) Now compute how much to scale your design → screen
    scaleX = screenW / DESIGN_W;
    scaleY = screenH / DESIGN_H;

    // 6) Reset any old transforms, then apply:
    //   a) dpr for HiDPI (1 unit → 1 CSS px)
    //   b) design→screen scale
    ctx.resetTransform();
    ctx.scale(dpr, dpr);
    ctx.scale(scaleX, scaleY);
}



window.addEventListener('DOMContentLoaded', () => {
    // 3) hook up events and initial draw
    window.resizeCanvas = resizeCanvas_d;
    window.addEventListener('resize', resizeCanvas_d);
    window.addEventListener('DOMContentLoaded', resizeCanvas_d);
    resizeCanvas_d();
});

function resizeCanvas_d() {
    //console.log("resizeCanvas_d");
    // 1) Figure out how big the canvas *looks* on the page (CSS px)
    const containerW_d = container_d.clientWidth;
    const cssW_d = containerW_d * 0.66;          // e.g. 23% of container containerW_d this is different 
    const cssH_d = cssW_d * (9 / 16);              // your chosen aspect

    canvas_d.style.width = cssW_d + 'px';
    canvas_d.style.height = cssH_d + 'px';

    // 2) Resize the internal buffer for HiDPI
    const bufW_d = Math.round(cssW_d * dpr_d);
    const bufH_d = Math.round(cssH_d * dpr_d);
    if (canvas_d.width !== bufW_d || canvas_d.height !== bufH_d) {
        canvas_d.width = bufW_d;
        canvas_d.height = bufH_d;
    }

    // 3) Compute the *actual* drawing‐space size in CSS pixels
    const screenW_d = canvas_d.width / dpr_d;
    const screenH_d = canvas_d.height / dpr_d;

    // 4) On very first run, “lock in” your design resolution
    if (firstRun_d) {
        DESIGN_W_d = screenW_d;
        DESIGN_H_d = screenH_d;
        firstRun_d = false;
        console.log(`Captured design size: ${DESIGN_W_d}×${DESIGN_H_d}`);
    }

    // 5) Now compute how much to scale your design → screen
    scaleX_d = screenW_d / DESIGN_W_d;
    scaleY_d = screenH_d / DESIGN_H_d;

    // 6) Reset any old transforms, then apply:
    //   a) dpr for HiDPI (1 unit → 1 CSS px)
    //   b) design→screen scale
    ctx_d.resetTransform();
    ctx_d.scale(dpr_d, dpr_d);
    ctx_d.scale(scaleX_d, scaleY_d);
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
    $("#fontFamily").val(value);
    const fontFamily = document.getElementById("fontFamily").value; // Font family from dropdown
    const Obj = textObjects.find(obj => obj.selected);
    if (Obj) {
        Obj.fontFamily = fontFamily || 'Arial';
    }

    drawCanvas('ChangeStyle');
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
                
                imgObj.x = imgObj.finalX;
                imgObj.y = -canvas.height / 2 + offscreenMargin;
                imgObj.exitX = imgObj.finalX;
                imgObj.exitY = canvas.height;
                break;
            case "bottom":
                
                imgObj.x = imgObj.finalX;
                imgObj.y = canvas.height / 2 + 270;
                imgObj.exitX = imgObj.finalX;
                imgObj.exitY = -canvas.height / 2;

                break;
            case "left":
               
                imgObj.x = -canvas.width / 2;
                imgObj.y = imgObj.finalY;
                imgObj.exitX = canvas.width + margin;
                imgObj.exitY = imgObj.finalY;
                break;
            case "right":
               
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
        if (tabType === "In") {
            units.forEach((unit, idx) => {
                tlText.to(unit, {
                    x: (i, target) => target.finalX,
                    y: (i, target) => target.finalY,
                    duration: individualIn,
                    ease: "power1.in",
                    onUpdate: () => drawCanvas(condition)
                }, idx * staggerIn);
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
                    duration: individualOut,
                    ease: "power1.out",
                    onUpdate: () => drawCanvas(condition)
                }, idx * staggerOut);
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
                onUpdate: () => drawCanvas(condition)
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
            drawCanvas(condition);
        });

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

            [...animItems, ...staticItems].forEach(o => o.rotation = 0);

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

        // Grouping (logical only — no sequential staggering)
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

        // Reset all
        animItems.forEach(o => {
            o.x = o.finalX;
            o.y = o.finalY;
            o.rotation = 0;
        });
        staticItems.forEach(o => {
            o.x = o.finalX;
            o.y = o.finalY;
            o.rotation = 0;
        });

        // Set static items immediately
        const tl = gsap.timeline({ repeat: loopCount - 1, onUpdate: () => drawCanvas(condition) });
        staticItems.forEach(o => {
            tl.set(o, { x: o.finalX, y: o.finalY, rotation: 0 }, 0);
        });

        const inRotationAmount = (direction === "left") ? 360 : (direction === "right") ? -360 : 360;
        const outRotationAmount = (direction === "right") ? -360 : (direction === "left") ? 360 : -360;

        // 🔵 IN phase — all animate together
        if (tabType === "In") {
            tl.to(animItems, {
                rotation: inRotationAmount,
                duration: inTime,
                ease: "power2.out"
            }, 0);
        }

        // 🟡 STAY phase (fixed to 1 second)
        const delayR = (tabType === "In") ? inTime : 0;
        if (["Stay"].includes(tabType)) {
            tl.to({}, { duration: .5, ease: "none" }, delayR);  // Stay phase fixed to 1 second
        }


       
        if (tabType === "Out") {
            tl.to(animItems, {
                rotation: `+=${outRotationAmount}`,
                duration: outTime,
                ease: "power2.out"
            }, 0);  // zero delay – OUT should fire immediately
        }

        // 🔄 Reset after loop
        tl.eventCallback("onComplete", () => {
            [...animItems, ...staticItems].forEach(o => o.rotation = 0);
            drawCanvas(condition);
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

        if (tabType === "In") {
            // Start small (or invisible)
            tl.set(units.flat(), {
                scaleX: 0.1,
                scaleY: 0.1
            }, 0);

            // Animate to large size and stop there
            tl.to(units.flat(), {
                scaleX: 0.8,
                scaleY: 0.8,
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
                scaleX: 0.8,   // Or 1.0 depending on your entry state
                scaleY: 0.8
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
    if (type === 'roll') {
        document.getElementById('abottom')?.classList.add('disabled-ani-button');
        document.getElementById('atop')?.classList.add('disabled-ani-button');
        document.getElementById('obottom')?.classList.add('disabled-ani-button');
        document.getElementById('otop')?.classList.add('disabled-ani-button');


    } else {
        document.getElementById('abottom')?.classList.remove('disabled-ani-button');
        document.getElementById('atop')?.classList.remove('disabled-ani-button');
        document.getElementById('obottom')?.classList.remove('disabled-ani-button');
        document.getElementById('otop')?.classList.remove('disabled-ani-button');
    }
}
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
function applyAnimations(direction, conditionvalue) {
    imagePosition.x = parseInt(document.getElementById("imageStartX").value);
    imagePosition.y = parseInt(document.getElementById("imageStartY").value);
   
    const bgColor = $("#hdnBackgroundSpecificColor").val();
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawCanvas(conditionvalue);

    animateText(direction, conditionvalue, parseInt($("#hdnlLoopControl").val()) || 1);
    animateImage(conditionvalue);

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
   
    applyAnimations(direction, 'applyAnimations');
  
}
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
    return null;
}
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
canvas.addEventListener("mousedown", e => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const shift = e.shiftKey;
    if (document.activeElement === textEditor) return;

    // ── 1) ROTATION HANDLE CHECK ─────────────────────────────────────
    let hitRotate = null;
    [...textObjects, ...images].forEach(obj => {
        if (!obj.selected || !obj._rotateHandle) return;
        const h = obj._rotateHandle; // { x, y, radius }
        const dist = Math.hypot(mouseX - h.x, mouseY - h.y);
        if (dist < h.radius) hitRotate = obj;
    });
    if (hitRotate) {
        isRotating = true;
        rotatingObject = hitRotate;
        rotationStartAngle = Math.atan2(mouseY - hitRotate.y, mouseX - hitRotate.x);
        rotationStartValue = hitRotate.rotation || 0;
        e.preventDefault();
        return;
    }

    // ── 2) HIT-TEST FOR TEXT AND IMAGE ───────────────────────────────
    let txtHit = null;
    for (let i = textObjects.length - 1; i >= 0; i--) {
        if (isInsideRotatedText(mouseX, mouseY, textObjects[i])) {
            txtHit = textObjects[i];
            break;
        }
    }

    let imgHit = null;
    for (let i = images.length - 1; i >= 0; i--) {
        if (isInsideRotatedImage(mouseX, mouseY, images[i])) {
            imgHit = images[i];
            break;
        }
    }

    // ── 3) SHIFT-CLICK TOGGLE SELECTION ─────────────────────────────
    if (shift) {
        if (txtHit) {
            toggleSelect(txtHit);
            selectedForContextMenu = txtHit.selected ? txtHit : null;
            selectedType = txtHit.selected ? "text" : null;
        }
        if (imgHit) {
            toggleSelect(imgHit);
            selectedForContextMenu = imgHit.selected ? imgHit : null;
            selectedType = imgHit.selected ? "image" : null;
        }
        drawCanvas("Common");
        return;
    }

    // ── 4) RESIZE HANDLE ON SELECTED OBJECT ──────────────────────────
    let primary = null;
    let handle;

    if (txtHit && txtHit.selected) {
        handle = getTextHandleUnderMouse(mouseX, mouseY, txtHit);
        if (handle && !handle.includes("middle")) {
            primary = { obj: txtHit, type: "text", handle };
        }
    }
    if (!primary) {
        for (let i = images.length - 1; i >= 0; i--) {
            const img = images[i];
            if (!img.selected) continue;
            handle = getImageHandleUnderMouse(mouseX, mouseY, img);
            if (handle) {
                primary = { obj: img, type: "image", handle };
                break;
            }
        }
    }

    // ── 5) COUNT SELECTED ITEMS ──────────────────────────────────────
    const selectedCount =
        textObjects.filter(o => o.selected).length +
        images.filter(i => i.selected).length;

    // Multi-resize or single-resize...
    if (primary && selectedCount > 1) {
        startMultiResize(primary.obj, e);
        e.preventDefault();
        return;
    }
    if (primary && selectedCount === 1) {
        if (primary.type === "text") {
            // Begin text resize: store starting width/height/font
            isResizingText = true;
            activeTextHandle = primary.handle;
            activeText = primary.obj;
            textResizeStart = {
                mouseX: e.clientX,
                mouseY: e.clientY,
                origX: activeText.x,
                origY: activeText.y,
                origW: activeText.boundingWidth,
                origH: activeText.boundingHeight,
                origFont: activeText.fontSize
            };
            // STORE “start‐of‐drag” dims for text:
            activeText._resizeStartW = activeText.boundingWidth;
            activeText._resizeStartH = activeText.boundingHeight;
            activeText._resizeStartFont = activeText.fontSize;
        } else {
            // Begin image resize: store starting on-canvas width/height & scale
            isResizingImage = true;
            activeImageHandle = primary.handle;
            activeImage = primary.obj;

            const startSX = (typeof activeImage.scaleX === 'number')
                ? activeImage.scaleX : 1;
            const startSY = (typeof activeImage.scaleY === 'number')
                ? activeImage.scaleY : 1;

            activeImage._resizeStartSX = startSX;
            activeImage._resizeStartSY = startSY;
            activeImage._resizeStartW = activeImage.width * startSX;
            activeImage._resizeStartH = activeImage.height * startSY;
        }
        e.preventDefault();
        drawCanvas("Common");
        return;
    }

    // ── 6) GROUP-DRAG ────────────────────────────────────────────────
    if ((txtHit && txtHit.selected) || (imgHit && imgHit.selected)) {
        isDraggingGroup = true;
        groupDragStart = { x: e.clientX, y: e.clientY };
        groupStarts = [];
        textObjects.filter(o => o.selected)
            .forEach(o => groupStarts.push({ obj: o, x: o.x, y: o.y }));
        images.filter(i => i.selected)
            .forEach(i => groupStarts.push({ obj: i, x: i.x, y: i.y }));
        e.preventDefault();
        return;
    }

    // ── 7) DESELECT ALL BEFORE NEW SELECTION ─────────────────────────
    textObjects.forEach(o => o.selected = false);
    images.forEach(i => i.selected = false);
    selectedForContextMenu = null;
    selectedType = null;
    activeText = activeImage = null;

    // ── 8) CLICK-TO-SELECT TEXT ─────────────────────────────────────
    if (txtHit) {
        txtHit.selected = true;
        selectedForContextMenu = txtHit;
        selectedType = "text";
        activeText = txtHit;
        const angle = txtHit.rotation || 0;
        rotationSlider.value = angle;
        document.getElementById("rotationValue").textContent = angle + "°";
        rotationBadge.textContent = angle;


        var opacity = txtHit.opacity * 100 || 100;
        if (opacity > 100) opacity = 100;
        opacitySlider.value = opacity;
        document.getElementById("opacityValue").textContent = opacity + "";
        opacityBadge.textContent = opacity;

        handle = getTextHandleUnderMouse(mouseX, mouseY, txtHit);
        if (handle && !handle.includes("middle")) {
            isResizingText = true;
            activeTextHandle = handle;
            textResizeStart = {
                mouseX: e.clientX,
                mouseY: e.clientY,
                origX: txtHit.x,
                origY: txtHit.y,
                origW: txtHit.boundingWidth,
                origH: txtHit.boundingHeight,
                origFont: txtHit.fontSize
            };
            // Also store “start” values in case user rotates then drags again:
            txtHit._resizeStartW = txtHit.boundingWidth;
            txtHit._resizeStartH = txtHit.boundingHeight;
            txtHit._resizeStartFont = txtHit.fontSize;
        } else {
            isDraggingText = true;
            dragOffsetText = { x: mouseX - txtHit.x, y: mouseY - txtHit.y };
        }

        e.preventDefault();
        drawCanvas("Common");
        return;
    }

    // ── 9) CLICK-TO-SELECT IMAGE ────────────────────────────────────
    if (imgHit) {
        images.forEach(i => i.selected = false);
        imgHit.selected = true;
        selectedForContextMenu = imgHit;
        selectedType = "image";
        activeImage = imgHit;
        const angle = imgHit.rotation || 0;
        rotationSlider.value = angle;
        document.getElementById("rotationValue").textContent = angle + "°";
        rotationBadge.textContent = angle;

        var opacity = imgHit.opacity * 100 || 100;
        if (opacity > 100) opacity = 100;
        opacitySlider.value = opacity;
        document.getElementById("opacityValue").textContent = opacity + "";
        opacityBadge.textContent = opacity;

        isDraggingImage = true;
        dragOffsetImage = { x: mouseX - imgHit.x, y: mouseY - imgHit.y };
        enableFillColorDiv();
        enableStrockColorDiv();

        e.preventDefault();
        drawCanvas("Common");
        return;
    }

    //// ── 10) CLICKED EMPTY SPACE ─────────────────────────────────────
    //textObjects.forEach(o => o.selected = false);
    //images.forEach(i => i.selected = false);
    //selectedForContextMenu = null;
    //selectedType = null;
    //activeText = activeImage = null;
    //rotationSlider.value = 0;
    //rotationBadge.textContent = "0";

    //e.preventDefault();
    //drawCanvas("Common");

    // ── 10) CLICKED EMPTY SPACE ─────────────────────────────────────
    const clickedEmpty =
        !hitRotate &&
        !txtHit &&
        !imgHit &&
        !primary;

    if (clickedEmpty) {
        // clear any existing selection
        textObjects.forEach(o => o.selected = false);
        images.forEach(i => i.selected = false);
        selectedForContextMenu = null;
        selectedType = null;
        activeText = activeImage = null;
        rotationSlider.value = 0;
        rotationBadge.textContent = "0";

        opacitySlider.value = 100;
        opacityBadge.textContent = "100";


        // begin drag-to-select
        isDraggingSelectionBox = true;
        const rect = canvas.getBoundingClientRect();
        selectionStart = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        selectionEnd = { ...selectionStart };

        e.preventDefault();
        drawCanvas("Common");
        return;
    }
});
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
function findTextAt(mouseX, mouseY) {
    for (let i = textObjects.length - 1; i >= 0; i--) {
        const txt = textObjects[i];
        if (isInsideRotatedBox(mouseX, mouseY, txt)) {
            return txt;
        }
    }
    return null;
}
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
function enableFillColorDiv() {
    const divfillColor = document.getElementById("divFillColor");
    divfillColor.style.display = "block";
    const div = document.getElementById("divfill");
    div.style.pointerEvents = "auto";
    div.style.opacity = "1";
}
function enableStrockColorDiv() {
    const divstrockColor = document.getElementById("divStrockColor");
    divstrockColor.style.display = "block";
    const div = document.getElementById("divStrock");
    div.style.pointerEvents = "auto";
    div.style.opacity = "1";
}
canvas.addEventListener("mousemove", function (e) {
    const pos = getMousePos(canvas, e);
    let cursor = "default";

    // ── 1) ROTATION (live) ─────────────────────────────────────────────
    if (isRotating && rotatingObject) {
        const angleNow = Math.atan2(pos.y - rotatingObject.y, pos.x - rotatingObject.x);
        const delta = angleNow - rotationStartAngle;
        const angleDeg = (rotationStartValue + delta * 180 / Math.PI) % 360;
        const roundedAngle = Math.round(angleDeg);
        updateRotation(roundedAngle);
        rotationBadge.textContent = roundedAngle;
        return;
    }

    // ── 2) TEXT HANDLE HOVER ────────────────────────────────────────────
    if (!isDraggingText && !isResizingText && activeText) {
        const center = {
            x: activeText.x + activeText.boundingWidth / 2,
            y: activeText.y + activeText.boundingHeight / 2
        };
        const pt = rotatePoint(pos.x, pos.y, center.x, center.y, -activeText.rotation);
        const x0 = activeText.x;
        const y0 = activeText.y;
        const x1 = x0 + activeText.boundingWidth;
        const y1 = y0 + activeText.boundingHeight;

        // Corner zones
        const cornerTolerance = 16;
        const corners = [
            { x: x0, y: y0, cursor: 'nwse-resize' },
            { x: x1, y: y0, cursor: 'nesw-resize' },
            { x: x0, y: y1, cursor: 'nesw-resize' },
            { x: x1, y: y1, cursor: 'nwse-resize' }
        ];
        for (const c of corners) {
            if (Math.hypot(pt.x - c.x, pt.y - c.y) < cornerTolerance) {
                canvas.style.cursor = c.cursor;
                return;
            }
        }
        // Edges
        const edgeTolerance = 12;
        if ((Math.abs(pt.x - x0) < edgeTolerance || Math.abs(pt.x - x1) < edgeTolerance)
            && pt.y > y0 + cornerTolerance && pt.y < y1 - cornerTolerance) {
            canvas.style.cursor = 'ew-resize';
            return;
        }
        if ((Math.abs(pt.y - y0) < edgeTolerance || Math.abs(pt.y - y1) < edgeTolerance)
            && pt.x > x0 + cornerTolerance && pt.x < x1 - cornerTolerance) {
            canvas.style.cursor = 'ns-resize';
            return;
        }
    }

    // ── 3) IMAGE HANDLE HOVER ───────────────────────────────────────────
    if (!isDraggingImage && !isResizingImage && activeImage) {
        const handle = getImageHandleUnderMouse(pos.x, pos.y, activeImage);
        if (handle) {
            if (handle === 'top-left' || handle === 'bottom-right') {
                canvas.style.cursor = 'nwse-resize';
            } else if (handle === 'top-right' || handle === 'bottom-left') {
                canvas.style.cursor = 'nesw-resize';
            } else if (handle === 'left' || handle === 'right') {
                canvas.style.cursor = 'ew-resize';
            } else if (handle === 'top' || handle === 'bottom') {
                canvas.style.cursor = 'ns-resize';
            }
            return;
        }
    }

    // ── 4) GROUP DRAG ───────────────────────────────────────────────────
    if (isDraggingGroup) {
        const dx = e.clientX - groupDragStart.x;
        const dy = e.clientY - groupDragStart.y;
        groupStarts.forEach(({ obj, x, y }) => {
            obj.x = x + dx;
            obj.y = y + dy;
        });
        drawCanvas("Common");
        canvas.style.cursor = "grabbing";
        return;
    }

    // ── 5) TEXT RESIZE & DRAG ───────────────────────────────────────────
    if (isResizingText && activeText && activeTextHandle) {
        const txt = activeText;

        const wStart = txt._resizeStartW;
        const hStart = txt._resizeStartH;
        const fontStart = txt._resizeStartFont;

        const cx = txt.x + wStart / 2;
        const cy = txt.y + hStart / 2;
        const θ = (txt.rotation || 0) * Math.PI / 180;

        const dx = pos.x - cx;
        const dy = pos.y - cy;
        const localX = dx * Math.cos(-θ) - dy * Math.sin(-θ);
        const localY = dx * Math.sin(-θ) + dy * Math.cos(-θ);

        let origLX = 0, origLY = 0, cursorLocal = "default";
        switch (activeTextHandle) {
            case "bottom-right": origLX = wStart / 2; origLY = hStart / 2; cursorLocal = "nwse-resize"; break;
            case "bottom-left": origLX = -wStart / 2; origLY = hStart / 2; cursorLocal = "nesw-resize"; break;
            case "top-right": origLX = wStart / 2; origLY = -hStart / 2; cursorLocal = "nesw-resize"; break;
            case "top-left": origLX = -wStart / 2; origLY = -hStart / 2; cursorLocal = "nwse-resize"; break;
        }

        const origDist = Math.hypot(origLX, origLY);
        const newDist = Math.hypot(localX, localY);
        const scaleFactor = newDist / origDist;

        const newFontSize = Math.max(8, fontStart * scaleFactor);

        const context = canvas.getContext("2d");
        context.font = `${newFontSize}px ${txt.fontFamily}`;
        //const lines = wrapText(context, txt.text.replace(/\n/g, ""), Infinity);
        //const lineHeight = newFontSize * txt.lineSpacing;
        //const measuredH = lines.length * lineHeight + 2 * padding;
        //const measuredW = Math.max(...lines.map(line => context.measureText(line).width)) + 2 * padding;

        const rawLines = txt.text.split('\n');
        context.font = `${newFontSize}px ${txt.fontFamily}`;
        const lineHeight = newFontSize * txt.lineSpacing;
        const measuredW = Math.max(...rawLines.map(line => context.measureText(line).width)) + 2 * padding;
        const measuredH = rawLines.length * lineHeight + 2 * padding;


        txt.fontSize = newFontSize;
        txt.boundingWidth = measuredW;
        txt.boundingHeight = measuredH;

        // Shift x/y if resizing from top or left
        //if (activeTextHandle.includes("left") || activeTextHandle.includes("top")) {
        //    const deltaLX = localX - origLX;
        //    const deltaLY = localY - origLY;
        //    const s = Math.sin(θ), c = Math.cos(θ);
        //    const dxShift = (activeTextHandle.includes("left") ? deltaLX : 0);
        //    const dyShift = (activeTextHandle.includes("top") ? deltaLY : 0);
        //    txt.x += dxShift * c - dyShift * s;
        //    txt.y += dxShift * s + dyShift * c;
        //}

        drawCanvas("Common");
        canvas.style.cursor = cursorLocal;
        return;
    }
    if (isDraggingText && activeText) {
        const txt = activeText;
        const center = { x: txt.x + txt.boundingWidth / 2, y: txt.y + txt.boundingHeight / 2 };
        const pt = rotatePoint(pos.x, pos.y, center.x, center.y, -txt.rotation);
        txt.x = pt.x - dragOffsetText.x;
        txt.y = pt.y - dragOffsetText.y;
        drawCanvas("Common");
        canvas.style.cursor = "grabbing";
        return;
    }

    // ── 6) IMAGE DRAG ───────────────────────────────────────────────────
    if (isDraggingImage && activeImage) {
        activeImage.x = pos.x - dragOffsetImage.x;
        activeImage.y = pos.y - dragOffsetImage.y;
        drawCanvas("Common");
        canvas.style.cursor = "grabbing";
        return;
    }

    // ── 7) IMAGE RESIZE ─────────────────────────────────────────────────
    if (isResizingImage && activeImage && activeImageHandle) {
        const img = activeImage;
        // (image block remains exactly as you already verified it works)

        const wStart = img._resizeStartW;
        const hStart = img._resizeStartH;
        const cx = img.x + wStart / 2;
        const cy = img.y + hStart / 2;
        const θ = (img.rotation || 0) * Math.PI / 180;

        const dx = pos.x - cx;
        const dy = pos.y - cy;
        const localX = dx * Math.cos(-θ) - dy * Math.sin(-θ);
        const localY = dx * Math.sin(-θ) + dy * Math.cos(-θ);

        let origLX = 0, origLY = 0, cursorImg = "default";
        switch (activeImageHandle) {
            case "bottom-right":
                origLX = wStart / 2; origLY = hStart / 2; cursorImg = "nwse-resize"; break;
            case "bottom-left":
                origLX = -wStart / 2; origLY = hStart / 2; cursorImg = "nesw-resize"; break;
            case "top-right":
                origLX = wStart / 2; origLY = -hStart / 2; cursorImg = "nesw-resize"; break;
            case "top-left":
                origLX = -wStart / 2; origLY = -hStart / 2; cursorImg = "nwse-resize"; break;
            case "right":
                origLX = wStart / 2; origLY = 0; cursorImg = "ew-resize"; break;
            case "left":
                origLX = -wStart / 2; origLY = 0; cursorImg = "ew-resize"; break;
            case "bottom":
                origLX = 0; origLY = hStart / 2; cursorImg = "ns-resize"; break;
            case "top":
                origLX = 0; origLY = -hStart / 2; cursorImg = "ns-resize"; break;
        }

        const deltaLX = localX - origLX;
        const deltaLY = localY - origLY;

        let newLocalW = wStart;
        let newLocalH = hStart;
        if (activeImageHandle.includes("right")) newLocalW = wStart + 2 * deltaLX;
        else if (activeImageHandle.includes("left")) newLocalW = wStart - 2 * deltaLX;
        if (activeImageHandle.includes("bottom")) newLocalH = hStart + 2 * deltaLY;
        else if (activeImageHandle.includes("top")) newLocalH = hStart - 2 * deltaLY;

        const minW = 20;
        const minH = 20;
        newLocalW = Math.max(newLocalW, minW);
        newLocalH = Math.max(newLocalH, minH);

        img.scaleX = newLocalW / img.width;
        img.scaleY = newLocalH / img.height;

        if (activeImageHandle.includes("left")) {
            const shiftLX = deltaLX;
            const shiftLY = 0;
            const s = Math.sin(θ), c = Math.cos(θ);
            img.x += shiftLX * c - shiftLY * s;
            img.y += shiftLX * s + shiftLY * c;
        }
        if (activeImageHandle.includes("top")) {
            const shiftLX = 0;
            const shiftLY = deltaLY;
            const s = Math.sin(θ), c = Math.cos(θ);
            img.x += shiftLX * c - shiftLY * s;
            img.y += shiftLX * s + shiftLY * c;
        }

        drawCanvas("Common");
        canvas.style.cursor = cursorImg;
        return;
    }

    // ── 8) HOVER FEEDBACK ───────────────────────────────────────────────
    if (!isDraggingText && !isResizingText && activeText) {
        const cx = activeText.x + activeText.boundingWidth / 2;
        const cy = activeText.y + activeText.boundingHeight / 2;
        const θ = -(activeText.rotation || 0) * Math.PI / 180;
        const dx = pos.x - cx;
        const dy = pos.y - cy;
        const localX = dx * Math.cos(θ) - dy * Math.sin(θ);
        const localY = dx * Math.sin(θ) + dy * Math.cos(θ);
        if (
            localX >= -activeText.boundingWidth / 2 &&
            localX <= activeText.boundingWidth / 2 &&
            localY >= -activeText.boundingHeight / 2 &&
            localY <= activeText.boundingHeight / 2
        ) {
            cursor = "grab";
        }
    }
    if (!isDraggingImage && !isResizingImage && activeImage) {
        const sx = (typeof activeImage.scaleX === "number") ? activeImage.scaleX : 1;
        const sy = (typeof activeImage.scaleY === "number") ? activeImage.scaleY : 1;
        const w = activeImage.width * sx;
        const h = activeImage.height * sy;
        const cx = activeImage.x + w / 2;
        const cy = activeImage.y + h / 2;
        const θ = -(activeImage.rotation || 0) * Math.PI / 180;
        const dx = pos.x - cx;
        const dy = pos.y - cy;
        const localX = dx * Math.cos(θ) - dy * Math.sin(θ);
        const localY = dx * Math.sin(θ) + dy * Math.cos(θ);
        if (
            localX >= -w / 2 &&
            localX <= w / 2 &&
            localY >= -h / 2 &&
            localY <= h / 2
        ) {
            cursor = "grab";
        }
    }
    if (isDraggingSelectionBox) {
        const r = canvas.getBoundingClientRect();
        selectionEnd = { x: e.clientX - r.left, y: e.clientY - r.top };
        drawCanvas("Common");        // live update
    }

    canvas.style.cursor = cursor;
});
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
canvas.addEventListener("mouseup", function (e) {
    const graphicBtn = document.querySelector('.toggle-btn[data-mode="graphic"]');
    const buttons = document.querySelectorAll('.toggle-btn');

    if (isResizingText && activeText && activeTextHandle) {
        onBoxResizeEnd(activeText);
    }

    if (isDraggingSelectionBox) {
        skipNextClick = true;
        isDraggingSelectionBox = false;
        drawCanvas("Common");        // final update + UI panels
    }

    // Final cleanup
    isDraggingGroup = false;
    isDraggingText = false;
    isDraggingImage = false;
    isResizingText = false;
    isResizingImage = false;
    isRotating = false;
    groupDragStart = null;
    groupStarts = [];
    activeTextHandle = null;
    activeImageHandle = null;
    rotatingObject = null;
    currentDrag = null;
});
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
}
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
canvas.addEventListener("click", function (e) {
    // ignore shift here
    if (e.shiftKey) return;

    if (skipNextClick) {
        skipNextClick = false;
        return;    // swallow this click so it doesn’t clear selection
    }

    const buttons = document.querySelectorAll('.toggle-btn');
    const graphicBtn = document.querySelector('.toggle-btn[data-mode="graphic"]');





    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const pos = { x: mouseX, y: mouseY };

    // helpers to clear selection
    const clearText = () => textObjects.forEach(o => o.selected = false);
    const clearImages = () => images.forEach(i => i.selected = false);

    // find what was clicked
    const txtHit = getTextObjectAt(mouseX, mouseY);
    let imgHit = null;
    for (let i = images.length - 1; i >= 0; i--) {
        if (isMouseOverImage(images[i], pos)) {
            imgHit = images[i];
            break;
        }
    }

    // always start fresh
    clearText();
    clearImages();
    activeText = null;
    activeImage = null;

    // helper to select a whole group
    function selectGroup(id) {
        textObjects.forEach(o => { if (o.groupId === id) o.selected = true; });
        images.forEach(i => { if (i.groupId === id) i.selected = true; });
    }

    // update the groupCheckbox UI
    const groupCheckbox = document.getElementById("groupCheckbox");
    function updateCheckboxFor(id) {
        if (id != null) {
            groupCheckbox.checked = true;
        } else {
            groupCheckbox.checked = false;
        }
    }

    if (txtHit) {
        // TEXT clicked
        txtHit.selected = true;
        activeText = txtHit;

        // if this text is grouped, select its entire group
        if (txtHit.groupId != null) {
            selectGroup(txtHit.groupId);
            updateCheckboxFor(txtHit.groupId);
        } else {
            updateCheckboxFor(null);
        }

        // update UI panels...
        $("#favcolor").val(txtHit.textColor);
        $("#noAnimCheckbox").prop("checked", !!txtHit.noAnim);
        $("#fontstyle_popup").show();
        $(".right-sec-two").show();
        $(".right-sec-one").hide();
        //document.getElementById("modeButton").innerText = "Animation Mode";
        $("#opengl_popup").hide();
        // 2) Clear `active` from all
        buttons.forEach(b => b.classList.remove('active'));

        // 3) Activate only the Graphic button
        graphicBtn.classList.add('active');

        var opacity = txtHit.opacity * 100 || 100;
        if (opacity > 100) opacity = 100;
        opacitySlider.value = opacity;
        document.getElementById("opacityValue").textContent = opacity + "";
        opacityBadge.textContent = opacity;

    }
    else if (imgHit) {
        // IMAGE clicked
        imgHit.selected = true;
        activeImage = imgHit;

        if (imgHit.groupId != null) {
            selectGroup(imgHit.groupId);
            updateCheckboxFor(imgHit.groupId);
        } else {
            updateCheckboxFor(null);
        }

        // update UI panels...
        $("#noAnimCheckbox").prop("checked", !!imgHit.noAnim);
        $("#fontstyle_popup").show();
        $(".right-sec-two").show();
        $(".right-sec-one").hide();
        //document.getElementById("modeButton").innerText = "Animation Mode";
        $("#opengl_popup").hide();
        // 2) Clear `active` from all
        buttons.forEach(b => b.classList.remove('active'));

        // 3) Activate only the Graphic button
        graphicBtn.classList.add('active');

        var opacity = imgHit.opacity * 100 || 100;
        if (opacity > 100) opacity = 100;
        opacitySlider.value = opacity;
        document.getElementById("opacityValue").textContent = opacity + "";
        opacityBadge.textContent = opacity;
        if ($("#hdnFillStrockColorFlag").val() == '1') {
            $("#hdnfillColor").val(imgHit.fillNoColor || "#FFFFFF");
            $("#hdnStrockColor").val(imgHit.strokeNoColor || "#FFFFFF");
            $("#favFillcolor").val($("#hdnfillColor").val());
            $("#favStrockcolor").val($("#hdnStrockColor").val());
            $("#hdnFillStrockColorFlag").val('2');
        }

    }
    else {
        // — clicked empty space —
        clearText();
        clearImages();
        activeText = null;
        activeImage = null;
        // no group selected
        updateCheckboxFor(null);

        // 2) Clear `active` from all
        buttons.forEach(b => b.classList.remove('active'));

        // 3) Activate only the Graphic button
        graphicBtn.classList.add('active');

        const opacity = 100;
        opacitySlider.value = opacity;
        document.getElementById("opacityValue").textContent = opacity + "";
        opacityBadge.textContent = opacity;
    }

    drawCanvas('Common');
    updateFontStyleButtons();
    const selectedType = getSelectedType();
    if (selectedType == "Shape") {
        $("#hdnfillNoColorStatus").val(imgHit.fillNoColorStatus || false);
        $("#hdnstrokeNoColorStatus").val(imgHit.strokeNoColorStatus || false);
        //if ($("#hdnfillColor").val() == imgHit.fillNoColor) {
        //    $("#hdnfillColor").val(imgHit.fillNoColor || "#FFFFFF");
        //}
        //if ($("#hdnStrockColor").val() == imgHit.strokeNoColor) {
        //    $("#hdnStrockColor").val(imgHit.strokeNoColor || "#FFFFFF");
        //}

        //$("#favFillcolor").val($("#hdnfillColor").val());
        //$("#favStrockcolor").val($("#hdnStrockColor").val());

        document.getElementById('ddlStrokeWidth').value = (imgHit.strokeWidth || 3).toString();
        document.getElementById("noColorCheck").checked = toBool(imgHit.fillNoColorStatus) || false;
        document.getElementById("noColorCheck2").checked = toBool(imgHit.strokeNoColorStatus) || false;

        const noColorChecked = document.getElementById("noColorCheck").checked;
        const noStrokeChecked = document.getElementById("noColorCheck2").checked;
        if (noColorChecked) {
            updateSelectedImageColors(
                "none", noStrokeChecked ? "none" : $("#hdnStrockColor").val(), document.getElementById("ddlStrokeWidth").value || 2
            );
        }


        if (noStrokeChecked) {
            updateSelectedImageColors(
                noColorChecked ? "none" : $("#hdnfillColor").val(),
                "none", document.getElementById("ddlStrokeWidth").value || 2
            );
        }


    }
    console.log("Selected Type:", selectedType);
    HideShowRightPannel(selectedType);

});
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
        textEditor.addEventListener("blur", finishEditing);
    }
});

// When the text editor loses focus or Enter is pressed, update the text
document.addEventListener("DOMContentLoaded", () => {
    const textEditor = document.getElementById("textEditor");
    if (!textEditor) {
       // console.error("No #textEditor in DOM");
        return;
    }

    textEditor.addEventListener("blur", () => {
        const editingObj = textObjects.find(o => o.editing);
        if (editingObj) {
            editingObj.text = textEditor.value;
            editingObj.editing = false;
            textEditor.style.display = "none";
            drawCanvas('Common');
        }
    });
});
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
function SetNoFillColor() {
    const noColorChecked = document.getElementById("noColorCheck").checked;
    const fillColorPicker = document.getElementById("favFillcolor");

    const noStrokeChecked = document.getElementById("noColorCheck2").checked;
    if (activeImage) {
        if (noColorChecked) {
            // Store current color before removing
          
            $("#hdnfillColor").val("none");

            updateSelectedImageColors(
                "none", noStrokeChecked ? "none" : $("#hdnStrockColor").val(), document.getElementById("ddlStrokeWidth").value || 2
            );

            $("#hdnfillNoColorStatus").val(true);
            $("#hdnfillColor").val(fillColorPicker.value);
        } else {
            $("#hdnfillNoColorStatus").val(false);
           
            $("#hdnfillColor").val(fillColorPicker.value);

            updateSelectedImageColors(
                $("#hdnfillColor").val(), noStrokeChecked ? "none" : $("#hdnStrockColor").val(), document.getElementById("ddlStrokeWidth").value || 2
            );
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

        updateSelectedImageColors(noColorChecked ? "none" : $("#hdnfillColor").val(), $("#hdnStrockColor").val(), document.getElementById("ddlStrokeWidth").value || 2);
        $("#hdnstrokeNoColorStatus").val(false);
    }
}
//No color option for stroke color 
let previousStrokeColor = null; // Store the previous stroke color

function SetNoStrokeColor() {
    const noStrokeChecked = document.getElementById("noColorCheck2").checked;
    const strokeColorPicker = document.getElementById("favStrockcolor");

    const noColorChecked = document.getElementById("noColorCheck").checked;
  
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
            $("#hdnStrockColor").val(strokeColorPicker.value);
            updateSelectedImageColors(noColorChecked ? "none" : $("#hdnfillColor").val(), $("#hdnStrockColor").val(), document.getElementById("ddlStrokeWidth").value || 2);
        }
    }
}
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

canvasContainer.addEventListener("scroll", function () {
    scrollTop = canvasContainer.scrollTop;
});
document.querySelectorAll("#imageContainer img").forEach(img => {
    img.addEventListener("dragstart", function (e) {
        // Transfer the image src as text
        e.dataTransfer.setData("text/plain", e.target.src);
    });
});
canvas.addEventListener('dragover', e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
});
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
function RemoveBackgroundImage() {
    canvas._bgImg = null;
    drawCanvas('Common'); // Redraw the canvas without the background image.

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
    });

    drawCanvas("Common");
    updateFontStyleButtons();
}
function italicText() {
    textObjects.forEach(obj => {
        if (obj.selected) obj.isItalic = !obj.isItalic;
    });
    drawCanvas("Common");
    updateFontStyleButtons();
}
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


duplicateOption.addEventListener('click', () => {
    let DesignBoardDetailsId;
    if (activeSlide === 1) {
        DesignBoardDetailsId = $(`#hdnDesignBoardDetailsIdSlide1`).val();
    } else if (activeSlide === 2) {
        DesignBoardDetailsId = $(`#hdnDesignBoardDetailsIdSlide2`).val();
    }
    else if (activeSlide === 3) {
        MessageShow('', 'Already 3 slide created.Delete any one and then duplicate!', 'error');
        return;
    }
    const isDefaultOrBlank = !slideId || slideId.trim() === "" || slideId === "00000000-0000-0000-0000-000000000000";

    if (!isDefaultOrBlank) {
        try {
            ShowLoader();
            const dataSlide = {
                DesignBoardDetailsId: slideId
            };

            $.ajax({
                url: baseURL + "Canvas/DuplicateDesignSlideBoard",
                type: "POST",
                dataType: "json",
                data: dataSlide,
                success: function (slideResult) {
                    HideLoader();
                    if (slideResult.response === 'ok') {
                        MessageShow('RedirectToHorizontalPageWithQueryString()', 'Slide duplicate successfully!', 'success');
                    } else {
                        MessageShow('', 'Failed to duplicate slide.', 'error');
                    }
                },
                error: function (data) {
                    console.log("Error in delete slide", data);
                    HideLoader();
                    MessageShow('', 'Error duplicate slide.', 'error');
                }
            });

        } catch (e) {
            console.log("catch", e);
            HideLoader();
        }
    }
});
function SaveDesignBoard() {
    try {
        ShowLoader();
        textObjects.forEach(o => o.selected = false);
        images.forEach(img => img.selected = false);

        // Save the current slide before proceeding (if you have an active slide mechanism)
        saveCurrentSlide();

        var boardName = $("#txtSaveDesignBoardName").val().trim();
        if (!boardName) {
            MessageShow('', 'Design Board name can not be blank', 'error');
            return false; // Halt execution if needed
        }
        // Build the main design board data object.
        var boardData = {
            DesignBoardId: $("#hdnDesignBoardId").val() || '00000000-0000-0000-0000-000000000000',
            CustomerId: '4DB56C68-0291-497B-BBCF-955609284A70',
            CompanyId: 'F174A15A-76B7-4E19-BE4B-4E240983DE55',
            DesignBoardName: $("#txtSaveDesignBoardName").val(),
            SlideType: 'Horizontal'
        };


        $.ajax({
            url: baseURL + "Canvas/SaveUpdateDesignBoard",
            type: "POST",
            dataType: "json",
            data: boardData,
            success: function (result) {
                // Update the hidden design board id
                $("#hdnDesignBoardId").val(result.result);

                // Prepare a default id constant to check new vs. update
                var defaultId = '00000000-0000-0000-0000-000000000000';
                var defaultEffect = 'delaylinear';
                var defaultDirection = 'left';
                var defaultAnimationVideoPath = '';
                var defaultAnimationImagePath = '';

                // Prepare slide data for each slide
                var slides = [
                    { slideSeq: 1, json: verticalSlide1, hdnField: "#hdnDesignBoardDetailsIdSlide1", slideName: 'Slide-1', effect: "#hdnEffectSlide1", direction: "#hdnDirectiontSlide1", outEffect: "#hdnOutEffectSlide1", outDirection: "#hdnOutDirectiontSlide1", animationVideoPath: "#hdnDesignBoardDetailsIdSlideFilePath1", animationImagePath: "#hdnDesignBoardDetailsIdSlideImageFilePath1" },
                    { slideSeq: 2, json: verticalSlide2, hdnField: "#hdnDesignBoardDetailsIdSlide2", slideName: 'Slide-2', effect: "#hdnEffectSlide2", direction: "#hdnDirectiontSlide2", outEffect: "#hdnOutEffectSlide2", outDirection: "#hdnOutDirectiontSlide2", animationVideoPath: "#hdnDesignBoardDetailsIdSlideFilePath2", animationImagePath: "#hdnDesignBoardDetailsIdSlideImageFilePath2" },
                    { slideSeq: 3, json: verticalSlide3, hdnField: "#hdnDesignBoardDetailsIdSlide3", slideName: 'Slide-3', effect: "#hdnEffectSlide3", direction: "#hdnDirectiontSlide3", outEffect: "#hdnOutEffectSlide3", outDirection: "#hdnOutDirectiontSlide3", animationVideoPath: "#hdnDesignBoardDetailsIdSlideFilePath3", animationImagePath: "#hdnDesignBoardDetailsIdSlideImageFilePath3" }
                ];

                // Function to save/update one slide
                function saveSlide(slide) {
                    // Get current slide detail id from the hidden field
                    var currentDetailId = $(slide.hdnField).val() || defaultId;
                    var currentEffect = $(slide.effect).val() || defaultEffect;
                    var currentDirection = $(slide.direction).val() || defaultDirection;

                    var currentOutEffect = $(slide.outEffect).val() || defaultEffect;
                    var currentOutDirection = $(slide.outDirection).val() || defaultDirection;

                    var currentAnimationVideoPath = $(slide.animationVideoPath).val() || defaultAnimationVideoPath;
                    var currentAnimationImagePath = $(slide.animationImagePath).val() || defaultAnimationImagePath;

                    const els = [
                        document.getElementById('hdnTransition1'),
                        document.getElementById('hdnTransition2'),
                    ];
                   
                    const stripescolor = els
                        .map(el => el.value||"")
                        .join('~');



                    var dataSlide = {
                        DesignBoardDetailsId: currentDetailId,  // if new, this is default, if update, this is the actual id
                        DesignBoardId: $("#hdnDesignBoardId").val(),
                        SlideSequence: slide.slideSeq,
                        JsonFile: slide.json,
                        SlideName: slide.slideName,
                        Effect: currentEffect,
                        Direction: currentDirection,
                        OutEffect: currentOutEffect,
                        OutDirection: currentOutDirection,
                        AnimationVideoPath: currentAnimationVideoPath,
                        AnimationImagePath: currentAnimationImagePath,
                        TransitionType: $("#hdntransition").val() || 'slideLeft',
                        TransitionColor: stripescolor
                    };

                    $.ajax({
                        url: baseURL + "Canvas/SaveUpdateDesignSlideBoard",
                        type: "POST",
                        dataType: "json",
                        data: dataSlide,
                        success: function (slideResult) {
                            // Update the hidden field with returned id so that future updates know this record exists
                            $(slide.hdnField).val(slideResult.result);


                            if (slideResult.result !== '' && $(`#hdnDesignBoardDetailsIdSlide${activeSlide}`).val() === slideResult.result) {
                                const canvas = document.getElementById('myCanvas'); // Your canvas element
                                const ctx = canvas.getContext('2d');

                                // Ensure all images & SVGs are fully loaded before capturing
                                //  const images = document.querySelectorAll("img, svg");
                                let loadedCount = 0;
                                images.forEach(img => {
                                    if (!img.img.complete) {
                                        img.onload = () => {
                                            loadedCount++;
                                            if (loadedCount === images.length) captureSlide(activeSlide, slideResult);
                                        };
                                        img.onerror = () => {
                                            console.warn("Failed to load image:", img.src);
                                            loadedCount++;
                                        };
                                    } else {
                                        loadedCount++;
                                    }
                                });

                                if (loadedCount === images.length) captureSlide(activeSlide, slideResult); // If all images are already loaded

                            }
                            else {
                                HideLoader();
                                MessageShow('RedirectToHorizontalPageWithQueryString()', 'Design Board saved successfully!', 'success');
                            }
                        },
                        error: function (data) {
                            console.log("error in saving slide " + slide.slideSeq, data);
                            HideLoader();
                        }
                    });
                }

                // Save each slide one by one (you can also loop through slides if needed)
                slides.forEach(function (slide) {
                    // Only send the slide data if there's something in the JSON
                    // You might want to add extra checks if needed
                    if (slide.json) {
                        saveSlide(slide);
                    }
                });

                // Optionally, reset the main design board hidden field here or later, based on your flow.
                // $("#hdnDesignBoardId").val(defaultId);

                // HideLoader();

                // Check for login response or success message as needed.
                if (result === "login") {
                    window.location.href = baseURL + 'Login/Index';
                    return false;
                }
                if (result !== null) {


                    // MessageShow('RedirectToVerticalPageWithQueryString()', 'Design Board saved successfully!', 'success');
                    // $("#hdnBackgroundSpecificColor").val("rgba(255, 255, 255, 0.95)");
                }
                // HideLoader();
            },
            error: function (data) {
                console.log("error", data);
                HideLoader();
            }
        });
    } catch (e) {
        console.log("catch", e);
        HideLoader();
    }
}
async function captureSlide(activeSlide, slideResult) {
    const canvas = document.getElementById("myCanvas");
    const ctx = canvas.getContext("2d");
    // 1) Update your canvas one last time:
    drawCanvas("Common");
    // 2) Wait for any <img> or <svg> in the DOM to be fully loaded:
    const imgs = images;//Array.from(document.querySelectorAll("img, svg"));
    await Promise.all(imgs.map(el => {
        if (el.img.complete) return Promise.resolve();
        return new Promise(res => {
            el.onload = () => res();
            el.onerror = () => {
                console.warn("Image failed to load before capture:", el.src);
                res();
            };
        });
    }));

    // 3) Wait for the next paint so the drawCanvas changes actually hit the GPU/composite:
    await new Promise(requestAnimationFrame);

    // 4) Now safely snapshot the canvas:
    canvas.toBlob(async blob => {
        if (!blob) {
            console.error("Canvas capture failed: empty blob");
            return;
        }

        // upload the blob
        const formData = new FormData();
        formData.append("image", blob, "canvas.png");
        formData.append("folderId", slideResult.result || "new");

        try {
            const resp = await fetch(baseURL + "video/save-image", {
                method: "POST", body: formData
            });
            const data = await resp.json();
            console.log("Image saved:", data);

            // build absolute URL and cache-bust
            const imgUrl = new URL(data.filePath, window.location.origin);
            imgUrl.searchParams.set("t", Date.now());

            // update your hidden field & thumbnail
            $(`#hdnDesignBoardDetailsIdSlideImageFilePath${activeSlide}`)
                .val(data.filePath);
            $(`#imageHorizontal${activeSlide}`)
                .attr("src", imgUrl.toString());

            // finally persist the path in your DB
            await $.ajax({
                url: baseURL + "Canvas/UpdateDesignDesignBoardDetailsImagePath",
                type: "POST",
                dataType: "json",
                data: {
                    DesignBoardDetailsId: slideResult.result,
                    ImagePath: data.filePath
                },
                success: function (response) {
                    sessionStorage.setItem("leftPanelHtml", document.getElementById("divpanelleftH").innerHTML);
                    MessageShow('RedirectToHorizontalPageWithQueryString()', 'Design Board saved successfully!', 'success');
                },
                error: function (xhr, status, error) {
                    HideLoader();
                    console.error("Failed to update image path:", error);
                    MessageShow(null, 'Failed to save Design Board.', 'error');
                }
            });

        } catch (err) {
            console.error("Error saving or updating image:", err);
            HideLoader();
        }
    }, "image/png");
}
function RedirectToHorizontalPageWithQueryString() {
    // Get the GUID from the hidden field
    var boardId = $("#hdnDesignBoardId").val();
    HideLoader();
    window.location = `${baseURL}Canvas/HorizontalIndex?id=${boardId}`;
}
function saveCurrentSlide() {
    var currentState = saveCanvasData();
    // Parse the JSON string to an object.
    var stateObj;
    try {
        stateObj = JSON.parse(currentState);
    } catch (e) {
        console.error("Error parsing currentState", e);
        return;
    }

    // Determine if the state is effectively "blank".
    var isBlankState = (
        (!stateObj.canvasBgImage || stateObj.canvasBgImage.trim() === "") &&
        (!stateObj.slideEffect || stateObj.slideEffect.trim() === "") &&
        (!stateObj.slideDedirection || stateObj.slideDedirection.trim() === "") &&
        (!stateObj.text || stateObj.text.length === 0) &&
        (!stateObj.images || stateObj.images.length === 0)
    );
    // Only update the slide if the state isn't blank.
    if (!isBlankState) {
        if (activeSlide === 1) {
            verticalSlide1 = currentState;
        } else if (activeSlide === 2) {
            verticalSlide2 = currentState;
        } else if (activeSlide === 3) {
            verticalSlide3 = currentState;
        }
    }
}
function SaveDesignBoardSlide(newSlideNumber) {
    // Save the current slide state (if it's not blank).
    saveCurrentSlide();




    // Create a helper to get a deep copy of a JSON string.
    function getDeepCopy(jsonStr) {
        try {
            return JSON.stringify(JSON.parse(jsonStr));
        } catch (e) {
            console.error("Error creating deep copy:", e);
            return jsonStr;
        }
    }
    // Update the active slide number.
    activeSlide = newSlideNumber;
    // Load the saved state for the new active slide using your loadCanvasFromJson function.
    if (activeSlide === 1 && verticalSlide1) {
        // Pass a deep copy so the original remains intact.
        loadCanvasFromJson(getDeepCopy(verticalSlide1), 'Common');
    } else if (activeSlide === 2 && verticalSlide2) {
        loadCanvasFromJson(getDeepCopy(verticalSlide2), 'Common');
    } else if (activeSlide === 3 && verticalSlide3) {
        loadCanvasFromJson(getDeepCopy(verticalSlide3), 'Common');
    } else {
        // If no saved state exists for this slide, clear the canvas.
        clearCanvas();
    }
    SelectionOfEffectandDirection(activeSlide);
}
function SelectionOfEffectandDirection(activeSlide) {
    // Get the container using its ID.
    var ulEffects = document.getElementById("ulEffects");

    // Select all <a> elements within the container.
    var links = ulEffects.getElementsByTagName("a");

    // Remove the active_effect class from all links.
    for (var i = 0; i < links.length; i++) {
        links[i].classList.remove("active_effect");
    }

    var ulDirection = document.getElementById("uldirection");
    // Select all <a> elements within the container.
    var links = ulDirection.getElementsByTagName("a");

    // Remove the active_effect class from all links.
    for (var i = 0; i < links.length; i++) {
        links[i].classList.remove("active_effect");
    }


    if (activeSlide === 1) {
        if ($("#hdnEffectSlide1").val() !== '') {
            document.getElementById("a" + $("#hdnEffectSlide1").val() + "").classList.add("active_effect");
            document.getElementById("a" + $("#hdnDirectiontSlide1").val() + "").classList.add("active_effect");
        }
        if ($("#hdnOutEffectSlide1").val() !== '') {
            document.getElementById("a" + $("#hdnOutEffectSlide1").val() + "").classList.add("active_effect");
            document.getElementById("a" + $("#hdnOutDirectiontSlide1").val() + "").classList.add("active_effect");
        }
    }
    else if (activeSlide === 2) {
        if ($("#hdnEffectSlide2").val() !== '') {
            document.getElementById("a" + $("#hdnEffectSlide2").val() + "").classList.add("active_effect");
            document.getElementById("a" + $("#hdnDirectiontSlide2").val() + "").classList.add("active_effect");
        }
        if ($("#hdnOutEffectSlide2").val() !== '') {
            document.getElementById("a" + $("#hdnOutEffectSlide2").val() + "").classList.add("active_effect");
            document.getElementById("a" + $("#hdnOutDirectiontSlide2").val() + "").classList.add("active_effect");
        }
    }
    else if (activeSlide === 3) {
        if ($("#hdnEffectSlide3").val() !== '') {
            document.getElementById("a" + $("#hdnEffectSlide3").val() + "").classList.add("active_effect");
            document.getElementById("a" + $("#hdnDirectiontSlide3").val() + "").classList.add("active_effect");
        }
        if ($("#hdnOutEffectSlide3").val() !== '') {
            document.getElementById("a" + $("#hdnOutEffectSlide3").val() + "").classList.add("active_effect");
            document.getElementById("a" + $("#hdnOutDirectiontSlide3").val() + "").classList.add("active_effect");
        }
    }
    resizeCanvas();
}

// ──────────────────────────────────────────────────────────────────────
// 1) SAVE: record everything as relative % of the canvas
// ──────────────────────────────────────────────────────────────────────
function saveCanvasData() {
    const dpr = window.devicePixelRatio || 1;
    // current “logical” canvas size in CSS‑pixels
    const screenW = canvas.width / dpr;
    const screenH = canvas.height / dpr;

    // background
    const canvasBgColor = canvas.style.backgroundColor || "#ffffff";
    const canvasBgImage = canvas._bgImg ? canvas._bgImg.src : "";

    const data = {
        canvasBgColor: canvasBgColor,
        canvasBgImage: canvasBgImage,
        slideEffect: $("#hdnTextAnimationType").val(),
        slideDedirection: $("#hdnslideDedirection").val(),

        // store text blocks as percentages + their static style
        text: textObjects.map(obj => {
            return {
                text: obj.text,
                x: obj.x / screenW,
                y: obj.y / screenH,
                boundingWidth: obj.boundingWidth / screenW,
                boundingHeight: obj.boundingHeight / screenH,
                fontSize: obj.fontSize,
                fontFamily: obj.fontFamily,
                textColor: obj.textColor,
                textAlign: obj.textAlign,
                opacity: obj.opacity,
                lineSpacing: obj.lineSpacing,
                noAnim: obj.noAnim,
                groupId: obj.groupId,
                rotation: obj.rotation,
                isBold: obj.isBold || false,
                isItalic: obj.isItalic || false,
                type: obj.type || 'text',
                zIndex: obj.zIndex || getNextZIndex()
            };
        }),

        // store images likewise
        images: images.map(imgObj => {
            // actual displayed width/height after per‑object scale:
            const dispW = (imgObj.width * (imgObj.scaleX || 1));
            const dispH = (imgObj.height * (imgObj.scaleY || 1));
            return {
                src: imgObj.svgData || imgObj.src,
                x: imgObj.x / screenW,
                y: imgObj.y / screenH,
                width: dispW / screenW,
                height: dispH / screenH,
                opacity: imgObj.opacity,
                noAnim: imgObj.noAnim,
                groupId: imgObj.groupId,
                rotation: imgObj.rotation,
                type: imgObj.type || 'image',
                zIndex: imgObj.zIndex || getNextZIndex(),
                fillNoColorStatus: $("#hdnfillNoColorStatus").val(),
                strokeNoColorStatus: $("#hdnstrokeNoColorStatus").val(),
                fillNoColor: $("#hdnfillColor").val(),
                strokeNoColor: $("#hdnStrockColor").val(),
                strokeWidth: parseInt(document.getElementById('ddlStrokeWidth').value, 10) || 3
            };
        })
    };

    return JSON.stringify(data, null, 2);
}
function GetDesignBoardById(id) {

    try {
        var data = {
            DesignBoardId: id
        }
        ShowLoader();
        $.ajax({
            url: baseURL + "Canvas/GetDesignBoardDetailsById",
            type: "POST",
            dataType: "json",
            data: data,
            success: function (result) {
                if (result) {
                    $("#hdnDesignBoardId").val(result.designBoardId);
                    $("#txtSaveDesignBoardName").val(result.designBoardName);
                    $('#designboardLink').text(result.designBoardURL);
                    $('#designBoardName').text(result.designBoardName);


                    if (Array.isArray(result.designBoardDetailsList) && result.designBoardDetailsList.length > 0) {
                        // Reset global variables first to avoid stale data
                        $("#hdntransition").val(result.designBoardDetailsList[0].transitionType);

                        // read the current transition type
                        const t = $('#hdntransition').val();

                        // clear any previously active transition buttons
                        $('.tran_button').removeClass('active');

                        // if it’s slideLeft, add `.active` to the #TslideLeft button
                        if (t === 'slideLeft') {
                            $('#TslideLeft').addClass('active');
                        }
                        // (repeat for other types if you want)
                        else if (t === 'slideRight') {
                            $('#TslideRight').addClass('active');
                        }
                        else {
                            $('.tran_button').removeClass('active');
                        }


                        let [beforeTilde, afterTilde] = result.designBoardDetailsList[0].transitionColor.split('~');
                        if (beforeTilde == "") {
                            beforeTilde = "#d6d61e";
                        }
                        if (afterTilde == "") {
                            afterTilde = "#1ed633";
                        }

                        $('#hdnTransition1').val(beforeTilde);
                        $('#hdnTransition2').val(afterTilde);
                        //document.getElementById('targetDiv1').style.backgroundColor = beforeTilde;
                        //document.getElementById('targetDiv2').style.backgroundColor = afterTilde;
                        document.getElementById('targetDiv1')?.style?.setProperty('background-color', beforeTilde);
                        document.getElementById('targetDiv2')?.style?.setProperty('background-color', afterTilde);


                        $("#tranColor1").val(beforeTilde);
                        $("#tranColor2").val(afterTilde);

                        // Destructure first 3 elements with null coalescing
                        [verticalSlide1, verticalSlide2, verticalSlide3] = result.designBoardDetailsList
                            .slice(0, 3)
                            .map(item => item?.jsonFile || null);
                        // Update hidden fields with safety checks
                        const setHiddenField = (index, selector) => {
                            const value = result.designBoardDetailsList[index]?.designBoardDetailsId || '';
                            $(selector).val(value);
                        };

                        setHiddenField(0, '#hdnDesignBoardDetailsIdSlide1');
                        setHiddenField(1, '#hdnDesignBoardDetailsIdSlide2');
                        setHiddenField(2, '#hdnDesignBoardDetailsIdSlide3');

                        // Update hidden fields with safety checks
                        const setHiddenFieldeffect = (index, selector) => {
                            const value = result.designBoardDetailsList[index]?.effect || '';
                            $(selector).val(value);

                        };

                        setHiddenFieldeffect(0, '#hdnEffectSlide1');
                        setHiddenFieldeffect(1, '#hdnEffectSlide2');
                        setHiddenFieldeffect(2, '#hdnEffectSlide3');

                        // Update hidden fields with safety checks
                        const setHiddenFielddirection = (index, selector) => {
                            const value = result.designBoardDetailsList[index]?.direction || '';
                            $(selector).val(value);
                        };

                        setHiddenFielddirection(0, '#hdnDirectiontSlide1');
                        setHiddenFielddirection(1, '#hdnDirectiontSlide2');
                        setHiddenFielddirection(2, '#hdnDirectiontSlide3');


                        // Update hidden fields with safety checks
                        const setHiddenFieldOuteffect = (index, selector) => {
                            const value = result.designBoardDetailsList[index]?.outEffect || '';
                            $(selector).val(value);

                        };

                        setHiddenFieldOuteffect(0, '#hdnOutEffectSlide1');
                        setHiddenFieldOuteffect(1, '#hdnOutEffectSlide2');
                        setHiddenFieldOuteffect(2, '#hdnOutEffectSlide3');

                        // Update hidden fields with safety checks
                        const setHiddenFieldOutdirection = (index, selector) => {
                            const value = result.designBoardDetailsList[index]?.outDirection || '';
                            $(selector).val(value);
                        };

                        setHiddenFieldOutdirection(0, '#hdnOutDirectiontSlide1');
                        setHiddenFieldOutdirection(1, '#hdnOutDirectiontSlide2');
                        setHiddenFieldOutdirection(2, '#hdnOutDirectiontSlide3');





                        // Update hidden fields with safety checks hdnDesignBoardDetailsIdSlideFilePath1
                        const setHiddenSlideFilePath = (index, selector, videoSelector) => {
                            if (!result || !result.designBoardDetailsList || !Array.isArray(result.designBoardDetailsList)) {
                                console.error("Invalid result object");
                                return;
                            }

                            const value = result.designBoardDetailsList[index]?.animationVideoPath || '';
                            $(selector).val(value);
                        };
                        setHiddenSlideFilePath(0, '#hdnDesignBoardDetailsIdSlideFilePath1');
                        setHiddenSlideFilePath(1, '#hdnDesignBoardDetailsIdSlideFilePath2');
                        setHiddenSlideFilePath(2, '#hdnDesignBoardDetailsIdSlideFilePath3');

                        // Update hidden fields with safety checks hdnDesignBoardDetailsIdSlideFilePath1
                        const setHiddenSlideImageFilePath = (index, selector, videoSelector) => {
                            if (!result || !result.designBoardDetailsList || !Array.isArray(result.designBoardDetailsList)) {
                                console.error("Invalid result object");
                                return;
                            }

                            const value = result.designBoardDetailsList[index]?.animationImagePath || '';
                            $(selector).val(value);
                            if (value != '')
                                $(`#imageHorizontal${index + 1}`).attr('src', `${value}`);
                            console.log(`${value}`);
                        };
                        setHiddenSlideImageFilePath(0, '#hdnDesignBoardDetailsIdSlideImageFilePath1');
                        setHiddenSlideImageFilePath(1, '#hdnDesignBoardDetailsIdSlideImageFilePath2');
                        setHiddenSlideImageFilePath(2, '#hdnDesignBoardDetailsIdSlideImageFilePath3');



                        // Optionally, load one of the slides into the canvas
                        // For example, load slide 1's JSON data if available:
                        // Load first slide if available
                        if (verticalSlide1) {
                            // wait for fonts to finish loading before we draw:
                            document.fonts.ready
                                .then(() => {
                                    loadCanvasFromJson(verticalSlide1, 'Common');
                                })
                                .catch((err) => {
                                    console.warn("Fonts failed to load, drawing anyway:", err);
                                    loadCanvasFromJson(verticalSlide1, 'Common');
                                });
                        }

                        updateEffectButtons('In');
                        updateEffectButtons('Out');
                        updateDirectionButtons('In');
                        updateDirectionButtons('Out');
                        transitionSelected(this);
                    }

                }
                HideLoader();
            },
            error: function (data) {
                console.log("error");
                console.log(data);
                HideLoader();
            }
        });

    } catch (e) {
        console.log("catch", e);
        HideLoader();
    }
};
function ensureFontsInitialized() {
    if (!window.__allFontsReady) {
        const families = [
            'Arial', 'Anton', 'Bebas Neue', 'monstro', 'Montserrat', 'neto', 'Pacifico', 'Roboto'
        ];
        window.__fontFamilyPromises = families.map(fam => {
            // console.log(`vertical Preloading font family: ${fam}`);
            return document.fonts.load(`1em ${fam}`);
        });
        window.__allFontsReady = Promise.all(window.__fontFamilyPromises)
            .then(() => console.log('All font families loaded'))
            .catch(err => console.warn('Error loading fonts:', err));
    }
    return window.__allFontsReady;
}
async function loadCanvasFromJson(jsonData, condition = 'Common') {
    //await window.__allFontsReady;
    await ensureFontsInitialized();
    // Clear existing canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    currentCondition = condition;

    // If no JSON data, wait for fonts then draw default
    if (!jsonData) {
        document.fonts.ready.then(() => drawCanvas(condition));
        return;
    }

    // Parse JSON data
    const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
    slideData = data;

    // Set background color
    canvasBgColor = data.canvasBgColor || '#ffffff';
    document.getElementById('hdnBackgroundSpecificColor').value = canvasBgColor;
    canvas.style.backgroundColor = canvasBgColor;

    // Preload background image if provided
    if (data.canvasBgImage) {
        canvas._bgImg = new Image();
        canvas._bgImg.crossOrigin = 'anonymous';
        canvas._bgImg.src = data.canvasBgImage;
    } else {
        canvas._bgImg = null;
    }

    // Compute actual display size of the canvas
    const rect = canvas.getBoundingClientRect();
    const screenW = rect.width;
    const screenH = rect.height;

    // Convert & store text objects, adjust for manual breaks and clamp within canvas
    textObjects = (data.text || []).map(obj => {
        const bw_norm = obj.boundingWidth * screenW;
        const bh_norm = obj.boundingHeight * screenH;
        const fontPx = obj.fontSize;
        const lineH = fontPx * 1.2;

        // Split on manual \n
        const manualLines = obj.text.split("\n");
        const hasManual = manualLines.length > 1;

        // Compute required height
        const neededHeight = hasManual
            ? (manualLines.length * lineH + 2 * padding)
            : bh_norm;
        const finalHeight = Math.max(bh_norm, neededHeight);
        const finalWidth = bw_norm;

        // Compute initial Y
        let ty = obj.y * screenH;

        // If content overflows bottom edge, clamp up
        if (ty + finalHeight + padding > screenH) {
            ty = screenH - finalHeight - padding;
        }


        return {
            text: obj.text,
            x: obj.x * screenW,
            y: ty,
            boundingWidth: finalWidth,
            boundingHeight: finalHeight,
            fontSize: fontPx,
            fontFamily: obj.fontFamily,
            textColor: obj.textColor,
            textAlign: obj.textAlign,
            opacity: obj.opacity || 100,
            selected: false,
            _hasManualBreaks: hasManual,
            // ← RIGHT HERE: hydrate or default lineSpacing
            lineSpacing: (typeof obj.lineSpacing === 'number')
                ? obj.lineSpacing
                : obj.fontSize * 1.2,
            noAnim: obj.noAnim,
            groupId: obj.groupId,
            rotation: obj.rotation,
            isBold: obj.isBold || false,
            isItalic: obj.isItalic || false,
            type: obj.type || 'text',
            zIndex: obj.zIndex || getNextZIndex(),
        };
    });

    // Preload images (unchanged)
    images = (data.images || []).map(imgObj => {
        const o = { ...imgObj };
        o.x *= screenW;
        o.y *= screenH;
        o.width *= screenW;
        o.height *= screenH;
        o.selected = false;
        o.img = new Image();
        o.img.crossOrigin = 'anonymous';
        o.img.src = imgObj.src;
        o.img.onload = () => drawCanvas(condition);
        o.img.onerror = () => drawCanvas(condition);
        o.noAnim = imgObj.noAnim;
        o.groupId = imgObj.groupId;
        o.rotation = imgObj.rotation;
        o.type = imgObj.type || 'image';
        o.zIndex = imgObj.zIndex || getNextZIndex();
        o.fillNoColorStatus = imgObj.fillNoColorStatus || false;
        o.strokeNoColorStatus = imgObj.strokeNoColorStatus || false;
        o.fillNoColor = imgObj.fillNoColor || "#FFFFFF";
        o.strokeNoColor = imgObj.strokeNoColor || "#FFFFFF";
        o.strokeWidth = imgObj.strokeWidth || 3;
        return o;
    });

    // Preload fonts and draw
    const fontPromises = textObjects.map(o =>
        document.fonts.load(`${o.fontSize}px ${o.fontFamily}`)
    );


    Promise.all(fontPromises).finally(() => {
        // Only auto-fit for those without manual breaks
        textObjects.forEach(obj => {
            //if (!obj._hasManualBreaks) {
            //    autoFitTextNew(obj, padding);
            //}
            autoFitTextNew(obj, padding);
        });
        console.log('drawCanvas calling after Promise');
        drawCanvas(condition);
        // resizeCanvas();
    });
}


function autoFitTextNew(obj, padding = 5) {
    const ctx2 = canvas.getContext('2d');
    const maxW = obj.boundingWidth - 2 * padding;
    const maxH = obj.boundingHeight - 2 * padding;

    // Your designer’s raw text, split on real newlines:
    const rawLines = obj.text.replace(/\r/g, '').split('\n');

    // Given font-size fs, wrap every rawLine to fit maxW, return the full array of wrapped lines:
    function wrapAllLines(fs) {
        ctx2.font = `${fs}px ${obj.fontFamily}`;
        return rawLines.flatMap(line => wrapText(ctx2, line, maxW));
    }

    // Given fs, compute block dims for the wrapped lines at that size:
    function measure(fs) {
        const lines = wrapAllLines(fs);
        const widths = lines.map(l => ctx2.measureText(l).width);
        const blockW = Math.max(...widths, 0);
        const lineH = fs * 1.2;
        const blockH = lines.length * lineH;
        return { blockW, blockH, lines };
    }

    // 1) start at designer fontSize
    let fs = Math.floor(obj.fontSize);
    let { blockW, blockH, lines } = measure(fs);

    // 2) shrink while too big
    while ((blockW > maxW || blockH > maxH) && fs > 1) {
        fs--;
        ({ blockW, blockH, lines } = measure(fs));
    }

    // 3) grow while it still fits
    while (true) {
        const next = measure(fs + 1);
        if (next.blockW <= maxW && next.blockH <= maxH) {
            fs++;
            blockW = next.blockW;
            blockH = next.blockH;
            lines = next.lines;
        } else {
            break;
        }
    }

    // 4) commit: final fs + its wrapped lines + new boundingHeight
    obj.fontSize = fs;
    obj._wrappedLines = lines;
    // obj.boundingHeight = lines.length * fs * 1.3 + 2 * padding;
    const measuredWidths = lines.map(l => ctx2.measureText(l).width);
    obj.boundingWidth = Math.max(...measuredWidths, 0) + 2 * padding;

}



// helper: shrink font and wrap text to fit bounding box
function autoFitText(obj, padding) {
    const ctx2 = canvas.getContext('2d');
    const maxW = obj.boundingWidth - 2 * padding;
    let fs = obj.fontSize;
    ctx2.font = `${fs}px ${obj.fontFamily}`;
    let raw = obj.text.replace(/\r/g, '');
    let lines;
    if (!raw.includes('\n')) {
        let w = ctx2.measureText(raw).width;
        while (w > maxW && fs > 6) {
            fs--;
            ctx2.font = `${fs}px ${obj.fontFamily}`;
            w = ctx2.measureText(raw).width;
        }
        lines = wrapText(ctx2, raw, maxW);
    } else {
        lines = [];
        raw.split('\n').forEach(line => {
            lines.push(...wrapText(ctx2, line, maxW));
        });
    }
    obj.fontSize = fs;
    obj.text = lines.join('\n');
    obj.boundingHeight = lines.length * fs * 1.2 + 2 * padding;
}

function autoFitTextForDownload(obj, padding) {
    const ctx2 = canvasForDownload.getContext('2d');
    const maxW = obj.boundingWidth - 2 * padding;
    let fs = obj.fontSize;
    ctx2.font = `${fs}px ${obj.fontFamily}`;
    let raw = obj.text.replace(/\r/g, '');
    let lines;
    if (!raw.includes('\n')) {
        let w = ctx2.measureText(raw).width;
        while (w > maxW && fs > 6) {
            fs--;
            ctx2.font = `${fs}px ${obj.fontFamily}`;
            w = ctx2.measureText(raw).width;
        }
        lines = wrapText(ctx2, raw, maxW);
    } else {
        lines = [];
        raw.split('\n').forEach(line => {
            lines.push(...wrapText(ctx2, line, maxW));
        });
    }
    obj.fontSize = fs;
    obj.text = lines.join('\n');
    obj.boundingHeight = lines.length * fs * 1.2 + 2 * padding;
}
async function GetDesignBoardByIdForPublish() {
    var id = $('#hdnDesignBoardId').val(); // get GUID value
    if (id !== '') {
        try {
            var data = {
                DesignBoardId: id
            };
            ShowLoader();

            // Await the ajax call which returns a promise (jQuery 3+)
            const result = await $.ajax({
                url: baseURL + "Canvas/GetDesignBoardDetailsById",
                type: "POST",
                dataType: "json",
                data: data
            });

            if (result && Array.isArray(result.designBoardDetailsList) && result.designBoardDetailsList.length > 0) {
                // Create the jsonArray from the designBoardDetailsList items.
                // Each item.jsonFile is assumed to be a JSON string.
                jsonArray = result.designBoardDetailsList.map(item => {
                    let jsonObj;
                    try {
                        jsonObj = JSON.parse(item.jsonFile);
                    } catch (e) {
                        console.error("Error parsing jsonFile:", item.jsonFile, e);
                        jsonObj = {}; // fallback to an empty object if parsing fails
                    }
                    // Ensure default values for effect and direction
                    jsonObj.effect = item.effect || "delaylinear";
                    jsonObj.direction = item.direction || "left";
                    return jsonObj;
                });
                console.log("jsonArray:", jsonArray);
                loadJsonFile();
            }
            setTimeout(() => { GetDesignBoardByIdForDownload(''); }, 25000);
            // HideLoader();
        } catch (e) {
            console.log("catch", e);
            HideLoader();
        }
    }
    else {
        MessageShow('', 'Before Publish Must Save Board', 'error');
    }
}
function showDownloadPanel() {
    const main = document.getElementById('canvasMainContainerDownload');
    const container = document.getElementById('canvasContainerDownload');
    main.classList.remove('hidden');
    container.classList.remove('hidden');

    resizeCanvas_d();
}
function hideDownloadPanel() {
    const main = document.getElementById('canvasMainContainerDownload');
    const container = document.getElementById('canvasContainerDownload');

    // add the “hidden” class back
    main.classList.add('hidden');
    container.classList.add('hidden');
}
async function SaveDesignBoardInPublishTable() {
    var designBoardPublishId = $('#hdnDesignBoardPublishId').val() || '00000000-0000-0000-0000-000000000000'; // get GUID value
    try {
        var designBoardId = $('#hdnDesignBoardId').val(); // get GUID value
        if (designBoardId !== '') {

            var data = {
                DesignBoardId: designBoardId,
                DesignBoardPublishId: designBoardPublishId
            };


            const result = await $.ajax({
                url: baseURL + "Canvas/PublishDesignSlideBoard",
                type: "POST",
                dataType: "json",
                data: data,
                success: function (result) {
                    $("#hdnDesignBoardPublishId").val(result.result);
                    $("#hdnPublishBoardUniqueId").val(result.publishBoardUniqueId);
                    const companyUniqueId = getCompanyIdFromUrl();
                    const projectId = $("#hdnPublishBoardUniqueId").val();
                    window.open(`${window.location.origin}/S/${companyUniqueId}/${projectId}`, "_blank");

                    RedirectToHorizontalPageWithQueryString();
                },
                error: function (data) {
                    console.log("error");
                    console.log(data);
                }
            });
        }
    }

    catch (e) {
        console.log("catch", e);
    }
}
async function GetDesignBoardByIdForDownload(condition) {
    
    publishDownloadcondition = condition;
    var id = $('#hdnDesignBoardId').val(); // get GUID value
    if (id !== '') {
        try {
            var data = {
                DesignBoardId: id
            };

            ShowLoader();
            showDownloadPanel();
            //ShowLoader();
            // Await the ajax call which returns a promise (jQuery 3+)
            const result = await $.ajax({
                url: baseURL + "Canvas/GetDesignBoardDetailsById",
                type: "POST",
                dataType: "json",
                data: data
            });
            if (result) {
                $('#designboardLink').text(result.designBoardURL);
            }


            if (result && Array.isArray(result.designBoardDetailsList) && result.designBoardDetailsList.length > 0) {
                // Create the jsonArray from the designBoardDetailsList items.
                // Each item.jsonFile is assumed to be a JSON string.
                jsonArray = result.designBoardDetailsList.map(item => {
                    let jsonObj;
                    try {
                        jsonObj = JSON.parse(item.jsonFile);
                    } catch (e) {
                        console.error("Error parsing jsonFile:", item.jsonFile, e);
                        jsonObj = {}; // fallback to an empty object if parsing fails
                    }
                    // Ensure default values for effect and direction
                    jsonObj.effect = item.effect || "delaylinear";
                    jsonObj.direction = item.direction || "left";
                    jsonObj.outEffect = item.outEffect || "delaylinear";
                    jsonObj.outDirection = item.outDirection || "left";
                    return jsonObj;
                });
                console.log("jsonArray:", jsonArray);
                loadJsonFileForDownload();
            }
            //HideLoader();
        } catch (e) {
            console.log("catch", e);
            HideLoader();
        }
    }
    else {
        MessageShow('', 'Before Download Must Save Board', 'error');
    }
}
function loadJsonFile() {
    recorder.start();
    currentIndex = 0; // Reset index when button is clicked
    loadNextJson();   // Start loading the first JSON object
    setTimeout(() => {
        recorder.stop();
    }, 15000);
}
function loadJsonFileForDownload() {
    recorderForDownload.start();
    currentIndexForDownload = 0; // Reset index when button is clicked
    loadNextJsonForDownload();   // Start loading the first JSON object
}
async function showSlide(index) {
    const state = jsonArray[index];
    const inTime = parseFloat(selectedInSpeed) || 4;
    const stayTime = parseFloat(selectedStaySpeed) || 3;
    const outTime = parseFloat(selectedOutSpeed) || 4;
    const slideExecutionTime = inTime + stayTime + outTime;

    // 1) draw & animate this slide’s in→stay→out
    loadCanvasFromJsonForDownload(state, 'Common');
    await applyAnimationsforDownload(
        state.effect,
        state.direction,
        'applyAnimations',
        state
    );

    // 2) wait out its full duration (no stripe here yet)
    await new Promise(r => setTimeout(r, slideExecutionTime * 1000));
}
async function loadNextJsonForDownload() {
    const transitionType = $("#hdntransition").val() || 'slideLeft';
    const stripeDuration = 2;     // total stripe time in seconds

    // decide when (ms) into the stripe to swap bg
    const overlapColor = transitionType === 'slideRight' ? 1050 : 1250;

    if (!jsonArray.length) return;

    // Show the very first slide
    await showSlide(0);

    // Loop through each “next” slide
    for (let i = 0; i < jsonArray.length - 1; i++) {
        const nextIdx = i + 1;
        const { canvasBgColor: nextBgColor, canvasBgImage: nextBgImage } = jsonArray[nextIdx];

        // 1) kick off the stripe (non‑blocking)
        const stripePromise = runStripeTransition(transitionType, stripeDuration);

        // 2) mid‑stripe, swap background (image or color)
        setTimeout(() => {
            if (nextBgImage) {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => {
                    canvas._bgImg = img;
                    drawCanvasForDownload('Common');
                };
                img.onerror = () => {
                    canvas._bgImg = null;
                    $("#hdnBackgroundSpecificColorDownload").val(nextBgColor);
                    drawCanvasForDownload('Common');
                };
                img.src = nextBgImage;
            } else {
                canvas._bgImg = null;
                $("#hdnBackgroundSpecificColorDownload").val(nextBgColor);
                drawCanvasForDownload('Common');
            }
        }, overlapColor);

        // 3) wait for stripe to finish
        await stripePromise;

        // 4) now that stripe is done, load the next JSON fully
        await loadCanvasFromJsonForDownload(jsonArray[nextIdx], 'Common');

        // 5) redraw (in case loadCanvasFromJsonForDownload didn’t auto‑draw)
        if (nextBgImage) {
            drawCanvasForDownload('Common');
        } else {
            canvas._bgImg = null;
            $("#hdnBackgroundSpecificColorDownload").val(nextBgColor);
            drawCanvasForDownload('Common');
        }

        // 6) finally run the IN→STAY→OUT for that slide
        await showSlide(nextIdx);
    }
    
    // All done
    recorderForDownload.stop();
}
async function runStripeTransition(type = 'slideLeft', duration = 2) {

    //$('#hdnTransition1').val('#b42ce7');
    //$('#hdnTransition2').val('#611d7a');
    // grab your dynamic colors
    const dynamicColors = [
        $('#hdnTransition1').val(),   // for transition1
        $('#hdnTransition2').val(),   // for transition2
        // if you had a third stripe, add its hidden input here
    ];

    // collect your stripe <img>s
    const els = [
        document.getElementById('transition1'),
        document.getElementById('transition2'),
        // …etc
    ];

    // build tinted stripes, injecting dynamic color only when present
    const stripes = await Promise.all(
        els.map((el, idx) => {
            // prefer the hidden-input value if it's non-empty; otherwise use the existing data-color
            const dyn = dynamicColors[idx];
            const color = (typeof dyn === 'string' && dyn.trim() !== '')
                ? dyn.trim()
                : el.dataset.color;

            // keep the DOM in sync (in case you read it elsewhere)
            el.dataset.color = color;

            return buildTintedStripe(el, {
                color,
                width: parseInt(el.dataset.width, 10)
            });
        })
    );

    // position them off-canvas
    let currentX = canvasForDownload.width;
    const temps = stripes.map(s => {
        const t = {
            type: 'image',
            img: s.img,
            width: s.width,
            height: s.height,
            x: currentX,
            y: 0,
            scaleX: 1,
            scaleY: 1,
            opacity: 1
        };
        currentX += s.width;
        return t;
    });

    // add, render, animate, cleanup…
    temps.forEach(t => images.push(t));
    drawCanvasForDownload('Common');

    await Promise.all(
        temps.map((t, i) =>
            animateCanvasImage(t, type, duration, i * 0.10)
        )
    );

    temps.forEach(() => images.pop());
}

function applyAnimationsforPublish(animationType, direction, conditionValue) {
    drawCanvasPublish(conditionValue);
    animateTextForPublish(animationType, direction, conditionValue, parseInt($("#hdnlLoopControl").val()) || 1);
}
recorder.ondataavailable = (e) => chunks.push(e.data);
// Example usage inside your MediaRecorder's onstop callback
recorder.onstop = () => {
    const blob = new Blob(chunks, { type: 'video/mp4; codecs=vp9' });

    const existingFolderId = $(`#hdnDesignBoardDetailsIdSlide${activeSlide}`).val() || 'new';

    uploadVideo(blob, existingFolderId, currentIndex);
};
async function applyAnimationsforDownload(animationType, direction, conditionValue, state) {
    await drawCanvasForDownload(conditionValue);
    await animateTextForDownload(animationType, direction, conditionValue, parseInt($("#hdnlLoopControl").val()) || 1, state);

}
recorderForDownload.ondataavailable = (e) => chunksForDownload.push(e.data);
// Example usage inside your MediaRecorder's onstop callback
recorderForDownload.onstop = () => {
    const blob = new Blob(chunksForDownload, { type: 'video/webm' });
    const existingFolderId = $(`#hdnDesignBoardId`).val() || 'new';

    if (publishDownloadcondition !== 'download') {
        //// Call the upload function with the blob and folder ID (if any)
        uploadLargeVideo(blob, existingFolderId, currentIndex);
    }

    if (publishDownloadcondition === 'download') {

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'animation.webm'; // Download as .webm file
        a.click();
    }
    HideLoader();
};
function startVideoCapture() {
    // Ensure your canvas is set to 1920 x 1080 if you need HD quality.
    canvasForDownload.width = 1920;
    canvasForDownload.height = 1080;

    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'animation.webm'; // Download as .webm file
        a.click();
    };

    recorder.start();

    // Stop recording after 8 seconds (adjust as needed)
    setTimeout(() => {
        recorder.stop();
    }, 8000);
}
function getCompanyIdFromUrl() {
    return 1;
    //const segments = window.location.pathname.split('/').filter(segment => segment !== '');
    //// Assuming the last segment is the company ID.
    //return segments.length ? segments[segments.length - 1] : null;
}

function uploadLargeVideo(blob, existingFolderId = 'new', currentIndex = 1) {
    const formData = new FormData();
    formData.append('video', blob, 'animation.mp4');

    formData.append('folderId', existingFolderId);

    fetch(baseURL + "video/save-Large-video", {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            console.log('large Video saved successfully:', data);
            var dataVideoPath = {
                DesignBoardId: $(`#hdnDesignBoardId`).val(),
                VideoPath: data.filePath
            };

            $.ajax({
                url: baseURL + "Canvas/UpdateDesignBoardLargeVideoPath",
                type: "POST",
                dataType: "json",
                data: dataVideoPath,
                success: function (slideResult) {
                      SaveDesignBoardInPublishTable();
                    hideDownloadPanel();

                    
                    //const companyUniqueId = getCompanyIdFromUrl();
                    //const projectId = $("#hdnPublishBoardUniqueId").val();
                    //window.open(`${window.location.origin}/S/${companyUniqueId}/${projectId}`, "_blank");

                    //RedirectToHorizontalPageWithQueryString();
                    ////HideLoader();
                },
                error: function (data) {
                    console.log("error in saving Image " + activeSlide);
                    HideLoader();
                }


            })
        })
        .catch(error => {
            console.error('Error saving video:', error);
            HideLoader();
        });
}
function triggerAutorefresh() {
    var dataVideoAutorefresh = {
        CompanyUniqueId: 0
    };

    $.ajax({
        url: baseURL + "Canvas/TriggerAutorefresh",
        type: "POST",
        dataType: "json",
        data: dataVideoAutorefresh,
        success: function (autoTriggerResult) {
        },
        error: function (data) {
            console.log("error in Trigger Autorefresh " + activeSlide);
        }
    });
}

function uploadVideo(blob, existingFolderId = 'new', currentIndex = 1) {
    const formData = new FormData();
    formData.append('video', blob, 'animation.mp4');

    formData.append('folderId', existingFolderId);

    fetch(baseURL + "video/save-video", {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            console.log('Video saved successfully:', data);
            $(`#hdnDesignBoardDetailsIdSlideFilePath${activeSlide}`).val('');
            $(`#hdnDesignBoardDetailsIdSlideFilePath${activeSlide}`).val(data.filePath);
            if (videoSaveForOnetime === 1) {
                var dataVideoPath = {
                    DesignBoardDetailsId: $(`#hdnDesignBoardDetailsIdSlide1`).val(),
                    VideoPath: data.filePath
                };

                $.ajax({
                    url: baseURL + "Canvas/UpdateDesignDesignBoardDetailsVideoPath",
                    type: "POST",
                    dataType: "json",
                    data: dataVideoPath,
                    success: function (slideResult) {
                        videoSaveForOnetime++;
                        //startVideoCapture();
                    },
                    error: function (data) {
                        console.log("error in saving Image " + activeSlide);
                    }


                })
            }
        })
        .catch(error => {
            console.error('Error saving video:', error);
        });
}
function loadCanvasFromJsonForPublish(jsonData, condition) {
    // Clear the canvas first.
    ctxElement.clearRect(0, 0, canvas.width, canvas.height);

    let data;
    // If jsonData is a string, parse it; otherwise assume it's an object.
    if (typeof jsonData === "string") {
        try {
            data = JSON.parse(jsonData);
        } catch (e) {
            console.error("Error parsing canvas JSON:", e);
            drawCanvasPublish(condition);
            return;
        }
    } else {
        data = jsonData;
    }

    // Set the canvas background color.
    canvasBgColor = data.canvasBgColor || "#ffffff";
    $("#hdnBackgroundSpecificColor").val(canvasBgColor);
    canvas.style.backgroundColor = canvasBgColor;

    // Load the background image if provided; otherwise, clear any previous background image.
    if (data.canvasBgImage) {
        canvas.bgImage = new Image();
        canvas.bgImage.src = data.canvasBgImage;
    } else {
        canvas.bgImage = null;
    }

    // Process text objects.
    textObjects = data.text || [];

    // Process image objects.
    images = []; // Reset images array
    var imageLoadCount = 0;
    var totalImages = (data.images ? data.images.length : 0);

    // A helper function to check if all images are loaded.
    function checkAllImagesLoadedPublish() {
        var bgLoaded = true;
        if (canvas.bgImage) {
            bgLoaded = canvas.bgImage.complete;
        }
        if (imageLoadCount >= totalImages && bgLoaded) {
            // Once all images are loaded, call drawCanvasPublish.
            drawCanvasPublish(condition);
        }
    }

    // Process each image in the JSON.
    if (data.images && data.images.length) {
        data.images.forEach(function (imgObj) {
            var newImgObj = Object.assign({}, imgObj);
            var imgElement = new Image();
            if (imgObj.src.trim().charAt(0) === "<") {
                var blob = new Blob([imgObj.src], { type: "image/svg+xml" });
                imgElement.src = URL.createObjectURL(blob);
            } else {
                imgElement.src = imgObj.src;
            }
            newImgObj.img = imgElement;

            imgElement.onload = function () {
                imageLoadCount++;
                checkAllImagesLoadedPublish();
            };
            imgElement.onerror = function () {
                console.error("Error loading image", imgObj.src);
                imageLoadCount++;
                checkAllImagesLoadedPublish();
            };

            images.push(newImgObj);
        });
    } else {
        // No images in JSON.
        checkAllImagesLoadedPublish();
    }

    // Handle the background image load.
    if (canvas.bgImage) {
        canvas.bgImage.onload = function () {
            checkAllImagesLoadedPublish();
        };
        canvas.bgImage.onerror = function () {
            console.error("Error loading canvas background image", data.canvasBgImage);
            canvas.bgImage = null;
            checkAllImagesLoadedPublish();
        };
    } else {
        checkAllImagesLoadedPublish();
    }
}
function buildTintedStripe(imgEl, opts = {}) {
    const width = parseInt(opts.width, 10);
    const color = opts.color;

    return new Promise(resolve => {
        const draw = () => {
            const off = document.createElement('canvas');
            off.width = width;
            off.height = canvasForDownload.height;
            const octx = off.getContext('2d');

            // draw the already‐loaded <img>
            octx.drawImage(imgEl, 0, 0, width, off.height);
            octx.globalCompositeOperation = 'source-in';
            octx.fillStyle = color;
            octx.fillRect(0, 0, width, off.height);

            const tinted = new Image();
            tinted.onload = () => resolve({ img: tinted, width, height: off.height });
            tinted.src = off.toDataURL();
        };

        if (imgEl.complete && imgEl.naturalWidth) {
            draw();
        } else {
            imgEl.onload = draw;
        }
    });
}
function animateCanvasImage(obj, type, duration = 2, delay = 0) {
    return new Promise(resolve => {
        const dispW = obj.width * (obj.scaleX || 1);
        const dispH = obj.height * (obj.scaleY || 1);
        let toVars = { duration, ease: 'power1.inOut', delay };

        switch (type) {
            case 'slideLeft':
                toVars.x = -dispW - 5;
                break;
            case 'slideRight':
                // start just off the left edge
                obj.x = -dispW - 5;
                toVars.x = canvasForDownload.width + 5;
                break;

            case 'slideUp':
                // start just below the bottom edge
                obj.y = canvasForDownload.height + 5;
                toVars.y = -dispH - 5;
                break;

            case 'slideDown':
                // start just above the top edge
                obj.y = -dispH - 5;
                toVars.y = canvasForDownload.height + 5;
                break;

            case 'fadeIn':
                obj.opacity = 0;
                toVars.opacity = obj.opacity || 1;
                break;

            case 'fadeOut':
                toVars.opacity = 0;
                break;

            case 'zoomIn':
                obj.scaleX = obj.scaleY = 0.5;
                toVars.scaleX = toVars.scaleY = 1;
                break;

            case 'zoomOut':
                obj.scaleX = obj.scaleY = 1.5;
                toVars.scaleX = toVars.scaleY = 1;
                break;

            case 'dissolve':
                toVars.opacity = 0;
                break;
            default:
                console.warn(`Unknown canvas animation type: ${type}`);
        }

        gsap.to(obj, {
            ...toVars,
            onUpdate: () => drawCanvasForDownload(currentCondition),
            onComplete: resolve
        });
    });
}

/**
* Animate a DOM image or a full‐canvas color overlay inside the canvas.
* @param {HTMLImageElement|string} imgOrColor – <img> element or CSS color code (e.g. '#fff')
* @param {string} type – slideLeft|slideRight|slideUp|slideDown|fadeIn|fadeOut|zoomIn|zoomOut|dissolve
* @param {number} duration – seconds
* @returns {Promise}
*/
/**
 * Animate a canvas rectangle item by tweening its props.
 * @param {Object} shape – rectangle item with x,y,width,height,fillColor,opacity,scaleX/scaleY
 * @param {string} type
 * @param {number} duration
 * @returns {Promise}
 */
/**
 * Animate a DOM element in the page.
 * @param {string} selector  – CSS selector for your <img> (or any block element)
 * @param {string} type      – 'slideLeft'|'slideRight'|'slideUp'|'slideDown'|
 *                             'zoomIn'|'zoomOut'|'fadeIn'|'fadeOut'
 * @param {number} duration  – animation length in seconds (default: 3)
 */
function loadCanvasFromJsonForDownload(jsonData, condition = 'Common') {
    // await ensureFontsInitialized();
    // Clear download canvas
    ctxElementForDownload.clearRect(0, 0, canvasForDownload.width, canvasForDownload.height);
    currentConditionForDownload = condition;

    // No data: wait for fonts then draw
    if (!jsonData) {
        document.fonts.ready.then(() => drawCanvasForDownload(condition));
        return;
    }

    // Parse JSON
    const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
    slideDataForDownload = data;

    // Compute actual display size (CSS pixels)
    const rect = canvasForDownload.getBoundingClientRect();
    const screenW = rect.width;
    const screenH = rect.height;

    // Build text objects, adjust for manual line breaks and clamp at bottom
    const textObjectsForDownload = (data.text || []).map(obj => {
        const bw = obj.boundingWidth * screenW;
        const bh = obj.boundingHeight * screenH;
        const fontPx = obj.fontSize;
        const lineH = fontPx * 1.2;

        // Manual split
        const lines = obj.text.split("\n");
        const hasManual = lines.length > 1;

        // Compute needed height
        const neededH = hasManual
            ? (lines.length * lineH + 2 * padding)
            : bh;
        const finalH = Math.max(bh, neededH);
        const finalW = bw;

        // Initial Y position
        let ty = obj.y * screenH;
        // Clamp to bottom if overflowing
        if (ty + finalH + padding > screenH) {
            ty = screenH - finalH - padding;
        }

        return {
            text: obj.text,
            x: obj.x * screenW,
            y: ty,
            boundingWidth: finalW,
            boundingHeight: finalH,
            fontSize: fontPx,
            fontFamily: obj.fontFamily,
            textColor: obj.textColor,
            textAlign: obj.textAlign,
            opacity: obj.opacity || 1,
            selected: false,
            _hasManualBreaks: hasManual,
            // ← RIGHT HERE: hydrate or default lineSpacing
            lineSpacing: (typeof obj.lineSpacing === 'number')
                ? obj.lineSpacing
                : obj.fontSize * 1.2,
            noAnim: obj.noAnim,
            groupId: obj.groupId,
            rotation: obj.rotation,
            isBold: obj.isBold || false,
            isItalic: obj.isItalic || false,
            type: obj.type || 'text',
            zIndex: obj.zIndex || getNextZIndex()
        };
    });

    // Build images
    const imagesForDownload = (data.images || []).map(o => {
        const obj = { ...o };
        obj.x = o.x * screenW;
        obj.y = o.y * screenH;
        obj.width = o.width * screenW;
        obj.height = o.height * screenH;
        // Default rotation to 0 if not provided
        obj.rotation = (typeof o.rotation === 'number') ? o.rotation : 0;
        obj.selected = false;
        obj.img = new Image();
        obj.img.crossOrigin = 'anonymous';
        obj.img.onload = () => drawCanvasForDownload(condition);
        obj.img.onerror = () => drawCanvasForDownload(condition);
        obj.img.src = o.src;
        obj.type = o.type || 'image';
        obj.zIndex = o.zIndex || getNextZIndex();
        return obj;
    });

    // Mirror into globals and set background
    textObjects = textObjectsForDownload;
    images = imagesForDownload;
    const bg = data.canvasBgColor || '#ffffff';
    document.getElementById('hdnBackgroundSpecificColorDownload').value = bg;
    canvasForDownload.style.backgroundColor = bg;

    // Preload background image if any
    if (data.canvasBgImage) {
        canvasForDownload._bgImg = new Image();
        canvasForDownload._bgImg.crossOrigin = 'anonymous';
        canvasForDownload._bgImg.onload = () => drawCanvasForDownload(condition);
        canvasForDownload._bgImg.onerror = () => drawCanvasForDownload(condition);
        canvasForDownload._bgImg.src = data.canvasBgImage;
    } else {
        canvasForDownload._bgImg = null;
    }


    // Load fonts, auto-fit (skip manual breaks), then draw
    const fontPromises = textObjects.map(o =>
        document.fonts.load(`${o.fontSize}px ${o.fontFamily}`)
    );
    Promise.all(fontPromises).finally(() => {
        textObjects.forEach(obj => {
            //if (!obj._hasManualBreaks) {
            //    autoFitText(obj, padding);
            //}
            // autoFitTextNewDownload(obj, padding);
            const fitResult = autoFitTextNewDownload(obj, padding);
            //obj.fontSize = fitResult.fontSize;
            obj._wrappedLines = fitResult.wrappedLines;
            obj.boundingWidth = fitResult.boundingWidth;
            obj.boundingHeight = fitResult.boundingHeight;
        });
        drawCanvasForDownload(condition);
    });
}


function autoFitTextNewDownload(obj, padding = 5) {
    const ctx2 = canvasForDownload.getContext('2d');
    const maxW = obj.boundingWidth - 2 * padding;
    const maxH = obj.boundingHeight - 2 * padding;

    // Your designer’s raw text, split on real newlines:
    const rawLines = obj.text.replace(/\r/g, '').split('\n');

    // Given font-size fs, wrap every rawLine to fit maxW, return the full array of wrapped lines:
    function wrapAllLines(fs) {
        ctx2.font = `${fs}px ${obj.fontFamily}`;
        return rawLines.flatMap(line => wrapText(ctx2, line, maxW));
    }

    // Given fs, compute block dims for the wrapped lines at that size:
    function measure(fs) {
        const lines = wrapAllLines(fs);
        const widths = lines.map(l => ctx2.measureText(l).width);
        const blockW = Math.max(...widths, 0);
        const lineH = fs * 1.2;
        const blockH = lines.length * lineH;
        return { blockW, blockH, lines };
    }

    // 1) start at designer fontSize
    let fs = Math.floor(obj.fontSize);
    let { blockW, blockH, lines } = measure(fs);

    // 2) shrink while too big
    while ((blockW > maxW || blockH > maxH) && fs > 1) {
        fs--;
        ({ blockW, blockH, lines } = measure(fs));
    }

    // 3) grow while it still fits
    while (true) {
        const next = measure(fs + 1);
        if (next.blockW <= maxW && next.blockH <= maxH) {
            fs++;
            blockW = next.blockW;
            blockH = next.blockH;
            lines = next.lines;
        } else {
            break;
        }
    }

   

    // Return new values instead of mutating the object
    return {
        fontSize: fs,
        wrappedLines: lines,
        boundingWidth: blockW + 2 * padding,
        boundingHeight: blockH + 2 * padding
    };
}
// load all unresolved images before drawing
async function preloadImages(items) {
    const loads = items
        .filter(item => item.type === 'image' && !item.img)
        .map(item => {
            return new Promise(resolve => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => { item.img = img; resolve(); };
                img.onerror = () => { console.warn('Image load failed:', item.src || item.svgData); resolve(); };
                img.src = item.svgData || item.src;
            });
        });
    await Promise.all(loads);
}
function setCanvasTransform(ctx, dpr, scaleX, scaleY) {
    ctx.resetTransform();
    ctx.scale(dpr, dpr);
    ctx.scale(scaleX, scaleY);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
}

function drawHandles(ctx, objects, getBounds, handleColor) {
    objects.forEach(obj => {
        if (!obj.selected) return;
        const { xPx, yPx, wPx, hPx } = getBounds(obj);
        // stroke around
        ctx.strokeStyle = handleColor.stroke;
        ctx.lineWidth = 2;
        ctx.strokeRect(xPx, yPx, wPx, hPx);
        // resize handles
        ctx.fillStyle = handleColor.fill;
        const half = handleSize / 2;
        getResizePoints(obj).forEach(pt => {
            ctx.fillRect(pt.x * scaleX - half, pt.y * scaleY - half, handleSize, handleSize);
        });
    });
}
function invertDirection(direction) {
    if (direction === "left") return "right";
    if (direction === "right") return "left";
    if (direction === "top") return "bottom";
    if (direction === "bottom") return "top";
    return direction;
}
function applyClipMask(ctx, item) {
    if (typeof item.clip !== "number") return false;

    if (item.clip >= 1) {
        return true;  // Fully masked – skip drawing
    }

    if (item.clip > 0 && item.clip < 1) {
        const direction = item.clipDirection || "top";

        const isImage = item.type === 'image';
        const width = isImage ? item.width : item.boundingWidth;
        const height = isImage ? item.height : item.boundingHeight;
        const x = item.x;
        const y = item.y;

        ctx.beginPath();

        if (direction === "top") {
            const visibleHeight = height * (1 - item.clip);
            ctx.rect(x, y, width, visibleHeight);

        } else if (direction === "bottom") {
            const visibleHeight = height * (1 - item.clip);
            ctx.rect(x, y + height - visibleHeight, width, visibleHeight);

        } else if (direction === "left") {
            const visibleWidth = width * (1 - item.clip);
            ctx.rect(x, y, visibleWidth, height);

        } else if (direction === "right") {
            const visibleWidth = width * (1 - item.clip);
            ctx.rect(x + width - visibleWidth, y, visibleWidth, height);
        }

        ctx.clip();
    }

    return false;
}
async function drawCanvasForDownload(condition) {

    initializeLayers();
    const dpr = window.devicePixelRatio || 1;
    const wPx = canvasForDownload.width;
    const hPx = canvasForDownload.height;
    const designW = wPx / dpr / scaleX;
    const designH = hPx / dpr / scaleY;

    // ensure images are loaded
    await preloadImages(allItems);

    // 1) set transform & clear
    setCanvasTransform(ctxElementForDownload, dpr, scaleX, scaleY);
    ctxElementForDownload.clearRect(0, 0, designW, designH);

    // 2) background color or image
    const bgColor = document.getElementById('hdnBackgroundSpecificColorDownload').value.trim();
    if (bgColor) {
        ctxElementForDownload.fillStyle = bgColor;
        ctxElementForDownload.fillRect(0, 0, designW, designH);
    }
    if (canvas._bgImg) {
        ctxElementForDownload.drawImage(canvas._bgImg, 0, 0, designW, designH);
    }

    // 3) draw items
    allItems.forEach(item => {
        ctxElementForDownload.save();
        ctxElementForDownload.globalAlpha = item.opacity || 1;
        if (item.scaleX === 0 && item.scaleY === 0) {
            ctxElementForDownload.restore();
            return;
        }

        if (item.clipDirection != undefined) {
            if (applyClipMask(ctxElementForDownload, item)) {
                ctxElementForDownload.restore();
                return;
            }
        }

        // **1) if noAnim, draw immediately and skip the rest**
        if (item.noAnim) {
            if (item.type === 'image') {
                // same as your image‑draw code
                const x = item.finalX, y = item.finalY;
                const w = item.width, h = item.height;
                const rot = (item.rotation || 0) * Math.PI / 180;
                ctxElementForDownload.translate(x + w / 2, y + h / 2);
                ctxElementForDownload.rotate(rot);
                ctxElementForDownload.scale(item.scaleX || 1, item.scaleY || 1);
                try {
                    ctxElementForDownload.drawImage(item.img, -w / 2, -h / 2, w, h);
                } catch (e) {
                    console.warn('drawImage error', e);
                }
            }
            else if (item.type === 'text') {
                // same as your text‑draw code, but unconditionally
                const parts = [];
                if (item.isItalic) parts.push('italic');
                if (item.isBold) parts.push('bold');
                parts.push(`${item.fontSize}px`, item.fontFamily);
                ctxElementForDownload.font = parts.join(' ');
                ctxElementForDownload.fillStyle = item.textColor;
                ctxElementForDownload.textBaseline = 'top';

                const raw = item.text;
                let lines = raw.includes('\n')
                    ? raw.split('\n')
                    : wrapText(ctxElementForDownload, raw, item.boundingWidth - 2 * padding);
                const fs = item.fontSize;
                const lineH = item.lineSpacing * fs;

                // adjust for rotation & padding exactly as you do below
                const maxW = Math.max(...lines.map(l => ctxElementForDownload.measureText(l).width));
                const boxW = Math.ceil(maxW + 2 * padding);
                const boxH = Math.ceil(lines.length * lineH + 2 * padding);
                item.boundingWidth = boxW;
                item.boundingHeight = boxH;

                const cx = item.x + boxW / 2;
                const cy = item.y + boxH / 2;
                const rot = (item.rotation || 0) * Math.PI / 180;
                ctxElementForDownload.translate(cx, cy);
                ctxElementForDownload.rotate(rot);
                ctxElementForDownload.translate(-cx, -cy);

                lines.slice(0, Math.floor((boxH - 2 * padding) / lineH))
                    .forEach((line, i) => {
                        let offsetX = item.x + padding;
                        const lw = ctxElementForDownload.measureText(line).width;
                        if (item.textAlign === 'center') offsetX = item.x + (boxW - lw) / 2;
                        if (item.textAlign === 'right') offsetX = item.x + boxW - lw - padding;
                        ctxElementForDownload.fillText(line, offsetX, item.y + padding + i * lineH);
                    });
            }

            ctxElementForDownload.restore();
            return;  // skip the rest of the logic for this item
        }
        if (item.type === 'image') {
            const x = item.x, y = item.y;
            const w = item.width, h = item.height;
            const rot = (item.rotation || 0) * Math.PI / 180;
            ctxElementForDownload.translate(x + w / 2, y + h / 2);
            ctxElementForDownload.rotate(rot);
            ctxElementForDownload.scale(item.scaleX || 1, item.scaleY || 1);
            try {
                ctxElementForDownload.drawImage(item.img, -w / 2, -h / 2, w, h);
            } catch (e) {
                console.warn('drawImage error', e);
            }
        }
        else if (item.type === 'text' && ['Common', 'ChangeStyle', 'applyAnimations'].includes(condition)) {
            // font setup
            const parts = [];
            if (item.isItalic) parts.push('italic');
            if (item.isBold) parts.push('bold');
            parts.push(`${item.fontSize}px`, item.fontFamily);
            ctxElementForDownload.font = parts.join(' ');
            ctxElementForDownload.fillStyle = item.textColor;
            ctxElementForDownload.textBaseline = 'top';
            const scaleX = item.scaleX || 1;
            const scaleY = item.scaleY || 1;

            const raw = item.text;
            let lines = raw.includes('\n') ? raw.split('\n') : wrapText(ctxElementForDownload, raw, item.boundingWidth * padding);
            const fs = item.fontSize;
            const lineH = item.lineSpacing * fs;
            // compute box dims
            const maxW = Math.max(...lines.map(l => ctxElementForDownload.measureText(l).width));
            const boxW = Math.ceil(maxW + 2 * padding);
            const boxH = Math.ceil(lines.length * lineH + 2 * padding);
            item.boundingWidth = boxW;
            item.boundingHeight = boxH;

            const cx = item.x + boxW / 2;
            const cy = item.y + boxH / 2;
            const rot = (item.rotation || 0) * Math.PI / 180;
            ctxElementForDownload.translate(cx, cy);
            ctxElementForDownload.rotate(rot);
            ctxElementForDownload.scale(scaleX, scaleY);  //  Apply scaling here
            ctxElementForDownload.translate(-cx, -cy);

            // draw text lines
            lines.slice(0, Math.floor((boxH - 2 * padding) / lineH)).forEach((line, i) => {
                let offsetX = item.x + padding;
                const lw = ctxElementForDownload.measureText(line).width;
                if (item.textAlign === 'center') offsetX = item.x + (boxW - lw) / 2;
                if (item.textAlign === 'right') offsetX = item.x + boxW - lw - padding;
                ctxElementForDownload.fillText(line, offsetX, item.y + padding + i * lineH);
            });

        }

        ctxElementForDownload.restore();
    });

    // 4) draw selection handles in pixel-space
    ctxElementForDownload.globalAlpha = 1;
    ctxElementForDownload.save();
    ctxElementForDownload.resetTransform();
    ctxElementForDownload.scale(dpr, dpr);

    drawHandles(ctxElementForDownload, images,
        img => ({
            xPx: img.x * scaleX, yPx: img.y * scaleY,
            wPx: img.width * (img.scaleX || 1) * scaleX,
            hPx: img.height * (img.scaleY || 1) * scaleX
        }),
        { stroke: 'blue', fill: 'red' }
    );

    drawHandles(ctxElementForDownload, textObjects,
        txt => ({
            xPx: txt.x * scaleX, yPx: txt.y * scaleY,
            wPx: txt.boundingWidth * scaleX, hPx: txt.boundingHeight * scaleY
        }),
        { stroke: '#00f', fill: '#FF7F50' }
    );

    ctxElementForDownload.restore();
}
function drawCanvasPublish(condition) {
    ctxElement.clearRect(0, 0, canvas.width, canvas.height); // Clear entire canvas
    const bgColor = $("#hdnBackgroundSpecificColor").val();
    if (bgColor && bgColor.trim() !== "") {
        ctxElement.fillStyle = bgColor;
        ctxElement.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw background image if available.
    if (canvas.bgImage) {
        ctxElement.drawImage(canvas.bgImage, 0, 0, canvas.width, canvas.height);
    }

    // --- Draw multiple images from the images array ---
    if (images && images.length) {
        images.forEach(imgObj => {
            ctxElement.save();
            ctxElement.globalAlpha = imgObj.opacity || 1;
            const scaleX = imgObj.scaleX || 1;
            const scaleY = imgObj.scaleY || 1;
            ctxElement.translate(imgObj.x, imgObj.y);
            ctxElement.scale(scaleX, scaleY);
            // Draw the image at (0,0) because translation has already been applied.
            ctxElement.drawImage(imgObj.img, 0, 0, imgObj.width, imgObj.height);
            ctxElement.restore();

            // If this image is selected, draw a border and four resize handles.
            if (imgObj.selected) {
                ctxElement.save();
                ctxElement.strokeStyle = "blue";
                ctxElement.lineWidth = 2;
                const dispW = imgObj.width * scaleX;
                const dispH = imgObj.height * scaleY;
                ctxElement.strokeRect(imgObj.x, imgObj.y, dispW, dispH);
                // Draw handles at the four corners
                const handles = getImageResizeHandles(imgObj); // Make sure this function uses your dynamic dimensions
                ctxElement.fillStyle = "red";
                handles.forEach(handle => {
                    ctxElement.fillRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
                });
                ctxElement.restore();
            }
        });
    }

    ctxElement.save();
    ctxElement.globalAlpha = textPosition.opacity || 1; // Apply text opacity

    if (condition === 'Common' || condition === 'ChangeStyle') {
        textObjects.forEach(obj => {
            ctxElement.save();
            // If selected, draw the bounding box and handles.
            if (obj.selected) {
                // Constrain the box if it goes beyond canvas boundaries.
                if (obj.x < 0) obj.x = 0;
                if (obj.x + obj.boundingWidth > canvas.width) {
                    obj.boundingWidth = canvas.width - obj.x;
                }
                const boxX = obj.x - padding;
                const boxY = obj.y - padding;
                const boxWidth = obj.boundingWidth + 2 * padding;
                const boxHeight = obj.boundingHeight + 2 * padding;
                //drawRoundedRect(ctxElement, boxX, boxY, boxWidth, boxHeight, 5);

                // Draw eight handles: four corners and four midpoints.
                const handles = [
                    { x: boxX, y: boxY }, // top-left
                    { x: boxX + boxWidth / 2, y: boxY }, // top-middle
                    { x: boxX + boxWidth, y: boxY }, // top-right
                    { x: boxX + boxWidth, y: boxY + boxHeight / 2 }, // right-middle
                    { x: boxX + boxWidth, y: boxY + boxHeight }, // bottom-right
                    { x: boxX + boxWidth / 2, y: boxY + boxHeight }, // bottom-middle
                    { x: boxX, y: boxY + boxHeight }, // bottom-left
                    { x: boxX, y: boxY + boxHeight / 2 }  // left-middle
                ];
                ctxElement.fillStyle = "#FF7F50";
                handles.forEach(handle => {
                    ctxElement.fillRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
                });
            }

            // Set text properties.
            ctxElement.font = `${obj.fontSize}px ${obj.fontFamily}`;
            ctxElement.fillStyle = obj.textColor;
            ctxElement.textBaseline = "top";

            // Determine the maximum text width for wrapping.
            const maxTextWidth = obj.boundingWidth - 2 * padding;
            let lines;
            // If the text contains newline characters, use them; otherwise, wrap.
            if (obj.text.indexOf("\n") !== -1) {
                lines = obj.text.split("\n");
            } else {
                lines = wrapText(ctxElement, obj.text, maxTextWidth);
            }
            const lineHeight = obj.fontSize * 1.2;
            const availableHeight = obj.boundingHeight - 2 * padding;
            const maxLines = Math.floor(availableHeight / lineHeight);
            const startY = obj.y + padding;

            // Draw each line with the correct horizontal offset based on alignment.
            for (let i = 0; i < Math.min(lines.length, maxLines); i++) {
                const line = lines[i];
                const lineWidth = ctxElement.measureText(line).width;
                let offsetX;
                if (obj.textAlign === "center") {
                    offsetX = obj.x + (obj.boundingWidth - lineWidth) / 2;
                } else if (obj.textAlign === "right") {
                    offsetX = obj.x + obj.boundingWidth - lineWidth - padding;
                } else { // left alignment
                    offsetX = obj.x + padding;
                }
                ctxElement.fillText(line, offsetX, startY + i * lineHeight);
            }
            ctxElement.restore();
        });
    }

    if (condition === 'applyAnimations') {
        textObjects.forEach(obj => {
            ctxElement.save();
            ctxElement.font = `${obj.fontSize}px ${obj.fontFamily}`;
            ctxElement.fillStyle = obj.textColor;
            ctxElement.textBaseline = "top";

            const maxTextWidth = obj.boundingWidth - 2 * padding;
            let lines;
            if (obj.text.indexOf("\n") !== -1) {
                lines = obj.text.split("\n");
            } else {
                lines = wrapText(ctxElement, obj.text, maxTextWidth);
            }
            const lineHeight = obj.fontSize * 1.2;
            const availableHeight = obj.boundingHeight - 2 * padding;
            const maxLines = Math.floor(availableHeight / lineHeight);
            const startY = obj.y + padding;

            for (let i = 0; i < Math.min(lines.length, maxLines); i++) {
                const line = lines[i];
                const lineWidth = ctxElement.measureText(line).width;
                let offsetX;
                if (obj.textAlign === "center") {
                    offsetX = obj.x + (obj.boundingWidth - lineWidth) / 2;
                } else if (obj.textAlign === "right") {
                    offsetX = obj.x + obj.boundingWidth - lineWidth - padding;
                } else {
                    offsetX = obj.x + padding;
                }
                ctxElement.fillText(line, offsetX, startY + i * lineHeight);
            }
            ctxElement.restore();
        });
    }

    ctxElement.globalAlpha = 1;
    ctxElement.restore();
}
function animateTextForPublish(animationType, direction, condition, loopCount) {

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
            onUpdate: () => drawCanvasPublish(condition)
        });

        // --- Text IN ---
        tlText.to(textObjects, {
            x: (i, target) => target.finalX,
            y: (i, target) => target.finalY,
            duration: individualTweenText,
            ease: "power1.in",
            stagger: individualTweenText * .70,
            onUpdate: () => drawCanvasPublish(condition)
        });



        // --- Image IN ---
        images.forEach((imgObj) => {
            tlText.to(imgObj, {
                x: (i, target) => target.finalX,
                y: (i, target) => target.finalY,
                duration: individualTweenText,
                ease: "power1.in",
                stagger: individualTweenText * .70,
                onUpdate: () => drawCanvasPublish(condition)
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
                onUpdate: () => drawCanvasPublish(condition)
            });
        });

        // --- Text OUT (After Image) ---
        tlText.to([...textObjects].reverse(), {
            x: (i, target) => target.exitX,
            y: (i, target) => target.exitY,
            duration: individualTweenOutText,
            ease: "power1.out",
            stagger: individualTweenOutText * .70,
            onUpdate: () => drawCanvasPublish(condition)
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

            drawCanvasPublish(condition); // Force redraw
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
                        drawCanvasPublish(condition);
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
                    onUpdate: () => drawCanvasPublish(condition)
                });
            }
            else if (animationType === "bounce" || animationType === "blur") {

                ////This section is for in out and stay
                let tl = gsap.timeline({
                    repeat: loopCount - 1,
                    onUpdate: function () {
                        drawCanvasPublish(condition);
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
                    onUpdate: () => drawCanvasPublish(condition),


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
                    drawCanvasPublish(condition);
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
                    onUpdate: () => drawCanvasPublish(condition)
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
                    onUpdate: () => drawCanvasPublish(condition)
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
                        onUpdate: () => drawCanvasPublish(condition)
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
                    onUpdate: () => drawCanvasPublish(condition)
                });
                tl.set(imgObj, {
                    x: endX,
                    y: endY,
                    scaleX: originalScaleX,
                    scaleY: originalScaleY,
                    duration: 0,
                    ease: "none",
                    onUpdate: () => drawCanvasPublish(condition)
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
                            drawCanvasPublish(condition);
                        },
                        onComplete: () => {
                            ctx.filter = "none";
                            drawCanvasPublish(condition);
                        }
                    }
                );
                tl.to(imgObj, {
                    duration: stayTime,
                    ease: "none",
                    onUpdate: () => {
                        ctx.filter = "none";
                        drawCanvasPublish(condition);
                    }
                });
                tl.to(imgObj, {
                    x: exitX,
                    y: exitY,
                    duration: outTime,
                    ease: "power2.in",
                    onUpdate: () => {
                        ctx.filter = "none";
                        drawCanvasPublish(condition);
                    }
                });
                tl.set(imgObj, {
                    x: endX,
                    y: endY,
                    duration: 0,
                    ease: "none",
                    onUpdate: () => {
                        ctx.filter = "none";
                        drawCanvasPublish(condition);
                    }
                });
            }
        });
    }
}

async function animateTextForDownload(animationType, direction, condition, loopCount, state) {

    selectedInSpeed = parseInt(document.getElementById('lblSpeed').textContent);
    selectedOutSpeed = parseInt(document.getElementById('lblOutSpeed').textContent);
    selectedStaySpeed = parseInt(document.getElementById('lblSeconds').textContent);
    // Global timing settings (from your selected speeds).
    const inTime = parseFloat(selectedInSpeed) || 4; // seconds
    const outTime = parseFloat(selectedOutSpeed) || 4;
    const stayTime = parseFloat(selectedStaySpeed) || 3;
    const Outdirection = state.outDirection || 'right'
    const offscreenMargin = 80;
    const margin = 40;
    // ----- TEXT ANIMATION SECTION -----

    textObjects.forEach((obj) => {
        obj.finalX = obj.x;
        obj.finalY = obj.y;

        // 1) ENTRY (based on `direction`)
        switch (direction) {
            case "top":
                obj.x = obj.finalX;
                obj.y = -(obj.boundingHeight + 5);
                break;
            case "bottom":
                obj.x = obj.finalX;
                obj.y = canvasForDownload.height + 5;
                break;
            case "left":
                obj.x = -canvasForDownload.width / 2;
                obj.y = obj.finalY;
                break;
            case "right":
                obj.x = canvasForDownload.width + 5;
                obj.y = obj.finalY;
                break;
            default:
                // fallback: slide in from right
                obj.x = canvasForDownload.width + 5;
                obj.y = obj.finalY;
        }

        // 2) EXIT (based on `Outdirection`)
        switch (Outdirection) {
            case "top":
                obj.exitX = obj.finalX;
                obj.exitY = canvasForDownload.height + 5;

                break;
            case "bottom":
                obj.exitX = obj.finalX;
                obj.exitY = -(obj.boundingHeight + 25);
                break;
            case "left":
                obj.exitX = canvasForDownload.width + margin;;
                obj.exitY = obj.finalY;
                break;
            case "right":
                obj.exitX = canvasForDownload.width + 5;
                obj.exitY = obj.finalY;
                break;
            default:
                // fallback: slide out to right
                obj.exitX = canvasForDownload.width + 5;
                obj.exitY = obj.finalY;
        }
    });






    return new Promise(resolve => {
        // copy your existing animateTextForDownload code,
        // but in the GSAP timeline's onComplete call resolve()
        const tl = gsap.timeline({
            repeat: loopCount - 1,
            onUpdate: () => drawCanvasForDownload(condition),
            onComplete: resolve
        });


        // ----- IMAGE ANIMATION SECTION -----
        images.forEach((imgObj) => {
            imgObj.finalX = imgObj.x;
            imgObj.finalY = imgObj.y;

            // Take into account any scaling:
            const dispWidth = imgObj.width * (imgObj.scaleX || 1);
            const dispHeight = imgObj.height * (imgObj.scaleY || 1);

            // 1) ENTRY (based on `direction`)
            switch (direction) {
                case "top":
                    imgObj.x = imgObj.finalX;
                    imgObj.y = -(dispHeight + 5);
                    break;
                case "bottom":
                    imgObj.x = imgObj.finalX;
                    imgObj.y = canvasForDownload.height + 5;
                    break;
                case "left":
                    imgObj.x = -(dispWidth + 5);
                    imgObj.y = imgObj.finalY;
                    break;
                case "right":
                    imgObj.x = canvasForDownload.width + 5;
                    imgObj.y = imgObj.finalY;
                    break;
                default:
                    // fallback: slide in from right
                    imgObj.x = canvasForDownload.width + 5;
                    imgObj.y = imgObj.finalY;
            }

            // 2) EXIT (based on `Outdirection`)
            switch (Outdirection) {
                case "top":
                    imgObj.exitX = imgObj.finalX;
                    imgObj.exitY = canvasForDownload.height + 5;

                    break;
                case "bottom":
                    imgObj.exitX = imgObj.finalX;
                    imgObj.exitY = -(dispHeight + 55);
                    break;
                case "left":
                    imgObj.exitX = -(dispWidth + 55);
                    imgObj.exitY = imgObj.finalY;
                    break;
                case "right":
                    imgObj.exitX = canvasForDownload.width + 5;
                    imgObj.exitY = imgObj.finalY;
                    break;
                default:
                    // fallback: slide out to right
                    imgObj.exitX = canvasForDownload.width + 5;
                    imgObj.exitY = imgObj.finalY;
            }
        });

        if (animationType === "delaylinear") {
            // 1) Gather animatable items
            const allItems = [
                ...images.filter(i => !i.noAnim),
                ...textObjects.filter(t => !t.noAnim)
            ];

            // 2) Bucket into “units” by groupId
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

            // 3) Timings
            const tweenIn = 0.15 * inTime;
            const tweenOut = 0.15 * outTime;

            // 4) Build timeline
            const tlText = gsap.timeline({
                repeat: loopCount - 1,
                repeatDelay: 0,
                onRepeat: () => {
                    images.forEach(img => { img.x = img.startX; img.y = img.startY; });
                    textObjects.forEach(txt => { txt.x = txt.startX; txt.y = txt.startY; });
                    drawCanvasForDownload(condition);
                },
                onUpdate: () => drawCanvasForDownload(condition)
            });

            // Pin noAnim images/text at fixed positions
            images.filter(i => i.noAnim).forEach(img => {
                tlText.set(img, { x: img.x, y: img.y, opacity: img.opacity ?? 1 }, 0);
            });
            textObjects.filter(t => t.noAnim).forEach(txt => {
                tlText.set(txt, {
                    x: txt.finalX,
                    y: txt.finalY,
                    opacity: txt.opacity ?? 1
                }, 0);
            });

            // --- IN: one tween per unit ---
            units.forEach((unit, idx) => {
                tlText.to(unit, {
                    x: (i, t) => t.finalX,
                    y: (i, t) => t.finalY,
                    duration: tweenIn,
                    ease: "power1.in",
                    onUpdate: () => drawCanvasForDownload(condition)
                }, idx * tweenIn);
            });

            // 1) STAY tween
            const totalIn = units.length * tweenIn;
            tlText.to({}, { duration: stayTime, ease: "none" }, totalIn);

            // 2) OUT tweens
            const outStart = totalIn + stayTime;
            units.forEach((unit, idx) => {
                tlText.to(unit, {
                    x: (i, t) => t.exitX,
                    y: (i, t) => t.exitY,
                    duration: tweenOut,
                    ease: "power1.out",
                    onUpdate: () => drawCanvasForDownload(condition)
                }, outStart + idx * tweenOut);
            });

            // ──────────────────────────────────────────────────────────────────
            // 3) Pad or compress to exactly slideExecutionTime
            const slideExecutionTime = inTime + stayTime + outTime;  // e.g. 11
            const actualDuration = tlText.duration();            // e.g. 12.6
            const playbackRatio = actualDuration / slideExecutionTime;
            tlText.timeScale(playbackRatio);

            // --- STRIPE/CROSS-FADE: removed from here! ---
            // call your external runStripeTransition(...) after this timeline completes
        }
        else if (animationType === "delaylinear2") {
            // 1) Gather animatable items
            const allItems = [
                ...images.filter(i => !i.noAnim),
                ...textObjects.filter(t => !t.noAnim)
            ];

            // 2) Bucket into “units” by groupId
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

            // 3) Timings
            const tweenIn = 0.15 * inTime;
            const tweenOut = 0.15 * outTime;
            const overlapIn = tweenIn / 6;   // each next In starts 50% in
            const overlapOut = tweenOut / 7;   // each next Out starts 50% in

            // 4) Build timeline
            const tlText = gsap.timeline({
                repeat: loopCount - 1,
                repeatDelay: 0,
                onRepeat: () => {
                    // reset positions on loop
                    images.forEach(img => { img.x = img.startX; img.y = img.startY; });
                    textObjects.forEach(txt => { txt.x = txt.startX; txt.y = txt.startY; });
                    drawCanvasForDownload(condition);
                },
                onUpdate: () => drawCanvasForDownload(condition)
            });

            // Pin noAnim items
            images.filter(i => i.noAnim).forEach(img =>
                tlText.set(img, { x: img.x, y: img.y, opacity: img.opacity ?? 1 }, 0)
            );
            textObjects.filter(t => t.noAnim).forEach(txt =>
                tlText.set(txt, { x: txt.finalX, y: txt.finalY, opacity: txt.opacity ?? 1 }, 0)
            );

            // ── IN ──
            tlText.to(units, {
                x: (i, t) => t.finalX,
                y: (i, t) => t.finalY,
                duration: tweenIn,
                ease: "power1.in",
                stagger: overlapIn,
                onUpdate: () => drawCanvasForDownload(condition)
            }, 0);

            // compute when the last IN actually ends:
            // starts at (units.length-1)*overlapIn, runs tweenIn
            const inEndTime = (units.length - 1) * overlapIn + tweenIn;

            // ── STAY ──
            tlText.to({}, {
                duration: stayTime,
                ease: "none"
            }, inEndTime);

            // ── OUT ──
            tlText.to(units, {
                x: (i, t) => t.exitX,
                y: (i, t) => t.exitY,
                duration: tweenOut,
                ease: "power1.out",
                stagger: overlapOut,
                onUpdate: () => drawCanvasForDownload(condition)
            }, inEndTime + stayTime);

            // ── NORMALIZE TIMING ──
            const slideExecutionTime = inTime + stayTime + outTime;
            const actualDuration = tlText.duration();
            tlText.timeScale(actualDuration / slideExecutionTime);

            //// (Optional) reset all to final positions on complete
            //tlText.eventCallback("onComplete", () => {
            //    images.forEach(img => {
            //        img.x = img.finalX; img.y = img.finalY; img.opacity = img.opacity ?? 1;
            //    });
            //    textObjects.forEach(txt => {
            //        txt.x = txt.finalX; txt.y = txt.finalY;
            //    });
            //    drawCanvasForDownload(condition);
            //});
        }
        else if (animationType === "roll") {
            const allItems = [
                ...images.filter(i => !i.noAnim),
                ...textObjects.filter(t => !t.noAnim)
            ];

            // Grouping (if needed later)
            allItems.forEach(o => {
                o.x = o.finalX;
                o.y = o.finalY;
                o.rotation = 0;
            });

            const inRotationAmount = (direction === "left") ? 360 : (direction === "right") ? -360 : 360;
            const outRotationAmount = (direction === "right") ? 360 : -360;

            const tl = gsap.timeline({
                repeat: loopCount - 1,
                onRepeat: () => {
                    allItems.forEach(o => o.rotation = 0);
                    drawCanvasForDownload(condition);
                },
                onUpdate: () => drawCanvasForDownload(condition)
            });

            // IN: Rotate all items together
            tl.to(allItems, {
                rotation: inRotationAmount,
                duration: inTime,
                ease: "power2.out"
            });

            // STAY: Hold
            tl.to({}, { duration: stayTime });

            // OUT: Rotate all items together (new rotation amount)
            tl.to(allItems, {
                rotation: `+=${outRotationAmount}`,
                duration: outTime,
                ease: "power2.out"
            });

            // Reset after full animation
            tl.eventCallback("onComplete", () => {
                allItems.forEach(o => o.rotation = 0);
                drawCanvasForDownload(condition);
            });
        }
        // Popcorn Canvas Animation
        else if (animationType === "popcorn") {
            const animItems = [...images.filter(i => !i.noAnim), ...textObjects.filter(t => !t.noAnim)];
            const staticItems = [...images.filter(i => i.noAnim), ...textObjects.filter(t => t.noAnim)];

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

            const tl = gsap.timeline({
                repeat: loopCount - 1,
                onUpdate: () => drawCanvasForDownload(condition)
            });

            staticItems.forEach(o => {
                tl.set(o, { scaleX: 1, scaleY: 1 }, 0);
            });

            // IN phase: small to large (stay large)
            tl.to(animItems, {
                scaleX: 1.0,
                scaleY: 1.0,
                duration: inTime / 2,
                ease: "power2.out"
            }, 0);

            // STAY phase: hold the large size
            tl.to({}, { duration: stayTime });

            // OUT phase: large to small
            tl.to(animItems, {
                scaleX: 0,
                scaleY: 0,
                duration: outTime / 2,
                ease: "power2.in"
            });

            //tl.eventCallback("onComplete", () => {
            //    ctxElementForDownload.restore();
            //    return;
            //    //animItems.forEach(o => {
            //    //    o.scaleX = 0;  // Stay hidden after OUT
            //    //    o.scaleY = 0;
            //    //});
            //    //drawCanvasForDownload(condition);
            //});
        }
        else if (animationType === "mask") {

            //if (window.currentMaskTimeline) {
            //    window.currentMaskTimeline.kill();
            //}

            // const animItems = [...images.filter(i => !i.noAnim), ...textObjects.filter(t => !t.noAnim)];
            const staticItems = [...images.filter(i => i.noAnim), ...textObjects.filter(t => t.noAnim)];



            allItems.forEach(o => {
                o.x = o.finalX;
                o.y = o.finalY;
                o.clip = 1;
                o.clipDirection = direction;  // IN direction
            });

            staticItems.forEach(o => {
                o.x = o.finalX;
                o.y = o.finalY;
                o.clip = 0;
            });

            const tl = gsap.timeline({
                repeat: loopCount - 1,
                onRepeat: () => {
                    allItems.forEach(o => {
                        o.clip = 1;
                        o.clipDirection = direction;
                    });
                    drawCanvasForDownload(condition);
                },
                onUpdate: () => drawCanvasForDownload(condition)
            });

            window.currentMaskTimeline = tl;

            // IN: Reveal
            tl.to(allItems, {
                clip: 0,
                duration: inTime,
                ease: "power2.out",
                onUpdate: () => drawCanvasForDownload(condition)
            });

            // STAY: Hold visible
            tl.to({}, { duration: stayTime });

            // OUT: At this moment, switch clipDirection
            tl.add(() => {
                allItems.forEach(o => {
                    o.clipDirection = invertDirection(Outdirection);
                });
            });

            // OUT: Mask again
            tl.to(allItems, {
                clip: 1,
                duration: outTime,
                ease: "power2.out",
                onUpdate: () => drawCanvasForDownload(condition)
            });

            // Final Reset
            tl.eventCallback("onComplete", () => {
                allItems.forEach(o => {
                    o.clip = 1;
                    o.clipDirection = Outdirection;  // Reset for next replay
                });
                drawCanvasForDownload(condition);
            });

        }




    });


    //if (animationType === "linear" || animationType === "zoom" ||
    //    animationType === "bounce" || animationType === "blur") {
    //    // Keep your existing implementation for these cases.
    //    textObjects.forEach((obj) => {
    //        const endX = obj.finalX;
    //        const endY = obj.finalY;
    //        let exitX, exitY;
    //        switch (direction) {
    //            case "top":
    //                exitX = endX;
    //                exitY = -(obj.boundingHeight + 5);
    //                break;
    //            case "bottom":
    //                exitX = endX;
    //                exitY = canvas.height + 5;
    //                break;
    //            case "left":
    //                exitX = -(obj.boundingWidth + 5);
    //                exitY = endY;
    //                break;
    //            case "right":
    //                exitX = canvas.width + 5;
    //                exitY = endY;
    //                break;
    //            default:
    //                exitX = window.innerWidth;
    //                exitY = endY;
    //        }
    //        if (animationType === "linear" || animationType === "zoom") {
    //            let tl = gsap.timeline({
    //                repeat: loopCount - 1,
    //                onUpdate: function () {
    //                    drawCanvasForDownload(condition);
    //                }
    //            });

    //            tl.to(obj, {
    //                x: endX,
    //                y: endY,
    //                duration: inTime,
    //                ease: "power1.in"
    //            });
    //            tl.to(obj, {
    //                duration: stayTime,
    //                ease: "none"
    //            });
    //            tl.to(obj, {
    //                x: exitX,
    //                y: exitY,
    //                duration: outTime,
    //                ease: "power1.out"
    //            });
    //            tl.set(obj, {
    //                x: endX,
    //                y: endY,
    //                duration: 0,
    //                ease: "power1.inOut",
    //                onUpdate: () => drawCanvasForDownload(condition)
    //            });
    //        }
    //        else if (animationType === "bounce" || animationType === "blur") {

    //            ////This section is for in out and stay
    //            let tl = gsap.timeline({
    //                repeat: loopCount - 1,
    //                onUpdate: function () {
    //                    drawCanvasForDownload(condition);
    //                }
    //            });

    //            // "In" phase: Animate the object onto the canvas.
    //            tl.to(obj, {
    //                x: endX,
    //                y: endY,
    //                duration: inTime,
    //                ease: "bounce.out"
    //            });

    //            // "Stay" phase: Hold the object in place for the stay duration.
    //            // This tween doesn't change any properties; it just acts as a pause.
    //            tl.to(obj, {
    //                duration: stayTime,
    //                ease: "none"
    //            });

    //            // "Out" phase: Animate the object off the canvas.
    //            tl.to(obj, {
    //                x: exitX,
    //                y: exitY,
    //                duration: outTime,
    //                ease: "bounce.out"
    //            });
    //            // Final phase: Reset the object to the final position with text.
    //            // This sets the object’s position to (endX, endY) after the out tween completes.
    //            tl.set(obj, {
    //                x: endX,
    //                y: endY,
    //                duration: 0,
    //                ease: "bounce.out",
    //                onUpdate: () => drawCanvasForDownload(condition),


    //            });


    //            ////This is default effect of bounce
    //            //gsap.to(obj, {
    //            //    x: endX,
    //            //    y: endY,
    //            //    duration: parseFloat(selectedInSpeed) || 2,
    //            //    ease: "bounce.out",
    //            //    onUpdate: () => drawCanvas(condition),
    //            //});
    //        }

    //    });
    //}



    //if (animationType === "linear" || animationType === "zoom" ||
    //    animationType === "bounce" || animationType === "blur") {
    //    // Keep the existing branches for images.
    //    let exitX, exitY;
    //    images.forEach((imgObj) => {
    //        const endX = imgObj.finalX;
    //        const endY = imgObj.finalY;
    //        let tl = gsap.timeline({
    //            repeat: loopCount - 1,
    //            onUpdate: function () {
    //                drawCanvasForDownload(condition);
    //            }
    //        });

    //        if (animationType === "linear") {
    //            tl.to(imgObj, {
    //                x: endX,
    //                y: endY,
    //                duration: inTime,
    //                ease: "power1.in"
    //            });
    //            tl.to(imgObj, {
    //                duration: stayTime,
    //                ease: "none"
    //            });
    //            tl.to(imgObj, {
    //                x: exitX,
    //                y: exitY,
    //                duration: outTime,
    //                ease: "power1.out"
    //            });
    //            tl.set(imgObj, {
    //                x: endX,
    //                y: endY,
    //                duration: 0,
    //                ease: "power1.inOut",
    //                onUpdate: () => drawCanvasForDownload(condition)
    //            });
    //        }
    //        else if (animationType === "bounce") {
    //            tl.to(imgObj, {
    //                x: endX,
    //                y: endY,
    //                duration: inTime,
    //                ease: "bounce.out"
    //            });
    //            tl.to(imgObj, {
    //                duration: stayTime,
    //                ease: "none"
    //            });
    //            tl.to(imgObj, {
    //                x: exitX,
    //                y: exitY,
    //                duration: outTime,
    //                ease: "bounce.out"
    //            });
    //            tl.set(imgObj, {
    //                x: endX,
    //                y: endY,
    //                duration: 0,
    //                ease: "bounce.out",
    //                onUpdate: () => drawCanvasForDownload(condition)
    //            });
    //        }
    //        else if (animationType === "zoom") {
    //            // Zoom in then out.
    //            tl.fromTo(
    //                imgObj,
    //                { scaleX: 0, scaleY: 0, x: startX, y: startY },
    //                {
    //                    scaleX: originalScaleX,
    //                    scaleY: originalScaleY,
    //                    x: endX,
    //                    y: endY,
    //                    duration: inTime,
    //                    ease: "power2.out",
    //                    onUpdate: () => drawCanvasForDownload(condition)
    //                }
    //            );
    //            tl.to(imgObj, {
    //                duration: stayTime,
    //                ease: "none"
    //            });
    //            tl.to(imgObj, {
    //                scaleX: 0,
    //                scaleY: 0,
    //                x: exitX,
    //                y: exitY,
    //                duration: outTime,
    //                ease: "power2.in",
    //                onUpdate: () => drawCanvasForDownload(condition)
    //            });
    //            tl.set(imgObj, {
    //                x: endX,
    //                y: endY,
    //                scaleX: originalScaleX,
    //                scaleY: originalScaleY,
    //                duration: 0,
    //                ease: "none",
    //                onUpdate: () => drawCanvasForDownload(condition)
    //            });
    //        }
    //        else if (animationType === "blur") {
    //            imgObj.blur = 5;
    //            tl.fromTo(
    //                imgObj,
    //                { blur: 5, x: startX, y: startY },
    //                {
    //                    blur: 0,
    //                    x: endX,
    //                    y: endY,
    //                    duration: inTime + 2,
    //                    ease: "power2.out",
    //                    onUpdate: () => {
    //                        ctx.filter = `blur(${imgObj.blur}px)`;
    //                        drawCanvasForDownload(condition);
    //                    },
    //                    onComplete: () => {
    //                        ctx.filter = "none";
    //                        drawCanvasForDownload(condition);
    //                    }
    //                }
    //            );
    //            tl.to(imgObj, {
    //                duration: stayTime,
    //                ease: "none",
    //                onUpdate: () => {
    //                    ctx.filter = "none";
    //                    drawCanvasForDownload(condition);
    //                }
    //            });
    //            tl.to(imgObj, {
    //                x: exitX,
    //                y: exitY,
    //                duration: outTime,
    //                ease: "power2.in",
    //                onUpdate: () => {
    //                    ctx.filter = "none";
    //                    drawCanvasForDownload(condition);
    //                }
    //            });
    //            tl.set(imgObj, {
    //                x: endX,
    //                y: endY,
    //                duration: 0,
    //                ease: "none",
    //                onUpdate: () => {
    //                    ctx.filter = "none";
    //                    drawCanvasForDownload(condition);
    //                }
    //            });
    //        }
    //    });
    //}
}
function initModeToggle() {
    const buttons = document.querySelectorAll('.toggle-container .toggle-btn');

    function applyModeOld(mode) {
        if (mode === 'graphic') {
            document.getElementById('opengl_popup').style.display = 'none';
            document.getElementById('fontstyle_popup').style.display = 'block';
            document.querySelector('.right-sec-one').style.display = 'none';
            document.querySelector('.right-sec-two').style.display = 'block';

        } else {

            document.getElementById('opengl_popup').style.display = 'none';
            document.getElementById('fontstyle_popup').style.display = 'none';
            document.querySelector('.right-sec-one').style.display = 'block';
            document.querySelector('.right-sec-two').style.display = 'none';
        }
    }
    function applyMode(mode) {
        const openglPopup = document.getElementById('opengl_popup');
        const fontstylePopup = document.getElementById('fontstyle_popup');
        const rightSecOne = document.querySelector('.right-sec-one');
        const rightSecTwo = document.querySelector('.right-sec-two');

        if (mode === 'graphic') {
            if (openglPopup) openglPopup.style.display = 'none';
            if (fontstylePopup) fontstylePopup.style.display = 'block';
            if (rightSecOne) rightSecOne.style.display = 'none';
            if (rightSecTwo) rightSecTwo.style.display = 'block';
        } else {
            if (openglPopup) openglPopup.style.display = 'none';
            if (fontstylePopup) fontstylePopup.style.display = 'none';
            if (rightSecOne) rightSecOne.style.display = 'block';
            if (rightSecTwo) rightSecTwo.style.display = 'none';
        }
    }


    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            // toggle active class
            buttons.forEach(b => b.classList.toggle('active', b === btn));

            // apply mode for the newly clicked button
            applyMode(btn.dataset.mode);
        });
    });

    // on load: find the one already marked .active
    const defaultBtn = document.querySelector('.toggle-btn.active');
    if (defaultBtn) {
        applyMode(defaultBtn.dataset.mode);
    }
}

document.addEventListener('DOMContentLoaded', initModeToggle);

//// initialize on DOM ready
//document.addEventListener('DOMContentLoaded', initModeToggle);
function tranTypeSet(type) {
    $("#hdntransition").val(type);
}