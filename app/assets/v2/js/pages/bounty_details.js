/* eslint block-scoped-var: "warn" */
/* eslint no-redeclare: "warn" */


var _truthy = function(val) {
  if (!val || val == '0x0000000000000000000000000000000000000000') {
    return false;
  }
  return true;
};
var address_ize = function(key, val, result) {
  if (!_truthy(val)) {
    return [ null, null ];
  }
  return [ key, '<a href="https://etherscan.io/address/' + val + '" target="_blank" rel="noopener noreferrer">' + val + '</a>' ];
};
var gitcoin_ize = function(key, val, result) {
  if (!_truthy(val)) {
    return [ null, null ];
  }
  return [ key, '<a href="https://gitcoin.co/profile/' + val + '" target="_blank" rel="noopener noreferrer">@' + val.replace('@', '') + '</a>' ];
};
var email_ize = function(key, val, result) {
  if (!_truthy(val)) {
    return [ null, null ];
  }
  return [ key, '<a href="mailto:' + val + '">' + val + '</a>' ];
};
var hide_if_empty = function(key, val, result) {
  if (!_truthy(val)) {
    return [ null, null ];
  }
  return [ key, val ];
};
var unknown_if_empty = function(key, val, result) {
  if (!_truthy(val)) {
    return [ key, 'Unknown' ];
  }
  return [ key, val ];
};
var link_ize = function(key, val, result) {
  if (!_truthy(val)) {
    return [ null, null ];
  }
  return [ key, '<a href="' + val + '" target="_blank" rel="noopener noreferrer">' + val + '</a>' ];
};

