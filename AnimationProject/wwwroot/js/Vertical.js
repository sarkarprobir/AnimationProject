let savedSelection = null;
let selectedBox = null;
let boxCounter = 1;



$(document).on('mousedown', function (e) {
    if ($(e.target).closest('.text-box').length) return;

    // If the clicked target is inside any control buttons, don't deselect
    if ($(e.target).closest('#fontSize, #textColor, #fontFamily, #boldBtn, #italicBtn, #underlineBtn, #caseToggleBtn, #alignBtn, #lineHeight,#DLineSpacing,#ILineSpacing,#casingBtn, .fontFamBtn, #rotation_tool').length) return;
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
    /*const $drag = $('<div class="drag-handle"><i class="fas fa-arrows-alt"></i></div>').appendTo($clicked);*/
    const $rotate = $('<div class="rotate-handle"></div>').appendTo($clicked);
   /* const $del = $('<div class="delete-handle"><i class="fas fa-trash"></i></div>').appendTo($clicked);*/

    
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
    //$del.on('click', function (ev) {
    //    ev.stopPropagation();
    //    $clicked.remove();
    //    selectedBox = null;
    //});

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
function ChangeColorNew() {
    const colorPicker = document.getElementById("textColor");
    const color = colorPicker.value;
    applyStyleValue('foreColor', 'color', color);
}
//$('#fontSize').on('input', function () {
//    const size = parseInt($(this).val());
//    applyFontSize(size);
//});
//function ChangeFontSize() {
//    const size_input = document.getElementById("fontSize");
//    const size = size_input.value;
//    applyFontSize(size);

//}
function ChangeFontSize() {
    const sizeInput = document.getElementById("fontSize");
    if (!sizeInput || !selectedBox) return;

    const size = sizeInput.value || "24px";  // Default to 24px
    applyFontSize(size);
}


// ✅ Text Color
//$('#textColor').on('input', function () {
//    const color = $(this).val();
//    applyStyleValue('foreColor', 'color', color);
//});


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

//$('#fontFamily').on('change', function () {
//    const family = $(this).val();
//    applyStyleValue('fontName', 'font-family', family);
//});

function OnChangefontFamily(family) {
    const $selectedBox = $('.text-box.selected');
    if (!$selectedBox) return;

    applyStyleValue('fontName', 'font-family', family);
}


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
//$('#boldBtn').on('click', function (e) {
//    e.preventDefault(); // don't steal focus
//    applyStyleCommand('bold', 'font-weight', 'bold');
//});
function toggleBold(e) {
    if (e) e.preventDefault();

    // Apply bold command
    applyStyleCommand('bold', 'font-weight', 'bold');

    // Check if the selected text is now bold
    const isBold = document.queryCommandState('bold');

    // Toggle class based on bold state
    const btn = document.querySelector('.text_decoration');
    if (btn) {
        btn.classList.toggle('active', isBold);
    }
}




//$('#italicBtn').on('click', function (e) {
//    e.preventDefault(); // don't steal focus
//    applyStyleCommand('italic', 'font-style', 'italic');
//});
function toggleItalic(e) {
    if (e) e.preventDefault();

    // Apply italic style
    applyStyleCommand('italic', 'font-style', 'italic');

    // Check if the current selection is italic
    const isItalic = document.queryCommandState('italic');

    //// Toggle .active class on the italic button
    //const btn = document.querySelector('.text_decoration.italic');
    //if (btn) {
    //    btn.classList.toggle('active', isItalic);
    //}
}


//$('#underlineBtn').on('click', function (e) {
//    e.preventDefault(); // don't steal focus
//    applyStyleCommand('underline', 'text-decoration', 'underline');
//});
function toggleUnderline(e) {
    if (e) e.preventDefault();

    // Apply underline command
    applyStyleCommand('underline', 'text-decoration', 'underline');

    // Check if the selection is underlined
    const isUnderlined = document.queryCommandState('underline');

    //// Toggle .active class on the underline button
    //const btn = document.querySelector('.text_decoration.underline');
    //if (btn) {
    //    btn.classList.toggle('active', isUnderlined);
    //}
}


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



//$('#caseToggleBtn').on('click', function (e) {
//    e.preventDefault();
//    if (!selectedBox) return;

//    selectedBox[0].focus();

//    const sel = window.getSelection();
//    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;

//    const range = sel.getRangeAt(0);
//    const selectedText = range.toString();
//    if (!selectedText.trim()) return;

//    const isUpper = selectedText === selectedText.toUpperCase();
//    const toggledText = isUpper ? selectedText.toLowerCase() : selectedText.toUpperCase();

//    // Preserve formatting by inserting span with toggled content
//    const span = document.createElement('span');
//    span.textContent = toggledText;

//    range.deleteContents();
//    range.insertNode(span);

//    // Reselect toggled text
//    const newRange = document.createRange();
//    newRange.setStart(span.firstChild, 0);
//    newRange.setEnd(span.firstChild, toggledText.length);

//    sel.removeAllRanges();
//    sel.addRange(newRange);

//    // Save selection for future reuse (optional)
//    savedSelection = newRange.cloneRange();
//});

function toggleCase(e) {
    if (e) e.preventDefault();
    const $selectedBox = $('.text-box.selected');
    if (!$selectedBox) return;


    selectedBox[0].focus();

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;

    const range = sel.getRangeAt(0);
    const selectedText = range.toString();
    if (!selectedText.trim()) return;

    const isUpper = selectedText === selectedText.toUpperCase();
    const toggledText = isUpper ? selectedText.toLowerCase() : selectedText.toUpperCase();

    // Create span to preserve formatting
    const span = document.createElement('span');
    span.textContent = toggledText;

    // Replace selected text
    range.deleteContents();
    range.insertNode(span);

    // Reselect new text
    const newRange = document.createRange();
    newRange.setStart(span.firstChild, 0);
    newRange.setEnd(span.firstChild, toggledText.length);

    sel.removeAllRanges();
    sel.addRange(newRange);

    // Save for reuse if needed
    savedSelection = newRange.cloneRange();

//    // OPTIONAL: Toggle active class if you want visual feedback
//    const btn = document.querySelector('.text_decoration.case-toggle');
//    if (btn) {
//        btn.classList.toggle('active', !isUpper);  // active if now uppercase
//    }
}





// Text Alignment (toggle between left, center, right, justify)
//const alignments = ['left', 'center', 'right', 'justify'];
//let alignIndex = 0;

//$('#alignBtn').on('click', function () {
//    if (selectedBox) {
//        alignIndex = (alignIndex + 1) % alignments.length;
//        const align = alignments[alignIndex];
//        selectedBox.css('text-align', align);

//        const iconMap = {
//            left: 'fa-align-left',
//            center: 'fa-align-center',
//            right: 'fa-align-right',
//            justify: 'fa-align-justify'
//        };
//        //$('#caseToggleBtn').on('click', function (e) {
//        //    e.preventDefault();
//        //    if (!selectedBox) return;

//        //    selectedBox[0].focus();
//        //    restoreSelection();

//        //    const sel = window.getSelection();
//        //    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;

//        //    const range = sel.getRangeAt(0);
//        //    const selectedText = range.toString();
//        //    const isUpper = selectedText === selectedText.toUpperCase();
//        //    const toggledText = isUpper ? selectedText.toLowerCase() : selectedText.toUpperCase();

//        //    // Create text node with toggled text
//        //    const toggledNode = document.createTextNode(toggledText);

//        //    // Replace original text with toggled version
//        //    range.deleteContents();
//        //    range.insertNode(toggledNode);

//        //    // 🔁 Rebuild the new selection range on the newly inserted text
//        //    const newRange = document.createRange();
//        //    newRange.setStart(toggledNode, 0);
//        //    newRange.setEnd(toggledNode, toggledText.length);

//        //    sel.removeAllRanges();
//        //    sel.addRange(newRange);

//        //    // ✅ Now save the NEW selection properly
//        //    savedSelection = newRange.cloneRange();
//        //});

//        const $icon = $(this).find('i');
//        $icon.removeClass().addClass(`fas ${iconMap[align]}`);
//    }
//});

const alignments = ['left', 'center', 'right', 'justify'];
let alignIndex = 0;

function toggleAlignment(e, btn) {
    if (e) e.preventDefault();
    const $selectedBox = $('.text-box.selected');
    if (!$selectedBox) return;

    alignIndex = (alignIndex + 1) % alignments.length;
    const align = alignments[alignIndex];
    selectedBox.css('text-align', align);

    const iconMap = {
        left: 'fa-align-left',
        center: 'fa-align-center',
        right: 'fa-align-right',
        justify: 'fa-align-justify'
    };

    const $icon = $(btn).find('i');
    $icon.removeClass().addClass(`fas ${iconMap[align]}`);
}


// Line Height
//$('#lineHeight').on('input', function () {
//    debugger;
//    if (!selectedBox) return;

//    const multiplier = parseFloat($(this).val());
//    selectedBox.css('line-height', multiplier);

//    // Adjust the height based on the inner text content
//    const $content = selectedBox.find('.text-content');

//    // Always reset first to auto, to allow shrink
//    selectedBox.css('height', 'auto');

//    // Calculate actual required height
//    const neededHeight = $content[0].scrollHeight + 10; // Add small padding

//    // Apply the new height
//    selectedBox.css('height', neededHeight + 'px');
//});


let currentLineHeight = 1.2;

function addLineSpacing(delta) {
    const $selectedBox = $('.text-box.selected');
    if (!$selectedBox) return;

    currentLineHeight = parseFloat(currentLineHeight) || 1.2;
    currentLineHeight = delta < 0
        ? Math.max(0.2, currentLineHeight + delta)
        : currentLineHeight + delta;

    $selectedBox.css('line-height', currentLineHeight);

    const $content = $selectedBox.find('.text-content');
    $selectedBox.css('height', 'auto');

    const neededHeight = $content[0].scrollHeight + 10;
    $selectedBox.css('height', neededHeight + 'px');
}
//function addLineSpacing2(delta) {
//  const $box = $('.text-box.selected');
//  if (!$box.length) return;                      // no box is selected
 
//  // read its current line-height if you like:
//  const lh = parseFloat($box.find('.text-content').css('line-height')) || 1.2;
//  const newLH = delta < 0
//    ? Math.max(0.2, lh + delta)
//    : lh + delta;
 
//  // apply the new value
//  $box.css('line-height', newLH);
 
//  // resize to fit
//  const $content = $box.find('.text-content');
//  $box.css('height', 'auto');
//  const neededHeight = $content[0].scrollHeight + 10;
//  $box.css('height', neededHeight + 'px');
//}


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

// Final Solution Based on Your Exact Requirements

function makeBoxDraggableAndResizable($box) {
    const $canvas = $('#myCanvas');
    const rect = $canvas[0].getBoundingClientRect();
    const canvasPos = $canvas.position();

    const cLeft = canvasPos.left;
    const cTop = canvasPos.top;
    const cW = $canvas.width();
    const cH = $canvas.height();

    const minX_d = rect.left;
    const minY_d = rect.top;
    const maxX_d = rect.left + rect.width;
    const maxY_d = rect.top + rect.height;

    const $text = $box.find('.text-content');

    //$box.draggable({
    //    handle: '.drag-handle',
    //    containment: [minX_d, minY_d, maxX_d - $box.outerWidth(), maxY_d - $box.outerHeight()]
    //});
    $box
        .draggable({
            containment: [minX_d, minY_d, maxX_d - $box.outerWidth(), maxY_d - $box.outerHeight()],
            cancel: '.text-content', 
           /* handle: '.text-box',*/
           /* distance: 10,    */// ← only start dragging after 10px of movement
            // delay: 100,   // ← or you can add a small delay instead
            start: function () {
                $('.text-box').removeClass('selected');
                $box.addClass('selected');
                $('body').addClass('disable-select');
            },
            stop: function () {
                $('body').removeClass('disable-select');
            }
        })

    $box.resizable({
        handles: 'e,w,ne,se,sw,nw',
        minWidth: 20,
        minHeight: 20,

        start(event, ui) {
            $box.data('resizeData', {
                startWidth: ui.size.width,
                startFontSize: parseFloat($text.css('font-size'))
            });
        },

        resize(event, ui) {
            // Clamp within canvas
            const canvasPos2 = $canvas.position();
            const maxAllowedWidth = cW - (ui.position.left - cLeft);
            const maxAllowedHeight = cH - (ui.position.top - cTop);

            ui.size.width = Math.min(ui.size.width, maxAllowedWidth);
            ui.size.height = Math.min(ui.size.height, maxAllowedHeight);

            const inst = ui.element.resizable('instance') || ui.element.data('ui-resizable');
            const axis = inst && inst.axis;
            const resizeData = $box.data('resizeData');

            if (axis && ['ne', 'nw', 'se', 'sw'].includes(axis)) {
                // Corner handles: always scale font size
                const widthScale = ui.size.width / resizeData.startWidth;
                const newFontSize = Math.max(8, resizeData.startFontSize * widthScale);

                $text.css({
                    'font-size': newFontSize + 'px',
                    'white-space': 'pre-wrap',     // ← preserve your breaks, still wrap long lines
                    'word-break': 'break-word',    // ← break long words if they exceed box
                    'overflow-wrap': 'break-word',

                    //'word-break': 'normal',
                    //'overflow-wrap': 'normal',
                    'overflow': 'hidden'
                });

                $box.css({
                    width: ui.size.width + 'px',
                    height: 'auto'
                });

                const requiredHeight = $text[0].scrollHeight + 10;
                const maxPossibleHeight = cH - (ui.position.top - cTop);
                $box.css('height', Math.min(requiredHeight, maxPossibleHeight) + 'px');

            } else if (axis && ['e', 'w'].includes(axis)) {
                // Side handles: box resize only, font unchanged
                $text.css({
                    'white-space': 'normal',
                    'overflow': 'visible',
                    'text-overflow': 'clip'
                });

                $box.css('height', 'auto');
                const requiredHeight = $text[0].scrollHeight + 10;
                const maxPossibleHeight = cH - (ui.position.top - cTop);
                $box.css('height', Math.min(requiredHeight, maxPossibleHeight) + 'px');
            }
        }
    });
   
}





function makeBoxDraggableAndResizableFInal($box) {
    const $canvas = $('#myCanvas');
    const rect = $canvas[0].getBoundingClientRect();

    const canvasPos = $canvas.position();
    const cLeft = canvasPos.left;
    const cTop = canvasPos.top;

    const cW = $canvas.width();
    const cH = $canvas.height();

    const minX_d = rect.left;
    const minY_d = rect.top;
    const maxX_d = rect.left + rect.width;
    const maxY_d = rect.top + rect.height;

    const $text = $box.find('.text-content');

    $box.draggable({
        handle: '.drag-handle',
        containment: [minX_d, minY_d, maxX_d - $box.outerWidth(), maxY_d - $box.outerHeight()]
    });

    $box.resizable({
        handles: 'e,w,ne,se,sw,nw',
        minWidth: 20,
        minHeight: 20,
        start(event, ui) {
            $box.data('resizeData', {
                startWidth: ui.size.width,
                startHeight: ui.size.height,
                startFontSize: parseFloat($text.css('font-size'))
            });
        },
        resize(event, ui) {
            const resizeData = $box.data('resizeData');

            const maxAllowedWidth = cW - (ui.position.left - cLeft);
            const maxAllowedHeight = cH - (ui.position.top - cTop);

            ui.size.width = Math.min(ui.size.width, maxAllowedWidth);
            ui.size.height = Math.min(ui.size.height, maxAllowedHeight);

            const inst = ui.element.resizable('instance') || ui.element.data('ui-resizable');
            const axis = inst && inst.axis;

            if (axis && ['ne', 'nw', 'se', 'sw'].includes(axis)) {
                // 🔥 Corner resize: scale font proportionally, NO wrapping
                const widthScale = ui.size.width / resizeData.startWidth;
                const heightScale = ui.size.height / resizeData.startHeight;
                const scale = Math.min(widthScale, heightScale);

                const newFontSize = Math.max(8, resizeData.startFontSize * scale);
                $text.css({
                    'font-size': newFontSize + 'px',
                    'white-space': 'pre', // ❗ prevent wrapping but respect line breaks
                    'word-break': 'keep-all', // ❗ prevent breaking long words
                    'overflow-wrap': 'normal'
                });

                // 🔒 Prevent the box from becoming smaller than the widest text line
                let maxLineWidth = 0;
                const lines = $text.text().split('\n');
                const tempSpan = $('<span></span>').css({
                    'font-size': newFontSize + 'px',
                    'position': 'absolute',
                    'visibility': 'hidden',
                    'white-space': 'pre'
                }).appendTo('body');

                lines.forEach(line => {
                    tempSpan.text(line);
                    maxLineWidth = Math.max(maxLineWidth, tempSpan[0].offsetWidth);
                });

                tempSpan.remove();

                const minRequiredWidth = maxLineWidth + 10; // padding
                if (ui.size.width < minRequiredWidth) {
                    ui.size.width = minRequiredWidth;
                }

                // 🔒 Prevent exceeding canvas width
                if (ui.position.left + ui.size.width > cLeft + cW) {
                    ui.size.width = (cLeft + cW) - ui.position.left;
                }

                $box.css('width', ui.size.width + 'px');
                $box.css('height', 'auto');

                const requiredHeight = $text[0].scrollHeight + 10;
                const maxPossibleHeight = cH - (ui.position.top - cTop);
                $box.css('height', Math.min(requiredHeight, maxPossibleHeight) + 'px');
            } else if (axis && ['e', 'w'].includes(axis)) {
                // 🔥 Side resize: font-size fixed, allow wrapping
                $text.css({
                    'white-space': 'normal',
                    'word-break': '',
                    'overflow-wrap': ''
                });

                $box.css('height', 'auto');
                const requiredHeight = $text[0].scrollHeight + 10;
                const maxPossibleHeight = cH - (ui.position.top - cTop);
                $box.css('height', Math.min(requiredHeight, maxPossibleHeight) + 'px');
            }
        }
    });
}











function makeBoxDraggableAndResizableNEWOLD($box) {
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
        .attr('id', 'box-' + boxCounter) // Set unique ID like box-1, box-2, etc.
        .appendTo('#canvasContainer');
    boxCounter++; // Increment for the next box
    // 2) Create inner editable area
    const $content = $('<div class="text-content" contenteditable="true">Default Text</div>')
        .appendTo($box);

    // 3) Append your custom handles
   /* const $drag = $('<div class="drag-handle"><i class="fas fa-arrows-alt"></i></div>').appendTo($box);*/
    const $rotate = $('<div class="rotate-handle"></div>').appendTo($box);
    //const $del = $('<div class="delete-handle"><i class="fas fa-trash"></i></div>').appendTo($box);

    // 4) Position in center of container
    const $cont = $('#canvasContainer');
    const left = ($cont.width() - $box.outerWidth()) / 2;
    const top = ($cont.height() - $box.outerHeight()) / 2;
    $box.css({ position: 'absolute', left: `${left}px`, top: `${top}px`, transform: 'rotate(0deg)' });

    // 5) **Only once**: make it draggable/resizable using the canvas‐based containment
    makeBoxDraggableAndResizable($box);
    $box.on('contextmenu', function (e) {
        e.preventDefault();
        // remove any old menu
        $('.custom-ctx-menu').remove();

        // build menu
        const $menu = $(`
    <ul class="custom-ctx-menu">
      <li class="ctx-delete">Delete</li>
    </ul>
  `).appendTo('body');

        // position it
        $menu.css({
            top: e.pageY + 'px',
            left: e.pageX + 'px'
        });

        // click handler
        $menu.on('click', '.ctx-delete', () => {
            $box.remove();
            $menu.remove();
        });

        // hide if you click elsewhere
        $(document).one('click', () => $menu.remove());
    });


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
    //$del.on('click', e => {
    //    e.stopPropagation();
    //    $box.remove();
    //});


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

function Animate21() {
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
function Animate22() {
    const tl = gsap.timeline();
    tl.from(".text-box", { opacity: 0, scale: 0.8, duration: 0.5 });
    tl.to(".text-box", { scale: 1.05, duration: 0.3, yoyo: true, repeat: 1 });
    tl.from(".text-content", { y: -20, opacity: 0, duration: 0.4 }, "-=0.3");
    tl.to(".text-box", { clipPath: "inset(0% 0% 0% 0%)", duration: 0.6 }, "+=0.2");

}
// 1) Bounce In
function AnimateBounce() {
    // Animate text-content bouncing in
    $('.text-content').each(function () {
        gsap.fromTo(this,
            { opacity: 0, scale: 0.5, transformOrigin: "50% 50%" },
            { opacity: 1, scale: 1, duration: 0.6, ease: 'bounce.out' }
        );
    });

    // Animate text-box bouncing in after delay
    setTimeout(() => {
        $('.text-box').each(function () {
            gsap.fromTo(this,
                { opacity: 0, scale: 0.5, transformOrigin: "50% 50%" },
                { opacity: 1, scale: 1, duration: 0.6, ease: 'bounce.out' }
            );
        });
    }, 1000);
}

// 2) Flip In 3D
function AnimateFlip3D() {
    // Animate text-content flipping in on Y axis
    $('.text-content').each(function () {
        gsap.from(this, {
            opacity: 0,
            rotationY: 90,
            transformPerspective: 600,
            duration: 0.6,
            ease: 'power2.out'
        });
    });

    // Animate text-box flipping in on Y axis after delay
    setTimeout(() => {
        $('.text-box').each(function () {
            gsap.from(this, {
                opacity: 0,
                rotationY: 90,
                transformPerspective: 600,
                duration: 0.6,
                ease: 'power2.out'
            });
        });
    }, 1000);
}

// 3) Skew & Stretch
function AnimateSkewStretch() {
    // Animate text-content skewing & stretching in
    $('.text-content').each(function () {
        gsap.fromTo(this,
            { opacity: 0, skewX: 20, scaleY: 0.8 },
            { opacity: 1, skewX: 0, scaleY: 1, duration: 0.5, ease: 'back.out(1.7)' }
        );
    });

    // Animate text-box skewing & stretching in after delay
    setTimeout(() => {
        $('.text-box').each(function () {
            gsap.fromTo(this,
                { opacity: 0, skewX: 20, scaleY: 0.8 },
                { opacity: 1, skewX: 0, scaleY: 1, duration: 0.5, ease: 'back.out(1.7)' }
            );
        });
    }, 1000);
}

// 4) Staggered Entrance
function Animate122() {
    // Animate text-content sliding up in stagger
    gsap.from('.text-content', {
        opacity: 0,
        y: 30,
        duration: 0.5,
        ease: 'power2.out',
        stagger: 0.2
    });

    //// Animate text-box sliding up in stagger after delay
    //setTimeout(() => {
    //    gsap.from('.text-box', {
    //        opacity: 0,
    //        y: 30,
    //        duration: 0.5,
    //        ease: 'power2.out',
    //        stagger: 0.2
    //    });
    //}, 1000);
}
function Animate2ALl(direction) {
    // parse your timing inputs (in seconds)
    const inTime = parseFloat(selectedInSpeed) || 4;
    const stayTime = parseFloat(selectedStaySpeed) || 3;
    const outTime = parseFloat(selectedOutSpeed) || 4;

    // grab canvas dimensions
    const $canvas = $('#myCanvas');
    const cw = $canvas.width();
    const ch = $canvas.height();

    // figure out our start (off‑screen) and end (on‑screen) offsets
    let fromVars = { opacity: 0 },
        toVars = { opacity: 1 },
        outVars = { opacity: 0 };

    switch (direction) {
        case "top":
            fromVars.y = -ch;      // start above
            toVars.y = 0;        // end at normal y
            outVars.y = -ch;      // exit back up
            break;
        case "bottom":
            fromVars.y = ch;       // start below
            toVars.y = 0;
            outVars.y = ch;       // exit back down
            break;
        case "left":
            fromVars.x = -cw;      // start left of screen
            toVars.x = 0;
            outVars.x = -cw;      // exit left
            break;
        case "right":
            fromVars.x = cw;       // start right of screen
            toVars.x = 0;
            outVars.x = cw;       // exit right
            break;
        default:
            fromVars.x = cw;
            toVars.x = 0;
            outVars.x = cw;
    }

    // build a timeline: in → stay → out
    const tl = gsap.timeline();

    // 1) bring in
    tl.from('.text-content', {
        ...fromVars,
        duration: inTime,
        ease: 'power2.out',
        stagger: 0.2
    });

    // 2) optional stay (just hold final state)
    tl.to('.text-content', {
        // no change, just a delay
        duration: stayTime
    });

    // 3) move out
    tl.to('.text-content', {
        ...outVars,
        duration: outTime,
        ease: 'power2.in'
    });
}


// 5) Pulse / Heartbeat
function AnimatePulse() {
    // Animate a quick pulse on text-content
    $('.text-content').each(function () {
        gsap.to(this, {
            scale: 1.05,
            repeat: 1,
            yoyo: true,
            duration: 0.3,
            ease: 'power1.inOut'
        });
    });

    // Animate a quick pulse on text-box after delay
    setTimeout(() => {
        $('.text-box').each(function () {
            gsap.to(this, {
                scale: 1.05,
                repeat: 1,
                yoyo: true,
                duration: 0.3,
                ease: 'power1.inOut'
            });
        });
    }, 1000);
}

// 6) Color Glow / Tint
function AnimateColorGlow() {
    // Animate text-content background tint
    $('.text-content').each(function () {
        gsap.fromTo(this,
            { backgroundColor: '#ffffff' },
            { backgroundColor: '#ffeb3b', duration: 0.8, ease: 'power1.inOut' }
        );
    });

    // Animate text-box background tint after delay
    setTimeout(() => {
        $('.text-box').each(function () {
            gsap.fromTo(this,
                { backgroundColor: '#ffffff' },
                { backgroundColor: '#ffeb3b', duration: 0.8, ease: 'power1.inOut' }
            );
        });
    }, 1000);
}

// 7) Mask / Clip‑Path Reveal
function AnimateMaskReveal() {
    // Animate text-content with clip-path reveal
    $('.text-content').each(function () {
        gsap.from(this, {
            clipPath: 'inset(0% 100% 0% 0%)',
            duration: 0.6,
            ease: 'power2.out'
        });
    });

    // Animate text-box with clip-path reveal after delay
    setTimeout(() => {
        $('.text-box').each(function () {
            gsap.from(this, {
                clipPath: 'inset(0% 100% 0% 0%)',
                duration: 0.6,
                ease: 'power2.out'
            });
        });
    }, 1000);
}

// 8) Text‑Scramble / Flicker (requires GSAP TextPlugin)
function AnimateTextScramble() {
    // Animate text-content scramble
    $('.text-content').each(function () {
        gsap.to(this, {
            text: { value: $(this).text(), scrambleText: true },
            duration: 1.2,
            ease: 'none'
        });
    });

    // Animate text-box scramble after delay
    setTimeout(() => {
        $('.text-box').each(function () {
            gsap.to(this, {
                text: { value: $(this).text(), scrambleText: true },
                duration: 1.2,
                ease: 'none'
            });
        });
    }, 1000);
}
// 9) Wobble In
function AnimateWobble() {
    // text-content wobbles (rotates back‑and‑forth)
    $('.text-content').each(function () {
        gsap.fromTo(this,
            { rotationZ: -10 },
            { rotationZ: 10, duration: 0.15, yoyo: true, repeat: 5, ease: 'sine.inOut', transformOrigin: '50% 50%' }
        );
    });

    // text-box wobble after delay
    setTimeout(() => {
        $('.text-box').each(function () {
            gsap.fromTo(this,
                { rotationZ: -10 },
                { rotationZ: 10, duration: 0.15, yoyo: true, repeat: 5, ease: 'sine.inOut', transformOrigin: '50% 50%' }
            );
        });
    }, 1000);
}

// 10) Shake In
function AnimateShake() {
    // text-content shakes horizontally
    $('.text-content').each(function () {
        gsap.fromTo(this,
            { x: -10 },
            { x: 10, duration: 0.1, yoyo: true, repeat: 8, ease: 'power1.inOut' }
        );
    });

    // text-box shake after delay
    setTimeout(() => {
        $('.text-box').each(function () {
            gsap.fromTo(this,
                { x: -10 },
                { x: 10, duration: 0.1, yoyo: true, repeat: 8, ease: 'power1.inOut' }
            );
        });
    }, 1000);
}

// 11) Spin In
function AnimateSpin() {
    // text-content spins 360°
    $('.text-content').each(function () {
        gsap.from(this, {
            opacity: 0,
            rotation: 360,
            duration: 0.6,
            ease: 'power2.out',
            transformOrigin: '50% 50%'
        });
    });

    // text-box spin after delay
    setTimeout(() => {
        $('.text-box').each(function () {
            gsap.from(this, {
                opacity: 0,
                rotation: 360,
                duration: 0.6,
                ease: 'power2.out',
                transformOrigin: '50% 50%'
            });
        });
    }, 1000);
}

// 12) Blur‑to‑Clear
function AnimateBlurIn() {
    // text-content fades in from blur
    $('.text-content').each(function () {
        gsap.fromTo(this,
            { opacity: 0, filter: 'blur(10px)' },
            { opacity: 1, filter: 'blur(0px)', duration: 0.8, ease: 'power2.out' }
        );
    });

    // text-box blur‑to‑clear after delay
    setTimeout(() => {
        $('.text-box').each(function () {
            gsap.fromTo(this,
                { opacity: 0, filter: 'blur(10px)' },
                { opacity: 1, filter: 'blur(0px)', duration: 0.8, ease: 'power2.out' }
            );
        });
    }, 1000);
}

// 13) Path Motion In
function AnimatePathMotion() {
    // text-content moves along a curved path
    $('.text-content').each(function () {
        gsap.from(this, {
            opacity: 0,
            motionPath: {
                path: [
                    { x: -100, y: -50 },
                    { x: 20, y: 0 },
                    { x: 0, y: 0 }
                ],
                curviness: 1.5
            },
            duration: 1,
            ease: 'power2.out'
        });
    });

    // text-box path motion after delay
    setTimeout(() => {
        $('.text-box').each(function () {
            gsap.from(this, {
                opacity: 0,
                motionPath: {
                    path: [
                        { x: -200, y: -100 },
                        { x: 20, y: 0 },
                        { x: 0, y: 0 }
                    ],
                    curviness: 1.5
                },
                duration: 1,
                ease: 'power2.out'
            });
        });
    }, 1000);
}
// 14) Roll In
function AnimateRollIn() {
    // text-content rolls in from the left
    $('.text-content').each(function () {
        gsap.from(this, {
            opacity: 0,
            x: -100,
            rotation: -90,
            transformOrigin: '0% 50%',
            duration: 0.6,
            ease: 'power2.out'
        });
    });

    // text-box rolls in after delay
    setTimeout(() => {
        $('.text-box').each(function () {
            gsap.from(this, {
                opacity: 0,
                x: -100,
                rotation: -90,
                transformOrigin: '0% 50%',
                duration: 0.6,
                ease: 'power2.out'
            });
        });
    }, 1000);
}

// 15) Swing In
function AnimateSwingIn() {
    // text-content swings down from top
    $('.text-content').each(function () {
        gsap.from(this, {
            opacity: 0,
            rotationX: -90,
            transformOrigin: '50% 0%',
            duration: 0.6,
            ease: 'back.out(1.2)'
        });
    });

    // text-box swings in after delay
    setTimeout(() => {
        $('.text-box').each(function () {
            gsap.from(this, {
                opacity: 0,
                rotationX: -90,
                transformOrigin: '50% 0%',
                duration: 0.6,
                ease: 'back.out(1.2)'
            });
        });
    }, 1000);
}

// 16) Curtain Reveal
function AnimateCurtain() {
    // text-content “curtain” opens vertically
    $('.text-content').each(function () {
        gsap.from(this, {
            opacity: 0,
            scaleY: 0,
            transformOrigin: '50% 0%',
            duration: 0.6,
            ease: 'power2.out'
        });
    });

    // text-box curtain after delay
    setTimeout(() => {
        $('.text-box').each(function () {
            gsap.from(this, {
                opacity: 0,
                scaleY: 0,
                transformOrigin: '50% 0%',
                duration: 0.6,
                ease: 'power2.out'
            });
        });
    }, 1000);
}

// 17) Ripple In
function AnimateRippleIn() {
    // text-content expands with a subtle ripple
    $('.text-content').each(function () {
        gsap.fromTo(this,
            { opacity: 0, scale: 0.8 },
            { opacity: 1, scale: 1.05, duration: 0.4, ease: 'power1.out', yoyo: true, repeat: 1 }
        );
    });

    // text-box ripple after delay
    setTimeout(() => {
        $('.text-box').each(function () {
            gsap.fromTo(this,
                { opacity: 0, scale: 0.8 },
                { opacity: 1, scale: 1.05, duration: 0.4, ease: 'power1.out', yoyo: true, repeat: 1 }
            );
        });
    }, 1000);
}

// 18) Ghost Fade
function AnimateGhostFade() {
    // text-content ghost‑fades—quick flash then settle
    $('.text-content').each(function () {
        gsap.fromTo(this,
            { opacity: 0 },
            {
                opacity: 0.3, duration: 0.2, yoyo: true, repeat: 1, ease: 'power1.inOut', onComplete: () => {
                    gsap.to(this, { opacity: 1, duration: 0.4, ease: 'power2.out' });
                }
            }
        );
    });

    // text-box ghost fade after delay
    setTimeout(() => {
        $('.text-box').each(function () {
            gsap.fromTo(this,
                { opacity: 0 },
                {
                    opacity: 0.3, duration: 0.2, yoyo: true, repeat: 1, ease: 'power1.inOut', onComplete: () => {
                        gsap.to(this, { opacity: 1, duration: 0.4, ease: 'power2.out' });
                    }
                }
            );
        });
    }, 1000);
}
// 19) Wave In
function AnimateWaveIn() {
    // text-content waves in (skew + horizontal move)
    $('.text-content').each(function () {
        gsap.fromTo(this,
            { opacity: 0, x: -50, skewX: 30 },
            { opacity: 1, x: 0, skewX: 0, duration: 0.8, ease: 'elastic.out(1, 0.5)' }
        );
    });

    // text-box waves in after delay
    setTimeout(() => {
        $('.text-box').each(function () {
            gsap.fromTo(this,
                { opacity: 0, x: -50, skewX: 30 },
                { opacity: 1, x: 0, skewX: 0, duration: 0.8, ease: 'elastic.out(1, 0.5)' }
            );
        });
    }, 1000);
}

// 20) Flip X In
function AnimateFlipXIn() {
    // text-content flips in around the X axis
    $('.text-content').each(function () {
        gsap.from(this, {
            opacity: 0,
            rotationX: -180,
            transformPerspective: 400,
            duration: 0.6,
            ease: 'back.out(1)'
        });
    });

    // text-box flips in after delay
    setTimeout(() => {
        $('.text-box').each(function () {
            gsap.from(this, {
                opacity: 0,
                rotationX: -180,
                transformPerspective: 400,
                duration: 0.6,
                ease: 'back.out(1)'
            });
        });
    }, 1000);
}

// 21) Blur Flash
function AnimateBlurFlash() {
    // text-content flashes from heavy blur to clear
    $('.text-content').each(function () {
        gsap.fromTo(this,
            { opacity: 0, filter: 'blur(20px)' },
            { opacity: 1, filter: 'blur(0px)', duration: 0.4, ease: 'power2.out', yoyo: true, repeat: 1 }
        );
    });

    // text-box blur flash after delay
    setTimeout(() => {
        $('.text-box').each(function () {
            gsap.fromTo(this,
                { opacity: 0, filter: 'blur(20px)' },
                { opacity: 1, filter: 'blur(0px)', duration: 0.4, ease: 'power2.out', yoyo: true, repeat: 1 }
            );
        });
    }, 1000);
}

// 22) Popcorn Pop
function AnimatePopcorn() {
    // text-content pops in with a quick overshoot
    $('.text-content').each(function () {
        gsap.fromTo(this,
            { opacity: 0, scale: 0.3 },
            {
                opacity: 1, scale: 1.2, duration: 0.2, ease: 'power1.out', onComplete: () => {
                    gsap.to(this, { scale: 1, duration: 0.1, ease: 'power1.in' });
                }
            }
        );
    });

    // text-box popcorn pop after delay
    setTimeout(() => {
        $('.text-box').each(function () {
            gsap.fromTo(this,
                { opacity: 0, scale: 0.3 },
                {
                    opacity: 1, scale: 1.2, duration: 0.2, ease: 'power1.out', onComplete: () => {
                        gsap.to(this, { scale: 1, duration: 0.1, ease: 'power1.in' });
                    }
                }
            );
        });
    }, 1000);
}

// 23) Light Sweep
function AnimateLightSweep() {
    // text-content with a subtle gradient sweep
    $('.text-content').each(function () {
        gsap.fromTo(this,
            { '--highlight': '-50%' },
            {
                '--highlight': '150%', duration: 1.2, ease: 'power2.out',
                onStart: () => {
                    // ensure CSS variable and mask are set
                    $(this).css({
                        'background-image': 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.5) var(--highlight), rgba(255,255,255,0) 100%)',
                        'background-clip': 'text',
                        '-webkit-background-clip': 'text',
                        color: 'transparent'
                    });
                },
                onComplete: () => {
                    // clear the mask
                    $(this).css({ backgroundImage: '', color: '' });
                }
            }
        );
    });

    // text-box light sweep after delay
    setTimeout(() => {
        $('.text-box').each(function () {
            gsap.fromTo(this,
                { '--highlight': '-50%' },
                {
                    '--highlight': '150%', duration: 1.2, ease: 'power2.out',
                    onStart: () => {
                        $(this).css({
                            'background-image': 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.5) var(--highlight), rgba(255,255,255,0) 100%)',
                            'background-clip': 'text',
                            '-webkit-background-clip': 'text',
                            color: 'transparent'
                        });
                    },
                    onComplete: () => {
                        $(this).css({ backgroundImage: '', color: '' });
                    }
                }
            );
        });
    }, 1000);
}
// 24) SVG Path Draw (requires DrawSVGPlugin)
function AnimateSVGDraw() {
    // Draw text-content outlines as SVG paths
    $('.text-content svg path').each(function () {
        gsap.fromTo(this,
            { drawSVG: "0%" },
            { drawSVG: "100%", duration: 1, ease: "power1.inOut" }
        );
    });

    // Draw text-box outlines after delay
    setTimeout(() => {
        $('.text-box svg path').each(function () {
            gsap.fromTo(this,
                { drawSVG: "0%" },
                { drawSVG: "100%", duration: 1, ease: "power1.inOut" }
            );
        });
    }, 1000);
}

