
var activeSlide = 1;  // initially, assume slide 1 is active
var verticalSlide1 = null;
var verticalSlide2 = null;
var verticalSlide3 = null;
var canvasBgColor = null;

let currentIndex = 0;
let videoSaveForOnetime = 1;
let jsonArray = []; // Global array to store JSON objects
const canvasElement = document.getElementById("myCanvasElement");
const ctxElement = canvasElement.getContext("2d");
const stream = canvasElement.captureStream(7); // Capture at 30 fps
const recorder = new MediaRecorder(stream);
const chunks = [];
let publishDownloadcondition = '';

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
//canvasForDownload.width = 1080;
//canvasForDownload.height = 1920;
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
            SlideType: 'Vertical'
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
                    { slideSeq: 1, json: verticalSlide1, hdnField: "#hdnDesignBoardDetailsIdSlide1", slideName: 'Slide-1', effect: "#hdnEffectSlide1", direction: "#hdnDirectiontSlide1", animationVideoPath: "#hdnDesignBoardDetailsIdSlideFilePath1", animationImagePath: "#hdnDesignBoardDetailsIdSlideImageFilePath1" },
                    { slideSeq: 2, json: verticalSlide2, hdnField: "#hdnDesignBoardDetailsIdSlide2", slideName: 'Slide-2', effect: "#hdnEffectSlide2", direction: "#hdnDirectiontSlide2", animationVideoPath: "#hdnDesignBoardDetailsIdSlideFilePath2", animationImagePath: "#hdnDesignBoardDetailsIdSlideImageFilePath2" },
                    { slideSeq: 3, json: verticalSlide3, hdnField: "#hdnDesignBoardDetailsIdSlide3", slideName: 'Slide-3', effect: "#hdnEffectSlide3", direction: "#hdnDirectiontSlide3", animationVideoPath: "#hdnDesignBoardDetailsIdSlideFilePath3", animationImagePath: "#hdnDesignBoardDetailsIdSlideImageFilePath3" }
                ];

                // Function to save/update one slide
                function saveSlide(slide) {
                    // Get current slide detail id from the hidden field
                    var currentDetailId = $(slide.hdnField).val() || defaultId;
                    var currentEffect = $(slide.effect).val() || defaultEffect;
                    var currentDirection = $(slide.direction).val() || defaultDirection;
                    var currentAnimationVideoPath = $(slide.animationVideoPath).val() || defaultAnimationVideoPath;
                    var currentAnimationImagePath = $(slide.animationImagePath).val() || defaultAnimationImagePath;
                    var dataSlide = {
                        DesignBoardDetailsId: currentDetailId,  // if new, this is default, if update, this is the actual id
                        DesignBoardId: $("#hdnDesignBoardId").val(),
                        SlideSequence: slide.slideSeq,
                        JsonFile: slide.json,
                        SlideName: slide.slideName,
                        Effect: currentEffect,
                        Direction: currentDirection,
                        AnimationVideoPath: currentAnimationVideoPath,
                        AnimationImagePath: currentAnimationImagePath
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
            $(`#imageVertical${activeSlide}`)
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
                    //sessionStorage.setItem("leftPanelHtml", document.getElementById("divpanelleft").innerHTML);
                    MessageShow('RedirectToVerticalPageWithQueryString()', 'Design Board saved successfully!', 'success');
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

function RedirectToVerticalPageWithQueryString() {
    // Get the GUID from the hidden field
    var boardId = $("#hdnDesignBoardId").val();
    HideLoader();
    window.location = `${baseURL}Canvas/VerticalIndex?id=${boardId}`;
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
    }
    else if (activeSlide === 2) {
        if ($("#hdnEffectSlide2").val() !== '') {
            document.getElementById("a" + $("#hdnEffectSlide2").val() + "").classList.add("active_effect");
            document.getElementById("a" + $("#hdnDirectiontSlide2").val() + "").classList.add("active_effect");
        }
    }
    else if (activeSlide === 3) {
        if ($("#hdnEffectSlide3").val() !== '') {
            document.getElementById("a" + $("#hdnEffectSlide3").val() + "").classList.add("active_effect");
            document.getElementById("a" + $("#hdnDirectiontSlide3").val() + "").classList.add("active_effect");
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
                rotation: obj.rotation
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
                rotation: imgObj.rotation
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
                if ( Array.isArray(result.designBoardDetailsList) && result.designBoardDetailsList.length > 0) {
                    // Reset global variables first to avoid stale data


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
                        if (value !='')
                            $(`#imageVertical${index + 1}`).attr('src', `${value}`);
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
//function RedirectToVerticalPage(id) {
//    // Use encodeURIComponent for URL safety
//    window.location = `${baseURL}Canvas/VerticalIndex?id=${encodeURIComponent(id)}`;
//}
function RedirectToVerticalPageDirect() {
    // Use encodeURIComponent for URL safety
    window.location = `${baseURL}Canvas/VerticalIndex`;
}
// Restore the canvas from your JSON data
// Modified loadCanvasFromJson with auto-fit (finishEditing) integration
/* Font initialization helper */
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
    // Ensure fonts are ready (on first draw or SPA redraws)
    // Wait for all font families to finish loading (first time or SPA)
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

    //// Preload background image if provided
    //if (data.canvasBgImage) {
    //    slideData._bgImg = new Image();
    //    slideData._bgImg.crossOrigin = 'anonymous';
    //    slideData._bgImg.src = data.canvasBgImage;
    //} else {
    //    slideData._bgImg = null;
    //}
    // Preload background image if provided
    if (data.canvasBgImage) {
        canvas._bgImg = new Image();
        canvas._bgImg.crossOrigin = 'anonymous';
        canvas._bgImg.src = data.canvasBgImage;
    } else {
        canvas._bgImg = null;
    }

    //const fontPromises = (data.text || []).map(obj =>
    //    document.fonts.load(`${obj.fontSize}px ${obj.fontFamily}`)
    //);
    //Promise.all(fontPromises)
    //    .then(() => {
    //        console.warn('Font failed to load:', fontPromises);
    //    })
    //    .catch(err => {
    //        console.warn('Font failed to load:', err);
           
    //    });

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
            setTimeout(() => { GetDesignBoardByIdForDownload('');}, 25000);
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
    //setTimeout(() => {
    //    recorderForDownload.stop(); //HideLoader();
    //}, 30000);
}

function loadNextJson() {
    if (currentIndex < jsonArray.length) {
        const state = jsonArray[currentIndex];

        // Draw the current state into the fixed canvas.
         loadCanvasFromJsonForPublish(state, 'Common');
        //loadCanvasFromJson(state, 'Common');

        // Now trigger the animation using the state's direction and effect.
        // You can modify applyAnimations to also use the effect if needed.
        applyAnimationsforPublish(state.effect,state.direction, 'applyAnimations');
        currentIndex++; // Move to the next JSON object

        // Load next JSON after a delay (adjust the delay as needed)
        setTimeout(loadNextJson, 5000);
    } else {
        console.log("All JSON objects loaded.");
    }
}
function loadNextJsonForDownload() {
    if (currentIndexForDownload < jsonArray.length) {
        const state = jsonArray[currentIndexForDownload];

        // Draw the current state into the fixed canvas.
         loadCanvasFromJsonForDownload(state, 'Common');
        //loadCanvasFromJson(state, 'Common');
        console.log("Canvas State Loaded:", state);

        // Now trigger the animation using the state's direction and effect.
        // You can modify applyAnimations to also use the effect if needed.
        applyAnimationsforDownload(state.effect, state.direction, 'applyAnimations', state);

        currentIndexForDownload++; // Move to the next JSON object

        // Load next JSON after a delay (adjust the delay as needed) + parseFloat(selectedOutSpeed) || 4
        const inTime = parseFloat(selectedInSpeed) || 4;
        const stayTime = parseFloat(selectedStaySpeed) || 3;
        const outTime = parseFloat(selectedStaySpeed) || 4;
        const slideExecutionTime = inTime + stayTime+3 + outTime;//stayTime +

        setTimeout(loadNextJsonForDownload, slideExecutionTime*1000 || 7000);
    } else {
        console.log("All JSON objects loaded.");
        recorderForDownload.stop(); //HideLoader();
    }
}

function applyAnimationsforPublish(animationType, direction, conditionValue) {
    // Start recording before starting your GSAP animation
   /* recorder.start();*/
    // Redraw the static parts.
    drawCanvasPublish(conditionValue);

    // Now, call animateText (or your own animation logic)
    // This function should update positions of text/images inside the canvas.
    animateTextForPublish(animationType, direction, conditionValue, parseInt($("#hdnlLoopControl").val()) || 1);
     // Later, when you want to stop recording (e.g., after the animation completes)
    //setTimeout(() => {
    //    recorder.stop();
    //}, 5000);
}
recorder.ondataavailable = (e) => chunks.push(e.data);
// Example usage inside your MediaRecorder's onstop callback
recorder.onstop = () => {
    const blob = new Blob(chunks, { type: 'video/mp4; codecs=vp9' });

    // Determine if it's edit mode or save mode.
    // If 'existingFolderId' is defined, it indicates edit mode.
    // Otherwise, use null for save mode.
    const existingFolderId = $(`#hdnDesignBoardDetailsIdSlide${activeSlide}`).val() || 'new';


    // Call the upload function with the blob and folder ID (if any)
    uploadVideo(blob, existingFolderId,  currentIndex);
};
function applyAnimationsforDownload(animationType, direction, conditionValue, state) {
    drawCanvasForDownload(conditionValue);
    animateTextForDownload(animationType, direction, conditionValue, parseInt($("#hdnlLoopControl").val()) || 1, state);
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
    //const canvas = document.getElementById("myCanvasElementDownload");
   // const ctxElement = canvasElement.getContext("2d");
    // Ensure your canvas is set to 1920 x 1080 if you need HD quality.
    canvasForDownload.width = 1920;
    canvasForDownload.height = 1080;

    //const stream = canvasForDownload.captureStream(30); // Capture 30 fps from the canvas

    // Use a MIME type that is widely supported. Here, we use WebM with VP9.
    //const options = {
    //    mimeType: 'video/webm; codecs=vp9',
    //    videoBitsPerSecond: 5000000  // 5 Mbps; adjust as needed
    //};

    //const recorder = new MediaRecorder(streamForDownload, options);
    //const chunks = [];
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
                        // triggerAutorefresh();
                        //Need to remove as this is temporary
                        hideDownloadPanel();
                        HideLoader();
                        const targetUrl = window.location.origin + "/Canvas/VScreen1/1";
                        window.open(targetUrl, "_blank");
                        RedirectToVerticalPageWithQueryString();
                    },
                    error: function (data) {
                        console.log("error in saving Image " + activeSlide);
                    }


                })
        })
        .catch(error => {
            console.error('Error saving video:', error);
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
function uploadVideo(blob, existingFolderId = 'new', currentIndex =1) {
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

// Simplified loadCanvasFromJsonForDownload: always use passed JSON object
function loadCanvasFromJsonForDownload1(jsonData, condition = 'Common') {
    // clear download canvas
    ctxElementForDownload.clearRect(0, 0, canvasForDownload.width, canvasForDownload.height);
    currentConditionForDownload = condition;

    if (!jsonData) {
        document.fonts.ready.then(() => drawCanvasForDownload(condition));
        return;
    }

    // parse JSON (single slide)
    const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
    slideDataForDownload = data;    // compute screen dims
    const dpr = window.devicePixelRatio || 1;
    const screenW = canvasForDownload.width / dpr;
    const screenH = canvasForDownload.height / dpr;

    // build textObjectsForDownload
    const textObjectsForDownload = (data.text || []).map(o => ({
        text: o.text,
        x: o.x * screenW,
        y: o.y * screenH,
        boundingWidth: o.boundingWidth * screenW,
        boundingHeight: o.boundingHeight * screenH,
        fontSize: o.fontSize,
        fontFamily: o.fontFamily,
        textColor: o.textColor,
        textAlign: o.textAlign,
        opacity: o.opacity,
        selected: false
    }));

    // build imagesForDownload
    const imagesForDownload = (data.images || []).map(o => {
        const obj = { ...o };
        obj.x = o.x * screenW;
        obj.y = o.y * screenH;
        obj.width = o.width * screenW;
        obj.height = o.height * screenH;
        obj.selected = false;
        obj.img = new Image();
        obj.img.crossOrigin = 'anonymous';
        obj.img.onload = () => drawCanvasForDownload(condition);
        obj.img.onerror = () => drawCanvasForDownload(condition);
        obj.img.src = o.src;
        return obj;
    });

    // mirror into globals used by drawCanvasForDownload
    textObjects = textObjectsForDownload;
    images = imagesForDownload;

    // set background color
    const bg = data.canvasBgColor || '#ffffff';
    document.getElementById('hdnBackgroundSpecificColorDownload').value = bg;
    canvasForDownload.style.backgroundColor = bg;

    // preload and draw background image
    if (data.canvasBgImage) {
        canvasForDownload._bgImg = new Image();
        canvasForDownload._bgImg.crossOrigin = 'anonymous';
        canvasForDownload._bgImg.onload = () => drawCanvasForDownload(condition);
        canvasForDownload._bgImg.onerror = () => drawCanvasForDownload(condition);
        canvasForDownload._bgImg.src = data.canvasBgImage;
    } else {
        canvasForDownload._bgImg = null;
    }

    // preload fonts and auto-fit text
    const fontPromises = textObjects.map(o =>
        document.fonts.load(`${o.fontSize}px ${o.fontFamily}`)
    );
    Promise.all(fontPromises).finally(() => {
        textObjects.forEach(obj => autoFitText(obj, padding));
        drawCanvasForDownload(condition);
    });
}

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
            rotation: obj.rotation
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
            autoFitTextNewDownload(obj, padding);
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

    // 4) commit: final fs + its wrapped lines + new boundingHeight
    obj.fontSize = fs;
    obj._wrappedLines = lines;
    //obj.boundingHeight = lines.length * fs * 1.2 + 2 * padding;
    const measuredWidths = lines.map(l => ctx2.measureText(l).width);
    obj.boundingWidth = Math.max(...measuredWidths, 0) + 2 * padding;
}


function loadCanvasFromJsonForDownloadOld(jsonData, condition) {
    // Clear the canvas first.
    ctxElementForDownload.clearRect(0, 0, canvas.width, canvas.height);

    let data;
    // If jsonData is a string, parse it; otherwise assume it's an object.
    if (typeof jsonData === "string") {
        try {
            data = JSON.parse(jsonData);
        } catch (e) {
            console.error("Error parsing canvas JSON:", e);
            drawCanvasForDownload(condition);
            return;
        }
    } else {
        data = jsonData;
    }

    // Set the canvas background color.
    canvasBgColor = data.canvasBgColor || "#ffffff";
    $("#hdnBackgroundSpecificColor").val(canvasBgColor);
    canvasForDownload.style.backgroundColor = canvasBgColor;

    // Load the background image if provided; otherwise, clear any previous background image.
    if (data.canvasBgImage) {
        canvasForDownload.bgImage = new Image();
        canvasForDownload.bgImage.src = data.canvasBgImage;
    } else {
        canvasForDownload.bgImage = null;
    }

    // Process text objects.
    textObjects = data.text || [];

    // Process image objects.
    images = []; // Reset images array
    var imageLoadCount = 0;
    var totalImages = (data.images ? data.images.length : 0);

    // A helper function to check if all images are loaded.
    function checkAllImagesLoadedForDownload() {
        var bgLoaded = true;
        if (canvasForDownload.bgImage) {
            bgLoaded = canvasForDownload.bgImage.complete;
        }
        if (imageLoadCount >= totalImages && bgLoaded) {
            // Once all images are loaded, call drawCanvasPublish.
            drawCanvasForDownload(condition);
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
                checkAllImagesLoadedForDownload();
            };
            imgElement.onerror = function () {
                console.error("Error loading image", imgObj.src);
                imageLoadCount++;
                checkAllImagesLoadedForDownload();
            };

            images.push(newImgObj);
        });
    } else {
        // No images in JSON.
        checkAllImagesLoadedForDownload();
    }

    // Handle the background image load.
    if (canvasForDownload.bgImage) {
        canvasForDownload.bgImage.onload = function () {
            checkAllImagesLoadedForDownload();
        };
        canvasForDownload.bgImage.onerror = function () {
            console.error("Error loading canvas background image", data.canvasBgImage);
            canvasForDownload.bgImage = null;
            checkAllImagesLoadedForDownload();
        };
    } else {
        checkAllImagesLoadedForDownload();
    }
}


