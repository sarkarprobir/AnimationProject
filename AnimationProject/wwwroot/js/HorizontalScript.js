$(document).ready(function () {
    CreateHeaderSectionHorizontalhtml();
    CreateBackgroundSectionHorizontalhtml();
    CreateLeftSectionHorizontalhtml();
    CreateRightSectionHorizontalhtml()
});
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
const buttons = document.querySelectorAll('.toggle-btn');

buttons.forEach(button => {
    button.addEventListener('click', () => {
        buttons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
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


// {{{{{{{<<<<<<<<<<<<<<<<<<<<--------------WORKING FUNCTIONS-------------->>>>>>>>>>>>>>>>>>}}}}}}}
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
// {{{{{{{<<<<<<<<<<<<<<<<<<<<--------------WORKING FUNCTIONS-------------->>>>>>>>>>>>>>>>>>}}}}}}}

//experimental js load



//let currentZIndex = 0;
//function getNextZIndex() {
//    return ++currentZIndex;
//}

//function addDefaultText() {
//    images.forEach(img => img.selected = false);
//    const fs = 30;
//    const factor = 1.2;        // 120% of fontSize
//    const buttons = document.querySelectorAll('.toggle-btn');
//    const graphicBtn = document.querySelector('.toggle-btn[data-mode="graphic"]');
//    const text = "Default Text";
//    // 2) Clear `active` from all
//    buttons.forEach(b => b.classList.remove('active'));

//    // 3) Activate only the Graphic button
//    graphicBtn.classList.add('active');
//    // 1) Create with defaults
//    const newObj = {
//        text,
//        x: 92,
//        y: 100,
//        selected: false,
//        editing: false,
//        fontFamily: "Arial",
//        textColor: "#000000",
//        textAlign: "left",
//        fontSize: fs,

//        // store only the factor
//        lineSpacing: factor,

//        // bounding box placeholders—will be set below
//        boundingWidth: 0,
//        boundingHeight: 0,
//        noAnim: false,
//        groupId: null,
//        rotation: 0,
//        isBold: false,
//        isItalic: false,
//        type: 'text',
//        zIndex: getNextZIndex(),
//        opacity: 100
//    };

//    // 2) Measure it
//    ctx.font = `${newObj.fontSize}px ${newObj.fontFamily}`;
//    const metrics = ctx.measureText(text);
//    const width = metrics.width;
//    const ascent = metrics.actualBoundingBoxAscent || fs * 0.8;
//    const descent = metrics.actualBoundingBoxDescent || fs * 0.2;
//    const height = ascent + descent;

//    // 3) Tiny padding around
//    const offsetX = 20;
//    const offsetY = 25;

//    // 4) Assign your bounding dimensions
//    newObj.boundingWidth = width + offsetX;
//    newObj.boundingHeight = height + offsetY;

//    // 5) Make it the only selected object
//    textObjects.forEach(o => o.selected = false);
//    newObj.selected = true;
//    textObjects.push(newObj);

//    // 6) Redraw
//    drawCanvas('Common');
//    $("#opengl_popup").hide();
//    $("#elementsPopup").hide();
//}
        

            function toggleMode() {
           // let button = document.getElementById("modeButton");

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
          CreateBackgroundSectionhtml();
          $('#background_popup').show();
          $('#fontstyle_popup').hide();
          $('#opengl_popup').hide();
          $('#elementsPopup').hide();
          $('#tranPopup').hide();
        });

        //// hide the popup when the close button is clicked
        //$(document).on('click', '#close_button', function(e) {
        //  e.preventDefault();
        //  $('#background_popup').hide();
        //});

        //// texture popuo show
        //document.querySelectorAll(".texture_palette").forEach(element => {
        //    element.addEventListener("click", function() {
        //        let box = document.getElementById("texture_box");
        //        box.style.display = (box.style.display === "none" || box.style.display === "") ? "block" : "none";
        //    });
        //});

        // nav item active function
        //function handleNavButtonClick(clickedElement) {
        //    document.querySelectorAll('.nav_button').forEach(btn => {
        //        btn.classList.remove('active_nav_button');
        //    });
        //    clickedElement.classList.add('active_nav_button');
        //}
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