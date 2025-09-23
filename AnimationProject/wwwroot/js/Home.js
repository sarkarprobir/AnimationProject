
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
function LoadHomeTemplatesOld() {
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

            // Split evenly (preserve order) across the two columns for each orientation
            const midH = Math.ceil(horizontals.length / 2);
            const hCol1 = horizontals.slice(0, midH);
            const hCol3 = horizontals.slice(midH);

            const midV = Math.ceil(verticals.length / 2);
            const vCol2 = verticals.slice(0, midV);
            const vCol4 = verticals.slice(midV);

            // Render and lazy-observe
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
        const frag = document.createDocumentFragment();

        if (!items || items.length === 0) {
            frag.appendChild(makeImgBox(orientation, defaultSrc, 'Default'));
        } else {
            for (const it of items) {
                frag.appendChild(makeImgBox(orientation, it.src, it.tpl?.DesignBoardName || 'Template'));
            }
        }

        $col[0].appendChild(frag);
        setupLazyLoader($col[0]); // observe newly added images
    }

    // Create box + a lazy <img> that swaps data-src → src when in view
    function makeImgBox(orientation, realSrc, alt) {
        const box = document.createElement('div');
        box.className = `img-box ${orientation}`;

        const img = document.createElement('img');
        img.className = 'border3 lazy';
        img.loading = 'lazy';         // native hint
        img.decoding = 'async';
        img.alt = alt || 'Template';

        // tiny transparent placeholder to avoid broken image icon
        const PLACEHOLDER_1x1 =
            'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
        img.src = PLACEHOLDER_1x1;    // initial src (very cheap)
        img.dataset.src = realSrc;    // real URL loaded by IntersectionObserver

        // pretty fade-in
        img.addEventListener('load', () => img.classList.add('loaded'), { once: true });

        box.appendChild(img);
        return box;
    }

    // One observer for the page; attach to each column as we render
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
                }, {
                    root: null,
                    rootMargin: '300px 0px', // start loading a bit before visible
                    threshold: 0.01
                });
                window.__lazyObserver = __lazyObserver; // save singleton
            }
            scopeEl.querySelectorAll('img.lazy[data-src]').forEach(img => __lazyObserver.observe(img));
        } else {
            // Fallback: no IO support -> load immediately
            scopeEl.querySelectorAll('img.lazy[data-src]').forEach(img => {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                img.classList.remove('lazy');
            });
        }
    }

    function joinUrl(a, b) {
        if (!a) return b || '';
        if (!b) return a || '';
        return String(a).replace(/\/+$/, '') + '/' + String(b).replace(/^\/+/, '');
    }
}
function LoadHomeTemplates() {
    const $row = $('#divhomeTemplateRow'); // 4-column container
    const $promo = $('#divHomePromo');       // hero container

    if ($row.length === 0 && $promo.length === 0) {
        console.warn('LoadHomeTemplates: neither #divhomeTemplateRow nor #divHomePromo found');
        return;
    }

    // Prepare columns if row exists
    let $col1, $col2, $col3, $col4;
    if ($row.length) {
        const $cols = $row.find('> .col-auto.p-0');
        $col1 = $cols.eq(0); $col2 = $cols.eq(1); $col3 = $cols.eq(2); $col4 = $cols.eq(3);
        [$col1, $col2, $col3, $col4].forEach($c => $c && $c.empty());
    }

    // Use whatever hero <img> is already in markup as the poster/fallback (works with Razor "~/" too)
    const heroFallbackSrc = (function () {
        if (!$promo.length) return '/images/hero_sec_img.png';
        const img = $promo.find('img').attr('src');
        return img || '/images/hero_sec_img.png';
    })();

    // Defaults for grid placeholders
    const DEFAULT_IMG_H = joinUrl(baseURL, 'images/default-horizontal.png');
    const DEFAULT_IMG_V = joinUrl(baseURL, 'images/default-vertical.png');

    $.ajax({
        url: joinUrl(baseURL, 'Canvas/GetTemplatesForHomePage'),
        type: 'POST',
        dataType: 'json'
    })
        .done((res) => {
            const boards = Array.isArray(res) ? res : (res?.data || []);

            // 1) HERO: LargeVideoPath → <video>, else keep <img>
            updateHeroPromo(boards);

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

    // HERO loader (video if LargeVideoPath, else image)
    function updateHeroPromo(boards) {
        if (!$promo.length) return;

        const hit = boards.find(b => {
            const p = (b?.LargeVideoPath || b?.largeVideoPath || '').trim();
            return p.length > 0;
        });

        if (!hit) {
            // Ensure an <img> exists
            if ($promo.find('img').length === 0) {
                $promo.empty().append($('<img>', {
                    src: heroFallbackSrc,
                    alt: 'Hero Image',
                    loading: 'eager',
                    decoding: 'async'
                }));
            }
            return;
        }

        const rel = (hit.LargeVideoPath || hit.largeVideoPath).trim();
        const videoSrc = toAniboardAbs(rel); // "https://aniboard.com/s" + rel

        const video = document.createElement('video');
        video.className = 'hero-video';
        video.autoplay = true;
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.setAttribute('playsinline', '');
        video.preload = 'metadata';
        video.poster = heroFallbackSrc;

        const source = document.createElement('source');
        source.src = videoSrc;
        source.type = 'video/mp4';
        video.appendChild(source);

        video.addEventListener('error', () => {
            // On error, revert to image
            $promo.empty().append($('<img>', {
                src: heroFallbackSrc,
                alt: 'Hero Image',
                loading: 'eager',
                decoding: 'async'
            }));
        }, { once: true });

        $promo.empty().append(video);
    }

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

// Call after DOM ready
// $(LoadHomeTemplates);




