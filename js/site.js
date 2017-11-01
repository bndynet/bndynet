$(function () {
    github.getEvents(function (res) {
        $('#github-events').html(
            github.render(res, '<div class="item">' +
                '<div><div style="float:left">%action%</div> <div style="float:right">%date%</div> </div> ' +
                '<div style="clear: both;">%title% [<a href="%repoUrl%">%repo%</a>]</div>' +
                '</div>'));
    });

    $('.btn-search-gists').click(function() {
        var k = $('.input-keywords-gists').val();
        if (k) {
            window.open('https://gist.github.com/search?q=user:bndynet ' + k);
        }
    });
});