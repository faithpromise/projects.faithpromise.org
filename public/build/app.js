if (typeof module !== "undefined" && typeof exports !== "undefined" && module.exports === exports) {
    module.exports = "monospaced.elastic";
}

angular.module("monospaced.elastic", []).constant("msdElasticConfig", {
    append: ""
}).directive("msdElastic", [ "$timeout", "$window", "msdElasticConfig", function($timeout, $window, config) {
    "use strict";
    return {
        require: "ngModel",
        restrict: "A, C",
        link: function(scope, element, attrs, ngModel) {
            var ta = element[0], $ta = element;
            if (ta.nodeName !== "TEXTAREA" || !$window.getComputedStyle) {
                return;
            }
            $ta.css({
                overflow: "hidden",
                "overflow-y": "hidden",
                "word-wrap": "break-word"
            });
            var text = ta.value;
            ta.value = "";
            ta.value = text;
            var append = attrs.msdElastic ? attrs.msdElastic.replace(/\\n/g, "\n") : config.append, $win = angular.element($window), mirrorInitStyle = "position: absolute; top: -999px; right: auto; bottom: auto;" + "left: 0; overflow: hidden; -webkit-box-sizing: content-box;" + "-moz-box-sizing: content-box; box-sizing: content-box;" + "min-height: 0 !important; height: 0 !important; padding: 0;" + "word-wrap: break-word; border: 0;", $mirror = angular.element('<textarea aria-hidden="true" tabindex="-1" ' + 'style="' + mirrorInitStyle + '"/>').data("elastic", true), mirror = $mirror[0], taStyle = getComputedStyle(ta), resize = taStyle.getPropertyValue("resize"), borderBox = taStyle.getPropertyValue("box-sizing") === "border-box" || taStyle.getPropertyValue("-moz-box-sizing") === "border-box" || taStyle.getPropertyValue("-webkit-box-sizing") === "border-box", boxOuter = !borderBox ? {
                width: 0,
                height: 0
            } : {
                width: parseInt(taStyle.getPropertyValue("border-right-width"), 10) + parseInt(taStyle.getPropertyValue("padding-right"), 10) + parseInt(taStyle.getPropertyValue("padding-left"), 10) + parseInt(taStyle.getPropertyValue("border-left-width"), 10),
                height: parseInt(taStyle.getPropertyValue("border-top-width"), 10) + parseInt(taStyle.getPropertyValue("padding-top"), 10) + parseInt(taStyle.getPropertyValue("padding-bottom"), 10) + parseInt(taStyle.getPropertyValue("border-bottom-width"), 10)
            }, minHeightValue = parseInt(taStyle.getPropertyValue("min-height"), 10), heightValue = parseInt(taStyle.getPropertyValue("height"), 10), minHeight = Math.max(minHeightValue, heightValue) - boxOuter.height, maxHeight = parseInt(taStyle.getPropertyValue("max-height"), 10), mirrored, active, copyStyle = [ "font-family", "font-size", "font-weight", "font-style", "letter-spacing", "line-height", "text-transform", "word-spacing", "text-indent" ];
            if ($ta.data("elastic")) {
                return;
            }
            maxHeight = maxHeight && maxHeight > 0 ? maxHeight : 9e4;
            if (mirror.parentNode !== document.body) {
                angular.element(document.body).append(mirror);
            }
            $ta.css({
                resize: resize === "none" || resize === "vertical" ? "none" : "horizontal"
            }).data("elastic", true);
            function initMirror() {
                var mirrorStyle = mirrorInitStyle;
                mirrored = ta;
                taStyle = getComputedStyle(ta);
                angular.forEach(copyStyle, function(val) {
                    mirrorStyle += val + ":" + taStyle.getPropertyValue(val) + ";";
                });
                mirror.setAttribute("style", mirrorStyle);
            }
            function adjust() {
                var taHeight, taComputedStyleWidth, mirrorHeight, width, overflow;
                if (mirrored !== ta) {
                    initMirror();
                }
                if (!active) {
                    active = true;
                    mirror.value = ta.value + append;
                    mirror.style.overflowY = ta.style.overflowY;
                    taHeight = ta.style.height === "" ? "auto" : parseInt(ta.style.height, 10);
                    taComputedStyleWidth = getComputedStyle(ta).getPropertyValue("width");
                    if (taComputedStyleWidth.substr(taComputedStyleWidth.length - 2, 2) === "px") {
                        width = parseInt(taComputedStyleWidth, 10) - boxOuter.width;
                        mirror.style.width = width + "px";
                    }
                    mirrorHeight = mirror.scrollHeight;
                    if (mirrorHeight > maxHeight) {
                        mirrorHeight = maxHeight;
                        overflow = "scroll";
                    } else if (mirrorHeight < minHeight) {
                        mirrorHeight = minHeight;
                    }
                    mirrorHeight += boxOuter.height;
                    ta.style.overflowY = overflow || "hidden";
                    if (taHeight !== mirrorHeight) {
                        scope.$emit("elastic:resize", $ta, taHeight, mirrorHeight);
                        ta.style.height = mirrorHeight + "px";
                    }
                    $timeout(function() {
                        active = false;
                    }, 1, false);
                }
            }
            function forceAdjust() {
                active = false;
                adjust();
            }
            if ("onpropertychange" in ta && "oninput" in ta) {
                ta["oninput"] = ta.onkeyup = adjust;
            } else {
                ta["oninput"] = adjust;
            }
            $win.bind("resize", forceAdjust);
            scope.$watch(function() {
                return ngModel.$modelValue;
            }, function(newValue) {
                forceAdjust();
            });
            scope.$on("elastic:adjust", function() {
                initMirror();
                forceAdjust();
            });
            $timeout(adjust, 0, false);
            scope.$on("$destroy", function() {
                $mirror.remove();
                $win.unbind("resize", forceAdjust);
            });
        }
    };
} ]);

angular.module("MassAutoComplete", []).directive("massAutocomplete", [ "$timeout", "$window", "$document", "$q", function($timeout, $window, $document, $q) {
    "use strict";
    return {
        restrict: "A",
        scope: {
            options: "&massAutocomplete"
        },
        transclude: true,
        template: "<span ng-transclude></span>" + '<div class="ac-container" ng-show="show_autocomplete && results.length > 0" style="position:absolute;">' + '<ul class="ac-menu">' + '<li ng-repeat="result in results" ng-if="$index > 0" ' + "class=\"ac-menu-item\" ng-class=\"$index == selected_index ? 'ac-state-focus': ''\">" + '<a href ng-click="apply_selection($index)" ng-bind-html="result.label"></a>' + "</li>" + "</ul>" + "</div>",
        link: function(scope, element) {
            scope.container = angular.element(element[0].getElementsByClassName("ac-container")[0]);
        },
        controller: [ "$scope", function($scope) {
            var that = this;
            var KEYS = {
                TAB: 9,
                ESC: 27,
                ENTER: 13,
                UP: 38,
                DOWN: 40
            };
            var EVENTS = {
                KEYDOWN: "keydown",
                RESIZE: "resize",
                BLUR: "blur"
            };
            var _user_options = $scope.options() || {};
            var user_options = {
                debounce_position: _user_options.debounce_position || 150,
                debounce_attach: _user_options.debounce_attach || 300,
                debounce_suggest: _user_options.debounce_suggest || 200,
                debounce_blur: _user_options.debounce_blur || 150
            };
            var current_element, current_model, current_options, previous_value, value_watch, last_selected_value;
            $scope.show_autocomplete = false;
            function debounce(func, wait, immediate) {
                var timeout;
                return function() {
                    var context = this, args = arguments;
                    var later = function() {
                        timeout = null;
                        if (!immediate) func.apply(context, args);
                    };
                    var callNow = immediate && !timeout;
                    clearTimeout(timeout);
                    timeout = setTimeout(later, wait);
                    if (callNow) func.apply(context, args);
                };
            }
            function _position_autocomplete() {
                var rect = current_element[0].getBoundingClientRect(), scrollTop = $document[0].body.scrollTop || $document[0].documentElement.scrollTop || $window.pageYOffset, scrollLeft = $document[0].body.scrollLeft || $document[0].documentElement.scrollLeft || $window.pageXOffset, container = $scope.container[0];
                container.style.top = rect.top + rect.height + scrollTop + "px";
                container.style.left = rect.left + scrollLeft + "px";
                container.style.width = rect.width + "px";
            }
            var position_autocomplete = debounce(_position_autocomplete, user_options.debounce_position);
            function _attach(ngmodel, target_element, options) {
                if (current_element === target_element) return;
                if (current_element) that.detach();
                if (target_element[0] !== $document[0].activeElement) return;
                options.on_attach && options.on_attach();
                current_element = target_element;
                current_model = ngmodel;
                current_options = options;
                previous_value = ngmodel.$viewValue;
                $scope.results = [];
                $scope.selected_index = -1;
                bind_element();
                value_watch = $scope.$watch(function() {
                    return ngmodel.$modelValue;
                }, function(nv, ov) {
                    if (nv === last_selected_value) return;
                    _position_autocomplete();
                    suggest(nv, current_element);
                });
            }
            that.attach = debounce(_attach, user_options.debounce_attach);
            function _suggest(term, target_element) {
                $scope.selected_index = 0;
                $scope.waiting_for_suggestion = true;
                if (typeof term === "string" && term.length > 0) {
                    $q.when(current_options.suggest(term), function suggest_succeeded(suggestions) {
                        if (!current_element || current_element !== target_element) return;
                        if (suggestions && suggestions.length > 0) {
                            $scope.results = [ {
                                value: term,
                                label: ""
                            } ].concat(suggestions);
                            $scope.show_autocomplete = true;
                            if (current_options.auto_select_first) set_selection(1);
                        } else {
                            $scope.results = [];
                        }
                    }, function suggest_failed(error) {
                        $scope.show_autocomplete = false;
                        current_options.on_error && current_options.on_error(error);
                    }).finally(function suggest_finally() {
                        $scope.waiting_for_suggestion = false;
                    });
                } else {
                    $scope.waiting_for_suggestion = false;
                    $scope.show_autocomplete = false;
                    $scope.$apply();
                }
            }
            var suggest = debounce(_suggest, user_options.debounce_suggest);
            that.detach = function() {
                if (current_element) {
                    var value = current_element.val();
                    update_model_value(value);
                    current_options.on_detach && current_options.on_detach(value);
                    current_element.unbind(EVENTS.KEYDOWN);
                    current_element.unbind(EVENTS.BLUR);
                }
                $scope.show_autocomplete = false;
                angular.element($window).unbind(EVENTS.RESIZE);
                value_watch && value_watch();
                $scope.selected_index = $scope.results = undefined;
                current_model = current_element = previous_value = undefined;
            };
            function update_model_value(value) {
                if (current_model.$modelValue !== value) {
                    current_model.$setViewValue(value);
                    current_model.$render();
                }
            }
            function set_selection(i) {
                var selected = $scope.results[i];
                current_element.val(selected.value);
                $scope.selected_index = i;
                return selected;
            }
            $scope.apply_selection = function(i) {
                current_element[0].focus();
                if (!$scope.show_autocomplete || i > $scope.results.length || i < 0) return;
                var selected = set_selection(i);
                last_selected_value = selected.value;
                update_model_value(selected.value);
                $scope.show_autocomplete = false;
                current_options.on_select && current_options.on_select(selected);
            };
            function bind_element() {
                angular.element($window).bind(EVENTS.RESIZE, position_autocomplete);
                current_element.bind(EVENTS.BLUR, function() {
                    $timeout(function() {
                        if (!current_element || current_element[0] !== $document[0].activeElement) that.detach();
                    }, user_options.debounce_blur);
                });
                current_element.bind(EVENTS.KEYDOWN, function(e) {
                    if (e.shiftKey) return;
                    switch (e.keyCode) {
                      case KEYS.ESC:
                        if ($scope.show_autocomplete) {
                            $scope.show_autocomplete = false;
                            $scope.$apply();
                        } else {
                            current_element.val(previous_value);
                        }
                        break;

                      case KEYS.ENTER:
                        if ($scope.show_autocomplete && $scope.selected_index > 0 && !$scope.waiting_for_suggestion) {
                            $scope.apply_selection($scope.selected_index);
                            e.stopPropagation();
                            e.preventDefault();
                        }
                        $scope.show_autocomplete = false;
                        $scope.$apply();
                        break;

                      case KEYS.TAB:
                        if (!$scope.show_autocomplete) break;
                        e.preventDefault();

                      case KEYS.DOWN:
                        if ($scope.results.length > 0) {
                            if ($scope.show_autocomplete) {
                                set_selection($scope.selected_index + 1 > $scope.results.length - 1 ? 0 : $scope.selected_index + 1);
                            } else {
                                $scope.show_autocomplete = true;
                                $scope.selected_index = 0;
                            }
                            $scope.$apply();
                        }
                        break;

                      case KEYS.UP:
                        if ($scope.show_autocomplete) {
                            e.preventDefault();
                            set_selection($scope.selected_index - 1 >= 0 ? $scope.selected_index - 1 : $scope.results.length - 1);
                            $scope.$apply();
                        }
                        break;
                    }
                });
            }
            $scope.$on("$destroy", function() {
                that.detach();
                $scope.container.remove();
            });
        } ]
    };
} ]).directive("massAutocompleteItem", function() {
    "use strict";
    return {
        restrict: "A",
        require: [ "^massAutocomplete", "ngModel" ],
        scope: {
            massAutocompleteItem: "&"
        },
        link: function(scope, element, attrs, required) {
            attrs.$set("autocomplete", "off");
            element.bind("focus", function() {
                var options = scope.massAutocompleteItem();
                if (!options) throw "Invalid options";
                required[0].attach(required[1], element, options);
            });
        }
    };
});

