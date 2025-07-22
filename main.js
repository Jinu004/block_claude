/**
 * Main Blockly IDE Application
 * Handles workspace initialization, UI interactions, and code generation
 */

// ===== Global Variables =====
let workspace;
let isDarkMode = true;
let currentLanguage = 'javascript';

// Define custom Blockly themes
const lightTheme = Blockly.Theme.defineTheme('lightTheme', {
    'base': Blockly.Themes.Classic,
    'componentStyles': {
        'workspaceBackgroundColour': '#ffffff',
        'toolboxBackgroundColour': '#f8f9fa',
        'toolboxForegroundColour': '#212529',
        'flyoutBackgroundColour': '#f8f9fa',
        'flyoutForegroundColour': '#212529',
        'flyoutOpacity': 1,
        'scrollbarColour': '#797979',
        'insertionMarkerColour': '#fff',
        'insertionMarkerOpacity': 0.3,
        'scrollbarOpacity': 0.4,
        'cursorColour': '#d0d0d0',
        'blackBackground': '#ffffff'
    },
    'blockStyles': {},
    'categoryStyles': {},
    'fontStyle': {},
    'startHats': null
});

const darkTheme = Blockly.Theme.defineTheme('darkTheme', {
    'base': Blockly.Themes.Classic,
    'componentStyles': {
        'workspaceBackgroundColour': '#1a1a1a',
        'toolboxBackgroundColour': '#2d2d2d',
        'toolboxForegroundColour': '#ffffff',
        'flyoutBackgroundColour': '#2d2d2d',
        'flyoutForegroundColour': '#ffffff',
        'flyoutOpacity': 1,
        'scrollbarColour': '#797979',
        'insertionMarkerColour': '#fff',
        'insertionMarkerOpacity': 0.3,
        'scrollbarOpacity': 0.4,
        'cursorColour': '#d0d0d0',
        'blackBackground': '#1a1a1a'
    },
    'blockStyles': {},
    'categoryStyles': {},
    'fontStyle': {},
    'startHats': null
});

// ===== Initialize Application =====
document.addEventListener('DOMContentLoaded', function() {
    initializeBlockly();
    setupEventListeners();
    loadThemePreference();
    addStarterBlocks();
    updateStatus();
    
    // Show welcome message
    updateConsole('Welcome to Blockly IDE! 🚀');
    updateConsole('Drag blocks from the left panel to start programming.');
});

// ===== Blockly Workspace Initialization =====
function initializeBlockly() {
    const toolboxXml = document.getElementById('toolbox');
    
    workspace = Blockly.inject('blocklyDiv', {
        toolbox: toolboxXml,
        collapse: true,
        comments: true,
        disable: true,
        maxBlocks: Infinity,
        trashcan: true,
        horizontalLayout: false,
        toolboxPosition: 'start',
        css: true,
        media: 'https://unpkg.com/blockly/media/',
        rtl: false,
        scrollbars: true,
        sounds: true,
        oneBasedIndex: true,
        theme: lightTheme,
        grid: {
            spacing: 20,
            length: 3,
            colour: '#cccccc',
            snap: true
        },
        zoom: {
            controls: true,
            wheel: true,
            startScale: 1.0,
            maxScale: 3,
            minScale: 0.3,
            scaleSpeed: 1.2
        }
    });

    // Listen to workspace changes
    workspace.addChangeListener(onWorkspaceChange);
    
    // Auto-resize workspace
    window.addEventListener('resize', resizeBlocklyArea);
    resizeBlocklyArea();
}

// ===== Event Listeners Setup =====
function setupEventListeners() {
    // Header buttons
    document.getElementById('runBtn').addEventListener('click', runCode);
    document.getElementById('generateBtn').addEventListener('click', generateCode);
    document.getElementById('saveBtn').addEventListener('click', saveWorkspace);
    document.getElementById('loadBtn').addEventListener('click', loadWorkspace);
    document.getElementById('clearBtn').addEventListener('click', clearWorkspace);
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // Workspace controls
    document.getElementById('undoBtn').addEventListener('click', () => workspace.undo());
    document.getElementById('redoBtn').addEventListener('click', () => workspace.redo());
    document.getElementById('zoomInBtn').addEventListener('click', () => workspace.zoomCenter(1));
    document.getElementById('zoomOutBtn').addEventListener('click', () => workspace.zoomCenter(-1));
    
    // Code panel controls
    document.getElementById('copyCodeBtn').addEventListener('click', copyCode);
    document.getElementById('codeLanguage').addEventListener('change', onLanguageChange);
}

