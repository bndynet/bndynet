---
layout: page
title:  "jQuery - Linked Dropdown List"
teaser: ""
breadcrumb: true
categories:
    - Gists
author: Bendy Zhang
---

```js
$.fn.extend({
    // options: [{label: '', css: '', valueProperty: '', textProperty: '', selectedValue: '', childProperty: ''}, {...}]
    linkedDropdownList: function(data, options) {
        var _this = $(this);
        var id = _this.attr('id') + '_linkedDDL';
        var selectedObjects = [];
        var elFields = [];
        var elContainer = $('<div id="' + id + '"></div>');
        _this.append(elContainer);

        for(var i = 0; i < options.length; i++) {
            options[i].index = i;
            buildField(options[i]);
        }

        function buildField(option) {
            var elSelectId = id + '_' + option.index;
            var d = option.index === 0 ? data : selectedObjects[option.index - 1][options[option.index - 1].childProperty];
            if (!d || d.length === 0) {
                destroyField(option);
                return null;
            }

            var elField = $('<div class="form-group"><select id="' + elSelectId + '" class="form-control"></select></div>');
            if (option.label) {
                elField.prepend('<label for="' + elSelectId + '">' + option.label + '</label>');
            }
            if (option.css) {
                elField.addClass(option.css);
            }
            var elSelect = elField.find('select');
            selectedObjects[option.index] = d.length > 0 ? d[0] : null;
            for(var i = 0; i < d.length; i++) {
                var item = d[i];
                var elOption = $('<option value="' + (item[option.valueProperty]||'') + '">' + (item[option.textProperty]||'') + '</option>');
                if (option.selectedValue === item[option.valueProperty]) {
                    selectedObjects[option.index] = item;
                    elOption.prop('selected', true);
                }
                elSelect.append(elOption);
            } 
            elSelect.on('change', function() {
                option.selectedValue = $(this).val();
                for (var i = 0; i < d.length; i++) {
                    if (d[i][option.valueProperty] == option.selectedValue) {
                        selectedObjects[option.index] = d[i];
                    }
                }
                changeSelect(option);
            });
            elFields[option.index] = elField;
            elContainer.append(elField);
            return elField;
        }

        function rebindField(option) {
            var fieldData = option.index === 0 ? data : selectedObjects[option.index-1] ? selectedObjects[option.index-1][options[option.index-1].childProperty] : null;
            var elField = elFields[option.index];
            if (!elField) {
                elField = elFields[option.index] = buildField(option);
            }
            if (!elField) {
                destroyField(option);
                return;
            }

            var elSelect = elField.find('select');
            elSelect.find('option').remove();
            selectedObjects[option.index] = fieldData && fieldData.length > 0 ? fieldData[0] : null;
            if (fieldData && fieldData.length > 0) {
                for(var i = 0; i < fieldData.length; i++) {
                    var item = fieldData[i];
                    var elOption = $('<option value="' + (item[option.valueProperty]||'') + '">' + (item[option.textProperty]||'') + '</option>');
                    if (option.selectedValue === item[option.valueProperty]) {
                        selectedObjects[option.index] = item;
                        elOption.prop('selected', true);
                    }
                    elSelect.append(elOption);
                }
            } else {
                destroyField(option);
            }
        }

        function destroyField(option) {
            if (elFields[option.index]) {
                elFields[option.index].remove();
            }
            elFields[option.index] = null;
        }

        function changeSelect(option) {
            for(var i = option.index + 1; i < options.length; i++) {
                rebindField(options[i]);
            }
        }

        return {
            values: function() {
                var result = [];
                for(var i = 0; i < options.length; i++) {
                    result.push(elFields[i].find('select').val());
                }
                return result;
            },
        };
    }
});

```

