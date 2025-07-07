let publishDownloadcondition = '';
const RECORD_OPTIONS = {
    mimeType: 'video/webm; codecs=vp9',
    videoBitsPerSecond: 10_000_000 // 10 Mbps
};


async function GetDesignBoardByIdForDownloadNew(condition) {
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
        //MessageShow('', 'Before Download Must Save Board', 'error');
        for (let i = 1; i <= 3; i++)
        {
            if (i == 1) {
                publishWithRecording($("#hdnInDirectiontSlide1").val(), $("#hdnInEffectSlide1").val(), $("#hdnDirectiontSlide1Out").val(), $("#hdnEffectSlide1Out").val(), '', 1);
                //applyAnimationsForPublish($("#hdnInDirectiontSlide1").val(), $("#hdnInEffectSlide1").val(), $("#hdnDirectiontSlide1Out").val(), $("#hdnEffectSlide1Out").val(), '', 1);
            }
            //else if (i == 2) {
            //    applyAnimationsForPublish($("#hdnInDirectiontSlide2").val(), $("#hdnInEffectSlide2").val(), $("#hdnDirectiontSlide2Out").val(), $("#hdnEffectSlide2Out").val(), condition, loopCount);
            //}
            //else if (i == 3) {
            //    applyAnimationsForPublish($("#hdnInDirectiontSlide3").val(), $("#hdnInEffectSlide3").val(), $("#hdnDirectiontSlide3Out").val(), $("#hdnEffectSlide3Out").val(), condition, loopCount);
            //}
        }
      
    }
}
// Recording configuration
const FPS = 60;  // target frames per second for capture
const TIMESLICE = 1000 / FPS;  // how often to flush dataavailable events

const options = {
    mimeType: 'video/webm; codecs=vp9',
    videoBitsPerSecond: 10_000_000
};

const canvasForDownload = document.getElementById('recordCanvas');
const ctxForDownload = canvasForDownload.getContext('2d');
// captureStream at specified FPS
const streamForDownload = canvasForDownload.captureStream(FPS);
const recorder = new MediaRecorder(streamForDownload, options);
const chunks = [];

recorder.ondataavailable = e => {
    if (e.data && e.data.size) chunks.push(e.data);
};
recorder.onstop = () => {
    const blob = new Blob(chunks, { type: options.mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `animation_${Date.now()}.webm`;
    a.click();
};

/**
 * Records the #canvasContainer DIV animation to WebM.
 */
function publishWithRecording(inDir, inType, outDir, outType, cond, loopCount) {
    applyAnimationsForPublish(inDir, inType, outDir, outType, cond, loopCount);


   


    //const json = serializeCanvas();
    //// POST `json` to your server, or prompt a download:
    //const a = document.createElement('a');
    //a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    //a.download = 'scene.json';
    //a.click();
    const companyUniqueId = getCompanyIdFromUrl();
    const targetUrl = `${window.location.origin}/Screen/${companyUniqueId}`;
    window.open(targetUrl, "_blank");
}
function getCompanyIdFromUrl() {
    //const pathSegments = window.location.pathname.split('/');
    //return pathSegments[pathSegments.length - 1];
    return 1;
}

/**
 * Serialize everything inside your #canvasContainer into JSON.
 * Returns a string you can POST/save.
 */
function serializeCanvas() {
    const out = [];
    document.querySelectorAll('#canvasContainer > *').forEach(el => {
        const $el = el;
        const style = window.getComputedStyle(el);

        // only serialize visible boxes
        const w = el.offsetWidth, h = el.offsetHeight;
        if (w === 0 && h === 0) return;

        const data = {
            tag: el.tagName.toLowerCase(),
            left: parseFloat(style.left) || 0,
            top: parseFloat(style.top) || 0,
            width: w,
            height: h,
            rotate: 0,
            payload: null,
            style: el.getAttribute('style') || '',
            className: el.className || '',
            attributes: {}
        };

        // rotation
        const m = style.transform.match(/rotate\(([-\d.]+)deg\)/);
        if (m) data.rotate = parseFloat(m[1]);

        // capture all element attributes (like contenteditable)
        for (let attr of el.attributes) {
            if (attr.name !== 'style' && attr.name !== 'class') {
                data.attributes[attr.name] = attr.value;
            }
        }

        // text payload
        if (el.classList.contains('text-box')) {
            data.payload = {
                type: 'text',
                html: el.querySelector('.text-content')?.innerHTML || ''
            };
        }
        // image element
        else if (el.tagName.toLowerCase() === 'img') {
            data.payload = {
                type: 'image',
                url: el.src
            };
        }
        // background image (for div shapes or gradients)
        else if (style.backgroundImage && style.backgroundImage !== 'none') {
            const url = style.backgroundImage.replace(/^url\((["']?)(.+?)\1\)$/, '$2');
            data.payload = {
                type: 'image',
                url
            };
        }
        // inline SVG
        else if (el.querySelector('svg')) {
            const svg = el.querySelector('svg');
            data.payload = {
                type: 'svg',
                markup: svg.outerHTML
            };
        }

        out.push(data);
    });

    return JSON.stringify({
        elements: out,
        animation: { timings: { inTime: 4, stayTime: 3, outTime: 4 } }
    }, null, 2);
}



/**
 * Clear #canvasContainer and rebuild from a JSON string.
 */
function loadCanvasFromJSON(jsonStr) {
    const arr = JSON.parse(jsonStr);
    const $container = $('#canvasContainer').empty();

    arr.forEach(item => {
        let $el;

        switch (item.payload && item.payload.type) {
            case 'text':
                $el = $(`
          <div class="text-box">
            <div class="text-content" contenteditable="true">
              ${item.payload.html}
            </div>
          </div>
        `);
                break;

            case 'image':
                // you can choose <img> or div with background:
                $el = $(`<img src="${item.payload.url}" />`);
                break;

            case 'svg':
                $el = $(item.payload.markup);
                break;

            default:
                // fallback: just a generic div
                $el = $('<div class="text-box"></div>');
        }

        $el.css({
            position: 'absolute',
            left: item.left + 'px',
            top: item.top + 'px',
            width: item.width + 'px',
            height: item.height + 'px',
            transform: `rotate(${item.rotate}deg)`
        });

        $container.append($el);

        // re‑apply your draggable/resizable logic, etc.
        if ($el.hasClass('text-box')) {
            makeBoxDraggableAndResizable($el);
        }
    });
}





