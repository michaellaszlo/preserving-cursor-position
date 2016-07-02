var CursorMaintenanceDemo = (function () {
  var messages = {
        formatting: {
          off: '<span class="icon">&#x2610;</span>formatting disabled',
          on: '<span class="icon">&#x2611;</span>formatting on'
        }
      };

  function getCursorPosition(input) {
    return input.selectionStart;
  }

  function setCursorPosition(input, position) {
    input.setSelectionRange(position, position);
  }

  function setMaintainer(input, format, validate) {
    var saved = { text: null, cursor: 0 },
        formatted,
        toggleBox;
    function processInput() {
      var text,
          cursor,
          formatted;
      text = input.value;
      cursor = getCursorPosition(input);
      // If the input is invalid, restore the saved state and bail out.
      if (validate !== undefined && validate(text) !== true) {
        input.value = saved.text;
        setCursorPosition(input, saved.cursor);
        return;
      }
      // If formatting has been disabled, do nothing further.
      if (!input.status.formatting) {
        return;
      }
      // If the user has not changed the text, accept the user cursor.
      if (text === saved.text) {
        saved.cursor = cursor;
        return;
      }
      formatted = format(text, cursor);
      // If formatting leaves the user text unchanged, accept the user cursor.
      if (formatted.text === text) {
        saved.cursor = cursor;
        return;
      }
      input.value = saved.text = formatted.text;
      setCursorPosition(input, saved.cursor = formatted.cursor);
    }
    // Listen for events that can change the input value.
    [ 'change', 'keydown', 'keyup', 'click' ].forEach(function (eventName) {
      input.addEventListener(eventName, processInput);
    });
    // Add an element that allows the user to toggle formatting on and off.
    input.status = { formatting: false };
    toggleBox = document.createElement('div');
    toggleBox.className = 'toggle';
    toggleBox.onclick = function () {
      if (!input.status.formatting) {
        input.status.formatting = true;
        this.className += ' active';
        toggleBox.innerHTML = messages.formatting.on;
        processInput();
      } else {
        input.status.formatting = false;
        this.className = this.className.replace(/\s*active\s*/, ' ');
        toggleBox.innerHTML = messages.formatting.off;
      }
      input.focus();
    };
    toggleBox.click();
    input.parentNode.insertBefore(toggleBox, input);
  }

  function commatizeValidator(text) {
    return /^[0-9,]*$/.test(text);
  }

  function makeFlexibleMaintainer(codeBox) {
    var code = '',
        plainFormatter,
        error,
        defaultResult,
        result,
        costFunction = CursorMaintainer.costBalancedFrequencies,
        makeRetrospective = CursorMaintainer.makeRetrospective,
        maintainer = null;
    function wrappedFormatter(text, cursor) {
      return { text: plainFormatter(text), cursor: cursor };
    }
    return function (text, cursor) {
      if (code !== codeBox.value) {
        code = codeBox.value;
        try {
          plainFormatter = eval('(' + code + ')');
        } catch (error) {
          console.log('error in evaluating code: ' + error);
        }
        maintainer = null;
        if (typeof plainFormatter === 'function') {
          maintainer = makeRetrospective(costFunction, wrappedFormatter);
        }
      }
      defaultResult = { text: text, cursor: cursor };
      if (maintainer === null) {
        return defaultResult;
      }
      try {
        result = maintainer(text, cursor);
      } catch (error) {
        console.log('error in applying format: ' + error);
        return defaultResult;
      }
      return result;
    };
  }

  function load() {
    var divs, i, notes, hider;

    // Meta version of commatize accompanied by an input validator.
    setMaintainer(document.getElementById('commatizeInput'),
        CursorMaintainer.meta.commatize, commatizeValidator);

    // Meta version of trimify. No input validation.
    setMaintainer(document.getElementById('trimifyInput'),
        CursorMaintainer.meta.trimify);

    // Retrospective approach with balanced frequencies applied to a
    //  user-supplied formatting function. No input validation.
    setMaintainer(document.getElementById('flexibleInput'),
        makeFlexibleMaintainer(document.getElementById('flexibleCode')));

    // An illustrative formatting function for the retrospective approach.
    document.getElementById('flexibleCode').value = "function (s) {\n" +
        "  var decimalPos, whole, fraction, start, groups, i;\n" +
        "  s = s.replace(/[^0-9.]/g, '');\n" +
        "  s = s.replace(/^0+/, '0');\n" +
        "  if (s.length >= 2 && s.charAt(0) == '0' && s.charAt(1) != '.') {\n" +
        "    s = s.substring(1);\n" +
        "  }\n" +
        "  decimalPos = s.indexOf('.');\n" +
        "  s = s.replace(/[.]/g, '');\n" +
        "  whole = (decimalPos == -1 ? s : s.substring(0, decimalPos));\n" +
        "  start = whole.length % 3 || 3;\n" +
        "  groups = [ whole.substring(0, start) ];\n" +
        "  for (i = start; i < whole.length; i += 3) {\n" +
        "    groups.push(whole.substring(i, i + 3));\n" +
        "  }\n" +
        "  whole = groups.join(',');\n" +
        "  s = whole + (decimalPos == -1 ?\n" +
        "      '' : '.' + s.substring(decimalPos));\n" +
        "  return '$' + s;\n" +
        "}"
    document.getElementById('flexibleInput').click();
    document.getElementById('flexibleInput').blur();

    // The page position may have been changed by focus events as the input
    //  fields were initialized, so let's reset to the upper left corner.
    scrollTo(0, 0);

    // Hide all notes. Add buttons to expand each note section individually.
    function makeHiderResponse(hider, notes) {
      return function () {
        if (hider.className.indexOf('hiding') == -1) {
          hider.className = 'hider hiding';
          notes.className = 'notes hidden';
        } else {
          hider.className = 'hider';
          notes.className = 'notes';
        }
      }
    }
    divs = document.getElementsByTagName('div');
    for (i = 0; i < divs.length; ++i) {
      if (divs[i].className.indexOf('notes') == -1) {
        continue;
      }
      notes = divs[i];
      notes.className = 'notes hidden';
      hider = document.createElement('span');
      hider.className = 'hider hiding';
      hider.innerHTML = 'notes';
      hider.onclick = makeHiderResponse(hider, notes);
      notes.parentNode.insertBefore(hider, notes);
    }

  }

  return {
    load: load
  };
})();

onload = CursorMaintenanceDemo.load;