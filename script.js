// ============================================================
//  SPA NAVIGATION — show one section at a time
// ============================================================

function showSection(id) {
    // Hide all sections
    document.querySelectorAll('.section-page').forEach(sec => {
        sec.classList.remove('active-section');
    });

    // Show target
    const target = document.getElementById(id);
    if (target) {
        target.classList.add('active-section');
        window.scrollTo({ top: 0, behavior: 'instant' });

        // Trigger AOS refresh so animations replay
        if (typeof AOS !== 'undefined') AOS.refresh();
    }

    // Update active nav link style
    document.querySelectorAll('.navbar .nav-link').forEach(link => {
        link.classList.remove('nav-active');
    });
    const activeLink = document.querySelector(`.navbar .nav-link[onclick*="'${id}'"]`);
    if (activeLink) activeLink.classList.add('nav-active');

    // Close mobile menu
    const nc = document.getElementById('navbarNav');
    if (nc && nc.classList.contains('show')) {
        new bootstrap.Collapse(nc).hide();
    }
}

// ============================================================
//  HERO INTERACTIVE FEATURES
// ============================================================
(function () {
    'use strict';

    const heroSection  = document.getElementById('home');
    const scanLine     = document.getElementById('scanLine');
    const coordDisplay = document.getElementById('coordDisplay');
    const techNodesEl  = document.getElementById('techNodes');


    // ── 5. HERO PARALLAX (data-depth layers) ─────────────────
    const heroCenter = {
        x: window.innerWidth  / 2,
        y: window.innerHeight / 2
    };

    document.addEventListener('mousemove', (e) => {
        if (!document.body.classList.contains('on-hero')) return;

        const dx = e.clientX - heroCenter.x;
        const dy = e.clientY - heroCenter.y;

        document.querySelectorAll('[data-depth]').forEach(el => {
            const depth = parseFloat(el.dataset.depth) || 0.02;
            const tx = dx * depth * -1;
            const ty = dy * depth * -1;
            el.style.transform = `translate(${tx}px, ${ty}px)`;
        });
    });

    window.addEventListener('resize', () => {
        heroCenter.x = window.innerWidth  / 2;
        heroCenter.y = window.innerHeight / 2;
    });

    // ── 6. SCAN-LINE following mouse Y inside hero ───────────
    document.addEventListener('mousemove', (e) => {
        if (!heroSection || !scanLine) return;
        const heroRect = heroSection.getBoundingClientRect();
        const relY     = e.clientY - heroRect.top;
        if (relY >= 0 && relY <= heroRect.height) {
            scanLine.style.top = relY + 'px';
        }
    });

    // ── 7. COORDINATE HUD ────────────────────────────────────
    document.addEventListener('mousemove', (e) => {
        if (!coordDisplay) return;
        const heroRect = heroSection.getBoundingClientRect();
        const rx = Math.max(0, Math.round(e.clientX - heroRect.left));
        const ry = Math.max(0, Math.round(e.clientY - heroRect.top));
        coordDisplay.textContent = `X:${String(rx).padStart(4,'0')} // Y:${String(ry).padStart(4,'0')}`;
    });

    // ── 8. MATRIX RAIN CANVAS ────────────────────────────────
    (function initMatrix() {
        const canvas = document.getElementById('matrixCanvas');
        if (!canvas) return;
        const ctx    = canvas.getContext('2d');
        const chars  = '01アイウエオカキクケコ<>/{}[]|\\:-_=+!?#'.split('');

        function resize() {
            canvas.width  = heroSection.offsetWidth;
            canvas.height = heroSection.offsetHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        const fontSize = 13;
        let cols = Math.floor(canvas.width / fontSize);
        let drops = Array(cols).fill(1);

        function draw() {
            ctx.fillStyle = 'rgba(0,0,0,0.04)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.font = fontSize + 'px Fira Code';

            for (let i = 0; i < drops.length; i++) {
                const char = chars[Math.floor(Math.random() * chars.length)];
                // Alternate column colors
                ctx.fillStyle = i % 3 === 0 ? '#00ff41' : i % 3 === 1 ? '#00d4ff' : '#ff2e2e';
                ctx.fillText(char, i * fontSize, drops[i] * fontSize);
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
                drops[i]++;
            }

            requestAnimationFrame(draw);
        }

        requestAnimationFrame(draw);
    })();

    // ── 9. FLOATING TECH NODES ───────────────────────────────
    (function spawnNodes() {
        if (!techNodesEl) return;
        const colors = ['#00ff41', '#00d4ff', '#ff2e2e'];
        const labels = ['0x', 'SSH', 'TCP', '443', 'UDP', 'RSA', 'AES', '{}', '//', '##'];

        function createNode() {
            const node       = document.createElement('div');
            const color      = colors[Math.floor(Math.random() * colors.length)];
            const useLabel   = Math.random() > 0.55;
            const size       = useLabel ? null : (3 + Math.random() * 6);
            const duration   = 6 + Math.random() * 10;
            const leftPct    = Math.random() * 100;
            const delay      = Math.random() * 3;

            if (useLabel) {
                node.style.cssText = `
                    position: absolute;
                    font-family: 'Fira Code', monospace;
                    font-size: ${9 + Math.random() * 5}px;
                    color: ${color};
                    opacity: 0;
                    left: ${leftPct}%;
                    bottom: -5%;
                    text-shadow: 0 0 6px ${color};
                    animation: nodeFloat ${duration}s linear ${delay}s infinite;
                    pointer-events: none;
                `;
                node.textContent = labels[Math.floor(Math.random() * labels.length)];
            } else {
                node.className  = 't-node';
                node.style.cssText += `
                    width: ${size}px;
                    height: ${size}px;
                    color: ${color};
                    background: ${color};
                    left: ${leftPct}%;
                    bottom: -5%;
                    animation-duration: ${duration}s;
                    animation-delay: ${delay}s;
                `;
            }

            techNodesEl.appendChild(node);
            // Remove after 5 cycles to avoid DOM bloat
            setTimeout(() => node.remove(), (duration + delay) * 1000 * 5);
        }

        // Spawn 18 initial nodes
        for (let i = 0; i < 18; i++) createNode();
        // Keep spawning
        setInterval(createNode, 1200);
    })();

    // ── 10. MAGNETIC BUTTONS ────────────────────────────────
    document.querySelectorAll('.magnetic-btn').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect   = btn.getBoundingClientRect();
            const cx     = rect.left + rect.width  / 2;
            const cy     = rect.top  + rect.height / 2;
            const dx     = e.clientX - cx;
            const dy     = e.clientY - cy;
            const strength = 0.35;
            btn.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
            btn.style.boxShadow = '0 0 25px rgba(0,255,65,0.4)';
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0, 0)';
            btn.style.boxShadow = '';
        });
    });

})(); // end IIFE

