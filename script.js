let pyodide;

async function initPyodide() {
  pyodide = await loadPyodide();
  console.log("Pyodide loaded!");
  document.querySelector('.output-area').textContent = "Python console ready! Try some code.";
}

class PythonLearningApp {
  constructor() {
    this.initElements();
    this.bindEvents();
    this.loadSyntaxHighlighting();
    initPyodide();
  }

  initElements() {
    this.sidebar = document.querySelector('.sidebar');
    this.menuToggle = document.querySelector('.menu-toggle');
    this.console = document.querySelector('.console');
    this.minimizeConsole = document.querySelector('.minimize-console');
    this.consoleInput = document.querySelector('.console-input');
    this.outputArea = document.querySelector('.output-area');
    this.lessons = document.querySelectorAll('.lesson');
    this.navigationLinks = document.querySelectorAll('.lesson-list a');
  }

  bindEvents() {
    // Menu toggle for mobile
    this.menuToggle.addEventListener('click', () => {
      this.sidebar.classList.toggle('active');
    });

    // Console minimize/maximize
    this.minimizeConsole.addEventListener('click', () => {
      this.console.classList.toggle('minimized');
      this.minimizeConsole.textContent = this.console.classList.contains('minimized') ? '+' : '−';
    });

    // Console input handling
    this.consoleInput.addEventListener('keypress', async (e) => {
      if (e.key === 'Enter') {
        const code = this.consoleInput.value;
        this.consoleInput.value = '';
        await this.executeCode(code, true);
      }
    });

    // Navigation
    this.navigationLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').slice(1);
        this.showLesson(targetId);
      });
    });

    // Run code buttons
    document.querySelectorAll('.run-code').forEach(button => {
      button.addEventListener('click', async () => {
        const codeBlock = button.parentElement.querySelector('code');
        const output = button.parentElement.nextElementSibling;
        output.style.display = 'block';
        await this.executeCode(codeBlock.textContent, false, output);
      });
    });

    // Check answer buttons
    document.querySelectorAll('.check-answer').forEach(button => {
      button.addEventListener('click', async () => {
        const codeEditor = button.parentElement.querySelector('.python-code');
        await this.checkAnswer(codeEditor.value);
      });
    });
  }

  loadSyntaxHighlighting() {
    hljs.highlightAll();
  }

  async executeCode(code, isConsole = false, outputElement = null) {
    try {
      const result = await pyodide.runPython(code);
      const output = result !== undefined ? result.toString() : 'Command executed successfully';
      
      if (isConsole) {
        this.appendToConsole(`>>> ${code}\n${output}`);
      } else if (outputElement) {
        outputElement.textContent = output;
      }
    } catch (error) {
      const errorMessage = error.toString();
      if (isConsole) {
        this.appendToConsole(`>>> ${code}\nError: ${errorMessage}`);
      } else if (outputElement) {
        outputElement.textContent = `Error: ${errorMessage}`;
      }
    }
  }

  appendToConsole(text) {
    this.outputArea.textContent += '\n' + text;
    this.outputArea.scrollTop = this.outputArea.scrollHeight;
  }

  showLesson(lessonId) {
    this.lessons.forEach(lesson => {
      lesson.classList.remove('active');
    });
    this.navigationLinks.forEach(link => {
      link.classList.remove('active');
    });

    document.getElementById(lessonId).classList.add('active');
    document.querySelector(`a[href="#${lessonId}"]`).classList.add('active');
  }

  async checkAnswer(code) {
    // In a real application, this would validate against expected outputs
    await this.executeCode(code);
  }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PythonLearningApp();
});