// ===== Workspace Event Handlers =====
function onWorkspaceChange(event) {
    if (event.type === Blockly.Events.FINISHED_LOADING) {
        return;
    }
    
    updateStatus();
    
    // Auto-generate code on changes
    if (event.type === Blockly.Events.BLOCK_MOVE || 
        event.type === Blockly.Events.BLOCK_CREATE || 
        event.type === Blockly.Events.BLOCK_DELETE ||
        event.type === Blockly.Events.BLOCK_CHANGE) {
        
        setTimeout(generateCode, 100); // Debounce
    }
}

function resizeBlocklyArea() {
    const blocklyDiv = document.getElementById('blocklyDiv');
    if (blocklyDiv && workspace) {
        Blockly.svgResize(workspace);
    }
}

// ===== Code Generation =====
function generateCode() {
    try {
        let code = '';
        const language = document.getElementById('codeLanguage').value;
        
        switch(language) {
            case 'javascript':
                code = generateJavaScript();
                break;
            case 'python':
                code = generatePython();
                break;
            case 'arduino':
                code = generateArduino();
                break;
            default:
                code = '// Unsupported language selected';
        }
        
        document.getElementById('codeOutput').textContent = code;
        updateStatus('Code generated successfully');
        
    } catch (error) {
        console.error('Code generation error:', error);
        document.getElementById('codeOutput').textContent = 
            `// Error generating code:\n// ${error.message}`;
        updateStatus('Error generating code', 'error');
    }
}

function generateJavaScript() {
    let code = javascript.javascriptGenerator.workspaceToCode(workspace);
    
    if (!code.trim()) {
        code = '// No blocks in workspace\n// Drag blocks from the left panel to start programming!';
    } else {
        // Add helper functions for hardware simulation
        const helperFunctions = `
// Hardware Simulation Functions
function digitalWrite(pin, state) {
    console.log(\`Pin \${pin} set to \${state}\`);
}

function digitalRead(pin) {
    console.log(\`Reading from pin \${pin}\`);
    return Math.random() > 0.5; // Random boolean
}

function analogRead(pin) {
    console.log(\`Reading analog from pin \${pin}\`);
    return Math.floor(Math.random() * 1024); // Random 0-1023
}

function analogWrite(pin, value) {
    console.log(\`PWM pin \${pin} set to \${value}\`);
}

function delay(ms) {
    console.log(\`Waiting \${ms}ms...\`);
    // Note: This is a synchronous delay simulation
}

function getTemperature(pin) {
    console.log(\`Reading temperature from pin \${pin}\`);
    return (Math.random() * 30 + 15).toFixed(1); // Random temp 15-45°C
}

function getDistance(trigPin, echoPin) {
    console.log(\`Measuring distance with Trig:\${trigPin}, Echo:\${echoPin}\`);
    return (Math.random() * 200 + 5).toFixed(1); // Random distance 5-205cm
}

function playTone(pin, frequency, duration) {
    console.log(\`Playing \${frequency}Hz tone on pin \${pin} for \${duration}ms\`);
}

function connectWiFi(ssid, password) {
    console.log(\`Connecting to WiFi: \${ssid}\`);
    console.log('WiFi connected successfully! 📶');
}

function httpGet(url) {
    console.log(\`Making HTTP GET request to: \${url}\`);
    return '{"status": "success", "data": "Sample response"}';
}

// Servo simulation
const servo = {
    write: function(angle) {
        console.log(\`Servo moved to \${angle} degrees\`);
    }
};

// Generated Code:
`;
        code = helperFunctions + code;
    }
    
    return code;
}