(function(module) {
    "use strict";
    module("PubSub", []).factory("PubSub", [ "$timeout", function($timeout) {
        function alias(fn) {
            return function closure() {
                return this[fn].apply(this, arguments);
            };
        }
        var PubSub = {
            topics: {},
            subUid: -1
        };
        PubSub.subscribe = function(topic, callback, once) {
            var token = this.subUid += 1, obj = {};
            if (!this.topics[topic]) {
                this.topics[topic] = [];
            }
            obj.token = token;
            obj.callback = callback;
            obj.once = !!once;
            this.topics[topic].push(obj);
            return token;
        };
        PubSub.subscribeOnce = function(topic, callback) {
            return this.subscribe(topic, callback, true);
        };
        PubSub.publish = function(topic, args) {
            var that = this, subscribers, len;
            if (!this.topics[topic]) {
                return false;
            }
            $timeout(function() {
                subscribers = that.topics[topic];
                len = subscribers ? subscribers.length : 0;
                while (len) {
                    len -= 1;
                    subscribers[len].callback(topic, args);
                    if (subscribers[len].once === true) {
                        that.unsubscribe(subscribers[len].token);
                    }
                }
            }, 0);
            return true;
        };
        PubSub.unsubscribe = function(t) {
            var prop, len, tf = false;
            for (prop in this.topics) {
                if (this.topics.hasOwnProperty(prop)) {
                    if (this.topics[prop]) {
                        len = this.topics[prop].length;
                        while (len) {
                            len -= 1;
                            if (this.topics[prop][len].token === t) {
                                this.topics[prop].splice(len, 1);
                                return t;
                            }
                            if (prop === t) {
                                this.topics[prop].splice(len, 1);
                                tf = true;
                            }
                        }
                        if (tf === true) {
                            return t;
                        }
                    }
                }
            }
            return false;
        };
        PubSub.on = alias("subscribe");
        PubSub.once = alias("subscribeOnce");
        PubSub.trigger = alias("publish");
        PubSub.off = alias("unsubscribe");
        return PubSub;
    } ]);
})(angular.module);

