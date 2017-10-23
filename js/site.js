$(function () {
    github.getEvents(function (res) {
        $('#github-events').html(
            github.render(res, '<div class="item">' +
                '<div><div style="float:left">%action%</div> <div style="float:right">%date%</div> </div> ' +
                '<div style="clear: both;">%title% [<a href="%repoUrl%">%repo%</a>]</div>' +
                '</div>'));
    });
});