function generatePython() {
    const blocks = workspace.getAllBlocks();
    let code = '';
    
    // Add imports
    code += '# MicroPython Code\n';
    code += 'import time\n';
    code += 'from machine import Pin\n\n';
    
    // Generate pin definitions
    const usedPins = new Set();
    blocks.forEach(block => {
        if (block.getField && block.getField('PIN')) {
            const pinNum = block.getFieldValue('PIN');
            if (pinNum && !usedPins.has(pinNum)) {
                usedPins.add(pinNum);
                code += `pin${pinNum} = Pin(${pinNum}, Pin.OUT)\n`;
            }
        }
    });
    
    if (usedPins.size > 0) code += '\n';
    
    // Generate block code
    blocks.forEach(block => {
        if (PythonGenerator[block.type]) {
            const blockCode = PythonGenerator[block.type](block);
            if (Array.isArray(blockCode)) {
                code += blockCode[0];
            } else {
                code += blockCode;
            }
        }
    });
    
    if (!code.trim() || code.trim() === '# MicroPython Code\nimport time\nfrom machine import Pin') {
        code = '# No blocks in workspace\n# Drag blocks from the left panel to start programming!';
    }
    
    return code;
}

function generateArduino() {
    const blocks = workspace.getAllBlocks();
    let code = '';
    
    // Add header
    code += '// Arduino C++ Code\n';
    code += '// Generated from Blockly IDE\n\n';
    
    // Find setup and loop blocks
    let setupCode = '';
    let loopCode = '';
    let otherCode = '';
    
    blocks.forEach(block => {
        if (block.type === 'arduino_setup') {
            setupCode = ArduinoGenerator[block.type](block, ArduinoGenerator);
        } else if (block.type === 'arduino_loop') {
            loopCode = ArduinoGenerator[block.type](block, ArduinoGenerator);
        } else if (ArduinoGenerator[block.type] && 
                   block.type !== 'arduino_setup' && 
                   block.type !== 'arduino_loop') {
            const blockCode = ArduinoGenerator[block.type](block, ArduinoGenerator);
            if (Array.isArray(blockCode)) {
                otherCode += blockCode[0];
            } else {
                otherCode += blockCode;
            }
        }
    });
    
    // Generate complete Arduino sketch
    if (!setupCode) {
        setupCode = `void setup() {
  Serial.begin(9600);
  // Add your setup code here
}

`;
    }
    
    if (!loopCode) {
        loopCode = `void loop() {
${otherCode || '  // Add your main code here\n'}
}
`;
    }
    
    code += setupCode + loopCode;
    
    if (!code.includes('void setup') && !code.includes('void loop')) {
        code = '// No Arduino blocks in workspace\n// Use Setup and Loop blocks for Arduino programming!';
    }
    
    return code;
}

// ===== Code Execution =====
function runCode() {
    try {
        clearConsole();
        updateConsole('🚀 Running code...');
        
        const language = document.getElementById('codeLanguage').value;
        
        if (language === 'javascript') {
            const code = generateJavaScript();
            
            // Override console.log to capture output
            const originalLog = console.log;
            console.log = function(...args) {
                updateConsole(args.join(' '));
                originalLog.apply(console, args);
            };
            
            // Execute the code
            try {
                eval(code);
                updateConsole('✅ Code executed successfully!');
            } catch (error) {
                updateConsole(`❌ Runtime error: ${error.message}`, 'error');
            }
            
            // Restore console.log
            console.log = originalLog;
            
        } else {
            updateConsole(`📝 ${language.toUpperCase()} code generated!`);
            updateConsole('Copy the code to run it in your target environment.');
        }
        
        updateStatus('Code executed');
        
    } catch (error) {
        console.error('Execution error:', error);
        updateConsole(`❌ Error: ${error.message}`, 'error');
        updateStatus('Execution failed', 'error');
    }
}

// ===== Workspace Management =====
function saveWorkspace() {
    try {
        const xml = Blockly.Xml.workspaceToDom(workspace);
        const xmlText = Blockly.Xml.domToPrettyText(xml);
        
        localStorage.setItem('blocklyWorkspace', xmlText);
        updateStatus('Workspace saved');
        updateConsole('💾 Workspace saved to browser storage');
        
    } catch (error) {
        console.error('Save error:', error);
        updateStatus('Save failed', 'error');
    }
}

