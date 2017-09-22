// we'll use this later to store what we've scanned from the URL or metatags
var facetsPresent = {};

// IA index
// A simple array index of key=>type.
//
// See master list of values at
// https://embl-design-language.github.io/Springboard/information-architecture/#facet-structure-and-categories
//
// This might pone day be some sort of lookup API that maps a value to our IA
// TODO: add a lookup by key function
var facetIndex = {
  'who': {
    'ciprianiteam': {
      'type':'who',
      'parent':'who:groups',
      'title':'Cipriani Team'
    },
    'groups': {
      'type':'who',
      'parent':'where:emblorg',
      'title':'Groups',
      'records':
      // ideally we'd want to use a 3rd level for sub-items
      // but i've not yet done that as it adds a good bit of complexity
      // to an idea that's in flux
      {
        'ciprianiteam': {
          'type':'who',
          'parent':'who:groups',
          'title':'Cipriani Team'
        }
      }
    },
    'people': {
      'type':'who',
      'parent':'where:emblorg',
      'title':'People'
    },
  },
  'where':{
    'barcelona': {
      'type':'where',
      'parent':'locations',
      'title':'Barcelona'
    },
    'grenoble': {
      'type':'where',
      'parent':'locations',
      'title':'Grenoble'
    },
    'hamburg': {
      'type':'where',
      'parent':'locations',
      'title':'Hamburg'
    },
    'hinxton': {
      'type':'where',
      'parent':'locations',
      'title':'Hinxton'
    },
    'heidelberg': {
      'type':'where',
      'parent':'locations',
      'title':'Heidelberg'
    },
    'rome': {
      'type':'where',
      'parent':'locations',
      'title':'Rome'
    },
    'emblorg': {
      'type':'where',
      'parent':'locations',
      'title':'EMBL.org'
    }
  },
  'what': {
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
    },
    'services': {
      'type':'what',
      'parent':'emblorg',
      'title':'Services'
    },
    'training': {
      'type':'what',
      'parent':'emblorg',
      'title':'Training'
    }
  },
  // allow a non-set state
  'null': {
    'null': 'null'
  }
}


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
     http://localhost:3000?facet-active=EMBL.org
 * - Research:Grenoble
     http://localhost:3000?facet-active=Research&facet-parent-1=Grenoble
 * - Cipriani Team:Research:Grenoble
     http://localhost:3000?facet-active=Cipriani Team&facet-parent-1=Research&facet-parent-2=EMBL.org
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
 * toLowerCase and drop '.', ' '
 * @param {string} val
 */
function cleanString(val) {
  val = val || 'null:null';
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
    facetsPresent[processing] = cleanString(getParameterByName('facet-'+processing))|| '';
    if (facetsPresent[processing] == 'null:null' && processing == 'active') {
      facetsPresent[processing] = 'where:emblorg'; // there should always be an active facet, fallback to embl.org
    }
    if (facetsPresent[processing] != 'null:null') {
      target.append('&lt;meta name="embl:'+processing+'" content="'+facetsPresent[processing]+'" /&gt; <br/>');
      $('head').prepend('<meta name="embl:'+processing+'" content="'+facetsPresent[processing]+'">')
    }
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
  // Get active facets we detected on content (URL or page meta tags)
  var tempActive =  (facetsPresent.active || 'null:null').split(':');
  var tempParent1 = (facetsPresent['parent-1'] || 'null:null').split(':');
  var tempParent2 = (facetsPresent['parent-2'] || 'null:null').split(':');

  // See if we have a corresponding entry in our index
  var facetActive = facetIndex[tempActive[0]][tempActive[1]] || "null:null";
  var facetParent1 = facetIndex[tempParent1[0]][tempParent1[1]] || "null:null";
  var facetParent2 = facetIndex[tempParent2[0]][tempParent2[1]] || "null:null";
  
  $('h1#facet-active').html(facetActive.title);
  $('title').html(facetActive.title);

  if (tempParent1[1] != 'null') {
    $('h1#facet-active').append('<small> < ' + facetParent1.title + '</small>');
  }
  if (tempParent2[1] != 'null') {
    $('h1#facet-active').append('<small> < ' + facetParent2.title + '</small>');
  }

  if (tempParent1[1] != 'null' || tempParent2[1] != 'null') {
    $('#masthead #nav a.'+tempActive[1]).removeClass('hide').addClass('strong').prepend('⬆️ ');
  } else {
    $('#masthead #nav a.'+tempActive[1]).removeClass('hide').addClass('strong').append(' <small>(you are here)</small>');
  }

  $('#masthead #nav a.'+tempParent1[1]).removeClass('hide').prepend('⬆️ ');
  $('#masthead #nav a.'+tempParent2[1]).removeClass('hide').prepend('⬆️ ');

  //console.log(facetsPresent);

  // amend parent menu links to inherit facets
  if ((tempParent1[1] != 'emblorg') && (tempParent1[0] != 'null')) {
    var tempHref = $('#masthead #nav a.'+tempParent2[1]).attr('href') + '&facet-parent-1=' + tempParent1[1];
    $('#masthead #nav a.'+tempParent2[1]).attr('href',tempHref);
    $('title').append(' < ' + facetIndex[tempParent1[0]][tempParent1[1]].title);
  }
  if ((tempParent2[1] != 'emblorg') && (tempParent2[0] != 'null')){
    var tempHref = $('#masthead #nav a.'+tempParent1[1]).attr('href') + '&facet-parent-1=' + tempParent2[1];
    $('#masthead #nav a.'+tempParent1[1]).attr('href',tempHref);
    $('title').append(' < ' + facetIndex[tempParent2[0]][tempParent2[1]].title);
  }

  // activate the default navigation and make it relative to the active item
  function defaultNavEnable(target) {
    var target = $(target);
    if (facetsPresent.active == 'where:emblorg') {
      target.removeClass('hide').addClass('float-right').prepend('⬇️ ');
    } else {
      target.removeClass('hide').addClass('float-right').prepend('↗️ ');
    }
    // if (tempActive[0] != 'null') {
    //   var targetHref = target.attr('href') + '&facet-parent-1=' + tempActive[0] + ':' + tempActive[1];
    // } else {
    //   var targetHref = target.attr('href'); // keep it as it is
    // }


    if ((tempParent1[0] != 'null') && (tempParent2[0] != 'null')) {
      var targetHref = target.attr('href') + '&facet-parent-1=' + tempParent1[0] + ':' + tempParent1[1] + '&facet-parent-2=' + tempParent2[1] + ':' + tempParent2[1];
    } else if (tempParent1[0] != 'null') {
      var targetHref = target.attr('href') + '&facet-parent-1=' + tempParent1[0] + ':' + tempParent1[1];
    } else if (tempParent2[0] != 'null') {
      var targetHref = target.attr('href') + '&facet-parent-1=' + tempParent2[0] + ':' + tempParent2[1];
    } else {
      var targetHref = target.attr('href'); // keep it as it is
    }
    target.attr('href',targetHref);
  }
  defaultNavEnable('#masthead #nav a.research.hide');
  defaultNavEnable('#masthead #nav a.administration.hide');
  defaultNavEnable('#masthead #nav a.people.hide');
  defaultNavEnable('#masthead #nav a.groups.hide');
  // emblorg doesn't inherit any parents
  $('#masthead #nav a.emblorg.hide').removeClass('hide').addClass('float-left').prepend('🏠 ');
}

