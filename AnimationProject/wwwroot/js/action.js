document.getElementById("saveButton").addEventListener("click", function () {
    const savedData = saveCanvasData();
    try {
var data = {
    DesignBoardId: '00000000-0000-0000-0000-000000000000',
    CustomerId: '4DB56C68-0291-497B-BBCF-955609284A70',
    CompanyId: 'F174A15A-76B7-4E19-BE4B-4E240983DE55',
    DesignBoardName:'DesignBoard-2'
}
console.log("data", data);
ShowLoader();
$.ajax({
    url: baseURL + "Canvas/SaveUpdateDesignBoard",
    type: "POST",
    dataType: "json",
    data: data,
    success: function (result) {
        console.log(result);
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
    console.log(savedData);
});

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

/// Do not delete////