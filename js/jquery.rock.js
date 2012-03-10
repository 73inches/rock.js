// jquery plugin
(function ($) {
    "use strict";
    $.fn.rocks = function (options) {

        var settings = {
            optionClass:'option',
            optionsClass:'options',
            activeClass:'active',
            optClass:'opt',
            openClass:'open',
            mobileClass:'rjsmo',
            mobileClassWP7:'rjswp7',
            searchTimeout:1000,
            handleClass:'',
            buttonMarkup:'',
            replace:false,
            buttonClassCheckbox:'rockcheck',
            checkedClass:'checked',
            buttonClassRadio:'rockradio',
            checked:'✓',
            unchecked:'✗',
            replaceChars:{
                '(':'<span>',
                ')':'</span>'
            },
            onChange:function () {
            }
        },
            userAgent, timeout = [],
            // big stack for all rockjs <ul>
            rocks = [],
            buttons = {},
            // private methods

            setButton = function ($button, name) {
                if(typeof name !== "undefined"){
                   $.each(buttons[name],function(){
                                this.removeClass(settings.checkedClass);
                                changeHandleTextAndAria(this,settings.unchecked);

                   });
                }

                $button.addClass(settings.checkedClass);
                changeHandleTextAndAria($button,settings.checked);

            },

            changeHandleTextAndAria = function ($element, html) {
                var text = $(html).text();
                $element.attr('aria-valuetext', text);
                if (settings.buttonMarkup !== '') {
                    // find the deepest element
                    $element.find('*:not(:has("*"))').html(html);
                } else {
                    $element.html(html);
                }
            },
            parseText = function (text) {
                $.each(settings.replaceChars, function (index, value) {
                    var chars = text.split('');
                    $.each(chars, function () {
                        text = text.replace(index, value);
                    });
                });
                return text;
            },
            buildLi = function ($element) {
                var text = $element.text();
                if (settings.replace) {
                    text = parseText(text);
                }
                return '<li role="option" data-value="' + $element.attr('value') + '" class="' + settings.optionClass + '"><button type="button">' + text + '</button></li>';
            },
            removeActive = function ($el) {
                $el.find('.' + settings.activeClass).removeClass(settings.activeClass);
            },
            // close a single <ul>
            close = function (rock) {
                rock.$element.removeClass(settings.openClass);
                rock.open = false;
                $(window.document).unbind('click.rock').unbind('keyup.rock');
            },
            // close all and open the clicked one
            open = function (rock) {
                // close them all and remove the events
                $(window.document).unbind('click.rock').unbind('keyup.rock');
                $.each(rocks, function () {
                    this.$element.removeClass(settings.openClass);
                    this.open = false;
                });
                // open it
                rock.$element.addClass(settings.openClass).find(settings.activeClass).focus();
                rock.open = true;
                $(window.document).bind({
                    // close on a click outside
                    'click.rock':function (e) {
                        // check, if we are inside, needed for windows firefox
                        if (!$.contains(rock.$element[0], e.target)) {
                            close(rock);
                        }
                    },
                    // close on pressing ESC
                    'keyup.rock':function (e) {
                        if (e.which === 27) {
                            close(rock);
                        }
                    }
                });
            };
        if (options) {
            $.extend(settings, options);
        }

        // the magic starts here
        return this.each(function () {

            // if iphone, android or windows phone 7, don't replace select
            userAgent = window.navigator.userAgent.toLowerCase();
            if (userAgent.match(/(iphone|android|xblwp7|IEMobile)/)) {
                $('body').addClass(settings.mobileClass);
                if (userAgent.match(/(xblwp7|IEMobile)/)) {
                    $('body').addClass(settings.mobileClassWP7);
                }
                // exit
                return false;
            }
            var $this = $(this);


            if ($this.is('input[type=checkbox]') || $this.is('input[type=radio]')) {

                var $button,
                    id,
                    name,
                    classname;

                id = $this.attr('id');
                name = $this.attr('name');
                classname = settings.buttonClassCheckbox;

                if ($this.is('[type="radio"]')) {
                    classname = settings.buttonClassRadio;
                } else {
                    classname = settings.buttonClassCheckbox;
                }


                $button = $('<button/>', {
                    'class':classname
                }).text(settings.unchecked).wrapInner($(settings.buttonMarkup));



                if (typeof name !== "undefined") {
                    if (!buttons.hasOwnProperty(name)) {
                        buttons[name] = [];
                    }
                    buttons[name].push($button);
                }

                if ($this.is(':checked')) {
                                    setButton($button, name);
                                }


                $this.hide();
                $this.bind('change', function (e) {

                    e.preventDefault();
                    e.stopImmediatePropagation();

                    $button.trigger('rock_change_state');
                });

                $this.bind('click',function(e){
                    e.preventDefault();
                    e.stopPropagation();
                });

                // just for ie6 to ie8
                $('label[for="' + id + '"]').bind('click', function (e) {
                    e.preventDefault();

                    $button.trigger('rock_change_state')

                });

                $button.bind('click.rock',
                    function (e) {

                        e.preventDefault();
                        e.stopImmediatePropagation();



                        $this.trigger('change');
                    }).bind('rock_change_state', function () {

                        $this.attr('checked',true);
                        setButton($button, name);
                        settings.onChange.call($this);


                    });
                $this.after($button);
                return (jQuery);
            }
            if ($.data(this, 'rock')) {
                //console.log('all ready rocked');
                return false;
            } else if ($this.is('select')) {
                $this.hide();
                var rock = {
                    buttons:[],
                    $handle:null
                },
                    enter = '',
                    // array for html result
                    html = [],
                    $ul = $('<ul/>', {
                        'class':'rockdown'
                    }).addClass($this.attr('class')).attr({
                            'for':$this.attr('name')
                        });
                // save the text for more performance
                rock.handleText = $this.find('option:selected').html();
                // build html
                html.push('<li><button  type="button" class="handle ' + settings.handleClass + '" aria-valuetext="' + rock.handleText + '">' + rock.handleText + '</button>');
                html.push('<ul class="' + settings.optionsClass + '">');
                // find all <option> and <optgroup>
                $this.children().each(function () {
                    // <option> or <optgroup>
                    var $this = $(this);
                    // hey, it's an <optgroup>
                    if ($this.is('optgroup')) {
                        html.push('<li class="' + settings.optClass + '"><span>' + $this.attr('label') + '</span>');
                        html.push('<ul>');
                        // loop the nested <option> elements
                        $this.children('option').each(function () {
                            var $nestedOption = $(this);
                            html.push(buildLi($nestedOption));
                        });
                        html.push('</ul>');
                        html.push('</li>');
                    } else {
                        // it's an <option>
                        html.push(buildLi($this));
                    }
                });
                html.push('</ul>');
                html.push('</li>');
                // simulate the click on the linked label
                $('label[for=' + $this.attr('id') + ']').bind('click.rock', function (e) {
                    e.preventDefault();
                    $ul.find('button.handle').focus();
                });
                // a lot of event delegation for the ul
                rock.$element = $ul
                    // click on a button
                    .delegate('li.option button', 'mousedown.rock',
                    function (e) {
                        var $target = $(this);
                        // remove the active class from old element
                        removeActive(rock.$element);
                        $target.addClass(settings.activeClass);
                        // set value, set <select> value
                        $this.val($target.parent().attr('data-value'));
                        changeHandleTextAndAria(rock.$handle, $target.html());
                        // close it
                        close(rock);
                        // fire callback
                        settings.onChange.call($this);
                    }).delegate('li.option button', 'mouseup.rock', function () {
                        $(this).trigger('mousedown');
                    })
                    // search, navigate on key event on a button or the handler
                    .delegate('li.option button,button.handle', 'keydown.rock',
                    function (e) {
                        if (e.which === 32 || e.which === 13) {
                            $(this).trigger('mousedown.rock');
                        }
                        if (e.which === 40 || e.which === 38) {
                            enter = '';
                            e.preventDefault();
                            e.stopPropagation();
                            // find the clicked button in the array, not in the DOM
                            rock.buttons.each(function (index, value) {
                                // button found
                                if (e.target === value) {
                                    // arrow down ⇩
                                    if (e.which === 40) {
                                        // just be sure, there is a next button
                                        if (index + 1 < rock.buttons.length) {
                                            // go to next element and focus it, for ie6 we should add a hover class
                                            rock.buttons.get(index + 1).focus();
                                        }
                                    }
                                    if (e.which === 38) {
                                        // arrow up ↑
                                        // if we are on the first element, just do nothing
                                        if (index > 0) {
                                            rock.buttons.get(index - 1).focus();
                                        }
                                    }
                                }
                            });
                        } else {
                            //clear all timeouts
                            $.each(timeout, function () {
                                window.clearTimeout(this);
                            });
                            var id = window.setTimeout(function () {
                                enter = '';
                            }, settings.searchTimeout);
                            timeout.push(id);
                            enter = enter + String.fromCharCode(e.which);
                            rock.buttons.each(function () {
                                var $this = $(this);
                                rock.$last = $this;
                                if ($this.text().toLowerCase().indexOf(enter.toLowerCase()) === 0) {
                                    if (!rock.open) {
                                        $this.trigger('mousedown.rock');
                                    } else {
                                        $this.hover().focus();
                                    }
                                    return false;
                                }
                                // else nothing found
                            });
                        }
                    }).delegate('ul li.' + settings.optionClass, 'mouseover', function () {
                        $(this).find('button').focus();
                    })
                    // events on the handle
                    .delegate('button.handle', 'mousedown.rock',
                    function (e) {
                        e.preventDefault();
                        $ul.find('button.handle').focus();
                        // please close it
                        if (rock.open) {
                            close(rock);
                        } else {
                            // please open it
                            open(rock);
                        }
                    }).delegate('button.handle', 'mouseup.rock',
                    function (e) {
                        $(this).trigger('click');
                        e.preventDefault();
                    }).delegate('button.handle', 'keyup.rock', function (e) {
                        // arrow down
                        if (e.which === 40 || e.which === 32) {
                            // open it
                            if (!rock.open) {
                                open(rock);
                            } else {
                                // if it's open, go to first element
                                rock.$element.find('li.option:first button').focus();
                            }
                        }
                    });
                // inject a lot of html to the <ul class="rockdown">
                $ul.append(html.join(""));
                rock.$handle = $ul.find('button.handle');
                // add custom markup
                rock.$handle.wrapInner($(settings.buttonMarkup));
                // save all buttons in array
                rock.buttons = $ul.find('li.' + settings.optionClass + ' button');
                // inject the <ul class="rockdown"> in the dom, after the hidden <select>
                $this.after($ul);
                // nice to have: do it bidirectional
                $this.bind('change', function () {
                    var $this = $(this);
                    var value = $this.val();
                    var text = $this.find('option[value=' + value + ']').first().html();
                    changeHandleTextAndAria(rock.$handle, text);
                    $ul.find('.' + settings.activeClass).removeClass(settings.activeClass).find('ul li[data-value=' + value + '] button').addClass(settings.activeClass);
                });
                // push all replaced <select> to stack
                rocks.push(rock);
                // save it to prevend to rock it twice
                $.data(this, 'rock', rock);
            }
            // it's not rockable :-(
            else {
                return jQuery;
            }
        });
    };
}(jQuery));