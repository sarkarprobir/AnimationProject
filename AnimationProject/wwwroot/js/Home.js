
// Wait for DOM to load before accessing elements
document.addEventListener('DOMContentLoaded', function () {
    // Add Enter key support to inputs
    document.getElementById('emailInput').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') validateCredentials();
    });
    document.getElementById('passwordInput').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') validateCredentials();
    });
});

function validateCredentials() {
    // Static credentials (already in lowercase)
    const staticEmail = "demo@aniboard.com";
    const staticPassword = "123";

    // Get user input values and convert to lowercase
    const enteredEmail = document.getElementById('emailInput').value.toLowerCase().trim();
    const enteredPassword = document.getElementById('passwordInput').value.toLowerCase().trim();

    // Validation check
    if (enteredEmail === staticEmail && enteredPassword === staticPassword) {
        // window.location.href = window.location.origin + '/Canvas/VerticalIndex';
        window.location.href = window.location.origin + '/Canvas/VerticalIndex?openModal=true';
        // You can redirect or perform other actions here
    } else {
        // alert("Invalid credentials!");
        MessageShow('', 'Invalid credentials!', 'error');
        // Clear password field for retry
        document.getElementById('passwordInput').value = '';
    }
}
function LoadHomeTemplates() {
    const $row = $('#divhomeTemplateRow'); // your 4-column row
    if ($row.length === 0) { console.warn('#divhomeTemplateRow not found'); return; }

    const $cols = $row.find('> .col-auto.p-0');
    const $col1 = $cols.eq(0), $col2 = $cols.eq(1), $col3 = $cols.eq(2), $col4 = $cols.eq(3);
    [$col1, $col2, $col3, $col4].forEach($c => $c.empty());

    const DEFAULT_IMG_H = joinUrl(baseURL, 'images/default-horizontal.png');
    const DEFAULT_IMG_V = joinUrl(baseURL, 'images/default-vertical.png');

    $.ajax({
        url: joinUrl(baseURL, 'Canvas/GetTemplatesForHomePage'),
        type: 'POST',
        dataType: 'json'
    })
        .done((res) => {
            const all = Array.isArray(res) ? res : (res?.data || []);

            // Collect previews by orientation
            const horizontals = [];
            const verticals = [];

            for (const tpl of all) {
                const type = String(tpl?.SlideType || tpl?.slideType || '').toLowerCase();
                const src = getPreviewSrc(tpl);
                if (!src) continue;

                if (type === 'horizontal') horizontals.push({ tpl, src });
                else if (type === 'vertical') verticals.push({ tpl, src });
            }

            // Split evenly (preserve order): left column gets ceil half
            const midH = Math.ceil(horizontals.length / 2);
            const hCol1 = horizontals.slice(0, midH);
            const hCol3 = horizontals.slice(midH);

            const midV = Math.ceil(verticals.length / 2);
            const vCol2 = verticals.slice(0, midV);
            const vCol4 = verticals.slice(midV);

            // Render
            renderColumn($col1, hCol1, 'horizontal', DEFAULT_IMG_H);
            renderColumn($col3, hCol3, 'horizontal', DEFAULT_IMG_H);

            renderColumn($col2, vCol2, 'vertical', DEFAULT_IMG_V);
            renderColumn($col4, vCol4, 'vertical', DEFAULT_IMG_V);
        })
        .fail((xhr) => {
            console.error('LoadHomeTemplates failed', xhr);
            // Keep layout non-empty with defaults
            renderColumn($col1, [], 'horizontal', DEFAULT_IMG_H);
            renderColumn($col3, [], 'horizontal', DEFAULT_IMG_H);
            renderColumn($col2, [], 'vertical', DEFAULT_IMG_V);
            renderColumn($col4, [], 'vertical', DEFAULT_IMG_V);
        })
        .always(() => { if (typeof HideLoader === 'function') HideLoader(); });

    // ---------- helpers ----------

    function getPreviewSrc(tpl) {
        const details = tpl?.DesignBoardDetailsList || tpl?.designBoardDetailsList || [];
        if (!Array.isArray(details) || !details.length) return null;

        // Prefer Slide-1 with image, else first detail with image
        const pref = details.find(d =>
            String(d?.SlideName || d?.slideName || '').toLowerCase() === 'slide-1' &&
            (d?.AnimationImagePath || d?.animationImagePath)
        ) || details.find(d => d?.AnimationImagePath || d?.animationImagePath);

        const path = pref?.AnimationImagePath || pref?.animationImagePath;
        return path ? joinUrl(baseURL, path) : null;
    }

    function renderColumn($col, items, orientation, defaultSrc) {
        if (!items || items.length === 0) {
            $col.append(makeImgBox(orientation, defaultSrc, 'Default'));
            return;
        }
        const frag = document.createDocumentFragment();
        for (const it of items) {
            frag.appendChild(makeImgBox(orientation, it.src, it.tpl?.DesignBoardName || 'Template'));
        }
        $col[0].appendChild(frag);
    }

    function makeImgBox(orientation, src, alt) {
        const box = document.createElement('div');
        box.className = `img-box ${orientation}`;
        const img = document.createElement('img');
        img.className = 'border3';
        img.loading = 'lazy';
        img.decoding = 'async';
        img.alt = alt || 'Template';
        img.src = src;
        box.appendChild(img);
        return box;
    }

    function joinUrl(a, b) {
        if (!a) return b || '';
        if (!b) return a || '';
        return String(a).replace(/\/+$/, '') + '/' + String(b).replace(/^\/+/, '');
    }
}