function drawCanvasForDownloadOld(condition) {
    // 1) Reset transforms and scale for high-DPI
    resizeCanvas_d();
    // inside: ctxElementForDownload.resetTransform(); ctxElementForDownload.scale(dpr, dpr); ctxElementForDownload.scale(scaleX, scaleY);
    const dpr = window.devicePixelRatio || 1;
    // Full pixel dimensions of download canvas
    const downloadW = canvasForDownload.width;
    const downloadH = canvasForDownload.height;
    // Design-space dimensions (if needed)
    const designW = downloadW / dpr / scaleX;
    const designH = downloadH / dpr / scaleY;

    // 2) Clear & draw background
    ctxElementForDownload.clearRect(0, 0, downloadW, downloadH);
    const bgColor = document.getElementById('hdnBackgroundSpecificColorDownload').value.trim();
    if (bgColor) {
        ctxElementForDownload.fillStyle = bgColor;
        ctxElementForDownload.fillRect(0, 0, downloadW, downloadH);
    }
    if (canvasForDownload._bgImg) {
        ctxElementForDownload.drawImage(canvasForDownload._bgImg, 0, 0, downloadW, downloadH);
    }

    // 3) Draw images (pixel coords)
    images.forEach(imgObj => {
        if (!imgObj.img) {
            const tmp = new Image();
            tmp.crossOrigin = 'anonymous';
            tmp.onload = () => { imgObj.img = tmp; drawCanvasForDownload(condition); };
            tmp.src = imgObj.svgData || imgObj.src;
            return;
        }
        ctxElementForDownload.save();
        ctxElementForDownload.globalAlpha = imgObj.opacity || 1;
        ctxElementForDownload.translate(imgObj.x, imgObj.y);
        ctxElementForDownload.scale(imgObj.scaleX || 1, imgObj.scaleY || 1);
        ctxElementForDownload.drawImage(imgObj.img, 0, 0, imgObj.width, imgObj.height);
        ctxElementForDownload.restore();
    });

    // 4) Draw text blocks (pixel coords)
    if (['Common', 'ChangeStyle', 'applyAnimations'].includes(condition)) {
        const paddingPx = padding; // assume in px
        textObjects.forEach(obj => {
            ctxElementForDownload.save();
            ctxElementForDownload.globalAlpha = obj.opacity || 1;

            // Use fitted fontSize (pixels) and wrapped lines
            const fs = obj.fontSize;
            ctxElementForDownload.font = `${fs}px ${obj.fontFamily}`;
            ctxElementForDownload.fillStyle = obj.textColor;
            ctxElementForDownload.textBaseline = 'top';

            // Positions are already in pixels
            const px = obj.x;
            const py = obj.y;
            const boxW = obj.boundingWidth;
            const boxH = obj.boundingHeight;
            const maxW = obj.boundingWidth - 2 * paddingPx;
           
            let lines;
            if (obj.text.includes('\n')) {
                lines = obj.text.split('\n');
            } else {
                lines = wrapText(ctx, obj.text, maxW);
            }

            // 2) Compute lineHeight from the factor
            const lineH = obj.lineSpacing * obj.fontSize;

            let maxLineW = 0;
            lines.forEach(line => {
                const w = ctxElementForDownload.measureText(line).width;
                if (w > maxLineW) maxLineW = w;
            });

            // then grow the box width to fit that line + left/right padding
            obj.boundingWidth = maxLineW + 10 * paddingPx;

            // 3) If it’s multi-line, grow/shrink your box to fit exactly:
            if (lines.length > 1) {
                obj.boundingHeight = lines.length * lineH + 3 * padding;// this 80 is for round box make little expend as Line Spacing
            }
            

            // 4) Now figure out how many of those lines actually fit (even though
            //    in multi-line we just resized to fit all, this keeps your clipping logic intact):
            const availableHeight = obj.boundingHeight - 2 * padding;
            const maxLines = Math.floor(availableHeight / lineH);
            const startY = obj.y + padding;



            // 5) Draw each line at the computed spacing
            lines.slice(0, maxLines).forEach((line, i) => {
                const lw = ctxElementForDownload.measureText(line).width;
                let offsetX = px + paddingPx;
                if (obj.textAlign === 'center') offsetX = px + (obj.boundingWidth - lw) / 2;
                if (obj.textAlign === 'right') offsetX = px + obj.boundingWidth - lw - paddingPx;

                ctxElementForDownload.fillText(line, offsetX, startY + i * lineH);
            });


           
            ctxElementForDownload.restore();
        });
    }
}

