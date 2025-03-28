let verticalSlide1 = null;
let verticalSlide2 = null;
let verticalSlide3 = null;
let slideNo = 1;

function SaveDesignBoard() {
   
    try {
var data = {
    DesignBoardId: '00000000-0000-0000-0000-000000000000',
    CustomerId: '4DB56C68-0291-497B-BBCF-955609284A70',
    CompanyId: 'F174A15A-76B7-4E19-BE4B-4E240983DE55',
    DesignBoardName: 'DesignBoard-3',
    SlideType:'Vertical'
}
console.log("data", data);
ShowLoader();
$.ajax({
    url: baseURL + "Canvas/SaveUpdateDesignBoard",
    type: "POST",
    dataType: "json",
    data: data,
    success: function (result) {
           $("#hdnDesignBoardId").val(result.result);
            for(let i = 1; i <= 3; i++) {
                let jsonValue = '';
                let fifImagePathStatic = '';
                let DesignBoardDetailsId = '00000000-0000-0000-0000-000000000000';
                if (parseInt(i) == 1) {
                    verticalSlide1 = saveCanvasData();
                    jsonValue = verticalSlide1;
                    /*DesignBoardDetailsId = $("#hdnDesignBoardDetailsIdSlide1").val();*/
                    fifImagePathStatic = '/images/Gallery-img/Slide_Gif1.gif';
                }
                else if (parseInt(i) == 2) {
                    //verticalSlide2 = saveCanvasData();
                    jsonValue = verticalSlide2;
                    /*DesignBoardDetailsId = $("#hdnDesignBoardDetailsIdSlide2").val();*/
                    fifImagePathStatic = '/images/Gallery-img/Slide_Gif2.gif';
                }
                else if (parseInt(i) == 3) {
                    //verticalSlide3 = saveCanvasData();
                    jsonValue = verticalSlide3;
                    /*DesignBoardDetailsId = $("#hdnDesignBoardDetailsIdSlide3").val();*/
                    fifImagePathStatic = '/images/Gallery-img/Slide_Gif3.gif';
                }
                var dataSlide = {
                    DesignBoardDetailsId: DesignBoardDetailsId,
                    DesignBoardId: $("#hdnDesignBoardId").val(),
                    SlideSequence: parseInt(i),
                    JsonFile: jsonValue,
                    SlideName: 'Slide-' + i,
                    GifImagePath: fifImagePathStatic
                }
                if ($("#hdnDesignBoardId").val() != '' && jsonValue !== null) {
                    $.ajax({
                        url: baseURL + "Canvas/SaveUpdateDesignSlideBoard",
                        type: "POST",
                        dataType: "json",
                        data: dataSlide,
                        success: function (result) {
                            jsonValue = '';
                            //if (parseInt(i) == 1) {
                            //    $("#hdnDesignBoardDetailsIdSlide1").val(result.result);
                            //}
                            //else if (parseInt(i) == 2) {
                            //    $("#hdnDesignBoardDetailsIdSlide2").val(result.result);
                            //}
                            //else if (parseInt(i) == 3) {
                            //    $("#hdnDesignBoardDetailsIdSlide3").val(result.result);
                            //}
                          
                            //console.log(result);
                            /*slideNo = slideNumber;*/
                           // HideLoader();
                        },
                        error: function (data) {
                            console.log("error");
                            console.log(data);
                            HideLoader();
                        }
                    });
                }
           }
        $("#hdnDesignBoardId").val('00000000-0000-0000-0000-000000000000');
            HideLoader();
    
        if (result === "login") {
            window.location.href = baseURL + 'Login/Index'
            return false;
        }
        if (result !== null) {
            MessageShow('', 'Design Board save Successfully!', 'success');
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

function clearCanvas() {
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
}

function SaveDesignBoardSlide(slideNumber) {
    ShowLoader();
    try {
        if (parseInt(slideNo) == 1) {
            verticalSlide1 = saveCanvasData();
            clearCanvas();
        }
        else if (parseInt(slideNo) == 2) {
            verticalSlide2 = saveCanvasData();
            clearCanvas();
        }
        else if (parseInt(slideNo) == 3) {
            verticalSlide3 = saveCanvasData();
            clearCanvas();
        }
        //var data = {
        //    DesignBoardDetailsId: $("#hdnDesignBoardDetailsId").val(),
        //    DesignBoardId: $("#hdnDesignBoardId").val(),
        //    SlideSequence: parseInt(slideNo),
        //    JsonFile: jsonValue,
        //    SlideName: 'Slide-' + slideNumber
        //}
        //if ($("#hdnDesignBoardId").val() != '') {
        //    $.ajax({
        //        url: baseURL + "Canvas/SaveUpdateDesignSlideBoard",
        //        type: "POST",
        //        dataType: "json",
        //        data: data,
        //        success: function (result) {
        //            $("#hdnDesignBoardDetailsId").val(result.result);
        //            console.log(result);
        //            slideNo = slideNumber;
        //            //if (result === "login") {
        //            //    window.location.href = baseURL + 'Login/Index'
        //            //    return false;
        //            //}
        //            //if (result !== null) {
        //            //    MessageShow('', 'Design Board save Successfully!', 'success');
        //            //}
        //            HideLoader();
        //        },
        //        error: function (data) {
        //            console.log("error");
        //            console.log(data);
        //            HideLoader();
        //        }
        //    });
        //}
        slideNo = slideNumber;
        HideLoader();
    } catch (e) {
        console.log("catch", e);
        HideLoader();
    }
}
function saveCanvasData() {
    // Retrieve the canvas background color. If not set, default to white.
    const canvasBgColor = canvas.style.backgroundColor || "#ffffff";
    // Retrieve the background image source if available.
    const canvasBgImage = canvas.bgImage ? canvas.bgImage.src : "";

    const data = {
        canvasBgColor: canvasBgColor,  // Background color of the canvas.
        canvasBgImage: canvasBgImage,  // Background image source URL.
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