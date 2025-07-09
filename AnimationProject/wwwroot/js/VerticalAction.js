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
               // publishWithRecording($("#hdnInDirectiontSlide1").val(), $("#hdnInEffectSlide1").val(), $("#hdnDirectiontSlide1Out").val(), $("#hdnEffectSlide1Out").val(), '', 1);
              await  applyAnimationsForPublish($("#hdnInDirectiontSlide1").val(), $("#hdnInEffectSlide1").val(), $("#hdnDirectiontSlide1Out").val(), $("#hdnEffectSlide1Out").val(), '', 1);
                saveCanvasContainer();
                
                var id = $('#hdnDesignBoardId').val(); // get GUID value
                var designBoardPublishId = $('#hdnDesignBoardPublishId').val() ||'00000000-0000-0000-0000-000000000000'; // get GUID value
                if (id === '') {// need to change
                    try {
                        var data = {
                            DesignBoardId: 'D83CD53F-FB40-41BD-9B17-31CECE2232B1',//3664686F-7007-401A-850C-24916D63BD7A  or D83CD53F-FB40-41BD-9B17-31CECE2232B1 for local //904A244F-9D14-4075-BE33-99E6C7E812DB lIVE
                            DesignBoardPublishId: designBoardPublishId,
                            Jsondata: JSON.stringify(localStorage.getItem('canvasData'), null, 2),
                            InEffect: $("#hdnInEffectSlide1").val() ||'delaylinear2',
                            InDirection: $("#hdnInDirectiontSlide1").val() ||'left',
                            OutEffect: $("#hdnEffectSlide1Out").val() ||'delaylinear2',
                            OutDirection: $("#hdnDirectiontSlide1Out").val() || 'top',
                            CompanyUniqueId:1
                        };
                       
                        ShowLoader();
                      
                        const result = await $.ajax({
                            url: baseURL + "Canvas/PublishDesignSlideBoard",
                            type: "POST",
                            dataType: "json",
                            data: data,
                            success: function (result) {
                                $("#hdnDesignBoardPublishId").val(result.result);
                                $("#hdnPublishBoardUniqueId").val(result.publishBoardUniqueId);
                                
                               // sessionStorage.setItem("DesignBoardPublishId", $("#hdnDesignBoardPublishId").val());
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
                }

                const companyUniqueId = getCompanyIdFromUrl();
                const projectId = $("#hdnPublishBoardUniqueId").val();
                window.open(`${window.location.origin}/Screen/${companyUniqueId}/${projectId}`, "_blank");

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
function saveCanvasContainer() {
    const container = document.getElementById('canvasContainer');
    const elements = container.children; // ✅ Direct children only

    localStorage.removeItem('canvasData');

    const saveData = [];

    Array.from(elements).forEach(el => {
        saveData.push({
            id: el.id,
            class: el.className,
            html: el.innerHTML,
            style: {
                left: el.style.left,
                top: el.style.top,
                width: el.style.width,
                height: el.style.height,
                transform: el.style.transform,
                zIndex: el.style.zIndex,
                fontSize: el.style.fontSize,
                color: el.style.color,
                position: el.style.position
            }
        });
    });
    //need to delete
    localStorage.setItem('canvasData', JSON.stringify(saveData));
    console.log('Saved:', JSON.stringify(saveData, null, 2));
}

function loadCanvasContainer() {
    const container = document.getElementById('canvasContainer');
    container.innerHTML = ''; // Clear existing elements

    const savedData = JSON.parse(localStorage.getItem('canvasData'));

    savedData.forEach(item => {
        const el = document.createElement('div');
        el.id = item.id;
        el.className = item.class;

        for (const key in item.style) {
            el.style[key] = item.style[key];
        }

        el.innerHTML = item.html;

        container.appendChild(el);
    });

    console.log('Loaded:', savedData);
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
//async function publishWithRecording(inDir, inType, outDir, outType, cond, loopCount) {
//    // 1) Prepare hidden canvas + recorder
//    const canvas = document.getElementById("recordCanvas");
//    const ctx = canvas.getContext("2d");
//    const stream = canvas.captureStream(60);
//    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9' });
//    const chunks = [];
//    recorder.ondataavailable = e => e.data.size && chunks.push(e.data);

//    // 2) Snapshot loop (if your animation is in DOM)
//    const loop = setInterval(() => {
//        html2canvas(document.getElementById('canvasContainer')).then(dc => {
//            ctx.clearRect(0, 0, canvas.width, canvas.height);
//            ctx.drawImage(dc, 0, 0, canvas.width, canvas.height);
//        });
//    }, 1000 / 60);

//    // 3) Start recording
//    recorder.start();

//    // 4) Run your animation
//    await applyAnimationsForPublish(inDir, inType, outDir, outType, cond, loopCount);

//    // 5) Stop everything once done
//    clearInterval(loop);
//    recorder.stop();

//    // 6) When recorder.onstop fires, assemble & download
//    recorder.onstop = () => {
//        const blob = new Blob(chunks, { type: 'video/webm' });
//        const url = URL.createObjectURL(blob);
//        const a = document.createElement('a');
//        a.href = url;
//        a.download = 'recording.webm';
//        document.body.appendChild(a);
//        a.click();
//        URL.revokeObjectURL(url);
//    };


//        // 6) Finally, open your published screen
//        const companyUniqueId = getCompanyIdFromUrl();
//        window.open(`${window.location.origin}/Screen/${companyUniqueId}`, "_blank");
//    }


/**
 * Records the #canvasContainer DIV animation to WebM.
 */
async function publishWithRecordingOLD(inDir, inType, outDir, outType, cond, loopCount) {
    const canvas = document.getElementById('recordCanvas');
    const ctx = canvas.getContext('2d');
    const targetDiv = document.getElementById('canvasContainer');

    const targetFPS = 60;
    const frameDur = 18000 / targetFPS;
    const preFrames = 15;
    const postFrames = 30;

    let recordedFrames = 0;
    let phase = 'pre';   // 'pre', 'anim', 'post'
    let resolvePre;
    const preDone = new Promise(r => resolvePre = r);

    // 1) Start recording the hidden canvas
    const stream = canvas.captureStream(targetFPS);
    const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm; codecs=vp9; bitrate: 8000000'
    });
    const chunks = [];
    recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
    recorder.start();

    // 2) Frame‐capture loop via requestAnimationFrame
    let lastTime = performance.now();
    let rafId;

    function tick(now) {
        const delta = now - lastTime;
        if (delta >= frameDur) {
            lastTime = now - (delta % frameDur);

            html2canvas(targetDiv, {
                backgroundColor: null,
                scale: 1         // 1→fast, 2→hi‑res but slower
            }).then(dc => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(dc, 0, 0, canvas.width, canvas.height);
            }).catch(console.error);

            recordedFrames++;
            if (phase === 'pre' && recordedFrames >= preFrames) {
                phase = 'anim';
                resolvePre();
            }
        }
        rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);

    try {
        // 3) Wait through the 5 “pre” frames
        await preDone;

        // 4) Run your animation (IN → Stay → OUT)
        await applyAnimationsForPublish(inDir, inType, outDir, outType, cond, loopCount);

        // 5) Switch to “post” phase for 10 more frames
        phase = 'post';
        const targetTotal = preFrames + /* actual animation frames unknown */ 0 + postFrames;
        // Wait until recordedFrames ≥ preFrames + postFrames
        await new Promise(res => {
            const check = () => {
                if (recordedFrames >= preFrames + postFrames) return res();
                requestAnimationFrame(check);
            };
            check();
        });

    } catch (err) {
        console.error('Animation error:', err);
    } finally {
        // 6) Stop the capture loop & recorder
        cancelAnimationFrame(rafId);

        const stopped = new Promise(r => recorder.onstop = r);
        recorder.stop();
        await stopped;

        // 7) Assemble & download
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'recording_fullhd.webm';
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        a.remove();

        // 8) Then open your new page
        const companyUniqueId = getCompanyIdFromUrl();
        window.open(`${window.location.origin}/Screen/${companyUniqueId}`, "_blank");
    }
}








// Example: wrap your existing logic in a Promise




  




function getCompanyIdFromUrl() {
    //const pathSegments = window.location.pathname.split('/');
    //return pathSegments[pathSegments.length - 1];
    return 1;
}






