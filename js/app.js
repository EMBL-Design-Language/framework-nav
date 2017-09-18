// notes
// - Child relationship not yet implement -- they may not be relevant
// - wildcard (*) not yet implemented -- needs more thought

/**
 * Get URL paramater
 * We'll use this to synthesise a website with one page
 *
 * The meta tag syntax we synthesise is in the format of:
 *   <meta name="embl:facet-who"   content="child"   data-tag="*" />
 *   <meta name="embl:facet-what"  content="primary" data-tag="Research" />
 *   <meta name="embl:facet-where" content="parent"  data-tag="EMBL.org" />
 *
 * We fabricate as
 * - EMBL.org homepage
     http://localhost:3000/?facet-where=EMBL.org&facet-active=where
 * - Research at Grenoble
     http://localhost:3000/?facet-what=research&facet-where=Grenoble&facet-active=what&facet-parent=where
 * - Cipriani Team. Research at Grenoble
     http://localhost:3000/?facet-who=Cipriani Team&facet-what=research&facet-where=Grenoble&facet-parent=where&facet-parent2=what&facet-active=who
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
  facet = facet.split('-')[1];
  if (getParameterByName('facet-active') == facet) {
    return 'active';
  }
  if (getParameterByName('facet-parent') == facet) {
    return 'parent';
  }
  // allow for multipe parents
  if (getParameterByName('facet-parent2') == facet) {
    return 'parent';
  }
  if (getParameterByName('facet-parent3') == facet) {
    return 'parent';
  }
  if (getParameterByName('facet-child') == facet) {
    return 'child';
  }
}

/**
 * Indicate which metatags are currently active.
 * You just need a div with class 'metatag-readout'
 * This will also write the tags to the <head>
 */
function updateMetaTagReadout() {

  var target = $('.metatag-readout');
  target.html('');

  var processing = '';

  processing = 'facet-who';
  target.append('&lt;meta name="embl:'+processing+'" content="'+getContentTag(processing)+'" data-tag="'+getParameterByName(processing)+'" /&gt; <br/>');
  $('head').prepend('<meta name="embl:'+processing+'" content="'+getContentTag(processing)+'" data-tag="'+getParameterByName(processing)+'">')

  processing = 'facet-what';
  target.append('&lt;meta name="embl:'+processing+'" content="'+getContentTag(processing)+'" data-tag="'+getParameterByName(processing)+'" /&gt; <br/>');
  $('head').prepend('<meta name="embl:'+processing+'" content="'+getContentTag(processing)+'" data-tag="'+getParameterByName(processing)+'">')

  processing = 'facet-where';
  target.append('&lt;meta name="embl:'+processing+'" content="'+getContentTag(processing)+'" data-tag="'+getParameterByName(processing)+'" /&gt; <br/>');
  $('head').prepend('<meta name="embl:'+processing+'" content="'+getContentTag(processing)+'" data-tag="'+getParameterByName(processing)+'">')
}

function debugUrlTags() {
  console.log('current url is: ',window.location.href);
  console.log('facet-active is: ',getParameterByName('facet-active'));
  console.log('facet-who is: ',getParameterByName('facet-who'));
  console.log('facet-what is: ',getParameterByName('facet-what'));
  console.log('facet-where is: ',getParameterByName('facet-where'));
}

/**
 * Read the meta tags from the page and populate navigation
 *
 * TODO: we're still using the URLs here, we should read in the metatags we've
 * written with JS
 */
