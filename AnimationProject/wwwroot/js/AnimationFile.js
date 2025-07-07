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
function SetAnimationType(AnimationTypeType, from) {
    if (from == 'In') {
        if (activeSlide === 1) {
            $("#hdnInEffectSlide1").val(AnimationTypeType);
            if ($("#hdnInDirectiontSlide1").val() == '') {
                $("#hdnInDirectiontSlide1").val('left');
            }
        }
        else if (activeSlide === 2) {
            $("#hdnInEffectSlide2").val(AnimationTypeType);
            if ($("#hdnInDirectiontSlide2").val() == '') {
                $("#hdnInDirectiontSlide2").val('left');
            }
        }
        else if (activeSlide === 3) {
            $("#hdnInEffectSlide3").val(AnimationTypeType);
            if ($("#hdnInDirectiontSlide3").val() == '') {
                $("#hdnInDirectiontSlide3").val('left');
            }
        }
    }
    else if(from == 'Out') {
        if (activeSlide === 1) {
            $("#hdnEffectSlide1Out").val(AnimationTypeType);
            if ($("#hdnDirectiontSlide1Out").val() == '') {
                $("#hdnDirectiontSlide1Out").val('left');
            }
        }
        else if (activeSlide === 2) {
            $("#hdnEffectSlide2Out").val(AnimationTypeType);
            if ($("#hdnDirectiontSlide2Out").val() == '') {
                $("#hdnDirectiontSlide2Out").val('left');
            }
        }
        else if (activeSlide === 3) {
            $("#hdnEffectSlide3Out").val(AnimationTypeType);
            if ($("#hdnDirectiontSlide3Out").val() == '') {
                $("#hdnDirectiontSlide3Out").val('left');
            }
        }
    }
}
function SetDirectionType(DirectionType, from) {
    if (from == 'In') {
        if (activeSlide === 1) {
            $("#hdnInDirectiontSlide1").val(DirectionType);
            if ($("#hdnInEffectSlide1").val() == '') {
                $("#hdnInEffectSlide1").val('delaylinear');
            }
           
        }
        else if (activeSlide === 2) {
            $("#hdnInDirectiontSlide2").val(DirectionType);
            if ($("#hdnInEffectSlide2").val() == '') {
                $("#hdnInEffectSlide2").val('delaylinear');
            }
        }
        else if (activeSlide === 3) {
            $("#hdnInDirectiontSlide3").val(DirectionType);
            if ($("#hdnInEffectSlide3").val() == '') {
                $("#hdnInEffectSlide3").val('delaylinear');
            }
        }
    }
    else if (from == 'Out') {
        if (activeSlide === 1) {
            $("#hdnDirectiontSlide1Out").val(DirectionType);
            if ($("#hdnEffectSlide1Out").val() == '') {
                $("#hdnEffectSlide1Out").val('delaylinear');
            }
        }
        else if (activeSlide === 2) {
            $("#hdnDirectiontSlide2Out").val(DirectionType);
            if ($("#hdnEffectSlide2Out").val() == '') {
                $("#hdnEffectSlide2Out").val('delaylinear');
            }
        }
        else if (activeSlide === 3) {
            $("#hdnDirectiontSlide3Out").val(DirectionType);
            if ($("#hdnEffectSlide3Out").val() == '') {
                $("#hdnEffectSlide3Out").val('delaylinear');
            }
        }
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
    else if (animationType === "shake") {
        // ────────────────────────────
        // Shake (direction‑aware)
        const shakeTL = gsap.timeline();

        $('.text-box').each(function (i, el) {
            const $el = $(el);
            let fromVars = {}, toVars = {};

            // Determine shake axis based on direction
            switch (direction) {
                case 'left':
                case 'right':
                    // horizontal shake
                    fromVars.x = direction === 'left' ? -10 : 10;
                    toVars.x = direction === 'left' ? 10 : -10;
                    break;
                case 'top':
                case 'bottom':
                    // vertical shake
                    fromVars.y = direction === 'top' ? -10 : 10;
                    toVars.y = direction === 'top' ? 10 : -10;
                    break;
                default:
                    // default horizontal shake from left
                    fromVars.x = -10;
                    toVars.x = 10;
            }

            if (tabType === 'In') {
                // 1) IN: shake on entrance
                shakeTL.fromTo(el,
                    fromVars,
                    {
                        ...toVars,
                        duration: inTime / 8,
                        yoyo: true,
                        repeat: 8,
                        ease: 'power1.inOut'
                    },
                    0
                );

                // 2) STAY: reset to natural
                shakeTL.to(el,
                    { x: 0, y: 0, duration: stayTime },
                    inTime
                );
            } else {
                // 1) STAY
                shakeTL.to(el,
                    { duration: stayTime },
                    0
                );

                // 2) OUT: shake before exiting
                shakeTL.fromTo(el,
                    toVars,
                    {
                        ...fromVars,
                        duration: outTime / 8,
                        yoyo: true,
                        repeat: 8,
                        ease: 'power1.inOut'
                    },
                    stayTime
                );

                // 3) RESET: clear transforms for replay
                shakeTL.set(el,
                    { x: 0, y: 0 },
                    stayTime + outTime
                );
            }
        });

        return shakeTL;
    }
    else if (animationType === "blur") {
        // ────────────────────────────
        // Direction‑aware Blur‑to‑Clear
        const blurTL = gsap.timeline();

        $('.text-box').each(function (i, el) {
            // Compute directional offsets
            let fromX = 0, fromY = 0, outX = 0, outY = 0;
            const distance = 20;

            switch (direction) {
                case 'left':
                    fromX = -distance; outX = distance;
                    break;
                case 'right':
                    fromX = distance; outX = -distance;
                    break;
                case 'top':
                    fromY = -distance; outY = distance;
                    break;
                case 'bottom':
                    fromY = distance; outY = -distance;
                    break;
                default:
                // no movement
            }

            if (tabType === 'In') {
                // 1) IN: start blurred/off‑position → clear/center
                blurTL.fromTo(el, {
                    opacity: 0,
                    filter: 'blur(10px)',
                    x: fromX,
                    y: fromY
                }, {
                    opacity: 1,
                    filter: 'blur(0px)',
                    x: 0,
                    y: 0,
                    duration: inTime,
                    ease: 'power2.out',
                    stagger: 0.2
                }, 0
                );
                // 2) STAY: hold final state
                blurTL.to(el, { duration: stayTime }, inTime);
            } else {
                // 1) STAY: hold clear/center
                blurTL.to(el, { duration: stayTime }, 0);
                // 2) OUT: blur again and drift off‑direction
                blurTL.to(el, {
                    opacity: 0,
                    filter: 'blur(10px)',
                    x: outX,
                    y: outY,
                    duration: outTime,
                    ease: 'power2.in',
                    stagger: 0.2
                }, stayTime
                );
                // 3) RESET: clear blur and reset transforms
                blurTL.set(el, {
                    opacity: 1,
                    filter: 'blur(0px)',
                    x: 0,
                    y: 0
                }, stayTime + outTime);
            }
        });

        return blurTL;
    }
    else if (animationType === "roll") {
        // ────────────────────────────
        // Roll In/Out (direction‑aware)
        const rollTL = gsap.timeline();

        $('.text-box').each(function (i, el) {
            // Precompute directional start/end values
            let fromX = 0, fromY = 0, fromRot = 0;
            let outX = 0, outY = 0, outRot = 0;
            const distance = 100;
            const angle = 90;

            switch (direction) {
                case 'left':
                    fromX = -distance; fromRot = -angle;
                    outX = distance; outRot = angle;
                    break;
                case 'right':
                    fromX = distance; fromRot = angle;
                    outX = -distance; outRot = -angle;
                    break;
                case 'top':
                    fromY = -distance; fromRot = angle;   // rotate down
                    outY = distance; outRot = -angle;   // rotate up
                    break;
                case 'bottom':
                    fromY = distance; fromRot = -angle;   // rotate up
                    outY = -distance; outRot = angle;   // rotate down
                    break;
                default:
                    // default left→center
                    fromX = -distance; fromRot = -angle;
                    outX = distance; outRot = angle;
            }

            if (tabType === 'In') {
                // 1) IN: roll from outside → center
                rollTL.from(el, {
                    opacity: 0,
                    x: fromX,
                    y: fromY,
                    rotation: fromRot,
                    transformOrigin: '0% 50%',
                    duration: inTime,
                    ease: 'power2.out',
                    stagger: 0.2
                }, 0);

                // 2) STAY: hold at center
                rollTL.to(el, { duration: stayTime }, inTime);
            } else {
                // 1) STAY: hold at center
                rollTL.to(el, { duration: stayTime }, 0);

                // 2) OUT: roll out to opposite side
                rollTL.to(el, {
                    opacity: 0,
                    x: outX,
                    y: outY,
                    rotation: outRot,
                    transformOrigin: '0% 50%',
                    duration: outTime,
                    ease: 'power2.in',
                    stagger: 0.2
                }, stayTime);

                // 3) RESET: clear transforms
                rollTL.set(el, {
                    x: 0, y: 0, rotation: 0, opacity: 1
                }, stayTime + outTime);
            }
        });

        return rollTL;
    }
    else if (animationType === "curtain") {
        // ────────────────────────────
        // Curtain Reveal (direction‑aware)
        const curtainTL = gsap.timeline();

        $('.text-box').each(function (i, el) {
            // Determine scale axis & origin based on direction
            let origin, fromVars = { opacity: 0 }, outVars = {};
            
            // common
            fromVars.opacity = 0;
            outVars.opacity = 0;
            fromVars.transformOrigin = origin;
            outVars.transformOrigin = origin;

            if (tabType === 'In') {
                switch (direction) {
                    case 'top':
                        origin = '50% 0%';
                        fromVars.scaleY = 0;
                        outVars.scaleY = 0;
                        break;
                    case 'bottom':
                        origin = '50% 100%';
                        fromVars.scaleY = 0;
                        outVars.scaleY = 0;
                        break;
                    case 'left':
                        origin = '0% 50%';
                        fromVars.scaleX = 0;
                        outVars.scaleX = 0;
                        break;
                    case 'right':
                        origin = '100% 50%';
                        fromVars.scaleX = 0;
                        outVars.scaleX = 0;
                        break;
                    default:
                        // default top‑to‑bottom
                        origin = '50% 0%';
                        fromVars.scaleY = 0;
                        outVars.scaleY = 0;
                }
                // 1) IN: grow from 0 to 1
                curtainTL.from(el, {
                    ...fromVars,
                    duration: inTime,
                    ease: 'power2.out',
                    stagger: 0.2
                }, 0);
                // 2) STAY
                curtainTL.to(el, { duration: stayTime }, inTime);
            } else {
                switch (direction) {
                    case 'top':
                        origin = '50% 100%';
                        fromVars.scaleY = 0;
                        outVars.scaleY = 0;
                        break;
                    case 'bottom':
                        origin = '50% 0%';
                        fromVars.scaleY = 0;
                        outVars.scaleY = 0;
                        break;
                    case 'left':
                        origin = '100% 50%';
                        fromVars.scaleX = 0;
                        outVars.scaleX = 0;
                        break;
                    case 'right':
                        origin = '0% 50%';
                        fromVars.scaleX = 0;
                        outVars.scaleX = 0;
                        break;
                    default:
                        // default top‑to‑bottom
                        origin = '50% 0%';
                        fromVars.scaleY = 0;
                        outVars.scaleY = 0;
                }
                // 1) STAY
                curtainTL.to(el, { duration: stayTime }, 0);
                // 2) OUT: shrink back
                curtainTL.to(el, {
                    ...outVars,
                    duration: outTime,
                    ease: 'power2.in',
                    stagger: 0.2
                }, stayTime);
                // 3) RESET
                curtainTL.set(el, {
                    scaleX: 1,
                    scaleY: 1,
                    opacity: 1,
                    transformOrigin: origin
                }, stayTime + outTime);
            }
        });

        return curtainTL;
    }
    else if (animationType === "blurFlash") {
        // ────────────────────────────
        // Blur‑Flash (direction‑aware)
        const flashTL = gsap.timeline();

        $('.text-box').each(function (i, el) {
            // Compute directional offsets
            let fromX = 0, fromY = 0;
            const distance = 20;

            switch (direction) {
                case 'left':
                    fromX = -distance;
                    break;
                case 'right':
                    fromX = distance;
                    break;
                case 'top':
                    fromY = -distance;
                    break;
                case 'bottom':
                    fromY = distance;
                    break;
                default:
                // no shift
            }

            if (tabType === 'In') {
                // 1) IN: flash‑blur + small shift → center
                flashTL.fromTo(el, {
                    opacity: 0,
                    filter: 'blur(20px)',
                    x: fromX,
                    y: fromY
                }, {
                    opacity: 1,
                    filter: 'blur(0px)',
                    x: 0,
                    y: 0,
                    duration: inTime / 5,
                    ease: 'power2.out',
                    yoyo: true,
                    repeat: 1,
                    stagger: 0.2
                }, 0);

                // ✅ 2) RESET to ensure visible and clear (this is what was missing)
                flashTL.set(el, {
                    opacity: 1,
                    filter: 'blur(0px)',
                    x: 0,
                    y: 0
                }, inTime / 5 * 2);

                // 3) STAY: hold final state
                flashTL.to(el, { duration: stayTime }, inTime / 5 * 2);
            }

            else {
                // 1) STAY: hold
                flashTL.to(el, { duration: stayTime }, 0);
                // 2) OUT: reverse flash + shift away
                flashTL.fromTo(el, {
                    opacity: 1,
                    filter: 'blur(0px)',
                    x: 0,
                    y: 0
                }, {
                    opacity: 0,
                    filter: 'blur(20px)',
                    x: fromX,
                    y: fromY,
                    duration: outTime / 5,
                    ease: 'power2.in',
                    yoyo: true,
                    repeat: 1,
                    stagger: 0.2
                }, stayTime
                );
                // 3) RESET: clear
                flashTL.set(el, {
                    opacity: 1,
                    filter: 'blur(0px)',
                    x: 0,
                    y: 0
                }, stayTime + outTime / 5 * 2);
            }
        });

        return flashTL;
    }
    else if (animationType === "popcorn") {
        // ────────────────────────────
        // Popcorn Pop (direction‑aware)
        const popTL = gsap.timeline();
        const distance = 50; // how far off‑screen to start/end

        $('.text-box').each(function (i, el) {
            let fromX = 0, fromY = 0, outX = 0, outY = 0;

            // compute directional offsets
            switch (direction) {
                case 'left':
                    fromX = -distance; outX = distance;
                    break;
                case 'right':
                    fromX = distance; outX = -distance;
                    break;
                case 'top':
                    fromY = -distance; outY = distance;
                    break;
                case 'bottom':
                    fromY = distance; outY = -distance;
                    break;
                default:
                // no offset
            }

            if (tabType === 'In') {
                // 1) POP IN from off‑position with overshoot
                popTL.fromTo(el,
                    { opacity: 0, scale: 0.3, x: fromX, y: fromY },
                    {
                        opacity: 1,
                        scale: 1.2,
                        x: 0,
                        y: 0,
                        duration: inTime * 0.25,
                        ease: 'power1.out',
                        onComplete: () => {
                            gsap.to(el, { scale: 1, duration: inTime * 0.125, ease: 'power1.in' });
                        },
                        stagger: 0.1
                    },
                    0
                );

                // 2) STAY: hold for remaining time
                popTL.to(el, { duration: Math.max(0, stayTime - inTime * 0.375) }, inTime * 0.375);
            } else {
                // 1) STAY: hold at normal
                popTL.to(el, { duration: stayTime }, 0);

                // 2) POP OUT with reverse motion
                popTL.fromTo(el,
                    { opacity: 1, scale: 1, x: 0, y: 0 },
                    {
                        opacity: 0,
                        scale: 0.3,
                        x: outX,
                        y: outY,
                        duration: outTime * 0.25,
                        ease: 'power1.in',
                        onComplete: () => {
                            gsap.set(el, { scale: 1 });
                        },
                        stagger: 0.1
                    },
                    stayTime
                );

                // 3) RESET position for replay
                popTL.set(el, { x: 0, y: 0, opacity: 1 }, stayTime + outTime * 0.25);
            }
        });

        return popTL;
    }
    else if (animationType === "glitch") {
        // ────────────────────────────
        // Glitch Jitter (direction‑aware)
        const glitchTL = gsap.timeline();
        const distance = 50;

        $('.text-box').each(function (i, el) {
            let fromX = 0, fromY = 0, outX = 0, outY = 0;

            // compute directional offsets
            switch (direction) {
                case 'left':
                    fromX = -distance; outX = distance;
                    break;
                case 'right':
                    fromX = distance; outX = -distance;
                    break;
                case 'top':
                    fromY = -distance; outY = distance;
                    break;
                case 'bottom':
                    fromY = distance; outY = -distance;
                    break;
                default:
                // no offset
            }

            if (tabType === 'In') {
                // 1) Move in from offset
                glitchTL.fromTo(el,
                    { opacity: 0, x: fromX, y: fromY },
                    { opacity: 1, x: 0, y: 0, duration: inTime * 0.3, ease: 'power2.out', stagger: 0.1 },
                    0
                );

                // 2) Glitch Effect
                glitchTL.to(el, {
                    x: () => gsap.utils.random(-5, 5),
                    y: () => gsap.utils.random(-3, 3),
                    repeat: 10,
                    yoyo: true,
                    duration: 0.05,
                    ease: 'rough({strength: 8, points: 20, clamp: true})',
                    stagger: 0.1
                }, inTime * 0.3);

                // 3) STAY
                glitchTL.to(el, { duration: stayTime }, inTime * 0.3 + 0.05 * 20);
            } else {
                // 1) STAY
                glitchTL.to(el, { duration: stayTime }, 0);

                // 2) Glitch before exit
                glitchTL.to(el, {
                    x: () => gsap.utils.random(-5, 5),
                    y: () => gsap.utils.random(-3, 3),
                    repeat: 10,
                    yoyo: true,
                    duration: 0.05,
                    ease: 'rough({strength: 8, points: 20, clamp: true})',
                    stagger: 0.1
                }, stayTime);

                // 3) OUT: slide out
                glitchTL.to(el,
                    { opacity: 0, x: outX, y: outY, duration: outTime * 0.3, ease: 'power2.in', stagger: 0.1 },
                    stayTime + 0.05 * 20
                );

                // 4) RESET
                glitchTL.set(el, { x: 0, y: 0, opacity: 1 }, stayTime + 0.05 * 20 + outTime * 0.3);
            }
        });

        return glitchTL;
    }




}

function applyAnimationsForPublish11(inDirection, inAnimationType, outDirection, outAnimationType) {
    clearSelectedBox();

    const inTime = parseFloat(selectedInSpeed) || 4;
    const stayTime = parseFloat(selectedStaySpeed) || 3;
    const outTime = parseFloat(selectedOutSpeed) || 4;

    const $canvas = $('#myCanvas');
    const cw = $canvas.width();
    const ch = $canvas.height();
    const canvasOffset = $canvas.offset();

    const masterTL = gsap.timeline();

    $('.text-box').each(function (i, el) {
        const $el = $(el);
        const offset = $el.offset();
        const elW = $el.outerWidth();
        const elH = $el.outerHeight();

        const naturalX = offset.left - canvasOffset.left;
        const naturalY = offset.top - canvasOffset.top;

        let fromX = naturalX, fromY = naturalY;
        let outX = naturalX, outY = naturalY;

        // Calculate offsets based on animation type and phase
        const fromOffset = calculateOffset(elW, elH, cw, ch, inDirection, inAnimationType, 'in', naturalX, naturalY);
        const outOffset = calculateOffset(elW, elH, cw, ch, outDirection, outAnimationType, 'out', naturalX, naturalY);

        fromX = fromOffset.x;
        fromY = fromOffset.y;
        outX = outOffset.x;
        outY = outOffset.y;
        const staggerPerElement = 0.2;
        const totalInTime = inTime + staggerPerElement * ($('.text-box').length - 1);

        // IN Animation
        masterTL.add(buildAnimation(el, inAnimationType, {
            x: fromX - naturalX,
            y: fromY - naturalY,
            inTime,
            direction: inDirection,
            phase: 'in'
        }), 0);

        // STAY (No extra wait, exactly after IN finishes)
        masterTL.to(el, { x: '+=0', y: '+=0', opacity: 1, duration: stayTime }, "+=" + inTime);

        // OUT Animation
        masterTL.add(buildAnimation(el, outAnimationType, {
            x: outX - naturalX,
            y: outY - naturalY,
            outTime,
            direction: outDirection,
            phase: 'out'
        }), "+=" + stayTime);

        // RESET
       // masterTL.set(el, { x: 0, y: 0, opacity: 1 }, "+=" + outTime);


        // RESET
       // masterTL.set(el, { x: 0, y: 0, opacity: 1 }, "+=" + outTime);
    });

    return masterTL;
}

function calculateOffset(elW, elH, cw, ch, direction, animationType, phase, naturalX, naturalY) {
    let x = naturalX;
    let y = naturalY;

    if (animationType === 'delaylinear') {
        if (phase === 'in') {
            switch (direction) {
                case 'left': x = -elW; break;
                case 'right': x = cw; break;
                case 'top': y = -elH; break;
                case 'bottom': y = ch; break;
            }
        } else if (phase === 'out') {
            // reverse for out phase
            switch (direction) {
                case 'left': x = cw; break;
                case 'right': x = -elW; break;
                case 'top': y = ch; break;
                case 'bottom': y = -elH; break;
            }
        }
    }
    else if (animationType === 'delaylinear2' || animationType === 'blur' || animationType === 'roll' || animationType === 'popcorn' || animationType === 'glitch') {
        switch (direction) {
            case 'left': x = -elW; break;
            case 'right': x = cw; break;
            case 'top': y = -elH; break;
            case 'bottom': y = ch; break;
        }
    }
    else if (animationType === 'shake' || animationType === 'blurFlash') {
        const distance = 20;
        switch (direction) {
            case 'left': x = naturalX - distance; break;
            case 'right': x = naturalX + distance; break;
            case 'top': y = naturalY - distance; break;
            case 'bottom': y = naturalY + distance; break;
        }
    }
    else if (animationType === 'mask' || animationType === 'curtain') {
        // No position offset needed
        x = naturalX;
        y = naturalY;
    }

    return { x, y };
}


//function applyAnimationsForPublish(inDirection, inAnimationType, outDirection, outAnimationType, condition, loopCount) {
//    clearSelectedBox();

//    const inTime = parseFloat(selectedInSpeed) || 4;
//    const stayTime = parseFloat(selectedStaySpeed) || 3;
//    const outTime = parseFloat(selectedOutSpeed) || 4;

//    const $canvas = $('#myCanvas');
//    const cw = $canvas.width();
//    const ch = $canvas.height();
//    const canvasOffset = $canvas.offset();

//    const masterTL = gsap.timeline();

//    $('.text-box').each(function (i, el) {
//        const $el = $(el);
//        const offset = $el.offset();
//        const elW = $el.outerWidth();
//        const elH = $el.outerHeight();

//        const naturalX = offset.left - canvasOffset.left;
//        const naturalY = offset.top - canvasOffset.top;

//        let fromX = naturalX, fromY = naturalY, outX = naturalX, outY = naturalY;

//        // Calculate IN direction offsets
//        switch (inDirection) {
//            case 'left': fromX = -elW; break;
//            case 'right': fromX = cw; break;
//            case 'top': fromY = -elH; break;
//            case 'bottom': fromY = ch; break;
//        }

//        // Calculate OUT direction offsets
//        switch (outDirection) {
//            case 'left': outX = -elW; break;
//            case 'right': outX = cw; break;
//            case 'top': outY = -elH; break;
//            case 'bottom': outY = ch; break;
//        }

//        // IN Animation
//        masterTL.add(buildAnimation(el, inAnimationType, {
//            x: fromX - naturalX,
//            y: fromY - naturalY,
//            inTime,
//            direction: inDirection,
//            phase: 'in'
//        }), 0);

//        // STAY
//        masterTL.to(el, { duration: stayTime }, "+=" + inTime);

//        // OUT Animation
//        masterTL.add(buildAnimation(el, outAnimationType, {
//            x: outX - naturalX,
//            y: outY - naturalY,
//            outTime,
//            direction: outDirection,
//            phase: 'out'
//        }), "+=" + stayTime);

//        // RESET
//        masterTL.set(el, { x: 0, y: 0, opacity: 1 }, "+=" + outTime);
//    });

//    return masterTL;
//}

function buildAnimation(el, animationType, { x, y, inTime, outTime, direction, phase }) {
    const tl = gsap.timeline();
    const skew = 30;
    const easeIn = 'power2.out';
    const easeOut = 'power2.in';

    const duration = phase === 'in' ? inTime : outTime;
    const ease = phase === 'in' ? easeIn : easeOut;

    if (animationType === 'delaylinear') {
        tl.fromTo(el, {
            x: phase === 'in' ? x : 0,
            y: phase === 'in' ? y : 0,
            opacity: phase === 'in' ? 0 : 1
        }, {
            x: phase === 'in' ? 0 : x,
            y: phase === 'in' ? 0 : y,
            opacity: phase === 'in' ? 1 : 0,
            duration,
            ease,
            stagger: 0.2
        });
    }
    else if (animationType === 'delaylinear2') {
        tl.fromTo(el, {
            x: phase === 'in' ? x : 0,
            y: phase === 'in' ? y : 0,
            skewX: (direction === 'left' ? skew : direction === 'right' ? -skew : 0) * (phase === 'in' ? 1 : -1),
            skewY: (direction === 'top' ? -skew : direction === 'bottom' ? skew : 0) * (phase === 'in' ? 1 : -1),
            opacity: phase === 'in' ? 0 : 1
        }, {
            x: phase === 'in' ? 0 : x,
            y: phase === 'in' ? 0 : y,
            skewX: 0,
            skewY: 0,
            opacity: phase === 'in' ? 1 : 0,
            duration,
            ease: phase === 'in' ? 'elastic.out(1,0.5)' : 'power2.in',
            stagger: 0.2
        });
    }
    // Additional animations can be added here in similar format.

    return tl;
}


async function applyAnimationsForPublish(inDirection, inAnimationType, outDirection, outAnimationType, condition, loopCount) {
  
    clearSelectedBox();

    const inTime = parseFloat(selectedInSpeed) || 4;
    const stayTime = parseFloat(selectedStaySpeed) || 3;
    const outTime = parseFloat(selectedOutSpeed) || 4;

    const $canvas = $('#myCanvas');
    const cw = $canvas.width();
    const ch = $canvas.height();
    const canvasOffset = $canvas.offset();

    const tl = gsap.timeline();

    $('.text-box').each(function (i, el) {
        const $el = $(el);
        const off = $el.offset();
        const elW = $el.outerWidth();
        const elH = $el.outerHeight();
        const natX = off.left - canvasOffset.left;
        const natY = off.top - canvasOffset.top;
        const offset = $el.offset();

        // Helpers to compute IN and OUT offsets
        function computeOffset(dir, isIn) {
            let x = natX, y = natY;
            if (isIn) {
                switch (dir) {
                    case 'left': x = -elW; break;
                    case 'right': x = cw; break;
                    case 'top': y = -elH; break;
                    case 'bottom': y = ch; break;
                }
            } else {
                switch (dir) {
                    case 'left': x = cw; break;
                    case 'right': x = -elW; break;
                    case 'top': y = ch; break;
                    case 'bottom': y = -elH; break;
                }
            }
            return { x, y };
        }
        const inOffset = computeOffset(inDirection, true);
        const outOffset = computeOffset(outDirection, false);
        let fromX = 0, fromY = 0, outX = 0, outY = 0;
        function computeOffsetWebIn(inDirection, elW, elH, cw, ch) {
          

            switch (inDirection) {
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

            return { fromX, fromY, outX, outY };
        }
        function computeOffsetWebOut(outDirection, elW, elH, cw, ch) {
           /* let fromX = 0, fromY = 0, outX = 0, outY = 0;*/

            switch (outDirection) {
                //case 'left':
                //    fromX = cw;
                //    outX = -elW;
                //    break;
                //case 'right':
                //    fromX = -elW;
                //    outX = cw;

                //    break;
                //case 'top':
                //    fromY = -elH;
                //    outY = ch;

                //    break;
                //case 'bottom':

                //    fromY = ch;
                //    outY = -elH;
                //    break;
                //default:
                //    fromX = -elW;
                //    outX = cw;
                case 'left':
                    fromX = -elW;
                    outX = cw;
                    break;
                case 'right':
                    fromX = cw;
                    outX = -elW;
                    break;
                case 'bottom':
                    fromY = ch ;
                    outY = -elH;
                    break;
                case 'top':
                    fromY = -elH;
                    outY = ch;
                    break;
                default:
                    fromX = -elW;
                    outX = cw;
            }

            return { fromX, fromY, outX, outY };
        }
        const naturalX = offset.left - canvasOffset.left;
        const naturalY = offset.top - canvasOffset.top;
        const webInOffset = computeOffsetWebIn(inDirection, elW, elH, cw, ch);
        const webOutOffset = computeOffsetWebOut(outDirection, elW, elH, cw, ch);

        // --- IN PHASE ---
        switch (inAnimationType) {
            case 'delaylinear':
                tl.from(el, {
                    x: inOffset.x - natX,
                    y: inOffset.y - natY,
                    opacity: 0,
                    duration: inTime,
                    ease: 'power2.out',
                    stagger: 0.2
                }, 0);
                break;

            case 'delaylinear2': { // wave
                const skew = 30;
                tl.from(el, {
                    x: webInOffset.fromX - naturalX,
                    y: webInOffset.fromY - naturalY,
                    skewX: inDirection === 'left' ? skew :
                        inDirection === 'right' ? -skew : 0,
                    skewY: inDirection === 'top' ? -skew :
                        inDirection === 'bottom' ? skew : 0,
                    opacity: 0,
                    duration: inTime,
                    ease: 'elastic.out(1, 0.5)',
                    stagger: 0.2
                }, 0);
                break;
            }

            case 'mask': {
                const clips = {
                    left: 'inset(0% 0% 0% 100%)',
                    right: 'inset(0% 100% 0% 0%)',
                    top: 'inset(100% 0% 0% 0%)',
                    bottom: 'inset(0% 0% 100% 0%)'
                };
                tl.from(el, {
                    clipPath: clips[inDirection] || clips.right,
                    duration: inTime,
                    ease: 'power2.out',
                    stagger: 0.2
                }, 0);
                break;
            }

            case 'shake': {
                let from = {}, to = {};
                if (/left|right/.test(inDirection)) {
                    from.x = inDirection === 'left' ? -10 : 10;
                    to.x = inDirection === 'left' ? 10 : -10;
                } else {
                    from.y = inDirection === 'top' ? -10 : 10;
                    to.y = inDirection === 'top' ? 10 : -10;
                }
                tl.fromTo(el, from, {
                    ...to,
                    duration: inTime / 8,
                    yoyo: true,
                    repeat: 8,
                    ease: 'power1.inOut'
                }, 0);
                break;
            }

            case 'blur':
                tl.fromTo(el, {
                    opacity: 0,
                    filter: 'blur(10px)',
                    x: inOffset.x - natX,
                    y: inOffset.y - natY
                }, {
                    opacity: 1,
                    filter: 'blur(0px)',
                    x: 0,
                    y: 0,
                    duration: inTime,
                    ease: 'power2.out',
                    stagger: 0.2
                }, 0);
                break;

            case 'roll': {
                const angle = 90, dist = 100;
                const rX = inDirection === 'left' ? -dist
                    : inDirection === 'right' ? dist : 0;
                const rY = inDirection === 'top' ? -dist
                    : inDirection === 'bottom' ? dist : 0;
                const rRot = inDirection === 'left' ? -angle
                    : inDirection === 'right' ? angle
                        : inDirection === 'top' ? angle : -angle;
                tl.from(el, {
                    opacity: 0,
                    x: rX,
                    y: rY,
                    rotation: rRot,
                    transformOrigin: '0% 50%',
                    duration: inTime,
                    ease: 'power2.out',
                    stagger: 0.2
                }, 0);
                break;
            }

            case 'curtain': {
                let origin, fromVars = { opacity: 0 }, outVars = {};
                switch (inDirection) {
                    case 'top': origin = '50% 0%'; fromVars.scaleY = 0; break;
                    case 'bottom': origin = '50% 100%'; fromVars.scaleY = 0; break;
                    case 'left': origin = '0% 50%'; fromVars.scaleX = 0; break;
                    case 'right': origin = '100% 50%'; fromVars.scaleX = 0; break;
                }
                fromVars.transformOrigin = origin;
                tl.from(el, {
                    ...fromVars,
                    duration: inTime,
                    ease: 'power2.out',
                    stagger: 0.2
                }, 0);
                break;
            }

            case 'blurFlash':
                tl.fromTo(el, {
                    opacity: 0,
                    filter: 'blur(20px)',
                    x: inOffset.x - natX,
                    y: inOffset.y - natY
                }, {
                    opacity: 1,
                    filter: 'blur(0px)',
                    x: 0,
                    y: 0,
                    duration: inTime / 5,
                    ease: 'power2.out',
                    yoyo: true,
                    repeat: 1,
                    stagger: 0.2
                }, 0)
                    .set(el, { opacity: 1, filter: 'blur(0px)', x: 0, y: 0 }, inTime / 5 * 2);
                break;

            case 'popcorn': {
                const pd = 50;
                const pX = inDirection === 'left' ? -pd
                    : inDirection === 'right' ? pd : 0;
                const pY = inDirection === 'top' ? -pd
                    : inDirection === 'bottom' ? pd : 0;
                tl.fromTo(el, {
                    opacity: 0,
                    scale: 0.3,
                    x: pX,
                    y: pY
                }, {
                    opacity: 1,
                    scale: 1.2,
                    x: 0,
                    y: 0,
                    duration: inTime * 0.25,
                    ease: 'power1.out',
                    onComplete: () => gsap.to(el, { scale: 1, duration: inTime * 0.125, ease: 'power1.in' }),
                    stagger: 0.1
                }, 0);
                break;
            }

            case 'glitch': {
                const gd = 50;
                const gX = inDirection === 'left' ? -gd
                    : inDirection === 'right' ? gd : 0;
                const gY = inDirection === 'top' ? -gd
                    : inDirection === 'bottom' ? gd : 0;
                tl.fromTo(el, {
                    opacity: 0,
                    x: gX,
                    y: gY
                }, {
                    opacity: 1,
                    x: 0,
                    y: 0,
                    duration: inTime * 0.3,
                    ease: 'power2.out',
                    stagger: 0.1
                }, 0)
                    .to(el, {
                        x: () => gsap.utils.random(-5, 5),
                        y: () => gsap.utils.random(-3, 3),
                        repeat: 10,
                        yoyo: true,
                        duration: 0.05,
                        ease: 'rough({strength:8,points:20,clamp:true})',
                        stagger: 0.1
                    }, inTime * 0.3);
                break;
            }
        }

        // --- STAY ---
        tl.to(el, { duration: stayTime }, inTime);

        // --- OUT PHASE ---
        switch (outAnimationType) {
            case 'delaylinear':
                tl.to(el, {
                    x: outOffset.x - natX,
                    y: outOffset.y - natY,
                    opacity: 0,
                    duration: outTime,
                    ease: 'power2.in',
                    stagger: 0.2
                }, inTime + stayTime)
                    .set(el, { x: 0, y: 0, opacity: 1 }, inTime + stayTime + outTime);
                break;

            case 'delaylinear2': {
                const skew = 30;
                tl.to(el, {
                    x: webOutOffset.outX - naturalX,
                    y: webOutOffset.outY - naturalY,
                    skewX: outDirection === 'left' ? -skew :
                        outDirection === 'right' ? skew : 0,
                    skewY: outDirection === 'top' ? skew :
                        outDirection === 'bottom' ? -skew : 0,
                    opacity: 0,
                    duration: outTime,
                    ease: 'power2.in',
                    stagger: 0.2
                }, inTime + stayTime)
                    .set(el, { x: 0, y: 0, skewX: 0, skewY: 0, opacity: 1 }, inTime + stayTime + outTime);
                break;
            }

            case 'mask': {
                const clips = {
                    left: 'inset(0% 0% 0% 100%)',
                    right: 'inset(0% 100% 0% 0%)',
                    top: 'inset(100% 0% 0% 0%)',
                    bottom: 'inset(0% 0% 100% 0%)'
                };
                tl.to(el, {
                    clipPath: clips[outDirection] || clips.right,
                    duration: outTime,
                    ease: 'power2.in',
                    stagger: 0.2
                }, inTime + stayTime)
                    .set(el, { clipPath: 'inset(0% 0% 0% 0%)' }, inTime + stayTime + outTime);
                break;
            }

            case 'shake': {
                let from = {}, to = {};
                if (/left|right/.test(outDirection)) {
                    from.x = outDirection === 'left' ? -10 : 10;
                    to.x = outDirection === 'left' ? 10 : -10;
                } else {
                    from.y = outDirection === 'top' ? -10 : 10;
                    to.y = outDirection === 'top' ? 10 : -10;
                }
                tl.fromTo(el, from, {
                    ...to,
                    duration: outTime / 8,
                    yoyo: true,
                    repeat: 8,
                    ease: 'power1.inOut'
                }, inTime + stayTime)
                    .set(el, { x: 0, y: 0 }, inTime + stayTime + outTime / 8 * 8);
                break;
            }

            case 'blur':
                tl.to(el, {
                    opacity: 0,
                    filter: 'blur(10px)',
                    x: outOffset.x - natX,
                    y: outOffset.y - natY,
                    duration: outTime,
                    ease: 'power2.in',
                    stagger: 0.2
                }, inTime + stayTime)
                    .set(el, { opacity: 1, filter: 'blur(0px)', x: 0, y: 0 }, inTime + stayTime + outTime);
                break;

            case 'roll': {
                const angle = 90, dist = 100;
                const rX = outDirection === 'left' ? -dist
                    : outDirection === 'right' ? dist : 0;
                const rY = outDirection === 'top' ? -dist
                    : outDirection === 'bottom' ? dist : 0;
                const rRot = outDirection === 'left' ? angle
                    : outDirection === 'right' ? -angle
                        : outDirection === 'top' ? -angle : angle;
                tl.to(el, {
                    opacity: 0,
                    x: rX,
                    y: rY,
                    rotation: rRot,
                    transformOrigin: '0% 50%',
                    duration: outTime,
                    ease: 'power2.in',
                    stagger: 0.2
                }, inTime + stayTime)
                    .set(el, { x: 0, y: 0, rotation: 0, opacity: 1 }, inTime + stayTime + outTime);
                break;
            }

            case 'curtain': {
                let origin, vars = { opacity: 0 };
                switch (outDirection) {
                    case 'top': origin = '50% 100%'; vars.scaleY = 0; break;
                    case 'bottom': origin = '50% 0%'; vars.scaleY = 0; break;
                    case 'left': origin = '100% 50%'; vars.scaleX = 0; break;
                    case 'right': origin = '0% 50%'; vars.scaleX = 0; break;
                }
                vars.transformOrigin = origin;
                tl.to(el, {
                    ...vars,
                    duration: outTime,
                    ease: 'power2.in',
                    stagger: 0.2
                }, inTime + stayTime)
                    .set(el, { scaleX: 1, scaleY: 1, opacity: 1, transformOrigin: origin }, inTime + stayTime + outTime);
                break;
            }

            case 'blurFlash':
                tl.fromTo(el, {
                    opacity: 1,
                    filter: 'blur(0px)',
                    x: 0,
                    y: 0
                }, {
                    opacity: 0,
                    filter: 'blur(20px)',
                    x: outOffset.x - natX,
                    y: outOffset.y - natY,
                    duration: outTime / 5,
                    ease: 'power2.in',
                    yoyo: true,
                    repeat: 1,
                    stagger: 0.2
                }, inTime + stayTime)
                    .set(el, { opacity: 1, filter: 'blur(0px)', x: 0, y: 0 }, inTime + stayTime + outTime / 5 * 2);
                break;

            case 'popcorn': {
                const pd = 50;
                const pX = outDirection === 'left' ? -pd
                    : outDirection === 'right' ? pd : 0;
                const pY = outDirection === 'top' ? -pd
                    : outDirection === 'bottom' ? pd : 0;
                tl.fromTo(el, {
                    opacity: 1,
                    scale: 1,
                    x: 0,
                    y: 0
                }, {
                    opacity: 0,
                    scale: 0.3,
                    x: pX,
                    y: pY,
                    duration: outTime * 0.25,
                    ease: 'power1.in',
                    onComplete: () => gsap.set(el, { scale: 1 }),
                    stagger: 0.1
                }, inTime + stayTime)
                    .set(el, { x: 0, y: 0, opacity: 1 }, inTime + stayTime + outTime * 0.25);
                break;
            }

            case 'glitch': {
                const gd = 50;
                const gX = outDirection === 'left' ? -gd
                    : outDirection === 'right' ? gd : 0;
                const gY = outDirection === 'top' ? -gd
                    : outDirection === 'bottom' ? gd : 0;
                tl.to(el, {
                    x: () => gsap.utils.random(-5, 5),
                    y: () => gsap.utils.random(-3, 3),
                    repeat: 10,
                    yoyo: true,
                    duration: 0.05,
                    ease: 'rough({strength:8,points:20,clamp:true})',
                    stagger: 0.1
                }, inTime + stayTime)
                    .to(el, {
                        opacity: 0,
                        x: gX,
                        y: gY,
                        duration: outTime * 0.3,
                        ease: 'power2.in',
                        stagger: 0.1
                    }, inTime + stayTime + 0.05 * 20)
                    .set(el, { x: 0, y: 0, opacity: 1 }, inTime + stayTime + 0.05 * 20 + outTime * 0.3);
                break;
            }
        }

    });
            return tl;
}


//function applyAnimationsForPublish(inDirection, inAnimationType, outDirection, outAnimationType, condition, loopCount) {
//    clearSelectedBox();

//    const inTime = parseFloat(selectedInSpeed) || 4;
//    const stayTime = parseFloat(selectedStaySpeed) || 3;
//    const outTime = parseFloat(selectedOutSpeed) || 4;

//    const $canvas = $('#myCanvas');
//    const cw = $canvas.width();
//    const ch = $canvas.height();
//    const canvasOffset = $canvas.offset();

//    const tl = gsap.timeline();

//    $('.text-box').each(function (i, el) {
//        const $el = $(el);
//        const off = $el.offset();
//        const elW = $el.outerWidth();
//        const elH = $el.outerHeight();
//        const natX = off.left - canvasOffset.left;
//        const natY = off.top - canvasOffset.top;

//        // --- IN PHASE ---
//        if (inAnimationType === 'delaylinear') {
//            // compute start off‑screen
//            let fromX = natX, fromY = natY;
//            switch (inDirection) {
//                case 'left': fromX = -elW; break;
//                case 'right': fromX = cw; break;
//                case 'top': fromY = -elH; break;
//                case 'bottom': fromY = ch; break;
//            }
//            // 1) IN: slide in
//            tl.from(el, {
//                x: fromX - natX,
//                y: fromY - natY,
//                opacity: 0,
//                duration: inTime,
//                ease: 'power2.out',
//                stagger: 0.2
//            }, 0);

//            // 2) STAY
//            tl.to(el, { duration: stayTime }, inTime);

//            // compute exit off‑screen
//            let outX = natX, outY = natY;
//            switch (outDirection) {
//                case 'left': outX = cw; break;
//                case 'right': outX = -elW; break;
//                case 'top': outY = ch; break;
//                case 'bottom': outY = -elH; break;
//            }
//            // 3) OUT: slide out
//            tl.to(el, {
//                x: outX - natX,
//                y: outY - natY,
//                opacity: 0,
//                duration: outTime,
//                ease: 'power2.in',
//                stagger: 0.2
//            }, inTime + stayTime);

//            // 4) RESET
//            tl.set(el, { x: 0, y: 0, opacity: 1 }, inTime + stayTime + outTime);
//        }
       
//    });

//    return tl;
//}




