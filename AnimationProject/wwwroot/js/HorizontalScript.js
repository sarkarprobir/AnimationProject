var activeSlide = 1;  // initially, assume slide 1 is active
var verticalSlide1 = null;
var verticalSlide2 = null;
var verticalSlide3 = null;
var canvasBgColor = null;

let currentIndex = 0;
let videoSaveForOnetime = 1;
let jsonArray = []; // Global array to store JSON objects
//const canvasElement = document.getElementById("myCanvasElement");
//const ctxElement = canvasElement.getContext("2d");
//const stream = canvasElement.captureStream(7); // Capture at 30 fps
//const recorder = new MediaRecorder(stream);
//const chunks = [];
//let publishDownloadcondition = '';
//const transitionState = { x: 0, y: 0, scale: 1, opacity: 1 };
//const options = {
//    mimeType: 'video/webm; codecs=vp9',
//    videoBitsPerSecond: 10_000_000  // 10 Mbps; adjust as needed
//};
//let currentIndexForDownload = 0;
//const canvasForDownload = document.getElementById("myCanvasElementDownload");
//const ctxElementForDownload = canvasForDownload.getContext("2d");
//const streamForDownload = canvasForDownload.captureStream(60); // Capture at 120 fps
//const recorderForDownload = new MediaRecorder(streamForDownload, options);
//const chunksForDownload = [];


function updateEffectButtons(type) {
    // 1) pick the right hidden‑field based on In vs Out
    const hiddenField = (type === 'In')
        ? `#hdnEffectSlide${activeSlide}`
        : `#hdnOutEffectSlide${activeSlide}`;
    const effectType = $(hiddenField).val();

    // 2) clear any previously active button
    // $('.effect_btn').removeClass('active_effect');

    // 3) pick the button selector
    let btnSelector = null;
    if (type === 'In') {
        $('.effectIn_btn').removeClass('active_effect');
        if (effectType === 'delaylinear') btnSelector = '#adelaylinear';
        else if (effectType === 'delaylinear2') btnSelector = '#adelaylinear2';
        else if (effectType === 'roll') btnSelector = '#aroll';
        else if (effectType === 'popcorn') btnSelector = '#apopcorn';
        else if (effectType === 'mask') btnSelector = '#amask';
    } else {
        $('.effectOut_btn').removeClass('active_effect');
        if (effectType === 'delaylinear') btnSelector = '#adelaylinearOut1';
        else if (effectType === 'delaylinear2') btnSelector = '#adelaylinearOut2';
        else if (effectType === 'roll') btnSelector = '#arollOut';
        else if (effectType === 'popcorn') btnSelector = '#apopcornOut';
        else if (effectType === 'mask') btnSelector = '#amaskOut';
    }
    if (effectType === 'roll') {
        document.getElementById('abottom')?.classList.add('disabled-ani-button');
        document.getElementById('atop')?.classList.add('disabled-ani-button');
        document.getElementById('obottom')?.classList.add('disabled-ani-button');
        document.getElementById('otop')?.classList.add('disabled-ani-button');


    } else {
        document.getElementById('abottom')?.classList.remove('disabled-ani-button');
        document.getElementById('atop')?.classList.remove('disabled-ani-button');
        document.getElementById('obottom')?.classList.remove('disabled-ani-button');
        document.getElementById('otop')?.classList.remove('disabled-ani-button');
    }
    // 4) activate it (if any)
    if (btnSelector) {
        $(btnSelector).addClass('active_effect');
    }
}
function TabShowHide(type) {
    if (type === 'In') {
        $("#hdnTabType").val('In');
        $("#marzen").css("display", "block");
        $("#rauchbier").css("display", "none");
        $("#dunkles").css("display", "none");
    }
    else if (type === 'Stay') {
        $("#hdnTabType").val('Stay');
        $("#marzen").css("display", "none");
        $("#rauchbier").css("display", "block");
        $("#dunkles").css("display", "none");
    }
    else if (type === 'Out') {
        $("#hdnTabType").val('Out');
        $("#marzen").css("display", "none");
        $("#rauchbier").css("display", "none");
        $("#dunkles").css("display", "block");
    }
    // Set the corresponding radio button as checked
    if (type === 'In') {
        document.getElementById("tab1").checked = true;
    } else if (type === 'Stay') {
        document.getElementById("tab2").checked = true;
    } else if (type === 'Out') {
        document.getElementById("tab3").checked = true;
    }

}