angular.module("ui.bootstrap.modal", [ "ui.bootstrap.stackedMap", "ui.bootstrap.position" ]).factory("$$multiMap", function() {
    return {
        createNew: function() {
            var map = {};
            return {
                entries: function() {
                    return Object.keys(map).map(function(key) {
                        return {
                            key: key,
                            value: map[key]
                        };
                    });
                },
                get: function(key) {
                    return map[key];
                },
                hasKey: function(key) {
                    return !!map[key];
                },
                keys: function() {
                    return Object.keys(map);
                },
                put: function(key, value) {
                    if (!map[key]) {
                        map[key] = [];
                    }
                    map[key].push(value);
                },
                remove: function(key, value) {
                    var values = map[key];
                    if (!values) {
                        return;
                    }
                    var idx = values.indexOf(value);
                    if (idx !== -1) {
                        values.splice(idx, 1);
                    }
                    if (!values.length) {
                        delete map[key];
                    }
                }
            };
        }
    };
}).provider("$uibResolve", function() {
    var resolve = this;
    this.resolver = null;
    this.setResolver = function(resolver) {
        this.resolver = resolver;
    };
    this.$get = [ "$injector", "$q", function($injector, $q) {
        var resolver = resolve.resolver ? $injector.get(resolve.resolver) : null;
        return {
            resolve: function(invocables, locals, parent, self) {
                if (resolver) {
                    return resolver.resolve(invocables, locals, parent, self);
                }
                var promises = [];
                angular.forEach(invocables, function(value) {
                    if (angular.isFunction(value) || angular.isArray(value)) {
                        promises.push($q.resolve($injector.invoke(value)));
                    } else if (angular.isString(value)) {
                        promises.push($q.resolve($injector.get(value)));
                    } else {
                        promises.push($q.resolve(value));
                    }
                });
                return $q.all(promises).then(function(resolves) {
                    var resolveObj = {};
                    var resolveIter = 0;
                    angular.forEach(invocables, function(value, key) {
                        resolveObj[key] = resolves[resolveIter++];
                    });
                    return resolveObj;
                });
            }
        };
    } ];
}).directive("uibModalBackdrop", [ "$animate", "$injector", "$uibModalStack", function($animate, $injector, $modalStack) {
    return {
        replace: true,
        templateUrl: "uib/template/modal/backdrop.html",
        compile: function(tElement, tAttrs) {
            tElement.addClass(tAttrs.backdropClass);
            return linkFn;
        }
    };
    function linkFn(scope, element, attrs) {
        if (attrs.modalInClass) {
            $animate.addClass(element, attrs.modalInClass);
            scope.$on($modalStack.NOW_CLOSING_EVENT, function(e, setIsAsync) {
                var done = setIsAsync();
                if (scope.modalOptions.animation) {
                    $animate.removeClass(element, attrs.modalInClass).then(done);
                } else {
                    done();
                }
            });
        }
    }
} ]).directive("uibModalWindow", [ "$uibModalStack", "$q", "$animateCss", "$document", function($modalStack, $q, $animateCss, $document) {
    return {
        scope: {
            index: "@"
        },
        replace: true,
        transclude: true,
        templateUrl: function(tElement, tAttrs) {
            return tAttrs.templateUrl || "uib/template/modal/window.html";
        },
        link: function(scope, element, attrs) {
            element.addClass(attrs.windowClass || "");
            element.addClass(attrs.windowTopClass || "");
            scope.size = attrs.size;
            scope.close = function(evt) {
                var modal = $modalStack.getTop();
                if (modal && modal.value.backdrop && modal.value.backdrop !== "static" && evt.target === evt.currentTarget) {
                    evt.preventDefault();
                    evt.stopPropagation();
                    $modalStack.dismiss(modal.key, "backdrop click");
                }
            };
            element.on("click", scope.close);
            scope.$isRendered = true;
            var modalRenderDeferObj = $q.defer();
            attrs.$observe("modalRender", function(value) {
                if (value === "true") {
                    modalRenderDeferObj.resolve();
                }
            });
            modalRenderDeferObj.promise.then(function() {
                var animationPromise = null;
                if (attrs.modalInClass) {
                    animationPromise = $animateCss(element, {
                        addClass: attrs.modalInClass
                    }).start();
                    scope.$on($modalStack.NOW_CLOSING_EVENT, function(e, setIsAsync) {
                        var done = setIsAsync();
                        $animateCss(element, {
                            removeClass: attrs.modalInClass
                        }).start().then(done);
                    });
                }
                $q.when(animationPromise).then(function() {
                    var modal = $modalStack.getTop();
                    if (modal) {
                        $modalStack.modalRendered(modal.key);
                    }
                    if (!($document[0].activeElement && element[0].contains($document[0].activeElement))) {
                        var inputWithAutofocus = element[0].querySelector("[autofocus]");
                        if (inputWithAutofocus) {
                            inputWithAutofocus.focus();
                        } else {
                            element[0].focus();
                        }
                    }
                });
            });
        }
    };
} ]).directive("uibModalAnimationClass", function() {
    return {
        compile: function(tElement, tAttrs) {
            if (tAttrs.modalAnimation) {
                tElement.addClass(tAttrs.uibModalAnimationClass);
            }
        }
    };
}).directive("uibModalTransclude", function() {
    return {
        link: function(scope, element, attrs, controller, transclude) {
            transclude(scope.$parent, function(clone) {
                element.empty();
                element.append(clone);
            });
        }
    };
}).factory("$uibModalStack", [ "$animate", "$animateCss", "$document", "$compile", "$rootScope", "$q", "$$multiMap", "$$stackedMap", "$uibPosition", function($animate, $animateCss, $document, $compile, $rootScope, $q, $$multiMap, $$stackedMap, $uibPosition) {
    var OPENED_MODAL_CLASS = "modal-open";
    var backdropDomEl, backdropScope;
    var openedWindows = $$stackedMap.createNew();
    var openedClasses = $$multiMap.createNew();
    var $modalStack = {
        NOW_CLOSING_EVENT: "modal.stack.now-closing"
    };
    var topModalIndex = 0;
    var previousTopOpenedModal = null;
    var tabableSelector = "a[href], area[href], input:not([disabled]), " + "button:not([disabled]),select:not([disabled]), textarea:not([disabled]), " + "iframe, object, embed, *[tabindex], *[contenteditable=true]";
    var scrollbarPadding;
    function isVisible(element) {
        return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
    }
    function backdropIndex() {
        var topBackdropIndex = -1;
        var opened = openedWindows.keys();
        for (var i = 0; i < opened.length; i++) {
            if (openedWindows.get(opened[i]).value.backdrop) {
                topBackdropIndex = i;
            }
        }
        if (topBackdropIndex > -1 && topBackdropIndex < topModalIndex) {
            topBackdropIndex = topModalIndex;
        }
        return topBackdropIndex;
    }
    $rootScope.$watch(backdropIndex, function(newBackdropIndex) {
        if (backdropScope) {
            backdropScope.index = newBackdropIndex;
        }
    });
    function removeModalWindow(modalInstance, elementToReceiveFocus) {
        var modalWindow = openedWindows.get(modalInstance).value;
        var appendToElement = modalWindow.appendTo;
        openedWindows.remove(modalInstance);
        previousTopOpenedModal = openedWindows.top();
        if (previousTopOpenedModal) {
            topModalIndex = parseInt(previousTopOpenedModal.value.modalDomEl.attr("index"), 10);
        }
        removeAfterAnimate(modalWindow.modalDomEl, modalWindow.modalScope, function() {
            var modalBodyClass = modalWindow.openedClass || OPENED_MODAL_CLASS;
            openedClasses.remove(modalBodyClass, modalInstance);
            var areAnyOpen = openedClasses.hasKey(modalBodyClass);
            appendToElement.toggleClass(modalBodyClass, areAnyOpen);
            if (!areAnyOpen && scrollbarPadding && scrollbarPadding.heightOverflow && scrollbarPadding.scrollbarWidth) {
                if (scrollbarPadding.originalRight) {
                    appendToElement.css({
                        paddingRight: scrollbarPadding.originalRight + "px"
                    });
                } else {
                    appendToElement.css({
                        paddingRight: ""
                    });
                }
                scrollbarPadding = null;
            }
            toggleTopWindowClass(true);
        }, modalWindow.closedDeferred);
        checkRemoveBackdrop();
        if (elementToReceiveFocus && elementToReceiveFocus.focus) {
            elementToReceiveFocus.focus();
        } else if (appendToElement.focus) {
            appendToElement.focus();
        }
    }
    function toggleTopWindowClass(toggleSwitch) {
        var modalWindow;
        if (openedWindows.length() > 0) {
            modalWindow = openedWindows.top().value;
            modalWindow.modalDomEl.toggleClass(modalWindow.windowTopClass || "", toggleSwitch);
        }
    }
    function checkRemoveBackdrop() {
        if (backdropDomEl && backdropIndex() === -1) {
            var backdropScopeRef = backdropScope;
            removeAfterAnimate(backdropDomEl, backdropScope, function() {
                backdropScopeRef = null;
            });
            backdropDomEl = undefined;
            backdropScope = undefined;
        }
    }
    function removeAfterAnimate(domEl, scope, done, closedDeferred) {
        var asyncDeferred;
        var asyncPromise = null;
        var setIsAsync = function() {
            if (!asyncDeferred) {
                asyncDeferred = $q.defer();
                asyncPromise = asyncDeferred.promise;
            }
            return function asyncDone() {
                asyncDeferred.resolve();
            };
        };
        scope.$broadcast($modalStack.NOW_CLOSING_EVENT, setIsAsync);
        return $q.when(asyncPromise).then(afterAnimating);
        function afterAnimating() {
            if (afterAnimating.done) {
                return;
            }
            afterAnimating.done = true;
            $animate.leave(domEl).then(function() {
                domEl.remove();
                if (closedDeferred) {
                    closedDeferred.resolve();
                }
            });
            scope.$destroy();
            if (done) {
                done();
            }
        }
    }
    $document.on("keydown", keydownListener);
    $rootScope.$on("$destroy", function() {
        $document.off("keydown", keydownListener);
    });
    function keydownListener(evt) {
        if (evt.isDefaultPrevented()) {
            return evt;
        }
        var modal = openedWindows.top();
        if (modal) {
            switch (evt.which) {
              case 27:
                {
                    if (modal.value.keyboard) {
                        evt.preventDefault();
                        $rootScope.$apply(function() {
                            $modalStack.dismiss(modal.key, "escape key press");
                        });
                    }
                    break;
                }

              case 9:
                {
                    var list = $modalStack.loadFocusElementList(modal);
                    var focusChanged = false;
                    if (evt.shiftKey) {
                        if ($modalStack.isFocusInFirstItem(evt, list) || $modalStack.isModalFocused(evt, modal)) {
                            focusChanged = $modalStack.focusLastFocusableElement(list);
                        }
                    } else {
                        if ($modalStack.isFocusInLastItem(evt, list)) {
                            focusChanged = $modalStack.focusFirstFocusableElement(list);
                        }
                    }
                    if (focusChanged) {
                        evt.preventDefault();
                        evt.stopPropagation();
                    }
                    break;
                }
            }
        }
    }
    $modalStack.open = function(modalInstance, modal) {
        var modalOpener = $document[0].activeElement, modalBodyClass = modal.openedClass || OPENED_MODAL_CLASS;
        toggleTopWindowClass(false);
        previousTopOpenedModal = openedWindows.top();
        openedWindows.add(modalInstance, {
            deferred: modal.deferred,
            renderDeferred: modal.renderDeferred,
            closedDeferred: modal.closedDeferred,
            modalScope: modal.scope,
            backdrop: modal.backdrop,
            keyboard: modal.keyboard,
            openedClass: modal.openedClass,
            windowTopClass: modal.windowTopClass,
            animation: modal.animation,
            appendTo: modal.appendTo
        });
        openedClasses.put(modalBodyClass, modalInstance);
        var appendToElement = modal.appendTo, currBackdropIndex = backdropIndex();
        if (!appendToElement.length) {
            throw new Error("appendTo element not found. Make sure that the element passed is in DOM.");
        }
        if (currBackdropIndex >= 0 && !backdropDomEl) {
            backdropScope = $rootScope.$new(true);
            backdropScope.modalOptions = modal;
            backdropScope.index = currBackdropIndex;
            backdropDomEl = angular.element('<div uib-modal-backdrop="modal-backdrop"></div>');
            backdropDomEl.attr("backdrop-class", modal.backdropClass);
            if (modal.animation) {
                backdropDomEl.attr("modal-animation", "true");
            }
            $compile(backdropDomEl)(backdropScope);
            $animate.enter(backdropDomEl, appendToElement);
            scrollbarPadding = $uibPosition.scrollbarPadding(appendToElement);
            if (scrollbarPadding.heightOverflow && scrollbarPadding.scrollbarWidth) {
                appendToElement.css({
                    paddingRight: scrollbarPadding.right + "px"
                });
            }
        }
        topModalIndex = previousTopOpenedModal ? parseInt(previousTopOpenedModal.value.modalDomEl.attr("index"), 10) + 1 : 0;
        var angularDomEl = angular.element('<div uib-modal-window="modal-window"></div>');
        angularDomEl.attr({
            "template-url": modal.windowTemplateUrl,
            "window-class": modal.windowClass,
            "window-top-class": modal.windowTopClass,
            size: modal.size,
            index: topModalIndex,
            animate: "animate"
        }).html(modal.content);
        if (modal.animation) {
            angularDomEl.attr("modal-animation", "true");
        }
        appendToElement.addClass(modalBodyClass);
        $animate.enter($compile(angularDomEl)(modal.scope), appendToElement);
        openedWindows.top().value.modalDomEl = angularDomEl;
        openedWindows.top().value.modalOpener = modalOpener;
    };
    function broadcastClosing(modalWindow, resultOrReason, closing) {
        return !modalWindow.value.modalScope.$broadcast("modal.closing", resultOrReason, closing).defaultPrevented;
    }
    $modalStack.close = function(modalInstance, result) {
        var modalWindow = openedWindows.get(modalInstance);
        if (modalWindow && broadcastClosing(modalWindow, result, true)) {
            modalWindow.value.modalScope.$$uibDestructionScheduled = true;
            modalWindow.value.deferred.resolve(result);
            removeModalWindow(modalInstance, modalWindow.value.modalOpener);
            return true;
        }
        return !modalWindow;
    };
    $modalStack.dismiss = function(modalInstance, reason) {
        var modalWindow = openedWindows.get(modalInstance);
        if (modalWindow && broadcastClosing(modalWindow, reason, false)) {
            modalWindow.value.modalScope.$$uibDestructionScheduled = true;
            modalWindow.value.deferred.reject(reason);
            removeModalWindow(modalInstance, modalWindow.value.modalOpener);
            return true;
        }
        return !modalWindow;
    };
    $modalStack.dismissAll = function(reason) {
        var topModal = this.getTop();
        while (topModal && this.dismiss(topModal.key, reason)) {
            topModal = this.getTop();
        }
    };
    $modalStack.getTop = function() {
        return openedWindows.top();
    };
    $modalStack.modalRendered = function(modalInstance) {
        var modalWindow = openedWindows.get(modalInstance);
        if (modalWindow) {
            modalWindow.value.renderDeferred.resolve();
        }
    };
    $modalStack.focusFirstFocusableElement = function(list) {
        if (list.length > 0) {
            list[0].focus();
            return true;
        }
        return false;
    };
    $modalStack.focusLastFocusableElement = function(list) {
        if (list.length > 0) {
            list[list.length - 1].focus();
            return true;
        }
        return false;
    };
    $modalStack.isModalFocused = function(evt, modalWindow) {
        if (evt && modalWindow) {
            var modalDomEl = modalWindow.value.modalDomEl;
            if (modalDomEl && modalDomEl.length) {
                return (evt.target || evt.srcElement) === modalDomEl[0];
            }
        }
        return false;
    };
    $modalStack.isFocusInFirstItem = function(evt, list) {
        if (list.length > 0) {
            return (evt.target || evt.srcElement) === list[0];
        }
        return false;
    };
    $modalStack.isFocusInLastItem = function(evt, list) {
        if (list.length > 0) {
            return (evt.target || evt.srcElement) === list[list.length - 1];
        }
        return false;
    };
    $modalStack.loadFocusElementList = function(modalWindow) {
        if (modalWindow) {
            var modalDomE1 = modalWindow.value.modalDomEl;
            if (modalDomE1 && modalDomE1.length) {
                var elements = modalDomE1[0].querySelectorAll(tabableSelector);
                return elements ? Array.prototype.filter.call(elements, function(element) {
                    return isVisible(element);
                }) : elements;
            }
        }
    };
    return $modalStack;
} ]).provider("$uibModal", function() {
    var $modalProvider = {
        options: {
            animation: true,
            backdrop: true,
            keyboard: true
        },
        $get: [ "$rootScope", "$q", "$document", "$templateRequest", "$controller", "$uibResolve", "$uibModalStack", function($rootScope, $q, $document, $templateRequest, $controller, $uibResolve, $modalStack) {
            var $modal = {};
            function getTemplatePromise(options) {
                return options.template ? $q.when(options.template) : $templateRequest(angular.isFunction(options.templateUrl) ? options.templateUrl() : options.templateUrl);
            }
            var promiseChain = null;
            $modal.getPromiseChain = function() {
                return promiseChain;
            };
            $modal.open = function(modalOptions) {
                var modalResultDeferred = $q.defer();
                var modalOpenedDeferred = $q.defer();
                var modalClosedDeferred = $q.defer();
                var modalRenderDeferred = $q.defer();
                var modalInstance = {
                    result: modalResultDeferred.promise,
                    opened: modalOpenedDeferred.promise,
                    closed: modalClosedDeferred.promise,
                    rendered: modalRenderDeferred.promise,
                    close: function(result) {
                        return $modalStack.close(modalInstance, result);
                    },
                    dismiss: function(reason) {
                        return $modalStack.dismiss(modalInstance, reason);
                    }
                };
                modalOptions = angular.extend({}, $modalProvider.options, modalOptions);
                modalOptions.resolve = modalOptions.resolve || {};
                modalOptions.appendTo = modalOptions.appendTo || $document.find("body").eq(0);
                if (!modalOptions.template && !modalOptions.templateUrl) {
                    throw new Error("One of template or templateUrl options is required.");
                }
                var templateAndResolvePromise = $q.all([ getTemplatePromise(modalOptions), $uibResolve.resolve(modalOptions.resolve, {}, null, null) ]);
                function resolveWithTemplate() {
                    return templateAndResolvePromise;
                }
                var samePromise;
                samePromise = promiseChain = $q.all([ promiseChain ]).then(resolveWithTemplate, resolveWithTemplate).then(function resolveSuccess(tplAndVars) {
                    var providedScope = modalOptions.scope || $rootScope;
                    var modalScope = providedScope.$new();
                    modalScope.$close = modalInstance.close;
                    modalScope.$dismiss = modalInstance.dismiss;
                    modalScope.$on("$destroy", function() {
                        if (!modalScope.$$uibDestructionScheduled) {
                            modalScope.$dismiss("$uibUnscheduledDestruction");
                        }
                    });
                    var ctrlInstance, ctrlInstantiate, ctrlLocals = {};
                    if (modalOptions.controller) {
                        ctrlLocals.$scope = modalScope;
                        ctrlLocals.$scope.$resolve = {};
                        ctrlLocals.$uibModalInstance = modalInstance;
                        angular.forEach(tplAndVars[1], function(value, key) {
                            ctrlLocals[key] = value;
                            ctrlLocals.$scope.$resolve[key] = value;
                        });
                        ctrlInstantiate = $controller(modalOptions.controller, ctrlLocals, true, modalOptions.controllerAs);
                        if (modalOptions.controllerAs && modalOptions.bindToController) {
                            ctrlInstance = ctrlInstantiate.instance;
                            ctrlInstance.$close = modalScope.$close;
                            ctrlInstance.$dismiss = modalScope.$dismiss;
                            angular.extend(ctrlInstance, {
                                $resolve: ctrlLocals.$scope.$resolve
                            }, providedScope);
                        }
                        ctrlInstance = ctrlInstantiate();
                        if (angular.isFunction(ctrlInstance.$onInit)) {
                            ctrlInstance.$onInit();
                        }
                    }
                    $modalStack.open(modalInstance, {
                        scope: modalScope,
                        deferred: modalResultDeferred,
                        renderDeferred: modalRenderDeferred,
                        closedDeferred: modalClosedDeferred,
                        content: tplAndVars[0],
                        animation: modalOptions.animation,
                        backdrop: modalOptions.backdrop,
                        keyboard: modalOptions.keyboard,
                        backdropClass: modalOptions.backdropClass,
                        windowTopClass: modalOptions.windowTopClass,
                        windowClass: modalOptions.windowClass,
                        windowTemplateUrl: modalOptions.windowTemplateUrl,
                        size: modalOptions.size,
                        openedClass: modalOptions.openedClass,
                        appendTo: modalOptions.appendTo
                    });
                    modalOpenedDeferred.resolve(true);
                }, function resolveError(reason) {
                    modalOpenedDeferred.reject(reason);
                    modalResultDeferred.reject(reason);
                })["finally"](function() {
                    if (promiseChain === samePromise) {
                        promiseChain = null;
                    }
                });
                return modalInstance;
            };
            return $modal;
        } ]
    };
    return $modalProvider;
});