function loadMetatagsIntoContent() {
  var facet = new Array();
  facet['active'] = getParameterByName('facet-active') || 'null';
  facet['parent'] = getParameterByName('facet-parent') || 'null';
  facet['parent2'] = getParameterByName('facet-parent2') || 'null';
  facet['parent3'] = getParameterByName('facet-parent3') || 'null';

  if (facet['active'] != 'null') {
    $('h1#facet-active').html(getParameterByName('facet-'+facet['active']));
    $('title').html(getParameterByName('facet-'+facet['active']));
  }

  // global masthead nav

  if (facet['parent'] != 'null') {
    var link='"/?facet-active='+facet['parent']+'&facet-'+facet['parent']+'='+getParameterByName('facet-'+facet['parent'])+'"';
    $('#facet-parent').html('<a href='+link+'>'+getParameterByName('facet-'+facet['parent'])+'</a>');
  } else {
    $('#facet-parent').hide();
  }
  if (facet['parent2'] != 'null') {
    var link='"/?facet-active='+facet['parent2']+'&facet-'+facet['parent2']+'='+getParameterByName('facet-'+facet['parent2'])+'"';
    $('#facet-parent2').html(getParameterByName('facet-'+facet['parent2']));
  } else {
    $('#facet-parent2').hide();
  }
  if (facet['parent3'] != 'null') {
    var link='"/?facet-active='+facet['parent3']+'&facet-'+facet['parent3']+'='+getParameterByName('facet-'+facet['parent3'])+'"';
    $('#facet-parent3').html(getParameterByName('facet-'+facet['parent3']));
  } else {
    $('#facet-parent3').hide();
  }

}

/**
 * As we don't have real pages, we show and hide content depending on the active facet
 */
function toggleContent() {
  var facet = new Array();
  facet['active'] = getParameterByName('facet-active') || '';
  facet['active'] = getParameterByName('facet-'+facet['active']).replace(/\./g,'').replace(/ /g,'').toLowerCase();
  facet['parent'] = getParameterByName('facet-parent') || false;
  if (facet['parent']) facet['parent'] = '.'+getParameterByName('facet-'+facet['parent']).replace(/\./g,'').replace(/ /g,'').toLowerCase();
  facet['parent2'] = getParameterByName('facet-parent2') || false;
  if (facet['parent2']) facet['parent2'] = '.'+getParameterByName('facet-'+facet['parent2']).replace(/\./g,'').replace(/ /g,'').toLowerCase();
  facet['parent3'] = getParameterByName('facet-parent3') || false;
  if (facet['parent3']) facet['parent3'] = '.'+getParameterByName('facet-'+facet['parent3']).replace(/\./g,'').replace(/ /g,'').toLowerCase();

  // console.log(facet);
  console.log('will show:', '#content .'+facet['active']+facet['parent']+facet['parent2']+facet['parent3'])

  // prefer the highest leve of specificity
  if ($('#content .'+facet['active']+facet['parent']+facet['parent2']+facet['parent3']).length > 0) {
    $('#content .'+facet['active']+facet['parent']+facet['parent2']+facet['parent3']).first().removeClass('hide');
    $('#masthead .button.'+facet['active']+facet['parent']+facet['parent2']+facet['parent3']).first().removeClass('hide');
    return true;
  }
  if ($('#content .'+facet['active']+facet['parent']+facet['parent2']).length > 0) {
    $('#content .'+facet['active']+facet['parent']+facet['parent2']).first().removeClass('hide');
    $('#masthead .button.'+facet['active']+facet['parent']+facet['parent2']).first().removeClass('hide');
    return true;
  }
  if ($('#content .'+facet['active']+facet['parent']).length > 0) {
    $('#content .'+facet['active']+facet['parent']).first().removeClass('hide');
    $('#masthead .button.'+facet['active']+facet['parent']).first().removeClass('hide');
    return true;
  }
  if ($('#content .'+facet['active']).length > 0) {
    $('#content .'+facet['active']).first().removeClass('hide');
    $('#masthead .button.'+facet['active']).first().removeClass('hide');
    // $('#masthead .button.'+facet['active']).attr('href','?');
    return true;
  }

}


/**
 * Do all of the above on page load
 */
function runPage() {
  // Invoke generic foundation JS
  // $(document).foundation();

  // debugUrlTags();
  updateMetaTagReadout();
  loadMetatagsIntoContent();
  toggleContent();
}


runPage();