// show the popup when the pattern icon is clicked
$(document).on('click', '#toggle_img', function (e) {
    e.preventDefault();
    CreateHeaderSectionHorizontalhtml();
    $('#background_popup').show();
}); 

// hide the popup when the close button is clicked
$(document).on('click', '#close_button', function (e) {
    e.preventDefault();
    $('#background_popup').hide();
});
function opengl() {
    $("#opengl_popup").toggle();
    if (document.getElementById("fontstyle_popup").style.display == "block") {
        $("#fontstyle_popup").hide();
        $("#background_popup").hide();
        $(".right-sec-two").toggle();
        $(".right-sec-one").toggle();
    }
}
function switchTab(tabElement, tabName) {

    let tabs = document.querySelectorAll(".tab");
    let contents = document.querySelectorAll(".left_content");

    // Remove active class from all tabs
    tabs.forEach((tab) => tab.classList.remove("active"));

    // Add active class to clicked tab
    tabElement.classList.add("active");

    // Hide all content sections
    contents.forEach((content) => content.classList.remove("active"));

    // Show the selected tab's content
    document.getElementById(tabName).classList.add("active");
}

document.querySelectorAll('.H-link, .V-link').forEach(link => {
    link.addEventListener('click', () => {
        document.querySelectorAll('.H-link, .V-link').forEach(el => el.classList.remove('active'));
        link.classList.add('active');
    });
});
function opentl() {
    if (document.getElementById("opengl_popup").style.display == "block") {
        $("#opengl_popup").hide();
    }
    $("#fontstyle_popup").toggle();
    $(".right-sec-two").toggle();
    $(".right-sec-one").toggle();

}

// JavaScript for Handling Selection and Redirection 

let selectedOption = ""; // Variable to store the selected board type

document.getElementById("horizontal-option").addEventListener("click", function () {
    selectedOption = "horizontal";
    highlightSelection("horizontal-option");
});

document.getElementById("vertical-option").addEventListener("click", function () {
    selectedOption = "vertical";
    highlightSelection("vertical-option");
});

document.getElementById("create-button").addEventListener("click", function () {
    if (selectedOption === "horizontal") {
        window.location.href = "/Canvas/HorizontalIndex"; // Redirect to horizontal page
    } else if (selectedOption === "vertical") {
        window.location.href = "/Canvas/VerticalIndex"; // Redirect to vertical page
    } else {
        // alert("Please select an option before proceeding!");
        MessageShow('', 'Please select an option before proceeding!', 'error');
    }
});

// Function to highlight selected option
function highlightSelection(selectedId) {
    document.getElementById("horizontal-option").classList.remove("selected");
    document.getElementById("vertical-option").classList.remove("selected");
    document.getElementById(selectedId).classList.add("selected");
}

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.panel-vertical-scroll .menuboard-vertical-thum')
        .forEach(item => {
            item.addEventListener('click', function () {
                this.classList.toggle('active');
            });
        });
});

function handleVThumbClick(clickedElement) {
    const items = document.querySelectorAll('.menuboard-horizontal-thum');

    items.forEach(el => el.classList.remove('active_border'));
    clickedElement.classList.add('active_border');
}

// function for transition popup
function tranTogglePopup() {
    const popup = document.getElementById('tranPopup');
    const color_add = document.getElementById('tranColor');
    const otherPopups = [
        document.getElementById('opengl_popup'),
        document.getElementById('fontstyle_popup'),
        document.getElementById('background_popup'),
        document.getElementById('tranPopup'),
        document.querySelector('.right-sec-one'),
        document.querySelector('.right-sec-two'),
    ];

    // Hide all other popups
    otherPopups.forEach(p => p.style.display = 'none');

    // Toggle the target popup
    popup.style.display = 'block';
    color_add.style.display = 'block';



    // read the current transition type
    const t = $('#hdntransition').val();

    // clear any previously active transition buttons
    $('.tran_button').removeClass('active_tran');

    // if it’s slideLeft, add `.active` to the #TslideLeft button
    if (t === 'slideLeft') {
        $('#TslideLeft').addClass('active_tran');
    }
    // (repeat for other types if you want)
    else if (t === 'slideRight') {
        $('#TslideRight').addClass('active_tran');
    }
    else {
        $('.tran_button').removeClass('active_tran');
    }


}