// 25) Letter‑by‑Letter Fall In (requires SplitText)
function AnimateLetterFall() {
    // Split and drop in letters of text-content
    const split1 = new SplitText(".text-content", { type: "chars" });
    gsap.from(split1.chars, {
        opacity: 0,
        y: -50,
        rotation: 90,
        duration: 0.6,
        ease: "back.out(1.5)",
        stagger: 0.05
    });

    // After delay, do same on text-box
    setTimeout(() => {
        const split2 = new SplitText(".text-box .text-content", { type: "chars" });
        gsap.from(split2.chars, {
            opacity: 0,
            y: -50,
            rotation: 90,
            duration: 0.6,
            ease: "back.out(1.5)",
            stagger: 0.05
        });
    }, 1000);
}

// 26) Parallax Tilt In
function AnimateParallaxTilt() {
    // Tilt text-content from extremes
    $('.text-content').each(function () {
        gsap.fromTo(this,
            { rotationX: 45, rotationY: -45, opacity: 0 },
            { rotationX: 0, rotationY: 0, opacity: 1, duration: 0.8, ease: "power2.out", transformPerspective: 800 }
        );
    });

    // Tilt text-box after delay
    setTimeout(() => {
        $('.text-box').each(function () {
            gsap.fromTo(this,
                { rotationX: 45, rotationY: -45, opacity: 0 },
                { rotationX: 0, rotationY: 0, opacity: 1, duration: 0.8, ease: "power2.out", transformPerspective: 800 }
            );
        });
    }, 1000);
}