// ============================================================
//  LIBRARY INITIALISATIONS & UI LOGIC
// ============================================================

// AOS
AOS.init({ duration: 1000, easing: 'ease-in-out', once: true });

// Particles.js
particlesJS('particles-js', {
    "particles": {
        "number": { "value": 60, "density": { "enable": true, "value_area": 800 } },
        "color": { "value": ["#00ff41", "#00d4ff", "#ff2e2e"] },
        "shape": { "type": "circle" },
        "opacity": { "value": 0.4, "random": true },
        "size": { "value": 2, "random": true },
        "line_linked": { "enable": true, "distance": 140, "color": "#00d4ff", "opacity": 0.08, "width": 1 },
        "move": { "enable": true, "speed": 1.5, "out_mode": "out" }
    },
    "interactivity": {
        "events": {
            "onhover": { "enable": true, "mode": "grab" },
            "onclick": { "enable": true, "mode": "push" }
        },
        "modes": { "grab": { "distance": 180 }, "push": { "particles_nb": 3 } }
    },
    "retina_detect": true
});

// Typed.js
const typed = new Typed('#typed', {
    strings: [
        'Ethical Hacker^1000',
        'Penetration Tester^1000',
        'Vulnerability Researcher^1000',
        'Security Analyst^1000',
        'Full-Stack Developer^1000'
    ],
    typeSpeed: 50,
    backSpeed: 30,
    loop: true,
    cursorChar: '_',
    autoInsertCss: true,
});

// Navbar scroll glass + back-to-top + scroll progress
const navbar         = document.querySelector('.navbar');
const backToTop      = document.getElementById('backToTop');
const scrollProgress = document.getElementById('scrollProgress');

window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
    backToTop.style.display = window.scrollY > 300 ? 'flex' : 'none';

    const winScroll = document.documentElement.scrollTop;
    const height    = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    if (height > 0) scrollProgress.style.width = ((winScroll / height) * 100) + '%';
});

backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));


// Loader
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => loader.style.display = 'none', 500);
    }, 1500);
});

// Form Validation
(() => {
    'use strict';
    document.querySelectorAll('.needs-validation').forEach(form => {
        form.addEventListener('submit', e => {
            e.preventDefault();
            if (!form.checkValidity()) {
                form.classList.add('was-validated');
            } else {
                alert('Handshake Successful! Your message has been encrypted and sent.');
                form.reset();
                form.classList.remove('was-validated');
            }
        });
    });
})();
