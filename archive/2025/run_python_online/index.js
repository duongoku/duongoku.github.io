document.addEventListener('DOMContentLoaded', () => {
    const runButton = document.getElementById('run-button');
    const mobileRunButton = document.getElementById('mobile-run-btn');
    const codeEditor = CodeMirror(document.getElementById('code'), {
        mode: 'python',
        theme: 'default',
        lineNumbers: true,
        indentUnit: 4,
        smartIndent: true,
        tabSize: 4,
        indentWithTabs: false,
        lineWrapping: true,
        autoCloseBrackets: true,
    });
    const outputDiv = document.getElementById('output');
    const problemSelector = document.getElementById('problem-selector');
    const problemTitle = document.getElementById('problem-title');
    const problemDescription = document.getElementById(
        'problem-description-content'
    );
    const themeToggle = document.getElementById('theme-toggle');
    const validateButton = document.getElementById('validate-btn');
    const problemTabs = document.getElementById('problem-tabs');
    const addTabButton = document.getElementById('add-tab-btn');
    const mobileToggleButton = document.getElementById('mobile-toggle-panel');
    const executionTimeSpan = document.getElementById('execution-time');
    const progressText = document.getElementById('progress-text');
    const validationResult = document.getElementById('validation-result');

    let problems = [];
    let currentProblem = null;
    let currentTabId = 1;
    let tabs = new Map();
    let activeTabId = 1;
    let isMobilePanelLeftActive = true;

    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeToggleText(savedTheme);

    function updateThemeToggleText(theme) {
        themeToggle.textContent =
            theme === 'dark' ? '☀️ Chế độ sáng' : '🌙 Chế độ tối';
    }

    themeToggle.addEventListener('click', () => {
        const currentTheme =
            document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeToggleText(newTheme);
    });

    mobileToggleButton.addEventListener('click', () => {
        const leftPanel = document.querySelector('.left-panel');
        const rightPanel = document.querySelector('.right-panel');

        isMobilePanelLeftActive = !isMobilePanelLeftActive;

        if (isMobilePanelLeftActive) {
            leftPanel.classList.add('active');
            rightPanel.classList.remove('active');
            mobileToggleButton.textContent = 'Xem đề bài';
        } else {
            leftPanel.classList.remove('active');
            rightPanel.classList.add('active');
            mobileToggleButton.textContent = 'Quay lại code';
        }
    });

    function createNewTab(problemId = 0) {
        const tabId = currentTabId++;
        const tabElement = document.createElement('button');
        tabElement.className = 'tab';
        tabElement.textContent = `Bài ${tabId}`;
        tabElement.setAttribute('data-tab-id', tabId);

        const problem = problems[problemId];
        tabs.set(tabId, {
            id: tabId,
            problemId: problemId,
            code: problem
                ? problem.initialCode
                : '# Viết code Python của bạn ở đây\nprint("Xin chào!")',
            title: problem ? problem.title : `Bài ${tabId}`,
        });

        tabElement.addEventListener('click', () => switchTab(tabId));
        problemTabs.appendChild(tabElement);

        if (tabs.size === 1) {
            switchTab(tabId);
        }

        return tabId;
    }

    function switchTab(tabId) {
        document.querySelectorAll('.tab').forEach((tab) => {
            tab.classList.toggle(
                'active',
                tab.getAttribute('data-tab-id') == tabId
            );
        });

        activeTabId = tabId;
        const tabData = tabs.get(tabId);

        if (tabData) {
            loadProblem(tabData.problemId, false);
        }
    }

    function updateTabCode() {
        const tabData = tabs.get(activeTabId);
        if (tabData) {
            tabData.code = codeEditor.getValue();
        }
    }

    addTabButton.addEventListener('click', () => {
        createNewTab(0);
    });

    codeEditor.on('change', () => {
        updateTabCode();
        validateSyntax();
    });

    function validateSyntax() {
        const code = codeEditor.getValue();
        validationResult.textContent = '';
        validationResult.className = 'validation-result';

        try {
            __BRYTHON__.py2js(code, 'test');
            validationResult.textContent = '✓ Cú pháp hợp lệ';
            validationResult.classList.add('validation-success');
        } catch (error) {
            message = error.msg;
            message += ' # Line ' + error.lineno;
            message += ': ' + error.text;
            validationResult.textContent = `✗ Lỗi cú pháp: ${message}`;
            validationResult.classList.add('validation-error');
        }
    }

    validateButton.addEventListener('click', validateSyntax);

    async function loadProblems() {
        try {
            const response = await fetch('problems.json');
            problems = await response.json();

            problems.forEach((problem, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = problem.title;
                problemSelector.appendChild(option);
            });

            createNewTab(0);
            updateProgress();
        } catch (error) {
            console.error('Failed to load problems:', error);
            problems = [
                {
                    title: 'Bài tập mẫu',
                    description:
                        '<p>Chào mừng đến với Python Online! Đây là bài tập mẫu.</p>',
                    initialCode:
                        '# Viết code Python của bạn ở đây\nprint("Xin chào!")',
                    testCases: [{ input: '', expectedOutput: 'Xin chào!' }],
                },
            ];
            createNewTab(0);
        }
    }

    function loadProblem(index, resetCode = true) {
        if (!problems[index]) return;

        currentProblem = problems[index];
        problemTitle.textContent = currentProblem.title;
        problemDescription.innerHTML = currentProblem.description;

        const tabData = tabs.get(activeTabId);

        if (resetCode) {
            codeEditor.setValue(currentProblem.initialCode);
            if (tabData) {
                tabData.code = currentProblem.initialCode;
            }
        } else {
            codeEditor.setValue(
                tabData ? tabData.code : currentProblem.initialCode
            );
        }

        outputDiv.innerHTML = 'Nhấn "Chạy Code" để xem kết quả.';
        executionTimeSpan.textContent = '';

        updateTabCode();
        validateSyntax();
    }

    problemSelector.addEventListener('change', (e) => {
        const selectedIndex = parseInt(e.target.value);
        const tabData = tabs.get(activeTabId);

        if (tabData) {
            tabData.problemId = selectedIndex;
            tabData.title = problems[selectedIndex].title.includes(': ')
                ? problems[selectedIndex].title.split(': ')[0]
                : problems[selectedIndex].title;
            document.querySelector(
                `.tab[data-tab-id="${activeTabId}"]`
            ).textContent = tabData.title;
        }

        loadProblem(selectedIndex, true);
    });

    async function runCode() {
        if (!currentProblem) return;

        const startTime = performance.now();
        const userCode = codeEditor.getValue();
        outputDiv.innerHTML = 'Đang chạy...';
        outputDiv.classList.add('loading');

        updateTabCode();

        let resultsHTML = '';
        const testCases = currentProblem.testCases;
        let passedCount = 0;

        for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i];
            const { input, expectedOutput } = testCase;

            let stdout_data = '';
            window.brython_print = (...args) => {
                stdout_data += args.join(' ') + '\n';
            };

            const inputLines = JSON.stringify(input.split('\n'));

            const pythonHeader = `
from browser import window

_input_lines = ${inputLines}
_input_cursor = 0
def input(prompt=None):
    global _input_cursor
    if _input_cursor < len(_input_lines):
        line = _input_lines[_input_cursor]
        _input_cursor += 1
        return line
    raise EOFError("EOF when reading a line")

def print(*args, sep=' ', end='\\n'):
    window.brython_print(*args)
`;
            const fullCode = pythonHeader + userCode;

            try {
                await __BRYTHON__.runPythonSource(fullCode);
            } catch (error) {
                stdout_data = error.toString();
            }
            delete window.brython_print;

            const actualOutput = stdout_data.trim();
            const passed = actualOutput === expectedOutput;
            if (passed) {
                passedCount++;
            }
            const status = passed ? 'pass' : 'fail';
            const statusText = passed ? 'ĐÚNG' : 'SAI';

            resultsHTML += `
                <div class="test-case fade-in">
                    <strong>Trường hợp thử ${
                        i + 1
                    }: <span class="${status}">${statusText}</span></strong>
                    <p><strong>Đầu vào:</strong><pre>${
                        input || '(không có)'
                    }</pre></p>
                    <p><strong>Kết quả mong đợi:</strong><pre>${expectedOutput}</pre></p>
                    <p><strong>Kết quả thực tế:</strong><pre>${actualOutput}</pre></p>
                </div>
            `;
        }

        const endTime = performance.now();
        const executionTime = (endTime - startTime).toFixed(2);

        const summary = `
            <div class="test-case">
                <h3>Kết quả: ${passedCount}/${testCases.length} trường hợp thử đúng</h3>
                <p><strong>Thời gian thực thi:</strong> ${executionTime}ms</p>
            </div>
            <hr>
        `;

        outputDiv.classList.remove('loading');
        outputDiv.innerHTML = summary + resultsHTML;
        executionTimeSpan.textContent = `${executionTime}ms`;

        updateProgress();
    }

    function updateProgress() {
        const solvedCount = Array.from(tabs.values()).filter((tab) => {
            const problem = problems[tab.problemId];
            return problem && problem.testCases && problem.testCases.length > 0;
        }).length;

        progressText.textContent = `${solvedCount}/${problems.length} bài đã giải`;
    }

    runButton.addEventListener('click', runCode);
    mobileRunButton.addEventListener('click', runCode);
    document.addEventListener('keydown', (event) => {
        if (event.ctrlKey && event.key == 'Enter') {
            runCode();
        }
    });

    loadProblems();

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            const leftPanel = document.querySelector('.left-panel');
            const rightPanel = document.querySelector('.right-panel');
            leftPanel.classList.add('active');
            rightPanel.classList.add('active');
        }
    });
});
