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
            iconElement:'',
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


            unsetButton = function ($button) {

                $button.removeClass(settings.checkedClass);
                changeHandleTextAndAria($button, settings.unchecked);
            },


            unsetAllButtons = function (name) {

                if (typeof name !== "undefined") {


                    $.each(buttons[name], function () {
                        unsetButton(this[0]);
                        this[1].attr('checked', false);

                    });


                }
            },

            setButton = function ($button) {

                // button anmachen
                $button.addClass(settings.checkedClass);
                // beschriftung

                changeHandleTextAndAria($button, settings.checked);

            },


            changeHandleTextAndAria = function ($element, text) {


                $element.text(text);

                /*if (settings.buttonMarkup !== '') {
                 // find the deepest element
                 $element.find('*:not(:has("*"))').html(html);
                 } else {
                 $element.text(text);
                 }*/
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
            fire = function (rock, $button) {
                if (!rock.open) {
                    $button.trigger('mousedown.rock');
                }

                else {
                    $button.hover().focus();

                }
            },
            buildLi = function ($element) {
                var text = '';
                text += settings.iconElement + $element.text();

                if (settings.replace) {
                    text = parseText(text);
                }
                return '<li role="option" data-value="'
                    + $element.attr('value') + '" class="'
                    + settings.optionClass + '">'
                    + '<button type="button">'

                    + text
                    + '</button></li>';
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

            if ($this.data('rocked')) {
                //console.log($this);
                //console.log('already rocked');
                return jQuery;
            }
            else {
                // save it to prevend to rock it twice
                $this.data('rocked', true);
            }

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
                    'class':classname,
                    'type':'button'
                }).text(settings.unchecked).wrapInner($(settings.buttonMarkup));

                $button.addClass($this.attr('class'));

                if (typeof name !== "undefined") {
                    if (!buttons.hasOwnProperty(name)) {
                        buttons[name] = [];
                    }
                    // couple
                    buttons[name].push([$button, $this]);
                }


                $this.hide();


                $this.bind('click',
                    function (e) {
                        e.stopPropagation();
                        e.preventDefault();
                        if ($this.is('input[type="radio"]:checked')) {
                        }

                        else if ($this.is('input[type="radio"]')) {
                            unsetAllButtons(name);
                            $this.attr('checked', true);
                            $this.trigger('change');
                            $button.trigger('rock_check');
                        }

                        else if ($this.is('input[type="checkbox"]:checked')) {
                            $this.attr('checked', false);
                            $this.trigger('change');
                            $button.trigger('rock_uncheck');
                        }

                        else if ($this.is('input[type="checkbox"]')) {
                            $this.attr('checked', true);
                            $this.trigger('change');
                            $button.trigger('rock_check');
                        }


                    }).bind('change', function (e) {
                        e.stopPropagation();
                    });


                // just for ie6 to ie8
                $('label[for="' + id + '"]').bind('click', function (e) {
                    e.preventDefault();
                    $this.trigger('click');

                });

                $button.bind('click.rock',
                    function (e) {

                        e.preventDefault();
                        e.stopPropagation();


                        $this.trigger('click');

                    }).bind('rock_check',

                    function () {
                        setButton($button);
                        settings.onChange.call($this);

                    }).bind('rock_uncheck',
                    function () {
                        unsetButton($button);

                        settings.onChange.call($this);
                    }).bind('rock_init', function () {
                        setButton($button);
                        settings.onChange.call($this);

                    });
                $this.after($button);

                // initial
                if ($this.is(':checked')) {
                    $button.trigger('rock_init');
                }

                return jQuery;
            }

            else if ($this.is('select')) {
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

                if ($this.attr('multiple') === 'multiple') {
                    return jQuery;


                }
                else {
                    rock.handleText = $this.find('option:selected').text();
                }


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
                        var $target, val;
                        $target = $(this);


                        e.preventDefault();
                        e.stopPropagation();


                        changeHandleTextAndAria(rock.$handle, $target.text());
                        $target.addClass(settings.activeClass);
                        removeActive(rock.$element);
                        $this.val($target.parent().attr('data-value'));
                        close(rock);
                        // fire callback
                        settings.onChange.call($this);
                    }).delegate('li.option button', 'mouseup.rock', function () {
                        //$(this).trigger('mousedown');
                    })
                    // search, navigate on key event on a button or the handler
                    .delegate('li.option button,button.handle', 'keydown.rock',
                    function (e) {
                        var $button, firstCharacter;
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
                            firstCharacter = enter.substr(0, 1);


                            if (rock.buttons.firstCharacter !== firstCharacter) {

                                rock.buttons.current = 0;
                            }

                            if ($.isArray(rock.buttons[firstCharacter])) {
                                rock.buttons.firstCharacter = firstCharacter;
                                if (enter.length === 1) {

                                    if (rock.buttons.current === rock.buttons[firstCharacter].length - 1) {
                                        rock.buttons.current = 0;
                                    }
                                    $button = rock.buttons[enter][rock.buttons.current];
                                    rock.buttons.current++;


                                }
                                else {

                                    $.each(rock.buttons[firstCharacter], function (index, element) {
                                        var $element = $(element);


                                        if ($element.text().toLowerCase().indexOf(enter.toLowerCase()) === 0) {
                                            $button = $element;
                                            return false;


                                        }


                                    });
                                }
                                if ($button) {
                                    fire(rock, $button);
                                }


                            }


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

                // inject the <ul class="rockdown"> in the dom, after the hidden <select>

                $ul.find('li.' + settings.optionClass + ' button').each(function () {
                    var firstCharacter = $(this).text().substr(0, 1);
                    if (!$.isArray(rock.buttons[firstCharacter])) {
                        rock.buttons[firstCharacter] = [];
                    }

                    rock.buttons[firstCharacter].push($(this));
                });
                rock.buttons['current'] = 0;
                rock.buttons['firstCharachter'] = '';


                $this.after($ul);
                // nice to have: do it bidirectional
                $this.bind('change', function () {
                    var $this = $(this),
                        value = $this.val(),
                        text = $this.find('option[value=' + value + ']').first().html();
                    changeHandleTextAndAria(rock.$handle, text);
                    $ul.find('.' + settings.activeClass).removeClass(settings.activeClass).find('ul li[data-value=' + value + '] button').addClass(settings.activeClass);
                });
                // push all replaced <select> to stack
                rocks.push(rock);

            }
            // it's not rockable :-(
            else {
                return jQuery;
            }
        });
    };
}(jQuery));