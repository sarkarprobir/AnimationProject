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

    if (animationType == "delaylinear") {

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
    else if (animationType === "delaylinear2") {
        const waveTL = gsap.timeline();

        // Precompute some constants
        const waveDistance = 50;
        const waveSkew = 30;

        // Loop over each box just like in delaylinear
        $('.text-box').each(function (i, el) {
            const $el = $(el);
            const offset = $el.offset();
            const elW = $el.outerWidth();
            const elH = $el.outerHeight();

            // natural on‑screen position relative to canvas
            const naturalX = offset.left - canvasOffset.left;
            const naturalY = offset.top - canvasOffset.top;

            // compute start and exit offsets for this direction
            let fromX = 0, fromY = 0, outX = 0, outY = 0;

            switch (direction) {
                case 'left':
                    fromX = -elW;
                    outX = cw;
                    break;
                case 'right':
                    fromX = cw;
                    outX = -elW;
                    break;
                case 'top':
                    fromY = -elH;
                    outY = ch;
                    break;
                case 'bottom':
                    fromY = ch;
                    outY = -elH;
                    break;
                default:
                    fromX = -elW;
                    outX = cw;
            }

            if (tabType === 'In') {
                // 1) WAVE‑IN
                waveTL.from(el, {
                    x: fromX - naturalX,
                    y: fromY - naturalY,
                    skewX: (direction === 'left' ? waveSkew :
                        direction === 'right' ? -waveSkew : 0),
                    skewY: (direction === 'top' ? -waveSkew :
                        direction === 'bottom' ? waveSkew : 0),
                    opacity: 0,
                    duration: inTime,
                    ease: 'elastic.out(1, 0.5)',
                    stagger: 0.2
                }, 0);

                // 2) STAY
                waveTL.to(el, { duration: stayTime }, inTime);

            } else {
                // 1) STAY
                waveTL.to(el, { duration: stayTime }, 0);

                // 2) WAVE‑OUT
                waveTL.to(el, {
                    x: outX - naturalX,
                    y: outY - naturalY,
                    skewX: (direction === 'left' ? -waveSkew :
                        direction === 'right' ? waveSkew : 0),
                    skewY: (direction === 'top' ? waveSkew :
                        direction === 'bottom' ? -waveSkew : 0),
                    opacity: 0,
                    duration: outTime,
                    ease: 'power2.in',
                    stagger: 0.2
                }, stayTime);

                // 3) RESET
                waveTL.set(el, { x: 0, y: 0, skewX: 0, skewY: 0, opacity: 1 },
                    stayTime + outTime);
            }
        });

        return waveTL;
    }
    else if (animationType === "mask") {
        const maskTL = gsap.timeline();

        $('.text-box').each(function (i, el) {
            // Determine what “hidden” clip looks like for In vs Out
            let inClip, exitClip;
           

            if (tabType === 'In') {
                switch (direction) {
                    case 'left':
                        inClip = 'inset(0% 100% 0% 0%)'; // hidden at right
                        exitClip = 'inset(0% 100% 0% 0%)';
                        break;
                    case 'right':
                        inClip = 'inset(0% 0% 0% 100%)'; // hidden at left
                        exitClip = 'inset(0% 0% 0% 100%)'; // hide again at left
                        break;
                    case 'top':
                        inClip = 'inset(0% 0% 100% 0%)'; // hidden at bottom
                        exitClip = 'inset(0% 0% 100% 0%)';
                        break;
                    case 'bottom':
                        inClip = 'inset(100% 0% 0% 0%)'; // hidden at top
                        exitClip = 'inset(100% 0% 0% 0%)';

                        break;
                    default:
                        inClip = 'inset(0% 100% 0% 0%)';
                        exitClip = 'inset(0% 100% 0% 0%)';
                }
                // 1) IN: from clipped → fully visible
                maskTL.from(el, {
                    clipPath: inClip,
                    duration: inTime,
                    ease: 'power2.out',
                    stagger: 0.2
                }, 0);

                // 2) STAY: hold visible
                maskTL.to(el, {
                    duration: stayTime
                }, inTime);
            }
            else {
                switch (direction) {
                    case 'left':
                        inClip = 'inset(0% 0% 0% 100%)'; // hidden at left
                        exitClip = 'inset(0% 0% 0% 100%)'; // hide again at left
                        break;
                    case 'right':
                        inClip = 'inset(0% 100% 0% 0%)'; // hidden at right
                        exitClip = 'inset(0% 100% 0% 0%)';
                        break;
                    case 'top':
                        inClip = 'inset(100% 0% 0% 0%)'; // hidden at top
                        exitClip = 'inset(100% 0% 0% 0%)';
                        break;
                    case 'bottom':
                        inClip = 'inset(0% 0% 100% 0%)'; // hidden at bottom
                        exitClip = 'inset(0% 0% 100% 0%)';
                        break;
                    default:
                        inClip = 'inset(0% 100% 0% 0%)';
                        exitClip = 'inset(0% 100% 0% 0%)';
                }
                // 1) STAY: hold visible
                maskTL.to(el, {
                    duration: stayTime
                }, 0);

                // 2) OUT: animate to clipped (hides it)
                maskTL.to(el, {
                    clipPath: exitClip,
                    duration: outTime,
                    ease: 'power2.in',
                    stagger: 0.2
                }, stayTime);

                // 3) RESET: restore fully visible and original transform
                maskTL.set(el, {
                    clipPath: 'inset(0% 0% 0% 0%)',
                    x: 0,
                    y: 0,
                    skewX: 0,
                    skewY: 0
                }, stayTime + outTime);
            }
        });

        return maskTL;
    }




}

