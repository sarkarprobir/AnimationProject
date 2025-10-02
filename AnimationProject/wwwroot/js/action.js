
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
                    { slideSeq: "#hdnSlideSequence1", json: verticalSlide1, hdnField: "#hdnDesignBoardDetailsIdSlide1", slideName: "#hdnSlideName1", effect: "#hdnEffectSlide1", direction: "#hdnDirectiontSlide1", outEffect: "#hdnOutEffectSlide1", outDirection: "#hdnOutDirectiontSlide1", animationVideoPath: "#hdnDesignBoardDetailsIdSlideFilePath1", animationImagePath: "#hdnDesignBoardDetailsIdSlideImageFilePath1" },
                    { slideSeq: "#hdnSlideSequence2", json: verticalSlide2, hdnField: "#hdnDesignBoardDetailsIdSlide2", slideName: "#hdnSlideName2", effect: "#hdnEffectSlide2", direction: "#hdnDirectiontSlide2", outEffect: "#hdnOutEffectSlide2", outDirection: "#hdnOutDirectiontSlide2", animationVideoPath: "#hdnDesignBoardDetailsIdSlideFilePath2", animationImagePath: "#hdnDesignBoardDetailsIdSlideImageFilePath2" },
                    { slideSeq: "#hdnSlideSequence3", json: verticalSlide3, hdnField: "#hdnDesignBoardDetailsIdSlide3", slideName: "#hdnSlideName3", effect: "#hdnEffectSlide3", direction: "#hdnDirectiontSlide3", outEffect: "#hdnOutEffectSlide3", outDirection: "#hdnOutDirectiontSlide3", animationVideoPath: "#hdnDesignBoardDetailsIdSlideFilePath3", animationImagePath: "#hdnDesignBoardDetailsIdSlideImageFilePath3" }
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

                    var currentslideSeq = $(slide.slideSeq).val() ;
                    var currentslideName = $(slide.slideName).val();

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
                        SlideSequence: currentslideSeq,
                        JsonFile: slide.json,
                        SlideName: currentslideName,
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

                                // count only entries that actually have an <img> we can wait on
                                const totalToWait = (Array.isArray(images) ? images : []).reduce((n, it) => {
                                    const el = it && it.img;
                                    return n + (el && typeof el.complete === "boolean" ? 1 : 0);
                                }, 0);

                                if (totalToWait === 0) {
                                    captureSlide(activeSlide, slideResult);
                                } else {
                                    images.forEach(img => {
                                        const el = img && img.img; // HTMLImageElement

                                        // 🔒 guard: skip items without a real <img>
                                        if (!el || typeof el.complete !== "boolean") return;

                                        // ✅ keep the same sequence: if (!el.complete) { ... } else { ... }
                                        if (!el.complete || el.naturalWidth === 0) {
                                            const onDone = () => {
                                                el.removeEventListener("load", onDone);
                                                el.removeEventListener("error", onDone);
                                                loadedCount++;
                                                if (loadedCount === totalToWait) captureSlide(activeSlide, slideResult);
                                            };
                                            el.addEventListener("load", onDone, { once: true });
                                            el.addEventListener("error", onDone, { once: true });
                                        } else {
                                            loadedCount++;
                                            if (loadedCount === totalToWait) captureSlide(activeSlide, slideResult);
                                        }
                                    });
                                }


                               // if (loadedCount === images.length) captureSlide(activeSlide, slideResult); // If all images are already loaded

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
function waitForBoxImage(box) {
    // box missing, not an image box, or no actual image element → nothing to wait for
    const img = box && box.img;
    if (!(img instanceof HTMLImageElement)) return Promise.resolve();

    // already loaded & valid pixels?
    if (img.complete && img.naturalWidth > 0) return Promise.resolve();

    // modern: try decode(); falls back to load/error listeners
    if (typeof img.decode === 'function') {
        return img.decode().catch(() => { });  // treat decode error as non-fatal
    }

    return new Promise(resolve => {
        const done = () => {
            img.removeEventListener('load', done);
            img.removeEventListener('error', done);
            resolve();
        };
        img.addEventListener('load', done, { once: true });
        img.addEventListener('error', done, { once: true });
    });
}