function loadWorkspace() {
    try {
        const xmlText = localStorage.getItem('blocklyWorkspace');
        
        if (xmlText) {
            const xml = Blockly.utils.xml.textToDom(xmlText);
            workspace.clear();
            Blockly.Xml.domToWorkspace(xml, workspace);
            updateStatus('Workspace loaded');
            updateConsole('📁 Workspace loaded from browser storage');
        } else {
            updateStatus('No saved workspace found');
            updateConsole('❌ No saved workspace found');
        }
        
    } catch (error) {
        console.error('Load error:', error);
        updateStatus('Load failed', 'error');
        updateConsole(`❌ Load error: ${error.message}`, 'error');
    }
}

function clearWorkspace() {
    if (confirm('Are you sure you want to clear the workspace?')) {
        workspace.clear();
        addStarterBlocks();
        clearConsole();
        updateStatus('Workspace cleared');
        updateConsole('🗑 Workspace cleared');
    }
}

function addStarterBlocks() {
    // Add a starter program block
    const startBlock = workspace.newBlock('program_start');
    startBlock.initSvg();
    startBlock.render();
    startBlock.moveBy(50, 50);
    
    // Add a blink LED example
    const blinkBlock = workspace.newBlock('hardware_led_blink');
    blinkBlock.initSvg();
    blinkBlock.render();
    blinkBlock.moveBy(50, 120);
    
    // Connect them
    startBlock.nextConnection.connect(blinkBlock.previousConnection);
}

// ===== Theme Management =====
function toggleTheme() {
    isDarkMode = !isDarkMode;
    document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    
    const themeIcon = document.querySelector('#themeToggle .btn-icon');
    themeIcon.textContent = isDarkMode ? '☀️' : '🌙';
    
    localStorage.setItem('darkMode', isDarkMode);
    updateStatus(`${isDarkMode ? 'Dark' : 'Light'} theme activated`);
    
    // Update Blockly theme
    updateBlocklyTheme();
}

function updateBlocklyTheme() {
    if (!workspace) return;
    
    try {
        // Set the appropriate theme
        const newTheme = isDarkMode ? darkTheme : lightTheme;
        workspace.setTheme(newTheme);
        
        // Update grid color
        const gridColor = isDarkMode ? '#444444' : '#cccccc';
        workspace.getGrid().colour = gridColor;
        
        // Force workspace refresh
        workspace.refreshTheme();
        
        // Additional refresh to ensure all elements update
        setTimeout(() => {
            Blockly.svgResize(workspace);
            workspace.render();
        }, 50);
        
        updateConsole(`🎨 Theme updated: ${isDarkMode ? 'Dark' : 'Light'} mode with grid color ${gridColor}`);
        
    } catch (error) {
        console.error('Theme update error:', error);
        updateConsole(`❌ Theme update failed: ${error.message}`, 'error');
    }
}

// function loadThemePreference() {
//     const savedTheme = localStorage.getItem('darkMode');
//     if (savedTheme === 'true') {
//         isDarkMode = true;
//         document.body.setAttribute('data-theme', 'dark');
//         const themeIcon = document.querySelector('#themeToggle .btn-icon');
//         if (themeIcon) themeIcon.textContent = '☀️';
        
//         // Update Blockly theme after workspace is initialized
//         setTimeout(() => {
//             updateBlocklyTheme();
//         }, 200);
//     }
// }

function loadThemePreference() {
    const savedTheme = localStorage.getItem('darkMode');
    
    // Default to dark theme unless user explicitly chose light
    if (savedTheme === 'false') {
        isDarkMode = false;
        document.body.setAttribute('data-theme', 'light');
    } else {
        isDarkMode = true;
        document.body.setAttribute('data-theme', 'dark');
        localStorage.setItem('darkMode', 'true'); // Save dark as preference
    }
    
    // Update theme icon
    const themeIcon = document.querySelector('#themeToggle .btn-icon');
    if (themeIcon) {
        themeIcon.textContent = isDarkMode ? '☀️' : '🌙';
    }
    
    // Update Blockly theme
    setTimeout(() => {
        updateBlocklyTheme();
    }, 100);
}


// ===== UI Helper Functions =====
function updateStatus(message = '', type = 'info') {
    const statusElement = document.getElementById('statusText');
    const blockCount = workspace ? workspace.getAllBlocks().length : 0;
    
    statusElement.textContent = message || 'Ready';
    statusElement.className = type === 'error' ? 'error' : type === 'success' ? 'success' : '';
    
    document.getElementById('blockCount').textContent = `Blocks: ${blockCount}`;
    document.getElementById('workspaceInfo').textContent = 
        blockCount > 0 ? `Workspace: ${blockCount} blocks` : 'Workspace: Empty';
}

