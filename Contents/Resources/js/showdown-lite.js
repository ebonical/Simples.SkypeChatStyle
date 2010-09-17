//
// showdown.js -- A javascript port of Markdown.
//
// Copyright (c) 2007 John Fraser.
//
// Original Markdown Copyright (c) 2004-2005 John Gruber
//   <http://daringfireball.net/projects/markdown/>
//
// Redistributable under a BSD-style open source license.
// See license.txt for more information.
//
// The full source distribution is at:
//
//        A A L
//        T C A
//        T K B
//
//   <http://www.attacklab.net/>
//
// NOTE:
// This is a heavily hacked version of the original. 
// Using only a couple of the formatters.
// Skype already does a lot of its own escaping of characters.
// 

//
// Showdown namespace
//
var Showdown = {};

//
// converter
//
// Wraps all "globals" so that the only thing
// exposed is makeHtml().
//
Showdown.converter = function() {

//
// Globals:
//

// Global hashes, used by various utility routines
var g_urls;
var g_titles;
var g_html_blocks;

// Used to track when we're inside an ordered or unordered list
// (see _ProcessListItems() for details):
var g_list_level = 0;
  
this.makeHtml = function(text) {
  // Clear the global hashes. If we don't clear these, you get conflicts
  // from other articles when generating a page which contains more than
  // one article (e.g. an index page that shows the N most recent
  // articles):
  g_urls = new Array();
  g_titles = new Array();
  g_html_blocks = new Array();
  
  text = _DoCodeSpans(text);
  
  return text;
}

var _DoCodeSpans = function(text) {
//
//   *  Backtick quotes are used for <code></code> spans.
// 
//   *  You can use multiple backticks as the delimiters if you want to
//   include literal backticks in the code span. So, this input:
//   
//     Just type ``foo `bar` baz`` at the prompt.
//   
//     Will translate to:
//   
//     <p>Just type <code>foo `bar` baz</code> at the prompt.</p>
//   
//  There's no arbitrary limit to the number of backticks you
//  can use as delimters. If you need three consecutive backticks
//  in your code, use four for delimiters, etc.
//
//  *  You can use spaces to get literal backticks at the edges:
//   
//     ... type `` `bar` `` ...
//   
//     Turns to:
//   
//     ... type <code>`bar`</code> ...
//

  /*
    text = text.replace(/
      (^|[^\\])         // Character before opening ` can't be a backslash
      (`+)            // $2 = Opening run of `
      (             // $3 = The code block
        [^\r]*?
        [^`]          // attacklab: work around lack of lookbehind
      )
      \2              // Matching closer
      (?!`)
    /gm, function(){...});
  */

  text = text.replace(/(^|[^\\])(`+)([^\r]*?[^`])\2(?!`)/gm,
    function(wholeMatch,m1,m2,m3,m4) {
      var c = m3;
      c = c.replace(/^([ \t]*)/g,""); // leading whitespace
      c = c.replace(/[ \t]*$/g,""); // trailing whitespace
      // c = _EncodeCode(c);
      c = _DecodeSkypeEmoties(c);
      return m1+"<code>"+c+"</code>";
    });

  return text;
}

var _DecodeSkypeEmoties = function(text) {
  // Replace inserted emotie images with their alt text.
  // We can probably safely assume that the intended code was lowercase.
  text = text.replace(/<img .*?alt="(.*?)">/g, 
    function(wholeMatch, m1) {
      return m1.toLowerCase();
    });
  
  return text;
}

var _EncodeCode = function(text) {
//
// Encode/escape certain characters inside Markdown code runs.
// The point is that in code, these characters are literals,
// and lose their special Markdown meanings.
//
  // Encode all ampersands; HTML entities are not
  // entities within a Markdown code span.
  text = text.replace(/&/g,"&amp;");

  // Do the angle bracket song and dance:
  text = text.replace(/</g,"&lt;");
  text = text.replace(/>/g,"&gt;");

  // Now, escape characters that are magic in Markdown:
  text = escapeCharacters(text,"\*_{}[]\\",false);

// jj the line above breaks this:
//---

//* Item

//   1. Subitem

//            special char: *
//---

  return text;
}

var escapeCharacters = function(text, charsToEscape, afterBackslash) {
  // First we have to escape the escape characters so that
  // we can build a character class out of them
  var regexString = "([" + charsToEscape.replace(/([\[\]\\])/g,"\\$1") + "])";

  if (afterBackslash) {
    regexString = "\\\\" + regexString;
  }

  var regex = new RegExp(regexString,"g");
  text = text.replace(regex,escapeCharacters_callback);

  return text;
}


var escapeCharacters_callback = function(wholeMatch,m1) {
  var charCodeToEscape = m1.charCodeAt(0);
  return "~E"+charCodeToEscape+"E";
}

}