// rows in the 'about' page
var rows = [
  'avatar_url',
  'title',
  'github_url',
  'value_in_token',
  'value_in_eth',
  'value_in_usdt',
  'token_value_in_usdt',
  'web3_created',
  'status',
  'bounty_owner_address',
  'bounty_owner_email',
  'issue_description',
  'bounty_owner_github_username',
  'fulfillments',
  'experience_level',
  'project_length',
  'bounty_type',
  'expires_date',
  'bounty_owner_name',
  'issue_keywords',
  'started_owners_username',
  'submitted_owners_username',
  'fulfilled_owners_username'
];
var heads = {
  'avatar_url': 'Issue',
  'value_in_token': 'Issue Funding Info',
  'bounty_owner_address': 'Funder',
  'fulfiller_address': 'Submitter',
  'experience_level': 'Meta'
};
var callbacks = {
  'github_url': link_ize,
  'value_in_token': function(key, val, result) {
    return [ 'amount', Math.round((parseInt(val) / Math.pow(10, document.decimals)) * 1000) / 1000 + ' ' + result['token_name'] ];
  },
  'avatar_url': function(key, val, result) {
    return [ 'avatar', '<a href="/profile/' + result['org_name'] + '"><img class=avatar src="' + val + '"></a>' ];
  },
  'status': function(key, val, result) {
    var ui_status = val;

    if (ui_status == 'open') {
      ui_status = '<span>OPEN ISSUE</span>';
    }
    if (ui_status == 'started') {
      ui_status = '<span>work started</span>';
    }
    if (ui_status == 'submitted') {
      ui_status = '<span>work submitted</span>';
    }
    if (ui_status == 'done') {
      ui_status = '<span>done</span>';
    }
    if (ui_status == 'cancelled') {
      ui_status = '<span style="color: #f9006c;">cancelled</span>';
    }
    return [ 'status', ui_status ];
  },
  'issue_description': function(key, val, result) {
    var converter = new showdown.Converter();

    val = val.replace(/script/ig, 'scr_i_pt');
    var ui_body = val;

    ui_body = converter.makeHtml(ui_body);

    return [ 'issue_description', ui_body ];
  },
  'bounty_owner_address': address_ize,
  'bounty_owner_email': email_ize,
  'experience_level': unknown_if_empty,
  'project_length': unknown_if_empty,
  'bounty_type': unknown_if_empty,
  'bounty_owner_github_username': gitcoin_ize,
  'bounty_owner_name': function(key, val, result) {
    return [ 'bounty_owner_name', result.metadata.fullName ];
  },
  'issue_keywords': function(key, val, result) {
    var keywords = result.metadata.issueKeywords.split(',');
    var tags = [];

    keywords.forEach(function(keyword) {
      tags.push('<a href="/explorer/?q=' + keyword.trim() + '"><div class="tag keyword">' + keyword + '</div></a>');
    });
    return [ 'issue_keywords', tags ];
  },
  'value_in_eth': function(key, val, result) {
    if (result['token_name'] == 'ETH' || val === null) {
      return [ null, null ];
    }
    return [ 'Amount (ETH)', Math.round((parseInt(val) / Math.pow(10, 18)) * 1000) / 1000 ];
  },
  'value_in_usdt': function(key, val, result) {
    if (val === null) {
      return [ null, null ];
    }
    return [ 'Amount_usd', val ];
  },
  'token_value_in_usdt': function(key, val, result) {
    if (val === null) {
      $('#value_in_usdt_wrapper').addClass('hidden');
      return [ null, null ];
    }
    return [ 'Token_amount_usd', '$' + val + '/' + result['token_name'] ];
  },
  'web3_created': function(key, val, result) {
    return [ 'updated', timeDifference(new Date(result['now']), new Date(result['web3_created'])) ];
  },
  'expires_date': function(key, val, result) {
    var label = 'expires';

    expires_date = new Date(val);
    now = new Date(result['now']);
    var response = timeDifference(now, expires_date);

    if (new Date(val) < new Date()) {
      label = 'expired';
      if (result['is_open']) {
        response = "<span title='This issue is past its expiration date, but it is still active.  Check with the submitter to see if they still want to see it fulfilled.'>" + response + '</span>';
      }
    }
    return [ label, response ];
  },
  'started_owners_username': function(key, val, result) {
    var started = [];

    if (result.interested) {
      var interested = result.interested;

      interested.forEach(function(_interested) {
        started.push(
          '<a href="https://gitcoin.co/profile/' +
            _interested.profile.handle +
            '" target="_blank">' +
            _interested.profile.handle + '</a>'
        );
      });
      if (started.length == 0) {
        started.push('<i class="fas fa-minus"></i>');
      }
    }
    return [ 'started_owners_username', started ];
  },
  'submitted_owners_username': function(key, val, result) {
    var accepted = [];

    if (result.fulfillments) {
      var submitted = result.fulfillments;

      submitted.forEach(function(_submitted) {
        accepted.push(
          '<a href="https://gitcoin.co/profile/' +
            _submitted.fulfiller_github_username +
            '" target="_blank">' +
            _submitted.fulfiller_github_username + '</a>'
        );
      });
      if (accepted.length == 0) {
        accepted.push('<i class="fas fa-minus"></i>');
      }
    }
    return [ 'submitted_owners_username', accepted ];
  },
  'fulfilled_owners_username': function(key, val, result) {
    var accepted = [];

    if (result.fulfillments) {
      var fulfillments = result.fulfillments;

      fulfillments.forEach(function(fufillment) {
        if (fufillment.accepted == true) {
          accepted.push(
            '<a href="https://gitcoin.co/profile/' +
              fufillment.fulfiller_github_username +
              '" target="_blank">' +
              fufillment.fulfiller_github_username + '</a>'
          );
        }
      });
      if (accepted.length == 0) {
        accepted.push('<i class="fas fa-minus"></i>');
      }
    }
    return [ 'fulfilled_owners_username', accepted ];
  }
};

var isBountyOwner = function(result) {
  var bountyAddress = result['bounty_owner_address'];

  return (typeof web3 != 'undefined' && (web3.eth.coinbase == bountyAddress));
};

var update_title = function() {
  document.original_title_text = $('title').text();
  setInterval(function() {
    if (document.prepend_title == '(...)') {
      document.prepend_title = '(*..)';
    } else if (document.prepend_title == '(*..)') {
      document.prepend_title = '(.*.)';
    } else if (document.prepend_title == '(.*.)') {
      document.prepend_title = '(..*)';
    } else {
      document.prepend_title = '(...)';
    }
    $('title').text(document.prepend_title + ' ' + document.original_title_text);
  }, 2000);
};

