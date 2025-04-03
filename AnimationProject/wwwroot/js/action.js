
var activeSlide = 1;  // initially, assume slide 1 is active
var verticalSlide1 = null;
var verticalSlide2 = null;
var verticalSlide3 = null;
var canvasBgColor = null;
function SaveDesignBoard() {
    // Save the current slide before proceeding (if you have an active slide mechanism)
    saveCurrentSlide();
    try {
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

        ShowLoader();
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
                var defaultEffect = 'bounce';
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

                HideLoader();

                // Check for login response or success message as needed.
                if (result === "login") {
                    window.location.href = baseURL + 'Login/Index';
                    return false;
                }
                if (result !== null) {
                   

                    MessageShow('RedirectToVerticalPageWithQueryString()', 'Design Board saved successfully!', 'success');
                }
                HideLoader();
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
function RedirectToVerticalPageWithQueryString() {
    // Get the GUID from the hidden field
    var boardId = $("#hdnDesignBoardId").val();

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
    // Update the active slide number.
    activeSlide = newSlideNumber;

    // Create a helper to get a deep copy of a JSON string.
    function getDeepCopy(jsonStr) {
        try {
            return JSON.stringify(JSON.parse(jsonStr));
        } catch (e) {
            console.error("Error creating deep copy:", e);
            return jsonStr;
        }
    }

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
        document.getElementById("a" + $("#hdnEffectSlide1").val() + "").classList.add("active_effect");
        document.getElementById("a" + $("#hdnDirectiontSlide1").val() + "").classList.add("active_effect");
    }
    else if (activeSlide === 2) {
        document.getElementById("a" + $("#hdnEffectSlide2").val() + "").classList.add("active_effect");
        document.getElementById("a" + $("#hdnDirectiontSlide2").val() + "").classList.add("active_effect");
    }
    else if (activeSlide === 3) {
        document.getElementById("a" + $("#hdnEffectSlide3").val() + "").classList.add("active_effect");
        document.getElementById("a" + $("#hdnDirectiontSlide3").val() + "").classList.add("active_effect");
    }
}

function saveCanvasData() {
    // Retrieve the canvas background color. If not set, default to white.
     canvasBgColor = canvas.style.backgroundColor || "#ffffff";
    // Retrieve the background image source if available.
    const canvasBgImage = canvas.bgImage ? canvas.bgImage.src : "";

    const data = {
        canvasBgColor: canvasBgColor,  // Background color of the canvas.
        canvasBgImage: canvasBgImage,  // Background image source URL.
        slideEffect: $("#hdnTextAnimationType").val(),
        slideDedirection:$("#hdnslideDedirection").val(),
        text: textObjects.map(obj => ({
            text: obj.text,
            x: obj.x,
            y: obj.y,
            boundingWidth: obj.boundingWidth,
            boundingHeight: obj.boundingHeight,
            fontSize: obj.fontSize,
            fontFamily: obj.fontFamily,
            textColor: obj.textColor,
            textAlign: obj.textAlign,
            opacity: obj.opacity
        })),
        images: images.map(imgObj => ({
            // Save the updated SVG markup if it exists, otherwise the src.
            src: imgObj.svgData || imgObj.src,
            x: imgObj.x,
            y: imgObj.y,
            width: imgObj.width,
            height: imgObj.height,
            scaleX: imgObj.scaleX || 1,
            scaleY: imgObj.scaleY || 1,
            opacity: imgObj.opacity
        }))
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
                        try {
                            loadCanvasFromJson(verticalSlide1, 'Common');
                        } catch (error) {
                            console.error('Error loading slide 1:', error);
                        }
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
function RedirectToVerticalPage(id) {
    // Use encodeURIComponent for URL safety
    window.location = `${baseURL}Canvas/VerticalIndex?id=${encodeURIComponent(id)}`;
}
function RedirectToVerticalPageDirect() {
    // Use encodeURIComponent for URL safety
    window.location = `${baseURL}Canvas/VerticalIndex`;
}
// Restore the canvas from your JSON data
function loadCanvasFromJson(jsonData, condition) {
    // Clear the canvas first.
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // If no JSON data, simply call drawCanvas with default settings.
    if (!jsonData) {
        drawCanvas(condition);
        return;
    }

    try {
        // Parse the JSON string.
        var data = JSON.parse(jsonData);
        // Set the canvas background color.
        canvasBgColor = data.canvasBgColor || "#ffffff";
        $("#hdnBackgroundSpecificColor").val(canvasBgColor);
        // Fill the canvas with the background color.
        //ctx.fillStyle = canvasBgColor;
        //ctx.fillRect(0, 0, canvas.width, canvas.height);
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
                drawCanvas(condition);
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
        drawCanvas(condition);
    }
}


