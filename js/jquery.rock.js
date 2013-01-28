/*global jQuery:false */
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
            searchTimeout:700,
            handleClass:'',
            buttonMarkup:'',
            replace:false,
            buttonClassCheckbox:'rockcheck',
            checkedClass:'checked',
            buttonClassRadio:'rockradio',
            checked:'✓',
            unchecked:'✗',
            iconElement:'',
            replaceCheckedWithValue:false,
            replaceUncheckedWithValue:false,
            replaceChars:{
                '(':'<span>',
                ')':'</span>'
            },
            onChange:function () {

            }
        },
            changeHandleTextAndAria = function ($element, text) {

                $element.html(text);
                /*if (settings.buttonMarkup !== '') {
                 // find the deepest element
                 $element.find('*:not(:has("*"))').html(html);
                 } else {
                 $element.text(text);
                 }*/
            },
            userAgent,

            // big stack for all rockjs <ul>
            rocks = [],
            buttons = {},
            enter = '',
            timeout,
            unsetButton = function ($button) {


                $button.removeClass(settings.checkedClass);
                changeHandleTextAndAria($button, $button.unchecked);
            },
            unsetAllButtons = function (name) {
                if (typeof name !== "undefined") {
                    $.each(buttons[name], function () {
                        unsetButton(this[0]);
                        this[1].prop('checked', false);
                    });
                }
            },
            // Array zum durchsuchen per Anfangsbuchstabe
            pushToArrays = function (rock, index, element) {
                var firstCharacter,
                    sameCharacter,
                    $el = $(element);


                if ($el.attr('accesskey')) {

                    firstCharacter = $el.attr('accesskey');
                }
                else {
                    firstCharacter = $el.text().substr(0, 1);
                }
                if (!rock.buttons.sameCharacter[firstCharacter]) {
                    rock.buttons.sameCharacter[firstCharacter] = [];
                }
                sameCharacter = [index, element];

                rock.buttons.sameCharacter[firstCharacter].push(sameCharacter);
            },


            setButton = function ($button) {
                // button anmachen
                $button.addClass(settings.checkedClass);
                // beschriftung

                changeHandleTextAndAria($button, $button.checked);
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
                var button = {};
                button.className = '';
                button.type = ' type="button" ';
                button.disabled = '';
                button.text = '';
                button.accessskey = '';

                if ($element.attr('accesskey') !== undefined) {
                    button.accessskey = ' accesskey="' + $element.attr('accesskey') + '" ';
                }

                button.text += settings.iconElement + $element.text();

                if (settings.replace) {
                    button.text = parseText(button.text);
                }
                if ($element.is(':disabled')) {
                    button.className = ' class="disabled" ';
                    button.disabled = ' disabled="disabled" ';

                }
                return '<li role="option" data-value="' +
                    $element.val() + '" class="' + settings.optionClass + '">' +
                    '<button ' + button.className + button.accessskey + button.type + '>' +
                    button.text + '</button></li>';
            },
            removeActive = function ($el) {
                $el.find('.' + settings.activeClass).removeClass(settings.activeClass);
            },
            // close a single <ul>
            close = function (rock) {
                rock.$element.removeClass(settings.openClass);
                rock.open = false;
                //rock.$handle.focus();
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
            },
            search = function (rock, character) {
                var firstCharacter,
                    found = false;


                enter = enter + character;
                firstCharacter = enter.substr(0, 1);
                if (enter.length === 1) {
                    rock.buttons.lastCharacter = firstCharacter;
                }
                if (rock.buttons.sameCharacter[firstCharacter]) {
                    // mehrere Buchstaben

                    $.each(rock.buttons.sameCharacter[firstCharacter], function (index, element) {

                        if ($(element[1]).text().toLowerCase().indexOf(enter.toLowerCase()) === 0) {
                            rock.buttons.sameCharacter.pos = 0;
                            rock.buttons.current = element[1];
                            rock.buttons.pos = element[0];
                            rock.$element.trigger('update');
                            rock.$element.trigger('set');
                            found = true;


                            return false;
                        }
                        window.clearTimeout(timeout);
                        timeout = window.setTimeout(

                            function () {
                                //console.log('reset enter');
                                enter = '';
                            }, settings.searchTimeout);
                        //kein Treffer via Volltext!
                        //rock.buttons.lastCharacter = character;
                    });
                    if (found) {
                        return;
                    }

                    // "walk"
                    if (rock.buttons.lastCharacter === character) {
                        //console.log('walk');
                        // wenn letztes Element erreicht ist
                        rock.buttons.sameCharacter.pos = rock.buttons.sameCharacter.pos + 1;

                        if (rock.buttons.sameCharacter.pos > rock.buttons.sameCharacter[firstCharacter].length - 1) {
                            // von vorne beginnen
                            rock.buttons.sameCharacter.pos = 0;
                        }

                        // weiter

                        // aktuelles element setzen
                        rock.buttons.current = rock.buttons.sameCharacter[character][rock.buttons.sameCharacter.pos][1];
                        rock.$element.trigger('update');
                        rock.$element.trigger('set');

                        // pos setzen
                        rock.buttons.pos = rock.buttons.sameCharacter[character][rock.buttons.sameCharacter.pos][0];

                        rock.buttons.lastCharacter = character;
                    } else {

                        enter = '';
                        search(rock, character);
                    }
                }
                else {

                    enter = '';
                }
            };
        if (options) {
            $.extend(settings, options);
        }


        // the magic starts here
        return this.each(function () {

            var
                rock,
                html,
                $ul,
                $button,
                id,
                name,
                classname,

                $this = $(this);

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

            if ($this.data('rocked')) {
                //console.log('already rocked');
                return jQuery;
            } else {
                // save it to prevend to rock it twice
                $this.data('rocked', true);
            }
            if ($this.is('input[type=checkbox]') || $this.is('input[type=radio]')) {


                id = $this.attr('id');
                name = $this.attr('name');
                classname = settings.buttonClassCheckbox;


                if ($this.is('[type="radio"]')) {
                    classname = settings.buttonClassRadio;
                } else {
                    classname = settings.buttonClassCheckbox;
                }

                if ($this.prop('disabled')) {
                    classname += ' disabled';
                }

                $button = $('<button/>', {
                    'class':classname,
                    'type':'button'
                });


                $button.checked = settings.checked;
                if (settings.replaceCheckedWithValue) {

                    $button.checked = $this.val();
                }
                $button.unchecked = settings.unchecked;
                if (settings.replaceUncheckedWithValue) {

                    $button.unchecked = $this.val();

                }
                $button.text($button.unchecked).wrapInner($(settings.buttonMarkup));

                $button.addClass($this.attr('class'));
                if (typeof name !== "undefined") {
                    if (!buttons.hasOwnProperty(name)) {
                        buttons[name] = [];
                    }
                    // couple
                    buttons[name].push([$button, $this]);
                }
                // radio/checkobx ausblenden
                $this.hide();
                $this.bind('jclick click',
                    function (e) {
                        //console.log('type: '+e.type);
                        e.stopPropagation();
                        e.preventDefault();
                        var disabled = $this.prop('disabled');


                        if (typeof disabled !== 'undefined' && disabled !== false) {
                            //console.log('disabled');
                            return;
                        }

                        if ($this.is('input[type="radio"]')) {
                            //console.log('radio');
                            if ($this.prop('checked')) {
                                return;
                            }
                            else {
                                //console.log('radio uncheck');
                                unsetAllButtons(name);
                                $this.prop('checked', true);
                                $this.trigger('change');
                                $button.trigger('rock_check');
                            }
                            return;
                        }

                        if ($this.is('input[type="checkbox"]')) {
                            //console.log('checkbox');
                            if ($this.prop('checked')) {
                                //console.log('checkbox ist checked');
                                $this.prop('checked', false);
                                $this.trigger('change');
                                $button.trigger('rock_uncheck');
                            }
                            else {
                                //console.log('checkbox ist nicht uncheck');
                                $this.prop('checked', true);
                                $this.trigger('change');
                                $button.trigger('rock_check');
                            }



                        }

                    }).bind('change',
                    function (e) {
                        //console.log('change');
                        e.stopPropagation();
                        e.preventDefault();
                    }).bind('focusin', function () {
                        $button.trigger('focus');
                    });
                // just for ie6 to ie8
                $('label[for="' + id + '"]').on('click', function (e) {
                    if ($(e.target).is('a')) {
                        return;
                    }
                           //console.log('click on label');
                    e.preventDefault();
                    $this.trigger('jclick');
                });
                $button.bind('click.rock',
                    function (e) {
                        //console.log('click.rock');
                        e.preventDefault();
                        e.stopPropagation();
                        $this.trigger('jclick');
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
                        // inital nicht feuern°!
                        //settings.onChange.call($this);
                    });
                $this.after($button);
                // initial
                if ($this.is(':checked')) {
                    $button.trigger('rock_init');
                }
                return jQuery;
            } else if ($this.is('select')) {

                $this.hide();
                rock = {
                    buttons:{
                        all_buttons:[],
                        sameCharacter:{}
                    },
                    $handle:null
                };
                enter = '';
                // array for html result
                html = [];
                $ul = $('<ul/>', {
                    'class':'rockdown'
                }).addClass($this.attr('class')).attr({
                        'for':$this.attr('name')
                    });


                if ($this.attr('multiple') === 'multiple') {
                    return jQuery;
                } else {
                    rock.handleText = $this.find('option:selected').text();
                }

                // build html
                html.push('<li><button  type="button" class="handle ' + settings.handleClass + '" aria-valuetext="' + rock.handleText + '">' + rock.handleText + '</button>');
                html.push('<ul class="' + settings.optionsClass + '">');


                // find all <option> and <optgroup>
                $this.children().each(function (index, element) {
                    // <option> or <optgroup>
                    var li, $el = $(element);
                    // hey, it's an <optgroup>
                    if ($el.is('optgroup')) {

                        html.push('<li class="' + settings.optClass + '"><span>' + $el.attr('label') + '</span>');
                        html.push('<ul>');
                        // loop the nested <option> elements
                        $el.children('option').each(function (index, element) {
                            var $nestedOption = $(this);

                            li = buildLi($nestedOption);
                            html.push(li);

                        });
                        html.push('</ul>');
                        html.push('</li>');
                    } else {
                        // it's an <option>

                        li = buildLi($el);

                        html.push(li);


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
                    .bind('update',
                    function () {

                        var $target = $(rock.buttons.current);

                        changeHandleTextAndAria(rock.$handle, $target.text());
                        rock.$element.find('.hover').removeClass('hover');
                        $target.addClass('hover');
                    })

                    .bind('set',
                    function () {
                        var val, $target = $(rock.buttons.current);

                        removeActive(rock.$element);
                        rock.$element.find('.hover').removeClass('hover');
                        $target.addClass('hover');
                        $target.addClass(settings.activeClass);
                        changeHandleTextAndAria(rock.$handle, $target.text());
                        $this.val($target.parent().attr('data-value'));

                        // fire callback
                        $this.trigger('change');
                        settings.onChange.call($this);
                    }).on('mousedown.rock', 'li.option button:not(.disabled)',
                    function (e) {

                        rock.buttons.lastCharacter = '';
                        rock.buttons.current = e.target;
                        // position ermitteln
                        rock.buttons.pos = $.inArray(e.target, rock.buttons.all_buttons);
                        e.preventDefault();
                        e.stopPropagation();


                        close(rock);
                        rock.$element.trigger('update');
                        rock.$element.trigger('set');
                    }).delegate('li.option button:not(.disabled)', 'mouseup.rock',
                    function (e) {
                        e.preventDefault();


                        $(this).trigger('mousedown');
                    }).bind('keydown.rock',
                    function (e) {
                        var character;


                        // enter oder space bar
                        if (e.which === 13 || e.which === 32) {
                            if (rock.open) {
                                $(e.target).trigger('mousedown');
                            }
                        }
                        if (e.which === 40 || e.which === 38) {
                            e.preventDefault();
                            rock.buttons.lastCharacter = '';
                            // arrow down ⇩
                            if (e.which === 40) {
                                // just be sure, there is a next button
                                if (rock.buttons.pos + 1 < rock.buttons.all_buttons.length) {

                                    rock.buttons.pos = rock.buttons.pos + 1;
                                    rock.buttons.current = rock.buttons.all_buttons[rock.buttons.pos];
                                    rock.$element.trigger('update');
                                    rock.$element.trigger('set');
                                }
                                return;
                            }
                            if (e.which === 38) {
                                // arrow up ↑
                                // if we are on the first element, just do nothing
                                if (rock.buttons.pos > 0) {
                                    rock.buttons.pos = rock.buttons.pos - 1;
                                    rock.buttons.current = rock.buttons.all_buttons[rock.buttons.pos];
                                    rock.$element.trigger('update');
                                    rock.$element.trigger('set');
                                }
                            }
                        }
                        // textsuche
                        else {
                            character = String.fromCharCode(e.which);
                            search(rock, character);
                        }
                    }).delegate('.' + settings.optionClass + ' button:not(.disabled)', 'mouseover', function (e) {
                        rock.buttons.current = e.target;
                        rock.buttons.pos = $.inArray(rock.buttons.current, rock.buttons.all_buttons);

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
                    }).delegate('button.handle', 'mouseup.rock', function (e) {
                        $(this).trigger('click');
                        e.preventDefault();
                    });


                html = html.join("");


                // inject a lot of html to the <ul class="rockdown">
                $ul.append(html);


                $ul.find('.options button:not(.disabled)').each(function (index, element) {
                    // was passiert hier?
                    pushToArrays(rock, index, element);
                    // und wofür ist dieses Array?
                    rock.buttons.all_buttons.push(element);
                });

                rock.$handle = $ul.find('button.handle');
                // add custom markup
                rock.$handle.wrapInner($(settings.buttonMarkup));


                // inject the <ul class="rockdown"> in the dom, after the hidden <select>

                rock.buttons.sameCharacter.pos = 0;
                rock.buttons.current = rock.buttons.all_buttons[0];
                rock.buttons.pos = 0;
                rock.buttons.lastCharachter = '';
                $this.before($ul);
                // nice to have: do it bidirectional

                // fuer jquery validate
                $this.on('focusin', function () {
                    rock.$handle.trigger('focus');
                });

                $this.on('change', function () {
                    var $this = $(this),
                        value = $this.val(),
                        text = $this.find('option[value="' + value + '"]').first().html();
                    changeHandleTextAndAria(rock.$handle, text);
                    $ul.find('.' + settings.activeClass).removeClass(settings.activeClass).find('ul li[data-value="' + value + '"] button').addClass(settings.activeClass);
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