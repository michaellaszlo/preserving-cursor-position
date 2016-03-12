var DemonstrateCursorMaintenance = (function () {
  'use strict';

  var formatter,
      numericalCursorFormatter,
      textualCursorFormatter,
      metaCursorFormatter,
      retrospectiveCursorFormatter,
      test;


  function TestCase(originalText, originalCursor,
      expectedText, expectedCursor) {
    return {
      original: { text: originalText, cursor: originalCursor },
      expected: { text: expectedText, cursor: expectedCursor }
    };
  };


  /* Test describes the behavior of a fixed set of formatting operations.
   * It provides test data and a test runner that can be used to verify
   * the formatting operations with or without cursor positioning.
   * The constructor takes an object that implements the operations
   * described by our test data.
   */
  function Test(formatter) {
    var testData = {
      commatize: [
        new TestCase('2500', 1, '2,500', 1),
        new TestCase('12500', 3, '12,500', 4),
        new TestCase('5,4990000', 9, '54,990,000', 10),
        new TestCase('1,,8,,,', 3, '18', 1),
        new TestCase('1,0,0,000', 3, '100,000', 2),
        new TestCase('1,0,000', 2, '10,000', 1),
        new TestCase('1,,000', 2, '1,000', 1),
        new TestCase('1,00', 2, '100', 1),
        new TestCase('1234', 1, '1,234', 1),
        new TestCase('1,0234', 3, '10,234', 2),
        new TestCase('10,00', 4, '1,000', 4)
      ],
      trimify: [
        new TestCase('  hello  ', 8, 'hello', 5),
        new TestCase('  hello  ', 1, 'hello', 0),
        new TestCase('Hello,  friends.', 7, 'Hello, friends.', 7),
        new TestCase('Hello,  friends.', 8, 'Hello, friends.', 7),
        new TestCase('  whirled    peas  now  ', 9, 'whirled peas now', 7),
        new TestCase('  whirled    peas  now  ', 10, 'whirled peas now', 8),
        new TestCase('  whirled    peas  now  ', 11, 'whirled peas now', 8),
        new TestCase('  whirled    peas  now  ', 12, 'whirled peas now', 8),
        new TestCase('  whirled    peas  now  ', 13, 'whirled peas now', 8),
        new TestCase('     ', 3, '', 0)
      ]
    };

    /* showText prints out a single test string and optionally displays
     * the cursor position below it.
     */
    function showText(label, text, cursor) {
      var parts, i,
          prefix = '  ' + label + ' "';
      print(prefix + text + '"');
      if (cursor !== undefined) {
        parts = [];
        for (i = prefix.length + cursor; i > 0; --i) {
          parts.push(' ');
        }
        parts.push('↖ ' + cursor);
        print(parts.join(''));
      }
    }

    /* display prints out the test pairs for a specified formatting operation.
     */
    function display(name, showCursor) {
      var originalCursor,
          expectedCursor,
          testCases,
          testCase, i;
      if (showCursor === undefined) {
        showCursor = true;
      }
      if (!name) {
        print();
        Object.keys(testData).forEach(function (name) {
          display(name, showCursor);
        });
        return;
      }
      print('Test cases for ' + name);
      testCases = testData[name];
      for (i = 0; i < testCases.length; ++i) {
        testCase = testCases[i];
        if (showCursor) {
          originalCursor = testCase.original.cursor;
          expectedCursor = testCase.expected.cursor;
        }
        showText('original', testCase.original.text, originalCursor);
        showText('expected', testCase.expected.text, expectedCursor);
        print();
      }
    }

    /* run tests a specified formatting operation or all of them.
     */
    function run(name, withCursor) {
      var operation,
          passing,
          testCases,
          testCase, i,
          original,
          expected,
          received;
      if (withCursor === undefined) {
        withCursor = true;
      }
      if (!name) {
        print('');
        Object.keys(testData).forEach(function (name) {
          run(name, withCursor);
        });
        return;
      }
      print('Testing ' + name);
      operation = formatter[name];
      passing = true;
      testCases = testData[name];
      for (i = 0; i < testCases.length; ++i) {
        testCase = testCases[i];
        original = testCase.original;
        expected = testCase.expected;
        received = operation(original.text, original.cursor);
        if (received.text != expected.text || (withCursor &&
            received.cursor != expected.cursor)) {
          print('failed');
          showText('original', original.text, original.cursor);
          showText('expected', expected.text, expected.cursor);
          showText('received', received.text, received.cursor);
          passing = false;
        }
      }
      if (passing) {
        print('passed');
      }
      return passing;
    }

    return {
      display: display,
      run: run
    };
  }


  /* formatter implements the operations specified by the Test object
   * without altering the cursor position.
   */
  formatter = {};

  /* commatize takes a string of digits and commas. It adjusts commas so
   * that they separate the digits into groups of three.
   */
  formatter.commatize = function (s, cursor) {
    var start,
        groups,
        i;
    s = s.replace(/,/g, '');
    start = s.length % 3 || 3;
    groups = [ s.substring(0, start) ];
    for (i = start; i < s.length; i += 3) {
      groups.push(s.substring(i, i + 3));
    }
    s = groups.join(',');
    return { text: s, cursor: cursor };
  };

  /* trimify removes spaces from the beginning and end of the string, and
   * reduces each internal whitespace sequence to a single space.
   */
  formatter.trimify = function (s, cursor) {
    s = s.replace(/^\s+|\s+$/g, '');
    s = s.replace(/\s+/g, ' ');
    return { text: s, cursor: cursor };
  };


  test = new Test(formatter);
  test.run('trimify');
})();