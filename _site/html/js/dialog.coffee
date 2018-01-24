((window)->
    if typeof jQuery is 'undefined'
        throw new Error('Dialog component requires jQuery')


    Dialog = ->
        @.VERSION = "1.0.0"
        @.options = {}
        @.init()
        
    Dialog.prototype =
        init: ->
            if not $
                console.error "jQuery Required"
            return
            
        _wrapSize: (size) ->
            if size and $.isArray size
                size[0] = size[0] + 'px' if $.isNumeric size[0]
                size[1] = size[1] + 'px' if $.isNumeric size[1]
            else
                size = ['50%', '50%']
            return size
            
        set: (options) ->
            @.options = $.extend {}, @.options, options
        
        alert: (msg, callback)  ->
            root = @
            options = $.extend {}, root.options, {
                btn: root.options.btn[0]
            }
            layer.alert msg, options, callback
            
        success: (msg, callback) ->
            root = @
            options = $.extend {}, root.options, {
                icon: 1
                btn: root.options.btn[0]
            }
            layer.alert msg, options, callback
        warn: (msg, callback) ->
            root = @
            options = $.extend {}, root.options, {
                icon: 0
                btn: root.options.btn[0]
            }
            layer.alert msg, options, callback
        error: (msg, callback) ->
            root = @
            options = $.extend {}, root.options, {
                icon: 2
                btn: root.options.btn[0]
            }
            layer.alert msg, options, callback
            
        confirm: (msg, fnYes, fnCancel) ->
            root = @
            options = $.extend {}, root.options, {
                icon: 3
            }
            layer.confirm msg, options, (index) ->
                if fnYes
                    fnYes(index)
                layer.close index 
            ,(index) ->
                if fnCancel
                    fnCancel(index)
                    
        prompt: (title, fnYes, formType) ->
            root = @
            options = $.extend {}, root.options, {
                title: title
                formType: formType||1
            }
            layer.prompt options, fnYes
                    
        tip: (msg, selector, options) ->
            layer.tips msg, selector, $.extend {}, @.options, {
                shade: false
                btn: null
                closeBtn: 0
                time: @.options.tipsTime
            }           
            
        show: (selector, title, size) ->
            root = @
            size = ['50%', '50%'] if not size or not $.isArray size
            options = $.extend {}, root.options, {
                type: 1
                btn: null
                area: root._wrapSize size
                content: $(selector)
            }
            layer.open options
        iframe: (url, title, size) ->
            root = @
            size = ['50%', '50%'] if not size or not $.isArray size
            options = $.extend {}, root.options, {
                type: 2,
                btn: null
                area: root._wrapSize size
                content: url,
            }
            layer.open options
                
        loading: (second) ->
            root = @
            options = $.extend {}, root.options, {
                time: second * 1000
                btn: null,
                shade: root.options.loadingShade
            }
            layer.load root.options.loadingIcon, options
            
        loaded: ->
            layer.closeAll "loading"
                
    window.dialog = new Dialog()
) window