(function () {
  function boot() {
    var form = document.getElementById("code-form");
    if (!form) return;

    var language = document.getElementById("language");
    var confirmLanguage = document.getElementById("confirm-language");
    var skillStep = document.getElementById("skill-step");
    var skillPrompt = document.getElementById("skill-prompt");
    var skillLevel = document.getElementById("skill-level");
    var skillPills = Array.prototype.slice.call(form.querySelectorAll("[data-skill]"));
    var source = document.getElementById("source");
    var fileInput = document.getElementById("code-file");
    var explanation = document.getElementById("explanation");
    var ring = document.getElementById("completion-ring");
    var percent = document.getElementById("completion-pct");
    var status = document.getElementById("readiness-status");
    var analyze = document.getElementById("analyze-code");
    var picked = document.getElementById("code-file-picked");
    var clearFile = document.getElementById("clear-file");
    var steps = [0, 25, 50, 75, 100];
    var allowedSkills = ["beginner", "intermediate", "expert"];
    var formState = {
      language: "",
      skill_level: ""
    };

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

    function languageValue() {
      return ((language && language.value) || "").trim();
    }

    function skillPromptText(value) {
      return value ? "What is your skill level in " + value + "?" : "What is your skill level?";
    }

    function revealSkillStep(moveFocus) {
      var value = languageValue();
      if (value.length < languageMin) {
        if (language) language.focus();
        update();
        return false;
      }

      formState.language = value;
      var wasHidden = !!(skillStep && skillStep.hidden);
      if (skillStep) skillStep.hidden = false;
      setText(skillPrompt, skillPromptText(value));
      if (confirmLanguage) setText(confirmLanguage, "Update language");
      update();

      if (moveFocus && wasHidden && skillPills.length) skillPills[0].focus();
      return true;
    }

    function selectSkill(value) {
      if (allowedSkills.indexOf(value) === -1) return;
      formState.skill_level = value;
      if (skillLevel) skillLevel.value = value;
      skillPills.forEach(function (pill) {
        pill.setAttribute("aria-pressed", pill.getAttribute("data-skill") === value ? "true" : "false");
      });
      update();
    }

    function statusMessage(remaining) {
      if (remaining === 0) return "Ready for analysis.";
      var noun = remaining === 1 ? "field" : "fields";
      return "Complete " + remaining + " more " + noun + ".";
    }

    function update() {
      var languageDone = textLength(language) >= languageMin;
      var selectedSkill = ((skillLevel && skillLevel.value) || "").toLowerCase();
      var skillDone = allowedSkills.indexOf(selectedSkill) !== -1;
      var codeDone = textLength(source) >= codeMin;
      var artifactDone = codeDone || fileSelected();
      var explanationDone = textLength(explanation) >= explanationMin;
      var completed = [languageDone, skillDone, artifactDone, explanationDone].filter(Boolean).length;
      var remaining = 4 - completed;
      var pct = steps[completed];
      var message = statusMessage(remaining);
      var valueText = pct + " percent. " + message;

      formState.language = languageValue();
      formState.skill_level = skillDone ? selectedSkill : "";
      if (skillStep && !skillStep.hidden && formState.language) {
        setText(skillPrompt, skillPromptText(formState.language));
      }

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
      setRequirement("skill", skillDone);
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
    if (confirmLanguage) {
      confirmLanguage.addEventListener("click", function () {
        revealSkillStep(true);
      });
    }
    if (language) {
      language.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          event.preventDefault();
          revealSkillStep(true);
        }
      });
    }
    skillPills.forEach(function (pill) {
      pill.addEventListener("click", function () {
        selectSkill(pill.getAttribute("data-skill"));
      });
    });
    if (clearFile && fileInput) {
      clearFile.addEventListener("click", function () {
        fileInput.value = "";
        update();
      });
    }

    if (skillLevel && allowedSkills.indexOf(skillLevel.value.toLowerCase()) !== -1) {
      revealSkillStep(false);
      selectSkill(skillLevel.value.toLowerCase());
    }
    update();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
