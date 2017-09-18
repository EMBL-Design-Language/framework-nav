// IA index
// A simple array index of key=>type.
//
// See master list of values at
// https://embl-design-language.github.io/Springboard/information-architecture/
//
// This might pone day be some sort of lookup API that maps a value to our IA
var facetIndex = {
  'groups':'who',
  'people':'who',
  'ciprianiteam':'who',

  'administration':'what',
  'news':'what',
  'research':'what',

  'EMBL.org':'where',
  'grenoble':'where',
  'heidelberg':'where'
}

// we'll use this later to store what we've scanned from the URL or metatags
var facetsPresent = {};

/**
 * Get URL paramater
 * We'll use this to synthesise a website with one page
 *
 * The meta tag syntax we synthesise is in the format of:
 *   <meta name="embl:facet-active"  content="[A research team]" />
 *   <meta name="embl:facet-parent-1" content="Research" />
 *   <meta name="embl:facet-parent-2" content="EMBL.org" />
 *
 * We fabricate as
 * - EMBL.org homepage
     http://localhost:3000/?facet-active=EMBL.org
 * - Research:Grenoble
     http://localhost:3000/?facet-active=Research&facet-parent-1=Grenoble
 * - Cipriani Team:Research:Grenoble
     http://localhost:3000/?facet-active=Cipriani Team&facet-parent-1=Research&facet-parent-2=EMBL.org
 *
 * Related discussion at https://github.com/EMBL-Design-Language/Sprint-2/issues/11
 *
 * @param {string} name Param to look for
 * @param {string} url Optional specicifc URL to precess.
 */
function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
     results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

/**
 * Indicate which metatags are currently active.
 * You just need a div with class 'metatag-readout'
 * This will also write the tags to the <head>
 */
function getContentTag(facet) {
  // facet = facet.split('-')[1];
  // if (getParameterByName('facet-active') == facet) {
  //   return 'active';
  // }
  // if (getParameterByName('facet-parent') == facet) {
  //   return 'parent';
  // }
  // // allow for multipe parents
  // if (getParameterByName('facet-parent2') == facet) {
  //   return 'parent';
  // }
  // if (getParameterByName('facet-parent3') == facet) {
  //   return 'parent';
  // }
  // if (getParameterByName('facet-child') == facet) {
  //   return 'child';
  // }
}

// toLowerCase and drop '.', ' '
function cleanString(val) {
  return val.replace(/\./g,'').replace(/ /g,'').toLowerCase();
}

/**
 * Indicate which metatags are currently active.
 * You just need a div with class 'metatag-readout'
 * This will also write the tags to the <head>
 */
function emblTagsRead() {

  var target = $('.metatag-readout');
  target.html('');


  function readTag(processing) {
    facetsPresent[processing] = getParameterByName('facet-'+processing);
    target.append('&lt;meta name="embl:'+processing+'" content="'+facetsPresent[processing]+'" /&gt; <br/>');
    $('head').prepend('<meta name="embl:'+processing+'" content="'+facetsPresent[processing]+'">')
  }

  readTag('active');
  readTag('parent-1');
  readTag('parent-2');

}

/**
 * Read the meta tags from the page and populate navigation
 *
 * TODO: we're still using the URLs here, we should read in the metatags we've
 * written with JS
 */
function loadMetatagsIntoContent() {
  var tempActive = cleanString(facetsPresent.active || 'x');
  var tempParent1 = cleanString(facetsPresent['parent-1'] || 'x');
  var tempParent2 = cleanString(facetsPresent['parent-2'] || 'x');

  $('#masthead #nav .'+tempActive).removeClass('hide');
  $('#masthead #nav .'+tempParent1).removeClass('hide');
  $('#masthead #nav .'+tempParent2).removeClass('hide');

  $('h1#facet-active').html(facetsPresent.active);
  $('title').html(facetsPresent.active);

}

/**
 * As we don't have real pages, we show and hide content depending on the active facet
 */
function toggleContent() {
  // prefer the highest level of specificity
  if ($('#content .'+facetsPresent.active+'.'+facetsPresent['parent-1']+'.'+facetsPresent['parent-2']).length > 0) {
    $('#content .'+facetsPresent.active+'.'+facetsPresent['parent-1']+'.'+facetsPresent['parent-2']).first().removeClass('hide');
    return true;
  }
  if ($('#content .'+facetsPresent.active+'.'+facetsPresent['parent-1']).length > 0) {
    $('#content .'+facetsPresent.active+'.'+facetsPresent['parent-1']).first().removeClass('hide');
    return true;
  }
  if ($('#content .'+facetsPresent.active).length > 0) {
    $('#content .'+facetsPresent.active).first().removeClass('hide');
    return true;
  }

  // still here? load the generic content
  $('#content .generic').removeClass('hide');

}


/**
 * Do all of the above on page load
 */
function runPage() {
  // Invoke generic foundation JS
  // $(document).foundation();

  // build the default nav
  $.each(facetIndex, function( index, value ) {
    $('#masthead #nav').prepend('<a class="button '+value+' '+cleanString(index)+' hide" href="/?facet-active='+cleanString(index)+'">'+index+'</a>');
  });

  emblTagsRead();
  loadMetatagsIntoContent();
  toggleContent();
}


runPage();
