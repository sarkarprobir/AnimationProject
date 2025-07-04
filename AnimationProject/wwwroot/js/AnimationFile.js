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
                }, 0
                );
                // 2) STAY: hold final state
                flashTL.to(el, { duration: stayTime }, inTime / 5 * 2);
            } else {
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




}