angular.module("ui.bootstrap.stackedMap", []).factory("$$stackedMap", function() {
    return {
        createNew: function() {
            var stack = [];
            return {
                add: function(key, value) {
                    stack.push({
                        key: key,
                        value: value
                    });
                },
                get: function(key) {
                    for (var i = 0; i < stack.length; i++) {
                        if (key === stack[i].key) {
                            return stack[i];
                        }
                    }
                },
                keys: function() {
                    var keys = [];
                    for (var i = 0; i < stack.length; i++) {
                        keys.push(stack[i].key);
                    }
                    return keys;
                },
                top: function() {
                    return stack[stack.length - 1];
                },
                remove: function(key) {
                    var idx = -1;
                    for (var i = 0; i < stack.length; i++) {
                        if (key === stack[i].key) {
                            idx = i;
                            break;
                        }
                    }
                    return stack.splice(idx, 1)[0];
                },
                removeTop: function() {
                    return stack.pop();
                },
                length: function() {
                    return stack.length;
                }
            };
        }
    };
});

angular.module("ui.bootstrap.position", []).factory("$uibPosition", [ "$document", "$window", function($document, $window) {
    var SCROLLBAR_WIDTH;
    var BODY_SCROLLBAR_WIDTH;
    var OVERFLOW_REGEX = {
        normal: /(auto|scroll)/,
        hidden: /(auto|scroll|hidden)/
    };
    var PLACEMENT_REGEX = {
        auto: /\s?auto?\s?/i,
        primary: /^(top|bottom|left|right)$/,
        secondary: /^(top|bottom|left|right|center)$/,
        vertical: /^(top|bottom)$/
    };
    var BODY_REGEX = /(HTML|BODY)/;
    return {
        getRawNode: function(elem) {
            return elem.nodeName ? elem : elem[0] || elem;
        },
        parseStyle: function(value) {
            value = parseFloat(value);
            return isFinite(value) ? value : 0;
        },
        offsetParent: function(elem) {
            elem = this.getRawNode(elem);
            var offsetParent = elem.offsetParent || $document[0].documentElement;
            function isStaticPositioned(el) {
                return ($window.getComputedStyle(el).position || "static") === "static";
            }
            while (offsetParent && offsetParent !== $document[0].documentElement && isStaticPositioned(offsetParent)) {
                offsetParent = offsetParent.offsetParent;
            }
            return offsetParent || $document[0].documentElement;
        },
        scrollbarWidth: function(isBody) {
            if (isBody) {
                if (angular.isUndefined(BODY_SCROLLBAR_WIDTH)) {
                    var bodyElem = $document.find("body");
                    bodyElem.addClass("uib-position-body-scrollbar-measure");
                    BODY_SCROLLBAR_WIDTH = $window.innerWidth - bodyElem[0].clientWidth;
                    BODY_SCROLLBAR_WIDTH = isFinite(BODY_SCROLLBAR_WIDTH) ? BODY_SCROLLBAR_WIDTH : 0;
                    bodyElem.removeClass("uib-position-body-scrollbar-measure");
                }
                return BODY_SCROLLBAR_WIDTH;
            }
            if (angular.isUndefined(SCROLLBAR_WIDTH)) {
                var scrollElem = angular.element('<div class="uib-position-scrollbar-measure"></div>');
                $document.find("body").append(scrollElem);
                SCROLLBAR_WIDTH = scrollElem[0].offsetWidth - scrollElem[0].clientWidth;
                SCROLLBAR_WIDTH = isFinite(SCROLLBAR_WIDTH) ? SCROLLBAR_WIDTH : 0;
                scrollElem.remove();
            }
            return SCROLLBAR_WIDTH;
        },
        scrollbarPadding: function(elem) {
            elem = this.getRawNode(elem);
            var elemStyle = $window.getComputedStyle(elem);
            var paddingRight = this.parseStyle(elemStyle.paddingRight);
            var paddingBottom = this.parseStyle(elemStyle.paddingBottom);
            var scrollParent = this.scrollParent(elem, false, true);
            var scrollbarWidth = this.scrollbarWidth(scrollParent, BODY_REGEX.test(scrollParent.tagName));
            return {
                scrollbarWidth: scrollbarWidth,
                widthOverflow: scrollParent.scrollWidth > scrollParent.clientWidth,
                right: paddingRight + scrollbarWidth,
                originalRight: paddingRight,
                heightOverflow: scrollParent.scrollHeight > scrollParent.clientHeight,
                bottom: paddingBottom + scrollbarWidth,
                originalBottom: paddingBottom
            };
        },
        isScrollable: function(elem, includeHidden) {
            elem = this.getRawNode(elem);
            var overflowRegex = includeHidden ? OVERFLOW_REGEX.hidden : OVERFLOW_REGEX.normal;
            var elemStyle = $window.getComputedStyle(elem);
            return overflowRegex.test(elemStyle.overflow + elemStyle.overflowY + elemStyle.overflowX);
        },
        scrollParent: function(elem, includeHidden, includeSelf) {
            elem = this.getRawNode(elem);
            var overflowRegex = includeHidden ? OVERFLOW_REGEX.hidden : OVERFLOW_REGEX.normal;
            var documentEl = $document[0].documentElement;
            var elemStyle = $window.getComputedStyle(elem);
            if (includeSelf && overflowRegex.test(elemStyle.overflow + elemStyle.overflowY + elemStyle.overflowX)) {
                return elem;
            }
            var excludeStatic = elemStyle.position === "absolute";
            var scrollParent = elem.parentElement || documentEl;
            if (scrollParent === documentEl || elemStyle.position === "fixed") {
                return documentEl;
            }
            while (scrollParent.parentElement && scrollParent !== documentEl) {
                var spStyle = $window.getComputedStyle(scrollParent);
                if (excludeStatic && spStyle.position !== "static") {
                    excludeStatic = false;
                }
                if (!excludeStatic && overflowRegex.test(spStyle.overflow + spStyle.overflowY + spStyle.overflowX)) {
                    break;
                }
                scrollParent = scrollParent.parentElement;
            }
            return scrollParent;
        },
        position: function(elem, includeMagins) {
            elem = this.getRawNode(elem);
            var elemOffset = this.offset(elem);
            if (includeMagins) {
                var elemStyle = $window.getComputedStyle(elem);
                elemOffset.top -= this.parseStyle(elemStyle.marginTop);
                elemOffset.left -= this.parseStyle(elemStyle.marginLeft);
            }
            var parent = this.offsetParent(elem);
            var parentOffset = {
                top: 0,
                left: 0
            };
            if (parent !== $document[0].documentElement) {
                parentOffset = this.offset(parent);
                parentOffset.top += parent.clientTop - parent.scrollTop;
                parentOffset.left += parent.clientLeft - parent.scrollLeft;
            }
            return {
                width: Math.round(angular.isNumber(elemOffset.width) ? elemOffset.width : elem.offsetWidth),
                height: Math.round(angular.isNumber(elemOffset.height) ? elemOffset.height : elem.offsetHeight),
                top: Math.round(elemOffset.top - parentOffset.top),
                left: Math.round(elemOffset.left - parentOffset.left)
            };
        },
        offset: function(elem) {
            elem = this.getRawNode(elem);
            var elemBCR = elem.getBoundingClientRect();
            return {
                width: Math.round(angular.isNumber(elemBCR.width) ? elemBCR.width : elem.offsetWidth),
                height: Math.round(angular.isNumber(elemBCR.height) ? elemBCR.height : elem.offsetHeight),
                top: Math.round(elemBCR.top + ($window.pageYOffset || $document[0].documentElement.scrollTop)),
                left: Math.round(elemBCR.left + ($window.pageXOffset || $document[0].documentElement.scrollLeft))
            };
        },
        viewportOffset: function(elem, useDocument, includePadding) {
            elem = this.getRawNode(elem);
            includePadding = includePadding !== false ? true : false;
            var elemBCR = elem.getBoundingClientRect();
            var offsetBCR = {
                top: 0,
                left: 0,
                bottom: 0,
                right: 0
            };
            var offsetParent = useDocument ? $document[0].documentElement : this.scrollParent(elem);
            var offsetParentBCR = offsetParent.getBoundingClientRect();
            offsetBCR.top = offsetParentBCR.top + offsetParent.clientTop;
            offsetBCR.left = offsetParentBCR.left + offsetParent.clientLeft;
            if (offsetParent === $document[0].documentElement) {
                offsetBCR.top += $window.pageYOffset;
                offsetBCR.left += $window.pageXOffset;
            }
            offsetBCR.bottom = offsetBCR.top + offsetParent.clientHeight;
            offsetBCR.right = offsetBCR.left + offsetParent.clientWidth;
            if (includePadding) {
                var offsetParentStyle = $window.getComputedStyle(offsetParent);
                offsetBCR.top += this.parseStyle(offsetParentStyle.paddingTop);
                offsetBCR.bottom -= this.parseStyle(offsetParentStyle.paddingBottom);
                offsetBCR.left += this.parseStyle(offsetParentStyle.paddingLeft);
                offsetBCR.right -= this.parseStyle(offsetParentStyle.paddingRight);
            }
            return {
                top: Math.round(elemBCR.top - offsetBCR.top),
                bottom: Math.round(offsetBCR.bottom - elemBCR.bottom),
                left: Math.round(elemBCR.left - offsetBCR.left),
                right: Math.round(offsetBCR.right - elemBCR.right)
            };
        },
        parsePlacement: function(placement) {
            var autoPlace = PLACEMENT_REGEX.auto.test(placement);
            if (autoPlace) {
                placement = placement.replace(PLACEMENT_REGEX.auto, "");
            }
            placement = placement.split("-");
            placement[0] = placement[0] || "top";
            if (!PLACEMENT_REGEX.primary.test(placement[0])) {
                placement[0] = "top";
            }
            placement[1] = placement[1] || "center";
            if (!PLACEMENT_REGEX.secondary.test(placement[1])) {
                placement[1] = "center";
            }
            if (autoPlace) {
                placement[2] = true;
            } else {
                placement[2] = false;
            }
            return placement;
        },
        positionElements: function(hostElem, targetElem, placement, appendToBody) {
            hostElem = this.getRawNode(hostElem);
            targetElem = this.getRawNode(targetElem);
            var targetWidth = angular.isDefined(targetElem.offsetWidth) ? targetElem.offsetWidth : targetElem.prop("offsetWidth");
            var targetHeight = angular.isDefined(targetElem.offsetHeight) ? targetElem.offsetHeight : targetElem.prop("offsetHeight");
            placement = this.parsePlacement(placement);
            var hostElemPos = appendToBody ? this.offset(hostElem) : this.position(hostElem);
            var targetElemPos = {
                top: 0,
                left: 0,
                placement: ""
            };
            if (placement[2]) {
                var viewportOffset = this.viewportOffset(hostElem, appendToBody);
                var targetElemStyle = $window.getComputedStyle(targetElem);
                var adjustedSize = {
                    width: targetWidth + Math.round(Math.abs(this.parseStyle(targetElemStyle.marginLeft) + this.parseStyle(targetElemStyle.marginRight))),
                    height: targetHeight + Math.round(Math.abs(this.parseStyle(targetElemStyle.marginTop) + this.parseStyle(targetElemStyle.marginBottom)))
                };
                placement[0] = placement[0] === "top" && adjustedSize.height > viewportOffset.top && adjustedSize.height <= viewportOffset.bottom ? "bottom" : placement[0] === "bottom" && adjustedSize.height > viewportOffset.bottom && adjustedSize.height <= viewportOffset.top ? "top" : placement[0] === "left" && adjustedSize.width > viewportOffset.left && adjustedSize.width <= viewportOffset.right ? "right" : placement[0] === "right" && adjustedSize.width > viewportOffset.right && adjustedSize.width <= viewportOffset.left ? "left" : placement[0];
                placement[1] = placement[1] === "top" && adjustedSize.height - hostElemPos.height > viewportOffset.bottom && adjustedSize.height - hostElemPos.height <= viewportOffset.top ? "bottom" : placement[1] === "bottom" && adjustedSize.height - hostElemPos.height > viewportOffset.top && adjustedSize.height - hostElemPos.height <= viewportOffset.bottom ? "top" : placement[1] === "left" && adjustedSize.width - hostElemPos.width > viewportOffset.right && adjustedSize.width - hostElemPos.width <= viewportOffset.left ? "right" : placement[1] === "right" && adjustedSize.width - hostElemPos.width > viewportOffset.left && adjustedSize.width - hostElemPos.width <= viewportOffset.right ? "left" : placement[1];
                if (placement[1] === "center") {
                    if (PLACEMENT_REGEX.vertical.test(placement[0])) {
                        var xOverflow = hostElemPos.width / 2 - targetWidth / 2;
                        if (viewportOffset.left + xOverflow < 0 && adjustedSize.width - hostElemPos.width <= viewportOffset.right) {
                            placement[1] = "left";
                        } else if (viewportOffset.right + xOverflow < 0 && adjustedSize.width - hostElemPos.width <= viewportOffset.left) {
                            placement[1] = "right";
                        }
                    } else {
                        var yOverflow = hostElemPos.height / 2 - adjustedSize.height / 2;
                        if (viewportOffset.top + yOverflow < 0 && adjustedSize.height - hostElemPos.height <= viewportOffset.bottom) {
                            placement[1] = "top";
                        } else if (viewportOffset.bottom + yOverflow < 0 && adjustedSize.height - hostElemPos.height <= viewportOffset.top) {
                            placement[1] = "bottom";
                        }
                    }
                }
            }
            switch (placement[0]) {
              case "top":
                targetElemPos.top = hostElemPos.top - targetHeight;
                break;

              case "bottom":
                targetElemPos.top = hostElemPos.top + hostElemPos.height;
                break;

              case "left":
                targetElemPos.left = hostElemPos.left - targetWidth;
                break;

              case "right":
                targetElemPos.left = hostElemPos.left + hostElemPos.width;
                break;
            }
            switch (placement[1]) {
              case "top":
                targetElemPos.top = hostElemPos.top;
                break;

              case "bottom":
                targetElemPos.top = hostElemPos.top + hostElemPos.height - targetHeight;
                break;

              case "left":
                targetElemPos.left = hostElemPos.left;
                break;

              case "right":
                targetElemPos.left = hostElemPos.left + hostElemPos.width - targetWidth;
                break;

              case "center":
                if (PLACEMENT_REGEX.vertical.test(placement[0])) {
                    targetElemPos.left = hostElemPos.left + hostElemPos.width / 2 - targetWidth / 2;
                } else {
                    targetElemPos.top = hostElemPos.top + hostElemPos.height / 2 - targetHeight / 2;
                }
                break;
            }
            targetElemPos.top = Math.round(targetElemPos.top);
            targetElemPos.left = Math.round(targetElemPos.left);
            targetElemPos.placement = placement[1] === "center" ? placement[0] : placement[0] + "-" + placement[1];
            return targetElemPos;
        },
        positionArrow: function(elem, placement) {
            elem = this.getRawNode(elem);
            var innerElem = elem.querySelector(".tooltip-inner, .popover-inner");
            if (!innerElem) {
                return;
            }
            var isTooltip = angular.element(innerElem).hasClass("tooltip-inner");
            var arrowElem = isTooltip ? elem.querySelector(".tooltip-arrow") : elem.querySelector(".arrow");
            if (!arrowElem) {
                return;
            }
            var arrowCss = {
                top: "",
                bottom: "",
                left: "",
                right: ""
            };
            placement = this.parsePlacement(placement);
            if (placement[1] === "center") {
                angular.element(arrowElem).css(arrowCss);
                return;
            }
            var borderProp = "border-" + placement[0] + "-width";
            var borderWidth = $window.getComputedStyle(arrowElem)[borderProp];
            var borderRadiusProp = "border-";
            if (PLACEMENT_REGEX.vertical.test(placement[0])) {
                borderRadiusProp += placement[0] + "-" + placement[1];
            } else {
                borderRadiusProp += placement[1] + "-" + placement[0];
            }
            borderRadiusProp += "-radius";
            var borderRadius = $window.getComputedStyle(isTooltip ? innerElem : elem)[borderRadiusProp];
            switch (placement[0]) {
              case "top":
                arrowCss.bottom = isTooltip ? "0" : "-" + borderWidth;
                break;

              case "bottom":
                arrowCss.top = isTooltip ? "0" : "-" + borderWidth;
                break;

              case "left":
                arrowCss.right = isTooltip ? "0" : "-" + borderWidth;
                break;

              case "right":
                arrowCss.left = isTooltip ? "0" : "-" + borderWidth;
                break;
            }
            arrowCss[placement[1]] = borderRadius;
            angular.element(arrowElem).css(arrowCss);
        }
    };
} ]);

