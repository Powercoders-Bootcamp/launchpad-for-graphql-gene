(function () {
  const inputHost = document.getElementById("generatedInput");
  const outputHost = document.getElementById("generatedOutput");
  const sqlHost = document.getElementById("sqlEditorSurface");

  function setFallback(host, value) {
    if (!host) return;
    host.textContent = value;
    host.style.whiteSpace = "pre-wrap";
    host.style.padding = "16px";
    host.style.fontFamily = '"IBM Plex Mono", Consolas, monospace';
    host.style.fontSize = "13px";
    host.style.lineHeight = "1.7";
  }

  if (!inputHost || !outputHost) return;

  window.playgroundEditors = {
    setInputValue(value) { setFallback(inputHost, value); },
    setOutputValue(value) { setFallback(outputHost, value); },
    setSqlValue(value) { setFallback(sqlHost, value); },
    layoutSql() {},
    layoutOutput() {}
  };

  if (!window.require || !window.require.config) return;

  window.MonacoEnvironment = {
    getWorkerUrl() {
      const workerSource = `
        self.MonacoEnvironment = {
          baseUrl: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.2/min/"
        };
        importScripts("https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.2/min/vs/base/worker/workerMain.js");
      `;
      return `data:text/javascript;charset=utf-8,${encodeURIComponent(workerSource)}`;
    }
  };

  window.require.config({
    paths: { vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.2/min/vs" }
  });

  window.require(["vs/editor/editor.main"], function () {
    const root = document.body;
    const initialInputValue = inputHost.textContent || "";
    const initialOutputValue = outputHost.textContent || "";
    const initialSqlValue = sqlHost ? sqlHost.textContent || "" : "";

    inputHost.textContent = "";
    outputHost.textContent = "";
    inputHost.removeAttribute("style");
    outputHost.removeAttribute("style");
    if (sqlHost) { sqlHost.textContent = ""; sqlHost.removeAttribute("style"); }

    monaco.editor.defineTheme("graphqlGeneDark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "7F8DAA" },
        { token: "keyword", foreground: "E535AB" },
        { token: "string", foreground: "C4B5FD" },
        { token: "type.identifier", foreground: "8DF4C1" }
      ],
      colors: {
        "editor.background": "#101527",
        "editorLineNumber.foreground": "#5D6884",
        "editorLineNumber.activeForeground": "#D8DFF3",
        "editor.selectionBackground": "#7C3AED33",
        "editor.inactiveSelectionBackground": "#7C3AED1F"
      }
    });

    monaco.editor.defineTheme("graphqlGeneLight", {
      base: "vs",
      inherit: true,
      rules: [
        { token: "comment", foreground: "8C7AA7" },
        { token: "keyword", foreground: "E535AB" },
        { token: "string", foreground: "7C3AED" },
        { token: "type.identifier", foreground: "13794A" }
      ],
      colors: {
        "editor.background": "#FFFDFE",
        "editorLineNumber.foreground": "#998DA9",
        "editorLineNumber.activeForeground": "#43345E",
        "editor.selectionBackground": "#E535AB22",
        "editor.inactiveSelectionBackground": "#7C3AED14"
      }
    });

    function getTheme() {
      return root.getAttribute("data-theme") === "light" ? "graphqlGeneLight" : "graphqlGeneDark";
    }

    const sharedOptions = {
      automaticLayout: true,
      fontFamily: '"IBM Plex Mono", Consolas, monospace',
      fontLigatures: true,
      fontSize: 13,
      lineHeight: 22,
      minimap: { enabled: false },
      roundedSelection: true,
      scrollBeyondLastLine: false,
      renderLineHighlight: "gutter",
      padding: { top: 16, bottom: 16 },
      scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 }
    };

    const inputEditor = monaco.editor.create(inputHost, {
      ...sharedOptions,
      value: initialInputValue,
      language: "typescript",
      theme: getTheme()
    });

    const outputEditor = monaco.editor.create(outputHost, {
      ...sharedOptions,
      value: initialOutputValue,
      language: "graphql",
      readOnly: true,
      domReadOnly: true,
      theme: getTheme()
    });

    const sqlEditor = sqlHost
      ? monaco.editor.create(sqlHost, {
          ...sharedOptions,
          value: initialSqlValue,
          language: "sql",
          readOnly: true,
          domReadOnly: true,
          theme: getTheme()
        })
      : null;

    window.playgroundEditors = {
      setInputValue(value) {
        if (inputEditor.getValue() !== value) inputEditor.setValue(value);
      },
      setOutputValue(value) {
        if (outputEditor.getValue() !== value) outputEditor.setValue(value);
      },
      setSqlValue(value) {
        if (sqlEditor && sqlEditor.getValue() !== value) sqlEditor.setValue(value);
      },
      layoutSql() { if (sqlEditor) sqlEditor.layout(); },
      layoutOutput() { outputEditor.layout(); }
    };

    new MutationObserver(function () {
      monaco.editor.setTheme(getTheme());
    }).observe(root, { attributes: true, attributeFilter: ["data-theme"] });
  });
})();
