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
        $(".right-sec-two").toggle();
        $(".right-sec-one").toggle();
    }
}
function switchTab(tabElement, tabName) {
    console.log("Arghadeep");  // Debugging log

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

function opengl() {
    $("#opengl_popup").toggle();
    if (document.getElementById("fontstyle_popup").style.display == "block") {
        $("#fontstyle_popup").hide();
        $(".right-sec-two").toggle();
        $(".right-sec-one").toggle();
    }
}

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