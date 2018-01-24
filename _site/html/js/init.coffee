$ ->
    if $ and $.fn.iCheck
        $("input:checkbox, input:radio").iCheck 
            checkboxClass: "icheckbox_minimal"
            radioClass: "iradio_minimal"
            increaseArea: "20%" # optional
        
    if typeof dialog isnt "undefined"
        dialog.set 
            title: "INFO"
            shade: [0.2, "#000"]
            shadeClose: false
            shift: 0    # 0-9
            maxmin: true
            fix: true
            btn: ["OK", "Cancel"]
            closeBtn: 1     #0-2
            tips: [1, '#f0ad4e']
            tipsTime: 3000
            loadingIcon: 1      #0-2
            loadingShade: [0.6, "#fff"]
        
        
    return