function drawCanvasForDownload(condition) {
    // 1) Refresh CTM: design→screen
    resizeCanvas_d();           // must set ctx.resetTransform(); ctx.scale(dpr,dpr); ctx.scale(scaleX,scaleY);
    const dpr = window.devicePixelRatio || 1;

    // compute “design‐space” dimensions for clearing
    const designW = canvasForDownload.width / dpr / scaleX;
    const designH = canvasForDownload.height / dpr / scaleY;
    // 2) Clear & draw background (in design units)
    ctxElementForDownload.clearRect(0, 0, designW, designH);
    const bgColor = document.getElementById('hdnBackgroundSpecificColorDownload').value.trim();

    if (bgColor) {
        ctxElementForDownload.fillStyle = bgColor;
        ctxElementForDownload.fillRect(0, 0, designW, designH);

    }
    //if (canvas.bgImage) {
    //    ctx.drawImage(canvas.bgImage, 0, 0, designW, designH);
    //}
    if (canvas._bgImg) {
        ctxElementForDownload.drawImage(canvas._bgImg, 0, 0, designW, designH);
    }
    // 3) Draw images (lazy‑load + design units)
    images.forEach(imgObj => {
        // design→screen position & size
        const x = imgObj.x;
        const y = imgObj.y;
        const w = imgObj.width * (imgObj.scaleX || 1);
        const h = imgObj.height * (imgObj.scaleY || 1);
        const rotation = (imgObj.rotation || 0) * Math.PI / 180; // radians

        // lazy-load if this imgObj has no <img> yet
        if (!imgObj.img) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                imgObj.img = img;
                drawCanvasForDownload(condition);
            };
            img.src = imgObj.svgData || imgObj.src;
            return;
        }


        //// 3c) Draw with correct center‐pivot rotation:
        ctxElementForDownload.save();
        ctxElementForDownload.globalAlpha = imgObj.opacity || 1;

        // 1) Move origin to the image’s center
        const cx = x + w / 2;
        const cy = y + h / 2;
        ctxElementForDownload.translate(cx, cy);

        // 2) Apply rotation about that center
        ctxElementForDownload.rotate(rotation);

        // 3) Apply scale (if any) in this rotated coordinate system
        ctxElementForDownload.scale(imgObj.scaleX || 1, imgObj.scaleY || 1);
        // 4) Draw the image so that its center is at (0,0):
        //    since we translated to (cx, cy), drawing from (−w/2, −h/2) puts top‐left at the correct spot.
        try {
            ctxElementForDownload.drawImage(
                imgObj.img,
                - (imgObj.width / 2),    // −(original width)/2
                - (imgObj.height / 2),   // −(original height)/2
                imgObj.width,
                imgObj.height
            );
        } catch (e) {
            // silent if drawImage fails
        }

        ctxElementForDownload.restore();
    });

    // 4) Draw text (in design units)
    if (['Common', 'ChangeStyle', 'applyAnimations'].includes(condition)) {
        textObjects.forEach(obj => {
            ctxElementForDownload.save();
            ctxElementForDownload.globalAlpha = obj.opacity || 1;
            ctxElementForDownload.font = `${obj.fontSize}px ${obj.fontFamily}`;
            ctxElementForDownload.fillStyle = obj.textColor;
            ctxElementForDownload.textBaseline = "top";

            const x = obj.x;
            const y = obj.y;
           
            const pad = padding;
            const maxW = obj.boundingWidth - 2 * pad;
            const rotation = (obj.rotation || 0) * Math.PI / 180;
            //// split or wrap
            //const lines = obj.text.includes('\n')
            //    ? obj.text.split('\n')
            //    : wrapText(ctxElementForDownload, obj.text, maxW);
            const raw = obj.text;
            let lines;
            if (raw.includes('\n')) {
                lines = raw.split('\n');
            } else {
                const fullW = ctxElementForDownload.measureText(raw).width;
                const maxW = obj.boundingWidth * designW - 2 * padding;
                if (!raw.includes(' ') && fullW <= maxW) {
                    // single “word” that actually fits: keep it one line
                    lines = [raw];
                } else {
                    // otherwise do your normal word-wrap
                    lines = wrapText(ctxElementForDownload, raw, maxW);
                }
            }

            // line height in px
            const fs = obj.fontSize;
            const lineH = obj.lineSpacing * fs;

            // measure true ink-width
            let maxLineW = 0;
            lines.forEach(line => {
                const m = ctxElementForDownload.measureText(line);
                const glyphW = (m.actualBoundingBoxLeft != null && m.actualBoundingBoxRight != null)
                    ? m.actualBoundingBoxLeft + m.actualBoundingBoxRight
                    : m.width;
                maxLineW = Math.max(maxLineW, glyphW);
            });

           

            // compute overlap buffer *only* if spacing < 1
            const overlap = Math.max(0, 1 - obj.lineSpacing);
            const extraPerLine = overlap * fs;

            // base box size in px (always include any overlap buffer)
            const totalTextH = lines.length * lineH;
            const baseWpx = maxLineW + 2 * pad + extraPerLine;
            const baseHpx = totalTextH + 2 * pad + extraPerLine;

            // extra margin *only* when lineSpacing < 1
            const extraMarginFraction = 0.6;            // tweak this as % of font
            const extraMargin = obj.lineSpacing < 1
                ? fs * extraMarginFraction
                : 0;

            // final box size
            const boxWpx = Math.ceil(baseWpx + extraMargin);
            const boxHpx = Math.ceil(baseHpx + extraMargin);

            // overwrite props
            obj.boundingWidth = boxWpx;
            obj.boundingHeight = boxHpx;

            const cx = x + boxWpx / 2;
            const cy = y + boxHpx / 2;

            // 4f) Translate → rotate around center
            ctxElementForDownload.translate(cx, cy);
            ctxElementForDownload.rotate(rotation);
            ctxElementForDownload.translate(-cx, -cy);

            // clipping & drawing
            const maxLines = Math.floor((boxHpx - 2 * pad) / lineH);
            const startY = y + pad;

            lines.slice(0, maxLines).forEach((line, i) => {
                const lw = ctxElementForDownload.measureText(line).width;
                let offsetX = x + pad;
                if (obj.textAlign === 'center') {
                    offsetX = x + (boxWpx - lw) / 2;
                } else if (obj.textAlign === 'right') {
                    offsetX = x + boxWpx - lw - pad;
                }
                ctxElementForDownload.fillText(line, offsetX, startY + i * lineH);
            });

            ctxElementForDownload.restore();
        });
    }



    


    // 5) Overlay selection UI *in raw pixel space*  
    function toPixelSpace(fn) {
        ctxElementForDownload.save();
        ctxElementForDownload.resetTransform();    // drop design→screen CTM
        ctxElementForDownload.scale(dpr, dpr);     // keep only HiDPI
        fn();
        ctxElementForDownload.restore();
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

            ctxElementForDownload.strokeStyle = "blue";
            ctxElementForDownload.lineWidth = 2;
            ctxElementForDownload.strokeRect(xPx, yPx, wPx, hPx);

            ctxElementForDownload.fillStyle = "red";
            const hs = getImageResizeHandles(imgObj)
                .map(pt => ({ x: pt.x * scaleX, y: pt.y * scaleY }));
            const halfH = handleSize / 2;
            hs.forEach(pt => {
                ctxElementForDownload.fillRect(pt.x - halfH, pt.y - halfH, handleSize, handleSize);
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
                ctxElementForDownload,
                xPx - padding * scaleX,
                yPx - padding * scaleY,
                wPx + 2 * padding * scaleX - RECT_WIDTH_ADJUST * scaleX,
                hPx + 2 * padding * scaleY - RECT_HEIGHT_ADJUST * scaleY,
                5 * scaleX
            );

            // all 8 handles: corners + midpoints
            ctxElementForDownload.fillStyle = "#FF7F50";
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
                ctxElementForDownload.fillRect(pt.x - halfW, pt.y - halfW - liftY, handleSize, handleSize);
            });
        });
    });

    // 6) reset alpha
    ctxElementForDownload.globalAlpha = 1;
}