// 27) Liquid Morph In (requires MorphSVGPlugin)
function AnimateLiquidMorph() {
    // Morph text-content shape from blob to normal
    $('.text-content svg path').each(function () {
        const start = this.getAttribute('d‑blob'); // assume you stored a blob “d” in data‑blob attribute
        const end = this.getAttribute('d');
        gsap.fromTo(this,
            { attr: { d: start } },
            { attr: { d: end }, duration: 1, ease: "elastic.out(1, 0.5)" }
        );
    });

    // Morph text-box after delay
    setTimeout(() => {
        $('.text-box svg path').each(function () {
            const start = this.getAttribute('d‑blob');
            const end = this.getAttribute('d');
            gsap.fromTo(this,
                { attr: { d: start } },
                { attr: { d: end }, duration: 1, ease: "elastic.out(1, 0.5)" }
            );
        });
    }, 1000);
}

// 28) Neon Flicker
function AnimateNeonFlicker() {
    // Flicker text-content glow
    $('.text-content').each(function () {
        gsap.fromTo(this,
            { textShadow: "0 0 2px #fff, 0 0 4px #0ff" },
            {
                textShadow: "0 0 8px #0ff, 0 0 12px #0ff",
                duration: 0.2,
                yoyo: true,
                repeat: 5,
                ease: "sine.inOut"
            }
        );
    });

    // Flicker text-box after delay
    setTimeout(() => {
        $('.text-box').each(function () {
            gsap.fromTo(this,
                { boxShadow: "0 0 4px #fff" },
                {
                    boxShadow: "0 0 16px #0ff",
                    duration: 0.2,
                    yoyo: true,
                    repeat: 5,
                    ease: "sine.inOut"
                }
            );
        });
    }, 1000);
}