var showWarningMessage = function(txid) {

  update_title();

  if (typeof txid != 'undefined' && txid.indexOf('0x') != -1) {
    clearInterval(interval);
    var link_url = etherscan_tx_url(txid);

    $('#transaction_url').attr('href', link_url);
  }

  $('.left-rails').hide();
  $('#bounty_details').hide();
  $('#bounty_detail').hide();

  $('.transaction-status').show();
  $('.waiting_room_entertainment').show();

  var radioButtons = $('.sidebar_search input');

  for (var i = radioButtons.length - 1; i >= 0; i--) {
    radioButtons[i].disabled = true;
  }

  var secondsBetweenQuoteChanges = 30;

  waitingRoomEntertainment();
  var interval = setInterval(waitingRoomEntertainment, secondsBetweenQuoteChanges * 1000);
};

var wait_for_tx_to_mine_and_then_ping_server = function() {
  console.log('checking for updates');
  if (typeof document.pendingIssueMetadata != 'undefined') {
    var txid = document.pendingIssueMetadata['txid'];

    console.log('waiting for web3 to be available');
    callFunctionWhenweb3Available(function() {
      console.log('waiting for tx to be mined');
      callFunctionWhenTransactionMined(txid, function() {
        console.log('tx mined');
        var data = {
          url: document.issueURL,
          txid: txid,
          network: document.web3network
        };
        var error = function(response) {
          // refresh upon error
          document.location.href = document.location.href;
        };
        var success = function(response) {
          if (response.status == '200') {
            console.log('success from sync/web', response);

            // clear local data
            localStorage[document.issueURL] = '';
            document.location.href = document.location.href;
          } else {
            console.log('error from sync/web', response);
            error(response);
          }
        };

        console.log('syncing gitcoin with web3');
        var uri = '/sync/web3/';

        $.ajax({
          type: 'POST',
          url: uri,
          data: data,
          success: success,
          error: error,
          dataType: 'json'
        });
      });
    });
  }
};

var attach_work_actions = function() {
  $('body').delegate('a[href="/interested"], a[href="/uninterested"]', 'click', function(e) {
    e.preventDefault();
    if ($(this).attr('href') == '/interested') {
      $(this).attr('href', '/uninterested');
      $(this).find('span').text('Stop Work');
      add_interest(document.result['pk']);
    } else {
      $(this).attr('href', '/interested');
      $(this).find('span').text('Start Work');
      remove_interest(document.result['pk']);
    }
  });
};

var build_detail_page = function(result) {

  // setup
  var decimals = 18;
  var related_token_details = tokenAddressToDetails(result['token_address']);

  if (related_token_details && related_token_details.decimals) {
    decimals = related_token_details.decimals;
  }
  document.decimals = decimals;
  $('#bounty_details').css('display', 'inline');

  // title
  result['title'] = result['title'] ? result['title'] : result['github_url'];
  result['title'] = result['network'] != 'mainnet' ? '(' + result['network'] + ') ' + result['title'] : result['title'];
  $('.title').html('Funded Issue Details: ' + result['title']);

  // insert table onto page
  for (var j = 0; j < rows.length; j++) {
    var key = rows[j];
    var head = null;
    var val = result[key];

    if (heads[key]) {
      head = heads[key];
    }
    if (callbacks[key]) {
      _result = callbacks[key](key, val, result);
      val = _result[1];
    }
    var _entry = {
      'head': head,
      'key': key,
      'val': val
    };
    var id = '#' + key;

    if ($(id).length) {
      $(id).html(val);
    }
  }

};

