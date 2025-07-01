let savedSelection = null;
let selectedBox = null;
const canvas = document.getElementById("myCanvas");
//const ctx = canvas.getContext("2d");


$(document).on('mousedown', function (e) {
    if ($(e.target).closest('.text-box').length) return;

    // If the clicked target is inside any control buttons, don't deselect
    if ($(e.target).closest('#fontSize, #textColor, #fontFamily, #boldBtn, #italicBtn, #underlineBtn, #caseToggleBtn, #alignBtn, #lineHeight').length) return;
    // If the clicked element is NOT inside a .text-box
    if (!$(e.target).closest('.text-box').length) {
        if (selectedBox) {
            selectedBox.removeClass('selected');

            if (selectedBox.data('ui-draggable')) selectedBox.draggable('destroy');
            if (selectedBox.data('ui-resizable')) selectedBox.resizable('destroy');

            selectedBox.find('.drag-handle, .rotate-handle, .delete-handle').remove();
            selectedBox.find('.ui-resizable-handle').remove();

            selectedBox = null;
        }
    }
});


$(document).on('click', '.text-box', function (e) {
    e.stopPropagation();
    $(this).find('.text-content').focus();
    const $clicked = $(this);

    // 1) Teardown all other boxes
    $('.text-box').not($clicked).each(function () {
        const $other = $(this);

        $other.removeClass('selected');
        if ($other.data('ui-draggable')) $other.draggable('destroy');
        if ($other.data('ui-resizable')) $other.resizable('destroy');

        // remove your custom handles
        $other.find('.drag-handle, .rotate-handle, .delete-handle').remove();
        // remove leftover jQuery UI handles
        $other.find('.ui-resizable-handle').remove();
    });

    // 2) Mark THIS one as selected
    $clicked.addClass('selected');
    selectedBox = $clicked;


    // 3) Setup the chrome (handles + interactions) on the clicked box

    // a) append handles
    const $drag = $('<div class="drag-handle"><i class="fas fa-arrows-alt"></i></div>').appendTo($clicked);
    const $rotate = $('<div class="rotate-handle"></div>').appendTo($clicked);
    const $del = $('<div class="delete-handle"><i class="fas fa-trash"></i></div>').appendTo($clicked);

    
    // c) wire up rotation
    let rotating = false, center = {};
    $rotate.on('mousedown', function (ev) {
        ev.preventDefault();
        rotating = true;
        const offs = $clicked.offset();
        center = {
            x: offs.left + $clicked.outerWidth() / 2,
            y: offs.top + $clicked.outerHeight() / 2
        };
        $(document).on('mousemove.rotate', function (e2) {
            if (!rotating) return;
            const angle = Math.atan2(e2.pageY - center.y, e2.pageX - center.x) * 180 / Math.PI;
            $clicked.css('transform', `rotate(${angle}deg)`);
        }).on('mouseup.rotate', function () {
            rotating = false;
            $(document).off('.rotate');
        });
    });
    /*  makeBoxDraggableAndResizable($clicked);*/
    if ($clicked.find('svg, img').length) {
        makeBoxDraggableAndResizableImage($clicked);
    } else {
        makeBoxDraggableAndResizable($clicked);
    }
    // d) wire up delete
    $del.on('click', function (ev) {
        ev.stopPropagation();
        $clicked.remove();
        selectedBox = null;
    });

    // 4) Sync the controls UI
    $('#fontSize').val(parseInt($clicked.css('font-size')));
    $('#textColor').val(rgbToHex($clicked.css('color')));
    const lhPx = parseFloat($clicked.css('line-height'));
    const fsPx = parseFloat($clicked.css('font-size'));
    $('#lineHeight').val((lhPx / fsPx).toFixed(2));
});


// ✅ Font Size
function applyFontSize(size) {
    if (!selectedBox) return;

    restoreSelection(); // 🔁 Restore selection before applying

    const sel = window.getSelection();
    if (!sel.rangeCount) return;

    const range = sel.getRangeAt(0);
    if (range.collapsed) {
        selectedBox.css('font-size', size + 'px');
        return;
    }

    const span = document.createElement('span');
    span.style.fontSize = size + 'px';

    try {
        const contents = range.extractContents();
        span.appendChild(contents);
        range.deleteContents();
        range.insertNode(span);

        // Keep selection on new content
        const newRange = document.createRange();
        newRange.selectNodeContents(span);
        sel.removeAllRanges();
        sel.addRange(newRange);

        saveSelection(); // update saved selection
    } catch (e) {
        console.warn('Font size error:', e);
    }
}
$('#fontSize').on('input', function () {
    const size = parseInt($(this).val());
    applyFontSize(size);
});

// ✅ Text Color
$('#textColor').on('input', function () {
    const color = $(this).val();
    applyStyleValue('foreColor', 'color', color);
});


