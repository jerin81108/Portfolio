/**
 * JERIN J — Live GitHub Repository Explorer Component
 * Dynamic File Tree & Code Viewer leveraging GitHub REST API
 */
document.addEventListener('DOMContentLoaded', () => {
    // Select selectors on both root index and portfolio sub-index
    const repoSelect = document.getElementById('gh-repo-select');
    const fileTreeContainer = document.getElementById('gh-file-tree');
    const codeContentContainer = document.getElementById('gh-code-content');
    const codeFilename = document.getElementById('gh-code-filename');
    const loadingOverlay = document.getElementById('gh-loading');
    const currentRepoName = document.getElementById('gh-current-repo');
    const rateLimitWarning = document.getElementById('gh-rate-limit');

    if (!repoSelect || !fileTreeContainer || !codeContentContainer) return;

    const username = 'jerin81108';
    let activeRepo = repoSelect.value;
    let fileCache = {};

    // Simple custom syntax highlighting regex dictionary
    const highlightCode = (code, filename) => {
        const ext = filename.split('.').pop().toLowerCase();
        
        // Escape HTML tags to prevent rendering issues
        let escaped = code
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        if (['js', 'jsx', 'ts', 'tsx'].includes(ext)) {
            escaped = escaped
                .replace(/\b(const|let|var|function|return|class|export|import|from|default|extends|new|this|typeof|if|else|for|while|async|await|try|catch)\b/g, '<span style="color: #6366f1; font-weight: 600;">$1</span>')
                .replace(/\b(true|false|null|undefined)\b/g, '<span style="color: #a855f7;">$1</span>')
                .replace(/(".*?"|'.*?'|`.*?`)/g, '<span style="color: #10b981;">$1</span>')
                .replace(/(\/\/.*$)/gm, '<span style="color: #64748b; font-style: italic;">$1</span>')
                .replace(/(\/\*[\s\S]*?\*\/)/g, '<span style="color: #64748b; font-style: italic;">$1</span>');
        } else if (ext === 'py') {
            escaped = escaped
                .replace(/\b(def|class|return|import|from|as|if|elif|else|for|while|in|is|not|and|or|try|except|with|lambda|global|nonlocal|pass)\b/g, '<span style="color: #6366f1; font-weight: 600;">$1</span>')
                .replace(/\b(True|False|None)\b/g, '<span style="color: #a855f7;">$1</span>')
                .replace(/(".*?"|'.*?'|""".*?"""|'''.*?''')/g, '<span style="color: #10b981;">$1</span>')
                .replace(/(#.*$)/gm, '<span style="color: #64748b; font-style: italic;">$1</span>');
        } else if (ext === 'html') {
            escaped = escaped
                .replace(/(&lt;\/?[a-zA-Z0-9:-]+)/g, '<span style="color: #3b82f6; font-weight: 600;">$1</span>')
                .replace(/(\s[a-zA-Z0-9:-]+=)/g, '<span style="color: #a855f7;">$1</span>')
                .replace(/(".*?"|'.*?')/g, '<span style="color: #10b981;">$1</span>')
                .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span style="color: #64748b; font-style: italic;">$1</span>');
        } else if (ext === 'css') {
            escaped = escaped
                .replace(/([a-zA-Z-]+\s*:)/g, '<span style="color: #3b82f6;">$1</span>')
                .replace(/(#[a-zA-Z0-9_-]+|\.[a-zA-Z0-9_-]+|\b[a-zA-Z0-9_-]+\b\s*\{)/g, '<span style="color: #6366f1; font-weight: 600;">$1</span>')
                .replace(/(:[a-zA-Z-]+\b)/g, '<span style="color: #a855f7;">$1</span>')
                .replace(/(\/\*[\s\S]*?\*\/)/g, '<span style="color: #64748b; font-style: italic;">$1</span>');
        } else if (['cpp', 'c', 'h', 'hpp', 'java'].includes(ext)) {
            escaped = escaped
                .replace(/\b(int|float|double|char|void|class|struct|public|private|protected|return|if|else|for|while|switch|case|break|continue|new|delete|include|import|package)\b/g, '<span style="color: #6366f1; font-weight: 600;">$1</span>')
                .replace(/(".*?"|'.*?')/g, '<span style="color: #10b981;">$1</span>')
                .replace(/(\/\/.*$)/gm, '<span style="color: #64748b; font-style: italic;">$1</span>')
                .replace(/(\/\*[\s\S]*?\*\/)/g, '<span style="color: #64748b; font-style: italic;">$1</span>');
        } else if (ext === 'sql') {
            escaped = escaped
                .replace(/\b(SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|ON|GROUP|BY|ORDER|HAVING|CREATE|TABLE|INSERT|INTO|VALUES|UPDATE|SET|DELETE|DROP|PRIMARY|KEY|FOREIGN|INDEX|AND|OR|IN|AS|LIMIT)\b/gi, '<span style="color: #3b82f6; font-weight: 600;">$1</span>')
                .replace(/(".*?"|'.*?'|[0-9]+)/g, '<span style="color: #10b981;">$1</span>')
                .replace(/(--.*$)/gm, '<span style="color: #64748b; font-style: italic;">$1</span>');
        }

        // Add line numbering wrapper
        const lines = escaped.split('\n');
        const numbered = lines.map((line, idx) => {
            return `<div style="display: flex; line-height: 1.5;"><span style="color: #475569; user-select: none; width: 3.5rem; text-align: right; padding-right: 1.5rem; border-right: 1px solid #1e293b; margin-right: 1rem;">${idx + 1}</span><span style="flex: 1; white-space: pre-wrap;">${line || ' '}</span></div>`;
        }).join('');

        return numbered;
    };

    // Show loading spinner
    const toggleLoading = (show) => {
        if (loadingOverlay) {
            loadingOverlay.style.opacity = show ? '1' : '0';
            loadingOverlay.style.pointerEvents = show ? 'all' : 'none';
        }
    };

    // Fetch API handler with fallback
    const fetchGitHubContents = async (repo, path = '') => {
        const cacheKey = `${repo}/${path}`;
        if (fileCache[cacheKey]) return fileCache[cacheKey];

        try {
            const res = await fetch(`https://api.github.com/repos/${username}/${repo}/contents/${path}`);
            if (res.status === 403) {
                // Rate limit hit
                if (rateLimitWarning) rateLimitWarning.style.display = 'block';
                throw new Error('API Rate Limit Exceeded');
            }
            if (!res.ok) throw new Error('Repository Contents Unavailable');
            
            const data = await res.json();
            fileCache[cacheKey] = data;
            return data;
        } catch (err) {
            console.warn(err.message);
            return getLocalFallback(repo, path);
        }
    };

    // Beautiful static code fallback to ensure offline / rate-limited visitors are always impressed!
    const getLocalFallback = (repo, path) => {
        if (repo === 'Portfolio' || repo === 'portfolio') {
            if (!path) {
                return [
                    { name: 'index.html', path: 'index.html', type: 'file', size: 38405 },
                    { name: 'style.css', path: 'style.css', type: 'file', size: 39159 },
                    { name: 'script.js', path: 'script.js', type: 'file', size: 13882 },
                    { name: 'certificates.html', path: 'certificates.html', type: 'file', size: 28423 },
                    { name: 'images', path: 'images', type: 'dir', size: 0 }
                ];
            } else if (path === 'index.html') {
                return { type: 'file', content: `<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <title>JERIN J | AI Architect</title>\n    <!-- Live Portfolio File Explorer Fallback -->\n</head>\n<body>\n    <!-- Loaded dynamically from jerin81108/Portfolio -->\n</body>\n</html>` };
            } else if (path === 'script.js') {
                return { type: 'file', content: `document.addEventListener('DOMContentLoaded', () => {\n    console.log("Welcome to Jerin J's premium engineering portfolio console.");\n});` };
            }
        }
        
        // General project fallbacks
        if (!path) {
            return [
                { name: 'README.md', path: 'README.md', type: 'file', size: 1240 },
                { name: 'src', path: 'src', type: 'dir', size: 0 },
                { name: 'package.json', path: 'package.json', type: 'file', size: 450 }
            ];
        }
        if (path === 'README.md') {
            return { type: 'file', content: `# ${repo.toUpperCase()}\n\nOfficial codebase of Captain Jerin J — SVHEC.\n\n### Core Stack\n* Artificial Intelligence & Neural Networks\n* High-Performance Digital Frameworks` };
        }
        return { type: 'file', content: `// File details for ${path} inside ${repo} database.\n// Live Github connection rate limited — fallback displayed.` };
    };

    // Load file tree folder contents
    const loadFolder = async (repo, path = '', containerElement = fileTreeContainer) => {
        toggleLoading(true);
        const contents = await fetchGitHubContents(repo, path);
        toggleLoading(false);

        if (!contents) return;

        // Sort: folders first, then files alphabetically
        const sorted = Array.isArray(contents) ? contents.sort((a, b) => {
            if (a.type === b.type) return a.name.localeCompare(b.name);
            return a.type === 'dir' ? -1 : 1;
        }) : [contents];

        containerElement.innerHTML = '';

        // Add back/up navigation if inside a subfolder
        if (path) {
            const upNode = document.createElement('div');
            upNode.className = 'gh-tree-node up-dir';
            upNode.innerHTML = `📁 <span style="font-weight:700;">..</span>`;
            upNode.style.paddingLeft = '0.5rem';
            upNode.style.cursor = 'pointer';
            upNode.addEventListener('click', () => {
                const parentPath = path.substring(0, path.lastIndexOf('/'));
                loadFolder(repo, parentPath);
            });
            containerElement.appendChild(upNode);
        }

        sorted.forEach(node => {
            const item = document.createElement('div');
            item.className = `gh-tree-node ${node.type}`;
            item.style.paddingLeft = '0.5rem';
            
            const icon = node.type === 'dir' ? '📁' : '📄';
            item.innerHTML = `${icon} <span>${node.name}</span>`;

            item.addEventListener('click', async () => {
                // Highlight active item
                document.querySelectorAll('.gh-tree-node').forEach(n => n.classList.remove('active'));
                item.classList.add('active');

                if (node.type === 'dir') {
                    loadFolder(repo, node.path);
                } else {
                    toggleLoading(true);
                    let rawContent = '';
                    
                    try {
                        const fileDetails = await fetchGitHubContents(repo, node.path);
                        if (fileDetails.content) {
                            // GitHub base64 encoded content
                            rawContent = atob(fileDetails.content.replace(/\s/g, ''));
                        } else if (fileDetails.download_url) {
                            // Raw file direct download
                            const rawRes = await fetch(fileDetails.download_url);
                            rawContent = await rawRes.text();
                        } else {
                            rawContent = fileDetails;
                        }
                    } catch (e) {
                        const fb = getLocalFallback(repo, node.path);
                        rawContent = fb.content || fb;
                    }

                    toggleLoading(false);
                    codeFilename.textContent = node.name;
                    codeContentContainer.innerHTML = highlightCode(rawContent, node.name);
                }
            });

            containerElement.appendChild(item);
        });
    };

    // Select different repository
    const initRepoChange = () => {
        activeRepo = repoSelect.value;
        if (currentRepoName) currentRepoName.textContent = activeRepo;
        
        // Reset code panel
        codeFilename.textContent = 'Select a file';
        codeContentContainer.innerHTML = `<div style="padding: 2.5rem; text-align: center; color: var(--text-muted); font-size: 0.95rem; font-style: italic;">Select any file from the secure dossier file tree to read code.</div>`;
        
        loadFolder(activeRepo);
    };

    repoSelect.addEventListener('change', initRepoChange);

    // Initial launch
    initRepoChange();
});
