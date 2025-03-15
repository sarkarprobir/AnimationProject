const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const contextMenu = document.getElementById("contextMenu");
let selectedSpeed = null;
let scrollTop = 0;
// Global variables
let image = null;
let recordedChunks = [];
let text = $("#textInput").val();
let textPosition = { x: 100, y: 100, opacity: 1, content: text, }; // Default start position
let imagePosition = { x: 100, y: 20, scaleX: 1, scaleY: 1, opacity: 1, }; // Default start position

/////this is for add multiple text

const textEditor = document.getElementById("textEditor");
const addTextBtn = document.getElementById("addTextBtn");

// Settings for text style
const fontSize = 35;
const fontFamily = "Arial";
const textColor = "black";

// Array to hold our text objects
// Each text object will have: text, x, y, selected, editing
let textObjects = [];

// For dragging state
let currentDrag = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

////////end
////This is for delete text///////////////////
// Utility: Returns an object (text or image) if the (x,y) falls within its bounding box.
function getObjectAt(x, y) {
    // Check text objects.
    for (let obj of textObjects) {
        ctx.font = `${obj.fontSize}px ${obj.fontFamily}`;
        let width = ctx.measureText(obj.text).width;
        // Assuming y is the baseline, top is approximately y - fontSize.
        if (x >= obj.x && x <= obj.x + width && y >= obj.y - obj.fontSize && y <= obj.y) {
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

let selectedForContextMenu = null;
let selectedType = null; // "text" or "image"

// Show dynamic context menu on right-click.
canvas.addEventListener("contextmenu", function (e) {
    e.preventDefault(); // Prevent default browser context menu

    // Get mouse coordinates relative to the canvas container.
    const rect = canvas.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    const found = getObjectAt(offsetX, offsetY);
    if (found) {
        selectedForContextMenu = found.obj;
        selectedType = found.type;
        // Position the context menu dynamically within the canvas container.
        contextMenu.style.left = offsetX + "px";
        contextMenu.style.top = offsetY + "px";
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

    // Create a diagonal gradient for the stroke.
    const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
    gradient.addColorStop(0, "#FF7F50");  // Coral
    gradient.addColorStop(1, "#FFD700");  // Gold

    // Apply stylish effects: gradient stroke, thicker line, and shadow.
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 3;
    // Make the border solid by clearing any dash settings.
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

    // Draw Image (if any image exists)
    if (image) {
        ctx.save(); // Save the current canvas state
        ctx.globalAlpha = imagePosition.opacity || 1; // Apply opacity to the image

        // Apply scaling if scaleX and scaleY exist
        const scaleX = imagePosition.scaleX || 1;
        const scaleY = imagePosition.scaleY || 1;

        // Translate to the image's position for scaling
        ctx.translate(imagePosition.x, imagePosition.y);
        ctx.scale(scaleX, scaleY);
        ctx.drawImage(image, imagePosition.x, imagePosition.y, 650, 650);
        ctx.restore(); // Restore canvas state
    }
   
    





    ctx.save(); // Save canvas state for text
    ctx.globalAlpha = textPosition.opacity || 1; // Apply text opacity

    //const fontSize = document.getElementById("fontSize").value; // Font size from dropdown
    //const fontFamily = document.getElementById("fontFamily").value; // Font family from dropdown
    //const textColor = document.getElementById("hdnTextColor").value; // Text color from dropdown 
    //const textAlign = document.getElementById("textAlign").value; // Text alignment from dropdown

    //const selectedObj = textObjects.find(obj => obj.selected);
    //if (selectedObj) {
    //    selectedObj.fontSize = fontSize;
    //    selectedObj.fontFamily = fontFamily || 'Arial';
    //    selectedObj.textColor = textColor || 'black';
    //    selectedObj.textAlign = textAlign || 'left';
    //}

    if (condition === 'Common' || condition === 'ChangeStyle') {
        textObjects.forEach(obj => {
            ctx.save(); 
            // If the object is selected, draw the red bounding box on top of the text.
            if (obj.selected) {
                //const textWidth = ctx.measureText(obj.text).width;
                //ctx.strokeStyle = "red";
                //ctx.strokeRect(obj.x, obj.y - obj.fontSize, textWidth, obj.fontSize);
                // Inside your drawCanvas (or similar) function when drawing selected text:
                ctx.font = `${obj.fontSize}px ${obj.fontFamily}`;
                ctx.fillStyle = obj.textColor;
                ctx.textAlign = obj.textAlign || "left";
                const metrics = ctx.measureText(obj.text);
                const textWidth = metrics.width;

                // Compute the left side of the bounding box based on the text alignment.
                let boxX;
                if (obj.textAlign === "center") {
                    boxX = obj.x - textWidth / 2;
                } else if (obj.textAlign === "right") {
                    boxX = obj.x - textWidth;
                } else { // "left" (or undefined)
                    boxX = obj.x;
                }

                // Use text metrics if available for vertical measurements.
                const ascent = ('actualBoundingBoxAscent' in metrics)
                    ? metrics.actualBoundingBoxAscent
                    : obj.fontSize * 0.8;
                const descent = ('actualBoundingBoxDescent' in metrics)
                    ? metrics.actualBoundingBoxDescent
                    : obj.fontSize * 0.2;
                const textHeight = ascent + descent;

              
                const padding =5; // Adjust padding as needed

                // Draw a rounded rectangle around the text.
                drawRoundedRect(
                    ctx,
                    boxX - padding,
                    obj.y - ascent - padding,
                    textWidth + 2 * padding,
                    textHeight + 2 * padding,
                    5  // Corner radius
                );
            }
            ctx.font = `${obj.fontSize}px ${obj.fontFamily}`;
            ctx.fillStyle = obj.textColor;
            ctx.textAlign = obj.textAlign || "left";
            // Draw the text.
            ctx.fillText(obj.text, obj.x, obj.y);
            ctx.restore();
        });
    }
   // if (condition === 'applyAnimations') {
        //const textToRender = ($("#textAnimation option:selected").val() === "typeText")
        //    ? textPosition.content
        //    : text;
        //const textPositionX = ($("#textAnimation option:selected").val() === "typeText")
        //    ? 300
        //    : textPosition.x;
        //const textPositionY = ($("#textAnimation option:selected").val() === "typeText")
        //    ? 100
        //    : textPosition.y;

        ////textPosition.x = obj.x;
        ////textPosition.y = obj.y;
        //ctx.fillText(textToRender, textPositionX, textPositionY); // Draw the text
        //ctx.restore(); // Restore canvas state
    //}
    if (condition === 'applyAnimations') {
        textObjects.forEach(obj => {
            textPosition.content = obj.text;
            //textPosition.x = obj.x;
            //textPosition.y = obj.y;
                    text = obj.text;
            const textToRender = ($("#hdnTextAnimationType").val() === "typeText")
                    ? textPosition.content
                    : text;
            const textPositionX = ($("#hdnTextAnimationType").val() === "typeText")
                    ? 300
                    : textPosition.x;
            const textPositionY = ($("#hdnTextAnimationType").val() === "typeText")
                    ? 100
                    : textPosition.y;
            ctx.font = `${obj.fontSize}px ${obj.fontFamily}`;
            ctx.fillStyle = obj.textColor;
            ctx.textAlign = obj.textAlign || "left";
                    //textPosition.x = obj.x;
                    //textPosition.y = obj.y;
            ctx.fillText(obj.text, obj.x, obj.y); // Draw the text
               // ctx.restore(); // Restore canvas state
        });
   }

    // Reset opacity and transformations to ensure no impact on subsequent drawings
    ctx.globalAlpha = 1;

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
    const fontSize = document.getElementById("fontSize").value; // Font size from dropdown
    const Obj = textObjects.find(obj => obj.selected);
    if (Obj) {
        Obj.fontSize = fontSize;
    }
    drawCanvas('ChangeStyle');
}
function ChangeAlignStyle(value) {
    $("#textAlign").val(value);
    const textAlign = document.getElementById("textAlign").value; // Text alignment from dropdown

    const Obj = textObjects.find(obj => obj.selected);
    if (Obj) {
        Obj.textAlign = textAlign || 'left';
    }
    drawCanvas('ChangeStyle');
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
function animateTextold(condition) {
    const startX = parseInt(document.getElementById("textStartX").value);
    const startY = parseInt(document.getElementById("textStartY").value);
    const endX = parseInt(document.getElementById("textEndX").value);
    const endY = parseInt(document.getElementById("textEndY").value);
    const animationType = document.getElementById("textAnimation").value;

    textObjects.forEach(obj => {
        // Optionally set each text object's starting position.
        text = obj.text;
        textPosition.content = obj.text;
        obj.x = startX;
        obj.y = startY;

        if (animationType === "linear") {
            gsap.to(obj, {
                x: endX,
                y: endY,
                duration: 2,
                ease: "power1.inOut",
                onUpdate: function () {
                    drawCanvas(condition);
                }
            });
        } else if (animationType === "elastic") {
            gsap.to(obj, {
                x: endX,
                y: endY,
                duration: 2.5,
                ease: "elastic.out(1, 0.3)",
                onUpdate: function () {
                    drawCanvas(condition);
                }
            });
        } else if (animationType === "wave") {
            // Use a separate ticker for the wave effect on each object.
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
                    onUpdate: function () { drawCanvas(condition); }
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
                    onUpdate: function () { drawCanvas(condition); }
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
                    onUpdate: function () { drawCanvas(condition); }
                }
            );
        } else if (animationType === "bounce") {
            gsap.to(obj, {
                x: endX,
                y: endY,
                duration: 2,
                ease: "bounce.out",
                onUpdate: function () { drawCanvas(condition); }
            });
        } else if (animationType === "spiral") {
            gsap.to(obj, {
                duration: 3,
                motionPath: {
                    path: [
                        { x: startX, y: startY },
                        { x: endX - 50, y: endY - 50 },
                        { x: endX, y: endY }
                    ],
                    autoRotate: true
                },
                ease: "power2.inOut",
                onUpdate: function () { drawCanvas(condition); }
            });
        } else if (animationType === "fadeText") {
            gsap.fromTo(
                obj,
                { x: startX, y: startY, opacity: 0 },
                {
                    x: endX,
                    y: endY,
                    opacity: 1,
                    duration: 2,
                    ease: "power2.inOut",
                    onUpdate: function () { drawCanvas(condition); },
                    onComplete: () => {
                        gsap.to(obj, {
                            opacity: 1,
                            duration: 2,
                            onUpdate: function () { drawCanvas(condition); }
                        });
                    }
                }
            );
        } else if (animationType === "typeText") {
            // For typing effect, assume each object stores its full text in obj.fullText.
            // Start with an empty text.
            obj.fullText = obj.fullText || obj.text;
            obj.text = "";
            gsap.to(obj, {
                duration: obj.fullText.length * 0.15,
                ease: "power2.inOut",
                onUpdate: function () {
                    const progress = Math.ceil(this.progress() * obj.fullText.length);
                    obj.text = obj.fullText.slice(0, progress);
                    drawCanvas(condition);
                }
            });
        } else if (animationType === "morphText") {
            gsap.to(obj, {
                x: endX,
                y: endY,
                duration: 2.5,
                ease: "elastic.out(1, 0.3)",
                onUpdate: function () { drawCanvas(condition); },
                repeat: 1,
                yoyo: true
            });
        }
    });
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


        if (animationType === "linear") {
            gsap.to(obj, {
                x: endX,
                y: endY,
                duration: parseFloat(selectedSpeed) || 2,
                ease: "power1.inOut",
                onUpdate: () => drawCanvas(condition),
            });
        } else if (animationType === "elastic") {
            gsap.to(obj, {
                x: endX,
                y: endY,
                duration: parseFloat(selectedSpeed) || 2.5,
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
            gsap.to(obj, {
                x: endX,
                y: endY,
                duration: parseFloat(selectedSpeed) || 2,
                ease: "bounce.out",
                onUpdate: () => drawCanvas(condition),
            });
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


function textAnimationClick(type) {
    $("#hdnTextAnimationType").val(type);
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
// JavaScript
////KD//////////////////////////////////////////
//document.getElementById("saveButton").addEventListener("click", () => {
//    const savedState = saveCanvasState();
//    console.log("Canvas State Saved:", savedState);
//});
////END////////////////////////////


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
function setCoordinate(direction, imageStartX, imageStartY, imageEndX, imageEndY) {
    //document.getElementById("textStartX").value = textStartX;
    //document.getElementById("textStartY").value = textStartY;
    //document.getElementById("textEndX").value = textEndX;
    //document.getElementById("textEndY").value = textEndY;
   // document.getElementById("textAnimation").value = $("#hdnTextAnimationType").val();
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
        selected: false,
        editing: false,
        fontFamily: "Arial",     // Default font family
        textColor: "#000000",    // Default text color (black)
        textAlign: "left",        // Default text alignment
        fontSize: 35
    };
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
        ctx.font = `${obj.fontSize}px Arial`;
        const metrics = ctx.measureText(obj.text);
        const textWidth = metrics.width;
        let boxX;
        if (obj.textAlign === "center") {
            boxX = obj.x - textWidth / 2;
        } else if (obj.textAlign === "right") {
            boxX = obj.x - textWidth;
        } else {
            boxX = obj.x;
        }
        const ascent = ("actualBoundingBoxAscent" in metrics)
            ? metrics.actualBoundingBoxAscent
            : obj.fontSize * 0.8;
        const descent = ("actualBoundingBoxDescent" in metrics)
            ? metrics.actualBoundingBoxDescent
            : obj.fontSize * 0.2;
        if (x >= boxX && x <= boxX + textWidth && y >= obj.y - ascent && y <= obj.y + descent) {
            return obj;
        }
    }
    return null;
}


// Mouse events for dragging and selection
canvas.addEventListener("mousedown", function (e) {

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // If the text editor is active, ignore this event
    if (document.activeElement === textEditor) return;

    const obj = getTextObjectAt(mouseX, mouseY);
    if (obj) {
        // Deselect others and select this object
        textObjects.forEach(o => o.selected = false);
        obj.selected = true;
        // Bring the selected object to the front
        textObjects.splice(textObjects.indexOf(obj), 1);
        textObjects.push(obj);

        // Setup dragging for this object
        currentDrag = obj;
        dragOffsetX = mouseX - obj.x;
        dragOffsetY = mouseY - obj.y;
    } else {
        // Clicked outside any text, so deselect all
        textObjects.forEach(o => o.selected = false);
    }
    drawCanvas('Common');
});

canvas.addEventListener("mousemove", function (e) {
    if (currentDrag) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        currentDrag.x = mouseX - dragOffsetX;
        currentDrag.y = mouseY - dragOffsetY;
        drawCanvas('Common');
    }
});

canvas.addEventListener("mouseup", function () {
    currentDrag = null;
});

canvas.addEventListener("mouseleave", function () {
    currentDrag = null;
});

// On double-click, if over a text object, enable editing
//canvas.addEventListener("dblclick", function (e) {
//    const rect = canvas.getBoundingClientRect();
//    const mouseX = e.clientX - rect.left;
//    const mouseY = e.clientY - rect.top;
//    const obj = getTextObjectAt(mouseX, mouseY);
//    if (obj) {
//        obj.editing = true;
//        // Position the text editor input over the text object
//        textEditor.style.left = obj.x + "px";
//        textEditor.style.top = (obj.y - fontSize) + "px";
//        textEditor.style.width = ctx.measureText(obj.text).width + "px";
//        textEditor.value = obj.text;
//        textEditor.style.display = "block";
//        textEditor.focus();
//    }
//});
const canvasContainer = document.getElementById("canvasContainer");

canvasContainer.addEventListener("dblclick", function (e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX =e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const obj = getTextObjectAt(mouseX, mouseY);

    if (obj) {
        obj.editing = true;

        // Set the canvas font to match the text object for accurate measurement
        ctx.font = `${obj.fontSize}px ${obj.fontFamily}`;
        const metrics = ctx.measureText(obj.text);
        const textWidth = metrics.width;
        const ascent = metrics.actualBoundingBoxAscent || obj.fontSize * 0.8;
        const descent = metrics.actualBoundingBoxDescent || obj.fontSize * 0.2;
        const textHeight = ascent + descent;

        // Determine the correct X position based on text alignment
        let editorX;
        if (obj.textAlign === "center") {
            editorX = obj.x - textWidth / 2;
        } else if (obj.textAlign === "right") {
            editorX = obj.x - textWidth;
        } else {
            editorX = obj.x;
        }
        const offsetX = 282;  // adjust if needed
        const offsetY = 43;  // adjust if needed

        // Position the text editor exactly over the original text
        textEditor.style.left = `${rect.left + editorX - offsetX}px`;
        textEditor.style.top = `${rect.top + obj.y + scrollTop - ascent - offsetY}px`;
        textEditor.style.width = `${textWidth + 10}px`; // Slight padding for better visibility
        textEditor.style.height = `${textHeight}px`;

        // Match styles with the text object
        textEditor.style.fontSize = `${obj.fontSize}px`;
        textEditor.style.fontFamily = obj.fontFamily;
        textEditor.style.color = obj.textColor;
        textEditor.style.textAlign = obj.textAlign;
        textEditor.style.background = "rgba(255,255,255,0.95)";
        textEditor.style.border = "1px solid #ccc";
        textEditor.style.padding = "2px 4px";
        textEditor.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.3)";

        // Set the text and display the input box
        textEditor.value = obj.text;
        textEditor.style.display = "block";
        textEditor.focus();

        // Handle finishing editing
        function finishEditing() {
            obj.text = textEditor.value;
            obj.editing = false;
            textEditor.style.display = "none";
            drawCanvas('Common'); // Redraw canvas with updated text
            textEditor.removeEventListener("keydown", onKeyDown);
            textEditor.removeEventListener("blur", finishEditing);
        }

        function onKeyDown(e) {
            if (e.key === "Enter") {
                finishEditing();
            }
        }

        textEditor.addEventListener("keydown", onKeyDown);
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
        selectedSpeed = event.target.getAttribute('value');
        document.getElementById('lblSpeed').textContent = event.target.textContent;
    }
});

document.getElementById('ddlSecondsControl').addEventListener('click', function (event) {
    if (event.target.matches('a.dropdown-item')) {
        // Retrieve the 'value' attribute from the clicked dropdown item.
        selectedSpeed = event.target.getAttribute('value');
        document.getElementById('lblSeconds').textContent = event.target.textContent;
    }
});
//Calculate scroll height that travell
canvasContainer.addEventListener("scroll", function () {
    scrollTop = canvasContainer.scrollTop;
});