// ✅ Font Family
function applyFontFamily(font) {
    if (!selectedBox) return;

    restoreSelection(); // 🔁 Restore preserved selection

    const sel = window.getSelection();
    if (!sel.rangeCount) return;

    const range = sel.getRangeAt(0);
    if (range.collapsed) {
        // No selection, apply to full box
        selectedBox.css('font-family', font);
        return;
    }

    const span = document.createElement('span');
    span.style.fontFamily = font;

    try {
        const contents = range.extractContents();
        span.appendChild(contents);
        range.deleteContents();
        range.insertNode(span);

        // Reselect the styled span
        const newRange = document.createRange();
        newRange.selectNodeContents(span);
        sel.removeAllRanges();
        sel.addRange(newRange);

        saveSelection(); // 🔁 Save new selection
    } catch (e) {
        console.warn('Font family error:', e);
    }
}

$('#fontFamily').on('change', function () {
    const family = $(this).val();
    applyStyleValue('fontName', 'font-family', family);
});


function applyStyleValue(cmd, cssProp, value) {
    if (!selectedBox) return;

    selectedBox[0].focus();
    restoreSelection();

    const sel = window.getSelection();
    const isTextSelected = sel && !sel.isCollapsed && sel.rangeCount > 0;

    if (isTextSelected) {
        document.execCommand(cmd, false, value);
        saveSelection(); // maintain selection
    } else {
        selectedBox.css(cssProp, value);
    }
}



// Bold
$('#boldBtn').on('click', function (e) {
    e.preventDefault(); // don't steal focus
    applyStyleCommand('bold', 'font-weight', 'bold');
});

$('#italicBtn').on('click', function (e) {
    e.preventDefault(); // don't steal focus
    applyStyleCommand('italic', 'font-style', 'italic');
});

$('#underlineBtn').on('click', function (e) {
    e.preventDefault(); // don't steal focus
    applyStyleCommand('underline', 'text-decoration', 'underline');
});


// Use execCommand after restoring selection
function applyStyleCommand(cmd, cssProp, cssToggleValue) {
    if (!selectedBox) return;

    selectedBox[0].focus();
    restoreSelection();

    const sel = window.getSelection();
    const isTextSelected = sel && !sel.isCollapsed && sel.rangeCount > 0;

    if (isTextSelected) {
        document.execCommand(cmd, false, null);
        saveSelection(); // re-save selection
    } else {
        // Toggle the CSS property manually
        const current = selectedBox.css(cssProp);
        const shouldRemove =
            (cssProp === 'font-weight' && (current === 'bold' || current === '700')) ||
            (cssProp === 'font-style' && current === 'italic') ||
            (cssProp === 'text-decoration' && current.includes('underline'));

        selectedBox.css(cssProp, shouldRemove ? '' : cssToggleValue);
    }
}



$('#caseToggleBtn').on('click', function (e) {
    e.preventDefault();
    if (!selectedBox) return;

    selectedBox[0].focus();

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;

    const range = sel.getRangeAt(0);
    const selectedText = range.toString();
    if (!selectedText.trim()) return;

    const isUpper = selectedText === selectedText.toUpperCase();
    const toggledText = isUpper ? selectedText.toLowerCase() : selectedText.toUpperCase();

    // Preserve formatting by inserting span with toggled content
    const span = document.createElement('span');
    span.textContent = toggledText;

    range.deleteContents();
    range.insertNode(span);

    // Reselect toggled text
    const newRange = document.createRange();
    newRange.setStart(span.firstChild, 0);
    newRange.setEnd(span.firstChild, toggledText.length);

    sel.removeAllRanges();
    sel.addRange(newRange);

    // Save selection for future reuse (optional)
    savedSelection = newRange.cloneRange();
});




// Text Alignment (toggle between left, center, right, justify)
const alignments = ['left', 'center', 'right', 'justify'];
let alignIndex = 0;

$('#alignBtn').on('click', function () {
    if (selectedBox) {
        alignIndex = (alignIndex + 1) % alignments.length;
        const align = alignments[alignIndex];
        selectedBox.css('text-align', align);

        const iconMap = {
            left: 'fa-align-left',
            center: 'fa-align-center',
            right: 'fa-align-right',
            justify: 'fa-align-justify'
        };
        $('#caseToggleBtn').on('click', function (e) {
            e.preventDefault();
            if (!selectedBox) return;

            selectedBox[0].focus();
            restoreSelection();

            const sel = window.getSelection();
            if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;

            const range = sel.getRangeAt(0);
            const selectedText = range.toString();
            const isUpper = selectedText === selectedText.toUpperCase();
            const toggledText = isUpper ? selectedText.toLowerCase() : selectedText.toUpperCase();

            // Create text node with toggled text
            const toggledNode = document.createTextNode(toggledText);

            // Replace original text with toggled version
            range.deleteContents();
            range.insertNode(toggledNode);

            // 🔁 Rebuild the new selection range on the newly inserted text
            const newRange = document.createRange();
            newRange.setStart(toggledNode, 0);
            newRange.setEnd(toggledNode, toggledText.length);

            sel.removeAllRanges();
            sel.addRange(newRange);

            // ✅ Now save the NEW selection properly
            savedSelection = newRange.cloneRange();
        });

        const $icon = $(this).find('i');
        $icon.removeClass().addClass(`fas ${iconMap[align]}`);
    }
});

