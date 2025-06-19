
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
                        .map(el => el.value)
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
                    sessionStorage.setItem("leftPanelHtml", document.getElementById("divpanelleft").innerHTML);
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
                zIndex: imgObj.zIndex || getNextZIndex()
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


                    const [beforeTilde, afterTilde] = result.designBoardDetailsList[0].transitionColor.split('~');


                    $('#hdnTransition1').val(beforeTilde);
                    $('#hdnTransition2').val(afterTilde);
                    document.getElementById('targetDiv1').style.backgroundColor = beforeTilde;
                    document.getElementById('targetDiv2').style.backgroundColor = afterTilde;

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

                    updateEffectButtons('In');
                    updateEffectButtons('Out');
                    updateDirectionButtons('In');
                    updateDirectionButtons('Out');
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
async function loadNextJsonForDownloadOLd() {
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

async function loadNextJsonForDownload_OLD_12() {
    for (let i = 0; i < jsonArray.length; i++) {
        const state = jsonArray[i];
        const inTime = parseFloat(selectedInSpeed) || 4;
        const stayTime = parseFloat(selectedStaySpeed) || 3;
        const outTime = parseFloat(selectedOutSpeed) || 4;
        const slideExecutionTime = inTime + stayTime+2 + outTime;

        // 1) Draw & run the animation (this promise resolves when GSAP’s onComplete fires)
        loadCanvasFromJsonForDownload(state, 'Common');
        await applyAnimationsforDownload(
            state.effect,
            state.direction,
            'applyAnimations',
            state
        );

        // 2) Wait out the remainder of the slide duration
        //    (if your GSAP timeline already spans exactly slideExecutionTime,
        //     you can skip this—but if you need to enforce it, do this:)
        await new Promise(r => setTimeout(r, slideExecutionTime * 1000));
    }

    // All done
    recorderForDownload.stop();
}
// 2) Use it inside your loader loop
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


async function loadNextJsonForDownload_NEWOLD() {
    const transitionType = $("#hdntransition").val() || 'slideLeft';
    const stripeDuration = 2;     // total stripe time in seconds
    const overlapDelay = 2100;  // ms into stripe when we actually pull in the full next canvas

    let overlapColor = (transitionType === 'slideRight')
        ? 1050
        : 1250; // for slideLeft or any other default

    if (!jsonArray.length) return;

    // 1) Show the very first slide
    await showSlide(0);

    // 2) For each subsequent slide:
    for (let i = 0; i < jsonArray.length - 1; i++) {
        const nextIdx = i + 1;
        const { canvasBgColor: nextBgColor, canvasBgImage: nextBgImage } = jsonArray[nextIdx];

        // 2a) Start the stripe transition (doesn't block)
        const stripePromise = runStripeTransition(transitionType, stripeDuration);

        // 2b) Part-way through the stripe, swap to next slide’s bg (image or color)
        setTimeout(() => {
            if (nextBgImage) {
                // preload & draw the image
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => {
                    canvas._bgImg = img;
                    drawCanvasForDownload('Common');
                };
                img.onerror = () => {
                    // on error, clear image and fall back to color
                    canvas._bgImg = null;
                    $("#hdnBackgroundSpecificColorDownload").val(nextBgColor);
                    drawCanvasForDownload('Common');
                };
                img.src = nextBgImage;
            } else {
                // no image → clear any prior image and use color
                canvas._bgImg = null;
                $("#hdnBackgroundSpecificColorDownload").val(nextBgColor);
                drawCanvasForDownload('Common');
            }
        }, overlapColor);

        // 2c) Later in the stripe, actually load the next slide’s JSON
        setTimeout(() => {
            loadCanvasFromJsonForDownload(jsonArray[nextIdx], 'Common');
        }, overlapDelay);

        // 2d) Wait for stripe to finish before firing next slide’s IN→STAY→OUT
        await stripePromise;
        await showSlide(nextIdx);
    }

    // 3) All done
    recorderForDownload.stop();
}

async function loadNextJsonForDownload_14_6() {
    const transitionType = $("#hdntransition").val() || 'slideLeft';
    const stripeDuration = 2;      // total stripe time in seconds
    const overlapDelay = 2100;   // ms into stripe when we actually pull in the full next canvas
    let overlapColor = 1250;
    if (transitionType == 'slideRight') {
        overlapColor = 1050;//1050 ms into stripe when we change the background color
    }
    else if (transitionType == 'slideLeft') {
        overlapColor = 1250;//1250 ms into stripe when we change the background color
    }
   

    if (!jsonArray.length) return;

    // 1) Show the very first slide
    await showSlide(0);

    // 2) For each subsequent slide:
    for (let i = 0; i < jsonArray.length - 1; i++) {
        const nextIdx = i + 1;
        const nextBg = jsonArray[nextIdx].canvasBgColor;

        // 2a) Start the stripe transition (doesn't block)
        const stripePromise = runStripeTransition(transitionType, stripeDuration);

        // 2b) Part-way through the stripe, swap to next slide’s bg color
        setTimeout(() => {
            $(`#hdnBackgroundSpecificColorDownload`).val(nextBg);
            drawCanvasForDownload('Common');
        }, overlapColor);

        // 2c) Later in the stripe, actually load the next slide’s JSON
        setTimeout(() => {
            loadCanvasFromJsonForDownload(jsonArray[nextIdx], 'Common');
        }, overlapDelay);

        // 2d) Wait for stripe to finish before firing next slide’s IN→STAY→OUT
        await stripePromise;
        await showSlide(nextIdx);
    }

    // 3) All done
    recorderForDownload.stop();
}


// 1) Extract transition into its own function
async function runStripeTransitionOLD(type = 'slideLeft', duration = 2) {
    const els = [
        document.getElementById('transition1'),
        document.getElementById('transition2'),
/*        document.getElementById('transition3'),*/
    ];
    // build stripes
    const stripes = await Promise.all(
        els.map(el => buildTintedStripe(el, {
            color: el.dataset.color,
            width: parseInt(el.dataset.width, 10)
        }))
    );

    // position them off-canvas to the right
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
   
    // push into your `images` array, render once, then animate
    temps.forEach(t => images.push(t));
    drawCanvasForDownload('Common');  // force initial paint
   
    // stagger them
    await Promise.all(
        temps.map((t, i) => animateCanvasImage(t, type, duration, i * 0.1))        
    );
   
    // cleanup
    temps.forEach(() => images.pop());
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


async function loadNextJsonForDownloadNewOld() {
    if (currentIndexForDownload < jsonArray.length) {
        const state = jsonArray[currentIndexForDownload];

        // Draw the current state into the fixed canvas.
        loadCanvasFromJsonForDownload(state, 'Common');
        //loadCanvasFromJson(state, 'Common');
        console.log("Canvas State Loaded:", state);

        // Now trigger the animation using the state's direction and effect.
        // You can modify applyAnimations to also use the effect if needed.
        await applyAnimationsforDownload(state.effect, state.direction, 'applyAnimations', state);

        //currentIndexForDownload++; // Move to the next JSON object

        //// Load next JSON after a delay (adjust the delay as needed) + parseFloat(selectedOutSpeed) || 4
        //const inTime = parseFloat(selectedInSpeed) || 4;
        //const stayTime = parseFloat(selectedStaySpeed) || 3;
        //const outTime = parseFloat(selectedOutSpeed) || 4;
        //const slideExecutionTime = inTime + stayTime + outTime;

        //setTimeout(loadNextJsonForDownload, slideExecutionTime * 1000 || 7000);

        // 2) small buffer
        await new Promise(r => setTimeout(r, 500));

        // 3) advance and recurse *with await*
        currentIndexForDownload++;
        await loadNextJsonForDownload();
      
       
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
                      
                        const targetUrl = window.location.origin + "/Canvas/VScreen1/1";
                        window.open(targetUrl, "_blank");
                        RedirectToVerticalPageWithQueryString();
                        HideLoader();
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



function animateContainerAsync(type) {
    type = 'zoomIn';
    return new Promise(resolve => {
        const dur = 3,
            props = {};

        switch (type) {
            case 'slideLeft': props.x = -canvasForDownload.width; break;
            case 'slideRight': props.x = canvasForDownload.width; break;
            case 'slideUp': props.y = -canvasForDownload.height; break;
            case 'slideDown': props.y = canvasForDownload.height; break;
            case 'fadeIn': transitionState.opacity = 0; props.opacity = 1; break;
            case 'fadeOut': props.opacity = 0; break;
            case 'zoomIn': transitionState.scale = 0.8; props.scale = 1.2; break;
            case 'zoomOut': transitionState.scale = 1.2; props.scale = 0.8; break;
            case 'dissolve': props.opacity = 0; break;
            default: break;
        }

        gsap.to(transitionState, {
            ...props,
            duration: dur,
            ease: 'power1.inOut',
            onUpdate: () => drawCanvasForDownload(currentCondition),
            onComplete: resolve
        });
    });
}



function animateCanvasImageElementForSingle(imgEl, type, duration = 3, opts = {}) {
    const { color, width } = opts;
    if (typeof imgEl === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(imgEl)) {
       
        ctxElementForDownload.fillStyle = imgEl;
        ctxElementForDownload.fillRect(0, 0, canvasForDownload.width, canvasForDownload.height);

        const colorImage = new Image();
        return new Promise((resolve) => {
            colorImage.onload = () => {
                const temp = {
                    type: 'image',
                    img: colorImage,
                    width: colorImage.naturalWidth || colorImage.width,
                    height: colorImage.naturalHeight || colorImage.height,
                    x: 0,
                    y: 0,
                    scaleX: 1,
                    scaleY: 1,
                    opacity: 1
                };
                images.push(temp);
                animateCanvasImage(temp, type, duration).then(() => {
                    images.pop();
                    resolve();
                });
            };
            colorImage.src = canvasForDownload.toDataURL();
        });
    }
   
    
    if (imgEl instanceof HTMLImageElement) {
        const imgWidth = 50;
        const imgHeight = canvasForDownload.height;

        const temp = {
            type: 'image',
            img: imgEl,
            width: imgWidth,
            height: imgHeight,
            x: canvasForDownload.width, // Start offscreen right
            y: 0,
            scaleX: 1,
            scaleY: 1,
            opacity: 1
        };

        images.push(temp);

        // 👇 animate from right to left using your function
        return animateCanvasImage(temp, type, duration).then(() => {
            images.pop();
        });
    }



    // Fallback if neither color code nor image
    return Promise.resolve();
}
/**
 * Loads one SVG <img>, draws it into an offscreen canvas
 * at opts.width × full-height and tints it with opts.color.
 * Returns a Promise<Image> for the fully ready tinted stripe.
 */
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


function animateCanvasImageElement(imgEl, type, duration = 3, opts = {}) {
    const color = opts.color;
    const width = parseInt(opts.width, 10);

    if (!(imgEl instanceof HTMLImageElement)) {
        // nothing to do
        return Promise.resolve();
    }

    return new Promise(resolve => {
        // 1) make an offscreen canvas the exact stripe size
        const off = document.createElement('canvas');
        off.width = width;
        off.height = canvasForDownload.height;
        const octx = off.getContext('2d');

        // 2) load the raw SVG
        const base = new Image();
        base.onload = () => {
            // draw the SVG scaled to [width × full height]
            octx.drawImage(base, 0, 0, width, off.height);

            // 3) tint only the non-transparent pixels
            octx.globalCompositeOperation = 'source-in';
            octx.fillStyle = color;
            octx.fillRect(0, 0, width, off.height);

            // 4) build a new Image from the tinted canvas
            const tinted = new Image();
            tinted.onload = () => {
                const temp = {
                    type: 'image',
                    img: tinted,
                    width,
                    height: off.height,
                    x: canvasForDownload.width, // start off-screen right
                    y: 0,
                    scaleX: 1,
                    scaleY: 1,
                    opacity: 1
                };
                images.push(temp);
                // animate and clean up
                animateCanvasImage(temp, type, duration).then(() => {
                    images.pop();
                    resolve();
                });
            };
            tinted.src = off.toDataURL();
        };
        base.src = imgEl.src;
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


function animateCanvasImageTodayOld(obj, type, duration = 3) {
    return new Promise(resolve => {
        // calculate display dimensions
        const dispW = obj.width * (obj.scaleX || 1);
        const dispH = obj.height * (obj.scaleY || 1);
        let toVars = { duration, ease: 'power1.inOut' };

        switch (type) {
            case 'slideLeft':
                toVars.x = -dispW - 5;
                break;
            case 'slideRight':
                toVars.x = canvasForDownload.width + 5;
                break;
            case 'slideUp':
                toVars.y = -dispH - 5;
                break;
            case 'slideDown':
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

        // animate object and redraw each frame
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
function animateCanvasImageElementOLD(imgOrColor, type, duration = 3) {
    const isColor = typeof imgOrColor === 'string';
    let temp;

    if (isColor) {
        // create a full‐canvas rectangle
        temp = {
            type: 'shape',
            shapeType: 'rect',
            x: 0, y: 0,
            width: canvasForDownload.width,
            height: canvasForDownload.height,
            fillColor: imgOrColor,
            opacity: 1,
            scaleX: 1, scaleY: 1
        };
        if (!Array.isArray(shapes)) shapes = [];
        shapes.push(temp);
        return animateCanvasShape(temp, type, duration)
            .then(() => shapes.pop());
    } else {
        // wrap an <img> element
        const imgEl = imgOrColor;
        temp = {
            type: 'image',
            img: imgEl,
            width: imgEl.naturalWidth,
            height: imgEl.naturalHeight,
            x: 0, y: 0,
            scaleX: 1, scaleY: 1,
            opacity: 1
        };
        images.push(temp);
        return animateCanvasImage(temp, type, duration)
            .then(() => images.pop());
    }
}

/**
 * Animate a canvas rectangle item by tweening its props.
 * @param {Object} shape – rectangle item with x,y,width,height,fillColor,opacity,scaleX/scaleY
 * @param {string} type
 * @param {number} duration
 * @returns {Promise}
 */
function animateCanvasShapeOLD(shape, type, duration = 3) {
    return new Promise(resolve => {
        const toVars = { duration, ease: 'power1.inOut' };
        switch (type) {
            case 'slideLeft': toVars.x = -shape.width - 5; break;
            case 'slideRight': toVars.x = canvasForDownload.width + 5; break;
            case 'slideUp': toVars.y = -shape.height - 5; break;
            case 'slideDown': toVars.y = canvasForDownload.height + 5; break;
            case 'fadeIn': shape.opacity = 0; toVars.opacity = 1; break;
            case 'fadeOut': toVars.opacity = 0; break;
            case 'zoomIn': shape.scaleX = shape.scaleY = 0.8; toVars.scaleX = toVars.scaleY = 1; break;
            case 'zoomOut': shape.scaleX = shape.scaleY = 1.2; toVars.scaleX = toVars.scaleY = 1; break;
            case 'dissolve': toVars.opacity = 0; break;
            default: break;
        }
        gsap.to(shape, {
            ...toVars,
            onUpdate: () => drawCanvasForDownload(currentCondition),
            onComplete: resolve
        });
    });
}



/**
 * Animate a DOM element in the page.
 * @param {string} selector  – CSS selector for your <img> (or any block element)
 * @param {string} type      – 'slideLeft'|'slideRight'|'slideUp'|'slideDown'|
 *                             'zoomIn'|'zoomOut'|'fadeIn'|'fadeOut'
 * @param {number} duration  – animation length in seconds (default: 3)
 */
function animateImageElement(selector, type, duration = 3) {
    const el = document.querySelector(selector);
    if (!el) {
        console.warn(`No element found for selector: ${selector}`);
        return;
    }

    // center‐origin for scale
    el.style.transformOrigin = '50% 50%';

    // build from/to vars
    let fromVars = {}, toVars = { duration, ease: 'power1.inOut' };

    switch (type) {
        case 'slideLeft':
            fromVars.xPercent = 0; toVars.xPercent = -100; break;
        case 'slideRight':
            fromVars.xPercent = 0; toVars.xPercent = 100; break;
        case 'slideUp':
            fromVars.yPercent = 0; toVars.yPercent = -100; break;
        case 'slideDown':
            fromVars.yPercent = 0; toVars.yPercent = 100; break;
        case 'fadeIn':
            fromVars.opacity = 0; toVars.opacity = 1; break;
        case 'fadeOut':
            fromVars.opacity = 1; toVars.opacity = 0; break;
        case 'zoomIn':
            fromVars.scale = 0.5; toVars.scale = 1; break;
        case 'zoomOut':
            fromVars.scale = 2; toVars.scale = 1; break;
        default:
            console.warn(`Unknown animation type: ${type}`);
            return;
    }

    // execute tween
    gsap.fromTo(el, fromVars, toVars);
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

    //// 4) commit: final fs + its wrapped lines + new boundingHeight
    //obj.fontSize = fs;
    //obj._wrappedLines = lines;
    ////obj.boundingHeight = lines.length * fs * 1.2 + 2 * padding;
    //const measuredWidths = lines.map(l => ctx2.measureText(l).width);
    //obj.boundingWidth = Math.max(...measuredWidths, 0) + 2 * padding;


    // Return new values instead of mutating the object
    return {
        fontSize: fs,
        wrappedLines: lines,
        boundingWidth: blockW + 2 * padding,
        boundingHeight: blockH + 2 * padding
    };
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

// reset transform to HiDPI + design scaling
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

            const raw = item.text;
            let lines = raw.includes('\n') ? raw.split('\n') : wrapText(ctxElementForDownload, raw, item.boundingWidth  * padding);
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



//function drawCanvasForDownload(condition) {
//    initializeLayers();
//    // 1) Refresh CTM: design→screen
//    resizeCanvas_d();           // must set ctx.resetTransform(); ctx.scale(dpr,dpr); ctx.scale(scaleX,scaleY);
//    const dpr = window.devicePixelRatio || 1;

//    // compute “design‐space” dimensions for clearing
//    const designW = canvasForDownload.width / dpr / scaleX;
//    const designH = canvasForDownload.height / dpr / scaleY;
//    // 2) Clear & draw background (in design units)
//    ctxElementForDownload.clearRect(0, 0, designW, designH);
//    const bgColor = document.getElementById('hdnBackgroundSpecificColorDownload').value.trim();

//    if (bgColor) {
//        ctxElementForDownload.fillStyle = bgColor;
//        ctxElementForDownload.fillRect(0, 0, designW, designH);

//    }
//    //if (canvas.bgImage) {
//    //    ctx.drawImage(canvas.bgImage, 0, 0, designW, designH);
//    //}
//    if (canvas._bgImg) {
//        ctxElementForDownload.drawImage(canvas._bgImg, 0, 0, designW, designH);
//    }

//    allItems.forEach(item => {

//        if (item.type === 'image') {
//            // design→screen position & size
//            const x = item.x;
//            const y = item.y;
//            const w = item.width * (item.scaleX || 1);
//            const h = item.height * (item.scaleY || 1);
//            const rotation = (item.rotation || 0) * Math.PI / 180; // radians

//            // lazy-load if this imgObj has no <img> yet
//            if (!item.img) {
//                const img = new Image();
//                img.crossOrigin = 'anonymous';
//                img.onload = () => {
//                    item.img = img;
//                    drawCanvasForDownload(condition);
//                };
//                img.src = item.svgData || item.src;
//                return;
//            }


//            //// 3c) Draw with correct center‐pivot rotation:
//            ctxElementForDownload.save();
//            ctxElementForDownload.globalAlpha = item.opacity || 1;

//            // 1) Move origin to the image’s center
//            const cx = x + w / 2;
//            const cy = y + h / 2;
//            ctxElementForDownload.translate(cx, cy);

//            // 2) Apply rotation about that center
//            ctxElementForDownload.rotate(rotation);

//            // 3) Apply scale (if any) in this rotated coordinate system
//            ctxElementForDownload.scale(item.scaleX || 1, item.scaleY || 1);
//            // 4) Draw the image so that its center is at (0,0):
//            //    since we translated to (cx, cy), drawing from (−w/2, −h/2) puts top‐left at the correct spot.
//            try {
//                ctxElementForDownload.drawImage(
//                    item.img,
//                    - (item.width / 2),    // −(original width)/2
//                    - (item.height / 2),   // −(original height)/2
//                    item.width,
//                    item.height
//                );
//            } catch (e) {
//                // silent if drawImage fails
//            }

//            ctxElementForDownload.restore();
//        }
//        else if (item.type === 'text' && ['Common', 'ChangeStyle', 'applyAnimations'].includes(condition)) {
//            ctxElementForDownload.save();
//            ctxElementForDownload.globalAlpha = item.opacity || 1;
//            // ctxElementForDownload.font = `${obj.fontSize}px ${obj.fontFamily}`;
//            let styleParts = [];
//            if (item.isItalic) styleParts.push("italic");
//            if (item.isBold) styleParts.push("bold");
//            styleParts.push(`${item.fontSize}px`);
//            styleParts.push(item.fontFamily);
//            ctxElementForDownload.font = styleParts.join(" ");

//            ctxElementForDownload.fillStyle = item.textColor;
//            ctxElementForDownload.textBaseline = "top";

//            const x = item.x;
//            const y = item.y;

//            const pad = padding;
//            const maxW = item.boundingWidth - 2 * pad;
//            const rotation = (item.rotation || 0) * Math.PI / 180;
//            //// split or wrap
//            //const lines = obj.text.includes('\n')
//            //    ? obj.text.split('\n')
//            //    : wrapText(ctxElementForDownload, obj.text, maxW);
//            const raw = item.text;
//            let lines;
//            if (raw.includes('\n')) {
//                lines = raw.split('\n');
//            } else {
//                const fullW = ctxElementForDownload.measureText(raw).width;
//                const maxW = item.boundingWidth * designW - 2 * padding;
//                if (!raw.includes(' ') && fullW <= maxW) {
//                    // single “word” that actually fits: keep it one line
//                    lines = [raw];
//                } else {
//                    // otherwise do your normal word-wrap
//                    lines = wrapText(ctxElementForDownload, raw, maxW);
//                }
//            }

//            // line height in px
//            const fs = item.fontSize;
//            const lineH = item.lineSpacing * fs;

//            // measure true ink-width
//            let maxLineW = 0;
//            lines.forEach(line => {
//                const m = ctxElementForDownload.measureText(line);
//                const glyphW = (m.actualBoundingBoxLeft != null && m.actualBoundingBoxRight != null)
//                    ? m.actualBoundingBoxLeft + m.actualBoundingBoxRight
//                    : m.width;
//                maxLineW = Math.max(maxLineW, glyphW);
//            });



//            // compute overlap buffer *only* if spacing < 1
//            const overlap = Math.max(0, 1 - item.lineSpacing);
//            const extraPerLine = overlap * fs;

//            // base box size in px (always include any overlap buffer)
//            const totalTextH = lines.length * lineH;
//            const baseWpx = maxLineW + 2 * pad + extraPerLine;
//            const baseHpx = totalTextH + 2 * pad + extraPerLine;

//            // extra margin *only* when lineSpacing < 1
//            const extraMarginFraction = 0.6;            // tweak this as % of font
//            const extraMargin = item.lineSpacing < 1
//                ? fs * extraMarginFraction
//                : 0;

//            // final box size
//            const boxWpx = Math.ceil(baseWpx + extraMargin);
//            const boxHpx = Math.ceil(baseHpx + extraMargin);

//            // overwrite props
//            item.boundingWidth = boxWpx;
//            item.boundingHeight = boxHpx;

//            const cx = x + boxWpx / 2;
//            const cy = y + boxHpx / 2;

//            // 4f) Translate → rotate around center
//            ctxElementForDownload.translate(cx, cy);
//            ctxElementForDownload.rotate(rotation);
//            ctxElementForDownload.translate(-cx, -cy);

//            // clipping & drawing
//            const maxLines = Math.floor((boxHpx - 2 * pad) / lineH);
//            const startY = y + pad;

//            lines.slice(0, maxLines).forEach((line, i) => {
//                const lw = ctxElementForDownload.measureText(line).width;
//                let offsetX = x + pad;
//                if (item.textAlign === 'center') {
//                    offsetX = x + (boxWpx - lw) / 2;
//                } else if (item.textAlign === 'right') {
//                    offsetX = x + boxWpx - lw - pad;
//                }
//                ctxElementForDownload.fillText(line, offsetX, startY + i * lineH);
//            });

//            ctxElementForDownload.restore();
//        }
//    });






   


//    function toPixelSpace(fn) {
//        ctxElementForDownload.save();
//        ctxElementForDownload.resetTransform();    // drop design→screen CTM
//        ctxElementForDownload.scale(dpr, dpr);     // keep only HiDPI
//        fn();
//        ctxElementForDownload.restore();
//    }

//    // 5a) Image selections
//    toPixelSpace(() => {
//        images.forEach(imgObj => {
//            if (!imgObj.selected) return;
//            // compute pixel coords from design coords
//            const xPx = imgObj.x * scaleX;
//            const yPx = imgObj.y * scaleY;
//            const wPx = imgObj.width * (imgObj.scaleX || 1) * scaleX;
//            const hPx = imgObj.height * (imgObj.scaleY || 1) * scaleY;

//            ctxElementForDownload.strokeStyle = "blue";
//            ctxElementForDownload.lineWidth = 2;
//            ctxElementForDownload.strokeRect(xPx, yPx, wPx, hPx);

//            ctxElementForDownload.fillStyle = "red";
//            const hs = getImageResizeHandles(imgObj)
//                .map(pt => ({ x: pt.x * scaleX, y: pt.y * scaleY }));
//            const halfH = handleSize / 2;
//            hs.forEach(pt => {
//                ctxElementForDownload.fillRect(pt.x - halfH, pt.y - halfH, handleSize, handleSize);
//            });
//        });
//    });

//    // 5b) Text selections
//    // 5b) Text selections (with 8 handles)
//    toPixelSpace(() => {
//        textObjects.forEach(obj => {
//            if (!obj.selected) return;

//            const xPx = obj.x * scaleX;
//            const yPx = obj.y * scaleY;
//            const wPx = obj.boundingWidth * scaleX;
//            const hPx = obj.boundingHeight * scaleY;

//            // draw rounded‐rect around text
//            drawRoundedRect(
//                ctxElementForDownload,
//                xPx - padding * scaleX,
//                yPx - padding * scaleY,
//                wPx + 2 * padding * scaleX - RECT_WIDTH_ADJUST * scaleX,
//                hPx + 2 * padding * scaleY - RECT_HEIGHT_ADJUST * scaleY,
//                5 * scaleX
//            );

//            // all 8 handles: corners + midpoints
//            ctxElementForDownload.fillStyle = "#FF7F50";
//            const halfW = handleSize / 2;
//            const liftY = 2;   // tweak Y offset if needed

//            const handlePoints = [
//                // corners
//                { x: xPx, y: yPx },        // top-left
//                { x: xPx + wPx, y: yPx },        // top-right
//                { x: xPx, y: yPx + hPx },  // bottom-left
//                { x: xPx + wPx, y: yPx + hPx },  // bottom-right
//                // midpoints
//                // { x: xPx + wPx / 2, y: yPx },        // top-middle
//                //{ x: xPx + wPx / 2, y: yPx + hPx },  // bottom-middle
//                { x: xPx, y: yPx + hPx / 2 }, // left-middle
//                { x: xPx + wPx, y: yPx + hPx / 2 }  // right-middle
//            ];

//            handlePoints.forEach(pt => {
//                ctxElementForDownload.fillRect(pt.x - halfW, pt.y - halfW - liftY, handleSize, handleSize);
//            });
//        });
//    });

//    // 6) reset alpha
//    ctxElementForDownload.globalAlpha = 1;
//}

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
function getCanvasBackgroundColorHex(rgb) {
    const result = rgb.match(/\d+/g); // Extract numbers from "rgb(255, 255, 255)"
    if (!result || result.length < 3) return null;

    const [r, g, b] = result.map(Number);

    return "#" + [r, g, b]
        .map(c => c.toString(16).padStart(2, '0'))
        .join('');
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

async function animateTextForDownload(animationType, direction, condition, loopCount, state) {

    selectedInSpeed = parseInt(document.getElementById('lblSpeed').textContent);
    selectedOutSpeed = parseInt(document.getElementById('lblOutSpeed').textContent);
    selectedStaySpeed = parseInt(document.getElementById('lblSeconds').textContent);
    // Global timing settings (from your selected speeds).
    const inTime = parseFloat(selectedInSpeed) || 4; // seconds
    const outTime = parseFloat(selectedOutSpeed) || 4;
    const stayTime = parseFloat(selectedStaySpeed) || 3;
    const Outdirection = state.outDirection || 'right'
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
                obj.x = -(obj.boundingWidth + 5);
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
                obj.exitY = -(obj.boundingHeight + 25);
                break;
            case "bottom":
                obj.exitX = obj.finalX;
                obj.exitY = canvasForDownload.height + 5;
                break;
            case "left":
                obj.exitX = -(obj.boundingWidth + 5);
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
                imgObj.exitY = -(dispHeight + 55);
                break;
            case "bottom":
                imgObj.exitX = imgObj.finalX;
                imgObj.exitY = canvasForDownload.height + 5;
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




     //   console.log("TL duration:", tlText.duration(), "seconds");
       
        });
    

     if (animationType === "linear" || animationType === "zoom" ||
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

