let selectedInSpeed = null;
let selectedStaySpeed = null;
let selectedOutSpeed = null;

let scrollTop = 0;
let image = null;
let recordedChunks = [];
let text = '';
let textPosition = { x: 100, y: 100, opacity: 1, content: text, }; // Default start position
let imagePosition = { x: 100, y: 20, scaleX: 1, scaleY: 1, opacity: 1, }; // Default start position

/////this is for add multiple text
const textEditor = '';
const addTextBtn = '';

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




//Common function

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

function animateTextBoard(direction, condition, loopCount, direction, effect) {
    const animationType = effect;
    textObjects.forEach(obj => {

        // Save the object's final position.
        const endX = obj.x;
        const endY = obj.y;
        let startX, startY;

        // Determine starting position based on the chosen direction.
        switch (direction) {
            case "top":
                startX = endX;           // same x as final
                startY = - (obj.boundingHeight + 5);   // Place the object fully above the canvas:
                break;
            case "bottom":
                startX = endX;           // same x as final
                startY = canvas.height + 5;  // Place the object fully below the canvas:
                break;
            case "left":
                startX = - (obj.boundingWidth + 5); // Place the object fully to the left of the canvas:
                startY = endY;           // same y as final
                break;
            case "right":
                startX = canvas.width + 5;   // Place the object fully to the right of the canvas:
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
                repeat: loopCount - 1, // loops = initial + (loopCount - 1) repeats
                onUpdate: function () {
                    drawCanvasBoard(condition);
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
                duration: 0,
                ease: "power1.inOut",
                onUpdate: () => drawCanvasBoard(condition),
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
                onUpdate: drawCanvasBoard,
            });
        } else if (animationType === "wave") {
            let angle = 0;
            gsap.ticker.add(() => {
                obj.x = startX + (endX - startX) * 0.5 + Math.sin(angle) * 100;
                obj.y = startY + (endY - startY) * 0.5;
                drawCanvasBoard(condition);
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
                    onUpdate: drawCanvasBoard,
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
                    onUpdate: drawCanvasBoard,
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
                    onUpdate: drawCanvasBoard,
                }
            );
        } else if (animationType === "bounce") {

            ////This section is for in out and stay
            let tl = gsap.timeline({
                repeat: loopCount - 1,
                onUpdate: function () {
                    drawCanvasBoard(condition);
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
                onUpdate: () => drawCanvasBoard(condition),
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
                onUpdate: drawCanvasBoard,
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
                    onUpdate: drawCanvasBoard, // Updates canvas on every frame
                    onComplete: () => {
                        // Fade out after a delay
                        gsap.to(obj, {
                            opacity: 1,
                            duration: 2,
                            //delay: 2,
                            onUpdate: drawCanvasBoard,
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
                    drawCanvasBoard(condition);  // Redraw the canvas at each update
                },
            });

        }
        else if (animationType === "morphText") {
            gsap.to(obj, {
                x: endX,  // You can use any values for endX and endY
                y: endY,  // Similarly, endY for vertical position change
                duration: 2.5,
                ease: "elastic.out(1, 0.3)",  // Apply easing for a bounce effect
                onUpdate: drawCanvasBoard,  // Redraw the canvas on each update
                repeat: 1,  // Repeat the animation once (total of 2 times)
                yoyo: true,  // Make the animation reverse after completing
                onComplete: function () {
                }
            });


        }
    });

    // ----- IMAGE ANIMATION SECTION -----
    images.forEach(imgObj => {
        // Save the image's final (target) position.
        const endX = imgObj.x;
        const endY = imgObj.y;
        let startX, startY;

        // Calculate displayed dimensions using scale factors.
        const dispWidth = imgObj.width * (imgObj.scaleX || 1);
        const dispHeight = imgObj.height * (imgObj.scaleY || 1);

        // Determine starting position based on the chosen direction.
        switch (direction) {
            case "top":
                startX = endX;  // same x as final
                startY = -(dispHeight + 5);   // image fully above canvas
                break;
            case "bottom":
                startX = endX;  // same x as final
                startY = canvas.height + 5;  // image fully below canvas
                break;
            case "left":
                startX = -(dispWidth + 5); // image fully to the left
                startY = endY;  // same y as final
                break;
            case "right":
                startX = canvas.width + 5; // image fully to the right
                startY = endY;  // same y as final
                break;
            default:
                startX = endX;
                startY = endY;
        }

        // Set the image's starting position.
        imgObj.x = startX;
        imgObj.y = startY;

        // Timing settings for images (using the same global speeds as text).
        const inTime = parseFloat(selectedInSpeed) || 3;
        const stayTime = parseFloat(selectedStaySpeed) || 6;
        const outTime = parseFloat(selectedOutSpeed) || 2;
        const exitX = window.innerWidth;  // exit to right (example)
        const exitY = endY;               // maintain same vertical position.

        let tl = gsap.timeline({
            repeat: loopCount - 1,
            onUpdate: function () {
                drawCanvasBoard(condition);
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
                onUpdate: () => drawCanvasBoard(condition)
            });
        } else if (animationType === "bounce") {
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
                onUpdate: () => drawCanvasBoard(condition)
            });
        }
    });

}

