(function () {
  function boot() {
    var form = document.getElementById("code-form");
    if (!form) return;

    var language = document.getElementById("language");
    var source = document.getElementById("source");
    var fileInput = document.getElementById("code-file");
    var explanation = document.getElementById("explanation");
    var ring = document.getElementById("completion-ring");
    var percent = document.getElementById("completion-pct");
    var status = document.getElementById("readiness-status");
    var analyze = document.getElementById("analyze-code");
    var picked = document.getElementById("code-file-picked");
    var clearFile = document.getElementById("clear-file");
    var steps = [0, 33, 67, 100];

    function minimum(name, fallback) {
      var value = parseInt(form.getAttribute(name) || "", 10);
      return value > 0 ? value : fallback;
    }

    var languageMin = minimum("data-language-min", 1);
    var codeMin = minimum("data-code-min", 40);
    var explanationMin = minimum("data-explanation-min", 20);

    function textLength(element) {
      return ((element && element.value) || "").trim().length;
    }

    function fileSelected() {
      return !!(fileInput && fileInput.files && fileInput.files.length > 0);
    }

    function setText(element, value) {
      if (element && element.textContent !== value) element.textContent = value;
    }

    function setRequirement(name, done) {
      var item = form.parentNode.querySelector('[data-requirement="' + name + '"]');
      if (!item) return;
      item.classList.toggle("is-done", done);
      setText(item.querySelector(".check-state"), done ? "Done" : "Needed");
    }

    function statusMessage(remaining) {
      if (remaining === 0) return "Ready for analysis.";
      var noun = remaining === 1 ? "field" : "fields";
      return "Complete " + remaining + " more " + noun + ".";
    }

    function update() {
      var languageDone = textLength(language) >= languageMin;
      var codeDone = textLength(source) >= codeMin;
      var artifactDone = codeDone || fileSelected();
      var explanationDone = textLength(explanation) >= explanationMin;
      var completed = [languageDone, artifactDone, explanationDone].filter(Boolean).length;
      var remaining = 3 - completed;
      var pct = steps[completed];
      var message = statusMessage(remaining);
      var valueText = pct + " percent. " + message;

      if (ring) {
        ring.style.setProperty("--pct", String(pct));
        ring.setAttribute("aria-valuenow", String(pct));
        ring.setAttribute("aria-valuemin", "0");
        ring.setAttribute("aria-valuemax", "100");
        if (ring.getAttribute("aria-valuetext") !== valueText) {
          ring.setAttribute("aria-valuetext", valueText);
        }
      }
      setText(percent, pct + "%");
      setText(status, message);
      setRequirement("language", languageDone);
      setRequirement("artifact", artifactDone);
      setRequirement("explanation", explanationDone);

      if (picked) {
        if (fileSelected()) {
          picked.hidden = false;
          setText(picked, "Selected file: " + fileInput.files[0].name + ". It counts as the code artifact. Nothing is uploaded.");
        } else {
          picked.hidden = true;
          setText(picked, "");
        }
      }
      if (clearFile) clearFile.hidden = !fileSelected();

      if (analyze) {
        analyze.disabled = remaining !== 0;
        analyze.setAttribute("aria-disabled", remaining === 0 ? "false" : "true");
      }
      return remaining === 0;
    }

    form.addEventListener("input", update);
    form.addEventListener("change", update);
    form.addEventListener("submit", function (event) {
      if (!update()) event.preventDefault();
    });
    if (clearFile && fileInput) {
      clearFile.addEventListener("click", function () {
        fileInput.value = "";
        update();
      });
    }

    update();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
