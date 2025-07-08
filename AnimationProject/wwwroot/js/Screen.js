window.addEventListener('load', () => {
    const docEl = document.documentElement;

    // Try the standard API
    if (docEl.requestFullscreen) {
        docEl.requestFullscreen().catch(err => {
            console.warn('Fullscreen request failed:', err);
        });
    }
    // Firefox
    else if (docEl.mozRequestFullScreen) {
        docEl.mozRequestFullScreen();
    }
    // Chrome, Safari & Opera
    else if (docEl.webkitRequestFullscreen) {
        docEl.webkitRequestFullscreen();
    }
    // IE/Edge
    else if (docEl.msRequestFullscreen) {
        docEl.msRequestFullscreen();
    }
});

function disableTextEditing() {
    const textElements = document.querySelectorAll('.text-content');
    textElements.forEach(el => {
        el.removeAttribute('contenteditable');
    });
}
async function loadCanvasContainer() {
    return new Promise((resolve) => {
        const container = document.getElementById('canvasContainer');
        container.innerHTML = '';
        const savedData = JSON.parse(localStorage.getItem('canvasData'));
        const designBoardId = sessionStorage.getItem("DesignBoardPublishId");
        var data = {
            DesignBoardPublishId: designBoardId
        };
        if (savedData == "") {
            savedData = await $.ajax({
                url: baseURL + "Canvas/GetResponseDesignBoardDetailsPublishById",
                type: "POST",
                dataType: "json",
                data: data,
                success: function (result) {
                   
                    HideLoader();
                },
                error: function (data) {
                    console.log("error");
                    console.log(data);
                    HideLoader();
                }
            });
        }

        

        if (!savedData) {
            console.log('No data to load.');
            return resolve(); // Even if no data, finish the step
        }

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
        applyAnimationsForPublish("left", "delaylinear2", "top", "delaylinear2", "", 1);

        resolve(); // ✅ Tell the system that loading is finished
    });
}


async function startLoop() {
    while (true) {
        await loadCanvasContainer();   // Wait until loading is fully done
        disableTextEditing();          // Then lock editing
        await new Promise(res => setTimeout(res, 10500));  // Wait before next cycle
    }
}

(function () {
    const canvas = document.getElementById('myCanvas');
    if (!canvas) return;

    // 1) Capture the original viewport size on page load
    const originalW = window.innerWidth;
    const originalH = window.innerHeight;

    // 2) Decide what “significant” means (e.g. 20% change or a fixed px)
    const THRESHOLD_PX = 100;

    // 3) Handler for viewport changes
    function onResize() {
        const w = window.innerWidth;
        const h = window.innerHeight;

        // If either dimension changed by more than our threshold, treat it as fullscreen toggle
        const widthDiff = Math.abs(w - originalW);
        const heightDiff = Math.abs(h - originalH);

        if (widthDiff > THRESHOLD_PX || heightDiff > THRESHOLD_PX) {
            // Entered fullscreen (UI hidden)
            canvas.style.height = h + 'px';
            canvas.style.width = w + 'px';
            console.log('▶ Entered “TV fullscreen” mode');
        } else {
            // Exited fullscreen (UI shown)
            canvas.style.height = '';  // restore via CSS or inline style
            canvas.style.width = '';
            console.log('◀ Exited “TV fullscreen” mode');
        }
    }

    // 4) Listen for all resize events
    window.addEventListener('resize', onResize);
})();