(function(angular) {
    angular.module("app", [ "ngAnimate", "ngRoute", "ngResource", "satellizer", "angularMoment", "monospaced.elastic", "PubSub", "MassAutoComplete", "ngFileUpload", "ui.bootstrap.modal" ]);
})(angular);

(function(module) {
    "use strict";
    module.directive("agentPicker", directive);
    function directive() {
        return {
            template: '<select ng-class="vm.cssClass" ng-attr-tabindex="{{ vm.tabIndex }}" ng-model="vm.agent" ng-options="agent.name for agent in vm.agents" ng-change="vm.on_change_handler()" tabindex="2"></select>',
            restrict: "E",
            controller: Controller,
            controllerAs: "vm",
            bindToController: {
                agent: "=",
                cssClass: "@",
                tabIndex: "@",
                onChange: "&?"
            },
            scope: true
        };
    }
    Controller.$inject = [ "agentsService" ];
    function Controller(agentsService) {
        var vm = this;
        vm.on_change_handler = on_change_handler;
        init();
        function init() {
            fetch_agents();
        }
        function fetch_agents() {
            agentsService.all().then(function(result) {
                vm.agents = result.data.data;
            });
        }
        function on_change_handler() {
            if (this.onChange) {
                this.onChange({
                    agent: vm.agent
                });
            }
        }
    }
})(angular.module("app"));

(function(module) {
    "use strict";
    module.factory("agentsService", service);
    service.$inject = [ "$http" ];
    function service($http) {
        return {
            all: function() {
                return $http.get("/api/agents");
            },
            search: function(name) {
                return $http.get("/api/agents?name=" + name);
            },
            find: function(id) {
                return $http.get("/api/agents/" + id);
            }
        };
    }
})(angular.module("app"));

(function(module) {
    module.config(Config);
    module.run(Run);
    Config.$inject = [ "$locationProvider", "$resourceProvider", "$authProvider" ];
    function Config($locationProvider, $resourceProvider, $authProvider) {
        $locationProvider.html5Mode(true);
        $resourceProvider.defaults.stripTrailingSlashes = false;
        $authProvider.loginUrl = "/api/authenticate";
        $authProvider.httpInterceptor = function() {
            return true;
        };
    }
    Run.$inject = [ "$document", "$location", "$rootScope", "$auth" ];
    function Run($document, $location, $rootScope, $auth) {
        $rootScope.$on("$locationChangeStart", function() {
            var logged_in = $auth.isAuthenticated(), is_logging_in = $location.path() === "/login", is_public_path = /(\/login|\/logout)/.test($location.path());
            if (!logged_in && !is_public_path) {
                $location.path("/login");
            }
            if (logged_in && is_logging_in) {
                $location.path("/");
            }
        });
        $rootScope.$on("$stateChangeSuccess", function() {
            $document[0].body.scrollTop = $document[0].documentElement.scrollTop = 0;
        });
    }
})(angular.module("app"));

(function(module) {
    module.config(Config);
    Config.$inject = [ "$routeProvider", "$locationProvider" ];
    function Config($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);
        $routeProvider.when("/", {
            template: "<timeline></timeline>"
        }).when("/login", {
            template: "<app-login></app-login>"
        }).when("/projects/:id", {
            template: "<project-detail></project-detail>"
        }).otherwise("/");
    }
})(angular.module("app"));

(function(module) {
    "use strict";
    module.directive("focusOn", directive);
    directive.$inject = [ "$timeout" ];
    function directive($timeout) {
        return {
            restrict: "A",
            link: function($scope, $element, $attr) {
                $scope.$watch($attr.focusOn, function(_focusVal) {
                    console.log("_focusVal", _focusVal);
                    $timeout(function() {
                        _focusVal ? $element[0].focus() : $element[0].blur();
                    });
                });
            }
        };
    }
})(angular.module("app"));

(function(module) {
    "use strict";
    module.directive("appLogin", directive);
    function directive() {
        return {
            templateUrl: "/build/js/app/login.html?v=2",
            restrict: "E",
            controller: Controller,
            controllerAs: "vm",
            bindToController: true,
            scope: {}
        };
    }
    Controller.$inject = [ "$rootScope", "$auth", "$location" ];
    function Controller($rootScope, $auth, $location) {
        var vm = this;
        vm.login = login;
        init();
        function init() {}
        function login() {
            var credentials = {
                email: $rootScope.user_email,
                password: vm.password
            };
            $auth.login(credentials).then(function(data) {
                $location.path("/");
            }).catch(function() {});
        }
    }
})(angular.module("app"));

(function(module) {
    "use strict";
    module.directive("appNav", directive);
    function directive() {
        return {
            templateUrl: "/build/js/app/nav.html?v=2",
            restrict: "E",
            controller: Controller,
            controllerAs: "vm",
            bindToController: true,
            scope: {
                onShowNewProject: "&"
            }
        };
    }
    Controller.$inject = [ "$auth", "$location", "$q", "$sce", "usersService", "projectsService" ];
    function Controller($auth, $location, $q, $sce, usersService, projectsService) {
        var vm = this, cache;
        vm.logout = logout;
        vm.show_new_project = show_new_project;
        vm.search_value = "";
        vm.autocomplete_options = {
            on_error: console.log,
            debounce_suggest: 300,
            on_detach: clear_cache,
            suggest: suggest,
            on_select: search_go
        };
        clear_cache();
        function clear_cache() {
            cache = {
                projects: {},
                users: {}
            };
        }
        function search_go(item) {
            vm.search_value = undefined;
            $location.url("/" + item.obj.type + "/" + item.obj.id);
        }
        function logout() {
            $auth.logout();
            $location.path("/login");
        }
        function show_new_project() {
            vm.onShowNewProject();
        }
        function suggest(term) {
            var term_lower = term.toLowerCase(), first_letter = term_lower[0], project_matches, user_matches, deferred_projects, deferred_users;
            if (term.length < 3) {
                return [];
            }
            if (first_letter in cache.users) {
                user_matches = cache.users[first_letter];
            } else {
                deferred_users = $q.defer();
                usersService.search(first_letter).then(function(result) {
                    cache.users[first_letter] = result;
                    deferred_users.resolve(result);
                }, function(err) {
                    deferred_users.reject(err);
                });
                user_matches = deferred_users.promise;
            }
            if (first_letter in cache.projects) {
                project_matches = cache.projects[first_letter];
            } else {
                deferred_projects = $q.defer();
                projectsService.search({
                    name: first_letter
                }).then(function(result) {
                    cache.projects[first_letter] = result;
                    deferred_projects.resolve(result);
                }, function(err) {
                    deferred_projects.reject(err);
                });
                project_matches = deferred_projects.promise;
            }
            function starts_with(name, query_str) {
                return name.toLowerCase().indexOf(query_str) === 0;
            }
            function highlight(str, term) {
                var highlight_regex = new RegExp("\\b(" + term + ")", "gi");
                return str.replace(highlight_regex, '<span class="AutoSuggest-highlight">$1</span>');
            }
            return $q.all([ project_matches, user_matches ]).then(function success(result, status, headers, config) {
                var projects = result[0].data.data, users = result[1].data.data;
                var results = [], i;
                for (i = 0; i < users.length; i++) {
                    users[i].type = "users";
                    if (starts_with(users[i].first_name, term_lower) || starts_with(users[i].last_name, term_lower) || starts_with(users[i].name, term_lower)) {
                        results.push({
                            obj: users[i],
                            value: users[i].name,
                            label: $sce.trustAsHtml('<div class="AutoSuggest-item">' + '<div class="AutoSuggest-image">' + '<img class="AutoSuggest-avatar" src="' + users[i].avatar_url + '">' + "</div>" + '<div class="AutoSuggest-content">' + '<span class="AutoSuggest-name">' + highlight(users[i].first_name, term) + " " + highlight(users[i].last_name, term) + "</span>" + '<span class="AutoSuggest-meta">' + users[i].email + "</span>" + "</div>" + "</div>")
                        });
                    }
                }
                for (i = 0; i < projects.length; i++) {
                    projects[i].type = "projects";
                    var re = new RegExp("\\b(" + term_lower + ").*", "i");
                    if (re.test(projects[i].name)) {
                        results.push({
                            obj: projects[i],
                            value: projects[i].name,
                            label: $sce.trustAsHtml('<div class="AutoSuggest-item">' + '<div class="AutoSuggest-content">' + '<span class="AutoSuggest-name">' + highlight(projects[i].name, term) + "</span>" + '<span class="AutoSuggest-meta">' + projects[i].requester.abbreviation + "</span>" + "</div>" + "</div>")
                        });
                    }
                }
                return results;
            }, function error() {
                return data;
            });
        }
    }
})(angular.module("app"));