// 29) Perspective Depth Pop
function AnimateDepthPop() {
    // Pop forward from Z‑axis for text-content
    $('.text-content').each(function () {
        gsap.from(this, {
            opacity: 0,
            z: -200,
            duration: 0.7,
            ease: "power3.out",
            transformPerspective: 1000,
            transformOrigin: "50% 50% -200px"
        });
    });

    // Depth pop for text-box after delay
    setTimeout(() => {
        $('.text-box').each(function () {
            gsap.from(this, {
                opacity: 0,
                z: -200,
                duration: 0.7,
                ease: "power3.out",
                transformPerspective: 1000,
                transformOrigin: "50% 50% -200px"
            });
        });
    }, 1000);
}

// 30) Spiral In
function AnimateSpiralIn() {
    // Spiral in text-content
    $('.text-content').each(function () {
        gsap.from(this, {
            opacity: 0,
            rotation: 720,
            scale: 0,
            duration: 1,
            ease: "power2.inOut",
            transformOrigin: "50% 50%"
        });
    });

    // Spiral in text-box after delay
    setTimeout(() => {
        $('.text-box').each(function () {
            gsap.from(this, {
                opacity: 0,
                rotation: 720,
                scale: 0,
                duration: 1,
                ease: "power2.inOut",
                transformOrigin: "50% 50%"
            });
        });
    }, 1000);
}
// 31) Glitch Jitter
function AnimateGlitch() {
    // text-content rapid random jitter
    $('.text-content').each(function () {
        gsap.to(this, {
            x: () => gsap.utils.random(-5, 5),
            y: () => gsap.utils.random(-3, 3),
            repeat: 10,
            yoyo: true,
            duration: 0.05,
            ease: 'rough({strength: 8, points: 20, clamp: true})'
        });
    });

    // text-box glitch after delay
    setTimeout(() => {
        $('.text-box').each(function () {
            gsap.to(this, {
                x: () => gsap.utils.random(-5, 5),
                y: () => gsap.utils.random(-3, 3),
                repeat: 10,
                yoyo: true,
                duration: 0.05,
                ease: 'rough({strength: 8, points: 20, clamp: true})'
            });
        });
    }, 1000);
}

