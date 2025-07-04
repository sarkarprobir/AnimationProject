var activeSlide = 1;  // initially, assume slide 1 is active
let selectedInSpeed = null;
let selectedStaySpeed = null;
let selectedOutSpeed = null;
function textAnimationClick(clickedElement, type, from) {
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
    if (from == 'Out') {
        if (activeSlide === 1) {
            $("#hdnOutEffectSlide1").val(type);
        }
        else if (activeSlide === 2) {
            $("#hdnOutEffectSlide2").val(type);
        }
        else if (activeSlide === 3) {
            $("#hdnOutEffectSlide3").val(type);
        }
        $('.effectOut_btn').removeClass('active_effect');
        clickedElement.classList.add("active_effect");
    }
    else if (from == 'In') {
        $('.effectIn_btn').removeClass('active_effect');
        clickedElement.classList.add("active_effect");
    }
}
function setCoordinate(clickedElement, direction, imageStartX, imageStartY, imageEndX, imageEndY, from) {
    // Get the container using its ID.
    var ulDirection = document.getElementById("uldirection");
    if (from == 'In') {
        $("#hdnslideDedirection").val(direction);
        if (activeSlide === 1) {
            $("#hdnDirectiontSlide1").val(direction);
        }
        else if (activeSlide === 2) {
            $("#hdnDirectiontSlide2").val(direction);
        }
        else if (activeSlide === 3) {
            $("#hdnDirectiontSlide3").val(direction);
        }
    }
    if (from == 'Out') {
        if (activeSlide === 1) {
            $("#hdnOutDirectiontSlide1").val(direction);
        }
        else if (activeSlide === 2) {
            $("#hdnOutDirectiontSlide2").val(direction);
        }
        else if (activeSlide === 3) {
            $("#hdnOutDirectiontSlide3").val(direction);
        }
    }
    // Find the closest container wrapping the <a>
    var container = clickedElement.closest('div.btn-canvas-container');
    // From that container, select the first <a> element.
    var targetLink = container ? container.querySelector("canvas") : null;

    if (targetLink) {
        // Remove the active_effect class from all <a> elements in the ul.
        var links = document.getElementById("uldirection").getElementsByTagName("canvas");
        for (var i = 0; i < links.length; i++) {
            links[i].classList.remove("active_effect");
        }
        // Add the active_effect class to the target link.
        clickedElement.classList.add("active_effect");
    }


    
    if ($("#hdnEffectSlide1").val() == "") {
        $("#hdnTextAnimationType").val('delaylinear');
        animationMode = "delaylinear";
        $("#hdnEffectSlide1").val('delaylinear');
        $("#hdnOutEffectSlide1").val('delaylinear');

        $("#hdnDirectiontSlide1").val('left');
        $("#hdnOutDirectiontSlide1").val('left');

        $('#aleft').addClass('active_effect');
        $('#oleft').addClass('active_effect');
    }
    if ($("#hdnDirectiontSlide1").val() == "") {

        $("#hdnDirectiontSlide1").val('left');
        $("#hdnOutDirectiontSlide1").val('left');

        $('#aleft').addClass('active_effect');
        $('#oleft').addClass('active_effect');
    }

    document.getElementById("imageStartX").value = imageStartX;
    document.getElementById("imageStartY").value = imageStartY;
    document.getElementById("imageEndX").value = imageEndX;
    document.getElementById("imageEndY").value = imageEndY;
    // document.getElementById("imageAnimation").value = $("#imageAnimation option:selected").val();
    applyAnimations(direction, 'applyAnimations', parseInt($("#hdnlLoopControl").val()) || 1);
}
function clearSelectedBox() {
    const $sel = $('.text-box.selected');
    if (!$sel.length) return;    // nothing to clear

    $sel.removeClass('selected');
    if ($sel.data('ui-draggable')) $sel.draggable('destroy');
    if ($sel.data('ui-resizable')) $sel.resizable('destroy');
    $sel.find('.drag-handle, .rotate-handle, .delete-handle').remove();
    $sel.find('.ui-resizable-handle').remove();
}

function applyAnimations(direction, condition, loopCount) {
    clearSelectedBox();

    // 1) Identify In/Out and animationType
    const tabTypeRaw = $("#hdnTabType").val();
    const tabType = (tabTypeRaw === 'Out') ? 'Out' : 'In';
    const hiddenField = tabType === 'In'
        ? `#hdnEffectSlide${activeSlide}`
        : `#hdnOutEffectSlide${activeSlide}`;
    const animationType = $(hiddenField).val();

    // 2) Timings
    const inTime = parseFloat(selectedInSpeed) || 4;
    const stayTime = parseFloat(selectedStaySpeed) || 3;
    const outTime = parseFloat(selectedOutSpeed) || 4;

    // 3) Canvas dimensions & offset
    const $canvas = $('#myCanvas');
    const cw = $canvas.width();
    const ch = $canvas.height();
    const canvasOffset = $canvas.offset();

    if (animationType !== "delaylinear") {
        console.log("Only ‘delaylinear’ is handled here");
        return;
    }

    // 4) Build a master timeline
    const mainTL = gsap.timeline();

    // 5) For each box, compute its own animation
    $('.text-box').each(function (i, el) {
        const $el = $(el);
        const offset = $el.offset();
        const elW = $el.outerWidth();
        const elH = $el.outerHeight();

        // natural positions
        const naturalX = offset.left - canvasOffset.left;
        const naturalY = offset.top - canvasOffset.top;

        // compute fromX/fromY so that the element is just outside the canvas
        let fromX = naturalX, fromY = naturalY;
        let outX = naturalX, outY = naturalY;

        if (tabType === 'In') {
            switch (direction) {
                case 'left':
                    fromX = -elW;
                    break;
                case 'right':
                    fromX = cw;
                    break;
                case 'top':
                    fromY = -elH;
                    break;
                case 'bottom':
                    fromY = ch;
                    break;
            }
            // IN: from outside → natural
            mainTL.from(el, {
                x: fromX - naturalX,
                y: fromY - naturalY,
                opacity: 0,
                duration: inTime,
                ease: 'power2.out',
                stagger: 0.2
            }, 0); // all start at time 0

            // STAY: just hold at natural
            mainTL.to(el, {
                duration: stayTime
            }, inTime); // begin after inTime

        } else { // tabType === 'Out'
            switch (direction) {
                case 'left':
                    outX = cw;
                    break;
                case 'right':
                    outX = -elW;
                    break;
                case 'top':
                    outY = ch;
                    break;
                case 'bottom':
                    outY = -elH;
                    break;
            }
            // STAY: hold natural
            mainTL.to(el, {
                duration: stayTime
            }, 0); // start immediately

            // OUT: natural → outside
            mainTL.to(el, {
                x: outX - naturalX,
                y: outY - naturalY,
                opacity: 0,
                duration: outTime,
                ease: 'power2.in',
                stagger: 0.2
            }, stayTime); // begin after stayTime

            // RESET: snap back
            mainTL.set(el, {
                x: 0, y: 0, opacity: 1
            }, stayTime + outTime);
        }
    });

    return mainTL;
}