/**
 * As we don't have real pages, we show and hide content depending on the active facet
 */
function emblActiveContent() {
  var facetType = facetsPresent.active.split(':')[0];
  var facetTerm = facetsPresent.active.split(':')[1];

  // prefer the highest level of specificity
  if ((facetsPresent['parent-1'] != '') && (facetsPresent['parent-2'] != '')) {
    if ($('#content .active-'+facetTerm+'-'+facetsPresent['parent-1'].split(':')[1]+'-'+facetsPresent['parent-2'].split(':')[1]).length > 0) {
      $('#content .active-'+facetTerm+'-'+facetsPresent['parent-1'].split(':')[1]+'-'+facetsPresent['parent-2'].split(':')[1]).first().removeClass('hide');
      return true;
    }
  }
  if (facetsPresent['parent-1'] != '') {
    if ($('#content .active-'+facetTerm+'-'+facetsPresent['parent-1'].split(':')[1]).length > 0) {
      $('#content .active-'+facetTerm+'-'+facetsPresent['parent-1'].split(':')[1]).first().removeClass('hide');
      return true;
    }
  }
  if (facetsPresent['parent-2'] != '') {
    if ($('#content .active-'+facetTerm+'-'+facetsPresent['parent-2'].split(':')[1]).length > 0) {
      $('#content .active-'+facetTerm+'-'+facetsPresent['parent-2'].split(':')[1]).first().removeClass('hide');
      return true;
    }
  }
  if ($('#content .active-'+facetTerm).length > 0) {
    $('#content .active-'+facetTerm).first().removeClass('hide');
    return true;
  }

  // still here? load the generic content
  $('#content .generic').removeClass('hide');
}

/**
 * Bootstrap our fake site
 */
function runPage() {
  // Invoke generic foundation JS
  // $(document).foundation();

  // Add core navigation to the global masthead
  $.each(facetIndex.who, function( index, value ) {
    $('#masthead #nav').prepend('<a class="button '+value.type+' '+cleanString(index)+' hide" href="?facet-active='+value.type+":"+index+'">'+value.title+'</a>');
  });
  $.each(facetIndex.what, function( index, value ) {
    $('#masthead #nav').prepend('<a class="button '+value.type+' '+cleanString(index)+' hide" href="?facet-active='+value.type+":"+index+'">'+value.title+'</a>');
  });
  $.each(facetIndex.where, function( index, value ) {
    $('#masthead #nav').prepend('<a class="button '+value.type+' '+cleanString(index)+' hide" href="?facet-active='+value.type+":"+index+'">'+value.title+'</a>');
  });

  // Read metatags per page and act accordingly
  emblTagsRead();
  emblTagsNavigation();
  emblActiveContent();
}

runPage();