// Line Height
$('#lineHeight').on('input', function () {
    debugger;
    if (!selectedBox) return;

    const multiplier = parseFloat($(this).val());
    selectedBox.css('line-height', multiplier);

    // Adjust the height based on the inner text content
    const $content = selectedBox.find('.text-content');

    // Always reset first to auto, to allow shrink
    selectedBox.css('height', 'auto');

    // Calculate actual required height
    const neededHeight = $content[0].scrollHeight + 10; // Add small padding

    // Apply the new height
    selectedBox.css('height', neededHeight + 'px');
});



$(document).on('keydown', '.text-content', function (e) {

    if (e.key === 'Enter') {
        e.preventDefault();
        document.execCommand('insertLineBreak');   // single <br>
    }
    
});

$(document).on('input paste', '.text-box', function () {
    if (this !== selectedBox[0]) return;

    // 1) Update your controls
    const lhPx = parseFloat(selectedBox.css('line-height'));
    const fsPx = parseFloat(selectedBox.css('font-size'));
    $('#lineHeight').val((lhPx / fsPx).toFixed(2));

    // 2) FORCE the box to grow to fit new content
    const $content = selectedBox.find('.text-content');
    selectedBox.css('height', 'auto');
    const requiredH = $content[0].scrollHeight;  // padding +10
    selectedBox.css('height', requiredH + 'px');

    // 3) Now APPLY the **exact same** viewport‐based clamp you use in draggable:
    const rect = canvas.getBoundingClientRect();
    const boxW = selectedBox.outerWidth();
    const boxH = selectedBox.outerHeight();
    const offs = selectedBox.offset();  // page coords
    let left = offs.left;
    let top = offs.top;

    // the boundaries:
    const minX = rect.left;
    const minY = rect.top;
    const maxX = rect.left + rect.width - boxW;
    const maxY = rect.top + rect.height - boxH;

    // clamp position
    left = Math.min(Math.max(left, minX), maxX);
    top = Math.min(Math.max(top, minY), maxY);

    // clamp size so bottom/right stay inside
    const maxW = rect.left + rect.width - left;
    const maxH = rect.top + rect.height - top;
    const finalW = Math.min(boxW, maxW);
    const finalH = Math.min(boxH, maxH);

    // 4) APPLY both size & position in one go
    selectedBox
        .outerWidth(finalW)
        .outerHeight(finalH)
        .offset({ left, top });
});






function saveSelection() {
    const sel = window.getSelection();
    if (sel.rangeCount > 0) {
        savedSelection = sel.getRangeAt(0);
    }
}

function restoreSelection() {
    if (savedSelection) {
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(savedSelection);
    }
}


// Save selection on mouseup or keyup
$(document).on('mouseup keyup', '.text-box', function () {
    saveSelection();
});