// 32) Circle Clip Reveal
function AnimateCircleReveal() {
    // text-content circle‑mask expand
    $('.text-content').each(function () {
        gsap.fromTo(this,
            { clipPath: 'circle(0% at 50% 50%)' },
            { clipPath: 'circle(150% at 50% 50%)', duration: 0.8, ease: 'power2.out' }
        );
    });

    // text-box circle reveal after delay
    setTimeout(() => {
        $('.text-box').each(function () {
            gsap.fromTo(this,
                { clipPath: 'circle(0% at 50% 50%)' },
                { clipPath: 'circle(150% at 50% 50%)', duration: 0.8, ease: 'power2.out' }
            );
        });
    }, 1000);
}

// 33) Hue‑Rotate Color Cycle
function AnimateColorCycle() {
    // text-content hue‑rotate cycle
    $('.text-content').each(function () {
        gsap.fromTo(this,
            { filter: 'hue-rotate(0deg)' },
            { filter: 'hue-rotate(360deg)', duration: 1.5, ease: 'none', repeat: 0 }
        );
    });

    // text-box color cycle after delay
    setTimeout(() => {
        $('.text-box').each(function () {
            gsap.fromTo(this,
                { filter: 'hue-rotate(0deg)' },
                { filter: 'hue-rotate(360deg)', duration: 1.5, ease: 'none', repeat: 0 }
            );
        });
    }, 1000);
}

