/**
 * bTree based on jQuery 1.8+
 *
 * Copyright 2013 http://www.bndy.net
 * Released by Bndy on April 12, 2013
 *
 * Notes:
 *		- Developed based on jQuery 1.9+, Unavailable under jQuery 1.7-
 *		- The style MUST be defined based on the CLASS name in the following sample
 *		- Sample: 
			<div class="node [selected]" id="[id]">
				<span class="ico expand"></span>
				<span class="text">[text]</span>
				<span class="opt">
					<span class="btn">[Button Text]</span>
					<span class="split"> | </span>
					<span class="btn">[Button Text]</span>
				</span></div>
			</div>
			<div class="children [selected]">[Above Format]</div>
 */

(function ($) {
	$.fn.extend({
		bTree: function (options) {
			var that = this;
			var defaults = {
				url: '',
				buttons: {},
				buttonSplit: '<span class="split"> | </span>',
				complete: {},
				change: {}
			};
			var options = $.extend(defaults, options);

			$.ajax({
				url: options.url,
                dataType: 'json',
				success: function (data, event) {
					$.bTree._render(that, options, data);

					// Effects
					that.on('mouseover', '.node', function () {
						$(this).addClass('highlight');
					});
					that.on('mouseout', '.node', function () {
						$(this).removeClass('highlight');
					});
					that.on('click', '.ico', function () {
						var n = $.bTree.getNodes($(this).parent());
						var ico = $(this);
						if (n.hasChild) {
							if ($(n.children).css('display') != 'none') {
								$(this).parent().data('expand', false)
								ico.removeClass('expand');
								ico.addClass('shrink');
								$(n.children).hide();
							}
							else {
								$(this).parent().data('expand', true)
								ico.removeClass('shrink');
								ico.addClass('expand');
								$(n.children).show();
							}
						}
					});
				}
			})
			.done(function () {
				options.complete();
			})
			.fail(function () {
				alert('Ajax Error: ' + arguments[2]);
			});
		}
	});

	jQuery.bTree = {
		self: {},
		options: {},
		getNodes: function (node) {
			var n = $(node);
			// parent
			var prev = n.parent().prev();
			if (prev !== undefined) {
				n.parentNode = prev;
			}

			n.children = $('<div class="children"></div>');
			n.hasChild = false;
			var next = n.next();
			if (next !== undefined && next.hasClass('children')) {
				n.children = next;
				if (next.find('.node').length > 0)
					n.hasChild = true;
			}
			else {
				n.children.insertAfter(n);
			}

			return n;
		},
		refreshNode: function (node) {
			var n = $.bTree.getNodes($(node));
			var ico = n.find('.ico:first');
			if (n.parent().hasClass('children')) {
				var p = n.parent().prev();
				if (p !== undefined) {
					n.data('path', p.data('path') + '\\' + n.attr('id'));
					ico.css('margin-left', (n.data('path').split('\\').length - 1) * 16);
				}
			}
			else {
				// 1 level nodes
				n.data('path', n.attr('id'));
			}

			// Expand all nodes
			n.find('.children').show();
			n.data('expand', true);

			if (n.hasChild) {
				ico.addClass('expand');
				// Refresh children
				$(n.children).find('> .node').each(function () {
					$.bTree.refreshNode($(this));
				});
			}
			else {
				// Leaf
				n.find('.ico').removeClass('expand');
				n.find('.ico').removeClass('shrink');
			}
			// For debug
			//$('.tree').find('.node').each(function () {
			//	$(this).find('.text:first').html($(this).data('path'));
			//});
		},
		newNode: function (nodeText, nodeIdentity, sender, action) {
			var treeWrap = $.bTree.self;
			var nodeWrap = $('<div class="node"></div>');
			var icoWrap = $('<span class="ico"></span>');
			var textWrap = $('<span class="text"></span>');
			var optWrap = $('<span class="opt"></span>');

			icoWrap.appendTo(nodeWrap);
			textWrap.appendTo(nodeWrap);
			optWrap.appendTo(nodeWrap);

			textWrap.text(nodeText);

			nodeWrap.attr('id', nodeIdentity);
			nodeWrap.removeClass('hidden');

			optWrap.text('');
			$.bTree._createButtons(nodeWrap);

			var tree = $.bTree.self;
			var senderPath = $(sender).data('path');
			var path = senderPath + '\\' + nodeIdentity;
			switch (action) {

				case 'insertAfter':
					path = senderPath.substring(0, senderPath.lastIndexOf('\\') + 1) + nodeIdentity;
					var prev = $(sender).next();
					if (prev.hasClass('children')) {
						nodeWrap.insertAfter(prev);
					}
					else {
						nodeWrap.insertAfter($(sender));
					}
					$.bTree._onChange();
					break;

				case 'insertBefore':
					path = senderPath.substring(0, senderPath.lastIndexOf('\\') + 1) + nodeIdentity;
					nodeWrap.insertBefore($(sender));
					$.bTree._onChange();
					break;

				case 'child':
					var box = $(sender).next();
					if (!box.hasClass('children')) {
						box = $('<div class="children"></div>');
						box.insertAfter(sender);

						$(sender).data('expand', true);
					}
					nodeWrap.appendTo(box);
					$.bTree._onChange();
					break;

				default:
					if (sender !== undefined) {
						var box = $(sender).next();
						if (box !== undefined && !box.hasClass('children')) {
							box = $('<div class="children"></div>');
							box.insertAfter(sender);
							$(sender).data('expand', true);
						}
						nodeWrap.appendTo(box);
					}
					else {
						nodeWrap.appendTo(tree);
					}
					break;
			}

			nodeWrap.data('path', path);
			return nodeWrap;
		},
		moveNode: function (sourceNode, targetNode) {
			var target = $.bTree.getNodes($(targetNode));
			var source = $.bTree.getNodes($(sourceNode));

			source.appendTo(target.children);
			if (source.hasChild)
				$(source.children).appendTo(target.children);

			$.bTree.refreshNode(target);
			$.bTree._onChange();

			return target;
		},
		removeNode: function (node) {
			var n = $.bTree.getNodes(node);
			n.remove();
			n.children.remove();

			if (n.parentNode !== undefined) {
				$.bTree.refreshNode(n.parentNode);
			}

			$.bTree._onChange();
		},
		focusNode: function (node, includeChild) {
			var n = $.bTree.getNodes(node);
			n.addClass('selected');
			if (n.hasChild && includeChild !== undefined && includeChild) {
				$(n.children).addClass('selected');
			}
		},
		blurNode: function () {
			if (arguments[0] !== undefined) {
				var n = $.bTree.getNodes(arguments[0]);
				n.removeClass('selected');
				if (n.hasChild) {
					$(n.children).removeClass('selected');
				}
			}
			else {
				// Blur all nodes
				$.bTree.self.find('.selected').removeClass('selected');
			}
		},
		_onChange: function () {
			if ($.bTree.options.change !== undefined)
				$.bTree.options.change();
		},
		_createButtons: function (node) {
			var buttons = $.bTree.options.buttons;
			var btnSplit = $.bTree.options.buttonSplit;
			if ($.isEmptyObject(buttons) || ($.isArray(buttons) && !buttons.length)) {
				return;
			}

			var optWrap = node.find('.opt');
			var optIndex = 0;
			$.each(buttons, function (name, props) {
				var click;
				var text = name.replace(/[^a-zA-Z]/g, '');
				props = $.isFunction(props) ?
						{ click: props, text: text } : props;

				if (optIndex != 0)
					optWrap.append(btnSplit);

				optWrap.append($('<span class="' + props.text + ' btn">' + name + '</span>'));
				$(node).on(props.text, function (event, obj) {
					props.click(obj);
				});

				optWrap.on('click', '.' + props.text, function () {
					$(node).trigger(props.text, node);
					$.bTree.refreshNode(node);
				});

				optIndex++;
			});

			return optWrap;
		},
		_render: function (treeWrap, options, json, parentNode) {
			$.bTree.options = options;
			$.bTree.self = $(treeWrap);
			for (var i = 0; i < json.length; i++) {
				var id = json[i].id;
				var text = json[i].title;
				var children = json[i].children;
				var p = $.bTree.newNode(text, id, parentNode);
				if (children !== undefined && children.length > 0) {
					$.bTree._render(treeWrap, options, children, p);
				}
			}
			$.bTree.self.find('.node').each(function () {
				$.bTree.refreshNode($(this));
			});
		}
	};
})(jQuery);