async function captureSlide(activeSlide, slideResult) {
    const canvas = document.getElementById("myCanvas");
    const ctx = canvas.getContext("2d");

    // 1) Wait for fonts and images used by boxes (safer to wait BEFORE drawing)
    const imgList = Array.isArray(images) ? images : [];
    await Promise.all([
        (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve(),
        ...imgList.map(waitForBoxImage)
    ]);

    // 2) Now render once with everything loaded
    drawTextForDownload();
    // 2) Wait for any <img> or <svg> in the DOM to be fully loaded:
    const imgs = images;//Array.from(document.querySelectorAll("img, svg"));
    await Promise.all(imgs.map(el => {
        const img = el?.img;
        if (!(img instanceof HTMLImageElement)) return Promise.resolve();
        if (img.complete && img.naturalWidth > 0) return Promise.resolve();
        if (typeof img.decode === 'function') return img.decode().catch(() => { });
        return new Promise(res => {
            img.addEventListener('load', res, { once: true });
            img.addEventListener('error', res, { once: true });
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
    window.location = `${baseURL}Canvas/VerticalIndex?id=${boardId}`;
    HideLoader();
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
   // resizeCanvas();
}
function unitToPx(v, screen) {
    if (v == null) return null;
    return (v > 1) ? v : v * screen;          // >1 => px; <=1 => %
}
function pxToUnit(px, screen) {
    if (!screen || px == null) return 0;
    return px / screen;                        // always save as %
}

// ──────────────────────────────────────────────────────────────────────
// 1) SAVE: record everything as relative % of the canvas
// ──────────────────────────────────────────────────────────────────────
function readStrokeWidth(selector = '#ddlStrokeWidth', fallback = 1) {
    const el = document.querySelector(selector);
    const raw = el?.value;

    if (raw == null || raw === '') return fallback;

    // allow "0,5" -> 0.5 too
    const n = Number(String(raw).trim().replace(',', '.'));
    if (!Number.isFinite(n)) return fallback;

    // snap to one decimal place
    const snapped = Math.round(n * 10) / 10;

    // return a Number, formatted as:
    //  - integer: 0, 1, 5
    //  - decimal: 0.1, 0.5 (one decimal place)
    return Number.isInteger(snapped) ? snapped : Number.parseFloat(snapped.toFixed(1));
}


function saveCanvasData() {
    const rect = canvas.getBoundingClientRect();
    const screenW = rect.width || 1;
    const screenH = rect.height || 1;

    const data = {
        canvasBgColor: canvas.style.backgroundColor || "#ffffff",
        canvasBgImage: canvas._bgImg ? canvas._bgImg.src : "",
        slideEffect: $("#hdnTextAnimationType").val(),
        slideDedirection: $("#hdnslideDedirection").val(),

        // TEXT → always save % (idempotent)
        text: (textObjects || []).map(o => ({
            type: o.type || "text",
            text: o.text || "",
            x: pxToUnit(o.x || 0, screenW),
            y: pxToUnit(o.y || 0, screenH),
            width: pxToUnit(o.width ?? o.boundingWidth ?? 0, screenW) || 0.2,
            height: pxToUnit(o.height ?? o.boundingHeight ?? 0, screenH) || 0,
            align: o.align || o.textAlign || "left",
            fontSize: o.fontSize,
            fontFamily: o.fontFamily,
            textColor: o.textColor,
            opacity: o.opacity,
            lineSpacing: o.lineSpacing,
            noAnim: !!o.noAnim,
            groupId: o.groupId,
            rotation: o.rotation,
            isBold: !!o.isBold,
            isItalic: !!o.isItalic,
            zIndex: (typeof o.zIndex === "number") ? o.zIndex : 0
        })),

        // IMAGES (unchanged; already %)
        images: (images || []).map(img => {
            const dispW = (img.width || 0) * (img.scaleX || 1);
            const dispH = (img.height || 0) * (img.scaleY || 1);
            return {
                type: img.type || "image",
                src: img.svgData || img.src,
                x: pxToUnit(img.x || 0, screenW),
                y: pxToUnit(img.y || 0, screenH),
                width: pxToUnit(dispW || 0, screenW) || 0.2,
                height: pxToUnit(dispH || 0, screenH) || 0.2,
                opacity: img.opacity,
                noAnim: !!img.noAnim,
                groupId: img.groupId,
                rotation: img.rotation,
                zIndex: (typeof img.zIndex === "number") ? img.zIndex : 0,
                fillNoColorStatus: img.fillNoColorStatus,//$("#hdnfillNoColorStatus").val(),
                strokeNoColorStatus: img.strokeNoColorStatus,//$("#hdnstrokeNoColorStatus").val(),
                fillNoColor: img.fillNoColor,//$("#hdnfillColor").val(),
                strokeNoColor: img.strokeNoColor, //$("#hdnStrockColor").val(),
                strokeWidth: img.strokeWidth,
                isBasic: img.isBasic,
                isLINESvg: img.isLINESvg,
                __capsOrientation: img.__capsOrientation,
                curvature: img.curvature
            };
        })
    };

    return JSON.stringify(data, null, 2);
}

function GetDesignBoardById(id,type='') {
   
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
                    if (type == 'duplicate') {
                        $("#hdnDesignBoardId").val();
                        $("#txtSaveDesignBoardName").val();
                        $('#designboardLink').text();
                        $('#designBoardName').text();
                    }
                    else {
                        $("#hdnDesignBoardId").val(result.designBoardId);
                        $("#txtSaveDesignBoardName").val(result.designBoardName);
                        $('#designboardLink').text(result.designBoardURL);
                        $('#designBoardName').text(result.designBoardName);
                    }
                    

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
                    if (type != 'duplicate') {
                        setHiddenField(0, '#hdnDesignBoardDetailsIdSlide1');
                        setHiddenField(1, '#hdnDesignBoardDetailsIdSlide2');
                        setHiddenField(2, '#hdnDesignBoardDetailsIdSlide3');
                    }

                    // Update hidden fields with safety checks
                    const setHiddenFieldeffect = (index, selector) => {
                        const value = result.designBoardDetailsList[index]?.effect || '';
                        $(selector).val(value);
                       
                    };

                    setHiddenFieldeffect(0, '#hdnEffectSlide1');
                    setHiddenFieldeffect(1, '#hdnEffectSlide2');
                    setHiddenFieldeffect(2, '#hdnEffectSlide3');

                    // Update hidden fields with safety checks
                    const setHiddenFieldSlideSequence = (index, selector) => {
                        const value = result.designBoardDetailsList[index]?.slideSequence || '';
                        $(selector).val(value);

                    };

                    setHiddenFieldSlideSequence(0, '#hdnSlideSequence1');
                    setHiddenFieldSlideSequence(1, '#hdnSlideSequence2');
                    setHiddenFieldSlideSequence(2, '#hdnSlideSequence3');

                    // Update hidden fields with safety checks
                    const setHiddenFieldSlideName = (index, selector) => {
                        const value = result.designBoardDetailsList[index]?.slideName || '';
                        $(selector).val(value);

                    };

                    setHiddenFieldSlideName(0, '#hdnSlideName1');
                    setHiddenFieldSlideName(1, '#hdnSlideName2');
                    setHiddenFieldSlideName(2, '#hdnSlideName3');



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
            'Arial Regular', 'Anton', 'Bebas Neue', 'monstro', 'Montserrat', 'neto', 'Pacifico', 'Roboto', 'Helvetica', 'Georgia Regular',
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

async function loadCanvasFromJsonOLD(jsonData, condition = 'Common') {
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
            width: obj.width,
            height: obj.height,
            align: obj.textAlign
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
        o.fillNoColorStatus = imgObj.fillNoColorStatus ||false;
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
        // drawCanvas(condition);
        drawTextForDownload();
       // resizeCanvas();
    });
}

async function loadCanvasFromJsonOLD(jsonData, condition = 'Common') {
    await ensureFontsInitialized();

    // Clear & set condition
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    currentCondition = condition;

    if (!jsonData) {
        await document.fonts.ready;
        drawTextForDownload();
        return;
    }

    const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
    slideData = data;

    // Background color
    canvasBgColor = data.canvasBgColor || '#ffffff';
    document.getElementById('hdnBackgroundSpecificColor').value = canvasBgColor;
    canvas.style.backgroundColor = canvasBgColor;

    // Canvas CSS → device px (for normalized coords)
    const rect = canvas.getBoundingClientRect();
    const screenW = rect.width;
    const screenH = rect.height;

    // ---------- Preload background image (promise) ----------
    const bgPromise = data.canvasBgImage
        ? new Promise(resolve => {
            const bg = new Image();
            bg.crossOrigin = 'anonymous';
            bg.onload = () => { canvas._bgImg = bg; resolve(); };
            bg.onerror = () => { canvas._bgImg = null; resolve(); };
            bg.src = data.canvasBgImage;
        })
        : Promise.resolve(canvas._bgImg = null);

    // ---------- Build text objects with usable width/height ----------
    const padding = 5; // (use your existing padding)
    textObjects = (data.text || []).map(obj => {
        const bw_norm = (obj.boundingWidth ?? obj.width ?? 0) * screenW;
        const bh_norm = (obj.boundingHeight ?? obj.height ?? 0) * screenH;

        const fontPx = obj.fontSize;
        const lineH = fontPx * 1.2;

        // Manual line breaks height
        const manualLines = String(obj.text ?? "").split("\n");
        const hasManual = manualLines.length > 1;

        const neededHeight = hasManual
            ? (manualLines.length * lineH + 2 * padding)
            : bh_norm;

        const finalWidth = Math.max(10, bw_norm || 50);        // ensure sane defaults
        const finalHeight = Math.max(10, neededHeight || 30);

        let ty = (obj.y ?? 0) * screenH;
        if (ty + finalHeight + padding > screenH) {
            ty = screenH - finalHeight - padding;
        }

        return {
            text: obj.text || "",
            x: (obj.x ?? 0) * screenW,
            y: ty,
            width: finalWidth,                  // ✅ set width now
            height: finalHeight,                // ✅ set height now
            boundingWidth: finalWidth,
            boundingHeight: finalHeight,
            fontSize: fontPx,
            fontFamily: obj.fontFamily,
            textColor: obj.textColor,
            textAlign: obj.textAlign,
            align: obj.textAlign,
            opacity: obj.opacity ?? 100,
            selected: false,
            _hasManualBreaks: hasManual,
            lineSpacing: (typeof obj.lineSpacing === 'number')
                ? obj.lineSpacing : 1.2,
            noAnim: obj.noAnim,
            groupId: obj.groupId,
            rotation: obj.rotation || 0,
            isBold: !!obj.isBold,
            isItalic: !!obj.isItalic,
            type: obj.type || 'text',
            zIndex: obj.zIndex || getNextZIndex()
        };
    });

    // ---------- Preload images (promises) ----------
    const imagesInput = data.images || [];
    const imagePromises = imagesInput.map(imgObj => new Promise(resolve => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve({ ok: true, img });
        img.onerror = () => resolve({ ok: false, img: null });
        img.src = imgObj.src;
    }));

    const loadedImages = await Promise.all(imagePromises);

    images = imagesInput.map((imgObj, i) => {
        const entry = loadedImages[i];
        const img = entry && entry.ok ? entry.img : null;

        return {
            ...imgObj,
            x: (imgObj.x ?? 0) * screenW,
            y: (imgObj.y ?? 0) * screenH,
            width: (imgObj.width ?? 0) * screenW,
            height: (imgObj.height ?? 0) * screenH,
            selected: false,
            img,
            noAnim: imgObj.noAnim,
            groupId: imgObj.groupId,
            rotation: imgObj.rotation || 0,
            type: imgObj.type || 'image',
            zIndex: imgObj.zIndex || getNextZIndex(),
            fillNoColorStatus: !!imgObj.fillNoColorStatus,
            strokeNoColorStatus: !!imgObj.strokeNoColorStatus,
            fillNoColor: imgObj.fillNoColor || "#FFFFFF",
            strokeNoColor: imgObj.strokeNoColor || "#FFFFFF",
            strokeWidth: imgObj.strokeWidth || 3
        };
    });

    // ---------- Load fonts for each text object ----------
    const fontPromises = textObjects.map(o =>
        document.fonts.load(`${o.fontSize}px ${o.fontFamily}`)
    );

    // Wait for everything (bg + images + fonts)
    await Promise.all([bgPromise, ...fontPromises]);

    // ---------- Now that fonts are loaded, fit text if you want ----------
    textObjects.forEach(obj => {
        // If you only want autofit when no manual breaks:
        // if (!obj._hasManualBreaks) autoFitTextNew(obj, padding);
        autoFitTextNew(obj, padding); // as in your current code
    });

    // ---------- Single, final draw ----------
    drawTextForDownload();
}
async function loadCanvasFromJson(jsonData, condition = 'Common') {
        await ensureFontsInitialized?.();
 
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    currentCondition = condition;

    if (!jsonData) {
        await document.fonts.ready;
        drawText();
        return;
    }

    const data = (typeof jsonData === "string") ? JSON.parse(jsonData) : jsonData;

    // canvas size in design pixels
    const W = canvas.width || 0;
    const H = canvas.height || 0;

    // unit -> px for TEXT only (keep your convenience here)
    function unitToPxLocal(v, dim, FRACTION_THRESHOLD = 5) {
        if (typeof v === 'string') {
            const s = v.trim().toLowerCase();
            if (s.endsWith('%')) return (parseFloat(s) / 100) * dim;
            if (s.endsWith('px')) return parseFloat(s);
            const n = Number(s);
            if (Number.isFinite(n)) v = n; else return 0;
        }
        const n = Number(v);
        if (!Number.isFinite(n)) return 0;
        return (Math.abs(n) <= FRACTION_THRESHOLD) ? (n * dim) : n;
    }

    const fileName = (src) => {
        try { return new URL(String(src), location.href).pathname.split('/').pop()?.toLowerCase() || ""; }
        catch { return String(src).split(/[?#]/)[0].split('/').pop()?.toLowerCase() || ""; }
    };

    const isLineBasicBySrc = (im) => {
        if (!im?.isBasic) return false;
        const n = fileName(im.src);
        return n === 'ico-shapes-line.svg' || n === 'ico-shapes-line';
    };

    // background
    const bg = data.canvasBgColor || '#ffffff';
    const bgEl = document.getElementById('hdnBackgroundSpecificColor');
    if (bgEl) bgEl.value = bg;
    canvas.style.backgroundColor = bg;

    const bgPromise = data.canvasBgImage
        ? new Promise(resolve => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => { canvas._bgImg = img; resolve(); };
            img.onerror = () => { canvas._bgImg = null; resolve(); };
            img.src = data.canvasBgImage;
        })
        : Promise.resolve(canvas._bgImg = null);

    // TEXT
    const padding = 5;
    textObjects = (data.text || []).map(t => {
        const wPx = unitToPxLocal(t.width ?? t.boundingWidth ?? 0.2, W);
        const hPx = unitToPxLocal(t.height ?? t.boundingHeight ?? 0, H);

        const fontPx = t.fontSize;
        const lineH = (fontPx ? fontPx * (t.lineSpacing || 1.2) : 18);
        const linesArr = String(t.text ?? "").split("\n");
        const hasManual = linesArr.length > 1;
        const neededH = hasManual ? (linesArr.length * lineH + 2 * padding) : (hPx || 0);

        const finalW = Math.max(10, Number.isFinite(wPx) ? wPx : 50);
        const finalH = Math.max(10, Number.isFinite(neededH) ? neededH : 30);

        let xPx = unitToPxLocal(t.x ?? 0, W);
        let yPx = unitToPxLocal(t.y ?? 0, H);

        // keep the text inside on load (text is usually not meant to overflow)
        if (xPx + finalW + padding > W) xPx = Math.max(0, W - finalW - padding);
        if (yPx + finalH + padding > H) yPx = Math.max(0, H - finalH - padding);
        if (xPx < 0) xPx = 0;
        if (yPx < 0) yPx = 0;

        return {
            type: t.type || 'text',
            text: t.text || "",
            x: xPx, y: yPx,
            width: finalW, height: finalH,
            boundingWidth: finalW, boundingHeight: finalH,
            align: t.align || t.textAlign || "left",
            fontSize: t.fontSize, fontFamily: t.fontFamily, textColor: t.textColor,
            opacity: (t.opacity ?? 100),
            lineSpacing: (typeof t.lineSpacing === 'number') ? t.lineSpacing : 1.2,
            noAnim: !!t.noAnim, groupId: t.groupId ?? null, rotation: t.rotation || 0,
            isBold: !!t.isBold, isItalic: !!t.isItalic,
            zIndex: (typeof t.zIndex === "number") ? t.zIndex : 0,
            selected: false, _hasManualBreaks: hasManual
        };
    });

    // IMAGES — ALWAYS normalized -> px, and **no clamp on load**
    const imagesInput = data.images || [];
    const imagePromises = imagesInput.map(imgObj => new Promise(resolve => {
        if (!imgObj?.src) return resolve({ ok: false, img: null });
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve({ ok: true, img });
        img.onerror = () => resolve({ ok: false, img: null });
        img.src = imgObj.src;
    }));
    const loaded = await Promise.all(imagePromises);

    images = imagesInput.map((im, i) => {
        const entry = loaded[i];
        const img = entry && entry.ok ? entry.img : null;

        // 🔒 Interpret numbers as normalized fractions of the canvas
        let x = (Number(im.x) || 0) * W;
        let y = (Number(im.y) || 0) * H;
        let width = Math.max(1, (Number(im.width) || 0.2) * W);
        let height = Math.max(1, (Number(im.height) || 0.2) * H);

        if (isLineBasicBySrc(im)) height = 1;

        const box = {
            type: im.type || 'image',
            src: im.src,
            img,
            x, y, width, height,
            scaleX: 1, scaleY: 1,
            opacity: (typeof im.opacity === 'number') ? im.opacity : 100,
            noAnim: !!im.noAnim, groupId: im.groupId ?? null, rotation: im.rotation || 0,
            zIndex: (typeof im.zIndex === "number") ? im.zIndex : 0,
            selected: false,
            fillNoColorStatus: !!im.fillNoColorStatus,
            strokeNoColorStatus: !!im.strokeNoColorStatus,
            fillNoColor: im.fillNoColor || "#FFFFFF",
            strokeNoColor: im.strokeNoColor || "#FFFFFF",
            strokeWidth: im.strokeWidth || 3,
            isBasic: im.isBasic ?? false,
            isLINESvg: im.isLINESvg ?? false,
            __capsOrientation: im.__capsOrientation ?? 'horizontal',
            curvature: im.curvature||0
        };

        // ⛔️ NO clamp here — preserve exact saved layout (even if it overflows)
        return box;
    });

    // fonts
    const fontPromises = textObjects.map(o => {
        if (!o.fontSize || !o.fontFamily) return Promise.resolve();
        return document.fonts.load(`${o.fontSize}px ${o.fontFamily}`);
    });

    await Promise.allSettled([bgPromise, ...fontPromises, document.fonts.ready]);

    drawText();
}


async function loadCanvasFromJson_06_09(jsonData, condition = 'Common') {
    await ensureFontsInitialized?.();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    currentCondition = condition;

    if (!jsonData) {
        await document.fonts.ready;
        drawText();
        return;
    }

    const data = (typeof jsonData === "string") ? JSON.parse(jsonData) : jsonData;

    // bg color
    const bg = data.canvasBgColor || '#ffffff';
    const bgEl = document.getElementById('hdnBackgroundSpecificColor');
    if (bgEl) bgEl.value = bg;
    canvas.style.backgroundColor = bg;

    const rect = canvas.getBoundingClientRect();
    const screenW = rect.width || 1;
    const screenH = rect.height || 1;

    // bg image
    const bgPromise = data.canvasBgImage
        ? new Promise(resolve => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => { canvas._bgImg = img; resolve(); };
            img.onerror = () => { canvas._bgImg = null; resolve(); };
            img.src = data.canvasBgImage;
        })
        : Promise.resolve(canvas._bgImg = null);

    // --- TEXT (unit-aware) ---
    const padding = 5;
    textObjects = (data.text || []).map(t => {
        const wPx = unitToPx(t.width ?? t.boundingWidth ?? 0.2, screenW);
        const hPx = unitToPx(t.height ?? t.boundingHeight ?? 0, screenH);

        const fontPx = t.fontSize;
        const lineH = (fontPx ? fontPx * (t.lineSpacing || 1.2) : 18);
        const manualLines = String(t.text ?? "").split("\n");
        const hasManual = manualLines.length > 1;
        const neededH = hasManual ? (manualLines.length * lineH + 2 * padding) : (hPx || 0);

        const finalW = Math.max(10, Number.isFinite(wPx) ? wPx : 50);
        const finalH = Math.max(10, Number.isFinite(neededH) ? neededH : 30);

        let yPx = unitToPx(t.y ?? 0, screenH);
        if (yPx + finalH + padding > screenH) yPx = screenH - finalH - padding;

        return {
            type: t.type || 'text',
            text: t.text || "",
            x: unitToPx(t.x ?? 0, screenW),
            y: yPx,
            width: finalW,
            height: finalH,
            boundingWidth: finalW,   // optional legacy fields
            boundingHeight: finalH,

            align: t.align || t.textAlign || "left",
            fontSize: t.fontSize,
            fontFamily: t.fontFamily,
            textColor: t.textColor,
            opacity: (t.opacity ?? 100),
            lineSpacing: (typeof t.lineSpacing === 'number') ? t.lineSpacing : 1.2,
            noAnim: !!t.noAnim,
            groupId: t.groupId,
            rotation: t.rotation || 0,
            isBold: !!t.isBold,
            isItalic: !!t.isItalic,
            zIndex: (typeof t.zIndex === "number") ? t.zIndex : 0,
            selected: false,
            _hasManualBreaks: hasManual
        };
    });

    // --- IMAGES (as before) ---
    const imagesInput = data.images || [];
    const imagePromises = imagesInput.map(imgObj => new Promise(resolve => {
        if (!imgObj?.src) return resolve({ ok: false, img: null });
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve({ ok: true, img });
        img.onerror = () => resolve({ ok: false, img: null });
        img.src = imgObj.src;
    }));
    const loaded = await Promise.all(imagePromises);

    images = imagesInput.map((im, i) => {
        const entry = loaded[i];
        const img = entry && entry.ok ? entry.img : null;
        return {
            type: im.type || 'image',
            src: im.src,
            img,
            x: unitToPx(im.x ?? 0, screenW),
            y: unitToPx(im.y ?? 0, screenH),
            width: unitToPx(im.width ?? 0.2, screenW),
            height: unitToPx(im.height ?? 0.2, screenH),
            scaleX: 1,
            scaleY: 1,
            opacity: im.opacity,
            noAnim: !!im.noAnim,
            groupId: im.groupId,
            rotation: im.rotation || 0,
            zIndex: (typeof im.zIndex === "number") ? im.zIndex : 0,
            selected: false,
            fillNoColorStatus: !!im.fillNoColorStatus,
            strokeNoColorStatus: !!im.strokeNoColorStatus,
            fillNoColor: im.fillNoColor || "#FFFFFF",
            strokeNoColor: im.strokeNoColor || "#FFFFFF",
            strokeWidth: im.strokeWidth || 3,
            isBasic: im.isBasic??false
        };
    });

    // fonts
    const fontPromises = textObjects.map(o => {
        if (!o.fontSize || !o.fontFamily) return Promise.resolve();
        return document.fonts.load(`${o.fontSize}px ${o.fontFamily}`);
    });
    try {
        await Promise.all([bgPromise, ...fontPromises, document.fonts.ready]);
    } catch (e) {

    }
   

    drawText();
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
function hideDownloadPanel() {
    const main = document.getElementById('canvasMainContainerDownload');
    const container = document.getElementById('canvasContainerDownload');
    main.classList.add('d-none');
    container.classList.add('d-none');
   
}

function showDownloadPanel() {
    const main = document.getElementById('canvasMainContainerDownload');
    const container = document.getElementById('canvasContainerDownload');
    main.classList.remove('d-none');
    container.classList.remove('d-none');
    //if (typeof window.resizeCanvas_d === 'function') {
    //    window.resizeCanvas_d();
    //}
}

async function SaveDesignBoardInPublishTable() {
    ShowLoaderTransferFile();
    HideLoaderPreparingForPublish();
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
            success: async function (result) {
                $("#hdnDesignBoardPublishId").val(result.result);
                $("#hdnPublishBoardUniqueId").val(result.publishBoardUniqueId);


                //const companyUniqueId = getCompanyIdFromUrl();
                //const projectId = $("#hdnPublishBoardUniqueId").val();
                //window.open(`${window.location.origin}/S/${companyUniqueId}/${projectId}`, "_blank");

                const companyId = getCompanyIdFromUrl();
                const projectId = $("#hdnPublishBoardUniqueId").val();
                //window.open(`${window.location.origin}/S/${companyUniqueId}/${projectId}`, "_blank");
                const url = `${baseURL.replace(/\/$/, '')}/s/v/${encodeURIComponent(companyId)}/${encodeURIComponent(projectId)}`;
                window.open(url, "_blank");

                // notify SSE hub (requires CORS on Server B and some auth strategy) 
                try {
                    const version = String(Date.now()); // or your own revision/hash
                    await fetch('https://aniboard.com/s/api/publish', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            companyId: Number(companyId),
                            projectId: Number(projectId),
                            version
                        })
                    });
                } catch (err) {
                    console.error('publish notify failed', err);
                }

                clearleftDownloadPanel();
                clearrightDownloadPanel();
                hideDownloadPanel();
               RedirectToVerticalPageWithQueryString();

            },
            error: function (data) {
                HideLoaderTransferFile();
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
    const confirmDelete = await customConfirm("Do you want to publish this board?");
    if (!confirmDelete) return;
    copyPanelleftToDownload();
    copyPanelrightToDownload();
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
    const slideExecutionTime = inTime + outTime;/*inTime + stayTime + outTime;*/

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
                    drawTextForDownload();
                };
                img.onerror = () => {
                    canvas._bgImg = null;
                    $("#hdnBackgroundSpecificColorDownload").val(nextBgColor);
                    drawTextForDownload();
                };
                img.src = nextBgImage;
            } else {
                canvas._bgImg = null;
                $("#hdnBackgroundSpecificColorDownload").val(nextBgColor);
                drawTextForDownload();
            }
        }, overlapColor);

        // 3) wait for stripe to finish
        await stripePromise;

        // 4) now that stripe is done, load the next JSON fully
        await loadCanvasFromJsonForDownload(jsonArray[nextIdx], 'Common');

        // 5) redraw (in case loadCanvasFromJsonForDownload didn’t auto‑draw)
        if (nextBgImage) {
            drawTextForDownload();
        } else {
            canvas._bgImg = null;
            $("#hdnBackgroundSpecificColorDownload").val(nextBgColor);
            drawTextForDownload();
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
    // drawCanvasForDownload('Common');
    drawTextForDownload();
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
    await drawTextForDownload();
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
    //HideLoader();
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
function getCompanyIdFromUrl() {
    return 1;
    //const segments = window.location.pathname.split('/').filter(segment => segment !== '');
    //// Assuming the last segment is the company ID.
    //return segments.length ? segments[segments.length - 1] : null;
}
// Chunked uploader (replaces single-POST version)
// Chunked uploader with small chunks to avoid NGINX 413
async function uploadLargeVideo(blob, existingFolderId = 'new') {
    ShowLoaderPreparingForPublish?.();
    HideLoader?.();
    // Keep chunks safely under nginx default (1m). 512 KB is conservative.
    const chunkSize = 512 * 1024; // 512 KB
    const fileId =
        (crypto && crypto.randomUUID) ? crypto.randomUUID()
            : `vid_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const total = Math.ceil(blob.size / chunkSize);

    const chunkEndpoints = [baseURL + "video/save-Large-video-chunk", baseURL + "Video/SaveLargeVideoChunk"];
    const finishEndpoints = [baseURL + "video/finish-Large-video", baseURL + "Video/FinishLargeVideo"];

    const postForm = async (url, formData) => {
        const res = await fetch(url, { method: 'POST', body: formData });
        if (!res.ok) {
            const text = await res.text().catch(() => '');
            throw new Error(`HTTP ${res.status} ${res.statusText} ${text.slice(0, 300)}`);
        }
        return res;
    };

    const postJson = async (url, bodyObj) => {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyObj)
        });
        if (!res.ok) {
            const text = await res.text().catch(() => '');
            throw new Error(`HTTP ${res.status} ${res.statusText} ${text.slice(0, 300)}`);
        }
        return res.json();
    };

    const sendChunk = async (fd) => {
        let lastErr;
        for (const url of chunkEndpoints) {
            try { await postForm(url, fd); return; }
            catch (e) {
                lastErr = e;
                const msg = String(e?.message || '');
                if (/HTTP 404|HTTP 405/i.test(msg)) continue; // try alternate route style
                throw e;
            }
        }
        throw lastErr || new Error('No working chunk endpoint found.');
    };

    const finalizeOnServer = async (payload) => {
        let lastErr;
        for (const url of finishEndpoints) {
            try { return await postJson(url, payload); }
            catch (e) {
                lastErr = e;
                const msg = String(e?.message || '');
                if (/HTTP 404|HTTP 405/i.test(msg)) continue;
                throw e;
            }
        }
        throw lastErr || new Error('No working finish endpoint found.');
    };

    try {
      //  ShowLoader?.();

        // 1) Upload chunks
        for (let index = 0; index < total; index++) {
            const start = index * chunkSize;
            const end = Math.min(start + chunkSize, blob.size);
            const chunk = blob.slice(start, end);

            const fd = new FormData();
            fd.append('chunk', chunk, `part_${index}.bin`);
            fd.append('fileId', fileId);
            fd.append('index', index);
            fd.append('total', total);
            fd.append('folderId', existingFolderId);

            await sendChunk(fd);

            // optional: progress
            // updateProgress?.(Math.round(((index + 1) / total) * 100));
        }

        // 2) Finalize (server stitches parts)
        const data = await finalizeOnServer({ fileId, folderId: existingFolderId });
        console.log('large Video saved successfully:', data);

        // 3) Save path → publish → close
        const dataVideoPath = {
            DesignBoardId: $("#hdnDesignBoardId").val(),
            VideoPath: data.filePath
        };

        await $.ajax({
            url: baseURL + "Canvas/UpdateDesignBoardLargeVideoPath",
            type: "POST",
            dataType: "json",
            data: dataVideoPath
        });

       await SaveDesignBoardInPublishTable();
       

        return data.filePath;
    } catch (error) {
        HideLoader?.();
        HideLoaderPreparingForPublish?.();
        console.error('Error saving video (chunked):', error);
        throw error;
    } finally {
      //  HideLoader?.();
    }
}


function uploadLargeVideoOLD(blob, existingFolderId = 'new', currentIndex = 1) {
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

                        //RedirectToVerticalPageWithQueryString();
                        //HideLoader();
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
            onUpdate: () => drawTextForDownload(),
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


async function drawTextForDownloadFake() {
    // Backing (target) canvas + ctx
    const dlCanvas = canvasForDownload;
    const ctx = ctxElementForDownload;

    // DESIGN space = the editor canvas used by drawText()
    const srcCanvas = window.canvas; // <-- your live editor canvas
    const designW = srcCanvas?.width || dlCanvas.width;
    const designH = srcCanvas?.height || dlCanvas.height;

    // Scale factors from design -> download backing
    const kx = dlCanvas.width / designW;
    const ky = dlCanvas.height / designH;

    console.log(
        "Download backing:", dlCanvas.width, dlCanvas.height,
        "design:", designW, designH,
        "scale:", kx.toFixed(3), ky.toFixed(3)
    );

    // 1) Reset & clear in BACKING space
    if (typeof ctx.resetTransform === "function") ctx.resetTransform();
    else ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, dlCanvas.width, dlCanvas.height);

    // 2) Enter DESIGN space
    ctx.save();
    ctx.scale(kx, ky); // everything below uses design units (same as drawText)

    // ---- background color (design units)
    const bgEl = document.getElementById('hdnBackgroundSpecificColorDownload');
    const bgColor = (bgEl?.value || dlCanvas.style.backgroundColor || "").trim();
    if (bgColor) {
        ctx.save();
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, designW, designH);
        ctx.restore();
    }

    // ---- background image (ensure ready) in design units
    if (dlCanvas._bgImg) {
        const img = dlCanvas._bgImg;
        if ('decode' in img) {
            try { await img.decode(); } catch (_) { }
            ctx.drawImage(img, 0, 0, designW, designH);
        } else if (img.complete) {
            ctx.drawImage(img, 0, 0, designW, designH);
        } else {
            await new Promise(res => { img.onload = res; img.onerror = res; });
            if (img.complete) ctx.drawImage(img, 0, 0, designW, designH);
        }
    }

    // ---- text defaults (same as drawText)
    ctx.textBaseline = "top";
    const defaultStyle = window.getComputedStyle(textEditorNew);
    const defaultFontSize = defaultStyle.fontSize || "16px";
    const defaultFontFamily = defaultStyle.fontFamily || "Arial Regular";
    const defaultFontWeight = defaultStyle.fontWeight || "normal";
    const defaultFontStyle = defaultStyle.fontStyle || "normal";
    const defaultColor = defaultStyle.color || "#000";

    if (document.fonts && document.fonts.ready) {
        try { await document.fonts.ready; } catch (_) { }
    }

    // ---- local helpers (identical to drawText)
    function __applyLocalRectMask(ctx2, w, h, clipVal, direction) {
        if (!(clipVal > 0 && clipVal < 1)) return;
        let vw = w, vh = h;
        if (direction === "left" || direction === "right") vw = w * (1 - clipVal);
        if (direction === "top" || direction === "bottom") vh = h * (1 - clipVal);
        let rx = -w / 2, ry = -h / 2;
        if (direction === "right") rx = (w / 2) - vw;
        if (direction === "bottom") ry = (h / 2) - vh;
        ctx2.beginPath();
        ctx2.rect(rx, ry, vw, vh);
        ctx2.clip();
    }

    const __BASIC_SHAPES = new Set(['ico-shapes-rec.svg']);
    function __isBasicShapeSvg(box) {
        if (!box || box.type !== 'image' || !box.src) return false;
        let name = '';
        try { name = new URL(String(box.src), location.href).pathname.split('/').pop() || ''; }
        catch { name = String(box.src).split(/[?#]/)[0].split('/').pop() || ''; }
        return __BASIC_SHAPES.has(name.toLowerCase());
    }

    function __drawImageThreeSliceLocalX(ctx2, img, w, h) {
        const sw = img.naturalWidth || img.width || 1;
        const sh = img.naturalHeight || img.height || 1;
        const capSrc = Math.max(1, Math.round(sh / 2));
        let midSrcW = sw - capSrc * 2, midSrcX = capSrc;
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
        if (typeof curv === 'number' && isFinite(curv)) k = (curv > 1) ? (curv / h) : curv;
        else if (typeof img.__curvatureRatio === 'number') k = img.__curvatureRatio;
        else k = 0.5;
        k = Math.max(0, Math.min(0.5, k));
        const capDstX = k * h, capDstY = k * h;
        const midDstX = Math.max(0, w - 2 * capDstX);
        const midDstY = Math.max(0, h - 2 * capDstY);
        let capSrc = Math.round(k * sh);
        capSrc = Math.max(1, Math.min(capSrc, Math.floor(Math.min(sw, sh) / 2)));
        let midSrcW = sw - capSrc * 2, midSrcX = capSrc; if (midSrcW < 1) { midSrcW = 1; midSrcX = Math.min(Math.max(0, capSrc), Math.max(0, sw - 1)); }
        let midSrcH = sh - capSrc * 2, midSrcY = capSrc; if (midSrcH < 1) { midSrcH = 1; midSrcY = Math.min(Math.max(0, capSrc), Math.max(0, sh - 1)); }
        const x0 = -w / 2, y0 = -h / 2, DPR = window.devicePixelRatio || 1, OX = 1 / DPR, OY = 1 / DPR;

        ctx2.drawImage(img, 0, 0, capSrc, capSrc, x0, y0, capDstX + OX, capDstY + OY);
        if (midDstX > 0) ctx2.drawImage(img, midSrcX, 0, midSrcW, capSrc, x0 + capDstX - OX, y0, midDstX + 2 * OX, capDstY + OY);
        ctx2.drawImage(img, Math.max(0, sw - capSrc), 0, capSrc, capSrc, x0 + capDstX + midDstX - OX, y0, capDstX + OX, capDstY + OY);

        if (midDstY > 0) {
            ctx2.drawImage(img, 0, midSrcY, capSrc, midSrcH, x0, y0 + capDstY - OY, capDstX + OX, midDstY + 2 * OY);
            if (midDstX > 0) ctx2.drawImage(img, midSrcX, midSrcY, midSrcW, midSrcH, x0 + capDstX - OX, y0 + capDstY - OY, midDstX + 2 * OX, midDstY + 2 * OY);
            ctx2.drawImage(img, Math.max(0, sw - capSrc), midSrcY, capSrc, midSrcH, x0 + capDstX + midDstX - OX, y0 + capDstY - OY, capDstX + OX, midDstY + 2 * OY);
        } else {
            ctx2.drawImage(img, 0, midSrcY, capSrc, midSrcH, x0, y0 + capDstY - OY, capDstX + OX, midDstY + 2 * OY);
            ctx2.drawImage(img, Math.max(0, sw - capSrc), midSrcY, capSrc, midSrcH, x0 + capDstX + midDstX - OX, y0 + capDstY - OY, capDstX + OX, midDstY + 2 * OY);
        }

        ctx2.drawImage(img, 0, Math.max(0, sh - capSrc), capSrc, capSrc, x0, y0 + capDstY + midDstY - OY, capDstX + OX, capDstY + OY);
        if (midDstX > 0) ctx2.drawImage(img, midSrcX, Math.max(0, sh - capSrc), midSrcW, capSrc, x0 + capDstX - OX, y0 + capDstY + midDstY - OY, midDstX + 2 * OX, capDstY + OY);
        ctx2.drawImage(img, Math.max(0, sh - capSrc), Math.max(0, sh - capSrc), capSrc, capSrc, x0 + capDstX + midDstX - OX, y0 + capDstY + midDstY - OY, capDstX + OX, capDstY + OY);
    }

    // ---- z-ordered draw (unchanged logic from drawText), now in DESIGN units
    const all = [...(images || []), ...(textObjects || [])]
        .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

    for (const box of all) {
        if (box.width == null || Number.isNaN(box.width)) box.width = 50;
        if (box.height == null || Number.isNaN(box.height)) box.height = 30;

        const { w, h, cx, cy } = getBoxRect(box);
        const angleRad = deg2rad(box.rotation || 0);

        if (typeof box.previousClip !== "number") box.previousClip = Number(box.clip) || 0;
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
        const __sx = Number(box.scaleX) || 0;
        const __sy = Number(box.scaleY) || 0;
        if (__sx === 0 || __sy === 0) continue;

        // world-space clip (design units)
        ctx.save();
        if (box.clip >= 1) { ctx.restore(); continue; }
        if (box.clip > 0 && box.clip < 1) {
            const originalDir = box.clipDirection || "top";
            const isHiding = box.clip > box.previousClip;
            const effectiveDirection = isHiding ? invertDirection(originalDir) : originalDir;
            box.previousClip = box.clip;

            const isImage = box.type === 'image';
            const width = isImage ? box.width : box.boundingWidth;
            const height = isImage ? box.height : box.boundingHeight;
            const x = box.x, y = box.y;

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

        // IMAGES (same as your drawText)
        const isBasic = box.isBasic ?? false;
        if (isBasic && box.type === "image") {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(angleRad);
            ctx.scale(__sx, __sy);
            ctx.globalAlpha = normAlpha(box.opacity);
            if (box.__clipVal > 0 && box.__clipVal < 1) __applyLocalRectMask(ctx, w, h, box.__clipVal, box.__effDir || "top");
            if (box.img) {
                if (!box.img.complete && 'decode' in box.img) { try { await box.img.decode(); } catch (_) { } }
                else if (!box.img.complete) { await new Promise(res => { box.img.onload = res; box.img.onerror = res; }); }
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
                        if (typeof __drawImageNineSliceLocal === 'function') { __drawImageNineSliceLocal(ctx, box.img, h, w, k); __didCapsDraw = true; }
                        else if (typeof __drawImageThreeSliceLocalX === 'function') { __drawImageThreeSliceLocalX(ctx, box.img, h, w, k); __didCapsDraw = true; }
                        ctx.restore();
                    }
                    if (!__didCapsDraw) {
                        if (typeof __drawImageNineSliceLocal === 'function') __drawImageNineSliceLocal(ctx, box.img, w, h, k);
                        else if (typeof __drawImageThreeSliceLocalX === 'function') __drawImageThreeSliceLocalX(ctx, box.img, w, h, k);
                        else ctx.drawImage(box.img, -w / 2, -h / 2, w, h);
                    }
                } else {
                    ctx.drawImage(box.img, -w / 2, -h / 2, w, h);
                }
            }
            ctx.restore();
            if (box.selected && w > 0 && h > 0) drawRotatedSelection(ctx, { ...box, width: w * __sx, height: h * __sy });
            continue;
        } else if (box.type === "image") {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(angleRad);
            ctx.scale(__sx, __sy);
            ctx.globalAlpha = normAlpha(box.opacity);
            if (box.__clipVal > 0 && box.__clipVal < 1) __applyLocalRectMask(ctx, w, h, box.__clipVal, box.__effDir || "top");
            if (box.img) {
                if (!box.img.complete && 'decode' in box.img) { try { await box.img.decode(); } catch (_) { } }
                else if (!box.img.complete) { await new Promise(res => { box.img.onload = res; box.img.onerror = res; }); }
                ctx.drawImage(box.img, -w / 2, -h / 2, w, h);
            }
            ctx.restore();
            if (box.selected && w > 0 && h > 0) drawRotatedSelection(ctx, { ...box, width: w * __sx, height: h * __sy });
            continue;
        }

        // TEXT (exactly like drawText; uses design units so wrapping matches)
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angleRad);
        ctx.scale(__sx, __sy);
        ctx.globalAlpha = normAlpha(box.opacity);
        if (box.__clipVal > 0 && box.__clipVal < 1) __applyLocalRectMask(ctx, w, h, box.__clipVal, box.__effDir || "top");

        const wrapper = document.createElement("div");
        wrapper.innerHTML = box.text || "";

        const lines = [];
        wrapper.childNodes.forEach(n => {
            if (n.nodeType === 1 && n.tagName === "DIV") {
                const hasContent = n.textContent.trim().length > 0 || n.children.length > 0;
                if (!hasContent) {
                    const blank = document.createElement("div");
                    blank.appendChild(document.createTextNode(" "));
                    lines.push(blank);
                } else {
                    const ln = document.createElement("div");
                    ln.append(...n.cloneNode(true).childNodes);
                    lines.push(ln);
                }
            } else if (n.nodeType === 1 && n.tagName === "BR") {
                const brLine = document.createElement("div");
                brLine.appendChild(document.createTextNode(" "));
                lines.push(brLine);
            } else {
                if (lines.length === 0) lines.push(document.createElement("div"));
                lines[lines.length - 1].appendChild(n.cloneNode(true));
            }
        });

        const left = -w / 2;
        const top = -h / 2;

        let cursorY = top + 5;
        let usedHeight = 0;
        let __maxRunWidthObserved = 0;

        function measureWords(node, style, outSegments, maxFontPxRef) {
            if (node.nodeType === 3) {
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
                    if (!isNaN(px)) maxFontPxRef.value = Math.max(maxFontPxRef.value, px);
                    const isSpace = /^\s+$/.test(tk);
                    outSegments.push({ text: tk, width, style: { fs, ff, fw, fst, col }, isSpace });
                }
                return;
            } else if (node.nodeType === 1) {
                if (node.tagName === "BR") {
                    const fs = style.fontSize || defaultFontSize;
                    const ff = style.fontFamily || defaultFontFamily;
                    const fw = style.fontWeight || defaultFontWeight;
                    const fst = style.fontStyle || defaultFontStyle;
                    const col = style.color || defaultColor;
                    ctx.font = `${fst} ${fw} ${fs} ${ff}`;
                    const width = ctx.measureText(" ").width;
                    const px = parseFloat(fs);
                    if (!isNaN(px)) maxFontPxRef.value = Math.max(maxFontPxRef.value, px);
                    outSegments.push({ text: " ", width, style: { fs, ff, fw, fst, col }, isSpace: true });
                    return;
                }
                const s = node.style || {};
                const nextStyle = {
                    fontSize: s.fontSize || style.fontSize,
                    fontFamily: s.fontFamily || style.fontFamily,
                    fontWeight: s.fontWeight || style.fontWeight,
                    fontStyle: s.fontStyle || style.fontStyle,
                    color: s.color || style.color,
                };
                node.childNodes.forEach(child => measureWords(child, nextStyle, outSegments, maxFontPxRef));
            }
        }

        for (const lineNode of lines) {
            let cursorX = left + 5;
            if (box.align === "center") { ctx.textAlign = "center"; cursorX = left + w / 2; }
            else if (box.align === "right") { ctx.textAlign = "right"; cursorX = left + w - 5; }
            else { ctx.textAlign = "left"; }

            const innerLeft = left + 5;
            const innerRight = left + w - 5;
            const innerWidth = Math.max(0, innerRight - innerLeft);
            const alignMode = box.align || "left";
            ctx.textAlign = "left";

            const segments = [];
            const maxFontPxRef = { value: 0 };
            measureWords(lineNode, {
                fontSize: defaultFontSize,
                fontFamily: defaultFontFamily,
                fontWeight: defaultFontWeight,
                fontStyle: defaultFontStyle,
                color: defaultColor
            }, segments, maxFontPxRef);

            const basePx = parseFloat(defaultFontSize) || 16;
            const lineHeight = (maxFontPxRef.value > 0 ? maxFontPxRef.value : basePx) * (box.lineSpacing || 1.2);

            const isBlankLine =
                (segments.length === 0) ||
                segments.every(seg => seg.isSpace || ((seg.text || '').trim() === ''));
            if (isBlankLine) {
                cursorY += lineHeight;
                usedHeight = cursorY - top + 5;
                continue;
            }

            function startXForWidth(runWidth) {
                if (alignMode === "center") return innerLeft + Math.max(0, (innerWidth - runWidth) / 2);
                if (alignMode === "right") return innerRight - runWidth;
                return innerLeft;
            }

            // per-run wrapping (exactly like drawText)
            let runSegs = [];
            let runWidth = 0;
            let runMaxPx = 0;

            function flushRun() {
                if (runSegs.length === 0) return;
                let x2 = startXForWidth(runWidth);
                for (const seg of runSegs) {
                    ctx.font = `${seg.style.fst} ${seg.style.fw} ${seg.style.fs} ${seg.style.ff}`;
                    ctx.fillStyle = seg.style.col;
                    ctx.fillText(seg.text, x2, cursorY);
                    x2 += seg.width;
                }
                if (runWidth > __maxRunWidthObserved) __maxRunWidthObserved = runWidth;
                const lh = (runMaxPx || basePx) * (box.lineSpacing || 1.2);
                cursorY += lh;
                usedHeight = cursorY - top + 5;
                runSegs = []; runWidth = 0; runMaxPx = 0;
            }

            for (const seg of segments) {
                const segPx = parseFloat(seg.style.fs) || basePx;
                if (seg.isSpace && runSegs.length === 0) continue;
                if (runWidth + seg.width > innerWidth && runSegs.length > 0) {
                    flushRun();
                    if (seg.isSpace) continue;
                }
                runSegs.push(seg);
                runWidth += seg.width;
                if (segPx > runMaxPx) runMaxPx = segPx;
            }
            flushRun();
        }

        const minByWord = Math.ceil(__maxRunWidthObserved + 10);
        if (minByWord > (box.width || 0)) box.width = minByWord;

        box.height = usedHeight;
        syncTextDims(box);
        ctx.restore();

        if (box.selected && w > 0 && h > 0) {
            drawRotatedSelection(ctx, { ...box, width: w * __sx, height: h * __sy });
        }
    }

    // leave DESIGN space
    ctx.restore(); // undo ctx.scale(kx, ky)
}



 function loadCanvasFromJsonForDownload(jsonData, condition = 'Common') {
     ensureFontsInitialized?.();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    currentCondition = condition;

    if (!jsonData) {
         document.fonts.ready;
        drawTextForDownload();
        return;
    }

    const data = (typeof jsonData === "string") ? JSON.parse(jsonData) : jsonData;

    // canvas size in design pixels
    const W = canvas.width || 0;
    const H = canvas.height || 0;

    // unit -> px for TEXT only (keep your convenience here)
    function unitToPxLocal(v, dim, FRACTION_THRESHOLD = 5) {
        if (typeof v === 'string') {
            const s = v.trim().toLowerCase();
            if (s.endsWith('%')) return (parseFloat(s) / 100) * dim;
            if (s.endsWith('px')) return parseFloat(s);
            const n = Number(s);
            if (Number.isFinite(n)) v = n; else return 0;
        }
        const n = Number(v);
        if (!Number.isFinite(n)) return 0;
        return (Math.abs(n) <= FRACTION_THRESHOLD) ? (n * dim) : n;
    }

    const fileName = (src) => {
        try { return new URL(String(src), location.href).pathname.split('/').pop()?.toLowerCase() || ""; }
        catch { return String(src).split(/[?#]/)[0].split('/').pop()?.toLowerCase() || ""; }
    };

    const isLineBasicBySrc = (im) => {
        if (!im?.isBasic) return false;
        const n = fileName(im.src);
        return n === 'ico-shapes-line.svg' || n === 'ico-shapes-line';
    };

    //// background

    const bg = data.canvasBgColor || '#ffffff';
    document.getElementById('hdnBackgroundSpecificColorDownload').value = bg;
    canvasForDownload.style.backgroundColor = bg;

    // Preload background image if any
    if (data.canvasBgImage) {
        canvasForDownload._bgImg = new Image();
        canvasForDownload._bgImg.crossOrigin = 'anonymous';
        canvasForDownload._bgImg.onload = () => drawTextForDownload();
        canvasForDownload._bgImg.onerror = () => drawTextForDownload();
        canvasForDownload._bgImg.src = data.canvasBgImage;
    } else {
        canvasForDownload._bgImg = null;
    }


    // TEXT
    const padding = 5;
    textObjectsForDownload = (data.text || []).map(t => {
        const wPx = unitToPxLocal(t.width ?? t.boundingWidth ?? 0.2, W);
        const hPx = unitToPxLocal(t.height ?? t.boundingHeight ?? 0, H);

        const fontPx = t.fontSize;
        const lineH = (fontPx ? fontPx * (t.lineSpacing || 1.2) : 18);
        const linesArr = String(t.text ?? "").split("\n");
        const hasManual = linesArr.length > 1;
        const neededH = hasManual ? (linesArr.length * lineH + 2 * padding) : (hPx || 0);

        const finalW = Math.max(10, Number.isFinite(wPx) ? wPx : 50);
        const finalH = Math.max(10, Number.isFinite(neededH) ? neededH : 30);

        let xPx = unitToPxLocal(t.x ?? 0, W);
        let yPx = unitToPxLocal(t.y ?? 0, H);

        // keep the text inside on load (text is usually not meant to overflow)
        if (xPx + finalW + padding > W) xPx = Math.max(0, W - finalW - padding);
        if (yPx + finalH + padding > H) yPx = Math.max(0, H - finalH - padding);
        if (xPx < 0) xPx = 0;
        if (yPx < 0) yPx = 0;

        return {
            type: t.type || 'text',
            text: t.text || "",
            x: xPx, y: yPx,
            width: finalW, height: finalH,
            boundingWidth: finalW, boundingHeight: finalH,
            align: t.align || t.textAlign || "left",
            fontSize: t.fontSize, fontFamily: t.fontFamily, textColor: t.textColor,
            opacity: (t.opacity ?? 100),
            lineSpacing: (typeof t.lineSpacing === 'number') ? t.lineSpacing : 1.2,
            noAnim: !!t.noAnim, groupId: t.groupId ?? null, rotation: t.rotation || 0,
            isBold: !!t.isBold, isItalic: !!t.isItalic,
            zIndex: (typeof t.zIndex === "number") ? t.zIndex : 0,
            selected: false, _hasManualBreaks: hasManual
        };
    });
    const rect = canvasForDownload.getBoundingClientRect();
    const screenW = rect.width;
    const screenH = rect.height;
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
        obj.img.onload = () => drawTextForDownload();
        obj.img.onerror = () => drawTextForDownload();
        obj.img.src = o.src;
        obj.type = o.type || 'image';
        obj.zIndex = o.zIndex || getNextZIndex();
        obj.fillNoColorStatus = o.fillNoColorStatus;
        obj.strokeNoColorStatus = o.strokeNoColorStatus;
        obj.fillNoColor = o.fillNoColor;
        obj.strokeNoColor = o.strokeNoColor;
        obj.strokeWidth = o.strokeWidth;
        obj.isBasic = o.isBasic;
        obj.isLINESvg = o.isLINESvg;
        obj.__capsOrientation = o.__capsOrientation;

        return obj;
    });

   
     textObjects = textObjectsForDownload;
     images = imagesForDownload;
     try { allItems = [...textObjects, ...images]; } catch (_) { /* optional */ }

    // Load fonts, auto-fit (skip manual breaks), then draw
    const fontPromises = textObjectsForDownload.map(o =>
        document.fonts.load(`${o.fontSize}px ${o.fontFamily}`)
    );
    Promise.all(fontPromises).finally(() => {
        textObjectsForDownload.forEach(obj => {
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
        drawTextForDownload();
    });
}
function loadCanvasFromJsonForDownload_11(jsonData, condition = 'Common') {
    // ─────────────────────────────────────────────────────────
    // Use the *download* canvas/ctx consistently
    // ─────────────────────────────────────────────────────────
    const ctx = ctxElementForDownload;
    const canvas = canvasForDownload;

    // init fonts if available
    ensureFontsInitialized?.();

    // clear & reset transform
    if (typeof ctx.resetTransform === 'function') ctx.resetTransform();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // store condition for downstream draw
    currentConditionForDownload = condition;
    try { currentCondition = condition; } catch (_) { /* ignore if not used */ }

    // if nothing passed, just wait for fonts then draw
    if (!jsonData) {
        (document.fonts?.ready ? document.fonts.ready : Promise.resolve()).then(() => {
            drawTextForDownload();
        });
        return;
    }

    // parse JSON
    const data = (typeof jsonData === "string") ? JSON.parse(jsonData) : jsonData;
    slideDataForDownload = data;

    // ─────────────────────────────────────────────────────────
    // Background (color + optional image) on the SAME canvas we draw on
    // ─────────────────────────────────────────────────────────
    const bg = data.canvasBgColor || '#ffffff';
    const bgEl = document.getElementById('hdnBackgroundSpecificColorDownload');
    if (bgEl) bgEl.value = bg;
    canvas.style.backgroundColor = bg;  // CSS bg; draw func may also paint a solid fill

    if (data.canvasBgImage) {
        canvas._bgImg = new Image();
        canvas._bgImg.crossOrigin = 'anonymous';
        const bgDone = () => drawTextForDownload();
        canvas._bgImg.onload = bgDone;
        canvas._bgImg.onerror = bgDone;
        canvas._bgImg.src = data.canvasBgImage;
    } else {
        canvas._bgImg = null;
    }

    // ─────────────────────────────────────────────────────────
    // Size in CSS pixels (keep text & images in the same space)
    // ─────────────────────────────────────────────────────────
    const rect = canvas.getBoundingClientRect();
    const screenW = rect.width;
    const screenH = rect.height;

    // unit -> px helper (supports %, px, plain number; small numbers treated as fractions of dim)
    function unitToPxLocal(v, dim, FRACTION_THRESHOLD = 5) {
        if (typeof v === 'string') {
            const s = v.trim().toLowerCase();
            if (s.endsWith('%')) return (parseFloat(s) / 100) * dim;
            if (s.endsWith('px')) return parseFloat(s);
            const n = Number(s);
            if (Number.isFinite(n)) v = n; else return 0;
        }
        const n = Number(v);
        if (!Number.isFinite(n)) return 0;
        return (Math.abs(n) <= FRACTION_THRESHOLD) ? (n * dim) : n;
    }

    // ─────────────────────────────────────────────────────────
    // TEXT
    // ─────────────────────────────────────────────────────────
    const padding = 5;

    const textObjectsForDownload = (data.text || []).map(t => {
        const wPx = unitToPxLocal(t.width ?? t.boundingWidth ?? 0.2, screenW);
        const hPx = unitToPxLocal(t.height ?? t.boundingHeight ?? 0, screenH);

        const fontPx = parseFloat(t.fontSize) || 16;
        const lineRatio = (typeof t.lineSpacing === 'number') ? t.lineSpacing : 1.2;
        const lineH = fontPx * lineRatio;

        const linesArr = String(t.text ?? "").split("\n");
        const hasManual = linesArr.length > 1;
        const neededH = hasManual ? (linesArr.length * lineH + 2 * padding) : (hPx || 0);

        let xPx = unitToPxLocal(t.x ?? 0, screenW);
        let yPx = unitToPxLocal(t.y ?? 0, screenH);

        const finalW = Math.max(10, Number.isFinite(wPx) ? wPx : 50);
        const finalH = Math.max(10, Number.isFinite(neededH) ? neededH : 30);

        // keep text within bounds on load
        if (xPx + finalW + padding > screenW) xPx = Math.max(0, screenW - finalW - padding);
        if (yPx + finalH + padding > screenH) yPx = Math.max(0, screenH - finalH - padding);
        if (xPx < 0) xPx = 0;
        if (yPx < 0) yPx = 0;

        return {
            type: t.type || 'text',
            text: t.text || "",
            x: xPx, y: yPx,
            width: finalW, height: finalH,
            boundingWidth: finalW, boundingHeight: finalH,
            align: t.align || t.textAlign || "left",
            fontSize: t.fontSize, fontFamily: t.fontFamily, textColor: t.textColor,
            opacity: (t.opacity ?? 100),                   // supports 0..1 or 0..100 depending on your normAlpha()
            lineSpacing: lineRatio,                         // ratio (not pixels)
            noAnim: !!t.noAnim, groupId: (t.groupId ?? null),
            rotation: t.rotation || 0,
            isBold: !!t.isBold, isItalic: !!t.isItalic,
            zIndex: (t.zIndex ?? 0),                       // preserve zero
            selected: false,
            _hasManualBreaks: hasManual
        };
    });

    // ─────────────────────────────────────────────────────────
    // IMAGES (batch redraw after all loads)
    // ─────────────────────────────────────────────────────────
    let pendingImgs = 0;

    const imagesForDownload = (data.images || []).map(o => {
        const obj = { ...o };

        obj.x = o.x * screenW;
        obj.y = o.y * screenH;
        obj.width = o.width * screenW;
        obj.height = o.height * screenH;

        obj.rotation = (typeof o.rotation === 'number') ? o.rotation : 0;
        obj.selected = false;
        obj.type = o.type || 'image';
        obj.zIndex = (o.zIndex ?? getNextZIndex());

        // carry style/meta
        obj.fillNoColorStatus = o.fillNoColorStatus;
        obj.strokeNoColorStatus = o.strokeNoColorStatus;
        obj.fillNoColor = o.fillNoColor;
        obj.strokeNoColor = o.strokeNoColor;
        obj.strokeWidth = o.strokeWidth;
        obj.isBasic = o.isBasic;
        obj.isLINESvg = o.isLINESvg;
        obj.__capsOrientation = o.__capsOrientation;

        // image element
        obj.img = new Image();
        obj.img.crossOrigin = 'anonymous';
        pendingImgs++;
        const done = () => {
            pendingImgs = Math.max(0, pendingImgs - 1);
            if (pendingImgs === 0) drawTextForDownload();
        };
        obj.img.onload = done;
        obj.img.onerror = done;
        obj.img.src = o.src;

        return obj;
    });

    // ─────────────────────────────────────────────────────────
    // Mirror into globals used by the renderer (prevents “always first JSON”)
    // ─────────────────────────────────────────────────────────
    textObjects = textObjectsForDownload;
    images = imagesForDownload;
    try { allItems = [...textObjects, ...images]; } catch (_) { /* optional */ }

    // ─────────────────────────────────────────────────────────
    // Load fonts, auto-fit, then draw (or wait for images to finish)
    // ─────────────────────────────────────────────────────────
    const fontPromises = textObjectsForDownload.map(o => {
        const fam = o.fontFamily || 'Arial';
        const sz = parseInt(o.fontSize, 10) || 16;
        return document.fonts?.load ? document.fonts.load(`${sz}px ${fam}`) : Promise.resolve();
    });

    Promise.allSettled(fontPromises).finally(() => {
        textObjectsForDownload.forEach(obj => {
            const fitResult = autoFitTextNewDownload(obj, padding);
            obj._wrappedLines = fitResult.wrappedLines;
            obj.boundingWidth = fitResult.boundingWidth;
            obj.boundingHeight = fitResult.boundingHeight;
        });

        // if there are no images pending, render now
        if (pendingImgs === 0) {
            drawTextForDownload();
        }
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
function setCanvasTransform(ctxElementForDownload, dpr, scaleX, scaleY) {
    ctxElementForDownload.resetTransform();
    ctxElementForDownload.scale(dpr, dpr);
    ctxElementForDownload.scale(scaleX, scaleY);
    ctxElementForDownload.imageSmoothingEnabled = true;
    ctxElementForDownload.imageSmoothingQuality = 'high';
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



async function drawTextForDownload() {
    const ctx = ctxElementForDownload;
    const canvas = canvasForDownload;

    const designW = canvas.width;
    const designH = canvas.height;
    // clear & bg
    ctx.clearRect(0, 0, designW, designH);

    const bgEl = document.getElementById('hdnBackgroundSpecificColorDownload');
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
    const defaultFontSize = defaultStyle.fontSize || "16px";
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

    // ===== BASIC SHAPES: detect by filename (case-insensitive; works with URLs/data URIs) =====
    // --- BASIC SHAPES detection (filename only) ---
    // BASIC shape list + detector
    // ---- BASIC shapes only -------------------------------------------------
    // ---- BASIC SHAPES list
    const __BASIC_SHAPES = new Set([
        //'ico-shapes-circle.svg',
        //'ico-shapes-heart.svg',
        //'ico-shapes-hexagon.svg',
        //'ico-shapes-line.svg',
        'ico-shapes-rec.svg',
        //'ico-shapes-triangle.svg'
    ]);

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

    // === your existing 3-slice (kept) ===
    // === REPLACE your 3-slice with this version (no gaps on wide/narrow) ===
    function __drawImageThreeSliceLocalX(ctx2, img, w, h) {
        const sw = img.naturalWidth || img.width || 1;
        const sh = img.naturalHeight || img.height || 1;

        // cap in source ≈ radius
        const capSrc = Math.max(1, Math.round(sh / 2));

        // middle in source: at least 1px, centered if the true middle is 0/negative
        let midSrcW = sw - capSrc * 2;
        let midSrcX = capSrc;
        if (midSrcW < 1) {
            midSrcX = Math.max(0, Math.floor(sw / 2));
            midSrcW = 1;
        }

        // destination pieces
        const capDst = Math.max(1e-3, Math.min(h / 2, w / 2));
        const midDst = Math.max(0, w - capDst * 2);

        // LEFT cap
        ctx2.drawImage(img, 0, 0, capSrc, sh, -w / 2, -h / 2, capDst, h);

        // MIDDLE (always when there's room in destination)
        if (midDst > 0) {
            ctx2.drawImage(img, midSrcX, 0, midSrcW, sh, -w / 2 + capDst, -h / 2, midDst, h);
        }

        // RIGHT cap (sample from the right edge)
        const rightSrcX = Math.max(0, sw - capSrc);
        ctx2.drawImage(img, rightSrcX, 0, capSrc, sh, -w / 2 + capDst + midDst, -h / 2, capDst, h);
    }

    // === 9-slice (capsule-safe, constant curvature) ===
    // curv: optional curvature; 0..0.5 => ratio of height, >1 => pixels
    function __drawImageNineSliceLocal(ctx2, img, w, h, curv) {
        const sw = img.naturalWidth || img.width || 1;
        const sh = img.naturalHeight || img.height || 1;

        // ---- DESTINATION corner radius (keep constant while squishing) ----
        // prefer explicit 'curv', else img.__curvatureRatio, else 0.5 (pill)
        let k;
        if (typeof curv === 'number' && isFinite(curv)) {
            // <=1 => ratio; >1 => pixels converted to ratio by /h
            k = (curv > 1) ? (curv / h) : curv;
        } else if (typeof img.__curvatureRatio === 'number') {
            k = img.__curvatureRatio;
        } else {
            k = 0.5; // default pill ends
        }
        // clamp to [0..0.5]
        k = Math.max(0, Math.min(0.5, k));

        // Fixed destination corner size from HEIGHT, not from current width
        const capDstX = k * h;         // radius horizontally
        const capDstY = k * h;         // radius vertically
        const midDstX = Math.max(0, w - 2 * capDstX); // center can collapse to 0
        const midDstY = Math.max(0, h - 2 * capDstY);

        // ---- SOURCE cap size: same ratio of the source asset ----
        let capSrc = Math.round(k * sh);
        capSrc = Math.max(1, Math.min(capSrc, Math.floor(Math.min(sw, sh) / 2)));

        // source middles (≥1px to avoid gaps)
        let midSrcW = sw - capSrc * 2, midSrcX = capSrc;
        if (midSrcW < 1) { midSrcW = 1; midSrcX = Math.min(Math.max(0, capSrc), Math.max(0, sw - 1)); }

        let midSrcH = sh - capSrc * 2, midSrcY = capSrc;
        if (midSrcH < 1) { midSrcH = 1; midSrcY = Math.min(Math.max(0, capSrc), Math.max(0, sh - 1)); }

        const x0 = -w / 2, y0 = -h / 2;

        // tiny overlaps to hide seams (DPI-aware)
        const DPR = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
        const OX = 1 / DPR, OY = 1 / DPR;

        // Top row
        ctx2.drawImage(img, 0, 0, capSrc, capSrc, x0, y0, capDstX + OX, capDstY + OY); // TL
        if (midDstX > 0)
            ctx2.drawImage(img, midSrcX, 0, midSrcW, capSrc,
                x0 + capDstX - OX, y0, midDstX + 2 * OX, capDstY + OY);       // T
        ctx2.drawImage(img, Math.max(0, sw - capSrc), 0, capSrc, capSrc,
            x0 + capDstX + midDstX - OX, y0, capDstX + OX, capDstY + OY);   // TR

        // Middle row
        if (midDstY > 0) {
            ctx2.drawImage(img, 0, midSrcY, capSrc, midSrcH,
                x0, y0 + capDstY - OY, capDstX + OX, midDstY + 2 * OY);       // L
            if (midDstX > 0)
                ctx2.drawImage(img, midSrcX, midSrcY, midSrcW, midSrcH,
                    x0 + capDstX - OX, y0 + capDstY - OY,
                    midDstX + 2 * OX, midDstY + 2 * OY);                         // C
            ctx2.drawImage(img, Math.max(0, sw - capSrc), midSrcY, capSrc, midSrcH,
                x0 + capDstX + midDstX - OX, y0 + capDstY - OY,
                capDstX + OX, midDstY + 2 * OY);                               // R
        } else {
            // no center height → stretch side strips to meet
            ctx2.drawImage(img, 0, midSrcY, capSrc, midSrcH,
                x0, y0 + capDstY - OY, capDstX + OX, midDstY + 2 * OY);
            ctx2.drawImage(img, Math.max(0, sw - capSrc), midSrcY, capSrc, midSrcH,
                x0 + capDstX + midDstX - OX, y0 + capDstY - OY,
                capDstX + OX, midDstY + 2 * OY);
        }

        // Bottom row
        ctx2.drawImage(img, 0, Math.max(0, sh - capSrc), capSrc, capSrc,
            x0, y0 + capDstY + midDstY - OY, capDstX + OX, capDstY + OY);   // BL
        if (midDstX > 0)
            ctx2.drawImage(img, midSrcX, Math.max(0, sh - capSrc), midSrcW, capSrc,
                x0 + capDstX - OX, y0 + capDstY + midDstY - OY,
                midDstX + 2 * OX, capDstY + OY);                               // B
        ctx2.drawImage(img, Math.max(0, sw - capSrc), Math.max(0, sh - capSrc), capSrc, capSrc,
            x0 + capDstX + midDstX - OX, y0 + capDstY + midDstY - OY,
            capDstX + OX, capDstY + OY);                                     // BR
    }


    // z-ordered
    const all = [...(images || []), ...(textObjects || [])]
        .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

    for (const box of all) {
        if (box.width == null || Number.isNaN(box.width)) box.width = 50;
        if (box.height == null || Number.isNaN(box.height)) box.height = 30;

        const { w, h, cx, cy } = getBoxRect(box);
        const angleRad = deg2rad(box.rotation || 0);

        // normalize clip & compute effective direction; skip fully hidden
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

        // sandbox world-space clip
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

        // drop world-space clip
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
                            const k = 0.480732281680149;   // your fixed curvature
                            let __didCapsDraw = false;

                            // Prefer rotated draw when caps are vertical so we sample the rounded sides
                            if (wantVerticalCaps) {
                                ctx.save();
                                ctx.rotate(Math.PI / 2);

                                // swap w/h because we rotated
                                if (typeof __drawImageNineSliceLocal === 'function') {
                                    __drawImageNineSliceLocal(ctx, box.img, h, w, k);  // curvature-aware, rounded top/bottom
                                    __didCapsDraw = true;
                                } else if (typeof __drawImageThreeSliceLocalX === 'function') {
                                    // OK if your X-slice ignores the extra arg; JS just discards it
                                    __drawImageThreeSliceLocalX(ctx, box.img, h, w, k);
                                    __didCapsDraw = true;
                                } else if (typeof __drawImageThreeSliceLocalY === 'function') {
                                    // last resort (not ideal for caps), but keep as a fallback
                                    __drawImageThreeSliceLocalY(ctx, box.img, w, h, k);
                                    __didCapsDraw = true;
                                }

                                ctx.restore();
                            }

                            if (!__didCapsDraw) {
                                // Horizontal caps (or generic fallback)
                                if (typeof __drawImageNineSliceLocal === 'function') {
                                    __drawImageNineSliceLocal(ctx, box.img, w, h, k);
                                } else if (typeof __drawImageThreeSliceLocalX === 'function') {
                                    __drawImageThreeSliceLocalX(ctx, box.img, w, h, k);
                                } else {
                                    ctx.drawImage(box.img, -w / 2, -h / 2, w, h);
                                }
                            }
                        } else {
                            ctx.drawImage(box.img, -w / 2, -h / 2, w, h);
                        }




                        //if (preserveCaps) {
                        //    const wantVerticalCaps = (box.__capsOrientation === 'vertical'); // ← ADD
                        //    let __didCapsDraw = false;                                       // ← ADD

                        //    if (wantVerticalCaps) {                                          // ← ADD
                        //        // Draw with TOP/BOTTOM caps preserved (no canvas rotation)
                        //        if (typeof __drawImageThreeSliceLocalY === 'function') {
                        //            __drawImageThreeSliceLocalY(ctx, box.img, w, h);
                        //            __didCapsDraw = true;
                        //        } else {
                        //            // Fallback: 9-slice with current curvature (still no rotation)
                        //            __drawImageNineSliceLocal(ctx, box.img, w, h, box.img?.__curvatureRatio);
                        //            __didCapsDraw = true;
                        //        }
                        //    }

                        //    if (!__didCapsDraw) { // ← ADD
                        //        // Horizontal caps preserved (your existing behavior)
                        //        __drawImageNineSliceLocal(ctx, box.img, w, h);
                        //        // If you prefer strict horizontal 3-slice instead, keep this alternative:
                        //        // __drawImageThreeSliceLocalX(ctx, box.img, w, h);
                        //    }
                        //} else {
                        //    ctx.drawImage(box.img, -w / 2, -h / 2, w, h);
                        //}

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
        else {
            if (box.type === "image") {
                const { w, h, cx, cy } = getBoxRect(box);
                const angleRad = deg2rad(box.rotation || 0);

                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(angleRad);

                // === ADD: apply popcorn (and other) scale here
                ctx.scale(__sx, __sy);

                ctx.globalAlpha = normAlpha(box.opacity);

                // === ADD: local (rotated) mask for images
                if (box.__clipVal > 0 && box.__clipVal < 1) {
                    __applyLocalRectMask(ctx, w, h, box.__clipVal, box.__effDir || "top");
                }

                if (box.img) {
                    if (box.img.complete) {
                        ctx.drawImage(box.img, -w / 2, -h / 2, w, h);
                    } else {
                        const img = box.img;
                        img.onload = () => { img.onload = null; drawText(); };
                        img.onerror = () => { img.onerror = null; };
                    }
                }
                ctx.restore(); // back to world space

                // === ADD: selection should reflect scaled size
                if (box.selected && w > 0 && h > 0) {
                    drawRotatedSelection(ctx, { ...box, width: w * __sx, height: h * __sy });
                }
                continue;
            }

        }



        //---- TEXT ---- (unchanged)
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angleRad);
        ctx.scale(__sx, __sy);
        ctx.globalAlpha = normAlpha(box.opacity);

        if (box.__clipVal > 0 && box.__clipVal < 1) {
            __applyLocalRectMask(ctx, w, h, box.__clipVal, box.__effDir || "top");
        }

        const wrapper = document.createElement("div");
        wrapper.innerHTML = box.text || "";

        const lines = [];
        wrapper.childNodes.forEach(n => {
            if (n.nodeType === 1 && n.tagName === "DIV") {
                const hasContent = n.textContent.trim().length > 0 || n.children.length > 0;
                if (!hasContent) {
                    const blank = document.createElement("div");
                    blank.appendChild(document.createTextNode(" "));
                    lines.push(blank);
                } else {
                    const ln = document.createElement("div");
                    ln.append(...n.cloneNode(true).childNodes);
                    lines.push(ln);
                }
            } else if (n.nodeType === 1 && n.tagName === "BR") {
                const brLine = document.createElement("div");
                brLine.appendChild(document.createTextNode(" "));
                lines.push(brLine);
            } else {
                if (lines.length === 0) lines.push(document.createElement("div"));
                lines[lines.length - 1].appendChild(n.cloneNode(true));
            }
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

            const innerLeft = left + 5;
            const innerRight = left + w - 5;
            const innerWidth = Math.max(0, innerRight - innerLeft);
            const alignMode = box.align || "left";
            ctx.textAlign = "left";

            let segments = [];
            let maxFontPx = 0;

            function measureWords(node, style) {
                if (node.nodeType === 3) {
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
                } else if (node.nodeType === 1) {
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

                        segments.push({ text: " ", width, style: { fs, ff, fw, fst, col }, isSpace: true });
                        return;
                    }
                    const s = node.style || {};
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

            const basePx = parseFloat(defaultFontSize) || 16;
            const lineHeight = (maxFontPx > 0 ? maxFontPx : basePx) * (box.lineSpacing || 1.2);

            const isBlankLine = (segments.length === 0) ||
                segments.every(seg => seg.isSpace || ((seg.text || '').trim() === ''));

            if (isBlankLine) {
                cursorY += lineHeight;
                usedHeight = cursorY - top + 5;
                return;
            }

            const __usePerRun = true;

            if (__usePerRun) {
                function startXForWidth(runWidth) {
                    if (alignMode === "center") return innerLeft + Math.max(0, (innerWidth - runWidth) / 2);
                    if (alignMode === "right") return innerRight - runWidth;
                    return innerLeft;
                }

                let runSegs = [];
                let runWidth = 0;
                let runMaxPx = 0;

                function flushRun() {
                    if (runSegs.length === 0) return;
                    let x2 = startXForWidth(runWidth);
                    for (const seg of runSegs) {
                        ctx.font = `${seg.style.fst} ${seg.style.fw} ${seg.style.fs} ${seg.style.ff}`;
                        ctx.fillStyle = seg.style.col;
                        ctx.fillText(seg.text, x2, cursorY);
                        x2 += seg.width;
                    }

                    if (runWidth > __maxRunWidthObserved) __maxRunWidthObserved = runWidth;

                    const lh = (runMaxPx || basePx) * (box.lineSpacing || 1.2);
                    cursorY += lh;
                    usedHeight = cursorY - top + 5;

                    runSegs = [];
                    runWidth = 0;
                    runMaxPx = 0;
                }

                for (const seg of segments) {
                    const segPx = parseFloat(seg.style.fs) || basePx;

                    if (seg.isSpace && runSegs.length === 0) continue;

                    // wrap by tokens
                    if (runWidth + seg.width > innerWidth && runSegs.length > 0) {
                        flushRun();
                        if (seg.isSpace) continue;
                    }

                    runSegs.push(seg);
                    runWidth += seg.width;
                    if (segPx > runMaxPx) runMaxPx = segPx;
                }

                flushRun();
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

// Async DOWNLOAD renderer with word-granular wrapping and space-safe behavior
async function drawTextForDownload_11_9(condition) {
    // ---------- setup ----------
    initializeLayers();

    const ctx = ctxElementForDownload;
    const canvas = canvasForDownload;

    const dpr = window.devicePixelRatio || 1;
    const wPx = canvas.width;
    const hPx = canvas.height;

    // same design space as your old code
    const designW = (wPx / dpr) / scaleX;
    const designH = (hPx / dpr) / scaleY;

    // ensure fonts ready (prevents measureText drift)
    if (document.fonts && document.fonts.ready) {
        try { await document.fonts.ready; } catch (_) { }
    }
    // ensure images are ready (your helper)
    await preloadImages(allItems);

    // ---------- reset & clear in design space ----------
    if (typeof ctx.resetTransform === "function") ctx.resetTransform();
    setCanvasTransform(ctx, dpr, scaleX, scaleY); // <- puts ctx in DESIGN units
    ctx.clearRect(0, 0, designW, designH);
    ctx.textBaseline = "top";

    // ---------- background ----------
    const bgEl = document.getElementById('hdnBackgroundSpecificColorDownload');
    const bgColor = (bgEl?.value || canvas.style.backgroundColor || "").trim();
    if (bgColor) {
        ctx.save();
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, designW, designH);
        ctx.restore();
    }
    if (canvas._bgImg) {
        try {
            if ('decode' in canvas._bgImg) { try { await canvas._bgImg.decode(); } catch (_) { } }
            ctx.drawImage(canvas._bgImg, 0, 0, designW, designH);
        } catch { /* ignore */ }
    }

    // ---------- defaults (exactly like drawText) ----------
    const defaultStyle = window.getComputedStyle(textEditorNew);
    const defaultFontSize = defaultStyle.fontSize || "16px";
    const defaultFontFamily = defaultStyle.fontFamily || "Arial Regular";
    const defaultFontWeight = defaultStyle.fontWeight || "normal";
    const defaultFontStyle = defaultStyle.fontStyle || "normal";
    const defaultColor = defaultStyle.color || "#000";

    // === local mask helper (rotated/local space) ===
    function __applyLocalRectMask(ctx2, w, h, clipVal, direction) {
        if (!(clipVal > 0 && clipVal < 1)) return;
        let vw = w, vh = h;
        if (direction === "left" || direction === "right") vw = w * (1 - clipVal);
        if (direction === "top" || direction === "bottom") vh = h * (1 - clipVal);
        let rx = -w / 2, ry = -h / 2;
        if (direction === "right") rx = (w / 2) - vw;
        if (direction === "bottom") ry = (h / 2) - vh;
        ctx2.beginPath();
        ctx2.rect(rx, ry, vw, vh);
        ctx2.clip();
    }

    // (your image helpers unchanged)
    const __BASIC_SHAPES = new Set(['ico-shapes-rec.svg']);
    function __isBasicShapeSvg(box) {
        if (!box || box.type !== 'image' || !box.src) return false;
        let name = '';
        try { name = new URL(String(box.src), location.href).pathname.split('/').pop() || ''; }
        catch { name = String(box.src).split(/[?#]/)[0].split('/').pop() || ''; }
        return __BASIC_SHAPES.has(name.toLowerCase());
    }
    function __drawImageThreeSliceLocalX(ctx2, img, w, h) {
        const sw = img.naturalWidth || img.width || 1;
        const sh = img.naturalHeight || img.height || 1;
        const capSrc = Math.max(1, Math.round(sh / 2));
        let midSrcW = sw - capSrc * 2, midSrcX = capSrc;
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
        if (typeof curv === 'number' && isFinite(curv)) k = (curv > 1) ? (curv / h) : curv;
        else if (typeof img.__curvatureRatio === 'number') k = img.__curvatureRatio;
        else k = 0.5;
        k = Math.max(0, Math.min(0.5, k));
        const capDstX = k * h, capDstY = k * h;
        const midDstX = Math.max(0, w - 2 * capDstX);
        const midDstY = Math.max(0, h - 2 * capDstY);
        let capSrc = Math.round(k * sh);
        capSrc = Math.max(1, Math.min(capSrc, Math.floor(Math.min(sw, sh) / 2)));
        let midSrcW = sw - capSrc * 2, midSrcX = capSrc; if (midSrcW < 1) { midSrcW = 1; midSrcX = Math.min(Math.max(0, capSrc), Math.max(0, sw - 1)); }
        let midSrcH = sh - capSrc * 2, midSrcY = capSrc; if (midSrcH < 1) { midSrcH = 1; midSrcY = Math.min(Math.max(0, capSrc), Math.max(0, sh - 1)); }
        const x0 = -w / 2, y0 = -h / 2, DPR = window.devicePixelRatio || 1, OX = 1 / DPR, OY = 1 / DPR;

        ctx2.drawImage(img, 0, 0, capSrc, capSrc, x0, y0, capDstX + OX, capDstY + OY);
        if (midDstX > 0) ctx2.drawImage(img, midSrcX, 0, midSrcW, capSrc, x0 + capDstX - OX, y0, midDstX + 2 * OX, capDstY + OY);
        ctx2.drawImage(img, Math.max(0, sw - capSrc), 0, capSrc, capSrc, x0 + capDstX + midDstX - OX, y0, capDstX + OX, capDstY + OY);

        if (midDstY > 0) {
            ctx2.drawImage(img, 0, midSrcY, capSrc, midSrcH, x0, y0 + capDstY - OY, capDstX + OX, midDstY + 2 * OY);
            if (midDstX > 0) ctx2.drawImage(img, midSrcX, midSrcY, midSrcW, midSrcH,
                x0 + capDstX - OX, y0 + capDstY - OY, midDstX + 2 * OX, midDstY + 2 * OY);
            ctx2.drawImage(img, Math.max(0, sw - capSrc), midSrcY, capSrc, midSrcH,
                x0 + capDstX + midDstX - OX, y0 + capDstY - OY, capDstX + OX, midDstY + 2 * OY);
        } else {
            ctx2.drawImage(img, 0, midSrcY, capSrc, midSrcH, x0, y0 + capDstY - OY, capDstX + OX, midDstY + 2 * OY);
            ctx2.drawImage(img, Math.max(0, sw - capSrc), midSrcY, capSrc, midSrcH,
                x0 + capDstX + midDstX - OX, y0 + capDstY - OY, capDstX + OX, midDstY + 2 * OY);
        }

        ctx2.drawImage(img, 0, Math.max(0, sh - capSrc), capSrc, capSrc,
            x0, y0 + capDstY + midDstY - OY, capDstX + OX, capDstY + OY);
        if (midDstX > 0) ctx2.drawImage(img, midSrcX, Math.max(0, sh - capSrc), midSrcW, capSrc,
            x0 + capDstX - OX, y0 + capDstY + midDstY - OY, midDstX + 2 * OX, capDstY + OY);
        ctx2.drawImage(img, Math.max(0, sh - capSrc), Math.max(0, sh - capSrc), capSrc, capSrc,
            x0 + capDstX + midDstX - OX, y0 + capDstY + midDstY - OY, capDstX + OX, capDstY + OY);
    }

    // ---------- draw items (z-order) ----------
    (allItems || []).forEach(box => {
        ctx.save();
        ctx.globalAlpha = (typeof box.opacity === 'number') ? box.opacity : 1;

        if ((box.scaleX === 0) && (box.scaleY === 0)) { ctx.restore(); return; }

        // optional world-space clip
        if (box.clipDirection !== undefined) {
            if (applyClipMask(ctx, box)) { ctx.restore(); return; }
        }

        // IMAGES (unchanged)
        if (box.type === 'image' && box.img) {
            const x = box.x, y = box.y, w = box.width, h = box.height;
            const rot = (box.rotation || 0) * Math.PI / 180;
            ctx.translate(x + w / 2, y + h / 2);
            ctx.rotate(rot);
            ctx.scale(box.scaleX || 1, box.scaleY || 1);
            try { ctx.drawImage(box.img, -w / 2, -h / 2, w, h); } catch { }
            ctx.restore();
            return;
        }

        // ============ TEXT ============  (copied from drawText, 1:1)
        if (box.type === 'text') {
            // ensure sane dims
            if (box.width == null || Number.isNaN(box.width)) box.width = 50;
            if (box.height == null || Number.isNaN(box.height)) box.height = 30;

            const { w, h, cx, cy } = getBoxRect(box);
            const angleRad = deg2rad(box.rotation || 0);

            // normalize clip & effective direction; skip fully hidden
            if (typeof box.previousClip !== "number") box.previousClip = Number(box.clip) || 0;
            const __clipVal = Math.max(0, Math.min(1, Number(box.clip) || 0));
            const __isHiding = __clipVal > box.previousClip;
            const __origDir = box.clipDirection || "top";
            const __effDir = __isHiding ? invertDirection(__origDir) : __origDir;
            box.previousClip = __clipVal;
            if (__clipVal >= 1) { ctx.restore(); return; }

            box.__clipVal = __clipVal;
            box.__effDir = __effDir;

            if (typeof box.scaleX !== "number") box.scaleX = 1;
            if (typeof box.scaleY !== "number") box.scaleY = 1;
            const __sx = Number(box.scaleX) || 0;
            const __sy = Number(box.scaleY) || 0;
            if (__sx === 0 || __sy === 0) { ctx.restore(); return; }

            // ---- TEXT draw (live logic) ----
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(angleRad);
            ctx.scale(__sx, __sy);
            ctx.globalAlpha = (typeof box.opacity === 'number') ? box.opacity : 1;

            if (box.__clipVal > 0 && box.__clipVal < 1) {
                __applyLocalRectMask(ctx, w, h, box.__clipVal, box.__effDir || "top");
            }

            const wrapper = document.createElement("div");
            wrapper.innerHTML = box.text || "";

            const lines = [];
            wrapper.childNodes.forEach(n => {
                if (n.nodeType === 1 && n.tagName === "DIV") {
                    const hasContent = n.textContent.trim().length > 0 || n.children.length > 0;
                    if (!hasContent) {
                        const blank = document.createElement("div");
                        blank.appendChild(document.createTextNode(" "));
                        lines.push(blank);
                    } else {
                        const ln = document.createElement("div");
                        ln.append(...n.cloneNode(true).childNodes);
                        lines.push(ln);
                    }
                } else if (n.nodeType === 1 && n.tagName === "BR") {
                    const brLine = document.createElement("div");
                    brLine.appendChild(document.createTextNode(" "));
                    lines.push(brLine);
                } else {
                    if (lines.length === 0) lines.push(document.createElement("div"));
                    lines[lines.length - 1].appendChild(n.cloneNode(true));
                }
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

                const innerLeft = left + 5;
                const innerRight = left + w - 5;
                const innerWidth = Math.max(0, innerRight - innerLeft);
                const alignMode = box.align || "left";
                ctx.textAlign = "left";

                let segments = [];
                let maxFontPx = 0;

                function measureWords(node, style) {
                    if (node.nodeType === 3) {
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
                    } else if (node.nodeType === 1) {
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

                            segments.push({ text: " ", width, style: { fs, ff, fw, fst, col }, isSpace: true });
                            return;
                        }
                        const s = node.style || {};
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

                const basePx = parseFloat(defaultFontSize) || 16;
                const lineHeight = (maxFontPx > 0 ? maxFontPx : basePx) * (box.lineSpacing || 1.2);

                const isBlankLine =
                    (segments.length === 0) ||
                    segments.every(seg => seg.isSpace || ((seg.text || '').trim() === ''));

                if (isBlankLine) {
                    cursorY += lineHeight;
                    usedHeight = cursorY - top + 5;
                    return;
                }

                function startXForWidth(runWidth) {
                    if (alignMode === "center") return innerLeft + Math.max(0, (innerWidth - runWidth) / 2);
                    if (alignMode === "right") return innerRight - runWidth;
                    return innerLeft;
                }

                let runSegs = [];
                let runWidth = 0;
                let runMaxPx = 0;

                function flushRun() {
                    if (runSegs.length === 0) return;
                    let x2 = startXForWidth(runWidth);
                    for (const seg of runSegs) {
                        ctx.font = `${seg.style.fst} ${seg.style.fw} ${seg.style.fs} ${seg.style.ff}`;
                        ctx.fillStyle = seg.style.col;
                        ctx.fillText(seg.text, x2, cursorY);
                        x2 += seg.width;
                    }

                    if (runWidth > __maxRunWidthObserved) __maxRunWidthObserved = runWidth;

                    const lh = (runMaxPx || basePx) * (box.lineSpacing || 1.2);
                    cursorY += lh;
                    usedHeight = cursorY - top + 5;

                    runSegs = [];
                    runWidth = 0;
                    runMaxPx = 0;
                }

                for (const seg of segments) {
                    const segPx = parseFloat(seg.style.fs) || basePx;

                    if (seg.isSpace && runSegs.length === 0) continue;

                    if (runWidth + seg.width > innerWidth && runSegs.length > 0) {
                        flushRun();
                        if (seg.isSpace) continue;
                    }

                    runSegs.push(seg);
                    runWidth += seg.width;
                    if (segPx > runMaxPx) runMaxPx = segPx;
                }

                flushRun();
            });

            const __minOuterWidthByWord = Math.ceil(__maxTokenWidthObserved + 10);
            if (__minOuterWidthByWord > (box.width || 0)) box.width = __minOuterWidthByWord;

            box.height = usedHeight;
            syncTextDims(box);
            ctx.restore();

            // selection parity if needed
            if (box.selected && w > 0 && h > 0) {
                drawRotatedSelection(ctx, { ...box, width: w * __sx, height: h * __sy });
            }

            ctx.restore();
            return;
        }

        // fallback
        ctx.restore();
    });

    // ---------- selection handles in pixel space (unchanged) ----------
    ctx.globalAlpha = 1;
    ctx.save();
    if (typeof ctx.resetTransform === "function") ctx.resetTransform();
    ctx.scale(dpr, dpr);

    drawHandles(
        ctx,
        images,
        img => ({
            xPx: img.x * scaleX, yPx: img.y * scaleY,
            wPx: img.width * (img.scaleX || 1) * scaleX,
            hPx: img.height * (img.scaleY || 1) * scaleY
        }),
        { stroke: 'blue', fill: 'red' }
    );

    drawHandles(
        ctx,
        textObjects,
        txt => ({
            xPx: txt.x * scaleX, yPx: txt.y * scaleY,
            wPx: (txt.boundingWidth || 0) * scaleX, hPx: (txt.boundingHeight || 0) * scaleY
        }),
        { stroke: '#00f', fill: '#FF7F50' }
    );

    ctx.restore();
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
    const OutanimationType = state.outEffect || 'delaylinear'
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
                obj.exitX = canvasForDownload.width + margin;
                obj.exitY = obj.finalY;
                break;

            case "right":
                obj.exitX = -obj.boundingWidth - margin;
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
            onUpdate: () => drawTextForDownload(),
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
                //imgObj.x = -(dispWidth + 5);
                //imgObj.y = imgObj.finalY;
                imgObj.x = -canvasForDownload.width / 2;
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
                imgObj.exitX = canvasForDownload.width ;
                imgObj.exitY = imgObj.finalY;
             
                break;
            case "right":
                imgObj.exitX = -(dispWidth + 55);
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
            const tweenIn = 0.10 * inTime;
            const tweenOut = 0.10 * outTime;

            // 4) Build timeline
            const tlText = gsap.timeline({
                repeat: loopCount - 1,
                repeatDelay: 0,
                onRepeat: () => {
                    images.forEach(img => { img.x = img.startX; img.y = img.startY; });
                    textObjects.forEach(txt => { txt.x = txt.startX; txt.y = txt.startY; });
                    drawTextForDownload();
                },
                onUpdate: () => drawTextForDownload()
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
            ////units.forEach((unit, idx) => {
            ////    tlText.to(unit, {
            ////        x: (i, t) => t.finalX,
            ////        y: (i, t) => t.finalY,
            ////        duration: tweenIn,
            ////        ease: "power1.in",
            ////        onUpdate: () => drawCanvasForDownload(condition)
            ////    }, idx * tweenIn);
            ////});
            units.forEach((unit, idx) => {
                tlText.to(unit, {
                    x: (i, t) => t.finalX,
                    y: (i, t) => t.finalY,
                    duration: tweenIn,
                    ease: "power1.in",
                    onUpdate: () => drawTextForDownload()
                }, 0);
            });

            // 1) STAY tween
            const totalIn = units.length * tweenIn;
            tlText.to({}, { duration: stayTime, ease: "none" }, totalIn);

            // 2) OUT tweens
            const outStart = totalIn + stayTime;
            if (OutanimationType === "delaylinear") {
                //units.forEach((unit, idx) => {
                //    tlText.to(unit, {
                //        x: (i, t) => t.exitX,
                //        y: (i, t) => t.exitY,
                //        duration: tweenOut,
                //        ease: "power1.out",
                //        onUpdate: () => drawCanvasForDownload(condition)
                //    }, outStart + idx * tweenOut);
                //});
                units.forEach((unit, idx) => {
                    tlText.to(unit, {
                        x: (i, t) => t.exitX,
                        y: (i, t) => t.exitY,
                        duration: tweenOut,
                        ease: "power1.out",
                        onUpdate: () => drawTextForDownload()
                    }, outStart *.7);
                });
            }
            else if (OutanimationType === "delaylinear2") {
                
                // 3) Timings
               // const tweenIn = 0.15 * inTime;
                const tweenOut = 0.20 * outTime;
               // const overlapIn = tweenIn / 6;   // each next In starts 50% in
                const overlapOut = tweenOut / 3;   // each next Out starts 50% in

               
                //// compute when the last IN actually ends:
                //// starts at (units.length-1)*overlapIn, runs tweenIn
                const inEndTime = (units.length - 1) * overlapOut + tweenOut;

                
                // ── OUT ──
                tlText.to(units, {
                    x: (i, t) => t.exitX,
                    y: (i, t) => t.exitY,
                    duration: tweenOut,
                    ease: "power1.out",
                    stagger: overlapOut,
                    onUpdate: () => drawTextForDownload()
                }, inEndTime + stayTime);


                

            }
            else if (OutanimationType === "roll") {

                const inRotationAmount = direction === "left" ? 360 : direction === "right" ? -360 : 360;
                const outRotationAmount = direction === "right" ? 360 : -360;


                const tweenIn = 0.15 * inTime;
                const tweenOut = 0.15 * outTime;
                const halfOut = outTime * 0.5;
                // OUT: Rotate and move out

                units.forEach((unit, idx) => {
                    tlText.to(unit, {
                        x: (i, t) => t.exitX,
                        y: (i, t) => t.exitY,
                        rotation: `+=${outRotationAmount}`,
                        duration: halfOut,
                        ease: "power1.out",
                        onUpdate: () => drawTextForDownload()
                    }, outStart + idx * tweenOut);
                });

            }
            else if (OutanimationType === "popcorn") {
                const staggerTime = (outTime / 2) / units.length;

                // Ensure all items are at full size before OUT begins
                units.flat().forEach(item => {
                    item.scaleX = 1;
                    item.scaleY = 1;
                });

                // 🔴 OUT: Pop-out in reverse order AFTER STAY (use outStart)
                units.slice().reverse().forEach((unit, idx) => {
                    const delay = outStart + idx * staggerTime;

                    tlText.to(unit, {
                        scaleX: 1.3,
                        scaleY: 1.3,
                        duration: 0.2,
                        ease: "power2.out",
                        onUpdate: () => drawTextForDownload()
                    }, delay);

                    tlText.to(unit, {
                        scaleX: 0,
                        scaleY: 0,
                        duration: 0.3,
                        ease: "back.in",
                        onUpdate: () => drawTextForDownload()
                    }, delay + 0.2);
                });
            }
            else if (OutanimationType === "mask") {
                // 1) Make sure all items are fully visible before OUT
                allItems.forEach(o => {
                    o.clip = 0; // fully visible
                    o.clipDirection = direction; // restore to IN direction (optional)
                });

                // 2) At OUT phase, flip clipDirection to OUT direction
                tlText.add(() => {
                    allItems.forEach(o => {
                        o.clipDirection = invertDirection(Outdirection);
                    });
                }, outStart); // ensure this is AFTER stay

                // 3) Animate clip: visible → hidden
                tlText.to(allItems, {
                    clip: 1,
                    duration: outTime,
                    ease: "power2.out",
                    onUpdate: () => drawTextForDownload()
                }, outStart);

                // 4) Final reset (optional — useful for loop)
                tlText.add(() => {
                    allItems.forEach(o => {
                        o.clip = 1;
                        o.clipDirection = Outdirection;
                    });
                    drawTextForDownload();
                }, outStart + outTime);
            }
            else if (OutanimationType === "zoom") {
                // ensure everything is at full size
                units.flat().forEach(item => {
                    item.scaleX = 1;
                    item.scaleY = 1;
                });

                // OUT: shrink each unit from full → zero, staggered
                units.forEach((unit, idx) => {
                    tlText.to(unit, {
                        scaleX: 0,
                        scaleY: 0,
                        duration: tweenOut,
                        ease: "power2.in",
                        onUpdate: () => drawTextForDownload()
                    }, outStart + idx * tweenOut);
                });

                // optional: reset for loop consistency
                tlText.add(() => {
                    units.flat().forEach(item => {
                        item.scaleX = 0;
                        item.scaleY = 0;
                    });
                    drawTextForDownload();
                }, outStart + units.length * tweenOut);
            }
            // ──────────────────────────────────────────────────────────────────

            if (OutanimationType === "delaylinear2") {
                const slideExecutionTime = inTime + stayTime + outTime;
                const actualDuration = tlText.duration();
                const perfectRatio = slideExecutionTime / actualDuration;

                tlText.timeScale(perfectRatio * 0.4);
            }
            else {

                // 3) Pad or compress to exactly slideExecutionTime
                const slideExecutionTime = inTime + stayTime + outTime;  // e.g. 11
                const actualDuration = tlText.duration();            // e.g. 12.6
                const playbackRatio = actualDuration / slideExecutionTime;
                tlText.timeScale(playbackRatio);
            }

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
            const overlapIn = tweenIn / 3;   // each next In starts 50% in
            const overlapOut = tweenOut / 3;   // each next Out starts 50% in

            // 4) Build timeline
            const tlText = gsap.timeline({
                repeat: loopCount - 1,
                repeatDelay: 0,
                onRepeat: () => {
                    // reset positions on loop
                    images.forEach(img => { img.x = img.startX; img.y = img.startY; });
                    textObjects.forEach(txt => { txt.x = txt.startX; txt.y = txt.startY; });
                    drawTextForDownload();
                },
                onUpdate: () => drawTextForDownload()
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
                onUpdate: () => drawTextForDownload()
            }, 0);

            // compute when the last IN actually ends:
            // starts at (units.length-1)*overlapIn, runs tweenIn
            const inEndTime = (units.length - 1) * overlapIn + tweenIn;

            // ── STAY ──
            tlText.to({}, {
                duration: stayTime,
                ease: "none"
            }, inEndTime);

            const delaylineartweenIn = 0.15 * inTime;
            const delaylineartotalIn = units.length * delaylineartweenIn;

            // 2) OUT tweens
            const OutanimationTypeoutStart = delaylineartotalIn + stayTime;
            if (OutanimationType === "delaylinear") {
               

               const delaylineartweenOut = 0.15 * outTime;
                units.forEach((unit, idx) => {
                    tlText.to(unit, {
                        x: (i, t) => t.exitX,
                        y: (i, t) => t.exitY,
                        duration: delaylineartweenOut,
                        ease: "power1.out",
                        onUpdate: () => drawTextForDownload()
                        // }, OutanimationTypeoutStart + idx * delaylineartweenOut);
                    }, (inTime + stayTime) *.7);
                });
            }
            else if (OutanimationType === "delaylinear2") {
                // ── OUT ──
                tlText.to(units, {
                    x: (i, t) => t.exitX,
                    y: (i, t) => t.exitY,
                    duration: tweenOut,
                    ease: "power1.out",
                    stagger: overlapOut,
                    onUpdate: () => drawTextForDownload()
                }, inEndTime + stayTime);
            }
            else if (OutanimationType === "roll") {

                const inRotationAmount = direction === "left" ? 360 : direction === "right" ? -360 : 360;
                const outRotationAmount = direction === "right" ? 360 : -360;


                const tweenIn = 0.15 * inTime;
                const tweenOut = 0.15 * outTime;
                const halfOut = outTime * 0.5;
                // OUT: Rotate and move out

                units.forEach((unit, idx) => {
                    tlText.to(unit, {
                        x: (i, t) => t.exitX,
                        y: (i, t) => t.exitY,
                        rotation: `+=${outRotationAmount}`,
                        duration: halfOut,
                        ease: "power1.out",
                        onUpdate: () => drawTextForDownload()
                    }, OutanimationTypeoutStart + idx * tweenOut);
                });

            }
            else if (OutanimationType === "popcorn") {
                const staggerTime = (outTime / 2) / units.length;

                // Ensure all items are at full size before OUT begins
                units.flat().forEach(item => {
                    item.scaleX = 1;
                    item.scaleY = 1;
                });

                // 🔴 OUT: Pop-out in reverse order AFTER STAY (use outStart)
                units.slice().reverse().forEach((unit, idx) => {
                    const delay = OutanimationTypeoutStart + idx * staggerTime;

                    tlText.to(unit, {
                        scaleX: 1.3,
                        scaleY: 1.3,
                        duration: 0.2,
                        ease: "power2.out",
                        onUpdate: () => drawTextForDownload()
                    }, delay);

                    tlText.to(unit, {
                        scaleX: 0,
                        scaleY: 0,
                        duration: 0.3,
                        ease: "back.in",
                        onUpdate: () => drawTextForDownload()
                    }, delay + 0.2);
                });
            }
            else if (OutanimationType === "mask") {
                // 1) Make sure all items are fully visible before OUT
                allItems.forEach(o => {
                    o.clip = 0; // fully visible
                    o.clipDirection = direction; // restore to IN direction (optional)
                });

                // 2) At OUT phase, flip clipDirection to OUT direction
                tlText.add(() => {
                    allItems.forEach(o => {
                        o.clipDirection = invertDirection(Outdirection);
                    });
                }, OutanimationTypeoutStart); // ensure this is AFTER stay

                // 3) Animate clip: visible → hidden
                tlText.to(allItems, {
                    clip: 1,
                    duration: outTime,
                    ease: "power2.out",
                    onUpdate: () => drawTextForDownload()
                }, OutanimationTypeoutStart);

                // 4) Final reset (optional — useful for loop)
                tlText.add(() => {
                    allItems.forEach(o => {
                        o.clip = 1;
                        o.clipDirection = Outdirection;
                    });
                    drawTextForDownload();
                }, OutanimationTypeoutStart + outTime);
            }
            else if (OutanimationType === "zoom") {
                // ensure everything is at full size
                units.flat().forEach(item => {
                    item.scaleX = 1;
                    item.scaleY = 1;
                });

                // OUT: shrink each unit from full → zero, staggered
                units.forEach((unit, idx) => {
                    tlText.to(unit, {
                        scaleX: 0,
                        scaleY: 0,
                        duration: tweenOut,
                        ease: "power2.in",
                        onUpdate: () => drawTextForDownload()
                    }, OutanimationTypeoutStart + idx * tweenOut);
                });

                // optional: reset for loop consistency
                tlText.add(() => {
                    units.flat().forEach(item => {
                        item.scaleX = 0;
                        item.scaleY = 0;
                    });
                    drawTextForDownload();
                }, OutanimationTypeoutStart + units.length * tweenOut);
            }


            if (animationType === "delaylinear2") {

                // ── NORMALIZE TIMING ──
                const slideExecutionTime = inTime + stayTime + outTime;
                const actualDuration = tlText.duration();
                const perfectRatio = slideExecutionTime / actualDuration;

                tlText.timeScale(perfectRatio * 0.4);
            }
            else {
                const slideExecutionTime = inTime + stayTime + outTime;  // e.g. 11
                const actualDuration = tlText.duration();            // e.g. 12.6
                const playbackRatio = actualDuration / slideExecutionTime;
                tlText.timeScale(playbackRatio);
            }
           
        }
        else if (animationType === "roll") {
            const animItems = [...images.filter(i => !i.noAnim), ...textObjects.filter(t => !t.noAnim)];
            const staticItems = [...images.filter(i => i.noAnim), ...textObjects.filter(t => t.noAnim)];
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
            // 3) Precompute half‑time tweens:
            const halfIn = inTime * 0.5;
            const halfOut = outTime * 0.5;

            // Dimensions of canvasForDownload
            const canvasWidth = canvasForDownload.width;
            const canvasHeight = canvasForDownload.height;

            // Rotation values
            const inRotationAmount = direction === "left" ? 360 : direction === "right" ? -360 : 360;
            const outRotationAmount = direction === "right" ? 360 : -360;

            // GSAP timeline setup
            const tlText = gsap.timeline({
                repeat: loopCount - 1,
                onRepeat: () => {
                    allItems.forEach(o => {
                        o.rotation = 0;
                        // Reset to outside position for IN phase
                        if (direction === "left") o.x = -200;
                        else if (direction === "right") o.x = canvasWidth + 200;
                        else if (direction === "top") o.y = -200;
                        else if (direction === "bottom") o.y = canvasHeight + 200;
                    });
                    drawTextForDownload();
                },
                onUpdate: () => drawTextForDownload(),
                onComplete: () => {
                    // snap back exactly to startRotation
                    allItems.concat(staticItems).forEach(o => {
                        o.x = o.finalX;
                        o.y = o.finalY;
                        o.rotation = o.startRotation;
                    });
                    drawTextForDownload();
                }
            });

            const tweenIn = 0.20 * inTime;
            const tweenOut = 0.20 * outTime;
            const staggerIn = 0.02;
            const lastInTime = (allItems.length - 1) * staggerIn + halfIn;
            // --- IN: Animate from outside based on direction ---
            allItems.forEach((item, idx) => {
                // Start position OUTSIDE canvas based on direction
                if (direction === "left") item.x = -200;
                else if (direction === "right") item.x = canvasWidth + 200;
                else if (direction === "top") item.y = -200;
                else if (direction === "bottom") item.y = canvasHeight + 200;

                const props = {
                    duration: halfIn,
                    ease: "back.inOut(1.7)",
                    rotation: `+=${inRotationAmount}`,
                    x: () => item.finalX,
                    y: () => item.finalY,
                    onUpdate: () => drawTextForDownload()
                };
                tlText.to(item, props, tweenIn);
            });

            // --- STAY: Pause ---
            tlText.to({}, { duration: stayTime }, lastInTime);
           

            const delaylineartweenIn = 0.15 * inTime;
            const delaylineartotalIn = units.length * delaylineartweenIn;

            // 2) OUT tweens
            const OutanimationTypeoutStart = inTime + stayTime;
            if (OutanimationType === "delaylinear") {


                const delaylineartweenOut = 0.15 * outTime;
                units.forEach((unit, idx) => {
                    tlText.to(unit, {
                        x: (i, t) => t.exitX,
                        y: (i, t) => t.exitY,
                        duration: outTime*.6,
                        ease: "power1.out",
                        onUpdate: () => drawTextForDownload()
                        // }, OutanimationTypeoutStart + idx * delaylineartweenOut);
                    }, OutanimationTypeoutStart );
                });
            }
            else if (OutanimationType === "delaylinear2") {
                const overlapIn = tweenIn / 3; 
                const inEndTime = (units.length - 1) * overlapIn + tweenIn;
                const overlapOut = tweenOut / 3;   // each next Out starts 50% in
                // ── OUT ──
                tlText.to(units, {
                    x: (i, t) => t.exitX,
                    y: (i, t) => t.exitY,
                    duration: tweenOut,
                    ease: "power1.out",
                    stagger: overlapOut,
                    onUpdate: () => drawTextForDownload()
                }, inEndTime + stayTime);
            }
            else if (OutanimationType === "roll") {

                const inRotationAmount = direction === "left" ? 360 : direction === "right" ? -360 : 360;
                const outRotationAmount = direction === "right" ? 360 : -360;


                const tweenIn = 0.15 * inTime;
                const tweenOut = 0.15 * outTime;

                // OUT: Rotate and move out

                units.forEach((unit, idx) => {
                    tlText.to(unit, {
                        x: (i, t) => t.exitX,
                        y: (i, t) => t.exitY,
                        rotation: `+=${outRotationAmount}`,
                        duration: halfOut,
                        ease: "power1.out",
                        onUpdate: () => drawTextForDownload()
                    }, OutanimationTypeoutStart + idx * tweenOut);
                });

            }
            else if (OutanimationType === "popcorn") {
                const staggerTime = (outTime / 2) / units.length;

                // Ensure all items are at full size before OUT begins
                units.flat().forEach(item => {
                    item.scaleX = 1;
                    item.scaleY = 1;
                });

                // 🔴 OUT: Pop-out in reverse order AFTER STAY (use outStart)
                units.slice().reverse().forEach((unit, idx) => {
                    const delay = OutanimationTypeoutStart + idx * staggerTime;

                    tlText.to(unit, {
                        scaleX: 1.3,
                        scaleY: 1.3,
                        duration: 0.2,
                        ease: "power2.out",
                        onUpdate: () => drawTextForDownload()
                    }, delay);

                    tlText.to(unit, {
                        scaleX: 0,
                        scaleY: 0,
                        duration: 0.3,
                        ease: "back.in",
                        onUpdate: () => drawTextForDownload()
                    }, delay + 0.2);
                });
            }
            else if (OutanimationType === "mask") {
                // 1) Make sure all items are fully visible before OUT
                allItems.forEach(o => {
                    o.clip = 0; // fully visible
                    o.clipDirection = direction; // restore to IN direction (optional)
                });

                // 2) At OUT phase, flip clipDirection to OUT direction
                tlText.add(() => {
                    allItems.forEach(o => {
                        o.clipDirection = invertDirection(Outdirection);
                    });
                }, OutanimationTypeoutStart); // ensure this is AFTER stay

                // 3) Animate clip: visible → hidden
                tlText.to(allItems, {
                    clip: 1,
                    duration: outTime,
                    ease: "power2.out",
                    onUpdate: () => drawTextForDownload()
                }, OutanimationTypeoutStart);

                // 4) Final reset (optional — useful for loop)
                tlText.add(() => {
                    allItems.forEach(o => {
                        o.clip = 1;
                        o.clipDirection = Outdirection;
                    });
                    drawTextForDownload();
                }, OutanimationTypeoutStart + outTime);
            }
            else if (OutanimationType === "zoom") {
                // ensure everything is at full size
                units.flat().forEach(item => {
                    item.scaleX = 1;
                    item.scaleY = 1;
                });

                // OUT: shrink each unit from full → zero, staggered
                units.forEach((unit, idx) => {
                    tlText.to(unit, {
                        scaleX: 0,
                        scaleY: 0,
                        duration: tweenOut,
                        ease: "power2.in",
                        onUpdate: () => drawTextForDownload()
                    }, OutanimationTypeoutStart + idx * tweenOut);
                });

                // optional: reset for loop consistency
                tlText.add(() => {
                    units.flat().forEach(item => {
                        item.scaleX = 0;
                        item.scaleY = 0;
                    });
                    drawTextForDownload();
                }, OutanimationTypeoutStart + units.length * tweenOut);
            }
        }
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

            const tlText = gsap.timeline({
                repeat: loopCount - 1,
                onUpdate: () => drawTextForDownload()
            });

            staticItems.forEach(o => {
                tlText.set(o, { scaleX: 1, scaleY: 1 }, 0);
            });

            const staggerTime = (inTime / 2) / units.length;

            // 🍿 IN: Pop each unit with pulse
            units.forEach((unit, idx) => {
                const start = idx * staggerTime;

                tlText.to(unit, {
                    scaleX: 1.3,
                    scaleY: 1.3,
                    duration: 0.2,
                    ease: "power2.out",
                    onUpdate: () => drawTextForDownload()
                }, start);

                tlText.to(unit, {
                    scaleX: 1.0,
                    scaleY: 1.0,
                    duration: 0.3,
                    ease: "bounce.out",
                    onUpdate: () => drawTextForDownload()
                }, start + 0.2);
            });

            // ⏸ STAY
            tlText.to({}, { duration: stayTime });
            const delaylineartweenIn = 0.15 * inTime;
            const delaylineartotalIn = units.length * delaylineartweenIn;

            // 2) OUT tweens
            const OutanimationTypeoutStart = delaylineartotalIn + stayTime;
            if (OutanimationType === "delaylinear") {


                const delaylineartweenOut = 0.15 * outTime;
                units.forEach((unit, idx) => {
                    tlText.to(unit, {
                        x: (i, t) => t.exitX,
                        y: (i, t) => t.exitY,
                        duration: outTime * .6,
                        ease: "power1.out",
                        onUpdate: () => drawTextForDownload()
                        /*}, OutanimationTypeoutStart + idx * delaylineartweenOut);*/
                    }, inTime + stayTime);
                });
            }
            else if (OutanimationType === "delaylinear2") {
                const tweenIn = 0.20 * inTime;
                const tweenOut = 0.20 * outTime;
                const overlapIn = tweenIn / 3;
                const inEndTime = (units.length - 1) * overlapIn + tweenIn;
                const overlapOut = tweenOut / 3;   // each next Out starts 50% in
                // ── OUT ──
                tlText.to(units, {
                    x: (i, t) => t.exitX,
                    y: (i, t) => t.exitY,
                    duration: tweenOut,
                    ease: "power1.out",
                    stagger: overlapOut,
                    onUpdate: () => drawTextForDownload()
                }, inEndTime + stayTime);
                //// ── NORMALIZE TIMING ──
                //const slideExecutionTime = inTime + stayTime + outTime;
                //const actualDuration = tlText.duration();
                //const perfectRatio = slideExecutionTime / actualDuration;

                //tlText.timeScale(perfectRatio * 0.4);
            }
            else if (OutanimationType === "roll") {

                const inRotationAmount = direction === "left" ? 360 : direction === "right" ? -360 : 360;
                const outRotationAmount = direction === "right" ? 360 : -360;


                const tweenIn = 0.15 * inTime;
                const tweenOut = 0.15 * outTime;
                const halfOut = outTime * 0.5;
                // OUT: Rotate and move out

                units.forEach((unit, idx) => {
                    tlText.to(unit, {
                        x: (i, t) => t.exitX,
                        y: (i, t) => t.exitY,
                        rotation: `+=${outRotationAmount}`,
                        duration: halfOut,
                        ease: "power1.out",
                        onUpdate: () => drawTextForDownload()
                    }, OutanimationTypeoutStart + idx * tweenOut);
                });

            }
            else if (OutanimationType === "popcorn") {

                const staggerTime = (outTime / 2) / units.length;

                // Ensure all items are at full size before OUT begins
                units.flat().forEach(item => {
                    item.scaleX = 1;
                    item.scaleY = 1;
                });

                // 🔴 OUT: Pop-out in reverse order AFTER STAY (use outStart)
                units.slice().reverse().forEach((unit, idx) => {
                    const delay = OutanimationTypeoutStart + idx * staggerTime;

                    tlText.to(unit, {
                        scaleX: 1.3,
                        scaleY: 1.3,
                        duration: 0.2,
                        ease: "power2.out",
                        onUpdate: () => drawTextForDownload()
                    }, delay);

                    tlText.to(unit, {
                        scaleX: 0,
                        scaleY: 0,
                        duration: 0.3,
                        ease: "back.in",
                        onUpdate: () => drawTextForDownload()
                    }, delay + 0.2);
                });
            }
            else if (OutanimationType === "mask") {
                // 1) Make sure all items are fully visible before OUT
                allItems.forEach(o => {
                    o.clip = 0; // fully visible
                    o.clipDirection = direction; // restore to IN direction (optional)
                });

                // 2) At OUT phase, flip clipDirection to OUT direction
                tlText.add(() => {
                    allItems.forEach(o => {
                        o.clipDirection = invertDirection(Outdirection);
                    });
                }, OutanimationTypeoutStart); // ensure this is AFTER stay

                // 3) Animate clip: visible → hidden
                tlText.to(allItems, {
                    clip: 1,
                    duration: outTime,
                    ease: "power2.out",
                    onUpdate: () => drawTextForDownload()
                }, OutanimationTypeoutStart);

                // 4) Final reset (optional — useful for loop)
                tlText.add(() => {
                    allItems.forEach(o => {
                        o.clip = 1;
                        o.clipDirection = Outdirection;
                    });
                    drawTextForDownload();
                }, OutanimationTypeoutStart + outTime);
            }
            else if (OutanimationType === "zoom") {
                const tweenOut = 0.15 * outTime;
                // ensure everything is at full size
                units.flat().forEach(item => {
                    item.scaleX = 1;
                    item.scaleY = 1;
                });

                // OUT: shrink each unit from full → zero, staggered
                units.forEach((unit, idx) => {
                    tlText.to(unit, {
                        scaleX: 0,
                        scaleY: 0,
                        duration: tweenOut,
                        ease: "power2.in",
                        onUpdate: () => drawTextForDownload()
                    }, OutanimationTypeoutStart + idx * tweenOut);
                });

                // optional: reset for loop consistency
                tlText.add(() => {
                    units.flat().forEach(item => {
                        item.scaleX = 0;
                        item.scaleY = 0;
                    });
                    drawTextForDownload();
                }, OutanimationTypeoutStart + units.length * tweenOut);
            }
            //// 🔴 OUT: Pop-out in reverse order
            //const outStagger = (outTime / 2) / units.length;
            //units.slice().reverse().forEach((unit, idx) => {
            //    tl.to(unit, {
            //        scaleX: 0,
            //        scaleY: 0,
            //        duration: 0.3,
            //        ease: "back.in",
            //        onUpdate: () => drawCanvasForDownload(condition)
            //    }, idx * outStagger + tl.duration());
            //});
          

        }



        // zoom Canvas Animation
        else if (animationType === "zoom") {
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

            const tlText = gsap.timeline({
                repeat: loopCount - 1,
                onUpdate: () => drawTextForDownload()
            });

            staticItems.forEach(o => {
                tlText.set(o, { scaleX: 1, scaleY: 1 }, 0);
            });

            // IN phase: small to large (stay large)
            tlText.to(animItems, {
                scaleX: 1,
                scaleY: 1,
                duration: inTime/2,
                ease: "power2.out"
            }, 0);

            // STAY phase: hold the large size
            tlText.to({}, { duration: stayTime });
             tlText.to(animItems, {
                    scaleX: 0,
                    scaleY: 0,
                    duration: outTime/2,
                    ease: "power2.in"
                });

            const delaylineartweenIn = 0.15 * inTime;
            const delaylineartotalIn = units.length * delaylineartweenIn;

            // 2) OUT tweens
            const OutanimationTypeoutStart = delaylineartotalIn + stayTime;
            if (OutanimationType === "delaylinear") {


                const delaylineartweenOut = 0.15 * outTime;
                units.forEach((unit, idx) => {
                    tlText.to(unit, {
                        x: (i, t) => t.exitX,
                        y: (i, t) => t.exitY,
                    //    duration: outTime*.7,
                    //    ease: "power1.out",
                    //    onUpdate: () => drawCanvasForDownload(condition)
                    //    /*}, OutanimationTypeoutStart + idx * delaylineartweenOut);*/
                        //}, inTime + stayTime);
                        duration: outTime * .6,
                        ease: "power1.out",
                        onUpdate: () => drawTextForDownload()
                    }, OutanimationTypeoutStart + idx * 0);
                });
            }
            else if (OutanimationType === "delaylinear2") {
                const tweenIn = 0.20 * inTime;
                const tweenOut = 0.20 * outTime;
                const overlapIn = tweenIn / 3;
                const inEndTime = (units.length - 1) * overlapIn + tweenIn;
                const overlapOut = tweenOut / 3;   // each next Out starts 50% in
                // ── OUT ──
                tlText.to(units, {
                    x: (i, t) => t.exitX,
                    y: (i, t) => t.exitY,
                    duration: tweenOut,
                    ease: "power1.out",
                    stagger: overlapOut,
                    onUpdate: () => drawTextForDownload()
                }, inEndTime + stayTime);
                //// ── NORMALIZE TIMING ──
                //const slideExecutionTime = inTime + stayTime + outTime;
                //const actualDuration = tlText.duration();
                //const perfectRatio = slideExecutionTime / actualDuration;

                //tlText.timeScale(perfectRatio * 0.4);
            }
            else if (OutanimationType === "roll") {

                const inRotationAmount = direction === "left" ? 360 : direction === "right" ? -360 : 360;
                const outRotationAmount = direction === "right" ? 360 : -360;


                const tweenIn = 0.15 * inTime;
                const tweenOut = 0.15 * outTime;
                const halfOut = outTime * 0.5;
                // OUT: Rotate and move out

                units.forEach((unit, idx) => {
                    tlText.to(unit, {
                        x: (i, t) => t.exitX,
                        y: (i, t) => t.exitY,
                        rotation: `+=${outRotationAmount}`,
                        duration: halfOut,
                        ease: "power1.out",
                        onUpdate: () => drawTextForDownload()
                    }, OutanimationTypeoutStart + idx * tweenOut);
                });

            }
            else if (OutanimationType === "popcorn") {
                const staggerTime = (outTime / 2) / units.length;

                // Ensure all items are at full size before OUT begins
                //units.flat().forEach(item => {
                //    item.scaleX = 1;
                //    item.scaleY = 1;
                //});

                //// 🔴 OUT: Pop-out in reverse order AFTER STAY (use outStart)
                units.slice().reverse().forEach((unit, idx) => {
                    const delay = OutanimationTypeoutStart + idx * staggerTime;

                    tlText.to(unit, {
                        scaleX: 1.3,
                        scaleY: 1.3,
                        duration: 0.2,
                        ease: "power2.out",
                        onUpdate: () => drawTextForDownload()
                    }, delay);

                    tlText.to(unit, {
                        scaleX: 0,
                        scaleY: 0,
                        duration: 0.3,
                        ease: "back.in",
                        onUpdate: () => drawTextForDownload()
                    }, delay + 0.2);
                });
            }
            else if (OutanimationType === "mask") {
                // 1) Make sure all items are fully visible before OUT
                allItems.forEach(o => {
                    o.clip = 0; // fully visible
                    o.clipDirection = direction; // restore to IN direction (optional)
                });

                // 2) At OUT phase, flip clipDirection to OUT direction
                tlText.add(() => {
                    allItems.forEach(o => {
                        o.clipDirection = invertDirection(Outdirection);
                    });
                }, OutanimationTypeoutStart); // ensure this is AFTER stay

                // 3) Animate clip: visible → hidden
                tlText.to(allItems, {
                    clip: 1,
                    duration: outTime,
                    ease: "power2.out",
                    onUpdate: () => drawTextForDownload()
                }, OutanimationTypeoutStart);

                // 4) Final reset (optional — useful for loop)
                tlText.add(() => {
                    allItems.forEach(o => {
                        o.clip = 1;
                        o.clipDirection = Outdirection;
                    });
                    drawTextForDownload();
                }, OutanimationTypeoutStart + outTime);
            }
            else if (OutanimationType === "zoom") {
                tlText.to(animItems, {
                    scaleX: 0,
                    scaleY: 0,
                    duration: outTime/2,
                    ease: "power2.in"
                });
            }
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




            const animItems = [...images.filter(i => !i.noAnim), ...textObjects.filter(t => !t.noAnim)];
           
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

            const tlText = gsap.timeline({
                repeat: loopCount - 1,
                onRepeat: () => {
                    allItems.forEach(o => {
                        o.clip = 1;
                        o.clipDirection = direction;
                    });
                    drawTextForDownload();
                },
                onUpdate: () => drawTextForDownload()
            });

            window.currentMaskTimeline = tlText;

            // IN: Reveal
            tlText.to(allItems, {
                clip: 0,
                duration: inTime,
                ease: "power2.out",
                onUpdate: () => drawTextForDownload()
            });

            // STAY: Hold visible
            tlText.to({}, { duration: stayTime });

            // OUT: At this moment, switch clipDirection
            tlText.add(() => {
                allItems.forEach(o => {
                    o.clipDirection = invertDirection(Outdirection);
                });
            });

            const delaylineartweenIn = 0.15 * inTime;
            const delaylineartotalIn = units.length * delaylineartweenIn;

            // 2) OUT tweens
            const OutanimationTypeoutStart = delaylineartotalIn + stayTime;
            if (OutanimationType === "delaylinear") {


                const delaylineartweenOut = 0.15 * outTime;
                units.forEach((unit, idx) => {
                    tlText.to(unit, {
                        x: (i, t) => t.exitX,
                        y: (i, t) => t.exitY,
                        duration: outTime * .6,
                        ease: "power1.out",
                        onUpdate: () => drawTextForDownload()
                        /* }, OutanimationTypeoutStart + idx * delaylineartweenOut);*/
                    }, inTime + stayTime);
                });
            }
            else if (OutanimationType === "delaylinear2") {
                const tweenIn = 0.20 * inTime;
                const tweenOut = 0.20 * outTime;
                const overlapIn = tweenIn / 3;
                const inEndTime = (units.length - 1) * overlapIn + tweenIn;
                const overlapOut = tweenOut / 3;   // each next Out starts 50% in
                // ── OUT ──
                tlText.to(units, {
                    x: (i, t) => t.exitX,
                    y: (i, t) => t.exitY,
                    duration: tweenOut,
                    ease: "power1.out",
                    stagger: overlapOut,
                    onUpdate: () => drawTextForDownload()
                }, inEndTime + stayTime);
                //// ── NORMALIZE TIMING ──
                //const slideExecutionTime = inTime + stayTime + outTime;
                //const actualDuration = tlText.duration();
                //const perfectRatio = slideExecutionTime / actualDuration;

                //tlText.timeScale(perfectRatio * 0.4);
            }
            else if (OutanimationType === "roll") {

                const inRotationAmount = direction === "left" ? 360 : direction === "right" ? -360 : 360;
                const outRotationAmount = direction === "right" ? 360 : -360;


                const tweenIn = 0.15 * inTime;
                const tweenOut = 0.15 * outTime;
                const halfOut = outTime * 0.5;
                // OUT: Rotate and move out

                units.forEach((unit, idx) => {
                    tlText.to(unit, {
                        x: (i, t) => t.exitX,
                        y: (i, t) => t.exitY,
                        rotation: `+=${outRotationAmount}`,
                        duration: halfOut,
                        ease: "power1.out",
                        onUpdate: () => drawTextForDownload()
                    }, OutanimationTypeoutStart + idx * tweenOut);
                });

            }
            else if (OutanimationType === "popcorn") {
                const staggerTime = (outTime / 2) / units.length;

                // Ensure all items are at full size before OUT begins
                units.flat().forEach(item => {
                    item.scaleX = 1;
                    item.scaleY = 1;
                });

                // 🔴 OUT: Pop-out in reverse order AFTER STAY (use outStart)
                units.slice().reverse().forEach((unit, idx) => {
                    const delay = OutanimationTypeoutStart + idx * staggerTime;

                    tlText.to(unit, {
                        scaleX: 1.3,
                        scaleY: 1.3,
                        duration: 0.2,
                        ease: "power2.out",
                        onUpdate: () => drawTextForDownload()
                    }, delay);

                    tlText.to(unit, {
                        scaleX: 0,
                        scaleY: 0,
                        duration: 0.3,
                        ease: "back.in",
                        onUpdate: () => drawTextForDownload()
                    }, delay + 0.2);
                });
            }
            else if (OutanimationType === "mask") {
                // OUT: Mask again
                tlText.to(allItems, {
                    clip: 1,
                    duration: outTime,
                    ease: "power2.out",
                    onUpdate: () => drawTextForDownload()
                });

                // Final Reset
                tlText.eventCallback("onComplete", () => {
                    allItems.forEach(o => {
                        o.clip = 1;
                        o.clipDirection = Outdirection;  // Reset for next replay
                    });
                    drawTextForDownload();
                });
            }
            else if (OutanimationType === "zoom") {
                const tweenOut = 0.15 * outTime;
                // ensure everything is at full size
                units.flat().forEach(item => {
                    item.scaleX = 1;
                    item.scaleY = 1;
                });

                // OUT: shrink each unit from full → zero, staggered
                units.forEach((unit, idx) => {
                    tlText.to(unit, {
                        scaleX: 0,
                        scaleY: 0,
                        duration: tweenOut,
                        ease: "power2.in",
                        onUpdate: () => drawTextForDownload()
                    }, OutanimationTypeoutStart + idx * tweenOut);
                });

                // optional: reset for loop consistency
                tlText.add(() => {
                    units.flat().forEach(item => {
                        item.scaleX = 0;
                        item.scaleY = 0;
                    });
                    drawTextForDownload();
                }, OutanimationTypeoutStart + units.length * tweenOut);
            }

            

        }


      
       
        });
    

     
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
function LoadAllVerticalTemplates() {
    const $list = $('#divTemplateList');
    if ($list.length === 0) {
        console.warn('#divTemplateList not found');
        return;
    }
    $list.empty();

    $.ajax({
        url: joinUrl(baseURL, 'Canvas/GetAllTemplates'),
        type: 'POST',
        dataType: 'json'
    })
        .done((res) => {

            // Normalize
            const all = Array.isArray(res) ? res : (res?.data || []);

            // ⛳ filter templates by slideType = "Vertical"
            const vertical = all.filter(t =>
                String(t?.slideType || t?.SlideType || '').toLowerCase() === 'vertical'
            );

            const frag = document.createDocumentFragment();
            let appended = 0;

            vertical.forEach(tpl => {
                const details = Array.isArray(tpl?.designBoardDetailsList) ? tpl.designBoardDetailsList : [];

                // only Slide-1
                details
                    .filter(d => String(d?.slideName || '').toLowerCase() === 'slide-1')
                    .forEach(d => {
                        const imgPath = d?.animationImagePath || '';
                        if (!imgPath) return;

                        const img = document.createElement('img');
                        img.className = 'v_temp';
                        img.loading = 'lazy';
                        img.decoding = 'async';
                        img.alt = (tpl?.designBoardName || 'Template') + ' preview';
                        img.src = joinUrl(baseURL, imgPath);

                        if (tpl?.designBoardId != null) img.dataset.templateId = tpl.designBoardId;
                        if (d?.designBoardDetailsId != null) img.dataset.detailId = d.designBoardDetailsId;

                        frag.appendChild(img);
                        appended++;
                    });
            });

            if (appended === 0) {
                $list.append('<div class="text-muted p-2">No Vertical / Slide previews found.</div>');
            } else {
                $list[0].appendChild(frag);
            }
        })
        .fail((xhr) => {
            console.log('error in fetching templates', xhr);
            $list.append('<div class="text-danger p-2">Failed to load templates.</div>');
        })
        .always(() => { if (typeof HideLoader === 'function') HideLoader(); });

    function joinUrl(a, b) {
        if (!a) return b || '';
        if (!b) return a || '';
        return String(a).replace(/\/+$/, '') + '/' + String(b).replace(/^\/+/, '');
    }
}
function copyPanelleftToDownload() {
    const el = document.getElementById('canvasMainContainer');
    if (!el) return;
    el.style.setProperty('display', 'none', 'important');   // beats !important

    const $src = $('#divpanelleft');
    const $dst = $('#divpanelleftDownload').empty();
    if ($src.length === 0 || $dst.length === 0) return;

    const $clone = $src.clone(false);          // no events
    $clone.removeAttr('id');
    $clone.find('[id]').each(function () { this.id = this.id + '-dl'; });
    $clone.find('img[data-src]').each(function () { this.src = this.dataset.src; this.removeAttribute('data-src'); });

    // preserve form values
    $src.find('input,textarea,select').each(function (i, el) {
        const $c = $clone.find('input,textarea,select').eq(i);
        if (!$c.length) return;
        if (el.tagName === 'INPUT') {
            const t = (el.type || '').toLowerCase();
            if (t === 'checkbox' || t === 'radio') $c.prop('checked', el.checked);
            else $c.val(el.value);
        } else if (el.tagName === 'TEXTAREA') {
            $c.val(el.value);
        } else if (el.tagName === 'SELECT') {
            $c.prop('selectedIndex', el.selectedIndex);
            $(el.options).each(function (j, opt) {
                $c[0].options[j].selected = opt.selected;
            });
        }
    });

    $dst.append($clone.contents());
}

function clearleftDownloadPanel() {
    const el = document.getElementById('canvasMainContainer');
    if (!el) return;
    el.style.removeProperty('display'); // lets your Bootstrap d-flex apply again
    $('#divpanelleftDownload').empty();
}
function copyPanelrightToDownload() {
    const $src = $('#divpanelright');
    const $dst = $('#divpanelrightDownload').empty();
    if ($src.length === 0 || $dst.length === 0) return;

    const $clone = $src.clone(false);          // no events
    $clone.removeAttr('id');
    $clone.find('[id]').each(function () { this.id = this.id + '-dl'; });
    $clone.find('img[data-src]').each(function () { this.src = this.dataset.src; this.removeAttribute('data-src'); });

    // preserve form values
    $src.find('input,textarea,select').each(function (i, el) {
        const $c = $clone.find('input,textarea,select').eq(i);
        if (!$c.length) return;
        if (el.tagName === 'INPUT') {
            const t = (el.type || '').toLowerCase();
            if (t === 'checkbox' || t === 'radio') $c.prop('checked', el.checked);
            else $c.val(el.value);
        } else if (el.tagName === 'TEXTAREA') {
            $c.val(el.value);
        } else if (el.tagName === 'SELECT') {
            $c.prop('selectedIndex', el.selectedIndex);
            $(el.options).each(function (j, opt) {
                $c[0].options[j].selected = opt.selected;
            });
        }
    });

    $dst.append($clone.contents());
    const popup = document.getElementById("background_popup");

    if (!popup) return;
    else
        popup.style.display = "none";

   
}

function clearrightDownloadPanel() {
    $('#divpanelrightDownload').empty();
}