// 34) Character Pop Cascade (requires SplitText)
function AnimateCharCascade() {
    // text-content each char pops in
    const split = new SplitText(".text-content", { type: "chars" });
    gsap.from(split.chars, {
        opacity: 0,
        scale: 0,
        duration: 0.4,
        ease: 'back.out(1.7)',
        stagger: 0.05
    });

    // text-box cascade after delay
    setTimeout(() => {
        const split2 = new SplitText(".text-box .text-content", { type: "chars" });
        gsap.from(split2.chars, {
            opacity: 0,
            scale: 0,
            duration: 0.4,
            ease: 'back.out(1.7)',
            stagger: 0.05
        });
    }, 1000);
}

// 35) Slide & Skew In
function AnimateSlideSkew() {
    // text-content slides and skews in
    $('.text-content').each(function () {
        gsap.from(this, {
            opacity: 0,
            x: -100,
            skewY: 15,
            duration: 0.7,
            ease: 'power3.out'
        });
    });

    // text-box slide & skew after delay
    setTimeout(() => {
        $('.text-box').each(function () {
            gsap.from(this, {
                opacity: 0,
                x: -100,
                skewY: 15,
                duration: 0.7,
                ease: 'power3.out'
            });
        });
    }, 1000);
}

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
        else if (effectType === 'mask') btnSelector = '#amask';
        else if (effectType === 'shake') btnSelector = '#ashake';
        else if (effectType === 'blur') btnSelector = '#ablur';
        else if (effectType === 'roll') btnSelector = '#aroll';
        else if (effectType === 'curtain') btnSelector = '#acurtain';
        else if (effectType === 'blurFlash') btnSelector = '#ablurFlash';
        else if (effectType === 'popcorn') btnSelector = '#apopcorn';
        else if (effectType === 'glitch') btnSelector = '#aglitch';
        
        
    } else {
        $('.effectOut_btn').removeClass('active_effect');
        if (effectType === 'delaylinear') btnSelector = '#adelaylinearOut1';
        else if (effectType === 'delaylinear2') btnSelector = '#adelaylinearOut2';
        else if (effectType === 'mask') btnSelector = '#amaskOut';
        else if (effectType === 'shake') btnSelector = '#ashakeOut';
        else if (effectType === 'blur') btnSelector = '#ablurOut';
        else if (effectType === 'roll') btnSelector = '#arollOut';
        else if (effectType === 'curtain') btnSelector = '#acurtainOut';
        else if (effectType === 'blurFlash') btnSelector = '#ablurFlashOut';
        else if (effectType === 'popcorn') btnSelector = '#apopcornOut';
        else if (effectType === 'glitch') btnSelector = '#aglitchOut';
    }

    // 4) activate it (if any)
    if (btnSelector) {
        $(btnSelector).addClass('active_effect');
    }
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

