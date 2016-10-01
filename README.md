# Cursor maintenance

## Maintaining cursor position in a formatted input field

A vexing problem comes up when you're building a formatted input field
that lets the user freely move a cursor. After some user editing, the
text is reformatted by the input field. Now where should the cursor
appear? That is the problem of cursor maintenance.

I have posted a detailed discussion of cursor maintenance on my
website. It's a complicated problem with fuzzy criteria. You can
approach it in several ways depending on the text format and how you
want the user to interact with the input field. Sometimes there is no
reliable way to maintain the cursor. If so, it is best to avoid the
problem by removing the cursor upon reformatting or by displaying the
formatted text separately from the input text. Then again, sometimes
it is possible to achieve reliable cursor maintenance, resulting in a
seamless input interface.

This repository provides framework code and implementation examples for
three approaches to cursor maintenance. I characterize them as follows:

Name of approach  |  Ease of implementation  |  Reliability
---|---|---
Retrospective  |  Easy  |  Susceptible to faulty cursor positioning
Layer  |  Medium  |  Can be made accurate for some formats
Meta  |  Hard  |  Can be made accurate for many formats


## Basic demo

The layer approach to cursor maintenance offers a reasonable balance of
reliability and ease of implementation. I have made a basic demonstration
of the layer approach that looks like this:

[![Basic implementation of cursor
maintenance](https://github.com/michaellaszlo/maintaining-cursor-position/blob/master/screenshots/basic_demo.png)](http://michaellaszlo.com/maintaining-cursor-position/basic-demo/)

You may wish to try out the [basic demo](http://michaellaszlo.com/maintaining-cursor-position/basic-demo/)
on my website or see its [source code](https://github.com/michaellaszlo/maintaining-cursor-position/tree/master/basic_demo) in this repository.


## Extended demos

I have made a more elaborate page demonstrating the meta, retrospective,
and layer approaches. The retrospective and layer demos allow you to
specify any formatting function. The layer demo also allows you to define
the layers.

[![Interactive implementation of several cursor-maintenance
approaches](https://github.com/michaellaszlo/maintaining-cursor-position/blob/master/screenshots/extended_demo.png)](http://michaellaszlo.com/maintaining-cursor-position/extended-demo/)

The [extended demo](http://michaellaszlo.com/maintaining-cursor-position/extended-demo/) page is hosted live on my website and the
[source code](https://github.com/michaellaszlo/maintaining-cursor-position/tree/master/extended_demo) is available in this repository.


## General implementation model

Cursor maintenance is the third step in this sequence:

1. The user edits the text in the input field with the help of a cursor.
1. The user's raw text is replaced with formatted text.
1. The cursor is repositioned in the input field.

You define the formatter, which is a function that takes raw text and
returns formatted text. You decide when the text should be formatted:
perhaps after every keystroke, perhaps after a special user action,
perhaps at regular intervals.

If the formatted text is identical to the raw text, there is nothing
further to do. The cursor should stay where it is.

Otherwise, you want to compute a new cursor position. You can do so
with a cursor maintainer or with a cursor-maintaining formatter.


### Using a cursor maintainer

A cursor maintainer doesn't know about your format in general. You call
it with three values:

- the user's **raw text**
- the user's **cursor position** in the raw text
- the **formatted text** that you computed from the raw text

You get back one value:

- a **new cursor position** in the formatted text


### Using a cursor-maintaining formatter

A cursor-maintaining formatter is built for a specific format. You call
it with two values:

- the user's **raw text**
- the user's **cursor position** in the raw text

You get back two values:

- **formatted text** computed from the raw text
- a **new cursor position** in the formatted text


## Implementing the retrospective approach

After loading `cursor_maintainer.js`, make a retrospective cursor
maintainer:

```
var maintainer = CursorMaintainer.retrospective.makeMaintainer();
```

Compute a new cursor position:

```
var newPosition = maintainer('  2400.015 ', 2, '2,400.02');
```

If you have a formatting function called `formatter`, you can make a
cursor-maintaining formatter out of it:

```
var cmFormatter = CursorMaintainer.augmentFormat(formatter);
```

Use the cursor-maintaining formatter:
```
var result = cmFormatter('  2400.015 ', 2),
    formattedText = result.text,
    newCursor = result.cursor;
```



## Implementing the layer approach


## Implementing the meta approach