function hideTran() {
    const popup = document.getElementById("tranPopup");
    const color_add = document.getElementById('tranColor');
    const boardAnimation = document.querySelector('.right-sec-one');
    if (popup) {
        popup.style.display = "none";
    }
    if (color_add) {
        color_add.style.display = "none";
    }
    if (boardAnimation) {
        boardAnimation.style.display = "block";
    }
}


// function for elements popup
function elementsTogglePopup() {
    const popup = document.getElementById('elementsPopup');
    const otherPopups = [
        document.getElementById('opengl_popup'),
        document.getElementById('fontstyle_popup'),
        document.getElementById('background_popup')
    ];

    // Hide all other popups
    otherPopups.forEach(p => p.style.display = 'none');

    // Toggle the target popup
    popup.style.display = (popup.style.display === 'block') ? 'none' : 'block';
}

function CreateBackgroundSectionhtml() {
    try {
        $.ajax({
            url: baseURL + "Canvas/CreateBackgroundSectionhtml",
            type: "POST",
            dataType: "html",
            success: function (result) {
                $("#background_popup").html(result);
                //  wireUpPopupHandlers();
            },
            error: function () {
            }
        })

    } catch (e) {
        console.log("catch", e);
    }
}
//function CreateLeftSectionhtml() {
//    try {
//        $.ajax({
//            url: baseURL + "Canvas/CreateLeftSectionhtml",
//            type: "POST",
//            dataType: "html",
//            success: function (result) {
//                $("#divpanelleft").html(result);

//            },
//            error: function () {
//            }
//        })

//    } catch (e) {
//        console.log("catch", e);
//    }
//}
function opengl() {
    // document.getElementById("modeButton").innerText = "Graphic Mode";
    $("#opengl_popup").toggle();

    if (document.getElementById("fontstyle_popup").style.display == "block") {
        $("#fontstyle_popup").hide();
        $(".right-sec-two").toggle();
        $(".right-sec-one").toggle();
    }
    if (document.getElementById("elementsPopup").style.display == "block") {
        $("#elementsPopup").hide();
    }
}
 

            function toggleMode() {
            let button = document.getElementById("modeButton");

            // Toggle visibility of elements
            if (document.getElementById("opengl_popup").style.display == "block") {
                $("#opengl_popup").hide();
            }
            $("#fontstyle_popup").toggle();
            $(".right-sec-two").toggle();
            $(".right-sec-one").toggle();

            // Toggle button text between "Animation Mode" and "Graphic Mode"
            if (button.innerText === "Animation Mode") {
                button.innerText = "Graphic Mode";
            } else {
                button.innerText = "Animation Mode";
            }
        }
        function opentl()
         {
            // document.getElementById("modeButton").innerText = "Animation Mode";
            if(document.getElementById("opengl_popup").style.display == "block"){
                $("#opengl_popup").hide();
            }
          $("#fontstyle_popup").toggle();
          $(".right-sec-two").toggle();
          $(".right-sec-one").toggle();
         }
          function opentlClose(){
             const animationBtn = document.querySelector('.toggle-btn[data-mode="animation"]')
             const graphicBtn = document.querySelector('.toggle-btn[data-mode="graphic"]')
             animationBtn.classList.add('active');
             graphicBtn.classList.remove('active');
             //document.getElementById("modeButton").innerText = "Graphic Mode";
            if(document.getElementById("opengl_popup").style.display == "block"){
                $("#opengl_popup").hide();
            }
            $("#fontstyle_popup").toggle();
            $(".right-sec-two").toggle();
            $(".right-sec-one").toggle();
          
         }
         

            // tab open
            function switchTab(tabElement, tabName) {

            let tabs = document.querySelectorAll(".tab");
            let contents = document.querySelectorAll(".left_content");

            // Remove active class from all tabs
            tabs.forEach((tab) => tab.classList.remove("active"));

            // Add active class to clicked tab
            tabElement.classList.add("active");

            // Hide all content sections
            contents.forEach((content) => content.classList.remove("active"));

            // Show the selected tab's content
            document.getElementById(tabName).classList.add("active");
        }
        // file upload js
        function updateFileName() {
            const fileInput = document.getElementById('fileUpload');
            const fileName = document.getElementById('fileName');

            if (fileInput.files.length > 0) {
                fileName.textContent = fileInput.files[0].name;
            } else {
                fileName.textContent = 'No File';
            }
        }

        
        // show the popup when the pattern icon is clicked
        $(document).on('click', '#toggle_img', function(e) {
          e.preventDefault();
            CreateBackgroundSectionHorizontalhtml();
          $('#background_popup').show();
          $('#fontstyle_popup').hide();
          $('#opengl_popup').hide();
          $('#elementsPopup').hide();
          $('#tranPopup').hide();
        });

