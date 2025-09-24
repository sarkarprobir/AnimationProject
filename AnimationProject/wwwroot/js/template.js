function LoadTemplates() {
    const $row = $('#divTemplateRow'); // 4-column container

    if ($row.length === 0 ) {
        console.warn('LoadHomeTemplates: neither #divTemplateRow nor #divHomePromo found');
        return;
    }

    // Prepare columns if row exists
    let $col1, $col2, $col3, $col4;
    if ($row.length) {
        const $cols = $row.find('> .col-auto.p-0');
        $col1 = $cols.eq(0); $col2 = $cols.eq(1); $col3 = $cols.eq(2); $col4 = $cols.eq(3);
        [$col1, $col2, $col3, $col4].forEach($c => $c && $c.empty());
    }

    // Defaults for grid placeholders
    const DEFAULT_IMG_H = joinUrl(baseURL, 'images/default-horizontal.png');
    const DEFAULT_IMG_V = joinUrl(baseURL, 'images/default-vertical.png');

    $.ajax({
        url: joinUrl(baseURL, 'Canvas/GetTemplatesForTemplatePage'),
        type: 'POST',
        dataType: 'json'
    })
        .done((res) => {
            const boards = Array.isArray(res) ? res : (res?.data || []);

          

            // 2) GRID: split ALL by orientation and then evenly across cols (preserving order)
            if ($row.length) {
                const horizontals = [];
                const verticals = [];

                for (const tpl of boards) {
                    const type = String(tpl?.SlideType || tpl?.slideType || '').toLowerCase();
                    const src = getPreviewSrc(tpl);
                    if (!src) continue;
                    if (type === 'horizontal') horizontals.push({ tpl, src });
                    else if (type === 'vertical') verticals.push({ tpl, src });
                }

                const midH = Math.ceil(horizontals.length / 2);
                const hCol1 = horizontals.slice(0, midH);
                const hCol3 = horizontals.slice(midH);

                const midV = Math.ceil(verticals.length / 2);
                const vCol2 = verticals.slice(0, midV);
                const vCol4 = verticals.slice(midV);

                renderColumn($col1, hCol1, 'horizontal', DEFAULT_IMG_H);
                renderColumn($col3, hCol3, 'horizontal', DEFAULT_IMG_H);
                renderColumn($col2, vCol2, 'vertical', DEFAULT_IMG_V);
                renderColumn($col4, vCol4, 'vertical', DEFAULT_IMG_V);
            }
        })
        .fail((xhr) => {
            console.error('LoadHomeTemplates failed', xhr);
            // Keep grid layout non-empty with defaults (if row exists)
            if ($row.length) {
                renderColumn($col1, [], 'horizontal', DEFAULT_IMG_H);
                renderColumn($col3, [], 'horizontal', DEFAULT_IMG_H);
                renderColumn($col2, [], 'vertical', DEFAULT_IMG_V);
                renderColumn($col4, [], 'vertical', DEFAULT_IMG_V);
            }
            // Leave hero image as-is (SSR fallback)
        })
        .always(() => { if (typeof HideLoader === 'function') HideLoader(); });

    // ───────────── helpers ─────────────

    
    // Build absolute video URL for aniboard
    function toAniboardAbs(p) {
        if (!p) return '';
        if (/^https?:\/\//i.test(p)) return p;
        return 'https://aniboard.com/s'.replace(/\/+$/, '') + '/' + String(p).replace(/^\/+/, '');
    }

    // Prefer Slide-1 thumbnail; else first detail with AnimationImagePath
    function getPreviewSrc(tpl) {
        const details = tpl?.DesignBoardDetailsList || tpl?.designBoardDetailsList || [];
        if (!Array.isArray(details) || !details.length) return null;

        const pref = details.find(d =>
            String(d?.SlideName || d?.slideName || '').toLowerCase() === 'slide-1' &&
            (d?.AnimationImagePath || d?.animationImagePath)
        ) || details.find(d => d?.AnimationImagePath || d?.animationImagePath);

        const path = pref?.AnimationImagePath || pref?.animationImagePath;
        return path ? joinUrl(baseURL, path) : null;
    }

    // Render a list of items to a column; if empty add a default image
    function renderColumn($col, items, orientation, defaultSrc) {
        if (!$col || !$col.length) return;
        const frag = document.createDocumentFragment();

        if (!items || items.length === 0) {
            frag.appendChild(makeImgBox(orientation, defaultSrc, 'Default'));
        } else {
            for (const it of items) {
                frag.appendChild(makeImgBox(orientation, it.src, it.tpl?.DesignBoardName || 'Template'));
            }
        }

        $col[0].appendChild(frag);
        setupLazyLoader($col[0]); // observe newly added images for lazy loading
    }

    // Create <div class="img-box {orientation}"><img class="border3 lazy" .../></div>
    function makeImgBox(orientation, realSrc, alt) {
        const box = document.createElement('div');
        box.className = `img-box ${orientation}`;

        const img = document.createElement('img');
        img.className = 'border3 lazy';
        img.loading = 'lazy';
        img.decoding = 'async';
        img.alt = alt || 'Template';

        // tiny placeholder; real src is lazy-loaded
        const BLANK =
            'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
        img.src = BLANK;
        img.dataset.src = realSrc;

        // pretty fade-in hook (optional CSS should set .loaded opacity:1)
        img.addEventListener('load', () => img.classList.add('loaded'), { once: true });

        box.appendChild(img);
        return box;
    }

    // Singleton IntersectionObserver to lazy-load thumbnails
    let __lazyObserver = window.__lazyObserver || null;
    function setupLazyLoader(scopeEl) {
        if ('IntersectionObserver' in window) {
            if (!__lazyObserver) {
                __lazyObserver = new IntersectionObserver((entries, obs) => {
                    for (const entry of entries) {
                        if (!entry.isIntersecting) continue;
                        const img = entry.target;
                        const real = img.dataset.src;
                        if (real) {
                            img.src = real;
                            img.removeAttribute('data-src');
                            img.classList.remove('lazy');
                        }
                        obs.unobserve(img);
                    }
                }, { root: null, rootMargin: '300px 0px', threshold: 0.01 });
                window.__lazyObserver = __lazyObserver;
            }
            scopeEl.querySelectorAll('img.lazy[data-src]').forEach(img => __lazyObserver.observe(img));
        } else {
            // Fallback: load immediately
            scopeEl.querySelectorAll('img.lazy[data-src]').forEach(img => {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                img.classList.remove('lazy');
            });
        }
    }

    // Safe join for baseURL + relative path
    function joinUrl(a, b) {
        if (!a) return b || '';
        if (!b) return a || '';
        return String(a).replace(/\/+$/, '') + '/' + String(b).replace(/^\/+/, '');
    }
}