function convertToPixels(data, canvasWidth, canvasHeight) {
    // Convert text positions and bounding box
    if (data.text) {
        data.text.forEach(txt => {
            txt.x = txt.x * canvasWidth;
            txt.y = txt.y * canvasHeight;
            txt.boundingWidth = txt.boundingWidth * canvasWidth;
            txt.boundingHeight = txt.boundingHeight * canvasHeight;
        });
    }

    // Convert image positions and dimensions
    if (data.images) {
        data.images.forEach(img => {
            img.x = img.x * canvasWidth;
            img.y = img.y * canvasHeight;
            img.width = img.width * canvasWidth;
            img.height = img.height * canvasHeight;
            img.finalX = img.x;
            img.finalY = img.y;

            // Optionally define exitX/exitY based on direction logic later
        });
    }

    return data;
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
function drawCanvasForDownloadOld(condition) {
    ctxElementForDownload.clearRect(0, 0, canvasForDownload.width, canvasForDownload.height); // Clear entire canvas
    const bgColor = $("#hdnBackgroundSpecificColor").val();
    if (bgColor && bgColor.trim() !== "") {
        ctxElementForDownload.fillStyle = bgColor;
        ctxElementForDownload.fillRect(0, 0, canvasForDownload.width, canvasForDownload.height);
    }

    // Draw background image if available.
    if (canvasForDownload.bgImage) {
        ctxElementForDownload.drawImage(canvasForDownload.bgImage, 0, 0, canvasForDownload.width, canvasForDownload.height);
    }

    // --- Draw multiple images from the images array ---
    if (images && images.length) {
        images.forEach(imgObj => {
            ctxElementForDownload.save();
            ctxElementForDownload.globalAlpha = imgObj.opacity || 1;
            const scaleX = imgObj.scaleX || 1;
            const scaleY = imgObj.scaleY || 1;
            ctxElementForDownload.translate(imgObj.x, imgObj.y);
            ctxElementForDownload.scale(scaleX, scaleY);
            // Draw the image at (0,0) because translation has already been applied.
            ctxElementForDownload.drawImage(imgObj.img, 0, 0, imgObj.width, imgObj.height);
            ctxElementForDownload.restore();

            // If this image is selected, draw a border and four resize handles.
            if (imgObj.selected) {
                ctxElementForDownload.save();
                ctxElementForDownload.strokeStyle = "blue";
                ctxElementForDownload.lineWidth = 2;
                const dispW = imgObj.width * scaleX;
                const dispH = imgObj.height * scaleY;
                ctxElementForDownload.strokeRect(imgObj.x, imgObj.y, dispW, dispH);
                // Draw handles at the four corners
                const handles = getImageResizeHandles(imgObj); // Make sure this function uses your dynamic dimensions
                ctxElementForDownload.fillStyle = "red";
                handles.forEach(handle => {
                    ctxElementForDownload.fillRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
                });
                ctxElementForDownload.restore();
            }
        });
    }

    ctxElementForDownload.save();
    ctxElementForDownload.globalAlpha = textPosition.opacity || 1; // Apply text opacity

    if (condition === 'Common' || condition === 'ChangeStyle') {
        textObjects.forEach(obj => {
            ctxElementForDownload.save();
            // If selected, draw the bounding box and handles.
            if (obj.selected) {
                // Constrain the box if it goes beyond canvas boundaries.
                if (obj.x < 0) obj.x = 0;
                if (obj.x + obj.boundingWidth > canvasForDownload.width) {
                    obj.boundingWidth = canvasForDownload.width - obj.x;
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
                ctxElementForDownload.fillStyle = "#FF7F50";
                handles.forEach(handle => {
                    ctxElementForDownload.fillRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
                });
            }

            // Set text properties.
            ctxElementForDownload.font = `${obj.fontSize}px ${obj.fontFamily}`;
            ctxElementForDownload.fillStyle = obj.textColor;
            ctxElementForDownload.textBaseline = "top";

            // Determine the maximum text width for wrapping.
            const maxTextWidth = obj.boundingWidth - 2 * padding;
            let lines;
            // If the text contains newline characters, use them; otherwise, wrap.
            if (obj.text.indexOf("\n") !== -1) {
                lines = obj.text.split("\n");
            } else {
                lines = wrapText(ctxElementForDownload, obj.text, maxTextWidth);
            }
            const lineHeight = obj.fontSize * 1.2;
            const availableHeight = obj.boundingHeight - 2 * padding;
            const maxLines = Math.floor(availableHeight / lineHeight);
            const startY = obj.y + padding;

            // Draw each line with the correct horizontal offset based on alignment.
            for (let i = 0; i < Math.min(lines.length, maxLines); i++) {
                const line = lines[i];
                const lineWidth = ctxElementForDownload.measureText(line).width;
                let offsetX;
                if (obj.textAlign === "center") {
                    offsetX = obj.x + (obj.boundingWidth - lineWidth) / 2;
                } else if (obj.textAlign === "right") {
                    offsetX = obj.x + obj.boundingWidth - lineWidth - padding;
                } else { // left alignment
                    offsetX = obj.x + padding;
                }
                ctxElementForDownload.fillText(line, offsetX, startY + i * lineHeight);
            }
            ctxElementForDownload.restore();
        });
    }

    if (condition === 'applyAnimations') {
        textObjects.forEach(obj => {
            ctxElementForDownload.save();
            ctxElementForDownload.font = `${obj.fontSize}px ${obj.fontFamily}`;
            ctxElementForDownload.fillStyle = obj.textColor;
            ctxElementForDownload.textBaseline = "top";

            const maxTextWidth = obj.boundingWidth - 2 * padding;
            let lines;
            if (obj.text.indexOf("\n") !== -1) {
                lines = obj.text.split("\n");
            } else {
                lines = wrapText(ctxElementForDownload, obj.text, maxTextWidth);
            }
            const lineHeight = obj.fontSize * 1.2;
            const availableHeight = obj.boundingHeight - 2 * padding;
            const maxLines = Math.floor(availableHeight / lineHeight);
            const startY = obj.y + padding;

            for (let i = 0; i < Math.min(lines.length, maxLines); i++) {
                const line = lines[i];
                const lineWidth = ctxElementForDownload.measureText(line).width;
                let offsetX;
                if (obj.textAlign === "center") {
                    offsetX = obj.x + (obj.boundingWidth - lineWidth) / 2;
                } else if (obj.textAlign === "right") {
                    offsetX = obj.x + obj.boundingWidth - lineWidth - padding;
                } else {
                    offsetX = obj.x + padding;
                }
                ctxElementForDownload.fillText(line, offsetX, startY + i * lineHeight);
            }
            ctxElementForDownload.restore();
        });
    }

    ctxElementForDownload.globalAlpha = 1;
    ctxElementForDownload.restore();
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
function animateTextForDownload(animationType, direction, condition, loopCount, state) {
    
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
                obj.y = canvasForDownload.height + 5;
                obj.exitX = obj.finalX;
                obj.exitY = canvasForDownload.height + 5;
                break;
            case "left":
                obj.x = -(obj.boundingWidth + 5);
                obj.y = obj.finalY;
                obj.exitX = -(obj.boundingWidth + 5);
                obj.exitY = obj.finalY;
                break;
            case "right":
                obj.x = canvasForDownload.width + 5;
                obj.y = obj.finalY;
                obj.exitX = canvasForDownload.width + 5;
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

        // Pin noAnim
        images.filter(i => i.noAnim).forEach(img => {
            tlText.set(img, { x: img.x, y: img.y, opacity: img.opacity ?? 1 }, 0);
        });
        textObjects.filter(t => t.noAnim).forEach(txt => {
            tlText.set(txt, { x: txt.finalX, y: txt.finalY, opacity: txt.opacity ?? 1 }, 0);
        });

        // --- IN: one tween per group/unit ---
        units.forEach((unit, idx) => {
            tlText.to(unit, {
                x: (i, t) => t.finalX,
                y: (i, t) => t.finalY,
                duration: tweenIn,
                ease: "power1.in",
                onUpdate: () => drawCanvasForDownload(condition)
            }, idx * tweenIn);
        });

        // compute when IN ends
        const totalIn = units.length * tweenIn;

        // 2) STAY tween at end of IN
        tlText.to({}, {
            duration: stayTime,
            ease: "none"
        }, totalIn);

        // 3) OUT tweens start after IN + STAY
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
                        drawCanvasForDownload(condition);
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
                    onUpdate: () => drawCanvasForDownload(condition)
                });
            }
            else if (animationType === "bounce" || animationType === "blur") {

                ////This section is for in out and stay
                let tl = gsap.timeline({
                    repeat: loopCount - 1,
                    onUpdate: function () {
                        drawCanvasForDownload(condition);
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
                    onUpdate: () => drawCanvasForDownload(condition),


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
                imgObj.y = canvasForDownload.height + 5;
                imgObj.exitX = imgObj.finalX;
                imgObj.exitY = canvasForDownload.height + 5;
                break;
            case "left":
                imgObj.x = -(dispWidth + 5);
                imgObj.y = imgObj.finalY;
                imgObj.exitX = -(dispWidth + 5);
                imgObj.exitY = imgObj.finalY;
                break;
            case "right":
                imgObj.x = canvasForDownload.width + 5;
                imgObj.y = imgObj.finalY;
                imgObj.exitX = canvasForDownload.width + 5;
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
                    drawCanvasForDownload(condition);
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
                    onUpdate: () => drawCanvasForDownload(condition)
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
                    onUpdate: () => drawCanvasForDownload(condition)
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
                        onUpdate: () => drawCanvasForDownload(condition)
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
                    onUpdate: () => drawCanvasForDownload(condition)
                });
                tl.set(imgObj, {
                    x: endX,
                    y: endY,
                    scaleX: originalScaleX,
                    scaleY: originalScaleY,
                    duration: 0,
                    ease: "none",
                    onUpdate: () => drawCanvasForDownload(condition)
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
                            drawCanvasForDownload(condition);
                        },
                        onComplete: () => {
                            ctx.filter = "none";
                            drawCanvasForDownload(condition);
                        }
                    }
                );
                tl.to(imgObj, {
                    duration: stayTime,
                    ease: "none",
                    onUpdate: () => {
                        ctx.filter = "none";
                        drawCanvasForDownload(condition);
                    }
                });
                tl.to(imgObj, {
                    x: exitX,
                    y: exitY,
                    duration: outTime,
                    ease: "power2.in",
                    onUpdate: () => {
                        ctx.filter = "none";
                        drawCanvasForDownload(condition);
                    }
                });
                tl.set(imgObj, {
                    x: endX,
                    y: endY,
                    duration: 0,
                    ease: "none",
                    onUpdate: () => {
                        ctx.filter = "none";
                        drawCanvasForDownload(condition);
                    }
                });
            }
        });
    }
}
//function animateTextForDownload(animationType, direction, condition, loopCount, state) {