function loadCanvasFromJsonForBoards(canvasId, jsonData, condition, direction, effect) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext("2d");

    // Clear the canvas first.
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // If no JSON data, simply call drawCanvas with default settings.
    if (!jsonData) {
        drawCanvasBoard(canvasId, condition, direction, effect);
        return;
    }

    try {
        // Parse the JSON string.
        var data = jsonData;//JSON.parse(jsonData);
        // Set the canvas background color.
        canvasBgColor = data.canvasBgColor || "#ffffff";
        // Fill the canvas with the background color.
        canvas.style.backgroundColor = canvasBgColor;
        // Load the background image, if provided.
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
        function checkAllImagesLoaded() {
            // If there is a background image, wait for it as well.
            var bgLoaded = true;
            if (canvas.bgImage) {
                bgLoaded = canvas.bgImage.complete;
            }
            if (imageLoadCount >= totalImages && bgLoaded) {
                // Once all images are loaded, call drawCanvas.
                drawCanvasBoard(canvasId, condition, direction, effect);
            }
        }

        // Process each image in the JSON.
        if (data.images && data.images.length) {
            data.images.forEach(function (imgObj) {
                // Clone the image object data.
                var newImgObj = Object.assign({}, imgObj);
                // Create an HTMLImageElement for this image.
                var imgElement = new Image();
                // Check if the source is inline SVG (starts with '<') 
                // or a URL.
                if (imgObj.src.trim().charAt(0) === "<") {
                    // Create a blob URL for the inline SVG.
                    var blob = new Blob([imgObj.src], { type: "image/svg+xml" });
                    imgElement.src = URL.createObjectURL(blob);
                } else {
                    imgElement.src = imgObj.src;
                }
                // Assign the loaded image to a new property.
                newImgObj.img = imgElement;

                // When the image loads, increment our counter.
                imgElement.onload = function () {
                    imageLoadCount++;
                    checkAllImagesLoaded();
                };
                imgElement.onerror = function () {
                    console.error("Error loading image", imgObj.src);
                    imageLoadCount++;
                    checkAllImagesLoaded();
                };

                images.push(newImgObj);
            });
        } else {
            // No images in JSON.
            checkAllImagesLoaded();
        }

        // If there is a background image, set up its onload.
        if (canvas.bgImage) {
            canvas.bgImage.onload = function () {
                checkAllImagesLoaded();
            };
            canvas.bgImage.onerror = function () {
                console.error("Error loading canvas background image", data.canvasBgImage);
                // If error, nullify background image.
                canvas.bgImage = null;
                checkAllImagesLoaded();
            };
        } else {
            // No background image; check immediately.
            checkAllImagesLoaded();
        }
    } catch (e) {
        console.error("Error parsing canvas JSON:", e);
        // In case of an error, draw with current values.
        drawCanvasBoard(canvasId, condition, direction, effect);
    }
    
    //animateText('left', 'Common', 5, direction, effect);
    setTimeout(() => {
        animateTextBoard('left', 'Common', 5, direction, effect);
    }, 500); // Delay to ensure elements are ready
}

function drawCanvasBoard(canvasId, condition, direction, effect) {
    const canvas = document.getElementById(canvasId);
  
    if (canvas) {
        const ctx = canvas.getContext("2d");
   
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear entire canvas
    // Draw background image if available.
    if (canvas.bgImage) {
        ctx.drawImage(canvas.bgImage, 0, 0, canvas.width, canvas.height);
    }

    // --- Draw multiple images from the images array ---
    if (images && images.length) {
        images.forEach(imgObj => {
            ctx.save();
            ctx.globalAlpha = imgObj.opacity || 1;
            const scaleX = imgObj.scaleX || 1;
            const scaleY = imgObj.scaleY || 1;
            ctx.translate(imgObj.x, imgObj.y);
            ctx.scale(scaleX, scaleY);
            // Draw the image at (0,0) because translation has already been applied.
            ctx.drawImage(imgObj.img, 0, 0, imgObj.width, imgObj.height);
            ctx.restore();

            // If this image is selected, draw a border and four resize handles.
            if (imgObj.selected) {
                ctx.save();
                ctx.strokeStyle = "blue";
                ctx.lineWidth = 2;
                const dispW = imgObj.width * scaleX;
                const dispH = imgObj.height * scaleY;
                ctx.strokeRect(imgObj.x, imgObj.y, dispW, dispH);
                // Draw handles at the four corners
                const handles = getImageResizeHandles(imgObj); // Make sure this function uses your dynamic dimensions
                ctx.fillStyle = "red";
                handles.forEach(handle => {
                    ctx.fillRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
                });
                ctx.restore();
            }
        });
    }

    ctx.save();
    ctx.globalAlpha = textPosition.opacity || 1; // Apply text opacity

    if (condition === 'Common' || condition === 'ChangeStyle') {
        textObjects.forEach(obj => {
            ctx.save();
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

            // Determine the maximum text width for wrapping.
            const maxTextWidth = obj.boundingWidth - 2 * padding;
            let lines;
            // If the text contains newline characters, use them; otherwise, wrap.
            if (obj.text.indexOf("\n") !== -1) {
                lines = obj.text.split("\n");
            } else {
                lines = wrapText(ctx, obj.text, maxTextWidth);
            }
            const lineHeight = obj.fontSize * 1.2;
            const availableHeight = obj.boundingHeight - 2 * padding;
            const maxLines = Math.floor(availableHeight / lineHeight);
            const startY = obj.y + padding;

            // Draw each line with the correct horizontal offset based on alignment.
            for (let i = 0; i < Math.min(lines.length, maxLines); i++) {
                const line = lines[i];
                const lineWidth = ctx.measureText(line).width;
                let offsetX;
                if (obj.textAlign === "center") {
                    offsetX = obj.x + (obj.boundingWidth - lineWidth) / 2;
                } else if (obj.textAlign === "right") {
                    offsetX = obj.x + obj.boundingWidth - lineWidth - padding;
                } else { // left alignment
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
}