// hide the popup when the close button is clicked
$(document).on('click', '#close_button', function (e) {
    e.preventDefault();
    $('#background_popup').hide();
});

// texture popuo show
document.querySelectorAll(".texture_palette").forEach(element => {
    element.addEventListener("click", function () {
        let box = document.getElementById("texture_box");
        box.style.display = (box.style.display === "none" || box.style.display === "") ? "block" : "none";
    });
});
        
function handleNavButtonClick(event) {
    document.querySelectorAll('.nav_button').forEach(btn => {
        btn.classList.remove('active_nav_button');
    });
    event.currentTarget.classList.add('active_nav_button');
}

              

function opengl() {
    // document.getElementById("modeButton").innerText = "Graphic Mode";
    $("#opengl_popup").toggle();

    if (document.getElementById("fontstyle_popup").style.display == "block") {
        $("#fontstyle_popup").hide();
        $(".right-sec-two").toggle();
        $(".right-sec-one").toggle();
    }
    if (document.getElementById("elementsPopup").style.display == "block") {
        $("#elementsPopup").hide();
    }
    if (document.getElementById("tranPopup").style.display == "block") {
        $("#tranPopup").hide();
    }
    if (document.getElementById("background_popup").style.display == "block") {
        $("#background_popup").hide();
    }
}
function elementsTogglePopup() {
    const popup = document.getElementById('elementsPopup');
    const otherPopups = [
        document.getElementById('opengl_popup'),
        document.getElementById('fontstyle_popup'),
        document.getElementById('background_popup'),
        document.getElementById('tranPopup')
    ];

    // Hide all other popups
    otherPopups.forEach(p => p.style.display = 'none');

    // Toggle the target popup
    popup.style.display = (popup.style.display === 'block') ? 'none' : 'block';
}

// Optional: click outside to close
document.addEventListener('click', function (event) {
    const popup = document.getElementById('elementsPopup');
    const button = document.querySelector('.elementsToggleBtn');

    if (!popup.contains(event.target) && !button.contains(event.target)) {
        popup.style.display = 'none';
    }
});
//zoom function

let scale = 1;
const scaleStep = 0.1;
const maxScale = 3;
const minScale = 0.5;

const scaleText = document.getElementById("scaleValue");

function applyScale() {
    /*   resizeCanvas();*/
    canvas.style.transform = `scale(${scale})`;
    scaleText.textContent = `Scale: ${scale.toFixed(1)}`;
    /* drawCanvas("Common");*/
}

function zoomIn() {
    if (scale < maxScale) {
        scale += scaleStep;
        applyScale();
    }
}

function zoomOut() {
    if (scale > minScale) {
        scale -= scaleStep;
        applyScale();
    }
}


//zoom function end

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


//copy function
function copyLink(button) {
    const linkText = button.closest('.fileLink').querySelector('.aniLink').innerText.trim();

    navigator.clipboard.writeText(linkText).then(() => {
        // Change icon to check
        const icon = button.querySelector('i');
        const originalClass = icon.className;

        icon.className = 'fa-solid fa-check'; // show check icon

        // Revert after 1 second
        setTimeout(() => {
            icon.className = originalClass;
        }, 1000);
    });
}
