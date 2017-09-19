// IA index
// A simple array index of key=>type.
//
// See master list of values at
// https://embl-design-language.github.io/Springboard/information-architecture/
//
// This might pone day be some sort of lookup API that maps a value to our IA
var facetIndex = {
  'grenoble': {
    'type':'where',
    'parent':'locations',
    'title':'Grenoble'
  },
  'heidelberg': {
    'type':'where',
    'parent':'locations',
    'title':'Heidelberg'
  },
  'emblorg': {
    'type':'where',
    'parent':'locations',
    'title':'EMBL.org'
  },

  'groups': {
    'type':'who',
    'parent':'emblorg',
    'title':'Groups'
  },
  'people': {
    'type':'who',
    'parent':'emblorg',
    'title':'People'
  },
  'ciprianiteam': {
    'type':'who',
    'parent':'groups',
    'title':'Cipriani Team'
  },

  'administration': {
    'type':'what',
    'parent':'emblorg',
    'title':'Administration'
  },
  'news': {
    'type':'what',
    'parent':'emblorg',
    'title':'News'
  },
  'research': {
    'type':'what',
    'parent':'emblorg',
    'title':'Research'
  }
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
    facetsPresent[processing] = getParameterByName('facet-'+processing) || '';
    facetsPresent[processing] = facetsPresent[processing].toLowerCase();
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
function emblTagsNavigation() {
  var tempActive = cleanString(facetsPresent.active || 'null');
  var tempParent1 = cleanString(facetsPresent['parent-1'] || 'null');
  var tempParent2 = cleanString(facetsPresent['parent-2'] || 'null');

  $('h1#facet-active').html(facetIndex[tempActive].title);
  $('title').html(facetIndex[tempActive].title);

  $('#masthead #nav a.'+tempActive).removeClass('hide').append(' <small>(you are here)</small>');
  $('#masthead #nav a.'+tempParent1).removeClass('hide').prepend('⬆️ ');
  $('#masthead #nav a.'+tempParent2).removeClass('hide').prepend('⬆️ ');

  // amend parents to inherit eachother
  if ((tempParent1 != 'emblorg') && (tempParent1 != 'null')) {
    var tempHref = $('#masthead #nav a.'+tempParent2).attr('href') + '&facet-parent-1=' + tempParent1;
    $('#masthead #nav a.'+tempParent2).attr('href',tempHref);
    $('title').append(' > ' + facetIndex[tempParent1].title);
  }
  if ((tempParent2 != 'emblorg') && (tempParent2 != 'null')){
    var tempHref = $('#masthead #nav a.'+tempParent1).attr('href') + '&facet-parent-1=' + tempParent2;
    $('#masthead #nav a.'+tempParent1).attr('href',tempHref);
    $('title').append(' > ' + facetIndex[tempParent2].title);
  }

  // activate the default navigation and make it relative to parent-1 and parent-2
  function defaultNavEnable(target) {
    var target = $(target);
    target.removeClass('hide').addClass('float-right').prepend('➡️ ');
    var targetHref = target.attr('href') + '&facet-parent-1=' + tempParent1 + '&facet-parent-2=' + tempParent2;
    target.attr('href',targetHref);
  }
  defaultNavEnable('#masthead #nav a.research.hide');
  defaultNavEnable('#masthead #nav a.administration.hide');
  defaultNavEnable('#masthead #nav a.people.hide');
  defaultNavEnable('#masthead #nav a.groups.hide');
  // emblorg doesn't inherit any parents
  $('#masthead #nav a.emblorg.hide').removeClass('hide').addClass('float-right').prepend('⬆️ ');

}

/**
 * As we don't have real pages, we show and hide content depending on the active facet
 */
function emblTagsPageContent() {
  // prefer the highest level of specificity
  if ((facetsPresent['parent-1'] != '') && (facetsPresent['parent-2'] != '')) {
    if ($('#content .'+cleanString(facetsPresent.active)+'.'+facetsPresent['parent-1']+'.'+facetsPresent['parent-2']).length > 0) {
      $('#content .'+cleanString(facetsPresent.active)+'.'+facetsPresent['parent-1']+'.'+facetsPresent['parent-2']).first().removeClass('hide');
      return true;
    }
  }
  if (facetsPresent['parent-1'] != '') {
    if ($('#content .'+cleanString(facetsPresent.active)+'.'+facetsPresent['parent-1']).length > 0) {
      $('#content .'+cleanString(facetsPresent.active)+'.'+facetsPresent['parent-1']).first().removeClass('hide');
      return true;
    }
  }
  if (facetsPresent['parent-2'] != '') {
    if ($('#content .'+cleanString(facetsPresent.active)+'.'+facetsPresent['parent-2']).length > 0) {
      $('#content .'+cleanString(facetsPresent.active)+'.'+facetsPresent['parent-2']).first().removeClass('hide');
      return true;
    }
  }
  if ($('#content .'+cleanString(facetsPresent.active)).length > 0) {
    $('#content .'+cleanString(facetsPresent.active)).first().removeClass('hide');
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
    $('#masthead #nav').prepend('<a class="button '+value.type+' '+cleanString(index)+' hide" href="/?facet-active='+cleanString(index)+'">'+value.title+'</a>');
  });

  emblTagsRead();
  emblTagsNavigation();
  emblTagsPageContent();
}


runPage();