function CreateLeftSectionhtml() {
    try {
        $.ajax({
            url: baseURL + "Canvas/CreateLeftSectionhtml",
            type: "POST",
            dataType: "html",
            success: function (result) {
                $("#divpanelleft").html(result);

            },
            error: function () {
            }
        })

    } catch (e) {
        console.log("catch", e);
    }
}
function CreateRightSectionhtml() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: baseURL + "Canvas/CreateRightSectionhtml",
            type: "POST",
            dataType: "html"
        })
            .done(result => {
                // 1) Inject the partial
                $("#divpanelright").html(result);

                // 2) Now it’s safe to wire up your controls
                document.getElementById('lblSpeed').textContent = "4 Sec";
                document.getElementById('lblSeconds').textContent = "3 Sec";
                document.getElementById('lblOutSpeed').textContent = "4 Sec";
                document.getElementById('lblLoop').textContent = "1 time";

                // 3) Resolve so callers can chain .then()
                resolve();
            })
            .fail((jqXHR, textStatus, errorThrown) => {
                console.error("Failed to load right section:", textStatus, errorThrown);
                reject(errorThrown);
            });
    });
}
function CreateHeaderSectionhtml() {
    try {
        $.ajax({
            url: baseURL + "Canvas/CreateHeaderSectionhtml",
            type: "POST",
            dataType: "html",
            success: function (result) {
                $("#divHeaderSection").html(result);

                const lin = document.getElementById('alinear');
                if (lin) {
                    lin.classList.add('active_effect');
                } else {
                    // console.warn("#alinear still not found!");
                }


                wireSpeedDropdown();
                wireOutSpeedDropdown();
                wireLoopDropdown();
                /* wireUpPopupHandlers();*/
            },
            error: function () {
            }
        })

    } catch (e) {
        console.log("catch", e);
    }
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
function wireSpeedDropdown() {
    const ddl = document.getElementById('ddlSpeedControl');
    if (!ddl) {
        // console.warn("#ddlSpeedControl not found!");
        return;
    }
    ddl.addEventListener('click', function (event) {
        if (event.target.matches('a.dropdown-item')) {
            selectedInSpeed = event.target.getAttribute('value');
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
            selectedStaySpeed = event.target.getAttribute('value');
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

function handleThumbClick(clickedElement) {
    const items = document.querySelectorAll('.menuboard-vertical-thum');

    items.forEach(el => el.classList.remove('active_border'));
    clickedElement.classList.add('active_border');
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



function makeBoxDraggableAndResizable($box) {
    // 1) Grab the container div and its metrics
    const $canvas = $('#myCanvas');
    const canvasRect = $canvas[0].getBoundingClientRect();  // use the DOM node
    const canvasPos = $canvas.position();
    const cLeft = canvasPos.left;
    const cTop = canvasPos.top;
    const cW = $canvas.width();
    const cH = $canvas.height();

    // 2) Draggable, contained within the div
    $box.draggable({
        handle: '.drag-handle',
        containment: [
            canvasRect.left,
            canvasRect.top,
            canvasRect.left + canvasRect.width - $box.outerWidth(),
            canvasRect.top + canvasRect.height - $box.outerHeight()
        ]
    });

    // 3) Resizable: side handles + corner handles
    $box.resizable({
        handles: 'e,w,ne,se,sw,nw',
        minWidth: 20,
        minHeight: 20,

        // 3A) On start, remember original size/font/textHeight
        start(event, ui) {
            $box.data('orig', {
                boxW: ui.size.width,
                boxH: ui.size.height,
                font: parseFloat($box.css('font-size')),
                textH: $box.find('.text-content')[0].scrollHeight
            });
        },

        // 3B) On each resize
        resize(event, ui) {
            // — clamp box position & size inside the div
            ui.position.left = Math.min(Math.max(ui.position.left, cLeft), cLeft + cW - ui.size.width);
            ui.position.top = Math.min(Math.max(ui.position.top, cTop), cTop + cH - ui.size.height);
            ui.size.width = Math.min(ui.size.width, cW - (ui.position.left - cLeft));
            ui.size.height = Math.min(ui.size.height, cH - (ui.position.top - cTop));

            // — find which handle is active
            const inst = ui.element.resizable('instance')
                || ui.element.data('ui-resizable')
                || ui.element.data('resizable');
            const axis = inst && inst.axis;  // "e","w","ne","nw","se","sw"

            if (axis && axis.length === 2) {
                // CORNER drag: scale font to fill
                const orig = $box.data('orig');
                const scaleW = ui.size.width / orig.boxW;
                const scaleH = ui.size.height / orig.boxH;
                const maxText = (ui.size.height - 10) / orig.textH;
                const scale = Math.min(scaleW, scaleH, maxText, 1);
                const newFont = Math.max(8, orig.font * scale);

                $box.css('font-size', newFont + 'px');
                $box.css('height', 'auto');
                const neededH = $box.find('.text-content')[0].scrollHeight + 10;
                $box.css('height', neededH + 'px');
            } else {
                // SIDE drag: keep font, just reflow text
                $box.css('height', 'auto');
                const neededH = $box.find('.text-content')[0].scrollHeight + 10;
                $box.css('height', neededH + 'px');
            }
        }
    });
}


function makeBoxDraggableAndResizableNewOLD($box) {
    const $canvas = $('#myCanvas');
    const rect = canvas.getBoundingClientRect();
    // 1) Get the canvas position relative to its offset parent (#canvasContainer)
    const canvasPos = $canvas.position();
    const cLeft = canvasPos.left;
    const cTop = canvasPos.top;

    // 2) Get the canvas size (CSS pixels)
    const cW = $canvas.width();
    const cH = $canvas.height();

    // 3) Now measure the box itself
    const boxW = $box.outerWidth();
    const boxH = $box.outerHeight();

    // 4) Compute the min/max for the box’s top-left so it never leaves the canvas
    const minX = cLeft;           // left edge of canvas
    const minY = cTop;            // top edge
    const maxX = cLeft + cW - boxW; // far right the box’s left can go
    const maxY = cTop + cH - boxH; // far bottom the box’s top can go




    const minX_d = rect.left;
    const minY_d = rect.top;
    const maxX_d = rect.left + rect.width - boxW;
    const maxY_d = rect.top + rect.height - boxH;

    // 3) Apply draggable with that exact containment
    $box.draggable({
        handle: '.drag-handle',
        containment: [minX_d, minY_d, maxX_d, maxY_d]
    });


    $box.resizable({
        handles: 'e,w,ne,se,sw,nw',
        minWidth: 0,       // ← allow it to shrink to zero
        minHeight: 0,      // ← likewise for height, if needed
        resize(event, ui) {
            // Clamp position
            ui.position.left = Math.min(Math.max(ui.position.left, minX), maxX);
            ui.position.top = Math.min(Math.max(ui.position.top, minY), maxY);

            // Clamp size
            ui.size.width = Math.min(ui.size.width, cW - (ui.position.left - cLeft));
            ui.size.height = Math.min(ui.size.height, cH - (ui.position.top - cTop));

            // Force height to fit content
            const $content = ui.element.find('.text-content');
            ui.element.css('height', 'auto'); // let it grow
            const requiredHeight = $content[0].scrollHeight + 10; // some padding
            ui.element.css('height', requiredHeight + 'px');
        }
    });

}
function addDefaultText() {
    
    $("#opengl_popup").hide();
    $("#elementsPopup").hide();


    // 0) Deselect any previously selected box
    $('.text-box').each(function () {
        const $old = $(this);
        $old.removeClass('selected');
        if ($old.data('ui-draggable')) $old.draggable('destroy');
        if ($old.data('ui-resizable')) $old.resizable('destroy');
        $old.find('.drag-handle, .rotate-handle, .delete-handle').remove();
        $old.find('.ui-resizable-handle').remove();
    });

    // 1) Create outer box
    const $box = $('<div class="text-box selected"></div>')
        .appendTo('#canvasContainer');

    // 2) Create inner editable area
    const $content = $('<div class="text-content" contenteditable="true">Default Text</div>')
        .appendTo($box);

    // 3) Append your custom handles
    const $drag = $('<div class="drag-handle"><i class="fas fa-arrows-alt"></i></div>').appendTo($box);
    const $rotate = $('<div class="rotate-handle"></div>').appendTo($box);
    const $del = $('<div class="delete-handle"><i class="fas fa-trash"></i></div>').appendTo($box);

    // 4) Position in center of container
    const $cont = $('#canvasContainer');
    const left = ($cont.width() - $box.outerWidth()) / 2;
    const top = ($cont.height() - $box.outerHeight()) / 2;
    $box.css({ position: 'absolute', left: `${left}px`, top: `${top}px`, transform: 'rotate(0deg)' });

    // 5) **Only once**: make it draggable/resizable using the canvas‐based containment
    makeBoxDraggableAndResizable($box);

    // 6) Rotate logic (unchanged)
    let rotating = false, center = {};
    $rotate.on('mousedown', e => {
        e.preventDefault();
        rotating = true;
        const offs = $box.offset();
        center = {
            x: offs.left + $box.outerWidth() / 2,
            y: offs.top + $box.outerHeight() / 2
        };
        $(document).on('mousemove.rotate', e2 => {
            if (!rotating) return;
            const angle = Math.atan2(e2.pageY - center.y, e2.pageX - center.x) * 180 / Math.PI;
            $box.css('transform', `rotate(${angle}deg)`);
        }).on('mouseup.rotate', () => {
            rotating = false;
            $(document).off('.rotate');
        });
    });

    // 7) Delete logic (unchanged)
    $del.on('click', e => {
        e.stopPropagation();
        $box.remove();
    });


}
function Animate1() {
    // Animate Fade and Scale In without resetting rotation
    $('.text-box').each(function () {
        gsap.fromTo(this,
            { opacity: 0, scale: 0.8, transformOrigin: "50% 50%" }, // Starting state
            { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' } // Animate to normal
        );
    });

    // Typewriter animation after delay
    setTimeout(() => {
        $('.text-content').each(function () {
            gsap.from(this, {
                text: "",
                duration: 2,
                ease: 'none'
            });
        });
    }, 1000);
}


function Animate() {
    // Animate opacity and scale using transform: scale, preserving rotation
    $('.text-box').each(function () {
        gsap.fromTo(this,
            { opacity: 0, scale: 0.8, transformOrigin: "50% 50%" }, // Starting state
            { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' } // Animate to normal
        );
    });

    // Animate text content sliding in
    setTimeout(() => {
        $('.text-content').each(function () {
            gsap.from(this, {
                opacity: 0,
                y: -20,
                duration: 0.5,
                ease: 'power2.out'
            });
        });
    }, 1000);
}

function Animate2() {
    // Animate text-content sliding in
    $('.text-content').each(function () {
        gsap.from(this, {
            opacity: 0,
            y: -20,
            duration: 0.5,
            ease: 'power2.out'
        });
    });

    // Animate Fade and Scale In without resetting rotation after delay
    setTimeout(() => {
        $('.text-box').each(function () {
            gsap.fromTo(this,
                { opacity: 0, scale: 0.8, transformOrigin: "50% 50%" },
                { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' }
            );
        });
    }, 1000);
}
// 1) Prevent default browser behavior for all drag/drop on the container
$(document).on('dragover drop', '#canvasContainer', function (e) {
    e.preventDefault();
});

// 2) Drop INTO .text-content: insert inline at the caret
$(document).on('drop', '.text-content', function (e) {
    e.preventDefault();

    const dt = e.originalEvent.dataTransfer;
    if (!dt.files.length) return;
    const file = Array.from(dt.files).find(f => f.type.startsWith('image/'));
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => insertImageAtCursor(evt.target.result);
    reader.readAsDataURL(file);
});

// 3) Drop ONTO canvas (outside text): create a new image box
// 3) Drop ON canvas ⇒ new image box
$(document).on('drop', '#canvasContainer', e => {
    e.preventDefault();

    // if we dropped *into* text-content, bail out
    if ($(e.target).closest('.text-content').length) return;


    const dt = e.originalEvent.dataTransfer;
    const file = Array.from(dt.files).find(f => f.type.startsWith('image/'));
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
        // key: always call createImageBox(url)
        createImageBox(evt.target.result);
    };
    reader.readAsDataURL(file);
});


// 4) Helper: insert an <img> at the caret inside .text-content
function insertImageAtCursor(dataUrl) {
    const sel = window.getSelection();
    if (!sel.rangeCount) return;

    const range = sel.getRangeAt(0);
    const img = document.createElement('img');
    img.src = dataUrl;
    img.style.maxWidth = '100%';
    img.style.display = 'block';

    range.deleteContents();
    range.insertNode(img);

    // move caret after the image
    range.setStartAfter(img);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
}
function wireUpDeleteAndRotate($box) {
    // Delete on click
    $box.find('.delete-handle').on('click', e => {
        e.stopPropagation();
        $box.remove();
    });

    // Rotate logic
    const $rotate = $box.find('.rotate-handle');
    let rotating = false, center = {};
    $rotate.on('mousedown', e => {
        e.preventDefault();
        rotating = true;
        const offs = $box.offset();
        center = {
            x: offs.left + $box.outerWidth() / 2,
            y: offs.top + $box.outerHeight() / 2
        };
        $(document).on('mousemove.rotate', ev => {
            if (!rotating) return;
            const angle = Math.atan2(ev.pageY - center.y, ev.pageX - center.x) * 180 / Math.PI;
            $box.css('transform', `rotate(${angle}deg)`);
        }).on('mouseup.rotate', () => {
            rotating = false;
            $(document).off('.rotate');
        });
    });
}


// Unified createImageBox: handles both raster images and SVG data-urls
function createImageBoxOLD1(imageSrc) {
  // 0) Deselect and teardown existing boxes
  $('.text-box').each(function () {
    const $old = $(this);
    $old.removeClass('selected');
    if ($old.data('ui-draggable')) $old.draggable('destroy');
    if ($old.data('ui-resizable')) $old.resizable('destroy');
    $old.find('.drag-handle, .rotate-handle, .delete-handle').remove();
    $old.find('.ui-resizable-handle').remove();
  });

  // 1) Create outer container
  const $box = $('<div class="text-box selected"></div>').appendTo('#canvasContainer');

  // 2) Insert content: either inline SVG or <img>
  if (imageSrc.startsWith('data:image/svg+xml')) {
    // Inline SVG path
    const rawBase64 = imageSrc.split(',')[1];
    const xmlStr    = atob(rawBase64).trim();
    const parser   = new DOMParser();
    const svgDoc   = parser.parseFromString(xmlStr, 'image/svg+xml');
    if (svgDoc.querySelector('parsererror')) {
      console.error('SVG parse error');
      return;
    }

    // Wrap in jQuery for convenience
      const $svg = $(svgDoc.documentElement);
      // ✅ Add this here:
      if (!$svg.attr('viewBox')) {
          const width = $svg.attr('width') || 100;  // fallback if missing
          const height = $svg.attr('height') || 100;
          $svg.attr('viewBox', `0 0 ${width} ${height}`);
      }

    // 2a) Append off-screen so computed styles are available
    $svg
      .css({ position: 'fixed', left: '-9999px', top: '-9999px', visibility: 'hidden' })
      .appendTo(document.body);

    // 2b) For each shape we *might* recolor, grab its computed fill
    $svg.find('circle, path, rect').each(function() {
      const realFill = window.getComputedStyle(this).fill;
      $(this)
        .attr('fill', realFill)  // inline the “true” fill
        .addClass('recolor');     // mark for later recolor
    });

    // 2c) Now remove any embedded <style> so no surprises
    $svg.find('style').remove();

    // 2d) Move into your visible canvas box
    const $clip = $('<div class="img-clip"></div>')
        .css({ width: '150px', height: 'auto', overflow: 'visible' })
      .appendTo($box);

    // Reset positioning and append
    $svg.css({ position: '', left: '', top: '', visibility: '', width: '100%', height: 'auto', display: 'block' });
    $clip.append($svg);

  } else {
    // Raster image path
    $('<img />')
      .attr('src', imageSrc)
      .css({ width: '150px', height: 'auto', pointerEvents: 'none' })
      .appendTo($box);
  }

  // 3) Add control handles
  $('<div class="drag-handle"><i class="fas fa-arrows-alt"></i></div>').appendTo($box);
  $('<div class="rotate-handle"></div>').appendTo($box);
  $('<div class="delete-handle"><i class="fas fa-trash"></i></div>').appendTo($box);

  // 4) Center the box
  const $cont = $('#canvasContainer');
  const left = ($cont.width() - $box.outerWidth()) / 2;
  const top  = ($cont.height() - $box.outerHeight()) / 2;
  $box.css({ position: 'absolute', left: `${left}px`, top: `${top}px`, transform: 'rotate(0deg)' });

  // 5) Initialize interactions
  makeBoxDraggableAndResizableImage($box);
  wireUpDeleteAndRotate($box);

  // 6) Click to select
  $box.on('mousedown', function (e) {
    e.stopPropagation();
    $('.text-box').removeClass('selected');
    $(this).addClass('selected');
    selectedBox = $(this);
  });
}
function createImageBox(imageSrc) {
    // 0) Deselect and teardown existing boxes
    $('.text-box').each(function () {
        const $old = $(this);
        $old.removeClass('selected');
        if ($old.data('ui-draggable')) $old.draggable('destroy');
        if ($old.data('ui-resizable')) $old.resizable('destroy');
        $old.find('.drag-handle, .rotate-handle, .delete-handle').remove();
        $old.find('.ui-resizable-handle').remove();
    });

    // 1) Create outer container
    const $box = $('<div class="text-box selected"></div>').appendTo('#canvasContainer');

    // ✅ Select the new box immediately (this fixes your color picker issue)
    $('.text-box').removeClass('selected');
    $box.addClass('selected');
    selectedBox = $box;

    let isImage = false;

    // 2) Insert content: either inline SVG or <img>
    if (imageSrc.startsWith('data:image/svg+xml')) {
        const rawBase64 = imageSrc.split(',')[1];
        const xmlStr = atob(rawBase64).trim();
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(xmlStr, 'image/svg+xml');
        if (svgDoc.querySelector('parsererror')) {
            console.error('SVG parse error');
            return;
        }

        const $svg = $(svgDoc.documentElement);

        // ✅ Ensure viewBox is present
        if (!$svg.attr('viewBox')) {
            const width = $svg.attr('width') || 100;
            const height = $svg.attr('height') || 100;
            $svg.attr('viewBox', `0 0 ${width} ${height}`);
        }

        // Append off-screen to capture computed fill
        $svg.css({ position: 'fixed', left: '-9999px', top: '-9999px', visibility: 'hidden' }).appendTo(document.body);

        $svg.find('circle, path, rect').each(function () {
            const realFill = window.getComputedStyle(this).fill;
            $(this).attr('fill', realFill).addClass('recolor');
        });

        $svg.find('style').remove();

        const $clip = $('<div class="img-clip"></div>')
            .css({ width: '150px', height: 'auto', overflow: 'visible' }) // overflow visible to allow proper scaling
            .appendTo($box);

        $svg.css({ position: '', left: '', top: '', visibility: '', width: '100%', height: 'auto', display: 'block' });
        $clip.append($svg);

        isImage = true; // mark as image/svg
    } else {
        // Raster image path
        $('<img />')
            .attr('src', imageSrc)
            .css({ width: '150px', height: 'auto', pointerEvents: 'none' })
            .appendTo($box);

        isImage = true; // mark as image
    }

    // 3) Add control handles
    $('<div class="drag-handle"><i class="fas fa-arrows-alt"></i></div>').appendTo($box);
    $('<div class="rotate-handle"></div>').appendTo($box);
    $('<div class="delete-handle"><i class="fas fa-trash"></i></div>').appendTo($box);

    // 4) Center the box
    const $cont = $('#canvasContainer');
    const left = ($cont.width() - $box.outerWidth()) / 2;
    const top = ($cont.height() - $box.outerHeight()) / 2;
    $box.css({ position: 'absolute', left: `${left}px`, top: `${top}px`, transform: 'rotate(0deg)' });

    // 5) Initialize interactions
    if (isImage) {
        makeBoxDraggableAndResizableImage($box);
    } else {
        makeBoxDraggableAndResizable($box);
    }

    wireUpDeleteAndRotate($box);

    // 6) Click to select (still needed for later selections)
    $box.on('mousedown', function (e) {
        e.stopPropagation();
        $('.text-box').removeClass('selected');
        $(this).addClass('selected');
        selectedBox = $(this);
    });
}

// Hook color picker to inline SVG elements on change only
$('#textColor').on('input', function () {
  if (!selectedBox) return;
  selectedBox.find('svg .recolor').attr('fill', $(this).val());
});


// Remove previous mouseenter/mouseleave hover logic (no hover coloring)




// clamp helper
function clamp(v, min, max) {
    return Math.min(Math.max(v, min), max);
}


function makeBoxDraggableAndResizableImageOLD($box) {
    const $canvas = $('#myCanvas');
    const rect = canvas.getBoundingClientRect();

    // 1) Get the canvas position relative to its offset parent (#canvasContainer)
    const canvasPos = $canvas.position();
    const cLeft = canvasPos.left;
    const cTop = canvasPos.top;

    // 2) Get the canvas size (CSS pixels)
    const cW = $canvas.width();
    const cH = $canvas.height();

    // 3) Measure the box itself
    const boxW = $box.outerWidth();
    const boxH = $box.outerHeight();

    // 4) Compute min/max for draggable
    const minX = cLeft;
    const minY = cTop;
    const maxX = cLeft + cW - boxW;
    const maxY = cTop + cH - boxH;

    // For jQuery UI draggable containment (viewport coords)
    const minX_d = rect.left;
    const minY_d = rect.top;
    const maxX_d = rect.left + rect.width - boxW;
    const maxY_d = rect.top + rect.height - boxH;
    const $img = $box.find('img');

    // ✅ Key: Ensure the image does NOT trigger drag events
    $img.css('pointer-events', 'none');
    // Draggable - same as text
    $box.draggable({
        handle: '.drag-handle',

        containment: [minX_d, minY_d, maxX_d, maxY_d]
    });

    // Resizable - same as text
    $box.resizable({
        handles: 'n,e,s,w,ne,se,sw,nw',
        resize(event, ui) {
            // Clamp position (prevent dragging outside)
            ui.position.left = Math.min(Math.max(ui.position.left, minX), maxX);
            ui.position.top = Math.min(Math.max(ui.position.top, minY), maxY);

            // Clamp size so it doesn't exceed canvas
            ui.size.width = Math.min(ui.size.width, cW - (ui.position.left - cLeft));
            ui.size.height = Math.min(ui.size.height, cH - (ui.position.top - cTop));

            // Minimum size limit for image
            const minWidth = 50;
            const minHeight = 50;
            if (ui.size.width < minWidth) ui.size.width = minWidth;
            if (ui.size.height < minHeight) ui.size.height = minHeight;

            // Apply scaling to image
            const $img = ui.element.find('img');
            $img.css({
                width: ui.size.width + 'px',
                height: ui.size.height + 'px'
            });
        }
    });
}


function makeBoxDraggableAndResizableImage($box) {
    const $canvas = $('#myCanvas');
    const rect = $canvas[0].getBoundingClientRect();

    const canvasPos = $canvas.position();
    const cLeft = canvasPos.left;
    const cTop = canvasPos.top;

    const cW = $canvas.width();
    const cH = $canvas.height();

    const boxW = $box.outerWidth();
    const boxH = $box.outerHeight();

    const minX = cLeft;
    const minY = cTop;
    const maxX = cLeft + cW - boxW;
    const maxY = cTop + cH - boxH;

    const minX_d = rect.left;
    const minY_d = rect.top;
    const maxX_d = rect.left + rect.width - boxW;
    const maxY_d = rect.top + rect.height - boxH;

    const $img = $box.find('img');
    const $svg = $box.find('svg');

    // Disable drag events on image/SVG directly
    $img.css('pointer-events', 'none');
    $svg.css('pointer-events', 'none');

    $box.draggable({
        handle: '.drag-handle',
        containment: [minX_d, minY_d, maxX_d, maxY_d]
    });

    $box.resizable({
        handles: 'n,e,s,w,ne,se,sw,nw',
        resize(event, ui) {
            // Clamp position
            ui.position.left = Math.min(Math.max(ui.position.left, minX), maxX);
            ui.position.top = Math.min(Math.max(ui.position.top, minY), maxY);

            // Clamp size within canvas
            ui.size.width = Math.min(ui.size.width, cW - (ui.position.left - cLeft));
            ui.size.height = Math.min(ui.size.height, cH - (ui.position.top - cTop));

            // Minimum size
            const minWidth = 50;
            const minHeight = 50;
            if (ui.size.width < minWidth) ui.size.width = minWidth;
            if (ui.size.height < minHeight) ui.size.height = minHeight;

            // Resize image
            if ($img.length) {
                $img.css({
                    width: ui.size.width + 'px',
                    height: ui.size.height + 'px'
                });
            }

            // Resize SVG (important)
            if ($svg.length) {
                $svg.css({
                    width: ui.size.width + 'px',
                    height: ui.size.height + 'px'
                });
            }
        }
    });
}



function teardownSelection() {
    $('.text-box.selected, .image-box.selected').each(function () {
        const $o = $(this);
        $o.removeClass('selected')
            .draggable('destroy')
            .resizable('destroy')
            .find('.drag-handle, .rotate-handle, .delete-handle').remove()
            .end().find('.ui-resizable-handle').remove();
    });
}

function wireUpRotate($box) {
    const $rotate = $box.find('.rotate-handle');
    let rotating = false, center = {};
    $rotate.on('mousedown', e => {
        e.preventDefault();
        rotating = true;
        const offs = $box.offset();
        center = {
            x: offs.left + $box.outerWidth() / 2,
            y: offs.top + $box.outerHeight() / 2
        };
        $(document).on('mousemove.rotate', ev => {
            if (!rotating) return;
            const angle = Math.atan2(ev.pageY - center.y, ev.pageX - center.x) * 180 / Math.PI;
            $box.css('transform', `rotate(${angle}deg)`);
        }).on('mouseup.rotate', () => {
            rotating = false;
            $(document).off('.rotate');
        });
    });
}
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