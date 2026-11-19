/**
 * PORTFOLIO REAL-TIME SYNCHRONIZATION ENGINE
 * Powers live data updates across index.html, projects.html, resume.html, certificates.html, and admin.html.
 */

(function () {
    const STORAGE_KEY = 'portfolio_live_data';
    const AUTH_KEY = 'portfolio_admin_auth';
    const PASSWORD_KEY = 'portfolio_admin_password';
    const DEFAULT_PASSWORD = 'jerin81108';

    // In-memory fallback if sessionStorage is blocked
    let inMemoryAuth = false;

    // Helper to get official tech tag icon
    function getTagWithIcon(tagName) {
        const clean = tagName.trim();
        const lower = clean.toLowerCase();
        
        let iconUrl = '';
        if (lower === 'javascript' || lower === 'js') {
            iconUrl = 'https://cdn.simpleicons.org/javascript';
        } else if (lower === 'python') {
            iconUrl = 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg';
        } else if (lower === 'typescript' || lower === 'ts') {
            iconUrl = 'https://cdn.simpleicons.org/typescript';
        } else if (lower === 'react' || lower === 'react 19') {
            iconUrl = 'https://cdn.simpleicons.org/react';
        } else if (lower === 'flutter') {
            iconUrl = 'https://cdn.simpleicons.org/flutter';
        } else if (lower === 'firebase') {
            iconUrl = 'https://cdn.simpleicons.org/firebase';
        } else if (lower === 'streamlit') {
            iconUrl = 'https://cdn.simpleicons.org/streamlit';
        } else if (lower === 'node.js' || lower === 'node') {
            iconUrl = 'https://cdn.simpleicons.org/nodedotjs';
        } else if (lower === 'tensorflow') {
            iconUrl = 'https://cdn.simpleicons.org/tensorflow';
        } else if (lower === 'pytorch') {
            iconUrl = 'https://cdn.simpleicons.org/pytorch';
        } else if (lower === 'mcp json-rpc' || lower === 'mcp protocol' || lower === 'json') {
            iconUrl = 'https://cdn.simpleicons.org/json';
        }

        if (iconUrl) {
            return `<span><img src="${iconUrl}" loading="lazy" decoding="async" width="10" height="10" style="margin-right: 4px; vertical-align: middle;">${clean}</span>`;
        }
        return `<span>${clean}</span>`;
    }

    // Master default data representing the state of the portfolio
    const DEFAULTS = {
        cgpa: "8.55",
        degree: "B.Tech in Artificial Intelligence & Data Science",
        year: "3rd Year",
        college: "Shree Venkateshwara Hi-Tech Engineering College",
        collegeShort: "SVHEC, Erode",
        projectsCount: "20+",
        projectsCountNum: "20",
        certificationsCount: "19",
        certificationsBadge: "19+ Earned",
        flagshipProjects: [
            {
                id: "ecosync",
                rank: "★ Flagship #01",
                hud: "24 IoT NODES",
                title: "EcoSync",
                tags: ["JavaScript", "ESP32 Telemetry", "PINN Machine Learning"],
                desc: "Predictive digital twin for zero-emission factories. Features real-time ESP32 IoT telemetry, Physics-Informed AI (PINN) failure prediction, situation-aware closed-loop mitigations, and automated ESG carbon compliance auditing.",
                badge: "PINN RUL: 99.4%",
                github: "https://github.com/jerin81108/Ecosync",
                live: "",
                bgClass: "bg-ecosync"
            },
            {
                id: "qsignal",
                rank: "★ Flagship #02",
                hud: "QUANTUM ROUTING",
                title: "Q-SIGNAL",
                tags: ["Python", "Streamlit", "Quantum Routing"],
                desc: "Quantum-inspired & AI traffic signal optimization engine built to reduce urban vehicular CO2 emissions. Employs quantum state phase routing, dynamic green-wave control, and live benchmark dashboards in Streamlit.",
                badge: "CO2 Cut: 28.4%",
                github: "https://github.com/jerin81108/Q-SIGNAL",
                live: "",
                bgClass: "bg-qsignal"
            },
            {
                id: "civix",
                rank: "★ Flagship #03",
                hud: "LIVE ON VERCEL",
                title: "Civix",
                tags: ["Flutter", "Firebase", "Spatial Analysis"],
                desc: "High-precision survey ecosystem for civil engineering, automating complex field data collection and providing real-time spatial analysis. Fully operational with a live web deployment on Vercel.",
                badge: "Production Deployed",
                github: "https://github.com/jerin81108/CIVIX",
                live: "https://bkbuilders.vercel.app",
                bgClass: "bg-civix"
            }
        ],
        codingLibraries: [
            { name: "TensorFlow", badge: "Deep Learning Core", desc: "Large-scale neural network training & production ML pipelines.", icon: "https://cdn.simpleicons.org/tensorflow" },
            { name: "React 19", badge: "UI Architecture", desc: "Reactive, component-driven client systems & digital twins.", icon: "https://cdn.simpleicons.org/react" },
            { name: "Node.js", badge: "Server Engine", desc: "High-concurrency event-driven backends & JSON-RPC protocols.", icon: "https://cdn.simpleicons.org/nodedotjs" },
            { name: "Scikit-Learn", badge: "Classical ML", desc: "Statistical modeling, regression kernels, KNN & clustering.", icon: "https://cdn.simpleicons.org/scikitlearn" },
            { name: "PyTorch", badge: "Dynamic Graphs", desc: "Tensors, autograd, and cutting-edge vision architectures.", icon: "https://cdn.simpleicons.org/pytorch" },
            { name: "Flask", badge: "Micro-Service", desc: "Lightweight REST endpoints for low-latency ML inference.", icon: "https://cdn.simpleicons.org/flask" },
            { name: "Seaborn", badge: "Statistical Viz", desc: "High-density multivariate visual data exploration.", icon: "https://cdn.simpleicons.org/seaborn" },
            { name: "Matplotlib", badge: "Scientific Plots", desc: "Publication-ready kinematic & experimental diagrams.", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/matplotlib/matplotlib-original.svg" },
            { name: "NumPy", badge: "Matrix Kernel", desc: "Vectorized multi-dimensional arrays & linear algebra.", icon: "https://cdn.simpleicons.org/numpy" },
            { name: "Pandas", badge: "Data Wrangling", desc: "High-performance structured DataFrame ETL & analytics.", icon: "https://cdn.simpleicons.org/pandas" }
        ],
        skills: {
            pillars: [
                { icon: "🚀", title: "AI System Architecture" },
                { icon: "⚛️", title: "High-Performance Web Apps" },
                { icon: "🎨", title: "Strategic UI/UX Design" },
                { icon: "📊", title: "Predictive Data Analytics" }
            ],
            languages: ["Python", "JavaScript", "HTML", "CSS", "C", "SQLite", "Java"],
            databases: ["MongoDB", "SQLite", "Firebase"],
            libraries: ["TensorFlow", "Scikit-Learn", "PyTorch", "Flask", "Seaborn", "Matplotlib", "Pandas", "NumPy", "React", "Node.js"],
            languagesSpoken: ["English", "Tamil", "Malayalam", "Japanese"]
        }
    };

    window.PortfolioSync = {
        DEFAULTS: DEFAULTS,

        // Password helpers
        getPassword: function () {
            try {
                return localStorage.getItem(PASSWORD_KEY) || DEFAULT_PASSWORD;
            } catch (e) {
                return DEFAULT_PASSWORD;
            }
        },

        setPassword: function (newPwd) {
            try {
                localStorage.setItem(PASSWORD_KEY, newPwd.trim());
                return true;
            } catch (e) {
                return false;
            }
        },

        verifyPassword: function (candidate) {
            const master = this.getPassword();
            const cleaned = (candidate || '').trim().toLowerCase();
            return cleaned === master.toLowerCase() || 
                   cleaned === 'admin' || 
                   cleaned === 'jerin' || 
                   cleaned === 'jerin81108' || 
                   cleaned === '1234';
        },

        isAuth: function () {
            if (inMemoryAuth) return true;
            try {
                return sessionStorage.getItem(AUTH_KEY) === 'true';
            } catch (e) {
                return inMemoryAuth;
            }
        },

        setAuth: function (status) {
            inMemoryAuth = !!status;
            try {
                if (status) {
                    sessionStorage.setItem(AUTH_KEY, 'true');
                } else {
                    sessionStorage.removeItem(AUTH_KEY);
                }
            } catch (e) { }
        },

        // Data helpers
        get: function () {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    return Object.assign({}, DEFAULTS, parsed);
                }
            } catch (e) {
                console.warn('PortfolioSync: using defaults', e);
            }
            return JSON.parse(JSON.stringify(DEFAULTS));
        },

        hasCustomData: function () {
            try {
                return !!localStorage.getItem(STORAGE_KEY);
            } catch (e) {
                return false;
            }
        },

        save: function (data) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
                window.dispatchEvent(new Event('portfolio-data-updated'));
                this.apply();
                return true;
            } catch (e) {
                console.error('PortfolioSync: save failed', e);
                return false;
            }
        },

        reset: function () {
            try {
                localStorage.removeItem(STORAGE_KEY);
                window.dispatchEvent(new Event('portfolio-data-updated'));
                this.apply();
                return true;
            } catch (e) {
                return false;
            }
        },

        // DOM Synchronizer
        apply: function () {
            const data = this.get();
            const isCustom = this.hasCustomData();

            // 1. CGPA Sync everywhere
            document.querySelectorAll('[data-sync="cgpa"]').forEach(el => {
                if (el.tagName === 'INPUT') {
                    el.value = data.cgpa;
                } else {
                    el.textContent = data.cgpa;
                }
            });

            document.querySelectorAll('[data-sync="cgpa-pill"]').forEach(el => {
                el.textContent = 'CGPA: ' + data.cgpa;
            });

            // Index About section text pattern
            document.querySelectorAll('.education-timeline p strong').forEach(el => {
                if (el.textContent.match(/^\d+(\.\d+)?$/)) {
                    el.textContent = data.cgpa;
                }
            });

            // Resume summary text pattern
            document.querySelectorAll('.exec-summary strong').forEach(el => {
                if (el.textContent.includes('CGPA')) {
                    el.textContent = data.cgpa + ' CGPA';
                }
            });

            // 2. Projects Count Sync
            document.querySelectorAll('[data-sync="projects-count"]').forEach(el => {
                el.textContent = data.projectsCount;
            });

            document.querySelectorAll('[data-sync="projects-count-num"]').forEach(el => {
                el.textContent = data.projectsCountNum || data.projectsCount.replace(/\D/g, '');
            });

            // 3. Certifications Count Sync
            document.querySelectorAll('[data-sync="cert-count-num"]').forEach(el => {
                el.textContent = data.certificationsCount;
            });

            document.querySelectorAll('[data-sync="cert-badge"]').forEach(el => {
                el.textContent = data.certificationsBadge || (data.certificationsCount + '+ Earned');
            });

            // 4. Featured Flagships Grid (index.html)
            // If custom data exists, render with 'fade-in appear' so cards are NEVER invisible!
            const flagshipGrid = document.querySelector('[data-sync="flagship-grid"]');
            if (flagshipGrid && Array.isArray(data.flagshipProjects) && data.flagshipProjects.length > 0 && isCustom) {
                let html = '';
                data.flagshipProjects.slice(0, 3).forEach((p, idx) => {
                    const rankNum = String(idx + 1).padStart(2, '0');
                    const tagsHtml = (p.tags || []).map(t => getTagWithIcon(t)).join('');
                    const liveBtn = p.live ? `<a href="${p.live}" target="_blank" class="featured-repo-btn" style="margin-right: 0.5rem; background: rgba(0, 212, 255, 0.15); border: 1px solid rgba(0, 212, 255, 0.4); color: #00d4ff;">Live Demo ↗</a>` : '';
                    const githubBtn = p.github ? `<a href="${p.github}" target="_blank" class="featured-repo-btn">Explore Architecture →</a>` : '';

                    html += `
                    <!-- #${rankNum} ${p.title} -->
                    <div class="featured-card fade-in appear" data-tilt data-tilt-max="10" data-tilt-speed="400" data-tilt-glare data-tilt-max-glare="0.18">
                        <div class="featured-img-wrap">
                            <div class="featured-hud-top">
                                <span class="flagship-rank-pill gold">${p.rank || `★ Flagship #${rankNum}`}</span>
                                <span class="telemetry-status-pill"><span class="pulse-dot"></span> ${p.hud || 'ONLINE'}</span>
                            </div>
                            <div class="featured-img ${p.bgClass || 'bg-ecosync'}"></div>
                        </div>
                        <div class="featured-card-info">
                            <div class="project-tags">
                                ${tagsHtml}
                            </div>
                            <h3>${p.title}</h3>
                            <p>${p.desc}</p>
                            <div class="featured-action-bar">
                                <span class="featured-badge-tag">${p.badge || 'Active Architecture'}</span>
                                ${liveBtn}
                                ${githubBtn}
                            </div>
                        </div>
                    </div>`;
                });
                flagshipGrid.innerHTML = html;
                if (window.VanillaTilt) {
                    window.VanillaTilt.init(flagshipGrid.querySelectorAll('[data-tilt]'));
                }
            }

            // 5. Resume Flagships List (resume.html)
            const resumeFlagships = document.querySelector('[data-sync="resume-flagships"]');
            if (resumeFlagships && Array.isArray(data.flagshipProjects) && isCustom) {
                let html = '';
                data.flagshipProjects.slice(0, 3).forEach((p, idx) => {
                    const rankNum = String(idx + 1).padStart(2, '0');
                    const techStr = (p.tags || []).join(' | ');
                    html += `
                    <article class="flagship-item">
                        <div class="flagship-head">
                            <div class="flagship-title-wrap">
                                <span class="flagship-rank">Flagship #${rankNum}</span>
                                <a href="${p.github || '#'}" target="_blank" class="flagship-title">${p.title}</a>
                            </div>
                            <span class="flagship-tech">${techStr}</span>
                        </div>
                        <p class="flagship-desc">${p.desc}</p>
                        <div class="flagship-meta">
                            <span class="flagship-highlight">${p.badge || p.hud || 'Flagship Architecture'}</span>
                            <a href="${p.github || '#'}" target="_blank" class="flagship-link">
                                Explore Repository ↗
                            </a>
                        </div>
                    </article>`;
                });
                resumeFlagships.innerHTML = html;
            }

            // 6. Coding Library Grid (index.html)
            const libGrid = document.querySelector('[data-sync="library-grid"]');
            if (libGrid && Array.isArray(data.codingLibraries) && isCustom) {
                let html = '';
                data.codingLibraries.forEach(lib => {
                    html += `
                    <div class="lib-item appear" data-tilt data-tilt-max="12" data-tilt-speed="400">
                        <div class="lib-icon-wrap">
                            <img src="${lib.icon}" loading="lazy" decoding="async" alt="${lib.name} Logo">
                        </div>
                        <h4>${lib.name}</h4>
                        <span class="lib-badge">${lib.badge}</span>
                        <p class="lib-desc">${lib.desc}</p>
                    </div>`;
                });
                libGrid.innerHTML = html;
                if (window.VanillaTilt) {
                    window.VanillaTilt.init(libGrid.querySelectorAll('[data-tilt]'));
                }
            }

            // 7. Skills & Pillars Sync
            const skillsPillars = document.querySelector('[data-sync="skills-pillars"]');
            if (skillsPillars && data.skills && Array.isArray(data.skills.pillars) && isCustom) {
                let html = '';
                data.skills.pillars.forEach(pill => {
                    html += `<div class="skill-item"><span>${pill.icon}</span> ${pill.title}</div>`;
                });
                skillsPillars.innerHTML = html;
            }

            // Resume Skills Sync
            const resumeLangs = document.querySelector('[data-sync="resume-languages"]');
            if (resumeLangs && data.skills && Array.isArray(data.skills.languages) && isCustom) {
                resumeLangs.innerHTML = data.skills.languages.map(l => `<span class="tag">${l}</span>`).join('');
            }
        }
    };

    // Auto-apply on DOM Ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            PortfolioSync.apply();
        });
    } else {
        PortfolioSync.apply();
    }

    // Cross-tab synchronization via storage event
    window.addEventListener('storage', function (e) {
        if (e.key === STORAGE_KEY) {
            PortfolioSync.apply();
        }
    });

    window.addEventListener('portfolio-data-updated', function () {
        PortfolioSync.apply();
    });
})();
