
const canvas = new fabric.Canvas('myCanvas');
const realCanvasEl = canvas.upperCanvasEl;
    function addText() {
        let text = document.getElementById('textInput').value.trim();
    if (!text) text = "Sample Text saunak mandal ------ $12\nSample Text saunak mandal ------ $24\nSample Text saunak mandal ------ $36";

    const fontSize = parseInt(document.getElementById('fontSize').value);
    const color = document.getElementById('textColor').value;
    const fontFamily = document.getElementById('fontFamily').value;

    const textbox = new fabric.Textbox(text, {
        left: 100,
    top: 100,
    width: 600,
    fontSize: fontSize,
    fill: color,
    fontFamily: fontFamily,
    editable: true,
    fontWeight: 'normal',
    fontStyle: 'normal',
    underline: false,
    lineHeight: 1.2 
    });

    canvas.add(textbox).setActiveObject(textbox);
    canvas.requestRenderAll();
    updateTextControls();
  }

    function toggleStyle(styleName, value) {
    const obj = canvas.getActiveObject();
    if (!obj || obj.type !== 'textbox') return;

    const selection = obj.selectionStart !== obj.selectionEnd;
    const styles = selection ? obj.getSelectionStyles(obj.selectionStart, obj.selectionEnd) : [obj];
    const currentValue = styles[0][styleName] || '';
    const newValue = currentValue === value ? '' : value;

    if (selection) {
        obj.setSelectionStyles({ [styleName]: newValue }, obj.selectionStart, obj.selectionEnd);
    } else {
        obj.set({ [styleName]: newValue });
    }

    canvas.requestRenderAll();
    updateTextControls();
  }





    document.getElementById('boldBtn').addEventListener('click', function () {
        toggleStyle('fontWeight', 'bold');
  });

    document.getElementById('italicBtn').addEventListener('click', function () {
        toggleStyle('fontStyle', 'italic');
  });

    document.getElementById('underlineBtn').addEventListener('click', function () {
        toggleStyle('underline', true);
  });


    function updateTextControls() {
    const obj = canvas.getActiveObject();
    if (!obj || obj.type !== 'textbox') {
        resetFormattingButtons();
    return;
    }

    document.getElementById('textInput').value = obj.text || '';

    const hasSelection = obj.selectionStart !== obj.selectionEnd;
    let styles = [];

    if (hasSelection) {
        styles = obj.getSelectionStyles(obj.selectionStart, obj.selectionEnd);
    }

    const getCommonStyle = (prop, fallback) => {
      if (!hasSelection || styles.length === 0) return obj[prop] || fallback;

    const first = styles[0][prop] ?? fallback;
      return styles.every(s => (s[prop] ?? fallback) === first) ? first : null;
    };

    const hasAnyStyle = (prop, matchValue) => {
      if (!hasSelection || styles.length === 0) return obj[prop] === matchValue;
      return styles.some(s => s[prop] === matchValue);
    };


    const fontSize = getCommonStyle('fontSize', obj.fontSize);
    const fontFamily = getCommonStyle('fontFamily', obj.fontFamily);
    const textColor = getCommonStyle('fill', obj.fill);

    document.getElementById('fontSize').value = fontSize ?? obj.fontSize;
    document.getElementById('fontFamily').value = fontFamily ?? obj.fontFamily;
    document.getElementById('textColor').value = textColor ?? obj.fill;

    const alignBtn = document.getElementById('alignToggleBtn');
    const align = obj.textAlign || 'left';
    currentAlignIndex = alignments.indexOf(align);


    alignBtn.innerHTML = `<i class="fas ${faIcons[align]}"></i>`;


    document.getElementById('boldBtn').classList.toggle('active-btn', hasAnyStyle('fontWeight', 'bold'));
    document.getElementById('italicBtn').classList.toggle('active-btn', hasAnyStyle('fontStyle', 'italic'));
    document.getElementById('underlineBtn').classList.toggle('active-btn', hasAnyStyle('underline', true));



    const selectedText = obj.text.slice(obj.selectionStart, obj.selectionEnd);
    const isAllUpper = selectedText && selectedText === selectedText.toUpperCase();
    document.getElementById('toggleCaseBtn').classList.toggle('active-btn', isAllUpper);


    document.getElementById('lineHeight').value = obj.lineHeight ?? 1.2;
  }



    function resetFormattingButtons() {
        document.getElementById('boldBtn').classList.remove('active-btn');
    document.getElementById('italicBtn').classList.remove('active-btn');
    document.getElementById('underlineBtn').classList.remove('active-btn');
    document.getElementById('toggleCaseBtn').classList.remove('active-btn');
    document.getElementById('lineHeight').value = 1.2;

  }


    canvas.on('selection:created', updateTextControls);
    canvas.on('selection:updated', updateTextControls);
    canvas.on('selection:cleared', resetFormattingButtons);
    canvas.on('mouse:up', updateTextControls);
    canvas.on('text:editing:entered', updateTextControls);

    canvas.on('mouse:down', function (options) {
  const target = options.target;


    if (!target || !(target.type === 'textbox' || target.type === 'i-text' || target.type === 'text')) {
        canvas.discardActiveObject();
    resetFormattingButtons();
    canvas.requestRenderAll();
  }
});

    let previousText = "";

    canvas.on('text:changed', function (e) {
    const obj = e.target;
    if (!obj || obj.type !== 'textbox') return;

    const currentText = obj.text;

    if (currentText.length > previousText.length) {
      const diffIndex = findDiffIndex(previousText, currentText);
    const newChar = currentText[diffIndex];


    const isFirstCharInLine = currentText[diffIndex - 1] === '\n';

    if (isFirstCharInLine) {
        setTimeout(() => {
            const pos = diffIndex;


            obj.removeStyle(pos);


            obj.setSelectionStyles({
                fontWeight: 'normal',
                fontStyle: 'normal',
                underline: false,
                fill: '#000000',
                fontSize: 24,
                fontFamily: ''
            }, pos, pos + 1);


            document.getElementById('fontSize').value = 24;
            document.getElementById('textColor').value = '#000000';
            document.getElementById('fontFamily').value = 'Arial';
            document.getElementById('boldBtn').classList.remove('active-btn');
            document.getElementById('italicBtn').classList.remove('active-btn');
            document.getElementById('underlineBtn').classList.remove('active-btn');

            document.getElementById('lineHeight').value = obj.lineHeight || 1.2;
            document.getElementById('textAlign').value = obj.textAlign || 'left';
            document.getElementById('toggleCaseBtn').classList.remove('active-btn');

            canvas.requestRenderAll();
        }, 0);
      }
    }

    previousText = currentText;
    updateTextControls();
  });



    function findDiffIndex(str1, str2) {
    for (let i = 0; i < Math.min(str1.length, str2.length); i++) {
      if (str1[i] !== str2[i]) return i;
    }
    return str1.length;
  }


    document.getElementById('textColor').addEventListener('input', function () {
    const obj = canvas.getActiveObject();
    if (obj && obj.type === 'textbox') {
      const color = this.value;
    if (obj.selectionStart !== obj.selectionEnd) {
        obj.setSelectionStyles({ fill: color }, obj.selectionStart, obj.selectionEnd);
      } else {
        obj.set({ fill: color });
      }
    canvas.renderAll();
    updateTextControls();
    }
  });

    document.getElementById('fontSize').addEventListener('input', function () {
    const obj = canvas.getActiveObject();
    if (obj && obj.type === 'textbox') {
      const size = parseInt(this.value);
    if (obj.selectionStart !== obj.selectionEnd) {
        obj.setSelectionStyles({ fontSize: size }, obj.selectionStart, obj.selectionEnd);
      } else {
        obj.set({ fontSize: size });
      }
    canvas.renderAll();
    updateTextControls();
    }
  });

    document.getElementById('fontFamily').addEventListener('change', function () {
    const obj = canvas.getActiveObject();
    if (obj && obj.type === 'textbox') {
      const family = this.value;
    if (obj.selectionStart !== obj.selectionEnd) {
        obj.setSelectionStyles({ fontFamily: family }, obj.selectionStart, obj.selectionEnd);
      } else {
        obj.set({ fontFamily: family });
      }
    canvas.renderAll();
    updateTextControls();
    }
  });


    document.getElementById('toggleCaseBtn').addEventListener('click', function () {
  const obj = canvas.getActiveObject();
    const btn = this;

    if (obj && obj.type === 'textbox') {
    const start = obj.selectionStart;
    const end = obj.selectionEnd;

    let newText, updatedStart, updatedEnd;

    if (start !== end) {
      const selected = obj.text.slice(start, end);
    const isUpper = selected === selected.toUpperCase();
    const toggled = isUpper ? selected.toLowerCase() : selected.toUpperCase();
    newText = obj.text.slice(0, start) + toggled + obj.text.slice(end);
    updatedStart = start;
    updatedEnd = start + toggled.length;


    btn.classList.toggle('active-btn', !isUpper);
    } else {
      
      const isUpper = obj.text === obj.text.toUpperCase();
    const toggled = isUpper ? obj.text.toLowerCase() : obj.text.toUpperCase();
    newText = toggled;
    updatedStart = 0;
    updatedEnd = toggled.length;

    btn.classList.toggle('active-btn', !isUpper);
    }

    obj.text = newText;
    obj.selectionStart = updatedStart;
    obj.selectionEnd = updatedEnd;

    document.getElementById('textInput').value = obj.text;

    canvas.renderAll();
    updateTextControls();
  }
});




    document.getElementById('lineHeight').addEventListener('input', function () {
    const obj = canvas.getActiveObject();
    if (obj && obj.type === 'textbox') {
        obj.set({ lineHeight: parseFloat(this.value) });
    canvas.renderAll();
    }
  });


    const alignments = ['left', 'center', 'right', 'justify'];
    const faIcons = {
        left: 'fa-align-left',
    center: 'fa-align-center',
    right: 'fa-align-right',
    justify: 'fa-align-justify'
  };
    let currentAlignIndex = 0;

    document.getElementById('alignToggleBtn').addEventListener('click', function () {
    const obj = canvas.getActiveObject();
    if (!obj || obj.type !== 'textbox') return;


    currentAlignIndex = (currentAlignIndex + 1) % alignments.length;
    const newAlign = alignments[currentAlignIndex];


    obj.set({textAlign: newAlign });
    canvas.requestRenderAll();

    const icon = this.querySelector('i');
    for (let key in faIcons) icon.classList.remove(faIcons[key]);
    icon.classList.add(faIcons[newAlign]);

    updateTextControls();
  });



    document.addEventListener('keydown', function (e) {
    if (e.ctrlKey && !e.shiftKey && !e.altKey) {
      const obj = canvas.getActiveObject();
    if (!obj || obj.type !== 'textbox') return;

    switch (e.key.toLowerCase()) {
        case 'b':
    e.preventDefault();
    toggleStyle('fontWeight', 'bold');
    break;
    case 'i':
    e.preventDefault();
    toggleStyle('fontStyle', 'italic');
    break;
    case 'u':
    e.preventDefault();
    toggleStyle('underline', true);
    break;
      }
    }
  });