//function wireUpDeleteAndRotate($box) {
//    // Delete logic
//    $box.find('.delete-handle').on('click', e => {
//        e.stopPropagation();
//        $box.remove();
//    });

//    // Make this box the active one
//    $box.on('click', function () {
//        $('.text-box').removeClass('active'); // clear others
//        $box.addClass('active');
//    });

//    // Rotate logic (via drag handle)
//    const $rotate = $box.find('.rotate-handle');
//    let rotating = false, center = {};
//    $rotate.on('mousedown', e => {
//        e.preventDefault();
//        rotating = true;
//        const offs = $box.offset();
//        center = {
//            x: offs.left + $box.outerWidth() / 2,
//            y: offs.top + $box.outerHeight() / 2
//        };
//        $(document).on('mousemove.rotate', ev => {
//            if (!rotating) return;
//            const angle = Math.atan2(ev.pageY - center.y, ev.pageX - center.x) * 180 / Math.PI;
//            $box.css('transform', `rotate(${angle}deg)`);

//            // Sync UI
//            $('#rotationSlider').val(Math.round(angle));
//            $('#rotationValue').text(Math.round(angle));
//            $('#rotationBadge').text(Math.round(angle));
//        }).on('mouseup.rotate', () => {
//            rotating = false;
//            $(document).off('.rotate');
//        });
//    });

