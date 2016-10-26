### based on jQuery
# 
# Copyright 2016 http://www.bndy.net
# Released by Bndy on Oct 19, 2016
# 
# Optional Conponent: icheck (https://github.com/fronteed/icheck)
# 
# Example:
#   $('#chkAll').checkAll('.child', {
#       inverse: true,  // true to inverse the checkbox, otherwise all or none
#       end: function(){
#           var checked = $(this).prop('checked');
#           console.debug(checked ? 'Checked' : 'Unchecked');
#       }
#   });
###
(($)->
    $.fn.extend
        checkAll: (selector, options) ->
            sender = $(this)
            end  = if options then options.end else null
            inverse = if options then options.inverse else false
            sender.click ->
                if not inverse
                    checked = $(this).is ":checked"
                    $(selector).prop "checked", checked
                else
                    $(selector).each ->
                        checked = $(this).is ":checked"
                        $(this).prop "checked", !checked
                end.bind(sender)() if end
                
        icheckAll: (selector, options) ->
            sender = $(this)
            withICheck = sender.parent().attr('class') and sender.parent().attr('class').indexOf("icheckbox_") >= 0
            if withICheck
                # icheck component, https://github.com/fronteed/icheck
                end  = if options then options.end else null
                inverse = if options then options.inverse else false
                sender.on "ifChanged", (event) ->
                    if inverse
                        $(selector).iCheck("toggle")
                    else
                        checked = $(sender).is ":checked"
                        $(selector).iCheck if checked then "check" else "uncheck"
                    end.bind(sender)() if end
            else
                sender.checkAll selector, options
) jQuery