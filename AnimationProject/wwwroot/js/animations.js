// Global variables
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const contextMenu = document.getElementById("contextMenu");
const canvasContainer = document.getElementById("canvasContainer");
let selectedInSpeed = null;
let selectedStaySpeed = null;
let selectedOutSpeed = null;

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

// Configuration constants.
const padding = 5;         // Padding inside the bounding box
const handleSize = 10;     // Resize handle square size (in pixels)
const minWidth = 50;       // Minimum bounding width
const minHeight = 30;      // Minimum bounding height

////This is for delete text///////////////////
// Utility: Returns an object (text or image) if the (x,y) falls within its bounding box.

function wrapText(ctx, text, maxWidth) {
    const words = text.split(" ");
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const testLine = currentLine + " " + word;
        const testWidth = ctx.measureText(testLine).width;
        if (testWidth < maxWidth) {
            currentLine = testLine;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
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
        //ctx.font = `${obj.fontSize}px ${obj.fontFamily}`;
        //let width = ctx.measureText(obj.text).width;
        //// Assuming y is the baseline, top is approximately y - fontSize.
        //if (x >= obj.x && x <= obj.x + width && y >= obj.y - obj.fontSize && y <= obj.y) {
        //    return { type: "text", obj: obj };
        //}
        if (
            x >= obj.x - padding &&
            x <= obj.x - padding + obj.boundingWidth + 2 * padding &&
            y >= obj.y - padding &&
            y <= obj.y - padding + obj.boundingHeight + 2 * padding
        ) {
            return { type: "text", obj: obj };
        }
    }
   
    // Check image object.
    if (image) {
        if (x >= image.x  &&
            y >= image.y ) {
            return { type: "image", obj: image };
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
function getHandleUnderMouse(mouseX, mouseY, obj) {
    // Calculate the outer bounding box including padding.
    const boxX = obj.x - padding;
    const boxY = obj.y - padding;
    const boxWidth = obj.boundingWidth + 2 * padding;
    const boxHeight = obj.boundingHeight + 2 * padding;

    // Define eight handles: four corners and four midpoints.
    const handles = {
        "top-left": { x: boxX, y: boxY },
        "top-middle": { x: boxX + boxWidth / 2, y: boxY },
        "top-right": { x: boxX + boxWidth, y: boxY },
        "right-middle": { x: boxX + boxWidth, y: boxY + boxHeight / 2 },
        "bottom-right": { x: boxX + boxWidth, y: boxY + boxHeight },
        "bottom-middle": { x: boxX + boxWidth / 2, y: boxY + boxHeight },
        "bottom-left": { x: boxX, y: boxY + boxHeight },
        "left-middle": { x: boxX, y: boxY + boxHeight / 2 }
    };

    for (let key in handles) {
        const hx = handles[key].x;
        const hy = handles[key].y;
        if (Math.abs(mouseX - hx) <= handleSize && Math.abs(mouseY - hy) <= handleSize) {
            return key;
        }
    }
    return null;
}



let selectedForContextMenu = null;
let selectedType = null; // "text" or "image"



// Show dynamic context menu on right-click.
canvas.addEventListener("contextmenu", function (e) {
    e.preventDefault(); // Prevent default browser context menu

    // Get mouse coordinates relative to the canvas container.
    const rect = canvas.getBoundingClientRect();
    const offsetX = e.clientX  - rect.left;
    const offsetY = e.clientY - rect.top;
    const adjustX = 155;
    const adjustY = 64;
    const found = getObjectAtcontextmenu(offsetX, offsetY);
    if (found) {
        selectedForContextMenu = found.obj;
        selectedType = found.type;

        // Position the context menu dynamically within the canvas container.
        contextMenu.style.left = offsetX + adjustX + "px";
        contextMenu.style.top = offsetY + adjustY + "px";
        //contextMenu.style.left = `${rect.left + editorX - offsetX}px`;
        //contextMenu.style.top = `${rect.top + found.obj.y + scrollTop - ascent - offsetY}px`;
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
            image = null;
        }
        drawCanvas('Common');
        selectedForContextMenu = null;
    }
});
////END   This is for delete text///////////////////
// Draw Canvas Elements
function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.save();
    ctx.beginPath();
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

    const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
    gradient.addColorStop(0, "#FF7F50");  // Coral
    gradient.addColorStop(1, "#FFD700");  // Gold

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


function drawCanvas(condition) {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the entire canvas

    // Draw image (if any)
    if (image) {
        ctx.save();
        ctx.globalAlpha = imagePosition.opacity || 1;
        const scaleX = imagePosition.scaleX || 1;
        const scaleY = imagePosition.scaleY || 1;
        ctx.translate(imagePosition.x, imagePosition.y);
        ctx.scale(scaleX, scaleY);
        ctx.drawImage(image, imagePosition.x, imagePosition.y, 650, 650);
        ctx.restore();
    }

    ctx.save();
    ctx.globalAlpha = textPosition.opacity || 1; // Apply text opacity

    if (condition === 'Common' || condition === 'ChangeStyle') {
        textObjects.forEach(obj => {
            ctx.save();

            // Constrain the selected box so that it does not cross canvas width.
            // (You may add similar constraints for the left edge or height if needed.)
            if (obj.x < 0) {
                obj.x = 0;
            }
            if (obj.x + obj.boundingWidth > canvas.width) {
                obj.boundingWidth = canvas.width - obj.x;
            }

            // If the object is selected, draw its bounding box and handles.
            if (obj.selected) {
                const boxX = obj.x - padding;
                const boxY = obj.y - padding;
                const boxWidth = obj.boundingWidth + 2 * padding;
                const boxHeight = obj.boundingHeight + 2 * padding;
                drawRoundedRect(ctx, boxX, boxY, boxWidth, boxHeight, 5);

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
                ctx.fillStyle = "#FF7F50";
                handles.forEach(handle => {
                    ctx.fillRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
                });
            }

            // Set text properties.
            ctx.font = `${obj.fontSize}px ${obj.fontFamily}`;
            ctx.fillStyle = obj.textColor;
            ctx.textBaseline = "top";

            // Wrap text into lines with max width = boundingWidth minus 2*padding.
            const maxTextWidth = obj.boundingWidth - 2 * padding;
            let lines;
            // If text contains newline characters, use them; otherwise, wrap.
            if (obj.text.indexOf("\n") !== -1) {
                lines = obj.text.split("\n");
            } else {
                lines = wrapText(ctx, obj.text, maxTextWidth);
            }
            const lineHeight = obj.fontSize * 1.2;
            const availableHeight = obj.boundingHeight - 2 * padding;
            const maxLines = Math.floor(availableHeight / lineHeight);
            const startY = obj.y + padding;

            // Draw each line using the proper horizontal offset based on alignment.
            for (let i = 0; i < Math.min(lines.length, maxLines); i++) {
                const line = lines[i];
                const lineWidth = ctx.measureText(line).width;
                let offsetX;
                if (obj.textAlign === "center") {
                    offsetX = obj.x + (obj.boundingWidth - lineWidth) / 2;
                } else if (obj.textAlign === "right") {
                    offsetX = obj.x + obj.boundingWidth - lineWidth - padding;
                } else { // left alignment (or default)
                    offsetX = obj.x + padding;
                }
                ctx.fillText(line, offsetX, startY + i * lineHeight);
            }
            ctx.restore();
        });
    }

    if (condition === 'applyAnimations') {
        textObjects.forEach(obj => {
            ctx.save();
            ctx.font = `${obj.fontSize}px ${obj.fontFamily}`;
            ctx.fillStyle = obj.textColor;
            ctx.textBaseline = "top";

            const maxTextWidth = obj.boundingWidth - 2 * padding;
            let lines;
            if (obj.text.indexOf("\n") !== -1) {
                lines = obj.text.split("\n");
            } else {
                lines = wrapText(ctx, obj.text, maxTextWidth);
            }
            const lineHeight = obj.fontSize * 1.2;
            const availableHeight = obj.boundingHeight - 2 * padding;
            const maxLines = Math.floor(availableHeight / lineHeight);
            const startY = obj.y + padding;

            for (let i = 0; i < Math.min(lines.length, maxLines); i++) {
                const line = lines[i];
                const lineWidth = ctx.measureText(line).width;
                let offsetX;
                if (obj.textAlign === "center") {
                    offsetX = obj.x + (obj.boundingWidth - lineWidth) / 2;
                } else if (obj.textAlign === "right") {
                    offsetX = obj.x + obj.boundingWidth - lineWidth - padding;
                } else {
                    offsetX = obj.x + padding;
                }
                ctx.fillText(line, offsetX, startY + i * lineHeight);
            }
            ctx.restore();
        });
    }

    ctx.globalAlpha = 1;
    ctx.restore();
}




// Image Upload Handler
document.getElementById("imageUpload").addEventListener("change", (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            image = img;
            drawCanvas();
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
});

// Text Input Handler
document.getElementById("textInput").addEventListener("input", (e) => {

    text = e.target.value || "Hello, SBOED!";
    drawCanvas();
});
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
function animateText(direction,condition ) {
    const animationType = document.getElementById("hdnTextAnimationType").value;
    textObjects.forEach(obj => {

        // Save the object's final position.
        const endX = obj.x;
        const endY = obj.y;
        let startX, startY;
       
        // Determine starting position based on the chosen direction.
        switch (direction) {
            case "top":
                startX = endX;           // same x as final
                startY = 0;                // from top edge (or use -obj.fontSize to start off-canvas)
                break;
            case "bottom":
                startX = endX;           // same x as final
                startY = canvas.height;    // from bottom edge (or canvas.height + offset)
                break;
            case "left":
                startX = 0;                // from left edge (or -width for off-canvas)
                startY = endY;           // same y as final
                break;
            case "right":
                startX = canvas.width;     // from right edge (or canvas.width + offset)
                startY = endY;           // same y as final
                break;
            default:
                // If no valid direction is provided, use current values.
                startX = endX;
                startY = endY;
        }

        // Set the object's starting position.
        obj.x = startX;
        obj.y = startY;

        //This section is for in out and stay
        const inTime = parseFloat(selectedInSpeed) || 3;   // How fast the object comes onto the canvas.
        const stayTime = parseFloat(selectedStaySpeed) || 6; // How long the object stays on screen.
        const outTime = parseFloat(selectedOutSpeed) || 2;  // How fast the object leaves the canvas.
        const exitX = window.innerWidth; // Example: exit to the right of the screen.
        const exitY = endY;              // Maintain the same vertical position.
        ////end///////////
        if (animationType === "linear") {
          
           ////This section is for in out and stay
            let tl = gsap.timeline({
                onUpdate: function () {
                    drawCanvas(condition);
                }
            });

            // "In" phase: Animate the object onto the canvas.
            tl.to(obj, {
                x: endX,
                y: endY,
                duration: inTime,
                ease: "power1.in"
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
                ease: "power1.out"
            });
            // Final phase: Reset the object to the final position with text.
            // This sets the object’s position to (endX, endY) after the out tween completes.
            tl.set(obj, {
                    x: endX,
                    y: endY,
                duration: parseFloat(selectedInSpeed) || 2,
                    ease: "power1.inOut",
                    onUpdate: () => drawCanvas(condition),
            });
            ////end///////////
            ////This is default animation of linear
            //gsap.to(obj, {
            //    x: endX,
            //    y: endY,
            //    duration: parseFloat(selectedSpeed) || 2,
            //    ease: "power1.inOut",
            //    onUpdate: () => drawCanvas(condition),
            //});


        } else if (animationType === "elastic") {
            gsap.to(obj, {
                x: endX,
                y: endY,
                duration: parseFloat(selectedInSpeed) || 2.5,
                ease: "elastic.out(1, 0.3)",
                onUpdate: drawCanvas,
            });
        } else if (animationType === "wave") {
            let angle = 0;
            gsap.ticker.add(() => {
                obj.x = startX + (endX - startX) * 0.5 + Math.sin(angle) * 100;
                obj.y = startY + (endY - startY) * 0.5;
                drawCanvas(condition);
                angle += 0.05;
            });
        } else if (animationType === "fadeIn") {
            gsap.fromTo(
                obj,
                { opacity: 0, x: startX, y: startY },
                {
                    opacity: 1,
                    x: endX,
                    y: endY,
                    duration: 2,
                    ease: "power2.out",
                    onUpdate: drawCanvas,
                }
            );
        } else if (animationType === "zoomInOut") {
            gsap.fromTo(
                obj,
                { scale: 0, x: startX, y: startY },
                {
                    scale: 1,
                    x: endX,
                    y: endY,
                    duration: 2,
                    ease: "power2.inOut",
                    onUpdate: drawCanvas,
                }
            );
        } else if (animationType === "rotate") {
            gsap.fromTo(
                obj,
                { rotation: 0, x: startX, y: startY },
                {
                    rotation: 360,
                    x: endX,
                    y: endY,
                    duration: 2,
                    ease: "power2.inOut",
                    onUpdate: drawCanvas,
                }
            );
        } else if (animationType === "bounce") {

            ////This section is for in out and stay
            let tl = gsap.timeline({
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
                duration: parseFloat(selectedInSpeed) || 2,
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
        } else if (animationType === "spiral") {
            gsap.to(obj, {
                duration: 3,
                motionPath: {
                    path: [
                        { x: startX, y: startY },
                        { x: endX - 50, y: endY - 50 },
                        { x: endX, y: endY },
                    ],
                    autoRotate: true,
                },
                ease: "power2.inOut",
                onUpdate: drawCanvas,
            });
        }
        else if (animationType === "fadeText") {
            gsap.fromTo(
                obj,
                { x: startX, y: startY, opacity: 0 }, // Initial state
                {
                    x: endX,
                    y: endY,
                    opacity: 1, // Target opacity
                    duration: 2,
                    ease: "power2.inOut",
                    onUpdate: drawCanvas, // Updates canvas on every frame
                    onComplete: () => {
                        // Fade out after a delay
                        gsap.to(obj, {
                            opacity: 1,
                            duration: 2,
                            //delay: 2,
                            onUpdate: drawCanvas,
                        });
                    },
                }
            );
        }
        else if (animationType === "typeText") {
            gsap.to(obj, {
                duration: text.length * 0.15,  // Slow down the typing speed (adjust the multiplier)
                ease: "power2.inOut",
                onUpdate: function () {
                    // Update the text content dynamically during the animation
                    const progress = Math.ceil(this.progress() * text.length);
                    obj.text = text.slice(0, progress);  // Slice the text to create the typing effect
                    drawCanvas(condition);  // Redraw the canvas at each update
                },
            });

        }
        else if (animationType === "morphText") {
            gsap.to(obj, {
                x: endX,  // You can use any values for endX and endY
                y: endY,  // Similarly, endY for vertical position change
                duration: 2.5,
                ease: "elastic.out(1, 0.3)",  // Apply easing for a bounce effect
                onUpdate: drawCanvas,  // Redraw the canvas on each update
                repeat: 1,  // Repeat the animation once (total of 2 times)
                yoyo: true,  // Make the animation reverse after completing
                onComplete: function () {
                }
            });


        }
    });

}


function textAnimationClick(clickedElement, type) {
    $("#hdnTextAnimationType").val(type);
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
}
function animateImage(condition) {
    const startX = parseInt(document.getElementById("imageStartX").value);
    const startY = parseInt(document.getElementById("imageStartY").value);
    const endX = parseInt(document.getElementById("imageEndX").value);
    const endY = parseInt(document.getElementById("imageEndY").value);
    const animationType = document.getElementById("imageAnimation").value;

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
function applyAnimations(direction,conditionvalue) {
    // Reset text and image positions
    //textPosition.x = parseInt(document.getElementById("textStartX").value);
    //textPosition.y = parseInt(document.getElementById("textStartY").value);
    imagePosition.x = parseInt(document.getElementById("imageStartX").value);
    imagePosition.y = parseInt(document.getElementById("imageStartY").value);

    drawCanvas(conditionvalue);
    //textObjects.forEach(obj => {
    //    text = obj.text;
    //    animateText(conditionvalue);
    //});
    animateText(direction,conditionvalue);
    animateImage(conditionvalue);
    
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


// Add a Load Button
const jsonArray = [
    {
        "text": {
            "content": "Champignon Carpaccio",
            "startX": 100,
            "startY": 100,
            "endX": 400,
            "endY": 100,
            "animation": "bounce",
            "fontSize": "50",
            "fontFamily": "Times New Roman",
            "textColor": "green",
            "textAlign": "center"
        },
        "image": {
            "startX": 100,
            "startY": 20,
            "endX": 50,
            "endY": 50,
            "animation": "elastic",
            "imageSrc": "https://thumbs.dreamstime.com/z/salad-8311603.jpg?ct=jpeg"
        }
    },
    {
        "text": {
            "content": "Salmon carpaccio",
            "startX": 150,
            "startY": 150,
            "endX": 450,
            "endY": 150,
            "animation": "linear",
            "fontSize": "60",
            "fontFamily": "Arial",
            "textColor": "blue",
            "textAlign": "center"
        },
        "image": {
            "startX": 120,
            "startY": 30,
            "endX": 80,
            "endY": 60,
            "animation": "zoomImage",
            "imageSrc": "https://thumbs.dreamstime.com/z/salmon-carpaccio-arugula-salad-onions-capers-white-plate-201622172.jpg?ct=jpeg"
        }
    },
    {
        "text": {
            "content": "Fresh oranges juice",
            "startX": 200,
            "startY": 150,
            "endX": 450,
            "endY": 150,
            "animation": "morphText",
            "fontSize": "40",
            "fontFamily": "Verdana",
            "textColor": "red",
            "textAlign": "center"
        },
        "image": {
            "startX": 200,
            "startY": 50,
            "endX": 100,
            "endY": 80,
            "animation": "zoomImage",
            "imageSrc": "https://thumbs.dreamstime.com/z/fresh-oranges-falling-juice-19966424.jpg?ct=jpeg"
        }
    }
];
let currentIndex = 0; // Track the current index

//const loadButton = document.createElement("button");
//loadButton.textContent = "Load JSON";
//document.body.appendChild(loadButton);

//loadButton.addEventListener("click", () => {
//    currentIndex = 0; // Reset index when button is clicked
//    startVideoCapture();
//    loadNextJson(); // Start loading
//});
function loadJsonFile() {
    currentIndex = 0; // Reset index when button is clicked
    startVideoCapture();
    loadNextJson(); // Start loading
}
function loadNextJson() {
    if (currentIndex < jsonArray.length) {
        const state = jsonArray[currentIndex];
        loadCanvasState(state);
        console.log("Canvas State Loaded:", state);

        currentIndex++; // Move to the next JSON

        // Load next JSON after a delay (e.g., 3 seconds)
        setTimeout(loadNextJson, 3000);
    } else {
        console.log("All JSON objects loaded.");
    }
}
////KD/////////////////////////////
//document.body.appendChild(loadButton);
//end////////////

function ShowAnimationOption() {
    //if ($("#imageAnimation option:selected").val() == "bounce" || $("#imageAnimation option:selected").val() == "zoomImage" || $("#imageAnimation option:selected").val() == "pathMotion") {
    //    document.getElementById("imageCoordinationforBounce").style.display = "block";
    //}
    document.getElementById("imageCoordinationforBounce").style.display = "block";
}
function setCoordinate(clickedElement, direction, imageStartX, imageStartY, imageEndX, imageEndY) {
    // Get the container using its ID.
    var ulDirection = document.getElementById("uldirection");

    // Select all <a> elements within the container.
    var links = ulDirection.getElementsByTagName("a");

    // Remove the active_effect class from all links.
    for (var i = 0; i < links.length; i++) {
        links[i].classList.remove("active_effect");
    }

    // Add the active_effect class to the clicked element.
    clickedElement.classList.add("active_effect");

    if ($("#hdnTextAnimationType").val() !== "") {
        document.getElementById("imageStartX").value = imageStartX;
        document.getElementById("imageStartY").value = imageStartY;
        document.getElementById("imageEndX").value = imageEndX;
        document.getElementById("imageEndY").value = imageEndY;
        document.getElementById("imageAnimation").value = $("#imageAnimation option:selected").val();
        applyAnimations(direction, 'applyAnimations');
    }
    else {
        alert('Please select Text Animation')
    }
    
}
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



//function drawCanvas() {
//    ctx.clearRect(0, 0, canvas.width, canvas.height);
//    ctx.save();
//    ctx.font = `${fontSize}px ${fontFamily}`;
//    ctx.fillStyle = textColor;
//    ctx.textAlign = "left";

//    textObjects.forEach(obj => {
//        ctx.fillText(obj.text, obj.x, obj.y);
//        // If selected, draw a bounding box
//        if (obj.selected) {
//            const textWidth = ctx.measureText(obj.text).width;
//            ctx.strokeStyle = "red";
//            ctx.strokeRect(obj.x, obj.y - fontSize, textWidth, fontSize);
//        }
//    });
//    ctx.restore();
//}

// Add a new text object with default text
function addDefaultText() {
    const newObj = {
        text: "Default Text",
        x: 50,
        y: 100,
        //boundingWidth: 200,
        //boundingHeight: 60,
        selected: false,
        editing: false,
        fontFamily: "Arial",     // Default font family
        textColor: "#000000",    // Default text color (black)
        textAlign: "left",        // Default text alignment
        fontSize: 35
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


// Mouse events for dragging and selection
canvas.addEventListener("mousedown", function (e) {

    const pos = getMousePos(canvas, e);
    // Check for a resize handle first.
    const handle = getHandleUnderMouse(pos.x, pos.y, currentSelectedText());
    if (currentSelectedText() && handle) {
        isResizing = true;
        activeHandle = handle;
        e.preventDefault();
    }
    // Otherwise, if clicking inside a text object's bounding box, start dragging.
    else if (currentSelectedText() && isInsideBox(pos.x, pos.y, currentSelectedText())) {
        isDragging = true;
        dragOffset.x = pos.x - currentSelectedText().x;
        dragOffset.y = pos.y - currentSelectedText().y;
        e.preventDefault();
    }
   
    drawCanvas('Common');
});
canvas.addEventListener("click", function (e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // If the text editor is active, ignore this event.
    if (document.activeElement === textEditor) return;

    // Try to get a text object under the mouse.
    const obj = getTextObjectAt(mouseX, mouseY);

    if (obj) {
        // Deselect all and select this object.
        textObjects.forEach(o => o.selected = false);
        obj.selected = true;
        // Bring the selected object to the front.
        textObjects.splice(textObjects.indexOf(obj), 1);
        textObjects.push(obj);
    } else {
        // If clicked outside any text, deselect all.
        textObjects.forEach(o => o.selected = false);
    }

    drawCanvas('Common');
});
// Adjusts font size so that the wrapped text fits inside the new bounding box.
// It measures the text using your wrapText helper and ensures that the total height of the lines is less than or equal to the available height.
function adjustFontSizeToFitBox(obj) {
    const availableWidth = obj.boundingWidth - 2 * padding;
    const availableHeight = obj.boundingHeight - 2 * padding;
    // We'll try from a maximum possible font size down to a minimum of 5.
    let maxFontSize = Math.floor(availableHeight); // maximum based on height
    for (let fs = maxFontSize; fs >= 5; fs--) {
        ctx.font = `${fs}px ${obj.fontFamily}`;
        let lines = wrapText(ctx, obj.text, availableWidth);
        const lineHeight = fs * 1.2;
        if (lines.length * lineHeight <= availableHeight) {
            return fs;
        }
    }
    return 5; // fallback minimum
}

//canvas.addEventListener("mousemove", function (e) {
//    const pos = getMousePos(canvas, e);

//    // Update cursor style.
//    if (currentSelectedText()) {
//        const handle = getHandleUnderMouse(pos.x, pos.y, currentSelectedText());
//        if (handle) {
//            canvas.style.cursor = "nwse-resize";
//        } else if (isInsideBox(pos.x, pos.y, currentSelectedText())) {
//            canvas.style.cursor = "move";
//        } else {
//            canvas.style.cursor = "default";
//        }
//    } else {
//        canvas.style.cursor = "default";
//    }

//    // Debugging log.
//    console.log(isResizing, currentSelectedText(), activeHandle);

//    // Handle resizing.
//    if (isResizing && currentSelectedText() && activeHandle) {
//        const obj = currentSelectedText();
//        const oldLeft = obj.x;
//        const oldTop = obj.y;
//        const oldRight = obj.x + obj.boundingWidth;
//        const oldBottom = obj.y + obj.boundingHeight;

//        // Calculate the text's natural size
//        ctx.font = `${obj.fontSize}px ${obj.fontFamily}`;
//        const textWidth = ctx.measureText(obj.text).width + 2 * padding;
//        const lineHeight = obj.fontSize * 1.2;
//        const lines = wrapText(ctx, obj.text, textWidth);
//        const textHeight = lines.length * lineHeight + 2 * padding;

//        switch (activeHandle) {
//            case "top-left":
//                obj.x = pos.x;
//                obj.y = pos.y;
//                obj.boundingWidth = oldRight - pos.x;
//                obj.boundingHeight = oldBottom - pos.y;
//                obj.fontSize = adjustFontSizeToFitBox(obj);
//                break;
//            case "top-middle":
//                // Prevent reducing height beyond text height
//                if (oldBottom - pos.y >= textHeight) {
//                    obj.y = pos.y;
//                    obj.boundingHeight = oldBottom - pos.y;
//                }
//                break;
//            case "top-right":
//                obj.y = pos.y;
//                obj.boundingWidth = pos.x - oldLeft;
//                obj.boundingHeight = oldBottom - pos.y;
//                obj.fontSize = adjustFontSizeToFitBox(obj);
//                break;
//            case "right-middle":
//                // Prevent reducing width beyond text width
//                if (pos.x - oldLeft >= textWidth) {
//                    obj.boundingWidth = pos.x - oldLeft;
//                }
//                break;
//            case "bottom-right":
//                obj.boundingWidth = pos.x - oldLeft;
//                obj.boundingHeight = pos.y - oldTop;
//                obj.fontSize = adjustFontSizeToFitBox(obj);
//                break;
//            case "bottom-middle":
//                // Prevent reducing height beyond text height
//                if (pos.y - oldTop >= textHeight) {
//                    obj.boundingHeight = pos.y - oldTop;
//                }
//                break;
//            case "bottom-left":
//                obj.x = pos.x;
//                obj.boundingWidth = oldRight - pos.x;
//                obj.boundingHeight = pos.y - oldTop;
//                obj.fontSize = adjustFontSizeToFitBox(obj);
//                break;
//            case "left-middle":
//                // Prevent reducing width beyond text width
//                if (oldRight - pos.x >= textWidth) {
//                    obj.x = pos.x;
//                    obj.boundingWidth = oldRight - pos.x;
//                }
//                break;
//        }

//        // Enforce minimum dimensions.
//        if (obj.boundingWidth < textWidth) obj.boundingWidth = textWidth;
//        if (obj.boundingHeight < textHeight) obj.boundingHeight = textHeight;

//        drawCanvas("Common");
//    }

//    // Handle dragging.
//    if (isDragging && currentSelectedText()) {
//        const obj = currentSelectedText();
//        obj.x = pos.x - dragOffset.x;
//        obj.y = pos.y - dragOffset.y;
//        drawCanvas("Common");
//    }
//});

canvas.addEventListener("mousemove", function (e) {
    const pos = getMousePos(canvas, e);

    if (currentSelectedText()) {
        const handle = getHandleUnderMouse(pos.x, pos.y, currentSelectedText());
        if (handle) {
            canvas.style.cursor = "nwse-resize";
        } else if (isInsideBox(pos.x, pos.y, currentSelectedText())) {
            canvas.style.cursor = "move";
        } else {
            canvas.style.cursor = "default";
        }
    } else {
        canvas.style.cursor = "default";
    }

    if (isResizing && currentSelectedText() && activeHandle) {
        const obj = currentSelectedText();
        const oldLeft = obj.x;
        const oldTop = obj.y;
        const oldRight = obj.x + obj.boundingWidth;
        const oldBottom = obj.y + obj.boundingHeight;

        ctx.font = `${obj.fontSize}px ${obj.fontFamily}`;
        const maxTextWidth = obj.boundingWidth - 2 * padding;
        let lines = wrapText(ctx, obj.text, maxTextWidth);
        let widestLine = Math.max(...lines.map(line => ctx.measureText(line).width)) + 2 * padding;
        let textHeight = lines.length * obj.fontSize * 1.2 + 2 * padding;

        switch (activeHandle) {
            case "top-left":
                obj.x = pos.x;
                obj.y = pos.y;
                obj.boundingWidth = oldRight - pos.x;
                obj.boundingHeight = oldBottom - pos.y;
                obj.fontSize = adjustFontSizeToFitBox(obj);
                break;
            case "top-middle":
                // Prevent reducing height below multiline height
                if (oldBottom - pos.y >= textHeight) {
                    obj.y = pos.y;
                    obj.boundingHeight = oldBottom - pos.y;
                }
                break;
            case "top-right":
                obj.y = pos.y;
                obj.boundingWidth = pos.x - oldLeft;
                obj.boundingHeight = oldBottom - pos.y;
                obj.fontSize = adjustFontSizeToFitBox(obj);
                break;
            case "right-middle":
                // Prevent reducing width below widest line (instead of max text width)
                if (pos.x - oldLeft >= widestLine) {
                    obj.boundingWidth = pos.x - oldLeft;
                }
                break;
            case "bottom-right":
                obj.boundingWidth = pos.x - oldLeft;
                obj.boundingHeight = pos.y - oldTop;
                obj.fontSize = adjustFontSizeToFitBox(obj);
                break;
            case "bottom-middle":
                // Prevent reducing height below multiline height
                if (pos.y - oldTop >= textHeight) {
                    obj.boundingHeight = pos.y - oldTop;
                }
                break;
            case "bottom-left":
                obj.x = pos.x;
                obj.boundingWidth = oldRight - pos.x;
                obj.boundingHeight = pos.y - oldTop;
                obj.fontSize = adjustFontSizeToFitBox(obj);
                break;
            case "left-middle":
                // Prevent reducing width below the widest line
                if (oldRight - pos.x >= widestLine) {
                    obj.x = pos.x;
                    obj.boundingWidth = oldRight - pos.x;
                }
                break;
        }

        // Enforce minimum bounding box size
        if (obj.boundingWidth < widestLine) obj.boundingWidth = widestLine;
        if (obj.boundingHeight < textHeight) obj.boundingHeight = textHeight;

        drawCanvas("Common");
    }

    if (isDragging && currentSelectedText()) {
        const obj = currentSelectedText();
        obj.x = pos.x - dragOffset.x;
        obj.y = pos.y - dragOffset.y;
        drawCanvas("Common");
    }
});



canvas.addEventListener("mouseup", function () {
    currentDrag = null;
    isResizing = false;
    isDragging = false;
    activeHandle = null;
});

canvas.addEventListener("mouseleave", function () {
    currentDrag = null;
    isResizing = false;
    isDragging = false;
    activeHandle = null;
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
                const offsetX = 282;  // adjust if needed
                const offsetY = 45;  // adjust if needed



        // Position the text editor over the object's bounding box.
        textEditor.style.left = `${rect.left + editorX - offsetX}px`;
        textEditor.style.top = `${rect.top + editorY + scrollTop  - offsetY}px`;
        //textEditor.style.left = `${rect.left + editorX}px`;
        //textEditor.style.top = `${rect.top + editorY}px`;
        textEditor.style.width = `${obj.boundingWidth + 2 * padding}px`;
        textEditor.style.height = `${obj.boundingHeight + 2 * padding}px`;

        // Match styles with the text object.
        textEditor.style.fontSize = `${obj.fontSize}px`;
        textEditor.style.fontFamily = obj.fontFamily;
        textEditor.style.color = obj.textColor;
        textEditor.style.textAlign = obj.textAlign;
        textEditor.style.background = "rgba(255,255,255,0.95)";
        textEditor.style.border = "1px solid #ccc";
        textEditor.style.padding = "2px 4px";
        textEditor.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.3)";

        // Set the current text and show the editor.
        textEditor.value = obj.text;
        textEditor.style.display = "block";
        textEditor.focus();

        // Finish editing when Enter is pressed (unless using Shift+Enter for a new line) or on blur.
        //function finishEditing() {
        //    obj.text = textEditor.value;
        //    obj.editing = false;
        //    textEditor.style.display = "none";
        //    drawCanvas('Common'); // Redraw canvas with updated text
        //    textEditor.removeEventListener("keydown", onKeyDown);
        //    textEditor.removeEventListener("blur", finishEditing);
        //}
        function finishEditing() {
            // Preserve the edited text (with newlines)
            obj.text = textEditor.value;
            obj.editing = false;
            textEditor.style.display = "none";

            const ctx = canvas.getContext("2d");
            ctx.font = `${obj.fontSize}px ${obj.fontFamily}`;

            // Extra padding values.
            const extraWidth = 15;  // total extra width (both sides)
            const extraHeight = 20; // total extra height (both sides)

            // Define a margin from the canvas edge (so box won't be flush with canvas border).
            const canvasMargin = 20;

            // Determine the available width from the object's x position.
            const availableWidth = canvas.width - obj.x - canvasMargin;

            // Initially wrap text with the object's current bounding width (minus padding).
            let lines = wrapText(ctx, obj.text, obj.boundingWidth - 2 * padding);
            let maxLineWidth = 0;
            lines.forEach(line => {
                const w = ctx.measureText(line).width;
                if (w > maxLineWidth) maxLineWidth = w;
            });

            // If the computed bounding width (maxLineWidth + extraWidth) exceeds available width,
            // then re-wrap the text using the availableWidth as the new maximum.
            if (maxLineWidth + extraWidth > availableWidth) {
                lines = wrapText(ctx, obj.text, availableWidth - extraWidth);
                maxLineWidth = 0;
                lines.forEach(line => {
                    const w = ctx.measureText(line).width;
                    if (w > maxLineWidth) maxLineWidth = w;
                });
            }

            // Calculate total height based on the number of lines.
            const lineHeight = obj.fontSize * 1.2;
            const totalTextHeight = lines.length * lineHeight;

            // Update the object's bounding dimensions.
            // Ensure the bounding width does not exceed available width.
            obj.boundingWidth = Math.min(maxLineWidth + extraWidth, availableWidth);
            obj.boundingHeight = totalTextHeight + extraHeight;

            drawCanvas('Common'); // Redraw canvas with updated text and bounding box

            textEditor.removeEventListener("keydown", onKeyDown);
            textEditor.removeEventListener("blur", finishEditing);
        }


        function onKeyDown(e) {
            if (e.key === "Enter" && !e.shiftKey) {
                finishEditing();
            }
        }

        textEditor.addEventListener("keydown", onKeyDown);
        textEditor.addEventListener("blur", finishEditing);
    }
});

//canvasContainer.addEventListener("dblclick", function (e) {
//    const rect = canvas.getBoundingClientRect();
//    const mouseX =e.clientX - rect.left;
//    const mouseY = e.clientY - rect.top;
//    const obj = getTextObjectAt(mouseX, mouseY);

//    if (obj) {
//        obj.editing = true;

//        // Set the canvas font to match the text object for accurate measurement
//        ctx.font = `${obj.fontSize}px ${obj.fontFamily}`;
//        const metrics = ctx.measureText(obj.text);
//        const textWidth = metrics.width;
//        const ascent = metrics.actualBoundingBoxAscent || obj.fontSize * 0.8;
//        const descent = metrics.actualBoundingBoxDescent || obj.fontSize * 0.2;
//        const textHeight = ascent + descent;

//        // Determine the correct X position based on text alignment
//        let editorX;
//        if (obj.textAlign === "center") {
//            editorX = obj.x - textWidth / 2;
//        } else if (obj.textAlign === "right") {
//            editorX = obj.x - textWidth;
//        } else {
//            editorX = obj.x;
//        }
//        const offsetX = 282;  // adjust if needed
//        const offsetY = 13;  // adjust if needed

//        // Position the text editor exactly over the original text
//        textEditor.style.left = `${rect.left + editorX - offsetX}px`;
//        textEditor.style.top = `${rect.top + obj.y + scrollTop - ascent - offsetY}px`;
//        textEditor.style.width = `${textWidth + 10}px`; // Slight padding for better visibility
//        textEditor.style.height = `${textHeight}px`;

//        // Match styles with the text object
//        textEditor.style.fontSize = `${obj.fontSize}px`;
//        textEditor.style.fontFamily = obj.fontFamily;
//        textEditor.style.color = obj.textColor;
//        textEditor.style.textAlign = obj.textAlign;
//        textEditor.style.background = "rgba(255,255,255,0.95)";
//        textEditor.style.border = "1px solid #ccc";
//        textEditor.style.padding = "2px 4px";
//        textEditor.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.3)";

//        // Set the text and display the input box
//        textEditor.value = obj.text;
//        textEditor.style.display = "block";
//        textEditor.focus();

//        // Handle finishing editing
//        function finishEditing() {
//            obj.text = textEditor.value;
//            obj.editing = false;
//            textEditor.style.display = "none";
//            drawCanvas('Common'); // Redraw canvas with updated text
//            textEditor.removeEventListener("keydown", onKeyDown);
//            textEditor.removeEventListener("blur", finishEditing);
//        }

//        function onKeyDown(e) {
//            if (e.key === "Enter") {
//                finishEditing();
//            }
//        }

//        textEditor.addEventListener("keydown", onKeyDown);
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

textEditor.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        textEditor.blur();
    }
});

const colorPicker = document.getElementById("favcolor");
function ChangeColor() {
    $("#hdnTextColor").val(colorPicker.value);
    const textColor = document.getElementById("hdnTextColor").value; // Text color from dropdown 
    const Obj = textObjects.find(obj => obj.selected);
    if (Obj) {
        Obj.textColor = textColor || 'black';
    }
    drawCanvas('ChangeStyle');
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
document.getElementById('ddlSpeedControl').addEventListener('click', function (event) {
    if (event.target.matches('a.dropdown-item')) {
        // Retrieve the 'value' attribute from the clicked dropdown item.
        selectedInSpeed = event.target.getAttribute('value');
        document.getElementById('lblSpeed').textContent = event.target.textContent;
    }
});

document.getElementById('ddlSecondsControl').addEventListener('click', function (event) {
    if (event.target.matches('a.dropdown-item')) {
        // Retrieve the 'value' attribute from the clicked dropdown item.
        selectedStaySpeed = event.target.getAttribute('value');
        document.getElementById('lblSeconds').textContent = event.target.textContent;
    }
});

document.getElementById('ddlOutSpeedControl').addEventListener('click', function (event) {
    if (event.target.matches('a.dropdown-item')) {
        // Retrieve the 'value' attribute from the clicked dropdown item.
        selectedOutSpeed = event.target.getAttribute('value');
        document.getElementById('lblOutSpeed').textContent = event.target.textContent;
    }
});

//Calculate scroll height that travell
canvasContainer.addEventListener("scroll", function () {
    scrollTop = canvasContainer.scrollTop;
});