var do_actions = function(result) {

  // helper vars
  var is_legacy = result['web3_type'] == 'legacy_gitcoin';
  var is_date_expired = (new Date(result['now']) > new Date(result['expires_date']));
  var is_status_expired = result['status'] == 'expired';
  var is_status_done = result['status'] == 'done';
  var is_status_cancelled = result['status'] == 'cancelled';
  var can_submit_after_expiration_date = result['can_submit_after_expiration_date'];
  var is_still_on_happy_path = result['status'] == 'open' || result['status'] == 'started' || result['status'] == 'submitted' || (can_submit_after_expiration_date && result['status'] == 'expired');

  // Find interest information
  pull_interest_list(result['pk'], function(is_interested) {

    // which actions should we show?
    var show_start_stop_work = is_still_on_happy_path;
    var show_github_link = result['github_url'].substring(0, 4) == 'http';
    var show_submit_work = true;
    var show_kill_bounty = !is_status_done && !is_status_expired && !is_status_cancelled;
    var show_increase_bounty = !is_status_done && !is_status_expired && !is_status_cancelled;
    var kill_bounty_enabled = isBountyOwner(result);
    var submit_work_enabled = !isBountyOwner(result);
    var start_stop_work_enabled = !isBountyOwner(result);
    var increase_bounty_enabled = isBountyOwner(result);
    var show_accept_submission = isBountyOwner(result) && !is_status_expired;

    if (is_legacy) {
      show_start_stop_work = false;
      show_github_link = true;
      show_submit_work = false;
      show_kill_bounty = false;
      show_accept_submission = false;
    }

    // actions
    var actions = [];

    if (show_github_link) {

      var github_url = result['github_url'];

      // hack to get around the renamed repo for piper's work.  can't change the data layer since blockchain is immutable
      github_url = github_url.replace('pipermerriam/web3.py', 'ethereum/web3.py');
      github_url = github_url.replace('ethereum/browser-solidity', 'ethereum/remix-ide');
      var github_tooltip = 'Github is where the issue scope lives.  Its also a great place to collaborate with, and get to know, other developers (and sometimes even the repo maintainer themselves!).';

      if (result['github_comments']) {
        $('#github-link').html(
          ('<span title="').concat("<div class='tooltip-info tooltip-sm'>") + github_tooltip + '</div>"><a class="btn btn-small font-caption" role="button" target="_blank" id="github-btn" href="' +
            github_url + ('">View On Github').concat('<span class="github-comment">') + result['github_comments'] + '</span></a></span>'
        );
      } else {
        $('#github-link').html(
          ('<span title="').concat("<div class='tooltip-info tooltip-sm'>") + github_tooltip + '</div>"><a class="btn btn-small font-caption" role="button" target="_blank" id="github-btn" href="' +
            github_url + ('">View On Github').concat('</a></span>')
        );
      }
    }

    if (show_start_stop_work) {

      // is enabled
      var enabled = start_stop_work_enabled;
      var interest_entry = {
        enabled: enabled,
        href: is_interested ? '/uninterested' : '/interested',
        text: is_interested ? 'Stop Work' : 'Start Work',
        parent: 'right_actions',
        title: 'Start Work in an issue to let the issue funder know that youre starting work on this issue.'
      };

      actions.push(interest_entry);

    }

    if (show_submit_work) {
      // is enabled
      var enabled = submit_work_enabled;
      var _entry = {
        enabled: enabled,
        href: '/funding/fulfill?source=' + result['github_url'],
        text: 'Submit Work',
        parent: 'right_actions',
        title: 'Use Submit Work when you FINISH work on a bounty. '
      };

      actions.push(_entry);
    }

    if (show_increase_bounty) {
      var enabled = increase_bounty_enabled;
      var _entry = {
        enabled: enabled,
        href: '/funding/increase?source=' + result['github_url'],
        text: 'Add Contribution',
        parent: 'right_actions',
        title: 'Increase the funding of this bounty'
      };

      actions.push(_entry);
    }

    if (show_kill_bounty) {
      var enabled = kill_bounty_enabled;
      var _entry = {
        enabled: enabled,
        href: '/funding/kill?source=' + result['github_url'],
        text: 'Kill Bounty',
        parent: 'right_actions',
        title: 'Use Kill Bounty if you want to CANCEL your bounty'
      };

      actions.push(_entry);
    }

    var pending_acceptance = result.fulfillments.filter(fulfillment => fulfillment.accepted == false).length;

    if (show_accept_submission && pending_acceptance > 0) {
      var enabled = show_accept_submission;
      var _entry = {
        enabled: enabled,
        href: '/funding/process?source=' + result['github_url'],
        text: 'Accept Submission',
        title: 'This will payout the bounty to the submitter.',
        parent: 'right_actions',
        pending_acceptance: pending_acceptance
      };

      actions.push(_entry);
    }

    render_actions(actions);

  });
};

var render_actions = function(actions) {
  for (var l = 0; l < actions.length; l++) {
    var target = actions[l]['parent'];
    var tmpl = $.templates('#action');
    var html = tmpl.render(actions[l]);

    $('#' + target).append(html);
  }
};

