$(function () {
    github.getEvents(function (res) {
	var events = [];
        for(var i = 0; i < res.length; i++) {
	    if (moment(res[i].date).isBefore(moment().subtract(1, 'd'))) {
	        res[i].date = moment(res[i].date).fromNow();
                events.push(res[i]);
            }
        }
        $('#github-events').html(
            github.render(events, '<div class="item">' +
                '<div><div style="float:left">%action%</div></div> ' +
                '<div style="clear: both;">[<a href="%repoUrl%">%repo%</a>] %title% </div>' +
                '</div>'));
    });

    $("#frontpageFrame").css({height: 'calc(100vh - 50px)'});

    $('#searchForm').submit(function() {
        var k = $('.input-keywords-gists').val();
        window.open('https://gist.github.com/search?q=user:bndynet ' + k);
    });

    // highlightjs
    $('pre code').each(function(i, block) {
        hljs.highlightBlock(block);
    });
});
