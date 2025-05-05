var activeSlide = 1;
let animationMode = "linear";
function CreateHeaderSectionHorizontalhtml() {
    try {
        $.ajax({
            url: baseURL + "Canvas/CreateHeaderSectionHorizontalhtml",
            type: "POST",
            dataType: "html",
            success: function (result) {
                $("#divHeaderSectionH").html(result);

                const lin = document.getElementById('alinear');
                if (lin) {
                    lin.classList.add('active_effect');
                } 


                wireSpeedDropdown();
                wireOutSpeedDropdown();
                wireLoopDropdown();
               
            },
            error: function () {
            }
        })

    } catch (e) {
        console.log("catch", e);
    }
}
function CreateBackgroundSectionHorizontalhtml() {
    try {
        $.ajax({
            url: baseURL + "Canvas/CreateBackgroundHorizontalSectionhtml",
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
function CreateLeftSectionHorizontalhtml() {
    try {
        $.ajax({
            url: baseURL + "Canvas/CreateLeftSectionHorizontalhtml",
            type: "POST",
            dataType: "html",
            success: function (result) {
                $("#divpanelleftH").html(result);

            },
            error: function () {
            }
        })

    } catch (e) {
        console.log("catch", e);
    }
}

function CreateRightSectionHorizontalhtml() {
    try {
        $.ajax({
            url: baseURL + "Canvas/CreateRightSectionHorizontalhtml",
            type: "POST",
            dataType: "html",
            success: function (result) {
                $("#divpanelrightH").html(result);
                // Now safe to access elements from the partial
                document.getElementById('lblSpeed').textContent = "4 Sec";
                document.getElementById('lblSeconds').textContent = "6 Sec";
                document.getElementById('lblOutSpeed').textContent = "4 Sec";
                document.getElementById('lblLoop').textContent = "1 time";

            },
            error: function () {
            }
        })

    } catch (e) {
        console.log("catch", e);
    }
}
function wireSpeedDropdown() {
    const ddl = document.getElementById('ddlSpeedControl');
    if (!ddl) {
        // console.warn("#ddlSpeedControl not found!");
        return;
    }
    ddl.addEventListener('click', function (event) {
        if (event.target.matches('a.dropdown-item')) {
            const selectedInSpeed = event.target.getAttribute('value');
            document.getElementById('lblSpeed').textContent = event.target.textContent;

        }
    });
}
function wireSecondsDropdown() {
    const ddl = document.getElementById('ddlSecondsControl');
    if (!ddl) {
        console.warn("#ddlSecondsControl not found!");
        return;
    }
    ddl.addEventListener('click', function (event) {
        if (event.target.matches('a.dropdown-item')) {
            const val = event.target.getAttribute('value');
            document.getElementById('lblSeconds').textContent = event.target.textContent;
            // store val if you need it: selectedStaySpeed = val;
        }
    });
}
function wireOutSpeedDropdown() {
    const ddlOut = document.getElementById('ddlOutSpeedControl');
    if (!ddlOut) {
        // console.warn("#ddlOutSpeedControl not found!");
        return;
    }

    ddlOut.addEventListener('click', function (event) {
        if (!event.target.matches('a.dropdown-item')) return;

        // store the value
        selectedOutSpeed = event.target.getAttribute('value');

        // update the label
        const lbl = document.getElementById('lblOutSpeed');
        if (lbl) {
            lbl.textContent = event.target.textContent;
        }
    });
}
function wireLoopDropdown() {
    const ddlLoop = document.getElementById('ddlLoopControl');
    if (!ddlLoop) {
        //   console.warn("#ddlLoopControl not found!");
        return;
    }

    ddlLoop.addEventListener('click', function (event) {
        if (!event.target.matches('a.dropdown-item')) return;

        // grab the value and update your globals/hidden field
        const val = event.target.getAttribute('value');
        selectedInSpeed = val;
        $("#hdnlLoopControl").val(val);

        // update the visible label
        const lbl = document.getElementById('lblLoop');
        if (lbl) lbl.textContent = event.target.textContent;
    });
}
function TabShowHide(type) {
    if (type === 'In') {
        $("#marzen").css("display", "block");
        $("#rauchbier").css("display", "none");
        $("#dunkles").css("display", "none");
    }
    else if (type === 'Stay') {
        $("#marzen").css("display", "none");
        $("#rauchbier").css("display", "block");
        $("#dunkles").css("display", "none");
    }
    else if (type === 'Out') {
        $("#marzen").css("display", "none");
        $("#rauchbier").css("display", "none");
        $("#dunkles").css("display", "block");
    }
}
function textAnimationClick(clickedElement, type) {
    $("#hdnTextAnimationType").val(type);
    animationMode = type;
    if (activeSlide === 1) {
        $("#hdnEffectSlide1").val(type);
    }
    else if (activeSlide === 2) {
        $("#hdnEffectSlide2").val(type);
    }
    else if (activeSlide === 3) {
        $("#hdnEffectSlide3").val(type);
    }
    // Get the container using its ID.
    var ulEffects = document.getElementById("ulEffects");

    // Select all <a> elements within the container.
    var links = ulEffects.getElementsByTagName("a");

    // Remove the active_effect class from all links.
    for (var i = 0; i < links.length; i++) {
        links[i].classList.remove("active_effect");
    }

    // Add the active_effect class to the clicked element.
    clickedElement.classList.add("active_effect");

    // Get the container using its ID.
    var ulDirection = document.getElementById("uldirection");

    // Select all <a> elements within the container.
    var links = ulDirection.getElementsByTagName("a");

    // Remove the active_effect class from all links.
    for (var i = 0; i < links.length; i++) {
        links[i].classList.remove("active_effect");
    }
}
function hideBack() {
    const popup = document.getElementById("background_popup");
    if (popup) {
        popup.style.display = "none";
    }
}