//    // Rotation via slider — only for active box
//    $('#rotationSlider').off('input').on('input', function () {
//        const activeBox = $('.text-box.active');
//        if (activeBox.length === 0) return;

//        const angle = parseInt(this.value, 10) || 0;
//        activeBox.css('transform', `rotate(${angle}deg)`);

//        $('#rotationValue').text(angle);
//        $('#rotationBadge').text(angle);
//    });

//    // Manual badge input — only for active box
//    $('#rotationBadge').off('input').on('input', function () {
//        const activeBox = $('.text-box.active');
//        if (activeBox.length === 0) return;

//        const angle = parseInt($(this).text(), 10) || 0;
//        const clamped = Math.max(-180, Math.min(180, angle));
//        activeBox.css('transform', `rotate(${clamped}deg)`);

//        $('#rotationSlider').val(clamped);
//        $('#rotationValue').text(clamped);
//        $(this).text(clamped);
//    });
//}



// Unified createImageBox: handles both raster images and SVG data-urls

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
    const $box = $('<div class="text-box selected"></div>').attr('id', 'box-' + boxCounter).appendTo('#canvasContainer');
    boxCounter++; // Increment for the next box
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


// Graphic/ anumation mode toggle
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

//background color change for canvas
function ChangeSpecificBackgroundColor(controlid) {
    const backgroundSpecificColorPicker = document.getElementById("favBackgroundSpecificcolor");
    if (!backgroundSpecificColorPicker) return;

    const selectedColor = backgroundSpecificColorPicker.value;
    $("#hdnBackgroundSpecificColor").val(selectedColor);

    // Remove any background image from the <div>
    const targetDiv = document.getElementById(controlid);
    if (targetDiv) {
        targetDiv.style.backgroundImage = 'none';
        targetDiv.style.backgroundColor = selectedColor;
    }

    // Redraw logic (if needed for your layout)
    drawCanvas('Common'); // Can be renamed if not canvas-related anymore
}

// Set background color for a specific <div>
function setCanvasBackground(divId, color) {
    const div = document.getElementById(divId);
    if (div) {
        div.style.backgroundColor = color;
    }
}

// Set background color for all matching <div>s
function setAllCanvasesBackground(selector, color) {
    const divs = document.querySelectorAll(selector);
    divs.forEach(div => {
        div.style.backgroundColor = color;
    });
}

//bacgorund image logic
function setCanvasBackgroundImage(imgElement) {
    const imageSrc = imgElement.src;

    const targetDiv = document.getElementById("myCanvas"); // renamed from 'canvas'

    // Set the background using CSS
    targetDiv.style.backgroundImage = `url('${imageSrc}')`;
    targetDiv.style.backgroundSize = 'cover';
    targetDiv.style.backgroundRepeat = 'no-repeat';
    targetDiv.style.backgroundPosition = 'center';

    // Store background image source for reference
    targetDiv._bgImg = imageSrc;

    // Update hidden form values
    $("#hdnBackgroundImage").val(imageSrc);
    $('#chkRemoveBackground').prop('checked', true);
    $("#hdnBackgroundSpecificColor").val("rgba(255, 255, 255, 0.95)");
}