var pull_bounty_from_api = function() {
  var uri = '/actions/api/v0.1/bounties/?github_url=' + document.issueURL;

  $.get(uri, function(results) {
    results = sanitizeAPIResults(results);
    var nonefound = true;
    // potentially make this a lot faster by only pulling the specific issue required

    for (var i = 0; i < results.length; i++) {
      var result = results[i];
      // if the result from the database matches the one in question.

      if (normalizeURL(result['github_url']) == normalizeURL(document.issueURL)) {
        nonefound = false;

        build_detail_page(result);

        do_actions(result);

        render_activity(result);

        document.result = result;
        return;
      }
    }
    if (nonefound) {
      $('#primary_view').css('display', 'none');
      // is there a pending issue or not?
      $('.nonefound').css('display', 'block');
    }
  }).fail(function() {
    _alert({message: 'got an error. please try again, or contact support@gitcoin.co'}, 'error');
    $('#primary_view').css('display', 'none');
  }).always(function() {
    $('.loading').css('display', 'none');
  });
};


var render_activity = function(result) {
  var activities = [];

  if (result.fulfillments) {
    result.fulfillments.forEach(function(fulfillment) {
      if (fulfillment.accepted == true) {
        activities.push({
          name: fulfillment.fulfiller_github_username,
          address: fulfillment.fulfiller_address,
          email: fulfillment.fulfiller_email,
          fulfillment_id: fulfillment.fulfillment_id,
          text: 'Work Accepted',
          created_on: fulfillment.created_on,
          age: timeDifference(new Date(result['now']), new Date(fulfillment.created_on)),
          status: 'accepted'
        });
      }
      activities.push({
        name: fulfillment.fulfiller_github_username,
        text: 'Work Submitted',
        created_on: fulfillment.created_on,
        age: timeDifference(new Date(result['now']), new Date(fulfillment.created_on)),
        status: 'submitted'
      });
    });
  }

  if (result.interested) {
    result.interested.forEach(function(_interested) {
      activities.push({
        name: _interested.profile.handle,
        text: 'Work Started',
        created_on: _interested.created,
        age: timeDifference(new Date(result['now']), new Date(_interested.created))
      });
    });
  }

  activities = activities.slice().sort(function(a, b) {
    return a['created_on'] < b['created_on'] ? -1 : 1;
  }).reverse();

  var html = '<div class="row box activity"><div class="col-12 empty"><p>There\'s no activity yet!</p></div></div>';

  if (activities.length > 0) {
    var template = $.templates('#activity_template');

    html = template.render(activities);
  }

  $('#activities').html(html);
};

var main = function() {
  setTimeout(function() {
    // setup
    attach_work_actions();

    // pull issue URL
    if (typeof document.issueURL == 'undefined') {
      document.issueURL = getParam('url');
    }
    $('#submitsolicitation a').attr('href', '/funding/new/?source=' + document.issueURL);

    // if theres a pending submission for this issue, show the warning message
    // if not, pull the data from the API
    var isPending = false;

    if (localStorage[document.issueURL]) {
      // validate pending issue metadata
      document.pendingIssueMetadata = JSON.parse(localStorage[document.issueURL]);
      var is_metadata_valid = typeof document.pendingIssueMetadata != 'undefined' && document.pendingIssueMetadata !== null && typeof document.pendingIssueMetadata['timestamp'] != 'undefined';

      if (is_metadata_valid) {
        // validate that the pending tx is within the last little while
        var then = parseInt(document.pendingIssueMetadata['timestamp']);
        var now = timestamp();
        var acceptableTimeDeltaSeconds = 60 * 60; // 1 hour
        var isWithinAcceptableTimeRange = (now - then) < acceptableTimeDeltaSeconds;

        if (isWithinAcceptableTimeRange) {
          // update from web3
          var txid = document.pendingIssueMetadata['txid'];

          showWarningMessage(txid);
          wait_for_tx_to_mine_and_then_ping_server();
          isPending = true;
        }
      }
    }
    // show the actual bounty page
    if (!isPending) {
      pull_bounty_from_api();
    }

  }, 100);
};


window.addEventListener('load', function() {
  main();
});