//    // Global timing settings (from your selected speeds).
//    const inTime = parseFloat(selectedInSpeed) || 4;   // e.g. 4 seconds for all "in"
//    const outTime = parseFloat(selectedOutSpeed) || 4;   // e.g. 3 seconds for all "out"
//    const stayTime = parseFloat(selectedStaySpeed) || 6; // Overall stay time (applied globally if desired)

//    // ----- TEXT ANIMATION SECTION -----
//    // Pre-calculate final positions and offscreen positions.
//    textObjects.forEach((obj) => {

//        // Save the final (target) position.
//        obj.finalX = obj.x;
//        obj.finalY = obj.y;

//        // Compute the starting (offscreen) and exit positions based on the direction.
//        switch (direction) {
//            case "top":
//                obj.x = obj.finalX;
//                obj.y = -(obj.boundingHeight + 5);
//                obj.exitX = obj.finalX;
//                obj.exitY = -(obj.boundingHeight + 5);
//                break;
//            case "bottom":
//                obj.x = obj.finalX;
//                obj.y = canvas.height + 5;
//                obj.exitX = obj.finalX;
//                obj.exitY = canvas.height + 5;
//                break;
//            case "left":
//                obj.x = -(obj.boundingWidth + 5);
//                obj.y = obj.finalY;
//                obj.exitX = -(obj.boundingWidth + 5);
//                obj.exitY = obj.finalY;
//                break;
//            case "right":
//                obj.x = canvas.width + 5;
//                obj.y = obj.finalY;
//                obj.exitX = canvas.width + 5;
//                obj.exitY = obj.finalY;
//                break;
//            default:
//                // Default: animate offscreen to the right.
//                obj.x = obj.finalX;
//                obj.y = obj.finalY;
//                obj.exitX = window.innerWidth;
//                obj.exitY = obj.finalY;
//        }
//    });