(function(module) {
    "use strict";
    var allowed_elements = [ "INPUT", "TEXTAREA", "SELECT" ];
    module.directive("onCmdEnter", Directive);
    Directive.$inject = [ "$document", "$timeout" ];
    function Directive($document, $timeout) {
        return {
            restrict: "A",
            link: function(scope, element, attrs) {
                function bind_keys(event) {
                    if (allowed_elements.indexOf(event.target.tagName) >= 0) {
                        if (event.which === 13 && event.metaKey) {
                            $timeout(function() {
                                scope.$apply(function() {
                                    scope.$eval(attrs.onCmdEnter);
                                });
                            }, 0);
                            event.preventDefault();
                        }
                    }
                }
                $document.on("keydown keypress keyup", bind_keys);
                scope.$on("$destroy", function() {
                    $document.off("keydown keypress keyup", bind_keys);
                });
            }
        };
    }
})(angular.module("app"), angular);

(function(module) {
    "use strict";
    var ignore_elements = [ "INPUT", "TEXTAREA", "SELECT" ];
    module.directive("onEscape", Directive);
    Directive.$inject = [ "$document" ];
    function Directive($document) {
        return {
            restrict: "A",
            link: function(scope, element, attrs) {
                var escaped = false;
                function bind_esc(event) {
                    if (ignore_elements.indexOf(event.target.tagName) < 0) {
                        if (escaped) {
                            return;
                        }
                        escaped = true;
                        if (event.which === 27) {
                            $timeout(function() {
                                scope.$apply(function() {
                                    scope.$eval(attrs.onEscape);
                                });
                            }, 0);
                            event.preventDefault();
                        }
                    }
                }
                $document.on("keydown keypress keyup", bind_esc);
                scope.$on("$destroy", function() {
                    console.log("destroying");
                    $document.off("keydown keypress keyup", bind_esc);
                });
            }
        };
    }
})(angular.module("app"), angular);

(function(module, Pikaday) {
    "use strict";
    module.provider("pikadayConfig", Provider);
    module.directive("pikaday", Directive);
    function Provider() {
        var config = {};
        this.$get = function() {
            return config;
        };
        this.setConfig = function setConfig(configs) {
            config = configs;
        };
    }
    Directive.$inject = [ "pikadayConfig" ];
    function Directive(pikadayConfig) {
        return {
            restrict: "A",
            scope: {
                pikaday: "=",
                onSelect: "&",
                onOpen: "&",
                onClose: "&",
                onDraw: "&",
                disableDayFn: "&"
            },
            link: function(scope, elem, attrs) {
                var config = {
                    field: elem[0],
                    onSelect: function() {
                        setTimeout(function() {
                            scope.$apply();
                        });
                    }
                };
                angular.forEach(pikadayConfig, function(value, key) {
                    config[key] = value;
                });
                angular.forEach(attrs.$attr, function(dashAttr) {
                    var attr = attrs.$normalize(dashAttr);
                    applyConfig(attr, attrs[attr]);
                });
                function applyConfig(attr, value) {
                    switch (attr) {
                      case "setDefaultDate":
                      case "bound":
                      case "reposition":
                      case "disableWeekends":
                      case "showWeekNumber":
                      case "isRTL":
                      case "showMonthAfterYear":
                      case "firstDay":
                      case "yearRange":
                      case "numberOfMonths":
                      case "mainCalendar":
                        config[attr] = scope.$eval(value);
                        break;

                      case "onSelect":
                      case "onOpen":
                      case "onClose":
                      case "onDraw":
                      case "disableDayFn":
                        config[attr] = function(date) {
                            setTimeout(function() {
                                scope.$apply();
                            });
                            console.log("calling on-select", scope[attr]);
                            return scope[attr]({
                                pikaday: this,
                                date: date
                            });
                        };
                        break;

                      case "format":
                      case "position":
                      case "theme":
                      case "yearSuffix":
                        config[attr] = value;
                        break;

                      case "minDate":
                      case "maxDate":
                      case "defaultDate":
                        config[attr] = new Date(value);
                        break;

                      case "trigger":
                      case "container":
                        config[attr] = document.getElementById(value);
                        break;

                      case "i18n":
                        config[attr] = pikadayConfig.locales[value];
                    }
                }
                var picker = new Pikaday(config);
                scope.pikaday = picker;
                scope.$on("$destroy", function() {
                    picker.destroy();
                });
            }
        };
    }
})(angular.module("app"), Pikaday);

(function(module) {
    "use strict";
    module.factory("attachmentsService", service);
    service.$inject = [ "$http" ];
    function service($http) {
        return {
            byComment: function(comment_id) {
                return $http.get("/api/attachments?comment_id=" + comment_id);
            },
            "delete": function(id) {
                return $http.delete("/api/attachments/" + id);
            }
        };
    }
})(angular.module("app"));

(function(module) {
    "use strict";
    module.directive("comment", directive);
    function directive() {
        return {
            templateUrl: "/build/js/comments/comment.html?v=2",
            restrict: "E",
            controller: Controller,
            controllerAs: "vm",
            bindToController: {
                comment: "="
            },
            scope: {}
        };
    }
    Controller.$inject = [ "$sce" ];
    function Controller($sce) {
        var vm = this;
        init();
        function init() {
            vm.comment.html_body = $sce.trustAsHtml(vm.comment.html_body);
        }
    }
})(angular.module("app"));

(function(module) {
    "use strict";
    module.directive("comments", directive);
    function directive() {
        return {
            templateUrl: "/build/js/comments/comments.html?v=2",
            restrict: "E",
            controller: Controller,
            controllerAs: "vm",
            bindToController: {
                project: "="
            },
            scope: true
        };
    }
    Controller.$inject = [ "$scope", "PubSub", "commentsService" ];
    function Controller($scope, PubSub, commentsService) {
        var vm = this;
        function init() {
            show_loading();
            load_comments();
        }
        function show_loading() {
            vm.loading = true;
        }
        function hide_loading() {
            vm.loading = false;
        }
        function comment_adding() {
            show_loading();
        }
        function comment_added() {
            load_comments();
        }
        function load_comments() {
            return commentsService.byProject(vm.project.id).then(function(result) {
                vm.comments = result.data.data;
                hide_loading();
            });
        }
        $scope.$watch("vm.project", function(old_val, new_val) {
            if (new_val) {
                init();
            }
        });
        PubSub.subscribe("comment.creating", comment_adding);
        PubSub.subscribe("comment.updating", comment_adding);
        PubSub.subscribe("comment.deleting", comment_adding);
        PubSub.subscribe("comment.created", comment_added);
        PubSub.subscribe("comment.updated", comment_added);
        PubSub.subscribe("comment.deleted", comment_added);
    }
})(angular.module("app"));

(function(module) {
    "use strict";
    module.factory("commentsService", service);
    service.$inject = [ "$http" ];
    function service($http) {
        return {
            byProject: function(project_id) {
                return $http.get("/api/comments?project_id=" + project_id);
            },
            byEvent: function(event_id) {
                return $http.get("/api/comments?project_id=" + event_id);
            },
            find: function(id) {
                return $http.get("/api/comments/" + id);
            },
            save: function(comment) {
                if (comment.id) {
                    return $http.put("/api/comments/" + comment.id, {
                        data: comment
                    });
                } else {
                    return $http.post("/api/comments", {
                        data: comment
                    });
                }
            }
        };
    }
})(angular.module("app"));

(function(module, angular) {
    "use strict";
    module.directive("newComment", directive);
    function directive() {
        return {
            templateUrl: "/build/js/comments/new-comment.html?v=2",
            restrict: "E",
            controller: Controller,
            controllerAs: "vm",
            bindToController: true,
            scope: {
                event: "=?",
                project: "=?"
            }
        };
    }
    Controller.$inject = [ "$q", "$auth", "PubSub", "Upload", "commentsService", "attachmentsService", "agentsService" ];
    function Controller($q, $auth, PubSub, Upload, commentsService, attachmentsService, agentsService) {
        var vm = this, default_sender, deferred_new_comment;
        vm.comment = {
            user_id: $auth.getPayload().sub
        };
        vm.save = save;
        vm.upload = upload;
        vm.remove_attachment = remove_attachment;
        init();
        function init() {
            get_default_sender();
        }
        function get_default_sender() {
            agentsService.find($auth.getPayload().sub).then(function(result) {
                default_sender = result.data.data;
                reset();
            });
        }
        function reset() {
            delete vm.comment.id;
            deferred_new_comment = null;
            vm.comment.body = "";
            vm.comment.recipients = angular.copy(vm.project.recipients);
            vm.sender = default_sender;
            vm.attachments = null;
        }
        function fetch_attachments() {
            attachmentsService.byComment(vm.comment.id).then(function(result) {
                vm.attachments = result.data.data;
            });
            vm.uploading = false;
        }
        function save_draft() {
            if (!deferred_new_comment) {
                deferred_new_comment = $q.defer();
                save(true).then(function(result) {
                    vm.comment.id = result.data.data.id;
                    deferred_new_comment.resolve(result);
                }, function(err) {
                    deferred_new_comment.reject(err);
                });
            }
            return deferred_new_comment.promise;
        }
        function save(draft) {
            var is_published = draft !== true, comment = angular.extend({}, vm.comment, {
                type: draft === true ? "draft" : "comment",
                user_id: vm.sender.id,
                event_id: vm.event ? vm.event.id : null,
                project_id: vm.project ? vm.project.id : null
            });
            if (is_published && comment.body.length === 0) {
                alert("Surely you have something to say.");
                return;
            }
            if (is_published) {
                reset();
                PubSub.publish("comment.creating", comment);
            }
            return commentsService.save(comment).then(function(result) {
                if (is_published) {
                    PubSub.publish("comment.created", comment);
                }
                return result;
            });
        }
        function upload(files) {
            if (files.length === 0) {
                return;
            }
            vm.uploading = true;
            save_draft().then(function() {
                Upload.upload({
                    url: "/api/attachments",
                    data: {
                        file: files,
                        comment_id: vm.comment.id
                    }
                }).then(function(resp) {
                    fetch_attachments();
                }, function(err) {}, function(evt) {
                    console.log("progress: " + parseInt(100 * evt.loaded / evt.total) + "% file :" + evt.config.data.file.name);
                });
            });
        }
        function remove_attachment(attachment) {
            attachmentsService.delete(attachment.id);
            for (var i = 0; i < vm.attachments.length; i++) {
                if (vm.attachments[i].id === attachment.id) {
                    vm.attachments.splice(i, 1);
                }
            }
        }
    }
})(angular.module("app"), angular);