function updateConsole(message, type = 'info') {
    const consoleOutput = document.getElementById('consoleOutput');
    const timestamp = new Date().toLocaleTimeString();
    const messageElement = document.createElement('div');
    
    messageElement.className = `console-message ${type}`;
    messageElement.innerHTML = `<span class="timestamp">[${timestamp}]</span> ${message}`;
    
    consoleOutput.appendChild(messageElement);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

function clearConsole() {
    document.getElementById('consoleOutput').innerHTML = '';
}

function copyCode() {
    const codeOutput = document.getElementById('codeOutput');
    const code = codeOutput.textContent;
    
    navigator.clipboard.writeText(code).then(() => {
        updateStatus('Code copied to clipboard', 'success');
        updateConsole('📋 Code copied to clipboard');
    }).catch(err => {
        console.error('Copy failed:', err);
        updateStatus('Copy failed', 'error');
    });
}

function onLanguageChange() {
    currentLanguage = document.getElementById('codeLanguage').value;
    generateCode();
    updateStatus(`Switched to ${currentLanguage.toUpperCase()}`);
}

// ===== Keyboard Shortcuts =====
document.addEventListener('keydown', function(event) {
    // Ctrl+S - Save
    if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        saveWorkspace();
    }
    
    // Ctrl+O - Load
    if (event.ctrlKey && event.key === 'o') {
        event.preventDefault();
        loadWorkspace();
    }
    
    // Ctrl+R - Run
    if (event.ctrlKey && event.key === 'r') {
        event.preventDefault();
        runCode();
    }
    
    // Ctrl+G - Generate
    if (event.ctrlKey && event.key === 'g') {
        event.preventDefault();
        generateCode();
    }
    
    // Ctrl+D - Toggle theme
    if (event.ctrlKey && event.key === 'd') {
        event.preventDefault();
        toggleTheme();
    }
    
    // Delete key - Delete selected blocks
    if (event.key === 'Delete' && workspace) {
        const selected = Blockly.selected;
        if (selected && selected.isDeletable()) {
            selected.dispose();
        }
    }
});

// ===== Mobile Responsive Adjustments =====
function handleMobileLayout() {
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        // Adjust toolbox for mobile
        if (workspace) {
            workspace.getToolbox().setVisible(false);
        }
        
        // Add mobile-specific controls
        addMobileControls();
    }
}