//    if (animationType === "delaylinear") {
//        const nominalPerObj = .50;
//        const countText = textObjects.length;

//        const scaleInText = inTime / (countText * nominalPerObj);
//        const scaleOutText = outTime / (countText * nominalPerObj);

//        const individualTweenText = 0.15 * scaleInText;
//        const individualTweenOutText = 0.15 * scaleOutText;
//        let tlText = gsap.timeline({
//            repeat: loopCount - 1,
//            onUpdate: () => drawCanvasForDownload(condition)
//        });

//        // --- Text IN ---
//        tlText.to(textObjects, {
//            x: (i, t) => t.finalX,
//            y: (i, t) => t.finalY,
//            duration: individualTweenText,
//            ease: "power1.in",
//            stagger: individualTweenText * 0.7,
//            onUpdate: () => drawCanvasForDownload(condition)
//        });
//        console.log("animateTextForDownload", images);
//        // --- Image IN ***
//        // (Replace your images.forEach(...) here with this single tween)
//        tlText.to(images, {
//            x: img => img.finalX,
//            y: img => img.finalY,
//            duration: individualTweenText,
//            ease: "power1.in",
//            stagger: individualTweenText * 0.7,
//            onUpdate: () => drawCanvasForDownload(condition)
//        });

//        // --- Stay Time ---
//        tlText.to({}, { duration: stayTime, ease: "none" });