(function(module) {
    "use strict";
    module.directive("eventDetail", directive);
    function directive() {
        return {
            templateUrl: "/build/js/events/event-detail.html?v=2",
            restrict: "E",
            controller: Controller,
            controllerAs: "vm",
            bindToController: true,
            scope: {}
        };
    }
    Controller.$inject = [ "$routeParams", "eventsService" ];
    function Controller($routeParams, eventsService) {
        var vm = this;
        init();
        function init() {
            eventsService.find($routeParams.id).then(function(result) {
                vm.event = result.data.data;
            });
        }
    }
})(angular.module("app"));

(function(module) {
    "use strict";
    module.factory("eventsService", service);
    service.$inject = [ "$http" ];
    function service($http) {
        return {
            all: function() {
                return $http.get("/api/events");
            },
            find: function(id) {
                return $http.get("/api/events/" + id);
            }
        };
    }
})(angular.module("app"));

(function(module) {
    "use strict";
    module.controller("main", Controller);
    Controller.$inject = [ "$rootScope", "$location" ];
    function Controller($rootScope, $location) {
        var vm = this;
        vm.open_new_project = open_new_project;
        vm.close_new_project = close_new_project;
        function open_new_project() {
            vm.is_new_project_open = true;
        }
        function close_new_project() {
            vm.is_new_project_open = false;
        }
        function check_nav_visibility() {
            vm.is_nav_visible = $location.path() !== "/login";
        }
        $rootScope.$on("$routeChangeSuccess", check_nav_visibility);
    }
})(angular.module("app"));

(function(angular, module) {
    module.factory("pike", Factory);
    Factory.$inject = [ "$route", "$routeParams", "$rootScope" ];
    function Factory($route, $routeParams, $rootScope) {
        var splitter = /\./g, oldRouteParams = {}, eventTypePrefix = "route:";
        $rootScope.$on("$routeChangeSuccess", handleRounteChangeEvent);
        return {
            bind: bind,
            lock: lock,
            param: param
        };
        function bind(scope, eventType, handler) {
            if (arguments.length === 2) {
                handler = arguments[1];
                eventType = "";
            }
            scope.$on(eventTypePrefix + eventType, handler);
            if (!$route.current || !$route.current.action || $route.current.action === eventType) {
                return null;
            }
            if ($route.current.action.indexOf(eventType + ".") !== 0) {
                return null;
            }
            var currentParts = $route.current.action.split(splitter);
            var eventParts = eventType.split(splitter);
            return currentParts[eventParts.length];
        }
        function lock(scope, key, callback) {
            if (arguments.length === 2) {
                callback = arguments[1];
                key = null;
            }
            var value = key ? param(key) : null;
            return proxyCallback;
            function proxyCallback() {
                if (!scope.$parent && scope !== $rootScope) {
                    console.warn("Response ignored due to scope destruction.");
                    return callback = null;
                }
                if (key && value !== param(key)) {
                    console.warn("Response ignored due to stale state.");
                    return callback = null;
                }
                return callback.apply(scope, arguments);
            }
        }
        function param(key) {
            return coerceParam($routeParams[key]);
        }
        function coerceParam(value) {
            if (angular.isUndefined(value)) {
                return null;
            }
            var numericValue = value * 1;
            return value == numericValue ? numericValue : value;
        }
        function coerceParams(params) {
            for (var key in params) {
                if (params.hasOwnProperty(key)) {
                    params[key] = coerceParam(params[key]);
                }
            }
            return params;
        }
        function handleRounteChangeEvent(event, newRoute) {
            if (angular.isUndefined(newRoute.action)) {
                return;
            }
            var newRouteParams = coerceParams(angular.copy($routeParams));
            var parts = newRoute.action.split(splitter);
            $rootScope.$broadcast(eventTypePrefix, parts[0] || null, newRouteParams, oldRouteParams);
            for (var i = 0, length = parts.length; i < length; i++) {
                $rootScope.$broadcast(eventTypePrefix + parts.slice(0, i + 1).join("."), parts[i + 1] || null, newRouteParams, oldRouteParams);
            }
            oldRouteParams = newRouteParams;
        }
    }
})(angular, angular.module("app"));

(function(module, angular) {
    "use strict";
    module.directive("projectDetail", directive);
    function directive() {
        return {
            templateUrl: "/build/js/projects/project-detail.html?v=2",
            restrict: "E",
            controller: Controller,
            controllerAs: "vm",
            bindToController: true,
            scope: {}
        };
    }
    Controller.$inject = [ "$scope", "$timeout", "$routeParams", "projectsService", "tasksService", "Upload" ];
    function Controller($scope, $timeout, $routeParams, projectsService, tasksService, Upload) {
        var vm = this, project_notes_timeout = null;
        vm.is_editing = false;
        vm.tasks_loading = false;
        vm.task_saving = false;
        vm.show_new_task = show_new_task;
        vm.open_task = open_task;
        vm.on_task_closed = on_task_closed;
        vm.on_task_updated = on_task_updated;
        vm.mark_task_completed = mark_task_completed;
        vm.on_editor_closed = on_editor_closed;
        vm.open_editor = open_editor;
        vm.incompleteTasksFilter = incompleteTasksFilter;
        vm.completedTasksFilter = completedTasksFilter;
        vm.upload = upload;
        vm.close_project = close_project;
        vm.reopen_project = reopen_project;
        init();
        function init() {
            load_remote_data();
        }
        function load_remote_data() {
            fetchProject();
            fetchTasks();
        }
        function fetchProject() {
            return projectsService.find($routeParams.id).then(function(result) {
                if (vm.project) {
                    angular.extend(vm.project, result.data.data);
                } else {
                    vm.project = result.data.data;
                }
                vm.uploading_thumb = false;
                vm.closing_project = false;
            });
        }
        function fetchTasks() {
            vm.tasks_loading = true;
            return tasksService.byProject($routeParams.id).then(function(result) {
                vm.tasks = result.data.data;
                vm.tasks_loading = false;
            });
        }
        function save_project_notes() {
            var data = {
                id: vm.project.id,
                notes: vm.project.notes
            };
            vm.project_notes_saving = true;
            projectsService.save(data).then(function() {
                vm.project_notes_saving = false;
            });
        }
        function auto_save_project_notes(newVal, oldVal) {
            if (typeof newVal !== "undefined" && typeof oldVal !== "undefined" && newVal != oldVal) {
                if (project_notes_timeout) {
                    $timeout.cancel(project_notes_timeout);
                }
                project_notes_timeout = $timeout(save_project_notes, 1e3);
            }
        }
        function show_new_task() {
            vm.selected_task = {
                project_id: vm.project.id,
                agent: vm.project.agent
            };
        }
        function open_task(task) {
            vm.selected_task = task;
        }
        function on_task_updated() {
            vm.selected_task = null;
            load_remote_data();
        }
        function on_task_closed() {
            vm.selected_task = null;
        }
        function mark_task_completed(task, event) {
            event.stopPropagation();
            update_task(task, {
                completed_at: moment().format("YYYY-MM-DD HH:mm:ss")
            });
        }
        function update_task(task, data) {
            vm.task_saving = true;
            data.id = task.id;
            tasksService.save(data).then(function() {
                vm.task_saving = false;
                angular.extend(task, data);
                fetchProject();
            });
        }
        function open_editor() {
            vm.is_editing = true;
        }
        function on_editor_closed() {
            vm.is_editing = false;
            fetchTasks();
        }
        function incompleteTasksFilter(task) {
            return task.completed_at === null;
        }
        function completedTasksFilter(task) {
            return task.completed_at !== null;
        }
        function upload(files) {
            if (files.length === 0) {
                return;
            }
            vm.uploading_thumb = true;
            Upload.upload({
                url: "/api/projects/" + vm.project.id + "/thumb",
                data: {
                    file: files
                }
            }).then(fetchProject);
        }
        function close_project() {
            if (vm.project.has_thumb || confirm("Are you sure you want to close the project without uploading a mockup?")) {
                vm.closing_project = true;
                projectsService.save({
                    id: vm.project.id,
                    closed_at: moment().format("YYYY-MM-DD HH:mm:ss")
                }).then(fetchProject);
            }
        }
        function reopen_project() {
            vm.closing_project = true;
            projectsService.save({
                id: vm.project.id,
                closed_at: null
            }).then(fetchProject);
        }
        $scope.$watch("vm.project.notes", auto_save_project_notes);
    }
})(angular.module("app"), angular, moment);

(function(module, angular) {
    "use strict";
    module.directive("projectEditor", directive);
    module.controller("ProjectModalController", ProjectModalController);
    function directive() {
        return {
            restrict: "E",
            controller: Controller,
            controllerAs: "vm",
            bindToController: {
                project: "=?",
                onUpdate: "&",
                onClose: "&"
            },
            scope: {}
        };
    }
    Controller.$inject = [ "$uibModal" ];
    function Controller($uibModal) {
        var vm = this, modal_instance;
        init();
        function init() {
            vm.project = vm.project || {};
            vm.project.recipients = vm.project.recipients || [];
            modal_instance = $uibModal.open({
                templateUrl: "/build/js/projects/project-editor.html?v=2",
                controller: ProjectModalController,
                controllerAs: "vm",
                bindToController: true,
                animation: false,
                keyboard: false,
                backdrop: "static",
                backdropClass: "Modal-backdrop",
                windowClass: "Modal",
                resolve: {
                    orig_project: function() {
                        return vm.project;
                    }
                }
            });
            modal_instance.closed.then(function() {
                vm.onClose ? vm.onClose() : null;
            });
        }
    }
    ProjectModalController.$inject = [ "$scope", "$location", "$uibModalInstance", "orig_project", "projectsService" ];
    function ProjectModalController($scope, $location, $uibModalInstance, orig_project, projectsService) {
        var vm = this;
        vm.project = angular.copy(orig_project);
        vm.today = new Date();
        vm.is_saving = false;
        vm.set_due_at = set_due_at;
        vm.save = save;
        vm.close = close;
        vm.on_agent_changed = add_recipient;
        vm.on_requester_changed = add_recipient;
        vm.pikaday_due_at = function(pikaday) {
            pikaday.setMaxDate(new Date());
        };
        function set_due_at(value) {
            console.log("setting due date");
            vm.project.due_at = value ? moment(value).format("YYYY-MM-DD") : null;
        }
        function add_recipient(user) {
            if (!has_recipient(user)) {
                vm.project.recipients.push(user);
            }
        }
        function has_recipient(user) {
            for (var i = 0; i < vm.project.recipients.length; i++) {
                if (vm.project.recipients[i].id == user.id) {
                    return true;
                }
            }
            return false;
        }
        function save(projectForm) {
            vm.is_form_submitted = true;
            if (projectForm.$invalid || !vm.project.due_at || !vm.project.requester || !vm.project.agent) {
                console.log("projectForm.$invalid", projectForm.$invalid);
                return false;
            }
            vm.is_saving = true;
            projectsService.save(vm.project).then(function(result) {
                if (vm.project.id) {
                    projectsService.find(vm.project.id).then(function(result) {
                        angular.extend(orig_project, result.data.data);
                        $uibModalInstance.close();
                    });
                } else {
                    $location.url("/projects/" + result.data.data.id);
                    $uibModalInstance.close();
                }
            });
        }
        function close() {
            $uibModalInstance.dismiss();
        }
    }
})(angular.module("app"), angular);

(function(module) {
    "use strict";
    module.factory("projectsService", service);
    service.$inject = [ "$http" ];
    function service($http) {
        return {
            all: function() {
                return $http.get("/api/projects");
            },
            find: function(id) {
                return $http.get("/api/projects/" + id);
            },
            getActive: function(agent_id) {
                return $http.get("/api/projects?type=active&agent_id=" + agent_id);
            },
            getPending: function(agent_id) {
                return $http.get("/api/projects?type=pending&agent_id=" + agent_id);
            },
            search: function(params) {
                console.log("searching");
                return $http.get("/api/projects", {
                    params: params
                });
            },
            save: function(project) {
                if (project.id) {
                    return $http.put("/api/projects/" + project.id, {
                        data: project
                    });
                } else {
                    return $http.post("/api/projects", {
                        data: project
                    });
                }
            }
        };
    }
})(angular.module("app"));