function addMobileControls() {
    // Add a floating toolbox toggle button for mobile
    const mobileToolboxToggle = document.createElement('button');
    mobileToolboxToggle.className = 'mobile-toolbox-toggle';
    mobileToolboxToggle.innerHTML = '🧰';
    mobileToolboxToggle.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        z-index: 1000;
        background: var(--accent-primary);
        color: white;
        border: none;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        font-size: 20px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: none;
    `;
    
    document.body.appendChild(mobileToolboxToggle);
    
    // Show/hide based on screen size
    function toggleMobileButton() {
        if (window.innerWidth <= 768) {
            mobileToolboxToggle.style.display = 'block';
        } else {
            mobileToolboxToggle.style.display = 'none';
        }
    }
    
    window.addEventListener('resize', toggleMobileButton);
    toggleMobileButton();
    
    // Toggle toolbox visibility
    mobileToolboxToggle.addEventListener('click', () => {
        const toolbox = workspace.getToolbox();
        const isVisible = toolbox.isVisible();
        toolbox.setVisible(!isVisible);
        mobileToolboxToggle.innerHTML = isVisible ? '🧰' : '❌';
    });
}

// ===== Export/Import Functionality =====
function exportWorkspace() {
    try {
        const xml = Blockly.Xml.workspaceToDom(workspace);
        const xmlText = Blockly.Xml.domToPrettyText(xml);
        
        const blob = new Blob([xmlText], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'blockly_project.xml';
        a.click();
        
        URL.revokeObjectURL(url);
        updateStatus('Project exported', 'success');
        
    } catch (error) {
        console.error('Export error:', error);
        updateStatus('Export failed', 'error');
    }
}

function importWorkspace() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xml';
    
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const xmlText = e.target.result;
                    const xml = Blockly.utils.xml.textToDom(xmlText);
                    workspace.clear();
                    Blockly.Xml.domToWorkspace(xml, workspace);
                    updateStatus('Project imported', 'success');
                    updateConsole('📁 Project imported successfully');
                } catch (error) {
                    console.error('Import error:', error);
                    updateStatus('Import failed', 'error');
                    updateConsole(`❌ Import error: ${error.message}`, 'error');
                }
            };
            reader.readAsText(file);
        }
    };
    
    input.click();
}

// ===== Performance Optimization =====
let resizeTimeout;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resizeBlocklyArea, 100);
});

// ===== Error Handling =====
window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
    updateConsole(`❌ Error: ${event.message}`, 'error');
    updateStatus('Application error', 'error');
});

// ===== Initialize mobile support =====
window.addEventListener('load', function() {
    handleMobileLayout();
    addMobileControls();
});

// ===== Add additional buttons to header for export/import =====
document.addEventListener('DOMContentLoaded', function() {
    // Add export/import buttons to header-right
    const headerRight = document.querySelector('.header-right');
    
    const exportBtn = document.createElement('button');
    exportBtn.className = 'btn btn-outline';
    exportBtn.innerHTML = '<span class="btn-icon">📤</span>Export';
    exportBtn.addEventListener('click', exportWorkspace);
    
    const importBtn = document.createElement('button');
    importBtn.className = 'btn btn-outline';
    importBtn.innerHTML = '<span class="btn-icon">📥</span>Import';
    importBtn.addEventListener('click', importWorkspace);
    
    // Insert before theme toggle
    const themeToggle = document.getElementById('themeToggle');
    headerRight.insertBefore(exportBtn, themeToggle);
    headerRight.insertBefore(importBtn, themeToggle);
});

// ===== Console Message Styling =====
const style = document.createElement('style');
style.textContent = `
.console-message {
    padding: 4px 0;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    border-bottom: 1px solid rgba(255,255,255,0.1);
}

.console-message.error {
    color: var(--accent-danger);
}

.console-message.success {
    color: var(--accent-success);
}

.timestamp {
    color: var(--text-secondary);
    font-size: 0.75rem;
}

.mobile-toolbox-toggle {
    transition: all 0.3s ease;
}

.mobile-toolbox-toggle:hover {
    transform: scale(1.1);
}

@media (max-width: 768px) {
    .header-right .btn {
        padding: 4px 8px;
        font-size: 0.7rem;
    }
    
    .header-right .btn-icon {
        margin-right: 0;
    }
    
    .header-right .btn span:not(.btn-icon) {
        display: none;
    }
}
`;
document.head.appendChild(style);

// ===== Backend Compilation Trigger =====
document.getElementById('compile').addEventListener('click', async () => {
  const selectedLanguage = document.getElementById("codeLanguage").value;
  const board = document.getElementById("board").value;

  let code = "";
  if (selectedLanguage === "arduino") {
    code = Blockly.Arduino.workspaceToCode(workspace);
  } else if (selectedLanguage === "python") {
    code = Blockly.Python.workspaceToCode(workspace);
  } else {
    alert("⚠️ Please select Arduino or Python to compile.");
    return;
  }

  if (!code.trim()) {
    alert("⚠️ No code generated from blocks.");
    return;
  }

  // Show compile status
  logToConsole("⏳ Compiling...", "info");

  const file = new File([code], "sketch.ino", { type: "text/plain" });
  const formData = new FormData();
  formData.append("file", file);
  formData.append("board", board);

  try {
    const response = await fetch("http://localhost:8000/compile/arduino", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json();
      logToConsole("❌ Compilation failed:\n" + err.error, "error");
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const filename = board.includes("esp32") ? "firmware.bin" : "firmware.hex";

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);

    logToConsole("✅ Compilation successful! Firmware downloaded.", "success");
  } catch (err) {
    logToConsole("❌ Error: " + err.message, "error");
  }
});

// ===== Console Logger =====
function logToConsole(message, type = "info") {
  const consoleEl = document.getElementById("consoleOutput");

  const msgEl = document.createElement("div");
  msgEl.className = `console-message ${type}`;
  msgEl.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
  consoleEl.appendChild(msgEl);
  consoleEl.scrollTop = consoleEl.scrollHeight;
}