//        // --- Image OUT ---
//        tlText.to([...images].reverse(), {
//            x: img => img.exitX,
//            y: img => img.exitY,
//            duration: individualTweenOutText,
//            ease: "power1.out",
//            stagger: individualTweenOutText * 0.7,
//            onUpdate: () => drawCanvasForDownload(condition)
//        });

//        // --- Text OUT ---
//        tlText.to([...textObjects].reverse(), {
//            x: (i, t) => t.exitX,
//            y: (i, t) => t.exitY,
//            duration: individualTweenOutText,
//            ease: "power1.out",
//            stagger: individualTweenOutText * 0.7,
//            onUpdate: () => drawCanvasForDownload(condition)
//        });

//        tlText.eventCallback("onComplete", () => {
//            // reset positions
//            images.forEach(img => { img.x = img.finalX; img.y = img.finalY; });
//            textObjects.forEach(txt => { txt.x = txt.finalX; txt.y = txt.finalY; });
//            drawCanvasForDownload(condition);
//        });
//    }



//    else if (animationType === "linear" || animationType === "zoom" ||
//        animationType === "bounce" || animationType === "blur") {
//        // Keep your existing implementation for these cases.
//        textObjects.forEach((obj) => {
//            const endX = obj.finalX;
//            const endY = obj.finalY;
//            let exitX, exitY;
//            switch (direction) {
//                case "top":
//                    exitX = endX;
//                    exitY = -(obj.boundingHeight + 5);
//                    break;
//                case "bottom":
//                    exitX = endX;
//                    exitY = canvas.height + 5;
//                    break;
//                case "left":
//                    exitX = -(obj.boundingWidth + 5);
//                    exitY = endY;
//                    break;
//                case "right":
//                    exitX = canvas.width + 5;
//                    exitY = endY;
//                    break;
//                default:
//                    exitX = window.innerWidth;
//                    exitY = endY;
//            }
//            if (animationType === "linear" || animationType === "zoom") {
//                let tl = gsap.timeline({
//                    repeat: loopCount - 1,
//                    onUpdate: function () {
//                        drawCanvasForDownload(condition);
//                    }
//                });

//                tl.to(obj, {
//                    x: endX,
//                    y: endY,
//                    duration: inTime,
//                    ease: "power1.in"
//                });
//                tl.to(obj, {
//                    duration: stayTime,
//                    ease: "none"
//                });
//                tl.to(obj, {
//                    x: exitX,
//                    y: exitY,
//                    duration: outTime,
//                    ease: "power1.out"
//                });
//                tl.set(obj, {
//                    x: endX,
//                    y: endY,
//                    duration: 0,
//                    ease: "power1.inOut",
//                    onUpdate: () => drawCanvasForDownload(condition)
//                });
//            }
//            else if (animationType === "bounce" || animationType === "blur") {

//                ////This section is for in out and stay
//                let tl = gsap.timeline({
//                    repeat: loopCount - 1,
//                    onUpdate: function () {
//                        drawCanvasForDownload(condition);
//                    }
//                });

//                // "In" phase: Animate the object onto the canvas.
//                tl.to(obj, {
//                    x: endX,
//                    y: endY,
//                    duration: inTime,
//                    ease: "bounce.out"
//                });

//                // "Stay" phase: Hold the object in place for the stay duration.
//                // This tween doesn't change any properties; it just acts as a pause.
//                tl.to(obj, {
//                    duration: stayTime,
//                    ease: "none"
//                });

//                // "Out" phase: Animate the object off the canvas.
//                tl.to(obj, {
//                    x: exitX,
//                    y: exitY,
//                    duration: outTime,
//                    ease: "bounce.out"
//                });
//                // Final phase: Reset the object to the final position with text.
//                // This sets the object’s position to (endX, endY) after the out tween completes.
//                tl.set(obj, {
//                    x: endX,
//                    y: endY,
//                    duration: 0,
//                    ease: "bounce.out",
//                    onUpdate: () => drawCanvasForDownload(condition),