(function(module) {
    "use strict";
    module.directive("taskAgentPicker", directive);
    function directive() {
        return {
            template: '<select class="CustomSelect-control" ng-model="vm.task.agent_id" ng-options="agent.id as agent.name for agent in vm.agents" ng-change="vm.on_change_handler()" tabindex="2"></select>',
            restrict: "E",
            controller: Controller,
            controllerAs: "vm",
            bindToController: {
                task: "=",
                onChange: "&?"
            },
            scope: true
        };
    }
    Controller.$inject = [ "agentsService" ];
    function Controller(agentsService) {
        var vm = this;
        vm.on_change_handler = on_change_handler;
        init();
        function init() {
            fetch_agents();
        }
        function fetch_agents() {
            agentsService.all().then(function(result) {
                vm.agents = result.data.data;
            });
        }
        function on_change_handler() {
            var agent = get_selected_agent();
            if (this.onChange) {
                this.onChange({
                    agent: agent
                });
            }
        }
        function get_selected_agent() {
            for (var i = 0; i <= vm.agents.length; i++) {
                if (vm.agents[i].id == vm.task.agent_id) {
                    return vm.agents[i];
                }
            }
            return null;
        }
    }
})(angular.module("app"));

(function(module) {
    "use strict";
    module.directive("taskDurationPicker", directive);
    function directive() {
        return {
            template: '<select class="Form-control" ng-model="vm.task.duration" ng-options="duration.value as duration.label for duration in vm.durations" ng-change="vm.on_change_handler()" tabindex="2"></select>',
            restrict: "E",
            controller: Controller,
            controllerAs: "vm",
            bindToController: {
                task: "=",
                onChange: "&?"
            },
            scope: true
        };
    }
    function Controller() {
        var vm = this;
        vm.on_change_handler = on_change_handler;
        vm.durations = [ {
            value: 15,
            label: "15 min"
        }, {
            value: 30,
            label: "30 min"
        }, {
            value: 60,
            label: "1 hr"
        }, {
            value: 90,
            label: "1.5 hrs"
        }, {
            value: 120,
            label: "2 hrs"
        }, {
            value: 180,
            label: "3 hrs"
        }, {
            value: 240,
            label: "4 hrs"
        }, {
            value: 300,
            label: "5 hrs"
        }, {
            value: 360,
            label: "6 hrs"
        }, {
            value: 420,
            label: "7 hrs"
        }, {
            value: 480,
            label: "8 hrs"
        }, {
            value: 600,
            label: "10 hrs"
        }, {
            value: 900,
            label: "15 hrs"
        }, {
            value: 1800,
            label: "30 hrs"
        }, {
            value: 3600,
            label: "60 hrs"
        }, {
            value: 5400,
            label: "90 hrs"
        }, {
            value: 7200,
            label: "120 hrs"
        } ];
        function on_change_handler() {
            if (this.onChange) {
                this.onChange();
            }
        }
    }
})(angular.module("app"));

(function(module, angular) {
    "use strict";
    module.directive("taskEditor", directive);
    function directive() {
        return {
            templateUrl: "/build/js/tasks/task-editor.html?v=2",
            restrict: "E",
            controller: Controller,
            controllerAs: "vm",
            bindToController: true,
            scope: {
                _task: "=task",
                onClose: "&",
                onUpdate: "&?"
            }
        };
    }
    Controller.$inject = [ "tasksService" ];
    function Controller(tasksService) {
        var vm = this;
        vm.loading = false;
        vm.today = new Date();
        vm.close = close;
        vm.toggle_completed = toggle_completed;
        vm.set_due_at = set_due_at;
        vm.set_start_at = set_start_at;
        vm.set_completed_at = set_completed_at;
        vm.save_task = save_task;
        vm.delete_task = delete_task;
        init();
        function close() {
            vm.onClose();
        }
        function init() {
            vm.task = angular.copy(vm._task);
            load_remote_data();
        }
        function load_remote_data() {
            vm.loading = true;
            tasksService.find(vm.task.id).then(function(result) {
                vm.task = angular.extend(vm.task, result.data.data);
                vm.loading = false;
            });
        }
        function toggle_completed() {
            var value = vm.task.completed_at ? null : moment();
            set_completed_at(value);
        }
        function set_completed_at(value) {
            vm.task.completed_at = value ? moment(value).format("YYYY-MM-DD HH:mm:ss") : null;
        }
        function set_due_at(value) {
            vm.task.due_at = value ? moment(value).format("YYYY-MM-DD") : null;
        }
        function set_start_at(value) {
            vm.task.start_at = value ? moment(value).format("YYYY-MM-DD") : null;
        }
        function save_task() {
            tasksService.save(vm.task).then(function() {
                vm.onUpdate();
            });
        }
        function delete_task() {
            if (confirm("Are you sure you want to delete this task?")) {
                tasksService.delete(vm.task).then(function() {
                    vm.onUpdate();
                });
            }
        }
    }
})(angular.module("app"), angular);

(function(module) {
    "use strict";
    module.factory("tasksService", service);
    service.$inject = [ "$http" ];
    function service($http) {
        return {
            find: function(id) {
                return $http.get("/api/tasks/" + id);
            },
            save: function(task) {
                if (task.id) {
                    return $http.put("/api/tasks/" + task.id, {
                        data: task
                    });
                }
                return $http.post("/api/tasks", {
                    data: task
                });
            },
            "delete": function(task) {
                return $http.delete("/api/tasks/" + task.id, {
                    data: task
                });
            },
            byProject: function(project_id) {
                return $http.get("/api/tasks?project_id=" + project_id);
            }
        };
    }
})(angular.module("app"));

(function(module, moment) {
    "use strict";
    module.directive("agentTimeline", directive);
    function directive() {
        return {
            templateUrl: "/build/js/timeline/agent-timeline.html?v=5",
            restrict: "A",
            controller: Controller,
            controllerAs: "vm",
            bindToController: {
                agent: "="
            },
            scope: true
        };
    }
    Controller.$inject = [ "$location", "timelineService", "projectsService" ];
    function Controller($location, timelineService, projectsService) {
        var vm = this;
        vm.jump_to_project = jump_to_project;
        init();
        function init() {
            timelineService.byAgent(vm.agent.id).then(function(result) {
                vm.timeline_days = result.data.data;
            });
            projectsService.getActive(vm.agent.id).then(function(result) {
                vm.projects = result.data.data;
            });
        }
        function jump_to_project(project) {
            $location.url("/projects/" + project.id);
        }
    }
})(angular.module("app"), moment);

(function(module) {
    "use strict";
    module.directive("timeline", directive);
    function directive() {
        return {
            templateUrl: "/build/js/timeline/timeline.html?v=2",
            restrict: "E",
            controller: Controller,
            controllerAs: "vm",
            bindToController: true,
            scope: {}
        };
    }
    Controller.$inject = [ "agentsService" ];
    function Controller(agentsService) {
        var vm = this;
        init();
        function init() {
            agentsService.all().then(function(result) {
                vm.agents = result.data.data;
            });
        }
    }
})(angular.module("app"));

(function(module) {
    "use strict";
    module.factory("timelineService", service);
    service.$inject = [ "$http" ];
    function service($http) {
        return {
            byAgent: function(agent_id) {
                return $http.get("/api/timeline?agent_id=" + agent_id);
            }
        };
    }
})(angular.module("app"));

(function(module) {
    "use strict";
    module.directive("userMultiPicker", directive);
    function directive() {
        return {
            templateUrl: "/build/js/users/user-multi-picker.html?v=2",
            restrict: "E",
            controller: Controller,
            controllerAs: "vm",
            bindToController: {
                selected: "=",
                placeholder: "@",
                tabIndex: "@",
                limitToAgents: "@?",
                onChange: "&?"
            },
            scope: {}
        };
    }
    Controller.$inject = [];
    function Controller() {
        var vm = this;
        vm.onChange = onChange;
        vm.remove_user = remove_user;
        init();
        function init() {
            vm.placeholder = vm.placeholder || "search for a user...";
            vm.tabIndex = vm.tabIndex || 1;
        }
        function add_user(user) {
            if (!has_user(user)) {
                vm.selected.push(user);
            }
        }
        function has_user(user) {
            for (var i = 0; i < vm.selected.length; i++) {
                if (vm.selected[i].id == user.id) {
                    return true;
                }
            }
            return false;
        }
        function remove_user(user) {
            for (var i = vm.selected.length - 1; i >= 0; i--) {
                if (vm.selected[i].id == user.id) {
                    vm.selected.splice(i, 1);
                }
            }
        }
        function onChange(user) {
            add_user(user);
        }
    }
})(angular.module("app"));

(function(module, angular) {
    "use strict";
    module.directive("userPicker", directive);
    function directive() {
        return {
            templateUrl: "/build/js/users/user-picker.html?v=2",
            restrict: "E",
            controller: Controller,
            controllerAs: "vm",
            bindToController: {
                inputClass: "@",
                placeholder: "@",
                tabIndex: "@",
                selected: "=?",
                limitToAgents: "@?",
                onChange: "&?",
                onFocus: "&?",
                onBlur: "&?",
                detached: "@?"
            },
            scope: {}
        };
    }
    Controller.$inject = [ "$scope", "$q", "$sce", "usersService", "agentsService" ];
    function Controller($scope, $q, $sce, usersService, agentsService) {
        var vm = this, cache = {}, searcher = vm.limitToAgents ? agentsService : usersService;
        vm.on_focus = on_focus;
        vm.autocomplete_options = {
            on_error: console.log,
            debounce_suggest: 300,
            on_detach: on_detach,
            suggest: suggest_users,
            on_select: select_user
        };
        init();
        function init() {
            vm.placeholder = vm.placeholder || "search for a user...";
            vm.tabIndex = vm.tabIndex || 1;
            vm.inputClass = vm.inputClass || "Form-control";
        }
        function on_detach() {
            fix_value();
            on_blur();
        }
        function fix_value() {
            vm.input_value = vm.selected && !vm.detached ? vm.selected.name : "";
        }
        function select_user(item) {
            vm.selected = item.obj;
            vm.onChange ? vm.onChange({
                user: item.obj
            }) : null;
            fix_value();
        }
        function suggest_users(term) {
            var term_lower = term.toLowerCase(), first_letter = term_lower[0], matching_users, deferred;
            if (first_letter in cache) {
                matching_users = cache[first_letter];
            } else {
                deferred = $q.defer();
                searcher.search(first_letter).then(function(result) {
                    cache[first_letter] = result;
                    deferred.resolve(result);
                }, function(err) {
                    deferred.reject(err);
                });
                matching_users = deferred.promise;
            }
            function starts_with(name, query_str) {
                return name.toLowerCase().indexOf(query_str) === 0;
            }
            function highlight(str, term) {
                var highlight_regex = new RegExp("^(" + term + ")", "gi");
                return str.replace(highlight_regex, '<span class="AutoSuggest-highlight">$1</span>');
            }
            return $q.when(matching_users).then(function success(result, status, headers, config) {
                var results = [], data = result.data.data;
                for (var i = 0; i < data.length; i++) {
                    if (starts_with(data[i].first_name, term_lower) || starts_with(data[i].last_name, term_lower) || starts_with(data[i].name, term_lower)) {
                        results.push({
                            obj: data[i],
                            value: data[i].name,
                            label: $sce.trustAsHtml('<div class="AutoSuggest-item">' + '<div class="AutoSuggest-image">' + '<img class="AutoSuggest-avatar" src="' + data[i].avatar_url + '">' + "</div>" + '<div class="AutoSuggest-content">' + '<span class="AutoSuggest-name">' + highlight(data[i].first_name, term) + " " + highlight(data[i].last_name, term) + "</span>" + '<span class="AutoSuggest-meta">' + data[i].email + "</span>" + "</div>" + "</div>")
                        });
                    }
                }
                return results;
            }, function error() {
                return data;
            });
        }
        $scope.$watch("vm.selected", function(new_value) {
            if (new_value) {
                fix_value();
            }
        });
        function on_focus() {
            console.log("focussing");
            vm.onFocus ? vm.onFocus() : null;
        }
        function on_blur() {
            vm.onBlur ? vm.onBlur() : null;
        }
    }
})(angular.module("app"), angular);

(function(module) {
    "use strict";
    module.factory("usersService", service);
    service.$inject = [ "$http" ];
    function service($http) {
        return {
            all: function() {
                return $http.get("/api/users");
            },
            search: function(name) {
                return $http.get("/api/users?name=" + name);
            },
            find: function(id) {
                return $http.get("/api/users/" + id);
            }
        };
    }
})(angular.module("app"));