//                });


//                ////This is default effect of bounce
//                //gsap.to(obj, {
//                //    x: endX,
//                //    y: endY,
//                //    duration: parseFloat(selectedInSpeed) || 2,
//                //    ease: "bounce.out",
//                //    onUpdate: () => drawCanvas(condition),
//                //});
//            }

//        });
//    }

//    // ----- IMAGE ANIMATION SECTION -----
//    // (A similar approach can be applied to images.)
//    images.forEach((imgObj) => {
//        imgObj.finalX = imgObj.x;
//        imgObj.finalY = imgObj.y;
//        const dispWidth = imgObj.width * (imgObj.scaleX || 1);
//        const dispHeight = imgObj.height * (imgObj.scaleY || 1);
//        switch (direction) {
//            case "top":
//                imgObj.x = imgObj.finalX;
//                imgObj.y = -(dispHeight + 5);
//                imgObj.exitX = imgObj.finalX;
//                imgObj.exitY = -(dispHeight + 5);
//                break;
//            case "bottom":
//                imgObj.x = imgObj.finalX;
//                imgObj.y = canvas.height + 5;
//                imgObj.exitX = imgObj.finalX;
//                imgObj.exitY = canvas.height + 5;
//                break;
//            case "left":
//                imgObj.x = -(dispWidth + 5);
//                imgObj.y = imgObj.finalY;
//                imgObj.exitX = -(dispWidth + 5);
//                imgObj.exitY = imgObj.finalY;
//                break;
//            case "right":
//                imgObj.x = canvas.width + 5;
//                imgObj.y = imgObj.finalY;
//                imgObj.exitX = canvas.width + 5;
//                imgObj.exitY = imgObj.finalY;
//                break;
//            default:
//                imgObj.x = imgObj.finalX;
//                imgObj.y = imgObj.finalY;
//                imgObj.exitX = window.innerWidth;
//                imgObj.exitY = imgObj.finalY;
//        }
//    });


//    if (animationType === "linear" || animationType === "zoom" ||
//        animationType === "bounce" || animationType === "blur") {
//        // Keep the existing branches for images.
//        let exitX, exitY;
//        images.forEach((imgObj) => {
//            const endX = imgObj.finalX;
//            const endY = imgObj.finalY;
//            let tl = gsap.timeline({
//                repeat: loopCount - 1,
//                onUpdate: function () {
//                    drawCanvasForDownload(condition);
//                }
//            });

//            if (animationType === "linear") {
//                tl.to(imgObj, {
//                    x: endX,
//                    y: endY,
//                    duration: inTime,
//                    ease: "power1.in"
//                });
//                tl.to(imgObj, {
//                    duration: stayTime,
//                    ease: "none"
//                });
//                tl.to(imgObj, {
//                    x: exitX,
//                    y: exitY,
//                    duration: outTime,
//                    ease: "power1.out"
//                });
//                tl.set(imgObj, {
//                    x: endX,
//                    y: endY,
//                    duration: 0,
//                    ease: "power1.inOut",
//                    onUpdate: () => drawCanvasForDownload(condition)
//                });
//            }
//            else if (animationType === "bounce") {
//                tl.to(imgObj, {
//                    x: endX,
//                    y: endY,
//                    duration: inTime,
//                    ease: "bounce.out"
//                });
//                tl.to(imgObj, {
//                    duration: stayTime,
//                    ease: "none"
//                });
//                tl.to(imgObj, {
//                    x: exitX,
//                    y: exitY,
//                    duration: outTime,
//                    ease: "bounce.out"
//                });
//                tl.set(imgObj, {
//                    x: endX,
//                    y: endY,
//                    duration: 0,
//                    ease: "bounce.out",
//                    onUpdate: () => drawCanvasForDownload(condition)
//                });
//            }
//            else if (animationType === "zoom") {
//                // Zoom in then out.
//                tl.fromTo(
//                    imgObj,
//                    { scaleX: 0, scaleY: 0, x: startX, y: startY },
//                    {
//                        scaleX: originalScaleX,
//                        scaleY: originalScaleY,
//                        x: endX,
//                        y: endY,
//                        duration: inTime,
//                        ease: "power2.out",
//                        onUpdate: () => drawCanvasForDownload(condition)
//                    }
//                );
//                tl.to(imgObj, {
//                    duration: stayTime,
//                    ease: "none"
//                });
//                tl.to(imgObj, {
//                    scaleX: 0,
//                    scaleY: 0,
//                    x: exitX,
//                    y: exitY,
//                    duration: outTime,
//                    ease: "power2.in",
//                    onUpdate: () => drawCanvasForDownload(condition)
//                });
//                tl.set(imgObj, {
//                    x: endX,
//                    y: endY,
//                    scaleX: originalScaleX,
//                    scaleY: originalScaleY,
//                    duration: 0,
//                    ease: "none",
//                    onUpdate: () => drawCanvasForDownload(condition)
//                });
//            }
//            else if (animationType === "blur") {
//                imgObj.blur = 5;
//                tl.fromTo(
//                    imgObj,
//                    { blur: 5, x: startX, y: startY },
//                    {
//                        blur: 0,
//                        x: endX,
//                        y: endY,
//                        duration: inTime + 2,
//                        ease: "power2.out",
//                        onUpdate: () => {
//                            ctx.filter = `blur(${imgObj.blur}px)`;
//                            drawCanvasForDownload(condition);
//                        },
//                        onComplete: () => {
//                            ctx.filter = "none";
//                            drawCanvasForDownload(condition);
//                        }
//                    }
//                );
//                tl.to(imgObj, {
//                    duration: stayTime,
//                    ease: "none",
//                    onUpdate: () => {
//                        ctx.filter = "none";
//                        drawCanvasForDownload(condition);
//                    }
//                });
//                tl.to(imgObj, {
//                    x: exitX,
//                    y: exitY,
//                    duration: outTime,
//                    ease: "power2.in",
//                    onUpdate: () => {
//                        ctx.filter = "none";
//                        drawCanvasForDownload(condition);
//                    }
//                });
//                tl.set(imgObj, {
//                    x: endX,
//                    y: endY,
//                    duration: 0,
//                    ease: "none",
//                    onUpdate: () => {
//                        ctx.filter = "none";
//                        drawCanvasForDownload(condition);
//                    }
//                });
//            }
//        });
//    }
//}

function showPublishMessage() {
    MessageShow('', 'Please publish the board to preview here', 'error');
}
// call once on page-load
function initModeToggle() {
    const buttons = document.querySelectorAll('.toggle-container .toggle-btn');

    function applyMode(mode) {
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